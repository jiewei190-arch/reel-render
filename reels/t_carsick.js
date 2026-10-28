// t_carsick.js: "Why do you get carsick?" in the cel-boil style (template #11), 1080x1920 portrait, built on H1's hiccups rig.
// Animation language from the cel-boil demo via kit_celboil.js (exposure sheet on ones/twos/threes, new boil per drawing,
// a camera shake on every hic, off-register colour, paper tooth per drawing). Batch N layout: captions at y 1160-1430 kept left of x 900,
// text out of the top 250 px, bottom 480 px and right column; the end dissolves back into frame 0.
// Every frame is a pure function of t (seek).
import * as K from './kit_celboil.js';
const { PAL, clamp, lerp, sstep, E, circlePts, resample, spline, drawingAt, seedFor, seedBg,
  ink, loopInk, paint, hatchInk, spark, star, puff, speedLines, title, camera, drawPaper, drawTooth,
  applyShot, zoomWeight, resetWeight, STAGE, W, H } = K;

const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const SEG = window.TL.p;
const CX = W / 2;
const A = 'styles/celboil/assets/';

// ---------------------------------------------------------------- assets
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
const paperImg = await load(A + 'paper_base.jpg');
const toothImg = await load(A + 'paper_tooth.png');
const dust = [];
for (let k = 1; k <= 4; k++) dust.push(await load(`${A}dust_ink_0${k}.png`));
const PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H;
{
  const p = PAPER.getContext('2d');
  p.fillStyle = PAL.cream; p.fillRect(0, 0, W, H);
  const s = Math.max(W / paperImg.width, H / paperImg.height);
  p.globalAlpha = 0.85;
  p.drawImage(paperImg, (W - paperImg.width * s) / 2, (H - paperImg.height * s) / 2, paperImg.width * s, paperImg.height * s);
  p.globalAlpha = 1;
}
K.setImages({ paper: PAPER, tooth: toothImg, dust });
K.initLayers(1);
await document.fonts.load('600 80px Caveat');
const OTm = await import('opentype');
const OT = OTm.default || OTm;
K.setFont(OT.parse(await (await fetch(A + 'fonts/Caveat.ttf')).arrayBuffer()));

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j);
const TS = (n) => seedFor(CURD, 900 + n);
const BS = (n) => seedBg(CURD, 40 + n);
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ease = (u) => E.io3(clamp(u));
const blinkAt = (lt, p = 2.4) => (lt % p > p - 0.18 ? 1 : 0);

function arrowOn(c, P, col = PAL.ink, k = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 46;
  ink(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 10, color: col, seed: TS(k) });
  ink(c, [[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 10, color: col, seed: TS(k + 1) });
}
function arrow(c, x0, y0, x1, y1, col, k) { ink(c, [[x0, y0], [x1, y1]], { w: 10, color: col, seed: TS(k) }); arrowOn(c, [[x0, y0], [x1, y1]], col, k + 2); }

// capsule outline (vertical), centre (cx, cy), half-width hw, half-length of the straight part hl
function capsule(cx, cy, hw, hl, n = 18) {
  const P = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI + (i / n) * Math.PI; P.push([cx + Math.cos(a) * hw, cy - hl + Math.sin(a) * hw]); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; P.push([cx + Math.cos(a) * hw, cy + hl + Math.sin(a) * hw]); }
  return resample(P, 3, true);
}

// the night wash: a full-bleed indigo cel painted over the paper, with a few boiled stars
function plaque(c, str, cx, cy, size, col, k, o = {}) {
  c.save(); c.font = `700 ${size}px Caveat`; const w = c.measureText(str).width * 1.08 + 70; c.restore();
  const h = size * 1.12, P = resample(rect(cx - w / 2, cy - h / 2, w, h), 3, true);
  paint(c, P, o.bg ?? PAL.cream, { seed: TS(k + 400) }); loopInk(c, P, { seed: TS(k + 401), w: 7 });
  title(c, str, cx, cy, size, col, { seed: TS(k) });
}


