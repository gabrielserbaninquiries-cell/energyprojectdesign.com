"""Marketplace ad-hoc V7.0 — vânzări produse/servicii tehnice între utilizatori.

Concept (cerere literală user):
    "Sa aiba marketplace pentru vanzari ad-hoc"

Orice utilizator poate publica un anunț de vânzare (țeavă PE rămasă,
echipament second-hand, servicii proiectare/execuție, kit-uri DIY,
template DOCX gata făcute, cursuri).

Categorii: materiale, echipamente, servicii, ștampile/template, software/cursuri.
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


CATEGORIES = [
    {"id": "materiale",   "label": "Materiale (țeavă, fitting, izolație, nisip)", "icon": "Package"},
    {"id": "echipamente", "label": "Echipamente (regulatori, contoare, robineți, aparate)", "icon": "Wrench"},
    {"id": "servicii",    "label": "Servicii (proiectare, execuție, consultanță, VGD)", "icon": "Briefcase"},
    {"id": "stampile",    "label": "Ștampile / Template DOCX gata", "icon": "Stamp"},
    {"id": "software",    "label": "Software / Cursuri / Tutoriale", "icon": "GraduationCap"},
    {"id": "scule",       "label": "Scule / Unelte profesionale", "icon": "Hammer"},
    {"id": "altele",      "label": "Altele", "icon": "MoreHorizontal"},
]


class Listing(BaseModel):
    title: str
    description: str
    category: str
    price_eur: float
    currency: str = "EUR"
    location: Optional[str] = None
    images: List[str] = []  # data URLs base64
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    tags: List[str] = []
    industry: Optional[str] = None  # gaze, electric, apa_canal etc.
    quantity: Optional[str] = None
    condition: Optional[str] = "Nou"  # Nou | Folosit | Demontat | Stoc final


@router.get("/marketplace/categories")
async def marketplace_categories():
    return {"categories": CATEGORIES}


@router.post("/marketplace/listings")
async def create_listing(payload: Listing, user=Depends(get_current_user)):
    if payload.category not in {c["id"] for c in CATEGORIES}:
        raise HTTPException(400, "Categorie invalidă")
    if payload.price_eur < 0:
        raise HTTPException(400, "Preț invalid")
    doc = {
        "listing_id": f"mlst_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "owner_email": user.email,
        **payload.model_dump(),
        "status": "active",
        "views": 0,
        "favorites": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.marketplace_v2_listings.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/marketplace/listings")
async def list_listings(
    category: Optional[str] = None,
    industry: Optional[str] = None,
    q: Optional[str] = Query(None, description="full-text search title+description"),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Query(50, le=100),
    skip: int = 0,
):
    flt: Dict[str, Any] = {"status": "active"}
    if category: flt["category"] = category
    if industry: flt["industry"] = industry
    if min_price is not None or max_price is not None:
        flt["price_eur"] = {}
        if min_price is not None: flt["price_eur"]["$gte"] = min_price
        if max_price is not None: flt["price_eur"]["$lte"] = max_price
    if q:
        flt["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    cur = db.marketplace_v2_listings.find(flt, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.marketplace_v2_listings.count_documents(flt)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/marketplace/listings/{listing_id}")
async def get_listing(listing_id: str):
    doc = await db.marketplace_v2_listings.find_one({"listing_id": listing_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Anunț inexistent")
    await db.marketplace_v2_listings.update_one({"listing_id": listing_id}, {"$inc": {"views": 1}})
    return doc


@router.delete("/marketplace/listings/{listing_id}")
async def delete_listing(listing_id: str, user=Depends(get_current_user)):
    res = await db.marketplace_v2_listings.delete_one({"listing_id": listing_id, "owner_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Anunț inexistent sau nu îți aparține")
    return {"deleted": True}


@router.post("/marketplace/listings/{listing_id}/favorite")
async def favorite_listing(listing_id: str, user=Depends(get_current_user)):
    res = await db.marketplace_v2_listings.update_one(
        {"listing_id": listing_id}, {"$inc": {"favorites": 1}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Anunț inexistent")
    return {"favorited": True}


@router.get("/marketplace/my-listings")
async def my_listings(user=Depends(get_current_user)):
    cur = db.marketplace_v2_listings.find({"owner_id": user.user_id}, {"_id": 0}).sort("created_at", -1)
    items = await cur.to_list(length=200)
    return {"items": items, "total": len(items)}
