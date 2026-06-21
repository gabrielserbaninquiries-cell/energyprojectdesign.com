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
     "options": [
        "Branșament gaze naturale (BR)",
        "Extindere rețea distribuție",
        "Instalație utilizare gaze naturale (IUGN)",
        "Mărire debit / Modificare debit",
        "Mărire DN (mărire diametru)",
        "Mutare contor / Mutare regulator",
        "Reabilitare conductă existentă",
        "Înlocuire conductă (PE pe oțel sau invers)",
        "Reabilitare branșament (refacere)",
        "Punere în conservare instalație",
        "Sistare consum / Desființare branșament",
        "Reactivare branșament",
        "Studiu fezabilitate (SF)",
        "Documentație tehnică pentru DTAC",
        "Documentație tehnică pentru PTH",
        "Audit energetic ANRE",
     ],
     "used_in": ["memoriu_tehnic", "cerere_atr", "anunt_incepere", "caiet_sarcini", "carte_tehnica", "cerere_pif"], "required": True},

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
    {"key": "atr_osd", "label": "OSD emitent (operator distribuție gaze)", "type": "select", "section": "atr",
     "options": [
        # OSD-uri majore RO (per ANRE - operatori distribuție gaze)
        "Distrigaz Sud Rețele S.R.L. (Engie România)",
        "Delgaz Grid S.A. (E.ON România)",
        "Premier Energy S.R.L.",
        "Gaz Vest S.A. (Timișoara)",
        "Megaconstruct S.A. (Vrancea)",
        "Mihoc Oil S.R.L.",
        "Nord Gaz Distribuție S.R.L.",
        "OMV Petrom Gas Marketing",
        "TransGaz S.A. (transport)",
        "Cordun Gaz S.R.L.",
        "Termogaz S.R.L. (Argeș)",
        "Wirom Gas S.A.",
        "Salgaz S.A. (Sălaj)",
        "Apele Românești - Gaz S.A.",
        "Hargaz Harghita Gaz S.A.",
        "Megaconstruct Industries S.A.",
        "Gaz Sud S.A.",
        "ENI Romania S.R.L.",
        "Electrocentrale Bucureşti S.A.",
        "Cogen Energy S.A.",
        "Distribuție Gaz Naturale Cluj S.R.L.",
        "Distribuție Gaz Naturale Brașov S.R.L.",
        "Linde Gaz România S.R.L.",
        "Air Products Romania S.R.L.",
        "GRG Distribuție Gaz Naturale S.A.",
        "Sigma Eta Distribuție S.R.L.",
        "Diamond Energy S.R.L.",
        "Black Sea Oil & Gas",
        "Gas Distribution Sud-Est S.A.",
        "Romgaz S.A. (producător)",
        "Altul (specificați în mențiuni)",
     ],
     "used_in": ["cerere_atr", "cerere_pif"], "required": True,
     "help": "Listă completă operatori distribuție gaze acreditați ANRE 2024-2026"},

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

    # === SECȚIUNE: FAZE DETERMINANTE & LUCRĂRI ASCUNSE (Legea 10/1995 + ISC) ===
    {"key": "fd_pcc_versiune", "label": "Program Control Calitate (PCC) versiune", "type": "input", "section": "faze_det",
     "used_in": ["program_control_calitate", "pv_faza_determinanta"],
     "help": "PCC = Program de Control al Calității, semnat de proiectant + executant + diriginte (Legea 10/1995 art. 22)"},
    {"key": "fd_pcc_data", "label": "Data întocmire PCC", "type": "date", "section": "faze_det",
     "used_in": ["program_control_calitate"]},
    {"key": "fd_sapatura", "label": "FD - Săpătură & pozare conductă", "type": "select", "section": "faze_det",
     "options": ["Nu efectuat", "Programat", "Realizat - admis", "Realizat - cu observații"],
     "used_in": ["pv_faza_determinanta", "carte_tehnica"]},
    {"key": "fd_sudura", "label": "FD - Sudură conductă PE/OL", "type": "select", "section": "faze_det",
     "options": ["Nu efectuat", "Programat", "Realizat - admis", "Realizat - cu observații"],
     "used_in": ["pv_faza_determinanta", "carte_tehnica"]},
    {"key": "fd_proba_presiune", "label": "FD - Proba presiune înainte de acoperire", "type": "select", "section": "faze_det",
     "options": ["Nu efectuat", "Programat", "Realizat - admis", "Realizat - cu observații"],
     "used_in": ["pv_faza_determinanta", "carte_tehnica"]},
    {"key": "fd_acoperire_sant", "label": "FD - Acoperire șanț (lucrare ascunsă)", "type": "select", "section": "faze_det",
     "options": ["Nu efectuat", "Programat", "Realizat - admis", "Realizat - cu observații"],
     "used_in": ["pv_faza_determinanta", "carte_tehnica", "pv_lucrari_ascunse"]},
    {"key": "fd_isc_notificat", "label": "ISC notificat pentru FD?", "type": "select", "section": "faze_det",
     "options": ["Nu", "Da"], "used_in": ["pv_faza_determinanta", "notificare_isc"]},
    {"key": "fd_isc_data_notificare", "label": "Data notificare ISC (minim 10 zile)", "type": "date", "section": "faze_det",
     "used_in": ["notificare_isc"]},

    # === SECȚIUNE: LUCRĂRI ASCUNSE (PV LA conform Legea 10/1995) ===
    {"key": "la_sapatura_data", "label": "Data PV săpătură (lucrare ascunsă)", "type": "date", "section": "lucrari_ascunse",
     "used_in": ["pv_lucrari_ascunse"]},
    {"key": "la_sapatura_adancime_cm", "label": "Adâncime pozare conductă (cm)", "type": "number", "section": "lucrari_ascunse",
     "used_in": ["pv_lucrari_ascunse", "memoriu_tehnic"],
     "help": "Min. 90 cm sub trotuar / 110 cm sub carosabil conform NTPEE 2018"},
    {"key": "la_strat_nisip_cm", "label": "Grosime strat nisip (cm)", "type": "number", "section": "lucrari_ascunse",
     "used_in": ["pv_lucrari_ascunse"]},
    {"key": "la_banda_avertizoare", "label": "Bandă avertizoare galbenă montată?", "type": "select",
     "options": ["Da", "Nu"], "section": "lucrari_ascunse", "used_in": ["pv_lucrari_ascunse"]},
    {"key": "la_protectie_mecanica", "label": "Protecție mecanică / tubaj prot.", "type": "input", "section": "lucrari_ascunse",
     "used_in": ["pv_lucrari_ascunse"]},
    {"key": "la_compactare_strat", "label": "Compactare strat acoperire", "type": "select", "section": "lucrari_ascunse",
     "options": ["Manual", "Mecanic plăcuță", "Mecanic cilindru", "—"], "used_in": ["pv_lucrari_ascunse"]},

    # === SECȚIUNE: EXIGENȚE A/B/C/D (HG 273/1994 + Legea 10/1995) ===
    {"key": "exig_A_rezistenta", "label": "A - Rezistență și stabilitate", "type": "textarea", "section": "exigente",
     "used_in": ["carte_tehnica", "memoriu_tehnic"],
     "default": "Conducta și fitting-urile sunt dimensionate conform NTPEE 2018 art. 5; calculul de rezistență respectă STAS 6657-3.",
     "help": "Cerință esențială A: stabilitate mecanică, încărcări, vibrații, presiune"},
    {"key": "exig_B_siguranta_expl", "label": "B - Siguranță în exploatare", "type": "textarea", "section": "exigente",
     "used_in": ["carte_tehnica", "memoriu_tehnic"],
     "default": "Sistem prevăzut cu robinete de izolare; semnalizare; bandă galbenă; verificare anuală conform NTPEE 2018 art. 16.",
     "help": "Cerință esențială B: protecție utilizator, robinete, semnalizare"},
    {"key": "exig_C_siguranta_foc", "label": "C - Siguranță la foc", "type": "textarea", "section": "exigente",
     "used_in": ["carte_tehnica", "memoriu_tehnic"],
     "default": "Distanțe minime conform NTPEE 2018 anexa 2; centrala este în spațiu ventilat conform STAS 6724; gaz odorizat.",
     "help": "Cerință esențială C: distanțe siguranță, ventilație, materiale incombustibile"},
    {"key": "exig_D_mediu", "label": "D - Igienă, sănătate, mediu", "type": "textarea", "section": "exigente",
     "used_in": ["carte_tehnica", "memoriu_tehnic"],
     "default": "Lucrările respectă Legea 292/2018; deșeurile sunt evacuate; nu există emisii poluante; ventilarea respectă STAS 6724.",
     "help": "Cerință esențială D: protecția mediului, deșeuri, ventilație"},

    # === SECȚIUNE: MATERIALE & ECHIPAMENTE (extins) ===
    {"key": "mat_certif_conformitate", "label": "Certificate conformitate materiale (text)", "type": "textarea", "section": "materiale",
     "used_in": ["carte_tehnica", "caiet_sarcini"],
     "help": "Listă serii + lot + producător + nr. certificat pentru fiecare material principal"},
    {"key": "mat_furnizor_teava", "label": "Furnizor țeavă principală", "type": "input", "section": "materiale",
     "used_in": ["caiet_sarcini", "carte_tehnica"]},
    {"key": "mat_furnizor_robinet", "label": "Furnizor robinet de branșament", "type": "input", "section": "materiale",
     "used_in": ["caiet_sarcini", "carte_tehnica"]},
    {"key": "mat_serie_robinet_br", "label": "Serie robinet branșament", "type": "input", "section": "materiale",
     "used_in": ["pv_receptie", "carte_tehnica", "cerere_pif"]},
    {"key": "mat_marca_contor", "label": "Marcă contor", "type": "select", "section": "materiale",
     "options": ["Itron G4", "Itron G6", "Elster G4", "Elster G6", "Metrix G10", "Apator G6", "Altul"],
     "used_in": ["cerere_pif", "carte_tehnica"]},

    # === SECȚIUNE: REFERAT VERIFICATOR (RVT - VGD obligatoriu) ===
    {"key": "rvt_nr", "label": "Nr. Referat Verificare Tehnică (RVT)", "type": "input", "section": "rvt",
     "used_in": ["referat_verificator", "memoriu_tehnic", "carte_tehnica"]},
    {"key": "rvt_data", "label": "Data RVT", "type": "date", "section": "rvt",
     "used_in": ["referat_verificator", "memoriu_tehnic", "carte_tehnica"]},
    {"key": "rvt_concluzii", "label": "Concluzii verificator (Acceptat/Cu observații/Respins)", "type": "select", "section": "rvt",
     "options": ["Acceptat", "Acceptat cu observații", "Respins"], "used_in": ["referat_verificator"]},
    {"key": "rvt_observatii", "label": "Observații/Recomandări verificator", "type": "textarea", "section": "rvt",
     "used_in": ["referat_verificator"]},

    # === SECȚIUNE: AS-BUILT (planuri executate) ===
    {"key": "asb_traseu_modificat", "label": "Traseul real diferă de proiect?", "type": "select", "section": "as_built",
     "options": ["Nu", "Da - modificări minore", "Da - dispoziție șantier emisă"], "used_in": ["as_built", "carte_tehnica"]},
    {"key": "asb_lungime_efectiva_m", "label": "Lungime efectivă as-built (m)", "type": "number", "section": "as_built",
     "used_in": ["as_built", "carte_tehnica", "pv_receptie"]},
    {"key": "asb_numar_sudari", "label": "Număr sudări executate", "type": "number", "section": "as_built",
     "used_in": ["as_built", "carte_tehnica"]},
    {"key": "asb_coords_gps", "label": "Coordonate GPS puncte cheie (text)", "type": "textarea", "section": "as_built",
     "used_in": ["as_built"]},

    # === SECȚIUNE: DIRIGINȚIE & ISC (Inspectoratul de Stat în Construcții) ===
    {"key": "isc_nr_inreg", "label": "Nr. înregistrare ISC", "type": "input", "section": "isc",
     "used_in": ["notificare_isc", "carte_tehnica"]},
    {"key": "isc_judet", "label": "ISC Județean", "type": "input", "section": "isc",
     "used_in": ["notificare_isc", "anunt_incepere"]},
    {"key": "diriginte_autorizatie", "label": "Autorizație diriginte șantier (MDLPA)", "type": "input", "section": "isc",
     "used_in": ["predare_amplasament", "pv_receptie", "carte_tehnica", "pv_lucrari_ascunse", "pv_faza_determinanta"]},
    {"key": "diriginte_telefon", "label": "Telefon diriginte șantier", "type": "input", "section": "isc",
     "used_in": ["anunt_incepere", "predare_amplasament"]},
    {"key": "diriginte_email", "label": "Email diriginte șantier", "type": "input", "section": "isc",
     "used_in": ["anunt_incepere"]},

    # === SECȚIUNE: CARTE TEHNICĂ A/B/C/D (HG 273/1994 + Ord. MLPAT 770/1997) ===
    {"key": "ct_sectiune_A_continut", "label": "Cartea tehnică - Secțiunea A (proiectare)", "type": "textarea", "section": "carte_tehnica_sec",
     "used_in": ["carte_tehnica"],
     "default": "Conține: tema-program, studii fezabilitate, proiecte avizate spre neschimbare, certificat urbanism, autorizația de construire, avize și acorduri."},
    {"key": "ct_sectiune_B_continut", "label": "Cartea tehnică - Secțiunea B (execuție)", "type": "textarea", "section": "carte_tehnica_sec",
     "used_in": ["carte_tehnica"],
     "default": "Conține: PV predare-primire amplasament, PV lucrări ascunse, PV faze determinante, jurnal de șantier, dispoziții de șantier, certificate de calitate materiale, buletine de probe."},
    {"key": "ct_sectiune_C_continut", "label": "Cartea tehnică - Secțiunea C (recepție)", "type": "textarea", "section": "carte_tehnica_sec",
     "used_in": ["carte_tehnica"],
     "default": "Conține: PV recepție terminare lucrări, PV recepție finală, lista neconformităților remediate, planuri as-built, schema izometrică finală."},
    {"key": "ct_sectiune_D_continut", "label": "Cartea tehnică - Secțiunea D (exploatare/urmărire)", "type": "textarea", "section": "carte_tehnica_sec",
     "used_in": ["carte_tehnica"],
     "default": "Conține: regulament de exploatare, plan de mentenanță, contracte de furnizare, eventuale intervenții ulterioare, urmărire în timp."},

    # === SECȚIUNE: COMISIA RECEPȚIE & DIRIGENȚIE (membri) ===
    {"key": "com_recep_presedinte", "label": "Președinte comisie recepție", "type": "input", "section": "comisia",
     "used_in": ["pv_receptie", "carte_tehnica"]},
    {"key": "com_recep_reprez_beneficiar", "label": "Reprezentant beneficiar comisie", "type": "input", "section": "comisia",
     "used_in": ["pv_receptie", "carte_tehnica"]},
    {"key": "com_recep_reprez_osd", "label": "Reprezentant OSD comisie", "type": "input", "section": "comisia",
     "used_in": ["pv_receptie", "carte_tehnica", "cerere_pif"]},
    {"key": "com_recep_reprez_isc", "label": "Reprezentant ISC (dacă aplicabil)", "type": "input", "section": "comisia",
     "used_in": ["pv_receptie", "carte_tehnica"]},

    # === SECȚIUNE: PV VERIFICARE CALITATE LUCRĂRI (FD 461 302) — inspirat din document real Pantelimon ===
    {"key": "pv_calitate_nr", "label": "Nr. PV verificare calitate", "type": "input", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate", "carte_tehnica"]},
    {"key": "pv_calitate_data", "label": "Data PV verificare calitate", "type": "date", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"]},
    {"key": "tip_sudura", "label": "Tip sudură executat", "type": "select", "section": "pv_calitate",
     "options": ["Electrofuziune (PE)", "Cap-cap (BUTT-fusion PE)", "Sudură arc OL (E308)",
                 "Mufă electrosudabilă", "Filet (FE-zincat)"],
     "used_in": ["pv_verificare_calitate", "pv_lucrari_ascunse", "carte_tehnica"],
     "help": "Tehnologia de sudare folosită la conducta de gaze (NTPEE 2018)."},
    {"key": "fir_trasor_material", "label": "Material fir trasor", "type": "select", "section": "pv_calitate",
     "options": ["Cupru (Cu)", "Aluminiu (Al)", "Oțel acoperit cupru (CCS)"],
     "used_in": ["pv_verificare_calitate", "pv_lucrari_ascunse", "memoriu_tehnic"],
     "help": "Conductă PE obligatorie are fir trasor pentru detectare ulterioară."},
    {"key": "fir_trasor_sectiune_mm2", "label": "Secțiune fir trasor (mm²)", "type": "select", "section": "pv_calitate",
     "options": ["1.5", "2.5", "4.0", "6.0"],
     "used_in": ["pv_verificare_calitate", "pv_lucrari_ascunse"]},
    {"key": "pv_calitate_documente_baza", "label": "Documente bază verificare", "type": "tags", "section": "pv_calitate",
     "options": ["Proiect tehnic", "Plan situație", "Facturi materiale", "Certificate calitate materiale",
                 "Certificate conformitate", "Autorizație construire", "ATR", "Buletin sudor", "Carnet sudor"],
     "used_in": ["pv_verificare_calitate"],
     "help": "Selectează documentele care au stat la baza verificării (multiselect)."},
    {"key": "pv_calitate_constatari", "label": "Constatări verificare teren", "type": "textarea", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"],
     "default": "S-a montat branșamentul conform proiect tehnic.\nSudurile s-au efectuat prin electrofuziune.\nȚeava a fost pozată pe pat de nisip de 10 cm grosime.\nFir trasor cupru 1.5 mm² montat continuu.\nAcoperire cu nisip în straturi compactate succesiv.\nBandă avertizoare ATENȚIE GAZ montată la 30 cm deasupra conductei.",
     "help": "Text liber - se preia automat în PV-ul de verificare a calității."},
    {"key": "pv_calitate_concluzii", "label": "Concluzii (măsuri stabilite)", "type": "textarea", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"],
     "default": "S-a executat proba branșamentului. Nu au fost luate alte măsuri.",
     "help": "Concluzii/măsuri formulate de diriginte + constructor."},
    {"key": "pv_calitate_mentiuni", "label": "Mențiuni speciale", "type": "textarea", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"],
     "default": "Se poate trece la verificarea lucrărilor care devin ascunse. Probele de presiune au fost considerate ADMISE.",
     "help": "Mențiuni speciale (probe ADMISE / RESPINSE / faza ascunsă)."},
    {"key": "pv_calitate_proba_admisa", "label": "Probă presiune ADMISĂ?", "type": "select", "section": "pv_calitate",
     "options": ["Da - ADMISĂ", "Da - cu observații", "Nu - RESPINSĂ - retest necesar"],
     "used_in": ["pv_verificare_calitate", "pv_lucrari_ascunse"]},
    {"key": "pv_calitate_diriginte", "label": "Diriginte șantier (semnătură)", "type": "input", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"]},
    {"key": "pv_calitate_constructor", "label": "Constructor (semnătură)", "type": "input", "section": "pv_calitate",
     "used_in": ["pv_verificare_calitate"]},

    # === SECȚIUNE: PROIECT - EXTENSIE (din DOCUMENTE REALE — Anexa 13, Foaie Capăt, Referat DTAC) ===
    {"key": "proiect_nr_an", "label": "Nr. proiect / An (ex: 190/2019)", "type": "input", "section": "proiect",
     "used_in": ["foaie_capat", "memoriu_tehnic", "referat_verificator", "borderou", "carte_tehnica"],
     "help": "Nr. intern al proiectului în registrul proiectantului."},
    {"key": "faza_proiectare", "label": "Faza proiectare", "type": "select", "section": "proiect",
     "options": ["P.A.C.", "P.T.H.", "D.E.", "P.A.C. + P.T.H.", "P.A.C. + P.T.H. + D.E.", "S.F.", "Avizare"],
     "used_in": ["foaie_capat", "memoriu_tehnic", "referat_verificator"],
     "help": "PAC = Proiect Autorizare Construire, PTH = Proiect Tehnic Hidraulic, DE = Detalii Execuție."},
    {"key": "denumire_lucrare_extinsa", "label": "Denumire lucrare (forma extinsă)", "type": "input", "section": "proiect",
     "used_in": ["foaie_capat", "memoriu_tehnic", "program_faze", "referat_verificator", "anunt_incepere"],
     "default": "Branșament gaze naturale (racord) nou proiectat",
     "help": "Forma exactă a denumirii cum apare în toate documentele oficiale."},
    {"key": "cladire_destinatie", "label": "Destinație clădire", "type": "select", "section": "tehnic",
     "options": ["Locuință individuală", "Locuință colectivă", "Comercială", "Industrială",
                 "Mixt (locuință + comercial)", "Birouri", "Spital", "Școală", "Hală"],
     "used_in": ["memoriu_tehnic", "referat_verificator", "carte_tehnica"]},
    {"key": "categorie_importanta_HG766", "label": "Categorie importanță (HG 766/1997)", "type": "select", "section": "tehnic",
     "options": ["A - Excepțională", "B - Deosebită", "C - Normală", "D - Redusă"],
     "used_in": ["memoriu_tehnic", "referat_verificator", "program_faze", "carte_tehnica"],
     "default": "C - Normală",
     "help": "Categoria de importanță stabilește exigențele aplicabile (HG 766/1997)."},
    {"key": "program_control_model", "label": "Program control - model", "type": "select", "section": "tehnic",
     "options": ["Model 1", "Model 2", "Model 3"], "default": "Model 2",
     "used_in": ["program_faze"]},

    # === SECȚIUNE: AUTORIZĂRI PROIECTANT + EXECUTANT (extins din REFERAT DTAC) ===
    {"key": "proiectant_general_firma", "label": "Proiectant general (firmă)", "type": "input", "section": "dtac",
     "used_in": ["foaie_capat", "memoriu_tehnic", "referat_verificator", "borderou", "anunt_incepere"]},
    {"key": "proiectant_aut_nr", "label": "Proiectant - nr. autorizație ANRE", "type": "input", "section": "dtac",
     "used_in": ["foaie_capat", "memoriu_tehnic", "referat_verificator"]},
    {"key": "proiectant_aut_grad", "label": "Proiectant - grad ANRE", "type": "select", "section": "dtac",
     "options": ["I.G.D. (Instalator Gaze Distribuție)", "P.G.D. (Proiectant Gaze Distribuție)",
                 "E.G.D. (Executant Gaze Distribuție)", "P.G.I.U. (Proiectant Gaze Inst. Utilizare)",
                 "I.G.I.U. (Instalator Gaze Inst. Utilizare)"],
     "used_in": ["foaie_capat", "memoriu_tehnic", "referat_verificator"], "default": "P.G.D."},
    {"key": "executant_aut_nr", "label": "Executant - nr. autorizație ANRE", "type": "input", "section": "executie",
     "used_in": ["foaie_capat", "anunt_incepere", "predare_amplasament"]},
    {"key": "executant_aut_grad", "label": "Executant - grad ANRE", "type": "select", "section": "executie",
     "options": ["E.G.D. (Executant Gaze Distribuție)", "E.G.I.U. (Executant Gaze Inst. Utilizare)"],
     "used_in": ["foaie_capat", "anunt_incepere"], "default": "E.G.D."},
    {"key": "verificator_legitimatie_nr", "label": "Legitimație verificator atestat (ex: V140700122)", "type": "input", "section": "rvt",
     "used_in": ["referat_verificator"]},

    # === SECȚIUNE: ORDIN LUCRU & ACORD ACCES (Distrigaz/Delgaz/Premier) ===
    {"key": "ordin_lucru_nr_data", "label": "Ordin de lucru OSD (nr/data)", "type": "input", "section": "atr",
     "used_in": ["memoriu_tehnic", "referat_verificator", "anunt_incepere", "borderou"],
     "help": "Ex: 50041207/09.02.2018, emis de Distrigaz Sud Rețele"},
    {"key": "acord_acces_nr_data", "label": "Acord de acces OSD (nr/data)", "type": "input", "section": "atr",
     "used_in": ["memoriu_tehnic", "referat_verificator", "borderou", "cerere_atr"]},

    # === SECȚIUNE: AVIZE - NUMERE OFICIALE (extins din REFERAT REAL) ===
    {"key": "aviz_apa_nr_data", "label": "Aviz Apa Nova / Apa-Canal (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou", "memoriu_tehnic"]},
    {"key": "aviz_edistr_nr_data", "label": "Aviz E-Distribuție / electric (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_telekom_nr_data", "label": "Aviz Telekom (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_netcity_nr_data", "label": "Aviz Netcity Telecom (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_luxten_nr_data", "label": "Aviz Luxten / iluminat (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_stb_nr_data", "label": "Aviz S.T.B. / R.A.T.B. (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_mediu_pmb_nr_data", "label": "Aviz Direcția de Mediu Primărie (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_circulatie_pmb_nr_data", "label": "Aviz Comisia tehnică circulație (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_strazi_nr_data", "label": "Aviz Administrația Străzilor (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},
    {"key": "aviz_apm_nr_data", "label": "Aviz APM / Mediu (nr/data)", "type": "input", "section": "avize_cond",
     "used_in": ["referat_verificator", "borderou"]},

    # === SECȚIUNE: AMPLASAMENT DUBLU (LUCRARE vs. IMOBIL) ===
    {"key": "amplasament_lucrare", "label": "Amplasament lucrare (stradă conductă)", "type": "input", "section": "loc_consum",
     "used_in": ["foaie_capat", "memoriu_tehnic", "program_faze", "referat_verificator"],
     "help": "Locația unde se va executa conducta (poate diferi de imobilul consumator)."},
    {"key": "amplasament_imobil_consum", "label": "Amplasament imobil consum (locație consumator)", "type": "input", "section": "loc_consum",
     "used_in": ["foaie_capat", "memoriu_tehnic", "program_faze", "referat_verificator"]},

    # === SECȚIUNE: CARACTERISTICI TEHNICE EXTINSE (din MEMORIU REAL) ===
    {"key": "presiune_categorie", "label": "Categorie presiune", "type": "select", "section": "tehnic",
     "options": ["JOASA PRESIUNE (<0.05 bar)", "REDUSA PRESIUNE (0.05-2 bar)",
                 "MEDIE PRESIUNE (2-6 bar)", "ÎNALTĂ PRESIUNE (>6 bar)"],
     "used_in": ["memoriu_tehnic", "cerere_atr", "referat_verificator"]},
    {"key": "pozare_distanta_limita", "label": "Distanța față de limita proprietate (m)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"],
     "help": "Ex: 0.2m fata de limita stanga"},
    {"key": "lungime_raiser_m", "label": "Lungime raiser (m)", "type": "number", "section": "tehnic",
     "used_in": ["memoriu_tehnic", "caiet_sarcini", "as_built"], "default": 1},
    {"key": "lungime_pe_drum_m", "label": "Lungime pe drum public (m)", "type": "number", "section": "tehnic",
     "used_in": ["memoriu_tehnic", "caiet_sarcini", "cerere_aviz_drumuri"]},
    {"key": "conducta_existenta_strada", "label": "Conductă existentă - stradă", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic", "cerere_atr"]},
    {"key": "conducta_existenta_caracteristici", "label": "Conductă existentă - caracteristici (DN, material)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"],
     "help": "Ex: PE100 SDR11, Dn 90mm"},
    {"key": "unghi_cuplare_min_grade", "label": "Unghi minim cuplare conductă (°)", "type": "number", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": 60},
    {"key": "tub_protectie", "label": "Tub de protecție", "type": "select", "section": "tehnic",
     "options": ["Nu este necesar", "Necesar pe toată lungimea", "Necesar parțial (specifică în descriere)"],
     "used_in": ["memoriu_tehnic", "caiet_sarcini"]},
    {"key": "pat_caramizi", "label": "Pat de cărămizi (dimensiuni)", "type": "input", "section": "executie",
     "used_in": ["memoriu_tehnic", "caiet_sarcini", "pv_lucrari_ascunse"],
     "help": "Ex: L=1m x 0.4m"},

    # === SECȚIUNE: CONDIȚII NATURALE ZONA (CLIMĂ + GEOLOGIE + SEISMIC) ===
    {"key": "relief_zona", "label": "Relief zona", "type": "select", "section": "tehnic",
     "options": ["Câmpie / Plat", "Deluros", "Munte", "Litoral", "Deltă"],
     "used_in": ["memoriu_tehnic"], "default": "Câmpie / Plat"},
    {"key": "temp_medie_anuala_C", "label": "Temperatură medie anuală (°C)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": "+10 ... +11"},
    {"key": "temp_minima_iarna_C", "label": "Temperatură minimă iarnă (°C)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": "-15"},
    {"key": "seismic_grad_SR11100", "label": "Grad seismic SR 11100-1", "type": "select", "section": "tehnic",
     "options": ["6 (MKS)", "7 (MKS)", "8 (MKS)", "9 (MKS)"], "used_in": ["memoriu_tehnic"]},
    {"key": "seismic_acceleratie_ag", "label": "Accelerație teren ag (P100-1)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": "0.24g"},
    {"key": "seismic_perioada_colt_Tc", "label": "Perioadă colț Tc (P100-1)", "type": "input", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": "1.6s"},
    {"key": "adancime_inghet_cm", "label": "Adâncime maximă îngheț (cm) - STAS 6054", "type": "number", "section": "tehnic",
     "used_in": ["memoriu_tehnic"], "default": 90},
    {"key": "altitudine_m", "label": "Altitudinea zonei (m)", "type": "number", "section": "tehnic",
     "used_in": ["memoriu_tehnic"]},

    # === SECȚIUNE: EXEMPLARE & BORDEROU ===
    {"key": "exemplare_nr", "label": "Nr. exemplare proiect (predate/primite)", "type": "number", "section": "dtac",
     "used_in": ["referat_verificator", "borderou", "predare_amplasament"], "default": 4},

    # === SECȚIUNE: PROGRAM FAZE — REFERINȚE LEGALE ===
    {"key": "program_faze_isc_judet", "label": "ISC Județean (aprobă PCC)", "type": "input", "section": "isc",
     "used_in": ["program_faze", "notificare_isc"],
     "help": "Ex: 'BUCURESTI – ILFOV'"},
    {"key": "program_faze_baza_legala", "label": "Bază legală PCC", "type": "tags", "section": "faze_det",
     "options": ["HG 766/1997", "Ordin MLPAT 31/N/12.10.1995", "HG 272/1994", "HG 273/1994",
                 "Legea 10/1995", "Ord. MLPAT 12/N/1995", "HG 1735/2006"],
     "used_in": ["program_faze"],
     "default": ["HG 766/1997", "Ordin MLPAT 31/N/12.10.1995", "HG 272/1994", "HG 273/1994"]},

    # === SECȚIUNE: MATERIALE — REFERINȚE LA CATALOG OSD (Anexa 13) ===
    {"key": "materiale_catalog_codes", "label": "Materiale catalog OSD (coduri)", "type": "tags", "section": "materiale",
     "used_in": ["lista_materiale", "caiet_sarcini", "carte_tehnica"],
     "help": "Selectează coduri din catalogul OSD (554 materiale predefinite)."},

    # ============================================================================
    # === V8.4 NEW: DOCUMENTE LEGALE OBLIGATORII (7 documente) ===
    # ============================================================================

    # — Declarație de Conformitate Executant (DC) —
    {"key": "dc_numar_data", "label": "DC nr. / dată", "type": "input", "section": "doc_legale",
     "used_in": ["declaratie_conformitate"], "help": "Ex: DC/EPD/47-2026"},

    # — Buletin Probă Rezistență —
    {"key": "p_initiala_rez", "label": "Presiune inițială probă rezistență (bar)", "type": "number", "section": "probe_extinse",
     "used_in": ["buletin_proba_rezistenta"], "default": 6.05, "help": "Min 1.5 × Pmax_op"},
    {"key": "p_finala_rez", "label": "Presiune finală probă rezistență (după 60 min, bar)", "type": "number", "section": "probe_extinse",
     "used_in": ["buletin_proba_rezistenta"], "default": 6.04},
    {"key": "verdict_rez", "label": "Verdict probă rezistență", "type": "select", "section": "probe_extinse",
     "options": ["ADMIS", "RESPINS"], "used_in": ["buletin_proba_rezistenta"], "default": "ADMIS"},

    # — Buletin Probă Etanșeitate —
    {"key": "p_initiala_et", "label": "Presiune inițială probă etanșeitate (bar)", "type": "number", "section": "probe_extinse",
     "used_in": ["buletin_proba_etanseitate"], "default": 0.110},
    {"key": "p_finala_et", "label": "Presiune finală etanșeitate după 24h (bar)", "type": "number", "section": "probe_extinse",
     "used_in": ["buletin_proba_etanseitate"], "default": 0.108},
    {"key": "verdict_et", "label": "Verdict probă etanșeitate", "type": "select", "section": "probe_extinse",
     "options": ["ADMIS", "RESPINS"], "used_in": ["buletin_proba_etanseitate"], "default": "ADMIS"},

    # — PV Recepție Finală (PVRF la 1-3 ani după PVRTL) —
    {"key": "pvrf_numar", "label": "PVRF nr.", "type": "input", "section": "doc_legale",
     "used_in": ["pv_receptie_finala"], "help": "Ex: PVRF-2027/12"},
    {"key": "pvrf_data", "label": "Data Recepție Finală", "type": "date", "section": "doc_legale",
     "used_in": ["pv_receptie_finala"]},
    {"key": "pvrf_constatari", "label": "PVRF — Constatări", "type": "textarea", "section": "doc_legale",
     "used_in": ["pv_receptie_finala"]},

    # — PV Punere în Funcțiune semnat OSD (PIF) —
    {"key": "pif_numar", "label": "PV PIF nr.", "type": "input", "section": "doc_legale",
     "used_in": ["pv_pif_semnat", "cerere_pif"], "help": "Ex: PIF/DGSR/2026-3421"},
    {"key": "pif_data", "label": "Data PIF", "type": "date", "section": "doc_legale",
     "used_in": ["pv_pif_semnat"]},
    {"key": "clc_cod", "label": "CLC — cod loc consum (atribuit OSD)", "type": "input", "section": "doc_legale",
     "used_in": ["pv_pif_semnat"], "help": "Cod unic furnizor gaze, 13 caractere"},
    {"key": "contor_serie", "label": "Contor seria", "type": "input", "section": "doc_legale",
     "used_in": ["pv_pif_semnat", "as_built"]},
    {"key": "contor_index_pif", "label": "Contor index la PIF (m³)", "type": "input", "section": "doc_legale",
     "used_in": ["pv_pif_semnat"], "default": "0.000"},

    # — Fișa Sudor Autorizat —
    {"key": "sudor_nume", "label": "Nume sudor autorizat", "type": "input", "section": "doc_legale",
     "used_in": ["fisa_sudor"]},
    {"key": "sudor_cnp", "label": "CNP sudor", "type": "input", "section": "doc_legale",
     "used_in": ["fisa_sudor"], "help": "13 cifre, validat conform algoritmului CNP RO"},
    {"key": "sudor_autorizatie_nr", "label": "Autorizație sudor ANRE nr.", "type": "input", "section": "doc_legale",
     "used_in": ["fisa_sudor"], "help": "Ex: ANRE-SUD-PE-2024-1542"},
    {"key": "sudor_total_suduri", "label": "Total suduri efectuate pe obiectiv", "type": "number", "section": "doc_legale",
     "used_in": ["fisa_sudor"], "default": 0},

    # — Plan SSM (Securitate Sănătate Muncă) —
    {"key": "ssm_coordonator", "label": "Coordonator SSM (HG 300/2006)", "type": "input", "section": "doc_legale",
     "used_in": ["plan_ssm"], "help": "Cerut pentru șantiere cu >1 antreprenor"},
    {"key": "ssm_nr_lucratori", "label": "Număr lucrători angajați pe șantier", "type": "number", "section": "doc_legale",
     "used_in": ["plan_ssm"], "default": 3},

    # ============================================================================
    # === V8.5 NEW: NTPEE 2018 (Ordin ANRE 89/2018) câmpuri obligatorii ===
    # Identificate din art. 12 NTPEE 2018 — date generale, instalație interioară,
    # planuri desenate, calcule hidraulice Renouard per tronson
    # ============================================================================

    # — Date generale NTPEE 2018 art. 12 (1) —
    {"key": "titular_investitie", "label": "Titularul investiției (NTPEE art. 12.1.c)", "type": "input", "section": "ntpee_general",
     "used_in": ["memoriu_tehnic", "cerere_atr", "caiet_sarcini"],
     "help": "Persoana fizică/juridică ce inițiază și finanțează investiția — poate diferi de beneficiar"},
    {"key": "studiu_geotehnic_anexat", "label": "Studiu geotehnic anexat", "type": "select", "section": "ntpee_general",
     "options": ["Da — anexat", "Nu se aplică (zona urbană fără risc)"], "used_in": ["memoriu_tehnic"],
     "default": "Nu se aplică (zona urbană fără risc)",
     "help": "Obligatoriu în zone seismice >gradul VIII sau cu sol problematic"},
    {"key": "masuri_antipatrundere_gaze", "label": "Măsuri evitare pătrundere gaze în clădiri", "type": "textarea", "section": "ntpee_general",
     "used_in": ["memoriu_tehnic", "caiet_sarcini"],
     "default": "Etanșarea cu mortar special a intrării conductei prin perete + tub de protecție PVC Ø110 + ventilație naturală subsol (h≥0.5m perimetral)"},
    {"key": "masuri_evacuare_infiltratii", "label": "Măsuri evacuare infiltrații gaze", "type": "textarea", "section": "ntpee_general",
     "used_in": ["memoriu_tehnic"],
     "default": "Ventilație permanentă subsol prin orificii la nivelul superior și inferior, secțiune liberă min. 1/3000 din suprafața utilă"},

    # — Piese desenate obligatorii (NTPEE art. 12.2) —
    {"key": "schema_izometrica_atasata", "label": "Schema izometrică (anexată borderou)", "type": "select", "section": "piese_desenate",
     "options": ["Da", "Nu (rețea liniară simplă)"], "used_in": ["borderou", "memoriu_tehnic"], "default": "Da"},
    {"key": "profiluri_sectiuni_atasate", "label": "Profiluri / secțiuni transversale (anexate)", "type": "select", "section": "piese_desenate",
     "options": ["Da — pe traversări carosabil", "Nu"], "used_in": ["borderou"], "default": "Da — pe traversări carosabil"},
    {"key": "cote_nivel_conducte", "label": "Cote de nivel conducte (rTN — referă teren natural, m)", "type": "input", "section": "piese_desenate",
     "used_in": ["memoriu_tehnic", "borderou"],
     "help": "Ex: -0.90m sub trotuar, -1.00m sub carosabil — măsurate de la teren natural"},
    {"key": "armaturi_lista", "label": "Armături și fitinguri (lista)", "type": "textarea", "section": "piese_desenate",
     "used_in": ["borderou", "lista_materiale"],
     "default": "1× Robinet branșament sub presiune PE 100 DN 32, 1× Cot 90° PE 100, 1× Reducție PE-Oțel, 1× Cuplaj electrofuziune"},

    # — Instalație interioară (NTPEE art. 12.5) —
    {"key": "volume_incaperi_m3", "label": "Volume încăperi consumatori (m³)", "type": "input", "section": "instalatie_interioara",
     "used_in": ["memoriu_tehnic"],
     "help": "Per cameră cu aparat consumator. Ex: Bucătărie 30 m³ + Baie 15 m³"},
    {"key": "suprafete_vitrate_m2", "label": "Suprafețe vitrate (m²)", "type": "input", "section": "instalatie_interioara",
     "used_in": ["memoriu_tehnic"],
     "help": "Min. 1/10 din suprafața utilă încăpere conform NTPEE 2018"},
    {"key": "material_tamplarie_vitrata", "label": "Material tâmplărie vitrată", "type": "select", "section": "instalatie_interioara",
     "options": ["PVC cu termopan", "Aluminiu cu termopan", "Lemn stratificat"], "used_in": ["memoriu_tehnic"],
     "default": "PVC cu termopan"},
    {"key": "detectoare_gaze_auto", "label": "Detectoare automate gaze (CH4/CO)", "type": "select", "section": "instalatie_interioara",
     "options": ["Da — 1 buc bucătărie", "Da — 2 buc (bucătărie + CT)", "Nu (nu obligatoriu pentru casnic)"],
     "used_in": ["memoriu_tehnic", "caiet_sarcini"],
     "default": "Da — 1 buc bucătărie"},
    {"key": "elemente_aport_aer", "label": "Elemente aport aer combustibil", "type": "textarea", "section": "instalatie_interioara",
     "used_in": ["memoriu_tehnic"],
     "default": "Grilă fixă ventilație ø150mm la partea inferioară perete exterior, neobturabilă"},

    # — Subsol / etanșare (NTPEE art. 12.4) —
    {"key": "etansare_intrare_subsol", "label": "Etanșare intrare conductă în clădire", "type": "select", "section": "instalatie_interioara",
     "options": ["Manșon cauciuc + mortar etanș", "Tub protecție PVC + bandă bituminoasă", "Garnitură EPDM specială gaze"],
     "used_in": ["memoriu_tehnic", "caiet_sarcini"], "default": "Manșon cauciuc + mortar etanș"},
    {"key": "ventilare_subsol", "label": "Ventilare subsol", "type": "select", "section": "instalatie_interioara",
     "options": ["Da — orificii sup+inf", "Nu se aplică (fără subsol)"], "used_in": ["memoriu_tehnic"],
     "default": "Nu se aplică (fără subsol)"},

    # — Breviar calcul Renouard per tronson (NTPEE 2018 cap. 3) —
    {"key": "tronson_id", "label": "Tronson principal calculat (ID)", "type": "input", "section": "renouard",
     "used_in": ["memoriu_tehnic"],
     "help": "Ex: T1 (de la PR la cot bucătărie)"},
    {"key": "debit_tronson_mc_h", "label": "Debit tronson principal (m³/h)", "type": "number", "section": "renouard",
     "used_in": ["memoriu_tehnic"], "default": 4.0,
     "help": "Suma debitelor aparatelor consumatoare alimentate de tronson"},
    {"key": "p_intrare_tronson_bar", "label": "Presiune intrare tronson (bar)", "type": "number", "section": "renouard",
     "used_in": ["memoriu_tehnic"], "default": 0.025,
     "help": "Presiune disponibilă în nodul de pornire (Joasă Presiune = 0.025bar)"},
    {"key": "p_iesire_min_tronson_bar", "label": "Presiune minimă ieșire tronson (bar)", "type": "number", "section": "renouard",
     "used_in": ["memoriu_tehnic"], "default": 0.020,
     "help": "Presiune minimă acceptată la consumator final (≥0.018 bar JP)"},
    {"key": "coeficient_renouard", "label": "Coeficient Renouard (β)", "type": "input", "section": "renouard",
     "used_in": ["memoriu_tehnic"],
     "default": "β = 23200 (JP cu d<50mm)",
     "help": "Conform NTPEE 2018 Anexa 5"},
    {"key": "pierderi_p_admise_bar", "label": "Pierderi presiune admise (bar)", "type": "number", "section": "renouard",
     "used_in": ["memoriu_tehnic", "caiet_sarcini"], "default": 0.005,
     "help": "Δp ≤ 0.005 bar pentru JP, ≤ 50% din presiunea inițială pentru RP/MP"},
]


# ============================================================================
# CATEGORII MARI (6) — pentru navigare UI-friendly pe pagina Gaze Naturale
# ============================================================================
# Conform cerinței user (literal):
#   "structureaza pagina pe sectiunile date din comenzi:
#    'date proiect', 'documentatie avize', 'documentatie proiectare',
#    'documentatie executie', 'carte tehnica', 'dispozitie de santier'."
#
# Fiecare secțiune detaliată (din SECTIONS_META) este mapată la una din cele 6 categorii.
CATEGORIES_META = {
    "date_proiect": {
        "label": "Date proiect",
        "description": "Beneficiar, loc consum, scop lucrare, date tehnice, CU, ATR, AC, SF.",
        "icon": "Folder",
        "order": 1,
        "sections": ["proiect", "beneficiar", "loc_consum", "tehnic", "sf", "cu", "atr", "ac"],
    },
    "documentatie_avize": {
        "label": "Documentație avize",
        "description": "Toate avizele aplicabile (apă, electric, drumuri, poliție, mediu, ISCIR, etc).",
        "icon": "ListChecks",
        "order": 2,
        "sections": ["avize_cond"],
    },
    "documentatie_proiectare": {
        "label": "Documentație proiectare",
        "description": "DTAC, Proiect Tehnic, Memoriu tehnic, Caiet sarcini, RVT verificator atestat, Exigențe A/B/C/D, Materiale.",
        "icon": "PencilRuler",
        "order": 3,
        "sections": ["dtac", "pt", "rvt", "exigente", "materiale"],
    },
    "documentatie_executie": {
        "label": "Documentație execuție",
        "description": "Anunț începere, predare amplasament, faze determinante, lucrări ascunse, probe presiune, PV verificare calitate, recepție, PIF, ISC.",
        "icon": "HardHat",
        "order": 4,
        "sections": ["executie", "faze_det", "lucrari_ascunse", "pv_calitate", "probe", "receptie", "pif", "isc", "comisia"],
    },
    "carte_tehnica": {
        "label": "Carte tehnică",
        "description": "Cartea Tehnică a Construcției (Secțiunile A/B/C/D) + As-Built (planuri executate).",
        "icon": "BookOpen",
        "order": 5,
        "sections": ["carte_tehnica_sec", "as_built"],
    },
    "dispozitie_santier": {
        "label": "Dispoziție de șantier",
        "description": "Dispoziții emise în timpul execuției (modificări, clarificări, justificări tehnice).",
        "icon": "Pencil",
        "order": 6,
        "sections": ["dispozitie"],
    },
    "documente_legale": {
        "label": "Documente legale obligatorii",
        "description": "Declarație conformitate, buletine probe, PV recepție finală, PIF semnat OSD, fișă sudor, plan SSM.",
        "icon": "ShieldCheck",
        "order": 7,
        "sections": ["doc_legale", "probe_extinse"],
    },
    "ntpee_compliance": {
        "label": "NTPEE 2018 obligatorii",
        "description": "Câmpuri obligatorii conform Ord. ANRE 89/2018 (NTPEE) — date generale, instalație interioară, piese desenate, calcule Renouard.",
        "icon": "BookCheck",
        "order": 8,
        "sections": ["ntpee_general", "piese_desenate", "instalatie_interioara", "renouard"],
    },
}


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
    "faze_det":     {"label": "Faze determinante (FD) & PCC", "icon": "Flag", "order": 17},
    "lucrari_ascunse": {"label": "Lucrări ascunse (PV LA)", "icon": "EyeOff", "order": 18},
    "exigente":     {"label": "Exigențe A/B/C/D (Legea 10/1995)", "icon": "ShieldAlert", "order": 19},
    "materiale":    {"label": "Materiale & echipamente (lot, serii)", "icon": "Package", "order": 20},
    "rvt":          {"label": "Referat Verificator (RVT VGD)", "icon": "FileCheck", "order": 21},
    "as_built":     {"label": "As-Built (planuri executate)", "icon": "Map", "order": 22},
    "isc":          {"label": "ISC & Diriginte șantier", "icon": "ShieldCheck", "order": 23},
    "carte_tehnica_sec": {"label": "Carte tehnică A/B/C/D", "icon": "BookOpen", "order": 24},
    "comisia":      {"label": "Comisia recepție (membri)", "icon": "Users", "order": 25},
    "pv_calitate":  {"label": "PV verificare calitate (FD)", "icon": "ClipboardCheck", "order": 26},
    "doc_legale":   {"label": "Documente legale obligatorii (DC, PVRF, PIF, sudor, SSM)", "icon": "ShieldCheck", "order": 27},
    "probe_extinse":{"label": "Probe presiune detaliate (buletine)", "icon": "FlaskConical", "order": 28},
    "ntpee_general":{"label": "NTPEE — date generale (titular, geotehnic, antipătrundere)", "icon": "FileText", "order": 29},
    "piese_desenate":{"label": "NTPEE — piese desenate (izometrică, cote, armături)", "icon": "Pencil", "order": 30},
    "instalatie_interioara":{"label": "NTPEE — instalație interioară (volume, vitraj, ventilație)", "icon": "Home", "order": 31},
    "renouard":     {"label": "NTPEE — breviar calcul Renouard per tronson", "icon": "Calculator", "order": 32},
}


# ============================================================================
# Helpers pentru categorii (6 mari)
# ============================================================================
def get_category_for_section(section_id: str) -> Optional[str]:
    """Returnează id-ul categoriei mari pentru o secțiune detaliată."""
    for cat_id, cat in CATEGORIES_META.items():
        if section_id in cat["sections"]:
            return cat_id
    return None


def list_fields_for_category(category_id: str) -> List[Dict[str, Any]]:
    """Returnează toate câmpurile dintr-o categorie mare (concatenate din toate secțiunile)."""
    cat = CATEGORIES_META.get(category_id)
    if not cat:
        return []
    return [f for f in FIELDS_REGISTRY if f["section"] in cat["sections"]]


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
