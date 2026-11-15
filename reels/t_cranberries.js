// t_cranberries.js: "Why do cranberries float?" in the lemo-opuscar silkscreen-poster style (#7), same engine as the approved skyblue reel.
// Grammar kept: print table, squeegee pulls (one ink, one beat), split-fountain bead, screen lift, stepped bands, paper as a colour,
// info band, tree-silhouette transitions, wall lockup, end card printed in two pulls. Vertical 1080x1920, deterministic in t.
// Safe zones: posters framed in y 250-1150, printed caption strip at y 1170-1410 (text inside x 190-890), nothing written top 250 / right column.
import { makeTextures, squeegee, screenFrame, wipeFront, wipeRegion, ink, rectPath, polyPath, circlePath, ringPath, clamp, lerp, mix, hash, mulberry, paperSheet, inkFinish, bandSteps } from './styles/silkscreen-poster/engine/silk.js';
import { drawPoster, drawBanner, pickInk, PW, PH, ART, BW, BH, BANNER_ART, BANNER_BANDS } from './styles/silkscreen-poster/engine/poster.js';
import { pine, forest, range, facets, sunParts, wavesPath } from './styles/silkscreen-poster/engine/scenes.js';
await Promise.all(['900 40px BigShoulders', '800 40px BigShoulders', '500 40px Outfit', '600 40px Outfit', '700 40px Outfit', '800 40px Outfit'].map(f => document.fonts.load(f)));

const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; cv.style.width = '540px'; cv.style.height = '960px';
const ctx = cv.getContext('2d');
const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TLp = window.TL.p, DUR = window.TL.total;
const a = i => TLp[i].start, e = i => TLp[i].end;

// ------------------------------------------------------------------ palettes (<= 6 inks + glow + 2 accent helpers)
const PAPER = '#F2E8D2', TABLE = '#6B4E36';
const PAL = {
  banner: { sky1: '#F6E4DA', sky2: '#C7243A', far: '#7E1A2C', mid: '#3A6FA0', near: '#2A1622', sun: '#F2B134', glow: '#F6E4DA' },
  berry: { sky1: '#F6E4DA', sky2: '#C7243A', far: '#7E1A2C', mid: '#3A6FA0', near: '#2A1622', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D', blueL: '#7FC4E8' },
  bog: { sky1: '#EEF1EA', sky2: '#7FB6D9', far: '#2F5E3A', mid: '#33679A', near: '#1C2622', sun: '#F2B134', glow: '#FFFFFF', red: '#C7243A', blueL: '#9CCBE6' },
  bounce: { sky1: '#F4E6C8', sky2: '#E8A33D', far: '#7A4A2A', mid: '#B3562F', near: '#2A1A12', sun: '#F2B134', glow: '#FFFFFF', red: '#C7243A', blueL: '#7FC4E8' },
};
const T = makeTextures(PAPER, 7);
const BANNER_C = { title: 'Why do cranberries float?', footer: 'Air pockets, a flooded bog and a bounce' };
// ------------------------------------------------------------------ shape helpers (our own objects, demo's building blocks)
function wavePath(x0, x1, y, amp, wl, th) {
  const up = [], dn = [];
  for (let x = x0; x <= x1; x += 4) { const yy = y + amp * Math.sin((x - x0) / wl * Math.PI * 2); up.push([x, yy - th / 2]); dn.push([x, yy + th / 2]); }
  return polyPath(up.concat(dn.reverse()));
}
function rays(cx, cy, n, r0, r1, th, rot = 0, jit = 0, seed = 1) {
  const p = new Path2D(), r = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const an = rot + i / n * Math.PI * 2 + (r() - .5) * jit, l1 = r1 * (.75 + .25 * r());
    const c = Math.cos(an), s = Math.sin(an), nx = -s * th / 2, ny = c * th / 2;
    p.addPath(polyPath([[cx + c * r0 + nx, cy + s * r0 + ny], [cx + c * l1 + nx, cy + s * l1 + ny], [cx + c * l1 - nx, cy + s * l1 - ny], [cx + c * r0 - nx, cy + s * r0 - ny]]));
  }
  return p;
}
function line(x0, y0, x1, y1, th) { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * th / 2, ny = dx / L * th / 2; return polyPath([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]); }
function dashes(x0, y0, x1, y1, th, dash, gap) { const p = new Path2D(), L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; for (let s = 0; s < L; s += dash + gap) { const s1 = Math.min(L, s + dash); p.addPath(line(x0 + ux * s, y0 + uy * s, x0 + ux * s1, y0 + uy * s1, th)); } return p; }
// scalloped cloud: touching semicircles on a flat base (single non-self-intersecting outline, safe for even-odd knock-outs)
function cloud(x0, yb, radii, hs) {
  const p = new Path2D(); let x = x0; p.moveTo(x0, yb);
  radii.forEach((r, i) => { const cx = x + r, cy = yb - hs[i]; p.lineTo(x, cy); p.arc(cx, cy, r, Math.PI, 0); x += 2 * r; });
  p.lineTo(x, yb); p.closePath(); return { path: p, x0, x1: x, yb };
}
function bottomStrip(c, th) { return rectPath(c.x0, c.yb - th, c.x1 - c.x0, th); }

