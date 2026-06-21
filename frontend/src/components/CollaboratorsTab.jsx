// V10.4 — Collaborators / Audit Log Tab
// Displays shared_access timeline + audit_log for cross-department interconnect.
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Loader2, Users, Clock, Send, AlertCircle, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS = {
  proiectant: 'Proiectant',
  executant: 'Executant',
  vgd: 'VGD — Verificator',
  rte: 'RTE — Responsabil execuție',
  operator: 'Operator',
  contabilitate: 'Contabilitate',
  ofertare: 'Ofertare',
  beneficiar: 'Beneficiar',
  osd: 'OSD',
};

const ROLE_COLORS = {
  proiectant: 'violet',
  executant: 'indigo',
  vgd: 'blue',
  rte: 'cyan',
  operator: 'slate',
  contabilitate: 'sky',
  ofertare: 'fuchsia',
};

function formatRelative(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const now = new Date();
    const ms = now - d;
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'acum câteva secunde';
    const min = Math.floor(sec / 60);
    if (min < 60) return `acum ${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `acum ${hr}h`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `acum ${days} zile`;
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CollaboratorsTab({ pid }) {
  const [data, setData] = useState({ audit_log: [], shared_access: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/gas-project/${pid}/audit-log`);
      setData(res.data || { audit_log: [], shared_access: [] });
    } catch (e) {
      toast.error('Eroare la încărcare audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (pid) load(); }, [pid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="ml-2 text-sm">Se încarcă istoricul colaboratorilor...</span>
      </div>
    );
  }

  const shared = data.shared_access || [];
  const audit = data.audit_log || [];

  return (
    <div className="space-y-6" data-testid="collaborators-tab">
      {/* SHARED ACCESS — current collaborators */}
      <section className="bg-white border border-violet-200 rounded-xl overflow-hidden epd-shadow">
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100 px-5 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-violet-900">Colaboratori activi pe proiect</h3>
            <span className="ml-auto text-[10px] uppercase tracking-wider bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
              {shared.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Utilizatori cu acces moștenit prin transfer · interconectare cross-department
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {shared.length === 0 && (
            <div className="px-5 py-8 text-center">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="text-sm text-slate-500">Niciun colaborator încă</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Folosește butonul «Transferă către alt utilizator» din panoul Acțiuni proiect.
              </div>
            </div>
          )}
          {shared.map((s, idx) => {
            const accent = ROLE_COLORS[s.role] || 'violet';
            const palette = {
              violet: 'bg-violet-100 text-violet-700 border-violet-200',
              indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
              blue: 'bg-blue-100 text-blue-700 border-blue-200',
              cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
              slate: 'bg-slate-100 text-slate-700 border-slate-200',
              sky: 'bg-sky-100 text-sky-700 border-sky-200',
              fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
            }[accent];
            return (
              <div key={idx} className="px-5 py-3 hover:bg-slate-50/50 transition-colors" data-testid={`collaborator-${idx}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${palette}`}>
                    {(s.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-bold text-slate-900 truncate">{s.email}</div>
                      <div className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold border ${palette}`}>
                        {ROLE_LABELS[s.role] || s.role}
                      </div>
                      {s.user_id ? (
                        <span className="text-[10px] inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <Shield className="w-2.5 h-2.5" /> activ în platformă
                        </span>
                      ) : (
                        <span className="text-[10px] inline-flex items-center gap-1 text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          invitat — neînregistrat
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelative(s.shared_at)}</span>
                      <span className="text-slate-300">·</span>
                      <span>de la <strong className="text-slate-700">{s.shared_by}</strong></span>
                    </div>
                    {s.note && (
                      <div className="mt-2 text-xs text-slate-700 bg-violet-50/40 border border-violet-100 rounded p-2 italic">
                        &laquo;{s.note}&raquo;
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AUDIT LOG — timeline */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden epd-shadow">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Istoric acțiuni · audit complet</h3>
            <span className="ml-auto text-[10px] uppercase tracking-wider bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
              {audit.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Trasabilitate completă · GDPR-compliant · imutabil în Mongo
          </p>
        </div>

        <div className="px-5 py-4">
          {audit.length === 0 && (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <div className="text-sm text-slate-500">Niciun eveniment în audit log</div>
            </div>
          )}
          {audit.length > 0 && (
            <ol className="relative border-l-2 border-violet-200 ml-2 space-y-4">
              {[...audit].reverse().map((evt, idx) => {
                const icon = evt.action === 'transfer' ? Send : Mail;
                const Icon = icon;
                return (
                  <li key={idx} className="ml-5 relative" data-testid={`audit-event-${idx}`}>
                    <div className="absolute -left-[28px] top-1 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center ring-4 ring-white">
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <div className="bg-white border border-slate-200 hover:border-violet-300 rounded-lg p-3 transition-colors">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="font-bold text-violet-700 uppercase tracking-wider text-[10px]">
                            {evt.action}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="font-semibold text-slate-800">{evt.by}</span>
                          {evt.to && (
                            <>
                              <span className="text-slate-400">→</span>
                              <span className="font-semibold text-slate-800">{evt.to}</span>
                            </>
                          )}
                          {evt.role && (
                            <span className="text-[10px] uppercase tracking-wider bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-bold ml-1">
                              {ROLE_LABELS[evt.role] || evt.role}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatRelative(evt.at)}
                        </div>
                      </div>
                      {evt.note && (
                        <div className="mt-2 text-[11px] text-slate-600 italic border-l-2 border-violet-200 pl-2">
                          &laquo;{evt.note}&raquo;
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
