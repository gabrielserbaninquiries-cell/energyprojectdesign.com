"""Plan catalog for Energy Project Design Services platform.

Each plan defines: price (EUR), included features, recipient roles allowed,
stamp types allowed, document types allowed, export rights, and monthly quota.
"""
from typing import Dict, List

# Feature keys
F_PROJECT = "project_data"          # Date proiect
F_TECHNICAL = "technical_data"      # Date tehnice
F_CALC = "smart_calc"               # Calcul inteligent
F_DOCS = "documents"                # Generare documente
F_STAMPS = "stamps"                 # Ștampile autorizate
F_EMAIL = "emails"                  # Trimitere email-uri
F_CERT = "certifications"           # Certificări interne (semnături)
F_VERIFY = "verification"           # Verificare documentație
F_EXPORT = "export"                 # Export DOCX/PDF/JSON
F_AUDIT = "audit"                   # Audit interfață
F_AI = "ai_assistant"               # AI Assistant
F_DEV = "ai_developer"              # AI Developer (intern)
F_OFFER = "offers"                  # Ofertare
F_ACCOUNT = "accounting"            # Contabilitate

# Roles (used for stamps + email recipients + certifications)
ROLES = ["beneficiar", "osd", "proiectant", "executant", "vgd", "rte", "contabilitate", "ofertare", "administrator"]

DOC_TYPES = [
    "cerere_racordare", "memoriu_tehnic", "fisa_date_tehnice",
    "adresa_osd", "certificare_vgd", "certificare_rte", "borderou_documente",
]

