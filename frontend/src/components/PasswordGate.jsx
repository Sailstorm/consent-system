import { useState } from 'react'
import '../styles/passwordGate.css'

const SITE_PASSWORD = 'TP13'
const AUTH_KEY = 'consent-assistant-authenticated'

function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (password === SITE_PASSWORD) {
      try {
        localStorage.setItem(AUTH_KEY, 'true')
      } catch {
        // Ignore storage errors in private browsing.
      }

      setAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (authenticated) {
    return children
  }

  return (
    <div className="password-gate">
      <div className="password-card">
        <p className="password-label">Consent Assistant</p>
        <h1>Welcome</h1>
        <p className="password-subtitle">
          Enter the password to access this site.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoFocus
          />

          {error && <p className="password-error">{error}</p>}

          <button type="submit">Enter site &rarr;</button>
        </form>
      </div>
    </div>
  )
}

export default PasswordGate
