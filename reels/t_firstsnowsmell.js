// t_firstsnowsmell.js: "Can you really smell snow coming?" in the lemo-opuscar silkscreen-poster style (#7).
// Uses the demo's real engine (styles/silkscreen-poster/engine: silk.js, poster.js, scenes.js) and its grammar:
// print table, squeegee pulls (one ink, one beat), stepped bands, paper as a colour, tree-silhouette transitions,
// wall lockup, end card printed in two pulls. Story: an intro poster (the hook) and three clue posters: COLD, DAMP, NERVE.
// Batch N layout: posters framed at 0.72 so the art sits in y 255-1150; the printed caption strip sits at y 1150-1420.
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
  banner: { sky1: '#EEF3F6', sky2: '#7FA7C6', far: '#3E6585', mid: '#3E6585', near: '#1C2E44', sun: '#F2B134', glow: '#DCE8F0' },
  intro: { sky1: '#EAF1F6', sky2: '#86AFCF', far: '#C3D7E6', mid: '#4E7398', near: '#1C2E44', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D', blueL: '#86AFCF' },
  cold: { sky1: '#E9F1F6', sky2: '#5F8DB5', far: '#C9DCEA', mid: '#3F6A92', near: '#1E3149', sun: '#F2B134', glow: '#FFFFFF', red: '#E8553D', blueL: '#8DB4D3' },
  damp: { sky1: '#DDE2E5', sky2: '#7D8C99', far: '#A9B5BF', mid: '#4F5F6E', near: '#26323F', sun: '#E9C46A', glow: '#F1F4F5', red: '#E8553D', blueL: '#9FC3DA' },
  nerve: { sky1: '#F3E4D6', sky2: '#C96F5A', far: '#E8B9A2', mid: '#7C3E5F', near: '#2B1B30', sun: '#F2B134', glow: '#FFF4EA', red: '#E8553D', blueL: '#7FC4E8' },
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
// ------------------------------------------------------------------ four posters: intro (the hook) + three clues
const SEED = 23;
function flakeField(seed, n, x0, x1, y0, y1, rMin, rMax) { const p = new Path2D(), r = mulberry(seed); for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = rMin + r() * (rMax - rMin); for (let k = 0; k < 3; k++) { const an = k * Math.PI / 3 + r() * .2; p.addPath(line(x - Math.cos(an) * s, y - Math.sin(an) * s, x + Math.cos(an) * s, y + Math.sin(an) * s, Math.max(3, s * .28))); } } return p; }
function snowPines(p, list) { list.forEach(([x, y, h, w, n]) => pine(p, x, y, y - h, w, n)); }
function capsOn(list) { const p = new Path2D(); list.forEach(([x, y, h, w]) => { for (let k = 0; k < 3; k++) { const yy = y - h + h * (k + 1) / 4.2, ww = w * (k + 1) / 4.5; p.addPath(polyPath([[x - ww / 2, yy], [x, yy - 20], [x + ww / 2, yy], [x + ww / 3, yy + 10], [x - ww / 3, yy + 10]])); } }); return p; }
function noseProfile(cx, cy, s) { // a big facing-right profile: forehead, nose, lips, chin (one flat ink)
  const P = [[-260, -420], [-60, -440], [60, -380], [90, -250], [120, -150], [210, -10], [220, 30], [120, 40], [140, 90], [110, 120], [130, 170], [90, 230], [-40, 300], [-60, 520], [-420, 520], [-420, -420]];
  return polyPath(P.map(([x, y]) => [cx + x * s, cy + y * s])); }
