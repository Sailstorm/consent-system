import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataSharing() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}

  const dataSharing = analysisResult.data_sharing || {}
  const explanation = dataSharing.detailed_explanation || {}

  const sectionValues = [
    explanation.who_data_may_be_shared_with,
    explanation.why_sharing_may_happen,
    explanation.named_organisations,
    explanation.what_data_is_shared,
    explanation.user_control,
    explanation.why_this_matters,
  ]

  const foundCount = sectionValues.filter(Boolean).length

  let statusType = 'missing'
  let statusLabel = 'No information found'
  let statusText = 'No data sharing information was identified'

  if (foundCount === sectionValues.length) {
    statusType = 'complete'
    statusLabel = 'Complete information'
    statusText = 'All data sharing details were identified'
  } else if (foundCount > 0) {
    statusType = 'partial'
    statusLabel = 'Partial information'
    statusText = 'Some data sharing details are not clearly stated'
  }

  const sections = [
    {
      heading: 'Who data may be shared with',
      text:
        explanation.who_data_may_be_shared_with ||
        'No information is available for this section.',
    },
    {
      heading: 'Why sharing may happen',
      text:
        explanation.why_sharing_may_happen ||
        'No information is available for this section.',
    },
    {
      heading: 'Named organisations',
      text:
        explanation.named_organisations ||
        'No information is available for this section.',
    },
    {
      heading: 'What data is shared',
      text:
        explanation.what_data_is_shared ||
        'No information is available for this section.',
    },
    {
      heading: 'User control',
      text:
        explanation.user_control ||
        'No information is available for this section.',
    },
    {
      heading: 'Why this matters',
      text:
        explanation.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const evidence = dataSharing.evidence || []

  const sourceText =
    evidence
      .map((item) => item.text)
      .filter(Boolean)
      .join('\n\n') ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Sharing"
      subtitle="A closer look at whether the policy says your information may be shared."
      statusLabel={statusLabel}
      statusText={statusText}
      statusType={statusType}
      sections={sections}
      sourceText={sourceText}
      interpretation={
        explanation.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default DataSharing