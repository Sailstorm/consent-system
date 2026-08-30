import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function DataCollection() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}

  const dataCollection =
    analysisResult.data_collection?.data_collection ||
    analysisResult.data_collection ||
    {}

  const explanation = dataCollection.explanation || {}

  const sections = [
    {
      heading: 'What data is collected',
      text:
        explanation.what_is_collected ||
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
        explanation.when_it_is_collected ||
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
        explanation.unclear_details ||
        'No information is available for this section.',
    },
    {
      heading: 'Why this matters',
      text:
        dataCollection.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    dataCollection.extraction?.[0]?.evidence?.[0]?.text ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Data Collection"
      subtitle="A closer look at what personal information the policy says may be collected."
      statusLabel={
        dataCollection.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Collection mentioned'
      }
      statusText={
        dataCollection.clarity === 'clear'
          ? 'Information is clearly stated'
          : 'Some details may still be unclear'
      }
      sections={sections}
      sourceText={sourceText}
      interpretation={
        dataCollection.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default DataCollection