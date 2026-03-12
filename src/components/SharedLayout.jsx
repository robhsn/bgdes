import React, { useState, useEffect } from 'react';
import avatarImg from '../imgs/avatar-dink.png';
import { useDMEState } from '../context/dme-states';

/* Token shorthand helpers */
const fl = 'var(--font-logo)';
const fb = 'var(--font-body)';
const fm = 'var(--font-meta)';
const fh = 'var(--font-heading)';
const fp = 'var(--font-pill)';

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

/* ─── Site Header ─────────────────────────────────────────────── */

export function SiteHeader({ onLogoClick, onNavigate, avatarSrc: avatarSrcProp }) {
  const [scrolled, setScrolled] = useState(false);
  const loggedIn = useDMEState('auth.loggedIn', true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    <header className={`ls-header${scrolled ? ' ls-header--scrolled' : ''}`}>
      <div
        onClick={onLogoClick}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          fontFamily: fl,
          fontWeight: 700,
          color: 'var(--color-logo)',
          letterSpacing: '-0.5px',
          lineHeight: 1,
          cursor: onLogoClick ? 'pointer' : 'default',
        }}
      >
        <span className="ls-logo-text">Backgammon</span>
        <span className="ls-logo-dot" style={{ opacity: 0.4 }}>.com</span>
      </div>

      {loggedIn ? (
        <div className="ls-header-auth" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            className="ls-login-btn"
            onClick={() => window.open('https://www.backgammon.com', '_blank')}
            style={{ padding: '7px 14px', fontSize: 12 }}
          >
            New Game
          </button>
          <div style={{ width: 1, height: 28, background: 'var(--color-border)', flexShrink: 0 }} />
          <div
            onClick={() => onNavigate?.('profile')}
            style={{
              display: 'flex', gap: 10, alignItems: 'center',
              cursor: onNavigate ? 'pointer' : 'default',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--color-border-subtle)',
              background: 'var(--color-avatar-bg)',
              flexShrink: 0, overflow: 'hidden', position: 'relative',
            }}>
              <img
                src={avatarSrcProp || avatarImg}
                alt="MyReallyLongCoolUsername"
                style={{
                  position: 'absolute',
                  width: '105.46%', height: '105.46%',
                  left: '-2.73%', top: '6.2%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <button className="ls-login-btn">Log In / Sign Up</button>
      )}
    </header>
    <div aria-hidden="true" className={`ls-header-spacer${scrolled ? ' ls-header-spacer--scrolled' : ''}`} />
    </>
  );
}

/* ─── Play Now CTA end-cap ────────────────────────────────────── */

export function PlayNowCta() {
  return (
    <div className="surface-accent" style={{
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
            border: '2px solid var(--btn-border)',
            boxShadow: '0 4px 0 var(--btn-border)',
            borderRadius: 10,
            padding: '10px 24px', fontFamily: fp, fontWeight: 700, fontSize: 15,
            color: 'var(--btn-secondary-fg)', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0,
            textDecoration: 'none',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 1px 0 var(--btn-border)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 var(--btn-border)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 var(--btn-border)'; }}
        >
          Play Now
        </a>
      </div>
    </div>
  );
}

/* ─── Site Footer ─────────────────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="surface-inverse" style={{
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
        <div style={{
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
