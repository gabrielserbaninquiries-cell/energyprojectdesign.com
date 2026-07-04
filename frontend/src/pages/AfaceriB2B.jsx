/**
 * Afaceri B2B — Pagină dedicată pentru afilierile Business-to-Business (V13.7).
 *
 * Cerință explicită user (Feb 2026):
 *   "SI ACEEA AR TREBUI SA FIE SUBPAGINA IN INTERFATA DE SUS A PAGINII!"
 *   (referitor la Afilieri Business-to-Business)
 *
 * Stil: aliniat exact la editorial EPD (zinc-950 mono + accent violet, ultra-compact).
 */
import { Link } from 'react-router-dom';
import {
  Handshake, TrendingUp, Users, ShieldCheck, ArrowRight, Layers,
  Briefcase, Globe, Check, LineChart,
} from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import GlobalTranslator from '../components/GlobalTranslator';
import useSEO from '../hooks/useSEO';

const PILLARS = [
  {
    icon: Handshake,
    title: 'Rețea deschisă de parteneri',
    desc: 'Producători, distribuitori, executanți, verificatori, consultanți — un singur registru unificat cu profile complete, contracte-șablon și scoring transparent.',
  },
  {
    icon: LineChart,
    title: 'Comisioane transparente',
    desc: 'Tarifele de intermediere și marja de platformă sunt publicate deschis. Fiecare tranzacție are traseul contabil vizibil pentru ambii parteneri.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificare + Audit',
    desc: 'CUI, ONRC, ANAF, ISU, sancțiuni ANRE — validate automat. Fiecare partener e reverificat semestrial cu raport public.',
  },
  {
    icon: Layers,
    title: 'Contracte-șablon eIDAS',
    desc: 'NDA, contract prestări servicii, revânzare, franciză, joint-venture — semnate cu semnătură calificată QES în platformă.',
  },
];

