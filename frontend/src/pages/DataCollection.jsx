import PrivacyDetail from '../components/PrivacyDetail'

function DataCollection() {
  const sections = [
    {
      heading: 'What data is collected',
      text: 'The policy mentions identifiers, device data and location information.',
    },
    {
      heading: 'Examples in this policy',
      text: 'Name, email, device details and some location information may be included.',
    },
    {
      heading: 'When collection happens',
      text: 'Information may be collected when the user signs up or uses the service.',
    },
    {
      heading: 'What is not confirmed',
      text: 'The policy does not clearly explain whether all optional information is collected.',
    },
    {
      heading: 'Why this matters',
      text: 'Knowing what information is collected helps the user understand what personal data they may provide.',
    },
  ]

  return (
    <PrivacyDetail
      title="Data Collection"
      subtitle="A closer look at what personal information the policy says may be collected."
      statusLabel="Collection clearly mentioned"
      statusText="Some specific types may still be unclear"
      sections={sections}
      sourceText="We may collect identifiers, device data and location information to provide and improve our services."
      interpretation="The policy clearly states that several types of personal information may be collected, but some details may still not be fully explained."
    />
  )
}

export default DataCollection