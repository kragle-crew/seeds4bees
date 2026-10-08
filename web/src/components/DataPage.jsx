import { useMemo, useState } from 'react';

import { gardenPlants } from '../data/gardenPlants.js';
import { plants } from '../data/plants.js';
import { questions } from '../data/questions.js';
import More from './More.jsx';
import { minimumDifference, strategies, typicalHeight } from '../lib/recommend.js';

const REPO = 'https://github.com/kragle-crew/seeds4bees/blob/main/web/src';
const WILDFLOWER = 'https://www.wildflower.org/plants/result.php?id_plant=';

const SUN = { sun: 'Sun', part: 'Part', shade: 'Shade' };
const WATER = { wet: 'Wet', medium: 'Med', dry: 'Dry' };
const SOIL = { sand: 'Sand', loam: 'Loam', clay: 'Clay' };
const SEASON = { early: 'Spring', mid: 'Summer', late: 'Fall' };

const join = (values, table) => values.map((v) => table[v]).join(' ');

/**
 * The page's three parts. Most visitors want the plants; the other two are
 * for anyone checking the app's reasoning or its sources.
 */
const GROUPS = [
  {
    id: 'plants',
    name: 'The plants',
    about: 'Every plant, where it grows, and when it blooms',
  },
  {
    id: 'how',
    name: 'How mixes are made',
    about: 'The questions, the rules, and each mix’s scores',
  },
  {
    id: 'sources',
    name: 'Where the info comes from',
    about: 'Our sources, what we checked, and downloads',
  },
];

/** Every way the survey can be answered: the options multiplied together. */
const combinations = questions.reduce((n, q) => n * q.options.length, 1);

const SUN_PHRASE = { sun: 'full sun', part: 'part sun', shade: 'shade' };

/** The questions added or reshaped most recently, flagged so returning visitors spot them. */
const NEW_QUESTIONS = new Set(['kind']);

/**
 * What picking one answer actually does to the plant list, read straight off
 * the option so it cannot disagree with the matcher.
 */
