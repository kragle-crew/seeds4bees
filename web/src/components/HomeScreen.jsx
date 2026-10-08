import More from './More.jsx';

const COMMONS = 'https://commons.wikimedia.org/wiki/File:';

/**
 * The few facts someone should know before answering the questions, kept
 * short enough to read at a glance.
 *
 * Checked in October 2026 against the U.S. Fish and Wildlife Service pages
 * for each species, news coverage of the 2017 bee listing, and the September
 * 2026 court settlement that set the monarch decision for 2030. Recheck the
 * monarch's status before relying on it; it is the fact most likely to change.
 *
 * The photos are public domain, from Wikimedia Commons, and are saved in
 * public/img so the page does not depend on another site to load.
 */
const FACTS = [
  {
    title: 'Rusty patched bumble bee',
    image: '/img/bee.jpg',
    alt: 'A rusty patched bumble bee feeding on a lavender wild bergamot flower',
    points: [
      'In 2017 it became the first bumble bee in the U.S. to be listed as endangered.',
      'Workers and males have a rusty patch on their abdomen, which gives the bee its name.',
      'Nests underground, usually in old rodent burrows.',
      'Flies from early spring to mid-October and needs flowers the whole time. More pollen means a colony raises more new queens.',
    ],
    credit: 'Jill Utrup, USFWS (public domain)',
    creditUrl: `${COMMONS}Rusty-patched_bumble_bee_wild_bergamot.png`,
  },
  {
    title: 'Monarch butterfly',
    image: '/img/monarch.jpg',
    alt: 'An orange and black monarch butterfly hanging from pink common milkweed flowers',
    points: [
      'Eastern monarchs fly from as far as Canada to the mountains of central Mexico for the winter.',
      'Its caterpillars can eat only milkweed.',
      'Proposed as a threatened species in 2024, but not protected yet. A final decision is due by 2030.',
      'The U.S. Fish and Wildlife Service estimates eastern monarchs have a 56 to 74 percent chance of dying out by 2080.',
    ],
    credit: 'Courtney Celley, USFWS (public domain)',
    creditUrl: `${COMMONS}Monarch_butterfly_on_common_milkweed_(48372505506).jpg`,
  },
  {
    title: 'How a yard helps',
    image: '/img/bergamot.jpg',
    alt: 'A close-up of a lavender wild bergamot flower',
    points: [
      'Plant flowers that bloom in spring, summer, and fall, so there is always food.',
      'Add milkweed so monarchs have a place to lay their eggs.',
      'Choose native plants. They suit the local weather and soil.',
      'Leave fallen leaves and some ground undisturbed. Queens spend the winter just under the soil or leaf litter.',
    ],
    credit: 'Jasper Shide (CC0, public domain)',
    creditUrl: `${COMMONS}Monarda_fistulosa_-_Wild_Bergamot_(Flower).jpg`,
  },
];

/**
 * The landing screen.
 *
 * Its job is to explain who the app is for before asking anybody to answer
 * the questions. Someone who lands here without knowing what a rusty
 * patched bumble bee is should still understand why the questions matter.
 */
export default function HomeScreen({
  onStart,
  onCheckFlower,
  onSeeData,
  questionCount,
  plantCount,
}) {
  return (
    <>
      <header className="hero">
        <div className="hero__badges">
          <span className="hero__badge">FIRST LEGO League</span>
          <span className="hero__badge hero__badge--alt">Made with Claude</span>
        </div>
        <h1 className="hero__title">
          Seeds<span className="hero__accent">4</span>Bees
        </h1>
        <p className="hero__tagline">
          Tell us about your patch of ground and we will tell you what to plant
          for the <strong>rusty patched bumble bee</strong> and the{' '}
          <strong>monarch butterfly</strong>.
        </p>

        <div className="start__row">
          <button type="button" className="start" onClick={onStart}>
            Find my seed mix
          </button>

          <button type="button" className="start start--alt" onClick={onCheckFlower}>
            Check a flower I like
          </button>

          <button type="button" className="start start--alt" onClick={onSeeData}>
            See the raw data
          </button>
        </div>

        <p className="start__note">
          {questionCount} questions, about a minute. Nothing is saved and you do
          not need an account.
        </p>
      </header>

      <main className="main">
        <section>
          <h2 className="section__title">Quick facts</h2>
          <div className="facts">
            {FACTS.map((fact) => (
              <article key={fact.title} className="fact">
                <img
                  className="fact__img"
                  src={fact.image}
                  alt={fact.alt}
                  width="960"
                  height="640"
                  loading="lazy"
                />
                <div className="fact__body">
                  <h3 className="fact__title">{fact.title}</h3>
                  <ul className="fact__list">
                    {fact.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p className="fact__credit">
                    Photo:{' '}
                    <a href={fact.creditUrl} target="_blank" rel="noreferrer">
                      {fact.credit}
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section__title">How it works</h2>
          <More label="Read how it works">
            <ol className="how">
              <li>
                <strong>You answer questions about your spot.</strong> Sun, water,
                soil, how much room there is, and whether deer visit. Then you
                pick the kind of mix you want.
              </li>
              <li>
                <strong>We rule out what would die.</strong> Only plants that can
                survive those conditions stay in.
              </li>
              <li>
                <strong>We build mixes that bloom all season.</strong> Bumble bee
                queens are out in early spring and workers are still flying in
                October, so a garden that only blooms in July leaves them hungry
                at both ends.
              </li>
              <li>
                <strong>Almost every mix includes milkweed when one can grow
                there.</strong> Monarch caterpillars can eat nothing else.
              </li>
            </ol>
            <p className="how__note">
              Our list has {plantCount} native plants of the Upper Midwest.{' '}
              <button type="button" className="linkish" onClick={onSeeData}>
                See the data behind the mixes
              </button>{' '}
              to check any of it yourself.
            </p>
          </More>
        </section>
      </main>
    </>
  );
}
