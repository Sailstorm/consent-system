import { useNavigate } from 'react-router-dom'
import '../styles/learningSidebar.css'

function SidebarIcon({ name }) {
  if (name === 'home') {
    return (
      <svg className="learning-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 10.5L12 4l8 6.5V20h-5.5v-6h-5v6H4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'learn') {
    return (
      <svg className="learning-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 6h14M5 12h14M5 18h9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name === 'practise') {
    return (
      <svg className="learning-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M8.5 12.2l2.3 2.3 4.7-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (name === 'progress') {
    return (
      <svg className="learning-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 16l5-5 3.5 3.5L19 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 8h5v5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg className="learning-sidebar-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 11v5M12 8h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LearningSidebar({ activePage = 'home' }) {
  const navigate = useNavigate()

  return (
    <aside className="learning-sidebar">
      <div className="learning-sidebar-content">
        <div>
          <p className="learning-sidebar-title">LEARNING</p>

          <nav className="learning-sidebar-nav">
            <button
              className={
                activePage === 'home'
                  ? 'learning-sidebar-item active'
                  : 'learning-sidebar-item'
              }
              type="button"
              onClick={() => navigate('/privacy-learning')}
            >
              <SidebarIcon name="home" />
              Learning Home
            </button>

            <button
              className={
                activePage === 'learn'
                  ? 'learning-sidebar-item active'
                  : 'learning-sidebar-item'
              }
              type="button"
              onClick={() => navigate('/privacy-learning/learn')}
            >
              <SidebarIcon name="learn" />
              Learn
            </button>

            <button
              className={
                activePage === 'practice'
                  ? 'learning-sidebar-item active'
                  : 'learning-sidebar-item'
              }
              type="button"
              onClick={() => navigate('/privacy-learning/practice')}
            >
              <SidebarIcon name="practise" />
              Practise
            </button>

            <button
              className={
                activePage === 'progress'
                  ? 'learning-sidebar-item active'
                  : 'learning-sidebar-item'
              }
              type="button"
              onClick={() => navigate('/privacy-learning/progress')}
            >
              <SidebarIcon name="progress" />
              Progress
            </button>

            <button
              className={
                activePage === 'about'
                  ? 'learning-sidebar-item active'
                  : 'learning-sidebar-item'
              }
              type="button"
              onClick={() => navigate('/privacy-learning/about')}
            >
              <SidebarIcon name="about" />
              About
            </button>
          </nav>
        </div>

        <div className="learning-guest">
          <strong>Guest Mode</strong>
          <p>
            No account needed. Progress is kept on this device for this visit.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default LearningSidebar
