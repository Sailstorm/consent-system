import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import { loadLearningProgress } from '../utils/learningProgress'
import { getCompletedCount, getPracticeStatus } from '../utils/practice'
import '../styles/learningHome.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function LearningHome() {
  const navigate = useNavigate()

  const completedTopics = loadLearningProgress()
  const completedCount = completedTopics.length
  const practiceStatus = getPracticeStatus()
  const practiceCount = getCompletedCount()

  const [overview, setOverview] = useState(null)
  const [sectors, setSectors] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    async function loadRealWorldData() {
      try {
        const [overviewResponse, sectorsResponse] = await Promise.all([
          fetch(`${API_URL}/api/ndb/overview`),
          fetch(`${API_URL}/api/ndb/sectors`),
        ])

        if (!overviewResponse.ok || !sectorsResponse.ok) {
          throw new Error('Unable to load OAIC data')
        }

        const overviewData = await overviewResponse.json()
        const sectorsData = await sectorsResponse.json()

        setOverview(overviewData)
        setSectors((sectorsData.sectors || []).slice(0, 3))
      } catch {
        setOverview(null)
        setSectors([])
      } finally {
        setDataLoading(false)
      }
    }

    loadRealWorldData()
  }, [])

  let learningButtonText = 'Start Learning'

  if (completedCount > 0 && completedCount < 5) {
    learningButtonText = 'Continue Learning'
  }

  if (completedCount === 5) {
    learningButtonText = 'Review Learning'
  }

  let practiceButtonText = 'Start Practice'

  if (practiceStatus === 'in_progress') {
    practiceButtonText = 'Continue Practice'
  }

  if (practiceStatus === 'completed') {
    practiceButtonText = 'Try Practice Again'
  }

  const formatDate = (date) => {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <LearningLayout activePage="home">
      <section className="learning-home-heading">
        <p className="learning-home-label">PRIVACY LEARNING</p>

        <h1>Privacy Learning</h1>

        <p>
          Build your privacy knowledge through short lessons, practice
          activities and simple progress tracking.
        </p>
      </section>

      <section className="learning-home-grid">
        <div className="learning-home-card">
          <span className="learning-card-number">01</span>

          <div>
            <h2>Learn</h2>

            <p>
              Explore key privacy concepts using short and simple learning
              topics.
            </p>
          </div>

          <div className="learning-card-progress">
            <span>Learning progress</span>

            <strong>
              {completedCount} of 5 topics completed
            </strong>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/learn')}
          >
            {learningButtonText}
          </button>
        </div>

        <div className="learning-home-card">
          <span className="learning-card-number">02</span>

          <div>
            <h2>Consent Simulation</h2>

            <p>
              Practise realistic consent choices across three interactive
              scenarios.
            </p>
          </div>

          <div className="learning-card-progress">
            <span>Practice progress</span>

            <strong>
              {practiceCount} of 3 scenarios completed
            </strong>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/practice')}
          >
            {practiceButtonText}
          </button>
        </div>

        <div className="learning-home-card">
          <span className="learning-card-number">03</span>

          <div>
            <h2>Learning Dashboard</h2>

            <p>
              See completed topics, scenario progress and your next
              recommended learning step.
            </p>
          </div>

          <button
            className="learning-card-button"
            type="button"
            onClick={() => navigate('/privacy-learning/progress')}
          >
            View Progress
          </button>
        </div>
      </section>

      <section className="learning-home-info">
        <div>
          <h2>Learn at your own pace</h2>

          <p>
            No account is required. Learning activities are designed to be
            short, clear and easy to revisit.
          </p>
        </div>

        <button
          className="learning-about-link"
          type="button"
          onClick={() => navigate('/privacy-learning/about')}
        >
          About Privacy Learning →
        </button>
      </section>

      <section className="learning-real-world">
        <div className="learning-real-world-heading">
          <p className="learning-real-world-label">
            REAL-WORLD PRIVACY CONTEXT
          </p>

          <h2>Privacy issues in Australian breach reports</h2>

          <p>
            Explore a small snapshot of Australian OAIC data to connect the
            learning topics with real reported privacy incidents.
          </p>
        </div>

        {dataLoading ? (
          <div className="learning-real-world-message">
            Loading Australian privacy data...
          </div>
        ) : overview ? (
          <>
            <div className="learning-real-world-stats">
              <div className="learning-real-world-stat">
                <span>Reported breach notifications</span>

                <strong>
                  {overview.reportedNotifications?.toLocaleString() || '0'}
                </strong>

                <p>
                  Eligible breach notifications reported to the OAIC.
                </p>
              </div>

              <div className="learning-real-world-stat">
                <span>Reporting period</span>

                <strong className="learning-real-world-period">
                  {formatDate(overview.periodStart)}
                  {' – '}
                  {formatDate(overview.periodEnd)}
                </strong>

                <p>
                  The period covered by the available OAIC data.
                </p>
              </div>

              <div className="learning-real-world-stat">
                <span>Top reported sectors</span>

                <div className="learning-sector-list">
                  {sectors.length > 0 ? (
                    sectors.map((item) => (
                      <div
                        className="learning-sector-item"
                        key={item.sector}
                      >
                        <span>{item.sector}</span>

                        <strong>{item.notifications}</strong>
                      </div>
                    ))
                  ) : (
                    <p>Sector data is unavailable right now.</p>
                  )}
                </div>
              </div>
            </div>

            <p className="learning-real-world-source">
              Source: OAIC Notifiable Data Breaches data. These figures
              represent eligible notifications reported to the OAIC and do not
              represent every data breach in Australia.
            </p>
          </>
        ) : (
          <div className="learning-real-world-message">
            Real-world privacy data is unavailable right now.
          </div>
        )}
      </section>
    </LearningLayout>
  )
}

export default LearningHome