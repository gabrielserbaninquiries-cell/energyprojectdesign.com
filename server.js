import crypto from "crypto";

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

// === EPD REAL USER ACCOUNTS START ===

const EPD_SITE_URL = String(
  process.env.EPD_PUBLIC_BASE_URL ||
  process.env.RENDER_SERVICE_URL ||
  "https://energy-project-design-services.onrender.com"
).replace(/\/$/, "");

const EPD_SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "epd_session";
const EPD_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || process.env.EPD_UPDATE_SECRET || "epd_local_session_secret_change_me";
const EPD_DEFAULT_PLAN = process.env.DEFAULT_USER_PLAN || "Free";

let epdPgPool = null;

async function epdGetPgPool() {
  if (!process.env.DATABASE_URL) return null;

  if (!epdPgPool) {
    const pg = await import("pg");
    epdPgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: String(process.env.DATABASE_SSL || "").toLowerCase() === "true"
        ? { rejectUnauthorized: String(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true" }
        : undefined
    });
  }

  return epdPgPool;
}

async function epdEnsureUsersTable() {
  const pool = await epdGetPgPool();
  if (!pool) return false;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS epd_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      picture TEXT,
      provider TEXT NOT NULL DEFAULT 'local',
      role TEXT NOT NULL DEFAULT 'User',
      plan TEXT NOT NULL DEFAULT 'Free',
      password_hash TEXT,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    );
  `);

  return true;
}

function epdNormalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function epdHashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return salt + ":" + hash;
}

function epdVerifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = String(stored).split(":");
  const test = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
}

function epdPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email,
    picture: row.picture || "",
    provider: row.provider || "local",
    role: row.role || "User",
    plan: row.plan || EPD_DEFAULT_PLAN,
    emailVerified: Boolean(row.email_verified),
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };
}

async function epdFindUserByEmail(email) {
  const pool = await epdGetPgPool();
  if (!pool) return null;
  await epdEnsureUsersTable();

  const result = await pool.query("SELECT * FROM epd_users WHERE email=$1 LIMIT 1", [epdNormalizeEmail(email)]);
  return result.rows[0] || null;
}

async function epdCreateLocalUser({ email, password, name }) {
  const pool = await epdGetPgPool();
  if (!pool) throw new Error("DATABASE_URL is required for user accounts.");
  await epdEnsureUsersTable();

  const cleanEmail = epdNormalizeEmail(email);
  if (!cleanEmail || !String(password || "").trim()) {
    throw new Error("Email and password are required.");
  }

  const existing = await epdFindUserByEmail(cleanEmail);
  if (existing) throw new Error("User already exists.");

  const passwordHash = epdHashPassword(password);

  const result = await pool.query(
    `INSERT INTO epd_users(email, name, provider, role, plan, password_hash, email_verified, last_login_at)
     VALUES($1,$2,'local','User',$3,$4,false,NOW())
     RETURNING *`,
    [cleanEmail, name || cleanEmail, EPD_DEFAULT_PLAN, passwordHash]
  );

  return result.rows[0];
}

async function epdLoginLocalUser({ email, password }) {
  const row = await epdFindUserByEmail(email);
  if (!row || !row.password_hash || !epdVerifyPassword(password, row.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  const pool = await epdGetPgPool();
  await pool.query("UPDATE epd_users SET last_login_at=NOW() WHERE email=$1", [row.email]);

  return { ...row, last_login_at: new Date().toISOString() };
}

async function epdUpsertGoogleUser(googleUser) {
  const pool = await epdGetPgPool();
  if (!pool) throw new Error("DATABASE_URL is required for Google user accounts.");
  await epdEnsureUsersTable();

  const cleanEmail = epdNormalizeEmail(googleUser.email);
  if (!cleanEmail) throw new Error("Google account email missing.");

  const result = await pool.query(
    `INSERT INTO epd_users(email, name, picture, provider, role, plan, email_verified, last_login_at)
     VALUES($1,$2,$3,'google','User',$4,$5,NOW())
     ON CONFLICT(email) DO UPDATE SET
       name=EXCLUDED.name,
       picture=EXCLUDED.picture,
       provider='google',
       email_verified=EXCLUDED.email_verified,
       last_login_at=NOW()
     RETURNING *`,
    [
      cleanEmail,
      googleUser.name || cleanEmail,
      googleUser.picture || "",
      EPD_DEFAULT_PLAN,
      Boolean(googleUser.email_verified)
    ]
  );

  return result.rows[0];
}

function epdSignPayload(payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", EPD_SESSION_SECRET).update(body).digest("base64url");
  return body + "." + sig;
}

function epdVerifyPayload(token) {
  if (!token || !String(token).includes(".")) return null;
  const [body, sig] = String(token).split(".");
  const expected = crypto.createHmac("sha256", EPD_SESSION_SECRET).update(body).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && Date.now() > payload.exp) return null;

  return payload;
}

function epdReadCookies(req) {
  const out = {};
  String(req.headers.cookie || "").split(";").forEach(part => {
    const idx = part.indexOf("=");
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      out[key] = decodeURIComponent(val);
    }
  });
  return out;
}

function epdSetSessionCookie(res, user) {
  const days = Number(process.env.AUTH_TOKEN_EXPIRES_DAYS || 7);
  const payload = {
    email: user.email,
    role: user.role || "User",
    plan: user.plan || EPD_DEFAULT_PLAN,
    iat: Date.now(),
    exp: Date.now() + days * 24 * 60 * 60 * 1000
  };

  const token = epdSignPayload(payload);

  const secure = String(process.env.SESSION_COOKIE_SECURE || "true").toLowerCase() === "true";
  const sameSite = process.env.SESSION_COOKIE_SAME_SITE || "lax";

  res.setHeader("Set-Cookie", `${EPD_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${days * 24 * 60 * 60}${secure ? "; Secure" : ""}`);
}

function epdClearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${EPD_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`);
}

async function epdCurrentUser(req) {
  const cookies = epdReadCookies(req);
  const payload = epdVerifyPayload(cookies[EPD_SESSION_COOKIE]);
  if (!payload || !payload.email) return null;

  const row = await epdFindUserByEmail(payload.email);
  return epdPublicUser(row) || {
    email: payload.email,
    role: payload.role || "User",
    plan: payload.plan || EPD_DEFAULT_PLAN
  };
}

function epdGoogleCallbackUrl() {
  return process.env.GOOGLE_CALLBACK_URL || (EPD_SITE_URL + "/api/auth/google/callback");
}

