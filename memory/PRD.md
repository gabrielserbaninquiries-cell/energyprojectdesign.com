# Energy Project Design — PRD


## CHANGELOG — 2026-06-08 (V6.1) — AVIZE HUB + 17 Templates + Custom Upload

### Context
Continuare a V6.0. User a explicitat că platforma trebuie să simuleze o firmă de proiectare gaze (20 angajați → 1-2) și să aibă TOATE fazele unei lucrări reale + flow per aviz + posibilitate upload template-uri tipizate.

### Backend EXTINS
- **`/app/backend/gas_doc_templates.py`** — extins de la 8 la **17 template-uri**:
  - +9 noi: cerere_aviz_apa, cerere_aviz_electrica, cerere_aviz_drumuri, cerere_aviz_politie, cerere_aviz_mediu, cerere_aviz_iscir, anunt_incepere, predare_amplasament, dispozitie_santier
  - Toate cu antet companie real, anexe legale, cadru juridic citat per document
- **NOU `/app/backend/gas_avize_catalog.py`** — Registry de **13 avize** cu:
  - Emitent, cadru legal, template DOCX legat, anexe obligatorii, câmpuri extra
  - Condiționale dinamice: `applies_if(project_data) → bool`
  - Exemple: aviz_drumuri/politie apar DOAR dacă `traseu_pe_drum=Da`; aviz_iscir apare DOAR dacă `are_centrala_termica=Da`
  - 7 mandatorii + 6 condiționale = max 13 per proiect

