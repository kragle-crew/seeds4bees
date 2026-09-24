import { useMemo, useState } from 'react';

import { gardenPlants } from '../data/gardenPlants.js';
import { plants } from '../data/plants.js';
import { strategies, typicalHeight } from '../lib/recommend.js';

const REPO = 'https://github.com/kragle-crew/seeds4bees/blob/main/web/src';

const SUN = { sun: 'Sun', part: 'Part', shade: 'Shade' };
const WATER = { wet: 'Wet', medium: 'Med', dry: 'Dry' };
const SOIL = { sand: 'Sand', loam: 'Loam', clay: 'Clay' };
const SEASON = { early: 'Spring', mid: 'Summer', late: 'Fall' };

const join = (values, table) => values.map((v) => table[v]).join(' ');

/**
 * Short flags, so the table stays readable.
 * Only true values are shown; a blank cell means false.
 */
function Flags({ plant }) {
  const flags = [
    plant.xercesListed && ['xerces', 'Xerces'],
    plant.standingWater && ['flood', 'Flood'],
    plant.spreads && ['spread', 'Spreads'],
    plant.needsAcidSoil && ['acid', 'Acid'],
    plant.deerResistant && ['deer', 'Deer'],
    plant.saltTolerant && ['salt', 'Salt'],
    plant.easy && ['easy', 'Easy'],
  ].filter(Boolean);

  return (
    <span className="flags">
      {flags.map(([key, label]) => (
        <span key={key} className={`flag flag--${key}`}>
          {label}
        </span>
      ))}
    </span>
  );
}

/**
 * The raw data behind every recommendation.
 *
 * The app is only worth trusting if its reasoning can be checked, and the
 * plant data is the part most likely to be wrong. This page puts all of it on
 * screen, including the scores the matcher actually computes, so a mix can be
 * argued with rather than taken on faith.
 *
 * The scores are calculated here by calling the same functions the matcher
 * calls. They cannot drift out of step with the real logic, because they are
 * the real logic.
 */