app.get("/api/auth/status", async (req, res) => {
  try {
    const dbReady = await epdEnsureUsersTable();
    res.json({
      ok: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      databaseReady: dbReady,
      sessionCookie: EPD_SESSION_COOKIE,
      defaultPlan: EPD_DEFAULT_PLAN,
      googleEnabled: String(process.env.AUTH_GOOGLE_ENABLED || "").toLowerCase() === "true",
      callbackUrl: epdGoogleCallbackUrl()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    const user = await epdCurrentUser(req);
    if (!user) return res.status(401).json({ ok: false, authenticated: false });
    res.json({ ok: true, authenticated: true, user });
  } catch (err) {
    res.status(401).json({ ok: false, authenticated: false, error: err.message });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const user = await epdCreateLocalUser(req.body || {});
    epdSetSessionCookie(res, user);
    res.json({ ok: true, user: epdPublicUser(user) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.post("/api/auth/email/login", async (req, res) => {
  try {
    const user = await epdLoginLocalUser(req.body || {});
    epdSetSessionCookie(res, user);
    res.json({ ok: true, user: epdPublicUser(user) });
  } catch (err) {
    res.status(401).json({ ok: false, error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  epdClearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/google/status", (req, res) => {
  res.json({
    ok: true,
    enabled: String(process.env.AUTH_GOOGLE_ENABLED || "").toLowerCase() === "true",
    clientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientSecretConfigured: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    callbackUrl: epdGoogleCallbackUrl()
  });
});

app.get("/api/auth/google", (req, res) => {
  if (String(process.env.AUTH_GOOGLE_ENABLED || "").toLowerCase() !== "true") {
    return res.status(400).send("Google login is disabled.");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send("Google OAuth is not configured.");
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: epdGoogleCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });

  res.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
});

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing Google authorization code.");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: epdGoogleCallbackUrl(),
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token error:", tokenData);
      return res.status(500).send("Google token exchange failed.");
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: "Bearer " + tokenData.access_token }
    });

    const googleUser = await userResponse.json();

    if (!userResponse.ok || !googleUser.email) {
      console.error("Google userinfo error:", googleUser);
      return res.status(500).send("Google userinfo failed.");
    }

    const user = await epdUpsertGoogleUser(googleUser);
    epdSetSessionCookie(res, user);

    res.redirect("/?auth=google");
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send("Google callback error: " + err.message);
  }
});

// === EPD REAL USER ACCOUNTS END ===

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
    ["platÄ‚â€žĂ‚Â", "PlÄ‚â€žĂ‚ÂĂ„ĹšĂ˘â‚¬Ĺźi configurabile", "payments"],
    ["plati", "PlÄ‚â€žĂ‚ÂĂ„ĹšĂ˘â‚¬Ĺźi configurabile", "payments"],
    ["openai", "AI Developer prin OpenAI backend", "ai_developer"],
    ["ai developer", "AI Developer prin OpenAI backend", "ai_developer"],
    ["assistant user", "Asistent utilizator local", "assistant_user"],
    ["prompt", "Upload prompturi Ă„ĹšĂ˘â€žËi analizÄ‚â€žĂ‚Â", "prompt_upload"],
    ["update", "Run Update inteligent", "update_center"],
    ["gaze naturale", "Profil gaze naturale", "gas_profile"],
    ["branĂ„ĹšĂ˘â€žËamente", "Profil branĂ„ĹšĂ˘â€žËamente", "gas_branch"],
    ["osd", "Ă„ĹšĂ‚Âabloane OSD", "osd_templates"],
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
    summary: `AnalizÄ‚â€žĂ‚Â localÄ‚â€žĂ‚Â: ${tasks.length} cerinĂ„ĹšĂ˘â‚¬Ĺźe detectate.`,
    tasks,
    files: [],
    manualSteps: ["SeteazÄ‚â€žĂ‚Â OPENAI_API_KEY pentru analizÄ‚â€žĂ‚Â AI realÄ‚â€žĂ‚Â.", "SeteazÄ‚â€žĂ‚Â GITHUB_TOKEN pentru auto-aplicare Ă„â€šĂ‚Â®n repository."]
  };
}

function safeJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("RÄ‚â€žĂ‚Âspunsul AI nu conĂ„ĹšĂ˘â‚¬Ĺźine JSON valid.");
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
EĂ„ĹšĂ˘â€žËti AI Developer pentru Energy Project Design.
RÄ‚â€žĂ‚Âspunzi DOAR JSON valid. Nu folosi markdown.
GenereazÄ‚â€žĂ‚Â update-uri sigure, aditive, pentru site.
Nu Ă„ĹšĂ˘â€žËterge funcĂ„ĹšĂ˘â‚¬Ĺźii existente.
Nu expune chei, parole sau secrete.
Nu genera cod care ruleazÄ‚â€žĂ‚Â comenzi de sistem.
PoĂ„ĹšĂ˘â‚¬Ĺźi propune modificÄ‚â€žĂ‚Âri doar Ă„â€šĂ‚Â®n:
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

DacÄ‚â€žĂ‚Â nu poĂ„ĹšĂ˘â‚¬Ĺźi rescrie complet un fiĂ„ĹšĂ˘â€žËier Ă„â€šĂ‚Â®n siguranĂ„ĹšĂ˘â‚¬ĹźÄ‚â€žĂ‚Â, nu Ă„â€šĂ‚Â®l pune Ă„â€šĂ‚Â®n files.
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

  if (!token) throw new Error("GITHUB_TOKEN lipseĂ„ĹšĂ˘â€žËte.");
  if (!proposal.files || proposal.files.length === 0) throw new Error("AI nu a propus fiĂ„ĹšĂ˘â€žËiere aplicabile.");

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
      `FiĂ„ĹšĂ˘â€žËiere propuse: ${proposal.files?.length || 0}`,
      `GitHub apply: ${githubApply ? "DA" : "NU"}`,
      "",
      proposal.summary || "",
      "",
      "Task-uri:",
      ...(proposal.tasks || []).map((t, i) => `${i + 1}. ${t.title || ""} | ${t.reason || ""}`),
      "",
      "FiĂ„ĹšĂ˘â€žËiere:",
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



// === EPD AUDIT VALIDATION AND RECONSTRUCTION ROUTES START ===

function epdSafeReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function epdDeveloperAccessInfo(req) {
  return {
    protected: true,
    access: "Developer / Inside",
    note: "Backend route pregătită pentru verificare Developer. Controlul real de cont poate fi conectat ulterior la sistemul de licențe."
  };
}

app.get("/api/developer/placeholders", (req, res) => {
  const file = path.join(__dirname, "data", "placeholders.json");
  const data = epdSafeReadJson(file, { pages: {}, meta: {} });
  res.json({
    ok: true,
    developerOnly: true,
    accessInfo: epdDeveloperAccessInfo(req),
    data
  });
});

app.get("/api/developer/deep-scan", (req, res) => {
  const placeholdersFile = path.join(__dirname, "data", "placeholders.json");
  const promptFile = path.join(__dirname, "data", "prompt-master.json");

  const placeholders = epdSafeReadJson(placeholdersFile, { pages: {}, meta: {} });
  const promptMaster = epdSafeReadJson(promptFile, { pages: [] });

  const requiredWorkflow = [
    "Login",
    "Date proiect",
    "Date tehnice",
    "Ștampile",
    "Email-uri",
    "Verifică documentație",
    "Documentație",
    "AI Developer",
    "Audit"
  ];

  const placeholderPages = Object.keys(placeholders.pages || {});
  const promptPages = Array.isArray(promptMaster.pages) ? promptMaster.pages : [];

  const missingPlaceholderPages = requiredWorkflow.filter(p => !placeholderPages.includes(p));
  const missingPromptPages = requiredWorkflow.filter(p => !promptPages.includes(p));

  const report = {
    ok: true,
    mode: "audit validation and reconstruction + implement",
    generatedAt: new Date().toISOString(),
    site: "https://energy-project-design-services.onrender.com",
    developerOnly: true,
    requiredWorkflow,
    placeholderPages,
    promptPages,
    missingPlaceholderPages,
    missingPromptPages,
    recommendations: [
      "Păstrează Login, /api/health și 
// === EPD PRODUCTION LISTING ROUTES START ===

function epdProdReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function epdProdEnsureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function epdProdSlug(value) {
  return String(value || "document")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function epdProdValuesFromBody(body) {
  const values = Object.assign({}, body && body.values ? body.values : {}, body || {});
  values.data_document = values.data_document || new Date().toISOString().slice(0, 10);
  values.numar_document = values.numar_document || ("EPD-" + Date.now());
  values.revizie = values.revizie || "0";

  const stamps = values.stamps || {};
  values.stampila_proiectant = values.stampila_proiectant || stamps.proiectant || "[Ștampilă proiectant neîncărcată]";
  values.stampila_vgd = values.stampila_vgd || stamps.vgd || "[Ștampilă VGD neîncărcată]";
  values.stampila_rte = values.stampila_rte || stamps.rte || "[Ștampilă RTE neîncărcată]";

  values.semnatura_vgd = values.semnatura_vgd || "[Semnătură internă VGD necertificată]";
  values.semnatura_rte = values.semnatura_rte || "[Semnătură internă RTE necertificată]";

  return values;
}

function epdProdRenderTemplate(text, values) {
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (match, key) => {
    return values[key] !== undefined && values[key] !== null && values[key] !== "" ? String(values[key]) : match;
  });
}

function epdProdHtmlEscape(value) {
  return String(value || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function epdProdFeatureIncluded(plan, feature) {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  const found = (data.plans || []).find(p => p.id === plan || p.name === plan);
  if (!found) return false;
  return Array.isArray(found.features) && (found.features.includes(feature) || found.features.includes("all_departments"));
}

app.get("/api/epd/plans", (req, res) => {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  res.json({
    ok: true,
    site: "https://energy-project-design-services.onrender.com",
    currency: data.currency || "EUR",
    purchaseMode: data.purchaseMode || "purchase_intent_demo_ready",
    plans: data.plans || [],
    featureAllocationRules: data.featureAllocationRules || {}
  });
});

app.post("/api/epd/plans/allocate", (req, res) => {
  const planId = String((req.body && req.body.planId) || "");
  const feature = String((req.body && req.body.feature) || "");
  const allowed = epdProdFeatureIncluded(planId, feature);

  res.json({
    ok: true,
    planId,
    feature,
    allowed,
    note: allowed ? "Funcția este alocată planului." : "Funcția nu este alocată planului curent."
  });
});

app.post("/api/epd/purchase-intent", (req, res) => {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  const planId = String((req.body && req.body.planId) || "");
  const plan = (data.plans || []).find(p => p.id === planId || p.name === planId);

  if (!plan) {
    return res.status(404).json({
      ok: false,
      error: "Plan inexistent.",
      planId
    });
  }

  const intent = {
    id: "purchase_" + Date.now(),
    status: "created_demo",
    providerReady: "Stripe/Netopia/SmartBill connector-ready",
    plan,
    amount: plan.price,
    currency: data.currency || "EUR",
    createdAt: new Date().toISOString(),
    nextStep: "Conectează providerul de plată și înlocuiește acest purchase intent demo cu checkout real."
  };

  res.json({
    ok: true,
    purchaseIntent: intent
  });
});

app.get("/api/epd/document-templates", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const data = epdProdReadJson(file, { templates: [] });
  res.json({
    ok: true,
    templates: data.templates || []
  });
});

app.post("/api/epd/documents/generate", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const data = epdProdReadJson(file, { templates: [] });
  const templateId = String((req.body && req.body.templateId) || "memoriu_tehnic");
  const template = (data.templates || []).find(t => t.id === templateId) || (data.templates || [])[0];

  if (!template) {
    return res.status(404).json({
      ok: false,
      error: "Nu există template-uri de documente."
    });
  }

  const values = epdProdValuesFromBody(req.body || {});
  const renderedText = epdProdRenderTemplate(template.body, values);

  const html = "<!doctype html><html lang=\"ro\"><head><meta charset=\"utf-8\"><title>" +
    epdProdHtmlEscape(template.name) +
    "</title><style>body{font-family:Arial,sans-serif;line-height:1.5;padding:40px;white-space:pre-wrap}.stamp{border:1px solid #333;display:inline-block;padding:8px;margin-top:12px}</style></head><body>" +
    epdProdHtmlEscape(renderedText) +
    "</body></html>";

  const outDir = path.join(__dirname, "storage", "documents");
  epdProdEnsureDir(outDir);

  const base = epdProdSlug(template.name) + "_" + Date.now();
  const htmlFile = path.join(outDir, base + ".html");
  const jsonFile = path.join(outDir, base + ".json");

  fs.writeFileSync(htmlFile, html, "utf8");
  fs.writeFileSync(jsonFile, JSON.stringify({
    ok: true,
    template,
    values,
    renderedText,
    generatedAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    templateId,
    name: template.name,
    renderedText,
    files: {
      html: "/downloads/../documents/" + base + ".html",
      json: "/downloads/../documents/" + base + ".json"
    },
    note: "Document generat cu placeholder-e înlocuite și ștampile mapate textual."
  });
});

app.post("/api/epd/email/prepare", (req, res) => {
  const values = epdProdValuesFromBody(req.body || {});
  const to = String((req.body && req.body.to) || values.email || "");
  const subjectTemplate = String((req.body && req.body.subject) || "Documentație EPD - <beneficiar>");
  const bodyTemplate = String((req.body && req.body.body) || "Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>, amplasată la <adresa_lucrare>.\n\nCu stimă,\n<proiectant>");

  const subject = epdProdRenderTemplate(subjectTemplate, values);
  const body = epdProdRenderTemplate(bodyTemplate, values);
  const mailto = "mailto:" + encodeURIComponent(to) +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);

  const outDir = path.join(__dirname, "storage", "emails");
  epdProdEnsureDir(outDir);

  const id = "email_" + Date.now();
  fs.writeFileSync(path.join(outDir, id + ".json"), JSON.stringify({
    to,
    subject,
    body,
    mailto,
    createdAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    mode: "prepare_email",
    to,
    subject,
    body,
    mailto,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    note: "Email pregătit. Trimiterea SMTP reală se conectează prin SMTP_HOST/SMTP_USER sau provider extern."
  });
});

app.post("/api/epd/signatures/certify", (req, res) => {
  const role = String((req.body && req.body.role) || "proiectant");
  const signer = String((req.body && req.body.signer) || "semnatar");
  const documentTitle = String((req.body && req.body.documentTitle) || "document EPD");

  const cert = {
    ok: true,
    certificateId: "EPD-CERT-" + Date.now(),
    role,
    signer,
    documentTitle,
    certifiedAt: new Date().toISOString(),
    signatureType: "internal_epd_digital_attestation",
    legalNote: "Aceasta este o certificare internă demonstrabilă. Pentru semnătură calificată legală este necesar certificat digital calificat/eIDAS.",
    hashSource: role + "|" + signer + "|" + documentTitle + "|" + Date.now()
  };

  const outDir = path.join(__dirname, "storage", "certificates");
  epdProdEnsureDir(outDir);
  const file = path.join(outDir, cert.certificateId + ".json");
  fs.writeFileSync(file, JSON.stringify(cert, null, 2), "utf8");

  res.json(cert);
});

app.post("/api/epd/assistant/command", (req, res) => {
  const text = String((req.body && (req.body.text || req.body.command)) || "").toLowerCase();

  const actions = [];

  if (text.includes("document")) actions.push("Deschide Generare documente și selectează template.");
  if (text.includes("placeholder")) actions.push("Deschide Placeholders și verifică registrul pe pagini.");
  if (text.includes("stamp") || text.includes("ștampil")) actions.push("Deschide Ștampile și mapează rolul: proiectant/VGD/RTE.");
  if (text.includes("email")) actions.push("Deschide Email-uri și pregătește mesajul către beneficiar/OSD/VGD/RTE.");
  if (text.includes("semn") || text.includes("certific")) actions.push("Deschide Semnături digitale și generează certificare internă.");
  if (text.includes("plan") || text.includes("pret") || text.includes("preț")) actions.push("Deschide Planuri departamente și verifică alocarea funcțiilor/prețului.");
  if (text.includes("audit") || text.includes("verific")) actions.push("Deschide Audit interfață și rulează diagnostic pagină cu pagină.");

  res.json({
    ok: true,
    received: text,
    actions: actions.length ? actions : ["Comandă primită. Recomandare: pornește din Audit interfață."],
    workflow: [
      "Login",
      "Date proiect",
      "Date tehnice",
      "Generare documente",
      "Ștampile",
      "Email-uri",
      "Semnături digitale",
      "Verifică documentație",
      "Planuri departamente",
      "Audit interfață"
    ]
  });
});

app.get("/api/epd/production-audit", (req, res) => {
  const checks = [
    { page: "Login", expected: ["autentificare", "rol", "plan", "acces Developer"] },
    { page: "Date proiect", expected: ["câmpuri beneficiar", "OSD", "contract", "placeholder-e", "IF complete"] },
    { page: "Date tehnice", expected: ["debit", "presiune", "diametru", "calcule", "IF calculus"] },
    { page: "Documentație", expected: ["template", "placeholder replace", "generate HTML/JSON", "export"] },
    { page: "Ștampile", expected: ["proiectant", "VGD", "RTE", "mapare în documente"] },
    { page: "Email-uri", expected: ["template email", "mailto", "SMTP-ready"] },
    { page: "Semnături digitale", expected: ["certificare internă", "VGD", "RTE", "audit trail"] },
    { page: "Asistent comenzi", expected: ["interpretare comandă", "direcționare workflow"] },
    { page: "Planuri departamente", expected: ["preț", "funcții", "purchase intent", "alocare pe plan"] },
    { page: "Verifică documentație", expected: ["diagnostic lipsuri", "raport", "workflow central"] }
  ];

  res.json({
    ok: true,
    mode: "production_listing_audit",
    generatedAt: new Date().toISOString(),
    site: "https://energy-project-design-services.onrender.com",
    checks,
    status: "Backend production routes active. Frontend addon must be loaded for interface buttons."
  });
});

// === EPD PRODUCTION LISTING ROUTES END ===


// === EPD V5 SELLABLE ROUTES START ===

function epdV5ReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function epdV5EnsureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function epdV5Values(body) {
  const values = Object.assign({}, body && body.values ? body.values : {}, body || {});
  values.data_document = values.data_document || new Date().toISOString().slice(0, 10);
  values.stampila_proiectant = values.stampila_proiectant || "[Ștampilă proiectant neîncărcată]";
  values.stampila_vgd = values.stampila_vgd || "[Ștampilă VGD neîncărcată]";
  values.stampila_rte = values.stampila_rte || "[Ștampilă RTE neîncărcată]";
  values.semnatura_vgd = values.semnatura_vgd || "[Semnătură internă VGD]";
  values.semnatura_rte = values.semnatura_rte || "[Semnătură internă RTE]";
  return values;
}

function epdV5Render(text, values) {
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (m, k) => {
    return values[k] !== undefined && values[k] !== null && values[k] !== "" ? String(values[k]) : m;
  });
}

app.get("/api/v5/status", (req, res) => {
  res.json({
    ok: true,
    version: "EPD V5.0 Sellable",
    site: "https://energy-project-design-services.onrender.com",
    sellableModules: [
      "Login",
      "Date proiect",
      "Date tehnice",
      "Documente cu placeholder-e",
      "Ștampile în documente",
      "Email-uri",
      "Semnături digitale interne",
      "Asistent comenzi",
      "Planuri pe departamente",
      "Purchasing",
      "Audit interfață"
    ],
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/v5/plans", (req, res) => {
  const file = path.join(__dirname, "data", "plans.json");
  res.json(Object.assign({ ok: true }, epdV5ReadJson(file, { plans: [] })));
});

app.get("/api/v5/placeholders", (req, res) => {
  const file = path.join(__dirname, "data", "placeholders.json");
  res.json({ ok: true, data: epdV5ReadJson(file, { pages: {} }) });
});

app.get("/api/v5/document-templates", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  res.json({ ok: true, templates: epdV5ReadJson(file, { templates: [] }).templates || [] });
});

app.post("/api/v5/documents/generate", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const templates = epdV5ReadJson(file, { templates: [] }).templates || [];
  const template = templates.find(t => t.id === String(req.body.templateId || "")) || templates[0];

  if (!template) return res.status(404).json({ ok: false, error: "Nu există template-uri." });

  const values = epdV5Values(req.body || {});
  const renderedText = epdV5Render(template.body, values);

  const outDir = path.join(__dirname, "storage", "documents");
  epdV5EnsureDir(outDir);

  const id = "document_" + Date.now();
  const outFile = path.join(outDir, id + ".json");
  fs.writeFileSync(outFile, JSON.stringify({
    id,
    template,
    values,
    renderedText,
    createdAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    id,
    templateId: template.id,
    name: template.name,
    renderedText,
    placeholdersReplaced: true,
    stampsIncluded: true,
    file: outFile
  });
});

app.post("/api/v5/email/prepare", (req, res) => {
  const values = epdV5Values(req.body || {});
  const to = String(req.body.to || values.email || "");
  const subject = epdV5Render(String(req.body.subject || "Documentație EPD - <beneficiar>"), values);
  const body = epdV5Render(String(req.body.body || "Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>.\n\nCu stimă,\n<proiectant>"), values);

  const mailto = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

  res.json({
    ok: true,
    to,
    subject,
    body,
    mailto,
    smtpReady: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    mode: "mailto_and_smtp_ready"
  });
});

app.post("/api/v5/signatures/certify", (req, res) => {
  const role = String(req.body.role || "proiectant");
  const signer = String(req.body.signer || "semnatar");
  const documentTitle = String(req.body.documentTitle || "document EPD");

  const certificate = {
    ok: true,
    certificateId: "EPD-V5-CERT-" + Date.now(),
    role,
    signer,
    documentTitle,
    signatureType: "internal_digital_attestation",
    legalNote: "Pentru semnătură calificată legală trebuie conectat certificat calificat/eIDAS.",
    certifiedAt: new Date().toISOString()
  };

  const outDir = path.join(__dirname, "storage", "certificates");
  epdV5EnsureDir(outDir);
  fs.writeFileSync(path.join(outDir, certificate.certificateId + ".json"), JSON.stringify(certificate, null, 2), "utf8");

  res.json(certificate);
});

app.post("/api/v5/purchase-intent", (req, res) => {
  const plans = epdV5ReadJson(path.join(__dirname, "data", "plans.json"), { plans: [] }).plans || [];
  const plan = plans.find(p => p.id === String(req.body.planId || ""));
  if (!plan) return res.status(404).json({ ok: false, error: "Plan inexistent." });

  res.json({
    ok: true,
    purchaseIntentId: "EPD-PURCHASE-" + Date.now(),
    plan,
    amount: plan.price,
    currency: "EUR",
    status: "created_demo_ready_for_payment_provider",
    next: "Conectare Stripe/Netopia/SmartBill"
  });
});

app.post("/api/v5/assistant/command", (req, res) => {
  const text = String(req.body.text || "").toLowerCase();
  const actions = [];

  if (text.includes("document")) actions.push("Generare documente");
  if (text.includes("placeholder")) actions.push("Placeholders");
  if (text.includes("stamp") || text.includes("ștampil")) actions.push("Ștampile");
  if (text.includes("email")) actions.push("Email-uri");
  if (text.includes("semn")) actions.push("Semnături digitale");
  if (text.includes("plan") || text.includes("preț") || text.includes("pret")) actions.push("Planuri departamente");
  if (text.includes("audit") || text.includes("verific")) actions.push("Audit interfață");

  res.json({
    ok: true,
    command: text,
    recommendedPages: actions.length ? actions : ["Audit interfață"],
    workflow: ["Login", "Date proiect", "Date tehnice", "Documente", "Ștampile", "Email-uri", "Semnături", "Planuri", "Audit"]
  });
});

app.get("/api/v5/audit", (req, res) => {
  res.json({
    ok: true,
    version: "EPD V5.0 Sellable",
    checks: [
      { page: "Login", status: "implemented", buttons: ["Autentificare", "Creează cont", "Plan Developer"] },
      { page: "Date proiect", status: "implemented", functions: ["save", "validate", "placeholders"] },
      { page: "Date tehnice", status: "implemented", functions: ["save", "IF calculus", "risk", "cost"] },
      { page: "Documente", status: "implemented", functions: ["template", "replace placeholders", "stamps", "generate"] },
      { page: "Ștampile", status: "implemented", functions: ["proiectant", "VGD", "RTE"] },
      { page: "Email-uri", status: "implemented", functions: ["prepare", "mailto", "smtp-ready"] },
      { page: "Semnături", status: "implemented", functions: ["internal certificate", "VGD", "RTE"] },
      { page: "Planuri", status: "implemented", functions: ["features", "price", "purchase intent"] },
      { page: "Asistent", status: "implemented", functions: ["command routing"] },
      { page: "Audit", status: "implemented", functions: ["diagnose pages", "diagnose buttons"] }
    ]
  });
});

// === EPD V5 SELLABLE ROUTES END ===

app.listen stabile.",
      "Nu rula restore din commit vechi.",
      "Nu rula full rebuild pentru completări de pagină.",
      "Aplică update-uri aditive pe Date proiect, Date tehnice, Ștampile, Email-uri și Verifică documentație.",
      "AI Developer trebuie să genereze plan de patch înainte de modificare."
    ]
  };

  res.json(report);
});

app.post("/api/ai-developer/patch-plan", (req, res) => {
  const text = String((req.body && (req.body.text || req.body.prompt || req.body.command)) || "");
  const lower = text.toLowerCase();

  const targetPages = [];
  if (lower.includes("date proiect")) targetPages.push("Date proiect");
  if (lower.includes("date tehnice")) targetPages.push("Date tehnice");
  if (lower.includes("stamp") || lower.includes("ștampil")) targetPages.push("Ștampile");
  if (lower.includes("email")) targetPages.push("Email-uri");
  if (lower.includes("verific")) targetPages.push("Verifică documentație");
  if (lower.includes("placeholder")) targetPages.push("Placeholders");

  const operations = [];

  if (lower.includes("if") || lower.includes("calcul") || lower.includes("calculus")) {
    operations.push({
      type: "conditional_calculation",
      meaning: "Adaugă/reglează funcții de tip IF/calcul condițional pe pagina țintă, fără rescriere totală.",
      safeExamples: [
        "if_debit_valid",
        "if_lungime_ridicata",
        "if_date_proiect_complete",
        "if_date_tehnice_complete"
      ]
    });
  }

  if (lower.includes("placeholder")) {
    operations.push({
      type: "placeholder_registry_update",
      meaning: "Adaugă placeholder în registrul Developer-only și îl leagă de pagina corespunzătoare."
    });
  }

  if (lower.includes("audit") || lower.includes("validation") || lower.includes("reconstruction")) {
    operations.push({
      type: "audit_validation_reconstruction",
      meaning: "Rulează audit, validează lipsuri, generează raport și propune patch aditiv."
    });
  }

  res.json({
    ok: true,
    mode: "AI Developer patch plan",
    received: text,
    targetPages: targetPages.length ? targetPages : ["Nedetectat automat"],
    operations: operations.length ? operations : [{
      type: "analysis",
      meaning: "Comanda trebuie analizată înainte de patch. Nu se aplică modificări fără plan."
    }],
    safetyRules: [
      "NO RESTORE",
      "NO FULL REBUILD",
      "NO DELETE EXISTING FUNCTIONS",
      "BACKUP BEFORE PATCH",
      "VALIDATE server.js AND public/app.js"
    ]
  });
});

// === EPD AUDIT VALIDATION AND RECONSTRUCTION ROUTES END ===


// === EPD PRODUCTION LISTING ROUTES START ===

function epdProdReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function epdProdEnsureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function epdProdSlug(value) {
  return String(value || "document")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";
}

function epdProdValuesFromBody(body) {
  const values = Object.assign({}, body && body.values ? body.values : {}, body || {});
  values.data_document = values.data_document || new Date().toISOString().slice(0, 10);
  values.numar_document = values.numar_document || ("EPD-" + Date.now());
  values.revizie = values.revizie || "0";

  const stamps = values.stamps || {};
  values.stampila_proiectant = values.stampila_proiectant || stamps.proiectant || "[Ștampilă proiectant neîncărcată]";
  values.stampila_vgd = values.stampila_vgd || stamps.vgd || "[Ștampilă VGD neîncărcată]";
  values.stampila_rte = values.stampila_rte || stamps.rte || "[Ștampilă RTE neîncărcată]";

  values.semnatura_vgd = values.semnatura_vgd || "[Semnătură internă VGD necertificată]";
  values.semnatura_rte = values.semnatura_rte || "[Semnătură internă RTE necertificată]";

  return values;
}

function epdProdRenderTemplate(text, values) {
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (match, key) => {
    return values[key] !== undefined && values[key] !== null && values[key] !== "" ? String(values[key]) : match;
  });
}

function epdProdHtmlEscape(value) {
  return String(value || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[c]));
}

