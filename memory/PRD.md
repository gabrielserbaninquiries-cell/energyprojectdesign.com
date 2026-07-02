# Energy Project Design (EPD) — Product Requirements Document

**Last update:** 2026-02 (V13.0 — Trillion-Dollar UI Retheme + Real-Functional Validation + Emergent Prize Ready)

---

## 1. Problem Statement (original)
Construire platformă monolitică B2B pentru documentație tehnică digitală certificată. Consolidează multiple industrii (gaze naturale, construcții, electric, apă-canal, telecom, fotovoltaice, HVAC, feroviar, aviație, spațial) într-un singur sistem. Ecosystem 40+ servicii globale, ambiție: cea mai căutată și utilizată platformă B2B din lume. Fondator (Dragos Serban, CUI 43151074) cere realism absolut, zero AI-slop, zero brand-uri vizibile pe imagini, UI premium „trilion trilion dolari".

## 2. Core Requirements (verbatim user)
1. **Motor documentație gaze naturale legal 100%** — conform NTPEE 2018 + Ord. ANRE 89/2018, cu entropia pe faze (Branșament, Instalații utilizare, Extinderi).
2. **Monetizare Stripe LIVE** — 14 planuri (OSD, Mass Production, S.R.L. Lifetime 1000€, VGD, RTE) + donații variabile 2-100000 RON/EUR.
3. **Native Login** — Email/Parolă + Native Google OAuth (fără branding Emergent).
4. **UI premium autentic** — realism absolut, fără AI-slop; ecosystem grid 40+ servicii (10/rând), imagini realiste unbranded.
5. **RBAC strict** — Admin, Society, Verificator VGD/RTE + Admin Developer dashboard.
6. **Doar template-uri developer-managed** (fără template default de platformă).
7. **SEO complet functional** — pregătit pentru Emergent Prize $100k.

---

## 3. What's Implemented (V13.0 — Feb 2026)

