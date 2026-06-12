/**
 * Billing page — afișează plan curent + istoric tranzacții + log activări.
 * Consumă GET /api/me/billing.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  CreditCard, Receipt, Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowUpRight, RefreshCcw, FileText, Shield, Wallet,
} from 'lucide-react';

const STATUS_BADGE = {
  paid:      { bg: 'bg-green-100', txt: 'text-green-800', label: 'Plătit' },
  initiated: { bg: 'bg-zinc-100',  txt: 'text-zinc-700',  label: 'Inițiat' },
  open:      { bg: 'bg-amber-100', txt: 'text-amber-800', label: 'Deschis' },
  expired:   { bg: 'bg-red-100',   txt: 'text-red-800',   label: 'Expirat' },
  failed:    { bg: 'bg-red-100',   txt: 'text-red-800',   label: 'Eșuat' },
};

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function fmtMoney(amount, currency) {
  if (amount === undefined || amount === null) return '—';
  const ccy = (currency || 'EUR').toUpperCase();
  return `${Number(amount).toFixed(2)} ${ccy}`;
}

export default function Billing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: payload } = await api.get('/me/billing');
      setData(payload);
      setErr(null);
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Eroare la încărcare facturare');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <section className="space-y-6" data-testid="billing-page">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-zinc-200 pb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-1">// facturare</div>
            <h1 className="text-3xl font-bold tracking-tight">Plan și facturare</h1>
            <p className="text-sm text-zinc-500 mt-1">Plan activ, istoricul tranzacțiilor și log-ul activărilor.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-xs flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50" data-testid="billing-refresh">
              <RefreshCcw className="w-3 h-3" /> Reîncarcă
            </button>
            <Link to="/pricing" className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-[#FFB300] text-black font-semibold hover:bg-amber-400" data-testid="billing-upgrade">
              <ArrowUpRight className="w-3 h-3" /> Schimbă plan
            </Link>
          </div>
        </div>

        {loading && (
          <div className="border border-zinc-200 p-12 text-center text-zinc-500" data-testid="billing-loading">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <div className="text-xs mt-2">Se încarcă datele de facturare...</div>
          </div>
        )}
        {err && (
          <div className="border-2 border-red-300 bg-red-50 p-4 text-sm text-red-800" data-testid="billing-error">
            <AlertCircle className="w-4 h-4 inline mr-2" />{err}
          </div>
        )}

        {!loading && !err && data && (
          <>
            {/* Plan curent — hero card */}
            <div className="border-2 border-zinc-900 bg-zinc-950 text-white p-6 lg:p-8" data-testid="billing-current-plan">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-2">// plan activ</div>
                  <h2 className="text-3xl font-bold tracking-tight">{data.current_plan?.name || '—'}</h2>
                  <div className="text-xs text-zinc-400 mt-1 font-mono">{data.current_plan?.plan_id || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1">// preț lunar</div>
                  <div className="text-4xl font-bold tabular-nums">
                    {data.current_plan?.price_eur ? `${data.current_plan.price_eur}€` : 'gratuit'}
                  </div>
                  {data.current_plan?.renews_at && (
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Se reînnoiește pe {fmtDate(data.current_plan.renews_at)}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-zinc-800 mt-6 pt-4 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <Wallet className="w-3 h-3 text-[#FFB300] mb-1" />
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Tranzacții total</div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">{data.transactions?.length || 0}</div>
                </div>
                <div>
                  <Shield className="w-3 h-3 text-[#FFB300] mb-1" />
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Activări plan</div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">{data.activations?.length || 0}</div>
                </div>
                <div>
                  <CheckCircle2 className="w-3 h-3 text-[#FFB300] mb-1" />
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Tranzacții plătite</div>
                  <div className="text-lg font-bold tabular-nums mt-0.5">
                    {(data.transactions || []).filter((t) => t.payment_status === 'paid').length}
                  </div>
                </div>
              </div>
            </div>

            {/* Tranzacții */}
            <div className="border border-zinc-200 bg-white" data-testid="billing-transactions">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-50">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-zinc-600" />
                  Istoric tranzacții
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">ultimele 10</span>
              </div>
              {(data.transactions || []).length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500" data-testid="billing-no-tx">
                  Nicio tranzacție înregistrată încă.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider">
                        <th className="text-left px-4 py-2.5 font-semibold">Data</th>
                        <th className="text-left px-4 py-2.5 font-semibold">Plan</th>
                        <th className="text-right px-4 py-2.5 font-semibold">Sumă</th>
                        <th className="text-center px-4 py-2.5 font-semibold">Status</th>
                        <th className="text-left px-4 py-2.5 font-semibold">Session ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((tx, idx) => {
                        const s = STATUS_BADGE[tx.payment_status] || STATUS_BADGE.initiated;
                        return (
                          <tr key={tx.session_id || idx} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`billing-tx-${idx}`}>
                            <td className="px-4 py-2.5 text-zinc-700">{fmtDate(tx.created_at)}</td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono font-semibold">{tx.plan_id}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{fmtMoney(tx.amount, tx.currency)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${s.bg} ${s.txt}`}>{s.label}</span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-500 truncate max-w-[200px]">{tx.session_id}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Audit log activări plan */}
            <div className="border border-zinc-200 bg-white" data-testid="billing-activations">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 bg-zinc-50">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-600" />
                  Activări plan — audit log
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">ultimele 10</span>
              </div>
              {(data.activations || []).length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500" data-testid="billing-no-activations">
                  Nicio activare de plan încă. Cumpărați un plan pentru a începe.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {data.activations.map((act, idx) => (
                    <div key={idx} className="px-5 py-3 flex items-center gap-4" data-testid={`billing-act-${idx}`}>
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{act.plan_id}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Sursă: <span className="font-mono">{act.source}</span>
                          {act.renew_at && <> · Reînnoire: {fmtDate(act.renew_at)}</>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums">{fmtMoney(act.amount, act.currency)}</div>
                        <div className="text-[10px] text-zinc-500">{fmtDate(act.activated_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="grid md:grid-cols-3 gap-3">
              <Link to="/pricing" className="border border-zinc-200 bg-white p-4 hover:border-black hover:shadow-sm transition-all" data-testid="billing-link-pricing">
                <CreditCard className="w-5 h-5 mb-3 text-zinc-700" />
                <div className="text-sm font-semibold mb-1">Vezi toate planurile</div>
                <div className="text-[11px] text-zinc-500">10 planuri × 17 departamente</div>
              </Link>
              <Link to="/comisioane-tarife" className="border border-zinc-200 bg-white p-4 hover:border-black hover:shadow-sm transition-all" data-testid="billing-link-fees">
                <Clock className="w-5 h-5 mb-3 text-zinc-700" />
                <div className="text-sm font-semibold mb-1">Comisioane și tarife</div>
                <div className="text-[11px] text-zinc-500">Tabel transparent costuri platformă</div>
              </Link>
              <Link to="/documents" className="border border-zinc-200 bg-white p-4 hover:border-black hover:shadow-sm transition-all" data-testid="billing-link-docs">
                <FileText className="w-5 h-5 mb-3 text-zinc-700" />
                <div className="text-sm font-semibold mb-1">Facturi & chitanțe</div>
                <div className="text-[11px] text-zinc-500">Descărcați documente fiscale</div>
              </Link>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
