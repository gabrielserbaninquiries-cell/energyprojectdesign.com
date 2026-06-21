"""OCR & Field Auto-Extract — V6.4.

Permite import PDF / DOCX / imagine cu detectare automată câmpuri proiect.
Cerință literală user: "Import proiect cu RETENȚIE imagini, ștampile, autorizări
digitale, recunoaște PDF Word, plasează ștampilă ca watermark."

Strategie hibrid:
1. Pentru .docx: extrage text cu python-docx + regex pe câmpuri cunoscute
2. Pentru .pdf: extrage text cu pypdf + regex
3. Pentru imagini: AI vision via Emergent LLM Key (gemini-3-flash) ca fallback

Returnează dict {field_key: value} pe care frontend-ul îl poate aplica direct
peste DEFAULT_DATA.
"""
from __future__ import annotations
import base64
import io
import re
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from auth import get_current_user

router = APIRouter()


# ============================================================================
# Pattern recognition rules (regex over Romanian text)
# ============================================================================
PATTERNS: List[Dict[str, Any]] = [
    # CNP / CUI
    {"key": "beneficiar_cnp_cui", "regex": r"(?:CNP|CUI|CIF)\s*:?\s*([0-9]{2,13})", "group": 1},
    # AC
    {"key": "ac_numar", "regex": r"[Aa]utoriza[țt]ie\s+de\s+[Cc]onstruire\s+nr\.?\s*([0-9/\.-]+)", "group": 1},
    {"key": "ac_data_emitere", "regex": r"AC.*?din\s+([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{2,4})", "group": 1},
    # CU
    {"key": "cu_numar", "regex": r"[Cc]ertificat\s+de\s+[Uu]rbanism\s+nr\.?\s*([0-9/\.-]+)", "group": 1},
    # ATR
    {"key": "atr_numar", "regex": r"ATR\s*nr\.?\s*([0-9/\.-]+)", "group": 1},
    # Cadastru
    {"key": "loc_consum_cadastru", "regex": r"(?:[Nn]r\.?\s*[Cc]adastral|CF)\s*:?\s*([0-9]{4,10})", "group": 1},
    # Lungime conductă (m)
    {"key": "sf_lungime_conducta_m", "regex": r"[Ll]ungime\s+(?:total[ăa]?\s+)?(?:branșament|conduct[ăa])\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*m", "group": 1},
    # DN
    {"key": "sf_diametru_nominal_DN", "regex": r"DN\s*([0-9]+)", "group": 1, "prefix": "DN "},
    # Debit instalat
    {"key": "debit_instalat_mc_h", "regex": r"[Dd]ebit\s+instalat\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*m[³3]/h", "group": 1},
    # Presiune
    {"key": "sf_presiune_max_op_bar", "regex": r"[Pp]resiune\s+(?:max\.?|maxim[ăa])\s*:?\s*([0-9]+(?:[.,][0-9]+)?)\s*bar", "group": 1},
    # Telefon
    {"key": "beneficiar_telefon", "regex": r"[Tt]el\.?\s*:?\s*(\+?[0-9 ]{8,15})", "group": 1},
    # Email
    {"key": "beneficiar_email", "regex": r"[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}", "group": 0},
    # Beneficiar (heuristic: line ce începe cu "Beneficiar:")
    {"key": "beneficiar_nume", "regex": r"[Bb]eneficiar\s*:?\s*([A-ZĂÂÎȘȚ][A-Za-zĂÂÎȘȚăâîșț\s\.&\-]{3,80})", "group": 1},
]


def _apply_patterns(text: str) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for pat in PATTERNS:
        m = re.search(pat["regex"], text)
        if m:
            val = m.group(pat["group"])
            if "prefix" in pat:
                val = pat["prefix"] + val
            out[pat["key"]] = val.strip()
    return out


# ============================================================================
# Extractors per file type
# ============================================================================
def _extract_doc_legacy(blob: bytes) -> str:
    """Extract text from legacy .doc (Word 97-2003 binary format) via antiword.

    V9.3 — cerință user: "nu se pot incarca fisiere doc word, ci doar docx".
    Folosim antiword (instalat la /usr/bin/antiword) sau fallback la decode best-effort.
    """
    import subprocess
    import tempfile
    try:
        with tempfile.NamedTemporaryFile(suffix=".doc", delete=False) as tmp:
            tmp.write(blob)
            tmp_path = tmp.name
        result = subprocess.run(
            ["antiword", tmp_path],
            capture_output=True, timeout=30, check=False,
        )
        text = (result.stdout or b"").decode("utf-8", errors="ignore")
        return text
    except FileNotFoundError:
        # antiword not installed — best-effort UTF-8 strip
        return blob.decode("latin-1", errors="ignore")
    except Exception:
        return ""


def _extract_docx(blob: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(blob))
        parts = []
        for p in doc.paragraphs:
            parts.append(p.text)
        for tbl in doc.tables:
            for row in tbl.rows:
                for cell in row.cells:
                    parts.append(cell.text)
        return "\n".join(parts)
    except Exception:
        return ""


