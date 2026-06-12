/**
 * UpgradeGate Component V7.3 — modal "Upgrade la plan X EUR" cu Stripe CTA.
 *
 * Cerere literală user (mesaj 18+19, P1):
 *   "Implementare upgrade-flow în UI — când un user free/basic click pe o pagină pro
 *    (ex: /seap-alerts), modal 'Upgrade la Ofertare 89€' cu CTA Stripe"
 *
 * Folosire: înfășoară orice pagină pro cu <UpgradeGate path="/seap-alerts">...children...</UpgradeGate>
 * sau în standalone pentru a verifica accesul cu un endpoint backend.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Lock, ArrowUpRight, X as XIcon, CheckCircle2, Loader2 } from 'lucide-react';

export default function UpgradeGate({ children, path }) {
  const location = useLocation();
  const navigate = useNavigate();
  const checkPath = path || location.pathname;
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/upgrade-info?path=${encodeURIComponent(checkPath)}`);
        if (!cancelled) setInfo(data);
      } catch {
        if (!cancelled) setInfo({ has_access: true, error: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [checkPath]);

  const startCheckout = async () => {
    if (!info?.recommended_plan) return;
    setCheckout(true);
    try {
      const { data } = await api.post('/payments/checkout', {
        plan_id: info.recommended_plan.plan_id,
        origin_url: window.location.origin,
      });
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      navigate('/pricing');
    } catch {
      navigate('/pricing');
    } finally {
      setCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (info?.has_access || !info?.page_known) {
    return <>{children}</>;
  }

  const rec = info.recommended_plan;
  const dept = info.department || {};
  const page = info.page || {};

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950/70 backdrop-blur flex items-center justify-center p-4" data-testid="upgrade-gate-modal">
      <div className="bg-white max-w-lg w-full rounded-lg overflow-hidden border-2 border-orange-500 shadow-2xl">
        <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 text-white p-6 relative">
          <button onClick={() => navigate(-1)} className="absolute top-3 right-3 text-white/60 hover:text-white" data-testid="upgrade-gate-close">
            <XIcon className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600 rounded mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-orange-400 mb-1">Pagină premium</div>
          <h2 className="text-2xl font-bold tracking-tight">{page.label || 'Acces restricționat'}</h2>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            {dept.description || 'Această pagină face parte dintr-un departament specializat.'}
          </p>
        </div>

        <div className="p-6">
          {rec ? (
            <>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Plan recomandat</div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold tracking-tighter text-zinc-950">{rec.price_eur}</span>
                <span className="text-sm text-zinc-500">€/lună · {rec.name}</span>
              </div>
              {rec.description && (
                <p className="text-sm text-zinc-600 leading-relaxed mb-5">{rec.description}</p>
              )}
              <div className="space-y-2 mb-6">
                {[
                  `Acces complet la ${page.label}`,
                  `Toate paginile din ${dept.label || 'departament'}`,
                  'Suport tehnic prioritar',
                  'Anulare oricând',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-sm text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <button onClick={startCheckout} disabled={checkout}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 rounded-md transition-colors disabled:opacity-50"
                data-testid="upgrade-gate-checkout-btn">
                {checkout ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                Upgrade la {rec.name} ({rec.price_eur} €/lună)
              </button>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => navigate('/planuri-departamente')}
                  className="flex-1 text-xs text-zinc-500 hover:text-zinc-950 underline" data-testid="upgrade-gate-see-all-plans">
                  Vezi toate planurile
                </button>
                <button onClick={() => navigate(-1)}
                  className="flex-1 text-xs text-zinc-500 hover:text-zinc-950" data-testid="upgrade-gate-back">
                  ← Înapoi
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-600 mb-4">Această pagină nu are un plan recomandat. Contactează-ne pentru acces.</p>
              <button onClick={() => navigate('/planuri-departamente')}
                className="bg-zinc-950 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 rounded-md">
                Vezi toate planurile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
