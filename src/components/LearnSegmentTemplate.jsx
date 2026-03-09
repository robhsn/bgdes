import React, { useRef, useState, useLayoutEffect } from 'react';
import './LearnSegmentTemplate.css';
import { SiteHeader, SiteFooter, PlayNowCta } from './SharedLayout';
import { useDMEState } from '../context/dme-states';
import boardSample from '../imgs/board-sample.png';

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
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M38.7574 10C40.8277 10 42.5152 11.7031 42.4371 13.7656C42.421 14.1837 42.4007 14.5951 42.3794 15H46.2496C48.2886 15.0001 50.0855 16.6876 49.9292 18.8906C49.3433 26.9921 45.2026 31.4453 40.7105 33.7734C39.4783 34.4129 38.2223 34.8879 37.0289 35.2393C37.6556 34.3501 38.2697 33.2995 38.8472 32.0537C38.2673 33.3027 37.6495 34.354 37.023 35.2412C37.025 35.2406 37.0269 35.2398 37.0289 35.2393C37.0265 35.2426 37.0253 35.2467 37.023 35.25V35.2422C35.4467 37.4742 33.8063 38.6603 32.5074 39.2891V45H37.5074C38.8902 45 40.0074 46.1172 40.0074 47.5C40.0074 48.8828 38.8902 50 37.5074 50H22.5074C21.1246 50 20.0074 48.8828 20.0074 47.5C20.0074 46.1172 21.1246 45 22.5074 45H27.5074V39.2891C26.2415 38.6778 24.6534 37.5409 23.1167 35.4277C23.1379 35.457 23.1581 35.4868 23.1792 35.5156C21.7418 35.1406 20.1792 34.5703 18.648 33.7109C14.4214 31.3438 10.6089 26.8828 10.0621 18.875L10.0699 18.8828C9.92144 16.6875 11.7105 15 13.7574 15H17.6324C17.6365 15.0768 17.6418 15.1532 17.646 15.2295C17.6199 14.7508 17.5965 14.263 17.5777 13.7656C17.4917 11.7031 19.1871 10 21.2574 10H38.7574ZM17.7183 16.3936C17.7742 17.2079 17.8385 17.9935 17.9136 18.75H13.8199C14.3041 25.3656 17.3421 28.6774 20.4742 30.4355C19.1756 27.0748 18.1423 22.5327 17.7183 16.3936ZM42.0943 18.75C41.6101 23.5096 40.7362 27.2029 39.6714 30.0693C42.8353 28.2099 45.6949 24.9059 46.1792 18.7578L42.0943 18.75Z" fill="currentColor"/>
    </svg>
  );
}

function IconLearning() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42.5 50H20C15.8594 50 12.5 46.6406 12.5 42.5V17.5C12.5 13.3594 15.8594 10 20 10H43.75C45.8203 10 47.5 11.6797 47.5 13.75V36.25C47.5 37.8828 46.4531 39.2734 45 39.7891V45C46.3828 45 47.5 46.1172 47.5 47.5C47.5 48.8828 46.3828 50 45 50H42.5ZM20 40C18.6172 40 17.5 41.1172 17.5 42.5C17.5 43.8828 18.6172 45 20 45H40V40H20ZM22.5 21.875C22.5 22.9141 23.3359 23.75 24.375 23.75H38.125C39.1641 23.75 40 22.9141 40 21.875C40 20.8359 39.1641 20 38.125 20H24.375C23.3359 20 22.5 20.8359 22.5 21.875ZM24.375 27.5C23.3359 27.5 22.5 28.3359 22.5 29.375C22.5 30.4141 23.3359 31.25 24.375 31.25H38.125C39.1641 31.25 40 30.4141 40 29.375C40 28.3359 39.1641 27.5 38.125 27.5H24.375Z" fill="currentColor"/>
    </svg>
  );
}

