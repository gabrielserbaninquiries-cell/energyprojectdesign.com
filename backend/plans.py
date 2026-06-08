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
        "tagline": "Acces minim de demonstrație, după expirarea trial-ului.",
        "documents_per_month": 0,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC],
        "stamps_allowed": [],
        "recipients_allowed": [],
        "documents_allowed": [],
        "export_allowed": False,
    },
    "trial": {
        "id": "trial", "name": "Trial", "label": "Trial 14 zile",
        "price_eur": 0, "currency": "eur", "currency_label": "14 zile gratuit",
        "tagline": "Trial complet 14 zile cu toate funcțiile principale activate (export blocat).",
        "documents_per_month": 10,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_AI],
        "stamps_allowed": ["proiectant"],
        "recipients_allowed": ["beneficiar", "osd"],
        "documents_allowed": ["cerere_racordare", "memoriu_tehnic", "fisa_date_tehnice"],
        "export_allowed": False,
    },
    "basic": {
        "id": "basic", "name": "Basic", "label": "Introducere date",
        "price_eur": 99, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru introducerea datelor de proiect.",
        "documents_per_month": 30,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar"],
        "documents_allowed": [],
        "export_allowed": False,
    },
    "operator": {
        "id": "operator", "name": "Operator", "label": "Operator introducere date",
        "price_eur": 109, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru operatorul de introducere date al unei societăți.",
        "documents_per_month": 50,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar"],
        "documents_allowed": ["fisa_date_tehnice"],
        "export_allowed": False,
    },
    "proiectant": {
        "id": "proiectant", "name": "Proiectant", "label": "Proiectare",
        "price_eur": 149, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru biroul de proiectare.",
        "documents_per_month": 100,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT],
        "stamps_allowed": ["proiectant"],
        "recipients_allowed": ["beneficiar", "osd", "vgd", "rte"],
        "documents_allowed": ["cerere_racordare", "memoriu_tehnic", "fisa_date_tehnice", "borderou_documente"],
        "export_allowed": True,
    },
    "executant": {
        "id": "executant", "name": "Executant", "label": "Execuție",
        "price_eur": 149, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru firme de execuție lucrări.",
        "documents_per_month": 100,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT],
        "stamps_allowed": ["executant"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "vgd", "rte"],
        "documents_allowed": ["fisa_date_tehnice", "borderou_documente"],
        "export_allowed": True,
    },
    "avize": {
        "id": "avize", "name": "Avize", "label": "Avize / OSD",
        "price_eur": 129, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru departamentul de avize și relația cu OSD.",
        "documents_per_month": 80,
        "features": [F_PROJECT, F_DOCS, F_EMAIL, F_VERIFY, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["osd", "proiectant", "beneficiar"],
        "documents_allowed": ["cerere_racordare", "adresa_osd"],
        "export_allowed": True,
    },
    "ofertare": {
        "id": "ofertare", "name": "Ofertare", "label": "Ofertare",
        "price_eur": 119, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru ofertarea către clienți + auto-apply SEAP.",
        "documents_per_month": 100,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_OFFER, F_EMAIL, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar", "ofertare"],
        "documents_allowed": ["fisa_date_tehnice"],
        "export_allowed": True,
    },
    "contabilitate": {
        "id": "contabilitate", "name": "Contabilitate", "label": "Contabilitate",
        "price_eur": 119, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru departamentul de contabilitate.",
        "documents_per_month": 100,
        "features": [F_PROJECT, F_ACCOUNT, F_EMAIL, F_EXPORT],
        "stamps_allowed": [],
        "recipients_allowed": ["beneficiar", "contabilitate"],
        "documents_allowed": [],
        "export_allowed": True,
    },
    "vgd": {
        "id": "vgd", "name": "VGD", "label": "Verificator documentație",
        "price_eur": 199, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru verificatorul de documentație (DTAC, PTH).",
        "documents_per_month": 150,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT],
        "stamps_allowed": ["vgd"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "executant", "rte"],
        "documents_allowed": ["certificare_vgd", "borderou_documente"],
        "export_allowed": True,
    },
    "rte": {
        "id": "rte", "name": "RTE", "label": "Responsabil tehnic execuție",
        "price_eur": 199, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Pentru RTE — verificare carte tehnică execuție.",
        "documents_per_month": 150,
        "features": [F_PROJECT, F_TECHNICAL, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT],
        "stamps_allowed": ["rte"],
        "recipients_allowed": ["beneficiar", "osd", "proiectant", "executant", "vgd"],
        "documents_allowed": ["certificare_rte", "borderou_documente"],
        "export_allowed": True,
    },
    "societate": {
        "id": "societate", "name": "Societate", "label": "Societate completă (1 PC)",
        "price_eur": 399, "currency": "eur", "currency_label": "EUR / lună",
        "tagline": "Acces total pe 1 PC — toate departamentele, fără AI Developer.",
        "documents_per_month": 1000,
        "features": [F_PROJECT, F_TECHNICAL, F_CALC, F_DOCS, F_STAMPS, F_EMAIL, F_CERT, F_VERIFY, F_EXPORT, F_AUDIT, F_AI, F_OFFER, F_ACCOUNT],
        "stamps_allowed": ["proiectant", "executant", "vgd", "rte", "societate"],
        "recipients_allowed": ROLES,
        "documents_allowed": DOC_TYPES,
        "export_allowed": True,
        "highlight": True,
    },
    "developer": {
        "id": "developer", "name": "Developer", "label": "Developer Infinite (intern)",
        "price_eur": 0, "currency": "eur", "currency_label": "Lifetime intern",
        "tagline": "Acces intern lifetime — doar pentru echipa de dezvoltare EPD.",
        "documents_per_month": 99999,
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
