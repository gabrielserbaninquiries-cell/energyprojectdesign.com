/**
 * Sponsorizeaza — Donation page V9.5
 *
 * Cerință user: "Vreau sa adaugi o noua sectiune in pagina de prezentare —
 * 'Sponsorizeaza cauza', iar aceasta pagina sa contina un sumar al misiunii
 * EPD, si o posibilitate de donare suma in lei + euro flexibila, in contul
 * societatii."
 *
 * Integrare Stripe LIVE — donații one-time în RON / EUR direct în contul EPD SRL.
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Heart, ArrowRight, Check, Globe, Sparkles, Building2, FileText, ShieldCheck,
  Target, Users, Briefcase, TrendingUp, Lock,
} from 'lucide-react';
import { BRAND, BRAND_ASSETS } from '../lib/brand';
import EPDLogo from '../components/EPDLogo';
import api from '../lib/api';

const PRESET_AMOUNTS = {
  ron: [25, 50, 100, 250, 500, 1000],
  eur: [5, 10, 25, 50, 100, 250],
};

const MISSION_PILLARS = [
  { icon: Target,    title: 'Misiune principală',  desc: 'Reducem o firmă de proiectare-execuție de 20 angajați la 1-2 oameni prin automatizare totală a documentației tehnice.' },
  { icon: FileText,  title: 'Documente legale',    desc: '33 template-uri DOCX conforme NTPEE 2018, HG 273/1994, Legea 50/1991, Ord. ANRE 89/2018 — generate automat.' },
  { icon: Globe,     title: 'Viziune globală',     desc: 'Devenim #1 mondial pentru documentație tehnică digitală. 22 servicii globale în roadmap (energie, real estate, marketplace, logistică).' },
  { icon: Users,     title: 'Beneficiari',         desc: 'Proiectanți, executanți, VGD, RTE, firme de instalații, beneficiari finali — toți accesează platforma cu un singur cont.' },
  { icon: ShieldCheck,title: 'Valoare juridică',   desc: 'Semnătură electronică QES eIDAS + ștampile draggable + dispatch automat OSD. Documente cu valoare juridică reală.' },
  { icon: Briefcase, title: 'Cadru legal',         desc: '13 industrii reglementate · România → CEE → Global. Conformitate strictă ANRE, ISCIR, ATEX, MDLPA.' },
];

const USE_OF_FUNDS = [
  { pct: 40, label: 'Dezvoltare platformă',     desc: 'AI integrations, noi industrii, calc engines avansate' },
  { pct: 25, label: 'Infrastructură & securitate', desc: 'Servere, backup, conformitate GDPR, audit security' },
  { pct: 20, label: 'Certificări legale',       desc: 'Atestate ANRE, ISO, contracte OSD' },
  { pct: 10, label: 'Comunitate & educație',    desc: 'Forum tehnic, workshop-uri, materiale gratuite' },
  { pct: 5,  label: 'Costuri operaționale',     desc: 'Stripe fees, hosting, suport' },
];

export default function Sponsorizeaza() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [currency, setCurrency] = useState('ron');
  const [amount, setAmount] = useState(100);
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(null);
  const [thankNote, setThankNote] = useState(null);

  useEffect(() => {
    api.get('/donations/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/donations/thank-you-note').then(({ data }) => setThankNote(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'success') {
      toast.success('Mulțumim pentru sponsorizare! Donația va fi confirmată în câteva secunde.');
    } else if (status === 'cancelled') {
      toast.info('Donație anulată. Poți reîncerca oricând.');
    }
  }, [status]);

  const finalAmount = customMode ? parseFloat(customAmount) || 0 : amount;
  const minAmount = currency === 'ron' ? 5 : 1;
  const isValid = finalAmount >= minAmount && finalAmount <= 100000;

  const donate = async () => {
    if (!isValid) {
      toast.error(`Suma minimă: ${minAmount} ${currency.toUpperCase()}, max 100,000`);
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/donations/checkout', {
        amount: finalAmount,
        currency,
        donor_name: donorName || null,
        donor_email: donorEmail || null,
        message: message || null,
        origin_url: window.location.origin,
      });
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        toast.error('Eroare la inițializarea plății.');
      }
    } catch (e) {
      toast.error(`Eroare: ${e?.response?.data?.detail || e.message}`);
    } finally { setBusy(false); }
  };

  const presets = PRESET_AMOUNTS[currency];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header simplu */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <EPDLogo />
          <Link to="/" className="text-sm text-slate-600 hover:text-violet-700 transition-colors" data-testid="sponsor-back-home">
            ← Înapoi la prezentare
          </Link>
        </div>
      </header>

      {/* V9.5 — Banner success cu mesajul personal (afișat doar după donație reușită) */}
      {status === 'success' && thankNote && (
        <section className="bg-gradient-to-br from-fuchsia-50 via-violet-50 to-indigo-50 border-b-2 border-fuchsia-200 py-12" data-testid="thank-you-banner">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-fuchsia-500 fill-fuchsia-500" />
              <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-700 font-bold">// Mesaj personal de la EPD</div>
            </div>
            <div className="bg-white border border-fuchsia-200 rounded-xl p-8 epd-shadow-lg">
              <div className="text-slate-800 leading-relaxed whitespace-pre-line text-[15px] font-light italic" data-testid="thank-you-note-text">
                {thankNote.note}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm text-slate-600">
                  — <span className="font-semibold text-slate-900">{thankNote.signed_by}</span>
                </div>
                <a
                  href={`mailto:${thankNote.support_email}?subject=Opinia%20mea%20despre%20cauza%20EPD`}
                  className="text-xs uppercase tracking-wider font-semibold text-fuchsia-700 hover:text-fuchsia-900 inline-flex items-center gap-1.5 transition-colors"
                  data-testid="thank-you-feedback-link"
                >
                  ♥ Lasă-ne opinia ta → {thankNote.support_email}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section
        className="relative py-20 lg:py-28 overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.85) 50%, rgba(30,58,138,0.9) 100%), url(${BRAND_ASSETS.cover4Architects})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-violet-200 font-semibold mb-5">
            <Heart className="w-3.5 h-3.5 text-fuchsia-300 fill-fuchsia-300" />
            Sponsorizează cauza EPD
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-5">
            Construim împreună<br/>
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">viitorul documentației tehnice.</span>
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl leading-relaxed">
            Energy Project Design este o platformă globală în construcție continuă. Fiecare donație
            contribuie direct la dezvoltarea unei tehnologii care reduce birocrația și democratizează
            accesul la documentație tehnică certificată pentru întreaga lume.
          </p>
        </div>
      </section>

      {/* Misiune + Donation form */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-5 gap-10">
          {/* Stânga — Misiunea EPD (sumar) */}
          <div className="lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Misiunea Energy Project Design</div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter leading-[1.05] mb-5 text-slate-900">
              De ce avem nevoie de sponsorizare.
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
              EPD este o inițiativă privată care își propune să transforme industria proiectării
              tehnice — un domeniu dominat de birocrație, suprapuneri ineficiente și costuri ridicate.
              Construim o platformă care reduce timpul de elaborare al documentației de la zile la
              minute, păstrând conformitatea legală 100%. Donațiile tale susțin direct acest scop.
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {MISSION_PILLARS.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className="bg-white border border-slate-200 hover:border-violet-300 rounded-lg p-4 transition-all" data-testid={`mission-pillar-${m.title.toLowerCase().replace(/\s/g, '-')}`}>
                    <div className="w-9 h-9 rounded-md epd-gradient flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-white" strokeWidth={2.2} />
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">{m.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{m.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Cum folosim banii */}
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Cum folosim donațiile</h3>
              <p className="text-sm text-slate-500 mb-5">Distribuția transparentă a fondurilor primite — 100% reinvestite în platformă.</p>
              <div className="space-y-2.5">
                {USE_OF_FUNDS.map((u) => (
                  <div key={u.label} className="flex items-center gap-3" data-testid={`fund-use-${u.pct}`}>
                    <div className="w-12 text-right font-bold tabular-nums epd-gradient-text text-lg shrink-0">{u.pct}%</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{u.label}</div>
                      <div className="text-xs text-slate-500">{u.desc}</div>
                    </div>
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full epd-gradient" style={{ width: `${u.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dreapta — Donation form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-300 rounded-xl p-6 epd-shadow-lg" data-testid="donation-form">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-fuchsia-500 fill-fuchsia-500" />
                  <div className="text-[10px] uppercase tracking-[0.2em] text-violet-700 font-bold">// Donație Stripe securizată</div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Sumă flexibilă</h3>

                {/* Currency switch */}
                <div className="flex bg-slate-100 rounded-lg p-1 mb-5" data-testid="currency-switch">
                  <button
                    onClick={() => { setCurrency('ron'); setAmount(100); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${currency === 'ron' ? 'epd-gradient text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    data-testid="currency-ron"
                  >
                    RON
                  </button>
                  <button
                    onClick={() => { setCurrency('eur'); setAmount(25); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${currency === 'eur' ? 'epd-gradient text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                    data-testid="currency-eur"
                  >
                    EUR
                  </button>
                </div>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-2 mb-3" data-testid="amount-presets">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => { setAmount(p); setCustomMode(false); }}
                      className={`py-2.5 text-sm font-bold rounded-lg border transition-all ${
                        !customMode && amount === p
                          ? 'border-violet-500 bg-violet-100 text-violet-900'
                          : 'border-slate-200 hover:border-violet-300 text-slate-700'
                      }`}
                      data-testid={`amount-${p}`}
                    >
                      {p} {currency.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <button
                  onClick={() => setCustomMode(!customMode)}
                  className={`w-full mb-4 text-xs font-semibold uppercase tracking-wider py-2 rounded-md transition-colors ${
                    customMode ? 'text-violet-700 bg-violet-50' : 'text-slate-500 hover:text-violet-700'
                  }`}
                  data-testid="custom-amount-toggle"
                >
                  {customMode ? '← Înapoi la preset-uri' : 'sau introdu sumă personalizată →'}
                </button>
                {customMode && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sumă personalizată ({currency.toUpperCase()})</label>
                    <input
                      type="number"
                      min={minAmount}
                      max={100000}
                      step={currency === 'ron' ? 5 : 1}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`min ${minAmount}`}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      data-testid="custom-amount-input"
                    />
                  </div>
                )}

                {/* Donor info (optional) */}
                <details className="mb-4 group">
                  <summary className="cursor-pointer text-xs font-semibold text-slate-600 hover:text-violet-700 transition-colors py-2 select-none">
                    + Detalii donator (opțional)
                  </summary>
                  <div className="space-y-2.5 pt-2">
                    <input
                      type="text"
                      placeholder="Nume sau companie (opțional)"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                      data-testid="donor-name-input"
                    />
                    <input
                      type="email"
                      placeholder="Email (pentru chitanță)"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                      data-testid="donor-email-input"
                    />
                    <textarea
                      placeholder="Mesaj sau dedicație (max 200 caractere)"
                      maxLength={200}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-400"
                      data-testid="donor-message-input"
                    />
                  </div>
                </details>

                {/* CTA */}
                <button
                  onClick={donate}
                  disabled={busy || !isValid}
                  className="w-full epd-btn text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="donate-submit"
                >
                  {busy ? 'Se inițializează...' : (
                    <>
                      <Heart className="w-4 h-4 fill-white" />
                      Donează {finalAmount > 0 ? `${finalAmount} ${currency.toUpperCase()}` : ''}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Trust signals */}
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Plată securizată Stripe (PCI DSS Level 1)</div>
                  <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Beneficiar: Energy Project Design SRL · CUI {BRAND.cui}</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Chitanță automată pe email</div>
                </div>
              </div>

              {/* Stats */}
              {stats && stats.total_donations > 0 && (
                <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4" data-testid="donation-stats">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">// Sponsorizări primite</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><div className="text-xl font-bold tabular-nums text-slate-900">{stats.total_donations}</div><div className="text-[9px] uppercase tracking-wider text-slate-500">donații</div></div>
                    <div><div className="text-xl font-bold tabular-nums epd-gradient-text">{stats.total_ron.toFixed(0)}</div><div className="text-[9px] uppercase tracking-wider text-slate-500">RON total</div></div>
                    <div><div className="text-xl font-bold tabular-nums epd-gradient-text">{stats.total_eur.toFixed(0)}</div><div className="text-[9px] uppercase tracking-wider text-slate-500">EUR total</div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom — Bank transfer alternative */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Alternativă: virament bancar direct</div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">Preferi transfer bancar?</h3>
          <p className="text-slate-600 mb-5 text-sm">Poți dona direct în contul Energy Project Design SRL:</p>
          <div className="inline-flex flex-col items-start text-left bg-white border border-slate-200 rounded-lg p-5 epd-shadow text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
              <div className="text-slate-500">Beneficiar:</div><div className="font-semibold text-slate-900">Energy Project Design S.R.L.</div>
              <div className="text-slate-500">CUI:</div><div className="font-semibold text-slate-900 font-mono">{BRAND.cui}</div>
              <div className="text-slate-500">Reg. Com.:</div><div className="font-semibold text-slate-900 font-mono">{BRAND.regCom}</div>
              <div className="text-slate-500">IBAN RON:</div><div className="font-semibold text-violet-700 font-mono text-xs">Solicită prin email contact</div>
              <div className="text-slate-500">IBAN EUR:</div><div className="font-semibold text-violet-700 font-mono text-xs">Solicită prin email contact</div>
              <div className="text-slate-500">Email contact:</div><div className="font-semibold text-violet-700">{BRAND.contactEmail}</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-5 italic">Mențiune obligatorie: „Donație - dezvoltare platformă EPD&rdquo;</p>
        </div>
      </section>

      {/* Footer scurt */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} {BRAND.legalName.toUpperCase()} · Toate drepturile rezervate</div>
          <Link to="/" className="text-violet-600 hover:text-violet-900 italic">{BRAND.tagline}</Link>
        </div>
      </footer>
    </div>
  );
}
