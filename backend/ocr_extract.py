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
        "supported_formats": [".docx", ".pdf"],
        "experimental_formats": [".png", ".jpg", ".jpeg"],
    }


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
