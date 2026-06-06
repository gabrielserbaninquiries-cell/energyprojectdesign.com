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
