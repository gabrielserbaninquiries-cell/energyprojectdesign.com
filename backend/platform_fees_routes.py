"""Platform Fees & Boosts & Transactions V7.3 — sistemul de monetizare real.

Cerere literală user (mesaj 19):
    "Tarifeaza functiile cheie ale site-ului, precum, comision vanzari imobiliare
    sau taxa de administrare anunt. Listare gratuita anunt, dar taxa per
    tranzactie in site, etc."

Politica de tarifare (transparentă, publică, comparabilă cu Imobiliare.ro / OLX):

LISTING — gratuit pe Marketplace, Imobiliare, Forum, Servicii, Logistică
BOOSTS — promovare anunț (opțional):
  · Featured 7 zile        =  5 EUR
  · Featured 30 zile       = 15 EUR
  · Top of Home (1 săpt.)  = 29 EUR
TRANSACTION FEES — la finalizare succes (taxă per tranzacție):
  · Marketplace vânzare         = 3% (min 0.50 EUR)
  · Imobiliare vânzare          = 0.5% vânzător + 0.5% cumpărător (total 1%) — INFERIOR pieței (3-6%)
  · Imobiliare închiriere lună  = 50% din prima chirie (one-time, plătită de chiriaș)
  · Servicii meseriași          = 5% din valoarea acceptată (din partea meseriașului)
  · Logistică                   = 5% din valoarea transportului (din partea transportatorului)
SUBSCRIPTIONS — planuri lunare (vezi roles_pages_matrix + plans.py)
PUBLIC FEE PAGE — /comisioane-tarife
"""
from __future__ import annotations
import secrets
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
from db import db

router = APIRouter()


# ============================================================================
# Tarife (publice + read-only) — sursa unică de adevăr
# ============================================================================
FEE_SCHEDULE = {
    "marketplace": {
        "label": "Marketplace ad-hoc",
        "listing_fee_eur": 0,
        "transaction_fee_pct": 3.0,
        "transaction_fee_min_eur": 0.50,
        "boost_options": [
            {"id": "feat_7d", "label": "Featured 7 zile", "price_eur": 5},
            {"id": "feat_30d", "label": "Featured 30 zile", "price_eur": 15},
            {"id": "top_home_7d", "label": "Top of Home 7 zile", "price_eur": 29},
        ],
    },
    "imobiliare_vanzare": {
        "label": "Imobiliare — Vânzare",
        "listing_fee_eur": 0,
        "transaction_fee_pct_seller": 0.5,
        "transaction_fee_pct_buyer": 0.5,
        "transaction_fee_min_eur": 50,
        "competitor_avg_pct": 3.0,
        "savings_note": "Comparativ cu agenții (3-6%), economisești până la 5%.",
        "boost_options": [
            {"id": "feat_7d", "label": "Featured 7 zile", "price_eur": 9},
            {"id": "feat_30d", "label": "Featured 30 zile", "price_eur": 29},
            {"id": "top_home_7d", "label": "Top of Home 7 zile", "price_eur": 59},
            {"id": "virtual_tour", "label": "Tour virtual integrat (one-time)", "price_eur": 49},
        ],
    },
    "imobiliare_inchiriere": {
        "label": "Imobiliare — Închiriere",
        "listing_fee_eur": 0,
        "transaction_fee_pct_first_rent": 50.0,
        "transaction_fee_payer": "chiriaș",
        "competitor_avg_pct": 100.0,
        "savings_note": "Comparativ cu agenții (100% prima chirie), economisești 50%.",
        "boost_options": [
            {"id": "feat_7d", "label": "Featured 7 zile", "price_eur": 5},
            {"id": "feat_30d", "label": "Featured 30 zile", "price_eur": 15},
        ],
    },
    "servicii_meseriasi": {
        "label": "Servicii Meseriași",
        "listing_fee_eur": 0,
        "transaction_fee_pct": 5.0,
        "transaction_fee_payer": "meseriaș (provider)",
        "transaction_fee_min_eur": 5,
        "boost_options": [
            {"id": "verified_badge", "label": "Verified Badge (lifetime)", "price_eur": 19},
            {"id": "feat_30d", "label": "Featured 30 zile", "price_eur": 9},
            {"id": "top_specialization", "label": "Top specializare 30 zile", "price_eur": 29},
        ],
    },
    "logistica": {
        "label": "Logistică & Transport",
        "listing_fee_eur": 0,
        "transaction_fee_pct": 5.0,
        "transaction_fee_payer": "transportator (provider)",
        "transaction_fee_min_eur": 5,
        "boost_options": [
            {"id": "feat_30d", "label": "Featured 30 zile", "price_eur": 9},
            {"id": "top_route_7d", "label": "Top rută 7 zile", "price_eur": 14},
        ],
    },
    "forum": {
        "label": "Forum + Grup Anunțuri",
        "listing_fee_eur": 0,
        "transaction_fee_pct": 0,
        "boost_options": [
            {"id": "pin_topic_7d", "label": "Pin topic 7 zile", "price_eur": 9},
            {"id": "pin_topic_30d", "label": "Pin topic 30 zile", "price_eur": 19},
            {"id": "homepage_announcement_7d", "label": "Anunț pe Home 7 zile", "price_eur": 29},
        ],
    },
    "documentatie": {
        "label": "Documentație Tehnică (abonament)",
        "listing_fee_eur": 0,
        "subscription_required": True,
        "subscription_plans": ["basic", "operator", "proiectant", "executant", "avize",
                               "ofertare", "contabilitate", "vgd", "rte", "societate"],
        "savings_note": "Subscription model — 49-349€/lună acoperă tot departamentul.",
    },
}


