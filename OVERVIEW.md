# bgdes — Project Overview

A design system prototype and interactive learning page for **Backgammon.com**, built as a Figma-to-code implementation exercise with a live Design Matrix Editor (DME) for token-driven theming.

**Stack:** React 18 + Vite 5 · Inline styles + CSS file · Google Fonts
**Dev server:** `http://127.0.0.1:5199` (port 5199)
**Start:** `preview_start` → name `backgammon-learn`

---

## Files

| File | Purpose |
|------|---------|
| `src/components/LearnSegmentTemplate.jsx` | Main page component — all article content, quiz, footer, SVG icons |
| `src/components/LearnSegmentTemplate.css` | Surface classes, layout, TOC, responsive breakpoints |
| `src/components/TokenEditor.jsx` | Design Matrix Editor (DME) panel |
| `src/tokens/dme-defaults.json` | Persisted DME state — source of truth for saved tokens |
| `src/main.jsx` | Root render |
| `index.html` | Google Fonts links, box-sizing reset |
| `vite.config.js` | Dev server config + `dmeSavePlugin` middleware |
| `.claude/launch.json` | `preview_start` server config |

---

## Page — Components & Features

### Header
- **Backgammon.com logo** — font-driven wordmark (`Backgammon` in heading font + `.com` in body)
- **User avatar** — circular image + username ("Christopher")

### Hero
- **Connected two-tone breadcrumb pills** — "Intro to Backgammon" (dark) + "Lesson 1" (accent), clipped into one capsule via parent `overflow: hidden; border-radius: 90px`
- **Lesson badge** — circular icon with token-driven gradient (`--color-badge-from` → `--color-badge-to` at `--badge-angle`). Tooltip "Lesson 1 Badge — 1XP" on hover.
- **H1** — "How to Play Backgammon"
- **Meta row** — reviewer name (linked) + estimated read time

### Article body (`surface-muted`)
Structured with reusable components:

| Component | Description |
|---|---|
| `H2` | Section heading with token-driven font/weight/size |
| `BodyText` | Body paragraph, `--font-body` + `--prim-type-body-weight` |
| `Callout` | Highlighted block with left border in `--color-callout-border` |
| `ImageWithCaption` | Image + caption, used inline or in `ImageRow` side-by-side layout |
| `HRule` | Full-width horizontal rule using `--color-border` |
| `ZigzagSeparator` | SVG zigzag transition between white and muted sections — white ∇ teeth biting into the gray area |
| `SectionBreak` | Paragraph-level visual divider |

**Article content:** 8 sections — Board Layout, How to Set Up, Starting the Game, Moving Checkers, Hitting, Bearing Off, Scoring, Test Yourself (quiz).

### Quiz (`QuizModule`, `surface-tertiary`)
3-question multiple-choice quiz with a fixed 520px card height (no layout shift).

**Active question view:**
- `QUESTION N OF 3` progress header + live correct count
- Question text
- A / B / C option buttons — on selection: correct highlights green, wrong highlights red
- Feedback message (`visibility: hidden` until answered — preserves height)
- Next / See Results button (`opacity: 0` until answered — preserves height)

**Results view:**
- Score (`2/3`) + contextual message inline
- Per-question compact review rows: ✓/✗ circle + question text + answer letter(s)
- "Try Again" resets to question 1

### Compact CTA (`surface-accent`)
Slim horizontal strip — "Ready to Play?" heading + "Reading is good. Playing is better." subtext + "Play Now" button. Not a full page section.

### Footer (`SiteFooter`, `surface-inverse`)
- **Backgammon.com** logo (smaller size)
- Social icon links: TikTok · Twitch · Facebook · Instagram · X · Bluesky (all SVG components)
- Hairline divider
- © 2026 Backgammon.com · Terms of Service · Privacy Policy

### Table of Contents (`TableOfContents`)
Sticky side panel, right-aligned, hidden below 1100px viewport width.
- **Collapsed:** 40px wide, shows only pip indicators
- **Expanded on hover:** 214px wide, labels fade in
- **Active section tracking:** scroll listener finds last section with `top < 80px`; bottom-of-page guard forces last item active; active pip wider + uses `--color-toc-pip-active` color on label too
- **Smooth sticky:** always `position: fixed`; `top = max(54, contentSectionTop + 64 - scrollY)` — scrolls with page then sticks at 54px with no jump
- 8 tracked sections: Board Layout, How to Set Up, Starting the Game, Moving Checkers, Hitting, Bearing Off, Scoring, Test Yourself

---

## Design Matrix Editor (DME)

**Trigger:** `↑ ↑ ↓ ↓` keyboard sequence
**Panel:** Fixed right, `30vw` wide (min 380px)

