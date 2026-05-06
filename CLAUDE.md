# CLAUDE.md — bgdes IDP

## Writing Style Rule

**Never use em dashes (`—`) in any output, comments, code, commit messages, PR descriptions, or written communication.** This is an absolute rule. Substitute with periods, commas, parentheses, semicolons, colons, or simply rephrase the sentence. Do not use en dashes (`–`) as a workaround either. The user has stated this preference explicitly and it applies to every interaction.

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

## Modal / Popup Rule

All modals and popups **must** use the global `.overlay` + `.modal` classes defined in `blocks.css`. On tablet and mobile (`max-width: 1024px`), every modal automatically becomes a bottom-sheet popup (slides up from the bottom, full-width, rounded top corners). Never create page-specific overlay/modal wrappers — always use the global system so behavior is consistent across all pages and breakpoints.

## IDP Stacking Rule

IDP tooling (DME / TokenEditor, RoleTargeter, StatesPanel, DevModeInspector, CommentsInspector, PageNavigator, RadialFAB, AuditPage overlays, etc.) **must always render above every piece of site content**, including site modals, bottom-sheets, full-screen flows like the Facebook Connect overlay, and anything else. Stakeholders need to be able to reach the panels at any time.

How to apply:

1. **Site content z-index ceiling: 10000.** No site modal/overlay/dropdown should exceed this. `--z-modal-top` (1100) is the canonical value; the only legitimate higher values are existing pre-IDP overlays like the Facebook connect flow at 10000.
2. **IDP panel/inspector tier: 99996–100001.** Keep internal stacking inside this range so panels, hover overlays, tooltips, and selection chrome layer correctly relative to each other but always above site content.
3. **IDP top tier: 2147483645–2147483647.** Reserved for the most-prominent IDP elements that must beat even other IDP layers — RadialFAB, the DME modal-overlay shield, ephemeral tooltips that float over panels.
4. When introducing a new IDP panel, use a value in the IDP tier (≥99996). Never inherit a value from site CSS variables like `--z-modal-top`.
5. When raising a site overlay's z-index, stop at 10000. If you feel you need higher, you're really stacking IDP-adjacent content and should join the IDP tier instead.

The invariant: IDP > 10000 > all site content.

## DME-State / In-Page-UI Two-Way Sync Rule

When a DME state controls whether something is visible / open / engaged (Activity Center dropdown, Auth Overlay, FB Connect flow, in-game modals, etc.), the in-page Close X / overlay click / Cancel button **must write back to the DME state**, not just to a local `useState`. Otherwise toggling something on via the State Controller locks the UI in that state because the local close handler can't unset what the DME says is true.

How to apply:

1. Read the DME state with `useDMEState`. Hold a setter via `useDMESetState`.
2. The "open" check is `dmeFoo || localFoo`. Either source can open the UI.
3. The close handler updates **both**: `setLocalFoo(false)` AND, when DME currently has it on, `setDmeStates(prev => ({ ...prev, 'foo.dmeKey': false }))`. Wrap the DME write in an `if (dmeFoo)` so closing in the normal local-only flow doesn't churn DME state.
4. For multi-value DME states (e.g. `'play.modal'` = `'Menu' | 'Resign' | 'Victory' | 'None'`), the close handler resets to the neutral value (`'None'`) when the current value isn't already neutral.
5. Any sub-component that owns its own close (e.g. a sub-modal with an X) should accept `onClose` and call it. Don't have the parent re-mount the sub-component to dismiss; explicit close keeps animations and DME sync working together.

Anti-patterns:

- `closePanel = () => setLocalOpen(false)` when DME also drives `open`. The DME true wins and the panel re-opens.
- Adding a Cancel / X with no `onClick` because the DME state has a default of `None`. The default only applies on first load; once the user / DME flipped it on, the close has to flip it back.
- Reading DME state into a local copy on mount and mutating only the local copy. The DME state stays stale and flipping the State Controller toggle a second time does nothing.

Rule of thumb: every UI close affordance for a DME-controlled surface must end up with the DME state matching what the user just did, so the State Controller and the page agree.

## Auth-Gated Action Rule

