import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import NoAnalysis from '../components/NoAnalysis'
import { CardLink, Disclaimer, StatusBadge, Stepper } from '../components/ui'
import { CATEGORIES, describeCategory, STATUS } from '../utils/categories'
import { useAnalysis, useMarkSeen } from '../utils/useAnalysis'
import '../styles/pages/results.css'

function Explanation() {
  const { policyText, analysisResult, hasResult } = useAnalysis()
  useMarkSeen(hasResult)

  if (!hasResult) {
    return (
      <Layout narrow>
        <NoAnalysis />
      </Layout>
    )
  }

  const navState = { policyText, analysisResult }
  const answers = CATEGORIES.map((category) => describeCategory(category, analysisResult))

  return (
    <Layout narrow>
      <Stepper current={2} />

      <header className="page-head">
        <p className="eyebrow">Your policy, explained</p>
        <h1>Here&apos;s what this policy says</h1>
        <p className="lead">
          Five plain answers about your personal information. Open any answer
          to read more and see the policy&apos;s own words.
        </p>
      </header>

      <nav className="glance" aria-label="The five answers at a glance">
        {answers.map((answer, index) => (
          <a
            key={answer.key}
            href={`#answer-${answer.key}`}
            className={`glance__item glance__item--${answer.status}`}
            style={{ '--i': index }}
          >
            <span className="glance__icon">
              <Icon name={answer.icon} />
            </span>
            <span className="glance__q">{answer.question}</span>
            <span className="glance__status">
              <Icon name={STATUS[answer.status].icon} />
              {STATUS[answer.status].label}
            </span>
          </a>
        ))}
      </nav>

      <div className="notice status-key">
        <Icon name="info" />
        <p>
          <strong>About these labels</strong>
          They show how clearly the policy explains each point. They don&apos;t
          say whether the policy is good or bad. That decision is yours.
        </p>
      </div>

      <div className="answers">
        {answers.map((answer) => (
          <article
            key={answer.key}
            id={`answer-${answer.key}`}
            className="answer card"
            data-reveal
          >
            <header className="answer__head">
              <span className="icon-tile">
                <Icon name={answer.icon} />
              </span>
              <div className="answer__titles">
                <p className="answer__topic">{answer.title}</p>
                <h2>{answer.question}</h2>
              </div>
              <StatusBadge status={answer.status} />
            </header>

            <p className="answer__summary">
              {answer.summary || 'The policy doesn’t give a clear answer to this question.'}
            </p>

            <div className="answer__foot">
              <span className="answer__count muted">
                Answers {answer.found} of {answer.points.length} things we look for
              </span>
              <CardLinkInline to={answer.path} state={navState}>
                Read more about {answer.title.toLowerCase()}
              </CardLinkInline>
            </div>
          </article>
        ))}
      </div>

      <CardLink to="/source-decision" state={navState} className="source-link" cta="Read how this works">
        <div className="source-link__body">
          <span className="icon-tile">
            <Icon name="question" />
          </span>
          <div>
            <h2>Where does this explanation come from?</h2>
            <p className="muted">
              How we read the policy, what we can and can&apos;t do, and the
              full text you gave us.
            </p>
          </div>
        </div>
      </CardLink>

      <section className="next-step" data-reveal>
        <div>
          <h2>Next: your one-page summary</h2>
          <p className="muted">
            All five answers on one page, ready to print or keep open while you
            decide.
          </p>
        </div>
        <CardLinkButton to="/consent-summary" state={navState}>
          See my summary
        </CardLinkButton>
      </section>

      <Disclaimer />
    </Layout>
  )
}

// Links that carry the analysis along in navigation state.
function CardLinkInline({ to, state, children }) {
  return (
    <Link to={to} state={state} className="answer__more">
      {children}
      <Icon name="arrow-right" />
    </Link>
  )
}

function CardLinkButton({ to, state, children }) {
  return (
    <Link to={to} state={state} className="btn btn--primary btn--large">
      {children}
      <Icon name="arrow-right" />
    </Link>
  )
}

export default Explanation
