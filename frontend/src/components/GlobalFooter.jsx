import { useNavigate } from 'react-router-dom'
import '../styles/globalFooter.css'

function GlobalFooter() {
  const navigate = useNavigate()

  return (
    <footer className="global-footer">
      <div className="global-footer-inner">
        <div className="footer-brand">
          <h3>Consent Assistant</h3>
          <p>
            Designed for clarity and accessibility,
            <br />
            with older Victorians in mind.
          </p>
        </div>

        <div className="footer-links">
          <button type="button" onClick={() => navigate('/privacy')}>
            Privacy
          </button>

          <button type="button" onClick={() => navigate('/accessibility')}>
            Accessibility
          </button>

          <button type="button" onClick={() => navigate('/data-sources')}>
            Data sources
          </button>

          <button type="button" onClick={() => navigate('/help-privacy')}>
            Help
          </button>
        </div>

        <div className="footer-note">
          <span className="footer-note-icon"></span>
          <p>Check the original policy text anytime.</p>
        </div>

        <div className="footer-note">
          <span className="footer-note-icon round"></span>
          <p>Your text is used only for this analysis.</p>
        </div>
      </div>
    </footer>
  )
}

export default GlobalFooter