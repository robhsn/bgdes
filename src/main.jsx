import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import LearnArticle2 from './components/LearnArticle2'
import LearnHubPage from './components/LearnHubPage'
import IndexPage from './components/IndexPage'
import ProfilePage from './components/ProfilePage'
import PlayPage from './components/PlayPage'
import SettingsPage from './components/SettingsPage'
import NotificationsPage from './components/NotificationsPage'
import TokensPage from './components/TokensPage'
import SurfacePreviewPage from './components/SurfacePreviewPage'
import ButtonsSheetPage from './components/ButtonsSheetPage'
import AuditPage from './components/AuditPage'
import TEST_DEFINITIONS from './tests/test-definitions'
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
  { id: 'learn-article-2', label: 'Lesson 2: Board Setup' },
  { id: 'play',           label: 'Play' },
  { id: 'profile',        label: 'Profile' },
  { id: 'settings',       label: 'Settings' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'tokens',         label: 'Design Tokens' },
  { id: 'surface-preview', label: 'Surface Preview' },
  { id: 'buttons-sheet',   label: 'Buttons Sheet' },
  { id: 'idp-audit',       label: 'IDP Audit' },
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


/* ─── Role override CSS maps (used by <style> injection) ─────── */
const RO_PAGE_PREFIX = {
  'learn-article': 'ls', 'learn-article-2': 'ls', 'learn-hub': 'lh', 'profile': 'pp',
  'play': 'gp', 'settings': 'st', 'index': 'ix', 'notifications': 'nt', 'tokens': 'tk', 'surface-preview': 'sp', 'idp-audit': 'au',
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
  quaternary:      'background:var(--com-btn-quaternary-bg)!important;color:var(--com-btn-quaternary-fg)!important;border:none!important;border-radius:8px!important;box-shadow:none!important',
  destructive:     'background:var(--com-btn-destructive-bg)!important;color:var(--com-btn-destructive-fg)!important;border:none!important;border-radius:9999px!important',
  'destructive-ui':'background:var(--com-btn-destructive-ui-bg)!important;color:var(--com-btn-destructive-ui-fg)!important;border:1px solid var(--com-btn-destructive-ui-border)!important;border-radius:8px!important;box-shadow:none!important',
  pill:'background:var(--com-btn-pill-bg)!important;color:var(--com-btn-pill-fg)!important;border:1.5px solid var(--com-btn-pill-border)!important;border-radius:9999px!important;box-shadow:none!important',
}
const RO_BORDER_CSS = {
  'hairline': 'border:1px solid var(--color-border)!important',
  'mid':      'border:1.5px solid var(--color-border-mid)!important',
  'accent':   'border:2px solid var(--color-border-active)!important',
  'card':     'border:1px solid var(--color-border)!important;border-radius:12px!important',
  'pill':     'border:1.5px solid var(--color-border-mid)!important;border-radius:9999px!important',
  'none':     'border:none!important',
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
      if (ov.border && RO_BORDER_CSS[ov.border]) {
        rules.push(`${sel}{${RO_BORDER_CSS[ov.border]}}`)
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

  /* ── ESC keyboard shortcut ──────────────────────────────────── */
  const activePanelRef = useRef(activePanel)
  useEffect(() => { activePanelRef.current = activePanel }, [activePanel])
  const pageNavOpenRef = useRef(pageNavOpen)
  useEffect(() => { pageNavOpenRef.current = pageNavOpen }, [pageNavOpen])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (activePanelRef.current) { setActivePanel(null); return }
        if (pageNavOpenRef.current) { setPageNavOpen(false); return }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* ── IDP Audit test runner ──────────────────────────────────── */
  const [testRunning, setTestRunning] = useState(false)
  const [testProgress, setTestProgress] = useState({ current: 0, total: 0 })
  const testResultsRef = useRef(null)
  const [, forceRender] = useState(0)

  const runTests = useCallback(async () => {
    setTestRunning(true)
    setActivePanel(null)
    setPageNavOpen(false)

    const savedStates = { ...dmeStates }
    const savedPage = currentPageId
    const results = []

    setTestProgress({ current: 0, total: TEST_DEFINITIONS.length })

    for (let i = 0; i < TEST_DEFINITIONS.length; i++) {
      const test = TEST_DEFINITIONS[i]
      setTestProgress({ current: i + 1, total: TEST_DEFINITIONS.length })

      // Apply test states
      setDmeStates(prev => ({ ...prev, ...test.states }))
      // Navigate to test page
      setCurrentPageId(test.page)

      // Wait for React render + CSS settle
      await new Promise(r => setTimeout(r, 250))

      // Run assertions
      const assertionResults = test.assertions.map(a => {
        const els = document.querySelectorAll(a.selector)
        let pass = false
        let detail = ''

        if (a.expect === 'present') {
          pass = els.length > 0
          if (!pass) detail = `selector not found: ${a.selector}`
        } else if (a.expect === 'absent') {
          pass = els.length === 0
          if (!pass) detail = `found ${els.length} element(s) matching: ${a.selector}`
        } else if (a.expect === 'count') {
          pass = els.length === a.count
          if (!pass) detail = `expected ${a.count}, found ${els.length}`
        } else if (a.expect === 'text') {
          const el = els[0]
          pass = el ? el.textContent.includes(a.text) : false
          if (!pass) detail = el ? `text "${el.textContent.slice(0, 60)}" does not contain "${a.text}"` : `selector not found: ${a.selector}`
        } else if (a.expect === 'visible') {
          if (els.length === 0) {
            pass = false
            detail = `selector not found: ${a.selector}`
          } else {
            const el = els[0]
            const style = window.getComputedStyle(el)
            pass = style.display !== 'none' && style.visibility !== 'hidden'
            if (!pass) detail = `element hidden (display:${style.display}, visibility:${style.visibility})`
          }
        }

        return { ...a, pass, detail: pass ? '' : detail }
      })

      results.push({
        id: test.id,
        name: test.name,
        page: test.page,
        states: test.states,
        pass: assertionResults.every(a => a.pass),
        assertions: assertionResults,
      })
    }

    // Restore original states + navigate back
    setDmeStates(savedStates)
    setCurrentPageId('idp-audit')
    sessionStorage.setItem('dme-page', 'idp-audit')
    const url = new URL(window.location)
    url.searchParams.set('page', 'idp-audit')
    window.history.replaceState(null, '', url)

    // Save results
    testResultsRef.current = results
    const payload = { results, timestamp: Date.now() }
    try { localStorage.setItem('idp-audit-results', JSON.stringify(payload)) } catch {}

    setTestRunning(false)
    forceRender(n => n + 1)
  }, [dmeStates, currentPageId])

  function renderPage() {
    if (currentPageId === 'index') return <IndexPage onNavigate={navigateTo} />
    if (currentPageId === 'learn-hub') return <LearnHubPage onNavigate={navigateTo} />
    if (currentPageId === 'learn-article') return <LearnSegmentTemplate onNavigate={navigateTo} />
    if (currentPageId === 'learn-article-2') return <LearnArticle2 onNavigate={navigateTo} />
    if (currentPageId === 'play') return <PlayPage onNavigate={navigateTo} />
    if (currentPageId === 'profile') return <ProfilePage onNavigate={navigateTo} />
    if (currentPageId === 'settings') return <SettingsPage onNavigate={navigateTo} />
    if (currentPageId === 'notifications') return <NotificationsPage onNavigate={navigateTo} />
    if (currentPageId === 'tokens') return <TokensPage onNavigate={navigateTo} />
    if (currentPageId === 'surface-preview') return <SurfacePreviewPage onNavigate={navigateTo} />
    if (currentPageId === 'buttons-sheet') return <ButtonsSheetPage onNavigate={navigateTo} />
    if (currentPageId === 'idp-audit') return <AuditPage testResults={testResultsRef.current} testRunning={testRunning} onRunTests={runTests} />
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
      {testRunning && (
        <div className="au-testing-overlay">
          <div className="au-testing-card">
            <div className="au-testing-title">Running Tests...</div>
            <div className="au-testing-progress">
              Test {testProgress.current} of {testProgress.total}
            </div>
            <div className="au-testing-bar">
              <div
                className="au-testing-bar-fill"
                style={{ width: `${testProgress.total ? (testProgress.current / testProgress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </DMEStatesContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
