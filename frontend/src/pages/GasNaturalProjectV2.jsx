/**
 * Gas Natural Studio — Operational Data Sheet (V2)
 *
 * Replică EXACTĂ a modelului tipărit cerut de Energy Project Design SRL
 * (sursă: screenshot operațional cu fundal verde transmis literal).
 *
 * Structura este blueprint-ul pentru CLONARE pe toate celelalte industrii
 * (electric, apă-canal, telecom, fotovoltaice, arhitectură, feroviar etc.).
 *
 * Secțiuni (tab "DATE"):
 *  1. Date tehnice (adresă, client, tip lucrări, amplasament)
 *  2. Instalație utilizare (Da/Nu, tip, presiune)
 *  3. Material BR nou (PE/Oțel, Dn, presiune, lungime, subteran/aerian, teu, lățime sanț)
 *  4. Material CND existent
 *  5. CND nouă (cu vană/teu/reducție)
 *  6. Documente OSD (Ordin lucru, ATR — toate cu termen/prelungit)
 *  7. Facturare (proiectantă, executantă, VGD, RTE — număr legitimație + societate)
 *  8. Consumatori (3 coloane: se mențin / se dezafectează / noi)
 *  9. Totaluri (Qmin, Qmax, contor, firidă, săpătură)
 * 10. Alte date tehnice (ramificat, tub protecție, poziție firidă, rețele intersecții)
 * 11. Specificații cadastrale
 * 12. Suprafață gropi sudare (auto-calcul)
 * 13. Avize (dinamic: AC, Netcity, Telekom, Enel, Apa-Nova + custom)
 * 14. Generare documente (Deviz, Situație lucrări, Listă materiale, Fișă tehnică)
 * 15. Acte beneficiar / Acte lucrare / Planuri lucrare (upload + delete)
 * 16. Coloană dreaptă: Adresa mail (10 destinatari distincți cu butoane Trimite)
 * 17. Upload ștampile (5 tipuri)
 * 18. Download documente generate (Carte Tehnică, DTAC, PTH)
 * 19. Acțiuni finale (Trimite proiect, Încarcă avizat, Descarcă toate, Salvează)
 *
 * Tab "AVIZE" = view focalizat pe Avize Hub (din /api/gas-project/{pid}/avize).
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import RegistryFieldsTab from '../components/RegistryFieldsTab';
import GasChronologicalStepper from '../components/GasChronologicalStepper';
import GasEngineeringPanel from '../components/GasEngineeringPanel';
import {
  ArrowLeft, Save, FileSignature, Send, Download, Upload, Trash2, Plus,
  CheckCircle2, FileText, Stamp, Mail, Calculator, Package, Sparkles,
  ChevronDown, ChevronUp, Loader2, ExternalLink, Eye, GitFork, ShieldCheck,
} from 'lucide-react';

const SECTIONS = [
  { id: 'date-tehnice',        label: '1. Date tehnice' },
  { id: 'materiale',           label: '2. Materiale & dimensionare' },
  { id: 'docs-osd',            label: '3. Documente OSD' },
  { id: 'facturare',           label: '4. Facturare & reprezentanți' },
  { id: 'consumatori',         label: '5. Consumatori' },
  { id: 'totaluri',            label: '6. Totaluri & dimensionare contor' },
  { id: 'alte-date',           label: '7. Alte date tehnice' },
  { id: 'cadastrale',          label: '8. Specificații cadastrale' },
  { id: 'gropi-sudare',        label: '9. Suprafață gropi sudare' },
  { id: 'avize-list',          label: '10. Avize obținute' },
  { id: 'generare-documente',  label: '11. Generare documente' },
  { id: 'acte-uploads',        label: '12. Acte & planuri lucrare' },
  { id: 'email-dispatch',      label: '13. Trimitere documentație' },
  { id: 'stampile',            label: '14. Ștampile firme' },
  { id: 'descarcare-finala',   label: '15. Descărcare finală' },
];

const EMAIL_DISPATCH_ROUTES = [
  { id: 'primarie',          label: 'Documentație cerere + DTAC + avize către Primărie', def: 'primarie@example.ro' },
  { id: 'diriginte_carte',   label: 'Carte tehnică către Diriginte șantier',             def: 'diriginte@example.ro' },
  { id: 'contabilitate',     label: 'Avize și taxe către Contabilitate',                  def: 'contabilitate@example.ro' },
  { id: 'osd',               label: 'Avize și taxe către OSD',                            def: 'distribuție@example.ro' },
  { id: 'isc',               label: 'Proiect către ISC',                                  def: 'isc@example.ro' },
  { id: 'diriginte_disp',    label: 'Dispoziție de șantier către Diriginte',              def: 'diriginte@example.ro' },
  { id: 'politie',           label: 'Documentație către Poliția Rutieră',                 def: 'politie@example.ro' },
  { id: 'proiectant_dtac',   label: 'Documentație DTAC către Societatea Proiectantă',     def: 'proiectant@example.ro' },
  { id: 'proiectant_pth',    label: 'Documentație PTH către Societatea Proiectantă',      def: 'proiectant@example.ro' },
  { id: 'utilitati_cereri',  label: 'Cereri avize/documentație către Utilități',          def: 'utilitati@example.ro' },
];

const GENERATE_DOCS = [
  { id: 'deviz',          label: 'Deviz',                     template: 'caiet_sarcini' },
  { id: 'situatie',       label: 'Situație de lucrări',       template: 'memoriu_tehnic' },
  { id: 'materiale',      label: 'Listă de materiale',        template: 'borderou' },
  { id: 'fisa_tehnica',   label: 'Fișă tehnică generală',     template: 'memoriu_tehnic' },
];

const FINAL_DOWNLOADS = [
  { id: 'carte_tehnica',  label: 'Carte Tehnică',       template: 'carte_tehnica' },
  { id: 'dtac',           label: 'DTAC',                template: 'memoriu_tehnic' },
  { id: 'pth',            label: 'PTH (Proiect Tehnic Execuție)', template: 'caiet_sarcini' },
];

const STAMPS_UPLOAD = [
  { id: 'stamp_proiectant',  label: 'Ștampilă proiectant (firmă)',       category: 'stamp_proiectant' },
  { id: 'stamp_executant',   label: 'Ștampilă executant (firmă)',        category: 'stamp_executant' },
  { id: 'stamp_vgd',         label: 'Ștampilă VGD (verificator)',        category: 'stamp_vgd' },
  { id: 'stamp_rte',         label: 'Ștampilă RTE (responsabil execuție)', category: 'stamp_rte' },
  { id: 'stamp_primarie',    label: 'Ștampilă Primărie (documentație)',  category: 'stamp_primarie' },
  { id: 'stamp_societate',   label: 'Ștampilă societate (sigiliu legal)', category: 'stamp_societate' },
];

const DEFAULT_AVIZE_LIST = [
  { id: 'ac',          label: 'Autorizație construire' },
  { id: 'netcity',     label: 'Netcity' },
  { id: 'telekom',     label: 'Telekom' },
  { id: 'enel',        label: 'Enel' },
  { id: 'apa_nova',    label: 'Apa-Nova / RAJA' },
];

const CONSUMER_TYPES = [
  'Mașină aragaz', 'Centrală termică', 'Sobă', 'Mașină de gătit', 'Boiler instant', 'Boiler depozit', 'Cazan', 'Convector', 'Alt aparat',
];

const DEFAULT_DATA = {
  // Date tehnice
  adresa_imobil: '', adresa_imobil_egala_amplasament: 'Nu',
  nume_client: '', tipul_lucrarii: 'Branșament gaze naturale',
  amplasament_strada: '', amplasament_localitate: '', amplasament_judet: '',
  amplasament_alte_detalii: '',
  instalatie_utilizare: 'Da', iu_tip: 'IUGN', iu_suplimentare_debit: 'Nu', iu_presiune: 'Joasă',
  conducta_noua: 'Nu',
  // Material BR
  br_material: 'Polietilenă', br_diametru_dn: '32 mm', br_presiune: 'Redusă',
  br_lungime_m: 12, br_lungime_km: 0.012, br_subteran: 'Subteran',
  br_teu_bransament: 'Teu BR cu colier PE100 SDR11 Stop gaz max Dn80/32mm',
  br_latime_sant: 0.4,
  // Material CND existent
  cnd_ex_material: 'Polietilenă', cnd_ex_diametru_dn: '90 mm', cnd_ex_presiune: 'Redusă',
  cnd_ex_lungime_m: '', cnd_ex_lungime_km: '', cnd_ex_subteran: 'Subteran',
  cnd_ex_tip_vana: 'Vană în cămin tip closet PE Dn 90',
  // CND Nouă
  cnd_noua: 'Nu', cnd_n_material: 'Polietilenă', cnd_n_diametru_dn: '90 mm',
  cnd_n_presiune: 'Redusă', cnd_n_lungime_m: 115, cnd_n_lungime_km: 0.115,
  cnd_n_subteran: 'Subteran', cnd_n_vana: 'Da', cnd_n_teu: 'Da', cnd_n_reductie: 'Nu',
  cnd_n_latime_sant: 0.6,
  // OSD docs
  osd_operator: 'Distrigaz Sud - Rețele',
  osd_ordin_nr: '', osd_ordin_status: 'In termen',
  osd_atr_nr: '', osd_atr_status: 'In termen',
  osd_alt_doc_nr: '', osd_alt_doc_status: 'In termen',
  // Facturare
  fact_proiectanta_societate: '', fact_proiectanta_nume: '',
  fact_proiectanta_autorizatie: 'PGD', fact_proiectanta_legitimatie: '', fact_proiectanta_societate_leg: '',
  fact_executanta_societate: '', fact_executanta_nume: '',
  fact_executanta_autorizatie: 'EGD', fact_executanta_legitimatie: '', fact_executanta_societate_leg: '',
  fact_vgd_nume: '', fact_vgd_autorizatie: 'VGD', fact_vgd_legitimatie: '',
  fact_rte_nume: '', fact_rte_autorizatie: 'RTE', fact_rte_legitimatie: '',
  // Consumatori (3 liste)
  consumatori_mentinuti: [],
  consumatori_dezafectati: [],
  consumatori_noi: [],
  // Totaluri
  qmin_total: 0, qmax_regulator: 0,
  tip_contor: 'G25', tip_firida: 'B300',
  tip_sapatura_br: 'Foraj', tip_sapatura_cnd: 'Sant deschis',
  // Alte
  br_ramificat: 'Nu',
  tub_protectie_cnd: 'PE100 SDR11 Dn 90 mm',
  tub_protectie_br: '',
  pozitie_firida: 0.5, fata_de_limita: 'Stânga',
  retele_les: 'Nu', retele_les_pat_caramizi: '',
  retele_telefonie: 'Nu', retele_telefonie_tub: 'PE100 SDR11 Dn 90 mm', retele_telefonie_lungime: 0,
  retele_sine_tramvai: 'Nu',
  retele_drum_national: 'Nu',
  intersectii_les: 'Nu', intersectii_les_pat: '',
  intersectii_telefonie: 'Nu', intersectii_telefonie_tub: 'PE100 SDR11 Dn 90 mm', intersectii_telefonie_l: 0,
  intersectii_sine: 'Nu',
  intersectii_drum_national: 'Nu',
  // Cadastrale
  cadastrale_traseu: '', cadastrale_traseu_tip: 'CND',
  cadastrale_aditionale: [],
  cadastral_imobil: '', cadastral_imobil_tip: 'BR',
  // Gropi sudare
  groapa_sudare_br: 'L=1,5 x 1,5 x 1',
  groapa_sudare_cnd: 'L=1,5 x 1,5 x 1',
  // Avize
  avize_obtinute: DEFAULT_AVIZE_LIST.map((a) => ({ id: a.id, label: a.label, serie_nr_data: '', aviz_file: null, plata_file: null, doc_file: null })),
  avize_custom: [],
  // Emails
  emails: EMAIL_DISPATCH_ROUTES.reduce((acc, r) => ({ ...acc, [r.id]: r.def }), {}),
  // Stamps & uploads
  stamps: STAMPS_UPLOAD.reduce((acc, s) => ({ ...acc, [s.id]: null }), {}),
  acte_beneficiar: [], acte_lucrare: [], planuri_lucrare: [],
};

function Field({ label, children, span = 1, testid }) {
  return (
    <div className={`col-span-${span}`} data-testid={testid}>
      <label className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-semibold block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = 'text', placeholder, className = '', testid }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white border border-slate-300 px-3 py-2 text-sm rounded-md outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors ${className}`}
      data-testid={testid}
    />
  );
}

function Toggle({ value, onChange, options = ['Da', 'Nu'], testid }) {
  return (
    <div className="inline-flex bg-slate-100 rounded-md p-0.5" data-testid={testid}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1 text-xs font-semibold rounded transition-all ${value === opt ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Select({ value, onChange, options, testid }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-slate-300 px-3 py-2 text-sm rounded-md outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-colors w-full cursor-pointer"
      data-testid={testid}
    >
      {(options || []).map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionCard({ id, title, children, collapsed, onToggle, accent = 'violet' }) {
  return (
    <section id={id} className="bg-white border border-slate-200 hover:border-violet-200 rounded-xl mb-4 overflow-hidden transition-colors epd-shadow" data-testid={`section-${id}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-violet-50/40 to-transparent hover:from-violet-50 border-b border-slate-200/60 transition-all group"
      >
        <h3 className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-violet-700 transition-colors">{title}</h3>
        <ChevronDown className={`w-4 h-4 text-violet-600 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {!collapsed && <div className="p-5">{children}</div>}
    </section>
  );
}

// ====================================================================
// PREVIEW SECTION MENU — generează PDF combinat per secțiune
// ====================================================================
function PreviewSectionMenu({ pid, backendUrl }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const sections = [
    { id: 'proiectare', label: 'Proiectare (DTAC+PT)' },
    { id: 'avize', label: 'Avize (8 cereri)' },
    { id: 'executie', label: 'Execuție' },
    { id: 'carte_tehnica', label: 'Carte Tehnică + Recepție' },
    { id: 'dispozitie_santier', label: 'Dispoziție Șantier' },
    { id: 'pif', label: 'PIF' },
  ];

  const previewSection = async (sid) => {
    setBusy(true);
    try {
      const res = await fetch(`${backendUrl}/api/document/section/${sid}/preview`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, template_id: '', auto_certify: true, stamps: [] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success(`Preview deschis: ${sid}`);
    } catch (e) {
      toast.error(`Eroare preview: ${e.message}`);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" data-testid="preview-section-menu">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="text-xs inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
        data-testid="preview-section-btn"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
        Preview secțiune PDF
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-300 shadow-lg z-50">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => previewSection(s.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-0"
              data-testid={`preview-section-${s.id}`}
            >
              <FileText className="w-3 h-3 inline mr-1 text-blue-600" />
              {s.label}
            </button>
          ))}
          <div className="px-3 py-1.5 text-[9px] text-gray-500 italic border-t border-gray-200">
            ✓ Auto-certificat cu hash SHA-256 + QR
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// CLONE INDUSTRY MENU — clonează proiect pe altă industrie
// ====================================================================
function CloneIndustryMenu({ pid, nav }) {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && targets.length === 0) {
      api.get(`/cross-industry/clone-targets/${pid}`)
        .then(({ data }) => setTargets(data.targets || []))
        .catch(() => {});
    }
  }, [open, targets.length, pid]);

  const clone = async (industry) => {
    setBusy(true);
    try {
      const { data } = await api.post('/cross-industry/clone-to-industry', {
        source_pid: pid,
        target_industry: industry,
      });
      if (data.warning) {
        toast.info(`Industrie schelet — prompt generat: ${data.warning.substring(0, 80)}...`);
      } else {
        toast.success(`Clonat: ${data.inherited_count} câmpuri moștenite în ${data.target_industry}`);
        if (data.new_pid && industry === 'gaze-naturale') {
          nav(`/gaze-naturale/${data.new_pid}`);
        }
      }
    } catch (e) {
      toast.error(`Eroare clonare: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" data-testid="clone-industry-menu">
      <button
        onClick={() => setOpen(!open)}
        disabled={busy}
        className="text-xs inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 hover:bg-purple-700 disabled:opacity-50"
        data-testid="clone-industry-btn"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitFork className="w-3 h-3" />}
        Clonează pe altă industrie
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 shadow-lg z-50 max-h-80 overflow-auto">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
            Selectează industria țintă
          </div>
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => clone(t.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 border-b border-gray-100 last:border-0"
              data-testid={`clone-target-${t.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t.label}</span>
                <span className={`text-[9px] uppercase tracking-wider px-1 ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t.status}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                {t.inheritable_fields} câmpuri se moștenesc · {t.norms?.substring(0, 30) || ''}...
              </div>
            </button>
          ))}
          <div className="px-3 py-1.5 text-[9px] text-gray-500 italic border-t border-gray-200">
            ✓ Beneficiar + Loc consum + CU se moștenesc automat
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// REAL UPLOAD BUTTON — upload fișier la /api/upload + persistă în DB
// ====================================================================
function RealUploadButton({ pid, category, bucketKey, label, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const onPick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('category', category);
      fd.append('pid', pid);
      if (bucketKey) fd.append('bucket_key', bucketKey);
      if (label) fd.append('label', label);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText.substring(0, 100)}`);
      }
      const data = await res.json();
      toast.success(`Încărcat: ${data.label}`);
      onUploaded?.(data);
    } catch (err) {
      toast.error(`Eroare upload: ${err.message}`);
    } finally {
      setBusy(false);
      e.target.value = '';  // allow re-upload same file
    }
  };
  return (
    <label className="inline-flex items-center gap-1 cursor-pointer bg-white border border-blue-300 px-2 py-1 text-[10px] hover:bg-blue-50" data-testid={`real-upload-${category}-${bucketKey || 'main'}`}>
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 text-blue-600" />}
      <span>Încarcă</span>
      <input type="file" className="hidden" onChange={onPick} accept=".pdf,.docx,.doc,.png,.jpg,.jpeg" />
    </label>
  );
}

// ====================================================================
// PRE-FLIGHT PANEL — verifică câmpurile required pentru template-uri specifice
// ====================================================================
function PreflightPanel({ pid }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const TEMPLATE_GROUPS = [
    'cerere_cu', 'cerere_atr', 'memoriu_tehnic', 'caiet_sarcini', 'borderou',
    'referat_verificator', 'anunt_incepere', 'predare_amplasament',
    'program_control_calitate', 'notificare_isc',
    'pv_lucrari_ascunse', 'pv_faza_determinanta', 'pv_receptie', 'as_built',
    'cerere_pif', 'carte_tehnica',
  ];

  const run = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.post('/document/preflight', { pid, template_ids: TEMPLATE_GROUPS });
      setData(res);
    } catch (e) {
      toast.error(`Pre-flight eșuat: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || data) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await api.post('/document/preflight', { pid, template_ids: TEMPLATE_GROUPS });
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) toast.error(`Pre-flight eșuat: ${e?.response?.data?.detail || e.message}`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="relative" data-testid="preflight-panel">
      <button
        onClick={() => setOpen(!open)}
        className={`text-xs inline-flex items-center gap-1 px-3 py-1.5 ${data?.overall_ready ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
        data-testid="preflight-toggle"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
        Pre-flight {data ? (data.overall_ready ? '✓' : '⚠') : ''}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-96 bg-white border-2 border-gray-300 shadow-xl z-50 max-h-[70vh] overflow-auto">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-xs font-bold">Verificare câmpuri per document</div>
            <button onClick={run} disabled={loading} className="text-[10px] text-blue-600 hover:underline">Refresh</button>
          </div>
          {!data && <div className="p-4 text-center text-xs text-gray-500">{loading ? 'Verifică...' : 'Apasă Refresh'}</div>}
          {data?.per_template && Object.entries(data.per_template).map(([tid, info]) => (
            <div key={tid} className="px-3 py-2 border-b border-gray-100 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{tid}</span>
                <span className={`px-1.5 py-0.5 text-[10px] ${info.ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {info.coverage_pct}% · {info.ready ? 'gata' : `${info.missing_required.length} req. lipsă`}
                </span>
              </div>
              {!info.ready && info.missing_required.length > 0 && (
                <div className="mt-1 text-[10px] text-gray-600">
                  Lipsă obligatorii: {info.missing_required.slice(0, 3).map((m) => m.label).join(', ')}
                  {info.missing_required.length > 3 && ` (+${info.missing_required.length - 3})`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================================================
// DOC PACKS MENU — generează un pachet predefinit de documente (ZIP)
// ====================================================================
function DocPacksMenu({ pid, backendUrl }) {
  const [open, setOpen] = useState(false);
  const [packs, setPacks] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && packs.length === 0) {
      api.get('/document/packs').then(({ data }) => setPacks(data.packs || [])).catch(() => {});
    }
  }, [open, packs.length]);

  const generate = async (packId) => {
    setBusy(true);
    try {
      const res = await fetch(`${backendUrl}/api/document/packs/${packId}/generate`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${packId}_${pid}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Pachet generat: ${packId}`);
    } catch (e) {
      toast.error(`Eroare pachet: ${e.message}`);
    } finally {
      setBusy(false); setOpen(false);
    }
  };

  return (
    <div className="relative" data-testid="doc-packs-menu">
      <button onClick={() => setOpen(!open)} disabled={busy}
        className="text-xs inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 hover:bg-indigo-700 disabled:opacity-50"
        data-testid="doc-packs-btn">
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
        Pachete documente
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-80 bg-white border-2 border-gray-300 shadow-xl z-50">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-100">
            6 pachete legale (one-click)
          </div>
          {packs.map((p) => (
            <button key={p.id} onClick={() => generate(p.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 border-b border-gray-100 last:border-0"
              data-testid={`pack-${p.id}`}>
              <div className="font-semibold">{p.label}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{p.description}</div>
              <div className="text-[10px] text-indigo-700 mt-0.5">{p.templates?.length || 0} docs · {p.norme?.[0]}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================================================
// OCR IMPORT BUTTON — upload PDF/DOCX → auto-extract câmpuri + apply
// ====================================================================
function OcrImportButton({ pid, onExtracted }) {
  const [busy, setBusy] = useState(false);
  const [tplBusy, setTplBusy] = useState(false);
  const [tplResult, setTplResult] = useState(null);

  const handle = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ocr/extract-fields`, {
        method: 'POST', credentials: 'include', body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.field_count === 0) {
        toast.info('Nu s-au detectat câmpuri în fișier');
      } else {
        // 1. Update local state
        onExtracted?.(data.detected_fields);
        // 2. Persist via apply-to-project (real write-once propagation)
        try {
          const { data: appliedRes } = await api.post('/ocr/apply-to-project', {
            pid, fields: data.detected_fields, overwrite: false,
          });
          toast.success(`OCR: ${appliedRes.applied_count} câmpuri salvate, ${appliedRes.skipped_count} păstrate (${data.confidence})`);
        } catch (perr) {
          toast.warning(`OCR detectat ${data.field_count} câmpuri local, persistare eșuată: ${perr?.response?.data?.detail || perr.message}`);
        }
      }
    } catch (err) {
      toast.error(`OCR eșuat: ${err.message}`);
    } finally {
      setBusy(false); e.target.value = '';
    }
  };

  // V9.3 — Template placeholder detector — cerință user (mesaj 26):
  // "platforma sa poata introduce automat in documente placeholdere necesare.
  //  Sa recunoasca campuri de introdus si sa afiseze casete text in platforma".
  const detectTemplate = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setTplBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ocr/template-placeholders`, {
        method: 'POST', credentials: 'include', body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTplResult(data);
      toast.success(`${data.placeholders?.length || 0} placeholdere detectate, ${data.structure?.sections_detected?.length || 0} secțiuni`);
    } catch (err) {
      toast.error(`Detectare eșuată: ${err.message}`);
    } finally {
      setTplBusy(false); e.target.value = '';
    }
  };

  return (
    <>
      <label className="text-xs inline-flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 hover:bg-teal-700 cursor-pointer rounded" data-testid="ocr-import-btn">
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        Import auto (OCR)
        <input type="file" className="hidden" onChange={handle} accept=".pdf,.docx,.doc" />
      </label>
      <label className="text-xs inline-flex items-center gap-1 bg-violet-600 text-white px-3 py-1.5 hover:bg-violet-700 cursor-pointer rounded" data-testid="tpl-detect-btn" title="Detectează placeholder-urile dintr-un template DOC/DOCX/PDF (de ex. MEMORIU AVIZARE)">
        {tplBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
        Detectează template
        <input type="file" className="hidden" onChange={detectTemplate} accept=".pdf,.docx,.doc" />
      </label>
      {tplResult && tplResult.placeholders?.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 lg:right-4 lg:left-auto lg:w-[480px] z-50 bg-white border border-violet-300 rounded-xl epd-shadow-lg max-h-[70vh] overflow-y-auto" data-testid="tpl-result-panel">
          <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">// Template Analizat</div>
              <div className="text-sm font-bold">{tplResult.placeholders.length} placeholdere detectate</div>
            </div>
            <button onClick={() => setTplResult(null)} className="text-white hover:bg-white/20 rounded p-1" data-testid="tpl-close">
              ✕
            </button>
          </div>
          <div className="p-3 space-y-2">
            {tplResult.placeholders.slice(0, 30).map((p, idx) => (
              <div key={idx} className="border border-slate-200 rounded p-2 text-xs hover:border-violet-300 hover:bg-violet-50 transition-colors" data-testid={`tpl-ph-${idx}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-mono text-violet-700 truncate">{p.inner || p.match}</div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 shrink-0">{p.type}</span>
                </div>
                <div className="text-[10px] text-slate-500 italic line-clamp-2">{p.context}</div>
                {p.suggested_field && (
                  <div className="mt-1 text-[10px] text-emerald-700">→ Sugerat câmp: <code className="font-mono">{p.suggested_field}</code></div>
                )}
              </div>
            ))}
            {tplResult.placeholders.length > 30 && (
              <div className="text-center text-xs text-slate-500 italic">+ {tplResult.placeholders.length - 30} placeholdere mai în template</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ConsumerList({ items, onChange, columnId, accent = 'violet' }) {
  const add = () => onChange([...items, { tip: CONSUMER_TYPES[0], nr_aparate: 1, debit_nmc_h: 0.5 }]);
  const upd = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const rm = (idx) => onChange(items.filter((_, i) => i !== idx));
  // Color palette: violet/indigo/blue only (no green)
  const palette = {
    violet: { ring: 'focus:ring-violet-200', border: 'border-violet-200', focus: 'focus:border-violet-500', btn: 'text-violet-700 hover:bg-violet-50' },
    indigo: { ring: 'focus:ring-indigo-200', border: 'border-indigo-200', focus: 'focus:border-indigo-500', btn: 'text-indigo-700 hover:bg-indigo-50' },
    blue:   { ring: 'focus:ring-blue-200',   border: 'border-blue-200',   focus: 'focus:border-blue-500',   btn: 'text-blue-700 hover:bg-blue-50' },
  }[accent] || { ring: 'focus:ring-violet-200', border: 'border-violet-200', focus: 'focus:border-violet-500', btn: 'text-violet-700 hover:bg-violet-50' };

  return (
    <div data-testid={`consumers-${columnId}`}>
      {items.length === 0 && (
        <div className="text-[11px] text-slate-400 italic mb-2 py-3 px-2 border border-dashed border-slate-200 rounded text-center">
          Niciun consumator încă
        </div>
      )}
      {items.map((c, i) => (
        <div key={i} className="grid grid-cols-12 gap-1.5 mb-1.5 items-center text-xs">
          <select value={c.tip} onChange={(e) => upd(i, 'tip', e.target.value)}
            className={`col-span-6 bg-white border ${palette.border} ${palette.focus} ${palette.ring} focus:ring-2 px-2 py-1.5 text-[11px] rounded outline-none transition-colors`}>
            {CONSUMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" value={c.nr_aparate} onChange={(e) => upd(i, 'nr_aparate', parseInt(e.target.value) || 0)}
            className={`col-span-2 bg-white border ${palette.border} ${palette.focus} ${palette.ring} focus:ring-2 px-2 py-1.5 text-[11px] rounded outline-none font-mono tabular-nums transition-colors`} />
          <input type="number" step="0.01" value={c.debit_nmc_h} onChange={(e) => upd(i, 'debit_nmc_h', parseFloat(e.target.value) || 0)}
            className={`col-span-3 bg-white border ${palette.border} ${palette.focus} ${palette.ring} focus:ring-2 px-2 py-1.5 text-[11px] rounded outline-none font-mono tabular-nums transition-colors`} />
          <button onClick={() => rm(i)} className="col-span-1 text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors" data-testid={`consumer-${columnId}-rm-${i}`}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={add} className={`text-[11px] inline-flex items-center gap-1 ${palette.btn} mt-2 px-2 py-1 rounded font-semibold transition-colors`} data-testid={`consumer-${columnId}-add`}>
        <Plus className="w-3 h-3" /> Adaugă consumator
      </button>
    </div>
  );
}

function AvizeList({ items, onChange, prefix = 'aviz' }) {
  const updItem = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const rm = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div className="space-y-1.5" data-testid="avize-obtinute-list">
      {items.map((a, i) => (
        <div key={a.id || i} className="grid grid-cols-12 gap-1.5 items-center text-xs bg-white border border-slate-200 hover:border-violet-300 transition-colors rounded-md p-1.5">
          <div className="col-span-3 text-[11px] font-semibold text-slate-800 pl-1">{a.label}</div>
          <input value={a.serie_nr_data} onChange={(e) => updItem(i, 'serie_nr_data', e.target.value)}
            placeholder="Serie / Nr / Data" data-testid={`${prefix}-${a.id || i}-serie`}
            className="col-span-5 bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 px-2 py-1.5 text-[11px] rounded outline-none font-mono tabular-nums transition-colors" />
          <button title="Încarcă aviz" className="col-span-1 text-violet-700 hover:bg-violet-50 p-1.5 border border-violet-200 bg-white rounded transition-colors flex items-center justify-center" data-testid={`${prefix}-${a.id || i}-upload-aviz`}>
            <Upload className="w-3 h-3" />
          </button>
          <button title="Dovadă plată" className="col-span-1 text-indigo-700 hover:bg-indigo-50 p-1.5 border border-indigo-200 bg-white rounded transition-colors flex items-center justify-center" data-testid={`${prefix}-${a.id || i}-upload-plata`}>
            <Upload className="w-3 h-3" />
          </button>
          <button title="Documentație aviz" className="col-span-1 text-blue-700 hover:bg-blue-50 p-1.5 border border-blue-200 bg-white rounded transition-colors flex items-center justify-center" data-testid={`${prefix}-${a.id || i}-upload-doc`}>
            <Upload className="w-3 h-3" />
          </button>
          {!a.id?.startsWith?.('default-') && a.id !== 'ac' && (
            <button onClick={() => rm(i)} className="col-span-1 text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors flex items-center justify-center">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// V9.3 — Project picker pentru /gaze-naturale fără PID
function GasProjectPicker({ nav }) {
  const [projects, setProjects] = useState(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('Branșament nou — locuință');

  useEffect(() => {
    api.get('/gas-project').then(({ data }) => {
      setProjects(Array.isArray(data) ? data : (data?.items || []));
    }).catch(() => setProjects([]));
  }, []);

  const createNew = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/gas-project', { title, country: 'RO', subdomain: 'bransament-casnic' });
      if (data?.pid) {
        toast.success('Proiect creat. Începe să introduci datele!');
        nav(`/gaze-naturale/${data.pid}`);
      }
    } catch (e) {
      toast.error(`Eroare la creare: ${e?.response?.data?.detail || e.message}`);
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      {/* Hero create */}
      <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-200 rounded-xl p-6 epd-shadow" data-testid="gas-picker-create">
        <div className="text-[10px] uppercase tracking-[0.25em] text-violet-600 font-semibold mb-2">// Studio Gaze Naturale · Creează proiect nou</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">Începe un proiect real de gaze naturale</h2>
        <p className="text-sm text-slate-600 mb-5 max-w-2xl">
          Introdu un titlu și apasă „Creează proiect&rdquo;. Vei accesa apoi cele 221 câmpuri tehnice,
          calculatoarele Renouard, Anexa 13 materiale, ștampile A4, generare DOCX legale.
        </p>
        <div className="flex gap-3 flex-wrap items-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Branșament Str. Aurel Vlaicu 15"
            className="border border-slate-300 px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 min-w-[300px]"
            data-testid="gas-picker-title-input"
          />
          <button onClick={createNew} disabled={creating || !title.trim()} className="epd-btn text-sm" data-testid="gas-picker-create-btn">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Creează proiect
          </button>
        </div>
      </div>

      {/* Existing projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">Proiectele tale</h3>
          <div className="text-xs text-slate-500" data-testid="gas-picker-count">
            {projects ? `${projects.length} proiect${projects.length === 1 ? '' : 'e'}` : 'Se încarcă...'}
          </div>
        </div>
        {projects === null ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-500" /></div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center" data-testid="gas-picker-empty">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="text-sm text-slate-600">Niciun proiect creat încă. Folosește butonul de mai sus.</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" data-testid="gas-picker-list">
            {projects.map((p) => (
              <button
                key={p.pid}
                onClick={() => nav(`/gaze-naturale/${p.pid}`)}
                className="text-left bg-white border border-slate-200 hover:border-violet-400 hover:shadow-md rounded-lg p-4 transition-all group"
                data-testid={`gas-picker-item-${p.pid}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs font-mono text-violet-600">{p.pid}</div>
                  <div className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider font-semibold">{p.status || 'draft'}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900 leading-tight mb-1 group-hover:text-violet-700 transition-colors">{p.title || 'Proiect fără titlu'}</div>
                <div className="text-xs text-slate-500">{Object.keys(p.data || {}).length} câmpuri completate</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ====================================================================
// UPLOAD AVIZAT BUTTON — încarcă proiectul avizat (PDF) și marchează ca primit
// ====================================================================
function UploadAvizatButton({ pid, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const onPick = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      fd.append('category', 'proiect_avizat');
      fd.append('pid', pid);
      fd.append('label', 'Proiect avizat OSD');
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, {
        method: 'POST', credentials: 'include', body: fd,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Update project status to "avizat"
      try {
        await api.patch(`/gas-project/${pid}`, { status: 'avizat' });
      } catch { /* status update best-effort */ }
      toast.success('Proiect avizat încărcat cu succes');
      onUploaded?.();
    } catch (err) {
      toast.error(`Eroare upload: ${err.message}`);
    } finally {
      setBusy(false); e.target.value = '';
    }
  };
  return (
    <label className="w-full text-xs inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-300 hover:border-violet-400 hover:bg-violet-50 px-3 py-2.5 cursor-pointer rounded-md font-semibold transition-colors" data-testid="upload-avizat">
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
      <span>Încarcă proiect avizat</span>
      <input type="file" className="hidden" onChange={onPick} accept=".pdf,.docx,.doc,.zip" />
    </label>
  );
}

