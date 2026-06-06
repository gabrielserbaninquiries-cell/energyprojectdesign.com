import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Plus, Archive, ArchiveRestore, Trash2, Check, FolderOpen, ArrowRight } from 'lucide-react';

export default function Projects() {
  const [items, setItems] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', industry: 'gas_engineering', subdomain: 'bransamente_gaz' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects?include_archived=${includeArchived}`);
      setItems(data);
    } catch (err) {
      console.error('Projects load failed:', err);
    }
  }, [includeArchived]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/industries').then(({ data }) => setIndustries(data)).catch((err) => console.error('Industries load failed:', err));
  }, []);

  const currentIndustry = industries.find(i => i.id === form.industry);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Adăugați un nume'); return; }
    setBusy(true);
    try {
      await api.post('/projects', form);
      toast.success('Proiect creat și activat');
      setShowCreate(false);
      setForm({ name: '', description: '', industry: 'gas_engineering', subdomain: 'bransamente_gaz' });
      await load();
      window.dispatchEvent(new Event('active-project-changed'));
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); }
  };

  const activate = async (id) => {
    try {
      await api.post(`/projects/${id}/activate`);
      toast.success('Proiect activat');
      await load();
      window.dispatchEvent(new Event('active-project-changed'));
    } catch (err) { toast.error('Eroare'); }
  };

  const archive = async (id, on) => {
    try {
      await api.post(`/projects/${id}/${on ? 'archive' : 'unarchive'}`);
      toast.success(on ? 'Arhivat' : 'Dezarhivat');
      await load();
    } catch (err) { toast.error('Eroare'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Ștergere ireversibilă a proiectului. Continuați?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Șters');
      await load();
      window.dispatchEvent(new Event('active-project-changed'));
    } catch (err) { toast.error('Eroare'); }
  };

  return (
    <AppShell title="Proiecte" subtitle="Toate proiectele dvs. — selectați proiectul activ pentru toate paginile">
      <div className="bg-white border border-gray-200 p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FolderOpen className="w-5 h-5 text-[#FFB300]" />
          <div>
            <div className="font-semibold">{items.length} proiecte</div>
            <div className="text-xs text-gray-500">Proiectul activ apare în header și este folosit de toate paginile.</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-gray-600">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="accent-[#FFB300]" data-testid="include-archived" />
            Include arhivate
          </label>
          <button onClick={() => setShowCreate(true)} className="amber-btn" data-testid="new-project-btn"><Plus className="w-4 h-4" /> Proiect nou</button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={onCreate} className="bg-white border border-gray-200 p-6 mb-6 space-y-4" data-testid="create-project-form">
          <h3 className="font-semibold">Proiect nou</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label block mb-1.5">Nume proiect</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" data-testid="proj-name" placeholder="ex. Branșament str. Republicii nr. 12" required />
            </div>
            <div>
              <label className="label block mb-1.5">Industrie</label>
              <select value={form.industry} onChange={(e) => { const ind = industries.find(i => i.id === e.target.value); setForm({ ...form, industry: e.target.value, subdomain: (ind?.subdomains?.find(s => s.active)?.id) || ind?.subdomains?.[0]?.id || '' }); }} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="proj-industry">
                {industries.map(i => (
                  <option key={i.id} value={i.id} disabled={i.status !== 'active'}>
                    {i.name} {i.status !== 'active' ? '— în curând' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Subdomeniu</label>
              <select value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="proj-subdomain">
                {(currentIndustry?.subdomains || []).map(s => (
                  <option key={s.id} value={s.id} disabled={!s.active}>{s.name} {!s.active ? '— în curând' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label block mb-1.5">Descriere (opțional)</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm" placeholder="ex. Imobil familial 2 niveluri" data-testid="proj-description" />
            </div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} className="amber-btn" data-testid="proj-create-submit">{busy ? 'Se creează...' : 'Creează proiect'}</button>
            <button type="button" onClick={() => setShowCreate(false)} className="ghost-btn">Anulează</button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Niciun proiect.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200" data-testid="projects-list">
          {items.map((p) => (
            <div key={p.project_id} className={`bg-white p-5 flex flex-col ${p.archived ? 'opacity-60' : ''}`} data-testid={`project-${p.project_id}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {p.active && <Check className="w-4 h-4 text-[#16A34A]" />}
                  <h3 className="font-semibold truncate">{p.name}</h3>
                </div>
                {p.archived && <span className="text-[9px] uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5">Arhivat</span>}
              </div>
              {p.description && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</p>}
              <div className="text-[10px] text-gray-500 mono mb-2">{p.industry} / {p.subdomain}</div>
              <div className="flex items-center justify-between mb-3">
                <span className="label">Completare</span>
                <span className="text-xs font-semibold">{p.completion ?? 0}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 mb-4">
                <div className="h-1.5 bg-[#FFB300]" style={{ width: `${p.completion ?? 0}%` }} />
              </div>
              <div className="mt-auto flex items-center gap-1 flex-wrap">
                {!p.active && !p.archived && (
                  <button onClick={() => activate(p.project_id)} className="outline-btn text-xs py-1.5 flex-1" data-testid={`activate-${p.project_id}`}>
                    Activează <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {p.active && (
                  <Link to="/proiect" className="amber-btn text-xs py-1.5 flex-1" data-testid={`edit-${p.project_id}`}>Editează →</Link>
                )}
                <button onClick={() => archive(p.project_id, !p.archived)} className="ghost-btn text-xs p-1.5" title={p.archived ? 'Dezarhivează' : 'Arhivează'} data-testid={`archive-${p.project_id}`}>
                  {p.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => remove(p.project_id)} className="ghost-btn text-xs p-1.5 text-[#DC2626] hover:bg-[#DC2626]/10" title="Șterge" data-testid={`delete-${p.project_id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
