/**
 * V11.6 — Listă materiale CU motor real ANEXA 13 (554 articole OSD).
 *
 * Apel backend POST /api/gas/materials/autoselect cu (bransament_dn, conducta_dn,
 * lungime, debit_total) → returnează BOM cu coduri reale ANEXA 13.
 * Fallback la generarea locală (gasCalcs) dacă lipsesc parametri esențiali.
 *
 * Exemplu cerut de utilizator: bransament DN32 + conductă DN90 + 3.67 mc/h →
 * "TEU BR COLIER SDR11 D90-32 STOPGAZ ROSU" + 2× mufe PE32 + riser 1" + robinet 1"
 * + regulator Q10 + contor G2.5 + tub protecție.
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { generateBransamentMaterials } from '../../lib/gasCalcs';
import { Package, Download, Wand2, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';

const DN_RE = /(\d+)/;
const extractDn = (val) => {
  if (!val) return null;
  const s = String(val);
  const m = s.match(DN_RE);
  return m ? parseInt(m[1], 10) : null;
};

export default function GasMaterialsAutoSection({ data }) {
  const [bom, setBom] = useState([]);
  const [bomSource, setBomSource] = useState('local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract inputs from saved project data
  const inputs = useMemo(() => {
    const br = data.bransament || {};
    const ext = data.extindere || {};
    const consumatori = br.consumatori || [];
    const debitTotal = consumatori.reduce((acc, c) => acc + (parseFloat(c.debit_nmc) || 0), 0);
    return {
      bransament_dn: extractDn(br.diametru_dn),
      conducta_dn: extractDn(ext.dn_proiectat || ext.dn_existent),
      bransament_lungime_m: parseFloat(br.lungime_m) || 4,
      debit_total_consumatori_mc_h: debitTotal || 0,
      bransament_material: br.material || 'PE',
      cu_tub_protectie: !!br.tub_protectie,
    };
  }, [data]);

  const canAutoGenerate = inputs.bransament_dn && inputs.conducta_dn;

  // Backend auto-select
  const generateBom = useCallback(async () => {
    if (!canAutoGenerate) {
      toast.error('Setează diametrul branșamentului ȘI al conductei pentru auto-generare.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: resp } = await api.post('/gas/materials/autoselect', inputs);
      setBom(resp.bom || []);
      setBomSource(resp.source || 'ANEXA 13');
      toast.success(`${resp.count} materiale generate din ${resp.source}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Eroare la generarea BOM';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [canAutoGenerate, inputs]);

  // Auto-generate on data change when all inputs present
  useEffect(() => {
    if (canAutoGenerate && inputs.debit_total_consumatori_mc_h > 0) {
      generateBom();
    }
  }, [canAutoGenerate, inputs.bransament_dn, inputs.conducta_dn, inputs.debit_total_consumatori_mc_h, generateBom]);

  // Local fallback (gasCalcs helper)
  const localMaterials = useMemo(() => {
    if (bom.length > 0) return [];
    let all = [];
    if (data.tip_lucrare === 'bransament' || data.tip_lucrare === 'extindere_cu_bransamente') {
      all = [...all, ...generateBransamentMaterials(data.bransament || {})];
    }
    if (data.tip_lucrare === 'extindere' || data.tip_lucrare === 'extindere_cu_bransamente') {
      (data.extindere?.bransamente || []).forEach((br, idx) => {
        const items = generateBransamentMaterials(br).map((it) => ({ ...it, denumire: `[BR${idx + 1}] ${it.denumire}` }));
        all = [...all, ...items];
      });
      const ext = data.extindere || {};
      if (ext.lungime_totala_m && ext.dn_proiectat) {
        all.push({
          denumire: ext.material_proiectat === 'OL' ? `Țeavă OL ${ext.dn_proiectat} (extindere)` : `Țeavă PE100 SDR11 ${ext.dn_proiectat} (extindere)`,
          cantitate: ext.lungime_totala_m,
          um: 'ml',
          categorie: 'extindere',
        });
      }
    }
    return all.map((it, idx) => ({ ...it, nr: idx + 1 }));
  }, [data, bom]);

  // Unified view
  const allMaterials = bom.length > 0
    ? bom.map((m, idx) => ({
        nr: idx + 1,
        cod: m.cod,
        denumire: m.text,
        cantitate: m.cantitate,
        um: m.um,
        categorie: m.tip || m.scop,
        scop: m.scop,
      }))
    : localMaterials;

  const total = allMaterials.length;

  const exportCsv = () => {
    const header = 'Nr.,Cod ANEXA 13,Denumire material,Cantitate,UM,Categorie,Scop\n';
    const rows = allMaterials.map((m, i) =>
      `${i + 1},"${m.cod || ''}","${m.denumire}",${m.cantitate},${m.um},"${m.categorie || ''}","${m.scop || ''}"`
    ).join('\n');
    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BOM_ANEXA13_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('CSV descărcat');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-violet-600" />
            Listă materiale — Generator inteligent
          </h2>
          <p className="text-sm text-slate-500">
            {bom.length > 0 ? (
              <>Sursă: <strong className="text-violet-700">{bomSource}</strong> · {total} articole cu cod oficial</>
            ) : (
              <>{total > 0 ? `${total} articole — fallback local` : 'Configurează branșamentul + conducta pentru a genera lista'}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBom}
            disabled={!canAutoGenerate || loading}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md"
            data-testid="bom-autogenerate-btn"
            title={canAutoGenerate ? 'Generează BOM real conform ANEXA 13' : 'Setează DN branșament + DN conductă întâi'}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generează BOM ANEXA 13
          </button>
          <button
            onClick={exportCsv}
            disabled={total === 0}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
            data-testid="materials-export-csv"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Inputs preview */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-violet-700 font-bold mb-2">// Parametri detectați din proiect</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-slate-500">Branșament DN</div>
            <div className="font-bold text-slate-900 tabular-nums">{inputs.bransament_dn || <span className="text-rose-500">—</span>}</div>
          </div>
          <div>
            <div className="text-slate-500">Conductă DN</div>
            <div className="font-bold text-slate-900 tabular-nums">{inputs.conducta_dn || <span className="text-rose-500">—</span>}</div>
          </div>
          <div>
            <div className="text-slate-500">Lungime (m)</div>
            <div className="font-bold text-slate-900 tabular-nums">{inputs.bransament_lungime_m}</div>
          </div>
          <div>
            <div className="text-slate-500">Debit total (m³/h)</div>
            <div className="font-bold text-slate-900 tabular-nums">{inputs.debit_total_consumatori_mc_h.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-sm" data-testid="materials-table">
          <thead className="bg-gradient-to-r from-violet-100 to-indigo-100">
            <tr>
              <th className="px-3 py-2 text-left font-bold text-slate-800">Nr.</th>
              <th className="px-3 py-2 text-left font-bold text-slate-800">Cod ANEXA 13</th>
              <th className="px-3 py-2 text-left font-bold text-slate-800">Denumire material</th>
              <th className="px-3 py-2 text-right font-bold text-slate-800">Cantitate</th>
              <th className="px-3 py-2 text-left font-bold text-slate-800">UM</th>
              <th className="px-3 py-2 text-left font-bold text-slate-800">Scop / Categorie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allMaterials.length === 0 && (
              <tr><td colSpan="6" className="px-3 py-8 text-center text-slate-400">
                {canAutoGenerate
                  ? <button onClick={generateBom} className="text-violet-600 hover:underline inline-flex items-center gap-1"><RefreshCw className="w-3 h-3"/> Apasă pentru a genera BOM-ul automat</button>
                  : 'Setează diametrul branșamentului + al conductei distribuției pentru a genera lista.'}
              </td></tr>
            )}
            {allMaterials.map((m, i) => (
              <tr key={i} className="hover:bg-violet-50/50" data-testid={`material-row-${i + 1}`}>
                <td className="px-3 py-2 tabular-nums font-semibold text-slate-600">{i + 1}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-violet-700">{m.cod || <span className="text-slate-300">extra</span>}</td>
                <td className="px-3 py-2 font-medium">{m.denumire}</td>
                <td className="px-3 py-2 text-right tabular-nums font-bold">{m.cantitate}</td>
                <td className="px-3 py-2 text-slate-600">{m.um}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{m.scop || m.categorie}</td>
              </tr>
            ))}
          </tbody>
          {allMaterials.length > 0 && (
            <tfoot className="bg-slate-50">
              <tr>
                <td colSpan="6" className="px-3 py-2 text-[11px] text-slate-500 italic">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  Sursă: ANEXA 13 — Lista materiale puse la dispoziție OSD (554 articole). Selecție conform NTPE 89/2018.
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
