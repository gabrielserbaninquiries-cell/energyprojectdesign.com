/**
 * Documentație Electronică Digitală — Pagină SEO public V10.1
 * Indexabilă pe Google sub site:energyprojectdesign.com → "Documentație Electronică Digitală"
 */
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Check, ShieldCheck, FileSignature, Stamp } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import { BRAND, BRAND_ASSETS } from '../lib/brand';

const PILLARS = [
  { icon: FileText,      title: '33 template-uri DOCX',  desc: 'Conform NTPEE 2018, HG 273/1994, Legea 50/1991, Ord. ANRE 89/2018' },
  { icon: Stamp,         title: 'Ștampile draggable A4', desc: 'Plasare manuală sau automată pe orice document generat' },
  { icon: FileSignature, title: 'Semnătură QES eIDAS',   desc: 'Compatibil cu DigiSign și certSIGN (în pregătire)' },
  { icon: ShieldCheck,   title: '13 industrii reglementate', desc: 'Gaze, electric, fotovoltaic, telecom, HVAC, apă-canal, construcții, feroviar' },
];

export default function DocumentatieElectronica() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="text-sm text-slate-600 hover:text-violet-700 transition-colors">← Înapoi la prezentare</Link>
        </div>
      </header>

      <section className="relative py-20 lg:py-28 overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.85) 100%), url(${BRAND_ASSETS.cover1Futurist})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-200 font-semibold mb-5">
            <FileText className="w-3.5 h-3.5" />
            EPD · Documentație Electronică Digitală
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-5">
            Documentație tehnică<br/>
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">electronică, certificată digital.</span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl">
            Generăm automat dosare complete pentru proiecte tehnice — cu memoriu, caiete sarcini, borderouri,
            DTAC, cerere AC, PTH, carte tehnică. Cu ștampile digitale și semnătură QES eIDAS.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Tehnologie</div>
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 mb-8">Cele 4 piloni ai documentației EPD</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {PILLARS.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white border border-slate-200 hover:border-violet-300 rounded-xl p-5 transition-all">
                  <div className="w-10 h-10 rounded-lg epd-gradient flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-1">{p.title}</div>
                  <div className="text-sm text-slate-600">{p.desc}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/register?next=docs" className="epd-btn">Începe trial 14 zile <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/pricing" className="outline-btn">Vezi planurile</Link>
            <Link to="/contact" className="outline-btn">Contact direct</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {BRAND.legalName.toUpperCase()} · {BRAND.tagline} · CUI {BRAND.cui}
        </div>
      </footer>
    </div>
  );
}
