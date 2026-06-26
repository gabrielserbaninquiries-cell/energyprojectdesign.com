/**
 * GasPhaseEntropy — Widget "entropia unui proiect, pe faze".
 * Conform cererii user: "iar dedesubt, serviciul de completare — entropia unui proiect, pe faze".
 *
 * Calculează completarea pe 6 faze majore ale unui proiect de gaze naturale:
 *  1. Date inițiale (beneficiar, amplasament, tip lucrare)
 *  2. Date tehnice (branșament, instalație utilizare, contor)
 *  3. Avize & acorduri (OSD, primărie, diriginte santier)
 *  4. Materiale & deviz (ANEXA 13 + cantități)
 *  5. Documente generate (CU, DTAC, PT, PIF)
 *  6. Verificare & semnături (VGD, RTE, RST)
 */
import { useMemo } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const PHASES = [
  {
    id: 'date_initiale',
    label: 'Date inițiale',
    icon: '①',
    keys: ['beneficiar_nume', 'beneficiar_cnp', 'amplasament_strada', 'amplasament_localitate', 'amplasament_judet', 'tip_lucrare'],
  },
  {
    id: 'date_tehnice',
    label: 'Date tehnice',
    icon: '②',
    keys: ['bransament_lungime_m', 'bransament_dn', 'bransament_material', 'contor_tip', 'regulator_tip', 'firida_tip', 'presiune_redusa_bar', 'debit_calcul_smc_h'],
  },
  {
    id: 'avize',
    label: 'Avize & acorduri',
    icon: '③',
    keys: ['osd_nume', 'osd_aviz_nr', 'primarie_aviz_nr', 'diriginte_santier_nume', 'isc_aviz', 'aviz_apa', 'aviz_electrica', 'aviz_telecom'],
  },
  {
    id: 'materiale',
    label: 'Materiale & deviz',
    icon: '④',
    keys: ['materiale_list', 'deviz_total_lei', 'manopera_total_lei', 'cantitate_teava_pe_m'],
  },
  {
    id: 'documente',
    label: 'Documente generate',
    icon: '⑤',
    keys: ['documente_cu_generat', 'documente_dtac_generat', 'documente_pt_generat', 'documente_pif_generat'],
  },
  {
    id: 'verificare',
    label: 'Verificare & semnături',
    icon: '⑥',
    keys: ['vgd_nume', 'vgd_legitimatie_anre', 'rte_nume', 'rte_atestat_mdlpa', 'rst_nume'],
  },
];

function computePhaseProgress(data, keys) {
  const total = keys.length;
  let filled = 0;
  keys.forEach((k) => {
    const v = data?.[k];
    if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) filled++;
  });
  return { filled, total, pct: total ? Math.round((filled / total) * 100) : 0 };
}

export default function GasPhaseEntropy({ data, onJumpToPhase }) {
  const phases = useMemo(() => PHASES.map((p) => ({ ...p, ...computePhaseProgress(data, p.keys) })), [data]);
  const overall = useMemo(() => {
    const tot = phases.reduce((s, p) => s + p.total, 0);
    const fil = phases.reduce((s, p) => s + p.filled, 0);
    return tot ? Math.round((fil / tot) * 100) : 0;
  }, [phases]);

  return (
    <section data-testid="phase-entropy" className="mb-6 border border-gray-200 bg-white">
      <header className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">// serviciul de completare</div>
          <h2 className="text-base font-bold tracking-tight">Entropia proiectului — completare pe faze</h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums leading-none" data-testid="entropy-overall">{overall}<span className="text-base text-gray-400">%</span></div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">global</div>
        </div>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200">
        {phases.map((p) => {
          const Icon = p.pct === 100 ? CheckCircle2 : p.pct === 0 ? Circle : AlertCircle;
          const tone = p.pct === 100 ? 'text-emerald-600' : p.pct === 0 ? 'text-gray-300' : 'text-amber-500';
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onJumpToPhase?.(p.id)}
              data-testid={`phase-${p.id}`}
              className="bg-white p-4 text-left hover:bg-violet-50/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">{p.icon} {p.label}</span>
                <Icon className={`w-4 h-4 ${tone}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{p.pct}<span className="text-sm text-gray-400">%</span></div>
              <div className="text-[10px] text-gray-500 mt-0.5">{p.filled}/{p.total} câmpuri</div>
              <div className="mt-2 h-1 bg-gray-100 overflow-hidden">
                <div className={`h-full ${p.pct === 100 ? 'bg-emerald-500' : p.pct >= 50 ? 'bg-amber-400' : p.pct > 0 ? 'bg-orange-400' : 'bg-gray-200'} transition-all`} style={{ width: `${p.pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
