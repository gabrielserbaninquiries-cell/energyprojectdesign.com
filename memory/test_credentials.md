# Energy Project Design — Test Credentials (V10.2)

Last updated: 2026-06-21 (V10.2 — focus Gaze Naturale + credentials reset)

## 🔑 PAROLA ACTUALĂ (folosește email/parolă, NU Google login)

- **Email:** `dragosserban95@gmail.com`
- **Parolă NOUĂ:** `Nuamparola_9`
- **Plan:** `society_admin` (proprietar platformă)
- **Roluri:** `is_admin=True`, `is_society_admin=True`, `is_developer=True`

**IMPORTANT**: Contul tău este creat cu EMAIL + PAROLĂ în baza de date. NU este conectat la Google OAuth. Butonul "Continue cu Google" creează un cont SEPARAT (chiar dacă email-ul coincide), de aceea ai fost redirecționat la un cont diferit. **Folosește mereu butonul "Autentificare EPD"** (formularul cu email + parolă) — NU butonul Google.

## Live preview URL
- Preview: `https://github-push-test.preview.emergentagent.com`
- Production (deployed): `https://github-push-test.emergent.host`
- **Target final** (după DNS switch): `https://www.energyprojectdesign.com`

## Demo Gas Project — END-TO-END CAP-COADĂ (302 fields populate)
- **PID:** `gp_e79e2810cc64b5b4`
- **Title:** "Demo End-to-End — Branșament Aurel Vlaicu 15 (V9.0)"
- **Owner:** dragosserban95@gmail.com
- URL: `/gaze-naturale/gp_e79e2810cc64b5b4`
- Dossier ZIP: 1.2MB, 34 fișiere DOCX generate automat

## Gas Natural Module Health Check (V10.2)
- ✅ 4 proiecte salvate în DB
- ✅ 33 DOCX templates active (`GET /api/gas-project/doc-templates`)
- ✅ 221 câmpuri în registry (8 categorii × 32 secțiuni)
- ✅ Demo project generates 34-file dossier ZIP (1.2MB)
- ✅ Engineering API: Renouard, Anexa 13, groapa sudare, tub protecție, probe presiune, consumatori-debit
- ✅ 11 planuri publice (trial → societate, 0-399€/lună)
- ✅ Planuri ascunse: developer_elite ($999,999), society_admin, cofounder, inside_full, free

## Stripe LIVE
- Publishable key: `pk_live_51Thc7C...` (în /app/frontend/.env)
- Secret key: `sk_live_51Thc7C...` (în /app/backend/.env)
- Restricted key: `rk_live_51Thc7C...` (în /app/backend/.env)
- Donații LIVE: `POST /api/donations/checkout` (RON sau EUR, min 5/1, max 100k)

## Gmail SMTP (donor forwarding)
- User: `dragosserban95@gmail.com`
- Password: `Nuamparola_9` — **NU FUNCȚIONEAZĂ** (Gmail necesită App Password 16-char cu 2FA)
- Pentru email-uri reale: generează App Password la https://myaccount.google.com/apppasswords
- Fallback: mesajele se salvează în `db.donations`, vizibile manual

## Quick test
```bash
URL=https://github-push-test.preview.emergentagent.com
TOKEN=$(curl -s -X POST $URL/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Nuamparola_9"}' | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl -H "Authorization: Bearer $TOKEN" \
  "$URL/api/gas-project/gp_e79e2810cc64b5b4/dossier.zip" -o /tmp/dosar.zip
unzip -l /tmp/dosar.zip   # 34 fișiere
```
