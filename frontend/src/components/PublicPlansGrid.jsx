/**
 * V10.8 — PublicPlansGrid
 *
 * Cerință literală user (mesaj 26.06.2026): "Vreau sa faci planurile pentru
 * sectiunea gaze naturale vizibile [înainte de logare]. ... iar planurile sunt
 * disponibile doar dupa logare."
 *
 * Component public (zero auth) — fetch /api/plans și afișează cele 6 planuri
 * principale (Trial → Operator → Proiectant → Executant → Avize → Societate)
 * cu prețuri vizibile imediat, CTA inline către /register (cu plan preselectat).
 *
 * Vizual aliniat cu screenshot-urile premium primite de la user — fundal alb,
 * card-uri cu border ușor + ring violet pe planul popular, gradient text pe preț.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';

// Planurile principale pe care vrem să le evidențiem public (în ordinea cardurilor)
const HIGHLIGHTED = ['trial', 'basic', 'operator', 'proiectant', 'executant', 'societate'];
const POPULAR = 'proiectant';

export default function PublicPlansGrid({ context = 'gas' }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/plans')
      .then(({ data }) => {
        // Sort în ordinea HIGHLIGHTED, păstrăm doar cele evidențiate
        const map = new Map((data || []).map(p => [p.id, p]));
        const ordered = HIGHLIGHTED.map(id => map.get(id)).filter(Boolean);
        setPlans(ordered);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="public-plans" className="py-20 bg-gradient-to-b from-white via-violet-50/30 to-white border-b border-slate-200" data-testid="public-plans-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" /> Planuri publice · acces fără cont
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter text-slate-900 mb-3">
            Tarife <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Gaze Naturale</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Vezi toate planurile înainte de înregistrare. Toate planurile includ acces la editorul de proiecte,
            generare DOCX legal, semnătură QES eIDAS și suport multi-limbă (24 limbi).
            Plată sigură prin Stripe LIVE. Anulezi oricând.
          </p>
        </div>

        {/* Plans grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Planurile nu sunt disponibile momentan.{' '}
            <Link to="/pricing" className="text-violet-700 font-semibold hover:underline">Vezi pagina completă →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" data-testid="plans-grid">
            {plans.map((p) => {
              const isPopular = p.id === POPULAR;
              const price = p.price_eur ?? 0;
              const isFree = !price || price === 0;
              return (
                <div
                  key={p.id}
                  data-testid={`public-plan-${p.id}`}
                  className={`relative bg-white rounded-xl p-5 transition-all hover:-translate-y-1 ${
                    isPopular
                      ? 'border-2 border-violet-500 epd-shadow-lg ring-4 ring-violet-100'
                      : 'border border-slate-200 hover:border-violet-300 hover:shadow-md'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] uppercase tracking-wider font-bold rounded-full shadow-md">
                      Popular
                    </div>
                  )}
                  <div className="text-[10px] uppercase tracking-[0.18em] text-violet-600 font-semibold mb-1">{p.label || p.id}</div>
                  <div className="text-lg font-bold text-slate-900 leading-tight mb-3">{p.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-700 bg-clip-text text-transparent tabular-nums">
                      {isFree ? '0' : price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{p.currency_label || 'EUR / lună'}</span>
                  </div>
                  {p.tagline && (
                    <div className="text-[11px] text-slate-500 italic mb-4 line-clamp-2">{p.tagline}</div>
                  )}
                  <ul className="space-y-1.5 mb-5 min-h-[112px]">
                    {(p.features || []).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 leading-snug">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/register?plan=${p.id}&context=${context}`}
                    data-testid={`public-plan-cta-${p.id}`}
                    className={`flex items-center justify-center gap-1 w-full py-2 text-xs font-semibold rounded-lg transition-all ${
                      isPopular
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow'
                        : 'bg-slate-100 text-slate-800 hover:bg-violet-100 hover:text-violet-800'
                    }`}
                  >
                    {isFree ? 'Începe gratuit' : 'Alege planul'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer link */}
        <div className="text-center mt-10">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-violet-700 font-semibold hover:text-violet-900 transition-colors"
            data-testid="public-plans-see-all"
          >
            Vezi toate planurile (11 opțiuni) <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="text-xs text-slate-500 mt-3">
            Toate prețurile sunt fără TVA. Plata se face în EUR prin Stripe LIVE.
            Anulezi abonamentul oricând din contul tău.
          </div>
        </div>
      </div>
    </section>
  );
}
