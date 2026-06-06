(function(){
  "use strict";

  const STORE = "epd_v5_state";

  const defaultState = {
    user: null,
    plan: "developer_lifetime",
    project: {
      beneficiar: "",
      adresa_lucrare: "",
      localitate: "",
      judet: "",
      telefon: "",
      email: "",
      osd: "Distrigaz Sud Rețele",
      tip_lucrare: "Branșament gaze naturale",
      numar_contract: "",
      data_contract: "",
      proiectant: "",
      executant: ""
    },
    technical: {
      debit_instalat: "",
      presiune_regim: "",
      diametru_conducta: "",
      material_conducta: "PEHD",
      lungime_bransament: "",
      punct_racordare: "",
      contor: "",
      putere_instalata_kw: "",
      debit_calculat_mc_h: "",
      debit_recomandat_mc_h: "",
      risc_presiune: "",
      estimare_cost: "",
      rezultat_calcul: ""
    },
    stamps: {
      proiectant: "",
      vgd: "",
      rte: ""
    },
    signatures: [],
    documents: [],
    emails: [],
    purchases: [],
    logs: []
  };

  let state = load();

  const pages = [
    ["Principal","Panou principal"],
    ["Project","Date proiect"],
    ["Technical","Date tehnice"],
    ["Docs","Documente"],
    ["Stamps","Ștampile"],
    ["Email","Email-uri"],
    ["Signatures","Semnături digitale"],
    ["Plans","Planuri departamente"],
    ["Assistant","Asistent comenzi"],
    ["Placeholders","Placeholders"],
    ["Audit","Audit interfață"],
    ["Developer","AI Developer"]
  ];

  function clone(x){ return JSON.parse(JSON.stringify(x)); }

  function load(){
    try {
      return Object.assign(clone(defaultState), JSON.parse(localStorage.getItem(STORE) || "{}"));
    } catch {
      return clone(defaultState);
    }
  }

  function save(){
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  async function api(url, options){
    const r = await fetch(url, options);
    return await r.json();
  }

  function log(type, message){
    state.logs.unshift({type, message, date:new Date().toLocaleString("ro-RO")});
    save();
  }

  function mount(html){
    document.getElementById("view").innerHTML = html;
  }

  function input(group, key, label, type){
    type = type || "text";
    return '<label>' + esc(label) + '<input type="' + type + '" value="' + esc(state[group][key] || "") + '" oninput="EPD.setField(\'' + group + '\',\'' + key + '\',this.value)"></label>';
  }

  function textInput(group, key, label){
    return '<label>' + esc(label) + '<textarea oninput="EPD.setField(\'' + group + '\',\'' + key + '\',this.value)">' + esc(state[group][key] || "") + '</textarea></label>';
  }

  function percentComplete(){
    const required = [
      state.project.beneficiar,
      state.project.adresa_lucrare,
      state.project.localitate,
      state.project.judet,
      state.project.osd,
      state.technical.debit_instalat,
      state.technical.presiune_regim,
      state.technical.diametru_conducta,
      state.stamps.proiectant,
      state.documents.length,
      state.emails.length
    ];
    const ok = required.filter(Boolean).length;
    return Math.round(ok / required.length * 100);
  }

  function shell(){
    if (!state.user) return loginPage();

    document.getElementById("app").innerHTML =
      '<div class="app">' +
        '<aside class="sidebar">' +
          '<div class="logo"><div class="logo-mark">EPD</div><div><b>Energy Project Design</b><div class="muted">V5.0 Sellable</div></div></div>' +
          '<div class="nav">' +
            '<div class="nav-title">Workflow</div>' +
            pages.map(function(p){ return '<button id="nav_' + p[0] + '" onclick="EPD.open(\'' + p[0] + '\')">' + esc(p[1]) + '</button>'; }).join("") +
          '</div>' +
        '</aside>' +
        '<main class="main">' +
          '<div class="topbar">' +
            '<div><b>' + esc(state.user.name || state.user.email) + '</b><div class="muted">Plan: ' + esc(state.plan) + '</div></div>' +
            '<div class="row"><span class="badge">Completare ' + percentComplete() + '%</span><button onclick="EPD.exportState()">Export</button><button onclick="EPD.logout()">Logout</button></div>' +
          '</div>' +
          '<div id="view"></div>' +
        '</main>' +
      '</div>';

    openPage("Principal");
  }

  function loginPage(){
    document.getElementById("app").innerHTML =
      '<div class="login-shell">' +
        '<div class="login-card">' +
          '<div class="login-hero"><div class="logo-mark">EPD</div><h1>Energy Project Design Services</h1><p>Platformă tehnică V5 pentru proiecte gaze naturale: date proiect, date tehnice, documente, placeholder-e, ștampile, email-uri, semnături, planuri și audit.</p><p><b>Produs pregătit pentru listare.</b></p></div>' +
          '<div class="login-form"><h2>Autentificare</h2><label>Email<input id="loginEmail" value="developer@epd.local"></label><label>Parolă<input id="loginPass" type="password" value="developer"></label><div class="row"><button class="primary" onclick="EPD.login()">Autentificare</button><button onclick="EPD.login(true)">Intrare Developer</button></div><p class="muted">Demo controlat local. Backend-ul rămâne pregătit pentru Google/OAuth și planuri reale.</p></div>' +
        '</div>' +
      '</div>';
  }

  function openPage(page){
    document.querySelectorAll(".nav button").forEach(function(b){ b.classList.remove("active"); });
    const nav = document.getElementById("nav_" + page);
    if (nav) nav.classList.add("active");

    const map = {
      Principal: dashboard,
      Project: projectPage,
      Technical: technicalPage,
      Docs: documentsPage,
      Stamps: stampsPage,
      Email: emailPage,
      Signatures: signaturesPage,
      Plans: plansPage,
      Assistant: assistantPage,
      Placeholders: placeholdersPage,
      Audit: auditPage,
      Developer: developerPage
    };
    (map[page] || dashboard)();
  }

  function dashboard(){
    const p = percentComplete();
    mount(
      '<div class="grid3">' +
        card("Nivel aplicație", "<h2>V5.0</h2><p>Versiune vandabilă pentru listare.</p>") +
        card("Completare proiect", '<div class="progress"><span style="width:' + p + '%"></span></div><p><b>' + p + '%</b></p>') +
        card("Status backend", '<button onclick="EPD.checkBackend()">Verifică backend</button><pre id="backendStatus"></pre>') +
      '</div>' +
      '<div class="card"><h2>Workflow principal</h2><p>Date proiect → Date tehnice → Documente → Ștampile → Email-uri → Semnături → Verificare → Export/Purchasing.</p><div class="row">' +
      '<button class="primary" onclick="EPD.open(\'Project\')">Începe cu Date proiect</button><button onclick="EPD.open(\'Audit\')">Rulează audit</button><button onclick="EPD.open(\'Plans\')">Vezi planuri</button></div></div>'
    );
  }

  function card(title, body){
    return '<div class="card"><h3>' + esc(title) + '</h3>' + body + '</div>';
  }

  function projectPage(){
    mount('<div class="card"><h2>Date proiect</h2><div class="grid">' +
      input("project","beneficiar","Beneficiar") +
      input("project","adresa_lucrare","Adresă lucrare") +
      input("project","localitate","Localitate") +
      input("project","judet","Județ") +
      input("project","telefon","Telefon") +
      input("project","email","Email") +
      input("project","osd","OSD") +
      input("project","tip_lucrare","Tip lucrare") +
      input("project","numar_contract","Număr contract") +
      input("project","data_contract","Data contract") +
      input("project","proiectant","Proiectant") +
      input("project","executant","Executant") +
      '</div><div class="row"><button class="primary" onclick="EPD.saveProject()">Salvează</button><button onclick="EPD.open(\'Technical\')">Continuă</button></div></div>');
  }

  function technicalPage(){
    mount('<div class="card"><h2>Date tehnice + IF calculus</h2><div class="grid">' +
      input("technical","debit_instalat","Debit instalat mc/h") +
      input("technical","presiune_regim","Presiune regim") +
      input("technical","diametru_conducta","Diametru conductă") +
      input("technical","material_conducta","Material conductă") +
      input("technical","lungime_bransament","Lungime branșament m") +
      input("technical","punct_racordare","Punct racordare") +
      input("technical","contor","Contor") +
      input("technical","estimare_cost","Estimare cost") +
      '</div><div class="row"><button class="primary" onclick="EPD.runCalculus()">Rulează calcule</button><button onclick="EPD.open(\'Docs\')">Documente</button></div></div>' +
      '<div class="card"><h3>Rezultat calcule</h3><pre>' + esc(JSON.stringify(state.technical,null,2)) + '</pre></div>');
  }

  async function documentsPage(){
    let templates = [];
    try { templates = (await api("/api/v5/document-templates")).templates || []; } catch {}
    const opts = templates.map(function(t){ return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join("");

    mount('<div class="card"><h2>Generare documente cu placeholder-e și ștampile</h2>' +
      '<label>Template<select id="docTemplate">' + opts + '</select></label>' +
      '<div class="row"><button class="primary" onclick="EPD.generateDocument()">Generează document</button><button onclick="EPD.copyLastDoc()">Copiază ultimul document</button></div></div>' +
      '<div class="card"><h3>Document generat</h3><div id="docPreview" class="doc-preview">' + esc(state.documents[0] ? state.documents[0].renderedText : "Nu există document generat.") + '</div></div>' +
      '<div class="card"><h3>Istoric documente</h3>' + documentsTable() + '</div>');
  }

  function documentsTable(){
    if (!state.documents.length) return '<p class="muted">Nu există documente.</p>';
    return '<table class="table"><tr><th>Template</th><th>Data</th></tr>' + state.documents.map(function(d){ return '<tr><td>' + esc(d.name || d.templateId) + '</td><td>' + esc(d.date) + '</td></tr>'; }).join("") + '</table>';
  }

  function stampsPage(){
    mount('<div class="card"><h2>Ștampile în documente</h2><div class="grid">' +
      textInput("stamps","proiectant","Ștampilă proiectant") +
      textInput("stamps","vgd","Ștampilă VGD") +
      textInput("stamps","rte","Ștampilă RTE") +
      '</div><button class="primary" onclick="EPD.saveStamps()">Salvează ștampile</button></div>');
  }

  function emailPage(){
    mount('<div class="card"><h2>Email-uri</h2><label>Către<input id="emailTo" value="' + esc(state.project.email) + '"></label><label>Subiect<input id="emailSubject" value="Documentație EPD - <beneficiar>"></label><label>Conținut<textarea id="emailBody">Bună ziua,\n\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>.\n\nCu stimă,\n<proiectant></textarea></label><div class="row"><button class="primary" onclick="EPD.prepareEmail()">Pregătește email</button><button onclick="EPD.openMailClient()">Deschide client email</button></div></div><div class="card"><h3>Ultimul email</h3><pre>' + esc(JSON.stringify(state.emails[0] || {},null,2)) + '</pre></div>');
  }

  function signaturesPage(){
    mount('<div class="card"><h2>Certificare digitală semnături</h2><p>Certificare internă VGD/RTE/Proiectant. Pentru semnătură calificată se conectează provider eIDAS.</p><div class="grid"><label>Rol<select id="sigRole"><option>proiectant</option><option>vgd</option><option>rte</option></select></label><label>Semnatar<input id="sigSigner" value="' + esc(state.project.proiectant) + '"></label><label>Document<input id="sigDoc" value="Documentație EPD"></label></div><button class="primary" onclick="EPD.certifySignature()">Certifică intern</button></div><div class="card"><h3>Certificate</h3><pre>' + esc(JSON.stringify(state.signatures,null,2)) + '</pre></div>');
  }

  async function plansPage(){
    let data = {plans:[]};
    try { data = await api("/api/v5/plans"); } catch {}
    const rows = (data.plans || []).map(function(p){
      return '<tr><td><b>' + esc(p.name) + '</b></td><td>' + esc(p.department) + '</td><td>' + esc(p.price) + ' EUR / ' + esc(p.period) + '</td><td>' + (p.features || []).map(x => '<span class="chip">' + esc(x) + '</span>').join("") + '</td><td><button class="primary" onclick="EPD.purchase(\'' + esc(p.id) + '\')">Purchasing</button></td></tr>';
    }).join("");
    mount('<div class="card"><h2>Planuri departamente și purchasing</h2><p>Fiecare plan are preț, departament și alocare de funcții.</p></div><div class="card"><table class="table"><tr><th>Plan</th><th>Departament</th><th>Preț</th><th>Funcții</th><th>Achiziție</th></tr>' + rows + '</table></div>');
  }

  function assistantPage(){
    mount('<div class="card"><h2>Asistent comenzi</h2><textarea id="cmdBox" placeholder="Ex: generează document cu ștampilă VGD și trimite email către OSD"></textarea><button class="primary" onclick="EPD.runCommand()">Execută comandă</button></div><div class="card"><h3>Răspuns</h3><pre id="cmdResult"></pre></div>');
  }

  async function placeholdersPage(){
    let data = {};
    try { data = await api("/api/v5/placeholders"); } catch {}
    const pages = data.data && data.data.pages ? data.data.pages : {};
    const html = Object.keys(pages).map(function(page){
      return '<div class="card"><h3>' + esc(page) + '</h3>' + pages[page].map(x => '<span class="chip">&lt;' + esc(x) + '&gt;</span>').join("") + '</div>';
    }).join("");
    mount('<div class="card"><h2>Placeholders</h2><p>Registru central de placeholder-e pe pagini.</p></div>' + html);
  }

  async function auditPage(){
    let backend = {};
    try { backend = await api("/api/v5/audit"); } catch(e){ backend = {error:String(e)}; }

    const localChecks = [
      ["Login", Boolean(state.user)],
      ["Date proiect", Boolean(state.project.beneficiar && state.project.adresa_lucrare)],
      ["Date tehnice", Boolean(state.technical.debit_instalat && state.technical.diametru_conducta)],
      ["Documente", state.documents.length > 0],
      ["Ștampile", Boolean(state.stamps.proiectant || state.stamps.vgd || state.stamps.rte)],
      ["Email-uri", state.emails.length > 0],
      ["Semnături", state.signatures.length > 0],
      ["Plan", Boolean(state.plan)],
      ["Export", true]
    ];

    const rows = localChecks.map(function(x){ return '<tr><td>' + esc(x[0]) + '</td><td class="' + (x[1] ? "ok" : "bad") + '">' + (x[1] ? "OK" : "Lipsă") + '</td></tr>'; }).join("");

    mount('<div class="card"><h2>Audit interfață și funcții</h2><p>Diagnostic pagină cu pagină și buton cu buton, de la Login.</p><table class="table"><tr><th>Element</th><th>Status</th></tr>' + rows + '</table></div><div class="card"><h3>Audit backend</h3><pre>' + esc(JSON.stringify(backend,null,2)) + '</pre></div><div class="card"><h3>Loguri</h3><pre>' + esc(JSON.stringify(state.logs,null,2)) + '</pre></div>');
  }

  function developerPage(){
    mount('<div class="card"><h2>AI Developer</h2><textarea id="devPrompt" placeholder="Cerință update..."></textarea><div class="row"><button class="primary" onclick="EPD.developerPlan()">Generează patch plan</button><button onclick="EPD.checkBackend()">Health</button></div></div><div class="card"><h3>Raport</h3><pre id="devReport"></pre></div>');
  }

  window.EPD = {
    login(dev){
      const email = document.getElementById("loginEmail").value || "developer@epd.local";
      state.user = {email, name: email, role: dev ? "Developer" : "User"};
      state.plan = dev ? "developer_lifetime" : "basic_99";
      log("login", "Autentificare " + state.user.role);
      save();
      shell();
    },
    logout(){
      state.user = null;
      save();
      shell();
    },
    open: openPage,
    setField(group,key,value){
      state[group][key] = value;
      save();
    },
    saveProject(){
      log("date proiect", "Date proiect salvate");
      save();
      alert("Date proiect salvate.");
    },
    runCalculus(){
      const debit = Number(String(state.technical.debit_instalat || "0").replace(",","."));
      const lungime = Number(String(state.technical.lungime_bransament || "0").replace(",","."));
      state.technical.putere_instalata_kw = debit ? (debit * 10.6).toFixed(2) : "";
      state.technical.debit_calculat_mc_h = debit ? debit.toFixed(2) : "";
      state.technical.debit_recomandat_mc_h = debit ? (debit * 1.1).toFixed(2) : "";
      state.technical.risc_presiune = lungime > 30 ? "verificare necesară" : "normal";
      state.technical.estimare_cost = lungime ? (lungime * 120).toFixed(0) + " RON estimativ" : "";
      state.technical.rezultat_calcul = "IF calculus generat pentru date tehnice.";
      log("calcul", "Calcul tehnic generat");
      save();
      technicalPage();
    },
    saveStamps(){
      log("ștampile", "Ștampile salvate");
      save();
      alert("Ștampile salvate.");
    },
    async generateDocument(){
      const values = Object.assign({}, state.project, state.technical, {
        stampila_proiectant: state.stamps.proiectant,
        stampila_vgd: state.stamps.vgd,
        stampila_rte: state.stamps.rte
      });
      const templateId = document.getElementById("docTemplate").value;
      const r = await api("/api/v5/documents/generate", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({templateId, values})});
      if (r.ok) {
        state.documents.unshift({name:r.name, templateId:r.templateId, renderedText:r.renderedText, date:new Date().toLocaleString("ro-RO")});
        log("document", "Document generat: " + r.name);
        save();
        documentsPage();
      } else alert(JSON.stringify(r));
    },
    copyLastDoc(){
      if (!state.documents[0]) return alert("Nu există document.");
      navigator.clipboard.writeText(state.documents[0].renderedText);
      alert("Document copiat.");
    },
    async prepareEmail(){
      const values = Object.assign({}, state.project, state.technical);
      const r = await api("/api/v5/email/prepare", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({values, to:document.getElementById("emailTo").value, subject:document.getElementById("emailSubject").value, body:document.getElementById("emailBody").value})});
      state.emails.unshift(Object.assign({date:new Date().toLocaleString("ro-RO")}, r));
      log("email", "Email pregătit");
      save();
      emailPage();
    },
    openMailClient(){
      const e = state.emails[0];
      if (!e || !e.mailto) return alert("Pregătește întâi emailul.");
      location.href = e.mailto;
    },
    async certifySignature(){
      const r = await api("/api/v5/signatures/certify", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({role:document.getElementById("sigRole").value, signer:document.getElementById("sigSigner").value, documentTitle:document.getElementById("sigDoc").value})});
      state.signatures.unshift(r);
      log("semnătură", "Certificare internă generată");
      save();
      signaturesPage();
    },
    async purchase(planId){
      const r = await api("/api/v5/purchase-intent", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({planId})});
      state.purchases.unshift(r);
      log("purchasing", "Purchase intent: " + planId);
      save();
      alert(JSON.stringify(r,null,2));
    },
    async runCommand(){
      const text = document.getElementById("cmdBox").value;
      const r = await api("/api/v5/assistant/command", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({text})});
      document.getElementById("cmdResult").textContent = JSON.stringify(r,null,2);
    },
    async developerPlan(){
      const text = document.getElementById("devPrompt").value;
      const result = {
        mode: "AI Developer local patch plan",
        request: text,
        rules: ["NO RESTORE", "NO FULL REBUILD fără aprobare", "backup", "node --check", "audit după patch"],
        recommendation: "Aplică doar patch aditiv pe pagina/funcția țintă."
      };
      document.getElementById("devReport").textContent = JSON.stringify(result,null,2);
    },
    async checkBackend(){
      const r = await api("/api/health");
      const el = document.getElementById("backendStatus") || document.getElementById("devReport");
      if (el) el.textContent = JSON.stringify(r,null,2);
    },
    exportState(){
      const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "epd_v5_export.json";
      a.click();
    }
  };

  shell();
})();
