import { useLocation } from 'react-router-dom'
import PrivacyDetail from '../components/PrivacyDetail'

function UserControl() {
  const location = useLocation()

  const analysisResult = location.state?.analysisResult || {}
  const userControl = analysisResult.user_control || {}
  const explanation = userControl.explanation || {}

  const sections = [
    {
      heading: 'What you can control',
      text:
        explanation.available_controls ||
        'No information is available for this section.',
    },
    {
      heading: 'How to use these controls',
      text:
        explanation.how_to_exercise_controls ||
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
        userControl.why_this_matters ||
        'No information is available for this section.',
    },
  ]

  const sourceText =
    userControl.extraction?.[0]?.evidence?.[0]?.text ||
    'No relevant source text was found.'

  return (
    <PrivacyDetail
      title="User Control"
      subtitle="A closer look at the choices and controls the policy gives you over your personal information."
      statusLabel={
        userControl.status === 'not_mentioned'
          ? 'Not clearly stated'
          : 'User controls mentioned'
      }
      statusText={
        userControl.clarity === 'clear'
          ? 'Information is clearly stated'
          : 'Some controls may still be unclear'
      }
      sections={sections}
      sourceText={sourceText}
      interpretation={
        userControl.why_this_matters ||
        'No additional interpretation is available.'
      }
    />
  )
}

export default UserControl