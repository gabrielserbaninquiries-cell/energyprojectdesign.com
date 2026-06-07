"""Subscriber module for B2B entities: Primării, Asociații de locatari, Utilități publice,
Dezvoltatori, Societăți.

These are entities that consume services (not end-customers).
Endpoints (all under /api/subscribers via main server.py):
- GET    /subscribers/types         — list 5 entity types
- POST   /subscribers               — create
- GET    /subscribers               — list current user's subscribers
- GET    /subscribers/{sid}         — get one
- PATCH  /subscribers/{sid}         — update
- DELETE /subscribers/{sid}         — soft delete
"""
from __future__ import annotations
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel


SUBSCRIBER_TYPES = [
    {
        "id": "primarie",
        "name": "Primărie / Consiliu local / Județean",
        "icon": "Building",
        "description": "Administrații publice locale — proiecte de utilitate publică, iluminat, drumuri, gaze, încălzire centralizată.",
        "fields_required": ["cui", "uat_cod", "reprezentant_legal", "primar_nume"],
    },
    {
        "id": "asociatie_locatari",
        "name": "Asociație de proprietari / Locatari",
        "icon": "Users2",
        "description": "Asociații de proprietari (legea 196/2018) pentru lucrări la blocuri: branșamente, reabilitare termică, fotovoltaice comune.",
        "fields_required": ["cif", "presedinte_nume", "nr_apartamente", "scara_bloc"],
    },
    {
        "id": "utilitate_publica",
        "name": "Utilitate publică (OSD, RAJA, Apa Nova, etc.)",
        "icon": "Plug",
        "description": "Operatori de distribuție: gaze, electricitate, apă-canal, salubrizare. Contracte ATR, extinderi rețele.",
        "fields_required": ["cui", "tip_utilitate", "judete_acoperite"],
    },
    {
        "id": "dezvoltator",
        "name": "Dezvoltator imobiliar / Construcții",
        "icon": "Hammer",
        "description": "Firme dezvoltare imobiliară — ansambluri rezidențiale, comerciale, industriale.",
        "fields_required": ["cui", "tip_proiecte", "portofoliu_link"],
    },
    {
        "id": "societate",
        "name": "Societate comercială (B2B generic)",
        "icon": "Briefcase",
        "description": "Orice altă entitate juridică: fabrici, depozite, restaurante, clinici, hoteluri care necesită proiectare tehnică.",
        "fields_required": ["cui", "domeniu_caen", "reprezentant_legal"],
    },
]


class SubscriberCreate(BaseModel):
    type: str  # one of SUBSCRIBER_TYPES.id
    name: str
    cui: Optional[str] = None
    cif: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    judet: Optional[str] = None
    localitate: Optional[str] = None
    reprezentant_legal: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None  # type-specific fields go here
    notes: Optional[str] = None


class SubscriberPatch(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    judet: Optional[str] = None
    localitate: Optional[str] = None
    reprezentant_legal: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    status: Optional[str] = None  # active | inactive | prospect


def new_id(prefix: str) -> str:
    return f"{prefix}{os.urandom(8).hex()}"


def make_subscribers_router(db, get_current_user):
    r = APIRouter(prefix="/subscribers", tags=["subscribers"])

    @r.get("/types")
    async def list_types():
        return {"types": SUBSCRIBER_TYPES}

    @r.post("")
    async def create_sub(payload: SubscriberCreate, user=Depends(get_current_user)):
        type_ids = {t["id"] for t in SUBSCRIBER_TYPES}
        if payload.type not in type_ids:
            raise HTTPException(400, "Tip subscriber invalid")
        sid = new_id("sub_")
        doc = payload.model_dump()
        doc.update({
            "sid": sid,
            "owner_id": user.user_id,
            "status": "prospect",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "deleted": False,
        })
        await db.subscribers.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @r.get("")
    async def list_subs(type: Optional[str] = None, user=Depends(get_current_user)):
        q: Dict[str, Any] = {"owner_id": user.user_id, "deleted": {"$ne": True}}
        if type:
            q["type"] = type
        items: List[dict] = []
        async for d in db.subscribers.find(q, {"_id": 0}).sort("updated_at", -1):
            items.append(d)
        return items

    @r.get("/{sid}")
    async def get_sub(sid: str, user=Depends(get_current_user)):
        d = await db.subscribers.find_one({"sid": sid, "owner_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0})
        if not d:
            raise HTTPException(404, "Subscriber inexistent")
        return d

    @r.patch("/{sid}")
    async def patch_sub(sid: str, payload: SubscriberPatch, user=Depends(get_current_user)):
        d = await db.subscribers.find_one({"sid": sid, "owner_id": user.user_id, "deleted": {"$ne": True}})
        if not d:
            raise HTTPException(404, "Subscriber inexistent")
        updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc).isoformat()}
        for k, v in payload.model_dump(exclude_unset=True).items():
            updates[k] = v
        await db.subscribers.update_one({"sid": sid}, {"$set": updates})
        out = await db.subscribers.find_one({"sid": sid}, {"_id": 0})
        return out

    @r.delete("/{sid}")
    async def delete_sub(sid: str, user=Depends(get_current_user)):
        d = await db.subscribers.find_one({"sid": sid, "owner_id": user.user_id, "deleted": {"$ne": True}})
        if not d:
            raise HTTPException(404, "Subscriber inexistent")
        await db.subscribers.update_one({"sid": sid}, {"$set": {"deleted": True, "updated_at": datetime.now(timezone.utc).isoformat()}})
        return {"ok": True}

    return r
