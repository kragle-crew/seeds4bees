/**
 * Plants people already have, or already want.
 *
 * The native list in plants.js answers "what should I plant?". This list
 * answers a different question: "does the flower I already like actually
 * help?" Most of these are common garden plants, and the honest answer for
 * several of them is not much.
 *
 * WHY THIS LIST EXISTS
 *
 * Telling someone their favorite flower is useless would be both rude and
 * unhelpful. Telling them nothing would be dishonest. So every entry says
 * what the plant does do, what it does not, and names a native that fills the
 * same spot in the garden when there is a better option. Nobody has to rip
 * anything out.
 *
 * TWO IDEAS THAT EXPLAIN MOST OF THE VERDICTS
 *
 * 1. DOUBLE FLOWERS ARE USUALLY EMPTY. Breeding a flower to have extra rows
 *    of petals generally replaces the parts that made pollen, and the petals
 *    block the way to whatever nectar is left. A single-flowered version of
 *    the same plant is often far better for bees.
 *
 * 2. NECTAR IS NOT THE SAME AS A HOST PLANT. A butterfly drinking at a flower
 *    is a customer. A caterpillar eating leaves is a resident. Monarchs need
 *    milkweed to lay eggs on, and no amount of nectar substitutes for it.
 *
 * FIELDS
 *   aliases     other names people search for, lowercase
 *   verdict     'great' | 'good' | 'limited' | 'caution'
 *   monarch     'host' | 'nectar' | null
 *   rustyPatched  true when bumble bees genuinely work it
 *   swap        id of a native in plants.js that fills the same garden role
 *
 * As with the native list, this is assembled from widely published guidance
 * and is a starting point, not a citation. Check anything surprising against
 * the Xerces Society or your extension office.
 */

