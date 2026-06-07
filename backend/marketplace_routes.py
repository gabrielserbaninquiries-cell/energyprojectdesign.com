"""Marketplace routes — Jobs board + CRM Contracts + SEAP status.

Restored from commit 933d02c (V5.2 vision) which contained lost endpoints
that were absent in subsequent rewrites. These power:
  - `/jobs`            : public job feed (no auth)
  - `/dev/jobs`        : admin CRUD for ANRE job postings
  - `/dev/contracts`   : CRM contracts (recurring fees, attached to subscribers)
  - `/seap/status`     : integration health for SEAP/SICAP module
"""
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from db import db
from models import User, new_id
import seap_integration


router = APIRouter(prefix="/api")


def _strip_oid(doc: dict) -> dict:
    if doc:
        doc.pop("_id", None)
    return doc


def _ensure_admin(user: User) -> None:
    if not (user.is_admin or getattr(user, "is_developer", False)):
        raise HTTPException(status_code=403, detail="Acces restricționat — necesită rol de administrator")


# ====================== SEAP integration status ======================
@router.get("/seap/status")
async def seap_status(user: User = Depends(get_current_user)):
    _ensure_admin(user)
    return seap_integration.integration_status()


# ====================== CRM Contracts (admin-only) ======================
@router.get("/dev/contracts")
async def list_contracts(user: User = Depends(get_current_user)):
    _ensure_admin(user)
    docs = await db.contracts.find().sort("created_at", -1).to_list(length=500)
    return [_strip_oid(d) for d in docs]


@router.post("/dev/contracts")
async def create_contract(payload: dict, user: User = Depends(get_current_user)):
    _ensure_admin(user)
    doc = {
        "id": new_id("ctr_"),
        "subscriber_id": payload.get("subscriber_id"),
        "title": (payload.get("title") or "").strip(),
        "value_eur": float(payload.get("value_eur") or 0),
        "status": payload.get("status") or "draft",
        "start_date": payload.get("start_date"),
        "end_date": payload.get("end_date"),
        "notes": payload.get("notes") or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contracts.insert_one(doc)
    return _strip_oid(doc)


@router.delete("/dev/contracts/{ctr_id}")
async def delete_contract(ctr_id: str, user: User = Depends(get_current_user)):
    _ensure_admin(user)
    r = await db.contracts.delete_one({"id": ctr_id})
    return {"deleted": r.deleted_count}


# ====================== Jobs Marketplace (ANRE) ======================
@router.get("/dev/jobs")
async def list_jobs_admin(user: User = Depends(get_current_user)):
    _ensure_admin(user)
    docs = await db.jobs.find().sort("created_at", -1).to_list(length=500)
    return [_strip_oid(d) for d in docs]


@router.post("/dev/jobs")
async def create_job(payload: dict, user: User = Depends(get_current_user)):
    _ensure_admin(user)
    doc = {
        "id": new_id("job_"),
        "title": (payload.get("title") or "").strip(),
        "industry": payload.get("industry"),
        "location": payload.get("location") or "",
        "type": payload.get("type") or "full_time",
        "description": payload.get("description") or "",
        "is_public": bool(payload.get("is_public", True)),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.jobs.insert_one(doc)
    return _strip_oid(doc)


@router.delete("/dev/jobs/{job_id}")
async def delete_job(job_id: str, user: User = Depends(get_current_user)):
    _ensure_admin(user)
    r = await db.jobs.delete_one({"id": job_id})
    return {"deleted": r.deleted_count}


@router.get("/jobs")
async def list_jobs_public(industry: Optional[str] = None, limit: int = 50):
    """Public listing of jobs marked as public (no auth required)."""
    q: dict = {"is_public": True}
    if industry:
        q["industry"] = industry
    docs = await db.jobs.find(q).sort("created_at", -1).to_list(length=limit)
    return [_strip_oid(d) for d in docs]