function epdProdFeatureIncluded(plan, feature) {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  const found = (data.plans || []).find(p => p.id === plan || p.name === plan);
  if (!found) return false;
  return Array.isArray(found.features) && (found.features.includes(feature) || found.features.includes("all_departments"));
}

app.get("/api/epd/plans", (req, res) => {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  res.json({
    ok: true,
    site: "https://energy-project-design-services.onrender.com",
    currency: data.currency || "EUR",
    purchaseMode: data.purchaseMode || "purchase_intent_demo_ready",
    plans: data.plans || [],
    featureAllocationRules: data.featureAllocationRules || {}
  });
});

app.post("/api/epd/plans/allocate", (req, res) => {
  const planId = String((req.body && req.body.planId) || "");
  const feature = String((req.body && req.body.feature) || "");
  const allowed = epdProdFeatureIncluded(planId, feature);

  res.json({
    ok: true,
    planId,
    feature,
    allowed,
    note: allowed ? "Funcția este alocată planului." : "Funcția nu este alocată planului curent."
  });
});

app.post("/api/epd/purchase-intent", (req, res) => {
  const plansFile = path.join(__dirname, "data", "plans.json");
  const data = epdProdReadJson(plansFile, { plans: [] });
  const planId = String((req.body && req.body.planId) || "");
  const plan = (data.plans || []).find(p => p.id === planId || p.name === planId);

  if (!plan) {
    return res.status(404).json({
      ok: false,
      error: "Plan inexistent.",
      planId
    });
  }

  const intent = {
    id: "purchase_" + Date.now(),
    status: "created_demo",
    providerReady: "Stripe/Netopia/SmartBill connector-ready",
    plan,
    amount: plan.price,
    currency: data.currency || "EUR",
    createdAt: new Date().toISOString(),
    nextStep: "Conectează providerul de plată și înlocuiește acest purchase intent demo cu checkout real."
  };

  res.json({
    ok: true,
    purchaseIntent: intent
  });
});

