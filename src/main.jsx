import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import ProfilePage from './components/ProfilePage'
import TokenEditor from './components/TokenEditor'
import { PageSelector } from './components/PageSelector'
import { DMEStatesContext } from './context/dme-states'
import fileDefaults from './tokens/dme-defaults.json'

/*
 * Page registry — add new pages here as the project grows.
 * Each entry: { id: string, label: string }
 */
const PAGES = [
  { id: 'learn-hub',      label: 'Learn Hub' },
  { id: 'learn-article',  label: 'Lesson 1: How to Play' },
  { id: 'profile-me',     label: 'My Profile (/me)' },
  { id: 'profile-member', label: 'Player Profile (/member/...)' },
]

const INIT_STATES = fileDefaults.states ?? { 'auth.loggedIn': true }

function App() {
  const [currentPageId, setCurrentPageId] = useState('learn-hub')
  const [dmeVisible, setDmeVisible] = useState(false)
  const [dmeStates, setDmeStates] = useState(INIT_STATES)

  const handleStateChange = (key, value) =>
    setDmeStates(s => ({ ...s, [key]: value }))

  function renderPage() {
    if (currentPageId === 'learn-hub') return <LearnHubPage onNavigate={setCurrentPageId} />
    if (currentPageId === 'learn-article') return <LearnSegmentTemplate onNavigate={setCurrentPageId} />
    if (currentPageId === 'profile-me') return <ProfilePage onNavigate={setCurrentPageId} isOwnProfile />
    if (currentPageId === 'profile-member') return <ProfilePage onNavigate={setCurrentPageId} isOwnProfile={false} />
    return <LearnHubPage onNavigate={setCurrentPageId} />
  }

  return (
    <DMEStatesContext.Provider value={dmeStates}>
      {renderPage()}
      <TokenEditor
        visible={dmeVisible}
        onToggle={() => setDmeVisible(v => !v)}
        onClose={() => setDmeVisible(false)}
        states={dmeStates}
        onStateChange={handleStateChange}
      />
      <PageSelector
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={setCurrentPageId}
        visible={dmeVisible}
      />
    </DMEStatesContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
