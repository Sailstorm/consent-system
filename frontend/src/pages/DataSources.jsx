import { useEffect, useState } from 'react'
import GlobalHeader from '../components/GlobalHeader'
import GlobalFooter from '../components/GlobalFooter'
import '../styles/dataSources.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function formatDate(value) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DataSources() {
  const [sources, setSources] = useState([])
  const [sourcesLoading, setSourcesLoading] = useState(true)

  useEffect(() => {
    async function loadSources() {
      try {
        const response = await fetch(`${API_URL}/api/data-sources`)
        const data = await response.json()

        setSources(data.sources || [])
      } catch {
        setSources([])
      } finally {
        setSourcesLoading(false)
      }
    }

    loadSources()
  }, [])

  return (
    <div className="data-sources-page">
      <GlobalHeader />

      <main className="data-sources-content">
        <section className="data-sources-heading">
          <p className="data-sources-label">DATA SOURCES</p>

          <h1>Data Sources</h1>

          <p>
            See where information used by Consent Assistant comes from and how
            source information is presented.
          </p>
        </section>

        <section className="data-sources-grid">
          <div className="data-source-card">
            <h2>User-provided policy</h2>

            <p>
              Privacy Policy Analysis uses the policy or privacy notice that
              you choose to submit.
            </p>

            <span className="source-status active">
              Current feature
            </span>
          </div>

          <div className="data-source-card">
            <h2>OAIC</h2>

            <p>
              Office of the Australian Information Commissioner data can
              support future privacy and data breach insights.
            </p>

            <span className="source-status">
              Planned for Iteration 3
            </span>
          </div>

          <div className="data-source-card">
            <h2>ASIC</h2>

            <p>
              Australian Securities and Investments Commission data can
              support future organisation information and risk exploration.
            </p>

            <span className="source-status">
              Planned for Iteration 3
            </span>
          </div>

          <div className="data-source-card">
            <h2>Source transparency</h2>

            <p>
              Where source information is available, the system aims to show
              users where the information came from.
            </p>

            <span className="source-status active">
              Transparency
            </span>
          </div>
        </section>

        <section className="source-details-section">
          <div className="source-details-heading">
            <h2>Source details</h2>

            <p>
              Read-only information about the Australian data sources connected
              to the project.
            </p>
          </div>

          {sourcesLoading ? (
            <div className="source-message">
              Loading data source details...
            </div>
          ) : sources.length === 0 ? (
            <div className="source-message">
              Data source details are unavailable right now. Check that the
              backend API is running.
            </div>
          ) : (
            <div className="source-detail-list">
              {sources.map((source) => (
                <div className="source-detail-item" key={source.code}>
                  <div className="source-detail-title">
                    <h3>{source.name}</h3>
                    <span>{source.agency}</span>
                  </div>

                  <div className="source-detail-info">
                    <p>
                      <strong>Refresh frequency:</strong>{' '}
                      {source.refreshFrequency || 'Not set'}
                    </p>

                    <p>
                      <strong>Last successful import:</strong>{' '}
                      {formatDate(source.lastSuccessfulImport)}
                    </p>

                    <p>
                      <strong>Licence:</strong>{' '}
                      {source.licence || 'Not specified'}
                    </p>
                  </div>

                  {source.sourceUrl && (
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View original source →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="data-responsibility">
          <h2>How we use data responsibly</h2>

          <div className="responsibility-grid">
            <div>
              <strong>Clear purpose</strong>
              <p>
                Each source should support a specific system function.
              </p>
            </div>

            <div>
              <strong>Trusted sources</strong>
              <p>
                Australian government and official sources are preferred.
              </p>
            </div>

            <div>
              <strong>Transparent use</strong>
              <p>
                Source information should be visible where it helps users.
              </p>
            </div>
          </div>
        </section>

        <p className="data-sources-note">
          OAIC and ASIC risk dashboard features are planned for Iteration 3
          and are not part of the current user interface.
        </p>
      </main>

      <GlobalFooter />
    </div>
  )
}

export default DataSources