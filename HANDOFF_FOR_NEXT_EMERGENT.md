# 🛟 HANDOFF — Energy Project Design Services
**Snapshot generated:** 2026-06-06 11:24 UTC (original)
**Last updated:** 2026-06-06 12:55 UTC (V5.0 rebuild on new Emergent account)
**Source repo:** https://github.com/dragosserban95/Energy-Project-Design (branch `main`)
**Preview (current Emergent session):** https://energy-sectors-build.preview.emergentagent.com
**Canonical (production target):** design-energy.emergent.host
**Old production target:** https://energy-project-design-services.onrender.com

---

## 🚀 Pentru CONT EMERGENT NOU — prompt unic (UPDATED 2026-06-06 v5.0)

> **Lipește EXACT acest text într-un task Emergent nou și apasă Enter. Atât.**

```
Import comenzi, fisiere, conversatii emergent stocate in repository
dragosserban95/Energy-Project-Design + track page progres building +
continue from last step taken to the end of the script/website final vision.

Citește în această ordine:
1. /app/VISION_MANIFEST.md (viziune locked — APPEND-ONLY)
2. /app/memory/PRD.md (cerințe produs)
3. /app/memory/COMMAND_LOG.md (istoricul comenzilor)
4. /app/memory/STEP_TRACKER.json (unde am rămas)
5. /app/memory/LIST_1_TODO.md (TO-DO curent — execută în ordine)
6. /app/memory/LIST_2_SUGGESTED.md (îmbunătățiri sugerate)
7. /app/HANDOFF_FOR_NEXT_EMERGENT.md (acest fișier)

Apoi:
- Continuă de la primul pas „pending" din STEP_TRACKER.json.
- După FIECARE pas major: append în COMMAND_LOG.md + update STEP_TRACKER.json + arată listele 1 și 2 pentru aprobare.
- Commit în repo (via /api/dev/github/push) după fiecare fază majoră.
- Limba: română. Cont developer: dragosserban95@gmail.com / Test12345 (auto-detectat).
- Lucrează STRICT pe listele 1 și 2. Listele 3 (Out-of-the-box) și 4 (Big Update web research) doar la cerere explicită.
```

### Pași tehnici (după ce AI-ul a importat repo-ul):

1. Configurează `backend/.env` (deja are valori default + Emergent LLM key — vezi `/app/memory/test_credentials.md`).
2. `pip install -r backend/requirements.txt` + `yarn install --cwd frontend`.
3. `sudo supervisorctl restart backend frontend`.
4. Verify: `curl $BACKEND/api/` → `{status:'ok'}` și `curl $BACKEND/api/industries` → 13 industries.

---

## 📊 STATUS LA HANDOFF v5.0 (2026-06-06 12:55 UTC)

| Componentă | Status |
|------------|--------|
| Backend FastAPI | ✅ RUNNING (versiune 4.9, port 8001, 13 industrii catalogate) |
| Frontend React | ✅ RUNNING (port 3000, 32+ pagini, compilat curat) |
| MongoDB | ✅ RUNNING (port 27017, db: `test_database` sau `energy_project_design`) |
| Auth flow | ✅ httpOnly cookies SameSite=None + JWT Bearer fallback |
| 13 industrii UI | ✅ /industrii hub + /industrii/:id skeleton |
| 10 feat-uri viziune | ✅ /feat-uri hub + /feat-uri/:id skeleton (status: planned/partial/skeleton) |
| Developer page | ✅ /developer/progres (7 faze build + 4 list tabs) |
| Sistem tracking | ✅ COMMAND_LOG.md, STEP_TRACKER.json, RESUME_PROMPT.md |
| Cele 4 liste | ✅ LIST_1..4 în /app/memory/ |
| Testing | ✅ Backend 100% (14/14), Frontend 85% (flaky timing pe /industrii, confirmat funcțional via screenshot) |
| GitHub auto-push | ⚠️ Necesită GITHUB_TOKEN în .env (sau push manual din UI /api/dev/github/push) |
| Stripe live | ⏳ Necesită `sk_live_...` (currently `sk_test_emergent`) |
| QES real providers | ⏳ Scaffold only (certSIGN/DigiSign/Trans Sped subclasses to be implemented) |

---

## 🧠 Project vision (PRD.md — full copy)

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

