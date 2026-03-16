import React, { useState, useEffect, useCallback, useRef } from 'react';
import fileDefaults from '../tokens/dme-defaults.json';

/* ─── Shortcut sequences ─────────────────────────────────────── */
const TOKENS_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown'];

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
export const L1_COLOR_MAP = {
  '--prim-mono-white': '#ffffff', '--prim-mono-50':  '#efefef',
  '--prim-mono-100':   '#dddddd', '--prim-mono-150': '#e0e0e0',
  '--prim-mono-200':   '#d9d9d9', '--prim-mono-250': '#cccccc',
  '--prim-mono-300':   '#bbbbbb', '--prim-mono-350': '#aaaaaa',
  '--prim-mono-500':   '#7b7b7b', '--prim-mono-550': '#777777',
  '--prim-mono-600':   '#585858', '--prim-mono-700': '#444444',
  '--prim-mono-750':   '#2e2e2e', '--prim-mono-900': '#111111',
  '--prim-mono-black': '#000000',
  '--prim-sapphire-950': '#000b1a', '--prim-sapphire-900': '#001635',
  '--prim-sapphire-800': '#001d46', '--prim-sapphire-700': '#002458',
  '--prim-sapphire-600': '#062d66', '--prim-sapphire-500': '#0c3775',
  '--prim-sapphire-400': '#104188', '--prim-sapphire-300': '#134b9b',
  '--prim-sapphire-200': '#2158a7', '--prim-sapphire-100': '#2f65b3',
  '--prim-sapphire-50':  '#97b2d9',
  '--prim-splash-950': '#0082a7', '--prim-splash-900': '#0094b9',
  '--prim-splash-800': '#13a5ca', '--prim-splash-700': '#26b7dc',
  '--prim-splash-600': '#3fcaed', '--prim-splash-500': '#58ddff',
  '--prim-splash-400': '#70e2ff', '--prim-splash-300': '#88e7ff',
  '--prim-splash-200': '#9eebff', '--prim-splash-100': '#b4f0ff',
  '--prim-splash-50':  '#ebfbff',
  '--prim-orange-950': '#511702', '--prim-orange-900': '#a22e05',
  '--prim-orange-800': '#b6380c', '--prim-orange-700': '#ca4313',
  '--prim-orange-600': '#dd4e1c', '--prim-orange-500': '#f05a25',
  '--prim-orange-400': '#f7794c', '--prim-orange-300': '#ff9874',
  '--prim-orange-200': '#ffaa8d', '--prim-orange-100': '#ffbda6',
  '--prim-orange-50':  '#ffded2',
  '--prim-butter-950': '#edb668', '--prim-butter-900': '#f0d18a',
  '--prim-butter-800': '#f1de9b', '--prim-butter-700': '#f3ecac',
  '--prim-butter-600': '#f8f4ca', '--prim-butter-500': '#fefce9',
  '--prim-butter-400': '#fefdf4',
  '--prim-mint-900':   '#051f18', '--prim-mint-800':   '#072e23',
  '--prim-mint-700':   '#0d3529', '--prim-mint-600':   '#11533f',
  '--prim-mint-500':   '#196951', '--prim-mint-400':   '#23a57e',
  '--prim-mint-300':   '#8cb2a7', '--prim-mint-200':   '#bce4d9',
  '--prim-mint-100':   '#e9f4f3',
  '--prim-fall-900':   '#2d4941', '--prim-fall-700':   '#415f56',
  '--prim-fall-500':   '#507268', '--prim-fall-300':   '#6e9b8e',
  '--prim-fall-100':   '#8fcbba',
};

/* Palette groups for the picker UI */
const L1_COLOR_PALETTES = [
  { name: 'Mono',     tokens: ['--prim-mono-white','--prim-mono-50','--prim-mono-100','--prim-mono-150','--prim-mono-200','--prim-mono-250','--prim-mono-300','--prim-mono-350','--prim-mono-500','--prim-mono-550','--prim-mono-600','--prim-mono-700','--prim-mono-750','--prim-mono-900','--prim-mono-black'] },
  { name: 'Sapphire', tokens: ['--prim-sapphire-50','--prim-sapphire-100','--prim-sapphire-200','--prim-sapphire-300','--prim-sapphire-400','--prim-sapphire-500','--prim-sapphire-600','--prim-sapphire-700','--prim-sapphire-800','--prim-sapphire-900','--prim-sapphire-950'] },
  { name: 'Splash',   tokens: ['--prim-splash-50','--prim-splash-100','--prim-splash-200','--prim-splash-300','--prim-splash-400','--prim-splash-500','--prim-splash-600','--prim-splash-700','--prim-splash-800','--prim-splash-900','--prim-splash-950'] },
  { name: 'Orange',   tokens: ['--prim-orange-50','--prim-orange-100','--prim-orange-200','--prim-orange-300','--prim-orange-400','--prim-orange-500','--prim-orange-600','--prim-orange-700','--prim-orange-800','--prim-orange-900','--prim-orange-950'] },
  { name: 'Butter',   tokens: ['--prim-butter-400','--prim-butter-500','--prim-butter-600','--prim-butter-700','--prim-butter-800','--prim-butter-900','--prim-butter-950'] },
  { name: 'Mint',     tokens: ['--prim-mint-100','--prim-mint-200','--prim-mint-300','--prim-mint-400','--prim-mint-500','--prim-mint-600','--prim-mint-700','--prim-mint-800','--prim-mint-900'] },
  { name: 'Fall Green', tokens: ['--prim-fall-100','--prim-fall-300','--prim-fall-500','--prim-fall-700','--prim-fall-900'] },
];

/* Default-surface uses different names for some semantic tokens */
const DEFAULT_SURFACE_TOKEN_MAP = {
  'bg':            '--color-bg',
  'heading':       '--color-heading',
  'body':          '--color-body',
  'text-muted':    '--color-muted',
  'border':        '--color-border',
  'border-light':  '--color-border-light',
  'border-mid':    '--color-border-mid',
  'border-subtle': '--color-border-subtle',
  'callout-border':'--color-callout-border',
  'placeholder':   '--color-placeholder',
  'logo':          '--color-logo',
  'link':          '--color-link',
  'pill':              '--color-pill',
  'accent':            '--color-accent',
  'btn-primary-bg':    '--com-btn-primary-bg',
  'btn-primary-fg':    '--com-btn-primary-fg',
  'btn-dark-bg':       '--com-btn-dark-bg',
  'btn-dark-fg':       '--com-btn-dark-fg',
  'btn-ghost-fg':      '--com-btn-ghost-fg',
  'btn-ghost-icon':    '--com-btn-ghost-icon',
  'btn-outline-fg':    '--com-btn-outline-fg',
  'btn-outline-border':'--com-btn-outline-border',
};

/* ─── Pathway button defaults — light & dark surface variants ── */
const BTN_LIGHT = {
  'btn-primary-bg': '--prim-mint-400',  'btn-primary-fg': '--prim-mono-white',
  'btn-dark-bg':    '--prim-mono-900',  'btn-dark-fg':    '--prim-mono-white',
  'btn-ghost-fg':   '--prim-mono-900',  'btn-ghost-icon': '--prim-mint-400',
  'btn-outline-fg': '--prim-mono-900',  'btn-outline-border': '--prim-mono-300',
};
const BTN_DARK = {
  'btn-primary-bg': '--prim-fall-100',  'btn-primary-fg': '--prim-mono-white',
  'btn-dark-bg':    '--prim-mono-600',  'btn-dark-fg':    '--prim-mono-white',
  'btn-ghost-fg':   '--prim-mono-300',  'btn-ghost-icon': '--prim-mono-350',
  'btn-outline-fg': '--prim-mono-350',  'btn-outline-border': '--prim-mono-500',
};
function btnSurfaceTokens(prefix, suffixMap) {
  const out = {};
  for (const [suffix, val] of Object.entries(suffixMap)) {
    out[`${prefix}${suffix}`] = val;
  }
  return out;
}
function btnDefaultTokens(map) {
  const out = {};
  for (const [suffix, val] of Object.entries(map)) {
    out[DEFAULT_SURFACE_TOKEN_MAP[suffix]] = val;
  }
  return out;
}

