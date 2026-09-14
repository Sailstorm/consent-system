import InfoPage from '../components/InfoPage'

function PolicyExample() {
  return (
    <InfoPage
      headerActivePage="policy"
      title="See how a privacy policy becomes easier to understand"
      intro="A short example of how Consent Assistant turns long policy text into clearer parts."
      items={[
        'What does this policy cover?',
        'Who is it for?',
        'How can I compare?',
      ]}
      advice="This example shows how a long privacy policy can be broken into simpler language while the original text stays available."
      actionLabel="Continue"
      actionPath="/privacy-assistant"
    />
  )
}

export default PolicyExample
