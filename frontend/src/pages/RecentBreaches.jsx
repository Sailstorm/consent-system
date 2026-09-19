import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/recentBreaches.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function RecentBreaches() {
  const navigate = useNavigate()

  const [breaches, setBreaches] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBreaches() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/api/breaches/latest?limit=12`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || 'Unable to load breach information'
          )
        }

        setBreaches(data.breaches || [])
        setSource(data.source || null)
      } catch (err) {
        console.log(err)
        setError(
          'Latest breach information is temporarily unavailable.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBreaches()
  }, [])

  function formatDate(date) {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function formatAccounts(value) {
    const number = Number(value || 0)

    if (number >= 1000000) {
      const millions = number / 1000000

      if (millions >= 10) {
        return `${Math.round(millions)} million`
      }

      return `${millions.toFixed(1)} million`
    }

    if (number >= 1000) {
      return `${Math.round(number / 1000)}K`
    }

    return number.toLocaleString('en-AU')
  }

  function formatDataClasses(dataClasses) {
    if (!Array.isArray(dataClasses) || dataClasses.length === 0) {
      return 'Not specified'
    }

    return dataClasses.join(' · ')
  }

  return (
    <div className="recent-breaches-page">
      <header className="recent-breaches-header">
        <div className="recent-breaches-brand">
          <div className="recent-breaches-logo">
            <span>CA</span>
          </div>

          <span className="recent-breaches-brand-name">
            Consent Assistant
          </span>
        </div>

        <button
          type="button"
          className="recent-breaches-back"
          onClick={() => navigate('/risk-dashboard')}
        >
          <span>←</span>
          Back to dashboard
        </button>
      </header>

      <main className="recent-breaches-main">
        <section className="recent-breaches-heading">
          <p>PRIVACY AWARENESS</p>

          <h1>Recent data breaches</h1>

          <span>
            See recently reported data breaches and what information
            may have been exposed.
          </span>
        </section>

        <section className="recent-breaches-card">
          <div className="recent-breaches-card-top">
            <div>
              <p className="recent-breaches-label">
                LATEST BREACHES
              </p>

              <h2>Recently reported breaches</h2>

              <span>
                The latest verified breach records available from our
                data source.
              </span>
            </div>

            <div className="recent-breaches-source">
              <div>
                <span>Source:</span>
                <strong>
                  {source?.name || 'Have I Been Pwned'}
                </strong>
              </div>

              <p>Up to 12 latest records</p>
            </div>
          </div>

          <div className="recent-breaches-divider"></div>

          {loading && (
            <div className="recent-breaches-message">
              Loading latest breaches...
            </div>
          )}

          {error && (
            <div className="recent-breaches-message recent-breaches-error">
              {error}
            </div>
          )}

          {!loading && !error && breaches.length === 0 && (
            <div className="recent-breaches-message">
              No breach records are available.
            </div>
          )}

          {!loading && !error && breaches.length > 0 && (
            <div className="recent-breaches-list">
              {breaches.map((breach) => (
                <article
                  className="recent-breach-row"
                  key={`${breach.name}-${breach.addedDate}`}
                >
                  <div className="recent-breach-name">
                    <h3>{breach.title}</h3>

                    <p>
                      {breach.domain || 'Domain not available'}
                    </p>
                  </div>

                  <div className="recent-breach-detail">
                    <span>ACCOUNTS AFFECTED</span>

                    <strong>
                      {formatAccounts(breach.affectedAccounts)}
                    </strong>
                  </div>

                  <div className="recent-breach-detail">
                    <span>BREACH DATE</span>

                    <strong>
                      {formatDate(breach.breachDate)}
                    </strong>
                  </div>

                  <div className="recent-breach-detail recent-breach-data">
                    <span>DATA EXPOSED</span>

                    <strong>
                      {formatDataClasses(breach.dataClasses)}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="recent-breaches-scroll-note">
          More breach records can be viewed by scrolling.
        </p>

        <p className="recent-breaches-footer">
          Consent Assistant provides information to support your review.
          It does not provide legal advice.
        </p>
      </main>

      <div className="recent-breaches-watermark">
        CA
      </div>
    </div>
  )
}

export default RecentBreaches