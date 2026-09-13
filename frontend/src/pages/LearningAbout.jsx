import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import { LEARNING_TOPICS } from '../utils/learningProgress'
import '../styles/practice.css'

function LearningAbout() {
  const navigate = useNavigate()

  return (
    <LearningLayout activePage="about">
      <section className="practice-heading">
        <p className="practice-label">PRIVACY LEARNING</p>
        <h1>About Privacy Learning</h1>
        <p>
          A short, guest-only experience for building privacy knowledge,
          practising consent choices and seeing what you have explored.
        </p>
      </section>

      <section className="practice-steps">
        <div className="practice-step-card">
          <span>01 LEARN</span>
          <h2>Five privacy topics</h2>
          <p>
            Short lessons cover data collection, purpose of use, sharing,
            retention and user control.
          </p>
        </div>

        <div className="practice-step-card">
          <span>02 PRACTICE</span>
          <h2>Three consent scenarios</h2>
          <p>
            Each session randomly selects 3 questions. There is no score. Your
            choices are saved until combined feedback.
          </p>
        </div>

        <div className="practice-step-card">
          <span>03 PROGRESS</span>
          <h2>See what is left</h2>
          <p>
            Review completed topics and scenario progress, then continue where
            you left off.
          </p>
        </div>
      </section>

      <section className="practice-summary-card">
        <h2>Privacy topics</h2>
        <div className="progress-topic-list">
          {LEARNING_TOPICS.map((topic) => (
            <div className="progress-topic-row" key={topic.id}>
              <div>
                <strong>{topic.title}</strong>
                <p>{topic.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="practice-info">
        <h2>Guest mode</h2>
        <p>
          No account is required. Progress stays in this browser for this
          visit. Privacy Learning is for understanding only. It does not give
          legal advice or make a consent decision for you.
        </p>
      </section>

      <div className="practice-actions">
        <button
          className="practice-primary"
          type="button"
          onClick={() => navigate('/privacy-learning/learn')}
        >
          Start Learning
        </button>

        <button
          className="practice-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/practice')}
        >
          Start Practice
        </button>

        <button
          className="practice-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/progress')}
        >
          View Progress
        </button>
      </div>
    </LearningLayout>
  )
}

export default LearningAbout