function scene0() {   // intro: a snowy night poster; flakes fall, a nose sniffs, frozen water = no smell
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const top = new Path2D(); top.rect(-60, -60, PW + 120, 420); top.addPath(bandSteps(-60, PW + 120, 420, 700, 6, 10));
  const peaks = [[90, 760], [260, 690], [430, 770], [600, 700], [780, 760], [930, 710]];
  const R = range(0, PW, 900, peaks, SEED + 3, 22);
  const near = new Path2D(); const PL = [[90, 1210, 360, 120, 6], [220, 1220, 260, 90, 5], [900, 1210, 380, 120, 6], [1010, 1220, 300, 100, 5]]; snowPines(near, PL);
  near.addPath(polyPath([[-60, 1060], [200, 1030], [420, 1060], [640, 1040], [860, 1030], [1060, 1050], [1060, 1600], [-60, 1600]]));
  const snowCaps = capsOn(PL); snowCaps.addPath(polyPath([[-60, 1060], [200, 1030], [420, 1060], [640, 1040], [860, 1030], [1060, 1050], [1060, 1090], [-60, 1090]]));
  const nose = noseProfile(330, 610, .55), sniff = new Path2D(); [[0, 0], [30, -24], [60, -48]].forEach(([dx, dy], i) => sniff.addPath(wavePath(470 + dx, 700 + dx, 560 + dy, 10, 60, 8)));
  const drop = new Path2D(); drop.moveTo(760, 400); drop.bezierCurveTo(820, 480, 840, 520, 840, 560); drop.arc(760, 560, 80, 0, Math.PI); drop.bezierCurveTo(680, 520, 700, 480, 760, 400); drop.closePath();
  const cross = new Path2D(); cross.addPath(line(660, 420, 860, 640, 24)); cross.addPath(line(860, 420, 660, 640, 24));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'top', parts: [{ ink: 'sky2', path: top, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 420, 720, 26, 10, false), sub: 0 }] },
    { id: 'far', parts: [{ ink: 'far', path: R.path, sub: 0 }, { ink: 'glow', path: facets(peaks, 1, 80, SEED + 11, 12), sub: 1 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'caps', parts: [{ ink: 'glow', path: snowCaps, sub: 0 }] },
    { id: 'flakes', parts: [{ ink: 'glow', path: flakeField(SEED + 1, 26, 30, 970, 80, 1000, 10, 22), sub: 0 }] },
    { id: 'nose', parts: [{ ink: 'mid', path: nose, sub: 0 }, { ink: 'sky1', path: sniff, sub: 1 }] },
    { id: 'drop', parts: [{ ink: 'blueL', path: drop, sub: 0 }] },
    { id: 'cross', parts: [{ ink: 'red', path: cross, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'near', paint: slab('SMELL SNOW?', 1010, 170), sub: 0 }] },
  ] };
}
function scene1() {   // COLD: low winter sun, snowy peaks, a few slow molecules with short motion tails
  const sun = sunParts(780, 300, 70, 2);
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const blue = new Path2D(); blue.rect(-60, -60, PW + 120, 520); blue.addPath(bandSteps(-60, PW + 120, 520, 760, 6, 10));
  const peaks = [[110, 700], [300, 620], [480, 690], [660, 610], [840, 690], [960, 640]];
  const R = range(0, PW, 900, peaks, SEED + 5, 22);
  const near = new Path2D(); const PL = [[80, 1220, 330, 110, 6], [210, 1230, 240, 80, 5], [920, 1220, 360, 120, 6]]; snowPines(near, PL);
  near.addPath(polyPath([[-60, 1070], [260, 1050], [520, 1080], [800, 1050], [1060, 1070], [1060, 1600], [-60, 1600]]));
  const caps = capsOn(PL);
  const M = [[200, 330], [380, 420], [560, 300], [300, 520], [620, 470]];
  const mol = new Path2D(), tails = new Path2D(); M.forEach(([x, y], i) => { mol.addPath(circlePath(x, y, 16)); tails.addPath(line(x - 70, y + 6 * (i % 2 ? 1 : -1), x - 24, y, 6)); });
  const few = new Path2D(); [[120, 900], [480, 860], [760, 930]].forEach(([x, y]) => few.addPath(circlePath(x, y, 9)));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, knock: sun.knock, sub: 0 }] },
    { id: 'sun', parts: [{ ink: 'sun', path: sun.disc, sub: 0 }] },
    { id: 'blue', parts: [{ ink: 'sky2', path: blue, knock: sun.knock, sub: 0 }] },
    { id: 'far', parts: [{ ink: 'far', path: R.path, sub: 0 }, { ink: 'glow', path: facets(peaks, 1, 80, SEED + 13, 12), sub: 1 }] },
    { id: 'mol', parts: [{ ink: 'near', path: mol, sub: 0 }] },
    { id: 'tails', parts: [{ ink: 'mid', path: tails, sub: 0 }] },
    { id: 'few', parts: [{ ink: 'red', path: few, sub: 0 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'caps', parts: [{ ink: 'glow', path: caps, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'near', paint: slab('COLD', 1040, 230), sub: 0 }] },
  ] };
}
function scene2() {   // DAMP: heavy snow clouds, humid haze bands, droplet rings
  const c1 = cloud(60, 470, [96, 120, 100, 74], [70, 130, 90, 40]);
  const c2 = cloud(560, 360, [70, 92, 66], [40, 86, 30]);
  const kn = new Path2D(); [c1, c2].forEach(c => kn.addPath(c.path));
  const flood = rectPath(-60, -60, PW + 120, 1000);
  const haze = new Path2D(); haze.addPath(bandSteps(-60, PW + 120, 560, 860, 6, 10));
  const shade = new Path2D(); [c1, c2].forEach(c => shade.addPath(bottomStrip(c, 32)));
  const drops = new Path2D(); [[220, 640, 34], [330, 700, 28], [450, 620, 38], [560, 720, 30], [690, 650, 34], [800, 710, 26], [150, 760, 24]].forEach(([x, y, r]) => drops.addPath(ringPath(x, y, r - 7, r)));
  const far = polyPath([[-60, 960], [140, 900], [300, 930], [460, 890], [640, 945], [820, 900], [1060, 930], [1060, 1600], [-60, 1600]]);
  const near = new Path2D(); const PL = [[70, 1250, 330, 110, 6], [930, 1250, 350, 120, 6], [1030, 1260, 260, 90, 5]]; snowPines(near, PL);
  near.addPath(polyPath([[-60, 1100], [260, 1080], [540, 1110], [820, 1085], [1060, 1100], [1060, 1600], [-60, 1600]]));
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky2', path: flood, knock: kn, sub: 0 }] },
    { id: 'clouds', parts: [{ ink: 'far', path: kn, sub: 0 }] },
    { id: 'shade', parts: [{ ink: 'mid', path: shade, sub: 0 }] },
    { id: 'haze', parts: [{ ink: 'sky1', path: haze, sub: 0 }] },
    { id: 'halftone', parts: [{ ink: 'sky1', path: halftone(-20, PW + 20, 600, 960, 26, 11, false), sub: 0 }] },
    { id: 'drops', parts: [{ ink: 'blueL', path: drops, sub: 0 }] },
    { id: 'far', parts: [{ ink: 'far', path: far, sub: 0 }] },
    { id: 'near', parts: [{ ink: 'near', path: near, sub: 0 }] },
    { id: 'caps', parts: [{ ink: 'glow', path: capsOn(PL), sub: 0 }] },
    { id: 'head', parts: [{ ink: 'near', paint: slab('DAMP', 1040, 230), sub: 0 }] },
  ] };
}
function scene3() {   // NERVE: a big profile, cold air waves into the nose, a nerve branching from it
  const flood = rectPath(-60, -60, PW + 120, 1700);
  const bands = new Path2D(); bands.rect(-60, -60, PW + 120, 300); bands.addPath(bandSteps(-60, PW + 120, 300, 560, 6, 10));
  const face = noseProfile(420, 620, .95);
  const air = new Path2D(); [0, 1, 2].forEach(i => air.addPath(wavePath(660, 980, 560 + i * 60, 14, 80, 12)));
  const nerve = new Path2D(); const pts = [[560, 600], [470, 520], [380, 470], [290, 440]]; for (let i = 0; i < pts.length - 1; i++) nerve.addPath(line(...pts[i], ...pts[i + 1], 14));
  [[470, 520, 430, 600], [380, 470, 330, 540], [470, 520, 520, 430], [380, 470, 400, 380]].forEach(q => nerve.addPath(line(...q, 9)));
  const sensor = new Path2D(); [[560, 600], [600, 640], [585, 560]].forEach(([x, y]) => sensor.addPath(ringPath(x, y, 10, 20)));
  const flakes = flakeField(SEED + 7, 10, 660, 980, 120, 420, 12, 24);
  return { planes: [
    { id: 'sky', parts: [{ ink: 'sky1', path: flood, sub: 0 }] },
    { id: 'bands', parts: [{ ink: 'far', path: bands, sub: 0 }] },
    { id: 'flakes', parts: [{ ink: 'sky1', path: flakes, sub: 0 }] },
    { id: 'face', parts: [{ ink: 'near', path: face, sub: 0 }] },
    { id: 'air', parts: [{ ink: 'blueL', path: air, sub: 0 }] },
    { id: 'sensor', parts: [{ ink: 'sun', path: sensor, sub: 0 }] },
    { id: 'nerve', parts: [{ ink: 'sun', path: nerve, sub: 0 }] },
    { id: 'head', parts: [{ ink: 'sky2', paint: slab('NERVE', 1040, 230), sub: 0 }] },
  ] };
}
const mkP = (sc, name, idx, items) => ({ sc, trail: { name }, items, idx, n: 3, paper: PAPER, park: 'How it really works', trailPts: [], trailLen: 0, seed: idx * 13 + 5 });
const POS = [
  mkP(scene0(), 'Can you smell snow?', 0, [{ key: 'a', label: 'SNOW', value: 'FROZEN WATER' }, { key: 'b', label: 'PURE WATER', value: 'NO SMELL' }, { key: 'c', label: 'SO WHAT IS IT', value: '3 CLUES' }]),
  mkP(scene1(), 'Clue 1: cold', 1, [{ key: 'a', label: 'MOLECULES', value: 'SLOWER' }, { key: 'b', label: 'SMELLS', value: 'FEWER' }, { key: 'c', label: 'SOURCE', value: 'MONELL' }]),
  mkP(scene2(), 'Clue 2: damp', 2, [{ key: 'a', label: 'HUMID AIR', value: 'MORE SENSITIVE' }, { key: 'b', label: 'LATER STUDY', value: 'BARELY' }, { key: 'c', label: 'VERDICT', value: 'SHAKY' }]),
  mkP(scene3(), 'Clue 3: a nerve', 3, [{ key: 'a', label: 'SENSOR', value: 'TRPM8' }, { key: 'b', label: 'NERVE', value: 'TRIGEMINAL' }, { key: 'c', label: 'IT', value: 'FEELS COLD' }]),
];
const PALS = [PAL.intro, PAL.cold, PAL.damp, PAL.nerve];

