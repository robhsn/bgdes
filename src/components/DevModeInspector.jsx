import React, { useState, useEffect, useRef, useCallback } from 'react';
import { L1_COLOR_MAP } from './TokenEditor';

/* ─── Constants ──────────────────────────────────────────────── */
const SKIP_TAGS = new Set([
  'script','style','head','meta','link','noscript','template','base','title','br',
  'defs','clippath','lineargradient','radialgradient','stop','filter','mask','symbol',
]);
const FONT_ROLE_MAP = {
  'Raleway':           '--prim-type-heading',
  'Inter':             '--prim-type-body',
  'Georgia':           '--prim-type-subheading',
  'Playfair Display':  '--prim-type-heading',
  'Merriweather':      '--prim-type-heading',
  'DM Sans':           '--prim-type-body',
  'Nunito':            '--prim-type-body',
  'Outfit':            '--prim-type-body',
  'Lora':              '--prim-type-heading',
  'Libre Baskerville': '--prim-type-heading',
  'Space Grotesk':     '--prim-type-body',
};

/* Build reverse color map: hex → token name */
const HEX_TO_TOKEN = {};
Object.entries(L1_COLOR_MAP).forEach(([tok, hex]) => {
  HEX_TO_TOKEN[hex.toLowerCase()] = tok;
});

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb;
  return '#' + [m[1], m[2], m[3]].map(n => Number(n).toString(16).padStart(2, '0')).join('').toLowerCase();
}

function resolveColorToken(computedVal) {
  const hex = rgbToHex(computedVal);
  const token = HEX_TO_TOKEN[hex];
  return { hex, token: token || null };
}

function resolveFontToken(fontFamily) {
  const first = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
  const token = FONT_ROLE_MAP[first];
  return { name: first, token: token || null };
}

function px(v) { return Math.round(parseFloat(v) || 0); }
function fmtPx(v) { const n = px(v); return n === 0 ? '-' : String(n); }

/* Does this element act as a layout container? (not text, not abs/fixed) */
const TEXT_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','span','a','em','strong','small','label','b','i','u','code','pre','blockquote','figcaption']);
function isLayoutContainer(el, computed) {
  if (!el || !computed) return false;
  const pos = computed.position;
  if (pos === 'absolute' || pos === 'fixed') return false;
  const display = computed.display;
  if (display === 'inline' || display === 'none') return false;
  const tag = el.tagName.toLowerCase();
  if (TEXT_TAGS.has(tag) && display !== 'flex' && display !== 'grid' && display !== 'inline-flex' && display !== 'inline-grid') return false;
  return true;
}

/* ─── Element filtering ──────────────────────────────────────── */
function isMeaningful(el) {
  const tag = el.tagName.toLowerCase();
  return !SKIP_TAGS.has(tag);
}

