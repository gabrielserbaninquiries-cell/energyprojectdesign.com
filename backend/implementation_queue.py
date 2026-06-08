"""AI Implementation Queue — Self Check + Self Update + Run Update.

Conform `Prompt creeare program chat GPT.docx` (specificație literală):

AI Developer trebuie să poată:
1. Scana aplicația (Self Check)
2. Detecta funcții lipsă, butoane fără logică, module incomplete
3. Crea propuneri (Implementation Queue) — fiecare cu:
   - ID
   - Titlu
   - Descriere
   - Motiv
   - Impact
   - Risc
   - Fișiere vizate
   - Modul afectat
   - Status (pending / approved / rejected / applied)
   - Buton individual aprobare/respingere
4. Self Implement — aplică DOAR modificări sigure, controlate, aprobate
5. Self Update — registry de propuneri + istoric + rollback
6. Run Update — doar cu backup + log

REGULĂ: AI Developer NU modifică direct nucleul fără aprobare.
"""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from db import db


# ============================================================================
# Categorii de propuneri (intent detection)
# ============================================================================
PROPOSAL_CATEGORIES = [
    "date_proiect_repair",        # Câmpuri lipsă pe Date proiect
    "date_tehnice_repair",        # Câmpuri lipsă pe Date tehnice
    "calc_box_implementation",    # Casete inteligente de calcul lipsă
    "document_generation",        # Generare documente noi
    "stamp_mapping",              # Mapare ștampile pe documente
    "email_preparation",          # Pregătire email cu placeholdere
    "signature_certification",    # Semnătură internă / QES
    "doc_verification",           # Audit documentație
    "plan_pricing",               # Modificare plan / preț
    "purchasing_intent",          # Flow achiziție
    "interface_audit",            # Audit pagini & butoane
    "self_update",                # Sincronizare prompt master
    "new_industry_skeleton",      # Produs nou pe altă infrastructură
    "bug_fix",                    # Reparare bug
    "ui_polish",                  # Îmbunătățire UI
]

PROPOSAL_STATUS = ["pending", "approved", "rejected", "applied", "rolled_back"]


# ============================================================================
# Self Check — scanare aplicație
# ============================================================================
async def self_check_pages() -> List[Dict[str, Any]]:
    """Lista expected vs implemented pages."""
    expected_pages = [
        # (id, label, path, must_exist)
        ("login", "Login", "/login", True),
        ("dashboard", "Panou principal", "/dashboard", True),
        ("project_data", "Date proiect", "/proiect", True),
        ("technical_data", "Date tehnice", "/tehnice", True),
        ("smart_calc", "Calcul inteligent", "/calc", True),
        ("documents", "Documente", "/documente", True),
        ("stamps", "Ștampile", "/stampile", True),
        ("emails", "Email-uri", "/emailuri", True),
        ("internal_certifications", "Semnături digitale", "/semnaturi", True),
        ("verification", "Verifică documentație", "/verificare", True),
        ("pricing", "Planuri departamente", "/preturi", True),
        ("purchasing", "Purchasing", "/purchasing", True),
        ("ai_assistant", "Asistent comenzi", "/asistent", True),
        ("templates", "Placeholders / Templates", "/templates", True),
        ("audit_page", "Audit interfață", "/audit", True),
        ("developer", "AI Developer", "/developer", True),
        ("inside", "Inside Full (protejat)", "/inside", True),
        ("self_check", "Self Check", "/self-check", True),
        ("implementation_queue", "AI Implementation Queue", "/queue", True),
        ("update_center", "Update Center", "/updates", False),
        ("marketplace", "Marketplace", "/marketplace", False),
        ("settings", "Setări / Cont", "/setari", True),
        ("audit_logs", "Loguri", "/audit-logs", True),
        ("registry", "Registru proiecte", "/registru", True),
        ("import_export", "Import / Export", "/import-export", False),
        ("departments", "Departamente", "/departamente", False),
        ("contact", "Contact", "/contact", False),
        ("product_skeleton", "Product Skeleton", "/skeleton", False),
        ("gas_natural", "Gaze naturale Studio", "/gaze-naturale", True),
        ("forum", "Forum", "/forum", False),
        ("companies", "Companies Directory", "/companies", False),
        ("ai_agents", "AI Agents (Producator/User/Client/Dev)", "/agents", False),
    ]
    return [
        {"id": pid, "label": label, "path": path, "mandatory": must_exist, "expected": True}
        for pid, label, path, must_exist in expected_pages
    ]


# ============================================================================
# CRUD Implementation Queue
# ============================================================================
def _new_pid() -> str:
    import secrets
    return f"prop_{secrets.token_hex(6)}"


