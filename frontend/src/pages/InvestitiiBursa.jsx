/**
 * InvestitiiBursa — V13.9 (Feb 2026)
 *
 * Cerință explicită user:
 *   „vreau sa introduci si pagina cu investire la bursa in companii listate la bursa!"
 *
 * Directorul BVB · sectorul energetic + industrial român. Fiecare companie
 * listată la Bursa de Valori București este afișată cu tickerul, sectorul,
 * ce face și link direct spre pagina oficială BVB. Include disclaimer clar
 * conform legislației ASF (nu constituie sfat financiar / de investiții).
 */
import { Link } from 'react-router-dom';
import {
  TrendingUp, Building2, ExternalLink, ArrowRight, ShieldAlert,
  Landmark, Flame, Zap, Waves, Fuel, Wind, Factory,
} from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import GlobalTranslator from '../components/GlobalTranslator';
import useSEO from '../hooks/useSEO';

const COMPANIES = [
  {
    ticker: 'SNG',   name: 'Romgaz',            sector: 'Producție gaze naturale',
    icon: Flame,     bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNG',
    desc: 'Cel mai mare producător de gaze naturale din România. Rezerve certificate 40+ mld m³. Participat de statul român cu 70%.',
  },
  {
    ticker: 'SNP',   name: 'OMV Petrom',        sector: 'Petrol & Gaze integrat',
    icon: Fuel,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNP',
    desc: 'Cel mai mare grup integrat de petrol și gaze din sud-estul Europei. Rafinare + retail + upstream. Capitalizare de piață peste 10 mld EUR.',
  },
  {
    ticker: 'TGN',   name: 'Transgaz',          sector: 'Transport gaze naturale',
    icon: Building2, bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TGN',
    desc: 'Operator unic al sistemului național de transport gaze naturale (SNT). 13.481 km rețea, coridor BRUA, tarife reglementate ANRE.',
  },
  {
    ticker: 'TEL',   name: 'Transelectrica',    sector: 'Transport energie electrică',
    icon: Zap,       bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TEL',
    desc: 'Operator unic al sistemului de transport energie electrică (SEN). 8.900 km linii 220-400 kV. Reglementare ANRE.',
  },
  {
    ticker: 'EL',    name: 'Electrica',         sector: 'Distribuție & Furnizare',
    icon: Zap,       bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=EL',
    desc: 'Cel mai mare distribuitor și furnizor de energie electrică din România. 3.8 mil clienți în Muntenia Nord, Transilvania Nord & Sud.',
  },
  {
    ticker: 'SNN',   name: 'Nuclearelectrica',  sector: 'Energie nucleară',
    icon: Landmark,  bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=SNN',
    desc: 'Operator CNE Cernavodă (2 reactoare, 700 MW × 2). 20% din producția de energie a României. Proiect SMR NuScale în dezvoltare.',
  },
  {
    ticker: 'H2O',   name: 'Hidroelectrica',    sector: 'Hidroenergie',
    icon: Waves,     bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=H2O',
    desc: 'Cel mai mare producător de energie regenerabilă din România. 6.291 MW capacitate instalată, IPO record BVB (iulie 2023).',
  },
  {
    ticker: 'COTE',  name: 'Conpet',            sector: 'Transport țiței prin conducte',
    icon: Building2, bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=COTE',
    desc: 'Operator național al sistemului de transport țiței, gazolină și etan prin conducte. Peste 3.800 km infrastructură.',
  },
  {
    ticker: 'PTR',   name: 'Rompetrol Well Services', sector: 'Servicii sondaj petrolier',
    icon: Fuel,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=PTR',
    desc: 'Servicii specializate de intervenție și sondaj pentru industria upstream de petrol și gaze naturale.',
  },
  {
    ticker: 'M',     name: 'MedLife',           sector: 'Servicii medicale (industrie conexă)',
    icon: Factory,   bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=M',
    desc: 'Cea mai mare rețea privată de servicii medicale din România. Relevant pentru investitori diversificați pe piața internă.',
  },
  {
    ticker: 'DIGI',  name: 'Digi Communications', sector: 'Telecom & Media',
    icon: Wind,      bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=DIGI',
    desc: 'Operator integrat de telecomunicații — internet, telefonie, TV. Expansiune europeană activă (RCS-RDS + Spania + Italia + Portugalia).',
  },
  {
    ticker: 'TLV',   name: 'Banca Transilvania', sector: 'Financiar-bancar',
    icon: Landmark,  bvb: 'https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TLV',
    desc: 'Cea mai mare bancă privată din România. Finanțator strategic pentru proiecte energetice și industriale mari.',
  },
];

const HOW_TO_INVEST = [
  { step: '01', title: 'Cont demat',   desc: 'Deschide un cont de instrumente financiare la un broker autorizat ASF (BT Capital Partners, TradeVille, Goldring, XTB etc.).' },
  { step: '02', title: 'Studiu',       desc: 'Consultă rapoartele anuale, prospectele IPO și rating-urile din secțiunea „Emitenți" a BVB. Studiază pe minim 6 luni.' },
  { step: '03', title: 'Ordin',        desc: 'Plasează ordin (limită, la piață, stop-loss) prin platforma broker-ului tău. Executarea are loc în sesiunea BVB (10:00–17:45).' },
  { step: '04', title: 'Monitorizare', desc: 'Urmărește lunar rapoartele. Companiile mari plătesc dividende de 2–3 ori/an — reinvestiție compusă = cheia pe termen lung.' },
];

