import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { STATE_DEFINITIONS } from '../context/dme-states';

/* ─── Element filtering ──────────────────────────────────────── */
const SKIP_TAGS = new Set([
  'script','style','head','meta','link','noscript','template','base','title','br',
  'defs','clippath','lineargradient','radialgradient','stop','filter','mask','symbol',
]);

function shouldSkip(el) {
  if (!el || !el.tagName) return true;
  if (SKIP_TAGS.has(el.tagName.toLowerCase())) return true;
  return el.hasAttribute('data-devmode-panel') || el.hasAttribute('data-devmode-ignore')
    || el.closest('[data-devmode-panel]') || el.closest('[data-devmode-ignore]');
}

function makeLabel(el) {
  const tag = el.tagName.toLowerCase();
  const cls = typeof el.className === 'string'
    ? el.className.split(/\s+/).filter(c => c).slice(0, 3).join('.')
    : '';
  return cls ? `${tag}.${cls}` : tag;
}

/* ─── Build a CSS selector that can re-find this element ─────── */
function buildSelector(el) {
  if (!el || el === document.body) return 'body';
  if (el.id) return `#${el.id}`;

  const parts = [];
  let cur = el;
  while (cur && cur !== document.body) {
    const tag = cur.tagName.toLowerCase();
    if (cur.id) {
      parts.unshift(`#${cur.id}`);
      break;
    }
    const classes = typeof cur.className === 'string'
      ? cur.className.split(/\s+/).filter(c => c && !c.startsWith('hover') && !c.startsWith('active'))
      : [];
    let segment = tag;
    if (classes.length > 0) {
      segment += '.' + classes.join('.');
    }
    const parent = cur.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        s => s.tagName === cur.tagName &&
          (classes.length === 0 || (typeof s.className === 'string' && classes.every(c => s.className.split(/\s+/).includes(c))))
      );
      if (siblings.length > 1) {
        const idx = siblings.indexOf(cur) + 1;
        segment += `:nth-of-type(${idx})`;
      }
    }
    parts.unshift(segment);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

function findElement(selector) {
  try { return document.querySelector(selector); } catch { return null; }
}

/* ─── Detachable / draggable panel hook ───────────────────────── */
function useDetachablePanel(defaultPos, defaultSize, panelId) {
  const [detached, setDetached] = useState(false);
  const [pos, setPos] = useState(defaultPos);
  const [size, setSize] = useState(defaultSize);

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

  /* Listen for recenter-panel custom events */
  useEffect(() => {
    if (!panelId) return;
    const handler = (e) => {
      if (e.detail?.id === panelId) {
        setPos({
          x: Math.round((window.innerWidth - size.w) / 2),
          y: Math.round((window.innerHeight - size.h) / 2),
        });
      }
    };
    window.addEventListener('recenter-panel', handler);
    return () => window.removeEventListener('recenter-panel', handler);
  }, [panelId, size]);

  return { detached, pos, size, onDragStart, onResizeStart, detach, dock };
}

/* ─── Shared sub-components ──────────────────────────────────── */
const DetachIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="1.5"/>
    <path d="M6 10v4h8V6h-4"/>
  </svg>
);
const DockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="14" height="14" rx="2"/>
    <rect x="1" y="1" width="6" height="14" rx="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

function ResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 16, height: 16, cursor: 'nwse-resize', zIndex: 2,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: 'absolute', bottom: 2, right: 2 }}>
        <path d="M14 4l-10 10M14 8l-6 6M14 12l-2 2" stroke="#666" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}

function DmeToggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        position: 'relative', width: 36, height: 20, borderRadius: 10,
        background: value ? '#4caf82' : '#444',
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

/* ─── Chat bubble SVG icon ───────────────────────────────────── */
function ChatIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="13" x2="13" y2="13"/>
    </svg>
  );
}

/* ─── Marker colors ──────────────────────────────────────────── */
const MARKER_BG = '#e53935';
const MARKER_BG_HOVER = '#ef5350';
const MARKER_SIZE = 22;

/* ═══════════════════════════════════════════════════════════════
   CommentsInspector — main component
   ═══════════════════════════════════════════════════════════════ */
