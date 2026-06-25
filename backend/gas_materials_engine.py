"""V11.6 — Auto-selecție materiale gaze naturale (NTPE 89/2018)

Motor inteligent care primește selecțiile din UI (diametru branșament, diametru
conductă distribuție, lungime branșament, debit total consumatori) și generează
lista completă de materiale (BOM) conform listei oficiale ANEXA 13 (554 articole).

EXEMPLU (din specificațiile utilizatorului):
  bransament DN 32 + conductă distribuție DN 90 → teu = "TEU BR COLIER SDR11 D90-32 STOPGAZ ROSU"
  + 2 mufe PE 32 (sudura teu-bransament + sudura bransament-riser)
  + riser PE-OL DN 32 - 1"
  + robinet 1"
  + regulator dimensionat după debit total consumatori (debit 3.67 mc/h → regulator Q10)
"""
import json
import os
import re
from typing import Dict, List, Optional, Any

_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "gas_materials_catalog.json")


def load_catalog() -> List[Dict[str, Any]]:
    """Încarcă cele 554 materiale din ANEXA 13."""
    if not os.path.exists(_CATALOG_PATH):
        return []
    with open(_CATALOG_PATH, "r", encoding="utf-8") as fh:
        return json.load(fh)


_CATALOG = load_catalog()


def _extract_dn(text: str) -> List[int]:
    """Extrage diametre numerice din text (DN32, D90, etc.)."""
    dns = []
    for m in re.finditer(r"(?:DN|D)\s*(\d+)", text.upper()):
        dns.append(int(m.group(1)))
    return dns


def _find(predicate, default=None) -> Optional[Dict[str, Any]]:
    for item in _CATALOG:
        if predicate(item):
            return item
    return default


def select_teu_bransament(conducta_dn: int, bransament_dn: int, culoare: str = "rosu") -> Optional[Dict[str, Any]]:
    """Auto-selectare teu branșament cu colier + dispozitiv gaz stop.

    Format catalog: "TEU BR COLIER SDR11 D{conducta}-{bransament} STOPGAZ ROSU"
    sau "TEU BR. CU COLIER DN{conducta}-{bransament} STOPGAZ MOV"
    """
    culoare = culoare.upper()
    # Caută cu prefix D{conducta}-{bransament} + STOPGAZ {culoare}
    needle1 = f"D{conducta_dn}-{bransament_dn}"
    needle2 = f"DN{conducta_dn}-{bransament_dn}"
    for item in _CATALOG:
        if "TEU" not in item["text"].upper():
            continue
        if (needle1 in item["text"].upper() or needle2 in item["text"].upper()) and "STOPGAZ" in item["text"].upper():
            if culoare in item["text"].upper():
                return item
    # Fallback fără culoare
    for item in _CATALOG:
        if "TEU" in item["text"].upper() and (needle1 in item["text"].upper() or needle2 in item["text"].upper()) and "STOPGAZ" in item["text"].upper():
            return item
    return None


def select_mufa(diametru_dn: int) -> Optional[Dict[str, Any]]:
    """Selecție mufă PE de diametrul branșamentului."""
    return _find(lambda i: "MUFA" in i["text"].upper() and f"DN{diametru_dn}" in i["text"].upper() and "PE" in i["text"].upper())


def select_riser(bransament_dn: int) -> Optional[Dict[str, Any]]:
    """Riser PE-OL la diametrul branșamentului.

    Mapping inch (NTPE 89/2018 art. 90):
      DN 32 → 1"
      DN 40 → 1 1/4"
      DN 50 → 1 1/2"
      DN 63 → 2"
      DN 75 → 2 1/2"
      DN 90 → 3"
      DN 110 → 4"
    """
    inch_map = {32: '1"', 40: '1 1/4"', 50: '1 1/2"', 63: '2"', 75: '2 1/2"', 90: '3"', 110: '4"'}
    inch = inch_map.get(bransament_dn)
    for item in _CATALOG:
        if "RISER" in item["text"].upper() and f"DN{bransament_dn}" in item["text"].upper():
            return item
    return {
        "cod": None,
        "text": f"RISER PE-OL DN{bransament_dn} ({inch}) — confecționat la cerere",
        "tip": "riser",
    }


