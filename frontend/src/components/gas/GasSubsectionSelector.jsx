/**
 * GasSubsectionSelector — dropdown pentru selecția subsecțiunii în Gas Studio.
 * V12.5 — 5 subsecțiuni conform cerinței user:
 *   • Branșament (include avize + carte tehnică)
 *   • Instalație de utilizare
 *   • Extindere de conductă cu branșament/e (include avize + carte tehnică)
 *   • Studii de fezabilitate
 *   • Reabilitări / Modernizări / Devieri
 *
 * Fiecare are template developer-uploaded distinct (nu shared).
 */
import { ChevronDown, Zap, FileText, GitBranch, Wrench, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const GAS_SUBSECTIONS = [
  {
    id: 'bransament',
    label: 'Branșament',
    icon: Zap,
    color: 'text-violet-600',
    description: 'Racordare nouă la rețea (include avize și carte tehnică)',
    workflow: 'bransament',
    template_expected: 'template_bransament.docx',
  },
  {
    id: 'instalatie',
    label: 'Instalație de utilizare',
    icon: FileText,
    color: 'text-blue-600',
    description: 'IUGN nouă sau modificare (workflow scurt: PT → aviz → PIF → recepție)',
    workflow: 'instalatie',
    template_expected: 'template_instalatie_utilizare.docx',
  },
  {
    id: 'extindere',
    label: 'Extindere conductă cu branșament/e',
    icon: GitBranch,
    color: 'text-violet-600',
    description: 'Extindere rețea distribuție cu branșamente noi (include avize și carte tehnică)',
    workflow: 'bransament',
    template_expected: 'template_extindere_bransament.docx',
  },
  {
    id: 'studii_fezabilitate',
    label: 'Studii de fezabilitate',
    icon: MapPin,
    color: 'text-emerald-600',
    description: 'SF pentru investiții gaz (documentație tehnico-economică)',
    workflow: 'bransament',
    template_expected: 'template_studiu_fezabilitate.docx',
  },
  {
    id: 'reabilitari',
    label: 'Reabilitări / Modernizări / Devieri',
    icon: Wrench,
    color: 'text-violet-600',
    description: 'Reabilitare conducte, modernizare stații, devieri traseu',
    workflow: 'bransament',
    template_expected: 'template_reabilitare_modernizare.docx',
  },
];

export default function GasSubsectionSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = GAS_SUBSECTIONS.find(s => s.id === value) || GAS_SUBSECTIONS[0];
  const Icon = current.icon;

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative mb-4" ref={ref} data-testid="gas-subsection-selector">
      <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">
        // Selectează tipul de proiect
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-testid="subsection-dropdown-btn"
        className="w-full flex items-center justify-between gap-3 border-2 border-slate-300 hover:border-violet-500 bg-white px-4 py-3 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-5 h-5 shrink-0 ${current.color}`} />
          <div className="text-left min-w-0">
            <div className="font-bold text-slate-900 tracking-tight">{current.label}</div>
            <div className="text-xs text-slate-500 truncate">{current.description}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white border-2 border-slate-300 rounded-lg shadow-xl overflow-hidden" data-testid="subsection-dropdown-menu">
          {GAS_SUBSECTIONS.map(s => {
            const SIcon = s.icon;
            const active = s.id === value;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onChange(s.id); setOpen(false); }}
                data-testid={`subsection-option-${s.id}`}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-violet-50 transition-colors border-b border-slate-100 last:border-b-0 ${active ? 'bg-violet-50/60' : ''}`}
              >
                <SIcon className={`w-5 h-5 mt-0.5 shrink-0 ${s.color}`} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500">{s.description}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Template: {s.template_expected}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
