/**
 * Voturi Electronice CNP — pagină prezentare misiune EPD V11.2
 *
 * Concept: vot cetățenesc digital pe baza CNP-ului (hash criptografic),
 * cu trasabilitate completă și anonimizare opt-in.
 *
 * Statut: PROTOTIP / PRESENTATION — necesită cadru legal eIDAS + ROUE digital
 * pentru implementare reală. Widget-ul demo arată CUM ar funcționa.
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Vote, ShieldCheck, Eye, Hash, Lock, Globe, CheckCircle2,
  ArrowRight, AlertTriangle, Sparkles, TrendingUp, Users, FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EPDLogo from '../components/EPDLogo';
import useSEO from '../hooks/useSEO';

const PILLARS = [
  { icon: Hash, label: 'Anonimat criptografic', desc: 'CNP-ul este hash-uit (SHA-256 + salt) înainte de stocare. Identitatea reală NU este vizibilă administratorilor.' },
  { icon: ShieldCheck, label: 'Un vot per CNP', desc: 'Sistemul respinge orice tentativă de dublu-vot. Auditul este public, transparent și inviolabil.' },
  { icon: Eye, label: 'Audit on-chain', desc: 'Fiecare vot este sigilat cu timestamp și hash blockchain — autoritățile pot verifica totalul fără să vadă cine a votat ce.' },
  { icon: Lock, label: 'Conform GDPR + eIDAS', desc: 'Construit pentru cadrul legal european. CNP-ul real este stocat doar în memoria efemeră, niciodată persistat.' },
  { icon: Globe, label: 'Acces de oriunde', desc: 'Vot de pe desktop, mobil, sau tabletă. Acces 24/7 pentru cetățenii români — chiar și diaspora.' },
  { icon: TrendingUp, label: 'Rezultate live', desc: 'Tabel rezultate public, actualizat în timp real, cu defalcare per județ + grup demografic anonimizat.' },
];

const USE_CASES = [
  { title: 'Referendum național', desc: 'Întrebări binare („Da/Nu") sau multiple-choice, deschise pe perioade definite legal.', icon: '🇷🇴' },
  { title: 'Alegeri locale', desc: 'Vot pentru consilieri, primari și alți reprezentanți comunitari.', icon: '🏛️' },
  { title: 'Sondaje publice oficiale', desc: 'Inițiative ministeriale care colectează feedback cetățenesc rapid și legal.', icon: '📊' },
  { title: 'Bugetare participativă', desc: 'Cetățenii votează cum se alocă fonduri publice locale.', icon: '💰' },
  { title: 'Petiții cu efect legal', desc: 'Strângere semnături validate per CNP pentru a forța dezbateri parlamentare.', icon: '✍️' },
  { title: 'Voturi corporative AGA', desc: 'Acționari votează decizii folosind CNP + dovadă acționariat.', icon: '🏢' },
];

// Demo poll — mock, doar prezentare
const DEMO_POLL = {
  title: 'DEMO: Ar trebui să existe un sistem național de vot electronic în România?',
  desc: 'Acesta este un sondaj DEMO. Voturile sunt locale, nu se salvează pe server. Trasează doar conceptul tehnic.',
  options: [
    { id: 'da', label: 'Da, urgent', emoji: '✅' },
    { id: 'da_optional', label: 'Da, opțional pe lângă cel clasic', emoji: '👍' },
    { id: 'nu', label: 'Nu, riscuri prea mari', emoji: '❌' },
    { id: 'nush', label: 'Am nevoie de mai multe informații', emoji: '🤔' },
  ],
};

function DemoVoteWidget() {
  const { user } = useAuth();
  const [vote, setVote] = useState(null);
  const [counts, setCounts] = useState({ da: 12847, da_optional: 5621, nu: 1893, nush: 3104 });
  const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);

  // Mock hash for visual demo
  const mockHash = useMemo(() => {
    if (!user?.email) return '0x' + 'a'.repeat(8) + '…' + 'b'.repeat(8);
    // Simple deterministic short visual hash
    const seed = user.email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return '0x' + (seed * 7919).toString(16).slice(0, 8) + '…' + (seed * 31).toString(16).slice(0, 8);
  }, [user]);

  const castVote = (optId) => {
    if (vote) return;
    setVote(optId);
    setCounts(c => ({ ...c, [optId]: c[optId] + 1 }));
  };

  return (
    <div className="bg-white border border-violet-200 rounded-2xl p-6 shadow-xl" data-testid="demo-vote-widget">
      <div className="flex items-center gap-2 mb-1 text-xs uppercase tracking-wider text-violet-600 font-bold">
        <Sparkles className="w-3.5 h-3.5" /> Demo interactiv · doar conceptual
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{DEMO_POLL.title}</h3>
      <p className="text-xs text-slate-500 mb-4">{DEMO_POLL.desc}</p>

      {/* Identity panel */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500">Hash CNP (anonimizat):</span>
          <code className="font-mono text-violet-700 tabular-nums" data-testid="vote-hash">{mockHash}</code>
        </div>
        <div className="flex items-center gap-1 text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> {user ? 'Identitate verificată EPD' : 'Demo — fără identitate reală'}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {DEMO_POLL.options.map(opt => {
          const cnt = counts[opt.id];
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const isMine = vote === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => castVote(opt.id)}
              disabled={!!vote}
              className={`relative w-full text-left p-3 border rounded-lg transition-all overflow-hidden disabled:cursor-not-allowed ${
                isMine ? 'border-violet-500 bg-violet-50' :
                vote ? 'border-slate-200 bg-slate-50' :
                'border-slate-200 hover:border-violet-300 hover:bg-violet-50'
              }`}
              data-testid={`vote-option-${opt.id}`}
            >
              {vote && (
                <div className="absolute inset-y-0 left-0 bg-violet-100 transition-all" style={{ width: `${pct}%` }} />
              )}
              <div className="relative flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span className="text-base">{opt.emoji}</span>
                  {opt.label}
                  {isMine && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
                </span>
                {vote && <span className="text-xs font-bold text-violet-700 tabular-nums">{pct}% · {cnt.toLocaleString('ro-RO')}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {vote ? (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900" data-testid="vote-confirmation">
          <strong>✓ Vot înregistrat (demo).</strong> Total voturi: {total.toLocaleString('ro-RO')} · ultima actualizare: chiar acum
        </div>
      ) : (
        <div className="mt-4 text-xs text-slate-400 text-center">Selectează o opțiune pentru a vota.</div>
      )}
    </div>
  );
}

