/**
 * Admin Essentials Config — V6.4
 *
 * Secțiune NOUĂ "Esențiale funcționare pagină" cerută EXPLICIT de utilizator:
 *   "API keys cert-SIGN/DigiSign/Trans Sped se vor configura din pagina de profil
 *    admin-ului pentru sectiunea esentiale functionare pagina (feature nou)."
 *
 * Configurează 10 integrări critice:
 *  1. cert-SIGN (QES)
 *  2. DigiSign (QES)
 *  3. Trans Sped (QES)
 *  4-6. OSD: Distrigaz / Delgaz / Premier
 *  7. ANAF e-Factura
 *  8. SEAP / SICAP
 *  9. Open Banking (PSD2)
 * 10. ISC (notificări legale)
 *
 * Cheile sunt WRITE-ONLY pe backend — nu se afișează niciodată plain-text.
 */
import { useEffect, useReducer, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  Save, ShieldCheck, KeyRound, Building2, Banknote, Receipt, Globe,
  Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff,
} from 'lucide-react';

const INTEGRATIONS = [
  {
    id: 'cert_sign',
    title: 'cert-SIGN — Semnătură electronică calificată (QES)',
    icon: KeyRound,
    fields: [
      { key: 'cert_sign_api_url', label: 'API URL', placeholder: 'https://api.certsign.ro', secret: false },
      { key: 'cert_sign_account_id', label: 'Account ID', placeholder: 'EPD-PROD-001', secret: false },
      { key: 'cert_sign_api_key', label: 'API Key', placeholder: '••••••••••', secret: true },
    ],
    docs: 'https://www.certsign.ro/produse-si-servicii/',
    norm: 'Regulament eIDAS (UE 910/2014) + Legea 455/2001',
  },
  {
    id: 'digisign',
    title: 'DigiSign — PKI calificat',
    icon: KeyRound,
    fields: [
      { key: 'digisign_base_url', label: 'Base URL', placeholder: 'https://api.digisign.ro', secret: false },
      { key: 'digisign_account_id', label: 'Account ID', placeholder: 'DS-EPD-2026', secret: false },
      { key: 'digisign_api_key', label: 'API Key', placeholder: '••••••••••', secret: true },
    ],
    docs: 'https://www.digisign.ro',
    norm: 'eIDAS QES + Regulament UE 910/2014',
  },
  {
    id: 'trans_sped',
    title: 'Trans Sped — QES Provider',
    icon: KeyRound,
    fields: [
      { key: 'trans_sped_api_url', label: 'API URL', placeholder: 'https://qes.transsped.ro/api', secret: false },
      { key: 'trans_sped_token', label: 'API Token', placeholder: '••••••••••', secret: true },
      { key: 'trans_sped_certificate_serial', label: 'Serie certificat', placeholder: '1A2B3C4D...', secret: false },
    ],
    docs: 'https://www.transsped.ro',
    norm: 'eIDAS QES',
  },
  {
    id: 'osd_distrigaz',
    title: 'OSD Distrigaz Sud Rețele (Engie)',
    icon: Building2,
    fields: [
      { key: 'osd_distrigaz_login', label: 'Login portal OSD', placeholder: 'epd@energyprojectdesign.com', secret: false },
      { key: 'osd_distrigaz_password', label: 'Parolă portal', placeholder: '••••••••', secret: true },
    ],
    docs: 'https://www.distrigazsud-retele.ro',
    norm: 'Ord. ANRE 89/2018 + Ord. ANRE 162/2021',
  },
  {
    id: 'osd_delgaz',
    title: 'OSD Delgaz Grid',
    icon: Building2,
    fields: [
      { key: 'osd_delgaz_login', label: 'Login portal OSD', placeholder: 'epd@energyprojectdesign.com', secret: false },
      { key: 'osd_delgaz_password', label: 'Parolă portal', placeholder: '••••••••', secret: true },
    ],
    docs: 'https://www.delgaz.ro',
    norm: 'Ord. ANRE 89/2018',
  },
  {
    id: 'osd_premier',
    title: 'OSD Premier Energy',
    icon: Building2,
    fields: [
      { key: 'osd_premier_login', label: 'Login portal OSD', placeholder: 'epd@energyprojectdesign.com', secret: false },
      { key: 'osd_premier_password', label: 'Parolă portal', placeholder: '••••••••', secret: true },
    ],
    docs: 'https://www.premierenergy.ro',
    norm: 'Ord. ANRE 89/2018',
  },
  {
    id: 'anaf_efactura',
    title: 'ANAF e-Factura — Facturare electronică obligatorie',
    icon: Receipt,
    fields: [
      { key: 'anaf_efactura_cif', label: 'CIF firmă', placeholder: '43151074', secret: false },
      { key: 'anaf_efactura_cert_b64', label: 'Certificat PFX (base64)', placeholder: '••••••••••', secret: true, textarea: true },
      { key: 'anaf_efactura_cert_password', label: 'Parolă certificat', placeholder: '••••••••', secret: true },
    ],
    docs: 'https://anaf.ro',
    norm: 'OUG 120/2021 + L 296/2023',
  },
  {
    id: 'seap',
    title: 'SEAP / SICAP — Achiziții publice',
    icon: Globe,
    fields: [
      { key: 'seap_company_id', label: 'ID Companie SEAP', placeholder: 'EPD-43151074', secret: false },
      { key: 'seap_login', label: 'Login SEAP', placeholder: 'epd@energyprojectdesign.com', secret: false },
      { key: 'seap_password', label: 'Parolă SEAP', placeholder: '••••••••', secret: true },
    ],
    docs: 'https://e-licitatie.ro',
    norm: 'L 98/2016 + L 99/2016',
  },
  {
    id: 'openbanking',
    title: 'Open Banking (PSD2) — Cash-flow firmă',
    icon: Banknote,
    fields: [
      { key: 'openbanking_provider', label: 'Provider', placeholder: 'TrueLayer / Tink / Salt Edge', secret: false },
      { key: 'openbanking_client_id', label: 'Client ID', placeholder: 'EPD-OB-...', secret: false },
      { key: 'openbanking_client_secret', label: 'Client Secret', placeholder: '••••••••••', secret: true },
    ],
    docs: 'https://www.psd2-api.com',
    norm: 'PSD2 (UE 2015/2366) + GDPR',
  },
  {
    id: 'isc',
    title: 'ISC — Inspectoratul de Stat în Construcții',
    icon: ShieldCheck,
    fields: [
      { key: 'isc_email_default', label: 'Email ISC implicit', placeholder: 'office@isc.gov.ro', secret: false },
      { key: 'isc_county_office', label: 'Birou județean implicit', placeholder: 'ISC București', secret: false },
    ],
    docs: 'https://isc.gov.ro',
    norm: 'Legea 50/1991 + Legea 10/1995 + HG 1735/2006',
  },
];