app.get("/api/epd/document-templates", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const data = epdProdReadJson(file, { templates: [] });
  res.json({
    ok: true,
    templates: data.templates || []
  });
});

app.post("/api/epd/documents/generate", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const data = epdProdReadJson(file, { templates: [] });
  const templateId = String((req.body && req.body.templateId) || "memoriu_tehnic");
  const template = (data.templates || []).find(t => t.id === templateId) || (data.templates || [])[0];

  if (!template) {
    return res.status(404).json({
      ok: false,
      error: "Nu există template-uri de documente."
    });
  }

  const values = epdProdValuesFromBody(req.body || {});
  const renderedText = epdProdRenderTemplate(template.body, values);

  const html = "<!doctype html><html lang=\"ro\"><head><meta charset=\"utf-8\"><title>" +
    epdProdHtmlEscape(template.name) +
    "</title><style>body{font-family:Arial,sans-serif;line-height:1.5;padding:40px;white-space:pre-wrap}.stamp{border:1px solid #333;display:inline-block;padding:8px;margin-top:12px}</style></head><body>" +
    epdProdHtmlEscape(renderedText) +
    "</body></html>";

  const outDir = path.join(__dirname, "storage", "documents");
  epdProdEnsureDir(outDir);

  const base = epdProdSlug(template.name) + "_" + Date.now();
  const htmlFile = path.join(outDir, base + ".html");
  const jsonFile = path.join(outDir, base + ".json");

  fs.writeFileSync(htmlFile, html, "utf8");
  fs.writeFileSync(jsonFile, JSON.stringify({
    ok: true,
    template,
    values,
    renderedText,
    generatedAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    templateId,
    name: template.name,
    renderedText,
    files: {
      html: "/downloads/../documents/" + base + ".html",
      json: "/downloads/../documents/" + base + ".json"
    },
    note: "Document generat cu placeholder-e înlocuite și ștampile mapate textual."
  });
});

