import React from 'react';
import { useDMEState } from '../context/dme-states';
import { SiteHeader, SiteFooter } from './SharedLayout';
import avatarDink from '../imgs/avatar-dink.png';
import './SettingsPage.css';

/* ─── Provider icons ─────────────────────────────────────────── */

function IconGoogle() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function IconApple() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

/* ─── Connected accounts section ─────────────────────────────── */

function ConnectedAccounts({ section }) {
  const accounts = [
    {
      id: 'google',
      name: 'Google',
      Icon: IconGoogle,
      connected: true,
      email: 'player@gmail.com',
    },
    {
      id: 'apple',
      name: 'Apple',
      Icon: IconApple,
      connected: false,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      Icon: IconFacebook,
      connected: false,
    },
  ];

  return (
    <div className="st-section">
      <h2 className="st-section__title">Connected Accounts</h2>

      {section === 'Error - Already Linked' && (
        <div className="st-error">
          <span className="st-error__icon">&#9888;</span>
          <span className="st-error__text">
            This Facebook account is already linked to another Backgammon.com player.
            Please use a different account or contact support.
          </span>
        </div>
      )}

      {section === 'Guard Rail' && (
        <div className="st-guardrail">
          <span className="st-guardrail__icon">&#9888;</span>
          <span className="st-guardrail__text">
            Google is your only sign-in method. Disconnecting it will require you to set up
            email/password authentication to keep access to your account.
          </span>
        </div>
      )}

      {accounts.map(({ id, name, Icon, connected, email }) => (
        <div key={id} className="st-account-row">
          <div className={`st-account-icon st-account-icon--${id}`}>
            <Icon />
          </div>
          <div className="st-account-info">
            <div className="st-account-name">{name}</div>
            {connected ? (
              <div className="st-account-status st-account-status--connected">
                Connected{email ? ` · ${email}` : ''}
              </div>
            ) : (
              <div className="st-account-status">Not connected</div>
            )}
          </div>
          {connected ? (
            <button className="st-account-btn st-account-btn--disconnect">
              Disconnect
            </button>
          ) : (
            <button className="st-account-btn st-account-btn--connect">
              Connect
            </button>
          )}
        </div>
      ))}

      {/* Disconnect confirmation dialog */}
      {section === 'Disconnect Confirm' && (
        <div className="st-dialog-overlay">
          <div className="st-dialog">
            <div className="st-dialog__icon">&#128279;</div>
            <h3 className="st-dialog__title">Disconnect Google?</h3>
            <p className="st-dialog__desc">
              You will no longer be able to sign in with your Google account.
              Make sure you have another sign-in method set up.
            </p>
            <div className="st-dialog__actions">
              <button className="com-btn com-btn--outline com-btn--sm">Cancel</button>
              <button className="com-btn com-btn--primary com-btn--sm" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Notification preferences section ───────────────────────── */

function NotificationPreferences() {
  const prefs = [
    {
      id: 'friend_requests',
      label: 'Friend requests',
      desc: 'Get notified when someone sends you a friend request',
      on: true,
    },
    {
      id: 'challenge_invites',
      label: 'Challenge invites',
      desc: 'Get notified when a friend challenges you to a match',
      on: true,
    },
    {
      id: 'fb_alerts',
      label: 'Facebook friend alerts',
      desc: 'Get notified when your Facebook friends join Backgammon.com',
      on: true,
    },
    {
      id: 'game_reminders',
      label: 'Game reminders',
      desc: 'Reminders about ongoing games and tournaments',
      on: false,
    },
    {
      id: 'marketing',
      label: 'News & updates',
      desc: 'Product updates, new features, and community highlights',
      on: false,
    },
  ];

  return (
    <div className="st-section">
      <h2 className="st-section__title">Notification Preferences</h2>
      {prefs.map(({ id, label, desc, on }) => (
        <div key={id} className="st-pref-row">
          <div className="st-pref-info">
            <div className="st-pref-label">{label}</div>
            <div className="st-pref-desc">{desc}</div>
          </div>
          <div className={`st-toggle${on ? ' st-toggle--on' : ''}`}>
            <div className="st-toggle__knob" />
          </div>
        </div>
        ))}
    </div>
  );
}

/* ─── Settings Page ──────────────────────────────────────────── */

/* ─── Mobile Nav ─────────────────────────────────────────────── */

function IconLearnNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M42.5 50H20C15.8594 50 12.5 46.6406 12.5 42.5V17.5C12.5 13.3594 15.8594 10 20 10H43.75C45.8203 10 47.5 11.6797 47.5 13.75V36.25C47.5 37.8828 46.4531 39.2734 45 39.7891V45C46.3828 45 47.5 46.1172 47.5 47.5C47.5 48.8828 46.3828 50 45 50H42.5ZM20 40C18.6172 40 17.5 41.1172 17.5 42.5C17.5 43.8828 18.6172 45 20 45H40V40H20ZM22.5 21.875C22.5 22.9141 23.3359 23.75 24.375 23.75H38.125C39.1641 23.75 40 22.9141 40 21.875C40 20.8359 39.1641 20 38.125 20H24.375C23.3359 20 22.5 20.8359 22.5 21.875ZM24.375 27.5C23.3359 27.5 22.5 28.3359 22.5 29.375C22.5 30.4141 23.3359 31.25 24.375 31.25H38.125C39.1641 31.25 40 30.4141 40 29.375C40 28.3359 39.1641 27.5 38.125 27.5H24.375Z" fill="currentColor"/>
    </svg>
  );
}

function IconProfileNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
    </svg>
  );
}

function IconNewGameNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
    </svg>
  );
}

function IconActivityNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0038 0C18.6547 0 17.5648 1.08994 17.5648 2.43902V2.68293C12.0008 3.81098 7.80871 8.73476 7.80871 14.6341V16.2881C7.80871 19.9543 6.55871 23.5137 4.27213 26.3796L3.52518 27.3095C3.13646 27.7896 2.93066 28.3841 2.93066 29.0015C2.93066 30.4954 4.14255 31.7073 5.63646 31.7073H34.3636C35.8575 31.7073 37.0694 30.4954 37.0694 29.0015C37.0694 28.3841 36.8636 27.7896 36.4749 27.3095L35.7279 26.3796C33.449 23.5137 32.199 19.9543 32.199 16.2881V14.6341C32.199 8.73476 28.0069 3.81098 22.4429 2.68293V2.43902C22.4429 1.08994 21.3529 0 20.0038 0Z"/>
      <path d="M14.386 34.386C14.386 35.8749 14.9775 37.3028 16.0303 38.3557C17.0832 39.4085 18.5111 40 20.0001 40C21.489 40 22.917 39.4085 23.9698 38.3557C25.0226 37.3028 25.6141 35.8749 25.6141 34.386H14.386Z"/>
    </svg>
  );
}

function IconSettingsNavSt() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

const ST_NAV_ITEMS = [
  { label: 'Learn',         Icon: IconLearnNav },
  { label: 'My Profile',    Icon: IconProfileNav },
  { label: 'New Game',      Icon: IconNewGameNav },
  { label: 'Notifications', Icon: IconActivityNav,  hasBadge: true },
  { label: 'Settings',      Icon: IconSettingsNavSt },
];

function MobileNav({ onNavigate, hasUnread, activePage }) {
  return (
    <nav className="mobile-nav">
      {ST_NAV_ITEMS.map(({ label, Icon, hasBadge }) => (
        <button
          key={label}
          className={`mobile-nav__item${activePage === label ? ' mobile-nav__item--active' : ''}${hasBadge ? ' mobile-nav__item--has-badge' : ''}`}
          onClick={
            label === 'Learn' ? () => onNavigate?.('learn-hub')
            : label === 'My Profile' ? () => onNavigate?.('profile')
            : label === 'New Game' ? () => onNavigate?.('play')
            : label === 'Settings' ? () => onNavigate?.('settings')
            : undefined
          }
        >
          <Icon />
          {hasBadge && hasUnread && <span className="mobile-nav__badge" />}
        </button>
      ))}
    </nav>
  );
}

export default function SettingsPage({ onNavigate }) {
  const section = useDMEState('settings.section', 'Connected Accounts');
  const showNotifs = section === 'Notification Preferences';
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');

  return (
    <div className="st-page surface-muted">
      <SiteHeader onLogoClick={() => onNavigate?.('index')} onNavigate={onNavigate} />

      <div className="st-content" data-section-id="st-content">
        <h1 className="st-title">Settings</h1>

        {showNotifs ? (
          <NotificationPreferences />
        ) : (
          <ConnectedAccounts section={section} />
        )}
      </div>

      <SiteFooter sectionId="gl-footer" />
      <MobileNav onNavigate={onNavigate} hasUnread={acState === 'Activity - Unread'} activePage="Settings" />
      <div className="mobile-nav__spacer" />
    </div>
  );
}