export const gardenPlants = [
  {
    id: 'tropical-milkweed',
    common: 'Tropical Milkweed',
    scientific: 'Asclepias curassavica',
    aliases: ['tropical milkweed', 'bloodflower', 'mexican milkweed'],
    verdict: 'caution',
    monarch: 'host',
    rustyPatched: false,
    care: 'Full sun, average soil, 2 to 3 ft. Sold as an annual here.',
    summary:
      'Monarch caterpillars really do eat it, which is why garden centers sell it. The problem is that it does not die back on its own. In the warm South it keeps growing all winter, which lets a monarch parasite build up on the leaves and can convince butterflies to skip migrating.',
    localNote:
      'In the Upper Midwest frost kills it every year, so that risk is much smaller for you than it is in Texas or Florida. Native milkweed is still the better buy: it comes back on its own, and it feeds bumble bees too.',
    swap: 'swamp-milkweed',
  },
  {
    id: 'butterfly-bush',
    common: 'Butterfly Bush',
    scientific: 'Buddleja davidii',
    aliases: ['butterfly bush', 'buddleia', 'buddleja'],
    verdict: 'limited',
    monarch: 'nectar',
    rustyPatched: false,
    care: 'Full sun, well drained soil, 5 to 8 ft.',
    summary:
      'The name oversells it. Adult butterflies do drink at it, so it looks busy on a summer afternoon, but no butterfly in North America can raise caterpillars on it. It is a restaurant with no nursery.',
    localNote:
      'It also seeds itself into wild areas and is treated as invasive in several states.',
    swap: 'joe-pye-weed',
  },
  {
    id: 'hosta',
    common: 'Hosta',
    scientific: 'Hosta species',
    aliases: ['hosta', 'plantain lily'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Shade, moist soil, 1 to 3 ft.',
    summary:
      'Grown for leaves rather than flowers. Bumble bees will visit the summer flower spikes, but a bed of hostas is close to a food desert for pollinators, and nothing native eats the foliage.',
    swap: 'wild-geranium',
  },
  {
    id: 'daylily',
    common: 'Daylily',
    scientific: 'Hemerocallis species',
    aliases: ['daylily', 'day lily', 'ditch lily'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Sun to part sun, almost any soil, 1 to 3 ft.',
    summary:
      'Tough, cheap, and nearly useless to native bees. Each flower lasts a single day and offers little that a bumble bee can use.',
    swap: 'butterfly-weed',
  },
  {
    id: 'tulip',
    common: 'Tulip',
    scientific: 'Tulipa species',
    aliases: ['tulip', 'tulips'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Full sun, well drained soil, under 2 ft. Spring only.',
    summary:
      'Garden hybrids give bees very little, and the fancier and more double the variety, the less there is. Simple species tulips are somewhat better.',
    localNote:
      'This one stings, because tulips bloom exactly when bumble bee queens come out of hibernation and need food most. Adding one early native alongside them makes a real difference.',
    swap: 'prairie-smoke',
  },
  {
    id: 'daffodil',
    common: 'Daffodil',
    scientific: 'Narcissus species',
    aliases: ['daffodil', 'narcissus', 'jonquil'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Sun to part sun, well drained soil, under 2 ft. Spring only.',
    summary:
      'Cheerful, deer proof, and almost nothing to a bee. The whole plant is toxic, which is exactly why deer leave it alone.',
    localNote:
      'Like tulips, it takes up prime early spring space. Pair it with an early native rather than replacing it.',
    swap: 'golden-alexanders',
  },
  {
    id: 'marigold',
    common: 'Marigold',
    scientific: 'Tagetes species',
    aliases: ['marigold', 'marigolds'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Full sun, average soil, under 2 ft. Annual.',
    summary:
      'The common puffy varieties are double flowers, so there is little pollen left and the petals block the way in. Single-flowered types are noticeably better.',
    swap: 'black-eyed-susan',
  },
  {
    id: 'impatiens',
    common: 'Impatiens',
    scientific: 'Impatiens walleriana',
    aliases: ['impatiens', 'busy lizzie'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Shade, moist soil, under 1.5 ft. Annual.',
    summary:
      'The standard answer for shade colour, and close to invisible to native bees.',
    swap: 'great-blue-lobelia',
  },
  {
    id: 'petunia',
    common: 'Petunia',
    scientific: 'Petunia hybrids',
    aliases: ['petunia', 'petunias'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Full sun, containers or beds, under 1 ft. Annual.',
    summary:
      'Bred for colour and for flowering all summer. The nectar sits at the bottom of a long tube built for moths, so most bees cannot reach it.',
    swap: 'aromatic-aster',
  },
  {
    id: 'hydrangea',
    common: 'Hydrangea',
    scientific: 'Hydrangea macrophylla',
    aliases: ['hydrangea', 'hydrangeas', 'mophead'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Part sun, moist soil, 3 to 6 ft.',
    summary:
      'The big round mophead types are made almost entirely of sterile show flowers, which produce no pollen or nectar at all. Flat lacecap varieties have real fertile flowers in the middle and are genuinely visited.',
    swap: 'culvers-root',
  },
  {
    id: 'rose',
    common: 'Rose',
    scientific: 'Rosa hybrids',
    aliases: ['rose', 'roses'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Full sun, rich soil, varies by type.',
    summary:
      'A packed double rose has traded its pollen for petals. Single-flowered and wild roses, the kind with an open face and visible yellow centre, are a different story and bumble bees work them hard.',
    swap: 'wild-bergamot',
  },
  {
    id: 'peony',
    common: 'Peony',
    scientific: 'Paeonia hybrids',
    aliases: ['peony', 'peonies'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Full sun, rich soil, 2 to 3 ft.',
    summary:
      'The ants on the buds are after sugar on the outside of the flower, not pollinating it. Double varieties offer bees very little; single peonies offer real pollen.',
    swap: 'purple-coneflower',
  },
  {
    id: 'lavender',
    common: 'Lavender',
    scientific: 'Lavandula species',
    aliases: ['lavender'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: true,
    care: 'Full sun, dry well drained soil, 1 to 2 ft.',
    summary:
      'Not native, but genuinely good. Bumble bees work lavender steadily, and it blooms in the summer gap when some gardens go quiet.',
    localNote:
      'It will not feed a monarch caterpillar and it is not a spring or fall plant, so treat it as a useful extra rather than the backbone.',
    swap: null,
  },
  {
    id: 'catmint',
    common: 'Catmint',
    scientific: 'Nepeta species',
    aliases: ['catmint', 'nepeta', 'catnip'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: true,
    care: 'Full sun, average to dry soil, 1 to 2 ft.',
    summary:
      'A legitimately busy bee plant that blooms for months and reblooms if you cut it back. Not native, but it earns its space.',
    swap: null,
  },
  {
    id: 'zinnia',
    common: 'Zinnia',
    scientific: 'Zinnia elegans',
    aliases: ['zinnia', 'zinnias'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: false,
    care: 'Full sun, average soil, 1 to 3 ft. Annual, easy from seed.',
    summary:
      'Butterflies including monarchs really do feed at single-flowered zinnias, and they are one of the easiest things a kid can grow from seed. No caterpillar can use them, so they are a snack bar, not a home.',
    swap: null,
  },
  {
    id: 'sunflower',
    common: 'Annual Sunflower',
    scientific: 'Helianthus annuus',
    aliases: ['sunflower', 'sunflowers'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: true,
    care: 'Full sun, average soil, 3 to 10 ft. Annual.',
    summary:
      'Loads of pollen, and the seed heads feed birds afterwards. Watch out for varieties sold as pollenless for cut flowers, which are exactly as useless to bees as they sound.',
    swap: null,
  },
  {
    id: 'sedum-autumn-joy',
    common: 'Autumn Stonecrop',
    scientific: "Hylotelephium 'Herbstfreude'",
    aliases: ['sedum', 'autumn joy', 'stonecrop'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: true,
    care: 'Full sun, dry well drained soil, 1.5 to 2 ft.',
    summary:
      'Blooms in fall when the garden is winding down, which is when migrating monarchs and the last bumble bees need it. A useful non-native.',
    swap: 'new-england-aster',
  },
  {
    id: 'white-clover',
    common: 'White Clover',
    scientific: 'Trifolium repens',
    aliases: ['clover', 'white clover', 'lawn clover'],
    verdict: 'good',
    monarch: null,
    rustyPatched: true,
    care: 'Sun to part sun, any soil, under 6 in.',
    summary:
      'Not native, but bumble bees use it heavily, and letting it flower in a lawn costs nothing. Mowing less often is one of the cheapest things anyone can do for bees.',
    swap: null,
  },
  {
    id: 'flowering-herbs',
    common: 'Herbs left to flower',
    scientific: 'Oregano, thyme, mint, chives, basil',
    aliases: ['herbs', 'oregano', 'thyme', 'mint', 'chives', 'basil', 'sage'],
    verdict: 'good',
    monarch: 'nectar',
    rustyPatched: true,
    care: 'Full sun, average to dry soil, mostly under 2 ft.',
    summary:
      'Cooks cut herbs before they bloom. If you let even one plant flower, oregano and thyme in particular turn into bee magnets for weeks.',
    swap: null,
  },
  {
    id: 'boxwood',
    common: 'Boxwood',
    scientific: 'Buxus species',
    aliases: ['boxwood', 'box hedge', 'hedge'],
    verdict: 'limited',
    monarch: null,
    rustyPatched: false,
    care: 'Sun to part shade, well drained soil, clipped to size.',
    summary:
      'A green wall. Clipped hedges rarely flower at all, so they feed nothing and shelter little.',
    swap: 'leadplant',
  },
];

/** Case-insensitive name matching across everything a person might type. */
export const matchesQuery = (entry, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  const haystack = [
    entry.common,
    entry.scientific,
    ...(entry.aliases ?? []),
  ].map((s) => String(s).toLowerCase());

  return haystack.some((name) => name.includes(q));
};
