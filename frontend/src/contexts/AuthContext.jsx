import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAuthToken } from '../lib/api';

const AuthContext = createContext(null);

/**
 * V10.6.4 — Hybrid auth: cookie primary + Bearer fallback for mobile (iOS Safari ITP).
 * Token from login/register response is stored in sessionStorage and injected
 * as Authorization header automatically by api.js interceptor.
 */
function purgeLegacyToken() {
  try { localStorage.removeItem('auth_token'); } catch (_) { /* noop */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      if (err?.response?.status && err.response.status !== 401) {
        console.error('Auth check failed:', err);
      }
      // 401 — clear stale token (cookie expired or invalid)
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    purgeLegacyToken();
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // V10.6.4 — Persist token as Bearer fallback (mobile Safari ITP fix)
    if (data.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (err) { console.warn('Logout API failed (proceeding anyway):', err); }
    setAuthToken(null);
    purgeLegacyToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: checkAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
