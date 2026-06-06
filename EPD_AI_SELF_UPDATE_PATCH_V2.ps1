# EPD AI SELF UPDATE PATCH V2
# Ruleaza din folderul:
#   C:\Users\40735\Desktop\Energy-Project-Design-UPLOAD
#
# Comanda:
#   powershell -ExecutionPolicy Bypass -File .\EPD_AI_SELF_UPDATE_PATCH_V2.ps1

$ErrorActionPreference = "Stop"

if (!(Test-Path ".\package.json")) {
  throw "Nu gasesc package.json. Intra in folderul Energy-Project-Design-UPLOAD."
}

@'

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const dirs = ["storage", "storage/prompts", "storage/updates", "storage/downloads", "storage/logs", "storage/projects"];
for (const dir of dirs) fs.mkdirSync(path.join(__dirname, dir), { recursive: true });

const upload = multer({ dest: path.join(__dirname, "storage/prompts") });

function now() {
  return new Date().toISOString();
}

function log(action, detail = "") {
  fs.appendFileSync(path.join(__dirname, "storage/logs/server.log"), `${now()} | ${action} | ${detail}\n`, "utf8");
}

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, rel), "utf8"));
  } catch {
    return fallback;
  }
}

function publicUrl(req, rel) {
  const base = process.env.EPD_PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${rel}`;
}

function readText(rel) {
  try {
    return fs.readFileSync(path.join(__dirname, rel), "utf8");
  } catch {
    return "";
  }
}

function readPromptFiles() {
  const dir = path.join(__dirname, "storage/prompts");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => !f.endsWith(".meta.json")) : [];
  return files.map(file => {
    const p = path.join(dir, file);
    const metaPath = p + ".meta.json";
    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
    let text = "";
    try { text = fs.readFileSync(p, "utf8"); } catch {}
    return { file, originalName: meta.originalName || file, size: text.length, uploadedAt: meta.uploadedAt, text };
  });
}

function currentProjectContext() {
  const files = [
    "data/prompt-master.json",
    "data/fields.json",
    "data/templates.json",
    "data/profiles.json",
    "public/index.html",
    "public/app.js",
    "public/style.css"
  ];
  return files.map(rel => `===== ${rel} =====\n${readText(rel) || "LIPSESTE"}`).join("\n\n");
}

function localAnalyze(text) {
  const lower = String(text || "").toLowerCase();
  const checks = [
    ["login", "Login/Register/Trial/Forgot/Google-ready", "auth"],
    ["google", "Integrare Google-ready", "google"],
    ["plată", "Plăți configurabile", "payments"],
    ["plati", "Plăți configurabile", "payments"],
    ["openai", "AI Developer prin OpenAI backend", "ai_developer"],
    ["ai developer", "AI Developer prin OpenAI backend", "ai_developer"],
    ["assistant user", "Asistent utilizator local", "assistant_user"],
    ["prompt", "Upload prompturi și analiză", "prompt_upload"],
    ["update", "Run Update inteligent", "update_center"],
    ["gaze naturale", "Profil gaze naturale", "gas_profile"],
    ["branșamente", "Profil branșamente", "gas_branch"],
    ["osd", "Șabloane OSD", "osd_templates"],
    ["placeholder", "Template engine placeholders", "template_engine"],
    ["vgd", "VGD", "vgd"],
    ["rte", "RTE", "rte"],
    ["email", "Email SMTP-ready", "email"]
  ];
  const tasks = [];
  for (const [kw, title, id] of checks) {
    if (lower.includes(kw)) tasks.push({ id, title, reason: `Detectat termen: ${kw}`, status: "propus" });
  }
  return {
    mode: "local",
    createdAt: now(),
    promptSize: String(text || "").length,
    summary: `Analiză locală: ${tasks.length} cerințe detectate.`,
    tasks,
    files: [],
    manualSteps: ["Setează OPENAI_API_KEY pentru analiză AI reală.", "Setează GITHUB_TOKEN pentru auto-aplicare în repository."]
  };
}

function safeJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Răspunsul AI nu conține JSON valid.");
  return JSON.parse(match[0]);
}

function allowedRepoPath(filePath) {
  const p = String(filePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
  if (!p || p.includes("..")) return false;
  return (
    p === "README_RENDER_DEPLOY.txt" ||
    p.startsWith("public/") ||
    p.startsWith("data/")
  );
}

async function aiProposal(combinedPrompt) {
  if (!process.env.OPENAI_API_KEY) {
    return localAnalyze(combinedPrompt);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.EPD_AI_MODEL || "gpt-4.1-mini";

  const system = `
Ești AI Developer pentru Energy Project Design.
Răspunzi DOAR JSON valid. Nu folosi markdown.
Generează update-uri sigure, aditive, pentru site.
Nu șterge funcții existente.
Nu expune chei, parole sau secrete.
Nu genera cod care rulează comenzi de sistem.
Poți propune modificări doar în:
- public/app.js
- public/index.html
- public/style.css
- data/*.json
- README_RENDER_DEPLOY.txt

Schema obligatorie:
{
  "summary": "rezumat scurt",
  "risks": ["risc sau limitare"],
  "tasks": [{"title":"...","reason":"...","status":"propus"}],
  "files": [{"path":"public/app.js","content":"continut complet fisier"}],
  "manualSteps": ["pas manual daca este cazul"]
}

Dacă nu poți rescrie complet un fișier în siguranță, nu îl pune în files.
`;

  const user = `
CONTEXT ACTUAL SITE:
${currentProjectContext().slice(0, 70000)}

PROMPTURI UTILIZATOR:
${combinedPrompt.slice(0, 120000)}
`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: { type: "json_object" }
  });

  const parsed = safeJson(completion.choices[0]?.message?.content || "{}");
  parsed.mode = "openai";
  parsed.model = model;
  parsed.createdAt = now();
  parsed.files = Array.isArray(parsed.files)
    ? parsed.files.filter(f => allowedRepoPath(f.path) && typeof f.content === "string")
    : [];
  parsed.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  parsed.manualSteps = Array.isArray(parsed.manualSteps) ? parsed.manualSteps : [];
  parsed.risks = Array.isArray(parsed.risks) ? parsed.risks : [];
  return parsed;
}

async function githubGetSha(owner, repo, branch, filePath, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}?ref=${encodeURIComponent(branch)}`;
  const r = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub get file failed ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.sha || null;
}

async function githubPutFile(owner, repo, branch, filePath, content, message, token) {
  const sha = await githubGetSha(owner, repo, branch, filePath, token);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}`;
  const body = {
    message,
    branch,
    content: Buffer.from(content, "utf8").toString("base64")
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`GitHub update failed ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function applyToGithub(proposal) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "dragosserban95";
  const repo = process.env.GITHUB_REPO || "Energy-Project-Design";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) throw new Error("GITHUB_TOKEN lipsește.");
  if (!proposal.files || proposal.files.length === 0) throw new Error("AI nu a propus fișiere aplicabile.");

  const applied = [];
  for (const f of proposal.files) {
    if (!allowedRepoPath(f.path)) continue;
    const result = await githubPutFile(owner, repo, branch, f.path, f.content, `AI Developer update: ${f.path}`, token);
    applied.push({ path: f.path, commit: result.commit?.sha || null });
  }

  let deployHook = null;
  if (process.env.RENDER_DEPLOY_HOOK) {
    const r = await fetch(process.env.RENDER_DEPLOY_HOOK, { method: "POST" });
    deployHook = { ok: r.ok, status: r.status };
  }

  return { owner, repo, branch, applied, deployHook };
}

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.join(__dirname, "storage/downloads")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    product: "Energy Project Design",
    time: now(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    githubUpdateConfigured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO),
    renderDeployHookConfigured: Boolean(process.env.RENDER_DEPLOY_HOOK),
    autoApplyGithub: process.env.EPD_AUTO_APPLY_GITHUB === "true"
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    promptMaster: readJson("data/prompt-master.json", {}),
    fields: readJson("data/fields.json", {}),
    templates: readJson("data/templates.json", {}),
    profiles: readJson("data/profiles.json", {})
  });
});

app.post("/api/login", (req, res) => {
  const user = req.body.user || "";
  const pass = req.body.password || "";
  const ok = user === (process.env.EPD_ADMIN_USER || "developer") && pass === (process.env.EPD_ADMIN_PASSWORD || "Amodilema_99");
  log("login", ok ? user : "failed");
  res.json({ ok, user: ok ? { name: user, role: "Developer", plan: "Developer Infinite" } : null });
});

app.post("/api/prompts/upload", upload.array("files", 30), (req, res) => {
  const result = [];
  for (const file of req.files || []) {
    const meta = { originalName: file.originalname, mimetype: file.mimetype, uploadedAt: now(), size: file.size };
    fs.writeFileSync(file.path + ".meta.json", JSON.stringify(meta, null, 2), "utf8");
    result.push({ id: file.filename, ...meta });
  }

  if (req.body.text && req.body.text.trim()) {
    const id = uuidv4();
    const p = path.join(__dirname, "storage/prompts", id);
    fs.writeFileSync(p, req.body.text, "utf8");
    fs.writeFileSync(p + ".meta.json", JSON.stringify({
      originalName: "prompt_manual.txt",
      mimetype: "text/plain",
      uploadedAt: now(),
      size: req.body.text.length
    }, null, 2), "utf8");
    result.push({ id, originalName: "prompt_manual.txt", size: req.body.text.length });
  }

  log("prompt_upload", `${result.length} items`);
  res.json({ ok: true, files: result });
});

app.get("/api/prompts", (req, res) => {
  res.json({ ok: true, prompts: readPromptFiles().map(({ text, ...rest }) => rest) });
});

app.post("/api/ai-developer/analyze", async (req, res) => {
  try {
    const prompts = readPromptFiles();
    const manual = req.body.text || "";
    const combined = [manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");
    const result = await aiProposal(combined);
    log("ai_analyze", `${result.mode} files=${result.files?.length || 0}`);
    res.json({ ok: true, result });
  } catch (err) {
    log("ai_analyze_error", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/update/run", async (req, res) => {
  const id = `update_${new Date().toISOString().replace(/[:.]/g, "-")}`;

  try {
    const prompts = readPromptFiles();
    const manual = req.body.text || "";
    const combined = [manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");
    const proposal = await aiProposal(combined);

    let githubApply = null;
    if (process.env.EPD_AUTO_APPLY_GITHUB === "true" && proposal.files?.length) {
      githubApply = await applyToGithub(proposal);
    }

    const zip = new JSZip();
    zip.file("AI_UPDATE_PROPOSAL.json", JSON.stringify(proposal, null, 2));
    zip.file("RAPORT_UPDATE.txt", [
      "ENERGY PROJECT DESIGN - AI RUN UPDATE",
      `ID: ${id}`,
      `Creat: ${now()}`,
      `Mod: ${proposal.mode}`,
      `Fișiere propuse: ${proposal.files?.length || 0}`,
      `GitHub apply: ${githubApply ? "DA" : "NU"}`,
      "",
      proposal.summary || "",
      "",
      "Task-uri:",
      ...(proposal.tasks || []).map((t, i) => `${i + 1}. ${t.title || ""} | ${t.reason || ""}`),
      "",
      "Fișiere:",
      ...(proposal.files || []).map(f => `- ${f.path}`)
    ].join("\n"));

    for (const f of proposal.files || []) {
      zip.file(`proposed_files/${f.path}`, f.content);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipName = `${id}.zip`;
    fs.writeFileSync(path.join(__dirname, "storage/downloads", zipName), buffer);

    log("run_update", `${id} files=${proposal.files?.length || 0}`);
    res.json({ ok: true, id, proposal, githubApply, downloadUrl: publicUrl(req, `/downloads/${zipName}`) });
  } catch (err) {
    log("run_update_error", err.message);
    res.status(500).json({ ok: false, id, error: err.message });
  }
});

app.post("/api/update/apply-github", async (req, res) => {
  try {
    const secret = req.body.updateSecret || req.headers["x-epd-update-secret"];
    if (process.env.EPD_UPDATE_SECRET && secret !== process.env.EPD_UPDATE_SECRET) {
      return res.status(403).json({ ok: false, error: "EPD_UPDATE_SECRET incorect." });
    }
    const result = await applyToGithub(req.body.proposal);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/downloads", (req, res) => {
  const dir = path.join(__dirname, "storage/downloads");
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).map(f => ({ name: f, url: publicUrl(req, `/downloads/${f}`) }))
    : [];
  res.json({ ok: true, files });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Energy Project Design rulează pe portul ${PORT}`);
});

'@ | Set-Content ".\server.js" -Encoding UTF8

$pkg = Get-Content ".\package.json" -Raw | ConvertFrom-Json
if (!$pkg.scripts) { $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue ([pscustomobject]@{}) -Force }
$pkg.scripts | Add-Member -NotePropertyName start -NotePropertyValue "node server.js" -Force

if (!$pkg.dependencies) { $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue ([pscustomobject]@{}) -Force }
if ($pkg.dependencies.PSObject.Properties.Name -contains "@openai/openai") {
  $pkg.dependencies.PSObject.Properties.Remove("@openai/openai")
}
$pkg.dependencies | Add-Member -NotePropertyName openai -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName cors -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName dotenv -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName express -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName multer -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName jszip -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName uuid -NotePropertyValue "latest" -Force
$pkg | ConvertTo-Json -Depth 30 | Set-Content ".\package.json" -Encoding UTF8

@"
AI SELF UPDATE V2 ACTIVAT

Render Environment Variables recomandate:
OPENAI_API_KEY
EPD_AI_MODEL=gpt-4.1-mini
EPD_PUBLIC_BASE_URL=https://energy-project-design.onrender.com
EPD_ADMIN_USER=developer
EPD_ADMIN_PASSWORD=Amodilema_99

Pentru auto-modificare reala:
GITHUB_TOKEN = token GitHub cu Contents Read/Write pe repo
GITHUB_OWNER = dragosserban95
GITHUB_REPO = Energy-Project-Design
GITHUB_BRANCH = main
EPD_AUTO_APPLY_GITHUB = true
EPD_UPDATE_SECRET = parola-interna-aleasa
RENDER_DEPLOY_HOOK = deploy hook URL din Render, optional dar recomandat
"@ | Set-Content ".\README_AI_SELF_UPDATE.txt" -Encoding UTF8

npm install

git add .
git commit -m "Enable AI Developer self update V2" 2>$null
git push origin main

Write-Host "GATA. Patch V2 trimis pe GitHub. In Render: Manual Deploy -> Deploy latest commit."
