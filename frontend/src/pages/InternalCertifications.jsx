import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { BadgeCheck, ShieldAlert, Hash } from 'lucide-react';

const ROLES = [
  { id: 'proiectant', label: 'Proiectant' },
  { id: 'executant', label: 'Executant' },
  { id: 'vgd', label: 'Verificator VGD' },
  { id: 'rte', label: 'Responsabil RTE' },
  { id: 'societate', label: 'Societate' },
];

export default function InternalCertifications() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ role: 'proiectant', signer_name: '', document_title: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await api.get('/certifications');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.signer_name.trim() || !form.document_title.trim()) {
      toast.error('Completați nume semnatar și titlu document'); return;
    }
    setBusy(true);
    try {
      await api.post('/certifications', form);
      toast.success('Certificare creată');
      setForm({ ...form, signer_name: '', document_title: '' });
      await load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };

  return (
    <AppShell title="Certificări interne" subtitle="Workflow de semnătură internă demonstrabilă (non-QES)">
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-4 mb-6 flex items-start gap-3" data-testid="cert-warning">
        <ShieldAlert className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5" />
        <div className="text-sm text-[#92400E]">
          <strong>Notă legală:</strong> Aceasta este o <em>certificare internă demonstrabilă</em> cu timestamp și hash SHA-256.
          Pentru semnătură electronică calificată legală (eIDAS QES) este necesar un provider de servicii de încredere (certSIGN, DigiSign, Trans Sped) — configurabil în Setări → QES.
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={submit} className="bg-white border border-gray-200 p-6 space-y-4 lg:col-span-1 self-start" data-testid="cert-form">
          <div className="label">// Generare certificare</div>
          <div>
            <label className="label block mb-1.5">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="cert-role">
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label block mb-1.5">Nume semnatar</label>
            <input value={form.signer_name} onChange={(e) => setForm({ ...form, signer_name: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="cert-signer" />
          </div>
          <div>
            <label className="label block mb-1.5">Titlu document</label>
            <input value={form.document_title} onChange={(e) => setForm({ ...form, document_title: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" placeholder="ex. Memoriu tehnic — branșament gaze" data-testid="cert-title" />
          </div>
          <button disabled={busy} className="amber-btn w-full disabled:opacity-50" data-testid="cert-submit"><BadgeCheck className="w-4 h-4" /> {busy ? 'Se generează...' : 'Generează certificare'}</button>
        </form>

        <div className="lg:col-span-2">
          <div className="label mb-3">// Istoric certificări ({items.length})</div>
          {items.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Nicio certificare emisă.</div>
          ) : (
            <ul className="space-y-px bg-gray-200 border border-gray-200" data-testid="cert-list">
              {items.map((c) => (
                <li key={c.cert_internal_id} className="bg-white p-5" data-testid={`cert-${c.cert_internal_id}`}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="font-semibold">{c.document_title}</div>
                      <div className="text-sm text-gray-600">Semnatar: <span className="font-medium">{c.signer_name}</span> · Rol: <span className="mono text-xs bg-[#FFB300]/15 text-[#92400E] px-1.5 py-0.5">{c.role}</span></div>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString('ro-RO')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mono break-all">
                    <Hash className="w-3 h-3 shrink-0" /> {c.hash}
                  </div>
                  <div className="text-[10px] text-gray-400 mono mt-1">ID: {c.cert_internal_id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
