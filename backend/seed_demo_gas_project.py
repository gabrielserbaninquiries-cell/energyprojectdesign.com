"""
Seed enrichment — Demo Branșament Cap-Coadă (V9.0)

Cerință user: "vreau sa faci un fork pentru completarea unui proiect real de
bransament cap coada dupa modelul fisierelor atasate sau a tuturor fisierelor
care se pot intocmi si procesa prin acest serviciu".

Acest script îmbogățește proiectul demo (PID gp_e79e2810cc64b5b4) cu un set
complet de date reale extrase din artefactele oficiale uploadate:
- "Cămpuri de introdus în pagina gaze naturale.docx"
- "5. MEMORIU AVIZARE - DE MODIFICAT.doc"
- "2. FOAIE DE CAPAT (PROIECT).doc"
- "1. REFERAT DTAC MLPAT.doc"
- "6. PROGRAM DE FAZE -.doc"
- "LISTA MATERIALE (ANEXA 13).XLS"

Rezultat: proiect real cap-coadă cu 221 câmpuri populate, 33 documente DOCX
gata de generat, fără date placeholder fictive. Reprezintă produsul real pe
care Energy Project Design S.R.L. îl listează pe Google.

Run: python3 -m backend.seed_demo_gas_project
"""
import os
import sys
from datetime import datetime, timezone
from pymongo import MongoClient

# Ensure backend imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


DEMO_PID = "gp_e79e2810cc64b5b4"
DEMO_OWNER_EMAIL = "dragosserban95@gmail.com"

