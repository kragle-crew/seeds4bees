import { useMemo, useState } from 'react';

import ApiStatus from './components/ApiStatus.jsx';
import SeedMixResults from './components/SeedMixResults.jsx';
import SiteSurvey from './components/SiteSurvey.jsx';
import { questionIds, siteFrom } from './data/questions.js';
import { recommend } from './lib/recommend.js';

export default function App() {
  const [answers, setAnswers] = useState({});

  const answer = (questionId, value) =>
    setAnswers((current) => ({ ...current, [questionId]: value }));

  const answered = questionIds.filter((id) => answers[id]).length;
  const complete = answered === questionIds.length;

  // Recomputed only when an answer changes. The matching is fast enough to
  // run on every render, but memoising keeps the mix from being rebuilt when
  // the visitor merely switches tabs in the results.
  const result = useMemo(
    () => (complete ? recommend(siteFrom(answers)) : null),
    [answers, complete],
  );

  return (
    <div className="page">
      <header className="hero">
        <span className="hero__badge">FIRST LEGO League</span>
        <h1 className="hero__title">
          Seeds<span className="hero__accent">4</span>Bees
        </h1>
        <p className="hero__tagline">
          Tell us about your patch of ground and we will tell you what to plant
          for the <strong>rusty patched bumble bee</strong> and the{' '}
          <strong>monarch butterfly</strong>.
        </p>
      </header>

      <main className="main">
        <section className="intro">
          <h2 className="section__title">Why these two</h2>
          <p className="intro__text">
            The rusty patched bumble bee was once common across the Upper
            Midwest and is now endangered, surviving in a fraction of its old
            range. The monarch butterfly makes a migration to Mexico that takes
            several generations, and its caterpillars can eat only milkweed.
            Both are running out of places to eat and nest, and both can be
            helped by an ordinary yard planted on purpose.
          </p>
        </section>

        <section>
          <h2 className="section__title">Your planting spot</h2>
          <p className="section__intro">
            Click an answer for each question. Everything you pick changes which
            plants can actually survive there.
          </p>

          <SiteSurvey answers={answers} onAnswer={answer} />
        </section>

        <section>
          <h2 className="section__title">Your seed mixes</h2>

          {complete ? (
            <SeedMixResults result={result} />
          ) : (
            <p className="pending">
              Answer {questionIds.length - answered} more{' '}
              {questionIds.length - answered === 1 ? 'question' : 'questions'} and
              your seed mixes will appear here.
            </p>
          )}
        </section>

        <section>
          <h2 className="section__title">Is everything wired up?</h2>
          <ApiStatus />
        </section>
      </main>

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
