import React, { useState, useEffect } from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import { useDMEState } from '../context/dme-states';
import avatarImg from '../imgs/avatar-dink.png';
import boardSample from '../imgs/board-sample.png';
import coverDefault from '../imgs/cover-image.jpg';
import profileData from '../tokens/profile-data.json';
import badgePlaceholder from '../imgs/badge-placeholder.svg';
import { MOCK_FRIENDS, MOCK_REQUESTS_INCOMING, MOCK_REQUESTS_SENT, MOCK_SEARCH_RESULTS, MOCK_FB_FRIENDS } from '../data/social-mock-data';

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

const MATCH_HISTORY = [
  { id: 1,  opponent: 'MarinaD',    result: 'win',  score: '5–3', date: 'Today',  duration: '12m', errorRate: 8,  improvement: 8  },
  { id: 2,  opponent: 'Felix_B',    result: 'win',  score: '5–1', date: 'Today',  duration: '8m',  errorRate: 12, improvement: null },
  { id: 3,  opponent: 'Kowalski22', result: 'loss', score: '2–5', date: 'Mar 7',  duration: '18m', errorRate: 31, improvement: null },
  { id: 4,  opponent: 'TommyV',     result: 'win',  score: '5–4', date: 'Mar 7',  duration: '22m', errorRate: 18, improvement: 3  },
  { id: 5,  opponent: 'AIPlayer',   result: 'win',  score: '5–0', date: 'Mar 6',  duration: '6m',  errorRate: 5,  improvement: 12 },
  { id: 6,  opponent: 'MarinaD',    result: 'loss', score: '3–5', date: 'Mar 5',  duration: '15m', errorRate: 27, improvement: null },
  { id: 7,  opponent: 'Kowalski22', result: 'win',  score: '5–2', date: 'Mar 4',  duration: '14m', errorRate: 14, improvement: null },
  { id: 8,  opponent: 'SarahM',     result: 'loss', score: '1–5', date: 'Mar 3',  duration: '9m',  errorRate: 35, improvement: null },
  { id: 9,  opponent: 'Felix_B',    result: 'win',  score: '5–3', date: 'Mar 2',  duration: '17m', errorRate: 9,  improvement: 5  },
  { id: 10, opponent: 'AIPlayer',   result: 'win',  score: '5–2', date: 'Mar 1',  duration: '7m',  errorRate: 7,  improvement: null },
  { id: 11, opponent: 'TommyV',     result: 'loss', score: '4–5', date: 'Feb 28', duration: '20m', errorRate: 22, improvement: null },
  { id: 12, opponent: 'MarinaD',    result: 'win',  score: '5–1', date: 'Feb 27', duration: '10m', errorRate: 6,  improvement: 9  },
  { id: 13, opponent: 'SarahM',     result: 'win',  score: '5–4', date: 'Feb 26', duration: '19m', errorRate: 15, improvement: null },
  { id: 14, opponent: 'Felix_B',    result: 'loss', score: '2–5', date: 'Feb 25', duration: '11m', errorRate: 29, improvement: null },
  { id: 15, opponent: 'Kowalski22', result: 'win',  score: '5–0', date: 'Feb 24', duration: '5m',  errorRate: 4,  improvement: 7  },
  { id: 16, opponent: 'AIPlayer',   result: 'win',  score: '5–3', date: 'Feb 23', duration: '13m', errorRate: 11, improvement: null },
  { id: 17, opponent: 'TommyV',     result: 'win',  score: '5–2', date: 'Feb 22', duration: '16m', errorRate: 13, improvement: 2  },
  { id: 18, opponent: 'MarinaD',    result: 'loss', score: '3–5', date: 'Feb 21', duration: '14m', errorRate: 33, improvement: null },
  { id: 19, opponent: 'SarahM',     result: 'win',  score: '5–1', date: 'Feb 20', duration: '8m',  errorRate: 8,  improvement: 6  },
  { id: 20, opponent: 'Felix_B',    result: 'win',  score: '5–4', date: 'Feb 19', duration: '21m', errorRate: 16, improvement: null },
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
  { label: 'New Game',    Icon: IconNewGame },
  { label: 'Friends',    Icon: IconFriends },
  { label: 'Profile',    Icon: IconProfileNav },
];

