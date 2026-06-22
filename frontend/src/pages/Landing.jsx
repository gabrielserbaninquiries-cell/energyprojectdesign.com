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
import LanguageSwitcher from '../components/LanguageSwitcher';

// PRODUS PRINCIPAL — Gaze Naturale (livrabil 100% operațional)
const MAIN_PRODUCT_HIGHLIGHTS = [
  { icon: FileText,      label: '33 documente DOCX',     value: 'NTPEE 2018' },
  { icon: Layers,        label: '221 câmpuri tehnice',   value: '8 categorii' },
  { icon: Calculator,    label: 'Renouard multi-tronson', value: 'auto-calc' },
  { icon: Package,       label: 'Anexa 13 — 554 items',  value: 'auto-select' },
  { icon: Stamp,         label: 'Ștampile draggable',    value: 'A4 PDF' },
  { icon: FileSignature, label: 'Semnătură QES',          value: 'eIDAS' },
];

// Servicii integrate ACTIVE (în platformă)
const ACTIVE_SERVICES = [
  { id: 'gas',         icon: Flame,         title: 'Gaze Naturale',         desc: '33 docs · 221 câmpuri · Renouard · QES', tag: 'CORE', href: '/gaze-naturale' },
  { id: 'electric',    icon: Zap,           title: 'Electric',              desc: '6 template-uri instalații electrice',     tag: 'BETA', href: '/industrii/electric' },
  { id: 'apa-canal',   icon: Droplet,       title: 'Apă-Canal',             desc: '5 documente branșament & racord',         tag: 'BETA', href: '/industrii/apa-canal' },
  { id: 'fotovoltaice',icon: Sun,           title: 'Fotovoltaice',          desc: 'Proiecte panouri & avizare ANRE',         tag: 'NEW',  href: '/industrii/fotovoltaice' },
  { id: 'telecom',     icon: Phone,         title: 'Telecom',               desc: 'Avize Telekom, STB, NetCity',             tag: 'NEW',  href: '/industrii/telecom' },
  { id: 'marketplace', icon: Store,         title: 'Marketplace',           desc: 'Șabloane, ștampile, kit-uri B2B',         tag: 'BIZ',  href: '/marketplace' },
  { id: 'realestate',  icon: Building2,     title: 'Imobiliare',            desc: 'Anunțuri proprietăți & terenuri',         tag: 'BIZ',  href: '/imobiliare' },
  { id: 'jobs',        icon: Users,         title: 'Job Board ANRE',        desc: 'Locuri de muncă pentru proiectanți',       tag: 'BIZ',  href: '/jobs' },
  { id: 'forum',       icon: MessageSquare, title: 'Forum Profesional',     desc: 'Discuții tehnice & RFI între specialiști',tag: 'BIZ',  href: '/forum' },
  { id: 'crafts',      icon: Hammer,        title: 'Meseriași',             desc: 'Conexiuni beneficiari ↔ meșteri verificați',tag: 'NEW', href: '/servicii' },
  { id: 'logistics',   icon: Truck,         title: 'Comerț & Logistică',    desc: 'Lanț aprovizionare + transport materiale', tag: 'NEW', href: '/comert-logistica' },
  { id: 'industry',    icon: Factory,       title: 'Fabrici & Uzine',       desc: 'Proiectare instalații industriale',        tag: 'NEW', href: '/fabrici-uzine' },
  { id: 'verify',      icon: BadgeCheck,    title: 'Verificare QR',         desc: 'Validare publică semnătură document',     tag: 'CORE', href: '/verifica' },
  { id: 'fees',        icon: Receipt,       title: 'Comisioane & Tarife',   desc: 'Transparență totală costuri platformă',   tag: 'INFO', href: '/comisioane-tarife' },
  // V10.0 — Servicii noi (cerere user: curierat, transport persoane, mediu, spitale, caritabile, biserică)
  { id: 'curierat',    icon: PackageOpen,   title: 'Curierat',              desc: 'Livrări rapide nationale, tracking real-time',tag: 'SOON', href: '/curierat' },
  { id: 'transport',   icon: Bus,           title: 'Transport Persoane',    desc: 'Microbuze, taxi inter-orașe, partajat',     tag: 'SOON', href: '/transport-persoane' },
  { id: 'mediu',       icon: Leaf,          title: 'Mediu',                 desc: 'Plantări, recuperare, reciclare, sustenabilitate', tag: 'SOON', href: '/mediu' },
  { id: 'spitale',     icon: HeartPulse,    title: 'Spitale & Sănătate',    desc: 'Conexiuni clinici, doctori, programări',    tag: 'SOON', href: '/spitale' },
  { id: 'caritabile',  icon: Heart,         title: 'Cauze Caritabile',      desc: 'Donații verificate, transparență totală',   tag: 'SOON', href: '/caritabile' },
  { id: 'biserica',    icon: Church,        title: 'Biserică & Comunitate', desc: 'Comunități spirituale, evenimente, donații', tag: 'SOON', href: '/biserica' },
];

