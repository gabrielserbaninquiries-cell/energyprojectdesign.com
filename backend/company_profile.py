"""Company Profile module — stores per-user company details for documents and emails.

Used as data source for placeholders like <nume_societate>, <cui_societate>,
<sediu_societate>, <iban_societate>, <reprezentant_legal>, etc.
"""
from typing import Optional, Dict
from datetime import datetime, timezone
from pydantic import BaseModel
from db import db


class CompanyProfile(BaseModel):
    company_name: Optional[str] = None
    cui: Optional[str] = None  # CUI / VAT
    reg_com: Optional[str] = None  # Registrul Comerțului J40/.../...
    address: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "România"
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    iban: Optional[str] = None
    bank_name: Optional[str] = None
    legal_representative: Optional[str] = None
    representative_role: Optional[str] = None  # Administrator, CEO, etc.
    logo_url: Optional[str] = None  # base64 data URI or external URL
    stamp_signature_url: Optional[str] = None  # company stamp image
    notes: Optional[str] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def get_profile(user_id: str) -> Dict:
    doc = await db.company_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not doc:
        return {"user_id": user_id, **{f: None for f in CompanyProfile.model_fields.keys()}, "country": "România"}
    return doc


async def upsert_profile(user_id: str, payload: CompanyProfile) -> Dict:
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    update["user_id"] = user_id
    update["updated_at"] = _now()
    await db.company_profiles.update_one(
        {"user_id": user_id},
        {"$set": update, "$setOnInsert": {"created_at": _now()}},
        upsert=True,
    )
    return await get_profile(user_id)


def placeholders_from_profile(profile: Dict) -> Dict[str, str]:
    """Map profile fields to placeholder names usable in DOCX/templates."""
    return {
        "nume_societate":          profile.get("company_name") or "",
        "cui_societate":           profile.get("cui") or "",
        "regcom_societate":        profile.get("reg_com") or "",
        "sediu_societate":         profile.get("address") or "",
        "localitate_societate":    profile.get("city") or "",
        "judet_societate":         profile.get("county") or "",
        "cod_postal_societate":    profile.get("postal_code") or "",
        "tara_societate":          profile.get("country") or "România",
        "email_societate":         profile.get("email") or "",
        "telefon_societate":       profile.get("phone") or "",
        "website_societate":       profile.get("website") or "",
        "iban_societate":          profile.get("iban") or "",
        "banca_societate":         profile.get("bank_name") or "",
        "reprezentant_legal":      profile.get("legal_representative") or "",
        "functie_reprezentant":    profile.get("representative_role") or "",
    }
