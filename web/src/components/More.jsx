import { useEffect, useState } from 'react';

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

/** Matches the phone breakpoint in index.css. */
const PHONE = '(max-width: 40rem)';

/**
 * True on a phone-sized screen, and kept up to date if the window is resized
 * or the phone is turned sideways.
 */
export function usePhone() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);

  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const update = () => setPhone(query.matches);

    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return phone;
}

/**
 * Folded on a phone, open on a computer.
 *
 * For things that are useful to see at a glance on a big screen but push
 * everything else several screens down on a small one: long lists, wide
 * tables, and fine print.
 */
export function PhoneFold({ label, children }) {
  return usePhone() ? <More label={label}>{children}</More> : children;
}