function FieldInput({ field, value, onChange, currentlyConfigured }) {
  const [reveal, setReveal] = useState(false);
  if (field.textarea) {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white font-mono"
        rows={3}
        data-testid={`essentials-input-${field.key}`}
      />
    );
  }
  return (
    <div className="relative">
      <input
        type={field.secret && !reveal ? 'password' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder + (currentlyConfigured ? ' (deja configurat — lasă gol pentru a păstra)' : '')}
        className="w-full bg-gray-50 border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white font-mono pr-9"
        data-testid={`essentials-input-${field.key}`}
      />
      {field.secret && (
        <button
          type="button"
          onClick={() => setReveal(!reveal)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
        >
          {reveal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

export default function AdminEssentials() {
  const [config, setConfig] = useState({});
  const [status, setStatus] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, dispatchSaving] = useReducer(
    (state, action) => ({ ...state, [action.id]: action.value }),
    {}
  );

  const load = async () => {
    setLoading(true);
    try {
      const { data: cfg } = await api.get('/admin/config');
      const { data: st } = await api.get('/admin/essentials/status');
      setConfig(cfg || {});
      setStatus(st || {});
    } catch (e) {
      toast.error(`Eroare load config: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfgRes = await api.get('/admin/config');
        const stRes = await api.get('/admin/essentials/status');
        if (!cancelled) {
          setConfig(cfgRes.data || {});
          setStatus(stRes.data || {});
        }
      } catch (e) {
        if (!cancelled) toast.error(`Eroare load config: ${e?.response?.data?.detail || e.message}`);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveIntegration = async (integration) => {
    dispatchSaving({ id: integration.id, value: true });
    try {
      // Build payload only with non-empty form keys for THIS integration
      const payload = {};
      for (const f of integration.fields) {
        if (form[f.key] !== undefined && form[f.key] !== '') {
          payload[f.key] = form[f.key];
        }
      }
      if (Object.keys(payload).length === 0) {
        toast.info('Nicio modificare');
        return;
      }
      const { data } = await api.put('/admin/config', payload);
      setConfig(data);
      // Refresh status
      const { data: st } = await api.get('/admin/essentials/status');
      setStatus(st);
      // Clear form for this integration
      setForm((f) => {
        const n = { ...f };
        integration.fields.forEach((field) => { delete n[field.key]; });
        return n;
      });
      toast.success(`Salvat: ${integration.title.split('—')[0].trim()}`);
    } catch (e) {
      toast.error(`Eroare salvare: ${e?.response?.data?.detail || e.message}`);
    } finally {
      dispatchSaving({ id: integration.id, value: false });
    }
  };

  const totalConfigured = Object.values(status).filter((s) => s.configured).length;
  const totalIntegrations = INTEGRATIONS.length;

  return (
    <AppShell
      title="Esențiale Funcționare Pagină"
      subtitle="Configurare integrări legale critice (chei API write-only)"
    >
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-blue-400 bg-blue-50 p-4" data-testid="essentials-total-card">
          <div className="text-[10px] uppercase tracking-wider text-blue-700">Total integrări</div>
          <div className="text-2xl font-bold">{totalConfigured} / {totalIntegrations}</div>
          <div className="text-[11px] text-gray-600 mt-1">configurate complet</div>
        </div>
        <div className="border-2 border-amber-400 bg-amber-50 p-4">
          <div className="text-[10px] uppercase tracking-wider text-amber-700">Pending</div>
          <div className="text-2xl font-bold">{totalIntegrations - totalConfigured}</div>
          <div className="text-[11px] text-gray-600 mt-1">așteaptă config</div>
        </div>
        <div className="border-2 border-green-400 bg-green-50 p-4">
          <div className="text-[10px] uppercase tracking-wider text-green-700">Securitate</div>
          <div className="text-sm font-bold leading-tight">Write-only encrypted</div>
          <div className="text-[11px] text-gray-600 mt-1">Cheile nu se afișează plain-text niciodată</div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      )}

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const st = status[integration.id] || {};
          const Icon = integration.icon || KeyRound;
          return (
            <div key={integration.id} className="border-2 border-gray-300 bg-white" data-testid={`essentials-card-${integration.id}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-bold">{integration.title}</div>
                    <div className="text-[10px] text-gray-500">{integration.norm}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {st.configured ? (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Configurat
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5">
                      <AlertTriangle className="w-3 h-3" /> Neconfigurat
                    </span>
                  )}
                  <a href={integration.docs} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                    Docs ↗
                  </a>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {integration.fields.map((field) => (
                  <div key={field.key} className={field.textarea ? 'md:col-span-2' : ''}>
                    <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">
                      {field.label}
                      {field.secret && <span className="ml-1 text-red-500">●</span>}
                    </label>
                    <FieldInput
                      field={field}
                      value={form[field.key]}
                      onChange={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                      currentlyConfigured={!!config[`${field.key}_set`] || !!config[field.key]}
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    onClick={() => saveIntegration(integration)}
                    disabled={saving[integration.id]}
                    className="text-xs inline-flex items-center gap-1 bg-black text-white px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
                    data-testid={`essentials-save-${integration.id}`}
                  >
                    {saving[integration.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Salvează {integration.title.split('—')[0].trim()}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
