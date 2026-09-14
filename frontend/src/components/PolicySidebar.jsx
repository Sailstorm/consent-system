import { useNavigate } from 'react-router-dom'
import '../styles/policySidebar.css'

function PolicySidebar({ activePage = 'analysis' }) {
  const navigate = useNavigate()

  return (
    <aside className="policy-sidebar">
      <div className="policy-sidebar-content">
        <p className="policy-sidebar-title">POLICY ASSISTANT</p>

        <nav className="policy-sidebar-nav">
          <button
            className={
              activePage === 'example'
                ? 'policy-sidebar-item active'
                : 'policy-sidebar-item'
            }
            type="button"
            onClick={() => navigate('/policy-assistant/example')}
          >
            Example
          </button>

          <button
            className={
              activePage === 'analysis'
                ? 'policy-sidebar-item active'
                : 'policy-sidebar-item'
            }
            type="button"
            onClick={() => navigate('/privacy-assistant')}
          >
            Privacy Policy Analysis
          </button>
        </nav>
      </div>
    </aside>
  )
}

export default PolicySidebar