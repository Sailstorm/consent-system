import { useEffect, useState } from 'react'
import {
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom'
import AnalysisStatus from '../components/AnalysisStatus'
import PracticeIcon from '../components/PracticeIcon'
import {
  getCurrentQuestion,
  getSessionQuestions,
  getShuffledOptions,
  getTopicBySlug,
  getTopicIcon,
  isAnswerCorrect,
  loadPracticeState,
  moveToNextQuestion,
  savePracticeChoice,
} from '../utils/practice'
import '../styles/practice.css'

function PracticeScenario() {
  const navigate = useNavigate()
  const { topicId } = useParams()

  const topic = getTopicBySlug(topicId)

  const [practiceState, setPracticeState] =
    useState(loadPracticeState)

  const question =
    getCurrentQuestion(practiceState)

  const questions =
    getSessionQuestions(practiceState)

  const savedChoice = question
    ? practiceState.choices[question.id] || ''
    : ''

  const [selected, setSelected] =
    useState(savedChoice)

  const [answered, setAnswered] =
    useState(Boolean(savedChoice))

  const [options, setOptions] = useState(() =>
    getShuffledOptions(question),
  )

  useEffect(() => {
    if (!question) {
      return
    }

    const choice =
      practiceState.choices[question.id] || ''

    setSelected(choice)
    setAnswered(Boolean(choice))
    setOptions(getShuffledOptions(question))
  }, [question?.id])

  if (
    !topic ||
    !question ||
    practiceState.selectedTopic !== topic.key
  ) {
    return (
      <Navigate
        to="/privacy-learning/practice"
        replace
      />
    )
  }

  const isCorrect =
    answered &&
    isAnswerCorrect(question, selected)

  const isLast =
    practiceState.currentIndex >=
    questions.length - 1

  const progress =
    ((practiceState.currentIndex + 1) /
      questions.length) *
    100

  function handleSelect(option) {
    if (answered) {
      return
    }

    const updatedState = savePracticeChoice(
      question.id,
      option,
    )

    setSelected(option)
    setAnswered(true)
    setPracticeState(updatedState)
  }

  function handleNext() {
    if (!answered) {
      return
    }

    const updatedState =
      moveToNextQuestion()

    if (isLast) {
      navigate('/privacy-learning/practice')
      return
    }

    setPracticeState(updatedState)
  }

  function getChoiceClass(option) {
    if (!answered) {
      return selected === option
        ? 'i3-question-choice selected'
        : 'i3-question-choice'
    }

    if (option === question.correctAnswer) {
      return 'i3-question-choice correct'
    }

    if (
      option === selected &&
      option !== question.correctAnswer
    ) {
      return 'i3-question-choice wrong'
    }

    return 'i3-question-choice answered'
  }

  return (
    <div className="i3-question-page">
      <header className="i3-question-header">
        <div className="i3-question-brand">
          <img
            src={`${import.meta.env.BASE_URL}logo2.jpg`}
            alt="Consent Assistant"
            className="i3-question-logo"
          />

          <span>Consent Assistant</span>
        </div>

        <button
          type="button"
          className="i3-question-back"
          onClick={() =>
            navigate('/privacy-learning/practice')
          }
        >
          ← Leave Practice
        </button>
      </header>

      <main className="i3-question-content">
        <div className="i3-question-top">
          <section>
            <p className="i3-question-label">
              PRIVACY PRACTICE
            </p>

            <h1>{topic.title}</h1>

            <p className="i3-question-subtitle">
              Test your understanding one question at a
              time.
            </p>
          </section>

          <div className="i3-question-analysis">
            <AnalysisStatus />
          </div>
        </div>

        <div className="i3-question-divider"></div>

        <section className="i3-question-progress">
          <div className="i3-question-progress-head">
            <span>
              Question {practiceState.currentIndex + 1}
              {' '}of {questions.length}
            </span>

            <span>
              {Math.round(progress)}% complete
            </span>
          </div>

          <div className="i3-question-progress-bar">
            <div
              className="i3-question-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        <div className="i3-question-layout">
          <section className="i3-question-card">
            <div className="i3-question-icon">
              <PracticeIcon
                type={getTopicIcon(topic.title)}
              />
            </div>

            <p className="i3-question-small-label">
              QUESTION
            </p>

            <h2>{question.question}</h2>

            <p className="i3-question-instruction">
              Choose the answer you think is correct.
            </p>

            <div className="i3-question-options">
              {options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className={getChoiceClass(option)}
                  disabled={answered}
                  onClick={() =>
                    handleSelect(option)
                  }
                >
                  <span className="i3-choice-letter">
                    {String.fromCharCode(
                      65 + index,
                    )}
                  </span>

                  <span>{option}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="i3-question-side">
            {!answered && (
              <section className="i3-question-help">
                <h3>Take your time</h3>

                <p>
                  Read each option carefully and choose the
                  answer that makes the most sense.
                </p>
              </section>
            )}

            {answered && (
              <section
                className={
                  isCorrect
                    ? 'i3-feedback-card correct'
                    : 'i3-feedback-card wrong'
                }
              >
                <div className="i3-feedback-title">
                  <span>
                    {isCorrect ? '✓' : '!'}
                  </span>

                  <h3>
                    {isCorrect
                      ? 'Correct'
                      : 'Not quite'}
                  </h3>
                </div>

                {!isCorrect && (
                  <div className="i3-correct-answer">
                    <strong>
                      Correct answer
                    </strong>

                    <p>
                      {question.correctAnswer}
                    </p>
                  </div>
                )}

                <div className="i3-feedback-explanation">
                  <strong>Why?</strong>

                  <p>
                    {question.explanation}
                  </p>
                </div>

                <button
                  type="button"
                  className="i3-question-next"
                  onClick={handleNext}
                >
                  {isLast
                    ? 'Finish Practice →'
                    : 'Next Question →'}
                </button>
              </section>
            )}
          </aside>
        </div>

        <button
          type="button"
          className="i3-question-leave"
          onClick={() =>
            navigate('/privacy-learning/practice')
          }
        >
          ← Leave Practice
        </button>

        <p className="i3-question-disclaimer">
          Consent Assistant provides information to support
          your review. It does not provide legal advice.
        </p>
      </main>

      <img
        src={`${import.meta.env.BASE_URL}ca-watermark.png`}
        alt=""
        className="i3-question-watermark"
      />
    </div>
  )
}

export default PracticeScenario