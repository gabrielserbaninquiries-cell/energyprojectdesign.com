# Energy Project Design — V5.3

## Status
Consolidare codbase finalizată + implementare profundă Fotovoltaice (ANRE).

## Original problem statement
Aplicație B2B SaaS pentru proiectare energetică (gaze naturale, fotovoltaice etc.). Documentații automate cu DOCX placeholder, calcule tehnice inteligente, SEO, autentificare, plăți Stripe.

## Implementat (06.06.2026)
- **Calc Engine — Gaz fittings (port complet din V3 legacy)**: nr_teu_derivatie, nr_mufe_electrofuziune (ceil(L/6)+1), nr_coliere_priza (ceil(L/30)+1), nr_robineti_bransament, nr_reductii (dacă D≠D), nr_coturi_90 (ceil(L/25)), material_recomandat.
- **Fotovoltaic deep — modul nou `/app/backend/photovoltaic.py`**:
  * 4 categorii ANRE (C1≤10.8, C2≤27, C3≤200, C4>200) cu tip racord, aviz, regim, compensare cantitativă
  * Calcul nr. panouri (default 450Wp), configurare string (Voc rece -10°C, n_serie_max, n_string)
  * Dimensionare invertor (raport DC/AC, min/max/recomandat)
  * Secțiune cablu DC (formula S = 2LIρ/ΔU, H1Z2Z2-K, cădere <1%)
  * Secțiune cablu AC mono/trifazat (cădere <1.5%, CYY-F/N2XH)
  * Listă protecții obligatorii (DC fuse, SPD DC+AC, RCD tip B, MCB, releu rețea, smart-meter, celulă MT pt C4)
  * Producție anuală + factor utilizare (PVGIS-SARAH3, PR=0.78, 6 zone România)
- **Endpoint-uri noi**:
  * `POST /api/photovoltaic/calculate`
  * `GET /api/photovoltaic`
  * `GET /api/photovoltaic/categories` (public)
- **Smart placeholders DOCX cu IF/ELSE**: `{IF var<10: text X ELSE text Y}` — operatori < <= > >= == !=, suport string și numeric.
- **`/api/project/placeholders` integrare fv_***: adaugă automat fv_p_kwp, fv_categorie_anre, fv_n_panouri, fv_invertor_kw, fv_cablu_dc_mm2, fv_protectii_lista etc.
- **Curățenie**: `/tmp/repo2` șters complet — single source of truth = `/app/`.

## Tech Stack
- Backend: FastAPI (port 8001), MongoDB (DB_NAME din .env), python-docx, Pydantic v2
- Frontend: React 18 + Tailwind + shadcn/ui (port 3000)
- Integrări: Stripe, Gmail SMTP, GitHub PAT

## Completat ulterior (06.06.2026 — sesiune curentă)
- **P1 FE Fotovoltaic UI** — `/app/frontend/src/pages/PhotovoltaicCalc.jsx` validat end-to-end (form p_kwp/zonă/cabluri + card categorie ANRE + grid 6 metrici + tabel cabluri + listă protecții + export JSON). Test live cu admin: 8 kWp Sud → C1, 18 panouri, invertor 7.6 kW, 9048 kWh/an. Toast persist OK pe MongoDB.
- **P2 Template-uri DOCX FV** — system_templates.py seed-uit cu IF/ELSE placeholders (fix `NameError _build_cerere_racordare_fv`).

## Backlog (P2-P3)
- **P2**: Secondary Business Email capability + Admin-Only Configuration UI
- **P2**: Deep website develop — polish global pe baza prompt-urilor existente (Industrii, Forum, FeaturesHub etc.)
- **P3**: Buton "Generează Ofertă Tehnică FV PDF" direct (skip DOCX → PDF)
- **P3**: Verificare automată ANRE — apel API distribuitor pentru ATR

## Sources
- ANRE Ord. 34/2024 (prosumatori), Ord. 89/2018 (gaze)
- SR EN 50618, IEC 62548, I7-2011
- PVGIS-SARAH3 (JRC) — iradiație România
- SR 6790, SR EN 1775 (gaze naturale)
