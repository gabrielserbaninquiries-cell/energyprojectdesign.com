/**
 * Contact — Pagină SEO public V10.1
 * Indexabilă pe Google sub site:energyprojectdesign.com → "Contact"
 */
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Building2, Globe } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import { BRAND, BRAND_ASSETS } from '../lib/brand';

export default function Contact() {
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
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.85) 100%), url(${BRAND_ASSETS.cover3Office})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-200 font-semibold mb-5">
            <Mail className="w-3.5 h-3.5" />
            EPD · Contact
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-5">
            Vorbește direct cu noi.
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl">
            Pentru orice întrebare, oportunitate, parteneriat sau sugestie — îți răspundem personal.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-6 md:p-8 epd-shadow mb-6">
            <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Cele mai rapide moduri de contact</div>
            <h2 className="text-2xl font-bold tracking-tighter text-slate-900 mb-6">{BRAND.legalName}</h2>

            <div className="space-y-4">
              <a href={`mailto:${BRAND.contactEmail}`} className="flex items-start gap-3 p-4 bg-white border border-slate-200 hover:border-violet-300 rounded-lg transition-all group" data-testid="contact-email-office">
                <Mail className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Email principal</div>
                  <div className="text-base font-semibold text-slate-900 group-hover:text-violet-700">{BRAND.contactEmail}</div>
                </div>
              </a>

              <a href="mailto:support@energyprojectdesign.com" className="flex items-start gap-3 p-4 bg-white border border-slate-200 hover:border-violet-300 rounded-lg transition-all group" data-testid="contact-email-support">
                <Mail className="w-5 h-5 text-fuchsia-600 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Suport tehnic + opinii donatori</div>
                  <div className="text-base font-semibold text-slate-900 group-hover:text-violet-700">support@energyprojectdesign.com</div>
                </div>
              </a>

              <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg">
                <MapPin className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Sediu social</div>
                  <div className="text-base text-slate-900">{BRAND.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg">
                <Building2 className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Date legale</div>
                  <div className="text-base text-slate-900">CUI <span className="font-mono">{BRAND.cui}</span> · Reg. Com. <span className="font-mono">{BRAND.regCom}</span></div>
                </div>
              </div>

              <a href="https://www.facebook.com/energyprojectdesign.srl" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-4 bg-white border border-slate-200 hover:border-violet-300 rounded-lg transition-all group">
                <Globe className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Facebook oficial</div>
                  <div className="text-base font-semibold text-slate-900 group-hover:text-violet-700">facebook.com/energyprojectdesign.srl</div>
                </div>
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-500 text-center italic">
            Răspundem personal — nu suntem un bot. Promitem să nu te spammăm.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {BRAND.legalName.toUpperCase()} · {BRAND.tagline}
        </div>
      </footer>
    </div>
  );
}
