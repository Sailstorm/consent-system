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

  const categories = [
    {
      title: 'Data Collection',
      text: truncateForDetailLevel(
        dataCollection.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status:
        dataCollection.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-collection',
    },
    {
      title: 'Purpose of Use',
      text: truncateForDetailLevel(
        analysisResult.purpose_of_use?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status:
        analysisResult.purpose_of_use?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/purpose-of-use',
    },
    {
      title: 'Data Sharing',
      text: truncateForDetailLevel(
        analysisResult.data_sharing?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status:
        analysisResult.data_sharing?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-sharing',
    },
    {
      title: 'Data Retention',
      text: truncateForDetailLevel(
        analysisResult.data_retention?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status:
        analysisResult.data_retention?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-retention',
    },
    {
      title: 'User Control',
      text: truncateForDetailLevel(
        analysisResult.user_control?.summary ||
          'No information is available for this category.',
        detailLevel,
      ),
      status:
        analysisResult.user_control?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/user-control',
    },
    {
      title: 'Source & Decision',
      text: 'Review the source text and make your own decision.',
      status: 'Source available',
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
              <span>{category.status}</span>

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