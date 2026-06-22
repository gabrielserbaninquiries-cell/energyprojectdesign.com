/**
 * GasChronologicalStepper — V9.1
 *
 * Cerință user (mesaj 24): "stepper cronologic vizual (optional): 10 etape orizontal
 * sus in Studio Gaze (Date proiect -> Date tehnice -> Avize -> DTAC -> AC ->
 * PTH -> Avize finale -> Dispozitie -> Carte tehnica -> Receptie)".
 *
 * Componenta arată progresul cronologic al proiectului bazat pe câmpurile din
 * `data` (FIELDS_REGISTRY). Fiecare etapă are un criteriu de "completed" definit
 * de prezența anumitor câmpuri cheie.
 *
 * Înlocuiește pipeline-ul anterior bazat pe pachete ad-hoc (V8.3 GasServicePipeline)
 * la cererea explicită a userului V9.1: "elimina adaugarea de pachete ad hoc".
 */
import { useMemo } from 'react';
import {
  ClipboardList, Cog, Stamp, FileText, FileCheck2, Hammer,
  ShieldCheck, ClipboardCheck, BookOpen, BadgeCheck, ChevronRight,
} from 'lucide-react';

// Definirea celor 10 etape cronologice + criteriu "completed"
const STEPS = [
  {
    id: 'date-proiect',
    label: 'Date proiect',
    icon: ClipboardList,
    desc: 'Beneficiar, amplasament, scop',
    fields: ['beneficiar_nume', 'loc_consum_strada', 'tipul_lucrarii'],
  },
  {
    id: 'date-tehnice',
    label: 'Date tehnice',
    icon: Cog,
    desc: 'Debit, presiune, conductă, contor',
    fields: ['debit_instalat_mc_h', 'br_material', 'br_diametru_dn', 'br_lungime_m'],
  },
  {
    id: 'avize',
    label: 'Avize',
    icon: Stamp,
    desc: 'Apă Nova, Enel, Telekom, NetCity, ...',
    fields: ['aviz_apa_nova_numar', 'aviz_enel_numar', 'aviz_telekom_numar'],
  },
  {
    id: 'dtac',
    label: 'DTAC',
    icon: FileText,
    desc: 'Documentație Tehnică pentru Autorizarea Construirii',
    fields: ['cu_numar', 'cu_data_emitere', 'proiectant_legitimatie_anre'],
  },
  {
    id: 'ac',
    label: 'AC / Acord drum',
    icon: FileCheck2,
    desc: 'Autorizație construire + acord drum',
    fields: ['ac_numar', 'ac_data_emitere', 'aviz_drumuri_numar'],
  },
  {
    id: 'pth',
    label: 'PTH',
    icon: Hammer,
    desc: 'Proiect Tehnic + Detalii Execuție',
    fields: ['executant_societate', 'executant_atestat_anre', 'verificator_vgd_nume'],
  },
  {
    id: 'avize-finale',
    label: 'Avize finale',
    icon: ShieldCheck,
    desc: 'Probe presiune + etanșeitate + ISC',
    fields: ['proba_rezistenta_data', 'proba_etanseitate_data', 'aviz_isc_numar'],
  },
  {
    id: 'dispozitie-santier',
    label: 'Dispoziție șantier',
    icon: ClipboardCheck,
    desc: 'Dispoziție santier + PV faze determinante',
    fields: ['pv_predare_amplasament_data', 'anunt_incepere_lucrari_data', 'faza_det_3_data'],
  },
  {
    id: 'carte-tehnica',
    label: 'Carte tehnică',
    icon: BookOpen,
    desc: 'A/B/C/D conform HG 273/1994',
    fields: ['ct_sectiune_A', 'ct_sectiune_B', 'ct_sectiune_C', 'ct_sectiune_D'],
  },
  {
    id: 'receptie',
    label: 'Recepție',
    icon: BadgeCheck,
    desc: 'PVRTL + PIF + PVRF',
    fields: ['pv_receptie_terminare_lucrari_data', 'pif_data_efectiva', 'pvrf_data_planificata'],
  },
];

// Calculează % completitudine per etapă
function stepCompletion(step, data) {
  if (!step.fields?.length) return 0;
  let filled = 0;
  for (const k of step.fields) {
    const v = data?.[k];
    if (v !== undefined && v !== null && v !== '') filled++;
  }
  return Math.round((filled / step.fields.length) * 100);
}