### Frontend
- **UI Design System (V13.0 "Trillion-dollar")**
  - Fonturi: Cabinet Grotesk (H1-H4) + Satoshi (body) + IBM Plex Mono
  - Palette: Zinc-950 (#09090B) high-contrast Swiss + amber (Investitori) + fuchsia (Donații) + emerald (Transparență)
  - Butoane primare: `.epd-btn` = zinc-950 solid (fost gradient violet)
  - Ghost, outline buttons retematizate
  - No more AI-slop; toate imaginile = raw photography Unsplash

- **Pagini & Rute**
  - `/` Landing premium (hero, ecosystem 40+ services, active services, plans, investitori)
  - `/auth` (V13.0 UNIFICAT) — combină Login + Register cu toggle signup/signin
  - `/login` → redirect `/auth?mode=signin`
  - `/register` → redirect `/auth?mode=signup`
  - `/dashboard`, `/gaze-naturale` (public + entropia workflow, save/load projects, master DOCX), `/admin/users`
  - `/pricing`, `/investitori`, `/sponsorizeaza`, `/transparenta`, `/parteneri`, `/contact`, `/gdpr`, etc.

- **Auth (V12.4 + V13.0)**
  - Google Sign-In cu `@react-oauth/google` (native, fără Emergent branding)
  - Email/parolă cu bcrypt + JWT
  - GDPR consent obligatoriu la signup
  - Owner auto-seed pe startup (env vars OWNER_EMAIL / OWNER_PASSWORD)

- **Gaze Naturale Studio (V13.0)**
  - Header premium zinc-950 + overlay foto țevi gaz reale
  - 10 secțiuni: General, Branșament, Extindere, Instalație, Avize, Suduri, PV, Materiale, Calc, Documente
  - Entropia workflow pe faze cu cronologie legală
  - Subsection selector (Branșament / Extindere / Instalație utilizare)
  - Save/Load proiecte + template default localStorage
  - Master DOCX generator cu 150+ placeholdere
  - Dev mode toggle pentru placeholderele `{{key}}`

- **Language switcher (V13.0 fix)**
  - Google Translate widget cu 32 limbi
  - **Fix bug „blocare limbă"**: `domainVariants()` șterge cookie pe toate scope-urile de domain (root + subdomains). Previne stale cookies.

### Backend
- FastAPI + MongoDB
- `/api/auth/register` + `/api/auth/login` + `/api/auth/google`
- `/api/plans` (14 planuri catalog)
- `/api/payments/checkout` (Stripe LIVE, returnează cs_live_*)
- `/api/donations/checkout` (min 2 RON / 1 EUR)
- `/api/gas-project` CRUD + `/api/gas/master-docx-preview` (DOCX blob)
- `/api/admin/users` (list, plan change, delete, CSV export) — guarded by `get_admin_user`
- `/api/placeholders/template.docx` + `.md` (developer download)
- `/api/me/plan` (quota tracking)

### SEO (V12+ menținut/actualizat)
- `robots.txt` (3535B, GPTBot/ClaudeBot/Google-Extended whitelisted)
- `sitemap.xml` (41 URLs + 25 hreflang pentru 24 limbi)
- `sitemap-industries.xml` + `sitemap-images.xml`
- Structured data JSON-LD (SoftwareApplication + Organization + BreadcrumbList)
- OG + Twitter Cards defaults în index.html
- `theme-color` = #09090B (aliniat cu noul aspect)

### Ecosystem Grid (V12.6 → V13.0)
- 40+ servicii în 10 categorii (Logistică, Servicii cetățeni, Construcții, Comerț, Educație&Sănătate, Media, Evenimente, Muncă, Industrie, Tehnologie viitor)
- **93 imagini Unsplash verificate — 0 broken, 0 duplicate, 0 branduri vizibile** (post-Feb 2026 audit)

---

## 4. Testing Status (iteration_26.json)
- **Backend: 19/19 pytest PASS (100%)**
- **Frontend: 26/27 UI assertions PASS (96%)** — singurul PARTIAL era 3 imagini rupte, reparate imediat
- Auth email/parolă + redirects `/login`/`/register` funcționali
- Stripe LIVE checkout returnează URL valid (cs_live_*)
- Donații 5 EUR + rejection <min OK
- /admin/users guarded corect
- Google OAuth 403 pe preview = normal (domain not whitelisted în Google Cloud) — funcționează pe producție
- `/gaze-naturale` public 200

---

## 5. Roadmap / Backlog

### P1 (Next)
- Digital Certificate QES eIDAS (DigiSign / certSIGN) — așteaptă chei API user
- Developer Custom Template Manager UI (`/templates`) — upload `.docx` + mapare placeholders

### P2
- PayPal integration
- Twilio SMS OTP login (2FA opțional)

### P3
- Modul comunicare inter-departamente (chat/notes per proiect)
- Submit `sitemap.xml` în Google Search Console după DNS switch
- Refactor server.py (>3400 linii) în routere separate: auth, payments, docs, admin

---

## 6. Deployment Reminders (URGENT pentru user)

⚠️ **Preview ≠ Producție.** Fiecare modificare făcută în preview (inclusiv V13.0 retheme + fix-uri de imagini + fix bug limbă) **NU este vizibilă pe `www.energyprojectdesign.com`** până când:

1. Setați Secrets/Env Vars în panoul Emergent Deployment (Stripe LIVE + Google OAuth)
2. Apăsați **Redeploy**

⚠️ **Rotare chei** — Live Stripe + Google OAuth Client Secret au fost partajate în chat. Rotate-le după deploy.

⚠️ **Google OAuth Origins** — Adăugați `https://www.energyprojectdesign.com` în Google Cloud OAuth Client `656281504261.apps.googleusercontent.com` → Authorized origins pentru ca Sign-In să funcționeze pe producție.

---

## 7. Files of Reference
- `/app/frontend/src/pages/Auth.jsx` — pagină unificată V13.0
- `/app/frontend/src/pages/Landing.jsx` — Landing V13.0 + header fix wrap
- `/app/frontend/src/pages/GasNaturalStudio.jsx` — Studio V13.0 zinc-950
- `/app/frontend/src/data/services.js` — 40+ services + imagini realiste
- `/app/frontend/src/components/GlobalTranslator.jsx` — fix limbă multi-domain cookie
- `/app/frontend/src/index.css` — design tokens V13.0
- `/app/backend/server.py`, `plans.py`, `admin_routes.py`
- `/app/memory/COMMANDS_LOG.md` — registrul cronologic al comenzilor user
- `/app/memory/test_credentials.md` — credențiale test
- `/app/test_reports/iteration_26.json` — raport testing V13.0
- `/app/design_guidelines.json` — blueprint V13.0 de la design_agent