const CATEGORIES = [
  { label: 'Producători materiale',           count: '150+', desc: 'Țevi PE/oțel, fitinguri, contoare, regulatoare, izolații' },
  { label: 'Distribuitori regionali',         count: '80+',  desc: 'Depozite județene, stocuri live, cross-docking' },
  { label: 'Executanți & Instalatori',        count: '400+', desc: 'Autorizați ANRE, RTE, VGD, cu portofoliu verificat' },
  { label: 'Verificatori proiecte',           count: '120+', desc: 'MC/E, GN, El, IE, IS — validare cu QES eIDAS' },
  { label: 'Firme de proiectare',             count: '250+', desc: 'DTAC, PTh, DDE — multi-industrii' },
  { label: 'Consultanți & Auditori',          count: '90+',  desc: 'Energie, siguranță, conformitate, ESG' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Aplici', desc: 'Trimiți profilul companiei — verificat automat via ANAF/ONRC în <2 min.' },
  { step: '02', title: 'Semnezi', desc: 'Contract-cadru + politică de comisioane, cu semnătură eIDAS QES.' },
  { step: '03', title: 'Publici', desc: 'Ofertele tale devin vizibile în catalogul EPD, cu tag „Verificat".' },
  { step: '04', title: 'Vinzi', desc: 'Primești comenzi direct din platformă. Plata + factura sunt integrate.' },
];

export default function AfaceriB2B() {
  useSEO({
    title: 'Afaceri B2B · Rețea parteneri verificați · Energy Project Design',
    description: 'Rețea B2B verificată — producători, distribuitori, executanți, verificatori și consultanți pentru documentație tehnică și proiecte energetice. Comisioane transparente, contracte eIDAS QES, audit semestrial.',
    canonical: 'https://www.energyprojectdesign.com/afaceri-b2b',
    keywords: 'afaceri B2B, parteneriate business, network furnizori, distribuitori materiale gaze, executanți ANRE, verificatori QES, comisioane transparente, contracte eIDAS',
    breadcrumbs: [{ name: 'Acasă', url: '/' }, { name: 'Afaceri B2B', url: '/afaceri-b2b' }],
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900" data-testid="page-afaceri-b2b">
      {/* Header identic cu Landing */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0"><EPDLogo /></Link>
          <div className="hidden xl:flex items-center gap-5 text-[13px] font-medium">
            <Link to="/" className="text-zinc-600 hover:text-zinc-950">Acasă</Link>
            <Link to="/gaze-naturale" className="text-zinc-600 hover:text-zinc-950">Gaze Naturale</Link>
            <Link to="/pricing" className="text-zinc-600 hover:text-zinc-950">Tarife</Link>
            <span className="text-zinc-950 font-semibold">Afaceri B2B</span>
            <Link to="/contact" className="text-zinc-600 hover:text-zinc-950">Contact</Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <GlobalTranslator variant="light" />
            <Link to="/auth?mode=signup&next=b2b" className="epd-btn text-sm py-2 whitespace-nowrap" data-testid="b2b-cta-signup">Aplică ca partener</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-20 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(124,58,237,0.20) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(76,29,149,0.15) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-violet-500/40 rounded-full text-[10px] uppercase tracking-[0.25em] text-violet-300 mb-5 backdrop-blur-sm bg-violet-500/5">
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                <span>// Afilieri Business-to-Business</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02] mb-4 text-white font-display">
                Un singur registru.<br/>
                <span className="italic text-violet-400 font-normal">Toți partenerii.</span>
              </h1>
              <p className="text-base lg:text-lg text-zinc-300 leading-relaxed mb-6 max-w-xl">
                Rețea B2B verificată pentru producători, distribuitori, executanți autorizați ANRE,
                verificatori RTE/VGD și consultanți. Comisioane transparente, contracte cu semnătură
                electronică calificată, audit semestrial obligatoriu.
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link to="/auth?mode=signup&next=b2b" className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-violet-50 font-semibold px-5 py-2.5 rounded-md text-sm transition-all hover:-translate-y-0.5 shadow-xl" data-testid="hero-cta-apply">
                  <Handshake className="w-4 h-4" />
                  Aplică ca partener
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 text-white border border-white/25 hover:border-violet-400 hover:text-violet-300 px-4 py-2.5 rounded-md backdrop-blur-sm transition-all text-sm font-medium" data-testid="hero-cta-contact">
                  Discută cu echipa
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-4 gap-4">
                {[
                  { v: '1090+', l: 'Parteneri verificați' },
                  { v: '0-2%',  l: 'Comision platformă' },
                  { v: 'QES',   l: 'Semnătură eIDAS' },
                  { v: 'S1+S2', l: 'Audit / an' },
                ].map(s => (
                  <div key={s.l} className="border-l-2 border-violet-500/40 pl-2.5">
                    <div className="text-xl lg:text-2xl font-bold tracking-tighter text-white tabular-nums font-display">{s.v}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-semibold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-md overflow-hidden aspect-[4/3] bg-zinc-900 ring-1 ring-violet-500/30 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=85&auto=format&fit=crop"
                alt="Parteneriat B2B — strângere de mână peste contract"
                loading="eager"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-semibold mb-2">// contract semnat eIDAS</div>
                <div className="text-white font-semibold text-sm">Producător · Distribuitor · Executant · Verificator</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CE OFERIM */}
      <section className="py-14 lg:py-20 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// pilonii rețelei B2B</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Patru principii,<br/><span className="italic text-zinc-400 font-normal">o singură platformă.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="border border-zinc-200 hover:border-zinc-950 rounded-md p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg group" data-testid={`b2b-pillar-${p.title.slice(0,10)}`}>
                  <Icon className="w-6 h-6 text-zinc-950 mb-4" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold tracking-tight text-zinc-950 mb-2">{p.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORII */}
      <section className="py-14 lg:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// categorii de parteneri</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Fiecare rol are un loc.<br/><span className="italic text-zinc-400 font-normal">Fiecare partener are un contract.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.label} className="border border-zinc-200 hover:border-zinc-950 bg-white rounded-md p-5 transition-all" data-testid={`b2b-cat-${c.label.slice(0,10)}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-sm font-bold text-zinc-950 tracking-tight">{c.label}</h3>
                  <div className="text-2xl font-bold tabular-nums text-zinc-950 font-display tracking-tighter">{c.count}</div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUM FUNCȚIONEAZĂ */}
      <section className="py-14 lg:py-20 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// cum funcționează</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Patru pași.<br/><span className="italic text-zinc-400 font-normal">Sub 15 minute.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="border-l-2 border-zinc-950 pl-5 py-1" data-testid={`b2b-step-${s.step}`}>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold mb-2">Pas {s.step}</div>
                <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2 font-display">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 lg:py-20 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-violet-400 font-bold mb-4">// devino partener</div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.02] mb-6 font-display">
            Rețeaua se construiește <span className="italic text-zinc-400 font-normal">împreună.</span>
          </h2>
          <p className="text-base lg:text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Aplicația durează sub 5 minute. Verificarea CUI + ONRC se face automat. Semnezi contractul-cadru cu QES eIDAS și
            ești vizibil în catalog în aceeași zi.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link to="/auth?mode=signup&next=b2b" className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-violet-50 font-semibold px-6 py-3 rounded-md text-sm transition-all hover:-translate-y-0.5 shadow-xl" data-testid="footer-cta-apply">
              <Handshake className="w-4 h-4" />
              Aplică ca partener
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a href="mailto:parteneri@energyprojectdesign.com" className="inline-flex items-center gap-2 border border-white/25 hover:border-violet-400 hover:text-violet-300 px-5 py-3 rounded-md backdrop-blur-sm transition-all text-sm font-medium" data-testid="footer-cta-email">
              parteneri@energyprojectdesign.com
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
