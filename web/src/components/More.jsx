import { useState } from 'react';

/**
 * Explanatory text, folded away until somebody asks for it.
 *
 * The app explains a lot, and on first look that reads as clutter. Choices,
 * plant names, and warnings stay on screen; the reasons behind them sit
 * behind one of these.
 */
export default function More({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="more">
      <button
        type="button"
        className="seemore"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? 'Show less' : label}
      </button>
      {open && <div className="more__body">{children}</div>}
    </div>
  );
}
