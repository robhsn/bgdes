import React, { useState, useEffect, useRef } from 'react';
import { useDMEState, useDMESetState } from '../context/dme-states';
import {
  MOCK_FRIENDS,
  MOCK_NOTIFICATIONS,
  MOCK_FB_FRIENDS,
} from '../data/social-mock-data';
import Avatar from './Avatar';
import { useSessionSet, useSessionState } from '../hooks/useSessionState';
import { useRequireAuth } from '../hooks/useRequireAuth';

/* ── Preset avatar lookup ────────────────────────────────────── */
const avatarModules = import.meta.glob('../imgs/avatars/*.png', { eager: true });
const AVATAR_MAP = Object.fromEntries(
  Object.entries(avatarModules).map(([path, mod]) => {
    const key = path.split('/').pop().replace('.png', '');
    return [key, mod.default];
  })
);
import avatarFallback from '../imgs/avatar-dink.png';
import fbPic1 from '../imgs/fb photos/fb-pic-1.jpg';
import fbPic2 from '../imgs/fb photos/fb-pic-2.jpg';
import fbPic3 from '../imgs/fb photos/fb-pic-3.jpg';
import fbIcon from '../imgs/icons/fb-logo.png';
const FB_PHOTOS = [fbPic1, fbPic2, fbPic3];
function getAvatar(key) { return AVATAR_MAP[key] || avatarFallback; }

/* ── Token shorthand ─────────────────────────────────────────── */
const fb = 'var(--font-body)';
const fm = 'var(--font-meta)';
const fh = 'var(--font-heading)';

/* ── Icons ────────────────────────────────────────────────────── */

function IconBell() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0038 0C18.6547 0 17.5648 1.08994 17.5648 2.43902V2.68293C12.0008 3.81098 7.80871 8.73476 7.80871 14.6341V16.2881C7.80871 19.9543 6.55871 23.5137 4.27213 26.3796L3.52518 27.3095C3.13646 27.7896 2.93066 28.3841 2.93066 29.0015C2.93066 30.4954 4.14255 31.7073 5.63646 31.7073H34.3636C35.8575 31.7073 37.0694 30.4954 37.0694 29.0015C37.0694 28.3841 36.8636 27.7896 36.4749 27.3095L35.7279 26.3796C33.449 23.5137 32.199 19.9543 32.199 16.2881V14.6341C32.199 8.73476 28.0069 3.81098 22.4429 2.68293V2.43902C22.4429 1.08994 21.3529 0 20.0038 0Z"/>
      <path d="M14.386 34.386C14.386 35.8749 14.9775 37.3028 16.0303 38.3557C17.0832 39.4085 18.5111 40 20.0001 40C21.489 40 22.917 39.4085 23.9698 38.3557C25.0226 37.3028 25.6141 35.8749 25.6141 34.386H14.386Z"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 40 40" fill="currentColor">
      <path d="M3.75 5C1.67969 5 0 6.67969 0 8.75C0 9.92969 0.554688 11.0391 1.5 11.75L17.75 23.9375C19.0859 24.9375 20.9141 24.9375 22.25 23.9375L38.5 11.75C39.4453 11.0391 40 9.92969 40 8.75C40 6.67969 38.3203 5 36.25 5H3.75ZM0 15.3125V30C0 32.7578 2.24219 35 5 35H35C37.7578 35 40 32.7578 40 30V15.3125L24.5 26.9375C21.8359 28.9375 18.1641 28.9375 15.5 26.9375L0 15.3125Z"/>
    </svg>
  );
}

