import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDMEState } from '../context/dme-states';
import Avatar from './Avatar';
import avatarImg from '../imgs/avatar-dink.png';
import logoWhite from '../imgs/logo/Logo White.svg';
import diceDecoration from '../imgs/dice-decoration.png';
import iconGoogle from '../imgs/icons/auth/google color.svg';
import iconApple from '../imgs/icons/auth/apple black.svg';
import iconFacebook from '../imgs/icons/auth/facebook color.svg';
import flagAmerica from '../imgs/icon-flags/america.png';
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

function IconFeedback() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 3C9.72 3 3 8.37 3 15c0 3.87 2.55 7.29 6.48 9.45L7.5 30l6.03-3.36c1.44.36 2.94.54 4.47.54 8.28 0 15-5.37 15-12S26.28 3 18 3z" fill="var(--prim-mint-700)" />
      <text x="18" y="19" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Inter">?</text>
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

function IconHamburger() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/>
      <line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function IconBook() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

function IconDice() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3"/>
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none"/>
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconChatBubble() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconCastle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/>
      <path d="M5 21V7l3-3 3 3h2l3-3 3 3v14"/>
      <path d="M9 21v-4h6v4"/>
      <path d="M9 11h.01M15 11h.01"/>
    </svg>
  );
}

function IconDocumentAlt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconPen() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
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

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

/* ─── Auth provider icons ────────────────────────────────────── */

function IconEnvelope() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path opacity="0.4" d="M4.19385 7.85313L10.0001 12L15.8063 7.85313L10.0001 3.5L4.19385 7.85313Z" fill="currentColor" />
      <path d="M15.8062 7.85313L10 3.5L4.19375 7.85313L10 12L15.8062 7.85313ZM2 7L10 1L18 7V17H2V7Z" fill="currentColor" />
    </svg>
  );
}

function IconGoogle() {
  return <img src={iconGoogle} alt="" width="20" height="20" />;
}

function IconApple() {
  return <img src={iconApple} alt="" width="20" height="20" />;
}

function IconFacebook() {
  return <img src={iconFacebook} alt="" width="20" height="20" />;
}

/* ─── Language data ──────────────────────────────────────────── */

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: 'america.png' },
  { code: 'es', name: 'Español',    flag: 'spain.png' },
  { code: 'fr', name: 'Français',   flag: 'france.png' },
  { code: 'de', name: 'Deutsch',    flag: 'germany.png' },
  { code: 'pt', name: 'Português',  flag: 'portugal.png' },
  { code: 'it', name: 'Italiano',   flag: 'italy.png' },
  { code: 'tr', name: 'Türkçe',     flag: 'turkey.png' },
  { code: 'ru', name: 'Русский',    flag: 'russia.png' },
  { code: 'nl', name: 'Nederlands', flag: 'netherlands.png' },
  { code: 'pl', name: 'Polski',     flag: 'poland.png' },
  { code: 'sv', name: 'Svenska',    flag: 'sweden.png' },
  { code: 'el', name: 'Ελληνικά',   flag: 'greece.png' },
];

/* ─── Nav link definitions ───────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Learn Backgammon', page: 'learn-hub' },
  { label: 'Roll For Good',    page: 'roll-for-good' },
  { label: 'Roadmap',          page: 'roadmap' },
  { label: 'Change Log',       page: 'changelog' },
  { label: 'About',            page: 'about' },
];

/* ─── Hamburger menu items ───────────────────────────────────── */

const HAMBURGER_ITEMS = [
  { label: 'New Game',          Icon: IconPlus,        page: 'play', group: 0 },
  { label: 'Learn Backgammon',  Icon: IconBook,        page: 'learn-hub', group: 1 },
  { label: 'Roll For Good',    Icon: IconDice,        page: 'roll-for-good', group: 1 },
  { label: 'About',            Icon: IconChatBubble,  page: 'about', group: 1 },
  { label: 'Roadmap',          Icon: IconCastle,      page: 'roadmap', group: 2 },
  { label: 'Change Log',       Icon: IconDocumentAlt, page: 'changelog', group: 2 },
];

/* ─── Profile menu items ─────────────────────────────────────── */

const PROFILE_ITEMS = [
  { id: 'profile',  label: 'Update Profile',   Icon: IconPen,      nav: 'profile' },
  { id: 'settings', label: 'Account Settings',  Icon: IconSettings, nav: 'settings' },
  { id: 'boards',   label: 'Boards & Themes',   Icon: IconPalette,  soon: true },
  { id: 'history',  label: 'Game History',       Icon: IconHistory,  soon: true },
];

/* ─── LanguageSelector ───────────────────────────────────────── */

