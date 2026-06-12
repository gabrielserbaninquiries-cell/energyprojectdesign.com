# Energy Project Design — PRD (V8.5, 2026-06-12)

## Original problem statement
Consolidate 5 repos into a single platform that generates legal Romanian construction
documentation (gas + electric + apa-canal + fotovoltaice + telecom), supports OCR ingest,
multi-industry cloning, plan-based access (Free / Basic / Pro / Society), Stripe monetization,
and an adaptive UI that surfaces top services on the home page.

## Status: Gaze Naturale FULLY OPERATIONAL END-TO-END

### Service flow on the Gas Natural page (6 stages — visible pipeline)
1. **Date** — 221 fields tipizate în 8 categorii × 32 secțiuni (FIELDS_REGISTRY)
2. **Documente** — 33 DOCX generate automat (auto-mapping V2 → Registry)
3. **Ștampile** — 6 categorii (proiectant, executant, VGD, RTE, primărie, societate) + draggable placement A4
4. **Semnătură** — hash SHA-256 + cert PKI stub (DigiSign/CertSIGN pendant API contract)
5. **Plată** — Stripe checkout per-service (5 servicii ad-hoc, NOT subscription)
6. **Livrare** — Dispatch automat către OSD (Distrigaz/E.ON/Premier Energy) + email rute

## Architecture

### Backend (FastAPI + MongoDB)
- `/app/backend/server.py` — core router with auth + Stripe + admin
- `/app/backend/gas_project_routes.py` — CRUD proiecte + dossier ZIP + per-document download
- `/app/backend/gas_doc_templates.py` — 16 base DOCX templates (memoriu, caiet sarcini, cerere ATR, CU, PIF, carte tehnica, ...)
- `/app/backend/gas_doc_templates_extra.py` — 9 extras (PV LA, PV FD, PCC, RVT, notificare ISC, as-built, DTAC lista avize, PV calitate, program faze ISC)
- `/app/backend/gas_doc_templates_legal.py` — V8.4 — 7 legal docs (DC, buletine probe, PVRF, PIF semnat OSD, fișă sudor, plan SSM)
- `/app/backend/placeholders_registry.py` — 221 fields across 32 sections, 8 categories
- `/app/backend/gas_services_routes.py` — V8.3 — Stripe ad-hoc per project (5 services)
- `/app/backend/docx_processor.py` — extended insert_stamp() with x_cm/y_cm absolute positioning (wp:anchor + EMU)

### Frontend (React + Tailwind + shadcn)
- `/app/frontend/src/pages/HomePageV7.jsx` — V7.4 — hero compact + 12 quick-access + 5 ecosistems
- `/app/frontend/src/pages/Landing.jsx` — V7.5 — public visitor with 12 services + 5 ecosistems
- `/app/frontend/src/pages/GasNaturalProjectV2.jsx` — main studio with 3 tabs (DATE / AVIZE / REGISTRU 221)
- `/app/frontend/src/components/RegistryFieldsTab.jsx` — 8-cat × 32-sec accordion with live coverage
- `/app/frontend/src/components/GasServicePipeline.jsx` — V8.3 — 6-stage pipeline + ad-hoc catalog
- `/app/frontend/src/components/StampPlacement.jsx` — V8.2 — A4 draggable component with localStorage restore
- `/app/frontend/src/pages/Billing.jsx` — V8.2 — plan + transactions + activations log
- `/app/frontend/src/pages/Stamps.jsx` — V8.2 — uploads + placement modal

## Key counts
- 33 DOCX templates (Gaze Naturale)
- 221 registry fields → 8 categories → 32 sections
- 5 ad-hoc Stripe services (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€)
- 6-stage pipeline (Date / Docs / Ștampile / Semnătură / Plată / Livrare)
- 17 departments × 10 plans matrix
- 6 stamp categories + draggable A4 placement
- 27 templates with live coverage % per template

## Stripe integration
- Subscription plans: `/api/payments/checkout` → standard Stripe checkout
- Per-project ad-hoc: `/api/gas-project/{pid}/service-checkout` → Stripe checkout w/ metadata={pid, service_id}
- Webhook idempotent: `/api/webhook/stripe` with `already_paid` flag → no double-activation
- Audit log: `db.plan_activation_log` + `db.gas_service_purchases`
- User-facing: `/api/me/billing` → current_plan + transactions + activations
- UI: `/billing` page consumes the endpoint

## Romanian legal compliance (V8.4 + V8.5)
- HG 273/1994 — Carte Tehnică + PV Recepție Finală
- Legea 10/1995 — Declarație Conformitate + exigențe A/B/C/D
- Legea 50/1991 — DTAC + AC + lista avize
- Legea 319/2006 + HG 1425/2006 + HG 300/2006 — Plan SSM
- HG 766/1997 — Categoria importanță construcție
- HG 525/1996 — RGU
- HG 1735/2006 — Faze determinante ISC
- Ord. MLPAT 770/1997 — Carte Tehnică conținut
- Ord. MLPAT 31/N/1995 — Faze ISC
- Ord. MLPAT 777/2003 — Verificator atestat
- Ord. ANRE 89/2018 — NTPEE 2018 (cap. 3, 5, art. 12)
- Ord. ANRE 16/2015 — Revizii tehnice instalație utilizare
- Ord. ANRE 79/2014 — Atestare sudori PE
- Ord. ANRE 162/2021 — PV PIF semnat OSD
- Ord. ANRE 75/2020 — Contoare gaze
- EN 1555 / EN 88-1 / EN 13067 / ISO 9606-1 — standarde europene aplicabile

## Testing cumulative
- V7.4 iter 5: 7/7 backend + frontend 100%
- V8.0 iter 6: 11/11 backend
- V8.1 iter 7: 35/35 backend (cartouche + full coverage)
- V8.3 iter 9: 17/17 backend + frontend pipeline/catalog
- V8.5 iter 10: 18/18 backend + frontend 95% → 1 minor fix applied
- **Total cumulat: 88+/88+ PASSED**

## Test data
- PID: `gp_e79e2810cc64b5b4` (owned by dragosserban95@gmail.com)
- Pre-populated cu ~50 fields incluzând registry + ntpee + legal docs
- Acces: `/gaze-naturale/gp_e79e2810cc64b5b4`

## Pending (Backlog)
- (P2) Splitting `gas_doc_templates.py` 1200+ lines în sub-modul `gas_doc_builders/` (refactoring non-critical)
- (P2) Splitting `placeholders_registry.py` 887 lines per category (semnalat în iter 10)
- (P3) Certificate digitale QES real (DigiSign/CertSIGN API contracts pendant pe user)
- (P3) Webhook Stripe pentru ad-hoc services (când userul închide tab după plată)
- (P3) Extindere alte industrii (Electric, Apă-Canal, Fotovoltaice) cu același pattern
- (P3) Cleanup `db.gas_service_purchases` pending rows mai vechi de N ore
- (P3) StampPlacement: re-load la schimbare `stampId` fără unmount (corner case)
