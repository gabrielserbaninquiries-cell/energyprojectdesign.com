import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { FolderOpen, ChevronDown } from 'lucide-react';

export default function ActiveProjectBar() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/projects?include_archived=false');
      setItems(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener('active-project-changed', onChange);
    return () => window.removeEventListener('active-project-changed', onChange);
  }, [load]);

  const active = items.find(p => p.active);

  const activate = async (id) => {
    try {
      await api.post(`/projects/${id}/activate`);
      window.dispatchEvent(new Event('active-project-changed'));
      setOpen(false);
    } catch (err) {
      console.error('Failed to activate project:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#F9FAFB] hover:bg-gray-100 border border-gray-200 text-xs"
        data-testid="active-project-bar"
      >
        <FolderOpen className="w-3.5 h-3.5 text-[#FFB300]" />
        <span className="font-medium max-w-[180px] truncate">{active?.name || 'Niciun proiect'}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 shadow-lg z-50 max-h-80 overflow-y-auto" data-testid="active-project-menu">
          <div className="p-2 max-h-56 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500">Niciun proiect.</div>
            ) : items.map((p) => (
              <button
                key={p.project_id}
                onClick={() => activate(p.project_id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${p.active ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                data-testid={`switch-${p.project_id}`}
              >
                <div className="font-medium truncate">{p.name}</div>
                <div className={`text-[10px] mono mt-0.5 ${p.active ? 'text-gray-300' : 'text-gray-500'}`}>{p.industry} / {p.subdomain} · {p.completion ?? 0}%</div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2">
            <Link onClick={() => setOpen(false)} to="/proiecte" className="block w-full text-center text-xs px-3 py-1.5 bg-[#FFB300] text-black font-semibold hover:bg-[#FFA000]" data-testid="manage-projects-link">
              Gestionează proiecte →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
