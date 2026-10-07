import { useNavigate } from 'react-router-dom'
import '../styles/pageHeader.css'

function PageHeader() {
  const navigate = useNavigate()

  function goHome() {
    navigate('/')
  }

  return (
    <header className="ca-page-header">
      <button
        type="button"
        className="ca-page-header-brand"
        onClick={goHome}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo2.jpg`}
          alt="Consent Assistant"
          className="ca-page-header-logo"
        />

        <span>Consent Assistant</span>
      </button>
    </header>
  )
}

export default PageHeader