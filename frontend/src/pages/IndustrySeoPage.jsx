// V10.6 — Industry SEO Page (parametrizable, single component)
// Renders any industry from /data/industryPages.js with full SEO meta tags,
// JSON-LD schema, multilingual hreflang and consistent EPD branding.
import { useParams, Navigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { findIndustry, INDUSTRY_PAGES } from '../data/industryPages';
import EPDLogo from '../components/EPDLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { ArrowRight, Mail, Sparkles, Check, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ACCENT = {
  amber:  { from: 'from-amber-500',  to: 'to-orange-500',   ring: 'ring-amber-200',  text: 'text-amber-700',  bg: 'bg-amber-50' },
  blue:   { from: 'from-blue-500',   to: 'to-cyan-500',     ring: 'ring-blue-200',   text: 'text-blue-700',   bg: 'bg-blue-50' },
  indigo: { from: 'from-indigo-500', to: 'to-violet-500',   ring: 'ring-indigo-200', text: 'text-indigo-700', bg: 'bg-indigo-50' },
  cyan:   { from: 'from-cyan-500',   to: 'to-sky-500',      ring: 'ring-cyan-200',   text: 'text-cyan-700',   bg: 'bg-cyan-50' },
  violet: { from: 'from-violet-500', to: 'to-fuchsia-500',  ring: 'ring-violet-200', text: 'text-violet-700', bg: 'bg-violet-50' },
  rose:   { from: 'from-rose-500',   to: 'to-pink-500',     ring: 'ring-rose-200',   text: 'text-rose-700',   bg: 'bg-rose-50' },
  green:  { from: 'from-emerald-500',to: 'to-teal-500',     ring: 'ring-emerald-200',text: 'text-emerald-700',bg: 'bg-emerald-50' },
};

export default function IndustrySeoPage() {
  // V10.6 — Routes are static (/aviatie, /investitori, ...) NOT :slug params,
  // so we read the slug from location.pathname (first segment).
  const location = useLocation();
  const params = useParams();
  const slug = params.slug || location.pathname.replace(/^\//, '').replace(/\/$/, '');
  const { user } = useAuth();
  const page = findIndustry(slug);

  useEffect(() => {
    if (!page) return;
    const url = `https://www.energyprojectdesign.com/${page.slug}`;
    // Title
    document.title = page.title_ro;
    // Meta tags
    const setMeta = (name, content, isProp = false) => {
      const sel = isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (isProp) el.setAttribute('property', name); else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('description', page.intro);
    setMeta('keywords', page.keywords);
    setMeta('og:title', page.title_ro, true);
    setMeta('og:description', page.intro, true);
    setMeta('og:url', url, true);
    setMeta('og:type', 'website', true);
    setMeta('og:image', 'https://www.energyprojectdesign.com/logo.png', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', page.title_ro);
    setMeta('twitter:description', page.intro);
    // Canonical
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = url;
    // JSON-LD Service schema
    const existing = document.getElementById('industry-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'industry-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.title_ro,
      description: page.intro,
      url,
      provider: {
        '@type': 'Organization',
        name: 'Energy Project Design',
        url: 'https://www.energyprojectdesign.com',
        logo: 'https://www.energyprojectdesign.com/logo.png',
      },
      areaServed: [{ '@type': 'Country', name: 'Romania' }, { '@type': 'Place', name: 'Global' }],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: page.eyebrow,
        itemListElement: page.bullets.map((b, i) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: b, position: i + 1 },
        })),
      },
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [page]);

  if (!page) {
    return <Navigate to="/" replace />;
  }

  const acc = ACCENT[page.accent] || ACCENT.violet;

  return (
    <div className="min-h-screen bg-white text-slate-900" data-testid={`industry-page-${slug}`}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link to="/" className="text-slate-600 hover:text-violet-700 transition-colors">Acasă</Link>
            <a href="/#main-product" className="text-slate-600 hover:text-violet-700 transition-colors">Gaze Naturale</a>
            <Link to="/pricing" className="text-slate-600 hover:text-violet-700 transition-colors">Tarife</Link>
            <Link to="/contact" className="text-slate-600 hover:text-violet-700 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            {user ? (
              <Link to="/dashboard" className="epd-btn text-sm py-2" data-testid="industry-cta-dashboard">Panou</Link>
            ) : (
              <Link to="/register" className="epd-btn text-sm py-2" data-testid="industry-cta-register">Începe gratuit</Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden bg-gradient-to-br ${acc.from} ${acc.to}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-slate-900/60 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/85 font-bold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// {page.eyebrow}</span>
            </div>
            <div className="text-7xl mb-4" aria-hidden="true">{page.icon}</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-6 text-white">
              {page.h1}
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-3xl mb-10 leading-relaxed">
              {page.intro}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${page.cta_email}?subject=Cerere%20demo%20${encodeURIComponent(page.title_ro)}`}
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-all"
                data-testid={`industry-cta-${slug}`}
              >
                <Mail className="w-4 h-4" />
                {page.cta_label}
              </a>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg backdrop-blur-sm transition-all"
              >
                Vezi tarifele <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {page.metrics.map((m) => (
              <div key={m.l} className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 tabular-nums">{m.v}</div>
                <div className={`text-[11px] uppercase tracking-wider ${acc.text} font-bold mt-1.5`}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bullets / Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Ce includem</div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-slate-900 mb-10 max-w-2xl">
            Documentație tehnică completă pentru fiecare scenariu.
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {page.bullets.map((b, i) => (
              <div key={i} className={`flex items-start gap-4 p-5 rounded-lg border border-slate-200 hover:${acc.ring} hover:ring-2 transition-all`}>
                <div className={`w-9 h-9 rounded-lg ${acc.bg} ${acc.text} flex items-center justify-center font-bold shrink-0`}>
                  <Check className="w-4 h-4" />
                </div>
                <div className="text-sm lg:text-base text-slate-700 leading-relaxed pt-1.5">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link other industries */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-6">
            <Globe className="w-3.5 h-3.5" />
            // Restul ecosistemului EPD
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {INDUSTRY_PAGES.filter((p) => p.slug !== slug).slice(0, 10).map((p) => (
              <Link
                key={p.slug}
                to={`/${p.slug}`}
                className="bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md p-4 rounded-lg transition-all group"
                data-testid={`crosslink-${p.slug}`}
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{p.title_ro.split('—')[0].trim()}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter mb-4">
            Gata să transformăm acest segment împreună?
          </h2>
          <p className="text-slate-300 mb-8">
            Energy Project Design unește toate industriile sub o singură platformă digitală — certificată, multilingvă, scalabilă global.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${page.cta_email}`}
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-all"
            >
              <Mail className="w-4 h-4" /> {page.cta_email}
            </a>
            <Link to="/register" className="inline-flex items-center gap-2 epd-btn">
              Începe gratuit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between flex-wrap gap-4">
          <div>© {new Date().getFullYear()} Energy Project Design SRL · CUI 43151074 · București</div>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/termeni" className="hover:text-white">Termeni</Link>
            <Link to="/confidentialitate" className="hover:text-white">Confidențialitate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
