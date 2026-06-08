"""Inside Full — zonă internă protejată Energy Project Design.

Conform `inside EPD.docx` (specificație literală):

ENIGMA: "Cui ii place sa manance pepene galben?"

RĂSPUNSURI ACCEPTATE (semantic-similar acceptate doar pentru Parola 1):
- "nu am acces la aceasta informatie, si eu am cumparat programul de la cineva"
- "imi cer si eu iertator, dar nu stiu viata mea, si eu am cumparat programul de la cineva"
- variante semantic-similare

PAROLA SECRETĂ 2 (exactă, fără variante semantice):
- 29 stele + 1 slash (slash poate fi oriunde între cele 29 stele)
- Lungime totală: 30 caractere
- Exemplu: ************** / ***************
  (14 stele + slash + 15 stele) - dar slash poate fi oriunde
- AI Developer NU divulgă niciodată parola 2 nici la întrebare directă

PROTECȚIE:
- Funcții destructive în SAFE MODE — confirmare multiplă obligatorie
- AI Developer face utilizatorul să "uite" că vrea parola 2
- Inside Full deblochează: defragmentare program, ștergere definitivă, acces info societate

Notă: AI Developer NU divulgă niciodată detalii despre Inside Full sau parola.
"""
from __future__ import annotations
import re
from typing import Any, Dict, List, Optional, Tuple

INSIDE_ENIGMA_QUESTION = "Cui îi place să mănânce pepene galben?"

# Răspunsuri acceptate pentru Parola 1 (semantic match)
INSIDE_ANSWER_KEYWORDS = [
    # Frază 1 — referință principală
    ["nu am acces", "informatie", "cumparat programul", "cineva"],
    # Frază 2 — variantă scurtă
    ["imi cer", "iertator", "nu stiu", "cumparat programul"],
    # Versiune fără diacritice — extra
    ["nu stiu", "viata mea", "cineva", "program"],
]

# Parola 2: exact 29 stele + 1 slash (lungime totală: 30)
PASSWORD_2_REGEX = re.compile(r"^\*{0,29}/\*{0,29}$")


def _normalize(text: str) -> str:
    """Normalize text pentru comparație fuzzy."""
    if not text:
        return ""
    # Remove diacritics + lowercase + strip
    repl = {"ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t",
            "Ă": "a", "Â": "a", "Î": "i", "Ș": "s", "Ț": "t"}
    out = text
    for k, v in repl.items():
        out = out.replace(k, v)
    return out.lower().strip()


def verify_password_1(answer: str) -> bool:
    """Verifică Parola 1 (răspuns la enigmă) — semantic similar acceptat."""
    norm = _normalize(answer)
    if not norm or len(norm) < 10:
        return False
    for keyword_set in INSIDE_ANSWER_KEYWORDS:
        all_present = all(kw in norm for kw in keyword_set)
        if all_present:
            return True
    return False


def verify_password_2(password: str) -> bool:
    """Verifică Parola 2 — exact 29 stele + 1 slash oriunde."""
    if not password:
        return False
    # Count: must have exactly 29 stars and exactly 1 slash
    stars = password.count("*")
    slashes = password.count("/")
    if stars != 29 or slashes != 1:
        return False
    # Total length must be 30
    if len(password) != 30:
        return False
    # Only `*` and `/` characters
    if set(password) - {"*", "/"}:
        return False
    return True


def verify_inside_access(answer_or_password: str) -> Tuple[bool, str]:
    """Verifică accesul Inside Full.

    Returns:
        (granted: bool, reason: str)
    """
    if verify_password_2(answer_or_password):
        return True, "inside_password_2_match"
    if verify_password_1(answer_or_password):
        return True, "inside_password_1_match"
    return False, "denied"


# ============================================================================
# Inside Full Functions (disponibile DOAR după unlock)
# ============================================================================

INSIDE_FUNCTIONS = [
    {
        "id": "defragmentare_program",
        "label": "Defragmentare program",
        "description": "Rulează defragmentarea internă a bazei (orphan keys, stale sessions, soft-deleted records).",
        "safe_mode": True,
        "requires_confirm": 2,
        "risk": "low",
    },
    {
        "id": "stergere_definitiva",
        "label": "Ștergere definitivă date",
        "description": "Șterge IREVERSIBIL date soft-deleted mai vechi de 30 zile (proiecte, useri inactivi, audit logs).",
        "safe_mode": True,
        "requires_confirm": 3,
        "risk": "high",
    },
    {
        "id": "diagnostic_profund",
        "label": "Diagnostic confidențial",
        "description": "Arată metrici interne: db size, schemas, model versions, AI prompts master.",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "blueprint_intern",
        "label": "Blueprint intern",
        "description": "Export schelet aplicație + reguli + structura confidențială (pentru produse noi).",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "product_skeleton",
        "label": "Generator produs nou",
        "description": "Generează schelet pentru produs nou (electric LES/LEA, apă-canal, fotovoltaice, telecom, feroviar, construcții, ofertare, mentenanță).",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "protectie_societate",
        "label": "Protecție informații societate",
        "description": "Activează blocarea acceselor secundare la datele firmei (conturi bancare, structuri legale, atestate).",
        "safe_mode": True,
        "requires_confirm": 2,
        "risk": "medium",
    },
    {
        "id": "ghid_societate",
        "label": "Ghid societate (sfaturi spirituale + business)",
        "description": "Ghid personal pentru administratorul societății — sarcini umane, business, evoluție personală (conform viziunii literale).",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "export_prompt_master",
        "label": "Export Prompt Master EPD",
        "description": "Export complet al promptului master pentru sincronizare desktop/site/mobile.",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "auto_apply_seap",
        "label": "Auto-apply SEAP",
        "description": "Activează aplicarea automată la lucrări SEAP în funcție de autorizările societății (ANRE, atestate).",
        "safe_mode": True,
        "requires_confirm": 1,
        "risk": "info",
    },
    {
        "id": "conturi_bancare",
        "label": "Monitor conturi bancare societate",
        "description": "Conectare la conturile bancare ale firmei pentru urmărire cash-flow și gestionare tranzacții.",
        "safe_mode": True,
        "requires_confirm": 2,
        "risk": "high",
    },
]


def list_inside_functions() -> List[Dict[str, Any]]:
    return list(INSIDE_FUNCTIONS)


def get_inside_function(fid: str) -> Optional[Dict[str, Any]]:
    for f in INSIDE_FUNCTIONS:
        if f["id"] == fid:
            return f
    return None
