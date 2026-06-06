# 🗺️ Roadmap industrii — subcategorii detaliate pentru implementare

> Documentul listează **toate sub-domeniile** pentru fiecare din cele 8 industrii active în EPD V4.9.
> Sursa: cercetare web (cadrul legal Romania), standarde UE, practica reală din ANRE, ANRP, ISCIR, AFER.
> Stadiu curent: toate industriile activate la nivel de catalog (`backend/industries.py`) cu 34 subdomenii expuse.
> Pentru fiecare subdomeniu enumerat mai jos trebuie implementate ulterior: template-uri DOCX dedicate, câmpuri tehnice specifice, formule de calcul aplicabile, listă avize, listă recipienți email.

---

## 🔥 1. Inginerie gaze naturale (activ — cu template-uri)

### Subdomenii actuale (5 active)
| Subdomeniu | Status | Template-uri | Calcule |
|------------|--------|--------------|---------|
| Branșamente gaze naturale | ✅ Full | Cerere racordare, Memoriu tehnic, Borderou, Adresă OSD, Certificare VGD/RTE | Debit, presiune, contor, cost |
| Instalații utilizare gaze | ✅ Activ | (de adăugat) DTM, Schiță execuție | Putere instalată, dimensionare |
| Extinderi conductă | ✅ Activ | (de adăugat) Memoriu, Caiet sarcini | Diametre, tronsoane |
| Studii fezabilitate | ✅ Activ | (de adăugat) SF tehnico-economic | Eficiență |
| Înlocuiri / Reabilitări | ✅ Activ | (de adăugat) Necesar lucrări | Vechime, uzură |

### Sub-subcategorii viitoare (15)
- Branșament gaze casnic (1-6 m³/h) · Branșament gaze non-casnic (> 6 m³/h)
- Stație Reglare-Măsurare Predare (SRM)
- Post Reglare Măsurare (PRM) industrial
- Conducte gaze naturale presiune medie/înaltă
- Conducte ramificație fier ductil / PE-HD / PE-AlSic
- Stații de comprimare gaze (CNG)
- Stații de lichefiere gaze (LNG) — mici
- Sisteme detecție-alarmă gaze (CO, CH₄)
- Centrale termice industriale gaz
- Cogenerare gaz pe site
- Documentații ISCIR pentru recipiente sub presiune (autoclave, vase)
- Schimbătoare de combustibil (gaz lichefiat → gaz natural)
- Audit eficiență energetică gaze
- Documentații pentru autorizație gaze tehnologice (HVAC industrial)

---

## ⚡ 2. Inginerie electrică (catalog activ — fără template-uri)

### Subdomenii catalog (5)
- Branșamente electrice (JT) · Instalații interioare · Extinderi rețea (JT/MT) · Posturi transformare · Studii coexistență

### Sub-subcategorii viitoare (20)
- Branșament monofazic (până la 5 kVA) · Trifazic (până la 20 kVA) · Trifazic industrial (> 20 kVA)
- Rețele aeriene LEA 0,4 kV / 6 kV / 20 kV
- Rețele subterane LES 0,4 kV / 6 kV / 20 kV
- Posturi transformare aeriene PTA · Posturi transformare în anvelopă PTAB
- Stații electrice 110/MT (după caz, special permise)
- Iluminat public stradal · iluminat ornamental · iluminat sportiv
- Instalații electrice industriale (zone Ex — Ex-proof)
- Tablouri electrice de distribuție TE / TG / TS
- Sisteme priza-de-pământ + paratrăsnet (PRD, IPT)
- Sisteme UPS / generatoare diesel backup
- Stații încărcare vehicule electrice (EV chargers) — AC 22 kW, DC 50-350 kW
- Sisteme de detecție incendiu electric (SCI/SDS)
- Auto-acționare iluminat (DALI, KNX, modbus)
- Certificare ANRE proiectant electric (gradul II/I) · executant ANRE

---

## 💧 3. Apă & canalizare (catalog activ)

### Subdomenii catalog (5)
- Branșamente apă potabilă · Racorduri canalizare menajeră · Extinderi rețea · Stații pompare · Canalizare pluvială

