import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import '../styles/learningHome.css'

function LearningHome() {
  const navigate = useNavigate()

  return (
    <LearningLayout activePage="home">
      <section className="learning-home-heading">
        <p className="learning-home-label">PRIVACY LEARNING</p>

        <h1>Privacy Learning</h1>

        <p>
          Build your privacy knowledge through short lessons, practice
          activities and simple progress tracking.
        </p>
      </section>

      <section className="learning-home-grid">
        <div className="learning-home-card">
          <span className="learning-card-number">01</span>

          <div>
            <h2>Learn</h2>

            <p>
              Explore key privacy concepts using short and simple learning
              topics.
            </p>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/learn')}
          >
            Start Learning
          </button>
        </div>

        <div className="learning-home-card">
          <span className="learning-card-number">02</span>

          <div>
            <h2>Practice</h2>

            <p>
              Apply what you learned to short privacy scenarios and everyday
              decisions.
            </p>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/practice')}
          >
            Start Practice
          </button>
        </div>

        <div className="learning-home-card">
          <span className="learning-card-number">03</span>

          <div>
            <h2>Progress</h2>

            <p>
              Review completed learning activities and see what is still left
              to explore.
            </p>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/progress')}
          >
            View Progress
          </button>
        </div>
      </section>

      <section className="learning-home-info">
        <div>
          <h2>Learn at your own pace</h2>

          <p>
            No account is required. Learning activities are designed to be
            short, clear and easy to revisit.
          </p>
        </div>

        <button
          className="learning-about-link"
          type="button"
          onClick={() => navigate('/privacy-learning/about')}
        >
          About Privacy Learning →
        </button>
      </section>
    </LearningLayout>
  )
}

export default LearningHome