### Endpoints NOI V6.1
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/gas-project/avize-catalog` | public | Toate 13 avize cu metadata |
| `GET` | `/api/gas-project/{pid}/avize` | user | Avize APLICABILE pentru proiect (calculate condiționat) + status |
| `PATCH` | `/api/gas-project/{pid}/avize/{aviz_id}` | user | Update status: planificat/cerut/primit/respins + sent_to + received_pdf_b64 |
| `GET` | `/api/gas-project/{pid}/avize/{aviz_id}/dossier.zip` | user | ZIP cu cererea DOCX + manifest anexe legale per aviz |
| `GET` | `/api/gas-project/custom-templates` | admin | Lista template-uri DOCX încărcate de admin |
| `POST` | `/api/gas-project/custom-templates` | admin | Upload DOCX custom (max 5MB) cu label + opțional replaces_template_id |
| `GET` | `/api/gas-project/custom-templates/{tid}/download` | admin | Download original |
| `DELETE` | `/api/gas-project/custom-templates/{tid}` | admin | Soft-delete |

### Frontend NOU V6.1
- **GasNaturalProject.jsx** — adăugat panou `GasAvizeHub` (170 LOC):
  - Listă 12 avize aplicabile, status colorat (planificat=gray, cerut=blue, primit=green, respins=red)
  - 3 cards statistici: Obținute / În curs / De solicitat
  - Click pe aviz → expand cu: anexe legale necesare + 3 butoane (ZIP cerere, Marchează cerut/primit/respins)
  - data-testid: `gas-avize-hub`, `gas-aviz-item-{id}`, `gas-aviz-download-{id}`, `gas-aviz-mark-sent-{id}`, `gas-aviz-mark-received-{id}`

### Testing E2E V6.1
- **9/9 pytest pass** (`tests/test_v60_gas_documentation.py`):
  - test_v60_health_and_catalog
  - test_v61_avize_catalog (verifică toate 13 avize prezente)
  - test_v61_avize_per_project_conditional (condiționale: drumuri/politie/iscir apar/dispar dinamic)
  - test_v61_doc_templates_extended (toate 17 template-uri)
  - test_v61_custom_template_upload_admin_only (admin upload DOCX → list → download → delete)
  - test_v60_validator_cnp_cui
  - test_v60_calc_engine
  - test_v60_full_flow_gas_documentation
  - test_v60_full_flow_idempotent
- Frontend verificat live: 17 doc btns + 12 avize items + 1 dossier panel + 1 avize hub — toate rendate.

### Workflow real "20 angajați → 1"
Acum un proiectant poate, pentru un SINGUR proiect:
1. Completa o singură dată câmpurile centralizate (beneficiar, adresă, CU, ATR, executant, etc.).
2. Vede ÎN MOD AUTOMAT cele 7-12 avize aplicabile (în funcție de traseu pe drum, centrală, etc.).
3. Generează ZIP-uri per fiecare aviz (cerere DOCX populată + manifest anexe).
4. Marchează "cerut" → "primit" cu nr. de aviz primit.
5. Generează automat dosarul DTAC complet (ZIP 17 documente).
6. Semnează digital SHA-256 + QR public.
7. Admin/developer poate încărca template-uri DOCX tipizate proprii care înlocuiesc cele built-in.

### Repo-uri externe (situația finală)
- ✅ Clonat și auditate 4 repo-uri externe: `dragos`, `gne`, `visa`, `sparle`
- ✅ Integrate fișiere unice din `gne`: `validators_ro.py` (CNP/CUI ANAF) + `qr_generator.py`
- 🟡 Restul repo-urilor = duplicate ale codului V5.x deja prezent în /app

### Limitări / În aşteptare
- Email trimitere automată per-aviz: există flux generic (POST /gas-project/{pid}/phase/{phase_id}/dispatch) dar nu specializat per aviz. Următoarea iterație.
- VGD/RTE real provider scaffold rămâne pentru P1.
- Polish UI vizual (animații, hero modern) — momentan rămâne brutalist Swiss.


## CHANGELOG — 2026-06-08 (V6.0) — Gas Documentation Studio COMPLET (turbo session)

### Context
- Sesiunea s-a deschis fără .env (MONGO_URL, REACT_APP_BACKEND_URL lipseau) → 5 minute pierdute pentru restaurare.
- Cele 4 repo-uri externe au fost clonate în `/tmp/repos/{dragos,gne,visa,sparle}` (sparle nu are backend).
- `gne` = singurul cu modul unic util: `validators_ro.py` (CNP/CUI ANAF) + `qr_generator.py`.

### Backend NOU
- **`/app/backend/gas_doc_templates.py`** (713 LOC) — Engine de generare 8 template-uri DOCX legale conform NTPEE 2018 + HG 907/2016 + L 50/1991 + Ord. ANRE 89/2018 + 162/2021 + HG 273/1994 + Ord. MLPAT 770/1997:
  1. `cerere_cu` — Cerere Certificat de Urbanism (Legea 50/1991)
  2. `cerere_atr` — Cerere Aviz Tehnic Racordare către OSD (Ord. ANRE 89/2018)
  3. `memoriu_tehnic` — Memoriu Tehnic Justificativ (HG 907/2016 + NTPEE 2018) cu calc auto-integrat Renouard
  4. `caiet_sarcini` — Caiet de Sarcini Execuție (NTPEE 2018 cap. 4)
  5. `borderou` — Borderou piese scrise + desenate (HG 907/2016)
  6. `cerere_pif` — Cerere Punere în Funcțiune (Ord. ANRE 162/2021)
  7. `pv_receptie` — Proces Verbal de Recepție la Terminarea Lucrărilor (HG 273/1994)
  8. `carte_tehnica` — Cartea Tehnică a Construcției (4 secțiuni obligatorii, HG 273/1994 + Ord. MLPAT 770/1997)
- Toate template-urile folosesc:
  - Placeholdere dinamice din `proj.data`
  - Condiționale `if` simple (afișează blocuri doar dacă câmpul e completat)
  - Antet companie real Energy Project Design SRL (CUI 43151074, atestat PDD/2022/0001)
  - Auto-calc engine integrat (Renouard, simultaneitate Ks, dimensionare DN)
  - Footer semnătură + hash SHA-256
- **`/app/backend/validators_ro.py`** (din `gne`) — Algoritm ANAF pentru CNP (13 cifre + pondere) și CUI (2-10 cifre + pondere [7,5,3,2,1,7,5,3,2])
- **`/app/backend/qr_generator.py`** (din `gne`) — Utilitar QR (deja existent ca qrcode în gas_project_routes)

### Endpoints noi
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/gas-project/doc-templates` | public | Lista celor 8 template-uri DOCX disponibile |
| `POST` | `/api/gas-project/validate` | public | Validare CNP/CUI conform algoritmi ANAF |
| `GET` | `/api/gas-project/{pid}/doc/{template_id}` | user | Download DOCX populat cu datele proiectului |
| `GET` | `/api/gas-project/{pid}/dossier.zip` | user | Download ZIP cu toate 8 documente + manifest legal |

