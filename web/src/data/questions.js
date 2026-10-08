/**
 * The site survey.
 *
 * Every question here has to earn its place by actually changing what the
 * visitor gets. A question whose answer we would ignore is just a chore, so
 * there are no "what is your favorite colour" questions. All but the last
 * decide which plants can grow; the last decides which kind of mix to show
 * first.
 *
 * ONE DELIBERATE OMISSION
 *
 * There is no question about air humidity. The whole Upper Midwest is humid
 * continental, so it is close to identical everywhere we cover and separates
 * no two plants on this list. What people usually mean by that concern is
 * soil dampness and drainage, which the water question asks properly. Its
 * last answer, flooding, is a harsher test than damp ground: plenty of plants
 * want wet soil and still drown when their roots sit underwater for days.
 *
 * Each option carries the facts the matcher needs:
 *   sun / moisture / soil   the condition the plant must tolerate
 *   maxHeight               feet, for spots where tall plants are a problem
 *   requireSalt             only salt-tolerant plants survive here
 *   requireStandingWater    only plants that take being submerged
 *   limeySoil               drop the plants that need acid ground
 *   noSpreaders             drop the plants that run or self-seed around
 *   deerPressure            drop the plants deer strip first
 *   species                 how many kinds of plant to recommend
 *   mix                     which kind of mix to put first (a strategy id
 *                           from lib/recommend.js)
 */

export const questions = [
  {
    id: 'sun',
    title: 'How much sun does the spot get?',
    help: 'Go out and check at noon in summer. Sun is the hardest thing to fake.',
    options: [
      {
        value: 'sun',
        label: 'Full sun',
        detail: '6 or more hours of direct sun',
        sun: 'sun',
      },
      {
        value: 'part',
        label: 'Part sun',
        detail: 'Around 3 to 6 hours, or dappled light through leaves',
        sun: 'part',
      },
      {
        value: 'shade',
        label: 'Mostly shade',
        detail: 'Under 3 hours, like the north side of a building or under trees',
        sun: 'shade',
      },
    ],
  },
  {
    id: 'water',
    title: 'How wet does the ground get?',
    help: 'Think about three days after a big storm. Is it dusty, squishy, or still underwater?',
    options: [
      {
        value: 'dry',
        label: 'Dry',
        detail: 'Drains fast, bakes in summer, or sits on a slope or sand',
        moisture: 'dry',
      },
      {
        value: 'medium',
        label: 'Medium',
        detail: 'Normal garden ground. A puddle after a storm is gone by morning',
        moisture: 'medium',
      },
      {
        value: 'damp',
        label: 'Damp',
        detail: 'Stays squishy for days, but the water soaks in rather than pooling',
        moisture: 'wet',
      },
      {
        value: 'floods',
        label: 'Floods',
        detail: 'Water sits on top for days after a storm, like a rain garden or ditch',
        moisture: 'wet',
        requireStandingWater: true,
      },
    ],
  },
  {
    id: 'soil',
    title: 'What is the soil like?',
    help: 'Wet a handful, squeeze it, then try to roll it into a snake between your palms. What happens tells you which one you have.',
    options: [
      {
        value: 'sand',
        label: 'Sandy',
        detail: 'Gritty. Falls apart and will not roll into anything',
        soil: 'sand',
      },
      {
        value: 'loam',
        label: 'Rich and crumbly',
        detail: 'Rolls into a short snake that cracks and breaks. Dark, full of worms',
        soil: 'loam',
      },
      {
        value: 'clay',
        label: 'Heavy clay',
        detail: 'Rolls into a long bendy snake and stays shiny. Cracks when dry',
        soil: 'clay',
      },
    ],
  },
  {
    id: 'lime',
    title: 'Is your soil limey or acidic?',
    help: 'A cheap test kit answers this, or your county extension office tests it. Only a few plants care, so skipping this costs you little.',
    options: [
      {
        value: 'unknown',
        label: 'No idea',
        detail: 'Most of our plants cope with either, so we will not rule anything out',
      },
      {
        value: 'limey',
        label: 'Limey or chalky',
        detail: 'Alkaline, above pH 7. Common over limestone or near old concrete',
        limeySoil: true,
      },
      {
        value: 'acidic',
        label: 'Acidic',
        detail: 'Below pH 7. Common in sandy pine country and old woodland',
      },
    ],
  },
  {
    id: 'size',
    title: 'How big is the area?',
    help: 'This sets how many different kinds of plant to put in the mix.',
    options: [
      {
        value: 'tiny',
        label: 'Pots or a raised bed',
        detail: 'Under about 20 square feet. Roots are boxed in, so tall plants will not work',
        species: 5,
        maxHeight: 2.5,
      },
      {
        value: 'small',
        label: 'A garden bed',
        detail: 'Roughly 20 to 200 square feet, about the footprint of a car',
        species: 8,
      },
      {
        value: 'medium',
        label: 'A big patch',
        detail: 'Roughly 200 to 1,000 square feet, about the size of a classroom',
        species: 12,
      },
      {
        value: 'large',
        label: 'A field',
        detail: 'Over 1,000 square feet, bigger than a basketball court',
        species: 16,
      },
    ],
  },
  {
    id: 'height',
    title: 'How tall can the plants get?',
    help: 'Some prairie plants reach over your head, which is great in a field and bad under a window.',
    options: [
      {
        value: 'low',
        label: 'Keep it low',
        detail: 'Under 2 feet, so nothing blocks a view or a sidewalk',
        maxHeight: 2,
      },
      {
        value: 'medium',
        label: 'Waist high is fine',
        detail: 'Up to about 4 feet',
        maxHeight: 4,
      },
      {
        value: 'tall',
        label: 'Let them get tall',
        detail: 'Anything goes, including plants taller than you',
        maxHeight: 99,
      },
    ],
  },
  {
    id: 'road',
    title: 'Is it next to a road or sidewalk that gets salted?',
    help: 'Winter salt splashes several feet off the pavement and kills most plants it lands on.',
    options: [
      {
        value: 'no',
        label: 'No',
        detail: 'Nowhere near a salted road or path',
      },
      {
        value: 'yes',
        label: 'Yes',
        detail: 'Right beside a road, driveway, or sidewalk that is salted in winter',
        requireSalt: true,
      },
    ],
  },
  {
    id: 'spread',
    title: 'Should plants stay where you put them?',
    help: 'Some natives run underground or seed themselves everywhere. That is free ground cover in a rough area and a nuisance in a tidy bed.',
    options: [
      {
        value: 'fine',
        label: 'Spreading is fine',
        detail: 'We want it to fill in and crowd out weeds on its own',
      },
      {
        value: 'tidy',
        label: 'Keep them in place',
        detail: 'Stick to plants that stay in a clump and do not wander',
        noSpreaders: true,
      },
    ],
  },
  {
    id: 'deer',
    title: 'Do deer or rabbits eat things here?',
    help: 'Nothing is truly deer proof, but some plants get eaten first.',
    options: [
      {
        value: 'none',
        label: 'Not really',
        detail: 'We can plant whatever we want',
        deerPressure: false,
      },
      {
        value: 'some',
        label: 'Yes, they visit',
        detail: 'Stick to plants deer usually walk past',
        deerPressure: true,
      },
    ],
  },
  {
    id: 'kind',
    title: 'What kind of seed mix do you want?',
    help: 'This picks which mix you see first. The other kinds will still be there to look at.',
    options: [
      {
        value: 'season',
        label: 'Flowers all season',
        detail: 'Something blooming from spring to fall. The safest choice',
        mix: 'full-season',
      },
      {
        value: 'bees',
        label: 'Best for bumble bees',
        detail: 'Extra spring and fall flowers, plus grass for nesting',
        mix: 'bumble-bee',
      },
      {
        value: 'monarchs',
        label: 'Best for monarchs',
        detail: 'Lots of milkweed, plus nectar for the trip to Mexico',
        mix: 'monarch',
      },
      {
        value: 'easy',
        label: 'Easy to grow',
        detail: 'Forgiving plants that are easy to find and hard to kill',
        mix: 'easy-start',
      },
      {
        value: 'tidy',
        label: 'Short and tidy',
        detail: 'Low plants that stay put, for beds people look at',
        mix: 'short',
      },
      {
        value: 'meadow',
        label: 'Wild meadow',
        detail: 'Flowers mixed with native grasses, like a real prairie',
        mix: 'meadow',
      },
    ],
  },
];

