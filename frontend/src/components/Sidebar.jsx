import { useNavigate } from 'react-router-dom'
import '../styles/sidebar.css'

function Sidebar({ activePage = 'overview' }) {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <h2>Consent Assistant</h2>
          <p>Understand privacy before you agree</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={activePage === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate('/')}
          >
            Overview
          </button>

          <button
            className={
              activePage === 'assistant' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => navigate('/privacy-assistant')}
          >
            Privacy Assistant
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          className={
            activePage === 'settings' ? 'bottom-link active' : 'bottom-link'
          }
          onClick={() => navigate('/settings')}
        >
          Settings
        </button>
        <button
          className={activePage === 'help' ? 'bottom-link active' : 'bottom-link'}
          onClick={() => navigate('/help-privacy')}
        >
          Help & Privacy
        </button>
      </div>
    </aside>
  )
}

export default Sidebar