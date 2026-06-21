# MASTER PLACEHOLDERS — Energy Project Design Gaze Naturale (V10.0)

> Document de referință autoritativ pentru AUDITUL platformei.
> Sursă: "Câmpuri de introdus în pagina gaze naturale.docx" uploadat de Dragoș Șerban
> pe 2026-06-21 (sesiunea V9.6). NU modifica fără acord explicit — este script-ul
> oficial după care se construiește produsul Gaze Naturale.

## 1. FUNCȚII PAGINĂ (sistem)
- Salvare preferințe (ultimă selecție + template implicit)
- În funcție de tip lucrare → apar câmpuri specifice + comune
- Listă selecție tip lucrare sus
- Câmpuri generale (toate lucrările) + câmpuri situaționale

## 2. OPERATOR SISTEM DISTRIBUȚIE — selecție cu search (32 OSD-uri RO)
1. Distrigaz Sud Rețele S.R.L.  · 2. Delgaz Grid S.A.  · 3. Premier Energy S.R.L.
4. Gaz Sud S.A.  · 5. Distrigaz Vest S.A.  · 6. Gaz Vest S.A.  · 7. Amarad Distribuție
8. B.E.R.G. Sistem Gaz  · 9. Cordun Gaz S.A.  · 10. CPL Concordia Cluj
11. Gaz Nord Est S.A.  · 12. Gazmir Iași  · 13. Hargaz Harghita Gaz
14. Intergaz Est  · 15. Măcin Gaz  · 16. M.M. Data  · 17. Mehedinți Gaz
18. Megaconstruct  · 19. Nova Power & Gas  · 20. Nord Gaz  · 21. Prisma Serv
22. Progaz P&D  · 23. Romgaz S.A.  · 24. Salgaz S.A.  · 25. Tulcea Gaz
26. Vega 93  · 27. Tehnologica Radion  · 28. Design Proiect  · 29. Dornacor Invest
30. Euro Seven Industry  · 31. Instant Construct Company  · 32. Oligopol
33. Coni S.R.L.  · 34. Mihoc Oil

**+ Denumire OSD (pseudonim public)** ex: Engie Romania S.A.

## 3. VERIFICATORI ATESTATI
### VGD
- Nume + prenume verificator atestat VGD
- Tip legitimație: VGD (fix)
- Număr legitimație
- Data expirare (alertă reînnoire)
### RTE
- Nume + prenume verificator atestat RTE
- Tip legitimație: RTE (fix)
- Număr legitimație
- Data expirare (alertă reînnoire)

## 4. TIP LUCRARE — listă selecție
- Branșament
- Extindere conductă
- Extindere conductă cu unul sau mai multe branșamente
- Instalație de utilizare
- Deviere
- Reabilitare
- Înlocuire
- Studiu de fezabilitate

## 5. SOCIETATEA PROIECTANTĂ
- Nume societate proiectantă
- Nume inginer proiectant
- Legitimație (PGD/PGT/PGIU/PGL/PGLT — listă)
- Număr legitimație
- Data expirare legitimație
- Sediu social
- CUI
- Telefon
- Fax
- Email
- Nume împuternicit reprezentant legal + telefon + CNP
- Nume administrator + CNP

## 6. SOCIETATEA EXECUTANTĂ
- Nume societate executantă
- Nume inginer executant
- Legitimație (EGD/EGT/EGIU/EGL/EGLT — listă)
- Număr legitimație
- Data expirare legitimație
- CUI societate
- Telefon
- Fax
- Email
- Nume împuternicit reprezentant legal + telefon + CNP

## 7. BENEFICIAR + AMPLASAMENT
- Nume beneficiar
- Amplasament lucrări (strada execuție)
- Amplasament imobil (adresa lucrare)
- Număr cadastral imobil (opțional)
- Număr cadastral traseu (opțional)

## 8. DOCUMENTE OSD
- Ordin de lucru (Nr/Data)
- ATR / Acord de acces (Nr/Data)

## 9. AVIZE OBȚINUTE (listă dinamică, search, adăugare nelimitată)
- Nume aviz (selectie cu search)
- Nr/Serie/Data
- Termen expirare (configurabil per aviz, cu alertă)

## 10. CERTIFICAT URBANISM / AUTORIZAȚIE CONSTRUIRE / ACORD DRUM
- Selecție tip (CU / AC / Acord drum)
- Nr/Serie/Data
- Termen expirare

