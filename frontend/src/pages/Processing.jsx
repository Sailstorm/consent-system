import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import '../styles/processing.css'

const AI_URL = import.meta.env.VITE_AI_URL ?? 'http://127.0.0.1:8000'

function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const started = useRef(false)

  const policyText = location.state?.policyText

  useEffect(() => {
    if (started.current) {
      return
    }

    started.current = true

    if (!policyText) {
      navigate('/privacy-assistant')
      return
    }

    async function analysePolicy() {
      try {
        const response = await fetch(`${AI_URL}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policy_text: policyText,
          }),
        })

        if (!response.ok) {
          navigate('/analysis-failed')
          return
        }

        const data = await response.json()

        navigate('/explanation', {
          state: {
            policyText: policyText,
            analysisResult: data.output,
          },
        })
      } catch (error) {
        console.log(error)
        navigate('/analysis-failed')
      }
    }

    analysePolicy()
  }, [navigate, policyText])

  return (
    <div className="processing-page">
      <Sidebar activePage="assistant" />

      <main className="processing-content">
        <div className="processing-heading">
          <h1>Analysing your privacy information</h1>
          <p>
            We are turning the text you submitted into a clearer explanation
            and structured consent summary.
          </p>
        </div>

        <div className="processing-steps">
          <div className="step">1 Input</div>
          <div className="step active">2 Explanation</div>
          <div className="step">3 Consent Summary</div>
        </div>

        <section className="processing-card">
          <div className="loading-circle"></div>

          <h2>Processing submitted text...</h2>

          <p className="processing-main-text">
            Checking for useful privacy information
          </p>

          <div className="processing-list">
            <p>
              Identifying data collection, use, sharing, retention and user
              control
            </p>
            <p>Preparing a plain-language explanation</p>
          </div>

          <div className="processing-note">
            Please wait a moment while the analysis is completed.
            <br />
            Your original text remains available for comparison.
          </div>
        </section>
      </main>
    </div>
  )
}

export default Processing