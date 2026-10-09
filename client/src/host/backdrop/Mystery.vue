<script setup lang="ts">
import { seeded, tufts, twinkleGroups } from './kit';

const rnd = seeded(4711);
const f1 = (n: number) => n.toFixed(1);
const circ = (x: number, y: number, r: number) => `M${f1(x - r)} ${f1(y)} a${f1(r)} ${f1(r)} 0 1 0 ${f1(r * 2)} 0 a${f1(r)} ${f1(r)} 0 1 0 ${f1(-r * 2)} 0 Z`;

// four merged paths blink out of phase instead of one animated node per star
const STAR_PATHS = twinkleGroups(Array.from({ length: 72 }, () => ({ x: rnd() * 1920, y: rnd() * 540, r: 0.9 + rnd() * 2 }))).map((g) =>
  g.map((s) => circ(s.x, s.y, s.r)).join(' '),
);
const CLOUDS = [
  { y: 280, k: 0.9, d: 18, s: 80 },
  { y: 150, k: 0.65, d: 52, s: 105 },
];
const BATS = [
  { x: 0, y: 0, k: 1 },
  { x: 80, y: -46, k: 0.75 },
  { x: 150, y: 20, k: 0.85 },
];
const FAR_TREES = [70, 140, 520, 600, 760, 1780, 1860].map((x) => ({ x, y: 690 + Math.round(rnd() * 20), k: 0.8 + rnd() * 0.5 }));

const pane = (x: number, y: number, h: number, hw = 16) => `M${x - hw} ${y + h} V${y + hw} Q${x} ${y - hw * 0.5} ${x + hw} ${y + hw} V${y + h} Z`;
type Win = [number, number, number];
const GLOW_A: Win[] = [
  [1110, 600, 60],
  [1190, 600, 60],
  [1110, 700, 60],
  [1400, 530, 56],
];
const GLOW_B: Win[] = [
  [1285, 520, 64],
  [1285, 640, 64],
  [1515, 640, 64],
  [1620, 600, 64],
];
const DARK: Win[] = [
  [1190, 700, 60],
  [1515, 520, 64],
  [1620, 710, 56],
];
const ALL_WINDOWS = [...GLOW_A, ...GLOW_B, ...DARK];
const panes = (list: Win[]) => list.map(([x, y, h]) => pane(x, y, h)).join(' ');
const MULLIONS = ALL_WINDOWS.map(([x, y, h]) => `M${x} ${y + 4} V${y + h} M${x - 16} ${y + h * 0.55} H${x + 16}`).join(' ');
const SILLS = ALL_WINDOWS.map(([x, y, h]) => `M${x - 22} ${y + h + 4} H${x + 22}`).join(' ');
const SHUTTERS = [GLOW_A[0]!, GLOW_A[1]!, GLOW_B[0]!, DARK[1]!].map(([x, y, h]) => `M${x - 30} ${y + 8} h10 v${h - 8} h-10 Z M${x + 20} ${y + 8} h10 v${h - 8} h-10 Z`).join(' ');
const GHOST_PANE = pane(1620, 432, 90, 26);

// a hand-drawn bare tree: each limb is stroked twice, ink first and bark on top
const LIMBS: [string, number][] = [
  ['M0 0 C-20 -120 30 -200 0 -300 C-20 -380 12 -440 50 -500', 70],
  ['M44 -490 C100 -540 160 -540 220 -600 C250 -630 280 -630 310 -664', 40],
  ['M44 -480 C10 -560 -40 -580 -90 -650 C-110 -680 -140 -690 -172 -724', 36],
  ['M10 -320 C80 -350 140 -330 200 -370 C230 -390 250 -420 280 -432', 32],
  ['M0 -240 C-60 -270 -120 -250 -180 -290 C-200 -305 -215 -330 -242 -336', 30],
  ['M0 0 C-30 20 -60 15 -95 32 M10 0 C40 20 75 15 115 32', 32],
  ['M220 -600 C230 -640 260 -660 270 -692 M-90 -650 C-80 -690 -60 -700 -50 -732 M200 -370 C220 -360 250 -352 272 -330 M-180 -290 C-190 -320 -176 -342 -182 -372', 14],
];
const TREES = [
  { x: 250, y: 950, k: 1 },
  { x: 1840, y: 930, k: 0.62 },
];

