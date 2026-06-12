# /app/memory/test_credentials.md

Last updated: 2026-06-12 (V8.5)

## Live preview URL (READ FROM .env, do not hardcode)
- Current: `https://github-push-test.preview.emergentagent.com`
- Source of truth: `REACT_APP_BACKEND_URL` in `/app/frontend/.env`

## Admin / Developer account (full platform access)
- **Email:** `dragosserban95@gmail.com`
- **Password:** `Test12345`
- **Role:** developer + admin (is_developer=True, is_admin=True)
- **Plan:** developer (gratuit, acces nelimitat)

## Test Gas Project (pre-populated, owned by admin)
- **PID:** `gp_e79e2810cc64b5b4`
- Pre-populated with ~50 fields incl. registry + ntpee + legal docs
- URL: `/gaze-naturale/gp_e79e2810cc64b5b4`

Use this account to test:
- `/admin/config` page (Admin-Only Configuration UI)
- All endpoints under `/api/admin/*`
- Secondary business email CC behaviour
- Tech Offer FV PDF download
- **Gas Documentation Studio** (V6.0) — 8 DOCX templates, ZIP dossier, signature
- `/gaze-naturale` listing, `/gaze-naturale/{pid}` studio

## Backend env (already configured in /app/backend/.env)
- MONGO_URL=mongodb://localhost:27017
- DB_NAME=energy_project_design
- EMERGENT_LLM_KEY (configured)
- PUBLIC_VERIFY_BASE=https://57bd020b-829b-4403-b2b9-09912868b634.preview.emergentagent.com

## Frontend env (already configured in /app/frontend/.env)
- REACT_APP_BACKEND_URL=https://57bd020b-829b-4403-b2b9-09912868b634.preview.emergentagent.com

## Sample gas project for testing
- PID: `gp_54135e822f25f7d7` (already created, signed, in DB)
- Title: "Test Branșament Casnic Strada Aurel Vlaicu nr.15"
- Status: signed (SHA-256 hash visible in UI)

## Quick test
```bash
TOKEN=$(curl -s -X POST $BACKEND/api/auth/login -H "Content-Type: application/json" -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -H "Authorization: Bearer $TOKEN" "$BACKEND/api/gas-project/gp_54135e822f25f7d7/dossier.zip" -o dosar.zip
```