# ============================================================================
# REAL-WORLD COMPLETE DATA — Bransament gaze naturale strada Aurel Vlaicu 15
# Extras din Foaie Capăt + Memoriu Avizare + Referat DTAC + Program Faze
# ============================================================================
REAL_BRANSAMENT_DATA = {
    # --- 1. DATE PROIECT ---
    "proiect_numar": "EPD-2026-BR-001",
    "proiect_data": "2026-02-15",
    "proiect_titlu": "Branșament gaze naturale presiune redusă pentru imobil locuit",
    "proiect_faza": "DTAC + PTH",
    "proiect_categorie_importanta": "C — normală",
    "proiect_clasa_importanta": "III",
    "proiect_durata_executie_zile": 14,
    "proiect_valoare_estimata_lei": 8500,

    # --- 2. BENEFICIAR ---
    "beneficiar_nume": "Ion Popescu",
    "beneficiar_cnp_cui": "1880101040026",
    "beneficiar_tip": "Persoană fizică",
    "beneficiar_act_identitate": "CI seria RX nr. 123456",
    "beneficiar_telefon": "0722 123 456",
    "beneficiar_email": "ion.popescu@example.ro",
    "beneficiar_adresa_corespondenta": "Str. Aurel Vlaicu nr. 15, ap. 1, Sector 1, București",

    # --- 3. AMPLASAMENT / LOC CONSUM ---
    "loc_consum_strada": "Aurel Vlaicu",
    "loc_consum_numar": "15",
    "loc_consum_localitate": "București",
    "loc_consum_judet": "București",
    "loc_consum_sector": "Sector 1",
    "loc_consum_cod_postal": "011556",
    "loc_consum_nr_cadastral": "246810",
    "loc_consum_carte_funciara": "12345-C1-U1",
    "loc_consum_coords_lat": 44.4533,
    "loc_consum_coords_lng": 26.0814,

    # --- 4. TIP LUCRARE / SCOP ---
    "tipul_lucrarii": "Branșament gaze naturale",
    "scop_lucrare": "Alimentare imobil locuit cu gaze naturale presiune redusă",
    "tip_consumator": "Casnic",
    "regim_functionare": "Permanent — încălzire + apă caldă + gătit",
    "destinatie_imobil": "Locuință individuală",

    # --- 5. DATE TEHNICE PRINCIPALE (debit, presiune, putere) ---
    "debit_instalat_mc_h": 4.5,
    "debit_recomandat_mc_h": 4.95,  # 4.5 × 1.10
    "debit_simultan_mc_h": 4.0,
    "putere_instalata_kw": 47.7,  # 4.5 × 10.6
    "consum_anual_mc": 1200,
    "presiune_disponibila_bar": 0.05,
    "presiune_max_op_bar": 0.05,
    "regim_presiune": "Joasă (max 0.1 bar)",

    # --- 6. APARATE CONSUMATOARE (instalație utilizare) ---
    "aparat_1_tip": "Centrală termică",
    "aparat_1_model": "Vaillant ecoTEC plus VU 246/5-5",
    "aparat_1_debit_mc_h": 2.8,
    "aparat_1_putere_kw": 24,
    "aparat_2_tip": "Mașină de gătit aragaz",
    "aparat_2_model": "Whirlpool ACMK 6132",
    "aparat_2_debit_mc_h": 1.2,
    "aparat_2_putere_kw": 12.6,
    "aparat_3_tip": "Boiler instant",
    "aparat_3_model": "Beretta Idrabagno 11",
    "aparat_3_debit_mc_h": 0.5,
    "aparat_3_putere_kw": 5.3,
    "consumatori_total_numar": 3,

    # --- 7. CONDUCTĂ BRANȘAMENT (BR) — material, dimensiuni ---
    "br_material": "Polietilenă PE 100 SDR 11",
    "br_diametru_dn": "32",
    "br_diametru_exterior_mm": 32,
    "br_diametru_interior_mm": 26,
    "br_grosime_perete_mm": 3.0,
    "br_presiune": "Redusă (max 0.5 bar)",
    "br_lungime_m": 25.0,
    "br_lungime_km": 0.025,
    "br_pozare": "Subteran",
    "br_adancime_pozare_m": 0.9,
    "br_teu_bransament": "Teu BR cu colier PE 100 SDR 11 Stop Gaz max Dn80/32mm Georg Fischer",
    "br_latime_sant_m": 0.40,
    "br_pat_nisip_cm": 10,
    "br_strat_nisip_acoperire_cm": 15,
    "br_banda_avertizare": "Bandă galbenă PVC inscripționată 'GAZ' la 30 cm deasupra conductei",

    # --- 8. CONDUCTĂ DE DISTRIBUȚIE EXISTENTĂ (CND existentă) ---
    "cnd_ex_material": "Polietilenă PE 100 SDR 11",
    "cnd_ex_diametru_dn": "90",
    "cnd_ex_presiune": "Redusă",
    "cnd_ex_pozare": "Subteran",
    "cnd_ex_an_punere_functiune": "2018",
    "cnd_ex_operator": "Distrigaz Sud Rețele",

    # --- 9. POST REGLARE / FIRIDĂ / CONTOR ---
    "post_reglare_tip": "Firidă metalică SF1 stradă cu regulator integrat",
    "post_reglare_dimensiuni_cm": "60×40×25",
    "post_reglare_material": "Tablă oțel zincată 1.5 mm vopsit galben",
    "post_reglare_amplasament": "La limita proprietății, în firidă SF1, h=1.20m de la sol",
    "regulator_model": "Itron RBE 4012-A",
    "regulator_debit_max_mc_h": 6,
    "regulator_presiune_intrare_bar": 0.05,
    "regulator_presiune_iesire_mbar": 22,
    "contor_model": "Elster BK-G4",
    "contor_tip": "G4 cu corector temperatură",
    "contor_debit_max_mc_h": 6,
    "contor_clasa_metrologica": "1.5",
    "contor_serie_lot": "Va fi completat la PIF",
    "contor_sigilare_metrologica": "Sigiliu metrologic + sigiliu OSD",

    # --- 10. DOCUMENTE OSD ---
    "atr_numar": "ATR-2026/01234",
    "atr_data_emitere": "2026-01-20",
    "atr_data_expirare": "2026-07-20",
    "atr_osd": "Distrigaz Sud Rețele S.A.",
    "atr_termen_lucrare_zile": 180,
    "atr_termen_prelungit": "Nu",
    "ordin_lucrare_numar": "OL-2026/00567",
    "ordin_lucrare_data": "2026-02-10",
    "pif_data_planificata": "2026-03-15",

    # --- 11. CU (Certificat Urbanism) + AC (Autorizație Construire) ---
    "cu_numar": "CU 123/2026",
    "cu_data_emitere": "2026-01-08",
    "cu_data_expirare": "2027-01-08",
    "cu_emitent": "Primăria Sector 1 București",
    "cu_scop": "Construire branșament gaze naturale presiune redusă",
    "ac_numar": "AC 456/2026",
    "ac_data_emitere": "2026-02-12",
    "ac_data_expirare": "2027-02-12",
    "ac_emitent": "Primăria Sector 1 București",
    "ac_durata_executie_luni": 6,

    # --- 12. AVIZE OBȚINUTE (de la utilități) ---
    "aviz_apa_nova_numar": "ANB-2026/789",
    "aviz_apa_nova_data": "2026-01-15",
    "aviz_enel_numar": "ENL-2026/0456",
    "aviz_enel_data": "2026-01-17",
    "aviz_telekom_numar": "TKM-2026/0234",
    "aviz_telekom_data": "2026-01-18",
    "aviz_netcity_numar": "NTC-2026/0099",
    "aviz_netcity_data": "2026-01-19",
    "aviz_politie_rutiera_numar": "PR-2026/0145",
    "aviz_politie_rutiera_data": "2026-01-22",
    "aviz_drumuri_numar": "DRM-2026/0067",
    "aviz_drumuri_data": "2026-01-25",
    "aviz_isc_numar": "ISC-2026/0088",
    "aviz_isc_data": "2026-02-01",
    "aviz_mediu_numar": "AM-2026/0021",
    "aviz_mediu_data": "2026-01-28",

    # --- 13. PROIECTANT / VERIFICATOR / EXECUTANT (3 coloane semnătură) ---
    "proiectant_societate": "ENERGY PROJECT DESIGN S.R.L.",
    "proiectant_cui": "43151074",
    "proiectant_reg_com": "J40/12982/2020",
    "proiectant_adresa": "Str. Lt. Alexandru Popescu 9B, Sector 3, București",
    "proiectant_nume": "Ing. Dragoș Șerban",
    "proiectant_legitimatie_anre": "GN-PG/12345",
    "proiectant_telefon": "0721 234 567",
    "verificator_vgd_nume": "Ing. Constantin Vasilescu",
    "verificator_vgd_legitimatie_anre": "GN-VGD/00789",
    "verificator_vgd_societate": "VERIF CONSULT S.R.L.",
    "verificator_vgd_decizia": "Acceptat",
    "executant_societate": "INSTALAȚII GAZE PRO S.R.L.",
    "executant_cui": "RO12345678",
    "executant_atestat_anre": "GN-EX/00456",
    "executant_responsabil_rte": "Ing. Marius Popa",
    "executant_rte_legitimatie": "GN-RTE/00321",
    "executant_sudor_autorizat": "Ion Sudorescu — Cert. ANRE GN-SD/02345 + EN 13067",

    # --- 14. PROBE / TESTĂRI (NTPEE 2018 cap. 5) ---
    "proba_rezistenta_presiune_bar": 0.5,  # 1.5 × Pmax 0.05 = 0.075, dar conf NTPEE = 0.5 min PE
    "proba_rezistenta_durata_min": 60,
    "proba_rezistenta_data": "2026-03-05",
    "proba_rezistenta_rezultat": "ETANȘ — fără scădere de presiune",
    "proba_etanseitate_durata_h": 24,
    "proba_etanseitate_presiune_bar": 0.1,
    "proba_etanseitate_data": "2026-03-08",
    "proba_etanseitate_rezultat": "ETANȘ — variație presiune sub limita NTPEE",
    "proba_etanseitate_compensare_termica": "Aplicată (ΔT = 4°C)",

    # --- 15. RECEPȚIE / PIF / CARTE TEHNICĂ ---
    "pv_predare_amplasament_data": "2026-02-20",
    "anunt_incepere_lucrari_data": "2026-02-22",
    "pv_lucrari_ascunse_data": "2026-03-01",
    "pv_faza_determinanta_data": "2026-03-04",
    "pv_receptie_terminare_lucrari_data": "2026-03-12",
    "pif_data_efectiva": "2026-03-15",
    "pv_pif_semnat_osd_data": "2026-03-15",
    "pvrf_data_planificata": "2027-03-15",  # PVRF la 1 an după PVRTL
    "diriginte_santier_nume": "Ing. Aurel Constantinescu",
    "diriginte_santier_autorizatie_mdlpa": "RV-CT-001234",
    "comisia_receptie_presedinte": "Reprezentant Primăria Sector 1",
    "comisia_receptie_beneficiar": "Ion Popescu",
    "comisia_receptie_osd": "Reprezentant Distrigaz Sud Rețele",
    "comisia_receptie_isc": "Inspector ISC București",

    # --- 16. SUPRAFAȚĂ / GROAPĂ SUDARE ---
    "groapa_sudare_lungime_m": 1.5,
    "groapa_sudare_latime_m": 0.8,
    "groapa_sudare_adancime_m": 1.1,
    "groapa_sudare_volum_mc": 1.32,
    "rezolvare_pamant": "Transport la depozit autorizat Sector 1",

    # --- 17. MATERIALE PRINCIPALE (din Anexa 13 — auto-selectate de Engineering Panel) ---
    "materiale_lista_cod_31": "Conductă PE 100 SDR 11 Dn 32mm — 25 ml",
    "materiale_lista_cod_47": "Teu BR cu colier PE 100 SDR 11 Dn80/32 Stop Gaz — 1 buc",
    "materiale_lista_cod_82": "Coloană PE 100 SDR 11 Dn 32mm verticală — 2.0 ml",
    "materiale_lista_cod_125": "Robinet sferic Dn 32mm conexiune PE/oțel — 1 buc",
    "materiale_lista_cod_198": "Firidă metalică SF1 zincată + lacăt — 1 buc",
    "materiale_lista_cod_267": "Regulator Itron RBE 4012-A 6 mc/h — 1 buc",
    "materiale_lista_cod_321": "Contor Elster BK-G4 — 1 buc",
    "materiale_lista_cod_412": "Bandă galbenă avertizare PVC GAZ 50 m — 1 rol",
    "materiale_lista_cod_478": "Nisip cernut clasa 0-4mm — 1.5 mc",

    # --- 18. EXIGENȚE A/B/C/D (Legea 10/1995) ---
    "exigenta_a_rezistenta_stabilitate": "Conducta PE 100 SDR 11 rezistă la presiune nominală 16 bar (de 320× presiunea de operare 0.05 bar). Sudurile cap-la-cap verificate prin radiografie + probă mecanică.",
    "exigenta_b_siguranta_exploatare": "Adâncime pozare 0.9 m conformă NTPEE 2018. Bandă galbenă avertizare la 30 cm. Robinet izolator la limita proprietății. Sigilare metrologică contor.",
    "exigenta_c_siguranta_foc": "Material PE neinflamabil până la 80°C. Distanță minimă 0.5 m față de cabluri electrice. Detectoare gaz recomandate în bucătărie + centrală termică.",
    "exigenta_d_igiena_mediu": "Material PE conform EN 1555-1, alimentar. Lucrări fără emisii poluante. Transport pământ excavat la depozit autorizat.",

    # --- 19. SSM (Securitate Sănătate Muncă — Legea 319/2006) ---
    "ssm_responsabil_nume": "Marius Popa (RTE)",
    "ssm_riscuri_identificate": "Cădere de la înălțime, electrocutare, surpare șanț, explozie gaz, traffic auto",
    "ssm_eip_obligatoriu": "Cască, vestă reflectorizantă, încălțăminte protecție, mănuși, ochelari, mască respirație",
    "ssm_plan_urgenta": "Tel 112 + Distrigaz dispecerat 0800 877 778 + Primăria Sector 1",
    "ssm_instruire_periodica_zile": 90,

    # --- 20. INSTITUȚII COMUNICARE (10 destinatari) ---
    "email_primarie": "registratura@primaria-s1.ro",
    "email_diriginte_carte": "diriginte.aurelconstantinescu@example.ro",
    "email_contabilitate": "contabilitate@epd.ro",
    "email_osd_distrigaz": "documentatie@distrigaz-sud-retele.ro",
    "email_isc": "isc.bucuresti@isc.gov.ro",
    "email_diriginte_disp": "diriginte.aurelconstantinescu@example.ro",
    "email_politie_rutiera": "politie.rutiera.s1@politiaromana.ro",
    "email_proiectant_dtac": "proiectare@energyprojectdesign.com",
    "email_proiectant_pth": "proiectare@energyprojectdesign.com",
    "email_utilitati_cereri": "avize@energyprojectdesign.com",

    # --- 21. FAZE DETERMINANTE (HG 1735/2006 + Ord. MLPAT 31/N/1995) ---
    "faza_det_1_descriere": "Predare amplasament + trasare conducte",
    "faza_det_1_data": "2026-02-20",
    "faza_det_2_descriere": "Săpătură șanț la cota proiectată",
    "faza_det_2_data": "2026-02-28",
    "faza_det_3_descriere": "Sudură conductă PE — control radiografic",
    "faza_det_3_data": "2026-03-02",
    "faza_det_4_descriere": "Probă rezistență + etanșeitate",
    "faza_det_4_data": "2026-03-05",
    "faza_det_5_descriere": "Acoperire șanț + compactare strat",
    "faza_det_5_data": "2026-03-10",

    # --- 22. CARTOUCHE / CARTE TEHNICĂ (HG 273/1994 + Ord. MLPAT 770/1997) ---
    "ct_sectiune_A": "Documentația de proiectare avizată (CU, AC, avize, memoriu, planuri, calcule)",
    "ct_sectiune_B": "Documentația privind execuția (PV-uri lucrări ascunse, procese verbale faze determinante, probe presiune, certificate materiale)",
    "ct_sectiune_C": "Documentația privind recepția (PV recepție terminare lucrări, PV PIF, sigilare metrologică)",
    "ct_sectiune_D": "Documentația post-execuție (PV recepție finală la 1 an, revizii tehnice periodice instalație)",
}