export default function VoturiCNP() {
  useSEO({
    title: 'Voturi Electronice CNP · Energy Project Design',
    description: 'Sistem de vot cetățenesc digital pe baza CNP-ului — anonim criptografic, conform GDPR + eIDAS, cu rezultate live. Misiunea EPD pentru democrație digitală în România.',
    canonical: 'https://www.energyprojectdesign.com/voturi-cnp',
    keywords: 'vot electronic, CNP, vot online, e-voting Romania, vot cetatenesc digital, EPD, e-democracy',
    breadcrumbs: [
      { name: 'Acasă', url: '/' },
      { name: 'Misiuni EPD', url: '/#next-gen' },
      { name: 'Voturi CNP', url: '/voturi-cnp' },
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
              <span className="font-bold text-sm text-slate-900">🗳️ Voturi CNP</span>
              <span className="text-[10px] uppercase tracking-wider text-violet-600">Misiune EPD</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-slate-600 hover:text-violet-700">Acasă</Link>
            <a href="#viziune" className="text-slate-600 hover:text-violet-700">Viziune</a>
            <a href="#demo" className="text-slate-600 hover:text-violet-700">Demo</a>
            <a href="#cadru-legal" className="text-slate-600 hover:text-violet-700">Cadru legal</a>
            <Link to="/register" className="epd-btn-primary">Înscrie-te în BETA</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="viziune" className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-900 text-white py-24" data-testid="voturi-hero">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, rgba(255,255,255,0.25) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(168,85,247,0.5) 0%, transparent 55%)' }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-6">
            <Sparkles className="w-3 h-3" /> // Misiune EPD · P0 · Feb 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-5">
            Vot cetățenesc digital. <br />
            <span className="text-violet-200">Pe baza CNP-ului. Anonim criptografic.</span>
          </h1>
          <p className="text-violet-100/90 text-base md:text-lg max-w-3xl mb-8 leading-relaxed">
            Imaginează-ți un sistem unde fiecare cetățean român — din țară sau din diasporă — poate vota de
            pe telefon, cu o garanție matematică că vocea sa contează exact o dată și că identitatea reală
            rămâne ascunsă chiar și administratorilor. Acesta este obiectivul EPD: aducerea democrației
            digitale în România prin tehnologie eIDAS + GDPR compatibilă.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#demo" className="px-5 py-2.5 bg-white text-violet-700 hover:bg-violet-50 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg transition-all" data-testid="cta-demo">
              Încearcă demo-ul <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#cadru-legal" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-lg font-medium text-sm transition-all">
              Vezi cadrul legal
            </a>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div><div className="text-3xl font-bold tabular-nums">19M+</div><div className="text-violet-200 text-xs uppercase tracking-wider">Cetățeni eligibili</div></div>
            <div><div className="text-3xl font-bold tabular-nums">&lt;3s</div><div className="text-violet-200 text-xs uppercase tracking-wider">Timp vot</div></div>
            <div><div className="text-3xl font-bold tabular-nums">100%</div><div className="text-violet-200 text-xs uppercase tracking-wider">Trasabilitate</div></div>
            <div><div className="text-3xl font-bold tabular-nums">0</div><div className="text-violet-200 text-xs uppercase tracking-wider">CNP-uri stocate</div></div>
          </div>
        </div>
      </section>

      {/* Pilari */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-bold mb-2">// Cei 6 piloni</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Ce face acest sistem diferit.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="voturi-pillars">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="p-6 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-lg transition-all hover-lift" data-testid={`pillar-${p.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white mb-3 shadow-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-900 mb-1">{p.label}</div>
                  <div className="text-sm text-slate-500 leading-relaxed">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" className="py-20 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-12 items-start">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-bold mb-2">// Demo interactiv</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Cum arată votul, pas cu pas.</h2>
            <ol className="space-y-4 text-sm text-slate-700 list-none counter-reset:step">
              <li className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">1</span><div><strong>Identificare cu CNP + eIDAS.</strong> Cetățeanul se autentifică cu certificat digital sau cont oficial ROUE.</div></li>
              <li className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">2</span><div><strong>Hash criptografic.</strong> CNP-ul real este transformat în SHA-256 + salt; CNP-ul brut nu părăsește niciodată browser-ul.</div></li>
              <li className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">3</span><div><strong>Vot semnat digital.</strong> Opțiunea aleasă este semnată cu cheia privată a cetățeanului și transmisă serverului.</div></li>
              <li className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">4</span><div><strong>Sigilare blockchain.</strong> Votul este adăugat într-un registru distribuit cu timestamp; orice modificare ulterioară devine vizibilă public.</div></li>
              <li className="flex gap-3"><span className="shrink-0 w-7 h-7 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs">5</span><div><strong>Rezultate live.</strong> Tabloul de bord public afișează scorurile imediat — fără să dezvăluie cine a votat ce.</div></li>
            </ol>
          </div>
          <DemoVoteWidget />
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-bold mb-2">// Aplicații reale</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">6 cazuri de utilizare imediate.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="use-cases-grid">
            {USE_CASES.map((u) => (
              <div key={u.title} className="p-6 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-lg transition-all" data-testid={`use-case-${u.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="text-3xl mb-3">{u.icon}</div>
                <div className="font-bold text-slate-900 mb-1">{u.title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section id="cadru-legal" className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-violet-300 font-bold mb-2">// Conformitate</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Construit pentru cadrul legal european.</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Sistemul este conceput de la zero să respecte legislația UE și națională:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" /><div><strong>Regulament eIDAS (UE 910/2014)</strong> — semnătură electronică calificată QES.</div></li>
                <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" /><div><strong>GDPR (UE 2016/679)</strong> — date personale anonimizate, drept la uitare implementat.</div></li>
                <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" /><div><strong>Legea 135/2007</strong> — comunicații electronice secure.</div></li>
                <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" /><div><strong>Legea 33/2007</strong> (votul prin corespondență) — bază legală extindere votul digital.</div></li>
                <li className="flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" /><div><strong>Programul ROUE Digital</strong> — integrare ROUE pentru identitate cetățeană.</div></li>
              </ul>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3 text-amber-300">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-xs">Statut Feb 2026</span>
              </div>
              <p className="text-sm text-amber-100/90 leading-relaxed mb-4">
                Acest sistem este în <strong>fază de prototip & advocacy</strong>. Implementarea oficială
                necesită aprobări Curtea Constituțională + Autoritatea Electorală Permanentă + STS.
              </p>
              <p className="text-sm text-amber-100/90 leading-relaxed">
                EPD susține adoptarea legislativă prin demonstrarea fezabilității tehnice cu acest demo.
                <strong> Înscrie-te în lista de așteptare</strong> pentru a fi notificat la lansarea oficială.
              </p>
              <Link to="/register" className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 hover:bg-amber-300 rounded-lg font-semibold text-sm transition-all" data-testid="cta-waitlist">
                <Users className="w-4 h-4" /> Înscrie-te BETA waitlist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-violet-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Susții digitalizarea democrației?</h2>
          <p className="text-violet-100/90 mb-8 max-w-2xl mx-auto">
            Energy Project Design construiește această platformă în interesul cetățeanului. Distribuie pagina,
            înscrie-te în lista BETA și ajută-ne să demonstrăm autorităților că soluția este pregătită.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="px-5 py-2.5 bg-white text-violet-700 hover:bg-violet-50 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg transition-all">
              <Vote className="w-4 h-4" /> Înscrie-te BETA
            </Link>
            <Link to="/" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 rounded-lg font-medium text-sm transition-all">
              Înapoi la EPD
            </Link>
          </div>
          <p className="text-xs text-violet-200/80 mt-8 italic">
            &ldquo;Tehnologia trebuie să servească democrația, nu să o submineze.&rdquo;
            <span className="block mt-1 text-violet-200/60">— Misiunea EPD · Feb 2026</span>
          </p>
        </div>
      </section>
    </div>
  );
}
