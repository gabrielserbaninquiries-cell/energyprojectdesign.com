# Energy Project Design — Changelog

## V8.4 — 2026-06-12 (current session, very late)

### 🎯 +7 documente legale ROMÂNE obligatorii (33 templates total)
Noi documente generate per `gas_doc_templates_legal.py`:
1. **declaratie_conformitate** — Declarație de Conformitate Executant (Lege 10/1995 art. 25 + EN 1555)
2. **buletin_proba_rezistenta** — Buletin Probă Rezistență Mecanică (NTPEE 2018 cap. 5 art. 80) cu KSP 1.5×Pmax, durată 60 min
3. **buletin_proba_etanseitate** — Buletin Probă Etanșeitate 24h (NTPEE 2018 cap. 5 art. 82) cu compensare termică
4. **pv_receptie_finala** — PVRF la 1-3 ani după PVRTL (HG 273/1994 art. 36) cu comisie 6 membri + verificări periodice
5. **pv_pif_semnat** — PV Punere în Funcțiune semnat OSD (Ord. ANRE 162/2021) cu CLC, contor, sigilare metrologică
6. **fisa_sudor** — Fișa Sudor Autorizat per sudor (ANRE Ord. 79/2014 + EN 13067 + ISO 9606-1)
7. **plan_ssm** — Plan SSM (Securitate Sănătate Muncă, Legea 319/2006 + HG 1425/2006 + HG 300/2006) cu 6 riscuri identificate + matrice EIP + plan urgență

### Registry extins +20 câmpuri critice
- **Categorie nouă "Documente legale obligatorii"** (order 7) cu 2 secțiuni: `doc_legale` (15 fields) + `probe_extinse` (6 fields)
- Total: **200 fields** (de la 179), **28 sections**, **7 categories**

### V8.3 (anterior în această sesiune) — Service Pipeline + Ad-hoc Stripe
- **gas_services_routes.py**: 5 servicii premium per proiect cu Stripe checkout (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€)
- 3 endpoint-uri noi: GET /services, POST /service-checkout, GET /service-status/{sid}
- **GasServicePipeline.jsx**: 6-stage pipeline (Date → Documente → Ștampile → Semnătură → Plată → Livrare) + Service Catalog UI

### V8.2 (sesiune anterioară) — Stamp Absolute + Billing UI
- Backend `insert_stamp` extended cu x_cm/y_cm absolute mode (wp:anchor + EMU)
- StampPlacement.jsx draggable component (A4 simulat 378×535px)
- Billing.jsx pagină nouă consumând /api/me/billing

### V8.1 — 100% placeholder coverage (179/179)
- Caiet Sarcini secțiuni 4.1/4.2/4.3 detalii pozare
- Cartouche proiect helper aplicat în 4 templates
- Footer signature 2→3 coloane

### V8.0 — +3 DOCX + Stripe webhook idempotent
- dtac_lista_avize, pv_calitate, program_faze_isc
- Audit log gas_service_purchases + /me/billing endpoint

### V7.5 — Gaze Naturale tab "REGISTRU CÂMPURI"
### V7.4 — HomePage 12 quick-access + 5 ecosystems

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

## V9.0 — 2026-06-21 (sesiune fork de finalizare)

### REBRANDING TOTAL EPD oficial (cerință user mesaj 23)
- `lib/brand.js` (NOU) — single source: BRAND_ASSETS (5 URLs Facebook), BRAND_COLORS, BRAND_GRADIENTS
- Paletă: violet→indigo→navy→negru (extras din logo cub EP gradient diagonal 135°)
- `index.css` — variabile + .epd-btn + .epd-gradient + .epd-shadow + radius 0.5rem
- Tailwind primary 262 83% 58% (violet-600)

### Pagini rescrise cu brand oficial
- `Landing.jsx` — full rewrite; hero deep-navy cu cover Facebook; **Gaze Naturale featured ca PRODUS PRINCIPAL** ÎNAINTE de restul serviciilor; 14 servicii active grid; banner "Architects of Future Global Technology"; 22 servicii viitoare păstrate
- `Login.jsx` — brand panel cu cover Facebook + form modernizat cu focus violet
- `HomePageV7.jsx` — hero nou + MAIN PRODUCT SPOTLIGHT card Gaze Naturale featured deasupra
- `AppShell.jsx` — sidebar logo EP cub gradient + tagline "Redesigning projects."

