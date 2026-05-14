import React, { useEffect } from 'react';
import { useDMEState, useDMESetState } from '../context/dme-states';
import SiteHeader from './SiteHeader';
import diceDecoration from '../imgs/dice-decoration.png';
import './IndexPage.css';

/* ─── SVG Icons ──────────────────────────────────────────────── */

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
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <path d="M0 35.0203C0 36.1284 0.898649 37.027 2.00676 37.027H26.1014C27.2095 37.027 28.1081 36.1284 28.1081 35.0203C28.1081 28.3649 22.7162 22.973 16.0608 22.973H12.0473C5.39189 22.973 0 28.3649 0 35.0203ZM5.94595 11.0811C5.94595 13.2315 6.80019 15.2938 8.32076 16.8144C9.84132 18.3349 11.9037 19.1892 14.0541 19.1892C16.2045 19.1892 18.2668 18.3349 19.7874 16.8144C21.3079 15.2938 22.1622 13.2315 22.1622 11.0811C22.1622 8.93067 21.3079 6.86834 19.7874 5.34778C18.2668 3.82721 16.2045 2.97297 14.0541 2.97297C11.9037 2.97297 9.84132 3.82721 8.32076 5.34778C6.80019 6.86834 5.94595 8.93067 5.94595 11.0811Z" fill="currentColor" />
      <path opacity="0.4" d="M35.1351 10.5405C35.1351 9.64189 34.4122 8.91891 33.5135 8.91891C32.6149 8.91891 31.8919 9.64189 31.8919 10.5405V13.7838H28.6486C27.75 13.7838 27.027 14.5068 27.027 15.4054C27.027 16.3041 27.75 17.027 28.6486 17.027H31.8919V20.2703C31.8919 21.1689 32.6149 21.8919 33.5135 21.8919C34.4122 21.8919 35.1351 21.1689 35.1351 20.2703V17.027H38.3784C39.277 17.027 40 16.3041 40 15.4054C40 14.5068 39.277 13.7838 38.3784 13.7838H35.1351V10.5405Z" fill="currentColor" />
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

/* Auth provider icon helpers (IconEnvelope/Google/Apple/Facebook) moved to
   AuthOverlay.jsx along with the auth provider buttons. */

/* ─── CTA Buttons ────────────────────────────────────────────── */

function CTAButtons({ onNavigate }) {
  const setDMEState = useDMESetState();
  const playFriend = () => {
    setDMEState(prev => ({ ...prev, 'play.challengeModal': 'Choose Mode' }));
    onNavigate?.('play');
  };
  return (
    <div className="ix-ctas">
      <button className="ix-cta ix-cta--ai" onClick={() => onNavigate?.('play')}>
        <span className="ix-cta-icon"><IconRobot /></span>
        <span>Play vs AI</span>
      </button>
      <button className="ix-cta ix-cta--friend" onClick={playFriend}>
        <span className="ix-cta-icon"><IconUserPlus /></span>
        <span>Play a friend</span>
      </button>
    </div>
  );
}

/* AuthPanel previously lived here as a half-page popover. Replaced by the
   global AuthOverlay component in src/components/AuthOverlay.jsx, which
   takes over any page (not just IndexPage). */

/* ─── IndexPage component ────────────────────────────────────── */

export default function IndexPage({ onNavigate }) {
  // Sync legacy `index.view` DME state into the global `auth.overlay` so
  // existing test URLs / DME presets still pop the auth UI when set.
  const indexView = useDMEState('index.view', 'Home');
  const setDMEState = useDMESetState();
  useEffect(() => {
    if (indexView === 'Home') return;
    setDMEState(prev => (
      prev['auth.overlay'] === indexView ? prev : { ...prev, 'auth.overlay': indexView }
    ));
  }, [indexView, setDMEState]);

  return (
    <div className="ix-page">
      <SiteHeader onNavigate={onNavigate} />

      <main className="ix-content">
        <img
          className="ix-dice-deco"
          src={diceDecoration}
          alt=""
          aria-hidden="true"
        />

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

        <CTAButtons onNavigate={onNavigate} />

        <p className="ix-learn-link">
          New To Backgammon?{' '}
          <button type="button" onClick={() => onNavigate('learn-hub')}>
            Learn How To Play
          </button>
        </p>

        <p className="ix-terms">
          By signing up, you agree to our{' '}
          <a href="/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </main>

      {/* AuthPanel removed. Auth Login / Sign Up is now driven globally by
          AuthOverlay (mounted in main.jsx) via the `auth.overlay` DME
          state, so it can take over any page, not just IndexPage. */}

      {/* Feedback FAB */}
      <button className="ix-feedback-btn" aria-label="Feedback">
        <IconFeedback />
      </button>
    </div>
  );
}
