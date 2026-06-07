"""Clients CRM routes factory — per-user legacy CRM (separate from B2B Subscribers).

Wire via: app.include_router(make_clients_router(db, get_current_user), prefix="/api")
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException

import clients_crm
from models import new_id


def make_clients_router(db, get_current_user):
    r = APIRouter(prefix="/clients", tags=["clients-crm"])

    @r.get("")
    async def list_clients(status: Optional[str] = None, industry: Optional[str] = None, user=Depends(get_current_user)):
        return await clients_crm.list_clients(user.user_id, status=status, industry=industry)

    @r.post("")
    async def create_client(payload: clients_crm.ClientIn, user=Depends(get_current_user)):
        return await clients_crm.create_client(user.user_id, payload, new_id("cli_"))

    @r.get("/{client_id}")
    async def get_client(client_id: str, user=Depends(get_current_user)):
        doc = await clients_crm.get_client(user.user_id, client_id)
        if not doc:
            raise HTTPException(404, "Client inexistent")
        return doc

    @r.patch("/{client_id}")
    async def patch_client(client_id: str, payload: dict, user=Depends(get_current_user)):
        doc = await clients_crm.update_client(user.user_id, client_id, payload)
        if not doc:
            raise HTTPException(404, "Client inexistent")
        return doc

    @r.delete("/{client_id}")
    async def delete_client(client_id: str, user=Depends(get_current_user)):
        ok = await clients_crm.delete_client(user.user_id, client_id)
        if not ok:
            raise HTTPException(404, "Client inexistent")
        return {"deleted": True}

    return r
