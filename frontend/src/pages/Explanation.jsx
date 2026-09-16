import { useLocation, useNavigate } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import ProgressSteps from '../components/ProgressSteps'
import { loadSettings, truncateForDetailLevel } from '../utils/settings'
import '../styles/explanation.css'

function Explanation() {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText = location.state?.policyText
  const analysisResult = location.state?.analysisResult || {}
  const detailLevel = loadSettings().detailLevel

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const getStatus = (values) => {
    const foundCount = values.filter(Boolean).length

    if (foundCount === values.length) {
      return {
        label: 'Complete information',
        type: 'complete',
      }
    }

    if (foundCount > 0) {
      return {
        label: 'Partial information',
        type: 'partial',
      }
    }

    return {
      label: 'No information found',
      type: 'missing',
    }
  }

  const collectionExplanation =
    dataCollection.detailed_explanation || {}

  const purposeExplanation =
    analysisResult.purpose_of_use?.detailed_explanation || {}

  const sharingExplanation =
    analysisResult.data_sharing?.detailed_explanation || {}

  const retentionExplanation =
    analysisResult.data_retention?.detailed_explanation || {}

  const controlExplanation =
    analysisResult.user_control?.detailed_explanation || {}

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
        analysisResult.purpose_of_use?.summary ||
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
        analysisResult.data_sharing?.summary ||
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
        analysisResult.data_retention?.summary ||
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
        analysisResult.user_control?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status: controlStatus.label,
      statusType: controlStatus.type,
      path: '/user-control',
    },
    {
      title: 'Source & Decision',
      text: 'Review the source text and make your own decision.',
      status: 'Source available',
      statusType: 'source',
      path: '/source-decision',
    },
  ]

  const openCategory = (path) => {
    navigate(path, {
      state: {
        policyText: policyText,
        analysisResult: analysisResult,
      },
    })
  }

  return (
    <PolicyLayout activePage="analysis">
      <section className="explanation-heading">
        <p className="explanation-label">POLICY ASSISTANT</p>

        <h1>Privacy Policy Analysis</h1>

        <p>
          Review the main privacy points identified from your submitted text.
        </p>
      </section>

      <ProgressSteps current={2} />

      <section className="explanation-intro">
        <div>
          <h2>Your privacy explanation</h2>
          <p>
            The information is organised into key privacy categories so you
            can review each part more easily.
          </p>
        </div>

        <span>6 sections</span>
      </section>

      <section className="category-grid">
        {categories.map((category) => (
          <button
            key={category.title}
            className="category-card"
            onClick={() => openCategory(category.path)}
          >
            <div>
              <h2>{category.title}</h2>
              <p>{category.text}</p>
            </div>

            <div className="category-card-footer">
              <span className={`category-status ${category.statusType}`}>
                {category.status}
              </span>

              <span className="category-card-arrow">→</span>
            </div>
          </button>
        ))}
      </section>

      <section className="explanation-note">
        <strong>No recommendation is made for you.</strong>
        <p>
          The summary helps you understand what the policy says. If something
          is unclear, it will be shown as not clearly stated.
        </p>
      </section>

      <div className="explanation-actions">
        <button
          className="summary-button"
          onClick={() =>
            navigate('/consent-summary', {
              state: {
                policyText: policyText,
                analysisResult: analysisResult,
              },
            })
          }
        >
          View consent summary
        </button>

        <button
          className="edit-input-button"
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
      </div>
    </PolicyLayout>
  )
}

export default Explanation