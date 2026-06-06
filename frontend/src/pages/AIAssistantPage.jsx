import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, Send, History } from 'lucide-react';

const SAMPLE_COMMANDS = [
  'completează date proiect',
  'rulează calcul inteligent',
  'generează memoriu tehnic',
  'scanează placeholder',
  'adaugă ștampilă VGD',
  'pregătește email către OSD',
  'certifică semnătură RTE',
  'verifică documentația',
  'alege plan VGD',
  'cumpără plan societate',
  'rulează audit',
  'fă self update',
];

export default function AIAssistantPage() {
  const [message, setMessage] = useState('');
  const [packet, setPacket] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const send = async (msg) => {
    const text = msg ?? message;
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { data } = await api.post('/ai/parse', { message: text });
      setPacket(data);
      setHistory((h) => [{ message: text, packet: data, at: new Date().toISOString() }, ...h].slice(0, 10));
      if (msg) setMessage('');
    } catch (e) { toast.error('Eroare AI'); }
    finally { setBusy(false); }
  };

  const applyAction = () => {
    if (!packet?.target_page) return;
    toast.success(`Navighez la ${packet.target_page}`);
    nav(packet.target_page);
  };

  return (
    <AppShell title="AI Assistant" subtitle="Interpretare comenzi operaționale — contract logic deterministic">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prompt + result */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FFB300] text-black flex items-center justify-center"><Sparkles className="w-5 h-5" /></div>
              <div>
                <div className="font-semibold">Prompt</div>
                <div className="text-xs text-gray-500">Scrieți o comandă în limba română. AI Assistant detectează intenția, pagina țintă și acțiunea recomandată.</div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="ex: verifică documentația"
                className="flex-1 border border-gray-300 px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
                data-testid="ai-prompt-input"
              />
              <button onClick={() => send()} disabled={busy} className="amber-btn disabled:opacity-50" data-testid="ai-send-btn">
                <Send className="w-4 h-4" /> {busy ? '...' : 'Interpretează'}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {SAMPLE_COMMANDS.map((c) => (
                <button key={c} onClick={() => send(c)} className="text-[11px] px-2 py-1 border border-gray-200 hover:border-[#FFB300] hover:bg-[#FFB300]/10 rounded-sm transition-colors" data-testid={`sample-${c.replace(/\s+/g, '-')}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {packet && (
            <div className="bg-white border border-gray-200 p-6" data-testid="ai-packet">
              <div className="label mb-3">// Command packet</div>
              {packet.intent ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Intenție</div>
                      <div className="font-semibold mono text-sm">{packet.intent}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Pagină țintă</div>
                      <div className="font-semibold mono text-sm">{packet.target_page}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Acțiune</div>
                      <div className="font-medium text-sm">{packet.action}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500">Încredere</div>
                      <div className="font-medium text-sm">{Math.round((packet.confidence || 0) * 100)}%</div>
                    </div>
                  </div>
                  {packet.matched_keywords?.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Cuvinte cheie detectate</div>
                      <div className="flex flex-wrap gap-1">
                        {packet.matched_keywords.map(k => <span key={k} className="mono text-[10px] bg-gray-100 px-1.5 py-0.5">{k}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="bg-[#F9FAFB] border-l-2 border-[#FFB300] p-3 text-sm mb-4">{packet.preview}</div>
                  <button onClick={applyAction} className="amber-btn" data-testid="ai-apply-btn">Aplică — Deschide pagina <ArrowRight className="w-4 h-4" /></button>
                </>
              ) : (
                <div className="text-sm text-gray-600">{packet.preview}</div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-white border border-gray-200 p-6 self-start">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4" />
            <span className="label">// Istoric</span>
          </div>
          {history.length === 0 ? (
            <div className="text-xs text-gray-500">Niciun mesaj încă.</div>
          ) : (
            <ul className="space-y-3 text-sm">
              {history.map((h) => (
                <li key={h.at} className="border-b border-gray-100 pb-2 last:border-0">
                  <div className="font-medium text-sm truncate">{h.message}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {h.packet.intent ? <span className="mono">{h.packet.intent}</span> : <span className="text-gray-400">necunoscut</span>}
                    <span className="ml-2">{new Date(h.at).toLocaleTimeString('ro-RO')}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
