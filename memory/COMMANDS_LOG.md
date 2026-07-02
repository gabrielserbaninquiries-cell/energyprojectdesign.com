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

### CMD-02 · DE_FĂCUT · 2026-02
**Comandă literală:** Fix imagini realiste ecosistem — „logistica needs semi-truck (tir), curierat needs delivery van (dubiță), apa canal needs relevant water/sewage, piese auto & service auto ensure distinct + professional, telecom needs fiber optic installation/cables not generic circuit boards"
**Fișier:** `/app/frontend/src/data/services.js` + `/app/frontend/src/pages/Landing.jsx` (ACTIVE_SERVICES)
**Verificare:** Screenshot Landing + confirmare user

### CMD-03 · DE_FĂCUT · 2026-02
**Comandă literală:** „vad pe pagina de prezentare, 2 butoane cu aceeasi functie, sau acelasi path. 'incepe gratuit' si 'autentificare'. Aceste 2 pagini ar trebui unite cu functii combinate. Aceeasi pagina ar trebui sa contina 'incepe gratuit - logare cu google/cont si parola' sau logare cu cont existent. De asemenea, login-ul cu google ar trebui sa fie integrat ca in poza atasata"
**Interpretare:** 
 - Unificare pagini `/login` + `/register` într-o singură rută `/auth` (cu tabs: „Cont nou" / „Am deja cont")
 - Butonul Google sus, la fel cum e în screenshot-ul WhatsApp 2026-07-03 (Google G multicolor oficial)
 - Landing: „Începe gratuit" → `/auth?mode=signup` · „Autentificare" → `/auth?mode=signin`
**Verificare:** Testing agent + screenshot

### CMD-04 · DE_FĂCUT · 2026-02 (BUG raportat)
**Comandă literală:** „pagina inca se blocheaza pe o limba selectata si nu revine la vechea limba implicita, sau nu permite schimbarea de alte limbi"
**Fișier:** `/app/frontend/src/components/GlobalTranslator.jsx`
**Root cause suspectat:** Cookie `googtrans` nu se șterge complet pe toate variantele de domain (root + subdomain) → Google Translate reia limba veche după reload
**Verificare:** Screenshot: RO→EN→FR→RO — toate să funcționeze

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
