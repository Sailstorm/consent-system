import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import '../styles/overview.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Overview() {
  const [overview, setOverview] = useState(null)
  const [sectors, setSectors] = useState([])
  const [sectorNote, setSectorNote] = useState('')
  const [trend, setTrend] = useState(null)
  const [oaicSource, setOaicSource] = useState(null)
  const [asicSource, setAsicSource] = useState(null)
  const [peopleAffected, setPeopleAffected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [organisationName, setOrganisationName] = useState('')
  const [organisationResults, setOrganisationResults] = useState([])
  const [organisationMessage, setOrganisationMessage] = useState('')
  const [asicDisclaimer, setAsicDisclaimer] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const overviewRes = await fetch(`${API_URL}/api/ndb/overview`)
        const overviewData = await overviewRes.json()
        setOverview(overviewData)

        const sectorRes = await fetch(`${API_URL}/api/ndb/sectors`)
        const sectorData = await sectorRes.json()
        setSectors(sectorData.sectors || [])
        setSectorNote(sectorData.note || '')

        const trendRes = await fetch(`${API_URL}/api/ndb/trends`)
        const trendData = await trendRes.json()
        setTrend(trendData)

        const sourceRes = await fetch(`${API_URL}/api/data-sources`)
        const sourceData = await sourceRes.json()

        const oaic = sourceData.sources.find(
          (item) => item.code === 'oaic_ndb'
        )

        const asic = sourceData.sources.find(
          (item) => item.code === 'asic_business_names'
        )

        setOaicSource(oaic)
        setAsicSource(asic)

        const peopleRes = await fetch(`${API_URL}/api/ndb/people-affected`)
        const peopleData = await peopleRes.json()
        setPeopleAffected(peopleData)
      } catch (err) {
        console.log(err)
        setError(true)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  async function searchOrganisation(event) {
    event.preventDefault()

    const name = organisationName.trim()

    if (name.length < 2) {
      setOrganisationMessage('Please enter at least two characters.')
      setOrganisationResults([])
      return
    }

    try {
      setSearching(true)
      setOrganisationMessage('')
      setOrganisationResults([])

      const response = await fetch(
        `${API_URL}/api/organisations/search?name=${encodeURIComponent(name)}`
      )

      const data = await response.json()

      if (!response.ok) {
        setOrganisationMessage(data.error || 'Search failed.')
        return
      }

      setOrganisationResults(data.matches || [])
      setAsicDisclaimer(data.disclaimer || '')

      if (data.matches.length === 0) {
        setOrganisationMessage('No matching organisations found.')
      }
    } catch (err) {
      console.log(err)
      setOrganisationMessage('Organisation search is not available at the moment.')
    } finally {
      setSearching(false)
    }
  }

  function formatMonth(date) {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-AU', {
      month: 'long',
      year: 'numeric',
    })
  }

  function formatDate(date) {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="overview-page">
      <Sidebar activePage="overview" />

      <main className="overview-content">
        <div className="overview-top">
          <div>
            <h1>Your Privacy Hub</h1>
            <p>
              A simple place to understand privacy information, build AI awareness
              and explore digital risk.
            </p>
          </div>

          <div className="top-actions">
            <input
              type="text"
              className="search-box"
              placeholder="Search here"
            />

            <div className="user-chip">
              <span className="user-dot"></span>
              <span>Margaret</span>
            </div>
          </div>
        </div>

        <section className="feature-row">
          <div className="feature-card">
            <p className="feature-label">Privacy Assistant</p>
            <h3>Understand a Privacy Policy</h3>
            <p>
              Paste privacy text and get a clear, structured explanation.
            </p>
          </div>

          <div className="feature-card">
            <p className="feature-label">Learning</p>
            <h3>Learn Through Scenarios</h3>
            <p>
              Build privacy and AI awareness through short interactive activities.
            </p>
          </div>

          <div className="feature-card">
            <p className="feature-label">Explore</p>
            <h3>Explore Digital Risk</h3>
            <p>
              Use Australian privacy and consumer safety data to understand risk.
            </p>
          </div>
        </section>

        <section className="today-section">
          <h2>Today's Overview</h2>

          <div className="overview-grid">
            <div className="panel recent-panel">
              <div className="panel-title-row">
                <div>
                  <h3>Recent Privacy Summary</h3>
                  <p>Summary of your latest policy analysis</p>
                </div>

                <button className="small-button">
                  View full summary
                </button>
              </div>

              <div className="summary-list">
                <div>
                  <span>Data Collection</span>
                  <strong>Basic details only</strong>
                </div>

                <div>
                  <span>Purpose of Use</span>
                  <strong>Service + analytics</strong>
                </div>

                <div>
                  <span>Data Sharing</span>
                  <strong>Some partners</strong>
                </div>

                <div>
                  <span>Data Retention</span>
                  <strong>Not clearly stated</strong>
                </div>

                <div>
                  <span>User Control</span>
                  <strong>Some user rights</strong>
                </div>
              </div>
            </div>

            <div className="panel progress-panel">
              <h3>Learning Progress</h3>
              <p>Current level and learning status</p>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>

              <div className="progress-list">
                <div>
                  <span>Personal Data</span>
                  <strong>Complete</strong>
                </div>

                <div>
                  <span>Third-Party Sharing</span>
                  <strong>In progress</strong>
                </div>

                <div>
                  <span>AI & Personal Data</span>
                  <strong>Next</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <h2>OAIC Data Breach Dashboard</h2>

          {loading && (
            <div className="dashboard-message">
              Loading OAIC data...
            </div>
          )}

          {error && (
            <div className="dashboard-message">
              Data is not available at the moment.
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <span>Reported Notifications</span>
                  <strong>{overview?.reportedNotifications || 0}</strong>
                  <p>
                    Eligible breach notifications reported to the OAIC.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>Reporting Period</span>
                  <strong>
                    {formatMonth(overview?.periodStart)} -{' '}
                    {formatMonth(overview?.periodEnd)}
                  </strong>
                  <p>
                    Current reporting period in the OAIC dataset.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>People Affected</span>
                  <strong>Worldwide</strong>
                  <p>
                    Affected people may be located worldwide.
                  </p>
                </div>

                <div className="dashboard-card">
                  <span>Trend</span>
                  <strong>
                    {trend?.trendAvailable ? 'Available' : 'Snapshot only'}
                  </strong>
                  <p>
                    {trend?.trendAvailable
                      ? 'More than one reporting period is available.'
                      : 'There is not enough data to show a trend yet.'}
                  </p>
                </div>
              </div>

              <div className="dashboard-bottom">
                <div className="panel sector-panel">
                  <h3>Top Five Sectors</h3>
                  <p>
                    Sectors with the highest number of reported notifications.
                  </p>

                  <div className="sector-list">
                    {sectors.map((item) => (
                      <div className="sector-item" key={item.sector}>
                        <div className="sector-name">
                          <span>{item.sector}</span>
                          <strong>{item.notifications}</strong>
                        </div>

                        <div className="sector-bar">
                          <div
                            className="sector-fill"
                            style={{
                              width: sectors[0]
                                ? `${(item.notifications / sectors[0].notifications) * 100}%`
                                : '0%',
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="data-note">
                    {sectorNote}
                  </p>
                </div>

                <div className="panel source-panel">
                  <h3>Source Information</h3>
                  <p>
                    Information about the data used in this dashboard.
                  </p>

                  <div className="source-list">
                    <div>
                      <span>Source</span>
                      <strong>
                        {oaicSource?.name || 'Not available'}
                      </strong>
                    </div>

                    <div>
                      <span>Agency</span>
                      <strong>
                        {oaicSource?.agency || 'Not available'}
                      </strong>
                    </div>

                    <div>
                      <span>Source updated</span>
                      <strong>
                        {formatDate(overview?.sourceUpdatedAt)}
                      </strong>
                    </div>

                    <div>
                      <span>Refresh frequency</span>
                      <strong>
                        {oaicSource?.refreshFrequency || 'Not available'}
                      </strong>
                    </div>

                    {oaicSource?.sourceUrl && (
                      <div>
                        <span>Dataset</span>
                        <a
                          href={oaicSource.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View official source
                        </a>
                      </div>
                    )}
                  </div>

                  {!trend?.trendAvailable && (
                    <div className="trend-message">
                      <strong>No trend chart shown</strong>
                      <p>{trend?.note}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-disclaimer">
                <p>{overview?.note}</p>
                <p>{peopleAffected?.note}</p>
              </div>
            </>
          )}
        </section>

        <section className="asic-section">
          <h2>ASIC Organisation Check</h2>

          <div className="asic-box">
            <div>
              <h3>Search Australian Business Names</h3>
              <p>
                Check registration information from the ASIC Business Names Dataset.
              </p>
            </div>

            <form className="asic-search" onSubmit={searchOrganisation}>
              <input
                type="text"
                value={organisationName}
                onChange={(event) => setOrganisationName(event.target.value)}
                placeholder="Enter organisation name"
              />

              <button type="submit">
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {organisationMessage && (
              <p className="asic-message">
                {organisationMessage}
              </p>
            )}

            {organisationResults.length > 0 && (
              <div className="asic-results">
                <div className="asic-results-title">
                  <h3>Search Results</h3>
                  <span>{organisationResults.length} matches</span>
                </div>

                <div className="asic-table-wrap">
                  <table className="asic-table">
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
                          <td>{item.abn || 'Not available'}</td>
                          <td>{item.registrationStatus || 'Not available'}</td>
                          <td>{formatDate(item.registrationDate)}</td>
                          <td>
                            {item.cancellationDate
                              ? formatDate(item.cancellationDate)
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {asicDisclaimer && (
                  <p className="asic-disclaimer">
                    {asicDisclaimer}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="asic-source">
            <span>Source</span>
            <strong>
              {asicSource?.name || 'ASIC Business Names Dataset'}
            </strong>

            <span>Agency</span>
            <strong>
              {asicSource?.agency ||
                'Australian Securities and Investments Commission'}
            </strong>

            <span>Refresh frequency</span>
            <strong>
              {asicSource?.refreshFrequency || 'Not available'}
            </strong>

            {asicSource?.sourceUrl && (
              <a
                href={asicSource.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                View official source
              </a>
            )}
          </div>
        </section>

        <p className="overview-footer">
          Privacy information is provided to support understanding and does not
          make decisions for you.
        </p>
      </main>
    </div>
  )
}

export default Overview