/** Every question must be answered before a mix is worth showing. */
export const questionIds = questions.map((q) => q.id);

/** Looks up the chosen option object for one question. */
export function optionFor(questionId, value) {
  const question = questions.find((q) => q.id === questionId);
  return question?.options.find((o) => o.value === value) ?? null;
}

/**
 * Flattens the chosen options into the single settings object the matcher
 * reads, so the matcher never has to know how the form is laid out.
 */
export function siteFrom(answers) {
  const chosen = questionIds
    .map((id) => optionFor(id, answers[id]))
    .filter(Boolean);

  const site = {
    sun: null,
    moisture: null,
    soil: null,
    maxHeight: 99,
    requireSalt: false,
    requireStandingWater: false,
    limeySoil: false,
    noSpreaders: false,
    deerPressure: false,
    species: 8,
    preferredMix: null,
  };

  for (const option of chosen) {
    if (option.sun) site.sun = option.sun;
    if (option.moisture) site.moisture = option.moisture;
    if (option.soil) site.soil = option.soil;
    if (option.requireSalt) site.requireSalt = true;
    if (option.requireStandingWater) site.requireStandingWater = true;
    if (option.limeySoil) site.limeySoil = true;
    if (option.noSpreaders) site.noSpreaders = true;
    if (option.deerPressure) site.deerPressure = true;
    if (option.species) site.species = option.species;
    if (option.mix) site.preferredMix = option.mix;
    // Two answers can cap height: pots, and the height question itself.
    // The stricter cap wins, because a 6 foot plant in a pot fails either way.
    if (option.maxHeight) site.maxHeight = Math.min(site.maxHeight, option.maxHeight);
  }

  return site;
}
