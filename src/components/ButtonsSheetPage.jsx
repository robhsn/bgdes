import React from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import { useDMEState } from '../context/dme-states';

/* ── Surface mapping ──────────────────────────────────────────── */
const SURFACE_MAP = {
  'Primary':   '',
  'Secondary': 'surface-muted',
  'Inverse':   'surface-inverse',
  'Accent':    'surface-accent',
  'Tertiary':  'surface-tertiary',
};

/* ── Arrow icon — scales per button size ──────────────────────── */
const ICON_SIZE = { 'com-btn--lg': 20, '': 16, 'com-btn--sm': 14, 'com-btn--xsm': 10, 'com-btn--micro': 12 };

function ProfileIcon({ sizeCls, variant }) {
  const px = ICON_SIZE[sizeCls] ?? 16;
  const color = variant === 'com-btn--ghost' ? 'var(--com-btn-ghost-icon)' : 'currentColor';
  return (
    <svg width={px} height={px} viewBox="0 0 60 60" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z"/>
    </svg>
  );
}

/* ── Button matrix data ───────────────────────────────────────── */
const VARIANTS = [
  { label: 'Primary',    cls: 'com-btn--primary',    icon: true },
  { label: 'Dark',       cls: 'com-btn--dark',       icon: true },
  { label: 'Ghost',      cls: 'com-btn--ghost',      icon: true },
  { label: 'Outline',    cls: 'com-btn--outline',    icon: true },
  { label: 'Tertiary',       cls: 'com-btn--tertiary',       icon: false },
  { label: 'Quaternary',     cls: 'com-btn--quaternary',     icon: false },
  { label: 'Destructive',   cls: 'com-btn--destructive',    icon: false },
  { label: 'Destructive UI', cls: 'com-btn--destructive-ui', icon: false },
  { label: 'Pill',           cls: 'com-btn--pill',           icon: false },
];

const SIZES = [
  { label: 'Large',  cls: 'com-btn--lg' },
  { label: 'Medium', cls: '' },
  { label: 'Small',  cls: 'com-btn--sm' },
  { label: 'XS',     cls: 'com-btn--xsm' },
  { label: 'Micro',  cls: 'com-btn--micro' },
];

const STATES = [
  { label: 'Default',  props: {} },
  { label: 'Selected', props: { 'aria-pressed': 'true' }, className: 'is-active' },
  { label: 'Hover',    props: {}, style: { transform: 'scale(1.02)', filter: 'brightness(1.1)' } },
  { label: 'Active',   props: {}, style: { transform: 'scale(0.98)' } },
  { label: 'Focus',    props: {}, style: { outline: '2px solid #58ddff', outlineOffset: '2px' } },
  { label: 'Disabled', props: { disabled: true }, style: { opacity: 0.5, cursor: 'not-allowed' } },
];

const PILL_SIZES = [
  { label: 'Large',  cls: 'com-btn--pill-lg' },
  { label: 'Medium', cls: '' },
  { label: 'Small',  cls: 'com-btn--pill-sm' },
];

/* ── Shared cell + header styles ──────────────────────────────── */
const thStyle = {
  padding: '8px 12px',
  fontFamily: 'var(--font-ui-sm), sans-serif',
  fontSize: 'var(--size-ui-sm)',
  fontWeight: 600,
  color: 'var(--color-muted)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
  position: 'sticky',
  top: 0,
  background: 'inherit',
  zIndex: 2,
};

const tdStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

const rowLabelStyle = {
  ...tdStyle,
  fontFamily: 'var(--font-ui-sm), sans-serif',
  fontSize: 'var(--size-ui-sm)',
  fontWeight: 600,
  color: 'var(--color-muted)',
  whiteSpace: 'nowrap',
  minWidth: 100,
};

