"""Forum + Group Announcements V7.0 — sistem discuții + anunțuri grup.

Concept (cerere literală user):
    "pagina de tip - Grup anunt postari - in forum sau intr-o sectiune dedicata"

Structuri:
- Topics (subiecte/threads) grupate pe categorii
- Posts (mesaje în interiorul unui topic)
- Group Announcements (anunțuri verticale: oferte de muncă, evenimente, training-uri)
- Like/Dislike + Best Answer marker
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


FORUM_CATEGORIES = [
    {"id": "general",          "label": "General", "icon": "MessageSquare"},
    {"id": "tehnic",           "label": "Întrebări tehnice", "icon": "Wrench"},
    {"id": "legislatie",       "label": "Legislație + Norme", "icon": "Scale"},
    {"id": "experiente",       "label": "Experiențe & studii de caz", "icon": "BookOpen"},
    {"id": "anunturi_munca",   "label": "Anunțuri muncă / colaborări", "icon": "Briefcase"},
    {"id": "training",         "label": "Cursuri + Evenimente + Training", "icon": "GraduationCap"},
    {"id": "vanzari_rapide",   "label": "Vânzări rapide", "icon": "Tag"},
]


class TopicCreate(BaseModel):
    title: str
    body: str
    category: str
    tags: List[str] = []
    is_announcement: bool = False  # marker pentru "grup anunț"
    is_pinned: bool = False        # doar admin


class PostCreate(BaseModel):
    body: str


@router.get("/forum/categories")
async def forum_categories():
    return {"categories": FORUM_CATEGORIES}


@router.post("/forum/topics")
async def create_topic(payload: TopicCreate, user=Depends(get_current_user)):
    if payload.category not in {c["id"] for c in FORUM_CATEGORIES}:
        raise HTTPException(400, "Categorie invalidă")
    is_pinned = bool(payload.is_pinned and getattr(user, "is_admin", False))
    doc = {
        "topic_id": f"top_{secrets.token_hex(8)}",
        "owner_id": user.user_id,
        "owner_email": user.email,
        "title": payload.title,
        "body": payload.body,
        "category": payload.category,
        "tags": payload.tags,
        "is_announcement": payload.is_announcement,
        "is_pinned": is_pinned,
        "status": "open",  # open | closed | archived
        "views": 0,
        "replies_count": 0,
        "likes": 0,
        "best_answer_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_activity_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.forum_topics.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/forum/topics")
async def list_topics(
    category: Optional[str] = None,
    only_announcements: bool = False,
    q: Optional[str] = None,
    sort: str = Query("active", description="active | recent | top"),
    limit: int = Query(40, le=100),
    skip: int = 0,
):
    flt: Dict[str, Any] = {"status": {"$ne": "archived"}}
    if category: flt["category"] = category
    if only_announcements: flt["is_announcement"] = True
    if q:
        flt["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"body": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q.lower()]}},
        ]
    sort_map = {
        "active": [("is_pinned", -1), ("last_activity_at", -1)],
        "recent": [("created_at", -1)],
        "top": [("likes", -1), ("replies_count", -1)],
    }
    cur = db.forum_topics.find(flt, {"_id": 0}).sort(sort_map.get(sort, sort_map["active"])).skip(skip).limit(limit)
    items = await cur.to_list(length=limit)
    total = await db.forum_topics.count_documents(flt)
    return {"items": items, "total": total}


@router.get("/forum/topics/{topic_id}")
async def get_topic(topic_id: str):
    t = await db.forum_topics.find_one({"topic_id": topic_id}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Topic inexistent")
    await db.forum_topics.update_one({"topic_id": topic_id}, {"$inc": {"views": 1}})
    posts = await db.forum_posts.find({"topic_id": topic_id}, {"_id": 0}).sort("created_at", 1).to_list(length=500)
    return {"topic": t, "posts": posts}


@router.post("/forum/topics/{topic_id}/posts")
async def add_post(topic_id: str, payload: PostCreate, user=Depends(get_current_user)):
    t = await db.forum_topics.find_one({"topic_id": topic_id}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Topic inexistent")
    if t.get("status") == "closed":
        raise HTTPException(403, "Topic închis")
    post = {
        "post_id": f"pst_{secrets.token_hex(8)}",
        "topic_id": topic_id,
        "owner_id": user.user_id,
        "owner_email": user.email,
        "body": payload.body,
        "likes": 0,
        "is_best_answer": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.forum_posts.insert_one(post)
    await db.forum_topics.update_one(
        {"topic_id": topic_id},
        {"$inc": {"replies_count": 1},
         "$set": {"last_activity_at": post["created_at"]}},
    )
    post.pop("_id", None)
    return post


@router.post("/forum/topics/{topic_id}/like")
async def like_topic(topic_id: str, user=Depends(get_current_user)):
    res = await db.forum_topics.update_one({"topic_id": topic_id}, {"$inc": {"likes": 1}})
    if res.matched_count == 0:
        raise HTTPException(404, "Topic inexistent")
    return {"liked": True}


@router.post("/forum/posts/{post_id}/best-answer")
async def mark_best_answer(post_id: str, user=Depends(get_current_user)):
    p = await db.forum_posts.find_one({"post_id": post_id}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Post inexistent")
    t = await db.forum_topics.find_one({"topic_id": p["topic_id"]}, {"_id": 0})
    if not t:
        raise HTTPException(404, "Topic inexistent")
    if t["owner_id"] != user.user_id and not getattr(user, "is_admin", False):
        raise HTTPException(403, "Doar autorul topicului poate marca răspunsul cel mai bun")
    # clear previous best answer
    await db.forum_posts.update_many({"topic_id": p["topic_id"]}, {"$set": {"is_best_answer": False}})
    await db.forum_posts.update_one({"post_id": post_id}, {"$set": {"is_best_answer": True}})
    await db.forum_topics.update_one({"topic_id": p["topic_id"]}, {"$set": {"best_answer_id": post_id}})
    return {"marked": True}
