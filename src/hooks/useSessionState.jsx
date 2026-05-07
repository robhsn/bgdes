import { useState, useEffect, useRef } from 'react';

/* Cross-instance pubsub. When one component sets the value via the setter
   returned from `useSessionState`, every other mounted component reading
   the same key picks up the change without remounting. Without this,
   each useSessionState call had its own React state that only synced one
   way (write to sessionStorage), so peers stayed stale. */
const SESSION_EVENT = 'app-session-state-change';
function emitChange(key) {
  try { window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: { key } })); } catch {}
}

/**
 * useState-compatible hook that mirrors its value to sessionStorage so
 * stakeholder/dev-driven UI state changes (cancelled requests, accepted
 * invites, dismissed banners, etc.) persist for the tab session without
 * being baked in as the default for everyone.
 *
 * Pass a stable `key`. Initial value is read from sessionStorage on first
 * mount; further setState calls write back through. Cross-component
 * updates are propagated via a window-level event so peers re-render.
 */
export function useSessionState(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw == null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  const keyRef = useRef(key);
  useEffect(() => { keyRef.current = key; }, [key]);

  useEffect(() => {
    try {
      sessionStorage.setItem(keyRef.current, JSON.stringify(value));
      emitChange(keyRef.current);
    } catch {}
  }, [value]);

  // Subscribe to changes from other useSessionState instances writing to
  // the same key so this hook re-renders with the fresh value.
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.key !== keyRef.current) return;
      try {
        const raw = sessionStorage.getItem(keyRef.current);
        const next = raw == null ? initialValue : JSON.parse(raw);
        setValue(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      } catch {}
    };
    window.addEventListener(SESSION_EVENT, handler);
    return () => window.removeEventListener(SESSION_EVENT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, setValue];
}

/**
 * Convenience wrapper for Set<primitive> values, since Set is not JSON
 * serialisable. Stored as an array, exposed as a Set.
 */
export function useSessionSet(key, initialItems = []) {
  const [arr, setArr] = useSessionState(key, [...initialItems]);
  const set = new Set(arr);
  const setSet = (updater) => {
    setArr(prev => {
      const prevSet = new Set(prev);
      const next = typeof updater === 'function' ? updater(prevSet) : updater;
      return [...next];
    });
  };
  return [set, setSet];
}
