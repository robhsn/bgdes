import React from 'react';

export default function PageNavigator({ open, onToggle, pages, currentPageId, onNavigate }) {
  if (!open) return null;

  return (
    <div
      data-devmode-ignore
      data-roletarget-panel
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10001,
        background: 'rgba(20,20,20,0.96)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 13,
        color: '#ccc',
        minHeight: 44,
      }}
    >
      <span style={{ color: '#999', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>Page</span>
      <select
        value={currentPageId}
        onChange={e => onNavigate(e.target.value)}
        style={{
          flex: 1,
          maxWidth: 280,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 6,
          color: '#fff',
          fontSize: 13,
          padding: '4px 8px',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      >
        {pages.map(p => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      <button
        onClick={onToggle}
        aria-label="Close page navigator"
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: 18,
          lineHeight: 1,
          padding: '2px 6px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