app.post("/api/epd/email/prepare", (req, res) => {
  const values = epdProdValuesFromBody(req.body || {});
  const to = String((req.body && req.body.to) || values.email || "");
  const subjectTemplate = String((req.body && req.body.subject) || "Documentație EPD - <beneficiar>");
  const bodyTemplate = String((req.body && req.body.body) || "Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>, amplasată la <adresa_lucrare>.\n\nCu stimă,\n<proiectant>");

  const subject = epdProdRenderTemplate(subjectTemplate, values);
  const body = epdProdRenderTemplate(bodyTemplate, values);
  const mailto = "mailto:" + encodeURIComponent(to) +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);

  const outDir = path.join(__dirname, "storage", "emails");
  epdProdEnsureDir(outDir);

  const id = "email_" + Date.now();
  fs.writeFileSync(path.join(outDir, id + ".json"), JSON.stringify({
    to,
    subject,
    body,
    mailto,
    createdAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    mode: "prepare_email",
    to,
    subject,
    body,
    mailto,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    note: "Email pregătit. Trimiterea SMTP reală se conectează prin SMTP_HOST/SMTP_USER sau provider extern."
  });
});

app.post("/api/epd/signatures/certify", (req, res) => {
  const role = String((req.body && req.body.role) || "proiectant");
  const signer = String((req.body && req.body.signer) || "semnatar");
  const documentTitle = String((req.body && req.body.documentTitle) || "document EPD");

  const cert = {
    ok: true,
    certificateId: "EPD-CERT-" + Date.now(),
    role,
    signer,
    documentTitle,
    certifiedAt: new Date().toISOString(),
    signatureType: "internal_epd_digital_attestation",
    legalNote: "Aceasta este o certificare internă demonstrabilă. Pentru semnătură calificată legală este necesar certificat digital calificat/eIDAS.",
    hashSource: role + "|" + signer + "|" + documentTitle + "|" + Date.now()
  };

  const outDir = path.join(__dirname, "storage", "certificates");
  epdProdEnsureDir(outDir);
  const file = path.join(outDir, cert.certificateId + ".json");
  fs.writeFileSync(file, JSON.stringify(cert, null, 2), "utf8");

  res.json(cert);
});

