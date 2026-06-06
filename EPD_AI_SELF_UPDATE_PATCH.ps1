# EPD AI SELF UPDATE PATCH - varianta scurta
# Ruleaza in folderul GitHub local:
#   cd "$env:USERPROFILE\Desktop\Energy-Project-Design-UPLOAD"
#   powershell -ExecutionPolicy Bypass -File .\EPD_AI_SELF_UPDATE_PATCH.ps1

$ErrorActionPreference = "Stop"

if (!(Test-Path ".\server.js") -or !(Test-Path ".\package.json")) {
  throw "Nu esti in folderul proiectului. Intra in Desktop\Energy-Project-Design-UPLOAD."
}

# 1. Backup
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item ".\server.js" ".\server_backup_before_ai_self_update_$stamp.js" -Force

# 2. Repara dependinte
$pkg = Get-Content ".\package.json" -Raw | ConvertFrom-Json
if (!$pkg.scripts) { $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue ([pscustomobject]@{}) -Force }
$pkg.scripts | Add-Member -NotePropertyName start -NotePropertyValue "node server.js" -Force
if (!$pkg.dependencies) { $pkg | Add-Member -NotePropertyName dependencies -NotePropertyValue ([pscustomobject]@{}) -Force }
if ($pkg.dependencies.PSObject.Properties.Name -contains "@openai/openai") { $pkg.dependencies.PSObject.Properties.Remove("@openai/openai") }
$pkg.dependencies | Add-Member -NotePropertyName openai -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName cors -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName dotenv -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName express -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName multer -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName jszip -NotePropertyValue "latest" -Force
$pkg.dependencies | Add-Member -NotePropertyName uuid -NotePropertyValue "latest" -Force
$pkg | ConvertTo-Json -Depth 30 | Set-Content ".\package.json" -Encoding UTF8

# 3. Inject helper functions before static middleware
$server = Get-Content ".\server.js" -Raw

if ($server -notmatch "function epdAllowedUpdatePath") {
$inject = @'

function epdAllowedUpdatePath(filePath) {
  const p = String(filePath || "").replaceAll("\\\\", "/").replace(/^\/+/, "");
  if (!p || p.includes("..")) return false;
  return p.startsWith("public/") || p.startsWith("data/") || p === "README_RENDER_DEPLOY.txt";
}

function epdExtractJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("AI nu a returnat JSON valid.");
  return JSON.parse(m[0]);
}

function epdProjectContext() {
  const files = ["data/prompt-master.json", "data/fields.json", "data/templates.json", "data/profiles.json", "public/index.html", "public/app.js", "public/style.css"];
  return files.map(rel => {
    try { return `===== ${rel} =====\n${fs.readFileSync(path.join(__dirname, rel), "utf8")}`; }
    catch { return `===== ${rel} =====\nLIPSESTE`; }
  }).join("\n\n");
}

