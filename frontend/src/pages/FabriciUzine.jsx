/**
 * Fabrici și Uzine — Pagină nou în ecosistemul EPD
 *
 * Cerință user (mesaj 22): adaugă pagini noi "comerț și logistică" și "fabrici și uzine".
 * NU se elimină nimic existent — doar se adaugă.
 *
 * Conținut: proiectare instalații industriale gaze (presiune medie/înaltă),
 * stații măsurare-reglare (SRM), instalații tehnologice fabrici, certificări ISCIR.
 */
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
  Factory, Gauge, Cog, FileText, ShieldCheck, Flame, Wrench, ArrowRight,
  CheckCircle2, AlertCircle, BarChart3, Cpu,
} from 'lucide-react';
import { BRAND_ASSETS } from '../lib/brand';

const SUBSERVICES = [
  { icon: Gauge,      title: 'Stații SRM industriale',    desc: 'Stații măsurare-reglare presiune înaltă/medie pentru fabrici și uzine.', tag: 'PRO' },
  { icon: Flame,      title: 'Instalații tehnologice',    desc: 'Arzătoare, cuptoare industriale, generatoare aburi, cogenerare.',       tag: 'NEW' },
  { icon: Cpu,        title: 'SCADA / monitorizare',      desc: 'Sisteme automate monitorizare presiune, debit, temperatură, alarme.',   tag: 'BETA'},
  { icon: ShieldCheck,title: 'Certificări ISCIR',         desc: 'Autorizare echipamente sub presiune (PT C1, C2, C3, C4, C5, C6, C7).',  tag: 'PRO' },
  { icon: FileText,   title: 'Documentație ATEX',         desc: 'Clasificare zone Ex, evaluare risc explozie, certificate echipamente.',  tag: 'NEW' },
  { icon: Wrench,     title: 'Mentenanță preventivă',     desc: 'Planuri RTI (revizii tehnice instalație), istoric intervenții.',          tag: 'BETA'},
  { icon: BarChart3,  title: 'Consumuri energetice',      desc: 'Audit energetic + dimensionare instalație gaz după profil consum.',     tag: 'NEW' },
  { icon: Cog,        title: 'Proiecte la cheie',         desc: 'De la studiu fezabilitate la PIF — instalații complete fabrică.',        tag: 'PRO' },
];

const TAG_STYLES = {
  CORE: 'bg-violet-600 text-white',
  NEW:  'bg-emerald-500 text-white',
  BETA: 'bg-amber-500 text-white',
  PRO:  'bg-indigo-600 text-white',
};

const REFERENCE_PROJECTS = [
  { name: 'Stație SRM Industrial Park',  spec: 'Q max 5000 mc/h · presiune 6 bar → 0.1 bar', status: 'În proiectare' },
  { name: 'Cogenerare Fabrică Mobilă',   spec: '2× motor 1.5 MW · gaz natural · 250 mc/h',   status: 'Concept'         },
  { name: 'Arzător cuptor metalurgic',   spec: 'Putere 800 kW · presiune 0.5 bar · ATEX',    status: 'Avizare'         },
];

export default function FabriciUzine() {
  return (
    <AppShell title="Fabrici și Uzine" subtitle="Proiectare instalații industriale gaz · SRM · cogenerare · ATEX · ISCIR">
      {/* Hero */}
      <section className="mb-8 relative overflow-hidden rounded-xl text-white epd-shadow"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.88) 100%), url(${BRAND_ASSETS.cover4Architects})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="px-6 md:px-10 py-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-violet-300 font-semibold mb-3">
            <Factory className="w-3.5 h-3.5" />
            Ecosistem EPD · Industrial
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.05] mb-4 max-w-3xl">
            Proiectare instalații gaz pentru fabrici și uzine.
          </h1>
          <p className="text-base text-slate-200 max-w-2xl">
            De la stații SRM la cogenerare, arzătoare industriale și sisteme SCADA — întreaga documentație
            tehnică conformă ANRE, ISCIR și ATEX, generată automat.
          </p>
        </div>
      </section>

      {/* Sub-servicii */}
      <section className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-2">// 8 sub-servicii industriale</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Specialități</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SUBSERVICES.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-white border border-slate-200 hover:border-violet-300 rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 group-hover:epd-gradient flex items-center justify-center transition-all">
                    <Icon className="w-5 h-5 text-violet-700 group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 uppercase tracking-wider font-bold rounded ${TAG_STYLES[s.tag] || TAG_STYLES.NEW}`}>{s.tag}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 leading-tight mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Proiecte referință */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Tipuri proiecte tipice</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {REFERENCE_PROJECTS.map((p, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-violet-300 transition-colors">
              <div className="text-[10px] uppercase tracking-wider text-violet-600 font-semibold mb-1.5">{p.status}</div>
              <div className="text-sm font-semibold text-slate-900 mb-1">{p.name}</div>
              <div className="text-xs text-slate-500 font-mono">{p.spec}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Integration with Gaze Naturale */}
      <section className="bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-200 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <CheckCircle2 className="w-6 h-6 text-violet-700 mt-1 shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Bază comună cu Studio Gaze Naturale</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Proiectele industriale folosesc același set de 221 câmpuri tehnice, plus extensii specifice
              fabricilor (ATEX, ISCIR, cogenerare). Generare automată DOCX, ștampile și QES.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/gaze-naturale" className="epd-btn text-sm" data-testid="fabrici-cta-gas">
            Deschide Studio Gaze <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/industrii" className="outline-btn text-sm">Vezi 13 industrii</Link>
        </div>
      </section>
    </AppShell>
  );
}
