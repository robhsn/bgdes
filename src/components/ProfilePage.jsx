import React, { useState, useEffect } from 'react';
import './LearnSegmentTemplate.css';
import './ProfilePage.css';
import { SiteHeader, SiteFooter } from './SharedLayout';
import { useDMEState } from '../context/dme-states';
import avatarImg from '../imgs/avatar-dink.png';
import boardSample from '../imgs/board-sample.png';

/* ── Token shorthand helpers ─────────────────────────────────── */
const fh = 'var(--font-heading)';
const fb = 'var(--font-body)';
const fm = 'var(--font-meta)';
const fp = 'var(--font-pill)';

/* ── Mock data ───────────────────────────────────────────────── */

const MOCK_OWN = {
  displayName: 'ChrisG',
  avatar: avatarImg,
  joinDate: 'Member since March 2024',
  bio: 'Loves the blot and daring open plays. Always betting on the backfield.',
  stats: { wins: 87, losses: 52, gamesPlayed: 139, currentStreak: 5, highestStreak: 12 },
};

const MOCK_OTHER = {
  displayName: 'MarinaD',
  avatar: avatarImg,
  joinDate: 'Member since January 2023',
  bio: 'Top 50 ranked player. Aggressive opening, patient endgame.',
  stats: { wins: 312, losses: 148, gamesPlayed: 460, currentStreak: 9, highestStreak: 23 },
};

const MOCK_GUEST = {
  displayName: 'LuckyRoller2893',
  avatar: null,
  joinDate: 'Guest player',
  bio: null,
  stats: { wins: 4, losses: 6, gamesPlayed: 10, currentStreak: 1, highestStreak: 2 },
};

const MATCH_HISTORY = [
  { id: 1, opponent: 'MarinaD',   result: 'win',  score: '5–3', date: 'Today'   },
  { id: 2, opponent: 'Felix_B',   result: 'win',  score: '5–1', date: 'Today'   },
  { id: 3, opponent: 'Kowalski22',result: 'loss', score: '2–5', date: 'Mar 7'   },
  { id: 4, opponent: 'TommyV',    result: 'win',  score: '5–4', date: 'Mar 7'   },
  { id: 5, opponent: 'AIPlayer',  result: 'win',  score: '5–0', date: 'Mar 6'   },
  { id: 6, opponent: 'MarinaD',   result: 'loss', score: '3–5', date: 'Mar 5'   },
  { id: 7, opponent: 'Kowalski22',result: 'win',  score: '5–2', date: 'Mar 4'   },
  { id: 8, opponent: 'SarahM',    result: 'loss', score: '1–5', date: 'Mar 3'   },
  { id: 9, opponent: 'Felix_B',   result: 'win',  score: '5–3', date: 'Mar 2'   },
  { id: 10,opponent: 'AIPlayer',  result: 'win',  score: '5–2', date: 'Mar 1'   },
];

