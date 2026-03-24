import React, { useState } from 'react';
import { useDMEState } from '../context/dme-states';
import BOARD_PRESETS from '../data/board-presets';
import { MOCK_FRIENDS } from '../data/social-mock-data';
import avatarDrac from '../imgs/avatars/Drac.png';
import avatarSoldier from '../imgs/avatars/Soldier.png';
import avatarKing from '../imgs/avatars/King.png';
import avatarGhosty from '../imgs/avatars/Ghosty.png';
import avatarGobby from '../imgs/avatars/Gobby.png';
import friendAddIcon from '../imgs/icons/Friend Add.svg';
import Avatar from './Avatar';
import logoBlack from '../imgs/logo/Logo Black.svg';
import './PlayPage.css';

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

function PlayerBadge({ name, color, avatarSrc, isRight, onClick }) {
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
          <PlayerBadge name="Rusty (Beginner Bot)" color="black" avatarSrc={avatarSoldier} isRight onClick={onOpponentClick} />
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

function ToggleRow({ label, defaultOn }) {
  return (
    <div className="gp-modal-toggle-row">
      <span>{label}</span>
      <div className={`gp-toggle ${defaultOn ? 'gp-toggle--on' : ''}`}>
        <div className="gp-toggle-knob" />
      </div>
    </div>
  );
}

function MenuModal() {
  return (
    <div className="modal modal--sm gp-modal-center">
      <h2 className="modal__title">Menu</h2>
      <ToggleRow label="Sound effects" defaultOn={true} />
      <ToggleRow label="Automatic moves" defaultOn={true} />
      <div className="gp-modal-divider" />
      <button className="gp-modal-btn gp-modal-btn--resign">Resign</button>
    </div>
  );
}

function ResignModal() {
  return (
    <div className="modal modal--sm gp-modal-center">
      <h2 className="modal__title">Resign</h2>
      <p className="gp-modal-question">Are you sure you want to Resign?</p>
      <button className="gp-modal-btn gp-modal-btn--resign">Resign</button>
      <button className="gp-modal-btn gp-modal-btn--outline">Go back</button>
    </div>
  );
}

function GameOverModal({ isVictory }) {
  const [friendSent, setFriendSent] = useState(false);

  return (
    <div className="modal modal--sm gp-modal-center">
      <div className="gp-modal-emoji">{isVictory ? '🏆' : '😨'}</div>
      <h2 className="modal__title">{isVictory ? 'Victory!' : 'Defeat!'}</h2>
      <p className="gp-modal-desc">
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
              className={`gp-matchup__add-friend${friendSent ? ' gp-matchup__add-friend--sent' : ''}`}
              onClick={() => setFriendSent(true)}
              disabled={friendSent}
              title={friendSent ? 'Request sent' : 'Add friend'}
            >
              <img src={friendAddIcon} alt="Add friend" width="18" height="18" />
            </button>
          </div>
          <span className="gp-matchup__name">Michael</span>
        </div>
      </div>

      <button className="com-btn com-btn--dark" style={{ width: '100%' }}>Rematch</button>
      <div className="surface-inverse" style={{ width: '100%', background: 'transparent' }}>
        <button className="com-btn com-btn--outline" style={{ width: '100%' }}>New Quick Play</button>
      </div>
      <button className="gp-modal-link">Back to Backgammon.com</button>
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

function ModalOverlay({ modalType }) {
  if (!modalType || modalType === 'None') return null;
  return (
    <div className="overlay overlay--dark">
      {modalType === 'Menu' && <MenuModal />}
      {modalType === 'Resign' && <ResignModal />}
      {modalType === 'Victory' && <GameOverModal isVictory={true} />}
      {modalType === 'Defeat' && <GameOverModal isVictory={false} />}
      {modalType === 'Settings' && <SettingsModal />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   In-Game Profile Card — mini popover for opponent info
   ═══════════════════════════════════════════════════════════════ */

function InGameProfileCard({ onClose }) {
  const opponent = {
    name: 'GammonKing42',
    rating: 1650,
    online: true,
    stats: { wins: 842, games: 1247, streak: 12, best: 28 },
  };

  return (
    <div className="overlay overlay--dark" onClick={onClose}>
      <div className="modal modal--sm gp-profile-card" onClick={e => e.stopPropagation()}>
        <button className="gp-profile-card__close" onClick={onClose}>&times;</button>
        <div className="gp-profile-card__cover" />
        <div className="gp-profile-card__avatar">
          <Avatar src={avatarKing} alt={opponent.name} size="xl" online={opponent.online} />
        </div>
        <div className="gp-profile-card__body">
          <div className="gp-profile-card__name-row">
            <span className="gp-profile-card__name">{opponent.name}</span>
          </div>
          <div className="gp-profile-card__rating">{opponent.rating}</div>
          <div className="gp-profile-card__stats">
            {[
              { label: 'Wins', value: opponent.stats.wins },
              { label: 'Games', value: opponent.stats.games },
              { label: 'Streak', value: opponent.stats.streak },
              { label: 'Best', value: opponent.stats.best },
            ].map((s, i) => (
              <div key={s.label} className="gp-profile-card__stat">
                <div className="gp-profile-card__stat-num">{s.value.toLocaleString()}</div>
                <div className="gp-profile-card__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="gp-profile-card__actions">
            <button className="friend-btn friend-btn--add-friend">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Add Friend
            </button>
            <span className="gp-profile-card__view-link">View Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Challenge Modal — send/receive/expired challenge states

   ═══════════════════════════════════════════════════════════════ */

function ChallengeModal({ type }) {
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
          <button className="friend-btn friend-btn--accept">Accept</button>
          <button className="friend-btn friend-btn--decline">Decline</button>
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
        <button className="gp-challenge-toast__dismiss">&times;</button>
      </div>
    );
  }

  // Send Challenge
  return (
    <div className="overlay overlay--dark">
      <div className="modal modal--sm gp-modal-center">
        <div className="gp-challenge-avatar">
          <img src={avatarKing} alt="GammonKing42" />
        </div>
        <h2 className="modal__title">GammonKing42</h2>
        <div className="gp-challenge-rating">1650</div>
        <label className="gp-modal-label">Match Format</label>
        <div className="gp-settings-grid">
          {['Single', '3-pt', '5-pt', '7-pt'].map((f, i) => (
            <button key={f} className={`gp-settings-option${i === 2 ? ' gp-settings-option--active' : ''}`}>{f}</button>
          ))}
        </div>
        <button className="gp-modal-btn gp-modal-btn--primary">Send Challenge</button>
        <button className="gp-modal-link">Cancel</button>
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
  const [localProfileCard, setLocalProfileCard] = useState(false);
  const showProfileCard = dmeProfileCard || localProfileCard;
  const preset = BOARD_PRESETS[boardState] || BOARD_PRESETS['Opening'];

  const effectiveModal = (modalState === 'None' && preset.autoModal)
    ? preset.autoModal
    : modalState;

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
      <ModalOverlay modalType={effectiveModal} />
      {showProfileCard && <InGameProfileCard onClose={() => setLocalProfileCard(false)} />}
      <ChallengeModal type={challengeModal} />
    </div>
  );
}
