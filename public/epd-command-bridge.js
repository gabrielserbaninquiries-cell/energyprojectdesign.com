(function(){
  "use strict";

  const ID = "epd-command-bridge-panel";

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function ensure(){
    if (document.getElementById("epdCommandBridgeButton")) return;

    const btn = document.createElement("button");
    btn.id = "epdCommandBridgeButton";
    btn.textContent = "EPD Command Bridge";
    btn.style.position = "fixed";
    btn.style.right = "18px";
    btn.style.bottom = "72px";
    btn.style.zIndex = "999999";
    btn.style.border = "0";
    btn.style.borderRadius = "999px";
    btn.style.padding = "12px 16px";
    btn.style.background = "#155eef";
    btn.style.color = "#fff";
    btn.style.fontWeight = "800";
    btn.style.boxShadow = "0 12px 30px rgba(0,0,0,.25)";
    btn.onclick = toggle;
    document.body.appendChild(btn);

    const panel = document.createElement("div");
    panel.id = ID;
    panel.style.position = "fixed";
    panel.style.right = "18px";
    panel.style.bottom = "126px";
    panel.style.width = "min(720px, calc(100vw - 36px))";
    panel.style.maxHeight = "calc(100vh - 160px)";
    panel.style.overflow = "auto";
    panel.style.zIndex = "999998";
    panel.style.display = "none";
    panel.style.background = "#ffffff";
    panel.style.color = "#10231d";
    panel.style.border = "1px solid #dce8e3";
    panel.style.borderRadius = "18px";
    panel.style.boxShadow = "0 18px 60px rgba(0,0,0,.28)";
    panel.style.padding = "16px";
    panel.style.fontFamily = 'Inter, "Segoe UI", Arial, sans-serif';

    panel.innerHTML =
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">' +
        '<div><h2 style="margin:0">EPD Command Bridge</h2><p style="margin:6px 0;color:#61736d">Testează fluxul input message → intent → output command.</p></div>' +
        '<button onclick="window.EPDCommandBridge.toggle()" style="border:1px solid #dce8e3;border-radius:10px;background:white;padding:8px 10px">Închide</button>' +
      '</div>' +
      '<label style="display:block;font-weight:800;margin-top:12px">Prompt / comandă</label>' +
      '<textarea id="epdCommandBridgeInput" style="width:100%;min-height:130px;border:1px solid #dce8e3;border-radius:12px;padding:10px;margin-top:6px">verifică documentația, rulează calcul și generează document cu ștampilă VGD</textarea>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
        '<button onclick="window.EPDCommandBridge.call(\'diagnose\')" style="border:1px solid #dce8e3;border-radius:10px;background:white;padding:9px 12px;font-weight:700">Diagnose input</button>' +
        '<button onclick="window.EPDCommandBridge.call(\'plan\')" style="border:0;border-radius:10px;background:#0f7a4f;color:white;padding:9px 12px;font-weight:800">Plan command</button>' +
        '<button onclick="window.EPDCommandBridge.call(\'execute-preview\')" style="border:0;border-radius:10px;background:#155eef;color:white;padding:9px 12px;font-weight:800">Execute preview</button>' +
        '<button onclick="window.EPDCommandBridge.copy()" style="border:1px solid #dce8e3;border-radius:10px;background:white;padding:9px 12px;font-weight:700">Copiază rezultat</button>' +
      '</div>' +
      '<pre id="epdCommandBridgeOutput" style="white-space:pre-wrap;overflow:auto;background:#0d1d18;color:#d8f8e8;border-radius:12px;padding:12px;margin-top:12px">Nerulat.</pre>';

    document.body.appendChild(panel);
  }

  function toggle(){
    ensure();
    const p = document.getElementById(ID);
    p.style.display = p.style.display === "none" ? "block" : "none";
  }

  async function call(kind){
    const input = document.getElementById("epdCommandBridgeInput").value;
    const out = document.getElementById("epdCommandBridgeOutput");
    const url = "/api/epd-command/" + kind;

    out.textContent = "Trimit către " + url + "...";

    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          text: input,
          message: input,
          source: "EPDCommandBridgeFrontend"
        })
      });

      const txt = await r.text();
      let data;
      try { data = JSON.parse(txt); }
      catch { data = { ok: r.ok, status: r.status, raw: txt }; }

      out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      out.textContent = "Eroare: " + err.message;
    }
  }

  function copy(){
    const out = document.getElementById("epdCommandBridgeOutput");
    navigator.clipboard.writeText(out.textContent || "").then(function(){
      alert("Rezultat copiat.");
    });
  }

  window.EPDCommandBridge = { ensure, toggle, call, copy };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensure);
  else ensure();

  setTimeout(ensure, 800);
  setTimeout(ensure, 2000);
})();
