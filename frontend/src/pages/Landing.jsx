/**
 * Landing — EPD Official Identity (post-rebranding, V9.0)
 *
 * Schimbări față de versiunile anterioare:
 * - Branding 100% conform logo oficial Energy Project Design SRL (gradient violet→navy)
 * - Tagline oficial "Redesigning projects." + sub-tagline "The Architects of Future Global Technology"
 * - PRODUS PRINCIPAL = Gaze Naturale (în hero, deasupra tuturor)
 * - Restul serviciilor (electric, fotovoltaice, marketplace, imobiliare, etc.) listate inteligent dedesubt
 * - 22 servicii roadmap global păstrate
 * - Cover photos oficiale EPD din pagina Facebook
 * - NU se elimină nimic din construit anterior — se îmbogățește vizual
 */
import { Link } from 'react-router-dom';
import {
  Flame, FileText, Stamp, ShieldCheck, Mail, Check, ArrowRight, Sparkles,
  Briefcase, Building2, Store, MessageSquare, Hammer, Truck, BadgeCheck,
  Users, Wrench, Receipt, Sun, Zap, Droplet, Phone, Calculator, Package,
  Globe, TrendingUp, FileSignature, Layers, Factory, ShoppingBag,
  Leaf, HeartPulse, Heart, Church, Bus, PackageOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BRAND, BRAND_ASSETS } from '../lib/brand';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import GlobalTranslator from '../components/GlobalTranslator';
import PublicPlansGrid from '../components/PublicPlansGrid';
import { FUTURE_SERVICES, NEXT_GEN_MISSIONS, EPD_ECOSYSTEM } from '../data/services';
import useSEO from '../hooks/useSEO';

// PRODUS PRINCIPAL — Gaze Naturale (livrabil 100% operațional)
const MAIN_PRODUCT_HIGHLIGHTS = [
  { icon: Calculator,    label: 'Calcule Renouard',       value: 'multi-tronson' },
  { icon: Package,       label: 'Listă materiale Anexa 13', value: 'auto-select' },
  { icon: Stamp,         label: 'Ștampile + semnătură',    value: 'drag & drop' },
  { icon: FileSignature, label: 'Semnătură electronică',   value: 'QES eIDAS' },
];

