import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import '../styles/privacyDetail.css'

function PrivacyDetail({
  title,
  subtitle,
  statusLabel,
  statusText,
  sections,
  sourceText,
  interpretation,
}) {
  const navigate = useNavigate()

  return (
    <div className="detail-page">
      <Sidebar activePage="assistant" />

      <main className="detail-content">
        <button
          className="back-explanation"
          onClick={() => navigate('/explanation')}
        >
          ← Back to Explanation
        </button>

        <div className="detail-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <div className="detail-status">
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
              <p>{sourceText}</p>
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
      </main>
    </div>
  )
}

export default PrivacyDetail