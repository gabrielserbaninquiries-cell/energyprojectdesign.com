"""Cross-Industry Clone — clonează proiect pe altă industrie.

Conform sugestiei strategice "potential improvement" (V6.2):
    Un singur click → platforma generează automat schelet pentru același
    beneficiar pe electric/apă/fotovoltaice/telecom etc.

Acesta este motorul pentru a transforma pagina dintr-un formular în
"fabrică de proiecte cross-industry".

Câmpurile comune (beneficiar, loc consum, cadastrale) sunt copiate;
câmpurile specifice industriei (debit, presiune, dimensiuni) sunt sterse
sau adaptate pentru noul domeniu.
"""
from __future__ import annotations
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
from db import db
import product_skeleton as ps


router = APIRouter()


# Câmpurile comune ce se MOȘTENESC între industrii
COMMON_FIELDS = [
    "beneficiar_nume", "beneficiar_cnp_cui", "beneficiar_telefon",
    "beneficiar_email", "beneficiar_adresa",
    "loc_consum_adresa", "loc_consum_strada", "loc_consum_localitate",
    "loc_consum_judet", "loc_consum_cadastru",
    "tipul_lucrarii", "scop_lucrare",
    "fact_proiectanta_societate", "fact_executanta_societate",
    "fact_vgd_nume", "fact_rte_nume",
    "cu_numar", "cu_data_emitere",  # CU se aplică transversal
]


class CloneRequest(BaseModel):
    source_pid: str
    target_industry: str  # ex: electric-les-lea, apa-canal, fotovoltaice
    new_title: Optional[str] = None


@router.post("/clone-to-industry")
async def clone_to_industry(payload: CloneRequest, user=Depends(get_current_user)):
    """Clonează un proiect existent pe altă industrie cu moștenirea câmpurilor comune."""
    # 1. Verify source project
    source = await db.gas_projects.find_one(
        {"pid": payload.source_pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0},
    )
    if not source:
        raise HTTPException(404, "Proiect sursă inexistent")

    # 2. Verify target industry exists in skeleton
    target_sk = ps.get_skeleton(payload.target_industry)
    if not target_sk:
        raise HTTPException(400, f"Industrie țintă necunoscută. Disponibile: {[s['id'] for s in ps.list_skeletons()]}")

    if target_sk["status"] != "active":
        # Pentru industrii doar schelet, returnăm doar metadata + prompt (nu creăm proiect activ)
        return {
            "warning": f"Industria '{payload.target_industry}' este SCHELET. Codul real (calc engine, templates DOCX, avize) trebuie generat conform Product Skeleton.",
            "prompt": ps.export_skeleton_prompt(payload.target_industry),
            "fields_to_inherit": _select_common_fields(source.get("data") or {}),
            "source_industry": source.get("subdomain", "gaze-naturale"),
            "target_industry": payload.target_industry,
            "skeleton": target_sk,
        }

    # 3. Build inherited data
    inherited_data = _select_common_fields(source.get("data") or {})

    # 4. Generate new project (same model as gas_projects)
    new_pid = f"gp_{secrets.token_hex(8)}"
    new_title = payload.new_title or f"{source.get('title', 'Proiect')} ({target_sk['label']})"
    now = datetime.now(timezone.utc).isoformat()
    new_doc = {
        "pid": new_pid,
        "owner_id": user.user_id,
        "title": new_title,
        "country": source.get("country", "RO"),
        "subdomain": payload.target_industry,
        "industry": payload.target_industry,
        "data": inherited_data,
        "status": "draft",
        "phase": "tema",
        "cloned_from_pid": payload.source_pid,
        "cloned_at": now,
        "created_at": now,
        "updated_at": now,
        "deleted": False,
    }
    await db.gas_projects.insert_one(new_doc)
    new_doc.pop("_id", None)

    return {
        "ok": True,
        "new_pid": new_pid,
        "new_title": new_title,
        "inherited_fields": list(inherited_data.keys()),
        "inherited_count": len(inherited_data),
        "target_industry": payload.target_industry,
        "industry_norms": target_sk.get("norms"),
        "industry_documents": target_sk.get("documents"),
        "industry_avize": target_sk.get("avize"),
    }


def _select_common_fields(source_data: Dict[str, Any]) -> Dict[str, Any]:
    """Selectează doar câmpurile comune din datele proiectului sursă."""
    out: Dict[str, Any] = {}
    for k in COMMON_FIELDS:
        if k in source_data and source_data[k] not in (None, "", []):
            out[k] = source_data[k]
    return out


@router.get("/clone-targets/{pid}")
async def list_clone_targets(pid: str, user=Depends(get_current_user)):
    """Lista industriilor disponibile pentru clonarea unui proiect existent."""
    proj = await db.gas_projects.find_one(
        {"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0, "subdomain": 1, "title": 1, "data": 1},
    )
    if not proj:
        raise HTTPException(404, "Proiect inexistent")
    current_industry = proj.get("subdomain", "gaze-naturale")
    targets = [
        {
            **s,
            "is_current": s["id"] == current_industry,
            "inheritable_fields": len(_select_common_fields(proj.get("data") or {})),
        }
        for s in ps.list_skeletons()
        if s["id"] != current_industry
    ]
    return {"source_pid": pid, "source_industry": current_industry, "targets": targets}
