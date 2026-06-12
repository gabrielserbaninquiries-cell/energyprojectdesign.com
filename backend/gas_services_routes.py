"""
Gas project service catalog & one-shot Stripe checkout per service.

Spre deosebire de planuri lunare, aceste servicii sunt PURCHASED PER PROJECT:
- Pachet expres livrare 24h
- Semnătură digitală QES per document
- Dispatch SEAP automat
- Review tehnic de verificator certificat
- Carte tehnică legată în format fizic + curier
"""
from datetime import datetime, timezone
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/gas-project", tags=["gas-services"])

# === CATALOG DE SERVICII (ad-hoc per proiect) ===
SERVICE_CATALOG: Dict[str, Dict] = {
    "express_24h": {
        "id": "express_24h",
        "label": "Livrare expres 24h",
        "description": "Procesare prioritară a dosarului în maxim 24 ore (în loc de 5 zile lucrătoare).",
        "price_eur": 49.0,
        "icon": "Zap",
        "category": "expediere",
    },
    "qes_signature": {
        "id": "qes_signature",
        "label": "Semnătură digitală QES",
        "description": "Aplicare semnătură electronică calificată (QES) pe fiecare document DOCX → conversie PDF/A semnat legal.",
        "price_eur": 5.0,
        "unit": "per document",
        "icon": "FileSignature",
        "category": "semnatura",
    },
    "seap_dispatch": {
        "id": "seap_dispatch",
        "label": "Dispatch automat către OSD",
        "description": "Transmitere automată a documentației către operatorul de distribuție (Distrigaz / E.ON / Premier Energy) prin SEAP sau portalul OSD.",
        "price_eur": 15.0,
        "icon": "Send",
        "category": "expediere",
    },
    "tech_review": {
        "id": "tech_review",
        "label": "Review tehnic VGD certificat",
        "description": "Verificare independentă a documentației de către un Verificator de Gaze certificat ANRE — Referat de verificare oficial inclus.",
        "price_eur": 35.0,
        "icon": "ShieldCheck",
        "category": "verificare",
    },
    "carte_legata": {
        "id": "carte_legata",
        "label": "Carte Tehnică tipărită + curier",
        "description": "Tipărire Carte Tehnică în format A4 legată profesional + curier Fan Courier la adresa beneficiarului.",
        "price_eur": 25.0,
        "icon": "BookOpen",
        "category": "livrare",
    },
}


class ServiceCheckoutRequest(BaseModel):
    service_id: str
    origin_url: str
    quantity: int = 1


def _new_id(prefix: str) -> str:
    import uuid
    return f"{prefix}{uuid.uuid4().hex[:16]}"


def register_routes(app, db, get_current_user, _stripe_client):
    """Mount routes to the main FastAPI app with shared dependencies."""

    @app.get("/api/gas-project/{pid}/services")
    async def list_services(pid: str, user=Depends(get_current_user)):
        """Returnează catalog + status servicii deja cumpărate pentru proiect."""
        # Verify project ownership
        proj = await db.gas_projects.find_one({"pid": pid, "owner_id": user.user_id}, {"_id": 0, "pid": 1})
        if not proj:
            raise HTTPException(404, "Proiect inexistent")
        purchased = await db.gas_service_purchases.find(
            {"pid": pid, "user_id": user.user_id},
            {"_id": 0, "service_id": 1, "status": 1, "quantity": 1, "amount": 1, "created_at": 1, "completed_at": 1, "session_id": 1}
        ).sort("created_at", -1).to_list(length=50)
        purchased_active = {p["service_id"] for p in purchased if p.get("status") == "paid"}
        catalog = []
        for s in SERVICE_CATALOG.values():
            catalog.append({
                **s,
                "purchased": s["id"] in purchased_active,
            })
        return {
            "catalog": catalog,
            "purchases": purchased,
            "purchased_active": list(purchased_active),
        }

    @app.post("/api/gas-project/{pid}/service-checkout")
    async def service_checkout(pid: str, body: ServiceCheckoutRequest, request: Request, user=Depends(get_current_user)):
        """Creează Stripe Checkout session pentru un serviciu ad-hoc per proiect."""
        proj = await db.gas_projects.find_one({"pid": pid, "owner_id": user.user_id}, {"_id": 0, "pid": 1, "title": 1})
        if not proj:
            raise HTTPException(404, "Proiect inexistent")
        svc = SERVICE_CATALOG.get(body.service_id)
        if not svc:
            raise HTTPException(400, "Serviciu inexistent")
        qty = max(1, int(body.quantity or 1))
        amount = float(svc["price_eur"]) * qty

        from emergentintegrations.payments.stripe.checkout import CheckoutSessionRequest
        sc = _stripe_client(request)
        host_url = body.origin_url.rstrip("/")
        session_req = CheckoutSessionRequest(
            amount=amount,
            currency="eur",
            success_url=f"{host_url}/gaze-naturale/{pid}?service_session={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{host_url}/gaze-naturale/{pid}?service_cancelled=1",
            metadata={
                "user_id": user.user_id,
                "pid": pid,
                "service_id": svc["id"],
                "service_label": svc["label"],
                "quantity": str(qty),
                "type": "gas_service",
            },
        )
        sess = await sc.create_checkout_session(session_req)

        # Persist pending purchase row
        await db.gas_service_purchases.insert_one({
            "purchase_id": _new_id("gsp_"),
            "user_id": user.user_id,
            "pid": pid,
            "service_id": svc["id"],
            "service_label": svc["label"],
            "quantity": qty,
            "amount": amount,
            "currency": "eur",
            "session_id": sess.session_id,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"url": sess.url, "session_id": sess.session_id, "service": svc, "amount": amount}

    @app.get("/api/gas-project/{pid}/service-status/{sid}")
    async def service_status(pid: str, sid: str, request: Request, user=Depends(get_current_user)):
        """Verifică status Stripe + activează automat serviciul după plată (idempotent)."""
        purchase = await db.gas_service_purchases.find_one({"session_id": sid, "pid": pid, "user_id": user.user_id})
        if not purchase:
            raise HTTPException(404, "Cumpărare inexistentă")
        if purchase["status"] == "paid":
            return {"status": "paid", "service_id": purchase["service_id"], "already": True}
        sc = _stripe_client(request)
        status = await sc.get_checkout_status(sid)
        if status.payment_status == "paid":
            await db.gas_service_purchases.update_one(
                {"session_id": sid},
                {"$set": {
                    "status": "paid",
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                    "payment_status": "paid",
                }},
            )
            return {"status": "paid", "service_id": purchase["service_id"], "already": False}
        return {"status": status.status, "payment_status": status.payment_status}
