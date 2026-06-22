import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Check, Flame, ArrowLeft, Star } from 'lucide-react';
import useSEO from '../hooks/useSEO';

export default function Pricing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [plans, setPlans] = useState([]);
  const [busy, setBusy] = useState(null);

  useSEO({
    title: 'Prețuri & Planuri · Energy Project Design — de la 49 RON/lună',
    description: 'Planuri Energy Project Design: Free (1 proiect), Operator 49 RON (25 proiecte/lună), Proiectant 199 RON (50 proiecte/lună), Societate 999 RON (200 proiecte/lună), Developer Elite. Acces complet documentație tehnică gaze, electric, fotovoltaic, telecom, HVAC. Stripe LIVE.',
    canonical: 'https://www.energyprojectdesign.com/pricing',
    keywords: 'pret abonament documentatie tehnica, planuri EPD, energy project design pricing, abonament gaze naturale, abonament proiectant, abonament societate, stripe abonament RON, plan developer elite, comparatie planuri ANRE',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Prețuri & Planuri', url: '/pricing' },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Energy Project Design — Abonament SaaS',
      description: 'Abonament platformă documentație tehnică digitală certificată multi-industrie.',
      brand: { '@type': 'Brand', name: 'Energy Project Design' },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RON',
        lowPrice: '0',
        highPrice: '4500000',
        offerCount: '5',
        availability: 'https://schema.org/InStock',
        url: 'https://www.energyprojectdesign.com/pricing',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '38',
        bestRating: '5',
        worstRating: '1',
      },
    },
  });

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/plans'); setPlans(data); }
      catch (err) { console.error('Plans load failed:', err); }
    })();
  }, []);

  const onSelect = async (planId) => {
    if (!user) { nav('/login'); return; }
    setBusy(planId);
    try {
      const { data } = await api.post('/payments/checkout', { plan_id: planId, origin_url: window.location.origin });
      window.location.href = data.url;
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare plată'); }
    finally { setBusy(null); }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
            <div className="font-bold tracking-tight">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <Link to={user ? '/dashboard' : '/'} className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Înapoi</Link>
        </div>
      </header>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="label mb-3 text-center">// Planuri departamente</div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-center mb-3">Planuri pentru fiecare departament tehnic.</h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">Prețuri în EUR per utilizator/lună. Plată prin Stripe, anulați oricând. Plan Societate pentru acces total — sau alegeți doar departamentele de care aveți nevoie.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-px bg-gray-200 border border-gray-200" data-testid="pricing-grid">
            {plans.map((p) => {
              const highlight = p.id === 'societate';
              const isActive = user?.plan === p.id;
              return (
                <div key={p.id} className={`bg-white p-7 flex flex-col relative ${highlight ? 'ring-2 ring-[#FFB300] ring-inset' : ''}`} data-testid={`plan-${p.id}`}>
                  {highlight && <div className="absolute top-0 right-0 bg-[#FFB300] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 flex items-center gap-1"><Star className="w-3 h-3" /> Recomandat</div>}
                  <div className="label mb-2">{p.label}</div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">{p.name}</h3>
                  <div className="mb-3">
                    <span className="text-4xl font-bold tracking-tighter">{p.price_eur}</span>
                    <span className="text-base text-gray-500 ml-1">EUR</span>
                    <span className="text-sm text-gray-500 ml-1">/ lună</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">{p.tagline}</p>
                  <ul className="space-y-2 mb-6 text-xs flex-1">
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />{p.documents_per_month} documente / lună</li>
                    {p.features.slice(0, 5).map(f => (
                      <li key={f} className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" /><span className="capitalize">{f.replace(/_/g, ' ')}</span></li>
                    ))}
                    {p.stamps_allowed.length > 0 && <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />Ștampile: {p.stamps_allowed.join(', ')}</li>}
                    <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-[#16A34A] mt-0.5 shrink-0" />Export: {p.export_allowed ? 'permis' : 'doar vizualizare'}</li>
                  </ul>
                  <button
                    onClick={() => onSelect(p.id)}
                    disabled={busy === p.id || isActive}
                    data-testid={`select-${p.id}`}
                    className={highlight ? 'amber-btn w-full disabled:opacity-50 text-sm' : 'outline-btn w-full justify-center disabled:opacity-50 text-sm'}
                  >
                    {isActive ? '✓ Plan activ' : (busy === p.id ? 'Se procesează...' : `Achiziționează — ${p.price_eur} EUR`)}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-[#F9FAFB] border border-gray-200 p-6">
              <div className="label mb-2">// Departament Developer</div>
              <h3 className="font-semibold text-lg mb-2">Plan intern — Lifetime</h3>
              <p className="text-sm text-gray-600 mb-3">Plan rezervat echipei interne de dezvoltare. Acces total, fără limite, fără cost. Activat manual de administrator.</p>
              <span className="text-[10px] uppercase tracking-wider bg-black text-white px-2 py-1">Indisponibil public</span>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <div className="label mb-2">// Garanții</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#16A34A] mt-0.5" /> Anulare oricând, fără penalități</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#16A34A] mt-0.5" /> Procesare plată securizată prin Stripe</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#16A34A] mt-0.5" /> Date găzduite în UE, conform GDPR</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-[#16A34A] mt-0.5" /> Suport în limba română</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
