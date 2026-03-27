import React, { useState, useEffect } from 'react';
import { useDMEState } from '../context/dme-states';
import { AvatarDropdown } from './SharedLayout';
import logoBlack from '../imgs/logo/Logo Black.svg';
import logoWhite from '../imgs/logo/Logo White.svg';
import diceDecoration from '../imgs/dice-decoration.png';
import iconGoogle from '../imgs/icons/auth/google color.svg';
import iconApple from '../imgs/icons/auth/apple black.svg';
import iconFacebook from '../imgs/icons/auth/facebook color.svg';
import './IndexPage.css';

/* ─── SVG Icons (from backgammon.com bundle) ─────────────────── */

function IconRobot() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path opacity="0.4" d="M0 10.8V14.4C0 15.0638 0.53625 15.6 1.2 15.6C1.86375 15.6 2.4 15.0638 2.4 14.4V10.8C2.4 10.1363 1.86375 9.6 1.2 9.6C0.53625 9.6 0 10.1363 0 10.8ZM10.8 2.4V4.8H13.2V2.4C13.2 1.73626 12.6638 1.2 12 1.2C11.3363 1.2 10.8 1.73626 10.8 2.4ZM21.6 10.8V14.4C21.6 15.0638 22.1363 15.6 22.8 15.6C23.4638 15.6 24 15.0638 24 14.4V10.8C24 10.1363 23.4638 9.6 22.8 9.6C22.1363 9.6 21.6 10.1363 21.6 10.8Z" fill="currentColor" />
      <path d="M7.2 4.8C5.21248 4.8 3.6 6.41249 3.6 8.4V16.8C3.6 18.7875 5.21248 20.4 7.2 20.4H16.8C18.7875 20.4 20.4 18.7875 20.4 16.8V8.4C20.4 6.41249 18.7875 4.8 16.8 4.8H7.2ZM6.9 15.3H8.1C8.59873 15.3 9 15.7012 9 16.2C9 16.6987 8.59873 17.1 8.1 17.1H6.9C6.40123 17.1 6 16.6987 6 16.2C6 15.7012 6.40123 15.3 6.9 15.3ZM11.4 15.3H12.6C13.0987 15.3 13.5 15.7012 13.5 16.2C13.5 16.6987 13.0987 17.1 12.6 17.1H11.4C10.9012 17.1 10.5 16.6987 10.5 16.2C10.5 15.7012 10.9012 15.3 11.4 15.3ZM15.9 15.3H17.1C17.5987 15.3 18 15.7012 18 16.2C18 16.6987 17.5987 17.1 17.1 17.1H15.9C15.4012 17.1 15 16.6987 15 16.2C15 15.7012 15.4012 15.3 15.9 15.3ZM6.6 10.8C6.6 9.80589 7.40589 9 8.4 9C9.39411 9 10.2 9.80589 10.2 10.8C10.2 11.7941 9.39411 12.6 8.4 12.6C7.40589 12.6 6.6 11.7941 6.6 10.8ZM13.8 10.8C13.8 9.80589 14.6059 9 15.6 9C16.5941 9 17.4 9.80589 17.4 10.8C17.4 11.7941 16.5941 12.6 15.6 12.6C14.6059 12.6 13.8 11.7941 13.8 10.8Z" fill="currentColor" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#ixup)">
        <path opacity="0.4" d="M1.8 20.4863C1.8 21.1013 2.29880 21.6 2.9138 21.6H16.2863C16.9013 21.6 17.4 21.1013 17.4 20.4863C17.4 16.7925 14.4075 13.8 10.7138 13.8H8.4863C4.79255 13.8 1.8 16.7925 1.8 20.4863ZM5.1 7.2C5.1 8.39349 5.57415 9.53808 6.41807 10.382C7.26198 11.2259 8.40657 11.7 9.6 11.7C10.7935 11.7 11.9381 11.2259 12.782 10.382C13.6259 9.53808 14.1 8.39349 14.1 7.2C14.1 6.00654 13.6259 4.86195 12.782 4.01803C11.9381 3.17412 10.7935 2.7 9.6 2.7C8.40657 2.7 7.26198 3.17412 6.41807 4.01803C5.57415 4.86195 5.1 6.00654 5.1 7.2Z" fill="currentColor" />
        <path d="M21.3 6.9C21.3 6.40125 20.8988 6 20.4 6C19.9013 6 19.5 6.40125 19.5 6.9V8.7H17.7C17.2013 8.7 16.8 9.10125 16.8 9.6C16.8 10.0987 17.2013 10.5 17.7 10.5H19.5V12.3C19.5 12.7987 19.9013 13.2 20.4 13.2C20.8988 13.2 21.3 12.7987 21.3 12.3V10.5H23.1C23.5988 10.5 24 10.0987 24 9.6C24 9.10125 23.5988 8.7 23.1 8.7H21.3V6.9Z" fill="currentColor" />
      </g>
      <defs>
        <clipPath id="ixup"><rect width="24" height="24" fill="currentColor" /></clipPath>
      </defs>
    </svg>
  );
}

