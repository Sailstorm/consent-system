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