import { questions } from '../data/questions.js';

/**
 * The site survey: one block per question, answered by clicking a box.
 *
 * Every question is on screen at once rather than in a wizard. A visitor who
 * realises halfway through that their soil is really clay can just change
 * that one answer and watch the mixes update, instead of restarting.
 *
 * The options are real <button> elements, so they are keyboard reachable and
 * a screen reader announces which one is chosen. `aria-pressed` carries the
 * selected state, since color alone would leave that information out.
 */
export default function SiteSurvey({ answers, onAnswer }) {
  return (
    <div className="survey">
      {questions.map((question, index) => (
        <fieldset className="question" key={question.id}>
          <legend className="question__legend">
            <span className="question__number">{index + 1}</span>
            <span>
              <span className="question__title">{question.title}</span>
              <span className="question__help">{question.help}</span>
            </span>
          </legend>

          <div className="options">
            {question.options.map((option) => {
              const selected = answers[question.id] === option.value;

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`option${selected ? ' option--on' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onAnswer(question.id, option.value)}
                >
                  <span className="option__label">{option.label}</span>
                  <span className="option__detail">{option.detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
