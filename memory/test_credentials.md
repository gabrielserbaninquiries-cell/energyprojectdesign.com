# /app/memory/test_credentials.md

Last updated: 2026-06-21 (V9.0 — rebranding total + demo cap-coadă)

## Live preview URL (READ FROM .env, do not hardcode)
- Current: `https://github-push-test.preview.emergentagent.com`
- Source of truth: `REACT_APP_BACKEND_URL` in `/app/frontend/.env`

## Admin / Developer account (full platform access)
- **Email:** `dragosserban95@gmail.com`
- **Password:** `Test12345`
- **Role:** developer + admin (is_developer=True, is_admin=True)
- **Plan:** developer (gratuit, acces nelimitat)

## Demo Gas Project — END-TO-END CAP-COADĂ (V9.0 enriched)
- **PID:** `gp_e79e2810cc64b5b4`
- **Title:** "Demo End-to-End — Branșament Aurel Vlaicu 15 (V9.0)"
- **Owner:** dragosserban95@gmail.com
- **Fields populate:** 302 (cap-coadă, conform fișierelor atașate de user)
- URL: `/gaze-naturale/gp_e79e2810cc64b5b4`
- Date reale: branșament PE100 SDR11 Dn32, debit 4.5 mc/h, putere 47.7 kW, București

## Backend env (already configured in /app/backend/.env)
- MONGO_URL=mongodb://localhost:27017
- DB_NAME=energy_project_design
- EMERGENT_LLM_KEY (configured)
- PUBLIC_VERIFY_BASE=https://github-push-test.preview.emergentagent.com

## Frontend env (already configured in /app/frontend/.env)
- REACT_APP_BACKEND_URL=https://github-push-test.preview.emergentagent.com

## EPD Brand identity sources
- `/app/frontend/src/lib/brand.js` — single source of truth
- Cover photos oficiale uploadate de user (5 URLs în BRAND_ASSETS)

## Quick test
```bash
TOKEN=$(curl -s -X POST $BACKEND/api/auth/login -H "Content-Type: application/json" -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -H "Authorization: Bearer $TOKEN" "$BACKEND/api/gas-project/gp_e79e2810cc64b5b4/dossier.zip" -o dosar.zip
```

## Test data: alt sample project
- PID: `gp_54135e822f25f7d7` (vechi, semnat, în DB)
