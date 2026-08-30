import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataRetention() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const dataRetention = analysisResult.data_retention || {}
  const explanation = dataRetention.explanation || {}

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
        explanation.retention_period ||
        'No information is available for this section.',
    },
    {
      heading: 'Why data is retained',
      text:
        explanation.retention_reason ||
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
        dataRetention.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    dataRetention.extraction?.[0]?.evidence?.[0]?.text ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Retention"
      subtitle="A closer look at how long the policy says your personal information may be kept."
      statusLabel={
        dataRetention.status === 'not_mentioned'
          ? 'Retention period not clearly stated'
          : 'Data retention mentioned'
      }
      statusText={
        dataRetention.clarity === 'clear'
          ? 'Information is clearly stated'
          : 'Some retention details may still be unclear'
      }
      sections={sections}
      sourceText={sourceText}
      interpretation={
        dataRetention.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default DataRetention