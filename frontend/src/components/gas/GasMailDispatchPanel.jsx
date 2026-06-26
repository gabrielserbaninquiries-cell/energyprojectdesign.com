/**
 * GasMailDispatchPanel — panou pentru trimitere documentație către instituții.
 * Conform poza legendară: butoane "Trimite la Primărie / Diriginte / Contabilitate / OSD / ISC / Poliție".
 * Folosește endpoint-ul existent POST /api/documents/email.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import api from '../../lib/api';
import {
  Send, Building2, HardHat, Calculator, Flame, ShieldAlert, ShieldCheck, FileText, Loader2,
} from 'lucide-react';

const TARGETS = [
  { id: 'primarie',     label: 'Primărie',                icon: Building2,    color: 'border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700',
    default_subject: 'Documentație tehnică pentru autorizare',
    default_body: 'Stimată Doamnă/Domnule,\n\nVă transmitem documentația tehnică pentru emiterea Certificatului de Urbanism / Autorizației de Construire.\n\nCu stimă,' },
  { id: 'diriginte',    label: 'Diriginte de șantier',    icon: HardHat,      color: 'border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-amber-700',
    default_subject: 'Documentație execuție lucrare gaze naturale',
    default_body: 'Domnule diriginte,\n\nVă transmitem dosarul de execuție pentru lucrarea de gaze naturale.\n\nCu stimă,' },
  { id: 'contabilitate',label: 'Contabilitate',           icon: Calculator,   color: 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700',
    default_subject: 'Documente financiar-contabile lucrare',
    default_body: 'Stimată Doamnă/Domnule,\n\nAnexat: deviz, situație de lucrări, factură.\n\nCu stimă,' },
  { id: 'osd',          label: 'OSD',                     icon: Flame,        color: 'border-violet-300 hover:border-violet-500 hover:bg-violet-50 text-violet-700',
    default_subject: 'Documentație branșament gaze naturale',
    default_body: 'Stimată Doamnă/Domnule,\n\nVă transmitem documentația tehnică pentru avizare branșament.\n\nCu stimă,' },
  { id: 'isc',          label: 'ISC',                     icon: ShieldAlert,  color: 'border-rose-300 hover:border-rose-500 hover:bg-rose-50 text-rose-700',
    default_subject: 'Convocare faze determinante',
    default_body: 'Stimată Doamnă/Domnule,\n\nVă convocăm la fazele determinante ale lucrării.\n\nCu stimă,' },
  { id: 'politie',      label: 'Poliție / Inspectorat',   icon: ShieldCheck,  color: 'border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-700',
    default_subject: 'Aviz circulație / lucrări pe domeniul public',
    default_body: 'Stimată Doamnă/Domnule,\n\nSolicităm aviz pentru lucrările de pe domeniul public.\n\nCu stimă,' },
];

function DispatchModal({ target, documents, onClose }) {
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState(target.default_subject);
  const [body, setBody] = useState(target.default_body);
  const [docId, setDocId] = useState(documents[0]?.document_id || '');
  const [sending, setSending] = useState(false);
  const Icon = target.icon;

  const send = async () => {
    const list = recipients.split(',').map(s => s.trim()).filter(Boolean);
    if (list.length === 0) { toast.error('Adăugați cel puțin un email destinatar'); return; }
    if (!docId) { toast.error('Selectați un document de trimis'); return; }
    setSending(true);
    try {
      await api.post('/documents/email', {
        document_id: docId,
        recipients: list,
        subject,
        body,
      });
      toast.success(`Trimis către ${target.label}: ${list.join(', ')}`);
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Eroare trimitere email');
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" data-testid={`dispatch-modal-${target.id}`}>
      <div className="bg-white max-w-xl w-full border-2 border-black shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">// trimite documentație</div>
              <h3 className="text-lg font-bold tracking-tight">Către {target.label}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl">×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Destinatari (email-uri separate prin virgulă)</label>
            <input value={recipients} onChange={e => setRecipients(e.target.value)}
              placeholder="primaria@oras.ro, secretariat@primarie.ro"
              data-testid={`dispatch-recipients-${target.id}`}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Document atașat</label>
            {documents.length === 0 ? (
              <div className="text-xs text-gray-500 italic border border-dashed border-gray-300 px-3 py-3">Niciun document generat. Generați mai întâi un DOCX din secțiunea „Documente".</div>
            ) : (
              <select value={docId} onChange={e => setDocId(e.target.value)}
                data-testid={`dispatch-doc-${target.id}`}
                className="w-full px-3 py-2 border border-gray-300 text-sm">
                {documents.map(d => <option key={d.document_id} value={d.document_id}>{d.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Subiect</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Mesaj</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
              className="w-full px-3 py-2 border border-gray-300 text-sm focus:border-black focus:outline-none" />
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-3 py-2 border border-gray-300 text-sm hover:bg-gray-50">Anulează</button>
          <button onClick={send} disabled={sending || documents.length === 0} data-testid={`dispatch-send-${target.id}`}
            className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Trimite
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GasMailDispatchPanel({ documents = [] }) {
  const [active, setActive] = useState(null);
  return (
    <section data-testid="mail-dispatch-panel" className="mt-6 border border-gray-200 bg-white">
      <header className="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">// trimitere instituții</div>
        <h2 className="text-base font-bold tracking-tight">Trimite documentația către instituții</h2>
        <p className="text-xs text-gray-500 mt-1">Atașează un document generat și transmite-l prin email către instituțiile relevante.</p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200">
        {TARGETS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t)}
              data-testid={`dispatch-to-${t.id}`}
              className={`bg-white p-4 flex flex-col items-center gap-2 border-l-2 border-transparent ${t.color} transition-colors`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold text-center">{t.label}</span>
              <span className="text-[9px] uppercase tracking-wider text-gray-400">Trimite →</span>
            </button>
          );
        })}
      </div>
      {documents.length === 0 && (
        <div className="px-5 py-3 border-t border-gray-200 text-xs text-amber-700 bg-amber-50 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" />
          Generați mai întâi un document (DOCX) din secțiunea „Documente" pentru a putea trimite.
        </div>
      )}
      {active && <DispatchModal target={active} documents={documents} onClose={() => setActive(null)} />}
    </section>
  );
}
