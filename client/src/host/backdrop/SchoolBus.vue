<script setup lang="ts">
const f1 = (n: number) => n.toFixed(1);
// the bus is a box seen from its back seat: wall points sit at depth z and project onto the vanishing point
const VP = { x: 960, y: 400 };
const px = (X: number, z: number) => VP.x + X / z;
const py = (Y: number, z: number) => VP.y + Y / z;
const WALL = 1120;
const ROOF = -560;
const FLOOR = 760;
const FAR = 4.4;

const quad = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L')} Z`;
const side = (s: number, z0: number, z1: number, y0: number, y1: number) =>
  quad([
    [px(s * WALL, z0), py(y0, z0)],
    [px(s * WALL, z1), py(y0, z1)],
    [px(s * WALL, z1), py(y1, z1)],
    [px(s * WALL, z0), py(y1, z0)],
  ]);

const LEFT_WALL = side(-1, 0.8, FAR, ROOF, FLOOR);
const RIGHT_WALL = side(1, 0.8, FAR, ROOF, FLOOR);
const CEIL = quad([
  [px(-WALL, 0.8), py(ROOF, 0.8)],
  [px(WALL, 0.8), py(ROOF, 0.8)],
  [px(WALL, FAR), py(ROOF, FAR)],
  [px(-WALL, FAR), py(ROOF, FAR)],
]);
const FLOOR_Q = quad([
  [px(-WALL, 0.8), py(FLOOR, 0.8)],
  [px(WALL, 0.8), py(FLOOR, 0.8)],
  [px(WALL, FAR), py(FLOOR, FAR)],
  [px(-WALL, FAR), py(FLOOR, FAR)],
]);
const AISLE = quad([
  [px(-260, 0.8), py(FLOOR, 0.8)],
  [px(260, 0.8), py(FLOOR, 0.8)],
  [px(260, FAR), py(FLOOR, FAR)],
  [px(-260, FAR), py(FLOOR, FAR)],
]);
const FRONT = { x0: px(-WALL, FAR), x1: px(WALL, FAR), y0: py(ROOF, FAR), y1: py(FLOOR, FAR) };

const SPANS: [number, number][] = [
  [0.9, 1.25],
  [1.4, 1.85],
  [2.0, 2.65],
  [2.8, 3.6],
];
const WIN_TOP = -440;
const WIN_BOT = 40;
const WINDOWS = [-1, 1].map((s) => SPANS.map(([a, b]) => side(s, a, b, WIN_TOP, WIN_BOT)).join(' '));
const SILLS = [-1, 1].map((s) => side(s, 0.8, FAR, WIN_BOT, WIN_BOT + 40));
const RAILS = [-1, 1].map((s) => `M${f1(px(s * 700, 0.8))} ${f1(py(ROOF + 90, 0.8))} L${f1(px(s * 700, FAR))} ${f1(py(ROOF + 90, FAR))}`).join(' ');
const LIGHTS = [1.3, 2.1, 3.2].map((z) => {
  const z1 = z + 0.35;
  return quad([
    [px(-160, z), py(ROOF, z)],
    [px(160, z), py(ROOF, z)],
    [px(160, z1), py(ROOF, z1)],
    [px(-160, z1), py(ROOF, z1)],
  ]);
});

// seat backs face the front, so from the back row we see their green vinyl and the odd head above
const SEAT_COLORS = ['#3f9a5a', '#2f8a7a'];
const HAIR = ['#5a3a2a', '#ffcf5a', '#1b1033', '#c4502a', '#8a5a3a', '#2a2a3a'];
const SEATS = [3.4, 2.5, 1.85, 1.35].flatMap((z, ri) =>
  [-1, 1].map((s, si) => {
    const xa = px(s * 1040, z);
    const xb = px(s * 330, z);
    const x = Math.min(xa, xb);
    const w = Math.abs(xb - xa);
    const top = py(230, z);
    const bottom = py(FLOOR, z);
    const r = 46 / z;
    const kid = (ri + si) % 3 !== 2;
    return { x, w, top, bottom, r, k: 1 / z, c: SEAT_COLORS[(ri + si) % 2], kid, hair: HAIR[(ri * 2 + si) % HAIR.length], hx: x + w * (si ? 0.38 : 0.62) };
  }),
);
const BIRCHES = (s: number) =>
  Array.from({ length: 14 }, (_, i) => {
    const x = s < 0 ? -420 + i * 160 : 700 + i * 160;
    return { x, w: 18 + (i % 3) * 8 };
  });
