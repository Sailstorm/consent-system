import Icon from './Icon'

// Illustrations and diagrams for the five privacy lessons. Colours come
// from the design tokens (see .art-* in styles/pages/learn.css), so they
// follow the brand palette and dark mode. Scenes are decorative; the
// lesson text says the same thing in words.

// A small icon drawn inside an SVG scene.
function Glyph({ name, x, y, size = 28, className = 'art-glyph' }) {
  return <Icon name={name} x={x} y={y} width={size} height={size} className={className} />
}

// A white circle "chip" holding an icon, used around the scenes.
function Chip({ cx, cy, r = 26, icon, flag = false, className = '' }) {
  const size = r * 1.05

  return (
    <g className={`art-chip ${className}`.trim()}>
      <circle cx={cx} cy={cy} r={r} className={flag ? 'art-card art-card--flag' : 'art-card'} />
      <Glyph name={icon} x={cx - size / 2} y={cy - size / 2} size={size} />
    </g>
  )
}

function Phone({ x = 148, y = 34, children }) {
  return (
    <g>
      <rect x={x} y={y} width="104" height="192" rx="18" className="art-card art-card--thick" />
      <rect x={x + 38} y={y + 10} width="28" height="6" rx="3" className="art-ink-fill" />
      {children}
    </g>
  )
}

function CollectionScene() {
  return (
    <>
      <circle cx="200" cy="130" r="118" className="art-bg" />
      <Phone>
        <rect x="166" y="70" width="44" height="6" rx="3" className="art-muted" />
        <rect x="166" y="82" width="68" height="20" rx="6" className="art-field" />
        <rect x="172" y="87" width="2.5" height="10" className="art-cursor" />
        <rect x="166" y="114" width="34" height="6" rx="3" className="art-muted" />
        <rect x="166" y="126" width="68" height="20" rx="6" className="art-field" />
        <rect x="172" y="133" width="30" height="5" rx="2.5" className="art-typed" />
        <rect x="166" y="164" width="68" height="22" rx="11" className="art-logo" />
      </Phone>

      <path d="M118 92 L148 104" className="art-link" />
      <path d="M120 176 L148 160" className="art-link" />
      <Chip cx={92} cy={84} icon="pin" className="art-bob art-bob--a" />
      <Chip cx={96} cy={184} icon="eye" className="art-bob art-bob--b" />

      {/* Information flowing from the phone into the company's records */}
      <circle cx="262" cy="140" r="5" className="art-dot art-dot--1" />
      <circle cx="262" cy="140" r="5" className="art-dot art-dot--2" />
      <circle cx="262" cy="140" r="5" className="art-dot art-dot--3" />

      <g>
        <path d="M300 104 v64 a32 11 0 0 0 64 0 v-64" className="art-logo" />
        <path d="M300 125 a32 11 0 0 0 64 0 M300 146 a32 11 0 0 0 64 0" className="art-band" />
        <ellipse cx="332" cy="104" rx="32" ry="11" className="art-sky" />
      </g>
    </>
  )
}

function PurposeScene() {
  return (
    <>
      <circle cx="200" cy="130" r="118" className="art-bg" />
      <g className="art-bob art-bob--a">
        <rect x="34" y="94" width="104" height="72" rx="14" className="art-card art-card--thick" />
        <Glyph name="mail" x={62} y={106} size={48} className="art-glyph art-glyph--brand" />
      </g>

      <path d="M140 130 C 200 130, 195 60, 252 60" className="art-flow" />
      <path d="M140 130 L 252 130" className="art-flow art-flow--2" />
      <path d="M140 130 C 200 130, 195 200, 252 200" className="art-flow art-flow--3" />

      <g>
        <rect x="252" y="34" width="112" height="52" rx="14" className="art-card" />
        <Glyph name="receipt" x={266} y={46} />
        <rect x="302" y="56" width="48" height="8" rx="4" className="art-muted" />
      </g>
      <g>
        <rect x="252" y="104" width="112" height="52" rx="14" className="art-card" />
        <Glyph name="chart" x={266} y={116} />
        <rect x="302" y="126" width="40" height="8" rx="4" className="art-muted" />
      </g>
      <g className="art-pulse">
        <rect x="252" y="174" width="112" height="52" rx="14" className="art-card art-card--flag" />
        <Glyph name="megaphone" x={266} y={186} />
        <rect x="302" y="196" width="48" height="8" rx="4" className="art-muted" />
      </g>
    </>
  )
}

function SharingScene() {
  return (
    <>
      <circle cx="200" cy="130" r="118" className="art-bg" />
      <path d="M200 130 L200 52" className="art-link art-link--solid" />
      <path d="M200 130 L92 196" className="art-link art-link--solid" />
      <path d="M200 130 L308 196" className="art-link art-link--solid" />

      <circle cx="200" cy="130" r="6" className="art-dot art-dot--up" />
      <circle cx="200" cy="130" r="6" className="art-dot art-dot--left" />
      <circle cx="200" cy="130" r="6" className="art-dot art-dot--right" />

      <circle cx="200" cy="130" r="44" className="art-logo" />
      <Glyph name="building" x={178} y={108} size={44} className="art-glyph art-glyph--on-logo" />

      <Chip cx={200} cy={46} r={28} icon="truck" />
      <Chip cx={86} cy={200} r={28} icon="card" />
      <Chip cx={314} cy={200} r={28} icon="megaphone" flag className="art-pulse" />
    </>
  )
}