// ------------------------------------------------------------------ timeline (all anchored to the voice)
const BAN = [-900, -220], PO = [-500, 560], SPEC = [-700, 300, 1400, 210];
const S = [{ t0: -9, t1: a(2) - .2 }, { t0: a(2) - .2, t1: a(4) - .1 }, { t0: a(4) - .1, t1: a(7) - .1 }, { t0: a(7) - .1, t1: a(11) - .1 }];
const S5 = { t0: a(11) - .1, t1: a(14) - .15 };
const PR = [
  { sky: [-3, .5], top: [-2.6, .5], halftone: [-2.2, .4], far: [-1.8, .4], near: [-1.4, .4], caps: [-.9, .4], flakes: [-.35, .9], head: [.75, .5], nose: [a(1) + .1, .5], drop: [a(1) + 1.6, .45], cross: [a(1) + 3.2, .35] },
  { sky: [S[1].t0 + .3, .45], sun: [S[1].t0 + .7, .35], blue: [S[1].t0 + .9, .5], far: [S[1].t0 + 1.3, .4], near: [S[1].t0 + 1.7, .4], caps: [S[1].t0 + 2.0, .35], mol: [a(2) + 2.4, .45], tails: [a(2) + 3.0, .45], head: [a(2) + 1.4, .5], few: [a(3) + 1.6, .5] },
  { sky: [S[2].t0 + .3, .5], clouds: [S[2].t0 + .7, .45], shade: [S[2].t0 + 1.1, .35], head: [S[2].t0 + 1.6, .5], haze: [a(4) + 2.3, .5], halftone: [a(5) + .4, .45], drops: [a(5) + 1.3, .6], far: [a(6) + .4, .4], near: [a(6) + 1.0, .4], caps: [a(6) + 3.0, .35] },
  { sky: [S[3].t0 + .3, .45], bands: [S[3].t0 + .6, .45], flakes: [S[3].t0 + 1.0, .4], face: [a(7) + .8, .55], head: [a(7) + 2.0, .5], air: [a(8) + .2, .6], sensor: [a(8) + 1.6, .4], nerve: [a(9) + .4, .8] },
];
const INKOF = { sky: 'sky1', top: 'sky2', blue: 'sky2', far: 'far', near: 'near', caps: 'glow', flakes: 'glow', head: 'sky1', nose: 'mid', drop: 'blueL', cross: 'red', sun: 'sun', mol: 'near', tails: 'mid', few: 'red', clouds: 'far', shade: 'mid', haze: 'sky1', halftone: 'sky1', drops: 'blueL', bands: 'far', face: 'near', air: 'blueL', sensor: 'sun', nerve: 'sun' };
const SQUEEGEE_IDS = [['near', 'caps', 'flakes', 'nose', 'drop', 'cross'], ['sky', 'blue', 'far', 'near', 'mol', 'tails', 'few'], ['sky', 'clouds', 'haze', 'drops', 'far', 'near'], ['sky', 'bands', 'face', 'air', 'nerve']];

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
  const SX = 40, SY = 1150, SW = 860, SH = 270;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (stripP > 0) {
    ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#000'; ctx.fillRect(SX + 8, SY + 12, SW, SH); ctx.restore();
    ink(ctx, { path: rectPath(SX, SY, SW, SH) }, { color: pal.near, reg: [1, .5], clip: stripP < 1 ? wipeRegion([SX, SY, SW, SH], 'right', stripP, 4, 40) : null, sheen: 1 });
  }
  let i = -1; for (let k = 0; k < TLp.length; k++) if (t >= TLp[k].start - .05) i = k;
  if (i < 0 || stripP < 1) return;
  const tp = seg(t, TLp[i].start - .05, TLp[i].start + .3); if (tp <= 0) return;
  ctx.save(); ctx.font = '700 48px Outfit'; ctx.letterSpacing = '0px';
  const lines = wrap(TLp[i].cap, SW - 90), lh = 60, y0 = SY + SH / 2 - (lines.length - 1) * lh / 2 + 18;
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

