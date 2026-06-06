(function(){
  "use strict";

  const EPD_INTEL_VERSION = "1.0.0";
  const SITE_URL = "https://energy-project-design-services.onrender.com";

  const pageMap = {
    "Panou principal": [
      "rezumat proiect",
      "status profil activ",
      "status plan",
      "scor completare",
      "scurtături flux principal"
    ],
    "Date proiect": [
      "beneficiar",
      "adresă lucrare",
      "localitate / județ",
      "OSD",
      "proiectant",
      "executant",
      "VGD",
      "RTE",
      "observații"
    ],
    "Date tehnice": [
      "debit instalat",
      "presiune regim",
      "diametru conductă",
      "material conductă",
      "lungime branșament",
      "punct racordare",
      "post reglare",
      "contor",
      "traseu"
    ],
    "Documentație": [
      "generator documente",
      "șabloane cu placeholder-e",
      "previzualizare",
      "validare placeholder-e lipsă",
      "salvare document"
    ],
    "Șabloane OSD": [
      "bibliotecă OSD",
      "șabloane per operator",
      "mapare documente cerute",
      "scanare placeholder-e"
    ],
    "Calcul": [
      "calcul debit",
      "calcul presiune",
      "estimare pierdere presiune",
      "estimare materiale",
      "rezultat calcul"
    ],
    "Ștampile": [
      "ștampilă proiectant",
      "ștampilă VGD",
      "ștampilă RTE",
      "mapare placeholder-e de ștampilă"
    ],
    "Email-uri": [
      "template ofertare",
      "template solicitare date lipsă",
      "template transmitere OSD",
      "template VGD",
      "template RTE"
    ],
    "Verificări": [
      "validare date obligatorii",
      "verificare VGD",
      "verificare RTE",
      "document autorizare VGD",
      "document autorizare RTE"
    ],
    "Checklist": [
      "date proiect completate",
      "date tehnice completate",
      "documente generate",
      "ștampile mapate",
      "VGD admis",
      "RTE admis",
      "email pregătit",
      "export permis"
    ],
    "Registru proiecte": [
      "istoric proiecte",
      "status proiect",
      "data salvare",
      "căutare proiect"
    ],
    "Import / Export": [
      "import JSON",
      "export JSON",
      "control export după plan",
      "pregătire pentru DOCX/PDF/ZIP"
    ],
    "Planuri și licențe": [
      "Free",
      "Trial",
      "Basic",
      "Developer",
      "Inside",
      "reguli export"
    ],
    "Marketplace / Module": [
      "module premium",
      "template marketplace",
      "OCR",
      "planuri/scheme",
      "engine documente"
    ],
    "Asistent utilizator": [
      "întrebări flux proiect",
      "câmpuri lipsă",
      "ajutor VGD/RTE",
      "ajutor export"
    ],
    "AI Developer": [
      "chat comenzi",
      "analiză update",
      "generare prompt",
      "Run Update"
    ],
    "Inside": [
      "acces restricționat",
      "funcții sensibile",
      "confirmări suplimentare"
    ],
    "Diagnostic": [
      "health backend",
      "status OpenAI",
      "status GitHub",
      "status profil",
      "status plan"
    ],
    "Actualizări": [
      "upload prompt",
      "listă prompturi",
      "Run Update",
      "raport update"
    ],
    "Construire / Lansare": [
      "link public",
      "repository",
      "Render deploy",
      "diagnostic lansare"
    ]
  };

  const requiredProjectFields = [
    "beneficiar",
    "adresa_lucrare",
    "localitate",
    "judet",
    "osd",
    "proiectant"
  ];

  const requiredTechnicalFields = [
    "debit_instalat",
    "presiune_regim",
    "diametru_conducta"
  ];

  function safeText(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      }[c] || c;
    });
  }

  function readKnownState(){
    const keys = [
      "epd_services_clean_state_v1",
      "epd_global_all_pages_state_v1",
      "epd_global_rebuild_state_v2",
      "epd_services_state_v1",
      "epd_v3_data"
    ];

    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return { key, data: parsed };
        }
      } catch {}
    }

    return { key: "", data: {} };
  }

  function getCompletionReport(){
    const found = readKnownState();
    const state = found.data || {};
    const project = state.project || {};
    const technical = state.technical || {};
    const stamps = Array.isArray(state.stamps) ? state.stamps : [];
    const documents = Array.isArray(state.documents) ? state.documents : [];
    const emails = Array.isArray(state.emails) ? state.emails : [];
    const vgd = state.vgd || {};
    const rte = state.rte || {};

    const missingProject = requiredProjectFields.filter(function(k){
      return !String(project[k] || "").trim();
    });

    const missingTechnical = requiredTechnicalFields.filter(function(k){
      return !String(technical[k] || "").trim();
    });

    const items = [
      { name:"Date proiect", ok: missingProject.length === 0, detail: missingProject.join(", ") || "complet" },
      { name:"Date tehnice", ok: missingTechnical.length === 0, detail: missingTechnical.join(", ") || "complet" },
      { name:"Documente", ok: documents.length > 0, detail: documents.length + " documente" },
      { name:"Ștampilă proiectant", ok: stamps.some(function(x){ return x.role === "proiectant"; }), detail:"placeholder <stampila_proiectant>" },
      { name:"Ștampilă VGD", ok: stamps.some(function(x){ return x.role === "vgd"; }), detail:"placeholder <stampila_vgd>" },
      { name:"Ștampilă RTE", ok: stamps.some(function(x){ return x.role === "rte"; }), detail:"placeholder <stampila_rte>" },
      { name:"VGD", ok: vgd.status_vgd === "admis", detail: vgd.status_vgd || "neverificat" },
      { name:"RTE", ok: rte.status_rte === "admis", detail: rte.status_rte || "neverificat" },
      { name:"Email-uri", ok: emails.length > 0, detail: emails.length + " emailuri pregătite" }
    ];

    const score = Math.round(items.filter(function(x){ return x.ok; }).length / items.length * 100);

    return {
      storageKey: found.key,
      score,
      items
    };
  }

  function buildPrompt(){
    const report = getCompletionReport();
    const missing = report.items.filter(function(x){ return !x.ok; });

    return [
      "Update inteligent EPD, fără rescriere globală.",
      "Păstrează arhitectura existentă și nu șterge funcții.",
      "Completează incremental doar funcțiile lipsă.",
      "",
      "Scor completare detectat: " + report.score + "%.",
      "Funcții lipsă sau incomplete:",
      missing.map(function(x){ return "- " + x.name + ": " + x.detail; }).join("\n") || "- Nu au fost detectate lipsuri majore.",
      "",
      "Reguli stricte:",
      "- Nu rescrie public/app.js complet.",
      "- Nu rescrie server.js complet.",
      "- Aplică doar patch-uri mici.",
      "- Rulează validare sintaxă înainte de commit.",
      "- Păstrează site-ul corect: " + SITE_URL + ".",
      "- Toată interfața vizibilă rămâne în limba română."
    ].join("\n");
  }

  function ensurePanel(){
    if (document.getElementById("epdIntelButton")) return;

    const css = document.createElement("style");
    css.textContent = `
      #epdIntelButton{
        position:fixed;
        right:18px;
        bottom:76px;
        z-index:9998;
        border:0;
        border-radius:999px;
        padding:12px 16px;
        background:#155eef;
        color:#fff;
        font-weight:800;
        box-shadow:0 12px 30px rgba(0,0,0,.2);
      }
      #epdIntelPanel{
        position:fixed;
        right:18px;
        bottom:130px;
        width:min(720px,calc(100vw - 36px));
        max-height:78vh;
        overflow:auto;
        z-index:9999;
        background:#fff;
        color:#102033;
        border:1px solid #dbe5ef;
        border-radius:18px;
        box-shadow:0 30px 90px rgba(0,0,0,.25);
        padding:16px;
        display:none;
      }
      #epdIntelPanel h2{margin:0 0 8px}
      #epdIntelPanel h3{margin:14px 0 8px}
      #epdIntelPanel table{width:100%;border-collapse:collapse}
      #epdIntelPanel th,#epdIntelPanel td{border-bottom:1px solid #e5edf5;padding:8px;text-align:left;vertical-align:top}
      #epdIntelPanel textarea{width:100%;min-height:180px;border:1px solid #dbe5ef;border-radius:12px;padding:10px}
      #epdIntelPanel pre{background:#0b1220;color:#d9e8ff;border-radius:12px;padding:10px;white-space:pre-wrap;overflow:auto}
      .epd-ok{color:#067647;font-weight:800}
      .epd-bad{color:#b42318;font-weight:800}
      .epd-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
      .epd-actions button{border:1px solid #dbe5ef;border-radius:10px;background:#fff;padding:8px 10px;cursor:pointer}
      .epd-actions button.primary{background:#155eef;color:#fff;border-color:#155eef}
    `;
    document.head.appendChild(css);

    const btn = document.createElement("button");
    btn.id = "epdIntelButton";
    btn.textContent = "EPD Intel";
    btn.onclick = togglePanel;
    document.body.appendChild(btn);

    const panel = document.createElement("div");
    panel.id = "epdIntelPanel";
    document.body.appendChild(panel);

    renderPanel();
  }

  function togglePanel(){
    const p = document.getElementById("epdIntelPanel");
    if (!p) return;
    p.style.display = p.style.display === "block" ? "none" : "block";
    if (p.style.display === "block") renderPanel();
  }

  function renderPanel(){
    const panel = document.getElementById("epdIntelPanel");
    if (!panel) return;

    const report = getCompletionReport();

    const pageRows = Object.keys(pageMap).map(function(page){
      return "<tr><td><b>" + safeText(page) + "</b></td><td>" + pageMap[page].map(safeText).join("<br>") + "</td></tr>";
    }).join("");

    const checklistRows = report.items.map(function(item){
      return "<tr><td>" + safeText(item.name) + "</td><td class='" + (item.ok ? "epd-ok" : "epd-bad") + "'>" + (item.ok ? "OK" : "Lipsă") + "</td><td>" + safeText(item.detail) + "</td></tr>";
    }).join("");

    panel.innerHTML = `
      <h2>EPD Intelligent Layer</h2>
      <p>Modul inteligent separat. Nu rescrie aplicația principală.</p>

      <div class="epd-actions">
        <button onclick="window.epdIntelRefresh()">Reverifică</button>
        <button onclick="window.epdIntelCopyPrompt()">Copiază prompt inteligent</button>
        <button class="primary" onclick="window.epdIntelRunUpdate()">Run Update cu prompt inteligent</button>
        <button onclick="document.getElementById('epdIntelPanel').style.display='none'">Închide</button>
      </div>

      <h3>Scor proiect: ${report.score}%</h3>
      <p>State detectat: <b>${safeText(report.storageKey || "nedetectat")}</b></p>

      <h3>Checklist inteligent</h3>
      <table>
        <tr><th>Element</th><th>Status</th><th>Detalii</th></tr>
        ${checklistRows}
      </table>

      <h3>Funcții alocate pe pagini</h3>
      <table>
        <tr><th>Pagină</th><th>Funcții corespondente</th></tr>
        ${pageRows}
      </table>

      <h3>Prompt inteligent generat</h3>
      <textarea id="epdIntelPrompt">${safeText(buildPrompt())}</textarea>

      <h3>Rezultat Run Update</h3>
      <pre id="epdIntelResult">Nerulat încă.</pre>
    `;
  }

  async function runUpdate(){
    const prompt = document.getElementById("epdIntelPrompt") ? document.getElementById("epdIntelPrompt").value : buildPrompt();
    const out = document.getElementById("epdIntelResult");
    if (out) out.textContent = "Se rulează /api/update/run...";

    try {
      const response = await fetch("/api/update/run", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ text: prompt })
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { ok: response.ok, raw:text }; }

      if (out) out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      if (out) out.textContent = "Eroare: " + err.message;
    }
  }

  window.epdIntelRefresh = renderPanel;
  window.epdIntelRunUpdate = runUpdate;
  window.epdIntelCopyPrompt = async function(){
    const p = document.getElementById("epdIntelPrompt");
    if (!p) return;
    await navigator.clipboard.writeText(p.value);
    alert("Prompt inteligent copiat.");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensurePanel);
  } else {
    ensurePanel();
  }
})();
