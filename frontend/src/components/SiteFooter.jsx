import { Link } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <div className="site-footer__brand">
            <Logo />
            <div>
              <h2>Consent Assistant</h2>
              <p className="muted">
                Plain-English explanations of privacy policies, made with
                older Victorians in mind.
              </p>
            </div>
          </div>

          <ul className="site-footer__promises" style={{ marginTop: '1.5rem' }}>
            <li>
              <Icon name="lock" />
              <span>We don&apos;t keep the policies you check.</span>
            </li>
            <li>
              <Icon name="book" />
              <span>You can always read the policy&apos;s own words.</span>
            </li>
            <li>
              <Icon name="info" />
              <span>This is general information, not legal advice.</span>
            </li>
          </ul>
        </div>

        <nav aria-label="Footer">
          <h2>Go to</h2>
          <ul>
            <li>
              <Link to="/privacy-assistant">Check a privacy policy</Link>
            </li>
            <li>
              <Link to="/privacy-learning">Learn about privacy</Link>
            </li>
            <li>
              <Link to="/privacy-learning/practice">Practise with questions</Link>
            </li>
            <li>
              <Link to="/risk-dashboard">Recent data breaches</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default SiteFooter
