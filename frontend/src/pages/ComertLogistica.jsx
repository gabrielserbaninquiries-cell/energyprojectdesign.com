/**
 * Comerț și Logistică — Pagină nou în ecosistemul EPD
 *
 * Cerință user (mesaj 22): adaugă pagini noi "comerț și logistică" și "fabrici și uzine".
 * NU se elimină nimic existent — doar se adaugă.
 *
 * Conținut: lanț aprovizionare materiale OSD, transport echipamente,
 * notificări licitații SEAP, integrare cu marketplace pentru proiecte.
 */
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import {
  Truck, Package, MapPin, Clock, AlertCircle, TrendingUp, Boxes,
  ShoppingCart, Building2, FileText, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { BRAND_ASSETS } from '../lib/brand';

const SUBSERVICES = [
  { icon: Truck,       title: 'Transport materiale',     desc: 'Aprovizionare șantier cu țeavă PE100, fitting-uri, contoare, regulatoare.', tag: 'BETA' },
  { icon: Boxes,       title: 'Depozite materiale',      desc: 'Rețea depozite EPD partener — stoc real-time Anexa 13 (554 itemi).',     tag: 'NEW'  },
  { icon: AlertCircle, title: 'Alerte SEAP automate',    desc: 'Licitații publice OSD (Distrigaz, Delgaz, Premier) filtrate pe firmă.',  tag: 'PRO'  },
  { icon: ShoppingCart,title: 'Comenzi B2B en-gros',     desc: 'Preț redus la materiale prin agregare comenzi multi-firmă.',             tag: 'NEW'  },
  { icon: MapPin,      title: 'Tracking GPS livrare',    desc: 'Urmărire transport în timp real, ETA, semnătură electronică recepție.',  tag: 'NEW'  },
  { icon: Building2,   title: 'Logistică multi-șantier', desc: 'Coordonare livrări simultane pe multiple proiecte active.',              tag: 'PRO'  },
  { icon: TrendingUp,  title: 'Prețuri dinamice',        desc: 'Trend prețuri materiale Anexa 13 — istoric și predicții AI.',            tag: 'BETA' },
  { icon: FileText,    title: 'Avize transport ADR',     desc: 'Documente transport echipamente sub presiune / materiale speciale.',     tag: 'NEW'  },
];

const TAG_STYLES = {
  CORE: 'bg-violet-600 text-white',
  NEW:  'bg-emerald-500 text-white',
  BETA: 'bg-amber-500 text-white',
  PRO:  'bg-indigo-600 text-white',
};

export default function ComertLogistica() {
  return (
    <AppShell title="Comerț și Logistică" subtitle="Lanț aprovizionare + transport + SEAP — ecosistem complet pentru proiectele tale">
      {/* Hero */}
      <section className="mb-8 relative overflow-hidden rounded-xl text-white epd-shadow"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(76,29,149,0.88) 100%), url(${BRAND_ASSETS.cover2Smartcity})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="px-6 md:px-10 py-10">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-violet-300 font-semibold mb-3">
            <Truck className="w-3.5 h-3.5" />
            Ecosistem EPD · Comerț + Logistică
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.05] mb-4 max-w-3xl">
            Lanț de aprovizionare integrat — de la depozit la șantier.
          </h1>
          <p className="text-base text-slate-200 max-w-2xl">
            Comandă materiale Anexa 13, primește livrare cu tracking GPS, semnează electronic recepția —
            tot ce ai nevoie pentru un proiect gaze naturale într-un singur loc.
          </p>
        </div>
      </section>

      {/* Sub-servicii */}
      <section className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-2">// 8 sub-servicii integrate</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Servicii disponibile</h2>
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

      {/* Integration with Gaze Naturale */}
      <section className="mb-10 bg-gradient-to-br from-violet-50 to-indigo-50/50 border border-violet-200 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-5">
          <CheckCircle2 className="w-6 h-6 text-violet-700 mt-1 shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Integrat 100% cu Studio Gaze Naturale</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Când completezi un proiect în Studio Gaze, lista de materiale se generează automat din Anexa 13.
              De aici, cu un click, transmiți comanda către depozite EPD partener, primești ofertă și transport.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/gaze-naturale" className="epd-btn text-sm" data-testid="comert-cta-gas">
            Deschide Studio Gaze <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/marketplace" className="outline-btn text-sm">Vezi Marketplace</Link>
        </div>
      </section>

      {/* Status roadmap */}
      <section className="border-t border-slate-200 pt-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Modul în dezvoltare activă · primele depozite partener integrate Q2 2026</span>
        </div>
      </section>
    </AppShell>
  );
}
