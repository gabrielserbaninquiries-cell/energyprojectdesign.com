import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Users, Trash2, Shield, ShieldCheck, ArrowLeft, Search, Save,
  UserX, UserCheck, Filter, Download, TrendingUp, KeyRound,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';
import EPDLogo from '../components/EPDLogo';

const PLAN_OPTIONS = [
  'free', 'trial', 'basic', 'operator', 'proiectant', 'executant', 'avize',
  'ofertare', 'contabilitate', 'vgd', 'rte', 'societate', 'mass_production',
  'osd', 'srl', 'developer', 'inside_full', 'society_admin', 'cofounder',
];

function ConfirmDeleteModal({ user, onConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const canDelete = typed === user.email;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="delete-user-modal">
      <div className="bg-white max-w-md w-full border-2 border-red-500 shadow-2xl">
        <div className="border-b border-red-200 px-5 py-3 bg-red-50">
          <div className="text-[10px] uppercase tracking-wider text-red-700 font-bold">// acțiune destructivă</div>
          <h3 className="text-lg font-bold tracking-tight text-red-900">Șterge cont utilizator</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="border border-red-200 bg-red-50/50 p-3 text-sm text-red-900">
            <strong>{user.name || 'Fără nume'}</strong> · {user.email}<br/>
            Plan: <code>{user.plan}</code>
          </div>
          <p className="text-sm text-slate-700">Utilizatorul va fi marcat ca <strong>șters</strong> (soft delete), sesiunile active vor fi invalidate. Acțiunea este înregistrată în audit log.</p>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Confirmă tastând email-ul <span className="font-mono text-red-700">{user.email}</span>:
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              data-testid="confirm-delete-input"
              className="w-full px-3 py-2 border border-slate-300 text-sm font-mono focus:border-red-500 focus:outline-none"
              placeholder={user.email}
            />
          </div>
        </div>
        <div className="border-t px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-slate-300 text-sm hover:bg-slate-50">Anulează</button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            data-testid="confirm-delete-btn"
            className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-40 flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Șterge definitiv
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanEditor({ user, onSave, onClose }) {
  const [plan, setPlan] = useState(user.plan || 'free');
  const [isAdmin, setIsAdmin] = useState(user.is_admin || false);
  const [isDev, setIsDev] = useState(user.is_developer || false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/users/${user.user_id}`, {
        plan, is_admin: isAdmin, is_developer: isDev,
      });
      toast.success(`Cont actualizat: ${user.email} → ${plan}`);
      onSave(data.user);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare actualizare');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="plan-editor-modal">
      <div className="bg-white max-w-lg w-full border-2 border-black shadow-2xl">
        <div className="border-b px-5 py-3">
          <div className="text-[10px] uppercase tracking-wider text-violet-600 font-bold">// atribuire plan</div>
          <h3 className="text-lg font-bold tracking-tight">{user.email}</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              data-testid="plan-select"
              className="w-full px-3 py-2 border border-slate-300 text-sm font-mono"
            >
              {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} data-testid="toggle-admin" />
              is_admin
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isDev} onChange={(e) => setIsDev(e.target.checked)} data-testid="toggle-developer" />
              is_developer
            </label>
          </div>
        </div>
        <div className="border-t px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-slate-300 text-sm hover:bg-slate-50">Anulează</button>
          <button
            onClick={save}
            disabled={busy}
            data-testid="save-plan-btn"
            className="px-4 py-2 bg-black text-white text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> {busy ? 'Salvez...' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [registry, setRegistry] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useSEO({
    title: 'Admin · Evidență conturi · Energy Project Design',
    description: 'Panou administrare conturi platformă. Doar developer/admin.',
  });

  const isAllowed = user?.is_admin || user?.is_developer;

  const loadRegistry = async () => {
    try {
      const { data } = await api.get('/admin/accounts/registry');
      setRegistry(data);
    } catch (e) { /* silent */ }
  };
  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}&limit=500` : '?limit=500';
      const { data } = await api.get(`/admin/users${q}`);
      setUsers(data.users || []);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare listare');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isAllowed) { loadRegistry(); loadUsers(); } else { setLoading(false); } }, [isAllowed]);  // eslint-disable-line

  const filtered = useMemo(() => {
    return planFilter ? users.filter(u => u.plan === planFilter) : users;
  }, [users, planFilter]);

  const doDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget.user_id}`);
      toast.success(`Cont șters: ${deleteTarget.email}`);
      setUsers(users.filter(u => u.user_id !== deleteTarget.user_id));
      setDeleteTarget(null);
      loadRegistry();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare ștergere');
    }
  };

  const exportCSV = () => {
    const header = 'user_id,email,name,plan,is_admin,is_developer,auth_method,created_at\n';
    const rows = filtered.map(u => `"${u.user_id}","${u.email}","${u.name || ''}","${u.plan}","${!!u.is_admin}","${!!u.is_developer}","${u.auth_method || 'email'}","${u.created_at || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epd_accounts_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md" data-testid="admin-no-access">
          <Shield className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">Acces restricționat</h1>
          <p className="text-slate-600 mb-4">Această pagină este rezervată developer-ului platformei.</p>
          <Link to="/dashboard" className="text-violet-700 font-semibold hover:underline">← Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <EPDLogo />
          <Link to="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-950 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-violet-600 font-semibold mb-2">// admin developer</div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-1">Evidență reală conturi platformă</h1>
        <p className="text-slate-600 mb-8">Management complet: căutare, filtrare, atribuire plan, ștergere. Toate acțiunile sunt înregistrate în audit log.</p>

        {registry && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" data-testid="registry-stats">
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Conturi active</div>
              <div className="text-3xl font-bold tabular-nums">{registry.total_active}</div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Șterse</div>
              <div className="text-3xl font-bold tabular-nums text-red-600">{registry.total_deleted}</div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Plan-uri active</div>
              <div className="text-3xl font-bold tabular-nums">{Object.keys(registry.by_plan || {}).length}</div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Via Google Sign-in</div>
              <div className="text-3xl font-bold tabular-nums text-violet-600">{(registry.by_auth_method || {}).google_native || 0}</div>
            </div>
          </section>
        )}

        {registry && (
          <section className="mb-8" data-testid="by-plan-breakdown">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Distribuție pe planuri</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {Object.entries(registry.by_plan || {}).sort((a, b) => b[1] - a[1]).map(([p, n]) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(planFilter === p ? '' : p)}
                  data-testid={`plan-tile-${p}`}
                  className={`p-3 rounded-lg border text-left transition-all ${planFilter === p ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}
                >
                  <div className="text-xs font-mono text-slate-500">{p}</div>
                  <div className="text-2xl font-bold tabular-nums">{n}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 border border-slate-200 rounded-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') loadUsers(); }}
              placeholder="Caută email / nume / firmă..."
              data-testid="user-search-input"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 text-sm focus:border-violet-500 focus:outline-none rounded"
            />
          </div>
          <button onClick={loadUsers} className="px-3 py-2 border border-slate-300 text-sm hover:bg-slate-50 rounded" data-testid="search-btn">Caută</button>
          {planFilter && (
            <button onClick={() => setPlanFilter('')} className="px-3 py-2 bg-violet-100 text-violet-700 text-xs rounded flex items-center gap-1">
              <Filter className="w-3 h-3" /> plan={planFilter} ×
            </button>
          )}
          <div className="flex-1" />
          <button onClick={exportCSV} className="px-3 py-2 border border-slate-300 text-sm hover:bg-slate-50 rounded flex items-center gap-2" data-testid="export-csv-btn">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {loading && <div className="p-8 text-center text-slate-500">Se încarcă...</div>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center text-slate-500">Niciun cont găsit.</div>}
          {!loading && filtered.length > 0 && (
            <table className="w-full text-sm" data-testid="users-table">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Email · Nume</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Plan</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Auth</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Roluri</th>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Creat</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider text-slate-500">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`user-row-${u.user_id}`}>
                    <td className="px-4 py-2">
                      <div className="font-semibold text-slate-900">{u.email}</div>
                      <div className="text-xs text-slate-500">{u.name || '—'}</div>
                    </td>
                    <td className="px-4 py-2"><span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{u.plan}</span></td>
                    <td className="px-4 py-2 text-xs text-slate-600">{u.auth_method || 'email'}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        {u.is_developer && <span className="text-[9px] uppercase bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded" title="Developer">DEV</span>}
                        {u.is_admin && <span className="text-[9px] uppercase bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded" title="Admin">ADMIN</span>}
                        {u.deleted && <span className="text-[9px] uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded" title="Șters">DELETED</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{u.created_at?.slice(0, 10) || '—'}</td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditTarget(u)}
                        data-testid={`edit-${u.user_id}`}
                        className="text-xs text-violet-700 hover:underline mr-3"
                      >
                        <KeyRound className="w-3 h-3 inline" /> Plan
                      </button>
                      {!u.deleted && u.user_id !== user.user_id && (
                        <button
                          onClick={() => setDeleteTarget(u)}
                          data-testid={`delete-${u.user_id}`}
                          className="text-xs text-red-600 hover:underline"
                        >
                          <Trash2 className="w-3 h-3 inline" /> Șterge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {editTarget && (
        <PlanEditor
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(u) => { setUsers(users.map(x => x.user_id === u.user_id ? u : x)); setEditTarget(null); loadRegistry(); }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal user={deleteTarget} onConfirm={doDelete} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
