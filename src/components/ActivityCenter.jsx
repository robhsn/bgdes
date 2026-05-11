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
    <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.55555 8.44439C3.55555 7.62727 3.7165 6.81816 4.02919 6.06325C4.34189 5.30833 4.80021 4.6224 5.378 4.04461C5.95579 3.46683 6.64172 3.0085 7.39663 2.69581C8.15155 2.38311 8.96066 2.22217 9.77777 2.22217C10.5949 2.22217 11.404 2.38311 12.1589 2.69581C12.9138 3.0085 13.5998 3.46683 14.1775 4.04461C14.7553 4.6224 15.2137 5.30833 15.5264 6.06325C15.8391 6.81816 16 7.62727 16 8.44439C16 9.2615 15.8391 10.0706 15.5264 10.8255C15.2137 11.5804 14.7553 12.2664 14.1775 12.8442C13.5998 13.4219 12.9138 13.8803 12.1589 14.193C11.404 14.5057 10.5949 14.6666 9.77777 14.6666C8.96066 14.6666 8.15155 14.5057 7.39663 14.193C6.64172 13.8803 5.95579 13.4219 5.378 12.8442C4.80021 12.2664 4.34189 11.5804 4.02919 10.8255C3.7165 10.0706 3.55555 9.2615 3.55555 8.44439ZM0 27.1111C0 21.7111 4.37778 17.3333 9.77777 17.3333C15.1778 17.3333 19.5555 21.7111 19.5555 27.1111V27.4444C19.5555 28.7333 18.5111 29.7777 17.2222 29.7777H2.33333C1.04444 29.7777 0 28.7333 0 27.4444V27.1111Z" />
      <g opacity="0.4">
        <path d="M27.7713 6.45101C26.7711 5.45082 25.4146 4.88892 24.0001 4.88892C22.5856 4.88892 21.229 5.45082 20.2288 6.45101C19.2287 7.45121 18.6667 8.80776 18.6667 10.2222C18.6667 11.6367 19.2287 12.9933 20.2288 13.9935C21.229 14.9937 22.5856 15.5556 24.0001 15.5556C25.4146 15.5556 26.7711 14.9937 27.7713 13.9935C28.7715 12.9933 29.3334 11.6367 29.3334 10.2222C29.3334 8.80776 28.7715 7.45121 27.7713 6.45101Z" />
        <path d="M32.0001 26.2222C32.0001 21.8056 28.4167 18.2222 24.0001 18.2222C22.3945 18.2222 20.8945 18.7 19.639 19.5167C21.2556 21.6167 22.2223 24.25 22.2223 27.1111V27.4445C22.2223 28.2889 22.0112 29.0834 21.6445 29.7778H29.689C30.9667 29.7778 32.0001 28.7445 32.0001 27.4667V26.2222Z" />
      </g>
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
  { key: 'friend_request', label: 'Requests' },
  { key: 'challenge', label: 'Challenges' },
  { key: 'message', label: 'Messages' },
];

/* ── Friends Online Tab ──────────────────────────────────────── */

/* Online FB matches surfaced inside the Activity Center's Friends Online
   tab. Slice the global MOCK_FB_FRIENDS list and tag each as online so
   the avatar dot reads green. The first two render here; "Show More"
   below routes the user to the profile FB matches card with the
   show-all already expanded. */
const ONLINE_FB_FRIENDS = MOCK_FB_FRIENDS.slice(0, 4).map((f, i) => ({
  ...f, online: true, fbPhotoIndex: i,
}));
const FB_PREVIEW_COUNT = 2;

