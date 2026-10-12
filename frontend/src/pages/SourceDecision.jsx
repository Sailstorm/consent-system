import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Disclosure from '../components/Disclosure'
import NoAnalysis from '../components/NoAnalysis'
import { BackLink, Disclaimer } from '../components/ui'
import { useAnalysis } from '../utils/useAnalysis'
import '../styles/pages/results.css'

const DOES = [
  'Reads only the policy you gave us.',
  'Sorts what it says into the same five questions every time.',
  'Shows you the policy’s own words for each answer, so you can check them.',
]

const DOES_NOT = [
  'Tell you whether to agree to the policy.',
  'Say whether a company is safe or trustworthy.',
  'Give legal advice. For that, speak to a lawyer or a community legal centre.',
]

function SourceDecision() {
  const { policyText, analysisResult, hasResult } = useAnalysis()

  if (!hasResult) {
    return (
      <Layout narrow>
        <NoAnalysis />
      </Layout>
    )
  }

  const isLink = /^https?:\/\//i.test(policyText.trim())

  return (
    <Layout narrow>
      <BackLink to="/explanation" state={{ policyText, analysisResult }}>
        Back to all five answers
      </BackLink>

      <header className="page-head">
        <p className="eyebrow">How this works</p>
        <h1>Where this explanation comes from</h1>
        <p className="lead">
          An AI service read the policy you gave us and wrote the explanation.
          It can make mistakes, so the policy&apos;s own words are always there
          to check.
        </p>
      </header>

      <div className="does-grid">
        <section className="does card" data-reveal>
          <h2>
            <Icon name="check-circle" />
            What Consent Assistant does
          </h2>
          <ul>
            {DOES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="does does--not card" data-reveal style={{ '--i': 1 }}>
          <h2>
            <Icon name="alert-circle" />
            What it doesn&apos;t do
          </h2>
          <ul>
            {DOES_NOT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="detail-section" aria-labelledby="gave-title">
        <h2 id="gave-title">The policy you gave us</h2>
        <p className="muted detail-section__intro">
          {isLink
            ? 'You gave us a link. This is the text we read from that page.'
            : 'This is the full text we read.'}
        </p>

        <Disclosure openLabel="Show the full policy" closeLabel="Hide the full policy">
          <div className="policy-quote policy-quote--long">{policyText}</div>
        </Disclosure>
      </section>

      <section className="decision-box" data-reveal>
        <h2>The decision is yours</h2>
        <p>
          Take your time. It&apos;s fine to ask a family member or friend to
          look at the summary with you before you agree to anything.
        </p>
      </section>

      <Disclaimer />
    </Layout>
  )
}

export default SourceDecision