### Global Controls
| Control | Description |
|---|---|
| Theme dropdown | **Mono** / **Coral Tide** / **Coral Tide Alt** — applies full L1 + L2 preset; per-theme state snapshots persist edits between switches |
| Save (green) | Appears when dirty; POSTs to `/__dme_save` → writes `dme-defaults.json` → HMR reloads |
| Reset | Reverts all tokens to last saved `fileDefaults` |
| `● saved` | Green dot indicator when saved and not dirty |
| Undo / Redo | `⌘Z` / `⌘⇧Z`, 50-step history |
| × | Close panel |

### L2 Tab — Colors
Palette pickers grouped into sub-sections:
- **Default surface**: bg, heading, body, muted, border variants, callout, placeholder, toc-pip, toc-pip-active, logo, link, white
- **Statement**: bg, border, text
- **Navigation**: TOC pip, TOC active pip, mobile nav bg, mobile nav border, mobile nav icon
- **Badge**: gradient start, gradient end, angle slider, badge icon, badge icon inner
- **Muted / Inverse / Accent / Tertiary surfaces**: full 14-token color contracts each

### L2 Tab — Typography
- Per-element font role dropdowns (Heading / Subheading / Body): heading, subheading, body, logo, pill, toc, meta
- H1 size slider · H2 size slider · Body size slider

### L2 Tab — Spacing & Layout
- Section vertical padding slider
- Content gap slider
- Max content width slider

### L1 Tab — Type Roles
Per role (Heading / Subheading / Body):
- **Family** — font dropdown (Outfit, Raleway, Inter, Georgia, etc.)
- **Weight** — only shows weights valid for the selected font
- **Letter spacing** — slider (−5 to +20 hundredths of em), displayed as `0.00em`
- **Line height** — slider (0.9–2.2 in tenths), displayed as `1.0`

### L1 Tab — Color Palettes
Full CRUD for all L1 primitive color tokens:
- View tokens grouped by palette (Mono, Sapphire, Splash, Orange, Butter + custom)
- ✎ Edit hex per token (live DOM preview) · × Delete token
- ↑ / ↓ Reorder tokens within a palette
- + Add Color per palette (color picker + name input)
- + Add Palette · Delete palette (two-step confirm)

---

## Token Architecture

### Three layers
```
L1 primitives  →  L2 semantic  →  CSS custom property  →  element style
--prim-orange-500  --color-accent  var(--color-accent)    color: var(--color-accent)
```

### L1 — Primitives
- **Colors:** hex values stored in `l1Colors` map (e.g. `--prim-sapphire-500: #0c3775`)
- **Type roles:** font family, weight, letter-spacing, line-height per role (heading / subheading / body)

### L2 — Semantics
- **Colors:** store L1 token *names* (e.g. `--color-heading: '--prim-sapphire-500'`), applied via `var()` by `applyL2`
- **Fonts:** store role names (`'heading'`), applied as `var(--prim-type-heading)`
- **Badge angle:** plain integer string, `applyL2` appends `'deg'`
- **Type metrics:** integer strings, `applyL1` converts to `em` / unitless

### Surface cascade
A surface class (e.g. `.surface-inverse`) overrides all `--color-*` tokens for its entire subtree:
```css
.surface-inverse {
  background: var(--sf-inverse-bg);
  --color-bg:      var(--sf-inverse-bg);
  --color-heading: var(--sf-inverse-heading);
  /* ... all 14 tokens ... */
}
```
Components use only `--color-*` tokens and work correctly on any surface.

### Five surfaces

| Class | Background | Use |
|---|---|---|
| _(default)_ | white | Main page |
| `.surface-muted` | pale tint | Article body sections |
| `.surface-inverse` | dark navy | Footer, dark cards |
| `.surface-accent` | orange | CTA strip |
| `.surface-tertiary` | mid-dark navy + cyan text | Quiz card |

### Persistence (dev)
```
Save click → POST /__dme_save → dmeSavePlugin (vite.config.js)
           → writeFileSync(dme-defaults.json) → Vite HMR
           → TokenEditor re-evaluates with new INIT_* constants
```
In production (Vercel): `dme-defaults.json` is statically imported — no server needed.

---

## Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `< 1100px` | TOC hidden |
| `< 800px` | ImageRow stacks vertically; H1/H2/body font sizes reduce |
| `< 480px` | Further font size reduction; pill + badge text adjustments |

---

## Known Issues / To-Do

- [ ] Footer copyright row may be clipped by fixed mobile tab nav (fix: add `paddingBottom: 72` to footer)
- [ ] Quiz questions are hardcoded — no data-driven question loading yet
- [ ] "Play Now" and social links are `href="#"` placeholders
- [ ] TOC tracks all 8 sections ✓
