import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../styles/homepage.css'

import backgroundImage from '../assets/home background.jpg'
import logo from '../assets/logo.png'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function Homepage() {
  const navigate = useNavigate()

  const [asicSource, setAsicSource] = useState(null)

  const [organisationName, setOrganisationName] = useState('')
  const [organisationResults, setOrganisationResults] = useState([])
  const [organisationMessage, setOrganisationMessage] = useState('')
  const [asicDisclaimer, setAsicDisclaimer] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
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

    loadAsicSource()
  }, [])

  async function searchOrganisation(event) {
    event.preventDefault()

    const searchValue = organisationName.trim()
    const abn = searchValue.replace(/\D/g, '')

    const looksLikeAbn =
      /^[\d\s]+$/.test(searchValue) && abn.length === 11

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
        : `${API_URL}/api/organisations/search?name=${encodeURIComponent(
            searchValue
          )}`

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        setOrganisationMessage(
          data.error || 'Search failed.'
        )
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

  function formatSourceUpdate(date) {
    if (!date) {
      return (
        asicSource?.refreshFrequency ||
        'Updated regularly'
      )
    }

    return `Updated ${formatDate(date)}`
  }

  return (
    <main
      className="homepage"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
      }}
    >
      <section className="homepage-hero">
        <img
          src={logo}
          alt="Consent Assistant logo"
          className="homepage-logo"
        />

        <h1>CONSENT ASSISTANT</h1>

        <p className="homepage-tagline">
          Privacy policies shouldn’t be difficult to understand.
        </p>

        <p className="homepage-description">
          Consent Assistant helps you understand what a privacy policy
          <br />
          says about your personal information, so you can review it
          <br />
          more easily before making a decision.
        </p>

        <button
          type="button"
          className="homepage-upload-button"
          onClick={() =>
            navigate('/privacy-assistant')
          }
        >
          <span className="homepage-upload-icon">
            <span className="upload-arrow">↑</span>
            <span className="upload-line"></span>
          </span>

          Upload Policy
        </button>

        <p className="homepage-upload-note">
          Upload your privacy policy to get started
        </p>
      </section>

      <section className="homepage-organisation">
        <div className="homepage-organisation-content">
          <h2>
            Check an Australian organisation
          </h2>

          <p className="homepage-organisation-description">
            Search ASIC information to check basic organisation details.
          </p>

          <form
            className="homepage-search-row"
            onSubmit={searchOrganisation}
          >
            <div className="homepage-search-input">
              <span className="homepage-search-icon">
                ⌕
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
              className="homepage-search-button"
              disabled={searching}
            >
              {searching
                ? 'Searching...'
                : 'Search ASIC'}
            </button>

            <div className="homepage-source">
              <div className="homepage-source-main">
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

          <div className="homepage-asic-meta">
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
            <p className="homepage-search-message">
              {organisationMessage}
            </p>
          )}

          {organisationResults.length > 0 && (
            <div className="homepage-results">
              <div className="homepage-results-heading">
                <h3>Search Results</h3>

                <span>
                  {organisationResults.length}{' '}
                  matches
                </span>
              </div>

              <div className="homepage-table-wrap">
                <table className="homepage-table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>ABN</th>
                      <th>Status</th>
                      <th>
                        Registration Date
                      </th>
                      <th>
                        Cancellation Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {organisationResults.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            {item.businessName}
                          </td>

                          <td>
                            {item.abn ||
                              'Not available'}
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
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {asicDisclaimer && (
                <p className="homepage-disclaimer">
                  {asicDisclaimer}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Homepage