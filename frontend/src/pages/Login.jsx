import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginCustomer } from '../utils/customerAuth'
import '../styles/auth.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await loginCustomer({ email, password })
      navigate('/', { replace: true })
    } catch (nextError) {
      setError(nextError.message)
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-label">Existing customer</p>
        <h1>Log in</h1>
        <p className="auth-subtitle">
          Enter your email and password to continue.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
          />

          {error ? <p className="auth-error">{error}</p> : null}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          New customer?{' '}
          <button type="button" onClick={() => navigate('/register')}>
            Register
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