function treeWipe(t, t0, color) {
  const u = seg(t, t0 - .3, t0 + .3); if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const w = W * 1.25, cxw = lerp(W + w / 2 + 120, -w / 2 - 120, ss(u)), x = cxw - w / 2, p = new Path2D(); p.moveTo(x, -20);
  for (let y = -20; y <= H + 20; y += 40) p.lineTo(x - 50 - 70 * hash(y * .37), y);
  for (let y = H + 20; y >= -20; y -= 40) p.lineTo(x + w + 60 + 80 * hash(y * .61 + 3), y);
  p.closePath(); ctx.fillStyle = color; ctx.fill(p); ctx.restore();
}

// ------------------------------------------------------------------ sections
function posterOnTable(P, st) { regTape(PO[0], PO[1], PW, PH); sheetShadow(PO[0], PO[1], PW, PH, .22); ctx.save(); ctx.translate(PO[0], PO[1]); drawPoster(ctx, P, st); ctx.restore(); }
// framing (Batch N safe zones): poster at 0.72, top edge at y ~255, art ends above the caption strip (y 1150)
const PZ = .68, PCY = PO[1] + (960 - 340) / PZ;   // poster top at y 340: the table strip above it holds the EP badge
function posterStage(k, t, Sk) {
  const P = POS[k], pl = PALS[k], PRk = PR[k];
  const z = PZ * (1 + .02 * seg(t, Math.max(0, Sk.t0), Sk.t1)), cy = PCY + 20 * Math.sin(t * .4);
  cam(0, cy, z); table();
  const gp = id => { const q = PRk[id]; return q ? seg(t, q[0], q[0] + q[1]) : 0; };
  const st = { pal: pl, T, prog: gp, band: seg(t, Sk.t0 + .9, Sk.t0 + 1.2), name: seg(t, Sk.t0 + 1.1, Sk.t0 + 1.4), header: seg(t, Sk.t0 + .6, Sk.t0 + 1.1), trail: 0, items: [0, 0, 0] };
  if (k === 0) { st.band = 1; st.name = 1; st.header = 1; }
  posterOnTable(P, st);
  SQUEEGEE_IDS[k].forEach(id => {
    const q = PRk[id]; if (!q) return; const p = seg(t, q[0], q[0] + q[1]);
    if (p > 0 && p < 1) { const y = PO[1] + wipeFront([0, ART[1] - 60, PW, ART[3] + 120], 'down', clamp(p * 1.35), 30) - 60 + 14; squeegee(ctx, [PO[0] - 30, y], [PO[0] + PW + 30, y], [0, 1], { color: pl[INKOF[id]] || pl.near, seed: q[0] * 10, roll: y / 30, scale: 1.3 }); }
  });
  caption(t, pl, 1);
}
// wall lockup: banner + the three clue posters; each lights up as the payoff names it
function wallLayout() {
  const gap = 30, pw = (860 - 2 * gap) / 3, ph = pw * 1.5, bw = 860, bh = BH * bw / BW, top = 300, x0 = 40;
  return { pw, ph, s: pw / PW, bs: bw / BW, bw, bh, banner: [40, top], posters: [0, 1, 2].map(i => [x0 + i * (pw + gap), top + bh + 40]) };
}
const BANNER = { title: 'Can you smell snow coming?', footer: 'Cold, damp air and a nerve that feels' };
function wall(t, hi) {
  const L = wallLayout(), wp = { board: '#5E4432', groove: '#3F2C21' };
  ctx.fillStyle = wp.board; ctx.fillRect(-2000, -2000, 6000, 6000);
  ctx.fillStyle = wp.groove; for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x, -2000, 5, 6000);
  ctx.fillStyle = mix(wp.board, '#ffffff', .07); for (let x = -1200; x < 3200; x += 96) ctx.fillRect(x + 5, -2000, 3, 6000);
  const [bx, by] = L.banner;
  ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = '#1a120c'; ctx.fillRect(bx + 10, by + 12, L.bw, L.bh); ctx.restore();
  ctx.save(); ctx.translate(bx, by); ctx.scale(L.bs, L.bs); drawBanner(ctx, BANNER, { pal: PAL.banner, T }); ctx.restore();
  [1, 2, 3].forEach((pi, i) => {
    const [x, y] = L.posters[i], g = 1 + .06 * hi[i];
    ctx.save(); ctx.translate(x + L.pw / 2, y + L.ph / 2); ctx.scale(g, g); ctx.translate(-L.pw / 2, -L.ph / 2);
    ctx.save(); ctx.globalAlpha = .35 + .1 * hi[i]; ctx.fillStyle = '#1a120c'; ctx.fillRect(12, 14, L.pw, L.ph); ctx.restore();
    ctx.save(); ctx.scale(L.s, L.s); drawPoster(ctx, POS[pi], { pal: PALS[pi], T }); ctx.restore();
    ctx.fillStyle = '#C9C2B2'; for (const dx of [18, L.pw - 18]) { ctx.beginPath(); ctx.arc(dx, 16, 5, 0, 7); ctx.fill(); }
    ctx.restore();
  });
  return L;
}
function wallStage(t) {
  const L = wallLayout(), k = eio(seg(t, S5.t0 + .2, S5.t0 + 1.8)), [wx, wy] = L.posters[2];
  const from = [wx + L.pw / 2, wy + L.ph * .5, 2.6], cyTo = 960 - 350 + 300;
  const cx = lerp(from[0], W / 2, k), cy = lerp(from[1], cyTo, k), z = Math.exp(lerp(Math.log(from[2]), 0, k));
  cam(cx, cy, z * (1 + .015 * seg(t, S5.t0 + 2, S5.t1)));
  // payoff (phrase 11): the three posters light up in turn; the question (13) lights all three
  const t0 = a(11), d = (e(11) - a(11)) / 3;
  const hi = [0, 1, 2].map(i => Math.max(ss(seg(t, t0 + i * d, t0 + i * d + .25)) * (1 - ss(seg(t, t0 + (i + 1) * d - .1, t0 + (i + 1) * d + .15))), ss(seg(t, a(13), a(13) + .3))));
  wall(t, hi);
  if (t > a(12) - .1 && t < a(13)) { // a stamp across the wall: SNOW = A FEELING
    const p = seg(t, a(12), a(12) + .35); ctx.save(); ctx.translate(470, 300 + 110); ctx.rotate(-.06); ctx.scale(lerp(1.6, 1, eo(p)), lerp(1.6, 1, eo(p))); ctx.globalAlpha = clamp(p * 3);
    ink(ctx, { path: rectPath(-330, -70, 660, 140) }, { color: '#E8553D', reg: [1.5, .8], sheen: 1 });
    ink(ctx, { paint: c => { c.font = '900 92px BigShoulders'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.fillText('PARTLY A FEELING', 0, 32); } }, { color: '#F2E8D2', reg: [-1, .5] }); ctx.restore();
  }
  caption(t, PALS[1], 1);
}
function endStage(t) {
  const t0 = a(14) - .1, p1 = seg(t, t0, t0 + .8), p2 = seg(t, t0 + .75, t0 + 1.3), pl = PAL.cold;
  cam(W / 2, 1000, 1.012); wall(t, [0, 0, 0]);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const TOP = 340, ART_B = 820, BOT = 1420, CX = 470;
  const c1 = wipeRegion([0, 0, W, H], 'right', p1, 3, 60, 8);
  ctx.save(); ctx.clip(c1); paperSheet(ctx, T, 0, 0, W, H, 1.1);
  ctx.save(); ctx.beginPath(); ctx.rect(40, TOP, W - 80, ART_B - TOP); ctx.clip();
  ink(ctx, { path: rectPath(0, 0, W, H), knock: ringPath(780, 470, 80, 94) }, { color: pl.sky1, sheen: 1 });
  const top = new Path2D(); top.rect(0, 0, W, 470); top.addPath(bandSteps(0, W, 470, 720, 6, 10));
  ink(ctx, { path: top, knock: circlePath(780, 470, 80) }, { color: pl.sky2, reg: [1.5, .8], sheen: 1, trap: .4 });
  ink(ctx, { path: circlePath(780, 470, 62) }, { color: pl.sun, reg: [3, 1.5], sheen: 1 });
  const far = [[-20, ART_B]]; for (let x = 0; x <= W + 40; x += 40) far.push([x, 690 - 70 * Math.abs(Math.sin(x * .004 + .4)) - 30 * Math.abs(Math.sin(x * .013))]); far.push([W + 20, ART_B]);
  ink(ctx, { path: polyPath(far) }, { color: pl.far, reg: [-1, 1], sheen: 1, trap: 1 });
  ink(ctx, { path: flakeField(77, 18, 60, 1000, 360, 640, 9, 18) }, { color: '#FFFFFF', reg: [1, -1] });
  ink(ctx, { path: polyPath([[-20, ART_B], [-20, 720], [260, 680], [520, 720], [760, 670], [1100, 720], [1100, ART_B]]) }, { color: pl.mid, reg: [1.2, -.8], sheen: 1, trap: 1 });
  ctx.restore();
  ctx.restore();
  if (p2 > 0) {
    const c2 = p2 < 1 ? wipeRegion([0, ART_B, W, BOT - ART_B], 'right', p2, 9, 50, 8) : null;
    ink(ctx, { path: rectPath(40, ART_B + 14, W - 80, BOT - ART_B - 14) }, { color: pl.near, clip: c2, sheen: 1 });
    const hi = pickInk(pl.near, [pl.sky1, pl.sun], 4.5);
    ink(ctx, { paint: c => { c.textAlign = 'center'; c.fillStyle = pl.sun; c.font = '900 84px BigShoulders'; c.letterSpacing = '2px'; c.fillText('FOLLOW FOR MORE OF', CX, ART_B + 150); c.fillStyle = hi; c.fillText('HOW IT REALLY WORKS.', CX, ART_B + 255);
      c.fillStyle = pl.sun; c.fillRect(CX - 300, ART_B + 290, 600, 6); c.fillStyle = hi; c.font = '600 42px Outfit'; c.letterSpacing = '0px'; c.fillText("A new 'wait, really?' every day.", CX, ART_B + 375);
      c.font = '600 34px Outfit'; c.letterSpacing = '8px'; c.fillText('@HOWITREALLYWORKSTUDIO', CX, ART_B + 445); } }, { color: hi, clip: c2, reg: [1.2, .6] });
  }
  inkFinish(ctx, T, 0, 0, W, H, 1.1, p1 >= 1 ? 1 : 0);
  if (p1 > 0 && p1 < 1) { const x = wipeFront([0, 0, W, H], 'right', p1, 60); squeegee(ctx, [x + 10, TOP - 30], [x + 10, ART_B + 20], [1, 0], { beads: [{ t0: .02, t1: .5, color: pl.sky2 }, { t0: .5, t1: .98, color: pl.sky1 }], scale: 1.4, seed: 9, roll: x / 30 }); }
  if (p2 > 0 && p2 < 1) { const x = wipeFront([0, ART_B, W, BOT - ART_B], 'right', p2, 50); squeegee(ctx, [x + 10, ART_B - 10], [x + 10, BOT + 30], [1, 0], { color: pl.near, scale: 1.3, seed: 4, roll: x / 30 }); }
}