function halftone(x0, x1, y0, y1, step, rmax, up = true) {
  const p = new Path2D(); let row = 0;
  for (let y = y0; y <= y1; y += step * .87, row++) { const k = (y - y0) / (y1 - y0), r = rmax * (up ? 1 - k : k); if (r < 1.2) continue; for (let x = x0 + (row % 2) * step / 2; x <= x1; x += step) p.addPath(circlePath(x, y, r)); }
  return p;
}
function slab(text, y, size = 190) { return c => { c.font = `900 ${size}px BigShoulders`; c.letterSpacing = '6px'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(text, PW / 2 + 3, y); }; }
function cloudRow(list) { const p = new Path2D(); list.forEach(([x, y, k]) => p.addPath(cloud(x, y, [38 * k, 52 * k, 40 * k], [22 * k, 46 * k, 20 * k]).path)); return p; }
// ------------------------------------------------------------------ three posters (custom scenes + info)
const SEED = 11;
function berries(list, r0 = 1) { const p = new Path2D(); list.forEach(([x, y, r]) => p.addPath(circlePath(x, y, r * r0))); return p; }
function arrowUp(x, y0, y1, th) { const p = line(x, y0, x, y1 + 30, th); p.addPath(polyPath([[x - 26, y1 + 34], [x + 26, y1 + 34], [x, y1 - 10]])); return p; }
function scene1() {   // AIR POCKETS: a cut berry with four air chambers, whole berries floating on a water line
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 120); top.addPath(bandSteps(-60, PW + 120, 60, 230, 6, 8));
  const berry = circlePath(500, 520, 300);
  const rim = ringPath(500, 520, 282, 300);
  const calyx = polyPath([[500, 190], [530, 240], [590, 236], [545, 270], [560, 325], [500, 290], [440, 325], [455, 270], [410, 236], [470, 240]]);
  const pockets = new Path2D(), seeds = new Path2D();
  [0, 1, 2, 3].forEach(i => { const an = Math.PI / 4 + i * Math.PI / 2, cx = 500 + Math.cos(an) * 120, cy = 520 + Math.sin(an) * 120;
    const pp = new Path2D(); pp.ellipse(cx, cy, 64, 118, an + Math.PI / 2, 0, Math.PI * 2); pockets.addPath(pp);
    seeds.addPath((() => { const s = new Path2D(); s.ellipse(cx + Math.cos(an) * 20, cy + Math.sin(an) * 20, 11, 20, an, 0, 7); s.ellipse(cx - Math.cos(an) * 40, cy - Math.sin(an) * 40, 10, 18, an, 0, 7); return s; })()); });
  const water = rectPath(-60, 930, PW + 120, 700);
  const glints = new Path2D(); [960, 1000, 1045].forEach((y, i) => glints.addPath(wavePath(40 + i * 40, 960 - i * 30, y, 6, 70, 6)));
  const floaters = berries([[150, 925, 44], [290, 920, 50], [440, 926, 42], [600, 922, 48], [760, 927, 44], [890, 924, 40]]);
  const ripple = new Path2D(); [150, 290, 440, 600, 760, 890].forEach(x => ripple.addPath(wavePath(x - 70, x + 70, 934, 4, 46, 7)));
  const up = new Path2D(); [220, 520, 820].forEach(x => up.addPath(arrowUp(x, 1080, 990, 14)));
  const drift = new Path2D(); [[120, 1010], [520, 1030]].forEach(([x, y]) => { drift.addPath(dashes(x, y, x + 300, y, 9, 26, 16)); drift.addPath(polyPath([[x + 300, y - 22], [x + 340, y], [x + 300, y + 22]])); });
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 60, 260, 26, 10, false), sub: 0 }] },
    { id: 'berry', parts: [{ ink: 'sky2', path: berry, sub: 0 }, { ink: 'far', path: rim, sub: 1 }] },
    { id: 'calyx', parts: [{ ink: 'near', path: calyx, sub: 0 }] },
    { id: 'pockets', parts: [{ ink: 'sky1', path: pockets, sub: 0 }] },
    { id: 'seeds', parts: [{ ink: 'sun', path: seeds, sub: 0 }] },
    { id: 'water', parts: [{ ink: 'mid', path: water, sub: 0 }, { ink: 'blueL', path: glints, sub: 1 }] },
    { id: 'floaters', parts: [{ ink: 'sky2', path: floaters, sub: 0 }] },
    { id: 'ripple', parts: [{ ink: 'sky1', path: ripple, sub: 0 }] },
    { id: 'up', parts: [{ ink: 'sun', path: up, sub: 0 }] },
    { id: 'drift', parts: [{ ink: 'sky1', path: drift, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky1', paint: slab('AIR POCKETS', 1105, 170), sub: 0 }] },
  ] };
}
function scene2() {   // THE FLOOD: low vines, then a flooded bog, the water reel, red berries rising, a boom gathering them
  const sun = sunParts(780, 250, 70, 2);
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const bands = new Path2D(); bands.rect(-60, -60, PW + 120, 140); bands.addPath(bandSteps(-60, PW + 120, 140, 330, 6, 10));
  const trees = new Path2D(); for (let i = 0; i < 9; i++) pine(trees, 40 + i * 118, 470, 300 + (i % 3) * 30, 110 + (i % 2) * 30, 4);
  trees.addPath(rectPath(-60, 455, PW + 120, 30));
  const vines = new Path2D(); for (let i = 0; i < 26; i++) { const x = 10 + i * 38; vines.addPath(polyPath([[x, 980], [x + 14, 900 + (i % 3) * 18], [x + 30, 980]])); } vines.addPath(rectPath(-60, 975, PW + 120, 40));
  const water = rectPath(-60, 485, PW + 120, 1200);
  const glints = wavesPath(40, 960, 520, 900, 18, SEED + 7, 90);
  const R = mulberry(5), bl = [];
  for (let i = 0; i < 120; i++) { const x = 30 + R() * 940, y = 560 + R() * 470, d = Math.hypot(x - 260, y - 980); if (d < 120 + R() * 40 && R() < .3) continue; bl.push([x, y, 11 + R() * 8]); }
  for (let i = 0; i < 70; i++) { const an = R() * Math.PI, rr = R() * 230; bl.push([170 + Math.cos(an) * rr * 1.3, 1000 - Math.sin(an) * rr * .55, 12 + R() * 6]); }
  const reel = new Path2D(); reel.addPath(ringPath(680, 690, 92, 112)); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; reel.addPath(line(680, 690, 680 + Math.cos(an) * 104, 690 + Math.sin(an) * 104, 12)); }
  reel.addPath(rectPath(560, 600, 240, 40)); reel.addPath(rectPath(780, 570, 120, 90));
  const boom = new Path2D(); const bp = []; for (let k = 0; k <= 30; k++) { const u = k / 30; bp.push([lerp(60, 940, u), 1060 - 240 * Math.sin(u * Math.PI * .8) + 40 * u]); }
  bp.forEach((q, i) => { if (i) boom.addPath(line(bp[i - 1][0], bp[i - 1][1], q[0], q[1], 16)); if (i % 3 === 0) boom.addPath(circlePath(q[0], q[1], 15)); });
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, knock: sun.knock, sub: 0 }] },
    { id: 'bands', parts: [{ ink: 'sky2', path: bands, knock: sun.knock, sub: 0 }] },
    { id: 'sun', parts: [{ ink: 'sun', path: sun.disc, sub: 0 }] },
    { id: 'trees', parts: [{ ink: 'far', path: trees, sub: 0 }] },
    { id: 'vines', parts: [{ ink: 'far', path: vines, sub: 0 }] },
    { id: 'water', parts: [{ ink: 'mid', path: water, sub: 0 }, { ink: 'blueL', path: glints, sub: 1 }] },
    { id: 'reel', parts: [{ ink: 'near', path: reel, sub: 0 }] },
    { id: 'berries', parts: [{ ink: 'red', path: berries(bl), sub: 0 }] },
    { id: 'boom', parts: [{ ink: 'sun', path: boom, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky1', paint: slab('THE FLOOD', 1105, 190), sub: 0 }] },
  ] };
}
function scene3() {   // THE BOUNCE: berries bouncing down a stair of boards; a soft one lies flat
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 160); top.addPath(bandSteps(-60, PW + 120, 160, 360, 6, 10));
  const stairs = polyPath([[-60, 420], [200, 420], [200, 560], [400, 560], [400, 700], [600, 700], [600, 840], [800, 840], [800, 980], [1060, 980], [1060, 1600], [-60, 1600]]);
  const lips = new Path2D(); [[-60, 420, 260], [200, 560, 200], [400, 700, 200], [600, 840, 200], [800, 980, 260]].forEach(([x, y, w]) => lips.addPath(rectPath(x, y, w, 16)));
  const arcs = new Path2D(); const P = []; [[110, 380], [300, 520], [500, 660], [700, 800], [900, 940]].forEach(q => P.push(q));
  for (let i = 1; i < P.length; i++) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; for (let k = 0; k < 9; k++) { const u0 = k / 9, u1 = (k + .55) / 9; const f = u => [lerp(x0, x1, u), lerp(y0, y1, u) - 150 * Math.sin(u * Math.PI)]; const A = f(u0), B = f(u1); arcs.addPath(line(A[0], A[1], B[0], B[1], 8)); } }
  const good = berries([[110, 380, 36], [500, 660, 36], [900, 940, 38]]);
  const soft = new Path2D(); soft.ellipse(300, 548, 48, 14, 0, 0, Math.PI * 2);
  const stay = new Path2D(); stay.addPath(dashes(300, 600, 300, 680, 8, 14, 10));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 160, 380, 26, 10, false), sub: 0 }] },
    { id: 'stairs', parts: [{ ink: 'far', path: stairs, sub: 0 }, { ink: 'sky2', path: lips, sub: 1 }] },
    { id: 'arcs', parts: [{ ink: 'near', path: arcs, sub: 0 }] },
    { id: 'good', parts: [{ ink: 'red', path: good, sub: 0 }] },
    { id: 'soft', parts: [{ ink: 'mid', path: soft, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky1', paint: slab('THE BOUNCE', 1105, 190), sub: 0 }] },
  ] };
}
const mkP = (sc, name, idx, items) => ({ sc, trail: { name }, items, idx, n: 3, paper: PAPER, park: 'How it really works', trailPts: [], trailLen: 0, seed: idx * 13 + 5 });
const POS = [
  mkP(scene1(), 'Inside a cranberry', 0, [{ key: 'a', label: 'INSIDE', value: '4 AIR POCKETS' }, { key: 'b', label: 'DENSITY', value: '< WATER' }, { key: 'c', label: 'SO IT', value: 'FLOATS' }]),
  mkP(scene2(), 'Harvest by flood', 1, [{ key: 'a', label: 'WET HARVEST', value: '90%+' }, { key: 'b', label: 'TOOL', value: 'WATER REEL' }, { key: 'c', label: 'FOR', value: 'JUICE + SAUCE' }]),
  mkP(scene3(), 'The bounce test', 2, [{ key: 'a', label: 'FRESH', value: 'PICKED DRY' }, { key: 'b', label: 'FIRM', value: 'BOUNCE' }, { key: 'c', label: 'SOFT', value: "DON'T" }]),
];
const PALS = [PAL.berry, PAL.bog, PAL.bounce];

