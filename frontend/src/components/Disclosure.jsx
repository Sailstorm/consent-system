import { useId, useState } from 'react'
import Icon from './Icon'

// A show/hide section that opens with a smooth height animation.
function Disclosure({ openLabel, closeLabel, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className={`disclosure${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="btn disclosure__toggle no-print"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        {open ? closeLabel : openLabel}
        <Icon name="chevron-down" />
      </button>

      <div className="disclosure__body" id={id} inert={open ? undefined : true}>
        <div>
          <div className="disclosure__content">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Disclosure
