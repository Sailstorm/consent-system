import LearningLayout from '../components/LearningLayout'
import '../styles/learningPlaceholder.css'

function Progress() {
  return (
    <LearningLayout activePage="progress">
      <section className="learning-placeholder">
        <p className="learning-placeholder-label">PRIVACY LEARNING</p>

        <h1>Learning Progress</h1>

        <p>
          This area will show learning completion and practice progress.
        </p>

        <div className="learning-placeholder-card">
          <span>Progress section</span>

          <h2>Ready for Iteration 2 development</h2>

          <p>
            Progress tracking can be added here without changing the shared
            navigation or page layout.
          </p>
        </div>
      </section>
    </LearningLayout>
  )
}

export default Progress