// VIITOR — 22 servicii globale planificate (per master plan EPD)
const FUTURE_SERVICES = [
  { label: 'Lanț hoteluri',           desc: 'Camere gratuite pentru oamenii străzii, prețuri de la 1$/noapte' },
  { label: 'EPD Supermarket',         desc: 'Cel mai mare supermarket global — unește toate brand-urile' },
  { label: 'Mâncare worldwide',       desc: 'Comenzi la preț, calitate, timp livrare cu door-to-door' },
  { label: 'Locuri muncă globale',    desc: 'Joburi pe domenii, fără frontiere' },
  { label: 'Vânzări auto',            desc: 'Mașini la prețuri reduse, specificații complete' },
  { label: 'Vânzări imobile',         desc: 'Case + terenuri cu catalog AI personalizat' },
  { label: 'Piese auto globale',      desc: 'Brand, an, preț, stare — toate într-un singur catalog' },
  { label: 'Mecanici & service auto', desc: 'Calcul preț servicii + plată online + tractare' },
  { label: 'Motor plăți online',      desc: 'Procesare plăți pentru toate serviciile EPD' },
  { label: 'EPD Shop',                desc: 'Search produse, retaileri afiliați, order online' },
  { label: 'TV online global',        desc: 'Streaming televiziune pe țări' },
  { label: 'Radio online global',     desc: 'Radio pe țări și genuri muzicale' },
  { label: 'Distribuție copaci',      desc: 'Plantări mediu + reforestation worldwide' },
  { label: 'Distribuitor marfuri',    desc: 'Aprovizionare magazine + supermarket worldwide' },
  { label: 'Constructori-Finanțatori',desc: 'Lucrări publice, infrastructură, drumuri, reabilitări' },
  { label: 'Benzinării + EV',         desc: 'Stații compatibile cu rețeaua EPD' },
  { label: 'Spălătorii auto',         desc: 'Rezervare + plată online' },
  { label: 'Restaurante',             desc: 'Comenzi + livrare + rating EPD' },
  { label: 'Racordări energetice',    desc: 'Clienții se racordează direct prin platformă' },
  { label: 'Fonduri europene',        desc: 'Aplicare la finanțări nerambursabile' },
  { label: 'Fonduri de stat',         desc: 'Infrastructură + dezvoltare urbană direct de la minister' },
  { label: 'EPD Mail',                desc: 'Singurul serviciu de email global cu zero spam' },
];

// Logo component pulled from shared EPDLogo (uses real image, not CSS gradient cube)
// to align with founder's explicit V9.2 request: "foloseste logo-ul acesta".

