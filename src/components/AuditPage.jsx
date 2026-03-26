import React, { useState, useEffect, useRef } from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import './AuditPage.css';

const LS_KEY = 'idp-audit-results';

function loadSavedResults() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Human-readable summary for a failed assertion ─────────── */
function buildHumanSummary(test, assertion) {
  const stateEntries = Object.entries(test.states);
  const viewHint = stateEntries
    .map(([k, v]) => {
      if (k.includes('viewType')) return v;
      if (k.includes('modal')) return `${v} modal`;
      if (k.includes('loggedIn')) return v === true || v === 'true' ? 'logged in' : 'logged out';
      return null;
    })
    .filter(Boolean)
    .join(', ');

  const context = viewHint ? ` (${viewHint})` : '';

  if (assertion.expect === 'absent')
    return `"${assertion.label}" is showing up when it shouldn't on the ${test.page} page${context}.`;
  if (assertion.expect === 'present')
    return `"${assertion.label}" is missing on the ${test.page} page${context}.`;
  if (assertion.expect === 'count')
    return `Wrong number of "${assertion.label}" on the ${test.page} page${context} — expected ${assertion.count}, got a different count.`;
  if (assertion.expect === 'text')
    return `"${assertion.label}" doesn't contain the expected text on the ${test.page} page${context}.`;
  if (assertion.expect === 'visible')
    return `"${assertion.label}" exists but is hidden on the ${test.page} page${context}.`;
  return `"${assertion.label}" failed on the ${test.page} page${context}.`;
}

/* ── Build clipboard prompt for a failed assertion ──────────── */
function buildFailurePrompt(test, assertion) {
  const expectLabel = assertion.expect === 'absent'
    ? `is showing element '${assertion.selector}' which should be absent`
    : assertion.expect === 'present'
    ? `is missing element '${assertion.selector}' which should be present`
    : assertion.expect === 'count'
    ? `has wrong count for '${assertion.selector}' (expected ${assertion.count})`
    : assertion.expect === 'text'
    ? `element '${assertion.selector}' does not contain text "${assertion.text}"`
    : assertion.expect === 'visible'
    ? `element '${assertion.selector}' is not visible (hidden or missing)`
    : `assertion '${assertion.label}' failed`;

  const statesStr = Object.entries(test.states)
    .map(([k, v]) => `${k} = '${v}'`)
    .join(', ');

  const pageFile = {
    profile: 'src/components/ProfilePage.jsx',
    play: 'src/components/PlayPage.jsx',
    index: 'src/components/IndexPage.jsx',
    settings: 'src/components/SettingsPage.jsx',
    'learn-hub': 'src/components/LearnHubPage.jsx',
  }[test.page] || `src/components/${test.page}.jsx`;

  return `Fix this issue on ${test.page} page: When states are (${statesStr}), ${expectLabel}.\nCheck the conditional rendering logic in ${pageFile}.`;
}

/* ── Group results by page ──────────────────────────────────── */
function groupByPage(results) {
  const groups = {};
  for (const r of results) {
    const page = r.page || 'unknown';
    if (!groups[page]) groups[page] = [];
    groups[page].push(r);
  }
  return groups;
}

