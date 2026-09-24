import ApiStatus from './ApiStatus.jsx';

/**
 * The landing screen.
 *
 * Its job is to explain who the app is for before asking anybody to answer
 * seven questions. Someone who lands here without knowing what a rusty
 * patched bumble bee is should still understand why the questions matter.
 */
export default function HomeScreen({ onStart, questionCount, plantCount }) {
  return (
    <>
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

        <button type="button" className="start" onClick={onStart}>
          Find my seed mix
        </button>

        <p className="start__note">
          {questionCount} questions, about a minute. Nothing is saved and you do
          not need an account.
        </p>
      </header>

      <main className="main">
        <section>
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
          <h2 className="section__title">How it works</h2>
          <ol className="how">
            <li>
              <strong>You answer questions about your spot.</strong> Sun, water,
              soil, size, and what else lives there.
            </li>
            <li>
              <strong>We rule out what would die.</strong> Only plants that can
              survive those exact conditions stay in.
            </li>
            <li>
              <strong>We build mixes that bloom all season.</strong> Bumble bee
              queens fly in April and workers are still out in October, so a
              garden that only blooms in July leaves them hungry at both ends.
            </li>
            <li>
              <strong>Every mix includes milkweed when it can.</strong> Monarch
              caterpillars eat nothing else.
            </li>
          </ol>
          <p className="how__note">
            Our list has {plantCount} native plants of the Upper Midwest.
          </p>
        </section>

        <section>
          <h2 className="section__title">Is everything wired up?</h2>
          <ApiStatus />
        </section>
      </main>
    </>
  );
}
