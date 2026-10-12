import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Disclosure from '../components/Disclosure'
import NoAnalysis from '../components/NoAnalysis'
import { BackLink, Disclaimer, StatusBadge, Stepper } from '../components/ui'
import { clearAnalysisState } from '../utils/analysisState'
import { CATEGORIES, describeCategory } from '../utils/categories'
import { useAnalysis, useMarkSeen } from '../utils/useAnalysis'
import '../styles/pages/results.css'

const ASK_YOURSELF = [
  'Am I comfortable with the information they collect?',
  'Am I happy for it to go to the other companies they name?',
  'Is the time they keep it reasonable for what I’m using?',
  'Do I know how to change my mind later?',
]

function ConsentSummary() {
  const navigate = useNavigate()
  const { policyText, analysisResult, hasResult } = useAnalysis()
  useMarkSeen(hasResult)

  if (!hasResult) {
    return (
      <Layout narrow>
        <NoAnalysis />
      </Layout>
    )
  }

  const answers = CATEGORIES.map((category) => describeCategory(category, analysisResult))
  const today = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function checkAnother() {
    clearAnalysisState()
    navigate('/privacy-assistant')
  }

  // Security plan F-07: lets someone on a shared computer remove the policy
  // and its explanation from this tab straight away.
  function removePolicy() {
    clearAnalysisState()
    navigate('/privacy-assistant', { replace: true })
  }

  return (
    <Layout narrow>
      <BackLink to="/explanation" state={{ policyText, analysisResult }}>
        Back to all five answers
      </BackLink>

      <Stepper current={3} />

      <header className="page-head summary-head">
        <div>
          <p className="eyebrow">Your summary</p>
          <h1>This policy on one page</h1>
          <p className="lead">
            Print it, or keep it open while you decide.
          </p>
        </div>

        <button type="button" className="btn no-print" onClick={() => window.print()}>
          <Icon name="print" />
          Print this summary
        </button>
      </header>

      <article className="sheet" aria-label="Policy summary">
        <p className="sheet__meta">
          <Icon name="calendar" />
          Checked on {today} with Consent Assistant
        </p>

        <ol className="sheet__rows">
          {answers.map((answer, index) => (
            <li key={answer.key} className="sheet__row" data-reveal style={{ '--i': index }}>
              <div className="sheet__label">
                <span className="icon-tile">
                  <Icon name={answer.icon} />
                </span>
                <h2>{answer.summaryTitle}</h2>
              </div>
              <div className="sheet__body">
                <StatusBadge status={answer.status} />
                <p>{answer.summary || 'The policy doesn’t give a clear answer.'}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <section className="decision-box" data-reveal>
        <h2>Only you can decide</h2>
        <p>
          This summary helps you understand the policy. It doesn&apos;t tell
          you whether to agree. Some questions you might ask yourself:
        </p>
        <ul>
          {ASK_YOURSELF.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section no-print" aria-labelledby="original-title">
        <h2 id="original-title">The policy you gave us</h2>
        <p className="muted detail-section__intro">
          Compare the summary with the policy&apos;s own words at any time.
        </p>
        <Disclosure openLabel="Show the full policy" closeLabel="Hide the full policy">
          <div className="policy-quote policy-quote--long">{policyText}</div>
        </Disclosure>
      </section>

      <section className="finish no-print" aria-labelledby="finish-title">
        <h2 id="finish-title">When you&apos;ve finished</h2>
        <div className="btn-row">
          <button type="button" className="btn btn--primary btn--large" onClick={checkAnother}>
            Check another policy
            <Icon name="arrow-right" />
          </button>
          <button type="button" className="btn btn--large" onClick={removePolicy}>
            <Icon name="trash" />
            Remove this policy from this browser
          </button>
        </div>
        <p className="muted small finish__note">
          Using a shared or library computer? Remove the policy when
          you&apos;re done. It is also removed when you close this tab.
        </p>
      </section>

      <Disclaimer />
    </Layout>
  )
}

export default ConsentSummary
