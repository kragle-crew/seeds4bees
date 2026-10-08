/**
 * The prairie scene behind the home page heading: a low sun, darker clouds
 * lit from underneath, rolling hills, and a fringe of grass.
 *
 * Drawn here rather than loaded as a picture, so it costs nothing to
 * download, stays sharp at any size, and takes its colors from index.css,
 * which gives it a dusk palette in dark mode and a daytime one in light.
 */

// A seeded generator, so the grass is the same on every load instead of
// rearranging itself each time the page opens.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Every grass blade along the bottom edge, as one path. */
const GRASS = (() => {
  const rand = seeded(7);
  const blades = [];

  for (let x = 0; x <= 1440; x += 6) {
    const height = 30 + rand() * 45;
    const lean = (rand() - 0.5) * 24;
    blades.push(
      `M${x - 2.2} 400Q${x + lean * 0.4} ${400 - height * 0.6} ${x + lean} ${400 - height}` +
        `Q${x + lean * 0.5} ${400 - height * 0.55} ${x + 2.2} 400Z`,
    );
  }

  return blades.join('');
})();

/**
 * Clouds, long and low like the bands of cloud you get at dusk. Each is a
 * cluster of flattened puffs: x and y place it in a 1440 by 400 sky, and the
 * puffs are offsets from there. They stay right of the heading and above the
 * hills, so nothing sits behind the text.
 */
const CLOUDS = [
  { x: 1010, y: 80, puffs: [[0, 0, 150, 22], [-110, 10, 95, 16], [120, 8, 110, 18], [30, -14, 80, 18]] },
  { x: 1330, y: 135, puffs: [[0, 0, 120, 18], [-90, 8, 80, 14], [85, 6, 90, 15], [10, -11, 60, 14]] },
  { x: 720, y: 45, puffs: [[0, 0, 110, 15], [-80, 6, 70, 12], [85, 5, 75, 12], [5, -9, 55, 12]] },
  { x: 1160, y: 205, puffs: [[0, 0, 160, 14], [-120, 6, 90, 10], [125, 5, 100, 11]] },
];

const puffs = (cloud, dy = 0) =>
  cloud.puffs.map(([x, y, rx, ry], j) => (
    <ellipse key={j} cx={cloud.x + x} cy={cloud.y + y + dy} rx={rx} ry={ry} />
  ));

export default function PrairieBackdrop() {
  return (
    <div className="prairie" aria-hidden="true">
      <div className="prairie__sun" />

      <svg className="prairie__clouds" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Softens the puffs into one mass, so they read as cloud. */}
          <filter id="cloud-soften" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        {CLOUDS.map((cloud, i) => (
          <g key={i} className="prairie__cloud" filter="url(#cloud-soften)">
            {/* The underside, lit by the low sun, peeking out below... */}
            <g className="prairie__cloud-lit">{puffs(cloud, 7)}</g>
            {/* ...and the dark body of the cloud over it. */}
            <g className="prairie__cloud-body">{puffs(cloud)}</g>
          </g>
        ))}
      </svg>
      <svg className="prairie__land" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path
          className="prairie__hill prairie__hill--far"
          d="M0 200C240 120 420 170 640 140S1080 90 1440 160V400H0Z"
        />
        <path
          className="prairie__hill prairie__hill--mid"
          d="M0 270C300 210 560 270 820 230S1200 200 1440 250V400H0Z"
        />
        <path
          className="prairie__hill prairie__hill--near"
          d="M0 330C260 295 520 335 800 300S1220 285 1440 320V400H0Z"
        />
        <path className="prairie__grass" d={GRASS} />
      </svg>
    </div>
  );
}
