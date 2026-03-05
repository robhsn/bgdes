import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Konami sequence ────────────────────────────────────────── */
const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
];

/* ─── Fonts ──────────────────────────────────────────────────── */
const FONT_OPTIONS = [
  'Raleway','Inter','Playfair Display','Merriweather','DM Sans',
  'Nunito','Outfit','Lora','Libre Baskerville','Space Grotesk',
  'Georgia','Arial',
];
const SYSTEM_FONTS = new Set(['Georgia','Arial']);

/* Available weights per font — drives weight dropdowns + font loading */
const FONT_WEIGHTS = {
  'Raleway':            [100,200,300,400,500,600,700,800,900],
  'Inter':              [100,200,300,400,500,600,700,800,900],
  'Playfair Display':   [400,500,600,700,800,900],
  'Merriweather':       [300,400,700,900],
  'DM Sans':            [100,200,300,400,500,600,700,800,900],
  'Nunito':             [200,300,400,500,600,700,800,900],
  'Outfit':             [100,200,300,400,500,600,700,800,900],
  'Lora':               [400,500,600,700],
  'Libre Baskerville':  [400,700],
  'Space Grotesk':      [300,400,500,600,700],
  'Georgia':            [400,700],
  'Arial':              [400,700],
};
/* Fonts that support variable weight axes on Google Fonts */
const VARIABLE_FONTS = new Set([
  'Raleway','Inter','Playfair Display','DM Sans','Nunito','Outfit','Space Grotesk',
]);

function loadGoogleFont(name) {
  if (SYSTEM_FONTS.has(name)) return;
  const id = `gf-${name.replace(/\s+/g,'-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const slug = name.replace(/\s+/g, '+');
  const ws = FONT_WEIGHTS[name] ?? [400, 700];
  let href;
  if (VARIABLE_FONTS.has(name)) {
    const lo = ws[0], hi = ws[ws.length - 1];
    href = `https://fonts.googleapis.com/css2?family=${slug}:ital,wght@0,${lo}..${hi};1,${lo}..${hi}&display=swap`;
  } else {
    const pairs = [...ws.map(w => `0,${w}`), ...ws.map(w => `1,${w}`)].join(';');
    href = `https://fonts.googleapis.com/css2?family=${slug}:ital,wght@${pairs}&display=swap`;
  }
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet'; link.href = href;
  document.head.appendChild(link);
}
function fontStack(name) {
  return SYSTEM_FONTS.has(name) ? name : `'${name}', sans-serif`;
}

loadGoogleFont('Raleway');
loadGoogleFont('Inter');
loadGoogleFont('Georgia');

/* ─── L1 colour map — token name → hex (mirrors CSS :root L1 block) ── */
const L1_COLOR_MAP = {
  '--prim-mono-white': '#ffffff', '--prim-mono-50':  '#efefef',
  '--prim-mono-100':   '#dddddd', '--prim-mono-150': '#e0e0e0',
  '--prim-mono-200':   '#d9d9d9', '--prim-mono-250': '#cccccc',
  '--prim-mono-300':   '#bbbbbb', '--prim-mono-350': '#aaaaaa',
  '--prim-mono-500':   '#7b7b7b', '--prim-mono-550': '#777777',
  '--prim-mono-600':   '#585858', '--prim-mono-700': '#444444',
  '--prim-mono-750':   '#2e2e2e', '--prim-mono-900': '#111111',
  '--prim-mono-black': '#000000',
  '--prim-sapphire-900': '#001635', '--prim-sapphire-700': '#002458',
  '--prim-sapphire-500': '#0c3775', '--prim-sapphire-300': '#134b9b',
  '--prim-sapphire-100': '#2f65b3',
  '--prim-splash-900': '#0094b9', '--prim-splash-700': '#26b7dc',
  '--prim-splash-500': '#58ddff', '--prim-splash-300': '#88e7ff',
  '--prim-splash-100': '#b4f0ff',
  '--prim-orange-900': '#a22e05', '--prim-orange-700': '#ca4313',
  '--prim-orange-500': '#f05a25', '--prim-orange-300': '#ff9874',
  '--prim-orange-100': '#ffbda6',
  '--prim-butter-900': '#f0d18a', '--prim-butter-700': '#f3ecac',
  '--prim-butter-500': '#fefce9',
};