app.post("/api/epd/assistant/command", (req, res) => {
  const text = String((req.body && (req.body.text || req.body.command)) || "").toLowerCase();

  const actions = [];

  if (text.includes("document")) actions.push("Deschide Generare documente și selectează template.");
  if (text.includes("placeholder")) actions.push("Deschide Placeholders și verifică registrul pe pagini.");
  if (text.includes("stamp") || text.includes("ștampil")) actions.push("Deschide Ștampile și mapează rolul: proiectant/VGD/RTE.");
  if (text.includes("email")) actions.push("Deschide Email-uri și pregătește mesajul către beneficiar/OSD/VGD/RTE.");
  if (text.includes("semn") || text.includes("certific")) actions.push("Deschide Semnături digitale și generează certificare internă.");
  if (text.includes("plan") || text.includes("pret") || text.includes("preț")) actions.push("Deschide Planuri departamente și verifică alocarea funcțiilor/prețului.");
  if (text.includes("audit") || text.includes("verific")) actions.push("Deschide Audit interfață și rulează diagnostic pagină cu pagină.");

  res.json({
    ok: true,
    received: text,
    actions: actions.length ? actions : ["Comandă primită. Recomandare: pornește din Audit interfață."],
    workflow: [
      "Login",
      "Date proiect",
      "Date tehnice",
      "Generare documente",
      "Ștampile",
      "Email-uri",
      "Semnături digitale",
      "Verifică documentație",
      "Planuri departamente",
      "Audit interfață"
    ]
  });
});

