// t_popcorn.js: "Why does popcorn pop?" in the cel-boil style (template #11), 1080x1920 portrait.
// Animation language from the cel-boil demo via kit_celboil.js (exposure sheet on ones/twos/threes, new boil per drawing,
// shakes on snap/crack/flash, off-register colour, paper tooth per drawing). Batch N layout: captions at y 1160-1420, text out of the top 250 px, bottom 480 px and right column; loop ending.
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

// exposure per scene: snap, crack, burst and flash on ones; diagrams on twos; the closing card on threes
// exposure per scene: pop, crack, burst on ones; diagrams on twos; the end card on threes
const EXPO = [1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 3];
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
function thermo(c, x, y, s, lvl, col, k) {
  const S = (j) => CS(1100 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const tube = capsule(0, -60, 26, 120, 10), bulb = ell(0, 120, 48, 48, 36);
  paint(c, tube, PAL.hi, { seed: S(1) });
  paint(c, resample(rect(-14, 120 - 280 * lvl, 28, 280 * lvl), 3, true), col, { seed: S(2), reg: false });
  paint(c, bulb, col, { seed: S(3) });
  loopInk(c, tube, { seed: S(4), w: 7 }); loopInk(c, bulb, { seed: S(5), w: 7 });
  for (let j = 0; j < 5; j++) ink(c, [[26, -150 + j * 50], [46, -150 + j * 50]], { w: 5, seed: S(6 + j) });
  c.restore();
}
function plaque(c, str, cx, cy, size, col, k, o = {}) {
  c.save(); c.font = `700 ${size}px Caveat`; const w = c.measureText(str).width * 1.08 + 70; c.restore();
  const h = size * 1.12, P = resample(rect(cx - w / 2, cy - h / 2, w, h), 3, true);
  paint(c, P, o.bg ?? PAL.cream, { seed: TS(k + 400) }); loopInk(c, P, { seed: TS(k + 401), w: 7 });
  title(c, str, cx, cy, size, col, { seed: TS(k) });
}


// ---------------------------------------------------------------- popcorn pieces
const BLUE = '#3d8fd1';
const KERN = '#f2b33d', KERNSH = '#d9892a', TIP = '#fff1c8', STARCH = '#f7ecc8', WATER = '#6fc3f0', FOAM = '#fffaf0', PAN = '#4a4a55', FLAME = '#ff7a2a';
// kernel character: teardrop hull; cut = cutaway (starch + water droplets); press 0..1 swells it; face; crack 0..1
function kernel(c, x, y, s = 1, rot = 0, o = {}) {
  const { k = 0, cut = false, press = 0, face = true, blink = 0, crack = 0, drops = 0, hot = 0, gel = 0, lt = 0 } = o;
  const S = (j) => CS(400 + k, j); const sw = 1 + press * 0.08 + Math.sin(lt * 40) * press * 0.012;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s * sw, s * sw);
  const hull = spline([[0, -120, 1], [62, -70], [70, 20], [40, 95], [0, 112], [-40, 95], [-70, 20], [-62, -70]], true, 4);
  paint(c, hull, hot > 0.5 ? '#f59a2a' : KERN, { seed: S(1) });
  if (!cut) { hatchInk(c, rect(10, -100, 60, 200), { seed: S(2), gap: 13, ang: -0.9, w: 2 }); paint(c, ell(0, 92, 26, 18, 30), TIP, { seed: S(3), reg: false }); }
  else {
    const inner = spline([[0, -100, 1], [48, -60], [54, 18], [30, 80], [0, 92], [-30, 80], [-54, 18], [-48, -60]], true, 4);
    paint(c, inner, gel > 0.5 ? '#fbe7a8' : STARCH, { seed: S(4) }); loopInk(c, inner, { seed: S(5), w: 5 });
    for (let j = 0; j < drops; j++) { const a = j * 2.4 + lt * (1 + press * 6), r = 16 + (j % 3) * 14; const px = Math.cos(a) * r, py = -10 + Math.sin(a * 1.3) * r * 1.4;
      paint(c, ell(px, py, 7, 9, 16), press > 0.4 ? '#ffffff' : WATER, { seed: S(10 + j), reg: false }); loopInk(c, ell(px, py, 7, 9, 16), { seed: S(30 + j), w: 3, color: '#2f6f9a' }); }
  }
  loopInk(c, hull, { seed: S(6), w: 8 });
  if (crack > 0) { ink(c, [[-6, -118], [8, -96], [-4, -78], [10, -58], [0, -40]].map(([a, b]) => [a, b * crack + (-118) * (1 - crack)]), { w: 7, seed: S(7) }); }
  if (face) {
    const fy = cut ? -150 : -10;
    if (!cut) [-22, 22].forEach((ex, e) => {
      if (blink > 0.5 || press > 0.7) ink(c, [[ex - 10, fy - (press > 0.7 ? 6 : 0)], [ex, fy + (press > 0.7 ? 4 : 0)], [ex + 10, fy - (press > 0.7 ? 6 : 0)]], { w: 6, seed: S(40 + e) });
      else { paint(c, ell(ex, fy, 9, 13, 20), PAL.ink, { seed: S(42 + e), reg: false }); c.fillStyle = PAL.hi; c.beginPath(); c.arc(ex + 3, fy - 4, 3.5, 0, 6.3); c.fill(); }
    });
    if (!cut) { if (press > 0.5) paint(c, ell(0, fy + 34, 12, 14 * press, 16), PAL.ink, { seed: S(44), reg: false }); else ink(c, [[-14, fy + 28], [0, fy + 38], [14, fy + 28]], { w: 6, seed: S(45) }); }
  }
  c.restore();
}
// popped popcorn: a boiled cloud of puffs (foam) with a little hull cap; g = growth
function popped(c, x, y, s = 1, g = 1, k = 0, face = false, lt = 0) {
  if (g <= 0.02) return; c.save(); c.translate(x, y); c.scale(s * g, s * g);
  puff(c, 0, 0, 120, CS(600 + k, 1), { n: 6, fill: FOAM });
  paint(c, spline([[-40, 80, 1], [0, 60], [40, 80], [20, 120], [-20, 120]], true, 3), KERN, { seed: CS(600 + k, 2) }); loopInk(c, spline([[-40, 80, 1], [0, 60], [40, 80], [20, 120], [-20, 120]], true, 3), { seed: CS(600 + k, 3), w: 6 });
  if (face) { [-26, 26].forEach((ex, e) => paint(c, ell(ex, -10, 9, 12, 18), PAL.ink, { seed: CS(600 + k, 5 + e), reg: false })); ink(c, [[-16, 22], [0, 34], [16, 22]], { w: 6, seed: CS(600 + k, 8) }); }
  c.restore();
}
// side-view pan on a flame
function pan(c, x, y, s = 1, lt = 0, fire = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (fire > 0) for (let j = 0; j < 6; j++) { const fx = -200 + j * 80, h = 70 + 30 * Math.sin(lt * 9 + j * 1.7);
    const fl = spline([[fx, 160 - h * fire, 1], [fx + 26, 120], [fx + 20, 160], [fx - 20, 160], [fx - 26, 120]], true, 3); paint(c, fl, j % 2 ? FLAME : PAL.yel, { seed: CS(700, j) }); loopInk(c, fl, { seed: CS(700, 10 + j), w: 5 }); }
  const body = resample([[-300, 40], [300, 40], [270, 110], [-270, 110]], 3, true); paint(c, body, PAN, { seed: CS(701, 1) }); loopInk(c, body, { seed: CS(701, 2), w: 9 });
  const handle = resample(rect(290, 50, 220, 34), 3, true); paint(c, handle, '#2b2b33', { seed: CS(701, 3) }); loopInk(c, handle, { seed: CS(701, 4), w: 7 });
  c.restore();
}
// pressure gauge: dial 0..10 (times normal air pressure)
function gauge(c, x, y, r, v, k) { const e = ell(x, y, r, r, 50); paint(c, e, PAL.hi, { seed: TS(k) }); loopInk(c, e, { seed: TS(k + 1), w: 9 });
  for (let j = 0; j <= 10; j++) { const a = Math.PI * (0.8 + j / 10 * 1.4); ink(c, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], { w: j % 5 ? 4 : 7, seed: TS(k + 2 + j) }); }
  const a = Math.PI * (0.8 + clamp(v / 10) * 1.4); ink(c, [[x, y], [x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72]], { w: 10, color: PAL.red, seed: TS(k + 20) });
  paint(c, ell(x, y, 14, 14, 20), PAL.ink, { seed: TS(k + 21), reg: false }); title(c, '×' + Math.round(v), x, y + r * 0.45, r * 0.42, PAL.red, { seed: TS(k + 22), w: 5 }); }
