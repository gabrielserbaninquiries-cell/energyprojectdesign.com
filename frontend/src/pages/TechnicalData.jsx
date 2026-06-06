import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Save, RefreshCw, Copy, Pencil } from 'lucide-react';

const FIELDS = [
  { name: 'debit_instalat', label: 'Debit instalat', unit: 'mc/h', type: 'number', step: '0.1' },
  { name: 'presiune_regim', label: 'Presiune regim', placeholder: 'ex. JP, MP, IP' },
  { name: 'diametru_conducta', label: 'Diametru conductă', placeholder: 'ex. DN25' },
  { name: 'material_conducta', label: 'Material conductă', placeholder: 'PE / OL' },
  { name: 'lungime_bransament', label: 'Lungime branșament', unit: 'm', type: 'number', step: '0.5' },
  { name: 'punct_racordare', label: 'Punct racordare' },
  { name: 'post_reglare', label: 'Post reglare' },
  { name: 'contor', label: 'Contor selectat' },
  { name: 'categorie_consumator', label: 'Categorie consumator', placeholder: 'casnic / non-casnic' },
  { name: 'traseu', label: 'Traseu', col: 2, textarea: true },
  { name: 'observatii_tehnice', label: 'Observații tehnice', col: 2, textarea: true },
];

const STATUS_COLORS = {
  ok: 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/30',
  warning: 'bg-[#FFB300]/15 text-[#92400E] border-[#FFB300]/40',
  missing: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30',
  override: 'bg-blue-50 text-blue-700 border-blue-200',
};

const RESULT_LABELS = {
  debit_calculat_mc_h: 'Debit calculat',
  debit_recomandat_mc_h: 'Debit recomandat',
  putere_instalata_kw: 'Putere instalată',
  risc_presiune: 'Risc presiune',
  estimare_cost: 'Estimare cost',
  contor_orientativ: 'Contor orientativ',
};

export default function TechnicalData() {
  const [td, setTd] = useState({});
  const [results, setResults] = useState({});
  const [overrides, setOverrides] = useState({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/project');
      setTd(data.technical_data || {});
      setResults(data.calc_results || {});
    } catch (e) { toast.error('Eroare încărcare'); }
  };
  useEffect(() => { load(); }, []);

  const setF = (k) => (e) => setTd({ ...td, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...td, overrides };
      // ensure numbers are numbers
      ['debit_instalat', 'lungime_bransament'].forEach(k => {
        if (payload[k] !== '' && payload[k] != null) payload[k] = parseFloat(payload[k]);
      });
      const { data } = await api.put('/project/technical', payload);
      setTd(data.technical_data);
      setResults(data.calc_results);
      toast.success('Date tehnice salvate · calcul reactualizat');
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };

  const recalc = async () => {
    try {
      const { data } = await api.post('/project/recalculate');
      setResults(data.calc_results);
      toast.success('Recalculat');
    } catch (e) { toast.error('Eroare recalculare'); }
  };

  const copyResult = async (key, value) => {
    await navigator.clipboard.writeText(String(value ?? ''));
    toast.success(`Copiat: ${RESULT_LABELS[key]}`);
  };

  const setOverride = (key, value) => setOverrides({ ...overrides, [key]: value });

  return (
    <AppShell title="Date tehnice" subtitle="Parametri tehnici și casete inteligente de calcul">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-7 bg-white border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold">Parametri tehnici</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-gray-200">
            {FIELDS.map((f) => (
              <div key={f.name} className={`bg-white p-4 ${f.col === 2 ? 'md:col-span-2' : ''}`}>
                <label className="label block mb-1.5">
                  {f.label} {f.unit && <span className="normal-case text-gray-400 ml-1">[{f.unit}]</span>}
                  <span className="mono text-gray-400 ml-2 normal-case tracking-normal">&lt;{f.name}&gt;</span>
                </label>
                {f.textarea ? (
                  <textarea rows={2} value={td[f.name] ?? ''} onChange={setF(f.name)} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" data-testid={`tech-${f.name}`} />
                ) : (
                  <input type={f.type || 'text'} step={f.step} value={td[f.name] ?? ''} onChange={setF(f.name)} placeholder={f.placeholder} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30" data-testid={`tech-${f.name}`} />
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
            <button onClick={save} disabled={busy} className="amber-btn disabled:opacity-50" data-testid="save-tech-btn">
              <Save className="w-4 h-4" /> {busy ? 'Se salvează...' : 'Salvează & recalculează'}
            </button>
            <button onClick={recalc} className="outline-btn text-sm py-2" data-testid="recalc-btn">
              <RefreshCw className="w-3.5 h-3.5" /> Recalculează
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5 space-y-3">
          <div className="label">// Rezultate calcul</div>
          {Object.keys(results).length === 0 ? (
            <div className="bg-white border border-gray-200 p-6 text-sm text-gray-500">Salvați datele tehnice pentru a calcula rezultatele.</div>
          ) : (
            Object.entries(results).map(([k, r]) => (
              <div key={k} className="bg-white border border-gray-200 p-4" data-testid={`result-${k}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.15em] text-gray-500">{RESULT_LABELS[k] || k}</div>
                    <div className="text-2xl font-bold tracking-tight mt-1">
                      {r.value ?? '—'}
                      {r.unit && <span className="text-sm text-gray-400 ml-1">{r.unit}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 border ${STATUS_COLORS[r.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{r.status}</span>
                </div>
                <div className="mono text-[10px] text-gray-500 bg-gray-50 px-2 py-1 mb-2">{r.formula}</div>
                <div className="text-xs text-gray-600">{r.explanation}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => copyResult(k, r.value)} className="text-xs text-gray-600 hover:text-black inline-flex items-center gap-1"><Copy className="w-3 h-3" /> Copiază</button>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-black inline-flex items-center gap-1"><Pencil className="w-3 h-3" /> Override manual</summary>
                    <input
                      type="text"
                      value={overrides[k] ?? ''}
                      onChange={(e) => setOverride(k, e.target.value)}
                      placeholder="Valoare manuală (se salvează la următoarea apăsare 'Salvează')"
                      className="mt-2 w-full border border-gray-300 px-2 py-1 text-xs rounded-sm"
                    />
                  </details>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