def select_robinet(diametru_inch: str) -> Optional[Dict[str, Any]]:
    """Robinet de aceeași dimensiune cu riserul."""
    # Caută "ROBINET" cu mențiune inch sau DN echivalent
    for item in _CATALOG:
        if "ROBINET" in item["text"].upper() and diametru_inch.replace(" ", "") in item["text"].upper().replace(" ", ""):
            return item
    # Fallback prin DN
    inch_to_dn = {'1/2"': 15, '3/4"': 20, '1"': 25, '1 1/4"': 32, '1 1/2"': 40, '2"': 50, '2 1/2"': 65, '3"': 80, '4"': 100}
    dn = inch_to_dn.get(diametru_inch.strip())
    if dn:
        for item in _CATALOG:
            if "ROBINET" in item["text"].upper() and f"DN {dn}" in item["text"].upper().replace(" ", " ") and "GAZ" in item["text"].upper():
                return item
            if "ROBINET" in item["text"].upper() and f"DN{dn}" in item["text"].upper() and "GAZ" in item["text"].upper():
                return item
    # Fallback final — propune robinet manual standard (catalogul OSD-ului are doar DN50+)
    if dn:
        return {
            "cod": None,
            "text": f"ROBINET SFERIC {diametru_inch} (DN{dn}) GAZ — extra-catalog (specific firidă consumator)",
            "tip": "robinet",
        }
    return None


def select_regulator(debit_mc_h: float) -> Optional[Dict[str, Any]]:
    """Selecție regulator next-bigger conform NTPE.

    Catalog REGULATOR DE GAZ: Q10, Q25, Q50, Q100, Q160, Q250, Q500, Q1000, Q2500, Q5000, Q7500.
    """
    if debit_mc_h <= 0:
        debit_mc_h = 1
    candidates = []
    for item in _CATALOG:
        if "REGULATOR" not in item["text"].upper() or "FIRIDA" in item["text"].upper():
            continue
        m = re.search(r"Q\s*(\d+)", item["text"].upper())
        if m:
            q = int(m.group(1))
            if q >= debit_mc_h:
                candidates.append((q, item))
    if not candidates:
        return None
    # Cel mai mic care depășește debitul
    candidates.sort(key=lambda x: x[0])
    return candidates[0][1]


def select_contor(debit_mc_h: float) -> Dict[str, Any]:
    """Selecție contor G-class conform debit max.

    G1.6 (2.5 m³/h), G2.5 (4), G4 (6), G6 (10), G10 (16), G16 (25), G25 (40),
    G40 (65), G65 (100), G100 (160), G160 (250), G250 (400), G400 (650), G650 (1000).
    """
    contor_classes = [
        ("G1.6", 2.5), ("G2.5", 4), ("G4", 6), ("G6", 10), ("G10", 16),
        ("G16", 25), ("G25", 40), ("G40", 65), ("G65", 100), ("G100", 160),
        ("G160", 250), ("G250", 400), ("G400", 650), ("G650", 1000),
    ]
    chosen = contor_classes[0]
    for g, qmax in contor_classes:
        if qmax >= debit_mc_h:
            chosen = (g, qmax)
            break
    return {
        "cod": None,
        "text": f"Contor gaz {chosen[0]} (Qmax = {chosen[1]} m³/h)",
        "tip": "contor",
        "g_class": chosen[0],
        "qmax_mc_h": chosen[1],
    }


def select_teava(material: str, dn: int) -> Optional[Dict[str, Any]]:
    """Selecție țeavă PE de diametrul cerut."""
    if material.upper().startswith("PE") or "POLIETILENA" in material.upper():
        for item in _CATALOG:
            if "TEAVA POLIETILENA" in item["text"].upper() and f"DN{dn}" in item["text"].upper():
                return item
    return None