/* ── Format filename into readable label ────────────────────── */
function formatLogLabel(filename) {
  // audit-2026-03-24-153042.json → "Mar 24, 2026 — 3:30 PM"
  const m = filename.match(/audit-(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})\.json/);
  if (!m) return filename;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function AuditPage({ testResults, testRunning, onRunTests, onNavigate }) {
  const [collapsed, setCollapsed] = useState({});
  const [copied, setCopied] = useState(null);
  const [filterFailed, setFilterFailed] = useState(false);

  /* ── History log state ──────────────────────────────────────── */
  const [logFiles, setLogFiles] = useState([]);
  const [selectedLog, setSelectedLog] = useState('latest');
  const [logData, setLogData] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const logRef = useRef(null);

  // Fetch log list on mount and after each run
  useEffect(() => {
    fetchLogList();
  }, [testRunning]);

  function fetchLogList() {
    fetch('/__audit_list')
      .then(r => r.json())
      .then(files => setLogFiles(files || []))
      .catch(() => {});
  }

  // Load a specific log file when selected
  useEffect(() => {
    if (selectedLog === 'latest') {
      setLogData(null);
      return;
    }
    fetch(`/__audit_read?file=${encodeURIComponent(selectedLog)}`)
      .then(r => r.json())
      .then(data => setLogData(data))
      .catch(() => setLogData(null));
  }, [selectedLog]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!logOpen) return;
    const handler = (e) => {
      if (logRef.current && !logRef.current.contains(e.target)) setLogOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [logOpen]);

  // Resolve which results to display
  const activeData = selectedLog === 'latest'
    ? { results: testResults || loadSavedResults()?.results || [], timestamp: loadSavedResults()?.timestamp || null }
    : logData || { results: [], timestamp: null };

  const results = activeData.results;
  const timestamp = activeData.timestamp;

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;
  const total = results.length;

  const displayResults = filterFailed ? results.filter(r => !r.pass) : results;
  const grouped = groupByPage(displayResults);

  function toggleGroup(page) {
    setCollapsed(prev => ({ ...prev, [page]: !prev[page] }));
  }

  function handleCopy(test, assertion) {
    const prompt = buildFailurePrompt(test, assertion);
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(`${test.id}-${assertion.label}`);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleCopyAll() {
    const failedResults = results.filter(r => !r.pass);
    const byPage = groupByPage(failedResults);
    const lines = [];
    for (const [page, pageResults] of Object.entries(byPage)) {
      lines.push(`## ${page}`);
      for (const result of pageResults) {
        const failedAssertions = result.assertions.filter(a => !a.pass);
        for (const a of failedAssertions) {
          lines.push(`- ${buildHumanSummary(result, a)}`);
          lines.push(`  > ${buildFailurePrompt(result, a)}`);
        }
      }
      lines.push('');
    }
    navigator.clipboard.writeText(lines.join('\n').trim()).then(() => {
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function handleSelectLog(file) {
    setSelectedLog(file);
    setLogOpen(false);
    setFilterFailed(false);
    setCollapsed({});
  }

  return (
    <div className="au-page">
      <SiteHeader onLogoClick={() => onNavigate?.('index')} onNavigate={onNavigate} />

      <div className="au-body">
        <div className="au-content">
          <div className="au-title-row">
            <h1 className="au-title">IDP Audit</h1>
            <button
              className="au-run-btn"
              onClick={() => { setSelectedLog('latest'); onRunTests(); }}
              disabled={testRunning}
            >
              {testRunning ? 'Running...' : 'Run Tests'}
            </button>
          </div>

          {/* ── History dropdown ────────────────────────────────── */}
          {logFiles.length > 0 && (
            <div className="au-log-row">
              <div className="au-log-dropdown" ref={logRef}>
                <button className="au-log-trigger" onClick={() => setLogOpen(o => !o)}>
                  <span className="au-log-trigger-label">
                    {selectedLog === 'latest' ? 'Latest run' : formatLogLabel(selectedLog)}
                  </span>
                  <span className={`au-log-trigger-chevron${logOpen ? ' au-log-trigger-chevron--open' : ''}`}>
                    &#x25BC;
                  </span>
                </button>
                {logOpen && (
                  <div className="au-log-menu">
                    <button
                      className={`au-log-item${selectedLog === 'latest' ? ' au-log-item--active' : ''}`}
                      onClick={() => handleSelectLog('latest')}
                    >
                      Latest run
                    </button>
                    {logFiles.map(file => (
                      <button
                        key={file}
                        className={`au-log-item${selectedLog === file ? ' au-log-item--active' : ''}`}
                        onClick={() => handleSelectLog(file)}
                      >
                        {formatLogLabel(file)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {timestamp && (
                <span className="au-timestamp" style={{ margin: 0 }}>
                  {new Date(timestamp).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* ── Timestamp fallback when no logs yet ────────────── */}
          {logFiles.length === 0 && timestamp && (
            <div className="au-timestamp">
              Last run: {new Date(timestamp).toLocaleString()}
            </div>
          )}

          {total > 0 && (
            <div className="au-summary">
              <span className="au-summary-stat au-summary-stat--pass">{passCount} passed</span>
              <button
                className={`au-summary-stat au-summary-stat--fail${filterFailed ? ' au-summary-stat--active' : ''}`}
                onClick={() => setFilterFailed(f => !f)}
              >
                {failCount} failed{filterFailed ? ' (filtered)' : ''}
              </button>
              <span className="au-summary-stat au-summary-stat--total">{total} total</span>
              {failCount > 0 && (
                <button className="au-copy-all-btn" onClick={handleCopyAll}>
                  {copied === 'all' ? 'Copied!' : 'Copy All Failures'}
                </button>
              )}
            </div>
          )}

          {total === 0 && !testRunning && (
            <div className="au-empty">
              <p className="au-empty-title">No test results yet</p>
              <p>Click "Run Tests" to cycle through DME states and check DOM assertions.</p>
            </div>
          )}

          {Object.entries(grouped).map(([page, pageResults]) => {
            const pagePass = pageResults.filter(r => r.pass).length;
            const pageFail = pageResults.filter(r => !r.pass).length;
            const isCollapsed = collapsed[page];

            return (
              <div className="au-group" key={page}>
                <button className="au-group-header" onClick={() => toggleGroup(page)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="au-group-title">{page}</span>
                    <span className="au-group-counts">
                      <span className="au-group-count--pass">{pagePass} pass</span>
                      <span className="au-group-count--fail">{pageFail} fail</span>
                    </span>
                  </div>
                  <span className={`au-group-chevron${isCollapsed ? '' : ' au-group-chevron--open'}`}>
                    &#x25BC;
                  </span>
                </button>

                {!isCollapsed && pageResults.map(result => (
                  <div className="au-test" key={result.id}>
                    <div className="au-test-header">
                      <span className={`au-test-badge au-test-badge--${result.pass ? 'pass' : 'fail'}`}>
                        {result.pass ? '\u2713' : '\u2717'}
                      </span>
                      <span className="au-test-name">{result.name}</span>
                    </div>

                    <div className="au-assertions">
                      {result.assertions.map((a, i) => (
                        <div className={`au-assertion${!a.pass ? ' au-assertion--fail' : ''}`} key={i}>
                          <span className={`au-assertion-icon au-assertion-icon--${a.pass ? 'pass' : 'fail'}`}>
                            {a.pass ? '\u2713' : '\u2717'}
                          </span>
                          <div className="au-assertion-content">
                            <span className="au-assertion-label">{a.label}</span>
                            {!a.pass && (
                              <span className="au-assertion-summary">{buildHumanSummary(result, a)}</span>
                            )}
                            {!a.pass && a.detail && (
                              <span className="au-assertion-detail">{a.detail}</span>
                            )}
                          </div>
                          {!a.pass && (
                            <button
                              className="au-copy-btn"
                              onClick={() => handleCopy(result, a)}
                            >
                              {copied === `${result.id}-${a.label}` ? 'Copied!' : 'Copy prompt'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <SiteFooter sectionId="gl-footer" />
    </div>
  );
}
