(function(){
  "use strict";

  function esc(v){
    return String(v ?? "").replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function setContent(html){
    if (typeof window.content === "function") {
      window.content(html);
      return;
    }
    const el = document.querySelector("#content") || document.querySelector(".content") || document.querySelector("main") || document.body;
    el.innerHTML = html;
  }

  async function api(url, options){
    const r = await fetch(url, options);
    return await r.json();
  }

  function valuesFromInputs(){
    const ids = [
      "beneficiar","adresa_lucrare","localitate","judet","telefon","email","osd","tip_lucrare",
      "proiectant","executant","debit_instalat","presiune_regim","diametru_conducta","material_conducta",
      "lungime_bransament","punct_racordare","contor","verificator_vgd","responsabil_rte"
    ];
    const v = {};
    ids.forEach(function(id){
      const el = document.getElementById("epd_" + id) || document.getElementById(id);
      if (el) v[id] = el.value || el.textContent || "";
    });
    return v;
  }

  function formFields(){
    const fields = [
      ["beneficiar","Beneficiar"],
      ["adresa_lucrare","Adresă lucrare"],
      ["localitate","Localitate"],
      ["judet","Județ"],
      ["email","Email"],
      ["osd","OSD"],
      ["tip_lucrare","Tip lucrare"],
      ["proiectant","Proiectant"],
      ["debit_instalat","Debit instalat"],
      ["presiune_regim","Presiune regim"],
      ["diametru_conducta","Diametru conductă"],
      ["lungime_bransament","Lungime branșament"]
    ];
    return '<div class="grid">' + fields.map(function(f){
      return '<label>' + esc(f[1]) + '<input id="epd_' + esc(f[0]) + '" placeholder="' + esc(f[1]) + '"></label>';
    }).join("") + '</div>';
  }

  function renderProductionAudit(){
    setContent('<div class="card"><h2>Audit interfață și funcții</h2><p>Se verifică paginile și funcțiile destinate, pornind de la Login.</p><pre id="epdProdAudit">Se încarcă...</pre></div>');
    api("/api/epd/production-audit").then(function(r){
      document.getElementById("epdProdAudit").textContent = JSON.stringify(r,null,2);
    }).catch(function(e){
      document.getElementById("epdProdAudit").textContent = String(e);
    });
  }

  async function renderPlans(){
    const r = await api("/api/epd/plans");
    const rows = (r.plans || []).map(function(p){
      return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.department) + '</td><td>' + esc(p.price) + ' ' + esc(r.currency) + '</td><td>' +
      esc((p.features || []).join(", ")) + '</td><td><button onclick="window.EPDProduction.purchasePlan(\'' + esc(p.id) + '\')">Purchasing</button></td></tr>';
    }).join("");

    setContent('<div class="card"><h2>Planuri departamente</h2><p>Alocare funcții și preț pentru fiecare rezultantă de plan.</p></div>' +
    '<div class="card"><table class="table"><tr><th>Plan</th><th>Departament</th><th>Preț</th><th>Funcții</th><th>Achiziție</th></tr>' + rows + '</table></div>');
  }

  async function purchasePlan(planId){
    const r = await api("/api/epd/purchase-intent", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({planId:planId})
    });
    alert(JSON.stringify(r,null,2));
  }

  async function renderDocumentGenerator(){
    const t = await api("/api/epd/document-templates");
    const opts = (t.templates || []).map(function(x){
      return '<option value="' + esc(x.id) + '">' + esc(x.name) + '</option>';
    }).join("");

    setContent('<div class="card"><h2>Generare documente cu placeholder-e</h2>' + formFields() +
      '<label>Template document<select id="epd_templateId">' + opts + '</select></label>' +
      '<div class="grid"><label>Ștampilă proiectant<textarea id="epd_stamp_proiectant" placeholder="[Ștampilă proiectant]"></textarea></label>' +
      '<label>Ștampilă VGD<textarea id="epd_stamp_vgd" placeholder="[Ștampilă VGD]"></textarea></label>' +
      '<label>Ștampilă RTE<textarea id="epd_stamp_rte" placeholder="[Ștampilă RTE]"></textarea></label></div>' +
      '<button class="primary" onclick="window.EPDProduction.generateDocument()">Generează document</button></div>' +
      '<div class="card"><h3>Rezultat</h3><pre id="epd_doc_result"></pre></div>');
  }

  async function generateDocument(){
    const values = valuesFromInputs();
    values.stamps = {
      proiectant: document.getElementById("epd_stamp_proiectant").value || "[Ștampilă proiectant]",
      vgd: document.getElementById("epd_stamp_vgd").value || "[Ștampilă VGD]",
      rte: document.getElementById("epd_stamp_rte").value || "[Ștampilă RTE]"
    };

    const r = await api("/api/epd/documents/generate", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        templateId: document.getElementById("epd_templateId").value,
        values: values
      })
    });

    document.getElementById("epd_doc_result").textContent = JSON.stringify(r,null,2);
  }

  function renderEmail(){
    setContent('<div class="card"><h2>Email-uri</h2>' + formFields() +
      '<label>Către<input id="epd_email_to" placeholder="email destinatar"></label>' +
      '<label>Subiect<input id="epd_email_subject" value="Documentație EPD - <beneficiar>"></label>' +
      '<label>Conținut<textarea id="epd_email_body">Bună ziua,\\n\\nVă transmitem documentația pentru <beneficiar>, lucrarea <tip_lucrare>.\\n\\nCu stimă,\\n<proiectant></textarea></label>' +
      '<button class="primary" onclick="window.EPDProduction.prepareEmail()">Pregătește / trimite email</button></div>' +
      '<div class="card"><h3>Rezultat</h3><pre id="epd_email_result"></pre></div>');
  }

  async function prepareEmail(){
    const values = valuesFromInputs();
    const r = await api("/api/epd/email/prepare", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        values: values,
        to: document.getElementById("epd_email_to").value || values.email || "",
        subject: document.getElementById("epd_email_subject").value,
        body: document.getElementById("epd_email_body").value
      })
    });

    document.getElementById("epd_email_result").textContent = JSON.stringify(r,null,2);

    if (r.mailto) {
      if (confirm("Deschid clientul de email pentru trimitere?")) {
        window.location.href = r.mailto;
      }
    }
  }

  function renderSignatures(){
    setContent('<div class="card"><h2>Certificare digitală semnături</h2>' +
      '<p>Workflow intern demonstrabil pentru semnături Proiectant / VGD / RTE. Pentru semnătură calificată legală se conectează provider eIDAS.</p>' +
      '<div class="grid"><label>Rol<select id="epd_sig_role"><option>proiectant</option><option>vgd</option><option>rte</option></select></label>' +
      '<label>Semnatar<input id="epd_sig_signer" placeholder="Nume semnatar"></label>' +
      '<label>Document<input id="epd_sig_doc" placeholder="Titlu document"></label></div>' +
      '<button class="primary" onclick="window.EPDProduction.certifySignature()">Certifică intern</button></div>' +
      '<div class="card"><h3>Certificat</h3><pre id="epd_sig_result"></pre></div>');
  }

  async function certifySignature(){
    const r = await api("/api/epd/signatures/certify", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        role: document.getElementById("epd_sig_role").value,
        signer: document.getElementById("epd_sig_signer").value,
        documentTitle: document.getElementById("epd_sig_doc").value
      })
    });

    document.getElementById("epd_sig_result").textContent = JSON.stringify(r,null,2);
  }

  function renderAssistant(){
    setContent('<div class="card"><h2>Asistent comenzi</h2>' +
      '<textarea id="epd_cmd" placeholder="Ex: generează document cu placeholdere și ștampilă VGD"></textarea>' +
      '<button class="primary" onclick="window.EPDProduction.runCommand()">Execută comandă</button></div>' +
      '<div class="card"><h3>Răspuns</h3><pre id="epd_cmd_result"></pre></div>');
  }

  async function runCommand(){
    const r = await api("/api/epd/assistant/command", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({text:document.getElementById("epd_cmd").value})
    });
    document.getElementById("epd_cmd_result").textContent = JSON.stringify(r,null,2);
  }

  function button(label, fn){
    const b = document.createElement("button");
    b.textContent = label;
    b.className = "epd-prod-nav";
    b.onclick = fn;
    return b;
  }

  function injectNav(){
    if (document.querySelector("[data-epd-prod-nav='1']")) return;

    const nav = document.querySelector(".sidebar") || document.querySelector("aside") || document.querySelector("nav") || document.body;

    const box = document.createElement("div");
    box.setAttribute("data-epd-prod-nav","1");
    box.style.display = "grid";
    box.style.gap = "6px";
    box.style.marginTop = "12px";

    const title = document.createElement("div");
    title.textContent = "Production";
    title.style.fontWeight = "700";
    title.style.padding = "6px 8px";

    box.appendChild(title);
    box.appendChild(button("Audit interfață", renderProductionAudit));
    box.appendChild(button("Generare documente", renderDocumentGenerator));
    box.appendChild(button("Email-uri", renderEmail));
    box.appendChild(button("Semnături digitale", renderSignatures));
    box.appendChild(button("Asistent comenzi", renderAssistant));
    box.appendChild(button("Planuri departamente", renderPlans));

    nav.appendChild(box);
  }

  function wrapOpenPage(){
    if (window.__epdProductionWrapped) return;
    window.__epdProductionWrapped = true;

    const old = window.openPage;

    window.openPage = function(page){
      if (page === "Audit interfață") return renderProductionAudit();
      if (page === "Generare documente") return renderDocumentGenerator();
      if (page === "Email-uri Production") return renderEmail();
      if (page === "Semnături digitale") return renderSignatures();
      if (page === "Asistent comenzi") return renderAssistant();
      if (page === "Planuri departamente") return renderPlans();
      if (typeof old === "function") return old.apply(this, arguments);
    };
  }

  function init(){
    wrapOpenPage();
    injectNav();
  }

  window.EPDProduction = {
    init,
    renderProductionAudit,
    renderPlans,
    purchasePlan,
    renderDocumentGenerator,
    generateDocument,
    renderEmail,
    prepareEmail,
    renderSignatures,
    certifySignature,
    renderAssistant,
    runCommand
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  setTimeout(init, 800);
  setTimeout(init, 2000);
})();