def _extract_pdf(blob: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(blob))
        parts: List[str] = []
        for page in reader.pages:
            try:
                parts.append(page.extract_text() or "")
            except Exception:
                continue
        return "\n".join(parts)
    except Exception:
        return ""


# ============================================================================
# Routes
# ============================================================================
class ExtractResult(BaseModel):
    detected_fields: Dict[str, Any]
    confidence: str  # high | medium | low
    text_preview: str
    field_count: int


@router.post("/extract-fields", response_model=ExtractResult)
async def extract_fields(file: UploadFile = File(...), user=Depends(get_current_user)):
    blob = await file.read()
    if not blob:
        return ExtractResult(detected_fields={}, confidence="low", text_preview="", field_count=0)

    fname_low = (file.filename or "").lower()
    text = ""
    if fname_low.endswith(".docx"):
        text = _extract_docx(blob)
    elif fname_low.endswith(".doc"):
        # V9.3 — suport pentru .doc legacy (Word 97-2003) via antiword
        text = _extract_doc_legacy(blob)
    elif fname_low.endswith(".pdf"):
        text = _extract_pdf(blob)
    else:
        # imagine / format necunoscut → text vid (în viitor: chemăm gemini-3-flash)
        text = ""

    fields = _apply_patterns(text) if text else {}
    confidence = "high" if len(fields) >= 5 else "medium" if len(fields) >= 2 else "low"

    return ExtractResult(
        detected_fields=fields,
        confidence=confidence,
        text_preview=text[:1000],
        field_count=len(fields),
    )


@router.get("/known-patterns")
async def known_patterns():
    """Listează tipurile de câmpuri pe care le poate extrage OCR-ul."""
    return {
        "patterns": [{"key": p["key"], "description": p["regex"][:80]} for p in PATTERNS],
        "supported_formats": [".docx", ".pdf", ".doc"],
        "experimental_formats": [".png", ".jpg", ".jpeg"],
    }


# ============================================================================
# V9.3 — Template Placeholder Detector
# Cerință user: "Mi-ar placea ca platforma sa poata introduce automat in documente
# placeholdere necesare. Sa recunoasca campuri de introdus si sa afiseze casete
# text in platforma pentru introducerea datelor sau variabilelor reale necesare
# inlocuirii acelor placeholdere/campuri."
# ============================================================================
class TemplatePlaceholdersResult(BaseModel):
    placeholders: List[Dict[str, Any]]   # [{ key, label, sample_context, suggested_field, type }]
    structure: Dict[str, Any]            # { sections, total_chars, candidate_count }
    text_preview: str


# Heuristici pentru detectarea câmpurilor în template — fraze sau variabile
# evidente care variază de la proiect la proiect.
TEMPLATE_HINTS: List[Dict[str, Any]] = [
    # Pattern: cuvinte CAPITALIZATE explicit înlocuibile
    {"regex": r"<([^>]{2,40})>",                       "label": "Tag explicit <{}>",          "type": "tag"},
    {"regex": r"\{\{?\s*([A-Za-zĂÂÎȘȚăâîșț_][A-Za-zĂÂÎȘȚăâîșț_0-9\s]{1,30})\s*\}?\}", "label": "Tag {{var}}",       "type": "tag"},
    {"regex": r"_{3,}",                                 "label": "Underscore (loc gol)",       "type": "blank"},
    {"regex": r"\.{4,}",                                "label": "Linie cu puncte (loc gol)",  "type": "blank"},
    # Pattern: paranteze cu cuvinte explicative
    {"regex": r"\(([Aa]ici[^)]{2,40})\)",               "label": "Indicație ({})",             "type": "hint"},
    {"regex": r"\(([Cc]ompleta[țt]i[^)]{0,40})\)",      "label": "(Completați...)",            "type": "hint"},
    {"regex": r"\(([Dd]e\s+[Cc]ompletat)\)",            "label": "(De completat)",             "type": "hint"},
    {"regex": r"\(([Vv]ariabil[ăa])\)",                 "label": "(Variabilă)",                "type": "hint"},
    # Pattern: cifre/date specifice care probabil variază
    {"regex": r"(?:[Nn]r\.?|[Nn]umar)\s*([0-9]+(?:[/.][0-9]+)+)",   "label": "Număr document {}", "type": "number"},
    {"regex": r"\bDn\s*([0-9]{2,4})\b",                  "label": "Diametru Dn{}",              "type": "spec"},
    {"regex": r"([0-9]+(?:[.,][0-9]+)?)\s*[Nn]mc/h",     "label": "Debit {} Nmc/h",             "type": "spec"},
    {"regex": r"([0-9]+(?:[.,][0-9]+)?)\s*bar\b",       "label": "Presiune {} bar",            "type": "spec"},
    {"regex": r"([0-9]+(?:[.,][0-9]+)?)\s*m(?:bar|et?ri?)?\b", "label": "Mărime {} m/mbar",     "type": "spec"},
]


