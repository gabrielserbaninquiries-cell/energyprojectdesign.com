# Catalog Complet Placeholdere — Pagina Gaze Naturale EPD

> Document tehnic generat pe baza specificațiilor "Camuri de introdus in pagina gaze naturale.docx"
> și a modelului "Proiect bransament.docx".
> Toate placeholderele sunt utilizabile în DOCX-uri sub forma `{{key}}`.

## Cuprins
1. [Câmpuri generale (toate tipurile de lucrări)](#1-câmpuri-generale)
2. [Branșament](#2-branșament)
3. [Extindere conductă](#3-extindere-conductă)
4. [Instalație de utilizare](#4-instalație-de-utilizare)
5. [Avize și acorduri](#5-avize-și-acorduri)
6. [Calcule automate (formule)](#6-calcule-automate)
7. [Lista de materiale (generare automată)](#7-lista-de-materiale)
8. [Suduri & Protocol calitate](#8-suduri--protocol-calitate)
9. [Documente generate](#9-documente-generate)
10. [Reguli de plan și permisiuni](#10-reguli-de-plan-și-permisiuni)

---

## 1. Câmpuri generale

| Key placeholder | Label UI | Tip | Surse / Valori |
|----|----|----|----|
| `osd_nume` | Operator Sistem Distribuție | select-search | 35+ companii (Distrigaz Sud, Delgaz Grid, Premier Energy, Gaz Sud, Distrigaz Vest, Gaz Vest, Amarad Distribuție, B.E.R.G. Sistem Gaz, Cordun Gaz, CPL Concordia, Gaz Nord Est, Gazmir Iași, Hargaz Harghita Gaz, Intergaz Est, Măcin Gaz, M.M. Data, Mehedinți Gaz, Megaconstruct, Nova Power & Gas, Nord Gaz, Prisma Serv, Progaz P&D, Romgaz, Salgaz, Tulcea Gaz, Vega 93, Tehnologica Radion, Design Proiect, Dornacor Invest, Euro Seven Industry, Instant Construct Company, Oligopol, Coni, Mihoc Oil) |
| `osd_denumire_public` | Denumire OSD (pseudonim) | input | ex: Engie Romania S.A. |
| `osd_sediu_social` | Sediu social OSD | input | adresa completă |
| `vgd_nume` | Nume verificator atestat VGD | input | |
| `vgd_legitimatie_tip` | Tip legitimație VGD | const | VGD |
| `vgd_legitimatie_nr` | Număr legitimație VGD | input | |
| `vgd_legitimatie_exp` | Data expirare legitimație VGD | date | alertă reînnoire |
| `rte_nume` | Nume verificator atestat RTE | input | |
| `rte_legitimatie_tip` | Tip legitimație RTE | const | RTE |
| `rte_legitimatie_nr` | Număr legitimație RTE | input | |
| `rte_legitimatie_exp` | Data expirare legitimație RTE | date | |
| `tip_lucrare` | Tip lucrare | select | Branșament / Extindere conductă / Extindere + branșamente / Instalație utilizare / Deviere / Reabilitare / Înlocuire / Studiu fezabilitate |
| `nr_proiect` | Număr de proiect | input | |
| `proiectant_societate` | Nume societate proiectantă | input | |
| `proiectant_sediu` | Sediu social societate proiectantă | input | |
| `proiectant_cui` | CUI societate proiectantă | input | |
| `proiectant_telefon` | Telefon societate proiectantă | input | |
| `proiectant_fax` | Fax societate proiectantă | input | |
| `proiectant_email` | Email societate proiectantă | input | |
| `proiectant_admin_nume` | Nume administrator soc. proiectantă | input | |
| `proiectant_admin_cnp` | CNP administrator soc. proiectantă | input | |
| `proiectant_reprez_nume` | Reprezentant legal soc. proiectantă | input | |
| `proiectant_reprez_cnp` | CNP reprezentant legal soc. proiectantă | input | |
| `proiectant_reprez_telefon` | Telefon reprezentant legal soc. proiectantă | input | |
| `proiectant_inginer_nume` | Nume inginer proiectant | input | |
| `proiectant_inginer_legit_tip` | Tip legitimație inginer proiectant | select | PGD / PGT / PGIU / PGL / PGLT |
| `proiectant_inginer_legit_nr` | Număr legitimație inginer proiectant | input | |
| `proiectant_inginer_legit_exp` | Expirare legitimație inginer proiectant | date | |
| `executant_societate` | Nume societate executantă | input | |
| `executant_cui` | CUI societate executantă | input | |
| `executant_telefon` | Telefon societate executantă | input | |
| `executant_fax` | Fax societate executantă | input | |
| `executant_email` | Email societate executantă | input | |
| `executant_reprez_nume` | Reprezentant legal soc. executantă | input | |
| `executant_reprez_cnp` | CNP reprezentant legal soc. executantă | input | |
| `executant_reprez_telefon` | Telefon reprezentant legal soc. executantă | input | |
| `executant_inginer_nume` | Nume inginer executant | input | |
| `executant_inginer_legit_tip` | Tip legitimație inginer executant | select | EGD / EGT / EGIU / EGL / EGLT |
| `executant_inginer_legit_nr` | Număr legitimație inginer executant | input | |
| `executant_inginer_legit_exp` | Expirare legitimație inginer executant | date | |
| `beneficiar_nume` | Nume beneficiar | input | |
| `beneficiar_cnp_cui` | CNP / CUI beneficiar | input | |
| `beneficiar_telefon` | Telefon beneficiar | input | |
| `beneficiar_email` | Email beneficiar | input | |
| `amplasament_lucrari` | Amplasament lucrări (strada) | input | strada pe care se execută |
| `amplasament_imobil` | Amplasament imobil (adresa lucrare) | input | adresa imobilului |
| `nr_cadastral_imobil` | Număr cadastral imobil | input | opțional |
| `nr_cadastral_traseu` | Număr cadastral traseu | input | opțional |
| `regim_juridic` | Regim juridic execuție | select | public / privat / public+privat |
| `regim_public_m` | Lungime în domeniul public (m) | number | |
| `regim_privat_m` | Lungime în domeniul privat (m) | number | |
| `ordin_lucru_nr` | Ordin de lucru — număr | input | emitent: Distrigaz / Engie / etc. |
| `ordin_lucru_data` | Ordin de lucru — dată | date | |
| `atr_nr` | Aviz tehnic racordare (ATR) — număr | input | |
| `atr_data` | ATR — dată | date | |
| `debit_aprobat_nmc` | Debit aprobat (Nmc/h) | number | |

## 2. Branșament

| Key placeholder | Label UI | Tip | Note |
|----|----|----|----|
| `br_material` | Material branșament proiectat | select | PE100 SDR11 / OL |
| `br_diametru_dn` | Diametru branșament proiectat | select | PE: 32/40/50/63/75/90/110/125/160/180/200/225/250/315/355/400; OL: 1/2"...32" |
| `br_lungime_m` | Lungime branșament (m) | number | |
| `br_tip` | Tip branșament | select | subteran / ramificat |
| `br_pozitie_distanta` | Poziție branșament — distanță față de limită (m) | number | |
| `br_pozitie_limita` | Limită de referință | select | stânga / dreapta |
| `br_racordare_la` | Branșamentul se va racorda la | select | conducta existentă / proiectată |
| `br_conducta_existenta_amplasament` | Amplasament conductă (stradă, sector, oraș, județ) | input | |
| `br_executie` | Execuție prin | select | șanț deschis / foraj orizontal dirijat / aerian |
| `br_latime_sant_m` | Lățime șanț branșament (m) | calc | Dn<100mm → 0.40 m; Dn≥100mm → 0.40 + Dn_metri |
| `br_tub_protectie` | Tub de protecție branșament? | bool | da/nu |
| `br_tub_lungime_m` | Lungime tub protecție (m) | number | |
| `br_tub_diametru_mm` | Diametru tub protecție (mm) | calc | PE: De + 50 mm pentru branșament; OL: De_izolat + 50 mm |
| `br_pat_caramizi_mp` | Suprafață pat cărămizi (mp) | calc | Lățime șanț × 0.40 × Lungime |
| `br_robinet_dn` | Diametru robinet branșament | calc | corespondență automată cu diametrul branșamentului |
| `br_robinet_material` | Material robinet branșament | select | OL (implicit) |
| `br_regulator_dn` | Diametru regulator | calc | în funcție de diametru branșament |
| `br_regulator_debit_max` | Debit max regulator | calc | 6/10/25/35/50/75/100/140/160/250/400/650/1000+ m³/h |
| `br_contor_tip` | Tip contor | calc | G1.6 / G2.5 / G4 / G6 / G10 / G16 / G25 / G40 / G65 / G100 / G160 / G250 / G400 / G650 / G1000 |
| `br_contor_qmax` | Qmax contor (m³/h) | calc | |
| `br_firida_tip` | Tip firidă | select | Post Reglare (PR) / Post Măsurare (PM) / Post Reglare-Măsurare (PRM/FPRM) / Firidă echipată / Firidă neechipată |
| `br_firida_model` | Model firidă | input | FPRM-F50-SF6-01-SP / S300 / S750 etc. |
| `br_p1_bar` | P1 — presiune intrare (bar) | number | implicit 1.5 |
| `br_p2_bar` | P2 — presiune ieșire (bar) | number | implicit 1.45 |
| `br_delta_p_bar` | ΔP = P1 − P2 (bar) | calc | calc auto |
| `br_l_km` | Lungime conductă (km) | calc | calc auto din `br_lungime_m` / 1000 |
| `br_presiune` | Presiune branșament | select | redusă / medie |
| `br_viteza_calculata_ms` | Viteză calculată gaz (m/s) | calc | w = 4×Q / (3600×π×D²) |
| `br_viteza_conformitate` | Conformitate viteză | calc | < 40 m/s subteran / < 20 m/s suprateran |
| `br_dimensiuni_gropi_sudare` | Dimensiuni gropi sudare (m) | calc | NTPEE/Ord ANRE 89/2018 |
| `br_consumatori_lista` | Lista consumatori (tabel) | repeat | nume + debit Nmc/h |
| `br_consumatori_debit_total_nmc` | Debit total consumatori (Nmc/h) | calc | sumă |

## 3. Extindere conductă

| Key placeholder | Label UI | Tip | Note |
|----|----|----|----|
| `cnd_lungime_totala_m` | Lungime totală extindere (m) | input | din ATR/Ordin lucru |
| `cnd_supraterana_subterana` | Pozare conductă | select | supraterană / subterană / mixtă |
| `cnd_executie` | Execuție prin | select | șanț deschis / foraj / aerian / mixt |
| `cnd_material_existent` | Material conductă existentă | select | PE100 SDR11 / OL |
| `cnd_dn_existent` | Diametru conductă existentă | select | catalog complet |
| `cnd_material_proiectat` | Material conductă proiectată | select | PE100 SDR11 / OL |
| `cnd_dn_proiectat` | Diametru conductă proiectată | select | catalog complet |
| `cnd_presiune_existenta` | Presiune conductă existentă | select | joasă / redusă / medie / înaltă |
| `cnd_presiune_proiectata` | Presiune conductă proiectată | select | joasă / redusă / medie / înaltă |
| `cnd_n_bransamente` | Număr branșamente extindere | number | la fiecare apare secțiune nested |
| `cnd_ol_comun` | Ordin lucru comun branșamente | bool | da/nu + câmp opțional |
| `cnd_atr_comun` | ATR comun branșamente | bool | da/nu + câmp opțional |
| `cnd_metoda_cuplare` | Metoda de cuplare | input | ex: vana clopot + diametru |
| `cnd_metoda_cuplare_piese` | Piese folosite la cuplare | repeat | nume + Dn |
| `cnd_latime_sant_m` | Lățime șanț conductă (m) | calc | aceeași formulă ca branșament |
| `cnd_tub_protectie` | Tub protecție conductă (mm) | calc | PE: De + 100 mm distribuție; OL: De_izolat + 75 mm |
| `cnd_pat_caramizi_mp` | Suprafață pat cărămizi (mp) | calc | |
| `cnd_carte_tehnica_disponibila` | Carte tehnică extindere disponibilă | bool | da/nu |
| `cnd_contract_racordare_nr` | Număr contract racordare | input | |
| `cnd_tipuri_suduri` | Tipuri suduri | select | electrofuziune / arc electric / mixt |
| `cnd_viteza_calculata_ms` | Viteză calculată (m/s) | calc | formula Renouard adaptată |
| `cnd_dn_recomandat_calc` | Diametru recomandat (calc) | calc | conform art. 50/51 ANRE |

### 3.1 Branșamente nested în extindere
Pentru fiecare branșament în lista `cnd_bransamente[i]`, sunt expuse toate placeholderele din secțiunea **2. Branșament** sub forma:
- `cnd_bransamente[0].br_material`
- `cnd_bransamente[0].br_diametru_dn`
- `cnd_bransamente[0].br_lungime_m`
- etc.

## 4. Instalație de utilizare

| Key placeholder | Label UI | Tip | Note |
|----|----|----|----|
| `iu_tip_instalatie` | Tip instalație | select | modificare / separare / îndepărtare / refacere documentație / IUGN nouă / suplimentare debit / renominalizare |
| `iu_executata_din` | Lucrare executată din | select | coloană comună existentă / coloană nouă / branșament existent |
| `iu_contor_status` | Contor | select | existent / nou |
| `iu_contor_tip` | Tip contor (G…) | calc | selecție automată în funcție de debitul total |
| `iu_contor_qmax` | Qmax contor (m³/h) | calc | trebuie > debit instalat |
| `iu_imobil_tip` | Tip imobil | select | apartament bloc / casă curte / vilă / apartament vilă / spațiu comercial / restaurant / alt |
| `iu_lungime_totala_traseu_ml` | Lungime totală traseu (ml) | calc | sumă tronsoane |
| `iu_consumatori_lista` | Listă consumatori (tabel) | repeat | nume, debit, încăpere, aparat flacără deschisă (da/nu), status (nou/existent/dezafectat) |
| `iu_consumatori_debit_total_nmc` | Debit total instalat (Nmc/h) | calc | |
| `iu_camere_lista` | Listă camere aparate (tabel) | repeat | denumire, H (m), Volum V = SxH, SVe existentă, SVN calc auto = V × 0.02 |
| `iu_camera_vq_raport` | V/Q per cameră | calc | trebuie < 30 |
| `iu_priza_aer_S` | Priză aer S (cm²) | calc | S = 0.0025 × Qi (doar flacără deschisă) |
| `iu_detectori_nr` | Număr detectori gaze | calc | auto-suplimentar pe camere flacără deschisă + holuri |
| `iu_bilant_traseu` | Bilanț traseu (tabel material × lungime × diametru) | repeat | OL / PE + L + Dn |
| `iu_fittinguri_lista` | Lista fittinguri | repeat | nume (cot/reducție/mufă/teu) + Dn + nr + material |
| `iu_fittinguri_total` | Total fittinguri | calc | |
| `iu_robineti_lista` | Lista robineți | repeat | nr + Dn + material (OL implicit) |
| `iu_robineti_total` | Total robineți | calc | |
| `iu_electrovalve_lista` | Lista electrovalve | repeat | nr + Dn + material |
| `iu_electrovalve_total` | Total electrovalve | calc | |
| `iu_viteza_calculata_ms` | Viteză gaz (m/s) | calc | < 20 m/s la interior |
| `iu_dn_recomandat` | Diametru minim recomandat | calc | conform art. 51 ANRE (joasă presiune) |

## 5. Avize și acorduri

Structură repeat (`avize[]`), fiecare cu următoarele placeholdere:

| Key placeholder | Tip | Note |
|----|----|----|
| `avize[i].nume` | select-search | catalog complet avize (Aviz Apa Nova, E-Distribuție, Telekom, RDS, Netcity, Brigada Rutieră, ISU, Mediu, etc.) |
| `avize[i].nr` | input | nr/serie |
| `avize[i].data_emiterii` | date | |
| `avize[i].termen_expirare` | date | duruare configurabilă per aviz |
| `avize[i].observatii` | textarea | |
| `avize[i].fisier` | file | upload PDF/JPG |
| `avize[i].destinatar_email` | input | email implicit la care se trimite cererea |

Subcategorii:
- **CU / Acord administrator drum / Autorizație de construcție** — `cu_lista[]`
- **Aviz reînnoit** — `avize_reinnoite[]`

## 6. Calcule automate

### 6.1 Lățime șanț
```
Dn < 100 mm → latime_sant = 0.40 m
Dn ≥ 100 mm → latime_sant = 0.40 + (Dn / 1000) m
```

### 6.2 Pat cărămizi
```
suprafata_mp = latime_sant × 0.40 × lungime_m
```

### 6.3 Diametru tub protecție
```
Distribuție PE  : Di_tub = De_conducta + 100 mm
Distribuție OL  : Di_tub = De_izolat + 75 mm
Racord/branșament PE  : Di_tub = De_conducta + 50 mm
Racord/branșament OL  : Di_tub = De_izolat + 50 mm
```

### 6.4 Viteză gaz în conductă
```
w = 4 × Q / (3600 × π × D²)
Q [m³/h], D [m], w [m/s]
```
**Limite:**
- Supraterane: w ≤ 20 m/s
- Subterane: w ≤ 40 m/s
- Amonte regulator: w ≤ 30 m/s
- Aval regulator / lângă contor: w ≤ 20 m/s

### 6.5 Diametru minim (Ord ANRE 89/2018)

**Presiune joasă** (art. 51):
```
D = 0.49 × [(Q² × T × L × δ × λ) / ΔP] ^ 0.2
```
- D [cm], Q [m³/h], T [K], L [m], δ = 0.554, ΔP [mbar]

**Presiune redusă / medie** (art. 50):
```
D = 0.56 × [(Qcs² × T × L × δ × λ) / (P1² − P2²)] ^ 0.2
```
- D [cm], Qcs [m³/h CS], T [K], L [km], P1/P2 [bar absolut], δ = 0.554

### 6.6 Diametre minime obligatorii (art. 58)
- Racorduri / instalații utilizare: min 1" OL / min Dn 32 PE
- Conducte distribuție: min 2" OL / min Dn 40 PE

### 6.7 Cădere presiune joasă (art. 49)
- Distribuție joasă presiune: ΔP_total = 0.01 bar (cu 0.03 bar la ieșire stație)
- Conductă + racord: 0.005 bar
- Instalație utilizare + contor: 0.005 bar (5 mbar)

### 6.8 Coeficient Reynolds și λ
```
Re = 2230 × Qcs / D  (D [m])
Pentru Re < 2300:  λ = 64 / Re
Pentru Re ≥ 2300:  Colebrook/Prandtl în funcție de Re, D, rugozitate k
```

## 7. Lista de materiale (generare automată)

La fiecare configurare branșament, sistemul generează automat:

| Material | Cantitate | Regulă |
|----|----|----|
| Țeavă PE100 SDR11 / OL | L_branșament | conform `br_diametru_dn` |
| Mufă PE100 SDR11 | 2 buc (capete) | conform Dn |
| Teu / Șa de branșament | 1 buc | conform Dn principală × Dn branșament |
| Reducție PE100 SDR11 | n buc | doar dacă există tranziții |
| Robinet branșament | 1 buc | conform Dn |
| Tub protecție | 1 buc | doar dacă `br_tub_protectie = true` |
| Fir trasor cupru 1.5 mm | L_total | obligatoriu pe traseu îngropat |
| Bandă avertizare | L_total | obligatoriu |
| Regulator | 1 buc | conform debit max |
| Contor (G…) | 1 buc | conform debit max |
| Firidă | 1 buc | conform `br_firida_tip` + `br_firida_model` |
| Cărămizi pat | suprafata_mp × 50 buc/mp | doar la traseu îngropat |

## 8. Suduri & Protocol calitate

| Key placeholder | Tip | Note |
|----|----|----|
| `sudor.nume` | input | Nume sudor autorizat ANRE |
| `sudor.autorizatie_nr` | input | Nr. autorizație ANRE |
| `sudor.autorizatie_exp` | date | Data expirare autorizație |
| `examinari_vizuale[i]` | repeat | Per rând: `nr`, `numar_sudura` (Sxxx), `defecte`, `rezultat` (Admis/Respins) |
| `protocoale_suduri[i]` | repeat | Per protocol: `nr_sudura`, `tensiune_min` (V), `tensiune_max` (V), `timp_sec`, `energie_kj`, `temperatura_c`, `rezultat` (OK/Respins) |
| `pv[i]` | repeat | Per PV: `tip` (din 10 tipuri), `nr`, `data`, `participanti`, `observatii` |
| `tip_sudura_implicit` | const | electrofuziune |
| `pv_calitate_materiale_nr` | input | nr+dată PV calitate materiale |
| `pv_receptie_tehnica_nr` | input | nr+dată PV recepție tehnică branșament/conductă |
| `pv_receptie_prm_nr` | input | nr+dată PV recepție post reglare-măsurare |
| `pv_pif_nr` | input | nr+dată PV punere în funcțiune |
| `certificat_calitate_nr` | input | |
| `certificat_calitate_furnizor` | input | |
| `contract_servicii_lucrare_nr` | input | |
| `raport_lucrari_executate_nr` | input | |
| `diriginte_santier_nume` | input | |
| `protocol_suduri_upload[]` | file repeat | încărcare poze/PDF protocoale |
| `planuri_lucrare_upload[]` | file repeat | Plan situație + Plan încadrare zonă (min. 2) |
| `schema_suduri_upload` | file | |
| `carte_tehnica_upload[]` | file repeat | |

## 9. Documente generate

Lista tipizatelor DOCX disponibile pentru generare automată:

1. **Referat verificare proiect** (VGD)
2. **Foaie de capăt proiect**
3. **Memoriu tehnic avizare**
4. **Memoriu tehnic execuție**
5. **Breviar de calcul**
6. **Lista materiale (Anexa 13)**
7. **Lista materiale puse la dispoziție (Anexa 14)**
8. **Program de control calitate (Anexa 14)**
9. **Cerere ordin de lucru**
10. **Cerere ATR**
11. **Cerere certificat urbanism**
12. **Cereri avize utilități** (Apa, Electrica, Telekom, Brigada Rutieră, ISU, Mediu, RDS, Netcity)
13. **Anunț începere lucrări ISC**
14. **PV predare amplasament**
15. **PV verificare calitate materiale**
16. **PV recepție tehnică branșament/conductă**
17. **PV recepție tehnică PRM**
18. **PV punere în funcțiune**
19. **Carte tehnică**
20. **Caiet de sarcini PTH**
21. **Borderou documente**
22. **DTAC** (Documentație Tehnică Autorizare Construire)
23. **PTH** (Proiect Tehnic Execuție)
24. **Deviz lucrări**
25. **Situație de lucrări**
26. **Fișă tehnică generală**
27. **Protocoale suduri (per sudură)**
28. **Raport lucrări executate**
29. **Contract prestări servicii**
30. **Fișă aspecte mediu**
31. **🎯 MASTER: Proiect Branșament Complet** (toate cele de mai sus într-un singur DOCX — model "Proiect bransament.docx")

## 10. Reguli de plan și permisiuni

| Plan | Drepturi |
|----|----|
| **Operator introducere date** | Date generale + completare avize + trimitere email. Fără date tehnice, fără facturare. |
| **Proiectant** | Faza DTAC + semnătură digitală. Fără avize, fără execuție. |
| **Executant** | Faza PTH + carte tehnică + semnătură digitală. Cu 50% mai scump decât Proiectant. |
| **VGD** | Validare DTAC + PTH. Upload ștampilă auto pe fiecare pagină. |
| **RTE** | Validare carte tehnică. Upload ștampilă auto. |
| **Contabilitate** | Generare facturi per aviz + bilanț plăți + comunicare ANAF. |
| **Societate** | Toate funcțiile de mai sus + bulk completare. Cu 25% reducere față de suma planurilor. Limită 100 proiecte/an. |

---

**Total placeholdere catalogate: 150+**
**Toate sunt utilizabile în orice template DOCX sub forma `{{key}}`.**

Generat automat de Energy Project Design — V11.0
