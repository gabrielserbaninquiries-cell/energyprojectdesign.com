# Energy Project Design — Progress & Vision Log

## 2026-02-06 — V5.4 Release: Admin Hub + Secondary Email + Tech Offer PDF + Deep Polish

### Implementat în această sesiune
1. **Email business secundar (CC automat)** — câmp `secondary_email` în `User`. La trimiterea oricărui email prin platformă, dacă admin-config-ul are `smtp_cc_secondary_default=True`, adresa companiei utilizatorului este adăugată automat în CC.
2. **Admin-Only Configuration UI** — pagină `/admin/config` (vizibilă doar pentru `is_developer || is_admin`):
   - Mod mentenanță (toggle + mesaj)
   - Banner anunțuri global (4 niveluri: info / succes / warning / danger)
   - SMTP global fallback (from name / Gmail / app password / CC default)
   - Feature flags pentru 6 module (forum, email, PDF, fotovoltaic, AI assistant, payments)
   - Gestionare utilizatori (search, promote/demote admin, ban/unban)
   - Stats globale (utilizatori, admini, proiecte, documente, email-uri, discuții forum)
3. **Generate Tech Offer FV PDF** — buton nou pe pagina Calcul Fotovoltaic care apelează `/api/photovoltaic/tech-offer-pdf` și descarcă o ofertă tehnică A4 premium (hero kWp, ANRE, configurație, producție estimată, conformitate normativă, termeni comerciali, semnături).
4. **Deep UI polish** pe trei pagini-cheie:
   - **FeaturesHub** — hero glass-morphism cu dot-pattern, 10 module cu badge-uri de status (active/parțial/skelet/planificat), search + filter, cards cu hover glow.
   - **IndustriesHub** — hero cu grid-pattern, stats glass cards, search + status filter, cards cu progress bar colorată per industrie.
   - **Forum** — hero gradient cu metrici live (discuții/răspunsuri/like-uri), thread cards cu hover shadow.
5. **Audit logs** — fiecare modificare admin (config update, user update) este persistată în `db.action_logs`.
6. **Public banner endpoint** — `/api/system/banner` returnează mentenanță + anunț + feature flags (oricine, fără auth).

### Backend endpoints noi
| Method | Path | Auth | Descriere |
| --- | --- | --- | --- |
| `GET` | `/api/admin/config` | admin | Get global config |
| `PUT` | `/api/admin/config` | admin | Update config (audit-logged) |
| `GET` | `/api/admin/stats` | admin | Stats platformă |
| `GET` | `/api/admin/users` | admin | List/search users |
| `PATCH` | `/api/admin/users/{id}` | admin | Update role/ban/plan |
| `GET` | `/api/system/banner` | public | Maintenance + announcement |
| `GET` | `/api/photovoltaic/tech-offer-pdf` | user | Download Tech Offer FV PDF |

### Modificări modele
- `User` — adăugate `secondary_email`, `is_admin`, `is_banned`
- Modele noi: `AdminConfig`, `AdminConfigUpdate`, `AdminUserRoleUpdate`
- Colecție nouă: `admin_config` (singleton `{config_id: "global"}`)
- Colecție audit: `action_logs` (persistă fiecare acțiune admin)

### Viziune păstrată / extinsă
- Continuă **structură schelet → polish progresiv** ghidat de listele `/app/memory/LIST_*`.
- Următoarele direcții identificate (nu blocante):
  - Banner global propagat în AppShell pe baza `/api/system/banner` (right now polled lazy by AdminConfig only)
  - Audit log viewer ca tab în AdminConfig
  - Bulk actions pe lista utilizatori (export CSV, mass-ban)
  - Tech Offer PDF — variantă tip pentru gaze naturale (re-folosește `build_tech_offer_fv_pdf` pattern)

### Notă deploy
- Push GitHub: foloseste butonul **"Save to Github"** din chat input (write actions nu sunt suportate direct de agent).
## 2026-02-07 — V5.5 Repository Unification

### Lost feature recovered
- **EnergyAdvisor (Claude Sonnet 4.6 chatbot)** — was deleted before commit `933d02c`, restored from `81b3b77`.
  - Backend: `ai_chatbot.py` (183 LOC) + 5 endpoints in `server.py`.
  - Frontend: `EnergyAdvisor.jsx` (213 LOC) + route `/consultant-ai` + sidebar entry.
  - Models: `ChatbotMessage`, `ChatbotSessionCreate`.

### Audit results
- Cross-checked all 244 commits across `main`, `gh/main`, `gh2/main` — no other lost features.
- All 44 frontend pages already wired into App.js routes.
- All admin/AI/SEAP/CRM/ANAF endpoints wired (`@api.*` pattern).

### Verified
- `POST /api/chatbot/message` returns valid Claude Sonnet 4.6 response with ANRE-correct domain knowledge.
- `/consultant-ai` route correctly enforces auth (redirects to /login when unauth).
- Lint passes (eslint react-hooks/set-state-in-effect resolved via IIFE pattern + scrollIntoView).


## 2026-02-07 — V5.6 Repository Unification + Marketplace
- Restaurat **Job Board ANRE** (`/jobs` public + `/dev/jobs` admin) din commit 933d02c
- Restaurat **Contracte CRM** (`/dev/contracts`) din commit 933d02c
- Restaurat **/api/seap/status** integration health
- Creat `backend/admin_routes.py` (APIRouter) — mutat 9 endpoint-uri /admin/* din server.py
- Creat `backend/marketplace_routes.py` (APIRouter) — 7 endpoint-uri marketplace
- Creat `frontend/pages/Jobs.jsx` (155 LOC) + `Contracts.jsx` (155 LOC)
- Sidebar AppShell.jsx: 2 link-uri noi în secțiunea Business
- `server.py` redus 2406 → ~2150 linii
- VISION_MANIFEST.md actualizat cu "comanda fondatoare" a utilizatorului
- Verificat: 244 commit-uri × 3 remote-uri — zero feature drift rămas

