import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function PurposeOfUse() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const purposeOfUse = analysisResult.purpose_of_use || {}
  const explanation = purposeOfUse.explanation || {}

  const sections = [
    {
      heading: 'Why data is used',
      text:
        explanation.stated_purposes ||
        'No information is available for this section.',
    },
    {
      heading: 'Data and purpose',
      text:
        explanation.data_purpose_links ||
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
        purposeOfUse.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    purposeOfUse.extraction?.[0]?.evidence?.[0]?.text ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="Purpose of Use"
      subtitle="A closer look at why the policy says your personal information may be used."
      statusLabel={
        purposeOfUse.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'Purpose of use mentioned'
      }
      statusText={
        purposeOfUse.clarity === 'clear'
          ? 'Information is clearly stated'
          : 'Some purposes may not be fully detailed'
      }
      sections={sections}
      sourceText={sourceText}
      interpretation={
        purposeOfUse.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default PurposeOfUse