function IconEnvelope() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path opacity="0.4" d="M4.19385 7.85313L10.0001 12L15.8063 7.85313L10.0001 3.5L4.19385 7.85313Z" fill="currentColor" />
      <path d="M15.8062 7.85313L10 3.5L4.19375 7.85313L10 12L15.8062 7.85313ZM2 7L10 1L18 7V17H2V7Z" fill="currentColor" />
    </svg>
  );
}

function IconArrowDown() {
  return (
    <svg className="ix-arrow-icon" viewBox="0 0 14 14" fill="currentColor">
      <path d="M4.3945e-05 6.23864L1.8026 4.4233L5.58669 8.20739L5.58669 0L8.24578 0L8.24578 8.20739L12.0299 4.4233L13.8324 6.23864L6.91624 13.1548L4.3945e-05 6.23864Z" />
    </svg>
  );
}

function IconFeedback() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 3C9.72 3 3 8.37 3 15c0 3.87 2.55 7.29 6.48 9.45L7.5 30l6.03-3.36c1.44.36 2.94.54 4.47.54 8.28 0 15-5.37 15-12S26.28 3 18 3z" fill="var(--prim-mint-700)" />
      <text x="18" y="19" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter">?</text>
    </svg>
  );
}

/* ─── Auth provider icons ────────────────────────────────────── */

function IconGoogle() {
  return <img src={iconGoogle} alt="" width="20" height="20" />;
}

function IconApple() {
  return <img src={iconApple} alt="" width="20" height="20" />;
}

function IconFacebook() {
  return <img src={iconFacebook} alt="" width="20" height="20" />;
}

/* ─── Newsletter sub-component ───────────────────────────────── */

