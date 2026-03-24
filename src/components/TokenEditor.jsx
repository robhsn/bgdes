import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  /* Background */
  'bg':              '--color-bg',
  /* Text hierarchy */
  'heading':         '--color-heading',
  'h1':              '--color-h1',
  'h2':              '--color-h2',
  'h3':              '--color-h3',
  'h4':              '--color-h4',
  'sh1':             '--color-sh1',
  'sh2':             '--color-sh2',
  'sh3':             '--color-sh3',
  'sh4':             '--color-sh4',
  'body-lg':         '--color-body-lg',
  'body':            '--color-body',
  'body-sm':         '--color-body-sm',
  'text-muted-lg':   '--color-muted-lg',
  'text-muted':      '--color-muted',
  'text-muted-sm':   '--color-muted-sm',
  /* Links */
  'link-lg':         '--color-link-lg',
  'link':            '--color-link',
  'link-sm':         '--color-link-sm',
  /* Borders */
  'border':          '--color-border',
  'border-light':    '--color-border-light',
  'border-mid':      '--color-border-mid',
  'border-subtle':   '--color-border-subtle',
  'border-active':   '--color-border-active',
  'input-bg':        '--color-input-bg',
  'callout-border':  '--color-callout-border',
  /* Pills & tags */
  'pill':            '--color-pill',
  'pill-lg':         '--color-pill-lg',
  'pill-md':         '--color-pill-md',
  'pill-sm':         '--color-pill-sm',
  'accent':          '--color-accent',
  'pill-bg':         '--color-pill-bg',
  'pill-border':     '--color-pill-border',
  'tag-fill':        '--color-tag-fill',
  /* UI text */
  'ui-xl':           '--color-ui-xl',
  'ui-lg':           '--color-ui-lg',
  'ui-md':           '--color-ui-md',
  'ui-sm':           '--color-ui-sm',
  'ui-xsm':          '--color-ui-xsm',
  /* Branding */
  'logo':            '--color-logo',
  'star':            '--color-star',
  /* Form / Inputs */
  'placeholder':     '--color-placeholder',
  'input-border':    '--color-input-border',
  'input-text':      '--color-input-text',
  'input-placeholder':'--color-input-placeholder',
  /* Status */
  'status-success':  '--color-status-success',
  'status-warning':  '--color-status-warning',
  'status-error':    '--color-status-error',
  /* Scrollbar */
  'scrollbar-thumb': '--color-scrollbar-thumb',
  'scrollbar-track': '--color-scrollbar-track',
  /* Buttons */
  'btn-primary-bg':    '--com-btn-primary-bg',
  'btn-primary-fg':    '--com-btn-primary-fg',
  'btn-dark-bg':       '--com-btn-dark-bg',
  'btn-dark-fg':       '--com-btn-dark-fg',
  'btn-ghost-fg':      '--com-btn-ghost-fg',
  'btn-ghost-icon':    '--com-btn-ghost-icon',
  'btn-outline-fg':    '--com-btn-outline-fg',
  'btn-outline-border':'--com-btn-outline-border',
  'btn-tertiary-bg':   '--com-btn-tertiary-bg',
  'btn-tertiary-fg':   '--com-btn-tertiary-fg',
  'btn-quaternary-bg': '--com-btn-quaternary-bg',
  'btn-quaternary-fg': '--com-btn-quaternary-fg',
  'btn-destructive-bg':        '--com-btn-destructive-bg',
  'btn-destructive-fg':        '--com-btn-destructive-fg',
  'btn-destructive-ui-bg':     '--com-btn-destructive-ui-bg',
  'btn-destructive-ui-fg':     '--com-btn-destructive-ui-fg',
  'btn-destructive-ui-border': '--com-btn-destructive-ui-border',
  'btn-pill-bg':               '--com-btn-pill-bg',
  'btn-pill-fg':               '--com-btn-pill-fg',
  'btn-pill-border':           '--com-btn-pill-border',
  'btn-pill-active-bg':        '--com-btn-pill-active-bg',
  'btn-pill-active-fg':        '--com-btn-pill-active-fg',
  'btn-pill-active-border':    '--com-btn-pill-active-border',
  'btn-pill-disabled-bg':      '--com-btn-pill-disabled-bg',
  'btn-pill-disabled-fg':      '--com-btn-pill-disabled-fg',
  'btn-pill-disabled-border':  '--com-btn-pill-disabled-border',
};

