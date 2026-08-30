import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/explanation.css'

function Explanation() {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText = location.state?.policyText
  const analysisResult = location.state?.analysisResult || {}

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const categories = [
    {
      title: 'Data Collection',
      text:
        dataCollection.summary ||
        'No information is available for this category.',
      status:
        dataCollection.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-collection',
    },
    {
      title: 'Purpose of Use',
      text:
        analysisResult.purpose_of_use?.summary ||
        'No information is available for this category.',
      status:
        analysisResult.purpose_of_use?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/purpose-of-use',
    },
    {
      title: 'Data Sharing',
      text:
        analysisResult.data_sharing?.summary ||
        'No information is available for this category.',
      status:
        analysisResult.data_sharing?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-sharing',
    },
    {
      title: 'Data Retention',
      text:
        analysisResult.data_retention?.summary ||
        'No information is available for this category.',
      status:
        analysisResult.data_retention?.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-retention',
    },
    {
      title: 'User Control',
      text:
        analysisResult.user_control?.summary ||
        'No information is available for this category.',
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
    <div className="explanation-page">
      <Sidebar activePage="assistant" />

      <main className="explanation-content">
        <div className="explanation-heading">
          <h1>Explanation</h1>
          <p>
            The key privacy points from your submitted text, organised into
            clear consent categories.
          </p>
        </div>

        <div className="explanation-steps">
          <div className="step">1 Input</div>
          <div className="step active">2 Explanation</div>
          <div className="step">3 Consent Summary</div>
        </div>

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

              <span>{category.status}</span>
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
      </main>
    </div>
  )
}

export default Explanation