function Newsletter({ horizontal }) {
  return (
    <div className={`ix-newsletter${horizontal ? ' ix-newsletter--horizontal' : ''}`}>
      <img
        src={diceDecoration}
        alt=""
        aria-hidden="true"
        className="ix-newsletter-dice"
      />
      <div className="ix-newsletter-left">
        <p className="ix-newsletter-label">We're in Early Access</p>
        <p className="ix-newsletter-cta-text">
          Sign up for updates
          <IconArrowDown />
        </p>
      </div>
      <div className="ix-newsletter-right">
        <div className="ix-newsletter-input-row">
          <div className="ix-newsletter-input-group">
            <IconEnvelope />
            <input
              className="ix-newsletter-input"
              type="text"
              placeholder="Email address"
              readOnly
            />
          </div>
          <button className="ix-newsletter-submit" type="button">
            Sign Up
          </button>
        </div>
        <p className="ix-newsletter-terms">
          By signing up, you agree to our
          <a href="/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          and
          <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

/* ─── CTA Buttons sub-component ──────────────────────────────── */

function CTAButtons({ className, cardVariant, onNavigate }) {
  const base = cardVariant ? 'ix-card-cta' : 'ix-cta';
  return (
    <div className={className}>
      <button className={`${base} ${base}--ai`} onClick={() => onNavigate?.('play')}>
        <span className="ix-cta-icon"><IconRobot /></span>
        <span>Play vs AI</span>
      </button>
      <button className={`${base} ${base}--friend`} onClick={() => onNavigate?.('play')}>
        <span className="ix-cta-icon"><IconUserPlus /></span>
        <span>Play a friend</span>
      </button>
    </div>
  );
}

/* ─── Auth form sub-component ────────────────────────────────── */

function AuthForm({ view, onViewChange }) {
  const isLogin = view === 'Login' || view === 'Login Error';
  const isError = view === 'Login Error';

  return (
    <div className="ix-auth-wrap">
      <button
        className="ix-auth-back"
        onClick={() => onViewChange('Home')}
        type="button"
      >
        <span aria-hidden="true">&larr;</span>{' '}
        {isLogin ? 'Log in' : 'Sign up'}
      </button>

      {isError && (
        <div className="ix-auth-error" role="alert">
          Invalid email or password. Please try again.
        </div>
      )}

      <div className="ix-auth-providers">
        <button className="ix-auth-provider-btn" type="button">
          <span className="ix-auth-provider-icon"><IconEnvelope /></span>
          <span>{isLogin ? 'Log in with Email' : 'Continue with Email'}</span>
        </button>
        <button className="ix-auth-provider-btn" type="button">
          <span className="ix-auth-provider-icon"><IconFacebook /></span>
          <span>{isLogin ? 'Log in with Facebook' : 'Continue with Facebook'}</span>
        </button>
        <button className="ix-auth-provider-btn" type="button">
          <span className="ix-auth-provider-icon"><IconGoogle /></span>
          <span>{isLogin ? 'Log in with Google' : 'Continue with Google'}</span>
        </button>
        <button className="ix-auth-provider-btn" type="button">
          <span className="ix-auth-provider-icon"><IconApple /></span>
          <span>{isLogin ? 'Log in with Apple' : 'Continue with Apple'}</span>
        </button>
      </div>

      <p className="ix-auth-switch">
        {isLogin ? (
          <>
            New user?{' '}
            <button type="button" onClick={() => onViewChange('Sign Up')}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => onViewChange('Login')}>
              Login
            </button>
          </>
        )}
      </p>
    </div>
  );
}

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

function IconSettingsNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

const IX_NAV_ITEMS = [
  { label: 'Learn',         Icon: IconLearnNav },
  { label: 'My Profile',    Icon: IconProfileNav },
  { label: 'New Game',      Icon: IconNewGameNav },
  { label: 'Notifications', Icon: IconActivityNav,  hasBadge: true },
  { label: 'Settings',      Icon: IconSettingsNav },
];

function MobileNav({ onNavigate, hasUnread }) {
  return (
    <nav className="mobile-nav">
      {IX_NAV_ITEMS.map(({ label, Icon, hasBadge }) => (
        <button
          key={label}
          className={`mobile-nav__item${hasBadge ? ' mobile-nav__item--has-badge' : ''}`}
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

/* ─── IndexPage component ────────────────────────────────────── */

export default function IndexPage({ onNavigate }) {
  const loggedIn = useDMEState('auth.loggedIn');
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');
  const logoVariant = useDMEState('global.logoVariant', 'Black');
  const logoSrc = logoVariant === 'White' ? logoWhite : logoBlack;
  const indexView = useDMEState('index.view', 'Home');
  const [localView, setLocalView] = useState(indexView);

  // DME state takes priority
  useEffect(() => {
    setLocalView(indexView);
  }, [indexView]);

  const currentView = localView;
  const isHome = currentView === 'Home';

  return (
    <div className="ix-page">
      <main className="ix-main">
        {/* ── Left panel: hero ─────────────────────────────────── */}
        <section className={`ix-left${isHome ? ' surface-tertiary' : ''}`} data-section-id={isHome ? 'ix-left' : 'ix-auth'}>
          {/* Header */}
          <div className="ix-header">
            <span className="ix-logo" style={{ cursor: 'default' }}>
              <img src={isHome ? logoSrc : logoBlack} alt="Backgammon.com" />
            </span>
            <div className="ix-header-actions">
              {loggedIn ? (
                <div style={{ '--color-avatar-bg': 'var(--prim-mint-700)' }}>
                  <AvatarDropdown onNavigate={onNavigate} />
                </div>
              ) : isHome ? (
                <>
                  <button className="ix-btn ix-btn--login" onClick={() => setLocalView('Login')}>Log In</button>
                  <button className="ix-btn ix-btn--signup" onClick={() => setLocalView('Sign Up')}>Sign Up</button>
                </>
              ) : null}
            </div>
          </div>

          {/* View-dependent content */}
          {isHome ? (
            <>
              {/* Hero text */}
              <div className="ix-hero-wrap">
                <div className="ix-hero">
                  <h1>
                    <span>Play Backgammon online.</span>
                    <br />
                    <span>A classic game, made modern.</span>
                  </h1>
                  <p className="ix-hero-sub">
                    Enjoy one of the world's oldest games, for free, right here in your browser
                  </p>
                </div>
              </div>

              {/* Mobile CTAs (hidden on lg+) */}
              <CTAButtons className="ix-mobile-ctas" onNavigate={onNavigate} />

              {/* Desktop newsletter (hidden on mobile) */}
              <div className="ix-newsletter-desktop">
                <Newsletter horizontal />
              </div>
            </>
          ) : (
            <AuthForm view={currentView} onViewChange={setLocalView} />
          )}
        </section>

        {/* ── Right panel: board background ────────────────────── */}
        <section className="ix-right surface-muted" data-section-id="ix-right">
          {/* Desktop: Play Now card (hidden in auth views) */}
          {isHome && (
            <div className="ix-play-card">
              <div className="ix-play-card-inner">
                <div className="ix-play-card-content">
                  <p className="ix-play-card-title">Play now</p>
                  <CTAButtons className="ix-play-card-content" cardVariant onNavigate={onNavigate} />
                </div>
              </div>
            </div>
          )}

          {/* Mobile: newsletter in right panel */}
          <div className="ix-newsletter-mobile">
            <Newsletter />
          </div>
        </section>
      </main>

      {/* Feedback FAB */}
      <button className="ix-feedback-btn" aria-label="Feedback">
        <IconFeedback />
      </button>

      <MobileNav onNavigate={onNavigate} hasUnread={acState === 'Activity - Unread'} />
      <div className="mobile-nav__spacer" />
    </div>
  );
}
