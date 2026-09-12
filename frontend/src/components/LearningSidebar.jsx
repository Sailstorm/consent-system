import { useNavigate } from 'react-router-dom'
import '../styles/learningSidebar.css'

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
              Practice
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
              About
            </button>
          </nav>
        </div>

        <div className="learning-guest">
          <strong>Guest Mode</strong>
          <p>Your learning progress stays in this browser.</p>
        </div>
      </div>
    </aside>
  )
}

export default LearningSidebar