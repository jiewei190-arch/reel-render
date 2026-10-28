// t_hiccups.js: "Why do we get hiccups?" in the cel-boil style (template #11), 1080x1920 portrait.
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


// ---------------------------------------------------------------- hiccup pieces
const SKIN = '#f6c9a3', SKINSH = '#e3a77e', SHIRT = '#5aa9e6', LUNG = '#f29aa8', DIA = '#e2543c', AIR = '#9fd8f5', NERVE = '#ffcc33', WATERC = '#9fd8f5', TAD = '#6f7d3a';
const hicK = (lt, period = 1.4, ph = 0) => { const p = ((lt + ph) % period + period) % period; return p < 0.12 ? 1 - p / 0.12 : 0; };   // 1 at each hic, decays fast
// the hiccuper: big round head + bean body; cut = cutaway torso (lungs, diaphragm dome, windpipe with the vocal-cord "door")
function buddy(c, x, y, s = 1, o = {}) {
  const { k = 0, hic = 0, cut = false, dia = 0, lungs = 0, door = 0, shrug = 0, lt = 0, mouth = 0, eyes = 1 } = o;
  const S = (j) => CS(1200 + k, j);
  c.save(); c.translate(x, y - hic * 40); c.scale(s * (1 + hic * .04), s * (1 - hic * .06));
  const body = spline([[0, 20, 1], [120, 60], [150, 240], [120, 420], [0, 450], [-120, 420], [-150, 240], [-120, 60]], true, 4);
  paint(c, body, SHIRT, { seed: S(1) }); if (!cut) hatchInk(c, rect(40, 80, 120, 340), { seed: S(2), gap: 14, ang: -0.9, w: 2 });
  if (cut) {
    const torso = spline([[0, 70, 1], [100, 100], [118, 240], [96, 400], [0, 420], [-96, 400], [-118, 240], [-100, 100]], true, 4); paint(c, torso, '#fbe9d8', { seed: S(3), reg: false }); loopInk(c, torso, { seed: S(4), w: 5 });
    ink(c, [[0, -20], [0, 150]], { w: 26, seed: S(5), color: PAL.ink }); ink(c, [[0, -16], [0, 148]], { w: 14, seed: S(6), color: '#f7d7c4' });   // windpipe
    for (const sd of [-1, 1]) { const g = 1 + lungs * .12; const L = spline([[sd * 12, 150, 1], [sd * 70 * g, 140], [sd * 95 * g, 230], [sd * 80 * g, 320 + dia * 30], [sd * 20, 300 + dia * 30]], true, 4); paint(c, L, LUNG, { seed: S(7 + sd) }); loopInk(c, L, { seed: S(9 + sd), w: 5 }); }
    const dy = 340 + dia * 46; const dome = [[-110, dy + 40], [-80, dy - 10], [-30, dy - 34], [30, dy - 34], [80, dy - 10], [110, dy + 40]];
    ink(c, dome, { w: 22, seed: S(12), color: DIA }); ink(c, dome, { w: 6, seed: S(13) });
    // the vocal cords: two flaps across the windpipe, door 0 open .. 1 snapped shut
    for (const sd of [-1, 1]) ink(c, [[sd * 16, 40], [sd * 16 - sd * 16 * door, 50]], { w: 8, seed: S(14 + sd), color: PAL.red });
  }
  loopInk(c, body, { seed: S(16), w: 8 });
  if (!shrug) for (const sd of [-1, 1]) { const sw2 = Math.sin(lt * 3 + sd) * 10 - hic * 50; const A = [[sd * 118, 110], [sd * 175, 220 + sw2], [sd * 160, 330 + sw2]]; ink(c, A, { w: 30, seed: S(30 + sd), color: PAL.ink }); ink(c, A, { w: 20, seed: S(32 + sd), color: SHIRT }); paint(c, ell(sd * 160, 340 + sw2, 22, 22, 16), SKIN, { seed: S(34 + sd) }); loopInk(c, ell(sd * 160, 340 + sw2, 22, 22, 16), { seed: S(36 + sd), w: 5 }); }
  paint(c, resample(rect(-30, -10, 60, 40), 3, true), SKINSH, { seed: S(38) });
  const head = ell(0, -100, 120, 112, 48); paint(c, head, SKIN, { seed: S(17) }); hatchInk(c, rect(40, -200, 80, 200), { seed: S(18), gap: 15, ang: -0.9, w: 2 }); loopInk(c, head, { seed: S(19), w: 8 });
  ink(c, [[-70, -190], [-30, -214], [20, -212], [64, -190]], { w: 16, seed: S(20), color: '#4a3328' }); [[-20, -212, -40, -250], [8, -214, 6, -258], [34, -208, 56, -244]].forEach(([a, b, c2, d], q) => ink(c, [[a, b], [c2, d]], { w: 12, seed: S(40 + q), color: '#4a3328' }));
  [-40, 40].forEach((ex, e) => ink(c, [[ex - 18, -146 - hic * 14], [ex + 16, -150 + (e ? 1 : -1) * hic * 8]], { w: 7, seed: S(44 + e) }));
  [-40, 40].forEach((ex, e) => { if (hic > .3 || eyes === 0) ink(c, [[ex - 14, -118], [ex, -104], [ex + 14, -118]], { w: 7, seed: S(21 + e) }); else { paint(c, ell(ex, -112, 11, 15, 20), PAL.ink, { seed: S(23 + e), reg: false }); c.fillStyle = PAL.hi; c.beginPath(); c.arc(ex + 4, -117, 4, 0, 6.3); c.fill(); } });
  if (hic > .3 || mouth > .5) paint(c, ell(0, -50, 22, 26, 20), PAL.ink, { seed: S(25), reg: false }); else ink(c, [[-20, -56], [0, -44], [20, -56]], { w: 7, seed: S(26) });
  paint(c, ell(-74, -70, 16, 10, 16), '#f29a9a', { seed: S(27), reg: false }); paint(c, ell(74, -70, 16, 10, 16), '#f29a9a', { seed: S(28), reg: false });
  if (shrug > 0) for (const sd of [-1, 1]) ink(c, [[sd * 130, 120], [sd * 200, 60 - shrug * 40], [sd * 230, 0 - shrug * 50]], { w: 16, seed: S(29 + sd), color: SHIRT });
  c.restore();
}
function hicBurst(c, x, y, k, j = 0) { if (k <= .02) return; star(c, x, y, 110 * k + 10, seedFor(CURD, 70 + j), { fill: PAL.yel }); title(c, 'HIC!', x, y, 90 * (0.6 + .4 * k), PAL.red, { seed: TS(70 + j) }); }
function airArrows(c, x, y, k, j = 0) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const yy = y - 40 + i * 40; arrow(c, x - 220 + 60 * k, yy, x - 40, yy + (i - 1) * 10, BLUEC, 900 + j * 10 + i * 3); } }
const BLUEC = '#3d8fd1';
function brain(c, x, y, s, k = 0) { c.save(); c.translate(x, y); c.scale(s, s); const B = spline([[0, -70, 1], [70, -60], [100, 0], [70, 50], [0, 60], [-70, 50], [-100, 0], [-70, -60]], true, 4); paint(c, B, '#f4a7b9', { seed: CS(1300 + k, 1) }); loopInk(c, B, { seed: CS(1300 + k, 2), w: 7 });
  for (let j = 0; j < 4; j++) ink(c, [[-70 + j * 40, -40], [-50 + j * 40, -10], [-70 + j * 40, 20]], { w: 4, seed: CS(1300 + k, 3 + j) }); paint(c, resample(rect(-16, 50, 32, 60), 3, true), '#e98aa0', { seed: CS(1300 + k, 9) }); loopInk(c, resample(rect(-16, 50, 32, 60), 3, true), { seed: CS(1300 + k, 10), w: 5 }); c.restore(); }
