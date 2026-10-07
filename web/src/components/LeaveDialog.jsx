import { useEffect, useRef } from 'react';

/**
 * Asks before someone leaves the seed mix questions halfway through.
 *
 * Going home wipes the answers, and the Home button sits right at the top of
 * every question, so it is easy to hit by mistake. A native <dialog> gives a
 * real modal for free: focus moves into it, Escape cancels, and the page
 * behind it cannot be clicked.
 */
export default function LeaveDialog({ open, answered, total, onStay, onLeave }) {
  const dialog = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="leave"
      aria-labelledby="leave-title"
      onCancel={(event) => {
        event.preventDefault();
        onStay();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the dialog itself.
        if (event.target === dialog.current) onStay();
      }}
    >
      <h2 id="leave-title" className="leave__title">
        Leave the questions?
      </h2>
      <p className="leave__text">
        You have answered {answered} of {total} questions. If you leave now,
        your answers will be cleared and you will have to start again.
      </p>
      <div className="leave__actions">
        <button type="button" className="btn btn--stay" onClick={onStay} autoFocus>
          Keep going
        </button>
        <button type="button" className="btn btn--quiet" onClick={onLeave}>
          Leave and clear answers
        </button>
      </div>
    </dialog>
  );
}
