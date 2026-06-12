/**
 * Planuri & Departamente V7.2 — pagina publică cu matricea plan × departament × pagini.
 * Răspunde cerinței user (mesaj 18): "structureaza paginile pe planurile de plata
 * a industriilor si departamentelor conexe fiecarei pagini".
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { CheckCircle2, ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';

const PLAN_DETAILS = {
  free:          { label: 'Free', price: 0, color: 'zinc',  tagline: 'Acces de bază + verificare publică' },
  trial:         { label: 'Trial', price: 0, color: 'zinc', tagline: '14 zile gratuit (acces operator)' },
  basic:         { label: 'Basic', price: 49, color: 'slate', tagline: 'Introducere date proiect (read-only export)' },
  operator:      { label: 'Operator', price: 79, color: 'sky', tagline: 'Operator introducere + edit proiect' },
  proiectant:    { label: 'Proiectant', price: 129, color: 'orange', tagline: 'Proiectare individuală PGD' },
  executant:     { label: 'Executant', price: 109, color: 'amber', tagline: 'Execuție lucrări EGD' },
  avize:         { label: 'Avize', price: 79, color: 'cyan', tagline: 'Departament avize / OSD' },
  ofertare:      { label: 'Ofertare', price: 89, color: 'emerald', tagline: 'Ofertare + Auto-apply SEAP' },
  contabilitate: { label: 'Contabilitate', price: 69, color: 'teal', tagline: 'Contabilitate + e-Factura ANAF' },
  vgd:           { label: 'VGD', price: 159, color: 'indigo', tagline: 'Verificator documentație atestat' },
  rte:           { label: 'RTE', price: 149, color: 'violet', tagline: 'Responsabil tehnic execuție' },
  societate:     { label: 'Societate', price: 349, color: 'rose', tagline: 'Societate completă (5 useri, toate dept.)' },
};

const PLAN_ORDER = ['basic', 'operator', 'avize', 'contabilitate', 'ofertare', 'executant', 'proiectant', 'rte', 'vgd', 'societate'];

export default function PlanuriDepartamente() {
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/menu/plans-departments-matrix');
        if (!cancelled) setMatrix(data);
      } catch {
        /* keep null */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <AppShell title="Planuri & Departamente" subtitle="Se încarcă matricea...">
        <div className="text-center py-20 text-zinc-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      </AppShell>
    );
  }
  if (!matrix) {
    return (
      <AppShell title="Planuri & Departamente" subtitle="Eroare load matrice">
        <div className="text-center py-20 text-zinc-400">Eroare la încărcare. Reîncearcă mai târziu.</div>
      </AppShell>
    );
  }

  // Group pages per department
  const deptGroups = Object.entries(matrix.departments).sort((a, b) => a[1].order - b[1].order);

  return (
    <AppShell title="Planuri & Departamente" subtitle="Matricea completă: 10 planuri × 17 departamente × 31 pagini">

      <section className="mb-10 border border-zinc-200 bg-zinc-50 p-6 rounded-lg" data-testid="plans-intro">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-orange-600 rounded">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-orange-600 mb-1">Plan adaptiv</div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Ai cumpărat doar ce folosești</h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed max-w-3xl">
              Spre deosebire de SaaS-urile mainstream care îți vând &laquo;all-or-nothing&raquo;, noi structurăm accesul pe
              <strong className="text-zinc-950"> 10 planuri specializate per departament</strong> (Proiectant, Executant, VGD, RTE, etc.)
              + opțiunea <strong className="text-orange-600">Societate 349€</strong> care le include pe toate cu 5 useri.
              Sidebar-ul tău afișează doar paginile pe care le poți accesa cu planul curent.
            </p>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mb-12" data-testid="plans-grid">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">— 10 planuri specializate</div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mb-6">Alege planul care se potrivește departamentului tău</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLAN_ORDER.map((pid) => {
            const p = PLAN_DETAILS[pid];
            const isPremium = pid === 'societate';
            return (
              <div key={pid} className={`border-2 ${isPremium ? 'border-orange-500 bg-orange-50' : 'border-zinc-200 bg-white'} p-5 hover:border-orange-500 transition-colors rounded-lg`} data-testid={`plan-card-${pid}`}>
                <div className={`text-[10px] font-mono uppercase tracking-widest mb-2 ${isPremium ? 'text-orange-700' : 'text-zinc-500'}`}>{p.label}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold tracking-tighter text-zinc-950">{p.price}</span>
                  <span className="text-xs text-zinc-500">€/lună</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed min-h-[2.5rem]">{p.tagline}</p>
                {isPremium && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-orange-700 bg-orange-100 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Cel mai popular
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Department × Plan Matrix */}
      <section className="mb-12" data-testid="dept-matrix">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">— 17 departamente × pagini accesibile</div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mb-6">Ce deblochezi cu fiecare plan</h2>
        <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-500 min-w-[200px]">Departament</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-500">Pagini incluse</th>
                <th className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-zinc-500 min-w-[180px]">Planuri cu acces</th>
              </tr>
            </thead>
            <tbody>
              {deptGroups.map(([deptId, dept]) => {
                const deptPages = matrix.pages.filter((p) => p.department === deptId);
                if (deptPages.length === 0) return null;
                const plansForDept = new Set();
                deptPages.forEach((p) => p.allowed_plans.forEach((ap) => plansForDept.add(ap)));
                return (
                  <tr key={deptId} className="border-b border-zinc-100 hover:bg-zinc-50" data-testid={`dept-row-${deptId}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-950">{dept.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{dept.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {deptPages.map((p) => (
                          <Link key={p.key} to={p.path}
                            className="text-[10px] font-mono uppercase tracking-wider bg-zinc-100 hover:bg-orange-100 text-zinc-700 px-2 py-1 rounded transition-colors">
                            {p.label}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {plansForDept.has('*') ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                          Toți userii autentificați
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {[...plansForDept].sort().slice(0, 5).map((pid) => {
                            const pd = PLAN_DETAILS[pid] || { label: pid, price: '?' };
                            return (
                              <span key={pid} className="text-[10px] font-mono uppercase tracking-wider bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                                {pd.label}
                              </span>
                            );
                          })}
                          {plansForDept.size > 5 && <span className="text-[10px] text-zinc-400">+{plansForDept.size - 5}</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between" data-testid="plans-cta-bottom">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-950">Vrei toate departamentele?</h3>
          <p className="text-sm text-zinc-600 mt-1">Planul Societate (349€/lună) include toate paginile + 5 useri + suport prioritar.</p>
        </div>
        <Link to="/pricing" className="inline-flex items-center gap-2 bg-zinc-950 text-white px-5 py-3 text-sm font-semibold hover:bg-orange-600 transition-colors rounded-md">
          Vezi detalii prețuri <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </AppShell>
  );
}
