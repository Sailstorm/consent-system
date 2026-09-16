import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataRetention() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const policyText = location.state?.policyText || ''

  const dataRetention = analysisResult.data_retention || {}
  const explanation = dataRetention.detailed_explanation || {}

  const sectionValues = [
    explanation.what_is_retained,
    explanation.how_long_data_is_kept,
    explanation.why_data_is_retained,
    explanation.deletion_condition,
    explanation.why_this_matters,
  ]

  const foundCount = sectionValues.filter(Boolean).length

  let statusType = 'missing'
  let statusLabel = 'No information found'
  let statusText = 'No retention information was identified'

  if (foundCount === sectionValues.length) {
    statusType = 'complete'
    statusLabel = 'Complete information'
    statusText = 'All retention details were identified'
  } else if (foundCount > 0) {
    statusType = 'partial'
    statusLabel = 'Partial information'
    statusText = 'Some retention details are not clearly stated'
  }

  const sections = [
    {
      heading: 'What is retained',
      text:
        explanation.what_is_retained ||
        'No information is available for this section.',
    },
    {
      heading: 'How long data is kept',
      text:
        explanation.how_long_data_is_kept ||
        'No information is available for this section.',
    },
    {
      heading: 'Why data is retained',
      text:
        explanation.why_data_is_retained ||
        'No information is available for this section.',
    },
    {
      heading: 'Deletion condition',
      text:
        explanation.deletion_condition ||
        'No information is available for this section.',
    },
    {
      heading: 'Why this matters',
      text:
        explanation.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    policyText ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Retention"
      subtitle="A closer look at how long the policy says your personal information may be kept."
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

export default DataRetention