async function epdOpenAiProposal(promptText) {
  if (!process.env.OPENAI_API_KEY) {
    return { mode: "local", summary: "OPENAI_API_KEY lipseste.", tasks: [], files: [], manualSteps: ["Seteaza OPENAI_API_KEY in Render Environment."] };
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.EPD_AI_MODEL || "gpt-4.1-mini";
  const system = `Esti AI Developer pentru Energy Project Design. Raspunzi DOAR JSON valid. Nu sterge functii. Nu genera cod periculos. Poti propune modificari doar pentru: public/app.js, public/index.html, public/style.css, data/*.json, README_RENDER_DEPLOY.txt. Schema: {"summary":"...","tasks":[{"title":"...","reason":"..."}],"risks":["..."],"files":[{"path":"public/app.js","content":"continut complet"}],"manualSteps":["..."]}`;
  const user = `CONTEXT CURENT:\n${epdProjectContext().slice(0, 70000)}\n\nPROMPTURI:\n${String(promptText || "").slice(0, 120000)}`;
  const completion = await client.chat.completions.create({
    model,
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
    response_format: { type: "json_object" }
  });
  const parsed = epdExtractJson(completion.choices[0]?.message?.content || "{}");
  parsed.mode = "openai";
  parsed.model = model;
  parsed.files = Array.isArray(parsed.files) ? parsed.files.filter(f => epdAllowedUpdatePath(f.path) && typeof f.content === "string") : [];
  return parsed;
}

async function epdGithubSha(owner, repo, branch, filePath, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}?ref=${encodeURIComponent(branch)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub SHA error ${r.status}: ${await r.text()}`);
  return (await r.json()).sha || null;
}

async function epdGithubPut(owner, repo, branch, filePath, content, token) {
  const sha = await epdGithubSha(owner, repo, branch, filePath, token);
  const body = { message: `AI Developer update: ${filePath}`, content: Buffer.from(content, "utf8").toString("base64"), branch };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}`;
  const r = await fetch(url, { method: "PUT", headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`GitHub update error ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function epdApplyToGithub(proposal) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN lipseste.");
  const owner = process.env.GITHUB_OWNER || "dragosserban95";
  const repo = process.env.GITHUB_REPO || "Energy-Project-Design";
  const branch = process.env.GITHUB_BRANCH || "main";
  const applied = [];
  for (const f of (proposal.files || [])) {
    if (!epdAllowedUpdatePath(f.path)) continue;
    const result = await epdGithubPut(owner, repo, branch, f.path, f.content, token);
    applied.push({ path: f.path, commit: result.commit?.sha || null });
  }
  if (process.env.RENDER_DEPLOY_HOOK) {
    await fetch(process.env.RENDER_DEPLOY_HOOK, { method: "POST" }).catch(() => null);
  }
  return { owner, repo, branch, applied };
}
'@
  $server = $server -replace 'app\.use\("/", express\.static\(path\.join\(__dirname, "public"\)\)\);', ($inject + "`napp.use(\"/\", express.static(path.join(__dirname, \"public\")));" )
}

# 4. Replace /api/update/run endpoint if present, otherwise append before app.listen
$newRoute = @'

app.post("/api/update/run", async (req, res) => {
  try {
    const prompts = readPromptFiles();
    const manual = req.body?.text || "";
    const combined = [manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");
    const proposal = await epdOpenAiProposal(combined);
    const id = `update_${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const zip = new JSZip();
    zip.file("AI_UPDATE_PROPOSAL.json", JSON.stringify(proposal, null, 2));
    zip.file("RAPORT_UPDATE.txt", [`EPD AI RUN UPDATE`, `ID: ${id}`, `Mode: ${proposal.mode}`, `Files: ${(proposal.files || []).length}`, ``, proposal.summary || ""].join("\n"));
    for (const f of (proposal.files || [])) zip.file(`proposed_files/${f.path}`, f.content);
    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipName = `${id}.zip`;
    fs.writeFileSync(path.join(__dirname, "storage/downloads", zipName), buffer);
    let githubApply = null;
    if (process.env.EPD_AUTO_APPLY_GITHUB === "true" && (proposal.files || []).length) {
      githubApply = await epdApplyToGithub(proposal);
    }
    res.json({ ok: true, id, proposal, githubApply, downloadUrl: publicUrl(req, `/downloads/${zipName}`) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/update/apply-github", async (req, res) => {
  try {
    const secret = req.body?.updateSecret || req.headers["x-epd-update-secret"];
    if (process.env.EPD_UPDATE_SECRET && secret !== process.env.EPD_UPDATE_SECRET) return res.status(403).json({ ok: false, error: "EPD_UPDATE_SECRET incorect." });
    const proposal = req.body?.proposal;
    if (!proposal) return res.status(400).json({ ok: false, error: "Lipseste proposal." });
    const githubApply = await epdApplyToGithub(proposal);
    res.json({ ok: true, githubApply });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
'@

if ($server -match 'app\.post\("/api/update/run"') {
  $server = [regex]::Replace($server, 'app\.post\("/api/update/run",[\s\S]*?\n\}\);', $newRoute, 1)
} else {
  $server = $server -replace 'app\.listen\(', ($newRoute + "`napp.listen(")
}

# 5. Health flags
$server = $server -replace 'openaiConfigured: Boolean\(process\.env\.OPENAI_API_KEY\)', 'openaiConfigured: Boolean(process.env.OPENAI_API_KEY), githubUpdateConfigured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO), renderDeployHookConfigured: Boolean(process.env.RENDER_DEPLOY_HOOK), autoApplyGithub: process.env.EPD_AUTO_APPLY_GITHUB === "true"'

Set-Content ".\server.js" $server -Encoding UTF8

@"
AI SELF UPDATE ACTIVAT

Render Environment necesar:
OPENAI_API_KEY = cheia OpenAI
EPD_AI_MODEL = gpt-4.1-mini
EPD_PUBLIC_BASE_URL = https://energy-project-design.onrender.com

Pentru auto-modificare in GitHub:
GITHUB_TOKEN = token GitHub fine-grained cu Contents Read/Write pe repo
GITHUB_OWNER = dragosserban95
GITHUB_REPO = Energy-Project-Design
GITHUB_BRANCH = main
EPD_AUTO_APPLY_GITHUB = true
EPD_UPDATE_SECRET = alege-o-parola-interna
RENDER_DEPLOY_HOOK = Deploy Hook URL din Render Settings
"@ | Set-Content ".\README_AI_SELF_UPDATE.txt" -Encoding UTF8

npm install
git add .
git commit -m "Enable AI Developer self update" 2>$null
git push origin main
Write-Host "GATA. Acum in Render: Manual Deploy -> Deploy latest commit."
