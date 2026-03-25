import React, { useState, useEffect, useRef } from 'react';
import avatarImg from '../imgs/avatar-dink.png';
import logoBlack from '../imgs/logo/Logo Black.svg';
import logoWhite from '../imgs/logo/Logo White.svg';
import { useDMEState } from '../context/dme-states';
import ActivityCenter from './ActivityCenter';
import Avatar from './Avatar';

/* Token shorthand helpers */
const fl = 'var(--font-logo)';
const fb = 'var(--font-body)';
const fm = 'var(--font-meta)';
const fh = 'var(--font-heading)';
const fp = 'var(--font-pill)';
const fd = 'var(--font-dropdown)';
const fdb = 'var(--font-dropdown-badge)';

/* ─── Social icons ────────────────────────────────────────────── */

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.89 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.28 8.28 0 0 0 4.84 1.55V7.1a4.85 4.85 0 0 1-1.06-.41z"/>
    </svg>
  );
}

function IconTwitch() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconBSky() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: 'TikTok',    Icon: IconTikTok    },
  { label: 'Twitch',    Icon: IconTwitch    },
  { label: 'Facebook',  Icon: IconFacebook  },
  { label: 'Instagram', Icon: IconInstagram },
  { label: 'X',         Icon: IconX         },
  { label: 'Bluesky',   Icon: IconBSky      },
];

/* ─── Dropdown menu icons ────────────────────────────────────── */

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/>
      <circle cx="6.5" cy="12" r="0.5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  );
}

