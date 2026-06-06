import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Building2, Save, ExternalLink, RefreshCw } from 'lucide-react';

const FIELDS = [
  { key: 'company_name', label: 'Denumire societate', section: 'identity', placeholder: 'ex: ENERGY PROJECT DESIGN SRL' },
  { key: 'cui', label: 'CUI / Cod Fiscal', section: 'identity', placeholder: 'ex: 43151074' },
  { key: 'reg_com', label: 'Registrul Comerțului', section: 'identity', placeholder: 'ex: J40/12982/2020' },
  { key: 'address', label: 'Sediu (adresă)', section: 'address', placeholder: 'ex: Str. Exemplu nr. 1, ap. 2' },
  { key: 'city', label: 'Localitate', section: 'address', placeholder: 'București' },
  { key: 'county', label: 'Județ', section: 'address', placeholder: 'București / Cluj / etc.' },
  { key: 'postal_code', label: 'Cod poștal', section: 'address', placeholder: '012345' },
  { key: 'country', label: 'Țară', section: 'address', placeholder: 'România' },
  { key: 'email', label: 'Email oficial', section: 'contact', placeholder: 'contact@firma.ro' },
  { key: 'phone', label: 'Telefon', section: 'contact', placeholder: '+40 7XX XXX XXX' },
  { key: 'website', label: 'Website', section: 'contact', placeholder: 'https://firma.ro' },
  { key: 'iban', label: 'IBAN', section: 'banking', placeholder: 'RO22 REVO 0000 ...', mono: true },
  { key: 'bank_name', label: 'Banca', section: 'banking', placeholder: 'Revolut / BCR / ING / ...' },
  { key: 'legal_representative', label: 'Reprezentant legal', section: 'legal', placeholder: 'Nume Prenume' },
  { key: 'representative_role', label: 'Funcție', section: 'legal', placeholder: 'Administrator / CEO / etc.' },
];

const SECTIONS = {
  identity: { label: 'Identitate', icon: '🏢' },
  address: { label: 'Sediu', icon: '📍' },
  contact: { label: 'Contact', icon: '✉️' },
  banking: { label: 'Bancă', icon: '🏦' },
  legal: { label: 'Reprezentant legal', icon: '⚖️' },
};

export default function CompanyProfile() {
  const [data, setData] = useState({});
  const [placeholders, setPlaceholders] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: d }, { data: p }] = await Promise.all([
          api.get('/company-profile'),
          api.get('/company-profile/placeholders'),
        ]);
        setData(d || {});
        setPlaceholders(p || {});
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  function update(key, val) { setData(d => ({ ...d, [key]: val })); }

  async function save() {
    setBusy(true);
    try {
      const cleaned = Object.fromEntries(Object.entries(data).filter(([k, v]) => k !== 'user_id' && k !== 'updated_at' && k !== 'created_at' && k !== '_id'));
      const { data: saved } = await api.put('/company-profile', cleaned);
      setData(saved);
      const { data: p } = await api.get('/company-profile/placeholders');
      setPlaceholders(p);
      toast.success('Profil societate salvat.');
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare salvare.');
    } finally { setBusy(false); }
  }

  function handleFileUpload(field) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 500 * 1024) { toast.error('Fișier prea mare (max 500KB).'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        update(field, reader.result);
        toast.success('Imagine încărcată — apasă Salvează pentru a păstra.');
      };
      reader.readAsDataURL(file);
    };
  }

  const sectionEntries = Object.entries(SECTIONS).map(([sid, smeta]) => [sid, smeta, FIELDS.filter(f => f.section === sid)]);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl" data-testid="company-profile-page">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3"><Building2 className="w-8 h-8" /> Profil societate</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Datele firmei tale folosite ca placeholder-e în template-urile DOCX și email-urile generate. Salvează o singură dată — apar automat în toate documentele.
            </p>
          </div>
          <button onClick={save} disabled={busy || loading} className="bg-black text-[#FFB300] px-5 py-2.5 flex items-center gap-2 hover:bg-[#FFB300] hover:text-black border-2 border-black font-semibold text-sm disabled:opacity-50" data-testid="save-company-btn">
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvează
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500 mt-8">Se încarcă datele firmei…</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {sectionEntries.map(([sid, smeta, fields]) => (
                <div key={sid} className="bg-white border-2 border-black p-5" data-testid={`section-${sid}`}>
                  <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-2">
                    <span className="text-base">{smeta.icon}</span> {smeta.label}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {fields.map((f) => (
                      <div key={f.key} className={f.key === 'address' ? 'md:col-span-2' : ''}>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500">{f.label}</label>
                        <input
                          type="text"
                          value={data[f.key] || ''}
                          onChange={(e) => update(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className={`w-full mt-1 px-3 py-2 border border-black text-sm ${f.mono ? 'font-mono tracking-wider' : ''}`}
                          data-testid={`input-${f.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Logo & stamp upload */}
              <div className="bg-white border-2 border-black p-5" data-testid="section-media">
                <div className="text-xs uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-2"><span className="text-base">🖼️</span> Imagine logo & ștampilă firmă</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase text-gray-500">Logo firmă (max 500KB, PNG/JPG)</label>
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleFileUpload('logo_url')} className="w-full mt-1 text-xs" data-testid="upload-logo" />
                    {data.logo_url && (
                      <div className="mt-2 border border-gray-200 p-2 bg-gray-50">
                        <img src={data.logo_url} alt="Logo" className="max-h-24 mx-auto" data-testid="logo-preview" />
                        <button onClick={() => update('logo_url', '')} className="text-[10px] text-red-700 hover:underline mt-1 block mx-auto">Șterge logo</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-gray-500">Ștampilă firmă (max 500KB)</label>
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleFileUpload('stamp_signature_url')} className="w-full mt-1 text-xs" data-testid="upload-stamp" />
                    {data.stamp_signature_url && (
                      <div className="mt-2 border border-gray-200 p-2 bg-gray-50">
                        <img src={data.stamp_signature_url} alt="Stamp" className="max-h-24 mx-auto" data-testid="stamp-preview" />
                        <button onClick={() => update('stamp_signature_url', '')} className="text-[10px] text-red-700 hover:underline mt-1 block mx-auto">Șterge ștampilă</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-4 self-start">
              <div className="bg-[#FFB300] text-black border-2 border-black p-4">
                <h2 className="font-bold text-sm mb-2">Placeholderele tale generate</h2>
                <p className="text-[11px] mb-3">Folosește-le în DOCX cu sintaxa <code className="bg-black text-[#FFB300] px-1">{'{{nume_placeholder}}'}</code> sau <code className="bg-black text-[#FFB300] px-1">{'<nume_placeholder>'}</code>.</p>
                <div className="bg-white text-black p-3 space-y-1 text-[11px] font-mono max-h-80 overflow-y-auto" data-testid="placeholders-preview">
                  {Object.entries(placeholders).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-gray-500 truncate">{`{{${k}}}`}</span>
                      <span className="font-bold text-right truncate max-w-[55%]" title={v}>{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600">
                <strong className="block mb-1">Tip:</strong>
                Dacă încărci un șablon DOCX cu <code className="bg-white px-1">{'{{nume_societate}}'}</code> sau <code className="bg-white px-1">{'<cui_societate>'}</code>, valorile de aici se vor substitui automat la generarea documentului.
                <a href="/templates" className="block mt-2 text-[#FFB300] hover:underline flex items-center gap-1">Vezi șabloane <ExternalLink className="w-3 h-3" /></a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
