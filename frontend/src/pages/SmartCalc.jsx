import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Copy, RefreshCw, Calculator, ArrowRight, FileJson } from 'lucide-react';

const STATUS_COLORS = {
  ok: 'bg-[#16A34A]/10 text-[#16A34A]',
  warning: 'bg-[#FFB300]/15 text-[#92400E]',
  missing: 'bg-[#DC2626]/10 text-[#DC2626]',
  override: 'bg-blue-50 text-blue-700',
};

const RESULT_LABELS = {
  debit_calculat_mc_h: { label: 'Debit calculat', unit: 'mc/h' },
  debit_recomandat_mc_h: { label: 'Debit recomandat (cu marjă 10%)', unit: 'mc/h' },
  putere_instalata_kw: { label: 'Putere instalată estimată', unit: 'kW' },
  risc_presiune: { label: 'Risc presiune', unit: '' },
  estimare_cost: { label: 'Estimare cost branșament', unit: 'RON' },
  contor_orientativ: { label: 'Contor orientativ recomandat', unit: '' },
};

export default function SmartCalc() {
  const [results, setResults] = useState({});
  const [techData, setTechData] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/project');
      setResults(data.calc_results || {});
      setTechData(data.technical_data || {});
    } catch (e) { toast.error('Eroare'); }
  };
  useEffect(() => { load(); }, []);

  const recalc = async () => {
    try {
      const { data } = await api.post('/project/recalculate');
      setResults(data.calc_results);
      toast.success('Recalculat');
    } catch (e) { toast.error('Eroare'); }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ technical_data: techData, results }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'calcul-inteligent.json';
    a.click();
  };

  const empty = Object.keys(results).length === 0;

  return (
    <AppShell title="Calcul inteligent" subtitle="Casete de calcul variabil cu surse, formule și status">
      <div className="bg-white border border-gray-200 p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="w-5 h-5 text-[#FFB300]" />
          <div>
            <div className="font-semibold">Motor de calcul gaze naturale</div>
            <div className="text-xs text-gray-500">Bazat pe debitul instalat, lungime branșament și regim presiune.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/tehnice" className="ghost-btn text-sm" data-testid="open-tech-btn">Editează date tehnice <ArrowRight className="w-3.5 h-3.5" /></Link>
          <button onClick={recalc} className="outline-btn text-sm py-2" data-testid="smart-recalc"><RefreshCw className="w-3.5 h-3.5" /> Recalculează</button>
          <button onClick={exportJson} className="amber-btn text-sm py-2" data-testid="export-json-btn"><FileJson className="w-3.5 h-3.5" /> Export JSON</button>
        </div>
      </div>

      {empty ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <Calculator className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-4">Niciun calcul disponibil. Mergeți la <strong>Date tehnice</strong> pentru a introduce debitul instalat și ceilalți parametri.</p>
          <Link to="/tehnice" className="amber-btn">Introdu date tehnice</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          {Object.entries(results).map(([k, r]) => {
            const meta = RESULT_LABELS[k] || { label: k, unit: '' };
            return (
              <div key={k} className="bg-white p-6 flex flex-col" data-testid={`calc-${k}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className="label">{meta.label}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 ${STATUS_COLORS[r.status] || 'bg-gray-50'}`}>{r.status}</span>
                </div>
                <div className="text-3xl font-bold tracking-tight mb-1">
                  {r.value ?? '—'}
                  {meta.unit && <span className="text-sm text-gray-400 ml-1">{meta.unit}</span>}
                </div>
                <div className="mono text-[10px] text-gray-500 bg-gray-50 px-2 py-1 my-3">{r.formula}</div>
                <p className="text-xs text-gray-600 flex-1">{r.explanation}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="uppercase tracking-wider">Surse: {(r.sources || []).join(', ')}</span>
                  <button onClick={() => { navigator.clipboard.writeText(String(r.value ?? '')); toast.success('Copiat'); }} className="text-gray-600 hover:text-black inline-flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copiază rezultat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
