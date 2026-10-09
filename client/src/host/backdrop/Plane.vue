<script setup lang="ts">
// one-point perspective down the aisle: a cabin profile at scale s sits centred on (960, 470),
// s = 1 is the front bulkhead and s = 8 is already past the screen edge
const VX = 960;
const VY = 470;
const NEAR = 8;
type Pt = [number, number];
const at = (p: Pt, s: number) => `${(VX + p[0] * s).toFixed(1)} ${(VY + p[1] * s).toFixed(1)}`;
// a band of cabin surface between two profile points, running from the bulkhead to the viewer
const band = (a: Pt, b: Pt, s1 = 1, s2 = NEAR) => `M${at(a, s1)} L${at(b, s1)} L${at(b, s2)} L${at(a, s2)} Z`;
const mirror = (p: Pt): Pt => [-p[0], p[1]];

const FLOOR: Pt = [-150, 130];
const WALL_LOW: Pt = [-162, 40];
const WALL_HIGH: Pt = [-160, -48];
const BIN_LOW: Pt = [-136, -56];
const BIN_HIGH: Pt = [-112, -126];
const CEIL: Pt = [-98, -138];
const PROFILE: Pt[] = [FLOOR, WALL_LOW, WALL_HIGH, BIN_LOW, BIN_HIGH, CEIL];
const BULKHEAD = `M${[...PROFILE, ...PROFILE.map(mirror).reverse()].map((p) => at(p, 1)).join(' L')} Z`;

const ROWS = [1.25, 1.55, 1.95, 2.5, 3.25, 4.3, 5.8];
const PORTS = [1.4, 1.75, 2.2, 2.85, 3.75, 5];
const portholes = (side: number) =>
  PORTS.map((s) => ({ cx: VX + side * 161 * s, cy: VY - 5 * s, rx: 11 * s, ry: 24 * s, s }));
const PORTS_L = portholes(-1);
const PORTS_R = portholes(1);
const ellipseD = (p: { cx: number; cy: number; rx: number; ry: number }) =>
  `M${p.cx - p.rx} ${p.cy}a${p.rx} ${p.ry} 0 1 0 ${p.rx * 2} 0a${p.rx} ${p.ry} 0 1 0 ${-p.rx * 2} 0Z`;
// the walls carry the porthole holes (evenodd), so the sky behind shows through without clipping
const WALL_L = band(FLOOR, WALL_LOW) + band(WALL_LOW, WALL_HIGH) + PORTS_L.map(ellipseD).join('');
const WALL_R = band(mirror(FLOOR), mirror(WALL_LOW)) + band(mirror(WALL_LOW), mirror(WALL_HIGH)) + PORTS_R.map(ellipseD).join('');
// half-drawn shades: the top half of some portholes
const SHADES = [...PORTS_L.filter((_, i) => i % 3 === 1), ...PORTS_R.filter((_, i) => i % 3 === 0)]
  .map((p) => `M${p.cx - p.rx} ${p.cy - p.ry * 0.1}A${p.rx} ${p.ry} 0 0 1 ${p.cx + p.rx} ${p.cy - p.ry * 0.1}Z`)
  .join('');

const BIN_SEAMS = ROWS.map((s) => `M${at(WALL_HIGH, s)} L${at(BIN_LOW, s)} L${at(BIN_HIGH, s)} M${at(mirror(WALL_HIGH), s)} L${at(mirror(BIN_LOW), s)} L${at(mirror(BIN_HIGH), s)}`).join('');
const BIN_HANDLES = ROWS.slice(0, -1).flatMap((s, i) => {
  const m = Math.sqrt(s * (ROWS[i + 1] ?? s));
  return [-1, 1].map((side) => ({ x: VX + side * 122 * m, y: VY - 84 * m, w: 6 * m, h: 14 * m }));
});
const CEIL_LIGHTS = ROWS.map((s) => ({ x: VX, y: VY - 136 * s, rx: 30 * s, ry: 4 * s }));

