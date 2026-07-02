# Energy Project Design (EPD) — PRD V12.7

> Multi-industry SaaS. Preview healthy · Production: energyprojectdesign.com

## V12.7 — RELEASE (2 Jul 2026)

### 🔑 Chei critice actualizate
- Stripe LIVE: STRIPE_API_KEY (sk_live_...HHkxz), STRIPE_DONATIONS_API_KEY (rk_live_...9Z27S), STRIPE_PUBLISHABLE_KEY
- Google OAuth (native, own credentials): CLIENT_ID `656281504261-32farph07s7if0cgqgec7a0vvnsjrmic.apps.googleusercontent.com`
- Toate testate ✅ end-to-end via curl

### Plan catalog (14 planuri)
| ID | Nume | Preț | Tip |
|---|---|---:|---|
| trial | Gratuit nelimitat | 0 | fără export |
| basic | Basic | 58 EUR | lunar |
| operator | Operator | 118 EUR | lunar / proiecte nelimitate |
| proiectant | Proiectant | 258 EUR | lunar |
| executant | Executant | 198 EUR | lunar |
| avize | Avize / OSD | 138 EUR | lunar |
| ofertare | Ofertare + SEAP | 158 EUR | lunar / proiecte nelimitate |
| contabilitate | Contabilitate | 98 EUR | lunar / proiecte nelimitate |
| srl | S.R.L. | **1000 EUR** | **plată unică · 100 proiecte lifetime** |
| vgd | Verificator VGD | 1000 EUR | lunar / nelimitat |
| rte | Verificator RTE | 1000 EUR | lunar / nelimitat |
| societate | Societate | 798 EUR | lunar / 300 proiecte |
| mass_production | Mass Production | 2500 EUR | lunar / 300 branșamente |
| osd | OSD enterprise | 999999 EUR | lunar / totul nelimitat |

### Features livrate în V12.x (cumulative)

**V12.0**: Workflow Verificator real (submit/inbox/decide/ledger cu hash SHA-256 imuabil)
**V12.1**: Fix AuthCallback loop (sessionStorage), Trial → Gratuit nelimitat fără export
**V12.2**: Parteneri & Colaborări directoriu, plan S.R.L. one-time 1000€/100 proiecte
**V12.3**: Gas Studio banner „în dezvoltare", GasPhaseEntropy widget, GasMailDispatchPanel (Primărie/Diriginte/OSD/ISC/Poliție/Contabilitate)
**V12.4**: Native Google OAuth (own credentials), Login/Register rebranded „Log in to Energy Project Design"
**V12.5**: Motto section, EPD_ECOSYSTEM (45 servicii × 10 categorii cu imagini relevante), GasIndustryBanner + GasSubsectionSelector + GasEntropiaWorkflow (workflow bransament 10 pași · workflow instalatie 4 pași)
**V12.6**: Admin Users panel + DELETE endpoint + accounts registry (evidență reală conturi)
**V12.7**: Templates șterse din DB (3 docs), UI polish global (eliminat 3 backgrounds futuriste: hero + architects + CTA), ecosystem grid 10 servicii/rând pe desktop (top-platform look), imagini mici relevante per serviciu

### Verificare E2E (7 flow-uri critice)
| Endpoint / Flow | Status |
|---|---|
| GET /api/plans (14 plans) | ✅ |
| POST /api/payments/checkout (basic → SRL → OSD) | ✅ cs_live_* |
| POST /api/donations/checkout (RON/EUR variabil) | ✅ cs_live_* |
| POST /api/auth/register + login + /auth/me | ✅ |
| POST /api/auth/google (native, ID token validation) | ✅ |
| GET /api/admin/accounts/registry | ✅ 9 conturi |
| GET /api/partners (public) | ✅ 1 partner |
| GET /api/verificator/inbox | ✅ 0 items (empty state) |

## Architecture (V12.7)

```
Backend (FastAPI + MongoDB, ~3550 linii server.py)
├── auth.py + server.py — JWT + native Google OAuth (V12.4)
├── plans.py — 14 planuri (incl. srl one-time, osd 999999)
├── verificator_routes.py — submit/inbox/decide/ledger
├── partners_routes.py — parteneri + colaborări B2B
├── admin_routes.py — /admin/users CRUD + /admin/accounts/registry (V12.6)
├── gas_project_routes.py — quota lifetime SRL / monthly subscriptions
└── ...

Frontend (React 19, 84 pages, 110 routes)
├── pages/Landing.jsx — hero fără photo futurist, motto section, ecosystem 10/row
├── pages/Pricing.jsx — 14 plan cards + "în dezvoltare" section
├── pages/GasNaturalStudio.jsx — banner + subsection selector + entropia workflow + phase entropy + mail dispatch
├── pages/VerificatorWorkspace.jsx — inbox + ledger + decizie modal
├── pages/Parteneri.jsx — directoriu profesional
├── pages/AdminUsers.jsx — management conturi (V12.6)
├── pages/Login.jsx + Register.jsx — Google Sign-In native + email/password
├── components/gas/ — Banner, Selector, EntropiaWorkflow, PhaseEntropy, MailDispatch
└── data/services.js — 40 FUTURE_SERVICES + 45 EPD_ECOSYSTEM (10 categorii)
```

## Credentials
- Owner: `dragosserban95@gmail.com` / `Nuamparola_9`
- VGD test: `vgd_test_1782441873@example.com` / `VGDPass_123!`
- Google OAuth: any Gmail account works

## Production readiness
- Toate credențialele Stripe LIVE + Google OAuth configurate pe PREVIEW ✅
- Trebuie doar **Deploy** pe Emergent → energyprojectdesign.com va prelua totul
- Env vars critice de replicat pe production:
  - `STRIPE_API_KEY`, `STRIPE_DONATIONS_API_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `CORS_ORIGINS=https://energyprojectdesign.com,https://www.energyprojectdesign.com`
  - `REACT_APP_BACKEND_URL=https://www.energyprojectdesign.com`

## Roadmap deschis (nu implementat încă)
- Own Stripe-like payment gateway (necesită licență PSP)
- Own Revolut-like bank (necesită licență bancară IFR)
- Real book-a-flight (Amadeus/Duffel API integration)
- QES eIDAS real (DigiSign/certSIGN)
- Twilio SMS OTP mobile login
- PayPal (utilizatorul are credentials pe pause)
- VR/Metaverse platform
- 40+ servicii ecosystem cu funcționalitate reală (momentan doar landing cards)
