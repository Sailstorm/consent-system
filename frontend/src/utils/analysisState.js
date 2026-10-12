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
    startedAt: Date.now(),
  })
}

// `seen` stays false until the explanation page has been opened, so the
// progress bar can keep pointing people to a result they haven't read yet.
export function saveAnalysisResult(policyText, analysisResult) {
  return saveAnalysisState({
    ...loadAnalysisState(),
    status: 'ready',
    policyText: policyText,
    analysisResult: analysisResult,
    seen: false,
  })
}

export function saveAnalysisFailure(policyText) {
  return saveAnalysisState({
    ...loadAnalysisState(),
    status: 'failed',
    policyText: policyText,
    analysisResult: null,
  })
}

export function markAnalysisSeen() {
  const state = loadAnalysisState()

  if (state.status === 'ready' && !state.seen) {
    saveAnalysisState({ ...state, seen: true })
  }
}

// Hide a failed check's message without clearing the person's draft text.
export function dismissAnalysisFailure() {
  const state = loadAnalysisState()

  if (state.status === 'failed') {
    saveAnalysisState({ ...emptyAnalysisState })
  }
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
