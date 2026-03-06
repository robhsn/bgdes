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
      {/* Outer hexagon — transparent, gradient shows through from ::before */}
      <path
        d="M0.694387 14.8938C-0.231462 16.5122 -0.231462 18.4951 0.694387 20.1062L7.70751 32.361C8.64065 33.994 10.383 35 12.2639 35H26.2318C28.1126 35 29.855 33.994 30.7881 32.361L37.8012 20.1062C38.7271 18.4878 38.7271 16.5049 37.8012 14.8938L30.7881 2.63903C29.855 1.00604 28.1126 0 26.2318 0H12.2639C10.383 0 8.64065 1.00604 7.70751 2.63903L0.694387 14.8938Z"
        fill="transparent"
      />
      {/* Inner hexagon fill */}
      <path
        d="M5.2824 15.538C4.58556 16.7561 4.58556 18.2485 5.2824 19.4611L10.5608 28.6847C11.2632 29.9138 12.5745 30.671 13.9902 30.671H24.5032C25.9188 30.671 27.2302 29.9138 27.9325 28.6847L33.211 19.4611C33.9078 18.243 33.9078 16.7506 33.211 15.538L27.9325 6.3144C27.2302 5.08532 25.9188 4.32812 24.5032 4.32812H13.9902C12.5745 4.32812 11.2632 5.08532 10.5608 6.3144L5.2824 15.538Z"
        fill="var(--color-badge-icon-inner)"
      />
      {/* Graduation cap icon */}
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
          background: 'var(--color-border)',
          borderLeft: '3px solid var(--color-border-subtle)',
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
            color: 'var(--color-muted)',
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
        opacity: 0.6,
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
      opacity: muted ? 0.6 : 1,
      width: '100%',
    }}>
      {children}
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

/* ─── Table of Contents ──────────────────────────────────────── */

const TOC_SECTIONS = [
  'The Goal of the Game',
  'How to Set Up the Board',
  'Rolling the Dice and Moving',
  'Hitting and Entering from the Bar',
  'Making Points and Building Walls',
  'Bearing Off: How to Finish the Game',
  'Scoring and Winning',
  'The Doubling Cube',
  'Money Play vs. Match Play',
  'Basic Strategy for Beginners',
  'Quick Answers',
];

