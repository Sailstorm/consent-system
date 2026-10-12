import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'

function NotFound() {
  return (
    <Layout narrow>
      <section className="empty-state">
        <span className="icon-tile">
          <Icon name="magnifier" />
        </span>
        <h1>We can&apos;t find that page</h1>
        <p className="lead">
          The link may be old, or the address may have a typing mistake.
        </p>
        <div className="btn-row">
          <Link to="/" className="btn btn--primary btn--large">
            Go to the home page
          </Link>
          <Link to="/privacy-assistant" className="btn btn--large">
            Check a privacy policy
          </Link>
        </div>
      </section>
    </Layout>
  )
}

export default NotFound
