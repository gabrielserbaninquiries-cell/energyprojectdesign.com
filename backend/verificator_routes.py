"""Verificator workflow — VGD (ANRE) and RTE (MDLPA) verification module.

V12.0 — Adăugat conform cerinței user (CSV products 3 + plan 1000 EUR / lună VGD & RTE).

Use case principal:
1. Societatea (proiectant/societate/mass_production/osd) transmite un proiect către un verificator
   prin `POST /api/verificator/projects/{pid}/submit` (lookup verifier_email).
2. Verificatorul (plan = vgd sau rte) vede proiectele primite în `GET /api/verificator/inbox`.
3. Verificatorul deschide proiect → poate marca:
   - `verify` (decizie POSITIVĂ + observații + hash decizie)
   - `reject` (decizie NEGATIVĂ + motiv + termen remediere)
   - `return` (retrimite la societate fără decizie finală)
4. Toate proiectele primite/ procesate sunt vizibile în `GET /api/verificator/ledger` (grupate pe societate emitentă).

QES eIDAS: NU este implementat în această iterație. Câmpul `qes_signature` rămâne null cu mesaj
"Integrare QES (DigiSign/certSIGN) în curând". Decizia + hash + timestamp sunt înregistrate now.
"""
from __future__ import annotations
import hashlib
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/verificator", tags=["verificator"])

# Plans considered "verificator" (have access to inbox + ledger)
VERIFICATOR_PLANS = {"vgd", "rte"}
# Plans that can SUBMIT projects to a verificator
SUBMITTER_PLANS = {"basic", "operator", "proiectant", "executant", "avize", "ofertare",
                    "contabilitate", "societate", "mass_production", "osd",
                    "developer", "inside_full", "developer_elite", "cofounder", "society_admin"}


class SubmitToVerifierPayload(BaseModel):
    verifier_email: str
    role: str = Field(default="vgd", description="vgd | rte")
    note: Optional[str] = None


class VerifyDecisionPayload(BaseModel):
    observations: str = Field(..., description="Observații / referat verificator")
    decision: str = Field(..., description="approved | rejected | returned")
    deadline_days: Optional[int] = Field(default=None, description="Termen remediere (zile)")
    reason: Optional[str] = Field(default=None, description="Motiv refuz / returnare")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _decision_hash(pid: str, observations: str, decision: str, verifier_email: str, at: str) -> str:
    payload = f"{pid}|{decision}|{observations}|{verifier_email}|{at}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _user_plan(user) -> str:
    return getattr(user, "plan_id", None) or getattr(user, "plan", None) or "free"


