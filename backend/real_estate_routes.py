"""Real Estate (Anunțuri imobiliare) V7.0 — platforma copie după Imobiliare.ro / OLX Imobiliare.

Concept (cerere literală user):
    "sa fie platforma copie pentru incarcari anunturi imobiliare
     inspirandu-te din paginile existente de anunturi imobiliare si platforme
     de gazduire a acestora si sa aiba serviciile lor"

Servicii implementate (inspirat din Imobiliare.ro, Storia, OLX, Olxhouse):
- Anunțuri Vânzare + Închiriere
- 4 tipuri property: apartament, casă/vilă, teren, spațiu comercial
- Filtre: preț, suprafață, camere, județ, oraș, an construcție
- Galerie foto + tour virtual link
- Calculator credit ipotecar simplificat
- Statistici per anunț (views, contact-uri)
- Promovare premium (boost) — integrare smart_pricing
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


PROPERTY_TYPES = [
    {"id": "apartament", "label": "Apartament", "icon": "Building2"},
    {"id": "casa",       "label": "Casă / Vilă", "icon": "Home"},
    {"id": "teren",      "label": "Teren", "icon": "Trees"},
    {"id": "comercial",  "label": "Spațiu comercial / birou", "icon": "Store"},
    {"id": "industrial", "label": "Spațiu industrial / hală", "icon": "Factory"},
]
TRANSACTION_TYPES = [
    {"id": "vanzare",   "label": "Vânzare"},
    {"id": "inchiriere", "label": "Închiriere lună"},
    {"id": "regim_hotelier", "label": "Regim hotelier (noapte)"},
]


class Property(BaseModel):
    title: str
    description: str
    property_type: str   # apartament/casa/teren/comercial/industrial
    transaction_type: str # vanzare/inchiriere/regim_hotelier
    price_eur: float
    currency: str = "EUR"
    # location
    judet: str
    oras: str
    cartier: Optional[str] = None
    strada: Optional[str] = None
    nr: Optional[str] = None
    # property specs
    surface_m2: float
    rooms: Optional[int] = None
    bathrooms: Optional[int] = None
    floor: Optional[str] = None  # "Parter", "1", "Mansardă"
    year_built: Optional[int] = None
    comfort: Optional[str] = None  # Lux | I | II | III
    energy_class: Optional[str] = None  # A++ ... G
    has_gas: bool = False
    has_central_heating: bool = False
    has_garage: bool = False
    has_balcony: bool = False
    images: List[str] = []  # data URLs / URL-uri externe
    virtual_tour_url: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    contact_name: Optional[str] = None
    available_from: Optional[str] = None  # ISO date


@router.get("/real-estate/property-types")
async def property_types():
    return {"property_types": PROPERTY_TYPES, "transaction_types": TRANSACTION_TYPES}


@router.post("/real-estate/properties")
async def create_property(payload: Property, user=Depends(get_current_user)):
    if payload.property_type not in {p["id"] for p in PROPERTY_TYPES}:
        raise HTTPException(400, "Tip proprietate invalid")
    if payload.transaction_type not in {t["id"] for t in TRANSACTION_TYPES}:
        raise HTTPException(400, "Tip tranzacție invalid")
    if payload.price_eur < 0 or payload.surface_m2 <= 0:
        raise HTTPException(400, "Preț sau suprafață invalide")
    doc = {
        "property_id": f"prop_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "owner_email": user.email,
        **payload.model_dump(),
        "status": "active",
        "boosted_until": None,
        "views": 0,
        "contacts": 0,
        "favorites": 0,
        "price_per_m2_eur": round(payload.price_eur / payload.surface_m2, 2),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.real_estate_properties.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/real-estate/properties")
async def list_properties(
    property_type: Optional[str] = None,
    transaction_type: Optional[str] = None,
    judet: Optional[str] = None,
    oras: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_surface: Optional[float] = None,
    max_surface: Optional[float] = None,
    rooms: Optional[int] = None,
    q: Optional[str] = None,
    sort: str = Query("recent", description="recent | price_asc | price_desc | surface_desc | boosted"),
    limit: int = Query(40, le=100),
    skip: int = 0,
):
    flt: Dict[str, Any] = {"status": "active"}
    if property_type: flt["property_type"] = property_type
    if transaction_type: flt["transaction_type"] = transaction_type
    if judet: flt["judet"] = judet
    if oras: flt["oras"] = {"$regex": oras, "$options": "i"}
    if min_price is not None or max_price is not None:
        flt["price_eur"] = {}
        if min_price is not None: flt["price_eur"]["$gte"] = min_price
        if max_price is not None: flt["price_eur"]["$lte"] = max_price
    if min_surface is not None or max_surface is not None:
        flt["surface_m2"] = {}
        if min_surface is not None: flt["surface_m2"]["$gte"] = min_surface
        if max_surface is not None: flt["surface_m2"]["$lte"] = max_surface
    if rooms is not None: flt["rooms"] = rooms
    if q:
        flt["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"cartier": {"$regex": q, "$options": "i"}},
        ]
    sort_map = {
        "recent": [("created_at", -1)],
        "price_asc": [("price_eur", 1)],
        "price_desc": [("price_eur", -1)],
        "surface_desc": [("surface_m2", -1)],
        "boosted": [("boosted_until", -1), ("created_at", -1)],
    }
    cur = db.real_estate_properties.find(flt, {"_id": 0}).sort(sort_map.get(sort, sort_map["recent"])).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.real_estate_properties.count_documents(flt)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/real-estate/properties/{property_id}")
async def get_property(property_id: str):
    doc = await db.real_estate_properties.find_one({"property_id": property_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Proprietate inexistentă")
    await db.real_estate_properties.update_one({"property_id": property_id}, {"$inc": {"views": 1}})
    return doc


@router.post("/real-estate/properties/{property_id}/contact")
async def contact_owner(property_id: str, payload: dict, user=Depends(get_current_user)):
    """Trimite o cerere de contact către proprietar (înregistrează în DB pentru notificări)."""
    p = await db.real_estate_properties.find_one({"property_id": property_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Proprietate inexistentă")
    msg = (payload or {}).get("message", "")[:1000]
    contact_doc = {
        "contact_id": f"rcct_{secrets.token_hex(6)}",
        "property_id": property_id,
        "owner_id": p["owner_id"],
        "requester_id": user.user_id,
        "requester_email": user.email,
        "message": msg,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.real_estate_contacts.insert_one(contact_doc)
    await db.real_estate_properties.update_one({"property_id": property_id}, {"$inc": {"contacts": 1}})
    contact_doc.pop("_id", None)
    return contact_doc


@router.get("/real-estate/my-properties")
async def my_properties(user=Depends(get_current_user)):
    cur = db.real_estate_properties.find({"owner_id": user.user_id}, {"_id": 0}).sort("created_at", -1)
    items = await cur.to_list(length=200)
    return {"items": items, "total": len(items)}


@router.delete("/real-estate/properties/{property_id}")
async def delete_property(property_id: str, user=Depends(get_current_user)):
    res = await db.real_estate_properties.delete_one({"property_id": property_id, "owner_id": user.user_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Proprietate inexistentă sau nu îți aparține")
    return {"deleted": True}


@router.post("/real-estate/mortgage-calculator")
async def mortgage_calculator(payload: dict):
    """Calculator credit ipotecar simplificat — rate fixe lunare.
    Input: price_eur, down_payment_eur, term_years, annual_rate_pct (default 7.5%).
    """
    price = float(payload.get("price_eur", 0))
    down = float(payload.get("down_payment_eur", 0))
    term_years = float(payload.get("term_years", 30))
    annual_rate = float(payload.get("annual_rate_pct", 7.5))
    loan = max(0.0, price - down)
    n = term_years * 12
    if n <= 0:
        return {"loan_eur": loan, "monthly_payment_eur": loan, "total_paid_eur": loan, "total_interest_eur": 0}
    r = (annual_rate / 100) / 12
    if r == 0:
        monthly = loan / n
    else:
        monthly = loan * (r * (1 + r) ** n) / (((1 + r) ** n) - 1)
    total = monthly * n
    return {
        "loan_eur": round(loan, 2),
        "monthly_payment_eur": round(monthly, 2),
        "total_paid_eur": round(total, 2),
        "total_interest_eur": round(total - loan, 2),
        "n_payments": int(n),
        "annual_rate_pct": annual_rate,
    }
