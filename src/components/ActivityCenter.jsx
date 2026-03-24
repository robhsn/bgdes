import React, { useState, useEffect, useRef } from 'react';
import { useDMEState } from '../context/dme-states';
import {
  MOCK_FRIENDS,
  MOCK_NOTIFICATIONS,
} from '../data/social-mock-data';
import Avatar from './Avatar';

/* ── Preset avatar lookup ────────────────────────────────────── */
const avatarModules = import.meta.glob('../imgs/avatars/*.png', { eager: true });
const AVATAR_MAP = Object.fromEntries(
  Object.entries(avatarModules).map(([path, mod]) => {
    const key = path.split('/').pop().replace('.png', '');
    return [key, mod.default];
  })
);
import avatarFallback from '../imgs/avatar-dink.png';
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

function FriendsOnlineTab({ onNavigate, onClose }) {
  const onlineFriends = MOCK_FRIENDS.filter(f => f.online);

  return (
    <div style={{ padding: '0' }}>
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
          <button className="com-btn com-btn--primary com-btn--xsm">
            Challenge
          </button>
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

function NotificationItem({ item }) {
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

  if (type === 'friend_request') {
    return (
      <div style={rowStyle}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {avatarEl}
        <div style={{ flex: 1 }}>
          {friendLabel}
          <span style={nameStyle}>{user.username}</span>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <button className="com-btn com-btn--primary com-btn--xsm">Accept</button>
        <button className="com-btn com-btn--outline com-btn--xsm">Reject</button>
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
        <button className="com-btn com-btn--primary com-btn--xsm">Accept</button>
        <button className="com-btn com-btn--outline com-btn--xsm">Decline</button>
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

function ActivityTab() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? MOCK_NOTIFICATIONS
    : MOCK_NOTIFICATIONS.filter(n => {
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
        borderBottom: '1px solid var(--color-border)',
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
        filtered.map(n => <NotificationItem key={n.id} item={n} />)
      )}
    </div>
  );
}

/* ── Main ActivityCenter component ───────────────────────────── */

export default function ActivityCenter({ onNavigate, externalOpen, onExternalClose }) {
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');
  const unreadCountStr = useDMEState('social.unreadCount', '3');
  const dmeOpen = useDMEState('social.activityOpen', false);
  const [localOpen, setLocalOpen] = useState(false);
  const open = dmeOpen || localOpen || !!externalOpen;
  const [activeTab, setActiveTab] = useState('friends');
  const panelRef = useRef(null);

  // Close on outside click (overlay click)
  const closePanel = () => { setLocalOpen(false); onExternalClose?.(); };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closePanel();
  };

  // Sync active tab to DME state
  useEffect(() => {
    if (acState === 'Friends Online') setActiveTab('friends');
    else if (acState.startsWith('Activity')) setActiveTab('activity');
  }, [acState]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (acState === 'Hidden') return null;

  const isUnread = acState === 'Activity - Unread';
  const unreadCount = isUnread ? parseInt(unreadCountStr, 10) : 0;
  const isEmpty = acState === 'Empty';

  const TABS = [
    { key: 'friends', label: 'Friends Online' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <>
      {/* Bell icon + badge (hidden when opened externally) */}
      {!externalOpen && (
        <div
          className="notif-bell"
          onClick={() => setLocalOpen(o => !o)}
          style={{ color: 'var(--color-activity-bell)' }}
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
            className="side-panel"
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
                  {activeTab === 'activity' && <ActivityTab />}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
