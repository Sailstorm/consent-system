import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { BackLink, Stepper } from '../components/ui'
import { CATEGORIES } from '../utils/categories'
import {
  loadAnalysisState,
  saveAnalysisFailure,
  saveAnalysisResult,
  startAnalysis,
} from '../utils/analysisState'
import '../styles/pages/check.css'

const AI_URL = import.meta.env.VITE_AI_URL ?? 'http://127.0.0.1:8000'

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${rest}`
}

function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const started = useRef(false)
  const [elapsed, setElapsed] = useState(0)

  const inputType = location.state?.inputType || 'text'
  const policyText = location.state?.policyText || ''
  const policyUrl = location.state?.policyUrl || ''
  const pdfFile = location.state?.pdfFile || null

  useEffect(() => {
    if (started.current) {
      return
    }

    started.current = true

    async function analysePolicy() {
      let sourceValue = ''

      if (inputType === 'text') {
        if (!policyText) {
          navigate('/privacy-assistant')
          return
        }
        sourceValue = policyText
      }

      if (inputType === 'url') {
        if (!policyUrl) {
          navigate('/privacy-assistant')
          return
        }
        sourceValue = policyUrl
      }

      if (inputType === 'pdf') {
        if (!pdfFile) {
          navigate('/privacy-assistant')
          return
        }
        sourceValue = pdfFile.name
      }

      startAnalysis(sourceValue)

      try {
        let response

        if (inputType === 'url') {
          response = await fetch(`${AI_URL}/analyze-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: policyUrl }),
          })
        } else if (inputType === 'pdf') {
          const formData = new FormData()
          formData.append('file', pdfFile)

          response = await fetch(`${AI_URL}/analyze-pdf`, {
            method: 'POST',
            body: formData,
          })
        } else {
          response = await fetch(`${AI_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: policyText }),
          })
        }

        if (!response.ok) {
          saveAnalysisFailure(sourceValue)
          return
        }

        const data = await response.json()

        saveAnalysisResult(data.policy_text || policyText || sourceValue, data.results)
      } catch (error) {
        console.log(error)
        saveAnalysisFailure(sourceValue)
      }
    }

    analysePolicy()
  }, [inputType, navigate, pdfFile, policyText, policyUrl])

  // The request keeps running if the person leaves this page, so the
  // result is picked up from session storage.
  useEffect(() => {
    const timer = setInterval(() => {
      const analysis = loadAnalysisState()

      if (analysis.status === 'ready' && analysis.analysisResult) {
        navigate('/explanation', {
          replace: true,
          state: {
            policyText: analysis.policyText,
            analysisResult: analysis.analysisResult,
          },
        })
        return
      }

      if (analysis.status === 'failed') {
        navigate('/analysis-failed', {
          replace: true,
          state: { inputType, policyText, policyUrl, pdfFile },
        })
      }
    }, 500)

    return () => clearInterval(timer)
  }, [navigate, inputType, policyText, policyUrl, pdfFile])

  useEffect(() => {
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const slow = elapsed >= 75

  return (
    <Layout narrow>
      <BackLink to="/privacy-assistant" state={{ inputType, policyText, policyUrl }}>
        Change the policy
      </BackLink>

      <Stepper current={2} />

      <header className="page-head" role="status">
        <h1>Reading your policy…</h1>
        <p className="lead">
          {slow
            ? 'This is taking longer than usual. Long policies can take up to three minutes.'
            : 'This usually takes less than a minute. Please keep this page open.'}
        </p>
      </header>

      <section className="reading card" aria-labelledby="reading-title">
        <div className="reading__doc" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} className="reading__line" style={{ '--n': index }} />
          ))}
        </div>

        <div className="reading__list">
          <h2 id="reading-title" className="reading__title">
            We&apos;re looking for answers to five questions
          </h2>

          <ul>
            {CATEGORIES.map((category, index) => (
              <li key={category.key} style={{ '--n': index }}>
                <span className="reading__icon">
                  <Icon name={category.icon} />
                </span>
                {category.question}
              </li>
            ))}
          </ul>

          <p className="reading__time muted">
            Time so far: <strong>{formatElapsed(elapsed)}</strong>
          </p>
        </div>
      </section>

      <aside className="wait-card">
        <span className="icon-tile">
          <Icon name="book" />
        </span>
        <div>
          <h2>While you wait</h2>
          <p className="muted">
            Read a short lesson. We&apos;ll keep reading your policy and tell
            you when it&apos;s ready.
          </p>
        </div>
        <Link to="/privacy-learning" className="btn">
          Go to the lessons
          <Icon name="arrow-right" />
        </Link>
      </aside>
    </Layout>
  )
}

export default Processing
