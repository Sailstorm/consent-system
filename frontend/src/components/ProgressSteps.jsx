import '../styles/progressSteps.css'

const STEPS = [
  { number: 1, label: 'Input' },
  { number: 2, label: 'Explanation' },
  { number: 3, label: 'Consent Summary' },
]

function ProgressSteps({ current }) {
  return (
    <ol className="progress-steps" aria-label="Analysis progress">
      {STEPS.map((step) => {
        const status =
          step.number < current
            ? 'complete'
            : step.number === current
              ? 'current'
              : 'upcoming'

        return (
          <li
            key={step.number}
            className={`progress-step ${status}`}
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span className="progress-marker">{step.number}</span>
            <span className="progress-label">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default ProgressSteps
