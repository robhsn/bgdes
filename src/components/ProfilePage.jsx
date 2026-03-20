import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SiteHeader, SiteFooter } from './SharedLayout';
import { useDMEState } from '../context/dme-states';
import avatarImg from '../imgs/avatar-dink.png';
import boardSample from '../imgs/board-sample.png';
import coverDefault from '../imgs/cover-image.jpg';
import profileData from '../tokens/profile-data.json';
import badgePlaceholder from '../imgs/badge-placeholder.svg';
import { MOCK_FRIENDS, MOCK_SEARCH_RESULTS, MOCK_FB_FRIENDS } from '../data/social-mock-data';
import Avatar from './Avatar';

/* ── Flag images ─────────────────────────────────────────────── */
const flagModules = import.meta.glob('../imgs/icon-flags/*.png', { eager: true });
const FLAG_LABEL_OVERRIDES = {
  'america': 'United States of America',
};
const FLAG_LIST = Object.entries(flagModules).map(([path, mod]) => {
  const filename = path.split('/').pop().replace('.png', '');
  const key = filename.toLowerCase();
  return {
    key,
    label: FLAG_LABEL_OVERRIDES[key] || filename.replace(/(^|\s)\S/g, c => c.toUpperCase()),
    src: mod.default,
  };
}).sort((a, b) => a.label.localeCompare(b.label));

/* ── Preset avatars ──────────────────────────────────────────── */
import avatarEmpty from '../imgs/avatars/Empty.png';
import avatarTimothy from '../imgs/avatars/Timothy.png';
import avatarWizard from '../imgs/avatars/Wizard.png';
import avatarZombie from '../imgs/avatars/Zombie.png';
import avatarFarmer from '../imgs/avatars/Farmer.png';
import avatarDrac from '../imgs/avatars/Drac.png';
import avatarChef from '../imgs/avatars/Chef.png';
import avatarAdventurer from '../imgs/avatars/Adventurer.png';
import avatarGhosty from '../imgs/avatars/Ghosty.png';
import avatarGoblin from '../imgs/avatars/Gobby.png';
import avatarClown from '../imgs/avatars/Clown.png';
import avatarKing from '../imgs/avatars/King.png';
import avatarKnight from '../imgs/avatars/Knight.png';
import avatarMummy from '../imgs/avatars/Mummy.png';
import avatarPrincess from '../imgs/avatars/Princess.png';
import avatarRobot from '../imgs/avatars/Robot.png';
import avatarAIPlayer from '../imgs/avatars/AI Player.png';
import avatarThief from '../imgs/avatars/Thief.png';
import avatarWolfy from '../imgs/avatars/Wolfy.png';
import avatarWitch from '../imgs/avatars/Witch.png';
import avatarSoldier from '../imgs/avatars/Soldier.png';
import avatarLincoln from '../imgs/avatars/Lincoln.png';

const PRESET_AVATARS = [
  { key: 'Empty',       src: avatarEmpty },
  { key: 'Timothy',     src: avatarTimothy },
  { key: 'Wizard',      src: avatarWizard },
  { key: 'Zombie',      src: avatarZombie },
  { key: 'Farmer',      src: avatarFarmer },
  { key: 'Drac',        src: avatarDrac },
  { key: 'Gobby',       src: avatarGoblin },
  { key: 'Chef',        src: avatarChef },
  { key: 'Adventurer',  src: avatarAdventurer },
  { key: 'Ghosty',      src: avatarGhosty },
  { key: 'Clown',       src: avatarClown },
  { key: 'King',        src: avatarKing },
  { key: 'Knight',      src: avatarKnight },
  { key: 'Mummy',       src: avatarMummy },
  { key: 'Princess',    src: avatarPrincess },
  { key: 'Robot',       src: avatarRobot },
  { key: 'AI Player',   src: avatarAIPlayer },
  { key: 'Thief',       src: avatarThief },
  { key: 'Wolfy',       src: avatarWolfy },
  { key: 'Witch',       src: avatarWitch },
  { key: 'Soldier',     src: avatarSoldier },
  { key: 'Lincoln',     src: avatarLincoln },
];

const AVATAR_MAP = Object.fromEntries(PRESET_AVATARS.map(a => [a.key, a.src]));
function getAvatarSrc(key) { return AVATAR_MAP[key] || avatarImg; }

/* ── Token shorthand helpers ─────────────────────────────────── */
const fh = 'var(--font-heading)';
const fb = 'var(--font-body)';
const fm = 'var(--font-meta)';
const fp = 'var(--font-pill)';

/* ── Shorten "Member since March 2024" → "Mar '24" ─────────── */
const MONTH_SHORT = {
  January:'Jan', February:'Feb', March:'Mar', April:'Apr', May:'May', June:'Jun',
  July:'Jul', August:'Aug', September:'Sep', October:'Oct', November:'Nov', December:'Dec',
};
function shortenJoinDate(str) {
  const m = str?.match(/(\w+)\s+(\d{4})/);
  if (!m) return str || '';
  const mon = MONTH_SHORT[m[1]] || m[1].slice(0, 3);
  return `${mon} '${m[2].slice(2)}`;
}

/* ── Mock data ───────────────────────────────────────────────── */

const MOCK_OWN = {
  displayName: 'MyReallyLongCoolUsername',
  avatar: avatarImg,
  joinDate: 'Member since March 2024',
  bio: 'Loves the blot and daring open plays. Always betting on the backfield.',
  stats: { wins: 87, losses: 52, gamesPlayed: 139, currentStreak: 5, highestStreak: 1431 },
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

const MOCK_PROFILE_B = {
  displayName: 'GammonKing42',
  avatar: getAvatarSrc('Timothy'),
  joinDate: 'Member since August 2023',
  bio: 'Precision player. If you leave a blot, I will hit it.',
  stats: { wins: 204, losses: 96, gamesPlayed: 300, currentStreak: 3, highestStreak: 14 },
};

const MATCH_HISTORY_B = [
  { id: 101, opponent: 'MyReallyLongCoolUsername', avatarKey: 'Dink',     result: 'win',  score: '5–2', date: 'Mar 7',  duration: '18m', errorRate: 14, improvement: null },
  { id: 102, opponent: 'MarinaD',                 avatarKey: 'Princess', result: 'loss', score: '3–5', date: 'Mar 5',  duration: '15m', errorRate: 22, improvement: null },
  { id: 103, opponent: 'Felix_B',                 avatarKey: 'Wizard',   result: 'win',  score: '5–4', date: 'Mar 4',  duration: '20m', errorRate: 16, improvement: 4  },
  { id: 104, opponent: 'MyReallyLongCoolUsername', avatarKey: 'Dink',     result: 'loss', score: '2–5', date: 'Mar 2',  duration: '14m', errorRate: 28, improvement: null },
  { id: 105, opponent: 'BoardMaster',             avatarKey: 'King',     result: 'win',  score: '5–1', date: 'Mar 1',  duration: '10m', errorRate: 9,  improvement: 6  },
  { id: 106, opponent: 'MyReallyLongCoolUsername', avatarKey: 'Dink',     result: 'win',  score: '5–0', date: 'Feb 28', duration: '5m',  errorRate: 4,  improvement: 11 },
  { id: 107, opponent: 'SarahM',                  avatarKey: 'Witch',    result: 'win',  score: '5–3', date: 'Feb 26', duration: '16m', errorRate: 13, improvement: null },
  { id: 108, opponent: 'Felix_B',                 avatarKey: 'Wizard',   result: 'loss', score: '4–5', date: 'Feb 24', duration: '19m', errorRate: 25, improvement: null },
  { id: 109, opponent: 'MyReallyLongCoolUsername', avatarKey: 'Dink',     result: 'loss', score: '3–5', date: 'Feb 22', duration: '17m', errorRate: 20, improvement: null },
  { id: 110, opponent: 'TommyV',                  avatarKey: 'Knight',   result: 'win',  score: '5–2', date: 'Feb 20', duration: '12m', errorRate: 10, improvement: 3  },
];

const MATCH_HISTORY = [
  { id: 1,  opponent: 'MarinaD',       avatarKey: 'Princess', result: 'win',  score: '5–3', date: 'Today',  duration: '12m', errorRate: 8,  improvement: 8  },
  { id: 2,  opponent: 'Felix_B',       avatarKey: 'Wizard',   result: 'win',  score: '5–1', date: 'Today',  duration: '8m',  errorRate: 12, improvement: null },
  { id: 3,  opponent: 'GammonKing42',  avatarKey: 'Timothy',  result: 'loss', score: '2–5', date: 'Mar 7',  duration: '18m', errorRate: 31, improvement: null },
  { id: 4,  opponent: 'TommyV',        avatarKey: 'Knight',   result: 'win',  score: '5–4', date: 'Mar 7',  duration: '22m', errorRate: 18, improvement: 3  },
  { id: 5,  opponent: 'AIPlayer',      avatarKey: 'AI Player',result: 'win',  score: '5–0', date: 'Mar 6',  duration: '6m',  errorRate: 5,  improvement: 12 },
  { id: 6,  opponent: 'MarinaD',       avatarKey: 'Princess', result: 'loss', score: '3–5', date: 'Mar 5',  duration: '15m', errorRate: 27, improvement: null },
  { id: 7,  opponent: 'GammonKing42',  avatarKey: 'Timothy',  result: 'win',  score: '5–2', date: 'Mar 4',  duration: '14m', errorRate: 14, improvement: null },
  { id: 8,  opponent: 'SarahM',        avatarKey: 'Witch',    result: 'loss', score: '1–5', date: 'Mar 3',  duration: '9m',  errorRate: 35, improvement: null },
  { id: 9,  opponent: 'Felix_B',       avatarKey: 'Wizard',   result: 'win',  score: '5–3', date: 'Mar 2',  duration: '17m', errorRate: 9,  improvement: 5  },
  { id: 10, opponent: 'AIPlayer',      avatarKey: 'AI Player',result: 'win',  score: '5–2', date: 'Mar 1',  duration: '7m',  errorRate: 7,  improvement: null },
  { id: 11, opponent: 'TommyV',        avatarKey: 'Knight',   result: 'loss', score: '4–5', date: 'Feb 28', duration: '20m', errorRate: 22, improvement: null },
  { id: 12, opponent: 'MarinaD',       avatarKey: 'Princess', result: 'win',  score: '5–1', date: 'Feb 27', duration: '10m', errorRate: 6,  improvement: 9  },
  { id: 13, opponent: 'SarahM',        avatarKey: 'Witch',    result: 'win',  score: '5–4', date: 'Feb 26', duration: '19m', errorRate: 15, improvement: null },
  { id: 14, opponent: 'Felix_B',       avatarKey: 'Wizard',   result: 'loss', score: '2–5', date: 'Feb 25', duration: '11m', errorRate: 29, improvement: null },
  { id: 15, opponent: 'GammonKing42',  avatarKey: 'Timothy',  result: 'win',  score: '5–0', date: 'Feb 24', duration: '5m',  errorRate: 4,  improvement: 7  },
  { id: 16, opponent: 'AIPlayer',      avatarKey: 'AI Player',result: 'win',  score: '5–3', date: 'Feb 23', duration: '13m', errorRate: 11, improvement: null },
  { id: 17, opponent: 'TommyV',        avatarKey: 'Knight',   result: 'win',  score: '5–2', date: 'Feb 22', duration: '16m', errorRate: 13, improvement: 2  },
  { id: 18, opponent: 'MarinaD',       avatarKey: 'Princess', result: 'loss', score: '3–5', date: 'Feb 21', duration: '14m', errorRate: 33, improvement: null },
  { id: 19, opponent: 'SarahM',        avatarKey: 'Witch',    result: 'win',  score: '5–1', date: 'Feb 20', duration: '8m',  errorRate: 8,  improvement: 6  },
  { id: 20, opponent: 'Felix_B',       avatarKey: 'Wizard',   result: 'win',  score: '5–4', date: 'Feb 19', duration: '21m', errorRate: 16, improvement: null },
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

/* ── Social media icons ──────────────────────────────────────── */

function SocialIconTikTok() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.89 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9a8.28 8.28 0 0 0 4.84 1.55V7.1a4.85 4.85 0 0 1-1.06-.41z"/></svg>;
}
function SocialIconTwitch() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
}
function SocialIconFacebook() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}
function SocialIconInstagram() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
}
function SocialIconX() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function SocialIconBSky() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>;
}

