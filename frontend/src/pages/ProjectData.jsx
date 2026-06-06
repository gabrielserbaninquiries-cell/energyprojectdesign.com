import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Save, AlertCircle, CheckCircle2, Copy, FileDown } from 'lucide-react';

const FIELDS = [
  { name: 'beneficiar', label: 'Beneficiar', placeholder: 'Nume client / firmă', required: true, col: 2 },
  { name: 'adresa_lucrare', label: 'Adresă lucrare', placeholder: 'Strada, număr', required: true, col: 2 },
  { name: 'localitate', label: 'Localitate', required: true },
  { name: 'judet', label: 'Județ', required: true },
  { name: 'telefon', label: 'Telefon', placeholder: '+40 7XX XXX XXX', required: true },
  { name: 'email', label: 'Email beneficiar', type: 'email', required: true },
  { name: 'osd', label: 'OSD (operator distribuție)', placeholder: 'ex. DELGAZ GRID', required: true },
  { name: 'tip_lucrare', label: 'Tip lucrare', placeholder: 'branșament / extindere / instalație utilizare', required: true },
  { name: 'numar_contract', label: 'Număr contract', required: true },
  { name: 'data_contract', label: 'Data contract', type: 'date', required: true },
  { name: 'proiectant', label: 'Proiectant', required: true },
  { name: 'executant', label: 'Executant', required: true },
  // VGD block
  { name: 'verificator_vgd', label: 'Verificator VGD', required: true },
  { name: 'atestat_vgd', label: 'Atestat VGD (ANRE)' },
  { name: 'data_verificare_vgd', label: 'Data verificare VGD', type: 'date' },
  { name: 'status_vgd', label: 'Status VGD', placeholder: 'în curs / aprobat / respins' },
  { name: 'observatii_vgd', label: 'Observații VGD', col: 2, textarea: true },
  // RTE block
  { name: 'responsabil_rte', label: 'Responsabil RTE', required: true },
  { name: 'autorizatie_rte', label: 'Autorizație RTE (ANRE)' },
  { name: 'data_verificare_rte', label: 'Data verificare RTE', type: 'date' },
  { name: 'status_rte', label: 'Status RTE', placeholder: 'în curs / aprobat / respins' },
  { name: 'observatii_rte', label: 'Observații RTE', col: 2, textarea: true },
  // General
  { name: 'observatii', label: 'Observații generale', placeholder: 'Note suplimentare despre lucrare', col: 2, textarea: true },
];

export default function ProjectData() {
  const [project, setProject] = useState({});
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState(0);

  const load = async () => {
    try {
      const { data } = await api.get('/project');
      setProject(data);
      setCompletion(data.completion || 0);
    } catch (e) { toast.error('Eroare încărcare proiect'); }
  };
  useEffect(() => { load(); }, []);

  const setF = (k) => (e) => setProject({ ...project, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const payload = {};
      FIELDS.forEach(f => { payload[f.name] = project[f.name] ?? ''; });
      const { data } = await api.put('/project', payload);
      setProject(data);
      setCompletion(data.completion);
      toast.success('Date proiect salvate');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare salvare'); }
    finally { setBusy(false); }
  };

  const missing = FIELDS.filter(f => f.required && !String(project[f.name] || '').trim());

  const copyPlaceholders = async () => {
    try {
      const { data } = await api.get('/project/placeholders');
      const text = Object.entries(data).map(([k, v]) => `<${k}> = ${v}`).join('\n');
      await navigator.clipboard.writeText(text);
      toast.success('Placeholder-e copiate în clipboard');
    } catch (e) { toast.error('Eroare copiere'); }
  };

  const exportPdf = async () => {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/project/pdf`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' });
      if (!resp.ok) throw new Error('failed');
      const blob = await resp.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `raport-${(project.name || 'proiect').replace(/\s+/g, '_')}.pdf`;
      a.click();
      toast.success('PDF exportat');
    } catch (e) { toast.error('Eroare export PDF'); }
  };

  return (
    <AppShell title="Date proiect" subtitle="Date generale despre lucrare, beneficiar și echipa autorizată">
      {/* Completion bar */}
      <div className="bg-white border border-gray-200 p-5 mb-6 flex items-center gap-6" data-testid="completion-card">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Completare proiect</span>
            <span className="font-bold tracking-tight text-lg" data-testid="completion-value">{completion}%</span>
          </div>
          <div className="h-2 bg-gray-100">
            <div className="h-2 bg-[#FFB300] transition-all" style={{ width: `${completion}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {missing.length === 0 ? (
              <span className="text-[#16A34A] inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Toate câmpurile obligatorii sunt completate.</span>
            ) : (
              <span className="text-[#DC2626] inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Lipsesc {missing.length} câmpuri obligatorii.</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={copyPlaceholders} className="outline-btn text-xs" data-testid="copy-placeholders-btn"><Copy className="w-3.5 h-3.5" /> Copiază placeholder-e</button>
          <button onClick={exportPdf} className="amber-btn text-xs py-2" data-testid="export-pdf-btn"><FileDown className="w-3.5 h-3.5" /> Export PDF raport</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-px bg-gray-200 border border-gray-200 mb-6">
        {FIELDS.map((f) => (
          <div key={f.name} className={`bg-white p-4 ${f.col === 2 ? 'md:col-span-2' : ''}`}>
            <label className="label block mb-1.5">
              {f.label}
              {f.required && <span className="text-[#DC2626] ml-1">*</span>}
              <span className="mono text-gray-400 ml-2 normal-case tracking-normal">&lt;{f.name}&gt;</span>
            </label>
            {f.textarea ? (
              <textarea
                rows={3}
                value={project[f.name] || ''}
                onChange={setF(f.name)}
                placeholder={f.placeholder}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
                data-testid={`field-${f.name}`}
              />
            ) : (
              <input
                type={f.type || 'text'}
                value={project[f.name] || ''}
                onChange={setF(f.name)}
                placeholder={f.placeholder}
                className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
                data-testid={`field-${f.name}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="amber-btn disabled:opacity-50" data-testid="save-project-btn">
          <Save className="w-4 h-4" /> {busy ? 'Se salvează...' : 'Salvează date proiect'}
        </button>
        <span className="text-xs text-gray-500">Modificările se salvează doar după ce apăsați butonul.</span>
      </div>
    </AppShell>
  );
}
