/**
 * MissionPage — Pagină generică V1.2 pentru misiunile civice EPD.
 *
 * Rute:
 *   /petitii-campus     — Petiții modernizare campusuri universitare
 *   /petitii-sociale    — Petiții de interes social
 *   /jurnalism          — Jurnalism independent + plata contribuției
 *   /renovare-blocuri   — Renovare blocuri (energetic + estetic)
 *
 * Toate pornesc de la același template — profesional, alb/negru + violet accents.
 */
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, GraduationCap, ScrollText, Newspaper, Building2 } from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import { BRAND, BRAND_ASSETS } from '../lib/brand';
import useSEO from '../hooks/useSEO';

const MISSIONS = {
  '/petitii-campus': {
    icon: GraduationCap,
    slug: 'petitii-campus',
    tag: 'Educație & Comunitate',
    title: 'Petiții pentru modernizarea',
    titleItalic: 'campusurilor universitare.',
    subtitle: 'Studenții și absolvenții cer și susțin modernizări reale — infrastructură, laboratoare, cazare, alimentație.',
    description:
      'Fiecare campus universitar din România și din lume ar trebui să fie un loc unde studentul învață în condiții demne de secolul 21. Prin platforma EPD, deschidem petiții publice semnate digital de studenți, absolvenți și cadre didactice, cu follow-up transparent și răspuns instituțional obligatoriu.',
    features: [
      { label: 'Semnătură digitală calificată (QES eIDAS)', spec: 'Legală UE' },
      { label: 'Urmărire răspuns instituțional în timp real', spec: 'Transparent' },
      { label: 'Categorii: cazare, alimentație, laboratoare, sport', spec: '6 domenii' },
      { label: 'Integrare cu Ministerul Educației + ANOSR', spec: 'Oficial' },
      { label: 'Raport lunar public — impactul real al petițiilor', spec: 'Auditat' },
    ],
    seo: {
      title: 'Petiții modernizare campusuri universitare · EPD',
      description: 'Platformă publică pentru studenți și absolvenți — petiții semnate digital pentru modernizarea reală a campusurilor universitare din România și Europa. Semnătură QES eIDAS, urmărire răspuns instituțional, raport lunar.',
      keywords: 'petitie campus universitar, modernizare universitate, ANOSR, ministerul educatiei, semnatura digitala studenti, ',
    },
  },
  '/petitii-sociale': {
    icon: ScrollText,
    slug: 'petitii-sociale',
    tag: 'Cauze cetățenești',
    title: 'Petiții de',
    titleItalic: 'interes social.',
    subtitle: 'Platformă publică pentru orice cauză cetățenească — semnătură digitală, transparență totală, răspuns instituțional obligatoriu.',
    description:
      'De la pistele de biciclete în orașul tău, la reforestarea municipalității, la salvarea unei clădiri istorice — orice cauză publică merită o platformă unde vocile cetățenilor sunt numărate, verificate criptografic și duse până la instituția responsabilă.',
    features: [
      { label: 'Deschidere petiție în 3 minute', spec: 'Rapid' },
      { label: 'Verificare identitate prin CNP + Card ID', spec: 'Anti-fraudă' },
      { label: 'Categorii: mediu, urbanism, sănătate, cultură, educație', spec: '10 domenii' },
      { label: 'Integrare oficială cu primării și ministere', spec: 'B2G' },
      { label: 'Public dashboard cu status fiecărei petiții', spec: 'Live' },
    ],
    seo: {
      title: 'Petiții de interes social · Platformă cetățenească · EPD',
      description: 'Deschide petiții publice pentru orice cauză cetățenească — mediu, urbanism, sănătate, cultură. Semnătură digitală verificată prin CNP, transparență totală, răspuns oficial de la primării și ministere.',
      keywords: 'petitie cetateneasca online, cauza sociala Romania, semnatura digitala CNP, platforma petitii publice, primarii ministere',
    },
  },
  '/jurnalism': {
    icon: Newspaper,
    slug: 'jurnalism',
    tag: 'Presă independentă',
    title: 'Jurnalism independent',
    titleItalic: '+ plata contribuției.',
    subtitle: 'Autori publică articole editoriale cu remunerare directă — bază pentru o presă independentă, verificată și plătită corect.',
    description:
      'Presa modernă are nevoie de jurnaliști remunerați echitabil. EPD Journalism este platforma unde autorii publică articole verificate editorial, iar cititorii plătesc micro-abonamente sau tip-uri directe către autor. Zero clickbait, zero reclamă intruzivă, doar conținut de calitate.',
    features: [
      { label: 'Plata directă autor prin Stripe Connect', spec: 'Instant' },
      { label: 'Micro-abonament: 1 EUR / articol premium', spec: 'Flexibil' },
      { label: 'Editorial board verifică fiecare articol', spec: 'Anti-fake news' },
      { label: 'Domenii: politică, economie, tehnologie, cultură, sport', spec: '10 rubrici' },
      { label: 'Comentarii doar cu identitate verificată', spec: 'Anti-troll' },
    ],
    seo: {
      title: 'Jurnalism independent · Plata contribuției autor · EPD',
      description: 'Platforma unde jurnalismul independent este plătit corect. Autori remunerați direct prin Stripe Connect, cititori plătesc micro-abonamente. Editorial board verifică fiecare articol — anti fake news, anti clickbait.',
      keywords: 'jurnalism independent Romania, plata articole online, Stripe Connect autori, presa verificata, micro-abonament editorial',
    },
  },
  '/renovare-blocuri': {
    icon: Building2,
    slug: 'renovare-blocuri',
    tag: 'Locuire & Urbanism',
    title: 'Renovare blocuri',
    titleItalic: 'energetic + estetic.',
    subtitle: 'Anvelopare, ascensoare, reabilitare seismică, spații verzi — administratori de bloc conectați direct cu constructori și fonduri europene.',
    description:
      'Fiecare bloc din România și Europa merită o renovare completă — nu doar cosmetică, ci energetic (izolații, ferestre triple, panouri solare acoperiș), estetic (fațade contemporane), seismic (structural) și funcțional (ascensoare, spații verzi comune). EPD conectează administratorii de bloc cu constructori verificați și cu fonduri europene disponibile.',
    features: [
      { label: 'Auto-audit energetic online în 10 minute', spec: 'Gratuit' },
      { label: 'Matching cu constructori atestați MDLPA', spec: 'Verificați' },
      { label: 'Aplicație automată pentru fonduri europene', spec: 'PNRR + REPowerEU' },
      { label: 'Vot digital al proprietarilor pentru fiecare decizie', spec: 'Transparent' },
      { label: 'Contract standard + escrow plăți în tranșe', spec: 'Sigur' },
    ],
    seo: {
      title: 'Renovare blocuri · Energetic + estetic + seismic · EPD',
      description: 'Platformă pentru administratori de bloc și proprietari — audit energetic online, matching cu constructori atestați MDLPA, aplicație automată pentru fonduri europene PNRR + REPowerEU. Anvelopare, ascensoare, reabilitare seismică, spații verzi.',
      keywords: 'renovare bloc, anvelopare bloc, reabilitare seismica, fonduri europene bloc, PNRR renovare, administrator bloc',
    },
  },
};

