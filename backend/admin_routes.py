"""Admin routes — refactored out of server.py for scalability.

Contains all `/admin/*` endpoints:
  - Global config (get/put)
  - Users (list/patch)
  - Stats
  - Audit logs
  - Payment accounts (CRUD)
"""
from typing import Optional, List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from db import db
from models import (
    User, AdminConfig, AdminConfigUpdate, AdminUserRoleUpdate, new_id,
)
import payment_accounts as pay_accounts


router = APIRouter(prefix="/api")


# Developer accounts mirror server.py — keeps single source of truth via env.
DEVELOPER_EMAILS = {"dragosserban95@gmail.com"}


def _is_developer_email(email: str) -> bool:
    return (email or "").lower() in DEVELOPER_EMAILS


async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if not (user.is_admin or getattr(user, "is_developer", False)):
        raise HTTPException(status_code=403, detail="Acces restricționat — necesită rol de administrator")
    return user


async def _get_admin_config() -> dict:
    doc = await db.admin_config.find_one({"config_id": "global"}, {"_id": 0})
    if not doc:
        defaults = AdminConfig().model_dump()
        await db.admin_config.insert_one({**defaults})
        doc = defaults
    return doc


# ====================== ADMIN CONFIG ======================
# Cheile sensibile (write-only) — niciodată returnate clear; UI vede doar boolean *_set
_WRITE_ONLY_KEYS = {
    "smtp_global_password",
    "cert_sign_api_key",
    "digisign_api_key",
    "trans_sped_token",
    "osd_distrigaz_password", "osd_delgaz_password", "osd_premier_password",
    "anaf_efactura_cert_b64", "anaf_efactura_cert_password",
    "seap_password",
    "openbanking_client_secret",
}


def _redact_config(cfg: dict) -> dict:
    safe = {k: v for k, v in cfg.items() if k not in _WRITE_ONLY_KEYS and k != "_id"}
    for k in _WRITE_ONLY_KEYS:
        safe[f"{k}_set"] = bool(cfg.get(k))
    return safe


@router.get("/admin/config")
async def admin_get_config(admin: User = Depends(get_admin_user)):
    cfg = await _get_admin_config()
    return _redact_config(cfg)


