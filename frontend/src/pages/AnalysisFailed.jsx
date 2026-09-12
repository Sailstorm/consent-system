import { useLocation, useNavigate } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import ProgressSteps from '../components/ProgressSteps'
import '../styles/analysisFailed.css'

function AnalysisFailed() {
  const navigate = useNavigate()
  const location = useLocation()
  const policyText = location.state?.policyText

  return (
    <PolicyLayout activePage="analysis">
      <section className="failed-heading">
        <p className="failed-label">POLICY ASSISTANT</p>

        <h1>Analysing your privacy information</h1>

        <p>
          We could not complete the analysis this time.
        </p>
      </section>

      <ProgressSteps current={2} />

      <section className="failed-card">
        <div className="failed-icon">!</div>

        <h2>We could not complete the analysis</h2>

        <p className="failed-message">
          The analysis may be temporarily unavailable or the submitted text
          may need to be checked again.
        </p>

        <p className="failed-subtext">
          Your submitted text has not been changed.
        </p>

        <div className="failed-note">
          Please try again, or return to the input page to review your text.
        </div>

        <div className="failed-actions">
          <button
            className="retry-button"
            onClick={() =>
              navigate('/processing', {
                state: { policyText: policyText },
              })
            }
          >
            Retry analysis
          </button>

          <button
            className="back-input-button"
            onClick={() =>
              navigate('/privacy-assistant', {
                state: { policyText: policyText },
              })
            }
          >
            Back to input
          </button>
        </div>
      </section>
    </PolicyLayout>
  )
}

export default AnalysisFailed