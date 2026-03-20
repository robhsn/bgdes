import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import IndexPage from './components/IndexPage'
import ProfilePage from './components/ProfilePage'
import PlayPage from './components/PlayPage'
import SettingsPage from './components/SettingsPage'
import NotificationsPage from './components/NotificationsPage'
import TokensPage from './components/TokensPage'
import TokenEditor from './components/TokenEditor'
import DevModeInspector from './components/DevModeInspector'
import CommentsInspector from './components/CommentsInspector'
import PageNavigator from './components/PageNavigator'
import RadialFAB from './components/RadialFAB'
import RoleTargeter from './components/RoleTargeter'
import StatesPanel from './components/StatesPanel'
import { DMEStatesContext } from './context/dme-states'
import './styles/tokens.css'
import './styles/surfaces.css'
import './styles/animations.css'
import './styles/blocks.css'
import './components/ComButtons.css'
import fileDefaults from './tokens/dme-defaults.json'
import savedComments from './data/comments.json'

/*
 * Page registry — add new pages here as the project grows.
 * Each entry: { id: string, label: string }
 */
const PAGES = [
  { id: 'index',           label: 'Index' },
  { id: 'learn-hub',      label: 'Learn Hub' },
  { id: 'learn-article',  label: 'Lesson 1: How to Play' },
  { id: 'play',           label: 'Play' },
  { id: 'profile',        label: 'Profile' },
  { id: 'settings',       label: 'Settings' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'tokens',         label: 'Design Tokens' },
]

const PAGE_IDS = new Set(PAGES.map(p => p.id))

function getInitialPage() {
  const urlPage = new URLSearchParams(window.location.search).get('page')
  if (urlPage && PAGE_IDS.has(urlPage)) return urlPage
  const stored = sessionStorage.getItem('dme-page')
  if (stored && PAGE_IDS.has(stored)) return stored
  return 'learn-hub'
}

const INIT_STATES = fileDefaults.states ?? { 'auth.loggedIn': true }
const INIT_ROLE_OVERRIDES = fileDefaults.roleOverrides ?? {}

/* ─── Shortcut sequences ─────────────────────────────────────── */
const TOKENS_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown']
const STATES_SEQ = ['ArrowLeft','ArrowLeft','ArrowRight','ArrowRight']

/* ─── Role override CSS maps (used by <style> injection) ─────── */
const RO_PAGE_PREFIX = {
  'learn-article': 'ls', 'learn-hub': 'lh', 'profile': 'pp',
  'play': 'gp', 'settings': 'st', 'index': 'ix', 'notifications': 'nt', 'tokens': 'tk',
}
const RO_FONT_SIZE = {
  'h1': 'var(--size-h1)', 'h2': 'var(--size-h2)', 'h3': 'var(--size-h3)',
  'h4': 'var(--size-h4)', 'sh1': 'var(--size-sh1)', 'sh2': 'var(--size-sh2)',
  'sh3': 'var(--size-sh3)', 'sh4': 'var(--size-sh4)',
  'body-lg': 'var(--size-body-lg)', 'body-md': 'var(--size-body)',
  'body-sm': 'var(--size-body-sm)',
  'pill-lg': 'var(--size-pill-lg)', 'pill-md': 'var(--size-pill-md)',
  'pill-sm': 'var(--size-pill-sm)',
  'ui-xl': 'var(--size-ui-xl)', 'ui-lg': 'var(--size-ui-lg)',
  'ui-md': 'var(--size-ui-md)', 'ui-sm': 'var(--size-ui-sm)',
  'ui-xsm': 'var(--size-ui-xsm)',
}
const RO_BTN_CSS = {
  primary:    'background:var(--com-btn-primary-bg)!important;color:var(--com-btn-primary-fg)!important;border:none!important;border-radius:9999px!important',
  dark:       'background:var(--com-btn-dark-bg)!important;color:var(--com-btn-dark-fg)!important;border:none!important;border-radius:9999px!important',
  outline:    'background:transparent!important;color:var(--com-btn-outline-fg)!important;border:2px solid var(--com-btn-outline-border)!important;border-radius:9999px!important;box-shadow:none!important',
  ghost:      'background:transparent!important;color:var(--com-btn-ghost-fg)!important;border:none!important;border-radius:9999px!important;box-shadow:none!important',
  tertiary:   'background:var(--com-btn-tertiary-bg)!important;color:var(--com-btn-tertiary-fg)!important;border:none!important;border-radius:8px!important;box-shadow:none!important',
  quaternary: 'background:var(--com-btn-quaternary-bg)!important;color:var(--com-btn-quaternary-fg)!important;border:none!important;border-radius:8px!important;box-shadow:none!important',
}

