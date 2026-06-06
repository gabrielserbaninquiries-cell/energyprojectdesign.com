# Test Credentials — EPD

## Developer account (auto-detected lifetime)
- email: `dragosserban95@gmail.com`
- password: `Test12345`
- Auto-marked `is_developer=true`, `plan=developer` on register OR login.

## Backend env
- `STRIPE_API_KEY=sk_test_emergent` — test mode
- `MONGO_URL=mongodb://localhost:27017`
- `EMERGENT_LLM_KEY=sk-emergent-cD272AaF4F168B72f5` — universal LLM key
- `JWT_SECRET=epd-secret-2026-...`

## App
- Preview URL: https://energy-sectors-build.preview.emergentagent.com
- Canonical (deploy target): design-energy.emergent.host
- Backend: FastAPI v4.9 — `/api/*` prefix
- Frontend: React 19 + Tailwind + Shadcn/UI

## Auth flow
- httpOnly Secure SameSite=None cookies (XSS-safe — token NEVER in localStorage).
- Login/Register set `session_token` cookie automatically.
- Authorization Bearer header is also supported (backward-compat for curl/testing).
- Logout endpoint clears the cookie and DB session.

## cURL testing
```bash
BACKEND_URL=https://energy-sectors-build.preview.emergentagent.com

# Register (Romanian message error on missing gdpr_consent)
curl -X POST $BACKEND_URL/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345","name":"Dragos Serban","gdpr_consent":true}'

# Login (cookie + token)
curl -c /tmp/c.txt -X POST $BACKEND_URL/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}'

# Get me (using cookie)
curl -b /tmp/c.txt $BACKEND_URL/api/auth/me
```

## Notes
- Register endpoint requires `gdpr_consent=true` (Romanian message returned otherwise).
- Active project: each user has one active at a time; switching via POST /api/projects/{id}/activate.
- System templates seeded at backend startup (6 templates for gas engineering + VGD/RTE).
- All 13 industries are now active (catalog).
