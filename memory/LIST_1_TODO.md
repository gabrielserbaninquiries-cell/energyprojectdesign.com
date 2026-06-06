# 📋 LIST 1 — TO-DO (Execuție strictă)

> Această listă este derivată din: Feat-uri.docx, VISION_MANIFEST.md, PRD.md, HANDOFF.md, INDUSTRIES_ROADMAP.md.
> Marchează task-urile cu `[ ]` (pending), `[~]` (in progress), `[x]` (done).
> AI Agent-ul lucrează STRICT în ordinea de mai jos.
>
> **Ultima actualizare**: 2026-06-06 12:38 UTC

---

## P0 — STRUCTURĂ DE BAZĂ (sesiunea curentă)

### 0.1 Import + tracking
- [x] Import repo `dragosserban95/Energy-Project-Design` în `/app/`
- [x] Setup backend `.env` cu chei existente + Emergent LLM key
- [x] `pip install -r requirements.txt` + `yarn install`
- [x] Restart supervisor (backend + frontend RUNNING)
- [x] Health check `/api/` + `/api/industries` (13 industrii returnate)
- [x] Creează `COMMAND_LOG.md`, `STEP_TRACKER.json`, `RESUME_PROMPT.md`
- [x] Creează listele 1, 2, 3, 4

### 0.2 Hub Industrii (12 industrii din Feat-uri.docx)
- [ ] Adaugă ruta `/industrii` (Hub principal cu grid 12 industrii)
- [ ] Adaugă ruta `/industrii/:industryId` (pagină dedicată per industrie)
  - [ ] Gaze naturale (✅ active — pagină detaliată cu 5 subdomenii)
  - [ ] Electricitate (✅ active — schelet "În construcție")
  - [ ] Telecomunicații (✅ active — schelet)
  - [ ] Feroviar (✅ active — schelet)
  - [ ] Construcții blocuri și case (✅ active — schelet)
  - [ ] Fotovoltaice (✅ active — schelet)
  - [ ] Apă/Canal (✅ active — schelet)
  - [ ] Salubritate (✅ active — schelet)
  - [ ] HVAC (✅ active — schelet)
  - [ ] Mediu (✅ active — schelet)
  - [ ] Drumuri și poduri (✅ active — schelet)
  - [ ] Iluminat public (✅ active — schelet)

### 0.3 Hub Feat-uri (skeleton pages pentru viziune)
- [ ] Ruta `/feat-uri` (Hub central cu 10 module)
- [ ] `/feat-uri/seap` — SEAP alerts AI agent (skeleton)
- [ ] `/feat-uri/subscribers` — Subscriber DB + tarife chirii + contracte (skeleton)
- [ ] `/feat-uri/jobs` — Job opportunities marketplace (skeleton)
- [ ] `/feat-uri/ai-agents` — 4 AI Agents (Producer/User/Client/Developer) (skeleton)
- [ ] `/feat-uri/partners` — Brand merchandise + inspirational partnerships (skeleton)
- [ ] `/feat-uri/reports` — Monthly activity reports + auto declaration (skeleton)
- [ ] `/feat-uri/legal-automation` — Templates legale + transmitere automată (skeleton)
- [ ] `/feat-uri/volunteering` — Voluntariat & cauze caritabile (skeleton)
- [ ] `/feat-uri/developer-plan` — Developer Plan pentru template-uri custom (skeleton)
- [ ] `/feat-uri/community` — Comunitate pe industrii/infrastructură (skeleton)

### 0.4 Backend stubs (minimal, NU implementare profundă)
- [ ] `seap_integration.py` (config + `fetch_tenders_stub()`)
- [ ] `ai_agents.py` (registry 4 agenți + endpoint `GET /api/ai/agents`)
- [ ] Colecții: `subscribers`, `contracts`, `jobs` (minimal CRUD developer-only)
- [ ] Endpoint `GET /api/feat/status` (returnează status `planned|skeleton|active` per feat)
- [ ] Endpoint `GET /api/dev/progress` (citește STEP_TRACKER.json — developer-only)

### 0.5 Testare
- [ ] `pytest /app/backend/tests/` — toate testele trebuie să treacă
- [ ] `testing_agent_v3` smoke test pe frontend (rute principale)

