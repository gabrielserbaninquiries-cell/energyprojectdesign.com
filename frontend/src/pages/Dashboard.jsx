/**
 * Dashboard — V11.0 Premium Redesign
 *
 * Inspirat din interfețele top-tier (Stripe, Linear, Vercel) cu touch EPD —
 * gradient violet/indigo, glass-morphism subtil, asymmetric grid, micro-animații.
 */
import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  FileText, Stamp, ShieldCheck, FileCheck2, ArrowRight, Plus, Activity,
  Flame, Sparkles, Zap, TrendingUp, Clock, ChevronRight,
} from 'lucide-react';
import LifecycleWidget from '../components/LifecycleWidget';

const QUICK_ACTIONS = [
  { to: '/gaze-naturale', label: 'Studio Gaze Naturale', desc: 'Branșament + Extindere + Instalație utilizare', icon: Flame, accent: 'violet' },
  { to: '/templates', label: 'Șabloane DOCX', desc: 'Upload + completare automată', icon: FileText, accent: 'blue' },
  { to: '/stamps', label: 'Ștampile & semnături', desc: 'Aplică pe documente', icon: Stamp, accent: 'amber' },
  { to: '/certificate', label: 'Certificate digitale', desc: 'QES eIDAS conform', icon: ShieldCheck, accent: 'emerald' },
];