// ====================================================================
// TRANSFER PROJECT DIALOG — transferă proiectul către alt utilizator (email)
// ====================================================================
function TransferProjectDialog({ pid, onClose, onTransferred }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('proiectant');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim()) return toast.error('Introduce email-ul destinatarului');
    setBusy(true);
    try {
      const { data: res } = await api.post(`/gas-project/${pid}/transfer`, {
        target_email: email.trim(),
        target_role: role,
        note: note.trim() || null,
      });
      toast.success(res.message || `Transfer inițiat către ${email}`);
      onTransferred?.();
    } catch (e) {
      toast.error(`Eroare transfer: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="transfer-dialog">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/80 font-bold">// Transfer proiect</div>
            <div className="text-lg font-bold text-white">Trimite proiectul către alt utilizator</div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded transition-colors" data-testid="transfer-close">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold block mb-1.5">Email destinatar</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="proiectant@example.ro"
              type="email"
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 px-3 py-2 text-sm rounded-md outline-none transition-colors"
              data-testid="transfer-email"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold block mb-1.5">Rol asignat</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 px-3 py-2 text-sm rounded-md outline-none transition-colors"
              data-testid="transfer-role"
            >
              <option value="proiectant">Proiectant (preia DTAC)</option>
              <option value="executant">Executant (preia PTH + carte tehnică)</option>
              <option value="vgd">VGD — verificator (validează DTAC/PTH)</option>
              <option value="rte">RTE — responsabil execuție (validează cartea)</option>
              <option value="operator">Operator (introduce date)</option>
              <option value="contabilitate">Contabilitate (facturare)</option>
              <option value="ofertare">Ofertare</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold block mb-1.5">Notă (opțional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ex: Te rog să finalizezi memoriul tehnic până vineri."
              rows={3}
              className="w-full bg-white border border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 px-3 py-2 text-sm rounded-md outline-none transition-colors resize-none"
              data-testid="transfer-note"
            />
          </div>
          <div className="text-[11px] text-slate-600 bg-violet-50 border border-violet-200 rounded-lg p-3 leading-relaxed">
            <strong className="text-violet-900">Cum funcționează:</strong> Beneficiarul, numărul cadastral, tipul lucrării, adresa și societatea se moștenesc automat. Destinatarul primește notificare prin email + acces la proiect cu rolul ales. Audit-log persistent.
          </div>
        </div>
        <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2 bg-slate-50">
          <button onClick={onClose} className="text-xs px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold transition-colors" data-testid="transfer-cancel">
            Anulează
          </button>
          <button
            onClick={submit}
            disabled={busy || !email.trim()}
            className="text-xs inline-flex items-center gap-1.5 epd-gradient text-white px-4 py-2 hover:opacity-90 disabled:opacity-50 rounded-md font-semibold transition-all"
            data-testid="transfer-submit"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Transferă proiect
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GasNaturalProjectV2() {
  const { pid } = useParams();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState('date');
  const [proj, setProj] = useState(null);
  const [data, setData] = useState(DEFAULT_DATA);
  const [collapsed, setCollapsed] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  // Dynamic registry field count (V8.5+ avoids hardcoded label)
  const [regFieldsCount, setRegFieldsCount] = useState(null);
  // V10.3 — End-to-end functional state
  const [sendingAvizare, setSendingAvizare] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [dispatchingRoute, setDispatchingRoute] = useState(null);

  useEffect(() => {
    api.get('/placeholders/registry')
      .then(({ data }) => setRegFieldsCount(data?.fields?.length || null))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!pid) return;
    try {
      const { data: p } = await api.get(`/gas-project/${pid}`);
      setProj(p);
      // Merge stored data with defaults (preserve V1 fields)
      setData({ ...DEFAULT_DATA, ...(p.data || {}) });
      setDirty(false);
    } catch (e) {
      toast.error('Eroare la încărcare proiect');
    }
  }, [pid]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!pid) return;
      try {
        const { data: p } = await api.get(`/gas-project/${pid}`);
        if (!cancelled) {
          setProj(p);
          setData({ ...DEFAULT_DATA, ...(p.data || {}) });
          setDirty(false);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [pid]);

  const upd = (key) => (val) => {
    setData((d) => ({ ...d, [key]: val }));
    setDirty(true);
  };

  // Auto-calc total Qmin from consumer lists (derived value via useMemo, no setState in effect)
  const qmin_calc = useMemo(() => {
    const sumDebit = (list) => (list || []).reduce((s, c) => s + (Number(c.nr_aparate) || 0) * (Number(c.debit_nmc_h) || 0), 0);
    const v = sumDebit(data.consumatori_mentinuti) + sumDebit(data.consumatori_noi) - sumDebit(data.consumatori_dezafectati);
    return Math.round(v * 100) / 100;
  }, [data.consumatori_mentinuti, data.consumatori_noi, data.consumatori_dezafectati]);

  // Auto-derive km from m via useMemo
  const br_lungime_km_calc = useMemo(() => Math.round(((Number(data.br_lungime_m) || 0) / 1000) * 1000) / 1000, [data.br_lungime_m]);
  const cnd_n_lungime_km_calc = useMemo(() => Math.round(((Number(data.cnd_n_lungime_m) || 0) / 1000) * 1000) / 1000, [data.cnd_n_lungime_m]);

  // Auto-map V2 form fields → FIELDS_REGISTRY canonical keys (used by DOCX templates).
  // Aplică doar dacă cheia registry e GOALĂ (nu suprascrie ce a editat userul în tab Registru).
  const applyAutoMap = (src) => {
    const mapping = {
      // Beneficiar
      beneficiar_nume: src.nume_client,
      // Loc consum
      loc_consum_adresa: src.adresa_imobil,
      loc_consum_strada: src.amplasament_strada,
      loc_consum_localitate: src.amplasament_localitate,
      loc_consum_judet: src.amplasament_judet,
      loc_consum_cadastru: src.cadastral_imobil || src.cadastrale_traseu,
      amplasament_lucrare: src.amplasament_strada,
      amplasament_imobil_consum: src.adresa_imobil,
      // Proiect
      tipul_lucrarii: src.tipul_lucrarii,
      denumire_lucrare_extinsa: src.tipul_lucrarii,
      // ATR / OSD
      atr_osd: src.osd_operator,
      atr_numar: src.osd_atr_nr,
      ordin_lucru_nr_data: src.osd_ordin_nr,
      // DTAC / Proiectant
      proiectant_general_firma: src.fact_proiectanta_societate,
      dtac_proiectant_specialitate: src.fact_proiectanta_nume,
      proiectant_aut_nr: src.fact_proiectanta_legitimatie,
      proiectant_aut_grad: src.fact_proiectanta_autorizatie,
      // Executant
      exec_firma: src.fact_executanta_societate,
      executant_aut_nr: src.fact_executanta_legitimatie,
      executant_aut_grad: src.fact_executanta_autorizatie,
      // VGD / RTE
      dtac_verificator_vgd: src.fact_vgd_nume,
      exec_responsabil_tehnic: src.fact_rte_nume,
      verificator_legitimatie_nr: src.fact_vgd_legitimatie,
      // Tehnic
      sf_material_conducta: src.br_material === 'Polietilenă' ? 'PE 100 SDR 11' : (src.br_material === 'Oțel' ? 'OL conform STAS 7656' : ''),
      sf_diametru_nominal_DN: src.br_diametru_dn,
      sf_lungime_conducta_m: src.br_lungime_m,
      pt_lungime_m: src.br_lungime_m,
      presiune_categorie: src.br_presiune === 'Joasă' ? 'JOASA PRESIUNE (<0.05 bar)'
        : src.br_presiune === 'Redusă' ? 'REDUSA PRESIUNE (0.05-2 bar)'
        : src.br_presiune === 'Medie' ? 'MEDIE PRESIUNE (2-6 bar)' : '',
      debit_instalat_mc_h: src.qmin_total,
    };
    const out = { ...src };
    for (const [k, v] of Object.entries(mapping)) {
      if (v !== undefined && v !== null && v !== '' && (out[k] === undefined || out[k] === null || out[k] === '')) {
        out[k] = v;
      }
    }
    return out;
  };

  const save = async () => {
    setSaving(true);
    try {
      // Persist derived + auto-mapped fields
      const baseData = { ...data, qmin_total: qmin_calc, br_lungime_km: br_lungime_km_calc, cnd_n_lungime_km: cnd_n_lungime_km_calc };
      const payload = { data: applyAutoMap(baseData) };
      await api.patch(`/gas-project/${pid}`, payload);
      setData(payload.data);
      setDirty(false);
      toast.success('Salvat (auto-map registry aplicat)');
    } catch (e) {
      toast.error('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const downloadDoc = async (templateId, filename) => {
    if (!pid) return;
    try {
      const res = await fetch(`${backendUrl}/api/gas-project/${pid}/doc/${templateId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`Descărcat: ${filename}`);
    } catch (e) {
      toast.error(`Eroare: ${e.message}`);
    }
  };

  const downloadDossier = async () => {
    if (!pid) return;
    try {
      const res = await fetch(`${backendUrl}/api/gas-project/${pid}/dossier.zip`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `DOSAR_${pid}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Dosar complet descărcat');
    } catch (e) {
      toast.error(`Eroare: ${e.message}`);
    }
  };

  // V10.3 — Send email dispatch with REAL backend call (per route id)
  // Route id maps to backend phase id semantically. We persist email in proj.data.emails
  // and trigger a save-and-dispatch combined action.
  const sendEmailRoute = async (routeId, label) => {
    const recipient = data.emails?.[routeId];
    if (!recipient || !recipient.includes('@')) {
      toast.error(`Setează un email valid pentru: ${label}`);
      return;
    }
    setDispatchingRoute(routeId);
    try {
      // Save first so backend has latest data
      if (dirty) await save();
      // Map route id → backend phase id (using same id where possible)
      const phaseMap = {
        primarie: 'dtac',
        diriginte_carte: 'carte-tehnica',
        contabilitate: 'facturare',
        osd: 'avize',
        isc: 'execucucie',
        diriginte_disp: 'pth',
        politie: 'avize',
        proiectant_dtac: 'dtac',
        proiectant_pth: 'pth',
        utilitati_cereri: 'avize',
      };
      const phaseId = phaseMap[routeId] || 'tema';
      const { data: res } = await api.post(`/gas-project/${pid}/phase/${phaseId}/dispatch`, {
        recipients: [recipient],
        message: `Documentație ${label} — proiect ${proj?.title || pid}. Trimis automat din platforma Energy Project Design.`,
        include_pdf: true,
      });
      if (res?.ok) {
        toast.success(`Email trimis: ${label} → ${recipient}`);
      } else {
        toast.warning(`Email salvat în coadă: ${res?.error || 'configurare SMTP necesară'}`);
      }
    } catch (e) {
      toast.error(`Eroare trimitere: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setDispatchingRoute(null);
    }
  };

  // V10.3 — Send project to VGD/OSD verification (changes status)
  const sendToAvizare = async () => {
    setSendingAvizare(true);
    try {
      if (dirty) await save();
      await api.patch(`/gas-project/${pid}`, { status: 'awaiting_avizare' });
      toast.success('Proiect trimis spre avizare · status: awaiting_avizare');
      await load();
    } catch (e) {
      toast.error(`Eroare: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setSendingAvizare(false);
    }
  };

  // V9.3 FIX — Disfuncționalitate raportată user (mesaj 26):
  // "Sectiunea gaze naturale este complet disfunctionala. Nu se incarca si nu se poate completa in ea."
  // Root cause: când /gaze-naturale e accesat fără PID, !proj rămâne true și se afișează
  // spinner infinit. Soluție: redirect către listing/create dacă nu există PID.
  if (!pid) {
    return (
      <AppShell title="Gaze Naturale" subtitle="Selectează un proiect sau creează unul nou">
        <GasProjectPicker nav={nav} />
      </AppShell>
    );
  }

  if (!proj) {
    return (
      <AppShell title="Gaze Naturale · Operare proiect" subtitle="Se încarcă proiectul...">
        <div className="text-center py-12 text-slate-400" data-testid="gas-loading">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <div className="text-sm">Se încarcă datele proiectului <span className="font-mono text-xs text-slate-500">{pid}</span>...</div>
          <button
            onClick={() => nav('/gaze-naturale')}
            className="mt-4 text-xs text-violet-600 hover:text-violet-800 underline"
            data-testid="gas-back-to-list"
          >
            ← Înapoi la lista de proiecte
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Gaze Naturale · ${proj.title || 'Proiect'}`} subtitle={`PID: ${pid} · Status: ${proj.status || '—'}${dirty ? ' · ⚠️ modificări nesalvate' : ''}`}>
      {/* Header — actions bar professional */}
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap bg-white rounded-xl border border-slate-200 p-3 epd-shadow">
        <button onClick={() => nav('/gaze-naturale')} className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-violet-700 transition-colors font-semibold" data-testid="back-to-projects">
          <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la registru
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <PreflightPanel pid={pid} />
          <DocPacksMenu pid={pid} backendUrl={backendUrl} />
          <OcrImportButton pid={pid} onExtracted={(fields) => {
            // Merge extracted fields into proj.data (write-once propagation)
            setData((d) => ({ ...d, ...fields }));
            setDirty(true);
          }} />
          <PreviewSectionMenu pid={pid} backendUrl={backendUrl} />
          <CloneIndustryMenu pid={pid} nav={nav} />
          <button onClick={downloadDossier} className="text-xs inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-2 hover:bg-violet-700 rounded-md font-semibold transition-colors" data-testid="gas-dossier-download" title="Descarcă dosar complet ZIP cu toate documentele DOCX generate">
            <Package className="w-3.5 h-3.5" /> Descarcă dosar ZIP
          </button>
          <button onClick={save} disabled={saving || !dirty} className="text-xs inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-3 py-2 hover:bg-slate-200 disabled:opacity-50 rounded-md font-semibold transition-colors" data-testid="gas-v2-save">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Salvează
          </button>
          <button onClick={async () => { await save(); toast.success('Proiect finalizat'); }} disabled={saving} className="text-xs inline-flex items-center gap-1.5 epd-gradient text-white px-3 py-2 hover:opacity-90 disabled:opacity-50 rounded-md font-semibold transition-all" data-testid="gas-v2-finalize">
            <CheckCircle2 className="w-3.5 h-3.5" /> Finalizează
          </button>
        </div>
      </div>

      {/* V9.1 — STEPPER CRONOLOGIC (înlocuiește pipeline-ul de pachete ad-hoc) */}
      <GasChronologicalStepper data={data} />

      {/* Tabs — EPD professional styling */}
      <div className="flex gap-1 mb-5 border-b border-slate-200" data-testid="gas-v2-tabs">
        <button onClick={() => setActiveTab('date')} className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === 'date' ? 'border-violet-600 text-violet-700 bg-violet-50/50' : 'border-transparent text-slate-600 hover:text-violet-700 hover:bg-slate-50'}`} data-testid="tab-date">
          Date operaționale
        </button>
        <button onClick={() => setActiveTab('avize')} className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === 'avize' ? 'border-violet-600 text-violet-700 bg-violet-50/50' : 'border-transparent text-slate-600 hover:text-violet-700 hover:bg-slate-50'}`} data-testid="tab-avize">
          Avize Hub
        </button>
        <button onClick={() => setActiveTab('registru')} className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === 'registru' ? 'border-violet-600 text-violet-700 bg-violet-50/50' : 'border-transparent text-slate-600 hover:text-violet-700 hover:bg-slate-50'}`} data-testid="tab-registru">
          Registru câmpuri {regFieldsCount ? <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-violet-100 text-violet-700 rounded font-bold">{regFieldsCount}</span> : null}
        </button>
        <button onClick={() => setActiveTab('engineering')} className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab === 'engineering' ? 'border-violet-600 text-violet-700 bg-violet-50/50' : 'border-transparent text-slate-600 hover:text-violet-700 hover:bg-slate-50'}`} data-testid="tab-engineering">
          Inginerie · Renouard + Sizing
        </button>
      </div>

      {activeTab === 'engineering' && (
        <GasEngineeringPanel data={data} pid={pid} />
      )}

      {activeTab === 'registru' && (
        <RegistryFieldsTab
          data={data}
          pid={pid}
          onUpdateField={(key, val) => {
            setData((d) => ({ ...d, [key]: val }));
            setDirty(true);
          }}
        />
      )}

      {activeTab === 'avize' && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 epd-shadow">
          <div className="text-xs uppercase tracking-[0.25em] text-violet-600 font-semibold mb-3">// Avize Hub · 13 instituții</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">Status avize + dispatch automat</h2>
          <p className="text-slate-600 mb-6 max-w-2xl">
            Vizualizează statusul fiecărui aviz, generează ZIP cu cerere + manifest anexe per instituție,
            trimite automat prin email și marchează ca primit / respins / expirat.
          </p>
          <button onClick={() => nav(`/gaze-naturale-v1/${pid}`)} className="epd-btn text-sm" data-testid="open-avize-hub-v1">
            <ExternalLink className="w-4 h-4" /> Deschide Avize Hub complet
          </button>
        </div>
      )}

      {activeTab === 'date' && (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* MAIN — sections */}
        <div className="xl:col-span-9 space-y-4">

          {/* SECTION 1 — Date tehnice */}
          <SectionCard id="date-tehnice" title="Date tehnice" collapsed={collapsed['date-tehnice']} onToggle={() => toggleSection('date-tehnice')}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7"><Field label="Adresa imobil" testid="f-adresa-imobil">
                <Input value={data.adresa_imobil} onChange={upd('adresa_imobil')} placeholder="Str. Bibanului, Nr. 40, Sector 2, București" testid="i-adresa-imobil" />
              </Field></div>
              <div className="md:col-span-5"><Field label="Este aceeași cu amplasament lucrări?">
                <Toggle value={data.adresa_imobil_egala_amplasament} onChange={upd('adresa_imobil_egala_amplasament')} testid="t-adresa-egala" />
              </Field></div>
              <div className="md:col-span-6"><Field label="Nume client"><Input value={data.nume_client} onChange={upd('nume_client')} placeholder="Popescu Ion" testid="i-nume-client" /></Field></div>
              <div className="md:col-span-6"><Field label="Tipul lucrării">
                <Select value={data.tipul_lucrarii} onChange={upd('tipul_lucrarii')}
                  options={['Branșament gaze naturale', 'Extindere conductă', 'Instalație de utilizare (IUGN)', 'Studiu de fezabilitate (SF)', 'Reabilitare', 'Mărire debit']}
                  testid="s-tipul-lucrarii" />
              </Field></div>
              <div className="md:col-span-4"><Field label="Amplasament — Stradă"><Input value={data.amplasament_strada} onChange={upd('amplasament_strada')} /></Field></div>
              <div className="md:col-span-4"><Field label="Localitate"><Input value={data.amplasament_localitate} onChange={upd('amplasament_localitate')} /></Field></div>
              <div className="md:col-span-4"><Field label="Județ"><Input value={data.amplasament_judet} onChange={upd('amplasament_judet')} /></Field></div>
              <div className="md:col-span-12"><Field label="Alte detalii amplasament">
                <Input value={data.amplasament_alte_detalii} onChange={upd('amplasament_alte_detalii')} placeholder="ex: Fosta Str. Bibanului, cu alimentare din Str. Berzei" />
              </Field></div>
              <div className="md:col-span-3"><Field label="Instalație de utilizare"><Toggle value={data.instalatie_utilizare} onChange={upd('instalatie_utilizare')} /></Field></div>
              <div className="md:col-span-3"><Field label="Tip"><Select value={data.iu_tip} onChange={upd('iu_tip')} options={['IUGN', 'Tehnologică']} /></Field></div>
              <div className="md:col-span-3"><Field label="Suplimentare debit"><Toggle value={data.iu_suplimentare_debit} onChange={upd('iu_suplimentare_debit')} /></Field></div>
              <div className="md:col-span-3"><Field label="Presiune (IUGN)"><Select value={data.iu_presiune} onChange={upd('iu_presiune')} options={['Joasă', 'Redusă', 'Medie']} /></Field></div>
              <div className="md:col-span-3"><Field label="Conductă nouă"><Toggle value={data.conducta_noua} onChange={upd('conducta_noua')} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 2 — Materiale */}
          <SectionCard id="materiale" title="Materiale & dimensionare (BR + CND)" collapsed={collapsed['materiale']} onToggle={() => toggleSection('materiale')}>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Material BR — Branșament Nou</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-2"><Field label="Material"><Select value={data.br_material} onChange={upd('br_material')} options={['Polietilenă', 'Oțel']} /></Field></div>
              <div className="md:col-span-2"><Field label="Diametru (Dn)"><Input value={data.br_diametru_dn} onChange={upd('br_diametru_dn')} placeholder="32 mm" /></Field></div>
              <div className="md:col-span-2"><Field label="Presiune"><Select value={data.br_presiune} onChange={upd('br_presiune')} options={['Redusă', 'Joasă', 'Medie']} /></Field></div>
              <div className="md:col-span-2"><Field label="Lungime (m)"><Input type="number" value={data.br_lungime_m} onChange={upd('br_lungime_m')} /></Field></div>
              <div className="md:col-span-2"><Field label="Lungime (km auto)"><Input value={br_lungime_km_calc} onChange={() => {}} /></Field></div>
              <div className="md:col-span-2"><Field label="Subteran / Suprateran"><Select value={data.br_subteran} onChange={upd('br_subteran')} options={['Subteran', 'Suprateran']} /></Field></div>
              <div className="md:col-span-8"><Field label="Teu de branșament (auto în funcție de selecții)">
                <Input value={data.br_teu_bransament} onChange={upd('br_teu_bransament')} />
              </Field></div>
              <div className="md:col-span-4"><Field label="Lățime șanț BR (m)"><Input type="number" value={data.br_latime_sant} onChange={upd('br_latime_sant')} /></Field></div>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 mt-4">Material CND existent — Conducta Distribuție</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-2"><Field label="Material"><Select value={data.cnd_ex_material} onChange={upd('cnd_ex_material')} options={['Polietilenă', 'Oțel']} /></Field></div>
              <div className="md:col-span-2"><Field label="Diametru (Dn)"><Input value={data.cnd_ex_diametru_dn} onChange={upd('cnd_ex_diametru_dn')} /></Field></div>
              <div className="md:col-span-2"><Field label="Presiune"><Select value={data.cnd_ex_presiune} onChange={upd('cnd_ex_presiune')} options={['Redusă', 'Joasă', 'Medie']} /></Field></div>
              <div className="md:col-span-2"><Field label="Lungime (m)"><Input type="number" value={data.cnd_ex_lungime_m} onChange={upd('cnd_ex_lungime_m')} /></Field></div>
              <div className="md:col-span-2"><Field label="Lungime (km)"><Input value={data.cnd_ex_lungime_km} onChange={upd('cnd_ex_lungime_km')} /></Field></div>
              <div className="md:col-span-2"><Field label="Subteran"><Select value={data.cnd_ex_subteran} onChange={upd('cnd_ex_subteran')} options={['Subteran', 'Suprateran']} /></Field></div>
              <div className="md:col-span-12"><Field label="Tip vană (în funcție de presiune)"><Input value={data.cnd_ex_tip_vana} onChange={upd('cnd_ex_tip_vana')} /></Field></div>
            </div>

            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 mt-4 flex items-center gap-3">
              CND Nouă?
              <Toggle value={data.cnd_noua} onChange={upd('cnd_noua')} />
            </div>
            {data.cnd_noua === 'Da' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-2"><Field label="Material"><Select value={data.cnd_n_material} onChange={upd('cnd_n_material')} options={['Polietilenă', 'Oțel']} /></Field></div>
                <div className="md:col-span-2"><Field label="Diametru"><Input value={data.cnd_n_diametru_dn} onChange={upd('cnd_n_diametru_dn')} /></Field></div>
                <div className="md:col-span-2"><Field label="Presiune"><Select value={data.cnd_n_presiune} onChange={upd('cnd_n_presiune')} options={['Redusă', 'Joasă', 'Medie']} /></Field></div>
                <div className="md:col-span-2"><Field label="Lungime (m)"><Input type="number" value={data.cnd_n_lungime_m} onChange={upd('cnd_n_lungime_m')} /></Field></div>
                <div className="md:col-span-2"><Field label="Lungime (km)"><Input value={cnd_n_lungime_km_calc} onChange={() => {}} /></Field></div>
                <div className="md:col-span-2"><Field label="Subteran"><Select value={data.cnd_n_subteran} onChange={upd('cnd_n_subteran')} options={['Subteran', 'Suprateran']} /></Field></div>
                <div className="md:col-span-3"><Field label="Vană"><Toggle value={data.cnd_n_vana} onChange={upd('cnd_n_vana')} /></Field></div>
                <div className="md:col-span-3"><Field label="Teu"><Toggle value={data.cnd_n_teu} onChange={upd('cnd_n_teu')} /></Field></div>
                <div className="md:col-span-3"><Field label="Reducție"><Toggle value={data.cnd_n_reductie} onChange={upd('cnd_n_reductie')} /></Field></div>
                <div className="md:col-span-3"><Field label="Lățime șanț CND (m)"><Input type="number" value={data.cnd_n_latime_sant} onChange={upd('cnd_n_latime_sant')} /></Field></div>
              </div>
            )}
          </SectionCard>

          {/* SECTION 3 — Documente OSD */}
          <SectionCard id="docs-osd" title="Documente Operator Sistem Distribuție" collapsed={collapsed['docs-osd']} onToggle={() => toggleSection('docs-osd')}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6"><Field label="Operator Sistem Distribuție (OSD)">
                <Select value={data.osd_operator} onChange={upd('osd_operator')}
                  options={['Distrigaz Sud - Rețele', 'Delgaz Grid', 'Premier Energy', 'OSD Gaz Nord-Est', 'Altul']} />
              </Field></div>
              <div className="md:col-span-6"></div>
              <div className="md:col-span-4"><Field label="Ordin de lucru Nr. + Data"><Input value={data.osd_ordin_nr} onChange={upd('osd_ordin_nr')} placeholder="50041207/09.02.2018" /></Field></div>
              <div className="md:col-span-4"><Field label="Status"><Toggle value={data.osd_ordin_status} onChange={upd('osd_ordin_status')} options={['In termen', 'Prelungit']} /></Field></div>
              <div className="md:col-span-4"></div>
              <div className="md:col-span-4"><Field label="ATR / Acord acces / Notificare"><Input value={data.osd_atr_nr} onChange={upd('osd_atr_nr')} placeholder="12330137/19.01.2018" /></Field></div>
              <div className="md:col-span-4"><Field label="Status"><Toggle value={data.osd_atr_status} onChange={upd('osd_atr_status')} options={['In termen', 'Prelungit']} /></Field></div>
              <div className="md:col-span-4"></div>
              <div className="md:col-span-4"><Field label="Alt document (opțional)"><Input value={data.osd_alt_doc_nr} onChange={upd('osd_alt_doc_nr')} /></Field></div>
              <div className="md:col-span-4"><Field label="Status"><Toggle value={data.osd_alt_doc_status} onChange={upd('osd_alt_doc_status')} options={['In termen', 'Prelungit']} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 4 — Facturare */}
          <SectionCard id="facturare" title="Facturare & reprezentanți tehnici" collapsed={collapsed['facturare']} onToggle={() => toggleSection('facturare')}>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Societate proiectantă</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
              <div className="md:col-span-4"><Field label="Societate"><Input value={data.fact_proiectanta_societate} onChange={upd('fact_proiectanta_societate')} placeholder="S.C. Vital Gaz S.R.L." /></Field></div>
              <div className="md:col-span-3"><Field label="Nume proiectant"><Input value={data.fact_proiectanta_nume} onChange={upd('fact_proiectanta_nume')} placeholder="GABRIEL TUDORASCU" /></Field></div>
              <div className="md:col-span-2"><Field label="Tip autorizație"><Select value={data.fact_proiectanta_autorizatie} onChange={upd('fact_proiectanta_autorizatie')} options={['PGD', 'PGIU', 'PGM']} /></Field></div>
              <div className="md:col-span-3"><Field label="Nr. legitimație"><Input value={data.fact_proiectanta_legitimatie} onChange={upd('fact_proiectanta_legitimatie')} placeholder="212150178/15.05.2025" /></Field></div>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Societate executantă</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
              <div className="md:col-span-4"><Field label="Societate"><Input value={data.fact_executanta_societate} onChange={upd('fact_executanta_societate')} placeholder="S.C. Gas Partener S.R.L." /></Field></div>
              <div className="md:col-span-3"><Field label="Nume executant"><Input value={data.fact_executanta_nume} onChange={upd('fact_executanta_nume')} /></Field></div>
              <div className="md:col-span-2"><Field label="Tip autorizație"><Select value={data.fact_executanta_autorizatie} onChange={upd('fact_executanta_autorizatie')} options={['EGD', 'EGIU', 'EGM']} /></Field></div>
              <div className="md:col-span-3"><Field label="Nr. legitimație"><Input value={data.fact_executanta_legitimatie} onChange={upd('fact_executanta_legitimatie')} /></Field></div>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">VGD & RTE</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-4"><Field label="Verificator tehnic (VGD)"><Input value={data.fact_vgd_nume} onChange={upd('fact_vgd_nume')} placeholder="PATRASCU ANDREI" /></Field></div>
              <div className="md:col-span-2"><Field label="Tip autorizație"><Input value={data.fact_vgd_autorizatie} onChange={upd('fact_vgd_autorizatie')} /></Field></div>
              <div className="md:col-span-6"><Field label="Nr. legitimație VGD"><Input value={data.fact_vgd_legitimatie} onChange={upd('fact_vgd_legitimatie')} /></Field></div>
              <div className="md:col-span-4"><Field label="RTE"><Input value={data.fact_rte_nume} onChange={upd('fact_rte_nume')} placeholder="PATRASCU ANDREI" /></Field></div>
              <div className="md:col-span-2"><Field label="Tip autorizație"><Input value={data.fact_rte_autorizatie} onChange={upd('fact_rte_autorizatie')} /></Field></div>
              <div className="md:col-span-6"><Field label="Nr. legitimație RTE"><Input value={data.fact_rte_legitimatie} onChange={upd('fact_rte_legitimatie')} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 5 — Consumatori (3 columns) — premium violet/indigo/blue */}
          <SectionCard id="consumatori" title="Consumatori — bilanț debit (Nmc/h)" collapsed={collapsed['consumatori']} onToggle={() => toggleSection('consumatori')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* MENTINUTI — violet (existenți păstrați) */}
              <div className="bg-gradient-to-br from-violet-50/60 to-white border border-violet-200 rounded-lg p-3" data-testid="consumer-col-mentinuti">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Mențin (existenți)</div>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase tracking-wider text-slate-500 font-semibold px-1">
                  <div className="col-span-6">Tip aparat</div><div className="col-span-2 text-center">Nr.</div><div className="col-span-3 text-center">Debit</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_mentinuti} onChange={upd('consumatori_mentinuti')} columnId="mentinuti" accent="violet" />
              </div>

              {/* DEZAFECTATI — indigo (existenți care se elimină) */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200 rounded-lg p-3" data-testid="consumer-col-dezafectati">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Se dezafectează</div>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase tracking-wider text-slate-500 font-semibold px-1">
                  <div className="col-span-6">Tip aparat</div><div className="col-span-2 text-center">Nr.</div><div className="col-span-3 text-center">Debit</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_dezafectati} onChange={upd('consumatori_dezafectati')} columnId="dezafectati" accent="indigo" />
              </div>

              {/* NOI — blue (consumatori noi adăugați) */}
              <div className="bg-gradient-to-br from-blue-50/60 to-white border border-blue-200 rounded-lg p-3" data-testid="consumer-col-noi">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Noi (adăugați)</div>
                </div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase tracking-wider text-slate-500 font-semibold px-1">
                  <div className="col-span-6">Tip aparat</div><div className="col-span-2 text-center">Nr.</div><div className="col-span-3 text-center">Debit</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_noi} onChange={upd('consumatori_noi')} columnId="noi" accent="blue" />
              </div>
            </div>
            {/* Total bar */}
            <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total debit calculat (Qmin)</div>
              <div className="font-mono tabular-nums text-lg font-bold epd-gradient-text" data-testid="consumer-total-qmin">{qmin_calc} Nmc/h</div>
            </div>
          </SectionCard>

          {/* SECTION 6 — Totaluri */}
          <SectionCard id="totaluri" title="Totaluri & dimensionare contor/firidă/săpătură" collapsed={collapsed['totaluri']} onToggle={() => toggleSection('totaluri')}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3"><Field label="Total debit consumatori Qmin (auto)"><Input value={qmin_calc} onChange={() => {}} /></Field></div>
              <div className="md:col-span-3"><Field label="Qmax (debit regulator) Nmc/h"><Input type="number" value={data.qmax_regulator} onChange={upd('qmax_regulator')} /></Field></div>
              <div className="md:col-span-3"><Field label="Tip contor (în fct. de debit max)"><Select value={data.tip_contor} onChange={upd('tip_contor')} options={['G2.5', 'G4', 'G6', 'G10', 'G16', 'G25', 'G40', 'G65', 'G100', 'G160', 'G250']} /></Field></div>
              <div className="md:col-span-3"><Field label="Tip firidă (în fct. de debit)"><Select value={data.tip_firida} onChange={upd('tip_firida')} options={['A100', 'A200', 'B150', 'B300', 'C500', 'D700', 'D1000']} /></Field></div>
              <div className="md:col-span-6"><Field label="Tip săpătură BR"><Select value={data.tip_sapatura_br} onChange={upd('tip_sapatura_br')} options={['Sant deschis', 'Foraj', 'Sant deschis + foraj', 'Aerian']} /></Field></div>
              <div className="md:col-span-6"><Field label="Tip săpătură CND"><Select value={data.tip_sapatura_cnd} onChange={upd('tip_sapatura_cnd')} options={['Sant deschis', 'Foraj', 'Sant deschis + foraj', 'Aerian']} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 7 — Alte date */}
          <SectionCard id="alte-date" title="Alte date tehnice (rețele intersecții, tub protecție, firidă)" collapsed={collapsed['alte-date']} onToggle={() => toggleSection('alte-date')}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3"><Field label="Branșament ramificat"><Toggle value={data.br_ramificat} onChange={upd('br_ramificat')} /></Field></div>
              <div className="md:col-span-5"><Field label="Calcul auto tub protecție CND"><Input value={data.tub_protectie_cnd} onChange={upd('tub_protectie_cnd')} /></Field></div>
              <div className="md:col-span-4"><Field label="Calcul auto tub protecție BR"><Input value={data.tub_protectie_br} onChange={upd('tub_protectie_br')} /></Field></div>
              <div className="md:col-span-3"><Field label="Poziție firidă (m)"><Input type="number" value={data.pozitie_firida} onChange={upd('pozitie_firida')} /></Field></div>
              <div className="md:col-span-3"><Field label="Față de limită"><Toggle value={data.fata_de_limita} onChange={upd('fata_de_limita')} options={['Stânga', 'Dreapta']} /></Field></div>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 mt-4">Rețele intersecții branșament</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-2"><Field label="LES"><Toggle value={data.retele_les} onChange={upd('retele_les')} /></Field></div>
              <div className="md:col-span-4"><Field label="Pat cărămizi L (m)"><Input type="number" value={data.retele_les_pat_caramizi} onChange={upd('retele_les_pat_caramizi')} /></Field></div>
              <div className="md:col-span-2"><Field label="Telefonie"><Toggle value={data.retele_telefonie} onChange={upd('retele_telefonie')} /></Field></div>
              <div className="md:col-span-2"><Field label="Tub"><Input value={data.retele_telefonie_tub} onChange={upd('retele_telefonie_tub')} /></Field></div>
              <div className="md:col-span-2"><Field label="L (m)"><Input type="number" value={data.retele_telefonie_lungime} onChange={upd('retele_telefonie_lungime')} /></Field></div>
              <div className="md:col-span-3"><Field label="Sine tramvai"><Toggle value={data.retele_sine_tramvai} onChange={upd('retele_sine_tramvai')} /></Field></div>
              <div className="md:col-span-3"><Field label="Drum național / județean"><Toggle value={data.retele_drum_national} onChange={upd('retele_drum_national')} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 8 — Cadastrale */}
          <SectionCard id="cadastrale" title="Specificații cadastrale" collapsed={collapsed['cadastrale']} onToggle={() => toggleSection('cadastrale')}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5"><Field label="Număr cadastral traseu"><Input value={data.cadastrale_traseu} onChange={upd('cadastrale_traseu')} placeholder="257962" /></Field></div>
              <div className="md:col-span-2"><Field label="Tip"><Select value={data.cadastrale_traseu_tip} onChange={upd('cadastrale_traseu_tip')} options={['CND', 'BR', 'CND + BR', 'IUGN']} /></Field></div>
              <div className="md:col-span-5"></div>
              <div className="md:col-span-5"><Field label="Număr cadastral imobil"><Input value={data.cadastral_imobil} onChange={upd('cadastral_imobil')} placeholder="257962" /></Field></div>
              <div className="md:col-span-2"><Field label="Tip"><Select value={data.cadastral_imobil_tip} onChange={upd('cadastral_imobil_tip')} options={['BR', 'CND', 'CND + BR', 'IUGN']} /></Field></div>
            </div>
          </SectionCard>

          {/* SECTION 9 — Gropi sudare */}
          <SectionCard id="gropi-sudare" title="Suprafață gropi sudare (auto-calcul)" collapsed={collapsed['gropi-sudare']} onToggle={() => toggleSection('gropi-sudare')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Suprafață groapă sudare BR"><Input value={data.groapa_sudare_br} onChange={upd('groapa_sudare_br')} placeholder="L=1,5 x 1,5 x 1" /></Field>
              <Field label="Suprafață groapă sudare CND"><Input value={data.groapa_sudare_cnd} onChange={upd('groapa_sudare_cnd')} placeholder="L=1,5 x 1,5 x 1" /></Field>
            </div>
          </SectionCard>

          {/* SECTION 10 — Avize obtinute */}
          <SectionCard id="avize-list" title="Avize obținute" collapsed={collapsed['avize-list']} onToggle={() => toggleSection('avize-list')}>
            <div className="grid grid-cols-12 gap-1.5 mb-2 text-[9px] uppercase tracking-wider text-slate-500 font-semibold px-1.5">
              <div className="col-span-3">Denumire</div>
              <div className="col-span-5">Seria / Nr + Data</div>
              <div className="col-span-1 text-center">Aviz</div>
              <div className="col-span-1 text-center">Plată</div>
              <div className="col-span-1 text-center">Doc.</div>
              <div className="col-span-1"></div>
            </div>
            <AvizeList items={data.avize_obtinute} onChange={upd('avize_obtinute')} />
            <button
              onClick={() => upd('avize_obtinute')([...data.avize_obtinute, { id: `custom_${Date.now()}`, label: 'Aviz nou', serie_nr_data: '' }])}
              className="mt-3 text-xs inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-md font-semibold transition-colors"
              data-testid="add-aviz-custom"
            >
              <Plus className="w-3.5 h-3.5" /> Adaugă aviz personalizat
            </button>
          </SectionCard>

          {/* SECTION 11 — Generare documente */}
          <SectionCard id="generare-documente" title="Generare documente DOCX (Deviz · Situație · Listă materiale · Fișă tehnică)" collapsed={collapsed['generare-documente']} onToggle={() => toggleSection('generare-documente')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GENERATE_DOCS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => downloadDoc(g.template, `${g.id}_${pid}.docx`)}
                  className="group relative overflow-hidden bg-white border border-slate-200 hover:border-violet-400 hover:shadow-lg rounded-lg p-4 text-left transition-all"
                  data-testid={`generate-${g.id}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 to-violet-50/0 group-hover:from-violet-50/40 group-hover:to-indigo-50/30 transition-all"></div>
                  <FileText className="w-5 h-5 text-violet-600 mb-2 relative" />
                  <div className="text-xs font-bold text-slate-900 relative">{g.label}</div>
                  <div className="text-[10px] text-violet-600 mt-1 relative font-semibold flex items-center gap-1">
                    Generează DOCX <Download className="w-2.5 h-2.5" />
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 12 — Acte uploads (REAL upload backend) */}
          <SectionCard id="acte-uploads" title="Acte beneficiar · Acte lucrare · Planuri lucrare (upload real)" collapsed={collapsed['acte-uploads']} onToggle={() => toggleSection('acte-uploads')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'acte_beneficiar', label: 'Acte beneficiar', accent: 'violet', items: ['Acte proprietate', 'CI/CUI beneficiar', 'Extras CF'] },
                { id: 'act_lucrare',     label: 'Acte lucrare',    accent: 'indigo', items: ['Contract prestări servicii', 'Contract salubrizare', 'Predare amplasament', 'Aviz Poliție'] },
                { id: 'plan_lucrare',    label: 'Planuri lucrare', accent: 'blue',   items: ['Plan situație', 'Plan încadrare', 'Plan semnalizare', 'Schemă izometrică'] },
              ].map((bucket) => {
                const acc = { violet: 'border-violet-200 hover:border-violet-400', indigo: 'border-indigo-200 hover:border-indigo-400', blue: 'border-blue-200 hover:border-blue-400' }[bucket.accent];
                const accText = { violet: 'text-violet-700', indigo: 'text-indigo-700', blue: 'text-blue-700' }[bucket.accent];
                return (
                  <div key={bucket.id} className={`bg-white border ${acc} rounded-lg p-3 transition-colors`}>
                    <div className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${accText}`}>{bucket.label}</div>
                    <div className="space-y-1.5">
                      {bucket.items.map((it) => (
                        <div key={it} className="flex items-center gap-2 text-xs bg-slate-50/60 hover:bg-slate-50 rounded p-1.5 transition-colors">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="flex-1 truncate text-slate-700">{it}</span>
                          <RealUploadButton
                            pid={pid}
                            category={bucket.id === 'acte_beneficiar' ? 'act_beneficiar' : bucket.id}
                            bucketKey={`${bucket.id}.${it}`}
                            label={it}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

        </div>

        {/* RIGHT SIDEBAR — premium violet/indigo cards · 100% functional */}
        <aside className="xl:col-span-3 space-y-4">

          {/* User & plan info card */}
          <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-200 rounded-xl p-4 epd-shadow" data-testid="user-info-card">
            <div className="text-[10px] uppercase tracking-[0.22em] text-violet-600 font-bold mb-2">// Sesiune activă</div>
            <div className="text-sm font-bold text-slate-900 truncate" title={proj.title}>{proj.title}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">{pid}</div>
            <div className="mt-3 pt-3 border-t border-violet-200/60 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-0.5">Status</div>
                <div className="font-semibold text-slate-800">{proj.status || 'draft'}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase tracking-wider mb-0.5">Fază</div>
                <div className="font-semibold text-slate-800">{proj.phase || 'tema'}</div>
              </div>
            </div>
          </div>

          {/* Email dispatch — VIOLET premium */}
          <div className="bg-white border border-violet-200 rounded-xl epd-shadow overflow-hidden" data-testid="email-dispatch-panel">
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-violet-600" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-violet-700 font-bold">Trimitere documentație</div>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">10 destinatari · email automat cu PDF</div>
            </div>
            <div className="p-3 space-y-2.5 max-h-[420px] overflow-y-auto">
              {EMAIL_DISPATCH_ROUTES.map((r) => (
                <div key={r.id} className="text-[10px]">
                  <div className="text-slate-700 leading-tight mb-1 font-semibold">{r.label}</div>
                  <div className="flex gap-1">
                    <input
                      value={data.emails?.[r.id] || ''}
                      onChange={(e) => upd('emails')({ ...data.emails, [r.id]: e.target.value })}
                      placeholder={r.def}
                      data-testid={`email-${r.id}`}
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 px-2 py-1 text-[10px] rounded font-mono outline-none transition-colors"
                    />
                    <button
                      onClick={() => sendEmailRoute(r.id, r.label)}
                      disabled={!data.emails?.[r.id] || dispatchingRoute === r.id}
                      className="bg-violet-600 text-white px-2 py-1 text-[10px] hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed rounded font-semibold transition-colors min-w-[55px] inline-flex items-center justify-center"
                      data-testid={`dispatch-${r.id}`}
                    >
                      {dispatchingRoute === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Trimite'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stamps uploads — INDIGO */}
          <div className="bg-white border border-indigo-200 rounded-xl epd-shadow overflow-hidden" data-testid="stamps-panel">
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Stamp className="w-3.5 h-3.5 text-indigo-600" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-indigo-700 font-bold">Ștampile autorizate</div>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">PNG transparent · plasare automată A4</div>
            </div>
            <div className="p-3 space-y-1.5">
              {STAMPS_UPLOAD.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-[11px] bg-slate-50/60 hover:bg-slate-50 rounded p-1.5 transition-colors">
                  <Stamp className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="flex-1 leading-tight text-slate-700">{s.label}</span>
                  <RealUploadButton
                    pid={pid}
                    category={s.category}
                    bucketKey={s.id}
                    label={s.label}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Final downloads — BLUE premium */}
          <div className="bg-white border border-blue-200 rounded-xl epd-shadow overflow-hidden" data-testid="final-downloads-panel">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-blue-700 font-bold">Descărcare documente</div>
              </div>
            </div>
            <div className="p-3 space-y-1.5">
              {FINAL_DOWNLOADS.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs bg-slate-50/60 rounded p-2">
                  <span className="font-semibold text-slate-800">{d.label}</span>
                  <button
                    onClick={() => downloadDoc(d.template, `${d.id}_${pid}.docx`)}
                    className="bg-blue-600 text-white px-2.5 py-1 text-[10px] inline-flex items-center gap-1 hover:bg-blue-700 rounded font-semibold transition-colors"
                    data-testid={`download-${d.id}`}
                  >
                    <Download className="w-3 h-3" /> DOCX
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Final actions — EPD gradient premium */}
          <div className="bg-white border border-violet-200 rounded-xl epd-shadow overflow-hidden" data-testid="final-actions-panel">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <div className="text-[10px] uppercase tracking-[0.18em] text-white font-bold">Acțiuni proiect</div>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <button onClick={sendToAvizare} disabled={sendingAvizare} className="w-full text-xs inline-flex items-center justify-center gap-2 epd-gradient text-white px-3 py-2.5 hover:opacity-90 disabled:opacity-50 rounded-md font-semibold transition-all" data-testid="send-to-avizare">
                {sendingAvizare ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Trimite spre avizare
              </button>
              <UploadAvizatButton pid={pid} onUploaded={load} />
              <button
                onClick={downloadDossier}
                className="w-full text-xs inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-3 py-2.5 hover:bg-slate-800 rounded-md font-semibold transition-colors"
                data-testid="download-dossier-complet"
              >
                <Package className="w-3.5 h-3.5" /> Descarcă dosar ZIP
              </button>
              <button
                onClick={() => window.open(`${backendUrl}/api/gas-project/${pid}/dossier.zip`, '_blank')}
                className="w-full text-xs inline-flex items-center justify-center gap-2 bg-white text-violet-700 border border-violet-300 hover:bg-violet-50 px-3 py-2.5 rounded-md font-semibold transition-colors"
                data-testid="preview-dossier"
              >
                <Eye className="w-3.5 h-3.5" /> Previzualizează dosar
              </button>
              <button
                onClick={() => setShowTransfer(true)}
                className="w-full text-xs inline-flex items-center justify-center gap-2 bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50 px-3 py-2.5 rounded-md font-semibold transition-colors"
                data-testid="open-transfer-dialog"
              >
                <Send className="w-3.5 h-3.5 rotate-90" /> Transferă către alt utilizator
              </button>
            </div>
            <div className="px-3 pb-3 text-[10px] text-center text-slate-500 italic leading-tight border-t border-slate-100 pt-2">
              Documente generate · semnătură SHA-256 · trasabilitate completă în registrul de audit.
            </div>
          </div>

        </aside>
      </div>
      )}

      {/* Transfer dialog */}
      {showTransfer && (
        <TransferProjectDialog
          pid={pid}
          onClose={() => setShowTransfer(false)}
          onTransferred={() => { setShowTransfer(false); load(); }}
        />
      )}
    </AppShell>
  );
}
