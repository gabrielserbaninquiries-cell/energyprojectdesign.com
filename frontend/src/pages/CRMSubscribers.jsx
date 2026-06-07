import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Users as UsersIcon, Plus, Trash2, Edit3, Save, X, TrendingUp, Banknote, Building2 } from 'lucide-react';

const STATUS_META = {
  active: { label: 'Activ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  paused: { label: 'Pauzat', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  expired: { label: 'Expirat', color: 'text-gray-600 bg-gray-100 border-gray-200' },
};

const EMPTY = { name: '', email: '', phone: '', company: '', industry: '', plan_label: '', monthly_fee_ron: '', contract_start: '', contract_end: '', status: 'active', notes: '' };

export default function CRMSubscribers() {
  const [list, setList] = useState([]);
  const [mrr, setMrr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/crm/subscribers');
      setList(data.subscribers || []);
      setMrr(data.mrr_ron || 0);
    } catch { toast.error('Eroare încărcare CRM'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Numele este obligatoriu'); return; }
    try {
      const payload = { ...form, monthly_fee_ron: form.monthly_fee_ron ? parseFloat(form.monthly_fee_ron) : 0 };
      if (editing) await api.patch(`/crm/subscribers/${editing}`, payload);
      else await api.post('/crm/subscribers', payload);
      toast.success(editing ? 'Actualizat' : 'Adăugat');
      setForm(EMPTY); setEditing(null); setShowForm(false);
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
  };

  const edit = (s) => {
    setForm({
      name: s.name || '', email: s.email || '', phone: s.phone || '', company: s.company || '',
      industry: s.industry || '', plan_label: s.plan_label || '', monthly_fee_ron: s.monthly_fee_ron || '',
      contract_start: s.contract_start || '', contract_end: s.contract_end || '',
      status: s.status || 'active', notes: s.notes || '',
    });
    setEditing(s.sub_id);
    setShowForm(true);
  };

  const remove = async (sid) => {
    if (!window.confirm('Ștergi acest abonat?')) return;
    try { await api.delete(`/crm/subscribers/${sid}`); load(); toast.success('Șters'); }
    catch { toast.error('Eroare ștergere'); }
  };

  const activeCount = list.filter((s) => s.status === 'active').length;

  return (
    <AppShell title="CRM Abonați" subtitle="Contracte recurente · Monthly Recurring Revenue (MRR) tracking">
      {/* Hero */}
      <div className="relative overflow-hidden mb-8 bg-gradient-to-br from-[#0A0A0A] via-[#171717] to-[#0A0A0A] text-white p-8" data-testid="crm-hero">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#FFB300] mb-2 flex items-center gap-2"><UsersIcon className="w-3.5 h-3.5" /> // recurring revenue</div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">{mrr.toLocaleString('ro-RO')} RON <span className="text-[#FFB300]">/lună</span></h2>
            <p className="text-sm text-gray-300">MRR generat de <strong>{activeCount}</strong> abonați activi · {list.length} contracte totale.</p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-2">
            <Stat v={activeCount} l="Activi" c="text-emerald-400" />
            <Stat v={list.filter((s) => s.status === 'paused').length} l="Pauzați" c="text-amber-400" />
            <Stat v={list.filter((s) => s.status === 'expired').length} l="Expirați" c="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }} className="amber-btn text-sm py-2.5 px-4" data-testid="crm-toggle-form">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Închide' : 'Abonat nou'}
        </button>
        <div className="text-xs text-gray-500 ml-auto flex items-center gap-2">
          <Banknote className="w-3.5 h-3.5" /> Total contracte: <strong className="text-black">{list.length}</strong>
        </div>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white border-2 border-black p-6 mb-6 grid lg:grid-cols-2 gap-3" data-testid="crm-form">
          <input data-testid="crm-name" type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nume contact *" className="border border-gray-200 px-3 py-2 text-sm" required />
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="border border-gray-200 px-3 py-2 text-sm" />
          <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Telefon" className="border border-gray-200 px-3 py-2 text-sm" />
          <input type="text" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Firmă" className="border border-gray-200 px-3 py-2 text-sm" />
          <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className="border border-gray-200 px-3 py-2 text-sm">
            <option value="">— Industrie —</option>
            <option value="photovoltaic">Fotovoltaic</option>
            <option value="gas_engineering">Gaze</option>
            <option value="electrical_engineering">Electric</option>
            <option value="hvac">HVAC</option>
            <option value="water_sewage">Apă & canalizare</option>
            <option value="construction">Construcții</option>
          </select>
          <input type="text" value={form.plan_label} onChange={(e) => setForm((f) => ({ ...f, plan_label: e.target.value }))} placeholder="Plan / pachet (ex: Mentenanță anuală)" className="border border-gray-200 px-3 py-2 text-sm" />
          <input type="number" step="0.01" value={form.monthly_fee_ron} onChange={(e) => setForm((f) => ({ ...f, monthly_fee_ron: e.target.value }))} placeholder="Tarif lunar (RON)" className="border border-gray-200 px-3 py-2 text-sm" />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="border border-gray-200 px-3 py-2 text-sm">
            <option value="active">Activ</option>
            <option value="paused">Pauzat</option>
            <option value="expired">Expirat</option>
          </select>
          <input type="date" value={form.contract_start} onChange={(e) => setForm((f) => ({ ...f, contract_start: e.target.value }))} className="border border-gray-200 px-3 py-2 text-sm" placeholder="Start" />
          <input type="date" value={form.contract_end} onChange={(e) => setForm((f) => ({ ...f, contract_end: e.target.value }))} className="border border-gray-200 px-3 py-2 text-sm" placeholder="Sfârșit" />
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Note interne" className="border border-gray-200 px-3 py-2 text-sm lg:col-span-2 h-16 resize-none" />
          <button type="submit" data-testid="crm-save" className="amber-btn lg:col-span-2 py-2.5"><Save className="w-4 h-4" /> {editing ? 'Actualizează' : 'Salvează'}</button>
        </form>
      )}

      {loading ? <div className="text-sm text-gray-500 py-12 text-center">Se încarcă…</div> : (
        <div className="bg-white border border-gray-200 overflow-x-auto" data-testid="crm-table">
          <table className="w-full text-sm">
            <thead className="bg-black text-[#FFB300] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-2.5">Nume</th>
                <th className="text-left px-3 py-2.5">Firmă</th>
                <th className="text-left px-3 py-2.5">Industrie</th>
                <th className="text-left px-3 py-2.5">Plan</th>
                <th className="text-right px-3 py-2.5">Tarif/lună</th>
                <th className="text-center px-3 py-2.5">Status</th>
                <th className="text-right px-3 py-2.5">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const sm = STATUS_META[s.status] || STATUS_META.active;
                return (
                  <tr key={s.sub_id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`crm-row-${s.sub_id}`}>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-[11px] text-gray-500">{s.email || s.phone}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">{s.company || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700">{s.industry || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-700">{s.plan_label || '—'}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold">{Number(s.monthly_fee_ron || 0).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-center"><span className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border ${sm.color}`}>{sm.label}</span></td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => edit(s)} className="text-gray-400 hover:text-black p-1" data-testid={`crm-edit-${s.sub_id}`}><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(s.sub_id)} className="text-gray-400 hover:text-red-600 p-1" data-testid={`crm-delete-${s.sub_id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={7} className="px-3 py-12 text-center text-gray-400 text-sm">Niciun abonat. Adaugă primul cu butonul de mai sus.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ v, l, c }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-3">
      <div className={`text-2xl font-bold tracking-tight ${c}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mt-1">{l}</div>
    </div>
  );
}