function shouldSkip(el) {
  if (!el || !el.tagName) return true;
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

/* ─── Build tree + flatten with connector guides ─────────────── */
function buildTree(el) {
  if (shouldSkip(el)) return null;
  const meaningful = isMeaningful(el);
  const childTrees = [];
  for (const child of el.children) {
    const sub = buildTree(child);
    if (!sub) continue;
    if (sub.meaningful) {
      childTrees.push(sub);
    } else {
      childTrees.push(...sub.children);
    }
  }
  return { el, meaningful, label: meaningful ? makeLabel(el) : '', children: childTrees };
}

function flattenTree(node, depth, guides, collapsedSet) {
  const result = [];
  if (node.meaningful) {
    const hasChildren = node.children.length > 0;
    result.push({ el: node.el, depth, label: node.label, guides: [...guides], hasChildren });
    /* If this node is collapsed, skip its children */
    if (collapsedSet && collapsedSet.has(node.el)) return result;
  }
  const nextDepth = node.meaningful ? depth + 1 : depth;
  node.children.forEach((child, i) => {
    const isLast = i === node.children.length - 1;
    const nextGuides = node.meaningful ? [...guides, !isLast] : [...guides];
    result.push(...flattenTree(child, nextDepth, nextGuides, collapsedSet));
  });
  return result;
}

function gatherLayers(root, collapsedSet) {
  const tree = buildTree(root);
  if (!tree) return [];
  return flattenTree(tree, 0, [], collapsedSet);
}

/* Collect all elements that have children (for collapse-all) */
function gatherParentEls(root) {
  const tree = buildTree(root);
  if (!tree) return [];
  const parents = [];
  function walk(node) {
    if (node.meaningful && node.children.length > 0) parents.push(node.el);
    node.children.forEach(walk);
  }
  walk(tree);
  return parents;
}

/* ─── Detachable / draggable panel hook ───────────────────────── */
function useDetachablePanel(defaultPos, defaultSize) {
  const [detached, setDetached] = useState(false);
  const [pos, setPos] = useState(defaultPos);       // { x, y }
  const [size, setSize] = useState(defaultSize);     // { w, h }
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

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
      w: Math.max(240, startW + ev.clientX - startX),
      h: Math.max(200, startH + ev.clientY - startY),
    });
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [detached, size]);

  const detach = useCallback(() => setDetached(true), []);
  const dock = useCallback(() => setDetached(false), []);

  return { detached, pos, size, onDragStart, onResizeStart, detach, dock };
}

/* Detach / dock button SVGs */
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

/* Resize handle (bottom-right corner) */
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
        <path d="M14 4l-10 10M14 8l-6 6M14 12l-2 2" stroke="#555" strokeWidth="1.2"/>
      </svg>
    </div>
  );
}

