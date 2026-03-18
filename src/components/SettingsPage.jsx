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

      <div className="st-card">
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
      </div>

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
      <div className="st-card">
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
    </div>
  );
}

/* ─── Settings Page ──────────────────────────────────────────── */

export default function SettingsPage({ onNavigate }) {
  const section = useDMEState('settings.section', 'Connected Accounts');
  const showNotifs = section === 'Notification Preferences';

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
    </div>
  );
}
