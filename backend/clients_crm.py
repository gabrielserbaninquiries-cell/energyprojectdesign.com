"""Clients module — internal CRM for tracking beneficiaries (clients) per user.

Each user has their own client list (clients of their projects). Tracks:
  - name, contact (email/phone), CNP/CUI, address
  - assigned project_ids
  - service history (which docs were generated for them)
  - status (active/inactive/archived)
  - last contact + next action

Inspired by V5 vision "Subscribers list & client data" page.
"""
from typing import Optional, List, Dict
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from db import db


class ClientIn(BaseModel):
    name: str = Field(..., min_length=2)
    type: str = "physical"  # 'physical' | 'legal'
    cnp_or_cui: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    notes: Optional[str] = None
    industry: Optional[str] = None  # client's primary industry interest
    status: str = "active"  # 'active' | 'inactive' | 'archived'


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def list_clients(user_id: str, status: Optional[str] = None, industry: Optional[str] = None) -> List[Dict]:
    q = {"user_id": user_id}
    if status and status != "all":
        q["status"] = status
    if industry:
        q["industry"] = industry
    return await db.clients.find(q, {"_id": 0}).sort("updated_at", -1).to_list(500)


async def get_client(user_id: str, client_id: str) -> Optional[Dict]:
    return await db.clients.find_one({"client_id": client_id, "user_id": user_id}, {"_id": 0})


async def create_client(user_id: str, payload: ClientIn, client_id: str) -> Dict:
    doc = payload.model_dump()
    doc["client_id"] = client_id
    doc["user_id"] = user_id
    doc["service_count"] = 0
    doc["last_service_at"] = None
    doc["created_at"] = _now()
    doc["updated_at"] = _now()
    await db.clients.insert_one(dict(doc))
    return doc


async def update_client(user_id: str, client_id: str, updates: Dict) -> Optional[Dict]:
    cleaned = {k: v for k, v in updates.items() if v is not None and k not in ("client_id", "user_id", "created_at")}
    if not cleaned:
        return await get_client(user_id, client_id)
    cleaned["updated_at"] = _now()
    raw = await db.clients.find_one_and_update(
        {"client_id": client_id, "user_id": user_id},
        {"$set": cleaned},
        return_document=True,
        projection={"_id": 0},
    )
    if not raw:
        return None
    raw.pop("_id", None)
    return dict(raw)


async def delete_client(user_id: str, client_id: str) -> bool:
    res = await db.clients.delete_one({"client_id": client_id, "user_id": user_id})
    return res.deleted_count > 0
