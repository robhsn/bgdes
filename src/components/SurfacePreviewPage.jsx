import React from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import { useDMEState } from '../context/dme-states';

/* ── Font token shorthands (L2 role tokens) ──────────────────── */
const fh   = 'var(--font-heading)';       // h1 role
const fsh  = 'var(--font-subheading)';    // h2 role
const fsc  = 'var(--font-section)';       // h3 role
const flb  = 'var(--font-label)';         // h4 role
const fsh1 = 'var(--font-sh1)';           // sh1 role
const fsh2 = 'var(--font-sh2)';           // sh2 role
const fsh3 = 'var(--font-sh3)';           // sh3 role
const fsh4 = 'var(--font-sh4)';           // sh4 role
const fld  = 'var(--font-lead)';          // body-lg role
const fb   = 'var(--font-body)';          // body-md role
const fsm  = 'var(--font-small)';         // body-sm role
const fm   = 'var(--font-meta)';          // body-sm role (alt)
const fp   = 'var(--font-pill)';          // pill base
const fplg = 'var(--font-pill-lg)';       // pill-lg role
const fpmd = 'var(--font-pill-md)';       // pill-md role
const fpsm = 'var(--font-pill-sm)';       // pill-sm role

/* ── Surface mapping ──────────────────────────────────────────── */
const SURFACE_MAP = {
  'Primary':   '',
  'Secondary': 'surface-muted',
  'Inverse':   'surface-inverse',
  'Accent':    'surface-accent',
  'Tertiary':  'surface-tertiary',
};

/* ── Reusable section wrapper ─────────────────────────────────── */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{
        fontFamily: fsc, fontWeight: 700, fontSize: 'var(--size-h3)',
        color: 'var(--color-heading)', marginBottom: 20,
      }}>{title}</h3>
      {children}
    </div>
  );
}

/* ── Token label ──────────────────────────────────────────────── */
function TokenLabel({ name }) {
  return (
    <span style={{
      fontFamily: fm, fontSize: 11, color: 'var(--color-muted)',
      opacity: 0.7, display: 'block', marginTop: 4,
    }}>{name}</span>
  );
}

