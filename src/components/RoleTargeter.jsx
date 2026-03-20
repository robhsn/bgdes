import React, { useState, useEffect, useRef, useCallback } from 'react';
import fileDefaults from '../tokens/dme-defaults.json';

/* ─── Constants ──────────────────────────────────────────────── */
const FONT_ROLES = [
  { key: 'h1',      label: 'H1' },
  { key: 'h2',      label: 'H2' },
  { key: 'h3',      label: 'H3' },
  { key: 'h4',      label: 'H4' },
  { key: 'sh1',     label: 'Subheading 1' },
  { key: 'sh2',     label: 'Subheading 2' },
  { key: 'sh3',     label: 'Subheading 3' },
  { key: 'sh4',     label: 'Subheading 4' },
  { key: 'body-lg', label: 'Body Large' },
  { key: 'body-md', label: 'Body Medium' },
  { key: 'body-sm', label: 'Body Small' },
  { key: 'pill-lg', label: 'Pill Large' },
  { key: 'pill-md', label: 'Pill Medium' },
  { key: 'pill-sm', label: 'Pill Small' },
  { key: 'ui-xl',   label: 'UI XL' },
  { key: 'ui-lg',   label: 'UI Large' },
  { key: 'ui-md',   label: 'UI Medium' },
  { key: 'ui-sm',   label: 'UI Small' },
  { key: 'ui-xsm',  label: 'UI XSM' },
];
const FONT_ROLE_KEYS = new Set(FONT_ROLES.map(r => r.key));

const BTN_VARIANTS = [
  { key: 'primary',    label: 'Primary' },
  { key: 'dark',       label: 'Dark' },
  { key: 'outline',    label: 'Outline' },
  { key: 'ghost',      label: 'Ghost' },
  { key: 'tertiary',   label: 'Tertiary' },
  { key: 'quaternary', label: 'Quaternary' },
];

const TAG_ROLE = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'body-sm', h6: 'body-sm' };

const SKIP_TAGS = new Set([
  'script','style','head','meta','link','noscript','template','base','title','br',
  'defs','clippath','lineargradient','radialgradient','stop','filter','mask','symbol','svg','path',
  'circle','rect','line','polyline','polygon','ellipse','g','use','image','text','tspan',
]);

/* ─── Helpers ────────────────────────────────────────────────── */
function shouldSkip(el) {
  if (!el || el === document.documentElement || el === document.body) return true;
  if (SKIP_TAGS.has(el.tagName.toLowerCase())) return true;
  if (el.closest?.('[data-devmode-ignore]') || el.closest?.('[data-devmode-panel]')) return true;
  if (el.closest?.('[data-roletarget-panel]')) return true;
  return false;
}

function findRoleTarget(el) {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.getAttribute?.('data-role-id')) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function findButtonEl(el) {
  let cur = el;
  while (cur && cur !== document.body) {
    if (cur.classList?.contains('com-btn')) return cur;
    cur = cur.parentElement;
  }
  return null;
}

function makeLabel(el) {
  const tag = el.tagName?.toLowerCase() || '?';
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
    : '';
  return `<${tag}${cls}>`;
}

function detectButtonVariant(btnEl) {
  for (const v of BTN_VARIANTS) {
    if (btnEl.classList.contains(`com-btn--${v.key}`)) return v.key;
  }
  return 'primary';
}

function detectFontRole(el) {
  const ff = el.style?.fontFamily || '';
  const m = ff.match(/var\(--prim-type-([\w-]+)\)/);
  if (m && FONT_ROLE_KEYS.has(m[1])) return m[1];

  if (el.classList) {
    for (const cls of el.classList) {
      const m2 = cls.match(/^article-heading--(h[1-4])$/);
      if (m2) return m2[1];
    }
  }

  const tag = el.tagName?.toLowerCase();
  if (TAG_ROLE[tag]) return TAG_ROLE[tag];

  return 'body-md';
}

/* Find nearest data-section-id ancestor to scope auto-ids per surface */
function findSectionId(el) {
  let cur = el.parentElement;
  while (cur && cur !== document.body) {
    const sid = cur.getAttribute?.('data-section-id');
    if (sid) return sid;
    cur = cur.parentElement;
  }
  return null;
}

