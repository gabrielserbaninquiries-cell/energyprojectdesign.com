"""Unified Placeholder Registry — sursa unică de adevăr pentru TOATE câmpurile.

Conceptul user (literal):
    "Pagina foloseste motorul de introducere text tip baza de date comune a
    tututor fisierelor necesare derularii reale a unui proiect, in toate
    fazele, deci, campurile repetitive reale se compenseaza prin unirea
    tuturor placeholderelor din documente catre o singura caseta text din
    sectiunea gaze naturale."

Acest modul:
1. Definește TOATE câmpurile necesare în TOATE documentele unui proiect (gaze)
2. Mapează fiecare câmp la documentele care îl folosesc
3. Permite UI-ului să afișeze inteligent: câmp introdus o singură dată →
   propagat în toate documentele unde apare ca placeholder

Câmpurile sunt clasificate pe:
- secțiune (project/beneficiar/locConsum/dtac/pt/executie/probe/receptie/pif)
- documentele care le folosesc (cerere_cu, memoriu_tehnic, etc.)
- tip (string/number/select/textarea/date/file)
- validare (regex, min/max, required)

Pentru a adăuga un câmp nou într-un document: adaugă-l aici și update-ează
template-ul DOCX corespondent în gas_doc_templates.py.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional

# ============================================================================
# FIELD REGISTRY — Sursa unică de adevăr
# ============================================================================
# Pentru fiecare câmp:
#   - key: id-ul intern (folosit ca placeholder {{key}})
#   - label: nume vizibil în UI (RO)
#   - type: input | number | select | textarea | date | file | tags
#   - section: secțiunea logică unde apare câmpul
#   - used_in: lista template-urilor unde apare ca placeholder
#   - required: boolean (validare frontend)
#   - validation: opțional regex/min/max
#   - default: valoare implicită
#   - help: tooltip

FIELDS_REGISTRY: List[Dict[str, Any]] = [
    # === SECȚIUNE: PROIECT (titlu, scop, subdomeniu) ===
    {"key": "scop_lucrare", "label": "Scop lucrare", "type": "textarea", "section": "proiect",
     "used_in": ["cerere_cu", "memoriu_tehnic", "cerere_atr", "anunt_incepere"], "required": True,
     "default": "Branșament nou la rețeaua de gaze naturale",
     "help": "Descrierea scopului proiectului (1-2 propoziții)."},
    {"key": "tipul_lucrarii", "label": "Tipul lucrării", "type": "select", "section": "proiect",
     "options": ["Branșament gaze naturale", "Extindere conductă", "Instalație utilizare (IUGN)",
                 "Studiu fezabilitate (SF)", "Reabilitare", "Mărire debit"],
     "used_in": ["memoriu_tehnic", "cerere_atr", "anunt_incepere"], "required": True},

    # === SECȚIUNE: BENEFICIAR ===
    {"key": "beneficiar_nume", "label": "Nume / Denumire beneficiar", "type": "input", "section": "beneficiar",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic", "cerere_pif", "pv_receptie", "carte_tehnica",
                 "anunt_incepere", "predare_amplasament", "cerere_aviz_apa", "cerere_aviz_electrica",
                 "cerere_aviz_drumuri", "cerere_aviz_politie", "cerere_aviz_mediu", "cerere_aviz_iscir"],
     "required": True},
    {"key": "beneficiar_cnp_cui", "label": "CNP / CUI beneficiar", "type": "input", "section": "beneficiar",
     "used_in": ["cerere_cu", "cerere_atr", "cerere_pif", "pv_receptie", "predare_amplasament"],
     "validation": {"pattern": "^\\d{6,13}$"}, "required": True,
     "help": "13 cifre pentru CNP persoană fizică sau 2-10 cifre pentru CUI persoană juridică."},
    {"key": "beneficiar_telefon", "label": "Telefon beneficiar", "type": "input", "section": "beneficiar",
     "used_in": ["cerere_cu", "cerere_atr"], "required": False,
     "validation": {"pattern": "^\\+?[0-9 ]{8,15}$"}},
    {"key": "beneficiar_email", "label": "Email beneficiar", "type": "input", "section": "beneficiar",
     "used_in": ["cerere_cu", "cerere_atr"], "required": False,
     "validation": {"pattern": "^[^@]+@[^@]+\\.[^@]+$"}},
    {"key": "beneficiar_adresa", "label": "Adresa fiscală beneficiar", "type": "input", "section": "beneficiar",
     "used_in": ["cerere_cu", "cerere_atr"], "required": False},

    # === SECȚIUNE: LOC CONSUM ===
    {"key": "loc_consum_adresa", "label": "Adresă loc consum", "type": "input", "section": "loc_consum",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic", "cerere_pif", "pv_receptie", "carte_tehnica",
                 "anunt_incepere", "predare_amplasament", "cerere_aviz_apa", "cerere_aviz_electrica",
                 "cerere_aviz_drumuri", "cerere_aviz_politie", "cerere_aviz_mediu", "cerere_aviz_iscir"],
     "required": True},
    {"key": "loc_consum_strada", "label": "Stradă și număr", "type": "input", "section": "loc_consum",
     "used_in": ["cerere_cu"], "required": False},
    {"key": "loc_consum_localitate", "label": "Localitate", "type": "input", "section": "loc_consum",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic"], "required": True},
    {"key": "loc_consum_judet", "label": "Județ", "type": "input", "section": "loc_consum",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic", "cerere_aviz_mediu"], "required": True},
    {"key": "loc_consum_cadastru", "label": "Nr. cadastral / CF", "type": "input", "section": "loc_consum",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic", "carte_tehnica", "predare_amplasament"]},

    # === SECȚIUNE: DATE TEHNICE ===
    {"key": "tip_consumator", "label": "Tip consumator", "type": "select", "section": "tehnic",
     "options": ["Casnic", "Necasnic - terț", "Industrial", "Comercial", "Public"],
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic"], "required": True},
    {"key": "regim_functionare", "label": "Regim funcționare", "type": "select", "section": "tehnic",
     "options": ["Permanent", "Sezonier (iarnă)", "Sezonier (vară)", "Intermitent", "În două schimburi", "Continuu 24/7"],
     "used_in": ["cerere_cu", "cerere_atr"]},
    {"key": "debit_instalat_mc_h", "label": "Debit instalat (m³/h)", "type": "number", "section": "tehnic",
     "used_in": ["cerere_cu", "cerere_atr", "memoriu_tehnic"], "required": True,
     "validation": {"min": 0.01, "max": 10000}},
    {"key": "consum_anual_mc", "label": "Consum anual estimat (m³/an)", "type": "number", "section": "tehnic",
     "used_in": ["cerere_cu", "cerere_atr"]},
    {"key": "nr_consumatori_simultani", "label": "Nr. consumatori simultani", "type": "number", "section": "tehnic",
     "used_in": ["cerere_atr", "memoriu_tehnic"]},
    {"key": "debit_individual_mc_h", "label": "Debit individual (m³/h)", "type": "number", "section": "tehnic",
     "used_in": ["cerere_atr", "memoriu_tehnic"]},

    # === SECȚIUNE: SF (Studiul de Fezabilitate) ===
    {"key": "sf_solutie_tehnica", "label": "Soluție tehnică propusă", "type": "textarea", "section": "sf",
     "used_in": ["cerere_atr", "memoriu_tehnic"]},
    {"key": "sf_lungime_conducta_m", "label": "Lungime conductă (m)", "type": "number", "section": "sf",
     "used_in": ["memoriu_tehnic"]},
    {"key": "sf_material_conducta", "label": "Material conductă", "type": "select", "section": "sf",
     "options": ["PE 100 SDR 11", "PE 100 SDR 17.6", "OL conform STAS 7656", "OL conform STAS 6898", "Inox"],
     "used_in": ["memoriu_tehnic", "carte_tehnica"]},
    {"key": "sf_diametru_nominal_DN", "label": "Diametru nominal (DN)", "type": "input", "section": "sf",
     "used_in": ["memoriu_tehnic"]},
    {"key": "sf_presiune_max_op_bar", "label": "Presiune max. operare (bar)", "type": "number", "section": "sf",
     "used_in": ["cerere_atr", "memoriu_tehnic", "carte_tehnica"]},

    # === SECȚIUNE: CU (Certificat de Urbanism) ===
    {"key": "cu_numar", "label": "Nr. Certificat Urbanism", "type": "input", "section": "cu",
     "used_in": ["cerere_atr", "carte_tehnica", "cerere_aviz_apa", "cerere_aviz_electrica",
                 "cerere_aviz_drumuri", "cerere_aviz_politie", "cerere_aviz_mediu", "cerere_aviz_iscir"]},
    {"key": "cu_data_emitere", "label": "Data emitere CU", "type": "date", "section": "cu",
     "used_in": ["cerere_atr", "carte_tehnica"]},

    # === SECȚIUNE: ATR (Aviz Tehnic Racordare) ===
    {"key": "atr_numar", "label": "Nr. ATR", "type": "input", "section": "atr",
     "used_in": ["cerere_pif", "carte_tehnica"]},
    {"key": "atr_data", "label": "Data ATR", "type": "date", "section": "atr",
     "used_in": ["carte_tehnica"]},
    {"key": "atr_osd", "label": "OSD emitent", "type": "select", "section": "atr",
     "options": ["Distrigaz Sud Rețele (Engie)", "Delgaz Grid", "Premier Energy", "OSD Gaz Nord-Est", "Altul"],
     "used_in": ["cerere_atr", "cerere_pif"], "required": True},

    # === SECȚIUNE: AC (Autorizație Construire) ===
    {"key": "ac_numar", "label": "Nr. AC", "type": "input", "section": "ac",
     "used_in": ["cerere_pif", "pv_receptie", "carte_tehnica", "predare_amplasament", "anunt_incepere"]},
    {"key": "ac_data_emitere", "label": "Data emitere AC", "type": "date", "section": "ac",
     "used_in": ["cerere_pif", "pv_receptie", "carte_tehnica", "predare_amplasament", "anunt_incepere"]},
    {"key": "ac_emitent", "label": "Primăria emitentă AC", "type": "input", "section": "ac",
     "used_in": ["anunt_incepere"]},
    {"key": "ac_termen_executie", "label": "Termen execuție AC (luni)", "type": "number", "section": "ac",
     "used_in": ["anunt_incepere"]},

    # === SECȚIUNE: DTAC (Documentație Tehnică Aviz Construire) ===
    {"key": "dtac_proiectant_specialitate", "label": "Proiectant gaze naturale", "type": "input", "section": "dtac",
     "used_in": ["memoriu_tehnic", "carte_tehnica", "pv_receptie", "predare_amplasament"], "required": True,
     "default": "Energy Project Design SRL"},
    {"key": "dtac_atestat_proiectant", "label": "Atestat ANRE proiectant", "type": "input", "section": "dtac",
     "used_in": ["memoriu_tehnic", "carte_tehnica"]},
    {"key": "dtac_data_intocmire", "label": "Data întocmire DTAC", "type": "date", "section": "dtac",
     "used_in": ["carte_tehnica"]},
    {"key": "dtac_verificator_vgd", "label": "Verificator VGD atestat ANRE", "type": "input", "section": "dtac",
     "used_in": ["memoriu_tehnic", "carte_tehnica", "borderou"]},

    # === SECȚIUNE: PT (Proiect Tehnic) ===
    {"key": "pt_lungime_m", "label": "PT - Lungime conductă (m)", "type": "number", "section": "pt",
     "used_in": ["memoriu_tehnic"]},
    {"key": "pt_lista_materiale", "label": "PT - Lista materiale principale", "type": "textarea", "section": "pt",
     "used_in": ["caiet_sarcini", "carte_tehnica"]},
    {"key": "pt_calcul_pierderi_presiune_bar", "label": "Pierderi presiune calculate (bar)", "type": "number", "section": "pt",
     "used_in": ["memoriu_tehnic"]},
    {"key": "pt_numar_planse", "label": "PT - Număr planșe", "type": "number", "section": "pt",
     "used_in": ["borderou"]},

    # === SECȚIUNE: EXECUȚIE ===
    {"key": "exec_firma", "label": "Firmă executantă", "type": "input", "section": "executie",
     "used_in": ["caiet_sarcini", "anunt_incepere", "predare_amplasament", "pv_receptie", "carte_tehnica",
                 "cerere_pif", "dispozitie_santier"]},
    {"key": "exec_responsabil_tehnic", "label": "Responsabil Tehnic Execuție (RTE)", "type": "input", "section": "executie",
     "used_in": ["caiet_sarcini", "anunt_incepere", "pv_receptie", "carte_tehnica"]},
    {"key": "exec_diriginte_santier", "label": "Diriginte de șantier", "type": "input", "section": "executie",
     "used_in": ["caiet_sarcini", "anunt_incepere", "predare_amplasament", "pv_receptie", "carte_tehnica"]},
    {"key": "exec_data_start", "label": "Data începere execuție", "type": "date", "section": "executie",
     "used_in": ["caiet_sarcini", "anunt_incepere", "pv_receptie", "carte_tehnica"]},
    {"key": "exec_data_terminare", "label": "Data terminare execuție", "type": "date", "section": "executie",
     "used_in": ["caiet_sarcini", "pv_receptie", "carte_tehnica", "cerere_pif"]},

    # === SECȚIUNE: PROBE ===
    {"key": "proba_rezistenta_bar", "label": "Proba rezistență (bar)", "type": "number", "section": "probe",
     "used_in": ["cerere_pif", "carte_tehnica"]},
    {"key": "proba_rezistenta_durata_min", "label": "Durată proba rezistență (min)", "type": "number", "section": "probe",
     "used_in": ["cerere_pif"]},
    {"key": "proba_etanseitate_bar", "label": "Proba etanșeitate (bar)", "type": "number", "section": "probe",
     "used_in": ["cerere_pif", "carte_tehnica"]},
    {"key": "proba_etanseitate_durata_h", "label": "Durată proba etanșeitate (ore)", "type": "number", "section": "probe",
     "used_in": ["cerere_pif"]},
    {"key": "proba_rezultat", "label": "Rezultat probe", "type": "select", "section": "probe",
     "options": ["Admis", "Admis cu observații", "Respins"],
     "used_in": ["cerere_pif", "memoriu_tehnic", "pv_receptie", "carte_tehnica"]},
    {"key": "proba_observatii", "label": "Observații probe / remedieri", "type": "textarea", "section": "probe",
     "used_in": ["memoriu_tehnic", "pv_receptie"]},

    # === SECȚIUNE: RECEPȚIE ===
    {"key": "receptie_pv_numar", "label": "Nr. PV Recepție", "type": "input", "section": "receptie",
     "used_in": ["cerere_pif", "carte_tehnica", "pv_receptie"]},
    {"key": "receptie_pv_data", "label": "Data PV Recepție", "type": "date", "section": "receptie",
     "used_in": ["cerere_pif", "carte_tehnica", "pv_receptie"]},
    {"key": "receptie_comisia", "label": "Comisia recepție (membri)", "type": "textarea", "section": "receptie",
     "used_in": ["pv_receptie", "carte_tehnica"]},
    {"key": "as_built_anexat", "label": "As-built anexat?", "type": "select", "section": "receptie",
     "options": ["Da", "Nu"], "used_in": ["cerere_pif", "carte_tehnica"]},

    # === SECȚIUNE: PIF (Punere în Funcțiune) ===
    {"key": "pif_data", "label": "Data PIF", "type": "date", "section": "pif",
     "used_in": ["carte_tehnica"]},
    {"key": "pif_osd", "label": "OSD prezent la PIF", "type": "input", "section": "pif",
     "used_in": ["carte_tehnica"]},
    {"key": "pif_responsabil_osd", "label": "Responsabil OSD la PIF", "type": "input", "section": "pif",
     "used_in": ["carte_tehnica"]},
    {"key": "pif_contor_serie", "label": "Serie contor", "type": "input", "section": "pif",
     "used_in": ["carte_tehnica"]},
    {"key": "pif_contor_index_initial", "label": "Index inițial contor (m³)", "type": "number", "section": "pif",
     "used_in": ["carte_tehnica"]},
    {"key": "pif_contract_furnizare", "label": "Contract furnizare gaze", "type": "input", "section": "pif",
     "used_in": ["carte_tehnica"]},

    # === SECȚIUNE: AVIZE CONDIȚIONALE ===
    {"key": "traseu_pe_drum", "label": "Traseul traversează drum public?", "type": "select", "section": "avize_cond",
     "options": ["Nu", "Da"], "used_in": ["cerere_aviz_drumuri", "cerere_aviz_politie"]},
    {"key": "drumuri_administrator", "label": "Administrator drum", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_drumuri"]},
    {"key": "politie_unitatea", "label": "Unitate Poliție Rutieră", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_politie"]},
    {"key": "are_centrala_termica", "label": "Există centrală termică în proiect?", "type": "select", "section": "avize_cond",
     "options": ["Nu", "Da"], "used_in": ["cerere_aviz_iscir"]},
    {"key": "centrala_putere_kw", "label": "Putere centrală (kW)", "type": "number", "section": "avize_cond",
     "used_in": ["cerere_aviz_iscir"]},
    {"key": "centrala_producator", "label": "Producător centrală", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_iscir"]},
    {"key": "apa_canal_operator", "label": "Operator APĂ-CANAL", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_apa"]},
    {"key": "electrica_operator", "label": "Operator REȚELE ELECTRICE", "type": "select", "section": "avize_cond",
     "options": ["E-Distribuție Muntenia", "E-Distribuție Dobrogea", "E-Distribuție Banat",
                 "Distribuție Energie Electrică România", "Delgaz Grid (NE)", "Electrica Furnizare"],
     "used_in": ["cerere_aviz_electrica"]},
    {"key": "apm_unitate", "label": "APM Județ", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_mediu"]},
    {"key": "iscir_unitate", "label": "Unitate ISCIR", "type": "input", "section": "avize_cond",
     "used_in": ["cerere_aviz_iscir"]},

    # === SECȚIUNE: DISPOZIȚIE ȘANTIER (opțional) ===
    {"key": "dispozitie_necesara", "label": "Necesară dispoziție șantier?", "type": "select", "section": "dispozitie",
     "options": ["Nu", "Da"], "used_in": ["dispozitie_santier"]},
    {"key": "dispozitie_obiect", "label": "Obiect dispoziție (modificare/clarificare)", "type": "textarea", "section": "dispozitie",
     "used_in": ["dispozitie_santier"]},
    {"key": "dispozitie_justificare", "label": "Justificare tehnică", "type": "textarea", "section": "dispozitie",
     "used_in": ["dispozitie_santier"]},
    {"key": "dispozitie_cost_impact", "label": "Impact cost", "type": "input", "section": "dispozitie",
     "used_in": ["dispozitie_santier"]},
    {"key": "dispozitie_termen_impact", "label": "Impact termen", "type": "input", "section": "dispozitie",
     "used_in": ["dispozitie_santier"]},
]


SECTIONS_META = {
    "proiect":      {"label": "Proiect & scop", "icon": "FileText", "order": 1},
    "beneficiar":   {"label": "Beneficiar", "icon": "User", "order": 2},
    "loc_consum":   {"label": "Loc consum", "icon": "MapPin", "order": 3},
    "tehnic":       {"label": "Date tehnice", "icon": "Settings2", "order": 4},
    "sf":           {"label": "Studiul de Fezabilitate (SF)", "icon": "Calculator", "order": 5},
    "cu":           {"label": "Certificat Urbanism (CU)", "icon": "FileCheck2", "order": 6},
    "atr":          {"label": "Aviz Tehnic Racordare (ATR)", "icon": "Plug", "order": 7},
    "ac":           {"label": "Autorizație Construire (AC)", "icon": "ShieldCheck", "order": 8},
    "dtac":         {"label": "DTAC + Proiectant atestat", "icon": "Stamp", "order": 9},
    "pt":           {"label": "Proiect Tehnic (PT)", "icon": "FileText", "order": 10},
    "executie":     {"label": "Execuție lucrări", "icon": "HardHat", "order": 11},
    "probe":        {"label": "Probe rezistență + etanșeitate", "icon": "FlaskConical", "order": 12},
    "receptie":     {"label": "Recepție la terminarea lucrărilor", "icon": "ClipboardCheck", "order": 13},
    "pif":          {"label": "PIF (Punere în Funcțiune)", "icon": "Flame", "order": 14},
    "avize_cond":   {"label": "Avize condiționale", "icon": "ListChecks", "order": 15},
    "dispozitie":   {"label": "Dispoziție șantier (opțional)", "icon": "Pencil", "order": 16},
}


# ============================================================================
# Helpers
# ============================================================================
def get_field(key: str) -> Optional[Dict[str, Any]]:
    for f in FIELDS_REGISTRY:
        if f["key"] == key:
            return f
    return None


def list_fields_for_section(section_id: str) -> List[Dict[str, Any]]:
    return [f for f in FIELDS_REGISTRY if f["section"] == section_id]


def list_fields_for_template(template_id: str) -> List[Dict[str, Any]]:
    return [f for f in FIELDS_REGISTRY if template_id in (f.get("used_in") or [])]


def compute_field_coverage(data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculează acoperirea câmpurilor: completate vs lipsă, pe secțiuni și pe template-uri."""
    total = len(FIELDS_REGISTRY)
    filled = sum(1 for f in FIELDS_REGISTRY if data.get(f["key"]) not in (None, "", [], {}))
    coverage_pct = round(100 * filled / total, 1) if total else 0

    per_section: Dict[str, Dict[str, Any]] = {}
    for f in FIELDS_REGISTRY:
        sec = f["section"]
        if sec not in per_section:
            per_section[sec] = {"total": 0, "filled": 0, "missing_keys": []}
        per_section[sec]["total"] += 1
        if data.get(f["key"]) not in (None, "", [], {}):
            per_section[sec]["filled"] += 1
        else:
            per_section[sec]["missing_keys"].append(f["key"])
    for sec, stats in per_section.items():
        stats["coverage_pct"] = round(100 * stats["filled"] / stats["total"], 1) if stats["total"] else 0

    per_template: Dict[str, Dict[str, Any]] = {}
    for f in FIELDS_REGISTRY:
        for tid in f.get("used_in") or []:
            if tid not in per_template:
                per_template[tid] = {"total": 0, "filled": 0, "missing_keys": []}
            per_template[tid]["total"] += 1
            if data.get(f["key"]) not in (None, "", [], {}):
                per_template[tid]["filled"] += 1
            else:
                per_template[tid]["missing_keys"].append(f["key"])
    for tid, stats in per_template.items():
        stats["coverage_pct"] = round(100 * stats["filled"] / stats["total"], 1) if stats["total"] else 0
        stats["ready_for_generation"] = stats["coverage_pct"] >= 80

    return {
        "total_fields": total,
        "filled_fields": filled,
        "overall_coverage_pct": coverage_pct,
        "per_section": per_section,
        "per_template": per_template,
    }
