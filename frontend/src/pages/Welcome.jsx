import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <div className="auth-card auth-choice-card">
        <p className="auth-label">Consent Assistant</p>
        <h1>Welcome</h1>
        <p className="auth-subtitle">
          New customers register first. Existing customers log in with their
          email and password.
        </p>

        <div className="auth-choice-grid">
          <button
            className="auth-choice"
            type="button"
            onClick={() => navigate('/register')}
          >
            <span>NEW CUSTOMER</span>
            <h2>Register</h2>
            <p>Create an account with your name, email and password.</p>
            <strong>Create account →</strong>
          </button>

          <button
            className="auth-choice existing"
            type="button"
            onClick={() => navigate('/login')}
          >
            <span>EXISTING CUSTOMER</span>
            <h2>Log in</h2>
            <p>Enter your email and password to continue.</p>
            <strong>Go to login →</strong>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Welcome
