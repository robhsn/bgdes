import React from 'react';
import { useDMEState } from '../context/dme-states';
import welcomeLogo from '../imgs/welcome_logo.svg';
import diceDecoration from '../imgs/dice-decoration.png';
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
      <path d="M18 3C9.72 3 3 8.37 3 15c0 3.87 2.55 7.29 6.48 9.45L7.5 30l6.03-3.36c1.44.36 2.94.54 4.47.54 8.28 0 15-5.37 15-12S26.28 3 18 3z" fill="#0D3529" />
      <text x="18" y="19" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter">?</text>
    </svg>
  );
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

function CTAButtons({ className, cardVariant }) {
  const base = cardVariant ? 'ix-card-cta' : 'ix-cta';
  return (
    <div className={className}>
      <button className={`${base} ${base}--ai`}>
        <span className="ix-cta-icon"><IconRobot /></span>
        <span>Play vs AI</span>
      </button>
      <button className={`${base} ${base}--friend`}>
        <span className="ix-cta-icon"><IconUserPlus /></span>
        <span>Play a friend</span>
      </button>
    </div>
  );
}

/* ─── IndexPage component ────────────────────────────────────── */

export default function IndexPage({ onNavigate }) {
  const loggedIn = useDMEState('auth.loggedIn');

  return (
    <div className="ix-page">
      <main className="ix-main">
        {/* ── Left panel: hero ─────────────────────────────────── */}
        <section className="ix-left">
          {/* Header */}
          <div className="ix-header">
            <a href="https://www.backgammon.com" target="_blank" rel="noopener noreferrer" className="ix-logo">
              <img src={welcomeLogo} alt="Backgammon.com" />
            </a>
            <div className="ix-header-actions">
              {loggedIn ? (
                <button className="ix-btn ix-btn--dashboard">Go to Dashboard</button>
              ) : (
                <>
                  <button className="ix-btn ix-btn--login">Log In</button>
                  <button className="ix-btn ix-btn--signup">Sign Up</button>
                </>
              )}
            </div>
          </div>

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
          <CTAButtons className="ix-mobile-ctas" />

          {/* Desktop newsletter (hidden on mobile) */}
          <div className="ix-newsletter-desktop">
            <Newsletter horizontal />
          </div>
        </section>

        {/* ── Right panel: board background ────────────────────── */}
        <section className="ix-right">
          {/* Desktop: Play Now card */}
          <div className="ix-play-card">
            <div className="ix-play-card-inner">
              <div className="ix-play-card-content">
                <p className="ix-play-card-title">Play now</p>
                <CTAButtons className="ix-play-card-content" cardVariant />
              </div>
            </div>
          </div>

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
    </div>
  );
}
