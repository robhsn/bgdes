import React, { useState } from 'react';
import { SiteHeader, SiteFooter, PlayNowCta } from './SharedLayout';
import { useDMEState } from '../context/dme-states';
import wbfLogo from '../imgs/wbf-logo.png';

/* ── Load Caveat font for handwriting-style text ── */
(function () {
  const id = 'gf-caveat';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap';
    document.head.appendChild(link);
  }
})();

/* ─── Nav icons ─────────────────────────────────────────────── */

function IconTrophy() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M38.7574 10C40.8277 10 42.5152 11.7031 42.4371 13.7656C42.421 14.1837 42.4007 14.5951 42.3794 15H46.2496C48.2886 15.0001 50.0855 16.6876 49.9292 18.8906C49.3433 26.9921 45.2026 31.4453 40.7105 33.7734C39.4783 34.4129 38.2223 34.8879 37.0289 35.2393C37.6556 34.3501 38.2697 33.2995 38.8472 32.0537C38.2673 33.3027 37.6495 34.354 37.023 35.2412C37.025 35.2406 37.0269 35.2398 37.0289 35.2393C37.0265 35.2426 37.0253 35.2467 37.023 35.25V35.2422C35.4467 37.4742 33.8063 38.6603 32.5074 39.2891V45H37.5074C38.8902 45 40.0074 46.1172 40.0074 47.5C40.0074 48.8828 38.8902 50 37.5074 50H22.5074C21.1246 50 20.0074 48.8828 20.0074 47.5C20.0074 46.1172 21.1246 45 22.5074 45H27.5074V39.2891C26.2415 38.6778 24.6534 37.5409 23.1167 35.4277C23.1379 35.457 23.1581 35.4868 23.1792 35.5156C21.7418 35.1406 20.1792 34.5703 18.648 33.7109C14.4214 31.3438 10.6089 26.8828 10.0621 18.875L10.0699 18.8828C9.92144 16.6875 11.7105 15 13.7574 15H17.6324C17.6365 15.0768 17.6418 15.1532 17.646 15.2295C17.6199 14.7508 17.5965 14.263 17.5777 13.7656C17.4917 11.7031 19.1871 10 21.2574 10H38.7574ZM17.7183 16.3936C17.7742 17.2079 17.8385 17.9935 17.9136 18.75H13.8199C14.3041 25.3656 17.3421 28.6774 20.4742 30.4355C19.1756 27.0748 18.1423 22.5327 17.7183 16.3936ZM42.0943 18.75C41.6101 23.5096 40.7362 27.2029 39.6714 30.0693C42.8353 28.2099 45.6949 24.9059 46.1792 18.7578L42.0943 18.75Z" fill="currentColor"/>
    </svg>
  );
}

function IconLearning() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M42.5 50H20C15.8594 50 12.5 46.6406 12.5 42.5V17.5C12.5 13.3594 15.8594 10 20 10H43.75C45.8203 10 47.5 11.6797 47.5 13.75V36.25C47.5 37.8828 46.4531 39.2734 45 39.7891V45C46.3828 45 47.5 46.1172 47.5 47.5C47.5 48.8828 46.3828 50 45 50H42.5ZM20 40C18.6172 40 17.5 41.1172 17.5 42.5C17.5 43.8828 18.6172 45 20 45H40V40H20ZM22.5 21.875C22.5 22.9141 23.3359 23.75 24.375 23.75H38.125C39.1641 23.75 40 22.9141 40 21.875C40 20.8359 39.1641 20 38.125 20H24.375C23.3359 20 22.5 20.8359 22.5 21.875ZM24.375 27.5C23.3359 27.5 22.5 28.3359 22.5 29.375C22.5 30.4141 23.3359 31.25 24.375 31.25H38.125C39.1641 31.25 40 30.4141 40 29.375C40 28.3359 39.1641 27.5 38.125 27.5H24.375Z" fill="currentColor"/>
    </svg>
  );
}

