import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import {
  dismissAnalysisFailure,
  loadAnalysisState,
} from '../utils/analysisState'

// Pages that already show the check's progress or result themselves.
const HIDDEN_ON = [
  '/processing',
  '/analysis-failed',
  '/invalid-input',
  '/explanation',
  '/consent-summary',
  '/source-decision',
  '/data-collection',
  '/purpose-of-use',
  '/data-sharing',
  '/data-retention',
  '/user-control',
]

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

// A small status pill pinned to the bottom-right corner while a policy is
// being checked, so it stays in view during lessons and practice without
// getting in the way. It never moves keyboard focus; changes are announced.
function AnalysisDock() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [analysis, setAnalysis] = useState(loadAnalysisState)
  const [now, setNow] = useState(() => Date.now())
  const dockRef = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysis(loadAnalysisState())
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  let state = null

  if (analysis.status === 'analysing') {
    state = 'analysing'
  } else if (analysis.status === 'ready' && analysis.analysisResult && !analysis.seen) {
    state = 'ready'
  } else if (analysis.status === 'failed') {
    state = 'failed'
  }

  const visible = Boolean(state) && !HIDDEN_ON.includes(pathname)

  // Reserve a little space at the bottom of the page so the pill never
  // covers the last of the content.
  useLayoutEffect(() => {
    const root = document.documentElement
    const dock = dockRef.current

    if (!visible || !dock) {
      root.style.removeProperty('--dock-space')
      return undefined
    }

    const update = () => root.style.setProperty('--dock-space', `${dock.offsetHeight + 24}px`)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(dock)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--dock-space')
    }
  }, [visible, state])

  function readNow() {
    navigate('/explanation', {
      state: {
        policyText: analysis.policyText,
        analysisResult: analysis.analysisResult,
      },
    })
  }

  function dismissFailure() {
    dismissAnalysisFailure()
    setAnalysis(loadAnalysisState())
  }

  const elapsed = analysis.startedAt
    ? Math.max(0, Math.round((now - analysis.startedAt) / 1000))
    : 0

  return (
    <div className="dock-region" role="status" aria-live="polite">
      {visible && state === 'analysing' && (
        <div className="dock-pill dock-pill--analysing" ref={dockRef} key="analysing">
          <span className="dock-pill__icon" aria-hidden="true">
            <Icon name="magnifier" />
          </span>
          <span className="dock-pill__label">Analysis in progress</span>
          <span className="dock-pill__time">
            <span className="visually-hidden">Time so far: </span>
            {formatElapsed(elapsed)}
          </span>
          <span className="dock-pill__bar" aria-hidden="true">
            <span />
          </span>
        </div>
      )}

      {visible && state === 'ready' && (
        <button
          type="button"
          className="dock-pill dock-pill--ready"
          ref={dockRef}
          key="ready"
          onClick={readNow}
        >
          <span className="dock-pill__icon" aria-hidden="true">
            <Icon name="check" />
          </span>
          <span className="dock-pill__label">Explanation ready</span>
          <span className="dock-pill__go">
            Read it
            <Icon name="arrow-right" />
          </span>
        </button>
      )}

      {visible && state === 'failed' && (
        <div className="dock-pill dock-pill--failed" ref={dockRef} key="failed">
          <span className="dock-pill__icon" aria-hidden="true">
            <Icon name="alert-circle" />
          </span>
          <span className="dock-pill__label">Analysis didn&apos;t finish</span>
          <button
            type="button"
            className="dock-pill__action"
            onClick={() => navigate('/privacy-assistant')}
          >
            Try again
          </button>
          <button
            type="button"
            className="dock-pill__close"
            onClick={dismissFailure}
            aria-label="Dismiss this message"
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </div>
  )
}

export default AnalysisDock
