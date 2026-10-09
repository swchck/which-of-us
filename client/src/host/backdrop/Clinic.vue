<script setup lang="ts">
import { seeded } from './kit';

const rnd = seeded(5813);
const f1 = (n: number) => n.toFixed(1);
const VP = { x: 960, y: 360 };
const WALL_FOOT = 790;

const recede = (x: number, yNear: number, yFar: number) => VP.x + ((x - VP.x) * (yFar - VP.y)) / (yNear - VP.y);

const TILES = Array.from({ length: 25 }, (_, i) => -1960 + i * 240)
  .map((x) => `M${recede(x, 1140, WALL_FOOT).toFixed(0)} ${WALL_FOOT} L${x} 1140`)
  .join(' ');
const TILE_ROWS = [822, 866, 926, 1006, 1104].map((y) => `M-60 ${y} H1980`).join(' ');
const FLECKS = Array.from({ length: 36 }, () => {
  const x = -40 + rnd() * 2000;
  const y = 812 + rnd() * 300;
  return `M${x.toFixed(0)} ${y.toFixed(0)} h${(4 + rnd() * 8).toFixed(0)}`;
}).join(' ');

const DIGITS: Record<string, string> = {
  '1': 'M4 10 L14 2 V40',
  '2': 'M2 11 Q2 1 13 1 Q24 1 24 12 Q24 21 2 40 H25',
  '4': 'M19 40 V1 L1 29 H27',
};
const number = (text: string, x: number, y: number) =>
  [...text].map((ch, i) => ({ d: DIGITS[ch], t: `translate(${x + i * 34} ${y})` }));
const DOOR_A = number('12', 268, 397);
const DOOR_B = number('14', 1648, 397);

// glossy ficus leaves merged into two fills, so the swaying crown is a handful of nodes
function leaf(x: number, y: number, a: number, len: number) {
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  const px = -Math.sin(a) * len * 0.38;
  const py = Math.cos(a) * len * 0.38;
  return {
    body: `M${f1(x)} ${f1(y)} Q${f1(mx + px)} ${f1(my + py)} ${f1(tx)} ${f1(ty)} Q${f1(mx - px)} ${f1(my - py)} ${f1(x)} ${f1(y)} Z`,
    vein: `M${f1(x + (tx - x) * 0.15)} ${f1(y + (ty - y) * 0.15)} L${f1(x + (tx - x) * 0.75)} ${f1(y + (ty - y) * 0.75)}`,
  };
}
const FICUS_LEAVES = Array.from({ length: 44 }, () => {
  const a = rnd() * Math.PI * 2;
  const r = 14 + rnd() * 64;
  const x = Math.cos(a) * r;
  const y = -300 + Math.sin(a) * r * 0.9;
  return leaf(x, y, a - 0.6 + rnd() * 1.2, 46 + rnd() * 22);
});
const FICUS_DARK = FICUS_LEAVES.filter((_, i) => i % 2 === 0)
  .map((l) => l.body)
  .join(' ');
const FICUS_LIGHT = FICUS_LEAVES.filter((_, i) => i % 2 === 1)
  .map((l) => l.body)
  .join(' ');
const FICUS_VEINS = FICUS_LEAVES.filter((_, i) => i % 2 === 1)
  .map((l) => l.vein)
  .join(' ');

const CHAIRS = [
  { x: 452, c: 'url(#clinic-coral)' },
  { x: 536, c: 'url(#clinic-teal)' },
  { x: 620, c: 'url(#clinic-sun)' },
];
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30);
const BOARD_ROWS = [282, 318, 354];
</script>

