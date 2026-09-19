import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Dashboard() {
  const navigate = useNavigate()

  const [latestBreaches, setLatestBreaches] = useState([])
  const [breachesLoading, setBreachesLoading] = useState(true)
  const [breachesError, setBreachesError] = useState('')

  const [asicSource, setAsicSource] = useState(null)

  const [organisationName, setOrganisationName] = useState('')
  const [organisationResults, setOrganisationResults] = useState([])
  const [organisationMessage, setOrganisationMessage] = useState('')
  const [asicDisclaimer, setAsicDisclaimer] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function loadLatestBreaches() {
      try {
        setBreachesLoading(true)
        setBreachesError('')

        const response = await fetch(
          `${API_URL}/api/breaches/latest?limit=3`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error || 'Unable to load breach information'
          )
        }

        setLatestBreaches(data.breaches || [])
      } catch (err) {
        console.log(err)
        setBreachesError(
          'Latest breach information is temporarily unavailable.'
        )
      } finally {
        setBreachesLoading(false)
      }
    }

    async function loadAsicSource() {
      try {
        const response = await fetch(`${API_URL}/api/data-sources`)
        const data = await response.json()

        const asic = data.sources?.find(
          (item) => item.code === 'asic_business_names'
        )

        setAsicSource(asic || null)
      } catch (err) {
        console.log(err)
        setAsicSource(null)
      }
    }

    loadLatestBreaches()
    loadAsicSource()
  }, [])

  async function searchOrganisation(event) {
    event.preventDefault()

    const searchValue = organisationName.trim()
    const abn = searchValue.replace(/\D/g, '')
    const looksLikeAbn = /^[\d\s]+$/.test(searchValue) && abn.length === 11

    if (!looksLikeAbn && searchValue.length < 2) {
      setOrganisationMessage(
        'Please enter at least two characters.'
      )
      setOrganisationResults([])
      return
    }

    try {
      setSearching(true)
      setOrganisationMessage('')
      setOrganisationResults([])

      const url = looksLikeAbn
        ? `${API_URL}/api/organisations/abn/${abn}`
        : `${API_URL}/api/organisations/search?name=${encodeURIComponent(searchValue)}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        setOrganisationMessage(data.error || 'Search failed.')
        return
      }

      const matches = data.matches || []

      setOrganisationResults(matches)
      setAsicDisclaimer(data.disclaimer || '')

      if (matches.length === 0) {
        setOrganisationMessage(
          'No matching organisations found.'
        )
      }
    } catch (err) {
      console.log(err)
      setOrganisationMessage(
        'Organisation search is not available at the moment.'
      )
    } finally {
      setSearching(false)
    }
  }

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

      return `${millions.toFixed(
        millions >= 10 ? 0 : 1
      )} million accounts affected`
    }

    if (number >= 1000) {
      return `${Math.round(number / 1000)}K accounts affected`
    }

    return `${number.toLocaleString(
      'en-AU'
    )} accounts affected`
  }

  function formatSourceUpdate(date) {
    if (!date) {
      return asicSource?.refreshFrequency || 'Updated regularly'
    }

    return `Updated ${formatDate(date)}`
  }

  return (
    <div className="privacy-dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            <span>CA</span>
          </div>

          <span className="dashboard-brand-name">
            Consent Assistant
          </span>
        </div>

        <button
          type="button"
          className="dashboard-back-button"
          onClick={() => navigate('/')}
        >
          <span className="dashboard-back-arrow">←</span>
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
            Stay informed, continue learning and check
            organisations in one place.
          </p>
        </section>

        <section className="dashboard-top-grid">
          <div className="dashboard-main-card breach-summary-card">
            <div className="dashboard-card-heading">
              <p className="dashboard-card-label">
                LATEST DATA BREACHES
              </p>

              <h2>Recent breach updates</h2>

              <p>
                Recently reported data breaches that may affect
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
              latestBreaches.length > 0 && (
                <div className="breach-preview-layout">
                  <div className="breach-featured">
                    <p className="breach-latest-label">
                      LATEST
                    </p>

                    <h3>{latestBreaches[0].title}</h3>

                    <p className="breach-domain">
                      {latestBreaches[0].domain ||
                        'Domain not available'}
                    </p>

                    <strong>
                      {formatAccounts(
                        latestBreaches[0].affectedAccounts
                      )}
                    </strong>

                    <p className="breach-date">
                      Breach date:{' '}
                      {formatDate(
                        latestBreaches[0].breachDate
                      )}
                    </p>
                  </div>

                  <div className="breach-small-list">
                    {latestBreaches
                      .slice(1, 3)
                      .map((breach) => (
                        <div
                          className="breach-small-card"
                          key={breach.name}
                        >
                          <h3>{breach.title}</h3>

                          <p>
                            {breach.domain ||
                              'Domain not available'}
                          </p>

                          <span>
                            {formatAccounts(
                              breach.affectedAccounts
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {!breachesLoading &&
              !breachesError &&
              latestBreaches.length === 0 && (
                <div className="dashboard-loading">
                  No breach records are available.
                </div>
              )}

            <div className="breach-card-footer">
              <span>Source: Have I Been Pwned</span>

              <button
                type="button"
                onClick={() =>
                  navigate('/risk-dashboard/breaches')
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

                <h2>Learning progress</h2>

                <p>
                  Keep building your privacy knowledge.
                </p>
              </div>

              <div className="learning-count">
                2 / 5
              </div>
            </div>

            <div className="dashboard-card-divider"></div>

            <div className="learning-progress-bar">
              <div className="learning-progress-fill"></div>
            </div>

            <p className="learning-progress-text">
              40% complete
            </p>

            <div className="learning-complete-row">
              <div>
                <span>✓</span>
                Data Collection
              </div>

              <div>
                <span>✓</span>
                Purpose of Use
              </div>
            </div>

            <div className="learning-next-row">
              <div>
                <p>NEXT TOPIC</p>
                <strong>Data Sharing</strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate('/privacy-learning/learn')
                }
              >
                Continue learning
                <span>→</span>
              </button>
            </div>
          </div>
        </section>

        <section className="organisation-section">
          <p className="organisation-section-title">
            ORGANISATION CHECK
          </p>

          <div className="dashboard-main-card organisation-card">
            <div className="dashboard-card-heading">
              <p className="dashboard-card-label">
                ASIC ORGANISATION SEARCH
              </p>

              <h2>Check an Australian organisation</h2>

              <p>
                Search ASIC information to check basic
                organisation details.
              </p>
            </div>

            <form
              className="organisation-search-row"
              onSubmit={searchOrganisation}
            >
              <div className="organisation-input-wrap">
                <span className="organisation-search-icon">
                  ○
                </span>

                <input
                  type="text"
                  value={organisationName}
                  onChange={(event) =>
                    setOrganisationName(
                      event.target.value
                    )
                  }
                  placeholder="Search organisation name or ABN..."
                />
              </div>

              <button
                type="submit"
                className="organisation-search-button"
              >
                {searching ? 'Searching...' : 'Search ASIC'}
              </button>

              <div className="organisation-source-box">
                <div>
                  <span>DATA SOURCE</span>
                  <strong>ASIC</strong>
                </div>

                <p>
                  {formatSourceUpdate(
                    asicSource?.lastSuccessfulImport
                  )}
                </p>
              </div>
            </form>

            <div className="organisation-meta">
              <span>Official ASIC data</span>
              <span>•</span>
              <span>
                {asicSource?.lastSuccessfulImport
                  ? `Last successful import: ${formatDate(
                      asicSource.lastSuccessfulImport
                    )}`
                  : asicSource?.refreshFrequency ||
                    'Updated regularly'}
              </span>
            </div>

            {organisationMessage && (
              <p className="organisation-message">
                {organisationMessage}
              </p>
            )}

            {organisationResults.length > 0 && (
              <div className="organisation-results">
                <div className="organisation-results-heading">
                  <h3>Search Results</h3>

                  <span>
                    {organisationResults.length} matches
                  </span>
                </div>

                <div className="organisation-table-wrap">
                  <table className="organisation-table">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>ABN</th>
                        <th>Status</th>
                        <th>Registration Date</th>
                        <th>Cancellation Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {organisationResults.map((item) => (
                        <tr key={item.id}>
                          <td>{item.businessName}</td>

                          <td>
                            {item.abn || 'Not available'}
                          </td>

                          <td>
                            {item.registrationStatus ||
                              'Not available'}
                          </td>

                          <td>
                            {formatDate(
                              item.registrationDate
                            )}
                          </td>

                          <td>
                            {item.cancellationDate
                              ? formatDate(
                                  item.cancellationDate
                                )
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {asicDisclaimer && (
                  <p className="organisation-disclaimer">
                    {asicDisclaimer}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <p className="dashboard-footer-text">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <div className="dashboard-watermark">
        CA
      </div>
    </div>
  )
}

export default Dashboard