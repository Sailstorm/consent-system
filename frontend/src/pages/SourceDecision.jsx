import PrivacyDetail from '../components/PrivacyDetail'

function SourceDecision() {
  const sections = [
    {
      heading: 'Where the explanation comes from',
      text: 'The explanation is based on the privacy policy text submitted by the user.',
    },
    {
      heading: 'How to review the source',
      text: 'Users can compare the explanation with relevant parts of the original policy.',
    },
    {
      heading: 'What the tool does',
      text: 'The tool organises privacy information into simpler categories and explanations.',
    },
    {
      heading: 'What the tool does not do',
      text: 'The tool does not make the final consent decision for the user.',
    },
    {
      heading: 'Your decision',
      text: 'Users should review the available information and decide whether they are comfortable with the privacy practices described.',
    },
  ]

  return (
    <PrivacyDetail
      title="Source & Decision"
      subtitle="Review where the explanation came from and make your own privacy decision."
      statusLabel="Source available"
      statusText="Final decision remains with the user"
      sections={sections}
      sourceText="This explanation is based only on the privacy policy content submitted for analysis."
      interpretation="The tool supports understanding by showing relevant information and source text, but it does not decide whether the user should accept or reject the policy."
    />
  )
}

export default SourceDecision