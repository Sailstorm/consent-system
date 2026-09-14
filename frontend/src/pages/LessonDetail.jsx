import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import '../styles/learningLesson.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function LessonDetail({ topic }) {
  const navigate = useNavigate()

  const [informationTypes, setInformationTypes] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  useEffect(() => {
    if (topic.slug !== 'data-collection') {
      return
    }

    async function loadInformationTypes() {
      setDataLoading(true)

      try {
        const response = await fetch(
          `${API_URL}/api/ndb/information-types`,
        )

        if (!response.ok) {
          throw new Error('Unable to load information types')
        }

        const data = await response.json()

        setInformationTypes(
          (data.informationTypes || []).slice(0, 3),
        )
      } catch {
        setInformationTypes([])
      } finally {
        setDataLoading(false)
      }
    }

    loadInformationTypes()
  }, [topic.slug])

  return (
    <LearningLayout activePage="learn">
      <button
        className="lesson-back-button"
        type="button"
        onClick={() => navigate('/privacy-learning/learn')}
      >
        ← Back to Learning Hub
      </button>

      <section className="lesson-heading">
        <p className="lesson-label">
          LESSON {topic.number}
        </p>

        <h1>{topic.title}</h1>

        <p>{topic.description}</p>
      </section>

      <div className="lesson-grid">
        <section className="lesson-main-card">
          <div className="lesson-section">
            <h2>What does it mean?</h2>

            <p>{topic.meaning}</p>
          </div>

          <div className="lesson-section">
            <h2>Example</h2>

            <p>{topic.example}</p>
          </div>

          <div className="lesson-section">
            <h2>Why does it matter?</h2>

            <p>{topic.importance}</p>
          </div>
        </section>

        <aside className="lesson-side">
          <div className="lesson-tip-card">
            <p className="lesson-tip-label">PRIVACY TIP</p>

            <h2>{topic.tipTitle}</h2>

            <p>{topic.tip}</p>
          </div>

          {topic.slug === 'data-collection' && (
            <div className="lesson-insight-card">
              <p className="lesson-insight-label">
                REAL-WORLD INSIGHT
              </p>

              <h2>
                Personal information in reported data breaches
              </h2>

              <p className="lesson-insight-description">
                OAIC data shows the types of personal information
                involved in reported data breach notifications.
              </p>

              {dataLoading ? (
                <p className="lesson-insight-message">
                  Loading Australian data...
                </p>
              ) : informationTypes.length > 0 ? (
                <div className="lesson-insight-list">
                  {informationTypes.map((item) => (
                    <div
                      className="lesson-insight-item"
                      key={item.informationType}
                    >
                      <span>{item.informationType}</span>

                      <strong>{item.notifications}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lesson-insight-message">
                  Real-world data is unavailable right now.
                </p>
              )}

              <p className="lesson-insight-source">
                Source: OAIC Notifiable Data Breaches
              </p>
            </div>
          )}

          <button
            className="lesson-activity-button"
            type="button"
            onClick={() =>
              navigate(
                `/privacy-learning/learn/${topic.slug}/activity`,
              )
            }
          >
            Start Activity
          </button>
        </aside>
      </div>
    </LearningLayout>
  )
}

export default LessonDetail