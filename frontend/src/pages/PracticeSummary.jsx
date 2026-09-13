import { Navigate, useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getExploredTopics,
  getPracticeStatus,
  startPracticeSession,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeSummary() {
  const navigate = useNavigate()
  const status = getPracticeStatus()
  const topics = getExploredTopics()

  if (status !== 'completed') {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  return (
    <LearningLayout activePage="practice">
      <section className="practice-heading">
        <p className="practice-label">CONSENT PRACTICE</p>
        <h1>Practice complete</h1>
        <p>You explored 3 consent scenarios. There is no score or ranking.</p>
      </section>

      <section className="practice-summary-card">
        <p className="practice-summary-status">3 / 3 scenarios completed</p>
        <h2>Privacy topics explored</h2>
        <div className="practice-topic-chips">
          {topics.map((topic) => (
            <span className="practice-topic" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      </section>

      <div className="practice-actions">
        <button
          className="practice-primary"
          type="button"
          onClick={() => navigate('/privacy-learning/learn')}
        >
          Review Learning
        </button>

        <button
          className="practice-secondary"
          type="button"
          onClick={() => {
            startPracticeSession()
            navigate('/privacy-learning/practice/scenario/1')
          }}
        >
          Try Again
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

export default PracticeSummary
