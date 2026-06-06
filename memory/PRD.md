# Energy Project Design Services — PRD

## Original Problem Statement
B2B SaaS for Romanian engineering documentation, starting with **gas naturale** (branșamente, extinderi, instalații utilizare). Architecture supports multi-industry extension (electrical, water/sewage, civil, telecom).

## User Choices
- UI: Romanian
- Email: Gmail SMTP, per-user creds
- Payments: Stripe with EUR (currently `sk_test_emergent`, ready for `sk_live_...`)
- Real company: **ENERGY PROJECT DESIGN SRL · CUI 43151074 · J40/12982/2020 · Str. Lt. Alexandru Popescu nr. 9B, Sectorul 3, București**
- Digital signature: local PKCS#12 + QES scaffold (certSIGN/DigiSign/Trans Sped)
- Auth: JWT email/password + Emergent Google OAuth + GDPR consent
- Developer account: **`dragosserban95@gmail.com`** (auto-detected, plan=`developer`, lifetime)

## Architecture
- Backend: FastAPI + MongoDB (motor); modules: `industries.py`, `system_templates.py`, `plans.py`, `calc_engine.py`, `ai_assistant.py`, `ai_developer.py`, `qes_provider.py`, `docx_processor.py`, `signing.py`, `email_sender.py`, `auth.py`, `db.py`
- Frontend: React 19 + Tailwind, IBM Plex Sans/Mono, amber #FFB300, Swiss/brutalist
- Per-user **active project** drives all operational pages
- System-seeded DOCX templates available for all users (clone to library)

## Industries (8 catalogued)
1. ✅ **Gas naturale** (active) — 5 subdomenii active: Branșamente, Instalații utilizare, Extinderi conductă, Studii fezabilitate, Înlocuiri/modernizări
2. ⏳ Electrică (coming_soon)
3. ⏳ Apă & canalizare (coming_soon)
4. ⏳ Construcții civile (coming_soon)
5. ⏳ Telecom (coming_soon)
6. ⏳ Fotovoltaice (coming_soon)
7. ⏳ Construcții (coming_soon)
8. ⏳ Infrastructură feroviară (coming_soon)

## Imported from upstream repo (dragosserban95/Energy-Project-Design)
- VGD/RTE detail fields: atestat_vgd, data_verificare_vgd, status_vgd, observatii_vgd, autorizatie_rte, data_verificare_rte, status_rte, observatii_rte
- 3 additional industries matching the locked profiles list (Fotovoltaice, Construcții, Infrastructură feroviară)
- 2 additional system templates: certificare_vgd, certificare_rte
- Dual placeholder syntax support: `{{var}}` AND `<var>` (the upstream repo uses `<>`)

## Implemented (2026-02, V4.5+V4.6)
- ✅ 10 EUR plans (Basic 99 → Societate 399 + Developer)
- ✅ Multi-project CRUD + active project switcher in header + archive/restore/delete
- ✅ Industry & subdomain selector on project creation (validated server-side)
- ✅ Date proiect (14 required fields + completion score)
- ✅ Date tehnice + Calcul inteligent (6 smart boxes with formulas, sources, override)
- ✅ 4 system templates pre-seeded for gas engineering (Cerere racordare, Memoriu tehnic, Borderou, Adresă OSD)
- ✅ Clone-to-library workflow for system templates
- ✅ Templates / Stamps / Certificates PKI / Documents with Print button
- ✅ Email composer with 7 templates + role-based recipients + placeholder resolution
- ✅ Internal Certifications (SHA-256 + role + signer + timestamp)
- ✅ AI Assistant — intent parser (13 intents) with command-packet preview
- ✅ AI Developer panel (Plan Mode only — no auto-apply) with OpenAI BYOK enrichment, safety rules, handoff list (Emergent/Claude/ChatGPT/Codex)
- ✅ Verifică documentație — 8-check scoring engine + JSON export
- ✅ Audit interfață — 13+ pages with plan-access flags
- ✅ Settings: per-user Gmail config + QES credentials forms (per provider)
- ✅ Legal pages with real ENERGY PROJECT DESIGN SRL data
- ✅ GDPR consent required at register; /gdpr/export + /gdpr/account DELETE
- ✅ Developer auto-detection across email/password AND Google OAuth

## Testing
- **67/67 backend pytest pass** (27 regression + 20 v4.5 + 20 v4.6)