const BADGE_THRESHOLDS = {
  win:    [10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
  streak: [3, 5, 7, 10, 12, 15, 20],
  games:  [5, 10, 15, 25, 50, 75, 100, 150, 250, 500],
};

/** Returns { earned: number[], next: number|null, locked: number[] } */
function getBadgeState(thresholds, value) {
  const earned = thresholds.filter(t => t <= value);
  const remaining = thresholds.filter(t => t > value);
  const next = remaining[0] ?? null;
  const locked = remaining.slice(1);
  return { earned, next, locked };
}

/* ── Celebration mock data ───────────────────────────────────── */

const CELEBRATION_QUEUE = [
  { category: 'Win Badge', label: '50 Wins', threshold: 50, icon: 'win' },
  { category: 'Streak Badge', label: '5-Win Streak', threshold: 5, icon: 'streak' },
];

/* ── Icon components ─────────────────────────────────────────── */

function IconWin({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M38.76 10c2.07 0 3.76 1.7 3.68 3.77L42.38 15h3.87c2.04 0 3.84 1.69 3.68 3.89-.59 8.1-4.73 12.55-9.22 14.88-1.23.64-2.49 1.11-3.68 1.46C39.03 37.41 37.02 39 35.51 39.29V45h5c1.38 0 2.5 1.12 2.5 2.5S41.89 50 40.51 50h-21c-1.38 0-2.5-1.12-2.5-2.5S18.13 45 19.51 45h5v-5.71c-1.27-.61-2.86-1.74-4.38-3.85-1.44.37-3 .94-4.53 1.79-4.23-2.37-8.04-6.83-8.59-14.84C6.85 20.19 8.64 18.5 10.68 18.5H14.5L14.37 15c-.09-2.07 1.61-3.77 3.69-3.77h20.7zM14.64 20H10.5c.48 6.62 3.52 9.93 6.65 11.69-1.3-3.36-2.33-7.9-2.51-11.69zm27.28 0h-4.12c-.48 4.76-1.35 8.45-2.42 11.32 3.16-1.86 6.03-5.16 6.54-11.32z" fill={color}/>
    </svg>
  );
}

function IconStreak({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M34.5 10c0 0-1 8-6 12-3 2.5-4.5 5-4.5 5s0-3-2-5c0 0-1.5 5-1.5 10 0 8.28 6.72 15 15 15s15-6.72 15-15c0-10-11-18-16-22zm-3 28c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-3 2-5.5 4.5-7 .27 2.27 1.5 4 1.5 4s1-3 3-5c1.5 2.27 3 5 3 8z" fill={color}/>
    </svg>
  );
}

function IconGames({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="16" stroke={color} strokeWidth="4" fill="none"/>
      <circle cx="30" cy="30" r="6" fill={color}/>
      <path d="M30 14V10M30 50v-4M14 30h-4M50 30h-4" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function IconLock({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function IconShare({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-5.368m0 5.368 6.632 3.316m-6.632-8.684 6.632-3.316m0 0a3 3 0 1 0 5.368-2.684 3 3 0 0 0-5.368 2.684zm0 11.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCelebration({ size = 52, color = 'var(--color-badge-icon-inner)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M38.76 10c2.07 0 3.76 1.7 3.68 3.77L42.38 15h3.87c2.04 0 3.84 1.69 3.68 3.89-.59 8.1-4.73 12.55-9.22 14.88-1.23.64-2.49 1.11-3.68 1.46C39.03 37.41 37.02 39 35.51 39.29V45h5c1.38 0 2.5 1.12 2.5 2.5S41.89 50 40.51 50h-21c-1.38 0-2.5-1.12-2.5-2.5S18.13 45 19.51 45h5v-5.71c-1.27-.61-2.86-1.74-4.38-3.85-1.44.37-3 .94-4.53 1.79-4.23-2.37-8.04-6.83-8.59-14.84C6.85 20.19 8.64 18.5 10.68 18.5H14.5L14.37 15c-.09-2.07 1.61-3.77 3.69-3.77h20.7z" fill={color}/>
    </svg>
  );
}

/* ── Badge icon factory ───────────────────────────────────────── */

function BadgeIconSvg({ type, size = 28, color = 'var(--color-badge-icon-inner)' }) {
  if (type === 'win')    return <IconWin    size={size} color={color} />;
  if (type === 'streak') return <IconStreak size={size} color={color} />;
  return <IconGames size={size} color={color} />;
}

/* ── Nav icons (same as LearnHubPage) ────────────────────────── */

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
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
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
function IconProfileNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Challenges', Icon: IconTrophy },
  { label: 'Learning',   Icon: IconLearning },
  { label: 'New Game',   Icon: IconNewGame },
  { label: 'Friends',    Icon: IconFriends },
  { label: 'Profile',    Icon: IconProfileNav },
];

function MobileNav({ onNavigate }) {
  return (
    <nav className="ls-mobile-nav">
      {NAV_ITEMS.map(({ label, Icon }) => (
        <button
          key={label}
          className={`ls-nav-item${label === 'Profile' ? ' ls-nav-item-active' : ''}`}
          onClick={label === 'Learning' ? () => onNavigate?.('learn-hub') : undefined}
        >
          <Icon />
          <span className="ls-nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── Confetti component ──────────────────────────────────────── */

const CONFETTI_COLORS = ['#f05a25', '#ffbda6', '#2158a7', '#97b2d9', '#4caf82', '#ffd54f', '#e91e63'];
const CONFETTI_ANGLES = [
  { x: '-80px', y: '-120px' }, { x: '80px',  y: '-130px' },
  { x: '-130px', y: '-60px' }, { x: '130px', y: '-70px' },
  { x: '-100px', y: '30px'  }, { x: '100px', y: '20px'  },
  { x: '-60px',  y: '-150px'}, { x: '60px',  y: '-140px'},
  { x: '-150px', y: '0px'   }, { x: '150px', y: '10px'  },
  { x: '-40px',  y: '60px'  }, { x: '40px',  y: '50px'  },
];

function Confetti() {
  return (
    <div className="pp-confetti-container">
      {CONFETTI_ANGLES.map((end, i) => (
        <div
          key={i}
          className="pp-confetti-piece"
          style={{
            '--confetti-end': `translate(${end.x}, ${end.y}) rotate(${360 + i * 30}deg)`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: `${0.1 + i * 0.04}s`,
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            width: 6 + (i % 3) * 3,
            height: 6 + (i % 3) * 3,
          }}
        />
      ))}
    </div>
  );
}

/* ── Badge celebration modal ─────────────────────────────────── */

function BadgeCelebration({ queue, onDismiss }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  if (!queue || queue.length === 0 || idx >= queue.length) return null;

  const badge = queue[idx];

  function handleDismiss() {
    if (idx < queue.length - 1) {
      setFading(true);
      setTimeout(() => { setIdx(i => i + 1); setFading(false); }, 300);
    } else {
      onDismiss();
    }
  }

  return (
    <div
      className="pp-celebration-overlay"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
      onClick={handleDismiss}
    >
      <div className="pp-celebration-modal" onClick={e => e.stopPropagation()}>
        <Confetti />
        <div className="pp-celebration-badge-wrap">
          <div className="pp-celebration-badge">
            <BadgeIconSvg type={badge.icon} size={52} color="var(--color-badge-icon-inner)" />
          </div>
        </div>
        <div className="pp-celebration-category">{badge.category}</div>
        <div className="pp-celebration-title">{badge.label}!</div>
        <div className="pp-celebration-body">
          {idx < queue.length - 1
            ? `${queue.length - idx - 1} more badge${queue.length - idx - 1 > 1 ? 's' : ''} to celebrate!`
            : 'Keep playing to unlock more badges.'}
        </div>
        <button
          className="pp-btn pp-btn--primary pp-celebration-dismiss"
          onClick={handleDismiss}
        >
          {idx < queue.length - 1 ? 'Next Badge →' : 'Awesome!'}
        </button>
        {queue.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginTop: -4 }}>
            {queue.map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === idx ? 'var(--color-heading)' : 'var(--color-border-mid)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Individual badge item ───────────────────────────────────── */

function BadgeItem({ threshold, state, icon }) {
  const labelMap = { win: 'W', streak: 'S', games: 'G' };
  return (
    <div className="pp-badge" title={
      state === 'earned' ? `${threshold} ${icon === 'win' ? 'Wins' : icon === 'streak' ? 'Streak' : 'Games'} — Earned` :
      state === 'next'   ? `Next: ${threshold}` : `Locked: ${threshold}`
    }>
      <div className={`pp-badge-icon pp-badge-icon--${state}`}>
        {state !== 'locked' && (
          <BadgeIconSvg
            type={icon}
            size={state === 'earned' ? 28 : 24}
            color={state === 'earned' ? 'var(--color-badge-icon-inner)' : 'var(--color-border-mid)'}
          />
        )}
        {state === 'locked' && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--color-border-subtle)" strokeWidth="1.5"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="var(--color-border-subtle)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <span className={`pp-badge-label pp-badge-label--${state}`}>{threshold}</span>
    </div>
  );
}

/* ── Badge category section ──────────────────────────────────── */

function BadgeCategorySection({ title, thresholds, statValue, icon, isGated }) {
  const { earned, next, locked } = getBadgeState(thresholds, statValue);
  const remaining = next !== null ? next - statValue : null;
  const statWord = icon === 'win' ? 'wins' : icon === 'streak' ? 'streak' : 'games';

  return (
    <div className="pp-badge-category">
      <div className="pp-badge-category-header">
        <span className="pp-badge-category-name">{title}</span>
        {!isGated && remaining !== null && (
          <span className="pp-badge-progress-hint">
            {remaining} more {statWord} to unlock {next} badge
          </span>
        )}
        {!isGated && remaining === null && earned.length > 0 && (
          <span className="pp-badge-progress-hint" style={{ color: '#2e7d32' }}>
            All badges unlocked!
          </span>
        )}
      </div>
      <div className="pp-badge-grid">
        {earned.map(t  => <BadgeItem key={t} threshold={t} state="earned" icon={icon} />)}
        {next !== null && <BadgeItem threshold={next}  state="next"   icon={icon} />}
        {locked.slice(0, 6).map(t => <BadgeItem key={t} threshold={t} state="locked" icon={icon} />)}
        {locked.length > 6 && (
          <div className="pp-badge" style={{ opacity: 0.4 }}>
            <div className="pp-badge-icon pp-badge-icon--locked" style={{ fontSize: 13, fontFamily: fm, color: 'var(--color-muted)' }}>
              +{locked.length - 6}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Gated section wrapper ───────────────────────────────────── */

function GatedSection({ isGated, children }) {
  if (!isGated) return children;
  return (
    <div className="pp-gated-wrap" style={{ position: 'relative' }}>
      <div style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {children}
      </div>
      <div className="pp-gated-overlay">
        <IconLock size={36} />
        <div className="pp-gated-title">See your full stats</div>
        <div className="pp-gated-body">
          Create an account to track your stats, earn badges, and build your profile.
        </div>
        <button className="pp-btn pp-btn--primary" style={{ pointerEvents: 'all' }}>
          Create Account
        </button>
      </div>
    </div>
  );
}

/* ── Match history section ───────────────────────────────────── */

function MatchHistorySection({ history, isEmpty }) {
  if (isEmpty) {
    return (
      <div className="pp-empty-state">
        <IconGames size={40} color="var(--color-border-mid)" />
        <div className="pp-empty-title">No matches yet</div>
        <div className="pp-empty-body">Play your first game to start building your match history.</div>
      </div>
    );
  }
  return (
    <div className="pp-match-list">
      {history.map(m => (
        <div key={m.id} className={`pp-match-row pp-match-row--${m.result}`}>
          <div className="pp-match-opponent-avatar">
            <img src={avatarImg} alt={m.opponent} />
          </div>
          <span className="pp-match-name">{m.opponent}</span>
          <span className={`pp-match-result-chip pp-match-result-chip--${m.result}`}>
            {m.result === 'win' ? 'Won' : 'Lost'}
          </span>
          <span className="pp-match-score">{m.score}</span>
          <span className="pp-match-date">{m.date}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main ProfilePage ────────────────────────────────────────── */

export default function ProfilePage({ onNavigate }) {
  const viewType   = useDMEState('profile.viewType', 'own');
  const dmeCelebration = useDMEState('profile.celebration', false);

  /* Local celebration state — shown on toggle or manual trigger */
  const [celebrating, setCelebrating] = useState(false);
  const [prevDmeCelebration, setPrevDmeCelebration] = useState(dmeCelebration);
  const [shareLabel, setShareLabel] = useState('Share Profile');

  /* Watch DME celebration toggle */
  useEffect(() => {
    if (dmeCelebration && !prevDmeCelebration) {
      setCelebrating(true);
    }
    setPrevDmeCelebration(dmeCelebration);
  }, [dmeCelebration]);

  /* Derive player data from viewType */
  const isGuest     = viewType === 'guest';
  const isNewPlayer = viewType === 'new-player';
  const isOther     = viewType === 'other';
  const isOwn       = viewType === 'own' || isNewPlayer;

  const player = isOther
    ? MOCK_OTHER
    : isGuest
      ? MOCK_GUEST
      : MOCK_OWN;

  const stats = isNewPlayer
    ? { wins: 0, losses: 0, gamesPlayed: 0, currentStreak: 0, highestStreak: 0 }
    : player.stats;

  const showActions = isOwn && !isGuest;
  const showOtherProfile = isOther;
  const isGated = isGuest;

  function handleShareProfile() {
    const url = `${window.location.origin}/member/${player.displayName.toLowerCase()}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShareLabel('Copied!');
      setTimeout(() => setShareLabel('Share Profile'), 2000);
    }).catch(() => {
      setShareLabel('Share Profile');
    });
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <SiteHeader
        onLogoClick={() => onNavigate?.('learn-hub')}
        onNavigate={onNavigate}
      />

      {/* ── Cover image ── */}
      <img src={boardSample} alt="" className="pp-cover" aria-hidden="true" />

      {/* ── Profile header ── */}
      <div className="pp-header-wrap">
        <div className="pp-header-inner">
          <div className="pp-avatar-row">
            <div className="pp-avatar">
              {player.avatar
                ? <img src={player.avatar} alt={player.displayName} />
                : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, var(--color-border-mid), var(--color-border-subtle))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: fh, fontWeight: 700, fontSize: 32,
                    color: 'var(--color-bg)',
                  }}>
                    {player.displayName[0].toUpperCase()}
                  </div>
                )
              }
            </div>
            <div className="pp-header-actions">
              {showActions && (
                <>
                  <button className="pp-btn pp-btn--secondary" style={{ fontSize: 13 }}>
                    Edit Profile
                  </button>
                  <button
                    className="pp-btn pp-btn--primary"
                    style={{ fontSize: 13 }}
                    onClick={handleShareProfile}
                  >
                    <IconShare size={14} />
                    {shareLabel}
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="pp-display-name">{player.displayName}</h1>
          <div className="pp-join-date">{player.joinDate}</div>
          {player.bio && <p className="pp-bio">{player.bio}</p>}
        </div>
      </div>

      {/* ── Stats section ── */}
      <div className="pp-section surface-muted">
        <div className="pp-section-inner">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <h2 className="pp-section-title" style={{ margin: 0 }}>Stats</h2>
            {isNewPlayer && (
              <span className="pp-badge-progress-hint">Play your first game to start tracking!</span>
            )}
          </div>
          <GatedSection isGated={isGated}>
            <div className="pp-stats-grid">
              {[
                { label: 'Total Wins',      value: stats.wins          },
                { label: 'Games Played',    value: stats.gamesPlayed   },
                { label: 'Current Streak',  value: stats.currentStreak },
                { label: 'Highest Streak',  value: stats.highestStreak },
              ].map(s => (
                <div key={s.label} className="pp-stat-card">
                  <div className="pp-stat-number">{s.value}</div>
                  <div className="pp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </GatedSection>
        </div>
      </div>

      {/* ── Badges section ── */}
      <div className="pp-section">
        <div className="pp-section-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4, flexWrap: 'wrap' }}>
            <h2 className="pp-section-title" style={{ margin: 0 }}>Milestone Badges</h2>
            {isOwn && !isGuest && (
              <button
                className="pp-demo-btn"
                onClick={() => setCelebrating(true)}
              >
                ✦ Demo celebration
              </button>
            )}
          </div>
          <p className="pp-section-subtitle">Earned for wins, streaks, and games played</p>

          <GatedSection isGated={isGated}>
            {isNewPlayer ? (
              <div className="pp-empty-state">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0,1,2].map(i => (
                    <div key={i} className="pp-badge-icon pp-badge-icon--locked" />
                  ))}
                </div>
                <div className="pp-empty-title">No badges yet</div>
                <div className="pp-empty-body">Win your first 10 games to unlock your first badge.</div>
              </div>
            ) : (
              <>
                <BadgeCategorySection
                  title="Win Badges"
                  thresholds={BADGE_THRESHOLDS.win}
                  statValue={stats.wins}
                  icon="win"
                  isGated={isGated}
                />
                <BadgeCategorySection
                  title="Streak Badges"
                  thresholds={BADGE_THRESHOLDS.streak}
                  statValue={stats.highestStreak}
                  icon="streak"
                  isGated={isGated}
                />
                <BadgeCategorySection
                  title="Games Played Badges"
                  thresholds={BADGE_THRESHOLDS.games}
                  statValue={stats.gamesPlayed}
                  icon="games"
                  isGated={isGated}
                />
              </>
            )}
          </GatedSection>
        </div>
      </div>

      {/* ── Match history section ── */}
      <div className="pp-section surface-muted" style={{ paddingBottom: 64 }}>
        <div className="pp-section-inner">
          <h2 className="pp-section-title">Match History</h2>
          <p className="pp-section-subtitle">Last 10 games</p>
          <GatedSection isGated={isGated}>
            <MatchHistorySection
              history={MATCH_HISTORY}
              isEmpty={isNewPlayer}
            />
          </GatedSection>
        </div>
      </div>

      <SiteFooter />
      <MobileNav onNavigate={onNavigate} />
      <div className="ls-nav-spacer" />

      {/* ── Badge celebration ── */}
      {celebrating && (
        <BadgeCelebration
          queue={CELEBRATION_QUEUE}
          onDismiss={() => setCelebrating(false)}
        />
      )}
    </div>
  );
}