/* ─── CSS property groups ─────────────────────────────────────── */
const CSS_GROUPS = [
  { key: 'layout', label: 'Layout', props: [
    'display','position','width','height','max-width','max-height',
    'padding','margin','gap','flex-direction','flex-wrap',
    'align-items','justify-content','flex-grow','flex-shrink',
  ]},
  { key: 'typo', label: 'Typography', props: [
    'font-family','font-size','font-weight','line-height',
    'letter-spacing','color','text-transform','text-align',
  ]},
  { key: 'appearance', label: 'Appearance', props: [
    'background-color','border','border-radius','box-shadow','opacity','overflow',
  ]},
];
const COLOR_PROPS = new Set(['color','background-color','border-color']);

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function DevModeInspector({ visible, onToggle, onClose }) {
  const [layersOpen, setLayersOpen] = useState(true);
  const [cssOpen, setCssOpen] = useState(true);
  const [hoveredEl, setHoveredEl] = useState(null);
  const [selectedEl, setSelectedEl] = useState(null);
  const [layers, setLayers] = useState([]);
  const [hoveredLayerEl, setHoveredLayerEl] = useState(null);
  const [overlayRect, setOverlayRect] = useState(null);
  const [selectedRect, setSelectedRect] = useState(null);
  const [collapsedSet, setCollapsedSet] = useState(() => new Set());
  const rafRef = useRef(null);

  /* Rebuild layers when visible, selection, or collapsed state changes */
  useEffect(() => {
    if (!visible) { setLayers([]); return; }
    setLayers(gatherLayers(document.body, collapsedSet));
  }, [visible, selectedEl, collapsedSet]);

  const toggleCollapsed = useCallback((el) => {
    setCollapsedSet(prev => {
      const next = new Set(prev);
      if (next.has(el)) next.delete(el); else next.add(el);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    const parents = gatherParentEls(document.body);
    setCollapsedSet(new Set(parents));
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedSet(new Set());
  }, []);

  /* Resolve selectedEl → closest ancestor that appears in the layers list.
     This handles clicking on bare text inside an h1 that also contains a span:
     the click target is the h1, which should match the h1 layer entry. */
  const layerElSet = React.useMemo(() => new Set(layers.map(l => l.el)), [layers]);
  const matchedLayerEl = React.useMemo(() => {
    if (!selectedEl) return null;
    let el = selectedEl;
    while (el && el !== document.body) {
      if (layerElSet.has(el)) return el;
      el = el.parentElement;
    }
    return null;
  }, [selectedEl, layerElSet]);

  /* ── Hover overlay tracking ─────────────────────────────────── */
  useEffect(() => {
    if (!visible) { setOverlayRect(null); setHoveredEl(null); return; }
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
  }, [visible]);

  /* ── Click to select ────────────────────────────────────────── */
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (shouldSkip(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedEl(e.target);
      const r = e.target.getBoundingClientRect();
      setSelectedRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [visible]);

  /* ── Recalculate selected rect on scroll/resize ─────────────── */
  useEffect(() => {
    if (!visible || !selectedEl) return;
    const update = () => {
      if (!selectedEl.isConnected) { setSelectedEl(null); setSelectedRect(null); return; }
      const r = selectedEl.getBoundingClientRect();
      setSelectedRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
  }, [visible, selectedEl]);

  /* ── Layer hover → page highlight ───────────────────────────── */
  useEffect(() => {
    if (!hoveredLayerEl) return;
    const r = hoveredLayerEl.getBoundingClientRect();
    setOverlayRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    return () => setOverlayRect(null);
  }, [hoveredLayerEl]);

  /* ── Clear on close ─────────────────────────────────────────── */
  useEffect(() => {
    if (!visible) { setSelectedEl(null); setSelectedRect(null); setHoveredEl(null); setOverlayRect(null); }
  }, [visible]);

  const handleLayerClick = useCallback((el) => {
    setSelectedEl(el);
    const r = el.getBoundingClientRect();
    setSelectedRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  /* ── Floating button — always visible ───────────────────────── */
  const floatingButton = (
    <button
      className="devmode-toggle-btn"
      data-devmode-ignore
      onClick={onToggle}
      aria-label="Toggle Dev Mode"
      style={{
        position: 'fixed', bottom: 75, right: 16, zIndex: 9998,
        width: 45, height: 45, borderRadius: '50%',
        background: visible ? '#0c3775' : 'rgba(28,28,28,0.85)',
        border: visible ? '1px solid rgba(88,221,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', opacity: visible ? 1 : 0.5, transition: 'opacity 0.2s, background 0.2s',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        color: visible ? '#58ddff' : '#999',
        fontSize: 15, fontWeight: 700, fontFamily: 'monospace',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => { if (!visible) e.currentTarget.style.opacity = '0.5'; }}
    >
      {'</>'}
    </button>
  );

  if (!visible) return floatingButton;

  const computed = selectedEl ? window.getComputedStyle(selectedEl) : null;

  return (
    <>
      {floatingButton}
      <Overlays overlayRect={overlayRect} selectedRect={selectedRect} selectedEl={selectedEl} />

      {/* ── Layers panel (LEFT) ──────────────────────────────── */}
      <LayersPanel
        open={layersOpen}
        onToggle={() => setLayersOpen(o => !o)}
        layers={layers}
        selectedEl={matchedLayerEl}
        onLayerClick={handleLayerClick}
        onLayerHover={setHoveredLayerEl}
        collapsedSet={collapsedSet}
        onToggleCollapsed={toggleCollapsed}
        onCollapseAll={collapseAll}
        onExpandAll={expandAll}
      />

      {/* ── CSS panel (RIGHT) ────────────────────────────────── */}
      <CSSPanel
        open={cssOpen}
        onToggle={() => setCssOpen(o => !o)}
        onClose={onClose}
        selectedEl={selectedEl}
        computed={computed}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Layers Panel — LEFT side
   ═══════════════════════════════════════════════════════════════ */
function LayersPanel({ open, onToggle, layers, selectedEl, onLayerClick, onLayerHover, collapsedSet, onToggleCollapsed, onCollapseAll, onExpandAll }) {
  const scrollRef = useRef(null);
  const selectedRowRef = useRef(null);
  const panel = useDetachablePanel({ x: 40, y: 40 }, { w: 280, h: 500 });

  /* Auto-scroll to the selected layer when selectedEl changes */
  useEffect(() => {
    if (!selectedRowRef.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const row = selectedRowRef.current;
    const ct = container.scrollTop;
    const ch = container.clientHeight;
    const rt = row.offsetTop;
    const rh = row.offsetHeight;
    if (rt < ct || rt + rh > ct + ch) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedEl]);

  /* Collapse tab — only shown when docked */
  const collapseTab = !panel.detached ? (
    <button
      data-devmode-ignore
      onClick={onToggle}
      title={open ? 'Collapse Layers' : 'Expand Layers'}
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        left: open ? 280 : 0,
        zIndex: 10000,
        background: '#1c1c1c',
        border: '1px solid #333',
        borderLeft: 'none',
        borderRadius: '0 6px 6px 0',
        color: '#888',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        width: 20,
        height: 48,
        transition: 'left 0.15s ease, color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
      onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path d={open ? 'M7 1l-6 6 6 6' : 'M1 1l6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  ) : null;

  if (!open && !panel.detached) return collapseTab;

  /* Panel positioning: docked or floating */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #444',
      }
    : {
        position: 'fixed', top: 0, left: 0,
        width: 280, height: '100vh',
      };

  return (
    <>
      {collapseTab}
      <div data-devmode-panel style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : '6px 0 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {panel.detached && <ResizeHandle onMouseDown={panel.onResizeStart} />}
        {/* Header — draggable when detached */}
        <div
          onMouseDown={panel.detached ? panel.onDragStart : undefined}
          style={{
            padding: '8px 12px', borderBottom: '1px solid #222',
            flexShrink: 0, background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: panel.detached ? 'grab' : 'default',
            userSelect: 'none',
          }}
        >
          <span style={{
            fontWeight: 700, fontSize: 10, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#58ddff',
          }}>
            Layers
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Collapse all / Expand all */}
            <button
              onClick={onCollapseAll}
              title="Collapse all"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888', padding: '2px 4px', borderRadius: 3,
                fontSize: 9, fontFamily: 'monospace', display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l4 4 4-4"/>
                <path d="M4 2l4 4 4-4"/>
              </svg>
            </button>
            <button
              onClick={onExpandAll}
              title="Expand all"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#888', padding: '2px 4px', borderRadius: 3,
                fontSize: 9, fontFamily: 'monospace', display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10l4-4 4 4"/>
                <path d="M4 14l4-4 4 4"/>
              </svg>
            </button>
            <div style={{ width: 1, height: 14, background: '#333', margin: '0 2px' }} />
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
          </div>
        </div>

        {/* Tree */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {layers.length === 0 && (
            <div style={{ padding: '16px 12px', color: '#999', fontSize: 11 }}>
              Hover over the page to inspect
            </div>
          )}
          {layers.map((layer, i) => {
            const isSel = selectedEl === layer.el;
            const isCollapsed = collapsedSet && collapsedSet.has(layer.el);
            return (
            <LayerRow
              key={i}
              ref={isSel ? selectedRowRef : null}
              layer={layer}
              isSelected={isSel}
              isCollapsed={isCollapsed}
              onClick={() => onLayerClick(layer.el)}
              onDoubleClick={() => { if (layer.hasChildren) onToggleCollapsed(layer.el); }}
              onMouseEnter={() => onLayerHover(layer.el)}
              onMouseLeave={() => onLayerHover(null)}
            />
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ── Single layer row with tree connector lines ──────────────── */
const INDENT = 18;
const LINE_COLOR = '#444';
const LINE_ACTIVE = '#666';

const LayerRow = React.forwardRef(function LayerRow({ layer, isSelected, isCollapsed, onClick, onDoubleClick, onMouseEnter, onMouseLeave }, ref) {
  const { depth, label, guides, hasChildren } = layer;
  const totalIndent = 10 + depth * INDENT;

  return (
    <button
      ref={ref}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex', alignItems: 'center', width: '100%',
        textAlign: 'left', background: 'transparent', border: 'none',
        cursor: 'pointer', padding: 0, position: 'relative',
        height: 26, minHeight: 26,
      }}
      onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = '#252525'; }}
      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Vertical guide lines for each ancestor depth */}
      {guides.map((hasSibling, i) => hasSibling ? (
        <div key={i} style={{
          position: 'absolute',
          left: 10 + i * INDENT + 5,
          top: 0, bottom: 0, width: 1,
          background: isSelected ? LINE_ACTIVE : LINE_COLOR,
        }} />
      ) : null)}

      {/* Connector: horizontal line + elbow for this node */}
      {depth > 0 && (
        <>
          {/* Vertical stub (goes from top to middle) */}
          <div style={{
            position: 'absolute',
            left: 10 + (depth - 1) * INDENT + 5,
            top: 0, height: 13, width: 1,
            background: isSelected ? LINE_ACTIVE : LINE_COLOR,
          }} />
          {/* Horizontal connector */}
          <div style={{
            position: 'absolute',
            left: 10 + (depth - 1) * INDENT + 5,
            top: 13, height: 1,
            width: INDENT - 5,
            background: isSelected ? LINE_ACTIVE : LINE_COLOR,
          }} />
        </>
      )}

      {/* Label with chevron for parents */}
      <span style={{
        paddingLeft: totalIndent,
        color: isSelected ? '#58ddff' : '#ccc',
        fontSize: 11, fontFamily: 'monospace',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        flex: 1,
        background: isSelected ? '#0c3775' : 'transparent',
        padding: '3px 8px 3px ' + totalIndent + 'px',
        borderLeft: isSelected ? '2px solid #58ddff' : '2px solid transparent',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {hasChildren && (
          <span style={{
            fontSize: 8, color: isSelected ? '#58ddff' : '#888',
            flexShrink: 0, width: 8, textAlign: 'center',
          }}>
            {isCollapsed ? '▸' : '▾'}
          </span>
        )}
        {label}
      </span>
    </button>
  );
});

/* ═══════════════════════════════════════════════════════════════
   CSS Panel — RIGHT side
   ═══════════════════════════════════════════════════════════════ */
const COLOR_MODES = [
  { key: 'var',  label: 'var()' },
  { key: 'hex',  label: 'HEX' },
  { key: 'rgba', label: 'RGBA' },
];

function CSSPanel({ open, onToggle, onClose, selectedEl, computed }) {
  const [colorMode, setColorMode] = useState('var');
  const panel = useDetachablePanel({ x: window.innerWidth - 440, y: 40 }, { w: 400, h: 600 });

  /* Collapse tab — only shown when docked */
  const collapseTab = !panel.detached ? (
    <button
      data-devmode-ignore
      onClick={onToggle}
      title={open ? 'Collapse CSS' : 'Expand CSS'}
      style={{
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        right: open ? 'calc(30vw)' : 0,
        zIndex: 10000,
        background: '#1c1c1c',
        border: '1px solid #333',
        borderRight: 'none',
        borderRadius: '6px 0 0 6px',
        color: '#888',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        width: 20,
        height: 48,
        transition: 'right 0.15s ease, color 0.2s',
        minWidth: 20,
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
      onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
        <path d={open ? 'M1 1l6 6-6 6' : 'M7 1l-6 6 6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  ) : null;

  if (!open && !panel.detached) return collapseTab;

  /* Panel positioning: docked or floating */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #444',
      }
    : {
        position: 'fixed', top: 0, right: 0,
        width: '30vw', minWidth: 380, height: '100vh',
      };

  return (
    <>
      {collapseTab}
      <div data-devmode-panel style={{
        ...panelStyle,
        background: '#1c1c1c', color: '#e0e0e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 12, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : '-6px 0 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {panel.detached && <ResizeHandle onMouseDown={panel.onResizeStart} />}
        {/* Header — draggable when detached */}
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
            textTransform: 'uppercase', color: '#58ddff',
          }}>
            CSS Properties
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Color mode switcher */}
            <div style={{
              display: 'flex', background: '#222', borderRadius: 4,
              border: '1px solid #333', overflow: 'hidden',
            }}>
              {COLOR_MODES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setColorMode(m.key)}
                  style={{
                    background: colorMode === m.key ? '#3a3a3a' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: colorMode === m.key ? '#e0e0e0' : '#999',
                    fontSize: 9, fontWeight: colorMode === m.key ? 700 : 400,
                    padding: '3px 7px', fontFamily: 'monospace',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 14, background: '#333', margin: '0 2px' }} />
            {/* Detach / dock button */}
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
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: '#888',
              fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 3px',
            }}>×</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!selectedEl ? (
            <div style={{ padding: '16px 12px', color: '#999', fontSize: 11 }}>
              Click an element to inspect its CSS
            </div>
          ) : (() => {
            const showLayout = isLayoutContainer(selectedEl, computed);
            return (
            <>
              {/* ── Box model diagram (containers only) ────────── */}
              {showLayout && (
                <CollapsibleSection label="Layer Properties" defaultOpen>
                  <BoxModelDiagram computed={computed} />
                </CollapsibleSection>
              )}

              {/* ── CSS code blocks per group ──────────────────── */}
              {CSS_GROUPS
                .filter(g => g.key !== 'layout' || showLayout)
                .map(group => (
                  <CSSCodeSection key={group.key} group={group} computed={computed} colorMode={colorMode} />
              ))}
            </>
            );
          })()}
        </div>
      </div>
    </>
  );
}

/* ─── Collapsible section ─────────────────────────────────────── */
function CollapsibleSection({ label, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div style={{ borderBottom: '1px solid #2a2a2a' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '8px 12px', background: 'none', border: 'none',
          cursor: 'pointer', color: '#e0e0e0',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#888', fontSize: 9 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Box Model Diagram — Figma-style nested boxes
   ═══════════════════════════════════════════════════════════════ */
function BoxModelDiagram({ computed }) {
  const mt = px(computed.marginTop), mr = px(computed.marginRight);
  const mb = px(computed.marginBottom), ml = px(computed.marginLeft);
  const bt = px(computed.borderTopWidth), br = px(computed.borderRightWidth);
  const bb = px(computed.borderBottomWidth), blw = px(computed.borderLeftWidth);
  const pt = px(computed.paddingTop), pr = px(computed.paddingRight);
  const pb = px(computed.paddingBottom), plv = px(computed.paddingLeft);
  const w = px(computed.width), h = px(computed.height);
  const boxSizing = computed.boxSizing;

  const badge = (val, pos) => (
    <span style={{
      position: 'absolute', ...pos,
      background: '#134b9b', color: '#58ddff',
      fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
      padding: '1px 5px', borderRadius: 3, whiteSpace: 'nowrap',
      transform: pos.top !== undefined && pos.left !== undefined && pos.right !== undefined
        ? undefined
        : pos.top !== undefined ? 'translateX(-50%)' : 'translateY(-50%)',
    }}>
      {val}
    </span>
  );

  const dimLabel = (val) => val === 0 ? '-' : String(val);

  const boxLabel = (text, style) => (
    <span style={{
      position: 'absolute', fontSize: 9, fontWeight: 600,
      color: '#999', letterSpacing: '0.04em', ...style,
    }}>
      {text}
    </span>
  );

  return (
    <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Outer margin box */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 320,
        background: '#2a2a2a', borderRadius: 6, padding: 0,
        fontFamily: 'monospace', fontSize: 10, color: '#999',
      }}>
        {/* Margin top value */}
        <div style={{ textAlign: 'center', padding: '8px 0 2px', color: '#999' }}>{dimLabel(mt)}</div>

        {/* Margin left + right on the row */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            {dimLabel(ml)}
          </div>

          {/* Border box */}
          <div style={{
            flex: 1, background: '#353535', border: '1px solid #4a4a4a',
            borderRadius: 4, position: 'relative',
          }}>
            {boxLabel('Border', { top: 6, left: 8 })}
            {/* Border values */}
            <div style={{ textAlign: 'center', padding: '6px 0 2px', color: '#999', fontSize: 9 }}>{dimLabel(bt)}</div>

            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 9 }}>
                {dimLabel(blw)}
              </div>

              {/* Padding box */}
              <div style={{
                flex: 1, background: '#3d3d3d', border: '1px solid #555',
                borderRadius: 3, position: 'relative',
              }}>
                {boxLabel('Padding', { top: 4, left: 6 })}
                <div style={{ textAlign: 'center', padding: '4px 0 2px', color: '#aaa', fontSize: 9 }}>{dimLabel(pt)}</div>

                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 9 }}>
                    {dimLabel(plv)}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, border: '1px dashed #666',
                    borderRadius: 2, padding: '10px 4px',
                    textAlign: 'center', color: '#bbb', fontSize: 10,
                    fontWeight: 600, background: '#4a4a4a',
                    minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {w} × {h}
                  </div>

                  <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 9 }}>
                    {dimLabel(pr)}
                  </div>
                </div>

                <div style={{ textAlign: 'center', padding: '2px 0 4px', color: '#aaa', fontSize: 9 }}>{dimLabel(pb)}</div>
              </div>

              <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 9 }}>
                {dimLabel(br)}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '2px 0 6px', color: '#999', fontSize: 9 }}>{dimLabel(bb)}</div>
          </div>

          <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            {dimLabel(mr)}
          </div>
        </div>

        {/* Margin bottom */}
        <div style={{ textAlign: 'center', padding: '2px 0 8px', color: '#666' }}>{dimLabel(mb)}</div>

        {/* box-sizing label */}
        <span style={{
          position: 'absolute', bottom: 6, right: 10,
          fontSize: 9, color: '#555', fontStyle: 'italic',
        }}>
          {boxSizing}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CSS Code Section — code-block style with line numbers + copy
   ═══════════════════════════════════════════════════════════════ */
/* Format a color value for display + copy based on the active mode */
function formatColorVal(rawRgb, colorHex, tokenInfo, mode) {
  if (mode === 'var' && tokenInfo) return `var(${tokenInfo})`;
  if (mode === 'hex') return colorHex || rawRgb;
  /* rgba — return the raw computed rgb/rgba string */
  return rawRgb;
}

function CSSCodeSection({ group, computed, colorMode }) {
  const lines = [];
  group.props.forEach(prop => {
    const val = computed.getPropertyValue(prop);
    if (!val || (val === 'none' && prop === 'box-shadow')) return;
    const isColor = COLOR_PROPS.has(prop) || (prop === 'border' && val.includes('rgb'));
    let tokenInfo = null;
    let colorHex = null;
    let rawRgb = null;

    if (isColor) {
      const rgbMatch = val.match(/rgba?\([^)]+\)/);
      if (rgbMatch) {
        rawRgb = rgbMatch[0];
        const resolved = resolveColorToken(rawRgb);
        colorHex = resolved.hex;
        tokenInfo = resolved.token;
      }
    }
    if (prop === 'font-family') {
      const resolved = resolveFontToken(val);
      if (resolved.token) tokenInfo = resolved.token;
    }

    lines.push({ prop, val, tokenInfo, colorHex, rawRgb, isColor });
  });

  if (lines.length === 0) return null;

  /* Build copy text respecting the active color mode */
  const copyText = lines.map(l => {
    let v = l.val;
    if (l.isColor && l.rawRgb) {
      const formatted = formatColorVal(l.rawRgb, l.colorHex, l.tokenInfo, colorMode);
      /* For border etc. that contain rgb inside a larger string, replace the rgb part */
      v = l.val.replace(l.rawRgb, formatted);
    }
    return `${l.prop}: ${v};`;
  }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText).catch(() => {});
  };

  return (
    <div style={{ borderBottom: '1px solid #2a2a2a' }}>
      {/* Section header with copy button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 4px',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0' }}>
          {group.label}
        </span>
        <button
          onClick={handleCopy}
          title={`Copy ${group.label} CSS`}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#555', padding: '2px 4px', borderRadius: 3,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>

      {/* Code block */}
      <div style={{
        margin: '0 12px 8px', background: '#141414',
        border: '1px solid #2a2a2a', borderRadius: 6,
        overflow: 'hidden',
      }}>
        {lines.map((line, i) => {
          /* Determine displayed value based on color mode */
          let displayVal = line.val;
          let isToken = false;
          if (line.isColor && line.rawRgb) {
            const formatted = formatColorVal(line.rawRgb, line.colorHex, line.tokenInfo, colorMode);
            displayVal = line.val.replace(line.rawRgb, formatted);
            isToken = colorMode === 'var' && !!line.tokenInfo;
          } else if (line.tokenInfo && !line.isColor) {
            /* font token — only show var() in var mode */
            if (colorMode === 'var') {
              displayVal = `var(${line.tokenInfo})`;
              isToken = true;
            }
          }

          return (
          <div key={line.prop} style={{
            display: 'flex', alignItems: 'center',
            padding: '2px 0', minHeight: 22,
            borderBottom: i < lines.length - 1 ? '1px solid #1e1e1e' : 'none',
          }}>
            {/* Line number */}
            <span style={{
              width: 28, flexShrink: 0, textAlign: 'right',
              paddingRight: 8, fontSize: 10, fontFamily: 'monospace',
              color: '#444', userSelect: 'none',
            }}>
              {i + 1}
            </span>
            {/* Gutter */}
            <div style={{
              width: 1, height: 16, background: '#2a2a2a',
              flexShrink: 0, marginRight: 8,
            }} />
            {/* Property name */}
            <span style={{
              color: '#b0b0b0', fontSize: 11, fontFamily: 'monospace',
              flexShrink: 0,
            }}>
              {line.prop}:
            </span>
            <span style={{ width: 6, flexShrink: 0 }}/>
            {/* Color swatch */}
            {line.colorHex && (
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                borderRadius: 2, background: line.colorHex,
                border: '1px solid rgba(255,255,255,0.15)',
                flexShrink: 0, marginRight: 4,
              }} />
            )}
            {/* Value */}
            <span style={{
              color: isToken ? '#58ddff' : '#d4976c',
              fontSize: 11, fontFamily: 'monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {truncate(displayVal, 50)};
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function truncate(val, max) {
  return val.length > max ? val.slice(0, max - 1) + '…' : val;
}

/* ═══════════════════════════════════════════════════════════════
   Overlays — hover highlight + selected element border & label
   ═══════════════════════════════════════════════════════════════ */
function Overlays({ overlayRect, selectedRect, selectedEl }) {
  return (
    <>
      {overlayRect && (
        <div data-devmode-ignore style={{
          position: 'fixed',
          top: overlayRect.top, left: overlayRect.left,
          width: overlayRect.width, height: overlayRect.height,
          background: 'rgba(88, 221, 255, 0.08)',
          border: '1px solid rgba(88, 221, 255, 0.4)',
          pointerEvents: 'none', zIndex: 9997, borderRadius: 2,
        }} />
      )}
      {selectedRect && selectedEl && (
        <>
          <div data-devmode-ignore style={{
            position: 'fixed',
            top: selectedRect.top, left: selectedRect.left,
            width: selectedRect.width, height: selectedRect.height,
            border: '2px solid #58ddff',
            pointerEvents: 'none', zIndex: 9997, borderRadius: 2,
          }} />
          <div data-devmode-ignore style={{
            position: 'fixed',
            top: selectedRect.top - 22, left: selectedRect.left,
            background: '#0c3775', color: '#58ddff',
            fontSize: 10, fontFamily: 'monospace', fontWeight: 600,
            padding: '2px 6px', borderRadius: 3,
            pointerEvents: 'none', zIndex: 9997, whiteSpace: 'nowrap',
          }}>
            {selectedEl.tagName.toLowerCase()}
            {typeof selectedEl.className === 'string' && selectedEl.className.trim()
              ? '.' + selectedEl.className.trim().split(/\s+/).slice(0, 2).join('.')
              : ''}
          </div>
        </>
      )}
    </>
  );
}
