"""Generate a self-contained 'handoff' file that another Emergent user can paste
into a brand-new Emergent chat to instantly continue this project from where it was left.

Bundles: project vision/PRD, recent commits, repo URL, deploy targets, .env keys list
(values redacted), developer-account convention, important files index.
"""
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any

import httpx

GITHUB_API = "https://api.github.com"
ROOT = Path(__file__).parent.parent  # /app


def _read_safe(path: Path, max_chars: int = 8000) -> str:
    if not path.exists():
        return ""
    try:
        text = path.read_text(encoding="utf-8")
        if len(text) > max_chars:
            return text[:max_chars] + f"\n\n…(truncated, total {len(text)} chars)"
        return text
    except Exception:
        return ""


def _env_keys(env_path: Path) -> list:
    """Return list of env keys (values redacted) from a .env file."""
    if not env_path.exists():
        return []
    keys = []
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k = line.split("=", 1)[0].strip()
        if k:
            keys.append(k)
    return keys


async def _recent_commits(limit: int = 10) -> list:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    owner = os.environ.get("GITHUB_OWNER", "").strip()
    repo = os.environ.get("GITHUB_REPO", "").strip()
    branch = os.environ.get("GITHUB_BRANCH", "main").strip()
    if not token or not owner or not repo:
        return []
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "EnergyProjectDesignServices/1.0",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{GITHUB_API}/repos/{owner}/{repo}/commits",
                params={"sha": branch, "per_page": limit},
                headers=headers,
            )
            resp.raise_for_status()
            out = []
            for c in resp.json():
                commit = c.get("commit", {})
                out.append({
                    "sha": c.get("sha", "")[:7],
                    "message": commit.get("message", "").split("\n", 1)[0][:160],
                    "date": commit.get("author", {}).get("date"),
                    "url": c.get("html_url"),
                })
            return out
    except Exception:
        return []