def _detect_template_placeholders(text: str, limit: int = 60) -> List[Dict[str, Any]]:
    """Identifică toate locurile care par a fi placeholder-uri în template-ul DOC."""
    out: List[Dict[str, Any]] = []
    seen = set()
    for hint in TEMPLATE_HINTS:
        for m in re.finditer(hint["regex"], text):
            full = m.group(0)
            inner = m.group(1) if m.groups() else full
            label_tpl = hint["label"]
            label = label_tpl.format(inner) if "{}" in label_tpl else label_tpl
            ctx_start = max(0, m.start() - 80)
            ctx_end = min(len(text), m.end() + 80)
            context = text[ctx_start:ctx_end].replace("\n", " ").strip()
            sig = (hint["type"], inner.strip()[:30])
            if sig in seen:
                continue
            seen.add(sig)
            # Sugestie de mapping către FIELDS_REGISTRY (best effort)
            suggested = None
            inner_low = inner.lower() if isinstance(inner, str) else ""
            if "denumire" in inner_low or "lucrare" in inner_low: suggested = "proiect_titlu"
            elif "strada" in inner_low or "strad" in inner_low:   suggested = "loc_consum_strada"
            elif "nr" in inner_low and len(inner_low) < 6:        suggested = "loc_consum_numar"
            elif "beneficiar" in inner_low:                       suggested = "beneficiar_nume"
            elif "cnp" in inner_low or "cui" in inner_low:        suggested = "beneficiar_cnp_cui"
            elif "diametru" in inner_low or "dn" in inner_low:    suggested = "br_diametru_dn"
            elif "lungime" in inner_low:                          suggested = "br_lungime_m"
            elif "debit" in inner_low:                            suggested = "debit_instalat_mc_h"
            elif "presiune" in inner_low:                         suggested = "presiune_max_op_bar"
            out.append({
                "match": full[:60],
                "inner": inner if isinstance(inner, str) else str(inner),
                "label": label[:80],
                "type": hint["type"],
                "context": context[:200],
                "suggested_field": suggested,
                "position": m.start(),
            })
            if len(out) >= limit:
                return out
    return out


@router.post("/template-placeholders", response_model=TemplatePlaceholdersResult)
async def detect_template_placeholders(file: UploadFile = File(...), user=Depends(get_current_user)):
    """V9.3 — Detectează automat placeholder-urile/câmpurile variabile dintr-un template DOC/DOCX/PDF.

    User-ul upload-ează un model de document (de ex. MEMORIU AVIZARE) și platforma
    întoarce o listă cu câmpurile detectate ca fiind variabile (placeholdere, tag-uri,
    spații goale etc.) pe care apoi le poate completa direct din interfață.
    """
    blob = await file.read()
    if not blob:
        return TemplatePlaceholdersResult(placeholders=[], structure={}, text_preview="")

    fname = (file.filename or "").lower()
    if fname.endswith(".docx"):
        text = _extract_docx(blob)
    elif fname.endswith(".doc"):
        text = _extract_doc_legacy(blob)
    elif fname.endswith(".pdf"):
        text = _extract_pdf(blob)
    else:
        text = blob.decode("utf-8", errors="ignore")

    placeholders = _detect_template_placeholders(text, limit=60)
    # Detectează secțiuni (titluri în capitale)
    sections = re.findall(r"\n([A-ZĂÂÎȘȚ\s]{6,80})\n", text)
    structure = {
        "total_chars": len(text),
        "sections_detected": [s.strip() for s in sections[:20]],
        "candidate_count": len(placeholders),
        "supported_formats": [".docx", ".doc", ".pdf"],
    }
    return TemplatePlaceholdersResult(
        placeholders=placeholders,
        structure=structure,
        text_preview=text[:1500],
    )


# ============================================================================
# Apply extracted fields direct to a project (auto-fill)
# ============================================================================
class ApplyExtractRequest(BaseModel):
    pid: str
    fields: Dict[str, Any]
    overwrite: bool = False  # dacă True suprascrie valori existente


@router.post("/apply-to-project")
async def apply_extract_to_project(payload: ApplyExtractRequest, user=Depends(get_current_user)):
    """Aplică câmpurile detectate prin OCR direct peste un gas_project (write-once propagation)."""
    from db import db
    proj = await db.gas_projects.find_one(
        {"pid": payload.pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0},
    )
    if not proj:
        from fastapi import HTTPException
        raise HTTPException(404, "Proiect inexistent")
    existing = proj.get("data") or {}
    applied = {}
    skipped = {}
    for k, v in (payload.fields or {}).items():
        if not payload.overwrite and existing.get(k):
            skipped[k] = existing[k]
            continue
        existing[k] = v
        applied[k] = v
    await db.gas_projects.update_one(
        {"pid": payload.pid, "owner_id": user.user_id},
        {"$set": {"data": existing}},
    )
    return {
        "pid": payload.pid,
        "applied_count": len(applied),
        "skipped_count": len(skipped),
        "applied": applied,
        "skipped": skipped,
    }
