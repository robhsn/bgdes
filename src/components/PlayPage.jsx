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
import Avatar from './Avatar';
import PlayerCardModal from './PlayerCardModal';
import logoBlack from '../imgs/logo/Logo Black.svg';
import coverDefault from '../imgs/cover-image.jpg';
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
            <p className="gp-confirm-text">Send a friend request to <strong>Michael</strong>?</p>
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

function ModalOverlay({ modalType, onClose }) {
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
      {modalType === 'Menu' && <MenuModal />}
      {modalType === 'Resign' && <ResignModal />}
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

  // Send Challenge — "Play a friend" speed picker
  return <PlayFriendModal opponent={{ username: 'GammonKing42', avatar: avatarKing }} onClose={onClose} />;
}

const SPEED_OPTIONS = [
  { key: 'Casual',   round: '60s', clock: '20min' },
  { key: 'Standard', round: '30s', clock: '5min' },
  { key: 'Quick',    round: '12s', clock: '2min' },
];

function PlayFriendModal({ opponent, onClose }) {
  const [speed, setSpeed] = useState('Casual');
  const current = SPEED_OPTIONS.find(o => o.key === speed) || SPEED_OPTIONS[0];

  return (
    <div className="overlay overlay--dark" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal modal--sm gp-play-friend">
        <div className="gp-play-friend__head">
          <div className="gp-challenge-avatar">
            <img src={opponent.avatar} alt={opponent.username} />
          </div>
          <div className="gp-play-friend__username">{opponent.username}</div>
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

        <button className="gp-play-friend__cta" onClick={onClose}>Create game</button>
        <button className="gp-play-friend__back" onClick={onClose}>Go back</button>
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
      <ModalOverlay modalType={effectiveModal} />
      {showProfileCard && <InGameProfileCard onClose={closeProfileCard} />}
      <ChallengeModal type={challengeModal} onClose={closeChallengeModal} />
    </div>
  );
}