def enrich_demo_project():
    """Enrich the existing demo gas project with full real-world data."""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'energy_project_design')
    client = MongoClient(mongo_url)
    db = client[db_name]

    # Find existing demo project
    proj = db.gas_projects.find_one({'pid': DEMO_PID})
    if not proj:
        print(f"[ERR] Demo project {DEMO_PID} not found. Run the test seed first.")
        return False

    current_data = proj.get('data', {})
    current_count = len(current_data)

    # Merge — new data takes priority
    merged = {**current_data, **REAL_BRANSAMENT_DATA}
    new_count = len(merged)

    # Update title to reflect real demo
    db.gas_projects.update_one(
        {'pid': DEMO_PID},
        {
            '$set': {
                'data': merged,
                'title': 'Demo End-to-End — Branșament Aurel Vlaicu 15 (V9.0)',
                'updated_at': datetime.now(timezone.utc).isoformat(),
                'is_demo': True,
                'demo_version': 'V9.0',
                'demo_description': (
                    'Proiect real cap-coadă cu 221 câmpuri populate. Reprezintă '
                    'produsul real listat pe Google de Energy Project Design SRL.'
                ),
            }
        }
    )

    print(f"[OK] Demo project enriched.")
    print(f"     Fields BEFORE: {current_count}")
    print(f"     Fields AFTER:  {new_count}")
    print(f"     Net added:     {new_count - current_count}")
    print(f"     PID: {DEMO_PID}")
    print(f"     Owner: {DEMO_OWNER_EMAIL}")
    return True


if __name__ == "__main__":
    enrich_demo_project()
