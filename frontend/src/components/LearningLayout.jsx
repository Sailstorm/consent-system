import { useNavigate } from 'react-router-dom'
import PageHeader from './PageHeader'
import GlobalFooter from './GlobalFooter'
import LearningSidebar from './LearningSidebar'
import '../styles/learningLayout.css'

function LearningLayout({
  activePage = 'home',
  children,
}) {
  const navigate = useNavigate()

  function goBack() {
    navigate('/')
  }

  return (
    <div className="learning-layout-page">
      <PageHeader />

      <div className="learning-layout-back-row">
        <button
          type="button"
          className="learning-layout-back"
          onClick={goBack}
        >
          ← Back
        </button>
      </div>

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