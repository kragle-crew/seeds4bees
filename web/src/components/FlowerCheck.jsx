import { useState } from 'react';

import { featured, helpsWith, search, swapFor } from '../lib/lookup.js';

const VERDICT = {
  great: { label: 'Excellent for both', tone: 'great' },
  good: { label: 'Genuinely useful', tone: 'good' },
  limited: { label: 'Looks busy, does little', tone: 'limited' },
  caution: { label: 'Worth knowing about', tone: 'caution' },
};

const LEVEL_MARK = { yes: 'Yes', partly: 'Partly', no: 'No' };

/** One species verdict, said plainly rather than scored. */
function HelpRow({ who, level, text }) {
  return (
    <div className="help">
      <div className="help__head">
        <span className={`help__mark help__mark--${level}`}>
          {LEVEL_MARK[level]}
        </span>
        <span className="help__who">{who}</span>
      </div>
      <p className="help__text">{text}</p>
    </div>
  );
}

/**
 * The detail card for one plant.
 *
 * The order is deliberate: what it is, then what it does for the two species,
 * then where it wants to live, and only at the end a suggested native. Leading
 * with the swap would read as "you chose wrong", which is not the point.
 */
function PlantVerdict({ entry }) {
  const { monarch, rustyPatched } = helpsWith(entry);
  const swap = swapFor(entry);
  const verdict = VERDICT[entry.verdict];

  return (
    <div className="verdict">
      <div className="verdict__head">
        <h3 className="verdict__name">
          {entry.common} <em className="plant__latin">{entry.scientific}</em>
        </h3>
        <span className={`badge badge--${verdict.tone}`}>{verdict.label}</span>
      </div>

      {entry.native && (
        <p className="verdict__native">
          Native to the Upper Midwest
          {entry.bloom ? ` · blooms ${entry.bloom}` : ''}
        </p>
      )}

      <p className="verdict__summary">{entry.summary}</p>

      {entry.localNote && <p className="verdict__note">{entry.localNote}</p>}

      <div className="helps">
        <HelpRow who="Monarch butterfly" {...monarch} />
        <HelpRow who="Rusty patched bumble bee" {...rustyPatched} />
      </div>

      <div className="verdict__care">
        <h4 className="verdict__caption">Where it wants to live</h4>
        <p>{entry.care}</p>
      </div>

      {swap && (
        <div className="verdict__swap">
          <h4 className="verdict__caption">
            A native that fills the same spot
          </h4>
          <p className="swap__name">
            {swap.common} <em className="plant__latin">{swap.scientific}</em>
          </p>
          <p className="swap__why">{swap.summary}</p>
          <p className="swap__care">{swap.care}</p>
          <p className="swap__note">
            You do not have to dig anything up. Adding one of these alongside
            what you already have is enough.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Search a plant by name and find out whether it helps.
 *
 * This answers the question the seed mix finder cannot: people usually
 * already have a garden, and want to know whether what is in it counts.
 */
export default function FlowerCheck({ onHome }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const results = search(query);
  const showing = query.trim() ? results : featured;

  return (
    <div className="flowercheck">
      <h2 className="qscreen__title">Check a flower you like</h2>
      <p className="qscreen__help">
        Type a flower you already grow, or one you want to plant, and we will
        tell you where it wants to live and whether it helps.
      </p>

      <input
        type="search"
        className="searchbox"
        placeholder="Try tulip, milkweed, hosta, lavender..."
        aria-label="Search for a plant by name"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(null);
        }}
      />

      {!query.trim() && (
        <p className="flowercheck__hint">Or start with one people often ask about:</p>
      )}

      {showing.length > 0 ? (
        <div className="hits">
          {showing.map((entry) => (
            <button
              type="button"
              key={entry.id}
              className={`hit${selected?.id === entry.id ? ' hit--on' : ''}`}
              aria-pressed={selected?.id === entry.id}
              onClick={() => setSelected(entry)}
            >
              <span className="hit__name">{entry.common}</span>
              <span className={`dot dot--${VERDICT[entry.verdict].tone}`} />
            </button>
          ))}
        </div>
      ) : (
        <p className="flowercheck__empty">
          No match for &ldquo;{query.trim()}&rdquo;. Our list covers native
          plants of the Upper Midwest plus common garden flowers, so something
          unusual may not be in it yet.
        </p>
      )}

      {selected && <PlantVerdict entry={selected} />}

      <div className="qscreen__nav">
        <button type="button" className="btn btn--quiet" onClick={onHome}>
          Back to the start
        </button>
      </div>
    </div>
  );
}
