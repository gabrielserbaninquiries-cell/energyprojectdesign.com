// V10.4 — useUserPlan hook
// Fetches /api/me/plan once + caches for the lifetime of the SPA session.
// Returns { plan, loading, refresh } where plan contains capabilities + usage + limits.
import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/api';

let _cached = null;       // module-level cache (single fetch per SPA load)
let _inflight = null;     // dedupe concurrent fetches

async function fetchPlan() {
  if (_inflight) return _inflight;
  _inflight = api.get('/me/plan').then((r) => {
    _cached = r.data;
    return r.data;
  }).finally(() => { _inflight = null; });
  return _inflight;
}

export function invalidateUserPlan() { _cached = null; }

export default function useUserPlan() {
  const [plan, setPlan] = useState(_cached);
  const [loading, setLoading] = useState(!_cached);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlan();
      if (mountedRef.current) setPlan(data);
    } catch (e) {
      // Silent — caller can default to no-cap fallback
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!_cached) load();
    else setLoading(false);
    return () => { mountedRef.current = false; };
  }, [load]);

  const refresh = useCallback(() => {
    invalidateUserPlan();
    return load();
  }, [load]);

  return { plan, loading, refresh };
}
