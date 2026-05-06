import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDMEState, useDMESetState } from '../context/dme-states';
import Avatar from './Avatar';
import {
  MOCK_FRIENDS,
  MOCK_REQUESTS_INCOMING,
  MOCK_CHALLENGES_INCOMING,
} from '../data/social-mock-data';

/* ─── Avatar lookup ──────────────────────────────────────────── */
const avatarModules = import.meta.glob('../imgs/avatars/*.png', { eager: true });
const AVATAR_MAP = Object.fromEntries(
  Object.entries(avatarModules).map(([path, mod]) => {
    const key = path.split('/').pop().replace('.png', '');
    return [key, mod.default];
  }),
);
import avatarFallback from '../imgs/avatar-dink.png';
function getAvatar(key) { return AVATAR_MAP[key] || avatarFallback; }

/* ─── Toast context ──────────────────────────────────────────── */
const ToastContext = createContext({ addToast: () => {}, dismissToast: () => {} });

export function useToasts() {
  return useContext(ToastContext);
}

let toastIdCounter = 0;
function nextToastId() {
  toastIdCounter += 1;
  return `t${Date.now()}-${toastIdCounter}`;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Bumped by dismissAll() so individual Toast components can run their
  // exit animation in unison instead of vanishing on next render.
  const [dismissAllSignal, setDismissAllSignal] = useState(0);

  const addToast = useCallback((toast) => {
    setToasts(prev => [...prev, { id: nextToastId(), ...toast }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setDismissAllSignal(s => s + 1);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismissToast, dismissAll, dismissAllSignal, toasts }}>
      {children}
      {createPortal(
        <ToastStack toasts={toasts} onDismiss={dismissToast} dismissAllSignal={dismissAllSignal} />,
        document.body,
      )}
      <ToastDMETrigger />
    </ToastContext.Provider>
  );
}

/* ─── DME-driven trigger ─────────────────────────────────────── */
const PERSISTENT_TRIGGER = 'All / NEVER FADE';

function ToastDMETrigger() {
  const trigger = useDMEState('toast.demo', 'None');
  const setDmeStates = useDMESetState();
  const { addToast, dismissAll } = useToasts();
  const prevTriggerRef = useRef('None');
  const lastFiredSingleRef = useRef(null);

  useEffect(() => {
    const prev = prevTriggerRef.current;
    prevTriggerRef.current = trigger;

    if (trigger === 'None') {
      // Only sweep the stack when the user is leaving persistent mode.
      // Programmatic resets after a single-fire shouldn't wipe other toasts.
      if (prev === PERSISTENT_TRIGGER) {
        dismissAll();
      }
      lastFiredSingleRef.current = null;
      return;
    }

    const fireOne = (kind, persistent = false) => {
      if (kind === 'Friend Request') {
        const r = MOCK_REQUESTS_INCOMING[0];
        addToast({ type: 'friend-request', user: r, persistent });
      } else if (kind === 'Friend Accepted') {
        const f = MOCK_FRIENDS[0];
        addToast({ type: 'friend-accepted', user: f, persistent });
      } else if (kind === 'Challenge') {
        const c = MOCK_CHALLENGES_INCOMING[0];
        addToast({
          type: 'challenge',
          user: c.user,
          format: c.format,
          isFriend: c.isFriend,
          persistent,
        });
      } else if (kind === 'Starred Online') {
        const f = MOCK_FRIENDS.find(x => x.online) || MOCK_FRIENDS[0];
        addToast({ type: 'starred-online', user: f, persistent });
      }
    };

    if (trigger === PERSISTENT_TRIGGER) {
      // Only fire on the transition into persistent mode. Once active, the
      // dropdown sits on this value until the user picks None.
      if (prev !== PERSISTENT_TRIGGER) {
        ['Friend Request', 'Friend Accepted', 'Challenge', 'Starred Online'].forEach(k => fireOne(k, true));
      }
      return;
    }

    // Single-fire path. Guard against double-fires from React re-renders.
    if (lastFiredSingleRef.current === trigger) return;
    lastFiredSingleRef.current = trigger;
    fireOne(trigger);

    // Reset back to None so the user can re-fire the same option. Persistent
    // toasts (if any) are preserved by the prev-value check above.
    setDmeStates(prevStates => ({ ...prevStates, 'toast.demo': 'None' }));
    const t = setTimeout(() => { lastFiredSingleRef.current = null; }, 200);
    return () => clearTimeout(t);
  }, [trigger, addToast, dismissAll, setDmeStates]);

  return null;
}

/* ─── Stack container ────────────────────────────────────────── */
function ToastStack({ toasts, onDismiss, dismissAllSignal }) {
  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map(t => (
        <Toast
          key={t.id}
          toast={t}
          onDismiss={() => onDismiss(t.id)}
          dismissAllSignal={dismissAllSignal}
        />
      ))}
    </div>
  );
}

