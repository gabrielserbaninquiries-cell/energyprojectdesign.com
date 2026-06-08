"""Cross-Industry Document Generation Routes — V6.4.

Endpoints pentru a genera template-uri DOCX per industrie:
- /api/industry/{industry}/templates           — listă template-uri industriei
- /api/industry/{industry}/doc/{template_id}   — generare DOCX pentru proiect

Industrii suportate concret:
- gaze (gas_doc_templates + gas_doc_templates_extra) — 23 template-uri
- electric (electric_doc_templates)                   — 6 template-uri
- apa_canal (apa_canal_doc_templates)                 — 5 template-uri

Pentru celelalte industrii (telecom, fotovoltaice, etc.) folosește product_skeleton.
"""
from __future__ import annotations
import io
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from auth import get_current_user
from db import db
import gas_doc_templates as gas_tpl
import electric_doc_templates as el_tpl
import apa_canal_doc_templates as ac_tpl

router = APIRouter()

INDUSTRY_MODULES = {
    "gaze":      gas_tpl,
    "electric":  el_tpl,
    "apa_canal": ac_tpl,
}


@router.get("/industry/{industry}/templates")
async def industry_templates(industry: str, user=Depends(get_current_user)):
    mod = INDUSTRY_MODULES.get(industry)
    if not mod:
        raise HTTPException(404, f"Industrie '{industry}' nu are template-uri concrete. Folosește /api/product-skeleton/{industry}.")
    return {
        "industry": industry,
        "templates": mod.list_templates(),
        "count": len(mod.list_templates()),
    }


@router.get("/industry/all-templates")
async def all_industry_templates(user=Depends(get_current_user)):
    """Returnează toate template-urile disponibile pe toate industriile concretizate."""
    return {
        ind: {
            "count": len(mod.list_templates()),
            "templates": mod.list_templates(),
        }
        for ind, mod in INDUSTRY_MODULES.items()
    }


@router.get("/industry/{industry}/project/{pid}/doc/{template_id}")
async def industry_generate_doc(industry: str, pid: str, template_id: str,
                                 user=Depends(get_current_user)):
    """Generează un DOCX dintr-un template specific industriei pentru proiectul `pid`."""
    mod = INDUSTRY_MODULES.get(industry)
    if not mod:
        raise HTTPException(404, f"Industrie '{industry}' nu are template-uri concrete.")
    proj = await db.gas_projects.find_one({"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0})
    if not proj:
        # Try cross-industry cloned projects
        proj = await db.gas_projects.find_one({"pid": pid, "owner_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(404, "Proiect inexistent")
    res = mod.generate(template_id, proj)
    if not res:
        raise HTTPException(400, f"Template necunoscut: {template_id}")
    blob, fname = res
    # ASCII-safe filename for HTTP Content-Disposition
    safe_fname = fname.encode("ascii", "ignore").decode("ascii") or f"{template_id}.docx"
    return StreamingResponse(
        io.BytesIO(blob),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{safe_fname}"'},
    )
