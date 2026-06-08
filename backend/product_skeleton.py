"""Product Skeleton — generator pentru produse noi pe alte infrastructuri.

Conform `Prompt creeare program chat GPT.docx` literal — nucleul EPD trebuie să
poată genera produse noi pentru:
- gaze naturale (active)
- electric LES/LEA
- apă-canal
- fotovoltaice
- arhitectură
- telecom/fibră
- feroviar
- construcții
- ofertare
- mentenanță industrială

Pentru fiecare produs nou se păstrează:
- login/register/trial/forgot/Google-ready
- plan licensing
- Developer/Inside
- Assistant User + AI Developer
- dashboard + Date proiect + Date tehnice + Departamente + Documentație
- ștampile/semnături + email/outbox/SMTP-ready
- templates + placeholders + IF calculus + calcule + validări + checklist
- import/export signed + registru proiecte + update center + marketplace

Se schimbă DOAR:
- domeniul, câmpurile, documentele, calculele, verificările, departamentele,
  rolurile, planurile, brandingul, semnătura exportului.
"""
from __future__ import annotations
from typing import Any, Dict, List


SKELETON_INDUSTRIES = [
    {
        "id": "gaze-naturale",
        "label": "Gaze naturale",
        "status": "active",
        "fields_focus": ["debit", "presiune", "diametru", "lungime", "OSD", "ATR"],
        "calc_engine": "gas_calc_engine (Renouard + simultaneitate Ks)",
        "documents": 17,
        "avize": 13,
        "norms": "NTPEE 2018 + HG 907/2016 + L 123/2012 + L 50/1991",
    },
    {
        "id": "electric-les-lea",
        "label": "Electric LES / LEA",
        "status": "skeleton",
        "fields_focus": ["putere instalată kW", "tensiune", "secțiune cablu", "lungime", "OD (Distribuitor)", "ATR electric"],
        "calc_engine": "electric_calc (PE 132, PE 134, secțiune cablu)",
        "documents": ["Cerere CU", "Memoriu tehnic", "Cerere ATR electric", "Cerere PIF electric"],
        "avize": ["CU", "ATR Distribuitor (E-Distribuție/Electrica)", "APM", "Drumuri"],
        "norms": "L 123/2012 + PE 132/2003 + PE 134/2017 + ANRE 11/2014",
    },
    {
        "id": "apa-canal",
        "label": "Apă-canal",
        "status": "skeleton",
        "fields_focus": ["debit l/s", "diametru", "presiune apă", "lungime", "OA (Operator Apă)"],
        "calc_engine": "water_calc (Manning, Colebrook, dimensionare pompă)",
        "documents": ["Cerere CU", "Memoriu tehnic apă", "Aviz amplasament gaze (reverse)", "PV recepție"],
        "avize": ["CU", "Aviz Apă-Canal", "Aviz amplasament gaze", "APM", "Drumuri"],
        "norms": "L 241/2006 + STAS 8591 + SR EN 805 + SR EN 1610",
    },
    {
        "id": "fotovoltaice",
        "label": "Fotovoltaice",
        "status": "skeleton",
        "fields_focus": ["putere instalată kWp", "număr panouri", "invertor", "tip montaj", "racordare"],
        "calc_engine": "pv_calc (iradiere, randament, kWh/an estimat)",
        "documents": ["Cerere CU", "Memoriu tehnic PV", "Cerere ATR", "Cerere prosumator"],
        "avize": ["CU", "ATR Distribuitor", "APM", "ISC (dacă peste 30 kWp)"],
        "norms": "L 184/2018 + Ord. ANRE 15/2022 + PE 152/2018",
    },
    {
        "id": "telecom-fibra",
        "label": "Telecom / Fibra optică",
        "status": "skeleton",
        "fields_focus": ["operator", "tip fibră (SMF/MMF)", "număr fibre", "splice points", "ODF"],
        "calc_engine": "telecom_calc (loss budget, OTDR estimation)",
        "documents": ["Cerere CU", "Memoriu tehnic FO", "Aviz traseu telecom", "PV terminare"],
        "avize": ["CU", "ANCOM", "APM", "Drumuri"],
        "norms": "L 154/2012 + Ord. ANCOM 113/2020 + ITU-T G.652",
    },
    {
        "id": "arhitectura",
        "label": "Arhitectură (case + blocuri)",
        "status": "skeleton",
        "fields_focus": ["arie construită", "arie utilă", "regim înălțime", "categorie importanță", "fundație"],
        "calc_engine": "arch_calc (P100/2013 — risc seismic, indici urbanistici)",
        "documents": ["Cerere CU", "DTAC arhitectură", "PV recepție", "Carte tehnică completă"],
        "avize": ["CU", "Mediu", "Drumuri", "Apă-Canal", "Electrica", "Gaze", "Pompieri", "Sănătate"],
        "norms": "L 50/1991 + L 350/2001 + P100/2013 + Cod civil construcții",
    },
    {
        "id": "feroviar",
        "label": "Infrastructură feroviară",
        "status": "skeleton",
        "fields_focus": ["ecartament", "viteză proiectare", "rază curbă", "supraînălțare", "macaze"],
        "calc_engine": "rail_calc (vitezometrie, raze curbă, supraînălțare)",
        "documents": ["Cerere SIAF", "Memoriu CFR", "Aviz CFR Marfă/Călători"],
        "avize": ["CFR", "ASFR", "APM", "MTI"],
        "norms": "L 55/2006 + Instrucția 002/2018 CFR + STN 70110",
    },
    {
        "id": "constructii-masini",
        "label": "Construcții mașini",
        "status": "skeleton",
        "fields_focus": ["putere motor", "categorie", "omologare", "marcaj CE", "regim utilizare"],
        "calc_engine": "machinery_calc (sarcini de proiectare, durata de viață estimată)",
        "documents": ["Declarație CE", "Dosar tehnic conform 2006/42/CE", "Manual de utilizare"],
        "avize": ["RAR", "ISCIR", "ANCEX (dacă export)"],
        "norms": "Directiva 2006/42/CE + HG 1029/2008",
    },
    {
        "id": "ofertare",
        "label": "Ofertare (CAEN 7112)",
        "status": "skeleton",
        "fields_focus": ["client", "valoare estimată", "termen execuție", "garanție", "preț unitate"],
        "calc_engine": "offer_calc (marjă profit, TVA, plata în rate)",
        "documents": ["Ofertă tehnico-comercială", "Contract execuție", "Anexă specificații", "Factură proformă"],
        "avize": [],
        "norms": "Codul Civil + Codul Comercial + Codul Fiscal",
    },
    {
        "id": "mentenanta",
        "label": "Mentenanță industrială",
        "status": "skeleton",
        "fields_focus": ["echipament", "tip mentenanță (PMP/CBM)", "MTBF", "MTTR", "interval"],
        "calc_engine": "maint_calc (cost mentenanță, ROI înlocuire vs reparare)",
        "documents": ["Plan mentenanță anual", "Rapoarte intervenție", "Carnet de service"],
        "avize": ["ISCIR (echipamente sub presiune / ridicat)", "ANRE (instalații electrice)"],
        "norms": "L 64/2008 + PT C9 + ISO 55000",
    },
]


