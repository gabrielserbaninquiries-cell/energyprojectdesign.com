import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal, Loader2, Command } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

/**
 * CommandBar — bara de comandă type+Enter conform spec literală:
 *   - AI User: vizibilă pentru toți utilizatorii autentificați
 *   - AI Developer: vizibilă DOAR pentru developer/admin (variant="developer")
 *
 * Surse: prompt 2.docx — "adauga sus in pagina, o bara de search tip type + enter&run commands"
 */
export default function CommandBar({ variant = 'user', isDeveloper = false }) {
  const [cmd, setCmd] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const isDev = variant === 'developer';
  if (isDev && !isDeveloper) return null;

  const placeholder = isDev
    ? '⌘ Developer · "rulează self-check", "open queue", "inside", "skeleton telecom"...'
    : '⌘ Comandă · "generează document", "arată planuri", "verifică documentația"...';

  const run = async () => {
    const c = cmd.trim();
    if (!c || busy) return;
    setBusy(true);
    try {
      const { data } = await api.post('/command-bar/interpret', { command: c, role: isDev ? 'developer' : 'user' });
      if (!data.matched) {
        toast.error(data.message || 'Comandă nerecunoscută');
      } else {
        const primary = data.primary;
        toast.success(`→ ${primary.description}`);
        if (primary.target_route) {
          nav(primary.target_route);
        }
        setCmd('');
      }
    } catch (e) {
      toast.error('Eroare interpretare comandă');
    } finally {
      setBusy(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  };

  return (
    <div className={`relative flex items-center ${isDev ? 'border-2 border-[#FFB300]' : 'border border-gray-300'} bg-white`} data-testid={`command-bar-${variant}`}>
      <div className="px-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 border-r border-gray-200 h-full">
        {isDev ? <Terminal className="w-3 h-3 text-[#FFB300]" /> : <Search className="w-3 h-3" />}
        <span className="hidden xl:inline mono">{isDev ? 'DEV' : 'CMD'}</span>
      </div>
      <input
        type="text"
        value={cmd}
        onChange={(e) => setCmd(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="flex-1 min-w-[220px] xl:min-w-[360px] px-3 py-1.5 text-xs outline-none mono"
        data-testid={`command-bar-input-${variant}`}
        disabled={busy}
      />
      <button
        onClick={run}
        disabled={busy || !cmd.trim()}
        className={`px-2.5 h-full ${isDev ? 'bg-[#FFB300] text-black' : 'bg-black text-white'} text-xs disabled:opacity-50 inline-flex items-center gap-1`}
        data-testid={`command-bar-run-${variant}`}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Command className="w-3 h-3" />}
        Run
      </button>
    </div>
  );
}