const SOCIALS = [
  { key: 'tiktok',    label: 'TikTok',    Icon: SocialIconTikTok,    baseUrl: 'https://tiktok.com/@',       placeholder: 'username' },
  { key: 'twitch',    label: 'Twitch',    Icon: SocialIconTwitch,    baseUrl: 'https://twitch.tv/',         placeholder: 'username' },
  { key: 'facebook',  label: 'Facebook',  Icon: SocialIconFacebook,  baseUrl: 'https://facebook.com/',      placeholder: 'username' },
  { key: 'instagram', label: 'Instagram', Icon: SocialIconInstagram, baseUrl: 'https://instagram.com/',     placeholder: 'username' },
  { key: 'x',         label: 'X',         Icon: SocialIconX,         baseUrl: 'https://x.com/',             placeholder: 'username' },
  { key: 'bluesky',   label: 'Bluesky',   Icon: SocialIconBSky,      baseUrl: 'https://bsky.app/profile/',  placeholder: 'handle' },
];

/** Extract username from a full URL or return as-is if already a username */
function extractUsername(social, value) {
  if (!value) return '';
  return value.replace(social.baseUrl, '').replace(/^@/, '').replace(/\/$/, '');
}

/** Build full URL from username */
function buildUrl(social, username) {
  if (!username) return '';
  return social.baseUrl + username;
}

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

function IconTrophy16() {
  return (
    <svg width="16" height="16" viewBox="0 0 60 60" fill="none">
      <path d="M38.76 10c2.07 0 3.76 1.7 3.68 3.77L42.38 15h3.87c2.04 0 3.84 1.69 3.68 3.89-.59 8.1-4.73 12.55-9.22 14.88-1.23.64-2.49 1.11-3.68 1.46C39.03 37.41 37.02 39 35.51 39.29V45h5c1.38 0 2.5 1.12 2.5 2.5S41.89 50 40.51 50h-21c-1.38 0-2.5-1.12-2.5-2.5S18.13 45 19.51 45h5v-5.71c-1.27-.61-2.86-1.74-4.38-3.85-1.44.37-3 .94-4.53 1.79-4.23-2.37-8.04-6.83-8.59-14.84C6.85 20.19 8.64 18.5 10.68 18.5H14.5L14.37 15c-.09-2.07 1.61-3.77 3.69-3.77h20.7z" fill="currentColor"/>
    </svg>
  );
}

