import { Link } from 'react-router-dom'
import Layout from './Layout'
import Icon from './Icon'
import Disclosure from './Disclosure'
import NoAnalysis from './NoAnalysis'
import { BackLink, CardLink, Disclaimer, StatusBadge } from './ui'
import { CATEGORIES, describeCategory } from '../utils/categories'
import { useAnalysis, useMarkSeen } from '../utils/useAnalysis'
import '../styles/pages/results.css'

// The detail page for one of the five categories.
function CategoryDetail({ categoryKey }) {
  const { policyText, analysisResult, hasResult } = useAnalysis()
  useMarkSeen(hasResult)

  if (!hasResult) {
    return (
      <Layout narrow>
        <NoAnalysis />
      </Layout>
    )
  }

  const index = CATEGORIES.findIndex((category) => category.key === categoryKey)
  const answer = describeCategory(CATEGORIES[index], analysisResult)
  const previous = CATEGORIES[index - 1]
  const next = CATEGORIES[index + 1]
  const navState = { policyText, analysisResult }

  return (
    <Layout narrow>
      <BackLink to="/explanation" state={navState}>
        Back to all five answers
      </BackLink>

      <header className="detail-head">
        <span className="icon-tile icon-tile--large">
          <Icon name={answer.icon} />
        </span>
        <div>
          <p className="eyebrow">{answer.title}</p>
          <h1>{answer.question}</h1>
        </div>
      </header>

      <div className="detail-status">
        <StatusBadge status={answer.status} />
        <span className="muted">
          The policy answers {answer.found} of the {answer.points.length} things
          we look for.
        </span>
      </div>

      <section className="in-short" aria-labelledby="in-short-title">
        <h2 id="in-short-title">In short</h2>
        <p>
          {answer.summary || 'The policy doesn’t give a clear answer to this question.'}
        </p>
      </section>

      <section aria-labelledby="details-title" className="detail-section">
        <h2 id="details-title">The details</h2>
        <p className="muted detail-section__intro">{answer.subtitle}</p>

        <dl className="points">
          {answer.points.map((point, pointIndex) => (
            <div
              key={point.field}
              className={`point${point.text ? '' : ' point--missing'}`}
              data-reveal
              style={{ '--i': pointIndex % 3 }}
            >
              <dt>
                <Icon name={point.text ? 'check-circle' : 'alert-circle'} />
                {point.heading}
              </dt>
              <dd>{point.text || 'The policy doesn’t say.'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="own-words-title" className="detail-section">
        <h2 id="own-words-title">What the policy itself says</h2>
        <p className="muted detail-section__intro">
          The parts of the policy we based this answer on, word for word.
        </p>

        {answer.evidence.length > 0 ? (
          <Disclosure
            openLabel={`Show the policy’s own words (${answer.evidence.length} ${answer.evidence.length === 1 ? 'passage' : 'passages'})`}
            closeLabel="Hide the policy’s own words"
          >
            <div className="quotes">
              {answer.evidence.map((quote, quoteIndex) => (
                <blockquote key={quoteIndex} className="policy-quote">
                  {quote}
                </blockquote>
              ))}
            </div>
          </Disclosure>
        ) : (
          <p className="panel">We couldn&apos;t find any passages about this in the policy.</p>
        )}
      </section>

      <CardLink
        to={`/privacy-learning/learn/${answer.learnSlug}`}
        className="learn-link"
        cta={`Read the lesson on ${answer.title.toLowerCase()}`}
      >
        <div className="learn-link__body">
          <span className="icon-tile">
            <Icon name="book" />
          </span>
          <div>
            <h2>New to this topic?</h2>
            <p className="muted">A short lesson explains it with everyday examples.</p>
          </div>
        </div>
      </CardLink>

      <nav className="pager" aria-label="Other answers">
        {previous ? (
          <Link to={previous.path} state={navState} className="pager__link">
            <Icon name="arrow-left" />
            <span>
              <small>Previous answer</small>
              {previous.question}
            </span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link to={next.path} state={navState} className="pager__link pager__link--next">
            <span>
              <small>Next answer</small>
              {next.question}
            </span>
            <Icon name="arrow-right" />
          </Link>
        ) : (
          <Link to="/consent-summary" state={navState} className="pager__link pager__link--next">
            <span>
              <small>Next step</small>
              See your one-page summary
            </span>
            <Icon name="arrow-right" />
          </Link>
        )}
      </nav>

      <Disclaimer />
    </Layout>
  )
}

export default CategoryDetail
