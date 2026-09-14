import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import LearningLayout from '../components/LearningLayout'
import PracticeIcon from '../components/PracticeIcon'
import {
  getPracticeStatus,
  getSessionQuestions,
  getTopicIcon,
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
      navigate('/privacy-learning/practice/ready')
      return
    }

    navigate(`/privacy-learning/practice/scenario/${index + 2}`)
  }

  const isLast = index >= questions.length - 1
  const cardTone = index === 1 ? 'card-blue' : 'card-mint'

  return (
    <LearningLayout activePage="practice">
      <div className="practise-progress-head">
        <h2>Consent Practice</h2>
        <span>
          Scenario {index + 1} of {questions.length}
        </span>
      </div>

      <div className="practise-progress-bar">
        <div
          className="practise-progress-fill"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="practise-topic">{question.topic}</p>

      <section className={`practise-scenario-card ${cardTone}`}>
        <span className="practise-scenario-dot" />
        <PracticeIcon type={getTopicIcon(question.topic)} />

        <h1>{question.scenario}</h1>
        <p>Choose one of the two options below.</p>
        <p className="practise-scenario-note">
          Your choice is saved. Combined feedback appears after Scenario 3.
        </p>

        <div className="practise-choice-row">
          {['A', 'B'].map((option) => (
            <button
              key={option}
              className={
                selected === option
                  ? 'practise-choice selected'
                  : 'practise-choice'
              }
              type="button"
              onClick={() => handleSelect(option)}
            >
              {question.options[option]}
            </button>
          ))}

          <button
            className="practise-next"
            type="button"
            disabled={!selected}
            onClick={handleNext}
          >
            {isLast ? 'View Feedback →' : 'Next Question →'}
          </button>
        </div>
      </section>

      <p className="practise-footnote">
        Feedback includes the meaning, privacy topic, practical tip and next
        action.
      </p>
    </LearningLayout>
  )
}

export default PracticeScenario
