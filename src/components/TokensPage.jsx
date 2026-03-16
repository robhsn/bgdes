import React, { useState, useEffect } from 'react';
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
    <div className="section">
      <div className="section__inner">
        <h2 className="section__title">Color Palettes</h2>
        <p className="section__desc">L1 primitive color tokens used by the active theme.</p>
        {ACTIVE_PALETTES.map(palette => (
          <div key={palette.name}>
            <div className="swatch-grid__label">{palette.name}</div>
            <div className="swatch-grid">
              {palette.tokens.map(token => (
                <div key={token} className="swatch-grid__item">
                  <div
                    className="swatch-grid__color"
                    style={{ background: l1Colors[token] || `var(${token})` }}
                  />
                  <div className="swatch-grid__hex">{l1Colors[token] || ''}</div>
                  <div className="swatch-grid__name">{token.replace('--prim-', '')}</div>
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
    <div className="section surface-muted">
      <div className="section__inner">
        <h2 className="section__title">Semantic Colors</h2>
        <p className="section__desc">L2 semantic tokens that map primitives to functional roles. These change per theme.</p>
        <div className="semantic-table">
          {SEMANTIC_COLORS.map(c => {
            const primToken = l2[c.name]; // e.g. "--prim-mint-500"
            const hex = primToken ? (l1Colors[primToken] || '') : '';
            return (
              <div key={c.name} className="semantic-table__row">
                <div className="semantic-table__swatch" style={{ background: hex || `var(${c.name})` }} />
                <span className="semantic-table__name">{c.name}</span>
                <span className="semantic-table__primitive">{primToken || ''}</span>
                <span className="semantic-table__value">{hex}</span>
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
    { cls: '',                 label: 'Default (:root)' },
    { cls: 'surface-muted',    label: '.surface-muted' },
    { cls: 'surface-inverse',  label: '.surface-inverse' },
    { cls: 'surface-accent',   label: '.surface-accent' },
    { cls: 'surface-tertiary', label: '.surface-tertiary' },
  ];

  return (
    <div className="section">
      <div className="section__inner">
        <h2 className="section__title">Surface Classes</h2>
        <p className="section__desc">Each surface re-maps semantic tokens to create a distinct color contract for its descendants.</p>
        <div className="surface-demo">
          {surfaces.map(s => (
            <div key={s.cls || '_default'} className={`surface-demo__card ${s.cls}`}>
              <div className="surface-demo__heading">{s.label}</div>
              <div className="surface-demo__body">Body text on this surface uses the remapped --color-body token.</div>
              <div className="surface-demo__muted">Muted text</div>
              <span className="surface-demo__link">Link text</span>
              <div className="surface-demo__border" />
              <div className="surface-demo__buttons">
                <button className="com-btn com-btn--dark com-btn--sm">Dark</button>
                <button className="com-btn com-btn--ghost com-btn--sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--com-btn-ghost-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  Ghost
                </button>
                <button className="com-btn com-btn--primary com-btn--sm">Primary</button>
                <button className="com-btn com-btn--outline com-btn--sm">Outline</button>
              </div>
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
    <div className="section surface-muted">
      <div className="section__inner">
        <h2 className="section__title">Text Styles</h2>
        <p className="section__desc">Type roles with live previews and resolved property values.</p>
        <div className="type-specimen">
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
              <div key={t.role} className="type-specimen__card">
                <div className="type-specimen__label">{t.role}</div>
                <div className="type-specimen__preview" style={style}>
                  {t.preview}
                </div>
                <div className="type-specimen__pills">
                  {t.family && <span className="type-specimen__pill">{resolved[t.family] || t.family}</span>}
                  {t.weight && <span className="type-specimen__pill">{resolved[t.weight] || ''}</span>}
                  {t.size && <span className="type-specimen__pill">{(resolved[t.size] || '') + 'px'}</span>}
                  {t.sizeFixed && <span className="type-specimen__pill">{t.sizeFixed}</span>}
                  {t.ls && <span className="type-specimen__pill">ls: {resolved[t.ls] || ''}</span>}
                  {t.lh && <span className="type-specimen__pill">lh: {resolved[t.lh] || ''}</span>}
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
    <div className="section">
      <div className="section__inner">
        <h2 className="section__title">Spacing Scale</h2>
        <p className="section__desc">Consistent spacing values used across the system.</p>
        <div className="spacing-demo">
          {SPACING_TOKENS.map(s => (
            <div key={s.name} className="spacing-demo__row">
              <span className="spacing-demo__label">{s.name}</span>
              <div className="spacing-demo__bar" style={{ width: `var(${s.name})` }} />
              <span className="spacing-demo__value">{s.px}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RadiusSection() {
  return (
    <div className="section surface-muted">
      <div className="section__inner">
        <h2 className="section__title">Border Radius</h2>
        <p className="section__desc">Radius scale for consistent corner rounding.</p>
        <div className="radius-demo">
          {RADIUS_TOKENS.map(r => (
            <div key={r.name} className="radius-demo__item">
              <div className="radius-demo__box" style={{ borderRadius: `var(${r.name})` }} />
              <div className="radius-demo__label">{r.name.replace('--radius-', '')}</div>
              <div className="radius-demo__value">{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShadowsSection() {
  return (
    <div className="section">
      <div className="section__inner">
        <h2 className="section__title">Shadows</h2>
        <p className="section__desc">Elevation levels for depth and hierarchy.</p>
        <div className="shadow-demo">
          {SHADOW_TOKENS.map(s => (
            <div key={s.name} className="shadow-demo__card" style={{ boxShadow: `var(${s.name})` }}>
              <span className="shadow-demo__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusColorsSection() {
  return (
    <div className="section surface-muted">
      <div className="section__inner">
        <h2 className="section__title">Status Colors</h2>
        <p className="section__desc">Feedback and status indicators.</p>
        <div className="status-demo">
          {STATUS_TOKENS.map(s => (
            <div key={s.name} className="status-demo__item">
              <div className="status-demo__dot" style={{ background: `var(${s.name})` }} />
              <div>
                <div className="status-demo__label">{s.label}</div>
                <div className="status-demo__var">{s.name}</div>
              </div>
            </div>
          ))}
          <div className="status-demo__item">
            <div className="status-demo__dot" style={{ background: 'var(--color-match-win-chip-bg)', border: '1px solid var(--color-match-win-chip-fg)' }} />
            <div>
              <div className="status-demo__label" style={{ color: 'var(--color-match-win-chip-fg)' }}>Win Chip</div>
              <div className="status-demo__var">--color-match-win-chip-*</div>
            </div>
          </div>
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
    <div className="section">
      <div className="section__inner">
        <h2 className="section__title">Buttons (Legacy)</h2>
        <p className="section__desc">Primary and secondary button variants using legacy button tokens. Preserved for future design updates.</p>
        <div className="semantic-table" style={{ marginBottom: 24 }}>
          {BUTTON_TOKENS.map(t => {
            const primToken = l2[t.name];
            const hex = primToken ? (l1Colors[primToken] || '') : '';
            return (
              <div key={t.name} className="semantic-table__row">
                <div className="semantic-table__swatch" style={{ background: hex || `var(${t.name})` }} />
                <span className="semantic-table__name">{t.name}</span>
                <span className="semantic-table__primitive">{primToken || ''}</span>
                <span className="semantic-table__value">{hex}</span>
              </div>
            );
          })}
        </div>
        <div className="btn-showcase__grid">
          <button
            className="idp-btn idp-btn--primary"
            style={{ fontSize: 13 }}
            onClick={e => e.preventDefault()}
          >
            Primary Button
          </button>
          <button
            className="idp-btn idp-btn--secondary"
            style={{ fontSize: 13 }}
            onClick={e => e.preventDefault()}
          >
            Secondary Button
          </button>
          <button className="idp-btn--login">
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
    <div className="token-showcase">
      <SiteHeader onLogoClick={() => onNavigate?.('index')} onNavigate={onNavigate} />

      <ColorPalettesSection />
      <SemanticColorsSection />
      <SurfacesSection />
      <TextStylesSection />
      <SpacingSection />
      <RadiusSection />
      <ShadowsSection />
      <StatusColorsSection />
      <LegacyButtonsSection />
      <SiteFooter />
    </div>
  );
}
