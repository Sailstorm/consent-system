const SETTINGS_KEY = 'consent-assistant-settings'
const DRAFT_KEY = 'consent-assistant-draft'

export const defaultSettings = {
  textSize: 'medium',
  nightTheme: false,
  keepSession: true,
  detailLevel: 'summary',
}

export function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return { ...defaultSettings }
    }

    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  applySettings(settings)
}

export function applySettings(settings = loadSettings()) {
  const root = document.documentElement

  root.classList.remove(
    'text-size-small',
    'text-size-medium',
    'text-size-large',
    'high-contrast',
    'reduced-motion',
    'night-theme',
  )

  root.classList.add(`text-size-${settings.textSize}`)

  if (settings.nightTheme) {
    root.classList.add('night-theme')
  }
}

export function loadDraftPolicy() {
  try {
    return sessionStorage.getItem(DRAFT_KEY) || ''
  } catch {
    return ''
  }
}

export function saveDraftPolicy(text) {
  try {
    if (text) {
      sessionStorage.setItem(DRAFT_KEY, text)
    } else {
      sessionStorage.removeItem(DRAFT_KEY)
    }
  } catch {
    // Ignore storage errors in private browsing.
  }
}

export function clearSessionData() {
  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Ignore storage errors in private browsing.
  }
}

export function truncateForDetailLevel(text, detailLevel) {
  if (!text || detailLevel === 'full') {
    return text
  }

  if (text.length <= 140) {
    return text
  }

  return `${text.slice(0, 140).trim()}…`
}
