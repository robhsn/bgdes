import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDetachablePanel, ResizeHandle, DetachIcon, DockIcon } from '../hooks/useDetachablePanel.jsx';
import { DEFAULT_SURFACE_TOKEN_MAP, L1_COLOR_MAP, L1_COLOR_PALETTES } from './TokenEditor.jsx';
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
  { key: 'body-lg',    label: 'Body LG' },
  { key: 'body-hl-lg', label: 'Body LG HL' },
  { key: 'body-md',    label: 'Body MD' },
  { key: 'body-hl',    label: 'Body MD HL' },
  { key: 'body-sm',    label: 'Body SM' },
  { key: 'body-hl-sm', label: 'Body SM HL' },
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
  { key: 'tertiary',       label: 'Tertiary' },
  { key: 'quaternary',     label: 'Quaternary' },
  { key: 'destructive',    label: 'Destructive' },
  { key: 'destructive-ui', label: 'Destructive UI' },
  { key: 'pill',           label: 'Pill MD' },
  { key: 'pill-lg',        label: 'Pill LG' },
  { key: 'pill-sm',        label: 'Pill SM' },
];

const BORDER_ROLES = [
  { key: 'none',     label: 'None' },
  { key: 'hairline', label: 'Hairline' },
  { key: 'mid',      label: 'Mid' },
  { key: 'accent',   label: 'Accent' },
  { key: 'card',     label: 'Card' },
  { key: 'pill',     label: 'Pill' },
];

const TAG_ROLE = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'body-sm', h6: 'body-sm' };

const SKIP_TAGS = new Set([
  'script','style','head','meta','link','noscript','template','base','title','br',
  'defs','clippath','lineargradient','radialgradient','stop','filter','mask','symbol','svg','path',
  'circle','rect','line','polyline','polygon','ellipse','g','use','image','text','tspan',
]);

/* ─── Surface detection ─────────────────────────────────────── */
const SURFACE_KEY_MAP = {
  'surface-muted':    'muted',
  'surface-inverse':  'inverse',
  'surface-accent':   'accent',
  'surface-tertiary': 'tertiary',
};
const SURFACE_LABEL = {
  default: 'Primary', muted: 'Secondary', inverse: 'Inverse',
  accent: 'Accent', tertiary: 'Tertiary',
};
const SURFACE_PREFIX = {
  default: '--color-', muted: '--sf-muted-', inverse: '--sf-inverse-',
  accent: '--sf-accent-', tertiary: '--sf-tertiary-',
};

/* ─── Token resolution maps ─────────────────────────────────── */

/* Candidate semantic --color-* suffixes that surfaces remap, grouped by CSS property */
const TEXT_CANDIDATES = [
  'heading', 'h1', 'h2', 'h3', 'h4', 'sh1', 'sh2', 'sh3', 'sh4',
  'body', 'body-lg', 'body-sm',
  'body-hl', 'body-hl-lg', 'body-hl-sm',
  'muted', 'muted-lg', 'muted-sm',
  'link', 'link-lg', 'link-sm',
  'ui-xl', 'ui-lg', 'ui-md', 'ui-sm', 'ui-xsm',
  'pill', 'pill-lg', 'pill-md', 'pill-sm',
  'accent', 'logo', 'star',
];
const BG_CANDIDATES = ['bg', 'input-bg', 'pill-bg', 'tag-fill'];
const BORDER_CANDIDATES = ['border', 'border-light', 'border-mid', 'border-subtle', 'border-active', 'callout-border', 'pill-border', 'input-border'];

/* Irregular suffix mapping: --color-X in surface CSS → --sf-{surface}-Y */
const SUFFIX_TO_SF = {
  'muted': 'text-muted', 'muted-lg': 'text-muted-lg', 'muted-sm': 'text-muted-sm',
};

