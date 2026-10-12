import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { loadAnalysisState, markAnalysisSeen } from './analysisState'

// The current policy and its analysis: from the page navigation if present,
// otherwise from this tab's session storage (so a refresh keeps working).
export function useAnalysis() {
  const location = useLocation()
  const saved = loadAnalysisState()

  const policyText = location.state?.policyText || saved.policyText || ''
  const analysisResult = location.state?.analysisResult || saved.analysisResult || null

  return {
    policyText,
    analysisResult,
    hasResult: Boolean(analysisResult && Object.keys(analysisResult).length),
  }
}

// Once someone opens a result page, the pinned progress bar stops
// reminding them about it.
export function useMarkSeen(hasResult) {
  useEffect(() => {
    if (hasResult) {
      markAnalysisSeen()
    }
  }, [hasResult])
}
