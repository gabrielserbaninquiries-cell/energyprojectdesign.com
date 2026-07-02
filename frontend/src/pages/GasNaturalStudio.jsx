/**
 * Gas Natural Studio — V11.0
 *
 * Pagină comprehensivă conformă specificațiilor literale din
 * "Camuri de introdus in pagina gaze naturale.docx".
 *
 * Conține 3 module principale (tip lucrare):
 *   1. Branșament
 *   2. Extindere conductă (cu N branșamente nested)
 *   3. Instalație de utilizare (cu V/Q, priză aer, camere aparate)
 *
 * Plus:
 *   - Date generale (OSD, VGD, RTE, Proiectant, Executant, Beneficiar)
 *   - Avize multiple cu termen expirare
 *   - Calcule LIVE: lățime șanț, tub protecție, viteză gaz, diametru recomandat
 *   - Generare automată listă materiale
 *   - Salvare preferințe ca template implicit
 *   - Generare master DOCX cu toate placeholderele
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Send, Download, FileText, Calculator, Package,
  CheckCircle2, AlertCircle, Loader2, FileSignature, Settings,
  Flame, GitBranch, Home, Sparkles, ChevronRight, FolderOpen, Plus,
  Clock, Trash2, Code2, Bug,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDevMode } from '../contexts/DevModeContext';

import GasGeneralDataSection from '../components/gas/GasGeneralDataSection';
import GasBransamentSection from '../components/gas/GasBransamentSection';
import GasExtindereSection from '../components/gas/GasExtindereSection';
import GasInstalatieUtilizareSection from '../components/gas/GasInstalatieUtilizareSection';
import GasAvizeSection from '../components/gas/GasAvizeSection';
import GasMaterialsAutoSection from '../components/gas/GasMaterialsAutoSection';
import GasSmartCalcPanel from '../components/gas/GasSmartCalcPanel';
import GasSuduriSection from '../components/gas/GasSuduriSection';
import GasPVSection from '../components/gas/GasPVSection';
import GasDocumenteSection from '../components/gas/GasDocumenteSection';
import GasPhaseEntropy from '../components/gas/GasPhaseEntropy';
import GasMailDispatchPanel from '../components/gas/GasMailDispatchPanel';
import GasIndustryBanner from '../components/gas/GasIndustryBanner';
import GasSubsectionSelector, { GAS_SUBSECTIONS } from '../components/gas/GasSubsectionSelector';
import GasEntropiaWorkflow from '../components/gas/GasEntropiaWorkflow';
import { TIPURI_LUCRARE } from '../lib/gasCalcs';

const SECTIONS = [
  { id: 'general',    icon: Settings,    label: 'Date generale', desc: 'OSD, VGD, RTE, Proiectant, Executant, Beneficiar, Amplasament' },
  { id: 'bransament', icon: Flame,       label: 'Branșament',    desc: 'Material, diametru, robinet, regulator, contor, firidă, ștecher' },
  { id: 'extindere',  icon: GitBranch,   label: 'Extindere conductă', desc: 'Lungime, diametru, branșamente multiple, metoda cuplare' },
  { id: 'instalatie', icon: Home,        label: 'Instalație utilizare', desc: 'Consumatori, camere aparate, V/Q, priză aer, detectori' },
  { id: 'avize',      icon: FileSignature, label: 'Avize & acorduri', desc: 'Aviz Apa, E-Distribuție, Telekom, ISU, Brigada Rutieră, CU' },
  { id: 'suduri',     icon: FileSignature, label: 'Suduri & calitate', desc: 'Sudor + examinare vizuală + protocol electrofuziune' },
  { id: 'pv',         icon: FileText,    label: 'Procese verbale',     desc: 'PV recepție, PIF, calitate materiale, predare amplasament' },
  { id: 'materiale',  icon: Package,     label: 'Listă materiale (auto)', desc: 'Generare automată conform Dn + lungime' },
  { id: 'calc',       icon: Calculator,  label: 'Calcule inginerești',     desc: 'Renouard, viteză, diametru recomandat, ΔP' },
  { id: 'documente',  icon: FileText,    label: 'Documente generate',      desc: '30+ șabloane DOCX descărcabile individual' },
];

const STORAGE_KEY = 'epd_gas_template_default';

export default function GasNaturalStudio() {
  const { id: paramId } = useParams();
  const nav = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { devMode, setDevMode } = useDevMode();

  const [pid, setPid] = useState(paramId || null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [showProjectPicker, setShowProjectPicker] = useState(!paramId);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [data, setData] = useState(() => {
    // Try load saved template
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return {
      tip_lucrare: 'bransament',
      osd_nume: 'Distrigaz Sud Rețele S.R.L.',
      bransament: { material: 'PE', diametru_dn: 'PE 32', lungime_m: 4, consumatori: [] },
      extindere: { material: 'PE', dn_proiectat: 'PE 63', lungime_totala_m: 50, n_bransamente: 0, bransamente: [] },
      instalatie: { tip: 'IUGN nouă', imobil_tip: 'casă la curte', consumatori: [], camere: [], fittinguri: [], robineti: [], electrovalve: [] },
      avize: [],
      cu_lista: [],
    };
  });
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Auto-save to localStorage on data change (debounced)
  useEffect(() => {
    if (!loaded) { setLoaded(true); return; }
    const handle = setTimeout(() => {
      try { localStorage.setItem('epd_gas_studio_draft', JSON.stringify(data)); } catch (e) { /* ignore */ }
    }, 800);
    return () => clearTimeout(handle);
  }, [data, loaded]);

  // Load existing project if pid is present
  useEffect(() => {
    if (!pid) return;
    (async () => {
      try {
        const r = await api.get(`/gas-project/${pid}`);
        if (r.data?.data) setData(prev => ({ ...prev, ...r.data.data }));
      } catch (err) {
        console.warn('Project load (non-fatal):', err);
      }
    })();
  }, [pid]);

  // V11.5 — Load saved Gas projects list (for picker / resume)
  const loadSavedProjects = useCallback(async () => {
    try {
      const r = await api.get('/gas-project');
      const list = Array.isArray(r.data) ? r.data : [];
      setSavedProjects(list.filter(p => !p.deleted));
    } catch (err) {
      console.warn('Saved projects load failed:', err);
    }
  }, []);

  useEffect(() => { loadSavedProjects(); }, [loadSavedProjects]);

  const openSavedProject = useCallback((selectedPid) => {
    setPid(selectedPid);
    setShowProjectPicker(false);
    nav(`/gaze-naturale/${selectedPid}`, { replace: false });
  }, [nav]);

  const startNewProject = useCallback(() => {
    setPid(null);
    setShowProjectPicker(false);
    setData({
      tip_lucrare: 'bransament',
      osd_nume: 'Distrigaz Sud Rețele S.R.L.',
      bransament: { material: 'PE', diametru_dn: 'PE 32', lungime_m: 4, consumatori: [] },
      extindere: { material: 'PE', dn_proiectat: 'PE 63', lungime_totala_m: 50, n_bransamente: 0, bransamente: [] },
      instalatie: { tip: 'IUGN nouă', imobil_tip: 'casă la curte', consumatori: [], camere: [], fittinguri: [], robineti: [], electrovalve: [] },
      avize: [],
      cu_lista: [],
    });
    nav('/gaze-naturale', { replace: false });
  }, [nav]);

  const deleteSavedProject = useCallback(async (deletePid, e) => {
    e.stopPropagation();
    if (!window.confirm('Ștergeți proiectul definitiv?')) return;
    try {
      await api.delete(`/gas-project/${deletePid}`);
      toast.success('Proiect șters');
      await loadSavedProjects();
      if (pid === deletePid) startNewProject();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la ștergere');
    }
  }, [pid, loadSavedProjects, startNewProject]);

  const updateData = useCallback((patch) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const updateSection = useCallback((sectionKey, patch) => {
    setData(prev => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), ...patch } }));
  }, []);

  // Save as default template
  const saveAsTemplate = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast.success('✅ Salvat ca template implicit. Va fi încărcat automat la următorul proiect.');
    } catch (e) {
      toast.error('Nu am putut salva template-ul');
    }
  };

  // Save project (creates if new, updates if existing)
  const saveProject = async () => {
    setSaving(true);
    try {
      if (pid) {
        await api.patch(`/gas-project/${pid}`, { data });
        toast.success('Proiect salvat');
      } else {
        const r = await api.post('/gas-project', {
          title: `Proiect ${data.tip_lucrare} — ${data.beneficiar_nume || 'Beneficiar nou'}`,
          country: 'RO',
          subdomain: 'bransament-casnic',
          phase: 'tema',
          data,
        });
        if (r.data?.pid) {
          setPid(r.data.pid);
          toast.success('Proiect creat');
          nav(`/gaze-naturale/${r.data.pid}`, { replace: true });
        }
      }
      setLastSavedAt(new Date());
      loadSavedProjects();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  // Generate master DOCX (uses preview endpoint — no need to persist)
  const [lastError, setLastError] = useState(null);
  const generateMasterDoc = async () => {
    setGenerating(true);
    setLastError(null);
    try {
      const res = await api.post('/gas/master-docx-preview', {
        ...data,
        title: `Proiect ${data.tip_lucrare || 'Branșament'} — ${data.beneficiar_nume || 'EPD'}`,
      }, { responseType: 'blob' });
      // If response came back as JSON (error wrapped in blob), surface it
      const isJsonError = res.data?.type === 'application/json';
      if (isJsonError) {
        const text = await res.data.text();
        try {
          const parsed = JSON.parse(text);
          throw new Error(parsed.detail || 'Eroare necunoscută la generare');
        } catch {
          throw new Error('Eroare la generare document');
        }
      }
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proiect_Bransament_${(data.beneficiar_nume || 'EPD').replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('✅ Document generat — verificați descărcările');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Eroare necunoscută';
      setLastError(msg);
      toast.error('❌ Eroare la generare document: ' + msg);
    } finally {
      setGenerating(false);
    }
  };

  const completionPercent = useMemo(() => {
    let total = 0; let filled = 0;
    const checkSection = (obj) => {
      Object.values(obj || {}).forEach(v => {
        total++;
        if (v !== '' && v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)) filled++;
      });
    };
    checkSection(data);
    return Math.round((filled / Math.max(total, 1)) * 100);
  }, [data]);

  return (
    <AppShell title="Studio Gaze Naturale">
      {/* V11.5 — Project Picker Modal (visible when no pid + user has saved projects) */}
      {showProjectPicker && savedProjects.length > 0 && (
        <div className="mb-6 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm" data-testid="gas-project-picker">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-1.5">// Continuați un proiect existent</div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">Aveți {savedProjects.length} proiect{savedProjects.length === 1 ? '' : 'e'} salvat{savedProjects.length === 1 ? '' : 'e'}</h2>
              <p className="text-sm text-zinc-500 mt-1">Reluați un proiect început sau creați unul nou.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={startNewProject}
                className="epd-btn text-sm py-2"
                data-testid="new-gas-project-btn"
              >
                <Plus className="w-4 h-4" /> Proiect nou
              </button>
              <button
                onClick={() => setShowProjectPicker(false)}
                className="ghost-btn text-sm"
                data-testid="dismiss-picker-btn"
              >
                Închide
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
            {savedProjects.slice(0, 12).map((proj) => {
              const updatedDate = proj.updated_at ? new Date(proj.updated_at) : null;
              const dateStr = updatedDate ? updatedDate.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
              return (
                <button
                  key={proj.pid}
                  onClick={() => openSavedProject(proj.pid)}
                  className="group relative text-left p-4 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-950 rounded-xl transition-all"
                  data-testid={`saved-project-${proj.pid}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 flex items-center justify-center text-white shrink-0">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-zinc-950 truncate">{proj.title || 'Proiect fără titlu'}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {dateStr}
                      </div>
                      <div className="text-[10px] text-zinc-700 mt-1 uppercase tracking-wider font-semibold">{proj.data?.tip_lucrare || 'branșament'} · {proj.status || 'draft'}</div>
                    </div>
                  </div>
                  <span
                    onClick={(e) => deleteSavedProject(proj.pid, e)}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') deleteSavedProject(proj.pid, e); }}
                    data-testid={`delete-project-${proj.pid}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* V13.0 — Premium zinc-950 header (Swiss/high-contrast) */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-zinc-950 p-8 text-white shadow-2xl border border-zinc-800" data-testid="gas-studio-header">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1773186704394-919b2aa3179a?w=1600&q=80&auto=format&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'luminosity',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />
        <div className="relative flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">// V13.0 · NTPEE 2018 + Ord. ANRE 89/2018</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-2 font-display">
              Studio Gaze Naturale <span className="text-zinc-400">— documentație 100% legală</span>
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl">
              Tot ce trebuie pentru un proiect tehnic complet — branșament, extindere, instalație utilizare —
              cu calcule inginerești live, generare automată listă materiale și export DOCX master cu 150+ placeholdere.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-white/10 backdrop-blur rounded-md border border-white/10">Tip: {data.tip_lucrare}</span>
              <span className="px-2 py-1 bg-white/10 backdrop-blur rounded-md border border-white/10">OSD: {data.osd_nume || '—'}</span>
              {data.beneficiar_nume && <span className="px-2 py-1 bg-white/10 backdrop-blur rounded-md border border-white/10">{data.beneficiar_nume}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-4xl font-bold tabular-nums font-display" data-testid="completion-percent">{completionPercent}%</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400">Completat</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="flex flex-col gap-2">
              <button
                onClick={saveProject}
                disabled={saving}
                className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 rounded-md font-semibold text-sm flex items-center gap-2 transition-all shadow-lg disabled:opacity-50"
                data-testid="save-project-btn"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {pid ? 'Salvează' : 'Creează proiect'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProjectPicker(true)}
                  className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur rounded-md font-medium text-xs flex items-center gap-2 transition-all"
                  data-testid="open-projects-picker-btn"
                  title="Vezi proiectele salvate"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Proiectele mele ({savedProjects.length})
                </button>
                <button
                  onClick={saveAsTemplate}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur rounded-md font-medium text-xs flex items-center gap-2 transition-all"
                  data-testid="save-template-btn"
                  title="Salvează valorile curente ca template implicit"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Template
                </button>
              </div>
              {lastSavedAt && (
                <div className="text-[10px] text-zinc-400 flex items-center gap-1" data-testid="last-saved-indicator">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Salvat la {lastSavedAt.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              {/* V11.5 — Developer-only: Dev mode toggle + download placeholder template */}
              {user?.is_developer && (
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
                  <button
                    onClick={() => setDevMode(!devMode)}
                    className={`px-2 py-1 rounded-md font-mono text-[10px] flex items-center gap-1 transition-all ${
                      devMode
                        ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
                        : 'bg-white/10 hover:bg-white/25 text-zinc-200'
                    }`}
                    title="Afișează numele placeholderelor {{key}} deasupra fiecărui input"
                    data-testid="dev-mode-toggle"
                  >
                    <Bug className="w-3 h-3" />
                    {devMode ? 'DEV ON' : 'DEV OFF'}
                  </button>
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL}/api/placeholders/template.docx`}
                    download
                    className="px-2 py-1 rounded-md font-mono text-[10px] flex items-center gap-1 bg-white/10 hover:bg-white/25 text-zinc-200 transition-all"
                    title="Descarcă DOCX master cu 221 placeholdere"
                    data-testid="download-placeholders-docx"
                  >
                    <Download className="w-3 h-3" />
                    DOCX
                  </a>
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL}/api/placeholders/template.md`}
                    download
                    className="px-2 py-1 rounded-md font-mono text-[10px] flex items-center gap-1 bg-white/10 hover:bg-white/25 text-zinc-200 transition-all"
                    title="Descarcă catalogul Markdown"
                    data-testid="download-placeholders-md"
                  >
                    <Code2 className="w-3 h-3" />
                    MD
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* V12.1 — Banner "Pagina în dezvoltare" (transparență publică) */}
      <div className="mb-6 border-l-4 border-amber-400 bg-amber-50/80 rounded-r-lg px-4 py-3 flex items-start gap-3" data-testid="gas-page-in-development-notice">
        <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">i</div>
        <div className="text-xs leading-relaxed text-amber-900">
          <strong className="font-semibold">Pagină în dezvoltare</strong> — secțiuni funcționale disponibile pentru testare publică:
          <em className="not-italic font-semibold ml-1">„proiectare branșamente gaze naturale, extinderi de conductă și instalații de utilizare"</em>.
          Restul funcționalităților (parteneri, colaborări, integrare QES eIDAS, ștampile autorizate avansate) sunt în lucru activ.
          Acces fără cont este permis pentru vizualizare; pentru export DOCX/PDF este nevoie de un plan plătit.
        </div>
      </div>

      {/* V12.5 — Banner reprezentativ industrie gaze naturale */}
      <GasIndustryBanner
        subsectionLabel={(GAS_SUBSECTIONS.find(s => s.id === data.tip_lucrare)?.label) || 'Studio Gaze Naturale'}
        subtitle={(GAS_SUBSECTIONS.find(s => s.id === data.tip_lucrare)?.description) || 'Documentație tehnică digitală conformă NTPE 89/2018 & Legea 123/2012'}
      />

      {/* V12.5 — Selector subsecțiune (dropdown) */}
      <GasSubsectionSelector
        value={data.tip_lucrare || 'bransament'}
        onChange={(newSub) => setData({ ...data, tip_lucrare: newSub })}
      />

      {/* V12.5 — Entropia workflow (cronologie legală) — auto-adaptă la subsecțiune */}
      <GasEntropiaWorkflow
        subsection={data.tip_lucrare || 'bransament'}
        data={data}
        onStepClick={(step) => {
          // Jumps into the section most relevant to this workflow step
          const map = { avize: 'avize', dtac: 'documente', pth: 'documente', carte_tehnica: 'documente', pt: 'documente' };
          if (map[step.id]) setActiveSection(map[step.id]);
        }}
      />

      {/* V12.3 — Entropia proiectului pe faze (serviciul de completare) */}
      <GasPhaseEntropy data={data} onJumpToPhase={(phaseId) => {
        const map = {
          date_initiale: 'general',
          date_tehnice: 'bransament',
          avize: 'avize',
          materiale: 'materiale',
          documente: 'documente',
          verificare: 'general',
        };
        setActiveSection(map[phaseId] || 'general');
      }} />

      {/* Navigation sidebar + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Section nav */}
        <aside className="space-y-2 lg:sticky lg:top-6 lg:self-start" data-testid="gas-section-nav">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all group ${
                  isActive
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-lg'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50'
                }`}
                data-testid={`section-nav-${s.id}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-950'}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-tight">{s.label}</div>
                    <div className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>{s.desc}</div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-white" />}
                </div>
              </button>
            );
          })}

          {/* Generate doc card */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-950 text-white border border-zinc-800">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">// Finalizare</div>
            <div className="font-bold mb-1 font-display tracking-tight">Generează DOCX master</div>
            <div className="text-[11px] text-zinc-300 mb-3">Conține Referat, Foaie, Memoriu, Breviar, Listă materiale, PV-uri și mai mult — toate într-un singur fișier.</div>
            <button
              onClick={generateMasterDoc}
              disabled={generating}
              className="w-full px-3 py-2 bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-50 rounded-md font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              data-testid="generate-master-doc-btn"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Descarcă proiect complet (.docx)
            </button>
            {lastError && (
              <div className="mt-3 p-2.5 bg-rose-500/20 border border-rose-400/40 rounded-lg text-[11px] text-rose-100" data-testid="generate-error">
                <strong>Eroare:</strong> {lastError}
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="bg-white border border-slate-200 rounded-xl p-6 min-h-[500px]" data-testid="gas-section-content">
          {activeSection === 'general' && (
            <GasGeneralDataSection data={data} onChange={updateData} />
          )}
          {activeSection === 'bransament' && (
            <GasBransamentSection data={data.bransament || {}} onChange={(p) => updateSection('bransament', p)} />
          )}
          {activeSection === 'extindere' && (
            <GasExtindereSection data={data.extindere || {}} onChange={(p) => updateSection('extindere', p)} />
          )}
          {activeSection === 'instalatie' && (
            <GasInstalatieUtilizareSection data={data.instalatie || {}} onChange={(p) => updateSection('instalatie', p)} />
          )}
          {activeSection === 'avize' && (
            <GasAvizeSection avize={data.avize || []} cuLista={data.cu_lista || []} onChange={(p) => updateData(p)} />
          )}
          {activeSection === 'suduri' && (
            <GasSuduriSection data={data} onChange={(d) => setData(d)} />
          )}
          {activeSection === 'pv' && (
            <GasPVSection pv={data.pv || []} onChange={(lst) => updateData({ pv: lst })} />
          )}
          {activeSection === 'materiale' && (
            <GasMaterialsAutoSection data={data} />
          )}
          {activeSection === 'calc' && (
            <GasSmartCalcPanel data={data} />
          )}
          {activeSection === 'documente' && (
            <GasDocumenteSection data={data} />
          )}
        </main>
      </div>

      {/* V12.3 — Mail dispatch (Trimite la Primărie/Diriginte/Contabilitate/OSD/ISC/Poliție) */}
      <GasMailDispatchPanel documents={data._generated_documents || []} />
    </AppShell>
  );
}
