import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Mail, Copy, AlertCircle } from 'lucide-react';

const TEMPLATES = [
  { id: 'oferta', label: 'Ofertare client', subject: 'Ofertă lucrare gaze — <beneficiar>', body: 'Bună ziua,\n\nVă transmitem oferta pentru lucrarea de la <adresa_lucrare>, <localitate>.\n\nEstimare cost: <estimare_cost> RON.\n\nCu stimă,\n<proiectant>', target: ['beneficiar'] },
  { id: 'date_lipsa', label: 'Solicitare date lipsă', subject: 'Solicitare date — contract <numar_contract>', body: 'Bună ziua,\n\nPentru a continua documentația lucrării <tip_lucrare> de la <adresa_lucrare>, vă rugăm să ne transmiteți datele lipsă.\n\nMulțumim.', target: ['beneficiar'] },
  { id: 'osd', label: 'Trimitere documentație OSD', subject: 'Documentație tehnică — <beneficiar> — <adresa_lucrare>', body: 'Către <osd>,\n\nAtașat găsiți documentația tehnică pentru lucrarea <tip_lucrare> de la <adresa_lucrare>, <localitate>, <judet>.\n\nContract: <numar_contract> din <data_contract>.\n\nCu stimă,\n<proiectant>', target: ['osd'] },
  { id: 'vgd', label: 'Trimitere către VGD', subject: 'Verificare documentație — <numar_contract>', body: 'Către <verificator_vgd>,\n\nVă rugăm să verificați documentația atașată pentru lucrarea <tip_lucrare>.\n\nDate tehnice principale:\n- Debit instalat: <debit_instalat> mc/h\n- Lungime branșament: <lungime_bransament> m\n- Diametru conductă: <diametru_conducta>\n\nMulțumim.', target: ['vgd'] },
  { id: 'rte', label: 'Trimitere către RTE', subject: 'Documentație execuție — <numar_contract>', body: 'Către <responsabil_rte>,\n\nVă transmitem documentația de execuție atașată pentru lucrarea de la <adresa_lucrare>.\n\nExecutant: <executant>.\n\nMulțumim.', target: ['rte'] },
  { id: 'complet', label: 'Confirmare documentație completă', subject: 'Documentație completă — <numar_contract>', body: 'Bună ziua,\n\nConfirmăm că documentația aferentă lucrării <tip_lucrare> de la <adresa_lucrare> este completă și avizată.\n\nCu stimă,\n<proiectant>', target: ['beneficiar', 'osd'] },
  { id: 'lipsuri', label: 'Notificare lipsuri documentație', subject: 'Lipsuri în documentație — <numar_contract>', body: 'Bună ziua,\n\nDocumentația prezentată conține următoarele lipsuri ce trebuie remediate:\n\n- [completați aici]\n\nVă rugăm să le remediați și să retransmiteți documentația.', target: ['proiectant', 'executant'] },
];

const RECIPIENT_LABELS = {
  beneficiar: 'Beneficiar', osd: 'OSD', proiectant: 'Proiectant', executant: 'Executant',
  vgd: 'VGD', rte: 'RTE', contabilitate: 'Contabilitate', ofertare: 'Ofertare', administrator: 'Administrator',
};

function replacePlaceholders(text, vars) {
  return text.replace(/<([a-z0-9_]+)>/g, (m, k) => vars[k] ?? m);
}

