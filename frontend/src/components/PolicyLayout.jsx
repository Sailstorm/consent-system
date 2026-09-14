import GlobalHeader from './GlobalHeader'
import GlobalFooter from './GlobalFooter'
import PolicySidebar from './PolicySidebar'
import '../styles/policyLayout.css'

function PolicyLayout({ activePage = 'analysis', children }) {
  return (
    <div className="policy-layout-page">
      <GlobalHeader activePage="policy" />

      <div className="policy-layout-body">
        <PolicySidebar activePage={activePage} />

        <div className="policy-layout-main">
          <div className="policy-layout-content">
            {children}
          </div>

          <GlobalFooter />
        </div>
      </div>
    </div>
  )
}

export default PolicyLayout