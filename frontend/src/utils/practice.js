import questionBank from '../data/consentPracticeQuestions.json'

const PRACTICE_KEY = 'consent-assistant-practice'

export const practiceTopics = [
  {
    key: 'dataCollection',
    slug: 'data-collection',
    title: 'Data collection',
  },
  {
    key: 'purposeOfUse',
    slug: 'purpose-of-use',
    title: 'Purpose of use',
  },
  {
    key: 'dataSharing',
    slug: 'data-sharing',
    title: 'Data sharing',
  },
  {
    key: 'dataRetention',
    slug: 'data-retention',
    title: 'Data retention',
  },
  {
    key: 'userControl',
    slug: 'user-control',
    title: 'Your choices',
  },
]

export const emptyPracticeState = {
  selectedTopic: null,
  questionIds: [],
  currentIndex: 0,
  choices: {},
  completedQuestionIds: [],
  completedTopics: [],
  topicSessions: {},
}

function shuffle(items) {
  const next = [...items]

  for (
    let index = next.length - 1;
    index > 0;
    index -= 1
  ) {
    const swapIndex = Math.floor(
      Math.random() * (index + 1),
    )

    const current = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = current
  }

  return next
}

export function getTopicByKey(topicKey) {
  return (
    practiceTopics.find(
      (topic) => topic.key === topicKey,
    ) || null
  )
}

export function getTopicBySlug(slug) {
  return (
    practiceTopics.find(
      (topic) => topic.slug === slug,
    ) || null
  )
}

export function getTopicQuestions(topicKey) {
  const topic = questionBank.topics?.[topicKey]

  if (
    !topic ||
    !Array.isArray(topic.questions)
  ) {
    return []
  }

  return topic.questions
}

export function getQuestionById(id) {
  for (const topic of practiceTopics) {
    const question = getTopicQuestions(
      topic.key,
    ).find((item) => item.id === id)

    if (question) {
      return {
        ...question,
        topicKey: topic.key,
        topic: topic.title,
      }
    }
  }

  return null
}

function getSessionFromState(state) {
  return {
    selectedTopic: state.selectedTopic,
    questionIds: state.questionIds,
    currentIndex: state.currentIndex,
    choices: state.choices,
    completedQuestionIds:
      state.completedQuestionIds,
  }
}

export function loadPracticeState() {
  try {
    const stored =
      localStorage.getItem(PRACTICE_KEY)

    if (!stored) {
      return {
        ...emptyPracticeState,
        topicSessions: {},
      }
    }

    const parsed = JSON.parse(stored)

    const state = {
      ...emptyPracticeState,
      ...parsed,
      choices: parsed.choices || {},
      questionIds: Array.isArray(
        parsed.questionIds,
      )
        ? parsed.questionIds
        : [],
      completedQuestionIds: Array.isArray(
        parsed.completedQuestionIds,
      )
        ? parsed.completedQuestionIds
        : [],
      completedTopics: Array.isArray(
        parsed.completedTopics,
      )
        ? parsed.completedTopics
        : [],
      topicSessions:
        parsed.topicSessions &&
        typeof parsed.topicSessions ===
          'object'
          ? parsed.topicSessions
          : {},
    }

    // Keep progress created by the older
    // single-topic storage format.
    if (
      state.selectedTopic &&
      state.questionIds.length &&
      !state.topicSessions[
        state.selectedTopic
      ]
    ) {
      state.topicSessions = {
        ...state.topicSessions,
        [state.selectedTopic]:
          getSessionFromState(state),
      }
    }

    return state
  } catch {
    return {
      ...emptyPracticeState,
      topicSessions: {},
    }
  }
}

export function savePracticeState(state) {
  try {
    let nextState = {
      ...state,
      topicSessions:
        state.topicSessions || {},
    }

    // Save the current session under its topic.
    if (
      nextState.selectedTopic &&
      nextState.questionIds.length
    ) {
      nextState = {
        ...nextState,
        topicSessions: {
          ...nextState.topicSessions,
          [nextState.selectedTopic]:
            getSessionFromState(nextState),
        },
      }
    }

    localStorage.setItem(
      PRACTICE_KEY,
      JSON.stringify(nextState),
    )

    return nextState
  } catch {
    return state
  }
}

export function startTopicPractice(topicKey) {
  const questions =
    getTopicQuestions(topicKey)

  if (!questions.length) {
    return null
  }

  const shuffledQuestions =
    shuffle(questions)

  const state = loadPracticeState()

  return savePracticeState({
    ...state,
    selectedTopic: topicKey,
    questionIds: shuffledQuestions.map(
      (question) => question.id,
    ),
    currentIndex: 0,
    choices: {},
    completedQuestionIds: [],
  })
}

export function resumeTopicPractice(topicKey) {
  const state = loadPracticeState()

  const savedSession =
    state.topicSessions?.[topicKey]

  if (
    !savedSession ||
    !Array.isArray(
      savedSession.questionIds,
    ) ||
    !savedSession.questionIds.length
  ) {
    return null
  }

  return savePracticeState({
    ...state,
    selectedTopic: topicKey,
    questionIds:
      savedSession.questionIds,
    currentIndex:
      savedSession.currentIndex || 0,
    choices:
      savedSession.choices || {},
    completedQuestionIds:
      Array.isArray(
        savedSession.completedQuestionIds,
      )
        ? savedSession.completedQuestionIds
        : [],
  })
}

