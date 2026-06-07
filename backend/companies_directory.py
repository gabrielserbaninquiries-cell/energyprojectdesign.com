"""Companies directory — partner / collaborator companies registered on the platform.

Public to all logged-in users. Anyone can submit their company. Developer moderates.

From V5 vision: "Companies" + "Operators" + "Developers" listing pages.
"""
from typing import Optional, List, Dict
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from db import db


COMPANY_ROLES = [
    {"id": "designer", "label": "Proiectant"},
    {"id": "executor", "label": "Executant"},
    {"id": "vgd", "label": "Verificator VGD"},
    {"id": "rte", "label": "Responsabil RTE"},
    {"id": "operator_osd", "label": "Operator OSD/DGN"},
    {"id": "operator_ose", "label": "Operator OSE (electric)"},
    {"id": "architect", "label": "Arhitect"},
    {"id": "legal", "label": "Juridic / Avocat"},
    {"id": "accounting", "label": "Contabilitate"},
    {"id": "bidding", "label": "Licitații / SEAP"},
    {"id": "developer", "label": "Dezvoltator imobiliar"},
    {"id": "mayor_office", "label": "Primărie / Administrație publică"},
    {"id": "owner_assoc", "label": "Asociație proprietari"},
    {"id": "supplier", "label": "Furnizor materiale"},
]


class CompanyIn(BaseModel):
    name: str = Field(..., min_length=2)
    cui: Optional[str] = None
    reg_com: Optional[str] = None
    industry: Optional[str] = None
    roles: List[str] = Field(default_factory=list)  # roles taken from COMPANY_ROLES
    address: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = Field(None, max_length=500)
    accepts_partnerships: bool = True


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def list_companies(industry: Optional[str] = None, role: Optional[str] = None, query: Optional[str] = None) -> List[Dict]:
    q: Dict = {"status": {"$ne": "rejected"}}
    if industry:
        q["industry"] = industry
    if role:
        q["roles"] = role
    if query:
        q["$or"] = [
            {"name": {"$regex": query, "$options": "i"}},
            {"city": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
        ]
    return await db.companies.find(q, {"_id": 0}).sort("verified", -1).limit(500).to_list(500)


async def get_company(company_id: str) -> Optional[Dict]:
    return await db.companies.find_one({"company_id": company_id}, {"_id": 0})


async def create_company(submitted_by_user_id: str, payload: CompanyIn, company_id: str, auto_verify: bool = False) -> Dict:
    doc = payload.model_dump()
    doc["company_id"] = company_id
    doc["submitted_by"] = submitted_by_user_id
    doc["status"] = "pending"  # 'pending' | 'verified' | 'rejected'
    doc["verified"] = auto_verify
    doc["created_at"] = _now()
    doc["updated_at"] = _now()
    if auto_verify:
        doc["status"] = "verified"
    await db.companies.insert_one(dict(doc))
    return doc


async def update_company(company_id: str, updates: Dict) -> Optional[Dict]:
    cleaned = {k: v for k, v in updates.items() if v is not None and k not in ("company_id", "submitted_by", "created_at")}
    if not cleaned:
        return await get_company(company_id)
    cleaned["updated_at"] = _now()
    return await db.companies.find_one_and_update(
        {"company_id": company_id},
        {"$set": cleaned},
        return_document=True,
        projection={"_id": 0},
    )


async def delete_company(company_id: str) -> bool:
    res = await db.companies.delete_one({"company_id": company_id})
    return res.deleted_count > 0


async def role_stats() -> Dict[str, int]:
    pipeline = [{"$unwind": "$roles"}, {"$group": {"_id": "$roles", "count": {"$sum": 1}}}]
    out = {}
    async for row in db.companies.aggregate(pipeline):
        out[row["_id"]] = row["count"]
    return out
