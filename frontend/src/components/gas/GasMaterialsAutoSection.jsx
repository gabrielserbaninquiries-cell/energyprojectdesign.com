/**
 * Listă materiale automată — generată din configurația proiectului
 */
import { useMemo } from 'react';
import { generateBransamentMaterials } from '../../lib/gasCalcs';
import { Package, Download } from 'lucide-react';

export default function GasMaterialsAutoSection({ data }) {
  const materials = useMemo(() => {
    let all = [];
    // Branșament principal
    if (data.tip_lucrare === 'bransament' || data.tip_lucrare === 'extindere_cu_bransamente') {
      all = [...all, ...generateBransamentMaterials(data.bransament || {})];
    }
    // Branșamente extindere
    if (data.tip_lucrare === 'extindere' || data.tip_lucrare === 'extindere_cu_bransamente') {
      (data.extindere?.bransamente || []).forEach((br, idx) => {
        const items = generateBransamentMaterials(br).map((it) => ({ ...it, denumire: `[BR${idx + 1}] ${it.denumire}` }));
        all = [...all, ...items];
      });
      // Țeavă extindere
      const ext = data.extindere || {};
      if (ext.lungime_totala_m && ext.dn_proiectat) {
        all.push({
          nr: all.length + 1,
          denumire: ext.material_proiectat === 'OL' ? `Țeavă OL ${ext.dn_proiectat} (extindere)` : `Țeavă PE100 SDR11 ${ext.dn_proiectat} (extindere)`,
          cantitate: ext.lungime_totala_m,
          um: 'ml',
          categorie: 'extindere',
        });
      }
    }
    // Re-index
    return all.map((it, idx) => ({ ...it, nr: idx + 1 }));
  }, [data]);

  const total = useMemo(() => materials.length, [materials]);

  const exportCsv = () => {
    const header = 'Nr.,Denumire material,Cantitate,UM,Categorie\n';
    const rows = materials.map(m => `${m.nr},"${m.denumire}",${m.cantitate},${m.um},${m.categorie}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lista_materiale_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Package className="w-6 h-6 text-violet-600" />
            Listă materiale (generare automată)
          </h2>
          <p className="text-sm text-slate-500">{total} articole — generate din configurația branșamentului + extinderii.</p>
        </div>
        <button onClick={exportCsv} disabled={total === 0} className="px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold flex items-center gap-2" data-testid="materials-export-csv">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-sm" data-testid="materials-table">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Nr.</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Denumire material</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700">Cantitate</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">UM</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700">Categorie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {materials.length === 0 && (
              <tr><td colSpan="5" className="px-3 py-8 text-center text-slate-400">Configurează branșamentul/extinderea pentru a genera lista de materiale.</td></tr>
            )}
            {materials.map((m) => (
              <tr key={m.nr} className="hover:bg-violet-50/50" data-testid={`material-row-${m.nr}`}>
                <td className="px-3 py-2 tabular-nums">{m.nr}</td>
                <td className="px-3 py-2">{m.denumire}</td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">{m.cantitate}</td>
                <td className="px-3 py-2">{m.um}</td>
                <td className="px-3 py-2 text-xs"><span className="px-2 py-0.5 bg-slate-100 rounded">{m.categorie}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
