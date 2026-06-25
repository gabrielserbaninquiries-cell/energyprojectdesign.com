/**
 * Procese Verbale — lista PV-uri + generare automată
 * PV recepție, PV PIF, PV calitate materiale, PV predare amplasament, etc.
 */
import { Plus, X, FileCheck2 } from 'lucide-react';

const PV_TIPURI = [
  'PV Predare-Primire Amplasament',
  'PV Verificare calitate materiale',
  'PV Recepție tehnică branșament',
  'PV Recepție tehnică conductă distribuție',
  'PV Recepție tehnică PRM/FPRM',
  'PV Punere în funcțiune (PIF)',
  'PV Control execuție suduri',
  'PV Recepție la terminarea lucrărilor',
  'PV Recepție finală',
  'PV Probă etanșeitate',
];

function Field({ label, k, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(k, e.target.value)}
        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}

export default function GasPVSection({ pv = [], onChange }) {
  const update = (i, k, v) => {
    const lst = [...pv]; lst[i] = { ...lst[i], [k]: v }; onChange(lst);
  };
  const add = () => onChange([...pv, { tip: PV_TIPURI[0], nr: '', data: '', participanti: '', observatii: '' }]);
  const remove = (i) => onChange(pv.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-violet-600" />
          Procese Verbale
        </h2>
        <p className="text-sm text-slate-500">PV-urile sunt generate automat în DOCX-uri separate + master. Adaugă fiecare PV cu nr/dată/participanți.</p>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Lista PV-uri proiect</h3>
          <button type="button" onClick={add} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="pv-add">
            <Plus className="w-4 h-4" /> Adaugă PV
          </button>
        </div>
        <div className="space-y-3">
          {pv.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm">Niciun PV adăugat. Click pe &bdquo;Adaugă PV&rdquo; pentru a începe.</div>
          )}
          {pv.map((p, i) => (
            <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg" data-testid={`pv-row-${i}`}>
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_140px_40px] gap-2 items-end">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tip PV</label>
                  <select value={p.tip || ''} onChange={(e) => update(i, 'tip', e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" data-testid={`pv-${i}-tip`}>
                    {PV_TIPURI.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <Field label="Număr PV" k="nr" value={p.nr} onChange={(k, v) => update(i, k, v)} />
                <Field label="Dată" k="data" value={p.data} onChange={(k, v) => update(i, k, v)} type="date" />
                <button type="button" onClick={() => remove(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Field label="Participanți (semnatari)" k="participanti" value={p.participanti} onChange={(k, v) => update(i, k, v)} />
                <Field label="Observații" k="observatii" value={p.observatii} onChange={(k, v) => update(i, k, v)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