const sw = (s: number) => Math.min(5.5, 1.4 + 0.75 * s);
const HAIR = ['#5a2f1c', '#f2c14e', '#1b1033', '#c2502a', '#8a8aa0', '#3a2a1a'];
type Seat = { shine: string; d: string; head: string; stripe: string; side: string; s: number; heads: { cx: number; cy: number; r: number; c: string; phones: boolean }[]; screen: string; tray: string };
const SEATS: Seat[] = ROWS.map((s, ri) => {
  const top = VY + 30 * s;
  const bottom = VY + 140 * s;
  const r = 12 * s;
  const seatsX: Pt[] = [
    [-148, -98],
    [-94, -44],
    [44, 94],
    [98, 148],
  ];
  const back = (a: number, b: number) => {
    const x1 = VX + a * s;
    const x2 = VX + b * s;
    return `M${x1} ${bottom}V${top + r}Q${x1} ${top} ${x1 + r} ${top}H${x2 - r}Q${x2} ${top} ${x2} ${top + r}V${bottom}Z`;
  };
  const cover = (a: number, b: number) => `M${VX + (a + 6) * s} ${top + 3 * s}H${VX + (b - 6) * s}V${top + 18 * s}H${VX + (a + 6) * s}Z`;
  const stripe = (a: number, b: number) => `M${VX + (a + 6) * s} ${top + 14 * s}H${VX + (b - 6) * s}`;
  const s2 = s * 0.9;
  const side = [-44, 44]
    .map((x) => `M${at([x, 30], s)} L${at([x, 30], s2)} L${at([x, 140], s2)} L${at([x, 140], s)} Z`)
    .join('');
  const heads = seatsX
    .map(([a, b], si) => ({ seat: si, cx: VX + ((a + b) / 2) * s, cy: top - 4 * s, r: 15 * s, c: HAIR[(ri * 3 + si) % HAIR.length] ?? '#5a2f1c', phones: (ri + si) % 5 === 2 }))
    .filter((h) => ri < 6 && (ri * 7 + h.seat * 3) % 4 !== 0);
  const screen = s > 5 ? seatsX.map(([a, b]) => `M${VX + (a + 12) * s} ${top + 26 * s}h${(b - a - 24) * s}v${18 * s}h${-(b - a - 24) * s}Z`).join('') : '';
  const tray = s > 5 ? seatsX.map(([a, b]) => `M${VX + (a + 10) * s} ${top + 52 * s}h${(b - a - 20) * s}`).join('') : '';
  const shine = seatsX.map(([a]) => `M${VX + (a + 3) * s} ${top + 30 * s}V${top + 14 * s}`).join('');
  return {
    shine,
    d: seatsX.map(([a, b]) => back(a, b)).join(''),
    head: seatsX.map(([a, b]) => cover(a, b)).join(''),
    stripe: seatsX.map(([a, b]) => stripe(a, b)).join(''),
    side,
    s,
    heads,
    screen,
    tray,
  };
});
// seat-back maps on the nearest row only, the rest are hidden behind it anyway
const MAPS = [-148, -94, 44, 98].map((a) => ({ x: VX + (a + 12) * 5.8, y: VY + 56 * 5.8, k: (26 * 5.8) / 124 }));
const READING_CONES = [
  { s: 2.5, side: -1 },
  { s: 3.25, side: 1 },
  { s: 1.95, side: 1 },
].map(({ s, side }) => {
  const x = VX + side * 146 * s;
  const y = VY - 52 * s;
  return `M${x - 3 * s} ${y}L${x + 3 * s} ${y}L${VX + side * 70 * s} ${VY + 30 * s}L${VX + side * 140 * s} ${VY + 30 * s}Z`;
});
const AISLE_LIGHTS = ROWS.flatMap((s) => [-40, 40].map((x) => ({ x: VX + x * s, y: VY + 130 * s, r: 2.2 * s })));

