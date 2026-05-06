import React from 'react';
import { createPortal } from 'react-dom';
import { useDMEState, useDMESetState } from '../context/dme-states';
import iconGoogle from '../imgs/icons/auth/google color.svg';
import iconApple from '../imgs/icons/auth/apple black.svg';
import iconFacebook from '../imgs/icons/fb-logo.png';
import logoBlack from '../imgs/logo/Logo Black.svg';

/* ─── Auth provider icons ────────────────────────────────────── */
function IconEnvelope() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path opacity="0.4" d="M4.19385 7.85313L10.0001 12L15.8063 7.85313L10.0001 3.5L4.19385 7.85313Z" fill="currentColor" />
      <path d="M15.8062 7.85313L10 3.5L4.19375 7.85313L10 12L15.8062 7.85313ZM2 7L10 1L18 7V17H2V7Z" fill="currentColor" />
    </svg>
  );
}
function IconGoogle()   { return <img src={iconGoogle}   alt="" width="20" height="20" />; }
function IconApple()    { return <img src={iconApple}    alt="" width="20" height="20" />; }
function IconFacebook() { return <img src={iconFacebook} alt="" width="20" height="20" />; }

/* ─── Full-page Auth overlay ──────────────────────────────────── */
export default function AuthOverlay() {
  const view = useDMEState('auth.overlay', 'None');
  const setDmeStates = useDMESetState();

  if (view === 'None') return null;

  const isLogin = view === 'Login' || view === 'Login Error';
  const isError = view === 'Login Error';

  const close = () => {
    setDmeStates(prev => ({ ...prev, 'auth.overlay': 'None' }));
  };
  const setView = (next) => {
    setDmeStates(prev => ({ ...prev, 'auth.overlay': next }));
  };
  const handleProviderClick = () => {
    setDmeStates(prev => ({ ...prev, 'auth.loggedIn': 'logged-in', 'auth.overlay': 'None' }));
  };

  return createPortal(
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={isLogin ? 'Log in' : 'Sign up'}>
      <button className="auth-overlay__close" onClick={close} aria-label="Close">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <img className="auth-overlay__logo" src={logoBlack} alt="Backgammon.com" />

      <div className="auth-overlay__wrap">
        <h1 className="auth-overlay__title">
          {isLogin ? 'Log in' : 'Sign up'}
        </h1>

        {isError && (
          <div className="auth-overlay__error" role="alert">
            Invalid email or password. Please try again.
          </div>
        )}

        <div className="auth-overlay__providers">
          <button className="auth-overlay__provider-btn" type="button" onClick={handleProviderClick}>
            <span className="auth-overlay__provider-icon"><IconEnvelope /></span>
            <span>{isLogin ? 'Log in with Email' : 'Continue with Email'}</span>
          </button>
          <button className="auth-overlay__provider-btn" type="button" onClick={handleProviderClick}>
            <span className="auth-overlay__provider-icon"><IconFacebook /></span>
            <span>{isLogin ? 'Log in with Facebook' : 'Continue with Facebook'}</span>
          </button>
          <button className="auth-overlay__provider-btn" type="button" onClick={handleProviderClick}>
            <span className="auth-overlay__provider-icon"><IconGoogle /></span>
            <span>{isLogin ? 'Log in with Google' : 'Continue with Google'}</span>
          </button>
          <button className="auth-overlay__provider-btn" type="button" onClick={handleProviderClick}>
            <span className="auth-overlay__provider-icon"><IconApple /></span>
            <span>{isLogin ? 'Log in with Apple' : 'Continue with Apple'}</span>
          </button>
        </div>

        <p className="auth-overlay__switch">
          {isLogin ? (
            <>
              New user?{' '}
              <button type="button" onClick={() => setView('Sign Up')}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setView('Login')}>
                Log in
              </button>
            </>
          )}
        </p>

        <p className="auth-overlay__terms">
          By continuing, you agree to our{' '}
          <a href="/terms-of-service/" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>
    </div>,
    document.body,
  );
}
