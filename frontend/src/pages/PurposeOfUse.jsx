import PrivacyDetail from '../components/PrivacyDetail'

function PurposeOfUse() {
  const sections = [
    {
      heading: 'Why data is used',
      text: 'The policy says personal information may be used to operate and improve the service.',
    },
    {
      heading: 'Service delivery',
      text: 'Some information may be used to provide requested features and account services.',
    },
    {
      heading: 'Product improvement',
      text: 'The policy may allow information to be used for analytics and service improvement.',
    },
    {
      heading: 'What is not confirmed',
      text: 'Some secondary uses may not be described in enough detail.',
    },
    {
      heading: 'Why this matters',
      text: 'Understanding the purpose helps users know why their personal information is being requested.',
    },
  ]

  return (
    <PrivacyDetail
      title="Purpose of Use"
      subtitle="A closer look at why the policy says your personal information may be used."
      statusLabel="Purpose of use mentioned"
      statusText="Some purposes may not be fully detailed"
      sections={sections}
      sourceText="We may use information to provide services, improve products and understand how users interact with our platform."
      interpretation="The policy gives several reasons for using personal information, although some purposes may remain broad."
    />
  )
}

export default PurposeOfUse