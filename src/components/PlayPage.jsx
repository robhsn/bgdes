import React, { useState } from 'react';
import { useDMEState, useDMESetState } from '../context/dme-states';
import { useSessionState } from '../hooks/useSessionState';
import { useRequireAuth } from '../hooks/useRequireAuth';
import BOARD_PRESETS from '../data/board-presets';
import { MOCK_FRIENDS } from '../data/social-mock-data';
import avatarDrac from '../imgs/avatars/Drac.png';
import avatarSoldier from '../imgs/avatars/Soldier.png';
import avatarKing from '../imgs/avatars/King.png';
import avatarGhosty from '../imgs/avatars/Ghosty.png';
import avatarGobby from '../imgs/avatars/Gobby.png';
import friendAddIcon from '../imgs/icons/Friend Add.svg';
import iconSound from '../imgs/icons/Sound.svg';
import iconAutomaticMoves from '../imgs/icons/Automatic Moves.svg';
import Avatar from './Avatar';
import PlayerCardModal from './PlayerCardModal';
import logoBlack from '../imgs/logo/Logo Black.svg';
import coverDefault from '../imgs/cover-image.jpg';
import './PlayPage.css';

/* Eager-loaded avatar map so MOCK_FRIENDS' string keys resolve to image
   URLs. Mirrors the pattern in ActivityCenter / ProfilePage. */
const avatarModules = import.meta.glob('../imgs/avatars/*.png', { eager: true });
const AVATAR_MAP = Object.fromEntries(
  Object.entries(avatarModules).map(([path, mod]) => [path.split('/').pop().replace('.png', ''), mod.default])
);
function getAvatarSrc(key) { return AVATAR_MAP[key] || avatarKing; }

/* ═══════════════════════════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════════════════════════ */

function IconSwapDice() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path opacity="0.4" d="M1.8 12.6c0 .498.402.9.9.9h10.426l-1.164 1.164a.9.9 0 1 0 1.274 1.274l2.7-2.7a.9.9 0 0 0 0-1.274l-2.7-2.7a.9.9 0 1 0-1.274 1.274L13.126 11.7H2.7a.9.9 0 0 0-.9.9Z" fill="currentColor"/>
      <path d="M2.064 4.764a.9.9 0 0 0 0 1.274l2.7 2.7a.9.9 0 1 0 1.274-1.274L4.874 6.3H15.3a.9.9 0 0 0 0-1.8H4.874l1.164-1.164a.9.9 0 1 0-1.274-1.274l-2.7 2.7v.002Z" fill="currentColor"/>
    </svg>
  );
}

function IconThreeDots() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="2" />
      <circle cx="10" cy="10" r="2" />
      <circle cx="16" cy="10" r="2" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Dice — absolute-positioned dots matching .com layout
   ═══════════════════════════════════════════════════════════════ */

const DOT_POSITIONS = {
  1: [['50%','50%']],
  2: [['25%','25%'],['75%','75%']],
  3: [['25%','25%'],['50%','50%'],['75%','75%']],
  4: [['25%','25%'],['25%','75%'],['75%','25%'],['75%','75%']],
  5: [['25%','25%'],['25%','75%'],['50%','50%'],['75%','25%'],['75%','75%']],
  6: [['25%','25%'],['25%','50%'],['25%','75%'],['75%','25%'],['75%','50%'],['75%','75%']],
};

