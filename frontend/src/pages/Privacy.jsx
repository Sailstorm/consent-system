import { useState } from 'react'
import InfoPage from '../components/InfoPage'
import {
  clearSessionData,
  loadSettings,
  saveSettings,
} from '../utils/settings'
import '../styles/infoPage.css'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={checked ? 'info-toggle on' : 'info-toggle'}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="info-toggle-thumb" />
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
    <InfoPage
      title="How your information is handled"
      intro="Consent Assistant is designed to use only the information needed for this visit."
      items={[
        'What information is processed?',
        'Do I need an account?',
        'How is submitted text used?',
      ]}
      advice="You can use the main features without creating an account or providing personal contact details. Submitted policy text is used only to explain the current policy."
      actionLabel="Continue"
      actionPath="/privacy-learning"
    >
      <section className="info-extra">
        <h2>Session controls</h2>
        <p>
          Control how draft privacy policy text is handled in this browser.
        </p>

        <div className="info-extra-row">
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

        <div className="info-extra-row">
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

        <div className="info-extra-row">
          <div>
            <h3>Clear session data</h3>
            <p>
              Remove any saved draft privacy policy text from this browser.
            </p>
          </div>
          <button type="button" onClick={handleClearSession}>
            Clear session
          </button>
        </div>

        {cleared ? (
          <p className="info-extra-note">
            Session draft text has been cleared from this browser.
          </p>
        ) : null}
      </section>
    </InfoPage>
  )
}

export default Privacy