/* Palette groups for the picker UI */
const L1_COLOR_PALETTES = [
  { name: 'Mono',     tokens: ['--prim-mono-white','--prim-mono-50','--prim-mono-100','--prim-mono-150','--prim-mono-200','--prim-mono-250','--prim-mono-300','--prim-mono-350','--prim-mono-500','--prim-mono-550','--prim-mono-600','--prim-mono-700','--prim-mono-750','--prim-mono-900','--prim-mono-black'] },
  { name: 'Sapphire', tokens: ['--prim-sapphire-100','--prim-sapphire-300','--prim-sapphire-500','--prim-sapphire-700','--prim-sapphire-900'] },
  { name: 'Splash',   tokens: ['--prim-splash-100','--prim-splash-300','--prim-splash-500','--prim-splash-700','--prim-splash-900'] },
  { name: 'Orange',   tokens: ['--prim-orange-100','--prim-orange-300','--prim-orange-500','--prim-orange-700','--prim-orange-900'] },
  { name: 'Butter',   tokens: ['--prim-butter-500','--prim-butter-700','--prim-butter-900'] },
];

/* ─── Themes — L2 colors reference L1 token names ────────────── */
const THEMES = {
  mono: {
    label: 'Mono',
    colors: {
      '--color-bg':             '--prim-mono-white',
      '--color-bg-gray':        '--prim-mono-50',
      '--color-heading':        '--prim-mono-900',
      '--color-pill':           '--prim-mono-900',
      '--color-accent':         '--prim-mono-700',
      '--color-body':           '--prim-mono-600',
      '--color-muted':          '--prim-mono-750',
      '--color-border':         '--prim-mono-100',
      '--color-border-light':   '--prim-mono-150',
      '--color-border-mid':     '--prim-mono-250',
      '--color-border-subtle':  '--prim-mono-350',
      '--color-callout-border': '--prim-mono-500',
      '--color-placeholder':    '--prim-mono-200',
      '--color-toc-pip':        '--prim-mono-300',
      '--color-toc-pip-active': '--prim-mono-550',
    },
  },
  'coral-tide': {
    label: 'Coral Tide',
    colors: {
      '--color-bg':             '--prim-butter-500',
      '--color-bg-gray':        '--prim-butter-700',
      '--color-heading':        '--prim-sapphire-900',
      '--color-pill':           '--prim-sapphire-900',
      '--color-accent':         '--prim-orange-500',
      '--color-body':           '--prim-sapphire-500',
      '--color-muted':          '--prim-sapphire-700',
      '--color-border':         '--prim-butter-900',
      '--color-border-light':   '--prim-butter-700',
      '--color-border-mid':     '--prim-butter-900',
      '--color-border-subtle':  '--prim-orange-300',
      '--color-callout-border': '--prim-splash-700',
      '--color-placeholder':    '--prim-splash-300',
      '--color-toc-pip':        '--prim-splash-100',
      '--color-toc-pip-active': '--prim-splash-900',
    },
  },
};

/* ─── L1 defaults ────────────────────────────────────────────── */
const DEFAULT_L1 = {
  /* font families */
  '--prim-type-heading':    'Raleway',
  '--prim-type-subheading': 'Georgia',
  '--prim-type-body':       'Inter',
  /* weight (numeric), letter-spacing (hundredths of em), line-height (tenths) */
  '--prim-type-heading-weight':    '700',
  '--prim-type-heading-ls':        '-2',   /* -0.02em */
  '--prim-type-heading-lh':        '11',   /* 1.1     */
  '--prim-type-subheading-weight': '700',
  '--prim-type-subheading-ls':     '-2',   /* -0.02em */
  '--prim-type-subheading-lh':     '11',   /* 1.1     */
  '--prim-type-body-weight':       '400',
  '--prim-type-body-ls':           '0',    /* 0em     */
  '--prim-type-body-lh':           '19',   /* 1.9     */
};

/* ─── L2 font role tokens — store role name, applied as var(--prim-type-xxx) ── */
const L2_FONT_ROLE_TOKENS = new Set([
  '--font-heading', '--font-subheading', '--font-body',
  '--font-logo', '--font-pill', '--font-toc', '--font-meta',
]);

