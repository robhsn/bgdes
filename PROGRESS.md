# Learn Segment Template — Progress Log

## Project Overview
Building a **Learn Segment Template** for backgammon.com — a full article page implementing the Figma design at `Style-Guide---Component-Library` (node `187-7831`).

**Stack:** React 18 + Vite 5, inline styles + CSS file, Google Fonts (Raleway Bold + Inter)
**Dev server:** `http://127.0.0.1:5199` (port 5199, autoPort — no strictPort)

---

## Session 1 — Initial Implementation

### Setup
- Working directory was empty; `create-vite` cancelled because `.claude/` dir existed
- Manually scaffolded: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`
- Configured `.claude/launch.json` for `preview_start` tool
- Port conflicts on 5173/5174 → fixed with `port: 5199, strictPort: true, host: '127.0.0.1'`

### First Implementation
- Created `LearnSegmentTemplate.jsx` with inline styles
- Components: `BreadcrumbPills`, `HRule`, `SectionBreak`, `ImageWithCaption`, `Callout`, `H2`, `BodyText`, `ZigzagSeparator`, `TocItem`, `TocDivider`, `TableOfContents`
- Sections: header (logo + profile), hero (pills + badge + H1 + meta + intro), zigzag separator, gray content body, TOC

### Figma Assets (valid ~7 days from generation)
- Avatar: `figma.com/api/mcp/asset/315f92a3-…`
- Badges: `figma.com/api/mcp/asset/e2cfc9a8-…`
- Polygon3 (TOC arrow): `figma.com/api/mcp/asset/6c8491e0-…`

---

## Session 2 — Feedback Round 1

**Issues fixed:**
1. **Centered layout** — switched from spacer-div to `padding: clamp(24px, 6.6vw, 100px)` on sections + `max-width: 900px; margin: 0 auto` on content
2. **Connected breadcrumb pills** — `overflow: hidden; border-radius: 90px` on parent `.ls-pills` wrapper; no border-radius on children. Eliminates any sub-pixel gap.
3. **Mobile responsive layout** — created `LearnSegmentTemplate.css` with breakpoints at 1100px (hide TOC), 800px (stack image rows, reduce fonts), 480px (further reduce)
4. **TOC collapsed/expand** — collapsed to 22px wide (only pips visible), expands to 214px on hover with text fade-in via opacity transition
5. **Badge tooltip** — CSS tooltip "Lesson 1 Badge — 1XP" appears on hover above badge icon
6. **Body content alignment** — fixed image+text rows using `flex: '1 0 0'` on text column and `width: 48%` on image column

---

## Session 3 — Feedback Round 2

**Issues fixed:**
1. **Zigzag triangles flipped** — path was closing along the bottom (filling below zigzag = white ∧ mountains). Fixed by closing along top (`Z` instead of `L${totalW},${H} L0,${H} Z`), which fills above the zigzag = white ∇ teeth pointing down into gray section.
2. **TOC font + pip size** — font 10px → 12px, pip 6×1px → 8×2px, collapsed TOC width 22px → 26px
3. **TOC sticky** — added `useRef` + `useEffect` scroll listener; switches between `position: absolute; top: 796px` (initial) and `position: fixed; top: 24px` (once scrolled past). Reverts on scroll up.

---

## Session 5 — TOC Improvements + Token Architecture Overhaul

### TOC Improvements (COMPLETE)
- Section IDs added to 4 content wrapper divs: `section-goal`, `section-setup`, `section-rolling`, `section-hitting`
- `TableOfContents` manages `activeSection` internally via scroll listener (no longer a prop)
- Scroll detection: iterates `SECTION_IDS` in reverse, finds last section with `getBoundingClientRect().top < 80`
- `TocItem` pip now uses CSS class `ls-toc-pip` (+ `ls-toc-pip-active`) for width, inline style for background color
- Collapsed pip widths: 16px (inactive), 24px (active) — via `.ls-toc-pip` and `.ls-toc-pip-active`
- Expanded pip widths: 8px all — via `.ls-toc:hover .ls-toc-pip, .ls-toc:hover .ls-toc-pip-active`
- TOC collapsed width: 26px → 40px

### Token Architecture Overhaul (COMPLETE)

#### Two-level font token system
- **L1 Type Roles** (`--prim-type-heading/subheading/body`) — map to actual font families (Raleway, Georgia, Inter)
- **L2 Font Tokens** — each stores a *role name* (`'heading'` / `'subheading'` / `'body'`), applied as `var(--prim-type-xxx)` via CSS
- Changing L1 type role updates all L2 tokens that reference that role automatically (CSS cascade — no explicit sync needed)
- DME L2 Typography now shows **role dropdowns** (Heading / Subheading / Body) instead of font pickers
- Font pickers remain in L1 → Type Roles tab

#### Comprehensive L2 font tokens
| Token | Default role | Element |
|---|---|---|
| `--font-heading` | heading | H1 |
| `--font-subheading` | subheading | H2 |
| `--font-body` | body | Body paragraphs, callouts, captions |
| `--font-logo` | heading | Site logo |
| `--font-pill` | heading | Breadcrumb pills |
| `--font-toc` | body | TOC labels |
| `--font-meta` | body | Meta text (reviewer, reading time) |

---

## Session 6 — DME Persistence + Token Architecture Hardening

### L2 Color Tokens → L1 Palette References (COMPLETE)
- L2 colors no longer store hex values — they store L1 token names (e.g. `'--prim-mono-900'`)
- `applyL2` for `--color-*` tokens: wraps value in `var()` → `setProperty('--color-heading', 'var(--prim-mono-900)')`
- THEMES object updated to store L1 token refs instead of hex values
- `HexInput` + `ColorRow` replaced with `PaletteColorRow` — a dropdown picker showing all 5 L1 palettes as swatches
- Selecting a swatch sets the L2 token to the corresponding L1 reference
- Picker shows current token short-name and hex preview; closes on outside click

### L1 Type Role Metrics (COMPLETE)
Per-role controls for weight, letter-spacing, and line-height now live in DME → Level 1 → Type Roles:
- **Family** — font dropdown (unchanged)
- **Weight** — dropdown populated only with weights valid for the selected font (`FONT_WEIGHTS` map)
- **Letter spacing** — slider (−5 to +20 in hundredths of em), displayed as `0.00em`
- **Line height** — slider (0.9 to 2.2 in tenths), displayed as `1.0`
- Values stored as integer strings in `DEFAULT_L1` (hundredths / tenths), applied by `applyL1` with correct units

**New CSS custom properties (L1 block):**
```
--prim-type-heading-weight    --prim-type-heading-ls    --prim-type-heading-lh
--prim-type-subheading-weight --prim-type-subheading-ls --prim-type-subheading-lh
--prim-type-body-weight       --prim-type-body-ls       --prim-type-body-lh
```
- `.ls-h1` and `.ls-h2` CSS classes now consume these L1 vars (removed hardcoded px values)
- Google Fonts loading updated to load all available weights per font (variable axis or explicit weight list)

---

## Session 7 — DME Save Button + Weight Bug Fix + L1 Color CRUD

### Manual Save (COMPLETE)
- Removed auto-save from `pushHistory` / `restoreSnapshot`
- Added `isDirty` state — set `true` on any token change
- Green **Save** button appears in header when `isDirty`; disappears after saving
- `● saved` indicator only shows when `!isDirty && hasSavedState`

### Weight Bug Fix (COMPLETE)
- **Root cause**: H1 had `fontWeight: 700` inline → overrode `.ls-h1` CSS class
- **Root cause**: `BodyText` had `fontWeight: 400` hardcoded → ignored `--prim-type-body-weight`
- H2 worked because it had no inline fontWeight → CSS class applied correctly
- **Fixes**: Removed `fontWeight: 700` from H1 inline style; changed `BodyText` + `ImageWithCaption` caption to `fontWeight: 'var(--prim-type-body-weight)'`

### L1 Color CRUD (COMPLETE)
- `L1_COLOR_MAP` and `L1_COLOR_PALETTES` lifted to component state (`l1ColorMap`, `l1Groups`)
- Backed by refs (`l1ColorMapRef`, `l1GroupsRef`) for sync access in callbacks
- `L1PaletteEditor` component: per-palette editable list with ✎ edit hex + × delete per token
- Edit mode: inline `<input type="color">` with live DOM update
- "+ Add Color" per palette: color picker + token name input (auto-prefixed `--prim-`)
- "+ Add Palette": name input → creates empty group
- Palette delete: two-step "Delete? Yes/No" confirm
- `ColorRow` (L2 picker) now uses live `l1ColorMap`/`l1Groups` props instead of module constants

### Drag-to-Reorder L1 Color Tokens (COMPLETE)
- ↑ / ↓ arrow buttons per token in `L1PaletteEditor` to reorder tokens within a palette
- Order is persisted as part of `l1Groups` in `dme-defaults.json`
- L2 palette picker respects the live order

---

## Session 8 — UI Size Overhaul + Badge Gradient + File Persistence

### DME UI Size Overhaul (COMPLETE)
All interactive controls in the DME were doubled in size for legibility:

| Element | Before | After |
|---|---|---|
| Panel width | `300px` | `30vw` (min `380px`) |
| `tinyBtn` font size | `12px` | `20px` |
| `tinyBtn` padding | `0 3px` | `2px 6px` |
| ↑ ↓ reorder buttons font | `10px` | `18px` |
| Token row min-height | `20px` | `34px` |
| Token row gap | `4px` | `6px` |
| Color inputs (edit + add) | `26×18px` | `40×28px` |
| Token name swatch | `16×16px` | `28×28px` |
| L2 ColorRow trigger swatch | `14×14px` | `22×22px` |
| L2 ColorRow dropdown swatches | `16×16px` | `22×22px` |
| Undo / Redo SVG icons | `14×14px` | `20×20px` |
| `iconBtn` padding | `4px 4px` | `5px 6px` |
| Close button (×) font | `20px` | `28px` |
| Token name label font | `10px` | `12px` |

### Badge Gradient Tokens (COMPLETE)
The lesson badge (circle next to "Lesson 1") now supports a fully token-driven gradient:

**New CSS custom properties (L2 block):**
```css
--color-badge-from   /* gradient start color — references an L1 token */
--color-badge-to     /* gradient end color   — references an L1 token */
--badge-angle        /* gradient angle in degrees (integer, e.g. 135) */
```

**`.ls-badge` CSS changes:**
```css
.ls-badge {
  align-self: center;
  width: 38.5px;
  height: 38.5px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(var(--badge-angle), var(--color-badge-from), var(--color-badge-to));
}
```
- `border-radius: 50%` + `overflow: hidden` keeps the badge circular regardless of gradient
- `align-self: center` (was `stretch`) to maintain circular shape within the flex row

**`applyL2` handling for `--badge-angle`:**
- Stored as a plain integer string (e.g. `'135'`)
- `applyL2` appends `'deg'` before setting the CSS property

**DME controls (L2 → Colors section):**
```jsx
<ColorRow label="Badge gradient ①" name="--color-badge-from" ... />
<ColorRow label="Badge gradient ②" name="--color-badge-to"   ... />
<SliderRow label="Badge angle"     name="--badge-angle" min={0} max={360} unit="°" />
```

**Theme defaults:**
| Theme | `--color-badge-from` | `--color-badge-to` |
|---|---|---|
| Mono | `--prim-mono-700` | `--prim-mono-900` |
| Coral Tide | `--prim-orange-500` | `--prim-sapphire-900` |

### File-Based Persistence (COMPLETE — localStorage fully removed)
State is now persisted to a JSON file in the repository rather than browser storage.

**Why:** Changes saved in the DME should be committed to the git repo and reflected in the Vercel build — not silently stored per browser session.

**How it works:**
1. `src/tokens/dme-defaults.json` — the single source of truth for saved DME state
2. `TokenEditor.jsx` statically imports `fileDefaults` from this JSON (baked into the Vite build)
3. In dev, clicking **Save** POSTs the full state to `POST /__dme_save`
4. A Vite-only dev middleware (`dmeSavePlugin` in `vite.config.js`) handles the write:
   ```js
   writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
   ```
5. Vite HMR detects the JSON change and hot-reloads the module, applying the new defaults
6. On Vercel (production): the JSON is statically imported — no middleware or server needed

**`dme-defaults.json` structure:**
```json
{
  "theme": "mono",
  "l1": { "--prim-type-heading": "Raleway", ... },
  "l2": { "--color-bg": "--prim-mono-white", "--badge-angle": "135", ... },
  "l1Colors": { "--prim-mono-white": "#ffffff", ... },
  "l1Groups": [
    { "name": "Mono",     "tokens": ["--prim-mono-white", ...] },
    { "name": "Sapphire", "tokens": [...] },
    ...
  ]
}
```

**Changes to `TokenEditor.jsx`:**
- Removed: `STORAGE_KEY`, `saveState()`, `clearSavedState()`, `_saved` IIFE
- INIT constants now use only `fileDefaults` + hardcoded fallbacks:
  ```js
  const INIT_THEME        = fileDefaults.theme    ?? 'mono';
  const INIT_L1           = { ...DEFAULT_L1,    ...(fileDefaults.l1       ?? {}) };
  const INIT_L2           = { ...DEFAULT_L2,    ...(fileDefaults.l2       ?? {}) };
  const INIT_L1_COLOR_MAP = { ...L1_COLOR_MAP,  ...(fileDefaults.l1Colors ?? {}) };
  const INIT_L1_GROUPS    = fileDefaults.l1Groups
    ?? L1_COLOR_PALETTES.map(p => ({ name: p.name, tokens: [...p.tokens] }));
  ```
- Mount `useEffect` always applies `fileDefaults` to DOM (unconditional)
- `hasSavedState` initialises to `false` each session; becomes `true` after clicking Save
- `handleSave` only POSTs to `/__dme_save`:
  ```js
  fetch('/__dme_save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme, l1, l2, l1Colors, l1Groups }),
  })
  ```
- `reset` no longer touches localStorage

**`vite.config.js` — `dmeSavePlugin`:**
```js
function dmeSavePlugin() {
  return {
    name: 'dme-save',
    apply: 'serve',           // dev only — excluded from production build
    configureServer(server) {
      server.middlewares.use('/__dme_save', (req, res) => { ... writeFileSync ... });
    },
  };
}
```
- Uses `process.cwd()` (not `__dirname` — unavailable in ESM) to resolve the file path

---

## DME Reference (current state)

### Trigger
`↑ ↑ ↓ ↓` — toggles panel · `src/components/TokenEditor.jsx`

### Panel
- Width: `30vw` (minimum `380px`), fixed to right edge of viewport
- Header: Theme dropdown · Save (green, when dirty) · Reset · `● saved` indicator · Undo/Redo · ×

### L2 Tab — Colors (17 tokens)
Palette picker referencing L1 tokens. Includes:
- Background, heading, body, border, muted, accent, pill, placeholder, callout, TOC pip colors
- **Badge gradient: start color, end color, angle slider (0–360°)**

### L2 Tab — Typography
- Role dropdowns (Heading / Subheading / Body) per element: heading, subheading, body, logo, pill, toc, meta
- H1 size, H2 size, body size sliders

### L2 Tab — Spacing & Layout
- Section vertical padding, content gap, max content width sliders

### L1 Tab — Type Roles
Per role (Heading / Subheading / Body):
- Family (font dropdown)
- Weight (valid weights for selected font only)
- Letter spacing (−5 to +20 hundredths of em, shown as `0.00em`)
- Line height (0.9–2.2 tenths, shown as `1.0`)

### L1 Tab — Color Palettes
- View/edit all L1 color tokens grouped by palette (Mono, Sapphire, Splash, Orange, Butter + any custom)
- Per-token: ✎ edit hex (live preview) · × delete
- Per-palette: + Add Color · Delete palette (two-step confirm)
- + Add Palette (creates empty group)
- ↑ / ↓ reorder tokens within a palette

### Global controls
- Theme dropdown: **Mono** | **Coral Tide** — applies full L1+L2 preset
- Undo/Redo: `⌘Z` / `⌘⇧Z` (50-step history)
- Reset: reverts all tokens to `fileDefaults`
- `● saved` indicator: green dot when `!isDirty && hasSavedState`

---

## Key Architecture Notes

### Layout pattern
```
<section className="ls-section">            ← full-width, padding: clamp()
  <div className="ls-content">             ← max-width: 900px, margin: auto
    ...content...
  </div>
