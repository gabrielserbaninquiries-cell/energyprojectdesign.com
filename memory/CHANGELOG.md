# Energy Project Design — Changelog

## V8.1 — 2026-06-12 (current session, final)

### 🎯 100% Placeholder Coverage atins
- **179/179 placeholders** din `FIELDS_REGISTRY` consumate de template-uri DOCX
- Backend regression 35/35 PASSED în 7s (`test_v81_cartouche_and_full_coverage.py`)

### Caiet Sarcini — Detalii tehnologice de pozare
- **+ Secțiunea 4.1 "Detalii tehnologice specifice"** consumă 7 placeholders: tip_sudura, unghi_cuplare_min_grade, fir_trasor_material, fir_trasor_sectiune_mm2, tub_protectie, pat_caramizi, pozare_distanta_limita
- **+ Secțiunea 4.2 "Repartiție traseu"** consumă lungime_pe_drum_m, lungime_raiser_m, traseu_pe_drum
- **+ Secțiunea 4.3 "Conductă existentă"** consumă conducta_existenta_strada, conducta_existenta_caracteristici

### Cartouche proiect (helper nou `_project_cartouche`)
- **Bloc CARTOUCHE PROIECT** plasat după antet în 4 template-uri principale (memoriu_tehnic, caiet_sarcini, carte_tehnica, borderou)
- Consumă 12 placeholders identificative: denumire_lucrare_extinsa, tipul_lucrarii, faza_proiectare, proiect_nr_an, amplasament_lucrare, amplasament_imobil_consum, presiune_categorie, sf_diametru_nominal_DN, ordin_lucru_nr_data, isc_nr_inreg, dispozitie_necesara, materiale_catalog_codes

### Footer signature extins 2→3 coloane
- **Coloana 1 Proiectant**: firma + nume + Autorizație ANRE (proiectant_aut_nr + proiectant_aut_grad)
- **Coloana 2 Executant**: firma + Autorizație ANRE (executant_aut_nr + executant_aut_grad) + RTE
- **Coloana 3 Verificator (VGD)**: nume + Legitimație (verificator_legitimatie_nr)
- Aplicat retroactiv în TOATE 26 template-uri — regression 0 break (35/35 tests PASSED)

### PV Calitate extins
- Fallback `pv_calitate_nr` → `pv_calitate_pv_numar` (suport alias)
- **+ Secțiunea 5 "Verdict probă presiune"** (pv_calitate_proba_admisa)
- **+ Secțiunea 6 "Mențiuni speciale"** (pv_calitate_mentiuni)

## V8.0 — 2026-06-12

### Backend +3 DOCX templates noi (consumă +28 placeholders)
- `dtac_lista_avize`: tabel 11 avize utilități + acord acces, status Obținut/În curs auto-calculat
- `pv_calitate`: PV Control Calitate cu 4 secțiuni narative + 3-col signature table
- `program_faze_isc`: 7 faze determinante FD-01..FD-07

### Stripe webhook hardened
- Idempotency check (`already_paid` flag) în `/api/webhook/stripe`
- Audit log nou: colecție `db.plan_activation_log`
- Endpoint `/api/me/billing` returnează plan activ + transactions + activations

## V7.5 — 2026-06-12 (earlier session)
- Tab "REGISTRU CÂMPURI (179)" în Gaze Naturale + auto-mapping V2→Registry
- 6 ștampile cu mapping backend corect
- Extindere DOCX: Memoriu (+5 secțiuni), Carte Tehnică (+ct_sectiune_*), Borderou (+materiale&furnizori)
- Stripe checkout funcțional (`UpgradeGate`)
- Landing public restaurat (12 servicii + 5 ecosisteme)

## V7.4 — 2026-06-12
- HomePage compact + 12 quick-access pills + 5 ecosystem cards

## V7.5 — 2026-06-12 (earlier session)

### Gaze Naturale — produs complet livrabil
- Tab nou "REGISTRU CÂMPURI (179)" — 179 placeholders din `FIELDS_REGISTRY` grupați în 6 categorii × 26 secțiuni cu coverage live
- Auto-mapping V2→Registry la save (`applyAutoMap`)
- 6 ștampile cu mapping backend corect
- Extindere DOCX: Memoriu Tehnic +5 secțiuni, Carte Tehnică +ct_sectiune_A/B/C/D, Borderou +materiale&furnizori +11 avize
- Stripe checkout funcțional (UpgradeGate → /api/payments/checkout)
- Landing public restaurat (12 servicii + 5 ecosisteme)

## V7.4 — 2026-06-12

### HomePage V7.4 restructurare
- Hero compact + 12 quick-access pills + 5 ecosystem cards + AI card + stats + activity feed

## V7.3 și anterior
Vezi `/app/memory/PRD.md` pentru detalii.