export default function InvestitiiBursa() {
  useSEO({
    title: 'Investiții BVB · Companii energetice românești listate · Energy Project Design',
    description: 'Director complet al companiilor energetice și industriale românești listate la Bursa de Valori București (BVB): Romgaz, OMV Petrom, Transgaz, Transelectrica, Electrica, Nuclearelectrica, Hidroelectrica. Ghid despre investiții la bursă.',
    canonical: 'https://www.energyprojectdesign.com/investitii-bursa',
    keywords: 'investiții BVB, Bursa de Valori București, Romgaz SNG, OMV Petrom SNP, Transgaz TGN, Transelectrica TEL, Electrica EL, Nuclearelectrica SNN, Hidroelectrica H2O, acțiuni energie, dividende BVB',
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
            <Link to="/pricing" className="text-zinc-600 hover:text-zinc-950">Tarife</Link>
            <Link to="/contact" className="text-zinc-600 hover:text-zinc-950">Contact</Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <GlobalTranslator variant="light" />
            <a href="https://bvb.ro" target="_blank" rel="noopener noreferrer" className="epd-btn text-sm py-2 whitespace-nowrap" data-testid="hero-cta-bvb">
              Vizitați BVB <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-28 pb-14 lg:pt-32 lg:pb-16 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(124,58,237,0.20) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(76,29,149,0.15) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-violet-500/40 rounded-full text-[10px] uppercase tracking-[0.25em] text-violet-300 mb-5 backdrop-blur-sm bg-violet-500/5">
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
              <span>// Investiții BVB · Sectorul energetic român</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.04em] leading-[1.02] mb-4 text-white font-display">
              Companii listate la BVB.<br/>
              <span className="italic text-violet-400 font-normal">Sectoare care ne alimentează.</span>
            </h1>
            <p className="text-base lg:text-lg text-zinc-300 leading-relaxed mb-6 max-w-2xl">
              Director curat al companiilor energetice, de transport, distribuție și infrastructură
              tranzacționate la Bursa de Valori București. Ticker, sector, ce fac și link direct
              spre pagina lor oficială BVB.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[
                { v: '12',    l: 'Emitenți listați' },
                { v: 'BVB',   l: 'Bursă reglementată' },
                { v: 'ASF',   l: 'Supraveghere' },
                { v: 'MSCI',  l: 'Frontier index' },
              ].map(s => (
                <div key={s.l} className="border-l-2 border-violet-500/40 pl-2.5">
                  <div className="text-xl lg:text-2xl font-bold tracking-tighter text-white tabular-nums font-display">{s.v}</div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 mt-1 font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIRECTOR COMPANII */}
      <section className="py-14 lg:py-20 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// director companii · alfabetic după sector</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Fiecare emitent,<br/><span className="italic text-zinc-400 font-normal">un click de la sursa oficială.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPANIES.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.ticker}
                  href={c.bvb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-zinc-200 hover:border-zinc-950 rounded-md p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg group block"
                  data-testid={`bvb-company-${c.ticker}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-md bg-zinc-950 text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Ticker BVB</div>
                      <div className="text-lg font-bold tabular-nums text-zinc-950 font-display tracking-tighter">{c.ticker}</div>
                    </div>
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-zinc-950 mb-1">{c.name}</h3>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-violet-700 font-bold mb-3">{c.sector}</div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{c.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-zinc-950 font-semibold transition-colors">
                    Vezi pe bvb.ro <ExternalLink className="w-3 h-3" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* CUM SE INVESTEȘTE */}
      <section className="py-14 lg:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// primii patru pași</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.03em] leading-[1.02] mb-10 text-zinc-950 font-display max-w-3xl">
            Cum investești la BVB.<br/><span className="italic text-zinc-400 font-normal">Regulile de bază.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_TO_INVEST.map((s) => (
              <div key={s.step} className="border-l-2 border-zinc-950 pl-5 py-1" data-testid={`bvb-step-${s.step}`}>
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold mb-2">Pas {s.step}</div>
                <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2 font-display">{s.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER ASF — obligatoriu legal */}
      <section className="py-10 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="uppercase tracking-wider text-[11px]">Disclaimer legal · ASF</strong><br/>
              Informațiile de pe această pagină au caracter <strong>strict educațional</strong> și nu constituie
              sfat de investiții, recomandare de cumpărare/vânzare sau ofertă publică. Investițiile în instrumente
              financiare implică <strong>risc de pierdere a capitalului investit</strong>. Consultați un consilier de
              investiții autorizat ASF și studiați prospectele oficiale înainte de orice decizie. Energy Project
              Design SRL nu răspunde pentru deciziile de investiții luate pe baza acestor informații.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 lg:py-20 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <div className="text-[10px] uppercase tracking-[0.32em] text-violet-400 font-bold mb-4">// legături directe</div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-[-0.03em] leading-[1.02] mb-6 font-display">
            Sursa oficială <span className="italic text-zinc-400 font-normal">BVB.</span>
          </h2>
          <p className="text-base lg:text-lg text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Cotații live, rapoarte anuale, comunicate emitenți, prospecte IPO — toate direct de la
            Bursa de Valori București.
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
