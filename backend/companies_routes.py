"""Companies Directory routes factory — public directory + auth-gated CRUD.

Wire via: app.include_router(make_companies_router(db, get_current_user), prefix="/api")
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

import companies_directory
from models import new_id


def make_companies_router(db, get_current_user):
    r = APIRouter(prefix="/companies", tags=["companies-directory"])

    # ----- Roles managed in DB (seeded on first start) -----
    @r.get("/roles")
    async def list_roles():
        roles = []
        async for row in db.company_roles.find({"deleted": {"$ne": True}}, {"_id": 0}).sort("order", 1):
            roles.append(row)
        # Fallback to in-code defaults if collection empty (bootstrap)
        if not roles:
            return companies_directory.COMPANY_ROLES
        return [{"id": r_["id"], "label": r_["label"]} for r_ in roles]

    @r.post("/roles")
    async def add_role(payload: dict, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin poate adăuga roluri")
        rid = (payload.get("id") or "").strip().lower().replace(" ", "_")
        label = (payload.get("label") or "").strip()
        if not rid or not label:
            raise HTTPException(400, "id și label obligatorii")
        exists = await db.company_roles.find_one({"id": rid})
        if exists:
            raise HTTPException(409, "Rol existent")
        count = await db.company_roles.count_documents({})
        await db.company_roles.insert_one({"id": rid, "label": label, "order": count, "deleted": False})
        return {"id": rid, "label": label}

    @r.patch("/roles/{rid}")
    async def edit_role(rid: str, payload: dict, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin")
        updates = {}
        if "label" in payload:
            updates["label"] = (payload["label"] or "").strip()
        if "order" in payload:
            updates["order"] = int(payload["order"])
        if not updates:
            raise HTTPException(400, "Nimic de actualizat")
        res = await db.company_roles.update_one({"id": rid}, {"$set": updates})
        if res.matched_count == 0:
            raise HTTPException(404, "Rol inexistent")
        return {"updated": True}

    @r.delete("/roles/{rid}")
    async def remove_role(rid: str, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin")
        res = await db.company_roles.update_one({"id": rid}, {"$set": {"deleted": True}})
        if res.matched_count == 0:
            raise HTTPException(404, "Rol inexistent")
        return {"deleted": True}

    # ----- Stats + list -----
    @r.get("/stats")
    async def get_stats():
        return await companies_directory.role_stats()

    @r.get("")
    async def list_co(industry: Optional[str] = None, role: Optional[str] = None, query: Optional[str] = None):
        return await companies_directory.list_companies(industry=industry, role=role, query=query)

    @r.post("")
    async def create_co(payload: companies_directory.CompanyIn, user=Depends(get_current_user)):
        auto_verify = bool(getattr(user, "is_developer", False) or getattr(user, "is_admin", False))
        return await companies_directory.create_company(user.user_id, payload, new_id("co_"), auto_verify=auto_verify)

    @r.get("/{company_id}")
    async def get_co(company_id: str):
        doc = await companies_directory.get_company(company_id)
        if not doc:
            raise HTTPException(404, "Companie inexistentă")
        return doc

    @r.patch("/{company_id}")
    async def patch_co(company_id: str, payload: dict, user=Depends(get_current_user)):
        existing = await companies_directory.get_company(company_id)
        if not existing:
            raise HTTPException(404, "Companie inexistentă")
        is_admin_dev = getattr(user, "is_admin", False) or getattr(user, "is_developer", False)
        if not is_admin_dev and existing.get("submitted_by") != user.user_id:
            raise HTTPException(403, "Doar admin/developer/submitter pot edita")
        return await companies_directory.update_company(company_id, payload)

    @r.delete("/{company_id}")
    async def delete_co(company_id: str, user=Depends(get_current_user)):
        existing = await companies_directory.get_company(company_id)
        if not existing:
            raise HTTPException(404, "Companie inexistentă")
        is_admin_dev = getattr(user, "is_admin", False) or getattr(user, "is_developer", False)
        if not is_admin_dev and existing.get("submitted_by") != user.user_id:
            raise HTTPException(403, "Doar admin/developer/submitter pot șterge")
        ok = await companies_directory.delete_company(company_id)
        return {"deleted": ok}

    return r


async def seed_default_roles(db):
    """Seed COMPANY_ROLES into DB on first startup if empty."""
    count = await db.company_roles.count_documents({})
    if count > 0:
        return
    for i, role in enumerate(companies_directory.COMPANY_ROLES):
        await db.company_roles.insert_one({
            "id": role["id"], "label": role["label"], "order": i, "deleted": False, "seeded": True,
        })
