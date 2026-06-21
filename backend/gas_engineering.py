"""
gas_engineering — Real engineering calculations for gas projects.

Funcții bazate pe NTPEE 2018 (Ord. ANRE 89/2018) + standardele EN/ISO:
- Multi-tronson Renouard pressure drop (per tronson dynamic table)
- Smart sizing: lățime șanț, contor, regulator, debit consumatori
- Catalog materiale Anexa 13 — auto-suggest din 554 itemi pe baza câmpurilor proiect
"""
import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ============================================================================
# CONSTANTS (NTPEE 2018)
# ============================================================================

# Diametre exterioare reale PE 100 SDR 11 (EN 1555 + ISO 4427)
PE100_SDR11 = {
    20:  {"de_mm": 20,  "dn_mm": 16,  "perete_mm": 2.0},
    25:  {"de_mm": 25,  "dn_mm": 20,  "perete_mm": 2.3},
    32:  {"de_mm": 32,  "dn_mm": 26,  "perete_mm": 3.0},
    40:  {"de_mm": 40,  "dn_mm": 33,  "perete_mm": 3.7},
    50:  {"de_mm": 50,  "dn_mm": 41,  "perete_mm": 4.6},
    63:  {"de_mm": 63,  "dn_mm": 52,  "perete_mm": 5.8},
    75:  {"de_mm": 75,  "dn_mm": 61,  "perete_mm": 6.8},
    90:  {"de_mm": 90,  "dn_mm": 74,  "perete_mm": 8.2},
    110: {"de_mm": 110, "dn_mm": 90,  "perete_mm": 10.0},
    125: {"de_mm": 125, "dn_mm": 102, "perete_mm": 11.4},
    140: {"de_mm": 140, "dn_mm": 114, "perete_mm": 12.7},
    160: {"de_mm": 160, "dn_mm": 131, "perete_mm": 14.6},
    180: {"de_mm": 180, "dn_mm": 147, "perete_mm": 16.4},
    200: {"de_mm": 200, "dn_mm": 163, "perete_mm": 18.2},
}

# Catalog contoare standard (Itron / Elster / Honeywell)
CONTOARE_CATALOG = [
    {"model": "G1.6",  "qmin": 0.016, "qmax": 2.5,    "DN": "DN 20", "tip": "Diafragmă", "uz": "Casnic mic"},
    {"model": "G2.5",  "qmin": 0.025, "qmax": 4.0,    "DN": "DN 20", "tip": "Diafragmă", "uz": "Casnic standard"},
    {"model": "G4",    "qmin": 0.040, "qmax": 6.0,    "DN": "DN 25", "tip": "Diafragmă", "uz": "Casnic + CT"},
    {"model": "G6",    "qmin": 0.060, "qmax": 10.0,   "DN": "DN 25", "tip": "Diafragmă", "uz": "Casnic mare / Mic comercial"},
    {"model": "G10",   "qmin": 0.100, "qmax": 16.0,   "DN": "DN 32", "tip": "Diafragmă", "uz": "Mic comercial"},
    {"model": "G16",   "qmin": 0.160, "qmax": 25.0,   "DN": "DN 40", "tip": "Diafragmă", "uz": "Comercial"},
    {"model": "G25",   "qmin": 0.250, "qmax": 40.0,   "DN": "DN 50", "tip": "Diafragmă", "uz": "Comercial mare"},
    {"model": "G40",   "qmin": 0.400, "qmax": 65.0,   "DN": "DN 65", "tip": "Rotativ",   "uz": "Mic industrial"},
    {"model": "G65",   "qmin": 0.650, "qmax": 100.0,  "DN": "DN 80", "tip": "Rotativ",   "uz": "Mic industrial"},
    {"model": "G100",  "qmin": 1.000, "qmax": 160.0,  "DN": "DN 100","tip": "Rotativ",   "uz": "Industrial"},
    {"model": "G160",  "qmin": 1.600, "qmax": 250.0,  "DN": "DN 100","tip": "Rotativ",   "uz": "Industrial"},
    {"model": "G250",  "qmin": 2.500, "qmax": 400.0,  "DN": "DN 150","tip": "Rotativ",   "uz": "Industrial mare"},
    {"model": "G400",  "qmin": 4.000, "qmax": 650.0,  "DN": "DN 150","tip": "Turbină",   "uz": "Industrial mare"},
    {"model": "G650",  "qmin": 6.500, "qmax": 1000.0, "DN": "DN 200","tip": "Turbină",   "uz": "Mare consumator"},
    {"model": "G1000", "qmin": 10.00, "qmax": 1600.0, "DN": "DN 200","tip": "Turbină",   "uz": "Mare consumator"},
]