const ACCENT_CLASSES = {
  violet: 'from-violet-500 to-indigo-600 shadow-violet-200/50',
  blue: 'from-blue-500 to-cyan-600 shadow-blue-200/50',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200/50',
  amber: 'from-amber-500 to-orange-600 shadow-amber-200/50',
  rose: 'from-rose-500 to-pink-600 shadow-rose-200/50',
};

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [counts, setCounts] = useState({ templates: 0, stamps: 0, certs: 0, docs: 0 });
  const [completion, setCompletion] = useState(0);
  const [recent, setRecent] = useState([]);
  const [activity, setActivity] = useState([]);
  const [versionStatus, setVersionStatus] = useState(null);
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [t, s, c, d, p, a, vs] = await Promise.all([
          api.get('/templates'), api.get('/stamps'), api.get('/certificates'), api.get('/documents'), api.get('/project'),
          api.get('/activity?limit=20'), api.get('/version/status'),
        ]);
        setCounts({ templates: t.data.length, stamps: s.data.length, certs: c.data.length, docs: d.data.length });
        setRecent(d.data.slice(0, 5));
        setCompletion(p.data.completion || 0);
        setActivity(a.data || []);
        setVersionStatus(vs.data);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      }
    })();
  }, []);

  // Stripe redirect handler
  useEffect(() => {
    const sid = params.get('session_id');
    if (!sid) return;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const { data } = await api.get(`/payments/status/${sid}`);
        if (data.payment_status === 'paid') {
          toast.success('Plată reușită — plan actualizat');
          await refresh();
          nav('/dashboard', { replace: true });
          return;
        }
        if (data.status === 'expired') { toast.error('Sesiunea de plată a expirat'); return; }
      } catch (err) { console.error('Payment status check failed:', err); }
      if (attempts < 6) setTimeout(poll, 2000);
    };
    poll();
  }, [params, refresh, nav]);

  const stats = [
    { label: 'Documente', value: counts.docs, icon: FileText, accent: 'violet', to: '/documents' },
    { label: 'Șabloane', value: counts.templates, icon: FileCheck2, accent: 'blue', to: '/templates' },
    { label: 'Ștampile', value: counts.stamps, icon: Stamp, accent: 'amber', to: '/stamps' },
    { label: 'Certificate', value: counts.certs, icon: ShieldCheck, accent: 'emerald', to: '/certificate' },
  ];

  return (
    <AppShell title={`Bun venit, ${user?.name?.split(' ')[0] || ''}`}>
      {/* Premium hero header */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-900 p-8 text-white shadow-2xl" data-testid="dashboard-hero">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 85% 70%, rgba(168,85,247,0.4) 0%, transparent 50%)' }} />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-200 mb-2">// Panou principal · V11.0</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Bun venit, <span className="text-violet-200">{user?.name?.split(' ')[0] || 'inginer'}</span>.
            </h1>
            <p className="text-violet-100/90 text-sm max-w-2xl">
              Continuă cu un proiect existent sau lansează unul nou. Toate documentele tale tehnice — gaze naturale,
              electric, fotovoltaice — într-un singur ecosistem digital.
            </p>
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              <Link to="/gaze-naturale" className="px-4 py-2 bg-white text-violet-700 hover:bg-violet-50 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg" data-testid="dashboard-cta-gas">
                <Flame className="w-4 h-4" />
                Studio Gaze Naturale
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-lg font-medium text-sm flex items-center gap-2 transition-all" data-testid="dashboard-cta-plans">
                Vezi planurile
              </Link>
            </div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20 min-w-[160px]">
            <div className="text-5xl font-bold tabular-nums">{completion}%</div>
            <div className="text-[10px] uppercase tracking-wider text-violet-200 mt-1">Date proiect completate</div>
            <div className="mt-3 h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-300 to-amber-200 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      <LifecycleWidget />

      {/* Stats grid — premium cards with gradient icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="dashboard-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link to={s.to} key={s.label} className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-lg transition-all hover-lift" data-testid={`stat-${s.label}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${ACCENT_CLASSES[s.accent]} shadow-md text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="text-3xl font-bold tracking-tight tabular-nums">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions — premium service cards */}
      <div className="mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-semibold mb-1">// Acțiuni rapide</div>
            <h2 className="text-xl font-bold text-slate-900">Începe o lucrare nouă</h2>
          </div>
          <Link to="/industrii" className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1">
            Toate industriile <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-quick-actions">
          {QUICK_ACTIONS.map((q) => {
            const Icon = q.icon;
            return (
              <Link to={q.to} key={q.label} className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-lg transition-all" data-testid={`quick-${q.label.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${ACCENT_CLASSES[q.accent]} shadow-lg mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-bold text-slate-900 mb-1">{q.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{q.desc}</div>
                <div className="mt-3 text-xs text-violet-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Deschide <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent docs + Plan card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-600" />
              <h2 className="font-bold text-slate-900">Documente recente</h2>
            </div>
            <Link to="/documents" className="text-xs uppercase tracking-wider text-violet-600 hover:text-violet-700 font-semibold">Toate →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" strokeWidth={1.2} />
              <p className="text-slate-500 text-sm mb-4">Niciun document încă.</p>
              <Link to="/gaze-naturale" className="epd-btn-primary inline-flex" data-testid="empty-cta-gas"><Plus className="w-4 h-4" /> Începe primul proiect</Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((d) => (
                <li key={d.document_id} className="px-6 py-3.5 hover:bg-slate-50 flex items-center justify-between transition-colors" data-testid={`recent-doc-${d.document_id}`}>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{new Date(d.created_at).toLocaleString('ro-RO')}</span>
                      {d.signed && <span className="epd-pill epd-pill-violet">Semnat</span>}
                      {d.stamped && <span className="epd-pill epd-pill-amber">Ștampilat</span>}
                    </div>
                  </div>
                  <Link to="/documents" className="text-xs text-violet-600 hover:text-violet-700 font-semibold">Deschide →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Plan card — dark premium */}
        <div className="relative bg-slate-900 text-white rounded-xl overflow-hidden p-6">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(168,85,247,0.4) 0%, transparent 60%)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-300" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300 font-bold">// Plan curent</span>
            </div>
            <div className="text-3xl font-bold tracking-tight mb-1 uppercase" data-testid="dashboard-plan-name">{user?.plan}</div>
            <p className="text-slate-300 text-sm mb-5 leading-relaxed">
              {user?.plan === 'free' ? 'Aveți acces la 5 documente gratuit.' : `Plan activ. ${user?.plan_renews_at ? `Se reînnoiește: ${new Date(user.plan_renews_at).toLocaleDateString('ro-RO')}.` : ''}`}
            </p>
            {user?.plan === 'free' && (
              <Link to="/pricing" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 rounded-lg font-semibold text-sm transition-all" data-testid="upgrade-btn">
                <Zap className="w-4 h-4" /> Upgrade plan
              </Link>
            )}
            {versionStatus && (
              <div className="mt-6 pt-6 border-t border-slate-800">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Versiune {versionStatus.version}</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-300 to-amber-200 transition-all rounded-full" style={{ width: `${versionStatus.completion_percent}%` }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums">{versionStatus.completion_percent}%</span>
                </div>
                <p className="text-[11px] text-slate-400" data-testid="version-message">{versionStatus.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" data-testid="activity-log">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-600" />
            <h2 className="font-bold text-slate-900">Registru activitate</h2>
          </div>
          <span className="text-xs text-slate-500">{activity.length} acțiuni recente</span>
        </div>
        {activity.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Niciun istoric de activitate încă.</div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activity.map((a) => (
              <li key={a.log_id} className="px-6 py-3 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors" data-testid={`activity-${a.log_id}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="epd-pill epd-pill-violet shrink-0">{a.action}</span>
                  <span className="truncate text-slate-700">{a.label}</span>
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-4 tabular-nums">{new Date(a.created_at).toLocaleString('ro-RO')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
