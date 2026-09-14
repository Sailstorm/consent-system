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

    navigate(
      `/privacy-learning/practice/scenario/${getResumeIndex() + 1}`,
    )
  }

  return (
    <LearningLayout activePage="practice">
      <section className="practise-heading">
        <p className="practise-label">Consent Practice</p>
        <h1>Practise making consent choices</h1>
        <p>
          Read a short scenario, choose one of two options and understand the
          trade-offs.
        </p>
      </section>

      <section className="practise-step-grid">
        <article className="practise-step-card">
          <span>01</span>
          <h2>Read the scenario</h2>
          <p>
            Short consent text with a privacy topic and progress indicator.
          </p>
        </article>

        <article className="practise-step-card">
          <span>02</span>
          <h2>Make a choice</h2>
          <p>Two clear options such as Allow or Don&apos;t Allow.</p>
        </article>

        <article className="practise-step-card">
          <span>03</span>
          <h2>Continue</h2>
          <p>
            Move to the next scenario without immediate combined feedback.
          </p>
        </article>

        <article className="practise-step-card">
          <span>04</span>
          <h2>Review feedback</h2>
          <p>
            Combined feedback appears only after all three scenarios.
          </p>
        </article>
      </section>

      <section className="practise-info">
        <h2>How feedback works</h2>
        <p>
          Each choice is saved during practice. No combined feedback is shown
          until Scenario 3 is completed.
        </p>
      </section>

      <div className="practise-actions">
        <button
          className="practise-primary"
          type="button"
          onClick={() => startOrResume(status !== 'in_progress')}
        >
          {status === 'in_progress' ? 'Continue Practice' : 'Start Practice'}
        </button>

        {status === 'in_progress' ? (
          <button
            className="practise-secondary"
            type="button"
            onClick={() => startOrResume(true)}
          >
            Start a new set
          </button>
        ) : null}

        {status === 'completed' ? (
          <button
            className="practise-secondary"
            type="button"
            onClick={() => navigate('/privacy-learning/practice/ready')}
          >
            View Combined Feedback
          </button>
        ) : null}

        <button
          className="practise-secondary"
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
