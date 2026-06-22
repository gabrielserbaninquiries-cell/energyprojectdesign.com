"""V10.5 — Materials Database with Smart Selection

Loads ANEXA 13 (LISTA MATERIALE PUSE LA DISPOZITIE) and provides smart-matching
helpers used when generating the full DOCX project. The user expects the platform
to AUTOMATICALLY fill the Materials table (ANEXA 14) based on the selections made
in the form (br_material, br_diametru_dn, cnd_n_diametru_dn, br_lungime_m, etc).

Public API
----------
get_all()                                  → full database
find_pipe(material_type, diameter_dn)      → pipe SAP code for given diameter
find_tee(main_dn, branch_dn)               → teu (saddle/tee) SAP code
find_saddle(main_dn, branch_dn)            → SA EF saddle SAP code
find_raiser(branch_dn)                     → raiser SAP code
find_valve(diameter_dn, material="PE")     → vana/robinet SAP code
find_firida(profile)                       → firida cabinet
build_materials_table(project_data)        → list of {sap_code, desc, category,
                                              qty, um, dest, origin} computed from
                                              the project data for ANEXA 14 export
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

_DB_PATH = Path(__file__).parent / "materials_db.json"


@lru_cache(maxsize=1)
def get_all() -> Dict[str, Any]:
    if not _DB_PATH.exists():
        return {"materials": [], "total": 0}
    with _DB_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def _materials() -> List[Dict[str, Any]]:
    return get_all().get("materials", [])


def _norm_dn(value: Any) -> Optional[int]:
    """Accepts 'DN 32 mm', '32', 'Dn32', etc. → 32"""
    if value is None:
        return None
    s = str(value).upper().replace("MM", "").replace("DN", "").replace(" ", "").strip()
    try:
        return int(float(s))
    except ValueError:
        # try regex
        import re
        m = re.search(r"\d+", s)
        if m:
            try:
                return int(m.group(0))
            except ValueError:
                return None
        return None


def find_pipe(material_type: str = "PE100_SDR11", diameter_dn: Any = 63) -> Optional[Dict[str, Any]]:
    """Find pipe SAP entry. material_type: PE100_SDR11 or OL"""
    dn = _norm_dn(diameter_dn)
    if dn is None:
        return None
    for m in _materials():
        if m["category"] == "teava" and m.get("material_type") == material_type and m.get("diameter_dn") == dn:
            return m
    return None


def find_saddle(main_dn: Any, branch_dn: Any) -> Optional[Dict[str, Any]]:
    """Find SA EF (electrofuziune) saddle/tee with collar for branșament-conducta cuplare."""
    md, bd = _norm_dn(main_dn), _norm_dn(branch_dn)
    if md is None or bd is None:
        return None
    for m in _materials():
        if m["category"] == "sudura" and "SA EF" in m["desc"].upper() and m.get("diameter_dn") == md and m.get("sub_diameter_dn") == bd:
            return m
    # Fallback: exact main_dn match without branch constraint
    for m in _materials():
        if m["category"] == "sudura" and "SA EF" in m["desc"].upper() and m.get("diameter_dn") == md:
            return m
    return None


def find_tee(main_dn: Any, branch_dn: Any) -> Optional[Dict[str, Any]]:
    """Find TEU BR (branșament tee with stop-gaz collar)."""
    md, bd = _norm_dn(main_dn), _norm_dn(branch_dn)
    if md is None or bd is None:
        return None
    for m in _materials():
        if m["category"] == "teu" and "BR" in m["desc"].upper() and m.get("diameter_dn") == md and m.get("sub_diameter_dn") == bd:
            return m
    # Fallback by main only
    for m in _materials():
        if m["category"] == "teu" and m.get("diameter_dn") == md:
            return m
    return None


def find_raiser(branch_dn: Any) -> Optional[Dict[str, Any]]:
    bd = _norm_dn(branch_dn)
    if bd is None:
        return None
    for m in _materials():
        if m["category"] == "raiser" and m.get("diameter_dn") == bd:
            return m
    return None


def find_valve(diameter_dn: Any) -> Optional[Dict[str, Any]]:
    dn = _norm_dn(diameter_dn)
    if dn is None:
        return None
    for m in _materials():
        if m["category"] in {"vana", "robinet"} and m.get("diameter_dn") == dn:
            return m
    return None


def find_firida(profile: str = "S300") -> Optional[Dict[str, Any]]:
    pr = (profile or "").upper().strip()
    for m in _materials():
        if m["category"] == "firida" and pr in m["desc"].upper():
            return m
    return None


def find_regulator(diameter_dn: Any) -> Optional[Dict[str, Any]]:
    dn = _norm_dn(diameter_dn)
    if dn is None:
        return None
    for m in _materials():
        if m["category"] == "regulator" and m.get("diameter_dn") == dn:
            return m
    return None


def find_filter(diameter_dn: Any) -> Optional[Dict[str, Any]]:
    dn = _norm_dn(diameter_dn)
    if dn is None:
        return None
    for m in _materials():
        if m["category"] == "filtru" and m.get("diameter_dn") == dn:
            return m
    return None


def build_materials_table(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """V10.6.3 — Build materials list (ANEXA 14) by REAL TECHNICAL SPECS, not SAP-dependent.

    The function reads project specifications (br_material, br_diametru_dn, br_lungime_m,
    consumatori list, tub_protectie, vana, regulator, etc.) and generates the complete
    materials list. SAP code is OPTIONAL — populated only when osd_operator = Distrigaz
    Sud, otherwise the material spec is the primary identifier (works for any operator).

    Per user request V10.6.3: "piesele in lista de materiale sunt introduse automat
    pe baza de lista de materiale necesare reale in functie de specificatiile introduse"
    """
    rows: List[Dict[str, Any]] = []
    nr = 1

    # Operator detection (only Distrigaz Sud has its SAP catalog in our DB)
    operator = (data.get("osd_operator") or "").lower()
    use_sap = "distrigaz" in operator or "distrgaz" in operator

    def _add(category: str, desc: str, qty: float, um: str, dest: str = "BR",
             material_type: Optional[str] = None, diameter_dn: Optional[Any] = None,
             sub_diameter_dn: Optional[Any] = None) -> None:
        nonlocal nr
        sap_code = ""
        # Look up SAP code from Distrigaz Sud catalog if available
        if use_sap and (diameter_dn is not None):
            dn = _norm_dn(diameter_dn)
            sub_dn = _norm_dn(sub_diameter_dn) if sub_diameter_dn else None
            for m in _materials():
                if m["category"] == category and m.get("diameter_dn") == dn:
                    if sub_dn and m.get("sub_diameter_dn") != sub_dn:
                        continue
                    if material_type and m.get("material_type") and m.get("material_type") != material_type:
                        continue
                    sap_code = m["sap_code"]
                    # If we have an exact match with full description, use it
                    if not desc or len(desc) < 10:
                        desc = m["desc"]
                    break
        rows.append({
            "nr": nr,
            "sap_code": sap_code,    # Empty for non-Distrigaz operators
            "desc": desc,
            "category": category,
            "dest": dest,
            "qty": qty,
            "um": um,
        })
        nr += 1

    # === EXTRACT SPECS ===
    is_pe = (data.get("br_material") or "").lower().startswith(("poliet", "pe"))
    br_material_label = "PE 100 SDR 11" if is_pe else "OȚEL (St 37.0)"
    mat_key = "PE100_SDR11" if is_pe else "OL"
    br_dn = _norm_dn(data.get("br_diametru_dn")) or 63
    br_lung = float(str(data.get("br_lungime_m") or 4).replace(",", "."))
    br_subteran = (data.get("br_subteran") or "Subteran").lower()
    is_subteran = "sub" in br_subteran

    cnd_ex_dn = _norm_dn(data.get("cnd_ex_diametru_dn")) or 90
    cnd_n_active = (data.get("cnd_noua") or "").lower() in {"da", "true", "1"}
    cnd_n_dn = _norm_dn(data.get("cnd_n_diametru_dn")) or 90
    cnd_n_lung = float(str(data.get("cnd_n_lungime_m") or 0).replace(",", "."))

    has_vana_br = (data.get("br_vana") or "Da").lower() in {"da", "true", "1"}
    has_teu_br = (data.get("br_teu") or "Da").lower() in {"da", "true", "1"}
    tub_protectie = (data.get("br_tub_protectie_necesar") or "").lower()
    needs_tub = tub_protectie not in {"", "nu", "no", "false", "nu este necesar"}
    pat_caramizi_l = float(str(data.get("br_pat_caramizi_l_m") or 1).replace(",", "."))

    debit_total = float(str(data.get("debit_instalat_mc_h") or 0).replace(",", "."))
    if debit_total == 0:
        # Derive from consumatori
        for col in ("consumatori_mentinuti", "consumatori_noi"):
            for c in (data.get(col) or []):
                try:
                    debit_total += float(c.get("nr_aparate", 0)) * float(c.get("debit_nmc_h", 0))
                except (ValueError, TypeError):
                    pass

    iu_presiune = (data.get("iu_presiune") or "Joasă").lower()

    # === 1. TEAVA BRANSAMENT ===
    _add(
        "teava",
        f"Țeavă {br_material_label} Dn {br_dn} mm — branșament gaze naturale",
        round(br_lung, 2), "ml", dest="BR",
        material_type=mat_key, diameter_dn=br_dn,
    )

    # === 2. TEU / SA EF (saddle) — pentru cuplare BR la conducta existentă ===
    if has_teu_br:
        if is_pe:
            _add(
                "teu",
                f"Teu BR cu colier STOPGAZ pentru cuplare {br_material_label} Dn {cnd_ex_dn}-{br_dn} mm",
                1, "buc", dest="BR",
                diameter_dn=cnd_ex_dn, sub_diameter_dn=br_dn,
            )
        else:
            _add(
                "teu",
                f"Teu sudat OL Dn {cnd_ex_dn}-{br_dn} mm cu mufă de sudare",
                1, "buc", dest="BR",
                diameter_dn=cnd_ex_dn, sub_diameter_dn=br_dn,
            )

    # === 3. MUFA EF (electrofuziune) sau COT SUDAT ===
    if is_pe:
        _add(
            "sudura",
            f"Mufă electrofuziune (EF) PE 100 SDR 11 Dn {br_dn} mm",
            2, "buc", dest="BR", diameter_dn=br_dn, material_type=mat_key,
        )
    else:
        _add(
            "sudura",
            f"Cot sudat 90° OL Dn {br_dn} mm",
            2, "buc", dest="BR", diameter_dn=br_dn,
        )

    # === 4. RAISER (tranziție PE → OL pentru ieșire la suprafață) ===
    if is_pe:
        _add(
            "raiser",
            f"Raiser PE 100 SDR 11 / OL Dn {br_dn} mm / DN 1\" (tranziție subteran-suprateran)",
            1, "buc", dest="BR", diameter_dn=br_dn,
        )

    # === 5. ROBINET / VANA — pe firidă, înainte de regulator ===
    if has_vana_br:
        # Map br DN to OL valve DN (PE pipes connect to OL valves of similar nominal)
        valve_dn_map = {25: 25, 32: 25, 40: 40, 50: 40, 63: 50, 75: 65, 90: 80, 110: 100, 125: 100}
        valve_dn = valve_dn_map.get(br_dn, 50)
        _add(
            "robinet",
            f"Robinet sferic gaze cu flanșă DN {valve_dn} PN 16",
            1, "buc", dest="BR", diameter_dn=valve_dn,
        )

    # === 6. FIRIDA echipată — dimensiune după debit ===
    if debit_total > 0:
        if debit_total <= 6:
            firida_label = "Firidă echipată tip S150 (Q ≤ 6 Nmc/h)"; firida_match = "S150"
        elif debit_total <= 25:
            firida_label = "Firidă echipată tip S300 (Q ≤ 25 Nmc/h)"; firida_match = "S300"
        elif debit_total <= 65:
            firida_label = "Firidă echipată tip S600 (Q ≤ 65 Nmc/h)"; firida_match = "S600"
        else:
            firida_label = f"Firidă/Post reglare-măsură industrial (Q = {debit_total:.1f} Nmc/h)"; firida_match = "INDUSTRIAL"
        # SAP lookup for firida
        sap_code = ""
        if use_sap:
            for m in _materials():
                if m["category"] == "firida" and firida_match in m["desc"].upper():
                    sap_code = m["sap_code"]
                    if not firida_label or "S" in firida_match:
                        firida_label = m["desc"]
                    break
        rows.append({
            "nr": nr, "sap_code": sap_code, "desc": firida_label,
            "category": "firida", "dest": "BR", "qty": 1, "um": "buc",
        }); nr += 1

    # === 7. REGULATOR DE PRESIUNE — în funcție de iu_presiune și debit ===
    valve_dn_map = {25: 25, 32: 25, 40: 40, 50: 40, 63: 50, 75: 65, 90: 80, 110: 100, 125: 100}
    reg_dn = valve_dn_map.get(br_dn, 50)
    if "medi" in iu_presiune:
        reg_label = f"Regulator gaz Pm-Pj DN {reg_dn} (intrare medie, ieșire joasă, Q ≤ {int(debit_total * 1.5) or 160} Nmc/h)"
    else:
        reg_label = f"Regulator gaz Pj-Pj DN {reg_dn} (presiune joasă-joasă, Q ≤ {int(debit_total * 1.5) or 160} Nmc/h)"
    _add("regulator", reg_label, 1, "buc", dest="BR", diameter_dn=reg_dn)

    # === 8. FILTRU GAZ — protecție contor + regulator ===
    _add(
        "filtru",
        f"Filtru gaz DN {reg_dn} F{int(debit_total * 1.5) or 160} (filtrare particule)",
        1, "buc", dest="BR", diameter_dn=reg_dn,
    )

    # === 9. CONTOR GAZ — dimensiune după debit ===
    contor_size = "G2.5"
    if debit_total > 4: contor_size = "G4"
    if debit_total > 6: contor_size = "G6"
    if debit_total > 10: contor_size = "G10"
    if debit_total > 16: contor_size = "G16"
    if debit_total > 25: contor_size = "G25"
    if debit_total > 40: contor_size = "G40"
    if debit_total > 65: contor_size = "G65"
    rows.append({
        "nr": nr, "sap_code": "",
        "desc": f"Contor gaz volumetric {contor_size} (Q nominal = {debit_total or 6} Nmc/h)",
        "category": "contor", "dest": "BR", "qty": 1, "um": "buc",
    }); nr += 1

    # === 10. PAT DE CARAMIZI (numai dacă e subteran) ===
    if is_subteran:
        rows.append({
            "nr": nr, "sap_code": "",
            "desc": f"Pat cărămidă plină pentru protecție mecanică conductă PE (L = {pat_caramizi_l} m, lățime 0,40 m)",
            "category": "pat_caramizi", "dest": "BR", "qty": pat_caramizi_l, "um": "ml",
        }); nr += 1

    # === 11. BANDA AVERTIZOARE ===
    if is_subteran:
        rows.append({
            "nr": nr, "sap_code": "",
            "desc": "Bandă avertizoare galbenă cu inscripția «ATENȚIE — CONDUCTĂ GAZE NATURALE»",
            "category": "banda_avertizoare", "dest": "BR", "qty": round(br_lung, 2), "um": "ml",
        }); nr += 1

    # === 12. TUB DE PROTECȚIE (numai dacă e necesar, ex: traversare drum) ===
    if needs_tub:
        tub_lung = float(str(data.get("br_tub_protectie_l_m") or 6).replace(",", "."))
        tub_dn = br_dn + 50  # protect tube is bigger
        rows.append({
            "nr": nr, "sap_code": "",
            "desc": f"Tub de protecție PEHD Dn {tub_dn} mm (traversare drum / fundație), capete sigilate",
            "category": "tub_protectie", "dest": "BR", "qty": tub_lung, "um": "ml",
        }); nr += 1

    # === 13. GEOTEXTIL (la traversări sau pe sol nestabil) ===
    if needs_tub or br_lung > 10:
        rows.append({
            "nr": nr, "sap_code": "",
            "desc": "Geotextil 200 g/m² pentru protecție mecanică în șanț",
            "category": "geotextil", "dest": "BR", "qty": round(br_lung * 0.5, 2), "um": "mp",
        }); nr += 1

    # === 14. NISIP COMPACTAT — strat de pozare ===
    if is_subteran:
        rows.append({
            "nr": nr, "sap_code": "",
            "desc": "Nisip natural granulometrie 0-7 mm pentru pat pozare conductă",
            "category": "nisip", "dest": "BR", "qty": round(br_lung * 0.15, 2), "um": "mc",
        }); nr += 1

    # === 15. CONDUCTĂ NOUĂ (CND) — numai dacă bifa „CND Nouă = Da" ===
    if cnd_n_active and cnd_n_lung > 0:
        cnd_mat_key = "PE100_SDR11" if is_pe else "OL"
        cnd_mat_label = "PE 100 SDR 11" if is_pe else "OL (St 37.0)"
        _add("teava",
             f"Țeavă {cnd_mat_label} Dn {cnd_n_dn} mm — conductă rețea distribuție",
             round(cnd_n_lung, 2), "ml", dest="CND",
             material_type=cnd_mat_key, diameter_dn=cnd_n_dn)

    return rows


def get_database_stats() -> Dict[str, Any]:
    """For diagnostics endpoint."""
    db = get_all()
    from collections import Counter
    cats = Counter(m["category"] for m in db.get("materials", []))
    return {"version": db.get("version"), "total": db.get("total"), "categories": dict(cats)}