// ---------------------------------------------------------------- carsick pieces
const SKIN = '#f6c9a3', SICK = '#b8d98a', SHIRT = '#f2a03d', CAR = '#e2543c', CARSH = '#b83a28', GLASS = '#cfeaf5', FLUID = '#5fb4e8', ROAD = '#6b6670', BLUEC = '#3d8fd1', GREEN = '#6aa84f';
const bump = (lt, f = 2.2) => Math.abs(Math.sin(lt * f * Math.PI)) * (Math.sin(lt * f * 3.1) > .6 ? 1 : .35);
// the kid's head (big, readable): sick = green tint + swirl eyes; look = 'down' (reading) | 'out' | 'front'
function kidHead(c, x, y, s, o = {}) {
  const { k = 0, sick = 0, look = 'front', lt = 0, mouth = 0 } = o; const S = (j) => CS(1200 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const head = ell(0, 0, 120, 112, 48); paint(c, head, sick > .5 ? SICK : SKIN, { seed: S(1) }); hatchInk(c, rect(40, -100, 80, 200), { seed: S(2), gap: 15, ang: -0.9, w: 2 }); loopInk(c, head, { seed: S(3), w: 8 });
  ink(c, [[-80, -80], [-30, -110], [30, -108], [80, -80]], { w: 18, seed: S(4), color: '#4a3328' });
  [-40, 40].forEach((ex, e) => { const ey = look === 'down' ? -6 : -14;
    if (sick > .5) { const P = []; for (let j = 0; j <= 20; j++) { const a = j * .7 + lt * 6 * (e ? 1 : -1), r = j * .9; P.push([ex + Math.cos(a) * r, ey + Math.sin(a) * r]); } ink(c, P, { w: 5, seed: S(5 + e) }); }
    else paint(c, ell(ex + (look === 'out' ? 10 : 0), ey + (look === 'down' ? 8 : 0), 11, 14, 20), PAL.ink, { seed: S(7 + e), reg: false }); });
  if (sick > .5 || mouth > .5) { const P = [[-30, 50], [-15, 40], [0, 50], [15, 40], [30, 50]]; ink(c, P, { w: 7, seed: S(9) }); } else ink(c, [[-20, 44], [0, 56], [20, 44]], { w: 7, seed: S(10) });
  if (sick > .5) for (const sd of [-1, 1]) { const q = ((lt * .8 + (sd > 0 ? .5 : 0)) % 1); paint(c, ell(sd * 130, -40 + q * 60, 10, 14, 14), '#bfe9ff', { seed: S(11 + sd), reg: false }); }
  c.restore();
}
function book(c, x, y, s, k = 0) { const S = (j) => CS(1300 + k, j); c.save(); c.translate(x, y); c.scale(s, s); const L = resample([[-90, -50], [0, -36], [0, 60], [-90, 46]], 3, true), Rr = resample([[0, -36], [90, -50], [90, 46], [0, 60]], 3, true);
  paint(c, L, '#fffaf0', { seed: S(1) }); paint(c, Rr, '#fffaf0', { seed: S(2) }); loopInk(c, L, { seed: S(3), w: 6 }); loopInk(c, Rr, { seed: S(4), w: 6 }); for (let j = 0; j < 4; j++) { ink(c, [[-76, -26 + j * 18], [-14, -18 + j * 18]], { w: 3, seed: S(5 + j) }); ink(c, [[14, -18 + j * 18], [76, -26 + j * 18]], { w: 3, seed: S(9 + j) }); } c.restore(); }
// side-view car with the kid in the back window; bounces on ones, wheels spin
function car(c, x, y, s, lt, o = {}) {
  const { k = 0, sick = 1, look = 'down', front = false, lean = 0 } = o; const S = (j) => CS(1400 + k, j); const b = bump(lt) * 14;
  c.save(); c.translate(x, y - b); c.scale(s, s); c.rotate(lean * .05);
  const body = spline([[-360, 60, 1], [-340, -40], [-200, -60], [-130, -170], [150, -175], [230, -70], [360, -50], [380, 60], [340, 100], [-340, 100]], true, 4);
  paint(c, body, CAR, { seed: S(1) }); hatchInk(c, rect(-360, 30, 740, 70), { seed: S(2), gap: 14, ang: -0.9, w: 2 }); loopInk(c, body, { seed: S(3), w: 9 });
  const win1 = resample([[-110, -150], [10, -152], [10, -68], [-170, -66]], 3, true), win2 = resample([[30, -152], [140, -150], [200, -70], [30, -68]], 3, true);
  paint(c, win1, GLASS, { seed: S(4) }); paint(c, win2, GLASS, { seed: S(5) }); loopInk(c, win1, { seed: S(6), w: 6 }); loopInk(c, win2, { seed: S(7), w: 6 });
  if (!front) { kidHead(c, -60, -110, .42, { k: k + 10, sick, look, lt }); if (look === 'down') book(c, -30, -64, .45, k + 10); }
  else kidHead(c, 110, -110, .42, { k: k + 10, sick, look: 'out', lt });
  for (const wx of [-220, 230]) { c.save(); c.translate(wx, 100 + b / s); const wh = ell(0, 0, 62, 62, 32); paint(c, wh, '#2e2a33', { seed: S(8) }); loopInk(c, wh, { seed: S(9), w: 7 }); c.rotate(lt * 9); for (let j = 0; j < 3; j++) { c.rotate(Math.PI * 2 / 3); ink(c, [[0, 0], [0, 40]], { w: 6, seed: S(10 + j), color: '#b0b0b8' }); } c.restore(); }
  c.restore();
}
function road(c, lt, y = 1060) { paint(c, resample(rect(-60, y, W + 120, 900), 3, true), ROAD, { seed: BS(1), reg: false }); ink(c, [[-20, y], [W + 20, y + 4]], { w: 9, seed: BS(2) });
  for (let j = 0; j < 6; j++) { const x = ((j * 260 - lt * 700) % 1560 + 1560) % 1560 - 240; ink(c, [[x, y + 60], [x + 140, y + 60]], { w: 12, seed: BS(3 + j), color: '#f4e9d0' }); }
  for (let j = 0; j < 5; j++) { const x = ((j * 300 - lt * 260) % 1500 + 1500) % 1500 - 200; const tr = ell(x, y - 120, 60, 80, 20); paint(c, tr, GREEN, { seed: BS(20 + j) }); loopInk(c, tr, { seed: BS(30 + j), w: 6 }); ink(c, [[x, y - 40], [x, y]], { w: 12, seed: BS(40 + j), color: '#7a5a3a' }); } }
// the inner ear's three fluid loops (semicircular canals) + the snail; fluid sloshes with ang
function innerEar(c, x, y, s, ang, k = 0) { const S = (j) => CS(1500 + k, j); c.save(); c.translate(x, y); c.scale(s, s);
  const loops = [[-60, -120, 120, 100, 0], [80, -60, 110, 120, .9], [-10, 60, 130, 90, -.5]];
  loops.forEach(([lx, ly, rx, ry, rot], j) => { c.save(); c.translate(lx, ly); c.rotate(rot); const P = ell(0, 0, rx, ry, 40); ink(c, P.concat([P[0]]), { w: 40, seed: S(1 + j), color: '#f7d7c4' }); ink(c, P.concat([P[0]]), { w: 6, seed: S(4 + j) });
    const sl = Math.sin(ang + j); const A = []; for (let q = 0; q <= 14; q++) { const a = Math.PI * (.2 + .6 * q / 14) + sl * .9; A.push([Math.cos(a) * rx, Math.sin(a) * ry]); } ink(c, A, { w: 26, seed: S(7 + j), color: FLUID }); c.restore(); });
  const sn = []; for (let q = 0; q <= 40; q++) { const a = q * .32, r = 70 - q * 1.5; sn.push([180 + Math.cos(a) * r, 160 + Math.sin(a) * r]); } ink(c, sn, { w: 30, seed: S(10), color: '#f4a7b9' }); ink(c, sn, { w: 5, seed: S(11) });
  c.restore(); }
function bubble(c, str, x, y, size, col, k, j = 0, tailTo = null) { if (k <= 0) return; c.save(); c.font = `700 ${size}px Caveat`; const w = c.measureText(str).width + 80; c.restore(); const h = size * 1.4;
  const P = spline([[x - w / 2, y, 1], [x - w / 2 + 20, y - h / 2], [x + w / 2 - 20, y - h / 2], [x + w / 2, y], [x + w / 2 - 20, y + h / 2], [x - w / 2 + 20, y + h / 2]], true, 4);
  c.save(); c.translate(x, y); c.scale(.5 + .5 * k, .5 + .5 * k); c.translate(-x, -y);
  if (tailTo) { const T = resample([[x - 30, y + h / 2 - 6], tailTo, [x + 20, y + h / 2 - 6]], 3, true); paint(c, T, '#ffffff', { seed: TS(600 + j) }); loopInk(c, T, { seed: TS(601 + j), w: 6 }); }
  paint(c, P, '#ffffff', { seed: TS(602 + j) }); loopInk(c, P, { seed: TS(603 + j), w: 7 }); title(c, str, x, y + 4, size, col, { seed: TS(604 + j) }); c.restore(); }
function eyeChar(c, x, y, s, look = 0, k = 0) { const S = (j) => CS(1600 + k, j); c.save(); c.translate(x, y); c.scale(s, s); const E_ = ell(0, 0, 110, 70, 40); paint(c, E_, '#ffffff', { seed: S(1) }); loopInk(c, E_, { seed: S(2), w: 8 });
  paint(c, ell(look * 30, 10, 40, 40, 30), '#7a5a3a', { seed: S(3), reg: false }); paint(c, ell(look * 30, 10, 18, 18, 20), PAL.ink, { seed: S(4), reg: false }); ink(c, [[-110, -10], [-60, -70], [60, -70], [110, -10]], { w: 9, seed: S(5) }); c.restore(); }
function brain(c, x, y, s, k = 0) { c.save(); c.translate(x, y); c.scale(s, s); const B = spline([[0, -70, 1], [70, -60], [100, 0], [70, 50], [0, 60], [-70, 50], [-100, 0], [-70, -60]], true, 4); paint(c, B, '#f4a7b9', { seed: CS(1700 + k, 1) }); loopInk(c, B, { seed: CS(1700 + k, 2), w: 8 });
  for (let j = 0; j < 4; j++) ink(c, [[-70 + j * 40, -40], [-50 + j * 40, -10], [-70 + j * 40, 20]], { w: 4, seed: CS(1700 + k, 3 + j) }); c.restore(); }
function stamp(c, str, x, y, k, j = 0) { if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(-.12); const sc = 1 + (1 - k) * .6; c.scale(sc, sc); const w = str.length * 44 + 60, P = resample(rect(-w / 2, -50, w, 100), 3, true); loopInk(c, P, { seed: TS(500 + j), w: 10, color: PAL.red }); title(c, str, 0, 4, 80, PAL.red, { seed: TS(501 + j) }); c.restore(); }
function button(c, x, y, s, press, k = 0) { c.save(); c.translate(x, y); c.scale(s, s); const base = resample(rect(-120, 20, 240, 60), 3, true); paint(c, base, '#3a3a48', { seed: CS(1800 + k, 1) }); loopInk(c, base, { seed: CS(1800 + k, 2), w: 7 });
  const top = ell(0, 10 + press * 20, 100, 44, 32); paint(c, top, PAL.red, { seed: CS(1800 + k, 3) }); loopInk(c, top, { seed: CS(1800 + k, 4), w: 7 }); title(c, 'PANIC', 0, 10 + press * 20, 54, '#ffffff', { seed: CS(1800 + k, 5) }); c.restore(); }
const SKY = () => paint(ctx, resample(rect(-60, -60, W + 120, 1200), 3, true), '#d8eef7', { seed: BS(90), reg: false });

// ---------------------------------------------------------------- scenes (captions at y 1160-1430; titles from y 300)
const SC = [];
// 0 hook: frame 0 = a big bouncing car, the kid green and reading in the back; speed lines; plaque
SC[0] = (lt) => { SKY(); road(ctx, lt); car(ctx, 520, 860, 1.25, lt, { k: 1 }); speedLines(ctx, 80, 760, 200, 200, 8, seedFor(CURD, 3), 6); plaque(ctx, 'WHY CARSICK?', 470, 340, 100, PAL.red, 2); };
// 1 not the stomach: senses arguing (ear vs eye bubbles)
SC[1] = (lt, u) => { SKY(); road(ctx, lt); car(ctx, 520, 880, 1.0, lt, { k: 2 }); bubble(ctx, 'MOVING!', 300, 560, 70, BLUEC, sstep(.25, .4, u), 1, [420, 700]); bubble(ctx, 'STILL!', 760, 560, 70, PAL.red, sstep(.45, .6, u), 2, [520, 720]); plaque(ctx, 'SENSES ARGUING', CX, 340, 86, PAL.ink, 3); };
// 2 the inner ear: three fluid loops slosh with every turn
SC[2] = (lt, u) => { innerEar(ctx, 470, 720, 1.6, Math.sin(lt * 2.4) * 1.2, 1); plaque(ctx, 'INNER EAR', CX, 340, 100, BLUEC, 4); title(ctx, 'fluid', 830, 560, 64, BLUEC, { seed: TS(5) }); arrow(ctx, 800, 600, 700, 660, BLUEC, 6); };
// 3 a spirit level for your head
SC[3] = (lt) => { const tilt = Math.sin(lt * 1.8) * .18; ctx.save(); ctx.translate(470, 640); ctx.rotate(tilt); const L = resample(rect(-360, -70, 720, 140), 3, true); paint(ctx, L, '#f2c14e', { seed: TS(10) }); loopInk(ctx, L, { seed: TS(11), w: 9 });
  const V = resample(rect(-180, -36, 360, 72), 3, true); paint(ctx, V, '#c8f0b0', { seed: TS(12) }); loopInk(ctx, V, { seed: TS(13), w: 6 }); paint(ctx, ell(-tilt * 700, 0, 46, 22, 20), '#ffffff', { seed: TS(14), reg: false }); loopInk(ctx, ell(-tilt * 700, 0, 46, 22, 20), { seed: TS(15), w: 5 });
  ink(ctx, [[-40, -36], [-40, 36]], { w: 5, seed: TS(16) }); ink(ctx, [[40, -36], [40, 36]], { w: 5, seed: TS(17) }); ctx.restore();
  ctx.save(); ctx.translate(470, 1000); ctx.rotate(tilt * 1.4); kidHead(ctx, 0, 0, .9, { k: 40, lt }); ctx.restore(); plaque(ctx, 'SPIRIT LEVEL', CX, 340, 96, PAL.ink, 18); };
// 4 back seat: the ear shouts WE'RE MOVING!
SC[4] = (lt, u) => { SKY(); road(ctx, lt); car(ctx, 560, 880, 1.15, lt, { k: 3 }); innerEar(ctx, 220, 560, .55, Math.sin(lt * 3) * 1.4, 2); bubble(ctx, "WE'RE MOVING!", 560, 480, 76, BLUEC, sstep(.3, .45, u), 3, [300, 560]); };
// 5 the eyes on the book say STILL
SC[5] = (lt, u) => { eyeChar(ctx, 320, 640, 1.1, .2 * Math.sin(lt * .5), 1); eyeChar(ctx, 620, 640, 1.1, .2 * Math.sin(lt * .5), 2); book(ctx, 470, 900, 2.4, 5); bubble(ctx, "WE'RE SITTING STILL", 470, 420, 66, PAL.red, sstep(.4, .55, u), 4, [470, 560]); };
// 6 muscles and joints chime in
SC[6] = (lt, u) => { SKY(); road(ctx, lt); car(ctx, 520, 880, 1.0, lt, { k: 4 }); [[180, 520], [470, 470], [760, 520]].forEach(([x, y], j) => { const k = sstep(.1 + j * .2, .3 + j * .2, u); if (k > 0) bubble(ctx, ['knees?', 'neck?', 'hips?'][j], x, y, 58, PAL.ink, k, 10 + j, [480, 760]); }); plaque(ctx, 'MUSCLES + JOINTS', CX, 340, 84, PAL.ink, 19); };
// 7 the brain can't tell who's right
SC[7] = (lt, u) => { brain(ctx, 470, 700, 2.0, 1); innerEar(ctx, 170, 960, .45, Math.sin(lt * 3) * 1.4, 3); eyeChar(ctx, 790, 960, .6, 0, 3); arrow(ctx, 240, 900, 340, 790, BLUEC, 20); arrow(ctx, 720, 900, 610, 790, PAL.red, 23);
  title(ctx, '?', 470 + 10 * Math.sin(lt * 7), 520, 220, PAL.red, { seed: TS(26) }); plaque(ctx, "WHO'S RIGHT?", CX, 340, 100, PAL.ink, 27); };
// 8 sensory conflict: the two arrows clash in a star
SC[8] = (lt, u) => { brain(ctx, 470, 760, 1.6, 2); const cl = sstep(.15, .3, u); arrow(ctx, 120, 560, lerp(120, 400, cl), 600, BLUEC, 30); arrow(ctx, 840, 560, lerp(840, 540, cl), 600, PAL.red, 33); if (cl > .9) star(ctx, 470, 590, 90 + 10 * Math.sin(lt * 9), seedFor(CURD, 36), { fill: PAL.yel });
  plaque(ctx, 'SENSORY CONFLICT', CX, 340, 86, PAL.red, 37); if (u > .55) plaque(ctx, 'most accepted idea', CX, 1030, 56, PAL.ink, 38); };
// 9 why sick? a theory: the brain pulls the POISON? lever
SC[9] = (lt, u) => { brain(ctx, 380, 720, 1.6, 3); const pull = sstep(.55, .7, u); const lv = [[700, 900], [700 + 120 * Math.sin(-.6 + pull * 1.2), 900 - 120 * Math.cos(-.6 + pull * 1.2)]]; const base = resample(rect(640, 900, 120, 60), 3, true); paint(ctx, base, '#3a3a48', { seed: TS(40) }); loopInk(ctx, base, { seed: TS(41), w: 7 });
  ink(ctx, lv, { w: 16, seed: TS(42) }); paint(ctx, ell(lv[1][0], lv[1][1], 26, 26, 20), PAL.red, { seed: TS(43) }); loopInk(ctx, ell(lv[1][0], lv[1][1], 26, 26, 20), { seed: TS(44), w: 6 }); title(ctx, 'POISON?', 720, 700, 70, PAL.red, { seed: TS(45) });
  plaque(ctx, 'WHY FEEL SICK?', CX, 340, 90, PAL.ink, 46); stamp(ctx, 'THEORY', 400, 990, sstep(.3, .45, u), 1); };
// 10 ancestors: a berry that scrambles your senses -> throw up; still a theory
SC[10] = (lt, u) => { paint(ctx, resample(rect(-60, 1000, W + 120, 900), 3, true), '#c9b58a', { seed: BS(50), reg: false }); const bush = ell(250, 860, 170, 140, 30); paint(ctx, bush, GREEN, { seed: TS(50) }); loopInk(ctx, bush, { seed: TS(51), w: 8 });
  for (let j = 0; j < 7; j++) paint(ctx, ell(170 + (j % 4) * 50, 800 + Math.floor(j / 4) * 60, 18, 18, 14), '#7a4ab8', { seed: TS(52 + j), reg: false });
  kidHead(ctx, 640, 720, .9, { k: 20, sick: u > .35 ? 1 : 0, lt }); ink(ctx, [[640, 820], [640, 1000]], { w: 60, seed: TS(60), color: '#a0673a' });
  if (u > .45) puff(ctx, 760, 840, 60, seedFor(CURD, 61), { n: 5, fill: '#cfe8a0' }); plaque(ctx, 'ANCESTOR SAFETY?', CX, 340, 86, PAL.ink, 62); stamp(ctx, 'STILL A THEORY', 470, 1040, sstep(.75, .88, u), 2); };
// 11 kids get it most: a qualitative curve (CDC: rare under 2, peaks around 7-12, then declines); no invented numbers
SC[11] = (lt, u) => { ink(ctx, [[140, 1020], [900, 1020]], { w: 9, seed: TS(70) }); ink(ctx, [[140, 1020], [140, 480]], { w: 9, seed: TS(71) }); title(ctx, 'age', 860, 1075, 54, PAL.ink, { seed: TS(72) });
  const P = []; for (let j = 0; j <= 40; j++) { const x = 160 + j * 18, ag = j / 40 * 20, v = ag < 2 ? .05 : Math.exp(-Math.pow((ag - 9.5) / 4.2, 2)); P.push([x, 1010 - 440 * v * .95 - 20 * (ag > 12 ? .3 : 0)]); }
  const n = Math.max(2, Math.floor(P.length * sstep(0, .5, u))); ink(ctx, P.slice(0, n), { w: 14, seed: TS(73), color: PAL.red });
  if (u > .5) { const B = resample(rect(160 + 14 * 18, 470, 12 * 18 - 14 * 18 + 100, 70), 3, true); title(ctx, '7-12', 160 + 19 * 18, 520, 70, PAL.red, { seed: TS(74) }); }
  title(ctx, 'under 2: rare', 330, 1075, 46, PAL.ink, { seed: TS(75) }); plaque(ctx, 'KIDS GET IT MOST', CX, 340, 92, PAL.red, 95); };
// 12 the fix: make the eyes agree with the ears (handshake)
SC[12] = (lt, u) => { const j = sstep(.2, .6, u); innerEar(ctx, lerp(160, 300, j), 760, .7, Math.sin(lt * 2) * .6, 4); eyeChar(ctx, lerp(820, 660, j), 760, .8, -.6, 4); if (j > .9) star(ctx, 480, 760, 60, seedFor(CURD, 96), { fill: PAL.yel }); plaque(ctx, 'MAKE THEM AGREE', CX, 340, 90, GREEN, 97); };
// 13 sit up front, horizon, phone down
SC[13] = (lt, u) => { SKY(); road(ctx, lt); car(ctx, 520, 880, 1.15, lt, { k: 5, front: true, sick: 0 }); ink(ctx, [[60, 700], [1020, 700]], { w: 6, seed: TS(100), color: BLUEC }); title(ctx, 'horizon', 860, 660, 56, BLUEC, { seed: TS(101) });
  if (u > .6) { const ph = resample(rect(130, 430, 120, 200), 3, true); paint(ctx, ph, '#3a3a48', { seed: TS(102) }); loopInk(ctx, ph, { seed: TS(103), w: 7 }); ink(ctx, [[100, 400], [280, 660]], { w: 16, seed: TS(104), color: PAL.red }); ink(ctx, [[280, 400], [100, 660]], { w: 16, seed: TS(105), color: PAL.red }); }
  plaque(ctx, 'SIT UP FRONT', CX, 340, 96, GREEN, 106); };
// 14 lean into the bends, head still
SC[14] = (lt, u) => { SKY(); road(ctx, lt); const L = Math.sin(lt * 1.6); car(ctx, 520, 880, 1.15, lt, { k: 6, front: true, sick: 0, lean: L }); arrow(ctx, 520 + L * 200, 520, 520 + L * 320, 520, PAL.ink, 110); plaque(ctx, 'LEAN INTO BENDS', CX, 340, 90, PAL.ink, 113); };
// 15 you get used to it: three trips, green -> fine
SC[15] = (lt, u) => { [0, 1, 2].forEach(j => { const k = sstep(j * .25, j * .25 + .15, u); if (k <= 0) return; const x = 200 + j * 280; const cardP = resample(rect(x - 110, 520, 220, 330), 3, true); paint(ctx, cardP, PAL.hi, { seed: TS(120 + j) }); loopInk(ctx, cardP, { seed: TS(125 + j), w: 7 });
  title(ctx, 'trip ' + (j + 1), x, 570, 50, PAL.ink, { seed: TS(130 + j) }); kidHead(ctx, x, 720, .6, { k: 30 + j, sick: j === 0 ? 1 : 0, lt }); }); plaque(ctx, 'GETS USED TO IT', CX, 340, 90, GREEN, 135); };
// 16 payoff: ear vs eyes disagree, the brain slams PANIC
SC[16] = (lt, u) => { innerEar(ctx, 170, 600, .5, Math.sin(lt * 3) * 1.4, 5); eyeChar(ctx, 800, 600, .65, 0, 5); bubble(ctx, 'MOVING!', 200, 420, 54, BLUEC, 1, 20, [200, 520]); bubble(ctx, 'STILL!', 800, 420, 54, PAL.red, 1, 21, [800, 540]);
  brain(ctx, 470, 620, 1.2, 5); const pr = Math.abs(Math.sin(lt * 4)) > .8 ? 1 : 0; button(ctx, 470, 900, 1.2, pr, 1); plaque(ctx, 'MISMATCH = PANIC', CX, 340, 90, PAL.red, 140); };
// 17 the question: carsick? yes / no
SC[17] = (lt, u) => { SKY(); road(ctx, lt); car(ctx, 520, 900, 1.0, lt, { k: 7 }); plaque(ctx, 'YOU?', 300, 560, 100, PAL.ink, 141); plaque(ctx, 'YES', 600, 520, 80, GREEN, 142); plaque(ctx, 'NO', 800, 520, 80, PAL.red, 143); plaque(ctx, 'CARSICK?', CX, 340, 100, PAL.red, 144); };
// 18 end card
SC[18] = (lt) => { const a = sstep(0, 0.4, lt); title(ctx, 'Follow for more of', CX, 330, 100 * a + 20, PAL.ink, { seed: TS(190) }); title(ctx, 'how it really works.', CX, 450, 100 * a + 20, PAL.red, { seed: TS(191) });
  ink(ctx, [[160, 530], [920, 535]], { w: 12, seed: TS(192) }); title(ctx, "A new 'wait, really?' every day.", CX, 610, 56, PAL.ink, { seed: TS(193) }); title(ctx, '@howitreallyworkstudio', CX, 690, 48, '#6b4a3a', { seed: TS(194) });
  road(ctx, lt, 1060); car(ctx, CX, 920, .8, lt, { k: 8, front: true, sick: 0 }); };
const EXPO = [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 3];

// ---------------------------------------------------------------- shots and shakes (every bump shakes the camera)
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 3)); return { s: lerp(1.08, 1.0, k), px: 520, py: 800, X: CX, Y: 800 }; }
  if (i === 7) { const k = ease(clamp(lt / 3)); return { s: lerp(1.0, 1.08, k), px: 470, py: 700, X: CX, Y: 700 }; }
  return STAGE;
}
function shakesFor(i, S) {
  if ([0, 1, 4, 6, 17].includes(i)) { const out = []; for (let q = 0; q < 8; q++) out.push({ t0: (i === 0 ? 0 : S.start) + .2 + q * .9, dur: .25, amp: 9 }); return out; }
  if (i === 8) return [{ t0: S.start + 1.0, dur: .35, amp: 14 }]; if (i === 9) return [{ t0: S.start + 2.6, dur: .3, amp: 12 }]; if (i === 16) return [{ t0: S.start + .8, dur: .3, amp: 12 }, { t0: S.start + 2.4, dur: .3, amp: 12 }]; return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type) in the 1160-1430 band, kept left of x 900
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 70, maxW = 760, lines = []; let cur = [], cw = 0;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  const lh = size * 1.05, bh = lines.length * lh + 36, bw = 840, bx = 60, by = 1430 - bh, mid = bx + bw / 2;   // bottom-aligned at y 1430
  ctx.save(); ctx.globalAlpha = alpha;
  const box = resample(rect(bx, by, bw, bh), 3, true);
  paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 });
  loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = mid - tw / 2; const y = by + 18 + lh * li + lh / 2;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; ctx.fillStyle = wd.b ? PAL.red : PAL.ink; ctx.fillText(wd.w, x, y); x += wd.ww; }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- frame function (+ loop: the last 0.6 s blends at most 40% of frame 0)
