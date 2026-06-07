import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Search, Trash2, Sparkles, TrendingUp, FileSearch, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const INDUSTRY_LABELS = {
  gas_engineering: 'Gaze naturale',
  electrical_engineering: 'Instalații electrice',
  telecom: 'Telecom',
  railway_infra: 'Infrastructură feroviară',
  civil_engineering: 'Construcții civile',
  photovoltaic: 'Fotovoltaic',
  water_sewage: 'Apă & canalizare',
  sanitation: 'Salubrizare',
  hvac: 'HVAC',
  environment: 'Mediu',
  roads_bridges: 'Drumuri & poduri',
  public_lighting: 'Iluminat public',
};

function scoreColor(score) {
  if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
  if (score >= 40) return 'text-amber-800 bg-amber-50 border-amber-300';
  return 'text-gray-600 bg-gray-50 border-gray-300';
}

export default function SEAPAlerts() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', value_ron: '', ai_summary: true });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/seap/tenders?limit=200');
      setTenders(data.tenders || []);
    } catch (_) { toast.error('Eroare încărcare licitații'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/seap/screen', {
        title: form.title.trim(),
        description: form.description.trim(),
        value_ron: form.value_ron ? parseFloat(form.value_ron) : null,
        ai_summary: !!form.ai_summary,
      });
      toast.success('Licitație screenată & salvată');
      setForm({ title: '', description: '', value_ron: '', ai_summary: true });
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setSubmitting(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`/seap/tenders/${id}`); load(); toast.success('Șters'); }
    catch { toast.error('Eroare ștergere'); }
  };

  const filtered = filter === 'all' ? tenders : tenders.filter((t) => t.scoring?.industry === filter);
  const industries = [...new Set(tenders.map((t) => t.scoring?.industry).filter(Boolean))];

  return (
    <AppShell title="SEAP Alerts" subtitle="Pre-screening licitații SEAP/SICAP cu scoring AI per industrie">
      {/* Hero */}
      <div className="relative overflow-hidden mb-8 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a1a] to-[#0A0A0A] text-white p-8" data-testid="seap-hero">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#FFB300] mb-2 flex items-center gap-2"><FileSearch className="w-3.5 h-3.5" /> // tender intelligence</div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">SEAP, fără zgomot.</h2>
            <p className="text-sm text-gray-300 max-w-xl">Lipește titlul + descrierea unei licitații. Scoring imediat pe baza a 12 industrii + opțional sumarizare AI (Claude). Identifică rapid ce merită urmărit.</p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            <Stat v={tenders.length} l="Total" c="text-[#FFB300]" />
            <Stat v={tenders.filter((t) => (t.scoring?.score || 0) >= 75).length} l="High-fit" c="text-emerald-400" />
            <Stat v={industries.length} l="Industrii" c="text-sky-400" />
          </div>
        </div>
      </div>

      {/* Compose */}
      <form onSubmit={submit} className="bg-white border border-gray-200 p-6 mb-8" data-testid="seap-compose">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[#FFB300]" />
          <h3 className="font-semibold tracking-tight">Screen licitație nouă</h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-3">
          <input
            data-testid="seap-input-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Titlu licitație (ex: Sistem fotovoltaic 50 kWp pentru școala…)"
            className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
          />
          <input
            data-testid="seap-input-value"
            type="number"
            value={form.value_ron}
            onChange={(e) => setForm((f) => ({ ...f, value_ron: e.target.value }))}
            placeholder="Valoare estimată RON (opțional)"
            className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
          />
        </div>
        <textarea
          data-testid="seap-input-desc"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descriere / obiect achiziție (max 2000 caractere)"
          className="w-full mt-3 border border-gray-200 px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30 h-24 resize-none"
        />
        <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.ai_summary} onChange={(e) => setForm((f) => ({ ...f, ai_summary: e.target.checked }))} className="w-4 h-4 accent-black" data-testid="seap-ai-toggle" />
            <span>Generează sumarizare AI (Claude Sonnet) — durează 2-4s</span>
          </label>
          <button type="submit" disabled={submitting || !form.title.trim()} className="amber-btn text-sm py-2 px-4 disabled:opacity-50" data-testid="seap-submit">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
            Screen
          </button>
        </div>
      </form>

      {/* Filters */}
      {industries.length > 0 && (
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto" data-testid="seap-filters">
          <button onClick={() => setFilter('all')} className={`text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 border whitespace-nowrap ${filter === 'all' ? 'bg-black text-[#FFB300] border-black' : 'bg-white text-gray-600 border-gray-200'}`}>Toate <span className="opacity-70 ml-1">{tenders.length}</span></button>
          {industries.map((ind) => (
            <button key={ind} onClick={() => setFilter(ind)} className={`text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 border whitespace-nowrap ${filter === ind ? 'bg-black text-[#FFB300] border-black' : 'bg-white text-gray-600 border-gray-200'}`}>{INDUSTRY_LABELS[ind] || ind} <span className="opacity-70 ml-1">{tenders.filter((t) => t.scoring?.industry === ind).length}</span></button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? <div className="text-sm text-gray-500 py-12 text-center">Se încarcă…</div> : (
        <div className="space-y-3" data-testid="seap-list">
          {filtered.length === 0 && (
            <div className="bg-gray-50 border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 opacity-50" />
              Nicio licitație. Lipește titlul + descrierea uneia din SEAP/SICAP pentru a vedea scoring-ul.
            </div>
          )}
          {filtered.map((t) => {
            const score = t.scoring?.score || 0;
            const ind = t.scoring?.industry;
            return (
              <div key={t.tender_id} className="bg-white border border-gray-200 p-5 hover:border-black transition-colors" data-testid={`seap-tender-${t.tender_id}`}>
                <div className="flex items-start gap-4">
                  <div className={`text-center px-3 py-2 border-2 min-w-[64px] ${scoreColor(score)}`}>
                    <div className="text-2xl font-bold tracking-tight leading-none">{score}</div>
                    <div className="text-[9px] uppercase tracking-wider mt-1">scor</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {ind && <span className="text-[10px] uppercase tracking-wider font-semibold bg-black text-[#FFB300] px-2 py-0.5">{INDUSTRY_LABELS[ind] || ind}</span>}
                      {t.value_ron && <span className="text-[10px] uppercase tracking-wider text-gray-500">{Number(t.value_ron).toLocaleString('ro-RO')} RON</span>}
                      <span className="text-[10px] text-gray-400 ml-auto">{new Date(t.created_at).toLocaleString('ro-RO')}</span>
                    </div>
                    <h4 className="font-semibold leading-tight mb-1">{t.title}</h4>
                    {t.description && <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">{t.description}</p>}
                    {t.ai_summary && (
                      <div className="mt-2 border-l-4 border-[#FFB300] bg-[#FFB300]/5 px-3 py-2 text-xs text-gray-700 leading-relaxed">
                        <span className="text-[9px] uppercase tracking-wider text-[#B45309] font-semibold block mb-1">📡 Sumarizare AI</span>
                        <span className="whitespace-pre-wrap">{t.ai_summary}</span>
                      </div>
                    )}
                    {t.scoring?.keywords_hit?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {t.scoring.keywords_hit.map((kw) => (
                          <span key={kw} className="text-[9px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 text-gray-600 mono">{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => remove(t.tender_id)} className="text-gray-400 hover:text-red-600 p-1" data-testid={`seap-delete-${t.tender_id}`}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ v, l, c }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3">
      <div className={`text-2xl font-bold tracking-tight ${c}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mt-1">{l}</div>
    </div>
  );
}
