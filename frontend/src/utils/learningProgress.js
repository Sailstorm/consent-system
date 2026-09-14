export const LEARNING_TOPICS = [
  {
    id: 'data-collection',
    title: 'Data Collection',
    nextHint:
      'Learn what information a service may collect about you, then try a practice scenario.',
  },
  {
    id: 'purpose-of-use',
    title: 'Purpose of Use',
    nextHint:
      'Learn why an organisation wants to use your information, then try a practice scenario.',
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    nextHint:
      'Learn who else may receive your information, then try a practice scenario.',
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    nextHint:
      'Learn how long organisations may keep information, then try the final practice scenario.',
  },
  {
    id: 'user-control',
    title: 'User Control',
    nextHint:
      'Learn the choices you may have over your information, then try a practice scenario.',
  },
]

const LEARNING_PROGRESS_KEY = 'consent-assistant-learning-progress'

export function loadLearningProgress() {
  try {
    const stored = localStorage.getItem(LEARNING_PROGRESS_KEY)

    if (!stored) {
      return []
    }

    const progress = JSON.parse(stored)

    if (!Array.isArray(progress)) {
      return []
    }

    return progress
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

  localStorage.setItem(
    LEARNING_PROGRESS_KEY,
    JSON.stringify(nextProgress),
  )

  return nextProgress
}

export function isTopicCompleted(
  topicId,
  progress = loadLearningProgress(),
) {
  return progress.includes(topicId)
}

export function getCompletedTopicCount(
  progress = loadLearningProgress(),
) {
  return LEARNING_TOPICS.filter((topic) =>
    isTopicCompleted(topic.id, progress),
  ).length
}

export function getNextLearningTopic(
  progress = loadLearningProgress(),
) {
  return (
    LEARNING_TOPICS.find((topic) => !isTopicCompleted(topic.id, progress)) ||
    null
  )
}