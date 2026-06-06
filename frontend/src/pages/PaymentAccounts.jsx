import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Banknote, Plus, Trash2, Save, RefreshCw, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

const EMPTY_FORM = {
  account_holder: '',
  iban: '',
  swift_bic: '',
  bank_name: '',
  currency: 'EUR',
  status: 'TEST',
  is_active: true,
  notes: '',
};

function StatusBadge({ status }) {
  const cls = status === 'LIVE'
    ? 'bg-green-100 text-green-800 border-green-300'
    : status === 'TEST'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-gray-100 text-gray-600 border-gray-300';
  return <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${cls}`}>{status}</span>;
}

function formatIban(iban) {
  if (!iban) return '';
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export default function PaymentAccounts() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.is_developer) { nav('/dashboard'); return; }
    loadAccounts();
  }, [user, nav]);

  async function loadAccounts() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/payment-accounts', { params: { include_disabled: true } });
      setAccounts(data);
    } catch (e) {
      toast.error('Nu pot încărca conturile.');
    } finally { setLoading(false); }
  }

  function startEdit(acc) {
    setEditingId(acc.account_id);
    setForm({
      account_holder: acc.account_holder,
      iban: acc.iban,
      swift_bic: acc.swift_bic || '',
      bank_name: acc.bank_name,
      currency: acc.currency,
      status: acc.status,
      is_active: acc.is_active,
      notes: acc.notes || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startNew() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function cancelForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  }

  async function save() {
    if (!form.account_holder.trim() || !form.iban.trim() || !form.bank_name.trim()) {
      toast.error('Completează: titular, IBAN, bancă.');
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await api.patch(`/admin/payment-accounts/${editingId}`, form);
        toast.success('Cont actualizat.');
      } else {
        await api.post('/admin/payment-accounts', form);
        toast.success('Cont creat.');
      }
      await loadAccounts();
      cancelForm();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare salvare.');
    } finally { setBusy(false); }
  }

  async function remove(accountId) {
    if (!window.confirm('Ștergi acest cont? Acțiunea este definitivă.')) return;
    setBusy(true);
    try {
      await api.delete(`/admin/payment-accounts/${accountId}`);
      toast.success('Cont șters.');
      await loadAccounts();
    } catch (e) {
      toast.error('Eroare ștergere.');
    } finally { setBusy(false); }
  }

  if (!user) return null;
  if (!user.is_developer) {
    return (
      <AppShell>
        <div className="p-8 max-w-2xl">
          <div className="flex items-center gap-3 text-sm bg-red-50 border border-red-200 p-4">
            <Lock className="w-5 h-5 text-red-700" />
            <span>Acces interzis. Doar contul Administrator/Developer.</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl" data-testid="payment-accounts-page">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Banknote className="w-8 h-8" /> Conturi aplicație destinate încasărilor din vânzări</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-3xl">
              Aici configurezi IBAN-urile în care ajung plățile de la utilizatori. Doar contul Administrator poate edita.
              Statusul <strong>TEST</strong> = încasări de test (fără confirmare automată). Statusul <strong>LIVE</strong> = încasări reale.
              Pentru fiecare status, doar un cont poate fi <em>activ</em> la un moment dat (cel afișat clienților la checkout).
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={loadAccounts} className="border border-black px-3 py-2 text-xs hover:bg-black hover:text-[#FFB300] flex items-center gap-2" data-testid="reload-accounts-btn">
              <RefreshCw className="w-3.5 h-3.5" /> Reîncarcă
            </button>
            {!showForm && (
              <button onClick={startNew} className="bg-black text-[#FFB300] px-4 py-2 text-xs flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border border-black" data-testid="add-account-btn">
                <Plus className="w-3.5 h-3.5" /> Adaugă cont
              </button>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-300 text-amber-900 text-xs p-3 mt-4 mb-6 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Notă: Stripe Checkout (card) decontează în contul tău Stripe Connected → payout în IBAN-ul configurat în Stripe Dashboard (nu aici).
            Conturile de mai jos sunt folosite pentru opțiunea „Transfer bancar SEPA" — clientul vede IBAN-ul și transferă manual din aplicația sa de banking.
          </span>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border-2 border-black p-6 mb-8" data-testid="account-form">
            <h2 className="font-bold text-lg mb-4">{editingId ? 'Editează cont' : 'Cont nou'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs uppercase text-gray-600">Titular cont</label>
                <input type="text" value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="account-holder-input" />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-600">Bancă</label>
                <input type="text" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="Revolut Bank, BCR, ING etc." className="w-full mt-1 px-3 py-2 border border-black" data-testid="bank-name-input" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase text-gray-600">IBAN</label>
                <input type="text" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value.toUpperCase() })} placeholder="RO22 REVO 0000 1555 6872 4293" className="w-full mt-1 px-3 py-2 border border-black font-mono" data-testid="iban-input" />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-600">SWIFT / BIC</label>
                <input type="text" value={form.swift_bic} onChange={(e) => setForm({ ...form, swift_bic: e.target.value.toUpperCase() })} placeholder="REVOROBB" className="w-full mt-1 px-3 py-2 border border-black font-mono" data-testid="swift-input" />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-600">Monedă</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="currency-select">
                  <option value="EUR">EUR</option>
                  <option value="RON">RON</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-600">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 px-3 py-2 border border-black" data-testid="status-select">
                  <option value="TEST">TEST (test)</option>
                  <option value="LIVE">LIVE (producție)</option>
                  <option value="DISABLED">DISABLED (dezactivat)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} data-testid="is-active-checkbox" />
                <label htmlFor="is_active" className="text-sm">Activează acest cont (devine implicit pentru status-ul {form.status})</label>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase text-gray-600">Note (opțional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-black text-xs" data-testid="notes-input" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={busy} className="bg-black text-[#FFB300] px-5 py-2 text-sm flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border border-black disabled:opacity-50" data-testid="save-account-btn">
                <Save className="w-4 h-4" /> {editingId ? 'Salvează modificările' : 'Creează cont'}
              </button>
              <button onClick={cancelForm} className="border border-black px-5 py-2 text-sm hover:bg-gray-100" data-testid="cancel-account-btn">Renunță</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-3" data-testid="accounts-list">
          {loading ? (
            <div className="text-sm text-gray-500">Se încarcă conturile…</div>
          ) : accounts.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 p-8 text-center text-sm text-gray-600">Niciun cont configurat. Apasă <strong>Adaugă cont</strong>.</div>
          ) : accounts.map((acc) => (
            <div key={acc.account_id} className="bg-white border-2 border-black p-5" data-testid={`account-${acc.account_id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={acc.status} />
                    {acc.is_active && <span className="flex items-center gap-1 text-xs text-green-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> ACTIV</span>}
                    <span className="text-xs text-gray-500">{acc.currency}</span>
                  </div>
                  <div className="font-bold text-lg">{acc.account_holder}</div>
                  <div className="text-sm text-gray-700">{acc.bank_name}</div>
                  <div className="mt-2 font-mono text-sm tracking-wider" data-testid={`iban-${acc.account_id}`}>{formatIban(acc.iban)}</div>
                  {acc.swift_bic && <div className="text-xs text-gray-500 mt-1">SWIFT/BIC: <span className="font-mono">{acc.swift_bic}</span></div>}
                  {acc.notes && <div className="text-xs text-gray-500 mt-2 italic">{acc.notes}</div>}
                  <div className="text-[10px] text-gray-400 mt-2">Actualizat: {new Date(acc.updated_at).toLocaleString('ro-RO')}</div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => startEdit(acc)} className="text-xs border border-black px-3 py-1.5 hover:bg-black hover:text-[#FFB300]" data-testid={`edit-${acc.account_id}`}>Editează</button>
                  <button onClick={() => remove(acc.account_id)} className="text-xs border border-red-700 text-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white flex items-center gap-1.5" data-testid={`delete-${acc.account_id}`}>
                    <Trash2 className="w-3 h-3" /> Șterge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