async def create_proposal(
    title: str,
    description: str,
    category: str,
    reason: str,
    impact: str,
    risk: str,
    target_files: Optional[List[str]] = None,
    target_module: Optional[str] = None,
    patch_plan: Optional[str] = None,
    created_by: str = "ai_developer",
) -> Dict[str, Any]:
    """Creează o propunere de implementare în queue."""
    if category not in PROPOSAL_CATEGORIES:
        category = "ui_polish"
    if risk not in ["low", "medium", "high", "info"]:
        risk = "medium"
    doc = {
        "pid": _new_pid(),
        "title": title.strip(),
        "description": description.strip(),
        "category": category,
        "reason": reason.strip(),
        "impact": impact.strip(),
        "risk": risk,
        "target_files": target_files or [],
        "target_module": target_module,
        "patch_plan": patch_plan,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": created_by,
        "approved_at": None,
        "approved_by": None,
        "applied_at": None,
        "rollback_data": None,
        "log": [{"ts": datetime.now(timezone.utc).isoformat(), "actor": created_by, "action": "created"}],
    }
    await db.implementation_queue.insert_one(doc)
    doc.pop("_id", None)
    return dict(doc)


async def list_proposals(status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    out = []
    async for d in db.implementation_queue.find(q, {"_id": 0}).sort("created_at", -1).limit(limit):
        out.append(d)
    return out


async def get_proposal(pid: str) -> Optional[Dict[str, Any]]:
    raw = await db.implementation_queue.find_one({"pid": pid}, {"_id": 0})
    if not raw:
        return None
    return dict(raw)


async def update_status(pid: str, new_status: str, actor: str, note: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if new_status not in PROPOSAL_STATUS:
        return None
    now = datetime.now(timezone.utc).isoformat()
    upd: Dict[str, Any] = {"status": new_status}
    if new_status == "approved":
        upd["approved_at"] = now
        upd["approved_by"] = actor
    if new_status == "applied":
        upd["applied_at"] = now
    log_entry = {"ts": now, "actor": actor, "action": new_status, "note": note}
    await db.implementation_queue.update_one(
        {"pid": pid},
        {"$set": upd, "$push": {"log": log_entry}},
    )
    return await get_proposal(pid)


# ============================================================================
# Default seed proposals (lucruri pe care AI Developer le poate genera autonom)
# ============================================================================
async def seed_default_proposals():
    """Creează propunerile inițiale dacă queue-ul e gol. Idempotent."""
    count = await db.implementation_queue.count_documents({})
    if count >= 5:
        return  # deja seed-uit
    DEFAULTS = [
        {
            "title": "Bara de comandă globală AI User (type + Enter)",
            "description": "Adaugă bară de search sus în pagină care primește comenzi în limbaj natural ('generează document', 'arată planuri', 'verifică documentația') și rutează utilizatorul către pagina țintă.",
            "category": "interface_audit",
            "reason": "Specificat literal în prompt 2.docx: 'adauga sus in pagina, o bara de search tip type + enter&run commands pentru ai user'",
            "impact": "Acces rapid la orice acțiune din orice pagină — reduce 50% timpul de navigare.",
            "risk": "low",
            "target_files": ["/app/frontend/src/components/AppShell.jsx"],
            "target_module": "frontend.appshell",
        },
        {
            "title": "Bară de comandă AI Developer (visible doar pentru developer)",
            "description": "Adaugă a doua bară de search sus în pagină — vizibilă DOAR pentru utilizatorii cu plan developer/admin — care primește comenzi pentru AI Developer chat.",
            "category": "interface_audit",
            "reason": "Specificat literal: 'inca una identica pentru developer care sa apara doar la logarea cu user si parola developer si sa aiba acces la toate functiile'",
            "impact": "Dezvoltatorul poate genera propuneri și aplica update-uri din orice pagină.",
            "risk": "low",
            "target_files": ["/app/frontend/src/components/AppShell.jsx"],
            "target_module": "frontend.appshell",
        },
        {
            "title": "Inside Full — enigma pepene galben + parola 2",
            "description": "Implementare zonă Inside Full protejată prin enigmă semantică + parola 29 stele + slash conform inside EPD.docx.",
            "category": "self_update",
            "reason": "Specificat literal în inside EPD.docx — chestiune de securitate aproape mondială.",
            "impact": "Deblocare funcții critice: defragmentare, ștergere definitivă, ghid societate, conturi bancare, product skeleton.",
            "risk": "high",
            "target_files": ["/app/backend/inside_full.py", "/app/frontend/src/pages/Inside.jsx"],
            "target_module": "backend.inside",
        },
        {
            "title": "Casete inteligente de calcul variabil vizibile pe Date Tehnice",
            "description": "Afișează cele 8 casete IF Calculus DIRECT pe pagina Date tehnice (nu doar pe SmartCalc).",
            "category": "calc_box_implementation",
            "reason": "Specificat literal în prompt 3.docx — fiecare casetă: name, sources, formula, result, status, recalculate button, copy button.",
            "impact": "Utilizatorul vede instant rezultatele pe măsură ce introduce date — flow mai natural.",
            "risk": "low",
            "target_files": ["/app/frontend/src/pages/TechnicalData.jsx"],
            "target_module": "frontend.technical",
        },
        {
            "title": "Product Skeleton — generator de produse pe alte infrastructuri",
            "description": "Export prompt schelet pentru produse noi: electric LES/LEA, apă-canal, telecom/fibră, fotovoltaice, arhitectură, feroviar, construcții, ofertare, mentenanță.",
            "category": "new_industry_skeleton",
            "reason": "Specificat literal — scheletul EPD trebuie să poată servi ca bază pentru orice industrie.",
            "impact": "Permite extindere rapidă a platformei la noi domenii fără rescriere.",
            "risk": "info",
            "target_files": ["/app/backend/product_skeleton.py"],
            "target_module": "backend.skeleton",
        },
        {
            "title": "Plan 'Inchiriaza autorizatie' — închiriere atestate ANRE",
            "description": "Plan special pentru proiectanți care vor să închirieze autorizația ANRE altor utilizatori sau societăți (cu plată, contract digital semnat).",
            "category": "plan_pricing",
            "reason": "Specificat literal în Feat-uri.docx: 'Inchiriaza autorizatie + Obtine un parteneriat pentru intocmire proiecte tehnice de specialitate'",
            "impact": "Revenue stream nou: comision din închirieri. Conectare ofertare cu execuție.",
            "risk": "medium",
            "target_files": ["/app/backend/authorizations_rental.py"],
            "target_module": "backend.rental",
        },
        {
            "title": "Audit interfață — diagnostic per pagină + buton + handler",
            "description": "Pagina Audit raportează pentru fiecare pagină: câmpuri așteptate vs prezente, butoane cu handlers vs moarte, status persistence, validare, export. Severitate + reparare recomandată.",
            "category": "interface_audit",
            "reason": "Specificat literal în prompt 3.docx — 'Audit must examine pages and buttons, not just page names.'",
            "impact": "Identifică imediat butoane moarte / pagini incomplete.",
            "risk": "low",
            "target_files": ["/app/frontend/src/pages/AuditPage.jsx"],
            "target_module": "frontend.audit",
        },
        {
            "title": "Workflow vizual: Date proiect → Date tehnice → Documente → ... → AI Agent",
            "description": "Pe Panou Principal, afișează un wizard pas-cu-pas cu starea fiecărui pas (Date proiect → Date tehnice → Calcul → Documente → Ștampile → Email → Semnături → Verifică → Planuri → Purchasing → AI Agent).",
            "category": "interface_audit",
            "reason": "Specificat literal în prompt 3.docx — workflow vizual cu carduri pe Dashboard.",
            "impact": "Utilizatorul vede instant pe ce pas se află și ce-i mai lipsește.",
            "risk": "low",
            "target_files": ["/app/frontend/src/pages/Dashboard.jsx"],
            "target_module": "frontend.dashboard",
        },
        {
            "title": "Auto-apply SEAP — alertă zilnică pentru lucrări potrivite societății",
            "description": "Scaner zilnic al platformei SEAP care identifică lucrări potrivite societății (în baza atestatelor ANRE + tipuri activități + CAEN) și trimite alerte email cu link aplicare.",
            "category": "self_update",
            "reason": "Specificat literal în Feat-uri.docx + 'De imbunatatit la aplicatie.docx': 'aplicatia va putea aplica automat la lucrari din platforma SEAP'",
            "impact": "Reducere efort comercial — niciun aviz/licitație ratat.",
            "risk": "medium",
            "target_files": ["/app/backend/seap_integration.py"],
            "target_module": "backend.seap",
        },
        {
            "title": "Timer real de closing licență în antet (dreapta sus)",
            "description": "În antetul aplicației, afișează contorul live al zilelor rămase din plan (sau expirat - cumpără upgrade).",
            "category": "interface_audit",
            "reason": "Specificat literal: 'In dreapta sus, fiecare licenta trebuie sa aiba timer real de closing licence'",
            "impact": "Conversie crescută la upgrade — utilizatorii văd permanent termenul.",
            "risk": "low",
            "target_files": ["/app/frontend/src/components/AppShell.jsx"],
            "target_module": "frontend.appshell",
        },
        {
            "title": "Recunoaștere OCR documente uploadate (DOCX + poze + PDF scanat)",
            "description": "Sistem AI care recunoaște inteligent conținutul documentelor uploadate (Word, PDF scanat, poze) și completează automat câmpurile aplicației relevante.",
            "category": "document_generation",
            "reason": "Specificat literal: 'Sistem de recunoastere AI inteligent a continutului documentelor si pozelor introduse'",
            "impact": "Eliminare 80% efort introducere date — proiectele se generează din scanări existente.",
            "risk": "high",
            "target_files": ["/app/backend/ocr_engine.py"],
            "target_module": "backend.ocr",
        },
    ]
    for d in DEFAULTS:
        await create_proposal(**d, created_by="ai_developer_seed")
