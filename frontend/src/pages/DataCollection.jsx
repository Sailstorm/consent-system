import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataCollection() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}

  const dataCollection = analysisResult.data_collection || {}
  const explanation = dataCollection.detailed_explanation || {}

  const sectionValues = [
    explanation.what_data_is_collected,
    explanation.how_it_is_collected,
    explanation.when_collection_happens,
    explanation.required_or_optional,
    explanation.what_is_not_confirmed,
    explanation.why_this_matters,
  ]

  const foundCount = sectionValues.filter(Boolean).length

  let statusType = 'missing'
  let statusLabel = 'No information found'
  let statusText = 'No collection information was identified'

  if (foundCount === sectionValues.length) {
    statusType = 'complete'
    statusLabel = 'Complete information'
    statusText = 'All collection details were identified'
  } else if (foundCount > 0) {
    statusType = 'partial'
    statusLabel = 'Partial information'
    statusText = 'Some collection details are not clearly stated'
  }

  const sections = [
    {
      heading: 'What data is collected',
      text:
        explanation.what_data_is_collected ||
        'No information is available for this section.',
    },
    {
      heading: 'How it is collected',
      text:
        explanation.how_it_is_collected ||
        'No information is available for this section.',
    },
    {
      heading: 'When collection happens',
      text:
        explanation.when_collection_happens ||
        'No information is available for this section.',
    },
    {
      heading: 'Required or optional',
      text:
        explanation.required_or_optional ||
        'No information is available for this section.',
    },
    {
      heading: 'What is not confirmed',
      text:
        explanation.what_is_not_confirmed ||
        'No information is available for this section.',
    },
    {
      heading: 'Why this matters',
      text:
        explanation.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const evidence = dataCollection.evidence || []

  const sourceText =
    evidence
      .map((item) => item.text)
      .filter(Boolean)
      .join('\n\n') ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Collection"
      subtitle="A closer look at what personal information the policy says may be collected."
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

export default DataCollection