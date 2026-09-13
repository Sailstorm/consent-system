import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getPracticeStatus,
  getSessionQuestions,
  loadPracticeState,
  markPracticeComplete,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeFeedback() {
  const navigate = useNavigate()
  const state = loadPracticeState()
  const questions = getSessionQuestions(state)
  const status = getPracticeStatus(state)

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
      <section className="practice-heading">
        <p className="practice-label">RESULTS AND NEXT STEPS</p>
        <h1>Combined Feedback</h1>
        <p>
          Review your three saved choices. This is not a score. It explains
          what each choice can mean and what you can look for next.
        </p>
      </section>

      <section className="practice-feedback-list">
        {questions.map((question, index) => {
          const choice = state.choices[question.id]

          return (
            <article className="practice-feedback-card" key={question.id}>
              <div className="practice-feedback-meta">
                <span className="practice-topic">
                  Scenario {index + 1} of 3
                </span>
                <span className="practice-topic">{question.topic}</span>
              </div>

              <h2>{question.scenario}</h2>

              <p className="practice-choice">
                <strong>Your choice:</strong> {question.options[choice]}
              </p>

              <p>
                <strong>What this can mean:</strong> {question.feedback[choice]}
              </p>
              <p>
                <strong>Privacy tip:</strong> {question.privacyTip}
              </p>
              <p>
                <strong>Next action:</strong> {question.nextAction}
              </p>
            </article>
          )
        })}
      </section>

      <div className="practice-actions">
        <button
          className="practice-primary"
          type="button"
          onClick={() => navigate('/privacy-learning/practice/summary')}
        >
          View Practice Summary
        </button>
      </div>
    </LearningLayout>
  )
}

export default PracticeFeedback
