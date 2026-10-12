import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { CardLink } from '../components/ui'
import { LessonScene } from '../components/LessonArt'
import Lesson from './Lesson'
import { getLesson, LESSONS } from '../data/lessons'
import { loadLearningProgress } from '../utils/learningProgress'
import '../styles/pages/learn.css'

function Learn() {
  const { topicId } = useParams()
  const lesson = topicId ? getLesson(topicId) : null

  if (lesson) {
    return <Lesson key={lesson.slug} lesson={lesson} />
  }

  const done = loadLearningProgress()
  const doneCount = LESSONS.filter((item) => done.includes(item.slug)).length
  const percent = Math.round((doneCount / LESSONS.length) * 100)

  return (
    <Layout narrow>

      <header className="page-head">
        <p className="eyebrow">Learn</p>
        <h1>Learn about privacy</h1>
        <p className="lead">
          Five short lessons, about three minutes each. Go in any order and
          come back whenever you like.
        </p>
      </header>

      <section className="learn-progress" aria-label="Your progress">
        <div className="learn-progress__text">
          <strong>
            {doneCount === LESSONS.length
              ? 'You’ve finished every lesson. Well done!'
              : `You’ve finished ${doneCount} of ${LESSONS.length} lessons`}
          </strong>
        </div>
        <div
          className="meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Lessons finished"
        >
          <div className="meter__fill" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <ul className="lesson-list">
        {LESSONS.map((item, index) => {
          const isDone = done.includes(item.slug)

          return (
            <li key={item.slug} data-reveal style={{ '--i': index }}>
              <CardLink to={`/privacy-learning/learn/${item.slug}`} className="lesson-row">
                <LessonScene slug={item.slug} className="lesson-row__art" />
                <span className="lesson-row__text">
                  <h2>{item.title}</h2>
                  <span className="muted">{item.shortDescription}</span>
                </span>
                <span className={`lesson-row__state${isDone ? ' is-done' : ''}`}>
                  {isDone ? (
                    <>
                      <Icon name="check-circle" />
                      Finished
                    </>
                  ) : (
                    <>
                      <Icon name="clock" />
                      3 minutes
                    </>
                  )}
                </span>
                <Icon name="arrow-right" className="lesson-row__arrow" />
              </CardLink>
            </li>
          )
        })}
      </ul>

      <CardLink
        to="/privacy-learning/practice"
        className="practice-promo"
        cta="Practise with questions"
      >
        <div className="practice-promo__body">
          <span className="icon-tile">
            <Icon name="question" />
          </span>
          <div>
            <h2>Test what you know</h2>
            <p className="muted">
              Everyday situations with three possible answers. You&apos;ll see
              the right answer and why, after each one.
            </p>
          </div>
        </div>
      </CardLink>
    </Layout>
  )
}

export default Learn
