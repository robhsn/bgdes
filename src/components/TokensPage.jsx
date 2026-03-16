import React, { useState, useEffect } from 'react';
import './LearnSegmentTemplate.css';
import './TokensPage.css';
import { SiteHeader, SiteFooter } from './SharedLayout';
import fileDefaults from '../tokens/dme-defaults.json';

/* ── Helpers ─────────────────────────────────────────────────── */

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ── Derive active palettes from L2 usage ────────────────────── */

function getActivePalettes() {
  const l2 = fileDefaults.l2;
  const l1Colors = fileDefaults.l1Colors;
  const l1Groups = fileDefaults.l1Groups;

  // Collect all --prim-* tokens referenced in L2 color mappings
  const usedPrims = new Set();
  for (const val of Object.values(l2)) {
    if (typeof val === 'string' && val.startsWith('--prim-')) {
      usedPrims.add(val);
    }
  }

  // Filter groups to only those containing at least one used token
  return l1Groups.filter(group =>
    group.tokens.some(token => usedPrims.has(token))
  );
}

const ACTIVE_PALETTES = getActivePalettes();

/* ── Semantic color definitions ──────────────────────────────── */

const SEMANTIC_COLORS = [
  { name: '--color-bg',             label: 'Background' },
  { name: '--color-heading',        label: 'Heading' },
  { name: '--color-body',           label: 'Body' },
  { name: '--color-muted',          label: 'Muted' },
  { name: '--color-accent',         label: 'Accent' },
  { name: '--color-border',         label: 'Border' },
  { name: '--color-border-light',   label: 'Border Light' },
  { name: '--color-border-mid',     label: 'Border Mid' },
  { name: '--color-border-subtle',  label: 'Border Subtle' },
  { name: '--color-logo',           label: 'Logo' },
  { name: '--color-link',           label: 'Link' },
  { name: '--color-pill',           label: 'Pill' },
  { name: '--color-nav-bg',         label: 'Nav BG' },
  { name: '--color-nav-icon',       label: 'Nav Icon' },
  { name: '--color-badge-from',     label: 'Badge Gradient From' },
  { name: '--color-badge-to',       label: 'Badge Gradient To' },
  { name: '--color-avatar-bg',      label: 'Avatar BG' },
  { name: '--color-stat-percentile',label: 'Stat Percentile' },
];

/* ── Text style definitions ──────────────────────────────────── */

const TEXT_STYLES = [
  {
    role: 'H1',
    preview: 'Backgammon',
    family: '--font-heading',
    size: '--size-h1',
    weight: '--prim-type-heading-weight',
    ls: '--prim-type-heading-ls',
    lh: '--prim-type-heading-lh',
  },
  {
    role: 'H2',
    preview: 'Board Setup',
    family: '--font-subheading',
    size: '--size-h2',
    weight: '--prim-type-subheading-weight',
    ls: '--prim-type-subheading-ls',
    lh: '--prim-type-subheading-lh',
  },
  {
    role: 'Body',
    preview: 'The quick brown fox jumps over the lazy dog.',
    family: '--font-body',
    size: '--size-body',
    weight: '--prim-type-body-weight',
    ls: '--prim-type-body-ls',
    lh: '--prim-type-body-lh',
  },
  {
    role: 'Meta',
    preview: 'Mar 7, 2026 · 5 min read',
    family: '--font-meta',
    size: '--size-meta',
    weight: '--prim-type-body-weight',
    ls: '--prim-type-body-ls',
    lh: '--prim-type-body-lh',
  },
  {
    role: 'Small',
    preview: 'Fine print and captions',
    family: '--font-body',
    size: '--size-small',
    weight: '--prim-type-body-weight',
    ls: null,
    lh: null,
  },
  {
    role: 'Pill',
    preview: 'BEGINNER',
    family: '--font-pill',
    size: '--size-pill',
    weight: '--prim-type-heading-weight',
    ls: '--prim-type-heading-ls',
    lh: null,
  },
  {
    role: 'Logo',
    preview: 'Backgammon.com',
    family: '--font-logo',
    size: '--size-logo',
    weight: '--prim-type-heading-weight',
    ls: '--prim-type-heading-ls',
    lh: null,
  },
  {
    role: 'TOC',
    preview: 'Table of Contents',
    family: '--font-toc',
    size: null,
    sizeFixed: '12px',
    weight: null,
    ls: null,
    lh: null,
  },
];

