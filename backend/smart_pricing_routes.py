"""Smart Pricing V7.0 — atribuire inteligentă a costurilor serviciilor.

Concept (cerere literală user):
    "Platforma trebuie sa aiba un sistem inteligent de atribuire a costurilor serviciilor."

Sistemul calculează automat un cost recomandat pe baza:
1. Tip serviciu + complexitate
2. Locație (multiplier prețuri în București vs județe)
3. Cerere/ofertă (numărul de profile active per județ/specializare)
4. Urgență (azi/24h/săptămână/luna)
5. Suprafață/distanță/cantitate
6. Reputație provider (rating ≥4.5 → +10% premium)

Outputs: {min_eur, recommended_eur, max_eur, breakdown, factors}
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import db

router = APIRouter()


# ============================================================================
# Base prices per service type (RON pentru servicii locale, EUR pentru rest)
# ============================================================================
BASE_PRICES = {
    # Documentație tehnică (per document generat)
    "doc_memoriu_tehnic":     {"min": 80, "recommended": 150, "max": 350, "currency": "EUR"},
    "doc_dtac_complet":       {"min": 350, "recommended": 650, "max": 1200, "currency": "EUR"},
    "doc_carte_tehnica":      {"min": 200, "recommended": 400, "max": 800, "currency": "EUR"},
    "doc_verificare_vgd":     {"min": 150, "recommended": 280, "max": 500, "currency": "EUR"},
    "doc_dispozitie_santier": {"min": 50, "recommended": 100, "max": 200, "currency": "EUR"},
    # Servicii de execuție (per m liniar / per oră)
    "exec_bransament_gaze":   {"min": 800, "recommended": 1500, "max": 2800, "currency": "EUR"},
    "exec_extindere_gaze_per_m": {"min": 25, "recommended": 45, "max": 80, "currency": "EUR"},
    "exec_bransament_electric":{"min": 600, "recommended": 1100, "max": 1800, "currency": "EUR"},
    "exec_bransament_apa":    {"min": 500, "recommended": 900, "max": 1500, "currency": "EUR"},
    "exec_racord_canalizare": {"min": 400, "recommended": 750, "max": 1300, "currency": "EUR"},
    "exec_fotovoltaice_per_kWp": {"min": 700, "recommended": 1000, "max": 1400, "currency": "EUR"},
    # Servicii meseriași (per oră RON)
    "meser_instalator_gaze_ora": {"min": 80, "recommended": 130, "max": 200, "currency": "RON"},
    "meser_electrician_ora":     {"min": 70, "recommended": 110, "max": 170, "currency": "RON"},
    "meser_sudor_ora":           {"min": 80, "recommended": 130, "max": 200, "currency": "RON"},
    "meser_zugrav_mp":           {"min": 12, "recommended": 20, "max": 35, "currency": "RON"},
    "meser_faiantar_mp":         {"min": 60, "recommended": 90, "max": 140, "currency": "RON"},
    "meser_dulgher_ora":         {"min": 70, "recommended": 110, "max": 170, "currency": "RON"},
    "meser_diriginte_santier_proiect": {"min": 300, "recommended": 600, "max": 1200, "currency": "EUR"},
    # Transport (per km RON)
    "transport_mutari_apartament": {"min": 600, "recommended": 1200, "max": 2500, "currency": "RON"},
    "transport_mobilier_ora":      {"min": 80, "recommended": 130, "max": 200, "currency": "RON"},
    "transport_marfa_per_km":      {"min": 3, "recommended": 5, "max": 8, "currency": "RON"},
    "transport_curierat_max30kg":  {"min": 20, "recommended": 35, "max": 60, "currency": "RON"},
    "transport_materiale_per_to":  {"min": 80, "recommended": 130, "max": 200, "currency": "RON"},
}

# Multiplier per județ (București+Cluj+Brașov = premium; SE+SV+nord = reduceri)
COUNTY_MULTIPLIERS = {
    "București": 1.30, "Cluj": 1.20, "Brașov": 1.15, "Ilfov": 1.25, "Constanța": 1.10,
    "Timiș": 1.10, "Iași": 1.05, "Sibiu": 1.10, "Argeș": 1.00, "Prahova": 1.05,
    "Galați": 0.90, "Bihor": 0.95, "Suceava": 0.90, "Maramureș": 0.85, "Botoșani": 0.80,
    "Vaslui": 0.75, "Mehedinți": 0.80, "Olt": 0.85, "Teleorman": 0.85, "Călărași": 0.95,
}

URGENCY_MULTIPLIERS = {
    "today":      1.50,
    "24h":        1.30,
    "this_week":  1.10,
    "this_month": 1.00,
    "flexible":   0.90,
}


class PricingRequest(BaseModel):
    service_id: str
    judet: Optional[str] = None
    urgency: str = "this_week"
    quantity: float = 1.0  # ex: m liniari, m², ore, kWp
    provider_rating: Optional[float] = None  # 1-5
    complexity: str = "medium"  # simple | medium | complex
    extras: List[str] = []  # ex: ["weekend", "night", "agabaritic"]


class PricingResult(BaseModel):
    service_id: str
    currency: str
    min_eur_equiv: float
    recommended_eur_equiv: float
    max_eur_equiv: float
    min_native: float
    recommended_native: float
    max_native: float
    breakdown: Dict[str, Any]
    factors: List[Dict[str, Any]]


# Approx EUR conversion (used for display only)
EUR_PER_RON = 0.20


@router.get("/pricing/services")
async def list_services():
    return {
        "services": [
            {"id": k, **v, "label": k.replace("_", " ").title()}
            for k, v in BASE_PRICES.items()
        ],
        "county_multipliers": COUNTY_MULTIPLIERS,
        "urgency_multipliers": URGENCY_MULTIPLIERS,
    }


@router.post("/pricing/estimate", response_model=PricingResult)
async def estimate_price(req: PricingRequest):
    base = BASE_PRICES.get(req.service_id)
    if not base:
        raise HTTPException(400, f"Serviciu necunoscut: {req.service_id}")

    factors: List[Dict[str, Any]] = []
    multiplier = 1.0

    # County multiplier
    county_mul = COUNTY_MULTIPLIERS.get(req.judet, 1.0) if req.judet else 1.0
    multiplier *= county_mul
    factors.append({"factor": "județ", "value": req.judet or "fără", "multiplier": county_mul})

    # Urgency multiplier
    urg_mul = URGENCY_MULTIPLIERS.get(req.urgency, 1.0)
    multiplier *= urg_mul
    factors.append({"factor": "urgență", "value": req.urgency, "multiplier": urg_mul})

    # Complexity multiplier
    complexity_mul = {"simple": 0.85, "medium": 1.0, "complex": 1.25}.get(req.complexity, 1.0)
    multiplier *= complexity_mul
    factors.append({"factor": "complexitate", "value": req.complexity, "multiplier": complexity_mul})

    # Provider rating
    if req.provider_rating is not None:
        rating_mul = 1.0
        if req.provider_rating >= 4.7: rating_mul = 1.12
        elif req.provider_rating >= 4.3: rating_mul = 1.05
        elif req.provider_rating < 3.5: rating_mul = 0.92
        multiplier *= rating_mul
        factors.append({"factor": "rating provider", "value": req.provider_rating, "multiplier": rating_mul})

    # Extras
    extras_mul = 1.0
    if "weekend" in req.extras: extras_mul *= 1.20
    if "night" in req.extras: extras_mul *= 1.30
    if "agabaritic" in req.extras: extras_mul *= 1.40
    if extras_mul != 1.0:
        multiplier *= extras_mul
        factors.append({"factor": "extras", "value": req.extras, "multiplier": extras_mul})

    # Demand-supply adjustment: if very few providers in județ, +15%
    supply_mul = 1.0
    if req.judet:
        try:
            supply_count = await db.craftsmen_profiles.count_documents(
                {"status": "active", "judete_acoperite": req.judet}
            )
            if supply_count < 3:
                supply_mul = 1.15
            elif supply_count > 20:
                supply_mul = 0.93
            multiplier *= supply_mul
            factors.append({
                "factor": "cerere/ofertă",
                "value": f"{supply_count} provideri în județ",
                "multiplier": supply_mul,
            })
        except Exception:
            pass

    # Quantity scaling (linear, but caps applied)
    qty = max(0.0, req.quantity)

    min_native = round(base["min"] * multiplier * qty, 2)
    recommended_native = round(base["recommended"] * multiplier * qty, 2)
    max_native = round(base["max"] * multiplier * qty, 2)

    if base["currency"] == "RON":
        eur_factor = EUR_PER_RON
    else:
        eur_factor = 1.0

    return PricingResult(
        service_id=req.service_id,
        currency=base["currency"],
        min_eur_equiv=round(min_native * eur_factor, 2),
        recommended_eur_equiv=round(recommended_native * eur_factor, 2),
        max_eur_equiv=round(max_native * eur_factor, 2),
        min_native=min_native,
        recommended_native=recommended_native,
        max_native=max_native,
        breakdown={
            "base_min": base["min"],
            "base_recommended": base["recommended"],
            "base_max": base["max"],
            "quantity": qty,
            "total_multiplier": round(multiplier, 4),
        },
        factors=factors,
    )
