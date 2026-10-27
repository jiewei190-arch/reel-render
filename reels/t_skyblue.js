// t_skyblue.js: "Why the sky is blue, sunsets red, clouds white" in the lemo-opuscar silkscreen-poster style.
// Uses the demo's real engine (styles/silkscreen-poster/engine: silk.js, poster.js, scenes.js) and its grammar:
// print table, squeegee pulls (one ink, one beat), split-fountain bead, screen lift, stepped bands, paper as a colour,
// info band, tree-silhouette transitions, wall lockup, end card printed in two pulls. Vertical 1080x1920, deterministic in t.
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
  banner: { sky1: '#EEF3F0', sky2: '#4F9FD0', far: '#2F6E8E', mid: '#2F6E8E', near: '#173247', sun: '#F2B134', glow: '#CFE3EE' },
  blue: { sky1: '#CFE5F1', sky2: '#4F9FD0', far: '#9CC3D6', mid: '#2F6E8E', near: '#173247', sun: '#F2B134', glow: '#CFE3EE', red: '#E8553D', blueL: '#4F9FD0' },
  dusk: { sky1: '#F4B461', sky2: '#D8613F', far: '#7C3E5F', mid: '#43325A', near: '#1B1B2F', sun: '#FBE3A6', glow: '#F08A5A', red: '#E8553D', blueL: '#7FC4E8' },
  cloud: { sky1: '#EAF3F8', sky2: '#4F93C4', far: '#B9C9D6', mid: '#5B7390', near: '#26364D', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D', blueL: '#4F9FD0' },
};
const T = makeTextures(PAPER, 7);

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
function scene1() {
  const sun = sunParts(770, 300, 74, 2);
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const blue = new Path2D(); blue.rect(-60, -60, PW + 120, 560); blue.addPath(bandSteps(-60, PW + 120, 500, 740, 6, 10));
  const peaks = [[110, 640], [300, 585], [470, 650], [640, 600], [820, 655], [950, 615]];
  const R = range(0, PW, 820, peaks, SEED + 3, 22);
  const sea = rectPath(-60, 760, PW + 120, 900);
  const glints = wavesPath(40, 960, 790, 1100, 18, SEED + 7, 90);
  const near = new Path2D();
  pine(near, 90, 1250, 900, 300, 6); pine(near, 230, 1260, 640, 230, 5); pine(near, 930, 1250, 820, 280, 6); pine(near, 1030, 1260, 980, 300, 7);
  near.addPath(polyPath([[-60, 1090], [160, 1060], [330, 1085], [520, 1110], [720, 1090], [900, 1060], [1060, 1080], [1060, 1600], [-60, 1600]]));
  const mol = new Path2D(), M = [[150, 350], [270, 430], [400, 360], [520, 470], [630, 400], [190, 520], [350, 540], [470, 300], [590, 560], [820, 470], [900, 380], [880, 560], [720, 540], [110, 250]];
  M.forEach(([x, y]) => mol.addPath(circlePath(x, y, 10)));
  const bounce = new Path2D(); M.forEach(([x, y], i) => bounce.addPath(rays(x, y, 8, 20, 62, 7, i * .37, .25, SEED + i)));
  const beam = line(770, 300, 110, 700, 26);
  const thru = new Path2D(); [[-34, 0], [0, 38], [34, 76]].forEach(([dx, dy]) => thru.addPath(line(560 + dx, 380 + dy, 40 + dx, 700 + dy, 9)));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, knock: sun.knock, sub: 0 }] },
    { id: 'sun', parts: [{ ink: 'sun', path: sun.disc, sub: 0 }] },
    { id: 'blue', parts: [{ ink: 'sky2', path: blue, knock: sun.knock, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 480, 790, 26, 11, false), sub: 0 }] },
    { id: 'clouds', parts: [{ ink: 'sky1', path: cloudRow([[40, 450, 1], [690, 560, .8], [330, 600, .7]]), sub: 0 }] },
    { id: 'far', parts: [{ ink: 'far', path: R.path, sub: 0 }, { ink: 'glow', path: facets(peaks, 1, 80, SEED + 11, 12), sub: 1 }] },
    { id: 'sea', parts: [{ ink: 'mid', path: sea, sub: 0 }, { ink: 'sky1', path: glints, sub: 1 }] },
    { id: 'waveB', parts: [{ ink: 'mid', path: wavePath(70, 520, 215, 20, 44, 11), sub: 0 }] },
    { id: 'waveR', parts: [{ ink: 'red', path: wavePath(70, 520, 305, 20, 190, 11), sub: 0 }] },
    { id: 'beam', parts: [{ ink: 'sun', path: beam, sub: 0 }] },
    { id: 'mol', parts: [{ ink: 'near', path: mol, sub: 0 }] },
    { id: 'bounce', parts: [{ ink: 'mid', path: bounce, sub: 0 }] },
    { id: 'thru', parts: [{ ink: 'red', path: thru, sub: 0 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky1', paint: slab('SCATTERING', 1090), sub: 0 }] },
  ] };
}
function scene2() {
  const sun = sunParts(500, 700, 125, 2);
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const bandsA = new Path2D(); bandsA.rect(-60, -60, PW + 120, 500); bandsA.addPath(bandSteps(-60, PW + 120, 440, 760, 7, 12));
  const bandsB = new Path2D(); bandsB.rect(-60, -60, PW + 120, 250); bandsB.addPath(bandSteps(-60, PW + 120, 250, 470, 6, 10));
  const sea = rectPath(-60, 775, PW + 120, 900);
  const glints = new Path2D(); for (let i = 0; i < 11; i++) { const y = 800 + i * 24 + i * i * 1.8, w = 200 - i * 10 + (i % 3) * 20; glints.rect(500 - w / 2 + ((i * 37) % 23) - 11, y, w, 4 + i * .7); }
  const hills = polyPath([[-60, 880], [100, 840], [240, 870], [330, 960], [-60, 1100]]); hills.addPath(polyPath([[1060, 870], [900, 840], [780, 880], [700, 980], [1060, 1120]]));
  const near = new Path2D(); pine(near, 60, 1250, 900, 300, 6); pine(near, 200, 1260, 600, 220, 5); pine(near, 940, 1250, 820, 280, 6);
  near.addPath(polyPath([[-60, 1120], [240, 1090], [520, 1130], [800, 1100], [1060, 1110], [1060, 1600], [-60, 1600]]));
  const beam = dashes(500, 700, 170, 1040, 16, 36, 24);
  const drops = new Path2D(); [[470, 740], [430, 790], [390, 830], [350, 880], [310, 925], [270, 965], [230, 1000]].forEach(([x, y], i) => { drops.addPath(line(x + 18, y - 26, x + 66 - i * 4, y - 110 - i * 6, 8)); drops.addPath(line(x - 18, y + 26, x - 70 + i * 3, y + 98 + i * 5, 8)); });
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, knock: sun.knock, sub: 0 }] },
    { id: 'bandsA', parts: [{ ink: 'sky2', path: bandsA, knock: sun.knock, sub: 0 }] },
    { id: 'bandsB', parts: [{ ink: 'far', path: bandsB, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'glow', path: halftone(-20, PW + 20, 250, 470, 26, 10, true), sub: 0 }] },
    { id: 'clouds', parts: [{ ink: 'glow', path: cloudRow([[60, 330, 1.1], [690, 280, 1], [740, 560, .8]]), sub: 0 }] },
    { id: 'sun', parts: [{ ink: 'sun', path: sun.disc, sub: 0 }] },
    { id: 'sea', parts: [{ ink: 'mid', path: sea, knock: null, sub: 0 }, { ink: 'sun', path: glints, sub: 1 }] },
    { id: 'hills', parts: [{ ink: 'far', path: hills, sub: 0 }] },
    { id: 'beam', parts: [{ ink: 'sun', path: beam, sub: 0 }] },
    { id: 'drops', parts: [{ ink: 'blueL', path: drops, sub: 0 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sun', paint: slab('SUNSET', 1090, 220), sub: 0 }] },
  ] };
}
function scene3() {
  const c1 = cloud(120, 520, [92, 118, 96, 70], [70, 128, 90, 40]);
  const c2 = cloud(640, 330, [58, 74, 52], [34, 78, 28]);
  const c3 = cloud(80, 880, [52, 66, 48], [28, 60, 24]);
  const kn = new Path2D(); [c1, c2, c3].forEach(c => kn.addPath(c.path));
  const flood = rectPath(-60, -60, PW + 120, 1000);
  const top = bandSteps(-60, PW + 120, 640, 900, 5, 8);
  const shade = new Path2D(); [c1, c2, c3].forEach(c => shade.addPath(bottomStrip(c, 30)));
  const drops = new Path2D(); [[250, 410, 40], [350, 360, 36], [450, 420, 44], [330, 470, 34], [500, 340, 34], [190, 460, 30], [420, 485, 30]].forEach(([x, y, r]) => drops.addPath(ringPath(x, y, r - 7, r)));
  const rain = cloud(560, 800, [70, 96, 78, 56], [40, 90, 60, 24]);
  const rainDrops = new Path2D(); for (let i = 0; i < 16; i++) { const x = 590 + (i % 8) * 38 + (i > 7 ? 18 : 0), y = 830 + (i > 7 ? 70 : 0) + (i % 3) * 14; rainDrops.addPath(line(x, y, x - 12, y + 50, 7)); }
  const far = polyPath([[-60, 1000], [120, 940], [260, 975], [420, 930], [610, 985], [780, 940], [940, 990], [1060, 960], [1060, 1600], [-60, 1600]]);
  const near = new Path2D(); pine(near, 70, 1280, 780, 260, 6); pine(near, 200, 1290, 520, 190, 5); pine(near, 930, 1280, 740, 250, 6); pine(near, 1030, 1290, 560, 200, 5);
  near.addPath(polyPath([[-60, 1130], [260, 1100], [540, 1140], [820, 1110], [1060, 1120], [1060, 1600], [-60, 1600]]));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky2', path: flood, knock: kn, sub: 0 }, { ink: 'sky1', path: top, sub: 1 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 640, 960, 26, 11, false), sub: 0 }] },
    { id: 'shade', parts: [{ ink: 'sky1', path: shade, sub: 0 }] },
    { id: 'drops', parts: [{ ink: 'mid', path: drops, sub: 0 }] },
    { id: 'far', parts: [{ ink: 'far', path: far, sub: 0 }] },
    { id: 'rain', parts: [{ ink: 'mid', path: rain.path, sub: 0 }, { ink: 'near', path: rainDrops, sub: 1 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky1', paint: slab('CLOUDS', 1100, 220), sub: 0 }] },
  ] };
}
const mkP = (sc, name, idx, items) => ({ sc, trail: { name }, items, idx, n: 3, paper: PAPER, park: 'How it really works', trailPts: [], trailLen: 0, seed: idx * 13 + 5 });
const POS = [
  mkP(scene1(), 'Why the sky is blue', 0, [{ key: 'a', label: 'BLUE WAVE', value: '~400 NM' }, { key: 'b', label: 'RED WAVE', value: '~700 NM' }, { key: 'c', label: 'SCATTERS MORE', value: 'BLUE' }]),
  mkP(scene2(), 'Why sunsets are red', 1, [{ key: 'a', label: 'LIGHT PATH', value: 'LONGER' }, { key: 'b', label: 'BLUE', value: 'SCATTERED OUT' }, { key: 'c', label: 'LEFT', value: 'RED + ORANGE' }]),
  mkP(scene3(), 'Why clouds are white', 2, [{ key: 'a', label: 'DROPLETS', value: 'MUCH BIGGER' }, { key: 'b', label: 'SCATTER', value: 'ALL COLORS' }, { key: 'c', label: 'LOOKS', value: 'WHITE' }]),
];
const PALS = [PAL.blue, PAL.dusk, PAL.cloud];

// ------------------------------------------------------------------ timeline (all anchored to the voice)
const BAN = [-900, -220], PO = [-500, 560], SPEC = [-700, 300, 1400, 210];
const S1 = { t0: 0, t1: a(2) - .55 }, S2 = { t0: a(2) - .55, t1: a(9) - .1 }, S3 = { t0: a(9) - .1, t1: a(11) - .1 }, S4 = { t0: a(11) - .1, t1: a(13) - .1 }, S5 = { t0: a(13) - .1, t1: a(14) - .15 };
// poster plane pulls: id -> [start, duration]
const PR = [
  { sky: [a(2) + .1, .5], sun: [a(2) + .35, .4], waveB: [a(2) + .3, .5], waveR: [a(2) + 1.9, .6], far: [a(3) - .3, .45], mol: [a(3) + .6, .5], beam: [a(4) + .05, .5], bounce: [a(4) + 1.4, .55], thru: [a(5) + 1.6, .5], blue: [a(2) + .9, .7], halftone: [a(2) + 1.5, .5], clouds: [a(3) + .1, .45], head: [a(8) + 1.4, .5], sea: [a(3) + 1.2, .45], near: [a(8) + .9, .45] },
  { sky: [a(9) + .1, .4], bandsA: [a(9) + .5, .5], bandsB: [a(9) + 1.0, .45], sun: [a(9) + 1.4, .4], sea: [a(9) + 1.9, .45], halftone: [a(9) + .9, .45], clouds: [a(9) + 1.3, .4], head: [a(10) + .6, .5], hills: [a(9) + 2.4, .35], near: [a(9) + 2.8, .4], beam: [a(9) + 3.1, .8], drops: [a(10) + 1.3, .6] },
  { sky: [a(11) + .1, .6], halftone: [a(11) + .5, .5], head: [a(12) + 1.0, .5], shade: [a(11) + 1.0, .4], drops: [a(11) + 2.3, .7], far: [a(11) + 3.4, .4], near: [a(11) + 3.8, .4], rain: [a(12) + 2.2, .7] },
];
const ITEMS = [[a(7) + .5, a(7) + 1.1, a(7) + 1.7], [a(10) + 2.1, a(10) + 2.6, a(10) + 3.1], [a(12) + .1, a(12) + .5, a(12) + .9]];
const BAND = [a(2) + .6, a(9) + .5, a(11) + .3], NAME = [a(2) + 1.0, a(9) + .9, a(11) + .7], PUSH = [a(7) - .2, a(10) + 1.8, a(11) + 4.3];
const INKOF = { sky: 'sky1', blue: 'sky2', far: 'far', sea: 'mid', near: 'near', waveB: 'mid', waveR: 'red', bounce: 'mid', mol: 'near', thru: 'red', beam: 'sun', bandsA: 'sky2', bandsB: 'far', sun: 'sun', hills: 'far', drops: 'blueL', shade: 'sky1', rain: 'mid', halftone: 'sky1', clouds: 'sky1', head: 'sun' };
const SQUEEGEE_IDS = [['sky', 'far', 'sea', 'near', 'blue', 'mol', 'bounce', 'thru', 'beam'], ['sky', 'bandsA', 'bandsB', 'sea', 'hills', 'near', 'beam', 'drops'], ['sky', 'shade', 'drops', 'far', 'near', 'rain']];

// ------------------------------------------------------------------ events for the audio mix (dumped by dump_ev.py)
const EV = [];
const E = (t, k, ...x) => EV.push([k, +t.toFixed(3), ...x]);
E(0, 'whoosh'); E(1.0, 'thud'); E(1.35, 'pop'); E(1.55, 'pop'); E(a(1) + .1, 'whoosh'); E(a(1) + 1.2, 'thud');
PR.forEach((P, k) => { Object.values(P).forEach(([t0]) => E(t0, 'whoosh')); });
ITEMS.forEach(r => r.forEach(t => E(t, 'pop'))); BAND.forEach(t => E(t, 'thud')); NAME.forEach(t => E(t, 'pop'));
[S2.t0 + .2, S3.t0, S4.t0, S5.t0].forEach((t, i) => E(t, i ? 'slide' : 'whoosh'));
E(PR[0].blue[0] + 1.2, 'thud'); E(a(14) + .1, 'whoosh'); E(a(14) + .7, 'thud'); E(a(14) + 1.2, 'chime', 76); E(a(14) + 1.9, 'sparkle');
window.EV = EV;

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
  const SX = 40, SY = 1500, SW = 1000, SH = 330;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stripP > 0) {
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.fillRect(SX + 8, SY + 12, SW, SH); ctx.restore();
    ink(ctx, { path: rectPath(SX, SY, SW, SH) }, { color: pal.near, reg: [1, .5], clip: stripP < 1 ? wipeRegion([SX, SY, SW, SH], 'right', stripP, 4, 40) : null, sheen: 1 });
  }
  let i = -1; for (let k = 0; k < TLp.length; k++) if (t >= TLp[k].start - .05) i = k;
  if (i < 0 || stripP < 1) return;
  const tp = seg(t, TLp[i].start - .05, TLp[i].start + .3); if (tp <= 0) return;
  ctx.save(); ctx.font = '700 52px Outfit'; ctx.letterSpacing = '0px';
  const lines = wrap(TLp[i].cap, SW - 90), lh = 66, y0 = SY + SH / 2 - (lines.length - 1) * lh / 2 + 18;
  const c1 = pickInk(pal.near, ['#FFFFFF', pal.sky1], 4.5), c2 = pickInk(pal.near, [pal.sun, '#F2B134', '#FFD166'], 4.5);
  const clip = tp < 1 ? wipeRegion([SX, SY, SW, SH], 'right', tp, 7, 30) : null;
  [[c1, false], [c2, true]].forEach(([col, bold]) => {
    ink(ctx, { paint: c => {
      c.font = '700 52px Outfit'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      lines.forEach((ln, li) => { const tw = ln.reduce((s, wd) => s + c.measureText(wd.w + ' ').width, 0); let x = SX + SW / 2 - tw / 2; ln.forEach(wd => { const w = c.measureText(wd.w + ' ').width; if (wd.b === bold) c.fillText(wd.w, x, y0 + li * lh); x += w; }); });
    } }, { color: col, reg: [1, .5], clip });
  });
  ctx.restore();
}

