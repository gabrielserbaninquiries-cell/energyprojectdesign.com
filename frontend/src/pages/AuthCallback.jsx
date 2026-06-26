import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../lib/api';
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
        // V12.1 FIX — store token where api.js can find it (sessionStorage key 'epd_auth_token'),
        // not legacy localStorage.auth_token (which was being purged on every mount).
        if (data.token) setAuthToken(data.token);
        setUser(data.user);
        // Clean URL fragment so a subsequent reload doesn't re-trigger session exchange
        window.history.replaceState({}, document.title, window.location.pathname);
        nav('/dashboard', { replace: true });
      } catch (e) {
        nav('/login', { replace: true });
      }
    })();
  }, [nav, setUser]);

  return <div className="h-screen flex items-center justify-center text-sm text-gray-500">Se finalizează autentificarea…</div>;
}
