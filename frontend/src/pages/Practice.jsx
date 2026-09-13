import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getPracticeStatus,
  getResumeIndex,
  startPracticeSession,
} from '../utils/practice'
import '../styles/practice.css'

function Practice() {
  const navigate = useNavigate()
  const status = getPracticeStatus()

  const startOrResume = (fresh) => {
    if (fresh || status === 'not_started' || status === 'completed') {
      startPracticeSession()
      navigate('/privacy-learning/practice/scenario/1')
      return
    }

    navigate(`/privacy-learning/practice/scenario/${getResumeIndex() + 1}`)
  }

  return (
    <LearningLayout activePage="practice">
      <section className="practice-heading">
        <p className="practice-label">CONSENT PRACTICE</p>
        <h1>Practise making consent choices</h1>
        <p>
          Read a short scenario, choose one of two options and understand the
          trade-offs. There is no score or ranking.
        </p>
      </section>

      <section className="practice-steps">
        <div className="practice-step-card">
          <span>01</span>
          <h2>Read the scenario</h2>
          <p>
            Each question is a short, realistic consent situation from everyday
            apps and websites.
          </p>
        </div>

        <div className="practice-step-card">
          <span>02</span>
          <h2>Make a choice</h2>
          <p>
            Choose one of two options. Your choice is saved for this visit, but
            it is not marked right or wrong.
          </p>
        </div>

        <div className="practice-step-card">
          <span>03</span>
          <h2>Review feedback</h2>
          <p>
            Combined feedback appears only after all three scenarios are
            completed.
          </p>
        </div>
      </section>

      <section className="practice-info">
        <h2>How feedback works</h2>
        <p>
          Each choice is saved during practice. No combined feedback is shown
          until Scenario 3 is completed. You can try again later with a new
          random set of questions.
        </p>
      </section>

      <div className="practice-actions">
        {status === 'in_progress' ? (
          <button
            className="practice-primary"
            type="button"
            onClick={() => startOrResume(false)}
          >
            Continue Practice
          </button>
        ) : (
          <button
            className="practice-primary"
            type="button"
            onClick={() => startOrResume(true)}
          >
            {status === 'completed' ? 'Try Again' : 'Start Practice'}
          </button>
        )}

        {status === 'in_progress' ? (
          <button
            className="practice-secondary"
            type="button"
            onClick={() => startOrResume(true)}
          >
            Start a new set
          </button>
        ) : null}

        {status === 'completed' ? (
          <button
            className="practice-secondary"
            type="button"
            onClick={() => navigate('/privacy-learning/practice/feedback')}
          >
            View Combined Feedback
          </button>
        ) : null}

        {status === 'completed' ? (
          <button
            className="practice-secondary"
            type="button"
            onClick={() => navigate('/privacy-learning/progress')}
          >
            View Progress
          </button>
        ) : null}

        <button
          className="practice-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/learn')}
        >
          Back to Learning
        </button>
      </div>
    </LearningLayout>
  )
}

export default Practice
