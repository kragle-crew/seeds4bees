/**
 * Turns a site survey into seed mixes for two species in trouble: the rusty
 * patched bumble bee (Bombus affinis) and the monarch butterfly.
 *
 * Everything below is in service of those two. A plant earns its slot by
 * feeding one of them, and every mix reports plainly what it does for each,
 * so the recommendation can be argued with instead of just trusted.
 *
 * THE TWO RULES THAT SHAPE THE MATCHING
 *
 * 1. BLOOM COVERAGE BEATS BLOOM COUNT. Ten kinds of flower that all peak in
 *    July is a feast followed by a famine. Rusty patched queens are flying in
 *    April and workers are still out in October, so a mix that misses spring
 *    or fall starves the colony exactly when it is most fragile. Every mix
 *    fills a slot per season before spending anything on raw score.
 *
 * 2. MILKWEED IS NOT OPTIONAL FOR MONARCHS. Adults drink at many flowers, but
 *    caterpillars eat milkweed and nothing else. A mix without it is a
 *    restaurant with no nursery, so milkweed gets a reserved slot and the app
 *    says so out loud when the site cannot grow any.
 *
 * These are ordinary pure functions over plain data, so `npm test` can check
 * the reasoning without a browser and the logic stays readable to someone who
 * has never seen React.
 */

import { plants as ALL_PLANTS, SEASONS } from '../data/plants.js';

/**
 * Typical mature height, in feet.
 *
 * Published height ranges run from "in poor soil" to "in a perfect year", so
 * judging a plant by the top of its range would throw out common milkweed
 * (3 to 5 feet) for a four foot bed it fits in almost every season. The
 * midpoint is the honest estimate. Plants still occasionally overshoot it.
 */
export const typicalHeight = (plant) => (plant.height[0] + plant.height[1]) / 2;

/** True when a plant can actually survive the conditions described. */
export function matchesSite(plant, site) {
  if (site.sun && !plant.sun.includes(site.sun)) return false;
  if (site.moisture && !plant.moisture.includes(site.moisture)) return false;
  if (site.soil && !plant.soil.includes(site.soil)) return false;
  if (typicalHeight(plant) > site.maxHeight) return false;
  if (site.requireSalt && !plant.saltTolerant) return false;
  if (site.deerPressure && !plant.deerResistant) return false;

  return true;
}

/** Everything that could grow at this site, before any mix is chosen. */
export const poolFor = (site, plants = ALL_PLANTS) =>
  plants.filter((plant) => matchesSite(plant, site));

const isMilkweed = (plant) => plant.monarch === 'host';
const isGrass = (plant) => plant.type === 'grass';

/**
 * The mix strategies.
 *
 * Each is a different opinion about the same patch of ground, which is why
 * the app offers several instead of pretending there is one right answer.
 *
 *   filter   plants this mix refuses to consider at all
 *   must     guarantees that get a slot before score is consulted
 *   balance  fill seasons round robin instead of best first
 *   score    ranks whatever is left
 */
export const strategies = [
  {
    id: 'full-season',
    name: 'Full Season Mix',
    tagline: 'Something blooming from the first warm day to the first frost',
    blurb:
      'The safest choice if you only plant one thing. It deals its picks out evenly across spring, summer, and fall, so there is never a hungry gap for either species.',
    must: [isMilkweed],
    balance: true,
    score: (plant) =>
      (plant.rustyPatched ? 3 : 0) +
      (plant.monarch === 'host' ? 4 : plant.monarch === 'nectar' ? 2 : 0) +
      (plant.easy ? 1 : 0),
  },
  {
    id: 'monarch',
    name: 'Monarch Mix',
    tagline: 'Built around milkweed, plus fuel for the flight to Mexico',
    blurb:
      'Leans hard on milkweed so caterpillars have something to eat, then loads up on late bloomers. Monarchs passing through in September need nectar to reach their wintering grounds.',
    must: [isMilkweed],
    score: (plant) =>
      (isMilkweed(plant) ? 12 : 0) +
      (plant.monarch === 'nectar' ? 5 : 0) +
      (plant.season === 'late' ? 4 : 0) +
      (plant.rustyPatched ? 1 : 0),
  },
  {
    id: 'bumble-bee',
    name: 'Rusty Patched Mix',
    tagline: 'Early and late flowers, plus grass to nest under',
    blurb:
      'Aimed at the endangered bee. It favors spring and fall bloom, when colonies are most at risk, and includes bunch grass because queens spend the winter in the soil at its base.',
    must: [isGrass, isMilkweed],
    score: (plant) =>
      (plant.rustyPatched ? 5 : 0) +
      (plant.season === 'early' ? 5 : plant.season === 'late' ? 4 : 2) +
      (isGrass(plant) ? 3 : 0),
  },
  {
    id: 'easy-start',
    name: 'Easy Starter Mix',
    tagline: 'Forgiving plants you can actually find and afford',
    blurb:
      'Nothing here is fussy, rare, or expensive. Good for a first planting, a school project, or anywhere a failed garden would be discouraging.',
    filter: (plant) => plant.easy,
    must: [isMilkweed],
    score: (plant) =>
      (plant.rustyPatched ? 3 : 0) +
      (plant.monarch === 'host' ? 5 : plant.monarch === 'nectar' ? 2 : 0),
  },
];

/**
 * Ranks a pool for one strategy.
 *
 * Ties break on id so the same answers always give the same mix. A
 * recommendation that reshuffled on every render would be impossible to
 * trust, or to test.
 */
const ranked = (pool, strategy) =>
  [...pool].sort(
    (a, b) => strategy.score(b) - strategy.score(a) || a.id.localeCompare(b.id),
  );