@router.get("/fees/schedule")
async def get_fee_schedule():
    """Public — returnează schema completă de tarife pentru pagina /comisioane-tarife."""
    return {"schedule": FEE_SCHEDULE, "currency": "EUR"}


# ============================================================================
# Boost system — utilizatorii pot cumpăra boost-uri pentru anunțurile lor
# ============================================================================
class BoostPurchase(BaseModel):
    target_type: str  # marketplace_listing | property | offer | profile | topic
    target_id: str
    boost_id: str
    payment_method: str = "stripe"  # stripe | wire | credit_balance


@router.post("/boosts/purchase")
async def purchase_boost(payload: BoostPurchase, user=Depends(get_current_user)):
    """Cumpără un boost. Doar marcăm intenția — Stripe checkout e separat
    (utilizator finalizează la /api/billing/checkout)."""
    # Find the matching schedule + boost option
    matching_schedule = None
    matching_boost = None
    for cat_id, cat in FEE_SCHEDULE.items():
        for b in cat.get("boost_options", []):
            if b["id"] == payload.boost_id:
                matching_schedule = cat
                matching_boost = b
                break
        if matching_boost:
            break
    if not matching_boost:
        raise HTTPException(404, f"Boost necunoscut: {payload.boost_id}")

    # Compute expiration based on boost id pattern (7d / 30d / lifetime)
    bid = payload.boost_id
    if "lifetime" in bid or bid in ("verified_badge",):
        expires_at = None
    elif "_7d" in bid or "_7days" in bid:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    elif "_30d" in bid or "_30days" in bid:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    elif "virtual_tour" in bid:
        expires_at = None  # one-time service
    else:
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    doc = {
        "boost_id_db": f"bst_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "owner_email": user.email,
        "target_type": payload.target_type,
        "target_id": payload.target_id,
        "boost_type": payload.boost_id,
        "boost_label": matching_boost["label"],
        "price_eur": matching_boost["price_eur"],
        "payment_method": payload.payment_method,
        "status": "pending_payment",  # pending_payment | active | expired | refunded
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.platform_boosts.insert_one(doc)

    # In dev mode: auto-activate (skip real payment). Real Stripe webhook would do this.
    if payload.payment_method == "credit_balance" or getattr(user, "is_developer", False):
        await db.platform_boosts.update_one(
            {"boost_id_db": doc["boost_id_db"]}, {"$set": {"status": "active"}}
        )
        doc["status"] = "active"

    doc.pop("_id", None)
    return {
        "boost": doc,
        "checkout_url": f"/billing/checkout?boost_db_id={doc['boost_id_db']}&amount={matching_boost['price_eur']}",
        "next_action": "Redirect către checkout Stripe pentru finalizare plată" if doc["status"] == "pending_payment" else "Boost activ imediat",
    }


@router.get("/boosts/my")
async def my_boosts(user=Depends(get_current_user)):
    """Listează boost-urile cumpărate de userul curent."""
    cur = db.platform_boosts.find(
        {"owner_id": user.user_id}, {"_id": 0}
    ).sort("created_at", -1).limit(100)
    items = await cur.to_list(length=100)
    # Compute active status
    now_iso = datetime.now(timezone.utc).isoformat()
    for it in items:
        exp = it.get("expires_at")
        if exp and exp < now_iso and it.get("status") == "active":
            it["status"] = "expired"
    return {"items": items, "total": len(items)}


@router.get("/boosts/check/{target_type}/{target_id}")
async def check_boost(target_type: str, target_id: str):
    """Verifică dacă un anunț are boost activ (folosit de UI pentru a afișa badge)."""
    now_iso = datetime.now(timezone.utc).isoformat()
    boost = await db.platform_boosts.find_one(
        {
            "target_type": target_type,
            "target_id": target_id,
            "status": "active",
            "$or": [{"expires_at": None}, {"expires_at": {"$gt": now_iso}}],
        },
        {"_id": 0},
    )
    return {"boosted": bool(boost), "boost": boost}


# ============================================================================
# Transaction fee tracking — la finalizarea unei tranzacții
# ============================================================================
class TransactionFeeRequest(BaseModel):
    category: str  # marketplace | imobiliare_vanzare | imobiliare_inchiriere | servicii | logistica
    transaction_amount_eur: float
    counterparty_id: Optional[str] = None
    description: Optional[str] = None
    listing_id: Optional[str] = None


@router.post("/transactions/compute-fee")
async def compute_fee(payload: TransactionFeeRequest):
    """Calculează taxa per tranzacție fără a o încasa — util pentru UI preview."""
    cat = FEE_SCHEDULE.get(payload.category)
    if not cat:
        raise HTTPException(400, f"Categorie necunoscută: {payload.category}")
    amount = max(0.0, payload.transaction_amount_eur)
    fee = 0.0
    breakdown: List[Dict[str, Any]] = []

    if payload.category == "marketplace":
        fee = max(amount * cat["transaction_fee_pct"] / 100, cat["transaction_fee_min_eur"])
        breakdown.append({"type": "platform_fee_3pct", "amount": round(fee, 2)})
    elif payload.category == "imobiliare_vanzare":
        seller = max(amount * cat["transaction_fee_pct_seller"] / 100, cat["transaction_fee_min_eur"])
        buyer = max(amount * cat["transaction_fee_pct_buyer"] / 100, cat["transaction_fee_min_eur"])
        fee = seller + buyer
        breakdown.append({"type": "seller_fee_0.5pct", "amount": round(seller, 2)})
        breakdown.append({"type": "buyer_fee_0.5pct", "amount": round(buyer, 2)})
    elif payload.category == "imobiliare_inchiriere":
        fee = amount * cat["transaction_fee_pct_first_rent"] / 100
        breakdown.append({"type": "tenant_fee_50pct_first_rent", "amount": round(fee, 2)})
    elif payload.category in ("servicii_meseriasi", "logistica"):
        fee = max(amount * cat["transaction_fee_pct"] / 100, cat["transaction_fee_min_eur"])
        breakdown.append({"type": f"{payload.category}_fee_5pct", "amount": round(fee, 2)})

    return {
        "category": payload.category,
        "label": cat.get("label"),
        "transaction_amount_eur": round(amount, 2),
        "fee_eur": round(fee, 2),
        "net_eur": round(amount - fee, 2),
        "fee_payer": cat.get("transaction_fee_payer", "vânzător"),
        "breakdown": breakdown,
    }


@router.post("/transactions/record")
async def record_transaction(payload: TransactionFeeRequest, user=Depends(get_current_user)):
    """Înregistrează o tranzacție finalizată cu taxa aferentă (pentru audit + facturare)."""
    fee_calc = await compute_fee(payload)
    doc = {
        "transaction_id": f"trx_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "counterparty_id": payload.counterparty_id,
        "category": payload.category,
        "listing_id": payload.listing_id,
        "description": payload.description,
        "transaction_amount_eur": fee_calc["transaction_amount_eur"],
        "fee_eur": fee_calc["fee_eur"],
        "net_eur": fee_calc["net_eur"],
        "fee_breakdown": fee_calc["breakdown"],
        "status": "recorded",  # recorded | invoiced | paid
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.platform_transactions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/transactions/my")
async def my_transactions(user=Depends(get_current_user)):
    cur = db.platform_transactions.find(
        {"$or": [{"owner_id": user.user_id}, {"counterparty_id": user.user_id}]},
        {"_id": 0},
    ).sort("created_at", -1).limit(200)
    items = await cur.to_list(length=200)
    return {"items": items, "total": len(items)}


@router.get("/transactions/stats")
async def platform_transaction_stats():
    """Statistici globale (anonime) — pentru pagina marketing."""
    total = await db.platform_transactions.count_documents({})
    pipeline = [{"$group": {"_id": "$category", "count": {"$sum": 1}, "total_eur": {"$sum": "$transaction_amount_eur"}, "total_fees_eur": {"$sum": "$fee_eur"}}}]
    aggr = await db.platform_transactions.aggregate(pipeline).to_list(length=20)
    return {"total_transactions": total, "by_category": aggr}
