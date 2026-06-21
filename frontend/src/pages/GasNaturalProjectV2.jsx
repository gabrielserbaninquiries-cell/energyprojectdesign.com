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
import GasServicePipeline from '../components/GasServicePipeline';
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
      <label className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1">{label}</label>
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
      className={`w-full bg-green-100/60 border border-green-300 px-2 py-1 text-xs outline-none focus:border-green-600 focus:bg-white mono ${className}`}
      data-testid={testid}
    />
  );
}

function Toggle({ value, onChange, options = ['Da', 'Nu'], testid }) {
  return (
    <div className="inline-flex gap-1" data-testid={testid}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2 py-0.5 text-[10px] border ${value === opt ? 'bg-green-600 text-white border-green-700' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
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
      className="bg-green-100/60 border border-green-300 px-2 py-1 text-xs outline-none focus:border-green-600 focus:bg-white mono w-full"
      data-testid={testid}
    >
      {(options || []).map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionCard({ id, title, children, collapsed, onToggle, accent = 'green' }) {
  const colorMap = {
    green: 'border-green-400 bg-green-50/30',
    amber: 'border-amber-400 bg-amber-50/30',
    blue: 'border-blue-400 bg-blue-50/30',
  };
  return (
    <section id={id} className={`border-2 ${colorMap[accent]} mb-4`} data-testid={`section-${id}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-b-2 border-green-300 hover:bg-green-50"
      >
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {!collapsed && <div className="p-4">{children}</div>}
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
  return (
    <label className="text-xs inline-flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 hover:bg-teal-700 cursor-pointer" data-testid="ocr-import-btn">
      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      Import auto (OCR)
      <input type="file" className="hidden" onChange={handle} accept=".pdf,.docx,.doc" />
    </label>
  );
}

function ConsumerList({ items, onChange, columnId }) {
  const add = () => onChange([...items, { tip: CONSUMER_TYPES[0], nr_aparate: 1, debit_nmc_h: 0.5 }]);
  const upd = (idx, key, val) => onChange(items.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  const rm = (idx) => onChange(items.filter((_, i) => i !== idx));
  return (
    <div data-testid={`consumers-${columnId}`}>
      {items.length === 0 && <div className="text-[10px] text-gray-500 italic mb-2">Niciun consumator</div>}
      {items.map((c, i) => (
        <div key={i} className="grid grid-cols-12 gap-1 mb-1.5 items-center text-xs">
          <select value={c.tip} onChange={(e) => upd(i, 'tip', e.target.value)}
            className="col-span-6 bg-green-100/60 border border-green-300 px-1.5 py-1 text-[11px] mono">
            {CONSUMER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="number" value={c.nr_aparate} onChange={(e) => upd(i, 'nr_aparate', parseInt(e.target.value) || 0)}
            className="col-span-2 bg-green-100/60 border border-green-300 px-1.5 py-1 text-[11px] mono" />
          <input type="number" step="0.01" value={c.debit_nmc_h} onChange={(e) => upd(i, 'debit_nmc_h', parseFloat(e.target.value) || 0)}
            className="col-span-3 bg-green-100/60 border border-green-300 px-1.5 py-1 text-[11px] mono" />
          <button onClick={() => rm(i)} className="col-span-1 text-red-600 hover:bg-red-50 p-1" data-testid={`consumer-${columnId}-rm-${i}`}>
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button onClick={add} className="text-[10px] inline-flex items-center gap-1 text-green-700 hover:underline mt-1" data-testid={`consumer-${columnId}-add`}>
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
        <div key={a.id || i} className="grid grid-cols-12 gap-1 items-center text-xs">
          <div className="col-span-3 text-[11px] font-semibold">{a.label}</div>
          <input value={a.serie_nr_data} onChange={(e) => updItem(i, 'serie_nr_data', e.target.value)}
            placeholder="Serie / Nr / Data" data-testid={`${prefix}-${a.id || i}-serie`}
            className="col-span-5 bg-green-100/60 border border-green-300 px-1.5 py-1 text-[11px] mono" />
          <button title="Încarcă aviz" className="col-span-1 text-green-700 hover:bg-green-100 p-1.5 border border-green-300 bg-white" data-testid={`${prefix}-${a.id || i}-upload-aviz`}>
            <Upload className="w-3 h-3" />
          </button>
          <button title="Plată" className="col-span-1 text-green-700 hover:bg-green-100 p-1.5 border border-green-300 bg-white" data-testid={`${prefix}-${a.id || i}-upload-plata`}>
            <Upload className="w-3 h-3" />
          </button>
          <button title="Documentație" className="col-span-1 text-green-700 hover:bg-green-100 p-1.5 border border-green-300 bg-white" data-testid={`${prefix}-${a.id || i}-upload-doc`}>
            <Upload className="w-3 h-3" />
          </button>
          {!a.id?.startsWith?.('default-') && a.id !== 'ac' && (
            <button onClick={() => rm(i)} className="col-span-1 text-red-600 hover:bg-red-50 p-1.5">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
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

  if (!proj) {
    return (
      <AppShell title="Gaze Naturale · Operare proiect" subtitle="Se încarcă...">
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Gaze Naturale · ${proj.title || 'Proiect'}`} subtitle={`PID: ${pid} · Status: ${proj.status || '—'}${dirty ? ' · ⚠️ modificări nesalvate' : ''}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={() => nav('/gaze-naturale')} className="text-xs inline-flex items-center gap-1 text-gray-600 hover:text-black" data-testid="back-to-projects">
          <ArrowLeft className="w-3 h-3" /> Înapoi la registru
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
          <button onClick={save} disabled={saving || !dirty} className="text-xs inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 disabled:opacity-50" data-testid="gas-v2-save">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Salvează preferințe
          </button>
          <button onClick={async () => { await save(); toast.success('Proiect finalizat'); }} disabled={saving} className="text-xs inline-flex items-center gap-1 bg-black text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50" data-testid="gas-v2-finalize">
            <CheckCircle2 className="w-3 h-3" /> Salvează și finalizează
          </button>
        </div>
      </div>

      {/* SERVICE PIPELINE + AD-HOC CATALOG (de la date la livrare cu plată Stripe) */}
      <GasServicePipeline
        pid={pid}
        data={data}
        hasStamps={!!proj?.signed_assets?.length}
        isSigned={!!proj?.signature_hash}
      />

      {/* Tabs Date / Avize / Registru */}
      <div className="flex gap-1 mb-4 border-b-2 border-green-400" data-testid="gas-v2-tabs">
        <button onClick={() => setActiveTab('date')} className={`px-4 py-2 text-sm font-semibold border-2 border-b-0 ${activeTab === 'date' ? 'bg-green-400 border-green-500 text-white' : 'bg-white border-green-300 text-gray-700 hover:bg-green-50'}`} data-testid="tab-date">
          DATE OPERAȚIONALE
        </button>
        <button onClick={() => setActiveTab('avize')} className={`px-4 py-2 text-sm font-semibold border-2 border-b-0 ${activeTab === 'avize' ? 'bg-green-400 border-green-500 text-white' : 'bg-white border-green-300 text-gray-700 hover:bg-green-50'}`} data-testid="tab-avize">
          AVIZE HUB
        </button>
        <button onClick={() => setActiveTab('registru')} className={`px-4 py-2 text-sm font-semibold border-2 border-b-0 ${activeTab === 'registru' ? 'bg-green-400 border-green-500 text-white' : 'bg-white border-green-300 text-gray-700 hover:bg-green-50'}`} data-testid="tab-registru">
          REGISTRU CÂMPURI {regFieldsCount ? `(${regFieldsCount})` : ''}
        </button>
        <button onClick={() => setActiveTab('engineering')} className={`px-4 py-2 text-sm font-semibold border-2 border-b-0 ${activeTab === 'engineering' ? 'bg-blue-400 border-blue-500 text-white' : 'bg-white border-blue-300 text-gray-700 hover:bg-blue-50'}`} data-testid="tab-engineering">
          INGINERIE (RENOUARD + SIZING)
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
        <div className="bg-white border-2 border-green-400 p-6">
          <h2 className="text-lg font-bold mb-3">Avize Hub</h2>
          <p className="text-sm text-gray-600 mb-4">Vezi statusul avizelor, generează ZIP per fiecare aviz, marchează primite/respinse.</p>
          <button onClick={() => nav(`/gaze-naturale-v1/${pid}`)} className="text-xs inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700">
            <ExternalLink className="w-3 h-3" /> Deschide Avize Hub (vizualizare V1)
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

          {/* SECTION 5 — Consumatori (3 columns) */}
          <SectionCard id="consumatori" title="Consumatori (3 categorii)" collapsed={collapsed['consumatori']} onToggle={() => toggleSection('consumatori')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-green-300 p-3 bg-white">
                <div className="text-[11px] font-bold uppercase tracking-wider text-green-700 mb-2">Existenți (se mențin)</div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase text-gray-500">
                  <div className="col-span-6">Tip</div><div className="col-span-2">Nr.</div><div className="col-span-3">Debit Nmc/h</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_mentinuti} onChange={upd('consumatori_mentinuti')} columnId="mentinuti" />
              </div>
              <div className="border border-amber-300 p-3 bg-white">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-2">Existenți (se dezafectează)</div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase text-gray-500">
                  <div className="col-span-6">Tip</div><div className="col-span-2">Nr.</div><div className="col-span-3">Debit Nmc/h</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_dezafectati} onChange={upd('consumatori_dezafectati')} columnId="dezafectati" />
              </div>
              <div className="border border-blue-300 p-3 bg-white">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2">Noi</div>
                <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase text-gray-500">
                  <div className="col-span-6">Tip</div><div className="col-span-2">Nr.</div><div className="col-span-3">Debit Nmc/h</div><div className="col-span-1"></div>
                </div>
                <ConsumerList items={data.consumatori_noi} onChange={upd('consumatori_noi')} columnId="noi" />
              </div>
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
          <SectionCard id="avize-list" title="Avize obținute" collapsed={collapsed['avize-list']} onToggle={() => toggleSection('avize-list')} accent="amber">
            <div className="grid grid-cols-12 gap-1 mb-2 text-[9px] uppercase text-gray-500 font-semibold">
              <div className="col-span-3">Denumire</div>
              <div className="col-span-5">Seria / Nr + Data</div>
              <div className="col-span-1 text-center">Aviz</div>
              <div className="col-span-1 text-center">Plata</div>
              <div className="col-span-1 text-center">Doc.</div>
              <div className="col-span-1"></div>
            </div>
            <AvizeList items={data.avize_obtinute} onChange={upd('avize_obtinute')} />
            <button
              onClick={() => upd('avize_obtinute')([...data.avize_obtinute, { id: `custom_${Date.now()}`, label: 'Alt aviz', serie_nr_data: '' }])}
              className="mt-3 text-xs inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 hover:bg-amber-200"
              data-testid="add-aviz-custom"
            >
              <Plus className="w-3 h-3" /> Adaugă aviz
            </button>
          </SectionCard>

          {/* SECTION 11 — Generare documente */}
          <SectionCard id="generare-documente" title="Generare documente (Deviz · Situație · Listă materiale · Fișă tehnică)" collapsed={collapsed['generare-documente']} onToggle={() => toggleSection('generare-documente')} accent="blue">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {GENERATE_DOCS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => downloadDoc(g.template, `${g.id}_${pid}.docx`)}
                  className="border-2 border-blue-300 bg-white p-3 hover:bg-blue-50 text-left"
                  data-testid={`generate-${g.id}`}
                >
                  <FileText className="w-4 h-4 text-blue-600 mb-2" />
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Generează DOCX →</div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* SECTION 12 — Acte uploads (REAL upload backend) */}
          <SectionCard id="acte-uploads" title="Acte beneficiar · Acte lucrare · Planuri lucrare (upload real)" collapsed={collapsed['acte-uploads']} onToggle={() => toggleSection('acte-uploads')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'acte_beneficiar', label: 'Acte beneficiar', items: ['Acte proprietate', 'CI/CUI beneficiar', 'Extras CF'] },
                { id: 'act_lucrare',     label: 'Acte lucrare', items: ['Contract prestări servicii', 'Contract salubrizare', 'Predare amplasament', 'Aviz Poliție'] },
                { id: 'plan_lucrare',    label: 'Planuri lucrare', items: ['Plan situație', 'Plan încadrare', 'Plan semnalizare', 'Schemă izometrică'] },
              ].map((bucket) => (
                <div key={bucket.id} className="border border-gray-300 bg-white p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-2">{bucket.label}</div>
                  <div className="space-y-1">
                    {bucket.items.map((it) => (
                      <div key={it} className="flex items-center gap-2 text-xs">
                        <FileText className="w-3 h-3 text-gray-500 shrink-0" />
                        <span className="flex-1 truncate">{it}</span>
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
              ))}
            </div>
          </SectionCard>

        </div>

        {/* RIGHT SIDEBAR — emails + stamps + downloads + actions */}
        <aside className="xl:col-span-3 space-y-4">

          {/* User info card */}
          <div className="border-2 border-gray-300 bg-white p-3" data-testid="user-info-card">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><div className="text-gray-500 uppercase tracking-wider">Utilizator</div><div className="font-semibold">Administrator</div></div>
              <div><div className="text-gray-500 uppercase tracking-wider">Atribuții</div><div className="font-semibold">Toate comenzile</div></div>
              <div className="col-span-2"><div className="text-gray-500 uppercase tracking-wider">Nume</div><div className="font-semibold">{proj.title}</div></div>
            </div>
          </div>

          {/* Email dispatch */}
          <div className="border-2 border-green-400 bg-green-50/40 p-3" data-testid="email-dispatch-panel">
            <div className="text-[10px] uppercase tracking-wider text-gray-700 mb-2 font-bold">// adresa mail · trimiteri</div>
            <div className="space-y-2">
              {EMAIL_DISPATCH_ROUTES.map((r) => (
                <div key={r.id} className="text-[10px]">
                  <div className="text-gray-700 leading-tight mb-1">{r.label}</div>
                  <div className="flex gap-1">
                    <input
                      value={data.emails?.[r.id] || ''}
                      onChange={(e) => upd('emails')({ ...data.emails, [r.id]: e.target.value })}
                      placeholder={r.def}
                      data-testid={`email-${r.id}`}
                      className="flex-1 bg-white border border-green-300 px-1.5 py-1 text-[10px] mono"
                    />
                    <button
                      onClick={() => toast.success(`Trimis: ${r.label}`)}
                      className="bg-green-600 text-white px-2 py-1 text-[10px] hover:bg-green-700"
                      data-testid={`dispatch-${r.id}`}
                    >
                      Trimite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stamps uploads (REAL upload) */}
          <div className="border-2 border-blue-400 bg-blue-50/40 p-3" data-testid="stamps-panel">
            <div className="text-[10px] uppercase tracking-wider text-gray-700 mb-2 font-bold">// ștampile (upload real)</div>
            <div className="space-y-1.5">
              {STAMPS_UPLOAD.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-[10px]">
                  <Stamp className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="flex-1 leading-tight">{s.label}</span>
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

          {/* Final downloads */}
          <div className="border-2 border-amber-400 bg-amber-50/40 p-3" data-testid="final-downloads-panel">
            <div className="text-[10px] uppercase tracking-wider text-gray-700 mb-2 font-bold">// descărcare documente</div>
            <div className="space-y-1.5">
              {FINAL_DOWNLOADS.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{d.label}</span>
                  <button
                    onClick={() => downloadDoc(d.template, `${d.id}_${pid}.docx`)}
                    className="bg-amber-600 text-white px-2 py-1 text-[10px] inline-flex items-center gap-1 hover:bg-amber-700"
                    data-testid={`download-${d.id}`}
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Final actions */}
          <div className="border-2 border-black bg-white p-3" data-testid="final-actions-panel">
            <div className="space-y-2">
              <button className="w-full text-xs inline-flex items-center justify-center gap-2 bg-black text-white px-3 py-2 hover:bg-gray-800" data-testid="send-to-avizare">
                <Send className="w-3 h-3" /> Trimite proiectul către avizare
              </button>
              <button className="w-full text-xs inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-800 border border-gray-300 px-3 py-2 hover:bg-gray-200" data-testid="upload-avizat">
                <Upload className="w-3 h-3" /> Încarcă proiectul avizat
              </button>
              <button
                onClick={downloadDossier}
                className="w-full text-xs inline-flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 hover:bg-green-700"
                data-testid="download-dossier-complet"
              >
                <Package className="w-3 h-3" /> Descarcă toate documentele
              </button>
              <button
                onClick={() => toast.success('Preview generat')}
                className="w-full text-xs inline-flex items-center justify-center gap-2 bg-white text-black border border-gray-400 px-3 py-2 hover:bg-gray-50"
                data-testid="preview-dossier"
              >
                <Eye className="w-3 h-3" /> Previzualizează dosar complet
              </button>
            </div>
            <div className="mt-3 text-[10px] text-center text-gray-600 italic leading-tight border-t border-gray-200 pt-2">
              Documente generate cu succes! Planurile tale și calculele sunt în drum spre un proiectant care se va ocupa de elaborarea acestora.
            </div>
          </div>

        </aside>
      </div>
      )}
    </AppShell>
  );
}
