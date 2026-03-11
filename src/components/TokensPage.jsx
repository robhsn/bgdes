import React, { useState, useEffect } from 'react';
import './LearnSegmentTemplate.css';
import './TokensPage.css';
import { SiteHeader, SiteFooter } from './SharedLayout';
/* ── Helpers ─────────────────────────────────────────────────── */

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveColor(varName) {
  const el = document.createElement('div');
  el.style.color = `var(${varName})`;
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).color;
  document.body.removeChild(el);
  return resolved;
}

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '';
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  return '#' + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}

/* ── Palette definitions ─────────────────────────────────────── */

const PALETTES = [
  {
    name: 'Mono',
    tokens: [
      'prim-mono-white', 'prim-mono-50', 'prim-mono-100', 'prim-mono-150',
      'prim-mono-200', 'prim-mono-250', 'prim-mono-300', 'prim-mono-350',
      'prim-mono-500', 'prim-mono-550', 'prim-mono-600', 'prim-mono-700',
      'prim-mono-750', 'prim-mono-900', 'prim-mono-black',
    ],
  },
  {
    name: 'Sapphire',
    tokens: [
      'prim-sapphire-950', 'prim-sapphire-900', 'prim-sapphire-800', 'prim-sapphire-700',
      'prim-sapphire-600', 'prim-sapphire-500', 'prim-sapphire-400', 'prim-sapphire-300',
      'prim-sapphire-200', 'prim-sapphire-100', 'prim-sapphire-50',
    ],
  },
  {
    name: 'Splash',
    tokens: [
      'prim-splash-950', 'prim-splash-900', 'prim-splash-800', 'prim-splash-700',
      'prim-splash-600', 'prim-splash-500', 'prim-splash-400', 'prim-splash-300',
      'prim-splash-200', 'prim-splash-100', 'prim-splash-50',
    ],
  },
  {
    name: 'Orange',
    tokens: [
      'prim-orange-950', 'prim-orange-900', 'prim-orange-800', 'prim-orange-700',
      'prim-orange-600', 'prim-orange-500', 'prim-orange-400', 'prim-orange-300',
      'prim-orange-200', 'prim-orange-100', 'prim-orange-50',
    ],
  },
  {
    name: 'Butter',
    tokens: [
      'prim-butter-950', 'prim-butter-900', 'prim-butter-800', 'prim-butter-700',
      'prim-butter-600', 'prim-butter-500', 'prim-butter-400',
    ],
  },
];

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

const TYPOGRAPHY = [
  { role: 'Heading',    family: '--font-heading',    size: '--size-h1',   preview: 'Backgammon' },
  { role: 'Subheading', family: '--font-subheading',  size: '--size-h2',   preview: 'Board Setup' },
  { role: 'Body',       family: '--font-body',        size: '--size-body', preview: 'The quick brown fox jumps over the lazy dog.' },
  { role: 'Meta',       family: '--font-meta',        size: '--size-meta', preview: 'Mar 7, 2026 · 5 min read' },
  { role: 'Pill',       family: '--font-pill',        size: '--size-pill', preview: 'BEGINNER' },
  { role: 'Logo',       family: '--font-logo',        size: '--size-logo', preview: 'Backgammon.com' },
];

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
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    const map = {};
    PALETTES.forEach(p => {
      p.tokens.forEach(t => {
        const varName = `--${t}`;
        const rgb = resolveColor(varName);
        map[t] = rgbToHex(rgb);
      });
    });
    setResolved(map);
  }, []);

  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Color Palettes</h2>
        <p className="tok-section-desc">L1 primitive color tokens. Theme-agnostic foundation values.</p>
        {PALETTES.map(palette => (
          <div key={palette.name}>
            <div className="tok-palette-label">{palette.name}</div>
            <div className="tok-swatch-grid">
              {palette.tokens.map(token => (
                <div key={token} className="tok-swatch">
                  <div
                    className="tok-swatch-color"
                    style={{ background: `var(--${token})` }}
                  />
                  <div className="tok-swatch-hex">{resolved[token] || ''}</div>
                  <div className="tok-swatch-name">{token.replace('prim-', '')}</div>
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
  const [resolved, setResolved] = useState({});

  useEffect(() => {
    const map = {};
    SEMANTIC_COLORS.forEach(c => {
      const rgb = resolveColor(c.name);
      map[c.name] = rgbToHex(rgb);
    });
    setResolved(map);
  }, []);

  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Semantic Colors</h2>
        <p className="tok-section-desc">L2 semantic tokens that map primitives to functional roles. These change per theme.</p>
        <div className="tok-semantic-grid">
          {SEMANTIC_COLORS.map(c => (
            <div key={c.name} className="tok-semantic-row">
              <div className="tok-semantic-swatch" style={{ background: `var(${c.name})` }} />
              <span className="tok-semantic-name">{c.name}</span>
              <span className="tok-semantic-value">{resolved[c.name] || ''}</span>
            </div>
          ))}
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
              <button className="tok-surface-btn">Button</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypographySection() {
  return (
    <div className="tok-section surface-muted">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Typography</h2>
        <p className="tok-section-desc">Font roles with their default families and sizes.</p>
        <div className="tok-type-grid">
          {TYPOGRAPHY.map(t => (
            <div key={t.role} className="tok-type-sample">
              <span className="tok-type-label">{t.role}</span>
              <span
                className="tok-type-preview"
                style={{ fontFamily: `var(${t.family})`, fontSize: `var(${t.size})`, fontWeight: t.role === 'Body' ? 400 : 700 }}
              >
                {t.preview}
              </span>
              <span className="tok-type-meta">{t.size}</span>
            </div>
          ))}
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

function ButtonsSection() {
  return (
    <div className="tok-section">
      <div className="tok-section-inner">
        <h2 className="tok-section-title">Buttons</h2>
        <p className="tok-section-desc">Primary and secondary button variants using button tokens.</p>
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
      <TypographySection />
      <SpacingSection />
      <RadiusSection />
      <ShadowsSection />
      <StatusColorsSection />
      <ButtonsSection />
      <SiteFooter />
    </div>
  );
}
