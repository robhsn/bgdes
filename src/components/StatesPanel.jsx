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

/* ─── Visibility check for conditional states ────────────────── */
function isStateVisible(def, states) {
  if (!def.visibleWhen) return true;
  return Object.entries(def.visibleWhen).every(([key, allowedValues]) => {
    const parentDef = STATE_DEFINITIONS.find(d => d.key === key);
    const currentVal = states?.[key] ?? parentDef?.defaultValue;
    return allowedValues.includes(currentVal);
  });
}

/* ─── Collapsible group ──────────────────────────────────────── */
function StateGroup({ label, defs, states, onStateChange, open, onToggle }) {
  const visibleDefs = defs.filter(def => isStateVisible(def, states));
  if (visibleDefs.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          paddingBottom: 6, borderBottom: '1px solid #333', marginBottom: open ? 12 : 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
          <path d="M3 1l4 4-4 4" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#999',
        }}>
          {label}
        </span>
        <span style={{ fontSize: 10, color: '#555', marginLeft: 'auto' }}>{visibleDefs.length}</span>
      </button>
      {open && visibleDefs.map(def => (
        <div key={def.key} style={def.visibleWhen ? { paddingLeft: 14, borderLeft: '2px solid #2a2a2a' } : undefined}>
          <StateToggleRow
            def={def}
            value={states?.[def.key] ?? def.defaultValue}
            onStateChange={onStateChange}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── States view — grouped by global / page ─────────────────── */
function StatesView({ states, onStateChange, currentPageId, expanded, onToggleGroup }) {
  const globalDefs = STATE_DEFINITIONS.filter(def => def.type === 'global');
  const pageDefs = STATE_DEFINITIONS.filter(def =>
    def.type !== 'global' && (def.type === currentPageId || def.page === currentPageId || currentPageId?.startsWith(def.type))
  );

  return (
    <>
      <StateGroup
        label="Global States" defs={globalDefs}
        states={states} onStateChange={onStateChange}
        open={expanded.global} onToggle={() => onToggleGroup('global')}
      />
      <StateGroup
        label="Page States" defs={pageDefs}
        states={states} onStateChange={onStateChange}
        open={expanded.page} onToggle={() => onToggleGroup('page')}
      />
    </>
  );
}

/* ─── Generate valid state URL combinations for a single page ── */
function generatePageStateURLs(pageId, pageLabel) {
  const SKIP = new Set([
    'profile.onlineStatus', 'social.activityCenter', 'social.unreadCount',
    'social.activityOpen', 'global.webHeader',
  ]);

  const defaults = Object.fromEntries(STATE_DEFINITIONS.map(d => [d.key, d.defaultValue]));
  const baseURL = window.location.origin + window.location.pathname;

  function pageScoped(def) {
    const scope = def.page || def.type;
    if (scope === 'global') return true;
    if (scope === pageId) return true;
    if (scope === 'learn' && pageId.startsWith('learn')) return true;
    if (scope === 'learn-article' && pageId.startsWith('learn-article')) return true;
    return false;
  }

  function cartesian(arrays) {
    return arrays.reduce((acc, arr) =>
      acc.flatMap(combo => arr.map(val => [...combo, val])), [[]]);
  }

  function isInvalid(combo) {
    const loggedIn = combo['auth.loggedIn'] ?? defaults['auth.loggedIn'];

    if (pageId === 'profile') {
      const viewType = combo['profile.viewType'] ?? defaults['profile.viewType'];
      const tab = combo['profile.tab'] ?? defaults['profile.tab'];
      if (!loggedIn && viewType.startsWith('Own')) return true;
      if (loggedIn && viewType.startsWith('Guest')) return true;
      if (!viewType.startsWith('Own') && tab === 'Friends') return true;
      if (!viewType.startsWith('Own') && tab === 'Achievements') return true;
    }

    if (pageId === 'index') {
      const indexView = combo['index.view'] ?? defaults['index.view'];
      if (loggedIn && ['Login', 'Sign Up', 'Login Error'].includes(indexView)) return true;
    }

    if (pageId === 'settings' && !loggedIn) return true;

    return false;
  }

  const defs = STATE_DEFINITIONS.filter(def => {
    if (SKIP.has(def.key)) return false;
    if (def.key === 'auth.loggedIn') return true;
    if (def.type !== 'select') return false;
    return pageScoped(def);
  });

  if (defs.length === 0) {
    return `## ${pageLabel}\n\n- **${pageLabel} — Default**\n  ${baseURL}?page=${pageId}`;
  }

  const keys = defs.map(d => d.key);
  const optionArrays = defs.map(d =>
    d.key === 'auth.loggedIn' ? [true, false] : d.options
  );

  const products = cartesian(optionArrays);
  const urlSet = new Set();
  const entries = [];

  for (const values of products) {
    const combo = {};
    keys.forEach((k, i) => combo[k] = values[i]);

    // Collapse hidden children to default
    for (const def of defs) {
      if (!def.visibleWhen) continue;
      const visible = Object.entries(def.visibleWhen).every(([pk, allowed]) =>
        allowed.includes(combo[pk] ?? defaults[pk])
      );
      if (!visible) combo[def.key] = defaults[def.key];
    }

    if (isInvalid(combo)) continue;

    // Build URL params
    const params = new URLSearchParams();
    params.set('page', pageId);
    const labelParts = [];
    for (const key of keys) {
      const val = combo[key];
      if (val === defaults[key]) continue;
      params.set(key, String(val));
      if (key === 'auth.loggedIn' && val === false) {
        labelParts.push('Logged Out');
      } else {
        labelParts.push(String(val));
      }
    }

    const url = baseURL + '?' + params.toString();
    if (urlSet.has(url)) continue;
    urlSet.add(url);

    const heading = labelParts.length === 0
      ? `${pageLabel} — Default`
      : `${pageLabel} — ${labelParts.join(' / ')}`;

    entries.push(`- **${heading}**\n  ${url}`);
  }

  return `## ${pageLabel}\n\n${entries.join('\n\n')}`;
}

/* ═══════════════════════════════════════════════════════════════
   StatesPanel — standalone detachable panel
   ═══════════════════════════════════════════════════════════════ */
export default function StatesPanel({ visible, onClose, states, onStateChange, currentPageId, pages }) {
  const panel = useDetachablePanel(
    { x: Math.round(window.innerWidth / 2 - 150), y: 80 },
    { w: 300, h: 380 },
    'states-panel',
  );
  const [dockPos, setDockPos] = useState('bottom'); // 'top' | 'bottom'
  const [expanded, setExpanded] = useState({ global: true, page: true });
  const [copyFeedback, setCopyFeedback] = useState(null);
  const allExpanded = expanded.global && expanded.page;
  const toggleGroup = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAll = () => {
    const next = !allExpanded;
    setExpanded({ global: next, page: next });
  };

  const handleCopyURLs = async () => {
    try {
      const pageDef = pages?.find(p => p.id === currentPageId);
      const text = generatePageStateURLs(currentPageId, pageDef?.label || currentPageId);
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
    } catch {
      setCopyFeedback('Failed');
    }
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  if (!visible) return null;

  /* ── Panel positioning ─────────────────────────────────────── */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #444',
      }
    : {
        position: 'fixed', left: 0, right: 0,
        ...(dockPos === 'top' ? { top: 0 } : { bottom: 0 }),
        width: '100%', maxHeight: '50vh',
      };

  return (
    <>
      <div data-devmode-ignore style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : (dockPos === 'top' ? '0 6px 32px rgba(0,0,0,0.5)' : '0 -6px 32px rgba(0,0,0,0.5)'),
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontWeight: 700, fontSize: 10, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#999',
            }}>
              States
            </span>
            <button
              onClick={toggleAll}
              title={allExpanded ? 'Collapse all groups' : 'Expand all groups'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#666', padding: '2px 4px', borderRadius: 3,
                display: 'flex', alignItems: 'center', fontSize: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#666'}
            >
              {allExpanded ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 10l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 3l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 13l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleCopyURLs}
              title="Copy all valid state URL combinations as markdown"
              style={{
                background: copyFeedback === 'Copied!' ? '#2a5a3a' : '#333',
                border: 'none', borderRadius: 9999, cursor: 'pointer',
                color: copyFeedback === 'Copied!' ? '#4caf82' : '#999',
                fontSize: 9, padding: '3px 8px', whiteSpace: 'nowrap',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { if (!copyFeedback) { e.currentTarget.style.background = '#444'; e.currentTarget.style.color = '#ccc'; } }}
              onMouseLeave={e => { if (!copyFeedback) { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#999'; } }}
            >
              {copyFeedback || 'Copy State URLs'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Dock top/bottom — only when docked */}
            {!panel.detached && (
              <>
                <button title="Dock top" onClick={() => setDockPos('top')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: dockPos === 'top' ? '#e0e0e0' : '#555',
                  padding: '2px 4px', borderRadius: 3, display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => { if (dockPos !== 'top') e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { if (dockPos !== 'top') e.currentTarget.style.color = '#555'; }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1" y="1" width="14" height="5" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
                <button title="Dock bottom" onClick={() => setDockPos('bottom')} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: dockPos === 'bottom' ? '#e0e0e0' : '#555',
                  padding: '2px 4px', borderRadius: 3, display: 'flex', alignItems: 'center',
                }}
                  onMouseEnter={e => { if (dockPos !== 'bottom') e.currentTarget.style.color = '#aaa'; }}
                  onMouseLeave={e => { if (dockPos !== 'bottom') e.currentTarget.style.color = '#555'; }}
                >
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1" y="8" width="14" height="5" rx="1.5" fill="currentColor"/>
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
          <StatesView states={states} onStateChange={onStateChange} currentPageId={currentPageId} expanded={expanded} onToggleGroup={toggleGroup} />
        </div>
      </div>
    </>
  );
}