const LEFT_TREES = BIRCHES(-1);
const RIGHT_TREES = BIRCHES(1);
const ROAD_DASHES = [0, 1, 2];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="school-bus-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5ab4f0" />
        <stop offset="100%" stop-color="#cfeeff" />
      </linearGradient>
      <linearGradient id="school-bus-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe7a0" />
        <stop offset="100%" stop-color="#f4c45a" />
      </linearGradient>
      <linearGradient id="school-bus-ceil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6dc" />
        <stop offset="100%" stop-color="#f0dcae" />
      </linearGradient>
      <linearGradient id="school-bus-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7a7aa0" />
        <stop offset="100%" stop-color="#3d3f6a" />
      </linearGradient>
      <linearGradient id="school-bus-seat" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.15" />
      </linearGradient>
      <linearGradient id="school-bus-hill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8fdc6a" />
        <stop offset="100%" stop-color="#4fa848" />
      </linearGradient>
      <clipPath id="school-bus-left-win"><path :d="WINDOWS[0]" /></clipPath>
      <clipPath id="school-bus-right-win"><path :d="WINDOWS[1]" /></clipPath>
      <clipPath id="school-bus-front-win"><rect :x="FRONT.x0 + 30" :y="FRONT.y0 + 26" :width="FRONT.x1 - FRONT.x0 - 60" height="150" rx="14" /></clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1200" fill="#f4c45a" />
    <path :d="CEIL" fill="url(#school-bus-ceil)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path v-for="(d, i) in LIGHTS" :key="`lt${i}`" :d="d" fill="#fffbe0" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="LEFT_WALL" fill="url(#school-bus-wall)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="RIGHT_WALL" fill="url(#school-bus-wall)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="FLOOR_Q" fill="url(#school-bus-floor)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" />
    <path :d="AISLE" fill="#2a2c50" opacity="0.5" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect :x="FRONT.x0" :y="FRONT.y0" :width="FRONT.x1 - FRONT.x0" :height="FRONT.y1 - FRONT.y0" fill="#ffd23f" stroke-width="5" />
      <rect :x="FRONT.x0 + 30" :y="FRONT.y0 + 26" :width="FRONT.x1 - FRONT.x0 - 60" height="150" rx="14" fill="url(#school-bus-sky)" stroke-width="5" />
    </g>
    <g clip-path="url(#school-bus-front-win)">
      <path :d="`M${FRONT.x0} ${FRONT.y0 + 150} Q960 ${FRONT.y0 + 110} ${FRONT.x1} ${FRONT.y0 + 150} V${FRONT.y0 + 180} H${FRONT.x0} Z`" fill="url(#school-bus-hill)" />
      <path :d="`M930 ${FRONT.y0 + 128} L990 ${FRONT.y0 + 128} L1050 ${FRONT.y0 + 180} L870 ${FRONT.y0 + 180} Z`" fill="#6a6a8a" />
      <g v-for="i in ROAD_DASHES" :key="`rd${i}`" class="school-bus-dash" :style="{ animationDelay: `-${i * 0.4}s` }">
        <rect x="956" :y="FRONT.y0 + 130" width="8" height="10" fill="#fff" />
      </g>
    </g>
    <g stroke="#1b1033" stroke-linejoin="round">
      <rect :x="FRONT.x0 + 10" :y="FRONT.y0 + 190" :width="FRONT.x1 - FRONT.x0 - 20" height="40" rx="10" fill="#3d3f6a" stroke-width="4" />
      <circle :cx="FRONT.x0 + 110" :cy="FRONT.y0 + 214" r="40" fill="none" stroke-width="14" />
      <circle :cx="FRONT.x0 + 110" :cy="FRONT.y0 + 214" r="40" fill="none" stroke="#4a4a6a" stroke-width="7" />
      <ellipse :cx="FRONT.x0 + 110" :cy="FRONT.y0 + 170" rx="34" ry="30" fill="#8a5a3a" stroke-width="4" />
      <path :d="`M${FRONT.x0 + 70} ${FRONT.y0 + 156} Q${FRONT.x0 + 110} ${FRONT.y0 + 120} ${FRONT.x0 + 150} ${FRONT.y0 + 156} L${FRONT.x0 + 160} ${FRONT.y0 + 166} H${FRONT.x0 + 70} Z`" fill="#2f5ec0" stroke-width="4" />
      <rect :x="FRONT.x1 - 220" :y="FRONT.y0 + 2" width="120" height="22" rx="8" fill="#c9d4f2" stroke-width="3" />
    </g>
    <g class="school-bus-toy" :style="{ transformOrigin: `${FRONT.x1 - 160}px ${FRONT.y0 + 24}px` }" stroke="#1b1033" stroke-linejoin="round">
      <path :d="`M${FRONT.x1 - 160} ${FRONT.y0 + 24} V${FRONT.y0 + 70}`" stroke-width="3" />
      <path :d="`M${FRONT.x1 - 160} ${FRONT.y0 + 66} l-16 22 l16 22 l16 -22 Z`" fill="#ff5a5a" stroke-width="3" />
    </g>

    <g clip-path="url(#school-bus-left-win)">
      <path :d="WINDOWS[0]" fill="url(#school-bus-sky)" />
      <path d="M-200 380 Q100 300 400 350 Q600 380 800 330 V700 H-200 Z" fill="url(#school-bus-hill)" />
      <g class="school-bus-pass-left">
        <g v-for="(t, i) in LEFT_TREES" :key="`lt${i}`">
          <rect :x="t.x" y="-200" :width="t.w" height="800" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
          <path :d="`M${t.x} 0 h${t.w * 0.6} M${t.x + t.w * 0.4} 140 h${t.w * 0.6} M${t.x} 300 h${t.w * 0.5}`" stroke="#1b1033" stroke-width="7" />
          <circle :cx="t.x + t.w / 2" :cy="i % 2 ? 120 : 200" r="76" fill="#6cc04a" stroke="#1b1033" stroke-width="4" />
          <circle :cx="t.x + 80" cy="330" r="34" fill="#3f9a3a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
    </g>
    <g clip-path="url(#school-bus-right-win)">
      <path :d="WINDOWS[1]" fill="url(#school-bus-sky)" />
      <path d="M1100 330 Q1300 380 1500 350 Q1800 300 2120 380 V700 H1100 Z" fill="url(#school-bus-hill)" />
      <g class="school-bus-pass-right">
        <g v-for="(t, i) in RIGHT_TREES" :key="`rt${i}`">
          <rect :x="t.x" y="-200" :width="t.w" height="800" fill="#fffaf0" stroke="#1b1033" stroke-width="4" />
          <path :d="`M${t.x} 0 h${t.w * 0.6} M${t.x + t.w * 0.4} 140 h${t.w * 0.6} M${t.x} 300 h${t.w * 0.5}`" stroke="#1b1033" stroke-width="7" />
          <circle :cx="t.x + t.w / 2" :cy="i % 2 ? 120 : 200" r="76" fill="#6cc04a" stroke="#1b1033" stroke-width="4" />
          <circle :cx="t.x + 80" cy="330" r="34" fill="#3f9a3a" stroke="#1b1033" stroke-width="4" />
        </g>
      </g>
    </g>
    <path :d="WINDOWS.join(' ')" fill="none" stroke="#1b1033" stroke-width="12" stroke-linejoin="round" />
    <path :d="WINDOWS.join(' ')" fill="none" stroke="#e8e0f0" stroke-width="5" stroke-linejoin="round" />
    <path :d="SILLS.join(' ')" fill="#e0a43a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <path :d="RAILS" stroke="#1b1033" stroke-width="16" stroke-linecap="round" />
    <path :d="RAILS" stroke="#e8e0f0" stroke-width="8" stroke-linecap="round" />

    <g v-for="(s, i) in SEATS" :key="`se${i}`" stroke="#1b1033" stroke-linejoin="round">
      <g v-if="s.kid">
        <circle :cx="s.hx" :cy="s.top - 46 * s.k" :r="84 * s.k" :fill="s.hair" :stroke-width="5 * s.k + 1" />
        <path :d="`M${s.hx - 56 * s.k} ${s.top - 70 * s.k} Q${s.hx - 30 * s.k} ${s.top - 116 * s.k} ${s.hx + 10 * s.k} ${s.top - 112 * s.k}`" stroke="#fff" :stroke-width="8 * s.k" fill="none" stroke-linecap="round" opacity="0.4" />
      </g>
      <path :d="`M${s.x} ${s.bottom} V${s.top + s.r} Q${s.x} ${s.top} ${s.x + s.r} ${s.top} H${s.x + s.w - s.r} Q${s.x + s.w} ${s.top} ${s.x + s.w} ${s.top + s.r} V${s.bottom} Z`" :fill="s.c" :stroke-width="6 * s.k + 1.5" filter="url(#cel)" />
      <path :d="`M${s.x} ${s.bottom} V${s.top + s.r} Q${s.x} ${s.top} ${s.x + s.r} ${s.top} H${s.x + s.w - s.r} Q${s.x + s.w} ${s.top} ${s.x + s.w} ${s.top + s.r} V${s.bottom} Z`" fill="url(#school-bus-seat)" stroke="none" />
      <path :d="`M${s.x + 30 * s.k} ${s.top + 40 * s.k} H${s.x + s.w * 0.55}`" stroke="#b6ecc4" :stroke-width="10 * s.k" stroke-linecap="round" opacity="0.7" />
      <path :d="`M${s.x + s.w / 2} ${s.top + 90 * s.k} V${s.bottom - 40 * s.k}`" stroke="#1b1033" :stroke-width="4 * s.k" opacity="0.3" />
      <rect :x="s.x + s.w * 0.1" :y="s.top - 26 * s.k" :width="s.w * 0.8" :height="30 * s.k" :rx="15 * s.k" fill="#c9d4f2" :stroke-width="5 * s.k + 1" />
    </g>

    <g transform="translate(960 1000)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="70" rx="120" ry="18" fill="#1b1033" opacity="0.3" stroke="none" />
      <path d="M-90 70 Q-110 -80 0 -86 Q110 -80 90 70 Z" fill="#ff7a3a" stroke-width="6" filter="url(#cel-s)" />
      <path d="M-60 0 H60 V60 H-60 Z" fill="#ffd23f" stroke-width="5" />
      <path d="M-30 -86 Q0 -130 30 -86" fill="none" stroke-width="10" />
      <path d="M-30 -86 Q0 -130 30 -86" fill="none" stroke="#ff7a3a" stroke-width="5" />
      <path d="M-60 -40 Q-50 -66 -20 -70" stroke="#ffd0a0" stroke-width="7" fill="none" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.school-bus-pass-left {
  animation: school-bus-pass-left 2.6s linear infinite;
}

.school-bus-pass-right {
  animation: school-bus-pass-right 2.6s linear infinite;
}

.school-bus-dash {
  animation: school-bus-dash 1.2s linear infinite;
}

.school-bus-toy {
  animation: school-bus-toy 1.8s ease-in-out infinite alternate;
}

/* trees run toward the back of the bus; birch widths repeat every third tree, so a loop is three spacings */
@keyframes school-bus-pass-left {
  from {
    translate: 0 0;
  }
  to {
    translate: -480px 0;
  }
}

@keyframes school-bus-pass-right {
  from {
    translate: 0 0;
  }
  to {
    translate: 480px 0;
  }
}

@keyframes school-bus-dash {
  from {
    translate: 0 0;
    opacity: 1;
  }
  to {
    translate: 0 50px;
    opacity: 0.2;
  }
}

@keyframes school-bus-toy {
  from {
    rotate: -12deg;
  }
  to {
    rotate: 12deg;
  }
}
</style>
