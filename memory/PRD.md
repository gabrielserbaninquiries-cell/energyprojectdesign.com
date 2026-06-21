# Energy Project Design — PRD (V10.3, 2026-06-21)

## Original problem statement
Consolidate 5 repos into a single platform that generates legal Romanian construction
documentation (gas + electric + apa-canal + fotovoltaice + telecom), supports OCR ingest,
multi-industry cloning, plan-based access (Free / Basic / Pro / Society), Stripe monetization,
and an adaptive UI that surfaces top services on the home page.

Owner: Dragoș Șerban (dragosserban95@gmail.com)
Company: Energy Project Design S.R.L. (CUI 43151074, J40/12982/2020)
Mission: "Reducem o firmă de proiectare-execuție de 20 angajați la 1-2 oameni"
Long-term: "#1 mondial pentru documentație tehnică digitală + 22 servicii globale"


## Status V10.3 — STUDIO GAZE REDESIGN + END-TO-END FUNCTIONAL (2026-06-21)
- ✅ Studio Gaze rescris vizual în paletă strict violet/indigo/blue (zero verde/amber/negru)
- ✅ 3 coloane Consumatori (mențin/dezafectează/noi) cu color-coding + total Qmin live
- ✅ 5 panouri sidebar premium uniforme cu gradient ribbons + epd-shadow
- ✅ Transfer proiect între utilizatori (POST /transfer + audit_log + shared_access + email notificare)
- ✅ Send-to-avizare PATCH status='awaiting_avizare' (status whitelist extins)
- ✅ Upload-avizat PATCH status='avizat' (real upload + PATCH chained)
- ✅ Email dispatch wired la /phase/{id}/dispatch (NU mai e toast.success() fals)
- ✅ Logo sidebar → `/` (Landing publică) + HomeRedirect simplificat
- ✅ Audit log endpoint GET /audit-log pentru trasabilitate cross-department
- 🟡 Plan restrictions detailate per rol (proiectant/executant/VGD/RTE/operator) — partial implementat prin opțiunile de transfer role; UI gating per capability rămas pentru P1
- 🔵 Configurare SMTP Gmail backend (GMAIL_USER + GMAIL_APP_PASSWORD în .env) — pendant input user


## Status V9.0 — REBRANDING TOTAL + GAZE NATURALE 100% OPERAȚIONAL + DEMO REAL CAP-COADĂ

### Identitate vizuală oficială EPD (V9.0 — implementat)
Sursă: pagina Facebook EPD SRL + logo oficial uploadat de proprietar.
- **Logo**: cub isometric "EP" gradient diagonal violet→indigo→navy→negru
- **Paletă**: `#A78BFA` → `#7C3AED` → `#4F46E5` → `#1E3A8A` → `#0F172A`
- **Tagline**: "Redesigning projects."
- **Sub-tagline**: "The Architects of Future Global Technology"
- **Source of truth**: `/app/frontend/src/lib/brand.js` (BRAND_ASSETS, BRAND_COLORS, BRAND_GRADIENTS, BRAND)

### Service flow on the Gas Natural page (6 stages — visible pipeline)
1. **Date** — 221 fields tipizate în 8 categorii × 32 secțiuni (FIELDS_REGISTRY)
2. **Documente** — 33 DOCX generate automat (auto-mapping V2 → Registry)
3. **Ștampile** — 6 categorii (proiectant, executant, VGD, RTE, primărie, societate) + draggable A4
4. **Semnătură** — hash SHA-256 + cert PKI stub (DigiSign/certSIGN pendant API contracts user)
5. **Plată** — Stripe checkout per-service (5 servicii ad-hoc, NOT subscription)
6. **Livrare** — Dispatch automat către OSD (Distrigaz/E.ON/Premier Energy) + email rute

## Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` — core router with auth + Stripe + admin
- `/app/backend/gas_project_routes.py` — CRUD proiecte + dossier ZIP + per-document download
- `/app/backend/gas_doc_templates.py` — 16 base DOCX templates
- `/app/backend/gas_doc_templates_extra.py` — 9 extras (PV LA, PV FD, PCC, RVT, notificare ISC, ...)
- `/app/backend/gas_doc_templates_legal.py` — 7 legal docs (DC, buletine probe, PVRF, ...)
- `/app/backend/placeholders_registry.py` — 221 fields, 32 sections, 8 categories
- `/app/backend/gas_engineering.py` — Renouard multi-tronson + smart sizing + Anexa 13 (V8.7)
- `/app/backend/gas_smart_defaults.py` — Smart-fill bazat pe valori câmpuri
- `/app/backend/gas_services_routes.py` — Stripe ad-hoc per project (5 services)
- `/app/backend/docx_processor.py` — insert_stamp() cu x_cm/y_cm absolute (wp:anchor + EMU)
- `/app/backend/seed_demo_gas_project.py` — **V9.0 NEW** — enrichment demo 111 → 302 fields

