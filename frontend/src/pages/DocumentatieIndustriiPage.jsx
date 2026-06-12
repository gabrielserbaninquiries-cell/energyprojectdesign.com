/**
 * Documentație Tehnică - Industrii V7.0.
 * Hub pentru toate industriile tehnice cu DOCX legal automatizat.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import {
  Flame, Zap, Droplet, Sun, Radio, Building2, Train, Factory,
  Briefcase, Wrench as WrenchIcon, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';

const INDUSTRIES = [
  { id: 'gaze',      label: 'Gaze naturale', desc: 'Branșament, extindere, IUGN, PRM. 23 template-uri legale.',  icon: Flame,     color: 'orange',  link: '/gaze-naturale', active: true, count: 23 },
  { id: 'electric',  label: 'Electric LES/LEA', desc: 'Joasă/medie tensiune, ATR ANRE, branșament 0.4kV.', icon: Zap,       color: 'yellow',  link: '/industrii/electric', active: true, count: 6 },
  { id: 'apa_canal', label: 'Apă-Canal', desc: 'Branșament apă potabilă + racord canalizare.', icon: Droplet,   color: 'blue',    link: '/industrii/apa-canal', active: true, count: 5 },
  { id: 'fotovoltaice', label: 'Fotovoltaice', desc: 'Prosumator ANRE, autoconsum, predare rețea.', icon: Sun,    color: 'amber',   link: '/industrii/fotovoltaice', active: false, count: 0 },
  { id: 'telecom',   label: 'Telecom / Fibra optică', desc: 'Operatori, FTTH, racord local.', icon: Radio,      color: 'indigo',  link: '/industrii/telecom', active: false, count: 0 },
  { id: 'arhitectura', label: 'Arhitectură', desc: 'Case + blocuri, plan situație, RTC, DTAC arhitectură.', icon: Building2, color: 'slate',  link: '/industrii/arhitectura', active: false, count: 0 },
  { id: 'feroviar',  label: 'Infrastructură feroviară', desc: 'CFR, lucrări la calea ferată.', icon: Train,     color: 'red',    link: '/industrii/feroviar', active: false, count: 0 },
  { id: 'constructii', label: 'Construcții mașini', desc: 'Hale, ateliere, parking, drumuri.', icon: Factory,  color: 'stone',   link: '/industrii/constructii', active: false, count: 0 },
  { id: 'ofertare',  label: 'Ofertare (CAEN 7112)', desc: 'Ofertă tehnică + comercială, SEAP integration.', icon: Briefcase, color: 'emerald', link: '/industrii/ofertare', active: false, count: 0 },
  { id: 'mentenanta', label: 'Mentenanță industrială', desc: 'Plan mentenanță, intervenții, revizii.', icon: WrenchIcon, color: 'purple',  link: '/industrii/mentenanta', active: false, count: 0 },
];

const COLOR_MAP = {
  orange: 'border-orange-500 hover:bg-orange-50 text-orange-700',
  yellow: 'border-yellow-500 hover:bg-yellow-50 text-yellow-700',
  blue:   'border-blue-500 hover:bg-blue-50 text-blue-700',
  amber:  'border-amber-500 hover:bg-amber-50 text-amber-700',
  indigo: 'border-indigo-500 hover:bg-indigo-50 text-indigo-700',
  slate:  'border-slate-500 hover:bg-slate-50 text-slate-700',
  red:    'border-red-500 hover:bg-red-50 text-red-700',
  stone:  'border-stone-500 hover:bg-stone-50 text-stone-700',
  emerald:'border-emerald-500 hover:bg-emerald-50 text-emerald-700',
  purple: 'border-purple-500 hover:bg-purple-50 text-purple-700',
};

export default function DocumentatieIndustriiPage() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/industry/all-templates');
        const c = {};
        Object.entries(data).forEach(([ind, info]) => { c[ind] = info.count; });
        setCounts(c);
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const active = INDUSTRIES.filter((i) => i.active);
  const planned = INDUSTRIES.filter((i) => !i.active);

  return (
    <AppShell title="Documentație Electronică Industrii" subtitle="13 industrii planificate · 3 active concret cu 34+ template-uri legale">
      <section className="mb-8" data-testid="industries-active">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-lg font-bold">Industrii active acum ({active.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.map((ind) => {
            const Icon = ind.icon;
            return (
              <Link key={ind.id} to={ind.link} className={`border-2 ${COLOR_MAP[ind.color]} bg-white p-5 transition`} data-testid={`industry-${ind.id}`}>
                <div className="flex items-start gap-3 mb-2">
                  <Icon className="w-7 h-7" />
                  <div className="flex-1">
                    <div className="font-bold text-base">{ind.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{ind.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] uppercase tracking-wider font-semibold">{counts[ind.id === 'gaze' ? 'gaze' : ind.id === 'apa_canal' ? 'apa_canal' : 'electric'] || ind.count} template-uri DOCX</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section data-testid="industries-planned">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-bold">Industrii planificate ({planned.length}) — schelete + roadmap</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {planned.map((ind) => {
            const Icon = ind.icon;
            return (
              <div key={ind.id} className="border-2 border-gray-200 bg-gray-50 p-5 opacity-75 hover:opacity-100 transition" data-testid={`industry-${ind.id}`}>
                <div className="flex items-start gap-3 mb-2">
                  <Icon className="w-7 h-7 text-gray-400" />
                  <div className="flex-1">
                    <div className="font-bold text-base text-gray-700">{ind.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{ind.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Roadmap Q2-Q4 2026</span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 inline-flex items-center gap-1"><Clock className="w-3 h-3" /> În curând</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10 border-2 border-blue-500 bg-blue-50 p-6" data-testid="industries-cta-bottom">
        <h3 className="font-bold text-lg mb-2">De ce să folosești documentația noastră?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div><strong className="text-blue-700">179 câmpuri unice</strong> propagate în 23+ documente. Introduci datele O SINGURĂ DATĂ.</div>
          <div><strong className="text-blue-700">100% conform legal</strong> — NTPEE 2018, Legea 10/1995, HG 273/1994, HG 766/1997, Ord. ANRE 89/2018.</div>
          <div><strong className="text-blue-700">Semnătură QES integrată</strong> cu cert-SIGN / DigiSign / Trans Sped — semnezi & trimiți în 30 secunde.</div>
        </div>
      </section>
    </AppShell>
  );
}
