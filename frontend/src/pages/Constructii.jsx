/**
 * Construcții — SEO public page V1.1 (Editorial Magazine — zinc-950)
 * Aliniat cu Landing V13.6 (fost V10.1).
 * Indexabilă pe Google sub site:energyprojectdesign.com → „Construcții".
 */
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Check, ArrowLeft } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import { BRAND } from '../lib/brand';
import useSEO from '../hooks/useSEO';

const SUBSERVICES = [
  { label: 'Documentație DTAC / DTOE', spec: 'Legea 50/1991' },
  { label: 'Carte tehnică construcție', spec: 'Legea 10/1995' },
  { label: 'Memoriu tehnic + caiet de sarcini', spec: 'HG 273/1994' },
  { label: 'Verificare proiecte tehnice', spec: 'MDLPA atestat' },
  { label: 'Recepție lucrări + PV faze determinante', spec: 'HG 273/1994' },
  { label: 'Avize și certificate urbanism integrate', spec: 'Legea 350/2001' },
  { label: 'Sponsorizare lucrări publice', spec: 'Cont EPD dedicat' },
];

export default function Constructii() {
  useSEO({
    title: 'Construcții · DTAC · DTOE · Carte tehnică · Legea 10/1995 · EPD',
    description: 'Documentație și management proiecte construcții conform Legii 50/1991 și Legii 10/1995: DTAC, DTOE, memoriu tehnic, caiet de sarcini, carte tehnică, verificare proiecte (MDLPA), recepție lucrări, PV faze determinante, avize urbanism. Platformă EPD multi-industrie.',
    canonical: 'https://www.energyprojectdesign.com/constructii',
    keywords: 'constructii Romania, DTAC, DTOE, carte tehnica constructii, Legea 50/1991, Legea 10/1995, MDLPA verificare, memoriu tehnic, caiet sarcini, certificat urbanism, autorizatie constructie, receptie lucrari, PV faze determinante, energy project design',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Construcții', url: '/constructii' },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Documentație construcții',
      name: 'Construcții — Documentație Tehnică Digitală EPD',
      provider: { '@type': 'Organization', name: 'Energy Project Design', url: 'https://www.energyprojectdesign.com' },
      areaServed: { '@type': 'Country', name: 'Romania' },
    },
  });

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="ghost-btn text-sm" data-testid="back-to-home"><ArrowLeft className="w-4 h-4" /> Înapoi la prezentare</Link>
        </div>
      </header>

      {/* HERO editorial zinc-950 + real construction site photo */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden text-white bg-zinc-950"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(9,9,11,0.72) 0%, rgba(9,9,11,0.94) 100%), url(https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=1920&q=85&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-white/20 rounded-full text-[11px] uppercase tracking-[0.28em] text-zinc-300 mb-8 backdrop-blur-sm bg-white/5">
            <Building2 className="w-3.5 h-3.5" />
            EPD · Construcții
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold tracking-[-0.035em] leading-[0.98] mb-6 font-display">
            Construcții.<br/>
            <span className="italic text-zinc-400 font-normal">Documentație. Avize. Recepție.</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Energy Project Design oferă documentație tehnică completă pentru construcții civile, industriale și speciale,
            conform Legea 50/1991, Legea 10/1995 și HG 273/1994. De la DTAC la cartea tehnică.
          </p>
        </div>
      </section>

      {/* Servicii — editorial divide list */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Servicii Construcții</div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-zinc-950 mb-10 font-display leading-[1.02]">
            Documentație completă<br/><span className="italic text-zinc-400 font-normal">pentru construcții.</span>
          </h2>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200 mb-10">
            {SUBSERVICES.map(s => (
              <li key={s.label} className="py-4 flex items-center gap-4 group">
                <Check className="w-4 h-4 text-zinc-950 shrink-0" strokeWidth={2.2} />
                <span className="flex-1 min-w-0 text-sm lg:text-base font-semibold text-zinc-950 tracking-tight">{s.label}</span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold shrink-0">{s.spec}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap">
            <Link to="/auth?mode=signup&next=constructii" className="epd-btn" data-testid="constructii-cta">Începe proiect <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/sponsorizeaza" className="outline-btn">♥ Sponsorizează cauza</Link>
            <Link to="/contact" className="outline-btn">Contact direct</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
