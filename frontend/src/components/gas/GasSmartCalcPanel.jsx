/**
 * Smart Calc Panel — sumar global al calculelor inginerești
 */
import { useMemo } from 'react';
import {
  calcDiametruJoasa, calcDiametruMedie, calcVitezaGaz, checkVitezaConform,
  sumDebit, pickGasMeter, pickRegulator, calcLatimeSant, calcPatCaramizi,
  PE_DIAMETERS,
} from '../../lib/gasCalcs';
import { Calculator, Wind, Gauge, Ruler, Activity } from 'lucide-react';

function MetricCard({ label, value, unit, icon: Icon, accent = 'violet' }) {
  const colors = {
    violet: 'from-violet-500 to-indigo-600',
    blue: 'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600',
  }[accent] || 'from-violet-500 to-indigo-600';
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className={`inline-flex items-center justify-center w-9 h-9 bg-gradient-to-br ${colors} rounded-lg text-white mb-2`}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
        {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

export default function GasSmartCalcPanel({ data }) {
  const calcs = useMemo(() => {
    const br = data.bransament || {};
    const ext = data.extindere || {};
    const iu = data.instalatie || {};

    // Branșament
    const brConsumators = br.consumatori || [];
    const brQ = sumDebit(brConsumators);
    const brDn = Number(String(br.diametru_dn || '32').replace(/\D/g, '')) || 32;
    const pe = PE_DIAMETERS.find(p => p.dn === brDn);
    const brIdInterior = pe ? pe.id_mm : brDn;
    const brViteza = calcVitezaGaz(brQ || 1, brIdInterior);
    const brVCheck = checkVitezaConform(brViteza, br.tip || 'subteran');
    const brLatime = calcLatimeSant(brDn);
    const brPat = calcPatCaramizi(brLatime, br.lungime_m || 0);
    const brMeter = pickGasMeter(brQ || 1);
    const brRegulator = pickRegulator(brQ || 1);

    // Extindere
    const extQ = Number(ext.debit_total_extindere) || 0;
    const extL = Number(ext.lungime_totala_m) || 0;
    const extDnJoasa = calcDiametruJoasa({ qM3h: extQ, lengthM: extL, deltaPMbar: 5 });
    const extDnMedie = calcDiametruMedie({ qM3h: extQ, lengthKm: extL / 1000, p1Bar: ext.p1_bar || 2, p2Bar: ext.p2_bar || 1.95 });

    // Instalație utilizare
    const iuQ = sumDebit(iu.consumatori || []);
    const iuL = (iu.bilant_traseu || []).reduce((acc, b) => acc + (Number(b.lungime_m) || 0), 0);
    const iuDn = calcDiametruJoasa({ qM3h: iuQ, lengthM: iuL || 10, deltaPMbar: 5 });
    const iuMeter = pickGasMeter(iuQ || 1);

    return {
      br: { Q: brQ, viteza: brViteza, vCheck: brVCheck, latime: brLatime, pat: brPat, meter: brMeter, regulator: brRegulator },
      ext: { Q: extQ, L: extL, dnJoasa: extDnJoasa, dnMedie: extDnMedie },
      iu: { Q: iuQ, L: iuL, dn: iuDn, meter: iuMeter },
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-violet-600" />
          Calcule inginerești — sumar
        </h2>
        <p className="text-sm text-slate-500">Toate calculele se actualizează în timp real pe baza configurației.</p>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Branșament</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Debit total" value={calcs.br.Q.toFixed(2)} unit="Nmc/h" icon={Activity} accent="violet" />
          <MetricCard label="Viteză gaz" value={calcs.br.viteza.toFixed(2)} unit="m/s" icon={Wind} accent={calcs.br.vCheck.ok ? 'emerald' : 'rose'} />
          <MetricCard label="Lățime șanț" value={calcs.br.latime.toFixed(2)} unit="m" icon={Ruler} accent="blue" />
          <MetricCard label="Pat cărămizi" value={calcs.br.pat.toFixed(2)} unit="mp" icon={Ruler} accent="amber" />
          <MetricCard label="Contor recomandat" value={calcs.br.meter.code} unit="" icon={Gauge} accent="violet" />
          <MetricCard label="Regulator" value={calcs.br.regulator} unit="m³/h" icon={Gauge} accent="emerald" />
        </div>
        {!calcs.br.vCheck.ok && calcs.br.Q > 0 && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-900">
            ⚠️ {calcs.br.vCheck.msg}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Extindere</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Debit extindere" value={calcs.ext.Q.toFixed(2)} unit="m³/h" accent="violet" icon={Activity} />
          <MetricCard label="Lungime totală" value={calcs.ext.L.toFixed(0)} unit="m" accent="blue" icon={Ruler} />
          <MetricCard label="Dn joasă (calc)" value={calcs.ext.dnJoasa.toFixed(1)} unit="mm" accent="emerald" icon={Calculator} />
          <MetricCard label="Dn medie (calc)" value={calcs.ext.dnMedie.toFixed(1)} unit="mm" accent="amber" icon={Calculator} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Instalație utilizare</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Debit total instalat" value={calcs.iu.Q.toFixed(2)} unit="Nmc/h" accent="violet" icon={Activity} />
          <MetricCard label="Lungime traseu" value={calcs.iu.L.toFixed(1)} unit="ml" accent="blue" icon={Ruler} />
          <MetricCard label="Dn recomandat" value={calcs.iu.dn.toFixed(1)} unit="mm" accent="emerald" icon={Calculator} />
          <MetricCard label="Contor recomandat" value={calcs.iu.meter.code} unit="" accent="amber" icon={Gauge} />
        </div>
      </div>

      <div className="p-4 bg-slate-900 text-white rounded-xl text-xs leading-relaxed">
        <div className="text-violet-300 font-bold uppercase tracking-wider mb-2">// Referințe normative</div>
        <ul className="space-y-1 text-slate-300">
          <li>• Ord. ANRE 89/2018 — NTPEE 2018 (Normele Tehnice pentru Proiectarea, Executarea și Exploatarea Sistemelor de Alimentare cu Gaze Naturale)</li>
          <li>• Art. 50 — formula diametru presiune medie/redusă</li>
          <li>• Art. 51 — formula diametru presiune joasă</li>
          <li>• Art. 57 — viteze maxime admise (suprateran 20 m/s, subteran 40 m/s)</li>
          <li>• Art. 58 — diametre minime obligatorii</li>
        </ul>
      </div>
    </div>
  );
}
