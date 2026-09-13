import { useNavigate } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import { markTopicCompleted } from '../utils/learningProgress'
import '../styles/learningActivity.css'

function LearningActivity({ topic }) {
  const navigate = useNavigate()

  const handleComplete = () => {
    markTopicCompleted(topic.slug)
    navigate('/privacy-learning/learn')
  }

  return (
    <LearningLayout activePage="learn">
      <button
        className="activity-back-button"
        type="button"
        onClick={() =>
          navigate(`/privacy-learning/learn/${topic.slug}`)
        }
      >
        ← Back to Lesson
      </button>

      <section className="activity-heading">
        <p className="activity-label">
          ACTIVITY {topic.number}
        </p>

        <h1>{topic.activity.title}</h1>

        <p>{topic.activity.description}</p>
      </section>

      <div className="activity-layout">
        <div className="activity-main">
          <section className="activity-recap">
            <p className="activity-section-label">QUICK RECAP</p>

            <h2>{topic.activity.recapTitle}</h2>

            <p>{topic.activity.recap}</p>
          </section>

          <section className="activity-concepts">
            {topic.activity.concepts.map((concept, index) => (
              <div
                className="activity-concept-card"
                key={concept.title}
              >
                <span>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <h3>{concept.title}</h3>

                <p>{concept.text}</p>
              </div>
            ))}
          </section>
        </div>

        <aside className="activity-takeaway">
          <p className="activity-section-label">
            LEARNING TAKEAWAY
          </p>

          <h2>{topic.activity.takeawayTitle}</h2>

          <p>{topic.activity.takeaway}</p>
        </aside>
      </div>

      <div className="activity-actions">
        <button
          className="activity-secondary-button"
          type="button"
          onClick={() =>
            navigate(`/privacy-learning/learn/${topic.slug}`)
          }
        >
          Back to Lesson
        </button>

        <button
          className="activity-primary-button"
          type="button"
          onClick={handleComplete}
        >
          Complete Lesson
        </button>
      </div>
    </LearningLayout>
  )
}

export default LearningActivity