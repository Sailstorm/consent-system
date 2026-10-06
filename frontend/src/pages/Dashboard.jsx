import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  LEARNING_TOPICS,
  getCompletedTopicCount,
  getNextLearningTopic,
  isTopicCompleted,
} from '../utils/learningProgress'

import '../styles/dashboard.css'

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000'

function Dashboard() {
  const navigate = useNavigate()

  const [latestBreaches, setLatestBreaches] =
    useState([])

  const [breachesLoading, setBreachesLoading] =
    useState(true)

  const [breachesError, setBreachesError] =
    useState('')

  const completedTopics =
    getCompletedTopicCount()

  const nextTopic =
    getNextLearningTopic()

  const completedLearningTopics =
    LEARNING_TOPICS.filter((topic) =>
      isTopicCompleted(topic.id),
    )

  const learningPercent =
    LEARNING_TOPICS.length > 0
      ? Math.round(
          (completedTopics /
            LEARNING_TOPICS.length) *
            100,
        )
      : 0

  useEffect(() => {
    async function loadLatestBreaches() {
      try {
        setBreachesLoading(true)
        setBreachesError('')

        const response = await fetch(
          `${API_URL}/api/breaches/latest?limit=3`,
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Unable to load breach information',
          )
        }

        setLatestBreaches(
          data.breaches || [],
        )
      } catch (err) {
        console.log(err)

        setBreachesError(
          'Latest breach information is temporarily unavailable.',
        )
      } finally {
        setBreachesLoading(false)
      }
    }

    loadLatestBreaches()
  }, [])

  function formatDate(date) {
    if (!date) {
      return 'Not available'
    }

    return new Date(
      date,
    ).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatAccounts(value) {
    const number = Number(value || 0)

    if (number >= 1000000) {
      const millions =
        number / 1000000

      return `${millions.toFixed(
        millions >= 10 ? 0 : 1,
      )} million accounts affected`
    }

    if (number >= 1000) {
      return `${Math.round(
        number / 1000,
      )}K accounts affected`
    }

    return `${number.toLocaleString(
      'en-AU',
    )} accounts affected`
  }

  function openHIBP() {
    window.open(
      'https://haveibeenpwned.com/',
      '_blank',
      'noopener,noreferrer',
    )
  }

  function continueLearning() {
    navigate(
      nextTopic
        ? `/privacy-learning/learn/${nextTopic.id}`
        : '/privacy-learning/learn',
    )
  }

  return (
    <div className="privacy-dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="dashboard-logo"
          />

          <span className="dashboard-brand-name">
            Consent Assistant
          </span>
        </div>

        <button
          type="button"
          className="dashboard-back-button"
          onClick={() => navigate('/')}
        >
          <span className="dashboard-back-arrow">
            ←
          </span>

          Back
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-heading">
          <p className="dashboard-eyebrow">
            YOUR DASHBOARD
          </p>

          <h1>Privacy at a glance</h1>

          <p className="dashboard-subtitle">
            Stay informed, continue learning
            and check organisations in one
            place.
          </p>
        </section>

        <section className="dashboard-top-grid">
          <div className="dashboard-main-card breach-summary-card">
            <div className="dashboard-card-heading">
              <p className="dashboard-card-label">
                LATEST DATA BREACHES
              </p>

              <h2>
                Recent breach updates
              </h2>

              <p>
                Recently reported data
                breaches that may affect
                consumers.
              </p>
            </div>

            <div className="dashboard-card-divider"></div>

            {breachesLoading && (
              <div className="dashboard-loading">
                Loading latest breaches...
              </div>
            )}

            {breachesError && (
              <div className="dashboard-error">
                {breachesError}
              </div>
            )}

            {!breachesLoading &&
              !breachesError &&
              latestBreaches.length >
                0 && (
                <div className="breach-preview-layout">
                  <div className="breach-featured">
                    <p className="breach-latest-label">
                      LATEST
                    </p>

                    <h3>
                      {
                        latestBreaches[0]
                          .title
                      }
                    </h3>

                    <p className="breach-domain">
                      {latestBreaches[0]
                        .domain ||
                        'Domain not available'}
                    </p>

                    <strong>
                      {formatAccounts(
                        latestBreaches[0]
                          .affectedAccounts,
                      )}
                    </strong>

                    <p className="breach-date">
                      Breach date:{' '}
                      {formatDate(
                        latestBreaches[0]
                          .breachDate,
                      )}
                    </p>
                  </div>

                  <div className="breach-small-list">
                    {latestBreaches
                      .slice(1, 3)
                      .map((breach) => (
                        <div
                          className="breach-small-card"
                          key={
                            breach.name
                          }
                        >
                          <h3>
                            {
                              breach.title
                            }
                          </h3>

                          <p>
                            {breach.domain ||
                              'Domain not available'}
                          </p>

                          <span>
                            {formatAccounts(
                              breach.affectedAccounts,
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {!breachesLoading &&
              !breachesError &&
              latestBreaches.length ===
                0 && (
                <div className="dashboard-loading">
                  No breach records are
                  available.
                </div>
              )}

            <div className="breach-card-footer">
              <span>
                Source: Have I Been Pwned
              </span>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/risk-dashboard/breaches',
                  )
                }
              >
                View all breaches

                <span>→</span>
              </button>
            </div>
          </div>

          <div className="dashboard-main-card learning-summary-card">
            <div className="learning-card-top">
              <div>
                <p className="dashboard-card-label learning-label">
                  YOUR LEARNING
                </p>

                <h2>
                  Learning progress
                </h2>

                <p>
                  Keep building your privacy
                  knowledge.
                </p>
              </div>

              <div className="learning-count">
                {completedTopics} /{' '}
                {LEARNING_TOPICS.length}
              </div>
            </div>

            <div className="dashboard-card-divider"></div>

            <div className="learning-progress-bar">
              <div
                className="learning-progress-fill"
                style={{
                  width: `${learningPercent}%`,
                }}
              ></div>
            </div>

            <p className="learning-progress-text">
              {learningPercent}% complete
            </p>

            <div className="learning-complete-row">
              {completedLearningTopics.length >
              0 ? (
                completedLearningTopics.map(
                  (topic) => (
                    <div key={topic.id}>
                      <span>✓</span>
                      {topic.title}
                    </div>
                  ),
                )
              ) : (
                <div>
                  No topics explored yet
                </div>
              )}
            </div>

            <div className="learning-next-row">
              <div>
                <p>
                  {nextTopic
                    ? 'NEXT TOPIC'
                    : 'LEARNING STATUS'}
                </p>

                <strong>
                  {nextTopic
                    ? nextTopic.title
                    : 'All topics explored'}
                </strong>
              </div>

              <button
                type="button"
                onClick={continueLearning}
              >
                {nextTopic
                  ? 'Continue learning'
                  : 'Review learning'}

                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        <section className="personal-breach-section">
          <div className="dashboard-main-card personal-breach-card">
            <div className="personal-breach-content">
              <p className="dashboard-card-label">
                PERSONAL BREACH CHECK
              </p>

              <h2>
                Check if your email has been
                exposed
              </h2>

              <p className="personal-breach-description">
                Use Have I Been Pwned to check
                whether your email appears in a
                known data breach.
              </p>

              <p className="personal-breach-source">
                External service: Have I Been
                Pwned
              </p>
            </div>

            <div className="personal-breach-actions">
              <div className="hibp-official-label">
                <span>✓</span>

                Opens official website
              </div>

              <button
                type="button"
                className="hibp-check-button"
                onClick={openHIBP}
              >
                Check on HIBP

                <span>↗</span>
              </button>
            </div>
          </div>
        </section>

        <p className="dashboard-footer-text">
          Consent Assistant provides information
          to support your review. It does not
          provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="dashboard-watermark"
      />
    </div>
  )
}

export default Dashboard