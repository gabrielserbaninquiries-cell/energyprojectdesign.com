import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ListChecks, Filter, Calendar, RefreshCw, Download } from 'lucide-react';

const ACTION_LABELS = {
  'login': 'Autentificare',
  'register': 'Înregistrare cont',
  'project.create': 'Proiect creat',
  'project.update': 'Proiect modificat',
  'project.activate': 'Proiect activat',
  'document.generate': 'Document generat',
  'document.sign': 'Document semnat',
  'stamp.create': 'Ștampilă încărcată',
  'certification.create': 'Certificare emisă',
  'email.send': 'Email trimis',
  'plan.upgrade': 'Plan upgrade-uit',
  'dev.plan': 'AI Developer plan',
  'dev.github.push': 'Push pe GitHub',
  'dev.handoff.push': 'Handoff salvat în GitHub',
  'forum.thread.create': 'Forum: discuție nouă',
  'forum.reply.create': 'Forum: răspuns nou',
  'company.profile.update': 'Profil societate actualizat',
  'admin.payment_accounts.create': 'Cont de încasare creat',
  'admin.payment_accounts.update': 'Cont de încasare modificat',
  'admin.payment_accounts.delete': 'Cont de încasare șters',
  'lifecycle.set_status': 'Status proiect schimbat',
};

function actionLabel(a) { return ACTION_LABELS[a] || a; }

function actionColor(a) {
  if (a.includes('dev.')) return 'bg-[#FFB300] text-black';
  if (a.includes('login') || a.includes('register')) return 'bg-blue-100 text-blue-800';
  if (a.includes('forum')) return 'bg-purple-100 text-purple-800';
  if (a.includes('document') || a.includes('certification')) return 'bg-green-100 text-green-800';
  if (a.includes('admin')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-700';
}

export default function AuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', from_date: '', to_date: '', limit: 100 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/logs/actions');
        setActions(data);
      } catch (e) { /* actions list optional */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([k, v]) => v !== '' && v != null));
        const { data } = await api.get('/logs', { params });
        setLogs(data);
      } catch (e) {
        toast.error('Eroare încărcare loguri.');
      } finally { setLoading(false); }
    })();
  }, [filters.action, filters.from_date, filters.to_date, filters.limit, reloadKey]);

  function update(k, v) { setFilters((f) => ({ ...f, [k]: v })); }
  function reload() { setReloadKey(k => k + 1); }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epd-audit-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${logs.length} loguri exportate.`);
  }

  return (
    <AppShell>
      <div className="p-8 max-w-7xl" data-testid="audit-logs-page">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><ListChecks className="w-8 h-8" /> Registru audit</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              {user?.is_developer ? 'Vezi loguri pentru toți utilizatorii (acces administrator).' : 'Vezi toate acțiunile efectuate în contul tău.'}
              {' '}Acest log e folosit pentru GDPR audit trail și verificare de conformitate.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={reload} className="border border-black px-3 py-2 text-xs hover:bg-black hover:text-[#FFB300] flex items-center gap-1.5" data-testid="reload-logs-btn">
              <RefreshCw className="w-3.5 h-3.5" /> Reîncarcă
            </button>
            <button onClick={exportJSON} disabled={!logs.length} className="bg-black text-[#FFB300] px-3 py-2 text-xs flex items-center gap-1.5 hover:bg-[#FFB300] hover:text-black border border-black disabled:opacity-50" data-testid="export-logs-btn">
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-2 border-black p-4 mb-6" data-testid="logs-filters">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> Filtre</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase text-gray-500">Acțiune</label>
              <select value={filters.action} onChange={(e) => update('action', e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-black text-xs" data-testid="filter-action">
                <option value="">— Toate —</option>
                {actions.map(a => <option key={a} value={a}>{actionLabel(a)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500">De la data</label>
              <input type="date" value={filters.from_date} onChange={(e) => update('from_date', e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-black text-xs" data-testid="filter-from-date" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500">Până la data</label>
              <input type="date" value={filters.to_date} onChange={(e) => update('to_date', e.target.value)} className="w-full mt-1 px-2 py-1.5 border border-black text-xs" data-testid="filter-to-date" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500">Limită</label>
              <select value={filters.limit} onChange={(e) => update('limit', Number(e.target.value))} className="w-full mt-1 px-2 py-1.5 border border-black text-xs" data-testid="filter-limit">
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
          {(filters.action || filters.from_date || filters.to_date) && (
            <button onClick={() => setFilters({ action: '', from_date: '', to_date: '', limit: 100 })} className="text-xs text-gray-600 hover:text-black mt-3 underline">Resetează filtrele</button>
          )}
        </div>

        {/* Logs table */}
        {loading ? (
          <div className="text-sm text-gray-500 py-12 text-center">Se încarcă logurile…</div>
        ) : logs.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-12 text-center text-sm text-gray-500" data-testid="logs-empty">
            <ListChecks className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            Niciun log pentru filtrele actuale.
          </div>
        ) : (
          <div className="bg-white border-2 border-black overflow-x-auto" data-testid="logs-table">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-black text-[#FFB300] text-left text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-2.5">Data/Ora</th>
                  <th className="px-4 py-2.5">Acțiune</th>
                  {user?.is_developer && <th className="px-4 py-2.5">User</th>}
                  <th className="px-4 py-2.5">Detalii</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.log_id} className="border-t border-gray-100 hover:bg-gray-50" data-testid={`log-${l.log_id}`}>
                    <td className="px-4 py-2.5 text-xs font-mono whitespace-nowrap">{new Date(l.created_at).toLocaleString('ro-RO')}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 ${actionColor(l.action)}`}>{actionLabel(l.action)}</span>
                    </td>
                    {user?.is_developer && (
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{l.user_id ? l.user_id.slice(-8) : '—'}</td>
                    )}
                    <td className="px-4 py-2.5 text-xs text-gray-600 max-w-md truncate" title={JSON.stringify(l.meta || {})}>
                      {l.meta ? Object.entries(l.meta).map(([k, v]) => `${k}=${String(v).slice(0, 40)}`).join(' · ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 text-[10px] text-gray-500 bg-gray-50 border-t border-gray-100" data-testid="logs-count">
              {logs.length} loguri afișate (limită {filters.limit})
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
