"""Backend router for the comprehensive Gas Natural Project Studio.

Endpoints (all prefixed with /api via main server.py mount):
- GET    /gas-project/phases                — list 11 legal phases (schema)
- POST   /gas-project                       — create new project (status="draft")
- GET    /gas-project                       — list current user's gas projects
- GET    /gas-project/{pid}                 — get project
- PATCH  /gas-project/{pid}                 — partial update (fields per phase)
- POST   /gas-project/{pid}/sign            — apply digital signature (stamp_id from user stamps)
- GET    /gas-project/{pid}/qr              — return QR PNG (PNG/base64) for verification
- GET    /gas-project/{pid}/verify          — public verification (lightweight summary)
- DELETE /gas-project/{pid}                 — soft delete
"""
from __future__ import annotations
import base64
import hashlib
import io
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import qrcode

from gas_project_phases import get_phases, get_phase, progress

router = APIRouter(prefix="/gas-project", tags=["gas-project"])


def new_id(prefix: str) -> str:
    return f"{prefix}{os.urandom(8).hex()}"


# ---------- pydantic models ----------
class GasProjectCreate(BaseModel):
    title: str
    data: Optional[Dict[str, Any]] = None
    phase: Optional[str] = "tema"


class GasProjectPatch(BaseModel):
    title: Optional[str] = None
    phase: Optional[str] = None
    data: Optional[Dict[str, Any]] = None  # merged into existing
    status: Optional[str] = None  # draft | in_review | approved | signed | archived


class SignPayload(BaseModel):
    stamp_id: Optional[str] = None
    note: Optional[str] = None


# ---------- helpers ----------
async def _get_proj(db, user_id: str, pid: str) -> Dict[str, Any]:
    doc = await db.gas_projects.find_one({"pid": pid, "owner_id": user_id, "deleted": {"$ne": True}}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Proiect inexistent")
    return doc


def _public_payload(p: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "pid": p["pid"],
        "title": p.get("title"),
        "status": p.get("status"),
        "phase": p.get("phase"),
        "beneficiar": (p.get("data") or {}).get("beneficiar_nume"),
        "loc_consum": (p.get("data") or {}).get("loc_consum_adresa"),
        "signed_at": p.get("signed_at"),
        "signature_hash": p.get("signature_hash"),
    }


def _compute_signature_hash(proj: Dict[str, Any]) -> str:
    """SHA-256 over a canonical subset of project data — used as integrity proof in QR."""
    import json
    canonical = {
        "pid": proj["pid"],
        "title": proj.get("title"),
        "data": proj.get("data") or {},
        "phase": proj.get("phase"),
    }
    blob = json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


# ---------- factory: bind db at mount time ----------
def make_gas_project_router(db, get_current_user):
    """Returns a configured router; called from server.py with shared db + auth dep."""
    r = APIRouter(prefix="/gas-project", tags=["gas-project"])

    @r.get("/phases")
    async def list_phases():
        """Public — schema of the 11 legal phases (used by the frontend wizard)."""
        return {"phases": get_phases()}

    @r.post("")
    async def create_proj(payload: GasProjectCreate, user=Depends(get_current_user)):
        pid = new_id("gp_")
        doc = {
            "pid": pid,
            "owner_id": user.user_id,
            "title": payload.title.strip() or "Proiect gaze naturale",
            "phase": payload.phase or "tema",
            "status": "draft",
            "data": payload.data or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted": False,
        }
        await db.gas_projects.insert_one(doc)
        doc.pop("_id", None)
        doc["progress"] = progress(doc["data"])
        return doc

    @r.get("")
    async def list_projects(user=Depends(get_current_user)):
        out: List[dict] = []
        async for d in db.gas_projects.find({"owner_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0}).sort("updated_at", -1):
            d["progress"] = progress(d.get("data") or {})
            out.append(d)
        return out

    @r.get("/{pid}")
    async def get_one(pid: str, user=Depends(get_current_user)):
        doc = await _get_proj(db, user.user_id, pid)
        doc["progress"] = progress(doc.get("data") or {})
        doc["phases_schema"] = get_phases()
        return doc

    @r.patch("/{pid}")
    async def patch_one(pid: str, payload: GasProjectPatch, user=Depends(get_current_user)):
        doc = await _get_proj(db, user.user_id, pid)
        updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
        if payload.title is not None:
            updates["title"] = payload.title.strip()
        if payload.phase is not None:
            if not get_phase(payload.phase):
                raise HTTPException(400, "Faza invalidă")
            updates["phase"] = payload.phase
        if payload.status is not None:
            if payload.status not in {"draft", "in_review", "approved", "signed", "archived"}:
                raise HTTPException(400, "Status invalid")
            updates["status"] = payload.status
        if payload.data is not None:
            merged = {**(doc.get("data") or {}), **payload.data}
            updates["data"] = merged
        await db.gas_projects.update_one({"pid": pid}, {"$set": updates})
        new_doc = await _get_proj(db, user.user_id, pid)
        new_doc["progress"] = progress(new_doc.get("data") or {})
        return new_doc

    @r.delete("/{pid}")
    async def delete_one(pid: str, user=Depends(get_current_user)):
        await _get_proj(db, user.user_id, pid)
        await db.gas_projects.update_one({"pid": pid}, {"$set": {"deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}})
        return {"ok": True}

    @r.post("/{pid}/sign")
    async def sign_project(pid: str, payload: SignPayload, user=Depends(get_current_user)):
        """Apply digital signature: reference user's stamp + hash project, store signature record."""
        doc = await _get_proj(db, user.user_id, pid)
        # Confirm stamp exists if provided
        stamp_doc = None
        if payload.stamp_id:
            stamp_doc = await db.stamps.find_one({"sid": payload.stamp_id, "owner_id": user.user_id})
            if not stamp_doc:
                raise HTTPException(404, "Ștampilă inexistentă în contul tău")
        sig_hash = _compute_signature_hash(doc)
        signed_at = datetime.now(timezone.utc).isoformat()
        await db.gas_projects.update_one({"pid": pid}, {"$set": {
            "status": "signed",
            "signed_at": signed_at,
            "signed_by_user_id": user.user_id,
            "signed_by_email": user.email,
            "signed_with_stamp_id": payload.stamp_id,
            "signature_hash": sig_hash,
            "signature_note": (payload.note or "").strip(),
            "updated_at": signed_at,
        }})
        return {
            "ok": True,
            "signed_at": signed_at,
            "signature_hash": sig_hash,
            "stamp_id": payload.stamp_id,
            "verify_url": f"/verify/gas-project/{pid}",
        }

    @r.get("/{pid}/qr")
    async def project_qr(pid: str, user=Depends(get_current_user)):
        doc = await _get_proj(db, user.user_id, pid)
        verify_url = f"https://energy-project.preview.emergentagent.com/verify/gas-project/{pid}"
        qr = qrcode.QRCode(version=None, box_size=8, border=2, error_correction=qrcode.constants.ERROR_CORRECT_M)
        qr.add_data(verify_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#0A0A0A", back_color="#FFFFFF")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return {
            "pid": pid,
            "verify_url": verify_url,
            "qr_png_b64": f"data:image/png;base64,{b64}",
            "signature_hash": doc.get("signature_hash"),
        }

    @r.get("/{pid}/public")
    async def public_verify(pid: str):
        """No auth — public lightweight verification."""
        doc = await db.gas_projects.find_one({"pid": pid, "deleted": {"$ne": True}}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Proiect inexistent")
        return _public_payload(doc)

    return r
