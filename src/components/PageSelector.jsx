import React, { useState, useEffect, useRef } from 'react';
import './PageSelector.css';

/* ── Grid icon ── */
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="0" y="0" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="8" y="0" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="0" y="8" width="6" height="6" rx="1.5" fill="currentColor"/>
      <rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

/* ── Check icon ── */
function IconCheck() {
  return (
    <svg width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden>
      <path d="M1 3.5L4 6.5L10 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/**
 * PageSelector — floating fixed bottom-right page navigator.
 *
 * Props:
 *   pages        — array of { id: string, label: string }
 *   currentPageId — id of the active page
 *   onNavigate   — callback(pageId) when user picks a page
 */
export function PageSelector({ pages, currentPageId, onNavigate, visible }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  /* Collapse menu when hidden */
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!visible) return null;

  return (
    <div className="ps-root" ref={rootRef}>

      {/* Expanded menu — appears above the trigger */}
      {open && (
        <div className="ps-menu" role="listbox" aria-label="Page navigation">
          <div className="ps-menu-header">Pages</div>
          {pages.map(page => (
            <button
              key={page.id}
              className={`ps-item${page.id === currentPageId ? ' ps-item--active' : ''}`}
              role="option"
              aria-selected={page.id === currentPageId}
              onClick={() => { onNavigate(page.id); setOpen(false); }}
            >
              <span className="ps-item-check">
                {page.id === currentPageId && <IconCheck />}
              </span>
              <span className="ps-item-label">{page.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trigger pill */}
      <button
        className={`ps-trigger${open ? ' ps-trigger--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Switch page"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <IconGrid />
        <span>Pages</span>
        <span className="ps-count">{pages.length}</span>
      </button>

    </div>
  );
}
