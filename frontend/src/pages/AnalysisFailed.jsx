import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/analysisFailed.css'

function AnalysisFailed() {
  const navigate = useNavigate()

  return (
    <div className="failed-page">
      <Sidebar activePage="assistant" />

      <main className="failed-content">
        <div className="failed-heading">
          <h1>Analysing your privacy information</h1>
          <p>
            We could not complete the analysis this time.
          </p>
        </div>

        <div className="failed-steps">
          <div className="step">1 Input</div>
          <div className="step active">2 Explanation</div>
          <div className="step">3 Consent Summary</div>
        </div>

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
        </section>

        <div className="failed-actions">
          <button
            className="retry-button"
            onClick={() => navigate('/processing')}
          >
            Retry analysis
          </button>

          <button
            className="back-input-button"
            onClick={() => navigate('/privacy-assistant')}
          >
            Back to input
          </button>
        </div>
      </main>
    </div>
  )
}

export default AnalysisFailed