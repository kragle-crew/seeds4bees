import { createPortal } from 'react-dom';

const SEASON_LABEL = {
  early: 'Spring',
  mid: 'Summer',
  late: 'Late summer and fall',
};

/**
 * A printable seed shopping list for one mix.
 *
 * Rendered outside the app's root, hidden on screen, and the only thing
 * shown when printing (see the print block in index.css). That way printing
 * gives a clean list to take to a nursery rather than a copy of the screen
 * with buttons and tabs on it.
 *
 * Scientific names are printed in full because that is how seed sellers
 * list native plants; common names vary from one region and catalog to the
 * next, and two different plants can share one.
 */
export default function ShoppingList({ mix, relaxed }) {
  return createPortal(
    <div className="printsheet">
      <h1 className="printsheet__title">
        Seed shopping list: {mix.name}
      </h1>
      <p className="printsheet__lead">
        {mix.picks.length} native plants for the rusty patched bumble bee and
        the monarch butterfly, from Seeds4Bees (seeds4bees.net).
      </p>

      {relaxed.length > 0 && (
        <p className="printsheet__warning">
          Nothing matched every answer exactly, so this list includes{' '}
          {relaxed.join(', ')}.
        </p>
      )}

      {['early', 'mid', 'late'].map((season) => {
        const inSeason = mix.picks.filter((p) => p.season === season);
        if (inSeason.length === 0) return null;

        return (
          <section key={season}>
            <h2 className="printsheet__season">{SEASON_LABEL[season]}</h2>
            <ul className="printsheet__list">
              {inSeason.map((plant) => (
                <li key={plant.id} className="printsheet__item">
                  <span className="printsheet__box" aria-hidden="true" />
                  <span>
                    <strong>{plant.common}</strong>{' '}
                    <em>{plant.scientific}</em>
                    <span className="printsheet__meta">
                      Blooms {plant.bloom} &middot; {plant.height[0]}&ndash;
                      {plant.height[1]} ft
                      {plant.monarch === 'host' && ' · monarch caterpillar food'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="printsheet__tip">
        Ask for each plant by its scientific name, in italics. Buy from a
        native seed company or nursery near you if you can, since plants grown
        from local seed are best suited to your weather.
      </p>
    </div>,
    document.body,
  );
}
