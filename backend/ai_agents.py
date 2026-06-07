"""AI Agents — 4 specialized LLM-powered assistants using Emergent universal key.

Each agent has a focused system prompt for a specific persona inside the Energy
Project Design B2B platform.

- producer  — for proiectanți autorizați ANRE (generation of technical content)
- user      — for end-clients (homeowners, SMEs) wanting to understand offers
- client    — for executanți / firme afiliate (procurement, supply chain)
- developer — for platform admins / power-users (debugging, automation)

Also exposes a SEAP relevance scorer that takes a Romanian tender title/body
and returns {score: 0-100, industry: <id>, summary: <ro>, reasons: [...]}
"""
from __future__ import annotations
import os
import asyncio
import json
import re
from typing import Dict, List, Optional
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
DEFAULT_MODEL = ("anthropic", "claude-sonnet-4-6")

AGENT_PROMPTS = {
    "producer": (
        "Ești asistent AI specializat pentru proiectanți autorizați ANRE din România. "
        "Răspunde în română, concis (max 6 propoziții), cu referințe la normative: "
        "ANRE Ord. 34/2024 (prosumator), HG 162/2024, NTPEE 2018 (gaze), I7-2011 (electric), "
        "SR EN 50618 (cabluri DC), SR EN 62446 (PIF FV). Când utilizatorul cere calcule, "
        "sugerează deschiderea modulului relevant din platformă (Fotovoltaic, Gaze, Electric). "
        "Nu inventa numere — dacă lipsesc date, întreabă. Stil: profesionist, direct."
    ),
    "user": (
        "Ești asistent AI pentru beneficiarii finali (clienți casnici sau IMM) care primesc "
        "oferte tehnice de la firme de instalații (fotovoltaic, gaze, electric). Răspunde în "
        "română prietenoasă, simplă, fără jargon excesiv. Explică în termeni clari: ce înseamnă "
        "kWp, ce e un prosumator, cum se calculează amortizarea, ce documente primesc. "
        "La final, recomandă întotdeauna verificarea ofertei cu un proiectant autorizat ANRE. "
        "Stil: cald, educativ, fără să sperii cu detalii tehnice excesive."
    ),
    "client": (
        "Ești asistent AI pentru firme executante și subcontractori (montatori, electricieni, "
        "instalatori) care primesc proiecte de la proiectanți. Concentrează-te pe: lista de "
        "materiale, secvența de montaj, scule necesare, riscuri SSM, cerințe de PIF (Punere "
        "În Funcțiune). Răspunde în română, lista cu bullet points când e cazul. "
        "Stil: practic, orientat spre execuție, fără teorie inutilă."
    ),
    "developer": (
        "Ești asistent AI pentru administratorii și dezvoltatorii platformei Energy Project "
        "Design. Răspunde în română, tehnic, cu referințe la stack-ul actual: FastAPI + Motor "
        "(MongoDB) + React + Tailwind + Shadcn + emergentintegrations. Sugerează endpoint-uri, "
        "modele Pydantic, pattern-uri de cod. Când utilizatorul cere automation, propune un "
        "script Python sau un endpoint nou cu signature completă. Stil: precis, code-first."
    ),
}


def _has_key() -> bool:
    return bool(EMERGENT_LLM_KEY)


async def _ask(agent: str, message: str, session_id: str) -> str:
    """Single-shot ask: collect streamed tokens into a final string."""
    if not _has_key():
        return ("⚠️ EMERGENT_LLM_KEY nu este configurat. Adăugați cheia în /app/backend/.env "
                "pentru a activa agenții AI.")
    if agent not in AGENT_PROMPTS:
        return f"Agent necunoscut: {agent}"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=AGENT_PROMPTS[agent],
    ).with_model(*DEFAULT_MODEL)
    parts: List[str] = []
    try:
        async for ev in chat.stream_message(UserMessage(text=message)):
            if isinstance(ev, TextDelta):
                parts.append(ev.content)
            elif isinstance(ev, StreamDone):
                break
    except Exception as e:
        return f"⚠️ Eroare LLM: {str(e)[:200]}"
    return "".join(parts) or "(răspuns gol)"


async def ask_agent(agent: str, message: str, session_id: Optional[str] = None) -> Dict:
    """Public interface: returns { agent, message, reply, session_id }."""
    sid = session_id or f"agent_{agent}_{abs(hash(message)) % (10**8)}"
    reply = await _ask(agent, message, sid)
    return {
        "agent": agent,
        "message": message,
        "reply": reply,
        "session_id": sid,
    }


# ============================== SEAP RELEVANCE SCORER ==============================
SEAP_INDUSTRY_KEYWORDS = {
    "gas_engineering": ["gaze naturale", "gaz natural", "conducta gaze", "stație reglare", "GPL"],
    "electrical_engineering": ["instalație electrică", "branșament electric", "tablou electric", "joasă tensiune", "medie tensiune"],
    "telecom": ["telecom", "fibra optica", "rețea date", "centrala telefonică"],
    "railway_infra": ["cale ferată", "feroviar", "linie ferată", "trafic feroviar"],
    "civil_engineering": ["construcții civile", "fundație", "structură beton", "reabilitare clădire"],
    "photovoltaic": ["fotovoltaic", "panouri solare", "kWp", "prosumator", "energie regenerabilă", "PV", "solar"],
    "water_sewage": ["alimentare cu apă", "canalizare", "stație epurare", "rețea apă"],
    "sanitation": ["salubrizare", "deșeuri", "gunoi menajer", "colectare deșeuri"],
    "hvac": ["climatizare", "ventilație", "HVAC", "instalație termică"],
    "environment": ["mediu", "impact ecologic", "biodiversitate", "studiu de mediu"],
    "roads_bridges": ["drum", "pod", "modernizare drumuri", "reabilitare DN", "DJ"],
    "public_lighting": ["iluminat public", "iluminat stradal", "felinare LED"],
}


def score_seap_tender(title: str, description: str = "", value_ron: Optional[float] = None) -> Dict:
    """Rule-based pre-screening: returns industry match + heuristic relevance score."""
    text = f"{title or ''} {description or ''}".lower()
    matches: Dict[str, List[str]] = {}
    for ind, kws in SEAP_INDUSTRY_KEYWORDS.items():
        hits = [k for k in kws if k.lower() in text]
        if hits:
            matches[ind] = hits
    # Pick best industry
    best_ind = max(matches.items(), key=lambda kv: len(kv[1]))[0] if matches else None
    # Heuristic score
    score = 0
    if best_ind:
        score = min(100, len(matches[best_ind]) * 25)
    if value_ron and value_ron > 100_000:
        score = min(100, score + 15)
    if value_ron and value_ron > 1_000_000:
        score = min(100, score + 10)
    return {
        "industry": best_ind,
        "industries_matched": list(matches.keys()),
        "keywords_hit": matches.get(best_ind, []),
        "score": score,
        "value_ron": value_ron,
    }


async def ai_summarize_tender(title: str, description: str) -> str:
    """Use the producer agent to summarize a SEAP tender in 2-3 RO sentences."""
    if not _has_key():
        return "(sumarizare AI indisponibilă — EMERGENT_LLM_KEY lipsește)"
    prompt = (
        f"Sintetizează în maxim 3 propoziții următoarea licitație SEAP. "
        f"Indică pe scurt: obiect, industrie, complexitate.\n\n"
        f"TITLU: {title}\n\nDESCRIERE: {description[:1200]}"
    )
    return await _ask("producer", prompt, f"seap_summary_{abs(hash(title)) % (10**8)}")