function IconCheckerStack({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M20.0002 14.2428C27.9067 14.2429 35.1954 18.7811 36.4411 25.2099C37.9093 32.7869 30.6632 39.9998 20.0002 40C9.33707 40 2.09026 32.787 3.55847 25.2099C4.80428 18.781 12.0936 14.2428 20.0002 14.2428ZM20.8528 17.9553C18.8255 17.8506 16.6966 18.2253 14.8975 19.0272C11.604 20.4502 9.41684 23.4008 9.6007 26.2477C9.63124 26.9294 9.77951 27.6033 10.04 28.2404C10.196 28.6222 10.3918 28.9909 10.6238 29.3415C10.5729 28.9367 10.5552 28.5365 10.5678 28.1437C10.5888 27.4888 10.6946 26.8538 10.8723 26.2477C11.6107 23.7086 13.6388 21.7054 16.1772 20.553C17.591 19.9097 19.1883 19.516 20.8691 19.4129C22.8118 19.2904 24.8891 19.5622 26.8569 20.3004C27.2676 20.4543 27.6743 20.6289 28.0733 20.8234C27.788 20.5429 27.472 20.276 27.1297 20.0268C25.5105 18.8367 23.2196 18.0637 20.8528 17.9553Z"/>
      <path d="M20.1853 0.00324807C27.8242 0.140455 34.9899 4.49713 36.3786 10.6667L36.4411 10.9671C36.5631 11.5968 36.6233 12.2246 36.6279 12.8453H36.6303V19.0256C33.2666 14.224 27.0782 11.0039 20.0002 11.0037C16.3335 11.0037 12.9058 11.8694 9.98559 13.3699C10.7795 10.9457 12.7588 9.03263 15.2158 7.91717C16.6294 7.27404 18.2271 6.88102 19.9076 6.77791C21.8503 6.65549 23.9278 6.92724 25.8955 7.66545C26.306 7.81931 26.713 7.99314 27.1119 8.18758C26.8266 7.90714 26.5106 7.6402 26.1683 7.39099C24.5492 6.20098 22.258 5.42879 19.8914 5.32034C17.8642 5.21553 15.7351 5.59041 13.9361 6.3922C10.6425 7.81528 8.45522 10.7657 8.63927 13.6127C8.6466 13.7762 8.66072 13.9393 8.68149 14.1015C6.53746 15.4149 4.72466 17.0915 3.37008 19.0248V12.8453H3.37252C3.37717 12.2246 3.4365 11.5968 3.55847 10.9671L3.621 10.6667C5.03216 4.39741 12.4026 0.000151728 20.1853 0V0.00324807Z"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/* ── Filter pills ────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'friend_request', label: 'Friend Requests' },
  { key: 'challenge', label: 'Challenges' },
  { key: 'message', label: 'Messages' },
];

/* ── Friends Online Tab ──────────────────────────────────────── */

const FB_SUGGESTIONS = [
  { ...MOCK_FB_FRIENDS[0], online: true,  fbPhotoIndex: 0 },
  { ...MOCK_FB_FRIENDS[1], online: false, fbPhotoIndex: 1 },
];

function FriendsOnlineTab({ onNavigate, onClose }) {
  const onlineFriends = MOCK_FRIENDS.filter(f => f.online);
  const setDmeStates = useDMESetState();
  const handleChallenge = () => {
    setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Send Challenge' }));
    onClose?.();
    onNavigate?.('play');
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Facebook friends not yet added */}
      {FB_SUGGESTIONS.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar src={FB_PHOTOS[f.fbPhotoIndex] || getAvatar(f.avatar)} alt={f.username} size="sm" online={f.online} />
            <img src={fbIcon} alt="Facebook" style={{
              position: 'absolute', top: -3, right: -3,
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid var(--color-bg, #fff)',
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: fb, fontSize: 13, fontWeight: 600, color: 'var(--color-heading)', display: 'block' }}>
              {f.username}
            </span>
            <span style={{ fontFamily: fm, fontSize: 11, color: 'var(--color-muted)' }}>
              {f.fbName}
            </span>
          </div>
          <ActivityAddFriendButton username={f.username} />
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={handleChallenge}>Challenge</button>
        </div>
      ))}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

      {onlineFriends.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar src={getAvatar(f.avatar)} alt={f.username} size="sm" online />
          <span style={{ flex: 1, fontFamily: fb, fontSize: 13, fontWeight: 600, color: 'var(--color-heading)' }}>
            {f.username}
          </span>
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={handleChallenge}>Challenge</button>
        </div>
      ))}
      <div
        onClick={() => {
          sessionStorage.setItem('profile-tab-intent', 'Friends');
          onClose?.();
          onNavigate?.('profile');
        }}
        style={{
          padding: '12px 0',
          textAlign: 'center',
          fontFamily: fm, fontSize: 12, fontWeight: 600,
          color: 'var(--color-accent)',
          cursor: 'pointer',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        See all friends
      </div>
    </div>
  );
}