function IconNewGame() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 12.2321C28.6052 12.1702 27.1759 12.5529 25.9893 13.319C23.8809 14.6445 22.6251 17.1787 22.834 19.5778C22.875 20.129 22.9835 20.672 23.1562 21.1872C23.2586 21.4926 23.3834 21.7888 23.5283 22.0719C23.4456 21.7649 23.3837 21.4547 23.3418 21.1442C23.271 20.6202 23.2577 20.0939 23.2988 19.5778C23.4665 17.3335 24.7174 15.315 26.5293 14.1608C27.5573 13.4993 28.7591 13.1144 30 13.0583C31.4401 12.9878 32.9247 13.3672 34.2041 14.1842C34.4685 14.3525 34.7243 14.5395 34.9688 14.7428C34.772 14.4929 34.5546 14.2557 34.3203 14.0348C33.1907 12.9612 31.6226 12.2925 30 12.2321Z" fill="currentColor"/>
      <path d="M30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
    </svg>
  );
}

function IconFriends() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.9355 19.0323C11.9355 17.8461 12.1691 16.6716 12.623 15.5758C13.0769 14.4799 13.7422 13.4842 14.5809 12.6455C15.4197 11.8068 16.4154 11.1415 17.5112 10.6875C18.6071 10.2336 19.7816 10 20.9677 10C22.1539 10 23.3284 10.2336 24.4242 10.6875C25.5201 11.1415 26.5158 11.8068 27.3545 12.6455C28.1932 13.4842 28.8585 14.4799 29.3124 15.5758C29.7664 16.6716 30 17.8461 30 19.0323C30 20.2184 29.7664 21.3929 29.3124 22.4888C28.8585 23.5846 28.1932 24.5803 27.3545 25.419C26.5158 26.2578 25.5201 26.9231 24.4242 27.377C23.3284 27.8309 22.1539 28.0645 20.9677 28.0645C19.7816 28.0645 18.6071 27.8309 17.5112 27.377C16.4154 26.9231 15.4197 26.2578 14.5809 25.419C13.7422 24.5803 13.0769 23.5846 12.623 22.4888C12.1691 21.3929 11.9355 20.2184 11.9355 19.0323ZM6.77417 46.129C6.77417 38.2903 13.129 31.9355 20.9677 31.9355C28.8064 31.9355 35.1613 38.2903 35.1613 46.129V46.6129C35.1613 48.4839 33.6451 50 31.7742 50H10.1613C8.2903 50 6.77417 48.4839 6.77417 46.6129V46.129ZM41.6129 13.871C43.6662 13.871 45.6354 14.6866 47.0873 16.1385C48.5392 17.5904 49.3548 19.5596 49.3548 21.6129C49.3548 23.6662 48.5392 25.6354 47.0873 27.0873C45.6354 28.5392 43.6662 29.3548 41.6129 29.3548C39.5596 29.3548 37.5904 28.5392 36.1385 27.0873C34.6866 25.6354 33.8709 23.6662 33.8709 21.6129C33.8709 19.5596 34.6866 17.5904 36.1385 16.1385C37.5904 14.6866 39.5596 13.871 41.6129 13.871ZM41.6129 33.2258C48.0242 33.2258 53.2258 38.4274 53.2258 44.8387V46.6452C53.2258 48.5 51.7258 50 49.8709 50H38.1935C38.7258 48.9919 39.0322 47.8387 39.0322 46.6129V46.129C39.0322 41.9758 37.629 38.1532 35.2822 35.1048C37.1048 33.9194 39.2822 33.2258 41.6129 33.2258Z" fill="currentColor"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
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