/* ─── L2 non-color defaults ──────────────────────────────────── */
const DEFAULT_L2_EXTRA = {
  /* font role assignments (which L1 role each L2 font token uses) */
  '--font-heading':    'heading',
  '--font-subheading': 'subheading',
  '--font-body':       'body',
  '--font-logo':       'heading',
  '--font-pill':       'heading',
  '--font-toc':        'body',
  '--font-meta':       'body',
  /* size & spacing */
  '--size-h1':         '70',
  '--size-h2':         '36',
  '--size-body':       '18',
  '--spacing-section-v':   '64',
  '--spacing-content-gap': '24',
  '--content-max-width':   '900',
};

const DEFAULT_L2 = { ...THEMES.mono.colors, ...DEFAULT_L2_EXTRA };

/* ─── Persistence ────────────────────────────────────────────── */
const STORAGE_KEY = 'dme-state';

function saveState(theme, l1, l2) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, l1, l2 })); } catch (_) {}
}
function clearSavedState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

/* Loaded once at module init — used to seed initial React state */
const _saved = (() => {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
  catch (_) { return null; }
})();
const INIT_THEME = _saved?.theme ?? 'mono';
const INIT_L1    = { ...DEFAULT_L1, ...(_saved?.l1 ?? {}) };
const INIT_L2    = { ...DEFAULT_L2, ...(_saved?.l2 ?? {}) };

/* ─── L1 reference palettes (display only) ───────────────────── */
const L1_PALETTES = [
  { name: 'Mono', swatches: [
    '#ffffff','#efefef','#dddddd','#aaaaaa','#7b7b7b','#585858','#444444','#2e2e2e','#111111',
  ]},
  { name: 'Sapphire', swatches: ['#001635','#002458','#0c3775','#134b9b','#2f65b3'] },
  { name: 'Splash',   swatches: ['#0094b9','#26b7dc','#58ddff','#88e7ff','#b4f0ff'] },
  { name: 'Orange',   swatches: ['#a22e05','#ca4313','#f05a25','#ff9874','#ffbda6'] },
  { name: 'Butter',   swatches: ['#f0d18a','#f3ecac','#fefce9'] },
];

/* ─── Helpers ────────────────────────────────────────────────── */
function applyL2(name, rawVal) {
  let css = rawVal;
  if (L2_FONT_ROLE_TOKENS.has(name)) {
    /* rawVal is 'heading' | 'subheading' | 'body' → CSS var reference */
    css = `var(--prim-type-${rawVal})`;
  } else if (name.startsWith('--color-')) {
    /* rawVal is an L1 token name like '--prim-mono-900' → CSS var reference */
    css = `var(${rawVal})`;
  } else if (name.startsWith('--size-') || name.startsWith('--spacing-') || name === '--content-max-width') {
    css = rawVal + 'px';
  }
  document.documentElement.style.setProperty(name, css);
}

function applyL1(name, value) {
  if (name.endsWith('-weight')) {
    document.documentElement.style.setProperty(name, value);
  } else if (name.endsWith('-ls')) {
    /* stored as integer hundredths of em → apply as em value */
    document.documentElement.style.setProperty(name, (Number(value) / 100) + 'em');
  } else if (name.endsWith('-lh')) {
    /* stored as integer tenths → apply as unitless value */
    document.documentElement.style.setProperty(name, (Number(value) / 10).toFixed(2));
  } else {
    /* font family */
    loadGoogleFont(value);
    document.documentElement.style.setProperty(name, fontStack(value));
  }
}