export default function EmailComposer() {
  const { user } = useAuth();
  const [project, setProject] = useState({});
  const [placeholders, setPlaceholders] = useState({});
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedTpl, setSelectedTpl] = useState(TEMPLATES[0].id);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [recipients, setRecipients] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(new Set(['beneficiar']));
  const [emailConfig, setEmailConfig] = useState({ configured: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: p }, { data: ph }, { data: dd }, { data: ec }] = await Promise.all([
          api.get('/project'),
          api.get('/project/placeholders'),
          api.get('/documents'),
          api.get('/users/me/email-config'),
        ]);
        setProject(p); setPlaceholders(ph); setDocs(dd); setEmailConfig(ec);
      } catch (err) {
        console.error('Email composer load failed:', err);
      }
    })();
  }, []);

  useEffect(() => {
    const tpl = TEMPLATES.find(t => t.id === selectedTpl);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(tpl.body);
    setSelectedRoles(new Set(tpl.target));
  }, [selectedTpl]);

  // Resolve recipient roles → actual email from project
  useEffect(() => {
    const emails = [];
    selectedRoles.forEach(role => {
      if (role === 'beneficiar' && project.email) emails.push(project.email);
      // For other roles we use proiectant/executant/vgd/rte name fields but no email available;
      // user can still type emails manually below.
    });
    setRecipients(emails.join(', '));
  }, [selectedRoles, project]);

  const resolvedSubject = replacePlaceholders(subject, placeholders);
  const resolvedBody = replacePlaceholders(body, placeholders);

  // Detect missing placeholders in current body/subject
  const missingTokens = [...new Set(
    [...resolvedSubject.matchAll(/<([a-z0-9_]+)>/g), ...resolvedBody.matchAll(/<([a-z0-9_]+)>/g)].map(m => m[1])
  )];

  const sendEmail = async () => {
    const list = recipients.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    if (!list.length) { toast.error('Adăugați cel puțin un destinatar'); return; }
    if (!selectedDoc) { toast.error('Selectați documentul atașat'); return; }
    setBusy(true);
    try {
      await api.post('/documents/email', { document_id: selectedDoc, recipients: list, subject: resolvedSubject, body: resolvedBody });
      toast.success('Email trimis');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare trimitere'); }
    finally { setBusy(false); }
  };

  const copyAll = async () => {
    const txt = `Către: ${recipients}\nSubiect: ${resolvedSubject}\n\n${resolvedBody}`;
    await navigator.clipboard.writeText(txt);
    toast.success('Copiat');
  };

  const mailto = () => {
    const list = recipients.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const url = `mailto:${list.join(',')}?subject=${encodeURIComponent(resolvedSubject)}&body=${encodeURIComponent(resolvedBody)}`;
    window.location.href = url;
  };

  return (
    <AppShell title="Email-uri" subtitle="Compunere email cu template-uri, destinatari pe rol și replace de placeholder-e">
      {!emailConfig.configured && (
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 p-4 mb-6 flex items-start gap-3" data-testid="gmail-not-config">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          <div className="text-sm text-[#DC2626]">
            Adresa Gmail nu este configurată. Mergeți la <a href="/settings" className="underline font-semibold">Setări</a> pentru a o adăuga. Veți putea totuși să folosiți butonul <strong>mailto</strong> pentru a deschide aplicația de email locală.
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template selector */}
        <div className="bg-white border border-gray-200 p-5 self-start lg:col-span-1">
          <div className="label mb-3">// Template email</div>
          <div className="space-y-1.5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelectedTpl(t.id)} className={`w-full text-left px-3 py-2 text-sm rounded-sm transition-colors ${selectedTpl === t.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`} data-testid={`tpl-${t.id}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="label mt-6 mb-3">// Destinatari (rol)</div>
          <div className="space-y-1">
            {Object.entries(RECIPIENT_LABELS).map(([id, lbl]) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedRoles.has(id)}
                  onChange={(e) => {
                    const next = new Set(selectedRoles);
                    e.target.checked ? next.add(id) : next.delete(id);
                    setSelectedRoles(next);
                  }}
                  className="accent-[#FFB300]"
                  data-testid={`role-${id}`}
                />
                {lbl}
              </label>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 space-y-4">
          <div>
            <label className="label block mb-1.5">Destinatari (separați prin virgulă)</label>
            <input value={recipients} onChange={(e) => setRecipients(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="email-recipients" />
          </div>
          <div>
            <label className="label block mb-1.5">Subiect (cu placeholder-e)</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm mono" data-testid="email-subject" />
            <div className="text-xs text-gray-500 mt-1">Previzualizare: <span className="font-medium text-gray-700">{resolvedSubject}</span></div>
          </div>
          <div>
            <label className="label block mb-1.5">Mesaj (cu placeholder-e)</label>
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm mono" data-testid="email-body" />
          </div>
          <div>
            <label className="label block mb-1.5">Atașament — Document generat</label>
            <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="email-doc-select">
              <option value="">— Selectați un document —</option>
              {docs.map(d => <option key={d.document_id} value={d.document_id}>{d.name}</option>)}
            </select>
          </div>

          {missingTokens.length > 0 && (
            <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-3 text-xs text-[#92400E]" data-testid="missing-tokens">
              <strong>Atenție:</strong> placeholder-e nerezolvate — completați Date proiect / Date tehnice:
              {missingTokens.map(t => <span key={t} className="mono ml-1 bg-white px-1 py-0.5">&lt;{t}&gt;</span>)}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="label mb-2">// Previzualizare finală</div>
            <div className="bg-[#F9FAFB] border border-gray-200 p-3 text-xs whitespace-pre-wrap font-mono max-h-40 overflow-y-auto" data-testid="email-preview">{resolvedBody}</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={sendEmail} disabled={busy} className="amber-btn disabled:opacity-50" data-testid="send-email-btn">
              <Mail className="w-4 h-4" /> {busy ? 'Se trimite...' : 'Trimite email'}
            </button>
            <button onClick={mailto} className="outline-btn text-sm py-2" data-testid="mailto-btn">Deschide în aplicația locală</button>
            <button onClick={copyAll} className="ghost-btn text-sm" data-testid="copy-email-btn"><Copy className="w-3.5 h-3.5" /> Copiază</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