/* ── Other token definitions ─────────────────────────────────── */

const SPACING_TOKENS = [
  { name: '--space-1',  px: '4px' },
  { name: '--space-2',  px: '6px' },
  { name: '--space-3',  px: '8px' },
  { name: '--space-4',  px: '10px' },
  { name: '--space-5',  px: '12px' },
  { name: '--space-6',  px: '16px' },
  { name: '--space-7',  px: '20px' },
  { name: '--space-8',  px: '24px' },
  { name: '--space-9',  px: '32px' },
  { name: '--space-10', px: '40px' },
  { name: '--space-11', px: '48px' },
  { name: '--space-12', px: '64px' },
];

const RADIUS_TOKENS = [
  { name: '--radius-sm',   value: '6px' },
  { name: '--radius-md',   value: '8px' },
  { name: '--radius-lg',   value: '10px' },
  { name: '--radius-xl',   value: '14px' },
  { name: '--radius-2xl',  value: '20px' },
  { name: '--radius-3xl',  value: '24px' },
  { name: '--radius-pill', value: '100px' },
  { name: '--radius-full', value: '50%' },
];

const SHADOW_TOKENS = [
  { name: '--shadow-sm', label: 'SM' },
  { name: '--shadow-md', label: 'MD' },
  { name: '--shadow-lg', label: 'LG' },
  { name: '--shadow-xl', label: 'XL' },
];

const STATUS_TOKENS = [
  { name: '--color-status-success', label: 'Success', hex: '#2e7d32' },
  { name: '--color-status-warning', label: 'Warning', hex: '#f9a825' },
  { name: '--color-status-error',   label: 'Error',   hex: '#c62828' },
];

/* ── Sections ────────────────────────────────────────────────── */

