import { useEffect, useRef, useState } from 'react';
import AppShell from '../components/AppShell';
import api, { API } from '../lib/api';
import { toast } from 'sonner';
import { Upload, Trash2, Stamp as StampIcon } from 'lucide-react';

export default function Stamps() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const token = localStorage.getItem('auth_token') || '';

  const load = async () => {
    const { data } = await api.get('/stamps');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    const fd = new FormData(); fd.append('file', file); fd.append('name', file.name);
    try {
      await api.post('/stamps/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Ștampilă încărcată');
      await load();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Eroare'); }
    finally { setBusy(false); e.target.value = ''; }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ștergeți această ștampilă?')) return;
    await api.delete(`/stamps/${id}`);
    toast.success('Șters'); await load();
  };

  return (
    <AppShell title="Ștampile">
      <div className="bg-white border border-gray-200 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="label mb-2">// Imagini PNG cu transparență</div>
            <h2 className="text-2xl font-semibold tracking-tight mb-3">Încărcați ștampila firmei</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pentru rezultate cele mai bune: PNG cu fundal transparent, rezoluție 300 DPI, dimensiune reală 4-5 cm. Acceptăm și JPG.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 hover:border-[#FFB300] transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-3" />
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={onUpload} className="hidden" data-testid="stamp-file-input" />
            <button disabled={busy} onClick={() => fileRef.current?.click()} className="amber-btn" data-testid="upload-stamp-btn">
              {busy ? 'Se încarcă...' : 'Încarcă ștampilă'}
            </button>
          </div>
        </div>
      </div>

      <div className="label mb-4">// Ștampilele mele ({items.length})</div>
      {items.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center text-sm text-gray-500">Nicio ștampilă încărcată.</div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200" data-testid="stamps-list">
          {items.map((s) => (
            <div key={s.stamp_id} className="bg-white p-6" data-testid={`stamp-${s.stamp_id}`}>
              <div className="aspect-square bg-[#F9FAFB] border border-gray-200 flex items-center justify-center mb-3 overflow-hidden">
                <img src={`${API}/stamps/${s.stamp_id}/image`} alt={s.name} className="max-w-full max-h-full object-contain" crossOrigin="anonymous" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-medium truncate flex-1">{s.name}</div>
                <button onClick={() => onDelete(s.stamp_id)} className="text-gray-400 hover:text-[#DC2626]" data-testid={`delete-stamp-${s.stamp_id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
