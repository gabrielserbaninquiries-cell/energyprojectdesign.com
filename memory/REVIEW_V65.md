# Energy Project Design — REVIEW CRITIC REAL V6.5

> Cerință literală user: "Vreau sa faci o analiza critica si reala a intregului site. [...] Cea mai buna platforma din lume si singura de acest gen."

Data: 2026-06-08
Analist: Emergent Agent
Versiune analizată: V6.4 (120 placeholders, 23 gaz + 6 electric + 5 apa_canal docs, 10 essentials config, 127 endpoints, 60 frontend pages)


## 1. CE FACE PLATFORMA REAL ACUM (verified live)

### 1.1. Servicii FUNCȚIONALE end-to-end
| Serviciu | Status | Verificat live |
|---|---|---|
| Autentificare JWT + Google OAuth | ✅ | login ok cu test_credentials |
| Generare 23 documente DOCX gaze naturale | ✅ | dossier.zip 823KB cu MANIFEST |
| 13 avize cu condiționale dinamice | ✅ | drumuri/poliție/ISCIR apar/dispar |
| Pre-flight validation per template | ✅ | coverage % real |
| 6 pachete documente one-click | ✅ | ZIP cu manifest legal |
| OCR auto-fill din DOCX/PDF (regex) | ✅ | 13 pattern-uri RO, 2-5 câmpuri detectate per document |
| Upload real ștampile + acte (14 categorii) | ✅ | base64 inline DB |
| Preview PDF cu ștampile + watermark SHA-256 | ✅ | libreoffice headless conversion |
| Cross-industry clone | ✅ | 9 câmpuri moștenite testat |
| Admin essentials (10 integrări config) | ✅ | write-only redact |
| Semnătură SHA-256 + QR public verify | ✅ | endpoint /verify/gas-project/{pid} live |
| Pricing 14 planuri | ✅ | 0-349 EUR matrix |
| Inside Full (enigma pepene + parola 2) | ✅ | 10 funcții SAFE MODE |
| Implementation Queue (AI propuneri) | ✅ | seed 11 propuneri |
| Self Check (audit interfață 32 pagini) | ✅ | dignostic table |

### 1.2. Servicii STUB / MOCK / NEFUNCȚIONALE
| Serviciu | Status real | Problema |
|---|---|---|
| **Semnătură QES cert-SIGN/DigiSign/Trans Sped** | 🟡 STUB | Doar config UI, fără API real |
| **Trimitere email per aviz către OSD/Primărie/ISC** | 🟡 STUB | Frontend `toast.success("Trimis")`, fără SMTP backend real per-aviz |
| **Auto-apply SEAP/SICAP** | 🟡 STUB | Doar UI config, fără agent automat |
| **ANAF e-Factura** | 🟡 STUB | Config câmpuri prezente, fără upload XML real |
| **Open Banking PSD2** | 🟡 STUB | Config câmpuri, fără call PSD2 |
| **OCR pe imagini PNG/JPG** | 🟡 STUB | Returnează text vid (deși UI suportă upload) |
| **VGD/RTE real API contract** | 🟡 STUB | Scaffold în qes_provider.py |
| **License timer real countdown** | 🟡 STUB | Header afișează "DEVELOPER LIFETIME", fără timer real DB-driven |
| **Audit interfață per buton** | 🟡 PARTIAL | Lista pagini există, dar fără verificare buton-by-buton |
| **Energy Advisor (Claude Sonnet)** | ⚠️ FUNCȚIONAL DAR FRAGIL | Dependent de Emergent LLM Key + balance |


## 2. GAP-URI MAJORE (vs. viziunea declarată)

### 2.1. **Industrii promise vs reale**
Vision: "13 industrii × 158 subdomenii planificate"
Realitate live:
- ✅ **3 industrii cu template-uri concrete**: gaze (23), electric (6), apa_canal (5) = **34 template-uri total**
- ❌ **10 industrii doar schelet (zero template-uri)**: fotovoltaice, telecom-fibra, arhitectura, feroviar, constructii-masini, ofertare, mentenanta, plus 3 noi cerute

**Concluzie**: Promisiunea "TOATE industriile" e nematerializată în proporție de 77%.

### 2.2. **Internationalization (i18n) — ZERO**
- Vision: "international electronic technical documentation" (slogan landing)
- Realitate: TOATE textele UI sunt hard-coded RO. Fără pivot EN/DE/FR.
- **Imposibil de vândut internațional** fără i18n minim.

### 2.3. **Document versioning — ZERO**
- Vision: "registru proiecte INDIVIDUAL per licență, real (nu cache)" + "Import proiect cu RETENȚIE imagini, ștampile..."
- Realitate: fiecare generare DOCX e o operațiune unică, neistoricizată. Nu se poate recupera versiunea anterioară a unui memoriu tehnic semnat acum 6 luni.
- **Lacună critică juridică**: documentele tehnice tipărite cu valoare legală TREBUIE păstrate cu versionare conform Legea 10/1995.

### 2.4. **Quality Score — ZERO**
- Vision: utilizator vrea să știe instant "în ce procent e gata documentația"
- Realitate: există coverage % per template (pre-flight), dar fără scor global de calitate proiect.

### 2.5. **Project Sharing / Colaborare — ZERO**
- Vision: "VGD verifică, RTE coordonează execuția" (3 roluri colaborative)
- Realitate: proiectele sunt strict per-owner. Nu există invitație VGD/RTE/Diriginte.
- **Imposibil de simulat firmă cu 20 angajați → 1-2** fără sharing.

### 2.6. **Notifications system — ZERO**
- Vision: "task-uri efectuate apar în listă + email", "timer închidere licență"
- Realitate: zero clopoțel. Singura "notificare" e toast.success efemer.

