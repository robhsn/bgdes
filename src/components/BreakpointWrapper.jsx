import React from 'react';
import './BreakpointWrapper.css';

const BREAKPOINTS = {
  xsm: 375,
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
};

const BEZEL_KEYS = new Set(['xsm', 'sm', 'md']);

export default function BreakpointWrapper({ breakpoint, children }) {
  if (!breakpoint) return children;

  const width = BREAKPOINTS[breakpoint];
  if (!width) return children;

  if (BEZEL_KEYS.has(breakpoint)) {
    return (
      <div className="bpw-workspace">
        <div className="bpw-device" style={{ width: width + 8 }}>
          <div className="bpw-notch-area">
            <div className="bpw-notch" />
          </div>
          <div className="bpw-screen" style={{ width }}>
            {children}
          </div>
          <div className="bpw-home-indicator-area">
            <div className="bpw-home-indicator" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bpw-workspace">
      <div className="bpw-container" style={{ width }}>
        {children}
      </div>
    </div>
  );
}
