import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import { getPracticeStatus, markPracticeComplete } from '../utils/practice'
import '../styles/practice.css'

function PracticeReady() {
  const navigate = useNavigate()
  const status = getPracticeStatus()

  useEffect(() => {
    if (status === 'completed') {
      markPracticeComplete()
    }
  }, [status])

  if (status !== 'completed') {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  return (
    <LearningLayout activePage="practice">
      <section className="practise-heading">
        <p className="practise-label">Feedback rule</p>
        <h1>Feedback appears after all 3 scenarios</h1>
        <p>
          Each choice is saved during practice. One combined review becomes
          available after Scenario 3.
        </p>
      </section>

      <section className="practise-step-grid">
        <article className="practise-step-card">
          <span>01</span>
          <h2>Complete Scenario 1</h2>
          <p>Choice saved; feedback remains locked.</p>
        </article>

        <article className="practise-step-card">
          <span>02</span>
          <h2>Complete Scenario 2</h2>
          <p>Choice saved; feedback remains locked.</p>
        </article>

        <article className="practise-step-card">
          <span>03</span>
          <h2>Complete Scenario 3</h2>
          <p>Choice saved; feedback remains locked.</p>
        </article>

        <article className="practise-step-card">
          <span>04</span>
          <h2>Review all feedback</h2>
          <p>Available only after all scenarios are finished.</p>
        </article>
      </section>

      <section className="practise-info">
        <h2>Combined feedback contains</h2>
        <p className="practise-info-line">
          <strong>Your choice</strong>
          <span className="practise-info-dots"> • </span>
          <strong>What it means</strong>
          <span className="practise-info-dots"> • </span>
          Privacy topic
          <span className="practise-info-dots"> • </span>
          Privacy tip
          <span className="practise-info-dots"> • </span>
          Next action
        </p>
      </section>

      <div className="practise-actions">
        <button
          className="practise-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/practice/feedback')}
        >
          View Combined Feedback
        </button>
      </div>
    </LearningLayout>
  )
}

export default PracticeReady
