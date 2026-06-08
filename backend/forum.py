"""Forum module — public/community discussion threads filtered by industry.

Simple, fast forum with:
  - Threads (one per discussion, scoped to an industry)
  - Replies (chronological)
  - Like counter (per thread + per reply)
  - View counter (per thread)

Authenticated users post. Anyone can read. Developer can delete any thread/reply.
"""
from typing import Optional, List, Dict
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from db import db


# Mirrors industries.INDUSTRIES keys but as a flat list of accepted codes.
INDUSTRY_CODES = {
    "gas_engineering", "electrical_engineering", "water_sewage",
    "civil_engineering", "telecom", "photovoltaic",
    "construction", "railway_infra",
    "sanitation", "hvac", "environment", "roads_bridges", "public_lighting",
    "general",  # 'general' for cross-industry discussion
}


class ThreadCreate(BaseModel):
    title: str = Field(..., min_length=4, max_length=200)
    body: str = Field(..., min_length=10, max_length=8000)
    industry: str = Field(..., description="Industry code; use 'general' for cross-industry")
    tags: List[str] = Field(default_factory=list, max_items=8)


class ReplyCreate(BaseModel):
    body: str = Field(..., min_length=2, max_length=5000)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _strip_secrets(body: str) -> str:
    """Basic protection: remove obvious secret patterns before saving."""
    import re
    body = re.sub(r"sk[_-](live|test|proj)[A-Za-z0-9_-]{20,}", "[REDACTED-KEY]", body)
    body = re.sub(r"ghp_[A-Za-z0-9]{30,}", "[REDACTED-GH-TOKEN]", body)
    return body


async def create_thread(user, payload: ThreadCreate, thread_id: str) -> Dict:
    if payload.industry not in INDUSTRY_CODES:
        raise ValueError(f"Industrie invalidă: {payload.industry}")
    doc = {
        "thread_id": thread_id,
        "title": payload.title.strip(),
        "body": _strip_secrets(payload.body.strip()),
        "industry": payload.industry,
        "tags": [t.strip().lower()[:30] for t in payload.tags if t.strip()][:8],
        "author_id": user.user_id,
        "author_name": user.name or user.email.split("@")[0],
        "author_email": user.email,
        "is_developer_post": bool(user.is_developer),
        "likes": 0,
        "views": 0,
        "reply_count": 0,
        "last_activity_at": _now(),
        "created_at": _now(),
        "pinned": False,
    }
    await db.forum_threads.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


async def list_threads(industry: Optional[str] = None, limit: int = 50, sort: str = "recent") -> List[Dict]:
    q = {}
    if industry and industry != "all":
        q["industry"] = industry
    sort_key = [("pinned", -1), ("last_activity_at", -1)] if sort == "recent" else [("pinned", -1), ("likes", -1)]
    docs = await db.forum_threads.find(q, {"_id": 0, "body": 0}).sort(sort_key).limit(limit).to_list(limit)
    return docs


async def get_thread(thread_id: str, increment_view: bool = True) -> Optional[Dict]:
    doc = await db.forum_threads.find_one({"thread_id": thread_id}, {"_id": 0})
    if not doc:
        return None
    if increment_view:
        await db.forum_threads.update_one({"thread_id": thread_id}, {"$inc": {"views": 1}})
        doc["views"] = doc.get("views", 0) + 1
    return doc


async def list_replies(thread_id: str) -> List[Dict]:
    return await db.forum_replies.find({"thread_id": thread_id}, {"_id": 0}).sort("created_at", 1).to_list(500)


async def create_reply(user, thread_id: str, payload: ReplyCreate, reply_id: str) -> Optional[Dict]:
    thread = await db.forum_threads.find_one({"thread_id": thread_id}, {"_id": 0})
    if not thread:
        return None
    doc = {
        "reply_id": reply_id,
        "thread_id": thread_id,
        "body": _strip_secrets(payload.body.strip()),
        "author_id": user.user_id,
        "author_name": user.name or user.email.split("@")[0],
        "author_email": user.email,
        "is_developer_post": bool(user.is_developer),
        "likes": 0,
        "created_at": _now(),
    }
    await db.forum_replies.insert_one(dict(doc))
    await db.forum_threads.update_one(
        {"thread_id": thread_id},
        {"$inc": {"reply_count": 1}, "$set": {"last_activity_at": doc["created_at"]}},
    )
    doc.pop("_id", None)
    return doc


async def like_thread(thread_id: str, user_id: str) -> Optional[int]:
    """Toggle like — increments if user hadn't liked, decrements if they had."""
    like_key = f"thread:{thread_id}"
    existing = await db.forum_likes.find_one({"user_id": user_id, "target": like_key})
    if existing:
        await db.forum_likes.delete_one({"_id": existing["_id"]})
        await db.forum_threads.update_one({"thread_id": thread_id}, {"$inc": {"likes": -1}})
    else:
        await db.forum_likes.insert_one({"user_id": user_id, "target": like_key, "created_at": _now()})
        await db.forum_threads.update_one({"thread_id": thread_id}, {"$inc": {"likes": 1}})
    doc = await db.forum_threads.find_one({"thread_id": thread_id}, {"likes": 1})
    return (doc or {}).get("likes", 0) if doc else None


async def delete_thread(thread_id: str) -> bool:
    """Cascade delete: removes replies + likes too. Developer-only."""
    await db.forum_replies.delete_many({"thread_id": thread_id})
    await db.forum_likes.delete_many({"target": f"thread:{thread_id}"})
    res = await db.forum_threads.delete_one({"thread_id": thread_id})
    return res.deleted_count > 0


async def industry_stats() -> Dict[str, int]:
    """Returns count of threads per industry — for sidebar widget."""
    pipeline = [{"$group": {"_id": "$industry", "count": {"$sum": 1}}}]
    out = {}
    async for row in db.forum_threads.aggregate(pipeline):
        out[row["_id"]] = row["count"]
    return out
