const ACCOUNTS_KEY = 'consent-assistant-accounts'
const SESSION_KEY = 'consent-assistant-session'

function normaliseEmail(email) {
  return email.trim().toLowerCase()
}

function loadAccounts() {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

async function hashPassword(email, password) {
  const payload = new TextEncoder().encode(`${normaliseEmail(email)}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', payload)

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function getSession() {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    const session = stored ? JSON.parse(stored) : null

    if (!session?.email || !session?.name) {
      return null
    }

    return session
  } catch {
    return null
  }
}

function saveSession(account) {
  const session = {
    name: account.name,
    email: account.email,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logoutCustomer() {
  localStorage.removeItem(SESSION_KEY)
}

export async function registerCustomer({ name, email, password }) {
  const trimmedName = name.trim()
  const normalisedEmail = normaliseEmail(email)

  if (!trimmedName) {
    throw new Error('Enter your name.')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)) {
    throw new Error('Enter a valid email address.')
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.')
  }

  const accounts = loadAccounts()

  if (accounts.some((account) => account.email === normalisedEmail)) {
    throw new Error('An account with this email already exists. Please log in.')
  }

  const account = {
    name: trimmedName,
    email: normalisedEmail,
    passwordHash: await hashPassword(normalisedEmail, password),
  }

  saveAccounts([...accounts, account])
  return saveSession(account)
}

export async function loginCustomer({ email, password }) {
  const normalisedEmail = normaliseEmail(email)
  const accounts = loadAccounts()
  const account = accounts.find((item) => item.email === normalisedEmail)

  if (!account) {
    throw new Error('No account found for this email. Please register.')
  }

  const passwordHash = await hashPassword(normalisedEmail, password)

  if (passwordHash !== account.passwordHash) {
    throw new Error('Incorrect email or password.')
  }

  return saveSession(account)
}
