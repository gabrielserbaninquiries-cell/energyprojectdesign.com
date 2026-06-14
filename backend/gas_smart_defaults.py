"""
gas_smart_defaults — Calcule inteligente + validare câmpuri pentru proiecte gaze.

Când utilizatorul selectează o valoare într-un câmp principal (presiune_categorie,
material conductă, DN, debit), modulul calculează automat valori pentru
câmpurile derivate (coeficient Renouard, pierderi presiune admise, adâncime
pozare, tub protecție recomandat, viteză max admisă, etc.).

Bazat pe:
- NTPEE 2018 (Ord. ANRE 89/2018) — capitolele 3, 5
- EN 1555 pentru PE 100
- Calcule Renouard / Weymouth conform anexa NTPEE
"""
from typing import Any, Dict, List, Optional, Tuple
import math


# ============================================================================
# RULE TABLES — derivate per NTPEE 2018
# ============================================================================

# Coeficient Renouard β per categorie presiune (NTPEE 2018 Anexa 5)
COEF_RENOUARD = {
    "JOASA PRESIUNE (<0.05 bar)":   "β = 23200 (JP)",
    "REDUSA PRESIUNE (0.05-2 bar)": "β = 51 (RP, formula Renouard medie)",
    "MEDIE PRESIUNE (2-6 bar)":     "β = 51 (MP, formula Renouard medie)",
    "INALTA PRESIUNE (>6 bar)":     "β = 48 (HP, formula Weymouth)",
}

# Pierderi presiune admise per categorie (NTPEE 2018 art. 50)
PIERDERI_ADMISE = {
    "JOASA PRESIUNE (<0.05 bar)":   0.005,    # Δp ≤ 0.005 bar
    "REDUSA PRESIUNE (0.05-2 bar)": None,     # 50% din p_intrare
    "MEDIE PRESIUNE (2-6 bar)":     None,     # 50% din p_intrare
    "INALTA PRESIUNE (>6 bar)":     None,     # calcul caz-cu-caz
}

# Presiune max operare per DN (PE 100 SDR 11 conform EN 1555)
PMAX_PE100_SDR11 = {
    "DN 20":  10.0,
    "DN 25":  10.0,
    "DN 32":  10.0,
    "DN 40":  10.0,
    "DN 50":  10.0,
    "DN 63":  10.0,
    "DN 75":  10.0,
    "DN 90":  10.0,
    "DN 110": 10.0,
    "DN 125": 10.0,
    "DN 140": 8.0,
    "DN 160": 8.0,
    "DN 180": 6.3,
    "DN 200": 6.3,
}

# Debit minim/maxim recomandat per categorie consumator (NTPEE 2018)
DEBIT_CATEGORIE = {
    "Casnic":           (1.0,  6.0),    # m³/h
    "Mic comercial":    (6.0,  25.0),
    "Comercial":        (25.0, 65.0),
    "Mic industrial":   (65.0, 200.0),
    "Industrial":       (200.0, 2000.0),
}

# Adâncime minimă pozare (m) per tip suprafață (NTPEE 2018 art. 56)
ADANCIME_POZARE = {
    "Trotuar":          0.90,
    "Carosabil auto":   1.00,
    "Carosabil greu":   1.20,
    "Spațiu verde":     0.60,
    "Sub fundație":     None,   # interzis
}

# Tub de protecție recomandat per tip traversare
TUB_PROTECTIE_MAP = {
    "Sub drum":             "PVC rigid Ø110 (DN <= 90) sau Ø160 (DN > 90)",
    "Sub pereți clădire":   "PVC rigid Ø110 + manșon cauciuc + mortar",
    "În pereți":            "Țeavă oțel zincat Ø80 + mortar etanș",
    "Sub fundație":         "Țeavă oțel Schedule 40 + mortar etanș + drenaj",
    "Sub cabluri electrice":"PVC rigid Ø110 + pat cărămizi protecție",
}

# Material conductă recomandată per presiune
MATERIAL_PER_PRESIUNE = {
    "JOASA PRESIUNE (<0.05 bar)":   "PE 100 SDR 17 (preferat) sau SDR 11",
    "REDUSA PRESIUNE (0.05-2 bar)": "PE 100 SDR 11 (EN 1555)",
    "MEDIE PRESIUNE (2-6 bar)":     "PE 100 SDR 11 (EN 1555) sau OL ANSI B36.10",
    "INALTA PRESIUNE (>6 bar)":     "OL ANSI B36.10 vopsit + protecție catodică",
}

# Distanțe minime de siguranță față de alte rețele (NTPEE 2018 art. 60)
DISTANTE_SIGURANTA = {
    "fundatii_cladiri_m":   3.0,
    "cabluri_electrice_m":  0.5,
    "canalizare_m":         1.0,
    "apa_potabila_m":       1.0,
    "telefon_m":            0.3,
    "alte_gaze_m":          0.5,
}

