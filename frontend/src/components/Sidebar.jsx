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
        <button className="bottom-link">Settings</button>
        <button className="bottom-link">Help & Privacy</button>
      </div>
    </aside>
  )
}

export default Sidebar