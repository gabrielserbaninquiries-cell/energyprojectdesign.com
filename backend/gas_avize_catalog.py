"""Gas Natural — Catalog AVIZE & FLUX per aviz.

Pentru o firmă reală de proiectare/execuție gaze, fiecare proiect parcurge un set de
AVIZE distincte (CU, ATR, apă-canal, electrice, drumuri, poliție, mediu, ISCIR, etc.).

Acest modul:
1. Definește registry-ul avizelor (ID, nume, autoritate emitentă, cadru legal,
   template DOCX necesar, anexe obligatorii, fields specifice, condiționale când apare).
2. Calculează DINAMIC ce avize sunt necesare pentru un proiect dat (în funcție de
   subdomeniu, tip lucrare, traseu, zona).
3. Tracking status per aviz: planificat → cerut → primit → respins.
"""
from __future__ import annotations
from typing import Any, Dict, List, Optional


# ============================================================================
# REGISTRY AVIZE
# ============================================================================
# Fiecare aviz:
# - id: identificator unic
# - label: denumire vizibilă
# - issuer: autoritatea emitentă (afișată în UI + folosită în default email)
# - legal: cadru legal aplicabil
# - template_id: ID-ul template-ului DOCX din gas_doc_templates.TEMPLATES
# - phase: faza proiectului în care se solicită (corespondență gas_catalog)
# - mandatory: True dacă apare pentru orice proiect; False = doar dacă match condition
# - applies_if: funcție de evaluare condition (primește proj.data) — None = always
# - default_recipient_role: rolul folosit pentru match email din /gas-project/recipients
# - extra_fields: câmpuri suplimentare cerute în formular pentru acest aviz
# - extra_attachments: documente adiționale (în afara DOCX-ului) pe care utilizatorul
#   trebuie să le ataseze la trimiterea cererii