/* ── Notification Item Renderer ──────────────────────────────── */

function ActivityAddFriendButton({ username }) {
  const [override, setOverride] = useSessionState(
    `pp-relationship:${username || 'unknown'}`,
    null,
  );
  if (override === 'Pending') {
    return <button className="com-btn com-btn--primary com-btn--xsm" disabled>Friend Request Sent</button>;
  }
  if (override === 'Friends') {
    return <button className="com-btn com-btn--primary com-btn--xsm" disabled>Friends</button>;
  }
  return (
    <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => setOverride('Pending')}>
      Add Friend
    </button>
  );
}

function NotificationItem({ item, onAcceptRequest, onRejectRequest, onAcceptChallenge, onDeclineChallenge, onChallenge }) {
  const { type, user, timestamp, read } = item;

  const avatarEl = <Avatar src={getAvatar(user.avatar)} alt={user.username} size="sm" />;

  const nameStyle = { fontFamily: fb, fontSize: 13, fontWeight: 600, color: 'var(--color-heading)' };
  const metaStyle = { fontFamily: fm, fontSize: 11, color: 'var(--color-muted)', marginTop: 2 };
  const friendLabel = item.isFriend ? (
    <span style={{
      display: 'block',
      fontFamily: fm, fontSize: 10, fontWeight: 600,
      color: 'var(--prim-mint-400)',
    }}>
      Friend
    </span>
  ) : null;

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 0',
    opacity: read ? 0.75 : 1,
    transition: 'background 0.1s',
  };

  if (type === 'fb_friend_joined') {
    const fbPhoto = FB_PHOTOS[item.fbPhotoIndex] || getAvatar(user.avatar);
    return (
      <div style={rowStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={fbPhoto} alt={user.username} size="sm" online={item.online} />
          <img src={fbIcon} alt="Facebook" style={{
            position: 'absolute', top: -3, right: -3,
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid var(--color-bg, #fff)',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={nameStyle}>{user.fbName} joined Backgammon.com</div>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <ActivityAddFriendButton username={user.username} />
        <button className="com-btn com-btn--primary com-btn--xsm" onClick={onChallenge}>Challenge</button>
      </div>
    );
  }

  if (type === 'friend_request') {
    return (
      <div style={rowStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {avatarEl}
        <div style={{ flex: 1 }}>
          {friendLabel}
          <div style={nameStyle}>{user.username} sent you a friend request</div>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => onAcceptRequest?.(item.id)}>Accept</button>
        <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => onRejectRequest?.(item.id)}>Reject</button>
      </div>
    );
  }

  if (type === 'challenge_received') {
    return (
      <div style={rowStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {avatarEl}
        <div style={{ flex: 1 }}>
          {friendLabel}
          <div style={nameStyle}>
            {user.username} challenged you to a {item.format} match
          </div>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => onAcceptChallenge?.(item.id)}>Accept</button>
        <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => onDeclineChallenge?.(item.id)}>Decline</button>
      </div>
    );
  }

  if (type === 'message') {
    return (
      <div style={{ ...rowStyle, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {avatarEl}
        <div style={{ flex: 1 }}>
          {friendLabel}
          <span style={nameStyle}>{user.username} sent a message</span>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <span style={{ color: 'var(--color-muted)', flexShrink: 0 }}>
          <IconMail />
        </span>
      </div>
    );
  }

  /* Passive items: friend_accepted, challenge_accepted, challenge_declined, challenge_sent, fb_friends_found */
  const passiveText = {
    friend_accepted: `${user.username} accepted your friend request`,
    challenge_accepted: `${user.username} accepted your challenge`,
    challenge_declined: `${user.username} declined your challenge`,
    challenge_sent: `You challenged ${user.username} — Pending`,
    fb_friends_found: `${item.count || 1} Facebook friend${(item.count || 1) > 1 ? 's' : ''} found on Backgammon.com`,
  };

  return (
    <div style={rowStyle}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {avatarEl}
      <div style={{ flex: 1 }}>
        {friendLabel}
        <span style={{ fontFamily: fb, fontSize: 13, color: 'var(--color-heading)' }}>
          {passiveText[type] || `${user.username}`}
        </span>
        <div style={metaStyle}>{timestamp}</div>
      </div>
    </div>
  );
}

/* ── Activity Tab ────────────────────────────────────────────── */

function ActivityTab({ onNavigate, onClose }) {
  const [filter, setFilter] = useState('all');
  // Shared session keys with NotificationsPage so actions stay in sync.
  const [acceptedRequestIds, setAcceptedRequestIds] = useSessionSet('notif-accepted-friend-requests');
  const [rejectedRequestIds, setRejectedRequestIds] = useSessionSet('notif-rejected-friend-requests');
  const [acceptedChallengeIds, setAcceptedChallengeIds] = useSessionSet('notif-accepted-challenges');
  const [declinedChallengeIds, setDeclinedChallengeIds] = useSessionSet('notif-declined-challenges');
  const setDmeStates = useDMESetState();
  const handleChallenge = () => {
    setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Send Challenge' }));
    onClose?.();
    onNavigate?.('play');
  };
  const { isAuthed, requireAuth, openAuth } = useRequireAuth();
  const addId = (setter) => requireAuth((id) => setter(prev => {
    const next = new Set(prev);
    next.add(id);
    return next;
  }));

  // Unauth'd viewers have no notifications. Render an empty state with an
  // upgrade CTA instead of mock data.
  if (!isAuthed) {
    return (
      <div style={{ padding: '32px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 6 }}>
          Sign in to see your activity
        </div>
        <div style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
          Friend requests, challenges, and game updates appear here once you have an account.
        </div>
        <button className="com-btn com-btn--primary com-btn--sm" onClick={openAuth}>
          Sign in
        </button>
      </div>
    );
  }

  const visible = MOCK_NOTIFICATIONS.filter(n => {
    if (n.type === 'friend_request' && (acceptedRequestIds.has(n.id) || rejectedRequestIds.has(n.id))) return false;
    if (n.type === 'challenge_received' && (acceptedChallengeIds.has(n.id) || declinedChallengeIds.has(n.id))) return false;
    return true;
  });

  const filtered = filter === 'all'
    ? visible
    : visible.filter(n => {
        if (filter === 'friend_request') return n.type === 'friend_request' || n.type === 'friend_accepted';
        if (filter === 'challenge') return n.type.startsWith('challenge');
        if (filter === 'message') return n.type === 'message';
        return true;
      });

  return (
    <div style={{ padding: '0' }}>
      {/* Filter pills */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 0',
        overflowX: 'auto', whiteSpace: 'nowrap',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`com-btn com-btn--pill com-btn--pill-sm${filter === f.key ? ' is-active' : ''}`}
            aria-pressed={filter === f.key ? 'true' : undefined}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '32px 0',
          textAlign: 'center',
          fontFamily: fb, fontSize: 13,
          color: 'var(--color-muted)',
        }}>
          No activity in this category
        </div>
      ) : (
        filtered.map(n => (
          <NotificationItem
            key={n.id}
            item={n}
            onAcceptRequest={addId(setAcceptedRequestIds)}
            onRejectRequest={addId(setRejectedRequestIds)}
            onAcceptChallenge={addId(setAcceptedChallengeIds)}
            onDeclineChallenge={addId(setDeclinedChallengeIds)}
            onChallenge={handleChallenge}
          />
        ))
      )}
    </div>
  );
}

/* ── Main ActivityCenter component ───────────────────────────── */

export default function ActivityCenter({ onNavigate, externalOpen, onExternalClose }) {
  // Activity Center sub-states. Each control is now its own DME state so
  // the State Controller can present focused, nested toggles for bell
  // visibility, tab focus, content state, and unread count.
  const bell = useDMEState('social.bell', 'Has Alerts');
  const tab = useDMEState('social.tab', 'Activity');
  const activityContent = useDMEState('social.activityContent', 'Has Activity');
  const unreadCountStr = useDMEState('social.unreadCount', '3');
  const dmeOpen = useDMEState('social.activityOpen', false);
  const setDmeStates = useDMESetState();
  const { isAuthed } = useRequireAuth();
  const [localOpen, setLocalOpen] = useState(false);
  const open = dmeOpen || localOpen || !!externalOpen;
  const [activeTab, setActiveTab] = useState('activity');
  const panelRef = useRef(null);

  // Closing the panel must sync the DME state back to false. Otherwise
  // toggling Activity Center "on" via the State Controller would lock the
  // panel open since the in-page close X / overlay click only update the
  // local toggle.
  const setOpenState = (next) => {
    setLocalOpen(next);
    setDmeStates(prev => ({ ...prev, 'social.activityOpen': next }));
  };
  const closePanel = () => {
    setLocalOpen(false);
    onExternalClose?.();
    if (dmeOpen) {
      setDmeStates(prev => ({ ...prev, 'social.activityOpen': false }));
    }
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closePanel();
  };

  // Sync active tab to the dedicated tab DME state.
  useEffect(() => {
    setActiveTab(tab === 'Friends Online' ? 'friends' : 'activity');
  }, [tab]);

  // Mirror externalOpen (mobile-nav driven) into DME so the URL reflects
  // the panel's open state regardless of how it was opened.
  useEffect(() => {
    if (externalOpen && !dmeOpen) {
      setDmeStates(prev => ({ ...prev, 'social.activityOpen': true }));
    }
  }, [externalOpen, dmeOpen]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (bell === 'Hidden') return null;

  // Bell badge: only shows alerts when explicitly set to Has Alerts AND the
  // viewer is authed (an unauth'd viewer can't have personal alerts).
  const isUnread = isAuthed && bell === 'Has Alerts';
  const unreadCount = isUnread ? parseInt(unreadCountStr, 10) : 0;
  // Empty state only matters when the dropdown is showing the Activity tab.
  const isEmpty = activityContent === 'Empty';

  const TABS = [
    { key: 'activity', label: 'Activity' },
    { key: 'friends', label: 'Friends Online' },
  ];

  return (
    <>
      {/* Bell icon + badge (hidden when opened externally) */}
      {!externalOpen && (
        <div
          className="notif-bell"
          onClick={() => setOpenState(!open)}
          style={{ color: 'var(--prim-mint-500)' }}
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="notif-bell__badge">{unreadCount}</span>
          )}
        </div>
      )}

      {/* Panel — always rendered as side-panel for consistency */}
      {open && (
        <div
          className="overlay overlay--dark"
          onClick={handleOverlayClick}
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <div
            ref={panelRef}
            className="side-panel surface-muted"
            data-section-id="gl-activity-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="side-panel__header" style={{ justifyContent: 'flex-end', padding: '10px 16px', borderBottom: 'none' }}>
              <button className="side-panel__close" onClick={closePanel}>
                <IconClose />
              </button>
            </div>

            {/* Tab bar */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  className="ac-tab"
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    fontFamily: fm, fontSize: 12, fontWeight: 700,
                    color: activeTab === t.key ? 'var(--color-accent)' : 'var(--color-muted)',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === t.key ? '2px solid var(--color-accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.15s, border-color 0.15s',
                    outline: 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="side-panel__body">
              {isEmpty ? (
                <div style={{
                  padding: '32px 0',
                  textAlign: 'center',
                  fontFamily: fb, fontSize: 13,
                  color: 'var(--color-muted)',
                }}>
                  No notifications yet
                </div>
              ) : (
                <>
                  {activeTab === 'friends' && <FriendsOnlineTab onNavigate={onNavigate} onClose={closePanel} />}
                  {activeTab === 'activity' && <ActivityTab onNavigate={onNavigate} onClose={closePanel} />}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