/* ─── Themes — L2 colors reference L1 token names ────────────── */
const THEMES = {
  mono: {
    label: 'Mono',
    globals: {
      '--color-toc-pip':        '--prim-mono-300',
      '--color-toc-pip-active': '--prim-mono-550',
      '--color-toc-heading':    '--prim-mono-550',
      '--color-toc-text':       '--prim-mono-750',
      '--color-toc-text-active':'--prim-mono-550',
      '--color-dot-active':     '--prim-orange-500',
      '--color-badge-from':     '--prim-mono-700',
      '--color-badge-to':       '--prim-mono-900',
      '--color-badge-icon':     '--prim-mono-750',
      '--color-badge-icon-inner': '--prim-mono-100',
      '--color-badge-unearned-stroke': '--prim-mono-500',
      '--color-badge-unearned-text':   '--prim-mono-500',
      '--color-avatar-bg':        '--prim-mono-200',
      '--color-stat-percentile':  '--prim-orange-500',
      '--color-statement-bg':     '--prim-mono-100',
      '--color-statement-border': '--prim-mono-350',
      '--color-statement-text':   '--prim-mono-700',
      '--color-dropdown-bg':         '--prim-mono-white',
      '--color-dropdown-border':     '--prim-mono-350',
      '--color-dropdown-text':       '--prim-mono-900',
      '--color-dropdown-icon':       '--prim-mono-500',
      '--color-dropdown-soon-bg':    '--prim-mono-200',
      '--color-dropdown-soon-fg':    '--prim-mono-600',
      '--color-dropdown-separator':  '--prim-mono-100',
      '--color-nav-bg':           '--prim-mono-100',
      '--color-nav-border':       '--prim-mono-250',
      '--color-nav-icon':         '--prim-mono-900',
      '--btn-primary-bg':         '--prim-mono-250',
      '--btn-primary-fg':         '--prim-mono-900',
      '--btn-secondary-bg':       '--prim-mono-white',
      '--btn-secondary-fg':       '--prim-mono-900',
      '--btn-primary-border':     '--prim-mono-900',
      '--btn-secondary-border':   '--prim-mono-900',
      '--color-match-win-border':   '--prim-orange-500',
      '--color-match-loss-border':  '--prim-mono-250',
      '--color-match-win-chip-bg':  '--prim-mint-100',
      '--color-match-win-chip-fg':  '--prim-mint-500',
    },
    surfaces: {
      default: {
        '--color-bg':             '--prim-mono-white',
        '--color-heading':        '--prim-mono-900',
        '--color-body':           '--prim-mono-600',
        '--color-muted':          '--prim-mono-750',
        '--color-border':         '--prim-mono-100',
        '--color-border-light':   '--prim-mono-150',
        '--color-border-mid':     '--prim-mono-250',
        '--color-border-subtle':  '--prim-mono-350',
        '--color-callout-border': '--prim-mono-500',
        '--color-placeholder':    '--prim-mono-200',
        '--color-logo':           '--prim-mono-900',
        '--color-link':           '--prim-mono-700',
        '--color-pill':           '--prim-mono-900',
        '--color-accent':         '--prim-mono-700',
      ...btnDefaultTokens(BTN_LIGHT),
      },
      muted: {
        '--sf-muted-bg':             '--prim-mono-50',
        '--sf-muted-heading':        '--prim-mono-900',
        '--sf-muted-body':           '--prim-mono-600',
        '--sf-muted-text-muted':     '--prim-mono-750',
        '--sf-muted-border':         '--prim-mono-100',
        '--sf-muted-border-light':   '--prim-mono-150',
        '--sf-muted-border-mid':     '--prim-mono-250',
        '--sf-muted-border-subtle':  '--prim-mono-350',
        '--sf-muted-callout-border': '--prim-mono-500',
        '--sf-muted-placeholder':    '--prim-mono-200',
        '--sf-muted-logo':           '--prim-mono-900',
        '--sf-muted-link':           '--prim-mono-700',
        '--sf-muted-pill':           '--prim-mono-900',
        '--sf-muted-accent':         '--prim-mono-700',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-mono-900',
        '--sf-inverse-heading':        '--prim-mono-white',
        '--sf-inverse-body':           '--prim-mono-200',
        '--sf-inverse-text-muted':     '--prim-mono-350',
        '--sf-inverse-border':         '--prim-mono-700',
        '--sf-inverse-border-light':   '--prim-mono-750',
        '--sf-inverse-border-mid':     '--prim-mono-550',
        '--sf-inverse-border-subtle':  '--prim-mono-500',
        '--sf-inverse-callout-border': '--prim-mono-350',
        '--sf-inverse-placeholder':    '--prim-mono-700',
        '--sf-inverse-logo':           '--prim-mono-white',
        '--sf-inverse-link':           '--prim-mono-300',
        '--sf-inverse-pill':           '--prim-mono-white',
        '--sf-inverse-accent':         '--prim-mono-500',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
      },
      accent: {
        '--sf-accent-bg':             '--prim-mono-700',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-mono-100',
        '--sf-accent-text-muted':     '--prim-mono-250',
        '--sf-accent-border':         '--prim-mono-550',
        '--sf-accent-border-light':   '--prim-mono-600',
        '--sf-accent-border-mid':     '--prim-mono-400',
        '--sf-accent-border-subtle':  '--prim-mono-350',
        '--sf-accent-callout-border': '--prim-mono-250',
        '--sf-accent-placeholder':    '--prim-mono-600',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-mono-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-accent':         '--prim-mono-900',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-mono-750',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-200',
        '--sf-tertiary-text-muted':     '--prim-mono-350',
        '--sf-tertiary-border':         '--prim-mono-600',
        '--sf-tertiary-border-light':   '--prim-mono-700',
        '--sf-tertiary-border-mid':     '--prim-mono-550',
        '--sf-tertiary-border-subtle':  '--prim-mono-500',
        '--sf-tertiary-callout-border': '--prim-mono-300',
        '--sf-tertiary-placeholder':    '--prim-mono-600',
        '--sf-tertiary-logo':           '--prim-mono-white',
        '--sf-tertiary-link':           '--prim-mono-200',
        '--sf-tertiary-pill':           '--prim-mono-white',
        '--sf-tertiary-accent':         '--prim-mono-500',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
      },
    },
  },
  'coral-tide': {
    label: 'Coral Tide',
    globals: {
      '--color-toc-pip':          '--prim-sapphire-50',
      '--color-toc-pip-active':   '--prim-orange-500',
      '--color-toc-heading':      '--prim-orange-500',
      '--color-toc-text':         '--prim-sapphire-500',
      '--color-toc-text-active':  '--prim-orange-500',
      '--color-dot-active':       '--prim-orange-500',
      '--color-badge-from':       '--prim-sapphire-500',
      '--color-badge-to':         '--prim-sapphire-50',
      '--color-badge-icon':       '--prim-sapphire-500',
      '--color-badge-icon-inner': '--prim-splash-400',
      '--color-badge-unearned-stroke': '--prim-sapphire-400',
      '--color-badge-unearned-text':   '--prim-sapphire-400',
      '--color-avatar-bg':        '--prim-sapphire-600',
      '--color-stat-percentile':  '--prim-orange-500',
      '--color-statement-bg':     '--prim-butter-700',
      '--color-statement-border': '--prim-orange-300',
      '--color-statement-text':   '--prim-sapphire-700',
      '--color-dropdown-bg':         '--prim-mono-white',
      '--color-dropdown-border':     '--prim-splash-300',
      '--color-dropdown-text':       '--prim-sapphire-500',
      '--color-dropdown-icon':       '--prim-sapphire-300',
      '--color-dropdown-soon-bg':    '--prim-butter-700',
      '--color-dropdown-soon-fg':    '--prim-sapphire-500',
      '--color-dropdown-separator':  '--prim-orange-50',
      '--color-nav-bg':           '--prim-butter-500',
      '--color-nav-border':       '--prim-butter-900',
      '--color-nav-icon':         '--prim-sapphire-500',
      '--btn-primary-bg':         '--prim-butter-900',
      '--btn-primary-fg':         '--prim-sapphire-500',
      '--btn-secondary-bg':       '--prim-mono-white',
      '--btn-secondary-fg':       '--prim-sapphire-500',
      '--btn-primary-border':     '--prim-sapphire-500',
      '--btn-secondary-border':   '--prim-sapphire-500',
      '--color-match-win-border':   '--prim-orange-500',
      '--color-match-loss-border':  '--prim-mono-250',
      '--color-match-win-chip-bg':  '--prim-mint-100',
      '--color-match-win-chip-fg':  '--prim-mint-500',
    },
    surfaces: {
      default: {
        '--color-bg':             '--prim-mono-white',
        '--color-heading':        '--prim-sapphire-500',
        '--color-body':           '--prim-sapphire-500',
        '--color-muted':          '--prim-sapphire-700',
        '--color-border':         '--prim-orange-50',
        '--color-border-light':   '--prim-butter-700',
        '--color-border-mid':     '--prim-butter-900',
        '--color-border-subtle':  '--prim-splash-300',
        '--color-callout-border': '--prim-splash-700',
        '--color-placeholder':    '--prim-splash-300',
        '--color-logo':           '--prim-sapphire-400',
        '--color-link':           '--prim-splash-700',
        '--color-pill':           '--prim-orange-500',
        '--color-accent':         '--prim-orange-300',
      ...btnDefaultTokens(BTN_LIGHT),
      },
      muted: {
        '--sf-muted-bg':             '--prim-splash-50',
        '--sf-muted-heading':        '--prim-sapphire-600',
        '--sf-muted-body':           '--prim-sapphire-700',
        '--sf-muted-text-muted':     '--prim-sapphire-500',
        '--sf-muted-border':         '--prim-butter-900',
        '--sf-muted-border-light':   '--prim-splash-200',
        '--sf-muted-border-mid':     '--prim-butter-900',
        '--sf-muted-border-subtle':  '--prim-orange-300',
        '--sf-muted-callout-border': '--prim-sapphire-300',
        '--sf-muted-placeholder':    '--prim-splash-300',
        '--sf-muted-logo':           '--prim-sapphire-900',
        '--sf-muted-link':           '--prim-splash-700',
        '--sf-muted-pill':           '--prim-sapphire-900',
        '--sf-muted-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-sapphire-900',
        '--sf-inverse-heading':        '--prim-butter-500',
        '--sf-inverse-body':           '--prim-butter-700',
        '--sf-inverse-text-muted':     '--prim-butter-900',
        '--sf-inverse-border':         '--prim-sapphire-700',
        '--sf-inverse-border-light':   '--prim-sapphire-700',
        '--sf-inverse-border-mid':     '--prim-sapphire-500',
        '--sf-inverse-border-subtle':  '--prim-sapphire-300',
        '--sf-inverse-callout-border': '--prim-orange-300',
        '--sf-inverse-placeholder':    '--prim-sapphire-700',
        '--sf-inverse-logo':           '--prim-butter-500',
        '--sf-inverse-link':           '--prim-splash-500',
        '--sf-inverse-pill':           '--prim-butter-500',
        '--sf-inverse-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
      },
      accent: {
        '--sf-accent-bg':             '--prim-orange-500',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-butter-500',
        '--sf-accent-text-muted':     '--prim-butter-700',
        '--sf-accent-border':         '--prim-orange-700',
        '--sf-accent-border-light':   '--prim-orange-500',
        '--sf-accent-border-mid':     '--prim-orange-700',
        '--sf-accent-border-subtle':  '--prim-orange-900',
        '--sf-accent-callout-border': '--prim-splash-700',
        '--sf-accent-placeholder':    '--prim-orange-700',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-splash-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-accent':         '--prim-orange-900',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-sapphire-800',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-white',
        '--sf-tertiary-text-muted':     '--prim-splash-200',
        '--sf-tertiary-border':         '--prim-sapphire-400',
        '--sf-tertiary-border-light':   '--prim-sapphire-500',
        '--sf-tertiary-border-mid':     '--prim-sapphire-300',
        '--sf-tertiary-border-subtle':  '--prim-sapphire-200',
        '--sf-tertiary-callout-border': '--prim-splash-700',
        '--sf-tertiary-placeholder':    '--prim-mono-black',
        '--sf-tertiary-logo':           '--prim-mono-black',
        '--sf-tertiary-link':           '--prim-splash-500',
        '--sf-tertiary-pill':           '--prim-splash-300',
        '--sf-tertiary-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
      },
    },
  },
  'coral-tide-alt': {
    label: 'Coral Tide Alt',
    globals: {
      '--color-toc-pip':          '--prim-sapphire-50',
      '--color-toc-pip-active':   '--prim-orange-500',
      '--color-toc-heading':      '--prim-orange-500',
      '--color-toc-text':         '--prim-sapphire-500',
      '--color-toc-text-active':  '--prim-orange-500',
      '--color-dot-active':       '--prim-orange-500',
      '--color-badge-from':       '--prim-sapphire-500',
      '--color-badge-to':         '--prim-sapphire-50',
      '--color-badge-icon':       '--prim-sapphire-500',
      '--color-badge-icon-inner': '--prim-splash-400',
      '--color-badge-unearned-stroke': '--prim-sapphire-400',
      '--color-badge-unearned-text':   '--prim-sapphire-400',
      '--color-avatar-bg':        '--prim-sapphire-600',
      '--color-stat-percentile':  '--prim-orange-500',
      '--color-statement-bg':     '--prim-butter-700',
      '--color-statement-border': '--prim-orange-300',
      '--color-statement-text':   '--prim-sapphire-700',
      '--color-dropdown-bg':         '--prim-mono-white',
      '--color-dropdown-border':     '--prim-splash-300',
      '--color-dropdown-text':       '--prim-sapphire-500',
      '--color-dropdown-icon':       '--prim-sapphire-300',
      '--color-dropdown-soon-bg':    '--prim-butter-700',
      '--color-dropdown-soon-fg':    '--prim-sapphire-500',
      '--color-dropdown-separator':  '--prim-orange-50',
      '--color-nav-bg':           '--prim-butter-500',
      '--color-nav-border':       '--prim-butter-900',
      '--color-nav-icon':         '--prim-sapphire-500',
      '--btn-primary-bg':         '--prim-butter-900',
      '--btn-primary-fg':         '--prim-sapphire-500',
      '--btn-secondary-bg':       '--prim-mono-white',
      '--btn-secondary-fg':       '--prim-sapphire-500',
      '--btn-primary-border':     '--prim-sapphire-500',
      '--btn-secondary-border':   '--prim-sapphire-500',
      '--color-match-win-border':   '--prim-orange-500',
      '--color-match-loss-border':  '--prim-mono-250',
      '--color-match-win-chip-bg':  '--prim-mint-100',
      '--color-match-win-chip-fg':  '--prim-mint-500',
    },
    surfaces: {
      default: {
        '--color-bg':             '--prim-mono-white',
        '--color-heading':        '--prim-sapphire-500',
        '--color-body':           '--prim-sapphire-500',
        '--color-muted':          '--prim-sapphire-700',
        '--color-border':         '--prim-orange-50',
        '--color-border-light':   '--prim-butter-700',
        '--color-border-mid':     '--prim-butter-900',
        '--color-border-subtle':  '--prim-splash-300',
        '--color-callout-border': '--prim-splash-700',
        '--color-placeholder':    '--prim-splash-300',
        '--color-logo':           '--prim-sapphire-400',
        '--color-link':           '--prim-splash-700',
        '--color-pill':           '--prim-orange-500',
        '--color-accent':         '--prim-orange-300',
      ...btnDefaultTokens(BTN_LIGHT),
      },
      muted: {
        '--sf-muted-bg':             '--prim-splash-50',
        '--sf-muted-heading':        '--prim-sapphire-600',
        '--sf-muted-body':           '--prim-sapphire-700',
        '--sf-muted-text-muted':     '--prim-sapphire-500',
        '--sf-muted-border':         '--prim-butter-900',
        '--sf-muted-border-light':   '--prim-splash-200',
        '--sf-muted-border-mid':     '--prim-butter-900',
        '--sf-muted-border-subtle':  '--prim-orange-300',
        '--sf-muted-callout-border': '--prim-sapphire-300',
        '--sf-muted-placeholder':    '--prim-splash-300',
        '--sf-muted-logo':           '--prim-sapphire-900',
        '--sf-muted-link':           '--prim-splash-700',
        '--sf-muted-pill':           '--prim-sapphire-900',
        '--sf-muted-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-sapphire-900',
        '--sf-inverse-heading':        '--prim-butter-500',
        '--sf-inverse-body':           '--prim-butter-700',
        '--sf-inverse-text-muted':     '--prim-butter-900',
        '--sf-inverse-border':         '--prim-sapphire-700',
        '--sf-inverse-border-light':   '--prim-sapphire-700',
        '--sf-inverse-border-mid':     '--prim-sapphire-500',
        '--sf-inverse-border-subtle':  '--prim-sapphire-300',
        '--sf-inverse-callout-border': '--prim-orange-300',
        '--sf-inverse-placeholder':    '--prim-sapphire-700',
        '--sf-inverse-logo':           '--prim-butter-500',
        '--sf-inverse-link':           '--prim-splash-500',
        '--sf-inverse-pill':           '--prim-butter-500',
        '--sf-inverse-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
      },
      accent: {
        '--sf-accent-bg':             '--prim-orange-500',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-butter-500',
        '--sf-accent-text-muted':     '--prim-butter-700',
        '--sf-accent-border':         '--prim-orange-700',
        '--sf-accent-border-light':   '--prim-orange-500',
        '--sf-accent-border-mid':     '--prim-orange-700',
        '--sf-accent-border-subtle':  '--prim-orange-900',
        '--sf-accent-callout-border': '--prim-splash-700',
        '--sf-accent-placeholder':    '--prim-orange-700',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-splash-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-accent':         '--prim-orange-900',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-sapphire-800',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-white',
        '--sf-tertiary-text-muted':     '--prim-splash-200',
        '--sf-tertiary-border':         '--prim-sapphire-400',
        '--sf-tertiary-border-light':   '--prim-sapphire-500',
        '--sf-tertiary-border-mid':     '--prim-sapphire-300',
        '--sf-tertiary-border-subtle':  '--prim-sapphire-200',
        '--sf-tertiary-callout-border': '--prim-splash-700',
        '--sf-tertiary-placeholder':    '--prim-mono-black',
        '--sf-tertiary-logo':           '--prim-mono-black',
        '--sf-tertiary-link':           '--prim-splash-500',
        '--sf-tertiary-pill':           '--prim-splash-300',
        '--sf-tertiary-accent':         '--prim-orange-300',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
      },
    },
  },
  'mvp-green': {
    label: 'MVP Green',
    globals: {
      '--color-toc-pip':          '--prim-mint-300',
      '--color-toc-pip-active':   '--prim-mint-600',
      '--color-toc-heading':      '--prim-mint-600',
      '--color-toc-text':         '--prim-fall-700',
      '--color-toc-text-active':  '--prim-mint-600',
      '--color-dot-active':       '--prim-mint-500',
      '--color-badge-from':       '--prim-mint-600',
      '--color-badge-to':         '--prim-mint-800',
      '--color-badge-icon':       '--prim-mint-700',
      '--color-badge-icon-inner': '--prim-mint-200',
      '--color-badge-unearned-stroke': '--prim-fall-500',
      '--color-badge-unearned-text':   '--prim-fall-500',
      '--color-avatar-bg':        '--prim-mint-200',
      '--color-stat-percentile':  '--prim-mint-400',
      '--color-statement-bg':     '--prim-mint-100',
      '--color-statement-border': '--prim-fall-300',
      '--color-statement-text':   '--prim-mint-700',
      '--color-dropdown-bg':         '--prim-mono-white',
      '--color-dropdown-border':     '--prim-mint-300',
      '--color-dropdown-text':       '--prim-mint-900',
      '--color-dropdown-icon':       '--prim-fall-500',
      '--color-dropdown-soon-bg':    '--prim-mint-200',
      '--color-dropdown-soon-fg':    '--prim-mint-700',
      '--color-dropdown-separator':  '--prim-mint-200',
      '--color-nav-bg':           '--prim-mono-white',
      '--color-nav-border':       '--prim-mint-200',
      '--color-nav-icon':         '--prim-mint-700',
      '--btn-primary-bg':         '--prim-mint-700',
      '--btn-primary-fg':         '--prim-mono-white',
      '--btn-secondary-bg':       '--prim-mono-white',
      '--btn-secondary-fg':       '--prim-mint-700',
      '--btn-primary-border':     '--prim-mint-700',
      '--btn-secondary-border':   '--prim-mint-700',
      '--color-match-win-border':   '--prim-fall-500',
      '--color-match-loss-border':  '--prim-mint-300',
      '--color-match-win-chip-bg':  '--prim-mint-100',
      '--color-match-win-chip-fg':  '--prim-mint-500',
    },
    surfaces: {
      default: {
        '--color-bg':             '--prim-mono-white',
        '--color-heading':        '--prim-mint-900',
        '--color-body':           '--prim-fall-900',
        '--color-muted':          '--prim-fall-700',
        '--color-border':         '--prim-mint-100',
        '--color-border-light':   '--prim-mint-200',
        '--color-border-mid':     '--prim-fall-300',
        '--color-border-subtle':  '--prim-fall-500',
        '--color-callout-border': '--prim-mint-500',
        '--color-placeholder':    '--prim-mint-200',
        '--color-logo':           '--prim-mint-900',
        '--color-link':           '--prim-mint-600',
        '--color-pill':           '--prim-mint-700',
        '--color-accent':         '--prim-mint-500',
      ...btnDefaultTokens(BTN_LIGHT),
      },
      muted: {
        '--sf-muted-bg':             '--prim-mint-100',
        '--sf-muted-heading':        '--prim-mint-900',
        '--sf-muted-body':           '--prim-fall-900',
        '--sf-muted-text-muted':     '--prim-fall-700',
        '--sf-muted-border':         '--prim-mint-200',
        '--sf-muted-border-light':   '--prim-mint-200',
        '--sf-muted-border-mid':     '--prim-fall-300',
        '--sf-muted-border-subtle':  '--prim-fall-500',
        '--sf-muted-callout-border': '--prim-mint-500',
        '--sf-muted-placeholder':    '--prim-mint-300',
        '--sf-muted-logo':           '--prim-mint-900',
        '--sf-muted-link':           '--prim-mint-600',
        '--sf-muted-pill':           '--prim-mint-900',
        '--sf-muted-accent':         '--prim-mint-500',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-mint-800',
        '--sf-inverse-heading':        '--prim-mono-white',
        '--sf-inverse-body':           '--prim-mint-200',
        '--sf-inverse-text-muted':     '--prim-mint-300',
        '--sf-inverse-border':         '--prim-mint-700',
        '--sf-inverse-border-light':   '--prim-mint-700',
        '--sf-inverse-border-mid':     '--prim-mint-600',
        '--sf-inverse-border-subtle':  '--prim-mint-500',
        '--sf-inverse-callout-border': '--prim-fall-300',
        '--sf-inverse-placeholder':    '--prim-mint-700',
        '--sf-inverse-logo':           '--prim-mono-white',
        '--sf-inverse-link':           '--prim-mint-300',
        '--sf-inverse-pill':           '--prim-mono-white',
        '--sf-inverse-accent':         '--prim-mint-400',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
      },
      accent: {
        '--sf-accent-bg':             '--prim-mint-700',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-mint-200',
        '--sf-accent-text-muted':     '--prim-mint-300',
        '--sf-accent-border':         '--prim-mint-600',
        '--sf-accent-border-light':   '--prim-mint-600',
        '--sf-accent-border-mid':     '--prim-mint-500',
        '--sf-accent-border-subtle':  '--prim-mint-400',
        '--sf-accent-callout-border': '--prim-fall-300',
        '--sf-accent-placeholder':    '--prim-mint-600',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-mint-200',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-accent':         '--prim-mint-400',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-mint-900',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mint-200',
        '--sf-tertiary-text-muted':     '--prim-mint-300',
        '--sf-tertiary-border':         '--prim-mint-700',
        '--sf-tertiary-border-light':   '--prim-mint-800',
        '--sf-tertiary-border-mid':     '--prim-mint-600',
        '--sf-tertiary-border-subtle':  '--prim-mint-500',
        '--sf-tertiary-callout-border': '--prim-fall-300',
        '--sf-tertiary-placeholder':    '--prim-mint-700',
        '--sf-tertiary-logo':           '--prim-mono-white',
        '--sf-tertiary-link':           '--prim-mint-200',
        '--sf-tertiary-pill':           '--prim-mono-white',
        '--sf-tertiary-accent':         '--prim-mint-400',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
      },
    },
  },
};