# Categorii importanță construcție (HG 766/1997)
CATEGORII_IMPORTANTA = {
    "A - Excepțională":  "Construcții cu risc major / impact mare (nuclear, baraj mare)",
    "B - Deosebită":     "Spitale, școli, ansambluri mari rezidențiale",
    "C - Normală":       "Construcții civile și industriale uzuale",
    "D - Redusă":        "Construcții mici, anexe, garaje",
}


# ============================================================================
# COMPUTE FUNCTIONS
# ============================================================================

def _safe_float(v) -> Optional[float]:
    try:
        if v in (None, "", "—"): return None
        return float(v)
    except (TypeError, ValueError):
        return None


def renouard_pressure_drop(
    debit_mc_h: float, lungime_m: float, dn_mm: float,
    p_intrare_bar: float = 0.025, beta: float = 23200,
) -> Dict[str, float]:
    """Calculează pierderea de presiune Renouard (JP).

    Formula Renouard (JP, d<50mm):
      Δp = β × L × Q^1.82 / D^4.82
    unde β = 23200 pentru gaze naturale joasă presiune (g=0.55).
    """
    Q = max(0.001, float(debit_mc_h))
    L = max(0.1, float(lungime_m))
    D = max(10.0, float(dn_mm))
    if beta <= 0: beta = 23200
    delta_p = beta * L * (Q ** 1.82) / (D ** 4.82)
    p_finala = max(0.0, p_intrare_bar - delta_p / 1000.0)  # convert Pa → bar (factor scalar)
    return {
        "delta_p_calculat_bar": round(delta_p / 1000.0, 4),
        "p_finala_bar": round(p_finala, 4),
        "viteza_m_s": round(353 * Q / (D ** 2), 2),  # approx pentru JP, D în mm
    }


def compute_derived_fields(data: Dict[str, Any], trigger: Optional[str] = None) -> Dict[str, Any]:
    """Calculează valori derivate. Returnează DOAR cheile care s-au schimbat.

    Args:
        data: dict cu toate câmpurile actuale ale proiectului
        trigger: cheia care a declanșat recalcularea (optional - filtrează rezultatele)
    """
    derived: Dict[str, Any] = {}
    presiune = (data.get("presiune_categorie") or "").strip()
    material = (data.get("sf_material_conducta") or "").strip()
    dn = (data.get("sf_diametru_nominal_DN") or "").strip()
    debit_str = data.get("debit_instalat_mc_h") or data.get("qmin_total")
    debit = _safe_float(debit_str)
    lungime = _safe_float(data.get("sf_lungime_conducta_m") or data.get("pt_lungime_m"))

    # 1. Coeficient Renouard din presiune
    if presiune in COEF_RENOUARD:
        derived["coeficient_renouard"] = COEF_RENOUARD[presiune]

    # 2. Material recomandat din presiune
    if presiune in MATERIAL_PER_PRESIUNE and not material:
        derived["sf_material_conducta"] = MATERIAL_PER_PRESIUNE[presiune]

    # 3. Pierderi admise (numeric pentru JP)
    if presiune == "JOASA PRESIUNE (<0.05 bar)":
        derived["pierderi_p_admise_bar"] = 0.005
    elif presiune in ("REDUSA PRESIUNE (0.05-2 bar)", "MEDIE PRESIUNE (2-6 bar)"):
        derived["pierderi_p_admise_bar"] = 0.50  # 50% rule

    # 4. Presiune max operare per DN (PE 100 SDR 11)
    if dn in PMAX_PE100_SDR11:
        derived["sf_presiune_max_op_bar"] = PMAX_PE100_SDR11[dn]

    # 5. Debit instalat fallback per categorie consumator
    cat_cons = (data.get("categorie_consumator") or "").strip()
    if cat_cons in DEBIT_CATEGORIE and not debit:
        mn, mx = DEBIT_CATEGORIE[cat_cons]
        derived["debit_instalat_mc_h"] = (mn + mx) / 2  # mid-range

    # 6. Calcul Renouard real (dacă avem toate datele)
    dn_num = None
    for prefix_dn, num in [("DN ", 32), ("DN20", 20), ("DN25", 25)]:
        try:
            dn_num = int(dn.replace("DN", "").strip())
            break
        except (ValueError, AttributeError):
            pass
    if debit and lungime and dn_num and presiune == "JOASA PRESIUNE (<0.05 bar)":
        try:
            r = renouard_pressure_drop(debit, lungime, dn_num)
            derived["pt_calcul_pierderi_presiune_bar"] = r["delta_p_calculat_bar"]
            derived["pt_viteza_m_s"] = r["viteza_m_s"]
        except Exception:
            pass

    # 7. Adâncime pozare standard (NTPEE art. 56)
    tip_suprafata = (data.get("tip_suprafata_pozare") or "").strip() or "Trotuar"
    if tip_suprafata in ADANCIME_POZARE:
        ad = ADANCIME_POZARE[tip_suprafata]
        if ad is not None and not _safe_float(data.get("la_sapatura_adancime_cm")):
            derived["la_sapatura_adancime_cm"] = int(ad * 100)

    # 8. Tub protecție recomandat per traversare
    tip_trav = (data.get("tip_traversare") or "").strip()
    if tip_trav in TUB_PROTECTIE_MAP and not (data.get("tub_protectie") or "").strip():
        derived["tub_protectie"] = TUB_PROTECTIE_MAP[tip_trav]

    # 9. Categoria importanță default
    if not data.get("categorie_importanta_HG766"):
        # Bazat pe destinație clădire
        dest = (data.get("cladire_destinatie") or "").lower()
        if "spital" in dest or "școa" in dest:
            derived["categorie_importanta_HG766"] = "B - Deosebită"
        elif "industrial" in dest or "uzin" in dest:
            derived["categorie_importanta_HG766"] = "C - Normală"
        else:
            derived["categorie_importanta_HG766"] = "C - Normală"  # casnic / civil standard

    # 10. Verdict probă rezistență auto din p_finala_rez
    p_fin_rez = _safe_float(data.get("p_finala_rez"))
    p_ini_rez = _safe_float(data.get("p_initiala_rez"))
    if p_fin_rez and p_ini_rez:
        delta = p_ini_rez - p_fin_rez
        derived["delta_p_rez"] = round(delta, 4)
        if delta <= 0.10:
            derived["verdict_rez"] = "ADMIS"
        else:
            derived["verdict_rez"] = "RESPINS"

    # 11. Verdict probă etanșeitate auto din p_finala_et
    p_fin_et = _safe_float(data.get("p_finala_et"))
    p_ini_et = _safe_float(data.get("p_initiala_et"))
    if p_fin_et and p_ini_et:
        delta = p_ini_et - p_fin_et
        derived["delta_p_et"] = round(delta, 4)
        if delta <= 0.005:
            derived["verdict_et"] = "ADMIS"
        else:
            derived["verdict_et"] = "RESPINS"

    # Filter to only NEW or CHANGED values (vs current data)
    out = {k: v for k, v in derived.items() if v != data.get(k)}
    return out


