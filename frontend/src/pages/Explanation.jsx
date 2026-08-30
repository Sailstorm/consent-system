import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/explanation.css'

function Explanation() {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText = location.state?.policyText
  const summaries = location.state?.summaries || {}

  const categories = [
    {
      title: 'Data Collection',
      text:
        summaries.data_collection ||
        'No information is available for this category.',
      status:
        summaries.data_collection === 'Not specified in the policy.'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-collection',
    },
    {
      title: 'Purpose of Use',
      text:
        summaries.purpose_of_use ||
        'No information is available for this category.',
      status:
        summaries.purpose_of_use === 'Not specified in the policy.'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/purpose-of-use',
    },
    {
      title: 'Data Sharing',
      text:
        summaries.data_sharing ||
        'No information is available for this category.',
      status:
        summaries.data_sharing === 'Not specified in the policy.'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-sharing',
    },
    {
      title: 'Data Retention',
      text:
        summaries.data_retention ||
        'No information is available for this category.',
      status:
        summaries.data_retention === 'Not specified in the policy.'
          ? 'Not clearly stated'
          : 'Information found',
      path: '/data-retention',
    },
    {
      title: 'User Control',
      text:
        summaries.user_control ||
        'No information is available for this category.',
      status:
        summaries.user_control === 'Not specified in the policy.'
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
        summaries: summaries,
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
                summaries: summaries,
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