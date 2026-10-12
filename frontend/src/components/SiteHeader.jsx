import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'
import { loadSettings, saveSettings } from '../utils/settings'

const NAV = [
  { to: '/', label: 'Home', match: (path) => path === '/' },
  {
    to: '/privacy-assistant',
    label: 'Check a policy',
    match: (path) =>
      [
        '/privacy-assistant',
        '/invalid-input',
        '/processing',
        '/analysis-failed',
        '/explanation',
        '/consent-summary',
        '/data-collection',
        '/purpose-of-use',
        '/data-sharing',
        '/data-retention',
        '/user-control',
        '/source-decision',
      ].includes(path),
  },
  {
    to: '/privacy-learning',
    label: 'Learn',
    match: (path) => path.startsWith('/privacy-learning'),
  },
  {
    to: '/risk-dashboard',
    label: 'Data breaches',
    match: (path) => path.startsWith('/risk-dashboard'),
  },
]

const SIZES = [
  { value: 'small', label: 'Standard', scale: '1rem' },
  { value: 'medium', label: 'Large', scale: '1.3rem' },
  { value: 'large', label: 'Largest', scale: '1.65rem' },
]

function Switch({ checked, onChange, title, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch__text">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="switch__track" aria-hidden="true" />
    </button>
  )
}

function DisplayPanel({ onClose }) {
  const [settings, setSettings] = useState(loadSettings)
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.querySelector('input:checked')?.focus()
  }, [])

  function update(change) {
    const next = { ...settings, ...change }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div
      ref={panelRef}
      className="display-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="display-panel-title"
    >
      <div className="display-panel__group">
        <h2 id="display-panel-title" className="visually-hidden">
          Display settings
        </h2>

        <fieldset>
          <legend>Text size</legend>

          <div className="size-choices">
            {SIZES.map((size) => (
              <div className="size-choice" key={size.value}>
                <input
                  type="radio"
                  id={`text-size-${size.value}`}
                  name="text-size"
                  value={size.value}
                  checked={settings.textSize === size.value}
                  onChange={() => update({ textSize: size.value })}
                />
                <label htmlFor={`text-size-${size.value}`}>
                  <span style={{ fontSize: size.scale }} aria-hidden="true">
                    A
                  </span>
                  <small>{size.label}</small>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="display-panel__group">
        <Switch
          checked={Boolean(settings.reducedMotion)}
          onChange={(value) => update({ reducedMotion: value })}
          title="Calm motion"
          description="Turn off movement and animations."
        />

        <Switch
          checked={Boolean(settings.nightTheme)}
          onChange={(value) => update({ nightTheme: value })}
          title="Dark background"
          description="Light text on a dark background."
        />
      </div>

      <div className="display-panel__group">
        <button type="button" className="btn btn--block" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}

function SiteHeader() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [displayOpen, setDisplayOpen] = useState(false)
  const headerRef = useRef(null)
  const displayButtonRef = useRef(null)

  // Close on Escape or a click outside the header.
  useEffect(() => {
    if (!menuOpen && !displayOpen) {
      return undefined
    }

    function onKey(event) {
      if (event.key === 'Escape') {
        if (displayOpen) {
          displayButtonRef.current?.focus()
        }
        setMenuOpen(false)
        setDisplayOpen(false)
      }
    }

    function onPointer(event) {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false)
        setDisplayOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen, displayOpen])

  function closeDisplay() {
    setDisplayOpen(false)
    displayButtonRef.current?.focus()
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <Logo className="brand__mark" />
          <span className="brand__name">Consent Assistant</span>
        </Link>

        <nav
          id="site-nav"
          className={`site-nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Main"
        >
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="site-nav__link"
              aria-current={item.match(pathname) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          <button
            ref={displayButtonRef}
            type="button"
            className="tool-button"
            aria-expanded={displayOpen}
            onClick={() => {
              setDisplayOpen(!displayOpen)
              setMenuOpen(false)
            }}
          >
            <Icon name="text-size" />
            <span className="tool-button__label">Text size</span>
          </button>

          <button
            type="button"
            className="tool-button menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => {
              setMenuOpen(!menuOpen)
              setDisplayOpen(false)
            }}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      {displayOpen && <DisplayPanel onClose={closeDisplay} />}
    </header>
  )
}

export default SiteHeader
