import { createContext, useContext } from 'react';

export const DMEStatesContext = createContext({});

export function useDMEState(key, defaultValue = false) {
  return useContext(DMEStatesContext)[key] ?? defaultValue;
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
    label: 'Logged In',
    description: 'Show authenticated state: player avatar',
    type: 'global',
    defaultValue: true,
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
      'Friend - Game History',
      'Guest - Game History',
      'Guest - Unregistered',
    ],
    defaultValue: 'Own - Established',
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
    key: 'learnArticle.tocExpanded',
    label: 'ToC Expanded',
    description: 'Keep the Table of Contents permanently expanded',
    type: 'learn-article',
    defaultValue: false,
  },
  {
    key: 'learnArticle.launchMvp',
    label: 'Launch MVP',
    description: 'Hide badge/achievement visuals from article page',
    type: 'learn-article',
    defaultValue: false,
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
    options: ['Add Friend', 'Pending', 'Friends'],
    defaultValue: 'Add Friend',
    visibleWhen: { 'profile.viewType': ['Friend - Game History', 'Guest - Game History'] },
  },

  // Profile Page — tab + friends
  {
    key: 'profile.tab',
    label: 'Profile Tab',
    description: 'Switch between profile content tabs',
    type: 'select',
    page: 'profile',
    options: ['Game History', 'Achievements', 'Friends'],
    defaultValue: 'Game History',
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
    key: 'profile.fbDiscovery',
    label: 'FB Discovery',
    description: 'Show Facebook friend discovery card',
    type: 'select',
    page: 'profile',
    options: ['None', 'Matches Found', 'Zero Matches'],
    defaultValue: 'None',
    visibleWhen: { 'profile.tab': ['Friends'] },
  },

  // Settings Page
  {
    key: 'settings.section',
    label: 'Settings View',
    description: 'Switch between settings page states',
    type: 'select',
    page: 'settings',
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

  // Play Page — social overlays
  {
    key: 'play.profileCard',
    label: 'Profile Card',
    description: 'Show in-game mini profile card',
    type: 'play',
    defaultValue: false,
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

  // Notifications (global — shows in header)
  {
    key: 'social.notifications',
    label: 'Notifications',
    description: 'Show notification bell and dropdown in header',
    type: 'select',
    page: 'global',
    options: ['Hidden', 'Empty', 'Unread', 'All Read'],
    defaultValue: 'Hidden',
  },
];
