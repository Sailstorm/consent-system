import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  LEARNING_TOPICS,
  getCompletedTopicCount,
  getNextLearningTopic,
  isTopicCompleted,
} from '../utils/learningProgress'
import {
  getCompletedCount,
  getExploredTopics,
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
  const completedTopics = getCompletedTopicCount()
  const nextTopic = getNextLearningTopic()
  const practiceStatus = getPracticeStatus()
  const completedScenarios = getCompletedCount()
  const exploredTopics = getExploredTopics()

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
      <section className="practice-heading">
        <p className="practice-label">PRIVACY LEARNING</p>
        <h1>Your learning progress</h1>
        <p>This visit only. No account is required.</p>
      </section>

      <section className="progress-overview">
        <div className="progress-summary-card">
          <span>LEARNING</span>
          <h2>
            {completedTopics} / {LEARNING_TOPICS.length}
          </h2>
          <p>Topics completed</p>
        </div>

        <div className="progress-summary-card">
          <span>PRACTICE</span>
          <h2>
            {completedScenarios} / 3
          </h2>
          <p>{statusLabel(practiceStatus)}</p>
        </div>
      </section>

      <section className="practice-summary-card">
        <h2>Learning topics</h2>
        <div className="progress-topic-list">
          {LEARNING_TOPICS.map((topic) => {
            const completed = isTopicCompleted(topic.id)

            return (
              <div className="progress-topic-row" key={topic.id}>
                <div>
                  <strong>{topic.title}</strong>
                  <p>{topic.summary}</p>
                </div>
                <span
                  className={
                    completed ? 'progress-state completed' : 'progress-state'
                  }
                >
                  {completed ? 'Completed' : 'Not completed'}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="practice-summary-card">
        <h2>Practice</h2>
        <p className="practice-summary-status">
          {completedScenarios} / 3 scenarios · {statusLabel(practiceStatus)}
        </p>
        {exploredTopics.length > 0 ? (
          <div className="practice-topic-chips">
            {exploredTopics.map((topic) => (
              <span className="practice-topic" key={topic}>
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="practice-note">
            Start Practice to complete 3 short consent scenarios.
          </p>
        )}
      </section>

      <section className="practice-info">
        <h2>Continue where you left off</h2>
        <p>
          {practiceStatus === 'in_progress'
            ? 'Resume the next unfinished consent scenario.'
            : nextTopic
              ? `Next topic: ${nextTopic.title}. ${nextTopic.summary}`
              : 'You can try Practice again with a new set of questions.'}
        </p>
      </section>

      <div className="practice-actions">
        <button
          className="practice-primary"
          type="button"
          onClick={() =>
            navigate(
              nextTopic
                ? `/privacy-learning/learn/${nextTopic.id}`
                : '/privacy-learning/learn',
            )
          }
        >
          Continue Learning
        </button>

        <button
          className="practice-secondary"
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
