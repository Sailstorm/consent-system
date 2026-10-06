import { useLocation, useNavigate } from 'react-router-dom'
import '../styles/analysisFailed.css'

function AnalysisFailed() {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText =
    location.state?.policyText || ''

  function retryAnalysis() {
    navigate('/processing', {
      state: {
        inputType: 'text',
        policyText,
      },
    })
  }

  function editInput() {
    navigate('/privacy-assistant', {
      state: {
        policyText,
      },
    })
  }

  function goToLearning() {
    navigate('/privacy-learning/learn')
  }

  function goToDashboard() {
    navigate('/risk-dashboard')
  }

  return (
    <div className="i3-failed-page">
      <header className="i3-failed-header">
        <div className="i3-failed-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="i3-failed-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-failed-back"
          onClick={editInput}
        >
          ← Back
        </button>
      </header>

      <main className="i3-failed-content">
        <section className="i3-failed-heading">
          <p>POLICY ANALYSIS</p>

          <h1>We couldn’t analyse your policy</h1>

          <span>
            We weren’t able to complete the analysis this time.
          </span>
        </section>

        <section className="i3-failed-main-card">
          <img
            src={`${import.meta.env.BASE_URL}error-icon.jpg`}
            alt=""
            className="i3-failed-error-icon"
          />

          <h2>Analysis unsuccessful</h2>

          <p>
            You can try again or edit your policy before trying again.
          </p>

          <div className="i3-failed-main-actions">
            <button
              type="button"
              className="i3-failed-retry"
              onClick={retryAnalysis}
            >
              Try again
            </button>

            <button
              type="button"
              className="i3-failed-edit"
              onClick={editInput}
            >
              Edit input
            </button>
          </div>
        </section>

        <section className="i3-failed-learning-card">
          <img
            src={`${import.meta.env.BASE_URL}status-bg-book.jpg`}
            alt=""
            className="i3-failed-learning-background"
          />

          <img
            src={`${import.meta.env.BASE_URL}icon-question.jpg`}
            alt=""
            className="i3-failed-question-icon"
          />

          <div className="i3-failed-learning-copy">
            <span>PRIVACY LEARNING</span>

            <h3>Explore privacy lessons</h3>

            <p>
              Learn about key privacy concepts at your own pace.
            </p>
          </div>

          <button
            type="button"
            onClick={goToLearning}
          >
            Explore learning →
          </button>
        </section>

        <section className="i3-failed-dashboard-card">
          <div>
            <h3>Continue without the analysis</h3>

            <p>
              You can still use the other Consent Assistant features.
            </p>
          </div>

          <button
            type="button"
            onClick={goToDashboard}
          >
            Go to dashboard →
          </button>
        </section>

        <div className="i3-failed-footer-line"></div>

        <p className="i3-failed-disclaimer">
          Consent Assistant provides information to support your review.
          It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-failed-watermark"
      />
    </div>
  )
}

export default AnalysisFailed