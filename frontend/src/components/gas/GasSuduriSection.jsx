/**
 * Suduri & Protocol — examinare vizuală suduri + protocol per sudură
 * Conform cerințelor "Camuri de introdus..." secțiunea 5.
 */
import { useMemo, useState } from 'react';
import { Plus, X, FileSignature, AlertTriangle, CheckCircle2 } from 'lucide-react';

function Field({ label, k, value, onChange, type = 'text', suffix }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(k, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500"
          data-testid={`field-sud-${k}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

export default function GasSuduriSection({ data, onChange }) {
  const sudor = data.sudor || {};
  const examinari = data.examinari_vizuale || [];
  const protocoale = data.protocoale_suduri || [];

  const updateSudor = (k, v) => onChange({ ...data, sudor: { ...sudor, [k]: v } });

  const addExaminare = () => {
    const nr = examinari.length + 1;
    onChange({ ...data, examinari_vizuale: [...examinari, { nr, numar_sudura: `S${String(nr).padStart(3, '0')}`, defecte: 'Nu sunt defecte', rezultat: 'Admis' }] });
  };
  const updateExaminare = (i, k, v) => {
    const lst = [...examinari]; lst[i] = { ...lst[i], [k]: v }; onChange({ ...data, examinari_vizuale: lst });
  };
  const removeExaminare = (i) => onChange({ ...data, examinari_vizuale: examinari.filter((_, idx) => idx !== i) });

  const addProtocol = () => {
    const nr = protocoale.length + 1;
    onChange({
      ...data, protocoale_suduri: [...protocoale, {
        nr_sudura: `S${String(nr).padStart(3, '0')}`,
        tensiune_min: 39.5, tensiune_max: 40.5,
        timp_sec: 95, energie_kj: 12.8,
        temperatura_c: 18, rezultat: 'OK',
      }]
    });
  };
  const updateProtocol = (i, k, v) => {
    const lst = [...protocoale]; lst[i] = { ...lst[i], [k]: v }; onChange({ ...data, protocoale_suduri: lst });
  };
  const removeProtocol = (i) => onChange({ ...data, protocoale_suduri: protocoale.filter((_, idx) => idx !== i) });

  const stats = useMemo(() => {
    const adm = examinari.filter(e => e.rezultat === 'Admis').length;
    const rsp = examinari.length - adm;
    const okProt = protocoale.filter(p => p.rezultat === 'OK').length;
    return { adm, rsp, okProt, total_prot: protocoale.length };
  }, [examinari, protocoale]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-violet-600" />
          Suduri & calitate
        </h2>
        <p className="text-sm text-slate-500">Sudor autorizat + tabel examinare vizuală + protocol per sudură (electrofuziune / arc electric).</p>
      </div>

      {/* Sudor autorizat */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Sudor autorizat ANRE</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Field label="Nume sudor" k="nume" value={sudor.nume} onChange={updateSudor} />
          </div>
          <Field label="Nr. autorizație" k="autorizatie_nr" value={sudor.autorizatie_nr} onChange={updateSudor} />
          <Field label="Data expirare" k="autorizatie_exp" value={sudor.autorizatie_exp} onChange={updateSudor} type="date" />
        </div>
      </div>

      {/* Tabel examinare vizuală */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Tabel examinare vizuală suduri</h3>
          <button type="button" onClick={addExaminare} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="examinare-add">
            <Plus className="w-4 h-4" /> Adaugă sudură
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="examinare-table">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Nr. ordine</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Număr sudură</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Defecte constatate</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Rezultat</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examinari.length === 0 && (
                <tr><td colSpan="5" className="px-3 py-6 text-center text-slate-400">Niciun rând. Adaugă prima sudură.</td></tr>
              )}
              {examinari.map((e, i) => (
                <tr key={i} data-testid={`examinare-row-${i}`}>
                  <td className="px-3 py-1.5"><input value={e.nr || i + 1} onChange={(ev) => updateExaminare(i, 'nr', ev.target.value)} className="w-12 px-2 py-1 border border-slate-300 rounded text-sm" /></td>
                  <td className="px-3 py-1.5"><input value={e.numar_sudura || ''} onChange={(ev) => updateExaminare(i, 'numar_sudura', ev.target.value)} className="w-24 px-2 py-1 border border-slate-300 rounded text-sm" /></td>
                  <td className="px-3 py-1.5"><input value={e.defecte || ''} onChange={(ev) => updateExaminare(i, 'defecte', ev.target.value)} className="w-full px-2 py-1 border border-slate-300 rounded text-sm" /></td>
                  <td className="px-3 py-1.5">
                    <select value={e.rezultat || 'Admis'} onChange={(ev) => updateExaminare(i, 'rezultat', ev.target.value)} className={`px-2 py-1 border rounded text-sm font-semibold ${e.rezultat === 'Admis' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'}`}>
                      <option>Admis</option>
                      <option>Respins</option>
                    </select>
                  </td>
                  <td className="px-3 py-1.5"><button type="button" onClick={() => removeExaminare(i)} className="text-rose-500 hover:bg-rose-50 p-1 rounded"><X className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {examinari.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg flex items-center justify-between" data-testid="sud-admise">
              <span className="text-sm font-semibold text-emerald-900 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Admise</span>
              <span className="text-xl font-bold tabular-nums text-emerald-900">{stats.adm}</span>
            </div>
            <div className={`p-3 ${stats.rsp > 0 ? 'bg-rose-100' : 'bg-slate-100'} rounded-lg flex items-center justify-between`} data-testid="sud-respinse">
              <span className={`text-sm font-semibold flex items-center gap-1 ${stats.rsp > 0 ? 'text-rose-900' : 'text-slate-700'}`}><AlertTriangle className="w-4 h-4" /> Respinse</span>
              <span className={`text-xl font-bold tabular-nums ${stats.rsp > 0 ? 'text-rose-900' : 'text-slate-700'}`}>{stats.rsp}</span>
            </div>
          </div>
        )}
      </div>

      {/* Protocol suduri (electrofuziune) */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Protocol electrofuziune (per sudură)</h3>
          <button type="button" onClick={addProtocol} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="protocol-add">
            <Plus className="w-4 h-4" /> Adaugă protocol
          </button>
        </div>
        <div className="space-y-2">
          {protocoale.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">Niciun protocol înregistrat. Sistemul cere parametri specifici per sudură (tensiune, timp, energie).</div>
          )}
          {protocoale.map((p, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[110px_90px_90px_90px_90px_90px_110px_40px] gap-2 items-end p-2 bg-white border border-slate-200 rounded-lg" data-testid={`protocol-row-${i}`}>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nr. sudură</label>
                <input value={p.nr_sudura || ''} onChange={(e) => updateProtocol(i, 'nr_sudura', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">U min (V)</label>
                <input type="number" step="0.1" value={p.tensiune_min || ''} onChange={(e) => updateProtocol(i, 'tensiune_min', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">U max (V)</label>
                <input type="number" step="0.1" value={p.tensiune_max || ''} onChange={(e) => updateProtocol(i, 'tensiune_max', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Timp (s)</label>
                <input type="number" value={p.timp_sec || ''} onChange={(e) => updateProtocol(i, 'timp_sec', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Energie (kJ)</label>
                <input type="number" step="0.1" value={p.energie_kj || ''} onChange={(e) => updateProtocol(i, 'energie_kj', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">T mediu (°C)</label>
                <input type="number" step="0.1" value={p.temperatura_c || ''} onChange={(e) => updateProtocol(i, 'temperatura_c', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rezultat</label>
                <select value={p.rezultat || 'OK'} onChange={(e) => updateProtocol(i, 'rezultat', e.target.value)} className={`w-full px-2 py-1.5 border rounded text-sm font-semibold ${p.rezultat === 'OK' ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
                  <option>OK</option>
                  <option>Respins</option>
                </select>
              </div>
              <button type="button" onClick={() => removeProtocol(i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {protocoale.length > 0 && (
          <div className="mt-3 p-3 bg-blue-100 rounded-lg flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-900">Protocoale înregistrate</span>
            <span className="text-xl font-bold tabular-nums text-blue-900">{stats.okProt} OK / {stats.total_prot} total</span>
          </div>
        )}
      </div>
    </div>
  );
}
