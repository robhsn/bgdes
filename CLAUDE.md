# CLAUDE.md — bgdes IDP

## IDP Completeness Rule

When adding new tokens, patterns, button variants, or any design system additions, **always propagate support across the entire IDP toolchain** in a single pass. Do not wait to be asked. This includes:

1. **CSS tokens** — L2 defaults in `tokens.css`, per-surface `--sf-*` variants, surface remapping in `surfaces.css`
2. **DME (TokenEditor.jsx)** — Add to `SURFACE_TOKENS`, `SURFACE_GROUP_STARTS`, `LABELS`, `DEFAULT_SURFACE_TOKEN_MAP`, theme presets (`BTN_LIGHT`/`BTN_DARK`, `inputTokens()`, etc.)
3. **Role Targeter (RoleTargeter.jsx)** — Add to relevant variant arrays (`BTN_VARIANTS`, `BORDER_ROLES`, etc.)
4. **CSS injection (main.jsx)** — Add to `RO_BTN_CSS`, `RO_BORDER_CSS`, `RO_FONT_SIZE`, or other injection maps as needed
5. **Buttons Sheet (ButtonsSheetPage.jsx)** — Add new button variants to the `VARIANTS` array
6. **Surface Preview (SurfacePreviewPage.jsx)** — Add new button variants to the `variants` array; add new token groups to the relevant section component
7. **Component CSS (ComButtons.css, blocks.css)** — Add CSS classes and usage of new tokens

Nothing is "done" until it works end-to-end across all these touchpoints.

## Global Component Rule

Repeating UI elements (inputs, search bars, toggles, cards, etc.) **must always be implemented as global CSS classes in `blocks.css`**, not as page-scoped or inline styles. When building a new element:

1. Check if a global component already exists (`.form-input`, `.search-bar`, `.com-btn`, etc.)
2. If yes, **use it** — do not create a page-local variant with different border-width, radius, or placeholder styling
3. If no, **create the global class first**, then use it everywhere it appears
4. All global components must use design tokens (`--color-input-*`, `--color-border`, etc.) — never hardcode colors
5. If a page needs a minor variation, extend via a modifier class (e.g. `.search-bar--compact`), not a separate component

No two instances of the same UI pattern should ever have divergent styling unless explicitly requested. When you encounter existing duplicates, unify them into the global component.