# Catalog regulatoare standard (Pietro Fiorentini / Tartarini)
REGULATOARE_CATALOG = [
    {"model": "FE6-25",  "qmax_jp": 10,    "qmax_rp": 25,    "DN": "DN 25", "p_intrare_max_bar": 4.0,  "p_iesire_bar": "0.020 / 0.022"},
    {"model": "FE10-25", "qmax_jp": 16,    "qmax_rp": 40,    "DN": "DN 25", "p_intrare_max_bar": 4.0,  "p_iesire_bar": "0.020 / 0.022"},
    {"model": "FE25-25", "qmax_jp": 25,    "qmax_rp": 65,    "DN": "DN 25", "p_intrare_max_bar": 5.0,  "p_iesire_bar": "0.020 / 0.030"},
    {"model": "FE50",    "qmax_jp": 65,    "qmax_rp": 160,   "DN": "DN 40", "p_intrare_max_bar": 6.0,  "p_iesire_bar": "0.020 / 0.050"},
    {"model": "Norval",  "qmax_jp": 160,   "qmax_rp": 400,   "DN": "DN 50", "p_intrare_max_bar": 6.0,  "p_iesire_bar": "0.020 / 0.100"},
    {"model": "Aperflux","qmax_jp": 400,   "qmax_rp": 1000,  "DN": "DN 80", "p_intrare_max_bar": 8.0,  "p_iesire_bar": "0.020 / 0.500"},
    {"model": "Reflux 919","qmax_jp": 1000,"qmax_rp": 2500,  "DN": "DN 100","p_intrare_max_bar": 16.0, "p_iesire_bar": "0.020 / 1.000"},
]


# ============================================================================
# 1. MULTI-TRONSON RENOUARD CALCULATION
# ============================================================================

def renouard_jp(Q_mc_h: float, L_m: float, D_int_mm: float, beta: float = 23200) -> float:
    """Renouard JP formula (gaze naturale joasă presiune, d<50mm).
    
    Δp [mbar] = β × L × Q^1.82 / D^4.82
    """
    if Q_mc_h <= 0 or L_m <= 0 or D_int_mm <= 0:
        return 0.0
    return round(beta * L_m * (Q_mc_h ** 1.82) / (D_int_mm ** 4.82), 4)


def viteza_jp(Q_mc_h: float, D_int_mm: float) -> float:
    """Calcul viteză gaz în conductă (m/s).
    
    v = Q / A,  A = π × (D/2)^2
    """
    if Q_mc_h <= 0 or D_int_mm <= 0:
        return 0.0
    Q_m3_s = Q_mc_h / 3600.0
    A_m2 = math.pi * ((D_int_mm / 1000.0) / 2.0) ** 2
    return round(Q_m3_s / A_m2, 2)