## Backlog
- P1: Encrypt `qes_credentials` at rest (Fernet/KMS)
- P1: Implement real certSIGN/DigiSign/Trans Sped subclasses (needs API contract)
- P1: Switch to Stripe live key (`sk_live_...`)
- P1: Refactor auth → httpOnly cookies (`AuthContext.jsx`, `auth.py`, `server.py`, `api.js`)
- P2: PDF export alongside DOCX ✅ DONE (reportlab)
- P2: Team workspaces with role inheritance
- P2: Activate electrical / water-sewage / civil / telecom industries
- P2: Public verification page `/verify/{doc_id}`
- P3: Encrypt action_logs and gmail_app_password at rest

## V4.9 — Forum + Lifecycle + Company + Payment Accounts (2026-02-06)
- ✅ **Payment Accounts** module (Revolut IBAN pre-seed TEST) + admin CRUD /admin/payment-accounts + public /payment-accounts/active pentru SEPA bank transfer
- ✅ **Forum** comunitate cu 9 industrii (8 + general), threads + replies + likes + views, auto-strip secrete, compose modal cu tags, developer poate șterge orice
- ✅ **Project Lifecycle** — 12 statusuri (Schiță → Arhivat) cu badges colorate, auto-detect din state + manual override
- ✅ **Smart Audit Score** ponderat pe 7 secțiuni (project 20%, technical 25%, calc 15%, etc.)
- ✅ **Next Best Action Engine** — un singur CTA per ecran, prioritizat după severity (high/medium/low)
- ✅ **LifecycleWidget** vizibil pe Dashboard cu Status + Score progress bar + NBA + breakdown
- ✅ **Company Profile** — 15 câmpuri firmă în 5 secțiuni (identitate, sediu, contact, bancă, repr.) cu auto-generare 15 placeholdere pentru DOCX/email-uri
- ✅ **Industries Roadmap** complet (`docs/INDUSTRIES_ROADMAP.md`) — 158 sub-domenii planificate pentru toate 8 industriile
- 🟡 Stripe live key — așteaptă cheia `sk_live_...` de la user
- 🟡 QES real — așteaptă contract certSIGN/DigiSign

## V4.8 — Cross-account Emergent transfer + security + breadth (2026-02-06)
- ✅ `render.yaml` blueprint pentru auto-deploy Render (backend + frontend static)
- ✅ `backend/github_push.py` + `POST /api/dev/github/push` — developer push direct în repo
- ✅ Pagina `/developer/github` cu UI completă: status repo, lista commits, formular push fișiere
- ✅ `backend/handoff.py` + `GET /api/dev/handoff/export` + `POST /api/dev/handoff/push`
- ✅ Buton "Salvează în GitHub" pe pagina developer → commit-uie `HANDOFF_FOR_NEXT_EMERGENT.md` în rădăcina repo-ului
- ✅ 120+ fișiere push-uite în [`dragosserban95/Energy-Project-Design`](https://github.com/dragosserban95/Energy-Project-Design)
- ✅ **Refactor auth → httpOnly Secure SameSite=None cookies** (XSS-safe; token nu mai e în localStorage)
- ✅ **Refactor `verify_documentation()`** (93 linii → modulul `verification.py` cu helper pure-function pentru fiecare check)
- ✅ **Refactor `Developer.jsx`** (185 linii → 1 page + 3 sub-componente focusate: AccessDenied, ResultPanel, Sidebar)
- ✅ **Activare toate 8 industriile**: Gaze (5 subdom), Electrică (5), Apă & canalizare (5), Construcții civile (3), Telecomunicații (3), Fotovoltaice (4), Construcții imobile (5), Infrastructură feroviară (4) = **34 subdomenii active**
- ✅ CORS configurat pentru cookies cross-site (regex pentru `emergentagent.com`, `onrender.com`, `localhost:3000`)

## Handoff (for any AI / human developer)
- Code root: `/app/` (backend `/app/backend`, frontend `/app/frontend`)
- API base: `${REACT_APP_BACKEND_URL}/api` (Kubernetes ingress, all backend routes start with `/api`)
- DB: MongoDB via `MONGO_URL` env var
- Tests: `pytest /app/backend/tests/ -v`
- Restart: `sudo supervisorctl restart backend|frontend`
- Compatible AI agents to continue: Emergent E1, Anthropic Claude, OpenAI ChatGPT, OpenAI Codex/Copilot

### Adding a new industry
1. Add entry in `/app/backend/industries.py` `INDUSTRIES` dict with `status='active'` and subdomains with `active=True`
2. Add system templates in `/app/backend/system_templates.py` (builder + entry in `SYSTEM_TEMPLATES`)
3. No frontend changes needed — `/proiecte` page auto-discovers via `GET /api/industries`

### Adding a new QES provider
1. Implement subclass in `/app/backend/qes_provider.py` (set `status='active'` in `info()`)
2. Register in `PROVIDERS` dict
3. Add credential field schema in `/app/frontend/src/pages/Settings.jsx` `QES_FIELDS`