/* Generate a stable-ish selector key for elements without data-role-id */
function autoId(el) {
  const tag = el.tagName.toLowerCase();
  const cls = (typeof el.className === 'string' ? el.className.trim() : '').split(/\s+/).join('.');
  const sectionId = findSectionId(el);
  const sectionPart = sectionId ? sectionId + '|' : '';
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const idx = siblings.indexOf(el);
    return `_auto:${sectionPart}${tag}${cls ? '.' + cls : ''}:${idx}`;
  }
  return `_auto:${sectionPart}${tag}${cls ? '.' + cls : ''}`;
}

function analyse(el, roleOverrides) {
  const roleTarget = findRoleTarget(el);
  const btnEl = findButtonEl(el);
  const target = roleTarget || btnEl || el;
  let roleId = target.getAttribute?.('data-role-id');
  if (!roleId) {
    roleId = autoId(target);
    target.setAttribute('data-role-id', roleId);  // stamp so DOM queries work
  }
  const label  = makeLabel(target);
  const rect   = target.getBoundingClientRect();

  if (roleOverrides?.[roleId]) {
    const o = roleOverrides[roleId];
    return { target, roleId, label, rect, kind: o.type, value: o.type === 'font' ? o.role : o.variant };
  }

  if (findButtonEl(target)) {
    return { target, roleId, label, rect, kind: 'button', value: detectButtonVariant(findButtonEl(target)) };
  }

  return { target, roleId, label, rect, kind: 'font', value: detectFontRole(target) };
}

/* ─── Save: read current file, merge roleOverrides, write back ── */
async function saveRoleOverrides(roleOverrides) {
  try {
    const res = await fetch('/__dme_read');
    const current = await res.json();
    current.roleOverrides = roleOverrides;
    await fetch('/__dme_save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(current),
    });
    return true;
  } catch { return false; }
}

/* ─── Styles ─────────────────────────────────────────────────── */
const OVERLAY_COLOR  = 'rgba(88,221,255,0.18)';
const OVERLAY_BORDER = 'rgba(88,221,255,0.6)';
const SEL_COLOR      = 'rgba(88,221,255,0.25)';
const SEL_BORDER     = 'rgba(88,221,255,0.9)';

const BAR = {
  position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001,
  background: 'rgba(20,20,20,0.96)', backdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
  padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
  fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 13,
  color: '#ccc', minHeight: 44,
};

const DROPDOWN = {
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 6, color: '#fff', fontSize: 13, padding: '4px 8px',
  cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
};

const BTN_BASE = {
  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
  padding: '5px 12px', cursor: 'pointer', lineHeight: 1, flexShrink: 0,
  fontFamily: 'inherit',
};

const HINT = { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginLeft: 4 };

/* ═══════════════════════════════════════════════════════════════
   RoleTargeter
   ═══════════════════════════════════════════════════════════════ */
const INIT_SAVED = fileDefaults.roleOverrides ?? {};