function effectOf(option) {
  const effects = [];

  if (option.sun) effects.push(`must grow in ${SUN_PHRASE[option.sun]}`);
  if (option.moisture) effects.push(`must take ${option.moisture} ground`);
  if (option.soil) effects.push(`must grow in ${option.soil}`);
  if (option.requireSalt) effects.push('must be salt tolerant');
  if (option.requireStandingWater) effects.push('must survive being flooded');
  if (option.limeySoil) effects.push('drops plants that need acid soil');
  if (option.noSpreaders) effects.push('drops plants that spread');
  if (option.deerPressure) effects.push('drops plants deer eat first');
  if (option.maxHeight && option.maxHeight < 99) {
    effects.push(`plants must stay under about ${option.maxHeight} ft`);
  }
  if (option.species) effects.push(`${option.species} kinds of plant per mix`);
  if (option.mix) {
    const name = strategies.find((s) => s.id === option.mix)?.name;
    effects.push(`shows the ${name} first`);
  }

  return effects.length ? effects.join(', ') : 'rules nothing out';
}

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
export default function DataPage({ onHome, onBackToMixes }) {
  const [query, setQuery] = useState('');
  const [xercesOnly, setXercesOnly] = useState(false);
  const [sort, setSort] = useState('name');
  const [group, setGroup] = useState('plants');

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

  // The score table lists every plant, alphabetically, whatever the plant
  // table above it is filtered to.
  const byName = useMemo(
    () => [...plants].sort((a, b) => a.common.localeCompare(b.common)),
    [],
  );

  const download = () => {
    const payload = {
      note: 'Seeds4Bees plant data. Attribute values are our own unless flagged xercesListed, and should be checked before planting.',
      source: 'https://seeds4bees.net',
      xercesList:
        'https://www.wildflower.org/collections/collection.php?collection=xerces_greatlakes',
      wildflowerPage: `${WILDFLOWER}<wildflowerId>`,
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
        Everything the app knows and how it decides. Pick what you want to
        look at.
      </p>

      <div className="groups" role="tablist" aria-label="Parts of the data">
        {GROUPS.map((g) => (
          <button
            type="button"
            key={g.id}
            role="tab"
            id={`group-${g.id}`}
            aria-selected={group === g.id}
            aria-controls={`grouppanel-${g.id}`}
            className={`group${group === g.id ? ' group--on' : ''}`}
            onClick={() => setGroup(g.id)}
          >
            <span className="group__name">{g.name}</span>
            <span className="group__about">{g.about}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`grouppanel-${group}`}
        aria-labelledby={`group-${group}`}
      >
        {group === 'plants' && (
          <>
            <div className="counts">
              <div className="count">
                <strong>{plants.length}</strong> native plants
              </div>
              <div className="count">
                <strong>{count((p) => p.monarch === 'host')}</strong> milkweeds
              </div>
              <div className="count">
                <strong>{count((p) => p.xercesListed)}</strong> on the Xerces list
              </div>
              <div className="count">
                <strong>{gardenPlants.length}</strong> garden plants
              </div>
            </div>

            <section className="rules">
              <h3 className="rules__title">Native plants</h3>
              <More label="How to read this table">
                <p className="rules__lead">
                  Every native plant the mixes can use, and the conditions it
                  grows in. Height shows the range, and in brackets the typical
                  height the app judges by. Click a name to open that
                  plant&rsquo;s page on the Wildflower Center site. The flags
                  are explained under <em>Where the info comes from</em>.
                </p>
              </More>

              <div className="datacontrols">
                <input
                  type="search"
                  className="searchbox"
                  placeholder="Find a plant..."
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
                      <th scope="col">Height (ft)</th>
                      <th scope="col">Season</th>
                      <th scope="col">Bloom</th>
                      <th scope="col">Monarch</th>
                      <th scope="col">RPBB</th>
                      <th scope="col">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((plant) => (
                      <tr key={plant.id}>
                        <th scope="row">
                          <a
                            href={`${WILDFLOWER}${plant.wildflowerId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {plant.common}
                          </a>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rules">
              <h3 className="rules__title">Garden flowers we have checked</h3>
              <More label={`Show all ${gardenPlants.length} garden plants`}>
                <p className="rules__lead">
                  Common flowers that are not native here. They are not in the
                  mixes; they power the <em>Check a flower I like</em> page.
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
              </More>
            </section>
          </>
        )}

        {group === 'how' && (
          <section className="rules">
            <p className="rules__lead">
              From your answers to your mixes, in the order it happens.
            </p>

            <h3 className="rules__title">1. The questions</h3>
            <More label={`See all ${questions.length} questions`}>
              <p className="rules__lead">
                In the order they are asked. Next to each answer is exactly what
                it changes about the plant list.
              </p>
              <ol className="qlist">
                {questions.map((q) => (
                  <li key={q.id} className="qlist__item">
                    <strong>{q.title}</strong>
                    {NEW_QUESTIONS.has(q.id) && (
                      <span className="tag tag--new">New</span>
                    )}
                    <ul className="qlist__options">
                      {q.options.map((o) => (
                        <li key={o.value}>
                          {o.label}: <span className="qlist__effect">{effectOf(o)}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </More>

            <h3 className="rules__title">2. Plants that would die are ruled out</h3>
            <More label="Read the rules">
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
            </More>

            <h3 className="rules__title">3. If nothing is left, one answer is loosened</h3>
            <More label="Read what happens">
              <p className="rules__lead">
                Some honest answers describe a real place our list cannot fill, like
                a damp shaded roadside. An empty
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
                  shaded roadsides, because just two plants here, bush honeysuckle
                  and snowberry, take shade and winter salt together, and only on
                  drier ground.
                </li>
              </ol>
              <p className="rules__note">
                Sunlight and standing water are never loosened. Getting those wrong
                does not disappoint somebody, it kills the plant. Every one of the{' '}
                {combinations.toLocaleString()} possible answer combinations returns
                at least one mix, and a test walks all of them.
              </p>
            </More>

            <h3 className="rules__title">4. Each kind of mix picks its favorites</h3>
            <More label={`Read about all ${strategies.length} kinds of mix`}>
              <div className="strategies">
                {strategies.map((strategy) => (
                  <div className="strategy" key={strategy.id}>
                    <h4 className="strategy__name">{strategy.name}</h4>
                    <p className="strategy__blurb">{strategy.blurb}</p>
                    {strategy.filter && (
                      <p className="strategy__filter">{strategy.filterNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </More>

            <h3 className="rules__title">5. The mix is filled in this order</h3>
            <More label="Read how mixes are built">
              <ol className="rules__list">
                <li>
                  <strong>Guarantees.</strong> A milkweed is reserved first in every
                  mix when one can grow there, because monarch caterpillars eat
                  nothing else. The Easy Starter mix only uses milkweeds marked easy. Some mixes
                  also reserve a grass or a shrub.
                </li>
                <li>
                  <strong>Season coverage.</strong> The Full Season mix deals its
                  picks round robin across spring, summer, and fall. The others fill
                  any season that would otherwise be empty.
                </li>
                <li>
                  <strong>Score.</strong> The rest of the slots go to the highest
                  scoring plants, using the score table below.
                </li>
                <li>
                  <strong>Season cap.</strong> No season may take more than half the
                  mix, so a focused mix cannot produce a spring-only garden.
                </li>
                <li>
                  <strong>Type cap.</strong> In the Meadow and Shrub Border mixes,
                  grasses or shrubs may take at most half the mix, so there are
                  always flowers between them.
                </li>
                <li>
                  <strong>Size.</strong> The number of slots comes from your area:
                  5, 8, 12, or 16 kinds of plant.
                </li>
                <li>
                  <strong>No copies.</strong> A mix is only shown if enough of its
                  plants are not in any mix already shown: a quarter of them, and
                  at least two (so {minimumDifference(8)} of 8, or{' '}
                  {minimumDifference(16)} of 16). Swapping one plant is not a
                  different garden.
                </li>
              </ol>
              <p className="rules__note">
                Ties break on plant id, so the same answers always give the same mix.
              </p>
            </More>

            <h3 className="rules__title">6. Every mix&rsquo;s score for every plant</h3>
            <More label="Show the score table">
              <p className="rules__lead">
                The numbers step 5 ranks by, computed by calling the same
                functions the app calls. Higher is picked first. A dash means
                that mix will not consider the plant at all.
              </p>
              <div className="tablewrap">
                <table className="datatable">
                  <thead>
                    <tr>
                      <th scope="col">Plant</th>
                      {strategies.map((s) => (
                        <th scope="col" key={s.id} className="num" title={s.name}>
                          {s.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byName.map((plant) => (
                      <tr key={plant.id}>
                        <th scope="row">{plant.common}</th>
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
            </More>
          </section>
        )}

        {group === 'sources' && (
          <section className="rules">
            <h3 className="rules__title">Websites we used</h3>
            <ul className="rules__list">
              <li>
                <a href="https://www.wildflower.org/collections/collection.php?collection=xerces_greatlakes">
                  Xerces Society Great Lakes pollinator plant list
                </a>
                , the copy in the Lady Bird Johnson Wildflower Center database. The{' '}
                <strong>Xerces</strong> flag in the tables means a plant is on this
                list, and all 24 species on it are here.
              </li>
              <li>
                <a href="https://www.wildflower.org/plants/">
                  Lady Bird Johnson Wildflower Center plant database
                </a>
                . Every native plant name in the plant table links to its page
                there.
              </li>
            </ul>
            <More label="What we checked, and what we did not">
              <p className="rules__lead">
                The Xerces list vouches for a species being a recognised
                pollinator plant for this region and nothing else. We also
                checked every plant name against the Wildflower Center database,
                and the 114 added most recently against its map of which states
                each plant grows in. For the newest 60, the sun, moisture, and
                soil columns also start from the Wildflower Center's record.{' '}
                <strong>Every other value in these tables is ours</strong>, from
                general gardening knowledge rather than one website, including
                the height, bloom, deer, and salt columns, and the choice of the
                other {plants.length - count((p) => p.xercesListed)} plants.
              </p>
            </More>

            <h3 className="rules__title">Good places to check our data</h3>
            <ul className="rules__list">
              <li>
                <a href="https://xerces.org">Xerces Society</a>, for pollinator
                plant lists and advice
              </li>
              <li>
                <a href="https://www.fws.gov/species/rusty-patched-bumble-bee-bombus-affinis">
                  U.S. Fish and Wildlife Service: rusty patched bumble bee
                </a>
              </li>
              <li>Your state extension office, or a native plant nursery</li>
            </ul>

            <h3 className="rules__title">What the flags mean</h3>
            <ul className="rules__list">
              <li><strong>Xerces</strong>: on the Xerces Society Great Lakes list</li>
              <li><strong>Flood</strong>: survives water sitting on it for days</li>
              <li><strong>Spreads</strong>: runs or seeds itself around</li>
              <li><strong>Acid</strong>: needs acid soil</li>
              <li><strong>Deer</strong>: deer usually leave it alone</li>
              <li><strong>Salt</strong>: handles road salt</li>
              <li><strong>Easy</strong>: forgiving to grow and easy to buy</li>
            </ul>

            <h3 className="rules__title">Downloads and files</h3>
            <p className="rules__lead">
              <button type="button" className="btn" onClick={download}>
                Download all the data (JSON)
              </button>
            </p>
            <p className="rules__lead">
              The files themselves, on GitHub:{' '}
              <a href={`${REPO}/data/plants.js`}>plants.js</a>,{' '}
              <a href={`${REPO}/data/gardenPlants.js`}>gardenPlants.js</a>,{' '}
              <a href={`${REPO}/data/questions.js`}>questions.js</a>, and{' '}
              <a href={`${REPO}/lib/recommend.js`}>recommend.js</a>.
            </p>
          </section>
        )}
      </div>

      <div className="qscreen__nav">
        {onBackToMixes && (
          <button type="button" className="btn" onClick={onBackToMixes}>
            Back to my mixes
          </button>
        )}
        <button type="button" className="btn btn--quiet" onClick={onHome}>
          Back to the start
        </button>
      </div>
    </div>
  );
}
