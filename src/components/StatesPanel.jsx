import React, { useState } from 'react';
import { useDetachablePanel, ResizeHandle, DetachIcon, DockIcon } from '../hooks/useDetachablePanel.jsx';
import { STATE_DEFINITIONS } from '../context/dme-states';

/* ─── Toggle switch ──────────────────────────────────────────── */
function DmeToggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative', width: 36, height: 20, borderRadius: 10,
        background: value ? '#4caf82' : '#333',
        border: 'none', cursor: 'pointer', padding: 0,
        transition: 'background 0.2s ease', flexShrink: 0, marginLeft: 12,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 19 : 3,
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s ease',
      }} />
    </button>
  );
}

/* ─── Single state row ───────────────────────────────────────── */
function StateToggleRow({ def, value, onStateChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid #242424',
    }}>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', marginBottom: 2 }}>
          {def.label}
        </div>
        {def.description && (
          <div style={{ fontSize: 10, color: '#999' }}>{def.description}</div>
        )}
      </div>
      {def.options ? (
        <select
          value={value}
          onChange={e => onStateChange(def.key, e.target.value)}
          style={{
            background: '#222', border: '1px solid #444', borderRadius: 6,
            color: '#e0e0e0', fontSize: 11, padding: '4px 8px', cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {def.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <DmeToggle value={value} onChange={() => onStateChange(def.key, !value)} />
      )}
    </div>
  );
}

/* ─── States view — grouped by global / page ─────────────────── */
function StatesView({ states, onStateChange, currentPageId }) {
  const globalDefs = STATE_DEFINITIONS.filter(def => def.type === 'global');
  const pageDefs = STATE_DEFINITIONS.filter(def =>
    def.type !== 'global' && (def.type === currentPageId || def.page === currentPageId)
  );

  function renderGroup(label, defs) {
    if (defs.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#999', marginBottom: 12,
          paddingBottom: 6, borderBottom: '1px solid #333',
        }}>
          {label}
        </div>
        {defs.map(def => (
          <StateToggleRow
            key={def.key}
            def={def}
            value={states?.[def.key] ?? def.defaultValue}
            onStateChange={onStateChange}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {renderGroup('Global States', globalDefs)}
      {renderGroup('Page States', pageDefs)}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   StatesPanel — standalone detachable panel
   ═══════════════════════════════════════════════════════════════ */
export default function StatesPanel({ visible, onClose, states, onStateChange, currentPageId }) {
  const panel = useDetachablePanel(
    { x: Math.round(window.innerWidth / 2 - 150), y: 80 },
    { w: 300, h: 380 },
    'states-panel',
  );
  const [collapsed, setCollapsed] = useState(false);

  if (!visible) return null;

  /* ── Collapse tab ──────────────────────────────────────────── */
  const tabRadius = panel.side === 'right' ? '6px 0 0 6px' : '0 6px 6px 0';
  const arrowRight = panel.side === 'right' ? !collapsed : collapsed;
  const tabArrow = (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d={arrowRight ? 'M1 1l6 6-6 6' : 'M7 1l-6 6 6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const tabBaseStyle = {
    background: '#1c1c1c',
    border: '1px solid #444',
    [panel.side === 'right' ? 'borderRight' : 'borderLeft']: 'none',
    borderRadius: tabRadius,
    color: '#aaa',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    width: 20,
    height: 48,
    transition: 'color 0.2s',
  };

  const collapseTab = !panel.detached ? (
    <button
      data-devmode-ignore
      onClick={() => setCollapsed(c => !c)}
      title={collapsed ? 'Expand States' : 'Collapse States'}
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        [panel.side]: collapsed ? 0 : 300,
        zIndex: 10000,
        ...tabBaseStyle,
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
      onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
    >
      {tabArrow}
    </button>
  ) : null;

  if (collapsed && !panel.detached) {
    return collapseTab;
  }

  /* ── Panel positioning ─────────────────────────────────────── */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #444',
      }
    : {
        position: 'fixed', top: 0,
        right: panel.side === 'right' ? 0 : 'auto',
        left:  panel.side === 'left'  ? 0 : 'auto',
        width: 300, height: '100vh',
      };

  return (
    <>
      {collapseTab}
      <div data-devmode-ignore style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : (panel.side === 'right' ? '-6px 0 32px rgba(0,0,0,0.5)' : '6px 0 32px rgba(0,0,0,0.5)'),
        overflow: 'hidden',
      }}>
        {panel.detached && <ResizeHandle onMouseDown={panel.onResizeStart} />}

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          onMouseDown={panel.detached ? panel.onDragStart : undefined}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderBottom: '1px solid #222',
            flexShrink: 0, background: '#111',
            cursor: panel.detached ? 'grab' : 'default',
            userSelect: 'none',
          }}
        >
          <span style={{
            fontWeight: 700, fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#999',
          }}>
            States
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Dock left/right — only when docked */}
            {!panel.detached && (
              <>
                <button title="Dock left" onClick={() => panel.setSide('left')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: panel.side === 'left' ? '#e0e0e0' : '#555',
                  padding: '2px 4px', borderRadius: 3, display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => { if (panel.side !== 'left') e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { if (panel.side !== 'left') e.currentTarget.style.color = '#555'; }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
                <button title="Dock right" onClick={() => panel.setSide('right')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: panel.side === 'right' ? '#e0e0e0' : '#555',
                  padding: '2px 4px', borderRadius: 3, display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => { if (panel.side !== 'right') e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { if (panel.side !== 'right') e.currentTarget.style.color = '#555'; }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="9" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={panel.detached ? panel.dock : panel.detach}
              title={panel.detached ? 'Dock panel' : 'Detach panel'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888', padding: '2px 4px', borderRadius: 3,
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              {panel.detached ? <DockIcon /> : <DetachIcon />}
            </button>
            <div style={{ width: 1, height: 14, background: '#444', margin: '0 3px' }} />
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: '#888',
              fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 3px',
            }}>×</button>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <StatesView states={states} onStateChange={onStateChange} currentPageId={currentPageId} />
        </div>
      </div>
    </>
  );
}
