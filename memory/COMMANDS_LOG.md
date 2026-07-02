# EPD — Registru cronologic al comenzilor utilizatorului
> Ținut cuvânt-cu-cuvânt. NU se șterge nimic. Statusul se actualizează după fiecare execuție.
> Când user-ul reîncarcă credite, se reia lista aceasta de la primul DE_FĂCUT.

## Format: `[STATUS] Data | Comanda literală | Verificare`
- STATUS: DE_FĂCUT · ÎN_LUCRU · GATA · BLOCAT

---

## Sesiunea curentă (Feb 2026, fork)

### CMD-01 · DE_FĂCUT · 2026-02
**Comandă literală:** „reia toate comenzile cuvant cu cuvant si implementeaza tot ce e lipsa, in ordine de prioritati, conform comenzilor"
**Interpretare:** Meta-comandă → mă obligă să procesez fiecare comandă anterioară + să țin acest registru.
**Verificare:** N/A (meta)

### CMD-02 · GATA · 2026-02
**Comandă literală:** Fix imagini realiste ecosistem — „logistica needs semi-truck (tir), curierat needs delivery van (dubiță), apa canal needs relevant water/sewage, piese auto & service auto ensure distinct + professional, telecom needs fiber optic installation/cables not generic circuit boards"
**Fișier:** `/app/frontend/src/data/services.js` + `/app/frontend/src/pages/Landing.jsx` (ACTIVE_SERVICES)
**Ce am făcut:**
 - `curierat` (Landing + ecosystem) → `photo-1556011308-d6aedab5ed8f` (om cu dubiță DHL) ✅
 - `logistica-depozite` (ecosystem) + `logistics` (Landing) → `photo-1601584115197-04ecc0da31d7` (semi-truck Scania) ✅
 - `auto-parts` (FUTURE_SERVICES) → `photo-1580273916550-e323be2ae537` (piese auto)
 - `auto-services` (FUTURE_SERVICES) → `photo-1487754180451-c456f719a1fc` (mecanic auto)
 - `telecom` (Landing ACTIVE_SERVICES) → `photo-1606814540563-5c02d62fd409` (fibră optică albă+albastru)
 - `apa-canal` (Landing ACTIVE_SERVICES) → `photo-1693907986952-3cd372e4c9d8` (țeavă albastră canalizare pe teren)
**Verificare:** Screenshot Landing capturat OK

### CMD-03 · GATA · 2026-02
**Comandă literală:** „vad pe pagina de prezentare, 2 butoane cu aceeasi functie, sau acelasi path. 'incepe gratuit' si 'autentificare'. Aceste 2 pagini ar trebui unite cu functii combinate. Aceeasi pagina ar trebui sa contina 'incepe gratuit - logare cu google/cont si parola' sau logare cu cont existent. De asemenea, login-ul cu google ar trebui sa fie integrat ca in poza atasata"
**Ce am făcut:**
 - Creat `/app/frontend/src/pages/Auth.jsx` — pagină unificată cu toggle Signup/Signin, buton Google oficial sus, apoi formular email/parolă
 - Adăugat rută `/auth` în App.js
 - Redirect `/login` → `/auth?mode=signin` și `/register` → `/auth?mode=signup`
 - Landing.jsx: toate CTA (nav-login, nav-register, hero-cta, main-product-cta, service tiles, cta-bottom-register) actualizate să meargă la `/auth?mode=...`
 - Panoul stâng Auth folosește foto realistă (fără cover futurist abstract)
**Verificare:** Screenshots signup + signin capturate OK

### CMD-04 · GATA · 2026-02 (BUG rezolvat)
**Comandă literală:** „pagina inca se blocheaza pe o limba selectata si nu revine la vechea limba implicita, sau nu permite schimbarea de alte limbi"
**Ce am făcut:** `/app/frontend/src/components/GlobalTranslator.jsx` — rewrite `clearGoogtransCookie()` + `setGoogtransCookie()` cu funcție `domainVariants()` care șterge cookie-ul pe TOATE variantele de domeniu (host, .host, parent, .parent) → previne "stale cookie" care bloca schimbarea limbii. `setGoogtransCookie` acum apelează întâi `clearGoogtransCookie` pentru a preveni conflicte.
**Verificare programatică:** Playwright cycle RO → EN → FR → RO:
 - RO→EN: `googtrans=/ro/en` (4 domain variants) ✅
 - EN→FR: `googtrans=/ro/fr` (schimbat corect — bug-ul reprodus dispare) ✅
 - FR→RO: cookie complet șters ✅

### CMD-06 · GATA · 2026-02
**Comandă literală:** „vreau pentru pagina si platforma un UI de platforma de 1 trilion trilion dolars"
**Ce am făcut:**
 - Design blueprint via `design_agent_full_stack` → `/app/design_guidelines.json` (Swiss/high-contrast/Zinc + amber/fuchsia accents)
 - `/app/frontend/src/index.css` refactorizat:
    * Fonturi noi: Cabinet Grotesk + Satoshi (Fontshare) + Space Grotesk (fallback Google) + Inter Tight
    * `.epd-btn` (folosit peste tot) → acum zinc-950 solid black (Stripe/Linear/Vercel style) cu shadow subtil
    * `.ghost-btn`, `.outline-btn` retematizate zinc
    * `.label` → zinc-500 uppercase tight tracking
 - `/app/frontend/src/pages/Auth.jsx` panoul stâng folosește acum fotografie industrială reală (inginer cu cască) — fără AI-slop cu cover1Futurist