function fenceRow(x0: number, x1: number): { bars: string; rails: string; tips: string; curls: string } {
  let bars = '';
  let tips = '';
  let curls = '';
  for (let x = x0; x <= x1; x += 44) {
    bars += `M${x} 1014 V896 `;
    tips += `M${x - 8} 898 L${x} 872 L${x + 8} 898 Z `;
    if (x + 44 <= x1) curls += `${circ(x + 22, 922, 7)} `;
  }
  return { bars, tips, curls, rails: `M${x0 - 20} 908 H${x1 + 20} M${x0 - 20} 990 H${x1 + 20}` };
}
const FENCE = [fenceRow(-40, 990), fenceRow(1290, 1960)];

// gate leaves swung open toward the viewer: hinge edge upright, the far edge drops with perspective
function leaf(hinge: number, far: number): { frame: string; bars: string; tips: string } {
  const at = (t: number) => ({ x: hinge + (far - hinge) * t, top: 846 + 20 * t, bottom: 1006 + 30 * t });
  let bars = '';
  let tips = '';
  for (const t of [0.25, 0.5, 0.75]) {
    const p = at(t);
    bars += `M${f1(p.x)} ${f1(p.top)} V${f1(p.bottom)} `;
    tips += `M${f1(p.x - 6)} ${f1(p.top + 2)} L${f1(p.x)} ${f1(p.top - 18)} L${f1(p.x + 6)} ${f1(p.top + 2)} Z `;
  }
  const mid = at(1);
  return {
    frame: `M${hinge} 846 L${far} ${mid.top} L${far} ${mid.bottom} L${hinge} 1006 Z M${hinge} 930 L${far} ${f1(930 + 25)}`,
    bars,
    tips,
  };
}
const LEAVES = [leaf(1052, 980), leaf(1228, 1300)];
const PILLARS = [1030, 1250];

// a trail of paw prints from the gate to the door: whoever left them is sitting on the fence
const PAWS = (
  [
    [1392, 826, 0.55],
    [1364, 846, 0.6],
    [1318, 866, 0.68],
    [1276, 884, 0.75],
    [1222, 906, 0.82],
    [1186, 930, 0.9],
    [1146, 960, 0.98],
    [1136, 996, 1.06],
    [1104, 1032, 1.14],
    [1098, 1074, 1.22],
  ] as const
)
  .map(([x, y, k]) => [circ(x, y, 5 * k), circ(x - 5 * k, y - 7 * k, 2.2 * k), circ(x, y - 9.5 * k, 2.2 * k), circ(x + 5 * k, y - 7 * k, 2.2 * k)].join(' '))
  .join(' ');

const FLY_GROUPS = [0, 1, 2].map(() => {
  const pts = Array.from({ length: 6 }, () => ({ x: 60 + rnd() * 1800, y: 780 + rnd() * 260 }));
  return {
    halo: pts.map((p) => circ(p.x, p.y, 14)).join(' '),
    core: pts.map((p) => circ(p.x, p.y, 4.5)).join(' '),
  };
});
</script>