/* TOC items — must match actual H2 sections in the page (id + label) */
const TOC_ITEMS = [
  { id: 'section-goal',    label: 'The Goal of the Game' },
  { id: 'section-setup',   label: 'How to Set Up the Board' },
  { id: 'section-rolling', label: 'Rolling the Dice and Moving' },
  { id: 'section-hitting', label: 'Hitting and Entering from the Bar' },
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

      /* Active section: last section whose top is above y=80 */
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
      style={isFixed ? { position: 'fixed', top: 24 } : undefined}
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
        {/* Logo */}
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

        {/* Profile */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '2px solid var(--color-border-subtle)',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <img
              src={ASSETS.avatar}
              alt="Christopher"
              style={{
                position: 'absolute',
                width: '105.46%',
                height: '105.46%',
                left: '-2.73%',
                top: '6.2%',
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

          {/* Breadcrumb pills + badge */}
          <div className="ls-breadcrumb-row">
            <BreadcrumbPills course="Intro to Backgammon" lesson="Lesson 1" />

            {/* Badge with tooltip */}
            <div className="ls-badge">
              <BadgeIcon />
              <div className="ls-badge-tooltip">Lesson 1 Badge — 1XP</div>
            </div>
          </div>

          {/* H1 */}
          <h1
            className="ls-h1"
            style={{
              fontFamily: fh,
              color: 'var(--color-heading)',
            }}
          >
            How to Play Backgammon
          </h1>

          {/* Meta: author + reading time */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: fm, fontWeight: 400, opacity: 0.6 }}>Reviewed by </span>
              <a href="#" style={{ fontFamily: fm, fontWeight: 600, color: 'var(--color-link)', textDecoration: 'none' }}>Masayuki "Mochy" Mochizuki</a>
            </div>
            <div style={{ background: 'var(--color-border-subtle)', height: 18, width: 1, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 4, fontFamily: fm, fontWeight: 600, fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              <span style={{ opacity: 0.6 }}>8</span>
              <span style={{ opacity: 0.6 }}>Minute Read</span>
            </div>
          </div>

          <HRule />

          {/* Intro paragraphs */}
          <BodyText>
            <p style={{ margin: 0 }}>
              Backgammon is a two-player race. You and your opponent each have 15 checkers, and the goal is to move them all around the board and off before the other player does. Dice determine how far you move, but strategy determines which checkers you move and when. That blend of luck and skill is what has kept people playing for five thousand years.
            </p>
            <p style={{ margin: '1em 0 0 0' }}>
              This guide covers everything you need to sit down and play a complete game. If you want more detail on any specific topic, links throughout will take you to dedicated guides.
            </p>
          </BodyText>

        </div>
      </section>

      {/* ── ZIGZAG SEPARATOR ── */}
      <ZigzagSeparator />

      {/* ── CONTENT BODY (gray) ── */}
      <section className="ls-section surface-muted">
        <div className="ls-content ls-content-gap-lg">

          {/* Section: The Goal of the Game */}
          <div id="section-goal" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <H2>The Goal of the Game</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Each player moves their 15 checkers around the board in a horseshoe-shaped path, from their opponent's side of the board toward their own home board. Once all 15 are in the home board, you start bearing off, removing checkers from the board entirely. The first player to bear off all 15 checkers wins.
              </p>
              <p style={{ margin: '1em 0 0 0' }}>
                You'll need a backgammon board, 15 checkers each (two different colours), two pairs of dice, dice cups, and a doubling cube, a special die used to raise the stakes during the game.
              </p>
              <p style={{ margin: '1em 0 0 0' }}>
                Backgammon is often described as a game of luck because dice are involved, but the luck evens out over time. The strategy (deciding which checkers to move, when to take risks, and when to play safe) is what separates strong players from beginners.
              </p>
            </BodyText>
          </div>

          <SectionBreak />

          {/* Section: How to Set Up the Board */}
          <div id="section-setup" className="ls-image-row">
            <ImageWithCaption caption="The complete starting position with all 30 checkers placed, points numbered, and arrows showing each player's direction of movement." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1 0 0', justifyContent: 'center' }}>
              <H2>How to Set Up the Board</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  The board has 24 triangles (called points), a centre divider called the bar, and four quadrants. Each player places 15 checkers in a specific pattern: 2 on the 24-point, 5 on the 13-point, 3 on the 8-point, and 5 on the 6-point.
                </p>
              </BodyText>
              <Callout>Full setup walkthrough with diagrams, see Board Setup Explained →</Callout>
            </div>
          </div>

          <SectionBreak />

          {/* Section: Rolling the Dice and Moving */}
          <div id="section-rolling" className="ls-image-row">
            <ImageWithCaption caption="Interactive: Roll the dice and tap to move checkers. Shows how a roll of 5-3 can be played as two separate moves or combined on one checker." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1 0 0' }}>
              <H2>Rolling the Dice and Moving</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  To decide who goes first, each player rolls one die. The player who rolls higher goes first, using both dice as their opening move. If both dice show the same number, roll again until they're different.
                </p>
                <p style={{ margin: '1em 0 0 0' }}>
                  On every turn after that, you roll both your dice and make two separate moves. For example, if you roll a 5 and a 3, you can move one checker 5 points forward and another checker 3 points forward. Or you can move a single checker 8 points, but only if the point it lands on after the first 5 (or 3) is also available to land on.
                </p>
              </BodyText>
            </div>
          </div>

          {/* Continuation — dice rules */}
          <BodyText>
            <p style={{ margin: 0 }}>
              A point is available if it's empty, has your own checkers on it, or has exactly one opponent checker on it (called a blot). You can't land on a point that has two or more of your opponent's checkers. That's a blocked point.
            </p>
            <p style={{ margin: '1em 0 0 0' }}>
              <strong style={{ fontFamily: fb, fontWeight: 700 }}>Rolling doubles</strong>{' '}is special: you get four moves instead of two. If you roll 4-4, you move four checkers 4 points each (or any legal combination, like moving one checker 16 points total if every intermediate landing point is open).
            </p>
            <p style={{ margin: '1em 0 0 0' }}>
              You must use both dice if you legally can. If only one die can be used, you must play the higher number. If neither die can be used, you forfeit your turn.
            </p>
          </BodyText>

          <SectionBreak />

          {/* Section: Hitting and Entering from the Bar */}
          <div id="section-hitting" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <H2>Hitting and Entering from the Bar</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                If you land on a point with exactly one opponent checker (a blot), you hit it. That checker gets placed on the bar in the centre of the board.
              </p>
              <p style={{ margin: '1em 0 0 0' }}>
                A player with a checker on the bar must bring it back into play before moving anything else. To re-enter, you roll your dice and place the checker on an open point in your opponent's home board that matches one of your dice numbers. If neither number corresponds to an open point, you lose your entire turn.
              </p>
              <p style={{ margin: '1em 0 0 0' }}>
                This is why getting hit can be so costly. Your checker has to travel the entire length of the board again, and you can't move anything else until it's back in.
              </p>
            </BodyText>
          </div>

          {/* Pushes content above fixed mobile nav */}
          <div className="ls-nav-spacer" />

        </div>
      </section>

      {/* ── TABLE OF CONTENTS ── */}
      <TableOfContents />

      {/* ── MOBILE BOTTOM NAV ── */}
      <MobileNav />

    </div>
  );
}
