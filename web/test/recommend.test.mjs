/**
 * Tests for the seed mix matcher.
 *
 * These check the promises the app makes to a visitor, not the shape of the
 * code. If someone edits the plant data or reweights a strategy, these should
 * still pass; if they stop passing, the app is telling somebody to plant the
 * wrong thing.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { plants } from '../src/data/plants.js';
import { questions, questionIds, siteFrom } from '../src/data/questions.js';
import {
  buildMix,
  matchesSite,
  poolFor,
  recommend,
  strategies,
  typicalHeight,
} from '../src/lib/recommend.js';

/** A plain sunny garden bed: the most common case by far. */
const sunnyBed = siteFrom({
  place: 'yard',
  sun: 'sun',
  moisture: 'medium',
  soil: 'loam',
  size: 'small',
  height: 'medium',
  deer: 'none',
});

test('the plant data is internally consistent', () => {
  const ids = plants.map((p) => p.id);
  assert.equal(ids.length, new Set(ids).size, 'plant ids must be unique');

  for (const plant of plants) {
    assert.ok(plant.sun.length > 0, `${plant.id} needs a sun range`);
    assert.ok(plant.moisture.length > 0, `${plant.id} needs a moisture range`);
    assert.ok(plant.soil.length > 0, `${plant.id} needs a soil range`);
    assert.ok(
      plant.height[0] <= plant.height[1],
      `${plant.id} has a backwards height range`,
    );
    assert.ok(plant.why, `${plant.id} needs a reason it was chosen`);
  }
});

test('every question option is answerable and every answer is used', () => {
  for (const question of questions) {
    assert.ok(question.options.length >= 2, `${question.id} needs real choices`);

    for (const option of question.options) {
      assert.ok(option.label, `${question.id} option needs a label`);
      assert.ok(option.detail, `${question.id} option needs an explanation`);
    }
  }

  assert.equal(questionIds.length, questions.length);
});

test('a milkweed reaches every mix when the site can grow one', () => {
  const { mixes, pool } = recommend(sunnyBed);

  assert.ok(pool.some((p) => p.monarch === 'host'), 'site should allow milkweed');

  for (const mix of mixes) {
    assert.ok(
      mix.hasMilkweed,
      `${mix.name} has no milkweed, so monarchs cannot breed in it`,
    );
  }
});

test('every mix covers all three seasons when the site can', () => {
  const { mixes } = recommend(sunnyBed);

  for (const mix of mixes) {
    assert.deepEqual(
      mix.seasons,
      ['early', 'mid', 'late'],
      `${mix.name} leaves a hungry gap in the calendar`,
    );
  }
});

test('no mix spends more than half its slots on one season', () => {
  const { mixes } = recommend(sunnyBed);

  for (const mix of mixes) {
    const cap = Math.ceil(mix.picks.length / 2);

    for (const season of ['early', 'mid', 'late']) {
      const used = mix.picks.filter((p) => p.season === season).length;
      assert.ok(used <= cap, `${mix.name} put ${used} plants in one season`);
    }
  }
});

test('the rusty patched mix includes nesting cover', () => {
  const { mixes } = recommend(sunnyBed);
  const bee = mixes.find((m) => m.id === 'bumble-bee');

  assert.ok(bee.hasGrass, 'queens overwinter at the base of bunch grasses');
});

test('the mixes are genuinely different from each other', () => {
  const { mixes } = recommend(sunnyBed);
  const signatures = mixes.map((m) => m.picks.map((p) => p.id).join(','));

  assert.equal(
    new Set(signatures).size,
    mixes.length,
    'offering four identical mixes would be dishonest',
  );
});

test('the same answers always produce the same mixes', () => {
  const first = recommend(sunnyBed);
  const second = recommend(sunnyBed);

  assert.deepEqual(
    first.mixes.map((m) => m.picks.map((p) => p.id)),
    second.mixes.map((m) => m.picks.map((p) => p.id)),
  );
});

test('a height limit is judged on typical height, not the extreme', () => {
  const low = siteFrom({
    place: 'yard',
    sun: 'sun',
    moisture: 'dry',
    soil: 'sand',
    size: 'small',
    height: 'low',
    deer: 'none',
  });

  for (const plant of poolFor(low)) {
    assert.ok(
      typicalHeight(plant) <= 2,
      `${plant.common} typically overtops a 2 foot limit`,
    );
  }
});

test('pots cap height even when the visitor says plants may grow tall', () => {
  const pots = siteFrom({
    place: 'container',
    sun: 'sun',
    moisture: 'medium',
    soil: 'loam',
    size: 'tiny',
    height: 'tall',
    deer: 'none',
  });

  assert.equal(pots.maxHeight, 2.5, 'the stricter of the two caps must win');

  for (const plant of poolFor(pots)) {
    assert.ok(typicalHeight(plant) <= 2.5, `${plant.common} will not fit a pot`);
  }
});

test('a roadside site only gets salt tolerant plants', () => {
  const roadside = siteFrom({
    place: 'roadside',
    sun: 'sun',
    moisture: 'dry',
    soil: 'sand',
    size: 'small',
    height: 'medium',
    deer: 'none',
  });

  const pool = poolFor(roadside);

  assert.ok(pool.length > 0, 'a roadside should still have options');
  for (const plant of pool) {
    assert.ok(plant.saltTolerant, `${plant.common} would die of road salt`);
  }
});

test('deer pressure removes the plants deer strip first', () => {
  const browsed = siteFrom({
    place: 'yard',
    sun: 'sun',
    moisture: 'medium',
    soil: 'loam',
    size: 'small',
    height: 'medium',
    deer: 'some',
  });

  for (const plant of poolFor(browsed)) {
    assert.ok(plant.deerResistant, `${plant.common} is deer candy`);
  }
});

