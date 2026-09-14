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
  getPracticeStatus,
  getResumeIndex,
  startPracticeSession,
} from '../utils/practice'
import '../styles/progressPage.css'

function Progress() {
  const navigate = useNavigate()
  const completedTopics = getCompletedTopicCount()
  const nextTopic = getNextLearningTopic()
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

  const continueHint = nextTopic
    ? nextTopic.nextHint
    : practiceStatus === 'completed'
      ? 'You can review a lesson or try Practice again with a new set of questions.'
      : 'You can continue Practice or review a completed lesson.'

  const practiceButtonText =
    practiceStatus === 'completed'
      ? 'Try Practice Again'
      : practiceStatus === 'in_progress'
        ? 'Continue Practice'
        : 'Start Practice'

  return (
    <LearningLayout activePage="progress">
      <section className="progress-heading">
        <h1>Your learning progress</h1>
        <p>This visit only — no account or profile is required.</p>
      </section>

      <section className="progress-stat-grid">
        <div className="progress-stat-card">
          <strong>
            {completedTopics} / {LEARNING_TOPICS.length}
          </strong>
          <span>Topics explored</span>
        </div>

        <div className="progress-stat-card">
          <strong>
            {completedScenarios} / 3
          </strong>
          <span>Scenarios completed</span>
        </div>
      </section>

      <section className="progress-main-grid">
        <article className="progress-topics-card">
          <h2>Privacy topics</h2>

          <div className="progress-topic-list">
            {LEARNING_TOPICS.map((topic) => {
              const explored = isTopicCompleted(topic.id)

              return (
                <div className="progress-topic-row" key={topic.id}>
                  <span
                    className={
                      explored
                        ? 'progress-topic-mark explored'
                        : 'progress-topic-mark'
                    }
                    aria-hidden="true"
                  >
                    {explored ? '✓' : ''}
                  </span>

                  <strong>{topic.title}</strong>

                  <span
                    className={
                      explored
                        ? 'progress-topic-status explored'
                        : 'progress-topic-status'
                    }
                  >
                    {explored ? 'Explored' : 'Not explored'}
                  </span>
                </div>
              )
            })}
          </div>
        </article>

        <article className="progress-continue-card">
          <p className="progress-continue-label">
            Continue where you left off
          </p>

          <h2>
            {nextTopic
              ? `Next topic: ${nextTopic.title}`
              : 'All learning topics explored'}
          </h2>

          <p>{continueHint}</p>

          <div className="progress-continue-actions">
            <button
              className="progress-continue-button"
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
              className="progress-continue-button"
              type="button"
              onClick={openPractice}
            >
              {practiceButtonText}
            </button>
          </div>
        </article>
      </section>
    </LearningLayout>
  )
}

export default Progress
