import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataSharing() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const dataSharing = analysisResult.data_sharing || {}
  const explanation = dataSharing.explanation || {}

  const sections = [
    {
      heading: 'Who data may be shared with',
      text:
        explanation.who_receives_data ||
        'No information is available for this section.',
    },
    {
      heading: 'Why sharing may happen',
      text:
        explanation.why_data_is_shared ||
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
        dataSharing.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    dataSharing.extraction?.[0]?.evidence?.[0]?.text ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Sharing"
      subtitle="A closer look at whether the policy says your information may be shared."
      statusLabel={
        dataSharing.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Data sharing mentioned'
      }
      statusText={
        dataSharing.clarity === 'clear'
          ? 'Information is clearly stated'
          : 'Some third parties may not be clearly identified'
      }
      sections={sections}
      sourceText={sourceText}
      interpretation={
        dataSharing.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default DataSharing