</section>
```

### Token layers
```
L1 primitives  →  L2 semantic  →  CSS custom property on :root  →  element styles
--prim-mono-900    --color-heading    var(--color-heading)           color: var(--color-heading)
```
- L1 colors stored as hex in `l1Colors`
- L2 color tokens store L1 token names (e.g. `'--prim-mono-900'`), resolved by `applyL2` as `var(...)`
- L2 font tokens store role names (`'heading'`), resolved as `var(--prim-type-heading)`
- L2 `--badge-angle` stored as plain integer string, `applyL2` appends `'deg'`
- L1 type metric tokens (weight, ls, lh) stored as integers, `applyL1` converts to correct units

### TOC positioning
- `position: absolute; left: 0; top: 796px` relative to root div (which has `position: relative`)
- Scroll listener switches to `position: fixed; top: 24px` when `scrollY > initialTop - 24`
- Hidden below 1100px viewport width

### Connected two-tone pill pattern
```jsx
<div className="ls-pills">          {/* overflow: hidden; border-radius: 90px */}
  <div style={{ background: dark }}>...</div>
  <div style={{ background: accent }}>...</div>
</div>
```
No border-radius on children — parent clips both into one capsule.

### Zigzag separator
- SVG path closes with `Z` (along y=0 top edge) → fills area ABOVE zigzag → white ∇ teeth
- Separator div has gray background + `marginBottom: -H` to overlap gray section below
- White ∇ teeth appear to "bite" from the white section into the gray section

### File persistence flow (dev)
```
User clicks Save
  → handleSave() builds state object
  → POST /__dme_save (JSON body)
  → dmeSavePlugin middleware (vite.config.js)
  → writeFileSync(dme-defaults.json)
  → Vite HMR detects JSON change
  → TokenEditor module re-evaluates with new INIT_* constants
