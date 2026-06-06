import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    (async () => {
      const hash = window.location.hash || '';
      const m = hash.match(/session_id=([^&]+)/);
      if (!m) { nav('/login'); return; }
      try {
        const { data } = await api.post('/auth/google/session', { session_id: m[1] });
        if (data.token) localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        // Clean URL fragment
        window.history.replaceState({}, document.title, window.location.pathname);
        nav('/dashboard');
      } catch (e) {
        nav('/login');
      }
    })();
  }, [nav, setUser]);

  return <div className="h-screen flex items-center justify-center text-sm text-gray-500">Se finalizează autentificarea…</div>;
}
