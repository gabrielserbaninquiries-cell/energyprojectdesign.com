/**
 * InvestitiiBursa — V13.10 (Feb 2026)
 *
 * Pagină REALĂ de investiții la BVB:
 *   1) Ticker tape LIVE TradingView (prețuri reale BVB, 15 min delay)
 *   2) Grid companii cu mini-chart LIVE per emitent + link direct la BVB
 *   3) Directorul brokerilor autorizați ASF cu link-uri directe de deschidere
 *      cont (BT Capital Partners, TradeVille, XTB, Goldring, Interactive Brokers, eToro)
 *   4) Ghid „Cum îți deschizi contul demat" — 6 pași profesionali
 *   5) Disclaimer legal ASF obligatoriu
 *
 * NOTĂ REALISM: EPD NU execută tranzacții — este strict un gateway informațional
 * conform reglementărilor ASF. Onboarding-ul se face direct la brokerul licențiat.
 */
import { Link } from 'react-router-dom';
import {
  TrendingUp, ExternalLink, ArrowRight, ShieldAlert, Building2,
  Landmark, Flame, Zap, Waves, Fuel, Wind, Factory, Check,
  IdCard, Banknote, FileSignature, Search, Bell, LineChart,
} from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import GlobalTranslator from '../components/GlobalTranslator';
import TradingViewTicker from '../components/TradingViewTicker';
import TradingViewMiniChart from '../components/TradingViewMiniChart';
import useSEO from '../hooks/useSEO';