function RetentionScene() {
  return (
    <>
      <circle cx="200" cy="124" r="112" className="art-bg" />
      <g className="art-bob art-bob--a">
        <rect x="140" y="62" width="120" height="96" rx="14" className="art-card art-card--thick" />
        <Glyph name="archive" x={170} y={80} size={60} className="art-glyph art-glyph--brand" />
      </g>

      {/* A clock whose hand keeps turning: time passing */}
      <g>
        <circle cx="300" cy="66" r="30" className="art-card art-card--thick" />
        <path d="M300 66 L300 46" className="art-hand art-hand--slow" />
        <path d="M300 66 L314 66" className="art-hand art-hand--fast" />
        <circle cx="300" cy="66" r="3.5" className="art-ink-fill" />
      </g>

      {/* Timeline: sign up ... stopped using ... still kept ... deleted */}
      <rect x="48" y="200" width="304" height="10" rx="5" className="art-track" />
      <rect x="48" y="200" width="304" height="10" rx="5" className="art-track-fill" />
      <Chip cx={58} cy={205} r={20} icon="user-plus" />
      <Chip cx={150} cy={205} r={20} icon="calendar" />
      <Chip cx={250} cy={205} r={20} icon="archive" flag />
      <Chip cx={342} cy={205} r={20} icon="trash" />
    </>
  )
}

function ControlScene() {
  const rows = [
    { y: 74, icon: 'eye', on: true },
    { y: 112, icon: 'edit', on: false },
    { y: 150, icon: 'trash', on: true },
    { y: 188, icon: 'mail', on: false },
  ]

  return (
    <>
      <circle cx="200" cy="130" r="118" className="art-bg" />
      <Phone>
        {rows.map((row, index) => (
          <g key={row.y}>
            <Glyph name={row.icon} x={162} y={row.y - 10} size={20} className="art-glyph art-glyph--brand" />
            <rect x="188" y={row.y - 3} width="22" height="6" rx="3" className="art-muted" />
            <g className={`art-switch art-switch--${index + 1}${row.on ? ' is-on' : ''}`}>
              <rect x="214" y={row.y - 9} width="28" height="18" rx="9" className="art-switch__track" />
              <circle cx="223" cy={row.y} r="6.5" className="art-switch__knob" />
            </g>
          </g>
        ))}
      </Phone>
      <Chip cx={86} cy={96} icon="control" className="art-bob art-bob--a" />
      <Chip cx={318} cy={170} icon="check" className="art-bob art-bob--b" />
    </>
  )
}

const SCENES = {
  'data-collection': CollectionScene,
  'purpose-of-use': PurposeScene,
  'data-sharing': SharingScene,
  'data-retention': RetentionScene,
  'user-control': ControlScene,
}

export function LessonScene({ slug, className = '' }) {
  const Scene = SCENES[slug]

  if (!Scene) {
    return null
  }

  return (
    <svg
      viewBox="0 0 400 260"
      className={`lesson-scene ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  )
}

// ---------- "How it works" diagrams (real text, so it scales and is read out)

function Step({ item }) {
  return (
    <>
      <span className={`how__icon${item.flag ? ' how__icon--flag' : ''}`}>
        <Icon name={item.icon} />
      </span>
      <span className="how__text">
        <strong>{item.label}</strong>
        {item.note && <span className={item.flag ? 'how__flag' : 'how__note'}>{item.note}</span>}
      </span>
    </>
  )
}

function Arrow() {
  return (
    <span className="how__arrow" aria-hidden="true">
      <span className="how__arrow-line" />
      <Icon name="arrow-right" />
    </span>
  )
}

export function HowItWorks({ how }) {
  if (!how) {
    return null
  }

  return (
    <figure className={`how how--${how.kind}`} data-reveal>
      <figcaption className="how__title">{how.title}</figcaption>

      {how.kind === 'sources' && (
        <div className="how__row">
          <ul className="how__list">
            {how.items.map((item, index) => (
              <li key={item.label} className="how__item" style={{ '--i': index }}>
                <Step item={item} />
              </li>
            ))}
          </ul>
          <Arrow />
          <div className="how__hub">
            <Step item={how.target} />
          </div>
        </div>
      )}

      {how.kind === 'fan' && (
        <div className="how__row">
          <div className="how__hub">
            <Step item={how.source} />
          </div>
          <Arrow />
          <ul className="how__list">
            {how.items.map((item, index) => (
              <li
                key={item.label}
                className={`how__item${item.flag ? ' how__item--flag' : ''}`}
                style={{ '--i': index }}
              >
                <Step item={item} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {how.kind === 'timeline' && (
        <ol className="how__timeline">
          {how.items.map((item, index) => (
            <li
              key={item.label}
              className={`how__stop${item.flag ? ' how__stop--flag' : ''}`}
              style={{ '--i': index }}
            >
              <Step item={item} />
            </li>
          ))}
        </ol>
      )}

      {how.kind === 'choices' && (
        <ul className="how__choices">
          {how.items.map((item, index) => (
            <li key={item.label} className="how__choice" style={{ '--i': index }}>
              <span className="how__icon">
                <Icon name={item.icon} />
              </span>
              <strong>{item.label}</strong>
              <span className="how__switch" aria-hidden="true">
                <span />
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
