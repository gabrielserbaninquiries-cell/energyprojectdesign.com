/**
 * HomePageV7 — Hub Ecosistem (Swiss/Brutalist + Orange accent).
 * Conform /app/design_guidelines.json: monochromatic + Cabinet Grotesk + Mono labels.
 */
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  FileText, ShoppingBag, Home, MessageSquare, Wrench, Calculator,
  ArrowUpRight, Sparkles, ShieldCheck, Globe, Zap,
} from 'lucide-react';

const ECOSYSTEMS = [
  { id: 'documentatie', title: 'Documentație Tehnică Electronică', subtitle: 'Industrii reglementate',
    description: 'Generare automată DOCX legal pentru branșamente gaze, electric, apă-canal. 179 câmpuri unice → 23+ documente. Semnătură QES integrată.',
    cta: 'Începe proiectul', link: '/documentatie-industrii', icon: FileText, badge: '23+ template-uri legale', testId: 'eco-documentatie' },
  { id: 'marketplace', title: 'Marketplace ad-hoc', subtitle: 'Vânzări produse + servicii',
    description: 'Țeavă PE rămasă, echipament second-hand, ștampile/template DOCX, servicii proiectare. 7 categorii, plata directă, fără intermediari.',
    cta: 'Explorează anunțuri', link: '/marketplace', icon: ShoppingBag, badge: '7 categorii', testId: 'eco-marketplace' },
  { id: 'imobiliare', title: 'Anunțuri Imobiliare', subtitle: 'Vânzare · Închiriere · Regim hotelier',
    description: 'Platformă completă: apartamente, case, terenuri, comercial. Filtre avansate, calculator credit, tour virtual, contact direct.',
    cta: 'Vezi proprietăți', link: '/imobiliare', icon: Home, badge: '5 tipuri proprietate', testId: 'eco-imobiliare' },
  { id: 'forum', title: 'Forum + Grup Anunțuri', subtitle: 'Discuții tehnice + colaborări',
    description: 'Întrebări tehnice, studii de caz, legislație, anunțuri muncă, cursuri și evenimente. Sistem best-answer + like.',
    cta: 'Intră în comunitate', link: '/forum-v7', icon: MessageSquare, badge: '7 categorii', testId: 'eco-forum' },
  { id: 'servicii', title: 'Servicii + Transport', subtitle: 'Meseriași · Mutări · Logistică',
    description: 'Instalatori autorizați ANRE, electricieni, sudori, dirigenți șantier, dulgheri. Plus: mutări mobilier, transport materiale, curierat.',
    cta: 'Găsește meseriași', link: '/servicii', icon: Wrench, badge: '15 specializări', testId: 'eco-servicii' },
];

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="border border-zinc-200 bg-white p-5 hover:border-orange-500 transition-colors rounded-lg">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <Icon className="w-3 h-3" />{label}
      </div>
      <div className="text-3xl font-bold mt-2 tracking-tighter text-zinc-950">{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{hint}</div>
    </div>
  );
}

