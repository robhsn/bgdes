import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDMEState } from '../context/dme-states';
import Avatar from './Avatar';
import avatarImg from '../imgs/avatar-dink.png';
import logoWhite from '../imgs/logo/Logo White.svg';
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
                style={{ textDecoration: 'none', color: 'inherit' }}
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

function ProfileDropdown({ isOpen, onClose, onNavigate, onAuthAction, authState }) {
  if (!isOpen) return null;
  const { isLoggedIn, isGuest } = authState;

  return (
    <div className="ix-dropdown ix-dropdown--profile">
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
        <button className="ix-dropdown__logout" onClick={onClose}>
          Log Out
        </button>
      )}
    </div>
  );
}

/* ─── SiteHeader ─────────────────────────────────────────────── */

export default function SiteHeader({ onNavigate, onAuthAction }) {
  const authState = useDMEState('auth.loggedIn');
  const isLoggedIn = authState === true || authState === 'logged-in';
  const isGuest = authState === 'guest';
  const isLoggedOut = authState === false || authState === 'logged-out';
  const showAvatar = isLoggedIn || isGuest;
  const currentPage = new URLSearchParams(window.location.search).get('page') || 'index';

  const [activeMenu, setActiveMenu] = useState(null);
  const headerRef = useRef(null);

  const toggleMenu = useCallback((menu) => {
    setActiveMenu(prev => prev === menu ? null : menu);
  }, []);

  const closeAll = useCallback(() => setActiveMenu(null), []);

  const handleAuth = useCallback((action) => {
    if (onAuthAction) {
      onAuthAction(action);
    } else {
      onNavigate('index');
    }
  }, [onAuthAction, onNavigate]);

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
          {currentPage !== 'index' && (
            <button
              className="com-btn com-btn--tertiary com-btn--sm ix-play-btn"
              onClick={() => onNavigate('play')}
            >
              Play
            </button>
          )}

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
