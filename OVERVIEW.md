# bgdes — Project Overview

A design system prototype and interactive learning experience for **Backgammon.com**, built as a Figma-to-code implementation exercise with a live Design Matrix Editor (DME) for token-driven theming.

**Stack:** React 18 + Vite 5 · Inline styles + CSS file · Google Fonts
**Dev server:** `http://127.0.0.1:5199` (port 5199)
**Start:** `preview_start` → name `backgammon-learn`

---

## Pages

| Page | Component | Description |
|------|-----------|-------------|
| Learn Hub | `LearnHubPage.jsx` | Hero + stats + course/lesson list |
| Lesson Article | `LearnSegmentTemplate.jsx` | Full article with TOC, quiz, footer |

Navigation is managed in `src/main.jsx` via `currentPageId` state. The Konami code (`↑↑↓↓`) reveals both the DME panel and a **PageSelector** widget (bottom-left) for switching pages.

---

## Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | Root render — page routing state, DME visibility state |
| `src/components/LearnHubPage.jsx` | Learn Hub page component |
| `src/components/LearnHubPage.css` | Hub-specific layout and styles |
| `src/components/LearnSegmentTemplate.jsx` | Lesson article component + all sub-components |
| `src/components/LearnSegmentTemplate.css` | Shared token root, surface classes, layout, TOC, responsive |
| `src/components/SharedLayout.jsx` | Shared `SiteHeader`, `PlayNowCta`, `SiteFooter` |
| `src/components/TokenEditor.jsx` | Design Matrix Editor (DME) panel |
| `src/components/PageSelector.jsx` | Konami-gated floating page switcher (bottom-left) |
| `src/tokens/dme-defaults.json` | Persisted DME state — source of truth for saved tokens |
| `src/imgs/avatar-dink.png` | Christopher avatar |
| `src/imgs/wbf-logo.png` | World Backgammon Federation logo |
| `src/imgs/badge-learn.svg` | Lesson badge SVG |
| `index.html` | Google Fonts links, box-sizing reset |
| `vite.config.js` | Dev server config + `dmeSavePlugin` middleware |
| `.claude/launch.json` | `preview_start` server config |

---

## Shared Layout

`SharedLayout.jsx` exports three reusable layout components used by both pages:

| Component | Description |
|-----------|-------------|
| `SiteHeader` | Top bar — Backgammon.com logo (clicks → hub) + Christopher avatar |
| `PlayNowCta` | `surface-accent` strip — "Ready to Play?" + secondary "Play Now" button |
| `SiteFooter` | `surface-inverse` footer — logo + social icons + copyright |

---

## Learn Hub Page

### Hero
- **H1** — "Learn & Master Backgammon" (weight from `--prim-type-heading-weight` token)
- **Stats row** — Courses · Lessons · Total Time
- **Body text** — one-paragraph summary
- **CTA buttons** (two 3D-press style buttons using button token system):
  - **Primary** (`lh-btn--primary`) — "Continue: Lesson 2" → navigates to article page
  - **Secondary** (`lh-btn--secondary`) — "View Syllabus"
- **WBF badge** — `wbf-logo.png` + "Officially Sanctioned by The World Backgammon Federation"

### Lessons section (`surface-muted`)
- Section intro with pill label + H2 + body
- Mobile quick-continue bar
- **CourseAccordion** — expandable course cards with `ProgressDots`
- **LessonRow** — lesson entry with number, title, duration, Completed/Continue badges + chevron

### End-cap
- `PlayNowCta` (secondary button style)
- `SiteFooter`
- `MobileNav` (same 5-tab nav as article page)

---

## Article Page — Components & Features

### Header
Shared `SiteHeader` — logo click → hub.

### Hero
- **Connected two-tone breadcrumb pills** — "Intro to Backgammon" + "Lesson 1"
- **Lesson badge** — circular gradient icon (`--color-badge-from` → `--color-badge-to`)
- **H1** — "How to Play Backgammon" (uses `ls-h1` with `--prim-type-heading-weight`)
- **Meta row** — reviewer name + estimated read time

