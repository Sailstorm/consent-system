import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function UserControl() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const policyText = location.state?.policyText || ''

  const userControl = analysisResult.user_control || {}
  const explanation = userControl.detailed_explanation || {}

  const sectionValues = [
    explanation.what_you_can_control,
    explanation.how_to_use_these_controls,
    explanation.access_and_correction,
    explanation.deletion,
    explanation.consent_or_opt_out,
    explanation.limitations,
    explanation.why_this_matters,
  ]

  const foundCount = sectionValues.filter(Boolean).length

  let statusType = 'missing'
  let statusLabel = 'No information found'
  let statusText = 'No user control information was identified'

  if (foundCount === sectionValues.length) {
    statusType = 'complete'
    statusLabel = 'Complete information'
    statusText = 'All user control details were identified'
  } else if (foundCount > 0) {
    statusType = 'partial'
    statusLabel = 'Partial information'
    statusText = 'Some user control details are not clearly stated'
  }

  const sections = [
    {
      heading: 'What you can control',
      text:
        explanation.what_you_can_control ||
        'No information is available for this section.',
    },
    {
      heading: 'How to use these controls',
      text:
        explanation.how_to_use_these_controls ||
        'No information is available for this section.',
    },
    {
      heading: 'Access and correction',
      text:
        explanation.access_and_correction ||
        'No information is available for this section.',
    },
    {
      heading: 'Deletion',
      text:
        explanation.deletion ||
        'No information is available for this section.',
    },
    {
      heading: 'Consent or opt-out',
      text:
        explanation.consent_or_opt_out ||
        'No information is available for this section.',
    },
    {
      heading: 'Limitations',
      text:
        explanation.limitations ||
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
      title="User Control"
      subtitle="A closer look at the choices and controls the policy gives you over your personal information."
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

export default UserControl