/* ─── Pathway button defaults — light & dark surface variants ── */
const BTN_LIGHT = {
  'btn-primary-bg': '--prim-mint-400',  'btn-primary-fg': '--prim-mono-white',
  'btn-dark-bg':    '--prim-mono-900',  'btn-dark-fg':    '--prim-mono-white',
  'btn-ghost-fg':   '--prim-mono-900',  'btn-ghost-icon': '--prim-mint-400',
  'btn-outline-fg': '--prim-mono-900',  'btn-outline-border': '--prim-mono-300',
  'btn-tertiary-bg': '--prim-mint-700', 'btn-tertiary-fg': '--prim-mint-150',
  'btn-quaternary-bg': '--prim-mono-white', 'btn-quaternary-fg': '--prim-mono-black',
  'btn-destructive-bg': '#ef4444', 'btn-destructive-fg': '--prim-mono-white',
  'btn-destructive-ui-bg': 'transparent', 'btn-destructive-ui-fg': '#ef4444', 'btn-destructive-ui-border': '#ef4444',
  'btn-pill-bg': 'transparent', 'btn-pill-fg': '--prim-mono-900', 'btn-pill-border': '--prim-mono-300',
  'btn-pill-active-bg': '--prim-mono-900', 'btn-pill-active-fg': '--prim-mono-white', 'btn-pill-active-border': '--prim-mono-900',
  'btn-pill-disabled-bg': 'transparent', 'btn-pill-disabled-fg': '--prim-mono-350', 'btn-pill-disabled-border': '--prim-mono-200',
};
const BTN_DARK = {
  'btn-primary-bg': '--prim-fall-100',  'btn-primary-fg': '--prim-mono-white',
  'btn-dark-bg':    '--prim-mono-600',  'btn-dark-fg':    '--prim-mono-white',
  'btn-ghost-fg':   '--prim-mono-300',  'btn-ghost-icon': '--prim-mono-350',
  'btn-outline-fg': '--prim-mono-350',  'btn-outline-border': '--prim-mono-500',
  'btn-tertiary-bg': '--prim-mint-700', 'btn-tertiary-fg': '--prim-mint-150',
  'btn-quaternary-bg': '--prim-mono-white', 'btn-quaternary-fg': '--prim-mono-black',
  'btn-destructive-bg': '#dc2626', 'btn-destructive-fg': '--prim-mono-white',
  'btn-destructive-ui-bg': 'transparent', 'btn-destructive-ui-fg': '#f87171', 'btn-destructive-ui-border': '#f87171',
  'btn-pill-bg': 'transparent', 'btn-pill-fg': '--prim-mono-white', 'btn-pill-border': '--prim-mono-500',
  'btn-pill-active-bg': '--prim-mono-white', 'btn-pill-active-fg': '--prim-mono-900', 'btn-pill-active-border': '--prim-mono-white',
  'btn-pill-disabled-bg': 'transparent', 'btn-pill-disabled-fg': '--prim-mono-600', 'btn-pill-disabled-border': '--prim-mono-700',
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

/* ─── Input field tokens for surfaces ───────────────────────── */
function inputTokens(prefix, bg, border, text, placeholder) {
  return {
    [`${prefix}input-bg`]: bg,
    [`${prefix}input-border`]: border,
    [`${prefix}input-text`]: text,
    [`${prefix}input-placeholder`]: placeholder,
  };
}

/* ─── Per-role type color tokens for surfaces ───────────────── */
function typeRoleTokens(prefix, headingVal, bodyVal, mutedVal) {
  return {
    [`${prefix}h1`]: headingVal,
    [`${prefix}h2`]: headingVal,
    [`${prefix}h3`]: headingVal,
    [`${prefix}h4`]: headingVal,
    [`${prefix}body-lg`]: bodyVal,
    [`${prefix}body-sm`]: mutedVal,
    [`${prefix}ui-xl`]: headingVal,
    [`${prefix}ui-lg`]: headingVal,
    [`${prefix}ui-md`]: bodyVal,
    [`${prefix}ui-sm`]: bodyVal,
    [`${prefix}ui-xsm`]: mutedVal,
  };
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
      '--color-statement-link-bg':     '--prim-mono-100',
      '--color-statement-link-border': '--prim-mono-350',
      '--color-statement-link-text':   '--prim-mono-700',
      '--color-activity-bell':       '--prim-mono-900',
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
      '--color-guide-nav-bg':     '--prim-mono-white',
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
        '--color-muted-lg':       '--prim-mono-750',
        '--color-muted-sm':       '--prim-mono-750',
        '--color-border':         '--prim-mono-100',
        '--color-border-light':   '--prim-mono-150',
        '--color-border-mid':     '--prim-mono-250',
        '--color-border-subtle':  '--prim-mono-350',
        '--color-callout-border': '--prim-mono-500',
        '--color-placeholder':    '--prim-mono-200',
        '--color-logo':           '--prim-mono-900',
        '--color-link':           '--prim-mono-700',
        '--color-link-lg':        '--prim-mono-700',
        '--color-link-sm':        '--prim-mono-700',
        '--color-pill':           '--prim-mono-900',
        '--color-pill-lg':        '--prim-mono-900',
        '--color-pill-md':        '--prim-mono-900',
        '--color-pill-sm':        '--prim-mono-900',
        '--color-accent':         '--prim-mono-700',
        '--color-pill-bg':        '--prim-mono-white',
        '--color-pill-border':    '--prim-mono-900',
        '--color-tag-fill':       '--prim-mono-150',
        '--color-scrollbar-thumb': '--prim-mono-300',
        '--color-scrollbar-track': '--prim-mono-100',
      ...btnDefaultTokens(BTN_LIGHT),
      ...typeRoleTokens('--color-', '--prim-mono-900', '--prim-mono-600', '--prim-mono-750'),
      ...inputTokens('--color-', '--prim-mono-white', '--prim-mono-200', '--prim-mono-900', '--prim-mono-350'),
      },
      muted: {
        '--sf-muted-bg':             '--prim-mono-50',
        '--sf-muted-heading':        '--prim-mono-900',
        '--sf-muted-body':           '--prim-mono-600',
        '--sf-muted-text-muted':     '--prim-mono-750',
        '--sf-muted-text-muted-lg':  '--prim-mono-750',
        '--sf-muted-text-muted-sm':  '--prim-mono-750',
        '--sf-muted-border':         '--prim-mono-100',
        '--sf-muted-border-light':   '--prim-mono-150',
        '--sf-muted-border-mid':     '--prim-mono-250',
        '--sf-muted-border-subtle':  '--prim-mono-350',
        '--sf-muted-callout-border': '--prim-mono-500',
        '--sf-muted-placeholder':    '--prim-mono-200',
        '--sf-muted-logo':           '--prim-mono-900',
        '--sf-muted-link':           '--prim-mono-700',
        '--sf-muted-link-lg':        '--prim-mono-700',
        '--sf-muted-link-sm':        '--prim-mono-700',
        '--sf-muted-pill':           '--prim-mono-900',
        '--sf-muted-pill-lg':        '--prim-mono-900',
        '--sf-muted-pill-md':        '--prim-mono-900',
        '--sf-muted-pill-sm':        '--prim-mono-900',
        '--sf-muted-accent':         '--prim-mono-700',
        '--sf-muted-pill-bg':        '--prim-mono-50',
        '--sf-muted-pill-border':    '--prim-mono-900',
        '--sf-muted-tag-fill':       '--prim-mono-150',
        '--sf-muted-scrollbar-thumb': '--prim-mono-300',
        '--sf-muted-scrollbar-track': '--prim-mono-100',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
        ...typeRoleTokens('--sf-muted-', '--prim-mono-900', '--prim-mono-600', '--prim-mono-750'),
        ...inputTokens('--sf-muted-', '--prim-mono-white', '--prim-mono-200', '--prim-mono-900', '--prim-mono-350'),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-mono-900',
        '--sf-inverse-heading':        '--prim-mono-white',
        '--sf-inverse-body':           '--prim-mono-200',
        '--sf-inverse-text-muted':     '--prim-mono-350',
        '--sf-inverse-text-muted-lg':  '--prim-mono-350',
        '--sf-inverse-text-muted-sm':  '--prim-mono-350',
        '--sf-inverse-border':         '--prim-mono-700',
        '--sf-inverse-border-light':   '--prim-mono-750',
        '--sf-inverse-border-mid':     '--prim-mono-550',
        '--sf-inverse-border-subtle':  '--prim-mono-500',
        '--sf-inverse-callout-border': '--prim-mono-350',
        '--sf-inverse-placeholder':    '--prim-mono-700',
        '--sf-inverse-logo':           '--prim-mono-white',
        '--sf-inverse-link':           '--prim-mono-300',
        '--sf-inverse-link-lg':        '--prim-mono-300',
        '--sf-inverse-link-sm':        '--prim-mono-300',
        '--sf-inverse-pill':           '--prim-mono-white',
        '--sf-inverse-pill-lg':        '--prim-mono-white',
        '--sf-inverse-pill-md':        '--prim-mono-white',
        '--sf-inverse-pill-sm':        '--prim-mono-white',
        '--sf-inverse-accent':         '--prim-mono-500',
        '--sf-inverse-pill-bg':        '--prim-mono-900',
        '--sf-inverse-pill-border':    '--prim-mono-white',
        '--sf-inverse-tag-fill':     '--prim-mono-750',
        '--sf-inverse-scrollbar-thumb': '--prim-mono-550',
        '--sf-inverse-scrollbar-track': '--prim-mono-750',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
        ...typeRoleTokens('--sf-inverse-', '--prim-mono-white', '--prim-mono-200', '--prim-mono-350'),
        ...inputTokens('--sf-inverse-', '--prim-mono-800', '--prim-mono-600', '--prim-mono-white', '--prim-mono-500'),
      },
      accent: {
        '--sf-accent-bg':             '--prim-mono-700',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-mono-100',
        '--sf-accent-text-muted':     '--prim-mono-250',
        '--sf-accent-text-muted-lg':  '--prim-mono-250',
        '--sf-accent-text-muted-sm':  '--prim-mono-250',
        '--sf-accent-border':         '--prim-mono-550',
        '--sf-accent-border-light':   '--prim-mono-600',
        '--sf-accent-border-mid':     '--prim-mono-400',
        '--sf-accent-border-subtle':  '--prim-mono-350',
        '--sf-accent-callout-border': '--prim-mono-250',
        '--sf-accent-placeholder':    '--prim-mono-600',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-mono-300',
        '--sf-accent-link-lg':        '--prim-mono-300',
        '--sf-accent-link-sm':        '--prim-mono-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-pill-lg':        '--prim-mono-white',
        '--sf-accent-pill-md':        '--prim-mono-white',
        '--sf-accent-pill-sm':        '--prim-mono-white',
        '--sf-accent-accent':         '--prim-mono-900',
        '--sf-accent-pill-bg':        '--prim-mono-700',
        '--sf-accent-pill-border':    '--prim-mono-white',
        '--sf-accent-tag-fill':      '--prim-mono-600',
        '--sf-accent-scrollbar-thumb': '--prim-mono-400',
        '--sf-accent-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
        ...typeRoleTokens('--sf-accent-', '--prim-mono-white', '--prim-mono-100', '--prim-mono-250'),
        ...inputTokens('--sf-accent-', '--prim-mono-600', '--prim-mono-500', '--prim-mono-white', '--prim-mono-400'),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-mono-750',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-200',
        '--sf-tertiary-text-muted':     '--prim-mono-350',
        '--sf-tertiary-text-muted-lg':  '--prim-mono-350',
        '--sf-tertiary-text-muted-sm':  '--prim-mono-350',
        '--sf-tertiary-border':         '--prim-mono-600',
        '--sf-tertiary-border-light':   '--prim-mono-700',
        '--sf-tertiary-border-mid':     '--prim-mono-550',
        '--sf-tertiary-border-subtle':  '--prim-mono-500',
        '--sf-tertiary-callout-border': '--prim-mono-300',
        '--sf-tertiary-placeholder':    '--prim-mono-600',
        '--sf-tertiary-logo':           '--prim-mono-white',
        '--sf-tertiary-link':           '--prim-mono-200',
        '--sf-tertiary-link-lg':        '--prim-mono-200',
        '--sf-tertiary-link-sm':        '--prim-mono-200',
        '--sf-tertiary-pill':           '--prim-mono-white',
        '--sf-tertiary-pill-lg':        '--prim-mono-white',
        '--sf-tertiary-pill-md':        '--prim-mono-white',
        '--sf-tertiary-pill-sm':        '--prim-mono-white',
        '--sf-tertiary-accent':         '--prim-mono-500',
        '--sf-tertiary-pill-bg':        '--prim-mono-750',
        '--sf-tertiary-pill-border':    '--prim-mono-white',
        '--sf-tertiary-tag-fill':    '--prim-mono-700',
        '--sf-tertiary-scrollbar-thumb': '--prim-mono-400',
        '--sf-tertiary-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
        ...typeRoleTokens('--sf-tertiary-', '--prim-mono-white', '--prim-mono-200', '--prim-mono-350'),
        ...inputTokens('--sf-tertiary-', '--prim-mono-700', '--prim-mono-550', '--prim-mono-white', '--prim-mono-500'),
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
      '--color-statement-link-bg':     '--prim-butter-700',
      '--color-statement-link-border': '--prim-orange-300',
      '--color-statement-link-text':   '--prim-sapphire-700',
      '--color-activity-bell':       '--prim-sapphire-500',
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
      '--color-guide-nav-bg':     '--prim-mono-white',
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
        '--color-muted-lg':       '--prim-sapphire-700',
        '--color-muted-sm':       '--prim-sapphire-700',
        '--color-border':         '--prim-orange-50',
        '--color-border-light':   '--prim-butter-700',
        '--color-border-mid':     '--prim-butter-900',
        '--color-border-subtle':  '--prim-splash-300',
        '--color-callout-border': '--prim-splash-700',
        '--color-placeholder':    '--prim-splash-300',
        '--color-logo':           '--prim-sapphire-400',
        '--color-link':           '--prim-splash-700',
        '--color-link-lg':        '--prim-splash-700',
        '--color-link-sm':        '--prim-splash-700',
        '--color-pill':           '--prim-orange-500',
        '--color-pill-lg':        '--prim-orange-500',
        '--color-pill-md':        '--prim-orange-500',
        '--color-pill-sm':        '--prim-orange-500',
        '--color-accent':         '--prim-orange-300',
        '--color-pill-bg':        '--prim-mono-white',
        '--color-pill-border':    '--prim-orange-500',
        '--color-tag-fill':       '--prim-butter-700',
        '--color-scrollbar-thumb': '--prim-mono-300',
        '--color-scrollbar-track': '--prim-mono-100',
      ...btnDefaultTokens(BTN_LIGHT),
      ...typeRoleTokens('--color-', '--prim-sapphire-500', '--prim-sapphire-500', '--prim-sapphire-700'),
      ...inputTokens('--color-', '--prim-mono-white', '--prim-splash-300', '--prim-sapphire-500', '--prim-splash-300'),
      },
      muted: {
        '--sf-muted-bg':             '--prim-splash-50',
        '--sf-muted-heading':        '--prim-sapphire-600',
        '--sf-muted-body':           '--prim-sapphire-700',
        '--sf-muted-text-muted':     '--prim-sapphire-500',
        '--sf-muted-text-muted-lg':  '--prim-sapphire-500',
        '--sf-muted-text-muted-sm':  '--prim-sapphire-500',
        '--sf-muted-border':         '--prim-butter-900',
        '--sf-muted-border-light':   '--prim-splash-200',
        '--sf-muted-border-mid':     '--prim-butter-900',
        '--sf-muted-border-subtle':  '--prim-orange-300',
        '--sf-muted-callout-border': '--prim-sapphire-300',
        '--sf-muted-placeholder':    '--prim-splash-300',
        '--sf-muted-logo':           '--prim-sapphire-900',
        '--sf-muted-link':           '--prim-splash-700',
        '--sf-muted-link-lg':        '--prim-splash-700',
        '--sf-muted-link-sm':        '--prim-splash-700',
        '--sf-muted-pill':           '--prim-sapphire-900',
        '--sf-muted-pill-lg':        '--prim-sapphire-900',
        '--sf-muted-pill-md':        '--prim-sapphire-900',
        '--sf-muted-pill-sm':        '--prim-sapphire-900',
        '--sf-muted-accent':         '--prim-orange-300',
        '--sf-muted-pill-bg':        '--prim-splash-50',
        '--sf-muted-pill-border':    '--prim-sapphire-900',
        '--sf-muted-tag-fill':       '--prim-splash-200',
        '--sf-muted-scrollbar-thumb': '--prim-mono-300',
        '--sf-muted-scrollbar-track': '--prim-mono-100',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
        ...typeRoleTokens('--sf-muted-', '--prim-sapphire-600', '--prim-sapphire-700', '--prim-sapphire-500'),
        ...inputTokens('--sf-muted-', '--prim-mono-white', '--prim-splash-300', '--prim-sapphire-600', '--prim-splash-300'),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-sapphire-900',
        '--sf-inverse-heading':        '--prim-butter-500',
        '--sf-inverse-body':           '--prim-butter-700',
        '--sf-inverse-text-muted':     '--prim-butter-900',
        '--sf-inverse-text-muted-lg':  '--prim-butter-900',
        '--sf-inverse-text-muted-sm':  '--prim-butter-900',
        '--sf-inverse-border':         '--prim-sapphire-700',
        '--sf-inverse-border-light':   '--prim-sapphire-700',
        '--sf-inverse-border-mid':     '--prim-sapphire-500',
        '--sf-inverse-border-subtle':  '--prim-sapphire-300',
        '--sf-inverse-callout-border': '--prim-orange-300',
        '--sf-inverse-placeholder':    '--prim-sapphire-700',
        '--sf-inverse-logo':           '--prim-butter-500',
        '--sf-inverse-link':           '--prim-splash-500',
        '--sf-inverse-link-lg':        '--prim-splash-500',
        '--sf-inverse-link-sm':        '--prim-splash-500',
        '--sf-inverse-pill':           '--prim-butter-500',
        '--sf-inverse-pill-lg':        '--prim-butter-500',
        '--sf-inverse-pill-md':        '--prim-butter-500',
        '--sf-inverse-pill-sm':        '--prim-butter-500',
        '--sf-inverse-accent':         '--prim-orange-300',
        '--sf-inverse-pill-bg':        '--prim-sapphire-900',
        '--sf-inverse-pill-border':    '--prim-butter-500',
        '--sf-inverse-tag-fill':     '--prim-sapphire-700',
        '--sf-inverse-scrollbar-thumb': '--prim-mono-550',
        '--sf-inverse-scrollbar-track': '--prim-mono-750',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
        ...typeRoleTokens('--sf-inverse-', '--prim-butter-500', '--prim-butter-700', '--prim-butter-900'),
        ...inputTokens('--sf-inverse-', '--prim-sapphire-800', '--prim-sapphire-500', '--prim-butter-500', '--prim-sapphire-500'),
      },
      accent: {
        '--sf-accent-bg':             '--prim-orange-500',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-butter-500',
        '--sf-accent-text-muted':     '--prim-butter-700',
        '--sf-accent-text-muted-lg':  '--prim-butter-700',
        '--sf-accent-text-muted-sm':  '--prim-butter-700',
        '--sf-accent-border':         '--prim-orange-700',
        '--sf-accent-border-light':   '--prim-orange-500',
        '--sf-accent-border-mid':     '--prim-orange-700',
        '--sf-accent-border-subtle':  '--prim-orange-900',
        '--sf-accent-callout-border': '--prim-splash-700',
        '--sf-accent-placeholder':    '--prim-orange-700',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-splash-300',
        '--sf-accent-link-lg':        '--prim-splash-300',
        '--sf-accent-link-sm':        '--prim-splash-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-pill-lg':        '--prim-mono-white',
        '--sf-accent-pill-md':        '--prim-mono-white',
        '--sf-accent-pill-sm':        '--prim-mono-white',
        '--sf-accent-accent':         '--prim-orange-900',
        '--sf-accent-pill-bg':        '--prim-orange-500',
        '--sf-accent-pill-border':    '--prim-mono-white',
        '--sf-accent-tag-fill':      '--prim-orange-500',
        '--sf-accent-scrollbar-thumb': '--prim-mono-400',
        '--sf-accent-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
        ...typeRoleTokens('--sf-accent-', '--prim-mono-white', '--prim-butter-500', '--prim-butter-700'),
        ...inputTokens('--sf-accent-', '--prim-orange-700', '--prim-orange-900', '--prim-mono-white', '--prim-orange-700'),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-sapphire-800',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-white',
        '--sf-tertiary-text-muted':     '--prim-splash-200',
        '--sf-tertiary-text-muted-lg':  '--prim-splash-200',
        '--sf-tertiary-text-muted-sm':  '--prim-splash-200',
        '--sf-tertiary-border':         '--prim-sapphire-400',
        '--sf-tertiary-border-light':   '--prim-sapphire-500',
        '--sf-tertiary-border-mid':     '--prim-sapphire-300',
        '--sf-tertiary-border-subtle':  '--prim-sapphire-200',
        '--sf-tertiary-callout-border': '--prim-splash-700',
        '--sf-tertiary-placeholder':    '--prim-mono-black',
        '--sf-tertiary-logo':           '--prim-mono-black',
        '--sf-tertiary-link':           '--prim-splash-500',
        '--sf-tertiary-link-lg':        '--prim-splash-500',
        '--sf-tertiary-link-sm':        '--prim-splash-500',
        '--sf-tertiary-pill':           '--prim-splash-300',
        '--sf-tertiary-pill-lg':        '--prim-splash-300',
        '--sf-tertiary-pill-md':        '--prim-splash-300',
        '--sf-tertiary-pill-sm':        '--prim-splash-300',
        '--sf-tertiary-accent':         '--prim-orange-300',
        '--sf-tertiary-pill-bg':        '--prim-sapphire-800',
        '--sf-tertiary-pill-border':    '--prim-splash-300',
        '--sf-tertiary-tag-fill':    '--prim-sapphire-500',
        '--sf-tertiary-scrollbar-thumb': '--prim-mono-400',
        '--sf-tertiary-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
        ...typeRoleTokens('--sf-tertiary-', '--prim-mono-white', '--prim-mono-white', '--prim-splash-200'),
        ...inputTokens('--sf-tertiary-', '--prim-sapphire-700', '--prim-sapphire-400', '--prim-mono-white', '--prim-sapphire-400'),
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
      '--color-statement-link-bg':     '--prim-butter-700',
      '--color-statement-link-border': '--prim-orange-300',
      '--color-statement-link-text':   '--prim-sapphire-700',
      '--color-activity-bell':       '--prim-sapphire-500',
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
      '--color-guide-nav-bg':     '--prim-mono-white',
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
        '--color-muted-lg':       '--prim-sapphire-700',
        '--color-muted-sm':       '--prim-sapphire-700',
        '--color-border':         '--prim-orange-50',
        '--color-border-light':   '--prim-butter-700',
        '--color-border-mid':     '--prim-butter-900',
        '--color-border-subtle':  '--prim-splash-300',
        '--color-callout-border': '--prim-splash-700',
        '--color-placeholder':    '--prim-splash-300',
        '--color-logo':           '--prim-sapphire-400',
        '--color-link':           '--prim-splash-700',
        '--color-link-lg':        '--prim-splash-700',
        '--color-link-sm':        '--prim-splash-700',
        '--color-pill':           '--prim-orange-500',
        '--color-pill-lg':        '--prim-orange-500',
        '--color-pill-md':        '--prim-orange-500',
        '--color-pill-sm':        '--prim-orange-500',
        '--color-accent':         '--prim-orange-300',
        '--color-pill-bg':        '--prim-mono-white',
        '--color-pill-border':    '--prim-orange-500',
        '--color-tag-fill':       '--prim-butter-700',
        '--color-scrollbar-thumb': '--prim-mono-300',
        '--color-scrollbar-track': '--prim-mono-100',
      ...btnDefaultTokens(BTN_LIGHT),
      ...typeRoleTokens('--color-', '--prim-sapphire-500', '--prim-sapphire-500', '--prim-sapphire-700'),
      ...inputTokens('--color-', '--prim-mono-white', '--prim-splash-300', '--prim-sapphire-500', '--prim-splash-300'),
      },
      muted: {
        '--sf-muted-bg':             '--prim-splash-50',
        '--sf-muted-heading':        '--prim-sapphire-600',
        '--sf-muted-body':           '--prim-sapphire-700',
        '--sf-muted-text-muted':     '--prim-sapphire-500',
        '--sf-muted-text-muted-lg':  '--prim-sapphire-500',
        '--sf-muted-text-muted-sm':  '--prim-sapphire-500',
        '--sf-muted-border':         '--prim-butter-900',
        '--sf-muted-border-light':   '--prim-splash-200',
        '--sf-muted-border-mid':     '--prim-butter-900',
        '--sf-muted-border-subtle':  '--prim-orange-300',
        '--sf-muted-callout-border': '--prim-sapphire-300',
        '--sf-muted-placeholder':    '--prim-splash-300',
        '--sf-muted-logo':           '--prim-sapphire-900',
        '--sf-muted-link':           '--prim-splash-700',
        '--sf-muted-link-lg':        '--prim-splash-700',
        '--sf-muted-link-sm':        '--prim-splash-700',
        '--sf-muted-pill':           '--prim-sapphire-900',
        '--sf-muted-pill-lg':        '--prim-sapphire-900',
        '--sf-muted-pill-md':        '--prim-sapphire-900',
        '--sf-muted-pill-sm':        '--prim-sapphire-900',
        '--sf-muted-accent':         '--prim-orange-300',
        '--sf-muted-pill-bg':        '--prim-splash-50',
        '--sf-muted-pill-border':    '--prim-sapphire-900',
        '--sf-muted-tag-fill':       '--prim-splash-200',
        '--sf-muted-scrollbar-thumb': '--prim-mono-300',
        '--sf-muted-scrollbar-track': '--prim-mono-100',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
        ...typeRoleTokens('--sf-muted-', '--prim-sapphire-600', '--prim-sapphire-700', '--prim-sapphire-500'),
        ...inputTokens('--sf-muted-', '--prim-mono-white', '--prim-splash-300', '--prim-sapphire-600', '--prim-splash-300'),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-sapphire-900',
        '--sf-inverse-heading':        '--prim-butter-500',
        '--sf-inverse-body':           '--prim-butter-700',
        '--sf-inverse-text-muted':     '--prim-butter-900',
        '--sf-inverse-text-muted-lg':  '--prim-butter-900',
        '--sf-inverse-text-muted-sm':  '--prim-butter-900',
        '--sf-inverse-border':         '--prim-sapphire-700',
        '--sf-inverse-border-light':   '--prim-sapphire-700',
        '--sf-inverse-border-mid':     '--prim-sapphire-500',
        '--sf-inverse-border-subtle':  '--prim-sapphire-300',
        '--sf-inverse-callout-border': '--prim-orange-300',
        '--sf-inverse-placeholder':    '--prim-sapphire-700',
        '--sf-inverse-logo':           '--prim-butter-500',
        '--sf-inverse-link':           '--prim-splash-500',
        '--sf-inverse-link-lg':        '--prim-splash-500',
        '--sf-inverse-link-sm':        '--prim-splash-500',
        '--sf-inverse-pill':           '--prim-butter-500',
        '--sf-inverse-pill-lg':        '--prim-butter-500',
        '--sf-inverse-pill-md':        '--prim-butter-500',
        '--sf-inverse-pill-sm':        '--prim-butter-500',
        '--sf-inverse-accent':         '--prim-orange-300',
        '--sf-inverse-pill-bg':        '--prim-sapphire-900',
        '--sf-inverse-pill-border':    '--prim-butter-500',
        '--sf-inverse-tag-fill':     '--prim-sapphire-700',
        '--sf-inverse-scrollbar-thumb': '--prim-mono-550',
        '--sf-inverse-scrollbar-track': '--prim-mono-750',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
        ...typeRoleTokens('--sf-inverse-', '--prim-butter-500', '--prim-butter-700', '--prim-butter-900'),
        ...inputTokens('--sf-inverse-', '--prim-sapphire-800', '--prim-sapphire-500', '--prim-butter-500', '--prim-sapphire-500'),
      },
      accent: {
        '--sf-accent-bg':             '--prim-orange-500',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-butter-500',
        '--sf-accent-text-muted':     '--prim-butter-700',
        '--sf-accent-text-muted-lg':  '--prim-butter-700',
        '--sf-accent-text-muted-sm':  '--prim-butter-700',
        '--sf-accent-border':         '--prim-orange-700',
        '--sf-accent-border-light':   '--prim-orange-500',
        '--sf-accent-border-mid':     '--prim-orange-700',
        '--sf-accent-border-subtle':  '--prim-orange-900',
        '--sf-accent-callout-border': '--prim-splash-700',
        '--sf-accent-placeholder':    '--prim-orange-700',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-splash-300',
        '--sf-accent-link-lg':        '--prim-splash-300',
        '--sf-accent-link-sm':        '--prim-splash-300',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-pill-lg':        '--prim-mono-white',
        '--sf-accent-pill-md':        '--prim-mono-white',
        '--sf-accent-pill-sm':        '--prim-mono-white',
        '--sf-accent-accent':         '--prim-orange-900',
        '--sf-accent-pill-bg':        '--prim-orange-500',
        '--sf-accent-pill-border':    '--prim-mono-white',
        '--sf-accent-tag-fill':      '--prim-orange-500',
        '--sf-accent-scrollbar-thumb': '--prim-mono-400',
        '--sf-accent-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
        ...typeRoleTokens('--sf-accent-', '--prim-mono-white', '--prim-butter-500', '--prim-butter-700'),
        ...inputTokens('--sf-accent-', '--prim-orange-700', '--prim-orange-900', '--prim-mono-white', '--prim-orange-700'),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-sapphire-800',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mono-white',
        '--sf-tertiary-text-muted':     '--prim-splash-200',
        '--sf-tertiary-text-muted-lg':  '--prim-splash-200',
        '--sf-tertiary-text-muted-sm':  '--prim-splash-200',
        '--sf-tertiary-border':         '--prim-sapphire-400',
        '--sf-tertiary-border-light':   '--prim-sapphire-500',
        '--sf-tertiary-border-mid':     '--prim-sapphire-300',
        '--sf-tertiary-border-subtle':  '--prim-sapphire-200',
        '--sf-tertiary-callout-border': '--prim-splash-700',
        '--sf-tertiary-placeholder':    '--prim-mono-black',
        '--sf-tertiary-logo':           '--prim-mono-black',
        '--sf-tertiary-link':           '--prim-splash-500',
        '--sf-tertiary-link-lg':        '--prim-splash-500',
        '--sf-tertiary-link-sm':        '--prim-splash-500',
        '--sf-tertiary-pill':           '--prim-splash-300',
        '--sf-tertiary-pill-lg':        '--prim-splash-300',
        '--sf-tertiary-pill-md':        '--prim-splash-300',
        '--sf-tertiary-pill-sm':        '--prim-splash-300',
        '--sf-tertiary-accent':         '--prim-orange-300',
        '--sf-tertiary-pill-bg':        '--prim-sapphire-800',
        '--sf-tertiary-pill-border':    '--prim-splash-300',
        '--sf-tertiary-tag-fill':    '--prim-sapphire-500',
        '--sf-tertiary-scrollbar-thumb': '--prim-mono-400',
        '--sf-tertiary-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
        ...typeRoleTokens('--sf-tertiary-', '--prim-mono-white', '--prim-mono-white', '--prim-splash-200'),
        ...inputTokens('--sf-tertiary-', '--prim-sapphire-700', '--prim-sapphire-400', '--prim-mono-white', '--prim-sapphire-400'),
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
      '--color-statement-link-bg':     '--prim-mint-100',
      '--color-statement-link-border': '--prim-fall-300',
      '--color-statement-link-text':   '--prim-mint-700',
      '--color-activity-bell':       '--prim-mint-900',
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
      '--color-guide-nav-bg':     '--prim-mono-white',
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
        '--color-muted-lg':       '--prim-fall-700',
        '--color-muted-sm':       '--prim-fall-700',
        '--color-border':         '--prim-mint-100',
        '--color-border-light':   '--prim-mint-200',
        '--color-border-mid':     '--prim-fall-300',
        '--color-border-subtle':  '--prim-fall-500',
        '--color-callout-border': '--prim-mint-500',
        '--color-placeholder':    '--prim-mint-200',
        '--color-logo':           '--prim-mint-900',
        '--color-link':           '--prim-mint-600',
        '--color-link-lg':        '--prim-mint-600',
        '--color-link-sm':        '--prim-mint-600',
        '--color-pill':           '--prim-mint-700',
        '--color-pill-lg':        '--prim-mint-700',
        '--color-pill-md':        '--prim-mint-700',
        '--color-pill-sm':        '--prim-mint-700',
        '--color-accent':         '--prim-mint-500',
        '--color-pill-bg':        '--prim-mono-white',
        '--color-pill-border':    '--prim-mint-700',
        '--color-tag-fill':       '--prim-mint-200',
        '--color-scrollbar-thumb': '--prim-mono-300',
        '--color-scrollbar-track': '--prim-mono-100',
      ...btnDefaultTokens(BTN_LIGHT),
      ...typeRoleTokens('--color-', '--prim-mint-900', '--prim-fall-900', '--prim-fall-700'),
      ...inputTokens('--color-', '--prim-mono-white', '--prim-mint-200', '--prim-mint-900', '--prim-mint-300'),
      },
      muted: {
        '--sf-muted-bg':             '--prim-mint-100',
        '--sf-muted-heading':        '--prim-mint-900',
        '--sf-muted-body':           '--prim-fall-900',
        '--sf-muted-text-muted':     '--prim-fall-700',
        '--sf-muted-text-muted-lg':  '--prim-fall-700',
        '--sf-muted-text-muted-sm':  '--prim-fall-700',
        '--sf-muted-border':         '--prim-mint-200',
        '--sf-muted-border-light':   '--prim-mint-200',
        '--sf-muted-border-mid':     '--prim-fall-300',
        '--sf-muted-border-subtle':  '--prim-fall-500',
        '--sf-muted-callout-border': '--prim-mint-500',
        '--sf-muted-placeholder':    '--prim-mint-300',
        '--sf-muted-logo':           '--prim-mint-900',
        '--sf-muted-link':           '--prim-mint-600',
        '--sf-muted-link-lg':        '--prim-mint-600',
        '--sf-muted-link-sm':        '--prim-mint-600',
        '--sf-muted-pill':           '--prim-mint-900',
        '--sf-muted-pill-lg':        '--prim-mint-900',
        '--sf-muted-pill-md':        '--prim-mint-900',
        '--sf-muted-pill-sm':        '--prim-mint-900',
        '--sf-muted-accent':         '--prim-mint-500',
        '--sf-muted-pill-bg':        '--prim-mint-100',
        '--sf-muted-pill-border':    '--prim-mint-900',
        '--sf-muted-tag-fill':       '--prim-mint-200',
        '--sf-muted-scrollbar-thumb': '--prim-mono-300',
        '--sf-muted-scrollbar-track': '--prim-mono-100',
        ...btnSurfaceTokens('--sf-muted-', BTN_LIGHT),
        ...typeRoleTokens('--sf-muted-', '--prim-mint-900', '--prim-fall-900', '--prim-fall-700'),
        ...inputTokens('--sf-muted-', '--prim-mono-white', '--prim-mint-200', '--prim-mint-900', '--prim-mint-300'),
      },
      inverse: {
        '--sf-inverse-bg':             '--prim-mint-800',
        '--sf-inverse-heading':        '--prim-mono-white',
        '--sf-inverse-body':           '--prim-mint-200',
        '--sf-inverse-text-muted':     '--prim-mint-300',
        '--sf-inverse-text-muted-lg':  '--prim-mint-300',
        '--sf-inverse-text-muted-sm':  '--prim-mint-300',
        '--sf-inverse-border':         '--prim-mint-700',
        '--sf-inverse-border-light':   '--prim-mint-700',
        '--sf-inverse-border-mid':     '--prim-mint-600',
        '--sf-inverse-border-subtle':  '--prim-mint-500',
        '--sf-inverse-callout-border': '--prim-fall-300',
        '--sf-inverse-placeholder':    '--prim-mint-700',
        '--sf-inverse-logo':           '--prim-mono-white',
        '--sf-inverse-link':           '--prim-mint-300',
        '--sf-inverse-link-lg':        '--prim-mint-300',
        '--sf-inverse-link-sm':        '--prim-mint-300',
        '--sf-inverse-pill':           '--prim-mono-white',
        '--sf-inverse-pill-lg':        '--prim-mono-white',
        '--sf-inverse-pill-md':        '--prim-mono-white',
        '--sf-inverse-pill-sm':        '--prim-mono-white',
        '--sf-inverse-accent':         '--prim-mint-400',
        '--sf-inverse-pill-bg':        '--prim-mint-800',
        '--sf-inverse-pill-border':    '--prim-mono-white',
        '--sf-inverse-tag-fill':     '--prim-mint-700',
        '--sf-inverse-scrollbar-thumb': '--prim-mono-550',
        '--sf-inverse-scrollbar-track': '--prim-mono-750',
        ...btnSurfaceTokens('--sf-inverse-', BTN_DARK),
        ...typeRoleTokens('--sf-inverse-', '--prim-mono-white', '--prim-mint-200', '--prim-mint-300'),
        ...inputTokens('--sf-inverse-', '--prim-mint-700', '--prim-mint-600', '--prim-mono-white', '--prim-mint-500'),
      },
      accent: {
        '--sf-accent-bg':             '--prim-mint-700',
        '--sf-accent-heading':        '--prim-mono-white',
        '--sf-accent-body':           '--prim-mint-200',
        '--sf-accent-text-muted':     '--prim-mint-300',
        '--sf-accent-text-muted-lg':  '--prim-mint-300',
        '--sf-accent-text-muted-sm':  '--prim-mint-300',
        '--sf-accent-border':         '--prim-mint-600',
        '--sf-accent-border-light':   '--prim-mint-600',
        '--sf-accent-border-mid':     '--prim-mint-500',
        '--sf-accent-border-subtle':  '--prim-mint-400',
        '--sf-accent-callout-border': '--prim-fall-300',
        '--sf-accent-placeholder':    '--prim-mint-600',
        '--sf-accent-logo':           '--prim-mono-white',
        '--sf-accent-link':           '--prim-mint-200',
        '--sf-accent-link-lg':        '--prim-mint-200',
        '--sf-accent-link-sm':        '--prim-mint-200',
        '--sf-accent-pill':           '--prim-mono-white',
        '--sf-accent-pill-lg':        '--prim-mono-white',
        '--sf-accent-pill-md':        '--prim-mono-white',
        '--sf-accent-pill-sm':        '--prim-mono-white',
        '--sf-accent-accent':         '--prim-mint-400',
        '--sf-accent-pill-bg':        '--prim-mint-700',
        '--sf-accent-pill-border':    '--prim-mono-white',
        '--sf-accent-tag-fill':      '--prim-mint-600',
        '--sf-accent-scrollbar-thumb': '--prim-mono-400',
        '--sf-accent-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-accent-', BTN_DARK),
        ...typeRoleTokens('--sf-accent-', '--prim-mono-white', '--prim-mint-200', '--prim-mint-300'),
        ...inputTokens('--sf-accent-', '--prim-mint-600', '--prim-mint-500', '--prim-mono-white', '--prim-mint-400'),
      },
      tertiary: {
        '--sf-tertiary-bg':             '--prim-mint-900',
        '--sf-tertiary-heading':        '--prim-mono-white',
        '--sf-tertiary-body':           '--prim-mint-200',
        '--sf-tertiary-text-muted':     '--prim-mint-300',
        '--sf-tertiary-text-muted-lg':  '--prim-mint-300',
        '--sf-tertiary-text-muted-sm':  '--prim-mint-300',
        '--sf-tertiary-border':         '--prim-mint-700',
        '--sf-tertiary-border-light':   '--prim-mint-800',
        '--sf-tertiary-border-mid':     '--prim-mint-600',
        '--sf-tertiary-border-subtle':  '--prim-mint-500',
        '--sf-tertiary-callout-border': '--prim-fall-300',
        '--sf-tertiary-placeholder':    '--prim-mint-700',
        '--sf-tertiary-logo':           '--prim-mono-white',
        '--sf-tertiary-link':           '--prim-mint-200',
        '--sf-tertiary-link-lg':        '--prim-mint-200',
        '--sf-tertiary-link-sm':        '--prim-mint-200',
        '--sf-tertiary-pill':           '--prim-mono-white',
        '--sf-tertiary-pill-lg':        '--prim-mono-white',
        '--sf-tertiary-pill-md':        '--prim-mono-white',
        '--sf-tertiary-pill-sm':        '--prim-mono-white',
        '--sf-tertiary-accent':         '--prim-mint-400',
        '--sf-tertiary-pill-bg':        '--prim-mint-900',
        '--sf-tertiary-pill-border':    '--prim-mono-white',
        '--sf-tertiary-tag-fill':    '--prim-mint-800',
        '--sf-tertiary-scrollbar-thumb': '--prim-mono-400',
        '--sf-tertiary-scrollbar-track': '--prim-mono-600',
        ...btnSurfaceTokens('--sf-tertiary-', BTN_DARK),
        ...typeRoleTokens('--sf-tertiary-', '--prim-mono-white', '--prim-mint-200', '--prim-mint-300'),
        ...inputTokens('--sf-tertiary-', '--prim-mint-800', '--prim-mint-700', '--prim-mono-white', '--prim-mint-600'),
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
const SURFACE_TOKENS = [
  /* Background */      'bg',
  /* Text hierarchy */  'heading', 'h1', 'h2', 'h3', 'h4', 'sh1', 'sh2', 'sh3', 'sh4',
                        'body-lg', 'body', 'body-sm',
                        'text-muted-lg', 'text-muted', 'text-muted-sm',
  /* Links */           'link-lg', 'link', 'link-sm',
  /* Borders */         'border', 'border-light', 'border-mid', 'border-subtle', 'border-active', 'callout-border',
  /* Pills & tags */    'pill', 'pill-lg', 'pill-md', 'pill-sm', 'accent',
                        'pill-bg', 'pill-border', 'tag-fill',
  /* UI text */         'ui-xl', 'ui-lg', 'ui-md', 'ui-sm', 'ui-xsm',
  /* Branding */        'logo', 'star',
  /* Form */            'placeholder',
  /* Input fields */    'input-bg', 'input-border', 'input-text', 'input-placeholder',
  /* Status */          'status-success', 'status-warning', 'status-error',
  /* Scrollbar */       'scrollbar-thumb', 'scrollbar-track',
];
const BTN_SURFACE_TOKENS = ['btn-primary-bg', 'btn-primary-fg', 'btn-dark-bg', 'btn-dark-fg', 'btn-ghost-fg', 'btn-ghost-icon', 'btn-outline-fg', 'btn-outline-border', 'btn-tertiary-bg', 'btn-tertiary-fg', 'btn-quaternary-bg', 'btn-quaternary-fg', 'btn-destructive-bg', 'btn-destructive-fg', 'btn-destructive-ui-bg', 'btn-destructive-ui-fg', 'btn-destructive-ui-border', 'btn-pill-bg', 'btn-pill-fg', 'btn-pill-border', 'btn-pill-active-bg', 'btn-pill-active-fg', 'btn-pill-active-border', 'btn-pill-disabled-bg', 'btn-pill-disabled-fg', 'btn-pill-disabled-border'];
/* Tokens that start a new visual group (separator rendered before them) */
const SURFACE_GROUP_STARTS = new Set([
  'heading', 'sh1', 'body-lg', 'text-muted-lg', 'link-lg',
  'border', 'pill', 'ui-xl', 'logo', 'placeholder', 'input-bg', 'status-success', 'scrollbar-thumb',
]);
const SURFACE_DEFS = [
  { key: 'default',  label: 'Primary',   prefix: '--color-',        bgToken: '--color-bg'          },
  { key: 'muted',    label: 'Secondary', prefix: '--sf-muted-',     bgToken: '--sf-muted-bg'       },
  { key: 'inverse',  label: 'Inverse',   prefix: '--sf-inverse-',   bgToken: '--sf-inverse-bg'     },
  { key: 'accent',   label: 'Accent',    prefix: '--sf-accent-',    bgToken: '--sf-accent-bg'      },
  { key: 'tertiary', label: 'Tertiary',  prefix: '--sf-tertiary-',  bgToken: '--sf-tertiary-bg'    },
];
/* ─── Page section registry — drives Application panel ───────── */
const PAGE_SECTIONS = {
  index: [
    { id: 'ix-left',         label: 'Left Panel (Hero/Login)',  defaultSurface: 'tertiary' },
    { id: 'ix-right',        label: 'Right Panel (Board)',      defaultSurface: 'muted' },
  ],
  'learn-hub': [
    { id: 'lh-hero',         label: 'Hero',                     defaultSurface: 'default' },
    { id: 'lh-lessons',      label: 'Lessons',                  defaultSurface: 'muted' },
  ],
  'learn-article': [
    { id: 'ls-hero',         label: 'Hero / Breadcrumb',        defaultSurface: 'default' },
    { id: 'ls-content',      label: 'Content Body',             defaultSurface: 'muted' },
  ],
  profile: [
    { id: 'pp-header',       label: 'Profile Header',           defaultSurface: 'default' },
    { id: 'pp-tabs',         label: 'Tab Bar',                  defaultSurface: 'muted' },
    { id: 'pp-achievements', label: 'Achievements',             defaultSurface: 'muted' },
    { id: 'pp-history',      label: 'Game History',             defaultSurface: 'tertiary' },
    { id: 'pp-friends',      label: 'Friends',                  defaultSurface: 'muted' },
    { id: 'pp-settings',     label: 'Settings Popover',          defaultSurface: 'muted' },
  ],
  settings: [
    { id: 'st-content',      label: 'Settings Content',         defaultSurface: 'muted' },
  ],
  play: [
    { id: 'gp-board',        label: 'Game Board',               defaultSurface: 'default' },
  ],
  'surface-preview': [
    { id: 'sp-content',      label: 'Preview Content',          defaultSurface: 'muted' },
  ],
  'buttons-sheet': [
    { id: 'bs-content',      label: 'Buttons Content',          defaultSurface: 'default' },
  ],
  tokens: [
    { id: 'tk-palettes',     label: 'Color Palettes',           defaultSurface: 'default' },
    { id: 'tk-semantic',     label: 'Semantic Colors',          defaultSurface: 'muted' },
    { id: 'tk-surfaces',     label: 'Surface Classes',          defaultSurface: 'default' },
    { id: 'tk-text',         label: 'Text Styles',              defaultSurface: 'muted' },
    { id: 'tk-spacing',      label: 'Spacing',                  defaultSurface: 'default' },
    { id: 'tk-radius',       label: 'Border Radius',            defaultSurface: 'muted' },
    { id: 'tk-shadows',      label: 'Shadows',                  defaultSurface: 'default' },
    { id: 'tk-status',       label: 'Status Colors',            defaultSurface: 'muted' },
    { id: 'tk-buttons',      label: 'Buttons',                  defaultSurface: 'muted' },
    { id: 'tk-legacy-btns',  label: 'Buttons (Legacy)',         defaultSurface: 'default' },
  ],
};

const GLOBAL_SECTIONS = [
  { id: 'gl-header',          label: 'Header',           defaultSurface: 'default' },
  { id: 'gl-dropdown',        label: 'Dropdown Menu',    defaultSurface: 'default' },
  { id: 'gl-activity-center', label: 'Activity Center',  defaultSurface: 'default' },
  { id: 'gl-modal',           label: 'Modals',           defaultSurface: 'default' },
  { id: 'gl-cta',             label: 'Ready to Play',    defaultSurface: 'accent' },
  { id: 'gl-footer',          label: 'Footer',           defaultSurface: 'inverse' },
];

const SURFACE_CLASSES = ['surface-muted', 'surface-inverse', 'surface-accent', 'surface-tertiary'];

/* ─── L1 defaults ────────────────────────────────────────────── */
const DEFAULT_L1 = {
  /* font families */
  '--prim-type-h1':       'Raleway',
  '--prim-type-h2':       'Georgia',
  '--prim-type-h3':       'Raleway',
  '--prim-type-h4':       'Raleway',
  '--prim-type-body-lg':  'Inter',
  '--prim-type-body-md':  'Inter',
  '--prim-type-body-sm':  'Inter',
  /* weight (numeric), letter-spacing (hundredths of em), line-height (tenths) */
  '--prim-type-h1-weight':      '700',
  '--prim-type-h1-ls':          '-2',   /* -0.02em */
  '--prim-type-h1-lh':          '11',   /* 1.1     */
  '--prim-type-h2-weight':      '700',
  '--prim-type-h2-ls':          '-2',   /* -0.02em */
  '--prim-type-h2-lh':          '11',   /* 1.1     */
  '--prim-type-h3-weight':      '600',
  '--prim-type-h3-ls':          '-1',   /* -0.01em */
  '--prim-type-h3-lh':          '12',   /* 1.2     */
  '--prim-type-h4-weight':      '600',
  '--prim-type-h4-ls':          '0',    /* 0em     */
  '--prim-type-h4-lh':          '13',   /* 1.3     */
  '--prim-type-body-lg-weight': '400',
  '--prim-type-body-lg-ls':     '0',    /* 0em     */
  '--prim-type-body-lg-lh':     '17',   /* 1.7     */
  '--prim-type-body-md-weight': '400',
  '--prim-type-body-md-ls':     '0',    /* 0em     */
  '--prim-type-body-md-lh':     '19',   /* 1.9     */
  '--prim-type-body-sm-weight': '400',
  '--prim-type-body-sm-ls':     '0',    /* 0em     */
  '--prim-type-body-sm-lh':     '16',   /* 1.6     */
  /* pill sizes */
  '--prim-type-pill-lg':         'Inter',
  '--prim-type-pill-lg-weight':  '600',
  '--prim-type-pill-lg-ls':      '4',    /* 0.04em  */
  '--prim-type-pill-lg-lh':      '12',   /* 1.2     */
  '--prim-type-pill-md':         'Inter',
  '--prim-type-pill-md-weight':  '600',
  '--prim-type-pill-md-ls':      '4',    /* 0.04em  */
  '--prim-type-pill-md-lh':      '12',   /* 1.2     */
  '--prim-type-pill-sm':         'Inter',
  '--prim-type-pill-sm-weight':  '600',
  '--prim-type-pill-sm-ls':      '6',    /* 0.06em  */
  '--prim-type-pill-sm-lh':      '12',   /* 1.2     */
  /* subheadings */
  '--prim-type-sh1':            'Raleway',
  '--prim-type-sh1-weight':     '600',
  '--prim-type-sh1-ls':         '4',    /* 0.04em  */
  '--prim-type-sh1-lh':         '13',   /* 1.3     */
  '--prim-type-sh2':            'Raleway',
  '--prim-type-sh2-weight':     '600',
  '--prim-type-sh2-ls':         '4',    /* 0.04em  */
  '--prim-type-sh2-lh':         '13',   /* 1.3     */
  '--prim-type-sh3':            'Inter',
  '--prim-type-sh3-weight':     '500',
  '--prim-type-sh3-ls':         '6',    /* 0.06em  */
  '--prim-type-sh3-lh':         '14',   /* 1.4     */
  '--prim-type-sh4':            'Inter',
  '--prim-type-sh4-weight':     '500',
  '--prim-type-sh4-ls':         '6',    /* 0.06em  */
  '--prim-type-sh4-lh':         '14',   /* 1.4     */
  /* UI roles */
  '--prim-type-ui-xl':          'Inter',
  '--prim-type-ui-xl-weight':   '600',
  '--prim-type-ui-xl-ls':       '0',    /* 0em     */
  '--prim-type-ui-xl-lh':       '12',   /* 1.2     */
  '--prim-type-ui-lg':          'Inter',
  '--prim-type-ui-lg-weight':   '600',
  '--prim-type-ui-lg-ls':       '0',    /* 0em     */
  '--prim-type-ui-lg-lh':       '12',   /* 1.2     */
  '--prim-type-ui-md':          'Inter',
  '--prim-type-ui-md-weight':   '500',
  '--prim-type-ui-md-ls':       '0',    /* 0em     */
  '--prim-type-ui-md-lh':       '13',   /* 1.3     */
  '--prim-type-ui-sm':          'Inter',
  '--prim-type-ui-sm-weight':   '500',
  '--prim-type-ui-sm-ls':       '1',    /* 0.01em  */
  '--prim-type-ui-sm-lh':       '13',   /* 1.3     */
  '--prim-type-ui-xsm':         'Inter',
  '--prim-type-ui-xsm-weight':  '500',
  '--prim-type-ui-xsm-ls':      '2',    /* 0.02em  */
  '--prim-type-ui-xsm-lh':      '13',   /* 1.3     */
  /* button roles */
  '--prim-type-btn-lg':          'Inter',
  '--prim-type-btn-lg-weight':   '700',
  '--prim-type-btn-lg-ls':       '0',    /* 0em     */
  '--prim-type-btn-lg-lh':       '10',   /* 1.0     */
  '--prim-type-btn-md':          'Inter',
  '--prim-type-btn-md-weight':   '700',
  '--prim-type-btn-md-ls':       '0',    /* 0em     */
  '--prim-type-btn-md-lh':       '10',   /* 1.0     */
  '--prim-type-btn-sm':          'Inter',
  '--prim-type-btn-sm-weight':   '700',
  '--prim-type-btn-sm-ls':       '0',    /* 0em     */
  '--prim-type-btn-sm-lh':       '10',   /* 1.0     */
  '--prim-type-btn-xsm':         'Inter',
  '--prim-type-btn-xsm-weight':  '700',
  '--prim-type-btn-xsm-ls':      '0',    /* 0em     */
  '--prim-type-btn-xsm-lh':      '10',   /* 1.0     */
  /* sizes (px, stored without unit) */
  '--prim-type-h1-size':        '70',
  '--prim-type-h2-size':        '36',
  '--prim-type-h3-size':        '24',
  '--prim-type-h4-size':        '20',
  '--prim-type-sh1-size':       '18',
  '--prim-type-sh2-size':       '16',
  '--prim-type-sh3-size':       '14',
  '--prim-type-sh4-size':       '12',
  '--prim-type-body-lg-size':   '20',
  '--prim-type-body-md-size':   '18',
  '--prim-type-body-sm-size':   '14',
  '--prim-type-pill-lg-size':   '16',
  '--prim-type-pill-md-size':   '14',
  '--prim-type-pill-sm-size':   '11',
  '--prim-type-ui-xl-size':     '20',
  '--prim-type-ui-lg-size':     '16',
  '--prim-type-ui-md-size':     '14',
  '--prim-type-ui-sm-size':     '12',
  '--prim-type-ui-xsm-size':    '10',
  '--prim-type-btn-lg-size':    '20',
  '--prim-type-btn-md-size':    '16',
  '--prim-type-btn-sm-size':    '13',
  '--prim-type-btn-xsm-size':   '10',
};

/* ─── Keys to strip from old saved L2 data (font roles + role sizes moved to L1) ── */
const L2_STRIPPED_KEYS = new Set([
  '--font-heading', '--font-subheading', '--font-section', '--font-label',
  '--font-sh1', '--font-sh2', '--font-sh3', '--font-sh4',
  '--font-lead', '--font-body', '--font-small',
  '--font-logo', '--font-pill', '--font-pill-lg', '--font-pill-md', '--font-pill-sm', '--font-toc', '--font-meta',
  '--font-dropdown', '--font-dropdown-badge',
  '--font-ui-xl', '--font-ui-lg', '--font-ui-md', '--font-ui-sm', '--font-ui-xsm',
  '--font-btn-lg', '--font-btn-md', '--font-btn-sm', '--font-btn-xsm',
  '--size-h1', '--size-h2', '--size-h3', '--size-h4',
  '--size-sh1', '--size-sh2', '--size-sh3', '--size-sh4',
  '--size-body-lg', '--size-body', '--size-body-sm',
  '--size-pill-lg', '--size-pill-md', '--size-pill-sm',
  '--size-ui-xl', '--size-ui-lg', '--size-ui-md', '--size-ui-sm', '--size-ui-xsm',
  '--size-btn-lg', '--size-btn-md', '--size-btn-sm', '--size-btn-xsm',
]);

/* Map old L2 size keys → new L1 size keys (for migration) */
const L2_SIZE_TO_L1 = {
  '--size-h1': '--prim-type-h1-size', '--size-h2': '--prim-type-h2-size',
  '--size-h3': '--prim-type-h3-size', '--size-h4': '--prim-type-h4-size',
  '--size-sh1': '--prim-type-sh1-size', '--size-sh2': '--prim-type-sh2-size',
  '--size-sh3': '--prim-type-sh3-size', '--size-sh4': '--prim-type-sh4-size',
  '--size-body-lg': '--prim-type-body-lg-size', '--size-body': '--prim-type-body-md-size',
  '--size-body-sm': '--prim-type-body-sm-size',
  '--size-pill-lg': '--prim-type-pill-lg-size', '--size-pill-md': '--prim-type-pill-md-size',
  '--size-pill-sm': '--prim-type-pill-sm-size',
  '--size-ui-xl': '--prim-type-ui-xl-size', '--size-ui-lg': '--prim-type-ui-lg-size',
  '--size-ui-md': '--prim-type-ui-md-size', '--size-ui-sm': '--prim-type-ui-sm-size',
  '--size-ui-xsm': '--prim-type-ui-xsm-size',
  '--size-btn-lg': '--prim-type-btn-lg-size', '--size-btn-md': '--prim-type-btn-md-size',
  '--size-btn-sm': '--prim-type-btn-sm-size', '--size-btn-xsm': '--prim-type-btn-xsm-size',
};

/* ─── L2 non-color defaults ──────────────────────────────────── */
const DEFAULT_L2_EXTRA = {
  /* Semantic element sizes (not tied to a single L1 role) */
  '--size-logo':       '30',
  '--size-pill':       '18',
  '--size-toc':        '12',
  '--size-meta':       '14',
  '--size-dropdown':       '15',
  '--size-dropdown-badge': '10',
  /* spacing & layout */
  '--spacing-section-v':   '64',
  '--spacing-content-gap': '24',
  '--content-max-width':   '900',
  '--badge-angle':         '135',
};

const DEFAULT_L2 = { ...themeAllColorTokens('mono'), ...DEFAULT_L2_EXTRA };

/* ─── Migration: old 3-role type keys → new 7-role keys ──────── */
function migrateL1(saved) {
  if (!saved) return saved;
  const L1_KEY_MAP = {
    '--prim-type-heading':    '--prim-type-h1',
    '--prim-type-heading-weight': '--prim-type-h1-weight',
    '--prim-type-heading-ls':     '--prim-type-h1-ls',
    '--prim-type-heading-lh':     '--prim-type-h1-lh',
    '--prim-type-subheading':     '--prim-type-h2',
    '--prim-type-subheading-weight': '--prim-type-h2-weight',
    '--prim-type-subheading-ls':     '--prim-type-h2-ls',
    '--prim-type-subheading-lh':     '--prim-type-h2-lh',
    '--prim-type-body':           '--prim-type-body-md',
    '--prim-type-body-weight':    '--prim-type-body-md-weight',
    '--prim-type-body-ls':        '--prim-type-body-md-ls',
    '--prim-type-body-lh':        '--prim-type-body-md-lh',
  };
  const out = {};
  for (const [k, v] of Object.entries(saved)) {
    out[L1_KEY_MAP[k] || k] = v;
  }
  return out;
}

function migrateL2(saved) {
  if (!saved) return saved;
  const out = { ...saved };
  /* Strip font role keys and role-corresponding size keys (now L1 concerns) */
  for (const key of L2_STRIPPED_KEYS) delete out[key];
  return out;
}

/* Migrate old L2 size values → L1 size primitives */
function migrateL2SizesToL1(savedL1, savedL2) {
  if (!savedL2) return savedL1 || {};
  const out = { ...(savedL1 || {}) };
  for (const [l2Key, l1Key] of Object.entries(L2_SIZE_TO_L1)) {
    if (savedL2[l2Key] !== undefined && out[l1Key] === undefined) {
      out[l1Key] = savedL2[l2Key];
    }
  }
  return out;
}

/* ─── Initial state from committed file ──────────────────────── */
/* dme-defaults.json is the sole source of truth; Save writes to it via Vite middleware */
const INIT_THEME        = fileDefaults.theme    ?? 'mono';
const INIT_L1           = { ...DEFAULT_L1, ...migrateL2SizesToL1(migrateL1(fileDefaults.l1 ?? {}), fileDefaults.l2 ?? {}) };
/* Seed surface tokens from saved theme (so switching themes applies correct surface defaults),
   then overlay any explicit user customizations from the saved file */
const INIT_L2           = {
  ...DEFAULT_L2,
  ...(THEMES[INIT_THEME] ? themeAllColorTokens(INIT_THEME) : {}),
  ...migrateL2(fileDefaults.l2 ?? {}),
};
/* Per-theme l2 snapshots — persisted so switching themes restores saved edits */
const INIT_THEME_STATES = Object.fromEntries(
  Object.entries(fileDefaults.themeStates ?? {}).map(([t, s]) => [t, migrateL2(s)])
);
INIT_THEME_STATES[INIT_THEME] = { ...INIT_L2 };
const INIT_L1_COLOR_MAP = { ...L1_COLOR_MAP,  ...(fileDefaults.l1Colors ?? {}) };
const INIT_L1_GROUPS    = fileDefaults.l1Groups
  ?? L1_COLOR_PALETTES.map(p => ({ name: p.name, tokens: [...p.tokens] }));
const INIT_SECTION_SURFACES = fileDefaults.sectionSurfaces ?? {};

/* ─── Helpers ────────────────────────────────────────────────── */
function applyL2(name, rawVal) {
  let css = rawVal;
  if (typeof rawVal === 'string' && rawVal.startsWith('--prim-')) {
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
  } else if (name.endsWith('-size')) {
    /* stored as integer px → apply with unit */
    document.documentElement.style.setProperty(name, value + 'px');
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

  const recenter = useCallback(() => {
    setPos({
      x: Math.round((window.innerWidth - size.w) / 2),
      y: Math.round((window.innerHeight - size.h) / 2),
    });
  }, [size]);

  /* Listen for recenter-panel custom events */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.id === 'dme') {
        setPos({
          x: Math.round((window.innerWidth - size.w) / 2),
          y: Math.round((window.innerHeight - size.h) / 2),
        });
      }
    };
    window.addEventListener('recenter-panel', handler);
    return () => window.removeEventListener('recenter-panel', handler);
  }, [size]);

  return { detached, pos, size, onDragStart, onResizeStart, detach, dock, recenter };
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
export default function TokenEditor({ visible, onClose, states, onStateChange, pages, currentPageId, onNavigate, roleOverrides }) {
  const [tab, setTab]                 = useState('app');
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
  const [sectionSurfaces, setSectionSurfaces] = useState({ ...INIT_SECTION_SURFACES });
  const [sectAllExpanded, setSectAllExpanded] = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [activeSurface, setActiveSurface]     = useState('default');

  /* localStorage keys for all Sect/SubSect groups per tab */
  const L2_SECT_KEYS = [
    'dme-sect-Colors', 'dme-sect-Element Sizes', 'dme-sect-Spacing & Layout',
    'dme-sub-Surfaces', 'dme-sub-Statement', 'dme-sub-Statement: Links', 'dme-sub-Header Dropdown',
    'dme-sub-Navigation', 'dme-sub-Badge', 'dme-sub-Avatar', 'dme-sub-Stats',
    'dme-sub-Match History', 'dme-sub-Buttons', 'dme-sub-Input Fields', 'dme-sub-Status', 'dme-sub-Modal',
  ];
  const L1_SECT_KEYS = [
    'dme-sect-Type Roles', 'dme-sect-Color Palettes',
    'dme-role-h1', 'dme-role-h2', 'dme-role-h3', 'dme-role-h4',
    'dme-role-sh1', 'dme-role-sh2', 'dme-role-sh3', 'dme-role-sh4',
    'dme-role-body-lg', 'dme-role-body-md', 'dme-role-body-sm',
    'dme-role-pill-lg', 'dme-role-pill-md', 'dme-role-pill-sm',
    'dme-role-ui-xl', 'dme-role-ui-lg', 'dme-role-ui-md', 'dme-role-ui-sm', 'dme-role-ui-xsm',
    'dme-role-btn-lg', 'dme-role-btn-md', 'dme-role-btn-sm', 'dme-role-btn-xsm',
  ];

  const toggleAllSections = useCallback(() => {
    const expand = !sectAllExpanded;
    const keys = tab === 'l2' ? L2_SECT_KEYS : L1_SECT_KEYS;
    keys.forEach(k => localStorage.setItem(k, expand ? 'open' : 'closed'));
    setSectResetKey(n => n + 1);
    setSectAllExpanded(expand);
  }, [tab, sectAllExpanded]);

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
  const sectionSurfacesRef = useRef({ ...INIT_SECTION_SURFACES });
  const histRef       = useRef([{ theme: INIT_THEME, l1: { ...INIT_L1 }, l2: { ...INIT_L2 } }]);
  const idxRef        = useRef(0);
  const savedSnapshotRef = useRef({
    theme:    INIT_THEME,
    l1:       { ...INIT_L1 },
    l2:       { ...INIT_L2 },
    l1Colors: { ...INIT_L1_COLOR_MAP },
    l1Groups: INIT_L1_GROUPS.map(g => ({ ...g, tokens: [...g.tokens] })),
    sectionSurfaces: { ...INIT_SECTION_SURFACES },
  });

  /* Apply committed file defaults to DOM on mount */
  useEffect(() => {
    Object.entries(INIT_L1).forEach(([k, v]) => applyL1(k, v));
    Object.entries(INIT_L2).forEach(([k, v]) => applyL2(k, v));
    Object.entries(INIT_L1_COLOR_MAP).forEach(([tok, hex]) => {
      document.documentElement.style.setProperty(tok, hex);
    });
    /* Apply saved section surface overrides */
    Object.entries(INIT_SECTION_SURFACES).forEach(([sectionId, surfaceKey]) => {
      applySurfaceToDOM(sectionId, surfaceKey);
    });
    /* Watch for conditionally-rendered sections (e.g. profile tabs) entering the DOM */
    const observer = new MutationObserver(() => {
      const surfs = sectionSurfacesRef.current;
      Object.entries(surfs).forEach(([id, surfaceKey]) => {
        const el = document.querySelector(`[data-section-id="${id}"]`);
        if (!el) return;
        const hasSurface = SURFACE_CLASSES.some(c => el.classList.contains(c));
        const expected = surfaceKey === 'default' ? false : `surface-${surfaceKey}`;
        if (expected && !el.classList.contains(expected)) applySurfaceToDOM(id, surfaceKey);
        else if (!expected && hasSurface) applySurfaceToDOM(id, surfaceKey);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
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
      sectionSurfaces: sectionSurfacesRef.current,
      roleOverrides: roleOverrides || {},
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
      sectionSurfaces: { ...sectionSurfacesRef.current },
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
    /* Restore section surfaces */
    const savedSurfaces = snap.sectionSurfaces ?? {};
    sectionSurfacesRef.current = { ...savedSurfaces };
    setSectionSurfaces({ ...savedSurfaces });
    /* Re-apply saved surface overrides to DOM */
    [...Object.values(PAGE_SECTIONS).flat(), ...GLOBAL_SECTIONS].forEach(sec => {
      const surface = savedSurfaces[sec.id] ?? sec.defaultSurface;
      applySurfaceToDOM(sec.id, surface);
    });
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

  if (collapsed && !panel.detached) return createPortal(
    <>
      <button
        onClick={() => setCollapsed(false)}
        title="Expand DME"
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          [side]: 0,
          zIndex: 2147483647,
          ...tabBaseStyle,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#ddd'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        {tabArrow}
      </button>
    </>,
    document.body,
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

  return createPortal(
    <>
    <div data-devmode-ignore style={{
      ...panelStyle,
      background: '#1c1c1c', color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12, zIndex: 2147483647,
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
          zIndex: 2147483647,
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

      {/* ── Page + Theme selector row ──────────────────────────── */}
      {pages && pages.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
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
              <React.Fragment key={p.id}>
                {p.id === 'tokens' && <option disabled>{'─'.repeat(20)}</option>}
                <option value={p.id}>{p.label}</option>
              </React.Fragment>
            ))}
          </select>
          <select
            value={activeTheme}
            onChange={e => switchTheme(e.target.value)}
            style={{
              width: '100%', background: '#222', border: '1px solid #333',
              borderRadius: 6, color: '#e0e0e0', fontSize: 11, fontWeight: 600,
              padding: '6px 8px', cursor: 'pointer',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {Object.entries(THEMES).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
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

      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a', flexShrink: 0, background: '#181818' }}>
        {[['app', 'L3 - Application'], ['l2', 'L2 - Definitions'], ['l1', 'L1 - Primitives']].map(([key, label]) => (
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

      {/* ── Search + Expand / Collapse All ───────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 16px 4px', flexShrink: 0, borderBottom: '1px solid #222', background: '#181818' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tokens…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#222', border: '1px solid #333', borderRadius: 4,
              color: '#ccc', fontSize: 11, fontFamily: 'monospace',
              padding: '4px 24px 4px 8px', outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#555'}
            onBlur={e => e.currentTarget.style.borderColor = '#333'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#666', cursor: 'pointer',
                fontSize: 13, lineHeight: 1, padding: '0 2px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
              onMouseLeave={e => e.currentTarget.style.color = '#666'}
            >×</button>
          )}
        </div>
        {tab !== 'app' && !searchQuery && (
        <button
          onClick={toggleAllSections}
          title={sectAllExpanded ? 'Collapse all groups' : 'Expand all groups'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#666', padding: '2px 4px', borderRadius: 3,
            display: 'flex', alignItems: 'center', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          {sectAllExpanded ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 10l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 3l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 13l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        )}
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {searchQuery
          ? <SearchResults query={searchQuery} l2={l2} set={setL2Token} l1ColorMap={l1ColorMap} l1Groups={l1Groups} activeSurface={activeSurface} />
          : tab === 'l2'
          ? <L2View key={sectResetKey} l2={l2} set={setL2Token} l1ColorMap={l1ColorMap} l1Groups={l1Groups} states={states} onStateChange={(k, v) => { onStateChange?.(k, v); setIsDirty(true); }} activeSurf={activeSurface} setActiveSurf={setActiveSurface} />
          : tab === 'l1'
          ? <L1View key={sectResetKey} l1={l1} l2={l2} setRole={setL1Role} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
              setL1ColorHex={setL1ColorHex} addL1Color={addL1Color} deleteL1Color={deleteL1Color}
              moveL1Color={moveL1Color} addL1Group={addL1Group} deleteL1Group={deleteL1Group}
              sortL1Group={sortL1Group} renameL1Color={renameL1Color} />
          : <ApplicationView
              currentPageId={currentPageId}
              sectionSurfaces={sectionSurfaces}
              savedSectionSurfaces={savedSnapshotRef.current.sectionSurfaces ?? {}}
              setSectionSurfaces={(updater) => {
                const next = typeof updater === 'function' ? updater(sectionSurfacesRef.current) : updater;
                sectionSurfacesRef.current = next;
                setSectionSurfaces(next);
                setIsDirty(true);
              }}
              l2={l2}
              l1ColorMap={l1ColorMap}
            />
        }
      </div>

    </div>
    </>,
    document.body,
  );
}

/* ── Search Results ────────────────────────────────────────────────── */

/* Suffix-based labels — shared by surface panel and search */
const SEARCH_LABELS = {
  bg: 'Background', heading: 'Heading', 'text-muted-lg': 'Muted lg', 'text-muted': 'Muted', 'text-muted-sm': 'Muted sm',
  h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', sh1: 'Subheading 1', sh2: 'Subheading 2', sh3: 'Subheading 3', sh4: 'Subheading 4',
  'body-lg': 'Body lg', body: 'Body', 'body-sm': 'Body sm',
  border: 'Border', 'border-light': 'Border light', 'border-mid': 'Border mid', 'border-subtle': 'Border subtle',
  'border-active': 'Border active', 'callout-border': 'Callout border', placeholder: 'Placeholder', logo: 'Logo',
  'link-lg': 'Link lg', link: 'Link', 'link-sm': 'Link sm',
  pill: 'Pill text', 'pill-lg': 'Pill lg', 'pill-md': 'Pill md', 'pill-sm': 'Pill sm', accent: 'Pill (accent)',
  'pill-bg': 'Pill bg', 'pill-border': 'Pill border', 'tag-fill': 'Tag fill', star: 'Star',
  'ui-xl': 'UI XL', 'ui-lg': 'UI Large', 'ui-md': 'UI Medium', 'ui-sm': 'UI Small', 'ui-xsm': 'UI XSM',
  'input-bg': 'Input bg', 'input-border': 'Input border', 'input-text': 'Input text', 'input-placeholder': 'Input placeholder',
  'status-success': 'Success', 'status-warning': 'Warning', 'status-error': 'Error',
  'scrollbar-thumb': 'Scrollbar thumb', 'scrollbar-track': 'Scrollbar track',
  'btn-primary-bg': 'Primary bg', 'btn-primary-fg': 'Primary text', 'btn-dark-bg': 'Dark bg', 'btn-dark-fg': 'Dark text',
  'btn-ghost-fg': 'Ghost text', 'btn-ghost-icon': 'Ghost icon', 'btn-outline-fg': 'Outline text', 'btn-outline-border': 'Outline border',
  'btn-tertiary-bg': 'Tertiary bg', 'btn-tertiary-fg': 'Tertiary text', 'btn-quaternary-bg': 'Quaternary bg', 'btn-quaternary-fg': 'Quaternary text',
  'btn-destructive-bg': 'Destructive bg', 'btn-destructive-fg': 'Destructive text',
  'btn-destructive-ui-bg': 'Destruct. UI bg', 'btn-destructive-ui-fg': 'Destruct. UI text', 'btn-destructive-ui-border': 'Destruct. UI border',
};

/* Explicit full-name label overrides for tokens whose CSS name doesn't match any suffix pattern */
const EXPLICIT_TOKEN_LABELS = {
  '--color-guide-nav-bg': 'TOC background', '--color-toc-pip': 'TOC pip', '--color-toc-pip-active': 'TOC active pip',
  '--color-toc-heading': 'TOC heading', '--color-toc-text': 'TOC text', '--color-toc-text-active': 'TOC active text',
  '--color-dot-active': 'Progress dot active', '--color-nav-bg': 'Mobile nav bg', '--color-nav-border': 'Mobile nav border',
  '--color-nav-icon': 'Mobile nav icon',
  '--color-statement-bg': 'Statement bg', '--color-statement-border': 'Statement border', '--color-statement-text': 'Statement text',
  '--color-statement-link-bg': 'Statement link bg', '--color-statement-link-border': 'Statement link border', '--color-statement-link-text': 'Statement link text',
  '--color-activity-bell': 'Bell icon', '--color-dropdown-bg': 'Dropdown bg', '--color-dropdown-border': 'Dropdown border',
  '--color-dropdown-text': 'Dropdown text', '--color-dropdown-icon': 'Dropdown icon',
  '--color-dropdown-soon-bg': 'Soon pill bg', '--color-dropdown-soon-fg': 'Soon pill text', '--color-dropdown-separator': 'Separator',
  '--color-badge-from': 'Badge gradient start', '--color-badge-to': 'Badge gradient end',
  '--color-badge-icon': 'Badge icon (cap)', '--color-badge-icon-inner': 'Badge icon (inner)',
  '--color-badge-unearned-stroke': 'Badge unearned stroke', '--color-badge-unearned-text': 'Badge unearned text',
  '--color-avatar-bg': 'Avatar bg', '--color-stat-percentile': 'Stat percentile',
  '--color-match-win-border': 'Match win border', '--color-match-loss-border': 'Match loss border',
  '--color-match-win-chip-bg': 'Match win chip bg', '--color-match-win-chip-fg': 'Match win chip text',
  '--btn-primary-bg': 'Btn primary bg', '--btn-primary-fg': 'Btn primary text',
  '--btn-secondary-bg': 'Btn secondary bg', '--btn-secondary-fg': 'Btn secondary text',
  '--btn-primary-border': 'Btn primary border', '--btn-secondary-border': 'Btn secondary border',
  '--color-input-bg': 'Input bg', '--color-input-border': 'Input border',
  '--color-input-text': 'Input text', '--color-input-placeholder': 'Input placeholder',
  '--color-status-success': 'Success', '--color-status-warning': 'Warning', '--color-status-error': 'Error',
  '--modal-bg': 'Modal bg', '--modal-heading': 'Modal heading', '--modal-body': 'Modal body',
  '--modal-muted': 'Modal muted', '--modal-border': 'Modal border',
};

function deriveLabel(tokenName) {
  /* 1. Explicit full-name override (hardcoded L2View labels) */
  if (EXPLICIT_TOKEN_LABELS[tokenName]) return EXPLICIT_TOKEN_LABELS[tokenName];
  /* 2. Surface tokens: strip prefix, look up suffix */
  for (const sf of SURFACE_DEFS) {
    if (sf.key !== 'default' && tokenName.startsWith(sf.prefix)) {
      const suffix = tokenName.slice(sf.prefix.length);
      return SEARCH_LABELS[suffix] || suffix;
    }
  }
  /* 3. Global button tokens */
  if (tokenName.startsWith('--com-btn-')) {
    const suffix = tokenName.slice('--com-btn-'.length);
    return SEARCH_LABELS[suffix] || suffix;
  }
  /* 4. Global --color-* tokens: reverse-lookup via DEFAULT_SURFACE_TOKEN_MAP */
  for (const [suffix, mappedName] of Object.entries(DEFAULT_SURFACE_TOKEN_MAP)) {
    if (mappedName === tokenName) return SEARCH_LABELS[suffix] || suffix;
  }
  /* 5. Fallback: strip --color- or -- prefix, title-case */
  const raw = tokenName.replace(/^--color-/, '').replace(/^--/, '');
  return raw.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function deriveSurfaceGroup(tokenName) {
  if (tokenName.startsWith('--sf-muted-'))    return 'Secondary';
  if (tokenName.startsWith('--sf-inverse-'))  return 'Inverse';
  if (tokenName.startsWith('--sf-accent-'))   return 'Accent';
  if (tokenName.startsWith('--sf-tertiary-')) return 'Tertiary';
  return 'Primary (Global)';
}

const SURFACE_KEY_TO_GROUP = {
  'default': 'Primary (Global)', 'muted': 'Secondary',
  'inverse': 'Inverse', 'accent': 'Accent', 'tertiary': 'Tertiary',
};

function SearchResults({ query, l2, set, l1ColorMap, l1Groups, activeSurface }) {
  const q = query.toLowerCase();
  const activeGroup = SURFACE_KEY_TO_GROUP[activeSurface] || 'Primary (Global)';
  const matches = [];

  for (const [tokenName, tokenValue] of Object.entries(l2)) {
    /* Skip non-color tokens (fonts, numeric values) */
    if (typeof tokenValue !== 'string') continue;
    if (!tokenValue.startsWith('--prim-') && !tokenValue.startsWith('#')) continue;

    /* Only include tokens belonging to the active surface */
    if (deriveSurfaceGroup(tokenName) !== activeGroup) continue;

    const label = deriveLabel(tokenName);
    const hit =
      tokenName.toLowerCase().includes(q) ||
      tokenValue.toLowerCase().includes(q) ||
      label.toLowerCase().includes(q);
    if (hit) matches.push({ tokenName, tokenValue, label });
  }

  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ padding: '2px 16px 6px', fontSize: 10, color: '#666' }}>
        {matches.length ? `${matches.length} result${matches.length !== 1 ? 's' : ''}` : 'No results'}
      </div>
      {matches.map(({ tokenName, label }) => (
        <ColorRow
          key={tokenName}
          label={label}
          name={tokenName}
          l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
        />
      ))}
    </div>
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
        <div style={{ fontSize: 12, fontWeight: 700, color: hex('h1'), marginBottom: 1 }}>H1 heading</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: hex('h3'), marginBottom: 2 }}>H3 section</div>
        <div style={{ fontSize: 10, color: hex('body') }}>Body text</div>
        <div style={{ fontSize: 9, color: hex('body-sm') }}>Small text</div>
      </div>
    </div>
  );
}

/* ─── Surface colour panel — tab bar selects one of 4 surfaces ── */
function SurfaceColorPanel({ l2, set, l1ColorMap, l1Groups, states, onStateChange, activeSurf, setActiveSurf }) {
  const sf = SURFACE_DEFS.find(s => s.key === activeSurf);
  const tokenFor = (suffix) =>
    sf.key === 'default'
      ? DEFAULT_SURFACE_TOKEN_MAP[suffix]
      : `${sf.prefix}${suffix}`;
  const LABELS = { bg: 'Background', heading: 'Heading', 'text-muted-lg': 'Muted lg', 'text-muted': 'Muted', 'text-muted-sm': 'Muted sm', h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', sh1: 'Subheading 1', sh2: 'Subheading 2', sh3: 'Subheading 3', sh4: 'Subheading 4', 'body-lg': 'Body lg', body: 'Body', 'body-sm': 'Body sm', border: 'Border', 'border-light': 'Border light', 'border-mid': 'Border mid', 'border-subtle': 'Border subtle', 'border-active': 'Border active', 'callout-border': 'Callout border', placeholder: 'Placeholder', logo: 'Logo', 'link-lg': 'Link lg', link: 'Link', 'link-sm': 'Link sm', pill: 'Pill text', 'pill-lg': 'Pill lg', 'pill-md': 'Pill md', 'pill-sm': 'Pill sm', accent: 'Pill (accent)', 'pill-bg': 'Pill bg', 'pill-border': 'Pill border', 'tag-fill': 'Tag fill', star: 'Star', 'ui-xl': 'UI XL', 'ui-lg': 'UI Large', 'ui-md': 'UI Medium', 'ui-sm': 'UI Small', 'ui-xsm': 'UI XSM', 'input-bg': 'Input bg', 'input-border': 'Input border', 'input-text': 'Input text', 'input-placeholder': 'Input placeholder', 'status-success': 'Success', 'status-warning': 'Warning', 'status-error': 'Error', 'scrollbar-thumb': 'Scrollbar thumb', 'scrollbar-track': 'Scrollbar track' };
  const BTN_LABELS = { 'btn-primary-bg': 'Primary bg', 'btn-primary-fg': 'Primary text', 'btn-dark-bg': 'Dark bg', 'btn-dark-fg': 'Dark text', 'btn-ghost-fg': 'Ghost text', 'btn-ghost-icon': 'Ghost icon', 'btn-outline-fg': 'Outline text', 'btn-outline-border': 'Outline border', 'btn-tertiary-bg': 'Tertiary bg', 'btn-tertiary-fg': 'Tertiary text', 'btn-quaternary-bg': 'Quaternary bg', 'btn-quaternary-fg': 'Quaternary text', 'btn-destructive-bg': 'Destructive bg', 'btn-destructive-fg': 'Destructive text', 'btn-destructive-ui-bg': 'Destruct. UI bg', 'btn-destructive-ui-fg': 'Destruct. UI text', 'btn-destructive-ui-border': 'Destruct. UI border', 'btn-pill-bg': 'Pill bg', 'btn-pill-fg': 'Pill text', 'btn-pill-border': 'Pill border', 'btn-pill-active-bg': 'Pill active bg', 'btn-pill-active-fg': 'Pill active text', 'btn-pill-active-border': 'Pill active border', 'btn-pill-disabled-bg': 'Pill disabled bg', 'btn-pill-disabled-fg': 'Pill disabled text', 'btn-pill-disabled-border': 'Pill disabled border' };
  return (
    <>
      {/* Surface tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '4px 16px', position: 'sticky', top: 0, background: '#1c1c1c', zIndex: 2 }}>
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
      {SURFACE_TOKENS.map(suffix => {
        const sep = SURFACE_GROUP_STARTS.has(suffix)
          ? <div key={`sep-${suffix}`} style={{ borderTop: '1px solid #2a2a2a', margin: '4px 16px' }} />
          : null;
        if (suffix === 'logo') {
          const logoVal = states?.['global.logoVariant'] ?? 'Black';
          return (
            <React.Fragment key={suffix}>
              {sep}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px' }}>
                <span style={{ fontSize: 12, color: '#ccc' }}>Logo</span>
                <select
                  value={logoVal}
                  onChange={e => onStateChange?.('global.logoVariant', e.target.value)}
                  style={{
                    background: '#222', border: '1px solid #444', borderRadius: 6,
                    color: '#e0e0e0', fontSize: 11, padding: '4px 8px', cursor: 'pointer',
                  }}
                >
                  <option value="Black">Black</option>
                  <option value="White">White</option>
                </select>
              </div>
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={suffix}>
            {sep}
            <ColorRow
              label={LABELS[suffix]}
              name={tokenFor(suffix)}
              l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups}
            />
          </React.Fragment>
        );
      })}
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
   Application View — per-page section surface control
   ═══════════════════════════════════════════════════════════════ */
const MODAL_TOKENS = ['bg', 'heading', 'body', 'muted', 'border'];

function applySurfaceToDOM(sectionId, surfaceKey) {
  /* ── Modal tokens: inject --modal-* on :root (no DOM element needed) ── */
  if (sectionId === 'gl-modal') {
    const root = document.documentElement;
    if (surfaceKey === 'default') {
      MODAL_TOKENS.forEach(t => root.style.removeProperty(`--modal-${t}`));
      root.style.removeProperty('--modal-overlay-bg');
    } else {
      const prefix = `--sf-${surfaceKey}-`;
      root.style.setProperty('--modal-bg',      `var(${prefix}bg)`);
      root.style.setProperty('--modal-heading',  `var(${prefix}heading)`);
      root.style.setProperty('--modal-body',     `var(${prefix}body)`);
      root.style.setProperty('--modal-muted',    `var(${prefix}text-muted)`);
      root.style.setProperty('--modal-border',   `var(${prefix}border)`);
    }
    return;
  }

  const el = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (!el) return;

  /* Chrome-only mode: only apply bg + heading/body text, keep specimens untouched */
  if (el.dataset.surfaceMode === 'chrome-only') {
    el.classList.remove(...SURFACE_CLASSES);
    if (surfaceKey === 'default') {
      el.style.background = '';
      el.style.removeProperty('--section-heading');
      el.style.removeProperty('--section-body');
    } else {
      el.style.background = `var(--sf-${surfaceKey}-bg)`;
      el.style.setProperty('--section-heading', `var(--sf-${surfaceKey}-heading)`);
      el.style.setProperty('--section-body', `var(--sf-${surfaceKey}-body)`);
    }
    return;
  }

  el.classList.remove(...SURFACE_CLASSES);
  if (surfaceKey !== 'default') {
    el.classList.add(`surface-${surfaceKey}`);
    /* Clear inline background so the surface class can take effect */
    if (el.style.background || el.style.backgroundColor) {
      el.dataset.origBg = el.style.background || el.style.backgroundColor;
      el.style.background = '';
      el.style.backgroundColor = '';
    }
  } else if (el.dataset.origBg) {
    /* Restore original inline background when switching back to default */
    el.style.background = el.dataset.origBg;
    delete el.dataset.origBg;
  }
}

function ApplicationView({ currentPageId, sectionSurfaces, savedSectionSurfaces, setSectionSurfaces, l2, l1ColorMap }) {
  const pageSections = PAGE_SECTIONS[currentPageId] || [];
  const allSections = [...pageSections, ...GLOBAL_SECTIONS];
  const pageName = (currentPageId || '').replace(/-/g, ' ').toUpperCase();
  const [appSectResetKey, setAppSectResetKey] = useState(0);
  const [showSwatches, setShowSwatches] = useState(false);
  const [appAllExpanded, setAppAllExpanded] = useState(true);

  const toggleAllAppSections = useCallback(() => {
    const expand = !appAllExpanded;
    allSections.forEach(sec => localStorage.setItem(`dme-app-${sec.id}`, expand ? 'open' : 'closed'));
    setAppSectResetKey(n => n + 1);
    setAppAllExpanded(expand);
  }, [allSections, appAllExpanded]);

  /* Apply overrides when page changes */
  useEffect(() => {
    allSections.forEach(sec => {
      const surface = sectionSurfaces[sec.id] ?? sec.defaultSurface;
      applySurfaceToDOM(sec.id, surface);
    });
  }, [currentPageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSurfaceChange = (sectionId, newSurface) => {
    applySurfaceToDOM(sectionId, newSurface);
    setSectionSurfaces(prev => ({ ...prev, [sectionId]: newSurface }));
  };

  const resetAll = () => {
    allSections.forEach(sec => {
      const savedVal = savedSectionSurfaces[sec.id] ?? sec.defaultSurface;
      applySurfaceToDOM(sec.id, savedVal);
    });
    setSectionSurfaces(prev => {
      const next = { ...prev };
      allSections.forEach(sec => {
        if (sec.id in savedSectionSurfaces) {
          next[sec.id] = savedSectionSurfaces[sec.id];
        } else {
          delete next[sec.id];
        }
      });
      return next;
    });
  };

  const hasOverrides = allSections.some(sec => {
    const current = sectionSurfaces[sec.id];
    const saved = savedSectionSurfaces[sec.id];
    return current !== saved;
  });

  /* Resolve background hex for a given surface key */
  const surfaceBgHex = (surfaceKey) => {
    const sf = SURFACE_DEFS.find(s => s.key === surfaceKey);
    if (!sf) return '#888';
    const l1Token = l2[sf.bgToken];
    return l1ColorMap[l1Token] || '#888';
  };

  const renderSectionGroup = (sections) => sections.map(sec => {
    const currentSurface = sectionSurfaces[sec.id] ?? sec.defaultSurface;
    const isOverridden = sectionSurfaces[sec.id] !== savedSectionSurfaces[sec.id];
    return (
      <AppSectionGroup
        key={`${sec.id}-${appSectResetKey}`}
        section={sec}
        currentSurface={currentSurface}
        isOverridden={isOverridden}
        onSurfaceChange={handleSurfaceChange}
        surfaceBgHex={surfaceBgHex}
        l2={l2}
        l1ColorMap={l1ColorMap}
        showSwatch={showSwatches}
      />
    );
  });

  const groupHeaderStyle = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#999',
    padding: '10px 16px 8px',
    borderBottom: '1px solid #333',
  };

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Sticky controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 16px 4px',
        borderBottom: '1px solid #222',
        position: 'sticky', top: 0, background: '#1c1c1c', zIndex: 2,
      }}>
        <button onClick={() => setShowSwatches(s => !s)} style={{ background: 'none', border: 'none', color: showSwatches ? '#ccc' : '#555', fontSize: 10, cursor: 'pointer', padding: '2px 4px', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 4 }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'} onMouseLeave={e => e.currentTarget.style.color = showSwatches ? '#ccc' : '#555'}
          title={showSwatches ? 'Hide surface previews' : 'Show surface previews'}>
          {showSwatches ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
          Surface Preview
        </button>
        <button
          onClick={toggleAllAppSections}
          title={appAllExpanded ? 'Collapse all groups' : 'Expand all groups'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#666', padding: '2px 4px', borderRadius: 3,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ccc'}
          onMouseLeave={e => e.currentTarget.style.color = '#666'}
        >
          {appAllExpanded ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 10l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M4 3l4 3 4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 13l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Page sections group */}
      {pageSections.length > 0 && (
        <>
          <div style={groupHeaderStyle}>{pageName}</div>
          {renderSectionGroup(pageSections)}
        </>
      )}

      {/* Global sections group */}
      <div style={{ ...groupHeaderStyle, marginTop: pageSections.length > 0 ? 8 : 0 }}>GLOBAL</div>
      {renderSectionGroup(GLOBAL_SECTIONS)}

      {/* Reset button */}
      {hasOverrides && (
        <div style={{ padding: '12px 16px 0' }}>
          <button
            onClick={resetAll}
            style={{
              width: '100%', padding: '7px 0',
              background: 'none', border: '1px solid #444',
              borderRadius: 5, color: '#ccc', fontSize: 11,
              cursor: 'pointer', fontWeight: 600, letterSpacing: '0.03em',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#888'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#ccc'; }}
          >
            Reset All
          </button>
        </div>
      )}
    </div>
  );
}

function AppSectionGroup({ section, currentSurface, isOverridden, onSurfaceChange, surfaceBgHex, l2, l1ColorMap, showSwatch }) {
  const key = `dme-app-${section.id}`;
  const [open, setOpen] = useState(() => localStorage.getItem(key) !== 'closed');
  const toggle = () => setOpen(o => { const next = !o; localStorage.setItem(key, next ? 'open' : 'closed'); return next; });
  const bgHex = surfaceBgHex(currentSurface);

  /* Resolve text colors from L2 tokens for the selected surface */
  const sf = SURFACE_DEFS.find(s => s.key === currentSurface);
  const resolveHex = (suffix) => {
    if (!sf) return '#888';
    const tokenName = sf.key === 'default'
      ? DEFAULT_SURFACE_TOKEN_MAP[suffix]
      : `${sf.prefix}${suffix}`;
    return l1ColorMap[l2[tokenName]] || '#888';
  };
  const h1Hex = resolveHex('h1');
  const h3Hex = resolveHex('h3');
  const bodyHex = resolveHex('body');
  const bodySmHex = resolveHex('body-sm');

  return (
    <div style={{ borderBottom: '1px solid #2a2a2a' }}>
      <div
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#999', fontSize: 9 }}>{open ? '▾' : '▸'}</span>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#e0e0e0',
          }}>
            {section.label}
          </span>
          {isOverridden && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf82', flexShrink: 0 }} />
          )}
        </div>
        {/* Mini swatch preview */}
        <div style={{
          width: 16, height: 16, borderRadius: 3,
          background: bgHex, border: '1px solid rgba(255,255,255,0.12)',
          flexShrink: 0,
        }} />
      </div>
      {open && (
        <div style={{ padding: '0 16px 12px' }}>
          {/* Surface dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ color: '#aaa', fontSize: 11, flexShrink: 0 }}>Surface:</span>
            <select
              value={currentSurface}
              onChange={e => onSurfaceChange(section.id, e.target.value)}
              style={{
                flex: 1, background: '#222', border: '1px solid #444',
                borderRadius: 6, color: '#e0e0e0', fontSize: 11,
                padding: '5px 8px', cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {SURFACE_DEFS.map(s => (
                <option key={s.key} value={s.key}>
                  {s.label}{s.key === section.defaultSurface ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>
          {/* Surface swatch preview — uses resolved token colors */}
          {showSwatch && (
          <div style={{
            borderRadius: 5, overflow: 'hidden',
            border: '1px solid #2a2a2a',
          }}>
            <div style={{ background: bgHex, padding: '8px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: h1Hex, marginBottom: 1 }}>
                H1 heading
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: h3Hex, marginBottom: 2 }}>H3 section</div>
              <div style={{ fontSize: 10, color: bodyHex }}>Body text</div>
              <div style={{ fontSize: 9, color: bodySmHex }}>Small text</div>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   L2 View
   ═══════════════════════════════════════════════════════════════ */
function L2View({ l2, set, l1ColorMap, l1Groups, states, onStateChange, activeSurf, setActiveSurf }) {
  return (
    <>
      <Sect label="Colors">
        <SubSect label="Surfaces">
          <SurfaceColorPanel l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} states={states} onStateChange={onStateChange} activeSurf={activeSurf} setActiveSurf={setActiveSurf} />
        </SubSect>

        <SubSect label="Statement">
          <ColorRow label="Background"   name="--color-statement-bg"     l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"       name="--color-statement-border" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"         name="--color-statement-text"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Statement: Links">
          <ColorRow label="Background"   name="--color-statement-link-bg"     l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"       name="--color-statement-link-border" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"         name="--color-statement-link-text"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Header Dropdown">
          <ColorRow label="Bell icon"   name="--color-activity-bell"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Background"  name="--color-dropdown-bg"        l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"      name="--color-dropdown-border"    l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"        name="--color-dropdown-text"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Icon"        name="--color-dropdown-icon"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Soon pill bg"   name="--color-dropdown-soon-bg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Soon pill text" name="--color-dropdown-soon-fg"  l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Separator"   name="--color-dropdown-separator" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Navigation">
          <ColorRow label="TOC background"  name="--color-guide-nav-bg"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
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

        <SubSect label="Input Fields">
          <ColorRow label="Background"   name="--color-input-bg"          l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"       name="--color-input-border"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Text"         name="--color-input-text"        l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Placeholder"  name="--color-input-placeholder" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Status">
          <ColorRow label="Success"  name="--color-status-success" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Warning"  name="--color-status-warning" l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Error"    name="--color-status-error"   l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>

        <SubSect label="Modal">
          <ColorRow label="Background"   name="--modal-bg"         l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Heading"      name="--modal-heading"    l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Body text"    name="--modal-body"       l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Muted text"   name="--modal-muted"      l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
          <ColorRow label="Border"       name="--modal-border"     l2={l2} set={set} l1ColorMap={l1ColorMap} l1Groups={l1Groups} />
        </SubSect>
      </Sect>
      <Sect label="Element Sizes">
        <div style={{ padding: '4px 16px 6px' }}>
          <div style={{ color: '#888', fontSize: 10, lineHeight: 1.5 }}>
            Sizes for specific UI elements. Role sizes (H1–H4, body, etc.) are set under L1 → Type Roles.
          </div>
        </div>
        <SliderRow label="Logo size"          name="--size-logo"           l2={l2} set={set} min={16}  max={60}   unit="px" />
        <SliderRow label="Pill size"          name="--size-pill"           l2={l2} set={set} min={10}  max={24}   unit="px" />
        <SliderRow label="TOC size"           name="--size-toc"            l2={l2} set={set} min={9}   max={18}   unit="px" />
        <SliderRow label="Meta size"          name="--size-meta"           l2={l2} set={set} min={9}   max={18}   unit="px" />
        <SliderRow label="Dropdown size"      name="--size-dropdown"       l2={l2} set={set} min={10}  max={24}   unit="px" />
        <SliderRow label="Dropdown badge size" name="--size-dropdown-badge" l2={l2} set={set} min={7}  max={16}   unit="px" />
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
   L1 View — Type Role Targeting helpers
   ═══════════════════════════════════════════════════════════════ */

/* Static mapping: L1 role → hardwired L2 font tokens (no longer dynamic) */
const ROLE_TO_L2_TOKENS = {
  'h1':      ['--font-heading', '--font-logo', '--font-dropdown', '--font-dropdown-badge'],
  'h2':      ['--font-subheading'],
  'h3':      ['--font-section'],
  'h4':      ['--font-label'],
  'sh1':     ['--font-sh1'],
  'sh2':     ['--font-sh2'],
  'sh3':     ['--font-sh3'],
  'sh4':     ['--font-sh4'],
  'body-lg': ['--font-lead'],
  'body-md': ['--font-body'],
  'body-sm': ['--font-small', '--font-toc', '--font-meta'],
  'pill-lg': ['--font-pill-lg'],
  'pill-md': ['--font-pill-md'],
  'pill-sm': ['--font-pill-sm'],
  'ui-xl':   ['--font-ui-xl'],
  'ui-lg':   ['--font-ui-lg'],
  'ui-md':   ['--font-ui-md'],
  'ui-sm':   ['--font-ui-sm'],
  'ui-xsm':  ['--font-ui-xsm'],
  'btn-lg':  ['--font-btn-lg'],
  'btn-md':  ['--font-btn-md'],
  'btn-sm':  ['--font-btn-sm'],
  'btn-xsm': ['--font-btn-xsm'],
};

/**
 * Find all DOM elements that use a given L1 type role via L2 font tokens.
 * Walks stylesheets + inline styles, excludes DME panel elements.
 */
function findElementsForRole(roleKey) {
  const matchingL2Tokens = ROLE_TO_L2_TOKENS[roleKey] || [];
  if (matchingL2Tokens.length === 0) return [];

  const varPatterns = matchingL2Tokens.map(t => `var(${t})`);
  const selectors = new Set();

  // 2. Walk document.styleSheets to find rules referencing matching L2 tokens
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules || sheet.rules; } catch { continue; }
      if (!rules) continue;
      for (const rule of rules) {
        if (rule.type !== 1) continue; // CSSStyleRule only
        const ff = rule.style.fontFamily || '';
        if (varPatterns.some(p => ff.includes(p))) {
          selectors.add(rule.selectorText);
        }
      }
    }
  } catch { /* cross-origin sheets */ }

  // 3. querySelectorAll for collected selectors
  const elemSet = new Set();
  for (const sel of selectors) {
    try {
      document.querySelectorAll(sel).forEach(el => elemSet.add(el));
    } catch { /* invalid selector */ }
  }

  // 4. Walk DOM for inline styles containing matching var(--font-*) references
  const allEls = document.querySelectorAll('[style]');
  for (const el of allEls) {
    const inlineFF = el.style.fontFamily || '';
    if (varPatterns.some(p => inlineFF.includes(p))) {
      elemSet.add(el);
    }
  }

  // 5. Filter out DME panel elements
  return [...elemSet].filter(el =>
    !el.closest('[data-devmode-ignore]') && !el.closest('[data-devmode-panel]')
  );
}

/**
 * Overlay that highlights elements matching a given L1 type role.
 * Dim backdrop + mint-green highlight boxes positioned via getBoundingClientRect.
 */
function TypeRoleHighlightOverlay({ roleKey, onClose }) {
  const [rects, setRects] = useState([]);

  const updateRects = useCallback(() => {
    const elements = findElementsForRole(roleKey);
    setRects(elements.map(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    }));
  }, [roleKey]);

  useEffect(() => {
    updateRects();
    const onScroll = () => updateRects();
    const onResize = () => updateRects();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [updateRects]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div data-devmode-ignore style={{ position: 'fixed', inset: 0, zIndex: 2147483645, pointerEvents: 'none' }}>
      {/* Dim backdrop */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      {/* Highlight boxes */}
      {rects.map((r, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: r.top - 4,
          left: r.left - 4,
          width: r.width + 8,
          height: r.height + 8,
          border: '2px solid rgba(76,175,130,0.7)',
          background: 'rgba(76,175,130,0.08)',
          borderRadius: 3,
          boxSizing: 'border-box',
        }} />
      ))}
      {/* Count badge */}
      {rects.length > 0 && (
        <div style={{
          position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(76,175,130,0.9)', color: '#fff', fontSize: 12, fontWeight: 600,
          padding: '4px 12px', borderRadius: 12, fontFamily: 'system-ui, sans-serif',
        }}>
          {rects.length} element{rects.length !== 1 ? 's' : ''} using {roleKey.toUpperCase()}
        </div>
      )}
    </div>,
    document.body
  );
}

/* ═══════════════════════════════════════════════════════════════ */
const L1_SIZE_RANGE = {
  'h1': [32, 120], 'h2': [18, 72], 'h3': [16, 48], 'h4': [14, 36],
  'sh1': [12, 28], 'sh2': [11, 24], 'sh3': [10, 20], 'sh4': [9, 18],
  'body-lg': [14, 32], 'body-md': [12, 28], 'body-sm': [10, 20],
  'pill-lg': [10, 24], 'pill-md': [8, 20], 'pill-sm': [6, 16],
  'ui-xl': [14, 64], 'ui-lg': [12, 24], 'ui-md': [10, 20], 'ui-sm': [8, 16], 'ui-xsm': [6, 14],
  'btn-lg': [14, 32], 'btn-md': [12, 24], 'btn-sm': [8, 20], 'btn-xsm': [6, 16],
};

function L1RoleGroup({ roleKey, roleLabel, l1, setRole, isHighlighted, onToggleHighlight }) {
  const storageKey = `dme-role-${roleKey}`;
  const [open, setOpen] = useState(() => localStorage.getItem(storageKey) !== 'closed');
  const toggle = () => setOpen(o => { const next = !o; localStorage.setItem(storageKey, next ? 'open' : 'closed'); return next; });

  const familyKey  = `--prim-type-${roleKey}`;
  const weightKey  = `--prim-type-${roleKey}-weight`;
  const lsKey      = `--prim-type-${roleKey}-ls`;
  const lhKey      = `--prim-type-${roleKey}-lh`;
  const sizeKey    = `--prim-type-${roleKey}-size`;
  const currentFont = l1[familyKey] || 'Inter';
  const weights = FONT_WEIGHTS[currentFont] ?? [400, 700];
  const [sizeMin, sizeMax] = L1_SIZE_RANGE[roleKey] || [6, 120];

  // Live element count — recomputes on l2 changes + DOM mutations
  const [elemCount, setElemCount] = useState(0);
  useEffect(() => {
    const recount = () => setElemCount(findElementsForRole(roleKey).length);
    recount();
    const mo = new MutationObserver(recount);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    return () => mo.disconnect();
  }, [roleKey]);

  return (
    <div>
      <div style={{ padding: '8px 16px 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, cursor: 'pointer' }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"
            style={{ transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            <path d="M2 1l4 3-4 3" stroke="#666" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ color: '#999', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {roleLabel}
          </span>
          {!open && (
            <span style={{ color: '#555', fontSize: 10, fontFamily: 'monospace', marginLeft: 4 }}>
              {(l1[familyKey] || 'Inter').split(',')[0].replace(/'/g, '')}
            </span>
          )}
        </div>
        <button
          onClick={onToggleHighlight}
          title={isHighlighted ? 'Hide element highlights' : `Highlight ${elemCount} element${elemCount !== 1 ? 's' : ''} using this role`}
          style={{
            background: isHighlighted ? 'rgba(76,175,130,0.2)' : 'none',
            border: isHighlighted ? '1px solid rgba(76,175,130,0.5)' : '1px solid transparent',
            color: isHighlighted ? '#4cb582' : '#666',
            cursor: 'pointer', padding: '1px 4px', borderRadius: 3,
            fontSize: 13, lineHeight: 1, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
            <line x1="12" y1="2" x2="12" y2="0" /><line x1="12" y1="24" x2="12" y2="22" />
            <line x1="2" y1="12" x2="0" y2="12" /><line x1="24" y1="12" x2="22" y2="12" />
          </svg>
          <span style={{
            fontSize: 10, fontWeight: 600, fontFamily: 'system-ui, sans-serif',
            color: isHighlighted ? '#4cb582' : elemCount > 0 ? '#888' : '#555',
          }}>
            {elemCount}
          </span>
        </button>
      </div>
      {open && (
        <>
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
          {/* Size: stored as integer px */}
          <Row label="Size">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="range" min={sizeMin} max={sizeMax} step={1}
                value={l1[sizeKey] ?? '16'}
                onChange={e => setRole(sizeKey, e.target.value)}
                style={{ width: 80, accentColor: '#666', cursor: 'pointer' }} />
              <span style={{ color: '#999', fontSize: 11, minWidth: 44, textAlign: 'right', fontFamily: 'monospace' }}>
                {l1[sizeKey] ?? '16'}px
              </span>
            </div>
          </Row>
        </>
      )}
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

function L1View({ l1, l2, setRole, l1ColorMap, l1Groups, setL1ColorHex, addL1Color, deleteL1Color, moveL1Color, addL1Group, deleteL1Group, sortL1Group, renameL1Color }) {
  const [addingPalette, setAddingPalette]   = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [highlightedRole, setHighlightedRole] = useState(null);
  const toggleHighlight = useCallback((roleKey) => {
    setHighlightedRole(prev => prev === roleKey ? null : roleKey);
  }, []);

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
        {[
          ['h1',      'H1'],
          ['h2',      'H2'],
          ['h3',      'H3'],
          ['h4',      'H4'],
          ['sh1',     'Subheading 1'],
          ['sh2',     'Subheading 2'],
          ['sh3',     'Subheading 3'],
          ['sh4',     'Subheading 4'],
          ['body-lg', 'Body Large'],
          ['body-md', 'Body Medium'],
          ['body-sm', 'Body Small'],
          ['pill-lg', 'Pill Large'],
          ['pill-md', 'Pill Medium'],
          ['pill-sm', 'Pill Small'],
          ['ui-xl',   'UI XL'],
          ['ui-lg',   'UI Large'],
          ['ui-md',   'UI Medium'],
          ['ui-sm',   'UI Small'],
          ['ui-xsm',  'UI XSM'],
          ['btn-lg',  'Button Large'],
          ['btn-md',  'Button Medium'],
          ['btn-sm',  'Button Small'],
          ['btn-xsm', 'Button XSM'],
        ].map(([key, label], i, arr) => (
          <React.Fragment key={key}>
            <L1RoleGroup roleKey={key} roleLabel={label} l1={l1} setRole={setRole}
              isHighlighted={highlightedRole === key}
              onToggleHighlight={() => toggleHighlight(key)} />
            {i < arr.length - 1 && <div style={{ height: 1, background: '#252525', margin: '4px 16px' }} />}
          </React.Fragment>
        ))}
      </Sect>
      {highlightedRole && <TypeRoleHighlightOverlay roleKey={highlightedRole} onClose={() => setHighlightedRole(null)} />}
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
          fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#ffeb99', borderBottom: '1px solid #2a2a2a',
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
