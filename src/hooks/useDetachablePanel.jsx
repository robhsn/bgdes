import { useState, useCallback, useEffect } from 'react';
import React from 'react';

/**
 * Shared detachable/draggable panel hook with optional localStorage persistence.
 *
 * @param {Object} defaultPos  - { x, y }
 * @param {Object} defaultSize - { w, h }
 * @param {string} [storagePrefix] - if provided, persists pos/size/detached/side to localStorage
 */
export function useDetachablePanel(defaultPos, defaultSize, storagePrefix) {
  const load = (key, fallback) => {
    if (!storagePrefix) return fallback;
    try {
      const raw = localStorage.getItem(`${storagePrefix}-${key}`);
      return raw != null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };

  const [detached, setDetached] = useState(() => load('detached', false));
  const [pos, setPos] = useState(() => load('pos', defaultPos));
  const [size, setSize] = useState(() => load('size', defaultSize));
  const [side, setSideState] = useState(() => load('side', 'right'));

  /* Persist to localStorage */
  useEffect(() => {
    if (!storagePrefix) return;
    localStorage.setItem(`${storagePrefix}-detached`, JSON.stringify(detached));
  }, [storagePrefix, detached]);

  useEffect(() => {
    if (!storagePrefix) return;
    localStorage.setItem(`${storagePrefix}-pos`, JSON.stringify(pos));
  }, [storagePrefix, pos]);

  useEffect(() => {
    if (!storagePrefix) return;
    localStorage.setItem(`${storagePrefix}-size`, JSON.stringify(size));
  }, [storagePrefix, size]);

  useEffect(() => {
    if (!storagePrefix) return;
    localStorage.setItem(`${storagePrefix}-side`, JSON.stringify(side));
  }, [storagePrefix, side]);

  const onDragStart = useCallback((e) => {
    if (!detached) return;
    e.preventDefault();
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;
    const onMove = (ev) => setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [detached, pos]);

  const onResizeStart = useCallback((e) => {
    if (!detached) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;
    const onMove = (ev) => setSize({
      w: Math.max(280, startW + ev.clientX - startX),
      h: Math.max(250, startH + ev.clientY - startY),
    });
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [detached, size]);

  const detach = useCallback(() => setDetached(true), []);
  const dock = useCallback(() => setDetached(false), []);
  const setSide = useCallback((s) => setSideState(s), []);

  return { detached, pos, size, side, onDragStart, onResizeStart, detach, dock, setSide };
}

/* ─── Shared sub-components ──────────────────────────────────── */

export const DetachIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="1.5"/>
    <path d="M6 10v4h8V6h-4"/>
  </svg>
);

export const DockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="14" height="14" rx="2"/>
    <rect x="1" y="1" width="6" height="14" rx="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

export function ResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 16, height: 16, cursor: 'nwse-resize', zIndex: 2,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: 'absolute', bottom: 2, right: 2 }}>
        <path d="M14 4l-10 10M14 8l-6 6M14 12l-2 2" stroke="#555" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}
