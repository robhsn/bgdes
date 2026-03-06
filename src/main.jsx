import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnHubPage from './components/LearnHubPage'
import TokenEditor from './components/TokenEditor'
import { PageSelector } from './components/PageSelector'

/*
 * Page registry — add new pages here as the project grows.
 * Each entry: { id: string, label: string }
 */
const PAGES = [
  { id: 'learn-hub',     label: 'Learn Hub' },
  { id: 'learn-article', label: 'Lesson 1: How to Play' },
]

function App() {
  const [currentPageId, setCurrentPageId] = useState('learn-hub')
  const [dmeVisible, setDmeVisible] = useState(false)

  return (
    <>
      {currentPageId === 'learn-hub'
        ? <LearnHubPage onNavigate={setCurrentPageId} />
        : <LearnSegmentTemplate onNavigate={setCurrentPageId} />
      }
      <TokenEditor
        visible={dmeVisible}
        onToggle={() => setDmeVisible(v => !v)}
        onClose={() => setDmeVisible(false)}
      />
      <PageSelector
        pages={PAGES}
        currentPageId={currentPageId}
        onNavigate={setCurrentPageId}
        visible={dmeVisible}
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
