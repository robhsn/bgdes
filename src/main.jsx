import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import TokenEditor from './components/TokenEditor'
import { PageSelector } from './components/PageSelector'
import { DMEStatesContext } from './context/dme-states'
import fileDefaults from './tokens/dme-defaults.json'

/*
 * Page registry — add new pages here as the project grows.
 * Each entry: { id: string, label: string }
 */
const PAGES = [
  { id: 'learn-hub',     label: 'Learn Hub' },
  { id: 'learn-article', label: 'Lesson 1: How to Play' },
]

const INIT_STATES = fileDefaults.states ?? { 'auth.loggedIn': true }

function App() {
  const [currentPageId, setCurrentPageId] = useState('learn-hub')
  const [dmeVisible, setDmeVisible] = useState(false)
  const [dmeStates, setDmeStates] = useState(INIT_STATES)

  const handleStateToggle = (key) =>
    setDmeStates(s => ({ ...s, [key]: !s[key] }))

  return (
    <DMEStatesContext.Provider value={dmeStates}>
      {currentPageId === 'learn-hub'
        ? <LearnHubPage onNavigate={setCurrentPageId} />
        : <LearnSegmentTemplate onNavigate={setCurrentPageId} />
      }
      <TokenEditor
        visible={dmeVisible}
        onToggle={() => setDmeVisible(v => !v)}
        onClose={() => setDmeVisible(false)}
        states={dmeStates}
        onStateToggle={handleStateToggle}
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
