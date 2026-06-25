/**
 * Real Estate V7.0 — Anunțuri imobiliare.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Home, Plus, Search, MapPin, BedDouble, Bath, Maximize2, Calculator, Loader2 } from 'lucide-react';

const JUDETE = ['București', 'Cluj', 'Timiș', 'Brașov', 'Constanța', 'Iași', 'Ilfov', 'Sibiu', 'Argeș', 'Prahova', 'Galați', 'Bihor'];

export default function RealEstatePage() {
  const { t } = useTranslation();
  const [types, setTypes] = useState({ property_types: [], transaction_types: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [filters, setFilters] = useState({ property_type: '', transaction_type: '', judet: '', min_price: '', max_price: '', rooms: '' });
  const [draft, setDraft] = useState({
    title: '', description: '', property_type: 'apartament', transaction_type: 'vanzare',
    price_eur: 0, judet: 'București', oras: '', surface_m2: 0, rooms: 2,
    bathrooms: 1, floor: '', year_built: 2020, has_gas: false, has_central_heating: false,
    contact_phone: '', contact_email: '', contact_name: '',
  });
  const [calc, setCalc] = useState({ price_eur: 100000, down_payment_eur: 20000, term_years: 30, annual_rate_pct: 7.5 });
  const [calcResult, setCalcResult] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const { data } = await api.get(`/real-estate/properties?${params.toString()}`);
      setItems(data.items || []);
    } catch (e) {
      toast.error('Eroare load proprietăți');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/real-estate/property-types');
        if (!cancelled) setTypes(data || {});
      } catch {
        /* keep empty */
      }
      try {
        const { data } = await api.get('/real-estate/properties');
        if (!cancelled) setItems(data.items || []);
      } catch {
        /* keep empty */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submit = async () => {
    try {
      await api.post('/real-estate/properties', { ...draft, price_eur: Number(draft.price_eur), surface_m2: Number(draft.surface_m2), rooms: Number(draft.rooms) });
      toast.success('Proprietate publicată');
      setShowCreate(false);
      load();
    } catch (e) { toast.error(`Eroare: ${e?.response?.data?.detail || e.message}`); }
  };

  const runCalc = async () => {
    try {
      const { data } = await api.post('/real-estate/mortgage-calculator', calc);
      setCalcResult(data);
    } catch (e) { toast.error(`Eroare calculator: ${e?.response?.data?.detail || e.message}`); }
  };

  return (
    <AppShell title={t('realestate.title')} subtitle={t('realestate.subtitle')}>
      <div className="mb-6 flex flex-wrap gap-2 items-center" data-testid="re-toolbar">
        <div className="flex-1 min-w-[180px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={filters.oras || ''} onChange={(e) => setFilters({ ...filters, oras: e.target.value })}
            placeholder="Oraș / cartier..." className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm" data-testid="re-search" />
        </div>
        <select value={filters.property_type} onChange={(e) => setFilters({ ...filters, property_type: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">Toate tipurile</option>
          {types.property_types?.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={filters.transaction_type} onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">Vânzare + Închiriere</option>
          {types.transaction_types?.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={filters.judet} onChange={(e) => setFilters({ ...filters, judet: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
          <option value="">Toate județele</option>
          {JUDETE.map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <input type="number" placeholder="Preț max" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm w-28" />
        <button onClick={load} className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800" data-testid="re-apply-filters">Filtrează</button>
        <button onClick={() => setShowCalc(!showCalc)} className="border border-emerald-500 text-emerald-700 px-3 py-2 text-sm hover:bg-emerald-50 inline-flex items-center gap-1" data-testid="re-calc-toggle">
          <Calculator className="w-4 h-4" /> Calculator credit
        </button>
        <button onClick={() => setShowCreate(true)} className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700 inline-flex items-center gap-1" data-testid="re-new">
          <Plus className="w-4 h-4" /> Publică
        </button>
      </div>

      {showCalc && (
        <div className="mb-6 border-2 border-emerald-400 bg-emerald-50 p-4" data-testid="re-calc-panel">
          <div className="font-bold mb-3">Calculator credit ipotecar</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-600">Preț proprietate (EUR)</label>
              <input type="number" value={calc.price_eur} onChange={(e) => setCalc({ ...calc, price_eur: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-600">Avans (EUR)</label>
              <input type="number" value={calc.down_payment_eur} onChange={(e) => setCalc({ ...calc, down_payment_eur: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-600">Termen (ani)</label>
              <input type="number" value={calc.term_years} onChange={(e) => setCalc({ ...calc, term_years: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-600">Dobândă anuală (%)</label>
              <input type="number" step="0.1" value={calc.annual_rate_pct} onChange={(e) => setCalc({ ...calc, annual_rate_pct: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button onClick={runCalc} className="bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700" data-testid="re-calc-run">Calculează</button>
            {calcResult && (
              <div className="text-sm" data-testid="re-calc-result">
                <span className="font-bold text-emerald-700">Rată lunară: {calcResult.monthly_payment_eur} EUR</span>
                <span className="text-gray-500 ml-3">Total dobândă: {calcResult.total_interest_eur} EUR</span>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <div className="text-center py-12 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.property_id} className="border-2 border-gray-200 bg-white hover:border-emerald-400 transition" data-testid={`property-${p.property_id}`}>
            {p.images?.[0] ? (
              <div className="h-44 bg-gray-100 overflow-hidden">
                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                <Home className="w-12 h-12 text-emerald-700" />
              </div>
            )}
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-1">{p.transaction_type} · {p.property_type}</div>
              <div className="font-bold text-sm leading-tight mb-2">{p.title}</div>
              <div className="text-xl font-bold mb-2">
                {p.price_eur.toLocaleString()} EUR
                <span className="text-xs text-gray-500 ml-2 font-normal">{p.price_per_m2_eur} EUR/m²</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-600">
                <span className="inline-flex items-center gap-0.5"><Maximize2 className="w-3 h-3" />{p.surface_m2}m²</span>
                {p.rooms && <span className="inline-flex items-center gap-0.5"><BedDouble className="w-3 h-3" />{p.rooms} cam.</span>}
                {p.bathrooms && <span className="inline-flex items-center gap-0.5"><Bath className="w-3 h-3" />{p.bathrooms} băi</span>}
              </div>
              <div className="text-[10px] text-gray-500 mt-2 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{p.oras}, {p.judet}</div>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400" data-testid="re-empty">
            <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
            Nicio proprietate găsită. Fii primul care publică!
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="re-create-modal">
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="font-bold">Publică proprietate</div>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ['title', 'Titlu anunț', 'input'],
                ['property_type', 'Tip proprietate', 'select', types.property_types?.map(p => p.id) || []],
                ['transaction_type', 'Tip tranzacție', 'select', types.transaction_types?.map(t => t.id) || []],
                ['price_eur', 'Preț (EUR)', 'number'],
                ['surface_m2', 'Suprafață (m²)', 'number'],
                ['rooms', 'Camere', 'number'],
                ['bathrooms', 'Băi', 'number'],
                ['floor', 'Etaj', 'input'],
                ['year_built', 'An construcție', 'number'],
                ['judet', 'Județ', 'select', JUDETE],
                ['oras', 'Oraș', 'input'],
                ['contact_name', 'Nume contact', 'input'],
                ['contact_phone', 'Telefon', 'input'],
                ['contact_email', 'Email', 'input'],
              ].map(([key, label, type, opts]) => (
                <div key={key} className={['description', 'title'].includes(key) ? 'md:col-span-2' : ''}>
                  <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">{label}</label>
                  {type === 'select' ? (
                    <select value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm">
                      {(opts || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Descriere</label>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={4} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50">Anulează</button>
              <button onClick={submit} className="px-4 py-2 text-sm bg-emerald-600 text-white font-semibold hover:bg-emerald-700" data-testid="re-submit">Publică</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
