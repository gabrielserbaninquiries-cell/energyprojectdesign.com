import { Link, useParams, Navigate } from 'react-router-dom';
import { Flame, ArrowRight, ArrowLeft, Check, Users, User, Briefcase, Code2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PERSONAS = {
  clienti: {
    slug: 'clienti',
    title: 'Pentru Clienți',
    tagline: 'Beneficiari finali: persoane fizice, primării, asociații de locatari, dezvoltatori, utilități publice.',
    icon: Users,
    color: '#0EA5E9',
    benefits: [
      'Dashboard simplu: vezi statusul cererilor, documente emise, plăți, reînnoiri.',
      'ID client public, recomandări pentru echipe verificate din platformă.',
      'Cere oferte de la proiectanți, executanți și verificatori ANRE.',
      'Primește documentația finală digital, ștampilată și semnată electronic (QES).',
      'Avertizări automate pentru reînnoiri ITP, revizii, autorizații.',
    ],
    pages: [
      { label: 'Status documentație', to: '/status' },
      { label: 'Marketplace șabloane', to: '/feat-uri' },
      { label: 'Forum comunitate', to: '/forum' },
    ],
    hashtags: ['#Clienti', '#Beneficiar', '#StatusDocumentatie', '#ConsumatorFinal'],
  },
  utilizatori: {
    slug: 'utilizatori',
    title: 'Pentru Utilizatori (Inginerii)',
    tagline: 'Proiectanți, executanți, verificatori VGD, RTE, arhitecți — toți specialiștii care întocmesc și verifică documentație tehnică.',
    icon: User,
    color: '#FFB300',
    benefits: [
      '14+ template-uri DOCX/PDF pre-seed pentru gaze, electrice, fotovoltaice, construcții.',
      'Date proiect + Calcul inteligent (debit, presiune, pierderi, randament fotovoltaic).',
      'Stamps & QES (eIDAS): aplică ștampila + semnătura electronică calificată într-un click.',
      'AI Assistant care interpretează comenzi în limbaj natural și recunoaște documente.',
      'SEAP Alerts: anunțuri lucrări publice filtrate pe autorizațiile ta ANRE.',
    ],
    pages: [
      { label: 'Proiecte', to: '/proiecte' },
      { label: 'Calcul inteligent', to: '/calcul' },
      { label: 'AI Assistant', to: '/ai' },
      { label: 'SEAP Alerts', to: '/seap-alerts' },
    ],
    hashtags: ['#Proiectant', '#VGD', '#RTE', '#Inginer', '#DocumentatieTehnica'],
  },
  angajati: {
    slug: 'angajati',
    title: 'Pentru Angajați',
    tagline: 'Echipele interne ENERGY PROJECT DESIGN și ale societăților partenere — operatori introducere date, contabilitate, juridic, ofertare.',
    icon: Briefcase,
    color: '#10B981',
    benefits: [
      'Roluri configurabile: Proiectare, Execuție, Avize, Contabilitate, Ofertare, VGD, RTE.',
      'Acces granular per departament și per proiect cu trasabilitate completă.',
      'Generare automată oferte, devize, contracte și e-Facturi UBL 2.1 către ANAF.',
      'CRM Abonați + Contracte: gestionează portofoliul clienților firmei.',
      'Registru audit (lifecycle) — fiecare acțiune este logată și verificabilă.',
    ],
    pages: [
      { label: 'CRM Abonați', to: '/crm-abonati' },
      { label: 'Contracte CRM', to: '/contracts' },
      { label: 'ANAF e-Factura', to: '/anaf-efactura' },
      { label: 'Registru audit', to: '/logs' },
    ],
    hashtags: ['#Echipa', '#Operator', '#Contabilitate', '#Juridic', '#Ofertare'],
  },
  developeri: {
    slug: 'developeri',
    title: 'Pentru Developeri',
    tagline: 'Developeri parteneri care pot extinde platforma, construi module noi și obține plan Developer (acces complet la AI Developer + GitHub push).',
    icon: Code2,
    color: '#8B5CF6',
    benefits: [
      'AI Developer Plan Mode: propuneri de update fără auto-apply, cu raport task-uri/fișiere/riscuri.',
      'AI Developer Chat (Claude Sonnet 4.6) — discuții pe codebase și arhitectură.',
      'Push direct în repo `dragosserban95/Energy-Project-Design` via UI.',
      'Marketplace pentru module: vinde plan Developer pentru clienții finali.',
      'Acces la pagina /developer/progres cu 7 faze build + 4 liste planificare.',
    ],
    pages: [
      { label: 'AI Developer', to: '/developer' },
      { label: 'AI Developer Chat', to: '/developer/chat' },
      { label: 'Push pe GitHub', to: '/developer/github' },
      { label: 'Progres build', to: '/developer/progres' },
    ],
    hashtags: ['#Developer', '#AIPlanMode', '#GitHubPush', '#OpenSource', '#API'],
  },
  admin: {
    slug: 'admin',
    title: 'Pentru Admin',
    tagline: 'Administrator ENERGY PROJECT DESIGN SRL — control total: planuri, conturi încasări, banner sistem, conformitate, audit.',
    icon: ShieldCheck,
    color: '#EF4444',
    benefits: [
      'Admin Config: banner mentenanță, mesaje urgente, fallback global.',
      'Conturi încasări (SEPA/Revolut) + reconciliere Stripe + e-Facturi UBL 2.1.',
      'Registry developeri & permisiuni granulare.',
      'Lifecycle proiecte (12 statusuri) + score audit ponderat pe 7 secțiuni.',
      'Raportare ANAF, GDPR export/delete, integritate digitală certificată.',
    ],
    pages: [
      { label: 'Admin Config', to: '/admin/config' },
      { label: 'Conturi încasări', to: '/admin/payment-accounts' },
      { label: 'Registru audit', to: '/logs' },
      { label: 'Profil societate', to: '/company' },
    ],
    hashtags: ['#Admin', '#Conformitate', '#ANAF', '#GDPR', '#Audit'],
  },
};

export default function Personas() {
  const { role } = useParams();
  const { user } = useAuth();
  const persona = PERSONAS[role];
  if (!persona) return <Navigate to="/" replace />;
  const Icon = persona.icon;

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" strokeWidth={2.5} /></div>
            <div className="font-bold tracking-tight text-lg">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="amber-btn text-sm py-2" data-testid="persona-cta-dashboard">Panou</Link>
            ) : (
              <>
                <Link to="/login" className="ghost-btn text-sm" data-testid="persona-cta-login">Autentificare</Link>
                <Link to="/register" className="amber-btn text-sm py-2" data-testid="persona-cta-register">Începe gratuit</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-6 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-black mb-6" data-testid="persona-back-home">
            <ArrowLeft className="w-3 h-3" /> Înapoi acasă
          </Link>

          <div className="flex items-start gap-6 mb-12">
            <div className="w-16 h-16 flex items-center justify-center text-white shrink-0" style={{ backgroundColor: persona.color }}>
              <Icon className="w-8 h-8" strokeWidth={2} />
            </div>
            <div>
              <div className="label mb-2">// Persona</div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-3" data-testid="persona-title">{persona.title}</h1>
              <p className="text-lg text-gray-600 max-w-2xl">{persona.tagline}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="label mb-3">// Beneficii cheie</div>
              <ul className="space-y-3" data-testid="persona-benefits">
                {persona.benefits.map((b, i) => (
                  <li key={i} className="flex gap-3 items-start border border-gray-200 p-4">
                    <Check className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed text-gray-800">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-gray-200 p-6 sticky top-24">
                <div className="label mb-3">// Pagini utile</div>
                <div className="space-y-2 mb-6" data-testid="persona-pages">
                  {persona.pages.map((p) => (
                    <Link key={p.to} to={p.to} className="flex items-center justify-between text-sm py-2 px-3 hover:bg-gray-50 border-l-2 border-transparent hover:border-[#FFB300]">
                      <span>{p.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
                <div className="label mb-2">// Hashtag-uri</div>
                <div className="flex flex-wrap gap-1.5" data-testid="persona-hashtags">
                  {persona.hashtags.map((h) => (
                    <span key={h} className="mono text-[11px] bg-gray-100 px-2 py-1 text-gray-700">{h}</span>
                  ))}
                </div>
                <Link to="/register" className="amber-btn w-full justify-center mt-6" data-testid="persona-cta-bottom">
                  Începe acum <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 lg:px-12 mt-20">
          <div className="label mb-3">// Toate persona-urile</div>
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Vezi platforma din perspectiva fiecărui rol</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 border border-gray-200">
            {Object.values(PERSONAS).map((p) => {
              const PI = p.icon;
              const active = p.slug === persona.slug;
              return (
                <Link
                  key={p.slug}
                  to={`/pentru/${p.slug}`}
                  data-testid={`persona-tile-${p.slug}`}
                  className={`bg-white p-5 hover:bg-gray-50 ${active ? 'ring-2 ring-[#FFB300] ring-inset' : ''}`}
                >
                  <div className="w-10 h-10 flex items-center justify-center text-white mb-3" style={{ backgroundColor: p.color }}>
                    <PI className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="font-semibold text-sm mb-1">{p.title.replace('Pentru ', '')}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{p.tagline}</div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} ENERGY PROJECT DESIGN SRL · CUI 43151074 · International electronic technical documentation, certified and digitally stamped.
        </div>
      </footer>
    </div>
  );
}