function baby(c, x, y, s, o = {}) { const { k = 0, hic = 0, bottle = 0, lt = 0 } = o; const S = (j) => CS(1400 + k, j);
  c.save(); c.translate(x, y - hic * 24); c.scale(s, s * (1 - hic * .05));
  const bod = spline([[0, 0, 1], [80, 20], [96, 110], [60, 170], [-60, 170], [-96, 110], [-80, 20]], true, 4); paint(c, bod, '#fff1c8', { seed: S(1) }); loopInk(c, bod, { seed: S(2), w: 7 });
  const hd = ell(0, -60, 80, 74, 40); paint(c, hd, SKIN, { seed: S(3) }); loopInk(c, hd, { seed: S(4), w: 7 }); ink(c, [[-6, -134], [6, -150], [12, -134]], { w: 6, seed: S(5) });
  [-28, 28].forEach((ex, e) => { if (hic > .3) ink(c, [[ex - 10, -70], [ex, -60], [ex + 10, -70]], { w: 6, seed: S(6 + e) }); else paint(c, ell(ex, -66, 8, 10, 16), PAL.ink, { seed: S(8 + e), reg: false }); });
  if (hic > .3) paint(c, ell(0, -26, 12, 14, 16), PAL.ink, { seed: S(10), reg: false }); else ink(c, [[-12, -30], [0, -22], [12, -30]], { w: 5, seed: S(11) });
  if (bottle > 0) { c.save(); c.translate(70, -10); c.rotate(-.9); const bt = resample(rect(-22, 0, 44, 110), 3, true); paint(c, bt, '#ffffff', { seed: S(12) }); paint(c, resample(rect(-22, 40, 44, 70), 3, true), '#fff6dc', { seed: S(13), reg: false }); loopInk(c, bt, { seed: S(14), w: 6 }); paint(c, ell(0, -12, 14, 18, 16), '#f2b33d', { seed: S(15) }); c.restore(); }
  c.restore(); }