def compute_tronson_table(tronsons: List[Dict[str, Any]], p_initial_bar: float = 0.025) -> List[Dict[str, Any]]:
    """Calculează tabelul Renouard pentru lanț de tronsoane.
    
    Input fiecare tronson: {id, lungime_m, dn_mm (interior), debit_mc_h}
    Output: + delta_p_bar, p_finala_bar, viteza_m_s, pierdere_admis (verdict)
    """
    out = []
    p_curent = p_initial_bar
    for t in tronsons:
        L = float(t.get("lungime_m", 0) or 0)
        D_int = float(t.get("dn_mm", 0) or 0)
        Q = float(t.get("debit_mc_h", 0) or 0)
        delta_p_mbar = renouard_jp(Q, L, D_int)
        delta_p_bar = delta_p_mbar / 1000.0
        p_finala = max(0.0, p_curent - delta_p_bar)
        v = viteza_jp(Q, D_int)
        verdict = "OK"
        if delta_p_bar > 0.005:
            verdict = "REVIZUIRE — pierdere peste 0.005 bar (JP)"
        elif v > 20:
            verdict = "REVIZUIRE — viteză peste 20 m/s"
        out.append({
            **t,
            "delta_p_mbar": delta_p_mbar,
            "delta_p_bar": round(delta_p_bar, 4),
            "p_intrare_bar": round(p_curent, 4),
            "p_finala_bar": round(p_finala, 4),
            "viteza_m_s": v,
            "verdict": verdict,
        })
        p_curent = p_finala
    return out


# ============================================================================
# 2. SMART SIZING (Lățime șanț, Contor, Regulator)
# ============================================================================

def latime_sant_recomandata(dn_size: int, spatiu_lucru_cm: int = 30) -> Dict[str, Any]:
    """Lățime șanț = DN_exterior + 0.3m (spațiu lucru sudură)
    
    Conform NTPEE 2018 art. 56 + bune practici execuție.
    """
    pipe = PE100_SDR11.get(dn_size)
    if not pipe:
        return {"error": f"DN {dn_size} nu există în catalog PE 100"}
    de = pipe["de_mm"]  # diametru exterior mm
    latime_min_cm = round((de / 10.0) + (spatiu_lucru_cm / 1.0), 1)  # cm
    # Adâncime min depinde de suprafață (folosim trotuar default 0.90m)
    return {
        "diametru_exterior_mm": de,
        "spatiu_lucru_cm": spatiu_lucru_cm,
        "latime_minima_cm": latime_min_cm,
        "latime_recomandata_cm": latime_min_cm + 10,  # +10cm pentru sudori
        "formula": f"L_șanț = D_ext ({de}mm) + spațiu lucru ({spatiu_lucru_cm}cm) = {latime_min_cm}cm",
        "norma": "NTPEE 2018 art. 56 + bune practici execuție",
    }


def dimensionare_contor(debit_max_mc_h: float) -> Dict[str, Any]:
    """Recomandă contor pe baza debitului maxim instalat.
    
    Regulă: alege contorul cu qmax >= debit_max × 1.2 (safety factor)
    """
    target = debit_max_mc_h * 1.2  # 20% safety margin
    for c in CONTOARE_CATALOG:
        if c["qmax"] >= target:
            return {
                "recomandat": c,
                "safety_factor": 1.2,
                "debit_calculat": debit_max_mc_h,
                "debit_cu_safety": round(target, 2),
                "explicatie": f"Contor {c['model']} (qmax {c['qmax']} m³/h) acoperă debitul max {debit_max_mc_h} m³/h cu safety factor 20%",
                "norma": "Ord. ANRE 75/2020 + EN 1359",
            }
    # Last resort
    return {
        "recomandat": CONTOARE_CATALOG[-1],
        "warning": f"Debit {debit_max_mc_h} m³/h depășește catalogul standard — folosiți contor industrial specific",
    }


def dimensionare_regulator(debit_max_mc_h: float, presiune_intrare_bar: float = 4.0,
                            tip_presiune: str = "JP") -> Dict[str, Any]:
    """Recomandă regulator pe baza debitului + categoriei de presiune.
    
    Args:
        tip_presiune: 'JP' (joasă) sau 'RP' (redusă)
    """
    target = debit_max_mc_h * 1.15  # 15% safety margin pentru regulator
    field = "qmax_jp" if tip_presiune == "JP" else "qmax_rp"
    for r in REGULATOARE_CATALOG:
        if r[field] >= target and r["p_intrare_max_bar"] >= presiune_intrare_bar:
            return {
                "recomandat": r,
                "safety_factor": 1.15,
                "debit_calculat": debit_max_mc_h,
                "debit_cu_safety": round(target, 2),
                "tip_presiune_iesire": tip_presiune,
                "presiune_intrare_solicitata": presiune_intrare_bar,
                "explicatie": f"Regulator {r['model']} (qmax {tip_presiune} = {r[field]} m³/h) acoperă debitul max {debit_max_mc_h} m³/h cu safety factor 15%",
                "norma": "EN 88-1 + EN 334",
            }
    return {
        "recomandat": REGULATOARE_CATALOG[-1],
        "warning": f"Debit {debit_max_mc_h} m³/h depășește catalogul standard — regulator industrial specific",
    }


