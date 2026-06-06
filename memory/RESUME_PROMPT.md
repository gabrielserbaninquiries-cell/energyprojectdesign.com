# 🔁 RESUME PROMPT — Energy Project Design Services

> **Pentru un cont Emergent NOU sau dacă reluăm progresul:**
> Lipește prompt-ul de mai jos exact așa cum este și apasă Enter.
> AI Agent-ul va citi automat repo-ul, log-ul de comenzi, tracker-ul de pași și viziunea, apoi va continua de la ultimul pas neîndeplinit.

---

## ✅ Prompt unic (recomandat — pas zero pe cont nou)

```
Import comenzi, fisiere, conversatii emergent stocate in repository
dragosserban95/Energy-Project-Design + track page progres building +
continue from last step taken to the end of the script/website final vision.

Citește în această ordine:
1. /app/VISION_MANIFEST.md (viziune locked — nu o suprascrie)
2. /app/memory/PRD.md (cerințe produs)
3. /app/memory/COMMAND_LOG.md (istoricul comenzilor)
4. /app/memory/STEP_TRACKER.json (unde am rămas)
5. /app/memory/LIST_1_TODO.md (TO-DO curent — execută în ordine)
6. /app/memory/LIST_2_SUGGESTED.md (îmbunătățiri sugerate)
7. /app/HANDOFF_FOR_NEXT_EMERGENT.md (snapshot tehnic)

Apoi:
- Continuă de la primul pas „pending" din STEP_TRACKER.json.
- După FIECARE pas major, scrie în COMMAND_LOG.md + actualizează STEP_TRACKER.json + afișează listele 1 și 2 pentru aprobare.
- Commit-uie automat în repo (via /api/dev/github/push) după fiecare fază majoră.
- Limba interfeței: română. Cont developer: dragosserban95@gmail.com / Test12345.
- Lucrează STRICT pe baza listelor 1 și 2. Lista 3 (Out-of-the-box) și 4 (Big Update) doar la cerere explicită.
```

---

## 🔧 Prompt scurt — pentru iterații rapide pe același cont

```
Continuă din /app/memory/STEP_TRACKER.json — primul pas „pending".
Actualizează log-ul + tracker-ul + cele 4 liste după fiecare pas.
```

---

## 📂 Locații cheie (referință rapidă)

| Scop | Cale |
|------|------|
| Viziune locked (append-only) | `/app/VISION_MANIFEST.md` |
| PRD curent | `/app/memory/PRD.md` |
| Log comenzi (append-only) | `/app/memory/COMMAND_LOG.md` |
| Tracker pași (machine-readable) | `/app/memory/STEP_TRACKER.json` |
| Lista 1 (TO-DO) | `/app/memory/LIST_1_TODO.md` |
| Lista 2 (Sugestii) | `/app/memory/LIST_2_SUGGESTED.md` |
| Lista 3 (Out-of-the-box) | `/app/memory/LIST_3_FUTURISTIC.md` |
| Lista 4 (Big Update) | `/app/memory/LIST_4_BIG_UPDATE_WEB_RESEARCH.md` |
| Handoff snapshot | `/app/HANDOFF_FOR_NEXT_EMERGENT.md` |
| Roadmap industrii | `/app/docs/INDUSTRIES_ROADMAP.md` |

---

## ⚙️ Variabile de mediu (preserve, nu modifica)

- `MONGO_URL` (în `/app/backend/.env`) — NU schimba.
- `REACT_APP_BACKEND_URL` (în `/app/frontend/.env`) — NU schimba.
- Toate celelalte chei (Stripe, Gmail, GitHub) pot fi completate prin UI sau `.env`.

---

## 🚦 Comportament obligatoriu AI Agent

1. **NU SUPRASCRIE** `VISION_MANIFEST.md` (append-only).
2. **NU MODIFICA** `MONGO_URL` sau `REACT_APP_BACKEND_URL`.
3. **APPEND** mereu în `COMMAND_LOG.md` (nu rescrie).
4. **UPDATE** atomic `STEP_TRACKER.json` (status → in_progress → completed).
5. **SHOW** Lista 1 și Lista 2 după fiecare fază majoră pentru aprobare.
6. **COMMIT** în repo la finalul fiecărei faze (via developer login + `/api/dev/github/push`).
7. **SKIP** Lista 3 (Out-of-the-box) și Lista 4 (Big Update) — DOAR la cerere explicită.

---

_Document creat: 2026-06-06 12:36 UTC_
_Sincronizat cu STEP_TRACKER.json v1_
