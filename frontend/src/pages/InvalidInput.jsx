import { useNavigate } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import ProgressSteps from '../components/ProgressSteps'
import '../styles/invalidInput.css'

function InvalidInput() {
  const navigate = useNavigate()

  return (
    <PolicyLayout activePage="analysis">
      <section className="invalid-heading">
        <p className="invalid-label">POLICY ASSISTANT</p>

        <h1>Privacy Policy Analysis</h1>

        <p>
          Paste a privacy policy or notice and get a clearer explanation
          before you decide.
        </p>
      </section>

      <ProgressSteps current={1} />

      <section className="invalid-card">
        <div className="invalid-icon">!</div>

        <h2>This text cannot be analysed</h2>

        <p className="invalid-message">
          The content you entered does not appear to contain enough privacy
          policy information for analysis.
        </p>

        <div className="invalid-note">
          Please check the text and try again with a privacy policy,
          privacy notice, or information about how personal data is handled.
        </div>

        <button
          className="invalid-back-button"
          onClick={() => navigate('/privacy-assistant')}
        >
          Back to input
        </button>
      </section>
    </PolicyLayout>
  )
}

export default InvalidInput