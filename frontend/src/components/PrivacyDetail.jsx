import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadAnalysisState } from '../utils/analysisState'
import PageHeader from './PageHeader'
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

  const [showSourceText, setShowSourceText] =
    useState(false)

  const savedAnalysis = loadAnalysisState()

  const policyText =
    location.state?.policyText ||
    savedAnalysis.policyText ||
    ''

  const analysisResult =
    location.state?.analysisResult ||
    savedAnalysis.analysisResult ||
    {}

  function isMissingSection(section) {
    if (!section.text) {
      return true
    }

    const text = section.text
      .trim()
      .toLowerCase()

    return (
      text === '' ||
      text.includes(
        'no information is available for thissection',
      ) ||
      text.includes(
        'no information is available for this section',
      ) ||
      text.includes(
        'no information was identified',
      )
    )
  }

  const identifiedSections =
    sections.filter(
      (section) => !isMissingSection(section),
    )

  const whatWeFound =
    identifiedSections[0]?.text ||
    'No clear information was identified for this category.'

  const displayStatus =
    statusType === 'complete'
      ? 'Clearly stated'
      : statusType === 'partial'
        ? 'Partly stated'
        : 'Not clearly stated'

  const defaultStatusText =
    statusType === 'complete'
      ? `All ${title.toLowerCase()} details were identified.`
      : statusType === 'partial'
        ? `Some ${title.toLowerCase()} details are not clearly stated.`
        : `No ${title.toLowerCase()} information was identified.`

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

  function toggleSourceText() {
    setShowSourceText(!showSourceText)
  }

  return (
    <div className="i3-detail-page">
      <PageHeader />

      <div className="i3-detail-back-row">
        <button
          type="button"
          className="i3-detail-page-back"
          onClick={goBack}
        >
          ← Back
        </button>
      </div>

      <main className="i3-detail-content">
        <div className="i3-detail-heading-row">
          <section className="i3-detail-heading">
            <p className="i3-detail-label">
              YOUR PRIVACY SUMMARY&nbsp; • &nbsp;DETAIL
            </p>

            <h1>{title}</h1>

            <p>{subtitle}</p>
          </section>

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
                  statusLabel ||
                  defaultStatusText}
              </p>
            </div>
          </aside>
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
              {sections.map((section) => {
                const missing =
                  isMissingSection(section)

                return (
                  <div
                    className={
                      missing
                        ? 'i3-detail-identified-item missing'
                        : 'i3-detail-identified-item identified'
                    }
                    key={section.heading}
                  >
                    <span>
                      {missing ? '?' : '✓'}
                    </span>

                    <p>{section.heading}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        <section className="i3-detail-meaning-card">
          <img
            src={`${import.meta.env.BASE_URL}icon-info.jpg`}
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

        <section className="i3-detail-policy-card">
          <div className="i3-detail-policy-heading">
            <div>
              <p className="i3-detail-card-label">
                WHAT THE POLICY SAYS
              </p>

              <h2>
                Original text related to this category
              </h2>
            </div>

            <button
              type="button"
              className="i3-detail-expand-button"
              onClick={toggleSourceText}
            >
              {showSourceText
                ? 'Collapse'
                : 'Expand'}
            </button>
          </div>

          {showSourceText && (
            <div className="i3-detail-source-box">
              <span className="i3-detail-source-line"></span>

              <p>
                {sourceText ||
                  'No related source text was identified.'}
              </p>
            </div>
          )}

          {!showSourceText && (
            <p className="i3-detail-source-collapsed">
              Original source text is hidden.
              Select Expand to view it.
            </p>
          )}
        </section>

        <div className="i3-detail-actions">
          

          <div className="i3-detail-right-actions">
            {learningRoutes[title] && (
              <button
                type="button"
                className="i3-detail-learn-button"
                onClick={goToLearning}
              >
                <img
                  src={`${import.meta.env.BASE_URL}icon-question.jpg`}
                  alt=""
                  className="i3-detail-learn-icon"
                />

                <span className="i3-detail-learn-copy">
                  {learningButtonText[title]}
                </span>
              </button>
            )}

            <button
              type="button"
              className="i3-detail-summary-button"
              onClick={goToSummary}
            >
              View consent summary →
            </button>
          </div>
        </div>

        <div className="i3-detail-footer-line"></div>

        <p className="i3-detail-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-detail-watermark"
      />
    </div>
  )
}

export default PrivacyDetail