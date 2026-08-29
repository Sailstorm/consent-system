import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/explanation.css'

function Explanation() {
  const navigate = useNavigate()

  const categories = [
    {
      title: 'Data Collection',
      text: 'What personal information the policy says may be collected.',
      status: 'Some information found',
      path: '/data-collection',
    },
    {
      title: 'Purpose of Use',
      text: 'How the policy says your personal information may be used.',
      status: 'Some purposes identified',
      path: '/purpose-of-use',
    },
    {
      title: 'Data Sharing',
      text: 'Whether the policy mentions sharing information with other parties.',
      status: 'Some details found',
      path: '/data-sharing',
    },
    {
      title: 'Data Retention',
      text: 'How long the policy says your personal information may be kept.',
      status: 'Not clearly stated',
      path: '/data-retention',
    },
    {
      title: 'User Control',
      text: 'What choices or controls the policy gives you over your data.',
      status: 'Some controls found',
      path: '/user-control',
    },
    {
      title: 'Source & Decision',
      text: 'Review the source text and make your own decision.',
      status: 'Source available',
      path: '/source-decision',
    },
  ]

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
              onClick={() => navigate(category.path)}
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
          onClick={() => navigate('/consent-summary')}
        >
          View consent summary
        </button>
      </main>
    </div>
  )
}

export default Explanation