### 2.7. **Prețuri inconsistente**
- Operator 79 EUR cu 50 docs/lună VS Avize 79 EUR cu **200** docs/lună
- Contabilitate 69 EUR cu 200 docs/lună VS Basic 49 EUR cu 30 docs/lună (≈1.4x preț pentru 6.7x volum)
- Lipsesc planuri "Free + 10 docs", "Pay-per-document" (€2/doc) pentru micro-firme

### 2.8. **Frontend duplicates & dead code**
- GasNaturalProject.jsx (V1, **obsolet**, ~700 LOC)
- GasNaturalProjectV2.jsx (V2, current, ~1250 LOC)
- Ambele înregistrate, V1 nu mai e folosit dar e încărcat în bundle

### 2.9. **server.py monolit 2459 LOC**
- Conține business logic care ar trebui extrasă în /backend/routes/

### 2.10. **AI features nemonetizate**
- AI Assistant + Energy Advisor (Claude) merg, dar nu există tier "AI premium" în pricing. Costul real LLM per request nu e propagat la utilizator.


## 3. CE LIPSEȘTE PENTRU "MOST WANTED FOREVER"

### Tier 1 — Vital (FĂRĂ asta platforma nu poate concura internațional)
1. **Document Versioning** — istoric complet per document cu hash + diff
2. **Quality Score per Project** — scor 0-100 real-time
3. **Project Sharing & Collaboration** — invitație VGD/RTE/Diriginte cu permisiuni
4. **Notifications System** — clopoțel + email + push (deadline AC, aviz primit, plată)
5. **Audit Trail extins** — timeline acțiuni proiect cu user/ip/ts/action

### Tier 2 — Diferentiator
6. **Industrii concrete + 3 noi**: fotovoltaice + telecom + arhitectura (cu min 5 templates each)
7. **i18n (RO + EN minim)** — pivot landing + AdminEssentials + ProjectV2 toolbars
8. **AI Document Reviewer** (GPT-4o-mini) — analizează DOCX generat și sugerează îmbunătățiri
9. **Compliance Dashboard global** — pe firmă: câte proiecte conforme, câte pending, ce legi expirate
10. **Public Marketplace v2** — listare proiectanți/VGD/RTE cu rating, filter, contact instant

### Tier 3 — Long-term moat
11. **API Public** (Developer plan 49 EUR/lună) — B2B integration
12. **Mobile PWA** — install + offline cache
13. **BIM/CAD integration** (DXF import → auto-detect traseu)
14. **Real digital signing cu cert-SIGN/DigiSign** (când user oferă chei)


## 4. CORECȚII PRIORITIZATE (implementare V6.5 acum)

### 4.1. ✅ ÎN ACEASTĂ SESIUNE (Tier 1 vital)
- [x] **Document Versioning** — collection `document_versions`, hook auto la generate(), API istoric+restore, UI panel istoric
- [x] **Quality Score** — algoritm 4 factori (câmpuri/avize/docs/semnături), endpoint + UI badge live
- [x] **Project Sharing** — collection `project_shares`, 4 roluri (Viewer/Proiectant/VGD/RTE), endpoints invite/list/revoke, UI panel sharing
- [x] **Notifications System** — collection `notifications`, endpoints CRUD, UI clopoțel cu badge
- [x] **Audit Trail extins** — toate routes hook în action_logs cu enrichment, endpoint /api/audit-trail/{pid}, UI timeline

### 4.2. ✅ ÎN ACEASTĂ SESIUNE (Tier 2 diferentiator)
- [x] **+2 industrii concrete**: fotovoltaice (5 templates) + arhitectura (5 templates)
- [x] **Pricing rebalansare** — value props coerente per plan, marketing copy

### 4.3. 🟡 NEXT SESSION (după push GitHub)
- [ ] i18n RO + EN
- [ ] AI Document Reviewer cu Claude Sonnet
- [ ] Compliance Dashboard global
- [ ] Public Marketplace v2

### 4.4. 🟢 BACKLOG
- [ ] API Public Developer tier
- [ ] Mobile PWA + offline
- [ ] BIM/CAD DXF import
- [ ] Real cert-SIGN/DigiSign integration


## 5. METRICI POST-V6.5 (ce ne face "most wanted")

| Metric | V6.4 (înainte) | V6.5 (după) | Industrie benchmark |
|---|---|---|---|
| Industrii cu template-uri concrete | 3 / 13 (23%) | 5 / 13 (38%) | Plan: 13/13 până Q4 |
| Document templates total | 34 | **44+** | 100+ pentru full coverage |
| Project Quality Score | nu există | 0-100 live | Industria nu are |
| Versioning documente | nu există | full DAG history | LEGAL OBLIGATORIU |
| Sharing & roluri | 0 | 4 roluri | "Multi-user firm" feature |
| Notifications | toast efemer | DB-persistent + email | Standard SaaS |
| Audit Trail | parțial | timeline complet | OBLIGATORIU GDPR + ISO |

## 6. CONCLUZIE STRATEGICĂ

**Platforma V6.4 este la nivel MVP-avansat** (functional pentru gaze RO, dar nu international).

Pentru "**cea mai bună din lume**" trebuie:
1. **VERSIUNI 6.5 (NOW)**: versioning + quality score + sharing + notifications + audit = produce "legalitate enterprise"
2. **VERSIUNE 7.0 (1-2 luni)**: i18n + 13/13 industrii + AI Document Reviewer = "international"
3. **VERSIUNE 8.0 (3-6 luni)**: API Public + Mobile + BIM = "ecosystem"

Această evoluție duce platforma de la "Romanian gas SaaS" → "**global engineering documentation OS**".
