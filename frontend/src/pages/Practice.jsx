import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { BackLink } from '../components/ui'
import { getLesson } from '../data/lessons'
import {
  getSessionQuestions,
  getTopicPracticeStatus,
  getTopicQuestions,
  loadPracticeState,
  practiceTopics,
  resumeTopicPractice,
  startTopicPractice,
} from '../utils/practice'
import '../styles/pages/learn.css'

function Practice() {
  const navigate = useNavigate()
  const state = loadPracticeState()

  function open(topic) {
    navigate(`/privacy-learning/practice/${topic.slug}/question`)
  }

  function start(topic) {
    if (startTopicPractice(topic.key)) {
      open(topic)
    }
  }

  function resume(topic) {
    if (resumeTopicPractice(topic.key)) {
      open(topic)
    } else {
      start(topic)
    }
  }

  return (
    <Layout narrow>
      <BackLink to="/privacy-learning">All lessons</BackLink>

      <header className="page-head">
        <p className="eyebrow">Practice</p>
        <h1>Practise with everyday situations</h1>
        <p className="lead">
          One question at a time. After each answer you&apos;ll see the right
          one and why. You can stop at any time and carry on later.
        </p>
      </header>

      <ul className="practice-list">
        {practiceTopics.map((topic, index) => {
          const status = getTopicPracticeStatus(topic.key, state)
          const lesson = getLesson(topic.slug)
          const total = getTopicQuestions(topic.key).length
          const inSession = state.selectedTopic === topic.key
          const answered = inSession ? state.completedQuestionIds.length : 0
          const sessionTotal = inSession ? getSessionQuestions(state).length : total

          return (
            <li key={topic.key} className="practice-item card" data-reveal style={{ '--i': index }}>
              <span className="icon-tile">
                <Icon name={lesson?.icon || 'question'} />
              </span>

              <div className="practice-item__text">
                <h2>{topic.title}</h2>
                <p className="muted">
                  {status === 'in_progress' &&
                    `You’ve answered ${answered} of ${sessionTotal} questions.`}
                  {status === 'completed' && (
                    <span className="practice-item__done">
                      <Icon name="check-circle" />
                      You&apos;ve answered every question.
                    </span>
                  )}
                  {status === 'not_started' && `${total} questions`}
                </p>

                {status === 'in_progress' && (
                  <div
                    className="meter practice-item__meter"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={sessionTotal}
                    aria-valuenow={answered}
                    aria-label={`${topic.title} questions answered`}
                  >
                    <div
                      className="meter__fill"
                      style={{ width: `${(answered / Math.max(1, sessionTotal)) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="practice-item__actions">
                {status === 'in_progress' ? (
                  <>
                    <button type="button" className="btn btn--primary" onClick={() => resume(topic)}>
                      Carry on
                      <Icon name="arrow-right" />
                    </button>
                    <button type="button" className="btn btn--quiet" onClick={() => start(topic)}>
                      Start again
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={status === 'completed' ? 'btn' : 'btn btn--primary'}
                    onClick={() => start(topic)}
                  >
                    {status === 'completed' ? 'Practise again' : 'Start'}
                    <Icon name="arrow-right" />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </Layout>
  )
}

export default Practice