@router.put("/admin/config")
async def admin_update_config(payload: AdminConfigUpdate, admin: User = Depends(get_admin_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nicio modificare validă")
    # Empty string on a write-only field means "do not change" (kept for legacy smtp_global_password)
    for k in list(updates.keys()):
        if k in _WRITE_ONLY_KEYS and updates[k] == "":
            del updates[k]
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    updates["updated_by"] = admin.user_id
    await db.admin_config.update_one(
        {"config_id": "global"},
        {"$set": updates, "$setOnInsert": {"config_id": "global"}},
        upsert=True,
    )
    cfg = await _get_admin_config()
    await db.action_logs.insert_one({
        "log_id": new_id("log_"), "user_id": admin.user_id,
        "action": "admin_config_update",
        "details": {"keys": list(updates.keys())},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return _redact_config(cfg)


@router.get("/admin/essentials/status")
async def admin_essentials_status(admin: User = Depends(get_admin_user)):
    """Returnează status configurare pentru toate cele 8 integrări esențiale (boolean ready/missing)."""
    cfg = await _get_admin_config()
    return {
        "cert_sign":      {"configured": bool(cfg.get("cert_sign_api_key") and cfg.get("cert_sign_account_id")),
                           "label": "cert-SIGN (semnătură electronică calificată)",
                           "fields": ["cert_sign_api_url", "cert_sign_account_id", "cert_sign_api_key"]},
        "digisign":       {"configured": bool(cfg.get("digisign_api_key") and cfg.get("digisign_account_id")),
                           "label": "DigiSign (PKI calificat)",
                           "fields": ["digisign_base_url", "digisign_account_id", "digisign_api_key"]},
        "trans_sped":     {"configured": bool(cfg.get("trans_sped_token")),
                           "label": "Trans Sped (QES)",
                           "fields": ["trans_sped_api_url", "trans_sped_token", "trans_sped_certificate_serial"]},
        "osd_distrigaz":  {"configured": bool(cfg.get("osd_distrigaz_password")),
                           "label": "OSD Distrigaz Sud Rețele (Engie)",
                           "fields": ["osd_distrigaz_login", "osd_distrigaz_password"]},
        "osd_delgaz":     {"configured": bool(cfg.get("osd_delgaz_password")),
                           "label": "OSD Delgaz Grid",
                           "fields": ["osd_delgaz_login", "osd_delgaz_password"]},
        "osd_premier":    {"configured": bool(cfg.get("osd_premier_password")),
                           "label": "OSD Premier Energy",
                           "fields": ["osd_premier_login", "osd_premier_password"]},
        "anaf_efactura":  {"configured": bool(cfg.get("anaf_efactura_cert_b64") and cfg.get("anaf_efactura_cif")),
                           "label": "ANAF e-Factura",
                           "fields": ["anaf_efactura_cif", "anaf_efactura_cert_b64", "anaf_efactura_cert_password"]},
        "seap":           {"configured": bool(cfg.get("seap_password") and cfg.get("seap_company_id")),
                           "label": "SEAP / SICAP (licitații)",
                           "fields": ["seap_company_id", "seap_login", "seap_password"]},
        "openbanking":    {"configured": bool(cfg.get("openbanking_client_secret")),
                           "label": "Open Banking PSD2 (cash-flow)",
                           "fields": ["openbanking_provider", "openbanking_client_id", "openbanking_client_secret"]},
        "isc":            {"configured": bool(cfg.get("isc_email_default")),
                           "label": "ISC (Inspectoratul de Stat în Construcții)",
                           "fields": ["isc_email_default", "isc_county_office"]},
    }


# ====================== USERS MANAGEMENT ======================
@router.get("/admin/users")
async def admin_list_users(admin: User = Depends(get_admin_user), search: Optional[str] = None, limit: int = 100):
    q = {}
    if search:
        q = {"$or": [
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
        ]}
    cursor = db.users.find(q, {"_id": 0, "password_hash": 0, "gmail_app_password": 0, "qes_credentials": 0}).limit(limit)
    users = []
    async for u in cursor:
        u["gmail_configured"] = bool(u.get("gmail_user"))
        users.append(u)
    return {"users": users, "count": len(users)}


@router.patch("/admin/users/{user_id}")
async def admin_update_user(user_id: str, payload: AdminUserRoleUpdate, admin: User = Depends(get_admin_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nicio modificare validă")
    target = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="Utilizator inexistent")
    await db.users.update_one({"user_id": user_id}, {"$set": updates})
    await db.action_logs.insert_one({
        "log_id": new_id("log_"), "user_id": admin.user_id,
        "action": "admin_user_update",
        "details": {"target_user_id": user_id, "updates": updates},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    updated = await db.users.find_one(
        {"user_id": user_id},
        {"_id": 0, "password_hash": 0, "gmail_app_password": 0, "qes_credentials": 0},
    )
    if updated:
        updated["gmail_configured"] = bool(updated.get("gmail_user"))
    return {"ok": True, "user_id": user_id, "updates": updates, "user": updated}


# ====================== STATS ======================
@router.get("/admin/stats")
async def admin_stats(admin: User = Depends(get_admin_user)):
    users = await db.users.count_documents({})
    projects = await db.projects.count_documents({})
    documents = await db.documents.count_documents({})
    emails = await db.email_logs.count_documents({})
    threads = 0
    try:
        threads = await db.forum_threads.count_documents({})
    except Exception:
        pass
    admins = await db.users.count_documents({"$or": [{"is_admin": True}, {"is_developer": True}]})
    return {
        "users_total": users,
        "admins_total": admins,
        "projects_total": projects,
        "documents_total": documents,
        "emails_sent": emails,
        "forum_threads": threads,
    }


# ====================== AUDIT LOGS ======================
@router.get("/admin/audit-logs")
async def admin_audit_logs(admin: User = Depends(get_admin_user), limit: int = 100):
    limit = max(1, min(500, int(limit)))
    logs: List[dict] = []
    async for log in db.action_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(limit):
        logs.append(log)
    return {"logs": logs, "count": len(logs)}


# ====================== PAYMENT ACCOUNTS ======================
@router.get("/admin/payment-accounts")
async def admin_list_payment_accounts(include_disabled: bool = False, admin: User = Depends(get_admin_user)):
    return await pay_accounts.list_accounts(include_disabled=include_disabled)


@router.post("/admin/payment-accounts")
async def admin_create_payment_account(payload: pay_accounts.PaymentAccountIn, admin: User = Depends(get_admin_user)):
    account_id = new_id("acc_")
    doc = await pay_accounts.create_account(payload, account_id)
    await db.action_logs.insert_one({
        "log_id": new_id("log_"), "user_id": admin.user_id, "action": "admin.payment_accounts.create",
        "meta": {"account_id": account_id, "iban_last4": doc["iban"][-4:], "status": doc["status"]},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return doc


@router.patch("/admin/payment-accounts/{account_id}")
async def admin_update_payment_account(account_id: str, payload: dict, admin: User = Depends(get_admin_user)):
    res = await pay_accounts.update_account(account_id, payload)
    if not res:
        raise HTTPException(status_code=404, detail="Cont inexistent")
    await db.action_logs.insert_one({
        "log_id": new_id("log_"), "user_id": admin.user_id, "action": "admin.payment_accounts.update",
        "meta": {"account_id": account_id, "fields": list(payload.keys())},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return res


@router.delete("/admin/payment-accounts/{account_id}")
async def admin_delete_payment_account(account_id: str, admin: User = Depends(get_admin_user)):
    ok = await pay_accounts.delete_account(account_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Cont inexistent")
    await db.action_logs.insert_one({
        "log_id": new_id("log_"), "user_id": admin.user_id, "action": "admin.payment_accounts.delete",
        "meta": {"account_id": account_id},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"deleted": True}
