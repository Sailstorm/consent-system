import { useNavigate } from 'react-router-dom'

import AnalysisStatus from '../components/AnalysisStatus'

import {
  practiceTopics,
  startTopicPractice,
} from '../utils/practice'

import '../styles/learningLesson.css'

function LessonDetail({ topic }) {
  const navigate = useNavigate()

  function startPractice() {
    const practiceTopic = practiceTopics.find(
      (item) => item.title === topic.title,
    )

    if (!practiceTopic) {
      return
    }

    const state = startTopicPractice(
      practiceTopic.key,
    )

    if (!state) {
      return
    }

    navigate(
      `/privacy-learning/practice/${practiceTopic.slug}/question`,
    )
  }

  return (
    <div className="i3-lesson-page">
      <header className="i3-lesson-header">
        <div className="i3-lesson-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="i3-lesson-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-lesson-header-back"
          onClick={() =>
            navigate('/privacy-learning/learn')
          }
        >
          ← Back
        </button>
      </header>

      <main className="i3-lesson-content">
        <div className="i3-lesson-heading-row">
          <section className="i3-lesson-heading">
            <p className="i3-lesson-label">
              PRIVACY LEARNING&nbsp; • &nbsp;LESSON
            </p>

            <h1>{topic.title}</h1>

            <p className="i3-lesson-description">
              {topic.description}
            </p>
          </section>

          <div className="i3-lesson-analysis">
            <AnalysisStatus />
          </div>
        </div>

        <div className="i3-lesson-divider"></div>

        <section className="i3-lesson-overview">
          <p className="i3-lesson-overview-label">
            LESSON OVERVIEW
          </p>

          <h2>Learn the essentials</h2>
        </section>

        <section className="i3-lesson-card">
          <img
            src={`${import.meta.env.BASE_URL}lesson-meaning.jpg`}
            alt=""
            className="i3-lesson-card-background"
          />

          <div className="i3-lesson-card-copy">
            <h3>What does it mean?</h3>

            <p>{topic.meaning}</p>
          </div>
        </section>

        <section className="i3-lesson-card">
          <img
            src={`${import.meta.env.BASE_URL}lesson-example.jpg`}
            alt=""
            className="i3-lesson-card-background"
          />

          <div className="i3-lesson-card-copy">
            <h3>Example</h3>

            <p>{topic.example}</p>
          </div>
        </section>

        <section className="i3-lesson-card">
          <img
            src={`${import.meta.env.BASE_URL}lesson-importance.jpg`}
            alt=""
            className="i3-lesson-card-background"
          />

          <div className="i3-lesson-card-copy">
            <h3>Why does it matter?</h3>

            <p>{topic.importance}</p>
          </div>
        </section>

        <section className="i3-lesson-tip">
          <div>
            <p className="i3-lesson-tip-label">
              PRIVACY TIP
            </p>

            <h3>{topic.tipTitle}</h3>
          </div>

          <p>{topic.tip}</p>
        </section>

        <div className="i3-lesson-actions">
          <button
            type="button"
            className="i3-lesson-back-topics"
            onClick={() =>
              navigate('/privacy-learning/learn')
            }
          >
            Back to topics
          </button>

          <button
            type="button"
            className="i3-lesson-start"
            onClick={startPractice}
          >
            Start activity →
          </button>
        </div>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-lesson-watermark"
      />
    </div>
  )
}

export default LessonDetail