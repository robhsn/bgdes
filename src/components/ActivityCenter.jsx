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

function IconOpen() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
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
          <button className="com-btn com-btn--primary com-btn--micro">
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
  const friendPill = item.isFriend ? (
    <span style={{
      fontFamily: fm, fontSize: 10, fontWeight: 600,
      color: 'var(--prim-mint-400)',
      background: 'rgba(35, 165, 126, 0.1)',
      padding: '1px 6px', borderRadius: 8,
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
          <span style={nameStyle}>{user.username}</span>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <button className="com-btn com-btn--primary com-btn--micro">Accept</button>
        <button className="com-btn com-btn--outline com-btn--micro">Reject</button>
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
          <div style={{ ...nameStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
            {user.username} challenged you to a {item.format} match
            {friendPill}
          </div>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <button className="com-btn com-btn--primary com-btn--micro">Accept</button>
        <button className="com-btn com-btn--outline com-btn--micro">Decline</button>
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
          <span style={nameStyle}>{user.username} sent a message</span>
          <div style={metaStyle}>{timestamp}</div>
        </div>
        <span style={{ color: 'var(--color-muted)', flexShrink: 0 }}>
          <IconOpen />
        </span>
      </div>
    );
  }

  /* Passive items: friend_accepted, challenge_accepted, challenge_declined, fb_friends_found */
  const passiveText = {
    friend_accepted: `${user.username} accepted your friend request`,
    challenge_accepted: `${user.username} accepted your challenge`,
    challenge_declined: `${user.username} declined your challenge`,
    fb_friends_found: `${item.count || 1} Facebook friend${(item.count || 1) > 1 ? 's' : ''} found on Backgammon.com`,
  };

  return (
    <div style={rowStyle}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {avatarEl}
      <div style={{ flex: 1 }}>
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
            onClick={() => setFilter(f.key)}
            style={{
              fontFamily: fm, fontSize: 11, fontWeight: 600,
              padding: '4px 12px', borderRadius: 999,
              border: '1px solid',
              borderColor: filter === f.key ? 'var(--color-accent)' : 'var(--color-border)',
              background: filter === f.key ? 'var(--color-accent)' : 'transparent',
              color: filter === f.key ? '#fff' : 'var(--color-body)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
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

export default function ActivityCenter({ onNavigate }) {
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');
  const unreadCountStr = useDMEState('social.unreadCount', '3');
  const dmeOpen = useDMEState('social.activityOpen', false);
  const [localOpen, setLocalOpen] = useState(false);
  const open = dmeOpen || localOpen;
  const [activeTab, setActiveTab] = useState('friends');
  const panelRef = useRef(null);

  // Close on outside click (overlay click)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setLocalOpen(false);
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
      {/* Bell icon + badge */}
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

      {/* Side panel overlay + panel */}
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
            <div className="side-panel__header">
              <h2 className="side-panel__title">Activity Center</h2>
              <button className="side-panel__close" onClick={() => setLocalOpen(false)}>
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
                  {activeTab === 'friends' && <FriendsOnlineTab onNavigate={onNavigate} onClose={() => setLocalOpen(false)} />}
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
