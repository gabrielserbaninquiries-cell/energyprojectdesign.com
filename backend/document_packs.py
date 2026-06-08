"""Document Packs & Pre-flight Validation — V6.4.

Două concepte cheie pentru workflow real:

1. PRE-FLIGHT: Înainte de a genera un DOCX, verifică câmpurile required din
   placeholders_registry. Returnează 200 cu `ready=true` SAU listă missing_fields
   cu link-uri către secțiunile UI corespondente.

2. DOCUMENT PACKS: Pachete predefinite de documente generate într-o singură acțiune:
   - "Pachet CU + ATR"          → cerere_cu + cerere_atr + memoriu_tehnic
   - "Pachet DTAC complet"      → DTAC integral (8 docs)
   - "Pachet execuție"          → anunt + predare + PCC + notificare ISC
   - "Pachet recepție + PIF"    → PV LA + PV FD + PV recepție + as_built + cerere PIF
   - "Pachet carte tehnică"     → carte tehnică A/B/C/D + anexe

Pachetele sunt returnate ca ZIP cu manifest legal (norme aplicate).
"""
from __future__ import annotations
import io
import zipfile
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from db import db
import gas_doc_templates as gas_tpl
import placeholders_registry as pholders

router = APIRouter()


# ============================================================================
# PRE-FLIGHT VALIDATION
# ============================================================================
class PreflightRequest(BaseModel):
    pid: str
    template_ids: List[str]


@router.post("/preflight")
async def preflight(payload: PreflightRequest, user=Depends(get_current_user)):
    """Verifică completitudinea câmpurilor pentru o listă de template-uri.
    Returnează ready=true doar dacă TOATE template-urile au câmpurile required completate."""
    proj = await db.gas_projects.find_one(
        {"pid": payload.pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0},
    )
    if not proj:
        raise HTTPException(404, "Proiect inexistent")
    data = proj.get("data") or {}

    results: Dict[str, Any] = {}
    overall_ready = True
    for tid in payload.template_ids:
        fields = pholders.list_fields_for_template(tid)
        missing_required = [
            {"key": f["key"], "label": f["label"], "section": f["section"]}
            for f in fields
            if f.get("required") and not data.get(f["key"])
        ]
        all_missing = [
            {"key": f["key"], "label": f["label"], "section": f["section"]}
            for f in fields
            if not data.get(f["key"])
        ]
        ready = len(missing_required) == 0
        if not ready:
            overall_ready = False
        results[tid] = {
            "ready": ready,
            "missing_required": missing_required,
            "missing_optional": [f for f in all_missing if f not in missing_required],
            "total_fields": len(fields),
            "filled": len(fields) - len(all_missing),
            "coverage_pct": round(100 * (len(fields) - len(all_missing)) / max(1, len(fields)), 1),
        }
    return {"pid": payload.pid, "overall_ready": overall_ready, "per_template": results}


# ============================================================================
# DOCUMENT PACKS — Pachete predefinite
# ============================================================================
PACKS: Dict[str, Dict[str, Any]] = {
    "pachet_cu_atr": {
        "label": "Pachet Inițiere (CU + ATR)",
        "description": "Cerere CU către Primărie + Cerere ATR către OSD + Memoriu Tehnic preliminar",
        "templates": ["cerere_cu", "cerere_atr", "memoriu_tehnic"],
        "norme": ["Legea 50/1991", "Ord. ANRE 89/2018", "HG 907/2016"],
    },
    "pachet_dtac": {
        "label": "Pachet DTAC complet (8 documente)",
        "description": "Documentație Tehnică Autorizare Construire — completă conform HG 907/2016",
        "templates": ["memoriu_tehnic", "caiet_sarcini", "borderou", "referat_verificator",
                      "cerere_aviz_apa", "cerere_aviz_electrica", "cerere_aviz_drumuri", "cerere_aviz_mediu"],
        "norme": ["HG 907/2016", "Legea 50/1991", "Legea 10/1995", "NTPEE 2018"],
    },
    "pachet_executie": {
        "label": "Pachet Începere Execuție (4 documente)",
        "description": "Anunț începere ISC + Predare amplasament + PCC + Notificare ISC",
        "templates": ["anunt_incepere", "predare_amplasament", "program_control_calitate", "notificare_isc"],
        "norme": ["Legea 50/1991 art. 7", "Legea 10/1995", "HG 1735/2006"],
    },
    "pachet_receptie_pif": {
        "label": "Pachet Recepție + PIF (5 documente)",
        "description": "PV lucrări ascunse + PV faze det. + PV recepție + As-built + Cerere PIF",
        "templates": ["pv_lucrari_ascunse", "pv_faza_determinanta", "pv_receptie", "as_built", "cerere_pif"],
        "norme": ["HG 273/1994", "Legea 10/1995", "Ord. ANRE 162/2021"],
    },
    "pachet_carte_tehnica": {
        "label": "Pachet Carte Tehnică completă",
        "description": "Cartea Tehnică A/B/C/D + As-built + toate PV-urile (intră în arhiva permanentă)",
        "templates": ["carte_tehnica", "as_built", "pv_lucrari_ascunse",
                      "pv_faza_determinanta", "pv_receptie"],
        "norme": ["HG 273/1994", "Ord. MLPAT 770/1997", "Legea 10/1995"],
    },
    "pachet_avize_complet": {
        "label": "Pachet Avize Complete (8 cereri)",
        "description": "Toate cererile de aviz: APĂ, ELECTRIC, DRUMURI, POLIȚIE, MEDIU, ISCIR + Memoriu + Borderou",
        "templates": ["cerere_aviz_apa", "cerere_aviz_electrica", "cerere_aviz_drumuri",
                      "cerere_aviz_politie", "cerere_aviz_mediu", "cerere_aviz_iscir", "memoriu_tehnic", "borderou"],
        "norme": ["Legea 241/2006", "Ord. ANRE 11/2014", "OG 43/1997", "OUG 195/2002", "Legea 292/2018", "Legea 64/2008"],
    },
}


@router.get("/packs")
async def list_packs():
    return {
        "packs": [{"id": k, **{kk: vv for kk, vv in v.items()}} for k, v in PACKS.items()]
    }


@router.post("/packs/{pack_id}/generate")
async def generate_pack(pack_id: str, payload: dict, user=Depends(get_current_user)):
    pack = PACKS.get(pack_id)
    if not pack:
        raise HTTPException(404, "Pachet inexistent")
    pid = payload.get("pid")
    if not pid:
        raise HTTPException(400, "pid obligatoriu")
    proj = await db.gas_projects.find_one(
        {"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0}
    )
    if not proj:
        raise HTTPException(404, "Proiect inexistent")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        manifest_lines = [
            f"# {pack['label']}\n",
            f"\n{pack['description']}\n",
            "\n## Norme legale aplicabile:\n",
            *[f"- {n}\n" for n in pack["norme"]],
            f"\n## Documente generate ({len(pack['templates'])}):\n",
        ]
        for tid in pack["templates"]:
            res = gas_tpl.generate(tid, proj)
            if not res:
                manifest_lines.append(f"- {tid} — ❌ template necunoscut\n")
                continue
            blob, fname = res
            zf.writestr(fname, blob)
            manifest_lines.append(f"- {tid} → {fname}\n")
        zf.writestr("MANIFEST.md", "".join(manifest_lines))

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{pack_id}_{pid}.zip"'},
    )