def select_tub_protectie(material: str, diametru_calc: int) -> Dict[str, Any]:
    """Tub de protecție: diametru calc = De_branșament + 50 mm."""
    return {
        "cod": None,
        "text": f"Tub de protecție {material.upper()} DN{diametru_calc} (= De+50 mm)",
        "tip": "tub_protectie",
    }


def auto_bom_bransament(
    bransament_dn: int,
    conducta_dn: int,
    bransament_lungime_m: float,
    debit_total_consumatori_mc_h: float,
    bransament_material: str = "PE",
    cu_tub_protectie: bool = True,
    culoare_stopgaz: str = "rosu",
) -> List[Dict[str, Any]]:
    """Generează BOM (Bill of Materials) complet pentru un branșament.

    Conform NTPE 89/2018 și exemplul utilizatorului:
      DN 32 branșament + DN 90 conductă → Teu D90-32, 2 mufe PE32, riser DN32-1",
      robinet 1", regulator dimensionat după debit, țeavă PE32 cu lungime.
    """
    bom = []
    inch_map = {32: '1"', 40: '1 1/4"', 50: '1 1/2"', 63: '2"', 75: '2 1/2"', 90: '3"', 110: '4"'}
    riser_inch = inch_map.get(bransament_dn, '1"')

    # 1. Țeavă PE branșament
    teava = select_teava(bransament_material, bransament_dn)
    if teava:
        bom.append({
            **teava,
            "cantitate": round(bransament_lungime_m, 2),
            "um": "ml",
            "scop": "Țeavă branșament — pozare șanț",
        })

    # 2. Teu branșament cu colier + gaz stop
    teu = select_teu_bransament(conducta_dn, bransament_dn, culoare=culoare_stopgaz)
    if teu:
        bom.append({
            **teu,
            "cantitate": 1,
            "um": "buc",
            "scop": f"Racordare branșament DN{bransament_dn} la conductă DN{conducta_dn}",
        })

    # 3. Două mufe PE de dimensiunea branșamentului (sudura teu↔bransament + sudura bransament↔riser)
    mufa = select_mufa(bransament_dn)
    if mufa:
        bom.append({
            **mufa,
            "cantitate": 2,
            "um": "buc",
            "scop": "1× sudură teu↔branșament + 1× sudură branșament↔riser",
        })

    # 4. Riser PE-OL (de tranzit subteran↔aerian)
    riser = select_riser(bransament_dn)
    if riser:
        bom.append({
            **riser,
            "cantitate": 1,
            "um": "buc",
            "scop": f"Riser PE-OL DN{bransament_dn} ({riser_inch})",
        })

    # 5. Robinet branșament (de aceeași dimensiune cu riserul)
    robinet = select_robinet(riser_inch)
    if robinet:
        bom.append({
            **robinet,
            "cantitate": 1,
            "um": "buc",
            "scop": f"Robinet sferic {riser_inch} (la baza firidei)",
        })

    # 6. Regulator dimensionat după debit
    regulator = select_regulator(debit_total_consumatori_mc_h)
    if regulator:
        bom.append({
            **regulator,
            "cantitate": 1,
            "um": "buc",
            "scop": f"Regulator presiune (debit consumatori = {debit_total_consumatori_mc_h:.2f} m³/h, supradimensionat la următoarea treaptă)",
        })

    # 7. Contor calibrat după debit
    contor = select_contor(debit_total_consumatori_mc_h)
    bom.append({
        **contor,
        "cantitate": 1,
        "um": "buc",
        "scop": f"Contor măsurare consum (Qmax {contor['qmax_mc_h']} m³/h)",
    })

    # 8. Tub de protecție (opțional)
    if cu_tub_protectie:
        tub_dn = bransament_dn + 50
        bom.append({
            **select_tub_protectie(bransament_material, tub_dn),
            "cantitate": round(bransament_lungime_m, 2),
            "um": "ml",
            "scop": "Tub de protecție la traversare drum / structură",
        })

    return bom
