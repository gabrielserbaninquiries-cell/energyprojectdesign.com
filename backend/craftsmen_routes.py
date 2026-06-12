"""Craftsmen Hiring (Închiriere meseriași) V7.0 — platforma copie după Helpper / Meserii.ro / Iaduit.ro.

Concept (cerere literală user):
    "inchiriere meseriasi"

Servicii: instalatori gaze, electricieni, zugravi, faianțari, sudori, dulgheri,
zidari, dirigenți șantier, șoferi categoria C, etc.

Profilurile meseriașilor au: specializare, județe acoperite, rating, recenzii,
tarif/oră, autorizații (ANRE, MDLPA), portofoliu poze.
"""
from __future__ import annotations
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import get_current_user
from db import db

router = APIRouter()


SPECIALIZATIONS = [
    {"id": "instalator_gaze",   "label": "Instalator gaze (autorizat ANRE)", "icon": "Flame"},
    {"id": "electrician",       "label": "Electrician (autorizat ANRE)", "icon": "Zap"},
    {"id": "instalator_sanitar","label": "Instalator sanitar / termic", "icon": "Wrench"},
    {"id": "sudor",             "label": "Sudor autorizat", "icon": "Flame"},
    {"id": "zugrav",            "label": "Zugrav / Vopsitor", "icon": "Brush"},
    {"id": "faiantar",          "label": "Faianțar / Gresiar", "icon": "Square"},
    {"id": "dulgher",           "label": "Dulgher / Tâmplar", "icon": "Hammer"},
    {"id": "zidar",             "label": "Zidar / Tencuitor", "icon": "Building"},
    {"id": "fierar_betonist",   "label": "Fierar betonist", "icon": "GitMerge"},
    {"id": "diriginte_santier", "label": "Diriginte șantier autorizat MDLPA", "icon": "ShieldCheck"},
    {"id": "verificator",       "label": "Verificator atestat (Is, Ie, Re)", "icon": "FileCheck"},
    {"id": "proiectant",        "label": "Proiectant atestat", "icon": "PencilRuler"},
    {"id": "sofer_categoria_c", "label": "Șofer categoria C/E", "icon": "Truck"},
    {"id": "transport_mobila",  "label": "Mutări mobilier + hamali", "icon": "Truck"},
    {"id": "altele",            "label": "Altele (specifică în descriere)", "icon": "MoreHorizontal"},
]


class CraftsmanProfile(BaseModel):
    full_name: str
    specialization: str
    secondary_specializations: List[str] = []
    judete_acoperite: List[str] = []
    description: str
    hourly_rate_ron: Optional[float] = None
    daily_rate_ron: Optional[float] = None
    project_pricing_available: bool = True
    autorizatii: List[str] = []  # ex: ["ANRE-IGN-X", "MDLPA-DS-Y"]
    years_experience: Optional[int] = None
    portfolio_images: List[str] = []
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    available_from: Optional[str] = None  # ISO date
    languages: List[str] = ["RO"]


@router.get("/craftsmen/specializations")
async def craftsmen_specializations():
    return {"specializations": SPECIALIZATIONS}


@router.post("/craftsmen/profile")
async def upsert_profile(payload: CraftsmanProfile, user=Depends(get_current_user)):
    """Un user are 1 singur profil de meseriaș (upsert)."""
    if payload.specialization not in {s["id"] for s in SPECIALIZATIONS}:
        raise HTTPException(400, "Specializare invalidă")
    now = datetime.now(timezone.utc).isoformat()
    existing = await db.craftsmen_profiles.find_one({"owner_id": user.user_id}, {"_id": 0})
    profile_id = existing.get("profile_id") if existing else f"crf_{secrets.token_hex(8)}"
    doc = {
        "profile_id": profile_id,
        "owner_id": user.user_id,
        "owner_email": user.email,
        **payload.model_dump(),
        "rating_avg": existing.get("rating_avg", 0) if existing else 0,
        "rating_count": existing.get("rating_count", 0) if existing else 0,
        "completed_jobs": existing.get("completed_jobs", 0) if existing else 0,
        "verified": existing.get("verified", False) if existing else False,
        "status": "active",
        "created_at": existing.get("created_at", now) if existing else now,
        "updated_at": now,
    }
    await db.craftsmen_profiles.update_one(
        {"owner_id": user.user_id}, {"$set": doc}, upsert=True
    )
    return doc


