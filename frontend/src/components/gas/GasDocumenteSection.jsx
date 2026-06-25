/**
 * Documente Generate — lista 30+ template DOCX cu generare individuală.
 * Conectat la endpoint-ul GET /api/gas/templates-catalog + POST /api/gas/doc-preview/{id}
 */
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'sonner';
import { FileText, Download, Loader2, AlertCircle, Search, FileCheck2 } from 'lucide-react';

const PHASE_LABEL = {
  cu: 'Faza Certificat Urbanism',
  dtac: 'Faza DTAC (Autorizație Construire)',
  pt: 'Faza PT (Proiect Tehnic Execuție)',
  executie: 'Faza Execuție',
  pif: 'Punere în Funcțiune',
  receptie: 'Recepție Tehnică',
};

const PHASE_COLOR = {
  cu: 'from-blue-500 to-indigo-600',
  dtac: 'from-violet-500 to-purple-600',
  pt: 'from-emerald-500 to-teal-600',
  executie: 'from-amber-500 to-orange-600',
  pif: 'from-rose-500 to-pink-600',
  receptie: 'from-slate-600 to-slate-800',
};

export default function GasDocumenteSection({ data }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/gas/templates-catalog');
        setCatalog(r.data?.templates || []);
      } catch (err) {
        toast.error('Nu am putut încărca catalogul de șabloane');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = catalog.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.label || '').toLowerCase().includes(q) || (t.id || '').toLowerCase().includes(q) || (t.norm || '').toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, t) => {
    const phase = t.phase || 'altele';
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(t);
    return acc;
  }, {});

  const downloadTemplate = async (tplId, tplLabel) => {
    setDownloading(tplId);
    try {
      const res = await api.post(`/gas/doc-preview/${tplId}`, {
        ...data,
        title: `${tplLabel} — ${data.beneficiar_nume || 'EPD'}`,
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tplId}_${(data.beneficiar_nume || 'EPD').replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`✅ ${tplLabel} — descărcat`);
    } catch (err) {
      toast.error(`Eroare la ${tplId}: ${err.response?.data?.detail || err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            Documente generate
          </h2>
          <p className="text-sm text-slate-500">
            Catalog complet de șabloane DOCX. Click pe orice document → descărcare instantanee cu date proiect.
            <span className="ml-1 text-violet-700 font-semibold">{catalog.length} șabloane disponibile.</span>
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Caută șablon…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-violet-500"
            data-testid="doc-search"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Se încarcă catalogul...
        </div>
      )}

      {!loading && catalog.length === 0 && (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Nu am putut încărca catalogul.</p>
        </div>
      )}

      {!loading && Object.keys(grouped).sort().map((phase) => {
        const items = grouped[phase];
        const gradient = PHASE_COLOR[phase] || 'from-slate-500 to-slate-700';
        return (
          <div key={phase} className="border border-slate-200 rounded-xl overflow-hidden bg-white" data-testid={`phase-${phase}`}>
            <div className={`px-5 py-3 bg-gradient-to-r ${gradient} text-white`}>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80 font-semibold">// Faza</div>
              <h3 className="font-bold text-base">{PHASE_LABEL[phase] || phase}</h3>
              <div className="text-xs opacity-90">{items.length} șabloane</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
              {items.map((t) => {
                const isDl = downloading === t.id;
                return (
                  <div key={t.id} className="bg-white p-4 hover:bg-violet-50/50 transition-colors flex items-start gap-3" data-testid={`template-${t.id}`}>
                    <FileCheck2 className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm leading-tight">{t.label}</div>
                      {t.norm && <div className="text-[11px] text-slate-500 mt-1">Bază legală: {t.norm}</div>}
                      <code className="text-[10px] text-slate-400 font-mono mt-1 block">{t.id}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadTemplate(t.id, t.label)}
                      disabled={isDl}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                      data-testid={`download-${t.id}`}
                    >
                      {isDl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      DOCX
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
