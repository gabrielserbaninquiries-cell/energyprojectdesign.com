import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Building2, Plus, Search, Filter, MapPin, Mail, Phone, Globe, X, Save, CheckCircle2, Trash2, Edit3 } from 'lucide-react';

const INDUSTRIES = [
  { id: '', label: 'Toate' },
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
  { id: 'roads_bridges', label: 'Drumuri' },
  { id: 'public_lighting', label: 'Iluminat public' },
];

const EMPTY = { name: '', cui: '', reg_com: '', industry: '', roles: [], address: '', city: '', county: '', email: '', phone: '', website: '', description: '', accepts_partnerships: true };

export default function Companies() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState({});
  const [query, setQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: r }, { data: s }] = await Promise.all([
          api.get('/companies/roles'),
          api.get('/companies/stats'),
        ]);
        setRoles(r);
        setStats(s);
      } catch (e) { console.error(e); }
    })();
  }, [reloadKey]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = {};
        if (industryFilter) params.industry = industryFilter;
        if (roleFilter) params.role = roleFilter;
        if (query.trim()) params.query = query.trim();
        const { data } = await api.get('/companies', { params });
        setItems(data);
      } catch (e) { toast.error('Eroare încărcare companii.'); }
      finally { setLoading(false); }
    })();
  }, [industryFilter, roleFilter, query, reloadKey]);

  function startNew() { setEditingId(null); setForm({ ...EMPTY }); setShowForm(true); }
  function startEdit(c) { setEditingId(c.company_id); setForm({ ...EMPTY, ...c }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function cancel() { setShowForm(false); setEditingId(null); setForm({ ...EMPTY }); }
  function reload() { setReloadKey(k => k + 1); }

  function toggleRole(rid) {
    setForm(f => ({ ...f, roles: f.roles.includes(rid) ? f.roles.filter(r => r !== rid) : [...f.roles, rid] }));
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Denumire obligatorie.'); return; }
    try {
      if (editingId) {
        await api.patch(`/companies/${editingId}`, form);
        toast.success('Companie actualizată.');
      } else {
        const { data } = await api.post('/companies', form);
        toast.success(data.verified ? 'Companie creată și verificată automat.' : 'Companie creată — pending verificare admin.');
      }
      cancel();
      reload();
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare.'); }
  }

  async function remove(cid) {
    if (!window.confirm('Ștergi această companie?')) return;
    try { await api.delete(`/companies/${cid}`); toast.success('Ștearsă.'); reload(); }
    catch (e) { toast.error(e?.response?.data?.detail || 'Eroare.'); }
  }

  return (
    <AppShell>
      <div className="p-8 max-w-6xl" data-testid="companies-page">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="w-8 h-8" /> Companii & parteneri</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">Directorul firmelor înregistrate pe platformă: proiectanți, executanți, verificatori, arhitecți, juriști, contabili, dezvoltatori, operatori. Filtrează după rol și industrie.</p>
          </div>
          {!showForm && (
            <button onClick={startNew} className="bg-black text-[#FFB300] px-5 py-2.5 flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border-2 border-black font-semibold text-sm" data-testid="new-company-btn">
              <Plus className="w-4 h-4" /> Înregistrează firmă
            </button>
          )}
        </div>

        {/* Top role badges */}
        {Object.keys(stats).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-4" data-testid="role-stats">
            {roles.map(r => stats[r.id] ? (
              <button key={r.id} onClick={() => setRoleFilter(roleFilter === r.id ? '' : r.id)} className={`text-[11px] px-3 py-1.5 border ${roleFilter === r.id ? 'bg-black text-[#FFB300] border-black' : 'bg-white border-gray-300 hover:border-black'}`} data-testid={`role-badge-${r.id}`}>
                {r.label} <span className="ml-1 opacity-60">({stats[r.id]})</span>
              </button>
            ) : null)}
          </div>
        )}

        {showForm && (
          <div className="bg-white border-2 border-black p-6 mb-6" data-testid="company-form">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editingId ? 'Editează firmă' : 'Înregistrare firmă'}</h2>
              <button onClick={cancel}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Denumire firmă</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-name" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">CUI</label>
                <input type="text" value={form.cui} onChange={(e) => setForm({ ...form, cui: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black font-mono" data-testid="company-cui" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Registrul Comerțului</label>
                <input type="text" value={form.reg_com} onChange={(e) => setForm({ ...form, reg_com: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black font-mono" data-testid="company-regcom" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Industrie principală</label>
                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-industry">
                  <option value="">— Selectează —</option>
                  {INDUSTRIES.filter(i => i.id).map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Roluri (selectează toate aplicabile)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2" data-testid="company-roles">
                  {roles.map(r => (
                    <label key={r.id} className={`flex items-center gap-2 px-3 py-1.5 border text-xs cursor-pointer ${form.roles.includes(r.id) ? 'bg-black text-[#FFB300] border-black' : 'border-gray-300 hover:border-black'}`}>
                      <input type="checkbox" checked={form.roles.includes(r.id)} onChange={() => toggleRole(r.id)} className="accent-[#FFB300]" data-testid={`role-${r.id}`} />
                      {r.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Adresă</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-address" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Localitate</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-city" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Județ</label>
                <input type="text" value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-county" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Email contact</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-email" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500">Telefon</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-phone" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" className="w-full mt-1 px-3 py-2 border border-black" data-testid="company-website" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase text-gray-500">Descriere scurtă (max 500 caractere)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })} rows={3} className="w-full mt-1 px-3 py-2 border border-black text-xs" data-testid="company-description" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.accepts_partnerships} onChange={(e) => setForm({ ...form, accepts_partnerships: e.target.checked })} className="accent-[#FFB300]" data-testid="company-partnerships" />
                  Acceptă propuneri de parteneriat
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="bg-black text-[#FFB300] px-5 py-2 text-sm flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border border-black font-semibold" data-testid="company-save-btn">
                <Save className="w-4 h-4" /> {editingId ? 'Salvează modificările' : 'Trimite spre verificare'}
              </button>
              <button onClick={cancel} className="border border-black px-5 py-2 text-sm hover:bg-gray-100">Renunță</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border-2 border-black p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] uppercase text-gray-500 flex items-center gap-1.5"><Search className="w-3 h-3" /> Caută</label>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nume, oraș, descriere..." className="w-full mt-1 px-3 py-1.5 border border-black text-sm" data-testid="search-companies" />
          </div>
          <div>
            <label className="text-[10px] uppercase text-gray-500 flex items-center gap-1.5"><Filter className="w-3 h-3" /> Industrie</label>
            <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="mt-1 px-3 py-1.5 border border-black text-sm" data-testid="filter-industry">
              {INDUSTRIES.map(i => <option key={i.id || 'all'} value={i.id}>{i.label}</option>)}
            </select>
          </div>
          {(query || industryFilter || roleFilter) && (
            <button onClick={() => { setQuery(''); setIndustryFilter(''); setRoleFilter(''); }} className="text-xs underline">Resetează</button>
          )}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 py-12 text-center">Se încarcă…</div>
        ) : items.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-12 text-center" data-testid="companies-empty">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-500 mb-3">Nicio firmă găsită pentru aceste filtre.</div>
            <button onClick={startNew} className="bg-black text-[#FFB300] px-4 py-2 text-xs border border-black hover:bg-[#FFB300] hover:text-black flex items-center gap-1.5 mx-auto">
              <Plus className="w-3.5 h-3.5" /> Înregistrează prima firmă
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="companies-list">
            {items.map((c) => {
              const canEdit = user?.is_developer || c.submitted_by === user?.user_id;
              return (
                <div key={c.company_id} className="bg-white border-2 border-gray-200 hover:border-black transition-colors p-4" data-testid={`company-${c.company_id}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold">{c.name}</div>
                      {c.verified && <span className="text-green-700"><CheckCircle2 className="w-4 h-4" /></span>}
                      {c.status === 'pending' && <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 uppercase tracking-wider">Pending</span>}
                    </div>
                    {canEdit && (
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(c)} className="text-xs p-1 hover:bg-gray-100" data-testid={`edit-co-${c.company_id}`}><Edit3 className="w-3 h-3" /></button>
                        <button onClick={() => remove(c.company_id)} className="text-xs p-1 hover:bg-red-700 hover:text-white text-red-700" data-testid={`del-co-${c.company_id}`}><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                  {c.roles?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {c.roles.map(rid => {
                        const r = roles.find(x => x.id === rid);
                        return r ? <span key={rid} className="text-[9px] bg-gray-100 px-2 py-0.5 uppercase tracking-wider">{r.label}</span> : null;
                      })}
                    </div>
                  )}
                  {c.description && <div className="text-xs text-gray-600 mb-2 line-clamp-2">{c.description}</div>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {c.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}{c.county ? `, ${c.county}` : ''}</span>}
                    {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-black"><Mail className="w-3 h-3" /> {c.email}</a>}
                    {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-black"><Phone className="w-3 h-3" /> {c.phone}</a>}
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-black"><Globe className="w-3 h-3" /> Site</a>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
