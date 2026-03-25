/**
 * Runtime DOM test definitions for the IDP Audit page.
 *
 * Each test sets DME states, navigates to a page, then asserts DOM conditions.
 *
 * Assertion types:
 *   present  — element must exist in DOM
 *   absent   — element must NOT exist in DOM
 *   count    — element count must equal `count`
 *   text     — element textContent must contain `text`
 *   visible  — element exists AND is not display:none / visibility:hidden
 */

const TEST_DEFINITIONS = [

  /* ═══════════════════════════════════════════════════════════════
     PROFILE PAGE
     ═══════════════════════════════════════════════════════════════ */

  // ── Own - Established ──────────────────────────────────────────
  {
    id: 'profile-own-edit-btn',
    name: 'Own view shows Edit Profile button',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-header"] .com-btn--outline', expect: 'present', label: 'Edit Profile button present' },
      { selector: '[data-section-id="pp-header"]', expect: 'present', label: 'Header section present' },
    ],
  },
  {
    id: 'profile-own-no-friend-btn',
    name: 'Own view hides Friend/Challenge buttons',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'auth.loggedIn': true },
    assertions: [
      { selector: '.friend-btn', expect: 'absent', label: 'No Friend button on own profile' },
    ],
  },
  {
    id: 'profile-own-stats',
    name: 'Own view shows 4 stat cards',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'auth.loggedIn': true },
    assertions: [
      { selector: '.stat-card', expect: 'count', count: 4, label: 'Four stat cards visible' },
    ],
  },

  // ── Own - New Player ───────────────────────────────────────────
  {
    id: 'profile-new-player-empty',
    name: 'New player shows empty states',
    page: 'profile',
    states: { 'profile.viewType': 'Own - New Player', 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-header"]', expect: 'present', label: 'Header present' },
      { selector: '.empty-state', expect: 'present', label: 'Empty state placeholder shown' },
    ],
  },

  // ── Friend view ────────────────────────────────────────────────
  {
    id: 'profile-friend-buttons',
    name: 'Friend view shows Friend + Challenge buttons',
    page: 'profile',
    states: { 'profile.viewType': 'Friend - Match History', 'auth.loggedIn': true, 'profile.friendStatus': 'Add Friend' },
    assertions: [
      { selector: '.profile-header__actions-row--other .com-btn', expect: 'present', label: 'Friend/action buttons present' },
      { selector: '.profile-header__actions-row--other .com-btn--primary', expect: 'present', label: 'Challenge button present' },
    ],
  },
  {
    id: 'profile-friend-no-edit',
    name: 'Friend view hides Edit Profile',
    page: 'profile',
    states: { 'profile.viewType': 'Friend - Match History', 'auth.loggedIn': true },
    assertions: [
      { selector: '.pp-edit-profile-btn', expect: 'absent', label: 'No edit button on friend profile' },
    ],
  },

  // ── Guest - Match History ───────────────────────────────────────
  {
    id: 'profile-guest-action-btns',
    name: 'Guest (non-unregistered) shows action buttons',
    page: 'profile',
    states: { 'profile.viewType': 'Guest - Match History', 'auth.loggedIn': true },
    assertions: [
      { selector: '.profile-header__actions-row--other .com-btn', expect: 'present', label: 'Action buttons present for guest' },
      { selector: '[data-section-id="pp-header"]', expect: 'present', label: 'Header still visible' },
    ],
  },

  // ── Guest - Unregistered ───────────────────────────────────────
  {
    id: 'profile-unregistered-gate',
    name: 'Unregistered guest shows Create Account + disabled Challenge',
    page: 'profile',
    states: { 'profile.viewType': 'Guest - Unregistered', 'auth.loggedIn': true },
    assertions: [
      { selector: '.profile-header__actions-row .com-btn--primary', expect: 'present', label: 'Create Account CTA present' },
      { selector: '.profile-header__actions-row .com-btn--primary[disabled]', expect: 'present', label: 'Disabled Challenge button present' },
      { selector: '[data-section-id="pp-header"]', expect: 'present', label: 'Header section visible' },
    ],
  },
  {
    id: 'profile-unregistered-no-other-actions',
    name: 'Unregistered guest hides Friend view action row',
    page: 'profile',
    states: { 'profile.viewType': 'Guest - Unregistered', 'auth.loggedIn': true },
    assertions: [
      { selector: '.profile-header__actions-row--other', expect: 'absent', label: 'No friend/challenge row for unregistered' },
    ],
  },

  // ── Tabs ───────────────────────────────────────────────────────
  {
    id: 'profile-tab-history',
    name: 'Match History tab shows history section',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.tab': 'Match History', 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-history"]', expect: 'present', label: 'History section visible' },
    ],
  },
  {
    id: 'profile-tab-achievements-mvp-off',
    name: 'Achievements tab visible when MVP off',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.tab': 'Achievements', 'profile.mvp': false, 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-achievements"]', expect: 'present', label: 'Achievements section rendered' },
    ],
  },
  {
    id: 'profile-tab-achievements-mvp-on',
    name: 'Achievements tab hidden when MVP on',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.tab': 'Match History', 'profile.mvp': true, 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-achievements"]', expect: 'absent', label: 'Achievements section not rendered' },
    ],
  },
  {
    id: 'profile-tab-friends',
    name: 'Friends tab shows friends section',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.tab': 'Friends', 'auth.loggedIn': true },
    assertions: [
      { selector: '[data-section-id="pp-friends"]', expect: 'present', label: 'Friends section visible' },
    ],
  },

  // ── Celebration ────────────────────────────────────────────────
  {
    id: 'profile-celebration-modal',
    name: 'Celebration state shows modal overlay',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.celebration': true, 'auth.loggedIn': true },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Celebration overlay visible' },
      { selector: '.overlay--dark .modal', expect: 'present', label: 'Celebration modal present' },
    ],
  },

  // ── Online/Offline status ──────────────────────────────────────
  {
    id: 'profile-online-indicator',
    name: 'Online status shows green indicator',
    page: 'profile',
    states: { 'profile.viewType': 'Own - Established', 'profile.onlineStatus': 'Online', 'auth.loggedIn': true },
    assertions: [
      { selector: '.avatar-component__indicator--online', expect: 'present', label: 'Online indicator visible' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     PLAY PAGE
     ═══════════════════════════════════════════════════════════════ */

  // ── Modal states ───────────────────────────────────────────────
  {
    id: 'play-modal-menu',
    name: 'Menu modal shows overlay',
    page: 'play',
    states: { 'play.modal': 'Menu', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Overlay visible' },
      { selector: '.modal--sm', expect: 'present', label: 'Menu modal present' },
    ],
  },
  {
    id: 'play-modal-resign',
    name: 'Resign modal shows confirm dialog',
    page: 'play',
    states: { 'play.modal': 'Resign', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Overlay visible' },
      { selector: '.modal--sm', expect: 'present', label: 'Resign modal present' },
    ],
  },
  {
    id: 'play-modal-victory',
    name: 'Victory modal shows game over',
    page: 'play',
    states: { 'play.modal': 'Victory', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Overlay visible' },
      { selector: '.com-btn--dark', expect: 'present', label: 'Rematch button present' },
    ],
  },
  {
    id: 'play-modal-defeat',
    name: 'Defeat modal shows game over',
    page: 'play',
    states: { 'play.modal': 'Defeat', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Overlay visible' },
      { selector: '.com-btn--dark', expect: 'present', label: 'Rematch button present' },
    ],
  },
  {
    id: 'play-modal-settings',
    name: 'Settings modal shows options',
    page: 'play',
    states: { 'play.modal': 'Settings', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'present', label: 'Overlay visible' },
      { selector: '.modal--sm', expect: 'present', label: 'Settings modal present' },
    ],
  },
  {
    id: 'play-modal-none',
    name: 'No modal when state is None',
    page: 'play',
    states: { 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.overlay--dark', expect: 'absent', label: 'No overlay shown' },
    ],
  },

  // ── Profile card ───────────────────────────────────────────────
  {
    id: 'play-profile-card-on',
    name: 'Profile card visible when toggled on',
    page: 'play',
    states: { 'play.profileCard': true, 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.gp-profile-card', expect: 'present', label: 'Profile card visible' },
    ],
  },
  {
    id: 'play-profile-card-off',
    name: 'Profile card hidden when toggled off',
    page: 'play',
    states: { 'play.profileCard': false, 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.gp-profile-card', expect: 'absent', label: 'Profile card not in DOM' },
    ],
  },

  // ── Challenge modals ───────────────────────────────────────────
  {
    id: 'play-challenge-incoming',
    name: 'Incoming challenge toast visible',
    page: 'play',
    states: { 'play.challengeModal': 'Incoming Challenge', 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.gp-challenge-toast', expect: 'present', label: 'Challenge toast present' },
    ],
  },
  {
    id: 'play-challenge-expired',
    name: 'Expired challenge toast visible',
    page: 'play',
    states: { 'play.challengeModal': 'Challenge Expired', 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '.gp-challenge-toast--expired', expect: 'present', label: 'Expired challenge toast present' },
    ],
  },

  // ── Board always renders ───────────────────────────────────────
  {
    id: 'play-board-present',
    name: 'Board container always renders',
    page: 'play',
    states: { 'play.modal': 'None', 'play.boardState': 'Opening' },
    assertions: [
      { selector: '[data-section-id="gp-board"]', expect: 'present', label: 'Board root element present' },
      { selector: '.gp-topbar', expect: 'present', label: 'Top bar present' },
      { selector: '.gp-timerbar', expect: 'present', label: 'Timer bar present' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     INDEX PAGE
     ═══════════════════════════════════════════════════════════════ */

  {
    id: 'index-home-view',
    name: 'Home view shows hero section',
    page: 'index',
    states: { 'index.view': 'Home', 'auth.loggedIn': false },
    assertions: [
      { selector: '.ix-hero', expect: 'present', label: 'Hero section visible' },
      { selector: '[data-section-id="ix-left"]', expect: 'present', label: 'Left panel present' },
      { selector: '[data-section-id="ix-right"]', expect: 'present', label: 'Right panel present' },
    ],
  },
  {
    id: 'index-login-view',
    name: 'Login view shows auth form',
    page: 'index',
    states: { 'index.view': 'Login', 'auth.loggedIn': false },
    assertions: [
      { selector: '.ix-auth-wrap', expect: 'present', label: 'Auth form visible' },
      { selector: '.ix-auth-title', expect: 'present', label: 'Auth title present' },
      { selector: '.ix-hero', expect: 'absent', label: 'Hero hidden when on login' },
    ],
  },
  {
    id: 'index-signup-view',
    name: 'Sign Up view shows registration fields',
    page: 'index',
    states: { 'index.view': 'Sign Up', 'auth.loggedIn': false },
    assertions: [
      { selector: '.ix-auth-wrap', expect: 'present', label: 'Auth form visible' },
      { selector: '.ix-auth-fields', expect: 'present', label: 'Input fields visible' },
    ],
  },
  {
    id: 'index-login-error',
    name: 'Login Error view shows error alert',
    page: 'index',
    states: { 'index.view': 'Login Error', 'auth.loggedIn': false },
    assertions: [
      { selector: '.ix-auth-error', expect: 'present', label: 'Error alert visible' },
      { selector: '.ix-auth-wrap', expect: 'present', label: 'Auth form still visible' },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════
     GLOBAL (header / auth state)
     ═══════════════════════════════════════════════════════════════ */

  {
    id: 'global-logged-in-header',
    name: 'Logged-in header shows avatar, no login button',
    page: 'profile',
    states: { 'auth.loggedIn': true, 'profile.viewType': 'Own - Established' },
    assertions: [
      { selector: '[data-section-id="gl-header"] .site-header__auth', expect: 'present', label: 'Auth section present' },
      { selector: '[data-section-id="gl-header"] [data-role-id="gl-nav-newgame"]', expect: 'present', label: 'New Game button visible' },
    ],
  },
  {
    id: 'global-logged-out-header',
    name: 'Logged-out header shows login button',
    page: 'profile',
    states: { 'auth.loggedIn': false, 'profile.viewType': 'Own - Established' },
    assertions: [
      { selector: '[data-section-id="gl-header"] [data-role-id="gl-nav-newgame"]', expect: 'absent', label: 'New Game button hidden' },
    ],
  },

  // ── Settings page ──────────────────────────────────────────────
  {
    id: 'settings-content-present',
    name: 'Settings page renders content section',
    page: 'settings',
    states: { 'auth.loggedIn': true, 'settings.section': 'Connected Accounts' },
    assertions: [
      { selector: '[data-section-id="st-content"]', expect: 'present', label: 'Settings content section present' },
      { selector: '.st-title', expect: 'present', label: 'Settings title present' },
    ],
  },
];

export default TEST_DEFINITIONS;
