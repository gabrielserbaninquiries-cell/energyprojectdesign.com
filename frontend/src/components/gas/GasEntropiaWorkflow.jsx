/**
 * GasEntropiaWorkflow — vizualizare "entropia" workflow-ului legal per subsecțiune.
 * V12.5 — conform cererii user:
 *   • Bransamente + extinderi + studii fezabilitate + reabilitari/modernizari/devieri:
 *     CU → avize → DTAC → AC/acord administrator drum → PTH → predare amplasament →
 *     recepție → aviz poliție → dispoziție șantier/carte tehnică → recepție
 *   • Instalatii de utilizare (doar): Proiect tehnic → aviz → PIF → recepție
 */
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export const WORKFLOWS = {
  bransament: [
    { id: 'cu',            label: 'CU',                       full: 'Certificat de Urbanism' },
    { id: 'avize',         label: 'Avize',                    full: 'Avize instituționale (apă, electric, telecom, mediu, ISU, ISC)' },
    { id: 'dtac',          label: 'DTAC',                     full: 'Documentație Tehnică pentru Autorizarea Construirii' },
    { id: 'ac',            label: 'AC / Acord drum',          full: 'Autorizație Construire + Acord administrator drum' },
    { id: 'pth',           label: 'PTh',                      full: 'Proiect Tehnic + Detalii Execuție' },
    { id: 'predare',       label: 'Predare amplasament',      full: 'Predare-primire amplasament (proces verbal PVPA)' },
    { id: 'receptie_1',    label: 'Recepție',                 full: 'Recepție la terminarea lucrărilor (PVRT)' },
    { id: 'politie',       label: 'Aviz poliție',             full: 'Aviz Poliție Rutieră / Circulație' },
    { id: 'carte_tehnica', label: 'Dispoziție / Carte tehnică', full: 'Dispoziție de șantier + Carte tehnică a construcției' },
    { id: 'receptie_2',    label: 'Recepție finală',          full: 'Recepție finală (PVRF)' },
  ],
  instalatie: [
    { id: 'pt',        label: 'Proiect tehnic', full: 'Proiect tehnic instalație utilizare gaze' },
    { id: 'aviz',      label: 'Aviz',           full: 'Aviz proiect (VGD/OSD)' },
    { id: 'pif',      label: 'PIF',             full: 'Punere în Funcțiune (PIF)' },
    { id: 'receptie', label: 'Recepție',        full: 'Recepție terminare lucrări' },
  ],
};

// Fiecare subsecțiune → workflow variant
export const SUBSECTION_WORKFLOW = {
  bransament: 'bransament',
  extindere: 'bransament',
  studii_fezabilitate: 'bransament',
  reabilitari: 'bransament',
  instalatie: 'instalatie',
};

export default function GasEntropiaWorkflow({ subsection, data, onStepClick }) {
  const workflowKey = SUBSECTION_WORKFLOW[subsection] || 'bransament';
  const steps = WORKFLOWS[workflowKey];
  // Determine which steps are "done" based on data keys present
  const isStepDone = (step) => {
    if (!data) return false;
    const checkers = {
      cu:            () => !!data.cu_numar || !!data.cu_data,
      avize:         () => Array.isArray(data.avize) && data.avize.length > 0,
      dtac:          () => !!data.dtac_numar,
      ac:            () => !!data.ac_numar,
      pth:           () => !!data.pth_generat,
      predare:       () => !!data.pvpa_data,
      receptie_1:    () => !!data.pvrt_data,
      politie:       () => !!data.aviz_politie_nr,
      carte_tehnica: () => !!data.carte_tehnica_generata,
      receptie_2:    () => !!data.pvrf_data,
      pt:            () => !!data.pt_generat,
      aviz:          () => !!data.aviz_pt_nr,
      pif:           () => !!data.pif_data,
      receptie:      () => !!data.receptie_data,
    };
    return checkers[step.id] ? checkers[step.id]() : false;
  };

  const doneCount = steps.filter(isStepDone).length;
  const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <section data-testid="gas-entropia-workflow" className="mb-6 border border-slate-200 bg-white rounded-lg overflow-hidden">
      <header className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">// entropia workflow-ului legal</div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Cronologie proiect · {workflowKey === 'instalatie' ? 'Instalație utilizare' : 'Branșament / Extindere / Studiu / Reabilitare'}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums text-slate-900">{doneCount}/{steps.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">{pct}% complet</div>
        </div>
      </header>
      <div className="p-4 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {steps.map((step, i) => {
            const done = isStepDone(step);
            const Icon = done ? CheckCircle2 : Circle;
            return (
              <div key={step.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onStepClick?.(step)}
                  data-testid={`workflow-step-${step.id}`}
                  title={step.full}
                  className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded transition-all hover:bg-violet-50 ${done ? 'text-emerald-600' : 'text-slate-400'}`}
                >
                  <Icon className={`w-6 h-6 ${done ? 'text-emerald-500' : 'text-slate-300'}`} strokeWidth={1.5} />
                  <span className={`text-[11px] font-semibold whitespace-nowrap ${done ? 'text-emerald-700' : 'text-slate-600'}`}>{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
