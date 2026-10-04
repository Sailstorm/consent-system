import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadAnalysisState } from '../utils/analysisState'
import '../styles/analysisStatus.css'

function AnalysisStatus() {
  const navigate = useNavigate()

  const [analysis, setAnalysis] = useState(
    loadAnalysisState,
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysis(loadAnalysisState())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  function viewAnalysis() {
    if (!analysis.analysisResult) {
      return
    }

    navigate('/explanation', {
      state: {
        policyText: analysis.policyText,
        analysisResult: analysis.analysisResult,
      },
    })
  }

  if (analysis.status === 'idle') {
    return null
  }

  if (analysis.status === 'analysing') {
    return (
      <aside className="analysis-status-card analysing">
        <div className="analysis-status-icon">
          <span className="analysis-status-spinner"></span>
        </div>

        <div className="analysis-status-copy">
          <h3>Analysing your policy</h3>

          <p>
            Your analysis is continuing in the background.
          </p>
        </div>
      </aside>
    )
  }

  if (analysis.status === 'ready') {
    return (
      <aside className="analysis-status-card ready">
        <div className="analysis-status-icon">
          ✓
        </div>

        <div className="analysis-status-copy">
          <h3>Your analysis is ready</h3>

          <p>Your policy analysis is complete.</p>
        </div>

        <button
          type="button"
          className="analysis-status-button"
          onClick={viewAnalysis}
        >
          View analysis →
        </button>
      </aside>
    )
  }

  if (analysis.status === 'failed') {
    return (
      <aside className="analysis-status-card failed">
        <div className="analysis-status-icon">
          !
        </div>

        <div className="analysis-status-copy">
          <h3>Analysis could not be completed</h3>

          <p>
            You can continue learning and try the analysis
            again later.
          </p>
        </div>
      </aside>
    )
  }

  return null
}

export default AnalysisStatus