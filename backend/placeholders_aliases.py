"""V11.6 — Aliasuri placeholdere conform docx-ului utilizatorului.

Mapează cheile LUNGI dorite de utilizator (din "Camuri de introdus in pagina
gaze naturale.docx") la cheile INTERNE existente în placeholders_registry.

În template-uri DOCX, utilizatorul poate folosi ORICARE dintre cele 2 versiuni:
  {{operator_sistem_distributie}}   sau   {{osd_nume}}
ambele rezolvă la aceeași valoare.

Sursa: fișierul atașat de utilizator în chat 25/02/2026.
"""

# Alias lung → cheie internă existentă în registry
ALIAS_MAP = {
    # ===== GENERAL =====
    "tip_lucrare": "tip_lucrare",  # deja exact
    "nume_beneficiar": "beneficiar_nume",
    "amplasament_lucrari": "amplasament_lucrari",  # exact
    "amplasament_imobil": "amplasament_imobil",
    "numar_ordin_lucru": "ordin_lucru_nr",
    "data_ordin_lucru": "ordin_lucru_data",
    "debit_aprobat_lucrare": "debit_aprobat_nmc",
    "numar_cadastral_imobil": "nr_cadastral_imobil",
    "numar_cadastral_traseu": "nr_cadastral_traseu",
    "perioada_incepere_lucrari": "perioada_incepere_lucrari",
    "durata_executie_lucrari": "durata_executie_lucrari",
    "valoare_lucrari": "valoare_lucrari",
    "numar_proiect": "nr_proiect",

    # ===== OSD =====
    "operator_sistem_distributie": "osd_nume",
    "denumire_osd": "osd_denumire_public",
    "sediu_social_osd": "osd_sediu_social",

    # ===== VGD =====
    "nume_verificator_vgd": "vgd_nume",
    "tip_legitimatie_vgd": "vgd_legitimatie_tip",
    "numar_legitimatie_vgd": "vgd_legitimatie_nr",
    "data_expirare_legitimatie_vgd": "vgd_legitimatie_exp",

    # ===== RTE =====
    "nume_verificator_rte": "rte_nume",
    "tip_legitimatie_rte": "rte_legitimatie_tip",
    "numar_legitimatie_rte": "rte_legitimatie_nr",
    "data_expirare_legitimatie_rte": "rte_legitimatie_exp",

    # ===== PROIECTANT =====
    "nume_societate_proiectanta": "proiectant_societate",
    "nume_inginer_proiectant": "proiectant_inginer_nume",
    "legitimatie_inginer_proiectant": "proiectant_inginer_legit_tip",
    "numar_legitimatie_inginer_proiectant": "proiectant_inginer_legit_nr",
    "data_expirare_legitimatie_inginer_proiectant": "proiectant_inginer_legit_exp",
    "sediu_social_societate_proiectanta": "proiectant_sediu",
    "cui_societate_proiectanta": "proiectant_cui",
    "telefon_societate_proiectanta": "proiectant_telefon",
    "fax_societate_proiectanta": "proiectant_fax",
    "email_societate_proiectanta": "proiectant_email",
    "nume_imputernicit_reprezentant_legal_proiectanta": "proiectant_reprez_nume",
    "telefon_imputernicit_reprezentant_legal_proiectanta": "proiectant_reprez_telefon",
    "cnp_imputernicit_reprezentant_legal_proiectanta": "proiectant_reprez_cnp",
    "nume_administrator_societate_proiectanta": "proiectant_admin_nume",
    "cnp_administrator_societate_proiectanta": "proiectant_admin_cnp",

    # ===== EXECUTANT =====
    "nume_societate_executanta": "executant_societate",
    "nume_inginer_executant": "executant_inginer_nume",
    "legitimatie_inginer_executant": "executant_inginer_legit_tip",
    "numar_legitimatie_inginer_executant": "executant_inginer_legit_nr",
    "data_expirare_legitimatie_inginer_executant": "executant_inginer_legit_exp",
    "cui_societate_executanta": "executant_cui",
    "telefon_societate_executanta": "executant_telefon",
    "fax_societate_executanta": "executant_fax",
    "email_societate_executanta": "executant_email",
    "nume_imputernicit_reprezentant_legal_executanta": "executant_reprez_nume",
    "telefon_imputernicit_reprezentant_legal_executanta": "executant_reprez_telefon",
    "cnp_imputernicit_reprezentant_legal_executanta": "executant_reprez_cnp",

    # ===== BENEFICIAR =====
    "cnp_cui_beneficiar": "beneficiar_cnp_cui",
    "telefon_beneficiar": "beneficiar_telefon",
    "email_beneficiar": "beneficiar_email",

    # ===== AVIZE =====
    "nr_serie_data_aviz_atr": "atr_nr",
    "data_aviz_atr": "atr_data",
    "termen_expirare_aviz_atr": "atr_termen",
    "nr_serie_data_certificat_urbanism": "cu_nr",
    "termen_expirare_certificat_urbanism": "cu_termen",

    # ===== BRANSAMENT (construcție) =====
    "pat_caramizi": "br_pat_caramizi_mp",
    "latime_sant_bransament": "br_latime_sant_m",
    "latime_sant_conducta": "cnd_latime_sant_m",
    "material_bransament_proiectat": "br_material",
    "diametru_bransament_proiectat": "br_diametru_dn",
    "material_conducta_proiectata": "cnd_material_proiectat",
    "diametru_conducta_proiectata": "cnd_dn_proiectat",
    "tub_protectie_bransament": "br_tub_protectie",
    "lungime_tub_protectie": "br_tub_lungime_m",
    "diametru_tub_protectie": "br_tub_diametru_mm",

    # ===== BRANSAMENT (detalii) =====
    "numar_bransamente": "cnd_n_bransamente",
    "pozitie_bransament": "br_pozitie_distanta",
    "pozitie_bransament_directie": "br_pozitie_limita",
    "racordare_bransament": "br_racordare_la",
    "amplasament_conducta_racordare": "br_conducta_existenta_amplasament",
    "tip_bransament": "br_tip",
    "tip_conducta_existenta": "cnd_supraterana_subterana",
    "metoda_executie": "br_executie",
    "dimensiuni_gropi_foraj": "br_dimensiuni_gropi_sudare",
    "tip_firida": "br_firida_tip",
    "model_firida": "br_firida_model",
    "tip_contor": "br_contor_tip",
    "tip_regulator": "br_regulator_dn",
    "diametru_robinet_bransament": "br_robinet_dn",
    "diametru_regulator": "br_regulator_dn",
    "debit_regulator": "br_regulator_debit_max",
    "tip_contor_debit_max": "br_contor_qmax",
    "regim_juridic_executie_lucrari": "regim_juridic",
    "regim_juridic_executie_lucrari_public_m": "regim_public_m",
    "regim_juridic_executie_lucrari_privat_m": "regim_privat_m",
    "presiune_retea_p1": "br_p1_bar",
    "presiune_retea_p2": "br_p2_bar",
    "lungime_calculata_bransament": "br_l_km",
    "presiune_bransament": "br_presiune",
    "presiune_conducta_existenta": "cnd_presiune_existenta",
    "presiune_conducta_proiectata": "cnd_presiune_proiectata",
    "viteza_curgere_gaz_conducta": "br_viteza_calculata_ms",
    "diametru_bransament_calculat": "br_diametru_calculat",

    # ===== CONSUMATORI =====
    "consumatori_bransament": "br_consumatori_lista",
    "debit_total_consummatori_bransament": "br_consumatori_debit_total_nmc",
    "consumatori_iu": "iu_consumatori_lista",
    "debit_total_consummatori_iu": "iu_consumatori_debit_total_nmc",
    "camere_aparate": "iu_camere_lista",
    "numar_detectoare_gaze_naturale": "iu_detectori_nr",
    "lungime_totala_traseu_lucrare_iu": "iu_lungime_totala_traseu_ml",
    "bilant_traseu_lucrare": "iu_bilant_traseu",
    "fitting_uri_folosite": "iu_fittinguri_lista",
    "robinei_folositi": "iu_robineti_lista",
    "electrovalve_folosite": "iu_electrovalve_lista",

    # ===== CARTE TEHNICA =====
    "nume_diriginte_santier": "carte_diriginte_nume",
    "proces_verbal_verificare_calitate_lucrari": "pv_verificare_calitate_lucrari",
    "nume_sudor_autorizat": "sudor_nume",
    "numar_autorizatie_sudor_autorizat": "sudor_autorizatie_nr",
    "data_expirare_autorizatie_sudor_autorizat": "sudor_autorizatie_exp",
    "tabel_examinare_vizuala_suduri": "examinari_vizuale_lista",
    "numar_suduri": "numar_suduri",
    "tip_sudura": "cnd_tipuri_suduri",
    "raport_lucrari_executate": "raport_lucrari",
    "proces_verbal_receptie_tehnica_bransament": "pv_receptie_tehnica_bransament",
    "certificat_calitate": "certificat_calitate",
    "furnizor_certificate_calitate": "furnizor_certificate_calitate",
    "proces_verbal_receptie_tehnica_statie": "pv_receptie_tehnica_statie",
    "proces_verbal_punere_functionare": "pv_punere_functionare",
    "contract_prestari_servicii_lucrare": "contract_prestari_servicii",
    "proces_verbal_verificare_calitate_materiale": "pv_verificare_calitate_materiale",
    "protocoale_suduri_efectuate": "protocoale_suduri_lista",
    "planuri_lucrare": "planuri_lucrare_files",
    "schema_suduri": "schema_suduri_file",

    # ===== INSTALAȚIE UTILIZARE =====
    "tip_instalatie_iu": "iu_tip_instalatie",
    "lucrare_executata_din": "iu_executata_din",
    "contor_iu": "iu_contor_status",
    "debit_max_instalatie_iu": "iu_debit_max",
    "imobil_tip": "iu_imobil_tip",

    # ===== EXTINDERE =====
    "lungime_totala_extindere": "cnd_lungime_totala_m",
    "numar_bransamente_extindere": "cnd_n_bransamente",
    "tip_traseu_extindere": "cnd_supraterana_subterana",
    "metoda_executie_extindere": "cnd_executie",
    "diametru_conducta_existenta_extindere": "cnd_dn_existent",
    "material_conducta_existenta_extindere": "cnd_material_existent",
    "diametru_conducta_proiectata_extindere": "cnd_dn_proiectat",
    "material_conducta_proiectata_extindere": "cnd_material_proiectat",
    "specificatii_extindere": "cnd_specificatii",
    "ol_comun_bransamente": "cnd_ol_comun",
    "atr_comun_bransamente": "cnd_atr_comun",
    "presiune_conducta_existenta_extindere_presiune": "cnd_presiune_existenta",
    "presiune_conducta_proiectata_extindere_presiune": "cnd_presiune_proiectata",
    "presiune_bransamente_racorduri_proiectate": "br_presiune",
    "tipuri_suduri_extindere": "cnd_tipuri_suduri",
    "numar_contract_racordare": "cnd_contract_racordare_nr",
    "numar_cadastral_imobil_extindere": "nr_cadastral_imobil",
    "metoda_cuplare_extindere": "cnd_metoda_cuplare_piese",
    "tub_protectie_extindere": "cnd_tub_protectie",
    "pat_caramizi_extindere": "cnd_pat_caramizi_mp",
    "latime_sant_extindere": "cnd_latime_sant_m",
    "carte_tehnica_extindere_indisponibila": "cnd_carte_tehnica_disponibila",
    "planuri_schite_extindere": "planuri_extindere_files",

    # ===== DIMENSIONARE =====
    "tip_sistem_dimensionare": "dim_tip_sistem",
    "regim_presiune_dimensionare": "dim_regim_presiune",
    "debit_calculat_dimensionare": "dim_debit_calc_mc_h",
    "presiune_inceput_tronson_dimensionare": "dim_p1_bar",
    "presiune_capat_tronson_dimensionare": "dim_p2_bar",
    "lungime_fizica_tronson_dimensionare": "dim_lf_m",
    "material_conducta_dimensionare": "dim_material",
    "diametru_ales_dimensionare": "dim_diametru_ales",
    "traseu_conducta_dimensionare": "dim_traseu",
    "pierderi_locale_dimensionare": "dim_pierderi_locale",
    "lungime_calcul_calculata_dimensionare": "dim_lc_calc",
    "formula_normativa_utilizata": "dim_formula",
    "diametru_interior_minim_calculat": "dim_di_min_calc",
    "diametru_comercial_ales": "dim_dn_comercial",
    "viteza_gaz_calculata_dimensionare": "dim_viteza_calc",
    "verificare_viteza_maxima": "dim_viteza_check",
    "verificare_presiune_finala": "dim_presiune_finala_check",
    "avertisment_dimensionare": "dim_avertisment",
    "tabele_dimensionare": "dim_tabele_files",

    # ===== AUTORIZARE DIGITALĂ =====
    "stampila_firma_proiectanta": "stampila_proiectanta_file",
    "stampila_firma_executanta": "stampila_executanta_file",
    "semnatura_utilizator_intocmire": "semnatura_intocmire_file",

    # ===== DOCUMENTE =====
    "tipizata_cerere_aviz": "doc_cerere_aviz_file",
    "fisa_tehnica_documentatie": "doc_fisa_tehnica_file",
    "memoriu_tehnic_situational": "doc_memoriu_tehnic_file",
}


def resolve_key(key: str) -> str:
    """Returnează cheia internă pentru un alias (sau cheia însăși dacă există)."""
    return ALIAS_MAP.get(key, key)


def expand_values_with_aliases(values: dict) -> dict:
    """Adaugă valori pentru toate aliasurile pe baza valorilor cu chei interne.

    INPUT: {"osd_nume": "Distrigaz Sud Rețele S.R.L."}
    OUTPUT: {"osd_nume": "Distrigaz Sud Rețele S.R.L.",
             "operator_sistem_distributie": "Distrigaz Sud Rețele S.R.L."}
    """
    if not values:
        return values
    out = dict(values)
    for alias, internal in ALIAS_MAP.items():
        if internal in values and alias not in out:
            out[alias] = values[internal]
    return out
