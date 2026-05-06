# Social V1, Design & States Checklist

**Project:** Backgammon.com, Friends, Game Invites, Notifications, Social Login, FB Discovery
**Phase:** Phase 1 MVP, web only
**Purpose:** Working tracker for design surfaces, states, and triggers. Built for use on bgdes.heath.co to show every visual state and what triggers it.
**Source spec:** [Friends & Game Invites (Phase 1)](https://www.notion.so/327ae547865c8182a0bcf4dd2cba254c)

---

## Status legend

- `[x]` Built and visible in the IDP today.
- `[~]` Partially built. Specific gaps noted inline.
- `[ ]` Not yet built.

Notes after each section call out what is interesting, ambiguous, or needs design alignment.

---

## How to use this file

Each surface is broken into the visual states it has and what triggers transitions between them. Check items as states are designed and represented in the showcase. Use Out of Scope as a reference for what not to design.

---

## Pre-flight

- [ ] Header host placement decided (with Adelaide). Bell + Friends nav need a home.
- [~] Profile + Friends visual language locked. Avatar treatment, card density, online status, relationship CTA. Profile + friends pages exist with consistent treatment, but pressed/loading states and toast/upgrade-modal patterns still need agreement before everything else inherits.
- [~] Siena tokens applied across all components. Surface tokens drive most of the UI, but a couple of FB modal copies hardcoded mint values to override an inverse-surface inheritance bug. Worth a token audit pass.

---

## Shared components

These show up across multiple surfaces. Design once, reference everywhere.

### Avatar

- [ ] Sizes: 32px. (We have lg/md/sm/xl, but the explicit 32px size from the spec is not exposed yet.)
- [x] Sizes: 48px, 64px, 96px (`Avatar` size lg / xl / etc).
- [x] States: default, online (green dot), offline (gray dot).
- [ ] Status loading state (avatar rendered, dot still resolving). No skeleton/placeholder for the dot today.
- [x] Source variants: character portrait, FB photo (`FB_PHOTOS` mapping in profile + activity center).
- [x] Fallback: missing image to default character (`avatar-dink.png`).

### Friend / player card

- [x] Large variant. 48px avatar in `pp-friend-row` with comfortable padding.
- [x] Dense variant. Same row class with smaller avatar in search/notification surfaces.
- [~] Hover state. Some rows have hover backgrounds, not all card surfaces.
- [ ] Pressed/active state. Not formalised across all card variants.
- [ ] Loading skeleton.

### Relationship CTA button (one component, seven states)

- [x] **Add**, default, no relationship.
- [x] **Request sent**, outgoing pending. Now an enabled `Cancel Request` button (was previously a disabled pill, swapped earlier this session).
- [x] **Accept / Decline**, incoming pending. Two buttons present in NotificationsPage and ActivityCenter; profile-page Accept also session-persists.
- [x] **Friends**, already friends. Includes Unfriend overflow menu.
- [x] **Self**, hidden (no button on own profile).
- [ ] **Guest**, visible, opens login-upgrade modal on tap. Currently shows the same Add Friend modal regardless of auth.
- [ ] **Loading**, mid-action transition state.
- [ ] **Error**, request failed, with retry affordance.

Notes: All four happy-path transitions persist for the tab session via `useSessionState` keyed `pp-relationship:${username}`, so a state change on one surface (search, FB discovery, profile, in-game card, post-game) is reflected on every other surface.

### Notification card (one component, six type variants)

- [x] **Friend request received**, sender avatar, name, Accept + Decline buttons.
- [x] **Friend request accepted**, friend avatar, name, tap to profile.
- [x] **Challenge received**, sender avatar, name, format, Accept + Decline buttons.
- [x] **Challenge accepted**, opponent name, tap to game (passive notification).
- [x] **Challenge declined**, opponent name, informational (passive notification).
- [x] **FB friends found**, match count, list, tap to friends page.
- [~] Read vs unread visual treatment. Passive items render at `opacity: 0.75`, but there is no formal read/unread chip, color, or left-border treatment.
- [~] Hover state. ActivityCenter rows have a hover background; NotificationsPage rows do not.
- [ ] Action button loading state (after Accept/Decline tap).

### Empty state template

- [x] Illustration slot (icon SVG today, not full illustration).
- [x] Headline + supporting text.
- [x] Optional CTA.

### Login-upgrade modal

- [ ] Triggered by every guest CTA. **Not built.** This blocks the guest paths in: relationship CTA, challenge button, FB discovery, notifications.
- [ ] Single design, used universally.

### Provider button

- [x] Google variant (login screen, IndexPage).
- [~] Apple variant. Present, but not audited against Apple HIG (size, shape, color, corner radius, exact wording).
- [x] Facebook variant. Now uses the official `fb-logo.png` everywhere.
- [ ] Hover, pressed, loading states for each. None of these are formalised.

### Confirm modal template

- [x] Standard variant (Unfriend, Cancel Request, Disconnect Google, Remove Facebook).
- [ ] FB-with-photo-warning variant (disconnect). Current FB disconnect uses the standard variant; needs the photo-loss warning copy.

### Toast

- [ ] Success variant (request sent, friend added, etc.).
- [ ] Info variant (challenge declined, etc.).
- [ ] Error variant (action failed).
- [ ] With action variant (incoming challenge w/ inline Accept/Decline).
- [ ] Dismiss interaction.

**Toast is the single biggest missing primitive.** Several checklist items across notifications, sign-in, and FB discovery resolve through toasts.

---

## Bucket 1: Friends

### Surface: Friends page (`/friends`)

- [x] **Default state**, list of friends. Online first then mock-data order. Alphabetical secondary sort not applied yet.
- [x] **Empty state**, no friends yet. The "Connect Facebook" CTA in the empty state was removed because all FB elements on the friends tab are now gated on the user being connected to FB in settings.
- [ ] **Loading state**, skeleton cards.
- [ ] **Status loading state**, list rendered, online dots populating.
- [ ] **Pagination**, load more / infinite scroll behavior, end-of-list indicator. Friends list is rendered all-at-once today.
- **Triggers:**
  - [x] Tap friend card opens public profile (PlayerCardModal).
  - [x] Tap Challenge button opens Challenge modal.
  - [x] Tap Unfriend opens Confirm modal.
  - [ ] Friend comes online, status dot updates green in place. (Static today.)
  - [ ] Friend goes offline, status dot updates gray in place. (Static today.)

### Surface: Public profile (`/u/:username`)

- [x] **Viewer mode**, same layout as self-profile, social CTAs replace edit controls.
- [x] **CTA rail:** Add Friend / Challenge / View Match History.
- [x] **State: not friends**, Add Friend visible.
- [x] **State: request sent**, pending state with Cancel.
- [~] **State: incoming request**, Accept + Decline visible. Profile shows Accept Request as a single button; Decline is not surfaced on the profile rail (it lives in NotificationsPage / ActivityCenter).
- [x] **State: already friends**, Friends + Challenge visible.
- [x] **State: self**, edit controls instead.
- [ ] **State: guest viewing**, CTAs open login-upgrade modal. Modal does not exist yet.
- **Triggers:**
  - [x] Tap Add Friend, request sent, button transitions to pending.
  - [x] Tap Challenge opens Challenge modal.
  - [x] Tap Match History scrolls to history view.

### Surface: Unified search

- [x] **Empty state**, before typing.
- [x] **Typing state**, autocomplete results appear.
- [x] **Results state**, friends section at top, divider, other players below.
- [x] **No results state**, "No players found".
- [ ] **Rate-limited state**, search hit (10/min), input disabled with messaging.
- **Triggers:**
  - [x] Type query, results populate.
  - [x] Tap result opens public profile.
  - [x] Tap Add Friend in result transitions to pending (`AddFriendRowButton`).

### Surface: Pending requests section

- [x] **Incoming requests** in NotificationsPage with Accept + Decline (session persistence on actioning).
- [x] **Outgoing requests** on Friends tab with Cancel (session persistence on cancel; cancellations also hide the row in NotificationsPage's outgoing pile).
- [x] **Empty state**, no pending requests (NotificationsPage handles this).
- **Triggers:**
  - [x] Tap Accept resolves, removes from list.
  - [x] Tap Decline resolves, removed from incoming list.
  - [x] Tap Cancel (outgoing) removed from list.
  - [ ] New incoming request arrives, list updates in place. (No live-update simulation.)

### Surface: In-game mini profile card

- [x] **Default state**, opponent avatar, name, rating (`PlayerCardModal` via `InGameProfileCard`).
- [x] **Overlay treatment**, appears over game without leaving game.
- [x] **CTAs:** Add Friend, View Profile.
- [x] **State: not friends**, Add Friend visible.
- [x] **State: request sent**, pending state (uses the shared per-username relationship session key).
- [x] **State: friends**, different CTA (Add Friend hidden via `showAddFriend={!opponentIsFriend}`).
- **Triggers:**
  - [x] Tap opponent avatar mid-game, card appears.
  - [x] Tap Add Friend, request sent inline.
  - [ ] Tap View Profile path. Currently the card is a modal; "View Profile" navigation behavior on web is undecided (open in overlay vs leave game).
  - [x] Tap outside, dismiss.

### Surface: Post-game add-friend

- [x] **Add-friend icon placement** on end-match modal (`GameOverModal`).
- [x] **State: not friends**, icon visible, tappable, opens slide-in confirm panel.
- [x] **State: request sent**, confirmation feedback inline + persists per-username.
- [x] **State: already friends**, icon hidden via `opponentIsFriend` DME.

### Friends-specific edge cases (visual states)

- [ ] **Reciprocal auto-accept**, distinct success state ("You're now friends with B" instead of "Request sent").
- [ ] **Daily limit reached**, 50 outgoing requests/day. User-visible message with copy.
- [ ] **Friend cap reached**, 500 friends. User-visible message.
- [ ] **Self-request blocked**, never reachable via UI but error copy needed.
- [ ] **Duplicate pending blocked**, copy + state.
- [ ] **Target user not found**, error state in search/request flow.

---

## Bucket 2: Game Invites

### Surface: Challenge modal

- [~] **Default state**, opponent preview (avatar, username, rating) + format selector. Current `ChallengeModal` is a confirm-only modal; format selector missing.
- [ ] **Format options**, single, 3-pt, 5-pt, 7-pt, with selected state.
- [ ] **Sending state**, loading after Send tap. (Current implementation flips a local `sent` flag with a 1.2s timer, no spinner state.)
- [ ] **Error: receiver went offline** between open and send.
- [ ] **Error: existing pending challenge** between you and this player.
- **Triggers:**
  - [x] Open from friend's profile or friends list.
  - [ ] Select format, highlight option.
  - [~] Tap Send, loading, close modal + show outgoing pending state somewhere. Modal closes, but no outgoing pending challenge surface exists yet.
  - [x] Tap outside / Cancel, dismiss.

### Surface: Challenge button (on profile + friends list)

- [x] **State: friend online**, Challenge visible, active.
- [ ] **State: friend offline**, Challenge hidden or disabled with reason. Currently always visible.
- [x] **State: self**, hidden.
- [ ] **State: guest**, opens login-upgrade modal.
- [ ] **State: pending challenge between you**, Challenge replaced with "Pending" or hidden.

### Surface: Incoming challenge prompt

- [ ] **Toast variant**. No toast component yet.
- [x] **Notification card variant**, in NotificationsPage and ActivityCenter dropdown with Accept / Decline.
- [ ] **State: accept loading**, after Accept tap, before game starts.
- [ ] **State: accept failed**, Director service down, challenge reverts to pending. Retry affordance.
- [ ] **State: declined feedback**, sender-side toast or notification.
- **Triggers:**
  - [ ] Challenge arrives, toast appears.
  - [x] Tap Accept resolves the card via session set.
  - [x] Tap Decline resolves, removed from list.
  - [ ] Toast dismissed without action, still available in notification dropdown.

### Surface: Outgoing pending challenge state

- [ ] Where does this live? On profile? On friends list row? In notification dropdown? **Open question.**
- [ ] **State: pending**, visible to sender with Cancel affordance.
- [ ] **State: accepted**, disappears, both navigate to game.
- [ ] **State: declined**, toast/notification to sender.
- [ ] **State: expired (48hr)**, removed from list, optional notification.

### Game Invites edge cases (visual states)

- [ ] **Receiver went offline**, error toast/copy.
- [ ] **Already a pending challenge between you**, error copy.
- [ ] **Accept failure**, game creation fails, challenge back to pending, retry path.
- [ ] **48hr expiry**, silent server-side, but UI handles "this challenge expired" gracefully on next view.

---

## Bucket 3: Notifications

### Surface: Bell icon

- [x] **State: no unread**, bell only.
- [x] **State: unread**, bell + badge with count.
- [ ] **State: high count**, badge formatting at 10+, 99+. Not validated against high counts.
- [ ] **State: live update**, badge animates when new notification arrives.
- [~] **Hover / focus state.** Bell has a basic cursor; no formal focus ring or hover treatment lock-in.
- **Triggers:**
  - [ ] Notification arrives, badge updates + optional toast. (Static mock data.)
  - [x] Tap bell opens dropdown (ActivityCenter).
  - [ ] Mark all read, badge clears.

### Surface: Notification dropdown

- [x] **Default state**, list of notification cards, newest first (ActivityCenter).
- [ ] **Empty state**, "No notifications yet".
- [ ] **Guest empty state**, distinct copy/treatment.
- [ ] **Loading state**, skeleton cards.
- [ ] **Mark all read affordance**, visible when unread exist.
- [ ] **End of list**, pagination or "no more" indicator.
- **Triggers:**
  - [x] Tap notification routes to relevant surface.
  - [x] Tap Accept/Decline on actionable card resolves inline (filtered out of list via session set).
  - [ ] Tap Mark all read, all cards transition to read state.
  - [ ] New notification arrives, appears at top of list.

### Surface: Live toast (per-event)

- [ ] One toast per incoming event.
- [ ] Dedupe between typed event + generic notification.
- [ ] Auto-dismiss timing.
- [ ] Manual dismiss.
- [ ] Action variants for friend request and challenge (inline Accept/Decline).

---

## Bucket 4: Sign-in & Connected Accounts

### Surface: Login screen

- [x] **Default state**, three provider buttons (Google, Apple, Facebook).
- [~] **Provider button order.** Current order on IndexPage is Google, Apple, Facebook. Pick-one decision still needs explicit sign-off.
- [ ] **Loading state**, after tap, before OAuth flow.
- [ ] **State: OAuth cancelled**, return to default.
- [ ] **State: OAuth failed**, error message, retry path.
- [ ] **State: popup blocked**, recovery copy.
- [ ] **Apple HIG compliance**, exact button spec, do not deviate. Not audited.
- [~] **Guest viewing.** Login screen IS the upgrade path conceptually, but the in-product "tap a guest CTA -> upgrade modal" surface is not built.

### Surface: Settings > Connected Accounts

- [x] **Default state**, three rows (Google, Apple, Facebook).
- [x] **State per row: connected**, provider name, optional email/avatar, Disconnect button.
- [x] **State per row: not connected**, Connect button.
- [ ] **State per row: connecting**, loading.
- [ ] **State per row: last login method**, Disconnect disabled with explanatory tooltip/copy.
- [ ] **Apple-specific: relay email**, `xyz@privaterelay.appleid.com` displays cleanly.
- [ ] **Apple-specific: name confirmation**, first sign-in shows name with edit affordance (Apple only sends it once).

### Surface: Disconnect confirmation modal

- [x] **Standard variant**, "You won't be able to sign in with [provider] anymore". Current FB Remove modal uses this.
- [ ] **FB variant**, adds warning that profile photo will be removed.
- [ ] **Loading state**, after Confirm tap.
- **Triggers:**
  - [x] Tap Disconnect, modal opens (now portalled to body so it centers on viewport).
  - [x] Confirm, row updates to "Connect" (session-persisted via `settings.fbIsConnected`).
  - [x] Cancel, dismiss.

### Surface: Account linking outcomes

- [ ] **Same email exists**, auto-link with confirmation toast.
- [ ] **Different email**, link as additional identity, confirmation.
- [ ] **Email already on different account**, blocked, support contact copy.

### Sign-in edge cases (visual states)

- [ ] OAuth cancelled by user.
- [ ] OAuth popup blocked by browser.
- [ ] Generic OAuth failure (network, timeout, etc.), single error state covers it.
- [ ] First-time Apple sign-up with name capture.
- [ ] First-time Apple sign-up with relay email.

---

## Bucket 5: Facebook Friend Discovery

### Surface: Friend discovery modal

- [x] **Match state**, "X of your Facebook friends play on Backgammon.com!".
- [x] **Zero-match state.** Connect flow now skips the friends-list modal and routes straight to the Connected confirmation when `profile.fbDiscovery` is `Zero Matches`. The Friends-tab discovery card also has a Zero Matches variant.
- [ ] **Loading state**, fetching matches.
- [ ] **Error state**, FB API failed.
- [x] **List of matched users**, each with per-row state.
- [x] **Per-row state: not added**, Add button (`AddFriendRowButton`).
- [x] **Per-row state: request sent**, pending, with Cancel. (Cancel happens via the Friends tab's pending section, not in the FB modal itself.)
- [ ] **Per-row state: already friends**, disabled or "Friends" badge inside the FB modal. Currently every row offers Add.
- [~] **Add All button states.** "Add N Friends" footer button submits all selected friends in one click and routes to Requests Sent. No idle / in-progress / partial-success / complete progressive states.
- **Triggers:**
  - [x] Modal appears post-FB-connect (and from DME for IDP previewing).
  - [x] Tap Add (per row) transitions to pending.
  - [x] Tap Add All. Bulk action, submits all selected.
  - [x] Tap close, dismiss (Skip routes to the Connected confirmation now).

### Surface: Avatar selector with FB photo

- [ ] **Default state**, character portraits + "Use Facebook photo" option (if FB connected).
- [ ] **Auto-suggest on first FB connect**, prompt to use FB photo as avatar.
- [ ] **State: FB photo currently set**, visual indicator.
- [ ] **State: FB disconnected**, FB photo option hidden, avatar reverts to character.

### Surface: FB disconnect flow (lives in Connected Accounts)

- [ ] **Warning copy**, FB photo will be removed as your avatar.
- [ ] **Avatar fallback**, what becomes their avatar after disconnect? (Open item, owner: Rob.)
- [x] **Confirmation**, Yes, disconnect / Cancel (basic confirm, missing the FB-specific photo warning).

### FB Discovery edge cases (visual states)

- [ ] FB API failure, graceful error.
- [ ] User denies `user_friends` scope, fallback experience (still allow login, just no friend matching).
- [~] Long matched-users list. FB Discovery card on the Friends tab uses Show More/Less to expand from 3 to all. The FB connect modal's friends list is scrollable but has no pagination.
- [ ] Add All partial failure, visual state showing succeeded vs failed.

---

## Cross-cutting context worth knowing

- **Session-persistent UI rule** is enforced in code via `useSessionState` and `useSessionSet` (`src/hooks/useSessionState.jsx`). Anything a stakeholder clicks (cancel a request, accept an invite, connect FB, mark a row "friends") sticks for the tab session and is shared across surfaces using a small set of well-known keys (`pp-relationship:${username}`, `pp-friends-cancelled-requests`, `notif-accepted-friend-requests`, etc.).
- **IDP layering rule.** All IDP panels render at z-index 99996+ so site overlays (FB modal, settings popover) cannot occlude them. Any new full-screen or popover surface should stay at or below 10000.
- **FB Connect flow is portalled to `document.body`.** The settings popover wraps content in a `transform`ed slider, which would otherwise clip a `position: fixed` overlay. Disconnect dialogs were portalled too. Any future fullscreen modal triggered from inside settings should follow the same pattern.
- **FB element gating.** The Friends tab now only renders FB-related elements (FB Discovery card, Connect Facebook CTAs) when `settings.fbIsConnected` is true. Connect happens via Settings.
- **`profile.fbDiscovery` is the single source of truth** for "has Facebook matches". Drives both the Friends tab discovery card and the FB connect flow's empty-state branch (skip Friends Found, go to Connected when Zero Matches).
- **DME `settings.fbConnect` is reset to `None` on settings open** so a sticky DME state from a previous session can't auto-pop the FB modal when the popover mounts.

## Open Items Needing Alignment

| Item | Owner |
|---|---|
| Header host placement | Rob + Adelaide |
| Public profile guest-readability | Product |
| Post-game challenge creation in Phase 1 | Product |
| Web push scope (Phase 1 vs fast-follow) | Product |
| FB photo deletion timing (immediate vs 30-day grace) | Legal + Product |
| Avatar fallback after FB disconnect | Rob |
| Outgoing pending challenge surface placement | Product + Rob |
| Provider button order on login screen | Product |

---

## Out of Scope (don't design these)

**Friends:**
- Follow (one-way connections)
- Friends list privacy setting
- Sort/filter friends (basic online-first sort done; broader filtering not in scope)
- Block/mute UI
- Contact-based friend import
- Friend recommendations algorithm

**Game Invites:**
- Challenges to non-friends
- Challenge history view
- Rematch flow

**Notifications:**
- Email or SMS notifications
- Per-type opt-out preferences screen
- Web push permission prompts (deferred to fast-follow)

**Social Login:**
- Account merge flow
- Google profile photos as avatars
- User-uploaded profile photos

**FB Discovery:**
- "Notify when FB friend joins later" surface
- Instagram integration

**Cross-cutting:**
- Group chat or messaging UI
- Activity feeds
- Clubs / team structures
- Friend leaderboards
- Gift-sending or social currency
- Mobile UI for any of the above

---

## Reference Links

- [Parent spec](https://www.notion.so/327ae547865c8182a0bcf4dd2cba254c)
- [Product Context](https://www.notion.so/336ae547865c8108a57bc44ff2889bd8)
- [WS1: Sign-in & Connected Accounts](https://www.notion.so/336ae547865c81a58ff1fe9cd56290d3)
- [WS2: Friends](https://www.notion.so/336ae547865c81398849ee484eabf6ff)
- [WS3: Game Invites](https://www.notion.so/336ae547865c819e81def776c2b61d3b)
- [WS4: Notifications](https://www.notion.so/336ae547865c81d29f77eb92eaf799f4)
- [WS5: FB Discovery](https://www.notion.so/336ae547865c81eb858efa1b9f6eb321)
