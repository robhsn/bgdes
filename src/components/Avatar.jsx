import React from 'react';

/**
 * Shared Avatar component — used across all pages.
 *
 * Props:
 *   src       — image URL (null → fallback initial)
 *   alt       — alt text for the image
 *   size      — 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'profile' (default 'md')
 *   online    — true | false | undefined (undefined = no indicator)
 *   showIndicator — force indicator visibility (defaults to online !== undefined)
 *   fallbackInitial — single character shown when src is null
 *   clickable — adds pointer cursor
 *   onClick   — click handler
 *   className — additional class
 *   style     — additional inline styles
 */

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  profile: 192,
};

const INDICATOR_SIZE = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  profile: 18,
};

const BORDER_WIDTH = {
  xs: 1.5,
  sm: 2,
  md: 2,
  lg: 2,
  xl: 2.5,
  profile: 3,
};

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  online,
  showIndicator,
  fallbackInitial,
  clickable,
  onClick,
  className = '',
  style,
}) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const indicatorPx = INDICATOR_SIZE[size] || 10;
  const borderPx = BORDER_WIDTH[size] || 2;
  const hasIndicator = showIndicator ?? online !== undefined;

  return (
    <div
      className={`avatar-component avatar-component--${size}${clickable ? ' avatar-component--clickable' : ''} ${className}`.trim()}
      style={{
        width: px,
        height: px,
        ...style,
      }}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="avatar-component__img"
        />
      ) : (
        <div className="avatar-component__fallback">
          {fallbackInitial || '?'}
        </div>
      )}
      {hasIndicator && (
        <span
          className={`avatar-component__indicator${online ? ' avatar-component__indicator--online' : ' avatar-component__indicator--offline'}`}
          style={{
            width: indicatorPx,
            height: indicatorPx,
            borderWidth: borderPx,
          }}
        />
      )}
    </div>
  );
}
