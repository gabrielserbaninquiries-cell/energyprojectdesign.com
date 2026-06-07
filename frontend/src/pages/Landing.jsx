import { Link } from 'react-router-dom';
import { Flame, FileText, Stamp, ShieldCheck, Mail, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HERO_BG = 'https://images.pexels.com/photos/36825977/pexels-photo-36825977.jpeg';
const FEATURE_DOCS = 'https://images.pexels.com/photos/8470057/pexels-photo-8470057.jpeg';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-black noise-overlay">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center">
              <Flame className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="font-bold tracking-tight text-lg">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-gray-700 hover:text-black">Funcționalități</a>
            <a href="#how" className="text-gray-700 hover:text-black">Cum funcționează</a>
            <Link to="/pricing" className="text-gray-700 hover:text-black" data-testid="nav-pricing">Tarife</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="amber-btn text-sm py-2" data-testid="cta-dashboard">Panou</Link>
            ) : (
              <>
                <Link to="/login" className="ghost-btn text-sm" data-testid="nav-login">Autentificare</Link>
                <Link to="/register" className="amber-btn text-sm py-2" data-testid="nav-register">Începe gratuit</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 stagger">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">
              <span className="w-8 h-px bg-[#FFB300]" /> International electronic technical documentation
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-6">
              Energy Project Design — <span className="bg-[#FFB300] px-2">certified</span> & digitally stamped technical documentation.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
              Platformă B2B multi-industrie (gaze, electric, fotovoltaice, telecom, HVAC, apă-canal, construcții, feroviar, drumuri) și multi-rol (Client, User, Angajat, Developer, Admin). Documentație inteligentă, calcul automat, ștampilă & semnătură electronică calificată (QES), AI Assistant + AI Developer, marketplace șabloane, SEAP alerts, contracte.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/register" className="amber-btn" data-testid="hero-cta-register">
                Începe gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="outline-btn" data-testid="hero-cta-pricing">Vezi tarifele</Link>
              <Link to="/industrii" className="text-sm text-gray-600 underline hover:text-black" data-testid="hero-cta-industrii">13 industrii →</Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <div className="text-3xl font-bold tracking-tight">13</div>
                <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">Industrii</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">56+</div>
                <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">Subdomenii</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">QES</div>
                <div className="text-xs uppercase tracking-[0.15em] text-gray-500 mt-1">eIDAS</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden border border-gray-200">
              <img src={HERO_BG} alt="Conducte de gaze industriale" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white border border-gray-200 p-5 shadow-lg max-w-[260px]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">Status document</div>
              <div className="flex items-center gap-2 text-sm font-semibold"><Check className="w-4 h-4 text-[#16A34A]" /> Semnat digital PKI</div>
              <div className="text-xs text-gray-500 mt-1 mono">SHA-256: a3f1…b9e4</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="py-20 bg-[#F9FAFB] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="label mb-3">// Funcționalități cheie</div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-12 max-w-2xl">Fluxul complet, de la șablon la livrare prin email.</h2>
          <div className="grid md:grid-cols-12 gap-px bg-gray-200 border border-gray-200">
            <div className="md:col-span-7 bg-white p-8 lg:p-10">
              <FileText className="w-7 h-7 mb-6" />
              <h3 className="text-xl font-semibold mb-2">Șabloane DOCX dinamice</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-md">Marcați variabilele cu <span className="mono bg-gray-100 px-1.5 py-0.5">{'{{nume_client}}'}</span> în Microsoft Word. La încărcare detectăm automat câmpurile și generăm formularul.</p>
              <img src={FEATURE_DOCS} alt="Plan inginerie" className="w-full h-48 object-cover border border-gray-200" />
            </div>
            <div className="md:col-span-5 bg-white p-8 lg:p-10">
              <Stamp className="w-7 h-7 mb-6" />
              <h3 className="text-xl font-semibold mb-2">Ștampile cu poziționare</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Încărcați ștampila firmei (PNG transparent), alegeți poziția pe pagină și dimensiunea în centimetri.</p>
            </div>
            <div className="md:col-span-5 bg-white p-8 lg:p-10">
              <ShieldCheck className="w-7 h-7 mb-6 text-[#FFB300]" />
              <h3 className="text-xl font-semibold mb-2">Semnătură digitală PKI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Importați certificatul <span className="mono">.p12</span> și generați semnătură CMS detașată conformă eIDAS.</p>
            </div>
            <div className="md:col-span-7 bg-white p-8 lg:p-10">
              <Mail className="w-7 h-7 mb-6" />
              <h3 className="text-xl font-semibold mb-2">Trimitere directă pe email</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Adăugați destinatari, subiect și mesaj — documentul stampilat și semnătura <span className="mono">.p7s</span> sunt atașate automat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Personas (roluri) */}
      <section className="py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="label mb-3">// Pentru cine</div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2 max-w-3xl">O platformă, 5 perspective.</h2>
          <p className="text-gray-600 mb-10 max-w-2xl">Clienți, utilizatori, angajați, developeri, admin — fiecare rol primește exact ce are nevoie.</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200">
            {[
              { slug: 'clienti', title: 'Clienți', desc: 'Beneficiari, primării, dezvoltatori', color: '#0EA5E9' },
              { slug: 'utilizatori', title: 'Utilizatori', desc: 'Proiectanți, VGD, RTE, arhitecți', color: '#FFB300' },
              { slug: 'angajati', title: 'Angajați', desc: 'Operatori, contabilitate, juridic', color: '#10B981' },
              { slug: 'developeri', title: 'Developeri', desc: 'Parteneri tehnici cu acces extins', color: '#8B5CF6' },
              { slug: 'admin', title: 'Admin', desc: 'Control total ENERGY PROJECT DESIGN', color: '#EF4444' },
            ].map((p) => (
              <Link
                key={p.slug}
                to={`/pentru/${p.slug}`}
                data-testid={`landing-persona-${p.slug}`}
                className="bg-white p-6 hover:bg-gray-50 group"
              >
                <div className="w-10 h-1.5 mb-4" style={{ backgroundColor: p.color }} />
                <div className="font-semibold mb-1">{p.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed mb-3">{p.desc}</div>
                <span className="text-xs uppercase tracking-[0.18em] text-gray-400 group-hover:text-black">Vezi →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="label mb-3">// Cum funcționează</div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-12">Patru pași până la documentul final.</h2>
          <ol className="grid md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            {[
              { n: '01', t: 'Încarcă șablonul', d: 'Document .docx cu marcaje {{variabile}}.' },
              { n: '02', t: 'Completează datele', d: 'Formular generat automat pentru fiecare câmp.' },
              { n: '03', t: 'Aplică ștampila & semnează', d: 'Ștampilă imagine + semnătură PKI .p12.' },
              { n: '04', t: 'Trimite pe email', d: 'Către beneficiar, autoritate sau colegi.' },
            ].map((s) => (
              <li key={s.n} className="bg-white p-8">
                <div className="mono text-xs text-[#FFB300] mb-4">{s.n}</div>
                <div className="font-semibold mb-2">{s.t}</div>
                <div className="text-sm text-gray-600">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-end">
          <div>
            <div className="label mb-3 text-[#FFB300]">// Începe astăzi</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tighter leading-[1.05]">5 documente gratuit. Fără card. Fără bătaie de cap.</h2>
          </div>
          <div className="flex md:justify-end gap-3">
            <Link to="/register" className="amber-btn" data-testid="cta-bottom-register">Creează cont gratuit</Link>
            <Link to="/pricing" className="outline-btn bg-white">Vezi planurile</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} ENERGY PROJECT DESIGN SRL · CUI 43151074 · J40/12982/2020</div>
          <div className="flex gap-6">
            <Link to="/termeni" className="hover:text-black" data-testid="footer-termeni">Termeni</Link>
            <Link to="/confidentialitate" className="hover:text-black" data-testid="footer-confidentialitate">Confidențialitate</Link>
            <Link to="/gdpr" className="hover:text-black" data-testid="footer-gdpr">GDPR</Link>
            <span>contact@energyprojectdesign.ro</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
