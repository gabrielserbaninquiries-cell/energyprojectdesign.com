import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import api from '../lib/api';
import { toast } from 'sonner';
import { Upload, FileText, Trash2, ArrowRight, Sparkles, Copy } from 'lucide-react';

export default function Templates() {
  const [items, setItems] = useState([]);
  const [systemTpl, setSystemTpl] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    const [{ data: u }, { data: s }] = await Promise.all([
      api.get('/templates'),
      api.get('/system-templates'),
    ]);
    setItems(u); setSystemTpl(s);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', file.name);
    try {
      await api.post('/templates/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Șablon încărcat');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Eroare la încărcare');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ștergeți acest șablon?')) return;
    await api.delete(`/templates/${id}`);
    toast.success('Șters');
    await load();
  };

  const cloneSystem = async (key) => {
    try {
      await api.post(`/system-templates/${key}/clone`);
      toast.success('Șablon clonat în biblioteca dvs.');
      await load();
    } catch (err) { toast.error('Eroare clonare'); }
  };

  return (
    <AppShell title="Șabloane DOCX" subtitle="Biblioteca dvs. + șabloane legale de sistem">
      {/* System templates */}
      <div className="bg-black text-white p-6 mb-6" data-testid="system-templates-section">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 bg-[#FFB300] text-black flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></div>
          <div>
            <div className="label text-[#FFB300]">// Șabloane legale de sistem</div>
            <h2 className="text-xl font-semibold mt-1">Pre-încărcate pentru ingineria gazelor</h2>
            <p className="text-xs text-gray-400 mt-1">Cerere racordare, Memoriu tehnic, Borderou documente, Adresă către OSD — gata de utilizare. Clonați-le în biblioteca dvs. și folosiți-le imediat.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {systemTpl.map(t => (
            <div key={t.key} className="bg-white text-black p-4 flex flex-col" data-testid={`sys-${t.key}`}>
              <FileText className="w-5 h-5 mb-2 text-[#FFB300]" />
              <h4 className="font-semibold text-sm mb-1">{t.name}</h4>
              <div className="text-[10px] text-gray-500 mono mb-3">{t.placeholders?.length || 0} placeholder-e</div>
              <button onClick={() => cloneSystem(t.key)} className="mt-auto outline-btn text-xs py-1.5 justify-center" data-testid={`clone-${t.key}`}>
                <Copy className="w-3 h-3" /> Clonează
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="label mb-2">// Cum funcționează</div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">Marcați câmpurile în Word</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Folosiți sintaxa <code className="mono bg-gray-100 px-1.5 py-0.5">{'{{nume_camp}}'}</code> oriunde în document, antet sau subsol. La încărcare detectăm automat toate variabilele.
            </p>
            <div className="mono text-xs bg-[#F3F4F6] p-4 border border-gray-200">
              Beneficiar: {'{{nume_beneficiar}}'}<br/>
              CNP: {'{{cnp}}'}<br/>
              Adresă: {'{{adresa_loc_consum}}'}<br/>
              Data: {'{{data_emitere}}'}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 hover:border-[#FFB300] transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-4">Trageți fișierul .docx sau apăsați butonul</p>
            <input ref={fileRef} type="file" accept=".docx" onChange={onUpload} className="hidden" data-testid="template-file-input" />
            <button disabled={busy} onClick={() => fileRef.current?.click()} className="amber-btn" data-testid="upload-template-btn">
              {busy ? 'Se încarcă...' : 'Încarcă șablon'}
            </button>
          </div>
        </div>
      </div>

      <div className="label mb-4">// Șabloanele mele ({items.length})</div>
      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Niciun șablon încărcat. Începeți prin a clona unul din șabloanele de sistem de mai sus.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200" data-testid="templates-list">
          {items.map((t) => (
            <div key={t.template_id} className="bg-white p-6 flex flex-col" data-testid={`template-${t.template_id}`}>
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-6 h-6" />
                <button onClick={() => onDelete(t.template_id)} className="text-gray-400 hover:text-[#DC2626]" data-testid={`delete-template-${t.template_id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold mb-1 truncate">{t.name}</h3>
              <div className="text-xs text-gray-500 mb-3">
                {t.placeholders.length} câmpuri · {(t.size_bytes/1024).toFixed(1)} KB
              </div>
              <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
                {t.placeholders.slice(0,4).map((p) => (
                  <span key={p} className="mono text-[10px] bg-gray-100 px-1.5 py-0.5">{p}</span>
                ))}
                {t.placeholders.length > 4 && <span className="text-[10px] text-gray-500">+{t.placeholders.length - 4}</span>}
              </div>
              <Link to={`/templates/${t.template_id}`} className="mt-auto outline-btn justify-between" data-testid={`open-template-${t.template_id}`}>
                Generează document <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
