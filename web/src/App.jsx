import ApiStatus from './components/ApiStatus.jsx';

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <span className="hero__badge">FIRST LEGO League</span>
        <h1 className="hero__title">
          Seeds<span className="hero__accent">4</span>Bees
        </h1>
        <p className="hero__tagline">
          Planting the right seeds so pollinators have somewhere to land.
        </p>
      </header>

      <main className="main">
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
      </footer>
    </div>
  );
}
