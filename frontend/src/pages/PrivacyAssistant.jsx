import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { Disclaimer, Stepper } from '../components/ui'
import { loadDraftPolicy, saveDraftPolicy } from '../utils/settings'
import '../styles/pages/check.css'

const MAX_PDF_BYTES = 10 * 1024 * 1024

const METHODS = [
  {
    value: 'url',
    icon: 'link',
    title: 'Paste a web link',
    text: 'The address of the policy page.',
  },
  {
    value: 'text',
    icon: 'text',
    title: 'Paste the words',
    text: 'Copy the policy text and paste it in.',
  },
  {
    value: 'pdf',
    icon: 'file',
    title: 'Upload a PDF',
    text: 'A saved copy of the policy.',
  },
]

// Accept addresses typed without "https://", as many people do.
function normaliseUrl(value) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withScheme)
    return url.hostname.includes('.') ? url.href : null
  } catch {
    return null
  }
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function PrivacyAssistant() {
  const navigate = useNavigate()
  const location = useLocation()

  const initialText = location.state?.policyText || loadDraftPolicy() || ''

  const [method, setMethod] = useState(
    location.state?.inputType || (initialText ? 'text' : 'url'),
  )
  const [policyText, setPolicyText] = useState(initialText)
  const [policyUrl, setPolicyUrl] = useState(location.state?.policyUrl || '')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const fieldRef = useRef(null)

  function chooseMethod(value) {
    setMethod(value)
    setError('')
  }

  function showError(message) {
    setError(message)
    fieldRef.current?.focus()
  }

  function pickFile(file) {
    setError('')

    if (!file) {
      setPdfFile(null)
      return
    }

    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setPdfFile(null)
      setError('That file is not a PDF. Please choose a file ending in .pdf.')
      return
    }

    if (file.size > MAX_PDF_BYTES) {
      setPdfFile(null)
      setError(`That PDF is ${formatSize(file.size)}. Please choose one that is 10 MB or smaller.`)
      return
    }

    setPdfFile(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (method === 'url') {
      const url = normaliseUrl(policyUrl)

      if (url === '') {
        showError('Please paste the web address of the privacy policy.')
        return
      }

      if (!url) {
        showError('That doesn’t look like a web address. It should look like www.example.com.au/privacy.')
        return
      }

      navigate('/processing', { state: { inputType: 'url', policyUrl: url } })
      return
    }

    if (method === 'text') {
      const text = policyText.trim()

      if (!text) {
        showError('Please paste the words of the privacy policy.')
        return
      }

      saveDraftPolicy(text)

      if (text.length < 50) {
        navigate('/invalid-input')
        return
      }

      navigate('/processing', { state: { inputType: 'text', policyText: text } })
      return
    }

    if (!pdfFile) {
      showError('Please choose a PDF file.')
      return
    }

    navigate('/processing', { state: { inputType: 'pdf', pdfFile } })
  }

  const errorId = error ? 'policy-error' : undefined

  return (
    <Layout narrow>
      <Stepper current={1} />

      <header className="page-head">
        <h1>Check a privacy policy</h1>
        <p className="lead">
          Choose how you&apos;d like to give us the policy. We&apos;ll explain
          it in plain English.
        </p>
      </header>

      <form className="check-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="method-choices">
          <legend className="field-label">How would you like to give us the policy?</legend>

          <div className="method-grid">
            {METHODS.map((item) => (
              <div className="method" key={item.value}>
                <input
                  type="radio"
                  id={`method-${item.value}`}
                  name="method"
                  value={item.value}
                  checked={method === item.value}
                  onChange={() => chooseMethod(item.value)}
                />
                <label htmlFor={`method-${item.value}`}>
                  <span className="method__icon">
                    <Icon name={item.icon} />
                  </span>
                  <span className="method__title">{item.title}</span>
                  <span className="method__text">{item.text}</span>
                  <span className="method__tick" aria-hidden="true">
                    <Icon name="check" />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="method-panel" key={method}>
          {method === 'url' && (
            <>
              <label className="field-label" htmlFor="policy-url">
                Web address of the privacy policy
              </label>
              <span className="field-hint" id="policy-url-hint">
                For example: www.example.com.au/privacy
              </span>
              <input
                ref={fieldRef}
                id="policy-url"
                className="input"
                type="url"
                inputMode="url"
                autoComplete="off"
                spellCheck="false"
                value={policyUrl}
                onChange={(event) => {
                  setPolicyUrl(event.target.value)
                  setError('')
                }}
                aria-describedby={['policy-url-hint', errorId].filter(Boolean).join(' ')}
                aria-invalid={Boolean(error)}
              />
            </>
          )}

          {method === 'text' && (
            <>
              <label className="field-label" htmlFor="policy-text">
                The words of the privacy policy
              </label>
              <span className="field-hint" id="policy-text-hint">
                On the policy page, select all the words, copy them, then paste
                them here.
              </span>
              <textarea
                ref={fieldRef}
                id="policy-text"
                className="textarea"
                value={policyText}
                onChange={(event) => {
                  setPolicyText(event.target.value)
                  setError('')
                }}
                aria-describedby={['policy-text-hint', errorId].filter(Boolean).join(' ')}
                aria-invalid={Boolean(error)}
              />
              <div className="text-meta">
                <span className="muted">
                  {policyText.trim()
                    ? `${policyText.trim().split(/\s+/).length.toLocaleString('en-AU')} words`
                    : 'Nothing pasted yet'}
                </span>
                {policyText && (
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      setPolicyText('')
                      saveDraftPolicy('')
                      fieldRef.current?.focus()
                    }}
                  >
                    Clear the text
                  </button>
                )}
              </div>
            </>
          )}

          {method === 'pdf' && (
            <>
              <span className="field-label" id="policy-pdf-label">
                PDF file of the privacy policy
              </span>
              <span className="field-hint" id="policy-pdf-hint">
                PDF files only, up to 10 MB.
              </span>

              {pdfFile ? (
                <div className="file-chosen">
                  <span className="icon-tile">
                    <Icon name="file" />
                  </span>
                  <div className="file-chosen__name">
                    <strong>{pdfFile.name}</strong>
                    <span className="muted">{formatSize(pdfFile.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setPdfFile(null)
                      requestAnimationFrame(() => fieldRef.current?.focus())
                    }}
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div
                  className={`drop-zone${dragging ? ' is-dragging' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragging(false)
                    pickFile(event.dataTransfer.files?.[0] || null)
                  }}
                >
                  <input
                    ref={fieldRef}
                    id="policy-pdf"
                    type="file"
                    accept="application/pdf,.pdf"
                    className="visually-hidden"
                    onChange={(event) => pickFile(event.target.files?.[0] || null)}
                    aria-labelledby="policy-pdf-label"
                    aria-describedby={['policy-pdf-hint', errorId].filter(Boolean).join(' ')}
                  />
                  <span className="drop-zone__icon">
                    <Icon name="file" />
                  </span>
                  <label htmlFor="policy-pdf" className="btn btn--large">
                    Choose a PDF file
                  </label>
                  <span className="muted">or drag the file onto this box</span>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="field-error" id="policy-error" role="alert">
              <Icon name="alert-circle" />
              {error}
            </p>
          )}
        </div>

        <div className="notice check-notice">
          <Icon name="lock" />
          <div>
            <strong>What happens to the policy you give us</strong>
            <p>
              It is sent to our AI service, and to NVIDIA&apos;s AI platform
              outside Australia, to write your explanation. We don&apos;t keep
              it. Please remove any personal details, like your name or
              account number, before you give it to us.
            </p>
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--large check-submit">
          Explain this policy
          <Icon name="arrow-right" />
        </button>
      </form>

      <Disclaimer />
    </Layout>
  )
}

export default PrivacyAssistant
