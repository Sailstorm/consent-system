import { useEffect, useState } from 'react'
import InfoPage from '../components/InfoPage'
import '../styles/infoPage.css'

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
    <InfoPage
      title="Where the explanations come from"
      intro="See which sources support Consent Assistant and how source information is shown."
      listTitle="What this page covers"
      items={[
        'Which sources are used',
        'How source information is shown',
        'Why official Australian sources are preferred',
      ]}
      advice="Official Australian sources are preferred. Where source details are available, they should stay visible so you can see where information came from."
      actionLabel="Continue"
      actionPath="/privacy-learning"
    >
      <section className="info-extra">
        <h2>Source details</h2>
        <p>
          Read-only information about the Australian data sources connected to
          the project.
        </p>

        {sourcesLoading ? (
          <p>Loading data source details...</p>
        ) : sources.length === 0 ? (
          <p>
            Data source details are unavailable right now. Check that the
            backend API is running.
          </p>
        ) : (
          sources.map((source) => (
            <div className="info-source" key={source.code}>
              <h3>{source.name}</h3>
              {source.agency ? <p>{source.agency}</p> : null}
              <p>Last import: {formatDate(source.lastSuccessfulImport)}</p>
              {source.sourceUrl ? (
                <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                  View original source
                </a>
              ) : null}
            </div>
          ))
        )}
      </section>
    </InfoPage>
  )
}

export default DataSources