function steamLines(c, x, y, n, lt, len = 120, k = 0, col = '#9fd8f5') { for (let j = 0; j < n; j++) { const a = -Math.PI / 2 + (j - (n - 1) / 2) * 0.5, u = (lt * 1.6 + j / n) % 1;
  const P = []; for (let q = 0; q <= 8; q++) { const r = 40 + q / 8 * len * (0.5 + u); P.push([x + Math.cos(a) * r + Math.sin(q + lt * 6 + j) * 10, y + Math.sin(a) * r]); } ink(c, P, { w: 7, color: col, seed: CS(0, 300 + k + j) }); } }
function soundWaves(c, x, y, g, k = 0) { for (let j = 0; j < 3; j++) { const r = 60 + j * 50 * g; const P = []; for (let q = 0; q <= 12; q++) { const a = -0.8 + q / 12 * 1.6; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } ink(c, P, { w: 8, color: PAL.red, seed: CS(0, 340 + k + j) }); ink(c, P.map(([px, py]) => [2 * x - px, py]), { w: 8, color: PAL.red, seed: CS(0, 360 + k + j) }); } }

// ---------------------------------------------------------------- scenes (captions sit at y 1160-1420; titles from y 300)
const SC = [];
const STOVE = () => { paint(ctx, resample(rect(-60, 1000, W + 120, 1000), 3, true), '#e8cfa0', { seed: BS(1), reg: false }); ink(ctx, [[-20, 1000], [W + 20, 1004]], { w: 9, seed: BS(2) });
  for (let r = 0; r < 7; r++) { const y = 1000 + 90 + r * 130; ink(ctx, [[-20, y], [W + 20, y + 3]], { w: 4, seed: BS(10 + r), color: '#b8925a' }); for (let q = 0; q < 6; q++) { const x = (r % 2 ? 90 : 0) + q * 180; ink(ctx, [[x, y - 130 + 4], [x + 2, y]], { w: 4, seed: BS(30 + r * 7 + q), color: '#b8925a' }); } }
  for (let q = 0; q < 6; q++) { const x = 90 + q * 180; ink(ctx, [[x, 1004], [x + 2, 1090]], { w: 4, seed: BS(80 + q), color: '#b8925a' }); } };
