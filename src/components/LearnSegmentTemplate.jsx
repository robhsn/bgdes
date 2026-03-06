import React, { useRef, useState, useEffect } from 'react';
import './LearnSegmentTemplate.css';
import avatarImg from '../imgs/avatar-dink.png';

const ASSETS = {
  avatar: avatarImg,
};

/* Token shorthand helpers — all resolve via CSS custom properties */
const fh = 'var(--font-heading)';    /* H1                */
const fs = 'var(--font-subheading)'; /* H2                */
const fb = 'var(--font-body)';       /* body paragraphs   */
const fl = 'var(--font-logo)';       /* site logo         */
const fp = 'var(--font-pill)';       /* breadcrumb pills  */
const ft = 'var(--font-toc)';        /* TOC labels        */
const fm = 'var(--font-meta)';       /* meta / reviewer   */

/* ─── Nav icons ───────────────────────────────────────────────── */

function IconTrophy() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h10v7a5 5 0 0 1-10 0V3Z"/>
      <path d="M4 5.5H7M17 5.5h3"/>
      <path d="M12 15v3M9 21h6"/>
    </svg>
  );
}

function IconLearning() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <path d="M8 8h8M8 12h8M8 16h5"/>
    </svg>
  );
}

function IconNewGame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
    </svg>
  );
}

function IconFriends() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="9" cy="7" r="3.5"/>
      <path d="M2 20c0-3.31 3.13-6 7-6s7 2.69 7 6"/>
      <circle cx="18" cy="7" r="3" strokeWidth="1.4"/>
      <path d="M15.5 20c0-2.12 1.3-3.96 3.5-4.8" strokeWidth="1.4"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M4 21c0-4.42 3.58-8 8-8s8 3.58 8 8"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Challenges', Icon: IconTrophy,   active: false },
  { label: 'Learning',   Icon: IconLearning,  active: true  },
  { label: 'New Game',   Icon: IconNewGame,   active: false },
  { label: 'Friends',    Icon: IconFriends,   active: false },
  { label: 'Profile',    Icon: IconProfile,   active: false },
];

function MobileNav() {
  return (
    <nav className="ls-mobile-nav">
      {NAV_ITEMS.map(({ label, Icon, active }) => (
        <button key={label} className={`ls-nav-item${active ? ' ls-nav-item-active' : ''}`}>
          <div className="ls-nav-icon-wrap">
            <Icon />
          </div>
          <span className="ls-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Inline SVG badge — fills controlled by --color-badge-icon / --color-badge-icon-inner */
function BadgeIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 39 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    >
      <path
        d="M0.694387 14.8938C-0.231462 16.5122 -0.231462 18.4951 0.694387 20.1062L7.70751 32.361C8.64065 33.994 10.383 35 12.2639 35H26.2318C28.1126 35 29.855 33.994 30.7881 32.361L37.8012 20.1062C38.7271 18.4878 38.7271 16.5049 37.8012 14.8938L30.7881 2.63903C29.855 1.00604 28.1126 0 26.2318 0H12.2639C10.383 0 8.64065 1.00604 7.70751 2.63903L0.694387 14.8938Z"
        fill="transparent"
      />
      <path
        d="M5.2824 15.538C4.58556 16.7561 4.58556 18.2485 5.2824 19.4611L10.5608 28.6847C11.2632 29.9138 12.5745 30.671 13.9902 30.671H24.5032C25.9188 30.671 27.2302 29.9138 27.9325 28.6847L33.211 19.4611C33.9078 18.243 33.9078 16.7506 33.211 15.538L27.9325 6.3144C27.2302 5.08532 25.9188 4.32812 24.5032 4.32812H13.9902C12.5745 4.32812 11.2632 5.08532 10.5608 6.3144L5.2824 15.538Z"
        fill="var(--color-badge-icon-inner)"
      />
      <path
        d="M12.1113 15.1754L18.6488 17.866C18.9551 17.991 19.2801 18.0566 19.6113 18.0566C19.9426 18.0566 20.2676 17.991 20.5738 17.866L28.1488 14.7473C28.4301 14.6316 28.6113 14.3598 28.6113 14.0566C28.6113 13.7535 28.4301 13.4816 28.1488 13.366L20.5738 10.2473C20.2676 10.1223 19.9426 10.0566 19.6113 10.0566C19.2801 10.0566 18.9551 10.1223 18.6488 10.2473L11.0738 13.366C10.7926 13.4816 10.6113 13.7535 10.6113 14.0566V23.3066C10.6113 23.7223 10.9457 24.0566 11.3613 24.0566C11.777 24.0566 12.1113 23.7223 12.1113 23.3066V15.1754ZM13.6113 17.416V21.0566C13.6113 22.7129 16.2988 24.0566 19.6113 24.0566C22.9238 24.0566 25.6113 22.7129 25.6113 21.0566V17.4129L21.1457 19.2535C20.6582 19.4535 20.1395 19.5566 19.6113 19.5566C19.0832 19.5566 18.5645 19.4535 18.077 19.2535L13.6113 17.4129V17.416Z"
        fill="var(--color-badge-icon)"
      />
    </svg>
  );
}

/** Two-tone pill breadcrumb — clips both halves into one capsule */
function BreadcrumbPills({ course, lesson }) {
  const pillBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
    flexShrink: 0,
  };
  const pillText = {
    fontFamily: fp,
    fontWeight: 700,
    fontSize: 'var(--size-pill)',
    lineHeight: 1.3,
    color: 'var(--color-white)',
    whiteSpace: 'nowrap',
    fontFeatureSettings: "'lnum' 1, 'pnum' 1",
    margin: 0,
  };
  return (
    <div className="ls-pills">
      <div style={{ ...pillBase, background: 'var(--color-pill)', paddingLeft: 16, paddingRight: 12 }}>
        <span style={pillText}>{course}</span>
      </div>
      <div style={{ ...pillBase, background: 'var(--color-accent)', paddingLeft: 12, paddingRight: 16 }}>
        <span style={pillText}>{lesson}</span>
      </div>
    </div>
  );
}

function HRule() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border)', flexShrink: 0 }} />;
}

