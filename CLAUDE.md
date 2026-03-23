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
