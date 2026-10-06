import { useLocation, useNavigate } from 'react-router-dom'
import { loadAnalysisState } from '../utils/analysisState'
import '../styles/consentSummary.css'

function ConsentSummary() {
  const navigate = useNavigate()
  const location = useLocation()

  const savedAnalysis = loadAnalysisState()

  const policyText =
    location.state?.policyText ||
    savedAnalysis.policyText ||
    ''

  const analysisResult =
    location.state?.analysisResult ||
    savedAnalysis.analysisResult ||
    {}

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const summaryItems = [
    {
      title: 'What data is collected',
      value:
        dataCollection.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Why it is used',
      value:
        analysisResult.purpose_of_use?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Who it may be shared with',
      value:
        analysisResult.data_sharing?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'How long it is kept',
      value:
        analysisResult.data_retention?.summary ||
        'No information is available for this category.',
    },
    {
      title: 'Your choices',
      value:
        analysisResult.user_control?.summary ||
        'No information is available for this category.',
    },
  ]

  function goToExplanation() {
    navigate('/explanation', {
      state: {
        policyText,
        analysisResult,
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

  function startNewAnalysis() {
    navigate('/privacy-assistant')
  }

  function goToLearning() {
    navigate('/privacy-learning/learn')
  }

  return (
    <div className="i3-summary-page">
      <header className="i3-summary-header">
        <div className="i3-summary-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="i3-summary-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-summary-header-back"
          onClick={goToExplanation}
        >
          ← Back
        </button>
      </header>

      <main className="i3-summary-content">
        <div className="i3-summary-top">
          <section className="i3-summary-heading">
            <p className="i3-summary-label">
              YOUR PRIVACY SUMMARY
            </p>

            <h1>Consent summary</h1>

            <p>
              A plain-language summary based only on the
              privacy text you submitted.
            </p>
          </section>

          <aside className="i3-summary-learning">
            <img
              src={`${import.meta.env.BASE_URL}status-bg-book.jpg`}
              alt=""
              className="i3-summary-learning-background"
            />

            <img
              src={`${import.meta.env.BASE_URL}icon-question.jpg`}
              alt=""
              className="i3-summary-question-icon"
            />

            <div className="i3-summary-learning-copy">
              <span>PRIVACY LEARNING</span>

              <h3>Learn more about privacy</h3>

              <p>
                Explore short lessons about key privacy
                concepts.
              </p>
            </div>

            <button
              type="button"
              onClick={goToLearning}
            >
              Explore learning →
            </button>
          </aside>
        </div>

        <div className="i3-summary-main">
          <section className="i3-summary-meaning">
            <h2>What this policy means</h2>

            <div className="i3-summary-items">
              {summaryItems.map((item) => (
                <article
                  className="i3-summary-item"
                  key={item.title}
                >
                  <h3>{item.title}</h3>
                  <p>{item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="i3-summary-original">
            <h2>Original policy excerpt</h2>

            <p className="i3-summary-original-description">
              Compare the explanation with the source text
              whenever you want.
            </p>

            <div className="i3-summary-policy-text">
              {policyText || 'No original policy text available.'}
            </div>

            <p className="i3-summary-source">
              Source: text submitted by you
            </p>

            <button
              type="button"
              className="i3-summary-edit-original"
              onClick={editInput}
            >
              Edit original input
            </button>
          </aside>
        </div>

        <div className="i3-summary-actions">
          <div className="i3-summary-actions-left">
            <button
              type="button"
              className="i3-summary-secondary"
              onClick={editInput}
            >
              Edit input
            </button>

            <button
              type="button"
              className="i3-summary-primary"
              onClick={startNewAnalysis}
            >
              Start new analysis
            </button>

            <button
              type="button"
              className="i3-summary-primary"
              onClick={goToExplanation}
            >
              ← Back to explanation
            </button>
          </div>

          <button
            type="button"
            className="i3-summary-dashboard"
            onClick={() => navigate('/risk-dashboard')}
          >
            Go to dashboard →
          </button>
        </div>

        <p className="i3-summary-decision-note">
          This summary supports understanding; it does not
          tell you whether to accept or reject.
        </p>

        <div className="i3-summary-footer-line"></div>

        <p className="i3-summary-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-summary-watermark"
      />
    </div>
  )
}

export default ConsentSummary