function ColorPalettesSection() {
  const l1Colors = fileDefaults.l1Colors;

  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Color Palettes</h2>
        <p className="tok-section-desc">L1 primitive color tokens used by the active theme.</p>
        {ACTIVE_PALETTES.map(palette => (
          <div key={palette.name}>
            <div className="tok-palette-label">{palette.name}</div>
            <div className="tok-swatch-grid">
              {palette.tokens.map(token => (
                <div key={token} className="tok-swatch">
                  <div
                    className="tok-swatch-color"
                    style={{ background: l1Colors[token] || `var(${token})` }}
                  />
                  <div className="tok-swatch-hex">{l1Colors[token] || ''}</div>
                  <div className="tok-swatch-name">{token.replace('--prim-', '')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemanticColorsSection() {
  const l2 = fileDefaults.l2;
  const l1Colors = fileDefaults.l1Colors;

  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Semantic Colors</h2>
        <p className="tok-section-desc">L2 semantic tokens that map primitives to functional roles. These change per theme.</p>
        <div className="tok-semantic-grid">
          {SEMANTIC_COLORS.map(c => {
            const primToken = l2[c.name]; // e.g. "--prim-mint-500"
            const hex = primToken ? (l1Colors[primToken] || '') : '';
            return (
              <div key={c.name} className="tok-semantic-row">
                <div className="tok-semantic-swatch" style={{ background: hex || `var(${c.name})` }} />
                <span className="tok-semantic-name">{c.name}</span>
                <span className="tok-semantic-prim">{primToken || ''}</span>
                <span className="tok-semantic-value">{hex}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SurfacesSection() {
  const surfaces = [
    { cls: 'surface-muted',    label: '.surface-muted' },
    { cls: 'surface-inverse',  label: '.surface-inverse' },
    { cls: 'surface-accent',   label: '.surface-accent' },
    { cls: 'surface-tertiary', label: '.surface-tertiary' },
  ];

  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Surface Classes</h2>
        <p className="tok-section-desc">Each surface re-maps semantic tokens to create a distinct color contract for its descendants.</p>
        <div className="tok-surface-grid">
          {surfaces.map(s => (
            <div key={s.cls} className={`tok-surface-card ${s.cls}`}>
              <div className="tok-surface-heading">{s.label}</div>
              <div className="tok-surface-body">Body text on this surface uses the remapped --color-body token.</div>
              <div className="tok-surface-muted">Muted text</div>
              <span className="tok-surface-link">Link text</span>
              <div className="tok-surface-border" />
              <button className="com-btn com-btn--primary com-btn--sm">Button</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TextStylesSection() {
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    const map = {};
    TEXT_STYLES.forEach(t => {
      const vars = [t.family, t.size, t.weight, t.ls, t.lh].filter(Boolean);
      vars.forEach(v => {
        if (!map[v]) map[v] = getCSSVar(v);
      });
    });
    setResolved(map);
  }, []);

  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Text Styles</h2>
        <p className="tok-section-desc">Type roles with live previews and resolved property values.</p>
        <div className="tok-textstyle-grid">
          {TEXT_STYLES.map(t => {
            const fontSize = t.sizeFixed || (t.size ? `var(${t.size})` : undefined);
            const style = {
              fontFamily: `var(${t.family})`,
              fontSize,
              fontWeight: t.weight ? `var(${t.weight})` : undefined,
              letterSpacing: t.ls ? `calc(var(${t.ls}) * 1px)` : undefined,
              lineHeight: t.lh ? `calc(1 + var(${t.lh}) / 100)` : undefined,
              color: 'var(--color-heading)',
            };
            return (
              <div key={t.role} className="tok-textstyle-card">
                <div className="tok-textstyle-label">{t.role}</div>
                <div className="tok-textstyle-preview" style={style}>
                  {t.preview}
                </div>
                <div className="tok-textstyle-pills">
                  {t.family && <span className="tok-pill">{resolved[t.family] || t.family}</span>}
                  {t.weight && <span className="tok-pill">{resolved[t.weight] || ''}</span>}
                  {t.size && <span className="tok-pill">{(resolved[t.size] || '') + 'px'}</span>}
                  {t.sizeFixed && <span className="tok-pill">{t.sizeFixed}</span>}
                  {t.ls && <span className="tok-pill">ls: {resolved[t.ls] || ''}</span>}
                  {t.lh && <span className="tok-pill">lh: {resolved[t.lh] || ''}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpacingSection() {
  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Spacing Scale</h2>
        <p className="tok-section-desc">Consistent spacing values used across the system.</p>
        <div className="tok-spacing-grid">
          {SPACING_TOKENS.map(s => (
            <div key={s.name} className="tok-spacing-row">
              <span className="tok-spacing-label">{s.name}</span>
              <div className="tok-spacing-bar" style={{ width: `var(${s.name})` }} />
              <span className="tok-spacing-px">{s.px}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadiusSection() {
  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Border Radius</h2>
        <p className="tok-section-desc">Radius scale for consistent corner rounding.</p>
        <div className="tok-radius-grid">
          {RADIUS_TOKENS.map(r => (
            <div key={r.name} className="tok-radius-demo">
              <div className="tok-radius-box" style={{ borderRadius: `var(${r.name})` }} />
              <div className="tok-radius-label">{r.name.replace('--radius-', '')}</div>
              <div className="tok-radius-value">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShadowsSection() {
  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Shadows</h2>
        <p className="tok-section-desc">Elevation levels for depth and hierarchy.</p>
        <div className="tok-shadow-grid">
          {SHADOW_TOKENS.map(s => (
            <div key={s.name} className="tok-shadow-card" style={{ boxShadow: `var(${s.name})` }}>
              <span className="tok-shadow-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusColorsSection() {
  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Status Colors</h2>
        <p className="tok-section-desc">Feedback and status indicators.</p>
        <div className="tok-status-grid">
          {STATUS_TOKENS.map(s => (
            <div key={s.name} className="tok-status-item">
              <div className="tok-status-dot" style={{ background: `var(${s.name})` }} />
              <div>
                <div className="tok-status-label">{s.label}</div>
                <div className="tok-status-var">{s.name}</div>
              </div>
            </div>
          ))}
          <div className="tok-status-item">
            <div className="tok-status-dot" style={{ background: 'var(--color-match-win-chip-bg)', border: '1px solid var(--color-match-win-chip-fg)' }} />
            <div>
              <div className="tok-status-label" style={{ color: 'var(--color-match-win-chip-fg)' }}>Win Chip</div>
              <div className="tok-status-var">--color-match-win-chip-*</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── .com Buttons showcase ──────────────────────────────────── */

const COM_VARIANTS = [
  { cls: 'com-btn--primary',    label: 'Primary' },
  { cls: 'com-btn--dark',       label: 'Dark' },
  { cls: 'com-btn--outline',    label: 'Outline' },
  { cls: 'com-btn--tertiary',   label: 'Tertiary' },
  { cls: 'com-btn--quaternary', label: 'Quaternary' },
  { cls: 'com-btn--ghost',      label: 'Ghost' },
];

const COM_SIZES = [
  { cls: '',            label: 'Default (48 px)' },
  { cls: 'com-btn--sm', label: 'Small (36 px)' },
  { cls: 'com-btn--lg', label: 'Large (auto)' },
];

function ComButtonsSection() {
  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">.com Buttons</h2>
        <p className="tok-section-desc">Shared button system matching backgammon.com production styles. Pill shapes, Inter 700, brand-colored 3D shadows.</p>

        {/* Variants showcase */}
        <div className="tok-com-btn-grid">
          <div className="tok-com-btn-row">
            <div className="tok-com-btn-row-label">Light background</div>
            <div className="tok-com-btn-row-buttons">
              {COM_VARIANTS.map(v => (
                <button key={v.cls} className={`com-btn ${v.cls}`}>{v.label}</button>
              ))}
            </div>
          </div>
          <div className="tok-com-btn-row tok-com-btn-row--dark">
            <div className="tok-com-btn-row-label">Dark background</div>
            <div className="tok-com-btn-row-buttons">
              {COM_VARIANTS.map(v => (
                <button key={v.cls} className={`com-btn ${v.cls}`}>{v.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Sizes showcase */}
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--color-heading)', margin: '32px 0 12px' }}>Sizes</h3>
        <div className="tok-com-btn-row-buttons" style={{ gap: 16 }}>
          {COM_SIZES.map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <button className={`com-btn com-btn--primary ${s.cls}`}>Button</button>
              <span style={{ fontFamily: 'var(--font-meta)', fontSize: 11, color: 'var(--color-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const BUTTON_TOKENS = [
  { name: '--btn-primary-bg',       label: 'Primary BG' },
  { name: '--btn-primary-fg',       label: 'Primary Text' },
  { name: '--btn-primary-border',   label: 'Primary Border' },
  { name: '--btn-secondary-bg',     label: 'Secondary BG' },
  { name: '--btn-secondary-fg',     label: 'Secondary Text' },
  { name: '--btn-secondary-border', label: 'Secondary Border' },
];

function LegacyButtonsSection() {
  const l2 = fileDefaults.l2;
  const l1Colors = fileDefaults.l1Colors;

  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Buttons (Legacy)</h2>
        <p className="tok-section-desc">Primary and secondary button variants using legacy button tokens. Preserved for future design updates.</p>
        <div className="tok-semantic-grid" style={{ marginBottom: 24 }}>
          {BUTTON_TOKENS.map(t => {
            const primToken = l2[t.name];
            const hex = primToken ? (l1Colors[primToken] || '') : '';
            return (
              <div key={t.name} className="tok-semantic-row">
                <div className="tok-semantic-swatch" style={{ background: hex || `var(${t.name})` }} />
                <span className="tok-semantic-name">{t.name}</span>
                <span className="tok-semantic-prim">{primToken || ''}</span>
                <span className="tok-semantic-value">{hex}</span>
              </div>
            );
          })}
        </div>
        <div className="tok-btn-grid">
          <button
            className="pp-btn pp-btn--primary"
            style={{ fontSize: 13 }}
            onClick={e => e.preventDefault()}
          >
            Primary Button
          </button>
          <button
            className="pp-btn pp-btn--secondary"
            style={{ fontSize: 13 }}
            onClick={e => e.preventDefault()}
          >
            Secondary Button
          </button>
          <button className="ls-login-btn">
            Login Style
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── Main page ───────────────────────────────────────────────── */

export default function TokensPage({ onNavigate }) {
  return (
    <div className="tok-page">
      <SiteHeader onLogoClick={() => onNavigate?.('learn-hub')} onNavigate={onNavigate} />

      <ColorPalettesSection />
      <SemanticColorsSection />
      <SurfacesSection />
      <TextStylesSection />
      <SpacingSection />
      <RadiusSection />
      <ShadowsSection />
      <StatusColorsSection />
      <ComButtonsSection />
      <LegacyButtonsSection />
      <SiteFooter />
    </div>
  );
}
