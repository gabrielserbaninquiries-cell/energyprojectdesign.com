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
    """V10.5 — Build the ANEXA 14 materials table from project data.

    Reads selections from data (br_material, br_diametru_dn, br_lungime_m, ...)
    and returns rows for the DOCX template loop.
    """
    rows: List[Dict[str, Any]] = []
    nr = 1

    br_material = "PE100_SDR11" if (data.get("br_material") or "").lower().startswith("poliet") else "OL"
    br_dn = data.get("br_diametru_dn") or 63
    br_lungime = float(str(data.get("br_lungime_m") or 4).replace(",", "."))
    cnd_ex_dn = data.get("cnd_ex_diametru_dn") or 90
    cnd_n_dn = data.get("cnd_n_diametru_dn") or 90
    cnd_n_active = (data.get("cnd_noua") or "").lower() in {"da", "true", "1"}
    cnd_n_lungime = float(str(data.get("cnd_n_lungime_m") or 0).replace(",", "."))

    # 1) TEAVA branșament
    pipe = find_pipe(br_material, br_dn)
    if pipe:
        rows.append({
            "nr": nr, "sap_code": pipe["sap_code"], "desc": pipe["desc"],
            "dest": "BR", "qty": br_lungime, "um": "ml",
        }); nr += 1

    # 2) Cuplare teu (BR la conducta existentă)
    tee = find_tee(cnd_ex_dn, br_dn)
    if tee:
        rows.append({"nr": nr, "sap_code": tee["sap_code"], "desc": tee["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 3) MUFA EF (cuplare)
    for m in _materials():
        if m["category"] == "sudura" and "MUFA EF" in m["desc"].upper() and m.get("diameter_dn") == _norm_dn(br_dn):
            rows.append({"nr": nr, "sap_code": m["sap_code"], "desc": m["desc"], "dest": "BR", "qty": 2, "um": "buc"}); nr += 1
            break

    # 4) RAISER (transition PE→OL)
    raiser = find_raiser(br_dn)
    if raiser:
        rows.append({"nr": nr, "sap_code": raiser["sap_code"], "desc": raiser["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 5) ROBINET sferic (firida BR)
    # Map DN to OL valve (e.g., br DN63 → 2'')
    valve_dn = {32: 50, 40: 50, 50: 50, 63: 50, 75: 80, 90: 80, 110: 100}.get(_norm_dn(br_dn), 50)
    valve = find_valve(valve_dn)
    if valve:
        rows.append({"nr": nr, "sap_code": valve["sap_code"], "desc": valve["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 6) FIRIDA
    firida = find_firida("S300")
    if firida:
        rows.append({"nr": nr, "sap_code": firida["sap_code"], "desc": firida["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 7) REGULATOR
    reg = find_regulator(valve_dn)
    if reg:
        rows.append({"nr": nr, "sap_code": reg["sap_code"], "desc": reg["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 8) FILTRU
    flt = find_filter(valve_dn)
    if flt:
        rows.append({"nr": nr, "sap_code": flt["sap_code"], "desc": flt["desc"], "dest": "BR", "qty": 1, "um": "buc"}); nr += 1

    # 9) Conductă nouă (CND) — only if marked
    if cnd_n_active and cnd_n_lungime > 0:
        cnd_pipe = find_pipe(br_material, cnd_n_dn)
        if cnd_pipe:
            rows.append({"nr": nr, "sap_code": cnd_pipe["sap_code"], "desc": cnd_pipe["desc"], "dest": "CND", "qty": cnd_n_lungime, "um": "ml"}); nr += 1

    return rows


def get_database_stats() -> Dict[str, Any]:
    """For diagnostics endpoint."""
    db = get_all()
    from collections import Counter
    cats = Counter(m["category"] for m in db.get("materials", []))
    return {"version": db.get("version"), "total": db.get("total"), "categories": dict(cats)}
