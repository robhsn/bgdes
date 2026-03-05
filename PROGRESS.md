# Learn Segment Template — Progress Log

## Project Overview
Building a **Learn Segment Template** for backgammon.com — a full article page implementing the Figma design at `Style-Guide---Component-Library` (node `187-7831`).

**Stack:** React 18 + Vite 5, inline styles + CSS file, Google Fonts (Raleway Bold + Inter)
**Dev server:** `http://127.0.0.1:5199` (port 5199, strictPort)

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

## Session 6 — DME Persistence + Token Architecture Hardening

### localStorage Persistence (COMPLETE)
- DME state (`{theme, l1, l2}`) saved to `localStorage` key `dme-state` on every token change
- On page load, saved state is read once at module init (`_saved` IIFE), seeds all React state + refs
- A mount `useEffect` re-applies saved tokens to the DOM via `applyL1`/`applyL2`
- `reset` clears localStorage and resets to defaults
- Header shows `● saved` (green) indicator when persisted state exists

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

### Comprehensive font tokens (COMPLETE — Session 5)
All type-bearing elements now use dedicated L2 font tokens controlled in DME:
- `--font-heading` (H1), `--font-subheading` (H2), `--font-body` (body), `--font-logo`, `--font-pill`, `--font-toc`, `--font-meta`
- L2 font tokens store a role name (`'heading'`/`'subheading'`/`'body'`), resolved as `var(--prim-type-xxx)`

---

## DME Reference (current state)

### Trigger
`↑ ↑ ↓ ↓ ← → ← →` — toggles panel · `src/components/TokenEditor.jsx`

### L2 Tab
- **Colors** (15 tokens) — palette picker referencing L1 tokens
- **Typography** — role dropdowns (Heading/Subheading/Body) per element + H1/H2/body size sliders
- **Spacing & Layout** — section padding, content gap, max width sliders

### L1 Tab — Type Roles
Per role (Heading / Subheading / Body): Family · Weight · Letter spacing · Line height

### L1 Tab — Color Palettes
Reference swatches for all 5 L1 palettes: Mono, Sapphire, Splash, Orange, Butter

### Global controls
Theme dropdown (Mono | Coral Tide) · Undo/Redo (`⌘Z`/`⌘⇧Z`) · Reset · `● saved` indicator

---

## Pending / In Progress

### Design Matrix Editor / DME (COMPLETE — Sessions 4–6)
- Trigger: `↑ ↑ ↓ ↓ ← → ← →` — toggles panel
- `src/components/TokenEditor.jsx`

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

---

## Files

| File | Purpose |
|------|---------|
| `src/components/LearnSegmentTemplate.jsx` | Main component + all sub-components |
| `src/components/LearnSegmentTemplate.css` | Layout, TOC, responsive breakpoints |
| `src/main.jsx` | Root render |
| `index.html` | Google Fonts links, global box-sizing reset |
| `package.json` | React 18.3.1, Vite 5.4.10, @vitejs/plugin-react |
| `vite.config.js` | port 5199, strictPort, host 127.0.0.1 |
| `.claude/launch.json` | Preview server config for `preview_start` tool |
