import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LIST_FILES = [
  { id: 'todo', label: 'LIST 1 — TO-DO', file: 'LIST_1_TODO.md', accent: 'border-l-[#FFB300]' },
  { id: 'suggested', label: 'LIST 2 — Sugestii', file: 'LIST_2_SUGGESTED.md', accent: 'border-l-blue-500' },
  { id: 'futuristic', label: 'LIST 3 — Out-of-the-box', file: 'LIST_3_FUTURISTIC.md', accent: 'border-l-purple-500' },
  { id: 'big_update', label: 'LIST 4 — Big Update (web research)', file: 'LIST_4_BIG_UPDATE_WEB_RESEARCH.md', accent: 'border-l-green-500' },
];

export default function DeveloperProgres() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('todo');
  const [listContent, setListContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadProgress() {
    setRefreshing(true);
    try {
      const { data } = await api.get('/dev/progress');
      setProgress(data);
    } catch (e) {
      console.error('Progress load error', e);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadList(listId) {
    setLoading(true);
    const file = LIST_FILES.find((l) => l.id === listId);
    if (!file) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get(`/dev/list/${listId}`);
      setListContent(data.content || 'Lista goală.');
    } catch (e) {
      setListContent(`Eroare la încărcare listă: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.is_developer) {
      loadProgress();
      loadList(activeTab);
    }
    // eslint-disable-next-line
  }, [user, activeTab]);

  if (!user) {
    return <AppShell title="Progres build" subtitle="Autentificați-vă"><div className="text-sm text-gray-500">Necesară autentificare.</div></AppShell>;
  }

  if (!user.is_developer) {
    return (
      <AppShell title="Progres build" subtitle="Acces restricționat">
        <div className="bg-amber-50 border border-amber-200 p-6 max-w-xl">
          <AlertCircle className="w-6 h-6 text-amber-600 mb-3" />
          <h3 className="font-semibold mb-1">Acces doar pentru dezvoltatori</h3>
          <p className="text-sm text-gray-700">Această pagină conține progresul build-ului și este vizibilă doar pentru contul developer.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Progres build & liste planificare" subtitle="Tracker pași + cele 4 liste din memory">
      {/* Phases overview */}
      {progress?.phases && (
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg font-semibold">Faze build</h3>
            <button onClick={loadProgress} className="text-xs text-gray-600 hover:text-black flex items-center gap-1" data-testid="refresh-progress">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {progress.phases.map((ph) => {
              const stepsTotal = ph.steps?.length || 0;
              const stepsDone = ph.steps?.filter((s) => s.status === 'completed').length || 0;
              const percent = stepsTotal ? Math.round((stepsDone / stepsTotal) * 100) : 0;
              const statusIcon = ph.status === 'completed' ? CheckCircle2 : Clock;
              const StatusIcon = statusIcon;
              return (
                <div key={ph.id} className="bg-white border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs uppercase tracking-[0.15em] text-gray-500">{ph.id}</div>
                    <StatusIcon className={`w-4 h-4 ${ph.status === 'completed' ? 'text-green-600' : 'text-amber-500'}`} />
                  </div>
                  <div className="font-semibold text-sm leading-tight mb-3">{ph.name}</div>
                  <div className="h-1.5 bg-gray-200 mb-2">
                    <div className="h-full bg-black" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>{stepsDone}/{stepsTotal} pași</span>
                    <span className="font-mono">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Last completed command */}
      {progress?.last_emergent_account_command && (
        <section className="mb-8 bg-black text-white p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-2">// Ultima comandă cont vechi</div>
          <div className="font-mono text-xs text-gray-300 mb-2">commit {progress.last_emergent_account_command.commit_sha?.substring(0, 7)} · {progress.last_emergent_account_command.date}</div>
          <div className="text-sm leading-relaxed">{progress.last_emergent_account_command.message}</div>
        </section>
      )}

      {/* Lists */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Cele 4 liste de planificare</h3>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {LIST_FILES.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveTab(l.id)}
              className={`text-xs px-4 py-2 whitespace-nowrap border ${activeTab === l.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-black'}`}
              data-testid={`tab-${l.id}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className={`bg-white border border-gray-200 border-l-4 ${LIST_FILES.find((l) => l.id === activeTab)?.accent} p-6 max-h-[640px] overflow-y-auto`}>
          {loading ? (
            <div className="text-sm text-gray-500">Se încarcă…</div>
          ) : (
            <pre className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">{listContent}</pre>
          )}
        </div>
      </section>
    </AppShell>
  );
}
