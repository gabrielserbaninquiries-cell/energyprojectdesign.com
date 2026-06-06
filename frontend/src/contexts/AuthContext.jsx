import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

/**
 * Auth strategy (V4.8+): httpOnly Secure SameSite=None cookie set by backend on
 * login/register/google session. Token is NEVER stored in localStorage anymore
 * (XSS-safe). Cookie is automatically sent on every request via withCredentials.
 *
 * One-time migration: drop any pre-existing localStorage token on first load.
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
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (err) { console.warn('Logout API failed (proceeding anyway):', err); }
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
