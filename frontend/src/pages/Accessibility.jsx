import { useState } from 'react'
import InfoPage from '../components/InfoPage'
import { loadSettings, saveSettings } from '../utils/settings'
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

function Accessibility() {
  const [settings, setSettings] = useState(loadSettings)

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value }
    setSettings(nextSettings)
    saveSettings(nextSettings)
  }

  return (
    <InfoPage
      title="Designed for clarity and accessibility"
      intro="Consent Assistant is designed to make privacy information easier to read, understand and navigate."
      listTitle="What this page covers"
      items={[
        'Why the layout supports reading',
        'How to change display settings',
        'How navigation stays simple',
      ]}
      advice="Clear language, readable spacing and simple navigation are used throughout the site, with older Victorians in mind."
      actionLabel="Continue"
      actionPath="/privacy-learning"
    >
      <section className="info-extra">
        <h2>Display preferences</h2>
        <p>Adjust how the website looks on this device.</p>

        <div className="info-extra-row">
          <div>
            <h3>Text size</h3>
            <p>Increase or decrease the base text size across the website.</p>
          </div>
          <select
            id="text-size"
            value={settings.textSize}
            onChange={(event) => updateSetting('textSize', event.target.value)}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="info-extra-row">
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
    </InfoPage>
  )
}

export default Accessibility
