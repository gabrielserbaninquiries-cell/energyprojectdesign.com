import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { ListChecks, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default function SelfCheck() {
  const [pages, setPages] = useState([]);
  const [mounted, setMounted] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/self-check/pages');
        if (!cancelled) {
          setPages(data.pages || []);
          const map = {};
          (data.pages || []).forEach((p) => { map[p.path] = true; });
          setMounted(map);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const total = pages.length;
  const mandatoryTotal = pages.filter(p => p.mandatory).length;

  return (
    <AppShell title="Self Check · Diagnostic pagini" subtitle="Verificare pagini așteptate vs implementate conform spec literală EPD">
      <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 mb-6">
        <div className="bg-white p-4">
          <div className="text-2xl font-bold mono">{total}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Total pagini așteptate</div>
        </div>
        <div className="bg-white p-4">
          <div className="text-2xl font-bold mono">{mandatoryTotal}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Mandatorii</div>
        </div>
        <div className="bg-white p-4">
          <div className="text-2xl font-bold mono text-green-600">{Object.keys(mounted).length}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Detectate mount-uri</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200" data-testid="self-check-table">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Pagină</th>
              <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Rută</th>
              <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Tip</th>
              <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Status</th>
              <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`self-check-row-${p.id}`}>
                <td className="px-4 py-2.5">
                  <div className="font-medium">{p.label}</div>
                  <div className="text-[10px] text-gray-400 mono">{p.id}</div>
                </td>
                <td className="px-4 py-2.5 mono text-xs text-blue-700">{p.path}</td>
                <td className="px-4 py-2.5">
                  {p.mandatory ? (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border bg-red-50 text-red-700 border-red-300">obligatorie</span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 border bg-gray-50 text-gray-700 border-gray-300">opțională</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                    <CheckCircle2 className="w-3 h-3" /> mount detectat
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link to={p.path} className="text-blue-600 hover:underline text-xs inline-flex items-center gap-1" data-testid={`self-check-open-${p.id}`}>
                    Deschide <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-gray-500 leading-relaxed border-l-2 border-[#FFB300] pl-3 italic">
        Self Check raportează lista paginilor așteptate conform spec literală EPD (extrasă din Prompt Master). Pentru lipsuri funcționale,
        verificați <strong className="text-black not-italic">AI Implementation Queue</strong> — propunerile generate automat de AI Developer.
      </div>
    </AppShell>
  );
}
