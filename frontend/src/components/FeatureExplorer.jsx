/**
 * FeatureExplorer — V13.8 (Feb 2026)
 *
 * Cerință explicită user:
 *   „pentru varianta de trial, mi-as dori sa faci disponibile toate functiile
 *    developer-ului, dar sa fie limitate de executare comenzi, sa fie doar de
 *    prezentare si explorare site! Mi-as dori ca interfata sa afiseze toate
 *    optiunile pe care le are, ca apoi utilizatorul sa isi aleaga planul!"
 *
 * Afișează TOATE modulele EPD (35+) grupate pe departamente, cu:
 *   - Cardurile deblocate → click direct spre feature
 *   - Cardurile blocate  → click spre /pricing?unlock=<path> cu preview
 *   - Icoana de lacăt pe cele blocate, cu tooltip planurile care le deblochează
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  Lock, Sparkles, ChevronRight, LayoutDashboard,
  Home, FolderKanban, Compass, Flame, FileText, Stamp, FileCheck2,
  GaugeCircle, ShieldCheck, FileSearch, Receipt, ShoppingBag, Building2,
  MessageSquare, Wrench, Calculator, Bot, Users, BadgeCheck, Mail,
  ListChecks, Settings, CreditCard, Terminal, ListOrdered, Package,
} from 'lucide-react';

const ICON_MAP = {
  Home, LayoutDashboard, FolderKanban, Compass, Flame, FileText, Sparkles, Stamp,
  FileCheck2, GaugeCircle, ShieldCheck, FileSearch, Receipt, ShoppingBag, Building2,
  MessageSquare, Wrench, Calculator, Bot, Users, BadgeCheck, Mail, ListChecks,
  Settings, CreditCard, Terminal, ListOrdered, Package,
};

export default function FeatureExplorer() {
  const [groups, setGroups] = useState([]);
  const [meta, setMeta] = useState({ total: 0, locked: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me/menu?include_locked=true');
        setGroups(data.departments || []);
        setMeta({ total: data.total_pages || 0, locked: data.locked_count || 0 });
        // Auto-expand first department
        if (data.departments?.length) setExpandedDept(data.departments[0].id);
      } catch (err) {
        console.error('FeatureExplorer load failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="border border-zinc-200 rounded-xl p-8 bg-white text-center text-sm text-zinc-500">
        Se încarcă catalogul de funcții…
      </div>
    );
  }

  const availableCount = meta.total - meta.locked;

  return (
    <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden" data-testid="feature-explorer">
      <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold mb-1">// Explorator funcții</div>
          <h2 className="text-lg font-bold text-zinc-950 tracking-tight">Toate modulele EPD</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {availableCount} disponibile · {meta.locked} blocate · {meta.total} total.
            {meta.locked > 0 && ' Cele blocate se pot vedea în preview — clic pe ele te duce la planurile care le deblochează.'}
          </p>
        </div>
        {meta.locked > 0 && (
          <Link to="/pricing" className="epd-btn text-xs py-1.5 px-3" data-testid="feature-explorer-cta-upgrade">
            <Sparkles className="w-3.5 h-3.5" /> Deblochează tot
          </Link>
        )}
      </div>

      <div className="p-2">
        {groups.map((g) => {
          const HeadingIcon = ICON_MAP[g.icon] || LayoutDashboard;
          const isExpanded = expandedDept === g.id;
          const lockedInDept = (g.pages || []).filter(p => p.locked).length;
          const totalInDept = (g.pages || []).length;
          return (
            <div key={g.id} className="border-b border-zinc-100 last:border-b-0">
              <button
                type="button"
                onClick={() => setExpandedDept(isExpanded ? null : g.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors group"
                data-testid={`feature-dept-toggle-${g.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-zinc-100 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center transition-colors">
                    <HeadingIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold tracking-tight text-zinc-950">{g.label}</div>
                    <div className="text-[11px] text-zinc-500">
                      {totalInDept} funcți{totalInDept === 1 ? 'e' : 'i'}
                      {lockedInDept > 0 && ` · ${lockedInDept} blocate`}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>
              {isExpanded && (
                <div className="pb-3 px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(g.pages || []).map((p) => {
                    const Icon = ICON_MAP[p.icon] || LayoutDashboard;
                    const to = p.locked
                      ? `/pricing?unlock=${encodeURIComponent(p.path)}`
                      : p.path;
                    return (
                      <Link
                        key={p.key}
                        to={to}
                        className={`group relative p-3 rounded-lg border transition-all flex items-start gap-3 ${
                          p.locked
                            ? 'border-zinc-200 bg-zinc-50/50 hover:border-violet-300 hover:bg-violet-50/40'
                            : 'border-zinc-200 hover:border-zinc-950 hover:shadow-md hover:-translate-y-0.5 bg-white'
                        }`}
                        title={
                          p.locked
                            ? `Deblocați cu planul: ${(p.unlock_plans || []).join(', ')}`
                            : undefined
                        }
                        data-testid={`feature-card-${p.key}`}
                      >
                        <div
                          className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center ${
                            p.locked ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-950 text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold tracking-tight ${p.locked ? 'text-zinc-600' : 'text-zinc-950'}`}>
                            {p.label}
                          </div>
                          {p.locked && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-violet-700 font-bold">
                              <Lock className="w-2.5 h-2.5" /> Preview · Plan necesar
                            </div>
                          )}
                          {!p.locked && (
                            <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-bold">
                              ✓ Disponibil
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
