<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(4339);
const INK = '#1b1033';

const star = (x: number, y: number, r: number) =>
  `M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;

// tinsel curtain behind the stage: one path per colour, strips sway a little so they read as hanging foil
const TINSEL = Array.from({ length: 70 }, (_, i) => {
  const x = -54 + i * 12 + rnd() * 4;
  const sway = (rnd() - 0.5) * 16;
  return { x, sway, d: `M${x} 304 Q${x + sway} 530 ${x + sway * 0.4} 748` };
});
const TINSEL_COLORS = ['#ff5fb0', '#ffc94a', '#b98aff'];
const TINSEL_PATHS = TINSEL_COLORS.map((_, c) =>
  TINSEL.filter((_, i) => i % 3 === c)
    .map((t) => t.d)
    .join(' '),
);
const TINSEL_SHINE = [0, 1].map((g) =>
  TINSEL.filter((_, i) => i % 2 === g)
    .map((t) => {
      const y = 340 + rnd() * 340;
      const x = t.x + t.sway * ((y - 304) / 444) * 0.8 + 2;
      return `M${x} ${y} L${x} ${y + 26 + rnd() * 30}`;
    })
    .join(' '),
);

const STAGE_LEDS = Array.from({ length: 24 }, (_, i) => ({ x: -40 + i * 34, c: TINSEL_COLORS[i % 3] }));
const LED_LIT = STAGE_LEDS.filter((_, i) => i % 2 === 0);

const BALL = { x: 860, y: 156, r: 52 };
const REFLECTIONS = Array.from({ length: 44 }, (_, i) => {
  const a = rnd() * Math.PI * 2;
  const r = 170 + rnd() * 1000;
  return {
    x: BALL.x + Math.cos(a) * r,
    y: BALL.y + Math.sin(a) * r * 0.75,
    rx: 5 + rnd() * 5,
    c: ['#ffffff', '#ffd0ee', '#c9f8ff'][i % 3],
  };
});
const SPARKLES = [0, 1].map((g) =>
  Array.from({ length: 5 }, () => {
    const a = rnd() * Math.PI * 2;
    const r = 70 + rnd() * 110;
    return star(BALL.x + Math.cos(a) * r, BALL.y + Math.sin(a) * r * 0.8, 8 + rnd() * 10);
  })
    .join(' ')
    .concat(g === 0 ? ` ${star(BALL.x - 26, BALL.y - 22, 16)}` : ''),
);

const WALL_DOTS = Array.from({ length: 13 }, (_, row) =>
  Array.from({ length: 27 }, (_, col) => {
    const x = -40 + col * 76 + (row % 2) * 38;
    const y = 70 + row * 40;
    return `M${x - 6} ${y} L${x + 6} ${y} M${x} ${y - 6} L${x} ${y + 6}`;
  }).join(' '),
).join(' ');

const TUFT_X = Array.from({ length: 12 }, (_, i) => -60 + i * 180);
const TUFTS = TUFT_X.map((x) => `M${x} 592 L${x + 180} 784 M${x + 180} 592 L${x} 784`).join(' ');

const CARPET = Array.from({ length: 54 }, (_, i) => {
  const x = -40 + rnd() * 2000;
  const y = 880 + rnd() * 240;
  const s = 12 + rnd() * 10;
  return { d: `M${x - s} ${y} q${s / 2} ${-s * 0.7} ${s} 0 t${s} 0`, c: i % 3 };
});
const CARPET_PATHS = [0, 1, 2].map((c) =>
  CARPET.filter((p) => p.c === c)
    .map((p) => p.d)
    .join(' '),
);
const CARPET_COLORS = ['#ff5fb0', '#22d3ee', '#ffc94a'];

const LINE_1 = [80, 46, 96, 62, 70];
const LINE_2 = [60, 92, 54, 84];
const pills = (widths: number[], x0: number) => {
  let x = x0;
  return widths.map((w) => {
    const p = { x, w };
    x += w + 14;
    return p;
  });
};
const LYRIC_1 = pills(LINE_1, 1324);
const LYRIC_2 = pills(LINE_2, 1356);

const SPEAKERS = [
  { x: 1196, s: 0 },
  { x: 1846, s: 1 },
];

const NOTES = [
  [
    { x: 470, y: 560, c: '#ffd23f' },
    { x: 540, y: 640, c: '#22d3ee' },
    { x: 300, y: 600, c: '#ff5fb0' },
  ],
  [
    { x: 1150, y: 270, c: '#ff5fb0' },
    { x: 1890, y: 250, c: '#ffd23f' },
    { x: 1240, y: 220, c: '#2ed47a' },
  ],
];
const noteHead = (x: number, y: number) => `M${x - 14} ${y} a14 10 -20 1 0 28 0 a14 10 -20 1 0 -28 0 Z`;
const noteFlag = (x: number, y: number) => `M${x + 12} ${y - 2} L${x + 12} ${y - 48} Q${x + 30} ${y - 40} ${x + 32} ${y - 22}`;

const BEAMS = [
  { x: 1080, rot: [-24, 0, 22], c: '#ff9a3c', cls: 'karaoke-beam-a' },
  { x: 1640, rot: [-20, 4, 26], c: '#2ee6c8', cls: 'karaoke-beam-b' },
];

const CHIPS = Array.from({ length: 7 }, (_, i) => ({ x: 1222 + i * 13 + rnd() * 6, y: 878 - rnd() * 14, a: Math.round(rnd() * 80 - 40) }));
const JINGLES = [0, 60, 120, 180, 240, 300];

// big split leaves of a potted plant in the bottom-right corner, drawn as foreground silhouettes
const LEAVES = [
  { a: -150, l: 300, w: 90 },
  { a: -120, l: 360, w: 110 },
  { a: -95, l: 330, w: 100 },
  { a: -70, l: 260, w: 80 },
  { a: -165, l: 220, w: 70 },
].map(({ a, l, w }) => {
  const bx = 1890;
  const by = 1060;
  const r = (a * Math.PI) / 180;
  const ux = Math.cos(r);
  const uy = Math.sin(r);
  const tx = bx + ux * l;
  const ty = by + uy * l;
  const mx = bx + ux * l * 0.5;
  const my = by + uy * l * 0.5;
  return {
    d: `M${bx} ${by} Q${mx - uy * w} ${my + ux * w} ${tx} ${ty} Q${mx + uy * w} ${my - ux * w} ${bx} ${by} Z`,
    rib: `M${bx + ux * 30} ${by + uy * 30} Q${mx - uy * 10} ${my + ux * 10} ${tx - ux * 20} ${ty - uy * 20}`,
  };
});
</script>

<template>
  <g>
    <defs>
      <linearGradient id="karaoke-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a0838" />
        <stop offset="55%" stop-color="#34125f" />
        <stop offset="100%" stop-color="#5a1b7e" />
      </linearGradient>
      <radialGradient id="karaoke-stage-glow" cx="50%" cy="60%" r="60%">
        <stop offset="0%" stop-color="#ff4fa8" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ff4fa8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="karaoke-panel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a1c78" />
        <stop offset="100%" stop-color="#2a0e4c" />
      </linearGradient>
      <linearGradient id="karaoke-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff7ad0" stop-opacity="0" />
        <stop offset="65%" stop-color="#ff9ae0" stop-opacity="0.26" />
        <stop offset="100%" stop-color="#ff9ae0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="karaoke-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3a1468" />
        <stop offset="100%" stop-color="#110428" />
      </linearGradient>
      <linearGradient id="karaoke-deck" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7a4ab8" />
        <stop offset="100%" stop-color="#3a1a66" />
      </linearGradient>
      <linearGradient id="karaoke-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff6d8" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff6d8" stop-opacity="0.06" />
      </linearGradient>
      <linearGradient id="karaoke-cone-pink" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff9ae0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ff9ae0" stop-opacity="0.05" />
      </linearGradient>
      <radialGradient id="karaoke-pool">
        <stop offset="0%" stop-color="#fff6d8" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#fff6d8" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="karaoke-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <radialGradient id="karaoke-ball" cx="36%" cy="32%" r="75%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="45%" stop-color="#d4c8f5" />
        <stop offset="100%" stop-color="#6a4f9e" />
      </radialGradient>
      <linearGradient id="karaoke-video" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2b1a6e" />
        <stop offset="55%" stop-color="#c03f9a" />
        <stop offset="100%" stop-color="#ff9a5a" />
      </linearGradient>
      <linearGradient id="karaoke-sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe86b" />
        <stop offset="100%" stop-color="#ff5a8a" />
      </linearGradient>
      <linearGradient id="karaoke-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a2f9e" />
        <stop offset="100%" stop-color="#1e0f4a" />
      </linearGradient>
      <linearGradient id="karaoke-cab" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5a4a8a" />
        <stop offset="100%" stop-color="#231840" />
      </linearGradient>
      <radialGradient id="karaoke-cone-w" cx="40%" cy="38%" r="70%">
        <stop offset="0%" stop-color="#8a7ab8" />
        <stop offset="60%" stop-color="#3a2d5e" />
        <stop offset="100%" stop-color="#1e1536" />
      </radialGradient>
      <linearGradient id="karaoke-sofa" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff7cc2" />
        <stop offset="100%" stop-color="#b81f6a" />
      </linearGradient>
      <linearGradient id="karaoke-sofa-seat" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ff8acb" />
        <stop offset="100%" stop-color="#c42a75" />
      </linearGradient>
      <linearGradient id="karaoke-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#9a5a36" />
        <stop offset="100%" stop-color="#5a2a1a" />
      </linearGradient>
      <linearGradient id="karaoke-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0.15" />
      </linearGradient>
      <clipPath id="karaoke-screen-clip"><rect x="1290" y="282" width="460" height="256" rx="6" /></clipPath>
      <clipPath id="karaoke-ball-clip"><circle :cx="BALL.x" :cy="BALL.y" :r="BALL.r" /></clipPath>
      <clipPath id="karaoke-lyric-clip">
        <rect v-for="(p, i) in LYRIC_1" :key="i" :x="p.x" y="470" :width="p.w" height="20" rx="10" />
      </clipPath>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#karaoke-wall)" />
    <path :d="WALL_DOTS" stroke="#6a2fa0" stroke-width="3" stroke-linecap="round" opacity="0.35" />
    <ellipse cx="360" cy="560" rx="620" ry="420" fill="url(#karaoke-stage-glow)" />

    <rect x="-60" y="-60" width="2040" height="96" fill="#12052a" />
    <path d="M-60 36 L1980 36" stroke="#1b1033" stroke-width="14" />
    <path d="M-60 36 L1980 36" stroke="#6a5a9a" stroke-width="6" />
    <path d="M-60 32 L1980 32" stroke="#b5a8e0" stroke-width="2" opacity="0.6" />

    <rect x="-60" y="300" width="830" height="460" fill="#2a0c40" />
    <g fill="none" stroke-width="8" stroke-linecap="round" opacity="0.92">
      <path v-for="(d, i) in TINSEL_PATHS" :key="`ts${i}`" :d="d" :stroke="TINSEL_COLORS[i]" />
    </g>
    <rect x="-60" y="300" width="830" height="460" fill="#1a0630" opacity="0.28" />
    <rect x="-60" y="300" width="830" height="40" fill="#1a0630" opacity="0.45" />
    <path v-for="(d, g) in TINSEL_SHINE" :key="`sh${g}`" :d="d" stroke="#fff" stroke-width="4" stroke-linecap="round" class="karaoke-shimmer" :style="{ animationDelay: `-${g * 0.9}s` }" />
    <rect x="-60" y="286" width="836" height="22" rx="10" fill="#d8a53e" :stroke="INK" stroke-width="5" />
    <path d="M-50 292 L760 292" stroke="#ffe7a0" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    <circle cx="776" cy="297" r="16" fill="#d8a53e" :stroke="INK" stroke-width="5" />
    <path d="M766 290 Q772 284 780 284" stroke="#ffe7a0" stroke-width="4" fill="none" stroke-linecap="round" />

    <rect x="770" y="580" width="1220" height="210" fill="url(#karaoke-panel)" />
    <path :d="TUFTS" stroke="#1d0838" stroke-width="4" opacity="0.5" />
    <g fill="#1d0838">
      <circle v-for="x in TUFT_X" :key="`tb${x}`" :cx="x + 90" cy="688" r="6" />
    </g>
    <path d="M770 600 L1980 600" stroke="#7a3fb0" stroke-width="3" opacity="0.5" />
    <rect x="770" y="566" width="1220" height="18" fill="#d8a53e" :stroke="INK" stroke-width="4" />
    <path d="M780 571 L1980 571" stroke="#ffe7a0" stroke-width="3" opacity="0.7" />

    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M800 540 Q830 516 860 540 T920 540 T980 540 T1040 540 T1100 540 T1160 540 T1220 540" stroke="#ff4fa8" stroke-width="20" opacity="0.16" />
      <path d="M800 540 Q830 516 860 540 T920 540 T980 540 T1040 540 T1100 540 T1160 540 T1220 540" stroke="#ff4fa8" stroke-width="7" />
      <path d="M800 540 Q830 516 860 540 T920 540 T980 540 T1040 540 T1100 540 T1160 540 T1220 540" stroke="#ffd0ec" stroke-width="2.5" />
      <g v-for="(n, i) in [{ w: 26, c: '#ffd23f', o: 0.18 }, { w: 9, c: '#ffd23f', o: 1 }, { w: 3, c: '#fff6c8', o: 1 }]" :key="`nn${i}`" :stroke="n.c" :stroke-width="n.w" :opacity="n.o">
        <ellipse cx="900" cy="470" rx="24" ry="17" transform="rotate(-20 900 470)" />
        <ellipse cx="990" cy="452" rx="24" ry="17" transform="rotate(-20 990 452)" />
        <path d="M922 462 L922 376 L1012 358 L1012 444 M922 396 L1012 378" />
      </g>
      <g class="karaoke-flicker">
        <g v-for="(n, i) in [{ w: 24, c: '#22d3ee', o: 0.18 }, { w: 8, c: '#22d3ee', o: 1 }, { w: 3, c: '#d8fbff', o: 1 }]" :key="`nm${i}`" :stroke="n.c" :stroke-width="n.w" :opacity="n.o">
          <circle cx="1084" cy="396" r="28" />
          <path d="M1066 380 L1102 412 M1066 412 L1102 380" />
          <path d="M1070 422 L1078 500 Q1084 508 1090 500 L1098 422" />
        </g>
      </g>
    </g>

    <g :stroke="INK" stroke-width="5" stroke-linejoin="round">
      <path d="M1440 262 L1440 236 M1600 262 L1600 236" stroke-width="6" />
      <rect x="1268" y="260" width="504" height="300" rx="18" fill="#2a1a48" filter="url(#cel)" />
    </g>
    <g clip-path="url(#karaoke-screen-clip)">
      <rect x="1290" y="282" width="460" height="256" fill="url(#karaoke-video)" />
      <circle cx="1520" cy="420" r="78" fill="url(#karaoke-sun)" />
      <path d="M1430 392 L1610 392 M1430 410 L1610 410 M1430 426 L1610 426" stroke="#c03f9a" stroke-width="6" />
      <rect x="1290" y="430" width="460" height="110" fill="url(#karaoke-sea)" />
      <path d="M1460 442 L1580 442 M1480 454 L1560 454 M1500 466 L1540 466" stroke="#ffb07a" stroke-width="4" stroke-linecap="round" opacity="0.7" />
      <g fill="#1e0f3e">
        <path d="M1330 440 Q1342 380 1324 320 L1332 318 Q1352 380 1340 440 Z" />
        <path d="M1328 322 Q1290 300 1270 330 Q1300 316 1328 326 Q1312 296 1340 290 Q1336 306 1332 322 Q1360 300 1386 314 Q1356 312 1334 326 Z" />
        <path d="M1716 440 Q1704 390 1722 340 L1730 342 Q1714 390 1726 440 Z" />
        <path d="M1726 344 Q1700 320 1676 336 Q1704 332 1724 348 Q1730 318 1756 310 Q1742 330 1730 346 Z" />
      </g>
      <rect x="1290" y="458" width="460" height="82" fill="#0c0420" opacity="0.5" />
      <g fill="#ffffff">
        <rect v-for="(p, i) in LYRIC_1" :key="`l1${i}`" :x="p.x" y="470" :width="p.w" height="20" rx="10" />
        <rect v-for="(p, i) in LYRIC_2" :key="`l2${i}`" :x="p.x" y="504" :width="p.w" height="18" rx="9" opacity="0.55" />
      </g>
      <g clip-path="url(#karaoke-lyric-clip)">
        <rect x="1320" y="466" width="420" height="28" fill="#ff4fa8" class="karaoke-sweep" />
      </g>
      <g class="karaoke-ball-x">
        <circle cx="1336" cy="452" r="9" fill="#ffd23f" :stroke="INK" stroke-width="3" class="karaoke-ball-y" />
      </g>
      <path d="M1300 300 L1420 300 L1330 520 L1290 520 Z" fill="#fff" opacity="0.08" />
    </g>
    <rect x="1290" y="282" width="460" height="256" rx="6" fill="none" :stroke="INK" stroke-width="4" />
    <path d="M1286 290 Q1288 274 1304 272" stroke="#7a68b0" stroke-width="5" fill="none" stroke-linecap="round" />
    <circle cx="1520" cy="550" r="4" fill="#2ee6c8" />

    <g v-for="s in SPEAKERS" :key="`sp${s.s}`">
      <path :d="`M${s.x} 270 L${s.x} 252`" :stroke="INK" stroke-width="8" />
      <rect :x="s.x - 46" y="276" width="92" height="150" rx="12" fill="url(#karaoke-cab)" :stroke="INK" stroke-width="5" filter="url(#cel-s)" />
      <circle :cx="s.x" cy="310" r="14" fill="#2a1f48" :stroke="INK" stroke-width="4" />
      <circle :cx="s.x - 4" cy="306" r="4" fill="#b5a8e0" />
      <circle :cx="s.x" cy="378" r="38" fill="#120a24" />
      <g class="karaoke-pulse" :style="{ transformOrigin: `${s.x}px 378px`, animationDelay: `-${s.s * 0.14}s` }">
        <circle :cx="s.x" cy="378" r="32" fill="url(#karaoke-cone-w)" :stroke="INK" stroke-width="3" />
        <circle :cx="s.x" cy="378" r="11" fill="#2a1f48" :stroke="INK" stroke-width="3" />
        <path :d="`M${s.x - 20} 366 Q${s.x - 14} 352 ${s.x - 2} 349`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.5" />
      </g>
    </g>

    <rect x="-60" y="640" width="2040" height="190" fill="url(#karaoke-haze)" />

    <path d="M-60 784 L1980 784 L1980 1200 L-60 1200 Z" fill="url(#karaoke-floor)" />
    <path v-for="(d, i) in CARPET_PATHS" :key="`cp${i}`" :d="d" :stroke="CARPET_COLORS[i]" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.28" />
    <path d="M-60 786 L1980 786" stroke="#1b1033" stroke-width="6" />

    <ellipse cx="350" cy="866" rx="440" ry="22" fill="#08021a" opacity="0.45" />
    <path d="M-60 744 L690 744 Q756 744 762 790 L-60 790 Z" fill="url(#karaoke-deck)" :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M40 756 L560 756 M-20 774 L640 774" stroke="#2a1050" stroke-width="3" opacity="0.5" />
    <path d="M-60 790 L762 790 L762 846 Q762 858 750 858 L-60 858 Z" fill="#23103f" :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <g>
      <circle v-for="(l, i) in STAGE_LEDS" :key="`ld${i}`" :cx="l.x" cy="824" r="6" :fill="l.c" opacity="0.3" />
    </g>
    <g class="karaoke-chase">
      <g v-for="(l, i) in LED_LIT" :key="`ll${i}`">
        <circle :cx="l.x" cy="824" r="14" :fill="l.c" opacity="0.3" />
        <circle :cx="l.x" cy="824" r="6" :fill="l.c" />
      </g>
    </g>
    <path d="M-50 796 L752 796" stroke="#5a3a90" stroke-width="3" opacity="0.7" />

    <ellipse cx="404" cy="768" rx="190" ry="22" fill="url(#karaoke-pool)" />
    <g :stroke="INK" stroke-width="5" stroke-linejoin="round" filter="url(#cel-s)">
      <path d="M130 788 L144 712 Q148 700 160 704 L300 748 L304 788 Z" fill="url(#karaoke-cab)" />
    </g>
    <path d="M160 722 L286 760 M156 740 L288 776" stroke="#120a24" stroke-width="5" stroke-linecap="round" />
    <path d="M152 714 L160 708" stroke="#b5a8e0" stroke-width="4" stroke-linecap="round" />

    <g stroke-linecap="round" fill="none">
      <path d="M404 768 L360 790 M404 768 L452 790 M404 768 L404 792" :stroke="INK" stroke-width="9" />
      <path d="M404 768 L360 790 M404 768 L452 790" stroke="#9a94c8" stroke-width="4" />
      <path d="M404 770 L404 590" :stroke="INK" stroke-width="13" />
      <path d="M404 770 L404 590" stroke="#b8b4dc" stroke-width="6" />
      <path d="M401 760 L401 600" stroke="#fff" stroke-width="2" opacity="0.6" />
      <path d="M418 584 Q440 650 412 700 Q392 740 440 772 Q520 800 560 790" stroke="#120a24" stroke-width="5" />
    </g>
    <g transform="rotate(24 404 584)" :stroke="INK" stroke-width="5" stroke-linejoin="round">
      <rect x="394" y="540" width="20" height="54" rx="8" fill="#2a2244" />
      <circle cx="404" cy="530" r="20" fill="#c4c0e0" />
      <path d="M390 522 L418 522 M388 534 L420 534 M396 512 L396 548 M410 512 L410 548" stroke="#6a6494" stroke-width="2.5" fill="none" />
      <path d="M392 520 Q396 512 404 510" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      <rect x="392" y="552" width="24" height="6" fill="#ff4fa8" stroke-width="2" />
    </g>

    <g class="karaoke-cones">
      <path d="M168 84 L262 772 L540 772 L204 84 Z" fill="url(#karaoke-cone)" />
      <path d="M618 84 L300 772 L520 772 L660 84 Z" fill="url(#karaoke-cone-pink)" />
    </g>
    <g v-for="(f, i) in [{ x: 178, r: 14, c: '#fff6d8' }, { x: 640, r: -22, c: '#ffc0e4' }]" :key="`fx${i}`">
      <path :d="`M${f.x} 36 L${f.x} 52`" :stroke="INK" stroke-width="6" />
      <g :transform="`rotate(${f.r} ${f.x} 56)`" :stroke="INK" stroke-width="5">
        <path :d="`M${f.x - 26} 44 L${f.x + 26} 44 L${f.x + 22} 80 L${f.x - 22} 80 Z`" fill="#4a4270" stroke-linejoin="round" />
        <path :d="`M${f.x - 16} 52 L${f.x + 10} 52`" stroke="#8a84b8" stroke-width="4" stroke-linecap="round" />
        <ellipse :cx="f.x" cy="82" rx="24" ry="7" :fill="f.c" />
      </g>
    </g>

    <g v-for="b in BEAMS" :key="`bm${b.x}`">
      <g :class="b.cls" :style="{ transformOrigin: `${b.x}px 60px` }" opacity="0.08">
        <path v-for="r in b.rot" :key="r" :d="`M${b.x - 6} 60 L${b.x - 46} 960 L${b.x + 46} 960 L${b.x + 6} 60 Z`" :fill="b.c" :transform="`rotate(${r} ${b.x} 60)`" />
      </g>
      <path :d="`M${b.x} 36 L${b.x} 46`" :stroke="INK" stroke-width="6" />
      <rect :x="b.x - 22" y="42" width="44" height="18" rx="5" fill="#3f3466" :stroke="INK" stroke-width="4" />
      <circle :cx="b.x" cy="66" r="14" fill="#4a4270" :stroke="INK" stroke-width="4" />
      <circle :cx="b.x" cy="68" r="7" :fill="b.c" />
    </g>

    <path :d="`M${BALL.x} 36 L${BALL.x} ${BALL.y - BALL.r}`" :stroke="INK" stroke-width="4" />
    <rect :x="BALL.x - 11" :y="BALL.y - BALL.r - 12" width="22" height="14" rx="3" fill="#3f3466" :stroke="INK" stroke-width="4" />
    <circle :cx="BALL.x" :cy="BALL.y" :r="BALL.r" fill="url(#karaoke-ball)" />
    <g clip-path="url(#karaoke-ball-clip)">
      <rect :x="BALL.x - 40" :y="BALL.y - 30" width="14" height="12" fill="#ff9ae0" opacity="0.7" />
      <rect :x="BALL.x + 18" :y="BALL.y - 2" width="14" height="12" fill="#9ff3ff" opacity="0.7" />
      <rect :x="BALL.x - 10" :y="BALL.y + 24" width="14" height="12" fill="#ffe58a" opacity="0.6" />
      <path
        :d="`M${BALL.x - 60} ${BALL.y - 36} Q${BALL.x} ${BALL.y - 28} ${BALL.x + 60} ${BALL.y - 36} M${BALL.x - 60} ${BALL.y - 14} Q${BALL.x} ${BALL.y - 6} ${BALL.x + 60} ${BALL.y - 14} M${BALL.x - 60} ${BALL.y + 8} L${BALL.x + 60} ${BALL.y + 8} M${BALL.x - 60} ${BALL.y + 30} Q${BALL.x} ${BALL.y + 22} ${BALL.x + 60} ${BALL.y + 30}`"
        stroke="#6a4f9e"
        stroke-width="2.5"
        fill="none"
      />
      <path
        :d="`M${BALL.x} ${BALL.y - 60} L${BALL.x} ${BALL.y + 60} M${BALL.x - 24} ${BALL.y - 60} Q${BALL.x - 40} ${BALL.y} ${BALL.x - 24} ${BALL.y + 60} M${BALL.x + 24} ${BALL.y - 60} Q${BALL.x + 40} ${BALL.y} ${BALL.x + 24} ${BALL.y + 60}`"
        stroke="#6a4f9e"
        stroke-width="2.5"
        fill="none"
      />
      <path :d="`M${BALL.x + 52} ${BALL.y - 20} Q${BALL.x + 50} ${BALL.y + 40} ${BALL.x - 20} ${BALL.y + 54} L${BALL.x + 60} ${BALL.y + 60} Z`" fill="#1b1033" opacity="0.28" />
    </g>
    <circle :cx="BALL.x" :cy="BALL.y" :r="BALL.r" fill="none" :stroke="INK" stroke-width="5" />
    <path :d="`M${BALL.x - 34} ${BALL.y - 20} Q${BALL.x - 26} ${BALL.y - 40} ${BALL.x - 6} ${BALL.y - 46}`" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" />
    <g class="karaoke-reflect" :style="{ transformOrigin: `${BALL.x}px ${BALL.y}px` }">
      <ellipse v-for="(r, i) in REFLECTIONS" :key="`rf${i}`" :cx="r.x" :cy="r.y" :rx="r.rx" :ry="r.rx * 0.6" :fill="r.c" opacity="0.4" />
    </g>
    <path v-for="(d, g) in SPARKLES" :key="`sk${g}`" :d="d" fill="#fff" class="karaoke-twinkle" :style="{ animationDelay: `-${g * 1.2}s` }" />

    <ellipse cx="1560" cy="912" rx="440" ry="24" fill="#08021a" opacity="0.45" />
    <g :stroke="INK" stroke-width="6" stroke-linejoin="round">
      <path d="M1170 820 L1170 720 Q1170 676 1216 676 L1990 676 L1990 820 Z" fill="url(#karaoke-sofa)" filter="url(#cel)" />
      <path d="M1150 900 L1150 820 Q1150 796 1176 796 L1990 796 L1990 900 Z" fill="url(#karaoke-sofa-seat)" filter="url(#cel)" />
      <path d="M1112 906 L1112 760 Q1112 724 1150 724 Q1196 724 1196 760 L1196 906 Z" fill="url(#karaoke-sofa)" filter="url(#cel-s)" />
    </g>
    <path d="M1300 690 L1300 790 M1440 690 L1440 790 M1580 690 L1580 790 M1720 690 L1720 790 M1860 690 L1860 790" stroke="#a01858" stroke-width="5" stroke-linecap="round" opacity="0.6" />
    <g fill="#8a1048">
      <circle v-for="x in [1370, 1510, 1650, 1790, 1930]" :key="`sb${x}`" :cx="x" cy="730" r="6" />
    </g>
    <path d="M1190 692 Q1220 684 1260 684 M1126 740 Q1136 730 1150 730" stroke="#ffc0e0" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8" />
    <path d="M1180 812 L1960 812" stroke="#ffc0e0" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    <path d="M1590 800 L1590 896" stroke="#a01858" stroke-width="4" opacity="0.6" />
    <g :stroke="INK" stroke-width="5" stroke-linejoin="round">
      <path d="M1250 800 Q1236 740 1262 716 Q1320 704 1372 720 Q1388 760 1376 800 Q1310 812 1250 800 Z" fill="#22c8d8" filter="url(#cel-s)" />
      <path d="M1730 800 Q1720 748 1744 726 Q1800 716 1846 732 Q1858 770 1850 800 Q1790 810 1730 800 Z" fill="#ffc94a" filter="url(#cel-s)" />
    </g>
    <path d="M1272 730 Q1290 722 1314 724 M1752 740 Q1770 732 1792 734" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path d="M1312 734 L1312 790 M1788 742 L1788 792" stroke="#1b1033" stroke-width="3" opacity="0.3" />
    <rect v-for="x in [1166, 1960]" :key="`sl${x}`" :x="x" y="900" width="14" height="18" rx="3" fill="#3a1a1a" :stroke="INK" stroke-width="3" />

    <ellipse cx="1420" cy="1018" rx="300" ry="20" fill="#08021a" opacity="0.5" />
    <g :stroke="INK" stroke-width="5" stroke-linejoin="round">
      <path d="M1180 950 L1180 1012 L1200 1012 L1200 950 Z M1640 950 L1640 1012 L1660 1012 L1660 950 Z" fill="#4a2018" />
      <path d="M1166 920 L1676 920 L1700 948 L1142 948 Z" fill="url(#karaoke-wood)" filter="url(#cel-s)" />
      <path d="M1142 948 L1700 948 L1700 966 L1142 966 Z" fill="#4a2018" />
    </g>
    <path d="M1200 930 L1380 930 M1460 938 L1640 938" stroke="#c48a52" stroke-width="3" stroke-linecap="round" opacity="0.6" />

    <g :stroke="INK" stroke-width="4" stroke-linejoin="round">
      <path v-for="(c, i) in CHIPS" :key="`ch${i}`" :d="`M${c.x - 10} ${c.y + 6} L${c.x} ${c.y - 12} L${c.x + 10} ${c.y + 6} Z`" fill="#ffc94a" :transform="`rotate(${c.a} ${c.x} ${c.y})`" />
      <path d="M1208 884 Q1212 924 1268 926 Q1324 924 1328 884 Z" fill="#ff5fb0" />
    </g>
    <path d="M1222 896 Q1236 914 1260 916" stroke="#ffc0e0" stroke-width="4" fill="none" stroke-linecap="round" />

    <g :stroke="INK" stroke-width="4" stroke-linejoin="round">
      <path d="M1376 856 L1384 924 L1416 924 L1424 856 Z" fill="url(#karaoke-glass)" />
      <path d="M1380 878 L1385 922 L1415 922 L1420 878 Z" fill="#22d3ee" opacity="0.85" stroke="none" />
      <path d="M1406 860 L1426 812" stroke="#ff4fa8" stroke-width="5" stroke-linecap="round" />
      <path d="M1418 830 Q1440 806 1466 822 Z" fill="#ffd23f" />
      <path d="M1442 872 L1448 924 L1474 924 L1480 872 Z" fill="url(#karaoke-glass)" />
      <path d="M1445 888 L1449 922 L1473 922 L1477 888 Z" fill="#ff7ac0" opacity="0.85" stroke="none" />
      <path d="M1468 876 L1476 838" stroke="#2ee6c8" stroke-width="5" stroke-linecap="round" />
      <circle cx="1460" cy="882" r="7" fill="#ff3a5a" />
    </g>
    <path d="M1384 866 L1390 912 M1449 880 L1452 914" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" />

    <g :stroke="INK" stroke-width="5" stroke-linejoin="round">
      <path d="M1508 902 L1622 892 L1630 920 L1512 930 Z" fill="#7a3fe0" filter="url(#cel-s)" />
      <path d="M1508 902 L1622 892 L1622 880 L1510 888 Z" fill="#fff6e0" />
      <path d="M1510 888 L1622 880 L1618 870 L1506 878 Z" fill="#9a5ff0" />
    </g>
    <path d="M1520 884 L1610 877 M1520 896 L1610 889" stroke="#c8b8a0" stroke-width="2" />
    <rect x="1588" y="862" width="10" height="16" fill="#ffd23f" :stroke="INK" stroke-width="3" />
    <rect x="1602" y="860" width="10" height="16" fill="#2ee6c8" :stroke="INK" stroke-width="3" />

    <g :stroke="INK" stroke-linecap="round">
      <path d="M1250 940 L1316 932" stroke-width="12" />
      <path d="M1250 940 L1316 932" stroke="#3f3466" stroke-width="6" />
    </g>
    <circle cx="1240" cy="941" r="14" fill="#c4c0e0" :stroke="INK" stroke-width="4" />

    <g transform="translate(-700 10)">
      <ellipse cx="1760" cy="1050" rx="90" ry="14" fill="#08021a" opacity="0.45" />
      <g transform="rotate(-18 1760 990)">
        <ellipse cx="1760" cy="990" rx="62" ry="58" fill="#d8a53e" :stroke="INK" stroke-width="5" />
        <ellipse cx="1760" cy="990" rx="46" ry="42" fill="#fff0d0" :stroke="INK" stroke-width="4" />
        <path d="M1730 970 Q1740 956 1756 954" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
        <g v-for="a in JINGLES" :key="`jg${a}`" :transform="`rotate(${a} 1760 990)`">
          <ellipse cx="1760" cy="934" rx="10" ry="6" fill="#e0e0f0" :stroke="INK" stroke-width="3" />
        </g>
      </g>
      <g :stroke="INK" stroke-width="5" stroke-linejoin="round">
        <path d="M1580 1040 L1650 1004" stroke-width="12" stroke-linecap="round" />
        <path d="M1580 1040 L1650 1004" stroke="#c48a52" stroke-width="5" stroke-linecap="round" />
        <ellipse cx="1668" cy="994" rx="30" ry="24" fill="#ff5a3a" transform="rotate(-26 1668 994)" />
        <path d="M1600 1060 L1676 1050" stroke-width="12" stroke-linecap="round" />
        <path d="M1600 1060 L1676 1050" stroke="#c48a52" stroke-width="5" stroke-linecap="round" />
        <ellipse cx="1694" cy="1046" rx="30" ry="24" fill="#2ed47a" transform="rotate(-8 1694 1046)" />
      </g>
      <path d="M1654 984 Q1664 974 1678 976 M1680 1034 Q1692 1028 1706 1032" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M1650 1000 L1690 990 M1676 1048 L1712 1046" stroke="#1b1033" stroke-width="3" opacity="0.4" stroke-dasharray="4 8" />
    </g>

    <g v-for="(grp, gi) in NOTES" :key="`nt${gi}`" class="karaoke-notes" :style="{ animationDelay: `-${gi * 2.4}s` }">
      <g v-for="(n, i) in grp" :key="i" :stroke="INK" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path :d="noteFlag(n.x, n.y)" fill="none" stroke-width="9" />
        <path :d="noteFlag(n.x, n.y)" fill="none" :stroke="n.c" stroke-width="3" />
        <path :d="noteHead(n.x, n.y)" :fill="n.c" />
      </g>
    </g>

    <g fill="#0c0420" stroke="#05010f" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 L-60 850 Q-60 830 -40 830 L130 830 Q150 830 150 850 L150 1140 Z" />
      <path d="M150 1070 Q230 1020 310 1070 Q370 1110 310 1140 L150 1140 Z" />
      <path v-for="(l, i) in LEAVES" :key="`lf${i}`" :d="l.d" />
      <path d="M1760 1140 L1790 1040 L1990 1040 L1990 1140 Z" />
    </g>
    <circle cx="44" cy="1010" r="70" fill="#08021a" stroke="#ff4fa8" stroke-width="3" opacity="0.8" />
    <circle cx="44" cy="1010" r="26" fill="none" stroke="#ff4fa8" stroke-width="2" opacity="0.5" />
    <circle cx="44" cy="890" r="22" fill="#08021a" stroke="#ff4fa8" stroke-width="3" opacity="0.8" />
    <path d="M-50 842 L130 842 Q140 842 140 852 L140 1000" stroke="#ff4fa8" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
    <path v-for="(l, i) in LEAVES" :key="`lr${i}`" :d="l.rib" stroke="#22d3ee" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.45" />
    <path d="M160 1120 Q200 1060 260 1080 Q320 1100 290 1050 Q260 1000 330 1000 Q420 1010 470 900 Q500 860 560 858" stroke="#05010f" stroke-width="10" fill="none" stroke-linecap="round" />
  </g>
</template>

<style scoped>
.karaoke-shimmer {
  animation: karaoke-blink 1.8s steps(2) infinite;
}

.karaoke-chase {
  animation: karaoke-blink 0.9s steps(2) infinite;
}

.karaoke-flicker {
  animation: karaoke-flicker 5s steps(1) infinite;
}

.karaoke-cones {
  animation: karaoke-glow 2.6s ease-in-out infinite alternate;
}

.karaoke-pulse {
  animation: karaoke-pulse 0.5s ease-out infinite;
}

.karaoke-sweep {
  transform-origin: 1320px 0;
  animation: karaoke-sweep 4.8s linear infinite;
}

.karaoke-ball-x {
  animation: karaoke-ball-x 4.8s linear infinite;
}

.karaoke-ball-y {
  animation: karaoke-ball-y 0.3s ease-out infinite alternate;
}

.karaoke-beam-a {
  animation: karaoke-sweep-beam 7s ease-in-out infinite;
}

.karaoke-beam-b {
  animation: karaoke-sweep-beam 8.5s ease-in-out infinite reverse;
}

.karaoke-reflect {
  animation: karaoke-spin 50s linear infinite;
}

.karaoke-twinkle {
  animation: karaoke-twinkle 2.4s ease-in-out infinite;
}

.karaoke-notes {
  animation: karaoke-rise 4.8s ease-out infinite;
}

@keyframes karaoke-blink {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 0.15;
  }
}

@keyframes karaoke-flicker {
  0%,
  62%,
  66%,
  100% {
    opacity: 1;
  }
  60%,
  64% {
    opacity: 0.35;
  }
}

@keyframes karaoke-glow {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

@keyframes karaoke-pulse {
  from {
    scale: 1.08;
  }
  to {
    scale: 1;
  }
}

@keyframes karaoke-sweep {
  from {
    scale: 0 1;
  }
  to {
    scale: 1 1;
  }
}

@keyframes karaoke-ball-x {
  from {
    translate: 0 0;
  }
  to {
    translate: 390px 0;
  }
}

@keyframes karaoke-ball-y {
  from {
    translate: 0 0;
  }
  to {
    translate: 0 -22px;
  }
}

@keyframes karaoke-sweep-beam {
  0%,
  100% {
    rotate: -12deg;
  }
  50% {
    rotate: 12deg;
  }
}

@keyframes karaoke-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes karaoke-twinkle {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 1;
  }
}

@keyframes karaoke-rise {
  0% {
    translate: 0 40px;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 0.8;
  }
  100% {
    translate: 0 -200px;
    opacity: 0;
  }
}
</style>
