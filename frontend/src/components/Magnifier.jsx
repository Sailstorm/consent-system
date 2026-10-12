import { useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon'
import '../styles/magnifier.css'

// The site's signature: a lens glides over a privacy policy's small print.
// Inside the lens the text is enlarged and the phrases that matter are
// highlighted, and a plain-English line explains each one. It loops, so
// it has a Pause button (WCAG 2.2.2) and is still under Calm motion.

const STOPS = [
  {
    phrase: 'your location and contacts',
    plain: 'They collect where you are and who you know.',
  },
  {
    phrase: 'disclose it to marketing partners overseas',
    plain: 'They may pass your details to advertisers outside Australia.',
  },
  {
    phrase: 'for up to seven years',
    plain: 'They keep your information for up to seven years.',
  },
]

function FinePrint({ withRefs }) {
  const mark = (index) => (
    <mark data-stop={withRefs ? index + 1 : undefined}>{STOPS[index].phrase}</mark>
  )

  return (
    <>
      <p className="mag-doc__title">Privacy Policy</p>
      <p className="mag-doc__meta">Last updated 1 July 2026 · Version 14.2</p>
      <p>
        <b>1. Information we collect.</b> When you register, purchase or
        otherwise interact with our Services, we may collect personal
        information including your name, date of birth, contact details,
        payment information and, where you grant permission, {mark(0)},
        together with technical data such as device identifiers and usage logs.
      </p>
      <p>
        <b>2. Use and disclosure.</b> We use personal information to provide
        and improve the Services, for analytics and research, and may{' '}
        {mark(1)} and to related bodies corporate, who may use it for their own
        purposes subject to their own privacy policies.
      </p>
      <p>
        <b>3. Retention.</b> We retain personal information {mark(2)} after
        your last interaction with us, or longer where required or permitted
        by law, after which it may be de-identified.
      </p>
      <p>
        <b>4. Access.</b> You may request access to personal information we
        hold about you by writing to our Privacy Officer. A fee may apply.
      </p>
    </>
  )
}

function Magnifier({ showCaptions = true, label }) {
  const stageRef = useRef(null)
  const docRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const [docWidth, setDocWidth] = useState(0)

  // Measure where each highlighted phrase sits, so the lens can travel to
  // it at any screen width.
  useLayoutEffect(() => {
    const stage = stageRef.current
    const doc = docRef.current

    if (!stage || !doc) {
      return undefined
    }

    // Layout offsets, not bounding boxes: the card is slightly rotated, and
    // offsets ignore transforms. Each phrase is measured on its first line.
    function measure() {
      doc.querySelectorAll('mark[data-stop]').forEach((element) => {
        const firstLine = element.getClientRects()[0]
        const lineWidth = firstLine ? firstLine.width : element.offsetWidth
        const n = element.dataset.stop

        stage.style.setProperty(
          `--s${n}x`,
          `${element.offsetLeft + Math.min(lineWidth, 140) / 2}px`,
        )
        stage.style.setProperty(
          `--s${n}y`,
          `${element.offsetTop + element.offsetHeight / 2}px`,
        )
      })

      setDocWidth(doc.offsetWidth)
      setReady(true)
    }

    measure()

    // Re-measure when the web fonts arrive: they change where lines break.
    let active = true
    document.fonts?.ready.then(() => active && measure())

    const observer = new ResizeObserver(measure)
    observer.observe(doc)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [])

  return (
    <div className="mag-wrap">
      <div
        ref={stageRef}
        className={`mag-stage${ready ? ' is-ready' : ''}${paused ? ' is-paused' : ''}`}
      >
        <p className="visually-hidden">
          {label ||
            'Illustration: a magnifying glass moves across the small print of a privacy policy and highlights the parts that matter.'}
        </p>

        <div className="magnifier" aria-hidden="true">
          <div className="mag-doc" ref={docRef}>
            <FinePrint withRefs />
          </div>

          <div className="mag-lens">
            <div className="mag-lens__view">
              <div className="mag-doc mag-doc--zoomed" style={{ width: docWidth || undefined }}>
                <FinePrint />
              </div>
            </div>
            <span className="mag-lens__handle" />
          </div>
        </div>

        {showCaptions && (
          <div className="mag-captions" aria-hidden="true">
            <span className="mag-captions__label">In plain English</span>
            <div className="mag-captions__stack">
              {STOPS.map((stop, index) => (
                <p key={stop.plain} className={`mag-caption mag-caption--${index + 1}`}>
                  {stop.plain}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        className="mag-pause no-print"
        aria-pressed={paused}
        onClick={() => setPaused(!paused)}
      >
        <Icon name={paused ? 'play' : 'pause'} />
        {paused ? 'Play animation' : 'Pause animation'}
      </button>
    </div>
  )
}

export default Magnifier
