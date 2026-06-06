# Energy Project Design — PRD

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

## Roadmap

### P0 (next iteration)
- Refactor `server.py` (2060 lines) — extract `/admin/*` into `backend/routes/admin.py` (similar to existing forum.py pattern).
- Consolidate `is_developer` → `is_admin` mapping into `_user_from_doc` only.
- Propagate `/api/system/banner` data into `AppShell` (show maintenance banner globally).

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

## Test Credentials
See `/app/memory/test_credentials.md` — admin (`dragosserban95@gmail.com` / `Test12345`).

## Known Gaps / Mocked
- Forum is functional but lightly populated.
- AI Assistant uses Emergent LLM key — budget should be monitored via Profile → Universal Key.
- Mobile responsive review for AdminConfig table not yet pixel-tuned (works, but could be denser at <640px).
