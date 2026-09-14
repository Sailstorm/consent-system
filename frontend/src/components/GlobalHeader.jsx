import { useNavigate } from 'react-router-dom'
import '../styles/globalHeader.css'

function GlobalHeader({ activePage = '' }) {
  const navigate = useNavigate()

  return (
    <header className="global-header">
      <div className="global-header-inner">
        <button
          className="global-brand"
          type="button"
          onClick={() => navigate('/')}
        >
          <span className="global-brand-dot"></span>
          <span>Consent Assistant</span>
        </button>

        <nav className="global-nav">
          <button
            className={
              activePage === 'home'
                ? 'global-nav-link active'
                : 'global-nav-link'
            }
            type="button"
            onClick={() => navigate('/')}
          >
            Home
          </button>

          <button
            className={
              activePage === 'policy'
                ? 'global-nav-link active'
                : 'global-nav-link'
            }
            type="button"
            onClick={() => navigate('/privacy-assistant')}
          >
            Policy Assistant
          </button>

          <button
            className={
              activePage === 'learning'
                ? 'global-nav-link active'
                : 'global-nav-link'
            }
            type="button"
            onClick={() => navigate('/privacy-learning')}
          >
            Privacy Learning
          </button>

          <button
            className={
              activePage === 'dashboard'
                ? 'global-nav-link active'
                : 'global-nav-link'
            }
            type="button"
            onClick={() => navigate('/risk-dashboard')}
          >
            Risk Dashboard
          </button>

          <button
            className={
              activePage === 'help'
                ? 'global-nav-link active'
                : 'global-nav-link'
            }
            type="button"
            onClick={() => navigate('/help-privacy')}
          >
            Help
          </button>
        </nav>
      </div>
    </header>
  )
}

export default GlobalHeader