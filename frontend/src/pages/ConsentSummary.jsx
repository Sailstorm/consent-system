import { useLocation, useNavigate } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import ProgressSteps from '../components/ProgressSteps'
import '../styles/consentSummary.css'

function ConsentSummary() {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText = location.state?.policyText
  const analysisResult = location.state?.analysisResult || {}

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const summaryItems = [
    {
      title: 'Data Collection',
      value:
        dataCollection.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Purpose of Use',
      value:
        analysisResult.purpose_of_use?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Data Sharing',
      value:
        analysisResult.data_sharing?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Data Retention',
      value:
        analysisResult.data_retention?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'User Control',
      value:
        analysisResult.user_control?.summary ||
        'No information is available for this category.',
    },
  ]

  return (
    <PolicyLayout activePage="analysis">
      <section className="summary-heading">
        <p className="summary-label">POLICY ASSISTANT</p>

        <h1>Consent Summary</h1>

        <p>
          A quick overview of the key privacy information found in the policy.
        </p>
      </section>

      <ProgressSteps current={3} />

      <section className="summary-card">
        <div className="summary-card-heading">
          <h2>Your privacy summary</h2>

          <p>
            Review the main privacy points before making your own decision.
          </p>
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
          onClick={() =>
            navigate('/explanation', {
              state: {
                policyText: policyText,
                analysisResult: analysisResult,
              },
            })
          }
        >
          Back to Explanation
        </button>

        <button
          className="summary-edit-button"
          onClick={() =>
            navigate('/privacy-assistant', {
              state: {
                policyText: policyText,
              },
            })
          }
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
    </PolicyLayout>
  )
}

export default ConsentSummary