def validate_fields(data: Dict[str, Any]) -> Dict[str, List[str]]:
    """Validează coerența câmpurilor. Returnează dict {key: [erori]}."""
    errors: Dict[str, List[str]] = {}

    # Validare CNP (13 cifre + algoritm)
    cnp = data.get("sudor_cnp") or data.get("beneficiar_cnp")
    if cnp:
        cnp_str = str(cnp).strip()
        if not cnp_str.isdigit() or len(cnp_str) != 13:
            errors.setdefault("sudor_cnp", []).append("CNP trebuie să aibă exact 13 cifre")

    # Validare presiune vs DN
    pmax = _safe_float(data.get("sf_presiune_max_op_bar"))
    dn = (data.get("sf_diametru_nominal_DN") or "").strip()
    if pmax and dn in PMAX_PE100_SDR11:
        if pmax > PMAX_PE100_SDR11[dn]:
            errors.setdefault("sf_presiune_max_op_bar", []).append(
                f"{pmax} bar depășește limita PE100 SDR11 pentru {dn} ({PMAX_PE100_SDR11[dn]} bar)"
            )

    # Validare pierderi vs categorie
    pier = _safe_float(data.get("pt_calcul_pierderi_presiune_bar"))
    pres = data.get("presiune_categorie", "")
    if pier and pres == "JOASA PRESIUNE (<0.05 bar)" and pier > 0.005:
        errors.setdefault("pt_calcul_pierderi_presiune_bar", []).append(
            f"Pierdere {pier} bar > 0.005 bar admis pentru JP — refac calculul cu DN mai mare"
        )

    # Validare adâncime sub minimum
    ad = _safe_float(data.get("la_sapatura_adancime_cm"))
    tip = (data.get("tip_suprafata_pozare") or "").strip()
    if ad and tip in ADANCIME_POZARE and ADANCIME_POZARE[tip]:
        min_cm = ADANCIME_POZARE[tip] * 100
        if ad < min_cm:
            errors.setdefault("la_sapatura_adancime_cm", []).append(
                f"Adâncime {ad}cm < minim NTPEE 2018 ({min_cm:.0f}cm pentru {tip})"
            )

    # Validare debit vs categorie consumator
    debit = _safe_float(data.get("debit_instalat_mc_h"))
    cat = (data.get("categorie_consumator") or "").strip()
    if debit and cat in DEBIT_CATEGORIE:
        mn, mx = DEBIT_CATEGORIE[cat]
        if not (mn <= debit <= mx):
            errors.setdefault("debit_instalat_mc_h", []).append(
                f"Debit {debit} m³/h în afara intervalului recomandat pentru {cat} ({mn}-{mx} m³/h)"
            )

    return errors
