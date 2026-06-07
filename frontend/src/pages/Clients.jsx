import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Users, Plus, Search, Phone, Mail, Edit3, Trash2, X, Save, User as UserIcon, Building2 } from 'lucide-react';

const EMPTY = { name: '', type: 'physical', cnp_or_cui: '', email: '', phone: '', address: '', city: '', county: '', notes: '', industry: 'gas_engineering', status: 'active' };

const INDUSTRY_OPTS = [
  { id: '', label: 'Toate industriile' },
  { id: 'gas_engineering', label: 'Gaze' },
  { id: 'electrical_engineering', label: 'Electrică' },
  { id: 'water_sewage', label: 'Apă & canalizare' },
  { id: 'civil_engineering', label: 'Construcții civile' },
  { id: 'telecom', label: 'Telecom' },
  { id: 'photovoltaic', label: 'Fotovoltaice' },
  { id: 'construction', label: 'Construcții imobile' },
  { id: 'railway_infra', label: 'Feroviar' },
  { id: 'sanitation', label: 'Salubritate' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'environment', label: 'Mediu' },
  { id: 'roads_bridges', label: 'Drumuri & poduri' },
  { id: 'public_lighting', label: 'Iluminat public' },
];

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-700 border-gray-300',
  archived: 'bg-amber-100 text-amber-800 border-amber-300',
};

export default function Clients() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (industryFilter) params.industry = industryFilter;
        const { data } = await api.get('/clients', { params });
        setItems(data);
      } catch (e) { toast.error('Eroare încărcare clienți.'); }
      finally { setLoading(false); }
    })();
  }, [statusFilter, industryFilter, reloadKey]);

  const filtered = query.trim()
    ? items.filter(c => (c.name || '').toLowerCase().includes(query.toLowerCase()) || (c.email || '').toLowerCase().includes(query.toLowerCase()) || (c.phone || '').includes(query))
    : items;

  function startNew() { setEditingId(null); setForm({ ...EMPTY }); setShowForm(true); }
  function startEdit(c) { setEditingId(c.client_id); setForm({ ...EMPTY, ...c }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function cancel() { setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); }
  function reload() { setReloadKey(k => k + 1); }

  async function save() {
    if (!form.name.trim()) { toast.error('Numele este obligatoriu.'); return; }
    try {
      if (editingId) {
        await api.patch(`/clients/${editingId}`, form);
        toast.success('Client actualizat.');
      } else {
        await api.post('/clients', form);
        toast.success('Client adăugat.');
      }
      cancel();
      reload();
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare.'); }
  }

  async function remove(id) {
    if (!window.confirm('Ștergi acest client?')) return;
    try { await api.delete(`/clients/${id}`); toast.success('Client șters.'); reload(); }
    catch (e) { toast.error('Eroare.'); }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-6xl" data-testid="clients-page">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Users className="w-8 h-8" /> Clienți</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">CRM intern pentru beneficiarii proiectelor tale. Salvezi datele de contact, alegi industria de interes, ții evidența serviciilor prestate.</p>
          </div>
          {!showForm && (
            <button onClick={startNew} className="bg-black text-[#FFB300] px-5 py-2.5 flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border-2 border-black font-semibold text-sm" data-testid="new-client-btn">
              <Plus className="w-4 h-4" /> Client nou
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white border-2 border-black p-6 my-6" data-testid="client-form">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editingId ? 'Editează client' : 'Client nou'}</h2>
              <button onClick={cancel}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-[10px] uppercase text-gray-500">Nume / Denumire</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-name" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Tip</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-type">
                  <option value="physical">Persoană fizică</option>
                  <option value="legal">Persoană juridică</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">{form.type === 'physical' ? 'CNP' : 'CUI'}</label>
                <input type="text" value={form.cnp_or_cui || ''} onChange={(e) => setForm({ ...form, cnp_or_cui: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black font-mono" data-testid="client-cnp" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Industrie principală</label>
                <select value={form.industry || 'gas_engineering'} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-industry">
                  {INDUSTRY_OPTS.filter(o => o.id).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Email</label>
                <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-email" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Telefon</label>
                <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-phone" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Adresă</label>
                <input type="text" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-address" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Localitate</label>
                <input type="text" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-city" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Județ</label>
                <input type="text" value={form.county || ''} onChange={(e) => setForm({ ...form, county: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-county" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="client-status">
                  <option value="active">Activ</option>
                  <option value="inactive">Inactiv</option>
                  <option value="archived">Arhivat</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Note (opțional)</label>
                <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-black text-xs" data-testid="client-notes" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={save} className="bg-black text-[#FFB300] px-5 py-2 text-sm flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border border-black font-semibold" data-testid="client-save-btn">
                <Save className="w-4 h-4" /> {editingId ? 'Salvează modificările' : 'Adaugă client'}
              </button>
              <button onClick={cancel} className="border border-black px-5 py-2 text-sm hover:bg-gray-100">Renunță</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border-2 border-black p-4 my-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] uppercase text-gray-500 flex items-center gap-1.5"><Search className="w-3 h-3" /> Caută</label>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nume, email, telefon..." className="w-full mt-1 px-3 py-1.5 border border-black text-sm" data-testid="search-clients" />
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 px-3 py-1.5 border border-black text-sm" data-testid="filter-client-status">
              <option value="all">Toți</option>
              <option value="active">Activ</option>
              <option value="inactive">Inactiv</option>
              <option value="archived">Arhivat</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500">Industrie</label>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="mt-1 px-3 py-1.5 border border-black text-sm" data-testid="filter-client-industry">
              {INDUSTRY_OPTS.map(o => <option key={o.id || 'all'} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 py-12 text-center">Se încarcă…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-12 text-center" data-testid="clients-empty">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-500">{items.length === 0 ? 'Niciun client încă. Apasă „Client nou".' : 'Niciun client se potrivește filtrelor.'}</div>
          </div>
        ) : (
          <div className="space-y-2" data-testid="clients-list">
            {filtered.map((c) => (
              <div key={c.client_id} className="bg-white border-2 border-gray-200 hover:border-black transition-colors p-4 flex items-start justify-between gap-4" data-testid={`client-${c.client_id}`}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 flex items-center justify-center ${c.type === 'legal' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    {c.type === 'legal' ? <Building2 className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold">{c.name}</div>
                      <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 ${STATUS_BADGE[c.status] || STATUS_BADGE.active}`}>{c.status}</span>
                      {c.cnp_or_cui && <span className="text-[10px] text-gray-500 font-mono">{c.cnp_or_cui}</span>}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-600 flex-wrap">
                      {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      {c.city && <span>{c.city}{c.county ? `, ${c.county}` : ''}</span>}
                    </div>
                    {c.notes && <div className="text-xs text-gray-500 mt-1 italic line-clamp-2">{c.notes}</div>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(c)} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300] flex items-center gap-1" data-testid={`edit-${c.client_id}`}><Edit3 className="w-3 h-3" /></button>
                  <button onClick={() => remove(c.client_id)} className="text-xs border border-red-300 text-red-700 px-2.5 py-1.5 hover:bg-red-700 hover:text-white" data-testid={`delete-${c.client_id}`}><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
