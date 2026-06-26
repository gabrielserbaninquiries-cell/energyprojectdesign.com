"""Partners directory & collaboration module — V12.2

Permite societăților, PFA-urilor și angajaților individuali să-și creeze un profil
public, să-l caute pe alți parteneri și să propună colaborări (proiectant↔VGD↔executant↔OSD).

Un verificator (VGD/RTE) cu plan nelimitat poate colabora simultan cu mai multe
companii — fiecare invitație generează o entrare în `partner_collaborations` care
îl mapează la o societate cu un rol specific.

Endpoints (prefix /api/partners):
- GET  /                  — listare parteneri (filter: kind, county, role, q)
- POST /                  — creează profil partener
- GET  /me                — profilul partener al utilizatorului curent
- PATCH /me               — update profil propriu
- GET  /{partner_id}      — detalii partener
- POST /collaborations    — propune colaborare la un partener (initiator_id, target_id, role, note)
- GET  /collaborations    — listare colaborări (mine: as initiator + as target)
- POST /collaborations/{cid}/accept — acceptă invitație
- POST /collaborations/{cid}/reject — refuză invitație
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/partners", tags=["partners"])

KIND_VALUES = {"srl", "pfa", "angajat", "verificator", "osd"}
ROLE_VALUES = {"proiectant", "executant", "verificator_vgd", "verificator_rte",
               "contabilitate", "ofertare", "operator_date", "consultant"}


class PartnerCreate(BaseModel):
    kind: str = Field(..., description="srl | pfa | angajat | verificator | osd")
    display_name: str
    cui: Optional[str] = None
    legitimatie_anre: Optional[str] = None
    atestat_mdlpa: Optional[str] = None
    roles: List[str] = Field(default_factory=list)
    specialitati: List[str] = Field(default_factory=list)
    county: Optional[str] = None
    city: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    bio: Optional[str] = None
    public: bool = True


class PartnerPatch(BaseModel):
    display_name: Optional[str] = None
    roles: Optional[List[str]] = None
    specialitati: Optional[List[str]] = None
    county: Optional[str] = None
    city: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    bio: Optional[str] = None
    public: Optional[bool] = None


class CollabCreate(BaseModel):
    target_partner_id: str
    role: str = Field(..., description="proiectant | executant | verificator_vgd | ...")
    project_pid: Optional[str] = None
    note: Optional[str] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_partner_id() -> str:
    import uuid
    return f"part_{uuid.uuid4().hex[:12]}"


def _new_collab_id() -> str:
    import uuid
    return f"col_{uuid.uuid4().hex[:12]}"


def make_partners_router(db, get_current_user):
    r = router

    @r.get("")
    async def list_partners(
        kind: Optional[str] = None,
        role: Optional[str] = None,
        county: Optional[str] = None,
        q: Optional[str] = None,
    ):
        """Listare parteneri publici cu filtre."""
        query: Dict[str, Any] = {"public": True, "deleted": {"$ne": True}}
        if kind:
            query["kind"] = kind
        if role:
            query["roles"] = role
        if county:
            query["county"] = {"$regex": f"^{county}", "$options": "i"}
        if q:
            query["$or"] = [
                {"display_name": {"$regex": q, "$options": "i"}},
                {"specialitati": {"$regex": q, "$options": "i"}},
                {"bio": {"$regex": q, "$options": "i"}},
            ]
        items = []
        async for d in db.partners.find(query, {"_id": 0}).sort("created_at", -1).limit(200):
            items.append(d)
        return {"items": items, "total": len(items)}

    @r.post("")
    async def create_partner(payload: PartnerCreate, user=Depends(get_current_user)):
        if payload.kind not in KIND_VALUES:
            raise HTTPException(400, f"Tip invalid. Permise: {sorted(KIND_VALUES)}")
        for ro in payload.roles or []:
            if ro not in ROLE_VALUES:
                raise HTTPException(400, f"Rol invalid: {ro}. Permise: {sorted(ROLE_VALUES)}")
        existing = await db.partners.find_one({"owner_user_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0})
        if existing:
            raise HTTPException(400, "Aveți deja un profil partener. Folosiți PATCH /me pentru update.")
        partner_id = _new_partner_id()
        doc = {
            "partner_id": partner_id,
            "owner_user_id": user.user_id,
            "owner_email": user.email,
            "kind": payload.kind,
            "display_name": payload.display_name.strip(),
            "cui": (payload.cui or "").strip() or None,
            "legitimatie_anre": (payload.legitimatie_anre or "").strip() or None,
            "atestat_mdlpa": (payload.atestat_mdlpa or "").strip() or None,
            "roles": payload.roles or [],
            "specialitati": payload.specialitati or [],
            "county": (payload.county or "").strip() or None,
            "city": (payload.city or "").strip() or None,
            "contact_email": (payload.contact_email or "").strip() or None,
            "contact_phone": (payload.contact_phone or "").strip() or None,
            "bio": (payload.bio or "").strip() or None,
            "public": bool(payload.public),
            "verified": False,
            "collaborations_count": 0,
            "created_at": _now(),
            "updated_at": _now(),
        }
        await db.partners.insert_one(dict(doc))
        return doc

    @r.get("/me")
    async def get_my_partner(user=Depends(get_current_user)):
        d = await db.partners.find_one({"owner_user_id": user.user_id, "deleted": {"$ne": True}}, {"_id": 0})
        if not d:
            raise HTTPException(404, "Nu aveți încă profil partener. Creați unul cu POST /partners")
        return d

    @r.patch("/me")
    async def patch_my_partner(payload: PartnerPatch, user=Depends(get_current_user)):
        updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if not updates:
            raise HTTPException(400, "Niciun câmp de actualizat.")
        updates["updated_at"] = _now()
        res = await db.partners.update_one(
            {"owner_user_id": user.user_id, "deleted": {"$ne": True}},
            {"$set": updates}
        )
        if res.matched_count == 0:
            raise HTTPException(404, "Profil inexistent. Creați unul prin POST /partners")
        return await db.partners.find_one({"owner_user_id": user.user_id}, {"_id": 0})

    @r.get("/{partner_id}")
    async def get_partner(partner_id: str):
        d = await db.partners.find_one({"partner_id": partner_id, "deleted": {"$ne": True}}, {"_id": 0})
        if not d:
            raise HTTPException(404, "Partener inexistent.")
        return d

    # ---------- COLABORĂRI ----------
    @r.get("/collaborations/mine")
    async def my_collaborations(user=Depends(get_current_user)):
        sent: List[Dict[str, Any]] = []
        received: List[Dict[str, Any]] = []
        async for d in db.partner_collaborations.find({"initiator_user_id": user.user_id}, {"_id": 0}).sort("created_at", -1):
            sent.append(d)
        async for d in db.partner_collaborations.find({"target_user_id": user.user_id}, {"_id": 0}).sort("created_at", -1):
            received.append(d)
        return {"sent": sent, "received": received}

    @r.post("/collaborations")
    async def create_collaboration(payload: CollabCreate, user=Depends(get_current_user)):
        if payload.role not in ROLE_VALUES:
            raise HTTPException(400, f"Rol invalid: {payload.role}. Permise: {sorted(ROLE_VALUES)}")
        target = await db.partners.find_one({"partner_id": payload.target_partner_id, "deleted": {"$ne": True}}, {"_id": 0})
        if not target:
            raise HTTPException(404, "Partener țintă inexistent.")
        if target.get("owner_user_id") == user.user_id:
            raise HTTPException(400, "Nu puteți propune colaborare cu propriul profil.")
        cid = _new_collab_id()
        doc = {
            "collaboration_id": cid,
            "initiator_user_id": user.user_id,
            "initiator_email": user.email,
            "target_partner_id": payload.target_partner_id,
            "target_user_id": target["owner_user_id"],
            "target_email": target.get("owner_email"),
            "role": payload.role,
            "project_pid": payload.project_pid,
            "note": (payload.note or "").strip() or None,
            "status": "pending",  # pending | accepted | rejected | cancelled
            "created_at": _now(),
            "updated_at": _now(),
        }
        await db.partner_collaborations.insert_one(dict(doc))
        return doc

    @r.post("/collaborations/{cid}/accept")
    async def accept_collaboration(cid: str, user=Depends(get_current_user)):
        d = await db.partner_collaborations.find_one({"collaboration_id": cid, "target_user_id": user.user_id}, {"_id": 0})
        if not d:
            raise HTTPException(404, "Colaborare inexistentă sau nu sunteți target-ul.")
        if d.get("status") != "pending":
            raise HTTPException(400, f"Colaborarea este deja {d.get('status')}.")
        now = _now()
        await db.partner_collaborations.update_one(
            {"collaboration_id": cid},
            {"$set": {"status": "accepted", "decided_at": now, "updated_at": now}}
        )
        await db.partners.update_one({"partner_id": d["target_partner_id"]}, {"$inc": {"collaborations_count": 1}})
        return {"ok": True, "status": "accepted"}

    @r.post("/collaborations/{cid}/reject")
    async def reject_collaboration(cid: str, user=Depends(get_current_user)):
        d = await db.partner_collaborations.find_one({"collaboration_id": cid, "target_user_id": user.user_id}, {"_id": 0})
        if not d:
            raise HTTPException(404, "Colaborare inexistentă sau nu sunteți target-ul.")
        if d.get("status") != "pending":
            raise HTTPException(400, f"Colaborarea este deja {d.get('status')}.")
        now = _now()
        await db.partner_collaborations.update_one(
            {"collaboration_id": cid},
            {"$set": {"status": "rejected", "decided_at": now, "updated_at": now}}
        )
        return {"ok": True, "status": "rejected"}

    return r
