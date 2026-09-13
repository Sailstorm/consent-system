import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import {
  getPracticeStatus,
  getSessionQuestions,
  loadPracticeState,
  savePracticeChoice,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeScenario() {
  const navigate = useNavigate()
  const { scenarioNumber } = useParams()
  const index = Number(scenarioNumber) - 1
  const state = loadPracticeState()
  const questions = getSessionQuestions(state)
  const question = questions[index]
  const status = getPracticeStatus(state)
  const savedChoice = question ? state.choices[question.id] || '' : ''
  const [selected, setSelected] = useState(savedChoice)

  useEffect(() => {
    setSelected(savedChoice)
  }, [savedChoice, question?.id])

  if (!question || status === 'not_started') {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  const handleSelect = (option) => {
    setSelected(option)
    savePracticeChoice(question.id, option)
  }

  const handleNext = () => {
    if (!selected) {
      return
    }

    if (index >= questions.length - 1) {
      navigate('/privacy-learning/practice/feedback')
      return
    }

    navigate(`/privacy-learning/practice/scenario/${index + 2}`)
  }

  return (
    <LearningLayout activePage="practice">
      <div className="practice-progress-row">
        <p className="practice-label">
          Scenario {index + 1} of {questions.length}
        </p>
        <span className="practice-topic">{question.topic}</span>
      </div>

      <section className="practice-scenario-card">
        <h2>{question.scenario}</h2>

        <div className="practice-options">
          {['A', 'B'].map((option) => (
            <button
              key={option}
              className={
                selected === option
                  ? 'practice-option selected'
                  : 'practice-option'
              }
              type="button"
              onClick={() => handleSelect(option)}
            >
              {question.options[option]}
            </button>
          ))}
        </div>

        <p className="practice-note">
          Your choice is saved. Combined feedback appears after Scenario 3.
        </p>
      </section>

      <div className="practice-actions">
        <button
          className="practice-next"
          type="button"
          disabled={!selected}
          onClick={handleNext}
        >
          {index >= questions.length - 1 ? 'View Feedback' : 'Next Question'}
        </button>

        {index > 0 ? (
          <button
            className="practice-secondary"
            type="button"
            onClick={() =>
              navigate(`/privacy-learning/practice/scenario/${index}`)
            }
          >
            Previous
          </button>
        ) : (
          <button
            className="practice-secondary"
            type="button"
            onClick={() => navigate('/privacy-learning/practice')}
          >
            Back to Practice
          </button>
        )}
      </div>
    </LearningLayout>
  )
}

export default PracticeScenario
