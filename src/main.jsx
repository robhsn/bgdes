import React, { useState, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import ProfilePage from './components/ProfilePage'
import TokensPage from './components/TokensPage'
import TokenEditor from './components/TokenEditor'
import DevModeInspector from './components/DevModeInspector'
import { DMEStatesContext } from './context/dme-states'
import fileDefaults from './tokens/dme-defaults.json'

/*
 * Page registry — add new pages here as the project grows.
 * Each entry: { id: string, label: string }
 */
const PAGES = [
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

function App() {
  const [currentPageId, setCurrentPageId] = useState(getInitialPage)
  const [activePanel, setActivePanel] = useState(null) // null | 'dme' | 'devmode'
  const [dmeStates, setDmeStates] = useState(INIT_STATES)

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

  function renderPage() {
    if (currentPageId === 'learn-hub') return <LearnHubPage onNavigate={navigateTo} />
    if (currentPageId === 'learn-article') return <LearnSegmentTemplate onNavigate={navigateTo} />
    if (currentPageId === 'profile') return <ProfilePage onNavigate={navigateTo} />
    if (currentPageId === 'tokens') return <TokensPage onNavigate={navigateTo} />
    return <LearnHubPage onNavigate={navigateTo} />
  }

  return (
    <DMEStatesContext.Provider value={dmeStates}>
      {renderPage()}
      <TokenEditor
        visible={activePanel === 'dme'}
        onToggle={() => setActivePanel(p => p === 'dme' ? null : 'dme')}
        onClose={() => setActivePanel(null)}
        states={dmeStates}
        onStateChange={handleStateChange}
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={navigateTo}
      />
      <DevModeInspector
        visible={activePanel === 'devmode'}
        onToggle={() => setActivePanel(p => p === 'devmode' ? null : 'devmode')}
        onClose={() => setActivePanel(null)}
      />
    </DMEStatesContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
