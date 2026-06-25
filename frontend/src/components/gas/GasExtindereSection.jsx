/**
 * Extindere conductă cu N branșamente nested
 */
import { useMemo } from 'react';
import { PE_DIAMETERS, OL_DIAMETERS, calcLatimeSant, calcVitezaGaz, calcDiametruJoasa, calcDiametruMedie } from '../../lib/gasCalcs';
import { Plus, X, GitBranch, Calculator } from 'lucide-react';
import GasBransamentSection from './GasBransamentSection';
import DevPlaceholderTag from './DevPlaceholderTag';

function NumField({ label, k, value, onChange, suffix, step = 'any' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <DevPlaceholderTag pkey={k ? `cnd_${k}` : null} />
      <div className="relative">
        <input
          type="number"
          step={step}
          value={value ?? ''}
          onChange={(e) => onChange(k, e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          data-testid={`field-cnd-${k}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function SelField({ label, k, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <DevPlaceholderTag pkey={k ? `cnd_${k}` : null} />
      <select
        value={value || ''}
        onChange={(e) => onChange(k, e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        data-testid={`field-cnd-${k}`}
      >
        <option value="">— alege —</option>
        {options.map((o) => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function GasExtindereSection({ data, onChange }) {
  const update = (k, v) => onChange({ [k]: v });

  const dnPEOpts = PE_DIAMETERS.map(p => `PE ${p.dn}`);
  const dnOLOpts = OL_DIAMETERS.map(o => `OL ${o.dn}`);
  const dnExistentOpts = data.material_existent === 'OL' ? dnOLOpts : dnPEOpts;
  const dnProiectatOpts = data.material_proiectat === 'OL' ? dnOLOpts : dnPEOpts;

  const setBransamenteCount = (n) => {
    const cnt = Math.max(0, Math.min(50, Number(n) || 0));
    const lst = data.bransamente || [];
    let newLst;
    if (cnt > lst.length) {
      newLst = [...lst, ...Array(cnt - lst.length).fill().map(() => ({ material: 'PE', diametru_dn: 'PE 32', lungime_m: 4, consumatori: [] }))];
    } else {
      newLst = lst.slice(0, cnt);
    }
    onChange({ n_bransamente: cnt, bransamente: newLst });
  };

  const updateBransament = (i, patch) => {
    const lst = [...(data.bransamente || [])];
    lst[i] = { ...lst[i], ...patch };
    update('bransamente', lst);
  };

  const removeBransament = (i) => {
    const lst = (data.bransamente || []).filter((_, idx) => idx !== i);
    onChange({ n_bransamente: lst.length, bransamente: lst });
  };

  // Piese cuplare
  const addPiesa = () => {
    const lst = [...(data.metoda_cuplare_piese || []), { nume: '', diametru: '' }];
    update('metoda_cuplare_piese', lst);
  };
  const updatePiesa = (i, k, v) => {
    const lst = [...(data.metoda_cuplare_piese || [])];
    lst[i] = { ...lst[i], [k]: v };
    update('metoda_cuplare_piese', lst);
  };
  const removePiesa = (i) => update('metoda_cuplare_piese', (data.metoda_cuplare_piese || []).filter((_, idx) => idx !== i));

  // Live calc — diametru recomandat
  const calc = useMemo(() => {
    const Q = Number(data.debit_total_extindere) || 0;
    const L_m = Number(data.lungime_totala_m) || 0;
    const L_km = L_m / 1000;
    const P1 = Number(data.p1_bar) || 2.0;
    const P2 = Number(data.p2_bar) || 1.95;
    const dnRecJ = calcDiametruJoasa({ qM3h: Q, lengthM: L_m, deltaPMbar: (P1 - P2) * 1000 });
    const dnRecM = calcDiametruMedie({ qM3h: Q, lengthKm: L_km, p1Bar: P1, p2Bar: P2 });
    return { dnRecJoasa: dnRecJ, dnRecMedie: dnRecM };
  }, [data.debit_total_extindere, data.lungime_totala_m, data.p1_bar, data.p2_bar]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-violet-600" />
          Extindere conductă de distribuție
        </h2>
        <p className="text-sm text-slate-500">Caracteristici conductă + branșamente multiple nested + metodă cuplare</p>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Date generale extindere</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <NumField label="Lungime totală extindere" k="lungime_totala_m" value={data.lungime_totala_m} onChange={update} suffix="m" />
          <SelField label="Pozare" k="supraterana_subterana" value={data.supraterana_subterana} onChange={update} options={['supraterană', 'subterană', 'mixtă']} />
          <SelField label="Execuție prin" k="executie" value={data.executie} onChange={update} options={['șanț deschis', 'foraj orizontal dirijat', 'aerian', 'șanț + foraj', 'șanț + aerian', 'șanț + foraj + aerian']} />
          <SelField label="Material conductă existentă" k="material_existent" value={data.material_existent} onChange={update} options={[{ value: 'PE', label: 'PE100 SDR11' }, { value: 'OL', label: 'OL' }]} />
          <SelField label="Diametru conductă existentă" k="dn_existent" value={data.dn_existent} onChange={update} options={dnExistentOpts} />
          <SelField label="Presiune conductă existentă" k="presiune_existenta" value={data.presiune_existenta} onChange={update} options={['joasă', 'redusă', 'medie', 'înaltă']} />
          <SelField label="Material conductă proiectată" k="material_proiectat" value={data.material_proiectat} onChange={update} options={[{ value: 'PE', label: 'PE100 SDR11' }, { value: 'OL', label: 'OL' }]} />
          <SelField label="Diametru conductă proiectată" k="dn_proiectat" value={data.dn_proiectat} onChange={update} options={dnProiectatOpts} />
          <SelField label="Presiune conductă proiectată" k="presiune_proiectata" value={data.presiune_proiectata} onChange={update} options={['joasă', 'redusă', 'medie', 'înaltă']} />
          <SelField label="Tipuri suduri" k="tipuri_suduri" value={data.tipuri_suduri} onChange={update} options={['electrofuziune', 'arc electric', 'electrofuziune + arc electric']} />
          <NumField label="P1 (bar)" k="p1_bar" value={data.p1_bar} onChange={update} suffix="bar" step="0.01" />
          <NumField label="P2 (bar)" k="p2_bar" value={data.p2_bar} onChange={update} suffix="bar" step="0.01" />
          <NumField label="Debit total extindere" k="debit_total_extindere" value={data.debit_total_extindere} onChange={update} suffix="m³/h" />
          <NumField label="Nr. contract racordare" k="contract_racordare_nr" value={data.contract_racordare_nr} onChange={update} />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Metodă cuplare</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descriere metodă</label>
            <input type="text" value={data.metoda_cuplare || ''} onChange={(e) => update('metoda_cuplare', e.target.value)} placeholder="Ex: vana tip clopot Dn 90 mm + sudură electrofuziune" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" data-testid="field-cnd-metoda_cuplare" />
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-700 mb-2">Piese folosite la cuplare</div>
        {(data.metoda_cuplare_piese || []).map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_140px_40px] gap-2 mb-2" data-testid={`piesa-${i}`}>
            <input value={p.nume || ''} onChange={(e) => updatePiesa(i, 'nume', e.target.value)} placeholder="Nume piesă" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={p.diametru || ''} onChange={(e) => updatePiesa(i, 'diametru', e.target.value)} placeholder="Diametru" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <button type="button" onClick={() => removePiesa(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={addPiesa} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="piesa-add">
          <Plus className="w-4 h-4" /> Adaugă piesă
        </button>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-emerald-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Opțiuni avansate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
            <input type="checkbox" checked={!!data.ol_comun} onChange={(e) => update('ol_comun', e.target.checked)} data-testid="field-cnd-ol_comun" />
            <span className="text-sm">Ordin lucru comun pentru toate branșamentele</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
            <input type="checkbox" checked={!!data.atr_comun} onChange={(e) => update('atr_comun', e.target.checked)} data-testid="field-cnd-atr_comun" />
            <span className="text-sm">ATR comun pentru toate branșamentele</span>
          </label>
          <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg">
            <input type="checkbox" checked={!!data.carte_tehnica_indisponibila} onChange={(e) => update('carte_tehnica_indisponibila', e.target.checked)} data-testid="field-cnd-carte_indisp" />
            <span className="text-sm">Carte tehnică extindere indisponibilă</span>
          </label>
        </div>
      </div>

      {/* Live calc panel */}
      <div className="border border-violet-200 rounded-xl p-5 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-violet-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-900">Calcule diametru (Ord. ANRE 89/2018)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-white border border-violet-200">
            <div className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">Diametru recomandat — presiune joasă (art. 51)</div>
            <div className="text-lg font-bold mt-1">{calc.dnRecJoasa.toFixed(2)} mm</div>
          </div>
          <div className="p-3 rounded-lg bg-white border border-violet-200">
            <div className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">Diametru recomandat — presiune medie (art. 50)</div>
            <div className="text-lg font-bold mt-1">{calc.dnRecMedie.toFixed(2)} mm</div>
          </div>
        </div>
      </div>

      {/* Branșamente nested */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Branșamente pe extindere</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold">Număr branșamente:</label>
            <input
              type="number"
              min="0"
              max="50"
              value={data.n_bransamente || 0}
              onChange={(e) => setBransamenteCount(e.target.value)}
              className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
              data-testid="field-cnd-n-bransamente"
            />
          </div>
        </div>
        {(data.bransamente || []).length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm">Setează numărul de branșamente pentru a configura fiecare individual.</div>
        )}
        {(data.bransamente || []).map((br, i) => (
          <details key={i} className="mb-3 border border-slate-200 rounded-lg bg-white" open={i === 0} data-testid={`cnd-bransament-${i}`}>
            <summary className="px-4 py-3 cursor-pointer font-semibold text-sm flex items-center justify-between hover:bg-slate-50">
              <span>Branșament #{i + 1} — {br.diametru_dn || '—'} × {br.lungime_m || '—'} m</span>
              <button type="button" onClick={(e) => { e.preventDefault(); removeBransament(i); }} className="p-1 text-rose-500 hover:bg-rose-50 rounded" data-testid={`cnd-bransament-${i}-remove`}>
                <X className="w-4 h-4" />
              </button>
            </summary>
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <GasBransamentSection data={br} onChange={(patch) => updateBransament(i, patch)} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
