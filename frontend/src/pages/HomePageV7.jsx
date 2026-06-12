/**
 * HomePage V7.0 — Ecosystem Hub
 *
 * Redesign complet "high-end" cerut explicit de user. Restructurează landing-ul
 * în 5 ecosisteme distincte cu cards mari, gradient subtle, hover animații:
 *   1. Documentație Electronică Industrii (gaze + electric + apă-canal + alte)
 *   2. Marketplace (vânzări ad-hoc)
 *   3. Anunțuri Imobiliare
 *   4. Forum + Grup Anunțuri
 *   5. Servicii (Meseriași + Logistică + Transport)
 *
 * Plus: hero cu live counters, smart-pricing CTA, testimonials placeholder.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  FileText, ShoppingBag, Home, MessageSquare, Truck, Calculator,
  ArrowRight, Sparkles, ShieldCheck, Globe, Zap, Wrench, Package, BookOpen,
} from 'lucide-react';

const ECOSYSTEMS = [
  {
    id: 'documentatie',
    title: 'Documentație Tehnică Electronică',
    subtitle: 'Industrii reglementate',
    description: 'Generare automată DOCX legal pentru branșamente gaze, electric, apă-canal. 179 câmpuri unice → 23+ documente. Semnătură QES integrată.',
    cta: 'Începe proiectul',
    link: '/documentatie-industrii',
    icon: FileText,
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
    accent: 'border-blue-500',
    badge: '23+ template-uri legale',
    testId: 'eco-documentatie',
  },
  {
    id: 'marketplace',
    title: 'Marketplace ad-hoc',
    subtitle: 'Vânzări produse + servicii',
    description: 'Țeavă PE rămasă, echipament second-hand, ștampile/template DOCX, servicii proiectare. 7 categorii, plata directă, fără intermediari.',
    cta: 'Explorează anunțuri',
    link: '/marketplace',
    icon: ShoppingBag,
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    accent: 'border-amber-500',
    badge: '7 categorii',
    testId: 'eco-marketplace',
  },
  {
    id: 'imobiliare',
    title: 'Anunțuri Imobiliare',
    subtitle: 'Vânzare · Închiriere · Regim hotelier',
    description: 'Platformă completă: apartamente, case, terenuri, comercial. Filtre avansate, calculator credit, tour virtual, contact direct.',
    cta: 'Vezi proprietăți',
    link: '/imobiliare',
    icon: Home,
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    accent: 'border-emerald-500',
    badge: '5 tipuri proprietate',
    testId: 'eco-imobiliare',
  },
  {
    id: 'forum',
    title: 'Forum + Grup Anunțuri',
    subtitle: 'Discuții tehnice + colaborări',
    description: 'Întrebări tehnice, studii de caz, legislație, anunțuri muncă, cursuri și evenimente. Sistem best-answer + like.',
    cta: 'Intră în comunitate',
    link: '/forum',
    icon: MessageSquare,
    gradient: 'from-violet-600 via-purple-700 to-fuchsia-800',
    accent: 'border-violet-500',
    badge: '7 categorii',
    testId: 'eco-forum',
  },
  {
    id: 'servicii',
    title: 'Servicii + Transport',
    subtitle: 'Meseriași · Mutări · Logistică',
    description: 'Instalatori autorizați ANRE, electricieni, sudori, dirigenți șantier, dulgheri. Plus: mutări mobilier, transport materiale, curierat.',
    cta: 'Găsește meseriași',
    link: '/servicii',
    icon: Wrench,
    gradient: 'from-rose-600 via-pink-700 to-red-800',
    accent: 'border-rose-500',
    badge: '15 specializări',
    testId: 'eco-servicii',
  },
];

function CountCard({ icon: Icon, label, value, hint, color }) {
  return (
    <div className={`border-2 ${color} bg-white p-4`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500">
        <Icon className="w-3 h-3" />{label}
      </div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      <div className="text-[11px] text-gray-500 mt-1">{hint}</div>
    </div>
  );
}

export default function HomePageV7() {
  const [stats, setStats] = useState({
    fields: '179+', templates: '34+', industries: '13', users: '—',
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/placeholders/registry');
        setStats((s) => ({ ...s, fields: `${data.fields.length}+` }));
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  return (
    <AppShell title="Energy Project Design" subtitle="Ecosistemul tehnic complet · Documentație + Servicii + Marketplace">
      {/* Hero */}
      <section className="mb-10 relative overflow-hidden border-2 border-black bg-gradient-to-br from-zinc-900 via-slate-900 to-black text-white" data-testid="home-hero">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.3) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative p-10 md:p-14">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] bg-white/10 backdrop-blur px-3 py-1 mb-6">
            <Sparkles className="w-3 h-3" /> Platforma high-end · V7.0
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Documentație tehnică digitală<br />
            <span className="text-amber-400">+ Ecosistem complet de servicii.</span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-3xl mb-8">
            Singura platformă din lume care unește generarea automată de documentație tehnică legală
            (gaze, electric, apă-canal) cu marketplace, imobiliare, forum și servicii (meseriași + transport).
            Înregistrezi date <em className="text-amber-400 not-italic">o singură dată</em> → propagare în toate documentele.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/gaze-naturale" data-testid="hero-cta-gaze" className="inline-flex items-center gap-2 bg-amber-500 text-black px-5 py-2.5 text-sm font-semibold hover:bg-amber-400">
              Începe proiect gaze <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/smart-pricing" data-testid="hero-cta-pricing" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur border border-white/20">
              <Calculator className="w-4 h-4" /> Calculator costuri instant
            </Link>
            <Link to="/marketplace" data-testid="hero-cta-marketplace" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-semibold backdrop-blur border border-white/20">
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10" data-testid="home-stats">
        <CountCard icon={FileText} label="Câmpuri unice" value={stats.fields} hint="propagate în 23+ documente legale" color="border-blue-500" />
        <CountCard icon={ShieldCheck} label="Template DOCX" value={stats.templates} hint="Gaze · Electric · Apă-canal" color="border-emerald-500" />
        <CountCard icon={Globe} label="Industrii" value={stats.industries} hint="3 concrete + 10 schelete" color="border-violet-500" />
        <CountCard icon={Zap} label="Pricing automat" value="5 factori" hint="județ · urgență · cerere · rating · complexitate" color="border-amber-500" />
      </section>

      {/* 5 Ecosystems */}
      <section className="mb-10" data-testid="home-ecosystems">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">5 ecosisteme. O singură platformă.</h2>
            <p className="text-sm text-gray-500">Alege ce te interesează — toate sunt integrate prin smart-pricing și conturi unice.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECOSYSTEMS.map((e) => {
            const Icon = e.icon;
            return (
              <Link key={e.id} to={e.link} data-testid={e.testId}
                className={`group relative overflow-hidden border-2 ${e.accent} bg-white hover:shadow-2xl transition-all duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${e.gradient} opacity-95`} />
                <div className="relative p-6 md:p-8 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <span className="text-[10px] uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-1">{e.badge}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{e.subtitle}</div>
                  <h3 className="text-2xl font-bold mb-3 leading-tight">{e.title}</h3>
                  <p className="text-sm opacity-90 mb-5 leading-relaxed">{e.description}</p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold border-b border-white/40 pb-1 group-hover:border-white transition">
                    {e.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Smart Pricing inline preview */}
      <section className="mb-10 border-2 border-amber-500 bg-amber-50 p-6" data-testid="home-pricing-cta">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500 text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-700">Smart Pricing Engine</div>
              <h3 className="text-xl font-bold">Cost recomandat în 3 secunde</h3>
              <p className="text-sm text-gray-600 mt-1">Pentru 25+ servicii (documentație, execuție, meseriași, transport). Recalculează automat după județ, urgență și rating provider.</p>
            </div>
          </div>
          <Link to="/smart-pricing" data-testid="home-pricing-btn" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800">
            Calculează acum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer info */}
      <section className="border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-500">
        <div>
          <div className="font-semibold text-black mb-2 uppercase tracking-wider text-[10px]">🇷🇴 Conformitate legală</div>
          NTPEE 2018 · Legea 10/1995 · HG 273/1994 · HG 766/1997 · Ord. ANRE 89/2018 · L 50/1991 · L 123/2012
        </div>
        <div>
          <div className="font-semibold text-black mb-2 uppercase tracking-wider text-[10px]">🌍 Acoperire viitoare</div>
          Acum: RO (gaze + electric + apă-canal). În roadmap: EN, DE, FR · 13 industrii · API public B2B · Mobile PWA.
        </div>
        <div>
          <div className="font-semibold text-black mb-2 uppercase tracking-wider text-[10px]">🔒 Securitate enterprise</div>
          Chei API write-only · GDPR · ISO 27001 ready · Audit trail complet · Versioning documente · 2FA opțional.
        </div>
      </section>
    </AppShell>
  );
}
