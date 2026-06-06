"""Project lifecycle module — defines project statuses, allowed transitions,
auto-detection from project completeness, and the next best action.

Statuses follow the documentation requirements (10 stages).
"""
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timezone


# ============================================================
# Status catalog
# ============================================================
STATUSES = [
    {"id": "draft",                       "label": "Schiță",                              "color": "gray",   "stage": 0,
     "description": "Proiect nou. Toate datele lipsesc."},
    {"id": "date_proiect_incomplete",     "label": "Date proiect incomplete",             "color": "amber",  "stage": 1,
     "description": "Beneficiarul, adresa sau alte date administrative sunt incomplete."},
    {"id": "date_tehnice_incomplete",     "label": "Date tehnice incomplete",             "color": "amber",  "stage": 2,
     "description": "Datele tehnice (debit, presiune, diametru) nu sunt completate integral."},
    {"id": "calcul_neefectuat",           "label": "Calcul inteligent neefectuat",        "color": "amber",  "stage": 3,
     "description": "Datele sunt complete dar calculul inteligent nu a fost rulat încă."},
    {"id": "documente_generate",          "label": "Documente generate",                  "color": "blue",   "stage": 4,
     "description": "Toate documentele tehnice au fost generate (memoriu, cerere, borderou)."},
    {"id": "in_verificare_vgd",           "label": "În verificare VGD",                   "color": "blue",   "stage": 5,
     "description": "Documentația este în curs de verificare de către VGD."},
    {"id": "in_verificare_rte",           "label": "În verificare RTE",                   "color": "blue",   "stage": 6,
     "description": "Documentația este în curs de verificare de către RTE."},
    {"id": "transmis_osd",                "label": "Transmis către OSD",                  "color": "blue",   "stage": 7,
     "description": "Documentația a fost trimisă către Operatorul Sistemului de Distribuție."},
    {"id": "aprobat",                     "label": "Aprobat",                             "color": "green",  "stage": 8,
     "description": "OSD a aprobat documentația."},
    {"id": "respins",                     "label": "Respins",                             "color": "red",    "stage": 8,
     "description": "OSD a respins documentația. Necesită corecții."},
    {"id": "finalizat",                   "label": "Finalizat",                           "color": "green",  "stage": 9,
     "description": "Lucrarea este executată și recepționată."},
    {"id": "arhivat",                     "label": "Arhivat",                             "color": "gray",   "stage": 10,
     "description": "Proiect închis și arhivat. Doar pentru consultare."},
]

STATUS_BY_ID = {s["id"]: s for s in STATUSES}


def status_meta(status_id: str) -> Dict:
    return STATUS_BY_ID.get(status_id, STATUS_BY_ID["draft"])


# ============================================================
# Required fields for "complete"
# ============================================================
REQUIRED_PROJECT_FIELDS = [
    "client_nume", "client_adresa", "obiectiv_lucrare", "amplasament",
    "judet", "localitate", "beneficiar", "executant_nume",
]
REQUIRED_TECH_FIELDS = ["debit_instalat", "presiune_regim", "diametru_conducta", "material_conducta"]


def _is_filled(value) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    return bool(value)


def has_complete_project_data(project: Dict) -> bool:
    return all(_is_filled(project.get(f)) for f in REQUIRED_PROJECT_FIELDS)


def has_complete_technical_data(project: Dict) -> bool:
    td = project.get("technical_data") or {}
    return all(_is_filled(td.get(f)) for f in REQUIRED_TECH_FIELDS)


def has_calc_results(project: Dict) -> bool:
    calc = project.get("calc_results") or {}
    return bool(calc) and any((r or {}).get("status") == "ok" for r in calc.values())


# ============================================================
# Auto-detect status from project content
# ============================================================
def detect_status(project: Dict, counts: Dict[str, int]) -> str:
    """Returns the recommended status_id given the current project state.

    Manual override is honored: if the project has `status` set to a stage
    higher than auto-detection (e.g. transmis_osd, aprobat, finalizat, arhivat),
    we keep the existing one.
    """
    current = (project.get("status") or "").strip()
    manual_lock = {"in_verificare_vgd", "in_verificare_rte", "transmis_osd", "aprobat", "respins", "finalizat", "arhivat"}
    if current in manual_lock:
        return current
    if not has_complete_project_data(project):
        return "date_proiect_incomplete" if any(_is_filled(project.get(f)) for f in REQUIRED_PROJECT_FIELDS) else "draft"
    if not has_complete_technical_data(project):
        return "date_tehnice_incomplete"
    if not has_calc_results(project):
        return "calcul_neefectuat"
    if counts.get("documents", 0) > 0:
        return "documente_generate"
    return "calcul_neefectuat"