export default function CommentsInspector({
  visible, onClose,
  comments, onCommentsChange,
  states, onStateChange,
}) {
  const [picking, setPicking] = useState(false);
  const [hoveredEl, setHoveredEl] = useState(null);
  const [overlayRect, setOverlayRect] = useState(null);
  const [draftTarget, setDraftTarget] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [draftStateKey, setDraftStateKey] = useState('');
  const [focusedCommentId, setFocusedCommentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [markerRects, setMarkerRects] = useState({});
  const rafRef = useRef(null);
  const panel = useDetachablePanel(
    { x: window.innerWidth - 380, y: 80 },
    { w: 340, h: 500 },
    'comments',
  );
  const [collapsed, setCollapsed] = useState(false);
  const [side, setSide] = useState('right');
  const [sortNewest, setSortNewest] = useState(false);

  /* ── Focused comment element + rect ──────────────────────────── */
  const focusedComment = useMemo(
    () => comments.find(c => c.id === focusedCommentId) || null,
    [comments, focusedCommentId],
  );
  const focusedEl = useMemo(
    () => focusedComment ? findElement(focusedComment.elementSelector) : null,
    [focusedComment],
  );
  const [focusedRect, setFocusedRect] = useState(null);

  useEffect(() => {
    if (!focusedEl) { setFocusedRect(null); return; }
    const update = () => {
      if (!focusedEl.isConnected) { setFocusedRect(null); return; }
      const r = focusedEl.getBoundingClientRect();
      setFocusedRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [focusedEl]);

  /* ── Clear state on close ────────────────────────────────────── */
  useEffect(() => {
    if (!visible) {
      setPicking(false);
      setHoveredEl(null);
      setOverlayRect(null);
      setDraftTarget(null);
      setDraftText('');
      setDraftStateKey('');
      setFocusedCommentId(null);
      setEditingId(null);
      setEditText('');
    }
  }, [visible]);

  /* ── Marker positions — recalculate on scroll/resize/comments ── */
  useEffect(() => {
    if (!visible) { setMarkerRects({}); return; }
    const update = () => {
      const rects = {};
      comments.forEach(c => {
        const el = findElement(c.elementSelector);
        if (el && el.isConnected) {
          const r = el.getBoundingClientRect();
          rects[c.id] = { top: r.top, right: r.right, left: r.left, width: r.width, height: r.height };
        }
      });
      setMarkerRects(rects);
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [visible, comments]);

  /* ── Pick mode: mousemove → green highlight ──────────────────── */
  useEffect(() => {
    if (!visible || !picking) { setOverlayRect(null); setHoveredEl(null); return; }
    const handler = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || shouldSkip(target)) { setOverlayRect(null); setHoveredEl(null); return; }
        setHoveredEl(target);
        const r = target.getBoundingClientRect();
        setOverlayRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    document.addEventListener('mousemove', handler, true);
    return () => {
      document.removeEventListener('mousemove', handler, true);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [visible, picking]);

  /* ── Pick mode: click to capture element ─────────────────────── */
  useEffect(() => {
    if (!visible || !picking) return;
    const handler = (e) => {
      if (shouldSkip(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      keyPickRef.current = false;
      setDraftTarget({
        el,
        selector: buildSelector(el),
        label: makeLabel(el),
      });
      setPicking(false);
      setOverlayRect(null);
      setHoveredEl(null);
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [visible, picking]);

  /* ── Pick mode: set crosshair cursor ─────────────────────────── */
  useEffect(() => {
    if (picking) {
      document.body.style.cursor = 'crosshair';
      return () => { document.body.style.cursor = ''; };
    }
  }, [picking]);

  /* ── Ctrl+Cmd held → temporary pick mode ─────────────────────── */
  const keyPickRef = useRef(false);
  useEffect(() => {
    if (!visible) return;
    const check = (e) => {
      const held = e.ctrlKey && e.metaKey;
      if (held && !keyPickRef.current && !picking && !draftTarget) {
        keyPickRef.current = true;
        setPicking(true);
      } else if (!held && keyPickRef.current) {
        keyPickRef.current = false;
        if (!draftTarget) {
          setPicking(false);
          setOverlayRect(null);
          setHoveredEl(null);
        }
      }
    };
    document.addEventListener('keydown', check, true);
    document.addEventListener('keyup', check, true);
    // Also cancel on blur (e.g. user switches windows while held)
    const blur = () => {
      if (keyPickRef.current) {
        keyPickRef.current = false;
        if (!draftTarget) {
          setPicking(false);
          setOverlayRect(null);
          setHoveredEl(null);
        }
      }
    };
    window.addEventListener('blur', blur);
    return () => {
      document.removeEventListener('keydown', check, true);
      document.removeEventListener('keyup', check, true);
      window.removeEventListener('blur', blur);
    };
  }, [visible, picking, draftTarget]);

  /* ── Save a comment ──────────────────────────────────────────── */
  const handleSave = useCallback(() => {
    if (!draftTarget || !draftText.trim()) return;
    const comment = {
      id: crypto.randomUUID(),
      elementSelector: draftTarget.selector,
      elementLabel: draftTarget.label,
      text: draftText.trim(),
      stateKey: draftStateKey || null,
      createdAt: Date.now(),
    };
    onCommentsChange([...comments, comment]);
    setDraftTarget(null);
    setDraftText('');
    setDraftStateKey('');
  }, [draftTarget, draftText, draftStateKey, comments, onCommentsChange]);

  const handleCancel = useCallback(() => {
    setDraftTarget(null);
    setDraftText('');
    setDraftStateKey('');
  }, []);

  const handleDelete = useCallback((id) => {
    onCommentsChange(comments.filter(c => c.id !== id));
    if (focusedCommentId === id) setFocusedCommentId(null);
    if (editingId === id) { setEditingId(null); setEditText(''); }
  }, [comments, onCommentsChange, focusedCommentId, editingId]);

  /* ── Edit ─────────────────────────────────────────────────────── */
  const handleStartEdit = useCallback((comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editText.trim()) return;
    onCommentsChange(comments.map(c =>
      c.id === editingId ? { ...c, text: editText.trim() } : c
    ));
    setEditingId(null);
    setEditText('');
  }, [editingId, editText, comments, onCommentsChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  /* ── Focus a comment (click-based, persistent) ────────────────── */
  const handleFocusComment = useCallback((id) => {
    setFocusedCommentId(prev => prev === id ? null : id);
  }, []);

  /* ── Click a saved comment → focus + scroll to element ───────── */
  const handleCommentClick = useCallback((comment) => {
    setFocusedCommentId(comment.id);
    const el = findElement(comment.elementSelector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /* ── Click outside → clear focus ─────────────────────────────── */
  useEffect(() => {
    if (!visible || !focusedCommentId) return;
    const handler = (e) => {
      const target = e.target;
      if (target.closest('[data-devmode-panel]') || target.closest('[data-devmode-ignore]')) return;
      setFocusedCommentId(null);
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [visible, focusedCommentId]);

  /* ── Start add comment ───────────────────────────────────────── */
  const handleStartPick = useCallback(() => {
    setDraftTarget(null);
    setDraftText('');
    setDraftStateKey('');
    setEditingId(null);
    setEditText('');
    setPicking(true);
  }, []);

  /* ── Marker click → scroll + focus ───────────────────────────── */
  const handleMarkerClick = useCallback((comment) => {
    setFocusedCommentId(comment.id);
    const el = findElement(comment.elementSelector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  if (!visible) return null;

  /* ═══ Panel positioning ═══════════════════════════════════════ */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #555',
      }
    : {
        position: 'fixed', top: 0,
        right: side === 'right' ? 0 : 'auto',
        left:  side === 'left'  ? 0 : 'auto',
        width: 340, height: '100vh',
      };

  /* ── Collapse tab — only when docked ─────────────────────────── */
  const tabRadius = side === 'right' ? '6px 0 0 6px' : '0 6px 6px 0';
  const tabArrowRight = side === 'right' ? !collapsed : collapsed;
  const tabArrow = (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d={tabArrowRight ? 'M1 1l6 6-6 6' : 'M7 1l-6 6 6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const tabBaseStyle = {
    background: '#1c1c1c',
    border: '1px solid #444',
    [side === 'right' ? 'borderRight' : 'borderLeft']: 'none',
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
      title={collapsed ? 'Expand Comments' : 'Collapse Comments'}
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: collapsed ? 0 : 340,
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
    return (
      <>
  
        {collapseTab}
        {/* Still show markers when collapsed */}
        <PageMarkers
          comments={comments}
          markerRects={markerRects}
          focusedCommentId={focusedCommentId}
          onFocus={handleFocusComment}
          onClick={handleMarkerClick}
        />
      </>
    );
  }

  return (
    <>

      {collapseTab}

      {/* ── Page markers ────────────────────────────────────────── */}
      <PageMarkers
        comments={comments}
        markerRects={markerRects}
        focusedCommentId={focusedCommentId}
        onFocus={handleFocusComment}
        onClick={handleMarkerClick}
      />

      {/* ── Focus dimming overlay ───────────────────────────────── */}
      {focusedRect && (
        <>
          {/* Full-page dim */}
          <div
            data-devmode-ignore
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.45)',
              pointerEvents: 'none',
              zIndex: 9996,
              transition: 'opacity 0.2s ease',
            }}
          />
          {/* Cut-out highlight for focused element */}
          <div
            data-devmode-ignore
            style={{
              position: 'fixed',
              top: focusedRect.top - 4, left: focusedRect.left - 4,
              width: focusedRect.width + 8, height: focusedRect.height + 8,
              border: '2px solid rgba(76,175,130,0.7)',
              borderRadius: 4,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              background: 'transparent',
              pointerEvents: 'none',
              zIndex: 9997,
              transition: 'all 0.15s ease',
            }}
          />
        </>
      )}

      {/* ── Pick-mode hover overlay ─────────────────────────────── */}
      {picking && overlayRect && (
        <div
          data-devmode-ignore
          style={{
            position: 'fixed',
            top: overlayRect.top, left: overlayRect.left,
            width: overlayRect.width, height: overlayRect.height,
            background: 'rgba(76,175,130,0.08)',
            border: '1.5px solid rgba(76,175,130,0.5)',
            borderRadius: 2,
            pointerEvents: 'none',
            zIndex: 9997,
            transition: 'all 0.05s ease',
          }}
        />
      )}
      {picking && overlayRect && hoveredEl && (
        <div
          data-devmode-ignore
          style={{
            position: 'fixed',
            top: overlayRect.top - 26,
            left: overlayRect.left,
            background: '#1c1c1c',
            color: '#4caf82',
            fontSize: 10,
            fontFamily: 'monospace',
            padding: '3px 8px',
            borderRadius: 3,
            pointerEvents: 'none',
            zIndex: 9997,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(76,175,130,0.3)',
          }}
        >
          {makeLabel(hoveredEl)}
        </div>
      )}

      {/* ═══ Panel ═══════════════════════════════════════════════ */}
      <div data-devmode-panel data-devmode-ignore style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : (side === 'right' ? '-6px 0 32px rgba(0,0,0,0.5)' : '6px 0 32px rgba(0,0,0,0.5)'),
        overflow: 'hidden',
      }}>
        {panel.detached && <ResizeHandle onMouseDown={panel.onResizeStart} />}

        {/* ── Header strip ──────────────────────────────────────── */}
        <div
          onMouseDown={panel.detached ? panel.onDragStart : undefined}
          style={{
            padding: '8px 12px', borderBottom: '1px solid #333',
            flexShrink: 0, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: panel.detached ? 'grab' : 'default',
            userSelect: 'none',
          }}
        >
          <span style={{
            fontWeight: 700, fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#4caf82',
          }}>
            Handoff Notes
            {comments.length > 0 && (
              <span style={{ marginLeft: 6, color: '#999', fontWeight: 400 }}>
                ({comments.length})
              </span>
            )}
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <button
              onClick={() => setSortNewest(s => !s)}
              title={sortNewest ? 'Sorted: newest first' : 'Sorted: oldest first'}
              style={{
                background: sortNewest ? '#333' : 'none', border: 'none', cursor: 'pointer',
                color: sortNewest ? '#e0e0e0' : '#888', padding: '3px 6px', borderRadius: 3,
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 9, fontWeight: 600, letterSpacing: '0.03em',
              }}
              onMouseEnter={e => { if (!sortNewest) e.currentTarget.style.color = '#ccc'; }}
              onMouseLeave={e => { if (!sortNewest) e.currentTarget.style.color = '#888'; }}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d={sortNewest ? 'M8 12V4M5 7l3-3 3 3' : 'M8 4v8M5 9l3 3 3-3'} />
              </svg>
              Date
            </button>
            <div style={{ width: 1, height: 14, background: '#444', margin: '0 2px' }} />
            {!panel.detached && (
              <>
                <button title="Dock left" onClick={() => setSide('left')} style={{
                  background: side === 'left' ? '#333' : 'none', border: 'none', padding: '4px 6px',
                  color: side === 'left' ? '#e0e0e0' : '#888', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', borderRadius: 3,
                }}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
                <button title="Dock right" onClick={() => setSide('right')} style={{
                  background: side === 'right' ? '#333' : 'none', border: 'none', padding: '4px 6px',
                  color: side === 'right' ? '#e0e0e0' : '#888', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', borderRadius: 3,
                }}>
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
            <div style={{ width: 1, height: 14, background: '#444', margin: '0 2px' }} />
            <button
              onClick={onClose}
              title="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888', padding: '2px 4px', borderRadius: 3,
                fontSize: 14, lineHeight: 1, display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Panel body ────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* ── Draft form ───────────────────────────────────────── */}
          {draftTarget && (
            <div style={{
              padding: 12, borderBottom: '1px solid #333',
              background: '#1a1a1a',
            }}>
              <div style={{
                fontSize: 10, fontFamily: 'monospace',
                color: '#5cd89a', marginBottom: 8,
                padding: '4px 8px', background: '#0d1f14', borderRadius: 3,
                border: '1px solid rgba(76,175,130,0.25)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {draftTarget.label}
              </div>
              <textarea
                autoFocus
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder="Add your comment..."
                style={{
                  width: '100%', minHeight: 72, padding: 8,
                  background: '#252525', color: '#e8e8e8',
                  border: '1px solid #444', borderRadius: 4,
                  fontSize: 12, fontFamily: 'inherit', resize: 'vertical',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#4caf82'}
                onBlur={e => e.target.style.borderColor = '#444'}
              />
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 10, color: '#aaa', display: 'block', marginBottom: 4 }}>
                  Attach DME state (optional)
                </label>
                <select
                  value={draftStateKey}
                  onChange={e => setDraftStateKey(e.target.value)}
                  style={{
                    width: '100%', padding: '5px 8px',
                    background: '#252525', color: '#ddd',
                    border: '1px solid #444', borderRadius: 4,
                    fontSize: 11, outline: 'none',
                  }}
                >
                  <option value="">None</option>
                  {STATE_DEFINITIONS.map(def => (
                    <option key={def.key} value={def.key}>{def.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  onClick={handleSave}
                  disabled={!draftText.trim()}
                  style={{
                    flex: 1, padding: '6px 0',
                    background: draftText.trim() ? '#4caf82' : '#444',
                    color: draftText.trim() ? '#fff' : '#888',
                    border: 'none', borderRadius: 4,
                    fontSize: 11, fontWeight: 600, cursor: draftText.trim() ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1, padding: '6px 0',
                    background: '#2a2a2a', color: '#ccc',
                    border: '1px solid #444', borderRadius: 4,
                    fontSize: 11, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Picking indicator ────────────────────────────────── */}
          {picking && !draftTarget && (
            <div style={{
              padding: '12px 16px', textAlign: 'center',
              color: '#5cd89a', fontSize: 11, fontWeight: 500,
              borderBottom: '1px solid #333',
              background: 'rgba(76,175,130,0.05)',
            }}>
              Click an element on the page to comment on it
            </div>
          )}

          {/* ── Saved comments list ──────────────────────────────── */}
          {comments.length === 0 && !draftTarget && !picking && (
            <div style={{
              padding: '32px 16px', textAlign: 'center',
              color: '#888', fontSize: 11,
            }}>
              No comments yet. Click "+ Add Comment" to start.
            </div>
          )}

          {(sortNewest ? [...comments].sort((a, b) => b.createdAt - a.createdAt) : comments).map((comment, index) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              index={index}
              states={states}
              onStateChange={onStateChange}
              onClick={() => handleCommentClick(comment)}
              onDelete={() => handleDelete(comment.id)}
              isFocused={focusedCommentId === comment.id}
              onFocusComment={() => handleFocusComment(comment.id)}
              isEditing={editingId === comment.id}
              editText={editingId === comment.id ? editText : ''}
              onEditTextChange={setEditText}
              onStartEdit={() => handleStartEdit(comment)}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          ))}

          <div style={{ flex: 1 }} />

          {/* ── Add Comment button (hidden on heath.co) ────────── */}
          {!draftTarget && !picking && !window.location.hostname.endsWith('heath.co') && (
            <div style={{ padding: 12, borderTop: '1px solid #333' }}>
              <button
                onClick={handleStartPick}
                style={{
                  width: '100%', padding: '8px 0',
                  background: 'transparent',
                  color: '#5cd89a',
                  border: '1px dashed rgba(76,175,130,0.5)',
                  borderRadius: 4,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(76,175,130,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(76,175,130,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(76,175,130,0.5)';
                }}
              >
                + Add Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PageMarkers — numbered pins on the page
   ═══════════════════════════════════════════════════════════════ */
function PageMarkers({ comments, markerRects, focusedCommentId, onFocus, onClick }) {
  return comments.map((comment, i) => {
    const rect = markerRects[comment.id];
    if (!rect) return null;
    const isFocused = focusedCommentId === comment.id;
    return (
      <div
        key={comment.id}
        data-devmode-ignore
        onClick={(e) => { e.stopPropagation(); onFocus(comment.id); onClick(comment); }}
        style={{
          position: 'fixed',
          top: rect.top - MARKER_SIZE / 2 + 2,
          left: rect.right - MARKER_SIZE / 2 - 2,
          width: MARKER_SIZE, height: MARKER_SIZE,
          borderRadius: '50%',
          background: isFocused ? MARKER_BG_HOVER : MARKER_BG,
          color: '#fff',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9998,
          boxShadow: isFocused
            ? '0 0 0 3px rgba(76,175,130,0.4), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 2px 6px rgba(0,0,0,0.4)',
          transform: isFocused ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
          userSelect: 'none',
          border: '2px solid #fff',
        }}
      >
        {i + 1}
      </div>
    );
  });
}

/* ═══════════════════════════════════════════════════════════════
   CommentCard — a single saved comment
   ═══════════════════════════════════════════════════════════════ */
function CommentCard({
  comment, index, states, onStateChange, onClick, onDelete,
  isFocused, onFocusComment,
  isEditing, editText, onEditTextChange, onStartEdit, onSaveEdit, onCancelEdit,
}) {
  const stateDef = comment.stateKey
    ? STATE_DEFINITIONS.find(d => d.key === comment.stateKey)
    : null;
  const stateVal = comment.stateKey ? (states[comment.stateKey] ?? false) : null;
  const el = findElement(comment.elementSelector);
  const canNavigate = !!el;
  const timeAgo = formatTimeAgo(comment.createdAt);
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    if (expanded || !textRef.current) return;
    setIsClamped(textRef.current.scrollHeight > textRef.current.clientHeight + 1);
  }, [comment.text, expanded]);

  const isEven = index % 2 === 0;
  const baseBg = isEven ? '#1c1c1c' : '#212121';
  const focusBg = '#1a2e24';
  const commentNumber = index + 1;

  return (
    <div
      onClick={onFocusComment}
      style={{
        padding: '10px 12px',
        borderBottom: '1px solid #2e2e2e',
        background: isFocused ? focusBg : baseBg,
        cursor: 'pointer',
        transition: 'background 0.12s ease',
      }}
    >
      {/* Header row: number + element label + date + edit/delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        {/* Comment number badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 18, height: 18, borderRadius: '50%',
          background: isFocused ? '#4caf82' : '#333',
          color: isFocused ? '#fff' : '#bbb',
          fontSize: 9, fontWeight: 700, flexShrink: 0,
          transition: 'background 0.12s, color 0.12s',
        }}>
          {commentNumber}
        </span>
        {/* Element label — clickable to scroll */}
        <span
          onClick={canNavigate ? onClick : undefined}
          style={{
            fontSize: 10, fontFamily: 'monospace',
            color: canNavigate ? '#5cd89a' : '#888',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
            cursor: canNavigate ? 'pointer' : 'default',
          }}
        >
          {comment.elementLabel}
        </span>
        {/* Date + Edit + Delete */}
        <span style={{ fontSize: 9, color: '#777', flexShrink: 0, whiteSpace: 'nowrap' }}>{timeAgo}</span>
        {isEditing ? (
          <button
            onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4caf82', fontSize: 10, padding: '1px 5px', borderRadius: 3,
              fontWeight: 600, flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#5cd89a'}
            onMouseLeave={e => e.currentTarget.style.color = '#4caf82'}
          >
            Save
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#777', fontSize: 10, padding: '1px 5px', borderRadius: 3,
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#bbb'}
            onMouseLeave={e => e.currentTarget.style.color = '#777'}
          >
            Edit
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#777', fontSize: 10, padding: '1px 5px', borderRadius: 3,
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e57373'}
          onMouseLeave={e => e.currentTarget.style.color = '#777'}
        >
          Del
        </button>
      </div>

      {/* Comment text or edit textarea */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <textarea
            autoFocus
            value={editText}
            onChange={e => onEditTextChange(e.target.value)}
            style={{
              width: '100%', minHeight: 56, padding: 8,
              background: '#252525', color: '#e8e8e8',
              border: '1px solid #4caf82', borderRadius: 4,
              fontSize: 12, fontFamily: 'inherit', resize: 'vertical',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#999', fontSize: 10, padding: '1px 6px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#999'}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ paddingLeft: 24 }}>
          <div
            ref={expanded ? undefined : textRef}
            style={{
              fontSize: 12, color: '#ddd', lineHeight: 1.5,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(!expanded ? {
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } : {}),
            }}
          >
            {comment.text}
          </div>
          {isClamped && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#5cd89a', fontSize: 10, padding: '10px 0',
                display: 'block', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#7ee8b5'}
              onMouseLeave={e => e.currentTarget.style.color = '#5cd89a'}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* State toggle (if attached) — label only, no key */}
      {stateDef && stateDef.type !== 'select' && (
        <div onClick={e => e.stopPropagation()} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 8, padding: '6px 8px', marginLeft: 24,
          background: '#191919', borderRadius: 4,
          border: '1px solid #333',
        }}>
          <span style={{ fontSize: 10, color: '#ccc', fontWeight: 600 }}>{stateDef.label}</span>
          <DmeToggle
            value={!!stateVal}
            onChange={() => onStateChange(comment.stateKey, !stateVal)}
          />
        </div>
      )}

      {/* State select */}
      {stateDef && stateDef.type === 'select' && (
        <div onClick={e => e.stopPropagation()} style={{
          marginTop: 8, padding: '6px 8px', marginLeft: 24,
          background: '#191919', borderRadius: 4,
          border: '1px solid #333',
        }}>
          <div style={{ fontSize: 10, color: '#ccc', fontWeight: 600, marginBottom: 4 }}>
            {stateDef.label}
          </div>
          <select
            value={states[comment.stateKey] ?? stateDef.defaultValue}
            onChange={e => onStateChange(comment.stateKey, e.target.value)}
            style={{
              width: '100%', padding: '4px 6px',
              background: '#252525', color: '#ddd',
              border: '1px solid #444', borderRadius: 3,
              fontSize: 10, outline: 'none',
            }}
          >
            {stateDef.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

/* ─── Time formatting helper ──────────────────────────────────── */
function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