### 0.6 Backup + Handoff
- [ ] Actualizează `HANDOFF_FOR_NEXT_EMERGENT.md` cu noul resume prompt scurt
- [ ] Commit-uie listele + tracker + handoff în repo (via `/api/dev/github/push`)
- [ ] Append în `VISION_MANIFEST.md` changelog v1.5.0 (NU suprascrie)

---

## P1 — IMEDIAT DUPĂ P0 (următoarea iterare)

### 1.1 Finalizare industrie Gaze Naturale
- [ ] DOCX template-uri pentru: DTM, schiță execuție, caiet sarcini
- [ ] Calc engine extins: dimensionare conducte branch, presiune medie, debit instalat per consum
- [ ] Formular branshament cu 14 câmpuri obligatorii (deja există parțial)
- [ ] Validare ANRE + transmiterea automată la OSD (Distrigaz/Engie/Premier Energy)

### 1.2 Industria Fotovoltaice (prioritate piața RO 2024-2025)
- [ ] Sub-subcategorii: rezidential <10 kWp, 10-27 kWp, comercial 27-200 kWp
- [ ] Calcul randament panou + pierderi DC/AC
- [ ] Documentație AOR / aviz tehnic racordare
- [ ] Template-uri DOCX pentru: cerere prosumator, schemǎ unifilara, certificare RE

### 1.3 Industria Electrică (prioritate constantă)
- [ ] Brânshament JT casnic / non-casnic / industrial
- [ ] Calc dimensionare cabluri + curent de scurtcircuit
- [ ] Template-uri: cerere racordare ENEL/Electrica, schiță IDP

### 1.4 Industria Construcții Civile (DTAC)
- [ ] Locuințe unifamiliale P/P+1/P+2
- [ ] Locuințe multifamiliale P+4 → P+10
- [ ] Template-uri: memoriu tehnic arhitectură, structură, instalații

### 1.5 Industria Telecomunicații (FTTH rezidential)
- [ ] FTTH single-mode + ODF + splittere
- [ ] FTTB multi-tenant blocuri
- [ ] Template-uri: memoriu tehnic, planuri canalizare TC

---

## P2 — ULTERIOR (Iterări viitoare)

### 2.1 AI Agents — implementare profundă
- [ ] Producer AI Agent: parse documentație veche → sugestii actualizare
- [ ] User AI Agent: ghid utilizator pe formular (validation realtime)
- [ ] Client AI Agent: chat clienți cu recomandări tarife/servicii
- [ ] Developer AI Agent: deja parțial implementat (ai_developer.py)

### 2.2 SEAP Integration (real-time)
- [ ] Cron job nightly: fetch from SEAP API
- [ ] Filtrare după ANRE/ANRP/ISCIR autorizații salvate per firmă
- [ ] Email digest zilnic

### 2.3 Encrypt at rest (P1 din backlog vechi)
- [ ] Fernet encryption pe `qes_credentials`
- [ ] Encrypt `gmail_app_password` la rest
- [ ] Encrypt `action_logs` (opțional)

### 2.4 QES Real Providers
- [ ] certSIGN subclass
- [ ] DigiSign subclass
- [ ] Trans Sped subclass
- [ ] Necesita API contract de la providers

### 2.5 Stripe Live Key
- [ ] Switch `sk_test_emergent` → `sk_live_...`
- [ ] Necesita cont Stripe activat

### 2.6 Team Workspaces + Role Inheritance
- [ ] Multi-user companie (1 plan Societate → N membri)
- [ ] Rol în societate (designer, executant, RTE, VGD, administrator)

### 2.7 Public Verification Page `/verify/{doc_id}`
- [ ] Hash SHA-256 verification public
- [ ] QR code pe document → link verificare

---

## P3 — Sub-domenii viitoare (158 planificate)

Vezi `/app/docs/INDUSTRIES_ROADMAP.md` pentru detaliul complet al sub-subcategoriilor.

- Total catalog curent: **34 subdomenii active**
- Planificate adițional: **+124 = 158 total**
- Ordine recomandată: gaze → fotovoltaice → electrică → construcții civile → telecom → apă → restul

---

_Această listă se actualizează după fiecare fază majoră. NU șterge linii. Marchează doar `[x]` la finalizare._


---
### Append [2026-06-06 12:51 UTC]
## Test append from automated test
- Test item 1
- Test item 2


---
### Append [2026-06-06 12:52 UTC]
## Test append from automated test
- Test item 1
- Test item 2
