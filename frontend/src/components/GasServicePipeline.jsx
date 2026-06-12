/**
 * GasServicePipeline — Bar de progres 6 etape + Catalog servicii ad-hoc cu cumpărare Stripe.
 *
 * Etape: Date → Documente → Ștampile → Semnătură → Plată → Livrare
 *
 * Catalog ad-hoc per proiect (NOT abonament): express, QES, dispatch, review, carte_legata.
 */
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, FileText, Stamp, FileSignature, CreditCard, Send, Zap,
  ShieldCheck, BookOpen, Loader2, Lock, ShoppingCart,
} from 'lucide-react';

const STEPS = [
  { id: 'date',       label: 'Date',       icon: FileText },
  { id: 'docs',       label: 'Documente',  icon: FileText },
  { id: 'stamps',     label: 'Ștampile',   icon: Stamp },
  { id: 'signature',  label: 'Semnătură',  icon: FileSignature },
  { id: 'payment',    label: 'Plată',      icon: CreditCard },
  { id: 'delivery',   label: 'Livrare',    icon: Send },
];

const SERVICE_ICONS = {
  Zap, FileSignature, Send, ShieldCheck, BookOpen,
};

export default function GasServicePipeline({ pid, data, hasStamps, isSigned }) {
  const [catalog, setCatalog] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [busy, setBusy] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [stampsCount, setStampsCount] = useState(0);

  const loadCatalog = async () => {
    try {
      const { data: payload } = await api.get(`/gas-project/${pid}/services`);
      setCatalog(payload.catalog || []);
      setPurchased(payload.purchased || []);
    } catch (e) {
      // ignore
    } finally {
      setLoaded(true);
    }
  };

  const loadAssets = async () => {
    try {
      const { data: payload } = await api.get(`/assets/${pid}`);
      const stamps = (payload.assets || []).filter((a) =>
        (a.category || '').startsWith('stamp_') && !a.deleted
      );
      setStampsCount(stamps.length);
    } catch {
      setStampsCount(0);
    }
  };

  useEffect(() => {
    if (pid) { loadCatalog(); loadAssets(); }
  }, [pid]);

  // After Stripe redirect → ?service_session={sid}, ping status to mark paid
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('service_session');
    if (sid && pid) {
      (async () => {
        try {
          const { data } = await api.get(`/gas-project/${pid}/service-status/${sid}`);
          if (data.status === 'paid') {
            toast.success(`Serviciu activat: ${data.service_id}`);
            await loadCatalog();
          }
        } catch {
          // silent
        }
        // Clear query string
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
  }, [pid]);

  const buy = async (serviceId) => {
    setBusy(serviceId);
    try {
      const { data } = await api.post(`/gas-project/${pid}/service-checkout`, {
        service_id: serviceId,
        origin_url: window.location.origin,
        quantity: 1,
      });
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare checkout');
    } finally {
      setBusy(null);
    }
  };

  // Compute stage statuses
  const stageStatus = {
    date:      Object.values(data || {}).filter((v) => v !== null && v !== undefined && v !== '').length >= 25 ? 'done' : 'progress',
    docs:      Object.values(data || {}).filter((v) => v !== null && v !== undefined && v !== '').length >= 50 ? 'done' : 'pending',
    stamps:    (stampsCount >= 1 || hasStamps) ? 'done' : 'pending',
    signature: isSigned ? 'done' : 'pending',
    payment:   (purchased || []).some((p) => p.status === 'paid') ? 'done' : 'pending',
    delivery:  (purchased || []).some((p) => p.status === 'paid' && (p.service_id === 'seap_dispatch' || p.service_id === 'express_24h')) ? 'done' : 'pending',
  };

  return (
    <div className="space-y-4 mb-6" data-testid="gas-service-pipeline">
      {/* PIPELINE STRIP — 6 etape */}
      <div className="bg-white border-2 border-zinc-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">// flow proiect</div>
            <div className="text-sm font-bold tracking-tight">De la date completate la livrarea finală</div>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
            {Object.values(stageStatus).filter((s) => s === 'done').length}/{STEPS.length} etape complete
          </div>
        </div>
        <div className="grid grid-cols-6 gap-0 relative" data-testid="pipeline-stages">
          {STEPS.map((step, idx) => {
            const status = stageStatus[step.id];
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            const colorClass = status === 'done' ? 'border-green-600 bg-green-50 text-green-700'
              : status === 'progress' ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-zinc-300 bg-zinc-50 text-zinc-400';
            return (
              <div key={step.id} className="relative" data-testid={`pipeline-${step.id}`}>
                <div className={`border-2 ${colorClass} px-3 py-2 flex items-center gap-2`}>
                  {status === 'done' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Icon className="w-4 h-4 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Etapa {idx + 1}</div>
                    <div className="text-xs font-bold truncate">{step.label}</div>
                  </div>
                </div>
                {!isLast && (
                  <div className={`absolute top-1/2 -right-2 w-4 h-0.5 z-10 ${status === 'done' ? 'bg-green-600' : 'bg-zinc-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SERVICE CATALOG — cumpărare ad-hoc per proiect */}
      <div className="bg-white border-2 border-zinc-900" data-testid="gas-service-catalog">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-zinc-900 bg-[#FFB300]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-black/70">// catalog servicii ad-hoc</div>
            <div className="text-sm font-bold text-black tracking-tight">Servicii premium per proiect (one-shot, nu abonament)</div>
          </div>
          <ShoppingCart className="w-4 h-4 text-black" />
        </div>
        {!loaded && (
          <div className="p-6 text-center text-xs text-zinc-500" data-testid="catalog-loading">
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          </div>
        )}
        {loaded && catalog.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 divide-x divide-zinc-200">
            {catalog.map((s) => {
              const Icon = SERVICE_ICONS[s.icon] || ShieldCheck;
              const isPurchased = s.purchased;
              const isBusy = busy === s.id;
              return (
                <div key={s.id} className="p-4 flex flex-col" data-testid={`service-${s.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-8 h-8 flex items-center justify-center ${isPurchased ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'}`}>
                      {isPurchased ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold tabular-nums">{s.price_eur}€</div>
                      {s.unit && <div className="text-[9px] uppercase tracking-wider text-zinc-500">{s.unit}</div>}
                    </div>
                  </div>
                  <div className="text-sm font-bold mb-1 leading-tight">{s.label}</div>
                  <div className="text-[10px] text-zinc-500 leading-snug mb-3 flex-1">{s.description}</div>
                  {isPurchased ? (
                    <div className="text-[10px] uppercase tracking-wider text-green-700 font-bold flex items-center gap-1" data-testid={`service-purchased-${s.id}`}>
                      <CheckCircle2 className="w-3 h-3" /> Activat
                    </div>
                  ) : (
                    <button
                      onClick={() => buy(s.id)}
                      disabled={isBusy}
                      className="text-xs bg-black text-white px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-1"
                      data-testid={`service-buy-${s.id}`}
                    >
                      {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                      Cumpără {s.price_eur}€
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
