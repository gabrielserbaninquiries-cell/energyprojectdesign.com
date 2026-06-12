/**
 * Comisioane & Tarife V7.3 — pagina publică transparentă cu structura tarifară.
 *
 * Cerere literală user (mesaj 19):
 *   "Tarifeaza functiile cheie ale site-ului, precum, comision vanzari imobiliare
 *    sau taxa de administrare anunt. Listare gratuita anunt, dar taxa per tranzactie in site, etc."
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { Calculator, Sparkles, Loader2, TrendingDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const CATEGORY_ICONS = {
  marketplace: 'ShoppingBag',
  imobiliare_vanzare: 'Home',
  imobiliare_inchiriere: 'Home',
  servicii_meseriasi: 'Wrench',
  logistica: 'Truck',
  forum: 'MessageSquare',
  documentatie: 'FileText',
};

export default function ComisioaneTarife() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calc, setCalc] = useState({ category: 'imobiliare_vanzare', transaction_amount_eur: 100000 });
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/fees/schedule');
        if (!cancelled) setSchedule(data.schedule || {});
      } catch {
        /* keep null */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const runCalc = async () => {
    try {
      const { data } = await api.post('/transactions/compute-fee', calc);
      setCalcResult(data);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <AppShell title="Comisioane & Tarife" subtitle="Se încarcă...">
        <div className="text-center py-20 text-zinc-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      </AppShell>
    );
  }
  if (!schedule) {
    return (
      <AppShell title="Comisioane & Tarife" subtitle="Eroare load tarife">
        <div className="text-center py-20 text-zinc-400">Reîncearcă mai târziu.</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Comisioane & Tarife" subtitle="Listare gratuită · Taxă doar la tranzacții reușite · Transparență totală">

      {/* Hero promise */}
      <section className="mb-10 border-2 border-orange-500 bg-orange-50 p-7 rounded-lg" data-testid="fees-promise">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600 rounded">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-orange-700 mb-1">Promisiune anti-monopol</div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Listare 100% gratuită. Plătești doar când câștigi.</h2>
            <p className="text-sm text-zinc-700 mt-2 leading-relaxed max-w-3xl">
              Spre deosebire de agenții imobiliari (3-6% comision) sau platforme cu abonamente lunare obligatorii,
              noi luăm doar o <strong className="text-orange-700">taxă mică per tranzacție reușită</strong>.
              Anunțul tău e gratuit la nesfârșit. Vrei să apară mai sus în listă? Cumperi un boost opțional.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4 mb-10" data-testid="fees-categories">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">— 7 categorii de servicii</div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Tarife per categorie</h2>

        {Object.entries(schedule).map(([catId, cat]) => (
          <div key={catId} className="border border-zinc-200 bg-white rounded-lg overflow-hidden hover:border-orange-500 transition-colors" data-testid={`fee-cat-${catId}`}>
            <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-0.5">{catId}</div>
                <h3 className="font-bold text-base text-zinc-950">{cat.label}</h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">Listare</div>
                <div className="font-bold text-zinc-950">
                  {cat.listing_fee_eur === 0 ? 'GRATUIT' : `${cat.listing_fee_eur} €`}
                </div>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Transaction fee */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Taxă per tranzacție</div>
                {cat.subscription_required ? (
                  <div className="text-sm text-zinc-700">
                    {cat.savings_note}
                    <Link to="/planuri-departamente" className="block mt-2 text-orange-600 hover:underline text-xs font-semibold">
                      Vezi planurile →
                    </Link>
                  </div>
                ) : cat.transaction_fee_pct !== undefined ? (
                  <div>
                    <div className="text-2xl font-bold tracking-tighter text-zinc-950">
                      {cat.transaction_fee_pct}<span className="text-sm text-zinc-500">%</span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">
                      Min. {cat.transaction_fee_min_eur || 0} EUR
                      {cat.transaction_fee_payer && (
                        <span className="block mt-0.5">Plătită de: <strong className="text-zinc-800">{cat.transaction_fee_payer}</strong></span>
                      )}
                    </div>
                  </div>
                ) : cat.transaction_fee_pct_seller !== undefined ? (
                  <div>
                    <div className="text-2xl font-bold tracking-tighter text-zinc-950">
                      {cat.transaction_fee_pct_seller}% + {cat.transaction_fee_pct_buyer}%
                      <span className="block text-xs font-normal text-zinc-500 mt-1">vânzător + cumpărător</span>
                    </div>
                    {cat.competitor_avg_pct && (
                      <div className="inline-flex items-center gap-1 mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        <TrendingDown className="w-3 h-3" /> {cat.savings_note}
                      </div>
                    )}
                  </div>
                ) : cat.transaction_fee_pct_first_rent ? (
                  <div>
                    <div className="text-2xl font-bold tracking-tighter text-zinc-950">
                      {cat.transaction_fee_pct_first_rent}<span className="text-sm text-zinc-500">% prima chirie</span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">
                      Plătită de: <strong>{cat.transaction_fee_payer}</strong>, o singură dată.
                    </div>
                    {cat.competitor_avg_pct && (
                      <div className="inline-flex items-center gap-1 mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        <TrendingDown className="w-3 h-3" /> {cat.savings_note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">—</div>
                )}
              </div>

              {/* Boost options */}
              {cat.boost_options?.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Boost opțional (creștere vizibilitate)</div>
                  <div className="space-y-1.5">
                    {cat.boost_options.map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-xs border border-zinc-200 px-3 py-2 rounded hover:border-orange-400">
                        <span className="text-zinc-700">{b.label}</span>
                        <span className="font-bold text-zinc-950">{b.price_eur} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Live calculator */}
      <section className="mb-10 border-2 border-zinc-200 bg-white p-6 rounded-lg" data-testid="fees-calculator">
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-4 h-4 text-orange-600" />
          <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Calculator instant</div>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-950 mb-4">Vezi exact ce plătești înainte să listezi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">Categorie</label>
            <select value={calc.category} onChange={(e) => setCalc({ ...calc, category: e.target.value })}
              className="w-full border border-zinc-300 px-3 py-2 text-sm rounded">
              {Object.entries(schedule).filter(([_, c]) => !c.subscription_required).map(([cid, c]) => (
                <option key={cid} value={cid}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-1">Valoare tranzacție (EUR)</label>
            <input type="number" value={calc.transaction_amount_eur}
              onChange={(e) => setCalc({ ...calc, transaction_amount_eur: Number(e.target.value) })}
              className="w-full border border-zinc-300 px-3 py-2 text-sm rounded" data-testid="fees-calc-amount" />
          </div>
          <div className="flex items-end">
            <button onClick={runCalc} className="w-full bg-zinc-950 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 rounded transition-colors" data-testid="fees-calc-btn">
              Calculează
            </button>
          </div>
        </div>
        {calcResult && (
          <div className="border-t border-zinc-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="fees-calc-result">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Valoare brută</div>
              <div className="text-2xl font-bold tracking-tighter text-zinc-950">{calcResult.transaction_amount_eur} EUR</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600">Taxă platformă</div>
              <div className="text-2xl font-bold tracking-tighter text-orange-600">{calcResult.fee_eur} EUR</div>
              <div className="text-[10px] text-zinc-500 mt-1">plătită de: {calcResult.fee_payer}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-700">Net încasat</div>
              <div className="text-2xl font-bold tracking-tighter text-emerald-700">{calcResult.net_eur} EUR</div>
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between" data-testid="fees-cta">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-950">Întrebări despre tarife?</h3>
          <p className="text-sm text-zinc-600 mt-1">Nu există costuri ascunse. Toate taxele sunt aplicate doar la tranzacții reușite.</p>
        </div>
        <Link to="/forum-v7" className="inline-flex items-center gap-2 bg-zinc-950 text-white px-5 py-3 text-sm font-semibold hover:bg-orange-600 transition-colors rounded-md">
          Întreabă în Forum <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </AppShell>
  );
}
