# Energy Project Design (EPD) — PRD V12.0

> Multi-industry SaaS for engineering documentation, monetization, marketplace, and global utility services.
> Live status: PREVIEW healthy & verified · Production: deployed (energyprojectdesign.com).

## V12.0 — RELEASE NOTES (26 Feb 2026)

### 🔴 Adăugat (cerințe directe utilizator)

1. **Restructurare planuri Stripe** (`/app/backend/plans.py`)
   - 🆕 Plan OSD nou — `999.999 EUR/lună`, proiecte/funcții/IP-uri NELIMITATE (target: Operatori Sistem Distribuție gaze: Distrigaz Sud, Engie, Delgaz Grid, Premier Energy).
   - Mass production: 300 branșamente/lună, funcții NELIMITATE, utilizatori nelimitați (eliminat „1 PC binding").
   - Societate: 300 proiecte/lună (era 150), funcții NELIMITATE.
   - Operator / Contabilitate / Ofertare: proiecte NELIMITATE (erau 150).
   - **Verificator VGD & RTE: preț 1000 EUR/lună fiecare**, proiecte NELIMITATE.
   - Default plans (basic, proiectant, executant, avize): 150 proiecte/lună.

2. **Workflow Verificator VGD/RTE complet** (`/app/backend/verificator_routes.py`)
   - `POST /api/verificator/projects/{pid}/submit` — societate transmite proiect către VGD/RTE atestat.
   - `GET /api/verificator/inbox?status=pending|approved|rejected|returned` — proiecte primite.
   - `POST /api/verificator/projects/{pid}/decide` — decizie (approved/rejected/returned) cu observații + hash SHA-256 + timestamp imuabil.
   - `GET /api/verificator/ledger` — evidență grupată pe societate emitentă cu counts per status.
   - `GET /api/verificator/projects/{pid}` — detalii complete proiect pentru verificator.
   - **QES eIDAS: marcat explicit `qes_signature: null` + `qes_pending_integration: true`** — integrare reală DigiSign/certSIGN urmează (NU mock).
   - Frontend: `/app/frontend/src/pages/VerificatorWorkspace.jsx` cu tabs Inbox + Ledger, modal decizie cu 3 acțiuni + observații + termen remediere.

3. **Secțiune „Servicii și funcții în dezvoltare"** (Pricing.jsx)
   - Adăugată DEASUPRA grid-ului de planuri pe `/pricing`.
   - 7 carduri transparente: QES eIDAS, inter-department workflow, Dev Template Manager, Voturi CNP, Riviera Românească PDF, Bilete avion+Taxi, Submit din Gas Studio.
   - Toate marcate cu badge „În dezvoltare" amber.

### Verificare end-to-end (V12.0)
| Endpoint / Flow | Status |
|---|---|
| GET /api/plans (13 planuri inclusiv osd/vgd/rte/mass_production) | ✅ |
| GET /api/me/plan (quotas corecte per plan) | ✅ |
| POST /api/auth/register + login (user nou) | ✅ |
| POST /api/auth/register fără gdpr_consent | ✅ REFUZ 400 |
| POST /api/payments/checkout (basic 58, vgd 1000, mass_prod 2500) | ✅ cs_live_* |
| POST /api/payments/checkout trial 0 EUR | ✅ free_activated:true |
| POST /api/donations/checkout (RON 10, EUR 5) | ✅ cs_live_* |
| POST /api/donations/checkout amount<1 | ✅ REFUZ 400 |
| Verificator submit → inbox → decide → ledger E2E | ✅ |
| Verificator access control (basic user 403) | ✅ |
| Pricing UI: "în dezvoltare" + 13 planuri | ✅ |
| /verificator/inbox owner UI: tabs + filtre + empty state | ✅ |

**Test report**: `/app/test_reports/iteration_25.json` — Backend 17/17 PASS · Frontend 6/6 PASS.

## 1. Original Problem Statement (founder, Romanian)
> „Vreau să consolidez toate logicile din mai multe repository-uri într-o singură platformă numită Energy Project Design (EPD), cu interfață premium de utilitar global multi-trilion-dolar.
> 1. Modulul Gaze Naturale — 100% legal România (NTPE 89/2018), 33+ template DOCX, placeholdere reale.
> 2. Monetizare universală — Stripe LIVE, planuri foarte scumpe (OSD 999999€/lună, Developer Elite $999,999, Mass Production, modul donații).
> 3. UI premium 'mega utilitar global'.
> 4. Workflow strict cronologic în Gas + workflow Verificator real (import, ștampilare, retransmitere, ledger).
> 5. Restricții UI bazate pe planul activ.
> 6. SEO global + multi-limbă + JSON-LD.
> Misiuni viitoare: voturi electronice, bilete avion, taxi global, Riviera Românească (litoralul ca destinație globală)."

## 2. Plan catalog (V12.0)

| Plan ID | Nume | Preț EUR/lună | Proiecte/lună | Funcții |
|---|---|---:|---:|---|
| free | Free (cont expirat) | 0 | 0 | minim |
| trial | Trial 14 zile | 0 | 5 | toate principale |
| basic | Basic — Introducere date | 58 | 150 | date proiect + calc |
| operator | Operator introducere date | 118 | **NELIMITATE** | + DOCX |
| proiectant | Proiectant individual | 258 | 150 | + Avize Hub + Renouard |
| executant | Executant | 198 | 150 | + PV-uri + anunț |
| avize | Departament Avize / OSD | 138 | 150 | Avize Hub complet |
| ofertare | Ofertare + SEAP | 158 | **NELIMITATE** | auto-apply SEAP |
| contabilitate | Contabilitate + e-Factura | 98 | **NELIMITATE** | ANAF SPV |
| **vgd** | **Verificator VGD** | **1.000** | **NELIMITATE** | inbox + decizii + ledger |
| **rte** | **Verificator RTE** | **1.000** | **NELIMITATE** | idem VGD |
| societate | Societate | 798 | **300** | toate departamentele |
| mass_production | Mass Production | 2.500 | 300 | API + utilizatori nelimitați |
| **osd** | **OSD (Operator Sistem Distribuție)** | **999.999** | **NELIMITATE** | enterprise + IP whitelisting |

## 3. Architecture (V12.0)

```
Frontend (React 19 + TailwindCSS + i18next)
├── pages/Pricing.jsx — secțiune "în dezvoltare" + grid 13 planuri
├── pages/VerificatorWorkspace.jsx (NEW V12.0) — Inbox + Ledger + Decizii
├── pages/GasNaturalStudio.jsx — main entry pentru /gaze-naturale
├── pages/Dashboard.jsx (V11.0)
└── ...

Backend (FastAPI + MongoDB + python-docx)
├── plans.py — catalog 14 planuri (V12.0: osd nou, vgd/rte 1000, quotas restructurate)
├── verificator_routes.py (NEW V12.0) — submit/inbox/decide/ledger
├── roles_pages_matrix.py — + verif_workspace + verif_ledger pages
├── gas_materials_engine.py (V11.6) — 554 materiale ANEXA 13 auto-select
├── gas_master_template.py — DOCX 40KB cu 221 placeholdere
└── server.py — auth (idempotent owner seed) + Stripe + 50+ routere
```

## 4. Test Credentials
Vezi `/app/memory/test_credentials.md`. Owner: `dragosserban95@gmail.com` / `Nuamparola_9`.

## 5. Production vs Preview (CRITICAL)
- Preview (dev, agent control): `https://github-push-test.preview.emergentagent.com`
- Production: `https://energyprojectdesign.com`
- ⚠️ Toate modificările V12.0 sunt pe Preview. Trebuie făcut Deploy din Emergent pentru ca prod să primească update-urile.

## 6. Roadmap (next P0/P1/P2)

### P0 (next)
- Buton „Submit la verificator VGD/RTE" în GasNaturalStudio (deschide modal cu lookup email)
- Notificare in-app + email când VGD/RTE ia decizie (status badge în /proiecte)

### P1
- Integrare reală QES eIDAS (DigiSign / certSIGN) — semnătură criptografică pe decizia verificator
- Dev Template Manager UI (`/templates`) — upload .docx custom + mapare placeholdere
- Buton „Descarcă propunere oficială (PDF 20 pagini)" pe /riviera-romaneasca

### P2
- Inter-department workflow notifications (chat/notes per proiect)
- JSON-LD JobPosting pe /jobs
- Refactor server.py (3360+ linii) → split auth/stripe/donations în routere separate

### Backlog
- Coastline Riviera Românească app — engineering design phase
- Electronic CNP-based voting — legal framework pending
- Taxi global + bilete avion marketplace
