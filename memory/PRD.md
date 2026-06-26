# Energy Project Design (EPD) — PRD V12.2

> Multi-industry SaaS for engineering documentation, monetization, marketplace, and global utility services.
> Live status: PREVIEW healthy & verified · Production: deployed (energyprojectdesign.com).

## V12.2 — RELEASE NOTES (26 Feb 2026)

### Plan catalog FINAL (14 planuri publice)

| Plan ID | Nume | Preț EUR | Tip | Proiecte | Export |
|---|---|---:|---|---:|:---:|
| trial | Gratuit | 0 | — | nelimitate (timp) | ❌ |
| basic | Basic | 58 | lunar | 150 / lună | ❌ |
| operator | Operator | 118 | lunar | NELIMITATE | ✅ |
| proiectant | Proiectant | 258 | lunar | 150 / lună | ✅ |
| executant | Executant | 198 | lunar | 150 / lună | ✅ |
| avize | Avize / OSD | 138 | lunar | 150 / lună | ✅ |
| ofertare | Ofertare + SEAP | 158 | lunar | NELIMITATE | ✅ |
| contabilitate | Contabilitate + e-Factura | 98 | lunar | NELIMITATE | ✅ |
| **srl** | **S.R.L.** | **1.000** | **🆕 ACHIZIȚIE UNICĂ** | **100 lifetime** | ✅ |
| vgd | Verificator VGD | 1.000 | lunar | NELIMITATE | ✅ |
| rte | Verificator RTE | 1.000 | lunar | NELIMITATE | ✅ |
| societate | Societate | 798 | lunar | 300 / lună | ✅ |
| mass_production | Mass Production | 2.500 | lunar | 300 / lună | ✅ |
| osd | OSD enterprise | 999.999 | lunar | NELIMITATE | ✅ |

### Features adăugate / fixate în V12.2

1. **🔥 P0 Fix Auth Loop (Google + Email)** — `AuthCallback.jsx` salva token în `localStorage.auth_token`, dar `api.js` îl citea din `sessionStorage.epd_auth_token`. Înlocuit cu `setAuthToken()` din api.js — Google OAuth nu mai face loop. Adăugat și `nav('/dashboard', { replace: true })` ca să nu rămână istoric.
2. **🆕 Plan SRL ONE-TIME (1000 EUR)** — `plans.py::srl` cu `one_time: True` + `lifetime_projects: 100`. Quota check în `gas_project_routes.py` numără TOATE proiectele (nu doar luna curentă) pentru SRL. Card cu badge „Plată unică" verde pe `/pricing`.
3. **Trial 14 zile → Gratuit nelimitat (fără export)** — utilizatorii pot folosi platforma fără limită de timp, doar exportul DOCX/PDF este blocat.
4. **`/gaze-naturale` PUBLIC** — accesibil fără login pentru vizualizare + testare. Banner „Pagină în dezvoltare" cu detalii despre secțiunile funcționale (proiectare branșamente, extinderi, instalații utilizare).
5. **🆕 Parteneri & Colaborări (`/parteneri`)** — directoriu profesional cu 5 tipuri (S.R.L., PFA, Angajat, Verificator, OSD) + 8 roluri (proiectant, executant, VGD, RTE, contabilitate, ofertare, operator date, consultant). Endpoints: `/api/partners`, `/api/partners/me`, `/api/partners/collaborations`. Un verificator poate accepta invitații de la N societăți simultan datorită planului nelimitat.
6. **Industries (13) hidden from non-developers** — `roles_pages_matrix.py` limitează `/documentatie-industrii` la dev/admin/society_admin/cofounder.
7. **„Servicii și funcții în dezvoltare"** (Pricing.jsx) — secțiune amber DEASUPRA grid-ului cu 7 carduri transparente (QES eIDAS, workflow inter-dep, Riviera PDF, voturi CNP, etc.).
8. **Workflow Verificator real (V12.0 preserved)** — `/api/verificator/{inbox,decide,ledger,submit}` cu hash SHA-256 imuabil + audit log. UI `/verificator/inbox` cu Inbox + Ledger pe societăți.

### Verificare end-to-end (V12.2 manual curl)
| Test | Status |
|---|---|
| 14 planuri în `/api/plans` (inclusiv SRL one-time) | ✅ |
| Stripe checkout pentru 13 planuri plătite returnează `cs_live_*` | ✅ |
| Trial 0 EUR activare directă fără Stripe | ✅ |
| Donații RON 15, EUR 5, refuz RON 0.5 | ✅ |
| Register fără gdpr_consent → 400 | ✅ |
| Register + login + `/auth/me` E2E | ✅ |
| `/gaze-naturale` HTTP 200 fără login | ✅ |
| Banner „Pagină în dezvoltare" vizibil | ✅ |
| Parteneri CRUD (create + list cu filtre) | ✅ |
| Verificator submit→inbox→decide→ledger | ✅ (V12.0) |

## Architecture (V12.2)

```
Backend (FastAPI + MongoDB)
├── plans.py — 14 planuri (V12.2: srl ONE-TIME, trial unlimited, vgd/rte 1000, osd 999999)
├── verificator_routes.py — submit/inbox/decide/ledger
├── partners_routes.py (NEW) — parteneri + colaborări inter-companii
├── gas_project_routes.py — quota lifetime pentru SRL, monthly pentru subscription
├── roles_pages_matrix.py — Industrii (13) hidden non-dev, + Parteneri page
├── auth.py — JWT + Emergent Google session fallback
└── server.py — payment checkout one_time vs subscription detection

Frontend (React 19)
├── pages/Pricing.jsx — 14 plan cards + "în dezvoltare" amber section + SRL badge
├── pages/Parteneri.jsx (NEW) — directoriu + create + collaboration modal
├── pages/VerificatorWorkspace.jsx (V12.0) — inbox + ledger + decide modal
├── pages/AuthCallback.jsx — V12.1 fix sessionStorage
├── pages/GasNaturalStudio.jsx — public, banner "in development"
├── contexts/AuthContext.jsx — hybrid cookie+Bearer
└── App.js — /gaze-naturale PUBLIC, /parteneri PUBLIC, /verificator/* protected
```

## Credentials (test)
- Owner: `dragosserban95@gmail.com` / `Nuamparola_9` (society_admin)
- VGD test: `vgd_test_1782441873@example.com` / `VGDPass_123!` (plan=vgd)

## Production vs Preview
- Preview: `https://github-push-test.preview.emergentagent.com`
- Production: `https://energyprojectdesign.com` (necesită Deploy din panoul Emergent)
- Owner seed este idempotent — userul tău există automat și pe production după deploy.

## Roadmap (post V12.2)
- P0: Buton „Submit la VGD/RTE" direct în GasNaturalStudio (autocomplete cu parteneri verificatori)
- P0: Badge status verificare în `/proiecte` (pending/approved/rejected)
- P1: Integrare reală QES eIDAS (DigiSign / certSIGN)
- P1: Restore funcții complete din imaginea legendară (Trimite la Primarie / Diriginte / Contabilitate / OSD / ISC / Politie din UI)
- P1: Vision frame clonabil — template-uri pentru alte industrii (electric, fotovoltaic, telecom)
- P2: JSON-LD JobPosting `/jobs`, refactor server.py (3450+ linii)
- P2: Riviera Românească — propunere oficială PDF 20 pagini
