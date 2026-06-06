"""Smart calculation engine for technical data of natural gas projects."""
from typing import Dict, Optional


def _f(value, default=None):
    """Safe float parse."""
    try:
        if value in (None, ""):
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def calculate(td: Dict) -> Dict:
    """Run all smart calculations on a technical-data dict and return the results.

    Each result includes: value, formula (str), explanation, status, sources.
    """
    debit_instalat = _f(td.get("debit_instalat"))
    presiune_regim = td.get("presiune_regim")
    lungime_bransament = _f(td.get("lungime_bransament"))

    results = {}

    # Debit calculat — copy of installed value
    if debit_instalat is not None:
        results["debit_calculat_mc_h"] = {
            "value": round(debit_instalat, 2),
            "formula": "debit_calculat_mc_h = debit_instalat",
            "explanation": "Debitul calculat este egal cu debitul instalat declarat.",
            "status": "ok",
            "sources": ["debit_instalat"],
        }
    else:
        results["debit_calculat_mc_h"] = {
            "value": None, "formula": "debit_calculat_mc_h = debit_instalat",
            "explanation": "Lipsă debit_instalat.", "status": "missing", "sources": ["debit_instalat"],
        }

    # Debit recomandat — 10% margin
    if debit_instalat is not None:
        v = round(debit_instalat * 1.10, 2)
        results["debit_recomandat_mc_h"] = {
            "value": v,
            "formula": "debit_recomandat_mc_h = debit_instalat × 1.10",
            "explanation": "Debitul recomandat include o marjă tehnică de 10% peste debitul instalat.",
            "status": "ok",
            "sources": ["debit_instalat"],
        }
    else:
        results["debit_recomandat_mc_h"] = {
            "value": None, "formula": "debit_instalat × 1.10",
            "explanation": "Lipsă debit_instalat.", "status": "missing", "sources": ["debit_instalat"],
        }

    # Putere instalată kW — factor 10.6
    if debit_instalat is not None:
        v = round(debit_instalat * 10.6, 2)
        results["putere_instalata_kw"] = {
            "value": v,
            "formula": "putere_instalata_kw = debit_instalat × 10.6",
            "explanation": "Putere termică instalată estimată (PCI gaz natural ≈ 10.6 kWh/mc).",
            "status": "ok",
            "sources": ["debit_instalat"],
        }
    else:
        results["putere_instalata_kw"] = {
            "value": None, "formula": "debit_instalat × 10.6",
            "explanation": "Lipsă debit_instalat.", "status": "missing", "sources": ["debit_instalat"],
        }

    # Risc presiune
    if presiune_regim in (None, ""):
        results["risc_presiune"] = {
            "value": "presiune lipsă",
            "formula": "if presiune_regim missing → presiune lipsă",
            "explanation": "Nu este declarat regimul de presiune. Completați câmpul.",
            "status": "missing", "sources": ["presiune_regim"],
        }
    elif lungime_bransament is not None and lungime_bransament > 30:
        results["risc_presiune"] = {
            "value": "verificare presiune necesară",
            "formula": "if lungime_bransament > 30m → verificare necesară",
            "explanation": "Branșament lung — verificare suplimentară a pierderii de presiune.",
            "status": "warning",
            "sources": ["presiune_regim", "lungime_bransament"],
        }
    else:
        results["risc_presiune"] = {
            "value": "normal",
            "formula": "altfel → normal",
            "explanation": "Regimul de presiune se încadrează în parametri normali.",
            "status": "ok",
            "sources": ["presiune_regim", "lungime_bransament"],
        }

    # Estimare cost branșament — 120 RON/m
    if lungime_bransament is not None:
        v = round(lungime_bransament * 120.0, 2)
        results["estimare_cost"] = {
            "value": v,
            "formula": "estimare_cost = lungime_bransament × 120 RON",
            "explanation": "Cost orientativ de bază pentru execuția branșamentului. Nu include avize, post reglare, contor sau TVA.",
            "status": "ok",
            "sources": ["lungime_bransament"],
            "unit": "RON",
        }
    else:
        results["estimare_cost"] = {
            "value": None, "formula": "lungime_bransament × 120",
            "explanation": "Lipsă lungime_bransament.", "status": "missing", "sources": ["lungime_bransament"], "unit": "RON",
        }

    # Recomandare contor
    if debit_instalat is None:
        results["contor_orientativ"] = {
            "value": None, "formula": "table(debit_instalat)",
            "explanation": "Lipsă debit_instalat.", "status": "missing", "sources": ["debit_instalat"],
        }
    elif debit_instalat <= 6:
        results["contor_orientativ"] = {"value": "G4", "formula": "debit ≤ 6 → G4", "explanation": "Contor recomandat G4 pentru consumatori casnici uzuali.", "status": "ok", "sources": ["debit_instalat"]}
    elif debit_instalat <= 10:
        results["contor_orientativ"] = {"value": "G6", "formula": "6 < debit ≤ 10 → G6", "explanation": "Contor recomandat G6 pentru consum mediu.", "status": "ok", "sources": ["debit_instalat"]}
    elif debit_instalat <= 16:
        results["contor_orientativ"] = {"value": "G10", "formula": "10 < debit ≤ 16 → G10", "explanation": "Contor recomandat G10 pentru consum ridicat.", "status": "ok", "sources": ["debit_instalat"]}
    else:
        results["contor_orientativ"] = {"value": "verificare dimensionare contor", "formula": "debit > 16 → verificare", "explanation": "Debit mare — dimensionarea contorului trebuie verificată de inginer specializat.", "status": "warning", "sources": ["debit_instalat"]}

    return results
