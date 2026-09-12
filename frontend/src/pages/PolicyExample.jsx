import PolicyLayout from '../components/PolicyLayout'
import '../styles/policyExample.css'

function PolicyExample() {
  return (
    <PolicyLayout activePage="example">
      <section className="policy-example-intro">
        <p className="policy-example-label">POLICY ASSISTANT</p>

        <h1>Example</h1>

        <p>
          See how a privacy policy can be explained in clear and simple
          language.
        </p>
      </section>

      <section className="policy-example-card">
        <h2>Privacy Policy Example</h2>

        <p>
          The example privacy policy walkthrough will be added later.
        </p>
      </section>
    </PolicyLayout>
  )
}

export default PolicyExample