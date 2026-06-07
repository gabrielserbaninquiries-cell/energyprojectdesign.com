import { useEffect, useState, useRef } from 'react';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Bot, HardHat, Users as UsersIcon, Wrench, Send, Sparkles, MessageCircle, Loader2 } from 'lucide-react';

const AGENTS = [
  {
    id: 'producer', name: 'Producer Agent', icon: HardHat, accent: '#FFB300',
    title: 'Pentru proiectanți autorizați ANRE',
    desc: 'Calcule tehnice, normative, dosare racordare. Răspunsuri scurte, cu referințe la SR EN, NTPEE, I7, ANRE Ord. 34/2024.',
    placeholder: 'Ex: "Ce normativ se aplică pentru un sistem FV 30 kWp în categoria B?"',
  },
  {
    id: 'user', name: 'User Agent', icon: UsersIcon, accent: '#16A34A',
    title: 'Pentru clienți finali',
    desc: 'Explicații prietenoase despre oferte tehnice: ce e un kWp, ce înseamnă prosumator, cum se amortizează un FV.',
    placeholder: 'Ex: "Ce înseamnă 5 kWp și cât produce într-un an?"',
  },
  {
    id: 'client', name: 'Client Agent', icon: Wrench, accent: '#0284C7',
    title: 'Pentru executanți / montatori',
    desc: 'Liste de materiale, secvențe de montaj, SSM, PIF. Foarte practic.',
    placeholder: 'Ex: "Liste materiale pentru branșament electric monofazat 100A?"',
  },
  {
    id: 'developer', name: 'Developer Agent', icon: Bot, accent: '#7C3AED',
    title: 'Pentru admini & dezvoltatori',
    desc: 'Endpoint-uri, modele Pydantic, pattern-uri de cod, automation scripts.',
    placeholder: 'Ex: "Cum adaug un endpoint pentru sincronizare ANAF?"',
  },
];

export default function AIAgents() {
  const [active, setActive] = useState(AGENTS[0]);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/ai/agents/${active.id}/history?limit=30`);
        setHistory(data.messages || []);
      } catch (_) { setHistory([]); }
    })();
  }, [active.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, loading]);

  const send = async (e) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;
    const m = message.trim();
    setMessage('');
    setHistory((h) => [...h, { message: m, reply: null, _pending: true, created_at: new Date().toISOString() }]);
    setLoading(true);
    try {
      const { data } = await api.post(`/ai/agents/${active.id}`, { message: m });
      setHistory((h) => h.map((it, idx) => idx === h.length - 1 ? { ...it, reply: data.reply, _pending: false } : it));
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Eroare la apelarea agentului';
      setHistory((h) => h.map((it, idx) => idx === h.length - 1 ? { ...it, reply: `⚠️ ${detail}`, _pending: false } : it));
      toast.error(detail);
    } finally { setLoading(false); }
  };

  return (
    <AppShell title="AI Agents" subtitle="4 asistenți specializați · Claude Sonnet 4.6 prin Emergent LLM">
      {/* Hero */}
      <div className="relative overflow-hidden mb-8 bg-gradient-to-br from-[#0A0A0A] via-[#171717] to-[#0A0A0A] text-white p-8" data-testid="ai-agents-hero">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#FFB300]/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 bg-[#FFB300] text-black flex items-center justify-center shrink-0"><Sparkles className="w-7 h-7" /></div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#FFB300] mb-1">// multi-agent reasoning</div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">4 perspective. 1 platformă.</h2>
            <p className="text-sm text-gray-300 max-w-2xl">Fiecare agent are persona proprie: <strong>Producer</strong> răspunde tehnic-strict, <strong>User</strong> educativ-prietenos, <strong>Client</strong> practic-execuțional, <strong>Developer</strong> code-first. Conversațiile sunt persistente.</p>
          </div>
        </div>
      </div>

      {/* Agent picker */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6" data-testid="ai-agents-picker">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          const isActive = active.id === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setActive(a)}
              data-testid={`ai-agent-${a.id}`}
              className={`group text-left p-4 border-2 transition-all ${isActive ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}
              style={isActive ? { borderColor: a.accent } : undefined}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ backgroundColor: isActive ? a.accent : '#F9FAFB', color: isActive ? '#000' : a.accent }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">{a.name}</div>
                  <div className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>{a.title}</div>
                </div>
              </div>
              <p className={`text-xs leading-relaxed line-clamp-2 ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>{a.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Chat */}
      <div className="bg-white border border-gray-200 flex flex-col" style={{ minHeight: 500 }} data-testid="ai-chat">
        <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2 bg-gray-50">
          <MessageCircle className="w-4 h-4" style={{ color: active.accent }} />
          <span className="text-sm font-semibold">{active.name}</span>
          <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-400 mono">claude-sonnet-4-6</span>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ maxHeight: 540 }} data-testid="ai-chat-history">
          {history.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
              Niciun mesaj încă. Pune o întrebare {active.name.toLowerCase()}.
            </div>
          )}
          {history.map((m, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">{m.message}</div>
              </div>
              {m._pending ? (
                <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> {active.name} răspunde…</div>
              ) : (
                <div className="flex justify-start">
                  <div className="border-l-4 px-4 py-3 max-w-[80%] text-sm leading-relaxed bg-gray-50 whitespace-pre-wrap" style={{ borderLeftColor: active.accent }}>{m.reply}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="border-t border-gray-200 p-3 flex gap-2 bg-white" data-testid="ai-chat-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={active.placeholder}
            disabled={loading}
            className="flex-1 border border-gray-200 px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20"
            data-testid="ai-chat-input"
          />
          <button type="submit" disabled={loading || !message.trim()} className="amber-btn px-5 py-2.5 disabled:opacity-50" data-testid="ai-chat-send">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Trimite
          </button>
        </form>
      </div>
    </AppShell>
  );
}