## 11. AVIZE REÎNNOITE (listă dinamică, search)
- Nume aviz reînnoit
- Nr/Serie/Data
- Termen expirare

## 12. DEBIT + CALCULE
- Debit aprobat lucrare (Nmc/h)
- Lățime șanț branșament — CALCUL AUTOMAT:
  - Dn < 100mm → 0.40m
  - Dn >= 100mm → 0.40 + Dn_metri
- Lățime șanț conductă — același calcul
- Pat de cărămizi (calcul în funcție lungime traseu)
- Suprafață = lățime șanț × 0.4 (mp)

## 13. MATERIAL + DIAMETRU CONDUCTĂ PROIECTATĂ
### Material: PE100 SDR11 / OL — selecție
### Diametre PE (listă):
PE 32, 40, 50, 63, 75, 90, 110, 125, 160, 180, 200, 225, 250, 315, 355, 400
### Diametre OL (listă):
OL 1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 2 1/2", 3", 4", 6", 8", 10", 12", 14", 16", 20", 24", 28", 32"

## 14. TUB DE PROTECȚIE — CALCUL AUTOMAT (DA/NU + dimensionare)
### Lungime tub protecție (input)
### Diametru tub — formule:
- **Distribuție OL**:  Di_tub = De_izolată + 75 mm
- **Distribuție PE**:  Di_tub = De_conductă + 100 mm
- **Racord/branșament/IU OL**:  Di_tub = De_izolată + 50 mm
- **Racord/branșament/IU PE**:  Di_tub = De_conductă + 50 mm
### Tabel exemplu PE (+50mm):
PE 32 → 82mm · PE 40 → 90mm · PE 50 → 100mm · PE 63 → 113mm · PE 75 → 125mm
PE 90 → 140mm · PE 110 → 160mm · PE 125 → 175mm · PE 160 → 210mm
### Tabel exemplu PE distribuție (+100mm):
PE 32 → 132mm · PE 40 → 140mm · PE 63 → 163mm · PE 90 → 190mm · PE 110 → 210mm
PE 160 → 260mm · PE 200 → 300mm

## 15. EXTINDERE CU BRANȘAMENTE (multiple)
- Număr branșamente (dinamic, fiecare cu propriile câmpuri)
- Per branșament: lungime, material, diametru, tub protecție, pat cărămizi
- Conectare la conductă: existentă / proiectată
- Amplasament conductă racordare (strada, sector, oraș, județ)

## 16. CONSUMATORI (listă dinamică)
- Nume consumator
- Debit consumator (Nmc/h)
- Adăugare nouă → calcul Debit Total (Nmc/h)
- Pentru instalație utilizare: + Denumire încăpere + Aparat flacără deschisă (da/nu)
- Stare: Nou / Existent / Dezafectat

## 17. EXECUȚIE
- Tip branșament: subteran / ramificat
- Tip conductă existentă: subterană / supraterană
- Metodă execuție: șanț deschis / foraj orizontal dirijat / aerian (selecție)
- Dimensiuni gropi foraj (calcul automat conform NTPEE 2018)
- Regim juridic: domeniu public / privat / mixt (x m public + x m privat)

## 18. POSTUL DE REGLARE / FIRIDĂ
### Tip firidă:
- Post reglare (PR)
- Post măsurare (PM)
- Post reglare-măsurare (PRM/FPRM)
- Firidă echipată
- Firidă neechipată
### Model firidă (catalog selecție):
FPRM-F50-SF6-01-SP / S300 / S750 / configurare extinsă

## 19. REGULATOR + CONTOR + ROBINET BRANȘAMENT
### Debit regulator (auto in funcție Q_max):
6, 10, 25, 35, 50, 75, 100, 140, 160, 250, 400, 650, 1000+ m³/h
### Tip contor (auto in funcție Q_max):
G1.6 (2.5 m³/h) · G2.5 (4) · G4 (6) · G6 (10) · G10 (16) · G16 (25)
G25 (40) · G40 (65) · G65 (100) · G100 (160) · G160 (250) · G250 (400)
G400 (650) · G650 (1000) · G1000 (1600)
### Robinet branșament — corespondență OL↔PE:
OL 1/2" ≈ PE 20/25 · OL 3/4" ≈ PE 25/32 · OL 1" ≈ PE 32/40
OL 1 1/4" ≈ PE 40/50 · OL 1 1/2" ≈ PE 50 · OL 2" ≈ PE 63

