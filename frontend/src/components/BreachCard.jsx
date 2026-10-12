import Icon from './Icon'
import { formatAccounts, formatBreachDate } from '../utils/breaches'

function BreachCard({ breach, style }) {
  const dataClasses = Array.isArray(breach.dataClasses) ? breach.dataClasses : []

  return (
    <article className="breach" style={style}>
      <header className="breach__head">
        <h3>{breach.title}</h3>
        {breach.domain && <p className="muted">{breach.domain}</p>}
      </header>

      <dl className="breach__facts">
        <div>
          <dt>
            <Icon name="people" />
            How many
          </dt>
          <dd>{formatAccounts(breach.affectedAccounts)}</dd>
        </div>
        <div>
          <dt>
            <Icon name="calendar" />
            When it happened
          </dt>
          <dd>{formatBreachDate(breach.breachDate)}</dd>
        </div>
      </dl>

      {dataClasses.length > 0 && (
        <div className="breach__data">
          <p className="breach__data-label">Details that were exposed</p>
          <ul>
            {dataClasses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

export default BreachCard
