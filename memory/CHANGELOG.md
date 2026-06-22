# Energy Project Design — Changelog

## V10.6.2 — 2026-06-22 (current session) — FAQ Schema + Materials Auto Panel

### 🔎 FAQ Section + FAQPage Schema (Google rich snippets)
- Secțiune FAQ în Landing cu 10 întrebări frecvente (data-testid="faq-section")
- Microdata `itemScope FAQPage` + `Question` + `Answer` pe fiecare item
- JSON-LD FAQPage schema în index.html (10 Q&A) → Google va putea afișa fragmente direct în rezultate
- Subiecte acoperite: ce e EPD, legal RO, prețuri, timp generare, colaboratori, industrii, limbi, donații, investitori, securitate
- Toate cu cuvinte-cheie SEO țintite: NTPEE 2018, ANRE 89/2018, eIDAS QES, audit log, GDPR, 24 limbi, IBAN RO22 REVO

### ⚙️ MaterialsAutoPreview în Studio Gaze
- Componentă nouă în GasNaturalProjectV2.jsx la finalul secțiunii Materiale
- Apel GET /api/gas-project/{pid}/materials/auto cu auto-refresh la modificarea br_material, br_diametru_dn, br_lungime_m, cnd_*
- UI cu header gradient violet-indigo, header cu buton „Generează materiale" / „Recalculează"
- Afișează 8+ poziții SAP în format tabel: Nr | Cod SAP (mono violet) | Denumire | BR/CND badge | Cantitate (mono bold) | UM
- Footer cu „Total: X poziții · selecție automată din 554 SAP · Lista se introduce automat în Proiect Bransament COMPLET (DOCX)"
- Testat live: 8 materiale generate corect pentru PID demo (TEAVA DN32, TEU 90-32, MUFA, RAISER, ROBINET, FIRIDA, REGULATOR, FILTRU)


## V10.6.1 — 2026-06-22 (current session) — SEO global infrastructure + Donații pe cont secundar Stripe

