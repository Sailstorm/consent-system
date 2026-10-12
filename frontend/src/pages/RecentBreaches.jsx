import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import BreachCard from '../components/BreachCard'
import { BackLink } from '../components/ui'
import { API_URL } from '../utils/breaches'
import '../styles/pages/breaches.css'

const PAGE_SIZE = 10

function RecentBreaches() {
  const [breaches, setBreaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const resultsRef = useRef(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const search = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
        const response = await fetch(
          `${API_URL}/api/breaches/latest?page=${page}&pageSize=${PAGE_SIZE}${search}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load breach information')
        }

        if (active) {
          setBreaches(data.breaches || [])
          setTotalPages(data.totalPages || 0)
          setTotal(data.total || 0)
        }
      } catch (err) {
        console.log(err)

        if (active) {
          setError('We can’t show breach information right now. Please try again later.')
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
  }, [page, searchTerm])

  function search(event) {
    event.preventDefault()
    setPage(1)
    setSearchTerm(searchInput.trim())
  }

  function clearSearch() {
    setSearchInput('')
    setSearchTerm('')
    setPage(1)
  }

  function goTo(nextPage) {
    setPage(nextPage)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    resultsRef.current?.focus({ preventScroll: true })
  }

  return (
    <Layout narrow>
      <BackLink to="/risk-dashboard">Back to data breaches</BackLink>

      <header className="page-head">
        <h1>All reported breaches</h1>
        <p className="lead">
          Search for a company you use to see whether it has reported a
          breach.
        </p>
      </header>

      <form className="breach-search" onSubmit={search} role="search">
        <label className="field-label" htmlFor="breach-search">
          Company name
        </label>
        <div className="breach-search__row">
          <input
            id="breach-search"
            className="input"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="For example: Canva"
            autoComplete="off"
          />
          <button type="submit" className="btn btn--primary btn--large">
            <Icon name="search" />
            Search
          </button>
        </div>
      </form>

      <section
        className="breach-results"
        ref={resultsRef}
        tabIndex={-1}
        aria-labelledby="results-title"
        aria-busy={loading}
      >
        <div className="breach-results__head">
          <h2 id="results-title" className="breach-results__title" aria-live="polite">
            {loading
              ? 'Loading…'
              : searchTerm
                ? `${total.toLocaleString('en-AU')} ${total === 1 ? 'result' : 'results'} for “${searchTerm}”`
                : `${total.toLocaleString('en-AU')} breaches, newest first`}
          </h2>
          {searchTerm && (
            <button type="button" className="btn btn--quiet" onClick={clearSearch}>
              Clear the search
            </button>
          )}
        </div>

        {error && (
          <p className="notice notice--warn">
            <Icon name="alert-circle" />
            {error}
          </p>
        )}

        {loading && (
          <div className="breach-list">
            {[0, 1, 2].map((item) => (
              <div key={item} className="breach breach--skeleton" />
            ))}
          </div>
        )}

        {!loading && !error && breaches.length === 0 && (
          <div className="panel">
            <p>
              <strong>No breaches found{searchTerm ? ` for “${searchTerm}”` : ''}.</strong>
            </p>
            <p className="muted">
              That&apos;s good news, but it only covers breaches that have been
              publicly reported. Check the spelling, or try a shorter name.
            </p>
          </div>
        )}

        {!loading && !error && breaches.length > 0 && (
          <div className="breach-list" key={`${searchTerm}-${page}`}>
            {breaches.map((breach, index) => (
              <BreachCard
                key={`${breach.name}-${breach.addedDate}`}
                breach={breach}
                style={{ '--i': index, animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav className="pagination" aria-label="Pages of results">
            <button
              type="button"
              className="btn btn--large"
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
            >
              <Icon name="arrow-left" />
              Newer
            </button>

            <p className="pagination__where">
              Page <strong>{page}</strong> of {totalPages.toLocaleString('en-AU')}
            </p>

            <button
              type="button"
              className="btn btn--large"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
            >
              Older
              <Icon name="arrow-right" />
            </button>
          </nav>
        )}
      </section>

      <p className="muted small breach-source">
        Breach information comes from Have I Been Pwned (CC BY 4.0).
      </p>
    </Layout>
  )
}

export default RecentBreaches
