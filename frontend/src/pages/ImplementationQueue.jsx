import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, Clock, AlertTriangle, Sparkles, GitBranch, Loader2, ListOrdered } from 'lucide-react';

const STATUS_COLOR = {
  pending:    'bg-amber-100 text-amber-800 border-amber-300',
  approved:   'bg-blue-100 text-blue-800 border-blue-300',
  rejected:   'bg-gray-100 text-gray-800 border-gray-300',
  applied:    'bg-green-100 text-green-800 border-green-300',
  rolled_back:'bg-red-100 text-red-800 border-red-300',
};

const RISK_COLOR = {
  high:   'text-red-600',
  medium: 'text-amber-600',
  low:    'text-green-600',
  info:   'text-blue-600',
};

export default function ImplementationQueue() {
  const { user } = useAuth();
  const isDev = user?.is_developer || user?.is_admin;
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/queue/proposals');
      setProposals(data.proposals || []);
    } catch (e) {
      toast.error('Eroare la încărcare');
    }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (pid, status) => {
    setBusy(pid);
    try {
      await api.patch(`/queue/proposals/${pid}`, { status });
      toast.success(`Marcat ca: ${status}`);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare');
    } finally {
      setBusy(null);
    }
  };

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter);
  const counts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    applied: proposals.filter(p => p.status === 'applied').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <AppShell title="AI Implementation Queue" subtitle="Propuneri generate de AI Developer · Aprobă / Respinge individual">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-gray-200 border border-gray-200 mb-6" data-testid="queue-stats">
        {['all', 'pending', 'approved', 'applied', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`bg-white p-4 text-left transition-colors ${filter === s ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
            data-testid={`queue-filter-${s}`}
          >
            <div className="text-2xl font-bold mono">{counts[s] || 0}</div>
            <div className="text-[10px] uppercase tracking-wider mt-1">{s}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 bg-white">
          <ListOrdered className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Nicio propunere în această categorie.</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="queue-list">
          {filtered.map((p) => {
            const sty = STATUS_COLOR[p.status] || STATUS_COLOR.pending;
            return (
              <div key={p.pid} className="border border-gray-200 bg-white p-5" data-testid={`queue-item-${p.pid}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${sty}`}>{p.status}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400">{p.category}</span>
                      <span className={`text-[10px] mono ${RISK_COLOR[p.risk] || ''}`}>risk: {p.risk}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{p.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{p.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <div className="label mb-1">// motiv (sursa documentelor)</div>
                    <div className="text-gray-700 leading-relaxed">{p.reason}</div>
                  </div>
                  <div>
                    <div className="label mb-1">// impact</div>
                    <div className="text-gray-700 leading-relaxed">{p.impact}</div>
                  </div>
                  <div>
                    <div className="label mb-1">// fișiere vizate</div>
                    {p.target_files?.length > 0 ? (
                      <div className="space-y-1">
                        {p.target_files.map((f, i) => (
                          <div key={i} className="mono text-[10px] text-blue-700">{f}</div>
                        ))}
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </div>
                </div>

                {p.target_module && (
                  <div className="text-[10px] text-gray-500 mono mb-3">
                    <GitBranch className="w-2.5 h-2.5 inline mr-1" />
                    modul: {p.target_module}
                  </div>
                )}

                {isDev && p.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateStatus(p.pid, 'approved')}
                      disabled={busy === p.pid}
                      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
                      data-testid={`queue-approve-${p.pid}`}
                    >
                      {busy === p.pid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Aprobă
                    </button>
                    <button
                      onClick={() => updateStatus(p.pid, 'rejected')}
                      disabled={busy === p.pid}
                      className="flex items-center gap-1 text-xs bg-gray-200 text-gray-800 px-3 py-1.5 hover:bg-gray-300 disabled:opacity-50"
                      data-testid={`queue-reject-${p.pid}`}
                    >
                      <X className="w-3 h-3" /> Respinge
                    </button>
                  </div>
                )}
                {isDev && p.status === 'approved' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateStatus(p.pid, 'applied')}
                      disabled={busy === p.pid}
                      className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 disabled:opacity-50"
                      data-testid={`queue-apply-${p.pid}`}
                    >
                      {busy === p.pid ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Marchează aplicat
                    </button>
                  </div>
                )}
                {!isDev && (
                  <div className="text-[10px] text-gray-400 italic">
                    Doar dezvoltatorul/administratorul poate aproba/respinge.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
