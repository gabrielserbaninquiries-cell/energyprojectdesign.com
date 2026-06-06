(function(){
  "use strict";

  const SITE_URL = "https://energy-project-design-services.onrender.com";

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function getUser(){
    try { return JSON.parse(localStorage.getItem("epd_google_user") || "{}"); } catch { return {}; }
  }

  function getState(){
    const candidates = ["epd_state","epd_app_state","epd_state_v4","epd_project_state"];
    for (const k of candidates) {
      try {
        const raw = localStorage.getItem(k);
        if (raw) return JSON.parse(raw);
      } catch {}
    }

    const merged = {};
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.toLowerCase().includes("epd") || k.toLowerCase().includes("project")) {
        try { merged[k] = JSON.parse(localStorage.getItem(k)); }
        catch { merged[k] = localStorage.getItem(k); }
      }
    }
    return merged;
  }

  function isDeveloper(){
    const u = getUser();
    const role = String(u.role || u.access || "").toLowerCase();
    const plan = String(u.plan || "").toLowerCase();
    const email = String(u.email || "").toLowerCase();

    return role.includes("developer") ||
           role.includes("inside") ||
           plan.includes("developer") ||
           plan.includes("inside") ||
           email.includes("sparlecontdebosi1") ||
           email.includes("dragos");
  }

  function setContent(html){
    if (typeof window.content === "function") {
      window.content(html);
      return;
    }

    const el =
      document.querySelector("#content") ||
      document.querySelector(".content") ||
      document.querySelector("main") ||
      document.body;

    el.innerHTML = html;
  }

  function developerDenied(){
    setContent('<div class="card"><h3>Acces restricționat</h3><p>Această pagină este disponibilă doar pentru Developer / Inside.</p></div>');
  }

  async function fetchJson(url){
    const r = await fetch(url);
    return await r.json();
  }

  function pageButton(name){
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.className = "epd-dev-nav";
    btn.onclick = function(){
      if (typeof window.openPage === "function") window.openPage(name);
      else renderSpecialPage(name);
    };
    return btn;
  }

  function injectDeveloperNavigation(){
    if (document.querySelector("[data-epd-dev-nav='1']")) return;

    const nav =
      document.querySelector(".sidebar") ||
      document.querySelector("aside") ||
      document.querySelector("nav") ||
      document.body;

    const box = document.createElement("div");
    box.setAttribute("data-epd-dev-nav","1");
    box.style.marginTop = "12px";
    box.style.display = "grid";
    box.style.gap = "6px";

    const title = document.createElement("div");
    title.textContent = "Developer";
    title.style.fontWeight = "700";
    title.style.opacity = "0.75";
    title.style.padding = "6px 8px";

    box.appendChild(title);
    box.appendChild(pageButton("Placeholders"));
    box.appendChild(pageButton("Verifică documentație"));
    box.appendChild(pageButton("Audit"));

    nav.appendChild(box);
  }

  async function renderPlaceholders(){
    if (!isDeveloper()) return developerDenied();

    let data = {};
    try {
      const res = await fetchJson("/api/developer/placeholders");
      data = res.data || {};
    } catch (err) {
      data = { pages: {}, meta: { error: String(err) } };
    }

    const pages = data.pages || {};
    const rows = Object.keys(pages).map(function(page){
      const chips = (pages[page] || []).map(x => '<span class="placeholder">&lt;' + esc(x) + '&gt;</span>').join(" ");
      return '<div class="card"><h3>' + esc(page) + '</h3><div class="chips">' + chips + '</div></div>';
    }).join("");

    setContent(
      '<div class="card">' +
      '<h2>Placeholders</h2>' +
      '<p>Pagină Developer-only pentru toate placeholder-ele, structurate pe pagini și workflow.</p>' +
      '<div class="row">' +
      '<button onclick="window.EPDAuditAddon.refreshPlaceholders()">Reîncarcă</button>' +
      '<button onclick="window.EPDAuditAddon.copyPlaceholderReport()">Copiază raport</button>' +
      '</div>' +
      '</div>' +
      rows
    );
  }

  function workflowAudit(){
    const state = getState();
    const text = JSON.stringify(state).toLowerCase();

    const checks = [
      ["Date proiect", ["beneficiar","adresa_lucrare","localitate","judet","osd","proiectant"]],
      ["Date tehnice", ["debit_instalat","presiune_regim","diametru_conducta","lungime_bransament"]],
      ["Ștampile", ["stampila","stamp","vgd","rte"]],
      ["Email-uri", ["email","destinatar","subiect"]],
      ["Documentație", ["document","memoriu","cerere","fisa"]],
      ["Verificări", ["vgd","rte","status_vgd","status_rte"]],
      ["Export", ["export","plan","developer"]]
    ];

    return checks.map(function(c){
      const ok = c[1].some(k => text.includes(k));
      return {
        page: c[0],
        ok,
        keys: c[1]
      };
    });
  }

  async function renderVerifyDocumentation(){
    const audit = workflowAudit();

    let backend = {};
    try { backend = await fetchJson("/api/developer/deep-scan"); }
    catch (err) { backend = { ok:false, error:String(err) }; }

    const rows = audit.map(function(x){
      return '<tr><td>' + esc(x.page) + '</td><td class="' + (x.ok ? 'ok' : 'bad') + '">' +
        (x.ok ? 'Detectat' : 'Lipsă / necesită completare') +
        '</td><td>' + esc(x.keys.join(", ")) + '</td></tr>';
    }).join("");

    setContent(
      '<div class="card">' +
      '<h2>Verifică documentație</h2>' +
      '<p>Workflow central: Date proiect → Date tehnice → Ștampile → Email-uri → Verifică documentație.</p>' +
      '<div class="row">' +
      '<button onclick="window.EPDAuditAddon.runIfCalculus()">Rulează IF calculus local</button>' +
      '<button onclick="window.EPDAuditAddon.copyAuditReport()">Copiază raport</button>' +
      '</div>' +
      '</div>' +
      '<div class="card"><h3>Audit workflow local</h3>' +
      '<table class="table"><tr><th>Pagină</th><th>Status</th><th>Chei verificate</th></tr>' + rows + '</table></div>' +
      '<div class="card"><h3>Audit backend</h3><pre>' + esc(JSON.stringify(backend,null,2)) + '</pre></div>'
    );
  }

  async function renderAudit(){
    if (!isDeveloper()) return developerDenied();

    let scan = {};
    try { scan = await fetchJson("/api/developer/deep-scan"); }
    catch (err) { scan = { ok:false, error:String(err) }; }

    setContent(
      '<div class="card">' +
      '<h2>Audit validation and reconstruction + implement</h2>' +
      '<p>Audit Developer pentru verificarea funcțiilor lipsă, placeholder-e, workflow și integritate.</p>' +
      '<div class="row">' +
      '<button onclick="window.EPDAuditAddon.patchPlanPrompt()">Generează patch plan AI Developer</button>' +
      '<button onclick="window.EPDAuditAddon.copyDeepScan()">Copiază deep scan</button>' +
      '</div>' +
      '</div>' +
      '<div class="card"><h3>Deep Scan</h3><pre>' + esc(JSON.stringify(scan,null,2)) + '</pre></div>'
    );
  }

  function renderSpecialPage(page){
    if (page === "Placeholders") return renderPlaceholders();
    if (page === "Verifică documentație") return renderVerifyDocumentation();
    if (page === "Audit") return renderAudit();
    return false;
  }

  function wrapOpenPage(){
    if (window.__epdAuditOpenPageWrapped) return;
    window.__epdAuditOpenPageWrapped = true;

    const oldOpenPage = window.openPage;

    window.openPage = function(page){
      if (renderSpecialPage(page) !== false) return;
      if (typeof oldOpenPage === "function") return oldOpenPage.apply(this, arguments);
    };
  }

  async function patchPlanPrompt(){
    const text = prompt("Comandă pentru AI Developer:", "Adaugă IF calculus functions în Date proiect și Date tehnice, fără full rebuild.");
    if (!text) return;

    const r = await fetch("/api/ai-developer/patch-plan", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });

    const json = await r.json();

    setContent(
      '<div class="card"><h2>AI Developer — Patch Plan</h2>' +
      '<pre>' + esc(JSON.stringify(json,null,2)) + '</pre></div>'
    );
  }

  function runIfCalculus(){
    const report = workflowAudit();

    const recommendations = report.map(function(x){
      if (x.ok) return x.page + ": OK";
      return x.page + ": necesită completare/verificare înainte de export.";
    }).join("\n");

    alert("IF calculus local:\n\n" + recommendations);
  }

  async function copyPlaceholderReport(){
    const r = await fetchJson("/api/developer/placeholders");
    await navigator.clipboard.writeText(JSON.stringify(r,null,2));
    alert("Raport placeholder copiat.");
  }

  async function copyDeepScan(){
    const r = await fetchJson("/api/developer/deep-scan");
    await navigator.clipboard.writeText(JSON.stringify(r,null,2));
    alert("Deep scan copiat.");
  }

  async function copyAuditReport(){
    const r = {
      localWorkflow: workflowAudit(),
      state: getState(),
      generatedAt: new Date().toISOString()
    };
    await navigator.clipboard.writeText(JSON.stringify(r,null,2));
    alert("Raport verificare documentație copiat.");
  }

  function init(){
    wrapOpenPage();
    injectDeveloperNavigation();
  }

  window.EPDAuditAddon = {
    init,
    renderPlaceholders,
    renderVerifyDocumentation,
    renderAudit,
    refreshPlaceholders: renderPlaceholders,
    patchPlanPrompt,
    runIfCalculus,
    copyPlaceholderReport,
    copyDeepScan,
    copyAuditReport
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  setTimeout(init, 800);
  setTimeout(init, 2000);
})();