# ============================================================================
# 3. SMART MATERIALS CATALOG (Anexa 13 — 554 items)
# ============================================================================

_CATALOG_PATH = Path(__file__).parent / "osd_materials_catalog.json"
_CATALOG_CACHE: Optional[List[Dict[str, Any]]] = None


def _load_catalog() -> List[Dict[str, Any]]:
    global _CATALOG_CACHE
    if _CATALOG_CACHE is None:
        try:
            with open(_CATALOG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _CATALOG_CACHE = data if isinstance(data, list) else data.get("items", [])
        except Exception:
            _CATALOG_CACHE = []
    return _CATALOG_CACHE


def auto_suggest_materials(project_data: Dict[str, Any], limit: int = 30) -> List[Dict[str, Any]]:
    """Sugerează materiale din catalogul OSD (554 items) pe baza câmpurilor proiectului.
    
    Strategie:
    - Match pe DN, material, presiune, tip lucrare
    - Score per item, top N returnate
    """
    catalog = _load_catalog()
    if not catalog:
        return []
    
    dn = (project_data.get("sf_diametru_nominal_DN") or "").strip()
    material = (project_data.get("sf_material_conducta") or "").strip().lower()
    presiune = (project_data.get("presiune_categorie") or "").lower()
    tip_lucr = (project_data.get("tipul_lucrarii") or "").lower()
    
    # Extract DN number
    dn_num = None
    try:
        dn_num = int(dn.replace("DN", "").replace("dn", "").strip().split()[0])
    except (ValueError, IndexError, AttributeError):
        pass

    scored = []
    for item in catalog:
        score = 0
        name = str(item.get("name", "") or item.get("denumire", "")).lower()
        if not name:
            continue
        # DN match
        if dn_num:
            if f"dn {dn_num}" in name or f"dn{dn_num}" in name or f"d {dn_num}" in name:
                score += 10
            if f"ø{dn_num}" in name or f"{dn_num}mm" in name:
                score += 8
        # Material match
        if "pe 100" in material or "polietilena" in material:
            if "pe 100" in name or "polietilena" in name or "pe100" in name:
                score += 6
        if "ol" in material or "otel" in material:
            if "otel" in name or "steel" in name or "ol " in name:
                score += 6
        # Presiune category match (JP/RP/MP)
        if "joasa" in presiune or "<0.05" in presiune:
            if "jp" in name or "joasa" in name or "sdr 17" in name:
                score += 4
        if "redusa" in presiune:
            if "rp" in name or "redusa" in name:
                score += 3
        # Tip lucrare keywords
        if "bransament" in tip_lucr or "branșament" in tip_lucr:
            if "bransament" in name or "robinet" in name or "manson" in name or "cot" in name:
                score += 5
        if "extindere" in tip_lucr:
            if "teava" in name or "manson" in name or "cuplaj" in name:
                score += 5
        if score > 0:
            scored.append({**item, "_score": score})
    
    scored.sort(key=lambda x: -x.get("_score", 0))
    # Strip score from output but keep order
    return [{k: v for k, v in x.items() if k != "_score"} for x in scored[:limit]]


def get_catalog_stats() -> Dict[str, Any]:
    """Statistici despre catalogul materialelor."""
    cat = _load_catalog()
    return {
        "total_items": len(cat),
        "source": "Anexa 13 — Lista materiale aprobată OSD",
        "sample": cat[:5] if cat else [],
    }
