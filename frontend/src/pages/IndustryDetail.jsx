import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  Flame, Zap, Radio, TrainFront, Building2, Sun, Droplets,
  Trash2, Wind, Leaf, Construction, Lightbulb, ArrowLeft,
  CheckCircle2, Clock, FileText, Calculator, ShieldCheck, BookOpen, Plus,
} from 'lucide-react';
import { toast } from 'sonner';

const INDUSTRY_META = {
  gas_engineering: { icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
  electrical_engineering: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  telecom: { icon: Radio, color: 'text-sky-600', bg: 'bg-sky-50' },
  railway_infra: { icon: TrainFront, color: 'text-slate-700', bg: 'bg-slate-100' },
  civil_engineering: { icon: Building2, color: 'text-stone-700', bg: 'bg-stone-100' },
  photovoltaic: { icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  water_sewage: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
  sanitation: { icon: Trash2, color: 'text-green-700', bg: 'bg-green-50' },
  hvac: { icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  environment: { icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  roads_bridges: { icon: Construction, color: 'text-zinc-700', bg: 'bg-zinc-100' },
  public_lighting: { icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  construction: { icon: Building2, color: 'text-stone-700', bg: 'bg-stone-100' },
};

export default function IndustryDetail() {
  const { industryId } = useParams();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: industries }, { data: tpls }] = await Promise.all([
          api.get('/industries'),
          api.get('/system-templates', { params: { industry: industryId } }).catch(() => ({ data: [] })),
        ]);
        const found = (industries || []).find((i) => i.id === industryId);
        setIndustry(found || null);
        setTemplates(tpls || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [industryId]);

  if (loading) {
    return <AppShell title="Industrie" subtitle="Se încarcă…"><div className="text-sm text-gray-500">Se încarcă industria…</div></AppShell>;
  }

  if (!industry) {
    return (
      <AppShell title="Industrie negăsită" subtitle="Vezi lista completă de industrii">
        <Link to="/industrii" className="text-sm text-black hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Înapoi la Industrii
        </Link>
      </AppShell>
    );
  }

  const meta = INDUSTRY_META[industry.id] || { icon: Building2, color: 'text-gray-700', bg: 'bg-gray-50' };
  const Icon = meta.icon;
  const activeCount = industry.subdomains?.filter((s) => s.active).length || 0;
  const totalCount = industry.subdomains?.length || 0;

  async function startProjectInSubdomain(sd) {
    if (!sd.active) {
      toast.error('Acest subdomeniu nu este încă activ.');
      return;
    }
    try {
      const { data } = await api.post('/projects', {
        name: `Proiect ${industry.name} · ${sd.name}`,
        description: sd.description || '',
        industry: industry.id,
        subdomain: sd.id,
      });
      toast.success('Proiect creat. Activează-l din /proiecte sau continuă.');
      navigate('/proiecte');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare la creare proiect');
    }
  }

  return (
    <AppShell title={industry.name} subtitle={industry.tagline}>
      <Link to="/industrii" className="text-xs text-gray-500 hover:text-black inline-flex items-center gap-1 mb-6" data-testid="back-to-industries">
        <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la toate industriile
      </Link>

      {/* Hero header */}
      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className={`w-16 h-16 ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}>
            <Icon className="w-8 h-8" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold tracking-tight">{industry.name}</h2>
              {industry.status === 'active' ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-green-700 bg-green-50 px-2 py-1">
                  <CheckCircle2 className="w-3 h-3" /> Activă
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-gray-600 bg-gray-100 px-2 py-1">
                  <Clock className="w-3 h-3" /> În curând
                </span>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">{industry.tagline}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="px-3 py-1.5 bg-gray-100 font-mono">{activeCount}/{totalCount} subdomenii active</div>
              <div className="px-3 py-1.5 bg-gray-100 font-mono">{templates.length} template-uri sistem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subdomenii list */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg font-semibold tracking-tight">Subdomenii ({totalCount})</h3>
          <Link to="/proiecte" className="text-xs text-gray-500 hover:text-black">Vezi proiectele mele →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(industry.subdomains || []).map((sd) => (
            <div key={sd.id} className={`bg-white border ${sd.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50'} p-5`}>
              <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{sd.name}</div>
                {sd.active ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{sd.description || 'Descriere în curs de adăugare.'}</p>
              <button
                onClick={() => startProjectInSubdomain(sd)}
                disabled={!sd.active}
                className={`text-xs flex items-center gap-1 px-3 py-1.5 ${sd.active ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                data-testid={`start-${sd.id}`}
              >
                <Plus className="w-3 h-3" /> Pornește un proiect
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Resources blocks (skeleton) */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Resurse industrie</h3>
        <div className="grid md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          <div className="bg-white p-6">
            <FileText className="w-6 h-6 mb-3 text-gray-700" />
            <div className="font-semibold mb-1">Template-uri DOCX</div>
            <p className="text-xs text-gray-600 mb-3">{templates.length} template-uri disponibile pentru această industrie.</p>
            <Link to="/templates" className="text-xs text-black hover:underline">Vezi în Șabloane →</Link>
          </div>
          <div className="bg-white p-6">
            <Calculator className="w-6 h-6 mb-3 text-gray-700" />
            <div className="font-semibold mb-1">Formule de calcul</div>
            <p className="text-xs text-gray-600 mb-3">Calcule specifice industriei (debit, presiune, dimensionare).</p>
            <Link to="/calcul" className="text-xs text-black hover:underline">Calcul inteligent →</Link>
          </div>
          <div className="bg-white p-6">
            <ShieldCheck className="w-6 h-6 mb-3 text-gray-700" />
            <div className="font-semibold mb-1">Cadru legal</div>
            <p className="text-xs text-gray-600 mb-3">Norme aplicabile, autorizații necesare per industrie.</p>
            <span className="text-xs text-gray-400">În construcție</span>
          </div>
        </div>
      </section>

      {/* Future improvements */}
      <section>
        <div className="bg-amber-50 border-l-4 border-[#FFB300] p-5">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Următoarele update-uri pentru această industrie</div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Această pagină este <strong>schelet inițial</strong>. Update-urile viitoare vor include: sub-subcategorii detaliate, template-uri DOCX dedicate, formule de calcul specifice, listă avize/autorizații, mapping recipienți email.
                Vezi <span className="font-mono">/app/docs/INDUSTRIES_ROADMAP.md</span> pentru roadmap-ul complet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
