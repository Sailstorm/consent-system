function PracticeIcon({ type }) {
  if (type === 'share') {
    return (
      <svg className="practise-scenario-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="12" r="2.2" fill="currentColor" />
        <circle cx="18" cy="6" r="2.2" fill="currentColor" />
        <circle cx="18" cy="18" r="2.2" fill="currentColor" />
        <path
          d="M8 12h8M16.2 7.4L8.8 11M16.2 16.6L8.8 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  }

  if (type === 'clock') {
    return (
      <svg className="practise-scenario-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className="practise-scenario-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M6.2 6.2l2.1 2.1M15.7 15.7l2.1 2.1M17.8 6.2l-2.1 2.1M8.3 15.7l-2.1 2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default PracticeIcon
