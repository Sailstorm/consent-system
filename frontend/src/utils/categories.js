// The five privacy categories the AI service reports on, in one place, so
// the explanation, detail and summary pages describe them the same way.

export const CATEGORIES = [
  {
    key: 'data_collection',
    path: '/data-collection',
    learnSlug: 'data-collection',
    icon: 'collect',
    title: 'Data collection',
    question: 'What do they collect?',
    summaryTitle: 'What they collect',
    subtitle:
      'What personal information the policy says may be collected about you.',
    fields: [
      ['what_data_is_collected', 'What information is collected'],
      ['how_it_is_collected', 'How it is collected'],
      ['when_collection_happens', 'When it is collected'],
      ['required_or_optional', 'Whether you have to give it'],
      ['what_is_not_confirmed', 'What the policy does not confirm'],
      ['why_this_matters', 'Why this matters'],
    ],
  },
  {
    key: 'purpose_of_use',
    path: '/purpose-of-use',
    learnSlug: 'purpose-of-use',
    icon: 'purpose',
    title: 'Purpose of use',
    question: 'Why do they want it?',
    summaryTitle: 'Why they use it',
    subtitle: 'Why the policy says your personal information may be used.',
    fields: [
      ['why_data_is_used', 'Why your information is used'],
      ['data_and_purpose', 'Which information is used for what'],
      ['unspecified_purposes', 'Uses that are not clearly explained'],
      ['additional_uses', 'Other uses'],
      ['why_this_matters', 'Why this matters'],
    ],
  },
  {
    key: 'data_sharing',
    path: '/data-sharing',
    learnSlug: 'data-sharing',
    icon: 'share',
    title: 'Data sharing',
    question: 'Who else gets it?',
    summaryTitle: 'Who they share it with',
    subtitle: 'Whether the policy says your information may be passed to others.',
    fields: [
      ['who_data_may_be_shared_with', 'Who it may be shared with'],
      ['why_sharing_may_happen', 'Why it may be shared'],
      ['named_organisations', 'Organisations named in the policy'],
      ['what_data_is_shared', 'What information is shared'],
      ['user_control', 'Your choices about sharing'],
      ['why_this_matters', 'Why this matters'],
    ],
  },
  {
    key: 'data_retention',
    path: '/data-retention',
    learnSlug: 'data-retention',
    icon: 'clock',
    title: 'Data retention',
    question: 'How long do they keep it?',
    summaryTitle: 'How long they keep it',
    subtitle: 'How long the policy says your information may be kept.',
    fields: [
      ['what_is_retained', 'What is kept'],
      ['how_long_data_is_kept', 'How long it is kept'],
      ['why_data_is_retained', 'Why it is kept'],
      ['deletion_condition', 'When it is deleted'],
      ['why_this_matters', 'Why this matters'],
    ],
  },
  {
    key: 'user_control',
    path: '/user-control',
    learnSlug: 'user-control',
    icon: 'control',
    title: 'Your choices',
    question: 'What can you change?',
    summaryTitle: 'Your choices',
    subtitle:
      'The choices and controls the policy gives you over your information.',
    fields: [
      ['what_you_can_control', 'What you can control'],
      ['how_to_use_these_controls', 'How to use these choices'],
      ['access_and_correction', 'Seeing and correcting your information'],
      ['deletion', 'Asking for it to be deleted'],
      ['consent_or_opt_out', 'Withdrawing consent or opting out'],
      ['limitations', 'Limits on your choices'],
      ['why_this_matters', 'Why this matters'],
    ],
  },
]

export const STATUS = {
  complete: {
    label: 'Clearly stated',
    icon: 'check-circle',
    explain: 'The policy covers every point we look for.',
  },
  partial: {
    label: 'Partly stated',
    icon: 'half-circle',
    explain: 'The policy covers some points but leaves others out.',
  },
  missing: {
    label: 'Not clearly stated',
    icon: 'alert-circle',
    explain: 'We could not find this clearly in the policy.',
  },
}

export function getCategoryByPath(path) {
  return CATEGORIES.find((category) => category.path === path) || null
}

// The AI service sometimes nests data collection one level deeper.
export function getCategoryResult(analysisResult, key) {
  const result = analysisResult?.[key] || {}

  if (key === 'data_collection' && result.data_collection) {
    return result.data_collection
  }

  return result
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Describe one category: its summary, each point with its text (or null
// when the policy doesn't cover it), the evidence quotes and a status.
export function describeCategory(category, analysisResult) {
  const result = getCategoryResult(analysisResult, category.key)
  const explanation = result.detailed_explanation || {}

  const points = category.fields.map(([field, heading]) => {
    const value = explanation[field]
    const text = typeof value === 'string' ? value.trim() : ''

    return { field, heading, text: text ? capitalise(text) : null }
  })

  const found = points.filter((point) => point.text).length

  let status = 'missing'

  if (found === points.length) {
    status = 'complete'
  } else if (found > 0) {
    status = 'partial'
  }

  const evidence = (result.evidence || [])
    .map((item) => item?.text)
    .filter(Boolean)

  return {
    ...category,
    summary: result.summary || '',
    points,
    found,
    status,
    evidence,
  }
}
