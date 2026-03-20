import React from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import {
  MOCK_FRIENDS,
  MOCK_REQUESTS_INCOMING,
  MOCK_REQUESTS_SENT,
  MOCK_CHALLENGES_INCOMING,
  MOCK_MESSAGES,
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

/* ── Section component ───────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontFamily: fh, fontSize: 14, fontWeight: 700,
        color: 'var(--color-heading)',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        padding: '0 0 8px',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 0,
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function NotificationsPage({ onNavigate }) {
  const onlineFriends = MOCK_FRIENDS.filter(f => f.online);

  return (
    <>
      <SiteHeader
        onLogoClick={() => onNavigate?.('index')}
        onNavigate={onNavigate}
      />

      <div style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '32px 20px 64px',
      }}>
        <h1 style={{
          fontFamily: fh, fontSize: 24, fontWeight: 700,
          color: 'var(--color-heading)',
          marginBottom: 24,
        }}>
          Notifications
        </h1>

        {/* Friends Online */}
        <Section title="Friends Online">
          {onlineFriends.length === 0 ? (
            <div style={{ padding: '16px 0', fontFamily: fb, fontSize: 13, color: 'var(--color-muted)' }}>
              No friends online right now
            </div>
          ) : (
            onlineFriends.map(f => (
              <div
                key={f.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <Avatar src={getAvatar(f.avatar)} alt={f.username} size="md" online />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: 'var(--color-heading)' }}>
                    {f.username}
                  </div>
                  <div style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)' }}>
                    Rating: {f.rating}
                  </div>
                </div>
                <button className="com-btn com-btn--primary com-btn--sm" style={{ fontSize: 12 }}>
                  Challenge
                </button>
              </div>
            ))
          )}
        </Section>

        {/* Friend Requests */}
        <Section title="Friend Requests">
          {MOCK_REQUESTS_INCOMING.length === 0 && MOCK_REQUESTS_SENT.length === 0 ? (
            <div style={{ padding: '16px 0', fontFamily: fb, fontSize: 13, color: 'var(--color-muted)' }}>
              No pending friend requests
            </div>
          ) : (
            <>
              {MOCK_REQUESTS_INCOMING.map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <Avatar src={getAvatar(r.avatar)} alt={r.username} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: 'var(--color-heading)' }}>
                      {r.username}
                    </div>
                    <div style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)' }}>
                      Wants to be your friend
                    </div>
                  </div>
                  <button className="com-btn com-btn--primary com-btn--sm" style={{ fontSize: 12 }}>
                    Accept
                  </button>
                  <button className="com-btn com-btn--outline com-btn--sm" style={{ fontSize: 12 }}>
                    Reject
                  </button>
                </div>
              ))}
              {MOCK_REQUESTS_SENT.map(r => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  <Avatar src={getAvatar(r.avatar)} alt={r.username} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fb, fontSize: 14, fontWeight: 600, color: 'var(--color-heading)' }}>
                      {r.username}
                    </div>
                    <div style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)' }}>
                      Request sent
                    </div>
                  </div>
                  <span style={{
                    fontFamily: fm, fontSize: 11, color: 'var(--color-muted)',
                    padding: '4px 10px', borderRadius: 12,
                    background: 'var(--color-border-light)',
                  }}>
                    Pending
                  </span>
                </div>
              ))}
            </>
          )}
        </Section>

        {/* Challenges */}
        <Section title="Challenges">
          {MOCK_CHALLENGES_INCOMING.length === 0 ? (
            <div style={{ padding: '16px 0', fontFamily: fb, fontSize: 13, color: 'var(--color-muted)' }}>
              No incoming challenges
            </div>
          ) : (
            MOCK_CHALLENGES_INCOMING.map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                <Avatar src={getAvatar(c.user.avatar)} alt={c.user.username} size="md" />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: fb, fontSize: 14, fontWeight: 600, color: 'var(--color-heading)',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {c.user.username}
                    {c.isFriend && (
                      <span style={{
                        fontFamily: fm, fontSize: 10, fontWeight: 600,
                        color: 'var(--prim-mint-400)',
                        background: 'rgba(35, 165, 126, 0.1)',
                        padding: '2px 7px', borderRadius: 8,
                      }}>
                        Friend
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)' }}>
                    {c.format} match &middot; {c.timestamp}
                  </div>
                </div>
                <button className="com-btn com-btn--primary com-btn--sm" style={{ fontSize: 12 }}>
                  Accept
                </button>
                <button className="com-btn com-btn--outline com-btn--sm" style={{ fontSize: 12 }}>
                  Decline
                </button>
              </div>
            ))
          )}
        </Section>

        {/* Messages */}
        <Section title="Messages">
          {MOCK_MESSAGES.length === 0 ? (
            <div style={{ padding: '16px 0', fontFamily: fb, fontSize: 13, color: 'var(--color-muted)' }}>
              No messages yet
            </div>
          ) : (
            MOCK_MESSAGES.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-border-light)',
                  cursor: 'pointer',
                }}
              >
                <Avatar src={getAvatar(m.user.avatar)} alt={m.user.username} size="md" />
                <div style={{ flex: 1, fontFamily: fb, fontSize: 13, color: 'var(--color-heading)' }}>
                  <strong>{m.user.username}</strong> sent a message {m.timestamp}
                </div>
                <span style={{ color: 'var(--color-muted)', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </span>
              </div>
            ))
          )}
        </Section>

        {/* Recent Activity */}
        <Section title="Recent Activity">
          {MOCK_NOTIFICATIONS.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <Avatar src={getAvatar(n.user.avatar)} alt={n.user.username} size="md" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: fb, fontSize: 13, color: 'var(--color-heading)' }}>
                  {getNotifText(n)}
                </div>
                <div style={{ fontFamily: fm, fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>
                  {n.timestamp}
                </div>
              </div>
            </div>
          ))}
        </Section>
      </div>

      <SiteFooter sectionId="gl-footer" />
    </>
  );
}

function getNotifText(n) {
  switch (n.type) {
    case 'friend_request':     return <><strong>{n.user.username}</strong> sent you a friend request</>;
    case 'friend_accepted':    return <><strong>{n.user.username}</strong> accepted your friend request</>;
    case 'challenge_received': return <><strong>{n.user.username}</strong> challenged you to a <strong>{n.format} match</strong></>;
    case 'challenge_accepted': return <><strong>{n.user.username}</strong> accepted your challenge</>;
    case 'challenge_declined': return <><strong>{n.user.username}</strong> declined your challenge</>;
    case 'fb_friends_found':   return <><strong>{n.count}</strong> of your Facebook friends are on Backgammon.com!</>;
    default: return null;
  }
}
