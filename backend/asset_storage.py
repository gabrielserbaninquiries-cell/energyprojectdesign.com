"""Asset Storage — backend real pentru upload ștampile, acte, planuri, avize.

Stochează fișiere în MongoDB GridFS (sau base64 inline pentru fișiere mici).
Limită: 10MB per fișier. Tipuri acceptate: PDF, DOCX, PNG, JPG, JPEG.

Conform `De imbunatatit la aplicatie.docx` (cerință literală):
- Import proiect cu RETENȚIE imagini, ștampile, autorizări digitale
- Recunoaște PDF Word, plasează ștampilă ca watermark
"""
from __future__ import annotations
import base64
import io
import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from auth import get_current_user
from db import db

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "doc": "application/msword",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

# Categoriile de assets stocate
ASSET_CATEGORIES = {
    "stamp_proiectant":      "Ștampilă proiectant",
    "stamp_executant":       "Ștampilă executant",
    "stamp_vgd":             "Ștampilă VGD",
    "stamp_rte":             "Ștampilă RTE",
    "stamp_primarie":        "Ștampilă documentație Primărie",
    "stamp_societate":       "Ștampilă societate",
    "act_beneficiar":        "Act beneficiar (CF, proprietate, CI/CUI)",
    "act_lucrare":           "Act lucrare (contract, predare, aviz Poliție)",
    "plan_lucrare":          "Plan lucrare (situație, încadrare, semnalizare, schema izometrică)",
    "aviz_obtinut":          "Aviz obținut (PDF emis de autoritate)",
    "aviz_plata":            "Document plată aviz",
    "aviz_documentatie":     "Documentație depusă pentru obținere aviz",
    "proiect_avizat":        "Proiect avizat (upload final)",
    "carte_tehnica_pagina":  "Pagini carte tehnică intermediare",
}


def _new_aid() -> str:
    return f"ast_{secrets.token_hex(8)}"


def _get_ext(filename: str) -> Optional[str]:
    if not filename or "." not in filename:
        return None
    return filename.rsplit(".", 1)[-1].lower()


@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    category: str = Form(...),
    pid: Optional[str] = Form(None),  # asociat unui proiect (gas project id)
    label: Optional[str] = Form(None),
    bucket_key: Optional[str] = Form(None),  # ex: 'stamp_proiectant', 'aviz_apa.documentatie'
    user=Depends(get_current_user),
):
    """Upload generic asset către pid (sau standalone)."""
    if category not in ASSET_CATEGORIES:
        raise HTTPException(400, f"Categorie invalidă. Permise: {list(ASSET_CATEGORIES.keys())}")
    if not file.filename:
        raise HTTPException(400, "Filename lipsă")
    ext = _get_ext(file.filename)
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Extensie nepermisă. Acceptate: {', '.join(ALLOWED_EXTENSIONS.keys())}")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Fișier > 10MB (limită)")
    if not content:
        raise HTTPException(400, "Fișier gol")

    aid = _new_aid()
    doc = {
        "aid": aid,
        "owner_id": user.user_id,
        "pid": pid,
        "category": category,
        "label": (label or file.filename).strip()[:200],
        "filename": file.filename,
        "extension": ext,
        "mime_type": ALLOWED_EXTENSIONS[ext],
        "size_bytes": len(content),
        "bucket_key": bucket_key,
        "content_b64": base64.b64encode(content).decode("ascii"),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "deleted": False,
    }
    await db.assets.insert_one(doc)
    # If associated to a gas project, push reference
    if pid:
        await db.gas_projects.update_one(
            {"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
            {"$push": {"assets": {"aid": aid, "category": category, "bucket_key": bucket_key, "label": doc["label"], "filename": file.filename}}},
        )
    # Return without content_b64
    doc.pop("_id", None)
    doc.pop("content_b64", None)
    return doc


@router.get("/assets/{pid}")
async def list_project_assets(pid: str, user=Depends(get_current_user)):
    """Lista assets atașate unui proiect."""
    out = []
    async for d in db.assets.find(
        {"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
        {"_id": 0, "content_b64": 0},
    ).sort("uploaded_at", -1):
        out.append(d)
    return {"pid": pid, "assets": out}


@router.get("/assets")
async def list_my_assets(category: Optional[str] = None, user=Depends(get_current_user)):
    """Lista assets ale userului — opțional filtru categorie (pentru reuse, ex: ștampile)."""
    q: Dict[str, Any] = {"owner_id": user.user_id, "deleted": {"$ne": True}}
    if category:
        q["category"] = category
    out = []
    async for d in db.assets.find(q, {"_id": 0, "content_b64": 0}).sort("uploaded_at", -1).limit(500):
        out.append(d)
    return {"assets": out}


@router.get("/asset/{aid}/download")
async def download_asset(aid: str, user=Depends(get_current_user)):
    """Download fișier original."""
    doc = await db.assets.find_one({"aid": aid, "owner_id": user.user_id, "deleted": {"$ne": True}})
    if not doc:
        raise HTTPException(404, "Asset inexistent")
    content = base64.b64decode(doc["content_b64"])
    safe_name = doc.get("filename", f"asset.{doc.get('extension','bin')}")
    return StreamingResponse(
        io.BytesIO(content),
        media_type=doc.get("mime_type", "application/octet-stream"),
        headers={"Content-Disposition": f"attachment; filename={_ascii(safe_name)}"},
    )


@router.get("/asset/{aid}/preview")
async def preview_asset(aid: str, user=Depends(get_current_user)):
    """Preview inline (deschide în browser)."""
    doc = await db.assets.find_one({"aid": aid, "owner_id": user.user_id, "deleted": {"$ne": True}})
    if not doc:
        raise HTTPException(404, "Asset inexistent")
    content = base64.b64decode(doc["content_b64"])
    return StreamingResponse(
        io.BytesIO(content),
        media_type=doc.get("mime_type", "application/octet-stream"),
        headers={"Content-Disposition": f"inline; filename={_ascii(doc.get('filename','asset'))}"},
    )


@router.delete("/asset/{aid}")
async def delete_asset(aid: str, user=Depends(get_current_user)):
    res = await db.assets.update_one(
        {"aid": aid, "owner_id": user.user_id},
        {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Asset inexistent")
    # Remove from associated gas_projects.assets array
    await db.gas_projects.update_many(
        {"owner_id": user.user_id},
        {"$pull": {"assets": {"aid": aid}}},
    )
    return {"ok": True}


@router.get("/asset-categories")
async def list_categories():
    """Toate categoriile de assets posibile."""
    return {"categories": [{"id": k, "label": v} for k, v in ASSET_CATEGORIES.items()]}


def _ascii(s: str) -> str:
    """Filename ASCII-safe pentru HTTP Content-Disposition."""
    import unicodedata
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii") or "asset"