/* Flatten globals + all surfaces into a single token map for a given theme */
function themeAllColorTokens(key) {
  const t = THEMES[key];
  return {
    ...t.globals,
    ...t.surfaces.default,
    ...t.surfaces.muted,
    ...t.surfaces.inverse,
    ...t.surfaces.accent,
    ...t.surfaces.tertiary,
  };
}

/* ─── Surface definitions — drives DME surface sub-tabs ─────── */
const SURFACE_TOKENS = ['bg', 'heading', 'body', 'text-muted', 'border', 'border-light', 'border-mid', 'border-subtle', 'callout-border', 'placeholder', 'logo', 'link', 'pill', 'accent'];
const BTN_SURFACE_TOKENS = ['btn-primary-bg', 'btn-primary-fg', 'btn-dark-bg', 'btn-dark-fg', 'btn-ghost-fg', 'btn-ghost-icon', 'btn-outline-fg', 'btn-outline-border'];
const SURFACE_DEFS = [
  { key: 'default',  label: 'Primary',   prefix: '--color-',        bgToken: '--color-bg'          },
  { key: 'muted',    label: 'Secondary', prefix: '--sf-muted-',     bgToken: '--sf-muted-bg'       },
  { key: 'inverse',  label: 'Inverse',   prefix: '--sf-inverse-',   bgToken: '--sf-inverse-bg'     },
  { key: 'accent',   label: 'Accent',    prefix: '--sf-accent-',    bgToken: '--sf-accent-bg'      },
  { key: 'tertiary', label: 'Tertiary',  prefix: '--sf-tertiary-',  bgToken: '--sf-tertiary-bg'    },
];
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
  '--size-logo':       '30',
  '--size-pill':       '18',
  '--size-toc':        '12',
  '--size-meta':       '14',
  '--spacing-section-v':   '64',
  '--spacing-content-gap': '24',
  '--content-max-width':   '900',
  '--badge-angle':         '135',
};

