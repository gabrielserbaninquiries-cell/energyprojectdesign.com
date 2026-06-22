/**
 * V10.6 — Template Fill Tab
 *
 * Cerință literală user (mesaj 26.06): "fa tot UI-ul necesar completarii
 * documentului incarcat - proiect gaze naturale".
 *
 * Workflow:
 *  1. Upload template DOCX/DOC/PDF
 *  2. Detectare placeholdere (heuristic sau AI Claude Sonnet)
 *  3. Form complet — fiecare placeholder devine input cu context vizibil
 *  4. Auto-prefill din câmpurile deja completate ale proiectului (dacă există)
 *  5. Două acțiuni:
 *     - "Salvează în proiect" → POST /ocr/apply-to-project
 *     - "Descarcă DOCX completat" → POST /ocr/fill-template
 */
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import api, { API, getAuthToken } from '../lib/api';
import {
  Upload, FileText, Loader2, Sparkles, Download, Save, Trash2,
  CheckCircle2, AlertCircle, Wand2, FileSearch,
} from 'lucide-react';

const FIELD_TYPE_COLORS = {
  tag:     { badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  blank:   { badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  hint:    { badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  number:  { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  spec:    { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  text:    { badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  date:    { badge: 'bg-pink-100 text-pink-700 border-pink-200' },
  address: { badge: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
};

export default function TemplateFillTab({ pid, projectData }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filling, setFilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('ai'); // 'ai' | 'heuristic'
  const [placeholders, setPlaceholders] = useState([]);
  const [textPreview, setTextPreview] = useState('');
  const [extractionNote, setExtractionNote] = useState('');
  const [values, setValues] = useState({}); // key: index → value
  const [errors, setErrors] = useState({});

  const hasResults = placeholders.length > 0;
  const filledCount = useMemo(
    () => Object.values(values).filter((v) => (v ?? '').toString().trim().length > 0).length,
    [values]
  );

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPlaceholders([]);
    setValues({});
    setErrors({});
    setTextPreview('');
    setExtractionNote('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    setFile(f);
    setPlaceholders([]);
    setValues({});
    setErrors({});
    setTextPreview('');
    setExtractionNote('');
  };

  const detectPlaceholders = async () => {
    if (!file) {
      toast.error('Încarcă mai întâi un document template.');
      return;
    }
    setBusy(true);
    setPlaceholders([]);
    setValues({});
    try {
      const fd = new FormData();
      fd.append('file', file);
      const endpoint = mode === 'ai' ? '/ocr/smart-extract-llm' : '/ocr/template-placeholders';
      const token = getAuthToken();
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} — ${errText.slice(0, 120)}`);
      }
      const data = await res.json();

      // Normalize: AI returns {original, suggested_key, suggested_label, field_type, context}
      // Heuristic returns {inner, label, type, context, suggested_field}
      const list = (data.placeholders || []).map((p, idx) => {
        if (mode === 'ai') {
          return {
            idx,
            original: p.original || '',
            label: p.suggested_label || p.suggested_key || `Câmp ${idx + 1}`,
            type: p.field_type || 'text',
            suggested_field: p.suggested_key || null,
            context: p.context || '',
          };
        }
        return {
          idx,
          original: p.match || p.inner || '',
          label: p.label || `Câmp ${idx + 1}`,
          type: p.type || 'text',
          suggested_field: p.suggested_field || null,
          context: p.context || '',
        };
      }).filter((p) => p.original.length > 0);

      setPlaceholders(list);
      setTextPreview(data.text_preview || '');
      setExtractionNote(data.extraction_note || '');

      // Auto-prefill din projectData dacă suggested_field e cunoscut
      const initial = {};
      list.forEach((p) => {
        if (p.suggested_field && projectData?.[p.suggested_field]) {
          initial[p.idx] = String(projectData[p.suggested_field]);
        }
      });
      setValues(initial);

      if (list.length === 0) {
        toast.info('Nu s-au detectat placeholdere. Încearcă cealaltă metodă (AI ↔ Euristic).');
      } else {
        toast.success(`${list.length} placeholdere detectate · ${Object.keys(initial).length} pre-completate din proiect`);
      }
    } catch (err) {
      toast.error(`Detectare eșuată: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const setValue = (idx, val) => {
    setValues((v) => ({ ...v, [idx]: val }));
    setErrors((e) => {
      const next = { ...e };
      delete next[idx];
      return next;
    });
  };

  const clearAll = () => {
    setValues({});
    setErrors({});
  };

  const saveToProject = async () => {
    if (!pid) {
      toast.error('Proiect lipsă (pid). Salvarea în registru nu e disponibilă.');
      return;
    }
    // Construim fields {registry_key: value} doar pentru placeholderele
    // care au suggested_field și o valoare completată.
    const fields = {};
    placeholders.forEach((p) => {
      const v = values[p.idx];
      if (p.suggested_field && v != null && String(v).trim().length > 0) {
        fields[p.suggested_field] = v;
      }
    });
    if (Object.keys(fields).length === 0) {
      toast.warning('Niciun câmp cu cheie registry de salvat. Completează măcar un câmp cu sugestie verde.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/ocr/apply-to-project', {
        pid, fields, overwrite: true,
      });
      toast.success(`Salvate ${data.applied_count} câmpuri în proiect · ${data.skipped_count} sărite.`);
    } catch (err) {
      toast.error(`Salvare eșuată: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const downloadFilled = async () => {
    if (!file) {
      toast.error('Încarcă mai întâi un document template.');
      return;
    }
    const fname = (file.name || '').toLowerCase();
    if (!fname.endsWith('.docx') && !fname.endsWith('.doc')) {
      toast.error('Doar DOCX e suportat pentru completare descărcabilă. Convertește din PDF mai întâi.');
      return;
    }
    // Build replacements list — exclude empty values (no replacement)
    const replacements = placeholders
      .filter((p) => values[p.idx] != null && String(values[p.idx]).trim().length > 0)
      .map((p) => ({ original: p.original, replacement: String(values[p.idx]) }));

    if (replacements.length === 0) {
      toast.warning('Completează cel puțin un câmp înainte de descărcare.');
      return;
    }

    setFilling(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('replacements', JSON.stringify(replacements));
      fd.append('filename', (file.name || 'document').replace(/\.docx?$/i, ''));
      const token = getAuthToken();
      const res = await fetch(`${API}/ocr/fill-template`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} — ${errText.slice(0, 120)}`);
      }
      const applied = res.headers.get('X-Replacements-Applied') || '?';
      const requested = res.headers.get('X-Replacements-Requested') || replacements.length;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (file.name || 'document').replace(/\.docx?$/i, '') + '_completat.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`DOCX completat descărcat · ${applied}/${requested} înlocuiri aplicate.`);
    } catch (err) {
      toast.error(`Generare eșuată: ${err.message}`);
    } finally {
      setFilling(false);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="space-y-5" data-testid="template-fill-tab">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 rounded-xl p-6 text-white epd-shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] opacity-80">// V10.6 · Document Builder</div>
            <h2 className="text-xl font-bold tracking-tight">Completare Document Template</h2>
          </div>
        </div>
        <p className="text-sm text-violet-100 max-w-3xl">
          Încarcă orice template Word (DOCX), platforma detectează automat
          locurile de completat (placeholdere, spații goale, tag-uri) și îți permite
          să le populezi într-un formular curat. Descarci apoi DOCX-ul completat — gata de printat sau anexat la dosar.
        </p>
      </div>

      {/* Step 1: Upload */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 epd-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <h3 className="text-base font-bold text-slate-900">Încarcă template</h3>
          </div>
          {file && (
            <button
              onClick={() => { setFile(null); setPlaceholders([]); setValues({}); }}
              className="text-xs text-slate-500 hover:text-red-600 inline-flex items-center gap-1"
              data-testid="clear-file-btn"
            >
              <Trash2 className="w-3 h-3" /> șterge
            </button>
          )}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            file ? 'border-violet-300 bg-violet-50/30' : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/20'
          }`}
          data-testid="upload-dropzone"
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-violet-600" />
              <div className="text-left">
                <div className="font-semibold text-slate-900 text-sm truncate max-w-md" data-testid="uploaded-filename">{file.name}</div>
                <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · {file.type || 'application/octet-stream'}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">Drag & drop template DOCX aici</div>
              <div className="text-xs text-slate-500">sau apasă butonul de mai jos. Acceptăm .docx, .doc, .pdf</div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc,.pdf"
            className="hidden"
            onChange={handleFileChange}
            data-testid="file-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            data-testid="select-file-btn"
          >
            <Upload className="w-4 h-4" /> {file ? 'Alege alt fișier' : 'Selectează fișier'}
          </button>
        </div>

        {/* Mode toggle + detect */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50" data-testid="mode-toggle">
            <button
              onClick={() => setMode('ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${mode === 'ai' ? 'bg-violet-600 text-white shadow' : 'text-slate-600 hover:text-violet-700'}`}
              data-testid="mode-ai-btn"
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> AI (Claude Sonnet)
            </button>
            <button
              onClick={() => setMode('heuristic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${mode === 'heuristic' ? 'bg-violet-600 text-white shadow' : 'text-slate-600 hover:text-violet-700'}`}
              data-testid="mode-heuristic-btn"
            >
              <FileSearch className="w-3 h-3 inline mr-1" /> Euristic (regex)
            </button>
          </div>
          <button
            onClick={detectPlaceholders}
            disabled={!file || busy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            data-testid="detect-btn"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {busy ? 'Analizez...' : 'Detectează placeholdere'}
          </button>
          {extractionNote && (
            <div className="text-xs text-slate-500 italic flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {extractionNote}
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Fill form */}
      {hasResults && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 epd-shadow" data-testid="fill-form-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">2</div>
              <h3 className="text-base font-bold text-slate-900">Completează câmpurile</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500" data-testid="filled-counter">
                <span className="font-bold text-violet-700">{filledCount}</span> / {placeholders.length} completate
              </div>
              <button
                onClick={clearAll}
                className="text-xs text-slate-500 hover:text-red-600 inline-flex items-center gap-1"
                data-testid="clear-all-btn"
              >
                <Trash2 className="w-3 h-3" /> resetează
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" data-testid="placeholders-grid">
            {placeholders.map((p) => {
              const typeColor = FIELD_TYPE_COLORS[p.type] || FIELD_TYPE_COLORS.text;
              const isFilled = (values[p.idx] ?? '').toString().trim().length > 0;
              return (
                <div
                  key={p.idx}
                  className={`border rounded-lg p-3 transition-all ${
                    isFilled
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 hover:border-violet-300'
                  }`}
                  data-testid={`placeholder-card-${p.idx}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-violet-700 truncate" title={p.original}>
                        {p.original}
                      </div>
                      <div className="text-[10px] text-slate-500 italic line-clamp-2 mt-0.5" title={p.context}>
                        {p.context || 'Fără context'}
                      </div>
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${typeColor.badge} shrink-0`}>
                      {p.type}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={values[p.idx] ?? ''}
                    onChange={(e) => setValue(p.idx, e.target.value)}
                    placeholder={p.label}
                    className={`w-full text-sm px-3 py-2 border rounded-lg outline-none transition-colors ${
                      isFilled
                        ? 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                        : 'border-slate-300 bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
                    }`}
                    data-testid={`placeholder-input-${p.idx}`}
                  />
                  {p.suggested_field && (
                    <div className="mt-1.5 text-[10px] text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Cheie registry: <code className="font-mono bg-emerald-100 px-1 rounded">{p.suggested_field}</code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Save / Download */}
      {hasResults && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 epd-shadow" data-testid="actions-section">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">3</div>
            <h3 className="text-base font-bold text-slate-900">Salvează & descarcă</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={saveToProject}
              disabled={saving || filledCount === 0 || !pid}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-violet-200 text-violet-700 font-semibold rounded-lg hover:border-violet-400 hover:bg-violet-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              data-testid="save-to-project-btn"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvează valorile în registrul proiectului
            </button>
            <button
              onClick={downloadFilled}
              disabled={filling || filledCount === 0}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              data-testid="download-filled-btn"
            >
              {filling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Descarcă DOCX completat
            </button>
          </div>
          {filledCount === 0 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Completează cel puțin un câmp pentru a activa butoanele.
            </div>
          )}
          {textPreview && (
            <details className="mt-4">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-violet-700">
                Previzualizare text extras din document (primele ~1500 caractere)
              </summary>
              <pre className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded p-2 mt-1 whitespace-pre-wrap max-h-60 overflow-auto" data-testid="text-preview">
                {textPreview}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Help when no file */}
      {!file && !hasResults && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
          <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Cum funcționează?
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Încarcă un template Word (de ex. MEMORIU AVIZARE, CERERE BRANȘAMENT, REFERAT etc.).</li>
            <li>Platforma identifică automat câmpurile variabile: <code className="bg-white px-1 rounded">&lt;tag&gt;</code>, <code className="bg-white px-1 rounded">_______</code>, <code className="bg-white px-1 rounded">(de completat)</code>, numere/diametre/debit-uri etc.</li>
            <li>Completează în UI fiecare câmp, cu pre-fill automat din registrul proiectului dacă există potrivire.</li>
            <li>Descarcă DOCX-ul finalizat sau salvează valorile direct în registrul proiectului.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