AVIZE: List[Dict[str, Any]] = [
    {
        "id": "cu",
        "label": "Certificat de Urbanism",
        "issuer": "Primăria localității",
        "legal": "Legea 50/1991 art. 6",
        "template_id": "cerere_cu",
        "phase": "cu",
        "mandatory": True,
        "default_recipient_role": "primarie",
        "extra_fields": [],
        "extra_attachments": ["Extras CF / Act proprietate", "Plan situație 1:500", "Plan încadrare 1:5000"],
    },
    {
        "id": "atr",
        "label": "Aviz Tehnic de Racordare (OSD)",
        "issuer": "Operator Sistem Distribuție gaze (Distrigaz Sud / Delgaz / Premier Energy)",
        "legal": "Ord. ANRE 89/2018",
        "template_id": "cerere_atr",
        "phase": "cu",
        "mandatory": True,
        "default_recipient_role": "osd",
        "extra_fields": [
            {"key": "atr_osd", "label": "OSD destinatar", "type": "select",
             "options": ["Distrigaz Sud Rețele (Engie)", "Delgaz Grid", "Premier Energy", "OSD Gaz Nord-Est", "Altul"]},
        ],
        "extra_attachments": ["Copie CI/CUI beneficiar", "Extras CF", "Plan situație 1:500", "Copie CU"],
    },
    {
        "id": "aviz_apa",
        "label": "Aviz amplasament — APĂ-CANAL",
        "issuer": "RAJA / Apa Nova / Compania Județeană Apă",
        "legal": "Legea 241/2006 + STAS 8591/1997",
        "template_id": "cerere_aviz_apa",
        "phase": "cu",
        "mandatory": False,
        "applies_if": lambda d: bool(d.get("loc_consum_localitate")),  # always when address provided
        "default_recipient_role": "operator_apa",
        "extra_fields": [
            {"key": "apa_canal_operator", "label": "Operator APĂ-CANAL", "type": "text",
             "placeholder": "ex: RAJA Constanța, Apa Nova București, SC Compania Apă SA"},
        ],
        "extra_attachments": ["Plan situație 1:500", "Plan încadrare 1:5000"],
    },
    {
        "id": "aviz_electrica",
        "label": "Aviz amplasament — REȚELE ELECTRICE",
        "issuer": "E-Distribuție / Electrica / Delgaz Grid Electrice",
        "legal": "Ord. ANRE 11/2014 + PE 101/85",
        "template_id": "cerere_aviz_electrica",
        "phase": "cu",
        "mandatory": False,
        "applies_if": lambda d: True,  # always
        "default_recipient_role": "operator_electric",
        "extra_fields": [
            {"key": "electrica_operator", "label": "Operator REȚELE ELECTRICE", "type": "select",
             "options": ["E-Distribuție Muntenia", "E-Distribuție Dobrogea", "E-Distribuție Banat",
                         "Distribuție Energie Electrică România", "Delgaz Grid (NE)", "Electrica Furnizare"]},
        ],
        "extra_attachments": ["Plan situație 1:500", "Memoriu tehnic (sinteză)"],
    },
    {
        "id": "aviz_drumuri",
        "label": "Aviz Drumuri & Poduri (spargere carosabil)",
        "issuer": "Direcția Drumuri și Poduri (locală/județeană/CNAIR)",
        "legal": "OG 43/1997 + AND 605:2016",
        "template_id": "cerere_aviz_drumuri",
        "phase": "cu",
        "mandatory": False,
        "applies_if": lambda d: str(d.get("traseu_pe_drum", "")).lower() in ("da", "true", "1", "yes"),
        "default_recipient_role": "drumuri",
        "extra_fields": [
            {"key": "traseu_pe_drum", "label": "Traseul traversează carosabil public?", "type": "select",
             "options": ["Nu", "Da"], "required": True},
            {"key": "drumuri_administrator", "label": "Administrator drum", "type": "text",
             "placeholder": "ex: Compania Națională de Administrare a Infrastructurii Rutiere / Consiliul Județean"},
        ],
        "extra_attachments": ["Schiță refacere îmbrăcăminte", "Memoriu tehnic"],
    },
    {
        "id": "aviz_politie",
        "label": "Aviz Poliția Rutieră (semnalizare temporară)",
        "issuer": "Inspectoratul de Poliție al Județului — Serviciul Rutier",
        "legal": "OUG 195/2002 + SR 1848-7",
        "template_id": "cerere_aviz_politie",
        "phase": "cu",
        "mandatory": False,
        "applies_if": lambda d: str(d.get("traseu_pe_drum", "")).lower() in ("da", "true", "1", "yes"),
        "default_recipient_role": "politie",
        "extra_fields": [
            {"key": "politie_unitatea", "label": "Unitate Poliție", "type": "text",
             "placeholder": "ex: IPJ București — Brigada Rutieră"},
        ],
        "extra_attachments": ["Schemă semnalizare temporară", "Program execuție"],
    },
    {
        "id": "aviz_mediu",
        "label": "Punct de vedere / Acord Mediu (APM)",
        "issuer": "Agenția pentru Protecția Mediului (județeană)",
        "legal": "Legea 292/2018 + OUG 195/2005",
        "template_id": "cerere_aviz_mediu",
        "phase": "cu",
        "mandatory": True,
        "default_recipient_role": "mediu",
        "extra_fields": [
            {"key": "apm_unitate", "label": "APM Județ", "type": "text",
             "placeholder": "ex: APM Cluj"},
        ],
        "extra_attachments": ["Memoriu de prezentare (Ord. MMP 19/2010)", "Plan situație", "Copie CU"],
    },
    {
        "id": "aviz_iscir",
        "label": "Aviz ISCIR (centrala termică)",
        "issuer": "ISCIR — Inspecția de Stat",
        "legal": "Legea 64/2008 + PT C9-2010",
        "template_id": "cerere_aviz_iscir",
        "phase": "executie",
        "mandatory": False,
        "applies_if": lambda d: str(d.get("are_centrala_termica", "")).lower() in ("da", "true", "1", "yes"),
        "default_recipient_role": "iscir",
        "extra_fields": [
            {"key": "are_centrala_termica", "label": "Există centrală termică în proiect?",
             "type": "select", "options": ["Nu", "Da"]},
            {"key": "centrala_putere_kw", "label": "Putere centrală (kW)", "type": "number"},
            {"key": "centrala_producator", "label": "Producător centrală", "type": "text"},
        ],
        "extra_attachments": ["Schemă termo-hidraulică", "Specificație tehnică centrală"],
    },
    {
        "id": "anunt_incepere",
        "label": "Anunț începere lucrări (ISC + Primărie)",
        "issuer": "ISC + Primăria emitentă AC",
        "legal": "Legea 50/1991 art. 7 alin. (8)",
        "template_id": "anunt_incepere",
        "phase": "executie",
        "mandatory": True,
        "default_recipient_role": "isc",
        "extra_fields": [],
        "extra_attachments": ["Copie AC", "Copie contract execuție"],
    },
    {
        "id": "predare_amplasament",
        "label": "PV Predare-Primire Amplasament",
        "issuer": "Beneficiar ⇆ Executant",
        "legal": "Legea 10/1995 art. 13",
        "template_id": "predare_amplasament",
        "phase": "executie",
        "mandatory": True,
        "default_recipient_role": "beneficiar",
        "extra_fields": [],
        "extra_attachments": [],
    },
    {
        "id": "dispozitie_santier",
        "label": "Dispoziție de șantier (opțional)",
        "issuer": "Proiectant atestat",
        "legal": "Ord. MLPAT 24/N/1997",
        "template_id": "dispozitie_santier",
        "phase": "executie",
        "mandatory": False,
        "applies_if": lambda d: str(d.get("dispozitie_necesara", "")).lower() in ("da", "true", "1", "yes"),
        "default_recipient_role": "executant",
        "extra_fields": [
            {"key": "dispozitie_necesara", "label": "Necesară dispoziție?", "type": "select", "options": ["Nu", "Da"]},
            {"key": "dispozitie_obiect", "label": "Obiect dispoziție", "type": "textarea"},
            {"key": "dispozitie_justificare", "label": "Justificare tehnică", "type": "textarea"},
        ],
        "extra_attachments": [],
    },
    {
        "id": "cerere_ac",
        "label": "Cerere Autorizație de Construire",
        "issuer": "Primăria emitentă CU",
        "legal": "Legea 50/1991",
        "template_id": "memoriu_tehnic",  # Memorial sintetic + anexe DTAC
        "phase": "dtac",
        "mandatory": True,
        "default_recipient_role": "primarie",
        "extra_fields": [],
        "extra_attachments": ["DTAC complet", "Copie CU", "Toate avizele obținute"],
    },
    {
        "id": "cerere_pif",
        "label": "Cerere PIF (Punere în Funcțiune)",
        "issuer": "OSD",
        "legal": "Ord. ANRE 162/2021",
        "template_id": "cerere_pif",
        "phase": "pif",
        "mandatory": True,
        "default_recipient_role": "osd",
        "extra_fields": [],
        "extra_attachments": ["PV Recepție", "Buletine probe rezistență + etanșeitate", "Certificate materiale"],
    },
]


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def list_all() -> List[Dict[str, Any]]:
    """Returnează toate avizele, fără funcțiile (pentru serializare JSON)."""
    return [_serialize(a) for a in AVIZE]