const DEFAULT_L2 = { ...themeAllColorTokens('mono'), ...DEFAULT_L2_EXTRA };

/* ─── Initial state from committed file ──────────────────────── */
/* dme-defaults.json is the sole source of truth; Save writes to it via Vite middleware */
const INIT_THEME        = fileDefaults.theme    ?? 'mono';
const INIT_L1           = { ...DEFAULT_L1,    ...(fileDefaults.l1       ?? {}) };
/* Seed surface tokens from saved theme (so switching themes applies correct surface defaults),
   then overlay any explicit user customizations from the saved file */
const INIT_L2           = {
  ...DEFAULT_L2,
  ...(THEMES[INIT_THEME] ? themeAllColorTokens(INIT_THEME) : {}),
  ...(fileDefaults.l2 ?? {}),
};
/* Per-theme l2 snapshots — persisted so switching themes restores saved edits */
const INIT_THEME_STATES = {
  ...(fileDefaults.themeStates ?? {}),
  [INIT_THEME]: { ...INIT_L2 },
};
const INIT_L1_COLOR_MAP = { ...L1_COLOR_MAP,  ...(fileDefaults.l1Colors ?? {}) };
const INIT_L1_GROUPS    = fileDefaults.l1Groups
  ?? L1_COLOR_PALETTES.map(p => ({ name: p.name, tokens: [...p.tokens] }));

