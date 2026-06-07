import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { FileText, Plus, Download, Receipt, Building2, AlertTriangle, X, Save, Loader2 } from 'lucide-react';

const EMPTY_ITEM = { name: '', qty: 1, unit: 'BUC', price: 0, vat_rate: 19 };

export default function ANAFInvoicing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    series: 'EPD',
    number: Math.floor(Math.random() * 9000) + 1000,
    buyer_name: '', buyer_cui: '', buyer_address: '',
    items: [{ ...EMPTY_ITEM }],
  });

  const load = async () => {
    try { const { data } = await api.get('/anaf/invoices'); setInvoices(data.invoices || []); }
    catch { toast.error('Eroare încărcare facturi'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totals = () => {
    let sub = 0, vat = 0;
    form.items.forEach((it) => {
      const lt = (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0);
      sub += lt; vat += lt * ((parseFloat(it.vat_rate) || 0) / 100);
    });
    return { sub, vat, total: sub + vat };
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.buyer_name.trim()) { toast.error('Numele cumpărătorului obligatoriu'); return; }
    if (!form.items.length) { toast.error('Minim un articol'); return; }
    setSubmitting(true);
    try {
      await api.post('/anaf/invoices', {
        series: form.series.trim(),
        number: parseInt(form.number),
        buyer: { name: form.buyer_name, cui: form.buyer_cui, address: form.buyer_address },
        items: form.items.map((it) => ({
          name: it.name, qty: parseFloat(it.qty) || 0, unit: it.unit,
          price: parseFloat(it.price) || 0, vat_rate: parseFloat(it.vat_rate) || 0,
        })),
      });
      toast.success('Factură generată (draft)');
      setForm((f) => ({ ...f, number: f.number + 1, buyer_name: '', buyer_cui: '', buyer_address: '', items: [{ ...EMPTY_ITEM }] }));
      setShowForm(false);
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setSubmitting(false); }
  };

  const downloadXml = async (id, sn) => {
    try {
      const res = await api.get(`/anaf/invoices/${id}/xml`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/xml' }));
      const a = document.createElement('a'); a.href = url; a.download = `${sn}.xml`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Eroare descărcare'); }
  };

  const updateItem = (idx, field, val) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (idx) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const t = totals();
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.total_ron || 0), 0);

  return (
    <AppShell title="ANAF e-Factura" subtitle="Generare draft UBL 2.1 RO-CIUS · pre-validare înainte de trimitere SPV">
      {/* Hero */}
      <div className="relative overflow-hidden mb-8 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a1a] to-[#0A0A0A] text-white p-8" data-testid="anaf-hero">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-sky-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#FFB300] mb-2 flex items-center gap-2"><Receipt className="w-3.5 h-3.5" /> // UBL 2.1 · CIUS-RO 1.0.1</div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">{totalRevenue.toLocaleString('ro-RO')} RON facturați</h2>
            <p className="text-sm text-gray-300 max-w-xl"><strong>{invoices.length}</strong> facturi draft generate. Descarcă XML-ul oricărei facturi pentru încărcare manuală în <span className="font-mono text-[#FFB300]">e-factura.anaf.ro</span>.</p>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 p-3 text-xs text-amber-100">
              <AlertTriangle className="w-4 h-4 mb-1.5 text-amber-300" />
              <strong className="text-amber-200">Trimitere SPV manuală</strong> — în această versiune draft-ul XML se descarcă local și se încarcă manual în SPV ANAF. Integrarea OAuth2 SPV vine în următoarea iterație.
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => setShowForm(!showForm)} className="amber-btn text-sm py-2.5 px-4" data-testid="anaf-toggle-form">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Anulează' : 'Factură nouă'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border-2 border-black p-6 mb-6" data-testid="anaf-form">
          <div className="grid lg:grid-cols-4 gap-3 mb-4 pb-4 border-b border-gray-200">
            <div>
              <label className="label block mb-1">Serie</label>
              <input type="text" value={form.series} onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="label block mb-1">Număr</label>
              <input type="number" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div className="lg:col-span-2">
              <label className="label block mb-1">Cumpărător *</label>
              <input data-testid="anaf-buyer-name" type="text" value={form.buyer_name} onChange={(e) => setForm((f) => ({ ...f, buyer_name: e.target.value }))} placeholder="SC Client SRL" required className="w-full border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="label block mb-1">CUI cumpărător</label>
              <input type="text" value={form.buyer_cui} onChange={(e) => setForm((f) => ({ ...f, buyer_cui: e.target.value }))} placeholder="RO12345678" className="w-full border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div className="lg:col-span-3">
              <label className="label block mb-1">Adresă cumpărător</label>
              <input type="text" value={form.buyer_address} onChange={(e) => setForm((f) => ({ ...f, buyer_address: e.target.value }))} placeholder="Str., nr., localitate, județ" className="w-full border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">Articole</div>
          <div className="space-y-2">
            {form.items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center" data-testid={`anaf-item-${idx}`}>
                <input type="text" value={it.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder="Denumire" className="col-span-4 border border-gray-200 px-2 py-1.5 text-sm" required />
                <input type="number" step="0.01" value={it.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} placeholder="Cant." className="col-span-1 border border-gray-200 px-2 py-1.5 text-sm" />
                <select value={it.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} className="col-span-1 border border-gray-200 px-2 py-1.5 text-sm">
                  <option>BUC</option><option>KG</option><option>MP</option><option>ML</option><option>HOUR</option>
                </select>
                <input type="number" step="0.01" value={it.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} placeholder="Preț fără TVA" className="col-span-2 border border-gray-200 px-2 py-1.5 text-sm" />
                <input type="number" step="0.01" value={it.vat_rate} onChange={(e) => updateItem(idx, 'vat_rate', e.target.value)} placeholder="TVA %" className="col-span-1 border border-gray-200 px-2 py-1.5 text-sm" />
                <div className="col-span-2 text-right text-sm font-mono">{((parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0)).toFixed(2)} RON</div>
                <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-gray-400 hover:text-red-600" disabled={form.items.length === 1}><X className="w-4 h-4 mx-auto" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-2 text-xs text-gray-600 hover:text-black flex items-center gap-1" data-testid="anaf-add-item"><Plus className="w-3 h-3" /> Articol</button>

          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
            <div className="text-sm space-y-0.5">
              <div className="text-gray-600">Subtotal: <strong className="font-mono">{t.sub.toFixed(2)} RON</strong></div>
              <div className="text-gray-600">TVA: <strong className="font-mono">{t.vat.toFixed(2)} RON</strong></div>
              <div className="text-lg font-bold">Total: <span className="font-mono text-[#FFB300]">{t.total.toFixed(2)} RON</span></div>
            </div>
            <button type="submit" disabled={submitting} className="amber-btn py-2.5 px-5 disabled:opacity-50" data-testid="anaf-submit">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Generează factură
            </button>
          </div>
        </form>
      )}

      {loading ? <div className="text-sm text-gray-500 py-12 text-center">Se încarcă…</div> : (
        <div className="bg-white border border-gray-200 overflow-x-auto" data-testid="anaf-list">
          <table className="w-full text-sm">
            <thead className="bg-black text-[#FFB300] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="text-left px-3 py-2.5">Factură</th>
                <th className="text-left px-3 py-2.5">Data</th>
                <th className="text-left px-3 py-2.5">Cumpărător</th>
                <th className="text-right px-3 py-2.5">Subtotal</th>
                <th className="text-right px-3 py-2.5">TVA</th>
                <th className="text-right px-3 py-2.5">Total</th>
                <th className="text-center px-3 py-2.5">Status SPV</th>
                <th className="text-right px-3 py-2.5">XML</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.invoice_id} className="border-b border-gray-100 hover:bg-gray-50" data-testid={`anaf-row-${inv.invoice_id}`}>
                  <td className="px-3 py-2.5 font-mono font-bold">{inv.series}-{inv.number}</td>
                  <td className="px-3 py-2.5 text-gray-600">{inv.issue_date}</td>
                  <td className="px-3 py-2.5">{inv.buyer?.name}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{Number(inv.subtotal_ron || 0).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{Number(inv.vat_total_ron || 0).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold">{Number(inv.total_ron || 0).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-center"><span className="text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5">{inv.spv_status}</span></td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => downloadXml(inv.invoice_id, `${inv.series}-${inv.number}`)} className="text-[10px] uppercase tracking-wider font-semibold text-gray-600 hover:text-black inline-flex items-center gap-1" data-testid={`anaf-xml-${inv.invoice_id}`}>
                      <Download className="w-3 h-3" /> Descarcă
                    </button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-12 text-center text-gray-400 text-sm">Nicio factură. Generează prima cu butonul de mai sus.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
