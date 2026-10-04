import { useNavigate } from 'react-router-dom'
import '../styles/invalidInput.css'

function InvalidInput() {
  const navigate = useNavigate()

  return (
    <div className="i3-invalid-page">
      <header className="i3-invalid-header">
        <div className="i3-invalid-brand">
          <img
            src="/logo2.jpg"
            alt="Consent Assistant"
            className="i3-invalid-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-invalid-back"
          onClick={() => navigate('/privacy-assistant')}
        >
          ← Back
        </button>
      </header>

      <main className="i3-invalid-content">
        <section className="i3-invalid-heading">
          <p>POLICY ANALYSIS</p>

          <h1>This text cannot be analysed</h1>

          <span>
            We could not find enough privacy policy
            information in the text you submitted.
          </span>
        </section>

        <section className="i3-invalid-card">
          <img
            src="/error-icon.jpg"
            alt=""
            className="i3-invalid-icon"
          />

          <h2>Not enough privacy information</h2>

          <p>
            The content you entered does not appear to
            contain enough privacy policy information for
            analysis.
          </p>

          <div className="i3-invalid-note">
            Please try again with a privacy policy,
            privacy notice, or information about how
            personal data is collected, used, shared or
            stored.
          </div>

          <button
            type="button"
            className="i3-invalid-button"
            onClick={() =>
              navigate('/privacy-assistant')
            }
          >
            Back to input
          </button>
        </section>

        <p className="i3-invalid-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src="/ca-watermark.png"
        alt=""
        className="i3-invalid-watermark"
      />
    </div>
  )
}

export default InvalidInput