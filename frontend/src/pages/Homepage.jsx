import { useNavigate } from 'react-router-dom'

import '../styles/homepage.css'

import backgroundImage from '../assets/home background.jpg'
import logo from '../assets/logo.png'

function Homepage() {
  const navigate = useNavigate()

  return (
    <main
      className="homepage"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
      }}
    >
      <section className="homepage-hero">
        <img
          src={logo}
          alt="Consent Assistant logo"
          className="homepage-logo"
        />

        <h1>CONSENT ASSISTANT</h1>

        <p className="homepage-tagline">
          Privacy policies shouldn’t be difficult to understand.
        </p>

        <p className="homepage-description">
          Consent Assistant helps you understand what a privacy policy
          <br />
          says about your personal information, so you can review it
          <br />
          more easily before making a decision.
        </p>

        <button
          type="button"
          className="homepage-upload-button"
          onClick={() =>
            navigate('/privacy-assistant')
          }
        >
          <span className="homepage-upload-icon">
            <span className="upload-arrow">↑</span>
            <span className="upload-line"></span>
          </span>

          Upload Policy
        </button>

        <p className="homepage-upload-note">
          Upload your privacy policy to get started
        </p>

        <button
          type="button"
          className="homepage-upload-button homepage-dashboard-button"
          onClick={() =>
            navigate('/risk-dashboard')
          }
        >
          View Dashboard
        </button>
      </section>
    </main>
  )
}

export default Homepage