PLANS: Dict[str, Dict] = {
    "free": {
        "id": "free", "name": "Free", "label": "Demo / Trial expirat",
        "price_eur": 0, "currency": "eur", "currency_label": "Gratuit",
        "tagline": "Acces minim de demonstrație, după expirarea trial-ului. Doar Date proiect + 1 calcul.",
        "documents_per_month": 0,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC],
        "stamps_allowed": [],
        "recipients_allowed": [],
        "documents_allowed": [],
        "export_allowed": False,
        "value_props": [
            "Acces nelimitat la date proiect (vizualizare)",
            "1 calcul inteligent (debit, dimensionare)",
            "Fără generare documente · fără export",
        ],
    },
    "trial": {
        "id": "trial", "name": "Trial", "label": "Trial 14 zile",
        "price_eur": 0, "currency": "eur", "currency_label": "14 zile gratuit",
        "tagline": "Test complet 14 zile cu acces la generator documente, calcule, semnătură (export limitat la 3 docs).",
        "documents_per_month": 10,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_AI],
        "stamps_allowed": ["proiectant"],
        "recipients_allowed": ["beneficiar", "osd"],
        "documents_allowed": ["cerere_racordare", "memoriu_tehnic", "fisa_date_tehnice"],
        "export_allowed": False,
        "value_props": [
            "Acces total 14 zile (toate funcțiile principale)",
            "10 documente DOCX generabile",
            "Calcul inteligent · semnătură digitală · QR code",
            "Asistent AI inclus",
        ],
    },
    "basic": {
        "id": "basic", "name": "Basic", "label": "Introducere date",
        "price_eur": 49, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru introducerea și organizarea datelor de proiect (proiecte mici).",
        "documents_per_month": 30,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar"],
        "documents_allowed": [],
        "export_allowed": False,
        "value_props": [
            "30 proiecte/lună",
            "Date proiect centralizate (76 câmpuri standard)",
            "Calc engine inclus (Renouard, Ks, dimensionare)",
            "Fără generare documente · upgrade pentru DOCX",
        ],
    },
    "operator": {
        "id": "operator", "name": "Operator", "label": "Operator introducere date",
        "price_eur": 79, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru operatorul de introducere date al unei societăți. Adaugă generare DOCX.",
        "documents_per_month": 50,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar"],
        "documents_allowed": ["fisa_date_tehnice", "memoriu_tehnic"],
        "export_allowed": True,
        "value_props": [
            "50 proiecte/lună",
            "Generare DOCX (fișă tehnică, memoriu)",
            "Export ZIP + e-Factura ANAF integrat",
            "Acces Avize Hub (read-only)",
        ],
    },
    "proiectant": {
        "id": "proiectant", "name": "Proiectant", "label": "Proiectare individuală",
        "price_eur": 129, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru proiectantul individual atestat ANRE. 17 template-uri DOCX + Avize Hub complet.",
        "documents_per_month": 100,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT],
        "stamps_allowed": ["proiectant"],
        "recipients_allowed": ["beneficiar", "osd", "vgd", "rte", "primarie"],
        "documents_allowed": ["cerere_racordare", "memoriu_tehnic", "fisa_date_tehnice", "borderou_documente", "carte_tehnica"],
        "export_allowed": True,
        "highlight": True,
        "value_props": [
            "100 proiecte/lună",
            "17 template-uri DOCX (cerere CU/ATR/avize, memoriu, caiet sarcini, anunț, predare, PV, carte tehnică)",
            "13 avize cu dispatch email + tracking",
            "Semnătură digitală SHA-256 + QR public",
            "Preview PDF cu ștampile + auto-certificare",
        ],
    },
    "executant": {
        "id": "executant", "name": "Executant", "label": "Execuție lucrări",
        "price_eur": 109, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru firme de execuție lucrări (atestat EGD/EGIU). Cu anunț începere + PV recepție.",
        "documents_per_month": 100,
        "users_allowed": 2,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT],
        "stamps_allowed": ["executant"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "vgd", "rte", "primarie", "isc"],
        "documents_allowed": ["fisa_date_tehnice", "borderou_documente", "anunt_incepere", "predare_amplasament", "pv_receptie", "dispozitie_santier"],
        "export_allowed": True,
        "value_props": [
            "100 proiecte/lună, 2 useri (RTE + diriginte)",
            "Anunț începere + PV predare + PV recepție",
            "Dispoziție de șantier (opțional)",
            "Acces Avize Hub (status real-time)",
            "Conexiune e-Factura ANAF",
        ],
    },
    "avize": {
        "id": "avize", "name": "Avize", "label": "Departament avize / OSD",
        "price_eur": 79, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru responsabilul cu avize + relația OSD. Acces complet Avize Hub.",
        "documents_per_month": 200,
        "users_allowed": 1,
        "features": [F_PROJECT, F_DOCS, F_EMAIL, F_VERIFY, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["osd", "proiectant", "beneficiar", "primarie", "apm", "iscir"],
        "documents_allowed": ["cerere_racordare", "adresa_osd"],
        "export_allowed": True,
        "value_props": [
            "200 cereri avize/lună",
            "Avize Hub complet (13 avize cu condiționale)",
            "Email dispatch automat per aviz + tracking termene",
            "ZIP cerere + manifest anexe pentru fiecare aviz",
            "Alertă expirare aviz",
        ],
    },
    "ofertare": {
        "id": "ofertare", "name": "Ofertare", "label": "Ofertare + Auto-apply SEAP",
        "price_eur": 89, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru departamentul de ofertare + auto-apply pe SEAP.",
        "documents_per_month": 100,
        "users_allowed": 2,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_OFFER, F_EMAIL, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar", "ofertare", "primarie"],
        "documents_allowed": ["fisa_date_tehnice"],
        "export_allowed": True,
        "value_props": [
            "100 oferte/lună",
            "Auto-apply pe SEAP cu certificate firmei (CAEN match)",
            "Alertă lucrări potrivite cu atestate ANRE",
            "Template-uri ofertă tehnico-comercială",
            "Calc preț automat (deviz materiale + manoperă)",
        ],
    },
    "contabilitate": {
        "id": "contabilitate", "name": "Contabilitate", "label": "Contabilitate + e-Factura",
        "price_eur": 69, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru departamentul contabilitate. e-Factura ANAF integrată + conturi bancare.",
        "documents_per_month": 200,
        "users_allowed": 1,
        "features": [F_PROJECT, F_ACCOUNT, F_EMAIL, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar", "contabilitate"],
        "documents_allowed": [],
        "export_allowed": True,
        "value_props": [
            "200 facturi/lună",
            "e-Factura ANAF (SPV) — trimitere automată",
            "Monitorizare conturi încasări",
            "Export D112, D394 (parțial)",
            "Sincronizare cu trezoreria + bănci (parțial)",
        ],
    },
    "vgd": {
        "id": "vgd", "name": "VGD", "label": "Verificator documentație",
        "price_eur": 159, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru VGD atestat ANRE. Audit documentație + certificare digitală.",
        "documents_per_month": 150,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT],
        "stamps_allowed": ["vgd"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "executant", "rte"],
        "documents_allowed": ["certificare_vgd", "borderou_documente"],
        "export_allowed": True,
        "value_props": [
            "150 verificări/lună",
            "Audit automat documentație (placeholder coverage)",
            "Certificare VGD + ștampilă digitală",
            "Workflow refuz + observații",
            "Acces toate documentele clienților desemnați",
        ],
    },
    "rte": {
        "id": "rte", "name": "RTE", "label": "Responsabil tehnic execuție",
        "price_eur": 149, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru RTE atestat MDLPA. Verificare carte tehnică + certificări.",
        "documents_per_month": 150,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT],
        "stamps_allowed": ["rte"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "executant", "vgd"],
        "documents_allowed": ["certificare_rte", "borderou_documente"],
        "export_allowed": True,
        "value_props": [
            "150 verificări/lună",
            "Verificare carte tehnică (HG 273/1994 + MLPAT 770/1997)",
            "Certificare RTE + ștampilă digitală",
            "Workflow PV recepție",
            "Acces dosare execuție clienți desemnați",
        ],
    },
    "societate": {
        "id": "societate", "name": "Societate", "label": "Societate completă (5 useri)",
        "price_eur": 349, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Acces total pe 5 useri — toate departamentele unei firme (proiectant + executant + avize + ofertare + contabilitate). 1 societate cu device binding.",
        "documents_per_month": 1500,
        "users_allowed": 5,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT, F_AI, F_OFFER, F_ACCOUNT],
        "stamps_allowed": ["proiectant", "executant", "vgd", "rte", "societate"],
        "recipients_allowed": ROLES,
        "documents_allowed": DOC_TYPES,
        "export_allowed": True,
        "highlight": True,
        "value_props": [
            "1500 documente/lună, 5 useri (echivalent 4-5 angajați)",
            "Toate funcțiile (mai puțin AI Developer)",
            "Conturi separate per departament (operator, proiectant, executant, avize, contabilitate)",
            "Marketplace inclus + Job Board ANRE",
            "Asistent AI + Chatbot Claude inclus",
            "ROI tipic: 1 lună (vs salariul a 1/4 angajat)",
        ],
    },
    "developer": {
        "id": "developer", "name": "Developer", "label": "Developer Infinite (intern)",
        "price_eur": 0, "currency": "eur", "currency_label": "Lifetime intern",
        "tagline": "Acces intern lifetime — doar pentru echipa de dezvoltare EPD + parteneri certificați.",
        "documents_per_month": 99999,
        "users_allowed": 99999,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT, F_AI, F_DEV, F_OFFER, F_ACCOUNT],
        "stamps_allowed": ["proiectant", "executant", "vgd", "rte", "societate"],
        "recipients_allowed": ROLES,
        "documents_allowed": DOC_TYPES,
        "export_allowed": True,
        "internal": True,
    },
    "inside_full": {
        "id": "inside_full", "name": "Inside Full", "label": "Inside Full (protejat)",
        "price_eur": 0, "currency": "eur", "currency_label": "Acces restricționat",
        "tagline": "Zonă internă protejată — deblocată numai prin enigma și parola Inside.",
        "documents_per_month": 99999,
        "users_allowed": 1,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT, F_AI, F_DEV, F_OFFER, F_ACCOUNT],
        "stamps_allowed": ["proiectant", "executant", "vgd", "rte", "societate"],
        "recipients_allowed": ROLES,
        "documents_allowed": DOC_TYPES,
        "export_allowed": True,
        "internal": True,
        "inside": True,
    },
}

DEFAULT_PLAN = "basic"


def get_plan(plan_id: str) -> Dict:
    return PLANS.get(plan_id, PLANS[DEFAULT_PLAN])


def has_feature(plan_id: str, feature: str) -> bool:
    return feature in get_plan(plan_id).get("features", [])


def public_plans() -> List[Dict]:
    """Plans visible on /pricing — exclude developer."""
    return [p for p in PLANS.values() if not p.get("internal")]
