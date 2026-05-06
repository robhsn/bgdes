import { useState, useEffect, useRef } from 'react';

/**
 * useState-compatible hook that mirrors its value to sessionStorage so
 * stakeholder/dev-driven UI state changes (cancelled requests, accepted
 * invites, dismissed banners, etc.) persist for the tab session without
 * being baked in as the default for everyone.
 *
 * Pass a stable `key`. Initial value is read from sessionStorage on first
 * mount; further setState calls write back through.
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
    } catch {}
  }, [value]);

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
