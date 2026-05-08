import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDMEState, useDMESetState } from '../context/dme-states';
import Avatar from './Avatar';
import avatarImg from '../imgs/avatar-dink.png';
import logoWhite from '../imgs/logo/Logo White.svg';
import iconNewGame from '../imgs/icons/header icons/icon new game.svg';
import iconLearnBackgammon from '../imgs/icons/header icons/icon learn backgammon.svg';
import iconRollForGood from '../imgs/icons/header icons/icon roll for good.svg';
import iconAbout from '../imgs/icons/header icons/icon about.svg';
import iconRoadmap from '../imgs/icons/header icons/icon roadmap.svg';
import iconChangelog from '../imgs/icons/header icons/icon changelog.svg';
import iconProfile from '../imgs/icons/header icons/icon profile.svg';
import iconUpdateProfile from '../imgs/icons/header icons/icon update profile.svg';
import iconAccountSettings from '../imgs/icons/header icons/icon account settings.svg';
import iconBoardNThemes from '../imgs/icons/header icons/icon board n themes.svg';
import iconGameHistory from '../imgs/icons/header icons/icon game history.svg';
import ActivityCenter from './ActivityCenter';
import './SiteHeader.css';

/* ─── SVG Icons ──────────────────────────────────────────────── */

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

function IconImg({ src, alt = '' }) {
  return <img src={src} alt={alt} width="20" height="20" />;
}

function IconPlus() { return <IconImg src={iconNewGame} alt="New Game" />; }
function IconBook() { return <IconImg src={iconLearnBackgammon} alt="Learn" />; }
function IconDice() { return <IconImg src={iconRollForGood} alt="Roll For Good" />; }
function IconChatBubble() { return <IconImg src={iconAbout} alt="About" />; }
function IconCastle() { return <IconImg src={iconRoadmap} alt="Roadmap" />; }
function IconDocumentAlt() { return <IconImg src={iconChangelog} alt="Change Log" />; }
function IconProfile() { return <IconImg src={iconProfile} alt="Profile" />; }
function IconPen() { return <IconImg src={iconUpdateProfile} alt="Update Profile" />; }
function IconSettings() { return <IconImg src={iconAccountSettings} alt="Settings" />; }
function IconPalette() { return <IconImg src={iconBoardNThemes} alt="Boards & Themes" />; }
function IconHistory() { return <IconImg src={iconGameHistory} alt="Game History" />; }

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

/* ─── Language data ──────────────────────────────────────────── */