function tadpole(c, x, y, s, lt, o = {}) { const { k = 0, shut = 0, gills = 1 } = o; const S = (j) => CS(1500 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const tail = []; for (let j = 0; j <= 10; j++) tail.push([120 + j * 26, Math.sin(lt * 8 - j * .7) * (6 + j * 3)]);
  const tailP = [...tail.map(([px, py]) => [px, py - 30 + px * .09]), ...tail.slice().reverse().map(([px, py]) => [px, py + 30 - px * .09])]; paint(c, resample(tailP, 3, true), '#8e9b4c', { seed: S(1) }); loopInk(c, resample(tailP, 3, true), { seed: S(2), w: 6 });
  const bod = ell(0, 0, 150, 110, 48); paint(c, bod, TAD, { seed: S(3) }); hatchInk(c, rect(0, -110, 150, 220), { seed: S(4), gap: 14, ang: -0.9, w: 2 }); loopInk(c, bod, { seed: S(5), w: 8 });
  if (gills > 0) for (let g2 = 0; g2 < 3; g2++) { const gx = 70 + g2 * 18, puffA = .6 + .4 * Math.sin(lt * 6 + g2); ink(c, [[gx, 60], [gx + 10, 90 + 20 * puffA], [gx + 22, 66]], { w: 7, seed: S(6 + g2), color: '#c2543c' }); }
  paint(c, ell(-80, -40, 26, 30, 20), '#ffffff', { seed: S(10), reg: false }); loopInk(c, ell(-80, -40, 26, 30, 20), { seed: S(11), w: 5 }); paint(c, ell(-74, -36, 11, 14, 16), PAL.ink, { seed: S(12), reg: false });
  ink(c, [[-150, 20], [-120, 30 - 18 * (1 - shut)], [-96, 22]], { w: 8, seed: S(13) });
  c.restore(); }
function waterBg(c) { paint(c, resample(rect(-60, 260, W + 120, 860), 3, true), '#cdeaf5', { seed: BS(60), reg: false }); for (let j = 0; j < 6; j++) ink(c, [[-20, 300 + j * 140], [W + 20, 304 + j * 140]], { w: 4, seed: BS(61 + j), color: '#9fcfe0' }); }
function stamp(c, str, x, y, k, j = 0) { if (k <= 0) return; c.save(); c.translate(x, y); c.rotate(-.12); const sc = 1 + (1 - k) * .6; c.scale(sc, sc); const w = str.length * 44 + 60, P = resample(rect(-w / 2, -50, w, 100), 3, true); loopInk(c, P, { seed: TS(500 + j), w: 10, color: PAL.red }); title(c, str, 0, 0, 72, PAL.red, { seed: TS(510 + j) }); c.restore(); }
function prop(c, kind, x, y, s, j) { const S = (q) => CS(1600 + j, q); c.save(); c.translate(x, y); c.scale(s, s);
  if (kind === 'bag') { const P = resample([[-70, -100], [70, -100], [80, 100], [-80, 100]], 3, true); paint(c, P, '#d9b47a', { seed: S(1) }); loopInk(c, P, { seed: S(2), w: 7 }); ink(c, [[-70, -80], [70, -80]], { w: 5, seed: S(3) }); }
  if (kind === 'water') { const P = resample([[-60, -100], [60, -100], [46, 100], [-46, 100]], 3, true); paint(c, P, '#e8f6fc', { seed: S(1) }); paint(c, resample([[-56, -50], [56, -50], [46, 100], [-46, 100]], 3, true), WATERC, { seed: S(2), reg: false }); [[-20, -20], [16, 10]].forEach(([a, b], q) => { paint(c, resample(rect(a - 16, b - 16, 32, 32), 3, true), '#ffffff', { seed: S(5 + q) }); loopInk(c, resample(rect(a - 16, b - 16, 32, 32), 3, true), { seed: S(7 + q), w: 4 }); }); loopInk(c, P, { seed: S(3), w: 7 }); }
  if (kind === 'sugar') { ink(c, [[-90, 60], [40, -10]], { w: 14, seed: S(1), color: '#b0b0b8' }); const P = ell(70, -24, 50, 30, 30); paint(c, P, '#d8d8e0', { seed: S(2) }); loopInk(c, P, { seed: S(3), w: 6 }); paint(c, ell(70, -34, 36, 16, 24), '#ffffff', { seed: S(4), reg: false }); }
  if (kind === 'breath') { title(c, 'hold', 0, -30, 70, PAL.ink, { seed: S(1) }); title(c, 'breath', 0, 40, 70, PAL.ink, { seed: S(2) }); }
  c.restore(); }

// ---------------------------------------------------------------- scenes (captions sit at y 1160-1430; titles from y 300)
const SC = [];
const ROOM = () => { paint(ctx, resample(rect(-60, 1080, W + 120, 900), 3, true), '#e8d6b8', { seed: BS(1), reg: false }); ink(ctx, [[-20, 1080], [W + 20, 1084]], { w: 9, seed: BS(2) });
  for (let r = 0; r < 6; r++) ink(ctx, [[-20, 1160 + r * 140], [W + 20, 1163 + r * 140]], { w: 4, seed: BS(10 + r), color: '#c4a77e' }); };
// 0 hook: frame 0 = mid-hiccup, the whole kid jolts on every hic; HIC! burst
SC[0] = (lt) => { ROOM(); const h = hicK(lt, 1.35); buddy(ctx, CX, 720, 1.0, { k: 1, hic: h, lt }); hicBurst(ctx, 790, 470, h, 1); plaque(ctx, 'WHY HICCUPS?', 400, 330, 96, PAL.red, 2); };
// 1 the search question; cut away to the diaphragm
SC[1] = (lt, u) => { ROOM(); const h = hicK(lt, 1.35, .4); buddy(ctx, 500, 700, 1.0, { k: 2, hic: h, cut: u > .45, dia: h, lt }); plaque(ctx, 'WHY DO WE GET HICCUPS?', CX, 330, 78, PAL.ink, 3);
  if (u > .55) { title(ctx, 'diaphragm', 760, 1030, 62, DIA, { seed: TS(4) }); arrow(ctx, 640, 1010, 590, 1000, DIA, 5); } };
// 2 the diaphragm pulls air in (slow, calm breath)
SC[2] = (lt) => { ROOM(); const b = .5 + .5 * Math.sin(lt * 2.2); buddy(ctx, 480, 680, 1.05, { k: 3, cut: true, dia: b, lungs: b, lt }); plaque(ctx, 'THE DIAPHRAGM', CX, 330, 90, DIA, 6); if (b > .5) airArrows(ctx, 480, 640, b, 1); };
// 3 the jerk: on ones, the dome yanks down, air rushes in
SC[3] = (lt, u) => { ROOM(); const h = hicK(lt, 1.0, .1); buddy(ctx, 480, 680, 1.05, { k: 4, cut: true, dia: h * 1.4, lungs: h, hic: h * .5, lt }); airArrows(ctx, 480, 640, h, 2); plaque(ctx, 'JERK!', CX, 330, 110, PAL.red, 7); };
// 4 a thirtieth of a second later: the vocal cords slam shut (throat close-up, doors), HIC!
SC[4] = (lt, u) => { ROOM(); const shut = sstep(.45, .55, (lt % 1.6) / 1.6) * (1 - sstep(.85, .95, (lt % 1.6) / 1.6));
  const tube = resample(rect(300, 360, 300, 700), 3, true); paint(ctx, tube, '#f7d7c4', { seed: TS(30) }); loopInk(ctx, tube, { seed: TS(31), w: 9 });
  for (const sd of [-1, 1]) { const x0 = 450 + sd * 150, x1 = 450 + sd * (110 - 104 * shut); const flap = resample([[x0, 640], [x1, 690 - 30 * (1 - shut)], [x1, 730 - 30 * (1 - shut)], [x0, 780]], 3, true); paint(ctx, flap, PAL.red, { seed: TS(32 + sd) }); loopInk(ctx, flap, { seed: TS(34 + sd), w: 7 }); }
  title(ctx, 'vocal cords', 790, 620, 64, PAL.red, { seed: TS(36) }); title(ctx, 'windpipe', 450, 1010, 54, PAL.ink, { seed: TS(29) }); for (let j = 0; j < 3; j++) { const q = ((lt * 1.2 + j / 3) % 1); if (shut < .5) arrow(ctx, 400 + j * 50, 960 - q * 200, 400 + j * 50, 900 - q * 200, BLUEC, 140 + j * 3); } arrow(ctx, 760, 660, 620, 700, PAL.red, 37);
  if (shut > .9) hicBurst(ctx, 450, 500, 1, 2); if (u > .1) { plaque(ctx, '1/30 s', 780, 900, 80, PAL.ink, 38); } plaque(ctx, 'SNAP SHUT', 450, 330, 96, PAL.red, 39); };
// 5 the reflex loop: diaphragm -> nerves -> brainstem hiccup centre -> back; a spark runs round
SC[5] = (lt, u) => { ROOM(); brain(ctx, 450, 470, 1.2, 1); const dome = [[200, 990], [300, 930], [450, 905], [600, 930], [700, 990]]; ink(ctx, dome, { w: 26, seed: TS(40), color: DIA }); ink(ctx, dome, { w: 7, seed: TS(41) });
  const L = [[450, 560], [640, 640], [660, 820], [560, 930], [450, 905], [340, 930], [240, 820], [260, 640], [450, 560]]; ink(ctx, L, { w: 12, seed: TS(42), color: NERVE }); ink(ctx, L, { w: 4, seed: TS(43) });
  const q = (lt * .5) % 1, n = L.length - 1, x = q * n, a = Math.floor(x), f = x - a, P = [lerp(L[a][0], L[a + 1][0], f), lerp(L[a][1], L[a + 1][1], f)]; star(ctx, P[0], P[1], 40, seedFor(CURD, 44), { fill: PAL.yel });
  title(ctx, 'vagus', 790, 700, 64, PAL.ink, { seed: TS(45) }); title(ctx, 'phrenic', 140, 720, 64, PAL.ink, { seed: TS(46) }); title(ctx, 'hiccup centre', 450, 330, 66, PAL.red, { seed: TS(47) }); plaque(ctx, 'REFLEX LOOP', 450, 1050, 70, PAL.ink, 48); };
// 6 nobody knows what they're for: the kid shrugs, a big question mark
SC[6] = (lt, u) => { ROOM(); buddy(ctx, 380, 700, 1.0, { k: 5, shrug: sstep(.1, .3, u), hic: hicK(lt, 1.6), lt }); title(ctx, '?', 780, 620, 360 + 20 * Math.sin(lt * 4), PAL.red, { seed: TS(50) }); plaque(ctx, 'WHAT ARE THEY FOR?', CX, 330, 84, PAL.ink, 51); };
// 7 babies hiccup a lot (and before birth): crib baby + a tag
SC[7] = (lt, u) => { ROOM(); const crib = resample(rect(140, 760, 600, 260), 3, true); paint(ctx, crib, '#d9b47a', { seed: TS(55) }); loopInk(ctx, crib, { seed: TS(56), w: 8 }); for (let j = 1; j < 8; j++) ink(ctx, [[140 + j * 75, 760], [140 + j * 75, 1020]], { w: 6, seed: TS(57 + j) });
  const h = hicK(lt, 1.1); baby(ctx, 440, 700, 1.25, { k: 1, hic: h, lt }); hicBurst(ctx, 640, 520, h * .8, 3);
  if (u > .3) { const tag = resample(rect(620, 360, 300, 150), 3, true); paint(ctx, tag, PAL.hi, { seed: TS(66) }); loopInk(ctx, tag, { seed: TS(67), w: 7 }); title(ctx, '2.5%', 770, 420, 76, BLUEC, { seed: TS(68) }); title(ctx, 'of their time', 770, 480, 44, PAL.ink, { seed: TS(69) }); }
  if (u > .75) plaque(ctx, 'EVEN IN THE WOMB', 400, 330, 70, PAL.red, 70); };
// 8 idea 1: a burp reflex for suckling babies (bottle, air bubble out, room for milk)
SC[8] = (lt, u) => { ROOM(); baby(ctx, 420, 760, 1.4, { k: 2, bottle: 1, hic: hicK(lt, 1.3), lt }); plaque(ctx, 'IDEA 1: BURP', CX, 330, 96, BLUEC, 72);
  const b = sstep(.35, .7, u); if (b > 0) { puff(ctx, 640 + 60 * b, 520 - 120 * b, 70 * b + 10, seedFor(CURD, 73), { n: 5, fill: '#ffffff' }); title(ctx, 'air out', 700, 380 + 60 * (1 - b), 56, PAL.ink, { seed: TS(74) }); }
  if (u > .75) title(ctx, 'more room for milk', 470, 1050, 60, PAL.red, { seed: TS(75) }); };
// 9 another idea is stranger: dark cut, a spooky reveal of a tadpole's tail
SC[9] = (lt, u) => { paint(ctx, resample(rect(-60, -60, W + 120, H + 120), 3, true), '#20305a', { seed: BS(80), reg: false }); for (let j = 0; j < 8; j++) star(ctx, 100 + j * 120, 360 + (j % 3) * 70, 10, seedFor(CURD, 81 + j), { fill: PAL.yel });
  plaque(ctx, 'IDEA 2...', CX, 520, 120, PAL.red, 82); tadpole(ctx, 1000 - 400 * sstep(.2, 1, u), 900, .9, lt, { k: 1 }); };
// 10 scientists suspect: a leftover from ancestors with gills and lungs, like today's tadpoles
SC[10] = (lt, u) => { waterBg(ctx); tadpole(ctx, 440, 700, 1.5, lt, { k: 2 }); plaque(ctx, 'IDEA 2: GILLS', CX, 330, 96, '#4c6b2a', 84);
  const air = (lt * .7) % 1; paint(ctx, ell(250, 560 - air * 240, 18, 18, 16), '#ffffff', { seed: TS(85), reg: false }); loopInk(ctx, ell(250, 560 - air * 240, 18, 18, 16), { seed: TS(86), w: 4 });
  if (u > .45) { title(ctx, 'gills', 700, 930, 64, '#c2543c', { seed: TS(87) }); arrow(ctx, 660, 890, 600, 820, '#c2543c', 88); title(ctx, 'air', 140, 460, 60, PAL.ink, { seed: TS(89) }); } };
// 11 the gill-pumping rhythm shuts the throat while breathing in: side by side with the kid's hic
SC[11] = (lt, u) => { waterBg(ctx); const sh = sstep(.4, .5, (lt % 1.2) / 1.2) * (1 - sstep(.8, .9, (lt % 1.2) / 1.2));
  tadpole(ctx, 330, 560, .95, lt, { k: 3, shut: sh }); for (let j = 0; j < 3; j++) { const q = ((lt * .9 + j / 3) % 1); arrow(ctx, 80 + q * 60, 560 + (j - 1) * 30, 140 + q * 60, 560 + (j - 1) * 30, BLUEC, 90 + j * 3); }
  buddy(ctx, 760, 760, .6, { k: 6, hic: sh, lt }); hicBurst(ctx, 880, 520, sh * .7, 4); title(ctx, 'throat shuts', 330, 830, 64, PAL.red, { seed: TS(96) }); plaque(ctx, 'SAME RHYTHM?', CX, 330, 90, PAL.ink, 97); };
// 12 neither idea is proven: two plaques stamped
SC[12] = (lt, u) => { ROOM(); plaque(ctx, 'BURP', 300, 560, 100, BLUEC, 100); plaque(ctx, 'GILLS', 680, 560, 100, '#4c6b2a', 101); stamp(ctx, 'NOT PROVEN', 480, 800, sstep(.2, .45, u), 1); };
// 13 the cures: bag, ice water, sugar, hold your breath; NO PROOF stamp
SC[13] = (lt, u) => { ROOM(); [['bag', 200, 620], ['water', 440, 620], ['sugar', 700, 620], ['breath', 440, 900]].forEach(([kd, x, y], j) => { if (u > j * .12) prop(ctx, kd, x, y + Math.sin(lt * 3 + j) * 6, 1.1, j); });
  plaque(ctx, 'HICCUP CURES?', CX, 330, 90, PAL.ink, 104); stamp(ctx, 'NO PROOF', 520, 760, sstep(.5, .7, u), 2); };
// 14 more than two days: see a doctor (calendar + stethoscope)
SC[14] = (lt, u) => { ROOM(); const cal = resample(rect(170, 480, 300, 340), 3, true); paint(ctx, cal, PAL.hi, { seed: TS(110) }); paint(ctx, resample(rect(170, 480, 300, 80), 3, true), PAL.red, { seed: TS(111) }); loopInk(ctx, cal, { seed: TS(112), w: 8 }); title(ctx, '2', 320, 690, 200, PAL.ink, { seed: TS(113) }); title(ctx, 'days', 320, 790, 56, PAL.ink, { seed: TS(114) });
  const st = [[620, 480], [600, 620], [660, 760], [760, 760], [800, 640], [780, 520]]; ink(ctx, st, { w: 14, seed: TS(115), color: '#3a3a48' }); paint(ctx, ell(700, 860, 50, 50, 30), '#b0b0b8', { seed: TS(116) }); loopInk(ctx, ell(700, 860, 50, 50, 30), { seed: TS(117), w: 7 }); ink(ctx, [[700, 810], [710, 760]], { w: 10, seed: TS(118), color: '#3a3a48' });
  plaque(ctx, 'SEE A DOCTOR', CX, 330, 96, PAL.red, 119); };
// 15 the question: your cure? one word (kid with a glass)
SC[15] = (lt, u) => { ROOM(); buddy(ctx, 400, 700, 1.0, { k: 7, hic: hicK(lt, 1.5), lt }); prop(ctx, 'water', 720, 760, .9, 9); plaque(ctx, 'YOUR CURE?', CX, 330, 110, PAL.red, 120); title(ctx, 'one word', 720, 560, 60, PAL.ink, { seed: TS(121) }); };
// 16 end card: main line + standard second line + handle; the kid hics again (loop)
SC[16] = (lt) => { const a = sstep(0, 0.4, lt); title(ctx, 'Follow for more of', CX, 330, 100 * a + 20, PAL.ink, { seed: TS(190) }); title(ctx, 'how it really works.', CX, 450, 100 * a + 20, PAL.red, { seed: TS(191) });
  ink(ctx, [[160, 530], [920, 535]], { w: 12, seed: TS(192) }); title(ctx, "A new 'wait, really?' every day.", CX, 610, 56, PAL.ink, { seed: TS(193) }); title(ctx, '@howitreallyworkstudio', CX, 690, 48, '#6b4a3a', { seed: TS(194) });
  ROOM(); const h = hicK(lt, 1.35); buddy(ctx, CX, 860, .7, { k: 8, hic: h, lt }); hicBurst(ctx, 760, 800, h * .7, 5); };
const EXPO = [1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 3];

// ---------------------------------------------------------------- shots and shakes (every hic shakes the camera)
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 3)); return { s: lerp(1.12, 1.0, k), px: CX, py: 700, X: CX, Y: 700 }; }
  if (i === 4) { const k = ease(clamp(lt / 2)); return { s: lerp(1.0, 1.08, k), px: 450, py: 700, X: CX, Y: 700 }; }
  return STAGE;
}
function shakesFor(i, S) {
  const st = (i === 0 ? 0 : S.start), per = { 0: 1.35, 1: 1.35, 3: 1.0, 6: 1.6, 7: 1.1, 16: 1.35 }[i]; const ph = { 1: .4, 3: .1 }[i] || 0;
  if (!per) { if (i === 4) return [{ t0: S.start + 0.75, dur: 0.35, amp: 14 }, { t0: S.start + 2.35, dur: 0.35, amp: 14 }]; if (i === 12) return [{ t0: S.start + .5, dur: .3, amp: 10 }]; return []; }
  const out = []; for (let q = 0; q < 8; q++) { const t0 = st + q * per - ph + (q === 0 && ph ? per : 0); if (t0 < S.end + 1) out.push({ t0, dur: 0.3, amp: 12 }); } return out;
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
  const lh = size * 1.05, bh = lines.length * lh + 36, bw = 840, bx = 60, by = 1160, mid = bx + bw / 2;
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

// ---------------------------------------------------------------- frame function (+ loop: the last 0.6 s dissolves back into frame 0)
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
  frameAt(t); if (lp > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = lp * lp * (3 - 2 * lp); ctx.drawImage(LOOP, 0, 0); ctx.restore(); } };
// cover: the kid mid-hic with a big burst
window.thumb = () => { const D = drawingAt(1, 2, 999000); CURD = D; ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0 });
  ROOM(); buddy(ctx, CX, 980, 1.3, { k: 1, hic: 1 }); hicBurst(ctx, 780, 760, 1, 9);
  plaque(ctx, 'WHY DO WE', CX, 360, 130, PAL.ink, 130); plaque(ctx, 'HICCUP?', CX, 520, 150, PAL.red, 131); drawTooth(ctx, D); };
window.ready = true;
