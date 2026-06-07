"""Glossary — semantic disambiguation between similar concepts in the platform.

Public endpoint /api/glossary returns the conceptual map used by frontend tooltips
and the Admin glossary editor.

This is editable from the Admin panel: /api/admin/glossary (admin-only CRUD).
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException


DEFAULT_GLOSSARY = [
    {
        "id": "clients_vs_subscribers",
        "title": "Clienți vs Subscriberi B2B",
        "summary": "Două concepte distincte care coexistă cu rol clar diferit.",
        "items": [
            {
                "term": "Clienți (legacy CRM per-user)",
                "scope": "/clients · /api/clients",
                "description": "Persoane fizice sau juridice care contractează direct servicii de la TINE (proiectantul/firma de instalații). Fiecare user are propria listă privată de clienți pentru proiectele sale tehnice.",
                "examples": ["Popescu Ion (CNP)", "SC Beneficiar SRL", "Asociație XYZ pe blocul tău"],
                "use_when": "Adaugi un beneficiar nou la un proiect tehnic pe care îl execuți.",
            },
            {
                "term": "Subscriberi B2B (entități instituționale)",
                "scope": "/subscribers · /api/subscribers",
                "description": "Entități juridice cu contract cu PLATFORMA Energy Project Design. Sunt clienții PLATFORMEI, nu ai user-ului individual. 5 tipuri: Primării, Asociații locatari, Utilități publice, Dezvoltatori, Societăți comerciale.",
                "examples": ["Primăria Sector 2", "Distrigaz Sud SA", "Asociația de bloc nr.42"],
                "use_when": "Admin/developer înregistrează un partener instituțional care folosește platforma sub un contract B2B.",
            },
        ],
    },
    {
        "id": "companies_vs_clients",
        "title": "Companii (Directory public) vs Clienți (CRM)",
        "summary": "Directory-ul de companii este public — CRM-ul este privat per user.",
        "items": [
            {
                "term": "Companies Directory",
                "scope": "/companies · /api/companies",
                "description": "Listă publică, indexabilă, de firme verificate care oferă servicii: proiectanți, executanți, verificatori VGD/RTE, arhitecți, dirigenți, etc. Oricine poate vedea fără autentificare.",
                "use_when": "Cauți un colaborator (proiectant, executant) sau vrei să apari ca firmă disponibilă pentru job-uri.",
            },
            {
                "term": "Clienți",
                "scope": "/clients",
                "description": "CRM privat per user — vezi mai sus.",
                "use_when": "Gestionezi PROPRIII tăi clienți (beneficiari direcți).",
            },
        ],
    },
    {
        "id": "subscribers_vs_companies",
        "title": "Subscriberi B2B vs Companii (Directory)",
        "summary": "Subscriberi = clienții PLATFORMEI (contract B2B). Companii = prestatorii care colaborează pe platformă.",
        "items": [
            {
                "term": "Subscriber B2B",
                "scope": "/subscribers",
                "description": "Entitate care PLĂTEȘTE/folosește platforma (consumator de servicii).",
            },
            {
                "term": "Company",
                "scope": "/companies",
                "description": "Firmă care OFERĂ servicii pe platformă (proiectant, executant, verificator).",
            },
        ],
    },
]


def make_glossary_router(db, get_current_user):
    r = APIRouter(prefix="/glossary", tags=["glossary"])

    @r.get("")
    async def list_glossary():
        items = []
        async for row in db.glossary_entries.find({"deleted": {"$ne": True}}, {"_id": 0}).sort("order", 1):
            items.append(row)
        if not items:
            return DEFAULT_GLOSSARY
        return items

    @r.get("/{entry_id}")
    async def get_entry(entry_id: str):
        doc = await db.glossary_entries.find_one({"id": entry_id, "deleted": {"$ne": True}}, {"_id": 0})
        if doc:
            return doc
        for e in DEFAULT_GLOSSARY:
            if e["id"] == entry_id:
                return e
        raise HTTPException(404, "Termen inexistent în glosar")

    @r.post("")
    async def add_entry(payload: dict, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin")
        eid = (payload.get("id") or "").strip().lower().replace(" ", "_")
        if not eid:
            raise HTTPException(400, "id obligatoriu")
        if await db.glossary_entries.find_one({"id": eid}):
            raise HTTPException(409, "Termen existent")
        count = await db.glossary_entries.count_documents({})
        doc = {
            "id": eid,
            "title": payload.get("title", "").strip(),
            "summary": payload.get("summary", "").strip(),
            "items": payload.get("items", []),
            "order": count,
            "deleted": False,
        }
        await db.glossary_entries.insert_one(doc)
        return doc

    @r.patch("/{entry_id}")
    async def edit_entry(entry_id: str, payload: dict, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin")
        updates = {k: v for k, v in payload.items() if k in {"title", "summary", "items", "order"}}
        if not updates:
            raise HTTPException(400, "Nimic de actualizat")
        res = await db.glossary_entries.update_one({"id": entry_id}, {"$set": updates}, upsert=False)
        if res.matched_count == 0:
            existing = next((e for e in DEFAULT_GLOSSARY if e["id"] == entry_id), None)
            if existing:
                new_doc = {**existing, **updates, "deleted": False, "order": existing.get("order", 0)}
                await db.glossary_entries.insert_one(new_doc)
                return new_doc
            raise HTTPException(404, "Inexistent")
        return {"updated": True}

    @r.delete("/{entry_id}")
    async def remove_entry(entry_id: str, user=Depends(get_current_user)):
        if not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar admin")
        res = await db.glossary_entries.update_one({"id": entry_id}, {"$set": {"deleted": True}}, upsert=False)
        if res.matched_count == 0:
            raise HTTPException(404, "Inexistent")
        return {"deleted": True}

    return r
