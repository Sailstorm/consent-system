import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import { loadLearningProgress } from '../utils/learningProgress'
import {
  getCompletedCount,
  getPracticeStatus,
  getResumeIndex,
  startPracticeSession,
} from '../utils/practice'
import '../styles/practice.css'

function statusLabel(status) {
  if (status === 'completed') {
    return 'Completed'
  }

  if (status === 'in_progress') {
    return 'In Progress'
  }

  return 'Not Started'
}

function Progress() {
  const navigate = useNavigate()
  const completedTopics = loadLearningProgress().length
  const practiceStatus = getPracticeStatus()
  const completedScenarios = getCompletedCount()

  const openPractice = () => {
    if (practiceStatus === 'not_started' || practiceStatus === 'completed') {
      startPracticeSession()
      navigate('/privacy-learning/practice/scenario/1')
      return
    }

    navigate(`/privacy-learning/practice/scenario/${getResumeIndex() + 1}`)
  }

  return (
    <LearningLayout activePage="progress">
      <section className="practise-heading">
        <p className="practise-label">Privacy Learning</p>
        <h1>Your learning progress</h1>
        <p>This visit only. No account is required.</p>
      </section>

      <section className="practise-stat-grid">
        <div className="practise-stat-card">
          <strong>
            {completedTopics} / 5
          </strong>
          <span>Learning topics completed</span>
        </div>

        <div className="practise-stat-card">
          <strong>
            {completedScenarios} / 3
          </strong>
          <span>{statusLabel(practiceStatus)}</span>
        </div>
      </section>

      <section className="practise-info">
        <h2>Practice</h2>
        <p>
          {completedScenarios} of 3 scenarios in this visit.{' '}
          {practiceStatus === 'completed'
            ? 'Combined feedback is ready to review.'
            : 'Feedback stays locked until all 3 scenarios are finished.'}
        </p>
      </section>

      <div className="practise-actions">
        <button
          className="practise-primary"
          type="button"
          onClick={() => navigate('/privacy-learning/learn')}
        >
          Continue Learning
        </button>

        <button
          className="practise-secondary"
          type="button"
          onClick={openPractice}
        >
          {practiceStatus === 'completed'
            ? 'Try Practice Again'
            : practiceStatus === 'in_progress'
              ? 'Continue Practice'
              : 'Start Practice'}
        </button>
      </div>
    </LearningLayout>
  )
}

export default Progress