export default function MissionPage() {
  const location = useLocation();
  const cfg = MISSIONS[location.pathname];

  useSEO({
    title: cfg?.seo.title || 'Misiune EPD',
    description: cfg?.seo.description,
    canonical: `https://www.energyprojectdesign.com${location.pathname}`,
    keywords: cfg?.seo.keywords,
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: cfg?.tag, url: location.pathname },
    ],
  });

  if (!cfg) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-950 mb-2">Misiune inexistentă</h1>
          <Link to="/" className="text-violet-600 hover:text-violet-800 underline">Înapoi acasă</Link>
        </div>
      </div>
    );
  }

  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Header identic peste tot */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="ghost-btn text-sm" data-testid="back-to-home"><ArrowLeft className="w-4 h-4" /> Înapoi la prezentare</Link>
        </div>
      </header>

      {/* HERO cinematic zinc + violet (fără foto) */}
      <section className="relative py-24 lg:py-32 overflow-hidden text-white bg-zinc-950">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, rgba(124,58,237,0.35) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(76,29,149,0.25) 0%, transparent 50%)' }} />
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 border border-violet-500/40 rounded-full text-[11px] uppercase tracking-[0.28em] text-violet-300 mb-8 backdrop-blur-sm bg-violet-500/5">
            <Icon className="w-3.5 h-3.5" />
            EPD · {cfg.tag}
          </div>
          <h1 className="text-4xl lg:text-7xl font-bold tracking-[-0.035em] leading-[0.98] mb-6 font-display">
            {cfg.title}<br/>
            <span className="italic text-violet-400 font-normal">{cfg.titleItalic}</span>
          </h1>
          <p className="text-lg lg:text-xl text-zinc-300 max-w-3xl leading-relaxed mb-4">{cfg.subtitle}</p>
        </div>
      </section>

      {/* Descriere + features editorial split */}
      <section className="py-24 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16">
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-violet-600 font-bold mb-4">// Despre această misiune</div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-zinc-950 mb-6 font-display leading-tight">
                Cum funcționează?
              </h2>
              <p className="text-base lg:text-lg text-zinc-600 leading-relaxed mb-6">{cfg.description}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-[11px] uppercase tracking-[0.22em] text-violet-800 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                Status: În cercetare · Lansare Q3 2026
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-bold mb-4">// Funcționalități</div>
              <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
                {cfg.features.map(f => (
                  <li key={f.label} className="py-3.5 flex items-center gap-4">
                    <Check className="w-4 h-4 text-violet-600 shrink-0" strokeWidth={2.2} />
                    <div className="flex-1 text-sm font-semibold text-zinc-950 tracking-tight">{f.label}</div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold shrink-0">{f.spec}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link to="/auth?mode=signup" className="epd-btn" data-testid="mission-cta">
              Vreau să contribui <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={`mailto:${BRAND.contactEmail}?subject=Parteneriat%20${cfg.tag}`} className="outline-btn">Scrie-ne pentru parteneriat</a>
            <Link to="/sponsorizeaza" className="outline-btn">Sponsorizează misiunea</Link>
          </div>
        </div>
      </section>

      {/* Footer scurt cu version badge */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} {BRAND.legalName.toUpperCase()} · {BRAND.tagline} · CUI {BRAND.cui}</span>
          <span className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-zinc-200 rounded-md font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />{BRAND.version} · {BRAND.versionCodename}
          </span>
        </div>
      </footer>
    </div>
  );
}
