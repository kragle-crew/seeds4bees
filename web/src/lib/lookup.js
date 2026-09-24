/**
 * Looking up a plant somebody already likes.
 *
 * The seed mix finder starts from a place and works out to plants. This works
 * the other way: you name a flower, and it tells you where that flower wants
 * to live and whether it does anything for the two species this project is
 * about.
 *
 * Both native plants and common garden plants are searchable from one box,
 * because a visitor typing "milkweed" and a visitor typing "hosta" are asking
 * the same question and should not have to know which list they are in.
 */

import { gardenPlants, matchesQuery } from '../data/gardenPlants.js';
import { plants } from '../data/plants.js';

const SUN_TEXT = { sun: 'full sun', part: 'part sun', shade: 'shade' };
const MOISTURE_TEXT = {
  wet: 'wet ground',
  medium: 'average moisture',
  dry: 'dry ground',
};
const SOIL_TEXT = { sand: 'sand', loam: 'rich soil', clay: 'clay' };

const list = (values, table) => values.map((v) => table[v]).join(' or ');

/** Turns a native plant record into the same shape the garden list uses. */
export function nativeAsEntry(plant) {
  const great =
    plant.monarch === 'host' || (plant.rustyPatched && plant.monarch === 'nectar');

  return {
    id: plant.id,
    common: plant.common,
    scientific: plant.scientific,
    native: true,
    verdict: great ? 'great' : 'good',
    monarch: plant.monarch,
    rustyPatched: plant.rustyPatched,
    season: plant.season,
    bloom: plant.bloom,
    care: `${list(plant.sun, SUN_TEXT)}, ${list(plant.moisture, MOISTURE_TEXT)}, ${list(
      plant.soil,
      SOIL_TEXT,
    )}, ${plant.height[0]} to ${plant.height[1]} ft`,
    summary: plant.why,
    localNote: null,
    swap: null,
  };
}

/** Every plant the lookup knows about, natives first. */
export const entries = [
  ...plants.map(nativeAsEntry),
  ...gardenPlants.map((g) => ({ ...g, native: false })),
];

const byId = new Map(entries.map((entry) => [entry.id, entry]));

export const entryFor = (id) => byId.get(id) ?? null;

/** The native a garden plant could be swapped for, if one was named. */
export const swapFor = (entry) =>
  entry?.swap ? (entryFor(entry.swap) ?? null) : null;

/**
 * Name search, ordered so the obvious answer is first.
 *
 * Someone typing "aster" wants the asters, not the one plant whose
 * description happens to contain the word, so an exact name beats a prefix,
 * and a prefix beats a match buried in the middle.
 */
export function search(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rank = (entry) => {
    const names = [entry.common, entry.scientific, ...(entry.aliases ?? [])].map(
      (n) => String(n).toLowerCase(),
    );

    if (names.some((n) => n === q)) return 0;
    if (names.some((n) => n.startsWith(q))) return 1;
    return 2;
  };

  return entries
    .filter((entry) => matchesQuery(entry, q))
    .sort((a, b) => rank(a) - rank(b) || a.common.localeCompare(b.common))
    .slice(0, limit);
}

/**
 * What the plant does for each species, in words rather than counts.
 *
 * A single plant is not a mix, so a tally would be noise. What matters is the
 * difference between "caterpillars can eat this" and "adults can drink here",
 * which people routinely assume are the same thing.
 */
export function helpsWith(entry) {
  const monarch =
    entry.monarch === 'host'
      ? {
          level: 'yes',
          text: 'Caterpillars can eat it. This is the part that actually raises new monarchs.',
        }
      : entry.monarch === 'nectar'
        ? {
            level: 'partly',
            text: 'Adults drink at it, but caterpillars cannot eat it. Nectar alone does not raise monarchs.',
          }
        : {
            level: 'no',
            text: 'Not used by monarchs for food or for eggs.',
          };

  const rustyPatched = entry.rustyPatched
    ? {
        level: 'yes',
        text: 'Bumble bees work it for pollen and nectar.',
      }
    : {
        level: 'no',
        text: 'Little or nothing for bumble bees.',
      };

  return { monarch, rustyPatched };
}

/** A few plants people ask about often, shown before anything is typed. */
export const featured = [
  'tulip',
  'hosta',
  'butterfly-bush',
  'common-milkweed',
  'daylily',
  'purple-coneflower',
]
  .map(entryFor)
  .filter(Boolean);
