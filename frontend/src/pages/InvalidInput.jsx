import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { Disclaimer, Stepper } from '../components/ui'
import { loadDraftPolicy } from '../utils/settings'
import '../styles/pages/check.css'

function InvalidInput() {
  const navigate = useNavigate()

  return (
    <Layout narrow>
      <Stepper current={1} />

      <section className="result-hero result-hero--warn">
        <span className="result-hero__icon">
          <Icon name="question" />
        </span>
        <h1>That&apos;s too short to be a privacy policy</h1>
        <p className="lead">
          We need the full policy to explain it. A privacy policy is usually
          several paragraphs long.
        </p>
      </section>

      <div className="notice">
        <Icon name="info" />
        <div>
          <strong>Where to find the full policy</strong>
          <p>
            Look for a link called &ldquo;Privacy&rdquo; or &ldquo;Privacy
            policy&rdquo;, usually at the very bottom of the company&apos;s
            website. You can also paste that link instead of the words.
          </p>
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: '2rem' }}>
        <button
          type="button"
          className="btn btn--primary btn--large"
          onClick={() =>
            navigate('/privacy-assistant', {
              state: { inputType: 'text', policyText: loadDraftPolicy() },
            })
          }
        >
          <Icon name="edit" />
          Add more text
        </button>

        <button
          type="button"
          className="btn btn--large"
          onClick={() => navigate('/privacy-assistant', { state: { inputType: 'url' } })}
        >
          <Icon name="link" />
          Paste a link instead
        </button>
      </div>

      <Disclaimer />
    </Layout>
  )
}

export default InvalidInput
