import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import BreachCard from '../components/BreachCard'
import { CardLink } from '../components/ui'
import { API_URL, HIBP_URL } from '../utils/breaches'
import {
  getCompletedTopicCount,
  getNextLearningTopic,
  LEARNING_TOPICS,
} from '../utils/learningProgress'
import '../styles/pages/breaches.css'

const IF_AFFECTED = [
  {
    icon: 'lock',
    title: 'Change your password',
    text: 'Change it for that company, and anywhere else you use the same password.',
  },
  {
    icon: 'mail',
    title: 'Watch for scams',
    text: 'Be careful with emails, texts or calls that mention the company or ask you to act quickly.',
  },
  {
    icon: 'people',
    title: 'Get free help',
    text: 'IDCARE is Australia’s free identity and cyber support service.',
    link: { href: 'https://www.idcare.org/', label: 'Visit IDCARE' },
  },
]

function Dashboard() {
  const [breaches, setBreaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const lessonsDone = getCompletedTopicCount()
  const nextTopic = getNextLearningTopic()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await fetch(`${API_URL}/api/breaches/latest?limit=3`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load breach information')
        }

        if (active) {
          setBreaches(data.breaches || [])
        }
      } catch (err) {
        console.log(err)

        if (active) {
          setError('We can’t show the latest breaches right now. Please try again later.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <Layout>
      <header className="page-head breach-page-head">
        <p className="eyebrow">Data breaches</p>
        <h1>Has your information been leaked?</h1>
        <p className="lead">
          A data breach is when a company loses its customers&apos; personal
          details, often to criminals. Here are the latest reported breaches,
          and how to check whether you were affected.
        </p>
      </header>

      <div className="breach-layout">
        <div className="breach-main">
          <section className="hibp card" aria-labelledby="hibp-title">
            <span className="icon-tile icon-tile--large">
              <Icon name="mail" />
            </span>
            <div className="hibp__text">
              <h2 id="hibp-title">Check your email address</h2>
              <p>
                <strong>Have I Been Pwned</strong> is a free, widely trusted
                website that tells you if your email address appears in a
                known breach.
              </p>
              <p className="muted small">It opens in a new tab. We don&apos;t see what you type there.</p>
            </div>
            <a
              href={HIBP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--large"
            >
              Check my email
              <Icon name="external" />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          </section>

          <section className="latest" aria-labelledby="latest-title">
            <div className="latest__head">
              <h2 id="latest-title">Latest reported breaches</h2>
              <p className="muted small">Source: Have I Been Pwned</p>
            </div>

            {loading && (
              <div className="breach-list" aria-busy="true" aria-label="Loading breaches">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="breach breach--skeleton" />
                ))}
              </div>
            )}

            {!loading && error && (
              <p className="notice notice--warn">
                <Icon name="alert-circle" />
                {error}
              </p>
            )}

            {!loading && !error && breaches.length === 0 && (
              <p className="panel">No breaches have been reported recently.</p>
            )}

            {!loading && !error && breaches.length > 0 && (
              <div className="breach-list">
                {breaches.map((breach, index) => (
                  <div key={breach.name} data-reveal style={{ '--i': index }}>
                    <BreachCard breach={breach} />
                  </div>
                ))}
              </div>
            )}

            <Link to="/risk-dashboard/breaches" className="btn btn--large latest__all">
              See all breaches, or search for a company
              <Icon name="arrow-right" />
            </Link>
          </section>
        </div>

        <aside className="breach-side">
          <section className="affected card" aria-labelledby="affected-title">
            <h2 id="affected-title">If you were affected</h2>
            <ul>
              {IF_AFFECTED.map((item) => (
                <li key={item.title}>
                  <span className="icon-tile">
                    <Icon name={item.icon} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="muted">{item.text}</p>
                    {item.link && (
                      <a href={item.link.href} target="_blank" rel="noopener noreferrer">
                        {item.link.label}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <CardLink
            to={nextTopic ? `/privacy-learning/learn/${nextTopic.id}` : '/privacy-learning'}
            cta={nextTopic ? `Next lesson: ${nextTopic.title}` : 'Review the lessons'}
          >
            <h2 className="side-learn__title">Your lessons</h2>
            <p className="muted">
              {lessonsDone === 0
                ? 'Short lessons help you spot risky privacy policies.'
                : `You’ve finished ${lessonsDone} of ${LEARNING_TOPICS.length} lessons.`}
            </p>
            <div className="meter side-learn__meter" aria-hidden="true">
              <div
                className="meter__fill"
                style={{ width: `${(lessonsDone / LEARNING_TOPICS.length) * 100}%` }}
              />
            </div>
          </CardLink>
        </aside>
      </div>
    </Layout>
  )
}

export default Dashboard
