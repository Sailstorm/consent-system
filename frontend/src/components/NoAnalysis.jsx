import { Link } from 'react-router-dom'
import Icon from './Icon'

// Shown on result pages when there is no checked policy in this tab.
function NoAnalysis() {
  return (
    <section className="empty-state">
      <span className="icon-tile">
        <Icon name="magnifier" />
      </span>
      <h1>There&apos;s no policy to show yet</h1>
      <p className="lead">
        Explanations are kept only in this browser tab, and are removed when
        you close it. Check a policy to see its explanation here.
      </p>
      <Link to="/privacy-assistant" className="btn btn--primary btn--large">
        Check a privacy policy
        <Icon name="arrow-right" />
      </Link>
    </section>
  )
}

export default NoAnalysis
