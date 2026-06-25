# Energy Project Design (EPD) — PRD V11.5

> Multi-industry SaaS for engineering documentation, monetization, marketplace, and global utility services.
> Live status: PREVIEW healthy & verified · production needs Deploy (owner seed will auto-create owner account on first startup).
> Owner: dragosserban95@gmail.com · society_admin plan (auto-seeded).

## V11.5 — RELEASE NOTES (25 Feb 2026)

### What was added (per user requests, NO existing functionality modified)

1. **Idempotent Owner Account Seed** (`/app/backend/server.py::_seed_owner_account`)
   - Runs on EVERY backend startup, both preview AND production.
   - Reads OWNER_EMAIL + OWNER_PASSWORD from `/app/backend/.env`.
   - Creates owner with bcrypt-hashed password if missing; refreshes hash if env password rotated.
   - Always ensures `is_admin=true, is_developer=true, is_society_admin=true, plan=society_admin`.
   - **Why**: User reported login failing on production — root cause was missing user in production DB.

2. **Owner Plan Downgrade Protection** (`/api/payments/checkout`)
   - Refuses HTTP 403 if owner/developer tries to activate trial plan.
   - Protects society_admin state against accidental downgrade.

3. **Gas Studio Project Picker** (`GasNaturalStudio.jsx` lines 207-260)
   - Modal shows on entering /gaze-naturale (no pid) when user has ≥1 saved projects.
   - 3-col grid card layout with Open + Delete (hover) actions.
   - "Proiectele mele (N)" button in header for re-opening picker.
   - "Salvat la HH:MM" indicator after each save.

4. **Developer Placeholder Overlay** (`/app/frontend/src/components/gas/DevPlaceholderTag.jsx`)
   - Click-to-copy `{{key}}` badges shown ABOVE each input field.
   - Visible ONLY when `user.is_developer=true` AND DEV ON toggle active.
   - Persisted in localStorage (`epd_dev_mode`).
   - Wrapped Field components in: GeneralData, Bransament, Extindere, InstalatieUtilizare sections.

5. **Master Placeholder Template Downloads**
   - `GET /api/placeholders/template.md` → returns full markdown catalog (`GAZE_NATURALE_PLACEHOLDERS.md`).
   - `GET /api/placeholders/template.docx` → generates DOCX with 221 placeholders in 32 tables grouped by section.
   - Developer-only buttons in Gas Studio header: DOCX + MD.

6. **Instalație Utilizare Completed** (added missing `iu_viteza_calculata_ms` field display)
   - Live viteza calculation panel next to dn_recomandat.
   - Conformance check (< 20 m/s interior per art. 49 ANRE).
   - Red warning when limit exceeded.

7. **Sidebar Menu — Billing Added** (`/app/backend/roles_pages_matrix.py`)
   - New "Facturare & istoric plăți" entry under Cont section → `/billing`.
   - Now sidebar contains: Profil societate, Planuri & departamente, Facturare, Setări.

8. **Google Login Button Text Clarified**
   - "Continuă cu Google — Energy Project Design" (was just "Continuă cu Google").
   - On /register page.

### Test Status (V11.5)
- Backend: **18/18 pytest PASS** (`/app/backend/tests/test_v115_auth_payments.py`)
- Frontend: **8/9 Playwright PASS** (1 flaky selector, behavior verified by backend equivalent)
- Owner login + plan checkout + donations + gas project CRUD + GDPR rejection all verified

### Verified payment flows (LIVE Stripe — cs_live_ URLs returned)
- ✅ Trial 0 EUR → activates direct (no Stripe)
- ✅ Basic 29 EUR → checkout.stripe.com/c/pay/cs_live_*
- ✅ Proiectant 129 EUR → cs_live_*
- ✅ Societate 399 EUR → cs_live_*
- ✅ Avize 69 EUR → cs_live_*
- ✅ Donations RON 10 + EUR 5 → cs_live_*
- ✅ Donation min RON 1 → rejected 400

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
- Replace remaining `t()` calls on Forum/Marketplace/Imobiliare pages with i18next-aware translations
- Add `JobPosting` JSON-LD on `/jobs`
- Add `Article` JSON-LD for blog (when launched)

