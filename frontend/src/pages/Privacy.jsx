import { useState } from 'react'
import GlobalHeader from '../components/GlobalHeader'
import GlobalFooter from '../components/GlobalFooter'
import {
  clearSessionData,
  loadSettings,
  saveSettings,
} from '../utils/settings'
import '../styles/privacy.css'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={checked ? 'privacy-toggle on' : 'privacy-toggle'}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="privacy-toggle-thumb" />
    </button>
  )
}

function Privacy() {
  const [settings, setSettings] = useState(loadSettings)
  const [cleared, setCleared] = useState(false)

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value }

    setSettings(nextSettings)
    saveSettings(nextSettings)
    setCleared(false)
  }

  const handleClearSession = () => {
    clearSessionData()
    setCleared(true)
  }

  return (
    <div className="privacy-page">
      <GlobalHeader />

      <main className="privacy-content">
        <section className="privacy-heading">
          <p className="privacy-label">PRIVACY</p>

          <h1>Privacy</h1>

          <p>
            Consent Assistant is designed to use only the information needed
            to provide the current experience.
          </p>
        </section>

        <section className="privacy-grid">
          <div className="privacy-card">
            <h2>What we process</h2>

            <p>
              Privacy policy text you choose to submit can be processed to
              create the explanation and consent summary.
            </p>
          </div>

          <div className="privacy-card">
            <h2>What we do not need</h2>

            <p>
              You do not need to create an account or provide personal contact
              information to use the main privacy learning functions.
            </p>
          </div>

          <div className="privacy-card">
            <h2>How your text is used</h2>

            <p>
              Submitted policy text is used to produce the current analysis
              and help you understand the privacy information it contains.
            </p>
          </div>

          <div className="privacy-card">
            <h2>Important information</h2>

            <p>
              The system supports understanding only. It does not provide
              legal advice or make a consent decision for you.
            </p>
          </div>
        </section>

        <section className="privacy-settings">
          <div className="privacy-settings-heading">
            <h2>Privacy preferences</h2>

            <p>
              Control how your privacy policy text is handled in this browser
              session.
            </p>
          </div>

          <div className="privacy-setting-row">
            <div>
              <h3>Keep draft text in this session</h3>

              <p>
                Restore pasted policy text if you leave and return to Policy
                Assistant.
              </p>
            </div>

            <Toggle
              checked={settings.keepSession}
              onChange={(value) => updateSetting('keepSession', value)}
              label="Toggle keep draft text"
            />
          </div>

          <div className="privacy-setting-row">
            <div>
              <h3>Default detail level</h3>

              <p>
                Choose whether explanations use shorter summaries or fuller
                category text.
              </p>
            </div>

            <select
              value={settings.detailLevel}
              onChange={(event) =>
                updateSetting('detailLevel', event.target.value)
              }
            >
              <option value="summary">Summary</option>
              <option value="full">Full detail</option>
            </select>
          </div>

          <div className="privacy-setting-row">
            <div>
              <h3>Clear session data</h3>

              <p>
                Remove any saved draft privacy policy text from this browser
                session.
              </p>
            </div>

            <button
              className="clear-session-button"
              type="button"
              onClick={handleClearSession}
            >
              Clear session
            </button>
          </div>

          {cleared && (
            <div className="privacy-cleared">
              Session draft text has been cleared from this browser.
            </div>
          )}
        </section>

        <section className="privacy-principles">
          <h2>Our privacy principles</h2>

          <div className="privacy-principle-grid">
            <div>
              <strong>Collect less</strong>
              <p>Use only information needed for the current function.</p>
            </div>

            <div>
              <strong>Explain clearly</strong>
              <p>Tell users what information is being processed and why.</p>
            </div>

            <div>
              <strong>Be transparent</strong>
              <p>Keep the original policy available for comparison.</p>
            </div>
          </div>
        </section>

        <p className="privacy-note">
          Consent Assistant is an educational tool and does not replace legal
          or professional advice.
        </p>
      </main>

      <GlobalFooter />
    </div>
  )
}

export default Privacy