function IconNewGame() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 12.2321C28.6052 12.1702 27.1759 12.5529 25.9893 13.319C23.8809 14.6445 22.6251 17.1787 22.834 19.5778C22.875 20.129 22.9835 20.672 23.1562 21.1872C23.2586 21.4926 23.3834 21.7888 23.5283 22.0719C23.4456 21.7649 23.3837 21.4547 23.3418 21.1442C23.271 20.6202 23.2577 20.0939 23.2988 19.5778C23.4665 17.3335 24.7174 15.315 26.5293 14.1608C27.5573 13.4993 28.7591 13.1144 30 13.0583C31.4401 12.9878 32.9247 13.3672 34.2041 14.1842C34.4685 14.3525 34.7243 14.5395 34.9688 14.7428C34.772 14.4929 34.5546 14.2557 34.3203 14.0348C33.1907 12.9612 31.6226 12.2925 30 12.2321Z" fill="currentColor"/>
      <path d="M30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
    </svg>
  );
}

function IconFriends() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M11.9355 19.0323C11.9355 17.8461 12.1691 16.6716 12.623 15.5758C13.0769 14.4799 13.7422 13.4842 14.5809 12.6455C15.4197 11.8068 16.4154 11.1415 17.5112 10.6875C18.6071 10.2336 19.7816 10 20.9677 10C22.1539 10 23.3284 10.2336 24.4242 10.6875C25.5201 11.1415 26.5158 11.8068 27.3545 12.6455C28.1932 13.4842 28.8585 14.4799 29.3124 15.5758C29.7664 16.6716 30 17.8461 30 19.0323C30 20.2184 29.7664 21.3929 29.3124 22.4888C28.8585 23.5846 28.1932 24.5803 27.3545 25.419C26.5158 26.2578 25.5201 26.9231 24.4242 27.377C23.3284 27.8309 22.1539 28.0645 20.9677 28.0645C19.7816 28.0645 18.6071 27.8309 17.5112 27.377C16.4154 26.9231 15.4197 26.2578 14.5809 25.419C13.7422 24.5803 13.0769 23.5846 12.623 22.4888C12.1691 21.3929 11.9355 20.2184 11.9355 19.0323ZM6.77417 46.129C6.77417 38.2903 13.129 31.9355 20.9677 31.9355C28.8064 31.9355 35.1613 38.2903 35.1613 46.129V46.6129C35.1613 48.4839 33.6451 50 31.7742 50H10.1613C8.2903 50 6.77417 48.4839 6.77417 46.6129V46.129ZM41.6129 13.871C43.6662 13.871 45.6354 14.6866 47.0873 16.1385C48.5392 17.5904 49.3548 19.5596 49.3548 21.6129C49.3548 23.6662 48.5392 25.6354 47.0873 27.0873C45.6354 28.5392 43.6662 29.3548 41.6129 29.3548C39.5596 29.3548 37.5904 28.5392 36.1385 27.0873C34.6866 25.6354 33.8709 23.6662 33.8709 21.6129C33.8709 19.5596 34.6866 17.5904 36.1385 16.1385C37.5904 14.6866 39.5596 13.871 41.6129 13.871ZM41.6129 33.2258C48.0242 33.2258 53.2258 38.4274 53.2258 44.8387V46.6452C53.2258 48.5 51.7258 50 49.8709 50H38.1935C38.7258 48.9919 39.0322 47.8387 39.0322 46.6129V46.129C39.0322 41.9758 37.629 38.1532 35.2822 35.1048C37.1048 33.9194 39.2822 33.2258 41.6129 33.2258Z" fill="currentColor"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Challenges', Icon: IconTrophy,   active: false },
  { label: 'Learning',   Icon: IconLearning,  active: true  },
  { label: 'New Game',    Icon: IconNewGame,   active: false },
  { label: 'Friends',    Icon: IconFriends,   active: false },
  { label: 'Profile',    Icon: IconProfile,   active: false },
];