### Sub-subcategorii viitoare (18)
- Racord apă potabilă casnic / non-casnic / industrial
- Rețele apă PN10 / PN16 — PEHD, PVC, fontă ductilă
- Hidranți exteriori — supraterani · subterani · de incendiu
- Stații tratare apă potabilă (STAP) — captare, decantare, filtrare, dezinfecție
- Stații epurare ape uzate (SEAU) — mecanică, biologică (PIIPN), terțiară
- Bazine ape pluviale (retenție, infiltrare)
- Canalizare separativă · canalizare unitară · canalizare mixtă
- Construcții hidrotehnice — baraje mici, captări de izvor
- Sisteme irigații agricole · sisteme picurat
- Recipiente sub presiune ISCIR — autoclave, vase expansiune
- Rezervoare apă potabilă (semi-îngropate, suprafață)
- Pompe submersibile · pompe centrifugale
- Studii ANANP pentru gospodărirea apelor (avize de gospodărire)

---

## 🏗️ 4. Construcții civile (catalog activ)

### Subdomenii catalog (3)
- DTAC (Autorizații construire) · Proiecte tehnice execuție (PT) · Expertize tehnice

### Sub-subcategorii viitoare (15)
- Locuințe unifamiliale (P, P+1, P+2 cu mansardă)
- Locuințe multifamiliale (blocuri P+4 până la P+10)
- Ansambluri rezidențiale (PUZ + PUD)
- Spații comerciale (parter + etaj)
- Sedii birouri (clasa A/B/C)
- Hoteluri / pensiuni / agroturism
- Spații educaționale (școli, grădinițe, universități)
- Spații culturale (muzee, biblioteci)
- Spații medicale (cabinete, policlinici, spitale — categoria 1/2/3)
- Spații sportive (sală, terenuri, stadioane)
- Construcții pentru agricultură (siloz, hală, fermă)
- Schimbări destinație + modernizări existente
- Consolidări structurale + reabilitări termice (Programul Casa Verde)
- Spații parcaje supraterane / subterane / multietajate
- Cimitire + capele (lucrări de artă funerară)

---

## 📡 5. Telecomunicații (catalog activ)

### Subdomenii catalog (3)
- Rețele fibră optică (FTTH/FTTB) · Infrastructură mobilă (BTS) · Canalizații tc

### Sub-subcategorii viitoare (16)
- FTTH single-mode + ODF + splittere
- FTTB pentru blocuri (point-to-multipoint)
- Rețele backbone (DWDM/OTN — operator class)
- Antene macro (3G/4G/5G) — turn metalic, pe acoperiș, pe stâlp
- Antene small-cell · DAS în clădiri mari
- Centre date (CD) — Tier I/II/III/IV — cabluri date, NOC
- Sisteme TVR coletoare (CATV — HFC)
- Sisteme satelit (uplink/downlink — VSAT)
- Rețele LoRaWAN / NB-IoT pentru smart-city
- Sisteme stație de bază TETRA (urgente, ISU)
- Telefonie clasică (linii cupru — POTS) — încă cerută pentru sec. 112
- Canalizații TC subterane (PVC ϕ110, PE ϕ50)
- Camere de tragere · camere de joncțiune
- Sisteme intercom video — clădiri rezidențiale
- Sisteme paging — spitale, hoteluri

---

## ☀️ 6. Fotovoltaice (catalog activ)

### Subdomenii catalog (4)
- FV rezidențial (prosumator) · FV comercial · Parcuri FV · Racordare distribuitor

### Sub-subcategorii viitoare (14)
- FV rezidențial < 10 kWp (prosumator simplificat — fără AOR)
- FV rezidențial 10-27 kWp (prosumator cu AOR — aviz tehnic racordare)
- FV pe acoperiș comercial 27-200 kWp (autoconsum + injecție)
- FV pe acoperiș industrial 200-1000 kWp
- Parc FV teren agricol 1-5 MWp
- Parc FV teren agricol 5-50 MWp (cu stație MT/IT)
- Parc FV pe apă (floating PV) — recent în RO
- Parc FV agrivoltaic (agricultură + FV pe același teren)
- Centrale solare termice — apa caldă menajeră (panouri solare termice)
- Sisteme stocare BESS (Battery Energy Storage System) — lithium-ion, vanadium-flow
- Stații încărcare EV alimentate cu FV
- Microgrid + smart-grid (FV + BESS + diesel + grid)
- Audit performanță parc FV existent (yield + degradare)
- Documentații PRSC pentru bilanțuri (ANRE)

---

## 🏢 7. Construcții imobile (catalog activ)

### Subdomenii catalog (5)
- Rezidențial · Comercial · Industrial · Autorizații construire · Recepție lucrări