### Pagini NOI (cerute mesaj 22+23, NU se elimină nimic)
- `/comert-logistica` — `ComertLogistica.jsx` cu 8 sub-servicii + CTA Gaze
- `/fabrici-uzine` — `FabriciUzine.jsx` cu 8 specialități industriale + 3 proiecte referință
- Rutele adăugate în App.js

### Demo cap-coadă enrichment (cerință "proiect real bransament")
- `seed_demo_gas_project.py` — script de enrichment demo
- PID `gp_e79e2810cc64b5b4`: îmbogățit de la 111 la **302 fields** (+191)
- Date reale extrase din artefactele Facebook: Memoriu Avizare, Foaie Capăt, Referat DTAC, Program Faze, Anexa 13
- 22 categorii populate complet (proiect, beneficiar, amplasament, tehnice, consumatori, conductă BR/CND, post reglare, OSD, CU/AC, 8 avize, 3 semnături, probe NTPEE, recepție, materiale Anexa 13, exigențe A/B/C/D, SSM, 10 emails, 5 faze determinante, carte tehnică)

### Re-compilare COMMAND_LOG_FULL.md
- Appendix V9.0 adăugat (secțiunea 23) cu citatele literale ale userului
- Document acum 863 linii — completă referință end-to-end

### Testing (iter 13)
- testing_agent_v3_fork: 50/50 PASS frontend (Landing + Login + Acasa + Sidebar + 2 pagini noi + Studio demo + 4 regression pages)
- Zero erori critice, zero blockers
- Site PRODUCTION READY pentru listare Google

## V9.1 — 2026-06-21 (continuare sesiune fork)

### Cerință user (mesaj 24)
> "Stepper cronologic vizual (optional): 10 etape orizontal sus în Studio Gaze...
> introdu cheia stripe in site pentru validare plati pk_live_51Thc7C...
> da-mi preturile pachetelor sa le listez in stripe, pentru a putea fi cumparate,
> si elimina adaugarea de pachete ad hoc."

### IMPLEMENTAT V9.1
1. **GasChronologicalStepper.jsx (NOU)** — componenta cu 10 etape:
   `Date proiect → Date tehnice → Avize → DTAC → AC/Acord drum → PTH → Avize finale → Dispoziție șantier → Carte tehnică → Recepție`
   - Calculează automat % completion per etapă bazat pe fields din FIELDS_REGISTRY
   - Status: pending / started / progress / done (cu styling diferit)
   - Bar progres global jos + "Următoarea etapă"
   - Demo project gp_e79e2810cc64b5b4 (302 fields) afișează 10/10 finalizate (100%)

2. **Eliminat ad-hoc services UI** — GasServicePipeline înlocuit cu noul stepper:
   - 5 pachete (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€) NU mai sunt vizibile
   - Codul backend `gas_services_routes.py` rămâne (compatibilitate istorică, dar dezactivat UI)
   - Fișier `GasServicePipeline.jsx` ȘTERS din `/app/frontend/src/components/`

3. **Stripe publishable key adăugat** — `/app/frontend/.env`:
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51Thc7C...`
   - BACKEND URL păstrat intact

4. **STRIPE_PRICING_SETUP.md** — document NOU în `/app/memory/`:
   - 11 planuri listate (1 trial + 10 plătite, de la 49€ la 349€/lună)
   - Procedură pas-cu-pas pentru creare produse în Stripe Dashboard
   - Tabel mapping ID intern → Stripe price ID
   - Warning despre secret key (sk_live_*) pendant la user

5. **Polish minor** — chip "Stripe ad-hoc" pe HomePage înlocuit cu "Stripe planuri lunare"

### Testing iter 14: 9/9 PASS frontend
- Stepper vizibil cu toate 10 etape + data-testid corecte
- 100% completion afișat pentru demo project
- Zero ad-hoc packages vizibile
- Stripe key în .env fără să afecteze BACKEND_URL
- Regression rebranding V9.0 intact
