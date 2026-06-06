import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Wrench, ShieldAlert, Sparkles } from 'lucide-react';
import DeveloperAccessDenied from '../components/developer/DeveloperAccessDenied';
import DeveloperResultPanel from '../components/developer/DeveloperResultPanel';
import DeveloperSidebar from '../components/developer/DeveloperSidebar';

export default function Developer() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('Diagnostic complet al aplicației.');
  const [openaiKey, setOpenaiKey] = useState('');
  const [useExternal, setUseExternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [safetyRules, setSafetyRules] = useState([]);

  useEffect(() => {
    if (!user?.is_developer) return;
    api.get('/dev/safety-rules')
      .then(({ data }) => setSafetyRules(data.rules || []))
      .catch(() => {});
  }, [user]);

  if (!user) return null;
  if (!user.is_developer) return <DeveloperAccessDenied />;

  const run = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const payload = { prompt };
      if (useExternal && openaiKey.trim()) payload.openai_api_key = openaiKey.trim();
      const { data } = await api.post('/dev/plan', payload);
      setResult(data);
      toast.success('Plan generat');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="AI Developer" subtitle="Plan Mode controlat — Apply Mode necesită confirmare umană">
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-4 mb-6 flex items-start gap-3" data-testid="dev-safety">
        <ShieldAlert className="w-5 h-5 text-[#92400E] mt-0.5" />
        <div className="text-sm text-[#92400E]">
          <strong>Mod sigur Plan Mode.</strong> Acest panel NU modifică fișiere și NU execută cod automat.
          Generează doar diagnostic + plan + checklist de validare pentru ca dvs. (sau un agent extern:
          Claude / Emergent / OpenAI Codex / ChatGPT) să aplice modificările manual cu confirmare umană.
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prompt panel */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-black text-[#FFB300] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Prompt dezvoltare</div>
              <div className="text-xs text-gray-500">
                Descrieți ce funcție vreți să adăugați, ce bug vreți să corectați sau ce industrie nouă vreți să activați.
              </div>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30 mono"
            placeholder="ex: Adaugă industria 'electrical_engineering' cu subdomeniul 'bransamente electrice'"
            data-testid="dev-prompt"
          />

          <div className="mt-4 bg-[#F9FAFB] border border-gray-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <input
                type="checkbox"
                checked={useExternal}
                onChange={(e) => setUseExternal(e.target.checked)}
                className="accent-[#FFB300]"
                data-testid="use-external"
              />
              <Sparkles className="w-4 h-4 text-[#FFB300]" />
              Folosește OpenAI (bring-your-own-key) pentru enriched plan
            </label>
            {useExternal && (
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full border border-gray-300 px-3 py-2 text-xs rounded-sm mono"
                data-testid="openai-key-input"
              />
            )}
            <div className="text-[10px] text-gray-500 mt-2">
              Cheia nu este stocată — folosită doar pentru acest apel. Compatibil cu OpenAI Codex, ChatGPT API, gpt-4o-mini.
            </div>
          </div>

          <button onClick={run} disabled={busy} className="amber-btn w-full mt-4 disabled:opacity-50" data-testid="dev-plan-btn">
            {busy ? 'Se generează plan...' : 'Generează plan de implementare'}
          </button>

          <DeveloperResultPanel result={result} />
        </div>

        <DeveloperSidebar safetyRules={safetyRules} result={result} />
      </div>
    </AppShell>
  );
}