### Article body (`surface-muted`)
| Component | Description |
|---|---|
| `H2` | Section heading |
| `BodyText` | Body paragraph |
| `Callout` | Highlighted block with left border |
| `ImageWithCaption` | Image + caption |
| `HRule` | Full-width rule |
| `ZigzagSeparator` | SVG zigzag transition |
| `SectionBreak` | Paragraph-level divider |
| `GlossaryTerm` | Bold + dashed underline with hover tooltip |

8 sections: Board Layout, How to Set Up, Starting the Game, Moving Checkers, Hitting, Bearing Off, Scoring, Test Yourself.

### Quiz (`QuizModule`, `surface-tertiary`)
3-question multiple-choice. Fixed 520px card height. Per-answer feedback + results view.

### Table of Contents
Sticky side panel (hidden < 1100px). Collapsed (40px) → expanded on hover (214px). Active section tracking + smooth sticky transition.

---

## Button Token System

Defined in `LearnSegmentTemplate.css` root — adapts automatically per surface:

```css
--btn-primary-bg:  var(--color-border-mid);
--btn-primary-fg:  var(--color-heading);
--btn-secondary-bg: var(--color-bg);
--btn-secondary-fg: var(--color-heading);
--btn-border:      var(--color-heading);
```

Hub hero uses `lh-btn` base class with `lh-btn--primary` / `lh-btn--secondary` modifiers (3D box-shadow press effect). `PlayNowCta` "Play Now" uses secondary style via inline token vars.

---

## Design Matrix Editor (DME)

**Trigger:** `↑ ↑ ↓ ↓` keyboard sequence (toggles DME panel **and** PageSelector together)

### Global Controls
| Control | Description |
|---|---|
| Theme dropdown | **Mono** / **Coral Tide** / **Coral Tide Alt** — full L1+L2 preset; per-theme state snapshots |
| Save (green) | Appears when dirty; POSTs to `/__dme_save` → writes `dme-defaults.json` → HMR |
| Reset | Reverts to last saved `fileDefaults` |
| `● saved` | Green dot when saved and not dirty |
| Undo / Redo | `⌘Z` / `⌘⇧Z`, 50-step history |
| × | Closes panel (also hides PageSelector) |

### L2 Tab — Colors
Palette pickers grouped into sub-sections: Default surface, Statement, Navigation, Badge, Muted/Inverse/Accent/Tertiary surfaces.

### L2 Tab — Typography
Role dropdowns per element + size sliders (H1, H2, body, small, logo, pill, toc, meta).

### L2 Tab — Spacing & Layout
Section vertical padding · Content gap · Max content width.

### L1 Tab — Type Roles
Per role (Heading / Subheading / Body): Family · Weight · Letter spacing · Line height.

### L1 Tab — Color Palettes
Full CRUD: view/edit/add/delete tokens and palettes; ↑/↓ reorder.

---

## Token Architecture

### Three layers
```
L1 primitives  →  L2 semantic  →  CSS custom property  →  element style
--prim-orange-500  --color-accent  var(--color-accent)    color: var(--color-accent)
```

### Five surfaces

| Class | Background | Use |
|---|---|---|
| _(default)_ | white | Main page |
| `.surface-muted` | pale tint | Article body, lessons section |
| `.surface-inverse` | dark navy | Footer |
| `.surface-accent` | orange/coral | Play Now CTA strip |
| `.surface-tertiary` | mid-dark navy | Quiz card |

Each surface class redefines all `--color-*` tokens for its subtree — components are surface-agnostic.

### Persistence (dev)
```
Save → POST /__dme_save → dmeSavePlugin (vite.config.js) → writeFileSync(dme-defaults.json) → HMR
```
In production (Vercel): `dme-defaults.json` is statically imported.

---

## Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `< 1100px` | TOC hidden |
| `< 800px` | ImageRow stacks; H1/H2/body font sizes reduce |
| `< 480px` | Further font reduction; pill/badge adjustments |

---

## Known Issues / To-Do

- [ ] Footer copyright may be clipped by mobile tab nav
- [ ] Quiz questions are hardcoded
- [ ] "View Syllabus" and social links are `href="#"` placeholders
- [ ] Article page back-navigation (from article → hub via breadcrumb) not yet wired
