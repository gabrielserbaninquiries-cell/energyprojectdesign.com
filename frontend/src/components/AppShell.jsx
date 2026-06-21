import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import ActiveProjectBar from './ActiveProjectBar';
import LicenseTimer from './LicenseTimer';
import CommandBar from './CommandBar';
import {
  LayoutDashboard, ClipboardList, Settings2, Calculator, FileText, FileCheck2,
  Stamp, ShieldCheck, Mail, BadgeCheck, GaugeCircle, CreditCard, Settings, LogOut,
  Sparkles, Wrench, ListChecks, Flame, ChevronRight, FolderKanban, Github, Banknote, MessageSquare, Building2,
  Layers, Compass, BarChart3, Sun, Bot, FileSearch, Users as UsersIcon, Receipt, AlertTriangle, X,
  Lock, Terminal, Package, ListOrdered, Home, ShoppingBag, Truck, KeyRound,
} from 'lucide-react';

// Note: SECTIONS static array removed in V7.2 — sidebar now consumes /api/me/menu
// which returns DEPARTMENTS × pages filtered by user's plan + role.

export default function AppShell({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [menuGroups, setMenuGroups] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await api.get('/system/banner');
        if (!cancelled) setBanner(data);
      } catch (_) { /* silent */ }
    };
    poll();
    const t = setInterval(poll, 60000); // every 60s
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/me/menu');
        if (!cancelled) setMenuGroups(data.departments || []);
      } catch {
        // fallback: empty menu — user still has direct route access via URL
        if (!cancelled) setMenuGroups([]);
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Lucide icon mapper — keys come from backend
  const ICON_MAP = {
    Home, LayoutDashboard, FolderKanban, Compass, Flame, FileText, Sparkles, Stamp,
    FileCheck2, GaugeCircle, ShieldCheck, FileSearch, Receipt, ShoppingBag, Building2,
    MessageSquare, Wrench, Calculator, Bot, UsersIcon, BadgeCheck, Mail, ListChecks,
    Settings, CreditCard, KeyRound: ShieldCheck, ClipboardCheck: BadgeCheck,
    Pencil: Settings2, HardHat: Wrench, PencilRuler: Wrench, Briefcase: BadgeCheck,
    FileCheck: FileCheck2,
  };

  const showBanner = banner && !bannerDismissed && (banner.maintenance_mode || banner.announcement_banner);
  const isWarn = banner?.maintenance_mode || banner?.announcement_level === 'warning' || banner?.announcement_level === 'danger';
  const bannerBg = banner?.maintenance_mode || banner?.announcement_level === 'danger'
    ? 'bg-rose-600 text-white'
    : banner?.announcement_level === 'warning'
    ? 'bg-amber-500 text-black'
    : banner?.announcement_level === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-sky-600 text-white';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-y-auto" data-testid="app-sidebar">
        <div className="px-6 py-5 border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2.5" data-testid="sidebar-brand-link">
            <img
              src="https://customer-assets.emergentagent.com/job_github-push-test/artifacts/3x5homqi_722490090_122280146870059458_1686842917685227154_n.jpg"
              alt="Energy Project Design"
              className="w-9 h-9 rounded-lg shadow-md shrink-0 epd-logo-mark-crop overflow-hidden"
              data-testid="sidebar-brand-logo"
            />
            <div>
              <div className="font-bold tracking-tight text-[15px] leading-tight text-slate-900">Energy Project<span className="epd-gradient-text"> Design</span></div>
              <div className="text-[9px] uppercase tracking-[0.22em] text-violet-600 mt-0.5 font-semibold">Redesigning projects.</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4">
          {menuLoading && (
            <div className="px-3 text-[10px] text-zinc-400 uppercase tracking-widest">Se încarcă meniul…</div>
          )}
          {!menuLoading && menuGroups && menuGroups.map((group) => {
            const HeadingIcon = ICON_MAP[group.icon] || LayoutDashboard;
            return (
              <div key={group.id}>
                <div className="px-3 mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  <HeadingIcon className="w-3 h-3 shrink-0" />
                  <span>{group.label}</span>
                </div>
                <div className="space-y-0.5">
                  {group.pages.map((n) => {
                    const Icon = ICON_MAP[n.icon] || LayoutDashboard;
                    const active = location.pathname === n.path || (n.path !== '/dashboard' && n.path !== '/acasa' && location.pathname.startsWith(n.path));
                    return (
                      <Link
                        key={n.key}
                        to={n.path}
                        data-testid={n.tid}
                        className={`flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition-colors rounded-sm border-l-2 ${
                          active ? 'bg-zinc-950 text-white border-orange-500' : 'text-zinc-700 hover:bg-zinc-100 border-transparent'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate">{n.label}</span>
                        {active && <ChevronRight className="w-3 h-3" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!menuLoading && (user?.is_developer || user?.is_admin) && (
            <div>
              <div className="px-3 mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-orange-600">
                <Terminal className="w-3 h-3" />
                <span>Developer Tools</span>
              </div>
              <div className="space-y-0.5">
                {[
                  ['/developer', 'AI Developer Plan', Wrench, 'nav-developer'],
                  ['/developer/chat', 'AI Developer Chat', Sparkles, 'nav-developer-chat'],
                  ['/queue', 'AI Implementation Queue', ListOrdered, 'nav-queue'],
                  ['/self-check', 'Self Check', ListChecks, 'nav-self-check'],
                  ['/skeleton', 'Product Skeleton', Package, 'nav-skeleton'],
                  ['/inside', 'Inside Full', Lock, 'nav-inside'],
                  ['/developer/github', 'Push pe GitHub', Github, 'nav-developer-github'],
                  ['/admin/payment-accounts', 'Conturi încasări', Banknote, 'nav-payment-accounts'],
                ].map(([path, label, Icon, tid]) => (
                  <Link key={path} to={path} data-testid={tid}
                    className={`flex items-center gap-2.5 px-3 py-1.5 text-[12.5px] transition-colors rounded-sm border-l-2 ${
                      location.pathname.startsWith(path) ? 'bg-zinc-950 text-white border-orange-500' : 'text-zinc-700 hover:bg-zinc-100 border-transparent'
                    }`}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 epd-gradient text-white font-bold flex items-center justify-center rounded-full text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate text-slate-900" data-testid="user-name">{user?.name}</div>
              <div className="text-[10px] text-violet-600 uppercase tracking-wider font-semibold">Plan: {user?.plan}</div>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={async () => { await logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-sm text-slate-700 hover:text-violet-700 px-3 py-2 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Deconectare
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {showBanner && (
          <div className={`relative ${bannerBg} px-6 py-2.5 text-sm flex items-center gap-3`} data-testid="global-banner">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              {banner.maintenance_mode && <strong className="mr-2 uppercase tracking-wider text-xs">Mentenanță:</strong>}
              {banner.maintenance_message || banner.announcement_banner}
            </div>
            <button onClick={() => setBannerDismissed(true)} className="opacity-70 hover:opacity-100" data-testid="banner-dismiss"><X className="w-4 h-4" /></button>
          </div>
        )}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">{title}</h1>
            {subtitle && <div className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-[800px] justify-end">
            <CommandBar variant="user" />
            {(user?.is_developer || user?.is_admin) && (
              <CommandBar variant="developer" isDeveloper={true} />
            )}
            <LicenseTimer />
            <ActiveProjectBar />
          </div>
        </header>
        <main className="flex-1 px-8 py-8 page-enter">{children}</main>
      </div>
    </div>
  );
}