function removeAllOverrides() {
  [...Object.keys(DEFAULT_L2), ...Object.keys(DEFAULT_L1)].forEach(k => {
    document.documentElement.style.removeProperty(k);
  });
}

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function TokenEditor() {
  const [visible, setVisible]         = useState(false);
  const [tab, setTab]                 = useState('l2');
  const [activeTheme, setActiveTheme] = useState(INIT_THEME);
  const [l1, setL1]                   = useState({ ...INIT_L1 });
  const [l2, setL2]                   = useState({ ...INIT_L2 });
  const [canUndo, setCanUndo]         = useState(false);
  const [canRedo, setCanRedo]         = useState(false);
  const [hasSavedState, setHasSavedState] = useState(!!_saved);

  /* Refs for sync access inside callbacks */
  const l1Ref     = useRef({ ...INIT_L1 });
  const l2Ref     = useRef({ ...INIT_L2 });
  const themeRef  = useRef(INIT_THEME);
  const histRef   = useRef([{ theme: INIT_THEME, l1: { ...INIT_L1 }, l2: { ...INIT_L2 } }]);
  const idxRef    = useRef(0);

  /* Re-apply any persisted token overrides to the DOM on mount */
  useEffect(() => {
    if (!_saved) return;
    Object.entries(INIT_L1).forEach(([k, v]) => applyL1(k, v));
    Object.entries(INIT_L2).forEach(([k, v]) => applyL2(k, v));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshHistoryState = () => {
    setCanUndo(idxRef.current > 0);
    setCanRedo(idxRef.current < histRef.current.length - 1);
  };

  const pushHistory = useCallback(() => {
    const snap = {
      theme: themeRef.current,
      l1: { ...l1Ref.current },
      l2: { ...l2Ref.current },
    };
    histRef.current = histRef.current.slice(0, idxRef.current + 1);
    histRef.current.push(snap);
    if (histRef.current.length > 60) histRef.current.shift();
    else idxRef.current++;
    saveState(snap.theme, snap.l1, snap.l2);
    setHasSavedState(true);
    refreshHistoryState();
  }, []);

  const restoreSnapshot = useCallback((snap) => {
    removeAllOverrides();
    Object.entries(snap.l2).forEach(([k, v]) => applyL2(k, v));
    Object.entries(snap.l1).forEach(([k, v]) => applyL1(k, v));
    l1Ref.current = snap.l1; l2Ref.current = snap.l2; themeRef.current = snap.theme;
    setL1({ ...snap.l1 }); setL2({ ...snap.l2 }); setActiveTheme(snap.theme);
    saveState(snap.theme, snap.l1, snap.l2);
    setHasSavedState(true);
    refreshHistoryState();
  }, []);

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current--;
    restoreSnapshot(histRef.current[idxRef.current]);
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    if (idxRef.current >= histRef.current.length - 1) return;
    idxRef.current++;
    restoreSnapshot(histRef.current[idxRef.current]);
  }, [restoreSnapshot]);

  /* ── Konami + undo/redo keyboard listeners ────────────────── */
  useEffect(() => {
    let ki = 0;
    const handler = (e) => {
      /* Undo/redo — don't fire when typing in DME inputs */
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
      /* Konami */
      if (e.key === KONAMI[ki]) { ki++; if (ki === KONAMI.length) { setVisible(v => !v); ki = 0; } }
      else { ki = e.key === KONAMI[0] ? 1 : 0; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  /* ── Token setters ────────────────────────────────────────── */
  const setL2Token = useCallback((name, rawVal) => {
    applyL2(name, rawVal);
    const next = { ...l2Ref.current, [name]: rawVal };
    l2Ref.current = next; setL2(next);
    pushHistory();
  }, [pushHistory]);

  const switchTheme = useCallback((key) => {
    const colors = THEMES[key].colors;
    Object.entries(colors).forEach(([k, v]) => applyL2(k, v));
    const next = { ...l2Ref.current, ...colors };
    l2Ref.current = next; themeRef.current = key;
    setL2(next); setActiveTheme(key);
    pushHistory();
  }, [pushHistory]);

  const setL1Role = useCallback((name, fontName) => {
    applyL1(name, fontName);
    /* L2 tokens that reference var(--prim-type-xxx) update automatically via CSS cascade */
    const nextL1 = { ...l1Ref.current, [name]: fontName };
    l1Ref.current = nextL1;
    setL1(nextL1);
    pushHistory();
  }, [pushHistory]);

  const reset = useCallback(() => {
    removeAllOverrides();
    l1Ref.current = { ...DEFAULT_L1 }; l2Ref.current = { ...DEFAULT_L2 }; themeRef.current = 'mono';
    setL1({ ...DEFAULT_L1 }); setL2({ ...DEFAULT_L2 }); setActiveTheme('mono');
    histRef.current = [{ theme: 'mono', l1: { ...DEFAULT_L1 }, l2: { ...DEFAULT_L2 } }];
    idxRef.current = 0;
    clearSavedState();
    setHasSavedState(false);
    refreshHistoryState();
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, height: '100vh', width: 300,
      background: '#1c1c1c', color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      boxShadow: '-6px 0 32px rgba(0,0,0,0.5)',
    }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
              Design Matrix Editor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span style={{ color: '#444', fontSize: 10 }}>↑↑↓↓←→←→ to toggle</span>
              {hasSavedState && <span style={{ color: '#3d7a4e', fontSize: 10 }}>● saved</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Undo */}
            <button title="Undo (⌘Z)" onClick={undo} disabled={!canUndo} style={iconBtn(canUndo)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 0 1.5-3.5L2 2M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Redo */}
            <button title="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} style={iconBtn(canRedo)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-1.5-3.5L12 2M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ width: 1, height: 16, background: '#333' }} />
            <button onClick={reset} style={ghostBtn}>Reset</button>
            <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>
        </div>

        {/* Theme selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#555', fontSize: 11, flexShrink: 0 }}>Theme</span>
          <select
            value={activeTheme}
            onChange={e => switchTheme(e.target.value)}
            style={{ flex: 1, background: '#262626', border: '1px solid #3a3a3a', color: '#fff', fontSize: 12, padding: '5px 8px', borderRadius: 4, cursor: 'pointer' }}
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', flexShrink: 0, background: '#181818' }}>
        {[['l2', 'Level 2 — Applied'], ['l1', 'Level 1 — Primitives']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '9px 4px', background: 'none', border: 'none',
            color: tab === key ? '#fff' : '#555', fontSize: 11, cursor: 'pointer',
            borderBottom: tab === key ? '2px solid #666' : '2px solid transparent',
            fontWeight: tab === key ? 600 : 400,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'l2'
          ? <L2View l2={l2} set={setL2Token} />
          : <L1View l1={l1} setRole={setL1Role} />
        }
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   L2 View
   ═══════════════════════════════════════════════════════════════ */
function L2View({ l2, set }) {
  return (
    <>
      <Sect label="Colors">
        <ColorRow label="Page background"  name="--color-bg"             l2={l2} set={set} />
        <ColorRow label="Gray section"     name="--color-bg-gray"        l2={l2} set={set} />
        <ColorRow label="Headings"         name="--color-heading"        l2={l2} set={set} />
        <ColorRow label="Pill (primary)"   name="--color-pill"           l2={l2} set={set} />
        <ColorRow label="Pill (accent)"    name="--color-accent"         l2={l2} set={set} />
        <ColorRow label="Body text"        name="--color-body"           l2={l2} set={set} />
        <ColorRow label="Muted text"       name="--color-muted"          l2={l2} set={set} />
        <ColorRow label="Borders"          name="--color-border"         l2={l2} set={set} />
        <ColorRow label="Callout border"   name="--color-callout-border" l2={l2} set={set} />
        <ColorRow label="Placeholder"      name="--color-placeholder"    l2={l2} set={set} />
        <ColorRow label="TOC pip"          name="--color-toc-pip"        l2={l2} set={set} />
        <ColorRow label="TOC active pip"   name="--color-toc-pip-active" l2={l2} set={set} />
      </Sect>
      <Sect label="Typography">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#484848', fontSize: 10, lineHeight: 1.5 }}>
            Assign L1 type roles to each element. Change the role's font under Level 1 → Type Roles.
          </div>
        </div>
        <RoleRow label="H1 font"         name="--font-heading"    l2={l2} set={set} />
        <RoleRow label="H2 font"         name="--font-subheading" l2={l2} set={set} />
        <RoleRow label="Body font"       name="--font-body"       l2={l2} set={set} />
        <RoleRow label="Logo font"       name="--font-logo"       l2={l2} set={set} />
        <RoleRow label="Pill font"       name="--font-pill"       l2={l2} set={set} />
        <RoleRow label="TOC font"        name="--font-toc"        l2={l2} set={set} />
        <RoleRow label="Meta font"       name="--font-meta"       l2={l2} set={set} />
        <SliderRow label="H1 size"       name="--size-h1"         l2={l2} set={set} min={32}  max={120}  unit="px" />
        <SliderRow label="H2 size"       name="--size-h2"         l2={l2} set={set} min={18}  max={72}   unit="px" />
        <SliderRow label="Body size"     name="--size-body"       l2={l2} set={set} min={12}  max={28}   unit="px" />
      </Sect>
      <Sect label="Spacing &amp; Layout">
        <SliderRow label="Section padding"   name="--spacing-section-v"   l2={l2} set={set} min={24}  max={120}  unit="px" />
        <SliderRow label="Content gap"       name="--spacing-content-gap" l2={l2} set={set} min={8}   max={64}   unit="px" />
        <SliderRow label="Max content width" name="--content-max-width"   l2={l2} set={set} min={600} max={1400} unit="px" />
      </Sect>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   L1 View
   ═══════════════════════════════════════════════════════════════ */
function L1RoleGroup({ roleKey, roleLabel, l1, setRole }) {
  const familyKey  = `--prim-type-${roleKey}`;
  const weightKey  = `--prim-type-${roleKey}-weight`;
  const lsKey      = `--prim-type-${roleKey}-ls`;
  const lhKey      = `--prim-type-${roleKey}-lh`;
  const currentFont = l1[familyKey] || 'Inter';
  const weights = FONT_WEIGHTS[currentFont] ?? [400, 700];

  return (
    <div>
      <div style={{ padding: '8px 16px 2px', color: '#555', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {roleLabel}
      </div>
      {/* Family */}
      <FontRow label="Family" name={familyKey} l2={l1} set={setRole} />
      {/* Weight — only shows weights valid for the selected font */}
      <Row label="Weight">
        <select
          value={l1[weightKey] || '400'}
          onChange={e => setRole(weightKey, e.target.value)}
          style={{ background: '#262626', border: '1px solid #3a3a3a', color: '#ccc', fontSize: 11, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', maxWidth: 100 }}
        >
          {weights.map(w => <option key={w} value={String(w)}>{w}</option>)}
        </select>
      </Row>
      {/* Letter spacing: stored as hundredths of em */}
      <Row label="Letter spacing">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="range" min={-5} max={20} step={1}
            value={l1[lsKey] ?? '0'}
            onChange={e => setRole(lsKey, e.target.value)}
            style={{ width: 80, accentColor: '#666', cursor: 'pointer' }} />
          <span style={{ color: '#555', fontSize: 11, minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>
            {(Number(l1[lsKey] ?? 0) / 100).toFixed(2)}em
          </span>
        </div>
      </Row>
      {/* Line height: stored as tenths */}
      <Row label="Line height">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="range" min={9} max={22} step={1}
            value={l1[lhKey] ?? '16'}
            onChange={e => setRole(lhKey, e.target.value)}
            style={{ width: 80, accentColor: '#666', cursor: 'pointer' }} />
          <span style={{ color: '#555', fontSize: 11, minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>
            {(Number(l1[lhKey] ?? 16) / 10).toFixed(1)}
          </span>
        </div>
      </Row>
    </div>
  );
}

function L1View({ l1, setRole }) {
  return (
    <>
      <Sect label="Type Roles">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#484848', fontSize: 10, lineHeight: 1.5 }}>
            Define font roles. Changes apply across all themes and L2 assignments.
          </div>
        </div>
        <L1RoleGroup roleKey="heading"    roleLabel="Heading"    l1={l1} setRole={setRole} />
        <div style={{ height: 1, background: '#252525', margin: '4px 16px' }} />
        <L1RoleGroup roleKey="subheading" roleLabel="Subheading" l1={l1} setRole={setRole} />
        <div style={{ height: 1, background: '#252525', margin: '4px 16px' }} />
        <L1RoleGroup roleKey="body"       roleLabel="Body"       l1={l1} setRole={setRole} />
      </Sect>
      <Sect label="Color Palettes">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#484848', fontSize: 10, lineHeight: 1.5 }}>
            Reference palette — use in Level 2 tokens.
          </div>
        </div>
        {L1_PALETTES.map(({ name, swatches }) => (
          <div key={name} style={{ padding: '6px 16px' }}>
            <div style={{ color: '#444', fontSize: 10, marginBottom: 5, letterSpacing: '0.04em' }}>{name}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {swatches.map(hex => (
                <div
                  key={hex}
                  title={hex}
                  style={{
                    width: 22, height: 22, borderRadius: 3,
                    background: hex, border: '1px solid rgba(255,255,255,0.08)',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </Sect>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Shared UI primitives
   ═══════════════════════════════════════════════════════════════ */
function Sect({ label, children }) {
  return (
    <div>
      <div style={{
        padding: '10px 16px 8px',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#444', borderBottom: '1px solid #252525',
        position: 'sticky', top: 0, background: '#1c1c1c', zIndex: 1,
      }}>
        {label}
      </div>
      <div style={{ padding: '4px 0 8px' }}>{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 16px', gap: 8, minHeight: 32 }}>
      <span style={{ color: '#888', fontSize: 12, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}


/* ── Palette colour picker — selects an L1 token reference ──── */
function ColorRow({ label, name, l2, set }) {
  const currentToken = l2[name] || '--prim-mono-900';
  const hex = L1_COLOR_MAP[currentToken] || '#888';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close when clicking outside */
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
        {/* Trigger button */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#262626', border: '1px solid #3a3a3a', padding: '3px 8px 3px 5px', borderRadius: 4, cursor: 'pointer' }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 2, background: hex, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <span style={{ color: '#777', fontSize: 10, fontFamily: 'monospace' }}>{shortName}</span>
        </button>

        {/* Palette dropdown */}
        {open && (
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 200, background: '#181818', border: '1px solid #2e2e2e', borderRadius: 6, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 220 }}>
            {L1_COLOR_PALETTES.map(({ name: palName, tokens }) => (
              <div key={palName} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#444', fontSize: 9, width: 44, flexShrink: 0, letterSpacing: '0.04em' }}>{palName}</span>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {tokens.map(tok => (
                    <button
                      key={tok}
                      title={tok}
                      onClick={() => { set(name, tok); setOpen(false); }}
                      style={{
                        width: 16, height: 16,
                        background: L1_COLOR_MAP[tok],
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

function FontRow({ label, name, l2, set }) {
  const val = l2[name] || 'Raleway';
  return (
    <Row label={label}>
      <select
        value={val}
        onChange={e => set(name, e.target.value)}
        style={{
          background: '#262626', border: '1px solid #3a3a3a', color: '#ccc',
          fontSize: 11, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', maxWidth: 155,
          fontFamily: fontStack(val),
        }}
      >
        {FONT_OPTIONS.map(f => (
          <option key={f} value={f} style={{ fontFamily: fontStack(f) }}>{f}</option>
        ))}
      </select>
    </Row>
  );
}

function RoleRow({ label, name, l2, set }) {
  const ROLES = [
    { value: 'heading',    label: 'Heading' },
    { value: 'subheading', label: 'Subheading' },
    { value: 'body',       label: 'Body' },
  ];
  return (
    <Row label={label}>
      <select
        value={l2[name] || 'body'}
        onChange={e => set(name, e.target.value)}
        style={{
          background: '#262626', border: '1px solid #3a3a3a', color: '#ccc',
          fontSize: 11, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', maxWidth: 140,
        }}
      >
        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
    </Row>
  );
}

function SliderRow({ label, name, l2, set, min, max, unit }) {
  return (
    <Row label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="range" min={min} max={max} value={l2[name]}
          onChange={e => set(name, e.target.value)}
          style={{ width: 90, accentColor: '#666', cursor: 'pointer' }} />
        <span style={{ color: '#555', fontSize: 11, minWidth: 42, textAlign: 'right', fontFamily: 'monospace' }}>
          {l2[name]}{unit}
        </span>
      </div>
    </Row>
  );
}

/* ─── Button styles ──────────────────────────────────────────── */
const ghostBtn = {
  background: '#2a2a2a', border: '1px solid #3a3a3a',
  color: '#888', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
};
const iconBtn = (enabled) => ({
  background: 'none', border: 'none', padding: '4px 4px',
  color: enabled ? '#888' : '#333', cursor: enabled ? 'pointer' : 'default',
  display: 'flex', alignItems: 'center', borderRadius: 3,
});
