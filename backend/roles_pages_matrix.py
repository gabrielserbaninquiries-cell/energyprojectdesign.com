"""Roles × Pages Matrix V7.2 — sursa unică pentru ce poate face un user în funcție de planul său.

Conform cerinței user (mesaj 18):
    "structureaza paginile pe planurile de plata a industriilor si departamentelor
     conexe fiecarei pagini, conform serviciilor site-ului."

Fiecare pagină are:
- key: identificator unic
- path: ruta frontend
- label: nume vizibil în sidebar
- icon: nume lucide icon
- department: departamentul căruia îi aparține (proiectare/execuție/avize/recepție/verificare/ofertare/contabilitate/operator/admin/public)
- allowed_plans: listă plan_id-uri care au acces (sau ["*"] pentru toți userii logați)
- min_role: optional (admin/developer)

Plan IDs (din plans.py):
    free, trial, basic, operator, proiectant, executant, avize,
    ofertare, contabilitate, vgd, rte, societate, developer, inside_full
"""
from __future__ import annotations
from typing import Any, Dict, List

# All paid plans (everything except free/trial)
ALL_PAID = ["basic", "operator", "proiectant", "executant", "avize", "ofertare",
            "contabilitate", "vgd", "rte", "societate", "mass_production", "osd",
            "srl", "developer", "inside_full"]
ALL_AUTHENTICATED = ["*"]  # any logged-in user including free/trial

DEPARTMENTS = {
    "acasa":        {"label": "Acasă",                 "order": 1,  "icon": "Home",          "description": "Hub principal + dashboard personal"},
    "operator":     {"label": "Operator introducere",  "order": 2,  "icon": "Pencil",        "description": "Introducere date proiect (Operator/Basic)"},
    "proiectare":   {"label": "Proiectare",            "order": 3,  "icon": "PencilRuler",   "description": "DTAC, memoriu tehnic, caiet sarcini (Proiectant)"},
    "avize":        {"label": "Departament Avize",     "order": 4,  "icon": "ListChecks",    "description": "Toate avizele OSD + condiționale (Avize)"},
    "executie":     {"label": "Execuție",              "order": 5,  "icon": "HardHat",       "description": "Anunț, predare amplasament, PV-uri (Executant)"},
    "receptie":     {"label": "Recepție + PIF",        "order": 6,  "icon": "ClipboardCheck","description": "Carte tehnică + PIF + recepție (RTE)"},
    "verificare":   {"label": "Verificare VGD",        "order": 7,  "icon": "FileCheck",     "description": "Referat verificator atestat (VGD)"},
    "ofertare":     {"label": "Ofertare + SEAP",       "order": 8,  "icon": "Briefcase",     "description": "Oferte tehnice + comerciale + SEAP (Ofertare)"},
    "contabilitate":{"label": "Contabilitate",         "order": 9,  "icon": "Receipt",       "description": "ANAF e-Factura + facturare (Contabilitate)"},
    "marketplace":  {"label": "Marketplace",           "order": 10, "icon": "ShoppingBag",   "description": "Vânzări produse + servicii ad-hoc"},
    "imobiliare":   {"label": "Imobiliare",            "order": 11, "icon": "Building2",     "description": "Anunțuri vânzare + închiriere"},
    "comunitate":   {"label": "Comunitate",            "order": 12, "icon": "MessageSquare", "description": "Forum + grup anunțuri + colaborări"},
    "servicii":     {"label": "Servicii + Transport",  "order": 13, "icon": "Wrench",        "description": "Meseriași + logistică + smart pricing"},
    "ai":           {"label": "AI & Asistare",         "order": 14, "icon": "Sparkles",      "description": "Consultanță AI + 4 agents"},
    "business":     {"label": "Business CRM",          "order": 15, "icon": "Building2",     "description": "Clienți, companii, contracte (Societate)"},
    "admin":        {"label": "Admin",                 "order": 16, "icon": "ShieldCheck",   "description": "Configurare globală (Admin only)"},
    "cont":         {"label": "Cont",                  "order": 17, "icon": "Settings",      "description": "Profil + planuri + setări"},
}


