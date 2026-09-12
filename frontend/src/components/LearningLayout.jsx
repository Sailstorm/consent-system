import GlobalHeader from './GlobalHeader'
import GlobalFooter from './GlobalFooter'
import LearningSidebar from './LearningSidebar'
import '../styles/learningLayout.css'

function LearningLayout({ activePage = 'home', children }) {
  return (
    <div className="learning-layout-page">
      <GlobalHeader activePage="learning" />

      <div className="learning-layout-body">
        <LearningSidebar activePage={activePage} />

        <div className="learning-layout-main">
          <div className="learning-layout-content">
            {children}
          </div>

          <GlobalFooter />
        </div>
      </div>
    </div>
  )
}

export default LearningLayout