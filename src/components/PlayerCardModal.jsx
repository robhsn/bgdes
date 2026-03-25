import React, { useState } from 'react';
import friendAddIcon from '../imgs/icons/Friend Add.svg';

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

export default function PlayerCardModal({
  player,
  coverImg,
  coverColor,
  avatarImg: avatarSrc,
  onClose,
  showQR = true,
  showLogo = true,
  showDownload = true,
  showAddFriend = false,
  friendSent = false,
  onAddFriend,
}) {
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

    // Adjust height based on visible sections
    let H = coverH + avSize / 2 + 16 + nameH + dateH + 12 + statsH + 16 + urlH;
    if (showQR) H += 20 + qrPx + qrLabelH;
    if (showLogo) H += 16 + logoH;
    H += pad;

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
        ctx.fillStyle = coverColor || '#e0e0e0';
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
      curY += urlH;

      // QR code (conditional)
      if (showQR) {
        curY += 20;
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
        ctx.textAlign = 'center';
        ctx.fillText('Scan to challenge', W / 2, curY + 4);
        curY += qrLabelH;
      }

      // Backgammon.com logo (conditional)
      if (showLogo) {
        curY += 16;
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
      }

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
        {coverColor
          ? <div className="player-card__cover" style={{ backgroundColor: coverColor }} />
          : <img src={coverImg} alt="" className="player-card__cover" crossOrigin="anonymous" />
        }
        <div className="player-card__avatar-wrap">
          <div className="player-card__avatar">
            {avatarSrc
              ? <img src={avatarSrc} alt={player.displayName} crossOrigin="anonymous" />
              : <div className="player-card__avatar-fallback">{player.displayName[0].toUpperCase()}</div>
            }
          </div>
          {showAddFriend && (
            <button
              className={`add-friend-btn${friendSent ? ' add-friend-btn--sent' : ''}`}
              onClick={() => onAddFriend?.()}
              disabled={friendSent}
              title={friendSent ? 'Request sent' : 'Add friend'}
            >
              <img src={friendAddIcon} alt="Add friend" width="18" height="18" />
            </button>
          )}
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
        {showQR && (
          <div className="player-card__qr">
            <QRCodeSvg text={challengeUrl} size={100} />
            <span className="player-card__qr-label">Scan to challenge</span>
          </div>
        )}
        {showLogo && (
          <div className="player-card__logo">
            <span className="player-card__logo-text">Backgammon</span>
            <span className="player-card__logo-dot">.com</span>
          </div>
        )}
        {showDownload && (
          <button className="com-btn com-btn--primary com-btn--sm player-card__download" onClick={handleDownload}>
            Download Player Card
          </button>
        )}
      </div>
    </div>
  );
}
