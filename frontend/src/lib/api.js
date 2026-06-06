import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

/**
 * V4.8+ auth model: httpOnly cookie set by backend on /auth/login + /auth/register.
 * No Authorization Bearer header from JS — XSS-safe.
 * `withCredentials: true` makes axios attach the cookie on every cross-site request.
 */
const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export default api;
