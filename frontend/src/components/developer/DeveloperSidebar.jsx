import { ExternalLink } from 'lucide-react';

function MissingFlag({ active }) {
  return <span className={active ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{active ? 'lipsă' : 'OK'}</span>;
}

export default function DeveloperSidebar({ safetyRules, result }) {
  const has = (kw) => (result?.diagnostic?.missing_capabilities || []).some(m => m.includes(kw));
  return (
    <div className="space-y-4 self-start" data-testid="dev-sidebar">
      <div className="bg-white border border-gray-200 p-5">
        <div className="label mb-3">// Reguli de siguranță</div>
        <ul className="text-xs space-y-2 text-gray-700">
          {(safetyRules || []).map((r, i) => (
            <li key={`rule-${i}-${r.slice(0, 30)}`} className="flex items-start gap-2">
              <span className="text-[#FFB300] mono">{String(i + 1).padStart(2, '0')}.</span>{r}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-black text-white p-5">
        <div className="label text-[#FFB300] mb-3">// Handoff către alt AI</div>
        <p className="text-xs text-gray-300 mb-3">Acest cod poate fi continuat oricând cu:</p>
        <ul className="text-xs space-y-1.5">
          <li>• Emergent (acest agent, E1)</li>
          <li>• Anthropic Claude (Sonnet, Opus)</li>
          <li>• OpenAI ChatGPT / GPT-4o</li>
          <li>• OpenAI Codex / Copilot</li>
        </ul>
        <p className="text-[10px] text-gray-400 mt-3">
          Tot codul este în <code className="text-[#FFB300]">/app</code>. PRD-ul în <code className="text-[#FFB300]">/app/memory/PRD.md</code>.
        </p>
        <a href="https://platform.openai.com" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-[#FFB300] hover:underline">
          OpenAI Platform <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-white border border-gray-200 p-5">
        <div className="label mb-3">// Status repo</div>
        {result?.diagnostic ? (
          <ul className="text-xs space-y-1.5">
            <li className="flex justify-between"><span>Stripe live key</span><MissingFlag active={has('Stripe')} /></li>
            <li className="flex justify-between"><span>QES credențiale</span><MissingFlag active={has('QES')} /></li>
            <li className="flex justify-between"><span>Gmail user</span><MissingFlag active={has('Gmail')} /></li>
            <li className="flex justify-between"><span>System templates</span><span className="text-[#16A34A]">OK</span></li>
          </ul>
        ) : (
          <div className="text-xs text-gray-500">Rulați un plan pentru diagnostic.</div>
        )}
      </div>
    </div>
  );
}
