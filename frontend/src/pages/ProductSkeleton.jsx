import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Copy, Package, Zap, ArrowRight } from 'lucide-react';

const STATUS_STYLE = {
  active: 'bg-green-100 text-green-800 border-green-300',
  skeleton: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function ProductSkeleton() {
  const [skeletons, setSkeletons] = useState([]);
  const [selected, setSelected] = useState(null);
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    api.get('/product-skeleton').then(({ data }) => setSkeletons(data.skeletons || [])).catch(() => {});
  }, []);

  const loadPrompt = async (sk) => {
    setSelected(sk);
    setPromptText('Se încarcă...');
    try {
      const { data } = await api.get(`/product-skeleton/${sk.id}`);
      setPromptText(data.prompt);
    } catch (e) {
      setPromptText('Eroare la încărcare prompt.');
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    toast.success('Prompt copiat în clipboard');
  };

  return (
    <AppShell title="Product Skeleton" subtitle="Generator schelet pentru produse noi (electric, apă-canal, fotovoltaice, telecom, feroviar, construcții, ofertare, mentenanță)">
      <div className="grid lg:grid-cols-12 gap-px bg-gray-200 border border-gray-200">
        {/* Left: list */}
        <div className="lg:col-span-5 bg-white">
          <div className="px-4 py-3 border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500">
            // industrii disponibile pentru replicare
          </div>
          <div className="divide-y divide-gray-100">
            {skeletons.map((sk) => {
              const sty = STATUS_STYLE[sk.status] || STATUS_STYLE.skeleton;
              const isSelected = selected?.id === sk.id;
              return (
                <button
                  key={sk.id}
                  onClick={() => loadPrompt(sk)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-amber-50' : ''}`}
                  data-testid={`skeleton-item-${sk.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-[#FFB300]" />
                      <span className="font-semibold text-sm">{sk.label}</span>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${sty}`}>
                      {sk.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mono mb-1">{sk.norms || ''}</div>
                  <div className="text-[11px] text-gray-700 leading-snug">
                    Calc: <span className="mono">{sk.calc_engine}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: prompt preview */}
        <div className="lg:col-span-7 bg-white">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">
              {selected ? `// prompt: ${selected.label}` : '// alege o industrie pentru export'}
            </span>
            {selected && (
              <button
                onClick={copyPrompt}
                className="text-xs inline-flex items-center gap-1 bg-black text-white px-2 py-1 hover:bg-gray-800"
                data-testid="skeleton-copy-prompt-btn"
              >
                <Copy className="w-3 h-3" /> Copiază prompt
              </button>
            )}
          </div>
          <div className="p-4">
            {!selected ? (
              <div className="text-center py-12 text-gray-400">
                <Zap className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Click pe o industrie pentru a vedea promptul de export.</p>
              </div>
            ) : (
              <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-gray-800 bg-gray-50 border border-gray-200 p-4 max-h-[600px] overflow-auto" data-testid="skeleton-prompt-content">
                {promptText}
              </pre>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 leading-relaxed border-l-2 border-blue-500 pl-3 italic">
        Conform <strong className="not-italic text-black">Prompt creeare program chat GPT.docx</strong> — nucleul EPD trebuie să servească
        drept schelet pentru orice produs nou. Pentru fiecare industrie, doar câmpurile/documentele/calculele/normele se schimbă; restul rămâne identic.
      </div>
    </AppShell>
  );
}
