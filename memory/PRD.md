# Energy Project Design (EPD) — PRD V11.0

> Multi-industry SaaS for engineering documentation, monetization, marketplace, and global utility services.
> Live status: PREVIEW healthy · production needs Deploy.
> Owner: dragosserban95@gmail.com · Cofounder plan.

## 1. Original Problem Statement (founder, Romanian)

> "Vreau să consolidez toate logicile din mai multe repository-uri într-o singură platformă numită Energy Project Design (EPD), cu interfață premium de utilitar global multi-trilion-dolar.
> Trebuie să aibă:
> 1. **Modulul Gaze Naturale** — 100% legal România (NTPEE 2018), 33+ template DOCX, placeholdere reale.
> 2. **Monetizare universală** — Stripe LIVE, planuri foarte scumpe (Developer $999,999), modul donații.
> 3. **UI premium 'mega utilitar global'** — violet/navy/indigo, evită aspectul de admin panel.
> 4. **Workflow strict cronologic** în Gas.
> 5. **Restricții UI bazate pe planul activ**.
> 6. **SEO global** + multi-limbă + JSON-LD.
> Misiuni viitoare: voturi electronice, bilete avion, taxi global, **Riviera Românească** (litoralul ca destinație turistică globală)."

## 2. Acceptance Criteria (V11.0 — Feb 2026)

| # | Criteriu | Status |
|---|----------|--------|
| 1 | Studio Gaze Naturale cu 3 module: Branșament, Extindere, Instalație utilizare | ✅ DONE |
| 2 | Calcule LIVE frontend (lățime șanț, viteză gaz, tub protecție, Renouard) | ✅ DONE |
| 3 | Catalog OSD 35+ companii cu căutare | ✅ DONE |
| 4 | Generare automată listă materiale | ✅ DONE |
| 5 | Master DOCX cu 150+ placeholdere (model "Proiect bransament.docx") | ✅ DONE |
| 6 | Translation site-level — RO, EN, FR, DE, ES (i18next) | ✅ DONE |
| 7 | Dashboard premium V11.0 (gradient violet/indigo, glass-morphism) | ✅ DONE |
| 8 | Landing cu 12 misiuni Next-Gen (incl. Riviera Românească flagship) | ✅ DONE |
| 9 | Camere aparate V/Q + priză aer + detectori auto | ✅ DONE |
| 10 | Avize cu termen expirare + alertă recurentă | ✅ DONE |
| 11 | Stripe LIVE (donații + planuri) | ✅ FROM V10.7 |
| 12 | Hybrid Auth (Cookie + Bearer) | ✅ FROM V10.7 |
| 13 | Documentație placeholdere pentru utilizator | ✅ /app/docs/GAZE_NATURALE_PLACEHOLDERS.md |

## 3. Implementation Status (V11.0)

### ✅ DONE
- Comprehensive Gas Natural Studio (`GasNaturalStudio.jsx`) with 7 navigable sections
- 6 modular sub-components (`GasGeneralDataSection`, `GasBransamentSection`, `GasExtindereSection`, `GasInstalatieUtilizareSection`, `GasAvizeSection`, `GasMaterialsAutoSection`, `GasSmartCalcPanel`)
- Full calculation library (`/app/frontend/src/lib/gasCalcs.js`) with 35+ OSD list, 28+ aviz catalog, PE/OL diameter catalogs
- Master DOCX builder (`/app/backend/gas_master_template.py`) — generates 40KB document with placeholders replaced
- New endpoint `POST /api/gas/master-docx-preview` (auth required) — returns DOCX blob
- Premium Dashboard redesign (`Dashboard.jsx`) — gradient hero, 4 stat cards, 4 quick actions, dark plan card
- 12 new mission cards on Landing (Voturi live, Bilete avion, Taxi global, Riviera Românească flagship, etc.)
- i18next setup with 5 languages (RO/EN/FR/DE/ES) — replaces old 24-lang system
- Global premium CSS classes (`epd-btn-primary`, `epd-card-gradient`, `epd-pill`, `hover-lift`, etc.)
- Full placeholder documentation at `/app/docs/GAZE_NATURALE_PLACEHOLDERS.md`

### 🟡 IN PROGRESS / IMPROVEMENT BACKLOG
- Extract NEXT_GEN_MISSIONS + ACTIVE_SERVICES from Landing.jsx into `/src/data/services.js` (Landing.jsx is 780+ lines)
- Replace remaining `t()` calls on Forum/Marketplace/Imobiliare pages with i18next-aware translations
- Add `JobPosting` JSON-LD on `/jobs`
- Add `Article` JSON-LD for blog (when launched)

### 🔴 BLOCKED / FUTURE
- QES digital signing (DigiSign/certSIGN) — pending API contracts
- Coastline Riviera Românească app — engineering design phase
- Electronic CNP-based voting — legal framework pending

## 4. Architecture (Feb 2026)

```
Frontend (React 19 + TailwindCSS + i18next)
├── pages/GasNaturalStudio.jsx (NEW V11.0) — main entry for /gaze-naturale
├── pages/Dashboard.jsx (REWRITTEN V11.0)
├── pages/Landing.jsx (EXPANDED — 12 new mission cards)
├── components/gas/* (NEW — 6 modular sections)
├── lib/gasCalcs.js (NEW — pure JS calc engine, NTPEE 2018)
├── i18n/* (5 locales: ro, en, fr, de, es)
└── components/GlobalTranslator.jsx (legacy Google Translate fallback)

Backend (FastAPI + MongoDB + python-docx)
├── gas_master_template.py (NEW V11.0) — comprehensive DOCX builder
├── server.py (+ POST /api/gas/master-docx-preview endpoint)
├── gas_project_routes.py — legacy gas project CRUD (preserved)
└── 33+ legacy DOCX templates kept for backward compatibility
```

## 5. Test Credentials
See `/app/memory/test_credentials.md`. Owner account: `dragosserban95@gmail.com` / `Nuamparola_9` (use **"Autentificare EPD"** button, NOT Google).

## 6. Known Issues (Production vs Preview)
**CRITICAL**: User is testing on `energyprojectdesign.com` (production = old code). All V11.0 fixes are in PREVIEW. User must click **"Deploy"** in Emergent platform to push to production domain.

## 7. Roadmap

### Next iteration (V11.1)
- Inline error banner on DOCX generation failure ✅ ADDED
- Error handling improvements on master template build ✅ ADDED
- Deprecate routes `/gaze-naturale-v1` and `/gaze-naturale-v2` (redirect to new Studio)
- Extract Landing.jsx data constants to `/src/data/services.js`
- Apply `useSEO` to remaining protected pages

### Backlog (V12+)
- Voting CNP-based system (P0 — flagship feature)
- Taxi global app
- Riviera Românească presentation site
- Modular houses marketplace
- Auction engine for engineering bids
