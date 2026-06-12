/**
 * Services Hub V7.0 — Meseriași + Logistică + Smart Pricing inline.
 * Pagina centrală pentru servicii (meseriași, transport mutări, logistică, calc costuri).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Wrench, Truck, Calculator, Search, Star, MapPin, Phone, Briefcase,
  ShieldCheck, Loader2, ArrowRight,
} from 'lucide-react';

const JUDETE = ['București', 'Cluj', 'Timiș', 'Brașov', 'Constanța', 'Iași', 'Ilfov', 'Sibiu', 'Argeș', 'Prahova', 'Galați', 'Bihor', 'Suceava'];

export default function ServiciiPage() {
  const [tab, setTab] = useState('craftsmen');  // craftsmen | logistics | pricing
  const [crSpecs, setCrSpecs] = useState([]);
  const [crProfiles, setCrProfiles] = useState([]);
  const [logTypes, setLogTypes] = useState({ service_types: [], vehicle_types: [] });
  const [logOffers, setLogOffers] = useState([]);
  const [priceServices, setPriceServices] = useState([]);
  const [priceFilters, setPriceFilters] = useState({ service_id: 'exec_bransament_gaze', judet: 'București', urgency: 'this_week', quantity: 1, complexity: 'medium', provider_rating: 4.5 });
  const [priceResult, setPriceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crFilters, setCrFilters] = useState({ specialization: '', judet: '', q: '' });
  const [logFilters, setLogFilters] = useState({ service_type: '', origin_judet: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cr, lg, ps] = await Promise.all([
          api.get('/craftsmen/specializations'),
          api.get('/logistics/service-types'),
          api.get('/pricing/services'),
        ]);
        if (cancelled) return;
        setCrSpecs(cr.data.specializations || []);
        setLogTypes(lg.data || {});
        setPriceServices(ps.data.services || []);
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const loadCraftsmen = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(crFilters).forEach(([k, v]) => v && params.append(k, v));
      const { data } = await api.get(`/craftsmen/profiles?${params.toString()}`);
      setCrProfiles(data.items || []);
    } catch {
      /* ignore */
    } finally { setLoading(false); }
  };

  const loadLogistics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(logFilters).forEach(([k, v]) => v && params.append(k, v));
      const { data } = await api.get(`/logistics/offers?${params.toString()}`);
      setLogOffers(data.items || []);
    } catch {
      /* ignore */
    } finally { setLoading(false); }
  };

  const runPricing = async () => {
    try {
      const { data } = await api.post('/pricing/estimate', priceFilters);
      setPriceResult(data);
    } catch (e) { toast.error(`Eroare pricing: ${e?.response?.data?.detail || e.message}`); }
  };

  useEffect(() => {
    let cancelled = false;
    if (tab === 'craftsmen') {
      (async () => {
        try {
          const params = new URLSearchParams();
          Object.entries(crFilters).forEach(([k, v]) => v && params.append(k, v));
          const { data } = await api.get(`/craftsmen/profiles?${params.toString()}`);
          if (!cancelled) setCrProfiles(data.items || []);
        } catch {
          /* ignore */
        }
      })();
    } else if (tab === 'logistics') {
      (async () => {
        try {
          const params = new URLSearchParams();
          Object.entries(logFilters).forEach(([k, v]) => v && params.append(k, v));
          const { data } = await api.get(`/logistics/offers?${params.toString()}`);
          if (!cancelled) setLogOffers(data.items || []);
        } catch {
          /* ignore */
        }
      })();
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <AppShell title="Servicii" subtitle="Meseriași autorizați · Mutări + Logistică · Calculator inteligent costuri">
      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-gray-200 mb-6" data-testid="servicii-tabs">
        {[
          { id: 'craftsmen', label: 'Meseriași', icon: Wrench, color: 'border-rose-500 text-rose-700' },
          { id: 'logistics', label: 'Logistică + Transport', icon: Truck, color: 'border-blue-500 text-blue-700' },
          { id: 'pricing',   label: 'Calculator costuri', icon: Calculator, color: 'border-amber-500 text-amber-700' },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm inline-flex items-center gap-2 border-b-4 -mb-0.5 ${tab === t.id ? t.color : 'border-transparent text-gray-500 hover:text-black'}`}
              data-testid={`tab-${t.id}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* CRAFTSMEN */}
      {tab === 'craftsmen' && (
        <div data-testid="craftsmen-section">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[180px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={crFilters.q} onChange={(e) => setCrFilters({ ...crFilters, q: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && loadCraftsmen()}
                placeholder="Caută meseriași..." className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm" />
            </div>
            <select value={crFilters.specialization} onChange={(e) => { setCrFilters({ ...crFilters, specialization: e.target.value }); }} className="border border-gray-300 px-3 py-2 text-sm">
              <option value="">Toate specializările</option>
              {crSpecs.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={crFilters.judet} onChange={(e) => setCrFilters({ ...crFilters, judet: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
              <option value="">Toate județele</option>
              {JUDETE.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <button onClick={loadCraftsmen} className="bg-rose-600 text-white px-4 py-2 text-sm hover:bg-rose-700" data-testid="craftsmen-search-btn">Caută</button>
            <Link to="/profil-meserias" className="bg-rose-100 text-rose-700 px-4 py-2 text-sm font-semibold hover:bg-rose-200">Devino meseriaș listat</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <div className="col-span-full text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div> :
              crProfiles.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400" data-testid="craftsmen-empty">
                  <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  Niciun profil de meseriaș încă. Fii primul!
                </div>
              ) : crProfiles.map((p) => (
                <div key={p.profile_id} className="border-2 border-gray-200 bg-white p-4 hover:border-rose-400" data-testid={`craftsman-${p.profile_id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm">{p.full_name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-rose-700">{p.specialization}</div>
                    </div>
                    {p.verified && <span className="text-[10px] inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 px-2 py-0.5"><ShieldCheck className="w-3 h-3" /> Verificat</span>}
                  </div>
                  <div className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating_avg?.toFixed(1) || '—'}</span>
                    <span className="text-gray-500">{p.rating_count || 0} review</span>
                    {p.hourly_rate_ron && <span className="ml-auto font-bold">{p.hourly_rate_ron} RON/h</span>}
                  </div>
                  {p.judete_acoperite?.length > 0 && (
                    <div className="text-[10px] text-gray-500 mt-2 inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{p.judete_acoperite.slice(0, 3).join(', ')}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LOGISTICS */}
      {tab === 'logistics' && (
        <div data-testid="logistics-section">
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <select value={logFilters.service_type} onChange={(e) => setLogFilters({ ...logFilters, service_type: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
              <option value="">Toate serviciile</option>
              {logTypes.service_types?.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={logFilters.origin_judet} onChange={(e) => setLogFilters({ ...logFilters, origin_judet: e.target.value })} className="border border-gray-300 px-3 py-2 text-sm">
              <option value="">Origine - orice județ</option>
              {JUDETE.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            <button onClick={loadLogistics} className="bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700" data-testid="logistics-search-btn">Filtrează</button>
            <Link to="/logistics-new-offer" className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-200">Publică ofertă transport</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? <div className="col-span-full text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div> :
              logOffers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400" data-testid="logistics-empty">
                  <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  Nicio ofertă de transport încă.
                </div>
              ) : logOffers.map((o) => (
                <div key={o.offer_id} className="border-2 border-gray-200 bg-white p-4 hover:border-blue-400" data-testid={`offer-${o.offer_id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-blue-700">{o.service_type} · {o.vehicle_type}</div>
                      <div className="font-bold text-sm">{o.title}</div>
                    </div>
                    {o.price_eur && <div className="font-bold text-lg">{o.price_eur} EUR</div>}
                  </div>
                  <div className="text-xs text-gray-600 line-clamp-2 mb-2">{o.description}</div>
                  <div className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {o.accepts_any_route ? 'Orice rută' : `${o.origin_oras || o.origin_judet || '?'} → ${o.destination_oras || o.destination_judet || '?'}`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PRICING */}
      {tab === 'pricing' && (
        <div data-testid="pricing-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 border-2 border-amber-500 bg-amber-50 p-5">
            <h3 className="font-bold mb-4">Calculator inteligent</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Serviciu</label>
                <select value={priceFilters.service_id} onChange={(e) => setPriceFilters({ ...priceFilters, service_id: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm" data-testid="pricing-service-select">
                  {priceServices.map((s) => <option key={s.id} value={s.id}>{s.id.replace(/_/g, ' ')} ({s.currency})</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Județ</label>
                <select value={priceFilters.judet} onChange={(e) => setPriceFilters({ ...priceFilters, judet: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm">
                  {JUDETE.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Urgență</label>
                <select value={priceFilters.urgency} onChange={(e) => setPriceFilters({ ...priceFilters, urgency: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm">
                  <option value="flexible">Flexibil</option>
                  <option value="this_month">Această lună</option>
                  <option value="this_week">Această săptămână</option>
                  <option value="24h">În 24h</option>
                  <option value="today">Astăzi</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Cantitate (m, m², ore, kWp...)</label>
                <input type="number" value={priceFilters.quantity} onChange={(e) => setPriceFilters({ ...priceFilters, quantity: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Complexitate</label>
                <select value={priceFilters.complexity} onChange={(e) => setPriceFilters({ ...priceFilters, complexity: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm">
                  <option value="simple">Simplu</option>
                  <option value="medium">Mediu</option>
                  <option value="complex">Complex</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">Rating provider (1-5)</label>
                <input type="number" min="1" max="5" step="0.1" value={priceFilters.provider_rating} onChange={(e) => setPriceFilters({ ...priceFilters, provider_rating: Number(e.target.value) })} className="w-full border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <button onClick={runPricing} className="w-full bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800" data-testid="pricing-calc-btn">Calculează</button>
            </div>
          </div>
          <div className="lg:col-span-2">
            {priceResult ? (
              <div className="border-2 border-black bg-white p-5" data-testid="pricing-result">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Rezultat pentru</div>
                <div className="font-bold text-lg mb-4">{priceResult.service_id.replace(/_/g, ' ')}</div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="border-2 border-gray-300 p-3 text-center">
                    <div className="text-[10px] uppercase text-gray-500">Min</div>
                    <div className="text-2xl font-bold">{priceResult.min_native}</div>
                    <div className="text-[10px] text-gray-500">{priceResult.currency}</div>
                  </div>
                  <div className="border-2 border-amber-500 bg-amber-50 p-3 text-center">
                    <div className="text-[10px] uppercase text-amber-700">Recomandat</div>
                    <div className="text-2xl font-bold text-amber-700">{priceResult.recommended_native}</div>
                    <div className="text-[10px] text-amber-700">{priceResult.currency}</div>
                  </div>
                  <div className="border-2 border-gray-300 p-3 text-center">
                    <div className="text-[10px] uppercase text-gray-500">Max</div>
                    <div className="text-2xl font-bold">{priceResult.max_native}</div>
                    <div className="text-[10px] text-gray-500">{priceResult.currency}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-2">Factori aplicați (multiplier total: ×{priceResult.breakdown.total_multiplier}):</div>
                <div className="space-y-1 text-xs">
                  {priceResult.factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-700">{f.factor}: <span className="font-medium">{Array.isArray(f.value) ? f.value.join(', ') : f.value}</span></span>
                      <span className={`font-mono ${f.multiplier > 1 ? 'text-red-600' : f.multiplier < 1 ? 'text-emerald-600' : 'text-gray-500'}`}>×{f.multiplier}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 p-12 text-center text-gray-400" data-testid="pricing-placeholder">
                <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                Selectează un serviciu și apasă Calculează.<br />
                Engine-ul aplică 5 factori reali: județ, urgență, complexitate, rating, cerere/ofertă.
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