def list_skeletons() -> List[Dict[str, Any]]:
    return list(SKELETON_INDUSTRIES)


def get_skeleton(skeleton_id: str) -> Dict[str, Any] | None:
    for s in SKELETON_INDUSTRIES:
        if s["id"] == skeleton_id:
            return dict(s)
    return None


def export_skeleton_prompt(skeleton_id: str) -> str:
    """Generează promptul schelet pentru un produs nou (export pentru reutilizare)."""
    s = get_skeleton(skeleton_id)
    if not s:
        return "# Skeleton inexistent"
    return (
        f"# PRODUCT SKELETON — {s['label'].upper()}\n"
        f"# Domeniu: {s['id']}\n"
        f"# Status: {s['status']}\n\n"
        "## Nucleul stabil (PĂSTRAT 1:1 din EPD Gaze):\n"
        "- login + register + trial + forgot password + Google OAuth ready\n"
        "- plan licensing pe cont (12 planuri: trial/operator/basic/proiectant/...)\n"
        "- Developer + Inside Full protejat (enigma pepene galben + parola 2)\n"
        "- Assistant User + AI Developer chat + Implementation Queue\n"
        "- Dashboard cu workflow vizual\n"
        "- Date proiect + Date tehnice + Calcul inteligent (casete IF visible)\n"
        "- Documente cu template engine + placeholdere + IF calculus\n"
        "- Ștampile + Semnături + Email/Outbox/SMTP-ready\n"
        "- Verifică documentație + Audit interfață + Self Check\n"
        "- Registru proiecte + Import/Export signed + watermark\n"
        f"\n## Domeniu SPECIFIC (de adaptat):\n"
        f"- Câmpuri tehnice: {', '.join(s['fields_focus'])}\n"
        f"- Calc engine: {s['calc_engine']}\n"
        f"- Documente: {s['documents']}\n"
        f"- Avize: {s['avize']}\n"
        f"- Norme: {s['norms']}\n\n"
        "## Brand:\n"
        f"- Nume produs: EPD {s['label']}\n"
        f"- Export signature: epd-{s['id']}-v1.0\n"
        f"- Watermark: Energy Project Design — {s['label']}\n"
    )