function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function IconLearn() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function IconChevronDown({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

/* ─── Avatar dropdown menu ───────────────────────────────────── */

const MENU_ITEMS = [
  { id: 'profile',  label: 'Profile',           Icon: IconProfile,  nav: 'profile' },
  { id: 'settings', label: 'Settings',           Icon: IconSettings, nav: 'settings' },
  { id: 'learn',    label: 'Learn to play',       Icon: IconLearn,    nav: 'learn-hub' },
  { id: 'boards',   label: 'Boards & themes',    Icon: IconPalette,  soon: true },
  { id: 'history',  label: 'Match history',        Icon: IconHistory,  nav: 'profile', tab: 'Match History' },
];

export function AvatarDropdown({ avatarSrc, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', gap: 10, alignItems: 'center',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <Avatar src={avatarSrc || avatarImg} alt="Avatar" size="lg" />
        <span className="avatar-username" style={{
          fontFamily: fd, fontWeight: 600, fontSize: 'var(--size-dropdown)',
          color: 'var(--color-heading)', lineHeight: 1,
        }}>Robbbb</span>
        <span className="avatar-chevron" style={{
          color: 'var(--color-heading)', opacity: 0.4,
          display: 'flex', alignItems: 'center',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
        }}>
          <IconChevronDown />
        </span>
      </div>

      {open && (
        <div data-section-id="gl-dropdown" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'var(--color-dropdown-bg)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid var(--color-dropdown-border)',
          padding: '6px 0',
          whiteSpace: 'nowrap',
          width: 'max-content',
          minWidth: 180,
          zIndex: 9999,
          overflow: 'hidden',
        }}>
          {MENU_ITEMS.map(({ id, label, Icon, soon, nav, tab }) => (
            <div
              key={id}
              onClick={() => {
                setOpen(false);
                if (tab) {
                  sessionStorage.setItem('profile-tab-intent', tab);
                  sessionStorage.setItem('profile-scroll-intent', 'pp-history');
                }
                if (nav) onNavigate?.(nav);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px',
                cursor: nav ? 'pointer' : 'default',
                transition: 'background 0.1s',
                fontFamily: fd, fontWeight: 600, fontSize: 'var(--size-dropdown)',
                color: 'var(--color-dropdown-text)',
                lineHeight: 1,
                opacity: soon && !nav ? 0.55 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-dropdown-icon)' }}>
                <Icon />
              </span>
              <span style={{ flex: 1 }}>{label}</span>
              {soon && (
                <span style={{
                  fontFamily: fdb, fontWeight: 700, fontSize: 'var(--size-dropdown-badge)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: 'var(--color-dropdown-soon-bg)',
                  color: 'var(--color-dropdown-soon-fg)',
                  padding: '3px 7px',
                  borderRadius: 100,
                  lineHeight: 1,
                }}>Soon</span>
              )}
            </div>
          ))}

          {/* Separator */}
          <div style={{
            height: 1,
            background: 'var(--color-dropdown-separator)',
            margin: '6px 18px',
          }} />

          {/* Log out */}
          <div
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 18px',
              cursor: 'pointer',
              transition: 'background 0.1s',
              fontFamily: fd, fontWeight: 600, fontSize: 'var(--size-dropdown)',
              color: 'var(--color-dropdown-text)',
              lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-dropdown-icon)' }}>
              <IconLogout />
            </span>
            <span>Log out</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Site Header ─────────────────────────────────────────────── */

export function SiteHeader({ onLogoClick, onNavigate, avatarSrc: avatarSrcProp }) {
  const loggedIn = useDMEState('auth.loggedIn', true);
  const logoVariant = useDMEState('global.logoVariant', 'Black');
  const logoSrc = logoVariant === 'White' ? logoWhite : logoBlack;
  return (
    <>
    <header className="site-header" data-section-id="gl-header">
      <span
        role="link"
        tabIndex={0}
        onClick={onLogoClick}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onLogoClick?.()}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <img src={logoSrc} alt="Backgammon.com" className="site-header__logo-img" data-role-id="gl-logo" style={{ height: 'var(--size-logo)', width: 'auto' }} />
      </span>

      {loggedIn ? (
        <div className="site-header__auth" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            className="com-btn com-btn--primary com-btn--sm"
            data-role-id="gl-nav-newgame"
            onClick={() => onNavigate?.('play')}
          >
            New Game
          </button>
          <ActivityCenter onNavigate={onNavigate} />
          <AvatarDropdown avatarSrc={avatarSrcProp} onNavigate={onNavigate} />
        </div>
      ) : (
        <button className="com-btn com-btn--primary com-btn--sm">Log In / Sign Up</button>
      )}
    </header>
    <div aria-hidden="true" className="site-header__spacer" />
    </>
  );
}

/* ─── Play Now CTA end-cap ────────────────────────────────────── */

export function PlayNowCta({ sectionId }) {
  return (
    <div className="surface-accent" {...(sectionId ? { 'data-section-id': sectionId } : {})} style={{
      width: '100%', padding: '22px var(--spacing-h)',
      boxSizing: 'border-box', flexShrink: 0,
    }}>
      <div style={{
        maxWidth: 'var(--content-max-width)', margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fh, fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: 'var(--color-heading)', marginBottom: 4 }}>
            Ready to Play?
          </div>
          <div style={{ fontFamily: fb, fontSize: 15, lineHeight: 1.5, color: 'var(--color-body)' }}>
            Reading is good. Playing is better.
          </div>
        </div>
        <a
          href="https://backgammon.com/play"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'var(--btn-secondary-bg)',
            border: '2px solid var(--btn-secondary-border)',
            borderRadius: 10,
            padding: '10px 24px', fontFamily: fp, fontWeight: 700, fontSize: 15,
            color: 'var(--btn-secondary-fg)', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0,
            textDecoration: 'none',
          }}
        >
          Play Now
        </a>
      </div>
    </div>
  );
}

/* ─── Site Footer ─────────────────────────────────────────────── */

export function SiteFooter({ sectionId }) {
  return (
    <footer className="surface-inverse site-footer" {...(sectionId ? { 'data-section-id': sectionId } : {})} style={{
      width: '100%',
      padding: '32px var(--spacing-h) 28px',
      boxSizing: 'border-box',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      <div style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div data-role-id="gl-footer-heading" style={{
          display: 'flex', alignItems: 'flex-end',
          fontFamily: fl, fontWeight: 700,
          color: 'var(--color-logo)',
          letterSpacing: '-0.5px', lineHeight: 1,
        }}>
          <span style={{ fontSize: 20 }}>Backgammon</span>
          <span style={{ fontSize: 13, opacity: 0.35 }}>.com</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {SOCIAL_LINKS.map(({ label, Icon }) => (
            <a key={label} href="#" aria-label={label} style={{
              color: 'var(--color-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}>
              <Icon />
            </a>
          ))}
        </div>
      </div>
      <div style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto', width: '100%',
        height: 1, background: 'var(--color-border)',
      }} />
      <div style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto', width: '100%',
        display: 'flex', gap: 24, alignItems: 'center',
        flexWrap: 'wrap', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: fm, fontSize: 'var(--size-meta)', color: 'var(--color-muted)' }}>
          &copy; 2026 Backgammon.com
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ fontFamily: fm, fontSize: 'var(--size-meta)', color: 'var(--color-link)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ fontFamily: fm, fontSize: 'var(--size-meta)', color: 'var(--color-link)', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