function MobileNav({ onNavigate, currentPageId }) {
  const isProfileActive = currentPageId === 'profile';
  return (
    <nav className="ls-mobile-nav">
      {NAV_ITEMS.map(({ label, Icon, active }) => {
        const isActive = label === 'Profile' ? isProfileActive : (label === 'Learning' && !isProfileActive ? active : false);
        return (
          <button
            key={label}
            className={`ls-nav-item${isActive ? ' ls-nav-item-active' : ''}`}
            onClick={label === 'Profile' ? () => onNavigate?.('profile') : undefined}
          >
            <Icon />
            <span className="ls-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

/** Outlined badge — stroke only, single color, for unearned state */
function BadgeIconOutline() {
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
        stroke="var(--color-badge-unearned-stroke)" strokeWidth="0.8" fill="none"
      />
      <path
        d="M5.2824 15.538C4.58556 16.7561 4.58556 18.2485 5.2824 19.4611L10.5608 28.6847C11.2632 29.9138 12.5745 30.671 13.9902 30.671H24.5032C25.9188 30.671 27.2302 29.9138 27.9325 28.6847L33.211 19.4611C33.9078 18.243 33.9078 16.7506 33.211 15.538L27.9325 6.3144C27.2302 5.08532 25.9188 4.32812 24.5032 4.32812H13.9902C12.5745 4.32812 11.2632 5.08532 10.5608 6.3144L5.2824 15.538Z"
        stroke="var(--color-badge-unearned-stroke)" strokeWidth="0.8" fill="none"
      />
      <path
        d="M12.1113 15.1754L18.6488 17.866C18.9551 17.991 19.2801 18.0566 19.6113 18.0566C19.9426 18.0566 20.2676 17.991 20.5738 17.866L28.1488 14.7473C28.4301 14.6316 28.6113 14.3598 28.6113 14.0566C28.6113 13.7535 28.4301 13.4816 28.1488 13.366L20.5738 10.2473C20.2676 10.1223 19.9426 10.0566 19.6113 10.0566C19.2801 10.0566 18.9551 10.1223 18.6488 10.2473L11.0738 13.366C10.7926 13.4816 10.6113 13.7535 10.6113 14.0566V23.3066C10.6113 23.7223 10.9457 24.0566 11.3613 24.0566C11.777 24.0566 12.1113 23.7223 12.1113 23.3066V15.1754ZM13.6113 17.416V21.0566C13.6113 22.7129 16.2988 24.0566 19.6113 24.0566C22.9238 24.0566 25.6113 22.7129 25.6113 21.0566V17.4129L21.1457 19.2535C20.6582 19.4535 20.1395 19.5566 19.6113 19.5566C19.0832 19.5566 18.5645 19.4535 18.077 19.2535L13.6113 17.4129V17.416Z"
        stroke="var(--color-badge-unearned-stroke)" strokeWidth="0.8" fill="none"
      />
    </svg>
  );
}

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
      <img src={boardSample} alt="Backgammon board" className="ls-image-placeholder" />
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

/* ─── Glossary ───────────────────────────────────────────────── */

const GLOSSARY = {
  'Points':      'The 24 triangular spaces on the board, numbered 1–24 from each player\'s home board.',
  'Home Board':  'Your final quadrant — points 1 to 6. All 15 checkers must be here before you can start bearing off.',
  'Outer Board': 'The two middle quadrants between the home boards. Much of the early racing and blocking happens here.',
  'Bar':         'The raised ridge down the centre of the board. Hit checkers sit here and must re-enter before any other move.',
  'Blot':        'A single lone checker on a point — unprotected and vulnerable to being hit.',
  'Hit':         'Landing on an opponent\'s blot, sending their checker to the Bar.',
  'Anchor':      'Two or more of your checkers on the same point. Opponents cannot land here — a defensive stronghold.',
  'Gammon':      'Winning while the opponent hasn\'t borne off a single checker. Worth 2 points.',
  'Backgammon':  'The ultimate win — opponent still has a checker on the Bar or in your home board when you finish. Worth 3 points.',
};

function GlossaryTerm({ term }) {
  const [show, setShow] = useState(false);
  const def = GLOSSARY[term];

  if (!def) {
    return <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{term}</strong>;
  }

  return (
    <span style={{ position: 'relative', display: 'inline' }}>
      <strong
        style={{ fontWeight: 700, color: 'var(--color-heading)', borderBottom: '1px dashed var(--color-glossary-underline)', cursor: 'help' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {term}
      </strong>
      {show && (
        <span style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 220,
          background: 'var(--color-heading)',
          color: 'var(--color-bg)',
          fontFamily: fb,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.5,
          padding: '8px 12px',
          borderRadius: 6,
          whiteSpace: 'normal',
          textAlign: 'left',
          zIndex: 200,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {def}
        </span>
      )}
    </span>
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
  const loggedIn = useDMEState('auth.loggedIn', true);
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
    const earned = allCorrect && loggedIn;

    return (
      <div key="quiz-results" className="surface-tertiary" style={{ ...quizCard, paddingTop: 14 }}>
        {/* Score header + badge row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {earned ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
                <span style={{
                  fontFamily: fb, fontSize: 13, fontWeight: 700, color: 'var(--color-heading)',
                  textDecoration: 'underline dotted', textDecorationColor: 'var(--color-muted)', textUnderlineOffset: 3,
                }}>
                  How to Play
                </span>
                <span style={{ fontFamily: fb, fontSize: 13, fontWeight: 400, color: 'var(--color-heading)', marginTop: 2 }}>
                  badge awarded!
                </span>
              </div>
            ) : allCorrect && !loggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="var(--color-badge-unearned-stroke)" strokeWidth="2" fill="none" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="var(--color-badge-unearned-stroke)" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ fontFamily: fb, fontSize: 13, fontWeight: 400, color: 'var(--color-badge-unearned-text)', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: 'var(--color-heading)', cursor: 'pointer' }}>Log in</strong>
                  {' or '}
                  <strong style={{ color: 'var(--color-heading)', cursor: 'pointer' }}>Sign up</strong>
                  {' to save your badge'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="5" y="11" width="14" height="11" rx="2" stroke="var(--color-badge-unearned-stroke)" strokeWidth="2" fill="none" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="var(--color-badge-unearned-stroke)" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
                <span style={{ fontFamily: fb, fontSize: 13, fontWeight: 400, color: 'var(--color-badge-unearned-text)', whiteSpace: 'nowrap' }}>
                  Try again to earn <strong style={{ fontWeight: 700, textDecoration: 'underline dotted', textDecorationColor: 'var(--color-muted)', textUnderlineOffset: 3 }}>How to Play</strong> badge
                </span>
              </div>
            )}
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              {allCorrect && <div className="quiz-sunburst-wrap" />}
              {allCorrect ? (
                <div className="ls-badge" style={{ width: 100, height: 100 }}>
                  <BadgeIcon />
                </div>
              ) : (
                <div style={{ width: 100, height: 100, position: 'relative' }}>
                  <BadgeIconOutline />
                </div>
              )}
            </div>
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

        {/* Try again + Play Now — pinned to bottom */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={handleRestart} style={{ ...quizBtn, flex: 1, background: 'transparent', border: '1px solid var(--color-heading)', color: 'var(--color-heading)' }}>
            Try Again
          </button>
          <button onClick={() => window.open('https://www.backgammon.com', '_blank')} style={{ ...quizBtn, flex: 3 }}>
            Play Now
          </button>
        </div>
      </div>
    );
  }

  /* ── Active question ─────────────────────────────── */
  return (
    <div key="quiz-active" className="surface-tertiary" style={quizCard}>
      {/* Progress bar */}
      <div style={{ marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: fm, fontSize: 'var(--size-meta)', color: 'var(--color-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span style={{ fontFamily: fm, fontSize: 'var(--size-meta)', color: 'var(--color-muted)' }}>
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

      {/* Next button — always visible, disabled until answered */}
      <button
        onClick={handleNext}
        disabled={!isAnswered}
        style={{ ...quizBtn, marginTop: 16, flexShrink: 0, opacity: isAnswered ? 1 : 0.35, cursor: isAnswered ? 'pointer' : 'default' }}
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

/* ─── Guide navigation CTAs ─────────────────────────────────── */

const GUIDE_SEQUENCE = [
  { title: 'Introduction to Backgammon', href: '#' },
  { title: 'How to Play Backgammon',     href: '#' },
  { title: 'The Doubling Cube',          href: '#' },
];
const CURRENT_GUIDE_IDX = 1;

function GuideCTAs() {
  const prev = GUIDE_SEQUENCE[CURRENT_GUIDE_IDX - 1] ?? null;
  const next = GUIDE_SEQUENCE[CURRENT_GUIDE_IDX + 1] ?? null;

  const card = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '14px 18px',
    borderRadius: 10,
    background: 'var(--color-guide-nav-bg)',
    border: '1px solid var(--color-guide-nav-border)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    fontFamily: fm,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-guide-nav-label)',
  };

  const titleStyle = {
    fontFamily: fs,
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-guide-nav-title)',
    lineHeight: 1.3,
  };

  return (
    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
      {prev ? (
        <a href={prev.href} style={{ ...card, alignItems: 'flex-start' }}>
          <span style={labelStyle}>← Previous</span>
          <span style={titleStyle}>{prev.title}</span>
        </a>
      ) : <div style={{ flex: 1 }} />}
      {next ? (
        <a href={next.href} style={{ ...card, alignItems: 'flex-end', textAlign: 'right' }}>
          <span style={labelStyle}>Next →</span>
          <span style={titleStyle}>{next.title}</span>
        </a>
      ) : <div style={{ flex: 1 }} />}
    </div>
  );
}

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
          fontSize: 'var(--size-toc)',
          lineHeight: 1,
          color: active ? 'var(--color-toc-pip-active)' : 'var(--color-muted)',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TableOfContents() {
  const tocRef = useRef(null);
  const [activeSection, setActiveSection] = useState(-1);
  const STICKY_TOP = 54;

  useLayoutEffect(() => {
    const el = tocRef.current;
    if (!el) return;

    // Align TOC top with the start of the article text content
    const contentSection = document.querySelector('.ls-section.surface-muted');
    const initialTop = contentSection
      ? Math.round(contentSection.getBoundingClientRect().top + window.scrollY) + 64
      : Math.round(el.getBoundingClientRect().top + window.scrollY);

    // Apply fixed positioning before first paint — no jump, no state
    el.style.position = 'fixed';
    el.style.top = Math.max(STICKY_TOP, initialTop - window.scrollY) + 'px';

    const handleScroll = () => {
      el.style.top = Math.max(STICKY_TOP, initialTop - window.scrollY) + 'px';

      // If scrolled to the bottom, always highlight the last section
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 80;
      if (atBottom) { setActiveSection(SECTION_IDS.length - 1); return; }

      let next = -1;
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(SECTION_IDS[i]);
        if (sectionEl && sectionEl.getBoundingClientRect().top < 80) { next = i; break; }
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
    >
      <span className="ls-toc-heading">Table of Contents</span>
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

export default function LearnSegmentTemplate({ onNavigate }) {
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
      <SiteHeader onLogoClick={() => onNavigate?.('learn-hub')} onNavigate={onNavigate} />

      {/* ── HERO / INTRO ── */}
      <section className="ls-section">
        <div className="ls-content">

          <div className="ls-breadcrumb-wrap">
            <div className="ls-breadcrumb-row">
              <BreadcrumbPills course="Intro to Backgammon" lesson="Lesson 1" />
            </div>
            <div className="ls-badge">
              <BadgeIcon />
              {/* EXP pip + tooltip hidden for now
              <div className="ls-badge-dot">1</div>
              <div className="ls-badge-tooltip">Learn EXP +1</div>
              */}
            </div>
          </div>

          <h1 className="ls-h1" style={{ fontFamily: fh, color: 'var(--color-heading)' }}>
            How to Play Backgammon
          </h1>

          <div className="ls-article-meta">
            <div style={{ fontSize: 'var(--size-body)', lineHeight: 'var(--lh-body)', color: 'var(--color-muted)' }}>
              <span style={{ fontFamily: fm, fontWeight: 400 }}>Reviewed by </span>
              <a href="#" style={{ fontFamily: fm, fontWeight: 600, color: 'var(--color-link)', textDecoration: 'none' }}>Masayuki "Mochy" Mochizuki</a>
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

      {/* ── CONTENT BODY ── */}
      <section className="ls-section surface-muted">
        <div className="ls-content ls-content-gap-lg">

          {/* 1. Board Layout */}
          <div id="section-layout" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <H2>1. Board Layout</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                The board has 24 triangles called <GlossaryTerm term="Points" />. The board is split into four quadrants.{' '}
                Your <GlossaryTerm term="Home Board" /> is where you finish.{' '}
                The <GlossaryTerm term="Outer Board" /> is the middle of the track.{' '}
                The <GlossaryTerm term="Bar" /> is the ridge down the center.
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
                <GlossaryTerm term="Anchor" />. You cannot land there.
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
                  <GlossaryTerm term="Blot" />.
                  If you land on a Blot, you <GlossaryTerm term="Hit" /> it
                  and send it to the <GlossaryTerm term="Bar" />.
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

          {/* Guide navigation */}
          <GuideCTAs />

          <div className="ls-nav-spacer" />

        </div>
      </section>

      {/* ── CTA END CAP ── */}
      <PlayNowCta />

      {/* ── FOOTER ── */}
      <SiteFooter />

      {/* ── TABLE OF CONTENTS ── */}
      <TableOfContents />

      {/* ── MOBILE BOTTOM NAV ── */}
      <MobileNav onNavigate={onNavigate} currentPageId="learn-article" />

    </div>
  );
}
