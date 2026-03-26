/**
 * verify-l2.mjs
 * Compares dme-defaults.json l2 keys against the expected full set of
 * INIT_L2 keys (mvp-green theme + DEFAULT_L2_EXTRA).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dmeDefaultsPath = resolve(__dirname, '../src/tokens/dme-defaults.json');
const dmeDefaults = JSON.parse(readFileSync(dmeDefaultsPath, 'utf-8'));
const savedL2Keys = new Set(Object.keys(dmeDefaults.l2 ?? {}));

// --- Build expected key set ---

// 1. mvp-green global keys
const GLOBAL_KEYS = [
  '--color-toc-pip', '--color-toc-pip-active', '--color-toc-heading',
  '--color-toc-text', '--color-toc-text-active',
  '--color-dot-active',
  '--color-badge-from', '--color-badge-to', '--color-badge-icon',
  '--color-badge-icon-inner', '--color-badge-unearned-stroke',
  '--color-badge-unearned-text',
  '--color-avatar-bg', '--color-stat-percentile',
  '--color-statement-bg', '--color-statement-border', '--color-statement-text',
  '--color-statement-link-bg', '--color-statement-link-border',
  '--color-statement-link-text', '--color-statement-link-icon',
  '--color-activity-bell',
  '--color-dropdown-bg', '--color-dropdown-border', '--color-dropdown-text',
  '--color-dropdown-icon', '--color-dropdown-soon-bg', '--color-dropdown-soon-fg',
  '--color-dropdown-separator',
  '--color-nav-bg', '--color-nav-border', '--color-nav-icon',
  '--color-guide-nav-bg', '--color-guide-nav-border',
  '--color-guide-nav-label', '--color-guide-nav-title',
  '--btn-primary-bg', '--btn-primary-fg',
  '--btn-secondary-bg', '--btn-secondary-fg',
  '--btn-primary-border', '--btn-secondary-border',
  '--color-match-win-border', '--color-match-loss-border',
  '--color-match-win-chip-bg', '--color-match-win-chip-fg',
  '--color-match-loss-chip-bg', '--color-match-loss-chip-fg',
  '--color-friend-btn-bg', '--color-friend-btn-icon',
  '--color-toggle-off-bg', '--color-toggle-on-bg', '--color-toggle-knob',
];

// 2. Default-surface base color tokens (prefix --color-)
const DEFAULT_SURFACE_SUFFIXES = [
  'bg', 'heading', 'body', 'muted', 'muted-lg', 'muted-sm',
  'border', 'border-light', 'border-mid', 'border-subtle', 'callout-border',
  'placeholder', 'logo', 'link', 'link-lg', 'link-sm',
  'pill', 'pill-lg', 'pill-md', 'pill-sm', 'accent',
  'pill-bg', 'pill-border', 'tag-fill',
  'scrollbar-thumb', 'scrollbar-track',
];
const DEFAULT_SURFACE_KEYS = DEFAULT_SURFACE_SUFFIXES.map(s => `--color-${s}`);

// 3. btnDefaultTokens(BTN_LIGHT) for default surface
const BTN_SUFFIXES = [
  'primary-bg', 'primary-fg', 'dark-bg', 'dark-fg',
  'ghost-fg', 'ghost-icon',
  'outline-fg', 'outline-border',
  'tertiary-bg', 'tertiary-fg',
  'quaternary-bg', 'quaternary-fg',
  'destructive-bg', 'destructive-fg',
  'destructive-ui-bg', 'destructive-ui-fg', 'destructive-ui-border',
  'pill-bg', 'pill-fg', 'pill-border',
  'pill-active-bg', 'pill-active-fg', 'pill-active-border',
  'pill-disabled-bg', 'pill-disabled-fg', 'pill-disabled-border',
];
const DEFAULT_BTN_KEYS = BTN_SUFFIXES.map(s => `--com-btn-${s}`);

// 4. typeRoleTokens for default surface
const TYPE_ROLE_SUFFIXES = [
  'h1', 'h2', 'h3', 'h4',
  'body-lg', 'body-sm',
  'ui-xl', 'ui-lg', 'ui-md', 'ui-sm', 'ui-xsm',
];
const DEFAULT_TYPE_ROLE_KEYS = TYPE_ROLE_SUFFIXES.map(s => `--color-${s}`);

// 5. inputTokens for default surface
const INPUT_SUFFIXES = ['input-bg', 'input-border', 'input-text', 'input-placeholder'];
const DEFAULT_INPUT_KEYS = INPUT_SUFFIXES.map(s => `--color-${s}`);

// 6. Per-surface tokens for muted, inverse, accent, tertiary
const SURFACES = ['muted', 'inverse', 'accent', 'tertiary'];

const SURFACE_COLOR_SUFFIXES = DEFAULT_SURFACE_SUFFIXES;

const UI_COMPONENT_SUFFIXES = [
  'match-win-chip-bg', 'match-win-chip-fg',
  'match-loss-chip-bg', 'match-loss-chip-fg',
  'friend-btn-bg', 'friend-btn-icon',
  'toggle-off-bg', 'toggle-on-bg', 'toggle-knob',
  'guide-nav-bg', 'guide-nav-border',
  'guide-nav-label', 'guide-nav-title',
];

const SURFACE_KEYS = [];
for (const sf of SURFACES) {
  const prefix = `--sf-${sf}-`;
  // base colors
  for (const s of SURFACE_COLOR_SUFFIXES) SURFACE_KEYS.push(`${prefix}${s}`);
  // btn tokens
  for (const s of BTN_SUFFIXES) SURFACE_KEYS.push(`${prefix}btn-${s}`);
  // type role tokens
  for (const s of TYPE_ROLE_SUFFIXES) SURFACE_KEYS.push(`${prefix}${s}`);
  // input tokens
  for (const s of INPUT_SUFFIXES) SURFACE_KEYS.push(`${prefix}${s}`);
  // uiComponentTokens
  for (const s of UI_COMPONENT_SUFFIXES) SURFACE_KEYS.push(`${prefix}${s}`);
}

// 7. DEFAULT_L2_EXTRA
const DEFAULT_L2_EXTRA_KEYS = [
  '--size-logo', '--size-pill', '--size-toc', '--size-meta',
  '--size-dropdown', '--size-dropdown-badge',
  '--spacing-section-v', '--spacing-content-gap',
  '--content-max-width', '--badge-angle',
];

// --- Combine all expected keys ---

const ALL_EXPECTED = new Set([
  ...GLOBAL_KEYS,
  ...DEFAULT_SURFACE_KEYS,
  ...DEFAULT_BTN_KEYS,
  ...DEFAULT_TYPE_ROLE_KEYS,
  ...DEFAULT_INPUT_KEYS,
  ...SURFACE_KEYS,
  ...DEFAULT_L2_EXTRA_KEYS,
]);

// --- Compare ---

const missingFromSaved = [...ALL_EXPECTED].filter(k => !savedL2Keys.has(k)).sort();
const extraInSaved = [...savedL2Keys].filter(k => !ALL_EXPECTED.has(k)).sort();

console.log(`\n=== L2 Token Verification ===\n`);
console.log(`Expected key count:  ${ALL_EXPECTED.size}`);
console.log(`Saved l2 key count:  ${savedL2Keys.size}`);
console.log();

if (missingFromSaved.length === 0) {
  console.log(`PASS: All ${ALL_EXPECTED.size} expected tokens are present in dme-defaults.json l2.`);
} else {
  console.log(`MISSING from saved l2 (${missingFromSaved.length}):`);
  for (const k of missingFromSaved) console.log(`  - ${k}`);
}

console.log();

if (extraInSaved.length === 0) {
  console.log(`No extra tokens in saved l2 beyond the expected set.`);
} else {
  console.log(`EXTRA in saved l2 not in expected set (${extraInSaved.length}):`);
  for (const k of extraInSaved) console.log(`  + ${k}`);
}

console.log();

// Summary
if (missingFromSaved.length === 0 && extraInSaved.length === 0) {
  console.log(`RESULT: PERFECT MATCH`);
} else {
  console.log(`RESULT: MISMATCH (${missingFromSaved.length} missing, ${extraInSaved.length} extra)`);
}
