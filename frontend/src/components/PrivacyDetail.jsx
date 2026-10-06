import { useLocation, useNavigate } from 'react-router-dom'
import { loadAnalysisState } from '../utils/analysisState'
import '../styles/privacyDetail.css'

function PrivacyDetail({
  title,
  subtitle,
  statusLabel,
  statusText,
  statusType,
  sections,
  sourceText,
  interpretation,
}) {
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

  const availableSections = sections.filter(
    (section) =>
      section.text &&
      section.text.trim() !== '',
  )

  const whatWeFound =
    availableSections[0]?.text ||
    'No clear information was identified for this category.'

  const displayStatus =
    statusType === 'complete'
      ? 'Clearly stated'
      : statusType === 'partial'
        ? 'Partly stated'
        : 'Not clearly stated'

  const learningRoutes = {
    'Data Collection':
      '/privacy-learning/learn/data-collection',

    'Purpose of Use':
      '/privacy-learning/learn/purpose-of-use',

    'Data Sharing':
      '/privacy-learning/learn/data-sharing',

    'Data Retention':
      '/privacy-learning/learn/data-retention',

    'User Control':
      '/privacy-learning/learn/user-control',
  }

  const learningButtonText = {
    'Data Collection':
      'What is Data Collection? Learn more →',

    'Purpose of Use':
      'Why is your information used? Learn more →',

    'Data Sharing':
      'Who can your information be shared with? Learn more →',

    'Data Retention':
      'How long can your information be kept? Learn more →',

    'User Control':
      'What control do you have over your information? Learn more →',
  }

  function goBack() {
    navigate('/explanation', {
      state: {
        policyText,
        analysisResult,
      },
    })
  }

  function goToSummary() {
    navigate('/consent-summary', {
      state: {
        policyText,
        analysisResult,
      },
    })
  }

  function goToLearning() {
    const learningRoute =
      learningRoutes[title]

    if (!learningRoute) {
      return
    }

    navigate(learningRoute)
  }

  return (
    <div className="i3-detail-page">
      <header className="i3-detail-header">
        <div className="i3-detail-brand">
          <img
            src="/logo2.jpg"
            alt="Consent Assistant"
            className="i3-detail-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-detail-header-back"
          onClick={goBack}
        >
          ← Back
        </button>
      </header>

      <main className="i3-detail-content">
        <div className="i3-detail-heading-row">
          <section className="i3-detail-heading">
            <p className="i3-detail-label">
              YOUR PRIVACY SUMMARY&nbsp; • &nbsp;DETAIL
            </p>

            <h1>{title}</h1>

            <p>{subtitle}</p>
          </section>

          <div className="i3-detail-heading-actions">
            <button
              type="button"
              className="i3-detail-learn-button"
              onClick={goToLearning}
            >
              <img
                src="/icon-question.jpg"
                alt=""
                className="i3-detail-learn-icon"
              />

              <span className="i3-detail-learn-copy">
                {learningButtonText[title] ||
                  'Learn more →'}
              </span>
            </button>

            <aside
              className={`i3-detail-status ${statusType}`}
            >
              <span className="i3-detail-status-icon">
                {statusType === 'complete'
                  ? '✓'
                  : statusType === 'partial'
                    ? '◐'
                    : '!'}
              </span>

              <div>
                <h3>{displayStatus}</h3>

                <p>
                  {statusText ||
                    statusLabel}
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="i3-detail-divider"></div>

        <div className="i3-detail-top-cards">
          <section className="i3-detail-found-card">
            <p className="i3-detail-card-label">
              WHAT WE FOUND
            </p>

            <h2>{whatWeFound}</h2>

            <p>
              This information was identified from the
              privacy text you submitted.
            </p>
          </section>

          <section className="i3-detail-identified-card">
            <p className="i3-detail-card-label">
              INFORMATION IDENTIFIED
            </p>

            <div className="i3-detail-identified-list">
              {availableSections.map((section) => (
                <div
                  className="i3-detail-identified-item"
                  key={section.heading}
                >
                  <span>✓</span>

                  <p>{section.heading}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="i3-detail-policy-card">
          <p className="i3-detail-card-label">
            WHAT THE POLICY SAYS
          </p>

          <h2>
            Original text related to this category
          </h2>

          <div className="i3-detail-source-box">
            <span className="i3-detail-source-line"></span>

            <p>
              {sourceText ||
                'No related source text was identified.'}
            </p>
          </div>
        </section>

        <section className="i3-detail-meaning-card">
          <img
            src="/icon-info.jpg"
            alt=""
            className="i3-detail-info-icon"
          />

          <div>
            <p className="i3-detail-card-label">
              WHAT THIS MEANS
            </p>

            <p className="i3-detail-meaning-text">
              {interpretation ||
                'No additional interpretation is available.'}
            </p>
          </div>
        </section>

        <div className="i3-detail-actions">
          <button
            type="button"
            className="i3-detail-back-button"
            onClick={goBack}
          >
            ← Back to explanation
          </button>

          <button
            type="button"
            className="i3-detail-summary-button"
            onClick={goToSummary}
          >
            View consent summary →
          </button>
        </div>

        <div className="i3-detail-footer-line"></div>

        <p className="i3-detail-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src="/ca-watermark.png"
        alt=""
        className="i3-detail-watermark"
      />
    </div>
  )
}

export default PrivacyDetail