// ------------------------------------------------------------------ sections
function bannerStage(t) {
  const sky = seg(t, -.45, 1.0), lift = seg(t, 1.0, 1.45), tt = seg(t, 1.2, 1.5), ff = seg(t, 1.35, 1.6);
  const sqX = wipeFront([BAN[0], BAN[1], BW, BH], 'right', sky, 34);
  const k = eo(seg(t, 1.0, 1.65));
  const down = eio(seg(t, a(1) - .2, a(1) + .6)), up = eio(seg(t, S1.t1 - .1, S1.t1 + .5));
  const zc = lerp(1.35, 1.2, ss(seg(t, 0, 1.0))), zw = .58;
  let z = lerp(zc, zw, k), cx = lerp(sqX - 120, 0, k), cy = lerp(0, 0, k);
  cy = lerp(cy, 190, down); z = lerp(z, .56, down);
  z *= 1 + .02 * ss(seg(t, 1.8, a(2)));
  cam(cx, cy, z, lerp(-.03, 0, k)); table();
  const bp = PAL.banner;
  regTape(BAN[0], BAN[1], BW, BH); sheetShadow(BAN[0], BAN[1], BW, BH, .25);
  ctx.save(); ctx.translate(BAN[0], BAN[1]);
  drawBanner(ctx, { title: 'Why is the sky blue?', footer: 'Sunlight, air and water droplets' }, { pal: bp, T, sky, title: tt, footer: ff, reg: 1 });
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
  // spectrum card (white light = every colour): split-fountain pull of six inks
  const sp = seg(t, a(1) + .1, a(1) + 1.2), lb = seg(t, a(1) + 1.3, a(1) + 1.7), SC = ['#E8553D', '#F28C28', '#F2C230', '#4CA66B', '#2F6FB0', '#7A4FA0'];
  if (t > a(1) - .4) {
    regTape(SPEC[0], SPEC[1], SPEC[2], SPEC[3]); sheetShadow(SPEC[0], SPEC[1], SPEC[2], SPEC[3], .25);
    ctx.save(); ctx.translate(SPEC[0], SPEC[1]); paperSheet(ctx, T, 0, 0, SPEC[2], SPEC[3]);
    const cl = sp < 1 ? wipeRegion([0, 0, SPEC[2], 160], 'right', sp, 6, 40) : null;
    SC.forEach((c, i) => ink(ctx, { path: rectPath(20, 20 + i * 22, SPEC[2] - 40, 20) }, { color: c, reg: [(i % 2) * 1.4 - .7, .5], clip: cl, sheen: 1 }));
    ink(ctx, { path: rectPath(20, 160, SPEC[2] - 40, 40) }, { color: bp.near, clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    ink(ctx, { paint: c => { c.font = '600 28px Outfit'; c.letterSpacing = '9px'; c.textAlign = 'center'; c.fillText('WHITE LIGHT = EVERY COLOR', SPEC[2] / 2, 189); } }, { color: pickInk(bp.near, ['#FFFFFF', bp.sky1], 4.5), clip: lb < 1 ? wipeRegion([20, 160, SPEC[2] - 40, 40], 'right', lb, 3, 30) : null });
    inkFinish(ctx, T, 0, 0, SPEC[2], SPEC[3], .6, 1);
    ctx.restore();
    if (sp > 0 && sp < 1) { const x = SPEC[0] + wipeFront([0, 0, SPEC[2], 160], 'right', sp, 40) + 10; squeegee(ctx, [x, SPEC[1] + 6], [x, SPEC[1] + 170], [1, 0], { beads: SC.map((c, i) => ({ t0: (14 + i * 22) / 164, t1: (14 + i * 22 + 20) / 164, color: c })), scale: 1.1, seed: 6, roll: x / 30 }); }
  }
  caption(t, bp, seg(t, 1.4, 1.9));
}
function posterOnTable(P, st) { regTape(PO[0], PO[1], PW, PH); sheetShadow(PO[0], PO[1], PW, PH, .22); ctx.save(); ctx.translate(PO[0], PO[1]); drawPoster(ctx, P, st); ctx.restore(); }
function posterStage(k, t, S) {
  const P = POS[k], pl = PALS[k], PRk = PR[k];
  const tilt = eio(seg(t, S.t0, S.t0 + .85));
  const tgtY = PO[1] + 750 + 195, z0 = .92;
  const push = k < 2 ? eio(seg(t, PUSH[k] - .2, PUSH[k] + .6)) * (1 - eio(seg(t, [a(8) + .1, a(10) + 3.6][k], [a(8) + .9, a(10) + 4.4][k]))) : 0;
  const bandY = PO[1] + 1310 + 160 / 1.12 - 70;
  let cx = 0, cy = k === 0 ? lerp(190, tgtY, tilt) : tgtY, z = k === 0 ? lerp(.56, z0, tilt) : z0;
  cy = lerp(cy, bandY, push); z = lerp(z, 1.12, push);
  z *= 1 + .015 * seg(t, S.t0, S.t1);
  cam(cx, cy, z); table();
  if (k === 0 && tilt < 1) { ctx.save(); ctx.translate(BAN[0], BAN[1]); sheetShadow(0, 0, BW, BH, .25); drawBanner(ctx, { title: 'Why is the sky blue?', footer: 'Sunlight, air and water droplets' }, { pal: PAL.banner, T }); ctx.restore(); }
  const gp = id => { const q = PRk[id]; return q ? seg(t, q[0], q[0] + q[1]) : (P.sc.planes.find(p => p.id === id) ? 0 : 0); };
  const st = { pal: pl, T, prog: gp, band: seg(t, BAND[k], BAND[k] + .3), name: seg(t, NAME[k], NAME[k] + .3), header: seg(t, S.t0 + 1.2, S.t0 + 1.7), trail: 0, items: ITEMS[k].map(x => seg(t, x, x + .18)) };
  posterOnTable(P, st);
  if (k === 0) {
    const lift = seg(t, PR[0].blue[0] + 1.0, PR[0].blue[0] + 1.45), box = [PO[0] - 70, PO[1] - 70, PW + 140, PH + 140];
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
  ctx.save(); ctx.translate(bx, by); ctx.scale(L.bs, L.bs); drawBanner(ctx, { title: 'Why is the sky blue?', footer: 'Sunlight, air and water droplets' }, { pal: PAL.banner, T }); ctx.restore();
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
  const from = [wx + L.pw / 2, wy + L.ph * .62, 2.4], to = [W / 2, 560 + 430 + 80, 1.0];
  const cx = lerp(from[0], to[0] - 0, k), cy = lerp(from[1], 800, k), z = Math.exp(lerp(Math.log(from[2]), 0, k));
  cam(cx, cy, z * (1 + .012 * seg(t, S5.t0 + 2, S5.t1)));
  const f = seg(t, S5.t0 + 2.0, S5.t1), seg3 = (a(13) + (e(13) - a(13)) * .3), seg6 = (a(13) + (e(13) - a(13)) * .55);
  const hi = [0, 1, 2].map(i => { const t0 = [a(13) + .6, seg3, seg6][i], t1 = [seg3, seg6, e(13)][i]; return ss(seg(t, t0, t0 + .25)) * (1 - ss(seg(t, t1 - .2, t1))); });
  wall(t, hi);
  caption(t, PALS[0], 1);
}
function endStage(t) {
  const t0 = a(14) - .1, p1 = seg(t, t0, t0 + .8), p2 = seg(t, t0 + .75, t0 + 1.3), pl = PAL.blue;
  cam(W / 2, H / 2, 1); wallStageBase(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const M = 40, ART_B = 1180;
  const c1 = wipeRegion([0, 0, W, H], 'right', p1, 3, 60, 8);
  ctx.save(); ctx.clip(c1); paperSheet(ctx, T, 0, 0, W, H, 1.1);
  ctx.save(); ctx.beginPath(); ctx.rect(M, M, W - 2 * M, ART_B - M); ctx.clip();
  ink(ctx, { path: rectPath(0, 0, W, H), knock: ringPath(790, 360, 118, 134) }, { color: pl.sky1, sheen: 1 });
  const top = new Path2D(); top.rect(0, 0, W, 360); top.addPath(bandSteps(0, W, 360, 760, 7, 12));
  ink(ctx, { path: top, knock: circlePath(790, 360, 118) }, { color: pl.sky2, reg: [1.5, .8], sheen: 1, trap: .4 });
  ink(ctx, { path: circlePath(790, 360, 92) }, { color: pl.sun, reg: [3, 1.5], sheen: 1 });
  const far = [[-20, 1180]]; for (let x = 0; x <= W + 40; x += 40) far.push([x, 900 - 90 * Math.abs(Math.sin(x * .004 + .4)) - 40 * Math.abs(Math.sin(x * .013))]); far.push([W + 20, 1180]);
  ink(ctx, { path: polyPath(far) }, { color: pl.far, reg: [-1, 1], sheen: 1, trap: 1 });
  ink(ctx, { path: polyPath([[-20, 1180], [-20, 1030], [260, 960], [520, 1010], [760, 930], [1100, 1000], [1100, 1180]]) }, { color: pl.mid, reg: [1.2, -.8], sheen: 1, trap: 1 });
  ctx.restore();
  ink(ctx, { paint: c => { c.font = '900 150px BigShoulders'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.fillText('HOW IT REALLY', W / 2, 200); c.fillText('WORKS.', W / 2, 330); } }, { color: pickInk([pl.sky1, pl.sky2], [pl.near, pl.mid], 3), reg: [2, -1] });
  ctx.restore();
  if (p2 > 0) {
    const c2 = p2 < 1 ? wipeRegion([0, ART_B, W, H - ART_B], 'right', p2, 9, 50, 8) : null;
    ink(ctx, { path: rectPath(M, ART_B + 12, W - 2 * M, H - ART_B - 12 - M) }, { color: pl.near, clip: c2, sheen: 1 });
    const hi = pickInk(pl.near, [pl.sky1, pl.sun], 4.5);
    ink(ctx, { paint: c => { c.textAlign = 'center'; c.fillStyle = pl.sun; c.font = '900 98px BigShoulders'; c.letterSpacing = '2px'; c.fillText('FOLLOW FOR MORE OF', W / 2, ART_B + 190); c.fillStyle = hi; c.fillText('HOW IT REALLY WORKS.', W / 2, ART_B + 320);
      c.fillStyle = pl.sun; c.fillRect(W / 2 - 330, ART_B + 365, 660, 6); c.fillStyle = hi; c.font = '600 44px Outfit'; c.letterSpacing = '10px'; c.fillText('@HOWITREALLYWORKSTUDIO', W / 2, ART_B + 450); } }, { color: hi, clip: c2, reg: [1.2, .6] });
  }
  inkFinish(ctx, T, 0, 0, W, H, 1.1, p1 >= 1 ? 1 : 0);
  if (p1 > 0 && p1 < 1) { const x = wipeFront([0, 0, W, H], 'right', p1, 60); const BB = [[pl.sky2, 0, .28], [pl.sky1, .28, .5], [pl.far, .5, .6]]; squeegee(ctx, [x + 10, -40], [x + 10, H + 40], [1, 0], { beads: BB.map(([c, aa, b]) => ({ t0: aa + .04, t1: b, color: c })), scale: 1.6, seed: 9, roll: x / 30 }); }
  if (p2 > 0 && p2 < 1) { const x = wipeFront([0, ART_B, W, H - ART_B], 'right', p2, 50); squeegee(ctx, [x + 10, ART_B - 10], [x + 10, H + 40], [1, 0], { color: pl.near, scale: 1.4, seed: 4, roll: x / 30 }); }
}
function wallStageBase(t) { cam(W / 2, 800, 1.012); wall(t, [0, 0, 0]); }

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
}
window.DUR = DUR;
window.seek = t => render(t); window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
