/**
 * Documentație Electronică Digitală — SEO public V1.1 (Editorial Magazine — zinc-950)
 * Aliniat cu Landing V13.6 (fost V10.1).
 */
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft, ShieldCheck, FileSignature, Stamp } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import SiteFooter from '../components/SiteFooter';
import { BRAND } from '../lib/brand';
import useSEO from '../hooks/useSEO';

const PILLARS = [
  { icon: FileText,      title: '33 template-uri DOCX',      desc: 'Conforme NTPEE 2018, HG 273/1994, Legea 50/1991, Ord. ANRE 89/2018' },
  { icon: Stamp,         title: 'Ștampile draggable A4',     desc: 'Plasare manuală sau automată pe orice document generat' },
  { icon: FileSignature, title: 'Semnătură QES eIDAS',       desc: 'Compatibil cu DigiSign și certSIGN (integrare pregătită)' },
  { icon: ShieldCheck,   title: '13 industrii reglementate', desc: 'Gaze, electric, fotovoltaic, telecom, HVAC, apă-canal, construcții, feroviar' },
];

export default function DocumentatieElectronica() {
  useSEO({
    title: 'Documentație Electronică Digitală · Semnătură QES eIDAS · 33 Template-uri · EPD',
    description: 'Documentație electronică digitală certificată cu semnătură electronică calificată (QES) eIDAS și ștampilă digitală. 33 template-uri DOCX conforme NTPEE 2018, HG 273/1994, Legea 50/1991, ANRE 89/2018. 13 industrii reglementate.',
    canonical: 'https://www.energyprojectdesign.com/documentatie-electronica',
    keywords: 'documentatie electronica digitala, semnatura electronica calificata QES, eIDAS, stampila digitala, template DOCX, NTPEE 2018, HG 273/1994, ANRE 89/2018, DigiSign certSIGN',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Documentație Electronică', url: '/documentatie-electronica' },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Documentație electronică certificată',
      name: 'Documentație Electronică Digitală EPD',
      provider: { '@type': 'Organization', name: 'Energy Project Design', url: 'https://www.energyprojectdesign.com' },
      areaServed: [{ '@type': 'Country', name: 'Romania' }, { '@type': 'Place', name: 'European Union' }],
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

      {/* HERO — cinematic zinc-950 + real document photo */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden text-white bg-zinc-950"
        style={{
          backgroundImage: 'linear-gradient(180deg, rgba(9,9,11,0.75) 0%, rgba(9,9,11,0.96) 100%), url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&q=85&auto=format&fit=crop)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-white/20 rounded-full text-[11px] uppercase tracking-[0.28em] text-zinc-300 mb-8 backdrop-blur-sm bg-white/5">
            <FileText className="w-3.5 h-3.5" />
            EPD · Documentație Electronică Digitală
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold tracking-[-0.035em] leading-[0.98] mb-6 font-display">
            Documentație tehnică<br/>
            <span className="italic text-zinc-400 font-normal">electronică, certificată digital.</span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Generăm automat dosare complete pentru proiecte tehnice — cu memoriu, caiete sarcini, borderouri,
            DTAC, cerere AC, PTH, carte tehnică. Cu ștampile digitale și semnătură QES eIDAS.
          </p>
        </div>
      </section>

      {/* Cei 4 piloni */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Tehnologie</div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-zinc-950 mb-10 font-display leading-[1.02]">
            Cei 4 piloni ai<br/><span className="italic text-zinc-400 font-normal">documentației EPD.</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {PILLARS.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white border border-zinc-200 hover:border-zinc-950 rounded-md p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg group">
                  <div className="w-10 h-10 rounded-md bg-zinc-950 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base font-bold text-zinc-950 mb-1 tracking-tight">{p.title}</div>
                  <div className="text-sm text-zinc-600 leading-relaxed">{p.desc}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/auth?mode=signup&next=docs" className="epd-btn" data-testid="docs-cta">Începe gratuit <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/pricing" className="outline-btn">Vezi planurile</Link>
            <Link to="/contact" className="outline-btn">Contact direct</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