/* ─── Helpers ────────────────────────────────────────────────── */
function applyL2(name, rawVal) {
  let css = rawVal;
  if (L2_FONT_ROLE_TOKENS.has(name)) {
    /* rawVal is 'heading' | 'subheading' | 'body' → CSS var reference */
    css = `var(--prim-type-${rawVal})`;
  } else if (typeof rawVal === 'string' && rawVal.startsWith('--prim-')) {
    /* rawVal is an L1 token name like '--prim-mono-900' → CSS var reference */
    css = `var(${rawVal})`;
  } else if (name === '--badge-angle') {
    css = rawVal + 'deg';
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

/* ─── Detachable / draggable panel hook (shared with DevModeInspector) ── */
function useDetachablePanel(defaultPos, defaultSize) {
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
    const startX = e.clientX, startY = e.clientY;
    const startW = size.w, startH = size.h;
    const onMove = (ev) => setSize({
      w: Math.max(320, startW + ev.clientX - startX),
      h: Math.max(300, startH + ev.clientY - startY),
    });
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [detached, size]);

  const detach = useCallback(() => setDetached(true), []);
  const dock = useCallback(() => setDetached(false), []);

  return { detached, pos, size, onDragStart, onResizeStart, detach, dock };
}

function DMEResizeHandle({ onMouseDown }) {
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

const DMEDetachIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="8" height="8" rx="1.5"/>
    <path d="M6 10v4h8V6h-4"/>
  </svg>
);
const DMEDockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="14" height="14" rx="2"/>
    <rect x="1" y="1" width="6" height="14" rx="2" fill="currentColor" opacity="0.3"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function TokenEditor({ visible, onClose, states, onStateChange, pages, currentPageId, onNavigate }) {
  const [tab, setTab]                 = useState('l2');
  const [side, setSide]               = useState('right');
  const [activeTheme, setActiveTheme] = useState(INIT_THEME);
  const [l1, setL1]                   = useState({ ...INIT_L1 });
  const [l2, setL2]                   = useState({ ...INIT_L2 });
  const [l1ColorMap, setL1ColorMap]   = useState({ ...INIT_L1_COLOR_MAP });
  const [l1Groups, setL1Groups]       = useState([...INIT_L1_GROUPS]);
  const [canUndo, setCanUndo]         = useState(false);
  const [canRedo, setCanRedo]         = useState(false);
  const [isDirty, setIsDirty]         = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [collapsed, setCollapsed]       = useState(false);
  const [sectResetKey, setSectResetKey] = useState(0);

  /* localStorage keys for all Sect/SubSect groups per tab */
  const L2_SECT_KEYS = [
    'dme-sect-Colors', 'dme-sect-Typography', 'dme-sect-Spacing & Layout',
    'dme-sub-Surfaces', 'dme-sub-Statement', 'dme-sub-Navigation',
    'dme-sub-Badge', 'dme-sub-Avatar', 'dme-sub-Stats', 'dme-sub-Buttons',
  ];
  const L1_SECT_KEYS = [
    'dme-sect-Type Roles', 'dme-sect-Color Palettes',
  ];

  const toggleAllSections = useCallback((expand) => {
    const keys = tab === 'l2' ? L2_SECT_KEYS : L1_SECT_KEYS;
    const val = expand ? 'open' : 'closed';
    keys.forEach(k => localStorage.setItem(k, val));
    setSectResetKey(n => n + 1);
  }, [tab]);

  const panel = useDetachablePanel(
    { x: Math.round(window.innerWidth / 2 - 200), y: 40 },
    { w: 420, h: 650 },
  );

  /* Refs for sync access inside callbacks */
  const l1Ref          = useRef({ ...INIT_L1 });
  const l2Ref          = useRef({ ...INIT_L2 });
  const themeRef       = useRef(INIT_THEME);
  const l1ColorMapRef  = useRef({ ...INIT_L1_COLOR_MAP });
  const l1GroupsRef    = useRef([...INIT_L1_GROUPS]);
  const themeStatesRef = useRef({ ...INIT_THEME_STATES });
  const histRef       = useRef([{ theme: INIT_THEME, l1: { ...INIT_L1 }, l2: { ...INIT_L2 } }]);
  const idxRef        = useRef(0);
  const savedSnapshotRef = useRef({
    theme:    INIT_THEME,
    l1:       { ...INIT_L1 },
    l2:       { ...INIT_L2 },
    l1Colors: { ...INIT_L1_COLOR_MAP },
    l1Groups: INIT_L1_GROUPS.map(g => ({ ...g, tokens: [...g.tokens] })),
  });

  /* Apply committed file defaults to DOM on mount */
  useEffect(() => {
    Object.entries(INIT_L1).forEach(([k, v]) => applyL1(k, v));
    Object.entries(INIT_L2).forEach(([k, v]) => applyL2(k, v));
    Object.entries(INIT_L1_COLOR_MAP).forEach(([tok, hex]) => {
      document.documentElement.style.setProperty(tok, hex);
    });
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
    setIsDirty(true);
    refreshHistoryState();
  }, []);

  const restoreSnapshot = useCallback((snap) => {
    removeAllOverrides();
    Object.entries(snap.l2).forEach(([k, v]) => applyL2(k, v));
    Object.entries(snap.l1).forEach(([k, v]) => applyL1(k, v));
    l1Ref.current = snap.l1; l2Ref.current = snap.l2; themeRef.current = snap.theme;
    setL1({ ...snap.l1 }); setL2({ ...snap.l2 }); setActiveTheme(snap.theme);
    setIsDirty(true);
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

  /* ── Undo/redo keyboard listeners ────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return; }
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
    /* Snapshot current theme before leaving */
    themeStatesRef.current[themeRef.current] = { ...l2Ref.current };

    const savedState = themeStatesRef.current[key];
    let next;
    if (savedState) {
      /* Restore full saved state for this theme */
      Object.entries(savedState).forEach(([k, v]) => applyL2(k, v));
      next = { ...savedState };
    } else {
      /* First visit — seed from hardcoded template */
      const colors = themeAllColorTokens(key);
      Object.entries(colors).forEach(([k, v]) => applyL2(k, v));
      next = { ...l2Ref.current, ...colors };
    }
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

  /* ── L1 color CRUD ────────────────────────────────────────── */
  const setL1ColorHex = useCallback((token, hex) => {
    document.documentElement.style.setProperty(token, hex);
    const next = { ...l1ColorMapRef.current, [token]: hex };
    l1ColorMapRef.current = next;
    setL1ColorMap(next);
    setIsDirty(true);
  }, []);

  const natSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  const addL1Color = useCallback((groupName, token, hex) => {
    document.documentElement.style.setProperty(token, hex);
    const nextMap = { ...l1ColorMapRef.current, [token]: hex };
    l1ColorMapRef.current = nextMap;
    setL1ColorMap(nextMap);
    const nextGroups = l1GroupsRef.current.map(g => {
      if (g.name !== groupName) return g;
      const tokens = [...g.tokens, token].sort(natSort);
      return { ...g, tokens };
    });
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    setIsDirty(true);
  }, []);

  const sortL1Group = useCallback((groupName) => {
    const nextGroups = l1GroupsRef.current.map(g => {
      if (g.name !== groupName) return g;
      return { ...g, tokens: [...g.tokens].sort(natSort) };
    });
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    setIsDirty(true);
  }, []);

  const renameL1Color = useCallback((groupName, oldToken, newToken, hex) => {
    if (oldToken === newToken) return;
    document.documentElement.style.removeProperty(oldToken);
    document.documentElement.style.setProperty(newToken, hex);
    const nextMap = { ...l1ColorMapRef.current };
    delete nextMap[oldToken];
    nextMap[newToken] = hex;
    l1ColorMapRef.current = nextMap;
    setL1ColorMap(nextMap);
    const nextGroups = l1GroupsRef.current.map(g =>
      g.name === groupName
        ? { ...g, tokens: g.tokens.map(t => t === oldToken ? newToken : t) }
        : g
    );
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    /* Also update any L2 tokens referencing the old name */
    const l2Updates = {};
    Object.entries(l2Ref.current).forEach(([k, v]) => {
      if (v === oldToken) l2Updates[k] = newToken;
    });
    if (Object.keys(l2Updates).length > 0) {
      const nextL2 = { ...l2Ref.current, ...l2Updates };
      Object.entries(l2Updates).forEach(([k, v]) => applyL2(k, v));
      l2Ref.current = nextL2;
      setL2(nextL2);
    }
    setIsDirty(true);
  }, []);

  const deleteL1Color = useCallback((groupName, token) => {
    document.documentElement.style.removeProperty(token);
    const nextMap = { ...l1ColorMapRef.current };
    delete nextMap[token];
    l1ColorMapRef.current = nextMap;
    setL1ColorMap(nextMap);
    const nextGroups = l1GroupsRef.current.map(g =>
      g.name === groupName ? { ...g, tokens: g.tokens.filter(t => t !== token) } : g
    );
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    setIsDirty(true);
  }, []);

  const moveL1Color = useCallback((groupName, fromIdx, toIdx) => {
    const nextGroups = l1GroupsRef.current.map(g => {
      if (g.name !== groupName) return g;
      const tokens = [...g.tokens];
      const [moved] = tokens.splice(fromIdx, 1);
      tokens.splice(toIdx, 0, moved);
      return { ...g, tokens };
    });
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    setIsDirty(true);
  }, []);

  const addL1Group = useCallback((name) => {
    const next = [...l1GroupsRef.current, { name, tokens: [] }];
    l1GroupsRef.current = next;
    setL1Groups(next);
    setIsDirty(true);
  }, []);

  const deleteL1Group = useCallback((name) => {
    const group = l1GroupsRef.current.find(g => g.name === name);
    if (group) {
      group.tokens.forEach(t => document.documentElement.style.removeProperty(t));
      const nextMap = { ...l1ColorMapRef.current };
      group.tokens.forEach(t => delete nextMap[t]);
      l1ColorMapRef.current = nextMap;
      setL1ColorMap(nextMap);
    }
    const nextGroups = l1GroupsRef.current.filter(g => g.name !== name);
    l1GroupsRef.current = nextGroups;
    setL1Groups(nextGroups);
    setIsDirty(true);
  }, []);

  /* ── Save ─────────────────────────────────────────────────── */
  const handleSave = useCallback(() => {
    /* Always snapshot current theme before saving */
    themeStatesRef.current[themeRef.current] = { ...l2Ref.current };
    const state = {
      theme:       themeRef.current,
      l1:          l1Ref.current,
      l2:          l2Ref.current,
      l1Colors:    l1ColorMapRef.current,
      l1Groups:    l1GroupsRef.current,
      themeStates: themeStatesRef.current,
      states,
    };
    /* Write to src/tokens/dme-defaults.json via Vite dev middleware */
    fetch('/__dme_save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {});
    /* Update the reset baseline to this saved state */
    savedSnapshotRef.current = {
      theme:    themeRef.current,
      l1:       { ...l1Ref.current },
      l2:       { ...l2Ref.current },
      l1Colors: { ...l1ColorMapRef.current },
      l1Groups: l1GroupsRef.current.map(g => ({ ...g, tokens: [...g.tokens] })),
    };
    setIsDirty(false);
    setHasSavedState(true);
  }, [states]);

  const reset = useCallback(() => {
    const snap = savedSnapshotRef.current;
    removeAllOverrides();
    Object.keys(l1ColorMapRef.current).forEach(t => document.documentElement.style.removeProperty(t));
    Object.entries(snap.l1Colors).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    Object.entries(snap.l2).forEach(([k, v]) => applyL2(k, v));
    Object.entries(snap.l1).forEach(([k, v]) => applyL1(k, v));
    l1Ref.current = { ...snap.l1 }; l2Ref.current = { ...snap.l2 }; themeRef.current = snap.theme;
    l1ColorMapRef.current = { ...snap.l1Colors };
    l1GroupsRef.current = snap.l1Groups.map(g => ({ ...g, tokens: [...g.tokens] }));
    setL1({ ...snap.l1 }); setL2({ ...snap.l2 }); setActiveTheme(snap.theme);
    setL1ColorMap({ ...snap.l1Colors });
    setL1Groups(snap.l1Groups.map(g => ({ ...g, tokens: [...g.tokens] })));
    histRef.current = [{ theme: snap.theme, l1: { ...snap.l1 }, l2: { ...snap.l2 } }];
    idxRef.current = 0;
    setIsDirty(false);
    refreshHistoryState();
  }, []);

  if (!visible) return null;

  /* ── Collapse tab ─────────────────────────────────────────── */
  const tabRadius = side === 'right' ? '6px 0 0 6px' : '0 6px 6px 0';
  const arrowRight = side === 'right' ? !collapsed : collapsed;
  const tabArrow = (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d={arrowRight ? 'M1 1l6 6-6 6' : 'M7 1l-6 6 6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

  if (collapsed && !panel.detached) return (
    <>
      <button
        onClick={() => setCollapsed(false)}
        title="Expand DME"
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          [side]: 0,
          zIndex: 10000,
          ...tabBaseStyle,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        {tabArrow}
      </button>
    </>
  );

  /* Panel positioning: docked or floating */
  const panelStyle = panel.detached
    ? {
        position: 'fixed',
        top: panel.pos.y, left: panel.pos.x,
        width: panel.size.w, height: panel.size.h,
        borderRadius: 8, border: '1px solid #444',
      }
    : {
        position: 'fixed', top: 0,
        right: side === 'right' ? 0 : 'auto',
        left:  side === 'left'  ? 0 : 'auto',
        height: '100vh', width: '30vw', minWidth: 380,
      };

  return (
    <>
    <div data-devmode-ignore style={{
      ...panelStyle,
      background: '#1c1c1c', color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12, zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      boxShadow: panel.detached ? '0 8px 40px rgba(0,0,0,0.6)' : (side === 'right' ? '-6px 0 32px rgba(0,0,0,0.5)' : '6px 0 32px rgba(0,0,0,0.5)'),
      overflow: 'hidden',
    }}>
      {panel.detached && <DMEResizeHandle onMouseDown={panel.onResizeStart} />}

      {/* ── Collapse tab on outer edge (docked only) ── */}
      {!panel.detached && (
      <button
        onClick={() => setCollapsed(true)}
        title="Collapse DME"
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          [side === 'right' ? 'left' : 'right']: -20,
          zIndex: 10000,
          ...tabBaseStyle,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        {tabArrow}
      </button>
      )}

      {/* ── Persistent top strip — draggable when detached ───── */}
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#999' }}>
            Design Matrix Editor
          </span>
          {!panel.detached && <span style={{ fontSize: 10, color: '#777' }}>↑↑↓↓</span>}
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {/* Dock left/right — only when docked */}
          {!panel.detached && (
            <>
              <button title="Dock left"  onClick={() => setSide('left')}  style={dockBtn(side === 'left')}>
                <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                  <rect x="0.5" y="0.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="1" width="6" height="12" rx="1.5" fill="currentColor"/>
                </svg>
              </button>
              <button title="Dock right" onClick={() => setSide('right')} style={dockBtn(side === 'right')}>
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
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#888', padding: '2px 4px', borderRadius: 3,
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
            onMouseLeave={e => e.currentTarget.style.color = '#888'}
          >
            {panel.detached ? <DMEDockIcon /> : <DMEDetachIcon />}
          </button>
          <div style={{ width: 1, height: 14, background: '#444', margin: '0 3px' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 3px' }}>×</button>
        </div>
      </div>

      {/* ── Page selector dropdown ───────────────────────────── */}
      {pages && pages.length > 0 && (
        <div style={{
          padding: '6px 12px', borderBottom: '1px solid #222',
          background: '#161616', flexShrink: 0,
        }}>
          <select
            value={currentPageId}
            onChange={e => onNavigate?.(e.target.value)}
            style={{
              width: '100%', background: '#222', border: '1px solid #333',
              borderRadius: 6, color: '#e0e0e0', fontSize: 11, fontWeight: 600,
              padding: '6px 8px', cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {pages.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>
              Design Matrix Editor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              {!isDirty && hasSavedState && <span style={{ color: '#3d7a4e', fontSize: 10 }}>● saved</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Undo */}
            <button title="Undo (⌘Z)" onClick={undo} disabled={!canUndo} style={iconBtn(canUndo)}>
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 1 0 1.5-3.5L2 2M2 2v3.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Redo */}
            <button title="Redo (⌘⇧Z)" onClick={redo} disabled={!canRedo} style={iconBtn(canRedo)}>
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 1 1-1.5-3.5L12 2M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div style={{ width: 1, height: 16, background: '#333' }} />
            {isDirty && <button onClick={handleSave} style={saveBtn}>Save</button>}
            <button onClick={reset} style={ghostBtn}>Reset</button>
          </div>
        </div>

        {/* Theme selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#999', fontSize: 11, flexShrink: 0 }}>Theme</span>
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
            color: tab === key ? '#fff' : '#888', fontSize: 11, cursor: 'pointer',
            borderBottom: tab === key ? '2px solid #666' : '2px solid transparent',
            fontWeight: tab === key ? 600 : 400,
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Expand / Collapse All ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4, padding: '5px 16px 4px', flexShrink: 0, borderBottom: '1px solid #222', background: '#181818' }}>
        <button onClick={() => toggleAllSections(true)} style={{ background: 'none', border: 'none', color: '#777', fontSize: 10, cursor: 'pointer', padding: '2px 4px', letterSpacing: '0.03em' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'} onMouseLeave={e => e.currentTarget.style.color = '#777'}>
          Expand All
        </button>
        <span style={{ color: '#333', fontSize: 10 }}>|</span>
        <button onClick={() => toggleAllSections(false)} style={{ background: 'none', border: 'none', color: '#777', fontSize: 10, cursor: 'pointer', padding: '2px 4px', letterSpacing: '0.03em' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'} onMouseLeave={e => e.currentTarget.style.color = '#777'}>
          Collapse All
        </button>
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'l2'
          ? <L2View key={sectResetKey} l2={l2} set={setL2Token} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          : <L1View key={sectResetKey} l1={l1} setRole={setL1Role} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
              setL1ColorHex={setL1ColorHex} addL1Color={addL1Color} deleteL1Color={deleteL1Color}
              moveL1Color={moveL1Color} addL1Group={addL1Group} deleteL1Group={deleteL1Group}
              sortL1Group={sortL1Group} renameL1Color={renameL1Color} />
        }
      </div>

    </div>
    </>
  );
}

/* ── DME Breakpoints UI ───────────────────────────────────────────── */

const BREAKPOINT_OPTIONS = [
  { key: null,   label: 'Full Width', px: null,  description: 'No constraint — uses browser viewport' },
  { key: '2xl',  label: '2xl',        px: 1536,  description: 'Large desktop' },
  { key: 'xl',   label: 'xl',         px: 1280,  description: 'Laptop / desktop' },
  { key: 'lg',   label: 'lg',         px: 1024,  description: 'Tablet / small laptop' },
  { key: 'md',   label: 'md',         px: 768,   description: 'Large phone / small tablet' },
  { key: 'sm',   label: 'sm',         px: 640,   description: 'Small phone' },
  { key: 'xsm',  label: 'xsm',       px: 375,   description: 'Extra small phone' },
];

function BreakpointsView({ activeBreakpoint, onBreakpointChange }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#999', marginBottom: 12,
        paddingBottom: 6, borderBottom: '1px solid #333',
      }}>
        Viewport Width
      </div>
      {BREAKPOINT_OPTIONS.map(opt => (
        <BreakpointRadioRow
          key={opt.label}
          option={opt}
          active={activeBreakpoint === opt.key}
          onSelect={() => onBreakpointChange(opt.key)}
        />
      ))}
    </div>
  );
}

function BreakpointRadioRow({ option, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 0', background: 'none', border: 'none',
        borderBottom: '1px solid #242424', cursor: 'pointer', textAlign: 'left',
      }}
    >
      {/* Radio circle */}
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: active ? '2px solid #4caf82' : '2px solid #777',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && (
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf82' }} />
        )}
      </div>
      {/* Label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0' }}>
          {option.label}
          {option.px && (
            <span style={{ fontWeight: 400, color: '#777', marginLeft: 6, fontSize: 11 }}>
              {option.px}px
            </span>
          )}
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 1 }}>{option.description}</div>
      </div>
    </button>
  );
}

/* ─── Surface swatch — live preview of one surface's bg/heading/body ── */
function SurfaceSwatch({ surfaceDef, l2, l1ColorMap }) {
  const tokenName = (suffix) =>
    surfaceDef.key === 'default'
      ? DEFAULT_SURFACE_TOKEN_MAP[suffix]
      : `${surfaceDef.prefix}${suffix}`;
  const hex = (suffix) => l1ColorMap[l2[tokenName(suffix)]] || '#888';
  return (
    <div style={{ margin: '4px 16px 6px', borderRadius: 5, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
      <div style={{ background: hex('bg'), padding: '8px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: hex('heading'), marginBottom: 2 }}>{surfaceDef.label} surface</div>
        <div style={{ fontSize: 10, color: hex('body') }}>Body text preview</div>
        <div style={{ fontSize: 10, color: hex('text-muted') }}>Muted / secondary text</div>
      </div>
    </div>
  );
}

/* ─── Surface colour panel — tab bar selects one of 4 surfaces ── */
function SurfaceColorPanel({ l2, set, l1ColorMap, l1Groups }) {
  const [activeSurf, setActiveSurf] = React.useState('default');
  const sf = SURFACE_DEFS.find(s => s.key === activeSurf);
  const tokenFor = (suffix) =>
    sf.key === 'default'
      ? DEFAULT_SURFACE_TOKEN_MAP[suffix]
      : `${sf.prefix}${suffix}`;
  const LABELS = { bg: 'Background', heading: 'Heading', body: 'Body text', 'text-muted': 'Muted text', border: 'Border', 'border-light': 'Border light', 'border-mid': 'Border mid', 'border-subtle': 'Border subtle', 'callout-border': 'Callout border', placeholder: 'Placeholder', logo: 'Logo', link: 'Link', pill: 'Pill', accent: 'Pill (accent)' };
  const BTN_LABELS = { 'btn-primary-bg': 'Primary bg', 'btn-primary-fg': 'Primary text', 'btn-dark-bg': 'Dark bg', 'btn-dark-fg': 'Dark text', 'btn-ghost-fg': 'Ghost text', 'btn-ghost-icon': 'Ghost icon', 'btn-outline-fg': 'Outline text', 'btn-outline-border': 'Outline border' };
  return (
    <>
      {/* Surface tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '4px 16px 0' }}>
        {SURFACE_DEFS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSurf(s.key)}
            style={{
              flex: 1, padding: '3px 2px', fontSize: 10, fontWeight: activeSurf === s.key ? 700 : 400,
              background: activeSurf === s.key ? '#2a2a2a' : 'transparent',
              color: activeSurf === s.key ? '#fff' : '#888', border: '1px solid #2a2a2a',
              borderRadius: 3, cursor: 'pointer',
            }}
          >{s.label}</button>
        ))}
      </div>
      <SurfaceSwatch surfaceDef={sf} l2={l2} l1ColorMap={l1ColorMap} />
      {SURFACE_TOKENS.map(suffix => (
        <ColorRow
          key={suffix}
          label={LABELS[suffix]}
          name={tokenFor(suffix)}
          l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
        />
      ))}
      {/* Pathway button tokens per surface */}
      <div style={{ padding: '8px 16px 2px', color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderTop: '1px solid #2a2a2a', marginTop: 4 }}>
        Pathway Buttons
      </div>
      {BTN_SURFACE_TOKENS.map(suffix => (
        <ColorRow
          key={suffix}
          label={BTN_LABELS[suffix]}
          name={tokenFor(suffix)}
          l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   L2 View
   ═══════════════════════════════════════════════════════════════ */
function L2View({ l2, set, l1ColorMap, l1Groups }) {
  return (
    <>
      <Sect label="Colors">
        <SubSect label="Surfaces">
          <SurfaceColorPanel l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Statement">
          <ColorRow label="Background"   name="--color-statement-bg"     l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"       name="--color-statement-border" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"         name="--color-statement-text"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Header Dropdown">
          <ColorRow label="Background"  name="--color-dropdown-bg"        l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"      name="--color-dropdown-border"    l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"        name="--color-dropdown-text"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Icon"        name="--color-dropdown-icon"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Soon pill bg"   name="--color-dropdown-soon-bg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Soon pill text" name="--color-dropdown-soon-fg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Separator"   name="--color-dropdown-separator" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Navigation">
          <ColorRow label="TOC pip"          name="--color-toc-pip"        l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="TOC active pip"   name="--color-toc-pip-active" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="TOC heading"      name="--color-toc-heading"    l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="TOC text"         name="--color-toc-text"       l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="TOC active text"  name="--color-toc-text-active" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Progress dot active" name="--color-dot-active" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Mobile nav bg"    name="--color-nav-bg"         l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Mobile nav border" name="--color-nav-border"    l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Mobile nav icon"  name="--color-nav-icon"       l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Badge">
          <ColorRow label="Gradient start"   name="--color-badge-from"        l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Gradient end"     name="--color-badge-to"          l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <SliderRow label="Angle"           name="--badge-angle"             l2={l2} set={set} min={0} max={360} unit="°" />
          <ColorRow label="Icon (cap)"        name="--color-badge-icon"       l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Icon (inner hex)" name="--color-badge-icon-inner"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Unearned stroke"  name="--color-badge-unearned-stroke" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Unearned text"    name="--color-badge-unearned-text"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Avatar">
          <ColorRow label="Background" name="--color-avatar-bg" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Stats">
          <ColorRow label="Percentile" name="--color-stat-percentile" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Match History">
          <ColorRow label="Win border"      name="--color-match-win-border"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Loss border"     name="--color-match-loss-border"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Win chip bg"     name="--color-match-win-chip-bg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Win chip text"   name="--color-match-win-chip-fg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Buttons">
          <ColorRow label="Primary bg"      name="--btn-primary-bg"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Primary text"    name="--btn-primary-fg"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Secondary bg"    name="--btn-secondary-bg" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Secondary text"  name="--btn-secondary-fg" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Primary border"   name="--btn-primary-border"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Secondary border" name="--btn-secondary-border" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>
      </Sect>
      <Sect label="Typography">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#888', fontSize: 10, lineHeight: 1.5 }}>
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
        <SliderRow label="Logo size"     name="--size-logo"       l2={l2} set={set} min={16}  max={60}   unit="px" />
        <SliderRow label="Pill size"     name="--size-pill"       l2={l2} set={set} min={10}  max={24}   unit="px" />
        <SliderRow label="TOC size"      name="--size-toc"        l2={l2} set={set} min={9}   max={18}   unit="px" />
        <SliderRow label="Meta size"     name="--size-meta"       l2={l2} set={set} min={9}   max={18}   unit="px" />
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
      <div style={{ padding: '8px 16px 2px', color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
          <span style={{ color: '#999', fontSize: 11, minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>
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
          <span style={{ color: '#999', fontSize: 11, minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>
            {(Number(l1[lhKey] ?? 16) / 10).toFixed(1)}
          </span>
        </div>
      </Row>
    </div>
  );
}

function L1PaletteEditor({ group, l1ColorMap, onSetHex, onAdd, onDelete, onMove, onDeleteGroup, onSort, onRename }) {
  const [editingToken, setEditingToken]   = useState(null);
  const [editHex, setEditHex]             = useState('');
  const [editName, setEditName]           = useState('');
  const [addingColor, setAddingColor]     = useState(false);
  const [newHex, setNewHex]               = useState('#888888');
  const [newName, setNewName]             = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tinyBtn = { background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', lineHeight: 1, flexShrink: 0, fontSize: 20 };

  const handleAdd = () => {
    const slug = newName.trim().replace(/\s+/g, '-').toLowerCase();
    if (!slug) return;
    onAdd(group.name, '--prim-' + slug, newHex);
    setAddingColor(false); setNewName(''); setNewHex('#888888');
  };

  const handleConfirmEdit = (token) => {
    const slug = editName.trim().replace(/\s+/g, '-').toLowerCase();
    if (slug) {
      const newToken = '--prim-' + slug;
      onRename(group.name, token, newToken, editHex);
    }
    setEditingToken(null);
  };

  return (
    <div style={{ padding: '6px 16px 8px', borderBottom: '1px solid #2a2a2a' }}>
      {/* Palette header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span style={{ color: '#999', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, flex: 1 }}>{group.name}</span>
        <button onClick={() => onSort(group.name)} title="Sort A→Z" style={{ ...tinyBtn, color: '#777', fontSize: 14 }}>A↓</button>
        {confirmDelete ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#bbb', fontSize: 10 }}>Delete?</span>
            <button onClick={() => onDeleteGroup(group.name)} style={{ ...tinyBtn, color: '#e06060' }}>Yes</button>
            <button onClick={() => setConfirmDelete(false)} style={{ ...tinyBtn, color: '#999' }}>No</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} title="Delete palette" style={{ ...tinyBtn, color: '#777' }}>×</button>
        )}
      </div>

      {/* Token rows */}
      {group.tokens.map((token, idx) => {
        const hex = l1ColorMap[token] || '#888888';
        const shortName = token.replace('--prim-', '');
        const isEditing = editingToken === token;
        const last = group.tokens.length - 1;
        return (
          <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, minHeight: 34 }}>
            {isEditing ? (
              <>
                <input type="color" value={editHex}
                  onChange={e => { setEditHex(e.target.value); onSetHex(token, e.target.value); }}
                  style={{ width: 40, height: 28, padding: 1, border: '1px solid #3a3a3a', borderRadius: 3, cursor: 'pointer', flexShrink: 0 }}
                />
                <input type="text" value={editHex}
                  onChange={e => {
                    const val = e.target.value;
                    setEditHex(val);
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) onSetHex(token, val);
                  }}
                  maxLength={7}
                  style={{ width: 68, background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#ddd', fontSize: 11, padding: '3px 5px', borderRadius: 3, fontFamily: 'monospace' }}
                />
                <input type="text" value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleConfirmEdit(token); if (e.key === 'Escape') setEditingToken(null); }}
                  placeholder="token-name"
                  style={{ flex: 1, background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#ddd', fontSize: 11, padding: '3px 5px', borderRadius: 3, fontFamily: 'monospace', minWidth: 0 }}
                />
                <button onClick={() => handleConfirmEdit(token)} style={{ ...tinyBtn, color: '#4cb87a' }}>✓</button>
              </>
            ) : (
              <>
                <div style={{ width: 28, height: 28, background: hex, borderRadius: 2, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
                <span style={{ color: '#bbb', fontSize: 11, fontFamily: 'monospace' }}>{shortName}</span>
                <span style={{ color: '#777', fontSize: 10, fontFamily: 'monospace', flex: 1 }}>{hex}</span>
                <button onClick={() => onMove(group.name, idx, idx - 1)} disabled={idx === 0}
                  style={{ ...tinyBtn, color: idx === 0 ? '#3a3a3a' : '#888', fontSize: 18 }}>↑</button>
                <button onClick={() => onMove(group.name, idx, idx + 1)} disabled={idx === last}
                  style={{ ...tinyBtn, color: idx === last ? '#3a3a3a' : '#888', fontSize: 18 }}>↓</button>
                <button onClick={() => { setEditingToken(token); setEditHex(hex); setEditName(shortName); }} style={{ ...tinyBtn, color: '#888' }}>✎</button>
                <button onClick={() => onDelete(group.name, token)} style={{ ...tinyBtn, color: '#888' }}>×</button>
              </>
            )}
          </div>
        );
      })}

      {/* Add color form */}
      {addingColor ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
          <input type="color" value={newHex} onChange={e => setNewHex(e.target.value)}
            style={{ width: 40, height: 28, padding: 1, border: '1px solid #3a3a3a', borderRadius: 3, cursor: 'pointer', flexShrink: 0 }}
          />
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="token-name" autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAddingColor(false); setNewName(''); } }}
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #3a3a3a', color: '#ddd', fontSize: 11, padding: '3px 6px', borderRadius: 3, fontFamily: 'monospace' }}
          />
          <button onClick={handleAdd} style={{ ...tinyBtn, color: '#4cb87a' }}>✓</button>
          <button onClick={() => { setAddingColor(false); setNewName(''); }} style={{ ...tinyBtn, color: '#888' }}>×</button>
        </div>
      ) : (
        <button onClick={() => setAddingColor(true)}
          style={{ color: '#888', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0 0', letterSpacing: '0.04em' }}
        >+ Add Color</button>
      )}
    </div>
  );
}

function L1View({ l1, setRole, l1ColorMap, l1Groups, setL1ColorHex, addL1Color, deleteL1Color, moveL1Color, addL1Group, deleteL1Group, sortL1Group, renameL1Color }) {
  const [addingPalette, setAddingPalette]   = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  const handleAddPalette = () => {
    const name = newPaletteName.trim();
    if (!name) return;
    addL1Group(name);
    setAddingPalette(false); setNewPaletteName('');
  };

  return (
    <>
      <Sect label="Type Roles">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#888', fontSize: 10, lineHeight: 1.5 }}>
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
          <div style={{ color: '#888', fontSize: 10, lineHeight: 1.5 }}>
            Define primitive color tokens. L2 tokens reference these.
          </div>
        </div>
        {l1Groups.map(group => (
          <L1PaletteEditor key={group.name} group={group} l1ColorMap={l1ColorMap}
            onSetHex={setL1ColorHex} onAdd={addL1Color} onDelete={deleteL1Color} onMove={moveL1Color}
            onDeleteGroup={deleteL1Group} onSort={sortL1Group} onRename={renameL1Color}
          />
        ))}
        <div style={{ padding: '8px 16px' }}>
          {addingPalette ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="text" value={newPaletteName} onChange={e => setNewPaletteName(e.target.value)}
                placeholder="Palette name" autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleAddPalette(); if (e.key === 'Escape') { setAddingPalette(false); setNewPaletteName(''); } }}
                style={{ flex: 1, background: '#262626', border: '1px solid #3a3a3a', color: '#ccc', fontSize: 11, padding: '4px 8px', borderRadius: 3 }}
              />
              <button onClick={handleAddPalette} style={ghostBtn}>Add</button>
              <button onClick={() => { setAddingPalette(false); setNewPaletteName(''); }}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>×</button>
            </div>
          ) : (
            <button onClick={() => setAddingPalette(true)}
              style={{ color: '#888', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.04em' }}
            >+ Add Palette</button>
          )}
        </div>
      </Sect>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Shared UI primitives
   ═══════════════════════════════════════════════════════════════ */
function SubSect({ label, children }) {
  const key = `dme-sub-${label}`;
  const [open, setOpen] = useState(() => localStorage.getItem(key) !== 'closed');
  const toggle = () => setOpen(o => { const next = !o; localStorage.setItem(key, next ? 'open' : 'closed'); return next; });
  return (
    <div>
      <div
        onClick={toggle}
        style={{
          padding: '8px 16px 2px',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#e0e0e0', marginTop: 4, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        <span style={{ color: '#999', fontSize: 9, marginRight: 2 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && children}
    </div>
  );
}

function Sect({ label, children }) {
  const key = `dme-sect-${label}`;
  const [open, setOpen] = useState(() => localStorage.getItem(key) !== 'closed');
  const toggle = () => setOpen(o => { const next = !o; localStorage.setItem(key, next ? 'open' : 'closed'); return next; });
  return (
    <div>
      <div
        onClick={toggle}
        style={{
          padding: '11px 16px 9px',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#ddd', borderBottom: '1px solid #2a2a2a',
          position: 'sticky', top: 0, background: '#1c1c1c', zIndex: 1,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span>{label}</span>
        <span style={{ color: '#999', fontSize: 11 }}>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div style={{ padding: '4px 0 8px' }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 16px', gap: 8, minHeight: 32 }}>
      <span style={{ color: '#aaa', fontSize: 12, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}


/* ── Palette colour picker — selects an L1 token reference ──── */
function ColorRow({ label, name, l2, set, l1ColorMap, l1Groups }) {
  const currentToken = l2[name] || '--prim-mono-900';
  const hex = l1ColorMap[currentToken] || '#888';
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
          <div style={{ width: 22, height: 22, borderRadius: 2, background: hex, border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} />
          <span style={{ color: '#aaa', fontSize: 10, fontFamily: 'monospace' }}>{shortName}</span>
        </button>

        {/* Palette dropdown */}
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
                      onClick={() => { set(name, tok); }}
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
        <span style={{ color: '#999', fontSize: 11, minWidth: 42, textAlign: 'right', fontFamily: 'monospace' }}>
          {l2[name]}{unit}
        </span>
      </div>
    </Row>
  );
}

/* ─── Button styles ──────────────────────────────────────────── */
const saveBtn = {
  background: '#1a3a2a', border: '1px solid #2a5a3a',
  color: '#4eb87a', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontWeight: 600,
};
const ghostBtn = {
  background: '#2a2a2a', border: '1px solid #3a3a3a',
  color: '#bbb', fontSize: 11, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
};
const iconBtn = (enabled) => ({
  background: 'none', border: 'none', padding: '5px 6px',
  color: enabled ? '#aaa' : '#444', cursor: enabled ? 'pointer' : 'default',
  display: 'flex', alignItems: 'center', borderRadius: 3,
});
const dockBtn = (active) => ({
  background: active ? '#333' : 'none', border: 'none', padding: '4px 6px',
  color: active ? '#e0e0e0' : '#888', cursor: 'pointer',
  display: 'flex', alignItems: 'center', borderRadius: 3,
});
