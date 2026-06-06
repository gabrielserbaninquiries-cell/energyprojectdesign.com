import { useEffect, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Upload, Trash2, ShieldCheck } from 'lucide-react';

export default function Certificates() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const load = async () => {
    const { data } = await api.get('/certificates');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('password', password);
    fd.append('name', name || file.name);
    try {
      await api.post('/certificates/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Certificat adăugat');
      setShowUpload(false); setFile(null); setName(''); setPassword('');
      await load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ștergeți acest certificat?')) return;
    await api.delete(`/certificates/${id}`);
    toast.success('Șters'); await load();
  };

  return (
    <AppShell title="Certificate digitale">
      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="label mb-2">// PKCS#12 / eIDAS</div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">Certificat <span className="mono text-base">.p12</span> / <span className="mono text-base">.pfx</span></h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Importați certificatul calificat emis de furnizorul dvs. de servicii (certSIGN, DigiSign, Trans Sped etc.). Parola este folosită doar la momentul semnării, nu este stocată în clar.
            </p>
          </div>
          <button onClick={() => setShowUpload(true)} className="amber-btn" data-testid="add-cert-btn">
            <Upload className="w-4 h-4" /> Adaugă certificat
          </button>
        </div>
      </div>

      {showUpload && (
        <form onSubmit={onUpload} className="bg-white border border-gray-200 p-8 mb-8 space-y-4" data-testid="cert-upload-form">
          <h3 className="font-semibold">Certificat nou</h3>
          <div>
            <label className="label block mb-2">Fișier (.p12 / .pfx)</label>
            <input required type="file" accept=".p12,.pfx" onChange={e=>setFile(e.target.files?.[0])} className="block text-sm" data-testid="cert-file" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-2">Etichetă</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" placeholder="Ex: Certificat firmă" data-testid="cert-name" />
            </div>
            <div>
              <label className="label block mb-2">Parolă</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="cert-upload-password" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="amber-btn" data-testid="cert-submit">{busy ? 'Se încarcă...' : 'Adaugă'}</button>
            <button type="button" onClick={() => setShowUpload(false)} className="ghost-btn">Anulează</button>
          </div>
        </form>
      )}

      <div className="label mb-4">// Certificate ({items.length})</div>
      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Niciun certificat încărcat.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-px bg-gray-200 border border-gray-200" data-testid="certificates-list">
          {items.map((c) => (
            <div key={c.cert_id} className="bg-white p-6" data-testid={`cert-${c.cert_id}`}>
              <div className="flex items-start justify-between mb-3">
                <ShieldCheck className="w-6 h-6 text-[#FFB300]" />
                <button onClick={() => onDelete(c.cert_id)} className="text-gray-400 hover:text-[#DC2626]"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className="font-semibold mb-2">{c.name}</h3>
              <dl className="text-xs space-y-1 mono">
                <div><span className="text-gray-500">Subject: </span><span className="break-all">{c.subject}</span></div>
                <div><span className="text-gray-500">Issuer: </span><span className="break-all">{c.issuer}</span></div>
                <div><span className="text-gray-500">Valid: </span>{new Date(c.valid_from).toLocaleDateString('ro-RO')} → {new Date(c.valid_to).toLocaleDateString('ro-RO')}</div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
