/**
 * The site survey.
 *
 * Every question here has to earn its place by actually changing the plant
 * list. A question whose answer we would ignore is just a chore for the
 * visitor, so there are no "what is your favorite color" questions.
 *
 * Each option carries the facts the matcher needs:
 *   sun / moisture / soil   the condition the plant must tolerate
 *   maxHeight               feet, for spots where tall plants are a problem
 *   requireSalt             only salt-tolerant plants survive here
 *   species                 how many kinds of plant to recommend
 *   deerPressure            drop the plants deer strip first
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
        detail: 'Stays damp, puddles after rain, or sits low where water drains to',
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
    id: 'soil',
    title: 'What is the soil like?',
    help: 'Grab a damp handful and squeeze it. What it does tells you which one it is.',
    options: [
      {
        value: 'sand',
        label: 'Sandy',
        detail: 'Gritty, falls apart in your hand, water disappears straight down',
        soil: 'sand',
      },
      {
        value: 'loam',
        label: 'Rich and crumbly',
        detail: 'Dark, holds together loosely, full of worms. The good stuff',
        soil: 'loam',
      },
      {
        value: 'clay',
        label: 'Heavy clay',
        detail: 'Sticky, rolls into a rope, cracks when dry and glues to your shoes',
        soil: 'clay',
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
        detail: 'Smaller than a door laid flat',
        species: 5,
      },
      {
        value: 'small',
        label: 'A garden bed',
        detail: 'About the size of a car',
        species: 8,
      },
      {
        value: 'medium',
        label: 'A big patch',
        detail: 'About the size of a classroom',
        species: 12,
      },
      {
        value: 'large',
        label: 'A field',
        detail: 'Bigger than a basketball court',
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
    deerPressure: false,
    species: 8,
  };

  for (const option of chosen) {
    if (option.sun) site.sun = option.sun;
    if (option.moisture) site.moisture = option.moisture;
    if (option.soil) site.soil = option.soil;
    if (option.requireSalt) site.requireSalt = true;
    if (option.deerPressure) site.deerPressure = true;
    if (option.species) site.species = option.species;
    // Two questions can cap height: the pot question and the height question.
    // The stricter cap wins, because a 6 foot plant in a pot fails either way.
    if (option.maxHeight) site.maxHeight = Math.min(site.maxHeight, option.maxHeight);
  }

  return site;
}
