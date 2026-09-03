import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ProgressSteps from '../components/ProgressSteps'
import {
  loadDraftPolicy,
  loadSettings,
  saveDraftPolicy,
} from '../utils/settings'
import '../styles/privacyAssistant.css'

function PrivacyAssistant() {
  const location = useLocation()
  const navigate = useNavigate()
  const settings = loadSettings()

  const [policyText, setPolicyText] = useState(
    location.state?.policyText ||
      (settings.keepSession ? loadDraftPolicy() : '') ||
      ''
  )
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loadSettings().keepSession) {
      return
    }

    saveDraftPolicy(policyText)
  }, [policyText])

  const handleClear = () => {
    setPolicyText('')
    setError('')
    saveDraftPolicy('')
  }

  const handleAnalyse = () => {
    const text = policyText.trim()

    if (!text) {
      setError('Please enter privacy policy content before continuing.')
      return
    }

    if (text.length < 50) {
      setError('')
      navigate('/invalid-input')
      return
    }

    setError('')

    navigate('/processing', {
      state: {
        policyText: text,
      },
    })
  }

  return (
    <div className="assistant-page">
      <Sidebar activePage="assistant" />

      <main className="assistant-content">
        <div className="assistant-heading">
          <h1>Privacy Assistant</h1>
          <p>
            Paste a privacy policy or notice and get a clearer explanation
            before you decide.
          </p>
        </div>

        <ProgressSteps current={1} />

        <section className="input-card">
          <div className="input-heading">
            <h2>Enter privacy information</h2>
            <p>
              Only the text you paste here will be analysed. The tool does not
              make your final decision for you. Please enter no more than 8,000
              characters.
            </p>
          </div>

          <textarea
            className={error ? 'policy-input input-error' : 'policy-input'}
            value={policyText}
            onChange={(event) => {
              setPolicyText(event.target.value)

              if (error) {
                setError('')
              }
            }}
            placeholder="Paste a Privacy Policy, Privacy Notice, or terms about personal data here..."
          />

          <div className="input-footer">
            <span>{policyText.length} characters</span>
            <span>Your text is used only for this analysis.</span>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="input-actions">
            <button className="clear-button" onClick={handleClear}>
              Clear
            </button>

            <button className="analyse-button" onClick={handleAnalyse}>
              Analyse
            </button>
          </div>
        </section>

        <section className="before-card">
          <h3>Before you continue</h3>
          <p>
            The explanation is for understanding only. It highlights what the
            policy says and what may not be clearly stated, so you can make
            your own privacy decision.
          </p>
        </section>
      </main>
    </div>
  )
}

export default PrivacyAssistant