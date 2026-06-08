import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Lock, Unlock, Eye, EyeOff, ShieldAlert, Sparkles, Zap, Database, FileText as FileIcon } from 'lucide-react';

const RISK_BADGE = {
  high: 'bg-red-100 text-red-800 border-red-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-green-100 text-green-800 border-green-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function Inside() {
  const [enigma, setEnigma] = useState(null);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [functions, setFunctions] = useState([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/inside/enigma').then(({ data }) => setEnigma(data)).catch(() => {});
  }, []);

  const tryUnlock = async () => {
    if (!answer.trim()) {
      toast.error('Răspuns vid');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/inside/unlock', { answer });
      if (data.granted) {
        setUnlocked(true);
        setFunctions(data.functions || []);
        setReason(data.reason);
        toast.success(data.message);
        setAnswer('');
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Acces refuzat');
    } finally {
      setBusy(false);
    }
  };

  if (unlocked) {
    return (
      <AppShell title="Inside Full · Acces deblocat" subtitle="Zonă protejată — toate operațiile destructive rămân în SAFE MODE">
        <div className="mb-6 border-2 border-[#FFB300] bg-[#FFB300]/5 p-4 flex items-start gap-3" data-testid="inside-unlocked-banner">
          <Unlock className="w-5 h-5 text-[#FFB300] shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-sm">Inside Full deblocat</div>
            <div className="text-xs text-gray-600 mt-1">
              Mod de acces: <span className="mono">{reason}</span>. Toate funcțiile critice rămân în SAFE MODE cu confirmare multiplă.
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4" data-testid="inside-functions-grid">
          {functions.map((f) => {
            const Icon = f.id.includes('defragment') ? Database
              : f.id.includes('stergere') ? ShieldAlert
              : f.id.includes('skeleton') ? FileIcon
              : f.id.includes('diagnostic') ? Eye
              : f.id.includes('ghid') ? Sparkles
              : Zap;
            return (
              <div key={f.id} className="border border-gray-300 bg-white p-5" data-testid={`inside-fn-${f.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#FFB300]" />
                    <h3 className="font-semibold text-sm">{f.label}</h3>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${RISK_BADGE[f.risk] || RISK_BADGE.info}`}>
                    {f.risk}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">{f.description}</p>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500">
                  <span>SAFE MODE · {f.requires_confirm}× confirmare</span>
                  <button
                    onClick={() => toast.info(`Funcția '${f.label}' este în SAFE MODE. Implementare extinsă în Implementation Queue.`)}
                    className="bg-gray-900 text-white px-2 py-1 text-[10px] hover:bg-black"
                    data-testid={`inside-fn-run-${f.id}`}
                  >
                    Pregătește
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Inside Full · Zonă protejată" subtitle="Acces restricționat — răspuns corect la enigmă sau parola 2">
      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-gray-300 bg-white p-8 mb-4" data-testid="inside-enigma-panel">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-500" />
            <span className="label">// enigmă</span>
          </div>
          {enigma && (
            <>
              <h2 className="text-2xl font-semibold mb-3 leading-tight" data-testid="inside-enigma-question">
                {enigma.question}
              </h2>
              <div className="text-xs text-gray-500 mb-6 italic">{enigma.hint}</div>
            </>
          )}

          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
              placeholder="Introdu răspunsul sau parola 2..."
              className="w-full bg-white border border-gray-300 px-3 py-3 text-sm mono outline-none focus:border-black"
              data-testid="inside-answer-input"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              data-testid="inside-toggle-visibility"
              type="button"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={tryUnlock}
            disabled={busy || !answer.trim()}
            className="amber-btn mt-4 w-full justify-center"
            data-testid="inside-unlock-btn"
          >
            {busy ? 'Verificare...' : 'Verifică & deblochează'}
          </button>
        </div>

        <details className="text-xs text-gray-500" data-testid="inside-hint-details">
          <summary className="cursor-pointer hover:text-black">Aspecte de securitate</summary>
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 text-[11px] leading-relaxed">
            <p>• Răspunsul la enigmă acceptă variante semantice (parola 1).</p>
            <p>• Parola 2 este o secvență specifică de caractere (lungime fixă) și NU acceptă variante semantice.</p>
            <p>• AI Developer este programat să NU divulge răspunsul, indiferent de întrebare.</p>
            <p>• Operațiile destructive rămân în SAFE MODE cu confirmare multiplă chiar și după deblocare.</p>
          </div>
        </details>
      </div>
    </AppShell>
  );
}