export default function GasChronologicalStepper({ data = {} }) {
  // V10.5 — Smart skip logic per user request:
  // "in cadrul proiectelor de bransament exista posibilitatea sa sarim peste partea
  //  de avize, in cazul in care exista bifa «are CU? da/nu», permite continuarea
  //  lucrarii fara obtinerea de avize"
  // Triggered when: are_cu_existent === true (user already has a CU which implies
  // utility approvals were obtained), OR when phases are explicitly skipped.
  const stepsWithStatus = useMemo(() => {
    const cuExistent = data?.are_cu_existent === true || data?.are_cu_existent === 'Da' || data?.are_cu_existent === 'da';
    const skipAvize = data?.skip_avize === true || cuExistent;
    return STEPS.map((s) => {
      const pct = stepCompletion(s, data);
      // Skip logic: avize step is auto-marked done when CU is existing
      if (s.id === 'avize' && skipAvize) {
        return { ...s, pct: 100, status: 'skipped', skippedReason: cuExistent ? 'CU existent — avize obținute' : 'Manual skip' };
      }
      const status = pct === 100 ? 'done' : pct >= 50 ? 'progress' : pct > 0 ? 'started' : 'pending';
      return { ...s, pct, status };
    });
  }, [data]);

  // Activitate curentă = prima etapă care nu e done/skipped
  const currentStepIdx = stepsWithStatus.findIndex((s) => s.status !== 'done' && s.status !== 'skipped');

  const stats = useMemo(() => {
    const done = stepsWithStatus.filter((s) => s.status === 'done' || s.status === 'skipped').length;
    const skipped = stepsWithStatus.filter((s) => s.status === 'skipped').length;
    const total = stepsWithStatus.length;
    return { done, total, skipped, pct: Math.round((done / total) * 100) };
  }, [stepsWithStatus]);

  return (
    <div className="bg-white border border-violet-200 rounded-xl p-5 mb-5 epd-shadow" data-testid="gas-chronological-stepper">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-semibold mb-1">
            // Flux cronologic proiect gaze naturale
          </div>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            Etape: <span className="epd-gradient-text">{stats.done}/{stats.total}</span> finalizate
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums epd-gradient-text">{stats.pct}%</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">progres total</div>
          </div>
        </div>
      </div>

      {/* Stepper orizontal */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch min-w-[1200px] xl:min-w-0" data-testid="stepper-track">
          {stepsWithStatus.map((s, idx) => {
            const Icon = s.icon;
            const isLast = idx === stepsWithStatus.length - 1;
            const isCurrent = idx === currentStepIdx;
            const isDone = s.status === 'done';
            const isSkipped = s.status === 'skipped';
            const isProgress = s.status === 'progress' || s.status === 'started';

            return (
              <div key={s.id} className="flex items-stretch flex-1 min-w-[120px]">
                <div className="flex flex-col items-center text-center flex-1 px-1" data-testid={`stepper-${s.id}`}>
                  {/* Cerc icon */}
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${isDone ? 'epd-gradient text-white shadow-lg'
                      : isSkipped ? 'bg-amber-50 border-2 border-amber-400 text-amber-700'
                      : isCurrent ? 'bg-white border-2 border-violet-500 text-violet-600 ring-4 ring-violet-100'
                      : isProgress ? 'bg-violet-100 border-2 border-violet-300 text-violet-700'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'}`} title={isSkipped ? s.skippedReason || 'Etapă omisă' : ''}>
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                    {/* Bulina cu pct */}
                    {!isDone && !isSkipped && s.pct > 0 && (
                      <div className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 shadow-md">
                        {s.pct}%
                      </div>
                    )}
                    {isSkipped && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold rounded-full px-1 py-0.5 shadow-md">
                        ⏭
                      </div>
                    )}
                  </div>

                  {/* Label + nr etapă */}
                  <div className="mt-2 px-1">
                    <div className="text-[9px] uppercase tracking-wider font-bold text-violet-600 mb-0.5">
                      Etapa {idx + 1}
                    </div>
                    <div className={`text-xs font-semibold leading-tight ${isDone ? 'text-slate-900' : isSkipped ? 'text-amber-700' : isCurrent ? 'text-violet-900' : 'text-slate-600'}`}>
                      {s.label}
                      {isSkipped && <span className="block text-[9px] font-normal text-amber-600 mt-0.5">(omis · CU existent)</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">
                      {s.desc}
                    </div>
                  </div>
                </div>

                {/* Conector între etape */}
                {!isLast && (
                  <div className="flex items-center px-1 pt-6">
                    <ChevronRight className={`w-4 h-4 ${isDone || isSkipped ? 'text-violet-500' : 'text-slate-300'}`} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar progres global */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full epd-gradient transition-all rounded-full" style={{ width: `${stats.pct}%` }} />
          </div>
          {currentStepIdx >= 0 ? (
            <div className="text-[11px] text-violet-700 font-semibold whitespace-nowrap">
              → Următorul: <span className="font-bold">{stepsWithStatus[currentStepIdx].label}</span>
            </div>
          ) : (
            <div className="text-[11px] text-emerald-700 font-bold whitespace-nowrap">
              ✓ Toate etapele complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
