import PrivacyDetail from '../components/PrivacyDetail'

function UserControl() {
  const sections = [
    {
      heading: 'What you can control',
      text: 'The policy describes some options for accessing or changing personal information.',
    },
    {
      heading: 'Permission changes',
      text: 'Some permissions may be changed through account settings or device settings.',
    },
    {
      heading: 'Deletion or withdrawal',
      text: 'The policy may allow users to request deletion or withdraw some permissions.',
    },
    {
      heading: 'What is not confirmed',
      text: 'The policy may not clearly explain every available control or how quickly requests are handled.',
    },
    {
      heading: 'Why this matters',
      text: 'User controls can help people understand what choices they have after providing personal information.',
    },
  ]

  return (
    <PrivacyDetail
      title="User Control"
      subtitle="A closer look at the choices and controls the policy gives you over your personal information."
      statusLabel="User controls mentioned"
      statusText="Some controls depend on service settings"
      sections={sections}
      sourceText="You may update certain account information, manage permissions and request access to or deletion of some personal information."
      interpretation="The policy provides several user controls, although some options may depend on the account or service."
    />
  )
}

export default UserControl