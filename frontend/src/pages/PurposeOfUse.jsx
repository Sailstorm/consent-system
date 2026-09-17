import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function PurposeOfUse() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}

  const purposeOfUse = analysisResult.purpose_of_use || {}
  const explanation = purposeOfUse.detailed_explanation || {}

  const sectionValues = [
    explanation.why_data_is_used,
    explanation.data_and_purpose,
    explanation.unspecified_purposes,
    explanation.additional_uses,
    explanation.why_this_matters,
  ]

  const foundCount = sectionValues.filter(Boolean).length

  let statusType = 'missing'
  let statusLabel = 'No information found'
  let statusText = 'No purpose information was identified'

  if (foundCount === sectionValues.length) {
    statusType = 'complete'
    statusLabel = 'Complete information'
    statusText = 'All purpose details were identified'
  } else if (foundCount > 0) {
    statusType = 'partial'
    statusLabel = 'Partial information'
    statusText = 'Some purpose details are not clearly stated'
  }

  const sections = [
    {
      heading: 'Why data is used',
      text:
        explanation.why_data_is_used ||
        'No information is available for this section.',
    },
    {
      heading: 'Data and purpose',
      text:
        explanation.data_and_purpose ||
        'No information is available for this section.',
    },
    {
      heading: 'Unspecified purposes',
      text:
        explanation.unspecified_purposes ||
        'No information is available for this section.',
    },
    {
      heading: 'Additional uses',
      text:
        explanation.additional_uses ||
        'No information is available for this section.',
    },
    {
      heading: 'Why this matters',
      text:
        explanation.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const evidence = purposeOfUse.evidence || []

  const sourceText =
    evidence
      .map((item) => item.text)
      .filter(Boolean)
      .join('\n\n') ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Purpose of Use"
      subtitle="A closer look at why the policy says your personal information may be used."
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

export default PurposeOfUse