export default function HomePageV7() {
  const [stats, setStats] = useState({ fields: '179+', templates: '34+', industries: '13' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/placeholders/registry');
        if (!cancelled) setStats((s) => ({ ...s, fields: `${data.fields.length}+` }));
      } catch {
        /* keep defaults */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell title="Energy Project Design" subtitle="Ecosistemul tehnic complet · Documentație + Servicii + Marketplace">

      {/* HERO — Swiss Brutalist mono with single orange accent */}
      <section className="mb-12 relative overflow-hidden bg-zinc-950 text-white rounded-lg" data-testid="home-hero">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none" />
        <div className="relative px-8 md:px-14 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] border border-white/20 px-3 py-1.5 mb-8 bg-white/5 backdrop-blur">
            <Sparkles className="w-3 h-3 text-orange-400" /> Platforma high-end · V7.1
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] mb-6 max-w-5xl">
            Documentație tehnică digitală.<br />
            <span className="text-orange-500">Ecosistem complet de servicii.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-300 max-w-3xl mb-10 leading-relaxed">
            Singura platformă din lume care unește generarea automată de documentație tehnică legală
            (gaze, electric, apă-canal) cu marketplace, imobiliare, forum și servicii (meseriași + transport).
            Înregistrezi date <em className="not-italic text-orange-400 border-b border-orange-500/40">o singură dată</em> → propagare în 23+ documente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/gaze-naturale" data-testid="hero-cta-gaze"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors rounded-md">
              Începe proiect gaze <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link to="/smart-pricing" data-testid="hero-cta-pricing"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white px-5 py-3 text-sm font-semibold transition-colors rounded-md">
              <Calculator className="w-4 h-4" /> Calculator costuri instant
            </Link>
            <Link to="/marketplace" data-testid="hero-cta-marketplace"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white px-5 py-3 text-sm font-semibold transition-colors rounded-md">
              <ShoppingBag className="w-4 h-4" /> Marketplace
            </Link>
          </div>

          {/* Trust signals - glassmorphism */}
          <div className="mt-12 flex flex-wrap gap-2">
            {['NTPEE 2018', 'Legea 10/1995', 'HG 273/1994', 'Ord. ANRE 89/2018', 'L 50/1991', 'GDPR'].map((badge) => (
              <span key={badge} className="text-[10px] font-mono uppercase tracking-wider bg-white/10 backdrop-blur border border-white/20 px-2.5 py-1 rounded">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12" data-testid="home-stats">
        <Stat icon={FileText} label="Câmpuri unice" value={stats.fields} hint="propagate în 23+ documente legale" />
        <Stat icon={ShieldCheck} label="Template DOCX" value={stats.templates} hint="Gaze · Electric · Apă-canal" />
        <Stat icon={Globe} label="Industrii planificate" value={stats.industries} hint="3 concrete + 10 schelete" />
        <Stat icon={Zap} label="Pricing engine" value="5 factori" hint="județ · urgență · cerere · rating · complexitate" />
      </section>

      {/* 5 Ecosystems - Bento Grid Swiss */}
      <section className="mb-12" data-testid="home-ecosystems">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">— 5 module · o singură platformă</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">Alege ecosistemul</h2>
          </div>
        </div>

        {/* Bento: 12 cols. First card (Documentatie) is 2x large; restul 4 sunt în grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {ECOSYSTEMS.map((e, idx) => {
            const Icon = e.icon;
            const span = idx === 0 ? 'md:col-span-6 md:row-span-2' : 'md:col-span-3';
            return (
              <Link key={e.id} to={e.link} data-testid={e.testId}
                className={`group relative ${span} border border-zinc-200 bg-white hover:border-orange-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 rounded-lg overflow-hidden`}>
                <div className="p-7 md:p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 flex items-center justify-center border border-zinc-200 group-hover:border-orange-500 group-hover:bg-orange-50 transition-colors rounded">
                      <Icon className="w-5 h-5 text-zinc-950 group-hover:text-orange-600 transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">{e.badge}</span>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-2">{e.subtitle}</div>
                  <h3 className={`font-bold tracking-tight text-zinc-950 mb-3 leading-tight ${idx === 0 ? 'text-3xl md:text-4xl' : 'text-xl'}`}>{e.title}</h3>
                  <p className={`text-sm text-zinc-600 leading-relaxed flex-1 ${idx === 0 ? 'md:text-base' : ''}`}>{e.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 group-hover:text-orange-600 transition-colors">
                    {e.cta}
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Smart Pricing CTA — orange band */}
      <section className="mb-12 border border-zinc-200 bg-zinc-50 rounded-lg overflow-hidden" data-testid="home-pricing-cta">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-7 md:p-10">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 flex items-center justify-center bg-orange-600 rounded">
              <Calculator className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-1">Smart Pricing Engine</div>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-950">Cost recomandat în 3 secunde</h3>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed max-w-2xl">
                Pentru 25+ servicii (documentație, execuție, meseriași, transport). Recalculează automat după județ,
                urgență, complexitate, rating provider și cerere/ofertă.
              </p>
            </div>
          </div>
          <Link to="/smart-pricing" data-testid="home-pricing-btn"
            className="inline-flex items-center gap-2 bg-zinc-950 text-white px-5 py-3 text-sm font-semibold hover:bg-orange-600 transition-colors rounded-md whitespace-nowrap">
            Calculează acum <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer info trio */}
      <section className="border-t border-zinc-200 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm" data-testid="home-footer-info">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-3">Conformitate legală</div>
          <div className="text-zinc-600 leading-relaxed">
            NTPEE 2018 · Legea 10/1995 · HG 273/1994 · HG 766/1997 · Ord. ANRE 89/2018 · L 50/1991 · L 123/2012
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-3">Acoperire viitoare</div>
          <div className="text-zinc-600 leading-relaxed">
            Acum: RO (gaze + electric + apă-canal). În roadmap: EN, DE, FR · 13 industrii · API public B2B · Mobile PWA.
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-3">Securitate enterprise</div>
          <div className="text-zinc-600 leading-relaxed">
            Chei API write-only · GDPR · ISO 27001 ready · Audit trail complet · Versioning documente · 2FA opțional.
          </div>
        </div>
      </section>
    </AppShell>
  );
}