function LanguageSelector({ isOpen, onToggle, onClose }) {
  const [selectedLang, setSelectedLang] = useState('en');
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === selectedLang) || LANGUAGES[0];
  const flagSrc = new URL(`../imgs/icon-flags/${current.flag}`, import.meta.url).href;

  return (
    <div ref={ref} className="ix-lang-wrap">
      <button className={`ix-lang${isOpen ? ' ix-lang--active' : ''}`} onClick={onToggle} type="button" aria-label="Select language">
        <img className="ix-lang__flag" src={flagSrc} alt={current.name} />
        <span className="ix-lang__chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <IconChevronDown size={12} />
        </span>
      </button>

      {isOpen && (
        <div className="ix-dropdown ix-dropdown--lang">
          {LANGUAGES.map(lang => {
            const isActive = lang.code === selectedLang;
            return (
              <button
                key={lang.code}
                className={`ix-dropdown__item${isActive ? ' ix-dropdown__item--active' : ''}`}
                onClick={() => { setSelectedLang(lang.code); onClose(); }}
              >
                <img
                  className="ix-lang__flag"
                  src={new URL(`../imgs/icon-flags/${lang.flag}`, import.meta.url).href}
                  alt=""
                />
                <span className="ix-dropdown__item-label">{lang.name}</span>
                {isActive && (
                  <span className="ix-dropdown__check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── HamburgerMenu ──────────────────────────────────────────── */

function HamburgerMenu({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  let lastGroup = HAMBURGER_ITEMS[0].group;

  return (
    <div className="ix-dropdown ix-dropdown--hamburger">
      {HAMBURGER_ITEMS.map((item, i) => {
        const showSep = i > 0 && item.group !== lastGroup;
        lastGroup = item.group;
        return (
          <React.Fragment key={item.label}>
            {showSep && <div className="ix-dropdown__separator--dotted" />}
            <button
              className="ix-dropdown__item"
              onClick={() => { onNavigate(item.page); onClose(); }}
            >
              <span className="ix-dropdown__item-icon"><item.Icon /></span>
              <span className="ix-dropdown__item-label">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── IndexProfileDropdown ───────────────────────────────────── */

function IndexProfileDropdown({ isOpen, onClose, onNavigate, onViewChange, authState }) {
  if (!isOpen) return null;
  const { isLoggedIn, isGuest } = authState;

  return (
    <div className="ix-dropdown ix-dropdown--profile">
      {/* Username header with person icon */}
      <div className="ix-dropdown__item-username">
        <span className="ix-dropdown__item-icon"><IconProfile /></span>
        <span>{isGuest ? 'Guest_847291' : 'PreciseTactician1829'}</span>
      </div>
      <div className="ix-dropdown__separator" />

      {PROFILE_ITEMS.map(({ id, label, Icon, soon, nav }) => (
        <button
          key={id}
          className={`ix-dropdown__item${soon && !nav ? ' ix-dropdown__item--disabled' : ''}`}
          onClick={() => {
            if (nav) { onNavigate(nav); onClose(); }
          }}
        >
          <span className="ix-dropdown__item-icon"><Icon /></span>
          <span className="ix-dropdown__item-label">{label}</span>
          {soon && <span className="ix-dropdown__badge">Soon</span>}
        </button>
      ))}

      {isGuest && (
        <>
          <div className="ix-dropdown__separator" />
          <div className="ix-dropdown__guest-prompt">
            <strong>Sign Up</strong> to save match history
          </div>
          <div className="ix-dropdown__auth-btns">
            <button
              className="ix-dropdown__auth-btn ix-dropdown__auth-btn--login"
              onClick={() => { onViewChange?.('Login'); onClose(); }}
            >
              Log In
            </button>
            <button
              className="ix-dropdown__auth-btn ix-dropdown__auth-btn--signup"
              onClick={() => { onViewChange?.('Sign Up'); onClose(); }}
            >
              Sign Up
            </button>
          </div>
        </>
      )}

      {isLoggedIn && (
        <button className="ix-dropdown__logout" onClick={onClose}>
          Log Out
        </button>
      )}
    </div>
  );
}

/* ─── IndexHeader ────────────────────────────────────────────── */

function IndexHeader({ authState, onNavigate, onViewChange }) {
  const { isLoggedIn, isGuest, isLoggedOut } = authState;
  const showAvatar = isLoggedIn || isGuest;
  const [activeMenu, setActiveMenu] = useState(null); // 'hamburger' | 'profile' | 'lang' | null
  const headerRef = useRef(null);

  const toggleMenu = useCallback((menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  }, []);

  const closeAll = useCallback(() => setActiveMenu(null), []);

  // Close on outside click
  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenu]);

  // Close on ESC
  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeMenu]);

  return (
    <header className="ix-header" ref={headerRef}>
      <div className="ix-header__inner">
        {/* Logo */}
        <span className="ix-logo" style={{ cursor: 'default' }}>
          <img src={logoWhite} alt="Backgammon.com" />
        </span>

        {/* Desktop nav links */}
        <nav className="ix-nav">
          {NAV_LINKS.map(({ label, page }) => (
            <button
              key={page}
              className="ix-nav__link"
              onClick={() => onNavigate(page)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="ix-header-right">
          {showAvatar ? (
            /* Logged-in or Guest: Avatar + chevron */
            <div
              className={`ix-avatar-trigger${activeMenu === 'profile' ? ' ix-avatar-trigger--active' : ''}`}
              onClick={() => toggleMenu('profile')}
            >
              <Avatar
                src={isGuest ? null : avatarImg}
                alt="Avatar"
                size="sm"
                fallbackInitial={isGuest ? '?' : undefined}
              />
              <span className={`ix-avatar-chevron${activeMenu === 'profile' ? ' ix-avatar-chevron--open' : ''}`}>
                <IconChevronDown size={14} />
              </span>
              <IndexProfileDropdown
                isOpen={activeMenu === 'profile'}
                onClose={closeAll}
                onNavigate={onNavigate}
                onViewChange={onViewChange}
                authState={authState}
              />
            </div>
          ) : (
            /* Logged-out: Language selector + Login + Sign Up */
            <>
              <LanguageSelector
                isOpen={activeMenu === 'lang'}
                onToggle={() => toggleMenu('lang')}
                onClose={closeAll}
              />
              <button className="ix-btn ix-btn--login" onClick={() => onViewChange('Login')}>
                Login
              </button>
              <button className="ix-btn ix-btn--signup ix-btn--signup-header" onClick={() => onViewChange('Sign Up')}>
                Sign Up
              </button>
            </>
          )}

          {/* Hamburger (mobile only) */}
          <div className={`ix-hamburger-wrap${activeMenu === 'hamburger' ? ' ix-hamburger-wrap--active' : ''}`}>
            <button
              className={`ix-hamburger${activeMenu === 'hamburger' ? ' ix-hamburger--active' : ''}`}
              onClick={() => toggleMenu('hamburger')}
              aria-label={activeMenu === 'hamburger' ? 'Close menu' : 'Open menu'}
            >
              {activeMenu === 'hamburger' ? <IconClose /> : <IconHamburger />}
            </button>
            <HamburgerMenu
              isOpen={activeMenu === 'hamburger'}
              onClose={closeAll}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </div>

      {/* Mobile backdrop overlay */}
      {(activeMenu === 'hamburger' || activeMenu === 'profile' || activeMenu === 'lang') && (
        <div className="ix-backdrop" onClick={closeAll} />
      )}
    </header>
  );
}

/* ─── CTA Buttons ────────────────────────────────────────────── */

function CTAButtons({ onNavigate }) {
  return (
    <div className="ix-ctas">
      <button className="ix-cta ix-cta--ai" onClick={() => onNavigate?.('play')}>
        <span className="ix-cta-icon"><IconRobot /></span>
        <span>Play vs AI</span>
      </button>
      <button className="ix-cta ix-cta--friend" onClick={() => onNavigate?.('play')}>
        <span className="ix-cta-icon"><IconUserPlus /></span>
        <span>Play a friend</span>
      </button>
    </div>
  );
}

/* ─── Auth form ──────────────────────────────────────────────── */

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

/* ─── IndexPage component ────────────────────────────────────── */

export default function IndexPage({ onNavigate }) {
  const authState = useDMEState('auth.loggedIn');
  const indexView = useDMEState('index.view', 'Home');
  const [localView, setLocalView] = useState(indexView);

  // DME state takes priority
  useEffect(() => {
    setLocalView(indexView);
  }, [indexView]);

  // Derive auth booleans — support legacy boolean + new select values
  const isLoggedIn = authState === true || authState === 'logged-in';
  const isGuest = authState === 'guest';
  const isLoggedOut = authState === false || authState === 'logged-out';

  const currentView = localView;
  const isHome = currentView === 'Home';

  return (
    <div className="ix-page">
      <IndexHeader
        authState={{ isLoggedIn, isGuest, isLoggedOut }}
        onNavigate={onNavigate}
        onViewChange={setLocalView}
      />

      <main className="ix-content">
        {isHome ? (
          <>
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
          </>
        ) : (
          <AuthForm view={currentView} onViewChange={setLocalView} />
        )}
      </main>

      {/* Feedback FAB */}
      <button className="ix-feedback-btn" aria-label="Feedback">
        <IconFeedback />
      </button>
    </div>
  );
}
