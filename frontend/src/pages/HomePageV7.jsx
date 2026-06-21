/**
 * HomePageV7.4 — Restructure UX-first cu "Pagini principale în top".
 *
 * Cerință literală user (mesaj 20):
 *   "paginile principale nu se afla in 'acasa' in partea de sus"
 *   "Nu mai are crash. In schimb, nu-mi place deloc pagina."
 *   "template-ul ales sa fie mai catchy, dar si user friendly"
 *
 * Schimbări UX:
 *  1. Hero mai mic (40% înălțime față de V7.1) — eliberează above-the-fold.
 *  2. "Pagini principale" bar (12 quick-access pills) imediat sub hero — vizibile fără scroll.
 *  3. 5 ecosystem cards compacte (3-col grid) cu sub-pagini afișate inline.
 *  4. Activity feed (proiecte recente + topics + anunțuri) — content real, nu placeholder.
 *  5. Footer trust scurt.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  FileText, ShoppingBag, Home as HomeIcon, MessageSquare, Wrench, Calculator,
  ArrowUpRight, Sparkles, Flame, FolderKanban, Search, Tag, ClipboardList,
  CreditCard, Receipt, Briefcase, ShieldCheck, Bot, BadgeCheck, Building2,
  TrendingUp, Eye, Clock, Loader2,
} from 'lucide-react';

// ====== 12 PAGINI PRINCIPALE (quick-access bar, vizibile imediat) ======
const QUICK_ACCESS = [
  { to: '/proiecte',                label: 'Proiectele mele',     icon: FolderKanban, tid: 'qa-projects' },
  { to: '/gaze-naturale',           label: 'Gaze Naturale',       icon: Flame,        tid: 'qa-gas' },
  { to: '/documentatie-industrii',  label: 'Industrii',           icon: FileText,     tid: 'qa-industries' },
  { to: '/marketplace',             label: 'Marketplace',         icon: ShoppingBag,  tid: 'qa-marketplace' },
  { to: '/imobiliare',              label: 'Imobiliare',          icon: HomeIcon,     tid: 'qa-realestate' },
  { to: '/forum-v7',                label: 'Forum',               icon: MessageSquare,tid: 'qa-forum' },
  { to: '/servicii',                label: 'Meseriași',           icon: Wrench,       tid: 'qa-servicii' },
  { to: '/smart-pricing',           label: 'Calculator costuri',  icon: Calculator,   tid: 'qa-pricing' },
  { to: '/jobs',                    label: 'Job Board ANRE',      icon: BadgeCheck,   tid: 'qa-jobs' },
  { to: '/comisioane-tarife',       label: 'Comisioane',          icon: Tag,          tid: 'qa-fees' },
  { to: '/planuri-departamente',    label: 'Planuri',             icon: CreditCard,   tid: 'qa-plans' },
  { to: '/verifica',                label: 'Verifică document',   icon: ShieldCheck,  tid: 'qa-verify' },
];

// ====== 5 ECOSISTEME cu sub-pagini inline ======
const ECOSYSTEMS = [
  {
    id: 'documentatie',
    title: 'Documentație Tehnică',
    badge: '23+ docs · 179 câmpuri',
    icon: FileText,
    subs: [
      { to: '/gaze-naturale', label: 'Gaze Naturale Studio' },
      { to: '/documentatie-industrii', label: '13 industrii' },
      { to: '/templates', label: 'Șabloane DOCX' },
      { to: '/documents', label: 'Documente generate' },
      { to: '/stamps', label: 'Ștampile + semnături' },
      { to: '/verifica', label: 'Verifică QR public' },
    ],
    testId: 'eco-documentatie',
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    badge: 'Listing GRATUIT · taxă 3% per tranzacție',
    icon: ShoppingBag,
    subs: [
      { to: '/marketplace', label: 'Toate anunțurile' },
      { to: '/marketplace?category=materiale', label: 'Materiale (țeavă, fitting)' },
      { to: '/marketplace?category=echipamente', label: 'Echipamente' },
      { to: '/marketplace?category=servicii', label: 'Servicii' },
      { to: '/marketplace?category=software', label: 'Software + cursuri' },
      { to: '/comisioane-tarife', label: 'Comisioane' },
    ],
    testId: 'eco-marketplace',
  },
  {
    id: 'imobiliare',
    title: 'Imobiliare',
    badge: 'Listing GRATUIT · doar 1% vs 6% agenții',
    icon: HomeIcon,
    subs: [
      { to: '/imobiliare', label: 'Toate proprietățile' },
      { to: '/imobiliare?transaction_type=vanzare', label: 'Vânzare' },
      { to: '/imobiliare?transaction_type=inchiriere', label: 'Închiriere' },
      { to: '/imobiliare?property_type=apartament', label: 'Apartamente' },
      { to: '/imobiliare?property_type=teren', label: 'Terenuri' },
      { to: '/comisioane-tarife', label: 'Calculator credit + comisioane' },
    ],
    testId: 'eco-imobiliare',
  },
  {
    id: 'forum',
    title: 'Comunitate',
    badge: '7 categorii · Anunțuri grup',
    icon: MessageSquare,
    subs: [
      { to: '/forum-v7', label: 'Toate discuțiile' },
      { to: '/forum-v7?category=tehnic', label: 'Întrebări tehnice' },
      { to: '/forum-v7?category=legislatie', label: 'Legislație + Norme' },
      { to: '/forum-v7?category=anunturi_munca', label: 'Anunțuri muncă' },
      { to: '/forum-v7?category=training', label: 'Cursuri + training' },
      { to: '/forum-v7?only_announcements=true', label: 'Grup Anunțuri' },
    ],
    testId: 'eco-forum',
  },
  {
    id: 'servicii',
    title: 'Servicii + Transport',
    badge: '15 specializări · taxă 5% per booking',
    icon: Wrench,
    subs: [
      { to: '/servicii', label: 'Toți meseriașii' },
      { to: '/servicii?spec=instalator_gaze', label: 'Instalatori gaze ANRE' },
      { to: '/servicii?spec=electrician', label: 'Electricieni' },
      { to: '/servicii?spec=diriginte_santier', label: 'Dirigenți șantier' },
      { to: '/servicii?tab=logistics', label: 'Transport + Mutări' },
      { to: '/smart-pricing', label: 'Calculator costuri (5 factori)' },
    ],
    testId: 'eco-servicii',
  },
];

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 rounded text-xs">
      <Icon className="w-3.5 h-3.5 text-orange-600 shrink-0" />
      <span className="text-zinc-500">{label}</span>
      <span className="font-bold text-zinc-950 tabular-nums">{value}</span>
    </div>
  );
}

export default function HomePageV7() {
  const nav = useNavigate();
  const [stats, setStats] = useState({ fields: '179', templates: '34', industries: '13', projects: '—' });
  const [recentProjects, setRecentProjects] = useState([]);
  const [trendingMarket, setTrendingMarket] = useState([]);
  const [trendingForum, setTrendingForum] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reg, proj, mkt, frm] = await Promise.all([
          api.get('/placeholders/registry'),
          api.get('/projects?limit=4').catch(() => ({ data: { items: [] } })),
          api.get('/marketplace/listings?limit=3').catch(() => ({ data: { items: [] } })),
          api.get('/forum/topics?sort=active&limit=4').catch(() => ({ data: { items: [] } })),
        ]);
        if (cancelled) return;
        setStats((s) => ({ ...s, fields: String(reg.data.fields.length), projects: String(proj.data?.total ?? proj.data?.items?.length ?? 0) }));
        setRecentProjects(proj.data?.items || []);
        setTrendingMarket(mkt.data?.items || []);
        setTrendingForum(frm.data?.items || []);
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) nav(`/marketplace?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <AppShell title="Acasă" subtitle="Ecosistemul tehnic complet · 5 module · documentație + marketplace + imobiliare + forum + servicii">

      {/* ============ HERO compact — EPD identity ============ */}
      <section className="mb-6 relative overflow-hidden text-white rounded-xl epd-shadow" data-testid="home-hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(76,29,149,0.85) 60%, rgba(30,58,138,0.9) 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] border border-white/20 px-2.5 py-1 mb-3 bg-white/5 backdrop-blur rounded">
              <Sparkles className="w-3 h-3 text-violet-300" /> The Architects of Future Global Technology
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-2">
              Bine ai venit. <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Redesigning projects.</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Produs principal: <strong className="text-white">documentație tehnică gaze naturale</strong> · plus marketplace · imobiliare · forum · meseriași & transport.
            </p>
          </div>

          {/* Search bar global */}
          <form onSubmit={onSearch} className="flex-shrink-0 w-full md:w-80" data-testid="home-search-form">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Caută anunțuri, materiale, meseriași..."
                className="w-full bg-white/10 backdrop-blur border border-white/20 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-violet-400 outline-none rounded-md"
                data-testid="home-search-input"
              />
            </div>
          </form>
        </div>
      </section>

      {/* ============ MAIN PRODUCT SPOTLIGHT — Gaze Naturale ============ */}
      <section className="mb-8" data-testid="home-main-product">
        <Link to="/gaze-naturale" className="group block relative overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/20 hover:border-violet-400 hover:shadow-lg transition-all">
          <div className="grid md:grid-cols-3 gap-0">
            <div className="md:col-span-2 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold epd-gradient text-white px-2 py-0.5 rounded">Produs principal</span>
                <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">100% operațional</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">
                Studio Gaze Naturale
                <span className="epd-gradient-text"> · 33 documente legale</span>
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mb-4 leading-relaxed">
                Generează automat dosar complet pentru branșament, instalație utilizare sau extindere conductă — cu Renouard multi-tronson, dimensionare contor/regulator și Anexa 13 (554 materiale OSD).
              </p>
              <div className="flex flex-wrap gap-2">
                {['NTPEE 2018', 'HG 273/1994', 'Ord. ANRE 89/2018', 'QES eIDAS', '221 câmpuri', 'Stripe planuri lunare'].map(b => (
                  <span key={b} className="text-[10px] font-semibold uppercase tracking-wider text-violet-700 bg-violet-100 px-2 py-1 rounded">{b}</span>
                ))}
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 group-hover:gap-3 transition-all">
                Deschide Studio <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-8 relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative text-center text-white">
                <Flame className="w-16 h-16 mx-auto mb-3 opacity-90" strokeWidth={1.5} />
                <div className="text-5xl font-bold tabular-nums mb-1">221</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-violet-200">câmpuri inginerești</div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ============ PAGINI PRINCIPALE — 12 quick-access pills ============ */}
      <section className="mb-8" data-testid="home-quick-access">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-bold tracking-tight text-zinc-950 uppercase">Pagini principale</h2>
          <Link to="/planuri-departamente" className="text-xs text-orange-600 hover:underline">Vezi toate ({QUICK_ACCESS.length}+) →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {QUICK_ACCESS.map((q) => {
            const Icon = q.icon;
            return (
              <Link key={q.to} to={q.to} data-testid={q.tid}
                className="flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2.5 hover:border-orange-500 hover:shadow-sm hover:-translate-y-0.5 transition-all rounded-md group">
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-orange-600 shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-zinc-950 truncate">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ STATS strip ============ */}
      <section className="mb-8 flex flex-wrap gap-2" data-testid="home-stats">
        <StatPill icon={FileText} label="Câmpuri unice" value={`${stats.fields}+`} />
        <StatPill icon={ClipboardList} label="Template DOCX" value={`${stats.templates}+`} />
        <StatPill icon={Building2} label="Industrii" value={stats.industries} />
        <StatPill icon={FolderKanban} label="Proiectele tale" value={stats.projects} />
        <StatPill icon={Tag} label="Listing" value="GRATUIT" />
        <StatPill icon={TrendingUp} label="Comision imobiliare" value="1%" />
      </section>

      {/* ============ 5 ECOSISTEME (3-col compact) ============ */}
      <section className="mb-10" data-testid="home-ecosystems">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">5 module integrate</h2>
            <p className="text-xs text-zinc-500">Click pe modulul care te interesează — fiecare are sub-pagini specifice.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ECOSYSTEMS.map((e) => {
            const Icon = e.icon;
            return (
              <div key={e.id} className="border border-zinc-200 bg-white p-5 hover:border-orange-500 hover:shadow-md transition-all rounded-lg group" data-testid={e.testId}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 flex items-center justify-center border border-zinc-200 group-hover:border-orange-500 group-hover:bg-orange-50 rounded transition-colors">
                    <Icon className="w-5 h-5 text-zinc-950 group-hover:text-orange-600 transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-orange-600 text-right max-w-[140px]">{e.badge}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-zinc-950 mb-3">{e.title}</h3>
                <ul className="space-y-1 mb-3">
                  {e.subs.slice(0, 6).map((s, idx) => (
                    <li key={idx}>
                      <Link to={s.to} className="text-xs text-zinc-600 hover:text-orange-600 inline-flex items-center gap-1 transition-colors">
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* 6th card: AI Assistant CTA */}
          <Link to="/consultant-ai" className="border-2 border-zinc-950 bg-zinc-950 text-white p-5 hover:border-orange-500 hover:bg-orange-600 transition-all rounded-lg group flex flex-col justify-between" data-testid="eco-ai">
            <div>
              <div className="w-10 h-10 flex items-center justify-center bg-orange-600 group-hover:bg-white group-hover:text-orange-600 rounded transition-colors mb-3">
                <Bot className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-2">Consultant AI</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">Claude Sonnet 4.5 + 4 AI agents · ajutor instant pentru proiecte, legislație și calcule.</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold border-b border-white/40 group-hover:border-white pb-0.5 self-start">
              Întreabă AI <ArrowUpRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </section>

      {/* ============ ACTIVITATE (3 col live) ============ */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="home-activity">
        {/* Proiecte recente */}
        <div className="border border-zinc-200 bg-white p-4 rounded-lg" data-testid="activity-projects">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Proiecte recente</h3>
            <Link to="/proiecte" className="text-[10px] text-orange-600 hover:underline">Toate →</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="text-center py-6 text-zinc-400">
              <FolderKanban className="w-7 h-7 mx-auto mb-2 opacity-50" />
              <Link to="/gaze-naturale" className="text-xs text-orange-600 hover:underline">+ Începe primul proiect</Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {recentProjects.slice(0, 4).map((p) => (
                <li key={p.pid || p.id}>
                  <Link to={`/gaze-naturale/${p.pid || p.id}`} className="block text-xs hover:bg-zinc-50 px-2 py-1.5 -mx-2 rounded">
                    <div className="font-semibold text-zinc-950 truncate">{p.title || p.name || 'Proiect fără titlu'}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('ro-RO') : '—'}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trending marketplace */}
        <div className="border border-zinc-200 bg-white p-4 rounded-lg" data-testid="activity-marketplace">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Trending Marketplace</h3>
            <Link to="/marketplace" className="text-[10px] text-orange-600 hover:underline">Toate →</Link>
          </div>
          {trendingMarket.length === 0 ? (
            <div className="text-center py-6 text-zinc-400">
              <ShoppingBag className="w-7 h-7 mx-auto mb-2 opacity-50" />
              <Link to="/marketplace" className="text-xs text-orange-600 hover:underline">+ Publică anunț gratuit</Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {trendingMarket.slice(0, 3).map((m) => (
                <li key={m.listing_id}>
                  <Link to="/marketplace" className="block text-xs hover:bg-zinc-50 px-2 py-1.5 -mx-2 rounded">
                    <div className="font-semibold text-zinc-950 truncate">{m.title}</div>
                    <div className="text-[10px] flex items-center justify-between mt-0.5">
                      <span className="text-orange-600 font-bold">{m.price_eur} €</span>
                      <span className="text-zinc-500 inline-flex items-center gap-0.5"><Eye className="w-3 h-3" />{m.views || 0}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Forum hot topics */}
        <div className="border border-zinc-200 bg-white p-4 rounded-lg" data-testid="activity-forum">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Discuții active</h3>
            <Link to="/forum-v7" className="text-[10px] text-orange-600 hover:underline">Toate →</Link>
          </div>
          {trendingForum.length === 0 ? (
            <div className="text-center py-6 text-zinc-400">
              <MessageSquare className="w-7 h-7 mx-auto mb-2 opacity-50" />
              <Link to="/forum-v7" className="text-xs text-orange-600 hover:underline">+ Pornește o discuție</Link>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {trendingForum.slice(0, 4).map((t) => (
                <li key={t.topic_id}>
                  <Link to={`/forum-v7`} className="block text-xs hover:bg-zinc-50 px-2 py-1.5 -mx-2 rounded">
                    <div className="font-semibold text-zinc-950 truncate">{t.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />{t.replies_count || 0}
                      <Eye className="w-3 h-3" />{t.views || 0}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ============ FOOTER trust ============ */}
      <section className="border-t border-zinc-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center" data-testid="home-footer-trust">
        <div className="flex flex-wrap gap-1.5">
          {['NTPEE 2018', 'Legea 10/1995', 'HG 273/1994', 'Ord. ANRE 89/2018', 'L 50/1991', 'GDPR'].map((b) => (
            <span key={b} className="text-[10px] font-mono uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded">{b}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end items-center text-xs">
          <Link to="/comisioane-tarife" className="text-zinc-500 hover:text-orange-600">Comisioane & tarife</Link>
          <span className="text-zinc-300">·</span>
          <Link to="/planuri-departamente" className="text-zinc-500 hover:text-orange-600">Planuri & departamente</Link>
          <span className="text-zinc-300">·</span>
          <Link to="/forum-v7?category=tehnic" className="text-zinc-500 hover:text-orange-600">Suport tehnic</Link>
        </div>
      </section>
    </AppShell>
  );
}
