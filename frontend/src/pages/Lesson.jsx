import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { BackLink } from '../components/ui'
import { HowItWorks, LessonScene } from '../components/LessonArt'
import { LESSONS } from '../data/lessons'
import { isTopicCompleted, markTopicCompleted } from '../utils/learningProgress'
import { getTopicBySlug, startTopicPractice } from '../utils/practice'

function Lesson({ lesson }) {
  const navigate = useNavigate()
  const [finished, setFinished] = useState(() => isTopicCompleted(lesson.slug))
  const doneRef = useRef(null)

  const index = LESSONS.findIndex((item) => item.slug === lesson.slug)
  const nextLesson = LESSONS[index + 1] || null

  function finish() {
    markTopicCompleted(lesson.slug)
    setFinished(true)
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  function practise() {
    const topic = getTopicBySlug(lesson.slug)

    if (topic && startTopicPractice(topic.key)) {
      navigate(`/privacy-learning/practice/${topic.slug}/question`)
    }
  }

  return (
    <Layout narrow>
      <BackLink to="/privacy-learning">All lessons</BackLink>

      <header className="lesson-hero">
        <div className="lesson-hero__text">
          <p className="eyebrow">Lesson · about 3 minutes</p>
          <h1>{lesson.title}</h1>
          <p className="lead">{lesson.description}</p>
        </div>
        <div className="lesson-hero__art">
          <LessonScene slug={lesson.slug} />
        </div>
      </header>

      <section className="lesson-part" data-reveal>
        <h2>What it means</h2>
        <p>{lesson.meaning}</p>
      </section>

      <HowItWorks how={lesson.how} />

      <section className="lesson-part" data-reveal>
        <h2>An everyday example</h2>
        <figure className="example">
          <span className="example__avatar" aria-hidden="true">
            <Icon name={lesson.icon} />
          </span>
          <blockquote className="example__bubble">{lesson.example}</blockquote>
        </figure>
      </section>

      <section className="lesson-part matters" data-reveal>
        <span className="matters__icon" aria-hidden="true">
          <Icon name="shield" />
        </span>
        <div>
          <h2>Why it matters</h2>
          <p>{lesson.importance}</p>
        </div>
      </section>

      <section className="lesson-part" data-reveal>
        <h2>Three things to look for</h2>
        <ul className="look-for">
          {lesson.activity.concepts.map((concept, conceptIndex) => (
            <li key={concept.title} data-reveal style={{ '--i': conceptIndex }}>
              <span className="look-for__icon" aria-hidden="true">
                <Icon name={concept.icon || 'magnifier'} />
              </span>
              <h3>{concept.title}</h3>
              <p>{concept.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <aside className="tip" data-reveal>
        <p className="tip__label">
          <Icon name="star" />
          Privacy tip
        </p>
        <h2>{lesson.tipTitle}</h2>
        <p>{lesson.tip}</p>
      </aside>

      <section className="remember" data-reveal>
        <h2>Remember</h2>
        <p>
          <span className="hl">{lesson.activity.takeawayTitle}</span>{' '}
          {lesson.activity.takeaway}
        </p>
      </section>

      <section className="lesson-end" aria-live="polite">
        {finished ? (
          <div className="lesson-done" ref={doneRef} tabIndex={-1}>
            <span className="lesson-done__badge">
              <Icon name="check" />
            </span>
            <div>
              <h2>Lesson finished</h2>
              <p className="muted">What would you like to do next?</p>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn--primary btn--large" onClick={finish}>
            <Icon name="check" />
            I&apos;ve finished this lesson
          </button>
        )}

        <div className="btn-row lesson-end__next">
          <button type="button" className="btn btn--large" onClick={practise}>
            <Icon name="question" />
            Practise this topic
          </button>

          {nextLesson ? (
            <Link to={`/privacy-learning/learn/${nextLesson.slug}`} className="btn btn--large">
              Next lesson: {nextLesson.title}
              <Icon name="arrow-right" />
            </Link>
          ) : (
            <Link to="/privacy-learning" className="btn btn--large">
              Back to all lessons
            </Link>
          )}
        </div>
      </section>
    </Layout>
  )
}

export default Lesson
