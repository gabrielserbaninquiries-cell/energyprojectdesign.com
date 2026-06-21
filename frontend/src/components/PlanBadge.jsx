// V10.4 — Plan Badge component
// Displays current plan + monthly usage (projects + documents) with progress bars.
// Used in the right sidebar of Gas Studio + AppShell header.
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, AlertTriangle } from 'lucide-react';

export default function PlanBadge({ plan, compact = false }) {
  const nav = useNavigate();
  if (!plan) return null;
  const u = plan.usage || {};
  const isUnlimited = (plan.projects_per_month || 0) >= 99999;
  const isOwner = !!plan.is_owner || plan.plan_id === 'society_admin' || plan.plan_id === 'cofounder' || plan.plan_id === 'developer' || plan.plan_id === 'developer_elite';
  const projectsBar = u.projects_pct || 0;
  const docsBar = u.documents_pct || 0;
  const nearProjectsLimit = projectsBar >= 80 && !isUnlimited;
  const nearDocsLimit = docsBar >= 80 && !isUnlimited;
  const reachedAnyLimit = (u.projects_remaining === 0) || (u.documents_remaining === 0);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 text-[10px] font-semibold text-violet-700" data-testid="plan-badge-compact">
        {isOwner ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
        <span className="uppercase tracking-wider">{plan.plan_name}</span>
        {!isUnlimited && (
          <span className="text-violet-500">· {u.projects_this_month}/{plan.projects_per_month}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-violet-200 rounded-xl overflow-hidden epd-shadow" data-testid="plan-badge-card">
      <div className={`px-4 py-2.5 flex items-center justify-between ${isOwner ? 'epd-gradient text-white' : 'bg-gradient-to-r from-violet-50 to-indigo-50'}`}>
        <div className="flex items-center gap-2">
          {isOwner ? <Crown className="w-4 h-4" /> : <Sparkles className={`w-3.5 h-3.5 ${isOwner ? 'text-white' : 'text-violet-600'}`} />}
          <div>
            <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${isOwner ? 'text-white/85' : 'text-violet-700'}`}>// Plan activ</div>
            <div className={`text-sm font-bold ${isOwner ? 'text-white' : 'text-slate-900'}`}>{plan.plan_label || plan.plan_name}</div>
          </div>
        </div>
        {plan.role && (
          <div className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${isOwner ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'}`}>
            {plan.role}
          </div>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Projects usage */}
        <div>
          <div className="flex items-baseline justify-between text-[10px] mb-1">
            <span className="uppercase tracking-wider font-semibold text-slate-500">Proiecte luna curentă</span>
            <span className={`font-mono tabular-nums font-bold ${nearProjectsLimit ? 'text-rose-600' : 'text-slate-800'}`}>
              {u.projects_this_month || 0}
              {!isUnlimited && <span className="text-slate-400"> / {plan.projects_per_month}</span>}
              {isUnlimited && <span className="text-slate-400"> / ∞</span>}
            </span>
          </div>
          {!isUnlimited && (
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${nearProjectsLimit ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                style={{ width: `${projectsBar}%` }}
              />
            </div>
          )}
        </div>

        {/* Documents usage */}
        <div>
          <div className="flex items-baseline justify-between text-[10px] mb-1">
            <span className="uppercase tracking-wider font-semibold text-slate-500">Documente generate / lună</span>
            <span className={`font-mono tabular-nums font-bold ${nearDocsLimit ? 'text-rose-600' : 'text-slate-800'}`}>
              {u.documents_this_month || 0}
              {(plan.documents_per_month || 0) < 99999 && <span className="text-slate-400"> / {plan.documents_per_month}</span>}
              {(plan.documents_per_month || 0) >= 99999 && <span className="text-slate-400"> / ∞</span>}
            </span>
          </div>
          {(plan.documents_per_month || 0) < 99999 && (
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${nearDocsLimit ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                style={{ width: `${docsBar}%` }}
              />
            </div>
          )}
        </div>

        {reachedAnyLimit && (
          <div className="text-[10px] flex items-start gap-1.5 bg-rose-50 border border-rose-200 rounded-md p-2 text-rose-700">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <div>
              <strong>Cotă atinsă.</strong>{' '}
              <button onClick={() => nav('/pricing')} className="underline font-semibold" data-testid="plan-badge-upgrade-link">
                Upgrade plan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