function MobileNav({ onNavigate, currentPageId }) {
  const isProfileActive = currentPageId === 'profile';
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(({ label, Icon, active }) => {
        const isActive = label === 'Profile' ? isProfileActive : (label === 'Learning' && !isProfileActive ? active : false);
        return (
          <button
            key={label}
            className={`mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`}
            onClick={label === 'Profile' ? () => onNavigate?.('profile') : undefined}
          >
            <Icon />
            <span className="mobile-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── ZigzagSeparator ─────────────────────────────────────────── */

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

/* ─── HRule ───────────────────────────────────────────────────── */

function HRule() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border)', flexShrink: 0 }} />;
}

/* ─── Progress Dots ───────────────────────────────────────────── */

function ProgressDots({ total = 5, filled = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 13, height: 13, borderRadius: '50%',
          background: i < filled ? 'var(--color-heading)' : (i === filled && filled > 0) ? 'var(--color-dot-active)' : 'transparent',
          border: `2px solid ${i < filled ? 'var(--color-heading)' : (i === filled && filled > 0) ? 'var(--color-dot-active)' : 'var(--color-border-subtle)'}`,
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

/* ─── Plus/Minus toggle icon ─────────────────────────────────── */

function IconPlusMinus({ open }) {
  return (
    <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }} aria-hidden>
      <div style={{
        position: 'absolute', top: '50%', left: 0,
        width: 30, height: 3,
        background: 'var(--color-border-subtle)',
        transform: 'translateY(-50%)',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        width: 3, height: 30,
        background: 'var(--color-border-subtle)',
        transform: 'translateX(-50%)',
        opacity: open ? 0 : 1,
        transition: 'opacity 0.2s ease',
      }} />
    </div>
  );
}

/* ─── Chevron right ───────────────────────────────────────────── */

function IconChevronRight() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
      <path d="M1.5 1.5L8.5 8L1.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Check icon ──────────────────────────────────────────────── */

function IconCheck() {
  return (
    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
      <path d="M1 3.5L4 6.5L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Lesson row ──────────────────────────────────────────────── */

function LessonRow({ number, title, duration, description, completed = false, upNext = false }) {
  return (
    <div className="lesson-row">
      <div className="lesson-row__info">
        <div className="lesson-row__title-row">
          <span className="lesson-row__number">{number}.</span>
          <span className="lesson-row__title">{title}</span>
        </div>
        <p className="lesson-row__desc">{description}</p>
      </div>
      <div className="lesson-row__tags">
        {completed && (
          <div className="status-tag status-tag--completed">
            <IconCheck />
            <span>Completed</span>
          </div>
        )}
        {upNext && (
          <div className="status-tag status-tag--continue">
            <span>Continue</span>
          </div>
        )}
        <div className="lesson-row__chevron">
          <IconChevronRight />
        </div>
      </div>
    </div>
  );
}

/* ─── Course accordion ────────────────────────────────────────── */

function CourseAccordion({ title, description, progressFilled = 0, progressTotal = 5, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="course">
      <button className="course__header" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <div className="course__header-left">
          <ProgressDots total={progressTotal} filled={progressFilled} />
          <span className="course__title">{title}</span>
        </div>
        <p className="course__desc">{description}</p>
        <div className="course__toggle"><IconPlusMinus open={open} /></div>
      </button>
      <div className="course__divider" />
      {open && children && (
        <div className="course__lessons">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function LearnHubPage({ onNavigate }) {
  const loggedIn = useDMEState('auth.loggedIn', true);
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <SiteHeader onLogoClick={() => onNavigate?.('learn-hub')} onNavigate={onNavigate} />

      {/* ── Hero section ── */}
      <section className="section learn-hero">
        <div className="learn-hero__content">

          {/* Title + Stats */}
          <div className="learn-hero__title-stats">
            <h1 className="article-heading--h1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-heading)' }}>
              <span>Learn </span>
              <span className="learn-hero__title--light">&amp;</span>
              <span> Master</span>
              <br />
              <span>Backgammon</span>
            </h1>
          </div>

          {/* Body */}
          <p className="learn-hero__body">
            From your first game to advanced strategy. 15 structured guides that take you from complete beginner to confident, competitive player.
          </p>

          {/* CTA row */}
          <div className="learn-hero__cta-row">
            <div className="learn-hero__cta-buttons">
              <button className="com-btn com-btn--primary com-btn--lg" onClick={() => onNavigate?.('learn-article')}>
                {loggedIn ? 'Continue: Lesson 2' : 'Start Your First Lesson'}
                <svg width="11" height="15" viewBox="0 0 11 15" fill="currentColor" aria-hidden>
                  <path d="M1.5 1.5L9.5 7.5L1.5 13.5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="learn-hero__sanctioned" style={{ display: 'none' }}>
              <p className="learn-hero__sanctioned-text">
                Officially Sanctioned by<br />
                The World Backgammon Federation
              </p>
              {/* WBF badge — visible when Figma plugin is running */}
              <div className="learn-hero__sanctioned-badge">
                <img
                  src={wbfLogo}
                  alt="World Backgammon Federation"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Lessons section ── */}
      <section className="section surface-muted">
        <div className="course-section">

          {/* Section intro */}
          <div className="course-section__intro">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 className="course-section__title">
                Lessons to take you<br />
                from Beginner to Pro
              </h2>
              <p className="course-section__body">
                Designed by Backgammon Grandmasters for Beginners and Intermediate players alike
              </p>
            </div>
          </div>

          {/* Course list */}
          <div className="course-list">

            <CourseAccordion
              title="Intro to Backgammon"
              description="For absolute beginners, this course will teach you the fundamentals"
              progressFilled={1}
              progressTotal={5}
              defaultOpen={true}
            >
              <LessonRow
                number={1}
                title="How to Play Backgammon"
                duration={8}
                description="Goals, dice rules, hitting, bearing off, scoring — the complete beginner walkthrough."
                completed={true}
              />
              <LessonRow
                number={2}
                title="Board Setup Explained"
                duration={16}
                description="Goals, dice rules, hitting, bearing off, scoring — the complete beginner walkthrough."
                upNext={true}
              />
              <LessonRow
                number={3}
                title="Moving &amp; Hitting"
                duration={13}
                description="Goals, dice rules, hitting, bearing off, scoring — the complete beginner walkthrough."
              />
              <LessonRow
                number={4}
                title="Bearing Off"
                duration={4}
                description="Goals, dice rules, hitting, bearing off, scoring — the complete beginner walkthrough."
              />
              <LessonRow
                number={5}
                title="Scoring &amp; Doubling Cube"
                duration={5}
                description="Goals, dice rules, hitting, bearing off, scoring — the complete beginner walkthrough."
              />
            </CourseAccordion>

            <CourseAccordion
              title="Beginner Strategy"
              description="Build on the basics with opening moves, racing concepts, and early-game tactics"
              progressFilled={0}
              progressTotal={5}
            >
              <LessonRow
                number={1}
                title="Opening Moves &amp; Priorities"
                duration={10}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt."
              />
              <LessonRow
                number={2}
                title="Building a Blockade"
                duration={12}
                description="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip."
              />
              <LessonRow
                number={3}
                title="The Running Game"
                duration={9}
                description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat."
              />
              <LessonRow
                number={4}
                title="Safe vs. Bold Play"
                duration={11}
                description="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit."
              />
              <LessonRow
                number={5}
                title="When to Double"
                duration={7}
                description="Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia."
              />
            </CourseAccordion>

            <CourseAccordion
              title="Intermediate Strategy"
              description="Sharpen your game with positional play, anchor strategy, and pip-count techniques"
              progressFilled={0}
              progressTotal={5}
            >
              <LessonRow
                number={1}
                title="Positional vs. Racing Play"
                duration={14}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel urna vitae nisi."
              />
              <LessonRow
                number={2}
                title="Anchor Strategy"
                duration={11}
                description="Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis."
              />
              <LessonRow
                number={3}
                title="Pip Count &amp; Probability"
                duration={15}
                description="Curabitur pretium tincidunt lacus nulla gravida orci a odio. Nullam varius dolor."
              />
              <LessonRow
                number={4}
                title="Back Game Fundamentals"
                duration={13}
                description="Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh ut fermentum."
              />
              <LessonRow
                number={5}
                title="Doubling Cube Tactics"
                duration={10}
                description="Maecenas sed diam eget risus varius blandit sit amet non magna donec id elit non mi."
              />
            </CourseAccordion>

          </div>
        </div>
      </section>

      <PlayNowCta />
      <SiteFooter />

      <MobileNav onNavigate={onNavigate} currentPageId="learn-hub" />
      <div className="mobile-nav__spacer" />

    </div>
  );
}
