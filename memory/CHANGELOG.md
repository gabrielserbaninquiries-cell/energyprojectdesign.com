# Energy Project Design — Changelog

## V8.0 — 2026-06-12 (current session, late)

### Backend +3 DOCX templates noi (consumă +28 placeholders necheltuite)
- **`dtac_lista_avize`** (gas_doc_templates_extra.py): tabel cu 11 avize utilități (E-Distribuție, Telekom, Apa Nova, STB, NetCity, Luxten, Străzi PMB, Circulație PMB, Mediu PMB, APM, acord acces) — fiecare cu Nr/Data și status "Obținut/În curs" calculat din date
- **`pv_calitate`** (gas_doc_templates_extra.py): PV Control Calitate cu 4 secțiuni narative (documente bază, lucrări verificate, constatări, concluzii) + 3-col signature table proiectant/executant/diriginte. Consumă pv_calitate_pv_numar, pv_calitate_data, pv_calitate_proiectant, pv_calitate_constructor, pv_calitate_diriginte, pv_calitate_documente_baza, pv_calitate_lucrari, pv_calitate_constatari, pv_calitate_concluzii
- **`program_faze_isc`** (gas_doc_templates_extra.py): Program Control Faze Determinante cu 7 faze (FD-01 până FD-07: predare-primire, trasaj, pat nisip, probă rezistență, probă etanșeitate, PVRTL, PIF) + cadru legal + ISC județean. Consumă program_faze_isc_judet, program_faze_baza_legala, program_control_model

### Stripe webhook hardened
- **Idempotency check** în `/api/webhook/stripe`: înainte de `$set payment_status=paid` se citește starea existentă; dacă deja era "paid", planul NU se re-activează (previne dublarea)
- **Audit log** nou: colecție `db.plan_activation_log` cu intrări per activare (user, plan, session, source=webhook|status_poll, amount, currency, activated_at, renew_at)
- **`/api/me/billing` endpoint nou**: returnează current_plan (id, name, price_eur, renews_at) + transactions (max 10) + activations (max 10) pentru user-facing dashboard

### Tests
- `/app/backend/tests/test_v80_extra_templates.py`: 11/11 PASSED în 4s
- Dossier ZIP creștem: 23 → **27 DOCX + manifest** (~932KB)
- Toate noile placeholders verificate prezente în DOCX-uri generate

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
