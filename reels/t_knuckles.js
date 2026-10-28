// t_knuckles.js: "Why does cracking your knuckles make a pop?" in the cel-boil style (#11), 1080x1920 portrait.
// Animation language: the cel-boil demo via kit_celboil.js (exposure sheet on twos/ones/threes, new boil per drawing,
// shakes and push-ins, off-register colour, paper tooth per drawing). Every frame is a pure function of t (seek).
// Batch N layout: drawings in y 280-1110, the boiled caption box at y 1150-1410, kept to x 60-900.
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

// exposure per scene: the pops on ones, explanations on twos, cards on threes
const EXPO = [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3];

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j);
const TS = (n) => seedFor(CURD, 900 + n);
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ease = (u) => E.io3(clamp(u));
const SKIN = '#f2b98a', SKINSH = '#d98f5f', BONE = '#f4ecd6', FLUID = '#9fd6ef', BLUE = '#3d8fd1', GREEN = '#2f9e44';

function arrowOn(c, P, col = PAL.ink, k = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 42;
  ink(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 10, color: col, seed: TS(k) });
  ink(c, [[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 10, color: col, seed: TS(k + 1) });
}
function arrow(c, x0, y0, x1, y1, col, k) { ink(c, [[x0, y0], [x1, y1]], { w: 10, color: col, seed: TS(k) }); arrowOn(c, [[x0, y0], [x1, y1]], col, k + 2); }
function eyes(c, x, y, sp, r, k, blink = 0, look = 0) {
  [-1, 1].forEach((sg, e) => { const ex = x + sg * sp;
    if (blink > 0.5) ink(c, [[ex - r, y], [ex + r, y]], { w: 6, seed: CS(k, e) });
    else { paint(c, ell(ex, y, r * .75, r, 24), PAL.cream, { seed: CS(k, 2 + e), reg: false }); c.fillStyle = PAL.ink; c.beginPath(); c.arc(ex + look * r * .3, y + 2, r * .38, 0, 6.3); c.fill(); }
  });
}

