import LearningLayout from '../components/LearningLayout'
import '../styles/learningPlaceholder.css'

function Learn() {
  return (
    <LearningLayout activePage="learn">
      <section className="learning-placeholder">
        <p className="learning-placeholder-label">PRIVACY LEARNING</p>

        <h1>Learn</h1>

        <p>
          Privacy learning topics and lesson content will be developed in this
          section.
        </p>

        <div className="learning-placeholder-card">
          <span>Learning section</span>

          <h2>Ready for Iteration 2 development</h2>

          <p>
            This page provides the shared layout and navigation for the
            learning feature.
          </p>
        </div>
      </section>
    </LearningLayout>
  )
}

export default Learn