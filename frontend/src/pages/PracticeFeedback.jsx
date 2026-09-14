import { Navigate, useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getPracticeStatus,
  getSessionQuestions,
  loadPracticeState,
  startPracticeSession,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeFeedback() {
  const navigate = useNavigate()
  const state = loadPracticeState()
  const questions = getSessionQuestions(state)
  const status = getPracticeStatus(state)

  if (status !== 'completed') {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  return (
    <LearningLayout activePage="practice">
      <p className="practise-feedback-meta">
        3 of 3 complete • Combined Feedback
      </p>

      <section className="practise-heading">
        <h1>Review your three choices</h1>
      </section>

      <section className="practise-review-grid">
        {questions.map((question) => {
          const choice = state.choices[question.id]

          return (
            <article className="practise-review-card" key={question.id}>
              <h2>{question.topic}</h2>
              <h3>Your saved choice</h3>
              <p>{question.options[choice]}</p>
              <h3>What it means</h3>
              <p>{question.feedback[choice]}</p>
              <h3>Privacy tip</h3>
              <p>{question.privacyTip}</p>
              <h3>Next action</h3>
              <p>{question.nextAction}</p>
            </article>
          )
        })}
      </section>

      <h2 className="practise-next-label">Next actions</h2>

      <div className="practise-actions">
        <button
          className="practise-primary"
          type="button"
          onClick={() => {
            startPracticeSession()
            navigate('/privacy-learning/practice/scenario/1')
          }}
        >
          Practise Again
        </button>

        <button
          className="practise-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/practice/summary')}
        >
          View Summary
        </button>

        <button
          className="practise-secondary"
          type="button"
          onClick={() => navigate('/privacy-learning/progress')}
        >
          View Progress
        </button>
      </div>
    </LearningLayout>
  )
}

export default PracticeFeedback
