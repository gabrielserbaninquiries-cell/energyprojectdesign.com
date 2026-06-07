import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api, { API } from '../lib/api';
import { toast } from 'sonner';
import { Mail, Download, ShieldCheck } from 'lucide-react';

export default function TemplateEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tpl, setTpl] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [certs, setCerts] = useState([]);
  const [values, setValues] = useState({});
  const [stampId, setStampId] = useState('');
  const [position, setPosition] = useState('bottom-right');
  const [sizeCm, setSizeCm] = useState(4);
  const [certId, setCertId] = useState('');
  const [certPwd, setCertPwd] = useState('');
  const [docName, setDocName] = useState('');
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState(null);

  // email
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('Document de la Energy Project Design');
  const [body, setBody] = useState('Bună ziua,\n\nVă transmitem documentul atașat.\n\nCu stimă,');

  useEffect(() => {
    (async () => {
      try {
        const [t, s, c] = await Promise.all([
          api.get(`/templates/${id}`), api.get('/stamps'), api.get('/certificates'),
        ]);
        setTpl(t.data); setStamps(s.data); setCerts(c.data);
        const init = {};
        t.data.placeholders.forEach((p) => { init[p] = ''; });
        setValues(init);
        setDocName(t.data.name.replace(/\.docx$/i, ''));
      } catch {
        toast.error('Șablon negăsit');
        nav('/templates');
      }
    })();
  }, [id, nav]);

  const onGenerate = async () => {
    setBusy(true);
    try {
      const payload = {
        template_id: id,
        values,
        stamp_id: stampId || null,
        stamp_position: position,
        stamp_size_cm: Number(sizeCm),
        cert_id: certId || null,
        cert_password: certId ? certPwd : null,
        document_name: docName,
      };
      const { data } = await api.post('/documents/generate', payload);
      toast.success('Document generat');
      setGenerated(data);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare generare');
    } finally { setBusy(false); }
  };

  const download = () => {
    const token = localStorage.getItem('auth_token') || '';
    const url = `${API}/documents/${generated.document_id}/download`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' })
      .then(r => r.blob())
      .then(b => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = generated.name;
        a.click();
      });
  };

  const sendEmail = async () => {
    const list = recipients.split(/[,\s;]+/).map(s => s.trim()).filter(Boolean);
    if (!list.length) { toast.error('Adăugați cel puțin un destinatar'); return; }
    try {
      await api.post('/documents/email', { document_id: generated.document_id, recipients: list, subject, body });
      toast.success('Email trimis cu succes');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare la trimitere');
    }
  };

  if (!tpl) return <AppShell title="Editor"><div className="text-sm text-gray-500">Se încarcă…</div></AppShell>;

  return (
    <AppShell title={`Generare: ${tpl.name}`}>
      <div className="grid lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
        {/* Fields */}
        <div className="lg:col-span-2 bg-white p-8">
          <div className="label mb-4">// Completați câmpurile ({tpl.placeholders.length})</div>
          {tpl.placeholders.length === 0 ? (
            <div className="text-sm text-gray-500">Acest șablon nu conține variabile. Documentul va fi generat ca atare.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {tpl.placeholders.map((p) => (
                <div key={p}>
                  <label className="label block mb-1.5">{p.replace(/_/g, ' ')}</label>
                  <input
                    data-testid={`field-${p}`}
                    value={values[p] || ''}
                    onChange={(e) => setValues({ ...values, [p]: e.target.value })}
                    className="w-full border border-gray-300 bg-white px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="label mt-8 mb-3">// Detalii document</div>
          <input value={docName} onChange={e=>setDocName(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 text-sm rounded-sm" placeholder="Nume document final" data-testid="doc-name-input" />
        </div>

        {/* Sidebar: stamp + cert */}
        <div className="bg-white p-8 space-y-6">
          <div>
            <div className="label mb-3">// Ștampilă</div>
            <select value={stampId} onChange={e=>setStampId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="stamp-select">
              <option value="">— Fără ștampilă —</option>
              {stamps.map(s => <option key={s.stamp_id} value={s.stamp_id}>{s.name}</option>)}
            </select>
            {stampId && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select value={position} onChange={e=>setPosition(e.target.value)} className="border border-gray-300 px-2 py-2 text-xs rounded-sm bg-white" data-testid="stamp-position">
                  <option value="top-left">Sus stânga</option>
                  <option value="top-right">Sus dreapta</option>
                  <option value="bottom-left">Jos stânga</option>
                  <option value="bottom-right">Jos dreapta</option>
                  <option value="center">Centrat</option>
                </select>
                <input type="number" min="2" max="10" step="0.5" value={sizeCm} onChange={e=>setSizeCm(e.target.value)} className="border border-gray-300 px-2 py-2 text-xs rounded-sm" placeholder="cm" />
              </div>
            )}
          </div>

          <div>
            <div className="label mb-3">// Semnătură PKI</div>
            <select value={certId} onChange={e=>setCertId(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="cert-select">
              <option value="">— Fără semnătură —</option>
              {certs.map(c => <option key={c.cert_id} value={c.cert_id}>{c.name}</option>)}
            </select>
            {certId && (
              <input type="password" value={certPwd} onChange={e=>setCertPwd(e.target.value)} placeholder="Parolă certificat" className="mt-3 w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="cert-password" />
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
              <ShieldCheck className="w-3.5 h-3.5" /> CMS detașat .p7s (SHA-256)
            </div>
          </div>

          <button onClick={onGenerate} disabled={busy} className="amber-btn w-full disabled:opacity-50" data-testid="generate-btn">
            {busy ? 'Se generează...' : 'Generează document'}
          </button>

          {generated && (
            <div className="bg-[#F9FAFB] border border-gray-200 p-4 space-y-2">
              <div className="text-xs uppercase tracking-wider text-[#16A34A] font-semibold">✓ Generat</div>
              <div className="text-sm font-medium truncate">{generated.name}</div>
              <button onClick={download} className="outline-btn w-full text-sm py-2" data-testid="download-doc-btn"><Download className="w-4 h-4" /> Descarcă</button>
            </div>
          )}
        </div>
      </div>

      {/* Email panel */}
      {generated && (
        <div className="mt-8 bg-white border border-gray-200 p-8" data-testid="email-panel">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5" />
            <h3 className="font-semibold">Trimite pe email</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <input value={recipients} onChange={e=>setRecipients(e.target.value)} placeholder="email1@x.ro, email2@y.ro" className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="email-recipients" />
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subiect" className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="email-subject" />
          </div>
          <textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} className="mt-4 w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="email-body" />
          <button onClick={sendEmail} className="amber-btn mt-4" data-testid="send-email-btn">Trimite email</button>
        </div>
      )}
    </AppShell>
  );
}
