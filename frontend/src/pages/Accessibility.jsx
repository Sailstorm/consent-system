import { useState } from 'react'
import GlobalHeader from '../components/GlobalHeader'
import GlobalFooter from '../components/GlobalFooter'
import { loadSettings, saveSettings } from '../utils/settings'
import '../styles/accessibility.css'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={checked ? 'access-toggle on' : 'access-toggle'}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="access-toggle-thumb" />
    </button>
  )
}

function Accessibility() {
  const [settings, setSettings] = useState(loadSettings)

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value }

    setSettings(nextSettings)
    saveSettings(nextSettings)
  }

  return (
    <div className="accessibility-page">
      <GlobalHeader />

      <main className="accessibility-content">
        <section className="accessibility-heading">
          <p className="accessibility-label">ACCESSIBILITY</p>

          <h1>Accessibility</h1>

          <p>
            Consent Assistant is designed to make privacy information easier
            to read, understand and navigate.
          </p>
        </section>

        <section className="display-section">
          <div className="display-heading">
            <h2>Display preferences</h2>

            <p>
              Adjust how the website looks on this device.
            </p>
          </div>

          <div className="display-row">
            <div>
              <h3>Text size</h3>
              <p>Increase or decrease the base text size across the website.</p>
            </div>

            <select
              value={settings.textSize}
              onChange={(event) =>
                updateSetting('textSize', event.target.value)
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="display-row">
            <div>
              <h3>Night theme</h3>
              <p>Use a darker colour scheme across the website.</p>
            </div>

            <Toggle
              checked={settings.nightTheme}
              onChange={(value) => updateSetting('nightTheme', value)}
              label="Toggle night theme"
            />
          </div>
        </section>

        <section className="accessibility-grid">
          <div className="accessibility-card">
            <h2>Clear language</h2>
            <p>
              Privacy information is explained using short and direct
              language where possible.
            </p>
          </div>

          <div className="accessibility-card">
            <h2>Readable design</h2>
            <p>
              Text, spacing and page structure are designed to make
              information easier to scan and read.
            </p>
          </div>

          <div className="accessibility-card">
            <h2>Simple navigation</h2>
            <p>
              Main functions are grouped into clear areas so users can move
              through the website more easily.
            </p>
          </div>

          <div className="accessibility-card">
            <h2>Keyboard accessibility</h2>
            <p>
              Buttons and interactive controls use standard web elements that
              support keyboard navigation.
            </p>
          </div>
        </section>

        <section className="accessibility-approach">
          <h2>Our accessibility approach</h2>

          <div className="approach-grid">
            <div>
              <strong>Easy to read</strong>
              <p>Clear text, spacing and visual structure.</p>
            </div>

            <div>
              <strong>Easy to understand</strong>
              <p>Simple explanations without unnecessary complexity.</p>
            </div>

            <div>
              <strong>Easy to navigate</strong>
              <p>Consistent pages, buttons and navigation.</p>
            </div>
          </div>
        </section>

        <p className="accessibility-note">
          Accessibility improvements will continue as the system develops.
        </p>
      </main>

      <GlobalFooter />
    </div>
  )
}

export default Accessibility