/* ── SVG Export ──────────────────────────────────────────────── */
const PROFILE_PATH = 'M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z';

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function exportToSVG() {
  const container = document.querySelector('[data-section-id="bs-content"]');
  if (!container) return;

  /* resolve background — walk up DOM if container is transparent */
  let bgColor = 'rgb(255, 255, 255)';
  let walkEl = container;
  while (walkEl) {
    const bg = getComputedStyle(walkEl).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { bgColor = bg; break; }
    walkEl = walkEl.parentElement;
  }

  /* layout constants */
  const PAD = 48, SECTION_GAP = 56, TITLE_H = 36, HEADER_H = 32;
  const CELL_PX = 14, CELL_PY = 12, LABEL_W = 80;

  /* canvas-based text measurement */
  const cvs = document.createElement('canvas');
  const ctx = cvs.getContext('2d');
  const measure = (text, family, size, weight) => {
    ctx.font = `${weight} ${size}px ${family}`;
    return ctx.measureText(text).width;
  };

  /* ── Pass 1: read every button from the DOM ────────────────── */
  const tables = container.querySelectorAll('table');
  const sections = [];

  tables.forEach((table, si) => {
    const sz = SIZES[si];
    const sec = { label: sz.label, cls: sz.cls, rows: [] };

    table.querySelectorAll('tbody tr').forEach((tr, ri) => {
      const row = { label: STATES[ri].label, cells: [] };

      tr.querySelectorAll('button').forEach((btn, vi) => {
        const cs = getComputedStyle(btn);
        const r  = btn.getBoundingClientRect();

        /* icon fill — for ghost we need the dedicated token, not currentColor */
        let iconColor = cs.color;
        if (VARIANTS[vi].icon && VARIANTS[vi].cls === 'com-btn--ghost') {
          const pathEl = btn.querySelector('svg path');
          if (pathEl) {
            const pf = getComputedStyle(pathEl).fill;
            if (pf && pf.startsWith('rgb')) iconColor = pf;
          }
        }

        row.cells.push({
          w: r.width, h: r.height,
          bg: cs.backgroundColor, fg: cs.color,
          bc: cs.borderColor, bw: parseFloat(cs.borderWidth) || 0,
          br: parseFloat(cs.borderRadius) || 0,
          ff: cs.fontFamily, fs: parseFloat(cs.fontSize),
          fw: cs.fontWeight,
          ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
          op: parseFloat(cs.opacity),
          hasIcon: VARIANTS[vi].icon, iconColor,
          iconSz: ICON_SIZE[sz.cls] ?? 16,
          gap: parseFloat(cs.gap) || 8,
          text: VARIANTS[vi].label,
          focus: ri === 3,
        });
      });
      sec.rows.push(row);
    });
    sections.push(sec);
  });

  /* ── Column widths & row heights ───────────────────────────── */
  const colW = VARIANTS.map((_, vi) => {
    let mx = 0;
    sections.forEach(s => s.rows.forEach(r => {
      if (r.cells[vi]) mx = Math.max(mx, r.cells[vi].w);
    }));
    return Math.ceil(mx) + CELL_PX * 2;
  });

  sections.forEach(s => s.rows.forEach(r => {
    let mx = 0;
    r.cells.forEach(c => { mx = Math.max(mx, c.h); });
    r.h = Math.ceil(mx) + CELL_PY * 2;
  }));

  /* ── Heading / label styles from DOM ───────────────────────── */
  const h3El = container.querySelector('h3');
  const h3CS = h3El ? getComputedStyle(h3El) : {};
  const spanEl = h3El?.querySelector('span');
  const spanCS = spanEl ? getComputedStyle(spanEl) : null;
  const thEl  = container.querySelector('th');
  const thCS  = thEl ? getComputedStyle(thEl) : {};

  /* ── SVG dimensions ────────────────────────────────────────── */
  const svgW = LABEL_W + colW.reduce((a, b) => a + b, 0) + PAD * 2;
  let svgH = PAD;
  sections.forEach((s, i) => {
    if (i) svgH += SECTION_GAP;
    svgH += TITLE_H + HEADER_H;
    s.rows.forEach(r => { svgH += r.h; });
  });
  svgH += PAD;

  /* ── Pass 2: build SVG string ──────────────────────────────── */
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">`);
  o.push(`<rect width="${svgW}" height="${svgH}" fill="${bgColor}"/>`);

  let y = PAD;

  sections.forEach((sec, si) => {
    if (si) y += SECTION_GAP;

    /* section title */
    const tF = h3CS.fontFamily || 'sans-serif';
    const tS = h3CS.fontSize  || '20px';
    const tW = h3CS.fontWeight || '700';
    const tC = h3CS.color      || '#000';
    o.push(`<text x="${PAD}" y="${y + TITLE_H / 2}" dy="0.35em" font-family="${escXml(tF)}" font-size="${tS}" font-weight="${tW}" fill="${tC}">${sec.label}</text>`);

    if (spanCS) {
      const clsLabel = sec.cls ? `.${sec.cls}` : '(default)';
      const titleW = measure(sec.label, tF, parseFloat(tS), tW);
      o.push(`<text x="${PAD + titleW + 12}" y="${y + TITLE_H / 2}" dy="0.35em" font-family="${escXml(spanCS.fontFamily)}" font-size="${spanCS.fontSize}" font-weight="400" fill="${spanCS.color}">${clsLabel}</text>`);
    }
    y += TITLE_H;

    /* column headers */
    const hF = thCS.fontFamily || 'sans-serif';
    const hS = thCS.fontSize  || '12px';
    const hW = thCS.fontWeight || '600';
    const hC = thCS.color      || '#888';
    o.push(`<text x="${PAD}" y="${y + HEADER_H / 2}" dy="0.35em" font-family="${escXml(hF)}" font-size="${hS}" font-weight="${hW}" fill="${hC}">State</text>`);

    let hx = PAD + LABEL_W;
    VARIANTS.forEach((v, vi) => {
      o.push(`<text x="${hx + colW[vi] / 2}" y="${y + HEADER_H / 2}" dy="0.35em" text-anchor="middle" font-family="${escXml(hF)}" font-size="${hS}" font-weight="${hW}" fill="${hC}">${v.label}</text>`);
      hx += colW[vi];
    });
    y += HEADER_H;

    /* data rows */
    sec.rows.forEach(row => {
      o.push(`<text x="${PAD}" y="${y + row.h / 2}" dy="0.35em" font-family="${escXml(hF)}" font-size="${hS}" font-weight="${hW}" fill="${hC}">${row.label}</text>`);

      let cx = PAD + LABEL_W;
      row.cells.forEach((c, vi) => {
        const bx = cx + (colW[vi] - c.w) / 2;
        const by = y + (row.h - c.h) / 2;
        const rx = Math.min(c.br, c.h / 2);
        const opAttr = c.op < 1 ? ` opacity="${c.op}"` : '';
        o.push(`<g${opAttr}>`);

        /* button background */
        const transBg = c.bg === 'rgba(0, 0, 0, 0)' || c.bg === 'transparent';
        if (!transBg) {
          o.push(`  <rect x="${bx}" y="${by}" width="${c.w}" height="${c.h}" rx="${rx}" fill="${c.bg}"/>`);
        }

        /* border */
        if (c.bw > 0) {
          const transB = c.bc === 'rgba(0, 0, 0, 0)' || c.bc === 'transparent';
          if (!transB) {
            o.push(`  <rect x="${bx + c.bw / 2}" y="${by + c.bw / 2}" width="${c.w - c.bw}" height="${c.h - c.bw}" rx="${Math.max(0, rx - c.bw / 2)}" fill="none" stroke="${c.bc}" stroke-width="${c.bw}"/>`);
          }
        }

        /* focus ring */
        if (c.focus) {
          o.push(`  <rect x="${bx - 4}" y="${by - 4}" width="${c.w + 8}" height="${c.h + 8}" rx="${rx + 4}" fill="none" stroke="#58ddff" stroke-width="2"/>`);
        }

        /* icon + text centered in the button */
        const tw = measure(c.text, c.ff, c.fs, c.fw);
        const iw = c.hasIcon ? c.iconSz : 0;
        const g  = c.hasIcon ? c.gap : 0;
        const totalCW = iw + g + tw;
        let px = bx + (c.w - totalCW) / 2;

        if (c.hasIcon) {
          const iy = by + (c.h - c.iconSz) / 2;
          o.push(`  <svg x="${px}" y="${iy}" width="${c.iconSz}" height="${c.iconSz}" viewBox="0 0 60 60"><path d="${PROFILE_PATH}" fill="${c.iconColor}"/></svg>`);
          px += c.iconSz + g;
        }

        const lsAttr = c.ls ? ` letter-spacing="${c.ls}px"` : '';
        o.push(`  <text x="${px}" y="${by + c.h / 2}" dy="0.35em" font-family="${escXml(c.ff)}" font-size="${c.fs}" font-weight="${c.fw}" fill="${c.fg}"${lsAttr}>${c.text}</text>`);

        o.push('</g>');
        cx += colW[vi];
      });

      y += row.h;
    });
  });

  o.push('</svg>');

  /* ── trigger download ──────────────────────────────────────── */
  const blob = new Blob([o.join('\n')], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'buttons-sheet.svg';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Section: one table per size ──────────────────────────────── */
function SizeSection({ size }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{
        fontFamily: 'var(--font-section)',
        fontWeight: 700,
        fontSize: 'var(--size-h3)',
        color: 'var(--color-heading)',
        marginBottom: 16,
      }}>
        {size.label}
        <span style={{
          fontFamily: 'var(--font-ui-sm), sans-serif',
          fontSize: 'var(--size-ui-sm)',
          fontWeight: 400,
          color: 'var(--color-muted)',
          marginLeft: 10,
        }}>
          {size.cls ? `.${size.cls}` : '(default)'}
        </span>
      </h3>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 100 }}>State</th>
              {VARIANTS.map(v => (
                <th key={v.label} style={thStyle}>{v.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STATES.map(state => (
              <tr key={state.label}>
                <td style={rowLabelStyle}>{state.label}</td>
                {VARIANTS.map(variant => {
                  const cls = `com-btn ${variant.cls} ${size.cls} ${state.className || ''}`.trim();
                  return (
                    <td key={variant.label} style={tdStyle}>
                      <button
                        className={cls}
                        {...state.props}
                        style={{
                          ...(state.style || {}),
                          transition: 'none',
                          pointerEvents: 'none',
                        }}
                      >
                        {variant.icon && <ProfileIcon sizeCls={size.cls} variant={variant.cls} />}
                        {variant.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Section: Pill sizes ────────────────────────────────────── */
function PillSizeSection() {
  const pillStates = [
    { label: 'Default',  props: {}, className: '' },
    { label: 'Selected', props: { 'aria-pressed': 'true' }, className: 'is-active' },
    { label: 'Disabled', props: { disabled: true }, className: '' },
  ];

  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{
        fontFamily: 'var(--font-section)',
        fontWeight: 700,
        fontSize: 'var(--size-h3)',
        color: 'var(--color-heading)',
        marginBottom: 16,
      }}>
        Pill Sizes
        <span style={{
          fontFamily: 'var(--font-ui-sm), sans-serif',
          fontSize: 'var(--size-ui-sm)',
          fontWeight: 400,
          color: 'var(--color-muted)',
          marginLeft: 10,
        }}>
          .com-btn--pill
        </span>
      </h3>

      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 100 }}>Size</th>
              {pillStates.map(s => (
                <th key={s.label} style={thStyle}>{s.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PILL_SIZES.map(size => (
              <tr key={size.label}>
                <td style={rowLabelStyle}>{size.label}</td>
                {pillStates.map(state => {
                  const cls = `com-btn com-btn--pill ${size.cls} ${state.className}`.trim();
                  return (
                    <td key={state.label} style={tdStyle}>
                      <button
                        className={cls}
                        {...state.props}
                        style={{ transition: 'none', pointerEvents: 'none' }}
                      >
                        {size.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Buttons Sheet Page                                            */
/* ═══════════════════════════════════════════════════════════════ */

export default function ButtonsSheetPage({ onNavigate }) {
  const surfaceValue = useDMEState('buttonsSheet.surface', 'Primary');
  const surfaceClass = SURFACE_MAP[surfaceValue] ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <SiteHeader onNavigate={onNavigate} />

      <div
        className={surfaceClass || undefined}
        data-section-id="bs-content"
        style={{ flex: 1, padding: '40px var(--spacing-h)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Page header */}
          <div style={{
            fontFamily: 'var(--font-meta)',
            fontSize: 'var(--size-meta)',
            color: 'var(--color-muted)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}>
            Component Sheet
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--size-h1)',
            color: 'var(--color-heading)',
            marginBottom: 8,
          }}>
            Buttons
          </h1>
          <p style={{
            fontFamily: 'var(--font-lead)',
            fontSize: 'var(--size-body-lg)',
            color: 'var(--color-body)',
            marginBottom: 16,
            lineHeight: 1.6,
          }}>
            Every variant &times; every size &times; every state.
            Switch surfaces via the DME dropdown.
          </p>
          <div style={{ marginBottom: 48 }}>
            <button className="com-btn com-btn--outline com-btn--sm" onClick={exportToSVG}>
              Download SVG
            </button>
          </div>

          {/* One table per size */}
          {SIZES.map(size => (
            <SizeSection key={size.label} size={size} />
          ))}

          {/* Pill sizes */}
          <PillSizeSection />

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
