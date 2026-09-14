import { practiceQuestions } from '../data/practiceQuestions'

const PRACTICE_KEY = 'consent-assistant-practice'

export const emptyPracticeState = {
  questionIds: [],
  choices: {},
  completed: false,
}

function shuffle(items) {
  const next = [...items]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }

  return next
}

export function selectPracticeQuestions(questions = practiceQuestions, count = 3) {
  const grouped = questions.reduce((groups, question) => {
    if (!groups[question.topic]) {
      groups[question.topic] = []
    }

    groups[question.topic].push(question)
    return groups
  }, {})

  const selected = []
  const usedIds = new Set()

  for (const topic of shuffle(Object.keys(grouped))) {
    if (selected.length >= count) {
      break
    }

    const [question] = shuffle(grouped[topic])
    selected.push(question)
    usedIds.add(question.id)
  }

  if (selected.length < count) {
    const remaining = shuffle(
      questions.filter((question) => !usedIds.has(question.id)),
    )
    selected.push(...remaining.slice(0, count - selected.length))
  }

  return selected.slice(0, count)
}

export function loadPracticeState() {
  try {
    const stored = localStorage.getItem(PRACTICE_KEY)

    if (!stored) {
      return { ...emptyPracticeState }
    }

    const parsed = JSON.parse(stored)

    return {
      ...emptyPracticeState,
      ...parsed,
      choices: parsed.choices || {},
      questionIds: Array.isArray(parsed.questionIds) ? parsed.questionIds : [],
    }
  } catch {
    return { ...emptyPracticeState }
  }
}

export function savePracticeState(state) {
  try {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors in private browsing.
  }

  return state
}

export function getQuestionById(id) {
  return practiceQuestions.find((question) => question.id === id) || null
}

export function getSessionQuestions(state = loadPracticeState()) {
  return state.questionIds.map((id) => getQuestionById(id)).filter(Boolean)
}

export function getCompletedCount(state = loadPracticeState()) {
  return getSessionQuestions(state).filter(
    (question) => state.choices[question.id],
  ).length
}

export function getPracticeStatus(state = loadPracticeState()) {
  if (!state.questionIds.length) {
    return 'not_started'
  }

  if (state.completed || getCompletedCount(state) >= 3) {
    return 'completed'
  }

  return 'in_progress'
}

export function getExploredTopics(state = loadPracticeState()) {
  return [
    ...new Set(getSessionQuestions(state).map((question) => question.topic)),
  ]
}

export function getResumeIndex(state = loadPracticeState()) {
  const questions = getSessionQuestions(state)
  const unanswered = questions.findIndex(
    (question) => !state.choices[question.id],
  )

  if (unanswered === -1) {
    return questions.length ? questions.length - 1 : 0
  }

  return unanswered
}

export function startPracticeSession() {
  const selected = selectPracticeQuestions()

  return savePracticeState({
    questionIds: selected.map((question) => question.id),
    choices: {},
    completed: false,
  })
}

export function savePracticeChoice(questionId, option) {
  const state = loadPracticeState()
  const choices = {
    ...state.choices,
    [questionId]: option,
  }
  const questions = getSessionQuestions(state)
  const completed =
    questions.length > 0 && questions.every((question) => choices[question.id])

  return savePracticeState({
    ...state,
    choices,
    completed,
  })
}

export function markPracticeComplete() {
  const state = loadPracticeState()

  return savePracticeState({
    ...state,
    completed: getCompletedCount(state) >= 3,
  })
}

export function getTopicIcon(topic) {
  if (topic === 'Data Sharing') {
    return 'share'
  }

  if (topic === 'Data Retention') {
    return 'clock'
  }

  if (topic === 'User Control' || topic === 'Purpose of Use') {
    return 'control'
  }

  return 'location'
}
