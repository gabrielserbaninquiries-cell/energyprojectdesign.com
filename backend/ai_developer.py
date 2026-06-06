"""AI Developer panel — controlled patch planner for developer account.

This module deliberately does NOT execute code or modify files. It only:
1. Generates a Plan (diagnostic + proposed steps) — Plan Mode
2. Generates a Validation Checklist — Plan Mode
3. Calls external LLM if developer provided an OpenAI API key — Plan Mode
4. NEVER applies anything automatically — Apply Mode requires explicit human
   confirmation via the main agent (us / OpenAI Codex / etc.) operating on
   the codebase directly.

This is the safe scaffold for hooking the running app to external AI tools
(this assistant, OpenAI Codex, ChatGPT, etc.) without risking the codebase.
"""
import os
import json
from typing import Dict, Optional
import httpx


SAFETY_RULES = [
    "Niciodată nu se face restore automat al codului.",
    "Niciodată nu se face full rebuild orb.",
    "Nu se șterg funcții existente.",
    "Nu se rescrie arhitectura fără diagnostic prealabil.",
    "Nu se modifică Google/OAuth/Stripe fără motiv documentat.",
    "Înainte de aplicare se generează plan + checklist de validare.",
    "După aplicare se rulează auditul interfeței.",
    "Plan Mode și Apply Mode sunt complet separate.",
    "Backup-ul codului este responsabilitatea developer-ului (git).",
]


def diagnostic(repo_summary: Dict) -> Dict:
    """Build a deterministic diagnostic from repo facts."""
    missing = []
    if not repo_summary.get("has_stripe_live_key"):
        missing.append("Cheia Stripe Live nu este configurată — încă rulează pe sk_test_emergent.")
    if not repo_summary.get("has_qes_credentials"):
        missing.append("Nu sunt salvate credențiale QES (certSIGN / DigiSign / Trans Sped).")
    if not repo_summary.get("has_gmail_for_user"):
        missing.append("Userul curent nu are credențiale Gmail configurate — emailurile vor eșua.")
    if not repo_summary.get("has_system_templates"):
        missing.append("Șabloanele de sistem nu sunt încărcate.")
    return {
        "rules": SAFETY_RULES,
        "missing_capabilities": missing,
        "next_safe_actions": [
            "Adăugați cheia Stripe Live în backend/.env și restart backend.",
            "Completați credențialele certSIGN în Setări → QES după semnarea contractului.",
            "Configurați adresa Gmail + App Password în Setări → Configurare email.",
        ],
    }


async def plan(prompt: str, repo_summary: Dict, openai_api_key: Optional[str] = None) -> Dict:
    """Generate a development plan from a natural-language prompt.

    If openai_api_key is provided, calls OpenAI to enrich the plan. Otherwise
    returns a deterministic rule-based skeleton.
    """
    base = {
        "mode": "plan",
        "prompt": prompt,
        "diagnostic": diagnostic(repo_summary),
        "proposed_steps": _rule_based_steps(prompt),
        "validation_checklist": [
            "Rulează auditul interfeței (/audit)",
            "Rulează verificarea documentației (/verifica)",
            "Rulează testele pytest existente",
            "Verifică că niciun endpoint nu returnează 500",
            "Confirmă manual că nicio funcție existentă nu a fost ștearsă",
        ],
        "apply_mode_required_confirmation": True,
        "external_llm_used": False,
    }
    if openai_api_key:
        try:
            base["external_llm_advice"] = await _call_openai(prompt, openai_api_key)
            base["external_llm_used"] = True
        except Exception as e:
            base["external_llm_error"] = str(e)
    return base


def _rule_based_steps(prompt: str) -> list:
    t = (prompt or "").lower()
    steps = []
    if any(k in t for k in ["adaug", "add", "feature"]):
        steps.append("1. Identifică pagina țintă din /audit.")
        steps.append("2. Definește modelul Pydantic în /app/backend/models.py.")
        steps.append("3. Adaugă endpoint sub /api/ în /app/backend/server.py.")
        steps.append("4. Creează componenta React în /app/frontend/src/pages/.")
        steps.append("5. Înregistrează ruta în /app/frontend/src/App.js.")
        steps.append("6. Adaugă data-testid pe toate elementele interactive.")
        steps.append("7. Rulează testing_agent_v3 cu noile cazuri de test.")
    if any(k in t for k in ["industri", "industry"]):
        steps.append("Extinde /app/backend/industries.py cu o intrare nouă în INDUSTRIES.")
        steps.append("Marchează status='active' și adaugă subdomenii cu active=True.")
        steps.append("Adaugă șabloane de sistem corespunzătoare în /app/backend/system_templates.py.")
    if any(k in t for k in ["stripe", "live"]):
        steps.append("Actualizează STRIPE_API_KEY în /app/backend/.env cu cheia sk_live_...")
        steps.append("Verifică PLANS în /app/backend/plans.py — currency='eur' este corectă.")
        steps.append("Rulează `sudo supervisorctl restart backend`.")
    if any(k in t for k in ["qes", "certsign", "digisign"]):
        steps.append("Implementează subclasa în /app/backend/qes_provider.py.")
        steps.append("Apelează API-ul furnizorului în metoda sign() cu credențialele salvate.")
        steps.append("Setează status='active' în info().")
    if not steps:
        steps = [
            "Nu am identificat o intenție clară. Reformulați prompt-ul cu verbe explicite: adaugă / modifică / corectează / testează.",
        ]
    return steps


async def _call_openai(prompt: str, api_key: str) -> str:
    """Optional enrichment via OpenAI Chat Completions."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": (
                        "Sunteți AI Developer Assistant pentru platforma Energy Project Design Services "
                        "(FastAPI + React + MongoDB, Romanian gas engineering documentation). "
                        "Oferiți pași clari și siguri de implementare. NU rescrieți cod existent. "
                        "NU propuneți modificări la autentificare, Stripe sau OAuth. "
                        "Răspundeți în limba română, max 10 puncte numerotate."
                    )},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 600,
                "temperature": 0.2,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]
