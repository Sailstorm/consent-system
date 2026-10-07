import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import '../styles/invalidInput.css'

function InvalidInput() {
  const navigate = useNavigate()

  function goBack() {
    navigate('/privacy-assistant')
  }

  return (
    <div className="i3-invalid-page">
      <PageHeader />

      <div className="i3-invalid-back-row">
        <button
          type="button"
          className="i3-invalid-page-back"
          onClick={goBack}
        >
          ← Back
        </button>
      </div>

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
            src={`${import.meta.env.BASE_URL}error-icon.jpg`}
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
            onClick={goBack}
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
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-invalid-watermark"
      />
    </div>
  )
}

export default InvalidInput