### Sub-subcategorii viitoare (12)
- Locuințe rezidențiale P+M până la P+2
- Blocuri rezidențiale 4-10 etaje cu RTU
- Vile + reședințe (clasa A — peste 1000 mp)
- Hoteluri 3-5 stele
- Sedii birouri grade A clasa BREEAM/LEED
- Restaurante + cafenele + cluburi
- Spații comerciale street-level / mall
- Hale industriale stocuri / producție
- Spații logistice mari (Class A — distribuție regional)
- Cresterie animale + ferme avicole (zoo-tehnice)
- Sere agricole industriale (peste 1 ha)
- Construcții speciale (silozuri, depozite explozibili, zone Ex)

---

## 🚆 8. Infrastructură feroviară (catalog activ)

### Subdomenii catalog (4)
- Cale ferată · Electrificare CF · Lucrări de artă feroviare · Stații CF

### Sub-subcategorii viitoare (14)
- Cale ferată cu ecartament normal 1435 mm (linie nouă)
- Cale ferată ecartament larg 1520 mm (CFR Constanța)
- Cale ferată viteză mare (250-300 km/h — proiecte UE)
- Modernizare linie CF (suprastructură + infrastructură)
- Întreținere capitală + curentă (PRC, PRI)
- Electrificare 25 kV / 50 Hz cu LCC + SCB
- Tracțiune feroviară (locomotive electrice + diesel)
- Echipamente SCB clasice (mecanic, electromecanic) + ETCS L1/L2
- Poduri feroviare beton + metalice (peste 30 m deschidere)
- Pasarele feroviare pentru pietoni
- Tuneluri feroviare (peste 500 m — categoria A)
- Viaducte feroviare (peste 100 m lungime)
- Stații CF mici (halte) + medii (1-3 trenuri/zi) + mari (hub)
- Depouri feroviare + ateliere de reparații (AR)

---

## 📦 Total subdomenii planificate

| Industrie | Catalog curent | Planificate viitor |
|-----------|---------------|--------------------|
| Gaze naturale | 5 | +15 = **20** |
| Electrică | 5 | +20 = **25** |
| Apă & canalizare | 5 | +18 = **23** |
| Construcții civile | 3 | +15 = **18** |
| Telecomunicații | 3 | +16 = **19** |
| Fotovoltaice | 4 | +14 = **18** |
| Construcții imobile | 5 | +12 = **17** |
| Infrastructură feroviară | 4 | +14 = **18** |
| **TOTAL** | **34** | **+124 = 158 subdomenii** |

---

## 🎯 Ordine recomandată de implementare (P0 → P3)

**P0 — Pilonul actual (gaz):**
- Toate cele 20 sub-domenii gaz, cu template-uri DOCX dedicate per sub-subcategorie

**P1 — Cu cerere mare de piață:**
1. Fotovoltaice rezidențiale (< 27 kWp prosumator) — boom în RO 2024-2025
2. Branșamente electrice JT casnice
3. Locuințe unifamiliale (DTAC) — cerere constantă
4. FTTH rezidențial

**P2 — Specializate, mare valoare:**
- Parcuri FV mari (peste 1 MWp)
- Hale industriale + spații logistice
- Stații încărcare EV
- BESS / microgrid

**P3 — Nișe avansate (după validarea P1/P2):**
- Infrastructura feroviară (clienți: CFR, METROREX, transport regional)
- Stații tratare apă + epurare
- Construcții speciale (zone Ex, recipiente sub presiune)

---

## 🛠️ Modul de implementare pentru fiecare subdomeniu nou

1. **Catalog** (`backend/industries.py`): adăugare entry în `subdomains` array
2. **Câmpuri tehnice** (`models.py`): adăugare la `technical_data` schema condiționată
3. **Calcule** (`calc_engine.py`): formule specifice (ex: pentru FV — `randament_panou`, `pierderi_DC/AC`)
4. **Template-uri DOCX** (`system_templates.py`): seed cu placeholder-e domain-specific
5. **Listă recipienți email** (în viitor — `recipients_engine.py`): mapping role → email default
6. **Validări** (`verification.py`): câmpuri obligatorii specifice
7. **OSD/avize specifice**: ex. Distrigaz pentru gaz, ENEL/ELECTRICA pentru electric, Apa Nova pentru apă

---

_Actualizat: 2026-02-06_
_Maintainer: EPD AI Developer Agent (acces via `/developer/github`)_