**Verificare:** Screenshots Landing + Auth premium confirmate (buton negru zinc-950 vizibil, foto realistă pe Auth, fonturi noi active)

### CMD-05 · DE_FĂCUT (regulă permanentă)
**Comandă literală:** „Reia cuvant cu cuvant fiecare comanda din fiecare comanda si tine o evidenta dupa fiecare comanda pana terminam proiectul, sa nu omiti vreo sarcina neindeplinita. Apoi, la incarcare de credite, sa reiei progresul automat"
**Interpretare:** Regulă operațională → registrul acesta este sursa de adevăr. Nu se închide task fără STATUS=GATA.

### CMD-06 · DE_FĂCUT · 2026-02
**Comandă literală:** „vreau pentru pagina si platforma un UI de platforma de 1 trilion trilion dolars"
**Interpretare:** Redesign complet la nivel premium — Landing + platformă. Delegat către `design_agent_full_stack` care produce blueprint. Implementare non-distructivă (păstrează toate funcționalitățile existente: auth, ecosistem, gas studio, stripe, admin).
**Verificare:** Screenshot Landing + Auth după implementare + confirmare user

---

## Backlog moștenit (din handoff)
- P1 · QES eIDAS (DigiSign/certSIGN) — așteaptă chei API
- P1 · Developer Custom Template Manager UI (`/templates`)
- P2 · PayPal integration
- P2 · Twilio SMS OTP Login
- P3 · Modul comunicare inter-departamente
- P3 · Submit `sitemap.xml` GSC

---

## Reamintiri active pentru user
- ⚠️ Preview ≠ Producție → Secrets/Env Vars în panoul Emergent + Redeploy pentru `energyprojectdesign.com`
- ⚠️ Cheile Live Stripe și Google OAuth au fost partajate în chat → rotate-le după deploy

### CMD-09 · ÎN_LUCRU · 2026-02 (P0 EMERGENCY — user CAPS)
**Comandă literală:** „SI REAL FUNCTIONALA!!!!!!!!!!!"
**Interpretare:** User cere validare EFECTIVĂ end-to-end — nu doar UI vizual, ci fluxuri complete funcționale (auth Google + email, plăți Stripe, Gaze Naturale, Admin, Language switcher, /auth unificat).
**Ce fac:**
 1. Testing agent v3 fork — regression completă backend + frontend
 2. Fix orice bug raportat (fără excepții, chiar și low-priority)
 3. Verificare curl SEO endpoints (robots.txt, sitemap.xml)
 4. Update PRD.md + test_credentials.md
**Verificare:** raportul testing agentului cu status PASS pe toate flow-urile
**Comandă literală:** „Vreau sa pregatesti aceasta pagina pentru premiul emergent de 100k dolari + un seo complet functii. vreau sa fie cea mai cautata si utilizata platforma din lume"
**Interpretare:** Platformă gata pentru evaluare Emergent $100k → SEO complet operațional (nu doar meta-taguri):
 - Meta tags OG + Twitter Cards defaults în `index.html`
 - `robots.txt` (public)
 - `sitemap.xml` dinamic + hreflang pentru multi-limbă
 - Structured data JSON-LD (există parțial pe Landing prin useSEO)
 - Image alt attributes complete + lazy loading
 - Semantic HTML
 - Favicon + PWA icons
 - Sitemap submit link în UI (footer / admin)
**Verificare:** curl la /robots.txt, /sitemap.xml, verificare HTML meta tags
**Comandă literală:** „dubita nu trebuie sa aiba logo cu dhl, iar la gaze naturale trebuie sa fie poza cu tevi gaze naturale. fa un update vizual general inteligent al intregii platforme, end-to-end, pagina cu pagina, subpagina cu subpagina. la piese auto globale trebuie sa nu fie o poza cu o imagine brand-uita, precum si la tv online global. de asemenea, constat ca la distributie copaci exista aceeasi poza ca la 'mediu'. Fa un update inteligent al intregului site! nu mai vreau sa iti dau detalii marunte de rezolvat! ar trebui sa le faci pe toate din start si ar trebui sa fie totul inteles de la sine! am zis ca vreau UI de platforma de 1 trilion trilion trilion dolars! cu tot cu butoane, pagini si subpagini intreg site!"
**Reguli deduse (aplicate PERMANENT):**
 - ZERO imagini cu logo-uri de brand (fără DHL, UPS, FedEx, Coca-Cola, orice branding vizibil)
 - ZERO imagini duplicate între secțiuni/servicii
 - Imagini reale, raw photography — fără AI-slop, fără randări abstracte
 - Gaze naturale → foto țevi/instalații gaze reale
 - Fiecare serviciu = imagine UNICĂ și RELEVANTĂ, verificată vizual
**Ce fac:**
 1. Audit complet toate imaginile din services.js + Landing.jsx
 2. Înlocuire tuturor imaginilor problematice cu ID-uri Unsplash verificate (fără brand, fără duplicate)
 3. Update vizual complet Landing + Auth + inheriting pages (deja au butoane premium via .epd-btn)