function SectionBreak() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border-light)', flexShrink: 0 }} />;
}

function ImageWithCaption({ caption }) {
  return (
    <div className="ls-image-col">
      <div className="ls-image-placeholder" />
      {caption && (
        <div style={{
          background: 'var(--color-statement-bg)',
          borderLeft: '3px solid var(--color-statement-border)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          paddingRight: 16,
          paddingTop: 8,
          paddingBottom: 8,
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <p style={{
            fontFamily: fb,
            fontWeight: 'var(--prim-type-body-weight)',
            fontSize: 'var(--size-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-statement-text)',
            margin: 0,
            flex: '1 0 0',
          }}>
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}

function Callout({ children }) {
  return (
    <div style={{
      borderLeft: '2px solid var(--color-callout-border)',
      paddingLeft: 8,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <p style={{
        fontFamily: fb,
        fontWeight: 700,
        fontSize: 'var(--size-body)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--color-muted)',
        margin: 0,
        flex: '1 0 0',
      }}>
        {children}
      </p>
    </div>
  );
}

function H2({ children }) {
  return (
    <h2
      className="ls-h2"
      style={{
        fontFamily: fs,
        color: 'var(--color-heading)',
      }}
    >
      {children}
    </h2>
  );
}

function BodyText({ children, muted = false }) {
  return (
    <div style={{
      fontFamily: fb,
      fontWeight: 'var(--prim-type-body-weight)',
      fontSize: 'var(--size-body)',
      lineHeight: 'var(--lh-body)',
      color: muted ? 'var(--color-muted)' : 'var(--color-body)',
      width: '100%',
    }}>
      {children}
    </div>
  );
}

/** Checker placement row: coloured point-label pill + bold name + description */
function CheckerStack({ point, name, description }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0,
        background: 'var(--color-callout-border)',
        borderRadius: 4,
        padding: '3px 10px',
        fontFamily: fp,
        fontWeight: 700,
        fontSize: 11,
        color: 'var(--color-bg)',
        letterSpacing: '0.04em',
        marginTop: 4,
        whiteSpace: 'nowrap',
      }}>
        {point}
      </div>
      <BodyText>
        <p style={{ margin: 0 }}>
          <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{name}:</strong>{' '}{description}
        </p>
      </BodyText>
    </div>
  );
}

/** Bullet point row for rules lists */
function BulletItem({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 6, height: 6,
        borderRadius: '50%',
        background: 'var(--color-callout-border)',
        marginTop: 10,
      }} />
      <BodyText>
        <p style={{ margin: 0 }}>
          {label && <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{label}:</strong>}
          {label ? ' ' : ''}{children}
        </p>
      </BodyText>
    </div>
  );
}

/** White downward-pointing triangles that form the transition into the gray section */
function ZigzagSeparator() {
  const W = 28.551;
  const H = 28;
  const count = 54;
  const totalW = W * count;

  let d = `M0,0`;
  for (let i = 0; i < count; i++) {
    const x = i * W;
    d += ` L${x + W / 2},${H} L${x + W},0`;
  }
  d += ` Z`;

  return (
    <div style={{
      width: '100%',
      height: H,
      background: 'var(--sf-muted-bg)',
      flexShrink: 0,
      marginBottom: -H,
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
    }}>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${totalW} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ display: 'block' }}
      >
        <path d={d} style={{ fill: 'var(--color-bg)' }} />
      </svg>
    </div>
  );
}

