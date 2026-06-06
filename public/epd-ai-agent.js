(function(){
  "use strict";

  const PANEL_ID = "epdAiAgentPanel";

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function ensure(){
    if (!document.getElementById("epdAiAgentButton")) {
      const b = document.createElement("button");
      b.id = "epdAiAgentButton";
      b.textContent = "EPD AI Agent";
      b.style.position = "fixed";
      b.style.right = "18px";
      b.style.bottom = "18px";
      b.style.zIndex = "999999";
      b.style.border = "0";
      b.style.borderRadius = "999px";
      b.style.padding = "13px 18px";
      b.style.background = "#0f7a4f";
      b.style.color = "#fff";
      b.style.fontWeight = "900";
      b.style.boxShadow = "0 12px 34px rgba(0,0,0,.26)";
      b.onclick = toggle;
      document.body.appendChild(b);
    }

    if (!document.getElementById(PANEL_ID)) {
      const panel = document.createElement("div");
      panel.id = PANEL_ID;
      panel.style.position = "fixed";
      panel.style.inset = "22px";
      panel.style.zIndex = "999998";
      panel.style.display = "none";
      panel.style.gridTemplateColumns = "330px 1fr";
      panel.style.background = "#f4f7f6";
      panel.style.color = "#10231d";
      panel.style.borderRadius = "24px";
      panel.style.overflow = "hidden";
      panel.style.boxShadow = "0 24px 80px rgba(0,0,0,.36)";
      panel.style.border = "1px solid rgba(0,0,0,.14)";
      panel.style.fontFamily = 'Inter, "Segoe UI", Arial, sans-serif';

      panel.innerHTML =
        '<aside style="background:#10231d;color:#fff;padding:18px;overflow:auto">' +
          '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.16)">' +
            '<div style="width:46px;height:46px;border-radius:15px;background:linear-gradient(135deg,#21a36f,#0f7a4f);display:grid;place-items:center;font-weight:950">AI</div>' +
            '<div><b>EPD AI Agent</b><div style="opacity:.72;font-size:12px">Self-upgrade controlat</div></div>' +
          '</div>' +
          menuButton("Comandă", "command") +
          menuButton("Plan", "plan") +
          menuButton("Apply", "apply") +
          menuButton("Upgrade-uri", "upgrades") +
          menuButton("Reguli", "rules") +
          menuButton("Health", "health") +
          '<button onclick="window.EPDAgent.close()" style="width:100%;margin-top:14px;border:0;border-radius:11px;padding:10px;background:#b42318;color:#fff;font-weight:800">Închide</button>' +
        '</aside>' +
        '<main style="padding:18px;overflow:auto">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">' +
            '<div><h2 style="margin:0">Agent de upgrade EPD</h2><p style="margin:6px 0;color:#61736d">Comandă → intenție → plan → apply controlat.</p></div>' +
            '<button onclick="window.EPDAgent.refresh()" style="border:1px solid #dce8e3;border-radius:11px;background:white;padding:9px 12px;font-weight:800">Refresh</button>' +
          '</div>' +
          '<div id="epdAiAgentView"></div>' +
        '</main>';

      document.body.appendChild(panel);
      renderCommand();
    }
  }

  function menuButton(label, page){
    return '<button onclick="window.EPDAgent.open(\'' + page + '\')" style="width:100%;text-align:left;border:0;border-radius:11px;padding:10px;margin:2px 0;background:transparent;color:#fff;cursor:pointer">' + label + '</button>';
  }

  function toggle(){
    ensure();
    const p = document.getElementById(PANEL_ID);
    p.style.display = p.style.display === "none" ? "grid" : "none";
  }

  function close(){
    const p = document.getElementById(PANEL_ID);
    if (p) p.style.display = "none";
  }

  function view(html){
    document.getElementById("epdAiAgentView").innerHTML = html;
  }

  function box(title, body){
    return '<div style="background:#fff;border:1px solid #dce8e3;border-radius:18px;padding:16px;margin-bottom:12px;box-shadow:0 10px 28px rgba(16,35,29,.08)"><h3 style="margin-top:0">' + esc(title) + '</h3>' + body + '</div>';
  }

  function textarea(){
    return '<label style="font-weight:800">Comandă pentru agent</label><textarea id="epdAgentInput" style="width:100%;min-height:150px;border:1px solid #dce8e3;border-radius:12px;padding:10px;margin-top:6px">Repară Date tehnice, adaugă casete de calcul variabil, generează documente cu placeholder-e, ștampile VGD/RTE, email-uri, semnături și planuri tarifate.</textarea>';
  }

  function renderCommand(){
    view(
      box("Comandă agent", textarea() +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
          '<button onclick="window.EPDAgent.command()" style="border:0;border-radius:10px;background:#0f7a4f;color:white;padding:9px 12px;font-weight:900">Trimite comandă</button>' +
          '<button onclick="window.EPDAgent.plan()" style="border:0;border-radius:10px;background:#155eef;color:white;padding:9px 12px;font-weight:900">Generează plan</button>' +
        '</div>') +
      box("Rezultat", '<pre id="epdAgentOutput" style="white-space:pre-wrap;overflow:auto;background:#0d1d18;color:#d8f8e8;border-radius:12px;padding:12px">Nerulat.</pre>')
    );
  }

  async function post(url, data){
    const r = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(data)
    });
    const txt = await r.text();
    try { return JSON.parse(txt); } catch { return { ok: r.ok, status: r.status, raw: txt }; }
  }

  async function get(url){
    const r = await fetch(url);
    const txt = await r.text();
    try { return JSON.parse(txt); } catch { return { ok: r.ok, status: r.status, raw: txt }; }
  }

  function output(data){
    const el = document.getElementById("epdAgentOutput");
    if (el) el.textContent = JSON.stringify(data, null, 2);
    else view(box("Rezultat", '<pre style="white-space:pre-wrap;overflow:auto;background:#0d1d18;color:#d8f8e8;border-radius:12px;padding:12px">' + esc(JSON.stringify(data, null, 2)) + '</pre>'));
  }

  async function command(){
    const text = document.getElementById("epdAgentInput").value;
    output(await post("/api/epd-agent/command", { text }));
  }

  async function plan(){
    const text = document.getElementById("epdAgentInput").value;
    output(await post("/api/epd-agent/plan", { text }));
  }

  async function apply(){
    const textEl = document.getElementById("epdAgentApplyInput");
    const text = textEl ? textEl.value : "";
    output(await post("/api/epd-agent/apply", {
      text,
      confirmation: "APPLY_EPD_AGENT_UPGRADE"
    }));
  }

  function renderPlan(){
    view(
      box("Plan upgrade", textarea() +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
          '<button onclick="window.EPDAgent.plan()" style="border:0;border-radius:10px;background:#155eef;color:white;padding:9px 12px;font-weight:900">Generează plan</button>' +
        '</div>') +
      box("Rezultat", '<pre id="epdAgentOutput" style="white-space:pre-wrap;overflow:auto;background:#0d1d18;color:#d8f8e8;border-radius:12px;padding:12px">Nerulat.</pre>')
    );
  }

  function renderApply(){
    view(
      box("Aplicare upgrade controlat", 
        '<p>Aplicarea modifică doar <b>data/epd-agent-upgrades.json</b>. Nu rescrie server.js, nu atinge Google OAuth, nu creează React.</p>' +
        '<label style="font-weight:800">Comandă confirmată</label>' +
        '<textarea id="epdAgentApplyInput" style="width:100%;min-height:150px;border:1px solid #dce8e3;border-radius:12px;padding:10px;margin-top:6px">Adaugă motor documente, casete calcul variabil, planuri departamente și audit interfață.</textarea>' +
        '<button onclick="window.EPDAgent.apply()" style="margin-top:10px;border:0;border-radius:10px;background:#0f7a4f;color:white;padding:9px 12px;font-weight:900">Apply cu confirmare</button>') +
      box("Rezultat", '<pre id="epdAgentOutput" style="white-space:pre-wrap;overflow:auto;background:#0d1d18;color:#d8f8e8;border-radius:12px;padding:12px">Nerulat.</pre>')
    );
  }

  async function renderUpgrades(){
    const data = await get("/api/epd-agent/upgrades");
    output(data);
  }

  async function renderRules(){
    const data = await get("/api/epd-agent/rules");
    output(data);
  }

  async function renderHealth(){
    const data = await get("/api/epd-agent/health");
    output(data);
  }

  function open(page){
    if (page === "command") return renderCommand();
    if (page === "plan") return renderPlan();
    if (page === "apply") return renderApply();
    if (page === "upgrades") return renderUpgrades();
    if (page === "rules") return renderRules();
    if (page === "health") return renderHealth();
    renderCommand();
  }

  function refresh(){
    open("upgrades");
  }

  window.EPDAgent = {
    ensure,
    toggle,
    close,
    open,
    refresh,
    command,
    plan,
    apply
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensure);
  } else {
    ensure();
  }

  setTimeout(ensure, 800);
  setTimeout(ensure, 2000);
})();
