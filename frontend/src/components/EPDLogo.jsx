/**
 * EPDLogo — Single source of truth for logo rendering.
 *
 * Cerință user (mesaj 25): "langa numele companiei, te rog foloseste logo-ul acesta"
 * + "logo-ul companiei este trecut peste tot unde nu este sau unde ar trebui sa fie."
 *
 * Folosește imaginea oficială (img tag) — NU gradient CSS. Variante:
 * - `mark`     → doar cub-ul EP (header, sidebar, favicon)
 * - `full`     → cub + nume + tagline (login, hero, footer)
 * - `inline`   → cub + nume pe rând (cele mai comune folosiri)
 */
import { Link } from 'react-router-dom';
import { BRAND_ASSETS, BRAND } from '../lib/brand';

const SIZE_MAP = {
  xs: { mark: 'w-6 h-6',  text: 'text-xs',  sub: 'text-[8px]'  },
  sm: { mark: 'w-7 h-7',  text: 'text-sm',  sub: 'text-[9px]'  },
  md: { mark: 'w-9 h-9',  text: 'text-base',sub: 'text-[10px]' },
  lg: { mark: 'w-12 h-12',text: 'text-xl',  sub: 'text-[11px]' },
  xl: { mark: 'w-16 h-16',text: 'text-2xl', sub: 'text-xs'     },
  '2xl':{mark: 'w-24 h-24',text: 'text-3xl', sub: 'text-sm'    },
};

export default function EPDLogo({
  variant = 'inline',
  size = 'md',
  to = '/',
  withTagline = false,
  invert = false,        // text alb (pe fundal închis)
  className = '',
  noLink = false,
  testId = 'brand-link',
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const textColor = invert ? 'text-white' : 'text-slate-900';
  const taglineColor = invert ? 'text-violet-300' : 'text-violet-600';

  // doar cub
  if (variant === 'mark') {
    const inner = (
      <img
        src={BRAND_ASSETS.logoMark}
        alt="Energy Project Design"
        className={`${s.mark} rounded-lg shadow-md epd-logo-mark-crop overflow-hidden ${className}`}
        data-testid={`${testId}-mark`}
      />
    );
    if (noLink) return inner;
    return <Link to={to} data-testid={testId}>{inner}</Link>;
  }

  // logo complet stacked (centrat) — pentru login brand panel, hero
  if (variant === 'full') {
    const inner = (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <img
          src={BRAND_ASSETS.logoFull}
          alt="Energy Project Design — Redesigning projects."
          className="w-32 sm:w-40 lg:w-48 h-auto rounded-lg shadow-lg"
          data-testid={`${testId}-image`}
        />
      </div>
    );
    if (noLink) return inner;
    return <Link to={to} data-testid={testId}>{inner}</Link>;
  }

  // INLINE (default) — cub mic + text alăturat
  const inner = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={BRAND_ASSETS.logoMark}
        alt="Energy Project Design"
        className={`${s.mark} rounded-lg shadow-md shrink-0 epd-logo-mark-crop overflow-hidden`}
        data-testid={`${testId}-mark`}
      />
      <div className="leading-tight">
        <div className={`font-bold tracking-tight ${s.text} ${textColor}`}>
          Energy Project<span className="epd-gradient-text"> Design</span>
        </div>
        {withTagline && (
          <div className={`uppercase tracking-[0.22em] font-semibold ${s.sub} ${taglineColor} mt-0.5`}>
            {BRAND.tagline}
          </div>
        )}
      </div>
    </div>
  );

  if (noLink) return inner;
  return <Link to={to} data-testid={testId}>{inner}</Link>;
}
