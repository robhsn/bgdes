import React from 'react';

const BAR_HEIGHT = 44;

export default function PageNavigator({ open, onToggle, pages, currentPageId, onNavigate }) {
  if (!open) return null;

  /* ═══ Top bar ══════════════════════════════════════════════ */
  const topBar = (
    <div
      data-devmode-ignore
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: BAR_HEIGHT,
        background: '#1c1c1c',
        borderBottom: '1px solid #333',
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        fontFamily: 'Inter, system-ui, sans-serif',
        gap: 10,
      }}
    >
      <span style={{ color: '#999', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>Page</span>
      <select
        value={currentPageId}
        onChange={e => onNavigate(e.target.value)}
        style={{
          flex: 1, maxWidth: 280,
          background: '#111', color: '#eee',
          border: '1px solid #444', borderRadius: 4,
          padding: '5px 8px', fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {pages.map(p => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      {/* Close button */}
      <button
        onClick={onToggle}
        aria-label="Close page navigator"
        style={{
          marginLeft: 'auto',
          background: 'none', border: 'none', color: '#999',
          cursor: 'pointer', fontSize: 18, lineHeight: 1,
          padding: '4px 6px', borderRadius: 4,
        }}
      >
        ✕
      </button>
    </div>
  );

  /* ═══ Spacer — pushes page content down when bar is open ═══ */
  const spacer = (
    <div data-devmode-ignore style={{ height: BAR_HEIGHT, flexShrink: 0 }} />
  );

  return (
    <>
      {spacer}
      {topBar}
    </>
  );
}
