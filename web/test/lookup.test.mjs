/**
 * Tests for the "check a flower you like" lookup.
 *
 * The risk here is not a crash, it is confidently telling a visitor something
 * false about a plant. These check the claims the UI makes.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { gardenPlants } from '../src/data/gardenPlants.js';
import { plants } from '../src/data/plants.js';
import {
  entries,
  entryFor,
  featured,
  helpsWith,
  nativeAsEntry,
  search,
  swapFor,
} from '../src/lib/lookup.js';

test('every plant is searchable exactly once', () => {
  const ids = entries.map((e) => e.id);

  assert.equal(ids.length, new Set(ids).size, 'a duplicate id would shadow a plant');
  assert.equal(entries.length, plants.length + gardenPlants.length);
});

test('every suggested swap points at a real native plant', () => {
  for (const garden of gardenPlants) {
    if (!garden.swap) continue;

    const swap = swapFor(garden);

    assert.ok(swap, `${garden.common} suggests a swap that does not exist`);
    assert.ok(
      swap.native,
      `${garden.common} suggests ${swap.common}, which is not a native`,
    );
  }
});

test('every garden entry explains itself', () => {
  for (const garden of gardenPlants) {
    assert.ok(garden.summary, `${garden.common} needs a summary`);
    assert.ok(garden.care, `${garden.common} needs growing conditions`);
    assert.ok(
      ['great', 'good', 'limited', 'caution'].includes(garden.verdict),
      `${garden.common} has an unknown verdict`,
    );
  }
});

test('natives are never rated as poor choices', () => {
  for (const plant of plants) {
    const entry = nativeAsEntry(plant);
    assert.ok(
      entry.verdict === 'great' || entry.verdict === 'good',
      `${plant.common} is native and should not be rated ${entry.verdict}`,
    );
  }
});

test('milkweed is the only thing that counts as monarch caterpillar food', () => {
  for (const entry of entries) {
    const { monarch } = helpsWith(entry);

    if (monarch.level === 'yes') {
      assert.equal(
        entry.monarch,
        'host',
        `${entry.common} claims caterpillars eat it without being a host plant`,
      );
    }
  }
});

test('nectar-only plants are not sold as monarch nurseries', () => {
  const bush = entryFor('butterfly-bush');
  const { monarch, rustyPatched } = helpsWith(bush);

  assert.equal(monarch.level, 'partly', 'butterfly bush feeds adults only');
  assert.match(monarch.text, /caterpillars cannot eat it/i);
  assert.equal(rustyPatched.level, 'no');
});

test('a plant that does nothing says so, and offers an alternative', () => {
  const tulip = entryFor('tulip');
  const { monarch, rustyPatched } = helpsWith(tulip);

  assert.equal(monarch.level, 'no');
  assert.equal(rustyPatched.level, 'no');

  const swap = swapFor(tulip);
  assert.ok(swap, 'a plant rated limited should suggest something better');
  assert.equal(swap.season, 'early', 'the swap should fill the same spring slot');
});

test('search finds garden plants and natives from one box', () => {
  assert.ok(search('hosta').some((e) => e.id === 'hosta'));
  assert.ok(search('milkweed').some((e) => e.monarch === 'host'));
  assert.ok(search('bergamot').some((e) => e.native));
});

test('search matches nicknames people actually type', () => {
  assert.ok(search('buddleia').some((e) => e.id === 'butterfly-bush'));
  assert.ok(search('catnip').some((e) => e.id === 'catmint'));
  assert.ok(search('day lily').some((e) => e.id === 'daylily'));
});

test('an exact name outranks a partial one', () => {
  const [first] = search('rose');
  assert.equal(first.id, 'rose', 'typing a full name should put it first');
});

test('search is case and space insensitive', () => {
  assert.deepEqual(
    search('  TULIP ').map((e) => e.id),
    search('tulip').map((e) => e.id),
  );
});

test('an empty search returns nothing rather than everything', () => {
  assert.deepEqual(search(''), []);
  assert.deepEqual(search('   '), []);
});

test('a search with no match returns empty instead of a wrong guess', () => {
  assert.deepEqual(search('xyzzy-not-a-plant'), []);
});

test('the featured plants all resolve, and show a range of verdicts', () => {
  assert.ok(featured.length > 0);
  for (const entry of featured) assert.ok(entry.id, 'featured entry must exist');

  const verdicts = new Set(featured.map((e) => e.verdict));
  assert.ok(
    verdicts.size > 1,
    'featured list should not imply every plant is equally good',
  );
});

test('native entries describe where they grow', () => {
  const milkweed = entryFor('swamp-milkweed');

  assert.match(milkweed.care, /sun/);
  assert.match(milkweed.care, /ft$/);
  assert.ok(milkweed.native);
});