## 20. LISTA MATERIALE BRANȘAMENT — generare automată
Ex: PE100 SDR11 Dn 32mm → 2 mufe + 1 teu PE100 SDR11 (Dn_conductă × Dn_branșament)
+ Fir trasor (cupru, 1.5mm, lungime = total instalație)
+ Bandă de avertizare (lungime totală)
+ Reducții PE100 SDR11 (selectabile Dn×Dn)

## 21. POZIȚIE BRANȘAMENT
- X m față de limita stânga/dreapta a imobilului

## 22. PRESIUNE
- P1 intrare (default 1.5 bar/bara, după trepte NTPEE)
- P2 ieșire (default 1.45 bar/bara)
- L = lungime branșament (km)
- ΔP = P1 - P2 (calcul automat)
- Presiune branșament: redusă / medie
- Presiune conductă existentă: joasă / redusă / medie / înaltă
- Presiune conductă proiectată: joasă / redusă / medie / înaltă

## 23. CALCUL VITEZĂ CURGERE (auto, ANRE)
- w = 4 × Q / (3600 × π × D²)
- Limită: w < 40 m/s subteran, < 20 m/s suprateran/post/contor
- Avertisment automat dacă depășit

## 24. CALCUL DIAMETRU (formule ANRE)
### Presiune medie/redusă (art. 50):
D = 0.56 × [(Q_CS² × T × L × δ × λ) / (P1² − P2²)]^0.2  [cm]
### Presiune joasă (art. 51):
D = 0.49 × [(Q² × T × L × δ × λ) / ΔP]^0.2  [cm]
### Lungime calcul:
Lc = 1.1...1.2 × Lf
### Reynolds:
Re = 2230 × Q_CS / D
λ = 64/Re (laminar) sau Colebrook (turbulent)

## 25. INSTALAȚIE UTILIZARE — CAMERE APARATE
Per cameră:
- Nume încăpere
- Înălțime H (m)
- Volum V = S × H (mc)
- Suprafață vitrată existentă SVe (mp)
- Suprafață vitrată necesară SVN = V × 0.02 (calcul)
- V/Q < 30 (raport, condiție aparate cu flacără)
- Priza aer S = 0.0025 × Q_instalat (mp)
- Grilă ventilare (în camerele cu flacără)
### Detector gaze
- Număr (auto = nr_camere + manual)

## 26. INSTALAȚIE UTILIZARE — TRASEU
- Bilanț tronsoane: material (OL/PE) + lungime + diametru
- Lungime totală = sumă tronsoane

## 27. FITTING-URI + ROBINEȚI + ELECTROVALVE (liste dinamice)
### Fitting-uri:
- Nume (cot/reducție/mufă/teu)
- Diametru (catalog OL+PE; pentru teuri+reducții: Dn × Dn)
- Număr buc
- Material (OL/PE)
### Robineți:
- Număr
- Diametru
- Material OL (implicit)
### Electrovalve:
- Număr
- Diametru
- Material OL (implicit)

## 28. CARTE TEHNICĂ + RECEPȚIE + SUDORI
- Nume diriginte șantier
- PV verificare calitate lucrări (Nr/Data)
- Nume sudor autorizat
- Număr autorizație sudor + data expirare
- Tabel suduri:
  - Nr.
  - Număr ordine (S31, S32, ...)
  - Defecte constatate
  - Rezultat (admis/respins)
- Numerotare automată = nr_mufe + nr_teuri
### PV-uri
- PV recepție tehnică branșament/conductă (Nr/Data)
- PV recepție stație/post reglare (Nr/Data)
- PV punere în funcțiune (Nr/Data)
- Raport lucrări executate (Nr/Data)
- Contract prestări servicii (Nr/Data)
- PV verificare calitate materiale (Nr/Data)
- Certificat calitate (Nr/Data + furnizor)

## 29. PROTOCOL SUDURI (per sudură — generare automată din aparat)
Câmpuri tipizate aparat Georg Fischer:
- Report n.
- Data + Ora
- Temperatura
- Versiune + Nr. serial + Revizie
- Date cuplare: tip + cooling time + dimensiune + volt + secunde
- Date sudură: Nr sudură, Tensiune min/max, Timp, Energie, REZULTAT

## 30. PLANURI ATAȘATE (upload nelimitat)
- Plan situație (min 1)
- Plan încadrare zonă (min 1)
- Schema suduri
- Pentru extindere: planuri și schițe nelimitate

