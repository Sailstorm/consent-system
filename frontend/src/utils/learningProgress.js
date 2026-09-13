export const LEARNING_TOPICS = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    summary: 'Understand what information a service asks for.',
  },
  {
    id: 'purpose-of-use',
    title: 'Purpose of Use',
    summary: 'Learn why an organisation wants to use your data.',
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    summary: 'See who your information may be shared with.',
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    summary: 'Learn how long your information may be kept.',
  },
  {
    id: 'user-control',
    title: 'User Control',
    summary: 'Understand the choices and controls available.',
  },
]

const LEARNING_PROGRESS_KEY = 'consent-assistant-learning-progress'

function toTopicIds(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (value && Array.isArray(value.completedTopicIds)) {
    return value.completedTopicIds
  }

  return []
}

function validTopicIds(ids) {
  return ids.filter((id) => LEARNING_TOPICS.some((topic) => topic.id === id))
}

export function loadLearningProgress() {
  try {
    const stored = localStorage.getItem(LEARNING_PROGRESS_KEY)

    if (!stored) {
      return []
    }

    return validTopicIds(toTopicIds(JSON.parse(stored)))
  } catch {
    return []
  }
}

export function markTopicCompleted(topicSlug) {
  const currentProgress = loadLearningProgress()

  if (currentProgress.includes(topicSlug)) {
    return currentProgress
  }

  const nextProgress = [...currentProgress, topicSlug]

  try {
    localStorage.setItem(
      LEARNING_PROGRESS_KEY,
      JSON.stringify(nextProgress),
    )
  } catch {
    // Ignore storage errors in private browsing.
  }

  return nextProgress
}

export function isTopicCompleted(topicId, progress = loadLearningProgress()) {
  return toTopicIds(progress).includes(topicId)
}

export function getCompletedTopicCount(progress = loadLearningProgress()) {
  return LEARNING_TOPICS.filter((topic) =>
    isTopicCompleted(topic.id, progress),
  ).length
}

export function getNextLearningTopic(progress = loadLearningProgress()) {
  return (
    LEARNING_TOPICS.find((topic) => !isTopicCompleted(topic.id, progress)) ||
    null
  )
}

export function completeTopic(topicId) {
  return markTopicCompleted(topicId)
}
