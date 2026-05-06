import { useCallback } from 'react';
import { useDMEState, useDMESetState } from '../context/dme-states';

/**
 * Single chokepoint for social CTAs that require an account.
 *
 * Returns:
 *   - isAuthed       boolean. True when auth.loggedIn === 'logged-in'.
 *                    'guest' and 'logged-out' both fall back to false.
 *   - requireAuth(fn) Wraps a click handler. If authed, runs fn(...args).
 *                    If not, opens the global Auth overlay
 *                    (auth.overlay = 'Login') and skips fn.
 *   - openAuth()     Imperative helper to open the Auth overlay directly,
 *                    e.g. from an inline onClick when there's no underlying
 *                    action to gate.
 *
 * See CLAUDE.md "Auth-Gated Action Rule": every social CTA in the app
 * (Add Friend, Cancel Request, Accept Request, Challenge, FB connect,
 * notification accept/decline, etc.) must go through this helper so
 * unauth'd viewers always land in the Auth overlay instead of mutating
 * state they cannot have.
 */
export function useRequireAuth() {
  const auth = useDMEState('auth.loggedIn', 'logged-in');
  const setDmeStates = useDMESetState();
  const isAuthed = auth === 'logged-in' || auth === true;

  const openAuth = useCallback(() => {
    setDmeStates(prev => ({ ...prev, 'auth.overlay': 'Login' }));
  }, [setDmeStates]);

  const requireAuth = useCallback((fn) => {
    return (...args) => {
      if (isAuthed) {
        return fn?.(...args);
      }
      openAuth();
      // Swallow event so e.g. modal-open handlers don't run alongside.
      return undefined;
    };
  }, [isAuthed, openAuth]);

  return { isAuthed, requireAuth, openAuth };
}
