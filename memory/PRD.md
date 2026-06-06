# Energy Project Design (EPD) — PRD

## Original Problem Statement
Platformă B2B SaaS pentru proiectarea documentațiilor tehnice în energie (gaze, electricitate, fotovoltaice, telecom, feroviar, construcții, apă, salubritate, HVAC, mediu, drumuri/poduri, iluminat public) cu generare DOCX, semnătură electronică calificată (QES), audit, multi-proiect și fluxuri colaborative.

## Architecture
- **Frontend**: React 18 (port 3000), shadcn/ui, react-router v6, Stripe.js, lucide-react, sonner
- **Backend**: FastAPI (port 8001, `/api` prefix), MongoDB
- **Persistență**: MongoDB (`MONGO_URL`, `DB_NAME` din `backend/.env`)
- **Auth**: JWT custom (httpOnly cookies) + Emergent OAuth social login
- **Plăți**: Stripe (TEST keys)
- **Documente**: python-docx (DOCX), reportlab/weasyprint (PDF)

## Restauration Snapshot — 2026-06-06
**Sursa**: GitHub `dragosserban95/Energy-Project-Design` branch `main` (PAT user-provided).
- Local avea doar 5 commits (fragmente auto-commit) — versiunea avansată era pierdută local
- **gh/main** are **232 commits** până la `343cf90` ("V5.2: official version bump + deployment-ready + end-to-end run validated")
- Restaurare: `git checkout gh/main -- .` cu păstrare `.env` protejate
- Backend pornește, login OK, `/api/industries` returnează 13 industrii active

## Current State (V5.2 — restored from GitHub)

### Industries (13 active)
| ID | Nume | Subdomenii |
|---|---|---|
| `gas_engineering` | Inginerie gaze naturale | 5 |
| `electrical_engineering` | Inginerie electrică | 5 |
| `water_sewage` | Apă & canalizare | 5 |
| `civil_engineering` | Inginerie civilă | 3 |
| `telecom` | Telecomunicații | 3 |
| `photovoltaic` | Fotovoltaice | 4 |
| `construction` | Construcții | 5 |
| `railway_infra` | Infrastructură feroviară | 4 |
| `sanitation` | Salubritate | 4 |
| `hvac` | HVAC | 5 |
| `environment` | Mediu | 4 |
| `roads_bridges` | Drumuri & poduri | 5 |
| `public_lighting` | Iluminat public | 4 |

### Backend modules (23)
`ai_assistant`, `ai_developer`, `auth`, `calc_engine`, `company_profile`, `db`, `docx_processor`, `email_sender`, `forum`, `github_push`, `handoff`, `industries`, `models`, `payment_accounts`, `pdf_export`, `plans`, `project_lifecycle`, `qes_provider`, `seap_integration`, `server`, `signing`, `system_templates`, `verification`

### Frontend pages (37)
Landing, Login, Register, Pricing, Termeni, Confidentialitate, GDPR, Dashboard, Projects, Developer (+ chat/github/progres), AdminPaymentAccounts, Forum, CompanyProfile, AuditLogs, ProjectData, TechnicalData, SmartCalc, Verification (`/verifica`), AIAssistant, Audit, Certifications, EmailComposer, Templates (+ editor), Stamps, Certificates, Documents, Settings, IndustriesHub, IndustryDetail, FeaturesHub, FeatureDetail.

### SEO (baseline)
- `public/sitemap.xml` ✅
- `public/robots.txt` ✅ (Sitemap reference)
- `public/index.html` meta description + OpenGraph + Twitter cards ✅
- ❌ JSON-LD Organization/Service schema
- ❌ Dynamic per-route meta tags (react-helmet)
- ❌ Public `/verify/:docId` page (only protected `/verifica` exists)

## Pending Backlog (from Feat-uri.docx user vision)

### 🔴 P0 — Highest priority
1. **Photovoltaic DEEP** (`backend/industries/fotovoltaice/`):
   - 3 categorii ANRE prosumator/producător: `<10 kWp`, `10-27 kWp`, `27-200 kWp`
   - Calcule reale: dimensionare invertor, nr. panouri, secțiune cablu DC/AC, protecții, randament, factor de utilizare
   - Smart DOCX placeholders cu IF/condiții (`{IF Pkw<10: text X ELSE text Y}`)
   - Surse: ANRE Ord. 34/2024, Cod RED, AOR
2. **Public `/verify/:docId` page** + QR code + JSON-LD verification badge
3. **Master Audit Document** consolidat (gap analysis Feat-uri vs V5.2)

### 🟡 P1
4. SEAP daily monitor (cron + email alerts după autorizațiile ANRE companie)
5. AI document recognition (upload PDF/poză → autocomplete câmpuri)
6. Smart placeholders cu calcul AI pentru toate industriile
7. Plan Developer extern (utilizatori își creează propriile tipizate/ștampile)

### 🟢 P2
8. Pagini comunitate: Voluntariat, Brand merch, Inspirational, Art & Collaboration, Sponsori
9. SPV + facturi automate + contabilitate AI
10. Monitorizare AI venituri/cheltuieli
11. Asistent virtual support

### ⚪ P3
12. Mobile app (React Native sau PWA installable)
13. Multilingv (i18n)
14. Închiriere autorizație + parteneriate B2B

## Credentials
- Admin: `dragosserban95@gmail.com` / `Test12345`
- GitHub PAT: stored in user message, used for `gh` remote
- Stripe: TEST keys (preconfigurate)
- Emergent LLM Key: configurat pentru AI chatbot

## Tech Stack Changes
- None — V5.2 restored as-is
