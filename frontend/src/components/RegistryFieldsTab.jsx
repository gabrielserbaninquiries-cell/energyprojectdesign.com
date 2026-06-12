/**
 * RegistryFieldsTab — randează toate cele 179 câmpuri tipizate (FIELDS_REGISTRY)
 * grupate în 6 categorii × 26 secțiuni. Sursa unică de adevăr pentru documentele DOCX.
 *
 * Mecanica:
 * - Fetch /api/placeholders/registry o singură dată (cache local)
 * - Câmp completat aici → propagat în TOATE template-urile DOCX unde apare (used_in)
 * - Coverage badges per categorie + per template afișate live
 * - Save direct la /api/gas-project/{pid} via prop onChange (debounce-uit din parinte)
 */
import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import {
  ChevronDown, ChevronRight, FileText, CheckCircle2, AlertCircle,
  Folder, ListChecks, PencilRuler, HardHat, BookOpen, Pencil, Loader2, Info,
} from 'lucide-react';

const CATEGORY_ICONS = {
  date_proiect: Folder,
  documentatie_avize: ListChecks,
  documentatie_proiectare: PencilRuler,
  documentatie_executie: HardHat,
  carte_tehnica: BookOpen,
  dispozitie_santier: Pencil,
};

function FieldInput({ field, value, onChange }) {
  const t = field.type;
  const testId = `reg-field-${field.key}`;
  const baseClass = 'w-full bg-green-100/60 border border-green-300 px-2 py-1 text-xs outline-none focus:border-green-600 focus:bg-white mono';

  if (t === 'select') {
    return (
      <select value={value ?? field.default ?? ''} onChange={(e) => onChange(e.target.value)} className={baseClass} data-testid={testId}>
        <option value="">— alege —</option>
        {(field.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (t === 'tags') {
    const arr = Array.isArray(value) ? value : (Array.isArray(field.default) ? field.default : []);
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
      onChange(next);
    };
    return (
      <div className="flex flex-wrap gap-1" data-testid={testId}>
        {(field.options || []).map((o) => {
          const active = arr.includes(o);
          return (
            <button key={o} type="button" onClick={() => toggle(o)}
              className={`text-[10px] px-1.5 py-0.5 border rounded ${active ? 'bg-green-600 text-white border-green-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  if (t === 'textarea') {
    return (
      <textarea value={value ?? field.default ?? ''} onChange={(e) => onChange(e.target.value)} rows={3}
        className={`${baseClass} resize-y`} data-testid={testId} />
    );
  }
  if (t === 'number') {
    return (
      <input type="number" step="any" value={value ?? field.default ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        className={baseClass} data-testid={testId} />
    );
  }
  if (t === 'date') {
    return (
      <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={baseClass} data-testid={testId} />
    );
  }
  return (
    <input type="text" value={value ?? field.default ?? ''} onChange={(e) => onChange(e.target.value)} className={baseClass} data-testid={testId}
      placeholder={field.help || ''} />
  );
}

export default function RegistryFieldsTab({ data, onUpdateField, pid }) {
  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCats, setOpenCats] = useState({ date_proiect: true });
  const [openSecs, setOpenSecs] = useState({});
  const [coverage, setCoverage] = useState(null);
  const [showTemplateUsage, setShowTemplateUsage] = useState(null); // key of field hovered

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: reg } = await api.get('/placeholders/registry');
        if (!cancelled) setRegistry(reg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Recalculate coverage locally from data + registry (fast, no API call)
  const localCoverage = useMemo(() => {
    if (!registry?.fields) return null;
    const fields = registry.fields;
    const isFilled = (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0);
    const total = fields.length;
    const filled = fields.filter((f) => isFilled(data?.[f.key])).length;
    const perCategory = {};
    const perSection = {};
    const perTemplate = {};
    for (const f of fields) {
      const cat = Object.entries(registry.categories || {}).find(([, c]) => c.sections?.includes(f.section))?.[0];
      if (cat) {
        if (!perCategory[cat]) perCategory[cat] = { total: 0, filled: 0 };
        perCategory[cat].total += 1;
        if (isFilled(data?.[f.key])) perCategory[cat].filled += 1;
      }
      if (!perSection[f.section]) perSection[f.section] = { total: 0, filled: 0 };
      perSection[f.section].total += 1;
      if (isFilled(data?.[f.key])) perSection[f.section].filled += 1;
      for (const tid of f.used_in || []) {
        if (!perTemplate[tid]) perTemplate[tid] = { total: 0, filled: 0 };
        perTemplate[tid].total += 1;
        if (isFilled(data?.[f.key])) perTemplate[tid].filled += 1;
      }
    }
    return { total, filled, perCategory, perSection, perTemplate };
  }, [data, registry]);

  const toggleCat = (id) => setOpenCats((o) => ({ ...o, [id]: !o[id] }));
  const toggleSec = (id) => setOpenSecs((o) => ({ ...o, [id]: !o[id] }));

  if (loading) {
    return (
      <div className="bg-white border-2 border-green-400 p-8 text-center text-gray-500" data-testid="registry-loading">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        <div className="text-xs mt-2">Se încarcă registrul de câmpuri...</div>
      </div>
    );
  }
  if (!registry) {
    return (
      <div className="bg-white border-2 border-red-400 p-6 text-center text-red-600 text-xs" data-testid="registry-error">
        Eroare la încărcare registru câmpuri.
      </div>
    );
  }

  const categories = Object.entries(registry.categories || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0));
  const cov = localCoverage || coverage;
  const overallPct = cov ? Math.round((cov.filled / cov.total) * 100) : 0;

  return (
    <div className="space-y-4" data-testid="registry-fields-tab">
      {/* HEADER cu coverage global */}
      <div className="bg-white border-2 border-green-500 p-4 rounded">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">Registru câmpuri tipizate</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Toate {cov?.total || 0} câmpuri ce alimentează 23+ template-uri DOCX. Sursa unică de adevăr.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums text-green-700">{overallPct}%</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{cov?.filled || 0} / {cov?.total || 0} completate</div>
          </div>
        </div>
        {/* Coverage bar */}
        <div className="h-2 bg-zinc-100 rounded overflow-hidden">
          <div className="h-full bg-green-600 transition-all" style={{ width: `${overallPct}%` }} />
        </div>

        {/* Coverage pe categorie */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3" data-testid="registry-coverage-bars">
          {categories.map(([catId, cat]) => {
            const c = cov?.perCategory?.[catId] || { total: 0, filled: 0 };
            const pct = c.total ? Math.round((c.filled / c.total) * 100) : 0;
            const Icon = CATEGORY_ICONS[catId] || Folder;
            return (
              <div key={catId} className="border border-zinc-200 rounded p-2 bg-zinc-50" data-testid={`cov-cat-${catId}`}>
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="w-3 h-3 text-zinc-600" />
                  <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-semibold truncate">{cat.label}</span>
                </div>
                <div className="text-sm font-bold tabular-nums">{pct}%</div>
                <div className="h-1 bg-zinc-200 rounded mt-1">
                  <div className="h-full bg-green-600 rounded transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORIES accordion */}
      {categories.map(([catId, cat]) => {
        const c = cov?.perCategory?.[catId] || { total: 0, filled: 0 };
        const pct = c.total ? Math.round((c.filled / c.total) * 100) : 0;
        const Icon = CATEGORY_ICONS[catId] || Folder;
        const isOpen = !!openCats[catId];
        const sectionsInCat = cat.sections || [];

        return (
          <section key={catId} className="border-2 border-green-300 rounded overflow-hidden bg-white" data-testid={`cat-${catId}`}>
            <button onClick={() => toggleCat(catId)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-green-50 transition-colors"
              data-testid={`cat-toggle-${catId}`}>
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-600" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
                <Icon className="w-4 h-4 text-green-700" />
                <div className="text-left">
                  <div className="text-sm font-bold tracking-tight">{cat.label}</div>
                  <div className="text-[10px] text-zinc-500">{cat.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold tabular-nums text-green-700">{pct}%</div>
                <div className="text-[9px] uppercase tracking-widest text-zinc-500">{c.filled}/{c.total}</div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-green-200 bg-green-50/20">
                {sectionsInCat.map((secId) => {
                  const sec = registry.sections?.[secId];
                  if (!sec) return null;
                  const fieldsInSec = registry.fields.filter((f) => f.section === secId);
                  if (fieldsInSec.length === 0) return null;
                  const s = cov?.perSection?.[secId] || { total: 0, filled: 0 };
                  const secPct = s.total ? Math.round((s.filled / s.total) * 100) : 0;
                  const secOpen = openSecs[secId] ?? true;
                  return (
                    <div key={secId} className="border-b border-green-200 last:border-0" data-testid={`sec-${secId}`}>
                      <button onClick={() => toggleSec(secId)}
                        className="w-full flex items-center justify-between px-6 py-2 hover:bg-green-50/50 transition-colors"
                        data-testid={`sec-toggle-${secId}`}>
                        <div className="flex items-center gap-2">
                          {secOpen ? <ChevronDown className="w-3 h-3 text-zinc-500" /> : <ChevronRight className="w-3 h-3 text-zinc-500" />}
                          <span className="text-xs font-semibold text-zinc-800">{sec.label}</span>
                          <span className="text-[10px] text-zinc-500">({fieldsInSec.length} câmpuri)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-zinc-200 rounded overflow-hidden">
                            <div className="h-full bg-green-600 rounded" style={{ width: `${secPct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-600 w-8 text-right">{secPct}%</span>
                        </div>
                      </button>

                      {secOpen && (
                        <div className="px-6 pb-3 pt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white" data-testid={`sec-body-${secId}`}>
                          {fieldsInSec.map((f) => {
                            const val = data?.[f.key];
                            const isFilled = val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
                            return (
                              <div key={f.key} className="text-[10px]" data-testid={`field-wrap-${f.key}`}>
                                <label className="flex items-start gap-1 mb-1">
                                  {isFilled
                                    ? <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                                    : <AlertCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />}
                                  <span className="text-zinc-700 font-semibold flex-1 leading-tight">
                                    {f.label}
                                    {f.required && <span className="text-red-500 ml-0.5">*</span>}
                                  </span>
                                  {(f.used_in?.length || 0) > 0 && (
                                    <button onClick={() => setShowTemplateUsage(showTemplateUsage === f.key ? null : f.key)}
                                      className="text-zinc-400 hover:text-blue-600" title="Folosit în template-uri">
                                      <Info className="w-3 h-3" />
                                    </button>
                                  )}
                                </label>
                                {showTemplateUsage === f.key && (
                                  <div className="mb-1 p-1.5 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-800">
                                    <div className="font-semibold mb-0.5">Folosit în {f.used_in?.length || 0} documente:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {(f.used_in || []).map((tid) => (
                                        <span key={tid} className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">{tid}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <FieldInput field={f} value={val} onChange={(v) => onUpdateField(f.key, v)} />
                                {f.help && <div className="text-[9px] text-zinc-400 mt-0.5 italic leading-tight">{f.help}</div>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* COVERAGE PER TEMPLATE — overview ready/not-ready */}
      {cov?.perTemplate && (
        <div className="bg-white border-2 border-blue-400 p-4 rounded mt-4" data-testid="template-coverage">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Gata pentru generare ({Object.values(cov.perTemplate).filter((s) => Math.round(s.filled / s.total * 100) >= 80).length}/{Object.keys(cov.perTemplate).length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {Object.entries(cov.perTemplate).sort((a, b) => (b[1].filled / b[1].total) - (a[1].filled / a[1].total)).map(([tid, s]) => {
              const pct = s.total ? Math.round((s.filled / s.total) * 100) : 0;
              const ready = pct >= 80;
              return (
                <div key={tid} className={`text-[10px] px-2 py-1.5 border rounded ${ready ? 'border-green-400 bg-green-50' : 'border-zinc-200 bg-zinc-50'}`}
                  data-testid={`tpl-cov-${tid}`}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-semibold truncate">{tid}</span>
                    <span className={`tabular-nums font-bold ${ready ? 'text-green-700' : 'text-zinc-600'}`}>{pct}%</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">{s.filled}/{s.total} câmpuri</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
