import PrivacyDetail from '../components/PrivacyDetail'

function DataRetention() {
  const sections = [
    {
      heading: 'How long data is kept',
      text: 'The policy does not provide one clear retention period for all personal information.',
    },
    {
      heading: 'Retention conditions',
      text: 'Some information may be kept while it is needed to provide the service or meet other requirements.',
    },
    {
      heading: 'What the assistant found',
      text: 'The available wording does not give a specific period for every type of personal data.',
    },
    {
      heading: 'What you may want to check',
      text: 'Users may want to look for specific time periods or conditions describing when information is deleted.',
    },
    {
      heading: 'Why this matters',
      text: 'Retention information helps users understand how long their personal information may remain stored.',
    },
  ]

  return (
    <PrivacyDetail
      title="Data Retention"
      subtitle="A closer look at how long the policy says your personal information may be kept."
      statusLabel="Retention period not clearly stated"
      statusText="No specific timeframe found"
      sections={sections}
      sourceText="We keep information while necessary to provide our services and meet applicable requirements."
      interpretation="The policy provides a general reason for keeping information but does not give a clear retention period."
    />
  )
}

export default DataRetention