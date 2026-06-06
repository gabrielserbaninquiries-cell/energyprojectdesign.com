import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Github, RefreshCw, Send, Plus, Trash2, ExternalLink, Lock, ShieldAlert, Rocket, FileCode, Download, BookOpen } from 'lucide-react';

const DEFAULT_FILE = { path: '', content: '' };

export default function DeveloperGithub() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [updateSecret, setUpdateSecret] = useState('');
  const [files, setFiles] = useState([{ ...DEFAULT_FILE }]);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [handoff, setHandoff] = useState(null);
  const [handoffBusy, setHandoffBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.is_developer) {
      nav('/dashboard');
      return;
    }
    loadStatus();
  }, [user, nav]);

  async function loadStatus() {
    setLoading(true);
    try {
      const { data } = await api.get('/dev/github/status');
      setStatus(data);
    } catch (e) {
      toast.error('Nu pot citi statusul GitHub. Verifică GITHUB_TOKEN în backend/.env.');
    } finally {
      setLoading(false);
    }
  }

  function addFile() { setFiles([...files, { ...DEFAULT_FILE }]); }
  function removeFile(i) { setFiles(files.filter((_, idx) => idx !== i)); }
  function updateFile(i, key, val) {
    const next = [...files];
    next[i] = { ...next[i], [key]: val };
    setFiles(next);
  }

  async function handlePush() {
    if (!commitMessage.trim()) { toast.error('Adaugă un mesaj de commit.'); return; }
    const validFiles = files.filter(f => f.path.trim() && f.content !== '');
    if (validFiles.length === 0) { toast.error('Adaugă cel puțin un fișier cu cale și conținut.'); return; }
    setBusy(true);
    setLastResult(null);
    try {
      const { data } = await api.post('/dev/github/push', {
        prompt: prompt.trim(),
        commit_message: commitMessage.trim(),
        files: validFiles,
        update_secret: updateSecret.trim() || undefined,
      });
      setLastResult(data);
      toast.success(`${data.files_pushed} fișier(e) push-uite în branch-ul ${data.branch}`);
      await loadStatus();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Push eșuat. Verifică tokenul și secret-ul.');
    } finally {
      setBusy(false);
    }
  }

  async function previewHandoff() {
    setHandoffBusy(true);
    try {
      const { data } = await api.get('/dev/handoff/export');
      setHandoff(data);
      toast.success(`Handoff generat (${data.size_chars.toLocaleString('ro-RO')} caractere).`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Generare handoff eșuată.');
    } finally {
      setHandoffBusy(false);
    }
  }

  function downloadHandoff() {
    if (!handoff) return;
    const blob = new Blob([handoff.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = handoff.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyHandoff() {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff.markdown);
      toast.success('Handoff copiat în clipboard. Lipește-l în chat-ul Emergent nou.');
    } catch {
      toast.error('Clipboard indisponibil. Folosește butonul „Descarcă".');
    }
  }

  async function pushHandoffToRepo() {
    setHandoffBusy(true);
    try {
      const { data } = await api.post('/dev/handoff/push');
      toast.success(`Handoff push-uit (${data.size_chars.toLocaleString('ro-RO')} caractere). ${data.commit_url ? 'Vezi pe GitHub.' : ''}`);
      window.open(data.file_url, '_blank');
      await loadStatus();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Push handoff eșuat.');
    } finally {
      setHandoffBusy(false);
    }
  }

  if (!user?.is_developer) {
    return (
      <AppShell>
        <div className="p-8 max-w-2xl">
          <div className="flex items-center gap-3 text-sm bg-red-50 border border-red-200 p-4">
            <Lock className="w-5 h-5 text-red-700" />
            <span>Acces interzis. Doar contul Developer poate accesa această pagină.</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-6xl" data-testid="dev-github-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3"><Github className="w-9 h-9" /> Push pe GitHub</h1>
            <p className="text-gray-600 mt-2 text-sm">Trimite fișiere direct în branch-ul <code className="bg-black text-[#FFB300] px-1.5">{status?.branch || 'main'}</code> al repo-ului — Render auto-deploy se declanșează în ~30 secunde.</p>
          </div>
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 border border-black px-4 py-2 text-sm hover:bg-black hover:text-[#FFB300] transition-colors"
            data-testid="refresh-status-btn"
          >
            <RefreshCw className="w-4 h-4" /> Reîncarcă status
          </button>
        </div>

        {/* Handoff banner — transfer pe alt cont Emergent */}
        <div className="border-2 border-black bg-black text-[#FFB300] p-5 mb-8" data-testid="handoff-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-bold text-lg">Transfer pe alt cont Emergent</h2>
                <p className="text-xs text-white/80 mt-1 max-w-2xl">
                  Generează un fișier <code className="bg-white/10 px-1">HANDOFF_FOR_NEXT_EMERGENT.md</code> cu starea curentă a proiectului (vision, commits, env keys, next actions). Îl descarci, îl partajezi sau îl lipești într-un chat Emergent nou — celălalt user continuă de aici fără pierderi.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={previewHandoff}
                disabled={handoffBusy}
                className="px-3 py-2 text-xs border border-[#FFB300] hover:bg-[#FFB300] hover:text-black flex items-center gap-1.5 disabled:opacity-50"
                data-testid="handoff-preview-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${handoffBusy ? 'animate-spin' : ''}`} /> Generează preview
              </button>
              <button
                onClick={pushHandoffToRepo}
                disabled={handoffBusy}
                className="px-3 py-2 text-xs bg-[#FFB300] text-black hover:bg-white flex items-center gap-1.5 disabled:opacity-50 font-semibold"
                data-testid="handoff-push-btn"
              >
                <Github className="w-3.5 h-3.5" /> Salvează în GitHub (commit)
              </button>
            </div>
          </div>

          {handoff && (
            <div className="mt-5 bg-white text-black p-4" data-testid="handoff-preview">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                <div className="text-xs">
                  <strong>{handoff.filename}</strong> · {handoff.size_chars.toLocaleString('ro-RO')} caractere
                </div>
                <div className="flex gap-2">
                  <button onClick={copyHandoff} className="px-3 py-1.5 text-xs border border-black hover:bg-black hover:text-[#FFB300] flex items-center gap-1.5" data-testid="handoff-copy-btn">
                    Copiază în clipboard
                  </button>
                  <button onClick={downloadHandoff} className="px-3 py-1.5 text-xs border border-black bg-black text-[#FFB300] hover:bg-white hover:text-black flex items-center gap-1.5" data-testid="handoff-download-btn">
                    <Download className="w-3.5 h-3.5" /> Descarcă .md
                  </button>
                </div>
              </div>
              <pre className="text-[10px] font-mono bg-gray-50 p-3 max-h-72 overflow-auto whitespace-pre-wrap border border-gray-200">{handoff.markdown.slice(0, 4000)}{handoff.markdown.length > 4000 ? '\n\n…(preview trunchiat — descarcă fișierul complet)' : ''}</pre>
            </div>
          )}
        </div>

        {/* Status banner */}
        <div className="bg-white border-2 border-black p-5 mb-8" data-testid="repo-status-card">
          {loading ? (
            <div className="text-sm text-gray-500">Se încarcă status repo…</div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Repo</div>
                <a href={status.repo_url} target="_blank" rel="noreferrer" className="font-semibold text-[#FFB300] hover:underline flex items-center gap-1.5">
                  {status.owner}/{status.repo} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-xs text-gray-500 mt-1">Branch: <code className="bg-gray-100 px-1">{status.branch}</code></div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Ultimul commit</div>
                <a href={status.last_commit_url} target="_blank" rel="noreferrer" className="font-mono text-sm hover:underline flex items-center gap-1.5" data-testid="last-commit-sha">
                  {status.last_commit_sha} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-xs text-gray-500 mt-1 truncate" title={status.last_commit_message}>{status.last_commit_message}</div>
                {status.last_commit_date && (
                  <div className="text-xs text-gray-400 mt-1">{new Date(status.last_commit_date).toLocaleString('ro-RO')}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-600 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> GitHub indisponibil. Verifică <code>GITHUB_TOKEN</code> + <code>GITHUB_OWNER</code> + <code>GITHUB_REPO</code> în <code>backend/.env</code>.</div>
          )}
        </div>

        {/* Push form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Mesaj commit (subiect scurt)</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="feat(api): adaugă endpoint X"
                className="w-full mt-1 px-3 py-2 border border-black text-sm font-mono"
                maxLength={150}
                data-testid="commit-message-input"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Prompt / context (opțional, atașat la commit body)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descrie de ce faci această schimbare..."
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-black text-sm resize-y"
                data-testid="commit-prompt-input"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600">Secret de actualizare (EPD_UPDATE_SECRET din .env)</label>
              <input
                type="password"
                value={updateSecret}
                onChange={(e) => setUpdateSecret(e.target.value)}
                placeholder="Lăsă gol dacă nu ai EPD_UPDATE_SECRET setat"
                className="w-full mt-1 px-3 py-2 border border-black text-sm font-mono"
                data-testid="update-secret-input"
                autoComplete="new-password"
              />
            </div>

            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold flex items-center gap-2"><FileCode className="w-4 h-4" /> Fișiere de modificat ({files.length})</div>
                <button onClick={addFile} className="text-xs flex items-center gap-1.5 border border-black px-3 py-1.5 hover:bg-black hover:text-[#FFB300]" data-testid="add-file-btn">
                  <Plus className="w-3.5 h-3.5" /> Adaugă fișier
                </button>
              </div>

              <div className="space-y-4">
                {files.map((f, i) => (
                  <div key={i} className="border border-gray-300 p-3 bg-gray-50" data-testid={`file-row-${i}`}>
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={f.path}
                        onChange={(e) => updateFile(i, 'path', e.target.value)}
                        placeholder="ex: backend/server.py"
                        className="flex-1 px-2 py-1.5 border border-black text-xs font-mono bg-white"
                        data-testid={`file-path-${i}`}
                      />
                      {files.length > 1 && (
                        <button onClick={() => removeFile(i)} className="px-2 py-1.5 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white" data-testid={`remove-file-${i}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={f.content}
                      onChange={(e) => updateFile(i, 'content', e.target.value)}
                      placeholder="Conținut complet al fișierului…"
                      rows={6}
                      className="w-full mt-2 px-2 py-1.5 border border-black text-xs font-mono bg-white resize-y"
                      data-testid={`file-content-${i}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePush}
              disabled={busy}
              className="w-full bg-black text-[#FFB300] py-3 font-semibold flex items-center justify-center gap-2 hover:bg-[#FFB300] hover:text-black border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="push-btn"
            >
              {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {busy ? 'Se trimite…' : `Trimite ${files.filter(f => f.path).length} fișier(e) → GitHub`}
            </button>
          </div>

          {/* Right column — last result */}
          <div className="space-y-5">
            <div className="bg-[#FFB300] text-black border-2 border-black p-5">
              <h2 className="font-bold flex items-center gap-2 mb-3"><Rocket className="w-5 h-5" /> Cum funcționează</h2>
              <ol className="text-xs space-y-2 list-decimal pl-5">
                <li>Adaugi cale + conținut nou pentru fiecare fișier</li>
                <li>Apeși <strong>Trimite</strong> → commit pe branch-ul <code className="bg-black text-[#FFB300] px-1">{status?.branch || 'main'}</code></li>
                <li>Render detectează push-ul și face <strong>auto-deploy</strong> (~30s)</li>
                <li>Versiunea live se actualizează la <code className="bg-black text-[#FFB300] px-1 break-all">{status ? `${status.repo.toLowerCase()}-services.onrender.com` : 'energy-project-design-services.onrender.com'}</code></li>
              </ol>
            </div>

            {lastResult && (
              <div className="bg-white border-2 border-black p-5" data-testid="last-push-result">
                <h2 className="font-bold flex items-center gap-2 mb-3 text-sm"><Github className="w-4 h-4" /> Ultimul push</h2>
                <div className="text-xs space-y-1.5">
                  <div><strong>Branch:</strong> <code>{lastResult.branch}</code></div>
                  <div><strong>Fișiere:</strong> {lastResult.files_pushed}</div>
                </div>
                <div className="mt-3 space-y-1.5 max-h-72 overflow-y-auto">
                  {lastResult.results?.map((r, i) => (
                    <a
                      key={i}
                      href={r.commit_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs border border-gray-200 p-2 hover:border-black hover:bg-gray-50"
                    >
                      <div className="font-mono truncate">{r.path}</div>
                      <div className="text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <span className={r.operation === 'created' ? 'text-green-700' : 'text-blue-700'}>{r.operation}</span>
                        <span className="font-mono">{r.commit_sha?.slice(0, 7)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
                <a
                  href={lastResult.compare_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs mt-3 border border-black py-2 hover:bg-black hover:text-[#FFB300]"
                  data-testid="view-on-github-btn"
                >
                  Vezi pe GitHub ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
