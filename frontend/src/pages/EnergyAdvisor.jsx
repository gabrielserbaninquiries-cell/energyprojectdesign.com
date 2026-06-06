import { useEffect, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Bot, Send, Plus, Trash2, MessageCircle, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

const SUGGESTIONS_RO = [
  'Cum dimensionez o conductă de gaze naturale PE 100 SDR 11 pentru 30 mc/h la 4 bar?',
  'Ce documente cer la ATR pentru un branșament electric de 22 kW?',
  'Care sunt distanțele minime de pozare conductă gaz subteran față de cablu electric?',
  'Cum calculez factorul de simultaneitate pentru 12 apartamente?',
  'Ce probe se fac la recepția unei instalații de gaze naturale?',
  'Cum redactez un memoriu tehnic conform NTPEE 2008?',
];

export default function EnergyAdvisor() {
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef(null);

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/chatbot/sessions');
      setSessions(data || []);
    } catch { /* silent */ }
  };

  const loadSession = async (sid) => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get(`/chatbot/sessions/${sid}`);
      setActiveId(sid);
      setMessages(data.messages || []);
    } catch { toast.error('Nu am putut încărca sesiunea'); }
    finally { setLoadingHistory(false); }
  };

  const newSession = () => {
    setActiveId(null);
    setMessages([]);
    setInput('');
  };

  const removeSession = async (sid) => {
    if (!window.confirm('Ștergeți această conversație?')) return;
    try {
      await api.delete(`/chatbot/sessions/${sid}`);
      toast.success('Conversație ștearsă');
      if (activeId === sid) newSession();
      await loadSessions();
    } catch { toast.error('Eroare la ștergere'); }
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setBusy(true);
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg, at: new Date().toISOString() }]);
    try {
      const { data } = await api.post('/chatbot/message', {
        session_id: activeId,
        message: msg,
        lang: 'ro',
      });
      setMessages((m) => [...m, { role: 'assistant', content: data.answer, at: new Date().toISOString() }]);
      if (!activeId) {
        setActiveId(data.session_id);
        await loadSessions();
      }
    } catch (e) {
      const detail = e?.response?.data?.detail || 'AI indisponibil';
      toast.error(detail);
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${detail}`, at: new Date().toISOString() }]);
    } finally { setBusy(false); }
  };

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return (
    <AppShell
      title="EnergyAI — Consultant tehnic"
      subtitle="Asistent specializat în gaze naturale, instalații electrice și construcții. Răspunsuri ancorate în normativele românești."
    >
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sessions sidebar */}
        <aside className="bg-white border border-gray-200 p-4 self-start lg:sticky lg:top-4">
          <button
            onClick={newSession}
            className="w-full amber-btn mb-3"
            data-testid="advisor-new-btn"
          >
            <Plus className="w-4 h-4" /> Conversație nouă
          </button>
          <div className="label mb-2 flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> Istoric</div>
          {sessions.length === 0 ? (
            <div className="text-xs text-gray-500 py-3">Nicio conversație salvată.</div>
          ) : (
            <ul className="space-y-1 max-h-[60vh] overflow-auto">
              {sessions.map((s) => (
                <li key={s.session_id} className="group">
                  <div className={`flex items-center justify-between gap-1 px-2 py-1.5 text-xs rounded-sm cursor-pointer ${activeId === s.session_id ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-800'}`}>
                    <button
                      onClick={() => loadSession(s.session_id)}
                      className="flex-1 text-left truncate"
                      data-testid={`advisor-session-${s.session_id}`}
                    >
                      {s.title || 'Conversație'}
                    </button>
                    <button
                      onClick={() => removeSession(s.session_id)}
                      className={`opacity-0 group-hover:opacity-100 p-1 ${activeId === s.session_id ? 'hover:text-red-300' : 'hover:text-red-600'}`}
                      data-testid={`advisor-delete-${s.session_id}`}
                      aria-label="Șterge"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat */}
        <section className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-gray-200">
            <div ref={scrollRef} className="p-5 max-h-[60vh] min-h-[320px] overflow-auto space-y-4" data-testid="advisor-messages">
              {loadingHistory ? (
                <div className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Se încarcă...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FFB300] text-black mb-3"><Sparkles className="w-6 h-6" /></div>
                  <div className="font-semibold mb-1">Salut! Sunt EnergyAI.</div>
                  <div className="text-sm text-gray-600 max-w-md mx-auto">
                    Întreabă-mă orice despre proiectarea de instalații de gaze, electrice sau construcții. Răspund în limba română, ancorat în NTPEE, I7-2011, Legea 10/1995 și normativele ANRE.
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {SUGGESTIONS_RO.slice(0, 4).map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="text-[11px] px-2 py-1 border border-gray-200 hover:border-[#FFB300] hover:bg-[#FFB300]/10 rounded-sm text-left max-w-xs"
                        data-testid="advisor-suggestion"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 flex items-center justify-center ${m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-[#FFB300] text-black'}`}>
                      {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[85%] px-3.5 py-2.5 text-sm rounded-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-[#F9FAFB] border-l-2 border-[#FFB300] text-gray-900'}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {busy && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-[#FFB300] text-black flex items-center justify-center"><Bot className="w-4 h-4" /></div>
                  <div className="bg-[#F9FAFB] border-l-2 border-[#FFB300] px-3.5 py-2.5 text-sm text-gray-600 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> EnergyAI gândește...
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-3 flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Întreabă EnergyAI... (Enter = trimite, Shift+Enter = rând nou)"
                rows={2}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30 resize-none"
                data-testid="advisor-input"
                disabled={busy}
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="amber-btn self-stretch disabled:opacity-40"
                data-testid="advisor-send-btn"
              >
                <Send className="w-4 h-4" /> Trimite
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            ⚠️ EnergyAI este un instrument de consultanță și nu înlocuiește verificarea proiectelor de un verificator atestat. Confirmați întotdeauna valorile și articolele normative.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
