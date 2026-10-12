import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import AnalysisDock from './AnalysisDock'

// Adds `is-visible` to [data-reveal] elements as they scroll into view,
// including ones that appear later (for example after data loads).
function useScrollReveal(rootRef, pathname) {
  useEffect(() => {
    const root = rootRef.current

    if (!root || !('IntersectionObserver' in window)) {
      return undefined
    }

    document.documentElement.classList.add('js-reveal')

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            intersection.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )

    function watch() {
      root
        .querySelectorAll('[data-reveal]:not(.is-visible)')
        .forEach((element) => intersection.observe(element))
    }

    watch()

    const mutation = new MutationObserver(watch)
    mutation.observe(root, { childList: true, subtree: true })

    return () => {
      intersection.disconnect()
      mutation.disconnect()
    }
  }, [rootRef, pathname])
}

// Each page renders its own Layout, so the last page seen is kept here.
let lastPathname = null

function Layout({ children, narrow = false }) {
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  // On each new page: start at the top and move keyboard and screen
  // reader focus to the new content (not on the first page load).
  useEffect(() => {
    if (lastPathname !== null && lastPathname !== pathname) {
      window.scrollTo(0, 0)
      mainRef.current?.focus({ preventScroll: true })
    }

    lastPathname = pathname
  }, [pathname])

  useScrollReveal(mainRef, pathname)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader />

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        key={pathname}
        className={`page page-enter${narrow ? ' page--narrow' : ''}`}
      >
        {children}
      </main>

      <SiteFooter />

      <AnalysisDock />
    </>
  )
}

export default Layout
