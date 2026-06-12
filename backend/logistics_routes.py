"""Logistics & Transport V7.0 — transport mobilier/mutări + transport logistic.

Concept (cerere literală user):
    "transport mobila/mutari, servicii de transport logistic, etc."

Servicii:
- Mutări mobilier (apartament-la-apartament, casă-la-casă)
- Transport marfă (paletizat, vrac)
- Curierat express
- Transport materiale construcții (cherestea, ciment, fier)
- Echipe hamali la cerere

Fiecare anunț are: rută (origine→destinație), tip vehicul, capacitate, preț, disponibilitate.
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


SERVICE_TYPES = [
    {"id": "mutari_locuinta", "label": "Mutări locuință (apartament/casă)", "icon": "Home"},
    {"id": "transport_mobilier", "label": "Transport mobilier individual", "icon": "Sofa"},
    {"id": "transport_marfa_paletizat", "label": "Transport marfă paletizat", "icon": "Package"},
    {"id": "transport_vrac", "label": "Transport vrac (cereale, agregate)", "icon": "Layers"},
    {"id": "transport_materiale_constr", "label": "Transport materiale construcții", "icon": "Truck"},
    {"id": "curierat_express", "label": "Curierat express (max 30 kg)", "icon": "Send"},
    {"id": "hamali", "label": "Echipă hamali la cerere", "icon": "Users"},
    {"id": "transport_special", "label": "Transport agabaritic / special", "icon": "AlertTriangle"},
]

VEHICLE_TYPES = [
    {"id": "duba_3_5t", "label": "Dubă 3.5t (16-20 m³)", "capacity_m3": 18, "capacity_kg": 3500},
    {"id": "camion_7_5t", "label": "Camion 7.5t (~30 m³)", "capacity_m3": 30, "capacity_kg": 7500},
    {"id": "camion_12t", "label": "Camion 12t (50-60 m³)", "capacity_m3": 55, "capacity_kg": 12000},
    {"id": "tir_24t", "label": "TIR 24t (~90 m³)", "capacity_m3": 90, "capacity_kg": 24000},
    {"id": "remorca_basculanta", "label": "Remorcă basculantă (agregate)", "capacity_m3": 15, "capacity_kg": 18000},
    {"id": "duba_frigorifica", "label": "Dubă frigorifică / izoterma", "capacity_m3": 18, "capacity_kg": 3500},
    {"id": "platforma_agabarit", "label": "Platformă agabarit (>2.5m lățime)", "capacity_m3": 100, "capacity_kg": 40000},
]


class LogisticsOffer(BaseModel):
    title: str
    service_type: str
    vehicle_type: str
    description: str
    # Route
    origin_judet: Optional[str] = None
    origin_oras: Optional[str] = None
    destination_judet: Optional[str] = None
    destination_oras: Optional[str] = None
    accepts_any_route: bool = False
    # Pricing
    price_eur: Optional[float] = None
    price_per_km_eur: Optional[float] = None
    price_per_m3_eur: Optional[float] = None
    flat_rate: bool = True
    # Specs
    has_hamali: bool = False
    has_lift: bool = False  # rampă/lift hidraulic
    estimated_km: Optional[float] = None
    available_from: Optional[str] = None
    available_to: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    images: List[str] = []


@router.get("/logistics/service-types")
async def logistics_service_types():
    return {"service_types": SERVICE_TYPES, "vehicle_types": VEHICLE_TYPES}


@router.post("/logistics/offers")
async def create_offer(payload: LogisticsOffer, user=Depends(get_current_user)):
    if payload.service_type not in {s["id"] for s in SERVICE_TYPES}:
        raise HTTPException(400, "Tip serviciu invalid")
    if payload.vehicle_type not in {v["id"] for v in VEHICLE_TYPES}:
        raise HTTPException(400, "Tip vehicul invalid")
    doc = {
        "offer_id": f"lof_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "owner_email": user.email,
        **payload.model_dump(),
        "status": "active",
        "views": 0,
        "bookings_count": 0,
        "rating_avg": 0,
        "rating_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.logistics_offers.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/logistics/offers")
async def list_offers(
    service_type: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    origin_judet: Optional[str] = None,
    destination_judet: Optional[str] = None,
    max_price: Optional[float] = None,
    q: Optional[str] = None,
    limit: int = Query(40, le=100),
    skip: int = 0,
):
    flt: Dict[str, Any] = {"status": "active"}
    if service_type: flt["service_type"] = service_type
    if vehicle_type: flt["vehicle_type"] = vehicle_type
    if origin_judet:
        flt["$or"] = [{"origin_judet": origin_judet}, {"accepts_any_route": True}]
    if destination_judet:
        flt.setdefault("$or", [])
        flt["$or"].extend([{"destination_judet": destination_judet}, {"accepts_any_route": True}])
    if max_price is not None:
        flt["price_eur"] = {"$lte": max_price}
    if q:
        flt.setdefault("$or", [])
        flt["$or"].extend([
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ])
    cur = db.logistics_offers.find(flt, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.logistics_offers.count_documents(flt)
    return {"items": items, "total": total}


@router.get("/logistics/offers/{offer_id}")
async def get_offer(offer_id: str):
    o = await db.logistics_offers.find_one({"offer_id": offer_id}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Ofertă inexistentă")
    await db.logistics_offers.update_one({"offer_id": offer_id}, {"$inc": {"views": 1}})
    return o


@router.post("/logistics/offers/{offer_id}/book")
async def book_offer(offer_id: str, payload: dict, user=Depends(get_current_user)):
    o = await db.logistics_offers.find_one({"offer_id": offer_id}, {"_id": 0})
    if not o:
        raise HTTPException(404, "Ofertă inexistentă")
    booking = {
        "booking_id": f"lbk_{secrets.token_hex(8)}",
        "offer_id": offer_id,
        "owner_id": o["owner_id"],
        "requester_id": user.user_id,
        "requester_email": user.email,
        "pickup_date": payload.get("pickup_date"),
        "pickup_address": payload.get("pickup_address"),
        "delivery_address": payload.get("delivery_address"),
        "estimated_volume_m3": payload.get("estimated_volume_m3"),
        "notes": (payload.get("notes") or "")[:1000],
        "status": "pending",  # pending | accepted | rejected | completed
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.logistics_bookings.insert_one(booking)
    await db.logistics_offers.update_one({"offer_id": offer_id}, {"$inc": {"bookings_count": 1}})
    booking.pop("_id", None)
    return booking
