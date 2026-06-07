"""Gas Natural Project — full legal phase model for Romania (NTPEE 2018 / Ord. ANRE 89/2018 + HG 907/2016).

Provides:
- 11 sequential legal phases of a complete gas-natural technical project.
- Variable-field schema (per phase) used by the dynamic form on the frontend.
- A pure-python dataclass + helpers to compute progress & next-phase suggestion.

Single source of truth used by both backend router and frontend `GasProjectStudio.jsx`.
"""
from __future__ import annotations
from typing import Dict, List, Optional, Any


# 11 legal phases, in execution order (per HG 907/2016 + NTPEE 2018).
PHASES: List[Dict[str, Any]] = [
    {
        "id": "tema",
        "order": 1,
        "name": "1. Temă de proiectare",
        "short": "Date inițiale",
        "norm": "HG 907/2016 art.4",
        "description": "Date inițiale: beneficiar, locație, scop, consum estimat, regim funcționare.",
        "deliverables": ["Tema de proiectare semnată", "Date cadastrale", "Memoriu de necesitate"],
        "fields": [
            {"key": "beneficiar_nume", "label": "Beneficiar (nume/denumire)", "type": "text", "required": True},
            {"key": "beneficiar_cnp_cui", "label": "CNP / CUI", "type": "text", "required": True},
            {"key": "beneficiar_adresa", "label": "Adresă fiscală beneficiar", "type": "text"},
            {"key": "loc_consum_adresa", "label": "Adresă loc de consum", "type": "text", "required": True},
            {"key": "loc_consum_cadastru", "label": "Nr. cadastral / CF", "type": "text"},
            {"key": "loc_consum_judet", "label": "Județ", "type": "text", "required": True},
            {"key": "loc_consum_localitate", "label": "Localitate", "type": "text", "required": True},
            {"key": "scop_lucrare", "label": "Scop lucrare", "type": "select", "options": [
                "Branșament nou", "Extindere conductă", "Instalație de utilizare", "Modernizare", "Înlocuire branșament"
            ], "required": True},
            {"key": "tip_consumator", "label": "Tip consumator", "type": "select", "options": [
                "Casnic", "Necasnic mic", "Necasnic mediu", "Necasnic mare", "Combinat"
            ], "required": True},
            {"key": "regim_functionare", "label": "Regim funcționare", "type": "select", "options": [
                "Permanent", "Sezonier", "Intermitent"
            ]},
            {"key": "debit_instalat_mc_h", "label": "Debit instalat estimat (m³/h)", "type": "number"},
            {"key": "consum_anual_mc", "label": "Consum anual estimat (m³/an)", "type": "number"},
        ],
    },
    {
        "id": "sf",
        "order": 2,
        "name": "2. Studiu de fezabilitate",
        "short": "SF",
        "norm": "HG 907/2016 anexa 4",
        "description": "Soluție tehnico-economică optimă; justifică investiția.",
        "deliverables": ["SF DOCX/PDF", "Plan situație", "Estimare costuri", "Indicatori tehnico-economici"],
        "fields": [
            {"key": "sf_solutie_tehnica", "label": "Soluție tehnică (variantă optimă)", "type": "textarea"},
            {"key": "sf_lungime_conducta_m", "label": "Lungime conductă (m)", "type": "number"},
            {"key": "sf_material_conducta", "label": "Material conductă", "type": "select",
             "options": ["PE 100 SDR 11", "PE 100 SDR 17.6", "OL galvanizat", "Cupru", "Inox"]},
            {"key": "sf_diametru_nominal_DN", "label": "Diametru nominal (DN/mm)", "type": "text"},
            {"key": "sf_presiune_max_op_bar", "label": "Presiune max. operare (bar)", "type": "number"},
            {"key": "sf_cost_estimat_lei", "label": "Cost estimat (lei, fără TVA)", "type": "number"},
            {"key": "sf_durata_executie_luni", "label": "Durată estimată execuție (luni)", "type": "number"},
            {"key": "sf_amortizare_ani", "label": "Perioadă amortizare (ani)", "type": "number"},
            {"key": "sf_indicatori_tehnico_economici", "label": "Indicatori tehnico-economici", "type": "textarea"},
        ],
    },
    {
        "id": "cu",
        "order": 3,
        "name": "3. Certificat de urbanism & avize",
        "short": "CU + Avize",
        "norm": "L 50/1991 art. 6, ANRE Ord. 89/2018",
        "description": "Obținere CU, avize ANRE, ISC, Mediu, RAJA, Distrigaz, autorități locale.",
        "deliverables": ["CU emis", "Avize tehnice OSD (ATR)", "Aviz ISC", "Aviz mediu", "Aviz tehnic primărie"],
        "fields": [
            {"key": "cu_numar", "label": "Nr. CU", "type": "text", "required": True},
            {"key": "cu_data_emitere", "label": "Data emiterii CU", "type": "date"},
            {"key": "cu_valabilitate_luni", "label": "Valabilitate CU (luni)", "type": "number"},
            {"key": "cu_emitent", "label": "Emitent (primărie/cons. județean)", "type": "text"},
            {"key": "atr_numar", "label": "Nr. ATR (aviz tehnic racordare)", "type": "text"},
            {"key": "atr_osd", "label": "OSD (Distrigaz Sud / Delgaz / E-Distribuție etc.)", "type": "text"},
            {"key": "atr_data", "label": "Data ATR", "type": "date"},
            {"key": "avize_obtinute", "label": "Avize obținute (listă)", "type": "textarea",
             "placeholder": "ex: ISC nr.X/2026, Mediu nr.Y/2026, Apa Canal nr.Z/2026"},
        ],
    },
    {
        "id": "dtac",
        "order": 4,
        "name": "4. DTAC — Documentație autorizare construcție",
        "short": "DTAC",
        "norm": "L 50/1991 + Ord. MDLPA 839/2009",
        "description": "Documentația tehnică pentru obținerea Autorizației de Construire.",
        "deliverables": ["Piese scrise DTAC", "Plan situație", "Plan încadrare în zonă", "Memoriu tehnic", "Devize"],
        "fields": [
            {"key": "dtac_proiectant_general", "label": "Proiectant general (firmă)", "type": "text", "required": True},
            {"key": "dtac_proiectant_specialitate", "label": "Proiectant de specialitate (gaze)", "type": "text", "required": True},
            {"key": "dtac_atestat_proiectant", "label": "Atestat ANRE proiectant (nr.)", "type": "text", "required": True},
            {"key": "dtac_verificator_vgd", "label": "Verificator VGD (nume + atestat)", "type": "text"},
            {"key": "dtac_data_intocmire", "label": "Data întocmire DTAC", "type": "date"},
            {"key": "dtac_memoriu_tehnic", "label": "Sinteză memoriu tehnic", "type": "textarea"},
            {"key": "dtac_planuri_anexate", "label": "Planuri anexate (lista)", "type": "textarea",
             "placeholder": "Plan situație 1:500, Plan încadrare 1:5000, Detalii branșament..."},
        ],
    },
    {
        "id": "ac",
        "order": 5,
        "name": "5. Autorizație de construire",
        "short": "AC",
        "norm": "L 50/1991",
        "description": "AC emis în baza DTAC + avize.",
        "deliverables": ["AC scanat", "Anexe AC", "Dovada taxelor plătite"],
        "fields": [
            {"key": "ac_numar", "label": "Nr. Autorizație de Construire", "type": "text", "required": True},
            {"key": "ac_data_emitere", "label": "Data emiterii AC", "type": "date", "required": True},
            {"key": "ac_valabilitate_luni", "label": "Valabilitate (luni)", "type": "number"},
            {"key": "ac_termen_executie", "label": "Termen execuție (luni)", "type": "number"},
            {"key": "ac_emitent", "label": "Emitent AC", "type": "text"},
            {"key": "ac_taxa_lei", "label": "Taxă AC plătită (lei)", "type": "number"},
        ],
    },
    {
        "id": "pt",
        "order": 6,
        "name": "6. Proiect tehnic (PT)",
        "short": "PT",
        "norm": "HG 907/2016 anexa 5 + NTPEE 2018 cap.3",
        "description": "Proiectul tehnic de execuție: dezvoltarea soluției aprobate.",
        "deliverables": ["Piese scrise PT", "Piese desenate", "Caiete de sarcini", "Liste cantități"],
        "fields": [
            {"key": "pt_revizia", "label": "Revizia PT", "type": "text", "placeholder": "rev. 0"},
            {"key": "pt_numar_planse", "label": "Număr planșe", "type": "number"},
            {"key": "pt_calcul_dimensionare", "label": "Calcul dimensionare (sinteză)", "type": "textarea"},
            {"key": "pt_calcul_pierderi_presiune_bar", "label": "Pierderi presiune calculate (bar)", "type": "number"},
            {"key": "pt_lista_materiale", "label": "Listă materiale principale", "type": "textarea",
             "placeholder": "Conducta PE100 SDR11 Ø32×3.0 — 120m; Regulator presiune medie/joasă..."},
            {"key": "pt_lista_utilaje", "label": "Listă utilaje/aparate", "type": "textarea"},
            {"key": "pt_caiet_sarcini", "label": "Sinteză caiet de sarcini (montaj)", "type": "textarea"},
        ],
    },
    {
        "id": "de",
        "order": 7,
        "name": "7. Detalii de execuție (DE)",
        "short": "DE",
        "norm": "NTPEE 2018 art.34",
        "description": "Detalii necesare montajului: noduri, tăieturi, conexiuni.",
        "deliverables": ["Detalii branșament", "Detalii post reglare", "Detalii pozare", "Detalii ancoraje"],
        "fields": [
            {"key": "de_detalii_bransament", "label": "Detalii branșament (descriere)", "type": "textarea"},
            {"key": "de_detalii_post_reglare", "label": "Post de reglare (specificații)", "type": "textarea"},
            {"key": "de_detalii_pozare", "label": "Detalii pozare conductă (adâncime, pat nisip, banda avertizare)", "type": "textarea"},
            {"key": "de_detalii_ancoraje", "label": "Ancoraje, traversări, protejări", "type": "textarea"},
        ],
    },
    {
        "id": "executie",
        "order": 8,
        "name": "8. Execuție lucrări (șantier)",
        "short": "Execuție",
        "norm": "NTPEE 2018 cap.4 + L 10/1995",
        "description": "Execuția propriu-zisă: trasare, săpături, pozare, sudare, probe.",
        "deliverables": ["Buletine sudori", "Certificate materiale", "Foi de parcurs zilnice", "Foto-document"],
        "fields": [
            {"key": "exec_firma", "label": "Firmă executantă (autorizație ANRE EDD)", "type": "text", "required": True},
            {"key": "exec_data_start", "label": "Data începere șantier", "type": "date"},
            {"key": "exec_data_terminare", "label": "Data terminare lucrări", "type": "date"},
            {"key": "exec_responsabil_tehnic", "label": "Responsabil tehnic cu execuția (RTE)", "type": "text"},
            {"key": "exec_diriginte_santier", "label": "Diriginte șantier (nume + nr. atestat)", "type": "text"},
            {"key": "exec_certificate_materiale", "label": "Certificate calitate materiale (listă)", "type": "textarea"},
            {"key": "exec_buletine_sudori", "label": "Buletine sudori (autorizații)", "type": "textarea"},
        ],
    },
    {
        "id": "probe",
        "order": 9,
        "name": "9. Probe & verificări",
        "short": "Probe",
        "norm": "NTPEE 2018 cap.5",
        "description": "Probe de etanșeitate, rezistență; controale ITP/RTE.",
        "deliverables": ["PV probe etanșeitate", "PV probe rezistență", "Buletine analize"],
        "fields": [
            {"key": "proba_rezistenta_bar", "label": "Proba de rezistență (bar)", "type": "number"},
            {"key": "proba_rezistenta_durata_min", "label": "Durată proba rezistență (min)", "type": "number"},
            {"key": "proba_etanseitate_bar", "label": "Proba de etanșeitate (bar)", "type": "number"},
            {"key": "proba_etanseitate_durata_h", "label": "Durată proba etanșeitate (ore)", "type": "number"},
            {"key": "proba_rezultat", "label": "Rezultat probe", "type": "select",
             "options": ["Admis", "Admis cu observații", "Respins"]},
            {"key": "proba_observatii", "label": "Observații", "type": "textarea"},
        ],
    },
    {
        "id": "receptie",
        "order": 10,
        "name": "10. Recepție & Carte tehnică",
        "short": "Recepție",
        "norm": "HG 273/1994 + Ord. MLPAT 770/1997",
        "description": "PV recepție la terminarea lucrărilor + cartea tehnică a construcției.",
        "deliverables": ["PVRT", "Cartea tehnică (4 secțiuni)", "Documentație as-built", "Predare la beneficiar"],
        "fields": [
            {"key": "receptie_pv_numar", "label": "Nr. PV recepție terminare lucrări", "type": "text"},
            {"key": "receptie_pv_data", "label": "Data PVRT", "type": "date"},
            {"key": "receptie_comisia", "label": "Comisia (membri)", "type": "textarea"},
            {"key": "carte_tehnica_volume", "label": "Volume cartea tehnică", "type": "textarea",
             "placeholder": "Sec.A: documentație proiectare; Sec.B: doc. execuție; Sec.C: doc. recepție; Sec.D: urmărire în timp"},
            {"key": "as_built_anexat", "label": "Documentație as-built anexată?", "type": "select", "options": ["Da", "Nu"]},
        ],
    },
    {
        "id": "pif",
        "order": 11,
        "name": "11. Punere în funcțiune (PIF)",
        "short": "PIF",
        "norm": "NTPEE 2018 art.78 + Ord. ANRE 162/2021",
        "description": "PIF efectivă: cuplare la rețea, încercare în funcțiune, alimentare beneficiar.",
        "deliverables": ["PV PIF semnat OSD", "Contract furnizare", "Notificare consumator"],
        "fields": [
            {"key": "pif_data", "label": "Data punere în funcțiune", "type": "date"},
            {"key": "pif_osd", "label": "OSD prezent la PIF", "type": "text"},
            {"key": "pif_responsabil_osd", "label": "Responsabil OSD (nume)", "type": "text"},
            {"key": "pif_contor_serie", "label": "Serie contor montat", "type": "text"},
            {"key": "pif_contor_index_initial", "label": "Index inițial contor (m³)", "type": "number"},
            {"key": "pif_contract_furnizare", "label": "Nr. contract furnizare gaze", "type": "text"},
            {"key": "pif_observatii", "label": "Observații finale", "type": "textarea"},
        ],
    },
]


def get_phases() -> List[Dict[str, Any]]:
    return PHASES


def get_phase(phase_id: str) -> Optional[Dict[str, Any]]:
    for p in PHASES:
        if p["id"] == phase_id:
            return p
    return None


def all_field_keys() -> List[str]:
    keys: List[str] = []
    for p in PHASES:
        for f in p["fields"]:
            keys.append(f["key"])
    return keys


def progress(data: Dict[str, Any]) -> Dict[str, Any]:
    """Compute completion % per phase + overall."""
    per_phase = []
    overall_filled = 0
    overall_total = 0
    for p in PHASES:
        total = len(p["fields"])
        filled = sum(1 for f in p["fields"] if str(data.get(f["key"], "")).strip())
        per_phase.append({
            "phase_id": p["id"],
            "name": p["name"],
            "filled": filled,
            "total": total,
            "percent": round(100 * filled / total) if total else 0,
            "complete": filled == total,
        })
        overall_filled += filled
        overall_total += total
    return {
        "phases": per_phase,
        "overall_percent": round(100 * overall_filled / overall_total) if overall_total else 0,
        "overall_filled": overall_filled,
        "overall_total": overall_total,
    }
