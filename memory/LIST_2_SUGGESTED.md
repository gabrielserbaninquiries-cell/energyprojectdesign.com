# 💡 LIST 2 — Îmbunătățiri sugerate (pe baza structurii existente)

> Sugestii care extind/optimizează features-uri DEJA EXISTENTE în aplicație.
> AI Agent-ul poate executa aceste sugestii după ce Lista 1 P0 e completă.
>
> **Ultima actualizare**: 2026-06-06 12:38 UTC

---

## A. UX & Navigare (îmbunătățire experiență utilizator)

### A.1 Landing page reorganization
- [ ] Adaugă secțiune **"12 Industrii"** în landing (carousel/grid)
- [ ] Adaugă secțiune **"AI Agents"** (Producer/User/Client/Developer)
- [ ] CTA secundar pentru `/feat-uri` (Hub viziune)
- [ ] Testimoniale prosumatori + firme inginerești
- [ ] Video demo `<60s` proces complet (încarcat șablon → PDF semnat)

### A.2 Dashboard widgets
- [ ] Widget **"Industrii active"** (firmă e configurată pentru cite ANRE/ANRP)
- [ ] Widget **"SEAP licitații noi"** (count + link `/feat-uri/seap`)
- [ ] Widget **"Job opportunities"** (count + link `/feat-uri/jobs`)
- [ ] Widget **"Forum: discuții noi"** (deja parțial implementat)

### A.3 Mobile-first redesign
- [ ] Sidebar collapse pe mobile (deja parțial)
- [ ] Touch gestures pentru swipe între proiecte
- [ ] PWA install prompt (manifest.json + service worker)

---

## B. AI & Automation (extinderi pe ce există)

### B.1 AI Assistant — nuanțare intents
- [ ] De la 13 intents la 20+ intents (ex: "generează raport lunar", "șterge proiect X", "trimite e-mail către OSD")
- [ ] Suport multi-turn conversation (memorie în 5 mesaje)
- [ ] Voice input (web Speech API)

### B.2 AI Developer — mode auto-apply (cu confirmare)
- [ ] Trecere din Plan Mode → Apply Mode (cu safety checklist)
- [ ] Sandbox preview înainte de aplicare
- [ ] Rollback automatic dacă testele cad

### B.3 Document AI — OCR și extragere date din pozze
- [ ] Upload poză BI/CI → extragere CNP/nume/adresă (Google Vision sau Tesseract)
- [ ] Upload contract scănat → extragere câmpuri (Document AI)
- [ ] Upload factură fiscală → declarare automată (cf. ANAF)

---

## C. Integrări externe (extinderi pe arhitectura existentă)

### C.1 ANAF integration
- [ ] CUI lookup (verificare firmă validă în Mediu fiscal)
- [ ] Generare declarații unice automat (Formularul 230, etc.)
- [ ] Trimitere SPV (Spațiul Privat Virtual)

### C.2 ANRE integration
- [ ] Verificare autorizare proiectant/executant
- [ ] Mapare grad autorizare → industrii permise

### C.3 Email digest zilnic
- [ ] Cron job 9:00 AM → trimite email zilnic per user cu:
  - SEAP licitații noi
  - Job opportunities matchuite
  - Document-uri în lucru (status)
  - Recomandări AI (cost reduction, etc.)

### C.4 Payment integration extension
- [ ] Pe lângă Stripe — adaugă PayPal
- [ ] Adaugă transferuri bancare cu reconciliere automată (deja parțial via Revolut IBAN)
- [ ] Adaugă crypto (USDC/USDT) — opțional

---

## D. Securitate & Compliance

### D.1 Multi-factor authentication (MFA)
- [ ] TOTP via Google Authenticator / Authy
- [ ] Backup codes 1-time use
- [ ] SMS OTP (opțional, cost-intensive)

### D.2 Audit log avansat
- [ ] Filtre avansate în `/logs` (deja există parțial)
- [ ] Export CSV/Excel (pe lângă JSON existent)
- [ ] Detecție anomalii (ex: login din țară nouă)

### D.3 GDPR enhancements
- [ ] Buton "Șterge contul" în UI (deja există endpoint `/api/gdpr/account` DELETE)
- [ ] Export ZIP cu toate documentele user-ului
- [ ] Cookie consent banner cu granularitate (essential vs analytics vs marketing)

---

## E. Performance & Scalabilitate

### E.1 Caching layer
- [ ] Redis pentru sessions (în loc de MongoDB user_sessions)
- [ ] Cache pe `/api/industries` (rar se schimbă)
- [ ] CDN pentru static assets (Cloudflare/AWS CloudFront)

### E.2 Database optimization
- [ ] Index-uri MongoDB pe `user_id` (cele mai des queries)
- [ ] Index pe `project_id` + `created_at` desc
- [ ] Aggregation pipeline pentru dashboard stats (1 query în loc de 5)

### E.3 Frontend bundle optimization
- [ ] Code splitting per rută (deja parțial via React.lazy)
- [ ] Tree shaking pentru lucide-react (683 icons!)
- [ ] Lazy load Recharts (graf-uri)

---

## F. Internationalization

### F.1 Suport multi-limbă
- [ ] Extrage toate string-urile în `/app/frontend/src/locales/ro.json`
- [ ] Add `en.json` (engleza)
- [ ] React i18next setup
- [ ] Switch limbă în header (Romanian ↔ English)

### F.2 Multi-country support
- [ ] Industrii localizate (ex: Hungary, Bulgaria)
- [ ] Cadru legal per țară
- [ ] Template-uri DOCX în limba locală

---

## G. Analytics & Insights

### G.1 Admin analytics dashboard
- [ ] Total users / per-plan / DAU/MAU
- [ ] Revenue (Stripe data)
- [ ] Most-used templates
- [ ] Industries hot spots

### G.2 User-facing insights
- [ ] "Cite documente ai generat luna asta"
- [ ] "Estimated time saved vs. manual work"
- [ ] "Recommendările AI implementate vs. ignorate"

---

## H. Documentation & DevX

### H.1 API documentation
- [ ] OpenAPI/Swagger auto-generated (FastAPI default)
- [ ] Postman collection commit-uită în repo
- [ ] cURL examples per endpoint

### H.2 Component library docs
- [ ] Storybook pentru componente UI custom
- [ ] Design tokens documentație (amber #FFB300, IBM Plex Sans)

---

_Aceste sugestii sunt extensii pe arhitectura existentă. NU sunt rebranding sau redesign drastic._