/* Human-readable labels for suffixes */
const SUFFIX_LABELS = {
  heading: 'Heading', h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4',
  sh1: 'Subheading 1', sh2: 'Subheading 2', sh3: 'Subheading 3', sh4: 'Subheading 4',
  body: 'Body', 'body-lg': 'Body Large', 'body-sm': 'Body Small',
  'body-hl': 'Body Highlight', 'body-hl-lg': 'Body HL Large', 'body-hl-sm': 'Body HL Small',
  muted: 'Muted', 'muted-lg': 'Muted Large', 'muted-sm': 'Muted Small',
  link: 'Link', 'link-lg': 'Link Large', 'link-sm': 'Link Small',
  'ui-xl': 'UI XL', 'ui-lg': 'UI Large', 'ui-md': 'UI Medium', 'ui-sm': 'UI Small', 'ui-xsm': 'UI XSM',
  pill: 'Pill', 'pill-lg': 'Pill Large', 'pill-md': 'Pill Medium', 'pill-sm': 'Pill Small',
  accent: 'Accent', logo: 'Logo', star: 'Star',
  bg: 'Surface BG', 'input-bg': 'Input BG', 'pill-bg': 'Pill BG', 'tag-fill': 'Tag Fill',
  border: 'Border', 'border-light': 'Border Light', 'border-mid': 'Border Mid',
  'border-subtle': 'Border Subtle', 'border-active': 'Border Active',
  'callout-border': 'Callout Border', 'pill-border': 'Pill Border', 'input-border': 'Input Border',
};

const BTN_VARIANT_TOKENS = {
  primary:    { default: ['btn-primary-bg', 'btn-primary-fg'] },
  dark:       { default: ['btn-dark-bg', 'btn-dark-fg'] },
  outline:    { default: ['btn-outline-fg', 'btn-outline-border'] },
  ghost:      { default: ['btn-ghost-fg', 'btn-ghost-icon'] },
  tertiary:   { default: ['btn-tertiary-bg', 'btn-tertiary-fg'] },
  quaternary: { default: ['btn-quaternary-bg', 'btn-quaternary-fg'] },
  destructive:    { default: ['btn-destructive-bg', 'btn-destructive-fg'] },
  'destructive-ui': { default: ['btn-destructive-ui-bg', 'btn-destructive-ui-fg', 'btn-destructive-ui-border'] },
  pill:    { default: ['btn-pill-bg', 'btn-pill-fg', 'btn-pill-border'], active: ['btn-pill-active-bg', 'btn-pill-active-fg', 'btn-pill-active-border'] },
  'pill-lg': { default: ['btn-pill-bg', 'btn-pill-fg', 'btn-pill-border'], active: ['btn-pill-active-bg', 'btn-pill-active-fg', 'btn-pill-active-border'] },
  'pill-sm': { default: ['btn-pill-bg', 'btn-pill-fg', 'btn-pill-border'], active: ['btn-pill-active-bg', 'btn-pill-active-fg', 'btn-pill-active-border'] },
};

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

