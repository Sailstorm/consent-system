import PrivacyDetail from '../components/PrivacyDetail'

function DataSharing() {
  const sections = [
    {
      heading: 'Who data may be shared with',
      text: 'The policy mentions that information may be shared with service providers or other partners.',
    },
    {
      heading: 'Why sharing may happen',
      text: 'Sharing may be used to support service delivery, analytics or other business functions.',
    },
    {
      heading: 'Third-party services',
      text: 'Some external organisations may process information on behalf of the service.',
    },
    {
      heading: 'What is not confirmed',
      text: 'The policy may not clearly identify every organisation that receives personal information.',
    },
    {
      heading: 'Why this matters',
      text: 'Knowing who may receive information helps users understand where their data could go.',
    },
  ]

  return (
    <PrivacyDetail
      title="Data Sharing"
      subtitle="A closer look at whether the policy says your information may be shared."
      statusLabel="Data sharing mentioned"
      statusText="Some third parties may not be clearly identified"
      sections={sections}
      sourceText="We may share information with service providers and selected partners who help us operate our services."
      interpretation="The policy confirms that some sharing may occur, but it may not identify every third party in detail."
    />
  )
}

export default DataSharing