const TAG_STYLES = {
  CORE: 'bg-violet-600 text-white',
  NEW:  'bg-emerald-500 text-white',
  BETA: 'bg-amber-500 text-white',
  BIZ:  'bg-indigo-600 text-white',
  INFO: 'bg-slate-200 text-slate-700',
  SOON: 'bg-fuchsia-500 text-white',
};

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 noise-overlay">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#main-product" className="text-slate-600 hover:text-violet-700 transition-colors">Gaze Naturale</a>
            <Link to="/constructii" className="text-slate-600 hover:text-violet-700 transition-colors" data-testid="nav-constructii">Construcții</Link>
            <Link to="/imobiliare" className="text-slate-600 hover:text-violet-700 transition-colors" data-testid="nav-imobiliare">Imobiliare</Link>
            <Link to="/documentatie-electronica" className="text-slate-600 hover:text-violet-700 transition-colors" data-testid="nav-docs">Documentație</Link>
            <Link to="/sponsorizeaza" className="text-fuchsia-600 hover:text-fuchsia-800 transition-colors font-semibold" data-testid="nav-sponsor">♥ Donații</Link>
            <Link to="/contact" className="text-slate-600 hover:text-violet-700 transition-colors" data-testid="nav-contact">Contact</Link>
            <Link to="/pricing" className="text-slate-600 hover:text-violet-700 transition-colors" data-testid="nav-pricing">Tarife</Link>
          </nav>
          <div className="flex items-center gap-2">
            {/* V10.6 — Language switcher (24 languages, browser auto-detect) */}
            <LanguageSwitcher compact />
            <a href="#investitori" className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold rounded-md transition-colors" data-testid="nav-investors">
              💎 Investitori
            </a>
            {user ? (
              <Link to="/dashboard" className="epd-btn text-sm py-2" data-testid="cta-dashboard">Panou</Link>
            ) : (
              <>
                <Link to="/login" className="ghost-btn text-sm" data-testid="nav-login">Autentificare</Link>
                <Link to="/register" className="epd-btn text-sm py-2" data-testid="nav-register">Începe gratuit</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO — Identitate oficială EPD */}
      <section
        className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.88) 45%, rgba(79,70,229,0.85) 100%), url(${BRAND_ASSETS.cover1Futurist})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-200 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Architects of Future Global Technology</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.02] mb-6 text-white">
              Energy Project<br/>
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Design</span>
              <span className="text-violet-300">.</span>
            </h1>
            <p className="text-2xl text-violet-100 font-light mb-4 italic">{BRAND.tagline}</p>
            <p className="text-base lg:text-lg text-slate-200 max-w-2xl mb-10 leading-relaxed">
              Platforma globală de proiectare și documentație tehnică digitală certificată — produs principal:
              {' '}<span className="font-semibold text-white">documentație electronică pentru instalații gaze naturale</span>, conform NTPEE 2018, eIDAS QES, cu valoare juridică.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={user ? '/gaze-naturale' : '/register?next=gas'} className="epd-btn text-base px-7 py-3.5" data-testid="hero-cta-gas">
                <Flame className="w-5 h-5" />
                Începe proiect gaze naturale
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 rounded-lg backdrop-blur-sm transition-all" data-testid="hero-cta-pricing">
                Vezi tarifele
              </Link>
              <a href="#investitori" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-3.5 rounded-lg backdrop-blur-sm transition-all font-bold" data-testid="hero-cta-investors">
                <Sparkles className="w-4 h-4" />
                Investitori →
              </a>
            </div>
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
              {[
                { v: '33',   l: 'Documente legale' },
                { v: '221',  l: 'Câmpuri tehnice' },
                { v: '13',   l: 'Industrii' },
                { v: 'eIDAS',l: 'QES certificat' },
              ].map(s => (
                <div key={s.l}>
                  <div className="text-4xl font-bold tracking-tight text-white tabular-nums">{s.v}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-violet-200 mt-1.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* V10.6 — VISION BANNER (user-supplied hero image) */}
      <section className="relative bg-slate-900 overflow-hidden" data-testid="vision-banner">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/0 to-slate-900/60 pointer-events-none z-10" />
        <img
          src="/branding/epd_hero_banner.png"
          alt="Energy Project Design — Platforma nr. 1 în lume, multifuncțională pentru toate tipurile de energie, infrastructuri, transport, construcții, retail și multe altele"
          loading="lazy"
          className="w-full h-auto block"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 lg:px-12 py-6 lg:py-10 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300 font-bold mb-2">// Misiunea EPD · The Architects of Future Global Technology</div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">
              <span className="text-amber-300">Platforma nr. 1 în lume</span>, multifuncțională
            </h2>
            <p className="text-base lg:text-lg text-slate-300 mt-3 max-w-3xl">
              Pentru toate tipurile de energie, infrastructuri, transport, construcții, retail,
              aviație, spațial — și multe altele. Inovație · Sustenabilitate · Tehnologie · Excelență · Încredere.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUS PRINCIPAL — Gaze Naturale (deasupra tuturor) */}
      <section id="main-product" className="py-24 bg-gradient-to-b from-white via-violet-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-4">
                <span className="w-8 h-px bg-violet-600" />
                Produs principal · operațional 100%
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] mb-5 text-slate-900">
                Documentație tehnică electronică <span className="epd-gradient-text">Gaze Naturale</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Generează automat dosar complet pentru branșament, instalație utilizare sau extindere conductă —
                cu memoriu tehnic, caiet de sarcini, borderou, DTAC, cerere AC, PTH, carte tehnică și 26 de documente
                legale conform NTPEE 2018, HG 273/1994, Legea 50/1991 și Ord. ANRE 89/2018.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {MAIN_PRODUCT_HIGHLIGHTS.map((h) => {
                  const Icon = h.icon;
                  return (
                    <div key={h.label} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-violet-300 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-md epd-gradient flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white" strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 leading-tight">{h.label}</div>
                        <div className="text-[11px] uppercase tracking-wider text-violet-600 font-medium mt-0.5">{h.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link to={user ? '/gaze-naturale' : '/register?next=gas'} className="epd-btn" data-testid="main-product-cta">
                  <Flame className="w-4 h-4" /> Începe primul proiect (5 gratuit)
                </Link>
                <Link to="/pricing" className="outline-btn" data-testid="main-product-pricing">Planuri și tarife</Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-xl border border-slate-200 epd-shadow-lg">
                  <img src={BRAND_ASSETS.cover3Office} alt="EPD office — proiectare gaze naturale" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-white border border-slate-200 p-5 rounded-lg epd-shadow max-w-[280px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Document semnat</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Check className="w-4 h-4 text-emerald-500" /> Semnătură PKI QES</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">SHA-256: a3f1…b9e4</div>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] uppercase tracking-wider text-violet-600 font-semibold">eIDAS conform</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSISTEM EPD — toate serviciile platformei */}
      <section id="services" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">Ecosistem EPD · 20 servicii integrate</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900 max-w-2xl">
                Un singur cont. Toate serviciile.
              </h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                Pe lângă produsul principal Gaze Naturale, EPD oferă ecosistem complet pentru orice activitate de proiectare,
                execuție, comercializare, logistică, transport, sănătate și comunitate.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">// active acum</div>
              <div className="text-5xl font-bold tabular-nums epd-gradient-text">20</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ACTIVE_SERVICES.map((s) => {
              const Icon = s.icon;
              const isMain = s.id === 'gas';
              return (
                <Link
                  key={s.id}
                  to={user ? s.href : `/register?next=${s.id}`}
                  data-testid={`landing-service-${s.id}`}
                  className={`group relative bg-white border rounded-xl p-5 transition-all hover:-translate-y-1 ${
                    isMain
                      ? 'border-violet-300 epd-shadow ring-1 ring-violet-100'
                      : 'border-slate-200 hover:border-violet-300 hover:shadow-md'
                  }`}
                >
                  {isMain && (
                    <div className="absolute -top-2 left-5 px-2 py-0.5 epd-gradient text-white text-[9px] uppercase tracking-wider font-bold rounded">
                      Produs principal
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${isMain ? 'epd-gradient' : 'bg-slate-100 group-hover:bg-violet-50'} transition-colors`}>
                      <Icon className={`w-5 h-5 ${isMain ? 'text-white' : 'text-slate-700 group-hover:text-violet-700'}`} strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold rounded ${TAG_STYLES[s.tag] || TAG_STYLES.INFO}`}>{s.tag}</span>
                  </div>
                  <div className="text-base font-semibold leading-tight mb-1.5 text-slate-900">{s.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed mb-4">{s.desc}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-violet-600 group-hover:text-violet-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Acces serviciu <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner — The Architects of Future Global Technology */}
      <section className="relative py-24 overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(76,29,149,0.8) 100%), url(${BRAND_ASSETS.cover4Architects})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-300 font-semibold mb-4">// Viziunea EPD</div>
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] max-w-4xl mx-auto mb-6">
            We are the architects of the<br/>
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">future global technology.</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Energy Project Design unește documentație tehnică digitală, marketplace, imobiliare,
            servicii și logistică într-un singur ecosistem global — cu standarde de calitate uniforme și
            preț democratizat pentru întreaga lume.
          </p>
        </div>
      </section>

      {/* ROADMAP 22 SERVICII VIITOARE */}
      <section id="roadmap" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// roadmap global EPD</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900 max-w-3xl">22 servicii globale în dezvoltare.</h2>
              <p className="text-slate-600 mt-3 max-w-2xl">
                EPD devine singura platformă din lume care unește toate produsele și serviciile esențiale —
                un singur brand global, standarde uniforme, preț democratizat.
              </p>
            </div>
            <div className="text-right">
              <Globe className="w-12 h-12 text-violet-300 ml-auto mb-2" strokeWidth={1.5} />
              <div className="text-5xl font-bold tabular-nums epd-gradient-text">22</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">servicii viitoare</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3" data-testid="roadmap-grid">
            {FUTURE_SERVICES.map((s, idx) => (
              <div key={idx} className="bg-white border border-slate-200 hover:border-violet-300 hover:shadow-sm p-4 rounded-lg transition-all group" data-testid={`roadmap-${idx}`}>
                <div className="w-7 h-7 rounded-md epd-gradient mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="text-xs font-bold leading-tight mb-1 text-slate-900">{s.label}</div>
                <div className="text-[10px] text-slate-500 leading-snug">{s.desc}</div>
                <div className="text-[9px] uppercase tracking-wider text-violet-500 font-semibold mt-3">În roadmap</div>
              </div>
            ))}
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
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>// Strategic capital opportunity</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tighter text-white leading-[1.05] mb-6">
                Construim cea mai <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 bg-clip-text text-transparent">influentă platformă globală</span> de proiectare și execuție multi-industrie.
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
                    <div className="text-3xl font-bold text-amber-300 tabular-nums mt-1">{m.v}</div>
                    <div className="text-xs text-slate-300 mt-1.5 leading-snug">{m.d}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a href="mailto:invest@energyprojectdesign.com?subject=Investment%20interest%20-%20Energy%20Project%20Design"
                  className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 px-7 py-3.5 rounded-lg font-bold transition-all"
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
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300 font-bold mb-2">// De ce acum</div>
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
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
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

      {/* CTA final */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,58,138,0.9) 100%), url(${BRAND_ASSETS.cover2Smartcity})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-end relative">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-violet-300 font-semibold mb-3">// Începe astăzi</div>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] mb-4">
              5 documente gratuit.<br/>Fără card. Fără bătăi de cap.
            </h2>
            <p className="text-slate-300 max-w-md">Înregistrare în 30 de secunde. Începeți primul proiect Gaze Naturale chiar acum.</p>
          </div>
          <div className="flex md:justify-end gap-3 flex-wrap">
            <Link to="/register" className="epd-btn" data-testid="cta-bottom-register">Creează cont gratuit</Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-lg transition-all">Vezi planurile</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <EPDLogo size="sm" />
              <p className="text-xs text-slate-500 mt-4 leading-relaxed">{BRAND.description}</p>
            </div>
            <div>
              <div className="label text-violet-600 mb-3">Produse</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/gaze-naturale" className="text-slate-600 hover:text-violet-700">Gaze Naturale</Link></li>
                <li><Link to="/industrii" className="text-slate-600 hover:text-violet-700">Industrii</Link></li>
                <li><Link to="/marketplace" className="text-slate-600 hover:text-violet-700">Marketplace</Link></li>
                <li><Link to="/pricing" className="text-slate-600 hover:text-violet-700">Planuri</Link></li>
                <li><Link to="/sponsorizeaza" className="text-fuchsia-600 hover:text-fuchsia-800 font-semibold" data-testid="footer-sponsor">♥ Sponsorizează</Link></li>
              </ul>
            </div>
            <div>
              <div className="label text-violet-600 mb-3">Legal</div>
              <ul className="space-y-2 text-sm">
                <li><Link to="/termeni" className="text-slate-600 hover:text-violet-700" data-testid="footer-termeni">Termeni</Link></li>
                <li><Link to="/confidentialitate" className="text-slate-600 hover:text-violet-700" data-testid="footer-confidentialitate">Confidențialitate</Link></li>
                <li><Link to="/gdpr" className="text-slate-600 hover:text-violet-700" data-testid="footer-gdpr">GDPR</Link></li>
              </ul>
            </div>
            <div>
              <div className="label text-violet-600 mb-3">Contact</div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>{BRAND.contactEmail}</li>
                <li>support@energyprojectdesign.com</li>
                <li>CUI {BRAND.cui} · {BRAND.regCom}</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} {BRAND.legalName.toUpperCase()} · Toate drepturile rezervate</div>
            <div className="italic text-violet-600">{BRAND.tagline}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
