# VISION MANIFEST — Energy Project Design
**Versiunea curentă**: V5.6 — Repository Unification + Marketplace Recovery
**Data sincronizării**: 2026-02-07

---

## 0. Comanda fondatoare (de la utilizator)
> **„Fă acest site ca site principal de lucru în repository. Accesează absolut fără excepție toate fișierele din repository end-to-end, fă o analiză inteligentă a acestora și interpretează toate update-urile vreodată efectuate pushate în repository și integrează toate feat-urile și toate update-urile de pe toate URL-urile publicate sau nu, în acest site."**

Această directivă se adaugă viziunii de bază ca **regulă fondatoare** și **politică de mentenanță**: orice feature care a fost vreodată implementat în orice commit, branch sau URL al acestui repository trebuie să fie funcțional pe site-ul principal. Pierderea de feature în regresii ulterioare este considerată **bug critic** și se restaurează imediat.

---

## 1. Viziune produs (cumulativă)
**Energy Project Design** este SaaS-ul B2B unic pentru proiectarea în energie & infrastructură pentru piața RO. Acoperă întreg lanțul:
- **Proiectare** (calcule + documentație ANRE Ord. 34/2024) pentru 13 industrii
- **Validare** (verificator VGD/RTE + audit interfață)
- **Comunicare** (Forum comunitate, AI Consultant, 4 AI Agents specializați, SMTP per-user)
- **Vânzare** (Marketplace job board, CRM Abonați + Contracte recurente, ANAF e-Factura, Stripe, IBAN SEPA)
- **Compliance** (SEAP/SICAP alerts, audit logs, GDPR consent)

Toate prin **un singur site** (acest repository), cu o singură identitate (StampDoc.ro), un singur cont admin (`dragosserban95@gmail.com`).

---

## 2. Inventar feature-uri implementate (cumulativ — V1 → V5.6)

### Core (V1 → V5.3)
- Autentificare email/parolă (JWT cookie) + Google OAuth Emergent
- CRUD Proiecte cu proiect activ, date tehnice, date fotovoltaice
- Bibliotecă șabloane (.docx) / ștampile / certificate PKI
- Generare DOCX automată (docxtpl) cu placeholder-uri din profilul societății
- Export PDF (ReportLab) — raport proiect generic
- Email Gmail SMTP per-user (App Password) cu attachment
- Stripe checkout (5 planuri: Starter, Pro, Business, Enterprise, Lifetime)
- Calcul fotovoltaic conform ANRE Ord. 34/2024
- Configurare provideri QES (CertSign, DigiSign, Trans Sped)
- Forum comunitate (threads, replies, likes, filtrare per industrie)
- AI Assistant rule-based pentru navigare în aplicație
- 12 industrii cu pagini hub + 13-a adăugată (Iluminat public)

### V5.4 (2026-02-06) — Admin & Polish
- Email secundar de business + CC automat (admin config flag)
- Admin Config UI complet (`/admin/config`): maintenance mode, banner anunțuri, SMTP global, 6 flag-uri funcționalități, management utilizatori (search/promote/ban), audit log
- Public banner & status endpoint (`/api/system/banner`, `/api/system/status`)
- Generate Tech Offer FV PDF (A4 premium cu hero kWp, ANRE category, normativ, terms comerciale)
- Polish UX/UI: FeaturesHub, IndustriesHub, Forum cu glass-morphism + premium SaaS feel

### V5.5 (2026-02-07) — AI Consultant Recovery
- **Restaurat din commit `81b3b77`**: chatbot Claude Sonnet 4.6 cu sesiuni persistente
  - `/api/chatbot/message`, `/api/chatbot/sessions` CRUD
  - Pagină `/consultant-ai` (ProtectedRoute) cu istoric, suggestii, ștergere
  - Modele Pydantic: `ChatbotMessage`, `ChatbotSessionCreate`
- 4 AI Agents specializați (Producer/User/Client/Developer) — `/ai/agents/{agent}` + `/history`
- SEAP Alerts (`/seap/screen`, `/seap/tenders`) cu scoring AI

### V5.6 (2026-02-07) — Repository Unification + Marketplace
- **Restaurat din commit `933d02c`** (Marketplace):
  - **Job Board ANRE** (`/api/dev/jobs` CRUD admin + `/api/jobs` public, no auth) — pagină `/jobs`
  - **Contracte CRM** (`/api/dev/contracts` CRUD) — pagină `/contracts` cu legături la abonați
  - **SEAP integration status** (`/api/seap/status`)
