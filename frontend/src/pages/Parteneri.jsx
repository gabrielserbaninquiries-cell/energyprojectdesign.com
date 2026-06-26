import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Flame, Users, Building2, UserCircle, ShieldCheck, ArrowLeft,
  Search, Plus, Send, Check, X, MapPin, Mail, Phone,
} from 'lucide-react';
import useSEO from '../hooks/useSEO';

const KIND_LABEL = {
  srl: 'S.R.L.', pfa: 'PFA', angajat: 'Angajat',
  verificator: 'Verificator', osd: 'OSD',
};
const KIND_ICON = { srl: Building2, pfa: Building2, angajat: UserCircle, verificator: ShieldCheck, osd: Building2 };
const ROLE_LABEL = {
  proiectant: 'Proiectant', executant: 'Executant',
  verificator_vgd: 'Verificator VGD', verificator_rte: 'Verificator RTE',
  contabilitate: 'Contabilitate', ofertare: 'Ofertare',
  operator_date: 'Operator date', consultant: 'Consultant',
};

function CreateProfileModal({ onClose, onDone }) {
  const [form, setForm] = useState({
    kind: 'srl', display_name: '', cui: '', legitimatie_anre: '', atestat_mdlpa: '',
    roles: [], specialitati: '', county: '', city: '', contact_email: '', contact_phone: '', bio: '',
  });
  const [busy, setBusy] = useState(false);

  const toggleRole = (r) => {
    setForm(f => ({ ...f, roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r] }));
  };

  const submit = async () => {
    if (!form.display_name.trim()) { toast.error('Nume obligatoriu'); return; }
    setBusy(true);
    try {
      const payload = { ...form, specialitati: form.specialitati.split(',').map(s => s.trim()).filter(Boolean), public: true };
      await api.post('/partners', payload);
      toast.success('Profil partener creat');
      onDone();
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare creare profil'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="partner-create-modal">
      <div className="bg-white max-w-2xl w-full border-2 border-black shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-bold tracking-tight">Creează profil partener</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label mb-2 block">Tip</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(KIND_LABEL).map(([k, l]) => (
                <button key={k} onClick={() => setForm({ ...form, kind: k })} data-testid={`kind-${k}`}
                  className={`px-2 py-2 border-2 text-xs font-semibold ${form.kind === k ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label mb-1 block">Nume / Denumire</label>
            <input data-testid="partner-name-input" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
              placeholder="SC Vital Gaz SRL / Ion Popescu / etc."
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1 block">CUI</label>
              <input value={form.cui} onChange={e => setForm({ ...form, cui: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="label mb-1 block">Legitimație ANRE</label>
              <input value={form.legitimatie_anre} onChange={e => setForm({ ...form, legitimatie_anre: e.target.value })}
                placeholder="VGD-RTE-001"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="label mb-2 block">Roluri (alege unul sau mai multe)</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROLE_LABEL).map(([k, l]) => {
                const active = form.roles.includes(k);
                return (
                  <button key={k} type="button" onClick={() => toggleRole(k)} data-testid={`role-${k}`}
                    className={`px-2 py-2 border text-xs ${active ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    {active && <Check className="w-3 h-3 inline mr-1" />} {l}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label mb-1 block">Specialități (separate prin virgulă)</label>
            <input value={form.specialitati} onChange={e => setForm({ ...form, specialitati: e.target.value })}
              placeholder="gaze naturale joasă presiune, instalații utilizare, conducte mari"
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1 block">Județ</label>
              <input value={form.county} onChange={e => setForm({ ...form, county: e.target.value })}
                placeholder="București"
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="label mb-1 block">Localitate</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-1 block">Email contact</label>
              <input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
            <div>
              <label className="label mb-1 block">Telefon contact</label>
              <input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="label mb-1 block">Bio scurt (opțional)</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
              placeholder="Experiență, certificări, lucrări de referință..."
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="ghost-btn text-sm">Anulează</button>
          <button onClick={submit} disabled={busy || !form.display_name.trim()} data-testid="submit-partner-btn" className="amber-btn text-sm disabled:opacity-50">
            {busy ? 'Se creează...' : 'Creează profil'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CollabModal({ partner, onClose, onDone }) {
  const [role, setRole] = useState('proiectant');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/partners/collaborations', { target_partner_id: partner.partner_id, role, note });
      toast.success('Invitație de colaborare trimisă');
      onDone();
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid="collab-modal">
      <div className="bg-white max-w-lg w-full border-2 border-black shadow-2xl">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Propune colaborare cu {partner.display_name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label mb-2 block">Rol propus</label>
            <select value={role} onChange={e => setRole(e.target.value)} data-testid="collab-role-select"
              className="w-full px-3 py-2 border border-gray-300 text-sm">
              {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-2 block">Notă (opțional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} data-testid="collab-note-input"
              placeholder="Detalii despre proiect, perioada de colaborare, etc."
              className="w-full px-3 py-2 border border-gray-300 text-sm" />
          </div>
        </div>
        <div className="border-t px-5 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="ghost-btn text-sm">Anulează</button>
          <button onClick={submit} disabled={busy} data-testid="submit-collab-btn" className="amber-btn text-sm">
            <Send className="w-3.5 h-3.5" /> Trimite invitație
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Parteneri() {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [filter, setFilter] = useState({ kind: '', role: '', q: '' });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [collabTarget, setCollabTarget] = useState(null);

  useSEO({
    title: 'Parteneri & Colaborări · Energy Project Design',
    description: 'Directoriu profesional pentru societăți, PFA-uri, verificatori VGD/RTE și angajați. Propuneri de colaborare în industria gazelor naturale și inginerie.',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.kind) params.append('kind', filter.kind);
      if (filter.role) params.append('role', filter.role);
      if (filter.q) params.append('q', filter.q);
      const { data } = await api.get(`/partners?${params.toString()}`);
      setPartners(data.items || []);
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  };

  const loadMine = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/partners/me');
      setMyProfile(data);
    } catch (_) { setMyProfile(null); }
  };

  useEffect(() => { load(); loadMine(); /* eslint-disable-next-line */ }, [filter.kind, filter.role]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 sticky top-0 z-30 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black text-[#FFB300] flex items-center justify-center"><Flame className="w-4 h-4" /></div>
            <div className="font-bold tracking-tight">Energy Project<span className="text-[#FFB300]"> Design</span></div>
          </Link>
          <Link to={user ? '/dashboard' : '/'} className="ghost-btn text-sm"><ArrowLeft className="w-4 h-4" /> Înapoi</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="label mb-2">// directoriu profesional</div>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-1">Parteneri & Colaborări</h1>
            <p className="text-gray-600">Societăți, PFA-uri, verificatori VGD/RTE și angajați din industria gazelor naturale. Propune colaborări direct între profiluri.</p>
          </div>
          {user && (
            myProfile ? (
              <Link to={`/parteneri#me-${myProfile.partner_id}`} className="ghost-btn text-sm">
                <UserCircle className="w-4 h-4" /> Profilul meu: {myProfile.display_name}
              </Link>
            ) : (
              <button onClick={() => setShowCreate(true)} data-testid="create-profile-btn" className="amber-btn text-sm">
                <Plus className="w-4 h-4" /> Creează profil partener
              </button>
            )
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input value={filter.q} onChange={e => setFilter({ ...filter, q: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
              placeholder="Caută după nume / specialitate / bio..." data-testid="search-input"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
          <select value={filter.kind} onChange={e => setFilter({ ...filter, kind: e.target.value })}
            data-testid="kind-filter" className="px-3 py-2 border border-gray-300 text-sm">
            <option value="">Toate tipurile</option>
            {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <select value={filter.role} onChange={e => setFilter({ ...filter, role: e.target.value })}
            data-testid="role-filter" className="px-3 py-2 border border-gray-300 text-sm">
            <option value="">Toate rolurile</option>
            {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <button onClick={load} className="outline-btn text-sm">Caută</button>
        </div>

        {loading && <div className="text-center text-sm text-gray-500 py-8">Se încarcă...</div>}
        {!loading && partners.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 p-12 text-center" data-testid="partners-empty">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <div className="font-semibold mb-1">Niciun partener găsit</div>
            <p className="text-sm text-gray-500">Fii primul care creează un profil partener.</p>
          </div>
        )}
        {!loading && partners.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200" data-testid="partners-grid">
            {partners.map(p => {
              const Icon = KIND_ICON[p.kind] || Users;
              return (
                <div key={p.partner_id} className="bg-white p-5 flex flex-col" data-testid={`partner-${p.partner_id}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h3 className="font-bold text-base tracking-tight">{p.display_name}</h3>
                        {p.verified && <span className="text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5">✓ verificat</span>}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">{KIND_LABEL[p.kind] || p.kind}</div>
                    </div>
                  </div>
                  {p.roles?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.roles.map(r => <span key={r} className="text-[10px] bg-violet-50 text-violet-700 px-1.5 py-0.5 border border-violet-200">{ROLE_LABEL[r] || r}</span>)}
                    </div>
                  )}
                  {p.bio && <p className="text-xs text-gray-600 line-clamp-3 mb-2">{p.bio}</p>}
                  <div className="text-[11px] text-gray-500 space-y-0.5 mb-3">
                    {p.county && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.county}{p.city ? ` · ${p.city}` : ''}</div>}
                    {p.contact_email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.contact_email}</div>}
                    {p.contact_phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.contact_phone}</div>}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-3">{p.collaborations_count || 0} colaborări active</div>
                  {user && user.email !== p.owner_email && (
                    <button onClick={() => setCollabTarget(p)} data-testid={`collab-btn-${p.partner_id}`} className="amber-btn text-xs mt-auto justify-center">
                      <Send className="w-3.5 h-3.5" /> Propune colaborare
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showCreate && <CreateProfileModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); loadMine(); }} />}
      {collabTarget && <CollabModal partner={collabTarget} onClose={() => setCollabTarget(null)} onDone={() => setCollabTarget(null)} />}
    </div>
  );
}
