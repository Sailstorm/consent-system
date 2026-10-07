import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import '../styles/recentBreaches.css'

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000'

const PAGE_SIZE = 10

function RecentBreaches() {
  const navigate = useNavigate()

  const [breaches, setBreaches] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [totalPages, setTotalPages] = useState(0)
  const [totalBreaches, setTotalBreaches] = useState(0)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadBreaches() {
      try {
        setLoading(true)
        setError('')

        const searchQuery = searchTerm
          ? `&search=${encodeURIComponent(searchTerm)}`
          : ''

        const response = await fetch(
          `${API_URL}/api/breaches/latest?page=${currentPage}&pageSize=${PAGE_SIZE}${searchQuery}`,
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Unable to load breach information',
          )
        }

        setBreaches(data.breaches || [])
        setSource(data.source || null)

        const returnedPage = data.page || 1

        setCurrentPage(returnedPage)
        setPageInput(String(returnedPage))
        setTotalPages(data.totalPages || 0)
        setTotalBreaches(data.total || 0)
      } catch (err) {
        console.log(err)

        setError(
          'Latest breach information is temporarily unavailable.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadBreaches()
  }, [currentPage, searchTerm])

  function formatDate(date) {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleDateString(
      'en-AU',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
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
    if (
      !Array.isArray(dataClasses) ||
      dataClasses.length === 0
    ) {
      return 'Not specified'
    }

    return dataClasses.join(' · ')
  }

  function handleSearch(event) {
    event.preventDefault()

    setCurrentPage(1)
    setPageInput('1')
    setSearchTerm(searchInput.trim())
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  function goToPage(event) {
    event.preventDefault()

    const page = Number.parseInt(pageInput, 10)

    if (!Number.isInteger(page)) {
      setPageInput(String(currentPage))
      return
    }

    if (page < 1) {
      setCurrentPage(1)
      setPageInput('1')
      return
    }

    if (page > totalPages) {
      setCurrentPage(totalPages)
      setPageInput(String(totalPages))
      return
    }

    setCurrentPage(page)
  }

  function goBack() {
    navigate('/risk-dashboard')
  }

  return (
    <div className="recent-breaches-page">
      <PageHeader />

      <div className="recent-breaches-back-row">
        <button
          type="button"
          className="recent-breaches-page-back"
          onClick={goBack}
        >
          ← Back to dashboard
        </button>
      </div>

      <main className="recent-breaches-main">
        <section className="recent-breaches-heading">
          <p>PRIVACY AWARENESS</p>

          <h1>Recent data breaches</h1>

          <span>
            See recently reported data breaches
            and what information may have been
            exposed.
          </span>
        </section>

        <section className="recent-breaches-card">
          <div className="recent-breaches-card-top">
            <div className="recent-breaches-card-heading">
              <p className="recent-breaches-label">
                LATEST BREACHES
              </p>

              <h2>
                Recently reported breaches
              </h2>

              <span>
                The latest verified breach
                records available from our data
                source.
              </span>

              <form
                className="recent-breaches-search"
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Enter company name"
                  aria-label="Search company"
                />

                <button type="submit">
                  Search
                </button>
              </form>
            </div>

            <div className="recent-breaches-source">
              <div>
                <span>Source:</span>

                <strong>
                  {source?.name ||
                    'Have I Been Pwned'}
                </strong>
              </div>

              <p>
                {searchTerm
                  ? `${totalBreaches} matching records`
                  : totalBreaches > 0
                    ? `${totalBreaches} records available`
                    : 'Breach records'}
              </p>
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

          {!loading &&
            !error &&
            breaches.length === 0 && (
              <div className="recent-breaches-message">
                {searchTerm
                  ? `No breach records were found for "${searchTerm}".`
                  : 'No breach records are available.'}
              </div>
            )}

          {!loading &&
            !error &&
            breaches.length > 0 && (
              <>
                <div className="recent-breaches-list">
                  {breaches.map((breach) => (
                    <article
                      className="recent-breach-row"
                      key={`${breach.name}-${breach.addedDate}`}
                    >
                      <div className="recent-breach-name">
                        <h3>{breach.title}</h3>

                        <p>
                          {breach.domain ||
                            'Domain not available'}
                        </p>
                      </div>

                      <div className="recent-breach-detail">
                        <span>
                          ACCOUNTS AFFECTED
                        </span>

                        <strong>
                          {formatAccounts(
                            breach.affectedAccounts,
                          )}
                        </strong>
                      </div>

                      <div className="recent-breach-detail">
                        <span>BREACH DATE</span>

                        <strong>
                          {formatDate(
                            breach.breachDate,
                          )}
                        </strong>
                      </div>

                      <div className="recent-breach-detail recent-breach-data">
                        <span>DATA EXPOSED</span>

                        <strong>
                          {formatDataClasses(
                            breach.dataClasses,
                          )}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="recent-breaches-pagination">
                  <button
                    type="button"
                    className="recent-breaches-page-button"
                    onClick={goToPreviousPage}
                    disabled={currentPage <= 1}
                  >
                    ← Previous
                  </button>

                  <form
                    className="recent-breaches-page-info"
                    onSubmit={goToPage}
                  >
                    <span>Page</span>

                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={(event) =>
                        setPageInput(event.target.value)
                      }
                      aria-label="Page number"
                    />

                    <span>
                      of {totalPages}
                    </span>
                  </form>

                  <button
                    type="button"
                    className="recent-breaches-page-button"
                    onClick={goToNextPage}
                    disabled={
                      currentPage >= totalPages
                    }
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
        </section>

        <p className="recent-breaches-scroll-note">
          Showing up to {PAGE_SIZE} breach records
          per page.
        </p>

        <p className="recent-breaches-footer">
          Consent Assistant provides information
          to support your review. It does not
          provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="recent-breaches-watermark"
      />
    </div>
  )
}

export default RecentBreaches