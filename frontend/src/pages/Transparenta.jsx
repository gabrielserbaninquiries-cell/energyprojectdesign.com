/**
 * V11.8 — Transparență publică EPD
 *
 * Pagina afișează cifre REALE din baza de date — fără date personale.
 * Misiunea: transparență totală pentru utilizatori, parteneri, investitori.
 * "Numerele platformei sunt reale, sau nu sunt deloc."
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Users, FolderKanban, FileCheck2, Coins, ShieldCheck, Activity,
  Sparkles, ArrowLeft, RefreshCw, ExternalLink, AlertCircle, Check, Loader2,
} from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import useSEO from '../hooks/useSEO';

const STATUS_ICONS = {
  live: { Icon: Check, color: 'bg-emerald-500 text-white', label: 'LIVE' },
  beta: { Icon: AlertCircle, color: 'bg-amber-500 text-white', label: 'BETA' },
  not_started: { Icon: AlertCircle, color: 'bg-slate-300 text-slate-700', label: 'PENDING' },
};

export default function Transparenta() {
  const [stats, setStats] = useState(null);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useSEO({
    title: 'Transparență totală · Cifre reale · Energy Project Design',
    description: 'Energy Project Design — pagina de transparență. Cifre reale live din platformă: utilizatori înregistrați, proiecte gaze naturale, documente generate, donații, tranzacții. Misiunea noastră: transparență totală.',
    canonical: 'https://www.energyprojectdesign.com/transparenta',
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        api.get('/transparenta/public-stats'),
        api.get('/transparenta/audit'),
      ]);
      setStats(s.data);
      setAudit(a.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Eroare la încărcare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-3" />
          <div className="text-sm text-slate-500">Se încarcă cifrele live...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen bg-slate-50 p-8 text-center text-rose-700">{error}</div>;
  }

  const totalActive = audit?.honest_status?.fully_live || 0;
  const totalBeta = audit?.honest_status?.beta || 0;
  const totalSteps = audit?.honest_status?.total || 0;
  const livePercentage = totalSteps > 0 ? Math.round((totalActive / totalSteps) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="back-home">
            <EPDLogo />
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900">Energy Project Design</div>
              <div className="text-[10px] uppercase tracking-wider text-violet-600 font-semibold">Transparență publică</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={load} disabled={loading} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-violet-700 flex items-center gap-1.5" data-testid="refresh-stats">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reîncarcă
            </button>
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Acasă</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-900 text-white py-16">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-violet-200 font-semibold mb-4">
            <Sparkles className="w-3 h-3" /> Misiunea noastră
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-4">
            Cifre reale.<br />
            <span className="text-violet-200">Transparență totală.</span>
          </h1>
          <p className="text-lg text-violet-100 max-w-2xl mx-auto leading-relaxed">
            Energy Project Design publică LIVE cifrele platformei — utilizatori, proiecte, documente, donații —
            citite direct din baza de date, fără înfrumusețare. Așa se construiește încrederea.
          </p>
          {stats?.last_refreshed_at && (
            <div className="mt-6 text-[11px] uppercase tracking-wider text-violet-200/80 font-mono" data-testid="last-refreshed">
              Ultima actualizare: {new Date(stats.last_refreshed_at).toLocaleString('ro-RO')}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Stats grid */}
        <section data-testid="public-stats-grid">
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-1">// 01 — Cifre live din platformă</div>
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Activitatea reală a EPD</h2>
            <p className="text-sm text-slate-500 mt-1">Citit direct din MongoDB. Click "Reîncarcă" pentru valori actualizate la secundă.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Utilizatori înregistrați" value={stats?.users?.total_registered || 0} accent="violet" testid="stat-users" />
            <StatCard icon={FolderKanban} label="Proiecte gaze naturale" value={stats?.engineering?.total_gas_projects || 0} accent="blue" testid="stat-projects" />
            <StatCard icon={FileCheck2} label="Documente generate" value={stats?.engineering?.total_documents_generated || 0} accent="amber" testid="stat-documents" />
            <StatCard icon={ShieldCheck} label="Template-uri disponibile" value={stats?.engineering?.total_templates_available || 0} accent="emerald" testid="stat-templates" />
          </div>

          {/* Activity in 30 days */}
          <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-violet-600" />
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Activitate ultimele 30 zile</div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.engineering?.active_projects_last_30d || 0}
              <span className="text-sm font-medium text-slate-500 ml-2">proiecte modificate recent</span>
            </div>
          </div>
        </section>

        {/* Donations & Transactions */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-1">// 02 — Bani reali, trasabilitate Stripe</div>
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Donații & Tranzacții</h2>
            <p className="text-sm text-slate-500 mt-1">Toate plățile prin Stripe LIVE — chitanță automată, eIDAS audit log.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-white border border-slate-200 rounded-xl" data-testid="donation-summary">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="w-5 h-5 text-emerald-600" />
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Donații primite</div>
              </div>
              <div className="text-4xl font-bold text-slate-900 tabular-nums mb-1">
                {(stats?.donations?.total_paid_count || 0)}
              </div>
              <div className="text-xs text-slate-500 mb-3">{stats?.donations?.total_initiated_count || 0} sesiuni inițiate · {stats?.donations?.total_paid_count || 0} finalizate</div>
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Total RON</div>
                  <div className="text-lg font-bold tabular-nums text-emerald-700">{(stats?.donations?.total_ron || 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Total EUR</div>
                  <div className="text-lg font-bold tabular-nums text-emerald-700">{(stats?.donations?.total_eur || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-xl" data-testid="transactions-summary">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-violet-600" />
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Tranzacții Stripe</div>
              </div>
              <div className="text-4xl font-bold text-slate-900 tabular-nums mb-1">
                {stats?.transactions?.total_paid_count || 0}
              </div>
              <div className="text-xs text-slate-500">Plăți finalizate cu succes</div>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-xl" data-testid="stamps-summary">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ștampile uploaded</div>
              </div>
              <div className="text-4xl font-bold text-slate-900 tabular-nums mb-1">
                {stats?.engineering?.total_stamps_uploaded || 0}
              </div>
              <div className="text-xs text-slate-500">Disponibile pentru aplicare drag&drop</div>
            </div>
          </div>
        </section>

        {/* Plan distribution */}
        {stats?.users?.plan_distribution && (
          <section>
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-1">// 03 — Distribuție planuri</div>
              <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Cine folosește EPD</h2>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Object.entries(stats.users.plan_distribution).map(([plan, count]) => (
                  <div key={plan} className="p-3 bg-violet-50 border border-violet-200 rounded-lg" data-testid={`plan-dist-${plan}`}>
                    <div className="text-[10px] uppercase tracking-wider text-violet-700 font-bold">{plan}</div>
                    <div className="text-2xl font-bold text-slate-900 tabular-nums">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Honest E2E audit */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-1">// 04 — Audit cinstit end-to-end</div>
              <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Ce funcționează 100% și ce încă lucrăm</h2>
              <p className="text-sm text-slate-500 mt-1">Fluxul complet al unui proiect gaze naturale — pas cu pas, cu status real.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold tracking-tighter text-emerald-600 tabular-nums">{livePercentage}%</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">funcțional ({totalActive}/{totalSteps})</div>
            </div>
          </div>

          <div className="space-y-3" data-testid="audit-lifecycle">
            {audit?.lifecycle_steps?.map((s) => {
              const meta = STATUS_ICONS[s.status] || STATUS_ICONS.not_started;
              const Icon = meta.Icon;
              return (
                <div key={s.step} className="p-5 bg-white border border-slate-200 rounded-xl flex gap-4 items-start" data-testid={`audit-step-${s.step}`}>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold tabular-nums flex items-center justify-center">{s.step}</div>
                    <div className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 ${meta.color}`}>
                      <Icon className="w-2.5 h-2.5" /> {meta.label}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.notes}</div>
                    <div className="text-[10px] font-mono text-violet-600 mt-1.5">{s.endpoint}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Compliance */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-1">// 05 — Conformitate legală</div>
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900">Standardele pe care le respectăm</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats?.compliance && Object.entries(stats.compliance).map(([key, val]) => (
              <div key={key} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-2" data-testid={`compliance-${key}`}>
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700">{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer with company info */}
        <section className="border-t border-slate-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-2">Date societate</div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <div className="font-semibold">{stats?.platform?.name}</div>
                <div>CUI: {stats?.platform?.cui}</div>
                <div>Înființată: {stats?.platform?.founded}</div>
                <div>Țara: {stats?.platform?.country}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-2">Stack tehnic</div>
              <div className="text-sm text-slate-700 leading-relaxed">
                <div>React 19 + FastAPI + MongoDB</div>
                <div>Plăți: Stripe LIVE mode</div>
                <div>Hosting: Emergent Cloud</div>
                <div>Audit: open via această pagină</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-bold mb-2">Date contact</div>
              <div className="text-sm text-slate-700 leading-relaxed space-y-1">
                <Link to="/contact" className="block hover:text-violet-700 flex items-center gap-1">Contact <ExternalLink className="w-3 h-3" /></Link>
                <Link to="/pricing" className="block hover:text-violet-700">Planuri și tarife</Link>
                <Link to="/sponsorizeaza" className="block hover:text-violet-700">Donează</Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-violet-50 via-indigo-50 to-violet-50 border border-violet-200 rounded-2xl p-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-900 mb-2">
            Vrei să fii unul dintre cei {(stats?.users?.total_registered || 0) + 1}?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto mb-5">
            Înregistrare în 30 secunde. Trial 14 zile gratuit. Fără card de credit.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg font-bold shadow-lg transition-all" data-testid="cta-register">
            Începe acum <ExternalLink className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, testid }) {
  const accentClass = {
    violet: 'from-violet-500 to-indigo-600',
    blue: 'from-blue-500 to-cyan-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
  }[accent] || 'from-violet-500 to-indigo-600';
  return (
    <div className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-lg transition-all" data-testid={testid}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${accentClass} shadow-md text-white mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}