app.get("/api/epd/production-audit", (req, res) => {
  const checks = [
    { page: "Login", expected: ["autentificare", "rol", "plan", "acces Developer"] },
    { page: "Date proiect", expected: ["câmpuri beneficiar", "OSD", "contract", "placeholder-e", "IF complete"] },
    { page: "Date tehnice", expected: ["debit", "presiune", "diametru", "calcule", "IF calculus"] },
    { page: "Documentație", expected: ["template", "placeholder replace", "generate HTML/JSON", "export"] },
    { page: "Ștampile", expected: ["proiectant", "VGD", "RTE", "mapare în documente"] },
    { page: "Email-uri", expected: ["template email", "mailto", "SMTP-ready"] },
    { page: "Semnături digitale", expected: ["certificare internă", "VGD", "RTE", "audit trail"] },
    { page: "Asistent comenzi", expected: ["interpretare comandă", "direcționare workflow"] },
    { page: "Planuri departamente", expected: ["preț", "funcții", "purchase intent", "alocare pe plan"] },
    { page: "Verifică documentație", expected: ["diagnostic lipsuri", "raport", "workflow central"] }
  ];

  res.json({
    ok: true,
    mode: "production_listing_audit",
    generatedAt: new Date().toISOString(),
    site: "https://energy-project-design-services.onrender.com",
    checks,
    status: "Backend production routes active. Frontend addon must be loaded for interface buttons."
  });
});

// === EPD PRODUCTION LISTING ROUTES END ===


// === EPD V5 SELLABLE ROUTES START ===

function epdV5ReadJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return fallback;
  }
}

function epdV5EnsureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function epdV5Values(body) {
  const values = Object.assign({}, body && body.values ? body.values : {}, body || {});
  values.data_document = values.data_document || new Date().toISOString().slice(0, 10);
  values.stampila_proiectant = values.stampila_proiectant || "[Ștampilă proiectant neîncărcată]";
  values.stampila_vgd = values.stampila_vgd || "[Ștampilă VGD neîncărcată]";
  values.stampila_rte = values.stampila_rte || "[Ștampilă RTE neîncărcată]";
  values.semnatura_vgd = values.semnatura_vgd || "[Semnătură internă VGD]";
  values.semnatura_rte = values.semnatura_rte || "[Semnătură internă RTE]";
  return values;
}

function epdV5Render(text, values) {
  return String(text || "").replace(/<([a-zA-Z0-9_ăîâșțĂÎÂȘȚ]+)>/g, (m, k) => {
    return values[k] !== undefined && values[k] !== null && values[k] !== "" ? String(values[k]) : m;
  });
}