/* ─── Toast variants ─────────────────────────────────────────── */
const STAR_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CLOSE_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const FRIEND_ADD_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);

// Filled two-dice glyph. Solid fills + clear pips so it reads at small sizes.
const CHALLENGE_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="12" height="12" rx="2.5"/>
    <rect x="10" y="10" width="12" height="12" rx="2.5"/>
    <circle cx="8"  cy="8"  r="1.6" fill="#fff"/>
    <circle cx="16" cy="16" r="1.6" fill="#fff"/>
  </svg>
);


const TOAST_DURATION_MS = 6000;
const TOAST_HOVER_BONUS_MS = 1000;
const TOAST_EXIT_MS = 280;

function Toast({ toast, onDismiss, dismissAllSignal = 0 }) {
  const { type, user, format } = toast;
  const persistent = !!toast.persistent;
  const [actioned, setActioned] = useState(null); // null | 'accepted' | 'rejected' | 'declined'
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);

  // Auto-dismiss with hover-pause. Hovering pauses the countdown; leaving
  // resumes it and tacks on an extra second of grace so the user has
  // breathing room to read or click an action.
  // Skipped entirely when persistent (e.g. "All / NEVER FADE" mode).
  const timerIdRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingMsRef = useRef(TOAST_DURATION_MS);

  const beginExit = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    if (timerIdRef.current) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
    setExiting(true);
    setTimeout(() => onDismiss(), TOAST_EXIT_MS);
  }, [onDismiss]);

  const startTimer = useCallback((ms) => {
    if (timerIdRef.current) clearTimeout(timerIdRef.current);
    startedAtRef.current = Date.now();
    remainingMsRef.current = ms;
    timerIdRef.current = setTimeout(beginExit, ms);
  }, [beginExit]);

  useEffect(() => {
    if (persistent) return; // never auto-dismiss while persistent
    startTimer(TOAST_DURATION_MS);
    return () => {
      if (timerIdRef.current) clearTimeout(timerIdRef.current);
    };
  }, [startTimer, persistent]);

  // Listen for the global "dismiss all" pulse from the provider. The first
  // observed value is captured on mount so existing pulses don't fire newly
  // mounted toasts.
  const initialDismissSignalRef = useRef(dismissAllSignal);
  useEffect(() => {
    if (dismissAllSignal !== initialDismissSignalRef.current) {
      beginExit();
    }
  }, [dismissAllSignal, beginExit]);

  const handleMouseEnter = () => {
    if (exitingRef.current || persistent) return;
    if (!timerIdRef.current) return;
    clearTimeout(timerIdRef.current);
    timerIdRef.current = null;
    const elapsed = Date.now() - startedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (exitingRef.current || persistent) return;
    if (timerIdRef.current) return; // already running
    startTimer(remainingMsRef.current + TOAST_HOVER_BONUS_MS);
  };

  const isFriend = !!toast.isFriend;
  const avatar = (
    <div className="toast__avatar-wrap">
      <Avatar src={getAvatar(user.avatar)} alt={user.username} size="md" online={user.online} />
      {isFriend && <span className="toast__avatar-tag">Friend</span>}
    </div>
  );

  if (type === 'friend-request') {
    if (actioned === 'accepted') {
      return (
        <ToastShell variant="success" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {avatar}
          <ToastBody>
            <div className="toast__title">{user.username}</div>
            <div className="toast__sub">You're now friends.</div>
          </ToastBody>
        </ToastShell>
      );
    }
    if (actioned === 'rejected') {
      return (
        <ToastShell variant="info" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {avatar}
          <ToastBody>
            <div className="toast__title">{user.username}</div>
            <div className="toast__sub">Request declined.</div>
          </ToastBody>
        </ToastShell>
      );
    }
    return (
      <ToastShell variant="default" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {avatar}
        <ToastBody>
          <div className="toast__title">{user.username}</div>
          <div className="toast__sub">
            <span className="toast__sub-icon">{FRIEND_ADD_ICON}</span>
            Sent you a friend request
          </div>
        </ToastBody>
        <div className="toast__actions">
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => setActioned('accepted')}>Accept</button>
          <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => setActioned('rejected')}>Reject</button>
        </div>
      </ToastShell>
    );
  }

  if (type === 'friend-accepted') {
    return (
      <ToastShell variant="success" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {avatar}
        <ToastBody>
          <div className="toast__title">{user.username}</div>
          <div className="toast__sub">Accepted your friend request.</div>
        </ToastBody>
      </ToastShell>
    );
  }

  if (type === 'challenge') {
    if (actioned === 'accepted') {
      return (
        <ToastShell variant="success" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {avatar}
          <ToastBody>
            <div className="toast__title">{user.username}</div>
            <div className="toast__sub">Challenge accepted, starting game.</div>
          </ToastBody>
        </ToastShell>
      );
    }
    if (actioned === 'declined') {
      return (
        <ToastShell variant="info" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {avatar}
          <ToastBody>
            <div className="toast__title">{user.username}</div>
            <div className="toast__sub">Challenge declined.</div>
          </ToastBody>
        </ToastShell>
      );
    }
    return (
      <ToastShell variant="default" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {avatar}
        <ToastBody>
          <div className="toast__title">{user.username}</div>
          <div className="toast__sub">
            <span className="toast__sub-icon">{CHALLENGE_ICON}</span>
            Sent you a game challenge
          </div>
          <div className="toast__meta">
            <span className="toast__chip toast__chip--challenge">
              {format || '3-point'} match
            </span>
          </div>
        </ToastBody>
        <div className="toast__actions">
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => setActioned('accepted')}>Accept</button>
          <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => setActioned('declined')}>Decline</button>
        </div>
      </ToastShell>
    );
  }

  if (type === 'starred-online') {
    return (
      <ToastShell variant="default" exiting={exiting} onDismiss={beginExit} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {avatar}
        <ToastBody>
          <div className="toast__title">
            <span className="toast__star" aria-label="Starred">{STAR_ICON}</span>
            {user.username}
          </div>
          <div className="toast__sub">is now online</div>
        </ToastBody>
        <div className="toast__actions">
          <button className="com-btn com-btn--primary com-btn--xsm">Challenge</button>
        </div>
      </ToastShell>
    );
  }

  return null;
}

function ToastShell({ variant, exiting, onDismiss, onMouseEnter, onMouseLeave, children }) {
  return (
    <div
      className={`toast toast--${variant}${exiting ? ' toast--exiting' : ''}`}
      role="status"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      <button className="toast__close" onClick={onDismiss} aria-label="Dismiss">
        {CLOSE_ICON}
      </button>
    </div>
  );
}

function ToastBody({ children }) {
  return <div className="toast__body">{children}</div>;
}
