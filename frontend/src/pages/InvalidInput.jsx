import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ProgressSteps from '../components/ProgressSteps'
import '../styles/invalidInput.css'

function InvalidInput() {
  const navigate = useNavigate()

  return (
    <div className="invalid-page">
      <Sidebar activePage="assistant" />

      <main className="invalid-content">
        <div className="invalid-heading">
          <h1>Privacy Assistant</h1>
          <p>
            Paste a privacy policy or notice and get a clearer explanation
            before you decide.
          </p>
        </div>

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
      </main>
    </div>
  )
}

export default InvalidInput