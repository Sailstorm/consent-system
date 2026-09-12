import LearningLayout from '../components/LearningLayout'
import '../styles/learningPlaceholder.css'

function LearningAbout() {
  return (
    <LearningLayout activePage="about">
      <section className="learning-placeholder">
        <p className="learning-placeholder-label">PRIVACY LEARNING</p>

        <h1>About Privacy Learning</h1>

        <p>
          This section explains the purpose and structure of the privacy
          learning experience.
        </p>

        <div className="learning-placeholder-card">
          <span>About section</span>

          <h2>Ready for Iteration 2 development</h2>

          <p>
            More information about the learning experience can be added here
            later.
          </p>
        </div>
      </section>
    </LearningLayout>
  )
}

export default LearningAbout