def make_verificator_router(db, get_current_user):
    r = router

    # ============ SUBMIT TO VERIFIER ============
    @r.post("/projects/{pid}/submit")
    async def submit_to_verifier(pid: str, payload: SubmitToVerifierPayload, user=Depends(get_current_user)):
        """Societate transmite un proiect către un verificator atestat (VGD sau RTE)."""
        plan_id = _user_plan(user)
        if plan_id not in SUBMITTER_PLANS:
            raise HTTPException(403, "Planul tău nu permite transmiterea proiectelor către verificator.")
        role = (payload.role or "vgd").lower()
        if role not in {"vgd", "rte"}:
            raise HTTPException(400, "Rol invalid. Permise: vgd, rte.")

        doc = await db.gas_projects.find_one(
            {"pid": pid, "owner_id": user.user_id, "deleted": {"$ne": True}},
            {"_id": 0}
        )
        if not doc:
            raise HTTPException(404, "Proiect inexistent sau nu deții acces.")

        verifier_email = (payload.verifier_email or "").strip().lower()
        if not verifier_email:
            raise HTTPException(400, "Email verificator obligatoriu.")
        verifier = await db.users.find_one({"email": verifier_email}, {"_id": 0, "user_id": 1, "plan": 1, "name": 1, "email": 1})
        if not verifier:
            raise HTTPException(404, f"Verificatorul {verifier_email} nu există în platformă. Cere-i să-și creeze cont și să activeze planul {role.upper()}.")
        if verifier.get("plan") not in VERIFICATOR_PLANS:
            raise HTTPException(400, f"Userul {verifier_email} nu are plan activ de Verificator ({role.upper()}). Planul curent: {verifier.get('plan')}")

        now = _now_iso()
        verif_state = {
            "status": "pending",  # pending | in_review | approved | rejected | returned
            "verifier_user_id": verifier["user_id"],
            "verifier_email": verifier_email,
            "verifier_name": verifier.get("name") or verifier_email,
            "verifier_role": role,
            "submitter_user_id": user.user_id,
            "submitter_email": user.email,
            "submitted_at": now,
            "submit_note": (payload.note or "").strip() or None,
            "observations": None,
            "decision_hash": None,
            "decided_at": None,
            "qes_signature": None,  # populat când vom integra DigiSign/certSIGN
            "qes_pending_integration": True,
        }

        await db.gas_projects.update_one(
            {"pid": pid},
            {
                "$set": {
                    "verification_state": verif_state,
                    "updated_at": now,
                },
                "$push": {
                    "shared_access": {
                        "email": verifier_email,
                        "user_id": verifier["user_id"],
                        "role": role,
                        "shared_at": now,
                        "shared_by": user.email,
                        "note": (payload.note or "").strip() or None,
                    },
                    "audit_log": {
                        "action": "submit_to_verifier",
                        "by": user.email,
                        "to": verifier_email,
                        "role": role,
                        "at": now,
                    },
                },
            }
        )
        return {"ok": True, "verification_state": verif_state}

    # ============ INBOX (PROIECTE PRIMITE) ============
    @r.get("/inbox")
    async def verificator_inbox(status: Optional[str] = None, user=Depends(get_current_user)):
        """Lista proiectelor primite de către verificatorul curent."""
        plan_id = _user_plan(user)
        if plan_id not in VERIFICATOR_PLANS and not getattr(user, "is_developer", False) and not getattr(user, "is_admin", False):
            raise HTTPException(403, f"Această secțiune este disponibilă doar utilizatorilor cu plan VGD sau RTE. Planul tău curent: {plan_id}")

        query: Dict[str, Any] = {
            "verification_state.verifier_user_id": user.user_id,
            "deleted": {"$ne": True},
        }
        if status:
            query["verification_state.status"] = status

        items: List[Dict[str, Any]] = []
        async for doc in db.gas_projects.find(query, {"_id": 0}).sort("verification_state.submitted_at", -1):
            items.append({
                "pid": doc.get("pid"),
                "title": doc.get("title"),
                "industry": doc.get("industry") or "gaze_naturale",
                "phase": doc.get("phase"),
                "verification_state": doc.get("verification_state"),
                "owner_email": (doc.get("verification_state") or {}).get("submitter_email"),
                "updated_at": doc.get("updated_at"),
                "fields_count": len((doc.get("fields") or {})),
            })
        return {"items": items, "total": len(items)}

    # ============ LEDGER (TOATE PROIECTELE PROCESATE) ============
    @r.get("/ledger")
    async def verificator_ledger(user=Depends(get_current_user)):
        """Evidență (ledger) tuturor proiectelor procesate, grupate pe societate emitentă."""
        plan_id = _user_plan(user)
        if plan_id not in VERIFICATOR_PLANS and not getattr(user, "is_developer", False) and not getattr(user, "is_admin", False):
            raise HTTPException(403, f"Această secțiune este disponibilă doar utilizatorilor cu plan VGD sau RTE. Planul tău curent: {plan_id}")

        query = {
            "verification_state.verifier_user_id": user.user_id,
            "deleted": {"$ne": True},
        }
        grouped: Dict[str, Dict[str, Any]] = {}
        async for doc in db.gas_projects.find(query, {"_id": 0}).sort("verification_state.submitted_at", -1):
            vs = doc.get("verification_state") or {}
            submitter_email = vs.get("submitter_email") or "necunoscut"
            if submitter_email not in grouped:
                grouped[submitter_email] = {
                    "submitter_email": submitter_email,
                    "projects": [],
                    "counts": {"pending": 0, "in_review": 0, "approved": 0, "rejected": 0, "returned": 0},
                }
            grouped[submitter_email]["projects"].append({
                "pid": doc.get("pid"),
                "title": doc.get("title"),
                "status": vs.get("status"),
                "submitted_at": vs.get("submitted_at"),
                "decided_at": vs.get("decided_at"),
                "observations": vs.get("observations"),
                "decision_hash": vs.get("decision_hash"),
            })
            st = vs.get("status") or "pending"
            if st in grouped[submitter_email]["counts"]:
                grouped[submitter_email]["counts"][st] += 1
        return {"groups": list(grouped.values()), "total_societies": len(grouped)}

    # ============ ACȚIUNI (APROBĂ / RESPINGE / RETURNEAZĂ) ============
    @r.post("/projects/{pid}/decide")
    async def verificator_decide(pid: str, payload: VerifyDecisionPayload, user=Depends(get_current_user)):
        """Verificator marchează decizia (approved | rejected | returned) pentru un proiect."""
        plan_id = _user_plan(user)
        if plan_id not in VERIFICATOR_PLANS and not getattr(user, "is_developer", False) and not getattr(user, "is_admin", False):
            raise HTTPException(403, "Doar verificatorii VGD/RTE pot decide asupra proiectelor.")

        decision = (payload.decision or "").lower().strip()
        if decision not in {"approved", "rejected", "returned"}:
            raise HTTPException(400, "Decision invalid. Permise: approved, rejected, returned.")
        observations = (payload.observations or "").strip()
        if not observations:
            raise HTTPException(400, "Observații obligatorii pentru orice decizie.")

        doc = await db.gas_projects.find_one(
            {"pid": pid, "verification_state.verifier_user_id": user.user_id, "deleted": {"$ne": True}},
            {"_id": 0}
        )
        if not doc:
            raise HTTPException(404, "Proiect inexistent sau nu îți este atribuit pentru verificare.")

        now = _now_iso()
        d_hash = _decision_hash(pid, observations, decision, user.email, now)
        new_status_map = {"approved": "approved", "rejected": "rejected", "returned": "returned"}
        new_status = new_status_map[decision]

        update_fields = {
            "verification_state.status": new_status,
            "verification_state.observations": observations,
            "verification_state.decision_hash": d_hash,
            "verification_state.decided_at": now,
            "verification_state.deadline_days": payload.deadline_days,
            "verification_state.reason": payload.reason,
            "updated_at": now,
        }
        await db.gas_projects.update_one(
            {"pid": pid},
            {
                "$set": update_fields,
                "$push": {
                    "audit_log": {
                        "action": f"verifier_{decision}",
                        "by": user.email,
                        "decision_hash": d_hash,
                        "observations_preview": observations[:200],
                        "at": now,
                    }
                },
            }
        )

        # Best-effort email back to societate
        try:
            from email_sender import send_plain_email
            submitter_email = (doc.get("verification_state") or {}).get("submitter_email")
            if submitter_email:
                role = (doc.get("verification_state") or {}).get("verifier_role", "vgd").upper()
                subject = f"[EPD] Verificare {role}: «{doc.get('title', pid)}» — {decision.upper()}"
                body = (
                    f"Salut,\n\n"
                    f"Verificatorul {role} ({user.email}) a marcat proiectul «{doc.get('title', pid)}» ca: {decision.upper()}.\n\n"
                    f"Observații:\n{observations}\n\n"
                    f"Hash decizie (SHA-256): {d_hash}\n"
                    f"Data deciziei: {now}\n\n"
                    f"Vezi proiect: {pid}\n\n"
                    f"-- Energy Project Design"
                )
                send_plain_email(submitter_email, subject, body)
        except Exception:
            pass

        return {
            "ok": True,
            "status": new_status,
            "decision_hash": d_hash,
            "decided_at": now,
            "qes_signature": None,
            "qes_note": "Integrare QES eIDAS (DigiSign/certSIGN) în curând. Decizia este înregistrată cu hash SHA-256 + timestamp.",
        }

    # ============ PROIECT DETAIL ============
    @r.get("/projects/{pid}")
    async def verificator_project_detail(pid: str, user=Depends(get_current_user)):
        """Detalii complete proiect pentru verificator."""
        plan_id = _user_plan(user)
        is_priv = getattr(user, "is_developer", False) or getattr(user, "is_admin", False)
        if plan_id not in VERIFICATOR_PLANS and not is_priv:
            raise HTTPException(403, "Acces restricționat la verificatori VGD/RTE.")
        query = {"pid": pid, "deleted": {"$ne": True}}
        if not is_priv:
            query["verification_state.verifier_user_id"] = user.user_id
        doc = await db.gas_projects.find_one(query, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Proiect inexistent sau nu îți aparține.")
        return doc

    return r
