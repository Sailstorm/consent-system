// The Consent Assistant logo, drawn from Onboarding/logo/consent-assistant-*.svg.
// Colours come from tokens, so light pages show the primary version (ocean
// blue shield, off-white letters) and the dark background shows the reversed
// version (sky blue shield, charcoal letters).
function Logo({ className = '' }) {
  return (
    <svg
      viewBox="0 0 58 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M29 3 L53 12 V31 C53 46 43 56 29 61 C15 56 5 46 5 31 V12 Z"
        fill="var(--logo)"
      />
      <path
        d="M27.4 25.6 A8.6 8.6 0 1 0 27.4 38.4"
        stroke="var(--logo-ink)"
        strokeWidth="4.7"
        strokeLinecap="round"
      />
      <path
        d="M32.8 40.4 L39.1 24 L45.4 40.4"
        stroke="var(--logo-ink)"
        strokeWidth="4.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M35.5 34.9 H42.7" stroke="var(--logo-ink)" strokeWidth="4.2" strokeLinecap="round" />
    </svg>
  )
}

export default Logo