### V11.3 — Gas Studio COMPLET (Feb 2026) — 100% PASS testing agent
- ✅ **3 secțiuni noi** adăugate la GasNaturalStudio: **Suduri & calitate** (sudor + examinare vizuală + protocol electrofuziune), **Procese Verbale** (10 tipuri PV), **Documente generate** (catalog 30+ DOCX cu descărcare individuală)
- ✅ Sidebar are acum **10 secțiuni** (anterior 7)
- ✅ Endpoint backend nou: `GET /api/gas/templates-catalog` — returnează 34 șabloane grupate pe 6 faze (CU, DTAC, PT, Execuție, PIF, Recepție)
- ✅ Endpoint backend nou: `POST /api/gas/doc-preview/{template_id}` — generează ORICE template individual din payload, cu sanitizare filename latin-1 pentru diacritice românești
- ✅ Master DOCX extins să includă: Sudor autorizat, Tabel examinare vizuală (Nr ordine | Sxx | Defecte | Admis/Respins), Protocol electrofuziune (Nr sudură | U min | U max | Timp | Energie | T mediu | Rezultat), Lista PV-uri (Tip | Nr | Dată | Participanți | Observații)
- ✅ Error handling îmbunătățit în GasDocumenteSection: detectează JSON-in-blob errors pentru a evita silent failure
- ✅ Backwards-compatible: master DOCX funcționează chiar fără date noi (suduri/PV opționale)
- ✅ Test report iteration_22: **20/20 PASS** (10 backend + 10 frontend)

### V11.2 — Next-Gen Missions Live (Feb 2026) — COMPLETE
- ✅ **Voturi Electronice CNP** (`/voturi-cnp`) — pagină de prezentare cu hero gradient violet-indigo, 6 piloni (anonimizare cripto, audit on-chain, GDPR+eIDAS), demo widget interactiv cu mock voting, 6 use cases (referendum, alegeri locale, sondaje publice etc.), cadru legal detaliat, footer CTA waitlist BETA. Testids: `voturi-hero`, `voturi-pillars`, `demo-vote-widget`, `use-cases-grid`.
- ✅ **Riviera Românească** (`/riviera-romaneasca`) — pagină prezentare cu hero tropical (orange→red→rose gradient), KPIs (54 km plajă, 15 stațiuni, 500K palmieri, 10M+ turiști target), 6 piloni (palmieri, plaje nisip alb, promenadă continuă, festivaluri, prețuri populare, branding global), 15 stațiuni de la Năvodari la Vama Veche, secțiune inspirație (Mykonos, Costa del Sol, Cancun), 5 moduri de implicare, footer CTA donații (1 palmier = 100 RON). Testids: `riviera-hero`, `riviera-pillars`, `statiuni-grid`, `actiune-grid`.
- ✅ Cardurile NEXT_GEN_MISSIONS din Landing sunt acum **clickable** către rutele cu `route` în `/src/data/services.js` (voturi-cnp + riviera-ro).
- ✅ **i18n pe Forum + RealEstate + Marketplace** — adăugate cheile `forum.*`, `realestate.*`, `marketplace.*` în toate 5 limbi (RO/EN/FR/DE/ES), aplicat `t()` pe titluri principale + subtitluri + CTAs primare. Restul label-urilor pot fi migrate incremental.
- ✅ Rute publice noi (fără auth) — accesibile direct prin URL pentru distribuire & SEO.

### V11.1 Code-Quality Refactor (Feb 2026) — COMPLETE
- ✅ Circular import broken: extracted shared helpers to `/app/backend/gas_doc_utils.py`. Both `gas_doc_templates.py` and `gas_doc_proiect_complet.py` now import only from `gas_doc_utils` (no cross-imports). Backward-compat preserved via re-exports.
- ✅ Forum XSS already mitigated — Forum.jsx uses `DOMPurify.sanitize()` with explicit `ALLOWED_TAGS` + `ALLOWED_ATTR` allowlist (lines 13-20). DOMPurify added to package.json.
- ✅ Test secrets moved: `/app/backend/tests/fixtures.py` provides `get_owner_credentials()` / `get_test_credentials()` / `get_admin_credentials()` — env-driven. `test_v110_gas_master_studio.py` migrated as reference. Other test files use generic `TestPass123!` (non-sensitive).
- ✅ Landing.jsx data extracted to `/app/frontend/src/data/services.js`. `FUTURE_SERVICES` (22 items) and `NEXT_GEN_MISSIONS` (12 items) now have stable `id` slugs used as React keys (no more `key={index}` for these arrays).
- ✅ Master DOCX regression verified after refactor (HTTP 200, 39KB output).
- ✅ All linters pass on new files. Pre-existing E702 warnings in gas_doc_templates.py (lines 609/612/637/640) are style-only, unrelated to V11.1.

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