<template>
  <g>
    <defs>
      <linearGradient id="clinic-band" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9fd6df" />
        <stop offset="100%" stop-color="#5fa6bd" />
      </linearGradient>
      <linearGradient id="clinic-floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ecd7aa" />
        <stop offset="100%" stop-color="#c39a62" />
      </linearGradient>
      <linearGradient id="clinic-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffbe0" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#fffbe0" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="clinic-door-a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d6ecff" />
        <stop offset="100%" stop-color="#8ab4e0" />
      </linearGradient>
      <linearGradient id="clinic-door-b" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff0c4" />
        <stop offset="100%" stop-color="#e8b664" />
      </linearGradient>
      <linearGradient id="clinic-frame" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#cfd8e8" />
      </linearGradient>
      <linearGradient id="clinic-coral" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9a84" />
        <stop offset="100%" stop-color="#d9503e" />
      </linearGradient>
      <linearGradient id="clinic-teal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#78dccf" />
        <stop offset="100%" stop-color="#2a958c" />
      </linearGradient>
      <linearGradient id="clinic-sun" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffe07a" />
        <stop offset="100%" stop-color="#e8a83a" />
      </linearGradient>
      <linearGradient id="clinic-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#e2e7f2" />
        <stop offset="100%" stop-color="#8b94ae" />
      </linearGradient>
      <linearGradient id="clinic-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7fb8ff" />
        <stop offset="100%" stop-color="#3a6cc8" />
      </linearGradient>
      <linearGradient id="clinic-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3a4c9a" />
        <stop offset="100%" stop-color="#18204e" />
      </linearGradient>
      <linearGradient id="clinic-water" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#e2f6ff" />
        <stop offset="100%" stop-color="#5fb4ec" />
      </linearGradient>
      <linearGradient id="clinic-pot" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffb58a" />
        <stop offset="100%" stop-color="#c8643a" />
      </linearGradient>
      <linearGradient id="clinic-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e4ecf4" />
      </linearGradient>
    </defs>

    <rect x="-60" y="-60" width="2040" height="1260" fill="url(#g-clinic)" />
    <path d="M60 520 Q120 500 170 530 M860 420 Q920 400 980 430 M1180 520 Q1230 500 1290 528 M1820 560 Q1870 540 1920 566" stroke="#b8e2d6" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.5" />

    <rect x="-60" y="560" width="2040" height="230" fill="url(#clinic-band)" />
    <path d="M-60 560 H1980" stroke="#1b1033" stroke-width="4" />
    <rect x="-60" y="548" width="2040" height="14" fill="#fdfdf8" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 574 H1980" stroke="#d4f2f6" stroke-width="4" />
    <path d="M-60 760 H1980" stroke="#3f8aa2" stroke-width="3" opacity="0.6" />

    <rect x="-60" y="-60" width="2040" height="120" fill="#fdfdf8" stroke="#1b1033" stroke-width="4" />
    <path d="M-60 46 H1980" stroke="#dfe3d6" stroke-width="6" />
    <g stroke="#1b1033" stroke-linejoin="round">
      <path d="M380 60 H660 L760 330 H280 Z M1260 60 H1540 L1640 330 H1160 Z" fill="url(#clinic-glow)" stroke="none" />
      <rect x="380" y="38" width="280" height="26" rx="6" fill="#fffbe6" stroke-width="4" />
      <rect x="1260" y="38" width="280" height="26" rx="6" fill="#fffbe6" stroke-width="4" />
      <path d="M398 48 H560 M1278 48 H1440" stroke="#fff" stroke-width="5" stroke-linecap="round" />
    </g>

    <g transform="translate(960 160)" stroke="#1b1033">
      <circle r="62" fill="#5fc4b4" stroke-width="5" filter="url(#cel-s)" />
      <circle r="49" fill="#fffdf4" stroke-width="4" />
      <path v-for="a in TICKS" :key="`tk${a}`" :d="a % 90 === 0 ? 'M0 -43 V-33' : 'M0 -43 V-38'" :transform="`rotate(${a})`" :stroke-width="a % 90 === 0 ? 5 : 3" stroke-linecap="round" />
      <path d="M0 4 L-18 -14" stroke-width="7" stroke-linecap="round" />
      <path d="M0 6 V-36" stroke-width="4.5" stroke-linecap="round" />
      <circle r="5" fill="#ff7a5a" stroke-width="3" />
      <path d="M-40 -28 Q-28 -46 -8 -52" stroke="#c4f2ea" stroke-width="5" fill="none" stroke-linecap="round" />
    </g>

    <rect x="-60" y="790" width="2040" height="350" fill="url(#clinic-floor)" />
    <path :d="TILES" stroke="#a87e48" stroke-width="3" opacity="0.45" />
    <path :d="TILE_ROWS" stroke="#a87e48" stroke-width="3" opacity="0.45" />
    <path :d="FLECKS" stroke="#fff4dc" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    <path d="M300 900 Q600 870 760 900 M1180 940 Q1420 910 1640 950" stroke="#fff6e2" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.35" />
    <rect x="-60" y="778" width="2040" height="16" fill="#3f7f96" stroke="#1b1033" stroke-width="4" />

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="452" y="250" width="240" height="250" rx="6" fill="url(#clinic-paper)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="470" y="268" width="204" height="40" rx="6" fill="#ff9a3c" stroke-width="3.5" />
      <path d="M488 288 H600 M614 288 H654" stroke="#fff" stroke-width="7" stroke-linecap="round" />
      <circle cx="526" cy="390" r="44" fill="#ffa53a" stroke-width="4.5" />
      <circle cx="526" cy="390" r="32" fill="#ffd27a" stroke-width="3" />
      <path d="M526 358 V422 M494 390 H558 M504 368 L548 412 M548 368 L504 412" stroke="#ff9a3c" stroke-width="3" />
      <path d="M510 362 Q522 354 536 356" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M598 360 L652 352 L612 452 Z" fill="#ff8a3a" stroke-width="4" />
      <path d="M612 374 h18 M612 398 h14 M614 420 h10" stroke="#c4501e" stroke-width="3" stroke-linecap="round" />
      <path d="M650 352 q10 -22 26 -24 M650 352 q-2 -26 10 -36 M650 352 q20 -8 30 2" stroke="#3aa860" stroke-width="5" fill="none" stroke-linecap="round" />
      <circle cx="636" cy="462" r="20" fill="#6cd06a" stroke-width="3.5" />
      <path d="M636 442 q4 -10 14 -12" stroke-width="3" fill="none" />
      <path d="M484 468 H580 M484 484 H556" stroke="#9aa4c4" stroke-width="5" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1814" y="300" width="100" height="160" rx="6" fill="#bfe8ff" stroke-width="5" filter="url(#cel-s)" />
      <rect x="1834" y="388" width="60" height="34" rx="12" fill="#ff9ec4" stroke-width="4" />
      <path d="M1842 396 H1870" stroke="#ffe0ec" stroke-width="4" stroke-linecap="round" />
      <g fill="#fff" stroke-width="3">
        <circle cx="1846" cy="360" r="12" />
        <circle cx="1876" cy="344" r="8" />
        <circle cx="1890" cy="370" r="6" />
        <circle cx="1856" cy="330" r="5" />
      </g>
      <path d="M1830 440 H1898" stroke="#6a8ab8" stroke-width="4" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1252" y="232" width="280" height="150" rx="12" fill="url(#clinic-metal)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="1266" y="246" width="252" height="122" rx="6" fill="url(#clinic-screen)" stroke-width="3.5" />
      <g stroke="none">
        <g v-for="(y, i) in BOARD_ROWS" :key="`br${i}`">
          <rect x="1284" :y="y - 10" width="18" height="20" rx="3" fill="#ffc94a" />
          <rect x="1306" :y="y - 10" width="18" height="20" rx="3" fill="#ffc94a" />
          <rect x="1328" :y="y - 10" width="18" height="20" rx="3" fill="#ffc94a" />
          <path :d="`M1372 ${y} h44 l-10 -8 M1416 ${y} l-10 8`" stroke="#9fb4ff" stroke-width="4" fill="none" stroke-linecap="round" />
          <rect x="1448" :y="y - 10" width="18" height="20" rx="3" fill="#5fe0a0" />
          <rect x="1470" :y="y - 10" width="18" height="20" rx="3" fill="#5fe0a0" />
        </g>
      </g>
      <path d="M1278 360 L1360 252" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.12" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="300" cy="796" rx="140" ry="12" fill="#3a4a7a" opacity="0.25" stroke="none" />
      <rect x="176" y="270" width="248" height="520" rx="6" fill="url(#clinic-frame)" stroke-width="6" />
      <rect x="194" y="288" width="212" height="502" rx="3" fill="url(#clinic-door-a)" stroke-width="4" filter="url(#cel)" />
      <rect x="216" y="330" width="168" height="170" rx="6" fill="none" stroke="#5f86b8" stroke-width="4" />
      <rect x="216" y="530" width="168" height="230" rx="6" fill="none" stroke="#5f86b8" stroke-width="4" />
      <path d="M232 346 L300 346" stroke="#f0f8ff" stroke-width="5" stroke-linecap="round" />
      <rect x="252" y="386" width="96" height="62" rx="8" fill="#fffdf4" stroke-width="4" />
      <g fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="(n, i) in DOOR_A" :key="`door_a${i}`" :d="n.d" :transform="n.t" />
      </g>
      <rect x="360" y="540" width="16" height="48" rx="6" fill="url(#clinic-metal)" stroke-width="3.5" />
      <path d="M368 560 H338" stroke-width="8" stroke-linecap="round" />
      <path d="M368 560 H338" stroke="#e2e7f2" stroke-width="3" stroke-linecap="round" />

      <rect x="226" y="196" width="148" height="56" rx="12" fill="#2a2440" stroke-width="5" />
      <circle cx="264" cy="224" r="16" fill="#6a2a34" stroke-width="3" />
      <circle cx="336" cy="224" r="16" fill="#1f5a3a" stroke-width="3" />
      <circle class="clinic-lamp" cx="264" cy="224" r="16" fill="#ff5a5a" stroke="none" />
      <circle class="clinic-lamp clinic-lamp-b" cx="336" cy="224" r="16" fill="#5fe08a" stroke="none" />
      <path d="M256 216 q4 -4 10 -4 M328 216 q4 -4 10 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <rect x="1556" y="270" width="248" height="520" rx="6" fill="url(#clinic-frame)" stroke-width="6" />
      <rect x="1574" y="288" width="212" height="502" rx="3" fill="url(#clinic-door-b)" stroke-width="4" filter="url(#cel)" />
      <rect x="1596" y="330" width="168" height="170" rx="6" fill="none" stroke="#c48a3a" stroke-width="4" />
      <rect x="1596" y="530" width="168" height="230" rx="6" fill="none" stroke="#c48a3a" stroke-width="4" />
      <path d="M1612 346 L1680 346" stroke="#fff8e0" stroke-width="5" stroke-linecap="round" />
      <rect x="1632" y="386" width="96" height="62" rx="8" fill="#fffdf4" stroke-width="4" />
      <g fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="(n, i) in DOOR_B" :key="`door_b${i}`" :d="n.d" :transform="n.t" />
      </g>
      <rect x="1584" y="540" width="16" height="48" rx="6" fill="url(#clinic-metal)" stroke-width="3.5" />
      <path d="M1592 560 H1622" stroke-width="8" stroke-linecap="round" />
      <path d="M1592 560 H1622" stroke="#e2e7f2" stroke-width="3" stroke-linecap="round" />
      <rect x="1626" y="210" width="108" height="40" rx="10" fill="#fffdf4" stroke-width="4" />
      <path d="M1680 218 V242 M1668 230 H1692" stroke="#2fb0a0" stroke-width="7" stroke-linecap="round" />
    </g>

    <g stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="576" cy="806" rx="170" ry="12" fill="#3a4a7a" opacity="0.28" stroke="none" />
      <path d="M440 726 H710 M460 726 V806 M690 726 V806" stroke-width="12" stroke-linecap="round" />
      <path d="M440 726 H710 M460 726 V806 M690 726 V806" stroke="#c8d0e2" stroke-width="5" stroke-linecap="round" />
      <g v-for="(c, i) in CHAIRS" :key="`ch${i}`">
        <path :d="`M${c.x + 35} 680 V700`" stroke-width="10" />
        <path :d="`M${c.x + 35} 680 V700`" stroke="#c8d0e2" stroke-width="4" />
        <rect :x="c.x" y="604" width="70" height="74" rx="16" :fill="c.c" stroke-width="4.5" filter="url(#cel-s)" />
        <rect :x="c.x - 4" y="698" width="78" height="20" rx="7" :fill="c.c" stroke-width="4.5" />
        <path :d="`M${c.x + 12} 620 Q${c.x + 30} 612 ${c.x + 48} 618`" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7" />
      </g>
      <g transform="translate(560 698)">
        <path d="M-22 0 V-36 Q-22 -44 -14 -44 H14 Q22 -44 22 -36 V0 Z" fill="#7a5cc8" stroke-width="4" />
        <path d="M-12 -44 Q-12 -58 0 -58 Q12 -58 12 -44" fill="none" stroke-width="4" />
        <path d="M-14 -30 H8" stroke="#b6a4f0" stroke-width="4" stroke-linecap="round" />
      </g>
      <g transform="translate(640 698)">
        <rect x="-10" y="-46" width="20" height="46" rx="5" fill="#ff7a8a" stroke-width="3.5" />
        <rect x="-12" y="-56" width="24" height="12" rx="4" fill="#d6dcea" stroke-width="3.5" />
      </g>
    </g>

    <g transform="translate(112 806)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="2" rx="80" ry="12" fill="#3a4a7a" opacity="0.28" stroke="none" />
      <path d="M0 -90 Q-14 -160 6 -220 Q16 -260 0 -300" stroke="#8a5424" stroke-width="12" fill="none" stroke-linecap="round" />
      <path d="M2 -150 Q30 -190 44 -250 M-4 -200 Q-34 -230 -50 -280" stroke="#8a5424" stroke-width="7" fill="none" stroke-linecap="round" />
      <g class="clinic-ficus">
        <path :d="FICUS_DARK" fill="#2f8a4e" stroke-width="3.5" />
        <path :d="FICUS_LIGHT" fill="#52c46e" stroke-width="3.5" />
        <path :d="FICUS_VEINS" stroke="#b8f2c4" stroke-width="2.5" fill="none" stroke-linecap="round" />
      </g>
      <path d="M-50 -92 H50 L40 0 H-40 Z" fill="url(#clinic-pot)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-58" y="-104" width="116" height="20" rx="6" fill="#ffd2b4" stroke-width="5" />
      <path d="M-44 -96 H14" stroke="#fff" stroke-width="4" stroke-linecap="round" />
    </g>

    <g transform="translate(1310 806)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="2" rx="80" ry="12" fill="#3a4a7a" opacity="0.28" stroke="none" />
      <rect x="-50" y="-210" width="100" height="210" rx="10" fill="url(#clinic-paper)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-36" y="-170" width="72" height="54" rx="6" fill="#d6dcea" stroke-width="3.5" />
      <rect x="-26" y="-164" width="14" height="18" rx="4" fill="#ff6a5a" stroke-width="3" />
      <rect x="12" y="-164" width="14" height="18" rx="4" fill="#4a9aff" stroke-width="3" />
      <rect x="-30" y="-124" width="60" height="8" rx="3" fill="#8b94ae" stroke-width="3" />
      <path d="M-36 -80 H36" stroke-width="3.5" />
      <path d="M38 -200 V-30" stroke="#b8c2d8" stroke-width="5" opacity="0.6" />
      <rect x="52" y="-196" width="24" height="96" rx="6" fill="#e8f4ff" stroke-width="3.5" />
      <path d="M58 -186 H70 M58 -170 H70 M58 -154 H70 M58 -138 H70" stroke="#9ab8d8" stroke-width="3" />
      <rect x="-16" y="-232" width="32" height="24" rx="4" fill="#9fd4f4" stroke-width="4" />
      <rect x="-48" y="-342" width="96" height="116" rx="32" fill="url(#clinic-water)" stroke-width="5" opacity="0.92" />
      <path d="M-34 -300 Q0 -290 34 -300" stroke="#3a8acc" stroke-width="3" fill="none" opacity="0.6" />
      <path d="M-30 -320 V-256" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.7" />
      <g class="clinic-bubble" fill="#ffffff" stroke="#3a8acc" stroke-width="2.5">
        <circle cx="-6" cy="-238" r="7" />
        <circle cx="12" cy="-246" r="4.5" />
      </g>
      <g class="clinic-bubble clinic-bubble-b" fill="#ffffff" stroke="#3a8acc" stroke-width="2.5">
        <circle cx="6" cy="-240" r="5.5" />
        <circle cx="-14" cy="-248" r="3.5" />
      </g>
    </g>

    <g transform="translate(1462 806)" stroke="#1b1033" stroke-linejoin="round">
      <ellipse cx="0" cy="2" rx="76" ry="12" fill="#3a4a7a" opacity="0.28" stroke="none" />
      <path d="M-34 0 L-26 -130 H26 L34 0 Z" fill="url(#clinic-metal)" stroke-width="5" />
      <path d="M-18 -116 V-10" stroke="#f4f6fc" stroke-width="5" stroke-linecap="round" opacity="0.7" />
      <rect x="-64" y="-320" width="128" height="200" rx="18" fill="url(#clinic-body)" stroke-width="5" filter="url(#cel-s)" />
      <rect x="-48" y="-302" width="96" height="74" rx="8" fill="url(#clinic-screen)" stroke-width="4" />
      <rect x="-38" y="-292" width="76" height="16" rx="4" fill="#5fe0a0" stroke="none" />
      <rect x="-38" y="-268" width="76" height="14" rx="4" fill="#ffc94a" stroke="none" />
      <rect x="-38" y="-246" width="76" height="12" rx="4" fill="#9fb4ff" stroke="none" />
      <circle cx="-26" cy="-204" r="9" fill="#ffd36e" stroke-width="3" />
      <circle cx="0" cy="-204" r="9" fill="#fff" stroke-width="3" />
      <circle cx="26" cy="-204" r="9" fill="#ff8a7a" stroke-width="3" />
      <path d="M-52 -310 Q-52 -316 -40 -316" stroke="#c4e0ff" stroke-width="5" fill="none" stroke-linecap="round" />
      <g class="clinic-ticket">
        <path d="M-20 -168 H20 V-124 L14 -128 L8 -124 L2 -128 L-4 -124 L-10 -128 L-16 -124 L-20 -128 Z" fill="#fffdf4" stroke-width="3" />
        <path d="M-10 -156 H10 M-10 -144 H4" stroke="#3a6cc8" stroke-width="4" stroke-linecap="round" />
      </g>
      <rect x="-32" y="-174" width="64" height="10" rx="4" fill="#1b1033" stroke-width="3" />
    </g>
  </g>
</template>

<style scoped>
.clinic-lamp {
  animation: clinic-lamp 8s steps(1) infinite;
}

.clinic-lamp-b {
  animation-delay: -4s;
}

.clinic-ficus {
  transform-origin: 0 -100px;
  animation: clinic-sway 6s ease-in-out infinite alternate;
}

.clinic-bubble {
  animation: clinic-bubble 4.6s ease-in infinite;
}

.clinic-bubble-b {
  animation-delay: -2.3s;
}

.clinic-ticket {
  transform-box: fill-box;
  transform-origin: top center;
  animation: clinic-print 7s ease-in-out infinite;
}

@keyframes clinic-lamp {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes clinic-sway {
  from {
    rotate: -1.5deg;
  }
  to {
    rotate: 1.5deg;
  }
}

@keyframes clinic-bubble {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-82px);
    opacity: 0;
  }
}

@keyframes clinic-print {
  0%,
  10% {
    transform: scaleY(0);
    opacity: 1;
  }
  30%,
  80% {
    transform: scaleY(1);
    opacity: 1;
  }
  92%,
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}
</style>
