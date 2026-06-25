/**
 * Branșament — secțiune completă cu calcule live
 */
import { useMemo } from 'react';
import {
  PE_DIAMETERS, OL_DIAMETERS, FIRIDA_TIPURI, GAS_METERS, REGULATOR_FLOWS,
  calcLatimeSant, calcPatCaramizi, calcDiametruTub, calcVitezaGaz,
  checkVitezaConform, pickGasMeter, pickRegulator, pickRobinet, sumDebit,
} from '../../lib/gasCalcs';
import { Plus, X, Calculator, Flame } from 'lucide-react';
import DevPlaceholderTag from './DevPlaceholderTag';

function NumField({ label, k, value, onChange, suffix, step = 'any' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <DevPlaceholderTag pkey={k ? `br_${k}` : null} />
      <div className="relative">
        <input
          type="number"
          step={step}
          value={value ?? ''}
          onChange={(e) => onChange(k, e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          data-testid={`field-br-${k}`}
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
      <DevPlaceholderTag pkey={k ? `br_${k}` : null} />
      <select
        value={value || ''}
        onChange={(e) => onChange(k, e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        data-testid={`field-br-${k}`}
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

function TxtField({ label, k, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(k, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        data-testid={`field-br-${k}`}
      />
    </div>
  );
}

function CalcCard({ label, value, unit, ok }) {
  return (
    <div className={`p-3 rounded-lg border ${ok === false ? 'bg-rose-50 border-rose-200' : 'bg-violet-50 border-violet-200'}`}>
      <div className="text-[10px] uppercase tracking-wider text-violet-700 font-semibold">{label}</div>
      <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
        {value} <span className="text-xs font-normal text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export default function GasBransamentSection({ data, onChange }) {
  const update = (k, v) => onChange({ [k]: v });

  const PE_OPTS = PE_DIAMETERS.map(p => `PE ${p.dn}`);
  const OL_OPTS = OL_DIAMETERS.map(o => `OL ${o.dn}`);
  const dnOptions = data.material === 'OL' ? OL_OPTS : PE_OPTS;

  // Live calcs
  const calcs = useMemo(() => {
    const dnStr = String(data.diametru_dn || '').replace(/\D/g, '');
    const dn = Number(dnStr) || 32;
    const lungime = Number(data.lungime_m) || 0;
    const debitTotal = sumDebit(data.consumatori || []);
    const latime = calcLatimeSant(dn);
    const pat = calcPatCaramizi(latime, lungime);
    const tubMm = data.tub_protectie ? calcDiametruTub({ tipLucrare: 'racord', material: data.material || 'PE', deMm: dn }) : 0;
    // For internal diameter use PE catalog if PE
    let idInterior = dn;
    if (data.material === 'PE') {
      const pe = PE_DIAMETERS.find((p) => p.dn === dn);
      if (pe) idInterior = pe.id_mm;
    } else if (data.material === 'OL') {
      const ol = OL_DIAMETERS.find((o) => `OL ${o.dn}` === data.diametru_dn);
      if (ol) idInterior = ol.id_mm;
    }
    const viteza = calcVitezaGaz(debitTotal || 1, idInterior);
    const vitezaCheck = checkVitezaConform(viteza, data.tip || 'subteran');
    const regulator = pickRegulator(debitTotal || 1);
    const meter = pickGasMeter(debitTotal || 1);
    const robinet = pickRobinet(data.material || 'PE', data.diametru_dn || 'PE 32');
    return { dn, latime, pat, tubMm, viteza, vitezaCheck, regulator, meter, robinet, debitTotal };
  }, [data]);

  // Consumatori CRUD
  const addConsumator = () => {
    const lst = [...(data.consumatori || []), { nume: '', debit_nmc: 0 }];
    update('consumatori', lst);
  };
  const removeConsumator = (i) => {
    const lst = (data.consumatori || []).filter((_, idx) => idx !== i);
    update('consumatori', lst);
  };
  const updateConsumator = (i, k, v) => {
    const lst = [...(data.consumatori || [])];
    lst[i] = { ...lst[i], [k]: v };
    update('consumatori', lst);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Flame className="w-6 h-6 text-violet-600" />
          Branșament gaze naturale
        </h2>
        <p className="text-sm text-slate-500">Material, diametru, robinet, regulator, contor, firidă. Calculele se fac automat.</p>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Material & dimensionare</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SelField label="Material branșament" k="material" value={data.material} onChange={update} options={[{ value: 'PE', label: 'Polietilenă (PE100 SDR11)' }, { value: 'OL', label: 'Oțel (OL)' }]} />
          <SelField label="Diametru" k="diametru_dn" value={data.diametru_dn} onChange={update} options={dnOptions} />
          <NumField label="Lungime branșament" k="lungime_m" value={data.lungime_m} onChange={update} suffix="m" />
          <SelField label="Tip branșament" k="tip" value={data.tip} onChange={update} options={['subteran', 'ramificat']} />
          <SelField label="Execuție prin" k="executie" value={data.executie} onChange={update} options={['șanț deschis', 'foraj orizontal dirijat', 'aerian']} />
          <SelField label="Presiune branșament" k="presiune" value={data.presiune} onChange={update} options={['redusă', 'medie']} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <NumField label="Poziție — distanță față de limită" k="pozitie_distanta" value={data.pozitie_distanta} onChange={update} suffix="m" />
          <SelField label="Limită de referință" k="pozitie_limita" value={data.pozitie_limita} onChange={update} options={['stânga', 'dreapta']} />
          <SelField label="Branșamentul se va racorda la" k="racordare_la" value={data.racordare_la} onChange={update} options={['conducta existentă', 'conducta proiectată']} />
          <div className="md:col-span-3">
            <TxtField label="Amplasament conductă în care se racordează branșamentul (stradă, sector, oraș, județ)" k="conducta_amplasament" value={data.conducta_amplasament} onChange={update} placeholder="Ex: Strada Aurel Vlaicu, Sector 1, București" />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Tub de protecție</h3>
        <label className="flex items-center gap-2 mb-3">
          <input type="checkbox" checked={!!data.tub_protectie} onChange={(e) => update('tub_protectie', e.target.checked)} data-testid="field-br-tub_protectie" />
          <span className="text-sm font-semibold text-slate-700">Aplicare tub de protecție branșament</span>
        </label>
        {data.tub_protectie && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NumField label="Lungime tub" k="tub_lungime_m" value={data.tub_lungime_m} onChange={update} suffix="m" />
            <CalcCard label="Diametru min. tub (auto)" value={calcs.tubMm.toFixed(0)} unit="mm" />
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-indigo-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Echipare branșament</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SelField label="Tip firidă" k="firida_tip" value={data.firida_tip} onChange={update} options={FIRIDA_TIPURI} />
          <TxtField label="Model firidă" k="firida_model" value={data.firida_model} onChange={update} placeholder="Ex: FPRM-F50-SF6-01-SP" />
          <TxtField label="Diametru conductă principală" k="conducta_principala_dn" value={data.conducta_principala_dn} onChange={update} placeholder="Ex: PE 110" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-emerald-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Presiune & viteză gaz</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <NumField label="P1 — presiune intrare" k="p1_bar" value={data.p1_bar ?? 1.5} onChange={update} suffix="bar" step="0.01" />
          <NumField label="P2 — presiune ieșire" k="p2_bar" value={data.p2_bar ?? 1.45} onChange={update} suffix="bar" step="0.01" />
          <CalcCard label="ΔP = P1 − P2" value={(Number(data.p1_bar ?? 1.5) - Number(data.p2_bar ?? 1.45)).toFixed(3)} unit="bar" />
          <CalcCard label="L (km)" value={((Number(data.lungime_m) || 0) / 1000).toFixed(4)} unit="km" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Consumatori</h3>
        <div className="space-y-2 mb-3">
          {(data.consumatori || []).map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_140px_40px] gap-2 items-end" data-testid={`consumator-${i}`}>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nume consumator</label>
                <input
                  value={c.nume || ''}
                  onChange={(e) => updateConsumator(i, 'nume', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Ex: Centrală termică Vaillant 24 kW"
                  data-testid={`consumator-${i}-nume`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Debit Nmc/h</label>
                <input
                  type="number"
                  step="0.01"
                  value={c.debit_nmc || ''}
                  onChange={(e) => updateConsumator(i, 'debit_nmc', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  data-testid={`consumator-${i}-debit`}
                />
              </div>
              <button type="button" onClick={() => removeConsumator(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" data-testid={`consumator-${i}-remove`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addConsumator} className="text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="consumator-add">
          <Plus className="w-4 h-4" /> Adaugă consumator
        </button>
        <div className="mt-4 p-3 bg-violet-100 rounded-lg flex items-center justify-between">
          <span className="text-sm font-semibold text-violet-900">Debit total consumatori</span>
          <span className="text-xl font-bold tabular-nums text-violet-900" data-testid="br-debit-total">{calcs.debitTotal.toFixed(2)} Nmc/h</span>
        </div>
      </div>

      {/* Live calculations panel */}
      <div className="border border-violet-200 rounded-xl p-5 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-violet-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-900">Calcule automate live</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="br-calcs-live">
          <CalcCard label="Lățime șanț" value={calcs.latime.toFixed(2)} unit="m" />
          <CalcCard label="Pat cărămizi" value={calcs.pat.toFixed(2)} unit="mp" />
          <CalcCard label="Viteză gaz" value={calcs.viteza.toFixed(2)} unit="m/s" ok={calcs.vitezaCheck.ok} />
          <CalcCard label="Robinet (calc)" value={`${calcs.robinet.material} ${calcs.robinet.dn}`} unit="" />
          <CalcCard label="Regulator (calc)" value={calcs.regulator} unit="m³/h" />
          <CalcCard label="Contor (calc)" value={calcs.meter.code} unit={`(Q max ${calcs.meter.qmax_m3h})`} />
          {data.tub_protectie && <CalcCard label="Tub protecție Di min" value={calcs.tubMm.toFixed(0)} unit="mm" />}
        </div>
        <div className={`mt-3 p-3 rounded-lg text-xs font-semibold ${calcs.vitezaCheck.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
          {calcs.vitezaCheck.msg}
        </div>
      </div>
    </div>
  );
}