function detectSurface(el) {
  let cur = el;
  while (cur && cur !== document.documentElement) {
    if (cur.classList) {
      for (const [cls, key] of Object.entries(SURFACE_KEY_MAP)) {
        if (cur.classList.contains(cls)) return { key, label: SURFACE_LABEL[key] };
      }
    }
    cur = cur.parentElement;
  }
  return { key: 'default', label: 'Primary' };
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
const STATE_CLASSES = new Set(['is-active', 'is-open', 'is-disabled', 'is-selected', 'is-focused']);

function autoId(el) {
  const tag = el.tagName.toLowerCase();
  const cls = (typeof el.className === 'string' ? el.className.trim() : '')
    .split(/\s+/).filter(c => !STATE_CLASSES.has(c)).join('.');
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

function analyse(el, roleOverrides, exact = false) {
  const roleTarget = exact ? null : findRoleTarget(el);
  const btnEl = exact ? (el.classList?.contains('com-btn') ? el : null) : findButtonEl(el);
  const target = roleTarget || btnEl || el;
  let roleId = target.getAttribute?.('data-role-id');
  if (!roleId) {
    roleId = autoId(target);
    target.setAttribute('data-role-id', roleId);
  }
  const label  = makeLabel(target);
  const rect   = target.getBoundingClientRect();

  if (roleOverrides?.[roleId]) {
    const o = roleOverrides[roleId];
    return { target, roleId, label, rect, kind: o.type, value: o.type === 'font' ? o.role : o.variant, borderValue: o.border || 'none' };
  }

  const detectedBtn = btnEl || findButtonEl(target);
  if (detectedBtn) {
    return { target, roleId, label, rect, kind: 'button', value: detectButtonVariant(detectedBtn), borderValue: 'none' };
  }

  return { target, roleId, label, rect, kind: 'font', value: detectFontRole(target), borderValue: 'none' };
}

/* ─── Token resolution ──────────────────────────────────────── */
function btnSuffixLabel(suffix) {
  if (suffix.endsWith('-bg')) return 'Background';
  if (suffix.endsWith('-fg')) return 'Text';
  if (suffix.endsWith('-border')) return 'Border';
  if (suffix.endsWith('-icon')) return 'Icon';
  return suffix.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ');
}

function getBtnCssVar(suffix, surfaceKey) {
  if (surfaceKey === 'default') {
    return DEFAULT_SURFACE_TOKEN_MAP[suffix] || `--color-${suffix}`;
  }
  const prefix = SURFACE_PREFIX[surfaceKey];
  return `${prefix}${suffix}`;
}

/* Map a semantic suffix to its --sf-* L2 token name */
function getSfToken(suffix, surfaceKey) {
  if (surfaceKey === 'default') {
    return DEFAULT_SURFACE_TOKEN_MAP[suffix] || `--color-${suffix}`;
  }
  const sfSuffix = SUFFIX_TO_SF[suffix] || suffix;
  return `--sf-${surfaceKey}-${sfSuffix}`;
}

/* Convert '#rrggbb' to 'rgb(r, g, b)' for comparison with getComputedStyle */
function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

/* Resolve an L2 token value to rgb string */
function resolveTokenToRgb(l2TokenName, l2, l1ColorMap) {
  const l1Ref = l2[l2TokenName];
  if (!l1Ref) return null;
  const hex = l1ColorMap[l1Ref] || (l1Ref.startsWith('#') ? l1Ref : null);
  if (!hex) return null;
  return hexToRgb(hex);
}

/* Detect which L2 tokens affect the element's visible text, background, and border colors */
function detectElementTokens(element, surfaceKey, l2, l1ColorMap) {
  const comp = getComputedStyle(element);
  const tokens = [];
  const seen = new Set();

  function match(candidates, cssValue, propType) {
    if (!cssValue || cssValue === 'rgba(0, 0, 0, 0)' || cssValue === 'transparent') return;
    for (const suffix of candidates) {
      const sfToken = getSfToken(suffix, surfaceKey);
      if (seen.has(sfToken)) continue;
      const resolved = resolveTokenToRgb(sfToken, l2, l1ColorMap);
      if (resolved && resolved === cssValue) {
        seen.add(sfToken);
        tokens.push({
          cssVar: sfToken,
          label: SUFFIX_LABELS[suffix] || suffix,
          group: propType,
        });
      }
    }
  }

  match(TEXT_CANDIDATES, comp.color, 'text');
  match(BG_CANDIDATES, comp.backgroundColor, 'background');
  // Check all four border sides for visible borders
  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    const bw = parseFloat(comp[`border${side}Width`]);
    if (bw > 0) {
      const bc = comp[`border${side}Color`];
      match(BORDER_CANDIDATES, bc, 'border');
    }
  }

  return tokens;
}

/* Button tokens: keep variant→token mapping (buttons use --com-btn-* tokens explicitly) */
function getButtonTokens(value, surfaceKey) {
  const tokens = [];
  const variantDef = BTN_VARIANT_TOKENS[value];
  if (variantDef) {
    for (const [group, suffixes] of Object.entries(variantDef)) {
      for (const suffix of suffixes) {
        tokens.push({ suffix, cssVar: getBtnCssVar(suffix, surfaceKey), label: btnSuffixLabel(suffix), group });
      }
    }
  }
  return tokens;
}

/* ─── applyL2 — live-update a single CSS custom property ───── */
function applyL2(name, rawVal) {
  let css = rawVal;
  if (typeof rawVal === 'string' && rawVal.startsWith('--prim-')) {
    css = `var(${rawVal})`;
  }
  document.documentElement.style.setProperty(name, css);
}

/* ─── Styles ─────────────────────────────────────────────────── */
const OVERLAY_COLOR  = 'rgba(88,221,255,0.18)';
const OVERLAY_BORDER = 'rgba(88,221,255,0.6)';
const SEL_COLOR      = 'rgba(88,221,255,0.25)';
const SEL_BORDER     = 'rgba(88,221,255,0.9)';

const DROPDOWN = {
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 6, color: '#fff', fontSize: 13, padding: '4px 8px',
  cursor: 'pointer', outline: 'none', fontFamily: 'inherit', width: '100%',
};

const BTN_BASE = {
  border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600,
  padding: '5px 12px', cursor: 'pointer', lineHeight: 1, flexShrink: 0,
  fontFamily: 'inherit',
};

const HINT = { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' };

const dockBtn = (active) => ({
  background: active ? '#333' : 'none', border: 'none', padding: '4px 6px',
  color: active ? '#e0e0e0' : '#888', cursor: 'pointer',
  display: 'flex', alignItems: 'center', borderRadius: 3,
});

const hoverBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#888', padding: '2px 4px', borderRadius: 3,
  display: 'flex', alignItems: 'center',
};

/* ─── Section header ────────────────────────────────────────── */
function SectionHeader({ label }) {
  return (
    <div style={{ padding: '10px 16px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
      {label}
    </div>
  );
}

/* ─── Row + ColorRow (inline palette picker) ────────────────── */
function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 16px', gap: 8, minHeight: 32 }}>
      <span style={{ color: '#aaa', fontSize: 12, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function ColorRow({ label, cssVar, l2, onSet, l1ColorMap, l1Groups }) {
  const currentToken = l2[cssVar] || '--prim-mono-900';
  const hex = l1ColorMap[currentToken] || '#888';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const shortName = currentToken.replace('--prim-', '');

  return (
    <Row label={label}>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#262626', border: '1px solid #3a3a3a', padding: '3px 8px 3px 5px', borderRadius: 4, cursor: 'pointer' }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 2, background: hex, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <span style={{ color: '#aaa', fontSize: 10, fontFamily: 'monospace' }}>{shortName}</span>
        </button>

        {open && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 200, background: '#181818', border: '1px solid #2e2e2e', borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 220 }}>
            {l1Groups.map(({ name: palName, tokens }) => (
              <div key={palName} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#888', fontSize: 9, width: 44, flexShrink: 0, letterSpacing: '0.04em' }}>{palName}</span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {tokens.map(tok => (
                    <button
                      key={tok}
                      title={tok}
                      onClick={() => { onSet(cssVar, tok); setOpen(false); }}
                      style={{
                        width: 22, height: 22,
                        background: l1ColorMap[tok] || '#888',
                        border: currentToken === tok ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2, cursor: 'pointer', padding: 0, flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Row>
  );
}

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
  const depthStackRef = useRef([]);

  /* ── Panel hook ──────────────────────────────────────────── */
  const panel = useDetachablePanel(
    { x: Math.round(window.innerWidth / 2 - 180), y: 40 },
    { w: 360, h: 600 },
    'rt-panel',
  );

  /* ── Role override refs ──────────────────────────────────── */
  const roRef    = useRef(roleOverrides);
  const savedRef = useRef({ ...INIT_SAVED });
  useEffect(() => { roRef.current = roleOverrides; }, [roleOverrides]);

  /* ── L2 state ────────────────────────────────────────────── */
  const [l2, setL2]           = useState({});
  const [l2Edits, setL2Edits] = useState({});
  const [l1ColorMap, setL1ColorMap] = useState({ ...L1_COLOR_MAP });
  const [l1Groups, setL1Groups]     = useState(L1_COLOR_PALETTES);
  const l2Ref      = useRef({});
  const l2EditsRef = useRef({});
  const l2BaseRef  = useRef({});   // base L2 from file (before RT edits)

  useEffect(() => { l2Ref.current = l2; }, [l2]);
  useEffect(() => { l2EditsRef.current = l2Edits; }, [l2Edits]);

  /* Fetch L2 snapshot when panel becomes visible */
  useEffect(() => {
    if (!visible) return;
    fetch('/__dme_read').then(r => r.json()).then(data => {
      const base = data.l2 || {};
      setL2(base);
      l2BaseRef.current = { ...base };
      if (data.l1Colors) setL1ColorMap(prev => ({ ...prev, ...data.l1Colors }));
      if (data.l1Groups) setL1Groups(data.l1Groups);
    }).catch(() => {});
  }, [visible]);

  /* ── History (combined role + L2 snapshots) ──────────────── */
  const histRef = useRef([{ roleOverrides: { ...INIT_SAVED }, l2Edits: {} }]);
  const idxRef  = useRef(0);

  const refreshHistoryState = () => {
    setCanUndo(idxRef.current > 0);
    setCanRedo(idxRef.current < histRef.current.length - 1);
  };

  const pushHistory = useCallback((snapshot) => {
    histRef.current = histRef.current.slice(0, idxRef.current + 1);
    histRef.current.push(snapshot);
    if (histRef.current.length > 60) histRef.current.shift();
    else idxRef.current++;
    setIsDirty(true);
    refreshHistoryState();
  }, []);

  const restoreSnapshot = useCallback((snap) => {
    // Restore role overrides
    onRoleOverridesChange({ ...snap.roleOverrides });

    // Revert all current L2 edits to base values
    for (const name of Object.keys(l2EditsRef.current)) {
      const baseVal = l2BaseRef.current[name];
      if (baseVal != null) applyL2(name, baseVal);
      else document.documentElement.style.removeProperty(name);
    }

    // Apply snapshot's L2 edits
    const newL2 = { ...l2BaseRef.current };
    for (const [name, tok] of Object.entries(snap.l2Edits || {})) {
      newL2[name] = tok;
      applyL2(name, tok);
    }
    setL2(newL2);
    setL2Edits({ ...snap.l2Edits });

    setSel(null);
    refreshHistoryState();
  }, [onRoleOverridesChange]);

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current--;
    restoreSnapshot(histRef.current[idxRef.current]);
    const snap = histRef.current[idxRef.current];
    const savedMatch = JSON.stringify(snap.roleOverrides) === JSON.stringify(savedRef.current)
      && Object.keys(snap.l2Edits || {}).length === 0;
    setIsDirty(!savedMatch);
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    if (idxRef.current >= histRef.current.length - 1) return;
    idxRef.current++;
    restoreSnapshot(histRef.current[idxRef.current]);
    const snap = histRef.current[idxRef.current];
    const savedMatch = JSON.stringify(snap.roleOverrides) === JSON.stringify(savedRef.current)
      && Object.keys(snap.l2Edits || {}).length === 0;
    setIsDirty(!savedMatch);
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
      depthStackRef.current = [];
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

  /* ── Navigate selection to parent element ─────────────── */
  const navigateUp = useCallback(() => {
    if (!sel) return;
    let cur = sel.target.parentElement;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      if (!shouldSkip(cur)) {
        depthStackRef.current.push(sel.target);
        setSel(analyse(cur, roRef.current, true));
        return;
      }
      cur = cur.parentElement;
    }
  }, [sel]);

  /* ── Navigate selection back to child element ──────────── */
  const navigateDown = useCallback(() => {
    if (!sel || depthStackRef.current.length === 0) return;
    const child = depthStackRef.current.pop();
    if (child && child.isConnected) {
      setSel(analyse(child, roRef.current, true));
    }
  }, [sel]);

  /* ── ESC (deselect) + Undo/Redo + ↑↓ depth nav shortcuts ── */
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'Escape' && sel) { e.stopImmediatePropagation(); setSel(null); depthStackRef.current = []; return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowUp' && sel) { e.preventDefault(); navigateUp(); return; }
      if (e.key === 'ArrowDown' && sel) { e.preventDefault(); navigateDown(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, sel, undo, redo, navigateUp, navigateDown]);

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

  /* ── Handle dropdown change (role/border) ────────────────── */
  const handleChange = useCallback((channel, newValue) => {
    if (!sel) return;
    const { roleId } = sel;
    const isAuto = roleId.startsWith('_auto:');
    const cur = roRef.current;
    const existing = cur[roleId] || {};

    let entry = { ...existing };

    if (channel === 'border') {
      if (newValue === 'none') delete entry.border;
      else entry.border = newValue;
      if (!entry.type) {
        entry.type = sel.kind;
        if (sel.kind === 'font') entry.role = sel.value;
        else entry.variant = sel.value;
      }
    } else if (channel === 'font') {
      entry.type = 'font';
      entry.role = newValue;
      delete entry.variant;
    } else if (channel === 'button') {
      entry.type = 'button';
      entry.variant = newValue;
      delete entry.role;
    }

    if (isAuto) {
      const sectionId = roleId.replace('_auto:', '').split('|')[0];
      if (!sectionId.startsWith('gl-')) entry.page = currentPageId;
    }
    const next = { ...cur, [roleId]: entry };
    onRoleOverridesChange(next);
    pushHistory({ roleOverrides: next, l2Edits: { ...l2EditsRef.current } });

    if (channel === 'border') {
      setSel(prev => prev ? { ...prev, borderValue: newValue } : null);
    } else {
      setSel(prev => prev ? { ...prev, value: newValue } : null);
    }
  }, [sel, currentPageId, onRoleOverridesChange, pushHistory]);

  /* ── Handle L2 color change ──────────────────────────────── */
  const handleL2Change = useCallback((cssVar, tok) => {
    setL2(prev => ({ ...prev, [cssVar]: tok }));
    setL2Edits(prev => {
      const next = { ...prev, [cssVar]: tok };
      l2EditsRef.current = next;
      return next;
    });
    applyL2(cssVar, tok);
    pushHistory({ roleOverrides: { ...roRef.current }, l2Edits: { ...l2EditsRef.current, [cssVar]: tok } });
  }, [pushHistory]);

  /* ── Save ────────────────────────────────────────────────── */
  const handleSave = useCallback(async () => {
    try {
      const res = await fetch('/__dme_read');
      const current = await res.json();
      current.roleOverrides = roRef.current;
      current.l2 = { ...(current.l2 || {}), ...l2EditsRef.current };
      await fetch('/__dme_save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      });
      savedRef.current = { ...roRef.current };
      l2BaseRef.current = { ...current.l2 };
      setL2Edits({});
      l2EditsRef.current = {};
      histRef.current = [{ roleOverrides: { ...roRef.current }, l2Edits: {} }];
      idxRef.current = 0;
      setIsDirty(false);
      refreshHistoryState();
    } catch { /* ignore */ }
  }, []);

  /* ── Reset ───────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    const saved = savedRef.current;
    onRoleOverridesChange({ ...saved });

    // Revert L2 edits to base
    for (const name of Object.keys(l2EditsRef.current)) {
      const baseVal = l2BaseRef.current[name];
      if (baseVal != null) applyL2(name, baseVal);
      else document.documentElement.style.removeProperty(name);
    }
    setL2({ ...l2BaseRef.current });
    setL2Edits({});
    l2EditsRef.current = {};

    setSel(null);
    histRef.current = [{ roleOverrides: { ...saved }, l2Edits: {} }];
    idxRef.current = 0;
    setIsDirty(false);
    refreshHistoryState();
  }, [onRoleOverridesChange]);

  if (!visible) return null;

  /* ── Derived values for selected element ─────────────────── */
  const surface = sel ? detectSurface(sel.target) : null;
  const hasStableId = sel && sel.roleId && !sel.roleId.startsWith('_auto:');

  // For font elements: computed-color-matching against L2 tokens
  // For button elements: variant→token mapping
  const relevantTokens = sel
    ? (sel.kind === 'button'
        ? getButtonTokens(sel.value, surface.key)
        : detectElementTokens(sel.target, surface.key, l2, l1ColorMap))
    : [];

  // Group tokens by group (text, background, border for font; default, active for buttons)
  const tokenGroups = {};
  for (const tok of relevantTokens) {
    if (!tokenGroups[tok.group]) tokenGroups[tok.group] = [];
    tokenGroups[tok.group].push(tok);
  }

  /* ── Panel positioning ───────────────────────────────────── */
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
        height: '100vh', width: '28vw', minWidth: 340,
      };

  return createPortal(
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

      {/* Panel */}
      <div data-roletarget-panel style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 2147483647,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached
          ? '0 8px 40px rgba(0,0,0,0.6)'
          : (panel.side === 'right' ? '-6px 0 32px rgba(0,0,0,0.5)' : '6px 0 32px rgba(0,0,0,0.5)'),
        overflow: 'hidden',
      }}>
        {panel.detached && <ResizeHandle onMouseDown={panel.onResizeStart} />}

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          onMouseDown={panel.detached ? panel.onDragStart : undefined}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderBottom: '1px solid #2a2a2a',
            flexShrink: 0,
            cursor: panel.detached ? 'grab' : 'default',
            userSelect: 'none',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>
            Role Targeter
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Dock left/right — only when docked */}
            {!panel.detached && (
              <>
                <button title="Dock left" onClick={() => panel.setSide('left')} style={dockBtn(panel.side === 'left')}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="1" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
                <button title="Dock right" onClick={() => panel.setSide('right')} style={dockBtn(panel.side === 'right')}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                    <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="9" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                  </svg>
                </button>
              </>
            )}
            {/* Detach / dock toggle */}
            <button
              onClick={panel.detached ? panel.dock : panel.detach}
              title={panel.detached ? 'Dock panel' : 'Detach panel'}
              style={hoverBtn}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              {panel.detached ? <DockIcon /> : <DetachIcon />}
            </button>
            <div style={{ width: 1, height: 14, background: '#444', margin: '0 3px' }} />
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 3px' }}>×</button>
          </div>
        </div>

        {/* ── Scrollable content ──────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {sel ? (
            <>
              {/* Element info */}
              <SectionHeader label="Element Info" />
              <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Depth navigation ↑↓ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                  <button title="Select parent (↑)" onClick={navigateUp} style={{
                    background: 'none', border: 'none', padding: '0 2px', cursor: 'pointer',
                    color: '#888', lineHeight: 1, fontSize: 10,
                  }}>▲</button>
                  <button title="Select child (↓)" onClick={navigateDown} disabled={depthStackRef.current.length === 0} style={{
                    background: 'none', border: 'none', padding: '0 2px', cursor: depthStackRef.current.length > 0 ? 'pointer' : 'default',
                    color: depthStackRef.current.length > 0 ? '#888' : '#444', lineHeight: 1, fontSize: 10,
                  }}>▼</button>
                </div>

                <span style={{ color: 'rgba(88,221,255,0.6)', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>
                  {surface.label}
                </span>
                <span style={{ color: '#58ddff', fontWeight: 600, fontFamily: 'monospace', fontSize: 12, flexShrink: 0 }}>
                  {sel.label}
                </span>
              </div>

              {hasStableId && (
                <div style={{ padding: '0 16px 6px' }}>
                  <span style={{ color: 'rgba(88,221,255,0.5)', fontFamily: 'monospace', fontSize: 11 }}>
                    #{sel.roleId}
                  </span>
                </div>
              )}

              {/* Type dropdown */}
              <div style={{ padding: '4px 16px 4px' }}>
                <Row label="Type:">
                  {sel.kind === 'font' ? (
                    <select value={sel.value} onChange={e => handleChange('font', e.target.value)} style={DROPDOWN}>
                      {FONT_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                    </select>
                  ) : (
                    <select value={sel.value} onChange={e => handleChange('button', e.target.value)} style={DROPDOWN}>
                      {BTN_VARIANTS.map(v => <option key={v.key} value={v.key}>{v.label}</option>)}
                    </select>
                  )}
                </Row>
              </div>

              {/* Border dropdown */}
              <div style={{ padding: '0 16px 4px' }}>
                <Row label="Border:">
                  <select value={sel.borderValue} onChange={e => handleChange('border', e.target.value)} style={DROPDOWN}>
                    {BORDER_ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </Row>
              </div>

              {!hasStableId && (
                <div style={{ padding: '0 16px 8px' }}>
                  <span style={HINT}>(auto-matched — may shift if page structure changes)</span>
                </div>
              )}

              {/* Surface colors */}
              {Object.keys(tokenGroups).length > 0 && (
                <>
                  {Object.entries(tokenGroups).map(([group, tokens]) => {
                    const groupLabel =
                      group === 'default' ? `Surface Colors (${surface.label})`
                      : group === 'text' ? `Text Color (${surface.label})`
                      : group === 'background' ? `Background (${surface.label})`
                      : group === 'border' ? `Border (${surface.label})`
                      : group === 'active' ? 'Active State'
                      : `${group.charAt(0).toUpperCase() + group.slice(1)} (${surface.label})`;
                    return (
                    <React.Fragment key={group}>
                      <SectionHeader label={groupLabel} />
                      {tokens.map(tok => (
                        <ColorRow
                          key={tok.cssVar}
                          label={tok.label}
                          cssVar={tok.cssVar}
                          l2={l2}
                          onSet={handleL2Change}
                          l1ColorMap={l1ColorMap}
                          l1Groups={l1Groups}
                        />
                      ))}
                    </React.Fragment>
                  );
                  })}
                </>
              )}
            </>
          ) : (
            <div style={{ padding: 24, color: '#666', textAlign: 'center' }}>
              Click an element to inspect its role
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderTop: '1px solid #2a2a2a', flexShrink: 0, gap: 6,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
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
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleReset} disabled={!isDirty} style={{ ...BTN_BASE, background: 'rgba(255,255,255,0.08)', color: isDirty ? '#aaa' : '#444', opacity: isDirty ? 1 : 0.4 }}>
              Reset
            </button>
            <button onClick={handleSave} disabled={!isDirty} style={{ ...BTN_BASE, background: isDirty ? '#58ddff' : 'rgba(255,255,255,0.06)', color: isDirty ? '#111' : '#444' }}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