/**
 * What this mix actually does for each species.
 *
 * This is the part worth reading. It is computed from the chosen plants
 * rather than asserted, so it stays true even after somebody edits the plant
 * data or the scoring.
 */
export function servesFor(picks) {
  const count = (fn) => picks.filter(fn).length;

  return {
    monarch: {
      host: count(isMilkweed),
      nectar: count((p) => p.monarch === 'nectar'),
      fallNectar: count((p) => p.monarch === 'nectar' && p.season === 'late'),
    },
    rustyPatched: {
      favorites: count((p) => p.rustyPatched),
      spring: count((p) => p.season === 'early' && p.rustyPatched),
      fall: count((p) => p.season === 'late' && p.rustyPatched),
      nesting: count(isGrass),
    },
  };
}

/**
 * Chooses the plants for one mix.
 *
 * Order matters: guarantees first, then season coverage, then the best of
 * what is left. Reversing those steps would let a pile of high scoring summer
 * flowers crowd out the spring and fall bloom the bees depend on.
 */
export function buildMix(strategy, pool, site) {
  const eligible = strategy.filter ? pool.filter(strategy.filter) : pool;
  const order = ranked(eligible, strategy);
  const limit = Math.min(site.species, order.length);
  const picked = [];

  const take = (plant) => {
    if (plant && picked.length < limit && !picked.includes(plant)) {
      picked.push(plant);
    }
  };

  // 1. Non-negotiables for this strategy.
  for (const requirement of strategy.must) take(order.find(requirement));

  // 2. Season coverage. A balanced mix keeps dealing one card to each season
  //    in turn; the focused mixes just make sure no season is missing and let
  //    their scoring do the rest.
  if (strategy.balance) {
    const queues = SEASONS.map((s) => order.filter((p) => p.season === s));
    let dealt = true;

    while (picked.length < limit && dealt) {
      dealt = false;
      for (const queue of queues) {
        const next = queue.find((p) => !picked.includes(p));
        if (next && picked.length < limit) {
          take(next);
          dealt = true;
        }
      }
    }
  } else {
    for (const season of SEASONS) {
      take(order.find((plant) => plant.season === season));
    }
  }

  // 3. Best of the rest, but no season may take more than half the mix.
  //    Without this cap the focused strategies pile their whole budget onto
  //    the season they favor, and a spring-only garden still starves a colony
  //    in August. Slots handed out above are exempt: a guarantee outranks
  //    tidiness.
  const seasonCap = Math.max(1, Math.ceil(limit / 2));
  const spent = (season) => picked.filter((p) => p.season === season).length;

  for (const plant of order) {
    if (spent(plant.season) < seasonCap) take(plant);
  }

  // If the cap left the mix short (a site with little variety), fill it.
  for (const plant of order) take(plant);

  const picks = picked.sort(
    (a, b) =>
      SEASONS.indexOf(a.season) - SEASONS.indexOf(b.season) ||
      a.common.localeCompare(b.common),
  );

  return {
    id: strategy.id,
    name: strategy.name,
    tagline: strategy.tagline,
    blurb: strategy.blurb,
    picks,
    seasons: SEASONS.filter((s) => picks.some((p) => p.season === s)),
    hasMilkweed: picks.some(isMilkweed),
    hasGrass: picks.some(isGrass),
    serves: servesFor(picks),
  };
}

/**
 * Problems worth saying out loud.
 *
 * The app is more useful when it admits what a site cannot do. Quietly
 * handing back a short list would let someone plant a monarch garden with no
 * milkweed and never learn why no caterpillars turned up.
 */
export function warningsFor(pool, site) {
  const warnings = [];

  if (pool.length === 0) {
    warnings.push({
      level: 'hard',
      text: 'Nothing on our list can handle that combination. Try loosening one answer, especially the height limit or the deer setting.',
    });
    return warnings;
  }

  if (!pool.some(isMilkweed)) {
    warnings.push({
      level: 'hard',
      text: 'No milkweed grows in these conditions, so monarchs cannot lay eggs here. These flowers will still feed adults passing through. For caterpillars you would need a sunnier or drier spot, or a taller height limit.',
    });
  }

  const label = { early: 'spring', mid: 'summer', late: 'fall' };

  for (const season of SEASONS.filter((s) => !pool.some((p) => p.season === s))) {
    warnings.push({
      level: 'soft',
      text: `Nothing on our list blooms in ${label[season]} under these conditions, which leaves a gap when bumble bees still need food.`,
    });
  }

  if (pool.length < site.species) {
    warnings.push({
      level: 'soft',
      text: `Only ${pool.length} plants match, fewer than the ${site.species} we would normally suggest for an area that size. Plant more of each rather than adding something that will not survive.`,
    });
  }

  return warnings;
}

/**
 * Collapses mixes that came out identical.
 *
 * On a site that only suits a handful of plants, every strategy reaches for
 * the same ones and there is genuinely just one answer. Presenting that one
 * answer four times under four names would imply a choice that does not
 * exist. The first strategy to produce a given list keeps it.
 */
const distinct = (mixes) => {
  const seen = new Set();

  return mixes.filter((mix) => {
    const signature = mix.picks.map((plant) => plant.id).join(',');
    if (seen.has(signature)) return false;

    seen.add(signature);
    return true;
  });
};

/** The whole recommendation: what could grow, what we suggest, what to watch for. */
export function recommend(site, plants = ALL_PLANTS) {
  const pool = poolFor(site, plants);
  const mixes = pool.length
    ? distinct(strategies.map((s) => buildMix(s, pool, site)))
    : [];

  return { pool, mixes, warnings: warningsFor(pool, site) };
}