```

---

## Files

| File | Purpose |
|------|---------|
| `src/components/LearnSegmentTemplate.jsx` | Main component + all sub-components |
| `src/components/LearnSegmentTemplate.css` | Layout, TOC, responsive breakpoints, badge styles |
| `src/components/TokenEditor.jsx` | Design Matrix Editor (DME) panel |
| `src/tokens/dme-defaults.json` | Persisted DME state — sole source of truth for saved design tokens |
| `src/main.jsx` | Root render |
| `index.html` | Google Fonts links, global box-sizing reset |
| `package.json` | React 18.3.1, Vite 5.4.10, @vitejs/plugin-react |
| `vite.config.js` | Port 5199 (autoPort, no strictPort), dmeSavePlugin middleware |
| `.claude/launch.json` | Preview server config for `preview_start` tool |

---

## Session 9 — Surface System + Full Article Content

### Surface Architecture (COMPLETE)
- 4-surface CSS system: `surface-muted`, `surface-inverse`, `surface-accent`, `surface-tertiary`
- Each class is a "color contract" — sets `--color-bg/heading/body/muted/border-*` etc. for all descendants
- THEMES restructured: `globals` (root-level semantic tokens) + `surfaces` (per-surface overrides)
- `themeAllColorTokens(key)` helper flattens both into a single token map for L2 init
- Author link token (`--color-link`) added; body/muted text color tokens fixed
- `--sf-muted-*`, `--sf-inverse-*`, `--sf-accent-*`, `--sf-tertiary-*` token groups added to CSS and THEMES
- Zigzag separator uses `--sf-muted-bg` directly so it tracks the muted surface token

### Full Article Content (COMPLETE)
All sections fully authored with real backgammon content:
- `section-layout`: Board Layout with GlossaryTerms (Points, Home Board, Outer Board, Bar)
- `section-setup`: How to Set Up — CheckerStack components (Runners, Mid-point, Builders, Defenders)
- `section-start`: Starting the Game
- `section-moving`: Moving Checkers — BulletItem rules (Open Points, Blocked Points, Doubles)
- `section-hitting`: Hitting — with Blot/Hit/Bar glossary terms
- `section-bearing`: Bearing Off
- `section-scoring`: Scoring (Single, Gammon, Backgammon)
- `section-quiz`: Test Yourself (see Quiz below)

TOC updated to track all 8 sections: Board Layout, How to Set Up, Starting the Game, Moving Checkers, Hitting, Bearing Off, Scoring, Test Yourself

### Glossary System (COMPLETE)
- `GLOSSARY` object maps term → definition
- `GlossaryTerm` component: bold + dashed underline; hover shows floating tooltip
- Used inline in body text: `<GlossaryTerm term="Points" />`

### Quiz Module (COMPLETE)
- 3-question multiple-choice quiz with A/B/C lettered options
- `QuizModule` state: `currentIdx`, `selected`, `userAnswers`, `completed`
- Per-answer feedback: green correct / red wrong highlighting immediately on select
- Results view: score fraction + compact question breakdown with ✓/✗ and answer correction
- `surface-tertiary` card styling; progress bar

### Footer (COMPLETE)
- `SiteFooter` component on `surface-inverse`
- Logo + 6 social icons (TikTok, Twitch, Facebook, Instagram, X, Bluesky) + divider + copyright + Terms/Privacy links

### Guide Nav CTAs (COMPLETE)
- `GuideCTAs` component: Previous / Next lesson cards with title
- Uses `--color-guide-nav-*` tokens for theming on both default and surface backgrounds

---

## Session 10 — TOC Polish + Badge + Themes + DME Enhancements

### Badge Dot Clipping Fix (COMPLETE)
- Badge dot (`.ls-badge-dot`) was being clipped by `overflow: hidden` on `.ls-badge`
- Fix: removed `overflow: hidden` from `.ls-badge`; added `clip-path` polygon directly to `::before` pseudo-element to shape the badge hex without clipping children

### Coral Tide Alt Theme (COMPLETE)
- Third theme added: **Coral Tide Alt** — swaps roles of `--color-pill` and `--color-accent` vs standard Coral Tide
- `nav-bg: butter-500`, `nav-border: butter-900`, `nav-icon: sapphire-500`
- Theme dropdown in DME now shows three options: Mono | Coral Tide | Coral Tide Alt

### Per-Theme State Persistence (COMPLETE)
- Switching themes now snapshots the current L2 token state before switching
- On returning to a theme, the snapshot is restored
- `themeStatesRef` — map from theme key → L2 snapshot

### Color Picker Stays Open (COMPLETE)
- Previously the L2 palette picker closed on any state update
- Fixed by moving picker open/close state into a ref rather than React state

### Avatar Order Fix (COMPLETE)
- Header showed avatar before username; flipped to username then avatar (left → right)

### TOC Heading (COMPLETE)
- "Table of Contents" label added to TOC panel (`ls-toc-heading` class)
- Hidden when TOC is collapsed; fades in on hover alongside labels

### TOC Pip Sizing (COMPLETE)
- Pip height: 4px (was 2px)
- Pip width (inactive): 22px; active: 30px; hover (expanded): 8px all

### TOC Sticky Position (COMPLETE)
- TOC sticks at `top: 54px` (was 24px) — below header

### Font Size Tokens for All Roles (COMPLETE)
- `--size-logo`, `--size-pill`, `--size-toc`, `--size-meta`, `--size-small` added to CSS and DME
- All size tokens now controllable via L2 Typography sliders

---

## Session 11 — Mobile Nav Tokens + TOC Fixes

### Mobile Nav Tokens in DME (COMPLETE)
- `--color-nav-bg`, `--color-nav-border`, `--color-nav-icon` registered in all three THEMES `globals`
- Mono defaults: `mono-100 / mono-250 / mono-900`
- Coral Tide + Alt defaults: `butter-500 / butter-900 / sapphire-500`
- Three new `ColorRow` entries added to DME L2 → Navigation sub-section

### TOC Left Position (COMPLETE)
- Moved from `left: var(--spacing-h)` (was maxing at 100px) to fixed `left: 40px`

### Last TOC Item Always Highlights (COMPLETE)
- Bug: the last section (`section-quiz`) never became active — `getBoundingClientRect().top < 80` can't trigger if page runs out of content below
- Fix: added `atBottom` guard — `window.innerHeight + scrollY >= document.body.scrollHeight - 80` → force-activate last section

### Active TOC Label Color (COMPLETE)
- Active TOC label now uses `var(--color-toc-pip-active)` (was only bold, no color change)

### TOC Smooth Sticky Transition (COMPLETE)
- **Old approach**: `position: absolute → fixed` switch via `isFixed` state → instant jump
- **New approach**: always `position: fixed`, `top = Math.max(54, initialTop - scrollY)`
  - `initialTop` measured dynamically from `contentSection.getBoundingClientRect().top + scrollY + 64`
  - Aligns TOC top with start of article body text (first H2 level)
  - As user scrolls, `top` decreases smoothly until it reaches 54px and sticks
  - No position-type switch → no jump
- Uses `useLayoutEffect` for measurement + direct DOM manipulation for `top` updates (zero re-renders on scroll)
- `isFixed` state and `useEffect` removed; replaced entirely

---

## DME Reference (current state)

### Trigger
`↑ ↑ ↓ ↓` — toggles panel · `src/components/TokenEditor.jsx`

### Panel
- Width: `30vw` (minimum `380px`), fixed to right edge of viewport
- Header: Theme dropdown · Save (green, when dirty) · Reset · `● saved` indicator · Undo/Redo · ×

### L2 Tab — Colors
Palette picker referencing L1 tokens, grouped into sub-sections:
- **Default surface**: bg, heading, body, muted, border variants, callout, placeholder, toc-pip, toc-pip-active, logo, link, white
- **Statement**: bg, border, text
- **Navigation**: TOC pip, TOC active pip, mobile nav bg, mobile nav border, mobile nav icon
- **Badge**: gradient start, gradient end, angle slider, badge icon, badge icon inner
- **Muted surface**: bg, heading, body, muted, border variants, callout, placeholder, logo, link, pill, accent
- **Inverse surface**: (same structure)
- **Accent surface**: (same structure)
- **Tertiary surface**: (same structure)

### L2 Tab — Typography
- Role dropdowns (Heading / Subheading / Body) per element: heading, subheading, body, logo, pill, toc, meta
- Size sliders: H1 (20–120px), H2 (18–60px), body (12–28px), small, logo, pill, toc, meta

### L2 Tab — Spacing & Layout
- Section vertical padding, content gap, max content width sliders

### L1 Tab — Type Roles
Per role (Heading / Subheading / Body): Family · Weight · Letter spacing · Line height

### L1 Tab — Color Palettes
Full CRUD: view/edit/add/delete tokens and palettes; ↑/↓ reorder

### Global controls
- Theme dropdown: **Mono** | **Coral Tide** | **Coral Tide Alt**
- Per-theme state snapshots — switching restores previous edits
- Undo/Redo: `⌘Z` / `⌘⇧Z` (50-step history)
- Reset: reverts to `fileDefaults`
- `● saved` indicator: green dot when `!isDirty && hasSavedState`

---

## Key Architecture Notes

### Layout pattern
```
<section className="ls-section">            ← full-width, padding: clamp()
  <div className="ls-content">             ← max-width: 900px, margin: auto
    ...content...
  </div>
