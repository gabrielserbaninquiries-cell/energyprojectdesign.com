import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
  Bot, Building2, Briefcase, Users, Award, Mail, Scale, HeartHandshake,
  Wrench, ArrowRight, Sparkles, Search,
} from 'lucide-react';

const FEATURE_HUB = [
  { id: 'seap', icon: Search, title: 'SEAP Alerts', desc: 'AI agent care alertează zilnic firmele despre licitații SEAP/SICAP relevante.', status: 'planned' },
  { id: 'ai-agents', icon: Bot, title: '4 AI Agents', desc: 'Producer / User / Client / Developer — asistenți inteligenți specializați.', status: 'skeleton' },
  { id: 'subscribers', icon: Users, title: 'Abonați & Contracte', desc: 'Bază clienți cu tarife chirii + contracte recurente + recomandări AI.', status: 'planned' },
  { id: 'jobs', icon: Briefcase, title: 'Job Opportunities', desc: 'Marketplace job-uri pentru proiectanți + match automat cu firme afiliate.', status: 'planned' },
  { id: 'reports', icon: Mail, title: 'Rapoarte automate', desc: 'Rapoarte lunare activitate + declarare automată venituri (fiscal).', status: 'planned' },
  { id: 'legal-automation', icon: Scale, title: 'Automatizare juridică', desc: 'Generare automată contracte + transmitere unități legale autorizate.', status: 'planned' },
  { id: 'partners', icon: Award, title: 'Parteneriate brand', desc: 'Merchandise + parteneri inspiraționali (spiritual & self-help).', status: 'planned' },
  { id: 'volunteering', icon: HeartHandshake, title: 'Voluntariat', desc: 'Cauze caritabile, proiecte comunitate, social impact.', status: 'planned' },
  { id: 'developer-plan', icon: Wrench, title: 'Developer Plan', desc: 'Pachet dezvoltatori pentru template-uri/funcții personalizate.', status: 'planned' },
  { id: 'community', icon: Building2, title: 'Comunitate', desc: 'Pagini industrii/infrastructură cu discuții, sondaje, anunțuri.', status: 'partial' },
];

const STATUS_LABELS = {
  active: { bg: 'bg-green-50', color: 'text-green-700', label: 'Activă' },
  partial: { bg: 'bg-amber-50', color: 'text-amber-700', label: 'Parțial' },
  skeleton: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Schelet' },
  planned: { bg: 'bg-gray-100', color: 'text-gray-600', label: 'Planificat' },
};

export default function FeaturesHub() {
  return (
    <AppShell title="Feat-uri (viziune extinsă)" subtitle="Module din viziunea completă, ca schelet pentru update-uri viitoare">
      <div className="bg-black text-white p-6 lg:p-8 mb-8">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-2">// Viziune extinsă</div>
            <h2 className="text-2xl font-semibold mb-2 leading-tight">10 module noi din Feat-uri.docx</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Aceste module au fost identificate în viziunea generală a platformei. Fiecare are o pagină de schelet în această sesiune; implementarea profundă se va face progresiv pe baza listei TO-DO.
            </p>
          </div>
          <div className="md:text-right">
            <Link to="/developer/progres" className="text-sm underline decoration-[#FFB300] underline-offset-4" data-testid="link-progres">Vezi progresul build →</Link>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURE_HUB.map((f) => {
          const Icon = f.icon;
          const status = STATUS_LABELS[f.status];
          return (
            <Link
              key={f.id}
              to={`/feat-uri/${f.id}`}
              data-testid={`feature-card-${f.id}`}
              className="bg-white border border-gray-200 hover:border-black hover:shadow-md transition-all p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-gray-100 text-gray-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <span className={`text-[10px] uppercase tracking-[0.15em] ${status.color} ${status.bg} px-2 py-1`}>
                  {status.label}
                </span>
              </div>
              <h3 className="font-semibold text-base leading-tight mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">{f.desc}</p>
              <div className="flex items-center justify-end text-xs text-gray-500 group-hover:text-black">
                Detalii <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-6">
          <Sparkles className="w-5 h-5 text-[#FFB300] mb-3" />
          <h3 className="font-semibold mb-2">De ce schelet și nu implementare profundă?</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pentru a permite iterații rapide pe baza feedback-ului real, aplicăm un model <strong>structură de bază → implementare progresivă</strong>. Fiecare modul are: rută definită, layout vizibil, status etichetat, listă de îmbunătățiri planificate.
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-6">
          <Search className="w-5 h-5 text-gray-700 mb-3" />
          <h3 className="font-semibold mb-2">Listele de planificare</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Modulele de mai sus sunt sincronizate cu listele din <span className="font-mono">/app/memory/</span>:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>📋 LIST_1_TODO.md — execuție strictă</li>
            <li>💡 LIST_2_SUGGESTED.md — îmbunătățiri pe structura existentă</li>
            <li>🚀 LIST_3_FUTURISTIC.md — opt-in only</li>
            <li>🔍 LIST_4_BIG_UPDATE_WEB_RESEARCH.md — opt-in only</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
