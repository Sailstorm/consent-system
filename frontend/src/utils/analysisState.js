const ANALYSIS_KEY = 'consent-assistant-analysis'

export const emptyAnalysisState = {
  status: 'idle',
  policyText: '',
  analysisResult: null,
}

export function loadAnalysisState() {
  try {
    const stored = sessionStorage.getItem(ANALYSIS_KEY)

    if (!stored) {
      return { ...emptyAnalysisState }
    }

    const parsed = JSON.parse(stored)

    return {
      ...emptyAnalysisState,
      ...parsed,
    }
  } catch {
    return { ...emptyAnalysisState }
  }
}

export function saveAnalysisState(state) {
  try {
    sessionStorage.setItem(
      ANALYSIS_KEY,
      JSON.stringify(state),
    )
  } catch {
    // Ignore storage errors.
  }

  return state
}

export function startAnalysis(policyText) {
  return saveAnalysisState({
    status: 'analysing',
    policyText: policyText,
    analysisResult: null,
  })
}

export function saveAnalysisResult(policyText, analysisResult) {
  return saveAnalysisState({
    status: 'ready',
    policyText: policyText,
    analysisResult: analysisResult,
  })
}

export function saveAnalysisFailure(policyText) {
  return saveAnalysisState({
    status: 'failed',
    policyText: policyText,
    analysisResult: null,
  })
}

// Remove the stored policy text, results and any unsent draft from this tab
// (security plan F-07). sessionStorage already clears when the tab closes;
// this lets someone on a shared computer clear it straight away.
export function clearAnalysisState() {
  try {
    sessionStorage.removeItem(ANALYSIS_KEY)
    sessionStorage.removeItem('consent-assistant-draft')
  } catch {
    // Ignore storage errors.
  }
}