const LANGUAGES = [
  { code: 'en', name: 'English',    flag: 'america.png' },
  { code: 'es', name: 'Espa\u00f1ol',    flag: 'spain.png' },
  { code: 'fr', name: 'Fran\u00e7ais',   flag: 'france.png' },
  { code: 'de', name: 'Deutsch',    flag: 'germany.png' },
  { code: 'pt', name: 'Portugu\u00eas',  flag: 'portugal.png' },
  { code: 'it', name: 'Italiano',   flag: 'italy.png' },
  { code: 'tr', name: 'T\u00fcrk\u00e7e',     flag: 'turkey.png' },
  { code: 'ru', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',    flag: 'russia.png' },
  { code: 'nl', name: 'Nederlands', flag: 'netherlands.png' },
  { code: 'pl', name: 'Polski',     flag: 'poland.png' },
  { code: 'sv', name: 'Svenska',    flag: 'sweden.png' },
  { code: 'el', name: '\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac',   flag: 'greece.png' },
];

/* ─── Nav link definitions ───────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Learn Backgammon', page: 'learn-hub' },
  { label: 'Roll For Good',    page: 'roll-for-good' },
  { label: 'Roadmap',          href: 'https://feedback.backgammon.com/roadmap/main' },
  { label: 'Change Log',       href: 'https://feedback.backgammon.com/changelog' },
  { label: 'About',            page: 'about' },
];

/* ─── Hamburger menu items ───────────────────────────────────── */

const HAMBURGER_ITEMS = [
  { label: 'New Game',          Icon: IconPlus,        page: 'play', group: 0 },
  { label: 'Learn Backgammon',  Icon: IconBook,        page: 'learn-hub', group: 1 },
  { label: 'Roll For Good',    Icon: IconDice,        page: 'roll-for-good', group: 1 },
  { label: 'About',            Icon: IconChatBubble,  page: 'about', group: 1 },
  { label: 'Roadmap',          Icon: IconCastle,      href: 'https://feedback.backgammon.com/roadmap/main', group: 2 },
  { label: 'Change Log',       Icon: IconDocumentAlt, href: 'https://feedback.backgammon.com/changelog', group: 2 },
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
            {item.href ? (
              <a
                className="ix-dropdown__item"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <span className="ix-dropdown__item-icon"><item.Icon /></span>
                <span className="ix-dropdown__item-label">{item.label}</span>
              </a>
            ) : (
              <button
                className="ix-dropdown__item"
                onClick={() => { onNavigate(item.page); onClose(); }}
              >
                <span className="ix-dropdown__item-icon"><item.Icon /></span>
                <span className="ix-dropdown__item-label">{item.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── ProfileDropdown ────────────────────────────────────────── */

function ProfileDropdown({ isOpen, onClose, onNavigate, onAuthAction, onLogout, authState }) {
  if (!isOpen) return null;
  const { isLoggedIn, isGuest } = authState;

  return (
    <div className="ix-dropdown ix-dropdown--profile">
      <button
        className="ix-dropdown__item ix-dropdown__item-username"
        onClick={() => { onNavigate('profile'); onClose(); }}
      >
        <span className="ix-dropdown__item-icon"><IconProfile /></span>
        <span className="ix-dropdown__item-label">{isGuest ? 'Guest_847291' : 'PreciseTactician1829'}</span>
      </button>
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
              onClick={() => { onAuthAction?.('Login'); onClose(); }}
            >
              Log In
            </button>
            <button
              className="ix-dropdown__auth-btn ix-dropdown__auth-btn--signup"
              onClick={() => { onAuthAction?.('Sign Up'); onClose(); }}
            >
              Sign Up
            </button>
          </div>
        </>
      )}

      {isLoggedIn && (
        <button className="ix-dropdown__logout" onClick={() => { onLogout(); onClose(); }}>
          Log Out
        </button>
      )}
    </div>
  );
}

/* ─── SiteHeader ─────────────────────────────────────────────── */

export default function SiteHeader({ onNavigate, onAuthAction }) {
  const authState = useDMEState('auth.loggedIn');
  const setDMEState = useDMESetState();
  const isLoggedIn = authState === true || authState === 'logged-in';
  const isGuest = authState === 'guest';
  const isLoggedOut = authState === false || authState === 'logged-out';
  const showAvatar = isLoggedIn || isGuest;

  const handleLogout = useCallback(() => {
    setDMEState(prev => {
      const next = { ...prev, 'auth.loggedIn': 'logged-out' };
      try { sessionStorage.setItem('dme-states', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [setDMEState]);
  const currentPage = new URLSearchParams(window.location.search).get('page') || 'index';

  const [activeMenu, setActiveMenu] = useState(null);
  const headerRef = useRef(null);

  const toggleMenu = useCallback((menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
    // Opening a header dropdown closes the Activity Center so only one
    // header surface is open at a time. (Activity Center already calls
    // closeAll() before opening to close header dropdowns; this is the
    // reverse direction.)
    setDMEState(prev => (prev['social.activityOpen'] ? { ...prev, 'social.activityOpen': false } : prev));
  }, [setDMEState]);

  const closeAll = useCallback(() => setActiveMenu(null), []);

  const handleAuth = useCallback((action) => {
    // Drive the global Auth Overlay so Log in / Sign Up takes over the
    // current page on any surface, not just IndexPage. The legacy
    // onAuthAction prop still gets called for callers that listen
    // (IndexPage), but we no longer fall back to navigating to /index.
    setDMEState(prev => ({ ...prev, 'auth.overlay': action }));
    if (onAuthAction) {
      onAuthAction(action);
    }
  }, [setDMEState, onAuthAction]);

  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e) => {
      // Don't close when the user is interacting with an IDP panel
      // (DME / Comments / DevMode / Pages / States / etc). Otherwise
      // any click inside an open inspector counts as "outside" the
      // dropdown and dismisses it before it can be inspected.
      if (e.target.closest && (e.target.closest('[data-devmode-panel]') || e.target.closest('[data-devmode-ignore]'))) return;
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenu]);

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
        <span className="ix-logo" onClick={() => onNavigate('index')} style={{ cursor: 'pointer' }}>
          <img src={logoWhite} alt="Backgammon.com" />
        </span>

        <nav className="ix-nav">
          {NAV_LINKS.map(({ label, page, href }) => {
            const isActive = page && (currentPage === page || (page === 'learn-hub' && currentPage.startsWith('learn')));
            if (href) {
              return (
                <a
                  key={label}
                  className="ix-nav__link"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              );
            }
            return (
              <button
                key={page}
                className={`ix-nav__link${isActive ? ' ix-nav__link--active' : ''}`}
                onClick={() => onNavigate(page)}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="ix-header-right">
          <button
            className={`com-btn com-btn--tertiary com-btn--sm ix-play-btn${currentPage === 'index' ? ' ix-play-btn--hidden' : ''}`}
            onClick={() => {
              setDMEState(prev => ({ ...prev, 'play.modal': 'Game Mode' }));
              onNavigate('play');
            }}
            aria-hidden={currentPage === 'index'}
            tabIndex={currentPage === 'index' ? -1 : 0}
          >
            Play
          </button>

          {isLoggedIn && <ActivityCenter onNavigate={onNavigate} onBeforeOpen={closeAll} />}

          {showAvatar ? (
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
              <ProfileDropdown
                isOpen={activeMenu === 'profile'}
                onClose={closeAll}
                onNavigate={onNavigate}
                onAuthAction={handleAuth}
                onLogout={handleLogout}
                authState={{ isLoggedIn, isGuest, isLoggedOut }}
              />
            </div>
          ) : (
            <>
              <LanguageSelector
                isOpen={activeMenu === 'lang'}
                onToggle={() => toggleMenu('lang')}
                onClose={closeAll}
              />
              <button className="ix-btn ix-btn--login" onClick={() => handleAuth('Login')}>
                Login
              </button>
              <button className="ix-btn ix-btn--signup ix-btn--signup-header" onClick={() => handleAuth('Sign Up')}>
                Sign Up
              </button>
            </>
          )}

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

      {(activeMenu === 'hamburger' || activeMenu === 'profile' || activeMenu === 'lang') && (
        <div className="ix-backdrop" onClick={closeAll} />
      )}
    </header>
  );
}
