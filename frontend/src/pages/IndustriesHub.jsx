import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  Flame, Zap, Radio, TrainFront, Building2, Sun, Droplets,
  Trash2, Wind, Leaf, Construction, Lightbulb, ArrowRight,
  CheckCircle2, Clock, Sparkles,
} from 'lucide-react';

// Mapping industry_id → icon + accent (the 12 from Feat-uri.docx + 1 extra)
const INDUSTRY_META = {
  gas_engineering: { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', order: 1, label_short: 'Gaze naturale' },
  electrical_engineering: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', order: 2, label_short: 'Electricitate' },
  telecom: { icon: Radio, color: 'text-sky-600', bg: 'bg-sky-50', order: 3, label_short: 'Telecomunicații' },
  railway_infra: { icon: TrainFront, color: 'text-slate-700', bg: 'bg-slate-100', order: 4, label_short: 'Feroviar' },
  civil_engineering: { icon: Building2, color: 'text-stone-700', bg: 'bg-stone-100', order: 5, label_short: 'Construcții civile' },
  photovoltaic: { icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50', order: 6, label_short: 'Fotovoltaice' },
  water_sewage: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', order: 7, label_short: 'Apă & canalizare' },
  sanitation: { icon: Trash2, color: 'text-green-700', bg: 'bg-green-50', order: 8, label_short: 'Salubritate' },
  hvac: { icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50', order: 9, label_short: 'HVAC' },
  environment: { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50', order: 10, label_short: 'Mediu & avize' },
  roads_bridges: { icon: Construction, color: 'text-zinc-700', bg: 'bg-zinc-100', order: 11, label_short: 'Drumuri & poduri' },
  public_lighting: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50', order: 12, label_short: 'Iluminat public' },
  construction: { icon: Building2, color: 'text-stone-700', bg: 'bg-stone-100', order: 13, label_short: 'Construcții imobile' },
};

export default function IndustriesHub() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/industries');
        // Sort by INDUSTRY_META.order
        const sorted = (data || []).sort((a, b) => {
          const oa = INDUSTRY_META[a.id]?.order || 99;
          const ob = INDUSTRY_META[b.id]?.order || 99;
          return oa - ob;
        });
        setIndustries(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalSubdomains = industries.reduce((acc, i) => acc + (i.subdomains?.length || 0), 0);
  const activeSubdomains = industries.reduce((acc, i) => acc + (i.subdomains?.filter((s) => s.active).length || 0), 0);

  return (
    <AppShell title="Industrii" subtitle="Cele 12 industrii susținute + 1 extensie (construcții imobile)">
      {/* Stats banner */}
      <div className="grid md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 mb-8">
        <div className="bg-white p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Industrii totale</div>
          <div className="text-3xl font-bold tracking-tight">{industries.length}</div>
        </div>
        <div className="bg-white p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Subdomenii active</div>
          <div className="text-3xl font-bold tracking-tight">{activeSubdomains}<span className="text-base text-gray-400">/{totalSubdomains}</span></div>
        </div>
        <div className="bg-white p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Planificate (roadmap)</div>
          <div className="text-3xl font-bold tracking-tight">158</div>
        </div>
        <div className="bg-white p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Templates DOCX</div>
          <div className="text-3xl font-bold tracking-tight">6<span className="text-base text-gray-400">/~430</span></div>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Se încarcă industriile…</div>}

      {/* Grid 12 industrii */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {industries.map((ind) => {
          const meta = INDUSTRY_META[ind.id] || { icon: Building2, color: 'text-gray-700', bg: 'bg-gray-50' };
          const Icon = meta.icon;
          const activeCount = ind.subdomains?.filter((s) => s.active).length || 0;
          const totalCount = ind.subdomains?.length || 0;
          const isFullyActive = ind.status === 'active' && activeCount === totalCount && totalCount > 0;

          return (
            <Link
              key={ind.id}
              to={`/industrii/${ind.id}`}
              data-testid={`industry-card-${ind.id}`}
              className="bg-white border border-gray-200 hover:border-black hover:shadow-md transition-all p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${meta.bg} ${meta.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1.5">
                  {isFullyActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-green-700 bg-green-50 px-2 py-1">
                      <CheckCircle2 className="w-3 h-3" /> Activă
                    </span>
                  ) : ind.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-amber-700 bg-amber-50 px-2 py-1">
                      <Sparkles className="w-3 h-3" /> Parțial
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-gray-600 bg-gray-100 px-2 py-1">
                      <Clock className="w-3 h-3" /> În curând
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-lg leading-tight mb-1">{ind.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{ind.tagline}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span className="font-mono font-semibold text-black">{activeCount}</span>/{totalCount} subdomenii
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Roadmap hint */}
      <div className="mt-10 bg-black text-white p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-[#FFB300] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-1">// Roadmap</div>
            <h3 className="text-xl font-semibold mb-2">158 subdomenii planificate pentru cele 12 industrii</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Vezi documentul complet de planificare în <span className="font-mono text-[#FFB300]">docs/INDUSTRIES_ROADMAP.md</span>.
              Industrii cu cele mai multe sub-subcategorii: Electrică (25), Apă & canalizare (23), Gaze (20).
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
