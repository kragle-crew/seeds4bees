import { useEffect, useMemo, useRef, useState } from 'react';

import DataPage from './components/DataPage.jsx';
import FlowerCheck from './components/FlowerCheck.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import LeaveDialog from './components/LeaveDialog.jsx';
import QuestionScreen from './components/QuestionScreen.jsx';
import SeedMixResults from './components/SeedMixResults.jsx';
import { plants } from './data/plants.js';
import { questionIds, questions, siteFrom } from './data/questions.js';
import { recommend } from './lib/recommend.js';

/**
 * How long a chosen answer stays on screen before the next question replaces
 * it. Long enough to see which box was hit, short enough not to feel like
 * waiting. Advancing instantly reads as a glitch rather than a confirmation.
 */
const ADVANCE_MS = 220;

export default function App() {
  const [stage, setStage] = useState('home');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // The option tapped but not yet committed, so it can stay highlighted
  // during the pause before the next question.
  const [pending, setPending] = useState(null);
  const timer = useRef(null);

  // True while asking whether to abandon the questions.
  const [leaving, setLeaving] = useState(false);

  // A pending advance must not outlive the component, or React would be told
  // to update state that no longer exists.
  useEffect(() => () => clearTimeout(timer.current), []);

  // Each screen is a fresh page as far as the visitor is concerned, so start
  // them at the top of it rather than wherever the last one was scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stage, index]);

  const answer = (questionId, value) => {
    setPending(value);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setAnswers((current) => ({ ...current, [questionId]: value }));
      setPending(null);

      if (index + 1 < questions.length) setIndex(index + 1);
      else setStage('results');
    }, ADVANCE_MS);
  };

  const goTo = (nextStage, nextIndex = 0) => {
    clearTimeout(timer.current);
    setPending(null);
    setIndex(nextIndex);
    setStage(nextStage);
  };

  const back = () =>
    index === 0 ? goTo('home') : goTo('survey', index - 1);

  const startOver = () => {
    setAnswers({});
    goTo('home');
  };

  // Partway through the questions, leaving loses work, so ask first. Before
  // the first answer there is nothing to lose, and the results page keeps the
  // answers on screen, so neither needs asking.
  const answeredCount = Object.keys(answers).length;
  const midSurvey = stage === 'survey' && answeredCount > 0;

  const goHome = () => (midSurvey ? setLeaving(true) : startOver());

  // Closing or reloading the tab mid-survey gets the browser's own warning,
  // since the page cannot show its dialog once the tab is going away.
  useEffect(() => {
    if (!midSurvey) return undefined;

    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [midSurvey]);

  // Only computed on the results screen, and only when the answers change.
  const result = useMemo(
    () => (stage === 'results' ? recommend(siteFrom(answers)) : null),
    [stage, answers],
  );

  const question = questions[index];

  // Someone who opens the data page from their results should be able to get
  // back to those results, not be dropped at the start with answers wiped.
  const hasResults = questionIds.every((id) => answers[id]);

  return (
    <div className="page">
      {stage !== 'home' && (
        <nav className="topbar" aria-label="Site">
          {/* Just a name. The Home button beside it is the way back. */}
          <span className="wordmark">
            Seeds<span className="hero__accent">4</span>Bees
          </span>
          <button type="button" className="homebtn" onClick={goHome}>
            <svg
              className="homebtn__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5.5 10v9.5h5v-6h3v6h5V10" />
            </svg>
            Home
          </button>
        </nav>
      )}

      {stage === 'home' && (
        <HomeScreen
          onStart={() => goTo('survey', 0)}
          onCheckFlower={() => goTo('flower')}
          onSeeData={() => goTo('data')}
          questionCount={questions.length}
          plantCount={plants.length}
        />
      )}

      {stage === 'survey' && (
        <main className="main">
          <QuestionScreen
            question={question}
            number={index + 1}
            total={questions.length}
            chosen={answers[question.id]}
            pending={pending}
            onAnswer={answer}
            onBack={back}
          />
          <LeaveDialog
            open={leaving}
            answered={answeredCount}
            total={questions.length}
            onStay={() => setLeaving(false)}
            onLeave={() => {
              setLeaving(false);
              startOver();
            }}
          />
        </main>
      )}

      {stage === 'flower' && (
        <main className="main">
          <FlowerCheck onHome={startOver} />
        </main>
      )}

      {stage === 'data' && (
        <main className="main">
          <DataPage
            onHome={startOver}
            onBackToMixes={hasResults ? () => goTo('results') : null}
          />
        </main>
      )}

      {stage === 'results' && (
        <main className="main">
          <h2 className="section__title">Your seed mixes</h2>
          <SeedMixResults
            result={result}
            onReview={() => goTo('survey', 0)}
            onRestart={startOver}
            onSeeData={() => goTo('data')}
          />
        </main>
      )}
    </div>
  );
}