### 💸 Stripe donations routing
- `_stripe_client(request, account="donations")` — multi-account helper în /app/backend/server.py
- `/api/donations/checkout` folosește acum `STRIPE_DONATIONS_API_KEY` (cheia restricționată #2 furnizată de user)
- Backend testat LIVE — 3 sesiuni Stripe Checkout create cu success (cs_live_*)
- Donatiile vor merge spre IBAN RO22 REVO 0000 1555 6872 4293 (default payout pe contul Stripe asociat cheii)
- Min donație: 2 RON (limită hard impusă de Stripe însăși; 1 RON respins)

### 🌐 15 pagini SEO industrii LIVE
- `/app/frontend/src/data/industryPages.js` — registry 15 industrii (investitori, aviatie, airflight, spatial, spaceflight, satelite, drone-uav, electric, fotovoltaice, telecom, hvac, apa-canal, feroviar, sanatate, sport-stadioane)
- `IndustrySeoPage.jsx` — pagină parametrizabilă cu hero gradient per accent, metrics, bullets, cross-links, footer, JSON-LD Service schema injectat dinamic
- Bug fix: slug din `location.pathname` (rutele sunt statice, nu :slug)
- Toate cele 15 URL-uri verificate, JSON-LD prezent

### 🔎 SEO infrastructure complete
- `robots.txt` rescris cu Allow per AI crawler (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended, CCBot etc.) + sitemap declarations
- `sitemap-index.xml` master + `sitemap-industries.xml` + `sitemap-images.xml`
- `manifest.webmanifest` PWA-ready (icons, shortcuts, screenshots, theme_color)
- hreflang × 24 limbi în `<head>` + sitemap principal
- og:image actualizat la banner real 2048x2048
- Logo fizic în /public (logo.png, og-image.jpg, logo192.png, favicon.png) — toate referințe schema/manifest funcționează

### 🌍 i18next 24 limbi (V10.6) — păstrate
- Language switcher integrat în Landing + AppShell
- 24 limbi: RO/EN/ES/FR/DE/IT/PT/NL/PL/UK/RU/TR/AR/HE/HI/ZH/JA/KO/VI/TH/EL/HU/CS/BG
- RTL pentru AR/HE


## V10.6 — 2026-06-22 (current session) — GLOBAL EXPANSION: Vision Banner + Investitori + i18n 24 limbi + SEO global

### 🎨 Vision Banner (imagine user-uploadată)
- Salvată la `/app/frontend/public/branding/epd_hero_banner.png` (2.7MB)
- Integrată în Landing sub Hero ca secțiune `data-testid="vision-banner"` — full-width cu titlu „Platforma nr. 1 în lume, multifuncțională"

### 💎 Secțiune Investitori (Strategic Capital)
- `data-testid="investors-section"` în Landing.jsx (între Roadmap și Sponsorizare)
- 4 metrics: TAM Global $1.4T, Piață RO €8B, 22+ servicii, V10.6 live
- 5 puncte "De ce acum": cerere validată, avantaj reglementar (eIDAS+NTPEE), tehnologie defensibilă (554 SAP+221 fields+33 templates), echipă validată, expansiune naturală
- CTA: invest@energyprojectdesign.com (amber) + Plan Developer Elite $999,999/lună
- Buton "💎 Investitori" în navbar + buton hero (amber)

### 🌍 Internaționalizare i18n (24 limbi)
- Installed: `i18next@26.3.1`, `react-i18next@17.0.8`, `i18next-browser-languagedetector@8.2.1`
- Configurate 24 limbi: RO/EN/ES/FR/DE/IT/PT/NL/PL/UK/RU/TR/AR/HE/HI/ZH/JA/KO/VI/TH/EL/HU/CS/BG
- RTL pentru AR/HE (auto-aplicat pe `<html dir>`)
- Browser auto-detect + localStorage persistence (key: `epd-i18n-lang`)
- Component nou `LanguageSwitcher.jsx` (24 opțiuni cu flag emoji + nume nativ)
- Integrat în Landing header + AppShell header (utilizatori autentificați)

### 🔎 SEO Global (cucerire pământ)
- `<link rel="alternate" hreflang>` × 24 limbi în `<head>` + `x-default`
- Sitemap.xml cu hreflang xhtml:link tags pe URL principal + 16 URL-uri noi (investitori, aviatie, airflight, spatial, spaceflight, satelite, drone-uav, electric, fotovoltaice, telecom, hvac, apa-canal, feroviar, sanatate, sport)
- Meta `content-language` extins la 24 limbi
- Meta keywords extinse cu: airflight, spaceflight, aviation, NewSpace, satelite, drone, UAV, NewSpace, NewSpace
- JSON-LD Organization actualizat:
  - `contactPoint` × 3 (customer service cu 24 limbi, technical support, investor relations)
  - `areaServed` extins la Country + Continent + Global Place
  - `knowsAbout` cu 25 entries multi-industrie (inclusiv Aviație civilă, Airflight, Spaceflight, NewSpace, Satelite, Drone UAV)
- Hashtags noi: #Aviation, #Spaceflight, #NewSpace, #GlobalPlatform, #Investors

### 🧪 Testing (iteration_18 V10.5: 13/13 PASS)
- V10.6 smoke verificat manual: LangSwitcher 🇷🇴→🇬🇧 funcțional, Vision Banner vizibil, Investors section vizibilă, JSON-LD valid, sitemap servit cu hreflang


## V10.3 — 2026-06-21 (current session) — Studio Gaze REDESIGN + END-TO-END functional

### 🎨 UI redesign masiv — paletă strict violet/indigo/blue (zero verde/amber/negru)
- `GasNaturalProjectV2.jsx` (~1800 lines): toate componentele inline rescrise — `ConsumerList` (accent prop violet/indigo/blue), `AvizeList` (border-violet, ribboane uniforme), 3 coloane Consumatori cu ribboane color-coded (mențin/dezafectează/noi) + total Qmin live
- Secțiuni „Generare documente DOCX" + „Acte uploads" rescrise cu carduri premium (gradient hover, lucide icons properly themed)
- Right sidebar: 5 panouri premium uniforme (User info, Email dispatch, Stamps, Downloads, Acțiuni proiect) cu gradient ribbons și consistent epd-shadow
- `GasChronologicalStepper.jsx` — bg-amber-500 → bg-violet-600 (pct badge)
- `Preflight panel` redesignat — border-violet, gradient-from-violet header, status badges violet/indigo în loc de green/amber

### ⚡ Funcționalitate end-to-end reală (toate butoanele cuplate la backend)
- **NEW** `POST /api/gas-project/{pid}/transfer` — endpoint nou, transfer proiect între utilizatori cu shared_access + audit_log persistat în Mongo + email notificare best-effort
- **NEW** `GET /api/gas-project/{pid}/audit-log` — returnează `{audit_log, shared_access}` pentru trasabilitate
- **NEW** model `TransferPayload` (target_email, target_role, note)
- `TransferProjectDialog` component (modal cu 7 roluri: proiectant/executant/vgd/rte/operator/contabilitate/ofertare)
- `UploadAvizatButton` — real upload la `/api/upload` (category=`proiect_avizat`) + PATCH status la `avizat`
- `sendEmailRoute` — POST `/phase/{id}/dispatch` cu phase mapping (primarie→dtac, osd→avize, isc→executie, etc.)
- `sendToAvizare` — PATCH status='awaiting_avizare' + reload proiect
- Status whitelist extins: `{draft, in_review, awaiting_avizare, avizat, approved, signed, archived}` (era doar 5 stări)

### 🔗 Logo navigation fix
- `AppShell.jsx` — sidebar logo `to="/dashboard"` → `to="/"` (Landing publică)
- `App.js` — `HomeRedirect` simplificat la `<Landing />` și pentru utilizatorii logați (înainte redirecta forțat la `/acasa`)
- Click pe logo din orice pagină internă duce la pagina de prezentare publică

### 🧪 Testing (iteration_16.json)
- Backend: 10/11 pytest PASS (1 critical bug PATCH status whitelist — FIXAT post-test)
- Frontend: 21/21 (toate testids prezente, paletă confirmată)
- Transfer endpoint validat E2E: ok:true, shared_access persistat, audit_log corect
- Status `awaiting_avizare` și `avizat` testate manual via curl post-fix — ✅


## V8.4 — 2026-06-12 (current session, very late)

### 🎯 +7 documente legale ROMÂNE obligatorii (33 templates total)
Noi documente generate per `gas_doc_templates_legal.py`:
1. **declaratie_conformitate** — Declarație de Conformitate Executant (Lege 10/1995 art. 25 + EN 1555)
2. **buletin_proba_rezistenta** — Buletin Probă Rezistență Mecanică (NTPEE 2018 cap. 5 art. 80) cu KSP 1.5×Pmax, durată 60 min
3. **buletin_proba_etanseitate** — Buletin Probă Etanșeitate 24h (NTPEE 2018 cap. 5 art. 82) cu compensare termică
4. **pv_receptie_finala** — PVRF la 1-3 ani după PVRTL (HG 273/1994 art. 36) cu comisie 6 membri + verificări periodice
5. **pv_pif_semnat** — PV Punere în Funcțiune semnat OSD (Ord. ANRE 162/2021) cu CLC, contor, sigilare metrologică
6. **fisa_sudor** — Fișa Sudor Autorizat per sudor (ANRE Ord. 79/2014 + EN 13067 + ISO 9606-1)
7. **plan_ssm** — Plan SSM (Securitate Sănătate Muncă, Legea 319/2006 + HG 1425/2006 + HG 300/2006) cu 6 riscuri identificate + matrice EIP + plan urgență

### Registry extins +20 câmpuri critice
- **Categorie nouă "Documente legale obligatorii"** (order 7) cu 2 secțiuni: `doc_legale` (15 fields) + `probe_extinse` (6 fields)
- Total: **200 fields** (de la 179), **28 sections**, **7 categories**

### V8.3 (anterior în această sesiune) — Service Pipeline + Ad-hoc Stripe
- **gas_services_routes.py**: 5 servicii premium per proiect cu Stripe checkout (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€)
- 3 endpoint-uri noi: GET /services, POST /service-checkout, GET /service-status/{sid}
- **GasServicePipeline.jsx**: 6-stage pipeline (Date → Documente → Ștampile → Semnătură → Plată → Livrare) + Service Catalog UI

### V8.2 (sesiune anterioară) — Stamp Absolute + Billing UI
- Backend `insert_stamp` extended cu x_cm/y_cm absolute mode (wp:anchor + EMU)
- StampPlacement.jsx draggable component (A4 simulat 378×535px)
- Billing.jsx pagină nouă consumând /api/me/billing

### V8.1 — 100% placeholder coverage (179/179)
- Caiet Sarcini secțiuni 4.1/4.2/4.3 detalii pozare
- Cartouche proiect helper aplicat în 4 templates
- Footer signature 2→3 coloane

### V8.0 — +3 DOCX + Stripe webhook idempotent
- dtac_lista_avize, pv_calitate, program_faze_isc
- Audit log gas_service_purchases + /me/billing endpoint

### V7.5 — Gaze Naturale tab "REGISTRU CÂMPURI"
### V7.4 — HomePage 12 quick-access + 5 ecosystems

## V7.5 — 2026-06-12 (earlier session)

### Gaze Naturale — produs complet livrabil
- Tab nou "REGISTRU CÂMPURI (179)" — 179 placeholders din `FIELDS_REGISTRY` grupați în 6 categorii × 26 secțiuni cu coverage live
- Auto-mapping V2→Registry la save (`applyAutoMap`)
- 6 ștampile cu mapping backend corect
- Extindere DOCX: Memoriu Tehnic +5 secțiuni, Carte Tehnică +ct_sectiune_A/B/C/D, Borderou +materiale&furnizori +11 avize
- Stripe checkout funcțional (UpgradeGate → /api/payments/checkout)
- Landing public restaurat (12 servicii + 5 ecosisteme)

## V7.4 — 2026-06-12

### HomePage V7.4 restructurare
- Hero compact + 12 quick-access pills + 5 ecosystem cards + AI card + stats + activity feed

## V7.3 și anterior
Vezi `/app/memory/PRD.md` pentru detalii.

## V9.0 — 2026-06-21 (sesiune fork de finalizare)

### REBRANDING TOTAL EPD oficial (cerință user mesaj 23)
- `lib/brand.js` (NOU) — single source: BRAND_ASSETS (5 URLs Facebook), BRAND_COLORS, BRAND_GRADIENTS
- Paletă: violet→indigo→navy→negru (extras din logo cub EP gradient diagonal 135°)
- `index.css` — variabile + .epd-btn + .epd-gradient + .epd-shadow + radius 0.5rem
- Tailwind primary 262 83% 58% (violet-600)

### Pagini rescrise cu brand oficial
- `Landing.jsx` — full rewrite; hero deep-navy cu cover Facebook; **Gaze Naturale featured ca PRODUS PRINCIPAL** ÎNAINTE de restul serviciilor; 14 servicii active grid; banner "Architects of Future Global Technology"; 22 servicii viitoare păstrate
- `Login.jsx` — brand panel cu cover Facebook + form modernizat cu focus violet
- `HomePageV7.jsx` — hero nou + MAIN PRODUCT SPOTLIGHT card Gaze Naturale featured deasupra
- `AppShell.jsx` — sidebar logo EP cub gradient + tagline "Redesigning projects."

### Pagini NOI (cerute mesaj 22+23, NU se elimină nimic)
- `/comert-logistica` — `ComertLogistica.jsx` cu 8 sub-servicii + CTA Gaze
- `/fabrici-uzine` — `FabriciUzine.jsx` cu 8 specialități industriale + 3 proiecte referință
- Rutele adăugate în App.js

### Demo cap-coadă enrichment (cerință "proiect real bransament")
- `seed_demo_gas_project.py` — script de enrichment demo
- PID `gp_e79e2810cc64b5b4`: îmbogățit de la 111 la **302 fields** (+191)
- Date reale extrase din artefactele Facebook: Memoriu Avizare, Foaie Capăt, Referat DTAC, Program Faze, Anexa 13
- 22 categorii populate complet (proiect, beneficiar, amplasament, tehnice, consumatori, conductă BR/CND, post reglare, OSD, CU/AC, 8 avize, 3 semnături, probe NTPEE, recepție, materiale Anexa 13, exigențe A/B/C/D, SSM, 10 emails, 5 faze determinante, carte tehnică)

### Re-compilare COMMAND_LOG_FULL.md
- Appendix V9.0 adăugat (secțiunea 23) cu citatele literale ale userului
- Document acum 863 linii — completă referință end-to-end

### Testing (iter 13)
- testing_agent_v3_fork: 50/50 PASS frontend (Landing + Login + Acasa + Sidebar + 2 pagini noi + Studio demo + 4 regression pages)
- Zero erori critice, zero blockers
- Site PRODUCTION READY pentru listare Google

## V9.1 — 2026-06-21 (continuare sesiune fork)

### Cerință user (mesaj 24)
> "Stepper cronologic vizual (optional): 10 etape orizontal sus în Studio Gaze...
> introdu cheia stripe in site pentru validare plati pk_live_51Thc7C...
> da-mi preturile pachetelor sa le listez in stripe, pentru a putea fi cumparate,
> si elimina adaugarea de pachete ad hoc."

### IMPLEMENTAT V9.1
1. **GasChronologicalStepper.jsx (NOU)** — componenta cu 10 etape:
   `Date proiect → Date tehnice → Avize → DTAC → AC/Acord drum → PTH → Avize finale → Dispoziție șantier → Carte tehnică → Recepție`
   - Calculează automat % completion per etapă bazat pe fields din FIELDS_REGISTRY
   - Status: pending / started / progress / done (cu styling diferit)
   - Bar progres global jos + "Următoarea etapă"
   - Demo project gp_e79e2810cc64b5b4 (302 fields) afișează 10/10 finalizate (100%)

2. **Eliminat ad-hoc services UI** — GasServicePipeline înlocuit cu noul stepper:
   - 5 pachete (express 49€, QES 5€, dispatch 15€, review 35€, carte_legata 25€) NU mai sunt vizibile
   - Codul backend `gas_services_routes.py` rămâne (compatibilitate istorică, dar dezactivat UI)
   - Fișier `GasServicePipeline.jsx` ȘTERS din `/app/frontend/src/components/`

3. **Stripe publishable key adăugat** — `/app/frontend/.env`:
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51Thc7C...`
   - BACKEND URL păstrat intact

4. **STRIPE_PRICING_SETUP.md** — document NOU în `/app/memory/`:
   - 11 planuri listate (1 trial + 10 plătite, de la 49€ la 349€/lună)
   - Procedură pas-cu-pas pentru creare produse în Stripe Dashboard
   - Tabel mapping ID intern → Stripe price ID
   - Warning despre secret key (sk_live_*) pendant la user

5. **Polish minor** — chip "Stripe ad-hoc" pe HomePage înlocuit cu "Stripe planuri lunare"

### Testing iter 14: 9/9 PASS frontend
- Stepper vizibil cu toate 10 etape + data-testid corecte
- 100% completion afișat pentru demo project
- Zero ad-hoc packages vizibile
- Stripe key în .env fără să afecteze BACKEND_URL
- Regression rebranding V9.0 intact