export default function DataPage({ onHome }) {
  const [query, setQuery] = useState('');
  const [xercesOnly, setXercesOnly] = useState(false);
  const [sort, setSort] = useState('name');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matched = plants.filter((plant) => {
      if (xercesOnly && !plant.xercesListed) return false;
      if (!q) return true;
      return (
        plant.common.toLowerCase().includes(q) ||
        plant.scientific.toLowerCase().includes(q)
      );
    });

    const order = ['early', 'mid', 'late'];

    return [...matched].sort((a, b) => {
      if (sort === 'season') {
        return (
          order.indexOf(a.season) - order.indexOf(b.season) ||
          a.common.localeCompare(b.common)
        );
      }
      if (sort === 'height') return typicalHeight(a) - typicalHeight(b);
      return a.common.localeCompare(b.common);
    });
  }, [query, xercesOnly, sort]);

  const download = () => {
    const payload = {
      note: 'Seeds4Bees plant data. Attribute values are our own unless flagged xercesListed, and should be checked before planting.',
      source: 'https://seeds4bees.net',
      xercesList:
        'https://www.wildflower.org/collections/collection.php?collection=xerces_greatlakes',
      exported: new Date().toISOString(),
      natives: plants,
      gardenPlants,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'seeds4bees-plant-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const count = (fn) => plants.filter(fn).length;

  return (
    <div className="datapage">
      <h2 className="qscreen__title">The data behind the mixes</h2>
      <p className="qscreen__help">
        Every attribute the app uses to decide, and the scores it actually
        computes. If a mix looks wrong, the reason is on this page.
      </p>

      <div className="counts">
        <div className="count">
          <strong>{plants.length}</strong> native plants
        </div>
        <div className="count">
          <strong>{count((p) => p.xercesListed)}</strong> on the Xerces list
        </div>
        <div className="count">
          <strong>{count((p) => p.monarch === 'host')}</strong> milkweeds
        </div>
        <div className="count">
          <strong>{gardenPlants.length}</strong> garden plants
        </div>
      </div>

      <section className="rules">
        <h3 className="rules__title">1. What gets ruled out</h3>
        <p className="rules__lead">
          A plant is dropped if it fails <em>any</em> of these. No scoring
          happens until a plant survives all of them.
        </p>
        <ul className="rules__list">
          <li>Its sun, moisture, and soil lists must all contain your answer.</li>
          <li>
            Its <strong>typical</strong> height (the midpoint of its range) must
            fit your limit. Judging by the top of the range would throw out
            common milkweed, 3 to 5 ft, for a 4 ft bed it usually fits.
          </li>
          <li>Along a road: it must be salt tolerant.</li>
          <li>Where water sits for days: it must tolerate being submerged.</li>
          <li>On limey soil: it must not be one of the few that need acid ground.</li>
          <li>If you asked for tidy plants: it must not spread.</li>
          <li>Where deer browse: it must be one deer usually walk past.</li>
        </ul>

        <h3 className="rules__title">2. How each mix is filled</h3>
        <p className="rules__lead">
          In this order. Later steps never override earlier ones.
        </p>
        <ol className="rules__list">
          <li>
            <strong>Guarantees.</strong> A milkweed is reserved first in every
            mix, because monarch caterpillars eat nothing else. The Rusty
            Patched mix also reserves a grass, for nesting and winter shelter.
          </li>
          <li>
            <strong>Season coverage.</strong> The Full Season mix deals its
            picks round robin across spring, summer, and fall. The others fill
            any season that would otherwise be empty.
          </li>
          <li>
            <strong>Score.</strong> The rest of the slots go to the highest
            scoring plants, using the table below.
          </li>
          <li>
            <strong>Season cap.</strong> No season may take more than half the
            mix, so a focused strategy cannot produce a spring-only garden.
          </li>
          <li>
            <strong>Size.</strong> The number of slots comes from your area:
            5, 8, 12, or 16 kinds of plant.
          </li>
          <li>
            <strong>Collapse.</strong> Five strategies run, but mixes that
            come out identical are shown once. On a site suiting only a handful
            of plants there is genuinely one answer, and printing it five times
            under five names would imply a choice that does not exist.
          </li>
        </ol>
        <p className="rules__note">
          Ties break on plant id, so the same answers always give the same mix.
        </p>

        <h3 className="rules__title">3. When nothing fits</h3>
        <p className="rules__lead">
          Some honest answers describe a real place our list cannot fill: wet
          sand in shade kept under two feet, or a shaded roadside. An empty
          page teaches nobody anything, so the app loosens the softest
          constraint and tries again, in this order, and tells you every step
          it took.
        </p>
        <ol className="rules__list">
          <li>Allow plants deer may browse.</li>
          <li>Allow plants that spread.</li>
          <li>Ignore the soil pH answer.</li>
          <li>Allow plants taller than you asked for.</li>
          <li>Allow a different soil texture.</li>
          <li>
            Allow plants that cannot take road salt &mdash; reached only by
            shaded roadsides, because nothing here is documented as taking deep
            shade and winter salt at once.
          </li>
        </ol>
        <p className="rules__note">
          Sunlight and standing water are never loosened. Getting those wrong
          does not disappoint somebody, it kills the plant. Every one of the
          69,984 possible answer combinations returns at least one mix, and a
          test walks all of them.
        </p>

        <h3 className="rules__title">4. What each mix rewards</h3>
        <div className="strategies">
          {strategies.map((strategy) => (
            <div className="strategy" key={strategy.id}>
              <h4 className="strategy__name">{strategy.name}</h4>
              <p className="strategy__blurb">{strategy.blurb}</p>
              {strategy.filter && (
                <p className="strategy__filter">
                  Considers only plants flagged <strong>Easy</strong>.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rules">
        <h3 className="rules__title">5. Every plant, every attribute</h3>
        <p className="rules__lead">
          The last four columns are each mix&rsquo;s score for that plant,
          computed by calling the same functions the matcher calls. A dash
          means the mix will not consider it at all.
        </p>

        <div className="datacontrols">
          <input
            type="search"
            className="searchbox"
            placeholder="Filter by name..."
            aria-label="Filter plants by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="check">
            <input
              type="checkbox"
              checked={xercesOnly}
              onChange={(e) => setXercesOnly(e.target.checked)}
            />
            Xerces-listed only
          </label>
          <label className="check">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">by name</option>
              <option value="season">by season</option>
              <option value="height">by height</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={download}>
            Download JSON
          </button>
        </div>

        <p className="rules__note">
          Showing {rows.length} of {plants.length}.
        </p>

        <div className="tablewrap">
          <table className="datatable">
            <thead>
              <tr>
                <th scope="col">Plant</th>
                <th scope="col">Sun</th>
                <th scope="col">Water</th>
                <th scope="col">Soil</th>
                <th scope="col">Height</th>
                <th scope="col">Season</th>
                <th scope="col">Bloom</th>
                <th scope="col">Monarch</th>
                <th scope="col">RPBB</th>
                <th scope="col">Flags</th>
                {strategies.map((s) => (
                  <th scope="col" key={s.id} className="num" title={s.name}>
                    {s.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((plant) => (
                <tr key={plant.id}>
                  <th scope="row">
                    {plant.common}
                    <em className="plant__latin">{plant.scientific}</em>
                  </th>
                  <td>{join(plant.sun, SUN)}</td>
                  <td>{join(plant.moisture, WATER)}</td>
                  <td>{join(plant.soil, SOIL)}</td>
                  <td>
                    {plant.height[0]}&ndash;{plant.height[1]}
                    <span className="muted"> ({typicalHeight(plant)})</span>
                  </td>
                  <td>{SEASON[plant.season]}</td>
                  <td>{plant.bloom}</td>
                  <td>{plant.monarch === 'host' ? 'Host' : plant.monarch === 'nectar' ? 'Nectar' : '—'}</td>
                  <td>{plant.rustyPatched ? 'Yes' : '—'}</td>
                  <td>
                    <Flags plant={plant} />
                  </td>
                  {strategies.map((s) => (
                    <td key={s.id} className="num">
                      {s.filter && !s.filter(plant) ? '—' : s.score(plant)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rules">
        <h3 className="rules__title">6. Garden plants and their verdicts</h3>
        <p className="rules__lead">
          These drive the flower checker rather than the mixes.
        </p>
        <div className="tablewrap">
          <table className="datatable">
            <thead>
              <tr>
                <th scope="col">Plant</th>
                <th scope="col">Verdict</th>
                <th scope="col">Monarch</th>
                <th scope="col">RPBB</th>
                <th scope="col">Suggested native</th>
              </tr>
            </thead>
            <tbody>
              {gardenPlants.map((g) => (
                <tr key={g.id}>
                  <th scope="row">
                    {g.common}
                    <em className="plant__latin">{g.scientific}</em>
                  </th>
                  <td>{g.verdict}</td>
                  <td>{g.monarch === 'host' ? 'Host' : g.monarch === 'nectar' ? 'Nectar' : '—'}</td>
                  <td>{g.rustyPatched ? 'Yes' : '—'}</td>
                  <td>{g.swap ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rules">
        <h3 className="rules__title">Where this came from, and what to check</h3>
        <p className="rules__lead">
          The <strong>Xerces</strong> flag means the species appears on the
          Xerces Society&rsquo;s Great Lakes pollinator plant list, checked
          against{' '}
          <a href="https://www.wildflower.org/collections/collection.php?collection=xerces_greatlakes">
            the copy in the Lady Bird Johnson Wildflower Center database
          </a>
          . All 24 species on that list are here.
        </p>
        <p className="rules__lead">
          That flag vouches for the species being a recognised pollinator plant
          for this region and nothing else. <strong>Every other value in
          these tables is ours</strong>, including the sun, soil, height,
          bloom, deer, and salt columns, and the choice of the other 83 plants.
          Check anything that matters against the{' '}
          <a href="https://xerces.org">Xerces Society</a>, your state extension
          office, or a native plant nursery before buying seed.
        </p>
        <p className="rules__lead">
          The files themselves:{' '}
          <a href={`${REPO}/data/plants.js`}>plants.js</a>,{' '}
          <a href={`${REPO}/data/gardenPlants.js`}>gardenPlants.js</a>,{' '}
          <a href={`${REPO}/data/questions.js`}>questions.js</a>, and{' '}
          <a href={`${REPO}/lib/recommend.js`}>recommend.js</a>.
        </p>
      </section>

      <div className="qscreen__nav">
        <button type="button" className="btn btn--quiet" onClick={onHome}>
          Back to the start
        </button>
      </div>
    </div>
  );
}
