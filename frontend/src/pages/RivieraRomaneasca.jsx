/**
 * Riviera Românească — pagină de prezentare misiune EPD V11.9
 *
 * Concept: modernizarea reală a litoralului Mării Negre — infrastructură
 * contemporană, vegetație autohtonă rezistentă, identitate carpato-pontică.
 * NU concurență cu Grecia/Bulgaria — re-aducerea turismului românesc acasă.
 *
 * Statut: VISIUNE — site de prezentare/advocacy pentru a strânge susținere.
 */
import { Link } from 'react-router-dom';
import {
  Waves, TreePine, MapPin, Sun, Sparkles, ArrowRight, CheckCircle2,
  Users, TrendingUp, Heart, Globe2, Camera, Building2, Music,
} from 'lucide-react';
import EPDLogo from '../components/EPDLogo';
import useSEO from '../hooks/useSEO';

const STATIUNI = [
  { id: 'navodari', nume: 'Năvodari', km: 7, desc: 'Plajă lată cu nisip fin, perfectă pentru familii și sporturi acvatice.' },
  { id: 'mamaia', nume: 'Mamaia', km: 8, desc: 'Centrul nightlife-ului românesc — cluburi, hoteluri și plaje cu programe DJ.' },
  { id: 'constanta', nume: 'Constanța', km: 5, desc: 'Plaja Modern + centrul istoric Tomis, perfectă pentru turism cultural.' },
  { id: 'eforie-nord', nume: 'Eforie Nord', km: 5, desc: 'Tratamente cu nămol terapeutic — wellness și SPA tradițional.' },
  { id: 'eforie-sud', nume: 'Eforie Sud', km: 4, desc: 'Plajă liniștită, ideală pentru relaxare departe de aglomerație.' },
  { id: 'costinesti', nume: 'Costinești', km: 3, desc: 'Stațiunea tineretului — festivaluri, evenimente și prețuri populare.' },
  { id: 'olimp', nume: 'Olimp', km: 2, desc: 'Resort-uri pe falezele înalte, vedere panoramică spre mare.' },
  { id: 'neptun', nume: 'Neptun', km: 2, desc: 'Eleganță retro + parcuri umbroase și lacuri pitorești.' },
  { id: 'jupiter', nume: 'Jupiter', km: 2, desc: 'Promenadă cu vegetație autohtonă + restaurante tradiționale dobrogene.' },
  { id: 'aurora', nume: 'Aurora', km: 1, desc: 'Stațiune compactă, perfectă pentru sejururi familiale.' },
  { id: 'venus', nume: 'Venus', km: 2, desc: 'Hoteluri retro renovate, atmosferă autentic românească.' },
  { id: 'saturn', nume: 'Saturn', km: 2, desc: 'Aproape de Mangalia, plajă spațioasă și prețuri accesibile.' },
  { id: 'mangalia', nume: 'Mangalia', km: 4, desc: 'Cel mai sudic punct — arheologie, monumente Callatis și plaje sălbatice.' },
  { id: '2-mai', nume: '2 Mai', km: 4, desc: 'Faimoasă pentru atmosfera autentic boemă și gastronomia pescărească dobrogeană.' },
  { id: 'vama-veche', nume: 'Vama Veche', km: 3, desc: 'Iconic — muzică live, libertate și plajă naturistă.' },
];

const TOTAL_KM = STATIUNI.reduce((a, s) => a + s.km, 0);

const PILLARS = [
  { icon: TreePine, label: 'Vegetație autohtonă rezistentă', desc: 'Salcâmi galbeni, sălcii argintii, oțetar, plopi piramidali, tamarix (saramurar) și măsline ornamentale rezistente la -20°C — toate adaptate climei pontice. Fără palmieri tropicali artificiali care nu supraviețuiesc iernii.' },
  { icon: Waves, label: 'Reabilitare plaje cu nisip dobrogean', desc: 'Hrănire artificială cu nisip din depozitele Dobrogei (nu importat). Lățime medie 80m. 60+ km plajă continuă reabilitată profesional, cu protecție anti-eroziune.' },
  { icon: Building2, label: 'Promenadă continuă modernă', desc: 'Drum pietonal continuu Năvodari ↔ Vama Veche, cu piste bicicletă, lampadare LED și mobilier urban contemporan. Inspirat din promenadele atlantice (San Sebastián, Cádiz) — adaptat realității românești.' },
  { icon: Music, label: 'Cultură autentic românească', desc: 'Festivaluri folclorice dobrogene, concerte ale artiștilor români, târguri de meșteșuguri locale, gastronomie pescărească. NU copiem alte destinații — exportăm identitatea noastră.' },
  { icon: Heart, label: 'Prețuri accesibile românilor', desc: 'Cazare standard de la 120 RON/noapte (camping → 50 RON/noapte). Restaurante 40-60 RON/meniu cu specific dobrogean. Țintă: vacanță reală pentru familiile române cu venit mediu.' },
  { icon: Globe2, label: 'Re-aducere turism românesc acasă', desc: 'Misiunea NU este să furăm clienți din Grecia, Bulgaria sau Turcia. Misiunea ESTE să convingem românii să-și petreacă vacanța în țara lor. Doar după aceea — invitație pentru străini care vor autenticitate carpato-pontică.' },
];