- **Refactor backend** — admin endpoints mutate în `backend/admin_routes.py`:
  - `/admin/config`, `/admin/users`, `/admin/stats`, `/admin/audit-logs`, `/admin/payment-accounts/*`
  - Reduce `server.py` cu ~250 linii; păstrează `get_admin_user` + `_get_admin_config` ca API public
- **Nou modul** `backend/marketplace_routes.py` pentru jobs + contracts + seap/status
- Audit complet **244 commit-uri × 3 remote-uri** (`main`, `gh/main`, `gh2/main`) — confirmat că niciun alt feature nu mai este pierdut

---

## 3. Politica de unitate (NEW — regulă fondatoare)
1. **Single Source of Truth**: acest repository la `https://github.com/dragosserban95/Energy-Project-Design` (remote `gh`).
2. **Single Deployment**: site-ul deployat la `https://energy-project.emergent.host` (production) cu preview la `https://energy-project.preview.emergentagent.com` (dev).
3. **Single Admin** : `dragosserban95@gmail.com` — întotdeauna privilegii developer + admin via `DEVELOPER_EMAILS` seed.
4. **Zero feature drift**: la fiecare iterație nouă se face `git log --all --pretty=format: --name-only --diff-filter=A` și se verifică ca **fiecare fișier vreodată adăugat să existe în repo curent** + **fiecare endpoint `@api.*` vreodată definit să fie raspondent**.
5. **Migration policy**: dacă apar variante derivate ale aplicației (alți utilizatori Emergent ce au fork-uit), feature-urile lor merg PRIN PR în acest repo, nu în repo-uri paralele.

---

## 4. Module funcționale (oglinda Sidebar-ului)

### Operațional
- Panou principal / Proiecte / 13 Industrii / Feat-uri viziune / Date proiect / Date tehnice / Calcul ANRE / Calcul fotovoltaic

### Documentație
- Șabloane (.docx) / Documente generate / Ștampile / Certificate PKI / Certificări interne

### Comunicare & Control
- Email-uri (per-user Gmail + CC secundar auto)
- Forum comunitate (13 industrii)
- **4 AI Agents** (Producer/User/Client/Developer — Claude Sonnet 4.6)
- **Consultant AI (Claude)** — chatbot persistent
- **SEAP Alerts** — scoring licitații
- Verifică documentație ANRE
- AI Assistant (rule-based)
- Audit interfață

### Business
- CRM Abonați (`/crm/subscribers`)
- **Contracte CRM** (`/contracts`) — V5.6
- **Job Board ANRE** (`/jobs`) — V5.6, public + admin
- ANAF e-Factura (XML UBL 2.1)

### Cont
- Profil societate / Planuri Stripe / Registru audit / Setări

### Admin (sidebar admin-only — auto-shown pentru `is_admin`)
- `/admin/config` — global flags
- Status public `/status` (no auth)

---

## 5. Stack tehnic (autoritar)
- **Backend**: FastAPI 0.110+, Python 3.11, Motor async, Pydantic v2, ReportLab, python-docx, Stripe SDK, emergentintegrations (Claude Sonnet 4.6 + Nano Banana + GPT Image 1).
- **Frontend**: React 18 + React Router 6 + Tailwind CSS + Shadcn UI + lucide-react + sonner toasts.
- **DB**: MongoDB. Colecții: `users`, `projects`, `documents`, `templates`, `stamps`, `certificates`, `admin_config`, `action_logs`, `forum_threads`, `forum_replies`, `payment_transactions`, `payment_accounts`, `email_logs`, `seap_tenders`, `subscribers`, `contracts`, `jobs`, `chatbot_sessions`, `ai_agent_messages`.

---

## 6. Roadmap V5.7+
### P0 (next iteration)
- Push automat → GitHub `gh/main` via "Save to GitHub" feature (PAT existent în env e 401, necesită refresh).
- UI rafinat pentru `/contracts` și `/jobs` cu filtre avansate (industrie, status, valoare).

### P1
- BIM Integration (Revit/AutoCAD plugin export DXF/RVT).
- Real-time collaborative design canvas (multiplayer pentru schițe ANRE).
- Mobile responsive review pentru `/admin/config` și AI Agents la <640px.
- Developer SDK + API access tier.

### P2 (futurist)
- Mobile apps native (iOS + Android).
- Marketplace plugins terți (modul community).
- Voluntariat (CSR tracking pentru companii).

---

## 7. Test credentials (regăsiți în `/app/memory/test_credentials.md`)
- Admin / Developer: `dragosserban95@gmail.com` / `Test12345`

---

**Acest document este viziunea oficială a produsului. Orice agent care preia repo-ul TREBUIE să-l respecte ca sursă de adevăr.**
