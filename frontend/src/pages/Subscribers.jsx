import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Building, Users2, Plug, Hammer, Briefcase, Plus, Trash2, Mail, Phone, MapPin } from 'lucide-react';

const ICONS = { Building, Users2, Plug, Hammer, Briefcase };

export default function Subscribers() {
  const [types, setTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'primarie', name: '', cui: '', email: '', phone: '', judet: '', localitate: '', reprezentant_legal: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [{ data: t }, { data: list }] = await Promise.all([
          api.get('/subscribers/types'),
          api.get('/subscribers', { params: filter ? { type: filter } : {} }),
        ]);
        setTypes(t.types || []); setItems(list || []);
      } catch (_) { toast.error('Eroare încărcare'); }
      finally { setLoading(false); }
    })();
  }, [filter]);

  const refresh = async () => {
    try {
      const { data: list } = await api.get('/subscribers', { params: filter ? { type: filter } : {} });
      setItems(list || []);
    } catch (_) { /* silent */ }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Nume obligatoriu'); return; }
    try {
      await api.post('/subscribers', form);
      toast.success('Subscriber adăugat');
      setShowCreate(false);
      setForm({ type: 'primarie', name: '', cui: '', email: '', phone: '', judet: '', localitate: '', reprezentant_legal: '' });
      refresh();
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare'); }
  };

  const remove = async (sid) => {
    if (!window.confirm('Ștergi acest subscriber?')) return;
    try { await api.delete(`/subscribers/${sid}`); toast.success('Șters'); refresh(); }
    catch { toast.error('Eroare ștergere'); }
  };

  return (
    <AppShell title="Subscriberi B2B" subtitle="Primării, asociații, utilități publice, dezvoltatori, societăți comerciale">
      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="subscriber-filters">
        <button onClick={() => setFilter('')} className={`text-xs px-3 py-1.5 ${!filter ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`} data-testid="filter-all">
          Toate ({items.length})
        </button>
        {types.map((t) => {
          const Icon = ICONS[t.icon] || Briefcase;
          const count = items.filter((i) => i.type === t.id).length;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} className={`text-xs px-3 py-1.5 flex items-center gap-1.5 ${filter === t.id ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`} data-testid={`filter-${t.id}`}>
              <Icon className="w-3 h-3" /> {t.name.split(' / ')[0]} ({count})
            </button>
          );
        })}
        <button onClick={() => setShowCreate(true)} className="amber-btn ml-auto text-xs" data-testid="subscriber-create-btn">
          <Plus className="w-3 h-3" /> Adaugă subscriber
        </button>
      </div>

      {/* Type cards (intro when empty) */}
      {!loading && items.length === 0 && (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200 mb-8" data-testid="subscriber-types-cards">
          {types.map((t) => {
            const Icon = ICONS[t.icon] || Briefcase;
            return (
              <div key={t.id} className="bg-white p-5">
                <Icon className="w-7 h-7 mb-3 text-gray-700" />
                <div className="font-semibold text-sm mb-1">{t.name}</div>
                <div className="text-xs text-gray-600 leading-relaxed line-clamp-3">{t.description}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-500">Se încarcă…</div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-12 text-center">
          <Building className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <div className="text-sm text-gray-600 mb-4">Niciun subscriber încă.</div>
          <button onClick={() => setShowCreate(true)} className="amber-btn text-xs" data-testid="subscriber-create-empty">
            <Plus className="w-3 h-3" /> Adaugă primul subscriber
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          {items.map((s) => {
            const t = types.find((x) => x.id === s.type);
            const Icon = ICONS[t?.icon] || Briefcase;
            return (
              <div key={s.sid} className="bg-white p-5" data-testid={`subscriber-card-${s.sid}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 text-gray-700 flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm line-clamp-1">{s.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">{t?.name || s.type}</div>
                  </div>
                  <button onClick={() => remove(s.sid)} className="text-gray-400 hover:text-red-600" data-testid={`subscriber-delete-${s.sid}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 text-xs text-gray-700">
                  {s.cui && <div><span className="text-gray-500">CUI:</span> <span className="mono">{s.cui}</span></div>}
                  {s.reprezentant_legal && <div className="line-clamp-1">{s.reprezentant_legal}</div>}
                  {s.email && <div className="flex items-center gap-1 line-clamp-1"><Mail className="w-3 h-3" /> {s.email}</div>}
                  {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</div>}
                  {(s.judet || s.localitate) && <div className="flex items-center gap-1 line-clamp-1"><MapPin className="w-3 h-3" /> {[s.localitate, s.judet].filter(Boolean).join(', ')}</div>}
                </div>
                {s.status && <div className="mt-3 text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-1 inline-block">{s.status}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="subscriber-modal">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">Adaugă subscriber B2B</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Tip *</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" data-testid="subscriber-form-type">
                  {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Nume / Denumire *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" placeholder="ex: Primăria Sector 2" data-testid="subscriber-form-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">CUI</label>
                  <input value={form.cui} onChange={(e) => setForm((f) => ({ ...f, cui: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" data-testid="subscriber-form-cui" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Reprezentant legal</label>
                  <input value={form.reprezentant_legal} onChange={(e) => setForm((f) => ({ ...f, reprezentant_legal: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Telefon</label>
                  <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Județ</label>
                  <input value={form.judet} onChange={(e) => setForm((f) => ({ ...f, judet: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Localitate</label>
                  <input value={form.localitate} onChange={(e) => setForm((f) => ({ ...f, localitate: e.target.value }))} className="w-full border border-gray-300 px-3 py-2" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="ghost-btn text-xs flex-1 justify-center">Anulează</button>
              <button onClick={handleCreate} className="amber-btn text-xs flex-1 justify-center" data-testid="subscriber-form-submit">
                <Plus className="w-3 h-3" /> Adaugă
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
