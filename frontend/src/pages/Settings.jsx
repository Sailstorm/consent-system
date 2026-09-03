import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import {
  clearSessionData,
  defaultSettings,
  loadSettings,
  saveSettings,
} from '../utils/settings'
import '../styles/settings.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={checked ? 'toggle on' : 'toggle'}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="toggle-thumb" />
    </button>
  )
}

function formatDate(value) {
  if (!value) {
    return 'Not available'
  }

  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings)
  const [sources, setSources] = useState([])
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    async function loadSources() {
      try {
        const response = await fetch(`${API_URL}/api/data-sources`)
        const data = await response.json()
        setSources(data.sources || [])
      } catch {
        setSources([])
      } finally {
        setSourcesLoading(false)
      }
    }

    loadSources()
  }, [])

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value }
    setSettings(nextSettings)
    saveSettings(nextSettings)
    setCleared(false)
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    saveSettings(defaultSettings)
    setCleared(false)
  }

  const handleClearSession = () => {
    clearSessionData()
    setCleared(true)
  }

  return (
    <div className="static-page">
      <Sidebar activePage="settings" />

      <main className="static-content">
        <div className="static-heading">
          <h1>Settings</h1>
          <p>
            Adjust how Consent Assistant looks and behaves. These preferences
            are saved on this device only.
          </p>
        </div>

        <section className="settings-section">
          <h2>Display & accessibility</h2>
          <p>Make the app easier to read and interact with.</p>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Text size</strong>
              <span>Increase or decrease the base text size across the app.</span>
            </div>
            <div className="setting-control">
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
          </div>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Night theme</strong>
              <span>Use a darker colour scheme across the app.</span>
            </div>
            <div className="setting-control">
              <Toggle
                checked={settings.nightTheme}
                onChange={(value) => updateSetting('nightTheme', value)}
                label="Toggle night theme"
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Privacy Assistant</h2>
          <p>Control how policy text is handled during your session.</p>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Keep draft text in this session</strong>
              <span>
                Restore pasted policy text if you leave and return to Privacy
                Assistant.
              </span>
            </div>
            <div className="setting-control">
              <Toggle
                checked={settings.keepSession}
                onChange={(value) => updateSetting('keepSession', value)}
                label="Toggle keep draft text"
              />
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Default detail level</strong>
              <span>
                Choose whether explanations show shorter summaries or fuller
                category text.
              </span>
            </div>
            <div className="setting-control">
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
          </div>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Clear session data</strong>
              <span>
                Remove any saved draft policy text from this browser session.
              </span>
            </div>
            <div className="setting-control">
              <button
                type="button"
                className="action-button danger"
                onClick={handleClearSession}
              >
                Clear session
              </button>
            </div>
          </div>

          {cleared && (
            <div className="settings-note">
              Session draft text has been cleared from this browser.
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2>Overview data sources</h2>
          <p>
            Read-only information about the Australian datasets shown on the
            Overview page.
          </p>

          {sourcesLoading ? (
            <div className="settings-note">Loading data source details…</div>
          ) : sources.length === 0 ? (
            <div className="settings-note">
              Data source details are unavailable right now. Check that the
              backend API is running.
            </div>
          ) : (
            <div className="source-list">
              {sources.map((source) => (
                <div className="source-item" key={source.code}>
                  <strong>{source.name}</strong>
                  <span>{source.agency}</span>
                  <span>
                    Refresh frequency: {source.refreshFrequency || 'Not set'}
                  </span>
                  <span>
                    Last successful import:{' '}
                    {formatDate(source.lastSuccessfulImport)}
                  </span>
                  {source.sourceUrl && (
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View original source
                    </a>
                  )}
                  <span className="status-pill">
                    Licence: {source.licence || 'Not specified'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2>About</h2>
          <p>
            Consent Assistant helps you understand privacy policies and explore
            Australian privacy-related data. It highlights what a policy says and
            what may not be clearly stated.
          </p>

          <div className="settings-note">
            This tool provides information for understanding only. It does not
            give legal advice or make consent decisions for you.
          </div>

          <div className="setting-row">
            <div className="setting-copy">
              <strong>Reset settings</strong>
              <span>Restore all preferences on this device to their defaults.</span>
            </div>
            <div className="setting-control">
              <button
                type="button"
                className="action-button"
                onClick={handleReset}
              >
                Reset defaults
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Settings
