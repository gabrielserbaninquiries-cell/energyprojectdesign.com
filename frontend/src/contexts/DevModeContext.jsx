/**
 * V11.5 — DevMode context.
 *
 * Allows toggling developer overlays (placeholder tags above inputs)
 * persistently in localStorage. Used by Gas Studio.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const DevModeContext = createContext({ devMode: false, setDevMode: () => {} });

export function DevModeProvider({ children }) {
  const [devMode, setDevMode] = useState(() => {
    try {
      return localStorage.getItem('epd_dev_mode') === '1';
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('epd_dev_mode', devMode ? '1' : '0');
    } catch (_) { /* ignore */ }
  }, [devMode]);

  return (
    <DevModeContext.Provider value={{ devMode, setDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export const useDevMode = () => useContext(DevModeContext);