const KPIS = [
  { label: 'km plajă reabilitată', value: TOTAL_KM, unit: 'km' },
  { label: 'stațiuni modernizate', value: STATIUNI.length, unit: '' },
  { label: 'investiție estimată', value: '€2,8B', unit: '' },
  { label: 'orizont realizare', value: '15 ani', unit: '' },
];

export default function RivieraRomaneasca() {
  useSEO({
    title: 'Riviera Românească · Renașterea litoralului Mării Negre — Energy Project Design',
    description: 'Misiunea EPD: modernizarea reală a litoralului românesc — 64 km plajă reabilitată, vegetație autohtonă rezistentă, infrastructură contemporană. Re-aducerea turismului românesc acasă, nu concurență cu alte țări.',
    canonical: 'https://www.energyprojectdesign.com/riviera-romaneasca',
    keywords: 'riviera romaneasca, litoral romanesc, modernizare litoral, marea neagra, turism romania, vama veche, mamaia, constanta, eforie, neptun, mangalia, EPD',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Misiuni EPD', url: '/#next-gen' },
      { name: 'Riviera Românească', url: '/riviera-romaneasca' },
    ],
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-home">
            <EPDLogo variant="mark" size="sm" noLink />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-sm text-slate-900">🏖️ Riviera Românească</span>
              <span className="text-[10px] uppercase tracking-wider text-amber-600">Misiune EPD</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-600 hover:text-amber-700">Acasă</Link>
            <a href="#viziune" className="text-slate-600 hover:text-amber-700">Viziune</a>
            <a href="#statiuni" className="text-slate-600 hover:text-amber-700">15 stațiuni</a>
            <a href="#actiune" className="text-slate-600 hover:text-amber-700">Susține</a>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 rounded-lg font-semibold text-sm transition-all shadow-md">Susține misiunea</Link>
          </nav>
        </div>
      </header>

      {/* Hero — tropical gradient with sun */}
      <section id="viziune" className="relative overflow-hidden text-white py-28" style={{
        background: 'linear-gradient(135deg, #F97316 0%, #EA580C 30%, #DC2626 60%, #BE185D 100%)',
      }} data-testid="riviera-hero">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,237,213,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(254,202,202,0.4) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/30 to-transparent" />
        {/* Decorative wave */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 50 }}>
          <path fill="rgba(255,255,255,0.15)" d="M0,32L80,37.3C160,43,320,53,480,53.3C640,53,800,43,960,32C1120,21,1280,11,1360,5.3L1440,0L1440,60L0,60Z" />
        </svg>
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-6">
            <Sparkles className="w-3 h-3" /> // Misiunea EPD · P0 · Feb 2026
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-5">
            Riviera Românească. <br />
            <span className="text-amber-100">Modernizare reală. Autenticitate.</span>
          </h1>
          <p className="text-amber-50/90 text-base md:text-xl max-w-3xl mb-8 leading-relaxed">
            Reabilitarea litoralului Mării Negre — de la Năvodari la Vama Veche — într-un standard contemporan, cu
            <strong> vegetație autohtonă rezistentă</strong>, infrastructură nouă și identitate carpato-pontică.
            <strong> NU vrem să furăm clienți</strong> din Grecia, Bulgaria sau Turcia. <strong>Vrem românii înapoi
            acasă</strong>, într-o destinație în care merită să-și petreacă vacanța. <strong>O misiune EPD.</strong>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#statiuni" className="px-6 py-3 bg-white text-orange-600 hover:bg-amber-50 rounded-lg font-bold text-sm flex items-center gap-2 shadow-2xl transition-all" data-testid="cta-statiuni">
              Vezi cele 15 stațiuni <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#actiune" className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 rounded-lg font-semibold text-sm transition-all">
              Cum poți ajuta
            </a>
          </div>
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
            {KPIS.map(k => (
              <div key={k.label} data-testid={`kpi-${k.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-4xl md:text-5xl font-bold tabular-nums">{k.value}</div>
                <div className="text-amber-100/80 text-xs uppercase tracking-wider mt-1">{k.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilari */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] uppercase tracking-[0.25em] text-orange-600 font-bold mb-2">// Pilonii proiectului</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">6 piloni care transformă litoralul.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="riviera-pillars">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="p-6 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all hover-lift" data-testid={`pillar-${p.label.toLowerCase().replace(/[\s.,]+/g, '-').slice(0, 30)}`}>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-3 shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 mb-1">{p.label}</div>
                  <div className="text-sm text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.desc }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cele 15 stațiuni */}
      <section id="statiuni" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase tracking-[0.25em] text-orange-600 font-bold mb-2">// {STATIUNI.length} stațiuni · {TOTAL_KM} km</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Riviera completă, de la Năvodari la Vama Veche.</h2>
            <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
              Fiecare stațiune își păstrează identitatea unică, dar toate sunt unite prin promenada de
              {' '}<strong>{TOTAL_KM} km</strong>, vegetație autohtonă și un standard comun de calitate „Riviera&rdquo;.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="statiuni-grid">
            {STATIUNI.map((s, idx) => (
              <div key={s.id} className="p-5 bg-white border border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all group" data-testid={`statiune-${s.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center">{idx + 1}</span>
                    <h3 className="font-bold text-slate-900">{s.nume}</h3>
                  </div>
                  <span className="text-xs font-bold text-orange-600 tabular-nums px-2 py-0.5 bg-orange-50 rounded">{s.km} km</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspirația — lecții urbanistice, NU copii */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(251,191,36,0.4) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(244,63,94,0.3) 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold mb-3">// Lecții urbanistice — nu copii de stil</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 max-w-3xl">Studii de caz internaționale, identitate românească.</h2>
          <p className="text-slate-300 mb-8 max-w-3xl">
            Studiem ce a funcționat altundeva — în infrastructură, accesibilitate, durabilitate.
            Stilul, gastronomia, vegetația și cultura rămân <strong className="text-amber-200">100% românești</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-xl">
              <div className="text-2xl mb-2">🇪🇸 Costa del Sol — lecție:</div>
              <div className="text-sm text-slate-300 leading-relaxed">Promenadă pietonală continuă + acces public neîntrerupt la plajă. Aplicăm modelul Marbella; estetica rămâne dobrogeană.</div>
            </div>
            <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-xl">
              <div className="text-2xl mb-2">🇵🇹 Algarve — lecție:</div>
              <div className="text-sm text-slate-300 leading-relaxed">Reabilitare ecologică a plajelor cu nisip local. Aplicăm metoda; nisipul vine din depozitele Dobrogei.</div>
            </div>
            <div className="p-5 bg-white/5 backdrop-blur border border-white/10 rounded-xl">
              <div className="text-2xl mb-2">🇮🇹 Cinque Terre — lecție:</div>
              <div className="text-sm text-slate-300 leading-relaxed">Identitate locală conservată riguros, fără concesii pentru turismul de masă. Aplicăm filozofia; identitatea e românească autentică.</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="text-sm text-amber-100">
              <strong className="text-amber-300">Important:</strong> NU construim &bdquo;Mini-Grecia&rdquo; sau &bdquo;Mini-Cancun&rdquo;. Construim Riviera Românească —
              cu arhitectură contemporană inspirată din tradiția dobrogeană, gastronomie pescărească locală, festivaluri ale identității carpato-pontice.
            </div>
          </div>
          <p className="mt-8 text-base md:text-lg italic text-slate-300 max-w-3xl">
            &bdquo;Litoralul românesc nu are nevoie de imitații. Are nevoie de modernizare reală — infrastructură,
            curățenie, identitate, prețuri sănătoase. Restul vine de la sine.&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-2 font-semibold">— Founder, EPD</p>
        </div>
      </section>

      {/* Acțiune */}
      <section id="actiune" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase tracking-[0.25em] text-orange-600 font-bold mb-2">// Cum poți ajuta</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">5 moduri să devii parte din misiune.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="actiune-grid">
            {[
              { num: 1, label: 'Distribuie pagina', desc: 'Share pe LinkedIn, Facebook, Instagram. Avem nevoie de viralitate.' },
              { num: 2, label: 'Semnează petiția', desc: 'Cerem CJ-uri Constanța să adopte oficial planul Riviera.' },
              { num: 3, label: 'Donează', desc: 'Fiecare 100 RON = 1 m² promenadă reabilitată. Vezi modulul donații EPD.' },
              { num: 4, label: 'Investește', desc: 'Capital privat pentru reabilitări hoteliere și branding intern.' },
              { num: 5, label: 'Lobby legal', desc: 'Susține adoptarea unei Legi a Litoralului Românesc.' },
            ].map((a) => (
              <div key={a.num} className="p-5 bg-white border border-orange-200 rounded-xl hover:border-orange-400 hover:shadow-lg transition-all text-center" data-testid={`actiune-${a.num}`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">{a.num}</div>
                <div className="font-bold text-slate-900 mb-1">{a.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 text-white relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
      }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Waves className="w-16 h-16 mx-auto mb-4 text-amber-100" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Renașterea litoralului începe cu un click.</h2>
          <p className="text-amber-50/90 mb-8 max-w-2xl mx-auto text-base md:text-lg">
            Înscrie-te pentru actualizări săptămânale, semnează petiția și hai să schimbăm împreună litoralul nostru.
            România merită un litoral modernizat real — nu un decor copiat din alte țări.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="px-6 py-3 bg-white text-orange-600 hover:bg-amber-50 rounded-lg font-bold text-sm flex items-center gap-2 shadow-2xl transition-all" data-testid="cta-register">
              <Sun className="w-4 h-4" /> Înscrie-te pentru BETA
            </Link>
            <Link to="/donations" className="px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all" data-testid="cta-donate">
              <Heart className="w-4 h-4" /> Donează 100 RON (1 m² promenadă)
            </Link>
            <Link to="/" className="px-6 py-3 text-amber-50 hover:text-white transition-colors font-medium text-sm">
              ← Înapoi la EPD
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