## Industries (13 catalogued — toate active după v5.0 rebuild)
1. ✅ **Gas naturale** — 5 subdomenii active
2. ✅ **Electrică** — 5 subdomenii active
3. ✅ **Telecomunicații** — 3 subdomenii active
4. ✅ **Feroviar** — 4 subdomenii active
5. ✅ **Construcții civile (DTAC)** — 3 subdomenii active
6. ✅ **Fotovoltaice** — 4 subdomenii active
7. ✅ **Apă & canalizare** — 5 subdomenii active
8. ✅ **Salubritate** — 4 subdomenii active
9. ✅ **HVAC** — 5 subdomenii active
10. ✅ **Mediu & avize** — 4 subdomenii active
11. ✅ **Drumuri & poduri** — 5 subdomenii active
12. ✅ **Iluminat public** — 4 subdomenii active
13. ✅ **Construcții imobile (extensie)** — 3 subdomenii active

**TOTAL: 56/56 subdomenii active. Planificate adițional: ~102 (158 grand total — vezi `/app/docs/INDUSTRIES_ROADMAP.md`)**

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


---

## 📜 README

# Energy Project Design Services

B2B SaaS pentru documentație inginerească (gaze naturale, electrice, construcții, etc.) — companie reală: **ENERGY PROJECT DESIGN SRL** (CUI 43151074, J40/12982/2020, București).

🌐 **Live (Render)**: https://energy-project-design-services.onrender.com
🛠 **Preview (Emergent)**: https://template-stamp-hub.preview.emergentagent.com

## Stack

- **Backend**: FastAPI + Motor (MongoDB) + python-docx + reportlab + emergentintegrations (LLM)
- **Frontend**: React 19 + Tailwind + Shadcn/UI
- **Auth**: JWT email/password + Emergent Google OAuth + GDPR consent
- **Payments**: Stripe (EUR)
- **Email**: Per-user Gmail SMTP
- **Digital signatures**: PKCS#12 local + QES scaffold (certSIGN/DigiSign/Trans Sped)

## Functionalities

- Multi-proiect cu industrie + subdomeniu (8 industrii: gaze, electrică, apă, construcții civile, telecom, fotovoltaice, construcții, infrastructură feroviară)
- Date proiect (14 câmpuri) + Calcul inteligent (6 formule)
- Generare DOCX + PDF cu placeholder replacement (`{{var}}` și `<var>`)
- Template-uri sistem (cerere racordare, memoriu tehnic, borderou, adresă OSD, certificare VGD/RTE)
- Email composer cu 7 template-uri + role-based recipients
- AI Assistant (intent parser, 13 intenții) + AI Developer Chat (Plan Mode)
- Internal Certifications (SHA-256 + role + signer + timestamp)
- Audit interfață + GDPR export/delete
- **Developer prompt → GitHub auto-push** (V4.8): logat ca `dragosserban95@gmail.com`, scrii prompt → comită direct în `main` → Render auto-deploy

## Setup local

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # populate secrets
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
yarn install
cp .env.example .env  # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

MongoDB: `mongodb://localhost:27017` (sau MongoDB Atlas în prod).

## Deploy pe Render