// Servicii integrate ACTIVE (în platformă) — V11.0 cu imagini reale Unsplash + gradient fallback per industrie
const ACTIVE_SERVICES = [
  { id: 'gas',         icon: Flame,         title: 'Gaze Naturale',         desc: 'Proiect tehnic complet conform NTPEE 2018 + ANRE', tag: 'CORE', href: '/gaze-naturale',
    image: 'https://images.unsplash.com/photo-1773186704394-919b2aa3179a?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-500 via-red-500 to-rose-600' },
  { id: 'electric',    icon: Zap,           title: 'Electric',              desc: 'Proiectare instalații electrice conform ANRE',    tag: 'BETA', href: '/industrii/electric',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-400 via-violet-500 to-violet-600' },
  { id: 'apa-canal',   icon: Droplet,       title: 'Apă-Canal',             desc: 'Branșament și racord apă potabilă & canalizare',  tag: 'BETA', href: '/industrii/apa-canal',
    image: 'https://images.unsplash.com/photo-1693907986952-3cd372e4c9d8?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { id: 'fotovoltaice',icon: Sun,           title: 'Fotovoltaice',          desc: 'Proiecte panouri și avizare ANRE',         tag: 'NEW',  href: '/industrii/fotovoltaice',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-400 via-violet-500 to-violet-600' },
  { id: 'telecom',     icon: Phone,         title: 'Telecom',               desc: 'Avize Telekom, STB, NetCity',             tag: 'NEW',  href: '/industrii/telecom',
    image: 'https://images.unsplash.com/photo-1606814540563-5c02d62fd409?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-600' },
  { id: 'marketplace', icon: Store,         title: 'Marketplace',           desc: 'Șabloane, ștampile, kit-uri B2B',         tag: 'BIZ',  href: '/marketplace',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-indigo-500 via-violet-500 to-purple-600' },
  { id: 'realestate',  icon: Building2,     title: 'Imobiliare',            desc: 'Anunțuri proprietăți & terenuri',         tag: 'BIZ',  href: '/imobiliare',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-slate-600 via-slate-700 to-slate-800' },
  { id: 'jobs',        icon: Users,         title: 'Job Board ANRE',        desc: 'Locuri de muncă pentru proiectanți',       tag: 'BIZ',  href: '/jobs',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600' },
  { id: 'forum',       icon: MessageSquare, title: 'Forum Profesional',     desc: 'Discuții tehnice & RFI între specialiști',tag: 'BIZ',  href: '/forum',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-teal-500 via-cyan-500 to-blue-600' },
  { id: 'crafts',      icon: Hammer,        title: 'Meseriași',             desc: 'Conexiuni beneficiari ↔ meșteri verificați',tag: 'NEW', href: '/servicii',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-600 via-violet-700 to-red-700' },
  { id: 'logistics',   icon: Truck,         title: 'Comerț & Logistică',    desc: 'Lanț aprovizionare + transport materiale', tag: 'NEW', href: '/comert-logistica',
    image: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-slate-500 via-blue-600 to-indigo-700' },
  { id: 'industry',    icon: Factory,       title: 'Fabrici & Uzine',       desc: 'Proiectare instalații industriale',        tag: 'NEW', href: '/fabrici-uzine',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-zinc-600 via-zinc-700 to-zinc-900' },
  { id: 'verify',      icon: BadgeCheck,    title: 'Verificare QR',         desc: 'Validare publică semnătură document',     tag: 'CORE', href: '/verifica',
    image: 'https://images.unsplash.com/photo-1606326608690-4e0281b1e588?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600' },
  { id: 'fees',        icon: Receipt,       title: 'Comisioane & Tarife',   desc: 'Transparență totală costuri platformă',   tag: 'INFO', href: '/comisioane-tarife',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-slate-400 via-slate-500 to-slate-700' },
  // V10.0 — Servicii noi (cerere user: curierat, transport persoane, mediu, spitale, caritabile, biserică)
  { id: 'curierat',    icon: PackageOpen,   title: 'Curierat',              desc: 'Livrări rapide nationale, tracking real-time',tag: 'SOON', href: '/curierat',
    image: 'https://images.unsplash.com/photo-1614976523626-d598aafd4fda?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-500 via-red-500 to-pink-600' },
  { id: 'transport',   icon: Bus,           title: 'Transport Persoane',    desc: 'Microbuze, taxi inter-orașe, partajat',     tag: 'SOON', href: '/transport-persoane',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-blue-500 via-cyan-500 to-teal-600' },
  { id: 'mediu',       icon: Leaf,          title: 'Mediu',                 desc: 'Plantări, recuperare, reciclare, sustenabilitate', tag: 'SOON', href: '/mediu',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-green-500 via-emerald-600 to-teal-700' },
  { id: 'spitale',     icon: HeartPulse,    title: 'Spitale & Sănătate',    desc: 'Conexiuni clinici, doctori, programări',    tag: 'SOON', href: '/spitale',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-rose-500 via-red-500 to-violet-600' },
  { id: 'caritabile',  icon: Heart,         title: 'Cauze Caritabile',      desc: 'Donații verificate, transparență totală',   tag: 'SOON', href: '/caritabile',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-pink-500 via-rose-500 to-red-600' },
  { id: 'biserica',    icon: Church,        title: 'Biserică & Comunitate', desc: 'Comunități spirituale, evenimente, donații', tag: 'SOON', href: '/biserica',
    image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=900&q=80&auto=format&fit=crop',
    gradient: 'from-violet-500 via-violet-600 to-violet-700' },
];

// VIITOR — 22 servicii globale planificate (per master plan EPD)
// V11.1 — FUTURE_SERVICES + NEXT_GEN_MISSIONS extracted to /src/data/services.js

// Logo component pulled from shared EPDLogo (uses real image, not CSS gradient cube)
// to align with founder's explicit V9.2 request: "foloseste logo-ul acesta".

const TAG_STYLES = {
  CORE: 'bg-zinc-950 text-white',
  NEW:  'bg-emerald-600 text-white',
  BETA: 'bg-violet-500 text-zinc-950',
  BIZ:  'bg-fuchsia-600 text-white',
  INFO: 'bg-zinc-200 text-zinc-800',
  SOON: 'bg-zinc-500 text-white',
};

export default function Landing() {
  const { user } = useAuth();

  useSEO({
    title: 'Energy Project Design · Documentație Tehnică Digitală Global · Gaze, Construcții, Aviație, Spațial',
    description: 'Energy Project Design (EPD) — platforma B2B globală nr.1 pentru documentație tehnică digitală certificată. Gaze naturale (NTPEE 2018, ANRE), construcții (Legea 10/1995), electric, fotovoltaice, telecom, HVAC, apă-canal, aviație civilă (airflight), spațial (spaceflight, NewSpace, satelite). Semnătură QES eIDAS. 24 limbi. AI Assistant + AI Developer. Dragos Serban, CUI 43151074.',
    canonical: 'https://www.energyprojectdesign.com/',
    keywords: 'energy project design, energyprojectdesign, EPD, documentatie tehnica digitala, gaze naturale, bransament gaze, NTPEE 2018, ANRE 89/2018, constructii, Legea 10/1995, Legea 50/1991, electric, fotovoltaice, telecom, HVAC, apa-canal, feroviar, aviatie, airflight, spaceflight, NewSpace, satelite, drone UAV, B2B SaaS Romania, B2B SaaS Global, semnatura electronica calificata, QES, eIDAS, stampila digitala, marketplace imobiliar, AI assistant proiectare, AI developer, DTAC, DTOE, PTH, carte tehnica, AC, CU, ATR, OSD, anexa 13, anexa 14, ENGIE, E-Distributie, Distrigaz Sud, Dragos Serban',
    breadcrumbs: [{ name: 'Acasă', url: '/' }],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Energy Project Design',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Engineering Documentation SaaS',
      operatingSystem: 'Web (all browsers, mobile + desktop)',
      url: 'https://www.energyprojectdesign.com',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'RON',
        lowPrice: '0',
        highPrice: '4500000',
        offerCount: '5',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '38',
        bestRating: '5',
      },
      featureList: [
        '33 template-uri DOCX legal Romania (NTPEE 2018, HG 273/1994)',
        'Generare automat dosar branșament gaze (34 fișiere ZIP)',
        'Semnătură QES eIDAS + ștampilă digitală draggable A4',
        'Calcul automat Renouard, Anexa 13, materiale SAP',
        'OCR + AI smart extraction (Claude Sonnet) pentru template-uri',
        'Multi-industrie (15+): gaze, electric, fotovoltaic, telecom, HVAC, apă-canal, feroviar, aviație, spațial',
        '24 limbi, hreflang complet, RTL pentru arabă și ebraică',
        'Stripe LIVE multi-account (subscripții + donații)',
        'Transfer proiect între utilizatori cu audit log GDPR',
        'AI Assistant + AI Developer per industrie',
      ],
      author: { '@type': 'Person', name: 'Dragoș Șerban' },
      publisher: {
        '@type': 'Organization',
        name: 'Energy Project Design S.R.L.',
        url: 'https://www.energyprojectdesign.com',
        taxID: '43151074',
      },
    },
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 noise-overlay">
      {/* Header — V13.0 premium, compact nav, no wrap */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <div className="shrink-0"><EPDLogo /></div>
          <nav className="hidden xl:flex items-center gap-6 text-[13px] font-medium whitespace-nowrap">
            <a href="#main-product" className="text-zinc-600 hover:text-zinc-950 transition-colors">Gaze Naturale</a>
            <a href="#services" className="text-zinc-600 hover:text-zinc-950 transition-colors" data-testid="nav-ecosistem">Ecosistem</a>
            <Link to="/pricing" className="text-zinc-600 hover:text-zinc-950 transition-colors" data-testid="nav-pricing">Tarife</Link>
            <Link to="/afaceri-b2b" className="text-zinc-600 hover:text-zinc-950 transition-colors" data-testid="nav-b2b">Afaceri B2B</Link>
            <Link to="/contact" className="text-zinc-600 hover:text-zinc-950 transition-colors" data-testid="nav-contact">Contact</Link>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <GlobalTranslator variant="light" />
            <Link to="/sponsorizeaza" className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-full border border-fuchsia-200 hover:bg-fuchsia-50 text-fuchsia-700 hover:text-fuchsia-900 transition-colors" title="Donații" data-testid="nav-sponsor">
              <span className="text-sm leading-none">♥</span>
            </Link>
            <a href="#investitori" className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 font-bold rounded-md transition-colors whitespace-nowrap" data-testid="nav-investors">
              Investitori
            </a>
            {user ? (
              <Link to="/dashboard" className="epd-btn text-sm py-2" data-testid="cta-dashboard">Panou</Link>
            ) : (
              <>
                <Link to="/auth?mode=signin" className="ghost-btn text-sm whitespace-nowrap" data-testid="nav-login">Autentificare</Link>
                <Link to="/auth?mode=signup" className="epd-btn text-sm py-2 whitespace-nowrap" data-testid="nav-register">Începe gratuit</Link>
              </>
            )}
          </div>
        </div>
      </header>
<section data-testid="brand-banner-top" className="relative w-full overflow-hidden h-[380px] md:h-[440px] lg:h-[500px]"> <img src={BRAND_ASSETS.brandHeroEarth} alt="Energy Project Design Banner" className="absolute inset-0 w-full h-full object-cover" loading="eager" /> <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div> </section> 
      {/* HERO — Identitate oficială EPD (V12.7: no photo, clean pro gradient) */}
      {/* HERO — V10.7 compact & discret (font-uri reduse, padding redus) */}
      <section className="relative pt-12 pb-14 lg:pt-16 lg:pb-20 overflow-hidden bg-zinc-950">
        {/* Fundal pur zinc-950 + subtle violet radial gradient (brand palette: alb/negru + violet) */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(124,58,237,0.20) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(76,29,149,0.15) 0%, transparent 50%)' }} />
        {/* Grain overlay pentru textură premium */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>")' }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
            {/* LEFT — Text + CTAs */}
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-violet-500/40 rounded-full text-[10px] uppercase tracking-[0.25em] text-violet-300 mb-5 backdrop-blur-sm bg-violet-500/5">
                <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                <span>THE ARCHITECTS OF FUTURE GLOBAL TECHNOLOGY</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02] mb-4 text-white font-display">
                Energy Project<br/>
                <span className="italic text-violet-400 font-normal">Design.</span>
              </h1>
              <p className="text-lg text-zinc-300 font-light mb-3 tracking-tight">
                {BRAND.tagline}
              </p>
              <p className="text-sm text-zinc-400 max-w-xl mb-6 leading-relaxed">
                Platforma globală de proiectare și documentație tehnică digitală certificată — produs principal:
                {' '}<span className="font-semibold text-white">documentație electronică pentru instalații gaze naturale</span>, conform NTPEE 2018, eIDAS QES, cu valoare juridică.
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link to={user ? '/gaze-naturale' : '/auth?mode=signup&next=gas'} className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-violet-50 font-semibold px-5 py-2.5 rounded-md text-sm transition-all hover:-translate-y-0.5 shadow-xl" data-testid="hero-cta-gas">
                  <Flame className="w-4 h-4" />
                  Începe proiect gaze naturale
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center gap-2 text-white border border-white/25 hover:border-violet-400 hover:text-violet-300 px-4 py-2.5 rounded-md backdrop-blur-sm transition-all text-sm font-medium" data-testid="hero-cta-pricing">
                  Vezi tarifele
                </Link>
              </div>
              {/* Stats compact — 4 într-o linie, mai mici */}
              <div className="mt-8 grid grid-cols-4 gap-4">
                {[
                  { v: '13',     l: 'Industrii' },
                  { v: 'NTPEE',  l: 'Conform 2018' },
                  { v: 'QES',    l: 'eIDAS' },
                  { v: '24',     l: 'Limbi' },
                ].map(s => (
                  <div key={s.l} className="border-l-2 border-violet-500/40 pl-2.5">
                    <div className="text-xl lg:text-2xl font-bold tracking-tighter text-white tabular-nums font-display">{s.v}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-semibold">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — YouTube brand video (oficial EPD) — compact */}
            <div className="relative">
              <div className="relative rounded-md overflow-hidden aspect-video bg-zinc-900 ring-1 ring-violet-500/30 shadow-xl shadow-violet-950/50">
                <iframe
                  src="https://www.youtube.com/embed/gsh_nFycsdc?rel=0&modestbranding=1&showinfo=0"
                  title="Energy Project Design — Brand Video"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  data-testid="brand-video-hero"
                />
              </div>
              <div className="mt-2 text-[9px] uppercase tracking-[0.25em] text-zinc-500 font-semibold text-right">// Videoclip oficial brand EPD</div>
            </div>
          </div>
        </div>
      </section>

      {/* V13.5 — TRUST BAR (destinatari reali documentație) */}
      <section className="relative bg-zinc-950 border-t border-white/10 py-8" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold shrink-0">
              // Documentație acceptată de:
            </div>
            <div className="flex-1 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-300 font-medium">
              <span>OSD-uri gaze</span>
              <span className="text-zinc-700">·</span>
              <span>Primării</span>
              <span className="text-zinc-700">·</span>
              <span>ANRE</span>
              <span className="text-zinc-700">·</span>
              <span>ISU</span>
              <span className="text-zinc-700">·</span>
              <span>ISC</span>
              <span className="text-zinc-700">·</span>
              <span>Poliția Rutieră</span>
              <span className="text-zinc-700">·</span>
              <span>E-Distribuție</span>
              <span className="text-zinc-700">·</span>
              <span>Apa & Canal</span>
              <span className="text-zinc-700">·</span>
              <span>Diriginți șantier</span>
            </div>
          </div>
        </div>
      </section>

      {/* V13.5 — VISION BANNER (zinc-950 premium, no gradients violet) */}
      <section className="relative bg-white border-y border-zinc-200 py-14 lg:py-20" data-testid="vision-banner">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Misiunea EPD · The Architects of Future Global Technology</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-zinc-950 tracking-[-0.03em] font-display leading-[1.02]">
            Platforma nr. 1 în lume,<br className="hidden lg:block"/>
            <span className="italic text-zinc-400 font-normal">multifuncțională.</span>
          </h2>
          <p className="text-base lg:text-lg text-zinc-600 mt-6 max-w-3xl leading-relaxed">
            Pentru toate tipurile de energie, infrastructuri, transport, construcții, retail,
            aviație, spațial — și multe altele.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-zinc-700">
            {['Inovație', 'Sustenabilitate', 'Tehnologie', 'Excelență', 'Încredere'].map(w => (
              <span key={w} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-zinc-950" />{w}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* V13.5 — MOTTO / MANIFESTO EPD (editorial, kinetic type) */}
      <section className="relative py-14 lg:py-20 bg-zinc-950 overflow-hidden" data-testid="epd-motto-section">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold mb-10">// motto-ul platformei</div>
          <blockquote className="space-y-8 text-white">
            <p className="text-3xl lg:text-5xl font-bold tracking-[-0.035em] leading-[1.05] font-display" data-testid="motto-q1">
              Te-ai gândit cum ar arăta singura platformă din lume pentru toate serviciile?
            </p>
            <p className="text-xl lg:text-2xl text-zinc-300 leading-relaxed" data-testid="motto-q2">
              O platformă pe care o folosești pentru tot ce îți trebuie.
            </p>
            <p className="text-base lg:text-lg text-zinc-400 italic tracking-tight leading-relaxed" data-testid="motto-q3">
              Construcții, marketplace, cumpărături, servicii.<br/>
              Totul integrat într-o singură platformă.
            </p>
            <div className="w-20 h-px bg-zinc-700 my-10" />
            <p className="text-2xl lg:text-4xl font-bold tracking-tight text-white font-display leading-tight" data-testid="motto-conclusion">
              Pentru toate acestea, există <span className="italic text-zinc-400">Energy Project Design.</span>
            </p>
            <p className="text-xl lg:text-2xl text-zinc-500 mt-4 tracking-tight italic" data-testid="motto-signoff">
              Rămânem.
            </p>
          </blockquote>
        </div>
      </section>

      {/* PRODUS PRINCIPAL — Gaze Naturale (flagship showcase V13.6 editorial split) */}
      <section id="main-product" className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT — Foto reală țevi gaze cu detalii */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-md overflow-hidden bg-zinc-950 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1773186704394-919b2aa3179a?w=1400&q=90&auto=format&fit=crop"
                  alt="Instalație gaze naturale — țeavă galbenă cu robinet"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Overlay meta */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-semibold mb-2">// document generat automat</div>
                  <div className="text-white font-semibold text-sm">Proiect tehnic complet · Referat · Memoriu · Breviar · PV · Listă materiale</div>
                </div>
              </div>
              {/* Floating stat card */}
              <div className="hidden lg:block absolute -bottom-6 -right-6 bg-white border border-zinc-200 rounded-md p-5 shadow-xl max-w-[220px]">
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-semibold mb-1">Timp mediu proiect</div>
                <div className="text-4xl font-bold text-zinc-950 font-display tracking-tighter tabular-nums">4 min</div>
                <div className="text-xs text-zinc-500 mt-2 leading-tight">vs. 3-5 zile în modul tradițional (redactare Word manuală)</div>
              </div>
            </div>

            {/* RIGHT — Text principal */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold">Produs principal · Operațional 100%</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.035em] leading-[1.02] mb-6 text-zinc-950 font-display">
                Documentație tehnică electronică<br/>
                <span className="italic text-zinc-400 font-normal">gaze naturale.</span>
              </h2>
              <p className="text-base lg:text-lg text-zinc-600 leading-relaxed mb-8">
                Generăm întregul dosar tehnic — branșament, instalație utilizare sau extindere conductă —
                conform <strong className="text-zinc-950">NTPEE 2018, Ord. ANRE 89/2018, Legea 50/1991 și HG 273/1994</strong>.
                Tu introduci datele, platforma compune proiectul.
              </p>
              {/* Feature list (linii orizontale, nu carduri cu iconițe violet) */}
              <ul className="divide-y divide-zinc-200 border-y border-zinc-200 mb-8">
                {MAIN_PRODUCT_HIGHLIGHTS.map((h) => {
                  const Icon = h.icon;
                  return (
                    <li key={h.label} className="py-3.5 flex items-center gap-4 group">
                      <Icon className="w-4 h-4 text-zinc-950 shrink-0" strokeWidth={2} />
                      <div className="flex-1 min-w-0 text-sm font-semibold text-zinc-950 tracking-tight">{h.label}</div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold">{h.value}</div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to={user ? '/gaze-naturale' : '/auth?mode=signup&next=gas'} className="epd-btn" data-testid="main-product-cta">
                  <Flame className="w-4 h-4" /> Începe primul proiect (5 gratuit)
                </Link>
                <Link to="/pricing" className="outline-btn" data-testid="main-product-pricing">Planuri și tarife</Link>
                <Link to="/transparenta" className="text-sm text-zinc-500 hover:text-zinc-950 inline-flex items-center gap-1 font-medium underline">Vezi cifre live →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC PLANS — Vizibile fără logare (cerere user V10.8) */}
      <PublicPlansGrid context="gas" />

      {/* ECOSISTEM EPD — toate serviciile platformei V13.6 mono */}
      <section id="services" className="py-14 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Ecosistem EPD · 20 servicii integrate</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-zinc-950 max-w-2xl font-display leading-[1.02]">
                Un singur cont.<br/><span className="italic text-zinc-400 font-normal">Toate serviciile.</span>
              </h2>
              <p className="text-zinc-600 mt-5 max-w-2xl leading-relaxed">
                Pe lângă produsul principal Gaze Naturale, EPD oferă ecosistem complet pentru orice activitate de proiectare,
                execuție, comercializare, logistică, transport, sănătate și comunitate.
              </p>
            </div>
            <div className="text-right border-l-2 border-zinc-950 pl-4">
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-1 font-semibold">// active acum</div>
              <div className="text-4xl font-bold tabular-nums text-zinc-950 font-display tracking-tighter">20</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ACTIVE_SERVICES.map((s) => {
              const Icon = s.icon;
              const isMain = s.id === 'gas';
              return (
                <Link
                  key={s.id}
                  to={user ? s.href : `/auth?mode=signup&next=${s.id}`}
                  data-testid={`landing-service-${s.id}`}
                  className={`group relative bg-white border rounded-md overflow-hidden transition-all hover:-translate-y-1 ${
                    isMain
                      ? 'border-zinc-950 shadow-xl ring-1 ring-zinc-950/5'
                      : 'border-zinc-200 hover:border-zinc-950 hover:shadow-lg'
                  }`}
                >
                  {isMain && (
                    <div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-zinc-950 text-white text-[9px] uppercase tracking-wider font-bold rounded">
                      Produs principal
                    </div>
                  )}
                  {/* Real image hero OR premium gradient card with large centered icon (honest fallback - no manipulating photos) */}
                  <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${s.gradient || 'from-violet-500 to-indigo-700'}`}>
                    {s.image ? (
                      <img
                        src={s.image}
                        alt={s.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      // Premium gradient card with large centered icon + decorative grid
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 40%)',
                        }} />
                        <Icon className="relative w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-md ${isMain ? 'epd-gradient' : 'bg-white/90 group-hover:bg-white'} transition-all shadow-md`}>
                        <Icon className={`w-4 h-4 ${isMain ? 'text-white' : 'text-slate-800'}`} strokeWidth={2.2} />
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold rounded ${TAG_STYLES[s.tag] || TAG_STYLES.INFO} shadow-sm`}>{s.tag}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-base font-semibold leading-tight mb-1.5 text-slate-900">{s.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{s.desc}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-violet-600 group-hover:text-violet-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Acces serviciu <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner — The Architects V13.6 zinc premium editorial + Imagine 1 „Holographic Globe" background */}
      <section
        className="relative py-14 lg:py-20 overflow-hidden text-white bg-zinc-950"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(9,9,11,0.75) 0%, rgba(9,9,11,0.85) 50%, rgba(9,9,11,0.95) 100%), url(${BRAND_ASSETS.brandHologram})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
          <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold mb-6">// Viziunea EPD</div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.035em] leading-[0.98] max-w-4xl mb-8 font-display">
            We are the architects<br/>
            of the <span className="italic text-zinc-400 font-normal">future global technology.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Energy Project Design unește documentație tehnică digitală, marketplace, imobiliare,
            servicii și logistică într-un singur ecosistem global — cu standarde de calitate uniforme și
            preț democratizat pentru întreaga lume.
          </p>
        </div>
      </section>

      {/* ROADMAP 22 SERVICII VIITOARE V13.6 */}
      <section id="roadmap" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// roadmap global EPD</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-zinc-950 max-w-3xl font-display leading-[1.02]">22 servicii globale în dezvoltare.</h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                EPD devine singura platformă din lume care unește toate produsele și serviciile esențiale —
                un singur brand global, standarde uniforme, preț democratizat.
              </p>
            </div>
            <div className="text-right border-l-2 border-zinc-950 pl-4">
              <Globe className="w-8 h-8 text-zinc-950 ml-auto mb-2" strokeWidth={1.5} />
              <div className="text-4xl font-bold tabular-nums text-zinc-950 font-display tracking-tighter">22</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mt-1 font-semibold">servicii viitoare</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="roadmap-grid">
            {FUTURE_SERVICES.map((s) => (
              <div key={s.id} className="bg-white border border-zinc-200 hover:border-zinc-950 hover:shadow-lg rounded-md overflow-hidden transition-all group hover:-translate-y-0.5" data-testid={`roadmap-${s.id}`}>
                {s.image && (
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-100">
                    <img src={s.image} alt={s.label} loading="lazy" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-sm font-bold leading-tight mb-1 text-zinc-950 tracking-tight">{s.label}</div>
                  <div className="text-[11px] text-zinc-500 leading-snug line-clamp-2">{s.desc}</div>
                  <div className="text-[9px] uppercase tracking-[0.22em] text-zinc-950 font-bold mt-3">În roadmap</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* V13.6 — VIZIUNI EPD NEXT-GEN (editorial zinc) */}
      <section id="next-gen" className="py-14 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-14">
            <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Viziuni EPD Next-Gen · Feb 2026</div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-zinc-950 max-w-4xl leading-[1.02] font-display">
              Cele 16 misiuni viitoare<br/><span className="italic text-zinc-400 font-normal">ale ecosistemului EPD.</span>
            </h2>
            <p className="text-base text-zinc-600 mt-6 max-w-3xl leading-relaxed">
              Dincolo de documentația tehnică — fondatorul EPD vede o platformă care unește guvernarea
              digitală, mobilitatea urbană, turismul global și economia colaborativă într-o singură
              experiență omogenă pentru fiecare cetățean al planetei.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="next-gen-missions">
            {NEXT_GEN_MISSIONS.map((m, idx) => {
              const isFlagship = m.flagship === true;
              const hasRoute = !!m.route;
              const cardClass = `group relative overflow-hidden rounded-md p-6 border transition-all hover:-translate-y-0.5 hover:shadow-xl ${
                isFlagship
                  ? 'bg-zinc-950 text-white border-zinc-950 lg:col-span-3'
                  : 'bg-white border-zinc-200 hover:border-zinc-950'
              }`;
              const inner = (
                <>
                  <div className={`text-3xl mb-3 ${isFlagship ? 'text-white' : 'text-zinc-950'}`}>{m.icon}</div>
                  <div className={`text-sm font-bold leading-tight mb-2 tracking-tight ${isFlagship ? 'text-white text-2xl font-display' : 'text-zinc-950'}`}>
                    {m.label}
                  </div>
                  <div className={`text-xs leading-relaxed ${isFlagship ? 'text-zinc-300 text-sm' : 'text-zinc-500'}`}>
                    {m.desc}
                  </div>
                  {isFlagship && (
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/10 backdrop-blur text-[10px] uppercase tracking-wider rounded-full font-bold border border-white/20">
                      Misiunea EPD
                    </div>
                  )}
                  {!isFlagship && (
                    <div className={`text-[10px] uppercase tracking-[0.22em] font-bold mt-4 text-zinc-950`}>
                      {hasRoute ? 'Vezi pagina →' : 'În cercetare'}
                    </div>
                  )}
                  {isFlagship && hasRoute && (
                    <div className="mt-4 text-[12px] uppercase tracking-wider text-white font-bold flex items-center gap-1">
                      Descoperă viziunea <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </>
              );
              return hasRoute ? (
                <Link key={m.id} to={m.route} className={cardClass} data-testid={`nextgen-mission-${idx}`}>
                  {inner}
                </Link>
              ) : (
                <div key={m.id} className={cardClass} data-testid={`nextgen-mission-${idx}`}>
                  {inner}
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 max-w-2xl mx-auto italic">
              &ldquo;Mi-aș dori ca una din misiunile platformei să fie construirea întregului litoral românesc
              într-o destinație turistică globală, cu unicitatea țării și ambientul tradițional românesc.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-2 font-semibold">— Founder, EPD</p>
          </div>
        </div>
      </section>

      {/* V13.5 — ECOSISTEM COMPLET (world-class hover: grayscale-idle → color) */}
      <section id="ecosistem" className="py-14 bg-white border-b border-zinc-200" data-testid="epd-ecosystem-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* V1.2 — Editorial split cu Imagine 2 „Isometric platform hub" (perfect visual metaphor) */}
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-center mb-10">
            <div className="relative order-2 lg:order-1 rounded-md overflow-hidden bg-zinc-950 shadow-2xl">
              <img
                src={BRAND_ASSETS.brandIsometric}
                alt="Un singur ecosistem — hub isometric EPD conectat la toate industriile"
                loading="lazy"
                className="w-full h-full object-cover aspect-square"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 font-bold mb-3">// ecosistem EPD</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-zinc-950 mb-4 font-display leading-[1.02]">
                Un singur ecosistem.<br/><span className="italic text-zinc-400 font-normal">Totul integrat.</span>
              </h2>
              <p className="text-sm lg:text-base text-zinc-600 max-w-2xl leading-relaxed">
                10 categorii × zeci de servicii — de la construcții și logistică, până la marketing,
                evenimente, tehnologie și afaceri. Toate operează sub același brand, aceeași autentificare,
                aceeași experiență. <strong className="text-zinc-950">Prima și singura platformă pentru toate serviciile.</strong>
              </p>
            </div>
          </div>

          {(() => {
            const categories = [...new Set(EPD_ECOSYSTEM.map(s => s.category))];
            return categories.map(cat => (
              <div key={cat} className="mb-8 last:mb-0" data-testid={`ecosystem-category-${cat.replace(/[^a-z]/gi, '').toLowerCase()}`}>
                <h3 className="text-sm font-bold tracking-[0.15em] uppercase text-zinc-950 mb-5 flex items-center gap-3">
                  <span className="w-6 h-px bg-zinc-950"></span>
                  {cat}
                  <span className="text-[10px] font-normal text-zinc-400 tabular-nums">
                    ({EPD_ECOSYSTEM.filter(s => s.category === cat).length})
                  </span>
                </h3>
                {/* Compact tiles cu efect grayscale-idle → color-on-hover */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
                  {EPD_ECOSYSTEM.filter(s => s.category === cat).map(s => (
                    <div key={s.id} className="group relative bg-white border border-zinc-200 hover:border-zinc-950 rounded-md overflow-hidden transition-all cursor-default hover:-translate-y-0.5 hover:shadow-xl" data-testid={`ecosystem-item-${s.id}`}>
                      {s.image ? (
                        <div className="aspect-square overflow-hidden bg-zinc-100">
                          <img
                            src={s.image}
                            alt={s.label}
                            loading="lazy"
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 ease-out"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-zinc-100 flex items-center justify-center text-3xl">{s.icon}</div>
                      )}
                      <div className="p-2 bg-white">
                        <div className="font-semibold text-[11px] text-zinc-950 leading-tight line-clamp-2 tracking-tight" title={s.label}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}

          <div className="mt-10 py-5 border-t border-zinc-200 text-center">
            <p className="text-sm text-zinc-500 italic max-w-2xl mx-auto tracking-tight">
              „Nu e o listă de idei. E o hartă a viitorului fiecărei industrii — livrată printr-un singur cont, o singură experiență, o singură echipă."
            </p>
          </div>
        </div>
      </section>

      {/* V10.6 — INVESTITORI · Strategic Capital Section (per user request) */}
      <section
        id="investitori"
        className="py-24 relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950"
        data-testid="investors-section"
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,130,246,0.4) 0%, transparent 50%)',
        }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-300 font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>// Strategic capital opportunity</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-white leading-[1.05] mb-6">
                Construim cea mai <span className="bg-gradient-to-r from-violet-300 via-violet-300 to-violet-200 bg-clip-text text-transparent">influentă platformă globală</span> de proiectare și execuție multi-industrie.
              </h2>
              <p className="text-lg text-violet-100 leading-relaxed mb-6">
                Astăzi: <strong className="text-white">platformă nr. 1 în România pentru documentație gaze naturale</strong> certificată
                eIDAS QES — 33+ documente legale, 554 SAP-coduri materiale ENGIE, 221 câmpuri tehnice mapate.
              </p>
              <p className="text-lg text-violet-100 leading-relaxed mb-8">
                Mâine: <strong className="text-white">platformă globală nr. 1 în lume</strong> pentru toate tipurile de
                construcții, energie, transport, aviație, spațial, comercializare, logistică, sănătate
                și comunitate — cu standarde uniforme și preț democratizat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { t: 'TAM global', v: '$1.4 T', d: 'Construcții + energie + spațial cumulat' },
                  { t: 'Piață țintă RO', v: '€8 B', d: 'Construcții, gaz, electric, telecom anual' },
                  { t: 'Servicii planificate', v: '22+', d: 'Multi-industrie (vezi roadmap)' },
                  { t: 'Status produs',  v: 'V10.6 live', d: 'eIDAS QES + AI + materials DB' },
                ].map((m) => (
                  <div key={m.t} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300 font-semibold">{m.t}</div>
                    <div className="text-3xl font-bold text-violet-300 tabular-nums mt-1">{m.v}</div>
                    <div className="text-xs text-slate-300 mt-1.5 leading-snug">{m.d}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="mailto:invest@energyprojectdesign.com?subject=Investment%20interest%20-%20Energy%20Project%20Design"
                  className="inline-flex items-center gap-2 bg-violet-400 hover:bg-violet-300 text-slate-900 px-7 py-3.5 rounded-lg font-bold transition-all"
                  data-testid="investors-cta-email"
                >
                  <ArrowRight className="w-4 h-4" />
                  invest@energyprojectdesign.com
                </a>
                <Link to="/pricing" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 rounded-lg backdrop-blur-sm transition-all" data-testid="investors-cta-developer-plan">
                  Plan Developer Elite · $999,999/lună
                </Link>
              </div>
              <p className="text-xs text-slate-400 mt-6 max-w-xl">
                * Investitorii ancoră primesc acces la planul Developer Elite ($999,999/lună),
                acoperă toate industriile, AI Developer integrat, suport co-fondator dedicat și
                drepturi preferențiale în creșterea internațională.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <div className="text-[10px] uppercase tracking-[0.25em] text-violet-300 font-bold mb-2">// De ce acum</div>
                <h3 className="text-2xl font-bold text-white mb-4">Momentul perfect pentru capital strategic.</h3>
                <ul className="space-y-4 text-sm text-violet-100">
                  {[
                    { t: 'Cerere validată', d: 'Operatorii de distribuție gaze din România cer documentație 100% digitală cu QES — EPD livrează deja.' },
                    { t: 'Avantaj reglementar', d: 'eIDAS + NTPEE 2018 + ANRE 89/2018 sunt integrate nativ. Competitorii globali necesită 18-24 luni pentru a se conforma.' },
                    { t: 'Tehnologie defensibilă', d: '554 SAP materials DB + 221 câmpuri + 33 templates = moat de execuție greu de replicat.' },
                    { t: 'Echipă tehnică validată', d: 'Stack production-grade: React + FastAPI + MongoDB + Stripe LIVE + AI Assistant + Universal LLM Key.' },
                    { t: 'Expansiune naturală', d: 'Aceleași engine de documente + plăți + roluri se aplică la electric, fotovoltaice, telecom, aviație, spațial — fără reinventare.' },
                  ].map((it) => (
                    <li key={it.t} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                      <div>
                        <div className="font-bold text-white">{it.t}</div>
                        <div className="text-slate-300 leading-relaxed">{it.d}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* V10.6.2 — FAQ Section with FAQPage schema → Google rich snippets */}
      <section className="py-14 bg-white border-y border-slate-200" id="faq" data-testid="faq-section">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            // Întrebări frecvente
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] mb-12 text-slate-900 max-w-3xl">
            Tot ce trebuie să știi despre <span className="epd-gradient-text">Energy Project Design</span>.
          </h2>
          <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
            {[
              {
                q: 'Ce este Energy Project Design (EPD)?',
                a: 'Energy Project Design este o platformă B2B globală pentru documentație tehnică digitală certificată — gaze naturale, construcții, electric, fotovoltaice, telecom, HVAC, apă-canal, feroviar, aviație civilă, spațial. Documentele sunt semnate eIDAS QES și au valoare juridică completă.',
              },
              {
                q: 'Documentele generate de EPD sunt acceptate legal în România?',
                a: 'Da. Toate documentele sunt generate conform NTPEE 2018, ANRE 89/2018, Legea 10/1995, Legea 123/2012 (Energia electrică și gazele naturale), HG 907/2016 (DTAC/DTOE), HG 273/1994 (Cartea Tehnică) și sunt semnate cu semnătură electronică calificată eIDAS — valoare juridică identică cu semnătura olografă.',
              },
              {
                q: 'Cât costă un proiect de branșament gaze naturale?',
                a: 'EPD oferă planuri lunare începând cu 49 RON/lună (Operator: 25 proiecte/lună), Proiectant 199 RON/lună (50 proiecte) și Societate 999 RON/lună (200 proiecte). Există și planul Developer Elite 999.999 USD/lună cu acces nelimitat la toate industriile.',
              },
              {
                q: 'În cât timp se generează un dosar complet de branșament gaze?',
                a: 'Aproximativ 30 minute pentru un dosar complet de 33+ documente (Referat verificator, Foaie de capat, Borderou, Memoriu Tehnic, ANEXA 14 cu materiale SAP auto-selectate, fișe sudori, certificate calitate, plan situatie, etc.) — comparativ cu 8-12 ore manual.',
              },
              {
                q: 'Pot adăuga colaboratori (proiectant, executant, VGD, RTE) pe același proiect?',
                a: 'Da. EPD include sistem complet de transfer proiect între utilizatori — fiecare colaborator primește acces cu rol specific (operator, proiectant, executant, VGD, RTE, contabilitate, ofertare). Audit log complet GDPR-compliant. Notificări automate prin email.',
              },
              {
                q: 'Ce industrii acoperă EPD în afară de gazele naturale?',
                a: 'Roadmap V10.6 include 15+ industrii: aviație civilă (airflight), spațial (spaceflight, NewSpace, satelite, drone-UAV), electric (ANRE PDD/EDD), fotovoltaice (Casa Verde, parc PV), telecom (FTTH, 5G), HVAC, apă-canal, feroviar (ERTMS, CFR), sănătate (spitale BSL-3), sport (stadioane FIFA/UEFA), construcții imobiliare. Toate cu același engine de documentație + plăți + roluri.',
              },
              {
                q: 'EPD funcționează în limba engleză sau alte limbi?',
                a: 'Da. Platforma este disponibilă în 24 limbi cu detectare automată browser: română, engleză, spaniolă, franceză, germană, italiană, portugheză, olandeză, polonă, ucraineană, rusă, turcă, arabă, ebraică (RTL), hindi, chineză, japoneză, coreeană, vietnameză, thailandeză, greacă, maghiară, cehă, bulgară.',
              },
              {
                q: 'Cum trimit donații către EPD?',
                a: 'Accesează /sponsorizeaza, alege suma (min 2 RON / 1 EUR), datele tale, mesajul opțional, și plătești cu cardul prin Stripe Checkout LIVE. Banii ajung direct în contul societății EPD SRL legat la IBAN Revolut RO22 REVO 0000 1555 6872 4293. Vei primi automat email de mulțumire personalizat.',
              },
              {
                q: 'EPD lucrează cu investitori sau fonduri VC?',
                a: 'Da. Suntem în căutare activă de capital strategic pentru expansiune globală. TAM estimat $1.4T multi-industrie. Contact: invest@energyprojectdesign.com. Investitorii ancoră primesc acces la planul Developer Elite și drepturi preferențiale în creștere.',
              },
              {
                q: 'Sunt datele mele în siguranță pe EPD?',
                a: 'Da. Toate datele sunt criptate la transport (TLS 1.3), stocate în MongoDB cu acces restricționat, semnate eIDAS QES (SHA-256), backup zilnic. GDPR-compliant. Audit log imutabil per proiect. Hosting în UE.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group bg-white border border-slate-200 hover:border-violet-300 rounded-lg overflow-hidden transition-colors"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                data-testid={`faq-item-${i}`}
              >
                <summary className="cursor-pointer px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <h3 className="text-base lg:text-lg font-bold text-slate-900 leading-tight" itemProp="name">{item.q}</h3>
                  <ArrowRight className="w-4 h-4 text-violet-600 shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div
                  className="px-5 pb-5 text-slate-700 leading-relaxed text-sm lg:text-base border-t border-slate-100 pt-4"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <span itemProp="text">{item.a}</span>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* V9.5 — SPONSORIZEAZĂ CAUZA EPD (NEW) */}
      <section className="py-20 bg-gradient-to-br from-violet-50 via-fuchsia-50/40 to-indigo-50 border-y border-violet-100" id="sponsorizeaza">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid md:grid-cols-5 gap-10 items-center">
          <div className="md:col-span-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
              Sponsorizează cauza EPD
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-[1.05] mb-4 text-slate-900">
              Susține construcția unei platforme<br/>
              <span className="epd-gradient-text">care schimbă o industrie întreagă.</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-xl">
              Energy Project Design este o inițiativă privată independentă care reduce birocrația
              proiectării tehnice. Fiecare contribuție — în lei sau euro — susține direct dezvoltarea
              platformei, certificările legale și democratizarea accesului la documentație tehnică
              certificată pentru toată industria gazelor naturale din România.
            </p>
            <Link
              to="/sponsorizeaza"
              className="epd-btn inline-flex items-center gap-2"
              data-testid="landing-sponsor-cta"
            >
              <span className="text-base">♥</span>
              Sponsorizează acum
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-violet-200 p-6 epd-shadow">
              <div className="text-[10px] uppercase tracking-[0.2em] text-violet-600 font-bold mb-3">// Donație flexibilă RON / EUR</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['25 RON', '50 RON', '100 RON', '5 EUR', '25 EUR', '100 EUR'].map((p, idx) => (
                  <Link
                    key={p}
                    to="/sponsorizeaza"
                    className="text-center py-2 border border-slate-200 hover:border-violet-400 hover:bg-violet-50 rounded-lg text-sm font-semibold text-slate-700 hover:text-violet-700 transition-all"
                    data-testid={`landing-sponsor-quick-${idx}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
              <Link
                to="/sponsorizeaza"
                className="block text-center text-xs uppercase tracking-wider font-semibold text-violet-700 hover:text-violet-900 py-2"
                data-testid="landing-sponsor-custom"
              >
                sau sumă personalizată →
              </Link>
              <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-semibold space-y-1">
                <div>✓ Plată securizată Stripe</div>
                <div>✓ Chitanță automată email</div>
                <div>✓ 100% reinvestit în platformă</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final (V12.7: pure gradient, no photo) */}
      <section className="py-14 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.35) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(59,130,246,0.35) 0%, transparent 55%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-end relative">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-violet-300 font-semibold mb-3">// Începe astăzi</div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] mb-4">
              5 documente gratuit.<br/>Fără card. Fără bătăi de cap.
            </h2>
            <p className="text-slate-300 max-w-md">Înregistrare în 30 de secunde. Începeți primul proiect Gaze Naturale chiar acum.</p>
          </div>
          <div className="flex md:justify-end gap-3 flex-wrap">
            <Link to="/auth?mode=signup" className="epd-btn" data-testid="cta-bottom-register">Creează cont gratuit</Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-lg transition-all">Vezi planurile</Link>
          </div>
        </div>
      </section>

      {/* V10.6 — Footer global unificat cu social media, link-uri SEO, version badge */}
      <SiteFooter />
    </div>
  );
}
