"""Payment accounts module — manages the list of receiving bank accounts the
platform shows to customers as payment destinations.

Two payment paths coexist:
  1. Stripe Checkout (existing) — credit card; settles in user's Stripe balance,
     which later payouts to the connected bank account configured in Stripe.
  2. SEPA / Wire bank transfer — buyer pays directly into the IBAN shown below
     using their banking app. Slower (1-3 business days) but funds arrive
     directly in the destination account with NO intermediary.

Admin-only CRUD (dragosserban95@gmail.com): backend/server.py endpoints under
/api/admin/payment-accounts.

Public read of the currently active account: /api/payment-accounts/active —
shown to anyone on the Pricing / Checkout page as a bank-transfer option.
"""
import os
from typing import Dict, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from db import db


class PaymentAccount(BaseModel):
    account_id: str
    account_holder: str
    iban: str  # ex: "RO22 REVO 0000 1555 6872 4293"
    swift_bic: Optional[str] = None  # ex: "REVOROBB"
    bank_name: str
    currency: str = "EUR"
    status: str = "TEST"  # TEST | LIVE | DISABLED
    is_active: bool = True  # only one should be is_active=True per status
    notes: Optional[str] = None
    created_at: str
    updated_at: str


class PaymentAccountIn(BaseModel):
    account_holder: str = Field(..., min_length=2)
    iban: str = Field(..., min_length=10)
    swift_bic: Optional[str] = None
    bank_name: str = Field(..., min_length=2)
    currency: str = "EUR"
    status: str = "TEST"
    is_active: bool = True
    notes: Optional[str] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_iban(iban: str) -> str:
    return "".join(iban.split()).upper()


async def list_accounts(include_disabled: bool = False) -> List[Dict]:
    q = {} if include_disabled else {"status": {"$ne": "DISABLED"}}
    docs = await db.payment_accounts.find(q, {"_id": 0}).sort("status", 1).to_list(50)
    return docs


async def get_active_account(prefer_status: str = "LIVE") -> Optional[Dict]:
    """Return the currently active account (LIVE preferred, falls back to TEST)."""
    for status in [prefer_status, "TEST"]:
        doc = await db.payment_accounts.find_one({"status": status, "is_active": True}, {"_id": 0})
        if doc:
            return doc
    return None


async def create_account(payload: PaymentAccountIn, account_id: str) -> Dict:
    # If marking this one active, deactivate other accounts with the same status
    if payload.is_active:
        await db.payment_accounts.update_many(
            {"status": payload.status},
            {"$set": {"is_active": False, "updated_at": _now()}},
        )
    doc = payload.dict()
    doc["iban"] = _normalize_iban(doc["iban"])
    doc["account_id"] = account_id
    doc["created_at"] = _now()
    doc["updated_at"] = _now()
    await db.payment_accounts.insert_one(dict(doc))
    return doc


async def update_account(account_id: str, updates: Dict) -> Optional[Dict]:
    cleaned = {k: v for k, v in updates.items() if v is not None and k not in ("account_id", "created_at")}
    if "iban" in cleaned:
        cleaned["iban"] = _normalize_iban(cleaned["iban"])
    cleaned["updated_at"] = _now()
    if cleaned.get("is_active") is True and "status" in cleaned:
        await db.payment_accounts.update_many(
            {"status": cleaned["status"], "account_id": {"$ne": account_id}},
            {"$set": {"is_active": False, "updated_at": _now()}},
        )
    elif cleaned.get("is_active") is True:
        existing = await db.payment_accounts.find_one({"account_id": account_id}, {"status": 1})
        if existing:
            await db.payment_accounts.update_many(
                {"status": existing["status"], "account_id": {"$ne": account_id}},
                {"$set": {"is_active": False, "updated_at": _now()}},
            )
    raw = await db.payment_accounts.find_one_and_update(
        {"account_id": account_id},
        {"$set": cleaned},
        return_document=True,
        projection={"_id": 0},
    )
    if not raw:
        return None
    raw.pop("_id", None)
    return dict(raw)


async def delete_account(account_id: str) -> bool:
    res = await db.payment_accounts.delete_one({"account_id": account_id})
    return res.deleted_count > 0


# Seed the default Revolut account on startup so the admin section is non-empty.
DEFAULT_ACCOUNT = {
    "account_id": "acc_revolut_default",
    "account_holder": "Dragos Serban",
    "iban": "RO22REVO0000155568724293",
    "swift_bic": "REVOROBB",
    "bank_name": "Revolut Bank",
    "currency": "EUR",
    "status": "TEST",
    "is_active": True,
    "notes": "Cont implicit pre-seed (TEST). Editabil din profilul admin → Conturi aplicație destinate încasărilor din vânzări.",
}


async def seed_default_account():
    exists = await db.payment_accounts.find_one({"account_id": DEFAULT_ACCOUNT["account_id"]})
    if not exists:
        doc = dict(DEFAULT_ACCOUNT)
        doc["created_at"] = _now()
        doc["updated_at"] = _now()
        await db.payment_accounts.insert_one(doc)