<template>
  <g>
    <defs>
      <radialGradient id="mystery-moon" cx="38%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#fffbe6" />
        <stop offset="100%" stop-color="#efd690" />
      </radialGradient>
      <linearGradient id="mystery-stone" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#8b7ac6" />
        <stop offset="100%" stop-color="#4a3a80" />
      </linearGradient>
      <linearGradient id="mystery-roof" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#5568b0" />
        <stop offset="100%" stop-color="#232a5e" />
      </linearGradient>
      <linearGradient id="mystery-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4a428a" />
        <stop offset="60%" stop-color="#2c275e" />
      </linearGradient>
      <linearGradient id="mystery-mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b6a4f0" stop-opacity="0" />
        <stop offset="60%" stop-color="#b6a4f0" stop-opacity="0.32" />
        <stop offset="100%" stop-color="#b6a4f0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="mystery-hill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4f5294" />
        <stop offset="60%" stop-color="#2b2a5c" />
      </linearGradient>
      <linearGradient id="mystery-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3f5490" />
        <stop offset="70%" stop-color="#1e2350" />
      </linearGradient>
      <linearGradient id="mystery-path" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c4b6ee" />
        <stop offset="100%" stop-color="#7563b0" />
      </linearGradient>
      <linearGradient id="mystery-pillar" x1="0" y1="0" x2="1" y2="0.2">
        <stop offset="0%" stop-color="#a497d2" />
        <stop offset="100%" stop-color="#5a4e8c" />
      </linearGradient>
      <radialGradient id="mystery-ghost" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#d6ccff" />
      </radialGradient>
      <radialGradient id="mystery-halo">
        <stop offset="0%" stop-color="#ffd96b" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffd96b" stop-opacity="0" />
      </radialGradient>
      <clipPath id="mystery-pane-clip">
        <path :d="GHOST_PANE" />
      </clipPath>
    </defs>

    <path v-for="(d, gi) in STAR_PATHS" :key="`st${gi}`" :d="d" fill="#fff6dc" class="twinkle" :style="{ animationDelay: `-${gi * 0.75}s` }" />

    <circle cx="420" cy="250" r="290" fill="#fff4c2" opacity="0.07" />
    <circle cx="420" cy="250" r="200" fill="#fff4c2" opacity="0.12" />
    <circle cx="420" cy="250" r="140" fill="url(#mystery-moon)" stroke="#1b1033" stroke-width="5" />
    <circle cx="380" cy="214" r="26" fill="#e6c877" opacity="0.65" />
    <circle cx="470" cy="290" r="18" fill="#e6c877" opacity="0.65" />
    <circle cx="452" cy="190" r="11" fill="#e6c877" opacity="0.65" />
    <circle cx="370" cy="306" r="13" fill="#e6c877" opacity="0.55" />
    <path d="M326 186 Q346 144 392 128" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.85" />

    <g v-for="(c, i) in CLOUDS" :key="`cl${i}`" class="cloud" :style="{ animationDelay: `-${c.d}s`, animationDuration: `${c.s}s` }">
      <g :transform="`translate(0 ${c.y}) scale(${c.k})`">
        <path d="M-150 20 Q-170 -10 -120 -20 Q-110 -60 -50 -50 Q-20 -90 40 -66 Q90 -80 110 -36 Q170 -36 160 20 Z" fill="#4a3c86" stroke="#2a2158" stroke-width="4" stroke-linejoin="round" opacity="0.88" />
        <path d="M-110 -24 Q-100 -52 -54 -44 M-16 -60 Q30 -82 78 -60" stroke="#8a78c8" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
    </g>

    <g class="mystery-bats">
      <g v-for="(b, i) in BATS" :key="`bt${i}`" :transform="`translate(${b.x} ${230 + b.y}) scale(${b.k})`" stroke="#1b1033" stroke-width="3" stroke-linejoin="round">
        <g class="mystery-wing">
          <path d="M-8 0 Q-28 -32 -60 -28 Q-50 -18 -52 -8 Q-40 -14 -34 -4 Q-24 -10 -8 4 Z M8 0 Q28 -32 60 -28 Q50 -18 52 -8 Q40 -14 34 -4 Q24 -10 8 4 Z" fill="#4a3080" />
        </g>
        <g class="mystery-wing late">
          <path d="M-8 0 Q-30 10 -58 24 Q-46 22 -42 14 Q-36 20 -28 12 Q-20 16 -8 6 Z M8 0 Q30 10 58 24 Q46 22 42 14 Q36 20 28 12 Q20 16 8 6 Z" fill="#4a3080" />
        </g>
        <path d="M-10 -8 L-12 -22 L-3 -12 Z M10 -8 L12 -22 L3 -12 Z" fill="#2e1d52" />
        <circle r="12" fill="#2e1d52" />
        <path d="M-6.6 -2 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z M1.4 -2 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 Z" fill="#fff" stroke="none" />
      </g>
    </g>

    <path d="M-60 700 Q200 640 420 670 Q700 704 900 652 Q1150 600 1400 640 Q1700 690 1980 640 L1980 1140 L-60 1140 Z" fill="url(#mystery-far)" stroke="#6658a8" stroke-width="3" stroke-linejoin="round" />
    <g v-for="(t, i) in FAR_TREES" :key="`ft${i}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`" stroke="#2a2458" stroke-width="7" fill="none" stroke-linecap="round">
      <path d="M0 10 Q4 -40 -6 -80 M-2 -50 Q-30 -60 -34 -84 q-2 -16 12 -14 M2 -66 Q26 -76 30 -100 q2 -14 -12 -10" />
    </g>
    <rect x="-60" y="600" width="2040" height="240" fill="url(#mystery-mist)" />

    <g filter="url(#cel)">
      <g stroke="#1b1033" stroke-width="5" stroke-linejoin="round">
        <rect x="1090" y="430" width="34" height="100" fill="#7a4a72" />
        <rect x="1476" y="336" width="32" height="100" fill="#7a4a72" />
        <rect x="1060" y="560" width="184" height="252" fill="url(#mystery-stone)" />
        <rect x="1240" y="472" width="324" height="340" fill="url(#mystery-stone)" />
        <rect x="1560" y="384" width="120" height="428" fill="url(#mystery-stone)" />
        <path d="M1040 566 L1072 470 L1228 470 L1250 566 Z" fill="url(#mystery-roof)" />
        <path d="M1220 478 L1400 318 L1580 478 Z" fill="url(#mystery-roof)" />
        <path d="M1542 390 Q1596 340 1620 198 Q1644 340 1698 390 Z" fill="url(#mystery-roof)" />
        <path d="M1328 700 L1400 646 L1472 700 Z" fill="url(#mystery-roof)" />
      </g>
      <g stroke="#1b1033" stroke-width="4" stroke-linejoin="round">
        <rect x="1084" y="422" width="46" height="14" fill="#5e3658" />
        <rect x="1470" y="328" width="44" height="14" fill="#5e3658" />
      </g>
    </g>
    <path d="M1620 200 V146 M1594 168 H1646 M1646 168 L1634 160 M1646 168 L1634 176 M1594 168 L1586 160 M1594 168 L1586 176" stroke="#1b1033" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M1628 132 A14 14 0 1 0 1628 152 A10 10 0 1 1 1628 132 Z" fill="#ffe08a" stroke="#1b1033" stroke-width="3" />
    <g stroke="#1a1f4a" stroke-width="3" stroke-linecap="round" opacity="0.5">
      <path d="M1370 380 h60 M1330 420 h40 M1420 420 h40 M1290 452 h50 M1380 452 h50 M1470 452 h50 M1082 510 h50 M1150 510 h56 M1068 540 h60 M1150 540 h70 M1604 300 h32 M1586 340 h68 M1572 370 h96" />
    </g>
    <g stroke="#8fa0e6" stroke-width="4" stroke-linecap="round" opacity="0.5">
      <path d="M1238 470 L1392 334 M1078 476 H1150 M1556 382 Q1598 336 1614 230" />
    </g>
    <g stroke="#33266a" stroke-width="3" stroke-linecap="round" opacity="0.5">
      <path d="M1074 650 h28 M1206 660 h24 M1078 780 h30 M1250 600 h26 M1320 590 h30 M1460 600 h30 M1540 740 h18 M1262 760 h34 M1500 770 h34 M1574 540 h28 M1650 660 h22 M1580 780 h28" />
    </g>
    <path d="M1064 806 Q1084 744 1068 690 Q1058 650 1082 608 M1068 690 Q1092 676 1100 654" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M1064 806 Q1084 744 1068 690 Q1058 650 1082 608 M1068 690 Q1092 676 1100 654" stroke="#4f8a5a" stroke-width="6" fill="none" stroke-linecap="round" />
    <path :d="[circ(1082, 608, 9), circ(1100, 652, 8), circ(1060, 660, 8), circ(1078, 730, 9), circ(1066, 770, 8)].join(' ')" fill="#5fa86a" stroke="#1b1033" stroke-width="3" />

    <path :d="SHUTTERS" fill="#33407e" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />
    <path :d="panes(DARK)" fill="#231c46" stroke="#1b1033" stroke-width="4" />
    <path :d="panes([...GLOW_A, ...GLOW_B])" fill="#e09a3a" stroke="#1b1033" stroke-width="4" />
    <circle cx="1400" cy="410" r="22" fill="#e09a3a" stroke="#1b1033" stroke-width="4" />
    <g class="mystery-glow">
      <path :d="panes(GLOW_A)" fill="#ffd96b" />
      <circle cx="1400" cy="410" r="20" fill="#ffd96b" />
    </g>
    <g class="mystery-glow" style="animation-delay: -1.4s">
      <path :d="panes(GLOW_B)" fill="#ffd96b" />
    </g>
    <path :d="MULLIONS" stroke="#1b1033" stroke-width="4" fill="none" />
    <path d="M1378 410 H1422 M1400 388 V432" stroke="#1b1033" stroke-width="4" />
    <path :d="SILLS" stroke="#1b1033" stroke-width="7" stroke-linecap="round" />

    <path :d="GHOST_PANE" fill="#ffd27a" />
    <g clip-path="url(#mystery-pane-clip)">
      <g class="mystery-peek">
        <g transform="translate(1620 508) scale(0.44)">
          <path d="M-56 70 L-58 -10 Q-58 -84 0 -84 Q58 -84 58 -10 L56 70 Z" fill="url(#mystery-ghost)" stroke="#1b1033" stroke-width="7" stroke-linejoin="round" />
          <path d="M-36 -60 Q-26 -74 -8 -76" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" />
          <ellipse cx="-20" cy="-26" rx="10" ry="14" fill="#1b1033" />
          <ellipse cx="20" cy="-26" rx="10" ry="14" fill="#1b1033" />
          <circle cx="-23" cy="-31" r="4" fill="#fff" />
          <circle cx="17" cy="-31" r="4" fill="#fff" />
          <ellipse cx="-36" cy="-2" rx="11" ry="6" fill="#ff8ab0" opacity="0.65" />
          <ellipse cx="36" cy="-2" rx="11" ry="6" fill="#ff8ab0" opacity="0.65" />
          <path d="M-12 4 Q0 18 12 4" stroke="#1b1033" stroke-width="6" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>
    <path d="M1594 470 Q1606 486 1598 522 M1646 470 Q1634 486 1642 522" stroke="#c2407a" stroke-width="8" fill="none" stroke-linecap="round" />
    <path :d="GHOST_PANE" fill="none" stroke="#1b1033" stroke-width="5" />
    <path d="M1592 526 H1648" stroke="#1b1033" stroke-width="8" stroke-linecap="round" />

    <rect x="1340" y="698" width="12" height="104" fill="#c9bdf0" stroke="#1b1033" stroke-width="4" />
    <rect x="1448" y="698" width="12" height="104" fill="#c9bdf0" stroke="#1b1033" stroke-width="4" />
    <path d="M1376 800 V736 Q1400 708 1424 736 V800 Z" fill="#6a3248" stroke="#1b1033" stroke-width="5" />
    <path d="M1400 716 V800" stroke="#4a2034" stroke-width="3" />
    <circle cx="1400" cy="742" r="8" fill="#ffd96b" stroke="#1b1033" stroke-width="3" />
    <circle cx="1415" cy="770" r="3.5" fill="#ffd23f" />

    <path d="M640 1140 Q780 860 1040 806 Q1220 788 1400 796 Q1620 788 1780 806 Q1900 818 1980 830 L1980 1140 Z" fill="url(#mystery-hill)" stroke="#1b1033" stroke-width="5" stroke-linejoin="round" filter="url(#cel)" />
    <path d="M1356 796 H1444 V806 H1356 Z M1346 806 H1454 V816 H1346 Z" fill="#a497d2" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    <ellipse cx="1290" cy="840" rx="70" ry="10" fill="#ffd96b" opacity="0.14" />
    <ellipse cx="1560" cy="840" rx="80" ry="10" fill="#ffd96b" opacity="0.12" />

    <path d="M-60 900 Q400 860 900 890 Q1400 920 1980 884 L1980 1140 L-60 1140 Z" fill="url(#mystery-ground)" stroke="#1b1033" stroke-width="5" filter="url(#cel)" />
    <path :d="tufts(30, 886, 980, 0.012)" stroke="#5a75b0" stroke-width="5" fill="none" stroke-linecap="round" />
    <path :d="tufts(1320, 902, 1900, 0.012)" stroke="#5a75b0" stroke-width="5" fill="none" stroke-linecap="round" />

    <path
      d="M1372 816 Q1320 846 1240 872 Q1110 912 1084 980 Q1062 1060 900 1140 L1150 1140 Q1214 1060 1216 996 Q1222 936 1330 890 Q1420 852 1428 816 Z"
      fill="url(#mystery-path)"
      stroke="#1b1033"
      stroke-width="5"
      stroke-linejoin="round"
    />
    <path d="M1300 870 q14 -5 28 0 M1200 910 q18 -6 34 0 M1112 990 q18 -6 36 0 M1160 1052 q20 -7 40 0 M1010 1110 q22 -8 46 0 M1160 960 q14 -5 28 0" stroke="#6a5aa6" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6" />
    <path :d="PAWS" fill="#4a3f86" opacity="0.7" />

    <g v-for="(t, i) in TREES" :key="`tr${i}`" :transform="`translate(${t.x} ${t.y}) scale(${t.k})`">
      <ellipse cx="20" cy="8" rx="160" ry="18" fill="#0b0a24" opacity="0.35" />
      <g filter="url(#cel)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="([d, w], li) in LIMBS" :key="`li${li}`" :d="d" stroke="#1b1033" :stroke-width="w" />
        <path v-for="([d, w], li) in LIMBS" :key="`lb${li}`" :d="d" stroke="#4d3d72" :stroke-width="w - 12" />
      </g>
      <path d="M-14 -20 C-26 -100 26 -180 -8 -270 M14 -60 C20 -120 30 -150 20 -200 M-6 -330 C-20 -380 10 -420 40 -450" stroke="#2c1f48" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
      <path d="M-20 -40 C-34 -110 14 -180 -18 -260 M60 -500 C110 -540 170 -550 230 -596" stroke="#8070aa" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7" />
    </g>
    <g transform="translate(250 950)">
      <path d="M200 -370 V-300 M272 -330 V-280" stroke="#1b1033" stroke-width="4" />
      <path d="M186 -300 H286 L280 -284 H192 Z" fill="#a8744a" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g stroke="#1b1033" fill="none" stroke-linecap="round">
      <template v-for="(f, i) in FENCE" :key="`fi${i}`">
        <path :d="f.bars" stroke-width="12" />
        <path :d="f.rails" stroke-width="14" />
        <path :d="f.curls" stroke-width="9" />
      </template>
    </g>
    <g stroke="#3a3270" fill="none" stroke-linecap="round">
      <template v-for="(f, i) in FENCE" :key="`fc${i}`">
        <path :d="f.bars" stroke-width="5" />
        <path :d="f.rails" stroke-width="6" />
        <path :d="f.curls" stroke-width="3" />
      </template>
    </g>
    <path v-for="(f, i) in FENCE" :key="`ftp${i}`" :d="f.tips" fill="#3a3270" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />

    <g v-for="x in PILLARS" :key="`pl${x}`">
      <rect :x="x - 22" y="830" width="44" height="186" fill="url(#mystery-pillar)" stroke="#1b1033" stroke-width="5" />
      <rect :x="x - 30" y="818" width="60" height="16" fill="#b8acdf" stroke="#1b1033" stroke-width="4" />
      <path :d="`M${x - 14} 870 h20 M${x - 6} 920 h22 M${x - 16} 970 h18`" stroke="#4a3e7a" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <path :d="`M${x - 14} 818 L${x - 10} 782 H${x + 10} L${x + 14} 818 Z`" fill="#ffd96b" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
      <path :d="`M${x} 784 V816`" stroke="#1b1033" stroke-width="3" />
      <path :d="`M${x - 20} 784 L${x} 762 L${x + 20} 784 Z`" fill="#3a3270" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>
    <g class="mystery-candle">
      <circle v-for="x in PILLARS" :key="`hl${x}`" :cx="x" cy="798" r="90" fill="url(#mystery-halo)" />
    </g>
    <path d="M1052 840 Q1140 744 1228 840 M1058 856 Q1140 778 1222 856" stroke="#1b1033" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M1052 840 Q1140 744 1228 840 M1058 856 Q1140 778 1222 856" stroke="#3a3270" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M1150 754 A20 20 0 1 0 1150 790 A14 14 0 1 1 1150 754 Z" fill="#ffe08a" stroke="#1b1033" stroke-width="3" stroke-linejoin="round" />

    <g v-for="(l, i) in LEAVES" :key="`lf${i}`">
      <path :d="`${l.frame} ${l.bars}`" stroke="#1b1033" stroke-width="12" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path :d="`${l.frame} ${l.bars}`" stroke="#3a3270" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round" />
      <path :d="l.tips" fill="#3a3270" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
    </g>

    <g transform="translate(1660 0)">
      <rect x="-20" y="862" width="40" height="154" fill="url(#mystery-pillar)" stroke="#1b1033" stroke-width="5" />
      <rect x="-28" y="850" width="56" height="14" fill="#b8acdf" stroke="#1b1033" stroke-width="4" />
      <g transform="translate(0 852)">
        <g class="mystery-tail" fill="none" stroke-linecap="round">
          <path d="M18 -6 Q40 4 34 40 Q30 64 42 84" stroke="#1b1033" stroke-width="16" />
          <path d="M18 -6 Q40 4 34 40 Q30 64 42 84" stroke="#2a2244" stroke-width="8" />
        </g>
        <path d="M-22 0 Q-30 -30 -14 -48 Q0 -56 14 -48 Q30 -30 22 0 Z" fill="#2a2244" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <path d="M-16 -70 L-15 -92 L-2 -78 Z M16 -70 L15 -92 L2 -78 Z" fill="#2a2244" stroke="#1b1033" stroke-width="4" stroke-linejoin="round" />
        <circle cy="-64" r="19" fill="#2a2244" stroke="#1b1033" stroke-width="4" />
        <path d="M-12 -86 L-10 -78 M12 -86 L10 -78" stroke="#ff9ab8" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="-7" cy="-66" rx="4.5" ry="5.5" fill="#ffe14d" />
        <ellipse cx="7" cy="-66" rx="4.5" ry="5.5" fill="#ffe14d" />
        <path d="M-7 -70 V-62 M7 -70 V-62" stroke="#1b1033" stroke-width="2.5" stroke-linecap="round" />
        <path d="M-2 -57 L0 -55 L2 -57 Z" fill="#ff9ab8" />
        <path d="M-6 -56 L-24 -58 M-6 -54 L-24 -50 M6 -56 L24 -58 M6 -54 L24 -50" stroke="#8f86b8" stroke-width="1.5" stroke-linecap="round" />
        <path d="M-12 -36 Q-16 -18 -10 -2 M12 -36 Q16 -18 10 -2" stroke="#3e3462" stroke-width="3" fill="none" stroke-linecap="round" />
        <g class="mystery-blink">
          <ellipse cx="-7" cy="-66" rx="6" ry="6.5" fill="#2a2244" />
          <ellipse cx="7" cy="-66" rx="6" ry="6.5" fill="#2a2244" />
          <path d="M-12 -65 Q-7 -61 -2 -65 M2 -65 Q7 -61 12 -65" stroke="#1b1033" stroke-width="2" fill="none" stroke-linecap="round" />
        </g>
      </g>
    </g>

    <g fill="#1a1a40" stroke="#2e2c62" stroke-width="5" stroke-linejoin="round">
      <path d="M-60 1140 Q-50 1030 40 1012 Q100 966 180 1008 Q250 996 280 1050 Q330 1070 330 1140 Z" />
      <path d="M1980 1140 Q1980 1020 1890 1006 Q1820 970 1750 1016 Q1680 1012 1660 1070 Q1620 1090 1620 1140 Z" />
    </g>
    <path d="M60 1040 q20 -16 40 -4 M200 1040 q18 -12 34 0 M1780 1040 q20 -14 38 -2 M1880 1030 q16 -12 32 0" stroke="#43407e" stroke-width="5" fill="none" stroke-linecap="round" />

    <g v-for="(g, gi) in FLY_GROUPS" :key="`ff${gi}`" class="firefly" :style="{ animationDuration: `${5 + gi * 2}s`, animationDelay: `-${gi * 2}s` }">
      <path :d="g.halo" fill="#fff3a0" opacity="0.25" />
      <path :d="g.core" fill="#fffbd8" />
    </g>
  </g>
