import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Magnifier from '../components/Magnifier'
import { CardLink } from '../components/ui'
import { CATEGORIES } from '../utils/categories'
import { getCompletedTopicCount, LEARNING_TOPICS } from '../utils/learningProgress'
import '../styles/pages/home.css'

const STEPS = [
  {
    title: 'Give us the policy',
    text: 'Paste a web link, copy in the text, or upload a PDF.',
  },
  {
    title: 'We read it for you',
    text: 'It usually takes less than a minute.',
  },
  {
    title: 'Read five plain answers',
    text: 'Then decide for yourself. You can always check the policy’s own words.',
  },
]

const QUESTION_NOTES = {
  data_collection: 'The personal details the company asks for or gathers.',
  purpose_of_use: 'What they plan to do with your information.',
  data_sharing: 'Other companies that may receive your details.',
  data_retention: 'How long your details stay on file.',
  user_control: 'What you can see, correct, delete or say no to.',
}

function Homepage() {
  const lessonsDone = getCompletedTopicCount()

  return (
    <Layout>
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="eyebrow">Free help with privacy policies</p>

          <h1 className="home-hero__title">
            Read the <span className="hl hl--sweep">fine print</span>, in plain
            English.
          </h1>

          <p className="lead">
            Give us any privacy policy and we&apos;ll explain what it says
            about your personal information, in five short answers. Then you
            decide.
          </p>

          <div className="btn-row home-hero__actions">
            <Link to="/privacy-assistant" className="btn btn--primary btn--large">
              Check a privacy policy
              <Icon name="arrow-right" />
            </Link>

            <Link to="/privacy-learning" className="btn btn--quiet">
              Learn about privacy first
            </Link>
          </div>

          <ul className="home-hero__promises">
            <li>
              <Icon name="check" />
              Free to use
            </li>
            <li>
              <Icon name="check" />
              No account needed
            </li>
            <li>
              <Icon name="check" />
              We don&apos;t keep your policy
            </li>
          </ul>
        </div>

        <div className="home-hero__art">
          <Magnifier />
        </div>
      </section>

      <section className="home-section" aria-labelledby="how-title">
        <h2 id="how-title" data-reveal>
          How it works
        </h2>

        <ol className="home-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="home-step" data-reveal style={{ '--i': index }}>
              <span className="home-step__num" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" aria-labelledby="questions-title">
        <div className="home-section__head" data-reveal>
          <h2 id="questions-title">Five questions answered for every policy</h2>
          <p className="lead">
            Every explanation follows the same five questions, so you always
            know where to look.
          </p>
        </div>

        <ul className="home-questions">
          {CATEGORIES.map((category, index) => (
            <li key={category.key} className="home-question" data-reveal style={{ '--i': index }}>
              <span className="icon-tile">
                <Icon name={category.icon} />
              </span>
              <div>
                <h3>{category.question}</h3>
                <p className="muted">{QUESTION_NOTES[category.key]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="more-title">
        <h2 id="more-title" data-reveal>
          More ways to stay safe
        </h2>

        <div className="home-more">
          <CardLink
            to="/privacy-learning"
            cta={lessonsDone > 0 ? 'Continue learning' : 'Start a lesson'}
          >
            <span className="icon-tile">
              <Icon name="book" />
            </span>
            <h3>Short lessons on privacy</h3>
            <p className="muted">
              Five lessons of a few minutes each, with practice questions to
              check your understanding.
            </p>
            {lessonsDone > 0 && (
              <p className="home-more__progress">
                You&apos;ve finished {lessonsDone} of {LEARNING_TOPICS.length}{' '}
                lessons.
              </p>
            )}
          </CardLink>

          <CardLink to="/risk-dashboard" cta="See recent data breaches">
            <span className="icon-tile">
              <Icon name="shield" />
            </span>
            <h3>Recent data breaches</h3>
            <p className="muted">
              See which companies have reported leaks of customer details, and
              check whether your email address was involved.
            </p>
          </CardLink>
        </div>
      </section>
    </Layout>
  )
}

export default Homepage
