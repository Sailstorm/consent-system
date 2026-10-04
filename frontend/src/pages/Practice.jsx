import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalysisStatus from '../components/AnalysisStatus'
import {
  getTopicPracticeStatus,
  loadPracticeState,
  practiceTopics,
  resumeTopicPractice,
  startTopicPractice,
} from '../utils/practice'
import '../styles/practice.css'

function Practice() {
  const navigate = useNavigate()

  const [practiceState, setPracticeState] =
    useState(loadPracticeState)

  function openTopic(topic) {
    navigate(
      `/privacy-learning/practice/${topic.slug}/question`,
    )
  }

  function startTopic(topic) {
    const state =
      startTopicPractice(topic.key)

    if (!state) {
      return
    }

    setPracticeState(state)
    openTopic(topic)
  }

  function continueTopic(topic) {
    const state =
      resumeTopicPractice(topic.key)

    if (!state) {
      startTopic(topic)
      return
    }

    setPracticeState(state)
    openTopic(topic)
  }

  function getTopicImage(title) {
    if (title === 'Data Collection') {
      return '/data-collection.jpg'
    }

    if (title === 'Purpose of Use') {
      return '/purpose-of-use.jpg'
    }

    if (title === 'Data Sharing') {
      return '/data-sharing.jpg'
    }

    if (title === 'Data Retention') {
      return '/data-retention.jpg'
    }

    return '/user-control.jpg'
  }

  return (
    <div className="i3-practice-page">
      <header className="i3-practice-header">
        <div className="i3-practice-brand">
          <img
            src="/logo2.jpg"
            alt="Consent Assistant"
            className="i3-practice-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-practice-back"
          onClick={() =>
            navigate('/privacy-learning/learn')
          }
        >
          ← Back
        </button>
      </header>

      <main className="i3-practice-content">
        <div className="i3-practice-heading-row">
          <section className="i3-practice-heading">
            <p>PRIVACY PRACTICE</p>

            <h1>Choose a topic to practise</h1>

            <span>
              Answer one question at a time and receive
              feedback after each answer.
            </span>
          </section>

          <div className="i3-practice-analysis">
            <AnalysisStatus />
          </div>
        </div>

        <div className="i3-practice-divider"></div>

        <section className="i3-practice-topic-grid">
          {practiceTopics.map((topic) => {
            const status =
              getTopicPracticeStatus(
                topic.key,
                practiceState,
              )

            return (
              <article
                className="i3-practice-topic-card"
                key={topic.key}
              >
                <img
                  src={getTopicImage(topic.title)}
                  alt=""
                  className="i3-practice-topic-background"
                />

                <div className="i3-practice-topic-copy">
                  <h2>{topic.title}</h2>

                  <p>
                    Practise questions about{' '}
                    {topic.title.toLowerCase()}.
                  </p>
                </div>

                <div className="i3-practice-topic-actions">
                  {status === 'not_started' && (
                    <button
                      type="button"
                      className="i3-practice-primary"
                      onClick={() =>
                        startTopic(topic)
                      }
                    >
                      Start Practice →
                    </button>
                  )}

                  {status === 'in_progress' && (
                    <>
                      <button
                        type="button"
                        className="i3-practice-primary"
                        onClick={() =>
                          continueTopic(topic)
                        }
                      >
                        Continue Practice →
                      </button>

                      <button
                        type="button"
                        className="i3-practice-secondary"
                        onClick={() =>
                          startTopic(topic)
                        }
                      >
                        Start New
                      </button>
                    </>
                  )}

                  {status === 'completed' && (
                    <button
                      type="button"
                      className="i3-practice-primary"
                      onClick={() =>
                        startTopic(topic)
                      }
                    >
                      Practice Again →
                    </button>
                  )}
                </div>

                {status === 'completed' && (
                  <span className="i3-practice-completed">
                    ✓
                  </span>
                )}
              </article>
            )
          })}
        </section>

        <section className="i3-practice-info">
          <span className="i3-practice-info-icon">
            i
          </span>

          <div>
            <h3>How practice works</h3>

            <p>
              Questions are shown one at a time. After you
              choose an answer, you will see whether it is
              correct and read a short explanation. You can
              leave at any time and continue later.
            </p>
          </div>
        </section>

        <p className="i3-practice-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src="/ca-watermark.png"
        alt=""
        className="i3-practice-watermark"
      />
    </div>
  )
}

export default Practice