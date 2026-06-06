import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Wrench, Send, Plus, Trash2, MessageSquare, ShieldAlert, Sparkles, Lock, User as UserIcon, Bot } from 'lucide-react';

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 mb-5 ${isUser ? 'flex-row-reverse' : ''}`} data-testid={`msg-${msg.role}`}>
      <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isUser ? 'bg-[#FFB300] text-black' : 'bg-black text-[#FFB300]'}`}>
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left p-4 text-sm whitespace-pre-wrap leading-relaxed ${
          isUser ? 'bg-black text-white' : 'bg-white border border-gray-200'
        }`}>
          {msg.content.split('\n').map((line, i) => {
            // Inline markdown formatting
            if (line.startsWith('**') && line.endsWith('**')) {
              return <div key={i} className="font-semibold mt-2 first:mt-0">{line.slice(2, -2)}</div>;
            }
            if (line.startsWith('- ')) {
              return <div key={i} className="pl-3">• {line.slice(2)}</div>;
            }
            if (/^\d+\.\s/.test(line)) {
              return <div key={i} className="pl-3">{line}</div>;
            }
            if (line.startsWith('_') && line.endsWith('_')) {
              return <div key={i} className="italic text-xs text-gray-500 mt-2">{line.slice(1, -1)}</div>;
            }
            return <div key={i}>{line}</div>;
          })}
        </div>
        <div className="text-[10px] text-gray-400 mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString('ro-RO')}</div>
      </div>
    </div>
  );
}

export default function DeveloperChat() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [useOpenAi, setUseOpenAi] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user?.is_developer) return;
    loadSessions();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  if (!user) return null;
  if (!user.is_developer) {
    return <AppShell title="AI Developer Chat">
      <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 p-8 text-center">
        <Lock className="w-10 h-10 text-[#DC2626] mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acces restricționat</h2>
        <p className="text-sm text-gray-700">Această secțiune este accesibilă doar contului Developer (<code className="mono bg-white px-1.5 py-0.5">dragosserban95@gmail.com</code>).</p>
      </div>
    </AppShell>;
  }

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/dev/chat/sessions');
      setSessions(data);
    } catch (err) { console.error(err); }
  };

  const openSession = async (id) => {
    try {
      const { data } = await api.get(`/dev/chat/${id}`);
      setActiveSessionId(id);
      setMessages(data.messages || []);
    } catch (err) { toast.error('Eroare încărcare'); }
  };

  const newSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setPrompt('');
  };

  const send = async () => {
    if (!prompt.trim()) return;
    const userMsg = { role: 'user', content: prompt, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: '...', created_at: new Date().toISOString(), _loading: true }]);
    const text = prompt;
    setPrompt('');
    setBusy(true);
    try {
      const body = { message: text, session_id: activeSessionId };
      if (useOpenAi && openaiKey.trim()) body.openai_api_key = openaiKey.trim();
      const { data } = await api.post('/dev/chat/send', body);
      setActiveSessionId(data.session_id);
      setMessages(data.messages || []);
      await loadSessions();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare');
      setMessages((m) => m.filter(x => !x._loading));
    } finally { setBusy(false); }
  };

  const removeSession = async (id) => {
    if (!window.confirm('Ștergere sesiune?')) return;
    try {
      await api.delete(`/dev/chat/${id}`);
      if (id === activeSessionId) newSession();
      await loadSessions();
    } catch (err) { toast.error('Eroare'); }
  };

  return (
    <AppShell title="AI Developer Chat" subtitle="Conversație multi-turn cu istoric persistent — Plan Mode controlat">
      <div className="bg-[#FFB300]/10 border border-[#FFB300]/30 p-3 mb-4 flex items-start gap-2.5 text-sm text-[#92400E]">
        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
        <div><strong>Plan Mode.</strong> Acest chat generează planuri și recomandări — nu modifică automat codul. Pentru aplicare folosiți Emergent / Claude / ChatGPT / Codex cu confirmare umană.</div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-260px)]">
        {/* Sidebar — sessions */}
        <aside className="bg-white border border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <div className="label">Conversații</div>
            <button onClick={newSession} className="text-xs amber-btn py-1 px-2" data-testid="new-chat-btn"><Plus className="w-3 h-3" /> Nou</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-xs text-gray-500 px-3 py-4 text-center">Nicio conversație încă.</div>
            ) : sessions.map((s) => (
              <div key={s.session_id} className={`flex items-center gap-2 px-2 py-2 group cursor-pointer ${s.session_id === activeSessionId ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
                <button onClick={() => openSession(s.session_id)} className="flex-1 text-left min-w-0" data-testid={`chat-${s.session_id}`}>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span className="text-xs font-medium truncate">{s.title}</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${s.session_id === activeSessionId ? 'text-gray-300' : 'text-gray-500'}`}>
                    {(s.messages || []).length} mesaje · {new Date(s.updated_at).toLocaleDateString('ro-RO')}
                  </div>
                </button>
                <button onClick={() => removeSession(s.session_id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#DC2626]">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main chat */}
        <div className="lg:col-span-3 bg-white border border-gray-200 flex flex-col">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="w-14 h-14 bg-black text-[#FFB300] flex items-center justify-center mx-auto mb-4"><Wrench className="w-7 h-7" /></div>
                  <h3 className="font-semibold text-lg mb-2">AI Developer Assistant</h3>
                  <p className="text-sm text-gray-500 max-w-md">Scrieți o comandă de dezvoltare. Asistentul va genera plan + checklist de validare. Pentru aplicare, copiați planul către Emergent / Claude / ChatGPT.</p>
                  <div className="mt-6 flex flex-wrap gap-1.5 justify-center max-w-lg mx-auto">
                    {['Adaugă industrie nouă', 'Diagnostic complet', 'Implementare PDF export', 'Status Stripe live', 'Adaugă endpoint nou'].map(s => (
                      <button key={s} onClick={() => setPrompt(s)} className="text-[11px] px-2 py-1 border border-gray-200 hover:border-[#FFB300] hover:bg-[#FFB300]/10 transition-colors" data-testid={`suggest-${s.replace(/\s+/g,'-')}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : messages.map((m, i) => <MessageBubble key={m.created_at + '-' + i} msg={m} />)}
          </div>

          {/* OpenAI toggle */}
          <div className="border-t border-gray-200 px-4 py-2 bg-[#F9FAFB]">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={useOpenAi} onChange={(e) => setUseOpenAi(e.target.checked)} className="accent-[#FFB300]" data-testid="use-openai" />
              <Sparkles className="w-3 h-3 text-[#FFB300]" />
              <span>Folosește OpenAI pentru enrich (BYOK)</span>
              {useOpenAi && (
                <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." className="flex-1 max-w-xs border border-gray-300 px-2 py-0.5 text-xs rounded-sm mono" data-testid="openai-key" />
              )}
            </label>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Scrie comanda... (Enter trimite, Shift+Enter newline)"
              rows={2}
              className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded-sm resize-none focus:outline-none focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/30"
              data-testid="chat-input"
            />
            <button onClick={send} disabled={busy || !prompt.trim()} className="amber-btn disabled:opacity-50 px-4" data-testid="chat-send">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
