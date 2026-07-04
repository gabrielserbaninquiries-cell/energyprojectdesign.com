/**
 * SiteFooter — Footer reutilizabil V10.6 pentru toate paginile publice.
 *
 * Include:
 * - Logo EPD (consistent peste tot)
 * - Social media discrete (Facebook, Instagram, YouTube — brand oficial EPD)
 * - Grid link-uri pentru SEO (rute publice indexabile)
 * - Version badge 10.6.0000 · Pre-Jury Final
 * - Copyright legal + CUI + address
 */
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Shield } from 'lucide-react';
import EPDLogo from './EPDLogo';
import { BRAND } from '../lib/brand';

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/energyprojectdesign.srl',
    icon: Facebook,
    testid: 'social-facebook',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/energyprojectdesign',
    icon: Instagram,
    testid: 'social-instagram',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ENERGYPROJECTDESIGN',
    icon: Youtube,
    testid: 'social-youtube',
  },
];

const FOOTER_LINKS = [
  {
    title: 'Produse',
    links: [
      { label: 'Gaze Naturale', to: '/gaze-naturale' },
      { label: 'Construcții', to: '/constructii' },
      { label: 'Imobiliare', to: '/imobiliare' },
      { label: 'Documentație Electronică', to: '/documentatie-electronica' },
    ],
  },
  {
    title: 'Companie',
    links: [
      { label: 'Despre', to: '/despre' },
      { label: 'Transparență', to: '/transparenta' },
      { label: 'Investitori', to: '/investitori' },
      { label: 'Parteneri', to: '/parteneri' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Misiuni Sociale',
    links: [
      { label: 'Petiții campus', to: '/petitii-campus' },
      { label: 'Petiții sociale', to: '/petitii-sociale' },
      { label: 'Jurnalism independent', to: '/jurnalism' },
      { label: 'Renovare blocuri', to: '/renovare-blocuri' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termeni și condiții', to: '/termeni' },
      { label: 'Politica de confidențialitate', to: '/confidentialitate' },
      { label: 'GDPR', to: '/gdpr' },
      { label: 'Sponsorizează', to: '/sponsorizeaza' },
    ],
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50" data-testid="site-footer">
      {/* Main grid — 5 coloane pe desktop */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <EPDLogo />
            <p className="text-sm text-zinc-600 mt-4 leading-relaxed">
              {BRAND.tagline}
              <br />
              <span className="text-zinc-400 text-[13px]">The Architects of Future Global Technology</span>
            </p>
            {/* Social media discrete */}
            <div className="mt-5 flex items-center gap-2" aria-label="Rețele sociale oficiale Energy Project Design">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, testid }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Energy Project Design pe ${label}`}
                  title={label}
                  data-testid={testid}
                  className="w-9 h-9 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-white hover:bg-zinc-950 hover:border-zinc-950 flex items-center justify-center transition-all"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map(col => (
            <div key={col.title}>
              <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500 font-bold mb-4">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-zinc-700 hover:text-zinc-950 hover:underline transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar — legal + version + contact */}
      <div className="border-t border-zinc-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold text-zinc-800">© {year} {BRAND.legalName.toUpperCase()}</span>
            <span className="text-zinc-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3 h-3" /> CUI {BRAND.cui}
            </span>
            <span className="text-zinc-300">·</span>
            <span>Reg. Com. {BRAND.regCom}</span>
            <span className="text-zinc-300 hidden lg:inline">·</span>
            <span className="hidden lg:inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {BRAND.address}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`mailto:${BRAND.contactEmail}`} className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors">
              <Mail className="w-3 h-3" /> {BRAND.contactEmail}
            </a>
            <span
              className="inline-flex items-center gap-2 px-2 py-1 bg-zinc-950 text-white rounded-md font-mono text-[10px]"
              title="Versiunea curentă a platformei"
              data-testid="site-version-badge"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {BRAND.version} · {BRAND.versionCodename}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
