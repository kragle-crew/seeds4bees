import { useEffect, useMemo, useRef, useState } from 'react';

import HomeScreen from './components/HomeScreen.jsx';
import QuestionScreen from './components/QuestionScreen.jsx';
import SeedMixResults from './components/SeedMixResults.jsx';
import { plants } from './data/plants.js';
import { questions, siteFrom } from './data/questions.js';
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

  // Only computed on the results screen, and only when the answers change.
  const result = useMemo(
    () => (stage === 'results' ? recommend(siteFrom(answers)) : null),
    [stage, answers],
  );

  const question = questions[index];

  return (
    <div className="page">
      {stage !== 'home' && (
        <div className="topbar">
          <button type="button" className="wordmark" onClick={startOver}>
            Seeds<span className="hero__accent">4</span>Bees
          </button>
        </div>
      )}

      {stage === 'home' && (
        <HomeScreen
          onStart={() => goTo('survey', 0)}
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
        </main>
      )}

      {stage === 'results' && (
        <main className="main">
          <h2 className="section__title">Your seed mixes</h2>
          <SeedMixResults
            result={result}
            onReview={() => goTo('survey', 0)}
            onRestart={startOver}
          />
        </main>
      )}

      <footer className="footer">
        <p>
          Built by the Kragle Crew &middot;{' '}
          <a href="https://github.com/kragle-crew/seeds4bees">Source on GitHub</a>{' '}
          &middot; Hosted on AWS
        </p>
        <p className="footer__note">
          Plant suggestions are a starting point for the Upper Midwest. Check
          them against the Xerces Society, your state extension office, or a
          native plant nursery before you buy seed.
        </p>
      </footer>
    </div>
  );
}
