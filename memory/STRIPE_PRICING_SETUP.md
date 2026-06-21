# Stripe Products & Prices — Plan Setup pentru Energy Project Design

> Document pregătit pentru a fi importat ÎN STRIPE DASHBOARD (https://dashboard.stripe.com/products)
>
> **Toate planurile sunt RECURENTE LUNARE în EUR.** Pentru a procesa plățile, creează în Stripe
> Dashboard câte un Product (cu un Price atașat) pentru fiecare plan din lista de mai jos.
>
> Cheia secretă `STRIPE_SECRET_KEY` (începe cu `sk_live_...`) trebuie adăugată în
> `/app/backend/.env` la `STRIPE_API_KEY=...` — NU în frontend.

---

## 🛡️ ATENȚIE — Cheia ta publică a fost expusă
Cheia `pk_live_51Thc7CFMlhoU5wjZv1rWFoF4sj8He2pziMmz0g4ozZ3aV9xXuuecDh5iZpF18b27RNc2uUx29NOGMmTo4k64RtXe004ArVGtfK`
este o **publishable key** — designed să fie expusă în frontend, deci riscul direct este mic.
Totuși, dacă vrei să fii ultra-prudent, poți să o rotești din Stripe Dashboard.

**MAI IMPORTANT**: trimite-mi cheia **SECRETĂ** (`sk_live_...`) și o adaug în `/app/backend/.env`.
Fără ea, plățile NU se vor putea procesa.

---

## 📋 Tabel cu produse Stripe de creat

| ID intern | Nume Stripe Product | Preț EUR / lună | Trial | Recurence |
|-----------|---------------------|-----------------|-------|-----------|
| `trial`        | EPD — Trial 14 zile          | **0 €** (gratuit) | 14 zile | one-off |
| `basic`        | EPD — Basic (Introducere date) | **49 €**  | —     | monthly |
| `contabilitate`| EPD — Contabilitate + e-Factura | **69 €** | —     | monthly |
| `operator`     | EPD — Operator (Introducere date) | **79 €** | —     | monthly |
| `avize`        | EPD — Avize / OSD             | **79 €**  | —     | monthly |
| `ofertare`     | EPD — Ofertare + Auto-apply SEAP | **89 €** | —     | monthly |
| `executant`    | EPD — Executant (Execuție lucrări) | **109 €** | — | monthly |
| `proiectant`   | EPD — Proiectant (Proiectare individuală) | **129 €** | — | monthly |
| `rte`          | EPD — RTE (Responsabil tehnic execuție) | **149 €** | — | monthly |
| `vgd`          | EPD — VGD (Verificator documentație) | **159 €** | — | monthly |
| `societate`    | EPD — Societate completă (5 useri) | **349 €** | — | monthly |

**Total: 10 planuri plătite + 1 trial gratuit = 11 produse Stripe.**

---

## 🛠️ Procedură pas-cu-pas

### 1. Creează produsele în Stripe Dashboard
Pentru fiecare rând din tabel:
1. Stripe Dashboard → **Products** → **+ Add product**
2. **Name**: textul exact din coloana "Nume Stripe Product"
3. **Pricing model**: Recurring → Monthly
4. **Price**: cum scrie în coloană (de ex. `49.00 EUR`)
5. Apasă **Add product** și **copiază price ID-ul** (`price_xxxxxxxxxxxx`)

### 2. Mapează price ID-urile în backend
După ce ai toate cele 10 price ID-uri (`price_xxx...`), trimite-mi-le mapate cu ID-ul intern,
de ex.:

```text
basic         → price_1Abc...
operator      → price_1Def...
proiectant    → price_1Ghi...
...
societate     → price_1Xyz...
```

Eu le inserez în `/app/backend/plans.py` la cheia `stripe_price_id` și webhook-ul Stripe le va
folosi pentru activare automată.

### 3. Webhook Stripe (deja configurat)
Endpoint-ul webhook există deja la `POST /api/webhook/stripe`. În Stripe Dashboard:
1. Developers → **Webhooks** → **+ Add endpoint**
2. URL: `https://energyprojectdesign.com/api/webhook/stripe`
   (sau `https://github-push-test.preview.emergentagent.com/api/webhook/stripe` pentru testare)
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Test plată
Cu Stripe în mod LIVE, orice card real va funcționa. Pentru test fără bani, **rămâi pe TEST mode**
și folosește cardul `4242 4242 4242 4242`.

---

## ⚠️ Ad-hoc services — ELIMINATE per cerință user (V9.1)

User-ul a cerut: **"elimina adaugarea de pachete ad hoc"**.

✅ Implementat — pipeline-ul de servicii ad-hoc per proiect (express 49€, QES 5€, dispatch 15€,
review 35€, carte_legata 25€) NU mai este vizibil în Studio Gaze Naturale. Codul backend
(`gas_services_routes.py`) rămâne pentru a nu sparge integritatea istorică, dar UI-ul nu îl mai
afișează.

Singura modalitate de plată este acum **abonament lunar Stripe Subscription** conform tabelului
de mai sus.

---

## 📊 Status integrare Stripe

| Componentă | Status | Note |
|------------|--------|------|
| Publishable key (frontend)         | ✅ Adăugată | `REACT_APP_STRIPE_PUBLISHABLE_KEY` în `frontend/.env` |
| Secret key (backend)               | 🟡 PENDING | Aștept `sk_live_...` de la user |
| Webhook idempotent                 | ✅ Funcțional | Audit log `plan_activation_log` |
| Checkout subscription              | ✅ Funcțional | `POST /api/payments/checkout` |
| Ad-hoc services                    | ❌ Dezactivat UI | Per cerință user V9.1 |
| Price ID mapping în `plans.py`     | 🟡 PENDING | Aștept lista de la user după ce creează produsele |
