import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/processing.css'

function Processing() {
  const navigate = useNavigate()

  return (
    <div className="processing-page">
      <Sidebar activePage="assistant" />

      <main className="processing-content">
        <div className="processing-heading">
          <h1>Analysing your privacy information</h1>
          <p>
            We are turning the text you submitted into a clearer explanation
            and structured consent summary.
          </p>
        </div>

        <div className="processing-steps">
          <div className="step">1 Input</div>
          <div className="step active">2 Explanation</div>
          <div className="step">3 Consent Summary</div>
        </div>

        <section className="processing-card">
          <div className="loading-circle"></div>

          <h2>Processing submitted text...</h2>

          <p className="processing-main-text">
            Checking for useful privacy information
          </p>

          <div className="processing-list">
            <p>
              Identifying data collection, use, sharing, retention and user
              control
            </p>
            <p>Preparing a plain-language explanation</p>
          </div>

          <div className="processing-note">
            Please wait a moment while the analysis is completed.
            <br />
            Your original text remains available for comparison.
          </div>
        </section>

        <div className="processing-actions">
          <button
            className="processing-button"
            onClick={() => navigate('/explanation')}
          >
            View explanation
          </button>

          <button
            className="failure-button"
            onClick={() => navigate('/analysis-failed')}
          >
            If processing fails
          </button>
        </div>
      </main>
    </div>
  )
}

export default Processing