/* ── 1. Text Hierarchy ────────────────────────────────────────── */
function TextHierarchy() {
  const items = [
    { label: 'Heading', var: '--color-heading', size: '--size-h2', font: fh,  weight: 700 },
    { label: 'H1',      var: '--color-h1',      size: '--size-h1', font: fh,  weight: 700 },
    { label: 'H2',      var: '--color-h2',      size: '--size-h2', font: fsh, weight: 700 },
    { label: 'H3',      var: '--color-h3',      size: '--size-h3', font: fsc, weight: 700 },
    { label: 'H4',      var: '--color-h4',      size: '--size-h4', font: flb, weight: 700 },
    { label: 'SH1',     var: '--color-sh1',     size: '--size-sh1', font: fsh1, weight: 600 },
    { label: 'SH2',     var: '--color-sh2',     size: '--size-sh2', font: fsh2, weight: 600 },
    { label: 'SH3',     var: '--color-sh3',     size: '--size-sh3', font: fsh3, weight: 600 },
    { label: 'SH4',     var: '--color-sh4',     size: '--size-sh4', font: fsh4, weight: 600 },
    { label: 'Body LG', var: '--color-body-lg', size: '--size-body-lg', font: fld, weight: 400 },
    { label: 'Body MD', var: '--color-body',    size: '--size-body',    font: fb,  weight: 400 },
    { label: 'Body SM', var: '--color-body-sm', size: '--size-body-sm', font: fsm, weight: 400 },
    { label: 'Muted LG', var: '--color-muted-lg', size: '--size-body-lg', font: fld, weight: 400 },
    { label: 'Muted',    var: '--color-muted',    size: '--size-body',    font: fb,  weight: 400 },
    { label: 'Muted SM', var: '--color-muted-sm', size: '--size-body-sm', font: fsm, weight: 400 },
    { label: 'Link LG', var: '--color-link-lg', size: '--size-body-lg', font: fld, weight: 500 },
    { label: 'Link',    var: '--color-link',    size: '--size-body',    font: fb,  weight: 500 },
    { label: 'Link SM', var: '--color-link-sm', size: '--size-body-sm', font: fsm, weight: 500 },
    { label: 'Accent',  var: '--color-accent',  size: '--size-body',    font: fb,  weight: 600 },
  ];

  return (
    <Section title="Text Hierarchy">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(({ label, var: v, size, font, weight }) => (
          <div key={label}>
            <span style={{
              fontFamily: font, fontWeight: weight,
              fontSize: `var(${size})`,
              color: `var(${v})`,
              lineHeight: 1.3,
            }}>
              {label} — The quick brown fox
            </span>
            <TokenLabel name={v} />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 2. Borders ───────────────────────────────────────────────── */
function Borders() {
  const borders = [
    { label: 'Border', var: '--color-border' },
    { label: 'Border Light', var: '--color-border-light' },
    { label: 'Border Mid', var: '--color-border-mid' },
    { label: 'Border Subtle', var: '--color-border-subtle' },
    { label: 'Callout Border', var: '--color-callout-border' },
  ];

  return (
    <Section title="Borders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {borders.map(({ label, var: v }) => (
          <div key={label}>
            <div style={{
              fontFamily: fm, fontSize: 'var(--size-meta)',
              color: 'var(--color-body)', marginBottom: 6,
            }}>{label}</div>
            <div style={{
              height: 3, borderRadius: 2,
              background: `var(${v})`,
            }} />
            <TokenLabel name={v} />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 3. Pills & Tags ─────────────────────────────────────────── */
function PillsTags() {
  const pills = [
    { label: 'Pill',    var: '--color-pill',    size: '--size-body',    font: fp   },
    { label: 'Pill LG', var: '--color-pill-lg', size: '--size-pill-lg', font: fplg },
    { label: 'Pill MD', var: '--color-pill-md', size: '--size-pill-md', font: fpmd },
    { label: 'Pill SM', var: '--color-pill-sm', size: '--size-pill-sm', font: fpsm },
  ];

  return (
    <Section title="Pills & Tags">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        {pills.map(({ label, var: v, size, font }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              fontFamily: font, fontWeight: 700,
              fontSize: `var(${size})`,
              color: `var(${v})`,
              background: 'var(--color-pill-bg)',
              border: '1.5px solid var(--color-pill-border)',
              borderRadius: 9999,
              padding: '5px 14px',
              lineHeight: 1.2,
            }}>{label}</span>
            <TokenLabel name={v} />
          </div>
        ))}

        {/* Pill bg swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-pill-bg)',
            border: '1px solid var(--color-border-subtle)',
          }} />
          <TokenLabel name="--color-pill-bg" />
        </div>

        {/* Pill border swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-pill-border)',
          }} />
          <TokenLabel name="--color-pill-border" />
        </div>

        {/* Tag Fill swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-tag-fill)',
          }} />
          <TokenLabel name="--color-tag-fill" />
        </div>

        {/* Star swatch */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 32, color: 'var(--color-star)' }}>&#9733;</span>
          <TokenLabel name="--color-star" />
        </div>
      </div>
    </Section>
  );
}

/* ── 4. Buttons ───────────────────────────────────────────────── */
function Buttons() {
  const variants = [
    { label: 'Primary', cls: 'com-btn--primary' },
    { label: 'Dark', cls: 'com-btn--dark' },
    { label: 'Ghost', cls: 'com-btn--ghost' },
    { label: 'Outline', cls: 'com-btn--outline' },
    { label: 'Tertiary', cls: 'com-btn--tertiary' },
    { label: 'Quaternary', cls: 'com-btn--quaternary' },
    { label: 'Destructive', cls: 'com-btn--destructive' },
    { label: 'Destructive UI', cls: 'com-btn--destructive-ui' },
  ];

  const sizes = [
    { label: 'Large',   cls: 'com-btn--lg' },
    { label: 'Medium',  cls: '' },
    { label: 'Small',   cls: 'com-btn--sm' },
    { label: 'XS',      cls: 'com-btn--xsm' },
  ];

  return (
    <Section title="Buttons">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sizes.map(({ label: sizeLabel, cls: sizeCls }) => (
          <div key={sizeLabel}>
            <div style={{
              fontFamily: fm, fontSize: 'var(--size-meta)',
              color: 'var(--color-muted)', marginBottom: 10,
            }}>{sizeLabel}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {variants.map(({ label, cls }) => (
                <button key={label} className={`com-btn ${cls} ${sizeCls}`.trim()}>{label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 5. UI Text ───────────────────────────────────────────────── */
function UIText() {
  const items = [
    { label: 'UI XL',  var: '--color-ui-xl',  size: '--size-ui-xl',  font: 'var(--font-ui-xl)'  },
    { label: 'UI LG',  var: '--color-ui-lg',  size: '--size-ui-lg',  font: 'var(--font-ui-lg)'  },
    { label: 'UI MD',  var: '--color-ui-md',  size: '--size-ui-md',  font: 'var(--font-ui-md)'  },
    { label: 'UI SM',  var: '--color-ui-sm',  size: '--size-ui-sm',  font: 'var(--font-ui-sm)'  },
    { label: 'UI XSM', var: '--color-ui-xsm', size: '--size-ui-xsm', font: 'var(--font-ui-xsm)' },
  ];

  return (
    <Section title="UI Text">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(({ label, var: v, size, font }) => (
          <div key={label}>
            <span style={{
              fontFamily: font, fontWeight: 600,
              fontSize: `var(${size})`,
              color: `var(${v})`,
              lineHeight: 1.3,
            }}>
              {label} — Interface label
            </span>
            <TokenLabel name={v} />
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── 6. Misc ──────────────────────────────────────────────────── */
function Misc() {
  return (
    <Section title="Miscellaneous">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        {/* Placeholder mock input */}
        <div>
          <div style={{
            padding: '10px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontFamily: fb, fontSize: 'var(--size-body)',
            color: 'var(--color-placeholder)',
            background: 'transparent',
            minWidth: 200,
          }}>Placeholder text...</div>
          <TokenLabel name="--color-placeholder" />
        </div>

        {/* Logo swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-logo)',
          }} />
          <TokenLabel name="--color-logo" />
        </div>

        {/* Scrollbar thumb swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-scrollbar-thumb)',
          }} />
          <TokenLabel name="--color-scrollbar-thumb" />
        </div>

        {/* Scrollbar track swatch */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 8,
            background: 'var(--color-scrollbar-track)',
            border: '1px solid var(--color-border-subtle)',
          }} />
          <TokenLabel name="--color-scrollbar-track" />
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  Surface Preview Page                                         */
/* ═══════════════════════════════════════════════════════════════ */

export default function SurfacePreviewPage({ onNavigate }) {
  const surfaceValue = useDMEState('surfacePreview.surface', 'Secondary');
  const surfaceClass = SURFACE_MAP[surfaceValue] ?? 'surface-muted';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <SiteHeader onNavigate={onNavigate} />

      <div
        className={surfaceClass || undefined}
        data-section-id="sp-content"
        style={{ flex: 1, padding: '40px var(--spacing-h)' }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>

          {/* Surface label */}
          <div style={{
            fontFamily: fm, fontSize: 'var(--size-meta)',
            color: 'var(--color-muted)',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}>
            Previewing
          </div>
          <h1 style={{
            fontFamily: fh, fontWeight: 700,
            fontSize: 'var(--size-h1)',
            color: 'var(--color-heading)',
            marginBottom: 8,
          }}>
            {surfaceValue}
          </h1>
          <p style={{
            fontFamily: fld, fontSize: 'var(--size-body-lg)',
            color: 'var(--color-body)',
            marginBottom: 48,
            lineHeight: 1.6,
          }}>
            Full-page preview of every L2 token group rendered on this surface.
            Switch surfaces via the DME dropdown.
          </p>

          <TextHierarchy />
          <Borders />
          <PillsTags />
          <Buttons />
          <UIText />
          <Misc />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