</section>
```

### Token layers
```
L1 primitives  →  L2 semantic  →  CSS custom property on :root  →  element styles
--prim-mono-900    --color-heading    var(--color-heading)           color: var(--color-heading)
```
- L1 colors stored as hex in `l1Colors`
- L2 color tokens store L1 token names (e.g. `'--prim-mono-900'`), resolved by `applyL2` as `var(...)`
- L2 font tokens store role names (`'heading'`), resolved as `var(--prim-type-heading)`
- L2 `--badge-angle` stored as plain integer string, `applyL2` appends `'deg'`

### TOC positioning (current)
- Always `position: fixed`
- `top = Math.max(54, initialTop - scrollY)` where `initialTop` = content section top + 64px
- Initial position aligns with first H2 in article body
- Smoothly slides up to `top: 54px` as user scrolls; no position-type jump
- `left: 40px` (fixed, not relative to content padding)
- Hidden below `1100px` viewport width via media query

### Surface system
Each `.surface-*` class is a color contract:
```css
.surface-muted { background: var(--sf-muted-bg); --color-bg: var(--sf-muted-bg); --color-heading: ... }
```
Components only use `--color-*` semantic tokens — they work on any surface automatically.

### Connected two-tone pill pattern
```jsx
<div className="ls-pills">          {/* overflow: hidden; border-radius: 90px */}
  <div style={{ background: dark }}>...</div>
  <div style={{ background: accent }}>...</div>
