/**
 * The site survey.
 *
 * Every question here has to earn its place by actually changing the plant
 * list. A question whose answer we would ignore is just a chore for the
 * visitor, so there are no "what is your favorite colour" questions.
 *
 * ONE DELIBERATE OMISSION
 *
 * There is no question about air humidity. The whole Upper Midwest is humid
 * continental, so it is close to identical everywhere we cover and separates
 * no two plants on this list. What people usually mean by that concern is
 * soil dampness and drainage, which questions 3 and 4 ask properly: how wet
 * the ground stays is a different thing from whether water sits on top of it,
 * and the two rule out different plants.
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
 */

export const questions = [
  {
    id: 'place',
    title: 'Where are you planting?',
    help: 'This tells us about road salt, mowing, and how much room there is.',
    options: [
      {
        value: 'yard',
        label: 'A yard or garden bed',
        detail: 'At a house, with normal soil and nobody salting it',
      },
      {
        value: 'school',
        label: 'School or park grounds',
        detail: 'Public ground that should look cared for, not overgrown',
      },
      {
        value: 'roadside',
        label: 'Along a road or sidewalk',
        detail: 'Gets winter salt spray, which kills most plants',
        requireSalt: true,
      },
      {
        value: 'raingarden',
        label: 'A low spot that puddles',
        detail: 'A ditch or rain garden where water collects after a storm',
      },
      {
        value: 'container',
        label: 'Pots or a raised bed',
        detail: 'Roots are boxed in, so tall deep-rooted plants will not work',
        maxHeight: 2.5,
      },
      {
        value: 'field',
        label: 'A big open field or farm edge',
        detail: 'Lots of room, and tall prairie plants are welcome',
      },
    ],
  },
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
    id: 'moisture',
    title: 'How wet or dry does the ground stay?',
    help: 'Think about three days after a big rain. Is it still squishy, or already dusty?',
    options: [
      {
        value: 'wet',
        label: 'Wet',
        detail: 'Stays damp, or sits low where water drains to',
        moisture: 'wet',
      },
      {
        value: 'medium',
        label: 'Medium',
        detail: 'Normal garden ground. Dries out in a drought but is not soggy',
        moisture: 'medium',
      },
      {
        value: 'dry',
        label: 'Dry',
        detail: 'Drains fast, bakes in summer, or sits on a slope or sand',
        moisture: 'dry',
      },
    ],
  },
  {
    id: 'standing',
    title: 'After a heavy storm, does water sit on top of the ground?',
    help: 'This is a different question from the last one. Soil can stay damp for weeks and never flood, and a plant that likes damp can still drown.',
    options: [
      {
        value: 'none',
        label: 'No, it soaks in',
        detail: 'Water disappears into the ground and never pools',
      },
      {
        value: 'hours',
        label: 'It puddles for a few hours',
        detail: 'A shallow pool that is gone by the next morning. Most plants cope',
      },
      {
        value: 'days',
        label: 'Water sits for days',
        detail: 'A real pond after a storm. Roots are underwater and most plants rot',
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
        label: 'A few pots',
        detail: 'Under about 20 square feet, or a couple of containers',
        species: 5,
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
    // Two questions can cap height: the pot question and the height question.
    // The stricter cap wins, because a 6 foot plant in a pot fails either way.
    if (option.maxHeight) site.maxHeight = Math.min(site.maxHeight, option.maxHeight);
  }

  return site;
}
