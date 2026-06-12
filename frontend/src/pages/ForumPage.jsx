/**
 * Forum + Group Announcements V7.0.
 */
import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { MessageSquare, Plus, Search, ThumbsUp, Eye, Pin, Megaphone, Loader2 } from 'lucide-react';

export default function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', only_announcements: false, q: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', category: 'general', is_announcement: false, tags: [] });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.only_announcements) params.append('only_announcements', 'true');
      if (filters.q) params.append('q', filters.q);
      const { data } = await api.get(`/forum/topics?${params.toString()}`);
      setTopics(data.items || []);
    } catch (e) { toast.error('Eroare load forum'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/forum/categories');
        if (!cancelled) setCategories(data.categories || []);
      } catch {
        /* keep empty */
      }
      try {
        const { data } = await api.get('/forum/topics');
        if (!cancelled) setTopics(data.items || []);
      } catch {
        /* keep empty */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async () => {
    try {
      await api.post('/forum/topics', draft);
      toast.success('Topic publicat');
      setShowCreate(false);
      load();
    } catch (e) { toast.error(`Eroare: ${e?.response?.data?.detail || e.message}`); }
  };

  return (
    <AppShell title="Forum + Grup Anunțuri" subtitle="Discuții tehnice · legislație · colaborări · cursuri">
      <div className="mb-6 grid grid-cols-2 md:grid-cols-7 gap-2" data-testid="forum-categories">
        <button onClick={() => { setFilters({ ...filters, category: '' }); setTimeout(load, 100); }}
          className={`text-[11px] py-2 px-3 ${!filters.category ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          data-testid="forum-cat-all">Toate</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => { setFilters({ ...filters, category: c.id }); setTimeout(load, 100); }}
            className={`text-[11px] py-2 px-3 ${filters.category === c.id ? 'bg-violet-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            data-testid={`forum-cat-${c.id}`}>{c.label}</button>
        ))}
      </div>

      <div className="mb-4 flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Caută în forum..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm" data-testid="forum-search" />
        </div>
        <label className="text-xs inline-flex items-center gap-1">
          <input type="checkbox" checked={filters.only_announcements} onChange={(e) => { setFilters({ ...filters, only_announcements: e.target.checked }); setTimeout(load, 100); }} />
          Doar anunțuri grup
        </label>
        <button onClick={() => setShowCreate(true)} className="bg-violet-600 text-white px-4 py-2 text-sm font-semibold hover:bg-violet-700 inline-flex items-center gap-1" data-testid="forum-new">
          <Plus className="w-4 h-4" /> Topic nou
        </button>
      </div>

      {loading && <div className="text-center py-12 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}

      <div className="space-y-2">
        {topics.map((t) => (
          <div key={t.topic_id} className="border-2 border-gray-200 bg-white p-4 hover:border-violet-400 transition" data-testid={`topic-${t.topic_id}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {t.is_pinned && <Pin className="w-3 h-3 text-violet-600" />}
                  {t.is_announcement && <span className="text-[10px] uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 inline-flex items-center gap-1"><Megaphone className="w-3 h-3" /> Anunț</span>}
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">{t.category}</span>
                </div>
                <div className="font-bold text-sm mb-1">{t.title}</div>
                <div className="text-xs text-gray-600 line-clamp-2">{t.body}</div>
                <div className="text-[10px] text-gray-500 mt-2">
                  de {t.owner_email} · {new Date(t.created_at).toLocaleDateString('ro-RO')}
                </div>
              </div>
              <div className="text-right text-[10px] text-gray-500 space-y-1">
                <div className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{t.replies_count || 0} răspunsuri</div>
                <div className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{t.views || 0}</div>
                <div className="inline-flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{t.likes || 0}</div>
              </div>
            </div>
          </div>
        ))}
        {!loading && topics.length === 0 && (
          <div className="text-center py-12 text-gray-400" data-testid="forum-empty">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            Niciun topic încă. Pornește o discuție!
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="forum-create-modal">
          <div className="bg-white max-w-2xl w-full">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="font-bold">Topic nou</div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Titlu</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" data-testid="forum-input-title" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Categorie</label>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm">
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Conținut</label>
                <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={6} className="w-full border border-gray-300 px-3 py-2 text-sm" data-testid="forum-input-body" />
              </div>
              <label className="text-xs inline-flex items-center gap-2">
                <input type="checkbox" checked={draft.is_announcement} onChange={(e) => setDraft({ ...draft, is_announcement: e.target.checked })} />
                Marchează ca anunț (vizibil în secțiunea &laquo;Grup Anunțuri&raquo;)
              </label>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50">Anulează</button>
              <button onClick={submit} className="px-4 py-2 text-sm bg-violet-600 text-white font-semibold hover:bg-violet-700" data-testid="forum-submit">Publică</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
