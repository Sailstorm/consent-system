import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/consentSummary.css'

function ConsentSummary() {
  const navigate = useNavigate()

  const summaryItems = [
    {
      title: 'Data Collection',
      value: 'Basic personal and device information may be collected.',
    },
    {
      title: 'Purpose of Use',
      value: 'Information may be used for service delivery and improvement.',
    },
    {
      title: 'Data Sharing',
      value: 'Some information may be shared with service providers or partners.',
    },
    {
      title: 'Data Retention',
      value: 'Not clearly stated',
    },
    {
      title: 'User Control',
      value: 'Some access, update and permission controls are available.',
    },
  ]

  return (
    <div className="summary-page">
      <Sidebar activePage="assistant" />

      <main className="summary-content">
        <div className="summary-heading">
          <h1>Consent Summary</h1>
          <p>
            A quick overview of the key privacy information found in the policy.
          </p>
        </div>

        <div className="summary-steps">
          <div className="step">1 Input</div>
          <div className="step">2 Explanation</div>
          <div className="step active">3 Consent Summary</div>
        </div>

        <section className="summary-card">
          <div className="summary-card-heading">
            <div>
              <h2>Your privacy summary</h2>
              <p>
                Review the main privacy points before making your own decision.
              </p>
            </div>
          </div>

          <div className="summary-items">
            {summaryItems.map((item) => (
              <div className="summary-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="summary-message">
          <h3>Your decision stays with you</h3>
          <p>
            This summary is provided to help you understand the privacy policy.
            It does not tell you whether you should accept or reject it.
          </p>
        </section>

        <div className="summary-actions">
          <button
            className="summary-back-button"
            onClick={() => navigate('/explanation')}
          >
            Back to Explanation
          </button>

          <button
            className="edit-input-button"
            onClick={() => navigate('/privacy-assistant')}
          >
            Edit Input
          </button>

          <button
            className="new-analysis-button"
            onClick={() => navigate('/privacy-assistant')}
          >
            Start New Analysis
          </button>
        </div>
      </main>
    </div>
  )
}

export default ConsentSummary