def _serialize(a: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in a.items() if not callable(v)}


def applicable_for(project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Returnează avizele aplicabile pentru un proiect (combină mandatory + applies_if)."""
    out = []
    for a in AVIZE:
        if a.get("mandatory"):
            out.append(_serialize(a))
            continue
        cond = a.get("applies_if")
        if callable(cond) and cond(project_data or {}):
            out.append(_serialize(a))
    return out


def get_aviz(aviz_id: str) -> Optional[Dict[str, Any]]:
    for a in AVIZE:
        if a["id"] == aviz_id:
            return a
    return None


def build_aviz_status_map(project_data: Dict[str, Any], stored_status: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Combină catalogul cu statusul salvat în DB pentru fiecare aviz.

    Returnează: [{id, label, issuer, legal, status, sent_at?, received_at?, attachments?, ...}]
    """
    applicable = applicable_for(project_data)
    out = []
    for a in applicable:
        s = stored_status.get(a["id"], {})
        out.append({
            **a,
            "status": s.get("status", "planificat"),  # planificat | cerut | primit | respins
            "sent_at": s.get("sent_at"),
            "sent_to": s.get("sent_to"),
            "received_at": s.get("received_at"),
            "received_number": s.get("received_number"),
            "received_pdf_b64": s.get("received_pdf_b64"),  # PDF aviz primit (atașat manual)
            "notes": s.get("notes"),
        })
    return out
