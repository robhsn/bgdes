import React, { useRef, useState, useEffect } from 'react';
import './LearnSegmentTemplate.css';

const ASSETS = {
  avatar:   'https://www.figma.com/api/mcp/asset/315f92a3-1e58-4c81-9676-58ec670c08c0',
  badges:   'https://www.figma.com/api/mcp/asset/e2cfc9a8-319f-4e73-939a-75c2efdd310f',
  polygon3: 'https://www.figma.com/api/mcp/asset/6c8491e0-c2af-47a8-a6a5-827cefcf0c05',
};

/* Token shorthand helpers — all resolve via CSS custom properties */
const fh = 'var(--font-heading)';    /* H1                */
const fs = 'var(--font-subheading)'; /* H2                */
const fb = 'var(--font-body)';       /* body paragraphs   */
const fl = 'var(--font-logo)';       /* site logo         */
const fp = 'var(--font-pill)';       /* breadcrumb pills  */
const ft = 'var(--font-toc)';        /* TOC labels        */
const fm = 'var(--font-meta)';       /* meta / reviewer   */

/* ─── Sub-components ─────────────────────────────────────────── */

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
            fontWeight: 400,
            fontSize: 'var(--size-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-body)',
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
      fontWeight: 400,
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
      background: 'var(--color-bg-gray)',
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

/* IDs of sections that have real content — used for scroll detection */
const SECTION_IDS = [
  'section-goal',
  'section-setup',
  'section-rolling',
  'section-hitting',
];

function TocItem({ label, active = false }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
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
          opacity: 0.6,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TocDivider() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border-mid)', flexShrink: 0 }} />;
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
      <TocItem label="How to Play Backgammon" />
      <TocDivider />
      {TOC_SECTIONS.map((s, i) => (
        <TocItem key={s} label={s} active={i === activeSection} />
      ))}
      <TocDivider />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <div className="ls-toc-pip" style={{ background: 'var(--color-toc-pip)' }} />
        <span
          className="ls-toc-label"
          style={{
            fontFamily: ft,
            fontWeight: 400,
            fontSize: 'var(--size-small)',
            lineHeight: 1,
            color: 'var(--color-muted)',
            opacity: 0.6,
          }}
        >
          Test Your Knowledge
        </span>
        <img
          src={ASSETS.polygon3}
          alt=""
          className="ls-toc-label"
          style={{ height: 6.64, width: 3.652, flexShrink: 0 }}
        />
      </div>
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
    }}>

      {/* ── HEADER ── */}
      <header className="ls-header">
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          fontFamily: fl,
          fontWeight: 700,
          color: 'var(--color-heading)',
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
          <span style={{ fontFamily: fb, fontWeight: 700, fontSize: 14, color: 'var(--color-heading)' }}>
            Christopher
          </span>
        </div>
      </header>

      {/* ── HERO / INTRO ── */}
      <section className="ls-section">
        <div className="ls-content">

          {/* Breadcrumb pills + badge */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <BreadcrumbPills course="Intro to Backgammon" lesson="Lesson 1" />

            {/* Badge with tooltip */}
            <div className="ls-badge">
              <img
                src={ASSETS.badges}
                alt="Lesson 1 Badge"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
              />
              <div className="ls-badge-tooltip">Lesson 1 Badge — 1XP</div>
            </div>
          </div>

          {/* H1 */}
          <h1
            className="ls-h1"
            style={{
              fontFamily: fh,
              fontWeight: 700,
              color: 'var(--color-heading)',
            }}
          >
            How to Play Backgammon
          </h1>

          {/* Meta: author + reading time */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4, fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: fm, fontWeight: 400, opacity: 0.6 }}>Reviewed by </span>
              <span style={{ fontFamily: fm, fontWeight: 600, opacity: 0.6 }}>Masayuki "Mochy" Mochizuki</span>
            </div>
            <div style={{ background: 'var(--color-border-subtle)', height: 18, width: 1, flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 4, fontFamily: fm, fontWeight: 600, fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
              <span style={{ opacity: 0.6 }}>8</span>
              <span style={{ opacity: 0.6 }}>Minute Read</span>
            </div>
          </div>

          <HRule />

          {/* Intro paragraphs */}
          <BodyText muted>
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
      <section className="ls-section ls-section-gray">
        <div className="ls-content ls-content-gap-lg">

          {/* Section: The Goal of the Game */}
          <div id="section-goal" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
            <H2>The Goal of the Game</H2>
            <BodyText muted>
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
              <BodyText muted>
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

        </div>
      </section>

      {/* ── TABLE OF CONTENTS ── */}
      <TableOfContents />

    </div>
  );
}