function Die({ value, player }) {
  const dots = DOT_POSITIONS[value] || [];
  return (
    <div className={`gp-die gp-die--${player}`}>
      <div className="gp-die-face">
        {dots.map(([top, left], i) => (
          <div
            key={i}
            className={`gp-die-dot gp-die-dot--${player}`}
            style={{ top, left }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Checkers — gradient circles matching .com
   ═══════════════════════════════════════════════════════════════ */

function Checker({ color, style }) {
  return (
    <div className={`gp-checker gp-checker--${color}`} style={style}>
      <div className={`gp-checker-inner gp-checker-inner--${color}`} />
    </div>
  );
}

function CheckerStack({ count, color, isTopHalf, maxH }) {
  const absCount = Math.abs(count);
  const visible = Math.min(absCount, 5);
  const showBadge = absCount > 5;

  return (
    <div className={`gp-checker-stack ${isTopHalf ? 'gp-checker-stack--top' : 'gp-checker-stack--bottom'}`}>
      {Array.from({ length: visible }, (_, i) => {
        const offset = `calc(${isTopHalf ? i : -i} * var(--gp-checker-offset))`;
        return (
          <div
            key={i}
            className="gp-checker-wrapper"
            style={{
              zIndex: 10 + i,
              transform: `translateY(${offset})`,
              [isTopHalf ? 'top' : 'bottom']: 0,
            }}
          >
            <Checker color={color} />
            {showBadge && i === visible - 1 && (
              <span className={`gp-checker-badge gp-checker-badge--${color}`}>{absCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Point (triangle + checkers)
   ═══════════════════════════════════════════════════════════════ */

function Point({ pointIndex, value, isTopHalf }) {
  const color = value > 0 ? 'white' : 'black';
  const isOdd = pointIndex % 2 !== 0;

  return (
    <div className="gp-point">
      <div className={`gp-triangle ${isTopHalf ? 'gp-triangle--down' : 'gp-triangle--up'} ${isOdd ? 'gp-triangle--odd' : 'gp-triangle--even'}`} />
      {value !== 0 && (
        <CheckerStack count={value} color={color} isTopHalf={isTopHalf} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Point number labels
   ═══════════════════════════════════════════════════════════════ */

function PointLabel({ number }) {
  return (
    <div className="gp-point-label">
      <span className="gp-point-label-text">{number}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Dice Area — positioned in the left half of the board
   ═══════════════════════════════════════════════════════════════ */

function DiceArea({ dice, turn }) {
  if (!dice) return null;
  const player = turn === 'black' ? 'player2' : 'player1';
  return (
    <div className="gp-dice-area">
      <div className="gp-dice-row">
        <Die value={dice[0]} player={player} />
        <Die value={dice[1]} player={player} />
      </div>
      <div className="gp-dice-actions">
        <button className="gp-dice-action" aria-label="Swap dice order">
          <IconSwapDice />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Board
   ═══════════════════════════════════════════════════════════════ */

function Board({ preset }) {
  const { position, dice, turn } = preset;

  const topLeft  = [13,14,15,16,17,18];
  const topRight = [19,20,21,22,23,24];
  const botLeft  = [12,11,10,9,8,7];
  const botRight = [6,5,4,3,2,1];

  return (
    <div className="gp-board">
      {/* Top point numbers */}
      <div className="gp-point-labels">
        {topLeft.map(n => <PointLabel key={n} number={n} />)}
        <div className="gp-point-label-bar-gap" />
        {topRight.map(n => <PointLabel key={n} number={n} />)}
      </div>

      {/* Main board area: quadrants + continuous bar */}
      <div className="gp-board-main">
        {/* Left half (points 13-18 top, 12-7 bottom) */}
        <div className="gp-board-half-col">
          <div className="gp-quadrant gp-quadrant--top">
            {topLeft.map(i => (
              <Point key={i} pointIndex={i} value={position[i]} isTopHalf={true} />
            ))}
          </div>
          <div className="gp-quadrant gp-quadrant--bottom">
            {botLeft.map(i => (
              <Point key={i} pointIndex={i} value={position[i]} isTopHalf={false} />
            ))}
          </div>
        </div>

        {/* Continuous bar */}
        <div className="gp-bar">
          <div className="gp-bar-half gp-bar-half--top">
            {position[25] > 0 && (
              <CheckerStack count={-position[25]} color="black" isTopHalf={true} />
            )}
          </div>
          <div className="gp-bar-half gp-bar-half--bottom">
            {position[0] > 0 && (
              <CheckerStack count={position[0]} color="white" isTopHalf={false} />
            )}
          </div>
        </div>

        {/* Right half (points 19-24 top, 6-1 bottom) */}
        <div className="gp-board-half-col">
          <div className="gp-quadrant gp-quadrant--top">
            {topRight.map(i => (
              <Point key={i} pointIndex={i} value={position[i]} isTopHalf={true} />
            ))}
          </div>
          <div className="gp-quadrant gp-quadrant--bottom">
            {botRight.map(i => (
              <Point key={i} pointIndex={i} value={position[i]} isTopHalf={false} />
            ))}
          </div>
        </div>

        {/* Dice — positioned in left half center */}
        <DiceArea dice={dice} turn={turn} />
      </div>

      {/* Bottom point numbers */}
      <div className="gp-point-labels">
        {botLeft.map(n => <PointLabel key={n} number={n} />)}
        <div className="gp-point-label-bar-gap" />
        {botRight.map(n => <PointLabel key={n} number={n} />)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Bear-off tray (pip count embedded inside)
   ═══════════════════════════════════════════════════════════════ */

function BearOffSlots({ count, color, maxSlots = 15 }) {
  return (
    <div className={`gp-bearoff-slots gp-bearoff-slots--${color}`}>
      {Array.from({ length: maxSlots }, (_, i) => (
        <div
          key={i}
          className={`gp-bearoff-slot ${i < count ? `gp-bearoff-slot--filled gp-bearoff-slot--${color}` : `gp-bearoff-slot--empty gp-bearoff-slot--placeholder-${color}`}`}
        />
      ))}
    </div>
  );
}

function PipCount({ value, color }) {
  return (
    <div className={`gp-pip-count gp-pip-count--${color}`}>
      <span className="gp-pip-count-arrow">&#8592;</span>
      <span className="gp-pip-count-text">{value}</span>
    </div>
  );
}

function BearOffCount({ count, color }) {
  return (
    <div className={`gp-bearoff-count gp-bearoff-count--${color}`}>
      <span className="gp-bearoff-count-num">{count}</span>
      <div className={`gp-bearoff-count-checker gp-bearoff-count-checker--${color}`}>
        <div className={`gp-bearoff-count-checker-inner gp-bearoff-count-checker-inner--${color}`} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sidebar — bear-off trays with integrated pip counts
   ═══════════════════════════════════════════════════════════════ */

function Sidebar({ preset }) {
  return (
    <div className="gp-sidebar">
      {/* Player 2 (black) — borne-off count, then white tray (slots + pip at bottom) */}
      <BearOffCount count={preset.blackOff} color="black" />
      <div className="gp-bearoff gp-bearoff--white">
        <BearOffSlots count={preset.blackOff} color="white" />
        <PipCount value={preset.pipCount.black} color="black" />
      </div>

      {/* Doubling cube placeholder */}
      <div className="gp-doubling-cube-space" />

      {/* Player 1 (white) — dark tray (pip at top + slots), then borne-off count */}
      <div className="gp-bearoff gp-bearoff--black">
        <PipCount value={preset.pipCount.white} color="white" />
        <BearOffSlots count={preset.whiteOff} color="black" />
      </div>
      <BearOffCount count={preset.whiteOff} color="white" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TopBar — matches backgammon.com header exactly
   ═══════════════════════════════════════════════════════════════ */

function AvatarRing({ src }) {
  return (
    <div className="gp-avatar-wrap">
      {/* Dashed ring with marching-ants gradient */}
      <svg className="gp-avatar-ring" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="gp-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0.62%" stopColor="#D0D0D0" />
            <stop offset="94.44%" stopColor="#151515" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="34" r="31" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="gp-avatar-ring-bg" />
        <circle cx="34" cy="34" r="31" fill="none" stroke="url(#gp-ring-grad)" strokeWidth="2" strokeDasharray="8 8" className="gp-avatar-ring-ants" />
      </svg>
      <div className="gp-avatar-img-wrap">
        <img className="gp-avatar-img" src={src} alt="" />
      </div>
    </div>
  );
}

function PlayerBadge({ name, color, avatarSrc, isRight, onClick, subtitle }) {
  const label = color === 'white' ? 'White' : 'Black';

  const meta = (
    <div className={`gp-player-meta ${isRight ? 'gp-player-meta--right' : ''}`}>
      <div className={`gp-badge gp-badge--${color}`}>
        <div className={`gp-badge-checker gp-badge-checker--${color}`}>
          <div className={`gp-badge-checker-inner gp-badge-checker-inner--${color}`} />
        </div>
        <span className="gp-badge-label">{label}</span>
      </div>
      <span className="gp-player-name">{name}</span>
      {subtitle && <span className="gp-player-subtitle">{subtitle}</span>}
    </div>
  );

  return (
    <div className={`gp-player ${isRight ? 'gp-player--right' : ''}`} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      {!isRight && <AvatarRing src={avatarSrc} />}
      {meta}
      {isRight && <AvatarRing src={avatarSrc} />}
    </div>
  );
}

function TopBar({ logoSrc, onNavigate, onOpponentClick }) {
  // Session-persisted challenged friend (set when user fires a challenge
  // from the Game Ready modal). When present, the right-side opponent
  // badge swaps to that friend with a "WAITING FOR OPPONENT" subtitle.
  const [challenged] = useSessionState('play.challengedFriend', null);
  const opponentName = challenged?.username || 'Rusty (Beginner Bot)';
  const opponentAvatar = challenged?.avatar ? getAvatarSrc(challenged.avatar) : avatarSoldier;
  const opponentSubtitle = challenged ? 'WAITING FOR OPPONENT' : undefined;

  return (
    <div className="gp-topbar">
      {/* Row 1: logo (mobile) — hidden on desktop where logo is in center */}
      <div className="gp-topbar-logo-row">
        <img src={logoSrc} alt="Backgammon.com" className="gp-topbar-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('index')} />
      </div>

      {/* Row 2 (mobile) / Single row (desktop): players + logo + menu */}
      <div className="gp-topbar-players-row">
        <div className="gp-topbar-left">
          <PlayerBadge name="RobertTHeathIsMyFullName" color="white" avatarSrc={avatarDrac} />
        </div>

        <div className="gp-topbar-center">
          <img src={logoSrc} alt="Backgammon.com" className="gp-topbar-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('index')} />
        </div>

        <div className="gp-topbar-right">
          <PlayerBadge
            name={opponentName}
            color="black"
            avatarSrc={opponentAvatar}
            isRight
            onClick={onOpponentClick}
            subtitle={opponentSubtitle}
          />
          <button className="gp-menu-btn" aria-label="Menu">
            <span className="gp-menu-label">Menu</span>
            <span className="gp-menu-dots-circle">
              <IconThreeDots />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TimerBar — dark green strip between header and board
   ═══════════════════════════════════════════════════════════════ */

function TimerBar({ preset }) {
  const score = preset.score
    ? `${preset.score.white}`
    : '';

  return (
    <div className="gp-timerbar">
      <span className="gp-timer">{preset.whiteTimer}</span>
      <div className="gp-timerbar-center">
        <span className="gp-timerbar-score">{score}</span>
        <span className="gp-timerbar-dots">•••</span>
      </div>
      <span className="gp-timer">{preset.blackTimer}</span>
      {/* Mobile: menu dots in timer bar */}
      <span className="gp-timerbar-menu">
        <IconThreeDots />
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Modals
   ═══════════════════════════════════════════════════════════════ */

function MenuToggleRow({ icon, title, description, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="gp-menu-row">
      <img src={icon} alt="" className="gp-menu-row__icon" width="24" height="24" />
      <div className="gp-menu-row__text">
        <div className="gp-menu-row__title">{title}</div>
        <div className="gp-menu-row__desc">{description}</div>
      </div>
      <button
        type="button"
        className={`gp-menu-toggle${on ? ' gp-menu-toggle--on' : ''}`}
        onClick={() => setOn(o => !o)}
        aria-pressed={on}
      >
        <span className="gp-menu-toggle__label">{on ? 'On' : 'Off'}</span>
        <span className="gp-menu-toggle__knob" />
      </button>
    </div>
  );
}

function ModalCloseButton({ onClose }) {
  return (
    <button className="gp-modal-close" onClick={onClose} aria-label="Close">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}

function MenuModal({ onClose }) {
  return (
    <div className="modal modal--sm gp-modal-center gp-menu-modal">
      <ModalCloseButton onClose={onClose} />
      <h2 className="modal__title">Menu</h2>
      <MenuToggleRow
        icon={iconSound}
        title="Sound effects"
        description="Play sounds for moves, hits, turn start and alerts"
        defaultOn={false}
      />
      <MenuToggleRow
        icon={iconAutomaticMoves}
        title="Automatic moves"
        description="Move checkers for me when only one move is possible"
        defaultOn={true}
      />
      <button type="button" className="gp-resign-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="22" x2="4" y2="3" />
          <path d="M4 4h12l-2 4 2 4H4" fill="currentColor" stroke="none" />
        </svg>
        <span>Resign</span>
      </button>
    </div>
  );
}

function IconCheckers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 8.54565C16.7439 8.54574 21.1171 11.2687 21.8646 15.1259C22.7455 19.6721 18.3978 23.9999 12.0001 24C5.60217 24 1.25409 19.6722 2.13501 15.1259C2.88249 11.2686 7.2561 8.54565 12.0001 8.54565ZM12.5116 10.7732C11.2952 10.7103 10.0179 10.9352 8.93842 11.4163C6.96234 12.2701 5.65003 14.0404 5.76035 15.7486C5.77867 16.1576 5.86764 16.5619 6.02393 16.9442C6.11752 17.1733 6.235 17.3945 6.37423 17.6049C6.34368 17.362 6.33306 17.1219 6.34062 16.8862C6.35318 16.4933 6.4167 16.1123 6.52332 15.7486C6.96632 14.2251 8.18323 13.0232 9.70627 12.3318C10.5545 11.9458 11.5129 11.7096 12.5214 11.6477C13.687 11.5742 14.9334 11.7373 16.1141 12.1802C16.3605 12.2726 16.6045 12.3773 16.8439 12.494C16.6727 12.3257 16.4832 12.1656 16.2778 12.0161C15.3063 11.302 13.9317 10.8382 12.5116 10.7732Z" fill="currentColor" />
      <path d="M12.1111 0.00194884C16.6945 0.0842733 20.9939 2.69828 21.8271 6.4L21.8646 6.58027C21.9378 6.95807 21.9739 7.33476 21.9767 7.70719H21.9781V11.4153C19.9599 8.53442 16.2468 6.60234 12 6.60219C9.80002 6.60219 7.74339 7.12165 5.99128 8.02192C6.46764 6.56745 7.6552 5.41958 9.1294 4.7503C9.97758 4.36442 10.9362 4.12861 11.9445 4.06675C13.1101 3.9933 14.3566 4.15634 15.5372 4.59927C15.7835 4.69158 16.0277 4.79589 16.267 4.91255C16.0959 4.74429 15.9063 4.58412 15.7009 4.43459C14.7294 3.72059 13.3547 3.25728 11.9348 3.1922C10.7184 3.12932 9.44101 3.35425 8.36156 3.83532C6.3854 4.68917 5.07306 6.4594 5.18348 8.1676C5.18788 8.26574 5.19635 8.36359 5.20882 8.4609C3.9224 9.24897 2.83472 10.2549 2.02197 11.4149V7.70719H2.02343C2.02622 7.33474 2.06182 6.95809 2.13501 6.58027L2.17252 6.4C3.01922 2.63845 7.4415 9.1037e-05 12.1111 0V0.00194884Z" fill="currentColor" />
    </svg>
  );
}

function IconRobot() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path opacity="0.4" d="M0 10.8V14.4C0 15.0637 0.53625 15.6 1.2 15.6C1.86375 15.6 2.4 15.0637 2.4 14.4V10.8C2.4 10.1362 1.86375 9.59995 1.2 9.59995C0.53625 9.59995 0 10.1362 0 10.8ZM10.8 2.39995V4.79995H13.2V2.39995C13.2 1.7362 12.6638 1.19995 12 1.19995C11.3363 1.19995 10.8 1.7362 10.8 2.39995ZM21.6 10.8V14.4C21.6 15.0637 22.1363 15.6 22.8 15.6C23.4638 15.6 24 15.0637 24 14.4V10.8C24 10.1362 23.4638 9.59995 22.8 9.59995C22.1363 9.59995 21.6 10.1362 21.6 10.8Z" fill="currentColor" />
      <path d="M7.2 4.8C5.2125 4.8 3.6 6.4125 3.6 8.4V16.8C3.6 18.7875 5.2125 20.4 7.2 20.4H16.8C18.7875 20.4 20.4 18.7875 20.4 16.8V8.4C20.4 6.4125 18.7875 4.8 16.8 4.8H7.2ZM6.9 15.3H8.1C8.6 15.3 9 15.7 9 16.2C9 16.7 8.6 17.1 8.1 17.1H6.9C6.4 17.1 6 16.7 6 16.2C6 15.7 6.4 15.3 6.9 15.3ZM11.4 15.3H12.6C13.1 15.3 13.5 15.7 13.5 16.2C13.5 16.7 13.1 17.1 12.6 17.1H11.4C10.9 17.1 10.5 16.7 10.5 16.2C10.5 15.7 10.9 15.3 11.4 15.3ZM15.9 15.3H17.1C17.6 15.3 18 15.7 18 16.2C18 16.7 17.6 17.1 17.1 17.1H15.9C15.4 17.1 15 16.7 15 16.2C15 15.7 15.4 15.3 15.9 15.3ZM8.4 9C9.5 9 10.2 9.8 10.2 10.8C10.2 11.8 9.5 12.6 8.4 12.6C7.3 12.6 6.6 11.8 6.6 10.8C6.6 9.8 7.3 9 8.4 9ZM15.6 9C16.7 9 17.4 9.8 17.4 10.8C17.4 11.8 16.7 12.6 15.6 12.6C14.5 12.6 13.8 11.8 13.8 10.8C13.8 9.8 14.5 9 15.6 9Z" fill="currentColor" />
    </svg>
  );
}

function IconFriendPlus() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path opacity="0.4" d="M1.8 20.5C1.8 21.1 2.3 21.6 2.9 21.6H16.3C16.9 21.6 17.4 21.1 17.4 20.5C17.4 16.8 14.4 13.8 10.7 13.8H8.5C4.8 13.8 1.8 16.8 1.8 20.5ZM5.1 7.2C5.1 8.4 5.6 9.5 6.4 10.4C7.3 11.2 8.4 11.7 9.6 11.7C10.8 11.7 11.9 11.2 12.8 10.4C13.6 9.5 14.1 8.4 14.1 7.2C14.1 6 13.6 4.9 12.8 4C11.9 3.2 10.8 2.7 9.6 2.7C8.4 2.7 7.3 3.2 6.4 4C5.6 4.9 5.1 6 5.1 7.2Z" fill="currentColor" />
      <path d="M21.3 6.9C21.3 6.4 20.9 6 20.4 6C19.9 6 19.5 6.4 19.5 6.9V8.7H17.7C17.2 8.7 16.8 9.1 16.8 9.6C16.8 10.1 17.2 10.5 17.7 10.5H19.5V12.3C19.5 12.8 19.9 13.2 20.4 13.2C20.9 13.2 21.3 12.8 21.3 12.3V10.5H23.1C23.6 10.5 24 10.1 24 9.6C24 9.1 23.6 8.7 23.1 8.7H21.3V6.9Z" fill="currentColor" />
    </svg>
  );
}

function GameModeModal({ onClose, onPickFriends, onNavigate }) {
  // Back / X dismisses the modal AND returns the user to where they
  // came from. If they landed on /?page=play directly (no prev page in
  // session), fall back to the homepage so they're never stranded on
  // a game-setup screen with no context.
  const handleBack = () => {
    let prev = 'index';
    try {
      const stored = sessionStorage.getItem('dme-prev-page');
      if (stored && stored !== 'play') prev = stored;
    } catch {}
    onClose?.();
    onNavigate?.(prev);
  };
  return (
    <div className="modal modal--sm gp-modal-center gp-mode-modal">
      <ModalCloseButton onClose={handleBack} />
      <h2 className="gp-mode-modal__title">Start a game</h2>
      <p className="modal__desc gp-mode-modal__desc">Pick how you'd like to play.</p>
      <div className="gp-mode-modal__options">
        <button type="button" className="gp-mode-btn gp-mode-btn--primary" onClick={onClose}>
          <IconCheckers />
          <span>Quick game</span>
        </button>
        <div className="gp-mode-divider" />
        <button type="button" className="gp-mode-btn gp-mode-btn--ghost" onClick={onClose}>
          <IconRobot />
          <span>Play vs AI</span>
        </button>
        <button type="button" className="gp-mode-btn gp-mode-btn--ghost" onClick={onPickFriends}>
          <IconFriendPlus />
          <span>Play a friend</span>
        </button>
      </div>
      <button type="button" className="gp-play-friend__back gp-mode-modal__back" onClick={handleBack}>Go back</button>
    </div>
  );
}

function ResignModal({ onClose }) {
  return (
    <div className="modal modal--sm gp-modal-center">
      <ModalCloseButton onClose={onClose} />
      <h2 className="modal__title">Resign</h2>
      <p className="modal__desc gp-modal-question">Are you sure you want to Resign?</p>
      <button className="gp-modal-btn gp-modal-btn--resign">Resign</button>
      <button className="gp-modal-btn gp-modal-btn--outline" onClick={onClose}>Go back</button>
    </div>
  );
}

function GameOverModal({ isVictory, onClose }) {
  const [friendStep, setFriendStep] = useState('main'); // 'main' | 'confirm' | 'sent'
  const [friendOverride, setFriendOverride] = useSessionState('pp-relationship:Michael', null);
  const { requireAuth } = useRequireAuth();
  const friendSent = friendStep === 'sent' || friendOverride === 'Pending' || friendOverride === 'Friends';

  return (
    <div className="modal modal--sm gp-modal-center gp-modal-slider-clip">
      <button className="gp-modal-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className="gp-modal-slider-track">
      <div className={`gp-modal-slider${friendStep === 'confirm' ? ' gp-modal-slider--confirm' : ''}`}>
        {/* ── Panel 1: Main ── */}
        <div className="gp-modal-slider__panel">
          <div className="gp-modal-emoji">{isVictory ? '🏆' : '😨'}</div>
          <h2 className="modal__title">{isVictory ? 'Victory!' : 'Defeat!'}</h2>
          <p className="modal__desc gp-modal-desc">
            {isVictory
              ? 'Congratulations! You won the game.'
              : 'Better luck next time!'}
          </p>
          {/* Players matchup row */}
          <div className="gp-matchup">
            {/* Left player (you) */}
            <div className="gp-matchup__player">
              <span className={`gp-matchup__winner-pill${isVictory ? '' : ' gp-matchup__winner-pill--hidden'}`}>Winner!</span>
              <div className="gp-matchup__avatar-wrap">
                <Avatar src={avatarGhosty} alt="RobertTHeathIsMyFullName" size="xl" />
              </div>
              <span className="gp-matchup__name">RobertTHeathIsMyFullName</span>
            </div>
            {/* Center score */}
            <div className="gp-matchup__score-center">
              <span className="gp-matchup__score-num">15</span>
              <span className="gp-matchup__score-sep">|</span>
              <span className="gp-matchup__score-num">4</span>
            </div>
            {/* Right player (opponent) */}
            <div className="gp-matchup__player">
              <span className={`gp-matchup__winner-pill${!isVictory ? '' : ' gp-matchup__winner-pill--hidden'}`}>Winner!</span>
              <div className="gp-matchup__avatar-wrap">
                <Avatar src={avatarGobby} alt="Michael" size="xl" />
                <button
                  className={`add-friend-btn${friendSent ? ' add-friend-btn--sent' : ''}`}
                  onClick={requireAuth(() => setFriendStep('confirm'))}
                  disabled={friendSent}
                  title={friendSent ? 'Request sent' : 'Add friend'}
                >
                  {friendSent ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Friend request sent">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <img src={friendAddIcon} alt="Add friend" width="18" height="18" />
                  )}
                </button>
              </div>
              <span className="gp-matchup__name">Michael</span>
            </div>
          </div>

          <div className="gp-modal-actions">
            <button className="com-btn com-btn--dark" style={{ width: '100%' }}>Rematch</button>
            <div className="surface-inverse" style={{ width: '100%', background: 'transparent' }}>
              <button className="com-btn com-btn--outline" style={{ width: '100%' }}>New Quick Play</button>
            </div>
          </div>
          <button className="gp-modal-link">Back to Backgammon.com</button>
        </div>

        {/* ── Panel 2: Confirm friend request ── */}
        <div className="gp-modal-slider__panel gp-modal-slider__panel--confirm">
          <button className="gp-modal-back" onClick={() => setFriendStep('main')}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>Back</span>
          </button>
          <div className="gp-confirm-content">
            <Avatar src={avatarGobby} alt="Michael" size="xl" />
            <p className="modal__desc gp-confirm-text">Send a friend request to <strong>Michael</strong>?</p>
            <button
              className="com-btn com-btn--dark"
              style={{ width: '100%' }}
              onClick={() => { setFriendStep('sent'); setFriendOverride('Pending'); }}
            >
              Send Friend Request
            </button>
            <div className="surface-inverse" style={{ width: '100%', background: 'transparent' }}>
              <button className="com-btn com-btn--outline" style={{ width: '100%' }} onClick={() => setFriendStep('main')}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
      </div>{/* close slider-track */}
    </div>
  );
}

function SettingsModal() {
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const speeds = ['Slow', 'Normal', 'Fast'];
  return (
    <div className="modal modal--sm gp-modal-center">
      <h2 className="modal__title">Game Settings</h2>
      <label className="gp-modal-label">Difficulty</label>
      <div className="gp-settings-grid">
        {difficulties.map((d, i) => (
          <button key={d} className={`gp-settings-option${i === 1 ? ' gp-settings-option--active' : ''}`}>{d}</button>
        ))}
      </div>
      <label className="gp-modal-label">Speed</label>
      <div className="gp-settings-row">
        {speeds.map((s, i) => (
          <button key={s} className={`gp-settings-option${i === 1 ? ' gp-settings-option--active' : ''}`}>{s}</button>
        ))}
      </div>
      <button className="gp-modal-btn gp-modal-btn--primary">Start game</button>
      <button className="gp-modal-link">Go back</button>
    </div>
  );
}

function ModalOverlay({ modalType, onClose, onNavigate }) {
  const setDmeStates = useDMESetState();
  const closeModal = () => {
    onClose?.();
    setDmeStates(prev => ({ ...prev, 'play.modal': 'None' }));
  };
  if (!modalType || modalType === 'None') return null;
  return (
    <div
      className="overlay overlay--dark"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
    >
      {modalType === 'Menu' && <MenuModal onClose={closeModal} />}
      {modalType === 'Resign' && <ResignModal onClose={closeModal} />}
      {modalType === 'Game Mode' && (
        <GameModeModal
          onClose={closeModal}
          onNavigate={onNavigate}
          onPickFriends={() => {
            setDmeStates(prev => ({ ...prev, 'play.modal': 'None', 'play.challengeModal': 'Choose Mode' }));
          }}
        />
      )}
      {modalType === 'Victory' && <GameOverModal isVictory={true} onClose={closeModal} />}
      {modalType === 'Defeat' && <GameOverModal isVictory={false} onClose={closeModal} />}
      {modalType === 'Settings' && <SettingsModal />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   In-Game Profile Card — uses the baseball card (PlayerCardModal)
   ═══════════════════════════════════════════════════════════════ */

const OPPONENT_PLAYER = {
  displayName: 'GammonKing42',
  joinDate: 'Joined August 2023',
  stats: { wins: 842, gamesPlayed: 1247, currentStreak: 12, highestStreak: 28 },
};

function InGameProfileCard({ onClose }) {
  const showQR = useDMEState('play.cardShowQR', true);
  const showLogo = useDMEState('play.cardShowLogo', true);
  const showDownload = useDMEState('play.cardShowDownload', true);
  const opponentIsFriend = useDMEState('play.opponentIsFriend', false);
  const { requireAuth } = useRequireAuth();
  const [friendOverride, setFriendOverride] = useSessionState(
    `pp-relationship:${OPPONENT_PLAYER.displayName || 'unknown'}`,
    null,
  );
  const friendSent = friendOverride === 'Pending' || friendOverride === 'Friends';

  return (
    <PlayerCardModal
      player={OPPONENT_PLAYER}
      coverImg={coverDefault}
      coverColor={null}
      avatarImg={avatarKing}
      showQR={showQR}
      showLogo={showLogo}
      showDownload={showDownload}
      showAddFriend={!opponentIsFriend}
      friendSent={friendSent}
      onAddFriend={requireAuth(() => setFriendOverride('Pending'))}
      onClose={onClose}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   Challenge Modal — send/receive/expired challenge states

   ═══════════════════════════════════════════════════════════════ */

function ChallengeModal({ type, onClose }) {
  if (type === 'None') return null;

  if (type === 'Incoming Challenge') {
    return (
      <div className="gp-challenge-toast">
        <div className="gp-challenge-toast__avatar">
          <img src={avatarKing} alt="BoardMaster" />
        </div>
        <div className="gp-challenge-toast__info">
          <strong>BoardMaster</strong> challenged you to a <strong>5-point match</strong>
        </div>
        <div className="gp-challenge-toast__actions">
          <button className="friend-btn friend-btn--accept" onClick={onClose}>Accept</button>
          <button className="friend-btn friend-btn--decline" onClick={onClose}>Decline</button>
        </div>
      </div>
    );
  }

  if (type === 'Challenge Expired') {
    return (
      <div className="gp-challenge-toast gp-challenge-toast--expired">
        <div className="gp-challenge-toast__info">
          Challenge from <strong>BoardMaster</strong> has expired
        </div>
        <button className="gp-challenge-toast__dismiss" onClick={onClose}>&times;</button>
      </div>
    );
  }

  if (type === 'Choose Mode') {
    return <ChooseModeModal onClose={onClose} />;
  }

  if (type === 'Setup Game') {
    // Speed picker without a specific opponent (Play-a-Friend flow)
    return <PlayFriendModal onClose={onClose} flow="setup" />;
  }

  if (type === 'Game Ready') {
    return <GameReadyModal onClose={onClose} />;
  }

  // Send Challenge — "Play a friend" speed picker (with specific opponent)
  return <PlayFriendModal opponent={{ username: 'GammonKing42', avatar: avatarKing }} onClose={onClose} flow="challenge" />;
}

function ChooseModeModal({ onClose }) {
  const setDmeStates = useDMESetState();
  // Go back from this modal walks the user back to the Game Mode picker
  // (Quick game / Play vs AI / Play a friend) so they're never abandoned
  // on a blank play screen mid-flow.
  const goBack = () => setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'None', 'play.modal': 'Game Mode' }));
  return (
    <div className="overlay overlay--dark" onClick={(e) => { if (e.target === e.currentTarget) goBack(); }}>
      <div className="modal modal--sm gp-play-friend">
        <div className="gp-play-friend__head">
          <h2 className="gp-play-friend__title">Play a friend</h2>
        </div>
        <p className="modal__desc" style={{ textAlign: 'center', marginBottom: 20 }}>Create a new game or join existing one</p>
        <button
          type="button"
          className="gp-mode-btn gp-mode-btn--primary"
          onClick={() => setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Setup Game' }))}
        >
          <IconFriendPlus />
          <span>Create new game</span>
        </button>
        <div style={{ height: 8 }} />
        <button
          type="button"
          className="gp-mode-btn gp-mode-btn--ghost"
          onClick={onClose}
        >
          <span><strong>Join game</strong> <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>(8-digit code)</span></span>
        </button>
        <button className="gp-play-friend__back" style={{ marginTop: 16 }} onClick={goBack}>Go back</button>
      </div>
    </div>
  );
}

function GameReadyModal({ onClose }) {
  const onlineFriends = MOCK_FRIENDS.filter(f => f.online);
  const gameCode = '13K0XFE7';
  const setDmeStates = useDMESetState();
  const [, setChallengedFriend] = useSessionState('play.challengedFriend', null);
  const [sentId, setSentId] = useState(null);
  const goBack = () => setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Setup Game' }));
  const handleChallenge = (friend) => {
    if (sentId) return;
    setSentId(friend.id);
    // Persist the challenged friend so the game-board TopBar can swap the
    // opponent badge over to them with the "WAITING FOR OPPONENT" subtitle.
    setChallengedFriend({ username: friend.username, avatar: friend.avatar });
    setTimeout(() => {
      setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'None' }));
    }, 1000);
  };
  return (
    <div className="overlay overlay--dark" onClick={(e) => { if (e.target === e.currentTarget) goBack(); }}>
      <div className="modal modal--sm gp-play-friend gp-game-ready">
        <div className="gp-play-friend__head">
          <h2 className="gp-play-friend__title">Game ready!</h2>
        </div>
        <p className="modal__desc gp-game-ready__desc">
          Challenge an online friend, or share the invite link for someone to join.
        </p>

        <div className="gp-game-ready__friends">
          <div className="gp-game-ready__friends-label">Online friends</div>
          <div className="gp-game-ready__friends-scroll">
            {onlineFriends.map(f => {
              const sent = sentId === f.id;
              return (
                <div key={f.id} className="gp-game-ready__friend-row">
                  <Avatar src={getAvatarSrc(f.avatar)} alt={f.username} size="sm" online />
                  <span className="gp-game-ready__friend-name">{f.username}</span>
                  <button
                    className="com-btn com-btn--primary com-btn--xsm"
                    onClick={() => handleChallenge(f)}
                    disabled={!!sentId}
                  >
                    {sent ? 'Challenge Sent' : 'Challenge'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gp-game-ready__or">
          <span>Or send an invite link</span>
        </div>

        <div className="gp-game-ready__share">
          <button
            className="gp-game-ready__share-btn gp-game-ready__share-btn--primary"
            onClick={() => {
              const url = `${window.location.origin}/?game=${gameCode}`;
              try {
                if (navigator.share) navigator.share({ title: 'Backgammon.com', url });
              } catch {}
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span>Share link</span>
          </button>
          <button
            className="gp-game-ready__share-btn gp-game-ready__share-btn--outline"
            onClick={() => {
              const url = `${window.location.origin}/?game=${gameCode}`;
              try { navigator.clipboard?.writeText(url); } catch {}
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy link</span>
          </button>
        </div>

        <div className="gp-game-ready__code">
          <span>Backgammon.com game code</span>
          <strong>{gameCode}</strong>
          <button className="gp-game-ready__code-copy" aria-label="Copy game code" onClick={() => { try { navigator.clipboard?.writeText(gameCode); } catch {} }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        <button className="gp-play-friend__back gp-game-ready__back" onClick={goBack}>Go back</button>
      </div>
    </div>
  );
}

const SPEED_OPTIONS = [
  { key: 'Casual',   round: '60s', clock: '20min' },
  { key: 'Standard', round: '30s', clock: '5min' },
  { key: 'Quick',    round: '12s', clock: '2min' },
];

function PlayFriendModal({ opponent, onClose, flow = 'challenge' }) {
  const [speed, setSpeed] = useState('Casual');
  const current = SPEED_OPTIONS.find(o => o.key === speed) || SPEED_OPTIONS[0];
  const setDmeStates = useDMESetState();
  const advance = () => {
    if (flow === 'setup') {
      // Play-a-Friend flow: advance to the Game Ready (share / friends) modal.
      setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Game Ready' }));
    } else {
      // Direct challenge: just close (challenge has been sent).
      onClose?.();
    }
  };
  // Go back walks the chain: Setup Game → Choose Mode (in the play-a-friend
  // flow). Direct-challenge flow has no chain so falls back to onClose.
  const goBack = () => {
    if (flow === 'setup') {
      setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'Choose Mode' }));
    } else {
      onClose?.();
    }
  };

  return (
    <div className="overlay overlay--dark" onClick={(e) => { if (e.target === e.currentTarget) goBack(); }}>
      <div className="modal modal--sm gp-play-friend">
        <div className="gp-play-friend__head">
          {opponent && (
            <>
              <div className="gp-challenge-avatar">
                <img src={opponent.avatar} alt={opponent.username} />
              </div>
              <div className="gp-play-friend__username">{opponent.username}</div>
            </>
          )}
          <h2 className="gp-play-friend__title">Play a friend</h2>
        </div>

        <div className="gp-play-friend__section">
          <div className="gp-play-friend__section-label">
            <span className="gp-play-friend__icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.4" d="M2.10001 8.50001C2.10001 10.1974 2.77429 11.8253 3.97452 13.0255C5.17476 14.2257 6.80262 14.9 8.50001 14.9C10.1974 14.9 11.8253 14.2257 13.0255 13.0255C14.2257 11.8253 14.9 10.1974 14.9 8.50001C14.9 6.80262 14.2257 5.17476 13.0255 3.97452C11.8253 2.77429 10.1974 2.10001 8.50001 2.10001C6.80262 2.10001 5.17476 2.77429 3.97452 3.97452C2.77429 5.17476 2.10001 6.80262 2.10001 8.50001ZM7.90251 5.03751C7.90501 5.01751 7.90751 4.99751 7.91251 4.97751C7.92001 4.93751 7.93251 4.90001 7.94751 4.86501C7.97751 4.79251 8.02251 4.72751 8.07501 4.67501C8.18251 4.56751 8.33251 4.50001 8.50001 4.50001C8.83251 4.50001 9.10001 4.76751 9.10001 5.10001V8.18001C9.81001 8.65501 10.5225 9.12751 11.2325 9.60251C11.5075 9.78751 11.5825 10.1575 11.4 10.435C11.2175 10.7125 10.8425 10.785 10.5675 10.6025C9.76751 10.07 8.96751 9.53501 8.16751 9.00251C8.08501 8.94751 8.01751 8.87251 7.97251 8.78751C7.95001 8.74501 7.93251 8.70001 7.92001 8.65251C7.91501 8.62751 7.91001 8.60501 7.90751 8.58001C7.90501 8.56751 7.90501 8.55501 7.90501 8.54251C7.90501 8.53001 7.90501 8.52001 7.90501 8.50501C7.90501 7.37251 7.90501 6.23751 7.90501 5.09751C7.90501 5.08251 7.90501 5.06251 7.90751 5.04251L7.90251 5.03751Z" fill="#4f8d7b" />
                <path d="M8.49999 4.5C8.16749 4.5 7.89999 4.7675 7.89999 5.1V8.5C7.89999 8.7 7.99999 8.8875 8.16749 9L10.5675 10.6C10.8425 10.785 11.215 10.71 11.4 10.4325C11.585 10.155 11.51 9.785 11.2325 9.6L9.09999 8.18V5.1C9.09999 4.7675 8.83249 4.5 8.49999 4.5Z" fill="#4f8d7b" />
              </svg>
            </span>
            <span>Speed</span>
          </div>
          <div className="gp-play-friend__options">
            {SPEED_OPTIONS.map(o => (
              <button
                key={o.key}
                type="button"
                className={`gp-play-friend__option${speed === o.key ? ' gp-play-friend__option--active' : ''}`}
                onClick={() => setSpeed(o.key)}
              >
                {o.key}
              </button>
            ))}
          </div>
          <div className="gp-play-friend__detail">
            <strong>{current.round}</strong> rounds, <strong>{current.clock}</strong> clock
          </div>
        </div>

        <button className="gp-play-friend__cta" onClick={advance}>Create game</button>
        <button className="gp-play-friend__back" onClick={goBack}>Go back</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PlayPage (root)
   ═══════════════════════════════════════════════════════════════ */

export default function PlayPage({ onNavigate }) {
  const boardState = useDMEState('play.boardState', 'Opening');
  const modalState = useDMEState('play.modal', 'None');
  const dmeProfileCard = useDMEState('play.profileCard', false);
  const challengeModal = useDMEState('play.challengeModal', 'None');
  const setDmeStates = useDMESetState();
  const [localProfileCard, setLocalProfileCard] = useState(false);
  const showProfileCard = dmeProfileCard || localProfileCard;
  const preset = BOARD_PRESETS[boardState] || BOARD_PRESETS['Opening'];

  const effectiveModal = (modalState === 'None' && preset.autoModal)
    ? preset.autoModal
    : modalState;

  // Closing in-game UI must mirror the DME state back so the State Controller
  // and the in-page close X stay in sync. Otherwise toggling something on via
  // DME locks the UI open until you flip DME back manually.
  const closeProfileCard = () => {
    setLocalProfileCard(false);
    if (dmeProfileCard) {
      setDmeStates(prev => ({ ...prev, 'play.profileCard': false }));
    }
  };
  // ModalOverlay manages its own DME-state write internally, so no extra
  // prop is needed for the play.modal sync.
  const closeChallengeModal = () => {
    if (challengeModal !== 'None') {
      setDmeStates(prev => ({ ...prev, 'play.challengeModal': 'None' }));
    }
  };

  return (
    <div className="gp-page" data-section-id="gp-board">
      <div className="gp-page-inner">
        <TopBar logoSrc={logoBlack} onNavigate={onNavigate} onOpponentClick={() => setLocalProfileCard(true)} />
        <TimerBar preset={preset} />
        <div className="gp-game-area">
          <div className="gp-game-container">
            <Board preset={preset} />
            <Sidebar preset={preset} />
          </div>
        </div>
      </div>
      <ModalOverlay modalType={effectiveModal} onNavigate={onNavigate} />
      {showProfileCard && <InGameProfileCard onClose={closeProfileCard} />}
      <ChallengeModal type={challengeModal} onClose={closeChallengeModal} />
    </div>
  );
}