### Frontend (React + Tailwind + shadcn)
- `/app/frontend/src/lib/brand.js` — **V9.0 NEW** — single source of brand identity
- `/app/frontend/src/index.css` — V9.0 — EPD palette + .epd-gradient + .epd-btn
- `/app/frontend/src/pages/Landing.jsx` — **V9.0 rewrite** — Gaze Naturale = produs principal
- `/app/frontend/src/pages/Login.jsx` — **V9.0 rewrite** — brand panel oficial
- `/app/frontend/src/pages/HomePageV7.jsx` — V9.0 — Main Product Spotlight Gaze
- `/app/frontend/src/components/AppShell.jsx` — V9.0 — sidebar logo EP gradient
- `/app/frontend/src/pages/GasNaturalProjectV2.jsx` — main studio cu 4 tabs (DATE/AVIZE/REGISTRU/INGINERIE)
- `/app/frontend/src/components/RegistryFieldsTab.jsx` — 8-cat × 32-sec accordion
- `/app/frontend/src/components/GasServicePipeline.jsx` — 6-stage pipeline + ad-hoc catalog
- `/app/frontend/src/components/StampPlacement.jsx` — A4 draggable component
- `/app/frontend/src/components/GasEngineeringPanel.jsx` — Renouard + sizing + Anexa 13
- `/app/frontend/src/pages/Billing.jsx` — plan + transactions + activations log
- `/app/frontend/src/pages/ComertLogistica.jsx` — **V9.0 NEW** — 8 sub-servicii logistică
- `/app/frontend/src/pages/FabriciUzine.jsx` — **V9.0 NEW** — 8 specialități industriale

## Key counts cumulative
- 33 DOCX templates (Gaze Naturale)
- 221 registry fields → 8 categories → 32 sections
- 5 ad-hoc Stripe services (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€)
- 6-stage pipeline (Date / Docs / Ștampile / Semnătură / Plată / Livrare)
- 17 departments × 10 plans matrix
- 14 servicii active listate pe Landing + 22 servicii viitoare în roadmap
- **302 fields** populate în demo project cap-coadă (V9.0 enrichment)

## Romanian legal compliance
- HG 273/1994, Legea 10/1995, Legea 50/1991, Legea 319/2006
- HG 1425/2006, HG 300/2006, HG 766/1997, HG 525/1996, HG 1735/2006
- Ord. MLPAT 770/1997, 31/N/1995, 777/2003
- Ord. ANRE 89/2018 (NTPEE 2018), 16/2015, 79/2014, 162/2021, 75/2020
- EN 1555 / EN 88-1 / EN 13067 / ISO 9606-1

## Testing cumulative
- V7.4 iter 5: 7/7 backend + frontend 100%
- V8.0 iter 6: 11/11 backend
- V8.1 iter 7: 35/35 backend (cartouche + full coverage)
- V8.3 iter 9: 17/17 backend + frontend pipeline/catalog
- V8.5 iter 10: 18/18 backend + frontend 95%
- V8.7 iter 12: backend 96+ tests cumulate PASSED
- **V9.0 iter 13: frontend 50/50 PASS (rebranding + Gaze main product + new pages + demo)**
- **Total cumulative: 146+/146+ PASSED**

## Demo project (real cap-coadă)
- PID: `gp_e79e2810cc64b5b4` (owned by dragosserban95@gmail.com)
- Title: "Demo End-to-End — Branșament Aurel Vlaicu 15 (V9.0)"
- 302 fields populate (de la 111 înainte de enrichment V9.0)
- Reprezintă produsul REAL listabil pe Google
- Acces: `/gaze-naturale/gp_e79e2810cc64b5b4`

## Pending (Backlog) — NON-BLOCKING
- (P2) Splitting `gas_doc_templates.py` 1200+ linii în `gas_doc_builders/`
- (P2) Splitting `placeholders_registry.py` 887 linii per categorie
- (P2) Stepper cronologic vizual ÎN PLUS în Studio Gaze (10 etape vertical)
- (P3) QES real (DigiSign/certSIGN API contracts) — pendant USER să obțină cheile (a confirmat că vrea să autorizeze)
- (P3) Webhook Stripe pentru ad-hoc services (cazul tab închis după plată)
- (P3) Extindere alte industrii (Electric, Apă-Canal, Fotovoltaice) cu pattern Gaze
- (P3) Cleanup `db.gas_service_purchases` pending rows mai vechi de N ore
- (P3) StampPlacement: re-load la schimbare `stampId` fără unmount
- (P3) Cosmetic: silence 401 toast pe pagini anonime (api.js)
- (P3) Refactor: ComertLogistica + FabriciUzine în component shared `<SectorPage>`

## Roadmap viitor (22 servicii globale)
Lanț hoteluri, EPD Supermarket, Mâncare worldwide, Locuri muncă globale, Vânzări auto,
Vânzări imobile, Piese auto, Mecanici/service, Motor plăți online, EPD Shop, TV online,
Radio online, Distribuție copaci, Distribuitor marfuri, Constructori-Finanțatori,
Benzinării+EV, Spălătorii auto, Restaurante, Racordări energetice, Fonduri europene,
Fonduri de stat, EPD Mail.

## Production readiness
✅ Site-ul este gata pentru listare Google și schimbare domeniu pe `energyprojectdesign.com`.
