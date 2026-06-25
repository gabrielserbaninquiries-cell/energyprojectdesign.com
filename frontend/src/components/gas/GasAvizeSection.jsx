/**
 * Avize secțiune — multiple avize/acorduri cu termen expirare
 */
import { AVIZ_CATALOG } from '../../lib/gasCalcs';
import { Plus, X, FileSignature, Calendar, AlertCircle } from 'lucide-react';

function AvizRow({ aviz, onChange, onRemove, idx, prefix = 'aviz' }) {
  const update = (k, v) => onChange({ ...aviz, [k]: v });
  const today = new Date();
  const expDate = aviz.termen_expirare ? new Date(aviz.termen_expirare) : null;
  const expired = expDate && expDate < today;
  const soon = expDate && !expired && (expDate - today) / (1000 * 60 * 60 * 24) < 30;

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg" data-testid={`${prefix}-${idx}`}>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_120px_120px_40px] gap-2 items-end">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nume aviz</label>
          <input list={`${prefix}-catalog`} value={aviz.nume || ''} onChange={(e) => update('nume', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="Caută aviz…" data-testid={`${prefix}-${idx}-nume`} />
          <datalist id={`${prefix}-catalog`}>
            {AVIZ_CATALOG.map((a) => <option key={a} value={a} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nr. / Serie</label>
          <input value={aviz.nr || ''} onChange={(e) => update('nr', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" data-testid={`${prefix}-${idx}-nr`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Data emiterii</label>
          <input type="date" value={aviz.data_emiterii || ''} onChange={(e) => update('data_emiterii', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Termen expirare</label>
          <input type="date" value={aviz.termen_expirare || ''} onChange={(e) => update('termen_expirare', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
        </div>
        <button type="button" onClick={onRemove} className="p-2 text-rose-500 hover:bg-rose-50 rounded" data-testid={`${prefix}-${idx}-remove`}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        <input value={aviz.destinatar_email || ''} onChange={(e) => update('destinatar_email', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="Email destinatar (pentru trimitere cerere)" />
        <input value={aviz.observatii || ''} onChange={(e) => update('observatii', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm" placeholder="Observații" />
      </div>
      {expired && (
        <div className="mt-2 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" /> <strong>EXPIRAT</strong> — reînnoiește acest aviz!
        </div>
      )}
      {soon && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
          <Calendar className="w-4 h-4" /> Expiră în &lt; 30 zile.
        </div>
      )}
    </div>
  );
}

export default function GasAvizeSection({ avize = [], cuLista = [], onChange }) {
  const addAviz = () => onChange({ avize: [...avize, { nume: '', nr: '', data_emiterii: '', termen_expirare: '' }] });
  const updateAviz = (i, patch) => {
    const lst = [...avize]; lst[i] = patch; onChange({ avize: lst });
  };
  const removeAviz = (i) => onChange({ avize: avize.filter((_, idx) => idx !== i) });

  const addCu = () => onChange({ cu_lista: [...cuLista, { nume: 'CU', nr: '', data_emiterii: '', termen_expirare: '' }] });
  const updateCu = (i, patch) => {
    const lst = [...cuLista]; lst[i] = patch; onChange({ cu_lista: lst });
  };
  const removeCu = (i) => onChange({ cu_lista: cuLista.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FileSignature className="w-6 h-6 text-violet-600" />
          Avize & acorduri
        </h2>
        <p className="text-sm text-slate-500">Sistem alertă expirare integrat. Adaugă nelimitat avize.</p>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Avize utilitate (Apa, Electrica, Telekom, ISU, Brigada Rutieră, ...)</h3>
          <button type="button" onClick={addAviz} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="aviz-add">
            <Plus className="w-4 h-4" /> Adaugă aviz
          </button>
        </div>
        <div className="space-y-2">
          {avize.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">Niciun aviz adăugat încă.</div>}
          {avize.map((a, i) => (
            <AvizRow key={i} aviz={a} idx={i} onChange={(patch) => updateAviz(i, patch)} onRemove={() => removeAviz(i)} prefix="aviz" />
          ))}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">CU / Acord administrator drum / Autorizație de construcție</h3>
          <button type="button" onClick={addCu} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="cu-add">
            <Plus className="w-4 h-4" /> Adaugă
          </button>
        </div>
        <div className="space-y-2">
          {cuLista.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">Nimic adăugat încă.</div>}
          {cuLista.map((a, i) => (
            <AvizRow key={i} aviz={a} idx={i} onChange={(patch) => updateCu(i, patch)} onRemove={() => removeCu(i)} prefix="cu" />
          ))}
        </div>
      </div>
    </div>
  );
}
