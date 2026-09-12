import { useNavigate } from 'react-router-dom'
import GlobalHeader from '../components/GlobalHeader'
import GlobalFooter from '../components/GlobalFooter'
import '../styles/helpPrivacy.css'

function HelpPrivacy() {
  const navigate = useNavigate()

  return (
    <div className="help-page">
      <GlobalHeader />

      <main className="help-content">
        <section className="help-heading">
          <p className="help-label">HELP</p>

          <h1>Help</h1>

          <p>
            Find simple guidance for using Consent Assistant and understanding
            the information shown across the website.
          </p>
        </section>

        <section className="help-grid">
          <div className="help-card">
            <h2>Using Consent Assistant</h2>

            <p>
              Use Policy Assistant to review privacy policy text and see a
              clearer explanation of important privacy information.
            </p>

            <ul>
              <li>Paste a privacy policy or privacy notice.</li>
              <li>Select Analyse to start the review.</li>
              <li>Open each section to read more detail.</li>
              <li>Use the Consent Summary for a quick overview.</li>
            </ul>
          </div>

          <div className="help-card">
            <h2>Understanding your results</h2>

            <p>
              Analysis results are organised into privacy categories such as
              data collection, purpose, sharing, retention and user control.
            </p>

            <ul>
              <li>Information found means relevant policy text was identified.</li>
              <li>Not clearly stated means the policy may not explain that area.</li>
              <li>You can compare explanations with the original source text.</li>
              <li>The final privacy decision always stays with you.</li>
            </ul>
          </div>

          <div className="help-card">
            <h2>Your privacy comes first</h2>

            <p>
              Consent Assistant is designed to support understanding without
              requiring a user account for the main privacy functions.
            </p>

            <ul>
              <li>Only submit text you are comfortable analysing.</li>
              <li>Avoid adding unrelated personal information.</li>
              <li>Draft text can be cleared from your browser session.</li>
              <li>The tool does not provide legal advice.</li>
            </ul>
          </div>
        </section>

        <section className="help-start">
          <div>
            <h2>Need somewhere to start?</h2>

            <p>
              View a simple example before analysing a privacy policy of your
              own.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/policy-assistant/example')}
          >
            Try an Example →
          </button>
        </section>

        <section className="help-no-account">
          <strong>No personal contact information required</strong>

          <p>
            You can use the main privacy features without creating a personal
            account or providing an email address.
          </p>
        </section>
      </main>

      <GlobalFooter />
    </div>
  )
}

export default HelpPrivacy