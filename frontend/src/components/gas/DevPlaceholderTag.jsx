/**
 * V11.5 — Developer-only placeholder tag overlay.
 *
 * Displays `{{key}}` as a small purple badge above input fields ONLY when:
 * 1. The current user is_developer === true (per AuthContext)
 * 2. The DevModeContext flag is on (toggled from Gas Studio header)
 *
 * Usage:
 *   <DevPlaceholderTag pkey="beneficiar_nume" />
 *   <DevPlaceholderTag pkey="br_diametru_dn" formula="auto via debit" />
 */
import { useAuth } from '../../contexts/AuthContext';
import { useDevMode } from '../../contexts/DevModeContext';
import { Copy } from 'lucide-react';
import { useState } from 'react';

export default function DevPlaceholderTag({ pkey, formula, compact = false }) {
  const { user } = useAuth();
  const { devMode } = useDevMode();
  const [copied, setCopied] = useState(false);

  if (!user?.is_developer || !devMode || !pkey) return null;

  const fullTag = `{{${pkey}}}`;

  const onCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(fullTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (_) {
      // ignore — clipboard might be blocked in iframe
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-tight rounded px-1.5 py-0.5 mb-1 border transition-all ${
        copied
          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
          : 'bg-violet-100 hover:bg-violet-200 text-violet-700 border-violet-300 hover:border-violet-500'
      } ${compact ? 'text-[9px] px-1 py-0' : ''}`}
      title={`Click pentru copiere placeholder${formula ? ` (formulă: ${formula})` : ''}`}
      data-testid={`dev-placeholder-${pkey}`}
    >
      {copied ? '✓ copiat!' : fullTag}
      {!copied && <Copy className="w-2.5 h-2.5 opacity-60" />}
    </button>
  );
}
