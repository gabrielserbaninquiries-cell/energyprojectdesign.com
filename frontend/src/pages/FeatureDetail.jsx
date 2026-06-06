import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
  Bot, Building2, Briefcase, Users, Award, Mail, Scale, HeartHandshake,
  Wrench, ArrowLeft, Search, ClipboardCheck, BookOpen, Layers,
} from 'lucide-react';

// Pre-defined content per feature (skeleton style)
const FEATURE_DETAILS = {
  seap: {
    icon: Search,
    title: 'SEAP Alerts AI Agent',
    tagline: 'Notifică automat firmele despre licitațiile relevante pe baza autorizațiilor lor (ANRE/ANRP/ISCIR/AFER).',
    why: 'Firmele pierd oportunități de∈ licitații pentru că nu monitorizează zilnic SEAP. Agentul AI face asta automat.',
    how: [
      'Cron job nightly: fetch SEAP API public + parse XML/JSON',
      'Match licitații cu autorizațiile salvate în profilul firmei',
      'Email digest 9:00 AM cu top 10 oportunități',
      'Click → pre-fill ofertă în sistem',
    ],
    status: 'planned',
    requirements: ['Configurare CUI firmă', 'Listă autorizații salvate', 'Email valid', 'Acces SEAP API (public)'],
    next_steps: [
      'Implementare seap_integration.py (stub-ul există)',
      'Cron job via APScheduler sau cron Linux',
      'UI pentru configurare criterii match',
    ],
  },
  'ai-agents': {
    icon: Bot,
    title: '4 AI Agents specializați',
    tagline: 'Producer / User / Client / Developer — fiecare cu rol și context propriu.',
    why: 'Un singur AI generic nu poate răspunde optim la toate scenariile. Specializarea pe roluri optimizează răspunsurile.',
    how: [
      'Producer AI: analizează documentație veche → sugerează actualizări norme noi',
      'User AI: ghidează utilizatorul pe formular (validation realtime)',
      'Client AI: chat clienți cu recomandări tarife/servicii',
      'Developer AI: cod custom + modificări funcții (deja parțial implementat)',
    ],
    status: 'skeleton',
    requirements: ['EMERGENT_LLM_KEY (deja configurat)', 'Context specific per rol', 'Limita de rate per user'],
    next_steps: [
      'Backend: ai_agents.py registry (urmează)',
      'Endpoint GET /api/ai/agents (urmează)',
      'UI: separat chat per agent în /feat-uri/ai-agents',
    ],
  },
  subscribers: {
    icon: Users,
    title: 'Bază abonați + tarife chirii + contracte',
    tagline: 'Centralizează lista clienților cu contracte recurente și alerte renew.',
    why: 'Firme cu portofoliu mare de clienți recurenti pierd timp manual cu reminders. Sistem central + AI = optimizat.',
    how: [
      'CRUD subscribers: nume, CUI/CNP, email, telefon, tip serviciu',
      'Contracte: data început, durată, valoare, status (activ/expiră/renew)',
      'Alerte 30/15/7 zile înainte de expirare',
      'AI recomandă: tarif optim pentru renew bazat pe istoric',
    ],
    status: 'planned',
    requirements: ['MongoDB collections: subscribers, contracts', 'Email templates', 'AI recommendations engine'],
    next_steps: ['Adaugă modele backend', 'UI list/edit/create', 'Cron pentru alerte zilnice'],
  },
  jobs: {
    icon: Briefcase,
    title: 'Job Opportunities Marketplace',
    tagline: 'Match-uire proiectanți cu firmele afiliate care caută colaboratori.',
    why: 'Piața job-urilor ingineri (proiectanți, RTE, VGD) e fragmentată. EPD poate fi hub-ul.',
    how: [
      'Firme afiliate post-ează job-uri (location, tip, salar)',
      'Proiectanți văd job-uri matching profil (autorizații ANRE, experiență)',
      'AI scor matching 0-100% per anunț',
      'Hiring system + payment automatic la finalizare',
    ],
    status: 'planned',
    requirements: ['Collection: jobs, applications', 'Notification email', 'AI matching algorithm'],
    next_steps: ['Backend modele', 'UI listing public + filtrare', 'Application flow'],
  },
  reports: {
    icon: Mail,
    title: 'Rapoarte automate lunare',
    tagline: 'Generează și trimite automat rapoarte de activitate către autorități.',
    why: 'Firmele trebuie să raporteze lunar către ANRE/ANRP/ISCIR. Manual e o pierdere de timp masivă.',
    how: [
      'Colectează toate documentele emise în luna curentă',
      'Generare DOCX/PDF formatat conform autoritate',
      'Trimitere automată prin email în 1-a a fiecărei luni',
      'AI verifica câmpurile obligatorii înainte de send',
    ],
    status: 'planned',
    requirements: ['Templates raport per autoritate', 'Cron lunar', 'Email config per autoritate'],
    next_steps: ['Cron schedule', 'Templates DOCX raport', 'Mapping role → destinatari'],
  },
  'legal-automation': {
    icon: Scale,
    title: 'Automatizare juridică',
    tagline: 'Generează automat contracte și transmite-le către unități legale.',
    why: 'Multe documente legale au structură repetitivă. AI le poate completa instant.',
    how: [
      'Templates contracte per industrie (proiectare, execuție, mentenanță)',
      'AI completează câmpurile din contextul proiectului',
      'User verifică + semnează PKI',
      'Trimitere automată către client + arhivare',
    ],
    status: 'planned',
    requirements: ['Templates DOCX legale', 'Validation engine', 'Workflow signing'],
    next_steps: ['Catalog template legale', 'AI pre-fill engine', 'UI pentru workflow'],
  },
  partners: {
    icon: Award,
    title: 'Parteneriate brand & inspiraționale',
    tagline: 'Merchandise brand-uit + parteneri inspiraționali (self-help, spiritualitate).',
    why: 'Construirea unei comunități puternice are nevoie de cultură și identitate, nu doar funcționalitate.',
    how: [
      'Merchandise EPD (tricouri, căști, manuale tehnice)',
      'Sponsorizare evenimente industria construcții',
      'Pagini inspiraționale (spiritual & self-help) pentru profesioniști',
      'Programe afiliere pentru influențeri industrie',
    ],
    status: 'planned',
    requirements: ['Inventory merchandise', 'CMS pentru conținut inspirațional', 'Affiliate tracking'],
    next_steps: ['Marketplace merchandise', 'Blog/articole', 'Tracking afiliere'],
  },
  volunteering: {
    icon: HeartHandshake,
    title: 'Voluntariat & cauze caritabile',
    tagline: 'Proiecte pro-bono pentru cauze sociale + recunoaștere comunitate.',
    why: 'Firmele responsabile vor să contribuie. EPD facilita conex partener ↔ cauză.',
    how: [
      'Listă cauze active (școli, biserici, ONG-uri)',
      'Firme se înscriu să ofere ore pro-bono',
      'Badge „Voluntar EPD” în profil firmă',
      'Raport anual impact social',
    ],
    status: 'planned',
    requirements: ['Collection: causes, volunteer_hours', 'Badge system', 'Reporting engine'],
    next_steps: ['UI list cauze', 'Form înscriere', 'Annual report generator'],
  },
  'developer-plan': {
    icon: Wrench,
    title: 'Developer Plan pentru template-uri custom',
    tagline: 'User-i premium pot crea/cumpăra template-uri custom și funcții dedicate.',
    why: 'Agenți imobiliari, notari, avocați vor funcții specifice domeniilor lor. Developer Plan = customization.',
    how: [
      'Plan premium (Developer) — deja există',
      'Template-uri custom upload în library personală',
      'Funcții custom (ex: ștampile digitale specifice)',
      'Marketplace template-uri (revenue share 70/30)',
    ],
    status: 'partial',
    requirements: ['Developer plan (deja există)', 'Marketplace logic', 'Revenue share calc'],
    next_steps: ['UI marketplace', 'Stripe payments split', 'Quality review pipeline'],
  },
  community: {
    icon: Building2,
    title: 'Comunitate pe industrii',
    tagline: 'Discuții, anunțuri și resurse organizate pe cele 12 industrii.',
    why: 'Forum-ul deja există (în /forum). Secțiunea „comunitate” îmbogățește cu sondaje, evenimente, ghiduri.',
    how: [
      'Forum-ul existent (9 categorii: 8 industrii + general)',
      'Sondaje per industrie',
      'Calendar evenimente (conferințe, training)',
      'Ghiduri community-curated (best practices)',
    ],
    status: 'partial',
    requirements: ['Forum existent', 'Polls plugin', 'Events calendar'],
    next_steps: ['Adaugă sondaje în /forum', 'Calendar UI', 'Ghiduri marketplace'],
  },
};

