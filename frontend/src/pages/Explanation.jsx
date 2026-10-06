import { useLocation, useNavigate } from 'react-router-dom'
import {
  loadSettings,
  truncateForDetailLevel,
} from '../utils/settings'
import { loadAnalysisState } from '../utils/analysisState'
import '../styles/explanation.css'

function Explanation() {
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

  const detailLevel =
    loadSettings().detailLevel

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const getStatus = (values) => {
    const foundCount =
      values.filter(Boolean).length

    if (foundCount === values.length) {
      return {
        label: 'Clearly stated',
        type: 'complete',
      }
    }

    if (foundCount > 0) {
      return {
        label: 'Partly stated',
        type: 'partial',
      }
    }

    return {
      label: 'Not clearly stated',
      type: 'missing',
    }
  }

  const collectionExplanation =
    dataCollection.detailed_explanation || {}

  const purposeExplanation =
    analysisResult.purpose_of_use
      ?.detailed_explanation || {}

  const sharingExplanation =
    analysisResult.data_sharing
      ?.detailed_explanation || {}

  const retentionExplanation =
    analysisResult.data_retention
      ?.detailed_explanation || {}

  const controlExplanation =
    analysisResult.user_control
      ?.detailed_explanation || {}

  const collectionStatus = getStatus([
    collectionExplanation.what_data_is_collected,
    collectionExplanation.how_it_is_collected,
    collectionExplanation.when_collection_happens,
    collectionExplanation.required_or_optional,
    collectionExplanation.what_is_not_confirmed,
    collectionExplanation.why_this_matters,
  ])

  const purposeStatus = getStatus([
    purposeExplanation.why_data_is_used,
    purposeExplanation.data_and_purpose,
    purposeExplanation.unspecified_purposes,
    purposeExplanation.additional_uses,
    purposeExplanation.why_this_matters,
  ])

  const sharingStatus = getStatus([
    sharingExplanation.who_data_may_be_shared_with,
    sharingExplanation.why_sharing_may_happen,
    sharingExplanation.named_organisations,
    sharingExplanation.what_data_is_shared,
    sharingExplanation.user_control,
    sharingExplanation.why_this_matters,
  ])

  const retentionStatus = getStatus([
    retentionExplanation.what_is_retained,
    retentionExplanation.how_long_data_is_kept,
    retentionExplanation.why_data_is_retained,
    retentionExplanation.deletion_condition,
    retentionExplanation.why_this_matters,
  ])

  const controlStatus = getStatus([
    controlExplanation.what_you_can_control,
    controlExplanation.how_to_use_these_controls,
    controlExplanation.access_and_correction,
    controlExplanation.deletion,
    controlExplanation.consent_or_opt_out,
    controlExplanation.limitations,
    controlExplanation.why_this_matters,
  ])

  const categories = [
    {
      title: 'Data Collection',
      text: truncateForDetailLevel(
        dataCollection.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: collectionStatus.label,
      statusType: collectionStatus.type,
      path: '/data-collection',
    },
    {
      title: 'Purpose of Use',
      text: truncateForDetailLevel(
        analysisResult.purpose_of_use
          ?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: purposeStatus.label,
      statusType: purposeStatus.type,
      path: '/purpose-of-use',
    },
    {
      title: 'Data Sharing',
      text: truncateForDetailLevel(
        analysisResult.data_sharing
          ?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: sharingStatus.label,
      statusType: sharingStatus.type,
      path: '/data-sharing',
    },
    {
      title: 'Data Retention',
      text: truncateForDetailLevel(
        analysisResult.data_retention
          ?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: retentionStatus.label,
      statusType: retentionStatus.type,
      path: '/data-retention',
    },
    {
      title: 'User Control',
      text: truncateForDetailLevel(
        analysisResult.user_control
          ?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: controlStatus.label,
      statusType: controlStatus.type,
      path: '/user-control',
    },
  ]

  function openCategory(path) {
    navigate(path, {
      state: {
        policyText,
        analysisResult,
      },
    })
  }

  function goToLearning() {
    navigate('/privacy-learning/learn')
  }

  function goToSummary() {
    navigate('/consent-summary', {
      state: {
        policyText,
        analysisResult,
      },
    })
  }

  return (
    <div className="i3-explanation-page">
      <header className="i3-explanation-header">
        <div className="i3-explanation-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="i3-explanation-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-explanation-back"
          onClick={() =>
            navigate('/privacy-assistant', {
              state: {
                policyText,
              },
            })
          }
        >
          ← Back
        </button>
      </header>

      <main className="i3-explanation-content">
        <div className="i3-explanation-top">
          <section className="i3-explanation-heading">
            <p className="i3-explanation-label">
              YOUR PRIVACY SUMMARY
            </p>

            <h1>Explanation</h1>

            <p>
              The key privacy points from your submitted
              text, organised into five consistent
              categories.
            </p>
          </section>

          <aside className="i3-learning-option">
            <img
              src={`${import.meta.env.BASE_URL}status-bg-book.jpg`}
              alt=""
              className="i3-learning-option-background"
            />

            <img
              src={`${import.meta.env.BASE_URL}icon-question.jpg`}
              alt=""
              className="i3-learning-option-icon"
            />

            <div className="i3-learning-option-copy">
              <span>LEARNING OPTION</span>

              <h3>Learn more about privacy</h3>

              <p>
                Explore short privacy lessons.
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

        <section className="i3-category-grid">
          {categories.map((category) => (
            <button
              type="button"
              key={category.title}
              className={`i3-category-card ${category.statusType}`}
              onClick={() =>
                openCategory(category.path)
              }
            >
              <div className="i3-category-copy">
                <h2>{category.title}</h2>
                <p>{category.text}</p>
              </div>

              <div
                className={`i3-category-status ${category.statusType}`}
              >
                <span className="i3-category-status-icon">
                  {category.statusType === 'complete'
                    ? '✓'
                    : category.statusType === 'partial'
                      ? '◐'
                      : '!'}
                </span>

                <span>{category.status}</span>
              </div>

              <span className="i3-category-arrow">
                ›
              </span>
            </button>
          ))}

          <button
            type="button"
            className="i3-category-card source"
            onClick={() =>
              openCategory('/source-decision')
            }
          >
            <div className="i3-source-icon">
              i
            </div>

            <div className="i3-category-copy">
              <h2>Source &amp; decision</h2>

              <p>
                See the sources used and how the summary
                was generated.
              </p>
            </div>

            <span className="i3-category-arrow">
              ›
            </span>
          </button>
        </section>

        <section className="i3-explanation-note">
          <div className="i3-explanation-note-icon">
            i
          </div>

          <div>
            <h3>
              No recommendation is made for you.
            </h3>

            <p>
              These statuses describe how clearly
              information appears in the submitted policy.
              They do not indicate whether the policy is
              safe or unsafe.
            </p>
          </div>
        </section>

        <div className="i3-explanation-actions">
          <button
            type="button"
            className="i3-summary-button"
            onClick={goToSummary}
          >
            View consent summary →
          </button>

          <div className="i3-summary-ready">
            <span>✓</span>
            Consent summary ready
          </div>
        </div>

        <div className="i3-explanation-footer-line"></div>

        <p className="i3-explanation-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-explanation-watermark"
      />
    </div>
  )
}

export default Explanation