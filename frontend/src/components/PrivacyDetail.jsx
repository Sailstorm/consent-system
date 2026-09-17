import { useLocation, useNavigate } from 'react-router-dom'
import PolicyLayout from './PolicyLayout'
import '../styles/privacyDetail.css'

function PrivacyDetail({
  title,
  subtitle,
  statusLabel,
  statusText,
  statusType,
  sections,
  sourceText,
  interpretation,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const policyText = location.state?.policyText
  const analysisResult = location.state?.analysisResult

  return (
    <PolicyLayout activePage="analysis">
      <button
        className="back-explanation"
        onClick={() =>
          navigate('/explanation', {
            state: {
              policyText: policyText,
              analysisResult: analysisResult,
            },
          })
        }
      >
        ← Back to Explanation
      </button>

      <section className="detail-heading">
        <p className="detail-label">POLICY ASSISTANT</p>

        <h1>{title}</h1>

        <p>{subtitle}</p>
      </section>

      <div className={`detail-status ${statusType}`}>
        <span>{statusLabel}</span>
        <strong>{statusText}</strong>
      </div>

      <div className="detail-grid">
        <section className="detail-main-card">
          <h2>What the policy says in simple terms</h2>

          <div className="detail-sections">
            {sections.map((section) => (
              <div className="detail-section" key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="source-card">
          <h2>Relevant source text</h2>

          <div className="source-box">
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {sourceText}
            </p>
          </div>

          <div className="interpretation-box">
            <h3>Interpretation</h3>
            <p>{interpretation}</p>
          </div>

          <button className="source-link">
            Source: submitted privacy text
          </button>
        </section>
      </div>
    </PolicyLayout>
  )
}

export default PrivacyDetail