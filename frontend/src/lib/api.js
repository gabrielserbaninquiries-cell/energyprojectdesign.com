import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

/**
 * V10.6.4 — HYBRID auth (cookie + Bearer fallback for mobile Safari ITP).
 *
 * Primary: httpOnly Secure SameSite=None cookie set by backend on
 *   /auth/login + /auth/register + Google session.
 *   Cookie is auto-sent on every request via `withCredentials: true`.
 *
 * Fallback: if iOS Safari ITP, Brave Shields, or other mobile browser
 *   drops the cross-origin cookie, we mirror the token in sessionStorage
 *   and inject it as `Authorization: Bearer ...` on every request.
 *   This is XSS-safer than localStorage (cleared on tab close).
 *
 * `setAuthToken(token | null)` is called by AuthContext on login/logout.
 */

const TOKEN_KEY = 'epd_auth_token';

export function setAuthToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (_) { /* private mode */ }
}

export function getAuthToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Inject Bearer header as cookie fallback (no-op if no token)
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && !config.headers?.Authorization) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