/* ─── Convert auto-id to a structural CSS selector ───────────── */
/* Auto-id format: _auto:[sectionId|]tag.class1.class2...:childIndex  */
/* Returns e.g. [data-section-id="pp-friends"] button.com-btn:nth-child(2) */
function autoIdToCSS(id) {
  const body = id.slice(6) // strip '_auto:'
  // Parse optional section scope (format: sectionId|rest)
  let sectionId = null
  let rest = body
  const pipeIdx = body.indexOf('|')
  if (pipeIdx !== -1) {
    sectionId = body.slice(0, pipeIdx)
    rest = body.slice(pipeIdx + 1)
  }
  const lastColon = rest.lastIndexOf(':')
  if (lastColon === -1) return null
  const idx = parseInt(rest.slice(lastColon + 1))
  if (isNaN(idx)) return null
  const tagClasses = rest.slice(0, lastColon)
  const parts = tagClasses.split('.')
  const tag = parts[0]
  const classes = parts.slice(1)
  const elSel = `${tag}${classes.map(c => '.' + CSS.escape(c)).join('')}:nth-child(${idx + 1})`
  if (sectionId) return `[data-section-id="${sectionId}"] ${elSel}`
  return elSel
}

function App() {
  const [currentPageId, setCurrentPageId] = useState(getInitialPage)
  const [activePanel, setActivePanel] = useState(null) // null | 'dme' | 'roletarget' | 'devmode' | 'comments' | 'states'
  const [roleOverrides, setRoleOverrides] = useState(INIT_ROLE_OVERRIDES)
  const [pageNavOpen, setPageNavOpen] = useState(false)
  const [dmeStates, setDmeStates] = useState(INIT_STATES)
  const [commentsByPage, setCommentsByPage] = useState(() => savedComments || {})

  /* ── Apply role overrides via injected <style> (survives React re-renders) ── */
  useLayoutEffect(() => {
    let el = document.getElementById('role-override-styles')
    if (!el) {
      el = document.createElement('style')
      el.id = 'role-override-styles'
      document.head.appendChild(el)
    }
    const prefix = RO_PAGE_PREFIX[currentPageId] || ''
    const rules = []
    for (const [id, ov] of Object.entries(roleOverrides)) {
      let sel
      if (id.startsWith('_auto:')) {
        // Auto-ids: use structural CSS selector (tag.classes:nth-child)
        if (ov.page && ov.page !== currentPageId) continue
        sel = autoIdToCSS(id)
        if (!sel) continue
      } else if (id.startsWith('gl-')) {
        sel = `[data-role-id="${id}"]`
      } else {
        if (id.split('-')[0] !== prefix) continue
        sel = `[data-role-id="${id}"]`
      }
      if (ov.type === 'font') {
        const r = ov.role
        rules.push(`${sel}{font-family:var(--prim-type-${r})!important;font-weight:var(--prim-type-${r}-weight)!important;font-size:${RO_FONT_SIZE[r] || 'var(--size-body)'}!important;line-height:var(--prim-type-${r}-lh)!important;letter-spacing:var(--prim-type-${r}-ls)!important}`)
      } else if (ov.type === 'button' && RO_BTN_CSS[ov.variant]) {
        // For auto-ids the structural selector already includes .com-btn
        const btnSel = id.startsWith('_auto:') ? sel : `${sel}.com-btn`
        rules.push(`${btnSel}{${RO_BTN_CSS[ov.variant]}}`)
      }
    }
    el.textContent = rules.join('\n')
  }, [roleOverrides, currentPageId])

  const currentComments = commentsByPage[currentPageId] || []
  const handleCommentsChange = useCallback((next) => {
    setCommentsByPage(prev => {
      const updated = { ...prev, [currentPageId]: next }
      // Persist to JSON file via dev middleware
      fetch('/__comments_save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {})
      return updated
    })
  }, [currentPageId])

  const navigateTo = useCallback((id) => {
    setCurrentPageId(id)
    sessionStorage.setItem('dme-page', id)
    const url = new URL(window.location)
    url.searchParams.set('page', id)
    window.history.replaceState(null, '', url)
  }, [])

  /* Sync URL param on mount */
  useEffect(() => {
    const url = new URL(window.location)
    if (url.searchParams.get('page') !== currentPageId) {
      url.searchParams.set('page', currentPageId)
      window.history.replaceState(null, '', url)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = (key, value) =>
    setDmeStates(s => ({ ...s, [key]: value }))

  /* ── Radial FAB handlers ─────────────────────────────────────── */
  const handleTogglePanel = useCallback((id) => {
    setActivePanel(p => p === id ? null : id)
  }, [])

  const handleTogglePageNav = useCallback(() => {
    setPageNavOpen(v => !v)
  }, [])

  /* ── Keyboard shortcuts (←←→→ states, ↑↑↓↓ tokens) ──────── */
  const activePanelRef = useRef(activePanel)
  useEffect(() => { activePanelRef.current = activePanel }, [activePanel])
  const pageNavOpenRef = useRef(pageNavOpen)
  useEffect(() => { pageNavOpenRef.current = pageNavOpen }, [pageNavOpen])

  useEffect(() => {
    let ti = 0 // tokens sequence index
    let si = 0 // states sequence index
    const handler = (e) => {
      /* ESC → close any open IDP panel or page nav */
      if (e.key === 'Escape') {
        if (activePanelRef.current) { setActivePanel(null); return }
        if (pageNavOpenRef.current) { setPageNavOpen(false); return }
        return
      }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return
      /* ↑↑↓↓ → toggle DME tokens */
      if (e.key === TOKENS_SEQ[ti]) { ti++; if (ti === TOKENS_SEQ.length) { setActivePanel(p => p === 'dme' ? null : 'dme'); ti = 0 } }
      else { ti = e.key === TOKENS_SEQ[0] ? 1 : 0 }
      /* ←←→→ → toggle states panel */
      if (e.key === STATES_SEQ[si]) { si++; if (si === STATES_SEQ.length) { setActivePanel(p => p === 'states' ? null : 'states'); si = 0 } }
      else { si = e.key === STATES_SEQ[0] ? 1 : 0 }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function renderPage() {
    if (currentPageId === 'index') return <IndexPage onNavigate={navigateTo} />
    if (currentPageId === 'learn-hub') return <LearnHubPage onNavigate={navigateTo} />
    if (currentPageId === 'learn-article') return <LearnSegmentTemplate onNavigate={navigateTo} />
    if (currentPageId === 'play') return <PlayPage onNavigate={navigateTo} />
    if (currentPageId === 'profile') return <ProfilePage onNavigate={navigateTo} />
    if (currentPageId === 'settings') return <SettingsPage onNavigate={navigateTo} />
    if (currentPageId === 'notifications') return <NotificationsPage onNavigate={navigateTo} />
    if (currentPageId === 'tokens') return <TokensPage onNavigate={navigateTo} />
    return <LearnHubPage onNavigate={navigateTo} />
  }

  return (
    <DMEStatesContext.Provider value={dmeStates}>
      {renderPage()}
      <TokenEditor
        visible={activePanel === 'dme'}
        onClose={() => setActivePanel(null)}
        states={dmeStates}
        onStateChange={handleStateChange}
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={navigateTo}
        roleOverrides={roleOverrides}
      />
      <RoleTargeter
        visible={activePanel === 'roletarget'}
        onClose={() => setActivePanel(null)}
        currentPageId={currentPageId}
        roleOverrides={roleOverrides}
        onRoleOverridesChange={setRoleOverrides}
      />
      <DevModeInspector
        visible={activePanel === 'devmode'}
        onClose={() => setActivePanel(null)}
      />
      <CommentsInspector
        visible={activePanel === 'comments'}
        onClose={() => setActivePanel(null)}
        comments={currentComments}
        onCommentsChange={handleCommentsChange}
        states={dmeStates}
        onStateChange={handleStateChange}
      />
      <StatesPanel
        visible={activePanel === 'states'}
        onClose={() => setActivePanel(null)}
        states={dmeStates}
        onStateChange={handleStateChange}
        currentPageId={currentPageId}
      />
      <PageNavigator
        open={pageNavOpen}
        onToggle={() => setPageNavOpen(v => !v)}
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={navigateTo}
      />
      <RadialFAB
        activePanel={activePanel}
        pageNavOpen={pageNavOpen}
        onTogglePanel={handleTogglePanel}
        onTogglePageNav={handleTogglePageNav}
      />
    </DMEStatesContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
