import React, { useState } from 'react';
import { SiteHeader, SiteFooter } from './SharedLayout';
import './AuditPage.css';

const LS_KEY = 'idp-audit-results';

function loadSavedResults() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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

export default function AuditPage({ testResults, testRunning, onRunTests }) {
  const [collapsed, setCollapsed] = useState({});
  const [copied, setCopied] = useState(null);

  const results = testResults || loadSavedResults()?.results || [];
  const savedData = loadSavedResults();
  const timestamp = savedData?.timestamp || null;

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;
  const total = results.length;
  const grouped = groupByPage(results);

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

  return (
    <div className="au-page">
      <SiteHeader onLogoClick={() => {}} />

      <div className="au-body">
        <div className="au-content">
          <div className="au-title-row">
            <h1 className="au-title">IDP Audit</h1>
            <button
              className="au-run-btn"
              onClick={onRunTests}
              disabled={testRunning}
            >
              {testRunning ? 'Running...' : 'Run Tests'}
            </button>
          </div>

          {timestamp && (
            <div className="au-timestamp">
              Last run: {new Date(timestamp).toLocaleString()}
            </div>
          )}

          {total > 0 && (
            <div className="au-summary">
              <span className="au-summary-stat au-summary-stat--pass">{passCount} passed</span>
              <span className="au-summary-stat au-summary-stat--fail">{failCount} failed</span>
              <span className="au-summary-stat au-summary-stat--total">{total} total</span>
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
                        <div className="au-assertion" key={i}>
                          <span className={`au-assertion-icon au-assertion-icon--${a.pass ? 'pass' : 'fail'}`}>
                            {a.pass ? '\u2713' : '\u2717'}
                          </span>
                          <span className="au-assertion-label">
                            {a.label}
                            {!a.pass && a.detail && (
                              <span className="au-assertion-detail"> — {a.detail}</span>
                            )}
                          </span>
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
