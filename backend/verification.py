"""Verification engine — produces a documentation completeness report.

Refactored out of server.py to keep the main router slim. Each check is a small
helper that returns a single `Check` dict. The orchestrator gathers them into a
final report with an overall score.
"""
from typing import List, Dict, Any
from datetime import datetime, timezone

# Required fields imported lazily to avoid circular import
REQUIRED_PROJECT_FIELDS = [
    "client_nume", "client_adresa", "client_cnp_cui", "client_telefon",
    "obiectiv_lucrare", "amplasament", "judet", "localitate",
    "beneficiar", "executant_nume", "executant_atestat",
    "date_proiect_titlu", "date_proiect_nr", "date_proiect_data",
]

TECH_REQUIRED_FIELDS = ["debit_instalat", "presiune_regim", "diametru_conducta", "material_conducta", "lungime_bransament"]


def _status_from_score(score: float, ok_threshold: int = 100, warn_threshold: int = 50) -> str:
    if score >= ok_threshold:
        return "ok"
    if score >= warn_threshold:
        return "warning"
    return "missing"


def _completion_pct(project: Dict[str, Any]) -> int:
    filled = sum(1 for f in REQUIRED_PROJECT_FIELDS if str(project.get(f) or "").strip())
    return int(round(100.0 * filled / max(1, len(REQUIRED_PROJECT_FIELDS))))


def _missing_fields(project: Dict[str, Any]) -> List[str]:
    return [f for f in REQUIRED_PROJECT_FIELDS if not str(project.get(f) or "").strip()]


def check_project_data(project: Dict[str, Any]) -> Dict[str, Any]:
    score = _completion_pct(project)
    missing = _missing_fields(project)
    detail = f"Completare: {score}%. Câmpuri lipsă: " + (", ".join(missing) if missing else "niciun")
    return {
        "key": "project_data", "label": "Date proiect",
        "status": _status_from_score(score), "score": score, "severity": "high",
        "detail": detail, "fix_url": "/proiect",
    }


def check_technical_data(td: Dict[str, Any]) -> Dict[str, Any]:
    filled = sum(1 for f in TECH_REQUIRED_FIELDS if td.get(f) not in (None, "", 0))
    score = round(100.0 * filled / len(TECH_REQUIRED_FIELDS), 1)
    return {
        "key": "technical_data", "label": "Date tehnice",
        "status": _status_from_score(score), "score": score, "severity": "high",
        "detail": f"Completare: {score}%.", "fix_url": "/tehnice",
    }


def check_smart_calc(calc: Dict[str, Any]) -> Dict[str, Any]:
    has_results = bool(calc) and any(r.get("status") == "ok" for r in calc.values())
    return {
        "key": "smart_calc", "label": "Calcul inteligent",
        "status": "ok" if has_results else "missing",
        "score": 100 if has_results else 0, "severity": "medium",
        "detail": "Rezultatele calculului sunt disponibile." if has_results else "Calculul nu a fost rulat.",
        "fix_url": "/calcul",
    }


def _count_check(*, key: str, label: str, count: int, fix_url: str, severity: str = "medium", warning_when_zero: bool = False) -> Dict[str, Any]:
    if count > 0:
        status, score = "ok", 100
    elif warning_when_zero:
        status, score = "warning", 0
    else:
        status, score = "missing", 0
    return {
        "key": key, "label": label, "status": status, "score": score, "severity": severity,
        "detail": f"{count} {label.lower()}." if count != 1 else f"1 {label.lower().rstrip('e')}.",
        "fix_url": fix_url,
    }


def check_templates(count: int) -> Dict[str, Any]:
    c = _count_check(key="templates", label="Șabloane încărcate", count=count, fix_url="/templates")
    c["detail"] = f"{count} șabloane disponibile."
    return c


def check_documents(count: int) -> Dict[str, Any]:
    c = _count_check(key="documents", label="Documente generate", count=count, fix_url="/documents", severity="low", warning_when_zero=True)
    c["detail"] = f"{count} documente."
    return c


def check_stamps(count: int) -> Dict[str, Any]:
    c = _count_check(key="stamps", label="Ștampile autorizate", count=count, fix_url="/stamps", warning_when_zero=True)
    c["detail"] = f"{count} ștampile."
    return c


def check_certifications(count: int) -> Dict[str, Any]:
    c = _count_check(key="certifications", label="Certificări interne (VGD/RTE)", count=count, fix_url="/certificari", warning_when_zero=True)
    c["detail"] = f"{count} certificări înregistrate."
    return c


def check_plan(plan_name: str, plan_cfg: Dict[str, Any]) -> Dict[str, Any]:
    export_allowed = bool(plan_cfg.get("export_allowed"))
    return {
        "key": "plan", "label": "Plan utilizator",
        "status": "ok" if plan_name != "basic" else "warning",
        "score": 100 if export_allowed else 50, "severity": "low",
        "detail": f"Plan curent: {plan_cfg.get('name', plan_name)} ({plan_cfg.get('label', '')}). "
                  f"Export: {'permis' if export_allowed else 'interzis'}",
        "fix_url": "/pricing",
    }


def build_report(*, project: Dict[str, Any], counts: Dict[str, int], plan_name: str, plan_cfg: Dict[str, Any]) -> Dict[str, Any]:
    """Aggregate all checks into a single report dict. Pure function — no DB access."""
    td = project.get("technical_data") or {}
    calc = project.get("calc_results") or {}
    checks: List[Dict[str, Any]] = [
        check_project_data(project),
        check_technical_data(td),
        check_smart_calc(calc),
        check_templates(counts.get("templates", 0)),
        check_documents(counts.get("documents", 0)),
        check_stamps(counts.get("stamps", 0)),
        check_certifications(counts.get("certifications", 0)),
        check_plan(plan_name, plan_cfg),
    ]
    overall = round(sum(c["score"] for c in checks) / max(1, len(checks)), 1)
    return {
        "overall_score": overall,
        "checks": checks,
        "summary": {
            "ok": sum(1 for c in checks if c["status"] == "ok"),
            "warning": sum(1 for c in checks if c["status"] == "warning"),
            "missing": sum(1 for c in checks if c["status"] == "missing"),
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
