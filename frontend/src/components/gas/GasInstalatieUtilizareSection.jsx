/**
 * Instalație utilizare — consumatori, camere aparate cu V/Q, priză aer, detectori
 */
import { useMemo } from 'react';
import {
  TIP_INSTALATIE_UTILIZARE, IMOBIL_TIPURI,
  calcVQRoom, calcSVN, calcPrizaAer, sumDebit, pickGasMeter, calcDiametruJoasa, calcVitezaGaz,
  PE_DIAMETERS, OL_DIAMETERS,
} from '../../lib/gasCalcs';
import { Plus, X, Home, Wind, Calculator, AlertTriangle } from 'lucide-react';

function Field({ label, k, value, onChange, type = 'text', options, suffix, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      {options ? (
        <select value={value || ''} onChange={(e) => onChange(k, e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" data-testid={`field-iu-${k}`}>
          <option value="">— alege —</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className="relative">
          <input type={type} value={value ?? ''} onChange={(e) => onChange(k, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" data-testid={`field-iu-${k}`} />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
        </div>
      )}
    </div>
  );
}

export default function GasInstalatieUtilizareSection({ data, onChange }) {
  const update = (k, v) => onChange({ [k]: v });
  const consumatori = data.consumatori || [];
  const camere = data.camere || [];
  const fittinguri = data.fittinguri || [];
  const robineti = data.robineti || [];
  const electrovalve = data.electrovalve || [];
  const bilantTraseu = data.bilant_traseu || [];

  // Live calcs
  const calc = useMemo(() => {
    const debitTotal = sumDebit(consumatori);
    const meter = pickGasMeter(debitTotal || 1);
    const totalFittinguri = fittinguri.reduce((acc, f) => acc + (Number(f.numar) || 0), 0);
    const totalRobineti = robineti.reduce((acc, r) => acc + (Number(r.numar) || 0), 0);
    const totalElectrovalve = electrovalve.reduce((acc, e) => acc + (Number(e.numar) || 0), 0);
    const lungimeTotala = bilantTraseu.reduce((acc, b) => acc + (Number(b.lungime_m) || 0), 0);
    // Diametru recomandat (presiune joasă — instalație utilizare)
    const dnRec = calcDiametruJoasa({ qM3h: debitTotal, lengthM: lungimeTotala || 10, deltaPMbar: 5 });
    return { debitTotal, meter, totalFittinguri, totalRobineti, totalElectrovalve, lungimeTotala, dnRec };
  }, [consumatori, fittinguri, robineti, electrovalve, bilantTraseu]);

  // Camere — calc per cameră
  const cameraStats = useMemo(() => {
    return camere.map((cam) => {
      const S = Number(cam.suprafata_mp) || 0;
      const H = Number(cam.inaltime_m) || 0;
      const V = S * H;
      const SVN = calcSVN(V);
      // debit aparate flacără deschisă în această cameră
      const Qcamera = consumatori
        .filter((c) => c.incapere === cam.nume && c.flacara_deschisa)
        .reduce((acc, c) => acc + (Number(c.debit_nmc) || 0), 0);
      const vq = calcVQRoom({ suprafataMp: S, inaltimeM: H, debitTotalCameraNmc: Qcamera });
      const priza = calcPrizaAer(Qcamera);
      return { V, SVN, Qcamera, vq, priza };
    });
  }, [camere, consumatori]);

  // Detectori automați (camere cu flacără deschisă + holuri)
  const detectoriAuto = useMemo(() => {
    return camere.filter((cam) => {
      const Q = consumatori.filter((c) => c.incapere === cam.nume && c.flacara_deschisa).reduce((a, c) => a + (Number(c.debit_nmc) || 0), 0);
      return Q > 0;
    }).length;
  }, [camere, consumatori]);

  // CRUD helpers
  const addConsumator = () => update('consumatori', [...consumatori, { nume: '', debit_nmc: 0, incapere: '', flacara_deschisa: false, status: 'nou' }]);
  const updateConsumator = (i, k, v) => {
    const lst = [...consumatori]; lst[i] = { ...lst[i], [k]: v }; update('consumatori', lst);
  };
  const removeConsumator = (i) => update('consumatori', consumatori.filter((_, idx) => idx !== i));

  const addCamera = () => update('camere', [...camere, { nume: '', suprafata_mp: 0, inaltime_m: 2.7, sve_existenta_mp: 0 }]);
  const updateCamera = (i, k, v) => {
    const lst = [...camere]; lst[i] = { ...lst[i], [k]: v }; update('camere', lst);
  };
  const removeCamera = (i) => update('camere', camere.filter((_, idx) => idx !== i));

  const addBilant = () => update('bilant_traseu', [...bilantTraseu, { material: 'OL', dn: '', lungime_m: 0 }]);
  const updateBilant = (i, k, v) => {
    const lst = [...bilantTraseu]; lst[i] = { ...lst[i], [k]: v }; update('bilant_traseu', lst);
  };
  const removeBilant = (i) => update('bilant_traseu', bilantTraseu.filter((_, idx) => idx !== i));

  const addFitting = () => update('fittinguri', [...fittinguri, { nume: 'cot', diametru: '', material: 'OL', numar: 1 }]);
  const updateFitting = (i, k, v) => { const lst = [...fittinguri]; lst[i] = { ...lst[i], [k]: v }; update('fittinguri', lst); };
  const removeFitting = (i) => update('fittinguri', fittinguri.filter((_, idx) => idx !== i));

  const addRobinet = () => update('robineti', [...robineti, { diametru: '', material: 'OL', numar: 1 }]);
  const updateRobinet = (i, k, v) => { const lst = [...robineti]; lst[i] = { ...lst[i], [k]: v }; update('robineti', lst); };
  const removeRobinet = (i) => update('robineti', robineti.filter((_, idx) => idx !== i));

  const addElectrovalva = () => update('electrovalve', [...electrovalve, { diametru: '', material: 'OL', numar: 1 }]);
  const updateElectrovalva = (i, k, v) => { const lst = [...electrovalve]; lst[i] = { ...lst[i], [k]: v }; update('electrovalve', lst); };
  const removeElectrovalva = (i) => update('electrovalve', electrovalve.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Home className="w-6 h-6 text-violet-600" />
          Instalație utilizare gaze naturale (IUGN)
        </h2>
        <p className="text-sm text-slate-500">Consumatori, camere aparate, calcule V/Q + priză aer + detectori, fittinguri și robineți.</p>
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-violet-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Tip instalație</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Tip instalație" k="tip" value={data.tip} onChange={update} options={TIP_INSTALATIE_UTILIZARE} />
          <Field label="Lucrare executată din" k="executata_din" value={data.executata_din} onChange={update} options={['coloană comună existentă', 'coloană nouă', 'branșament existent']} />
          <Field label="Tip imobil" k="imobil_tip" value={data.imobil_tip} onChange={update} options={IMOBIL_TIPURI} />
          <Field label="Contor" k="contor_status" value={data.contor_status} onChange={update} options={['existent', 'nou']} />
        </div>
      </div>

      {/* Consumatori */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Consumatori</h3>
        <div className="space-y-2">
          {consumatori.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1.5fr_100px_1fr_120px_120px_40px] gap-2 items-end p-2 bg-white border border-slate-200 rounded-lg" data-testid={`iu-consumator-${i}`}>
              <input value={c.nume || ''} onChange={(e) => updateConsumator(i, 'nume', e.target.value)} placeholder="Nume aparat" className="px-2 py-1.5 border border-slate-300 rounded text-sm" />
              <input type="number" step="0.01" value={c.debit_nmc || ''} onChange={(e) => updateConsumator(i, 'debit_nmc', Number(e.target.value))} placeholder="Nmc/h" className="px-2 py-1.5 border border-slate-300 rounded text-sm" />
              <input value={c.incapere || ''} onChange={(e) => updateConsumator(i, 'incapere', e.target.value)} placeholder="Încăpere" className="px-2 py-1.5 border border-slate-300 rounded text-sm" />
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={!!c.flacara_deschisa} onChange={(e) => updateConsumator(i, 'flacara_deschisa', e.target.checked)} /> Flacără deschisă
              </label>
              <select value={c.status || 'nou'} onChange={(e) => updateConsumator(i, 'status', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm">
                <option value="nou">Nou</option>
                <option value="existent">Existent</option>
                <option value="dezafectat">Dezafectat</option>
              </select>
              <button type="button" onClick={() => removeConsumator(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addConsumator} className="mt-2 text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="iu-consumator-add">
          <Plus className="w-4 h-4" /> Adaugă consumator
        </button>
        <div className="mt-3 p-3 bg-violet-100 rounded-lg flex items-center justify-between">
          <span className="text-sm font-semibold text-violet-900">Debit total instalat</span>
          <span className="text-xl font-bold tabular-nums text-violet-900" data-testid="iu-debit-total">{calc.debitTotal.toFixed(2)} Nmc/h</span>
        </div>
        <div className="mt-2 text-sm text-violet-700">Contor recomandat: <strong>{calc.meter.code}</strong> (Qmax {calc.meter.qmax_m3h} m³/h)</div>
      </div>

      {/* Camere aparate */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-emerald-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
          <Wind className="w-4 h-4" />
          Camere aparate — Calcul V/Q + priză aer
        </h3>
        <div className="space-y-3">
          {camere.map((cam, i) => {
            const stat = cameraStats[i] || { V: 0, SVN: 0, vq: { ratio: 0, ok: true }, priza: 0 };
            return (
              <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg" data-testid={`iu-camera-${i}`}>
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_120px_120px_120px_40px] gap-2 items-end">
                  <input value={cam.nume || ''} onChange={(e) => updateCamera(i, 'nume', e.target.value)} placeholder="Nume încăpere" className="px-2 py-1.5 border border-slate-300 rounded text-sm" data-testid={`iu-camera-${i}-nume`} />
                  <div>
                    <label className="block text-[10px] text-slate-500">Suprafață (mp)</label>
                    <input type="number" step="0.1" value={cam.suprafata_mp || ''} onChange={(e) => updateCamera(i, 'suprafata_mp', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Înălțime H (m)</label>
                    <input type="number" step="0.01" value={cam.inaltime_m || ''} onChange={(e) => updateCamera(i, 'inaltime_m', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">SVe existentă (mp)</label>
                    <input type="number" step="0.01" value={cam.sve_existenta_mp || ''} onChange={(e) => updateCamera(i, 'sve_existenta_mp', Number(e.target.value))} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm" />
                  </div>
                  <button type="button" onClick={() => removeCamera(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2 text-xs" data-testid={`iu-camera-${i}-calcs`}>
                  <div className="p-2 bg-slate-50 rounded">V = S × H = <strong className="tabular-nums">{stat.V.toFixed(2)} m³</strong></div>
                  <div className="p-2 bg-slate-50 rounded">SVN = V × 0.02 = <strong className="tabular-nums">{stat.SVN.toFixed(2)} mp</strong></div>
                  <div className={`p-2 rounded ${stat.vq.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>V/Q = <strong className="tabular-nums">{stat.vq.ratio}</strong> {stat.vq.ok ? '✓' : '⚠'}</div>
                  <div className="p-2 bg-slate-50 rounded">Q flacără deschisă = <strong className="tabular-nums">{stat.Qcamera.toFixed(2)} m³/h</strong></div>
                  <div className="p-2 bg-slate-50 rounded">Priză aer = <strong className="tabular-nums">{stat.priza.toFixed(4)} m²</strong></div>
                </div>
                {!stat.vq.ok && stat.Qcamera > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{stat.vq.msg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" onClick={addCamera} className="mt-2 text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="iu-camera-add">
          <Plus className="w-4 h-4" /> Adaugă cameră
        </button>
        <div className="mt-3 p-3 bg-emerald-100 rounded-lg flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-900">Număr detectori gaze recomandat</span>
          <span className="text-xl font-bold tabular-nums text-emerald-900" data-testid="iu-detectori-nr">{detectoriAuto}</span>
        </div>
      </div>

      {/* Bilanț traseu */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50/30">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">Bilanț traseu (material × lungime × diametru)</h3>
        <div className="space-y-2">
          {bilantTraseu.map((b, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[120px_140px_120px_40px] gap-2 items-end" data-testid={`iu-bilant-${i}`}>
              <select value={b.material || 'OL'} onChange={(e) => updateBilant(i, 'material', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm">
                <option value="OL">OL</option>
                <option value="PE">PE100 SDR11</option>
              </select>
              <select value={b.dn || ''} onChange={(e) => updateBilant(i, 'dn', e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded text-sm">
                <option value="">— Dn —</option>
                {(b.material === 'OL' ? OL_DIAMETERS.map(o => `OL ${o.dn}`) : PE_DIAMETERS.map(p => `PE ${p.dn}`)).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="number" step="0.1" value={b.lungime_m || ''} onChange={(e) => updateBilant(i, 'lungime_m', Number(e.target.value))} placeholder="Lungime (m)" className="px-2 py-1.5 border border-slate-300 rounded text-sm" />
              <button type="button" onClick={() => removeBilant(i)} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addBilant} className="mt-2 text-sm text-violet-700 font-semibold flex items-center gap-1 hover:bg-violet-50 px-2 py-1 rounded" data-testid="iu-bilant-add">
          <Plus className="w-4 h-4" /> Adaugă tronson
        </button>
        <div className="mt-3 p-3 bg-blue-100 rounded-lg flex items-center justify-between">
          <span className="text-sm font-semibold text-blue-900">Lungime totală traseu</span>
          <span className="text-xl font-bold tabular-nums text-blue-900" data-testid="iu-lungime-totala">{calc.lungimeTotala.toFixed(2)} ml</span>
        </div>
      </div>

      {/* Fittinguri & Robineți & Electrovalve */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fittinguri */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Fittinguri ({calc.totalFittinguri} buc)</h4>
          {fittinguri.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_30px] gap-1 mb-1" data-testid={`iu-fitting-${i}`}>
              <select value={f.nume || 'cot'} onChange={(e) => updateFitting(i, 'nume', e.target.value)} className="px-1.5 py-1 border border-slate-300 rounded text-xs">
                <option value="cot">Cot</option>
                <option value="reductie">Reducție</option>
                <option value="mufa">Mufă</option>
                <option value="teu">Teu</option>
              </select>
              <input type="number" value={f.numar || 1} onChange={(e) => updateFitting(i, 'numar', Number(e.target.value))} className="px-1.5 py-1 border border-slate-300 rounded text-xs" />
              <button type="button" onClick={() => removeFitting(i)} className="text-rose-500 text-xs"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <button type="button" onClick={addFitting} className="text-xs text-violet-700 mt-1" data-testid="iu-fitting-add"><Plus className="w-3 h-3 inline" /> Adaugă</button>
        </div>

        {/* Robineți */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Robineți ({calc.totalRobineti} buc)</h4>
          {robineti.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_30px] gap-1 mb-1" data-testid={`iu-robinet-${i}`}>
              <input value={r.diametru || ''} onChange={(e) => updateRobinet(i, 'diametru', e.target.value)} placeholder="Diametru" className="px-1.5 py-1 border border-slate-300 rounded text-xs" />
              <input type="number" value={r.numar || 1} onChange={(e) => updateRobinet(i, 'numar', Number(e.target.value))} className="px-1.5 py-1 border border-slate-300 rounded text-xs" />
              <button type="button" onClick={() => removeRobinet(i)} className="text-rose-500"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <button type="button" onClick={addRobinet} className="text-xs text-violet-700 mt-1" data-testid="iu-robinet-add"><Plus className="w-3 h-3 inline" /> Adaugă</button>
        </div>

        {/* Electrovalve */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Electrovalve ({calc.totalElectrovalve} buc)</h4>
          {electrovalve.map((e, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_30px] gap-1 mb-1" data-testid={`iu-electrovalva-${i}`}>
              <input value={e.diametru || ''} onChange={(ev) => updateElectrovalva(i, 'diametru', ev.target.value)} placeholder="Diametru" className="px-1.5 py-1 border border-slate-300 rounded text-xs" />
              <input type="number" value={e.numar || 1} onChange={(ev) => updateElectrovalva(i, 'numar', Number(ev.target.value))} className="px-1.5 py-1 border border-slate-300 rounded text-xs" />
              <button type="button" onClick={() => removeElectrovalva(i)} className="text-rose-500"><X className="w-3 h-3" /></button>
            </div>
          ))}
          <button type="button" onClick={addElectrovalva} className="text-xs text-violet-700 mt-1" data-testid="iu-electrovalva-add"><Plus className="w-3 h-3 inline" /> Adaugă</button>
        </div>
      </div>

      {/* Diametru recomandat */}
      <div className="border border-violet-200 rounded-xl p-5 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-violet-700" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-violet-900">Diametru minim recomandat (presiune joasă)</h3>
        </div>
        <div className="p-3 bg-white rounded-lg border border-violet-200" data-testid="iu-dn-recomandat">
          <div className="text-3xl font-bold text-violet-900 tabular-nums">{calc.dnRec.toFixed(2)} <span className="text-base font-normal">mm</span></div>
          <div className="text-xs text-slate-500 mt-1">Conform art. 51 Ord. ANRE 89/2018 — instalație utilizare gaze naturale.</div>
        </div>
      </div>
    </div>
  );
}