// cartoon hand seen from the side, fingers pointing right; `pull` stretches the index finger out (0..1)
function hand(c, x, y, s = 1, o = {}) {
  const { k = 0, pull = 0, face = true, blink = 0, mood = 0 } = o;
  const S = (j) => CS(300 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  // three folded fingers behind
  for (let j = 0; j < 3; j++) { const f = resample(spline([[40, 60 + j * 70], [210, 50 + j * 70], [250, 90 + j * 70], [210, 125 + j * 70], [40, 120 + j * 70]], true, 3), 3, true); paint(c, f, j % 2 ? SKINSH : SKIN, { seed: S(10 + j) }); loopInk(c, f, { seed: S(20 + j), w: 6 }); }
  // palm
  const palm = resample(spline([[-220, -40], [40, -90], [120, 20], [110, 270], [-60, 300], [-240, 200]], true, 4), 3, true);
  paint(c, palm, SKIN, { seed: S(1) }); hatchInk(c, rect(-240, 180, 260, 120), { seed: S(2), gap: 13, ang: -0.9, w: 2 }); loopInk(c, palm, { seed: S(3), w: 8 });
  // the index finger, pulled out along +x
  const px = 120 + pull * 60;
  const seg1 = resample(spline([[60, -70], [px + 70, -78], [px + 92, -30], [px + 70, 12], [60, 6]], true, 3), 3, true);
  const seg2 = resample(spline([[px + 110, -74], [px + 300, -70], [px + 330, -30], [px + 300, 8], [px + 110, 10]], true, 3), 3, true);
  paint(c, seg1, SKIN, { seed: S(4) }); loopInk(c, seg1, { seed: S(5), w: 7 });
  paint(c, seg2, SKIN, { seed: S(6) }); loopInk(c, seg2, { seed: S(7), w: 7 });
  ink(c, [[px + 92, -54], [px + 110, -54]], { w: 7, seed: S(8) }); ink(c, [[px + 92, -4], [px + 110, -4]], { w: 7, seed: S(9) });
  // other hand's fingers gripping the tip
  if (pull > 0) { const g = resample(spline([[px + 250, -120], [px + 420, -130], [px + 450, 40], [px + 260, 50], [px + 230, -40]], true, 3), 3, true); paint(c, g, SKINSH, { seed: S(30) }); loopInk(c, g, { seed: S(31), w: 7 }); }
  if (face) { eyes(c, -70, 60, 34, 16, 300 + k, blink); ink(c, mood > 0 ? [[-100, 120], [-70, 135], [-40, 120]] : [[-100, 128], [-40, 128]], { w: 6, seed: S(40) }); }
  c.restore();
}

// knuckle joint cross-section: upper bone (ball) and lower bone (cup), capsule, fluid; gap in px, cav = cavity size 0..1
function joint(c, x, y, s = 1, o = {}) {
  const { k = 0, gap = 0, cav = 0, collapse = 0, face = false, blink = 0, label = 0, pres = 0 } = o;
  const S = (j) => CS(400 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = gap;
  // capsule (stretches with the gap) filled with joint fluid
  const cap = resample(spline([[-210, -150 - g / 2], [0, -175 - g / 2], [210, -150 - g / 2], [235, 0], [210, 150 + g / 2], [0, 175 + g / 2], [-210, 150 + g / 2], [-235, 0]], true, 4), 3, true);
  paint(c, cap, FLUID, { seed: S(1) });
  // upper bone: shaft + round head
  const ub = resample(spline([[-90, -520], [90, -520], [100, -170 - g / 2], [150, -100 - g / 2], [120, -20 - g / 2], [0, 0 - g / 2], [-120, -20 - g / 2], [-150, -100 - g / 2], [-100, -170 - g / 2]], true, 4), 3, true);
  paint(c, ub, BONE, { seed: S(2) }); hatchInk(c, rect(30, -520, 70, 380), { seed: S(3), gap: 12, ang: -0.9, w: 2 }); loopInk(c, ub, { seed: S(4), w: 8 });
  // lower bone: cup + shaft
  const lb = resample(spline([[-150, 40 + g / 2], [-60, 20 + g / 2], [0, 18 + g / 2], [60, 20 + g / 2], [150, 40 + g / 2], [110, 170 + g / 2], [90, 520], [-90, 520], [-110, 170 + g / 2]], true, 4), 3, true);
  paint(c, lb, BONE, { seed: S(5) }); hatchInk(c, rect(30, 200 + g / 2, 60, 300), { seed: S(6), gap: 12, ang: -0.9, w: 2 }); loopInk(c, lb, { seed: S(7), w: 8 });
  loopInk(c, cap, { seed: S(8), w: 6, color: BLUE });
  // the cavity: a gas pocket in the fluid between the bones
  if (cav > 0.01) { const r = 78 * cav * (1 - 0.55 * collapse), wob = 1 + 0.06 * Math.sin(CURD.id * 1.7);
    const bub = ell(0, 10, r * 1.25 * wob, r * 0.62, 40); paint(c, bub, PAL.cream, { seed: S(9), reg: false }); loopInk(c, bub, { seed: S(10), w: 6 });
    ink(c, [[-r * 0.6, -r * 0.15], [-r * 0.3, -r * 0.32]], { w: 5, seed: S(11), color: BLUE }); }
  if (face) { eyes(c, 0, -330, 34, 15, 400 + k, blink); ink(c, [[-30, -280], [0, -268], [30, -280]], { w: 6, seed: S(12) }); }
  c.restore();
}
function popBurst(c, x, y, R, k, txt = 'POP!') { star(c, x, y, R, TS(k), { color: PAL.yel }); title(c, txt, x, y + 6, R * 0.55, PAL.red, { seed: TS(k + 1) }); }
function gauge(c, x, y, r, v, k, lab) { const e = ell(x, y, r, r, 50); paint(c, e, PAL.hi, { seed: TS(k) }); loopInk(c, e, { seed: TS(k + 1), w: 7 });
  for (let j = 0; j <= 6; j++) { const a = Math.PI * (1.15 - j * 0.3 / 1.8 * 1.8 / 1.5 * 1.25); }
  const a = lerp(Math.PI * 1.15, Math.PI * 1.85, v); ink(c, [[x, y], [x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8]], { w: 9, color: PAL.red, seed: TS(k + 2) });
  title(c, lab, x, y + r * 0.45, r * 0.32, PAL.ink, { seed: TS(k + 3) }); }
function clock(c, x, y, r, frac, k) { const e = ell(x, y, r, r, 60); paint(c, e, PAL.hi, { seed: TS(k) }); loopInk(c, e, { seed: TS(k + 1), w: 8 });
  if (frac > 0) { const P = [[x, y]]; for (let j = 0; j <= 30; j++) { const a = -Math.PI / 2 + frac * Math.PI * 2 * j / 30; P.push([x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9]); } paint(c, P, '#ffd8a8', { seed: TS(k + 2), reg: false }); }
  const a = -Math.PI / 2 + frac * Math.PI * 2; ink(c, [[x, y], [x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85]], { w: 9, seed: TS(k + 3) }); ink(c, [[x, y], [x, y - r * 0.5]], { w: 12, seed: TS(k + 4) }); }
function person(c, x, y, s, k, col) { c.save(); c.translate(x, y); c.scale(s, s); const h = ell(0, -60, 22, 22, 24); paint(c, h, SKIN, { seed: TS(k) }); loopInk(c, h, { seed: TS(k + 1), w: 4 }); const b = resample(rect(-26, -36, 52, 60), 3, true); paint(c, b, col, { seed: TS(k + 2) }); loopInk(c, b, { seed: TS(k + 3), w: 4 }); c.restore(); }

// ---------------------------------------------------------------- scenes (one per phrase)
const SC = [];
// 0 hook: a finger is already being pulled; the joint inset pops a bubble into being
SC[0] = (lt) => {
  title(ctx, 'A BUBBLE IS BORN', CX, 330, 112, PAL.red, { seed: TS(1) });
  const pull = 0.4 + 0.6 * sstep(0, 1.3, lt);
  hand(ctx, 250, 700, 0.95, { k: 1, pull, mood: lt > 1.5 ? 1 : 0, blink: lt % 2.3 > 2.1 ? 1 : 0 });
  for (let j = 0; j < 3; j++) ink(ctx, [[880 + j * 22, 600 + j * 26], [990 + j * 22, 600 + j * 26]], { w: 8, color: PAL.ink, seed: CS(0, 80 + j) });
  // inset circle with the joint
  const ins = ell(330, 960, 150, 150, 60); paint(ctx, ins, PAL.hi, { seed: TS(5) }); loopInk(ctx, ins, { seed: TS(6), w: 8 });
  ctx.save(); ctx.beginPath(); ctx.arc(330, 960, 146, 0, 6.3); ctx.clip(); joint(ctx, 330, 960, 0.32, { k: 2, gap: 40 * pull, cav: sstep(1.3, 1.5, lt) }); ctx.restore();
  ink(ctx, [[400, 830], [470, 720]], { w: 6, seed: TS(7) });
  if (lt > 1.35) popBurst(ctx, 640, 960, 150 * sstep(1.35, 1.55, lt) + 30, 10);
};
// 1 but: why the pop?
SC[1] = (lt, u) => {
  hand(ctx, 240, 760, 0.9, { k: 3, pull: 1, mood: 0 });
  title(ctx, 'WHY THE', 560, 380, 120, PAL.ink, { seed: TS(20) }); title(ctx, 'POP?', 560, 520, 170, PAL.red, { seed: TS(21) });
  title(ctx, '?', 900, 760, 200 + 20 * Math.sin(lt * 6), PAL.red, { seed: TS(22) });
};
// 2 the capsule: bones, joint fluid, capsule labels
SC[2] = (lt, u) => {
  joint(ctx, 400, 700, 0.95, { k: 4, face: true, blink: lt % 2.6 > 2.4 ? 1 : 0 });
  const g1 = sstep(0.15, 0.35, u), g2 = sstep(0.35, 0.55, u), g3 = sstep(0.55, 0.75, u);
  if (g1 > 0) { title(ctx, 'bone', 790, 420, 80, PAL.ink, { seed: TS(30) }); arrow(ctx, 720, 430, 520, 470, PAL.ink, 31); }
  if (g2 > 0) { title(ctx, 'joint fluid', 760, 700, 80, BLUE, { seed: TS(34) }); arrow(ctx, 650, 700, 560, 700, BLUE, 35); }
  if (g3 > 0) { title(ctx, 'capsule', 790, 930, 80, PAL.ink, { seed: TS(38) }); arrow(ctx, 700, 900, 600, 840, PAL.ink, 39); }
};
// 3 pull: the bones separate, pressure drops
SC[3] = (lt, u) => {
  const g = ease(u * 1.3);
  joint(ctx, 360, 690, 0.95, { k: 5, gap: 70 * g, face: true });
  arrow(ctx, 360, 330, 360, 230, PAL.red, 40); arrow(ctx, 360, 1060, 360, 1110, PAL.red, 43);
  gauge(ctx, 800, 620, 150, 1 - g, 46, 'pressure');
  title(ctx, 'DROPS', 800, 850, 110, PAL.red, { seed: TS(50) });
};
// 4 the cavity snaps open (ones, shake)
SC[4] = (lt, u) => {
  const pop = sstep(0.25, 0.4, u);
  joint(ctx, 400, 700, 1.05, { k: 6, gap: 80, cav: pop });
  if (pop > 0) { popBurst(ctx, 820, 520, 170 * pop + 20, 60, 'SNAP!'); speedLines(ctx, 400, 700, 220, 360, 12, TS(62), 7); }
  title(ctx, 'gas comes out', 420, 330, 96, BLUE, { seed: TS(63) });
};
// 5 the 2015 MRI: scanner ring + a 3-frame strip
SC[5] = (lt, u) => {
  const ring = ell(CX, 560, 300, 230, 70), hole = ell(CX, 560, 170, 130, 50);
  paint(ctx, ring, '#d7dbe2', { seed: TS(70) }); loopInk(ctx, ring, { seed: TS(71), w: 9 }); paint(ctx, hole, '#3a3d4a', { seed: TS(72) }); loopInk(ctx, hole, { seed: TS(73), w: 7 });
  hand(ctx, CX - 120, 560, 0.42, { k: 7, pull: sstep(0.1, 0.5, u), face: false });
  title(ctx, '2015', 230, 340, 110, PAL.red, { seed: TS(74) }); title(ctx, 'MRI', 860, 340, 110, PAL.ink, { seed: TS(75) });
  [0, 1, 2].forEach((j) => { const x = 210 + j * 330, y = 960, g = sstep(0.3 + j * 0.15, 0.4 + j * 0.15, u); if (g <= 0) return;
    const f = resample(rect(x - 130, y - 120, 260, 240), 3, true); paint(ctx, f, '#2b2e38', { seed: TS(76 + j) }); loopInk(ctx, f, { seed: TS(80 + j), w: 6 });
    ctx.save(); ctx.beginPath(); ctx.rect(x - 126, y - 116, 252, 232); ctx.clip(); joint(ctx, x, y, 0.3, { k: 8 + j, gap: j * 30, cav: j === 2 ? 1 : 0 }); ctx.restore();
    if (j === 2 && u > 0.7) title(ctx, 'crack!', x, y - 150, 60, PAL.red, { seed: TS(84) }); });
};
// 6 afterwards the bubble is still there
SC[6] = (lt, u) => {
  joint(ctx, 420, 690, 1.0, { k: 11, gap: 50, cav: 1, face: true, blink: lt % 2 > 1.8 ? 1 : 0 });
  title(ctx, 'STILL', 820, 560, 110, PAL.red, { seed: TS(90) }); title(ctx, 'THERE', 820, 690, 110, PAL.red, { seed: TS(91) });
  arrow(ctx, 760, 780, 520, 710, PAL.red, 92);
};
// 7 the old idea: a bubble collapsing
SC[7] = (lt, u) => {
  const c = sstep(0.2, 0.8, u);
  joint(ctx, 400, 690, 1.0, { k: 12, gap: 50, cav: 1, collapse: c });
  title(ctx, 'COLLAPSING?', 560, 330, 120, PAL.ink, { seed: TS(100) });
  for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + 0.6; arrow(ctx, 400 + Math.cos(a) * 200, 700 + Math.sin(a) * 130, 400 + Math.cos(a) * 110, 700 + Math.sin(a) * 70, BLUE, 101 + j * 4); }
  title(ctx, 'the old answer', 800, 980, 80, PAL.ink, { seed: TS(120) });
};
// 8 the 2018 model: half-collapse, sound wave matches
SC[8] = (lt, u) => {
  title(ctx, '2018', 200, 340, 110, PAL.red, { seed: TS(130) }); title(ctx, 'math model', 640, 340, 96, PAL.ink, { seed: TS(131) });
  joint(ctx, 270, 760, 0.62, { k: 13, gap: 50, cav: 1, collapse: 0.5 * sstep(0.1, 0.5, u) });
  const g = sstep(0.3, 0.8, u), P = []; for (let j = 0; j <= 60 * g; j++) { const x = 480 + j * 7, d = Math.exp(-j / 18); P.push([x, 700 + Math.sin(j * 0.9) * 120 * d]); }
  if (P.length > 2) ink(ctx, P, { w: 8, color: BLUE, seed: TS(132) });
  if (u > 0.5) { title(ctx, 'half collapse', 720, 900, 80, PAL.red, { seed: TS(133) }); title(ctx, 'same sound', 720, 990, 80, PAL.ink, { seed: TS(134) }); }
};
// 9 the debate: born vs collapsing
SC[9] = (lt, u) => {
  const sign = (x, txt, col, k, tilt) => { ctx.save(); ctx.translate(x, 600); ctx.rotate(tilt); const b = resample(rect(-200, -90, 400, 180), 3, true); paint(ctx, b, col, { seed: TS(k) }); loopInk(ctx, b, { seed: TS(k + 1), w: 8 }); title(ctx, txt, 0, 0, 82, PAL.hi, { seed: TS(k + 2) }); ctx.restore(); ink(ctx, [[x, 690], [x, 980]], { w: 12, seed: TS(k + 3) }); };
  sign(270, 'BORN', GREEN, 140, -0.08 + 0.04 * Math.sin(lt * 3)); sign(810, 'COLLAPSE', BLUE, 150, 0.08 - 0.04 * Math.sin(lt * 3));
  title(ctx, 'vs', CX, 600, 120, PAL.red, { seed: TS(160) });
  title(ctx, 'NOT SETTLED', CX, 1060, 110, PAL.red, { seed: TS(161) });
};
// 10 wait about half an hour to crack again
SC[10] = (lt, u) => {
  clock(ctx, 300, 640, 210, 0.5 * ease(u), 170);
  joint(ctx, 740, 640, 0.6, { k: 14, gap: 30, cav: 1 - 0.85 * ease(u) });
  title(ctx, '~30 MIN', 300, 960, 120, PAL.red, { seed: TS(180) }); title(ctx, 'to reset', 740, 1040, 80, PAL.ink, { seed: TS(181) });
};
// 11 one doctor, left hand only, 60+ years
SC[11] = (lt, u) => {
  hand(ctx, 120, 640, 0.6, { k: 15, pull: 0.6 + 0.4 * Math.abs(Math.sin(lt * 3)), face: true, mood: 1 });
  ctx.save(); ctx.translate(960, 640); ctx.scale(-1, 1); hand(ctx, 0, 0, 0.6, { k: 16, pull: 0, face: true, mood: 0 }); ctx.restore();
  title(ctx, 'LEFT', 260, 430, 90, PAL.red, { seed: TS(190) }); title(ctx, 'RIGHT', 820, 430, 90, PAL.ink, { seed: TS(191) });
  if (u > 0.4) { const b = resample(rect(CX - 230, 900, 460, 160), 3, true); paint(ctx, b, PAL.hi, { seed: TS(192) }); loopInk(ctx, b, { seed: TS(193), w: 7 }); title(ctx, '60+ YEARS', CX, 980, 100, PAL.red, { seed: TS(194) }); }
};
// 12 no difference; Ig Nobel prize
SC[12] = (lt, u) => {
  hand(ctx, 150, 520, 0.5, { k: 17, face: true, mood: 1 }); ctx.save(); ctx.translate(930, 520); ctx.scale(-1, 1); hand(ctx, 0, 0, 0.5, { k: 18, face: true, mood: 1 }); ctx.restore();
  title(ctx, '=', CX, 560, 200, PAL.red, { seed: TS(200) });
  const g = sstep(0.4, 0.6, u); if (g > 0) { const cup = resample(spline([[CX - 110, 820], [CX + 110, 820], [CX + 80, 960], [CX + 30, 990], [CX + 30, 1040], [CX + 90, 1060], [CX - 90, 1060], [CX - 30, 1040], [CX - 30, 990], [CX - 80, 960]], true, 3), 3, true);
    paint(ctx, cup, PAL.yel, { seed: TS(201) }); loopInk(ctx, cup, { seed: TS(202), w: 7 }); star(ctx, CX, 780, 60 * g, TS(203), { color: PAL.yel }); title(ctx, 'Ig Nobel', CX + 260, 940, 80, PAL.red, { seed: TS(204) }); }
};
// 13 300 people: no extra arthritis; more swelling, weaker grip
SC[13] = (lt, u) => {
  for (let j = 0; j < 30; j++) { const x = 140 + (j % 10) * 88, y = 470 + Math.floor(j / 10) * 120, g = sstep(j / 60, j / 60 + 0.1, u); if (g > 0) person(ctx, x, y, 0.95, 220 + j * 4, j % 4 === 0 ? '#e8563a' : BLUE); }
  title(ctx, '300 people', CX, 330, 100, PAL.ink, { seed: TS(330) });
  if (u > 0.4) { title(ctx, 'arthritis: no extra', CX, 860, 84, GREEN, { seed: TS(331) }); }
  if (u > 0.65) { title(ctx, 'swelling, grip: worse', CX, 980, 84, PAL.red, { seed: TS(332) }); }
};
// 14 the question
SC[14] = (lt, u) => {
  hand(ctx, 260, 700, 0.8, { k: 19, pull: 0.5 + 0.5 * Math.abs(Math.sin(lt * 4)), face: true, mood: 1 });
  const b1 = ell(320, 400, 140, 100, 40), b2 = ell(760, 400, 140, 100, 40);
  paint(ctx, b1, GREEN, { seed: TS(340) }); loopInk(ctx, b1, { seed: TS(341), w: 7 }); title(ctx, 'YES?', 320, 405, 90, PAL.hi, { seed: TS(342) });
  paint(ctx, b2, PAL.red, { seed: TS(343) }); loopInk(ctx, b2, { seed: TS(344), w: 7 }); title(ctx, 'NO?', 760, 405, 90, PAL.hi, { seed: TS(345) });
};
// 15 closing card (standard): main line, the series line, handle; the hook's hand + bubble loop back
SC[15] = (lt) => {
  const a = sstep(0, 0.5, lt);
  title(ctx, 'Follow for more of', CX, 380, 106 * a + 30, PAL.ink, { seed: TS(350) });
  title(ctx, 'how it really works.', CX, 500, 104 * a + 30, PAL.red, { seed: TS(351) });
  ink(ctx, [[160, 580], [920, 585]], { w: 12, seed: TS(352) });
  title(ctx, "A new 'wait, really?' every day.", CX, 660, 70, PAL.ink, { seed: TS(353) });
  title(ctx, '@howitreallyworkstudio', CX, 750, 60, BLUE, { seed: TS(354) });
  hand(ctx, 250, 930, 0.6, { k: 20, pull: 1, face: true, mood: 1 });
  popBurst(ctx, 800, 960, 110, 360);
};

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 1.8)); return { s: lerp(1, 1.1, k), px: CX, py: 760, X: CX, Y: 760 }; }
  if (i === 4) { const k = ease(clamp(lt / 1.2)); return { s: lerp(1, 1.12, k), px: 420, py: 700, X: 420, Y: 700 }; }
  return STAGE;
}
function shakesFor(i, S) {
  if (i === 0) return [{ t0: S.start + 1.35, dur: 0.45, amp: 16 }];
  if (i === 4) return [{ t0: S.start + 0.27 * (S.end - S.start), dur: 0.45, amp: 15 }];
  if (i === 5) return [{ t0: S.start + 0.72 * (S.end - S.start), dur: 0.35, amp: 9 }];
  return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type), Batch N band y 1150-1410, x 60-900
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 70, maxW = 780, lines = []; let cur = [], cw = 0;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  const lh = size * 1.02, bh = lines.length * lh + 40, bw = 840, bx = 60, by = 1150, mx = bx + bw / 2;
  ctx.save(); ctx.globalAlpha = alpha;
  const box = resample(rect(bx, by, bw, bh), 3, true);
  paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 });
  loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = mx - tw / 2; const y = by + 20 + lh * li + lh / 2;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; ctx.fillStyle = wd.b ? PAL.red : PAL.ink; ctx.fillText(wd.w, x, y); x += wd.ww; }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- frame function
