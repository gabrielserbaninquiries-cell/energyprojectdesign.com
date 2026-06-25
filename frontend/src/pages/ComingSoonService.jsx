/**
 * V10.9 — ComingSoonService Page
 *
 * Pagină publică reutilizabilă pentru cele 6 servicii SOON expuse pe Landing
 * dar care nu aveau pagini dedicate (curierat, transport, mediu, spitale, caritabile, biserica).
 *
 * Folosește configurări centralizate din /data/comingSoonServices.js și se conectează
 * la useSEO pentru Google rich snippets (Service + Organization + Breadcrumb).
 */
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, Mail, Heart } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import useSEO from '../hooks/useSEO';
import COMING_SOON_SERVICES, { SITE } from '../data/comingSoonServices';

export default function ComingSoonService({ slug: slugProp }) {
  const params = useParams();
  const slug = slugProp || params.serviceSlug;
  const cfg = COMING_SOON_SERVICES[slug];

  // SEO hook MUST be called before any early return (React hooks rules)
  useSEO({
    title: cfg?.seoTitle || 'Serviciu EPD',
    description: cfg?.description || '',
    canonical: `${SITE}/${slug}`,
    keywords: cfg?.keywords || '',
    ogImage: cfg?.image,
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: cfg?.title || 'Serviciu', url: `/${slug}` },
    ],
    jsonLd: cfg ? {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: cfg.title,
      name: cfg.title,
      description: cfg.description,
      provider: {
        '@type': 'Organization',
        name: 'Energy Project Design',
        url: SITE,
      },
      areaServed: { '@type': 'Country', name: 'Romania' },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/PreOrder',
        url: `${SITE}/${slug}`,
      },
    } : null,
  });

  if (!cfg) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="text-sm text-slate-600 hover:text-violet-700 transition-colors inline-flex items-center gap-1.5" data-testid="back-home-link">
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la prezentare
          </Link>
        </div>
      </header>

      {/* Hero with real image */}
      <section
        className="relative overflow-hidden text-white py-24 lg:py-32"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(76,29,149,0.78) 50%, rgba(30,58,138,0.85) 100%), url(${cfg.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="coming-soon-hero"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold uppercase tracking-[0.18em] text-violet-200 mb-6 border border-white/20">
            <Sparkles className="w-3 h-3" /> {cfg.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-6">
            {cfg.headline}{' '}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
              {cfg.headlineAccent}
            </span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl leading-relaxed mb-8">
            {cfg.subheadline}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-lg transition-all shadow-lg"
              data-testid="hero-cta-primary"
            >
              Înregistrează-te ca early-adopter <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg backdrop-blur-sm transition-all"
              data-testid="hero-cta-contact"
            >
              <Mail className="w-4 h-4" /> Contactează echipa
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-slate-50 border-y border-slate-200" data-testid="stats-strip">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {cfg.stats.map((s, i) => (
            <div key={i} className="text-center" data-testid={`stat-${i}`}>
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-700 bg-clip-text text-transparent tabular-nums">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Funcționalități</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter">Ce vei putea face cu {cfg.title}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cfg.features.map((f, i) => (
              <div
                key={i}
                className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-violet-300 hover:shadow-md transition-all hover:-translate-y-1"
                data-testid={`feature-${i}`}
              >
                <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="text-base font-semibold text-slate-900 mb-1.5">{f.title}</div>
                <div className="text-sm text-slate-600 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description deep */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Despre serviciu</div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-5">Cum vom funcționa</h2>
          <p className="text-slate-700 text-lg leading-relaxed">
            {cfg.description}
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(76,29,149,0.85) 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <Heart className="w-12 h-12 text-violet-300 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter mb-5">
            Vrei să fii printre primii?
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Înregistrează-te acum și vei primi acces prioritar + 30% reducere pe primele 3 luni
            când lansăm oficial {cfg.title}.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-lg shadow-lg transition-all"
              data-testid="footer-cta-register"
            >
              Începe gratuit <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/sponsorizeaza"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg backdrop-blur-sm transition-all"
              data-testid="footer-cta-sponsor"
            >
              <Heart className="w-4 h-4" /> Susține dezvoltarea
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4">
          <div>© 2026 Energy Project Design S.R.L. · CUI 43151074</div>
          <div className="flex items-center gap-5">
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/termeni" className="hover:text-white">Termeni</Link>
            <Link to="/confidentialitate" className="hover:text-white">Confidențialitate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
