import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Flame, Inbox, BookOpen, CheckCircle2, XCircle, RotateCcw,
  ShieldCheck, Clock, ArrowLeft, FileText, Building2, ExternalLink,
  Search, AlertTriangle,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';

const STATUS_META = {
  pending:    { label: 'În așteptare', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
  in_review:  { label: 'În analiză',   color: 'bg-blue-100 text-blue-800 border-blue-300',   icon: Search },
  approved:   { label: 'Aprobat',      color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
  rejected:   { label: 'Respins',      color: 'bg-red-100 text-red-800 border-red-300',     icon: XCircle },
  returned:   { label: 'Returnat',     color: 'bg-purple-100 text-purple-800 border-purple-300', icon: RotateCcw },
};

function StatusPill({ status, testId }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <span data-testid={testId} className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

function DecisionModal({ project, onClose, onDone }) {
  const [decision, setDecision] = useState('approved');
  const [observations, setObservations] = useState('');
  const [reason, setReason] = useState('');
  const [deadline, setDeadline] = useState(7);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!observations.trim()) { toast.error('Observațiile sunt obligatorii.'); return; }
    setBusy(true);
    try {
      const { data } = await api.post(`/verificator/projects/${project.pid}/decide`, {
        decision, observations: observations.trim(), reason: reason.trim() || null, deadline_days: decision === 'approved' ? null : Number(deadline),
      });
      toast.success(`Decizie înregistrată: ${data.status.toUpperCase()} · Hash: ${data.decision_hash.slice(0, 16)}...`);
      if (data.qes_note) toast.info(data.qes_note, { duration: 6000 });
      onDone();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare înregistrare decizie');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="decision-modal">
      <div className="bg-white max-w-2xl w-full border-2 border-black shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="label">// decizie verificator</div>
            <h3 className="text-xl font-bold tracking-tight">{project.title || 'Proiect fără titlu'}</h3>
            <div className="text-xs text-gray-500 mono mt-1">PID: {project.pid}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl leading-none" aria-label="Închide">×</button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="label mb-2 block">// Decizie</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'approved', label: 'Aprobă', icon: CheckCircle2, color: 'border-emerald-500 bg-emerald-50 text-emerald-800' },
                { id: 'rejected', label: 'Respinge', icon: XCircle, color: 'border-red-500 bg-red-50 text-red-800' },
                { id: 'returned', label: 'Returnează', icon: RotateCcw, color: 'border-purple-500 bg-purple-50 text-purple-800' },
              ].map(opt => {
                const Icon = opt.icon;
                const active = decision === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDecision(opt.id)}
                    data-testid={`decision-${opt.id}`}
                    className={`px-3 py-3 border-2 text-sm font-semibold flex items-center justify-center gap-2 ${active ? opt.color : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  >
                    <Icon className="w-4 h-4" /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">// Observații (obligatoriu)</label>
            <textarea
              data-testid="decision-observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Detalii referat: conformitate NTPE 89/2018, semnături, anexe lipsă, etc."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {decision !== 'approved' && (
            <>
              <div>
                <label className="label mb-2 block">// Motiv refuz / returnare</label>
                <input
                  data-testid="decision-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ex: lipsă acord ISC, calcul Renouard greșit, contor sub G4"
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="label mb-2 block">// Termen remediere (zile)</label>
                <input
                  data-testid="decision-deadline"
                  type="number" min={1} max={90}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="border-2 border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong>QES eIDAS — integrare reală în curând.</strong> Momentan decizia se înregistrează cu hash SHA-256 + timestamp imuabil. Semnătura criptografică QES (DigiSign / certSIGN) va fi adăugată în etapa următoare.
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="ghost-btn text-sm">Anulează</button>
          <button
            onClick={submit}
            disabled={busy || !observations.trim()}
            data-testid="submit-decision-btn"
            className="amber-btn text-sm disabled:opacity-50"
          >
            {busy ? 'Se înregistrează...' : 'Confirmă decizia'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerificatorWorkspace() {
  const { user } = useAuth();
  const [tab, setTab] = useState('inbox');
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useSEO({
    title: 'Workspace Verificator VGD/RTE · Energy Project Design',
    description: 'Inbox proiecte primite, decizii (aprobat/respins/returnat), ledger pe societăți. Plan VGD/RTE — 1000 EUR / lună.',
    canonical: 'https://www.energyprojectdesign.com/verificator/inbox',
  });

  const planAllowed = useMemo(() => {
    const p = user?.plan;
    return ['vgd', 'rte', 'society_admin', 'developer', 'inside_full'].includes(p) || user?.is_admin || user?.is_developer;
  }, [user]);

  const loadInbox = async () => {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/verificator/inbox${q}`);
      setItems(data.items || []);
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare la încărcare inbox'); }
    finally { setLoading(false); }
  };

  const loadLedger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/verificator/ledger');
      setGroups(data.groups || []);
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare la încărcare ledger'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!planAllowed) { setLoading(false); return; }
    if (tab === 'inbox') loadInbox();
    if (tab === 'ledger') loadLedger();
  }, [tab, statusFilter, planAllowed]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!planAllowed) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" /></div>
              <div className="font-bold tracking-tight">Energy Project<span className="text-[#FFB300]"> Design</span></div>
            </Link>
            <Link to="/dashboard" className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-16 text-center" data-testid="verif-no-access">
          <ShieldCheck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <div className="label mb-2">// acces restricționat</div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Plan VGD sau RTE necesar</h1>
          <p className="text-gray-600 mb-6">Această secțiune este rezervată verificatorilor atestați ANRE (VGD) sau MDLPA (RTE). Planul tău curent: <strong>{user?.plan || 'free'}</strong>.</p>
          <Link to="/pricing" className="amber-btn">Vezi planurile Verificator (1000 EUR/lună)</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 z-30 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" /></div>
            <div className="font-bold tracking-tight">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider hidden md:inline">Plan: {user?.plan?.toUpperCase()}</span>
            <Link to="/dashboard" className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="label mb-2">// workspace verificator</div>
        <h1 className="text-4xl font-bold tracking-tighter mb-1">Verificator VGD / RTE</h1>
        <p className="text-gray-600 mb-8">Inbox proiecte primite, decizii (aprobat / respins / returnat), evidență per societate emitentă.</p>

        <div className="border-b border-gray-200 flex gap-2 mb-6">
          <button
            onClick={() => setTab('inbox')}
            data-testid="tab-inbox"
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${tab === 'inbox' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
          >
            <Inbox className="w-4 h-4" /> Inbox <span className="bg-black text-white px-1.5 py-0.5 text-[10px] rounded">{items.length}</span>
          </button>
          <button
            onClick={() => setTab('ledger')}
            data-testid="tab-ledger"
            className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${tab === 'ledger' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
          >
            <BookOpen className="w-4 h-4" /> Ledger pe societăți <span className="bg-black text-white px-1.5 py-0.5 text-[10px] rounded">{groups.length}</span>
          </button>
        </div>

        {tab === 'inbox' && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">Filtru status:</span>
              {['', 'pending', 'approved', 'rejected', 'returned'].map(s => (
                <button
                  key={s || 'all'}
                  onClick={() => setStatusFilter(s)}
                  data-testid={`filter-${s || 'all'}`}
                  className={`text-xs px-3 py-1.5 border ${statusFilter === s ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                >
                  {s ? (STATUS_META[s]?.label || s) : 'Toate'}
                </button>
              ))}
            </div>

            {loading && <div className="text-sm text-gray-500 py-8 text-center">Se încarcă...</div>}
            {!loading && items.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 p-12 text-center" data-testid="inbox-empty">
                <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <div className="font-semibold text-gray-700 mb-1">Nimic de verificat momentan</div>
                <p className="text-sm text-gray-500">Proiectele transmise spre verificare de societățile partenere apar aici.</p>
              </div>
            )}
            {!loading && items.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200" data-testid="inbox-grid">
                {items.map(it => {
                  const vs = it.verification_state || {};
                  return (
                    <div key={it.pid} className="bg-white p-5 flex flex-col" data-testid={`inbox-item-${it.pid}`}>
                      <div className="flex items-start justify-between mb-2">
                        <StatusPill status={vs.status || 'pending'} testId={`status-${it.pid}`} />
                        <span className="text-[10px] text-gray-400 mono">{it.pid?.slice(0, 12)}...</span>
                      </div>
                      <h3 className="font-bold text-base tracking-tight mb-1 line-clamp-2">{it.title || 'Proiect fără titlu'}</h3>
                      <div className="text-xs text-gray-500 mb-1">de la: <strong>{it.owner_email}</strong></div>
                      <div className="text-[10px] text-gray-400 mb-3">primit: {vs.submitted_at?.slice(0, 19).replace('T', ' ')}</div>
                      {vs.submit_note && <div className="text-xs text-gray-600 italic bg-gray-50 p-2 mb-3 border-l-2 border-gray-300">&ldquo;{vs.submit_note}&rdquo;</div>}
                      <div className="mt-auto flex gap-2 pt-3">
                        <Link to={`/gaze-naturale/${it.pid}`} className="ghost-btn text-xs flex-1 justify-center"><ExternalLink className="w-3 h-3" /> Vezi</Link>
                        <button onClick={() => setSelectedProject(it)} data-testid={`decide-${it.pid}`} className="amber-btn text-xs flex-1 justify-center">
                          {vs.status === 'pending' ? 'Decide' : 'Re-decide'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'ledger' && (
          <>
            {loading && <div className="text-sm text-gray-500 py-8 text-center">Se încarcă...</div>}
            {!loading && groups.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 p-12 text-center" data-testid="ledger-empty">
                <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <div className="font-semibold text-gray-700 mb-1">Niciun proiect procesat</div>
                <p className="text-sm text-gray-500">Ledger-ul va afișa toate proiectele verificate, grupate pe societate emitentă.</p>
              </div>
            )}
            {!loading && groups.length > 0 && (
              <div className="space-y-6">
                {groups.map(g => (
                  <div key={g.submitter_email} className="border border-gray-200" data-testid={`ledger-group-${g.submitter_email}`}>
                    <div className="border-b border-gray-200 px-5 py-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-bold tracking-tight">{g.submitter_email}</span>
                        <span className="text-xs text-gray-500">({g.projects.length} proiecte)</span>
                      </div>
                      <div className="flex gap-2 text-[10px]">
                        {Object.entries(g.counts || {}).filter(([_, v]) => v > 0).map(([k, v]) => (
                          <span key={k} className={`px-2 py-0.5 border ${STATUS_META[k]?.color || ''}`}>{STATUS_META[k]?.label}: {v}</span>
                        ))}
                      </div>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-white">
                        <tr className="border-b border-gray-200">
                          <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Proiect</th>
                          <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Status</th>
                          <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Primit</th>
                          <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Decis</th>
                          <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-gray-500">Hash decizie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.projects.map(p => (
                          <tr key={p.pid} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`ledger-row-${p.pid}`}>
                            <td className="px-4 py-2"><FileText className="w-3 h-3 inline mr-1 text-gray-400" />{p.title || p.pid?.slice(0, 16)}</td>
                            <td className="px-4 py-2"><StatusPill status={p.status || 'pending'} /></td>
                            <td className="px-4 py-2 text-xs text-gray-600">{p.submitted_at?.slice(0, 10) || '—'}</td>
                            <td className="px-4 py-2 text-xs text-gray-600">{p.decided_at?.slice(0, 10) || '—'}</td>
                            <td className="px-4 py-2 text-[10px] mono text-gray-500">{p.decision_hash?.slice(0, 16) || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {selectedProject && (
        <DecisionModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDone={() => { setSelectedProject(null); if (tab === 'inbox') loadInbox(); else loadLedger(); }}
        />
      )}
    </div>
  );
}
