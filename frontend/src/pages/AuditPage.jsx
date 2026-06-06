import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Copy } from 'lucide-react';

export default function AuditPage() {
  const [audit, setAudit] = useState(null);

  const run = async () => {
    try {
      const { data } = await api.get('/audit');
      setAudit(data);
    } catch (e) { toast.error('Eroare audit'); }
  };
  useEffect(() => { run(); }, []);

  const copy = async () => {
    if (!audit) return;
    const txt = audit.pages.map(p => `[${p.implemented ? 'OK' : 'MISSING'}] ${p.label} (${p.route}) — handlers: ${p.required_handlers.join(', ') || '—'} — fields: ${p.fields.length} — plan access: ${p.plan_access}`).join('\n');
    await navigator.clipboard.writeText(txt);
    toast.success('Raport audit copiat');
  };

  if (!audit) return <AppShell title="Audit interfață"><div className="text-sm text-gray-500">Se rulează auditul…</div></AppShell>;

  const planFeatures = audit.plan_features || [];

  return (
    <AppShell title="Audit interfață" subtitle="Verificare end-to-end a paginilor, câmpurilor, handler-elor și drepturilor de plan">
      <div className="bg-white border border-gray-200 p-6 mb-6 flex items-center justify-between" data-testid="audit-summary">
        <div>
          <div className="label">// Rezultat audit</div>
          <div className="text-2xl font-bold tracking-tight mt-1">{audit.pages.length} pagini scanate</div>
          <div className="text-xs text-gray-500 mt-1">Generat: {new Date(audit.generated_at).toLocaleString('ro-RO')}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={run} className="outline-btn text-sm py-2">Rulează din nou</button>
          <button onClick={copy} className="amber-btn text-sm py-2" data-testid="audit-copy-btn"><Copy className="w-3.5 h-3.5" /> Copiază raport</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold">Funcții incluse în planul curent: <span className="mono text-[#FFB300]">{audit.user.plan}</span></h2>
        </div>
        <div className="p-6 flex flex-wrap gap-2">
          {planFeatures.length === 0 ? <span className="text-sm text-gray-500">Nicio funcție.</span> : planFeatures.map(f => (
            <span key={f} className="mono text-[11px] bg-[#FFB300]/15 text-[#92400E] px-2 py-0.5">{f}</span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200" data-testid="audit-table">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase tracking-[0.15em] text-gray-500">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Pagină</th>
              <th className="text-left px-4 py-3 font-medium">Rută</th>
              <th className="text-left px-4 py-3 font-medium">Câmpuri</th>
              <th className="text-left px-4 py-3 font-medium">Handlere</th>
              <th className="text-center px-4 py-3 font-medium">Implementat</th>
              <th className="text-center px-4 py-3 font-medium">Acces plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {audit.pages.map((p) => (
              <tr key={p.id} data-testid={`audit-row-${p.id}`}>
                <td className="px-6 py-3 font-medium">{p.label}</td>
                <td className="px-4 py-3 mono text-xs text-gray-600">{p.route}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.fields.length === 0 ? '—' : `${p.fields.length} câmpuri`}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.required_handlers.join(', ') || '—'}</td>
                <td className="px-4 py-3 text-center">{p.implemented ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] inline" /> : <XCircle className="w-4 h-4 text-[#DC2626] inline" />}</td>
                <td className="px-4 py-3 text-center">{p.plan_access ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] inline" /> : <XCircle className="w-4 h-4 text-gray-400 inline" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