@router.get("/craftsmen/profiles")
async def search_craftsmen(
    specialization: Optional[str] = None,
    judet: Optional[str] = None,
    min_rating: Optional[float] = None,
    verified_only: bool = False,
    q: Optional[str] = None,
    sort: str = Query("rating", description="rating | recent | experience | rate_asc"),
    limit: int = Query(40, le=100),
    skip: int = 0,
):
    flt: Dict[str, Any] = {"status": "active"}
    if specialization:
        flt["$or"] = [
            {"specialization": specialization},
            {"secondary_specializations": specialization},
        ]
    if judet:
        flt["judete_acoperite"] = judet
    if min_rating is not None:
        flt["rating_avg"] = {"$gte": min_rating}
    if verified_only:
        flt["verified"] = True
    if q:
        flt.setdefault("$or", [])
        flt["$or"].extend([
            {"full_name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ])
    sort_map = {
        "rating": [("rating_avg", -1), ("rating_count", -1)],
        "recent": [("created_at", -1)],
        "experience": [("years_experience", -1)],
        "rate_asc": [("hourly_rate_ron", 1)],
    }
    cur = db.craftsmen_profiles.find(flt, {"_id": 0}).sort(sort_map.get(sort, sort_map["rating"])).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.craftsmen_profiles.count_documents(flt)
    return {"items": items, "total": total}


@router.get("/craftsmen/profiles/{profile_id}")
async def get_craftsman(profile_id: str):
    p = await db.craftsmen_profiles.find_one({"profile_id": profile_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Meseriaș inexistent")
    return p


@router.post("/craftsmen/profiles/{profile_id}/review")
async def review_craftsman(profile_id: str, payload: dict, user=Depends(get_current_user)):
    p = await db.craftsmen_profiles.find_one({"profile_id": profile_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Meseriaș inexistent")
    if p["owner_id"] == user.user_id:
        raise HTTPException(400, "Nu poți review-ui propriul profil")
    rating = float(payload.get("rating", 5))
    rating = max(1, min(5, rating))
    comment = payload.get("comment", "")[:1000]
    review_doc = {
        "review_id": f"rev_{secrets.token_hex(8)}",
        "profile_id": profile_id,
        "reviewer_id": user.user_id,
        "reviewer_email": user.email,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.craftsmen_reviews.insert_one(review_doc)
    # Recalc avg
    all_reviews = await db.craftsmen_reviews.find({"profile_id": profile_id}, {"_id": 0}).to_list(length=10000)
    avg = round(sum(r["rating"] for r in all_reviews) / len(all_reviews), 2)
    await db.craftsmen_profiles.update_one(
        {"profile_id": profile_id},
        {"$set": {"rating_avg": avg, "rating_count": len(all_reviews)}},
    )
    review_doc.pop("_id", None)
    return review_doc


@router.get("/craftsmen/profiles/{profile_id}/reviews")
async def get_reviews(profile_id: str):
    cur = db.craftsmen_reviews.find({"profile_id": profile_id}, {"_id": 0}).sort("created_at", -1).limit(50)
    items = await cur.to_list(length=50)
    return {"items": items, "total": len(items)}


@router.get("/craftsmen/my-profile")
async def my_profile(user=Depends(get_current_user)):
    p = await db.craftsmen_profiles.find_one({"owner_id": user.user_id}, {"_id": 0})
    return {"profile": p}