export default function RoleTargeter({ visible, onClose, currentPageId, roleOverrides, onRoleOverridesChange }) {
  const [hoverRect, setHoverRect] = useState(null);
  const [sel, setSel]             = useState(null);
  const [canUndo, setCanUndo]     = useState(false);
  const [canRedo, setCanRedo]     = useState(false);
  const [isDirty, setIsDirty]     = useState(false);
  const rafRef = useRef(null);
  const roRef  = useRef(roleOverrides);   // always-current roleOverrides
  const savedRef = useRef({ ...INIT_SAVED });
  const histRef = useRef([{ ...INIT_SAVED }]);
  const idxRef  = useRef(0);

  // Keep ref in sync with prop
  useEffect(() => { roRef.current = roleOverrides; }, [roleOverrides]);

  const refreshHistoryState = () => {
    setCanUndo(idxRef.current > 0);
    setCanRedo(idxRef.current < histRef.current.length - 1);
  };

  const pushHistory = useCallback((snapshot) => {
    histRef.current = histRef.current.slice(0, idxRef.current + 1);
    histRef.current.push({ ...snapshot });
    if (histRef.current.length > 60) histRef.current.shift();
    else idxRef.current++;
    setIsDirty(true);
    refreshHistoryState();
  }, []);

  const restoreSnapshot = useCallback((snap) => {
    onRoleOverridesChange({ ...snap });
    setSel(null);
    refreshHistoryState();
  }, [onRoleOverridesChange]);

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current--;
    restoreSnapshot(histRef.current[idxRef.current]);
    setIsDirty(JSON.stringify(histRef.current[idxRef.current]) !== JSON.stringify(savedRef.current));
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    if (idxRef.current >= histRef.current.length - 1) return;
    idxRef.current++;
    restoreSnapshot(histRef.current[idxRef.current]);
    setIsDirty(JSON.stringify(histRef.current[idxRef.current]) !== JSON.stringify(savedRef.current));
  }, [restoreSnapshot]);

  /* ── Hover highlight ────────────────────────────────────── */
  useEffect(() => {
    if (!visible) { setHoverRect(null); return; }
    const handler = (e) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        let t = document.elementFromPoint(e.clientX, e.clientY);
        if (!t || shouldSkip(t)) { setHoverRect(null); return; }
        const rt = findRoleTarget(t);
        if (rt) t = rt;
        const r = t.getBoundingClientRect();
        setHoverRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      });
    };
    document.addEventListener('mousemove', handler, true);
    return () => {
      document.removeEventListener('mousemove', handler, true);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [visible]);

  /* ── Click to select ────────────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (shouldSkip(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      setSel(analyse(e.target, roRef.current));
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [visible]);

  /* ── Keep selection rect in sync on scroll / resize ─────── */
  useEffect(() => {
    if (!visible || !sel) return;
    const update = () => {
      if (!sel.target.isConnected) { setSel(null); return; }
      const r = sel.target.getBoundingClientRect();
      setSel(prev => prev ? { ...prev, rect: { top: r.top, left: r.left, width: r.width, height: r.height } } : null);
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [visible, sel?.target]);

  /* ── ESC (deselect) + Undo/Redo keyboard shortcuts ──────── */
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      // ESC with selection → deselect only (stop so global ESC doesn't also close panel)
      if (e.key === 'Escape' && sel) { e.stopImmediatePropagation(); setSel(null); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, sel, undo, redo]);

  /* ── Clear on hide ──────────────────────────────────────── */
  useEffect(() => { if (!visible) { setSel(null); setHoverRect(null); } }, [visible]);

  /* ── Override pointer-events:none so all elements are selectable ── */
  useEffect(() => {
    if (!visible) return;
    const style = document.createElement('style');
    style.id = 'roletarget-pe-override';
    style.textContent = '*:not([data-roletarget-panel]):not([data-roletarget-panel] *){pointer-events:auto!important}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [visible]);

  /* ── Handle dropdown change ─────────────────────────────── */
  const handleChange = useCallback((newValue) => {
    if (!sel) return;
    const { roleId, kind } = sel;
    const isAuto = roleId.startsWith('_auto:');
    const cur = roRef.current;
    const entry = kind === 'font'
      ? { type: 'font', role: newValue }
      : { type: 'button', variant: newValue };
    if (isAuto) entry.page = currentPageId;
    const next = { ...cur, [roleId]: entry };
    onRoleOverridesChange(next);
    pushHistory(next);
    setSel(prev => prev ? { ...prev, value: newValue } : null);
  }, [sel, currentPageId, onRoleOverridesChange, pushHistory]);

  /* ── Save ────────────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    const cur = roRef.current;  // snapshot via ref — always current
    const ok = await saveRoleOverrides(cur);
    if (ok) {
      savedRef.current = { ...cur };
      histRef.current = [{ ...cur }];
      idxRef.current = 0;
      setIsDirty(false);
      refreshHistoryState();
    }
  }, []);

  /* ── Reset ───────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    const saved = savedRef.current;
    onRoleOverridesChange({ ...saved });
    setSel(null);
    histRef.current = [{ ...saved }];
    idxRef.current = 0;
    setIsDirty(false);
    refreshHistoryState();
  }, [onRoleOverridesChange]);

  if (!visible) return null;

  const hasStableId = sel && sel.roleId && !sel.roleId.startsWith('_auto:');

  return (
    <>
      {/* Hover overlay */}
      {hoverRect && !sel && (
        <div data-roletarget-panel style={{
          position: 'fixed', ...hoverRect,
          background: OVERLAY_COLOR, border: `1.5px solid ${OVERLAY_BORDER}`,
          borderRadius: 3, pointerEvents: 'none', zIndex: 10000,
          transition: 'top 0.05s, left 0.05s, width 0.05s, height 0.05s',
        }} />
      )}

      {/* Selected overlay */}
      {sel && (
        <div data-roletarget-panel style={{
          position: 'fixed', top: sel.rect.top, left: sel.rect.left,
          width: sel.rect.width, height: sel.rect.height,
          background: SEL_COLOR, border: `2px solid ${SEL_BORDER}`,
          borderRadius: 3, pointerEvents: 'none', zIndex: 10000,
        }} />
      )}

      {/* Bottom bar */}
      <div data-roletarget-panel style={BAR}>
        {sel ? (
          <>
            <span style={{ color: '#58ddff', fontWeight: 600, fontFamily: 'monospace', fontSize: 12, flexShrink: 0 }}>
              {sel.label}
            </span>

            {sel.roleId && !sel.roleId.startsWith('_auto:') && (
              <span style={{ color: 'rgba(88,221,255,0.5)', fontFamily: 'monospace', fontSize: 11, flexShrink: 0 }}>
                #{sel.roleId}
              </span>
            )}

            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

            {sel.kind === 'font' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ color: '#999', flexShrink: 0 }}>Type:</span>
                <select value={sel.value} onChange={e => handleChange(e.target.value)} style={DROPDOWN}>
                  {FONT_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
                {!hasStableId && <span style={HINT}>(auto-matched — may shift if page structure changes)</span>}
              </div>
            )}

            {sel.kind === 'button' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ color: '#999', flexShrink: 0 }}>Button:</span>
                <select value={sel.value} onChange={e => handleChange(e.target.value)} style={DROPDOWN}>
                  {BTN_VARIANTS.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                </select>
                {!hasStableId && <span style={HINT}>(auto-matched — may shift if page structure changes)</span>}
              </div>
            )}

            <button
              onClick={() => setSel(null)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                fontSize: 18, lineHeight: 1, padding: '2px 6px', flexShrink: 0 }}
            >✕</button>
          </>
        ) : (
          <span style={{ color: '#666', flex: 1 }}>Click an element to inspect its role</span>
        )}

        {/* Undo / Redo / Save / Reset — always visible */}
        <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
        <button title="Undo (⌘Z)" onClick={undo} disabled={!canUndo} style={{
          background: 'none', border: 'none', padding: '2px 4px', cursor: canUndo ? 'pointer' : 'default',
          color: canUndo ? '#ccc' : '#444', opacity: canUndo ? 1 : 0.4, lineHeight: 1, flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 0 1.5-3.5L2 2M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button title="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} style={{
          background: 'none', border: 'none', padding: '2px 4px', cursor: canRedo ? 'pointer' : 'default',
          color: canRedo ? '#ccc' : '#444', opacity: canRedo ? 1 : 0.4, lineHeight: 1, flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-1.5-3.5L12 2M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={handleReset} disabled={!isDirty} style={{ ...BTN_BASE, background: 'rgba(255,255,255,0.08)', color: isDirty ? '#aaa' : '#444', opacity: isDirty ? 1 : 0.4 }}>
          Reset
        </button>
        <button onClick={handleSave} disabled={!isDirty} style={{ ...BTN_BASE, background: isDirty ? '#58ddff' : 'rgba(255,255,255,0.06)', color: isDirty ? '#111' : '#444' }}>
          Save
        </button>
      </div>
    </>
  );
}