// ------------------------------------------------------------------ timeline (all anchored to the voice)
const BAN = [-900, -220], PO = [-500, 560], SPEC = [-700, 300, 1400, 210], BCY = 330;
const S1 = { t0: 0, t1: a(2) - .55 }, S2 = { t0: a(2) - .55, t1: a(5) - .1 }, S3 = { t0: a(5) - .1, t1: a(11) - .1 }, S4 = { t0: a(11) - .1, t1: a(14) - .1 }, S5 = { t0: a(14) - .1, t1: a(16) - .15 };
const PR = [
  { sky: [a(2) + .05, .45], top: [a(2) + .35, .45], halftone: [a(2) + .7, .4], berry: [a(2) + .5, .6], calyx: [a(2) + 1.0, .35], pockets: [a(2) + 1.75, .55], seeds: [a(2) + 2.4, .35],
    water: [a(3) + .3, .5], floaters: [a(3) + .9, .45], ripple: [a(3) + 1.3, .35], up: [a(3) + 2.0, .4], head: [a(3) + .1, .5], drift: [a(4) + 1.4, .55] },
  { sky: [a(5) + .1, .4], bands: [a(5) + .4, .45], sun: [a(5) + .8, .35], trees: [a(5) + 1.1, .4], vines: [a(5) + 1.6, .45], water: [a(6) + .2, .7], reel: [a(7) + .3, .45],
    berries: [a(8) + .2, .7], boom: [a(9) + .2, .6], head: [a(9) + 1.6, .5] },
  { sky: [a(11) + .1, .5], top: [a(11) + .4, .45], halftone: [a(11) + .8, .4], stairs: [a(11) + 1.3, .5], good: [a(12) + .1, .4], arcs: [a(12) + .5, .6], soft: [a(12) + 1.4, .4], head: [a(13) + .4, .5] },
];
const ITEMS = [[a(3) + 2.4, a(3) + 2.8, a(3) + 3.2], [a(10) + .6, a(10) + 1.3, a(10) + 2.4], [a(11) + 2.6, a(12) + .3, a(12) + 1.6]];
const BAND = [a(2) + .9, a(5) + .5, a(11) + .3], NAME = [a(2) + 1.3, a(5) + .9, a(11) + .7], PUSH = [a(3) + 2.0, a(10) + .1], UNPUSH = [[a(4) + .6, a(4) + 1.3], [a(10) + 3.0, a(10) + 3.7]];
const INKOF = { sky: 'sky1', top: 'sky2', berry: 'sky2', pockets: 'sky1', water: 'mid', floaters: 'sky2', bands: 'sky2', trees: 'far', vines: 'far', reel: 'near', berries: 'red', boom: 'sun', stairs: 'far', arcs: 'near', good: 'red', soft: 'mid', head: 'sky1' };
const SQUEEGEE_IDS = [['sky', 'top', 'berry', 'pockets', 'water', 'floaters'], ['sky', 'bands', 'trees', 'vines', 'water', 'reel', 'berries', 'boom'], ['sky', 'top', 'stairs', 'arcs', 'good', 'soft']];
// ------------------------------------------------------------------ drawing helpers
function cam(cx, cy, z, rot = 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(W / 2, H / 2); if (rot) ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); }
let TB = null;
function buildTable() {
  const r = mulberry(21), planks = [], stains = [], tapes = [];
  const x0 = -2200, x1 = 2200, y0 = -1400, y1 = 2800, ph = 170, tones = ['#6E5039', '#664A34', '#73553C', '#6A4C35', '#5F4430'];
  for (let y = y0, k = 0; y < y1; y += ph, k++) {
    const grain = new Path2D(), knots = new Path2D();
    for (let g = 0; g < 7; g++) { const gy = y + 14 + g * 22 + r() * 8, amp = 3 + r() * 5, f = .002 + r() * .003, ph0 = r() * 6; grain.moveTo(x0, gy); for (let x = x0; x <= x1; x += 40) grain.lineTo(x, gy + amp * Math.sin(x * f + ph0) + 2 * Math.sin(x * f * 3.7)); }
    for (let q = 0; q < 3; q++) knots.ellipse(x0 + r() * (x1 - x0), y + 30 + r() * (ph - 60), 22 + r() * 18, 7 + r() * 5, 0, 0, 7);
    planks.push({ y, color: tones[k % tones.length], grain, knots });
  }
  const cols = ['#4F9FD0', '#E8553D', '#F2B134', '#2F6E8E', '#7C3E5F', '#D8613F'];
  const avoid = (x, y) => (x > PO[0] - 80 && x < PO[0] + PW + 80 && y > PO[1] - 80 && y < PO[1] + PH + 80) || (x > BAN[0] - 80 && x < BAN[0] + BW + 80 && y > BAN[1] - 80 && y < SPEC[1] + SPEC[3] + 80);
  for (let i = 0; i < 14; i++) {
    let x, y, n = 0; do { x = x0 + 300 + r() * (x1 - x0 - 600); y = y0 + 200 + r() * (y1 - y0 - 400); n++; } while (avoid(x, y) && n < 40);
    const R = 50 + r() * 70, pts = [], m = 11;
    for (let j = 0; j < m; j++) { const an = j / m * 6.283, rr = R * (.65 + .5 * r()) * (j % 3 === 0 ? 1.3 : 1); pts.push([x + Math.cos(an) * rr * 1.25, y + Math.sin(an) * rr * .8]); }
    const path = new Path2D(); pts.forEach((q, j) => { const nq = pts[(j + 1) % m]; if (!j) path.moveTo((q[0] + nq[0]) / 2, (q[1] + nq[1]) / 2); else path.quadraticCurveTo(q[0], q[1], (q[0] + nq[0]) / 2, (q[1] + nq[1]) / 2); });
    path.closePath(); stains.push({ path, col: mix(cols[i % cols.length], TABLE, .5), a: .7 });
  }
  for (let i = 0; i < 9; i++) { let x, y, n = 0; do { x = x0 + 300 + r() * (x1 - x0 - 600); y = y0 + 200 + r() * (y1 - y0 - 400); n++; } while (avoid(x, y) && n < 40); tapes.push({ x, y, w: 60 + r() * 120, h: 22 + r() * 8, a: (r() - .5) * .6, torn: r() < .6, dirty: r() < .5 }); }
  return { planks, stains, tapes, x0, x1, ph };
}
function table() {
  if (!TB) TB = buildTable();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H); ctx.restore();
  for (const p of TB.planks) {
    ctx.fillStyle = p.color; ctx.fillRect(TB.x0, p.y, TB.x1 - TB.x0, TB.ph);
    ctx.fillStyle = 'rgba(35,22,12,.55)'; ctx.fillRect(TB.x0, p.y, TB.x1 - TB.x0, 5); ctx.fillStyle = 'rgba(255,230,190,.07)'; ctx.fillRect(TB.x0, p.y + 5, TB.x1 - TB.x0, 3);
    ctx.save(); ctx.strokeStyle = 'rgba(40,24,12,.22)'; ctx.lineWidth = 2; ctx.stroke(p.grain); ctx.fillStyle = 'rgba(40,24,12,.25)'; ctx.fill(p.knots); ctx.restore();
  }
  for (const s0 of TB.stains) { ctx.save(); ctx.globalAlpha = s0.a; ctx.fillStyle = s0.col; ctx.fill(s0.path); ctx.globalAlpha = s0.a * .5; ctx.translate(-2, -2); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(s0.path); ctx.restore(); }
  for (const tp of TB.tapes) {
    ctx.save(); ctx.translate(tp.x, tp.y); ctx.rotate(tp.a); ctx.fillStyle = tp.dirty ? 'rgba(205,184,140,.75)' : 'rgba(222,204,160,.8)';
    ctx.beginPath(); ctx.moveTo(-tp.w / 2, -tp.h / 2); ctx.lineTo(tp.w / 2, -tp.h / 2);
    if (tp.torn) { for (let k = 0; k <= 5; k++) ctx.lineTo(tp.w / 2 + (k % 2 ? -6 : 3), -tp.h / 2 + tp.h * k / 5); } else ctx.lineTo(tp.w / 2, tp.h / 2);
    ctx.lineTo(-tp.w / 2, tp.h / 2); ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function regTape(x, y, w, h) {
  ctx.fillStyle = '#D9C38A'; const L = 60, th = 16;
  for (const [px, py, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) { ctx.fillRect(Math.min(px, px + sx * L), py + (sy < 0 ? -th : 0) - sy * 2, L, th); ctx.fillRect(px + (sx < 0 ? -th : 0) - sx * 2, Math.min(py, py + sy * L), th, L); }
}
function sheetShadow(x, y, w, h, al = .3) { ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#000'; ctx.fillRect(x + 8, y + 12, w, h); ctx.restore(); }

// ------------------------------------------------------------------ captions: a printed strip (the poster style's subtitle rule)
function wrap(text, maxW) {
  const parts = text.split(/(\*\*)/); let bold = false; const words = [];
  parts.forEach(p => { if (p === '**') { bold = !bold; return; } p.split(/(\s+)/).forEach(w => { if (w && !/^\s+$/.test(w)) words.push({ w, b: bold }); }); });
  const lines = []; let cur = [], cw = 0;
  for (const wd of words) { const m = ctx.measureText(wd.w + ' ').width; if (cw + m > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; } cur.push(wd); cw += m; }
  if (cur.length) lines.push(cur); return lines;
}
function caption(t, pal, stripP) {
  const SX = 120, SY = 1170, SW = 840, SH = 240;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stripP > 0) {
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.fillRect(SX + 8, SY + 12, SW, SH); ctx.restore();
    ink(ctx, { path: rectPath(SX, SY, SW, SH) }, { color: pal.near, reg: [1, .5], clip: stripP < 1 ? wipeRegion([SX, SY, SW, SH], 'right', stripP, 4, 40) : null, sheen: 1 });
  }
  let i = 0; for (let k = 0; k < TLp.length; k++) if (t >= TLp[k].start - .05) i = k;
  if (stripP < 1 || i === TLp.length - 1) return;
  const tp = i === 0 ? 1 : seg(t, TLp[i].start - .05, TLp[i].start + .3); if (tp <= 0) return;
  ctx.save(); ctx.font = '700 48px Outfit'; ctx.letterSpacing = '0px';
  const lines = wrap(TLp[i].cap, 700), lh = 60, y0 = SY + SH / 2 - (lines.length - 1) * lh / 2 + 17;
  const c1 = pickInk(pal.near, ['#FFFFFF', pal.sky1], 4.5), c2 = pickInk(pal.near, [pal.sun, '#F2B134', '#FFD166'], 4.5);
  const clip = tp < 1 ? wipeRegion([SX, SY, SW, SH], 'right', tp, 7, 30) : null;
  [[c1, false], [c2, true]].forEach(([col, bold]) => {
    ink(ctx, { paint: c => {
      c.font = '700 48px Outfit'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      lines.forEach((ln, li) => { const tw = ln.reduce((s, wd) => s + c.measureText(wd.w + ' ').width, 0); let x = SX + SW / 2 - tw / 2; ln.forEach(wd => { const w = c.measureText(wd.w + ' ').width; if (wd.b === bold) c.fillText(wd.w, x, y0 + li * lh); x += w; }); });
    } }, { color: col, reg: [1, .5], clip });
  });
  ctx.restore();
}
function posterOnTable(P, st) { regTape(PO[0], PO[1], PW, PH); sheetShadow(PO[0], PO[1], PW, PH, .22); ctx.save(); ctx.translate(PO[0], PO[1]); drawPoster(ctx, P, st); ctx.restore(); }
// ------------------------------------------------------------------ sections
function floatRow(c0) {   // a row of berries riding a water band across the banner art (the hook: they float)
  const p = new Path2D(); for (let i = 0; i < 16; i++) p.addPath(circlePath(60 + i * 112 + (i % 2) * 20, 316 + (i % 3) * 6, 26 + (i % 2) * 6)); return p;
}
function bannerStage(t) {
  const sky = seg(t, -.45, 1.0), lift = seg(t, 1.0, 1.45), tt = seg(t, 1.2, 1.5), ff = seg(t, 1.35, 1.6);
  const sqX = wipeFront([BAN[0], BAN[1], BW, BH], 'right', sky, 34);
  const k = eo(seg(t, 1.0, 1.65));
  const down = eio(seg(t, a(1) - .2, a(1) + .6));
  const zc = lerp(1.35, 1.2, ss(seg(t, 0, 1.0))), zw = .58;
  let z = lerp(zc, zw, k), cx = lerp(sqX - 120, 0, k), cy = lerp(0, BCY, k);
  z = lerp(z, .56, down);
  z *= 1 + .02 * ss(seg(t, 1.8, a(2)));
  cam(cx, cy, z, lerp(-.03, 0, k)); table();
  const bp = PAL.banner;
  regTape(BAN[0], BAN[1], BW, BH); sheetShadow(BAN[0], BAN[1], BW, BH, .25);
  ctx.save(); ctx.translate(BAN[0], BAN[1]);
  drawBanner(ctx, BANNER_C, { pal: bp, T, sky, title: tt, footer: ff, reg: 1, finish: false });
  // water band + floating berries, printed with the sky pull (the hook picture: a flooded field of red berries)
  if (sky > 0) {
    const clip = sky < 1 ? wipeRegion([0, 0, BW, BH], 'right', sky, 4, 34, 4) : null;
    ctx.save(); ctx.beginPath(); ctx.rect(...BANNER_ART); ctx.clip();
    ink(ctx, { path: rectPath(0, 318, BW, 60) }, { color: bp.mid, reg: [.6, .4], clip, sheen: 1 });
    ink(ctx, { path: floatRow() }, { color: bp.sky2, reg: [1.4, -.6], clip, sheen: 1 });
    ctx.restore();
  }
  inkFinish(ctx, T, 0, 0, BW, BH, .6, 1);
  ctx.restore();
  const wet = 1 - seg(t, 1.0, 1.8);
  if (sky > 0 && wet > 0) { ctx.save(); ctx.globalAlpha = wet; ctx.beginPath(); ctx.rect(BAN[0] + 14, BAN[1] + 14, Math.max(0, sqX - BAN[0] - 14), BANNER_ART[3]); ctx.clip(); const g = ctx.createLinearGradient(sqX - 420, 0, sqX, 0); g.addColorStop(0, 'rgba(255,250,235,0)'); g.addColorStop(1, 'rgba(255,250,235,.3)'); ctx.fillStyle = g; ctx.fillRect(sqX - 420, BAN[1], 420, BH); ctx.restore(); }
  const box = [BAN[0] - 90, BAN[1] - 90, BW + 180, BH + 180];
  const emu = new Path2D(); emu.rect(box[0], box[1], box[2], box[3]); emu.rect(BAN[0] + 14, BAN[1] + 14, BW - 28, BANNER_ART[3]);
  if (lift < 1) screenFrame(ctx, box, { lift: ss(seg(t, 1.0, 1.45)), frame: 40, mesh: 'rgba(236,214,128,.03)', emulsion: emu, emulsionAlpha: .55, meshStep: 3.4, meshLine: 'rgba(70,60,30,.16)' });
  if (t < 1.35) {
    const upx = ss(seg(t, 1.0, 1.35)), x = sqX + 14 + upx * 120, y0 = BAN[1] - 38, y1 = BAN[1] + BH + 38, tn = yy => (yy - y0) / (y1 - y0), BB = BANNER_BANDS;
    ctx.save(); ctx.globalAlpha = 1 - upx;
    squeegee(ctx, [x, y0], [x, y1], [1, 0], { beads: [['sky2', bp.sky2], ['sky1', bp.sky1], ['far', bp.far]].map(([kk, c]) => ({ t0: tn(BAN[1] + BB[kk][0] + 16), t1: tn(BAN[1] + BB[kk][1]), color: c })), seed: 3, scale: 1.25, roll: sqX / 30 });
    ctx.restore();
  }
  if (tt > 0 && tt < 1) { const x = wipeFront([BAN[0], BAN[1] + 20, BW, 330], 'right', tt, 40) + 12; squeegee(ctx, [x, BAN[1] - 38], [x, BAN[1] + BH + 38], [1, 0], { color: bp.near, seed: 5, roll: x / 30, scale: 1.25 }); }
  // the but-turn card: water vs berry, a split-fountain pull of water blues with the berries printed on the line
  const sp = seg(t, a(1) - .1, a(1) + .9), lb = seg(t, a(1) + .9, a(1) + 1.3), WB = ['#BFDDF0', '#7FB6D9', '#3A6FA0', '#24507A'];
  if (t > a(1) - .4) {
    regTape(SPEC[0], SPEC[1], SPEC[2], SPEC[3]); sheetShadow(SPEC[0], SPEC[1], SPEC[2], SPEC[3], .25);
    ctx.save(); ctx.translate(SPEC[0], SPEC[1]); paperSheet(ctx, T, 0, 0, SPEC[2], SPEC[3]);
    const cl = sp < 1 ? wipeRegion([0, 0, SPEC[2], 160], 'right', sp, 6, 40) : null;
    WB.forEach((c, i) => ink(ctx, { path: rectPath(20, 70 + i * 22, SPEC[2] - 40, 20) }, { color: c, reg: [(i % 2) * 1.4 - .7, .5], clip: cl, sheen: 1 }));
    const bob = Math.sin(t * 3) * 4, br = new Path2D(); for (let i = 0; i < 9; i++) br.addPath(circlePath(90 + i * 152, 66 + bob * (i % 2 ? 1 : -1), 40));
    ink(ctx, { path: br }, { color: '#C7243A', reg: [1, -.5], clip: cl, sheen: 1 });
    ink(ctx, { path: rectPath(20, 160, SPEC[2] - 40, 40) }, { color: bp.near, clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    ink(ctx, { paint: c => { c.font = '600 28px Outfit'; c.letterSpacing = '9px'; c.textAlign = 'center'; c.fillText('THEY FLOAT. WHY?', SPEC[2] / 2, 189); } }, { color: pickInk(bp.near, ['#FFFFFF', bp.sky1], 4.5), clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    inkFinish(ctx, T, 0, 0, SPEC[2], SPEC[3], .6, 1);
    ctx.restore();
    if (sp > 0 && sp < 1) { const x = SPEC[0] + wipeFront([0, 0, SPEC[2], 160], 'right', sp, 40) + 10; squeegee(ctx, [x, SPEC[1] + 6], [x, SPEC[1] + 170], [1, 0], { beads: WB.map((c, i) => ({ t0: (64 + i * 22) / 164, t1: Math.min(1, (64 + i * 22 + 20) / 164), color: c })), scale: 1.1, seed: 6, roll: x / 30 }); }
  }
  caption(t, bp, 1);
}
function posterStage(k, t, S) {
  const P = POS[k], pl = PALS[k], PRk = PR[k];
  const tilt = eio(seg(t, S.t0, S.t0 + .85));
  const z0 = .62, cy0 = PO[1] + 750 + 260 / z0, zP = .85, cyP = PO[1] + 1311 - 20 / zP;
  const push = 0;   // no push-in to the band: at a closer zoom the poster header would cross into the top 250 px
  let cx = 0, cy = k === 0 ? lerp(BCY, cy0, tilt) : cy0, z = k === 0 ? lerp(.56, z0, tilt) : z0;
  cy = lerp(cy, cyP, push); z = lerp(z, zP, push);
  z *= 1 + .02 * seg(t, S.t0, S.t1);
  cam(cx, cy, z); table();
  if (k === 0 && tilt < 1) { ctx.save(); ctx.translate(BAN[0], BAN[1]); sheetShadow(0, 0, BW, BH, .25); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore(); }
  const gp = id => { const q = PRk[id]; return q ? seg(t, q[0], q[0] + q[1]) : 0; };
  const st = { pal: pl, T, prog: gp, band: seg(t, BAND[k], BAND[k] + .3), name: seg(t, NAME[k], NAME[k] + .3), header: seg(t, S.t0 + 1.2, S.t0 + 1.7), trail: 0, items: ITEMS[k].map(x => seg(t, x, x + .18)) };
  posterOnTable(P, st);
  if (k === 0) {
    const lift = seg(t, PR[0].berry[0] + 1.0, PR[0].berry[0] + 1.45), box = [PO[0] - 70, PO[1] - 70, PW + 140, PH + 140];
    if (lift < 1) screenFrame(ctx, box, { lift: ss(lift), frame: 44 });
  }
  SQUEEGEE_IDS[k].forEach(id => {
    const q = PRk[id]; if (!q) return; const p = seg(t, q[0], q[0] + q[1]);
    if (p > 0 && p < 1) { const y = PO[1] + wipeFront([0, ART[1] - 60, PW, ART[3] + 120], 'down', clamp(p * 1.35), 30) - 60 + 14; squeegee(ctx, [PO[0] - 30, y], [PO[0] + PW + 30, y], [0, 1], { color: pl[INKOF[id]] || pl.near, seed: q[0] * 10, roll: y / 30, scale: 1.3 }); }
  });
  caption(t, pl, 1);
}
function treeWipe(t, t0, color) {
  const u = seg(t, t0 - .3, t0 + .3); if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const w = W * 1.25, cxw = lerp(W + w / 2 + 120, -w / 2 - 120, ss(u)), x = cxw - w / 2, p = new Path2D(); p.moveTo(x, -20);
  for (let y = -20; y <= H + 20; y += 40) p.lineTo(x - 50 - 70 * hash(y * .37), y);
  for (let y = H + 20; y >= -20; y -= 40) p.lineTo(x + w + 60 + 80 * hash(y * .61 + 3), y);
  p.closePath(); ctx.fillStyle = color; ctx.fill(p); ctx.restore();
}
// wall lockup (visitor-centre wall with the three posters hung)
function wallLayout() {
  const gap = 30, pw = (W - 80 - 2 * gap) / 3, ph = pw * 1.5, bw = 940, bh = BH * bw / BW, top = 330, x0 = 40;
  return { pw, ph, s: pw / PW, bs: bw / BW, bw, bh, banner: [(W - bw) / 2, top], posters: [0, 1, 2].map(i => [x0 + i * (pw + gap), top + bh + 40]) };
}
function wall(t, hi) {
  const L = wallLayout(), wp = { board: '#5E4432', groove: '#3F2C21', rail: '#8A6547' };
  ctx.fillStyle = wp.board; ctx.fillRect(-2000, -2000, 6000, 6000);
  ctx.fillStyle = wp.groove; for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x, -2000, 5, 6000);
  ctx.fillStyle = mix(wp.board, '#ffffff', .07); for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x + 5, -2000, 3, 6000);
  const [bx, by] = L.banner;
  ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#1a120c'; ctx.fillRect(bx + 10, by + 12, L.bw, L.bh); ctx.restore();
  ctx.save(); ctx.translate(bx, by); ctx.scale(L.bs, L.bs); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore();
  POS.forEach((P, i) => {
    const [x, y] = L.posters[i], g = 1 + .05 * hi[i];
    ctx.save(); ctx.translate(x + L.pw / 2, y + L.ph / 2); ctx.scale(g, g); ctx.translate(-L.pw / 2, -L.ph / 2);
    ctx.save(); ctx.globalAlpha = .35 + .1 * hi[i]; ctx.fillStyle = '#1a120c'; ctx.fillRect(12, 14, L.pw, L.ph); ctx.restore();
    ctx.save(); ctx.scale(L.s, L.s); drawPoster(ctx, P, { pal: PALS[i], T }); ctx.restore();
    ctx.fillStyle = '#C9C2B2'; for (const dx of [18, L.pw - 18]) { ctx.beginPath(); ctx.arc(dx, 16, 5, 0, 7); ctx.fill(); }
    ctx.restore();
  });
  return L;
}
function wallStage(t) {
  const L = wallLayout(), k = eio(seg(t, S5.t0 + .3, S5.t0 + 1.9)), [wx, wy] = L.posters[2];
  const from = [wx + L.pw / 2, wy + L.ph * .62, 2.4];
  const cx = lerp(from[0], W / 2, k), cy = lerp(from[1], 800, k), z = Math.exp(lerp(Math.log(from[2]), 0, k));
  cam(cx, cy, z * (1 + .012 * seg(t, S5.t0 + 2, S5.t1)));
  const t0s = [a(14) + .4, a(14) + 1.6, a(14) + 2.8, a(15)];
  const hi = [0, 1, 2].map(i => ss(seg(t, t0s[i], t0s[i] + .25)) * (1 - ss(seg(t, t0s[i + 1] - .2, t0s[i + 1]))));
  wall(t, hi);
  caption(t, PALS[0], 1);
}
// end card printed in two pulls: art (bog bands, water, floating berries) then the standard closing lines, all inside y 300-1150
function endStage(t) {
  const t0 = a(16) - .15, p1 = seg(t, t0, t0 + .8), p2 = seg(t, t0 + .75, t0 + 1.3), pl = PAL.berry;
  cam(W / 2, 800, 1.012); wall(t, [0, 0, 0]);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const M = 40;
  const c1 = wipeRegion([0, 0, W, H], 'right', p1, 3, 60, 8);
  ctx.save(); ctx.clip(c1); paperSheet(ctx, T, 0, 0, W, H, 1.1);
  ctx.save(); ctx.beginPath(); ctx.rect(M, M, W - 2 * M, H - 2 * M); ctx.clip();
  ink(ctx, { path: rectPath(0, 0, W, H) }, { color: pl.sky1, sheen: 1 });
  const top = new Path2D(); top.rect(0, 0, W, 120); top.addPath(bandSteps(0, W, 120, 300, 7, 12));
  ink(ctx, { path: top }, { color: pl.sky2, reg: [1.5, .8], sheen: 1, trap: .4 });
  ink(ctx, { path: rectPath(0, 980, W, 940) }, { color: pl.mid, reg: [-1, 1], sheen: 1, trap: 1 });
  const bob = Math.sin(t * 2.4) * 5, br = new Path2D(); for (let i = 0; i < 9; i++) br.addPath(circlePath(80 + i * 115, 976 + (i % 2 ? bob : -bob), 40 + (i % 3) * 6));
  ink(ctx, { path: br }, { color: pl.sky2, reg: [2, -1], sheen: 1 });
  ctx.restore(); ctx.restore();
  if (p2 > 0) {
    const c2 = p2 < 1 ? wipeRegion([0, 360, W, 560], 'right', p2, 9, 50, 8) : null;
    ink(ctx, { paint: c => { c.textAlign = 'center'; c.font = '900 104px BigShoulders'; c.letterSpacing = '2px'; c.fillStyle = pl.near; c.fillText('FOLLOW FOR MORE OF', W / 2, 500); c.fillStyle = pl.sky2; c.fillText('HOW IT REALLY WORKS.', W / 2, 620);
      c.fillStyle = pl.near; c.fillRect(W / 2 - 330, 665, 660, 6); c.font = '600 44px Outfit'; c.letterSpacing = '1px'; c.fillText("A new 'wait, really?' every day.", W / 2, 750); c.font = '600 38px Outfit'; c.letterSpacing = '5px'; c.fillStyle = pl.mid; c.fillText('@HOWITREALLYWORKSTUDIO', W / 2, 822); } }, { color: pl.near, clip: c2, reg: [1.2, .6] });
  }
  inkFinish(ctx, T, 0, 0, W, H, 1.1, p1 >= 1 ? 1 : 0);
  if (p1 > 0 && p1 < 1) { const x = wipeFront([0, 0, W, H], 'right', p1, 60); const BB = [[pl.sky2, 0, .15], [pl.sky1, .15, .5], [pl.mid, .5, .99]]; squeegee(ctx, [x + 10, -40], [x + 10, H + 40], [1, 0], { beads: BB.map(([c, aa, b]) => ({ t0: aa + .02, t1: b, color: c })), scale: 1.6, seed: 9, roll: x / 30 }); }
  if (p2 > 0 && p2 < 1) { const x = wipeFront([0, 360, W, 560], 'right', p2, 50); squeegee(ctx, [x + 10, 340], [x + 10, 940], [1, 0], { color: pl.near, scale: 1.2, seed: 4, roll: x / 30 }); }
}
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H);
  if (t < S1.t1) bannerStage(t);
  else if (t < S2.t1) posterStage(0, t, S2);
  else if (t < S3.t1) posterStage(1, t, S3);
  else if (t < S4.t1) posterStage(2, t, S4);
  else if (t < S5.t1) wallStage(t);
  else endStage(t);
  treeWipe(t, S3.t0 + .05, PALS[0].near); treeWipe(t, S4.t0 + .05, PALS[1].near); treeWipe(t, S5.t0 + .05, PALS[2].near);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.min(1, (DUR - t) / .35); if (f < 1) { ctx.save(); ctx.globalAlpha = (1 - f) * .3; ctx.fillStyle = '#1a120c'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
window.DUR = DUR;
window.seek = t => render(t); window.render = window.seek;
window.thumb = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0); cam(0, 900, .62); table(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.translate(540 - PW * .78 / 2, 560); ctx.scale(.78, .78); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, PW, PH); ctx.restore(); drawPoster(ctx, POS[1], { pal: PALS[1], T }); ctx.restore();
  ctx.save(); ctx.translate(540 - BW * .56 / 2, 290); ctx.scale(.56, .56); ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.fillRect(10, 14, BW, BH); ctx.restore(); drawBanner(ctx, BANNER_C, { pal: PAL.banner, T }); ctx.restore();
};
window.seek(0); window.ready = true; window.READY = true;