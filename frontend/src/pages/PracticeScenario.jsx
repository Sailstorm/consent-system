import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { BackLink } from '../components/ui'
import { getLesson } from '../data/lessons'
import {
  getCurrentQuestion,
  getSessionQuestions,
  getShuffledOptions,
  getTopicBySlug,
  isAnswerCorrect,
  loadPracticeState,
  moveToNextQuestion,
  savePracticeChoice,
} from '../utils/practice'
import '../styles/pages/learn.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

// One question. Keyed by question id, so each new question starts fresh.
function Question({ question, savedChoice, isLast, autoFocus, onChoose, onNext }) {
  const [selected, setSelected] = useState(savedChoice)
  const [options] = useState(() => getShuffledOptions(question))
  const feedbackRef = useRef(null)
  const questionRef = useRef(null)

  const answered = Boolean(selected)
  const isCorrect = answered && isAnswerCorrect(question, selected)

  // Move focus to the new question, so screen readers announce it.
  useEffect(() => {
    if (autoFocus) {
      questionRef.current?.focus({ preventScroll: true })
    }
  }, [autoFocus])

  function choose(option) {
    if (answered) {
      return
    }

    setSelected(option)
    onChoose(option)
    requestAnimationFrame(() => feedbackRef.current?.focus({ preventScroll: true }))
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 120)
  }

  function optionState(option) {
    if (!answered) {
      return ''
    }

    if (option === question.correctAnswer) {
      return 'is-correct'
    }

    return option === selected ? 'is-wrong' : 'is-other'
  }

  return (
    <section className="quiz">
      <h1 className="quiz__question" ref={questionRef} tabIndex={-1}>
        {question.question}
      </h1>

      <p className="muted quiz__hint">
        {answered ? 'Your answer is marked below.' : 'Choose the answer you think is best.'}
      </p>

      <ul className="options" role="list">
        {options.map((option, index) => {
          const state = optionState(option)

          return (
            <li key={option} style={{ '--i': index }}>
              <button
                type="button"
                className={`option ${state}`}
                onClick={() => choose(option)}
                aria-disabled={answered}
                aria-pressed={option === selected}
              >
                <span className="option__letter" aria-hidden="true">
                  {state === 'is-correct' ? (
                    <Icon name="check" />
                  ) : state === 'is-wrong' ? (
                    <Icon name="close" />
                  ) : (
                    LETTERS[index]
                  )}
                </span>
                <span className="option__text">{option}</span>
                {state === 'is-correct' && <span className="visually-hidden"> (right answer)</span>}
                {state === 'is-wrong' && (
                  <span className="visually-hidden"> (your answer, not right)</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {answered && (
        <div
          className={`feedback ${isCorrect ? 'feedback--right' : 'feedback--wrong'}`}
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
        >
          <h2 className="feedback__title">
            <Icon name={isCorrect ? 'check-circle' : 'info'} />
            {isCorrect ? 'That’s right' : 'Not quite'}
          </h2>

          {!isCorrect && (
            <p className="feedback__answer">
              <strong>The best answer is:</strong> {question.correctAnswer}
            </p>
          )}

          <p>
            <strong>Why: </strong>
            {question.explanation}
          </p>

          <button type="button" className="btn btn--primary btn--large" onClick={onNext}>
            {isLast ? 'Finish' : 'Next question'}
            <Icon name="arrow-right" />
          </button>
        </div>
      )}
    </section>
  )
}

function PracticeScenario() {
  const { topicId } = useParams()
  const topic = getTopicBySlug(topicId)

  const [practiceState, setPracticeState] = useState(loadPracticeState)
  const [finished, setFinished] = useState(false)
  const [moved, setMoved] = useState(false)

  const question = getCurrentQuestion(practiceState)
  const questions = getSessionQuestions(practiceState)

  if (!topic || (!finished && (!question || practiceState.selectedTopic !== topic.key))) {
    return <Navigate to="/privacy-learning/practice" replace />
  }

  const lesson = getLesson(topic.slug)

  if (finished) {
    const right = questions.filter((item) =>
      isAnswerCorrect(item, practiceState.choices[item.id]),
    ).length

    return (
      <Layout narrow>
        <section className="practice-finished">
          <span className="practice-finished__badge">
            <Icon name="star" />
          </span>
          <p className="eyebrow">{topic.title}</p>
          <h1>You answered every question</h1>
          <p className="lead">
            {right} of {questions.length} were right first time. Every
            question you answered, right or wrong, helps you spot these things
            in real policies.
          </p>

          <div className="btn-row">
            <Link to="/privacy-learning/practice" className="btn btn--primary btn--large">
              Practise another topic
              <Icon name="arrow-right" />
            </Link>
            <Link to={`/privacy-learning/learn/${topic.slug}`} className="btn btn--large">
              Read the lesson again
            </Link>
          </div>
        </section>
      </Layout>
    )
  }

  const isLast = practiceState.currentIndex >= questions.length - 1
  const answeredHere = Boolean(practiceState.choices[question.id])

  function next() {
    const updated = moveToNextQuestion()
    setPracticeState(updated)

    if (isLast) {
      setFinished(true)
      return
    }

    setMoved(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout narrow>
      <BackLink to="/privacy-learning/practice">Stop for now (your place is saved)</BackLink>

      <div className="quiz-progress">
        <div className="quiz-progress__text">
          <span className="eyebrow">{topic.title}</span>
          <span className="muted">
            Question <strong>{practiceState.currentIndex + 1}</strong> of {questions.length}
          </span>
        </div>
        <div
          className="meter"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={practiceState.currentIndex}
          aria-label="Questions answered"
        >
          <div
            className="meter__fill"
            style={{ width: `${(practiceState.currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Question
        key={question.id}
        question={question}
        savedChoice={practiceState.choices[question.id] || ''}
        isLast={isLast}
        autoFocus={moved}
        onChoose={(option) => setPracticeState(savePracticeChoice(question.id, option))}
        onNext={next}
      />

      {lesson && !answeredHere && (
        <p className="quiz__lesson muted">
          Not sure?{' '}
          <Link to={`/privacy-learning/learn/${lesson.slug}`}>
            Read the lesson on {lesson.title.toLowerCase()}
          </Link>
          . Your place here is saved.
        </p>
      )}
    </Layout>
  )
}

export default PracticeScenario
