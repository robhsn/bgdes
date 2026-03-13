import React, { useState, useRef, useCallback } from 'react';

/* ─── Child button definitions ───────────────────────────────── */
const CHILDREN = [
  { id: 'dme',      label: 'DME / Tokens' },
  { id: 'states',   label: 'States' },
  { id: 'devmode',  label: 'DevMode' },
  { id: 'comments', label: 'Comments' },
  { id: 'pagenav',  label: 'Page Nav' },
];

/* Vertical stack spacing */
const CHILD_GAP = 46; // px between button centers

/* ─── Icon SVGs for each child ───────────────────────────────── */
function PaintBrushIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  );
}

function StatesIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="16" cy="12" r="4" fill={color} opacity="0.3" />
    </svg>
  );
}

function DevModeIcon({ color }) {
  return (
    <span style={{ color, fontSize: 14, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{'</>'}</span>
  );
}

function ChatIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="13" x2="13" y2="13"/>
    </svg>
  );
}

function PageIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

const CHILD_ICONS = {
  dme:      (color) => <PaintBrushIcon color={color} />,
  states:   (color) => <StatesIcon color={color} />,
  devmode:  (color) => <DevModeIcon color={color} />,
  comments: (color) => <ChatIcon color={color} />,
  pagenav:  (color) => <PageIcon color={color} />,
};

/* ─── Smiley face SVG ────────────────────────────────────────── */
function SmileyIcon({ bright }) {
  const color = bright ? '#e0e0e0' : '#999';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   RadialFAB — main button with radial child arc
   ═══════════════════════════════════════════════════════════════ */
export default function RadialFAB({ activePanel, pageNavOpen, onTogglePanel, onTogglePageNav }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const handleEnter = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const handleChildClick = useCallback((id) => {
    if (id === 'pagenav') {
      onTogglePageNav();
    } else {
      onTogglePanel(id);
    }
  }, [onTogglePanel, onTogglePageNav]);

  const isChildActive = (id) => {
    if (id === 'pagenav') return pageNavOpen;
    return activePanel === id;
  };

  const anyActive = activePanel != null || pageNavOpen;

  return (
    <div
      data-devmode-ignore
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9998,
        /* Cover the vertical stack so mouse can travel between buttons */
        width: 50,
        height: CHILDREN.length * CHILD_GAP + 50,
        pointerEvents: 'none',
      }}
    >
      {/* Child buttons */}
      {CHILDREN.map((child, i) => {
        const active = isChildActive(child.id);
        const iconColor = active ? '#58ddff' : '#bbb';
        const offset = (i + 1) * CHILD_GAP; // distance above main button

        return (
          <button
            key={child.id}
            title={child.label}
            onClick={() => handleChildClick(child.id)}
            style={{
              position: 'absolute',
              bottom: offset,
              right: 4,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: active ? 'rgba(12,55,117,0.9)' : 'rgba(28,28,28,0.9)',
              border: active ? '1px solid rgba(88,221,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              pointerEvents: open ? 'auto' : 'none',
              opacity: open ? 1 : 0,
              transform: open ? 'scale(1)' : 'scale(0.3)',
              transition: `opacity 0.1s ease ${i * 20}ms, transform 0.125s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 20}ms`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              padding: 0,
            }}
          >
            {CHILD_ICONS[child.id](iconColor)}
          </button>
        );
      })}

      {/* Main smiley button */}
      <button
        aria-label="Toggle tool menu"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 45,
          height: 45,
          borderRadius: '50%',
          background: open ? 'rgba(28,28,28,1)' : 'rgba(28,28,28,0.85)',
          border: anyActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          pointerEvents: 'auto',
          opacity: anyActive || open ? 1 : 0.5,
          transition: 'opacity 0.2s, background 0.15s, border 0.15s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => { if (!anyActive && !open) e.currentTarget.style.opacity = '0.5'; }}
      >
        <SmileyIcon bright={anyActive || open} />
      </button>
    </div>
  );
}
