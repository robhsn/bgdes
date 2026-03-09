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
    description: 'Show authenticated state: player avatar & username',
    type: 'global',
    defaultValue: true,
  },
  {
    key: 'profile.viewType',
    label: 'Profile View',
    description: 'own | other | guest | new-player',
    type: 'select',
    options: ['own', 'other', 'guest', 'new-player'],
    defaultValue: 'own',
  },
  {
    key: 'profile.celebration',
    label: 'Badge Celebration',
    description: 'Trigger badge unlock celebration animation',
    type: 'global',
    defaultValue: false,
  },
];