function locate(t) { for (let i = 0; i < SEG.length; i++) if (t < SEG[i].end || i === SEG.length - 1) return i; return SEG.length - 1; }
function frameAt(t, cap = true) {
  const i = locate(t); const S = SEG[i]; const dur = S.end - S.start;
  const D = drawingAt(t, EXPO[i], (i + 1) * 10000); CURD = D;
  const lt = clamp(D.tq - (i === 0 ? 0 : S.start), 0, dur + 3); const u = clamp((D.tq - S.start) / dur);
  const cam = camera(D.t1, shakesFor(i, S));
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, cam); ctx.save(); ctx.translate(cam.x, cam.y);
  const shot = shotFor(i, lt); zoomWeight(shot); ctx.save(); applyShot(ctx, shot); SC[i](lt, u); ctx.restore(); resetWeight(); ctx.restore();
  if (cap && i < SEG.length - 1) caption(S.cap, i === 0 ? 1 : sstep(0, 0.2, D.tq - S.start)); drawTooth(ctx, D);
}
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.DUR = window.TL.total;
window.seek = (t) => { const lp = clamp((t - (window.DUR - 0.6)) / 0.6); if (lp > 0) { frameAt(0, true); LOOP.getContext('2d').drawImage(cv, 0, 0); }
  frameAt(t); if (lp > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .4 * lp * lp * (3 - 2 * lp); ctx.drawImage(LOOP, 0, 0); ctx.restore(); } };
// cover: the green kid in the bouncing car
window.thumb = () => { const D = drawingAt(1, 2, 999000); CURD = D; ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0 });
  SKY(); road(ctx, 1); car(ctx, CX, 1000, 1.35, 1, { k: 1 }); plaque(ctx, 'WHY DO YOU', CX, 360, 130, PAL.ink, 130); plaque(ctx, 'GET CARSICK?', CX, 520, 130, PAL.red, 131); drawTooth(ctx, D); };
window.ready = true;
