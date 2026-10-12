import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { Disclaimer, Stepper } from '../components/ui'
import '../styles/pages/check.css'

const REASONS = {
  url: [
    'The website may block automatic reading, or the link may need you to sign in.',
    'Try copying the words of the policy and pasting them instead.',
  ],
  pdf: [
    'The PDF may be a scanned picture of text, which we can’t read.',
    'Try copying the words of the policy and pasting them instead.',
  ],
  text: [
    'Our service may be busy right now.',
    'Waiting a minute and trying again usually works.',
  ],
}

function AnalysisFailed() {
  const navigate = useNavigate()
  const location = useLocation()

  const inputType = location.state?.inputType || 'text'
  const policyText = location.state?.policyText || ''
  const policyUrl = location.state?.policyUrl || ''
  const pdfFile = location.state?.pdfFile || null

  const canRetry =
    (inputType === 'text' && policyText) ||
    (inputType === 'url' && policyUrl) ||
    (inputType === 'pdf' && pdfFile)

  function retry() {
    navigate('/processing', {
      state: { inputType, policyText, policyUrl, pdfFile },
    })
  }

  function editInput() {
    navigate('/privacy-assistant', {
      state: {
        inputType: inputType === 'pdf' ? 'pdf' : inputType,
        policyText,
        policyUrl,
      },
    })
  }

  return (
    <Layout narrow>
      <Stepper current={1} />

      <section className="result-hero result-hero--error">
        <span className="result-hero__icon">
          <Icon name="alert-circle" />
        </span>
        <h1>We couldn&apos;t read this policy</h1>
        <p className="lead">
          Nothing is wrong on your side. Here&apos;s what may have happened and
          what to try.
        </p>
      </section>

      <ul className="reason-list">
        {(REASONS[inputType] || REASONS.text).map((reason) => (
          <li key={reason}>
            <Icon name="info" />
            {reason}
          </li>
        ))}
      </ul>

      <div className="btn-row">
        {canRetry && (
          <button type="button" className="btn btn--primary btn--large" onClick={retry}>
            <Icon name="refresh" />
            Try again
          </button>
        )}

        <button type="button" className="btn btn--large" onClick={editInput}>
          <Icon name="edit" />
          Change the policy
        </button>
      </div>

      <div className="also-card">
        <h2>Or do something else for now</h2>
        <ul>
          <li>
            <Link to="/privacy-learning">Read a short lesson about privacy</Link>
          </li>
          <li>
            <Link to="/risk-dashboard">See recent data breaches</Link>
          </li>
        </ul>
      </div>

      <Disclaimer />
    </Layout>
  )
}

export default AnalysisFailed
