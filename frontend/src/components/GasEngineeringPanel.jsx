/**
 * GasEngineeringPanel — Tools inginerești reale pentru proiecte gaze.
 *
 * 3 sub-panouri:
 *  1. Multi-tronson Renouard (CRUD tabel dinamic + calcul live)
 *  2. Smart sizing (lățime șanț + contor + regulator pe baza debit/DN)
 *  3. Materiale auto-suggest (din 554 OSD catalog filtrat după proiect)
 */
import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import {
  Calculator, Plus, Trash2, Loader2, TrendingDown, Zap, Package,
  Ruler, Gauge, CircleDot, ChevronDown, ChevronRight, RefreshCcw,
} from 'lucide-react';

const DEFAULT_TRONSON = { id: 'T1', lungime_m: 30, dn_mm: 26, debit_mc_h: 4.0 };

export default function GasEngineeringPanel({ data, pid }) {
  const [tronsons, setTronsons] = useState([DEFAULT_TRONSON]);
  const [tronsonResults, setTronsonResults] = useState([]);
  const [pInitial, setPInitial] = useState(0.025);
  const [sizing, setSizing] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [busy, setBusy] = useState(false);
  const [openSec, setOpenSec] = useState('tronsons');

  const calcTronsons = async () => {
    setBusy(true);
    try {
      const { data: res } = await api.post('/placeholders/tronsons-renouard', {
        tronsons, p_initial_bar: pInitial,
      });
      setTronsonResults(res.results || []);
    } finally {
      setBusy(false);
    }
  };

  const calcSizing = async () => {
    // Use project data to infer DN + debit max
    const dn = (data?.sf_diametru_nominal_DN || '').replace(/\D/g, '');
    const dnNum = parseInt(dn, 10) || 32;
    const debit = parseFloat(data?.debit_instalat_mc_h || data?.qmin_total || 4);
    const presiune = (data?.presiune_categorie || '').includes('REDUSA') ? 'RP' : 'JP';
    try {
      const { data: res } = await api.post('/placeholders/smart-sizing', {
        dn_size: dnNum,
        debit_max_mc_h: debit,
        presiune_intrare_bar: 4.0,
        tip_presiune: presiune,
      });
      setSizing(res);
    } catch { /* silent */ }
  };

  const loadMaterials = async () => {
    try {
      const { data: res } = await api.post('/placeholders/materials/auto-suggest', { data });
      setMaterials(res.suggestions || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (data) {
      calcSizing();
      loadMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.sf_diametru_nominal_DN, data?.debit_instalat_mc_h, data?.presiune_categorie, data?.tipul_lucrarii]);

  const addTronson = () => {
    const nextId = `T${tronsons.length + 1}`;
    setTronsons([...tronsons, { id: nextId, lungime_m: 10, dn_mm: 26, debit_mc_h: 2.0 }]);
  };

  const updateTronson = (idx, field, val) => {
    const next = [...tronsons];
    next[idx] = { ...next[idx], [field]: field === 'id' ? val : Number(val) || 0 };
    setTronsons(next);
  };

  const removeTronson = (idx) => {
    setTronsons(tronsons.filter((_, i) => i !== idx));
  };

  const totalPierdere = tronsonResults.reduce((s, t) => s + (t.delta_p_bar || 0), 0);
  const pFinala = tronsonResults.length > 0 ? tronsonResults[tronsonResults.length - 1].p_finala_bar : pInitial;

  return (
    <div className="space-y-3" data-testid="gas-engineering-panel">

      {/* === 1. MULTI-TRONSON RENOUARD === */}
      <div className="bg-white border-2 border-blue-500" data-testid="eng-tronsons">
        <button
          onClick={() => setOpenSec(openSec === 'tronsons' ? '' : 'tronsons')}
          className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-blue-500 bg-blue-50 hover:bg-blue-100"
          data-testid="eng-tronsons-toggle"
        >
          <div className="flex items-center gap-2">
            {openSec === 'tronsons' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Calculator className="w-4 h-4 text-blue-700" />
            <div className="text-left">
              <div className="text-sm font-bold tracking-tight">Calcule Renouard multi-tronson</div>
              <div className="text-[10px] text-blue-700">NTPEE 2018 cap. 3 — Δp [mbar] = β × L × Q^1.82 / D^4.82</div>
            </div>
          </div>
          {tronsonResults.length > 0 && (
            <div className="text-right">
              <div className="text-xs font-bold tabular-nums">Δp total = {totalPierdere.toFixed(4)} bar</div>
              <div className="text-[10px] text-zinc-500">p_final = {pFinala.toFixed(4)} bar</div>
            </div>
          )}
        </button>

        {openSec === 'tronsons' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-700 font-semibold">Presiune inițială:</span>
              <input
                type="number" step="0.001" value={pInitial}
                onChange={(e) => setPInitial(parseFloat(e.target.value) || 0)}
                className="border border-zinc-300 px-2 py-1 w-24 font-mono"
                data-testid="eng-p-initial"
              />
              <span className="text-zinc-500">bar</span>
              <button onClick={calcTronsons} disabled={busy} className="ml-auto bg-blue-600 text-white px-3 py-1 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1" data-testid="eng-calc-tronsons">
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calculator className="w-3 h-3" />}
                Calculează
              </button>
            </div>

            <table className="w-full text-xs border border-zinc-200">
              <thead className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-600">
                <tr>
                  <th className="text-left px-2 py-1.5">Tronson</th>
                  <th className="text-right px-2 py-1.5">L (m)</th>
                  <th className="text-right px-2 py-1.5">DN intern (mm)</th>
                  <th className="text-right px-2 py-1.5">Q (m³/h)</th>
                  <th className="text-right px-2 py-1.5">Δp (bar)</th>
                  <th className="text-right px-2 py-1.5">p_finala</th>
                  <th className="text-right px-2 py-1.5">v (m/s)</th>
                  <th className="text-center px-2 py-1.5">Status</th>
                  <th className="px-2 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {tronsons.map((t, idx) => {
                  const r = tronsonResults[idx];
                  return (
                    <tr key={idx} className="border-t border-zinc-100" data-testid={`eng-tronson-${idx}`}>
                      <td className="px-1 py-1"><input value={t.id} onChange={(e) => updateTronson(idx, 'id', e.target.value)} className="w-14 px-1 border border-zinc-200" /></td>
                      <td className="px-1 py-1"><input type="number" value={t.lungime_m} onChange={(e) => updateTronson(idx, 'lungime_m', e.target.value)} className="w-16 px-1 text-right border border-zinc-200 font-mono" /></td>
                      <td className="px-1 py-1"><input type="number" value={t.dn_mm} onChange={(e) => updateTronson(idx, 'dn_mm', e.target.value)} className="w-16 px-1 text-right border border-zinc-200 font-mono" /></td>
                      <td className="px-1 py-1"><input type="number" step="0.1" value={t.debit_mc_h} onChange={(e) => updateTronson(idx, 'debit_mc_h', e.target.value)} className="w-16 px-1 text-right border border-zinc-200 font-mono" /></td>
                      <td className="px-1 py-1 text-right tabular-nums font-mono">{r?.delta_p_bar?.toFixed(4) ?? '—'}</td>
                      <td className="px-1 py-1 text-right tabular-nums font-mono text-blue-700">{r?.p_finala_bar?.toFixed(4) ?? '—'}</td>
                      <td className="px-1 py-1 text-right tabular-nums font-mono">{r?.viteza_m_s?.toFixed(2) ?? '—'}</td>
                      <td className="px-1 py-1 text-center">
                        {r?.verdict === 'OK'
                          ? <span className="text-green-700 font-bold">✓ OK</span>
                          : r?.verdict ? <span className="text-amber-700 text-[9px]" title={r.verdict}>⚠</span> : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-1 py-1">
                        {tronsons.length > 1 && (
                          <button onClick={() => removeTronson(idx)} className="text-red-500 hover:text-red-700" data-testid={`eng-tronson-remove-${idx}`}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button onClick={addTronson} className="w-full border border-dashed border-zinc-300 text-xs text-zinc-600 hover:bg-zinc-50 py-1.5 flex items-center justify-center gap-1" data-testid="eng-tronson-add">
              <Plus className="w-3 h-3" /> Adaugă tronson
            </button>
          </div>
        )}
      </div>

      {/* === 2. SMART SIZING === */}
      <div className="bg-white border-2 border-purple-500" data-testid="eng-sizing">
        <button
          onClick={() => setOpenSec(openSec === 'sizing' ? '' : 'sizing')}
          className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-purple-500 bg-purple-50 hover:bg-purple-100"
          data-testid="eng-sizing-toggle"
        >
          <div className="flex items-center gap-2">
            {openSec === 'sizing' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Gauge className="w-4 h-4 text-purple-700" />
            <div className="text-left">
              <div className="text-sm font-bold tracking-tight">Smart sizing automat</div>
              <div className="text-[10px] text-purple-700">Lățime șanț + contor + regulator pe baza datelor proiectului</div>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); calcSizing(); }} className="text-purple-600 hover:text-purple-800" data-testid="eng-sizing-refresh">
            <RefreshCcw className="w-3 h-3" />
          </button>
        </button>

        {openSec === 'sizing' && sizing && (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-purple-100">
            {/* Lățime șanț */}
            {sizing.latime_sant && (
              <div className="p-4" data-testid="eng-sizing-sant">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-4 h-4 text-purple-600" />
                  <div className="text-xs font-bold">Lățime șanț</div>
                </div>
                <div className="text-2xl font-bold tabular-nums text-purple-700">{sizing.latime_sant.latime_recomandata_cm}<span className="text-sm font-normal text-zinc-500"> cm</span></div>
                <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{sizing.latime_sant.formula}</div>
                <div className="text-[9px] text-zinc-400 italic mt-1">{sizing.latime_sant.norma}</div>
              </div>
            )}
            {/* Contor */}
            {sizing.contor?.recomandat && (
              <div className="p-4" data-testid="eng-sizing-contor">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDot className="w-4 h-4 text-purple-600" />
                  <div className="text-xs font-bold">Contor recomandat</div>
                </div>
                <div className="text-2xl font-bold text-purple-700">{sizing.contor.recomandat.model}</div>
                <div className="text-[10px] text-zinc-700 mt-1">Q<sub>max</sub> = <span className="font-mono">{sizing.contor.recomandat.qmax} m³/h</span> · {sizing.contor.recomandat.DN}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{sizing.contor.recomandat.tip} · {sizing.contor.recomandat.uz}</div>
                <div className="text-[9px] text-zinc-400 italic mt-1">{sizing.contor.norma}</div>
              </div>
            )}
            {/* Regulator */}
            {sizing.regulator?.recomandat && (
              <div className="p-4" data-testid="eng-sizing-regulator">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-purple-600" />
                  <div className="text-xs font-bold">Regulator recomandat</div>
                </div>
                <div className="text-2xl font-bold text-purple-700">{sizing.regulator.recomandat.model}</div>
                <div className="text-[10px] text-zinc-700 mt-1">Q<sub>max</sub> {sizing.regulator.tip_presiune_iesire} = <span className="font-mono">{sizing.regulator.recomandat[sizing.regulator.tip_presiune_iesire === 'JP' ? 'qmax_jp' : 'qmax_rp']} m³/h</span> · {sizing.regulator.recomandat.DN}</div>
                <div className="text-[10px] text-zinc-500 mt-1">p_iesire {sizing.regulator.recomandat.p_iesire_bar}</div>
                <div className="text-[9px] text-zinc-400 italic mt-1">{sizing.regulator.norma}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === 3. MATERIALE AUTO-SUGGEST === */}
      <div className="bg-white border-2 border-amber-500" data-testid="eng-materials">
        <button
          onClick={() => setOpenSec(openSec === 'materials' ? '' : 'materials')}
          className="w-full flex items-center justify-between px-4 py-3 border-b-2 border-amber-500 bg-amber-50 hover:bg-amber-100"
          data-testid="eng-materials-toggle"
        >
          <div className="flex items-center gap-2">
            {openSec === 'materials' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Package className="w-4 h-4 text-amber-700" />
            <div className="text-left">
              <div className="text-sm font-bold tracking-tight">Materiale recomandate (Anexa 13)</div>
              <div className="text-[10px] text-amber-800">Top {materials.length} din 554 itemi catalog OSD, filtrate după proiect</div>
            </div>
          </div>
        </button>

        {openSec === 'materials' && (
          <div className="p-3 max-h-80 overflow-y-auto">
            {materials.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-500">Completați DN + material + presiune pentru sugestii</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-600">
                  <tr>
                    <th className="text-left px-2 py-1">Cod</th>
                    <th className="text-left px-2 py-1">Denumire material OSD</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, idx) => (
                    <tr key={idx} className="border-t border-zinc-100 hover:bg-amber-50" data-testid={`eng-mat-${idx}`}>
                      <td className="px-2 py-1 font-mono text-[10px] text-zinc-600">{m.code || '—'}</td>
                      <td className="px-2 py-1">{m.name || m.denumire || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
