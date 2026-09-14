import { Navigate, useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getPracticeStatus,
  getSessionQuestions,
  startPracticeSession,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeSummary() {
  const navigate = useNavigate()
  const status = getPracticeStatus()
  const questions = getSessionQuestions()

  if (status !== 'completed') {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  return (
    <LearningLayout activePage="practice">
      <div className="practise-summary-center">
        <section className="practise-heading">
          <p className="practise-label">Practice complete</p>
          <h1>You explored 3 consent scenarios</h1>
          <p>Here is what you learned across the three consent situations.</p>
        </section>

        <section className="practise-stat-grid">
          <div className="practise-stat-card">
            <strong>3 / 3</strong>
            <span>Scenarios completed</span>
          </div>

          <div className="practise-stat-card">
            <strong>{questions.length}</strong>
            <span>Privacy topics explored</span>
          </div>
        </section>

        <section className="practise-topic-block">
          <h2>Topics from this practice</h2>

          {questions.map((question) => (
            <div className="practise-topic-row" key={question.id}>
              <div className="practise-topic-name">{question.topic}</div>
              <p className="practise-topic-copy">{question.scenario}</p>
            </div>
          ))}
        </section>

        <div className="practise-actions">
          <button
            className="practise-primary"
            type="button"
            onClick={() => navigate('/privacy-learning/learn')}
          >
            Review Learning
          </button>

          <button
            className="practise-primary"
            type="button"
            onClick={() => {
              startPracticeSession()
              navigate('/privacy-learning/practice/scenario/1')
            }}
          >
            Try Again
          </button>

          <button
            className="practise-secondary"
            type="button"
            onClick={() => navigate('/privacy-learning')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </LearningLayout>
  )
}

export default PracticeSummary
