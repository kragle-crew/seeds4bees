import { useState } from 'react';

import { strategies } from '../lib/recommend.js';
import More, { usePhone } from './More.jsx';
import ShoppingList from './ShoppingList.jsx';

const SEASON_LABEL = {
  early: 'Spring',
  mid: 'Summer',
  late: 'Late summer and fall',
};

/**
 * How many mixes show before "See more". Five fill one row on a computer,
 * and the first ones listed are the broadest; the rest are for people who
 * want something specific.
 */
const FIRST_MIXES = 5;

const SEASON_WHY = {
  early: 'Feeds bumble bee queens starting colonies, when little else is open.',
  mid: 'The growing season, and when monarch caterpillars need milkweed leaves.',
  late: 'Fuels migrating monarchs and the last bumble bees of the year.',
};

/** One plant, with the reason it was chosen rather than just its name. */
function PlantRow({ plant, showWhy }) {
  return (
    // Brief cards drop the secondary tags and the Latin name on a phone, where
    // they wrap onto three or four lines per plant. See index.css.
    <li className={`plant${showWhy ? '' : ' plant--brief'}`}>
      <div className="plant__head">
        <span className="plant__common">{plant.common}</span>
        <em className="plant__latin">{plant.scientific}</em>
      </div>

      <div className="plant__tags">
        <span className="tag tag--bloom">Blooms {plant.bloom}</span>
        <span className="tag tag--extra">
          {plant.height[0]}&ndash;{plant.height[1]} ft
        </span>
        {plant.monarch === 'host' && (
          <span className="tag tag--monarch">Monarch caterpillar food</span>
        )}
        {plant.monarch === 'nectar' && <span className="tag tag--monarch tag--extra">Monarch nectar</span>}
        {plant.rustyPatched && <span className="tag tag--bee tag--extra">Rusty patched favorite</span>}
        {plant.type === 'grass' && <span className="tag tag--nest tag--extra">Nesting cover</span>}
        {plant.xercesListed && (
          <span className="tag tag--xerces tag--extra" title="Appears on the Xerces Society Great Lakes pollinator plant list">
            Xerces list
          </span>
        )}
      </div>

      {showWhy && <p className="plant__why">{plant.why}</p>}
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
export default function SeedMixResults({ result, onReview, onRestart, onSeeData }) {
  const { mixes, warnings, pool, relaxed = [] } = result;
  const [activeId, setActiveId] = useState(mixes[0]?.id);
  const [allMixes, setAllMixes] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const phone = usePhone();

  const active = mixes.find((m) => m.id === activeId) ?? mixes[0];
  // The chosen mix stays on screen even after "Show fewer", so the tabs never
  // hide the one whose plants are listed below them.
  const shownMixes = allMixes
    ? mixes
    : mixes.filter((mix, i) => i < FIRST_MIXES || mix.id === active?.id);
  const canFold = mixes.length > FIRST_MIXES;
  const hiddenCount = mixes.length - shownMixes.length;

  return (
    <div className="results">
      <div className="results__actions">
        {/* Shorter labels on a phone keep all three on one line. */}
        <button type="button" className="btn" onClick={onReview}>
          {phone ? 'Change answers' : 'Change my answers'}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onSeeData}>
          {phone ? 'Raw data' : 'See the raw data'}
        </button>
        <button type="button" className="btn btn--quiet" onClick={onRestart}>
          Start over
        </button>
      </div>

      {relaxed.length > 0 && (
        <div className="compromise" role="note">
          <strong>Nothing matched all your answers exactly.</strong>
          <p>
            To find anything at all for this spot we had to include{' '}
            {relaxed.length === 1
              ? relaxed[0]
              : `${relaxed.slice(0, -1).join(', ')} and ${relaxed[relaxed.length - 1]}`}
            . Treat the list below as the closest we have rather than a
            promise, and change an answer above if one of those is a deal
            breaker.
          </p>
        </div>
      )}

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
            spot. Here {mixes.length === 1 ? 'is 1 way' : `are ${mixes.length} ways`}{' '}
            to use them.
            {mixes.length < strategies.length && (allMixes || !canFold) && (
              <>
                {' '}
                We have {strategies.length} kinds of mix, but for this spot some
                came out nearly the same as another, so we only show the ones
                that are really different.
              </>
            )}
          </p>

          <div className="mixtabs" role="tablist" aria-label="Seed mix options">
            {shownMixes.map((mix) => (
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

          {canFold && (allMixes || hiddenCount > 0) && (
            <button
              type="button"
              className="seemore"
              aria-expanded={allMixes}
              onClick={() => setAllMixes(!allMixes)}
            >
              {allMixes
                ? 'Show fewer mixes'
                : `See ${hiddenCount} more ${hiddenCount === 1 ? 'mix' : 'mixes'}`}
            </button>
          )}

          <section
            className="mix"
            role="tabpanel"
            id={`panel-${active.id}`}
            aria-labelledby={`tab-${active.id}`}
          >
            {/* Keyed so switching mixes folds the description back up. */}
            <More key={active.id} label="About this mix">
              <p className="mix__blurb">{active.blurb}</p>
              <ServesPanel serves={active.serves} />
            </More>

            <div className="mix__headrow">
              <h3 className="mix__heading">
                {active.picks.length} plants in this mix
              </h3>
              <button
                type="button"
                className="btn btn--print"
                onClick={() => window.print()}
              >
                Print shopping list
              </button>
            </div>

            <button
              type="button"
              className="seemore seemore--under"
              aria-expanded={showWhy}
              onClick={() => setShowWhy(!showWhy)}
            >
              {showWhy ? 'Hide the details' : 'Show details for each plant'}
            </button>

            {['early', 'mid', 'late'].map((season) => {
              const inSeason = active.picks.filter((p) => p.season === season);
              if (inSeason.length === 0) return null;

              return (
                <div className="season" key={season}>
                  <h4 className="season__title">{SEASON_LABEL[season]}</h4>
                  {showWhy && <p className="season__why">{SEASON_WHY[season]}</p>}
                  <ul className="plants">
                    {inSeason.map((plant) => (
                      <PlantRow key={plant.id} plant={plant} showWhy={showWhy} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          <ShoppingList mix={active} relaxed={relaxed} />
        </>
      )}
    </div>
  );
}