const STATUS_LABELS = {
  active: { bg: 'bg-green-50', color: 'text-green-700', label: 'Activ' },
  partial: { bg: 'bg-amber-50', color: 'text-amber-700', label: 'Parțial' },
  skeleton: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Schelet' },
  planned: { bg: 'bg-gray-100', color: 'text-gray-600', label: 'Planificat' },
};

export default function FeatureDetail() {
  const { featureId } = useParams();
  const detail = FEATURE_DETAILS[featureId];

  if (!detail) {
    return (
      <AppShell title="Feature negăsit" subtitle="Verifică calea">
        <Link to="/feat-uri" className="text-sm text-black hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Înapoi la Feat-uri
        </Link>
      </AppShell>
    );
  }

  const Icon = detail.icon;
  const status = STATUS_LABELS[detail.status];

  return (
    <AppShell title={detail.title} subtitle={detail.tagline}>
      <Link to="/feat-uri" className="text-xs text-gray-500 hover:text-black inline-flex items-center gap-1 mb-6" data-testid="back-to-features">
        <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la Feat-uri
      </Link>

      {/* Hero */}
      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight">{detail.title}</h2>
              <span className={`text-[10px] uppercase tracking-[0.15em] ${status.color} ${status.bg} px-2 py-1`}>{status.label}</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{detail.tagline}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* WHY */}
        <section className="lg:col-span-7 bg-white border border-gray-200 p-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-2">// De ce</div>
          <h3 className="text-lg font-semibold mb-3">Problema pe care o rezolvă</h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-6">{detail.why}</p>

          <div className="text-[10px] uppercase tracking-[0.2em] text-[#FFB300] mb-2">// Cum</div>
          <h3 className="text-lg font-semibold mb-3">Flux propus</h3>
          <ol className="space-y-2">
            {detail.how.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-6 h-6 bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <aside className="lg:col-span-5 space-y-4">
          {/* Requirements */}
          <div className="bg-white border border-gray-200 p-6">
            <ClipboardCheck className="w-5 h-5 mb-3 text-gray-700" />
            <h4 className="font-semibold mb-3">Necesare</h4>
            <ul className="space-y-2">
              {detail.requirements.map((r, i) => (
                <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FFB300] rounded-full mt-1.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next steps */}
          <div className="bg-black text-white p-6">
            <Layers className="w-5 h-5 mb-3 text-[#FFB300]" />
            <h4 className="font-semibold mb-3">Pași următori implementare</h4>
            <ul className="space-y-2">
              {detail.next_steps.map((s, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="font-mono text-[#FFB300] shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-[#FFB300] p-4">
            <BookOpen className="w-4 h-4 text-[#FFB300] mb-2" />
            <p className="text-xs text-gray-700 leading-relaxed">
              Această pagină este <strong>schelet</strong>. Funcționalitatea completă va fi implementată progresiv pe baza listei TO-DO din <span className="font-mono">/app/memory/LIST_1_TODO.md</span>.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
