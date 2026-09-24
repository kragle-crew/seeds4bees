/**
 * One question, on its own screen.
 *
 * Choosing an option answers and advances in a single tap, which keeps the
 * survey to seven taps total. The parent holds the short pause before moving
 * on, so the visitor sees which box they hit instead of the screen changing
 * out from under them.
 *
 * Going back is always possible and always keeps the earlier answer, so a
 * wrong tap costs one click rather than a restart.
 */
export default function QuestionScreen({
  question,
  number,
  total,
  chosen,
  pending,
  onAnswer,
  onBack,
}) {
  return (
    <div className="qscreen">
      <div className="progress">
        <div className="progress__label">
          Question {number} of {total}
        </div>
        <div
          className="progress__track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={number}
          aria-label="Survey progress"
        >
          <div
            className="progress__fill"
            style={{ width: `${(number / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="qscreen__title">{question.title}</h2>
      <p className="qscreen__help">{question.help}</p>

      <div className="options">
        {question.options.map((option) => {
          const selected = pending
            ? pending === option.value
            : chosen === option.value;

          return (
            <button
              type="button"
              key={option.value}
              className={`option${selected ? ' option--on' : ''}`}
              aria-pressed={selected}
              disabled={Boolean(pending)}
              onClick={() => onAnswer(question.id, option.value)}
            >
              <span className="option__label">{option.label}</span>
              <span className="option__detail">{option.detail}</span>
            </button>
          );
        })}
      </div>

      <div className="qscreen__nav">
        <button type="button" className="btn btn--quiet" onClick={onBack}>
          {number === 1 ? 'Back to the start' : 'Back'}
        </button>
      </div>
    </div>
  );
}
