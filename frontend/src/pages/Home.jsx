import { useNavigate } from 'react-router-dom'
import GlobalHeader from '../components/GlobalHeader'
import GlobalFooter from '../components/GlobalFooter'
import '../styles/home.css'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <GlobalHeader activePage="home" />

      <main className="home-content">
        <section className="home-intro">
          <h1>Understand privacy across the whole system</h1>
          <p>
            Review privacy policies, build consent knowledge and access future
            risk insights — all in one place.
          </p>
        </section>

        <section className="home-feature-grid">
          <div className="home-feature-card policy-card">
            <p className="home-feature-label">FEATURE 01</p>

            <h2>Privacy Policy Assistant</h2>

            <p className="home-feature-description">
              Explore or paste a privacy policy and receive a clear,
              plain-language explanation.
            </p>

            <div className="home-feature-points">
              <span>Summary</span>
              <span>Example</span>
              <span>Guidance</span>
            </div>

            <button
              className="home-primary-button"
              type="button"
              onClick={() => navigate('/privacy-assistant')}
            >
              Open Policy Assistant
            </button>
          </div>

          <div className="home-feature-card learning-card">
            <p className="home-feature-label">FEATURE 02</p>

            <h2>Interactive Privacy Learning</h2>

            <p className="home-feature-description">
              Learn privacy concepts, complete activities and practise consent
              decisions.
            </p>

            <div className="home-feature-points">
              <span>5 topics</span>
              <span>3 scenarios</span>
              <span>Combined feedback</span>
            </div>

            <button
              className="home-learning-button"
              type="button"
              onClick={() => navigate('/privacy-learning')}
            >
              Open Learning Experience
            </button>
          </div>
        </section>

        <section className="home-risk-card">
          <div className="home-risk-info">
            <h2>Risk Dashboard</h2>

            <p>
              Future system area for privacy and consent risk insights.
            </p>

            <button className="home-coming-button" type="button" disabled>
              Coming Soon
            </button>
          </div>

          <div className="home-risk-preview">
            <div className="risk-preview-card">
              <span>PLANNED</span>
              <strong>Risk overview</strong>
            </div>

            <div className="risk-preview-card">
              <span>PLANNED</span>
              <strong>Risk indicators</strong>
            </div>

            <div className="risk-preview-card future-card">
              <span>FUTURE FEATURE</span>
              <strong>
                Scope to be
                <br />
                confirmed
              </strong>
            </div>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  )
}

export default Home