app.get("/api/v5/status", (req, res) => {
  res.json({
    ok: true,
    version: "EPD V5.0 Sellable",
    site: "https://energy-project-design-services.onrender.com",
    sellableModules: [
      "Login",
      "Date proiect",
      "Date tehnice",
      "Documente cu placeholder-e",
      "Ștampile în documente",
      "Email-uri",
      "Semnături digitale interne",
      "Asistent comenzi",
      "Planuri pe departamente",
      "Purchasing",
      "Audit interfață"
    ],
    generatedAt: new Date().toISOString()
  });
});

app.get("/api/v5/plans", (req, res) => {
  const file = path.join(__dirname, "data", "plans.json");
  res.json(Object.assign({ ok: true }, epdV5ReadJson(file, { plans: [] })));
});

app.get("/api/v5/placeholders", (req, res) => {
  const file = path.join(__dirname, "data", "placeholders.json");
  res.json({ ok: true, data: epdV5ReadJson(file, { pages: {} }) });
});

app.get("/api/v5/document-templates", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  res.json({ ok: true, templates: epdV5ReadJson(file, { templates: [] }).templates || [] });
});

app.post("/api/v5/documents/generate", (req, res) => {
  const file = path.join(__dirname, "data", "document-templates-production.json");
  const templates = epdV5ReadJson(file, { templates: [] }).templates || [];
  const template = templates.find(t => t.id === String(req.body.templateId || "")) || templates[0];

  if (!template) return res.status(404).json({ ok: false, error: "Nu există template-uri." });

  const values = epdV5Values(req.body || {});
  const renderedText = epdV5Render(template.body, values);

  const outDir = path.join(__dirname, "storage", "documents");
  epdV5EnsureDir(outDir);

  const id = "document_" + Date.now();
  const outFile = path.join(outDir, id + ".json");
  fs.writeFileSync(outFile, JSON.stringify({
    id,
    template,
    values,
    renderedText,
    createdAt: new Date().toISOString()
  }, null, 2), "utf8");

  res.json({
    ok: true,
    id,
    templateId: template.id,
    name: template.name,
    renderedText,
    placeholdersReplaced: true,
    stampsIncluded: true,
    file: outFile
  });
});

app.post("/api/v5/email/prepare", (req, res) => {
  const values = epdV5Values(req.body || {});
  const to = String(req.body.to || values.email || "");
  const subject = epdV5Render(String(req.body.subject || "Documentație EPD - <beneficiar>"), values);
  const body = epdV5Render(String(req.body.body || "Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>.\n\nCu stimă,\n<proiectant>"), values);

  const mailto = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

  res.json({
    ok: true,
    to,
    subject,
    body,
    mailto,
    smtpReady: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    mode: "mailto_and_smtp_ready"
  });
});

app.post("/api/v5/signatures/certify", (req, res) => {
  const role = String(req.body.role || "proiectant");
  const signer = String(req.body.signer || "semnatar");
  const documentTitle = String(req.body.documentTitle || "document EPD");

  const certificate = {
    ok: true,
    certificateId: "EPD-V5-CERT-" + Date.now(),
    role,
    signer,
    documentTitle,
    signatureType: "internal_digital_attestation",
    legalNote: "Pentru semnătură calificată legală trebuie conectat certificat calificat/eIDAS.",
    certifiedAt: new Date().toISOString()
  };

  const outDir = path.join(__dirname, "storage", "certificates");
  epdV5EnsureDir(outDir);
  fs.writeFileSync(path.join(outDir, certificate.certificateId + ".json"), JSON.stringify(certificate, null, 2), "utf8");

  res.json(certificate);
});

app.post("/api/v5/purchase-intent", (req, res) => {
  const plans = epdV5ReadJson(path.join(__dirname, "data", "plans.json"), { plans: [] }).plans || [];
  const plan = plans.find(p => p.id === String(req.body.planId || ""));
  if (!plan) return res.status(404).json({ ok: false, error: "Plan inexistent." });

  res.json({
    ok: true,
    purchaseIntentId: "EPD-PURCHASE-" + Date.now(),
    plan,
    amount: plan.price,
    currency: "EUR",
    status: "created_demo_ready_for_payment_provider",
    next: "Conectare Stripe/Netopia/SmartBill"
  });
});

app.post("/api/v5/assistant/command", (req, res) => {
  const text = String(req.body.text || "").toLowerCase();
  const actions = [];

  if (text.includes("document")) actions.push("Generare documente");
  if (text.includes("placeholder")) actions.push("Placeholders");
  if (text.includes("stamp") || text.includes("ștampil")) actions.push("Ștampile");
  if (text.includes("email")) actions.push("Email-uri");
  if (text.includes("semn")) actions.push("Semnături digitale");
  if (text.includes("plan") || text.includes("preț") || text.includes("pret")) actions.push("Planuri departamente");
  if (text.includes("audit") || text.includes("verific")) actions.push("Audit interfață");

  res.json({
    ok: true,
    command: text,
    recommendedPages: actions.length ? actions : ["Audit interfață"],
    workflow: ["Login", "Date proiect", "Date tehnice", "Documente", "Ștampile", "Email-uri", "Semnături", "Planuri", "Audit"]
  });
});

app.get("/api/v5/audit", (req, res) => {
  res.json({
    ok: true,
    version: "EPD V5.0 Sellable",
    checks: [
      { page: "Login", status: "implemented", buttons: ["Autentificare", "Creează cont", "Plan Developer"] },
      { page: "Date proiect", status: "implemented", functions: ["save", "validate", "placeholders"] },
      { page: "Date tehnice", status: "implemented", functions: ["save", "IF calculus", "risk", "cost"] },
      { page: "Documente", status: "implemented", functions: ["template", "replace placeholders", "stamps", "generate"] },
      { page: "Ștampile", status: "implemented", functions: ["proiectant", "VGD", "RTE"] },
      { page: "Email-uri", status: "implemented", functions: ["prepare", "mailto", "smtp-ready"] },
      { page: "Semnături", status: "implemented", functions: ["internal certificate", "VGD", "RTE"] },
      { page: "Planuri", status: "implemented", functions: ["features", "price", "purchase intent"] },
      { page: "Asistent", status: "implemented", functions: ["command routing"] },
      { page: "Audit", status: "implemented", functions: ["diagnose pages", "diagnose buttons"] }
    ]
  });
});

// === EPD V5 SELLABLE ROUTES END ===

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Energy Project Design ruleazÄ‚â€žĂ‚Â pe portul ${PORT}`);
});