Every social CTA in the app (Add Friend, Cancel Request, Accept / Reject Request, Challenge, FB connect, notification accept / decline, in-game add friend, post-game add friend, etc.) **must go through `useRequireAuth()` from `src/hooks/useRequireAuth.jsx`**. The hook exposes:

- `isAuthed` boolean. True only when `auth.loggedIn === 'logged-in'`. `'guest'` and `'logged-out'` both fall back to false.
- `requireAuth(fn)` wrapper. Returns a click handler that runs `fn` when authed, or pops the global Auth Overlay (`auth.overlay = 'Login'`) when not.
- `openAuth()` imperative helper for "Sign in" CTAs that have no underlying action.

How to apply:

1. **Wrap every action handler.** `onClick={requireAuth(() => setShowAddFriendModal(true))}` instead of `onClick={() => setShowAddFriendModal(true)}`. Same for Accept / Reject / Challenge / Connect FB.
2. **Collapse multi-state CTAs to the default state when `!isAuthed`.** A logged-out viewer can never have a relationship, so `FriendButton` always renders Add Friend regardless of `friendStatus` or session override; `AddFriendRowButton` ignores any "Pending" / "Friends" override. The click is still gated, so even the visible default CTA can't write state.
3. **Empty-state guarded surfaces.** Any list that depends on having an account (notifications, activity feed, friend requests, friends list) must render a "Sign in to ..." empty state with `onClick={openAuth}` when `!isAuthed`, and skip rendering the data path entirely. Bell badges, unread counts, and similar derived counts must clamp to 0.
4. **Hide controls that have no meaning unauth'd.** Edit / Settings / FB Discovery card / "Friends" filter dropdown options / etc. should disappear, not just be disabled.
5. **Profile demotion.** When `!isAuthed`, any "Own" view type renders with the visitor CTA rail (`isOwn` forced false, `isOther` forced true) so the page reads as "visiting another player". Player data still keys off the underlying view type so the URL still resolves the correct player.

Anti-patterns to avoid:

- Reading `auth.loggedIn` directly in components for gating purposes. Always go through the hook so behavior stays consistent.
- Disabling a button without redirecting to auth. Disabled buttons read as "not allowed to ever do this", which is wrong; the action just needs an account.
- Wrapping only the visible button while leaving session-state writes happening behind the scenes. Wrap the action, not the chrome.

## Session-Persistent Interactive State Rule

Stakeholders and devs review the IDP by clicking through it. Any UI state change a viewer triggers (cancelling a friend request, accepting an invite, dismissing a banner, starring a favorite, expanding a Show More, etc.) **must persist for the active tab session** so they don't have to re-trigger states every time they navigate or refresh. This is *not* the same as changing the default state for everyone — defaults stay defaults; the viewer's own changes simply stick.

How to apply:

1. Use `useSessionState(key, initial)` or `useSessionSet(key)` from `src/hooks/useSessionState.jsx` instead of `useState` for any state that represents a viewer-driven mutation of mock data (cancellations, accepts, dismissals, toggles like favorited/followed, expanded sections, locally-acknowledged notifications, etc.).
2. Use a stable, descriptive `key` namespaced to the page/feature (e.g. `pp-friends-cancelled-requests`, `pp-friend-request-cancelled:${username}`). Per-entity state should include the entity id/username in the key so different entities don't share state.
3. Plain ephemeral UI state (modal open/closed, hover, focus, in-flight animations, search input text, dropdown open) stays as `useState` — it is not a meaningful "change" the viewer wants preserved.
4. DME states already persist via `sessionStorage('dme-states')` — do not duplicate. `useSessionState` is for state that lives outside `STATE_DEFINITIONS`.
5. When introducing a new interactive flow, default to `useSessionState`. The bar to *not* use it is "this state is purely cosmetic / in-flight."

The goal: a stakeholder should be able to click through the entire site, stack up a series of state changes, and have everything they did still be reflected on every page they revisit until they close the tab.

## URL State Parameter Rule

Every DME state defined in `STATE_DEFINITIONS` (src/context/dme-states.jsx) is automatically synced to URL query parameters via the helpers in `main.jsx`. When adding new states, no extra URL work is needed — the sync is driven by `STATE_DEFINITIONS`. Just ensure:
1. The state has a `key` and `defaultValue` in STATE_DEFINITIONS
2. Select states have an `options` array for validation