test('the app says so when a site cannot grow milkweed', () => {
  const deepShade = siteFrom({
    place: 'yard',
    sun: 'shade',
    moisture: 'wet',
    soil: 'clay',
    size: 'small',
    height: 'low',
    deer: 'none',
  });

  const { pool, warnings } = recommend(deepShade);

  if (!pool.some((p) => p.monarch === 'host')) {
    assert.ok(
      warnings.some((w) => w.level === 'hard' && /milkweed/i.test(w.text)),
      'a monarch garden with no milkweed must be called out',
    );
  }
});

test('an impossible site returns no mixes and explains itself', () => {
  const impossible = { ...sunnyBed, maxHeight: 0.1 };
  const { pool, mixes, warnings } = recommend(impossible);

  assert.equal(pool.length, 0);
  assert.equal(mixes.length, 0);
  assert.equal(warnings[0].level, 'hard');
});

test('a mix never exceeds the number of species the area calls for', () => {
  for (const size of ['tiny', 'small', 'medium', 'large']) {
    const site = siteFrom({
      place: 'yard',
      sun: 'sun',
      moisture: 'medium',
      soil: 'loam',
      size,
      height: 'tall',
      deer: 'none',
    });

    for (const mix of recommend(site).mixes) {
      assert.ok(
        mix.picks.length <= site.species,
        `${mix.name} recommended more plants than the area fits`,
      );
    }
  }
});

test('the easy starter mix only contains forgiving plants', () => {
  const easy = recommend(sunnyBed).mixes.find((m) => m.id === 'easy-start');

  for (const plant of easy.picks) {
    assert.ok(plant.easy, `${plant.common} is not a beginner plant`);
  }
});

test('the species summary is counted from the plants actually chosen', () => {
  const { mixes } = recommend(sunnyBed);

  for (const mix of mixes) {
    const milkweeds = mix.picks.filter((p) => p.monarch === 'host').length;
    assert.equal(mix.serves.monarch.host, milkweeds);

    const grasses = mix.picks.filter((p) => p.type === 'grass').length;
    assert.equal(mix.serves.rustyPatched.nesting, grasses);
  }
});

test('matchesSite rejects a plant on any single failing condition', () => {
  const milkweed = plants.find((p) => p.id === 'swamp-milkweed');

  assert.ok(matchesSite(milkweed, sunnyBed));
  assert.ok(!matchesSite(milkweed, { ...sunnyBed, sun: 'shade' }));
  assert.ok(!matchesSite(milkweed, { ...sunnyBed, moisture: 'dry' }));
  assert.ok(!matchesSite(milkweed, { ...sunnyBed, soil: 'sand' }));
  assert.ok(!matchesSite(milkweed, { ...sunnyBed, requireSalt: true }));
});

test('every strategy can build a mix without crashing on a thin pool', () => {
  const thin = poolFor(sunnyBed).slice(0, 2);

  for (const strategy of strategies) {
    const mix = buildMix(strategy, thin, { ...sunnyBed, species: 8 });
    assert.ok(mix.picks.length <= 2);
  }
});

test('every species on the Xerces Great Lakes list is in our data', () => {
  // Checked against the copy of that list hosted in the Lady Bird Johnson
  // Wildflower Center plant database. If a future edit drops one of these,
  // the app quietly loses a plant an outside authority vouched for.
  const xerces = [
    'Agastache scrophulariifolia',
    'Amorpha canescens',
    'Asclepias tuberosa',
    'Ceanothus americanus',
    'Cirsium discolor',
    'Coreopsis lanceolata',
    'Crataegus crus-galli',
    'Dalea purpurea',
    'Echinacea purpurea',
    'Eryngium yuccifolium',
    'Eutrochium purpureum',
    'Gentiana andrewsii',
    'Liatris pycnostachya',
    'Lobelia siphilitica',
    'Lupinus perennis',
    'Monarda fistulosa',
    'Monarda punctata',
    'Penstemon digitalis',
    'Pycnanthemum virginianum',
    'Silphium perfoliatum',
    'Solidago speciosa',
    'Symphyotrichum lateriflorum',
    'Symphyotrichum novae-angliae',
    'Verbesina alternifolia',
  ];

  for (const species of xerces) {
    const plant = plants.find((p) => p.scientific === species);

    assert.ok(plant, `${species} is on the Xerces list but missing from our data`);
    assert.ok(
      plant.xercesListed,
      `${plant.common} is on the Xerces list but is not flagged as such`,
    );
  }

  const flagged = plants.filter((p) => p.xercesListed);
  assert.equal(
    flagged.length,
    xerces.length,
    'something is flagged as Xerces-listed that is not on the list',
  );
});

test('the same mix is never offered twice under different names', () => {
  // A site that suits only a few plants makes every strategy converge.
  const thin = siteFrom({
    place: 'raingarden',
    sun: 'shade',
    moisture: 'wet',
    soil: 'clay',
    size: 'small',
    height: 'tall',
    deer: 'none',
  });

  for (const site of [sunnyBed, thin]) {
    const { mixes } = recommend(site);
    const signatures = mixes.map((m) => m.picks.map((p) => p.id).join(','));

    assert.equal(new Set(signatures).size, mixes.length);
  }
});

test('a site with real variety still gets several different mixes', () => {
  const { mixes } = recommend(sunnyBed);
  assert.ok(mixes.length > 1, 'a rich site should offer a genuine choice');
});
