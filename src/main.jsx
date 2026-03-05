import React from 'react'
import ReactDOM from 'react-dom/client'
import LearnSegmentTemplate from './components/LearnSegmentTemplate'
import TokenEditor from './components/TokenEditor'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LearnSegmentTemplate />
    <TokenEditor />
  </React.StrictMode>,
)