// cloud sheets repeat every 800px and slide one period, so the loop is seamless through any porthole
const CLOUD_PERIOD = 800;
const CLOUD_PUFFS = [
  { x: 60, y: 380, k: 0.9 },
  { x: 330, y: 470, k: 1.2 },
  { x: 560, y: 300, k: 0.7 },
  { x: 720, y: 520, k: 1 },
];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="plane-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3f8fe8" />
        <stop offset="70%" stop-color="#9fd6ff" />
        <stop offset="100%" stop-color="#ffe2b8" />
      </linearGradient>
      <linearGradient id="plane-wall-l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e6d6c0" />
        <stop offset="100%" stop-color="#fbf1e2" />
      </linearGradient>
      <linearGradient id="plane-wall-r" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#d8c6ae" />
        <stop offset="100%" stop-color="#f6ead8" />
      </linearGradient>
      <linearGradient id="plane-bin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffaf2" />
        <stop offset="100%" stop-color="#e8dccb" />
      </linearGradient>
      <linearGradient id="plane-ceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#efe4d4" />
        <stop offset="100%" stop-color="#fff6e6" />
      </linearGradient>
      <linearGradient id="plane-carpet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a4aa0" />
        <stop offset="100%" stop-color="#2c2266" />
      </linearGradient>
      <linearGradient id="plane-seat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a7ae0" />
        <stop offset="100%" stop-color="#22449a" />
      </linearGradient>
      <radialGradient id="plane-haze" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff4e0" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fff4e0" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="plane-cove" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffd27a" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffd27a" stop-opacity="0" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="url(#plane-sky)" />
    <g fill="#fff">
      <g v-for="(dir, si) in ['l', 'r']" :key="`cs${dir}`" :class="`plane-rush-${dir}`">
        <g v-for="off in [-CLOUD_PERIOD, 0, CLOUD_PERIOD]" :key="off" :transform="`translate(${(si === 0 ? -60 : 1180) + off} 0)`">
          <g v-for="(p, pi) in CLOUD_PUFFS" :key="pi" :transform="`translate(${p.x} ${p.y}) scale(${p.k})`">
            <ellipse cx="0" cy="0" rx="110" ry="30" />
            <ellipse cx="40" cy="-24" rx="56" ry="34" />
            <ellipse cx="-36" cy="-14" rx="44" ry="26" />
            <ellipse cx="0" cy="12" rx="90" ry="12" fill="#cfe4f8" />
          </g>
        </g>
      </g>
    </g>

    <path :d="band(CEIL, mirror(CEIL))" fill="url(#plane-ceil)" />
    <path :d="band(BIN_HIGH, CEIL) + band(mirror(BIN_HIGH), mirror(CEIL))" fill="#e2d4c0" />
    <path :d="band([-30, -140], [30, -140])" fill="#fff3d0" />
    <g class="soft-glow">
      <ellipse v-for="(l, i) in CEIL_LIGHTS" :key="`cl${i}`" :cx="l.x" :cy="l.y" :rx="l.rx" :ry="l.ry" fill="#fff8d8" />
    </g>
    <path :d="band(BIN_LOW, BIN_HIGH)" fill="url(#plane-bin)" />
    <path :d="band(mirror(BIN_LOW), mirror(BIN_HIGH))" fill="#ece0ce" />
    <path :d="band(WALL_HIGH, BIN_LOW) + band(mirror(WALL_HIGH), mirror(BIN_LOW))" fill="#bfae98" />
    <path :d="`M${at(BIN_LOW, 1)} L${at(BIN_LOW, NEAR)} M${at(mirror(BIN_LOW), 1)} L${at(mirror(BIN_LOW), NEAR)}`" stroke="#1b1033" stroke-width="5" />
    <path :d="BIN_SEAMS" stroke="#b8a68e" stroke-width="3" fill="none" />
    <rect v-for="(h, i) in BIN_HANDLES" :key="`bh${i}`" :x="h.x - h.w / 2" :y="h.y - h.h / 2" :width="h.w" :height="h.h" :rx="h.w / 2" fill="#9c8a74" />

    <path :d="WALL_L" fill="url(#plane-wall-l)" fill-rule="evenodd" />
    <path :d="WALL_R" fill="url(#plane-wall-r)" fill-rule="evenodd" />
    <path :d="band(WALL_HIGH, [-161, -30]) + band(mirror(WALL_HIGH), [161, -30])" fill="url(#plane-cove)" />
    <path :d="SHADES" fill="#f4ead8" stroke="#1b1033" stroke-width="3" />
    <g v-for="(p, i) in [...PORTS_L, ...PORTS_R]" :key="`pr${i}`" fill="none">
      <ellipse :cx="p.cx" :cy="p.cy" :rx="p.rx + 2.6 * p.s" :ry="p.ry + 3.4 * p.s" stroke="#1b1033" :stroke-width="sw(p.s)" />
      <ellipse :cx="p.cx" :cy="p.cy" :rx="p.rx + 1.3 * p.s" :ry="p.ry + 1.7 * p.s" stroke="#fffaf0" :stroke-width="2.4 * p.s" />
      <ellipse :cx="p.cx" :cy="p.cy" :rx="p.rx" :ry="p.ry" :stroke="'#1b1033'" :stroke-width="sw(p.s) * 0.7" />
      <path :d="`M${p.cx - p.rx * 0.5} ${p.cy - p.ry * 0.55} q${p.rx * 0.2} ${-p.ry * 0.25} ${p.rx * 0.5} ${-p.ry * 0.3}`" stroke="#fff" :stroke-width="1.2 * p.s" stroke-linecap="round" opacity="0.8" />
    </g>

    <path :d="band(FLOOR, mirror(FLOOR))" fill="url(#plane-carpet)" />
    <path :d="band([-14, 130], [14, 130])" fill="#7a68c8" opacity="0.5" />
    <path :d="BULKHEAD" fill="#f6ecdc" stroke="#8a7a6a" stroke-width="3" stroke-linejoin="round" />
    <path d="M922 600 V466 Q922 442 946 442 H974 Q998 442 998 466 V600 Z" fill="#c9b79e" stroke="#8a7a6a" stroke-width="3" />
    <g class="plane-curtain">
      <path d="M924 446 H996 L1000 600 Q980 590 960 600 Q940 590 920 600 Z" fill="#4a6ad0" stroke="#3a3a7a" stroke-width="3" stroke-linejoin="round" />
      <path d="M944 452 L940 594 M962 452 V596 M980 452 L984 594" stroke="#3450a8" stroke-width="3" />
    </g>
    <rect x="938" y="410" width="44" height="20" rx="4" fill="#3a3a7a" />
    <rect x="943" y="414" width="34" height="12" rx="3" fill="#2ed47a" class="blinky" style="animation-duration: 2.4s" />
    <ellipse cx="960" cy="480" rx="420" ry="300" fill="url(#plane-haze)" />

    <g v-for="(seat, i) in SEATS" :key="`row${i}`">
      <ellipse v-if="seat.s > 2" :cx="VX - 96 * seat.s" :cy="VY + 140 * seat.s" :rx="56 * seat.s" :ry="5 * seat.s" fill="#140c3a" opacity="0.35" />
      <ellipse v-if="seat.s > 2" :cx="VX + 96 * seat.s" :cy="VY + 140 * seat.s" :rx="56 * seat.s" :ry="5 * seat.s" fill="#140c3a" opacity="0.35" />
      <g v-for="(h, hi) in seat.heads" :key="`hd${hi}`">
        <circle :cx="h.cx" :cy="h.cy" :r="h.r" :fill="h.c" stroke="#1b1033" :stroke-width="sw(seat.s) * 0.8" />
        <path :d="`M${h.cx - h.r * 0.5} ${h.cy - h.r * 0.45} q${h.r * 0.3} ${-h.r * 0.3} ${h.r * 0.7} ${-h.r * 0.3}`" stroke="#fff" :stroke-width="0.9 * seat.s" fill="none" stroke-linecap="round" opacity="0.45" />
        <path v-if="h.phones" :d="`M${h.cx - h.r * 1.05} ${h.cy + h.r * 0.2} A${h.r * 1.05} ${h.r * 1.1} 0 0 1 ${h.cx + h.r * 1.05} ${h.cy + h.r * 0.2}`" stroke="#ff4f8b" :stroke-width="2.2 * seat.s" fill="none" />
      </g>
      <path :d="seat.side" fill="#1a2f6e" stroke="#1b1033" :stroke-width="sw(seat.s) * 0.8" stroke-linejoin="round" />
      <path :d="seat.d" fill="url(#plane-seat)" stroke="#1b1033" :stroke-width="sw(seat.s)" stroke-linejoin="round" :filter="seat.s > 3 ? 'url(#cel)' : undefined" />
      <path :d="seat.shine" stroke="#8fc0ff" :stroke-width="2.4 * seat.s" stroke-linecap="round" opacity="0.8" />
      <path :d="seat.head" fill="#fffaf0" />
      <path :d="seat.stripe" stroke="#ff4f8b" :stroke-width="3 * seat.s" />
      <path v-if="seat.screen" :d="seat.screen" fill="#2a8fd6" stroke="#1b1033" :stroke-width="sw(seat.s) * 0.7" stroke-linejoin="round" />
      <path v-if="seat.tray" :d="seat.tray" stroke="#16306e" :stroke-width="2 * seat.s" stroke-linecap="round" />
    </g>
    <g class="glow">
      <circle v-for="(l, i) in AISLE_LIGHTS" :key="`al${i}`" :cx="l.x" :cy="l.y" :r="l.r" fill="#ffd27a" />
    </g>
    <g v-for="(m, i) in MAPS" :key="`map${i}`" :transform="`translate(${m.x} ${m.y}) scale(${m.k})`">
      <path d="M8 30 Q20 10 44 18 Q60 30 50 48 Q30 56 14 48 Z M80 14 Q100 6 116 20 Q120 40 100 46 Q84 40 80 14 Z" fill="#3fbf6a" />
      <path d="M30 34 Q64 0 100 28" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" fill="none" stroke-linecap="round" />
      <path d="M68 12 l10 4 l-10 4 l2 -4 Z" fill="#ffd23f" />
    </g>
    <g class="soft-glow">
      <path v-for="(c, i) in READING_CONES" :key="`rc${i}`" :d="c" fill="#ffe7a0" opacity="0.28" />
    </g>
  </g>
</template>

<style scoped>
.plane-rush-l {
  animation: plane-rush-l 9s linear infinite;
}

.plane-rush-r {
  animation: plane-rush-r 9s linear infinite;
}

.plane-curtain {
  transform-box: fill-box;
  transform-origin: top center;
  animation: plane-curtain 4s ease-in-out infinite alternate;
}

@keyframes plane-rush-l {
  to {
    translate: -800px 0;
  }
}

@keyframes plane-rush-r {
  to {
    translate: 800px 0;
  }
}

@keyframes plane-curtain {
  from {
    scale: 1 1;
  }
  to {
    scale: 0.96 1;
  }
}
</style>