### Frontend NOU
- **GasNaturalProject.jsx** — adăugat panou `GasDossierPanel` (90 LOC) sub semnătură:
  - Buton mare amber "Descarcă DOSAR complet (ZIP — 8 DOCX)"
  - Listă cu 8 butoane individuale (download DOCX per template)
  - data-testid: `gas-dossier-panel`, `gas-download-dossier-btn`, `gas-download-doc-{template_id}`
- Filename HTTP sanitizate ASCII (era 500 din cauza diacriticelor în Content-Disposition).

### .env restaurat
- `/app/backend/.env` — MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY, PUBLIC_VERIFY_BASE (preview Emergent), DEVELOPER_TEST_EMAIL=dragosserban95@gmail.com / Test12345
- `/app/frontend/.env` — REACT_APP_BACKEND_URL=https://57bd020b-829b-4403-b2b9-09912868b634.preview.emergentagent.com

### Testing E2E V6.0
- **`/app/backend/tests/test_v60_gas_documentation.py`** — 5 teste pytest, 5/5 passed:
  - test_v60_health_and_catalog
  - test_v60_validator_cnp_cui (CUI Energy Project Design 43151074 = valid)
  - test_v60_calc_engine (simultaneitate, Renouard, adâncime pozare)
  - test_v60_full_flow_gas_documentation (create → sign SHA-256 → QR → 8 DOCX + ZIP, fiecare DOCX > 10KB)
  - test_v60_full_flow_idempotent
- Frontend verificat live: 1 panel + 1 main btn + 8 individual doc btns + sign btn — toate prezente.

### GAP-uri legale identificate înainte de V6.0
- 🔴 Zero templates DOCX seed pentru cele 11 faze → REZOLVAT (8 template-uri)
- 🔴 Lipsea Cartea Tehnică (obligatorie pentru recepție) → REZOLVAT
- 🔴 Lipsea Cerere PIF formală → REZOLVAT
- 🟡 Lipseau validatori CNP/CUI → REZOLVAT prin import din gne
- 🟢 Calc engine deja complet (Renouard, simultaneitate, dimensionare)
- 🟢 Semnătură SHA-256 + QR + verify public deja existau