function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H);
  if (t < S[0].t1) posterStage(0, t, S[0]);
  else if (t < S[1].t1) posterStage(1, t, S[1]);
  else if (t < S[2].t1) posterStage(2, t, S[2]);
  else if (t < S[3].t1) posterStage(3, t, S[3]);
  else if (t < S5.t1) wallStage(t);
  else if (t < DUR - .2) endStage(t);
  else posterStage(0, 0, S[0]);   // loop: the frame-0 poster returns behind the last tree wipe
  treeWipe(t, S[1].t0 + .05, PALS[0].near); treeWipe(t, S[2].t0 + .05, PALS[1].near); treeWipe(t, S[3].t0 + .05, PALS[2].near); treeWipe(t, S5.t0 + .05, PALS[3].near);
  // loop: in the last 0.4 s the frame-0 intro poster wipes back in behind a tree silhouette
  treeWipe(t, DUR - .2, PALS[0].near);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
window.DUR = DUR;
window.seek = t => render(t); window.render = window.seek;
// thumbnail / cover (rule 11): the NERVE poster art with the hook words printed big
window.thumb = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = TABLE; ctx.fillRect(0, 0, W, H);
  const z = .62; cam(0, PO[1] + (960 - 650) / z, z); table();
  posterOnTable(POS[3], { pal: PALS[3], T, prog: () => 1, band: 1, name: 1, header: 1, trail: 0, items: [1, 1, 1] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ink(ctx, { path: rectPath(60, 300, 960, 300) }, { color: PAL.nerve.near, reg: [1.5, .8], sheen: 1 });
  ink(ctx, { paint: c => { c.font = '900 140px BigShoulders'; c.letterSpacing = '4px'; c.textAlign = 'center'; c.fillText('SMELL SNOW?', 540, 455); c.font = '700 60px Outfit'; c.letterSpacing = '0px'; c.fillText("it's partly a feeling", 540, 555); } }, { color: '#F2E8D2', reg: [-1, .5] }); };
window.seek(0); window.ready = true; window.READY = true;
