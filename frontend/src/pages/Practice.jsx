import LearningLayout from '../components/LearningLayout'
import '../styles/learningPlaceholder.css'

function Practice() {
  return (
    <LearningLayout activePage="practice">
      <section className="learning-placeholder">
        <p className="learning-placeholder-label">PRIVACY LEARNING</p>

        <h1>Practice</h1>

        <p>
          Practice activities will help users apply privacy concepts to simple
          scenarios.
        </p>

        <div className="learning-placeholder-card">
          <span>Practice section</span>

          <h2>Ready for Iteration 2 development</h2>

          <p>
            The shared page structure is ready for scenario and feedback
            functionality to be added.
          </p>
        </div>
      </section>
    </LearningLayout>
  )
}

export default Practice