# ============================================================
# Next best action
# ============================================================
def next_best_action(project: Dict, counts: Dict[str, int], plan_cfg: Dict) -> Dict:
    """Returns the single most useful next step for the user."""
    if not has_complete_project_data(project):
        missing = [f for f in REQUIRED_PROJECT_FIELDS if not _is_filled(project.get(f))]
        return {
            "title": "Completează datele administrative ale proiectului",
            "description": f"Câmpuri lipsă: {', '.join(missing[:6])}",
            "action_label": "Mergi la Date proiect",
            "action_url": "/proiect",
            "severity": "high",
        }
    if not has_complete_technical_data(project):
        td = project.get("technical_data") or {}
        missing = [f for f in REQUIRED_TECH_FIELDS if not _is_filled(td.get(f))]
        return {
            "title": "Completează datele tehnice",
            "description": f"Câmpuri lipsă: {', '.join(missing)}",
            "action_label": "Mergi la Date tehnice",
            "action_url": "/tehnice",
            "severity": "high",
        }
    if not has_calc_results(project):
        return {
            "title": "Rulează calculul inteligent",
            "description": "Datele sunt complete. Apasă \u201eRulează calcul\u201d pentru a obține rezultatele.",
            "action_label": "Calcul inteligent",
            "action_url": "/calcul",
            "severity": "medium",
        }
    if counts.get("templates", 0) == 0:
        return {
            "title": "Încarcă șablonul tău",
            "description": "Folosește template-urile sistem sau încarcă propriul DOCX cu placeholdere.",
            "action_label": "Mergi la Șabloane",
            "action_url": "/templates",
            "severity": "medium",
        }
    if counts.get("documents", 0) == 0:
        return {
            "title": "Generează prima documentație",
            "description": "Toate datele sunt gata. Generează cererea de racordare, memoriul tehnic și borderoul.",
            "action_label": "Mergi la Documente",
            "action_url": "/documents",
            "severity": "medium",
        }
    if counts.get("stamps", 0) == 0:
        return {
            "title": "Încarcă ștampila proiectantului",
            "description": "Documentele sunt generate. Asigură-te că ai ștampila aplicabilă.",
            "action_label": "Mergi la Ștampile",
            "action_url": "/stamps",
            "severity": "low",
        }
    if not plan_cfg.get("export_allowed"):
        return {
            "title": "Upgrade plan pentru export documentație",
            "description": f"Planul curent ({plan_cfg.get('label')}) nu permite export DOCX. Trebuie un plan plătit.",
            "action_label": "Vezi planurile",
            "action_url": "/pricing",
            "severity": "low",
        }
    return {
        "title": "Pregătește-te să transmiți către OSD",
        "description": "Documentația e gata. Pregătește email-ul către OSD și marchează proiectul ca transmis.",
        "action_label": "Email-uri",
        "action_url": "/email",
        "severity": "low",
    }


# ============================================================
# Smart audit score (weighted)
# ============================================================
WEIGHTS = {
    "project_data":   0.20,
    "technical_data": 0.25,
    "calc":           0.15,
    "templates":      0.10,
    "documents":      0.15,
    "stamps":         0.10,
    "certifications": 0.05,
}


def smart_audit_score(project: Dict, counts: Dict[str, int]) -> Dict:
    """Returns a weighted completion score (0-100) with per-section breakdown."""
    proj_score = 100.0 * sum(1 for f in REQUIRED_PROJECT_FIELDS if _is_filled(project.get(f))) / max(1, len(REQUIRED_PROJECT_FIELDS))
    td = project.get("technical_data") or {}
    tech_score = 100.0 * sum(1 for f in REQUIRED_TECH_FIELDS if _is_filled(td.get(f))) / max(1, len(REQUIRED_TECH_FIELDS))
    calc_score = 100.0 if has_calc_results(project) else 0.0
    breakdown = {
        "project_data":   round(proj_score, 1),
        "technical_data": round(tech_score, 1),
        "calc":           calc_score,
        "templates":      100.0 if counts.get("templates", 0) > 0 else 0.0,
        "documents":      100.0 if counts.get("documents", 0) > 0 else 0.0,
        "stamps":         100.0 if counts.get("stamps", 0) > 0 else 0.0,
        "certifications": 100.0 if counts.get("certifications", 0) > 0 else 0.0,
    }
    overall = round(sum(breakdown[k] * WEIGHTS[k] for k in WEIGHTS), 1)
    if overall >= 85:
        rating = "excellent"
    elif overall >= 60:
        rating = "good"
    elif overall >= 30:
        rating = "in_progress"
    else:
        rating = "starting"
    return {
        "overall_score": overall,
        "rating": rating,
        "breakdown": breakdown,
        "weights": WEIGHTS,
    }