function locate(t) {
  for (let i = 0; i < SEG.length; i++) if (t < SEG[i].end || i === SEG.length - 1) return i;
  return SEG.length - 1;
}
function frameAt(t) {
  const i = locate(t);
  const S = SEG[i];
  const dur = S.end - S.start;
  const D = drawingAt(t, EXPO[i], (i + 1) * 10000);
  CURD = D;
  const lt = clamp(D.tq - S.start, 0, dur);
  const u = clamp(lt / dur);
  const cam = camera(D.t1, shakesFor(i, S));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawPaper(ctx, cam);
  ctx.save();
  ctx.translate(cam.x, cam.y);
  const shot = shotFor(i, lt);
  zoomWeight(shot);
  ctx.save();
  applyShot(ctx, shot);
  SC[i](lt, u);
  ctx.restore();
  resetWeight();
  ctx.restore();
  if (i < SEG.length - 1) caption(S.cap, sstep(0, 0.2, lt));
  drawTooth(ctx, D);
}
window.DUR = window.TL.total;
window.seek = (t) => frameAt(t);
window.render = window.seek;
// thumbnail / cover (rule 11): the hook drawing with big boiled words, no caption
window.thumb = () => { const D = drawingAt(1.6, 1, 10000); CURD = D; ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0, r: 0 });
  title(ctx, 'WHY KNUCKLES', CX, 420, 120, PAL.ink, { seed: TS(400) }); title(ctx, 'POP', CX, 600, 220, PAL.red, { seed: TS(401) });
  hand(ctx, 250, 960, 0.95, { k: 1, pull: 1, mood: 1 });
  const ins = ell(330, 1260, 150, 150, 60); paint(ctx, ins, PAL.hi, { seed: TS(5) }); loopInk(ctx, ins, { seed: TS(6), w: 8 });
  ctx.save(); ctx.beginPath(); ctx.arc(330, 1260, 146, 0, 6.3); ctx.clip(); joint(ctx, 330, 1260, 0.32, { k: 2, gap: 40, cav: 1 }); ctx.restore();
  popBurst(ctx, 720, 1260, 170, 10); drawTooth(ctx, D); };
window.seek(0); window.ready = true;
