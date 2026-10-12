import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { STATUS } from '../utils/categories'

export function BackLink({ to, state, children = 'Back' }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="back-link no-print"
      onClick={() => navigate(to, state ? { state } : undefined)}
    >
      <Icon name="arrow-left" />
      {children}
    </button>
  )
}

export function StatusBadge({ status }) {
  const info = STATUS[status] || STATUS.missing

  return (
    <span className={`status status--${status}`}>
      <Icon name={info.icon} />
      {info.label}
    </span>
  )
}

const STEPS = ['Give us the policy', 'Read the explanation', 'See your summary']

export function Stepper({ current }) {
  return (
    <ol className="stepper no-print" aria-label="Your progress">
      {STEPS.map((label, index) => {
        const number = index + 1
        const state =
          number < current ? 'is-done' : number === current ? 'is-current' : ''

        return (
          <li
            key={label}
            className={`stepper__step ${state}`}
            aria-current={number === current ? 'step' : undefined}
          >
            <span className="stepper__num">
              {number < current ? <Icon name="check" /> : number}
            </span>
            <span>
              <span className="visually-hidden">
                Step {number} of {STEPS.length}
                {number < current ? ', done' : ''}:{' '}
              </span>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function Disclaimer() {
  return (
    <p className="disclaimer">
      <Icon name="info" />
      <span>
        Consent Assistant explains what a privacy policy says to help you
        decide for yourself. It does not give legal advice.
      </span>
    </p>
  )
}

export function CardLink({ to, state, className = '', children, cta }) {
  return (
    <Link to={to} state={state} className={`card card--link ${className}`.trim()}>
      {children}
      {cta && (
        <span className="card__go">
          {cta}
          <Icon name="arrow-right" />
        </span>
      )}
    </Link>
  )
}