// 0 hook: frame 0 = a kernel already rattling in a hot pan; at 1.6 s it pops into a puff (shake)
SC[0] = (lt) => {
  STOVE(); pan(ctx, CX, 860, 1.25, lt, 1);
  const pop = sstep(1.6, 1.85, lt);
  if (pop < 0.5) kernel(ctx, CX + Math.sin(lt * 30) * 10, 780 - Math.abs(Math.sin(lt * 14)) * 30, 1.5, Math.sin(lt * 20) * 0.15, { k: 1, press: sstep(0, 1.6, lt), lt });
  else { popped(ctx, CX, 640 - 160 * sstep(1.6, 2.2, lt), 1.5, bo2(sstep(1.6, 2.0, lt)), 1, true, lt); star(ctx, CX, 700, 150 * (1 - sstep(1.8, 2.3, lt)) + 1, seedFor(CURD, 30), { fill: PAL.yel }); speedLines(ctx, CX, 700, 200, 360, 14, seedFor(CURD, 31), 9); }
  plaque(ctx, 'INSIDE OUT?', CX, 340, 120, PAL.red, 1);
  kernel(ctx, 260, 800, .55, -.3, { k: 2, press: .3, lt: lt + 1 }); kernel(ctx, 820, 800, .55, .4, { k: 3, press: .3, lt: lt + 2 });
};
const bo2 = (u) => { u = clamp(u); const c1 = 1.7; return 1 + (c1 + 1) * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
// 1 the search question; a water drop glows inside a see-through kernel
SC[1] = (lt, u) => {
  STOVE(); plaque(ctx, 'WHY DOES POPCORN POP?', CX, 340, 84, PAL.ink, 10);
  kernel(ctx, CX, 720, 2.4, 0, { k: 4, cut: true, drops: 1 + Math.floor(sstep(0.4, 0.8, u) * 5), lt });
  if (u > 0.55) { title(ctx, 'water!', 830, 560, 90, BLUE, { seed: TS(11) }); arrow(ctx, 790, 610, 640, 690, BLUE, 12); }
};
// 2 starch + 13-14.5% water: the cutaway with a measuring tag
SC[2] = (lt, u) => {
  STOVE(); kernel(ctx, 380, 720, 2.2, 0, { k: 5, cut: true, drops: 6, lt });
  title(ctx, 'starch', 760, 470, 90, '#b5872a', { seed: TS(20) }); arrow(ctx, 700, 500, 470, 640, PAL.ink, 21);
  const g = sstep(0.3, 0.55, u); if (g > 0) { const tag = resample(rect(600, 720, 360, 200), 3, true); paint(ctx, tag, PAL.hi, { seed: TS(24) }); loopInk(ctx, tag, { seed: TS(25), w: 7 });
    title(ctx, '13-14.5%', 780, 790, 72, BLUE, { seed: TS(26) }); title(ctx, 'water', 780, 870, 60, PAL.ink, { seed: TS(27) }); }
};
// 3 the tough hull keeps it in: the hull outline glows thick; drops bounce off it
SC[3] = (lt, u) => {
  STOVE(); kernel(ctx, CX, 720, 2.6, 0, { k: 6, cut: true, drops: 6, lt });
  const hull = spline([[0, -120, 1], [62, -70], [70, 20], [40, 95], [0, 112], [-40, 95], [-70, 20], [-62, -70]], true, 4).map(([x, y]) => [CX + x * 2.6, 720 + y * 2.6]);
  loopInk(ctx, hull, { seed: TS(30), w: 18, color: PAL.red }); plaque(ctx, 'TOUGH HULL', CX, 340, 110, PAL.red, 31);
};
// 4 heat: the water wants to be steam, the hull says no (pan + flames + a STOP sign on the hull)
SC[4] = (lt, u) => {
  STOVE(); pan(ctx, CX, 900, 1.1, lt, 1); kernel(ctx, CX, 690, 1.9, 0, { k: 7, cut: true, drops: 6, press: .3, lt });
  steamLines(ctx, CX, 520, 3, lt, 90 * sstep(0.1, 0.4, u), 0); if (u > 0.5) { plaque(ctx, 'NO EXIT', CX, 340, 120, PAL.red, 40); bigXs(CX, 470, 60, 41); }
  thermo(ctx, 900, 560, 0.6, lerp(0.3, 0.6, u), PAL.red, 42);
};
function bigXs(x, y, r, k) { ink(ctx, [[x - r, y - r], [x + r, y + r]], { w: 16, color: PAL.red, seed: TS(k) }); ink(ctx, [[x + r, y - r], [x - r, y + r]], { w: 16, color: PAL.red, seed: TS(k + 1) }); }
// 5 re-hook: hotter than boiling, pressure builds (gauge climbs, kernel swells)
SC[5] = (lt, u) => {
  STOVE(); kernel(ctx, 400, 720, 2.1, 0, { k: 8, cut: true, drops: 7, press: lerp(.3, .7, u), lt }); gauge(ctx, 820, 620, 150, lerp(1, 6, ease(u)), 50);
  plaque(ctx, 'HOTTER THAN BOILING', CX, 340, 80, PAL.red, 49); title(ctx, '100°C +', 820, 860, 70, PAL.red, { seed: TS(48) });
};
// 6 the starch goes to gel: the inside turns glossy, bubbles
SC[6] = (lt, u) => {
  STOVE(); kernel(ctx, CX, 720, 2.6, 0, { k: 9, cut: true, drops: 4, press: .7, gel: sstep(0.2, 0.5, u), lt });
  plaque(ctx, 'GOOEY GEL', CX, 340, 110, '#b5872a', 60); for (let j = 0; j < 4; j++) { const t2 = (lt * 0.9 + j / 4) % 1; paint(ctx, ell(CX - 60 + j * 40, 760 - t2 * 120, 10, 10, 14), '#fff6d8', { seed: TS(61 + j), reg: false }); }
};
// 7 180 °C and about ten times normal pressure: thermometer + gauge max, kernel trembling (ones)
SC[7] = (lt, u) => {
  STOVE(); kernel(ctx, 400 + Math.sin(lt * 50) * 4, 740, 1.9, 0, { k: 10, cut: false, press: .9, lt });
  thermo(ctx, 760, 520, 0.7, lerp(.6, .95, ease(u)), PAL.red, 70); title(ctx, '180°C', 760, 900, 90, PAL.red, { seed: TS(71) });
  if (u > 0.3) { const k = sstep(0.3, 0.6, u); gaugeBig(250, 380, k * 10); }
};
function gaugeBig(x, y, v) { gauge(ctx, x, y, 110, v, 80); title(ctx, 'air pressure', x + 260, y, 54, PAL.ink, { seed: TS(83) }); }
// 8 the hull cracks (ones, shake)
SC[8] = (lt, u) => {
  STOVE(); kernel(ctx, CX, 720, 2.6, 0, { k: 11, press: 1, crack: sstep(0.1, 0.6, u), lt }); if (u > 0.4) star(ctx, CX, 420, 110 * sstep(0.4, 0.6, u), seedFor(CURD, 90), { fill: PAL.yel });
  plaque(ctx, 'CRACK!', CX, 340, 130, PAL.red, 91);
};
// 9 steam bursts out, the gel puffs into white foam, inside out (ones)
SC[9] = (lt, u) => {
  STOVE(); const g = ease(sstep(0.0, 0.5, u)); popped(ctx, CX, 720, 2.2, Math.max(.2, g), 12, false, lt);
  if (g < 1) kernel(ctx, CX, 760, 2.4 * (1 - g * .6), 0, { k: 12, press: 1, crack: 1, face: false, lt }); steamLines(ctx, CX, 520, 5, lt, 160, 20, '#c8ecff');
  speedLines(ctx, CX, 720, 300, 470, 16, seedFor(CURD, 95), 8); plaque(ctx, 'INSIDE OUT', CX, 340, 120, PAL.red, 96);
};
// 10 a few hundredths of a second: a stopwatch; the foam sets (hatching appears = it hardens)
SC[10] = (lt, u) => {
  STOVE(); popped(ctx, 360, 720, 1.7, 1, 13, true, lt); const e = ell(800, 650, 130, 130, 50); paint(ctx, e, PAL.hi, { seed: TS(100) }); loopInk(ctx, e, { seed: TS(101), w: 9 });
  const a = -Math.PI / 2 + u * 0.5; ink(ctx, [[800, 650], [800 + Math.cos(a) * 100, 650 + Math.sin(a) * 100]], { w: 10, color: PAL.red, seed: TS(102) }); ink(ctx, [[780, 500], [820, 500]], { w: 12, seed: TS(103) });
  title(ctx, '0.0' + (1 + Math.floor(u * 4)) + ' s', 800, 860, 80, PAL.red, { seed: TS(104) }); if (u > 0.5) title(ctx, 'sets solid', 360, 990, 80, PAL.ink, { seed: TS(105) });
};
// 11 re-hook: the pop sound isn't the crack: a "?" ear and a crossed-out crack
SC[11] = (lt, u) => {
  STOVE(); plaque(ctx, 'THE SOUND?', CX, 340, 120, PAL.red, 110); kernel(ctx, 340, 760, 1.8, 0, { k: 14, press: 1, crack: 1, lt });
  if (u > 0.4) bigXs(340, 760, 120, 111); title(ctx, 'not', 340, 1030, 80, PAL.red, { seed: TS(113) });
  const ear = spline([[760, 560, 1], [860, 600], [870, 720], [800, 800], [760, 760], [800, 700], [770, 640]], true, 3); paint(ctx, ear, '#f2c9a0', { seed: TS(114) }); loopInk(ctx, ear, { seed: TS(115), w: 8 });
  title(ctx, '?', 900, 520, 120, PAL.red, { seed: TS(116) });
};
// 12 high-speed video: the sound lines up with the steam rushing out (film strip frames)
SC[12] = (lt, u) => {
  STOVE(); for (let j = 0; j < 3; j++) { const x = 140 + j * 290, fr = resample(rect(x, 470, 250, 330), 3, true); paint(ctx, fr, '#2b2b33', { seed: TS(120 + j) }); loopInk(ctx, fr, { seed: TS(124 + j), w: 7 });
    const inner = resample(rect(x + 18, 490, 214, 290), 3, true); paint(ctx, inner, PAL.hi, { seed: TS(128 + j), reg: false });
    if (j === 0) kernel(ctx, x + 125, 650, .9, 0, { k: 30, press: 1, crack: 1, face: false, lt }); if (j === 1) { kernel(ctx, x + 125, 660, .8, 0, { k: 31, press: 1, crack: 1, face: false, lt }); steamLines(ctx, x + 125, 590, 3, lt, 70, 40, '#7fc8ee'); soundWaves(ctx, x + 125, 640, sstep(0.3, 0.6, u), 0); }
    if (j === 2) popped(ctx, x + 125, 640, .7, 1, 32, false, lt); }
  title(ctx, 'HIGH-SPEED VIDEO', CX, 360, 80, PAL.ink, { seed: TS(131) }); if (u > 0.5) title(ctx, 'pop = steam out', CX, 920, 84, PAL.red, { seed: TS(132) });
};
// 13 the kernel jumps off the pan with a starch "leg"
SC[13] = (lt, u) => {
  STOVE(); pan(ctx, CX, 960, 1.1, lt, 1); const j = Math.sin(clamp(u * 1.4) * Math.PI); const y = 820 - j * 360, r = u * 3;
  popped(ctx, CX, y, 1.3, 1, 15, true, lt); if (u < 0.3) { const leg = resample([[CX - 14, 880], [CX + 14, 880], [CX + 10, 960 - 40], [CX - 10, 960 - 40]], 3, true); paint(ctx, leg, FOAM, { seed: TS(140) }); loopInk(ctx, leg, { seed: TS(141), w: 6 }); }
  plaque(ctx, 'JUMP!', CX, 340, 130, PAL.red, 142); if (u > 0.4) speedLines(ctx, CX, y, 150, 260, 10, seedFor(CURD, 143), 7);
};
// 14 payoff: a pressure cooker drawn around the kernel
SC[14] = (lt, u) => {
  STOVE(); const pot = resample(rect(220, 520, 640, 420), 3, true); paint(ctx, pot, '#b9bcc6', { seed: TS(150) }); loopInk(ctx, pot, { seed: TS(151), w: 10 });
  const lid = resample(rect(200, 470, 680, 60), 3, true); paint(ctx, lid, '#8e929e', { seed: TS(152) }); loopInk(ctx, lid, { seed: TS(153), w: 9 }); gauge(ctx, 720, 420, 60, lerp(4, 10, ease(u)), 154);
  kernel(ctx, 540, 760, 1.7, 0, { k: 16, press: .8, lt }); steamLines(ctx, 420, 470, 2, lt, 80, 60);
  plaque(ctx, 'PRESSURE COOKER', CX, 300 + 0, 84, PAL.red, 160);
};
// 15 the old maids: cracked hull, steam leaks, no pop; too-dry kernel
SC[15] = (lt, u) => {
  STOVE(); plaque(ctx, 'NEVER POPS', CX, 340, 120, PAL.red, 170);
  kernel(ctx, 320, 740, 1.6, 0, { k: 17, crack: 1, press: .2, lt }); steamLines(ctx, 320, 560, 2, lt, 60, 80, '#9fd8f5'); title(ctx, 'leaky hull', 320, 1010, 64, PAL.ink, { seed: TS(171) });
  if (u > 0.5) { kernel(ctx, 760, 740, 1.6, 0, { k: 18, press: 0, lt }); title(ctx, 'too dry', 760, 1010, 64, PAL.ink, { seed: TS(172) }); }
};
// 16 the question
SC[16] = (lt, u) => {
  STOVE(); plaque(ctx, 'EVER EATEN ONE?', CX, 340, 96, PAL.red, 180); kernel(ctx, CX, 720, 1.8, Math.sin(lt * 3) * .1, { k: 19, blink: blinkAt(lt), lt });
  plaque(ctx, 'YES', 300, 980, 90, '#2f9e44', 181); plaque(ctx, 'NO', 780, 980, 90, PAL.red, 182);
};
// 17 end card: main line + the standard second line + handle; the kernel starts rattling again (loop)
SC[17] = (lt) => {
  const a = sstep(0, 0.4, lt); title(ctx, 'Follow for more of', CX, 330, 100 * a + 20, PAL.ink, { seed: TS(190) }); title(ctx, 'how it really works.', CX, 450, 100 * a + 20, PAL.red, { seed: TS(191) });
  ink(ctx, [[160, 530], [920, 535]], { w: 12, seed: TS(192) }); title(ctx, "A new 'wait, really?' every day.", CX, 610, 56, PAL.ink, { seed: TS(193) }); title(ctx, '@howitreallyworkstudio', CX, 690, 48, '#6b4a3a', { seed: TS(194) });
  STOVE(); pan(ctx, CX, 960, 0.9, lt, 1); kernel(ctx, CX + Math.sin(lt * 30) * 8, 905, 0.95, Math.sin(lt * 20) * .12, { k: 20, press: .4, lt });
};

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 2.6)); return { s: lerp(1.0, 1.1, k), px: CX, py: 720, X: CX, Y: 720 }; }
  if (i === 9) { const k = ease(clamp(lt / 1.5)); return { s: lerp(1.12, 1, k), px: CX, py: 720, X: CX, Y: 720 }; }
  return STAGE;
}
function shakesFor(i, S) {
  if (i === 0) return [{ t0: S.start + 1.25, dur: 0.5, amp: 18 }];
  if (i === 8) return [{ t0: S.start + 0.35, dur: 0.5, amp: 16 }];
  if (i === 9) return [{ t0: S.start + 0.05, dur: 0.5, amp: 12 }];
  if (i === 13) return [{ t0: S.start + 0.1, dur: 0.3, amp: 8 }];
  return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type) in the 1160-1420 band
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 76, maxW = 880, lines = []; let cur = [], cw = 0;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  const lh = size * 1.05, bh = lines.length * lh + 40, bw = 960, bx = (W - bw) / 2, by = 1160;
  ctx.save(); ctx.globalAlpha = alpha;
  const box = resample(rect(bx, by, bw, bh), 3, true);
  paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 });
  loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = CX - tw / 2; const y = by + 20 + lh * li + lh / 2;
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
// cover: the kernel bursting into a puff over the pan, hook text "INSIDE OUT?"
window.thumb = () => { const D = drawingAt(2, 2, 999000); CURD = D; ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0 });
  STOVE(); pan(ctx, CX, 1300, 1.3, 1, 1); popped(ctx, CX, 860, 2.2, 1, 40, true, 1); star(ctx, CX, 1000, 120, seedFor(CURD, 41), { fill: PAL.yel }); speedLines(ctx, CX, 900, 320, 480, 16, seedFor(CURD, 42), 9);
  kernel(ctx, 220, 1180, .7, -.3, { k: 2, press: .4 }); kernel(ctx, 860, 1180, .7, .4, { k: 3, press: .4 });
  plaque(ctx, 'WHY DOES', CX, 360, 130, PAL.ink, 43); plaque(ctx, 'IT POP?', CX, 520, 150, PAL.red, 44); drawTooth(ctx, D); };
window.ready = true;
