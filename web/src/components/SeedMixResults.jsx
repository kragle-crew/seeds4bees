import { useState } from 'react';

const SEASON_LABEL = {
  early: 'Spring',
  mid: 'Summer',
  late: 'Late summer and fall',
};

const SEASON_WHY = {
  early: 'Feeds bumble bee queens starting colonies, when little else is open.',
  mid: 'The growing season, and when monarch caterpillars need milkweed leaves.',
  late: 'Fuels migrating monarchs and the last bumble bees of the year.',
};

/** One plant, with the reason it was chosen rather than just its name. */
function PlantRow({ plant }) {
  return (
    <li className="plant">
      <div className="plant__head">
        <span className="plant__common">{plant.common}</span>
        <em className="plant__latin">{plant.scientific}</em>
      </div>

      <div className="plant__tags">
        <span className="tag tag--bloom">Blooms {plant.bloom}</span>
        <span className="tag">
          {plant.height[0]}&ndash;{plant.height[1]} ft
        </span>
        {plant.monarch === 'host' && (
          <span className="tag tag--monarch">Monarch caterpillar food</span>
        )}
        {plant.monarch === 'nectar' && <span className="tag tag--monarch">Monarch nectar</span>}
        {plant.rustyPatched && <span className="tag tag--bee">Rusty patched favorite</span>}
        {plant.type === 'grass' && <span className="tag tag--nest">Nesting cover</span>}
      </div>

      <p className="plant__why">{plant.why}</p>
    </li>
  );
}

/**
 * What the mix does for each of the two species.
 *
 * This is the part that makes the recommendation arguable instead of magic:
 * the numbers are counted from the plants actually chosen, so if the list
 * changes, this changes with it.
 */
function ServesPanel({ serves }) {
  const { monarch, rustyPatched } = serves;

  return (
    <div className="serves">
      <div className="serves__side">
        <h4 className="serves__who">Monarch butterfly</h4>
        <ul className="serves__list">
          <li>
            <strong>{monarch.host}</strong> milkweed
            {monarch.host === 1 ? '' : 's'} for caterpillars
            {monarch.host === 0 && ' — adults only, no nursery'}
          </li>
          <li>
            <strong>{monarch.nectar}</strong> nectar plants for adults
          </li>
          <li>
            <strong>{monarch.fallNectar}</strong> of those bloom in fall, for the
            migration south
          </li>
        </ul>
      </div>

      <div className="serves__side">
        <h4 className="serves__who">Rusty patched bumble bee</h4>
        <ul className="serves__list">
          <li>
            <strong>{rustyPatched.favorites}</strong> known favorites
          </li>
          <li>
            <strong>{rustyPatched.spring}</strong> spring bloomers for queens
            leaving hibernation
          </li>
          <li>
            <strong>{rustyPatched.fall}</strong> fall bloomers for the end of the
            colony's year
          </li>
          <li>
            {rustyPatched.nesting > 0 ? (
              <>
                <strong>{rustyPatched.nesting}</strong> grass or sedge for nesting
                and winter shelter
              </>
            ) : (
              <>No nesting grass — add a bunch grass if you have room</>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * The results: several mixes for the same patch of ground.
 *
 * There is more than one defensible answer for any site, so the app shows the
 * alternatives side by side and explains what each is optimising for, rather
 * than hiding the choice behind a single confident-looking list.
 */
export default function SeedMixResults({ result }) {
  const { mixes, warnings, pool } = result;
  const [activeId, setActiveId] = useState(mixes[0]?.id);

  const active = mixes.find((m) => m.id === activeId) ?? mixes[0];

  return (
    <div className="results">
      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning) => (
            <p
              key={warning.text}
              className={`warning warning--${warning.level}`}
              role={warning.level === 'hard' ? 'alert' : undefined}
            >
              {warning.text}
            </p>
          ))}
        </div>
      )}

      {active && (
        <>
          <p className="results__lead">
            <strong>{pool.length}</strong> plants from our list can grow in that
            spot. Here are {mixes.length} ways to use them.
          </p>

          <div className="mixtabs" role="tablist" aria-label="Seed mix options">
            {mixes.map((mix) => (
              <button
                type="button"
                key={mix.id}
                role="tab"
                id={`tab-${mix.id}`}
                aria-selected={mix.id === active.id}
                aria-controls={`panel-${mix.id}`}
                className={`mixtab${mix.id === active.id ? ' mixtab--on' : ''}`}
                onClick={() => setActiveId(mix.id)}
              >
                <span className="mixtab__name">{mix.name}</span>
                <span className="mixtab__tagline">{mix.tagline}</span>
              </button>
            ))}
          </div>

          <section
            className="mix"
            role="tabpanel"
            id={`panel-${active.id}`}
            aria-labelledby={`tab-${active.id}`}
          >
            <p className="mix__blurb">{active.blurb}</p>

            <ServesPanel serves={active.serves} />

            <h3 className="mix__heading">
              {active.picks.length} plants in this mix
            </h3>

            {['early', 'mid', 'late'].map((season) => {
              const inSeason = active.picks.filter((p) => p.season === season);
              if (inSeason.length === 0) return null;

              return (
                <div className="season" key={season}>
                  <h4 className="season__title">{SEASON_LABEL[season]}</h4>
                  <p className="season__why">{SEASON_WHY[season]}</p>
                  <ul className="plants">
                    {inSeason.map((plant) => (
                      <PlantRow key={plant.id} plant={plant} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
