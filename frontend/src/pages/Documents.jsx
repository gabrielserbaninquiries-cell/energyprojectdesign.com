import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import api, { API } from '../lib/api';
import { toast } from 'sonner';
import { Download, Trash2, Mail, ShieldCheck, FileCheck2, Printer, Layers, ChevronDown, ChevronRight } from 'lucide-react';

export default function Documents() {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState('flat');  // 'flat' | 'grouped'
  const [expandedGroups, setExpandedGroups] = useState({});
  const [emailOpen, setEmailOpen] = useState(null);
  const [emailForm, setEmailForm] = useState({ recipients: '', subject: 'Document de la EPD', body: 'Bună ziua,\n\nVă transmitem documentul atașat.\n\nCu stimă,' });

  useEffect(() => {
    (async () => {
      try {
        const [{ data: docs }, { data: grps }] = await Promise.all([
          api.get('/documents'),
          api.get('/documents/groups'),
        ]);
        setItems(docs);
        setGroups(grps);
      } catch (e) { console.error('Documents load failed:', e); }
    })();
  }, []);

  const load = async () => {
    try {
      const [{ data: docs }, { data: grps }] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/groups'),
      ]);
      setItems(docs);
      setGroups(grps);
    } catch (e) { console.error('Documents load failed:', e); }
  };

  // V4.9+: auth via httpOnly cookie (no Bearer header needed, withCredentials in api.js).
  // We still use fetch() here because we need a Blob, but pass credentials: 'include'.
  const fetchBlob = async (path) => {
    const r = await fetch(`${API}${path}`, { credentials: 'include' });
    if (!r.ok) throw new Error('Download failed');
    return r.blob();
  };

  const download = async (doc, sig = false) => {
    try {
      const blob = await fetchBlob(`/documents/${doc.document_id}/${sig ? 'signature' : 'download'}`);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = sig ? doc.name.replace(/\.docx$/i, '.p7s') : doc.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { toast.error('Eroare descărcare.'); }
  };

  const downloadPdf = async (doc) => {
    try {
      const blob = await fetchBlob(`/documents/${doc.document_id}/download.pdf`);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = doc.name.replace(/\.docx$/i, '.pdf');
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) { toast.error('Eroare descărcare PDF.'); }
  };

  const printDoc = async (doc) => {
    try {
      const blob = await fetchBlob(`/documents/${doc.document_id}/download`);
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) setTimeout(() => w.print(), 500);
    } catch (e) { toast.error('Eroare printare.'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Ștergi acest document definitiv?')) return;
    try { await api.delete(`/documents/${id}`); toast.success('Document șters.'); load(); }
    catch (e) { toast.error('Eroare ștergere.'); }
  };

  const sendEmail = async (doc) => {
    try {
      const recipients = emailForm.recipients.split(',').map(r => r.trim()).filter(Boolean);
      if (!recipients.length) { toast.error('Adaugă un destinatar.'); return; }
      await api.post(`/documents/${doc.document_id}/email`, { ...emailForm, recipients });
      toast.success('Email trimis!');
      setEmailOpen(null);
    } catch (e) { toast.error(e?.response?.data?.detail || 'Eroare trimitere email.'); }
  };

  function toggleGroup(name) { setExpandedGroups(g => ({ ...g, [name]: !g[name] })); }

  return (
    <AppShell title="Documente">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setViewMode('flat')} className={`text-xs px-3 py-1.5 border ${viewMode === 'flat' ? 'bg-black text-[#FFB300] border-black' : 'border-gray-300 hover:border-black'}`} data-testid="view-flat">Listă</button>
        <button onClick={() => setViewMode('grouped')} className={`text-xs px-3 py-1.5 border flex items-center gap-1.5 ${viewMode === 'grouped' ? 'bg-black text-[#FFB300] border-black' : 'border-gray-300 hover:border-black'}`} data-testid="view-grouped">
          <Layers className="w-3.5 h-3.5" /> Grupat pe versiuni ({groups.length})
        </button>
      </div>

      {viewMode === 'flat' && (
        items.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500" data-testid="documents-empty">Niciun document generat încă. Vezi <a href="/templates" className="text-[#FFB300] underline">Șabloane</a>.</div>
        ) : (
          <div className="space-y-2" data-testid="documents-list">
            {items.map((d) => (
              <DocCard key={d.document_id} doc={d} onDownload={download} onPdf={downloadPdf} onPrint={printDoc} onRemove={remove} onEmail={() => setEmailOpen(d)} />
            ))}
          </div>
        )
      )}

      {viewMode === 'grouped' && (
        groups.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 p-10 text-center text-sm text-gray-500" data-testid="groups-empty">Niciun grup de documente.</div>
        ) : (
          <div className="space-y-2" data-testid="documents-groups">
            {groups.map((g) => (
              <div key={g.base_name} className="bg-white border-2 border-black" data-testid={`group-${g.base_name}`}>
                <button onClick={() => toggleGroup(g.base_name)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3 text-left">
                    {expandedGroups[g.base_name] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <div>
                      <div className="font-bold text-sm">{g.base_name}</div>
                      <div className="text-xs text-gray-500">{g.versions_count} versiune{g.versions_count !== 1 ? 'i' : ''} · ultima: {new Date(g.latest_created_at).toLocaleString('ro-RO')}</div>
                    </div>
                  </div>
                  <span className="bg-[#FFB300] text-black px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">v{g.versions_count}</span>
                </button>
                {expandedGroups[g.base_name] && (
                  <div className="border-t border-gray-200 divide-y divide-gray-100">
                    {g.versions.map((v, i) => (
                      <div key={v.document_id} className="p-3 pl-12 flex items-center justify-between text-xs" data-testid={`version-${v.document_id}`}>
                        <div>
                          <span className="font-mono">v{i + 1}</span>
                          <span className="ml-3">{new Date(v.created_at).toLocaleString('ro-RO')}</span>
                          {v.signed && <span className="ml-2 bg-[#FFB300] text-black px-1.5 py-0.5 text-[9px] uppercase font-bold">Semnat</span>}
                          {v.stamped && <span className="ml-2 border border-gray-300 px-1.5 py-0.5 text-[9px] uppercase">Ștampilat</span>}
                        </div>
                        <button onClick={() => download(v)} className="text-[#FFB300] hover:underline">Descarcă →</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Email modal */}
      {emailOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black w-full max-w-lg p-5">
            <h2 className="font-bold mb-3">Trimite &bdquo;{emailOpen.name}&rdquo; pe email</h2>
            <input value={emailForm.recipients} onChange={(e) => setEmailForm({ ...emailForm, recipients: e.target.value })} placeholder="email1@x.ro, email2@x.ro" className="w-full px-3 py-2 border border-black text-sm mb-2" data-testid="email-recipients" />
            <input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} className="w-full px-3 py-2 border border-black text-sm mb-2" data-testid="email-subject" />
            <textarea value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} rows={5} className="w-full px-3 py-2 border border-black text-sm mb-3" data-testid="email-body" />
            <div className="flex gap-2">
              <button onClick={() => sendEmail(emailOpen)} className="amber-btn flex-1 text-sm" data-testid="email-send-btn">Trimite</button>
              <button onClick={() => setEmailOpen(null)} className="ghost-btn text-sm">Anulează</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function DocCard({ doc, onDownload, onPdf, onPrint, onRemove, onEmail }) {
  return (
    <div className="bg-white border border-gray-200 p-4 flex items-center justify-between" data-testid={`doc-${doc.document_id}`}>
      <div className="flex items-center gap-3">
        <FileCheck2 className="w-5 h-5 text-gray-400" />
        <div>
          <div className="font-semibold text-sm">{doc.name}</div>
          <div className="text-xs text-gray-500">
            {new Date(doc.created_at).toLocaleString('ro-RO')}
            {doc.signed && <span className="ml-2 inline-block px-1.5 py-0.5 bg-[#FFB300] text-black text-[10px] uppercase tracking-wider"><ShieldCheck className="w-3 h-3 inline mr-1" />Semnat</span>}
            {doc.stamped && <span className="ml-2 inline-block px-1.5 py-0.5 border border-gray-300 text-[10px] uppercase tracking-wider">Ștampilat</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onDownload(doc)} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300] flex items-center gap-1" data-testid={`download-${doc.document_id}`}><Download className="w-3 h-3" /> DOCX</button>
        <button onClick={() => onPdf(doc)} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300] flex items-center gap-1" data-testid={`pdf-${doc.document_id}`}><Download className="w-3 h-3" /> PDF</button>
        <button onClick={() => onPrint(doc)} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300] flex items-center gap-1" data-testid={`print-${doc.document_id}`}><Printer className="w-3 h-3" /></button>
        <button onClick={onEmail} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300] flex items-center gap-1" data-testid={`email-${doc.document_id}`}><Mail className="w-3 h-3" /></button>
        {doc.signed && <button onClick={() => onDownload(doc, true)} className="text-xs border border-gray-300 px-2.5 py-1.5 hover:bg-black hover:text-[#FFB300]" data-testid={`signature-${doc.document_id}`}>.p7s</button>}
        <button onClick={() => onRemove(doc.document_id)} className="text-xs border border-red-300 text-red-700 px-2.5 py-1.5 hover:bg-red-700 hover:text-white" data-testid={`remove-${doc.document_id}`}><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}
