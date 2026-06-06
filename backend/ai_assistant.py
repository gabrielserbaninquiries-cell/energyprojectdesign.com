"""AI Assistant — rule-based intent parser.

Maps free-text Romanian commands to structured operational intents.
NO LLM calls — deterministic, safe, instant. Returns a 'command packet'
that the UI previews before the user navigates / acts.
"""
import re
from typing import Dict, List, Optional, Tuple


# Intent → (target_page, required_action, keywords)
INTENT_MAP = [
    ("fill_project_data",   "/proiect",            "Completează datele proiectului",        ["completeaz", "complet", "introduc", "adaug"], ["proiect", "date proiect"]),
    ("fill_technical_data", "/tehnice",            "Completează datele tehnice",            ["completeaz", "complet", "introduc"],          ["tehnic", "date tehnice"]),
    ("run_calc",            "/calcul",             "Rulează calculul inteligent",           ["rulează", "rulea", "calcul"],                 ["calcul", "smart calc", "rezultat"]),
    ("generate_document",   "/templates",          "Generează un document din șablon",      ["generează", "genera", "creează", "crea"],     ["document", "act", "memoriu", "fișă"]),
    ("scan_placeholders",   "/templates",          "Scanează placeholder-ele",              ["scanea", "verifică", "verifica"],             ["placeholder", "marcaj", "câmp"]),
    ("add_stamp",           "/stamps",             "Adaugă o ștampilă",                     ["adaug", "încarcă", "incarca", "pune"],        ["ștampil", "stampil"]),
    ("prepare_email",       "/email",              "Pregătește un email",                   ["pregătește", "pregat", "trimit"],             ["email", "mail", "trimite"]),
    ("certify_signature",   "/certificari",        "Generează certificare internă",         ["certific", "semneaz", "semnaz"],              ["semn", "certific"]),
    ("verify_documentation","/verifica",           "Verifică documentația",                 ["verific"],                                    ["documentaț", "documentat", "dosar", "complet"]),
    ("choose_plan",         "/pricing",            "Alege un plan",                         ["alege", "selectează", "select"],              ["plan", "abonament"]),
    ("buy_plan",            "/pricing",            "Achiziționează un plan",                ["cumpăr", "cumpar", "achizițion", "plătește"], ["plan", "abonament"]),
    ("run_audit",           "/audit",              "Rulează audit-ul aplicației",           ["rulează", "rulea"],                           ["audit"]),
    ("repair",              "/audit",              "Identifică și raportează funcțiile lipsă", ["repar", "remed"],                         ["funcți", "lipsă", "lipsa"]),
    ("self_update",         "/developer",          "Lansează self-update controlat",        ["self update", "actualiz", "rebuild"],         ["self", "update", "dev"]),
]


def _normalize(text: str) -> str:
    t = text.lower()
    # naive diacritic strip
    table = str.maketrans({"ă":"a","â":"a","î":"i","ș":"s","ț":"t"})
    return t.translate(table)


def parse(message: str) -> Dict:
    """Return command packet: { intent, target_page, action, confidence, missing, risks }."""
    if not message or not message.strip():
        return {
            "intent": None, "target_page": None, "action": None,
            "confidence": 0.0, "matched_keywords": [],
            "missing": ["mesaj gol"], "risks": [],
            "preview": "Mesaj gol. Scrieți o comandă, ex: 'verifică documentația' sau 'generează document'.",
        }

    text = _normalize(message)

    best: Optional[Tuple[float, Dict]] = None
    for intent, page, action, verbs, nouns in INTENT_MAP:
        v_hits = [v for v in verbs if v in text]
        n_hits = [n for n in nouns if _normalize(n) in text]
        if not n_hits:
            continue  # nouns are required to anchor intent
        score = len(n_hits) * 1.0 + len(v_hits) * 0.5
        # boost specific compound matches
        if intent == "buy_plan" and any(k in text for k in ["cumpar", "achizi", "plateste", "platesc"]):
            score += 1.5
        packet = {
            "intent": intent,
            "target_page": page,
            "action": action,
            "confidence": min(1.0, score / 3.0),
            "matched_keywords": list(set(v_hits + n_hits)),
        }
        if best is None or score > best[0]:
            best = (score, packet)

    if best is None:
        return {
            "intent": None, "target_page": None, "action": None,
            "confidence": 0.0, "matched_keywords": [],
            "missing": ["intenție necunoscută"], "risks": [],
            "preview": "Nu am identificat o intenție. Încercați: 'verifică documentația', 'generează memoriu tehnic', 'pregătește email către OSD'.",
        }

    packet = best[1]
    packet["missing"] = []
    packet["risks"] = []
    packet["preview"] = f"Voi naviga la {packet['target_page']} pentru a: {packet['action']}."
    return packet