1. Conectează acest repo în [Render dashboard](https://dashboard.render.com/select-repo)
2. Render detectează automat `render.yaml` și creează 2 servicii (backend + frontend static)
3. Completează secretele lipsă în Render UI (MONGO_URL, JWT_SECRET, STRIPE_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD, OPENAI_API_KEY, GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GITHUB_TOKEN, EPD_UPDATE_SECRET, DEVELOPER_TEST_PASSWORD)
4. Deploy → URL public: `https://energy-project-design-services.onrender.com`

Pentru MongoDB, recomandare: [MongoDB Atlas Free Tier (M0)](https://www.mongodb.com/cloud/atlas/register).

## Developer prompt → GitHub push

După login ca `dragosserban95@gmail.com` (parolă `Test12345`) → pagina **AI Developer** → scrii prompt-ul de îmbunătățire + lista fișierelor + conținutul nou → API-ul `POST /api/dev/github/push` commit-uie direct pe branch-ul `main`. Render auto-deploy se declanșează în ~30s.

## Licență

Proprietary © ENERGY PROJECT DESIGN SRL 2026.


---

## 🔐 Test credentials

# Test Credentials

## Developer account (lifetime, auto-detected)
- email: dragosserban95@gmail.com
- password: Test12345
- Auto-marked is_developer=true, plan=developer on first register OR login

## Backend env
- STRIPE_API_KEY=sk_test_emergent (in /app/backend/.env)
  - **Production: replace with `sk_live_...` — NO code changes needed**
- MONGO_URL=mongodb://localhost:27017
- Gmail: per-user via /api/users/me PATCH

## App
- URL: https://template-stamp-hub.preview.emergentagent.com
- App: Energy Project Design Services v4.8
- Company: ENERGY PROJECT DESIGN SRL, CUI 43151074, J40/12982/2020

## Auth flow (V4.8+)
- **httpOnly Secure SameSite=None cookies** (XSS-safe — token NEVER in localStorage)
- Login/Register set the `session_token` cookie automatically
- Authorization Bearer header is also supported (backward-compat for curl/testing)
- Logout endpoint clears the cookie and DB session

## Testing examples
```bash
# Login + use cookie for all subsequent calls
curl -c /tmp/c.txt -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}'
curl -b /tmp/c.txt $BACKEND_URL/api/auth/me   # cookie-only auth

# OR use Bearer token (for scripted testing)
TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -H "Authorization: Bearer $TOKEN" $BACKEND_URL/api/auth/me
```

## Note for testing
- Register endpoint requires gdpr_consent=true (Romanian message returned otherwise)
- Active project: each user has one active at a time; switching via POST /api/projects/{id}/activate
- System templates seeded at backend startup (4-6 templates for gas engineering + VGD/RTE)
- All 8 industries are now active (34 subdomains)


---

## 📦 Repo state — ultimele commits

| SHA | Data | Mesaj |
|-----|------|-------|
| `f93bfb6` | 2026-06-06T11:24:28Z | docs(v4.9): PRD + industries roadmap (158 subdomenii planificate) |
| `52d9df9` | 2026-06-06T11:24:27Z | docs(v4.9): PRD + industries roadmap (158 subdomenii planificate) |
| `af9aa66` | 2026-06-06T11:21:24Z | feat(company): company profile + auto-placeholders for DOCX/emails |
| `9b4bc17` | 2026-06-06T11:21:24Z | feat(company): company profile + auto-placeholders for DOCX/emails |
| `a044dcf` | 2026-06-06T11:21:23Z | feat(company): company profile + auto-placeholders for DOCX/emails |
| `1d7b3fc` | 2026-06-06T11:21:22Z | feat(company): company profile + auto-placeholders for DOCX/emails |
| `3f89ef6` | 2026-06-06T11:21:21Z | feat(company): company profile + auto-placeholders for DOCX/emails |
| `02c52d6` | 2026-06-06T11:18:38Z | feat(lifecycle): 12 statuses + weighted audit score + next best action |
| `d90e09d` | 2026-06-06T11:18:38Z | feat(lifecycle): 12 statuses + weighted audit score + next best action |
| `f5d1d00` | 2026-06-06T11:18:37Z | feat(lifecycle): 12 statuses + weighted audit score + next best action |
| `15fcf33` | 2026-06-06T11:18:36Z | feat(lifecycle): 12 statuses + weighted audit score + next best action |
| `7bb80c9` | 2026-06-06T11:14:45Z | feat(forum): community forum with industry filters, threads, replies, likes |

Vezi toate commit-urile: https://github.com/dragosserban95/Energy-Project-Design/commits/main

---

## ⚙️ Backend env keys (`backend/.env`) — valorile redacted, copiază din contul tău

```
MONGO_URL=
DB_NAME=
CORS_ORIGINS=
STRIPE_API_KEY=
JWT_SECRET=
JWT_ALGORITHM=
JWT_EXPIRE_HOURS=
GMAIL_USER=
GMAIL_APP_PASSWORD=
OPENAI_API_KEY=
EPD_AI_MODEL=
DEVELOPER_TEST_EMAIL=
DEVELOPER_TEST_PASSWORD=
GOOGLE_API_KEY=
GOOGLE_CLIENT_ID=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=
EPD_UPDATE_SECRET=
SMTP_FROM_NAME=
TZ=
```

Detalii unde obții fiecare cheie sunt în `backend/.env.example`.

## ⚙️ Frontend env keys (`frontend/.env`)

```
REACT_APP_BACKEND_URL=
WDS_SOCKET_PORT=
ENABLE_HEALTH_CHECK=
```

---

## 🚀 Deployment cu Render (1-click)

1. `render.yaml` e deja în rădăcina repo-ului — auto-detectat de Render.
2. Conectează repo-ul în [Render dashboard](https://dashboard.render.com/select-repo).
3. Setezi secretele în Render UI (env vars).
4. URL public: `https://energy-project-design-services.onrender.com`

## 🤖 Developer prompt → GitHub auto-push

După login ca `dragosserban95@gmail.com` → meniul **// Intern → Push pe GitHub** (`/developer/github`):
- Endpoint backend: `POST /api/dev/github/push` (`backend/github_push.py`)
- Trimite fișiere noi/actualizate → commit pe `main` → Render auto-deploy

---

## 🗂️ Arhitectură pe scurt

```
/app/
├── backend/                 FastAPI + Motor (MongoDB)
│   ├── server.py            Router principal (/api/*)
│   ├── auth.py              JWT email/password + Emergent Google
│   ├── github_push.py       Developer → GitHub commit
│   ├── ai_assistant.py      Intent parser (13 intents)
│   ├── ai_developer.py      Plan Mode (no auto-apply)
│   ├── docx_processor.py    Placeholder replacement {{var}} și <var>
│   ├── pdf_export.py        reportlab
│   ├── calc_engine.py       6 formule (debit, presiune, etc.)
│   ├── qes_provider.py      Mock acum; certSIGN/DigiSign/Trans Sped pending
│   ├── plans.py             Stripe plans (Basic 99 → Societate 2500 + Developer)
│   ├── industries.py        8 industrii (gaze activ; restul coming_soon)
│   └── system_templates.py  6 template-uri pre-seeded
└── frontend/
    └── src/
        ├── App.js
        ├── contexts/AuthContext.jsx
        ├── lib/api.js       axios baseURL = `${REACT_APP_BACKEND_URL}/api`
        └── pages/           ~25 pagini (Dashboard, Projects, ProjectData, ...)
```

---

## ✅ Done / ⏳ Pending / 📦 Backlog

### Done (în această sesiune)
- ✅ Cod complet push-uit în GitHub (`backend/`, `frontend/src/`, `render.yaml`, `.env.example`)
- ✅ Endpoint developer **GitHub auto-push** + pagină `/developer/github` cu UI completă
- ✅ Endpoint **handoff export** (acest fișier!)
- ✅ V4.7 features: PDF export (reportlab), AI Developer Chat, prețuri actualizate (Societate 2500 EUR), industria "Construcții" activată

### Pending (next actions pentru noul user)
- 🔴 **Deploy pe Render**: conectează repo-ul (link mai sus) + setează secretele
- 🟠 **Refactor auth**: localStorage → httpOnly cookies (`AuthContext.jsx`, `auth.py`, `server.py`, `api.js`). Solicitat de Code Review.
- 🟡 **QES real**: certSIGN/DigiSign/Trans Sped subclass — așteaptă contract + API key de la user
- 🟡 **Stripe live key**: schimbă `sk_test_emergent` cu cheia live din .env

### Backlog (P2-P3)
- Encrypt `qes_credentials` la rest (Fernet)
- Refactor `server.py::verify_documentation()` (93 linii)
- Refactor `pages/Developer.jsx` (componentă mare)
- Activare industrii: Electrică / Apă & Canalizare / Telecom / Fotovoltaice / Infrastructură feroviară
- Team workspaces cu role inheritance
- Public verification page `/verify/{doc_id}`

---

## 🧪 Test rapid după preluare

```bash
cd /app
# Backend
curl http://localhost:8001/api/                                # {"status":"ok"...}
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}'

# Frontend
# vizitezi preview URL, te loghezi, vezi meniul "// Intern" cu 3 itemi developer.
```

---

## 📬 Contact

Compania reală: **ENERGY PROJECT DESIGN SRL** · CUI 43151074 · J40/12982/2020 · București.
Limba interfeței: română.

---

_End of handoff. Bună continuare 👋_