const COMPANIES = [
  { symbol: 'BVB:SNG',  ticker: 'SNG',  name: 'Romgaz',                 sector: 'Producție gaze naturale',    icon: Flame,     bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNG',   desc: 'Cel mai mare producător de gaze naturale din România. Rezerve certificate 40+ mld m³.' },
  { symbol: 'BVB:SNP',  ticker: 'SNP',  name: 'OMV Petrom',             sector: 'Petrol & Gaze integrat',     icon: Fuel,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNP',   desc: 'Cel mai mare grup integrat de petrol și gaze din sud-estul Europei.' },
  { symbol: 'BVB:TGN',  ticker: 'TGN',  name: 'Transgaz',               sector: 'Transport gaze naturale',    icon: Building2, bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TGN',   desc: 'Operator unic al sistemului național de transport gaze naturale (13.481 km rețea).' },
  { symbol: 'BVB:TEL',  ticker: 'TEL',  name: 'Transelectrica',         sector: 'Transport energie electrică', icon: Zap,       bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TEL',   desc: 'Operator unic al sistemului de transport energie electrică (8.900 km linii 220–400 kV).' },
  { symbol: 'BVB:EL',   ticker: 'EL',   name: 'Electrica',              sector: 'Distribuție & Furnizare',    icon: Zap,       bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=EL',    desc: 'Cel mai mare distribuitor și furnizor de energie electrică din România (3.8 mil clienți).' },
  { symbol: 'BVB:SNN',  ticker: 'SNN',  name: 'Nuclearelectrica',       sector: 'Energie nucleară',           icon: Landmark,  bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNN',   desc: 'Operator CNE Cernavodă (2 reactoare × 700 MW). 20% din producția României.' },
  { symbol: 'BVB:H2O',  ticker: 'H2O',  name: 'Hidroelectrica',         sector: 'Hidroenergie',               icon: Waves,     bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=H2O',   desc: 'Cel mai mare producător de energie regenerabilă din România (6.291 MW).' },
  { symbol: 'BVB:COTE', ticker: 'COTE', name: 'Conpet',                 sector: 'Transport țiței conducte',   icon: Building2, bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=COTE',  desc: 'Operator național transport țiței + gazolină + etan prin conducte (3.800 km).' },
  { symbol: 'BVB:PTR',  ticker: 'PTR',  name: 'Rompetrol Well Services', sector: 'Servicii sondaj petrolier', icon: Fuel,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=PTR',   desc: 'Intervenție și sondaj upstream pentru industria de petrol și gaze.' },
  { symbol: 'BVB:M',    ticker: 'M',    name: 'MedLife',                sector: 'Servicii medicale',          icon: Factory,   bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=M',     desc: 'Cea mai mare rețea privată de servicii medicale din România.' },
  { symbol: 'BVB:DIGI', ticker: 'DIGI', name: 'Digi Communications',    sector: 'Telecom & Media',            icon: Wind,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=DIGI',  desc: 'Telecom integrat — internet, telefonie, TV. Expansiune ES + IT + PT.' },
  { symbol: 'BVB:TLV',  ticker: 'TLV',  name: 'Banca Transilvania',     sector: 'Financiar-bancar',           icon: Landmark,  bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TLV',   desc: 'Cea mai mare bancă privată din România. Finanțator strategic energie & industrie.' },
];

const BROKERS = [
  {
    id: 'bt-capital',
    name: 'BT Capital Partners',
    tagline: 'Brokerul Băncii Transilvania',
    highlights: ['Comision de la 0,55% · min 4,50 EUR', 'Cont demat gratuit', 'Acces BVB + burse externe', 'App mobil BT Trading'],
    url: 'https://www.btcapitalpartners.ro/deschidere-cont/',
    asf: 'PJR01SSIF/400015',
    logoText: 'BT',
    accent: 'bg-blue-950 text-white',
  },
  {
    id: 'tradeville',
    name: 'TradeVille',
    tagline: 'Broker independent · 25+ ani experiență',
    highlights: ['Comision de la 0,50% · min 5 RON', 'Platformă TradeVille online', 'ETF-uri + acțiuni + obligațiuni', 'Analize proprii + rapoarte'],
    url: 'https://tradeville.ro/deschidere-cont',
    asf: 'PJR01SSIF/400013',
    logoText: 'TV',
    accent: 'bg-emerald-950 text-white',
  },
  {
    id: 'xtb',
    name: 'XTB Romania',
    tagline: 'Broker european · listat WSE',
    highlights: ['0% comision acțiuni EU (până la 100k EUR/lună)', 'xStation 5 · WebTrader', 'BVB + 6000+ instrumente globale', 'Reglementat CySEC + ASF'],
    url: 'https://www.xtb.com/ro/deschide-cont-real',
    asf: 'Notificare ASF · pașaport UE',
    logoText: 'XTB',
    accent: 'bg-rose-950 text-white',
  },
  {
    id: 'goldring',
    name: 'Goldring',
    tagline: 'SSIF · membru fondator BVB',
    highlights: ['Comision negociabil per volum', 'Consilier dedicat portofoliu', 'Servicii de administrare', 'Cabinet fizic Târgu Mureș'],
    url: 'https://goldring.ro/contact',
    asf: 'PJR01SSIF/120004',
    logoText: 'GR',
    accent: 'bg-amber-950 text-white',
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    tagline: 'Cel mai mare broker retail din SUA',
    highlights: ['Comisioane ultra-mici (fixed + tiered)', 'Acces la 150+ piețe globale', 'Trader Workstation profesional', 'Reglementat SEC/FINRA/FCA'],
    url: 'https://www.interactivebrokers.eu/ro/index.php?f=1338',
    asf: 'Notificare ASF · pașaport UE (Ireland)',
    logoText: 'IB',
    accent: 'bg-zinc-950 text-white',
  },
  {
    id: 'etoro',
    name: 'eToro Romania',
    tagline: 'Social trading · copy portfolios',
    highlights: ['0% comision acțiuni', 'Copy trading (copiază traderi TOP)', 'App mobil premiată', 'Reglementat CySEC + ASF'],
    url: 'https://www.etoro.com/ro/sign-up',
    asf: 'Notificare ASF · pașaport UE',
    logoText: 'eT',
    accent: 'bg-violet-950 text-white',
  },
];

const STEPS = [
  { icon: IdCard,        step: '01', title: 'Alegi brokerul',       desc: 'Compari comisioane, platforme și servicii. Alegi unul din cei 6 brokeri autorizați ASF de mai jos.' },
  { icon: FileSignature, step: '02', title: 'Deschizi contul',      desc: '100% online: încarci CI (față/verso), completezi chestionar MiFID II, semnezi contractul cu semnătură electronică.' },
  { icon: Banknote,      step: '03', title: 'Alimentezi contul',    desc: 'Transfer bancar din contul tău personal (SEPA sau intern) — în general fără comisioane de la brokeri.' },
  { icon: Search,        step: '04', title: 'Studiezi companiile',  desc: 'Rapoarte anuale/semestriale, prospecte IPO, calendar dividende — toate publice pe bvb.ro (secțiunea „Emitenți").' },
  { icon: LineChart,     step: '05', title: 'Plasezi ordinul',      desc: 'Din platforma broker-ului (web sau app): ordin la piață, limită sau stop-loss. Sesiunea BVB: 10:00–17:45.' },
  { icon: Bell,          step: '06', title: 'Monitorizezi + reinvestești', desc: 'Companiile mari plătesc dividende de 2–3 ori/an. Reinvestiția compusă = cheia performanței pe termen lung.' },
];

export default function InvestitiiBursa() {
  useSEO({
    title: 'Investiții BVB · Prețuri live + Brokeri autorizați ASF · Energy Project Design',
    description: 'Prețuri live TradingView pentru companiile energetice românești (Romgaz, OMV Petrom, Transgaz, Transelectrica, Electrica, Nuclearelectrica, Hidroelectrica) + director complet brokeri autorizați ASF cu link-uri directe deschidere cont: BT Capital Partners, TradeVille, XTB, Goldring, Interactive Brokers, eToro.',
    canonical: 'https://www.energyprojectdesign.com/investitii-bursa',
    keywords: 'investiții BVB live, prețuri Romgaz SNG, TradeVille, BT Capital Partners, XTB Romania, Goldring, Interactive Brokers, eToro Romania, cum deschid cont demat, cum investesc la bursă',
    breadcrumbs: [{ name: 'Acasă', url: '/' }, { name: 'Investiții BVB', url: '/investitii-bursa' }],
  });

  return (
    <div className="min-h-screen bg-white text-zinc-900" data-testid="page-investitii-bursa">
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0"><EPDLogo /></Link>
          <div className="hidden xl:flex items-center gap-5 text-[13px] font-medium">
            <Link to="/" className="text-zinc-600 hover:text-zinc-950">Acasă</Link>
            <Link to="/afaceri-b2b" className="text-zinc-600 hover:text-zinc-950">Afaceri B2B</Link>
            <span className="text-zinc-950 font-semibold">Investiții BVB</span>
            <a href="#brokeri" className="text-zinc-600 hover:text-zinc-950">Brokeri</a>
            <Link to="/contact" className="text-zinc-600 hover:text-zinc-950">Contact</Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <GlobalTranslator variant="light" />
            <a href="#brokeri" className="epd-btn text-sm py-2 whitespace-nowrap" data-testid="hero-cta-open-account">
              Deschide cont
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-8 lg:pt-28 lg:pb-10 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(124,58,237,0.20) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(76,29,149,0.15) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-emerald-500/40 rounded-full text-[10px] uppercase tracking-[0.25em] text-emerald-300 mb-4 backdrop-blur-sm bg-emerald-500/5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span>// LIVE · Bursa de Valori București</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02] mb-4 text-white font-display">
              Investiții BVB reale.<br/>
              <span className="italic text-violet-400 font-normal">Prețuri live. Brokeri autorizați ASF.</span>
            </h1>
            <p className="text-base lg:text-lg text-zinc-300 leading-relaxed mb-6 max-w-2xl">
              Cotații live TradingView pentru emitenții energetici români + gateway direct
              spre brokerii autorizați ASF unde-ți poți deschide cont demat 100% online.
            </p>
          </div>
        </div>
        {/* Ticker LIVE — se autoîncarcă cu widgetul TradingView */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-4 relative">
          <TradingViewTicker />
        </div>
      </section>

      {/* PREȚURI LIVE PER COMPANIE */}
      <section className="py-12 lg:py-16 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-2">// prețuri LIVE · click pe „vezi pe BVB" pentru raportul complet</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] text-zinc-950 font-display max-w-3xl">
                12 companii,<br/><span className="italic text-zinc-400 font-normal">actualizate în timp real.</span>
              </h2>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-semibold border-l-2 border-emerald-500 pl-2.5">
              Sursa cotații:<br/><span className="text-zinc-950 font-bold text-xs">TradingView / BVB</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPANIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.ticker} className="border border-zinc-200 hover:border-zinc-950 rounded-md overflow-hidden transition-all hover:shadow-lg group" data-testid={`bvb-company-${c.ticker}`}>
                  <div className="p-4 border-b border-zinc-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-zinc-950 text-white flex items-center justify-center">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold tracking-tight text-zinc-950">{c.name}</h3>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-violet-700 font-bold">{c.sector}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Ticker</div>
                        <div className="text-lg font-bold tabular-nums text-zinc-950 font-display tracking-tighter">{c.ticker}</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="bg-zinc-50">
                    <TradingViewMiniChart symbol={c.symbol} height={200} />
                  </div>
                  <a href={c.bvb} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors border-t border-zinc-100">
                    <span>Vezi raport oficial pe bvb.ro</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CUM DESCHIZI CONT DEMAT */}
      <section className="py-12 lg:py-16 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-3">// 6 pași · sub 30 minute · 100% online</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Cum îți deschizi contul<br/><span className="italic text-zinc-400 font-normal">de investiții.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="border border-zinc-200 bg-white rounded-md p-5 transition-all hover:border-zinc-950 hover:shadow-md" data-testid={`bvb-step-${s.step}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-md bg-zinc-950 text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold">Pas {s.step}</div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2 font-display">{s.title}</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIRECTOR BROKERI */}
      <section id="brokeri" className="py-12 lg:py-16 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-3">// brokeri autorizați ASF · click direct pentru deschidere cont</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Alege brokerul.<br/><span className="italic text-zinc-400 font-normal">Deschide contul în 15 minute.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BROKERS.map((b) => (
              <div key={b.id} className="border border-zinc-200 hover:border-zinc-950 bg-white rounded-md overflow-hidden transition-all hover:shadow-lg" data-testid={`broker-${b.id}`}>
                <div className={`${b.accent} p-5`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-11 h-11 rounded-md bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-bold text-lg tracking-tight font-display">
                      {b.logoText}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/60 font-bold text-right">ASF<br/><span className="text-white/90 font-mono normal-case tracking-normal text-[10px]">{b.asf}</span></div>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white mt-3 font-display">{b.name}</h3>
                  <p className="text-[11px] text-white/70">{b.tagline}</p>
                </div>
                <div className="p-5">
                  <ul className="space-y-2 mb-4">
                    {b.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2 text-xs text-zinc-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm px-4 py-2.5 rounded-md transition-all hover:-translate-y-0.5"
                    data-testid={`broker-cta-${b.id}`}
                  >
                    Deschide cont la {b.name}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="mt-2 text-[10px] text-zinc-500 text-center">Redirecționare directă la brokerul oficial</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER ASF */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="uppercase tracking-wider text-[11px]">Disclaimer legal · Conform reglementărilor ASF</strong><br/>
              Energy Project Design SRL <strong>NU este broker autorizat ASF</strong> și NU execută tranzacții cu instrumente financiare.
              Această pagină este strict un <strong>gateway informațional și educațional</strong> — link-urile trimit direct la brokerii licențiați
              care execută onboarding-ul și tranzacțiile conform propriilor termeni și condiții. Cotațiile TradingView sunt furnizate în
              regim informativ (delay standard 15 min pentru user-i neînregistrați). Investițiile în instrumente financiare implică
              <strong> risc de pierdere a capitalului investit</strong>. Consultați un consilier ASF autorizat înainte de orice decizie.
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 lg:py-16 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-violet-400 font-bold mb-3">// resurse oficiale</div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.02] mb-4 font-display">
            Sursa oficială: <span className="italic text-zinc-400 font-normal">BVB + ASF.</span>
          </h2>
          <p className="text-base text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Cotații complete, rapoarte anuale, comunicate emitenți, prospecte IPO, sancțiuni ASF —
            toate direct de la sursele oficiale.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a href="https://bvb.ro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-zinc-950 hover:bg-violet-50 font-semibold px-6 py-3 rounded-md text-sm transition-all hover:-translate-y-0.5 shadow-xl" data-testid="footer-cta-bvb">
              <TrendingUp className="w-4 h-4" />
              bvb.ro
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a href="https://asfromania.ro" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/25 hover:border-violet-400 hover:text-violet-300 px-5 py-3 rounded-md backdrop-blur-sm transition-all text-sm font-medium" data-testid="footer-cta-asf">
              asfromania.ro (supraveghere)
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
