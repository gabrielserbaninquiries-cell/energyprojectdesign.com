# Energy Project Design — Changelog

## V7.5 — 2026-06-12 (current session)

### Gaze Naturale — produs complet livrabil
- **+ Tab nou "REGISTRU CÂMPURI (179)"** în `GasNaturalProjectV2.jsx` (al 3-lea tab după DATE/AVIZE)
- **+ Componentă nouă** `RegistryFieldsTab.jsx` — toate 179 placeholders din `FIELDS_REGISTRY` grupate în 6 categorii × 26 secțiuni, accordion expandabil, coverage live per categorie + per template (overall + 6 cat bars + 27 template ready/not-ready)
- **+ Auto-mapping V2→Registry** la fiecare save (`applyAutoMap`): câmpurile verzi V2 (`nume_client`, `adresa_imobil`, `osd_atr_nr`...) populează automat keys-urile canonice ale registrului (`beneficiar_nume`, `loc_consum_adresa`, `atr_numar`...) folosite efectiv în template-uri
- **+ 6 ștampile cu mapping corect** la backend (stamp_proiectant / stamp_executant / stamp_vgd / stamp_rte / stamp_primarie / stamp_societate)

### Extindere template-uri DOCX (consumă +30 fields necheltuite)
- **Memoriu Tehnic**: +4 secțiuni noi (4.1 Condiții naturale, 4.2 Date seismice, 4.3 Categoria de importanță HG766, 4.4 Centrala) + secțiunea 6 Exigențele esențiale Legea 10/1995 (A/B/C/D)
- **Carte Tehnică**: + bloc "Date identificatoare" (beneficiar + loc consum + cadastru + categorie importanță + proiect_nr_an + exemplare) + conținut narativ ct_sectiune_A/B/C/D + comisia recepție extinsă (președinte / OSD / ISC / beneficiar)
- **Borderou**: + secțiunea C "Materiale și furnizori" (Wavin / Pietro Fiorentini / Itron + standarde EN 1555 / EN 1555-4 / EN 88-1 / EN 1359) + secțiunea D "Avize utilități obținute" (11 avize)

### Stripe checkout (P1 done)
- Reparat `UpgradeGate.jsx` să folosească `/api/payments/checkout` cu `origin_url` (înainte: `/billing/checkout` cu `return_url`, endpoint inexistent)
- Reparat bug latent în `/api/upgrade-info` (iterare peste cheile dict-ului `PLANS` în loc de valori)
- Verificat: returnează URL real `https://checkout.stripe.com/c/pay/cs_test_*`

### Landing page public restaurat
- **Rewrite `Landing.jsx`** secțiunea principală: + 12 servicii (`landing-service-*`) cu tag-uri CORE/NEW/BIZ/INFO + 5 ecosisteme (`landing-eco-*`) pe fundal negru
- Vizitatorii văd acum descrierea completă a paginilor principale

### Bug fixes
- `STAMPS_UPLOAD` category mapping: `stamp_proiectanta` → `stamp_proiectant`, etc. (alignment cu backend `asset_storage.py`)
- Adăugat 2 ștampile (RTE, Societate) lipsă din lista anterioară

### Testing
- Backend regression: 7/7 PASSED (testing_agent_v3_fork iteration 5)
- Curl verificare directă: 23 DOCX + manifest, ~820KB ZIP, conținut real în memoriu_tehnic + carte_tehnica + borderou

## V7.4 — 2026-06-12

### HomePage V7.4 restructurare
- Hero compact 4 col + 12 quick-access pills (qa-*) vizibile imediat
- 5 ecosystem cards (eco-*) + 6th AI card
- Stats strip (23 DOCX, 6 ecosisteme, 17 dep × 10 planuri)
- Activity feed live
- Footer trust badges

## V7.3 și anterior
Vezi `/app/memory/PRD.md` pentru detalii.
