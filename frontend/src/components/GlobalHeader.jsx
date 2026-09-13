import { useNavigate } from 'react-router-dom'
import { getSession, logoutCustomer } from '../utils/customerAuth'
import '../styles/globalHeader.css'

function GlobalHeader({ activePage = '' }) {
  const navigate = useNavigate()
  const session = getSession()

  const handleLogout = () => {
    logoutCustomer()
    navigate('/welcome', { replace: true })
  }

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

        <div className="global-header-right">
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
          </nav>

          {session ? (
            <div className="global-account">
              <span className="global-account-name">{session.name}</span>
              <button
                className="global-logout"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default GlobalHeader
