import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import '../styles/learningPlaceholder.css'

function LearningAbout({ headerActivePage = 'learning' }) {
  const navigate = useNavigate()

  return (
    <LearningLayout
      activePage="about"
      headerActivePage={headerActivePage}
    >
      <section className="learning-placeholder learning-about-page">
        <p className="learning-placeholder-label">HELP</p>

        <h1>Find a privacy policy and understand the results</h1>

        <p>
          Guided steps explain how to locate a policy, paste it into the
          assistant and review the summary.
        </p>

        <div className="learning-about-layout">
          <div className="learning-placeholder-card learning-about-card">
            <h2>What this page covers</h2>

            <ol>
              <li>
                <strong>01</strong> Clear explanation
              </li>
              <li>
                <strong>02</strong> Practical guidance
              </li>
              <li>
                <strong>03</strong> Original wording remains available
              </li>
            </ol>
          </div>

          <div className="learning-help-card">
            <div>
              <h2>Helpful guidance</h2>

              <p>
                Guided steps explain how to locate a policy, paste it into the
                assistant and review the summary.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/policy-assistant/example')}
            >
              Open step-by-step help
            </button>
          </div>
        </div>
      </section>
    </LearningLayout>
  )
}

export default LearningAbout