</template>

<style scoped>
.mystery-glow {
  animation: mystery-glow 2.8s ease-in-out infinite alternate;
}

.mystery-candle {
  animation: mystery-candle 1.9s ease-in-out infinite alternate;
}

.mystery-peek {
  animation: mystery-peek 9s ease-in-out infinite;
}

.mystery-bats {
  animation: mystery-bats 28s linear infinite;
  animation-delay: -6s;
}

.mystery-wing {
  animation: mystery-wing 0.5s step-end infinite;
}

.mystery-wing.late {
  animation-delay: -0.25s;
}

.mystery-tail {
  transform-box: fill-box;
  transform-origin: top left;
  animation: mystery-tail 3.4s ease-in-out infinite alternate;
}

.mystery-blink {
  opacity: 0;
  animation: mystery-blink 5s steps(1) infinite;
}

@keyframes mystery-glow {
  from {
    opacity: 0.45;
  }
  to {
    opacity: 1;
  }
}

@keyframes mystery-candle {
  from {
    opacity: 0.55;
  }
  to {
    opacity: 1;
  }
}

/* the ghost rises behind the sill, looks around for a while, then ducks back down */
@keyframes mystery-peek {
  0%,
  25%,
  100% {
    translate: 0 70px;
  }
  40%,
  80% {
    translate: 0 0;
  }
}

@keyframes mystery-bats {
  from {
    translate: -320px 0;
  }
  to {
    translate: 2220px -90px;
  }
}

@keyframes mystery-wing {
  0% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@keyframes mystery-tail {
  from {
    rotate: -10deg;
  }
  to {
    rotate: 8deg;
  }
}

@keyframes mystery-blink {
  0%,
  90% {
    opacity: 0;
  }
  92%,
  96% {
    opacity: 1;
  }
  97% {
    opacity: 0;
  }
}
</style>
