import React, { useState, useCallback, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import IndexPage from './components/IndexPage'
import ProfilePage from './components/ProfilePage'
import TokensPage from './components/TokensPage'
import TokenEditor from './components/TokenEditor'
import DevModeInspector from './components/DevModeInspector'
import CommentsInspector from './components/CommentsInspector'
import PageNavigator from './components/PageNavigator'
import RadialFAB from './components/RadialFAB'
import StatesPanel from './components/StatesPanel'
import { DMEStatesContext } from './context/dme-states'
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
  { id: 'profile',        label: 'Profile' },
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

/* ─── Shortcut sequences ─────────────────────────────────────── */
const TOKENS_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown']
const STATES_SEQ = ['ArrowLeft','ArrowLeft','ArrowRight','ArrowRight']

function App() {
  const [currentPageId, setCurrentPageId] = useState(getInitialPage)
  const [activePanel, setActivePanel] = useState(null) // null | 'dme' | 'devmode' | 'comments' | 'states'
  const [pageNavOpen, setPageNavOpen] = useState(false)
  const [dmeStates, setDmeStates] = useState(INIT_STATES)
  const [commentsByPage, setCommentsByPage] = useState(() => savedComments || {})

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

  useEffect(() => {
    let ti = 0 // tokens sequence index
    let si = 0 // states sequence index
    const handler = (e) => {
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
    if (currentPageId === 'profile') return <ProfilePage onNavigate={navigateTo} />
    if (currentPageId === 'tokens') return <TokensPage onNavigate={navigateTo} />
    return <LearnHubPage onNavigate={navigateTo} />
  }

  return (
    <DMEStatesContext.Provider value={dmeStates}>
      <PageNavigator
        open={pageNavOpen}
        onToggle={() => setPageNavOpen(v => !v)}
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={navigateTo}
      />
      {renderPage()}
      <TokenEditor
        visible={activePanel === 'dme'}
        onClose={() => setActivePanel(null)}
        states={dmeStates}
        onStateChange={handleStateChange}
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={navigateTo}
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