/* ─── Social icons ───────────────────────────────────────────── */

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

function SiteFooter() {
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
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          fontFamily: fl, fontWeight: 700,
          color: 'var(--color-logo)',
          letterSpacing: '-0.5px', lineHeight: 1,
        }}>
          <span style={{ fontSize: 20 }}>Backgammon</span>
          <span style={{ fontSize: 13, opacity: 0.35 }}>.com</span>
        </div>
        {/* Social icons */}
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
        <span style={{ fontFamily: fm, fontSize: 13, color: 'var(--color-muted)' }}>
          © 2026 Backgammon.com
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ fontFamily: fm, fontSize: 13, color: 'var(--color-link)', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ fontFamily: fm, fontSize: 13, color: 'var(--color-link)', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Quiz ───────────────────────────────────────────────────── */

const QUIZ_QUESTIONS = [
  {
    question: 'You have a checker on the Bar. What must you do?',
    options: [
      'Move your other checkers until you roll a 6.',
      'Roll to re-enter that checker before doing anything else.',
      'Skip your turn automatically.',
    ],
    correct: 1,
  },
  {
    question: 'When are you allowed to start bearing off (taking checkers off the board)?',
    options: [
      'Anytime you roll a 6.',
      'Only when all 15 of your checkers are inside your Home Board.',
      'As soon as you pass the midpoint.',
    ],
    correct: 1,
  },
  {
    question: 'You roll double 4s. How do you move?',
    options: [
      'You move two checkers 4 spaces each.',
      'You play the number 4 four times (16 spaces total).',
      'You play the number 4 twice, then roll again.',
    ],
    correct: 1,
  },
];

const LETTERS = ['A', 'B', 'C'];