function FriendsOnlineTab({ onNavigate, onClose }) {
  const friendsContent = useDMEState('social.friendsContent', 'Has Friends');
  const isEmpty = friendsContent === 'Empty';
  const onlineFriends = MOCK_FRIENDS.filter(f => f.online);
  const setDmeStates = useDMESetState();
  const handleChallenge = () => {
    setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Send Challenge' }));
    onClose?.();
    onNavigate?.('play');
  };
  const visibleFb = ONLINE_FB_FRIENDS.slice(0, FB_PREVIEW_COUNT);
  const fbRemaining = MOCK_FB_FRIENDS.length - FB_PREVIEW_COUNT;
  const goToFbMatches = () => {
    // Profile may already be mounted (the activity center is rendered
    // inside it). Write sessionStorage + dispatch the session pubsub
    // event ourselves so an already-mounted FriendsTab (via
    // useSessionState) flips showAllFb to true reactively. We do this
    // synchronously rather than via a setter so it survives the close +
    // navigate that follows. Fresh mounts read the value during init.
    try {
      sessionStorage.setItem('profile-tab-intent', 'Friends');
      sessionStorage.setItem('profile-scroll-intent', 'pp-fb-card');
      sessionStorage.setItem('pp-fb-show-all', 'true');
      window.dispatchEvent(new CustomEvent('app-session-state-change', { detail: { key: 'pp-fb-show-all' } }));
    } catch {}
    setDmeStates(prev => ({
      ...prev,
      'profile.fbDiscovery': 'Matches Found',
      'profile.tab': 'Friends',
    }));
    onClose?.();
    onNavigate?.('profile');
    // Scroll on the next tick so the Friends tab has switched and the
    // FB card has rendered.
    setTimeout(() => {
      document.querySelector('[data-section-id="pp-fb-card"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  if (isEmpty) {
    return (
      <div style={{ padding: '0' }}>
        <div className="ac-empty">No Friends Online</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Facebook friends not yet added — online-only preview */}
      {visibleFb.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
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
      {fbRemaining > 0 && (
        <div
          onClick={goToFbMatches}
          style={{
            padding: '8px 0 12px',
            textAlign: 'center',
            fontFamily: fm, fontSize: 12, fontWeight: 600,
            color: 'var(--color-accent)',
            cursor: 'pointer',
          }}
        >
          Show More ({fbRemaining})
        </div>
      )}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />

      {onlineFriends.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
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
          try {
            sessionStorage.setItem('profile-tab-intent', 'Friends');
            sessionStorage.setItem('profile-scroll-intent', 'pp-friends');
          } catch {}
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
    return <button className="com-btn com-btn--primary com-btn--xsm" disabled>Request Sent</button>;
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
    display: 'flex', alignItems: 'center', gap: 14,
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
        <div className="ac-actions">
          <ActivityAddFriendButton username={user.username} />
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={onChallenge}>Challenge</button>
        </div>
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
        <div className="ac-actions">
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => onAcceptRequest?.(item.id)}>Accept</button>
          <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => onRejectRequest?.(item.id)}>Reject</button>
        </div>
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
        <div className="ac-actions">
          <button className="com-btn com-btn--primary com-btn--xsm" onClick={() => onAcceptChallenge?.(item.id)}>Accept</button>
          <button className="com-btn com-btn--outline com-btn--xsm" onClick={() => onDeclineChallenge?.(item.id)}>Decline</button>
        </div>
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
  // MVP scope excludes chat/messages, so the Messages filter pill and any
  // message-typed notification rows are hidden in MVP mode.
  const isMvp = useDMEState('profile.mvp', true);
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
    if (isMvp && n.type === 'message') return false;
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
        {FILTERS.filter(f => !(isMvp && f.key === 'message')).map(f => (
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

export default function ActivityCenter({ onNavigate, externalOpen, onExternalClose, onBeforeOpen }) {
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
  // dmeOpen is the single source of truth for the panel's open state.
  // (Previously we mirrored a localOpen too, but that meant external code
  // flipping dmeOpen=false couldn't close the panel — a header dropdown
  // opening on top of an open Activity Center couldn't dismiss it.)
  const open = dmeOpen || !!externalOpen;
  const [activeTab, setActiveTab] = useState('activity');
  const panelRef = useRef(null);

  const setOpenState = (next) => {
    setDmeStates(prev => ({ ...prev, 'social.activityOpen': next }));
  };
  const closePanel = () => {
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

  // Detect desktop vs mobile so we can render the panel either as a
  // dropdown anchored under the bell (desktop, matching ix-dropdown
  // pattern) or as a full-screen bottom sheet overlay (mobile).
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Click-outside-to-close on desktop dropdown (mobile uses overlay click).
  useEffect(() => {
    if (!open || !isDesktop) return;
    const handler = (e) => {
      // Don't close when the click lands inside an IDP panel — keeps
      // the dropdown frozen open while devs inspect it.
      if (e.target.closest && (e.target.closest('[data-devmode-panel]') || e.target.closest('[data-devmode-ignore]'))) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Don't close when the bell itself is clicked — its onClick already
        // toggles the panel.
        const bell = panelRef.current.parentElement?.querySelector('.notif-bell');
        if (bell && bell.contains(e.target)) return;
        closePanel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isDesktop]);

  // Prevent body scroll only when the panel is a full-screen mobile sheet.
  // Desktop dropdown leaves background scrolling alone.
  useEffect(() => {
    if (open && !isDesktop) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open, isDesktop]);

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

  const tabBar = (
    <div className="ac-tabbar">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`ac-tab${activeTab === t.key ? ' ac-tab--active' : ''}`}
          onClick={() => setActiveTab(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const body = (
    <div className="ac-body">
      {isEmpty ? (
        <div className="ac-empty">No notifications yet</div>
      ) : (
        <>
          {activeTab === 'friends' && <FriendsOnlineTab onNavigate={onNavigate} onClose={closePanel} />}
          {activeTab === 'activity' && <ActivityTab onNavigate={onNavigate} onClose={closePanel} />}
        </>
      )}
    </div>
  );

  // The dropdown render is identical on desktop and mobile — CSS handles
  // the responsive treatment (anchored under the bell on desktop, fixed
  // full-width below the header on mobile, matching the profile /
  // hamburger dropdown pattern). The isDesktop flag is still used above
  // for body-scroll-lock and click-outside semantics.
  return (
    <div className="notif-bell-wrap">
      {!externalOpen && (
        <div
          className={`notif-bell${open ? ' notif-bell--active' : ''}`}
          onClick={() => {
            const next = !open;
            if (next) onBeforeOpen?.();
            setOpenState(next);
          }}
          style={{ color: 'var(--prim-mint-500)' }}
        >
          <IconBell />
          {unreadCount > 0 && (
            <span className="notif-bell__badge">{unreadCount}</span>
          )}
        </div>
      )}
      {open && (
        <div
          ref={panelRef}
          className="ac-dropdown surface-inverse"
          data-section-id="gl-activity-center"
        >
          {tabBar}
          {body}
        </div>
      )}
    </div>
  );
}
