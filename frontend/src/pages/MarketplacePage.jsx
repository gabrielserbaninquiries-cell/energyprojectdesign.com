/**
 * Marketplace V7.0 — Vânzări ad-hoc produse/servicii tehnice.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { ShoppingBag, Plus, Search, MapPin, Eye, Heart, Tag, Loader2 } from 'lucide-react';

export default function MarketplacePage() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', q: '', max_price: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({
    title: '', description: '', category: 'materiale', price_eur: 0,
    location: '', contact_phone: '', contact_email: '',
    quantity: '', condition: 'Nou', industry: 'gaze',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.q) params.append('q', filters.q);
      if (filters.max_price) params.append('max_price', filters.max_price);
      const { data } = await api.get(`/marketplace/listings?${params.toString()}`);
      setListings(data.items || []);
    } catch (e) {
      toast.error('Eroare load anunțuri');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/marketplace/categories');
        if (!cancelled) setCategories(data.categories || []);
      } catch {
        /* keep empty */
      }
      try {
        const { data } = await api.get('/marketplace/listings');
        if (!cancelled) setListings(data.items || []);
      } catch {
        /* keep empty */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async () => {
    try {
      await api.post('/marketplace/listings', { ...draft, price_eur: Number(draft.price_eur) });
      toast.success('Anunț publicat');
      setShowCreate(false);
      load();
    } catch (e) {
      toast.error(`Eroare publicare: ${e?.response?.data?.detail || e.message}`);
    }
  };

  return (
    <AppShell title="Marketplace" subtitle="Vânzări ad-hoc · materiale · echipamente · servicii · ștampile · cursuri">
      <div className="mb-6 flex flex-wrap gap-3 items-center" data-testid="marketplace-toolbar">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Caută țeavă, robineți, servicii..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:border-amber-500 outline-none"
            data-testid="marketplace-search" />
        </div>
        <select value={filters.category} onChange={(e) => { setFilters({ ...filters, category: e.target.value }); }}
          className="border border-gray-300 px-3 py-2 text-sm" data-testid="marketplace-category-filter">
          <option value="">Toate categoriile</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input type="number" placeholder="Preț max (EUR)" value={filters.max_price}
          onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
          className="border border-gray-300 px-3 py-2 text-sm w-32" data-testid="marketplace-maxprice" />
        <button onClick={load} className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800" data-testid="marketplace-apply-filters">Aplică filtre</button>
        <button onClick={() => setShowCreate(true)} className="bg-amber-500 text-black px-4 py-2 text-sm font-semibold hover:bg-amber-400 inline-flex items-center gap-1" data-testid="marketplace-new-listing">
          <Plus className="w-4 h-4" /> Publică anunț
        </button>
      </div>

      {loading && <div className="text-center py-12 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((l) => (
          <div key={l.listing_id} className="border-2 border-gray-200 bg-white hover:border-amber-400 transition" data-testid={`listing-${l.listing_id}`}>
            {l.images?.[0] ? (
              <div className="h-40 bg-gray-100 overflow-hidden">
                <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-amber-700" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-amber-700 mb-1">
                <Tag className="w-3 h-3" /> {l.category}
                {l.condition && <span className="text-gray-400">· {l.condition}</span>}
              </div>
              <div className="font-bold text-sm leading-tight mb-1">{l.title}</div>
              <div className="text-xs text-gray-500 mb-3 line-clamp-2">{l.description}</div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">{l.price_eur} <span className="text-xs text-gray-500">{l.currency || 'EUR'}</span></div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="inline-flex items-center gap-0.5"><Eye className="w-3 h-3" />{l.views || 0}</span>
                  <span className="inline-flex items-center gap-0.5"><Heart className="w-3 h-3" />{l.favorites || 0}</span>
                </div>
              </div>
              {l.location && <div className="text-[10px] text-gray-500 mt-2 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</div>}
            </div>
          </div>
        ))}
        {!loading && listings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400" data-testid="marketplace-empty">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            Niciun anunț încă. Fii primul care publică!
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="marketplace-create-modal">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="font-bold">Publică anunț nou</div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['title', 'Titlu anunț', 'input'],
                ['description', 'Descriere', 'textarea'],
                ['category', 'Categorie', 'select', categories.map((c) => c.id)],
                ['price_eur', 'Preț (EUR)', 'number'],
                ['quantity', 'Cantitate', 'input'],
                ['condition', 'Stare', 'select', ['Nou', 'Folosit', 'Demontat', 'Stoc final']],
                ['location', 'Locație', 'input'],
                ['contact_phone', 'Telefon', 'input'],
                ['contact_email', 'Email', 'input'],
              ].map(([key, label, type, opts]) => (
                <div key={key}>
                  <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">{label}</label>
                  {type === 'textarea' ? (
                    <textarea value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-sm" rows={3} />
                  ) : type === 'select' ? (
                    <select value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-sm">
                      {(opts || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="w-full border border-gray-300 px-3 py-2 text-sm" />
                  )}
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50">Anulează</button>
              <button onClick={submit} className="px-4 py-2 text-sm bg-amber-500 text-black font-semibold hover:bg-amber-400" data-testid="marketplace-submit-listing">Publică</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