function MobileNav({ onNavigate }) {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(({ label, Icon }) => (
        <button
          key={label}
          className={`mobile-nav__item${label === 'Profile' ? ' mobile-nav__item--active' : ''}`}
          onClick={label === 'Learning' ? () => onNavigate?.('learn-hub') : undefined}
        >
          <Icon />
          <span className="mobile-nav__label">{label}</span>
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

/* ── Match history section ───────────────────────────────────── */

function getErrorRateColor(rate) {
  if (rate <= 10) return 'var(--color-status-success)';
  if (rate <= 25) return 'var(--color-status-warning)';
  return 'var(--color-status-error)';
}

const MATCHES_PER_PAGE = 10;

function MatchHistorySection({ history, isEmpty }) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const filtered = searchQuery
    ? history.filter(m => m.opponent.toLowerCase().includes(searchQuery.toLowerCase()))
    : history;

  const totalPages = Math.max(1, Math.ceil(filtered.length / MATCHES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pageItems = filtered.slice(safePage * MATCHES_PER_PAGE, (safePage + 1) * MATCHES_PER_PAGE);

  return (
    <>
      <div className="match-history__header">
        <h2 className="section-title">Match History</h2>
        <div className="match-search">
          <svg className="match-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="match-search__input"
            placeholder="Search opponents..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(0); }}
          />
        </div>
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
            <div className="match-row__avatar">
              <img src={avatarImg} alt={m.opponent} />
            </div>
            <span className="match-row__name">{m.opponent}</span>
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
          <span className="match-history__page-info">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            className="com-btn com-btn--outline com-btn--sm"
            style={{ opacity: safePage === 0 ? 0.4 : 1, pointerEvents: safePage === 0 ? 'none' : 'auto' }}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            ← Previous
          </button>
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
      <div className="side-panel surface-muted" onClick={e => e.stopPropagation()}>
        <div className="side-panel__header">
          <h2 className="side-panel__title">Settings</h2>
          <button className="side-panel__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="side-panel__body">
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
            <textarea
              className="profile-header__bio-input"
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={3}
            />
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
        <div className="side-panel__footer">
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

function FriendsTab({ friendsView, fbDiscovery }) {
  return (
    <div className="pp-friends">
      {/* Sub-nav */}
      <div className="pp-friends-nav">
        <span className={`pp-friends-nav__item${friendsView === 'My Friends' || friendsView === 'Search Results' || friendsView.startsWith('Empty') ? ' pp-friends-nav__item--active' : ''}`}>
          My Friends
        </span>
        <span className={`pp-friends-nav__item${friendsView.startsWith('Requests') ? ' pp-friends-nav__item--active' : ''}`}>
          Requests
          {MOCK_REQUESTS_INCOMING.length > 0 && (
            <span className="pp-friends-nav__badge">{MOCK_REQUESTS_INCOMING.length}</span>
          )}
        </span>
      </div>

      {/* Search bar */}
      {(friendsView === 'My Friends' || friendsView === 'Search Results' || friendsView.startsWith('Empty')) && (
        <div className="pp-friends-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input className="pp-friends-search__input" placeholder="Search friends or players..." readOnly />
        </div>
      )}

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
                <div className="pp-friend-row__avatar">
                  <img src={getAvatarSrc(f.avatar)} alt={f.username} />
                </div>
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
      {friendsView === 'My Friends' && (
        <div className="pp-friends-list">
          {MOCK_FRIENDS.map(f => (
            <div key={f.id} className="pp-friend-row">
              <div className="pp-friend-row__avatar">
                <img src={getAvatarSrc(f.avatar)} alt={f.username} />
                <span className={`online-dot online-dot--sm online-dot--${f.online ? 'online' : 'offline'}`} />
              </div>
              <div className="pp-friend-row__info">
                <span className="pp-friend-row__name">{f.username}</span>
                <span className="pp-friend-row__meta">{f.rating} · {f.online ? 'Online' : 'Offline'}</span>
              </div>
              <div className="pp-friend-row__actions">
                <button className="friend-btn friend-btn--icon-only" title="Challenge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </button>
                <button className="friend-btn friend-btn--icon-only" title="View Profile">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {friendsView === 'Requests - Incoming' && (
        <div className="pp-friends-list">
          <div className="pp-friends-list__title">Incoming Requests</div>
          {MOCK_REQUESTS_INCOMING.map(f => (
            <div key={f.id} className="pp-friend-row">
              <div className="pp-friend-row__avatar">
                <img src={getAvatarSrc(f.avatar)} alt={f.username} />
              </div>
              <div className="pp-friend-row__info">
                <span className="pp-friend-row__name">{f.username}</span>
                <span className="pp-friend-row__meta">{f.rating}</span>
              </div>
              <div className="pp-friend-row__actions">
                <button className="friend-btn friend-btn--accept">Accept</button>
                <button className="friend-btn friend-btn--decline">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {friendsView === 'Requests - Sent' && (
        <div className="pp-friends-list">
          <div className="pp-friends-list__title">Sent Requests</div>
          {MOCK_REQUESTS_SENT.map(f => (
            <div key={f.id} className="pp-friend-row">
              <div className="pp-friend-row__avatar">
                <img src={getAvatarSrc(f.avatar)} alt={f.username} />
              </div>
              <div className="pp-friend-row__info">
                <span className="pp-friend-row__name">{f.username}</span>
                <span className="pp-friend-row__meta">{f.rating}</span>
              </div>
              <button className="friend-btn friend-btn--cancel">Cancel</button>
            </div>
          ))}
        </div>
      )}

      {friendsView === 'Search Results' && (
        <div className="pp-friends-list">
          {MOCK_SEARCH_RESULTS.friends.length > 0 && (
            <>
              <div className="pp-friends-list__title">Friends</div>
              {MOCK_SEARCH_RESULTS.friends.map(f => (
                <div key={f.id} className="pp-friend-row">
                  <div className="pp-friend-row__avatar">
                    <img src={getAvatarSrc(f.avatar)} alt={f.username} />
                    <span className={`online-dot online-dot--sm online-dot--${f.online ? 'online' : 'offline'}`} />
                  </div>
                  <div className="pp-friend-row__info">
                    <span className="pp-friend-row__name">{f.username}</span>
                    <span className="pp-friend-row__meta">{f.rating}</span>
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
                  <div className="pp-friend-row__avatar">
                    <img src={getAvatarSrc(f.avatar)} alt={f.username} />
                    <span className={`online-dot online-dot--sm online-dot--${f.online ? 'online' : 'offline'}`} />
                  </div>
                  <div className="pp-friend-row__info">
                    <span className="pp-friend-row__name">{f.username}</span>
                    <span className="pp-friend-row__meta">{f.rating}</span>
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
  const dmeTab = useDMEState('profile.tab', 'Game History');
  const [localTab, setLocalTab] = useState(dmeTab);
  useEffect(() => { setLocalTab(dmeTab); }, [dmeTab]);
  const activeTab = localTab;
  const friendsView = useDMEState('profile.friendsView', 'My Friends');
  const fbDiscovery = useDMEState('profile.fbDiscovery', 'None');

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

  /* Derive player data from viewType */
  const isGuest     = viewType === 'Guest - Game History' || viewType === 'Guest - Unregistered';
  const isNewPlayer = viewType === 'Own - New Player';
  const isOther     = viewType === 'Friend - Game History' || viewType === 'Guest - Game History';
  const isOwn       = viewType === 'Own - Established' || isNewPlayer;
  const isUnregistered = viewType === 'Guest - Unregistered';

  const player = isOther
    ? MOCK_OTHER
    : isUnregistered
      ? MOCK_GUEST
      : MOCK_OWN;

  const stats = isNewPlayer
    ? { wins: 0, losses: 0, gamesPlayed: 0, currentStreak: 0, highestStreak: 0 }
    : player.stats;

  const showActions = isOwn && !isUnregistered;
  const showOtherProfile = isOther;
  const isGated = isUnregistered;

  function handleShareProfile() {
    const url = `${window.location.origin}/member/${player.displayName.toLowerCase()}`;
    navigator.clipboard?.writeText(url).then(() => {
      setShareLabel('Copied!');
      setTimeout(() => setShareLabel('Share Profile'), 2000);
    }).catch(() => {
      setShareLabel('Share Profile');
    });
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
        {/* Edit Profile / Settings buttons moved to trophy header row below */}
        {editMode && (
          <div className="profile-cover__actions">
            <button className="com-btn com-btn--outline com-btn--sm" onClick={cancelEdit}>
              Cancel
            </button>
            <button className="com-btn com-btn--primary com-btn--sm" onClick={saveEdit}>
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* ── Profile header ── */}
      <div className="profile-header">
        <div className="profile-header__inner">
          <div className="profile-header__avatar-row">
            <div className="profile-header__avatar-wrap">
              <div className={`avatar${editMode ? ' avatar--editable' : ''}`}>
                {(avatarEdit?.cropped || player.avatar)
                  ? <img src={avatarEdit?.cropped || player.avatar} alt={displayName} />
                  : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, var(--color-border-mid), var(--color-border-subtle))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: fh, fontWeight: 700, fontSize: 32,
                      color: 'var(--color-bg)',
                    }}>
                      {displayName[0].toUpperCase()}
                    </div>
                  )
                }
              </div>
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
                <h1 className="profile-header__name">{displayName}</h1>
              </div>
              {editMode ? (
                <textarea
                  className="profile-header__bio-input"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={3}
                />
              ) : (
                bio && <p className="profile-header__bio" style={{ margin: 0 }}>{bio}</p>
              )}
              <div className="toolbar">
                {countryFlag && (
                  <>
                    <img src={countryFlag.src} alt={countryFlag.label} className="flag-picker__inline" title={countryFlag.label} />
                    <div className="toolbar__separator" />
                  </>
                )}
                {showActions && (
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
              {/* ── Action buttons ── */}
              {isOwn && !editMode && !isNewPlayer && !isUnregistered && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <button className="com-btn com-btn--outline com-btn--sm" onClick={enterEditMode}>
                    <IconPencil size={14} />
                    Edit Profile
                  </button>
                  <button className="com-btn com-btn--outline com-btn--sm" onClick={() => setShowSettings(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Settings
                  </button>
                  {!isMvp && (
                    <button className="com-btn com-btn--outline com-btn--sm" onClick={() => setShowTrophyEditor(true)}>
                      <IconPencil size={14} />
                      Edit Trophy Case
                    </button>
                  )}
                </div>
              )}
              {showOtherProfile && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <button className="com-btn com-btn--primary com-btn--sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Add Friend
                  </button>
                </div>
              )}
            </div>
            <div className="profile-header__stats-col">
              {isNewPlayer && (
                <span className="milestone-category__hint" style={{ marginBottom: 8, display: 'block' }}>Play your first game to start tracking!</span>
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
                      <div className="stat-card__label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </GatedSection>
            </div>
          </div>
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
            <h2 className="section-header__title">Achievements</h2>
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
                history={MATCH_HISTORY}
                isEmpty={isNewPlayer}
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
      <MobileNav onNavigate={onNavigate} />
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
