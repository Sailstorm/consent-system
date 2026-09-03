import Sidebar from '../components/Sidebar'
import '../styles/settings.css'

function HelpPrivacy() {
  return (
    <div className="static-page">
      <Sidebar activePage="help" />

      <main className="static-content">
        <div className="static-heading">
          <h1>Help & Privacy</h1>
          <p>
            Learn how Consent Assistant works and how your information is
            handled when you use it.
          </p>
        </div>

        <section className="help-section">
          <h2>How the app works</h2>
          <p>
            Consent Assistant has two main parts: an Overview dashboard with
            Australian privacy-related data, and a Privacy Assistant that turns
            pasted policy text into a clearer explanation.
          </p>
          <ul>
            <li>
              <strong>Overview</strong> shows breach notification statistics and
              organisation search results from public Australian datasets.
            </li>
            <li>
              <strong>Privacy Assistant</strong> analyses the text you paste and
              organises it into consent categories such as data collection,
              sharing, retention and user control.
            </li>
            <li>
              The tool explains what the policy says. It does not recommend
              whether you should agree or disagree.
            </li>
          </ul>
        </section>

        <section className="help-section">
          <h2>What happens to your policy text</h2>
          <p>When you use Privacy Assistant:</p>
          <ul>
            <li>
              The text you paste is sent to the analysis service to generate an
              explanation and consent summary.
            </li>
            <li>
              If you enable <strong>Keep draft text in this session</strong> in
              Settings, your draft may be stored in this browser&apos;s
              session storage until you clear it.
            </li>
            <li>
              Consent Assistant does not create a user account and does not
              permanently store your pasted policies in the frontend by default.
            </li>
          </ul>

          <div className="help-callout">
            Only paste policy text you are comfortable submitting for analysis.
            Avoid including unrelated personal information in the input box.
          </div>
        </section>

        <section className="help-section">
          <h2>Your device preferences</h2>
          <p>
            Settings such as text size and night theme are saved in
            your browser&apos;s local storage on this device only. They are not
            sent to a server.
          </p>
          <p>
            You can clear saved draft text at any time from{' '}
            <strong>Settings → Clear session</strong>.
          </p>
        </section>

        <section className="help-section">
          <h2>External data sources</h2>
          <p>
            Overview statistics come from public Australian sources, including:
          </p>
          <div className="help-links">
            <a
              href="https://www.oaic.gov.au/privacy/notifiable-data-breaches"
              target="_blank"
              rel="noreferrer"
            >
              OAIC Notifiable Data Breaches
            </a>
            <a
              href="https://asic.gov.au/"
              target="_blank"
              rel="noreferrer"
            >
              ASIC business names register
            </a>
          </div>
        </section>

        <section className="help-section">
          <h2>Important disclaimer</h2>
          <p>
            Consent Assistant is designed to support understanding, not to
            replace legal advice. Policy explanations may miss nuance or fail if
            the source text is incomplete.
          </p>
          <div className="help-callout">
            Always make your own privacy decision. If you need legal guidance,
            speak with a qualified professional.
          </div>
        </section>
      </main>
    </div>
  )
}

export default HelpPrivacy