PAGES: List[Dict[str, Any]] = [
    # ====================== ACASĂ ======================
    {"key": "home",         "path": "/acasa",                 "label": "Hub Ecosistem",      "icon": "Home",          "department": "acasa", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-acasa"},
    {"key": "dashboard",    "path": "/dashboard",             "label": "Panou principal",     "icon": "LayoutDashboard","department": "acasa", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-dashboard"},
    {"key": "projects",     "path": "/proiecte",              "label": "Proiectele mele",     "icon": "FolderKanban",  "department": "acasa", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-proiecte"},

    # ====================== OPERATOR ======================
    {"key": "doc_industrii","path": "/documentatie-industrii","label": "Industrii (13)",     "icon": "Compass",       "department": "operator", "allowed_plans": ["developer", "inside_full", "society_admin", "cofounder"], "min_role": "admin", "tid": "nav-documentatie-industrii"},
    {"key": "gaz_studio",   "path": "/gaze-naturale",          "label": "Gaze Naturale",       "icon": "Flame",         "department": "operator", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-gaze-naturale"},
    {"key": "parteneri",    "path": "/parteneri",             "label": "Parteneri & colaborări","icon": "Users",        "department": "operator", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-parteneri"},

    # ====================== PROIECTARE (Proiectant 129€) ======================
    {"key": "templates",    "path": "/templates",             "label": "Șabloane DOCX",      "icon": "FileText",      "department": "proiectare", "allowed_plans": ["proiectant", "societate", "developer", "inside_full"], "tid": "nav-templates"},
    {"key": "ai_consultant","path": "/consultant-ai",          "label": "Consultant AI",       "icon": "Sparkles",      "department": "proiectare", "allowed_plans": ["proiectant", "vgd", "rte", "societate", "developer", "inside_full"], "tid": "nav-consultant-ai"},
    {"key": "stamps",       "path": "/stamps",                "label": "Ștampile + Semnături","icon": "Stamp",         "department": "proiectare", "allowed_plans": ["proiectant", "vgd", "rte", "societate", "developer", "inside_full"], "tid": "nav-stamps"},

    # ====================== AVIZE (79€) ======================
    {"key": "documents",    "path": "/documents",             "label": "Documente generate", "icon": "FileCheck2",    "department": "avize", "allowed_plans": ["avize", "proiectant", "operator", "societate", "developer", "inside_full"], "tid": "nav-documents"},
    {"key": "verifica",     "path": "/verifica",              "label": "Verifică QR public", "icon": "GaugeCircle",   "department": "avize", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-verifica"},

    # ====================== EXECUȚIE (Executant 109€) ======================
    # Reuses gaz_studio + dispoziții; future: dedicated executant pages

    # ====================== RECEPȚIE + PIF (RTE 149€) ======================
    # Reuses gaz_studio + recepție secțiune

    # ====================== VERIFICARE (VGD/RTE 1000€) ======================
    {"key": "verif_workspace","path": "/verificator/inbox",     "label": "Inbox Verificare",   "icon": "InboxIcon",     "department": "verificare", "allowed_plans": ["vgd", "rte", "societate", "mass_production", "osd", "developer", "inside_full"], "tid": "nav-verif-inbox"},
    {"key": "verif_ledger",   "path": "/verificator/ledger",    "label": "Ledger proiecte",    "icon": "BookOpen",      "department": "verificare", "allowed_plans": ["vgd", "rte", "societate", "mass_production", "osd", "developer", "inside_full"], "tid": "nav-verif-ledger"},
    {"key": "certificate",  "path": "/certificate",           "label": "Certificate PKI",    "icon": "ShieldCheck",   "department": "verificare", "allowed_plans": ["vgd", "rte", "societate", "mass_production", "osd", "developer", "inside_full"], "tid": "nav-certificate"},

    # ====================== OFERTARE (89€) ======================
    {"key": "seap",         "path": "/seap-alerts",           "label": "SEAP Alerts",         "icon": "FileSearch",    "department": "ofertare", "allowed_plans": ["ofertare", "societate", "developer", "inside_full"], "tid": "nav-seap"},

    # ====================== CONTABILITATE (69€) ======================
    {"key": "anaf",         "path": "/anaf-efactura",         "label": "ANAF e-Factura",      "icon": "Receipt",       "department": "contabilitate", "allowed_plans": ["contabilitate", "societate", "developer", "inside_full"], "tid": "nav-anaf"},

    # ====================== MARKETPLACE (toți) ======================
    {"key": "marketplace",  "path": "/marketplace",           "label": "Anunțuri ad-hoc",     "icon": "ShoppingBag",   "department": "marketplace", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-marketplace"},

    # ====================== IMOBILIARE (toți) ======================
    {"key": "imobiliare",   "path": "/imobiliare",            "label": "Vânzare + Închiriere","icon": "Home",          "department": "imobiliare", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-imobiliare"},

    # ====================== COMUNITATE (toți) ======================
    {"key": "forum",        "path": "/forum-v7",              "label": "Forum + Anunțuri",    "icon": "MessageSquare", "department": "comunitate", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-forum-v7"},

    # ====================== SERVICII (toți) ======================
    {"key": "servicii",     "path": "/servicii",              "label": "Meseriași + Transport","icon": "Wrench",       "department": "servicii", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-servicii"},
    {"key": "smart_pricing","path": "/smart-pricing",         "label": "Calculator costuri",  "icon": "Calculator",    "department": "servicii", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-smart-pricing"},

    # ====================== AI & ASISTARE (Pro plans only) ======================
    {"key": "ai_agents",    "path": "/ai-agents",             "label": "4 AI Agents",        "icon": "Bot",           "department": "ai", "allowed_plans": ["proiectant", "vgd", "rte", "societate", "developer", "inside_full"], "tid": "nav-ai-agents"},

    # ====================== BUSINESS CRM (Societate 349€) ======================
    {"key": "crm",          "path": "/crm-abonati",           "label": "CRM Abonați",        "icon": "Users",         "department": "business", "allowed_plans": ["societate", "developer", "inside_full"], "tid": "nav-crm"},
    {"key": "clients",      "path": "/clients",               "label": "Clienți",            "icon": "Users",         "department": "business", "allowed_plans": ["societate", "developer", "inside_full"], "tid": "nav-clients"},
    {"key": "companies",    "path": "/companies",             "label": "Companii Directory", "icon": "Building2",     "department": "business", "allowed_plans": ["societate", "developer", "inside_full"], "tid": "nav-companies"},
    {"key": "contracts",    "path": "/contracts",             "label": "Contracte",          "icon": "FileText",      "department": "business", "allowed_plans": ["societate", "developer", "inside_full"], "tid": "nav-contracts"},
    {"key": "jobs",         "path": "/jobs",                  "label": "Job Board ANRE",     "icon": "BadgeCheck",    "department": "business", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-jobs"},
    {"key": "email",        "path": "/email",                 "label": "Email-uri",          "icon": "Mail",          "department": "business", "allowed_plans": ["proiectant", "vgd", "rte", "societate", "developer", "inside_full"], "tid": "nav-email"},

    # ====================== ADMIN (only admin role) ======================
    {"key": "admin_config", "path": "/admin/config",          "label": "Admin Config",       "icon": "ShieldCheck",   "department": "admin", "allowed_plans": ALL_AUTHENTICATED, "min_role": "admin", "tid": "nav-admin-config"},
    {"key": "admin_essentials","path": "/admin/essentials",   "label": "Esențiale funcționare","icon": "KeyRound",    "department": "admin", "allowed_plans": ALL_AUTHENTICATED, "min_role": "admin", "tid": "nav-admin-essentials"},
    {"key": "audit",        "path": "/logs",                  "label": "Registru audit",     "icon": "ListChecks",    "department": "admin", "allowed_plans": ALL_AUTHENTICATED, "min_role": "admin", "tid": "nav-logs"},

    # ====================== CONT (toți) ======================
    {"key": "company",      "path": "/company",               "label": "Profil societate",   "icon": "Building2",     "department": "cont", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-company"},
    {"key": "plans",        "path": "/planuri-departamente",  "label": "Planuri & departamente","icon": "CreditCard", "department": "cont", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-plans"},
    {"key": "billing",      "path": "/billing",               "label": "Facturare & istoric plăți","icon": "Receipt", "department": "cont", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-billing"},
    {"key": "settings",     "path": "/settings",              "label": "Setări",             "icon": "Settings",      "department": "cont", "allowed_plans": ALL_AUTHENTICATED, "tid": "nav-settings"},
]


def get_pages_for_user(user_plan: str = "free", is_admin: bool = False, is_developer: bool = False) -> List[Dict[str, Any]]:
    """Returnează lista paginilor accesibile pentru un user dat planul + rol."""
    effective_plan = "developer" if is_developer else user_plan
    result = []
    for p in PAGES:
        # Check min_role gate first
        min_role = p.get("min_role")
        if min_role == "admin" and not (is_admin or is_developer):
            continue
        # Check allowed_plans
        allowed = p["allowed_plans"]
        if "*" in allowed or effective_plan in allowed:
            result.append(p)
    return result


def group_by_department(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Grupează pagini pe departament, păstrând doar departamentele care au cel puțin o pagină accesibilă."""
    by_dept: Dict[str, List[Dict[str, Any]]] = {}
    for p in pages:
        d = p["department"]
        by_dept.setdefault(d, []).append(p)
    groups = []
    for dept_id, dept_meta in sorted(DEPARTMENTS.items(), key=lambda kv: kv[1]["order"]):
        if dept_id in by_dept and by_dept[dept_id]:
            groups.append({
                "id": dept_id,
                "label": dept_meta["label"],
                "icon": dept_meta["icon"],
                "description": dept_meta["description"],
                "order": dept_meta["order"],
                "pages": by_dept[dept_id],
            })
    return groups
