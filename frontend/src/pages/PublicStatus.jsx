import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CheckCircle2, AlertTriangle, XCircle, Activity, FileText, Users, MessagesSquare, Mail, FileCheck, CreditCard, Sun, Bot, Sparkles, Clock } from 'lucide-react';

const MODULE_META = {
  forum: { label: 'Forum', icon: MessagesSquare },
  email: { label: 'Email', icon: Mail },
  pdf: { label: 'Export PDF', icon: FileCheck },
  photovoltaic: { label: 'Fotovoltaic', icon: Sun },
  ai_assistant: { label: 'AI Assistant', icon: Bot },
  payments: { label: 'Plăți', icon: CreditCard },
};

export default function PublicStatus() {
  const [status, setStatus] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/system/status');
        setStatus(data);
      } catch (e) { setErr('Conexiune eșuată'); }
    })();
    const t = setInterval(async () => {
      try { const { data } = await api.get('/system/status'); setStatus(data); } catch (_) {}
    }, 30000);
    return () => clearInterval(t);
  }, []);

  if (err) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="text-sm text-rose-400">{err}</div></div>;
  if (!status) return <div className="min-h-screen bg-black text-white flex items-center justify-center"><div className="text-sm text-gray-400">Se încarcă status-ul…</div></div>;

  const op = status.status === 'operational';
  const StatusIcon = op ? CheckCircle2 : AlertTriangle;
  const statusColor = op ? 'text-emerald-400' : 'text-amber-400';
  const allModulesUp = Object.values(status.modules || {}).every(Boolean);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" data-testid="public-status">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#FFB300] text-black flex items-center justify-center font-bold text-sm">E</div>
            <span className="font-semibold tracking-tight group-hover:text-[#FFB300] transition-colors">Energy Project Design</span>
          </Link>
          <Link to="/login" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#FFB300] transition-colors">Login →</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        {/* Hero status */}
        <div className="text-center mb-12">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#FFB300] mb-3">// platform status</div>
          <div className="inline-flex items-center gap-4 mb-6">
            <StatusIcon className={`w-12 h-12 ${statusColor}`} strokeWidth={2.5} />
            <div className="text-left">
              <div className={`text-4xl lg:text-5xl font-bold tracking-tight ${statusColor}`}>{op ? 'Operațional' : 'În mentenanță'}</div>
              <div className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Versiune {status.version}</div>
            </div>
          </div>
          {status.maintenance_message && !op && (
            <div className="max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/30 px-5 py-3 text-amber-100 text-sm">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              {status.maintenance_message}
            </div>
          )}
          {status.announcement_banner && (
            <div className={`max-w-2xl mx-auto mt-4 border px-5 py-3 text-sm ${
              status.announcement_level === 'danger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-100' :
              status.announcement_level === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-100' :
              status.announcement_level === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' :
              'bg-sky-500/10 border-sky-500/30 text-sky-100'
            }`}>
              <Sparkles className="w-4 h-4 inline mr-2" /> {status.announcement_banner}
            </div>
          )}
        </div>

        {/* Module status grid */}
        <div className="mb-12">
          <h3 className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4 font-semibold">Module platformă</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(status.modules || {}).map(([key, up]) => {
              const meta = MODULE_META[key] || { label: key, icon: Activity };
              const Icon = meta.icon;
              return (
                <div key={key} className="bg-white/5 border border-white/10 p-4 flex items-center gap-3" data-testid={`module-${key}`}>
                  <div className={`w-10 h-10 flex items-center justify-center ${up ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{meta.label}</div>
                    <div className={`text-[10px] uppercase tracking-wider font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>{up ? 'Activ' : 'Dezactivat'}</div>
                  </div>
                  {up ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {[
            ['Status', allModulesUp ? '✓ All Green' : 'Degraded', allModulesUp ? 'text-emerald-400' : 'text-amber-400', Activity],
            ['Utilizatori', status.totals?.users, 'text-[#FFB300]', Users],
            ['Proiecte', status.totals?.projects, 'text-sky-400', FileText],
            ['Documente', status.totals?.documents, 'text-purple-400', FileText],
          ].map(([label, val, color, Icon]) => (
            <div key={label} className="bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{label}</span>
                <Icon className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${color}`}>{val}</div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        {status.recent_activity?.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4 font-semibold">Activitate recentă</h3>
            <div className="bg-white/5 border border-white/10">
              {status.recent_activity.map((log, i) => (
                <div key={i} className="px-4 py-3 border-b border-white/5 last:border-b-0 flex items-center gap-3 text-sm">
                  <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="font-mono text-xs text-gray-400">{new Date(log.created_at).toLocaleString('ro-RO')}</span>
                  <span className="text-gray-300 ml-auto">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-6 border-t border-white/10 text-center text-xs text-gray-500 uppercase tracking-[0.2em]">
          Auto-refresh la 30 secunde · status.energyprojectdesign.ro · © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
