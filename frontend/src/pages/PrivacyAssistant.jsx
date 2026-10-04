import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  loadDraftPolicy,
  saveDraftPolicy,
} from '../utils/settings'
import '../styles/privacyAssistant.css'

function PrivacyAssistant() {
  const navigate = useNavigate()
  const location = useLocation()

  const [inputType, setInputType] = useState('text')

  const [policyText, setPolicyText] = useState(
    location.state?.policyText ||
      loadDraftPolicy() ||
      '',
  )

  const [policyUrl, setPolicyUrl] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [error, setError] = useState('')

  function changeInputType(type) {
    setInputType(type)
    setError('')
  }

  function analyseText() {
    const text = policyText.trim()

    if (!text) {
      setError('Please enter a privacy policy or notice.')
      return
    }

    if (text.length < 50) {
      navigate('/invalid-input')
      return
    }

    saveDraftPolicy(text)

    navigate('/processing', {
      state: {
        inputType: 'text',
        policyText: text,
      },
    })
  }

  function analyseUrl() {
    const url = policyUrl.trim()

    if (!url) {
      setError('Please enter a privacy policy URL.')
      return
    }

    navigate('/processing', {
      state: {
        inputType: 'url',
        policyUrl: url,
      },
    })
  }

  function analysePdf() {
    if (!pdfFile) {
      setError('Please choose a PDF file.')
      return
    }

    if (pdfFile.type !== 'application/pdf') {
      setError('Please choose a PDF file.')
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (pdfFile.size > maxSize) {
      setError('The PDF must be 10 MB or smaller.')
      return
    }

    navigate('/processing', {
      state: {
        inputType: 'pdf',
        pdfFile,
      },
    })
  }

  function handleAnalyse() {
    setError('')

    if (inputType === 'text') {
      analyseText()
      return
    }

    if (inputType === 'url') {
      analyseUrl()
      return
    }

    if (inputType === 'pdf') {
      analysePdf()
    }
  }

  const canAnalyse =
    (inputType === 'text' &&
      policyText.trim().length > 0) ||
    (inputType === 'url' &&
      policyUrl.trim().length > 0) ||
    (inputType === 'pdf' && pdfFile)

  return (
    <div className="i3-assistant-page">
      <header className="i3-assistant-header">
        <div className="i3-assistant-brand">
          <img
            src="/logo2.jpg"
            alt="Consent Assistant"
            className="i3-assistant-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-assistant-back"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
      </header>

      <main className="i3-assistant-content">
        <section className="i3-assistant-heading">
          <h1>Upload your privacy policy</h1>

          <p>
            Choose how you would like to provide the policy.
          </p>
        </section>

        <div className="i3-assistant-tabs">
          <button
            type="button"
            className={
              inputType === 'url'
                ? 'i3-assistant-tab active'
                : 'i3-assistant-tab'
            }
            onClick={() => changeInputType('url')}
          >
            Paste Link
          </button>

          <button
            type="button"
            className={
              inputType === 'text'
                ? 'i3-assistant-tab active'
                : 'i3-assistant-tab'
            }
            onClick={() => changeInputType('text')}
          >
            Paste text
          </button>

          <button
            type="button"
            className={
              inputType === 'pdf'
                ? 'i3-assistant-tab active'
                : 'i3-assistant-tab'
            }
            onClick={() => changeInputType('pdf')}
          >
            Upload a file
          </button>
        </div>

        {inputType === 'url' && (
          <section className="i3-url-card">
            <div className="i3-url-icon">
              ↗
            </div>

            <h2>Paste Privacy Policy URL</h2>

            <p>
              Enter the link to the privacy policy you want
              to analyse.
            </p>

            <input
              type="url"
              value={policyUrl}
              onChange={(event) => {
                setPolicyUrl(event.target.value)
                setError('')
              }}
              placeholder="https://example.com/privacy-policy/"
            />
          </section>
        )}

        {inputType === 'text' && (
          <section className="i3-text-card">
            <textarea
              value={policyText}
              onChange={(event) => {
                setPolicyText(event.target.value)
                setError('')
              }}
              placeholder="Paste the privacy policy text here..."
            />

            <span className="i3-character-count">
              {policyText.length} characters
            </span>
          </section>
        )}

        {inputType === 'pdf' && (
          <section className="i3-upload-card">
            <div className="i3-upload-icon">
              ⇧
            </div>

            <h2>Upload Privacy Policy</h2>

            <p>
              Choose a PDF file from your device.
            </p>

            <label
              className="i3-browse-button"
              htmlFor="policy-pdf"
            >
              Browse files
            </label>

            <input
              id="policy-pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="i3-file-input"
              onChange={(event) => {
                const file =
                  event.target.files?.[0] || null

                setPdfFile(file)
                setError('')
              }}
            />

            {pdfFile ? (
              <p className="i3-selected-file">
                Selected: {pdfFile.name}
              </p>
            ) : (
              <span className="i3-file-help">
                PDF • maximum 10 MB
              </span>
            )}
          </section>
        )}

        {error && (
          <p className="i3-assistant-error">
            {error}
          </p>
        )}

        <button
          type="button"
          className={
            canAnalyse
              ? 'i3-assistant-analyse active'
              : 'i3-assistant-analyse'
          }
          onClick={handleAnalyse}
        >
          Analyse Policy
        </button>

        <p className="i3-assistant-help">
          {inputType === 'url' &&
            'Paste a privacy policy link to enable analysis.'}

          {inputType === 'text' &&
            'Paste the privacy policy text to enable analysis.'}

          {inputType === 'pdf' &&
            'Upload a privacy policy to enable analysis.'}
        </p>

        <p className="i3-assistant-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src="/ca-watermark.png"
        alt=""
        className="i3-assistant-watermark"
      />
    </div>
  )
}

export default PrivacyAssistant