function IconPencil({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBaseballCard({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={style}>
      <path d="M40.0405 10C43.3973 10 46.1185 12.7213 46.1187 16.0781V43.9219C46.1186 47.2787 43.3974 50 40.0405 50H19.9595C16.6027 49.9999 13.8814 47.2786 13.8813 43.9219V16.0781C13.8815 12.7214 16.6027 10.0001 19.9595 10H40.0405ZM19.0063 40.4404C18.5269 40.4405 18.1382 40.8291 18.1382 41.3086V41.7422C18.1382 42.2217 18.5269 42.6103 19.0063 42.6104H27.4771C27.9566 42.6103 28.3452 42.2217 28.3452 41.7422V41.3086C28.3452 40.8291 27.9566 40.4405 27.4771 40.4404H19.0063ZM19.0063 35.6641C18.527 35.6641 18.1384 36.0529 18.1382 36.5322V36.9668C18.1382 37.4463 18.5268 37.8349 19.0063 37.835H39.1558C39.6352 37.8348 40.0239 37.4462 40.0239 36.9668V36.5322C40.0237 36.0529 39.6351 35.6642 39.1558 35.6641H19.0063ZM21.6118 14.4873C19.6937 14.4873 18.1383 16.0418 18.1382 17.96V26.7207C18.1382 28.6389 19.6936 30.1943 21.6118 30.1943H38.3892C40.3074 30.1943 41.8628 28.6389 41.8628 26.7207V17.96C41.8627 16.0418 40.3073 14.4873 38.3892 14.4873H21.6118Z" fill="currentColor"/>
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
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0322 0.27774C22.2414 0.27774 24.0322 2.0686 24.0322 4.27774V15.7895H35.5449C37.7538 15.7896 39.5448 17.5806 39.5449 19.7895C39.5449 21.9985 37.7539 23.7893 35.5449 23.7895H24.0322V35.3022C24.0321 37.5112 22.2413 39.3022 20.0322 39.3022C17.8232 39.3021 16.0323 37.5112 16.0322 35.3022V23.7895H4.52051C2.31137 23.7895 0.520508 21.9986 0.520508 19.7895C0.520677 17.5805 2.31147 15.7895 4.52051 15.7895H16.0322V4.27774C16.0322 2.06866 17.8232 0.277831 20.0322 0.27774Z" />
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

function IconSettings() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
      <path opacity="0.4" d="M16.4686 20.0008C16.4686 20.931 16.838 21.8232 17.4958 22.4808C18.1537 23.1386 19.0456 23.5081 19.9758 23.5081C20.906 23.5081 21.7982 23.1386 22.456 22.4808C23.1137 21.8232 23.4833 20.931 23.4833 20.0008C23.4833 19.0706 23.1137 18.1784 22.456 17.5206C21.7982 16.863 20.906 16.4933 19.9758 16.4933C19.0456 16.4933 18.1537 16.863 17.4958 17.5206C16.838 18.1784 16.4686 19.0706 16.4686 20.0008Z" />
      <path d="M15.4979 1.875C15.7185 0.786765 16.6817 0 17.7994 0H22.1964C23.3141 0 24.2774 0.786765 24.498 1.875L25.5641 7.02206C26.6009 7.46324 27.5715 8.02941 28.4539 8.69853L33.4392 7.04412C34.498 6.69118 35.6598 7.13235 36.2186 8.10294L38.417 11.9118C38.9758 12.8824 38.7774 14.1029 37.9392 14.8456L34.02 18.331C34.0862 18.8751 34.1156 19.4339 34.1156 20C34.1156 20.5663 34.0788 21.1251 34.02 21.6692L37.9464 25.1618C38.7847 25.9045 38.9758 27.1324 38.4245 28.0957L36.2258 31.9045C35.667 32.8676 34.5052 33.3163 33.4464 32.9633L28.4611 31.3088C27.5715 31.978 26.6009 32.5369 25.5715 32.9853L24.5127 38.1251C24.2847 39.2206 23.3215 40 22.2111 40H17.8141C16.6964 40 15.7332 39.2133 15.5126 38.1251L14.4538 32.9853C13.417 32.5441 12.4538 31.978 11.5641 31.3088L6.55674 32.9633C5.49791 33.3163 4.33615 32.8751 3.77733 31.9045L1.5788 28.0957C1.01997 27.1251 1.2185 25.9045 2.05674 25.1618L5.98321 21.6692C5.91703 21.1251 5.88762 20.5663 5.88762 20C5.88762 19.4339 5.92438 18.8751 5.98321 18.331L2.05674 14.8382C1.2185 14.0956 1.02733 12.8676 1.5788 11.9044L3.77733 8.09559C4.33615 7.125 5.49791 6.68382 6.55674 7.03676L11.542 8.69118C12.4317 8.02206 13.4023 7.46324 14.4317 7.01471L15.4979 1.875ZM19.998 27.0588C20.9249 27.0559 21.8423 26.8704 22.6976 26.5131C23.5529 26.1557 24.3294 25.6333 24.9829 24.9757C25.6362 24.3182 26.1537 23.5384 26.5058 22.681C26.8578 21.8233 27.0376 20.9049 27.0347 19.978C27.0317 19.051 26.8464 18.1337 26.489 17.2784C26.1315 16.4229 25.6092 15.6465 24.9515 14.9931C24.2941 14.3396 23.5143 13.8221 22.6568 13.4701C21.7992 13.118 20.8807 12.9383 19.9539 12.9412C19.0268 12.9441 18.1096 13.1295 17.2543 13.4869C16.399 13.8444 15.6223 14.3667 14.9689 15.0243C14.3155 15.6818 13.798 16.4616 13.4459 17.319C13.0939 18.1767 12.9141 19.0951 12.917 20.0222C12.9199 20.949 13.1054 21.8665 13.4628 22.7218C13.8202 23.5771 14.3426 24.3535 15.0001 25.0069C15.6576 25.6604 16.4374 26.1778 17.2949 26.53C18.1525 26.882 19.0709 27.0618 19.998 27.0588Z" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0038 0C18.6547 0 17.5648 1.08994 17.5648 2.43902V2.68293C12.0008 3.81098 7.80871 8.73476 7.80871 14.6341V16.2881C7.80871 19.9543 6.55871 23.5137 4.27213 26.3796L3.52518 27.3095C3.13646 27.7896 2.93066 28.3841 2.93066 29.0015C2.93066 30.4954 4.14255 31.7073 5.63646 31.7073H34.3636C35.8575 31.7073 37.0694 30.4954 37.0694 29.0015C37.0694 28.3841 36.8636 27.7896 36.4749 27.3095L35.7279 26.3796C33.449 23.5137 32.199 19.9543 32.199 16.2881V14.6341C32.199 8.73476 28.0069 3.81098 22.4429 2.68293V2.43902C22.4429 1.08994 21.3529 0 20.0038 0Z"/>
      <path d="M14.386 34.386C14.386 35.8749 14.9775 37.3028 16.0303 38.3557C17.0832 39.4085 18.5111 40 20.0001 40C21.489 40 22.917 39.4085 23.9698 38.3557C25.0226 37.3028 25.6141 35.8749 25.6141 34.386H14.386Z"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Learn',         Icon: IconLearning },
  { label: 'My Profile',    Icon: IconProfileNav },
  { label: 'New Game',      Icon: IconNewGame },
  { label: 'Notifications', Icon: IconActivity, hasBadge: true },
  { label: 'Settings',      Icon: IconSettings },
];

function MobileNav({ onNavigate, hasUnread, activePage }) {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(({ label, Icon, hasBadge, page }) => (
        <button
          key={label}
          className={`mobile-nav__item${activePage === label ? ' mobile-nav__item--active' : ''}${hasBadge ? ' mobile-nav__item--has-badge' : ''}`}
          onClick={
            label === 'Learn' ? () => onNavigate?.('learn-hub')
            : label === 'My Profile' ? () => onNavigate?.('profile')
            : label === 'New Game' ? () => onNavigate?.('play')
            : label === 'Settings' ? () => onNavigate?.('settings')
            : undefined
          }
        >
          <Icon />
          {hasBadge && hasUnread && <span className="mobile-nav__badge" />}
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
    <div className="confetti">
      {CONFETTI_ANGLES.map((end, i) => (
        <div
          key={i}
          className="confetti__piece"
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
      className="overlay overlay--dark"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}
      onClick={handleDismiss}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <Confetti />
        <div className="celebration__badge-wrap">
          <div className="celebration__badge">
            <BadgeIconSvg type={badge.icon} size={52} color="var(--color-badge-icon-inner)" />
          </div>
        </div>
        <div className="celebration__category">{badge.category}</div>
        <div className="celebration__title">{badge.label}!</div>
        <div className="celebration__body">
          {idx < queue.length - 1
            ? `${queue.length - idx - 1} more badge${queue.length - idx - 1 > 1 ? 's' : ''} to celebrate!`
            : 'Keep playing to unlock more badges.'}
        </div>
        <button
          className="com-btn com-btn--primary com-btn--sm celebration__dismiss"
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

function HexOutline({ size = 64, dashed = false }) {
  const w = size;
  const h = size;
  const points = `${w/2},1 ${w-1},${h*0.25} ${w-1},${h*0.75} ${w/2},${h-1} 1,${h*0.75} 1,${h*0.25}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', top: 0, left: 0 }}>
      <polygon
        points={points}
        fill="none"
        stroke="var(--color-border-mid)"
        strokeWidth="2"
        strokeDasharray={dashed ? '5,4' : 'none'}
      />
    </svg>
  );
}

function BadgeItem({ threshold, state, icon }) {
  return (
    <div className="milestone" title={
      state === 'earned' ? `${threshold} ${icon === 'win' ? 'Wins' : icon === 'streak' ? 'Streak' : 'Games'} — Earned` :
      state === 'next'   ? `Next: ${threshold}` : `Locked: ${threshold}`
    }>
      <img
        src={badgePlaceholder}
        alt=""
        className={`milestone__placeholder${state !== 'earned' ? ' milestone__placeholder--unearned' : ''}`}
      />
      <span className={`milestone__label milestone__label--${state}`}>{threshold}</span>
    </div>
  );
}

/* ── Badge category section ──────────────────────────────────── */

function BadgeCategorySection({ title, thresholds, statValue, icon, isGated }) {
  const { earned, next, locked } = getBadgeState(thresholds, statValue);
  const remaining = next !== null ? next - statValue : null;
  const statWord = icon === 'win' ? 'wins' : icon === 'streak' ? 'streak' : 'games';

  return (
    <div className="milestone-category">
      <div className="milestone-category__header">
        <span className="milestone-category__name">{title}</span>
        {!isGated && remaining !== null && (
          <span className="milestone-category__hint">
            {`${remaining} more ${statWord} to unlock ${next} badge`}
          </span>
        )}
        {!isGated && remaining === null && earned.length > 0 && (
          <span className="milestone-category__hint" style={{ color: 'var(--color-status-success)' }}>
            All badges unlocked!
          </span>
        )}
      </div>
      <div className="milestone-category__grid">
        {earned.map(t  => <BadgeItem key={t} threshold={t} state="earned" icon={icon} />)}
        {next !== null && <BadgeItem threshold={next}  state="next"   icon={icon} />}
        {locked.slice(0, 6).map(t => <BadgeItem key={t} threshold={t} state="locked" icon={icon} />)}
        {locked.length > 6 && (
          <div className="milestone" style={{ opacity: 0.4 }}>
            <div className="milestone__icon milestone__icon--locked" style={{ fontSize: 13, fontFamily: fm, color: 'var(--color-muted)' }}>
              +{locked.length - 6}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Streak category section (circles with progress lines) ──── */

function StreakCategorySection({ title, thresholds, statValue, icon, isGated }) {
  const { earned, next, locked } = getBadgeState(thresholds, statValue);
  const remaining = next !== null ? next - statValue : null;
  const statWord = 'streak';
  const allItems = [
    ...earned.map(t => ({ threshold: t, state: 'earned' })),
    ...(next !== null ? [{ threshold: next, state: 'next' }] : []),
    ...locked.slice(0, 6).map(t => ({ threshold: t, state: 'locked' })),
  ];

  return (
    <div className="milestone-category">
      <div className="milestone-category__header">
        <span className="milestone-category__name">{title}</span>
        {!isGated && remaining !== null && (
          <span className="milestone-category__hint">
            {`${remaining} more ${statWord} to unlock ${next} badge`}
          </span>
        )}
        {!isGated && remaining === null && earned.length > 0 && (
          <span className="milestone-category__hint" style={{ color: 'var(--color-status-success)' }}>
            All badges unlocked!
          </span>
        )}
      </div>
      <div className="milestone-category__grid">
        {allItems.map((item) => (
          <BadgeItem key={item.threshold} threshold={item.threshold} state={item.state} icon={icon} />
        ))}
        {locked.length > 6 && (
          <div className="milestone" style={{ opacity: 0.4 }}>
            <img
              src={badgePlaceholder}
              alt=""
              className="milestone__placeholder milestone__placeholder--unearned"
            />
            <span className="milestone__label" style={{ fontSize: 13, fontFamily: fm, color: 'var(--color-muted)' }}>
              +{locked.length - 6}
            </span>
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
    <div className="gated" style={{ position: 'relative' }}>
      <div style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {children}
      </div>
      <div className="gated__overlay">
        <IconLock size={36} />
        <div className="gated__title">See your full stats</div>
        <div className="gated__desc">
          Create an account to track your stats, earn badges, and build your profile.
        </div>
        <button className="com-btn com-btn--primary com-btn--sm" style={{ pointerEvents: 'all' }}>
          Create Account
        </button>
      </div>
    </div>
  );
}

/* ── Friend relationship button ─────────────────────────────── */

const FRIEND_ADD_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
    <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
  </svg>
);
const FRIEND_PENDING_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const FRIEND_CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
    <polyline points="17 11 19 13 23 9"/>
  </svg>
);

function UnfriendModal({ username, onConfirm, onCancel }) {
  return (
    <div className="overlay overlay--top" onClick={onCancel}>
      <div className="modal modal--sm" data-section-id="gl-dropdown" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(220, 50, 50, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d43333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
            </svg>
          </div>
        </div>
        <div className="modal__title">Unfriend {username}</div>
        <div style={{
          fontSize: 14, color: 'var(--color-body)', lineHeight: 1.5,
          fontFamily: 'var(--font-body)',
        }}>
          Please confirm you want to remove {username} as your friend?
        </div>
        <div className="modal__footer" style={{ justifyContent: 'center' }}>
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onCancel}>Cancel</button>
          <button
            className="com-btn com-btn--sm"
            style={{ background: '#d43333', color: '#fff' }}
            onClick={onConfirm}
          >
            Unfriend
          </button>
        </div>
      </div>
    </div>
  );
}

function ChallengeModal({ username, onConfirm, onCancel }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="overlay overlay--top" onClick={onCancel}>
      <div className="bottom-sheet surface-muted" data-section-id="gl-dropdown" onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2 className="bottom-sheet__title">Challenge {username}</h2>
          <button className="popup-panel__close" onClick={onCancel}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bottom-sheet__body" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 14, color: 'var(--color-body)', lineHeight: 1.5,
            fontFamily: 'var(--font-body)',
          }}>
            Send a challenge request to {username}?
          </div>
        </div>
        <div className="bottom-sheet__footer">
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onCancel}>Cancel</button>
          <button
            className="com-btn com-btn--primary com-btn--sm"
            onClick={() => { setSent(true); setTimeout(() => onConfirm(), 1200); }}
            disabled={sent}
          >
            {sent ? 'Challenge Sent \u2713' : 'Send Challenge'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FriendButton({ status, username }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  if (status === 'Pending') {
    return (
      <button
        className="com-btn com-btn--outline com-btn--sm"
        style={{
          opacity: 0.6,
          cursor: 'default',
          borderColor: 'var(--prim-mono-300)',
          color: 'var(--prim-mono-500)',
        }}
      >
        {FRIEND_PENDING_ICON}
        Request Sent
      </button>
    );
  }

  if (status === 'Accept Request') {
    return (
      <button
        className="com-btn com-btn--sm"
        style={{
          background: 'rgba(35, 165, 126, 0.12)',
          color: 'var(--prim-mint-400)',
          border: '2px solid var(--prim-mint-400)',
        }}
      >
        {FRIEND_CHECK_ICON}
        Accept Request
      </button>
    );
  }

  if (status === 'Friends') {
    return (
      <>
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            className="com-btn com-btn--sm"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'rgba(35, 165, 126, 0.1)',
              color: 'var(--prim-mint-400)',
              border: '2px solid var(--prim-mint-400)',
            }}
          >
            {FRIEND_CHECK_ICON}
            Friends
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
              marginLeft: 2,
              transition: 'transform 0.15s',
              transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)',
            }}>
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="surface-inverse" style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              borderRadius: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
              padding: '4px 0',
              minWidth: 180,
              zIndex: 100,
              overflow: 'hidden',
            }}>
              <div
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
                  color: 'var(--color-heading)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Add to Favorites
              </div>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 10px' }} />
              <div
                onClick={() => { setMenuOpen(false); setShowUnfriendModal(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)',
                  color: '#d43333',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                  <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
                </svg>
                Unfriend
              </div>
            </div>
          )}
        </div>

        {showUnfriendModal && createPortal(
          <UnfriendModal
            username={username}
            onCancel={() => setShowUnfriendModal(false)}
            onConfirm={() => setShowUnfriendModal(false)}
          />,
          document.body,
        )}
      </>
    );
  }

  /* Default: Add Friend CTA */
  return (
    <button className="com-btn com-btn--primary com-btn--sm">
      {FRIEND_ADD_ICON}
      Add Friend
    </button>
  );
}

/* ── Match history section ───────────────────────────────────── */

function getErrorRateColor(rate) {
  if (rate <= 10) return 'var(--color-status-success)';
  if (rate <= 25) return 'var(--color-status-warning)';
  return 'var(--color-status-error)';
}

const MATCHES_PER_PAGE = 10;

const FRIEND_USERNAMES = new Set(MOCK_FRIENDS.map(f => f.username));

function MatchHistorySection({ history, isEmpty, onPlayerClick, isMvp }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);

  if (isEmpty) {
    return (
      <div className="empty-state">
        <IconGames size={40} color="var(--color-border-mid)" />
        <div className="empty-state__title">No matches yet</div>
        <div className="empty-state__desc">Play your first game to start building your match history.</div>
      </div>
    );
  }

  let filtered = searchQuery
    ? history.filter(m => m.opponent.toLowerCase().includes(searchQuery.toLowerCase()))
    : history;
  if (resultFilter === 'wins') filtered = filtered.filter(m => m.result === 'win');
  if (resultFilter === 'losses') filtered = filtered.filter(m => m.result === 'loss');
  if (resultFilter === 'friends') filtered = filtered.filter(m => FRIEND_USERNAMES.has(m.opponent));

  const totalPages = Math.max(1, Math.ceil(filtered.length / MATCHES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageItems = filtered.slice(safePage * MATCHES_PER_PAGE, (safePage + 1) * MATCHES_PER_PAGE);

  return (
    <>
      <div className="match-history__header" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div className="match-search" style={{ flex: 1 }}>
          <svg className="match-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="match-search__input"
            placeholder="Search opponents..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            style={{ width: '100%' }}
          />
        </div>
        <select
          value={resultFilter}
          onChange={e => { setResultFilter(e.target.value); setCurrentPage(0); }}
          style={{
            fontFamily: fm, fontSize: 13, fontWeight: 500,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-heading)',
            cursor: 'pointer',
            height: 38,
          }}
        >
          <option value="all">All Results</option>
          <option value="wins">Wins Only</option>
          <option value="losses">Losses Only</option>
          <option value="friends">Friends</option>
        </select>
      </div>
      <div className="match-history">
        {/* Table header */}
        <div className="match-history__table-header">
          <span className="match-history__th match-history__th--player">Player</span>
          <span className="match-history__th match-history__th--result">Result</span>
          <span className="match-history__th match-history__th--improvement">
            Improvement
            <span className="info-tip">
              <span className="info-tip__icon">i</span>
              <span className="info-tip__text">Your overall game improvement ranking based on error rate trends across recent matches.</span>
            </span>
          </span>
          <span className="match-history__th match-history__th--score">Score</span>
          <span className="match-history__th match-history__th--time">Time</span>
          <span className="match-history__th match-history__th--date">Date</span>
        </div>
        {pageItems.map(m => (
          <div key={m.id} className={`match-row match-row--${m.result}`}>
            {!isMvp && <Avatar
              src={getAvatarSrc(m.avatarKey)}
              alt={m.opponent}
              size="lg"
              clickable={!!onPlayerClick}
              onClick={() => onPlayerClick?.(m.opponent)}
            />}
            <span
              className={`match-row__name${onPlayerClick ? ' match-row__name--clickable' : ''}`}
              onClick={() => onPlayerClick?.(m.opponent)}
            >
              {FRIEND_USERNAMES.has(m.opponent) && (
                <span className="match-row__friend-pill">Friend</span>
              )}
              {m.opponent}
            </span>
            <span className={`match-row__result match-row__result--${m.result}`}>
              {m.result === 'win' ? 'Won' : 'Lost'}
            </span>
            {/* Error rate — hidden, kept for data preservation */}
            <span className="match-row__error-rate" style={{ display: 'none', color: getErrorRateColor(m.errorRate) }}>
              {m.errorRate}%
            </span>
            <span className="match-row__improvement">
              {m.improvement ? (
                <span className="match-row__improvement-value">
                  {m.improvement}%↑
                  <span className="info-tip info-tip--compact">
                    <span className="info-tip__icon">i</span>
                    <span className="info-tip__text">Your overall game improvement ranking based on error rate trends across recent matches.</span>
                  </span>
                </span>
              ) : '–'}
            </span>
            <span className="match-row__score">{m.score}</span>
            <span className="match-row__time">{m.duration}</span>
            <span className="match-row__date">{m.date}</span>
          </div>
        ))}
        {pageItems.length === 0 && (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontFamily: fm, fontSize: 13, color: 'var(--color-muted)' }}>
            No matches found
          </div>
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="match-history__pagination">
          <button
            className="com-btn com-btn--outline com-btn--sm"
            style={{ opacity: safePage === 0 ? 0.4 : 1, pointerEvents: safePage === 0 ? 'none' : 'auto' }}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ← Previous
          </button>
          <span className="match-history__page-info">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            className="com-btn com-btn--outline com-btn--sm"
            style={{ opacity: safePage >= totalPages - 1 ? 0.4 : 1, pointerEvents: safePage >= totalPages - 1 ? 'none' : 'auto' }}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

/* ── Trophy Case ─────────────────────────────────────────────── */

const INITIAL_TROPHY_CASE = [
  { category: 'win', threshold: 50 },
  { category: 'streak', threshold: 20 },
  { category: 'games', threshold: 100 },
];

function TrophyCaseSection({ selected, isOwn, onEdit }) {
  if (selected.length === 0 && !isOwn) return null;

  return (
    <>
      <div className="trophy-case__header">
        <h2 className="section-title">Trophy Case</h2>
        {isOwn && (
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onEdit}>
            <IconPencil size={14} />
            Edit Trophy Case
          </button>
        )}
      </div>
      <div className="trophy-case">
        {selected.length > 0 ? (
          selected.map((s) => (
            <div key={`${s.category}-${s.threshold}`} className="trophy-item">
              <div className="trophy-item__image-wrap">
                <img src={badgePlaceholder} alt="" className="trophy-item__image" />
                <div className="trophy-item__shine" />
              </div>
              <span className="trophy-item__label">
                {s.threshold} {s.category === 'win' ? 'Wins' : s.category === 'streak' ? 'Streak' : 'Games'}
              </span>
            </div>
          ))
        ) : (
          <div className="trophy-case__empty">
            Select up to 3 badges to showcase in your trophy case.
          </div>
        )}
      </div>
    </>
  );
}

function TrophyCaseEditor({ stats, selected, onSave, onClose }) {
  const [draft, setDraft] = useState(selected);
  const MAX = 3;

  const winState = getBadgeState(BADGE_THRESHOLDS.win, stats.wins);
  const streakState = getBadgeState(BADGE_THRESHOLDS.streak, stats.highestStreak);
  const gamesState = getBadgeState(BADGE_THRESHOLDS.games, stats.gamesPlayed);

  const categories = [
    { key: 'win',    title: 'Win Badges',          earned: winState.earned,    icon: 'win' },
    { key: 'streak', title: 'Streak Badges',       earned: streakState.earned, icon: 'streak' },
    { key: 'games',  title: 'Games Played Badges',  earned: gamesState.earned,  icon: 'games' },
  ];

  function isSelected(category, threshold) {
    return draft.some(s => s.category === category && s.threshold === threshold);
  }

  function toggle(category, threshold) {
    if (isSelected(category, threshold)) {
      setDraft(d => d.filter(s => !(s.category === category && s.threshold === threshold)));
    } else if (draft.length < MAX) {
      setDraft(d => [...d, { category, threshold }]);
    }
  }

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="trophy-editor surface-muted" onClick={e => e.stopPropagation()}>
        <div className="side-panel__header">
          <h2 className="side-panel__title">Edit Trophy Case</h2>
          <button className="side-panel__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Selected slots preview */}
        <div className="trophy-editor__slots">
          {Array.from({ length: MAX }, (_, i) => (
            <div key={i} className={`trophy-slot${draft[i] ? ' trophy-slot--filled' : ''}`}>
              {draft[i] ? (
                <>
                  <img src={badgePlaceholder} alt="" className="trophy-slot__image" />
                  <span className="trophy-slot__label">
                    {draft[i].threshold}
                  </span>
                </>
              ) : (
                <span className="trophy-slot__number">{i + 1}</span>
              )}
            </div>
          ))}
        </div>
        <div className="trophy-editor__count">{draft.length}/{MAX} selected</div>
        <div className="side-panel__body">
          {categories.map(cat => (
            <div key={cat.key} className="trophy-editor__category">
              <div className="milestone-category__name" style={{ marginBottom: 10 }}>{cat.title}</div>
              {cat.earned.length > 0 ? (
                <div className="trophy-editor__grid">
                  {cat.earned.map(t => {
                    const sel = isSelected(cat.key, t);
                    const full = draft.length >= MAX && !sel;
                    return (
                      <button
                        key={t}
                        className={`trophy-pick${sel ? ' trophy-pick--selected' : ''}${full ? ' trophy-pick--disabled' : ''}`}
                        onClick={() => toggle(cat.key, t)}
                      >
                        <img src={badgePlaceholder} alt="" className="trophy-pick__image" />
                        <span className="trophy-pick__label">{t}</span>
                        {sel && (
                          <div className="trophy-pick__check">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="12" fill="var(--color-accent, #4caf50)" />
                              <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontFamily: fm, fontSize: 13, color: 'var(--color-muted)', padding: '8px 0' }}>
                  No badges earned yet in this category.
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="side-panel__footer">
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onClose}>Cancel</button>
          <button className="com-btn com-btn--primary com-btn--sm" onClick={() => { onSave(draft); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── Social Links Modal ──────────────────────────────────────── */

function SocialLinksModal({ socialLinks, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => {
    const d = {};
    SOCIALS.forEach(s => { d[s.key] = extractUsername(s, socialLinks[s.key]); });
    return d;
  });

  function handleSave() {
    const cleaned = {};
    SOCIALS.forEach(s => {
      const username = draft[s.key]?.trim();
      if (username) cleaned[s.key] = buildUrl(s, username);
    });
    onSave(cleaned);
  }

  return (
    <div className="overlay overlay--top" onClick={onCancel}>
      <div className="modal modal--md" onClick={e => e.stopPropagation()}>
        <div className="modal__title">Social Profiles</div>
        <div className="social-editor">
          {SOCIALS.map(s => (
            <div key={s.key} className="social-editor__row">
              <div className="social-editor__label">
                <s.Icon />
                <span>{s.label}</span>
              </div>
              <div className="social-editor__input-wrap">
                <span className="social-editor__input-prefix">{s.baseUrl}</span>
                <input
                  className="social-editor__input"
                  value={draft[s.key]}
                  onChange={e => setDraft(prev => ({ ...prev, [s.key]: e.target.value }))}
                  placeholder={s.placeholder}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="modal__footer">
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onCancel}>Cancel</button>
          <button className="com-btn com-btn--primary com-btn--sm" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── Settings Panel ─────────────────────────────────────────── */

function SettingsPanel({
  displayName, bio, socialLinks, country, avatarEdit,
  onSaveAll, onChangeAvatar, onClose,
}) {
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio || '');
  const [draftCountry, setDraftCountry] = useState(country);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [draftSocials, setDraftSocials] = useState(() => {
    const d = {};
    SOCIALS.forEach(s => { d[s.key] = extractUsername(s, socialLinks[s.key]); });
    return d;
  });

  function handleSave() {
    const cleanedSocials = {};
    SOCIALS.forEach(s => {
      const username = draftSocials[s.key]?.trim();
      if (username) cleanedSocials[s.key] = buildUrl(s, username);
    });
    onSaveAll({ displayName: draftName, bio: draftBio, socialLinks: cleanedSocials, country: draftCountry });
  }

  const countryFlag = draftCountry ? FLAG_LIST.find(f => f.key === draftCountry) : null;

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="popup-panel surface-muted" data-section-id="pp-settings" onClick={e => e.stopPropagation()}>
        <div className="popup-panel__header">
          <h2 className="popup-panel__title">Settings</h2>
          <button className="popup-panel__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="popup-panel__body">
          {/* Username */}
          <div className="settings-row">
            <div className="settings-row__label">Username</div>
            <input
              className="profile-header__name-input"
              style={{ fontSize: 16, marginBottom: 0 }}
              value={draftName}
              onChange={e => { if (e.target.value.length <= 24) setDraftName(e.target.value); }}
              minLength={4}
              maxLength={24}
            />
            {draftName.length < 4 && (
              <div style={{ fontFamily: fm, fontSize: 11, color: 'var(--color-status-error)', marginTop: 4 }}>
                Username must be at least 4 characters
              </div>
            )}
            {draftName.length >= 4 && (
              <div style={{ fontFamily: fm, fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>
                {`${draftName.length}/24 characters`}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="settings-row">
            <div className="settings-row__label">Intro / Bio</div>
            <input
              type="text"
              className="profile-header__bio-input"
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              placeholder="Write something about yourself..."
              maxLength={60}
            />
            <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{draftBio.length}/60</span>
          </div>

          {/* Social Links */}
          <div className="settings-row">
            <div className="settings-row__label">Social Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SOCIALS.map(s => (
                <div key={s.key} className="social-editor__row" style={{ gap: 8 }}>
                  <div className="social-editor__label" style={{ minWidth: 90 }}>
                    <s.Icon />
                    <span style={{ fontSize: 12 }}>{s.label}</span>
                  </div>
                  <div className="social-editor__input-wrap">
                    <input
                      className="social-editor__input"
                      value={draftSocials[s.key]}
                      onChange={e => setDraftSocials(prev => ({ ...prev, [s.key]: e.target.value }))}
                      placeholder={s.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className="settings-row" style={{ position: 'relative' }}>
            <div className="settings-row__label">Country</div>
            <button className="settings-row__picker-btn" onClick={() => setShowCountryDropdown(v => !v)}>
              {countryFlag ? (
                <>
                  <img src={countryFlag.src} alt={countryFlag.label} className="flag-picker__inline" />
                  <span>{countryFlag.label}</span>
                </>
              ) : (
                <span style={{ color: 'var(--color-muted)' }}>Select country...</span>
              )}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {showCountryDropdown && (
              <CountryFlagDropdown
                currentCountry={draftCountry}
                onSelect={(key) => { setDraftCountry(key); setShowCountryDropdown(false); }}
                onClose={() => setShowCountryDropdown(false)}
              />
            )}
          </div>

          {/* Avatar */}
          <div className="settings-row">
            <div className="settings-row__label">Avatar</div>
            <button className="settings-row__picker-btn" onClick={() => onChangeAvatar()}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                border: '2px solid var(--color-border)', flexShrink: 0,
                background: 'var(--color-avatar-bg)',
              }}>
                {avatarEdit?.cropped && <img src={avatarEdit.cropped} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span>{avatarEdit?.type === 'preset' ? avatarEdit.key : avatarEdit?.type === 'custom' ? 'Custom avatar' : 'Default'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 0' }} />

          {/* Email */}
          <div className="settings-row">
            <div className="settings-row__label">Email</div>
            <div className="settings-row__value">
              <span>user@example.com</span>
              <button className="settings-row__change-btn">Change</button>
            </div>
          </div>

          {/* Password */}
          <div className="settings-row">
            <div className="settings-row__label">Password</div>
            <div className="settings-row__value">
              <span>••••••••</span>
              <button className="settings-row__change-btn">Change</button>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="popup-panel__footer">
          <button className="com-btn com-btn--outline com-btn--sm" onClick={onClose}>Cancel</button>
          <button
            className="com-btn com-btn--primary com-btn--sm"
            style={{ opacity: draftName.length < 4 ? 0.5 : 1 }}
            onClick={handleSave}
            disabled={draftName.length < 4}
          >Save Changes</button>
        </div>
      </div>
    </div>
  );
}

/* ── Country Flag Dropdown ──────────────────────────────────── */

function CountryFlagDropdown({ currentCountry, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const listRef = React.useRef(null);
  const filtered = search
    ? FLAG_LIST.filter(f => f.label.toLowerCase().includes(search.toLowerCase()))
    : FLAG_LIST;

  // Close on outside click
  const wrapRef = React.useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="flag-picker__dropdown" ref={wrapRef}>
      <div className="flag-picker__search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          placeholder="Search countries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flag-picker__list" ref={listRef}>
        {currentCountry && (
          <button className="flag-picker__item flag-picker__item--remove" onClick={() => onSelect(null)}>
            <span style={{ fontSize: 12 }}>Remove flag</span>
          </button>
        )}
        {filtered.map(f => (
          <button
            key={f.key}
            className={`flag-picker__item${currentCountry === f.key ? ' flag-picker__item--selected' : ''}`}
            onClick={() => onSelect(f.key)}
          >
            <img src={f.src} alt={f.label} />
            <span>{f.label}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-muted)', fontFamily: fm }}>
            No countries found
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Minimal QR Code generator (Version 2, ~25×25 modules) ──── */

function generateQR(text) {
  // Encode text into a deterministic bit pattern for visual QR effect
  // This creates a visually authentic QR code pattern with finder patterns
  const size = 25;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (3 corners)
  function drawFinder(ox, oy) {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        grid[oy + y][ox + x] = ring !== 1;
      }
  }
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 7; i < size - 7; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Alignment pattern (center-ish)
  const ac = 18;
  for (let y = -2; y <= 2; y++)
    for (let x = -2; x <= 2; x++) {
      const ring = Math.max(Math.abs(x), Math.abs(y));
      if (ac + y >= 0 && ac + y < size && ac + x >= 0 && ac + x < size)
        grid[ac + y][ac + x] = ring !== 1;
    }

  // Fill data area with hash of text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  let seed = Math.abs(hash);
  function nextRand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed;
  }

  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      // Skip finder, timing, alignment zones
      const inFinder = (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
      const inTiming = x === 6 || y === 6;
      const inAlign = Math.abs(x - ac) <= 2 && Math.abs(y - ac) <= 2;
      if (inFinder || inTiming || inAlign) continue;
      grid[y][x] = nextRand() % 3 !== 0; // ~66% fill for realistic density
    }

  return grid;
}

function QRCodeSvg({ text, size = 100 }) {
  const grid = React.useMemo(() => generateQR(text), [text]);
  const modules = grid.length;
  const cellSize = size / modules;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

/* ── Player Card Modal ──────────────────────────────────────── */

function PlayerCardModal({ player, coverImg, avatarImg: avatarSrc, onClose }) {
  const cardRef = React.useRef(null);
  const username = player.displayName.toLowerCase();
  const profileUrl = `backgammon.com/player/${username}`;
  const challengeUrl = `https://backgammon.com/challenge/${username}`;

  const CARD_STATS = [
    { label: 'Wins', value: player.stats.wins },
    { label: 'Games', value: player.stats.gamesPlayed },
    { label: 'Streak', value: player.stats.currentStreak },
    { label: 'Best', value: player.stats.highestStreak },
  ];

  function handleDownload() {
    const S = 2; // retina scale
    const W = 380;
    const coverH = 110;
    const avSize = 64;
    const avBorder = 3;
    const qrPx = 100;
    const nameH = 30;
    const dateH = 18;
    const statsH = 56;
    const urlH = 24;
    const qrLabelH = 16;
    const logoH = 48; // Backgammon.com logo at bottom
    const pad = 24;
    const H = coverH + avSize / 2 + 16 + nameH + dateH + 12 + statsH + 16 + urlH + 20 + qrPx + qrLabelH + 16 + logoH + pad;

    // Font families matching the site tokens
    const fontHeading = "'Raleway', sans-serif";
    const fontBody = "'Inter', sans-serif";

    // Pre-load images before drawing
    function loadImg(src) {
      return new Promise(resolve => {
        if (!src) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }

    Promise.all([loadImg(coverImg), loadImg(avatarSrc)]).then(([coverLoaded, avatarLoaded]) => {
      const canvas = document.createElement('canvas');
      canvas.width = W * S;
      canvas.height = H * S;
      const ctx = canvas.getContext('2d');
      ctx.scale(S, S);

      // Rounded rect helper
      function roundedRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      // Background
      ctx.fillStyle = '#ffffff';
      roundedRect(0, 0, W, H, 16);
      ctx.fill();
      ctx.save();
      roundedRect(0, 0, W, H, 16);
      ctx.clip();

      // Cover
      if (coverLoaded) {
        const imgRatio = coverLoaded.width / coverLoaded.height;
        const cardRatio = W / coverH;
        let sx = 0, sy = 0, sw = coverLoaded.width, sh = coverLoaded.height;
        if (imgRatio > cardRatio) {
          sw = coverLoaded.height * cardRatio;
          sx = (coverLoaded.width - sw) / 2;
        } else {
          sh = coverLoaded.width / cardRatio;
          sy = (coverLoaded.height - sh) * 0.6;
        }
        ctx.drawImage(coverLoaded, sx, sy, sw, sh, 0, 0, W, coverH);
      } else {
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, W, coverH);
      }

      // Avatar background circle (white border)
      const avX = (W - avSize) / 2;
      const avY = coverH - avSize / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2 + avBorder, 0, Math.PI * 2);
      ctx.fill();

      // Avatar image (clipped circle)
      if (avatarLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarLoaded, avX, avY, avSize, avSize);
        ctx.restore();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX + avSize / 2, avY + avSize / 2, avSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#cccccc';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 24px ${fontHeading}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.displayName[0].toUpperCase(), avX + avSize / 2, avY + avSize / 2);
        ctx.restore();
      }

      // Name
      let curY = coverH + avSize / 2 + 16;
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold 22px ${fontHeading}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(player.displayName, W / 2, curY);
      curY += nameH;

      // Join date
      ctx.fillStyle = '#888888';
      ctx.font = `12px ${fontBody}`;
      ctx.fillText(player.joinDate, W / 2, curY);
      curY += dateH + 12;

      // Stats divider line (top)
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(W, curY);
      ctx.stroke();
      curY += 8;

      // Stats — use alphabetic baseline for consistent number alignment
      const statW = W / 4;
      const numBaseline = curY + 22; // fixed alphabetic baseline for all numbers
      const labelBaseline = curY + 40; // fixed baseline for labels
      if (ctx.fontVariantNumeric !== undefined) ctx.fontVariantNumeric = 'lining-nums';
      CARD_STATS.forEach((s, i) => {
        const cx = statW * i + statW / 2;
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `bold 22px ${fontHeading}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(s.value.toLocaleString(), cx, numBaseline);
        ctx.fillStyle = '#888888';
        ctx.font = `600 9px ${fontBody}`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(s.label.toUpperCase(), cx, labelBaseline);
        if (i < CARD_STATS.length - 1) {
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(statW * (i + 1), curY);
          ctx.lineTo(statW * (i + 1), curY + 42);
          ctx.stroke();
        }
      });
      curY += statsH;

      // Stats divider line (bottom)
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(W, curY);
      ctx.stroke();
      curY += 16;

      // Profile URL
      ctx.fillStyle = '#aaaaaa';
      ctx.font = `12px ${fontBody}`;
      ctx.textBaseline = 'top';
      ctx.fillText(profileUrl, W / 2, curY);
      curY += urlH + 20;

      // QR code
      const qrGrid = generateQR(challengeUrl);
      const qrX = (W - qrPx) / 2;
      const qrCell = qrPx / qrGrid.length;
      ctx.fillStyle = '#000000';
      qrGrid.forEach((row, gy) => {
        row.forEach((cell, gx) => {
          if (cell) ctx.fillRect(qrX + gx * qrCell, curY + gy * qrCell, qrCell, qrCell);
        });
      });
      curY += qrPx;

      // QR label
      ctx.fillStyle = '#aaaaaa';
      ctx.font = `10px ${fontBody}`;
      ctx.fillText('Scan to challenge', W / 2, curY + 4);
      curY += qrLabelH + 16;

      // Backgammon.com logo
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold 20px ${fontHeading}`;
      const logoText = 'Backgammon';
      const logoMetrics = ctx.measureText(logoText);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = `bold 13px ${fontHeading}`;
      const dotComMetrics = ctx.measureText('.com');
      const totalLogoW = logoMetrics.width + dotComMetrics.width;
      const logoStartX = (W - totalLogoW) / 2;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold 20px ${fontHeading}`;
      ctx.fillText(logoText, logoStartX, curY);
      ctx.fillStyle = 'rgba(26,26,26,0.35)';
      ctx.font = `bold 13px ${fontHeading}`;
      ctx.fillText('.com', logoStartX + logoMetrics.width, curY + 6);

      ctx.restore();

      // Trigger download
      const a = document.createElement('a');
      a.download = `${player.displayName}-player-card.png`;
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="player-card" onClick={e => e.stopPropagation()} ref={cardRef}>
        <img src={coverImg} alt="" className="player-card__cover" crossOrigin="anonymous" />
        <div className="player-card__avatar-wrap">
          <div className="player-card__avatar">
            {avatarSrc
              ? <img src={avatarSrc} alt={player.displayName} crossOrigin="anonymous" />
              : <div className="player-card__avatar-fallback">{player.displayName[0].toUpperCase()}</div>
            }
          </div>
        </div>
        <div className="player-card__name">{player.displayName}</div>
        <div className="player-card__date">{player.joinDate}</div>
        <div className="player-card__stats">
          {CARD_STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="player-card__stat">
                <div className="player-card__stat-number">{s.value.toLocaleString()}</div>
                <div className="player-card__stat-label">{s.label}</div>
              </div>
              {i < CARD_STATS.length - 1 && <div className="player-card__stat-divider" />}
            </React.Fragment>
          ))}
        </div>
        <div className="player-card__url">{profileUrl}</div>
        <div className="player-card__qr">
          <QRCodeSvg text={challengeUrl} size={100} />
          <span className="player-card__qr-label">Scan to challenge</span>
        </div>
        <div className="player-card__logo">
          <span className="player-card__logo-text">Backgammon</span>
          <span className="player-card__logo-dot">.com</span>
        </div>
        <button className="com-btn com-btn--primary com-btn--sm player-card__download" onClick={handleDownload}>
          Download Player Card
        </button>
      </div>
    </div>
  );
}

/* ── Image Crop Modal ────────────────────────────────────────── */

function ImageCropModal({ src, aspectRatio, circular, initialCropParams, onSave, onCancel }) {
  const VIEWPORT_SIZE = circular ? 320 : 640;
  const viewportW = VIEWPORT_SIZE;
  const viewportH = circular ? VIEWPORT_SIZE : Math.round(VIEWPORT_SIZE / aspectRatio);

  const imgRef = React.useRef(null);
  const viewportRef = React.useRef(null);
  const [imgNatural, setImgNatural] = useState(null);
  const [scale, setScale] = useState(initialCropParams?.scale ?? 1);
  const [pos, setPos] = useState({ x: initialCropParams?.x ?? 0, y: initialCropParams?.y ?? 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = React.useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const fileInputRef = React.useRef(null);
  const [replaceSrc, setReplaceSrc] = useState(null);
  const activeSrc = replaceSrc || src;

  function onImgLoad(e) {
    const { naturalWidth, naturalHeight } = e.target;
    setImgNatural({ w: naturalWidth, h: naturalHeight });
    if (!initialCropParams || replaceSrc) {
      // Fit image to cover viewport
      const scaleW = viewportW / naturalWidth;
      const scaleH = viewportH / naturalHeight;
      const fitScale = Math.max(scaleW, scaleH);
      setScale(fitScale);
      setPos({
        x: (viewportW - naturalWidth * fitScale) / 2,
        y: (viewportH - naturalHeight * fitScale) / 2,
      });
    }
  }

  function clampPos(x, y, s) {
    if (!imgNatural) return { x, y };
    const imgW = imgNatural.w * s;
    const imgH = imgNatural.h * s;
    const cx = Math.min(0, Math.max(viewportW - imgW, x));
    const cy = Math.min(0, Math.max(viewportH - imgH, y));
    return { x: cx, y: cy };
  }

  function getMinScale() {
    if (!imgNatural) return 0.1;
    return Math.max(viewportW / imgNatural.w, viewportH / imgNatural.h);
  }

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const clamped = clampPos(dragStart.current.posX + dx, dragStart.current.posY + dy, scale);
    setPos(clamped);
  }

  function handlePointerUp() {
    setDragging(false);
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.max(getMinScale(), Math.min(5, scale + delta));
    // Zoom toward center of viewport
    const cx = viewportW / 2;
    const cy = viewportH / 2;
    const newX = cx - (cx - pos.x) * (newScale / scale);
    const newY = cy - (cy - pos.y) * (newScale / scale);
    const clamped = clampPos(newX, newY, newScale);
    setScale(newScale);
    setPos(clamped);
  }

  function handleScaleSlider(e) {
    const newScale = parseFloat(e.target.value);
    const cx = viewportW / 2;
    const cy = viewportH / 2;
    const newX = cx - (cx - pos.x) * (newScale / scale);
    const newY = cy - (cy - pos.y) * (newScale / scale);
    const clamped = clampPos(newX, newY, newScale);
    setScale(newScale);
    setPos(clamped);
  }

  function handleSave() {
    if (!imgNatural) return;
    const canvas = document.createElement('canvas');
    const outputW = circular ? 400 : 800;
    const outputH = circular ? 400 : Math.round(800 / aspectRatio);
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext('2d');

    if (circular) {
      ctx.beginPath();
      ctx.arc(outputW / 2, outputH / 2, outputW / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const renderScale = outputW / viewportW;
    const sx = pos.x * renderScale;
    const sy = pos.y * renderScale;
    const sw = imgNatural.w * scale * renderScale;
    const sh = imgNatural.h * scale * renderScale;

    ctx.drawImage(imgRef.current, sx, sy, sw, sh);

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, { x: pos.x, y: pos.y, scale });
  }

  function handleReplace(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReplaceSrc(reader.result);
      setImgNatural(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const minScale = getMinScale();
  const maxScale = Math.max(minScale * 4, 3);

  return (
    <div className="overlay overlay--top" onClick={onCancel}>
      <div className={`modal modal--md${!circular ? ' modal--wide' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal__title">
          {circular ? 'Crop Avatar' : 'Crop Cover Image'}
        </div>

        <div
          ref={viewportRef}
          className={`image-crop${circular ? ' image-crop--circular' : ''}`}
          style={{ width: viewportW, height: viewportH, margin: '0 auto', borderRadius: circular ? '50%' : 12 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          <img
            ref={imgRef}
            src={activeSrc}
            onLoad={onImgLoad}
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            draggable={false}
          />
        </div>

        <div className="image-crop__controls">
          <label>Zoom</label>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={0.01}
            value={scale}
            onChange={handleScaleSlider}
          />
        </div>

        <div className="image-crop__actions">
          <div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReplace} />
            <button className="com-btn com-btn--outline com-btn--sm" onClick={() => fileInputRef.current?.click()}>
              Replace image
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="com-btn com-btn--outline com-btn--sm" onClick={onCancel}>Cancel</button>
            <button className="com-btn com-btn--primary com-btn--sm" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Avatar Selection Modal ──────────────────────────────────── */

function AvatarModal({ currentAvatar, onSelectPreset, onCustomUpload, onEditCurrent, onClose }) {
  const [tab, setTab] = useState('select');
  const [pendingPreset, setPendingPreset] = useState(null);
  const fileRef = React.useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCustomUpload(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const currentPresetKey = currentAvatar?.type === 'preset' ? currentAvatar.key : null;
  const selectedKey = pendingPreset ? pendingPreset.key : currentPresetKey;
  const hasPresetChange = pendingPreset && pendingPreset.key !== currentPresetKey;
  const hasCustomAvatar = currentAvatar?.type === 'custom' && currentAvatar.cropped;

  return (
    <div className="overlay overlay--top" onClick={onClose}>
      <div className="modal modal--md" onClick={e => e.stopPropagation()}>
        <div className="modal__title">Choose Avatar</div>
        <div className="avatar-picker__tabs">
          <button
            className={`avatar-picker__tab${tab === 'select' ? ' avatar-picker__tab--active' : ''}`}
            onClick={() => setTab('select')}
          >Select</button>
          <button
            className={`avatar-picker__tab${tab === 'custom' ? ' avatar-picker__tab--active' : ''}`}
            onClick={() => setTab('custom')}
          >Custom</button>
        </div>
        {tab === 'select' ? (
          <>
            <div className="avatar-picker__grid">
              {PRESET_AVATARS.map(p => (
                <button
                  key={p.key}
                  className={`avatar-picker__item${selectedKey === p.key ? ' avatar-picker__item--selected' : ''}`}
                  onClick={() => setPendingPreset(p)}
                  title={p.key}
                >
                  <img src={p.src} alt={p.key} />
                  {selectedKey === p.key && (
                    <div className="avatar-picker__check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="var(--color-accent, #4caf50)" />
                        <path d="M7 12.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="com-btn com-btn--outline com-btn--sm" onClick={onClose}>Cancel</button>
              <button
                className="com-btn com-btn--primary com-btn--sm"
                style={{ opacity: hasPresetChange ? 1 : 0.5, pointerEvents: hasPresetChange ? 'auto' : 'none' }}
                onClick={() => { if (pendingPreset) onSelectPreset(pendingPreset); }}
              >Save</button>
            </div>
          </>
        ) : (
          <div className="avatar-picker__custom">
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
            <div className="avatar-picker__preview">
              {currentAvatar?.cropped
                ? <img src={currentAvatar.cropped} alt="Current avatar" />
                : <div className="avatar-picker__empty">No custom avatar</div>
              }
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {hasCustomAvatar && (
                <button className="com-btn com-btn--primary com-btn--sm" onClick={() => onEditCurrent()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              )}
              <button className="com-btn com-btn--outline com-btn--sm" onClick={() => fileRef.current?.click()}>
                {hasCustomAvatar ? 'Upload New' : 'Upload Avatar'}
              </button>
              <button className="com-btn com-btn--outline com-btn--sm" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Friends tab ─────────────────────────────────────────────── */

function FriendsTab({ friendsView: dmeView, fbDiscovery }) {
  const [localView, setLocalView] = useState(dmeView);
  const [friendSearch, setFriendSearch] = useState('');
  useEffect(() => { setLocalView(dmeView); }, [dmeView]);
  const friendsView = localView;

  return (
    <div className="pp-friends">
      {/* Search bar */}
      <div className="pp-friends-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="pp-friends-search__input"
          placeholder="Search friends or players..."
          value={friendSearch}
          onChange={e => setFriendSearch(e.target.value)}
        />
      </div>

      {/* FB Discovery card */}
      {fbDiscovery === 'Matches Found' && (
        <div className="pp-fb-card">
          <div className="pp-fb-card__header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>{MOCK_FB_FRIENDS.length} Facebook friends found on Backgammon.com!</span>
          </div>
          <div className="pp-fb-card__list">
            {MOCK_FB_FRIENDS.map(f => (
              <div key={f.id} className="pp-friend-row">
                <Avatar src={getAvatarSrc(f.avatar)} alt={f.username} size="lg" />
                <div className="pp-friend-row__info">
                  <span className="pp-friend-row__name">{f.username}</span>
                  <span className="pp-friend-row__meta">{f.fbName} · {f.rating}</span>
                </div>
                <button className="friend-btn friend-btn--add-friend">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {fbDiscovery === 'Zero Matches' && (
        <div className="pp-fb-card pp-fb-card--empty">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>None of your Facebook friends are on Backgammon.com yet. Invite them to play!</span>
          <button className="com-btn com-btn--outline com-btn--sm">Invite Friends</button>
        </div>
      )}

      {/* Content based on sub-view */}
      {friendsView === 'My Friends' && (() => {
        const filteredFriends = friendSearch
          ? MOCK_FRIENDS.filter(f => f.username.toLowerCase().includes(friendSearch.toLowerCase()))
          : MOCK_FRIENDS;
        return (
          <div className="pp-friends-list">
            {filteredFriends.map(f => (
              <div key={f.id} className="pp-friend-row">
                <Avatar src={getAvatarSrc(f.avatar)} alt={f.username} size="lg" online={f.online} clickable />
                <div className="pp-friend-row__info">
                  <span className="pp-friend-row__name" style={{ cursor: 'pointer' }}>{f.username}</span>
                </div>
                <div className="pp-friend-row__actions">
                  <button className="com-btn com-btn--primary com-btn--sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <span className="pp-friend-btn-label">Challenge</span>
                  </button>
                  <button className="com-btn com-btn--outline com-btn--sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    <span className="pp-friend-btn-label">Unfriend</span>
                  </button>
                </div>
              </div>
            ))}
            {filteredFriends.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: 13, color: 'var(--color-muted)', fontFamily: 'var(--font-body)' }}>
                No results found
              </div>
            )}
          </div>
        );
      })()}

      {friendsView === 'Search Results' && (
        <div className="pp-friends-list">
          {MOCK_SEARCH_RESULTS.friends.length > 0 && (
            <>
              <div className="pp-friends-list__title">Friends</div>
              {MOCK_SEARCH_RESULTS.friends.map(f => (
                <div key={f.id} className="pp-friend-row">
                  <Avatar src={getAvatarSrc(f.avatar)} alt={f.username} size="lg" online={f.online} clickable />
                  <div className="pp-friend-row__info">
                    <span className="pp-friend-row__name" style={{ cursor: 'pointer' }}>{f.username}</span>
                  </div>
                  <button className="friend-btn friend-btn--friends">Friends</button>
                </div>
              ))}
            </>
          )}
          {MOCK_SEARCH_RESULTS.players.length > 0 && (
            <>
              <div className="pp-friends-list__title">Players</div>
              {MOCK_SEARCH_RESULTS.players.map(f => (
                <div key={f.id} className="pp-friend-row">
                  <Avatar src={getAvatarSrc(f.avatar)} alt={f.username} size="lg" online={f.online} clickable />
                  <div className="pp-friend-row__info">
                    <span className="pp-friend-row__name" style={{ cursor: 'pointer' }}>{f.username}</span>
                  </div>
                  <button className="friend-btn friend-btn--add-friend">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Add
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {friendsView === 'Empty - No Friends' && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-mid)" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          <div className="empty-state__title">No friends yet</div>
          <div className="empty-state__desc">Search for players to add them as friends, or connect Facebook to find people you know.</div>
          <button className="com-btn com-btn--primary com-btn--sm">Connect Facebook</button>
        </div>
      )}

      {friendsView === 'Empty - No Results' && (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-border-mid)" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <div className="empty-state__title">No players found</div>
          <div className="empty-state__desc">Try a different search term or check the spelling.</div>
        </div>
      )}
    </div>
  );
}

/* ── Main ProfilePage ────────────────────────────────────────── */

export default function ProfilePage({ onNavigate }) {
  const viewType   = useDMEState('profile.viewType', 'Own - Established');
  const dmeCelebration = useDMEState('profile.celebration', false);
  const isMvp = useDMEState('profile.mvp', true);
  const isFavorited = useDMEState('profile.favorited', false);
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');
  const dmeTab = useDMEState('profile.tab', 'Game History');
  const [localTab, setLocalTab] = useState(() => {
    const intent = sessionStorage.getItem('profile-tab-intent');
    if (intent) { sessionStorage.removeItem('profile-tab-intent'); return intent; }
    return dmeTab;
  });
  useEffect(() => { setLocalTab(dmeTab); }, [dmeTab]);
  useEffect(() => {
    const intent = sessionStorage.getItem('profile-tab-intent');
    if (intent) { sessionStorage.removeItem('profile-tab-intent'); setLocalTab(intent); }
  });
  const activeTab = localTab;
  const friendsView = useDMEState('profile.friendsView', 'My Friends');
  const friendStatus = useDMEState('profile.friendStatus', 'Add Friend');
  const fbDiscovery = useDMEState('profile.fbDiscovery', 'None');
  const onlineStatus = useDMEState('profile.onlineStatus', 'Online');

  /* Local view override — for navigating between profiles via match history */
  const [localViewOverride, setLocalViewOverride] = useState(null);
  useEffect(() => { setLocalViewOverride(null); }, [viewType]);
  const effectiveViewType = localViewOverride || viewType;

  /* Edit mode state */
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savedName, setSavedName] = useState(profileData.displayName);
  const [savedBio, setSavedBio] = useState(profileData.bio);

  /* Image upload state */
  const initAvatar = (() => {
    if (profileData.avatarPreset) {
      const preset = PRESET_AVATARS.find(p => p.key === profileData.avatarPreset);
      if (preset) return { type: 'preset', key: preset.key, cropped: preset.src };
    }
    if (profileData.avatar) return { type: 'custom', original: profileData.avatar, cropParams: null, cropped: profileData.avatar };
    return null;
  })();
  const [avatarEdit, setAvatarEdit] = useState(initAvatar);
  const [coverEdit, setCoverEdit] = useState(
    profileData.coverImage ? { original: profileData.coverImage, cropParams: null, cropped: profileData.coverImage } : null
  );
  const [cropModal, setCropModal] = useState(null); // { src, aspectRatio, circular, target }

  /* Local celebration state — shown on toggle or manual trigger */
  const [celebrating, setCelebrating] = useState(false);
  const [prevDmeCelebration, setPrevDmeCelebration] = useState(dmeCelebration);
  const [shareLabel, setShareLabel] = useState('Share Profile');
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  /* Avatar modal state */
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  /* Social links state */
  const [socialLinks, setSocialLinks] = useState(profileData.socialLinks || {});
  const [showSocialModal, setShowSocialModal] = useState(false);

  /* Country flag state */
  const [country, setCountry] = useState(profileData.country || null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const countryFlag = country ? FLAG_LIST.find(f => f.key === country) : null;

  /* Settings panel state */
  const [showSettings, setShowSettings] = useState(false);

  /* Trophy case state */
  const [trophyCase, setTrophyCase] = useState(INITIAL_TROPHY_CASE);
  const [showTrophyEditor, setShowTrophyEditor] = useState(false);

  /* Watch DME celebration toggle */
  useEffect(() => {
    if (dmeCelebration && !prevDmeCelebration) {
      setCelebrating(true);
    }
    setPrevDmeCelebration(dmeCelebration);
  }, [dmeCelebration]);

  /* Derive player data from effectiveViewType */
  const isProfileB  = effectiveViewType === 'Profile B';
  const isGuest     = effectiveViewType === 'Guest - Game History' || effectiveViewType === 'Guest - Unregistered';
  const isNewPlayer = effectiveViewType === 'Own - New Player';
  const isOther     = effectiveViewType === 'Friend - Game History' || effectiveViewType === 'Guest - Game History' || isProfileB;
  const isOwn       = effectiveViewType === 'Own - Established' || isNewPlayer;
  const isUnregistered = effectiveViewType === 'Guest - Unregistered';

  const player = isProfileB
    ? MOCK_PROFILE_B
    : isOther
      ? MOCK_OTHER
      : isUnregistered
        ? MOCK_GUEST
        : MOCK_OWN;

  const stats = isNewPlayer
    ? { wins: 0, losses: 0, gamesPlayed: 0, currentStreak: 0, highestStreak: 0 }
    : player.stats;

  const showActions = isOwn && !isUnregistered;
  const showOtherProfile = isOther;
  const isGated = false;

  function handleShareProfile() {
    const url = `${window.location.origin}/member/${player.displayName.toLowerCase()}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShareLabel('Copied!');
      setTimeout(() => setShareLabel('Share Profile'), 2000);
    }).catch(() => {
      setShareLabel('Share Profile');
    });
  }

  /* Navigate between profiles via match history username clicks */
  function handleMatchPlayerClick(opponentName) {
    if (opponentName === 'GammonKing42') {
      setLocalViewOverride('Profile B');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (opponentName === MOCK_OWN.displayName) {
      setLocalViewOverride('Own - Established');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* Persist profile data to git-tracked JSON */
  function persistProfile(overrides = {}) {
    const currentAvatar = overrides.avatarEdit !== undefined ? overrides.avatarEdit : avatarEdit;
    const payload = {
      displayName: overrides.displayName !== undefined ? overrides.displayName : savedName,
      bio: overrides.bio !== undefined ? overrides.bio : savedBio,
      avatar: currentAvatar?.type === 'custom' ? currentAvatar.cropped : null,
      avatarPreset: currentAvatar?.type === 'preset' ? currentAvatar.key : null,
      coverImage: overrides.coverImage !== undefined ? overrides.coverImage : (coverEdit?.cropped || null),
      socialLinks: overrides.socialLinks !== undefined ? overrides.socialLinks : socialLinks,
      country: overrides.country !== undefined ? overrides.country : country,
    };
    fetch('/__profile_save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  const displayName = savedName ?? player.displayName;
  const bio = savedBio ?? player.bio;

  function enterEditMode() {
    setEditName(displayName);
    setEditBio(bio || '');
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditName('');
    setEditBio('');
  }

  function saveEdit() {
    setSavedName(editName);
    setSavedBio(editBio);
    setEditMode(false);
    persistProfile({ displayName: editName, bio: editBio });
  }

  /* File input refs */
  const avatarInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

  function handleAvatarFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({
        src: reader.result,
        aspectRatio: 1,
        circular: true,
        target: 'avatar',
        initialCropParams: null,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleCoverFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({
        src: reader.result,
        aspectRatio: 16 / 6,
        circular: false,
        target: 'cover',
        initialCropParams: null,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleAvatarPencilClick() {
    setShowAvatarModal(true);
  }

  function handleCoverPencilClick() {
    if (coverEdit?.original) {
      setCropModal({
        src: coverEdit.original,
        aspectRatio: 16 / 6,
        circular: false,
        target: 'cover',
        initialCropParams: coverEdit.cropParams,
      });
    } else {
      coverInputRef.current?.click();
    }
  }

  function handleCropSave(croppedDataUrl, cropParams) {
    if (cropModal.target === 'avatar') {
      const newAvatar = { type: 'custom', original: cropModal.src, cropParams, cropped: croppedDataUrl };
      setAvatarEdit(newAvatar);
      persistProfile({ avatarEdit: newAvatar });
    } else {
      setCoverEdit({ original: cropModal.src, cropParams, cropped: croppedDataUrl });
      persistProfile({ coverImage: croppedDataUrl });
    }
    setCropModal(null);
  }

  function handlePresetSelect(preset) {
    const newAvatar = { type: 'preset', key: preset.key, cropped: preset.src };
    setAvatarEdit(newAvatar);
    persistProfile({ avatarEdit: newAvatar });
    setShowAvatarModal(false);
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <SiteHeader
        onLogoClick={() => onNavigate?.('index')}
        onNavigate={onNavigate}
        avatarSrc={avatarEdit?.cropped || player.avatar}
      />

      {/* ── Hidden file inputs ── */}
      <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFileSelect} />
      <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverFileSelect} />

      {/* ── Profile header section (cover + info) ── */}
      <div data-section-id="pp-header">

      {/* ── Cover image ── */}
      <div className={`profile-cover${editMode ? ' profile-cover--editable' : ''}`}>
        <img src={coverEdit?.cropped || coverDefault} alt="" className="profile-cover__image" aria-hidden="true" />
        {editMode && (
          <button className="edit-pencil edit-pencil--cover" onClick={handleCoverPencilClick}>
            <IconPencil size={32} />
          </button>
        )}
        {/* Cancel / Save buttons moved to action buttons row below */}
        {showOtherProfile && !isUnregistered && (
          <div className="pp-cover-actions">
            <button className="pp-cover-actions__btn" title="Add Friend">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </button>
            <button className="pp-cover-actions__btn" onClick={() => setShowChallengeModal(true)} title="Challenge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Profile header ── */}
      <div className="profile-header">
        <div className="profile-header__inner">
          <div className="profile-header__avatar-row">
            <div className="profile-header__avatar-wrap">
              <Avatar
                src={avatarEdit?.cropped || player.avatar}
                alt={displayName}
                size="profile"
                online={onlineStatus === 'Online'}
                fallbackInitial={displayName[0].toUpperCase()}
                className={editMode ? 'avatar--editable' : ''}
              />
              {editMode && (
                <button className="edit-pencil edit-pencil--avatar" onClick={handleAvatarPencilClick}>
                  <IconPencil size={32} />
                </button>
              )}
            </div>
            {/* Trophy case — right side of avatar row (hidden in MVP) */}
            {!isMvp && !isNewPlayer && !isUnregistered && trophyCase.length > 0 && (
              <div className="trophy-case--inline">
                {trophyCase.map((s) => (
                  <div key={`${s.category}-${s.threshold}`} className="trophy-item">
                    <div className="trophy-item__image-wrap">
                      <img src={badgePlaceholder} alt="" className="trophy-item__image" />
                      <div className="trophy-item__shine" />
                    </div>
                    <span className="trophy-item__label">
                      {s.threshold} {s.category === 'win' ? 'Wins' : s.category === 'streak' ? 'Streak' : 'Games'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-header__body-row">
            <div className="profile-header__bio-col">
              <div className="profile-header__date">{player.joinDate}</div>
              <div className="profile-header__name-row">
                <h1 className="profile-header__name" data-role-id="pp-username">{displayName}</h1>
                {isFavorited && (
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="var(--color-star)" style={{ flexShrink: 0 }}>
                    <path d="M21.5625 1.84553C21.2644 1.26389 20.661 0.893097 20.0066 0.893097C19.3523 0.893097 18.7488 1.26389 18.4508 1.84553L13.0997 12.3295L1.47422 14.1762C0.827144 14.278 0.28913 14.7361 0.0855567 15.3613C-0.118016 15.9866 0.0492043 16.67 0.507244 17.1353L8.82466 25.46L6.9925 37.0855C6.89071 37.7326 7.15972 38.3869 7.69046 38.7722C8.22121 39.1576 8.91917 39.2157 9.50808 38.9176L20.0066 33.5811L30.4979 38.9176C31.0796 39.2157 31.7848 39.1576 32.3155 38.7722C32.8463 38.3869 33.1153 37.7398 33.0135 37.0855L31.1741 25.46L39.4915 17.1353C39.9568 16.67 40.1168 15.9866 39.9132 15.3613C39.7096 14.7361 39.1789 14.278 38.5245 14.1762L26.9063 12.3295L21.5625 1.84553Z" />
                  </svg>
                )}
              </div>
              {editMode ? (
                <div>
                  <input
                    type="text"
                    className="profile-header__bio-input"
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    maxLength={60}
                  />
                  <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{editBio.length}/60</span>
                </div>
              ) : (
                bio && <p className="profile-header__bio" style={{ margin: 0 }}>{bio}</p>
              )}
              <div className="toolbar">
                <span className="toolbar__date-inline">{shortenJoinDate(player.joinDate)}</span>
                <div className="toolbar__separator toolbar__separator--date" />
                {countryFlag && (
                  <>
                    <img src={countryFlag.src} alt={countryFlag.label} className="flag-picker__inline" title={countryFlag.label} />
                    <div className="toolbar__separator" />
                  </>
                )}
                {showActions && !isMvp && (
                  <>
                    <button className="icon-btn" onClick={() => setShowPlayerCard(true)} title="Player Card">
                      <IconBaseballCard size={22} />
                    </button>
                    {(SOCIALS.some(s => socialLinks[s.key]) || (editMode && SOCIALS.some(s => !socialLinks[s.key]))) && (
                      <div className="toolbar__separator" />
                    )}
                  </>
                )}
                {SOCIALS.filter(s => socialLinks[s.key]).map(s => (
                  <a
                    key={s.key}
                    href={socialLinks[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-links__icon"
                    title={s.label}
                  >
                    <s.Icon />
                  </a>
                ))}
                {editMode && SOCIALS.filter(s => !socialLinks[s.key]).map(s => (
                  <button
                    key={s.key}
                    className="social-links__icon social-links__icon--unlinked"
                    onClick={() => setShowSocialModal(true)}
                    title={s.label}
                  >
                    <s.Icon />
                  </button>
                ))}
              </div>
            </div>
            <div className="profile-header__stats-col">
              {isNewPlayer && (
                <span className="milestone-category__hint pp-new-player-hint" style={{ marginBottom: 8, display: 'block' }}>Play your first game to start tracking!</span>
              )}
              <GatedSection isGated={isGated}>
                <div className="stat-grid">
                  {[
                    { label: 'Total Wins',      value: stats.wins          },
                    { label: 'Games Played',    value: stats.gamesPlayed   },
                    { label: 'Current Streak',  value: stats.currentStreak },
                    { label: 'Highest Streak',  value: stats.highestStreak, percentile: 'Top 5%' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      {s.percentile && (
                        <div className="stat-card__percentile">
                          <IconTrophy16 />
                          <span>{s.percentile}</span>
                        </div>
                      )}
                      <div className="stat-card__number">{s.value.toLocaleString()}</div>
                      <div className="stat-card__label" data-role-id="pp-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </GatedSection>
            </div>
          </div>
          {/* ── Action buttons (own row, full width) ── */}
          {isOwn && !isUnregistered && !editMode && (
            <div className="profile-header__actions-row">
              <button className="com-btn com-btn--outline com-btn--sm" data-role-id="pp-edit-btn" onClick={enterEditMode}>
                <IconPencil size={14} />
                Edit Profile
              </button>
              {!isMvp && (
                <button className="com-btn com-btn--outline com-btn--sm" onClick={() => setShowTrophyEditor(true)}>
                  <IconPencil size={14} />
                  Edit Trophy Case
                </button>
              )}
              <button className="com-btn com-btn--outline com-btn--sm" onClick={() => setShowSettings(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </button>
            </div>
          )}
          {isOwn && !isUnregistered && editMode && (
            <div className="profile-header__actions-row">
              <button className="com-btn com-btn--outline com-btn--sm" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="com-btn com-btn--primary com-btn--sm" onClick={saveEdit}>
                Save Profile Changes
              </button>
            </div>
          )}
          {showOtherProfile && !isUnregistered && (
            <div className="profile-header__actions-row profile-header__actions-row--other">
              <FriendButton status={friendStatus} username={player.displayName} />
              <button className="com-btn com-btn--primary com-btn--sm" onClick={() => setShowChallengeModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Challenge
              </button>
            </div>
          )}
          {isUnregistered && (
            <div className="profile-header__actions-row">
              <button className="com-btn com-btn--primary com-btn--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Create Account to Friend Player
              </button>
              <button className="com-btn com-btn--primary com-btn--sm" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                Challenge
              </button>
            </div>
          )}
        </div>
      </div>
      </div>{/* close pp-header wrapper */}

      {/* ── Tab bar ── */}
      <div className="pp-tab-bar surface-muted" data-section-id="pp-tabs">
        <div className="pp-tab-bar__inner">
          {['Game History', 'Achievements', 'Friends'].filter(t => !isMvp || t !== 'Achievements').map(t => (
            <span
              key={t}
              className={`pp-tab${activeTab === t ? ' pp-tab--active' : ''}`}
              data-role-id="pp-tab-label"
              onClick={() => setLocalTab(t)}
              style={{ cursor: 'pointer' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      {!isMvp && activeTab === 'Achievements' && (
        <div className="section section--flush surface-muted" data-section-id="pp-achievements">
          <div className="section__inner">
            <GatedSection isGated={isGated}>
              {isNewPlayer ? (
                <div className="empty-state">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[0,1,2].map(i => (
                      <img key={i} src={badgePlaceholder} alt="" className="milestone__placeholder milestone__placeholder--unearned" />
                    ))}
                  </div>
                  <div className="empty-state__title">No badges yet</div>
                  <div className="empty-state__desc">Win your first 10 games to unlock your first badge.</div>
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
                  <StreakCategorySection
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
      )}

      {activeTab === 'Game History' && (
        <div className="section section--flush surface-tertiary" data-section-id="pp-history" style={{ paddingBottom: 64 }}>
          <div className="section__inner">
            <GatedSection isGated={isGated}>
              <MatchHistorySection
                history={isProfileB ? MATCH_HISTORY_B : MATCH_HISTORY}
                isEmpty={isNewPlayer}
                onPlayerClick={handleMatchPlayerClick}
                isMvp={isMvp}
              />
            </GatedSection>
          </div>
        </div>
      )}

      {activeTab === 'Friends' && (
        <div className="section section--flush surface-muted" data-section-id="pp-friends" style={{ paddingBottom: 64 }}>
          <div className="section__inner">
            <FriendsTab friendsView={friendsView} fbDiscovery={fbDiscovery} />
          </div>
        </div>
      )}

      <SiteFooter sectionId="gl-footer" />
      <MobileNav onNavigate={onNavigate} hasUnread={acState === 'Activity - Unread'} activePage="My Profile" />
      <div className="mobile-nav__spacer" />

      {/* ── Badge celebration ── */}
      {celebrating && (
        <BadgeCelebration
          queue={CELEBRATION_QUEUE}
          onDismiss={() => setCelebrating(false)}
        />
      )}

      {/* ── Player card modal ── */}
      {showPlayerCard && (
        <PlayerCardModal
          player={{ ...player, displayName, bio, stats }}
          coverImg={coverEdit?.cropped || coverDefault}
          avatarImg={avatarEdit?.cropped || player.avatar}
          onClose={() => setShowPlayerCard(false)}
        />
      )}

      {/* ── Social links modal ── */}
      {showSocialModal && (
        <SocialLinksModal
          socialLinks={socialLinks}
          onSave={(links) => { setSocialLinks(links); setShowSocialModal(false); persistProfile({ socialLinks: links }); }}
          onCancel={() => setShowSocialModal(false)}
        />
      )}

      {/* ── Challenge modal ── */}
      {showChallengeModal && (
        <ChallengeModal
          username={player.displayName}
          onCancel={() => setShowChallengeModal(false)}
          onConfirm={() => setShowChallengeModal(false)}
        />
      )}

      {/* ── Avatar selection modal ── */}
      {showAvatarModal && (
        <AvatarModal
          currentAvatar={avatarEdit}
          onSelectPreset={handlePresetSelect}
          onCustomUpload={(dataUrl) => {
            setShowAvatarModal(false);
            setCropModal({
              src: dataUrl,
              aspectRatio: 1,
              circular: true,
              target: 'avatar',
              initialCropParams: null,
            });
          }}
          onEditCurrent={() => {
            if (avatarEdit?.type === 'custom' && avatarEdit.original) {
              setShowAvatarModal(false);
              setCropModal({
                src: avatarEdit.original,
                aspectRatio: 1,
                circular: true,
                target: 'avatar',
                initialCropParams: avatarEdit.cropParams || null,
              });
            }
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {/* ── Settings panel ── */}
      {showSettings && (
        <SettingsPanel
          displayName={displayName}
          bio={bio}
          socialLinks={socialLinks}
          country={country}
          avatarEdit={avatarEdit}
          onSaveAll={({ displayName: name, bio: newBio, socialLinks: links, country: newCountry }) => {
            setSavedName(name);
            setSavedBio(newBio);
            setSocialLinks(links);
            setCountry(newCountry);
            persistProfile({ displayName: name, bio: newBio, socialLinks: links, country: newCountry });
            setShowSettings(false);
          }}
          onChangeAvatar={() => { setShowSettings(false); setShowAvatarModal(true); }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* ── Trophy case editor ── */}
      {showTrophyEditor && (
        <TrophyCaseEditor
          stats={stats}
          selected={trophyCase}
          onSave={setTrophyCase}
          onClose={() => setShowTrophyEditor(false)}
        />
      )}

      {/* ── Country flag dropdown overlay ── */}
      {showFlagModal && (
        <div className="overlay overlay--top" onClick={() => setShowFlagModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 320 }}>
            <CountryFlagDropdown
              currentCountry={country}
              onSelect={(key) => {
                setCountry(key);
                setShowFlagModal(false);
                persistProfile({ country: key });
              }}
              onClose={() => setShowFlagModal(false)}
            />
          </div>
        </div>
      )}

      {/* ── Image crop modal ── */}
      {cropModal && (
        <ImageCropModal
          src={cropModal.src}
          aspectRatio={cropModal.aspectRatio}
          circular={cropModal.circular}
          initialCropParams={cropModal.initialCropParams}
          onSave={handleCropSave}
          onCancel={() => setCropModal(null)}
        />
      )}
    </div>
  );
}
