import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  loadAnalysisState,
  saveAnalysisFailure,
  saveAnalysisResult,
  startAnalysis,
} from '../utils/analysisState'
import '../styles/processing.css'

const AI_URL =
  import.meta.env.VITE_AI_URL ??
  'http://127.0.0.1:8000'

function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const started = useRef(false)

  const inputType =
    location.state?.inputType || 'text'

  const policyText =
    location.state?.policyText || ''

  const policyUrl =
    location.state?.policyUrl || ''

  const pdfFile =
    location.state?.pdfFile || null

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
          response = await fetch(
            `${AI_URL}/analyze-url`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                url: policyUrl,
              }),
            },
          )
        } else if (inputType === 'pdf') {
          const formData = new FormData()

          formData.append('file', pdfFile)

          response = await fetch(
            `${AI_URL}/analyze-pdf`,
            {
              method: 'POST',
              body: formData,
            },
          )
        } else {
          response = await fetch(
            `${AI_URL}/analyze`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: policyText,
              }),
            },
          )
        }

        if (!response.ok) {
          saveAnalysisFailure(sourceValue)
          return
        }

        const data = await response.json()

        const analysedPolicyText =
          data.policy_text ||
          policyText ||
          sourceValue

        saveAnalysisResult(
          analysedPolicyText,
          data.results,
        )
      } catch (error) {
        console.log(error)

        saveAnalysisFailure(sourceValue)
      }
    }

    analysePolicy()
  }, [
    inputType,
    navigate,
    pdfFile,
    policyText,
    policyUrl,
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      const analysis = loadAnalysisState()

      if (
        analysis.status === 'ready' &&
        analysis.analysisResult
      ) {
        navigate('/explanation', {
          state: {
            policyText: analysis.policyText,
            analysisResult: analysis.analysisResult,
          },
        })

        return
      }

      if (analysis.status === 'failed') {
        navigate('/analysis-failed', {
          state: {
            policyText: analysis.policyText,
          },
        })
      }
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [navigate])

  function goBack() {
    navigate('/privacy-assistant')
  }

  return (
    <div className="i3-processing-page">
      <PageHeader />

      <div className="i3-processing-back-row">
        <button
          type="button"
          className="i3-processing-page-back"
          onClick={goBack}
        >
          ← Back
        </button>
      </div>

      <main className="i3-processing-content">
        <section className="i3-processing-heading">
          <h1>Analysing your policy</h1>

          <p>
            We’re reviewing the privacy information in your
            policy.
          </p>
        </section>

        <div className="i3-processing-loader">
          <div className="i3-processing-ring"></div>

          <div className="i3-processing-logo-circle">
            <img
              src={`${import.meta.env.BASE_URL}logo2.jpg`}
              alt=""
            />
          </div>
        </div>

        <h2 className="i3-processing-reviewing">
          Reviewing your policy...
        </h2>

        <p className="i3-processing-wait">
          This may take a little while.
        </p>

        <section className="i3-processing-learning">
          <img
            src={`${import.meta.env.BASE_URL}status-bg-book.jpg`}
            alt=""
            className="i3-processing-learning-background"
          />

          <div className="i3-processing-book">
            📖
          </div>

          <div className="i3-processing-learning-copy">
            <span>WHILE YOU WAIT</span>

            <h3>Learn more about privacy</h3>

            <p>
              Explore a short privacy lesson while your
              policy is being analysed.
            </p>

            <small>
              Your analysis will continue while you learn.
            </small>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/privacy-learning/learn')
            }
          >
            Start a lesson
          </button>
        </section>

        <p className="i3-processing-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-processing-watermark"
      />
    </div>
  )
}

export default Processing