</div>
```

### File persistence flow (dev)
```
User clicks Save → POST /__dme_save → dmeSavePlugin (vite.config.js) → writeFileSync(dme-defaults.json) → HMR
```

---

## Files

| File | Purpose |
|------|---------|
| `src/components/LearnSegmentTemplate.jsx` | Main component + all sub-components |
| `src/components/LearnSegmentTemplate.css` | Layout, TOC, responsive breakpoints, badge styles, button tokens |
| `src/components/LearnHubPage.jsx` | Learn Hub page |
| `src/components/LearnHubPage.css` | Hub-specific styles |
| `src/components/SharedLayout.jsx` | Shared SiteHeader, PlayNowCta, SiteFooter |
| `src/components/PageSelector.jsx` | Konami-gated floating page switcher |
| `src/components/TokenEditor.jsx` | Design Matrix Editor (DME) panel |
| `src/tokens/dme-defaults.json` | Persisted DME state — sole source of truth for saved design tokens |
| `src/imgs/wbf-logo.png` | World Backgammon Federation logo |
| `src/main.jsx` | Root render — page routing + DME visibility state |
| `index.html` | Google Fonts links, global box-sizing reset |
| `package.json` | React 18.3.1, Vite 5.4.10, @vitejs/plugin-react |
| `vite.config.js` | Port 5199 (autoPort, no strictPort), dmeSavePlugin middleware |
| `.claude/launch.json` | Preview server config for `preview_start` tool |

---

## Session 12 — Learn Hub + Multi-Page Routing + Button Tokens

### Learn Hub Page (COMPLETE)
New `LearnHubPage.jsx` + `LearnHubPage.css`:
- Hero: H1 with `var(--prim-type-heading-weight)` token, stats row, body, HRule, CTA buttons + WBF badge
- CTA buttons: **primary** ("Continue: Lesson 2" → navigates to article) + **secondary** ("View Syllabus")
- Lessons section (`surface-muted`): CourseAccordion + ProgressDots + LessonRow components
- WBF logo: imported from `src/imgs/wbf-logo.png` (replaced Figma plugin localhost URL)

### Multi-Page Routing (COMPLETE)
- `src/main.jsx`: `currentPageId` state switches between `LearnHubPage` and `LearnSegmentTemplate`
- Both pages receive `onNavigate` prop; "Continue: Lesson 2" button navigates to article
- Header logo (both pages) calls `onNavigate('learn-hub')` via `SiteHeader.onLogoClick` prop

### Shared Layout — `SharedLayout.jsx` (COMPLETE)
- `SiteHeader`, `PlayNowCta`, `SiteFooter` extracted from `LearnSegmentTemplate` → shared module
- `SiteHeader` accepts optional `onLogoClick` prop (cursor: pointer when provided)
- Both pages import and use shared components — ~120 lines of duplication removed

### PageSelector Widget (COMPLETE)
- Floating bottom-left pill; shows page list on click
- Removed own Konami logic + `visible` state — now a controlled component
- App owns `dmeVisible` state; both `TokenEditor` and `PageSelector` receive it as prop
- Opening/closing DME (Konami code, × button) always syncs PageSelector visibility

### Button Token System (COMPLETE)
Five new tokens defined in `LearnSegmentTemplate.css` `:root` and managed by DME:
```
--btn-primary-bg / --btn-primary-fg   → primary button fill + text
--btn-secondary-bg / --btn-secondary-fg → secondary button fill + text
--btn-border                           → shared border + 3D drop-shadow color
```
- Registered in DME L2 → Colors → **Buttons** subsection (all 3 themes)
- Hub hero: `lh-btn--primary` / `lh-btn--secondary` classes with 3D box-shadow press effect
- `PlayNowCta` "Play Now": secondary style with matching 3D drop-shadow (4px, press on click)

### Heading Weight Fix (COMPLETE)
- `lh-hero-title` changed from hardcoded `700` to `var(--prim-type-heading-weight)`
- Both hub and article H1 now use identical weight token (900 in coral-tide defaults)

---

## Session 13 — UI Polish (cranky-ellis worktree)

### Completed
- H1 class parity: hub hero H1 changed from `lh-hero-title` → `ls-h1` (matches article)
- Active progress dot fix: `filled > 0` guard so unstarted courses show all hollow dots
- Mobile nav icons 34px, bar 66px tall, inactive opacity 0.65
- Three mobile fixes: hub course toggle icon inline (CSS `order`), article meta stacked on mobile, board-sample.png replacing empty placeholders
- UI cleanup: removed Syllabus button, zigzag separators, "Backgammon Learning" pill, duration labels, hero stats block; hid WBF section; made header sticky
- Sticky header shrink on scroll: height 100px → 64px, logo 30% smaller (`ls-header--scrolled` class toggled by scroll listener in `SharedLayout.jsx`)
- Removed decorative board grid (`lh-hero-board-bg`) from hub hero

---

## Next Session — DME States Feature (IN PROGRESS)

### What it is
A new top-level "States" tab in the DME. States are boolean toggles that change contextual UI on pages. Two types: **global** (all pages) and **per-page**. Programmed in code, toggled in the DME. First state: `auth.loggedIn`.

### Files to create
**`src/context/dme-states.jsx`**
```jsx
import { createContext, useContext } from 'react';
export const DMEStatesContext = createContext({});
export function useDMEState(key, defaultValue = false) {
  return useContext(DMEStatesContext)[key] ?? defaultValue;
}
export const STATE_DEFINITIONS = [
  {
    key: 'auth.loggedIn',
    label: 'Logged In',
    description: 'Show authenticated state: player avatar & username',
    type: 'global',
    defaultValue: true,
  },
];
```

### Files to modify

**`src/tokens/dme-defaults.json`** — add `"states": { "auth.loggedIn": true }` at top level

**`src/main.jsx`** — add `DMEStatesContext.Provider` wrapping the whole app; add `dmeStates` state initialised from `fileDefaults.states`; pass `states` + `onStateToggle` props to `TokenEditor`

**`src/components/TokenEditor.jsx`**:
1. Import `STATE_DEFINITIONS` from `../context/dme-states`
2. Update signature: `{ visible, onToggle, onClose, states, onStateToggle }`
3. Add `const [topTab, setTopTab] = useState('dme')`
4. Add `states` to `handleSave` deps array and include in save payload
5. Add top-level tab bar (DME | States) at very top of panel JSX
6. When `topTab === 'states'`: show `<StatesView>`; otherwise show existing DME content
7. Add `StatesView`, `StateToggleRow`, `DmeToggle` components (toggle switch, green when on)

**`src/components/SharedLayout.jsx`**:
1. Import `useDMEState` from `../context/dme-states`
2. `const loggedIn = useDMEState('auth.loggedIn', true)` inside `SiteHeader`
3. Conditionally render avatar/username OR `<button className="ls-login-btn">Log In / Sign Up</button>`

**`src/components/LearnSegmentTemplate.css`** — add `.ls-login-btn` styles (pill button, primary style, header-sized)

### Key notes
- `vite.config.js` save middleware needs no changes — it writes whatever JSON it receives
- Inner DME tab bar (L2/L1) remains; top-level tabs just wrap it
- Toggle switch: 36×20px pill, green (#4caf82) when on, #333 when off, white 14px circle knob