function QuizModule() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected]     = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [completed, setCompleted]   = useState(false);

  const q          = QUIZ_QUESTIONS[currentIdx];
  const isAnswered = selected !== null;
  const isCorrect  = selected === q.correct;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelected(idx);
  };

  const handleNext = () => {
    const newAnswers = [...userAnswers, selected];
    setUserAnswers(newAnswers);
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setUserAnswers([]);
    setCompleted(false);
  };

  /* ── Completed summary (compact) ─────────────────── */
  if (completed) {
    const score = userAnswers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length;
    const allCorrect = score === QUIZ_QUESTIONS.length;

    return (
      <div className="surface-tertiary" style={quizCard}>
        {/* Score header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexShrink: 0 }}>
          <div style={{
            fontFamily: fh, fontWeight: 900, fontSize: 52, lineHeight: 1,
            color: 'var(--color-heading)', flexShrink: 0,
          }}>
            {score}/{QUIZ_QUESTIONS.length}
          </div>
          <div style={{
            fontFamily: fs, fontWeight: 700, fontSize: 17, lineHeight: 1.25,
            color: allCorrect ? '#4caf50' : 'var(--color-body)',
          }}>
            {allCorrect ? 'Perfect score!' : score === 0 ? "Keep studying — you've got this!" : 'Good effort — review below.'}
          </div>
        </div>

        {/* Compact question breakdown */}
        <div style={{ flex: 1 }}>
          {QUIZ_QUESTIONS.map((qq, qi) => {
            const userAns    = userAnswers[qi];
            const wasCorrect = userAns === qq.correct;
            return (
              <div key={qi} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                paddingTop: 14, paddingBottom: 14,
                borderBottom: qi < QUIZ_QUESTIONS.length - 1
                  ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: wasCorrect ? '#4caf50' : '#ef5350',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontWeight: 700, marginTop: 2,
                }}>
                  {wasCorrect ? '✓' : '✗'}
                </div>
                <div style={{
                  flex: 1, fontFamily: fb, fontSize: 14, lineHeight: 1.5,
                  color: 'var(--color-body)',
                }}>
                  {qq.question}
                </div>
                <div style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center',
                  gap: 5, fontFamily: fp, fontSize: 13, fontWeight: 700,
                }}>
                  {wasCorrect ? (
                    <span style={{ color: '#4caf50' }}>{LETTERS[userAns]} ✓</span>
                  ) : (
                    <>
                      <span style={{ color: '#ef5350' }}>{LETTERS[userAns]} ✗</span>
                      <span style={{ color: 'var(--color-muted)' }}>→</span>
                      <span style={{ color: '#4caf50' }}>{LETTERS[qq.correct]} ✓</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Try again — pinned to bottom */}
        <button onClick={handleRestart} style={{ ...quizBtn, marginTop: 20 }}>
          Try Again
        </button>
      </div>
    );
  }

  /* ── Active question ─────────────────────────────── */
  return (
    <div className="surface-tertiary" style={quizCard}>
      {/* Progress bar */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span style={{ fontFamily: fm, fontSize: 12, color: 'var(--color-muted)' }}>
            {userAnswers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length} correct so far
          </span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(currentIdx / QUIZ_QUESTIONS.length) * 100}%`,
            background: 'var(--color-heading)',
            borderRadius: 2, transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        fontFamily: fs, fontWeight: 700, fontSize: 20, lineHeight: 1.4,
        color: 'var(--color-heading)', marginBottom: 20, flexShrink: 0,
      }}>
        {q.question}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
        {q.options.map((opt, oi) => {
          const isSelected   = selected === oi;
          const isCorrectOpt = oi === q.correct;

          let bg          = 'rgba(255,255,255,0.06)';
          let border      = '1px solid rgba(255,255,255,0.12)';
          let color       = 'var(--color-body)';
          let cursor      = 'pointer';
          let letterColor = 'var(--color-muted)';

          if (isAnswered) {
            cursor = 'default';
            if (isCorrectOpt) {
              bg = 'rgba(76,175,80,0.18)'; border = '2px solid rgba(76,175,80,0.65)';
              color = '#a5d6a7'; letterColor = '#4caf50';
            } else if (isSelected) {
              bg = 'rgba(244,67,54,0.15)'; border = '2px solid rgba(244,67,54,0.55)';
              color = '#ef9a9a'; letterColor = '#ef5350';
            } else {
              bg = 'rgba(255,255,255,0.03)';
              color = 'rgba(255,255,255,0.3)'; letterColor = 'rgba(255,255,255,0.2)';
            }
          } else if (isSelected) {
            bg = 'rgba(255,255,255,0.12)'; border = '1px solid rgba(255,255,255,0.3)';
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(oi)}
              style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '12px 16px', borderRadius: 8,
                background: bg, border, color,
                cursor, textAlign: 'left', width: '100%',
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <span style={{ flexShrink: 0, fontFamily: fp, fontWeight: 700, fontSize: 13, color: letterColor, minWidth: 20, marginTop: 1 }}>
                {LETTERS[oi]}
              </span>
              <span style={{ fontFamily: fb, fontSize: 'var(--size-body)', lineHeight: 1.5, fontWeight: isAnswered && isCorrectOpt ? 600 : 400 }}>
                {opt}
              </span>
              {isAnswered && isCorrectOpt && (
                <span style={{ marginLeft: 'auto', flexShrink: 0, color: '#4caf50', fontSize: 16, paddingLeft: 8 }}>✓</span>
              )}
              {isAnswered && isSelected && !isCorrect && (
                <span style={{ marginLeft: 'auto', flexShrink: 0, color: '#ef5350', fontSize: 16, paddingLeft: 8 }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback — appears between options and button */}
      <div style={{
        fontFamily: fb, fontSize: 14, lineHeight: 1.5, flexShrink: 0,
        color: isCorrect ? '#a5d6a7' : '#ef9a9a',
        marginTop: 16, padding: '10px 14px',
        background: isAnswered
          ? (isCorrect ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)')
          : 'transparent',
        borderRadius: 6,
        visibility: isAnswered ? 'visible' : 'hidden',
      }}>
        {isCorrect ? '✓ Correct!' : '✗ Not quite — the correct answer is highlighted above.'}
      </div>

      {/* Next button — always rendered, invisible until answered, keeps height stable */}
      <button
        onClick={isAnswered ? handleNext : undefined}
        style={{
          ...quizBtn,
          marginTop: 8, flexShrink: 0,
          opacity: isAnswered ? 1 : 0,
          pointerEvents: isAnswered ? 'auto' : 'none',
        }}
      >
        {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results →'}
      </button>
    </div>
  );
}

const quizCard = {
  borderRadius: 14,
  padding: '28px',
  width: '100%',
  boxSizing: 'border-box',
  height: 520,
  display: 'flex',
  flexDirection: 'column',
};

const quizBtn = {
  width: '100%',
  padding: '13px 20px',
  background: 'var(--color-heading)',
  border: 'none',
  borderRadius: 8,
  fontFamily: fp,
  fontWeight: 700,
  fontSize: 15,
  color: 'var(--color-bg)',
  cursor: 'pointer',
  letterSpacing: '0.03em',
};

/* ─── Table of Contents ──────────────────────────────────────── */

const TOC_ITEMS = [
  { id: 'section-layout',  label: 'Board Layout' },
  { id: 'section-setup',   label: 'How to Set Up' },
  { id: 'section-start',   label: 'Starting the Game' },
  { id: 'section-moving',  label: 'Moving Checkers' },
  { id: 'section-hitting', label: 'Hitting' },
  { id: 'section-bearing', label: 'Bearing Off' },
  { id: 'section-scoring', label: 'Scoring' },
  { id: 'section-quiz',    label: 'Test Yourself' },
];
const SECTION_IDS = TOC_ITEMS.map(t => t.id);

function TocItem({ label, sectionId, active = false }) {
  const handleClick = () => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      onClick={handleClick}
      style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
    >
      <div
        className={`ls-toc-pip${active ? ' ls-toc-pip-active' : ''}`}
        style={{ background: active ? 'var(--color-toc-pip-active)' : 'var(--color-toc-pip)' }}
      />
      <span
        className="ls-toc-label"
        style={{
          fontFamily: ft,
          fontWeight: active ? 700 : 400,
          fontSize: 'var(--size-small)',
          lineHeight: 1,
          color: 'var(--color-muted)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TableOfContents() {
  const tocRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [activeSection, setActiveSection] = useState(-1);

  useEffect(() => {
    if (!tocRef.current) return;
    const rect = tocRef.current.getBoundingClientRect();
    const initialTop = rect.top + window.scrollY;

    const handleScroll = () => {
      setIsFixed(window.scrollY > initialTop - 24);

      let next = -1;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.getBoundingClientRect().top < 80) { next = i; break; }
      }
      setActiveSection(next);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={tocRef}
      className="ls-toc"
      style={isFixed ? { position: 'fixed', top: 54 } : undefined}
    >
      {TOC_ITEMS.map((item, i) => (
        <TocItem
          key={item.id}
          label={item.label}
          sectionId={item.id}
          active={i === activeSection}
        />
      ))}
    </div>
  );
}

/* ─── Main template ───────────────────────────────────────────── */

export default function LearnSegmentTemplate() {
  return (
    <div style={{
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <header className="ls-header">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          fontFamily: fl,
          fontWeight: 700,
          color: 'var(--color-logo)',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          <span style={{ fontSize: 'var(--size-logo)' }}>Backgammon</span>
          <span style={{ fontSize: 18, opacity: 0.4 }}>.com</span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '2px solid var(--color-border-subtle)',
            flexShrink: 0, overflow: 'hidden', position: 'relative',
          }}>
            <img
              src={ASSETS.avatar}
              alt="Christopher"
              style={{
                position: 'absolute',
                width: '105.46%', height: '105.46%',
                left: '-2.73%', top: '6.2%',
                objectFit: 'cover',
              }}
            />
          </div>
          <span className="ls-username" style={{ fontFamily: fb, fontWeight: 700, fontSize: 14, color: 'var(--color-heading)' }}>
            Christopher
          </span>
        </div>
      </header>

      {/* ── HERO / INTRO ── */}
      <section className="ls-section">
        <div className="ls-content">

          <div className="ls-breadcrumb-row">
            <BreadcrumbPills course="Intro to Backgammon" lesson="Lesson 1" />
            <div className="ls-badge">
              <BadgeIcon />
              <div className="ls-badge-tooltip">Lesson 1 Badge — 1XP</div>
            </div>
          </div>

          <h1 className="ls-h1" style={{ fontFamily: fh, color: 'var(--color-heading)' }}>
            How to Play Backgammon
          </h1>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: fm, fontWeight: 400 }}>Reviewed by </span>
              <a href="#" style={{ fontFamily: fm, fontWeight: 600, color: 'var(--color-link)', textDecoration: 'none' }}>Masayuki "Mochy" Mochizuki</a>
            </div>
            <div style={{ background: 'var(--color-border-subtle)', height: 18, width: 1, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 4, fontFamily: fm, fontWeight: 600, fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              <span>4</span>
              <span>Minute Read</span>
            </div>
          </div>

          <HRule />

          <BodyText>
            <p style={{ margin: 0 }}>
              Backgammon is a race. The goal is to run your checkers around the track and off the board before your opponent does. You roll dice to move, and you hit your opponent to send them back to the start.
            </p>
          </BodyText>

        </div>
      </section>

      {/* ── ZIGZAG SEPARATOR ── */}
      <ZigzagSeparator />

      {/* ── CONTENT BODY ── */}
      <section className="ls-section surface-muted">
        <div className="ls-content ls-content-gap-lg">

          {/* 1. Board Layout */}
          <div id="section-layout" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>1. Board Layout</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                The board has 24 triangles called <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Points</strong>. The board is split into four quadrants.{' '}
                Your <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Home Board</strong> is where you finish.{' '}
                The <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Outer Board</strong> is the middle of the track.{' '}
                The <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Bar</strong> is the ridge down the center.
              </p>
            </BodyText>
          </div>

          <SectionBreak />

          {/* 2. How to Set Up */}
          <div id="section-setup" className="ls-image-row">
            <ImageWithCaption caption="Top-down diagram of a standard backgammon board setup. Checkers are highlighted in groups with labels: Runners, Mid-point, Builders, Defenders." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: '1 0 0', justifyContent: 'center' }}>
              <H2>2. How to Set Up</H2>
              <BodyText>
                <p style={{ margin: '0 0 16px 0' }}>You need to place your checkers in specific stacks:</p>
              </BodyText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CheckerStack
                  point="24-pt"
                  name="Runners (×2)"
                  description="Deep in enemy territory. They need to escape early."
                />
                <CheckerStack
                  point="13-pt"
                  name="Mid-point (×5)"
                  description="Your supply station. Bring these down safely to build your home board."
                />
                <CheckerStack
                  point="8-pt"
                  name="Builders (×3)"
                  description="Perfectly positioned to help you build the 5-point — the most important point in the game."
                />
                <CheckerStack
                  point="6-pt"
                  name="Defenders (×5)"
                  description="The foundation of your home board. Your opponent cannot land here."
                />
              </div>
            </div>
          </div>

          <SectionBreak />

          {/* 3. Starting the Game */}
          <div id="section-start" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>3. Starting the Game</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Each player rolls one die. The player with the higher number goes first, using{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>both dice</strong> as their opening move.
                If you roll the same number, re-roll until someone wins.
              </p>
            </BodyText>
          </div>

          <SectionBreak />

          {/* 4. Moving Checkers */}
          <div id="section-moving" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>4. Moving Checkers</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                You always move forward — counter-clockwise for one player, clockwise for the other. You form a "C" shape around the board toward your home.
              </p>
            </BodyText>
            <Callout>The Rules of the Road</Callout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BulletItem label="Open Points Only">
                You can land on a point if it is empty, has your own checkers, or has{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>only one</strong> opponent checker.
              </BulletItem>
              <BulletItem label="Blocked Points">
                If your opponent has{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>two or more</strong> checkers on a point, it is an{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Anchor</strong>. You cannot land there.
                This is how you control the game — building anchors stops your opponent from moving.
              </BulletItem>
              <BulletItem label="Doubles">
                If you roll doubles like 2-2, you play the number{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>four times</strong>.
                Doubles let you race ahead or build strong blocks quickly.
              </BulletItem>
            </div>
          </div>

          <SectionBreak />

          {/* 5. Hitting */}
          <div id="section-hitting" className="ls-image-row">
            <ImageWithCaption caption="A checker landing on a single opponent checker (Blot), with an arrow showing the opponent's checker moving to the Bar." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: '1 0 0' }}>
              <H2>5. Hitting</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  If your opponent leaves a single checker on a point, it is called a{' '}
                  <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Blot</strong>.
                  If you land on a Blot, you <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Hit</strong> it
                  and send it to the <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Bar</strong>.
                </p>
              </BodyText>
              <Callout>The Penalty</Callout>
              <BodyText>
                <p style={{ margin: 0 }}>
                  If you are on the Bar, you cannot move any other checkers. You must roll to re-enter your checker
                  into your opponent's home board. If you roll numbers for blocked points, you lose your turn.
                  Getting hit is a disaster — it forces you to restart that checker from the beginning.
                </p>
              </BodyText>
            </div>
          </div>

          <SectionBreak />

          {/* 6. Bearing Off */}
          <div id="section-bearing" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>6. Bearing Off</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                You can only start taking checkers off the board when{' '}
                <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>all 15</strong> of your checkers
                are inside your Home Board.
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BulletItem label="The Move">
                Roll a 6 and take a checker off the 6-point. Roll a 4 and take one off the 4-point.
              </BulletItem>
              <BulletItem label="The Strategy">
                If you get hit while bearing off, your checker goes to the Bar and has to travel the full track again.
                Don't leave single checkers exposed when you're close to winning.
              </BulletItem>
            </div>
          </div>

          <SectionBreak />

          {/* 7. Scoring */}
          <div id="section-scoring" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>7. Scoring</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                The first player to remove all their checkers wins. The score depends on how much you beat them:
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BulletItem label="Single (1 point)">
                You finish and your opponent has borne off at least one checker.
              </BulletItem>
              <BulletItem label="Gammon (2 points)">
                You finish and your opponent has not removed a single checker.
              </BulletItem>
              <BulletItem label="Backgammon (3 points)">
                You finish and your opponent still has a checker in your home board or on the Bar.
              </BulletItem>
            </div>
          </div>

          <SectionBreak />

          {/* Quiz */}
          <div id="section-quiz" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>Test What You've Learnt</H2>
            <QuizModule />
          </div>

          <div className="ls-nav-spacer" />

        </div>
      </section>

      {/* ── CTA END CAP ── */}
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
          <button style={{
            background: 'var(--color-heading)', border: 'none', borderRadius: 8,
            padding: '11px 28px', fontFamily: fp, fontWeight: 700, fontSize: 15,
            color: 'var(--color-bg)', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0,
          }}>
            Play Now
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <SiteFooter />

      {/* ── TABLE OF CONTENTS ── */}
      <TableOfContents />

      {/* ── MOBILE BOTTOM NAV ── */}
      <MobileNav />

    </div>
  );
}
