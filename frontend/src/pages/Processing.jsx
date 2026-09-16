import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PolicyLayout from '../components/PolicyLayout'
import ProgressSteps from '../components/ProgressSteps'
import '../styles/processing.css'

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
        const response = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: policyText,
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
            analysisResult: data.results,
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
    <PolicyLayout activePage="analysis">
      <div className="processing-heading">
        <h1>Analysing your privacy information</h1>

        <p>
          We are turning the text you submitted into a clearer explanation
          and structured consent summary.
        </p>
      </div>

      <ProgressSteps current={2} />

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
    </PolicyLayout>
  )
}

export default Processing