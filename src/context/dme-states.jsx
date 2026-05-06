import { createContext, useContext } from 'react';

export const DMEStatesContext = createContext({});
export const DMESetStatesContext = createContext(() => {});

export function useDMEState(key, defaultValue = false) {
  return useContext(DMEStatesContext)[key] ?? defaultValue;
}

export function useDMESetState() {
  return useContext(DMESetStatesContext);
}

/**
 * Hardcoded state definitions. Add new states here via code only —
 * the DME just exposes toggles, it does not create/edit states.
 *
 * type: 'global'  → applies to all pages
 *       '<pageId>' → e.g. 'learn-hub' or 'learn-article' (per-page)
 *       'select'   → rendered as dropdown in DME; options array required
 */
export const STATE_DEFINITIONS = [
  {
    key: 'auth.loggedIn',
    label: 'Auth State',
    description: 'Switch between auth states: logged in, guest play, or logged out',
    type: 'global',
    defaultValue: 'logged-in',
    options: ['logged-in', 'guest', 'logged-out'],
  },
  {
    key: 'toast.demo',
    label: 'Trigger Toast',
    description: 'Fire a sample toast on the current page. "All / NEVER FADE" pins all four toasts on screen until you pick None again. Single values auto-reset to None so they can be re-fired.',
    type: 'global',
    defaultValue: 'None',
    options: ['All / NEVER FADE', 'None', 'Friend Request', 'Friend Accepted', 'Challenge', 'Starred Online'],
  },
  {
    key: 'auth.overlay',
    label: 'Auth Overlay',
    description: 'Full-page Login / Sign Up takeover. Visible on every page when not None.',
    type: 'global',
    defaultValue: 'None',
    options: ['None', 'Login', 'Sign Up', 'Login Error'],
  },
  {
    key: 'profile.viewType',
    label: 'Profile View',
    description: 'Switch between profile view states',
    type: 'select',
    page: 'profile',
    options: [
      'Own - Established',
      'Own - New Player',
      'Friend - Match History',
      'Guest - Match History',
      'Guest - Unregistered',
      'Profile B',
    ],
    defaultValue: 'Own - Established',
  },
  {
    key: 'profile.onlineStatus',
    label: 'Online Status',
    description: 'Controls online indicator on profile avatar',
    type: 'select',
    page: 'profile',
    options: ['Online', 'Offline'],
    defaultValue: 'Online',
  },
  {
    key: 'profile.celebration',
    label: 'Badge Celebration',
    description: 'Trigger badge unlock celebration animation',
    type: 'profile',
    defaultValue: false,
  },
  {
    key: 'profile.mvp',
    label: 'MVP',
    description: 'Toggle MVP feature set',
    type: 'profile',
    defaultValue: true,
  },
  {
    key: 'profile.favorited',
    label: 'Favorited',
    description: 'Show favorited star next to username',
    type: 'profile',
    defaultValue: false,
  },
  {
    key: 'learnArticle.tocExpanded',
    label: 'ToC Expanded',
    description: 'Keep the Table of Contents permanently expanded',
    type: 'learn-article',
    defaultValue: false,
  },
  {
    key: 'learnArticle.launchMvp',
    label: 'MVP',
    description: 'Hide badge/achievement visuals from learn pages',
    type: 'learn',
    defaultValue: true,
  },
  {
    key: 'play.boardState',
    label: 'Board State',
    description: 'Select a preset board position',
    type: 'select',
    page: 'play',
    options: ['Opening', 'Mid-game', 'Bearing Off', 'Bar & Blot', 'Game Over', 'First Roll'],
    defaultValue: 'Opening',
  },
  {
    key: 'play.modal',
    label: 'Modal Overlay',
    description: 'Show a modal dialog over the board',
    type: 'select',
    page: 'play',
    options: ['None', 'Menu', 'Resign', 'Victory', 'Defeat', 'Settings'],
    defaultValue: 'None',
  },

  /* ── Social features ──────────────────────────────────────────── */

  // Index Page — login view
  {
    key: 'index.view',
    label: 'Index View',
    description: 'Switch between Home, Login, Sign Up and Login Error views',
    type: 'select',
    page: 'index',
    options: ['Home', 'Login', 'Sign Up', 'Login Error'],
    defaultValue: 'Home',
  },

  // Profile Page — friend relationship status on other-player profiles
  {
    key: 'profile.friendStatus',
    label: 'Friend Status',
    description: 'Relationship state of the Add Friend button',
    type: 'select',
    page: 'profile',
    options: ['Add Friend', 'Pending', 'Accept Request', 'Friends'],
    defaultValue: 'Add Friend',
    visibleWhen: { 'profile.viewType': ['Friend - Match History', 'Guest - Match History'] },
  },

  // Profile Page — tab + friends
  {
    key: 'profile.tab',
    label: 'Profile Tab',
    description: 'Switch between profile content tabs',
    type: 'select',
    page: 'profile',
    options: ['Match History', 'Achievements', 'Friends'],
    defaultValue: 'Match History',
  },
  {
    key: 'profile.friendsView',
    label: 'Friends View',
    description: 'Switch between friends tab sub-views',
    type: 'select',
    page: 'profile',
    options: [
      'My Friends',
      'Search Results',
      'Empty - No Friends',
      'Empty - No Results',
    ],
    defaultValue: 'My Friends',
    visibleWhen: { 'profile.tab': ['Friends'] },
  },
  {
    key: 'profile.settingsOpen',
    label: 'Settings Popover',
    description: 'Open the Settings popover overlay',
    type: 'profile',
    defaultValue: false,
  },
  {
    key: 'profile.fbDiscovery',
    label: 'FB Discovery',
    description: 'Show Facebook friend discovery card',
    type: 'select',
    page: 'profile',
    options: ['None', 'Matches Found', 'Zero Matches'],
    defaultValue: 'None',
    visibleWhen: { 'profile.tab': ['Friends'] },
  },

  // Settings — used on the standalone /settings page AND inside the
  // Settings popover on the Profile page, so both pages must be in scope.
  {
    key: 'settings.section',
    label: 'Settings View',
    description: 'Switch between settings page states',
    type: 'select',
    page: ['settings', 'profile'],
    options: [
      'Profile',
      'Connected Accounts',
      'Disconnect Confirm',
      'Guard Rail',
      'Error - Already Linked',
      'Notification Preferences',
    ],
    defaultValue: 'Profile',
  },
  {
    key: 'settings.fbConnect',
    label: 'Facebook Connect Flow',
    description: 'Step in the Facebook connect & friend discovery flow',
    type: 'select',
    page: ['settings', 'profile'],
    options: [
      'None',
      'FB Login',
      'FB Authorize',
      'Friends Found',
      'Requests Sent',
      'Connected',
    ],
    defaultValue: 'None',
  },

  // Play Page — social overlays
  {
    key: 'play.profileCard',
    label: 'Profile Card',
    description: 'Show in-game mini profile card',
    type: 'play',
    defaultValue: false,
  },
  {
    key: 'play.cardShowQR',
    label: 'Card: QR Code',
    description: 'Show QR code on player card',
    type: 'play',
    defaultValue: true,
    visibleWhen: { 'play.profileCard': [true] },
  },
  {
    key: 'play.cardShowLogo',
    label: 'Card: Logo',
    description: 'Show Backgammon.com logo on player card',
    type: 'play',
    defaultValue: true,
    visibleWhen: { 'play.profileCard': [true] },
  },
  {
    key: 'play.cardShowDownload',
    label: 'Card: Download',
    description: 'Show download button on player card',
    type: 'play',
    defaultValue: true,
    visibleWhen: { 'play.profileCard': [true] },
  },
  {
    key: 'play.challengeModal',
    label: 'Challenge Modal',
    description: 'Show challenge send/receive modal',
    type: 'select',
    page: 'play',
    options: ['None', 'Send Challenge', 'Incoming Challenge', 'Challenge Expired'],
    defaultValue: 'None',
  },

  // Play Page — opponent friend status for post-game modal
  {
    key: 'play.opponentIsFriend',
    label: 'Opponent Is Friend',
    description: 'Controls Add Friend button visibility on victory/defeat modal',
    type: 'play',
    defaultValue: false,
  },

  // Bell + Unread Count are always-visible header chrome (when the viewer
  // is logged in), so they live at the top level instead of being nested
  // under the dropdown-only Activity Center toggle below.
  {
    key: 'social.bell',
    label: 'Bell',
    description: 'Bell icon visibility and alert state in the header',
    type: 'select',
    page: 'global',
    options: ['Hidden', 'No Alerts', 'Has Alerts'],
    defaultValue: 'Has Alerts',
  },
  {
    key: 'social.unreadCount',
    label: 'Unread Count',
    description: 'Number of unread activity items shown on the bell badge',
    type: 'select',
    page: 'global',
    options: ['0', '1', '3', '5', '12'],
    defaultValue: '3',
    visibleWhen: { 'social.bell': ['Has Alerts'] },
  },

  // Activity Center — master toggle. When on, the dropdown is forced open
  // and its tab / content sub-states become visible below. Bell + Unread
  // Count above are NOT gated on this; they're header chrome always
  // visible to logged-in viewers.
  {
    key: 'social.activityOpen',
    label: 'Activity Center',
    description: 'Force the Activity Center dropdown open and reveal its tab / content sub-states',
    type: 'global',
    defaultValue: false,
  },

  // Surface Preview
  {
    key: 'surfacePreview.surface',
    label: 'Surface',
    description: 'Select which surface to preview',
    type: 'select',
    page: 'surface-preview',
    options: ['Primary', 'Secondary', 'Inverse', 'Accent', 'Tertiary'],
    defaultValue: 'Secondary',
  },

  // Buttons Sheet
  {
    key: 'buttonsSheet.surface',
    label: 'Surface',
    description: 'Select which surface to preview buttons on',
    type: 'select',
    page: 'buttons-sheet',
    options: ['Primary', 'Secondary', 'Inverse', 'Accent', 'Tertiary'],
    defaultValue: 'Primary',
  },

  // Activity Center dropdown sub-states. Gated on the master toggle above
  // so they only show up when the dropdown is actually open.
  {
    key: 'social.tab',
    label: 'Tab',
    description: 'Which tab the Activity Center dropdown is focused on',
    type: 'select',
    page: 'global',
    options: ['Activity', 'Friends Online'],
    defaultValue: 'Activity',
    visibleWhen: { 'social.activityOpen': [true] },
  },
  {
    key: 'social.activityContent',
    label: 'Activity Content',
    description: 'Whether the Activity feed has items or is empty',
    type: 'select',
    page: 'global',
    options: ['Has Activity', 'Empty'],
    defaultValue: 'Has Activity',
    visibleWhen: {
      'social.activityOpen': [true],
      'social.tab': ['Activity'],
    },
  },
];