### Limitări/În aşteptare
- Repo-urile externe `globalnatureexperiences-rgb/energyprojectdesign.com` și `visanimamomentum/energyprojectdesign.com` au structură IDENTICĂ cu /app (V5.x). Aproape nimic unic.
- Frontend Gas Studio funcțional dar fără polish vizual nou (rămâne styled brutalist Swiss cu amber #FFB300).


## CHANGELOG — 2026-02-07 (V5.9) — Repo unification & public verification

### Backend (din repo dragosserban95/Energy-Project-Design clonat)
- **Clients CRM** (`clients_crm.py`, legacy per-user) — endpoints `/api/clients` cu CRUD complet, filtre status+industry.
- **Companies Directory** (`companies_directory.py`, public) — endpoints `/api/companies/{roles,stats,list,CRUD}` cu 8+ roluri (designer, executor, vgd, rte, etc.). Auto-verified pentru developers.
- Toate mountate prin `api2` router în server.py.

### Frontend
- **Clients.jsx** (per-user CRM proiectanți) și **Companies.jsx** (directory public) — copiate din repo.
- **VerifyGasProject.jsx** NOU — pagină publică `/verify/gas-project/:pid` (URL din QR-ul proiectului):
  - Card de verificare cu status semnat/draft, beneficiar, locație, faza, hash SHA-256
  - Pagină de eroare elegantă pentru PID inexistent
  - Fără auth — accesibilă oricui scanează QR-ul
- **Sidebar**: adăugat "Clienți (Proiectanți)" și "Companii (Directory)"
- **App.js routes**: `/clients`, `/companies`, `/verify/gas-project/:pid`

### Testing
- **iteration_4.json**: Backend 10/10 pytest, Frontend 100% pe toate selectoarele
- Test file: `/app/backend/tests/test_v59_features.py`
- 0 bug-uri. Code review note: server.py la 2390 linii — refactor recomandat în următoarea iterație.


## CHANGELOG — 2026-02-07 (V5.8) — Gas Project Studio + Subscribers + Rate Limiting

### Backend
- **Rate limiting AI Agents**: POST `/api/ai/agents/{agent}` cu cooldown per user (8/min, 60/zi pentru utilizatori; 30/min, 500/zi pentru admin/developer). Returnează 429 cu mesaj RO + obiect `rate_limit` în răspuns success.
- **Modul Gas Project Studio** (`gas_project_routes.py` + `gas_project_phases.py`):
  - 11 faze legale conform NTPEE 2018 + HG 907/2016: tema → SF → CU+Avize → DTAC → AC → PT → DE → Execuție → Probe → Recepție → PIF
  - 78 câmpuri variabile total per proiect (beneficiar, debit, presiune, materiale, atestate ANRE, etc.)
  - Endpoints: `GET /phases`, `POST /`, `GET /`, `GET /{pid}`, `PATCH /{pid}`, `DELETE /{pid}`, `POST /{pid}/sign`, `GET /{pid}/qr`, `GET /{pid}/public`
  - **Semnătură digitală**: SHA-256 hash + integrare cu ștampile încărcate (`/api/stamps`)
  - **QR code** generat dinamic (qrcode lib) cu URL public de verificare
  - Gate: semnătura blocată sub 70% completare proiect
- **Modul Subscribers B2B** (`subscribers_routes.py`):
  - 5 tipuri: primarie / asociatie_locatari / utilitate_publica / dezvoltator / societate
  - CRUD complet, filtrare după tip

### Frontend
- **GasNaturalProject.jsx** (Studio):
  - List view cu card-uri (progress bar, status semnat/draft)
  - Studio view cu sidebar 11 faze, formular dinamic, progress bar per fază + global, deliverables box
  - Preview mode (read-only tabular pentru toate fazele)
  - QR modal cu download PNG + Escape-to-close
  - Sign panel cu selector ștampilă din contul user
- **Subscribers.jsx**: 5 type cards, filter pills, create modal, list cards
- **Routing**: `/gaze-naturale`, `/gaze-naturale/:pid`, `/subscribers`
- **Sidebar**: adăugat "Gaze Naturale Studio" (nav-gaze-naturale) + "Subscriberi B2B" (nav-subscribers)

### Testing
- **iteration_3.json**: Backend 5/5 pytest passed, Frontend 100% pe toate selectoarele V5.8
- Test file: `/app/backend/tests/test_v58_features.py`
- 0 bug-uri critice. Fix aplicat: QR modal Escape-key close.


## CHANGELOG — 2026-02-07 (V5.7)
- **Branding global**: înlocuit "StampDoc.ro" cu "Energy Project Design" în Login, Register, LegalLayout, Gdpr, Settings, TemplateEditor.
- **Login hero text**: "Energy Project Design — international electronic technical documentation, certified and digitally stamped." (cerere directă utilizator)
- **SEO meta tags extinse** (`/app/frontend/public/index.html`): title nou, description bilingv multi-industrie, 50+ keywords (ANRE/ANRSC/ISCIR/NTPEE/VGD/RTE/QES/SEAP), 13 hashtag-uri ca `article:tag`, geo/locale RO+EN, theme-color #FFB300, OG + Twitter Cards aliniate la noul brand.
- **Sitemap.xml** extins: 13 industrii + 5 persona pages + 5 subdomenii gaze + pagini funcționale (jobs, marketplace, ai-agents, anaf, crm, energy-advisor).
- **Personas pages** noi (`/pentru/:role`) pentru Clienți, Utilizatori, Angajați, Developeri, Admin — fiecare cu beneficii, pagini utile, hashtag-uri. Component: `/app/frontend/src/pages/Personas.jsx`.
- **Landing hero refăcut** pentru poziționare internațională multi-industrie (13 industrii / 56+ subdomenii / QES) + secțiune "5 perspective" cu link-uri către persona pages.
- **Sidebar**: "Industrii (12)" → "Industrii (13)".
- Surse: `/app/esitmate.rar` extras în `/app/esitmate_extracted/` (58 fișiere: site.docx, Feat-uri.docx, prompt nou.docx, etc.).
- **Testing V5.7**: testing_agent_v3_fork iteration_2 — Backend 14/14 pytest passed, Frontend 100%. Suite: `/app/backend/tests/test_v57_features.py`.
- **AI Agents per persona confirmat funcțional**: 4 agenți (Producer/User/Client/Developer) deja implementați în `/app/backend/ai_agents.py` cu Claude Sonnet 4.6 via Emergent LLM Key + UI `/app/frontend/src/pages/AIAgents.jsx`. Răspunsuri live verificate prin curl + UI.


## Product Vision
B2B SaaS pentru proiectare în energie/infrastructură. Centralizează proiectarea ANRE, calcule tehnice (fotovoltaic, gaze, electric), generare automată documentație, semnătură digitală QES și marketplace de subdomenii (12 industrii + 158 subdomenii planificate).

Limba interfeței: **Română**.

## Tech Stack
- **Backend**: FastAPI 0.110+, Python 3.11, Motor (MongoDB async), Pydantic v2, ReportLab (PDF), python-docx (DOCX), Gmail SMTP.
- **Frontend**: React 18, React Router 6, Tailwind CSS, Shadcn UI, lucide-react icons, sonner toasts.
- **DB**: MongoDB (collections: users, projects, documents, templates, stamps, certificates, payment_transactions, forum_threads, action_logs, admin_config).
- **Integrări**: Stripe (payments), Gmail SMTP (email), Emergent LLM (AI assistant), ReportLab (PDF), ANRE catalog.

## User Personas
1. **Proiectant autorizat ANRE** — generează documentație tehnică pentru proiecte de gaze/electric/fotovoltaic.
2. **Firmă executantă** — primește documentația semnată QES și o transmite autorităților.
3. **Verificator VGD/RTE** — analizează și parafează documente; folosește forumul.
4. **Admin platformă** — configurare globală, gestionare utilizatori, monitorizare.

## Architecture
- All backend routes prefixed `/api`. Frontend uses `REACT_APP_BACKEND_URL` env var.
- Routing: protected routes wrap auth check. Sidebar in `AppShell` is role-aware (developers/admins see Admin Config + Developer Plan).
- DOCX generation pipeline: template (.docx) + data dict → docxtpl → response file.
- PDF generation: ReportLab `SimpleDocTemplate` with custom `_header`, themed palette (`#FFB300`/`#0A0A0A`/`#16A34A`).
- Email pipeline: per-user Gmail App Password → SMTP_SSL 465 with automatic CC to user's `secondary_email` based on global admin flag.

## Implemented Features (cumulative — see CHANGELOG via PROGRESS_LOG.md)

### Core (V1-V5.3)
- Auth (email/password JWT + Google OAuth)
- Project management (CRUD, active project, technical data, photovoltaic data)
- Template/stamp/certificate library
- DOCX document generation
- PDF export (generic project report)
- Gmail SMTP email with attachment
- Stripe checkout flows
- Photovoltaic calculation engine (ANRE Ord. 34/2024 compliant)
- QES providers config (CertSign, DigiSign, Trans Sped)
- Forum (threads, replies, likes, industry filtering)
- AI Assistant (Emergent LLM-powered)
- 12 industries hub + per-industry pages

### V5.4 (2026-02-06) — Admin & Polish Release
- **Secondary Business Email**: `User.secondary_email` field; auto-CC on all outgoing email when `admin_config.smtp_cc_secondary_default=True`.
- **Admin-Only Configuration UI** at `/admin/config`:
  - Maintenance mode toggle + message
  - Announcement banner (info/success/warning/danger)
  - Global SMTP fallback (from name, Gmail, App Password — write-only)
  - 6 feature flags (forum, email, PDF, photovoltaic, AI, payments)
  - User management (search, promote/demote admin, ban/unban)
  - Live platform stats
- **Audit log**: every admin action persisted in `db.action_logs`.
- **Public banner endpoint**: `/api/system/banner` (no auth) — clients can poll for maintenance + announcement.
- **Generate Tech Offer FV PDF**: button on Photovoltaic Calc page → `/api/photovoltaic/tech-offer-pdf` returns a commercial-grade A4 PDF (hero kWp, ANRE category, full component config, energy estimation, normative compliance, commercial terms, signature blocks).
- **Deep UX polish** on FeaturesHub, IndustriesHub, Forum: glass-morphism heroes, dot/grid patterns, status badges, search + filters, progress bars, hover glow.

### V5.6 (2026-02-07) — Repository Unification + Marketplace Recovery
- **Comandă fondatoare**: "Acces fără excepție la toate fișierele, integrare a tuturor update-urilor de pe toate URL-urile" → consemnată în `/app/memory/VISION_MANIFEST.md`.
- **Restaurat din commit `933d02c`** (Marketplace pierdut):
  - `/api/dev/jobs` (admin CRUD) + `/api/jobs` (public, no auth) — Job Board ANRE
  - `/api/dev/contracts` (admin CRUD) — Contracte CRM cu legături la abonați
  - `/api/seap/status` — integration health
- **Refactor `server.py`**: mutat în `backend/admin_routes.py`:
  - `/admin/config` (GET/PUT), `/admin/users` (GET/PATCH), `/admin/stats`, `/admin/audit-logs`, `/admin/payment-accounts/*`
  - server.py redus de la 2406 la ~2150 linii
- **Nou modul**: `backend/marketplace_routes.py` cu APIRouter pentru jobs + contracts + seap status
- **Frontend nou**: `Jobs.jsx` + `Contracts.jsx` cu testid-uri și forma de creare admin
- **Sidebar updates**: 2 link-uri noi în secțiunea Business

### V5.5 (2026-02-07) — Repository Unification + Lost Features Recovery
- **Deep repository audit**: scanned all 244 commits across `main`, `gh/main`, `gh2/main` for ever-implemented files; confirmed local copy is strictly ahead.
- **EnergyAdvisor (Claude Sonnet 4.6) restored** from commit `81b3b77` (lost in a regression):
  - `/app/backend/ai_chatbot.py` — chat sessions persistence in `db.chatbot_sessions`, LLM via emergentintegrations.
  - `/app/frontend/src/pages/EnergyAdvisor.jsx` — full session UI (history sidebar, suggestions, delete).
  - 5 new endpoints: `POST /api/chatbot/message`, `GET/POST /api/chatbot/sessions`, `GET/DELETE /api/chatbot/sessions/{id}`.
  - Sidebar link "Consultant AI (Claude)" → route `/consultant-ai` (ProtectedRoute).
  - Models added: `ChatbotMessage`, `ChatbotSessionCreate`.

## Roadmap

### P0 (next iteration)
- Refactor `server.py` (2400+ lines) — extract `/admin/*` into `backend/routes/admin.py` (similar to existing forum.py pattern).
- Consolidate `is_developer` → `is_admin` mapping into `_user_from_doc` only.
- Push to GitHub via "Save to Github" (PAT in env returns 401; user action required).

### P1 (planned)
- SEAP/SICAP alerts AI agent.
- 4 specialized AI agents (Producer/User/Client/Developer).
- Subscribers/contracts CRM with recurring fees.
- Job marketplace for autorizati ANRE.
- Automated reports + ANAF e-Factura integration.
- Legal document automation (contracts, notary submissions).
- Brand merchandise + partner network.
- Voluntariat (CSR tracking).
- Developer SDK + API access tier.

### P2 (futurist — opt-in)
- Mobile apps (iOS + Android).
- Real-time collaborative design canvas.
- BIM integration (Revit/AutoCAD).

## Key DB Schema (current)
```
users           : { user_id, email, name, password_hash?, auth_provider, plan, gmail_user?, gmail_app_password?, secondary_email?, is_developer, is_admin, is_banned, qes_provider?, qes_credentials?, active_project_id?, gdpr_consent, created_at }
projects        : { project_id, user_id, name, beneficiar, ..., photovoltaic_data?, photovoltaic_results?, technical_data?, created_at }
admin_config    : { config_id:"global", smtp_from_name, smtp_global_user?, smtp_global_password?, smtp_cc_secondary_default, feature_*_enabled (6 flags), maintenance_mode, maintenance_message, announcement_banner, announcement_level, updated_at, updated_by }
action_logs     : { log_id, user_id, action, details, created_at }
forum_threads   : { thread_id, author_id, author_name, industry, title, body, tags, pinned, is_developer_post, reply_count, likes, views, last_activity_at }
documents       : { doc_id, user_id, project_id, name, content_bytes, created_at }
payment_transactions : { tx_id, user_id, stripe_session_id, plan, amount, status, created_at }
```

## Key API Endpoints (V5.4 admin)
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/admin/config` | admin | Read global config |
| `PUT` | `/api/admin/config` | admin | Update + audit-log |
| `GET` | `/api/admin/stats` | admin | Counters |
| `GET` | `/api/admin/users` | admin | List/search (limit, search) |
| `PATCH` | `/api/admin/users/{id}` | admin | Updates + returns updated user |
| `GET` | `/api/system/banner` | public | Maintenance + announcement |
| `GET` | `/api/photovoltaic/tech-offer-pdf` | user | Premium PDF download |
| `PATCH` | `/api/users/me` | user | Now accepts `secondary_email` |
| `GET` | `/api/users/me/email-config` | user | Now returns `secondary_email` |
| `POST` | `/api/chatbot/message` | user | Energy Consultant AI (Claude Sonnet 4.6) reply |
| `GET` | `/api/chatbot/sessions` | user | List user chat sessions |
| `POST` | `/api/chatbot/sessions` | user | Create empty session |
| `GET` | `/api/chatbot/sessions/{id}` | user | Get session with messages |
| `DELETE` | `/api/chatbot/sessions/{id}` | user | Delete session |
| `GET/POST` | `/api/dev/jobs` | admin | Job Board ANRE CRUD |
| `DELETE` | `/api/dev/jobs/{job_id}` | admin | Delete job posting |
| `GET` | `/api/jobs` | public | Public jobs feed (no auth) |
| `GET/POST` | `/api/dev/contracts` | admin | Contracts CRM CRUD |
| `DELETE` | `/api/dev/contracts/{ctr_id}` | admin | Delete contract |
| `GET` | `/api/seap/status` | admin | SEAP integration health |
| `GET/PUT` | `/api/admin/config` | admin | **Moved to admin_routes.py** |
| `GET/PATCH` | `/api/admin/users` | admin | **Moved to admin_routes.py** |
| `GET` | `/api/admin/stats` | admin | **Moved to admin_routes.py** |
| `*` | `/api/admin/payment-accounts/*` | admin | **Moved to admin_routes.py** |

## Test Credentials
See `/app/memory/test_credentials.md` — admin (`dragosserban95@gmail.com` / `Test12345`).

## Known Gaps / Mocked
- Forum is functional but lightly populated.
- AI Assistant uses Emergent LLM key — budget should be monitored via Profile → Universal Key.
- Mobile responsive review for AdminConfig table not yet pixel-tuned (works, but could be denser at <640px).
