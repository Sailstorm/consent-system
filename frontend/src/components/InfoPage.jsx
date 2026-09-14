import { useNavigate } from 'react-router-dom'
import LearningLayout from './LearningLayout'
import '../styles/infoPage.css'

function InfoPage({
  headerActivePage = 'learning',
  title,
  intro,
  listTitle = '3 key questions',
  items = [],
  adviceTitle = 'Helpful advice',
  advice,
  actionLabel = 'Continue',
  actionPath = '/privacy-learning',
  children,
}) {
  const navigate = useNavigate()

  return (
    <LearningLayout
      activePage="info"
      headerActivePage={headerActivePage}
    >
      <section className="info-heading">
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
      </section>

      <section className="info-grid">
        <article className="info-questions-card">
          <h2>{listTitle}</h2>

          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="info-advice-card">
          <div>
            <h2>{adviceTitle}</h2>
            <p>{advice}</p>
          </div>

          <button
            className="info-continue"
            type="button"
            onClick={() => navigate(actionPath)}
          >
            {actionLabel}
          </button>
        </article>
      </section>

      {children}
    </LearningLayout>
  )
}

export default InfoPage