async def build_handoff_markdown() -> str:
    owner = os.environ.get("GITHUB_OWNER", "dragosserban95")
    repo = os.environ.get("GITHUB_REPO", "Energy-Project-Design")
    branch = os.environ.get("GITHUB_BRANCH", "main")
    repo_url = f"https://github.com/{owner}/{repo}"

    prd = _read_safe(ROOT / "memory" / "PRD.md", max_chars=12000)
    readme = _read_safe(ROOT / "README.md", max_chars=6000)
    creds = _read_safe(ROOT / "memory" / "test_credentials.md", max_chars=2000)

    backend_env_keys = _env_keys(ROOT / "backend" / ".env")
    frontend_env_keys = _env_keys(ROOT / "frontend" / ".env")
    commits = await _recent_commits(limit=12)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    md = f"""# 🛟 HANDOFF — Energy Project Design Services
**Snapshot generated:** {now}
**Source repo:** {repo_url} (branch `{branch}`)
**Preview (current Emergent session):** https://github-push-test.preview.emergentagent.com
**Production target:** https://energy-project-design-services.onrender.com

---

## 📌 Pentru noul utilizator Emergent — cum continui de aici

Pasul 1. Creează un task nou în Emergent (cont gratuit OK).
Pasul 2. În prompt, lipește acest mesaj:

> Importă codul din `{repo_url}` (branch `{branch}`). Apoi citește `/app/memory/PRD.md` și `HANDOFF_FOR_NEXT_EMERGENT.md` din rădăcina repo-ului ca să înțelegi unde am rămas. Limba aplicației: română. Contul developer: `dragosserban95@gmail.com` / parola `Test12345` (auto-detectat ca developer). Continuă de la secțiunea "Next actions" din handoff.

Pasul 3. Configurează secretele în `backend/.env` (lista mai jos). Sunt deja documentate în `backend/.env.example`.
Pasul 4. Repornește serviciile: `sudo supervisorctl restart backend frontend`.

---

## 🧠 Project vision (PRD.md — full copy)

{prd or "_PRD lipsă — vezi README._"}

---

## 📜 README

{readme or "_README lipsă._"}

---

## 🔐 Test credentials

{creds or "_test_credentials.md lipsă._"}

---

## 📦 Repo state — ultimele commits

| SHA | Data | Mesaj |
|-----|------|-------|
""" + "\n".join(
        f"| `{c['sha']}` | {c['date'] or '?'} | {c['message']} |" for c in commits
    ) + f"""

Vezi toate commit-urile: {repo_url}/commits/{branch}

---

## ⚙️ Backend env keys (`backend/.env`) — valorile redacted, copiază din contul tău

```
{chr(10).join(f"{k}=" for k in backend_env_keys)}
```

Detalii unde obții fiecare cheie sunt în `backend/.env.example`.

## ⚙️ Frontend env keys (`frontend/.env`)

```
{chr(10).join(f"{k}=" for k in frontend_env_keys)}
```

---

## 🚀 Deployment cu Render (1-click)

1. `render.yaml` e deja în rădăcina repo-ului — auto-detectat de Render.
2. Conectează repo-ul în [Render dashboard](https://dashboard.render.com/select-repo).
3. Setezi secretele în Render UI (env vars).
4. URL public: `https://energy-project-design-services.onrender.com`

## 🤖 Developer prompt → GitHub auto-push

După login ca `dragosserban95@gmail.com` → meniul **// Intern → Push pe GitHub** (`/developer/github`):
- Endpoint backend: `POST /api/dev/github/push` (`backend/github_push.py`)
- Trimite fișiere noi/actualizate → commit pe `{branch}` → Render auto-deploy

---

## 🗂️ Arhitectură pe scurt

```
/app/
├── backend/                 FastAPI + Motor (MongoDB)
│   ├── server.py            Router principal (/api/*)
│   ├── auth.py              JWT email/password + Emergent Google
│   ├── github_push.py       Developer → GitHub commit
│   ├── ai_assistant.py      Intent parser (13 intents)
│   ├── ai_developer.py      Plan Mode (no auto-apply)
│   ├── docx_processor.py    Placeholder replacement {{{{var}}}} și <var>
│   ├── pdf_export.py        reportlab
│   ├── calc_engine.py       6 formule (debit, presiune, etc.)
│   ├── qes_provider.py      Mock acum; certSIGN/DigiSign/Trans Sped pending
│   ├── plans.py             Stripe plans (Basic 99 → Societate 2500 + Developer)
│   ├── industries.py        8 industrii (gaze activ; restul coming_soon)
│   └── system_templates.py  6 template-uri pre-seeded
└── frontend/
    └── src/
        ├── App.js
        ├── contexts/AuthContext.jsx
        ├── lib/api.js       axios baseURL = `${{REACT_APP_BACKEND_URL}}/api`
        └── pages/           ~25 pagini (Dashboard, Projects, ProjectData, ...)
```

---

## ✅ Done / ⏳ Pending / 📦 Backlog

### Done (în această sesiune)
- ✅ Cod complet push-uit în GitHub (`backend/`, `frontend/src/`, `render.yaml`, `.env.example`)
- ✅ Endpoint developer **GitHub auto-push** + pagină `/developer/github` cu UI completă
- ✅ Endpoint **handoff export** (acest fișier!)
- ✅ V4.7 features: PDF export (reportlab), AI Developer Chat, prețuri actualizate (Societate 2500 EUR), industria "Construcții" activată

### Pending (next actions pentru noul user)
- 🔴 **Deploy pe Render**: conectează repo-ul (link mai sus) + setează secretele
- 🟠 **Refactor auth**: localStorage → httpOnly cookies (`AuthContext.jsx`, `auth.py`, `server.py`, `api.js`). Solicitat de Code Review.
- 🟡 **QES real**: certSIGN/DigiSign/Trans Sped subclass — așteaptă contract + API key de la user
- 🟡 **Stripe live key**: schimbă `sk_test_emergent` cu cheia live din .env

### Backlog (P2-P3)
- Encrypt `qes_credentials` la rest (Fernet)
- Refactor `server.py::verify_documentation()` (93 linii)
- Refactor `pages/Developer.jsx` (componentă mare)
- Activare industrii: Electrică / Apă & Canalizare / Telecom / Fotovoltaice / Infrastructură feroviară
- Team workspaces cu role inheritance
- Public verification page `/verify/{{doc_id}}`

---

## 🧪 Test rapid după preluare

```bash
cd /app
# Backend
curl http://localhost:8001/api/                                # {{"status":"ok"...}}
curl -X POST http://localhost:8001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{{"email":"dragosserban95@gmail.com","password":"Test12345"}}'

# Frontend
# vizitezi preview URL, te loghezi, vezi meniul "// Intern" cu 3 itemi developer.
```

---

## 📬 Contact

Compania reală: **ENERGY PROJECT DESIGN SRL** · CUI 43151074 · J40/12982/2020 · București.
Limba interfeței: română.

---

_End of handoff. Bună continuare 👋_
"""
    return md
