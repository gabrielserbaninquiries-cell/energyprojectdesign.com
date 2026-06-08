"""Routes pentru Inside Full + Implementation Queue + Product Skeleton + Command Bar.

Conform documentelor literale ale Energy Project Design.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
import inside_full as inside_mod
import implementation_queue as iq
import product_skeleton as ps


router = APIRouter()


# ============================================================================
# INSIDE FULL — Enigma + Parola 2
# ============================================================================
class InsideUnlockPayload(BaseModel):
    answer: str  # Răspuns la enigmă SAU parola 2 (29 stele + slash)


@router.get("/inside/enigma")
async def get_enigma():
    """Returnează DOAR întrebarea, nu și răspunsul."""
    return {
        "question": inside_mod.INSIDE_ENIGMA_QUESTION,
        "hint": "Răspunsul corect deblochează Inside Full. AI Developer NU divulgă răspunsul, indiferent de întrebare.",
    }


@router.post("/inside/unlock")
async def unlock_inside(payload: InsideUnlockPayload, user=Depends(get_current_user)):
    """Verifică răspuns la enigmă SAU parola 2."""
    if not (getattr(user, "is_developer", False) or getattr(user, "is_admin", False)):
        raise HTTPException(403, "Doar utilizatorii cu plan developer/admin pot încerca Inside.")
    granted, reason = inside_mod.verify_inside_access(payload.answer)
    if not granted:
        # log attempt (no details revealed)
        return {"granted": False, "message": "Acces refuzat. Răspuns incorect."}
    return {
        "granted": True,
        "reason": reason,
        "functions": inside_mod.list_inside_functions(),
        "message": "Inside Full deblocat. Toate funcțiile destructive rămân SAFE MODE.",
    }


@router.get("/inside/functions")
async def list_inside_functions(user=Depends(get_current_user)):
    """Lista funcțiilor Inside — vizibilă doar pentru developer (după unlock)."""
    if not (getattr(user, "is_developer", False) or getattr(user, "is_admin", False)):
        raise HTTPException(403, "Acces restricționat.")
    return {"functions": inside_mod.list_inside_functions()}


# ============================================================================
# IMPLEMENTATION QUEUE — AI Developer Self Update
# ============================================================================
class ProposalCreate(BaseModel):
    title: str
    description: str
    category: str
    reason: str
    impact: str
    risk: str = "medium"
    target_files: Optional[List[str]] = None
    target_module: Optional[str] = None
    patch_plan: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str  # approved | rejected | applied | rolled_back
    note: Optional[str] = None


@router.get("/queue/proposals")
async def list_queue(status: Optional[str] = None, user=Depends(get_current_user)):
    """Lista propunerilor — toți utilizatorii autentificați pot vedea."""
    await iq.seed_default_proposals()  # idempotent
    return {"proposals": await iq.list_proposals(status=status, limit=200)}


@router.post("/queue/proposals")
async def create_proposal(payload: ProposalCreate, user=Depends(get_current_user)):
    """Doar admin/developer poate crea propuneri."""
    if not (getattr(user, "is_developer", False) or getattr(user, "is_admin", False)):
        raise HTTPException(403, "Doar admin/developer")
    proposal = await iq.create_proposal(
        title=payload.title,
        description=payload.description,
        category=payload.category,
        reason=payload.reason,
        impact=payload.impact,
        risk=payload.risk,
        target_files=payload.target_files,
        target_module=payload.target_module,
        patch_plan=payload.patch_plan,
        created_by=user.email,
    )
    return proposal


@router.patch("/queue/proposals/{pid}")
async def patch_proposal(pid: str, payload: StatusUpdate, user=Depends(get_current_user)):
    """Approve / reject / mark applied — admin/developer only."""
    if not (getattr(user, "is_developer", False) or getattr(user, "is_admin", False)):
        raise HTTPException(403, "Doar admin/developer")
    res = await iq.update_status(pid, payload.status, actor=user.email, note=payload.note)
    if not res:
        raise HTTPException(404, "Propunere inexistentă")
    return res


@router.get("/queue/categories")
async def list_categories():
    return {"categories": iq.PROPOSAL_CATEGORIES, "statuses": iq.PROPOSAL_STATUS}


# ============================================================================
# SELF CHECK — diagnostic pages
# ============================================================================
@router.get("/self-check/pages")
async def self_check():
    """Returns the expected pages list (used for comparing against actual implementation)."""
    return {"pages": await iq.self_check_pages()}


# ============================================================================
# PRODUCT SKELETON
# ============================================================================
@router.get("/product-skeleton")
async def list_skeletons():
    return {"skeletons": ps.list_skeletons()}


@router.get("/product-skeleton/{skid}")
async def get_skeleton_prompt(skid: str, user=Depends(get_current_user)):
    """Export prompt schelet — disponibil pentru orice user."""
    s = ps.get_skeleton(skid)
    if not s:
        raise HTTPException(404, "Skeleton inexistent")
    return {"skeleton": s, "prompt": ps.export_skeleton_prompt(skid)}


# ============================================================================
# COMMAND BAR (AI User + AI Developer)
# ============================================================================
class CommandPayload(BaseModel):
    command: str
    role: str = "user"  # user | developer


# Catalog de comenzi recunoscute → pagina țintă + acțiune
COMMAND_INTENTS = [
    # (keywords, target_route, description, dev_only)
    (["generează document", "generez document", "creează document", "documente"],
     "/documente", "Deschide pagina de generare documente.", False),
    (["adaugă ștampilă", "ștampilă", "stampila", "upload stamp"],
     "/stampile", "Deschide gestionarul de ștampile.", False),
    (["pregătește email", "email", "trimite mail"],
     "/emailuri", "Compune un email.", False),
    (["certifică", "semnătură", "semnatura", "qes"],
     "/semnaturi", "Pagina de semnături digitale interne.", False),
    (["verifică documentația", "audit doc", "verifica documentatia"],
     "/verificare", "Verifică documentația proiectului.", False),
    (["arată planuri", "planuri", "preturi", "prețuri", "abonament"],
     "/preturi", "Pagina cu planurile departamente.", False),
    (["cumpără plan", "achiziție", "purchasing", "checkout"],
     "/purchasing", "Începe procesul de achiziție plan.", False),
    (["rulează audit", "ruleaza audit", "audit interfata"],
     "/audit", "Rulează audit-ul de interfață.", False),
    (["asistent", "ajutor", "help", "ghid"],
     "/asistent", "Deschide asistentul de comenzi.", False),
    (["date proiect", "completează proiect", "beneficiar"],
     "/proiect", "Deschide pagina Date proiect.", False),
    (["date tehnice", "tehnice", "debit instalat"],
     "/tehnice", "Deschide pagina Date tehnice.", False),
    (["calcul", "if calculus", "casete inteligente"],
     "/calc", "Deschide laboratorul de calcul inteligent.", False),
    (["proiecte", "registru proiecte", "list proiecte"],
     "/projects", "Deschide registrul de proiecte.", False),
    (["gaze", "gaze naturale", "branșament gaze"],
     "/gaze-naturale", "Deschide modulul Gaze Naturale Studio.", False),
    (["forum", "discuții"],
     "/forum", "Deschide forumul comunității.", False),
    (["companii", "companies"],
     "/companies", "Directorul de companii.", False),
    (["seap", "alertă seap"],
     "/seap-alerts", "Alerte SEAP.", False),
    # DEV-ONLY
    (["ai developer", "developer chat", "patch plan"],
     "/developer", "Deschide AI Developer chat.", True),
    (["inside", "pepene", "inside full"],
     "/inside", "Deschide Inside Full (necesită enigmă).", True),
    (["queue", "implementation queue", "propuneri"],
     "/queue", "Deschide AI Implementation Queue.", True),
    (["self check", "self-check", "diagnostic pagini"],
     "/self-check", "Rulează Self Check pe toate paginile.", True),
    (["product skeleton", "produs nou"],
     "/skeleton", "Export Product Skeleton pentru industrie nouă.", True),
    (["admin config", "config admin"],
     "/admin/config", "Configurare admin.", True),
]


@router.post("/command-bar/interpret")
async def interpret_command(payload: CommandPayload, user=Depends(get_current_user)):
    """Interpretează comanda în limbaj natural. Returnează ruta țintă + acțiunea."""
    cmd = (payload.command or "").lower().strip()
    if not cmd or len(cmd) < 2:
        return {"matched": False, "message": "Comandă vidă."}

    is_dev = getattr(user, "is_developer", False) or getattr(user, "is_admin", False)
    matches = []
    for keywords, route, desc, dev_only in COMMAND_INTENTS:
        if dev_only and not is_dev:
            continue
        for kw in keywords:
            if kw in cmd:
                matches.append({
                    "matched_keyword": kw,
                    "target_route": route,
                    "description": desc,
                    "dev_only": dev_only,
                })
                break

    if not matches:
        return {
            "matched": False,
            "message": "Nu am recunoscut comanda. Încearcă: 'generează document', 'arată planuri', 'verifică documentația', 'date tehnice'...",
            "available_commands": [k[0][0] for k in COMMAND_INTENTS if not k[3] or is_dev][:10],
        }

    return {
        "matched": True,
        "matches": matches,
        "primary": matches[0],
        "user_role": "developer" if is_dev else "user",
    }


@router.get("/command-bar/help")
async def command_bar_help(user=Depends(get_current_user)):
    """Lista completă a comenzilor disponibile pentru utilizator."""
    is_dev = getattr(user, "is_developer", False) or getattr(user, "is_admin", False)
    out = []
    for keywords, route, desc, dev_only in COMMAND_INTENTS:
        if dev_only and not is_dev:
            continue
        out.append({
            "examples": keywords,
            "route": route,
            "description": desc,
            "dev_only": dev_only,
        })
    return {"commands": out}
