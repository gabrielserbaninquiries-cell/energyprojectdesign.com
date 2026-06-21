/**
 * Construcții — Pagină SEO public V10.1
 * Indexabilă pe Google sub site:energyprojectdesign.com → "Construcții"
 */
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Check, Sparkles } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import { BRAND, BRAND_ASSETS } from '../lib/brand';

const SUBSERVICES = [
  'Documentație DTAC / DTOE conform Legea 50/1991',
  'Carte tehnică construcție (Legea 10/1995)',
  'Memoriu tehnic + caiet de sarcini',
  'Verificare proiecte tehnice (verificatori atestați MDLPA)',
  'Recepție lucrări + PV faze determinante',
  'Avize și certificate urbanism integrate',
  'Sponsorizare lucrări publice',
];

export default function Constructii() {
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
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.88) 100%), url(${BRAND_ASSETS.cover2Smartcity})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-200 font-semibold mb-5">
            <Building2 className="w-3.5 h-3.5" />
            EPD · Construcții
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-5">
            Construcții.<br/>
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Documentație. Avize. Recepție.</span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl">
            Energy Project Design oferă documentație tehnică completă pentru construcții civile, industriale și speciale,
            conform Legea 50/1991, Legea 10/1995 și HG 273/1994. De la DTAC la cartea tehnică.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Servicii Construcții</div>
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 mb-8">Documentație completă pentru construcții</h2>
          <ul className="space-y-3 mb-10">
            {SUBSERVICES.map(s => (
              <li key={s} className="flex items-start gap-3 p-4 bg-white border border-slate-200 hover:border-violet-300 rounded-lg transition-colors">
                <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-800">{s}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap">
            <Link to="/register?next=constructii" className="epd-btn"><Sparkles className="w-4 h-4" />Începe proiect <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/sponsorizeaza" className="outline-btn"><span>♥</span> Sponsorizează cauza</Link>
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