## 31. ROLURI + PLANURI (matrice access)
### Operator introducere date
- Introduce date proiect, completează avize, trimite documentația
- Fără date tehnice + fără facturare
- Export lunar nelimitat
### Proiectant
- Doar fază DTAC (proiectare)
- Fără avize, fără PTH
- Export nelimitat semnată + certificată digital
### Executant
- Doar PTH + carte tehnică
- Fără avize, fără DTAC
- 50% mai scump decât proiectant
### VGD
- Editează proiecte primite
- Validează DTAC + PTH
- Plasează ștampila automat (1/pagină)
- Posibilitate retrimitere pentru corectură
### RTE
- Editează proiecte primite
- Validează cartea tehnică
- Plasează ștampila automat
### Contabilitate
- Generează facturi per aviz
- Bilanț plăți branșament
- Trimite documentația ANAF
- Rapoarte per lucrare + bilanț contabil
### Societate
- Toate funcțiile (operator + proiectant + executant + VGD + RTE + contabil + ofertare)
- 25% mai ieftin decât suma planurilor constituente
- 100 proiecte/lună
- Reînnoire automată / dezabonare oricând

## 32. ȘTAMPILE DIGITALE (per profil)
- Ștampilă personală în fiecare pagină
- Ștampilă firmă sub textul "Societate proiectantă/executantă"
- Plasare automată sau manuală (draggable)
- Upload per profil utilizator
- Certificat digital atașat

## 33. TRANSFER PROIECT între utilizatori
- Search după email / nume utilizator
- Importă automat: beneficiar, nr cadastral, tip lucrare, adresă, societate
- Permite operatorului să adauge ștampile + trimită utilități
- Audit log transfer

## 34. PLATĂ AVIZE DIRECT DIN PLATFORMĂ (STRUCTURAL — momentan dezactivat)
- Listă acreditate prețuri avize
- Plătește aviz → contul societății sau cont bancar afiliat
- Dovada de plată automată

## 35. SEAP — auto-apply (numai planuri: ofertare + operator + societate)
- Alerte real-time platforma SEAP
- Match cu autorizații legale firmă (nr angajați atestați, utilaje, specialitate)
- Auto-apply la anunțuri compatibile

## 36. NOTIFICĂRI APLICAȚIE
- Buton sus-dreapta în toate paginile
- Alerte: expirare avize, expirare legitimații, transferuri proiect, plăți, etc.

## 37. SUPPORT — formular utilizator
- Pagina profil → formular către `support@energyprojectdesign.com`
- Doar pentru implementări / bug-uri / feature requests

---

# 🚀 SERVICII PLATFORMĂ (Landing — extins V10.0)

## Pagini principale public:
1. Întocmire documentație electronică (CORE)
2. Forum profesional
3. Imobiliare
4. Vânzări
5. **Logistică**:
   - **Curierat** (subpagina) ← NOU V10.0
   - **Transport marfă** (logistic)
   - **Transport bunuri** (mutări)
   - **Transport persoane** ← NOU V10.0
6. Meseriași
7. Angajați platformă
8. Colaborări
9. Proiecte
10. Cariere
11. **Mediu** (sustenability, plantări copaci) ← NOU V10.0
12. **Spitale** (acces servicii medicale) ← NOU V10.0
13. **Cauze caritabile** ← NOU V10.0
14. **Biserică / Spiritualitate** ← NOU V10.0

## Comisioane fixe:
- Marketplace anunțuri: 10% / tranzacție
- Imobiliare: 15% din preț (10% către agent intern)
- Închiriere proprietate: 100 EUR / tranzacție
- Meseriași: 20% / tranzacție (10% recuperare prejudicii)
- Brokeri (acces baze date): cont plătit
- Listare societăți date contact: GRATUIT

---

## REZUMAT IMPLEMENTARE V10.0 (sesiunea curentă)

✅ Master placeholder list documentat (377 linii)
✅ Gmail SMTP credentials configurate
✅ 6 servicii noi adăugate pe Landing (curierat, transport persoane, mediu, spitale, caritabile, biserică)
⏳ TODO sesiuni viitoare (scop multi-month):
  - Implementare completă cele 37 secțiuni placeholder
  - Calc engine ANRE complet (formule art 50/51)
  - Plan-based permission matrix (operator/proiectant/executant/VGD/RTE)
  - Project transfer între utilizatori
  - Stamp upload per profil
  - Invoice generation per aviz
  - SEAP integration
  - Toate sub-serviciile (curierat, transport, mediu, spitale, caritabile, biserică)