export function getSessionQuestions(
  state = loadPracticeState(),
) {
  return state.questionIds
    .map((id) => getQuestionById(id))
    .filter(Boolean)
}

export function getCurrentQuestion(
  state = loadPracticeState(),
) {
  const questions =
    getSessionQuestions(state)

  return (
    questions[state.currentIndex] || null
  )
}

export function getShuffledOptions(question) {
  if (
    !question ||
    !Array.isArray(question.options)
  ) {
    return []
  }

  return shuffle(question.options)
}

export function savePracticeChoice(
  questionId,
  option,
) {
  const state = loadPracticeState()

  const choices = {
    ...state.choices,
    [questionId]: option,
  }

  const completedQuestionIds =
    state.completedQuestionIds.includes(
      questionId,
    )
      ? state.completedQuestionIds
      : [
          ...state.completedQuestionIds,
          questionId,
        ]

  return savePracticeState({
    ...state,
    choices,
    completedQuestionIds,
  })
}

export function isAnswerCorrect(
  question,
  selectedOption,
) {
  if (!question) {
    return false
  }

  return (
    question.correctAnswer ===
    selectedOption
  )
}

export function moveToNextQuestion() {
  const state = loadPracticeState()

  const questions =
    getSessionQuestions(state)

  if (!questions.length) {
    return state
  }

  const nextIndex =
    state.currentIndex + 1

  if (nextIndex >= questions.length) {
    const completedTopics =
      state.selectedTopic &&
      !state.completedTopics.includes(
        state.selectedTopic,
      )
        ? [
            ...state.completedTopics,
            state.selectedTopic,
          ]
        : state.completedTopics

    return savePracticeState({
      ...state,
      completedTopics,
      currentIndex:
        questions.length - 1,
    })
  }

  return savePracticeState({
    ...state,
    currentIndex: nextIndex,
  })
}

export function getCompletedCount(
  state = loadPracticeState(),
) {
  return state.completedQuestionIds.length
}

export function getPracticeStatus(
  state = loadPracticeState(),
) {
  if (
    !state.selectedTopic ||
    !state.questionIds.length
  ) {
    return 'not_started'
  }

  if (
    state.completedQuestionIds.length >=
    state.questionIds.length
  ) {
    return 'completed'
  }

  return 'in_progress'
}

export function getTopicPracticeStatus(
  topicKey,
  state = loadPracticeState(),
) {
  const session =
    state.topicSessions?.[topicKey]

  if (
    session &&
    Array.isArray(session.questionIds) &&
    session.questionIds.length
  ) {
    if (
      Array.isArray(
        session.completedQuestionIds,
      ) &&
      session.completedQuestionIds.length >=
        session.questionIds.length
    ) {
      return 'completed'
    }

    return 'in_progress'
  }

  if (
    state.completedTopics.includes(topicKey)
  ) {
    return 'completed'
  }

  return 'not_started'
}

export function getTopicPracticeProgress(
  topicKey,
  state = loadPracticeState(),
) {
  const session =
    state.topicSessions?.[topicKey]

  if (
    !session ||
    !Array.isArray(session.questionIds) ||
    !session.questionIds.length
  ) {
    return {
      answered: 0,
      total:
        getTopicQuestions(topicKey).length,
    }
  }

  return {
    answered: Array.isArray(
      session.completedQuestionIds,
    )
      ? session.completedQuestionIds.length
      : 0,
    total: session.questionIds.length,
  }
}

export function getResumeIndex(
  state = loadPracticeState(),
) {
  return state.currentIndex || 0
}

export function getExploredTopics(
  state = loadPracticeState(),
) {
  return state.completedTopics
    .map((topicKey) =>
      getTopicByKey(topicKey),
    )
    .filter(Boolean)
    .map((topic) => topic.title)
}

export function resetCurrentPractice() {
  const state = loadPracticeState()

  const topicSessions = {
    ...state.topicSessions,
  }

  if (state.selectedTopic) {
    delete topicSessions[
      state.selectedTopic
    ]
  }

  return savePracticeState({
    ...state,
    selectedTopic: null,
    questionIds: [],
    currentIndex: 0,
    choices: {},
    completedQuestionIds: [],
    topicSessions,
  })
}

export function resetAllPracticeProgress() {
  return savePracticeState({
    ...emptyPracticeState,
    topicSessions: {},
  })
}

export function startPracticeSession(
  topicKey,
) {
  if (topicKey) {
    return startTopicPractice(topicKey)
  }

  return null
}

export function markPracticeComplete() {
  const state = loadPracticeState()

  if (
    !state.selectedTopic ||
    !state.questionIds.length
  ) {
    return state
  }

  const completedTopics =
    !state.completedTopics.includes(
      state.selectedTopic,
    )
      ? [
          ...state.completedTopics,
          state.selectedTopic,
        ]
      : state.completedTopics

  return savePracticeState({
    ...state,
    completedTopics,
  })
}

export function getTopicIcon(topic) {
  if (
    topic === 'Data Sharing' ||
    topic === 'dataSharing'
  ) {
    return 'share'
  }

  if (
    topic === 'Data Retention' ||
    topic === 'dataRetention'
  ) {
    return 'clock'
  }

  if (
    topic === 'User Control' ||
    topic === 'userControl' ||
    topic === 'Purpose of Use' ||
    topic === 'purposeOfUse'
  ) {
    return 'control'
  }

  return 'location'
}