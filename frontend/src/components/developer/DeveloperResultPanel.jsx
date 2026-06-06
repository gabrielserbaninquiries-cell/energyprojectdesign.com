export default function DeveloperResultPanel({ result }) {
  if (!result) return null;
  const missing = result.diagnostic?.missing_capabilities || [];
  return (
    <div className="mt-6 space-y-4" data-testid="dev-result">
      <section>
        <div className="label mb-2">// Diagnostic</div>
        {missing.length === 0 ? (
          <div className="text-sm text-[#16A34A]">Nicio capabilitate critică lipsă.</div>
        ) : (
          <ul className="text-sm space-y-1">
            {missing.map((m, i) => <li key={i} className="text-[#DC2626]">• {m}</li>)}
          </ul>
        )}
      </section>

      <section>
        <div className="label mb-2">// Pași propuși</div>
        <ol className="text-sm space-y-1 list-decimal pl-5 text-gray-700">
          {(result.proposed_steps || []).map((s, i) => <li key={`step-${i}-${s.slice(0, 30)}`}>{s}</li>)}
        </ol>
      </section>

      {result.external_llm_advice && (
        <section>
          <div className="label mb-2 text-[#FFB300]">// Sfat OpenAI (extern)</div>
          <div className="bg-[#F9FAFB] border-l-2 border-[#FFB300] p-3 text-sm whitespace-pre-wrap font-mono text-xs">
            {result.external_llm_advice}
          </div>
        </section>
      )}

      <section>
        <div className="label mb-2">// Checklist validare</div>
        <ul className="text-sm space-y-1">
          {(result.validation_checklist || []).map((v, i) => (
            <li key={`val-${i}-${v.slice(0, 30)}`} className="flex items-start gap-2">
              <span className="text-gray-400">[ ]</span>{v}
            </li>
          ))}
        </ul>
      </section>

      <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-3 text-xs text-[#92400E]">
        <strong>Apply Mode separat.</strong> Pentru a aplica acești pași, transmiteți planul de mai sus
        către agentul principal (Emergent E1, Claude, OpenAI Codex sau ChatGPT) împreună cu confirmarea umană.
      </div>
    </div>
  );
}
