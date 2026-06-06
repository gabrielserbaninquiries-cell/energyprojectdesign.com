import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Copy, FileJson, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

const STATUS_ICONS = {
  ok: { Icon: CheckCircle2, color: 'text-[#16A34A]', bg: 'bg-[#16A34A]/10' },
  warning: { Icon: AlertTriangle, color: 'text-[#FFB300]', bg: 'bg-[#FFB300]/15' },
  missing: { Icon: AlertCircle, color: 'text-[#DC2626]', bg: 'bg-[#DC2626]/10' },
};

const SEV_BADGE = {
  high: 'bg-[#DC2626] text-white',
  medium: 'bg-[#FFB300] text-black',
  low: 'bg-gray-200 text-gray-700',
};

export default function Verification() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/verification');
      setReport(data);
    } catch (e) { toast.error('Eroare verificare'); }
    finally { setLoading(false); }
  };
  useEffect(() => { run(); }, []);

  const copy = async () => {
    if (!report) return;
    const txt = `Verificare documentație — ${new Date(report.generated_at).toLocaleString('ro-RO')}\nScor total: ${report.overall_score}%\n\n` +
      report.checks.map(c => `[${c.status.toUpperCase()}] ${c.label} — ${c.score}% (${c.severity}) :: ${c.detail}`).join('\n');
    await navigator.clipboard.writeText(txt);
    toast.success('Raport copiat');
  };

  const exportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `verificare-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  if (loading) return <AppShell title="Verifică documentație"><div className="text-sm text-gray-500">Se rulează verificarea…</div></AppShell>;
  if (!report) return <AppShell title="Verifică documentație"><div className="text-sm text-gray-500">Eroare.</div></AppShell>;

  const { overall_score, checks, summary } = report;

  return (
    <AppShell title="Verifică documentație" subtitle="Centrul de control al stării documentației tehnice">
      {/* Hero score */}
      <div className="bg-white border border-gray-200 p-8 mb-6 grid md:grid-cols-3 gap-8 items-center" data-testid="verification-hero">
        <div className="md:col-span-1">
          <div className="label mb-2">// Scor global</div>
          <div className="text-7xl font-bold tracking-tighter" data-testid="overall-score">{overall_score}<span className="text-3xl text-gray-400">%</span></div>
          <div className="text-xs text-gray-500 mt-2">Generat: {new Date(report.generated_at).toLocaleString('ro-RO')}</div>
        </div>
        <div className="md:col-span-1 grid grid-cols-3 gap-3 text-center">
          <div className="bg-[#16A34A]/10 p-4">
            <div className="text-2xl font-bold text-[#16A34A]">{summary.ok}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#16A34A]">OK</div>
          </div>
          <div className="bg-[#FFB300]/15 p-4">
            <div className="text-2xl font-bold text-[#92400E]">{summary.warning}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#92400E]">Atenție</div>
          </div>
          <div className="bg-[#DC2626]/10 p-4">
            <div className="text-2xl font-bold text-[#DC2626]">{summary.missing}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#DC2626]">Lipsă</div>
          </div>
        </div>
        <div className="md:col-span-1 flex flex-col gap-2">
          <button onClick={run} className="amber-btn" data-testid="rerun-btn"><RefreshCw className="w-4 h-4" /> Rulează din nou</button>
          <button onClick={copy} className="outline-btn text-sm" data-testid="copy-report-btn"><Copy className="w-3.5 h-3.5" /> Copiază raport</button>
          <button onClick={exportJson} className="outline-btn text-sm" data-testid="export-report-btn"><FileJson className="w-3.5 h-3.5" /> Export raport JSON</button>
        </div>
      </div>

      {/* Detailed checks */}
      <div className="bg-white border border-gray-200" data-testid="verification-table">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold">Verificări detaliate</h2>
          <span className="text-xs text-gray-500">{checks.length} verificări</span>
        </div>
        <ul className="divide-y divide-gray-200">
          {checks.map((c) => {
            const sc = STATUS_ICONS[c.status] || STATUS_ICONS.warning;
            const SIcon = sc.Icon;
            return (
              <li key={c.key} className="px-6 py-4 flex items-center gap-4" data-testid={`check-${c.key}`}>
                <div className={`w-10 h-10 ${sc.bg} flex items-center justify-center shrink-0`}>
                  <SIcon className={`w-5 h-5 ${sc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.label}</span>
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 ${SEV_BADGE[c.severity]}`}>{c.severity}</span>
                    <span className="text-xs text-gray-500">{c.score}%</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{c.detail}</div>
                </div>
                <Link to={c.fix_url} className="ghost-btn text-xs" data-testid={`fix-${c.key}`}>
                  Deschide <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
