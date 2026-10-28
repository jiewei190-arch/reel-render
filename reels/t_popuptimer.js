// t_popuptimer.js: "How does a turkey pop-up timer know when it's done?" in the cel-boil style (#11), 1080x1920 portrait.
// Same animation language as the approved match reel via kit_celboil.js (exposure sheet, a new boil per drawing, shakes and
// push-ins, off-register colour, paper tooth). Safe zones: art and titles y 260-1100, captions boxed inside y 1150-1420,
// nothing written in the right column below y 840. Every frame is a pure function of t (seek).
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

// exposure per scene: the pop and the "too early" shocks on ones, calm titles on threes, the rest on twos
const EXPO = [2, 2, 2, 2, 2, 2, 1, 2, 3, 2, 2, 2, 3, 2, 2, 2, 3];

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j);
const TS = (n) => seedFor(CURD, 900 + n);
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const rrect = (x, y, w, h, r) => spline([[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r]], true, 3);
const ease = (u) => E.io3(clamp(u));
const back = (u) => { u = clamp(u); const s = 1.7; return 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2); };
const ROAST = '#c8763a', ROASTD = '#9a5226', SKIN = '#e6a15a', METAL = '#a9adb5', BLUE = '#3d8fd1', CLEAR = '#e9f1f4', WHITE = '#fbf7ee';

function arrowOn(c, P, col = PAL.ink, k = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 40;
  ink(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 9, color: col, seed: TS(k) });
  ink(c, [[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 9, color: col, seed: TS(k + 1) });
}
function arrow(c, x0, y0, x1, y1, col, k) { ink(c, [[x0, y0], [x1, y1]], { w: 9, color: col, seed: TS(k) }); arrowOn(c, [[x0, y0], [x1, y1]], col, k + 2); }
function heatWaves(c, x, y, n, h, lt, k, col = PAL.red) {
  for (let j = 0; j < n; j++) {
    const xx = x + (j - (n - 1) / 2) * 70, ph = lt * 3 + j;
    const P = []; for (let i = 0; i <= 8; i++) P.push([xx + Math.sin(ph + i * 0.9) * 14, y - i * h / 8]);
    ink(c, P, { w: 8, color: col, seed: CS(k, j) });
  }
}

// roast turkey on a platter; origin = body centre. timer: pop amount 0..1 (null = no timer). o.spots: probe marks
function turkey(c, x, y, s = 1, o = {}) {
  const { k = 0, pop = 0, timer = true } = o;
  const S = (j) => CS(300 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const plate = ell(0, 150, 400, 80, 60); paint(c, plate, WHITE, { seed: S(1) }); loopInk(c, plate, { seed: S(2), w: 7 });
  for (const sd of [-1, 1]) {
    const leg = spline([[sd * 170, 40], [sd * 300, 0], [sd * 360, 70], [sd * 300, 150], [sd * 190, 140]], true, 3);
    paint(c, leg, ROAST, { seed: S(3 + sd) }); loopInk(c, leg, { seed: S(5 + sd), w: 7 });
    const bone = [[sd * 340, 60], [sd * 400, 30]]; ink(c, bone, { w: 18, color: WHITE, seed: S(7 + sd) });
    for (const dy of [-12, 12]) { const b = ell(sd * 405, 30 + dy, 16, 14, 20); paint(c, b, WHITE, { seed: S(9 + sd + dy) }); loopInk(c, b, { seed: S(11 + sd + dy), w: 5 }); }
  }
  const body = spline([[0, -190], [230, -150], [300, 10], [220, 140], [0, 170], [-220, 140], [-300, 10], [-230, -150]], true, 4);
  paint(c, body, ROAST, { seed: S(13) });
  const hl = spline([[-60, -150], [90, -150], [150, -70], [40, -40], [-90, -70]], true, 3);
  paint(c, hl, SKIN, { seed: S(14), reg: false });
  hatchInk(c, spline([[-280, 20], [-200, 130], [-60, 150], [-180, 60]], true, 3), { seed: S(15), angle: 0.6 });
  loopInk(c, body, { seed: S(16), w: 8 });
  if (timer) timerTop(c, 70, -150, 1, pop, k + 40);
  c.restore();
}
// the pop-up as you see it: a clear flange in the breast and a red stick that rises by p (0..1)
function timerTop(c, x, y, s, p, k) {
  const S = (j) => CS(600 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const hgt = 12 + p * 120;
  const stick = rrect(-15, -hgt, 30, hgt + 6, 12); paint(c, stick, PAL.red, { seed: S(1) }); loopInk(c, stick, { seed: S(2), w: 6 });
  const fl = ell(0, 6, 46, 15, 40); paint(c, fl, CLEAR, { seed: S(3) }); loopInk(c, fl, { seed: S(4), w: 6 });
  c.restore();
}
// cut-away timer: housing, spring under a collar, plug of soft metal at the base. melt 0..1, pop 0..1. origin = base centre
function timerCut(c, x, y, s, melt, pop, o = {}) {
  const k = o.k ?? 0, S = (j) => CS(700 + k, j), up = pop * 250;
  c.save(); c.translate(x, y); c.scale(s, s);
  const house = spline([[-70, -560], [70, -560], [62, -40], [36, 0], [-36, 0], [-62, -40]], true, 2);
  paint(c, house, CLEAR, { seed: S(1) });
  const flange = rrect(-150, -600, 300, 44, 20); paint(c, flange, CLEAR, { seed: S(2) }); loopInk(c, flange, { seed: S(3), w: 7 });
  // stick with a collar; the spring sits between the collar and the housing shoulder
  const st = rrect(-22, -640 - up, 44, 600, 18); paint(c, st, PAL.red, { seed: S(4) }); loopInk(c, st, { seed: S(5), w: 7 });
  const col = rrect(-52, -330 - up, 104, 26, 10); paint(c, col, PAL.red, { seed: S(6) }); loopInk(c, col, { seed: S(7), w: 6 });
  const top = -304 - up, bot = -70, n = 9, Z = [];
  for (let i = 0; i <= n; i++) Z.push([i % 2 ? 50 : -50, lerp(top, bot, i / n)]);
  ink(c, Z, { w: 9, color: '#5b5b66', seed: S(8) });
  // plug: a grey blob holding the stick's tip; melts into drops
  const m = clamp(melt), pr = 1 - 0.75 * m;
  if (pr > 0.05) { const plug = spline([[-56 * pr, -70], [56 * pr, -70], [60 * pr, -20], [30 * pr, -4], [-30 * pr, -4], [-60 * pr, -20]], true, 3); paint(c, plug, METAL, { seed: S(9) }); loopInk(c, plug, { seed: S(10), w: 6 }); }
  if (m > 0.05) for (let j = 0; j < 3; j++) { const d = ell(-30 + j * 30, 20 + m * (40 + j * 25), 10, 14, 20); paint(c, d, METAL, { seed: S(11 + j) }); loopInk(c, d, { seed: S(14 + j), w: 4 }); }
  loopInk(c, house, { seed: S(17), w: 8 });
  c.restore();
}
function batteryX(c, x, y, s, k) {
  const S = (j) => CS(800 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const b = rrect(-70, -120, 140, 240, 18); paint(c, b, '#e8c33a', { seed: S(1) }); loopInk(c, b, { seed: S(2), w: 7 });
  const t = rect(-26, -146, 52, 28); paint(c, t, '#5b5b66', { seed: S(3) }); loopInk(c, t, { seed: S(4), w: 6 });
  title(c, '+', 0, -50, 80, PAL.ink, { seed: S(5), w: 5 });
  ink(c, [[-120, -150], [120, 150]], { w: 22, color: PAL.red, seed: S(6) }); ink(c, [[120, -150], [-120, 150]], { w: 22, color: PAL.red, seed: S(7) });
  c.restore();
}
function thermo(c, x, y, s, deg, k, o = {}) {   // dial food thermometer, probe pointing down; deg 0..1 sweeps the needle
  const S = (j) => CS(900 + k, j);
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  ink(c, [[0, 80], [0, 420]], { w: 16, color: '#8a8f99', seed: S(1) });
  const d = ell(0, 0, 110, 110, 60); paint(c, d, WHITE, { seed: S(2) }); loopInk(c, d, { seed: S(3), w: 9 });
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.75 + i * 0.1875); ink(c, [[Math.cos(a) * 80, Math.sin(a) * 80], [Math.cos(a) * 96, Math.sin(a) * 96]], { w: 5, seed: S(4 + i) }); }
  const a = Math.PI * (0.75 + 1.5 * clamp(deg)); ink(c, [[0, 0], [Math.cos(a) * 78, Math.sin(a) * 78]], { w: 10, color: PAL.red, seed: S(20) });
  c.restore();
}
function sprinkler(c, x, y, s, drop, lt, k) {   // ceiling pipe, sprinkler head; drop 0..1: the plug falls and water sprays
  const S = (j) => CS(1000 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const pipe = rect(-420, -60, 840, 50); paint(c, pipe, '#c9cdd4', { seed: S(1) }); loopInk(c, pipe, { seed: S(2), w: 7 });
  const head = spline([[-40, -10], [40, -10], [30, 70], [-30, 70]], true, 2); paint(c, head, '#d9a93a', { seed: S(3) }); loopInk(c, head, { seed: S(4), w: 7 });
  const def = rect(-90, 150, 180, 18); paint(c, def, '#d9a93a', { seed: S(5) }); loopInk(c, def, { seed: S(6), w: 6 });
  ink(c, [[-40, 70], [-60, 150]], { w: 8, seed: S(7) }); ink(c, [[40, 70], [60, 150]], { w: 8, seed: S(8) });
  const py = 110 + drop * 420;
  if (drop < 1) { const pl = ell(0, py, 26, 34, 24); paint(c, pl, METAL, { seed: S(9) }); loopInk(c, pl, { seed: S(10), w: 6 }); }
  if (drop > 0.2) for (let j = 0; j < 14; j++) { const a = Math.PI * (0.15 + 0.7 * j / 13), r = 120 + ((lt * 300 + j * 47) % 300); const dd = ell(Math.cos(a) * r * 1.4, 170 + Math.sin(a) * r, 9, 14, 16); paint(c, dd, BLUE, { seed: S(11 + j), reg: false }); }
  c.restore();
}
function patentDoc(c, x, y, s, k) {
  const S = (j) => CS(1100 + k, j);
  c.save(); c.translate(x, y); c.rotate(-0.05); c.scale(s, s);
  const p = rect(-220, -280, 440, 560); paint(c, p, WHITE, { seed: S(1) }); loopInk(c, p, { seed: S(2), w: 7 });
  title(c, 'PATENT', 0, -200, 76, PAL.ink, { seed: S(3), w: 6 });
  for (let i = 0; i < 6; i++) ink(c, [[-170, -110 + i * 46], [lerp(120, 170, (i * 37 % 10) / 10), -110 + i * 46]], { w: 5, color: '#8a7f70', seed: S(4 + i) });
  star(c, 120, 190, 70, S(12), { fill: PAL.red, n: 12 });
  timerCut(c, -90, 230, 0.22, 0, 0.3, { k: k + 3 });
  c.restore();
}
function bubble(c, x, y, r, txt, col, seed, size = 60) {
  const e = ell(x, y, r, r, 40);
  paint(c, e, col, { seed }); loopInk(c, e, { seed: seed + 1, w: 6 });
  title(c, txt, x, y, size, PAL.ink, { seed: seed + 2, w: 5 });
}

// ---------------------------------------------------------------- scenes
const SC = [];
const L = (i) => SEG[i].end - SEG[i].start;

// 0 hook: a roast turkey, the red stick twitching in its breast; a battery is crossed out
SC[0] = (lt) => {
  title(ctx, 'NO BATTERY', CX, 340, 130, PAL.red, { seed: TS(1) });
  turkey(ctx, CX, 880, 1.05, { k: 1, pop: 0.12 + 0.1 * Math.abs(Math.sin(lt * 5)) });
  batteryX(ctx, 860, 520, 0.55, 2);
  const g = sstep(2.6, 3.1, lt); if (g > 0) { title(ctx, 'spring', 240, 480, 84 * g + 10, PAL.ink, { seed: TS(2) }); title(ctx, '+ metal', 250, 570, 80 * g + 10, '#6f747d', { seed: TS(3) }); }
};
// 1 the question: the stick pops on cue, question marks around it
SC[1] = (lt) => {
  const p = back(sstep(0.6, 1.2, lt)), z = lerp(1.05, 1.8, ease(lt / 0.5));   // push in on the timer as the question lands
  turkey(ctx, CX - 70 * (z - 1.05) / 0.75 * 1.8, lerp(860, 1090, ease(lt / 0.5)), z, { k: 3, pop: p });
  title(ctx, 'HOW DOES IT', CX, 320, 110, PAL.ink, { seed: TS(5) });
  title(ctx, 'KNOW?', CX, 450, 140, PAL.red, { seed: TS(6) });
  if (lt > 0.9) { title(ctx, '?', 300, 640, 140, PAL.red, { seed: TS(7) }); title(ctx, '?', 780, 620, 120, PAL.ink, { seed: TS(8) }); speedLines(ctx, CX, 560, 90, 190, 10, seedFor(CURD, 9)); }
};
// 2 inside: cut-away, a red stick on a squeezed spring
SC[2] = (lt) => {
  timerCut(ctx, CX, 1060, 1.0, 0, 0, { k: 1 });
  const g = sstep(0.3, 0.7, lt);
  if (g > 0) { title(ctx, 'stick', 230, 420, 84 * g + 10, PAL.red, { seed: TS(10) }); arrow(ctx, 300, 470, 470, 560, PAL.ink, 11); }
  const g2 = sstep(1.0, 1.4, lt);
  if (g2 > 0) { title(ctx, 'squeezed', 230, 760, 76 * g2 + 10, PAL.ink, { seed: TS(14) }); title(ctx, 'spring', 230, 840, 76 * g2 + 10, PAL.ink, { seed: TS(15) }); arrow(ctx, 330, 820, 470, 860, PAL.ink, 16); }
};
// 3 the plug of soft metal (or a wax-like material) at the base
SC[3] = (lt) => {
  const z = ease(lt / 1.5);
  timerCut(ctx, CX, 1060, 1.0, 0, 0, { k: 2 });
  const g = sstep(0.8, 1.3, lt);
  if (g > 0) { bubble(ctx, 830, 930, 110 * g + 1, 'metal', METAL, TS(20), 58); arrow(ctx, 720, 960, 610, 1010, PAL.ink, 23); title(ctx, 'soft', 830, 760, 72 * g + 8, PAL.ink, { seed: TS(26) }); }
  const g2 = sstep(3.4, 3.9, lt);
  if (g2 > 0) { title(ctx, 'or wax-like', 250, 900, 70 * g2 + 8, '#b57a2d', { seed: TS(27) }); }
  title(ctx, 'THE PLUG', CX, 330, 120 * (0.85 + 0.15 * z), PAL.red, { seed: TS(28) });
};
// 4 the turkey cooks; heat climbs into the plug
SC[4] = (lt) => {
  timerCut(ctx, CX, 1060, 1.0, 0, 0, { k: 3 });
  heatWaves(ctx, CX, 1100, 5, 260, lt, 4);
  title(ctx, 'HEATING UP', CX, 330, 120, PAL.red, { seed: TS(30) });
  thermo(ctx, 220, 620, 0.8, sstep(0, 2.2, lt) * 0.7, 1);
};
// 5 at a set temperature the plug melts
SC[5] = (lt) => {
  const m = sstep(0.6, 1.8, lt);
  timerCut(ctx, CX, 1060, 1.0, m, 0, { k: 4 });
  heatWaves(ctx, CX, 1100, 5, 260, lt, 5);
  title(ctx, 'MELTS!', CX, 330, 150, PAL.red, { seed: TS(32) });
  thermo(ctx, 220, 620, 0.8, 0.7 + 0.15 * sstep(0, 1, lt), 2);
  title(ctx, 'set temp', 220, 470, 64, PAL.ink, { seed: TS(33) });
};
// 6 POP: the spring fires the stick up (ones, with a shake)
SC[6] = (lt) => {
  const p = back(sstep(1.0, 1.35, lt));
  timerCut(ctx, CX + 80, 1090, 0.85, 1, p, { k: 5 });
  if (lt > 1.05) { speedLines(ctx, CX + 80, 420, 100, 260, 14, seedFor(CURD, 41)); star(ctx, 260, 520, 150, seedFor(CURD, 40), { fill: PAL.yel }); title(ctx, 'POP!', 260, 520, 120, PAL.red, { seed: TS(34) }); }
  for (const sg of [-1, 1]) if (lt > 1.05 && lt < 1.8) spark(ctx, CX + 80 + sg * 90, 420, sg * 300, -260, 22, seedFor(CURD, 720 + sg));
};
// 7 the idea came from fire sprinklers
SC[7] = (lt) => {
  const d = sstep(2.4, 3.2, lt);
  sprinkler(ctx, CX, 520, 1.0, d, lt, 1);
  title(ctx, 'FIRE SPRINKLER', CX, 320, 100, PAL.ink, { seed: TS(36) });
  const g = sstep(1.0, 1.4, lt); if (g > 0) { title(ctx, 'melting plug', 270, 740, 66 * g + 8, PAL.red, { seed: TS(37) }); arrow(ctx, 370, 700, 495, 645, PAL.ink, 38); }
  for (let j = 0; j < 4; j++) { const f = (lt * 1.5 + j * 0.25) % 1; puff(ctx, 300 + j * 160, 1040 - f * 60, 50 + 10 * j, seedFor(CURD, 60 + j), { n: 4 }); }
  if (lt > 1.2) { const fl = spline([[CX, 860], [CX + 70, 960], [CX + 50, 1040], [CX - 50, 1040], [CX - 70, 960]], true, 3); paint(ctx, fl, PAL.red, { seed: CS(7, 1) }); loopInk(ctx, fl, { seed: CS(7, 2), w: 6 }); }
};
// 8 1961: California turkey growers patent it
SC[8] = (lt) => {
  const a = sstep(0, 0.5, lt);
  patentDoc(ctx, 330, 760, 0.9, 1);
  title(ctx, '1961', 740, 580, 170 * a + 30, PAL.red, { seed: TS(40) });
  title(ctx, 'California', 740, 720, 70, PAL.ink, { seed: TS(41) });
  title(ctx, 'turkey growers', 720, 800, 64, PAL.ink, { seed: TS(42) });
  title(ctx, 'PATENTED', CX, 330, 120, PAL.ink, { seed: TS(43) });
};
// 9 the catch: it only feels one spot
SC[9] = (lt) => {
  turkey(ctx, CX, 860, 1.05, { k: 9, pop: 1 });
  const g = sstep(0.6, 1.1, lt);
  if (g > 0) { const r = ell(CX + 75, 660, 120, 120, 50); loopInk(ctx, r, { seed: CS(9, 3), w: 10, color: PAL.red }); title(ctx, 'one spot', CX + 0, 470, 96 * g + 8, PAL.red, { seed: TS(44) }); }
  const g2 = sstep(1.6, 2.1, lt);
  if (g2 > 0) { title(ctx, '?', 230, 900, 110 * g2 + 8, PAL.ink, { seed: TS(45) }); title(ctx, '?', 840, 760, 110 * g2 + 8, PAL.ink, { seed: TS(46) }); }
  title(ctx, 'THE CATCH', CX, 330, 120, PAL.ink, { seed: TS(47) });
};
// 10 and it isn't always right
SC[10] = (lt) => {
  const wob = Math.sin(lt * 9) * 0.12;
  ctx.save(); ctx.translate(CX, 1100); ctx.rotate(wob); timerCut(ctx, 0, 0, 0.7, 0.4, 0.5, { k: 6 }); ctx.restore();
  title(ctx, 'NOT ALWAYS', CX, 330, 120, PAL.red, { seed: TS(48) });
  title(ctx, 'RIGHT', CX, 460, 130, PAL.red, { seed: TS(49) });
};
// 11 Consumer Reports: 21 timers, three popped too early, one at 139 °F
SC[11] = (lt) => {
  title(ctx, '21 TIMERS, 2016', CX, 320, 104, PAL.ink, { seed: TS(50) });
  const early = [3, 10, 16];
  for (let i = 0; i < 21; i++) {
    const c = i % 7, r = (i / 7) | 0, x = 180 + c * 120, y = 560 + r * 180, k = sstep(0.1 + i * 0.05, 0.3 + i * 0.05, lt);
    if (k <= 0) continue;
    const bad = early.includes(i), p = bad ? back(sstep(3.9 + early.indexOf(i) * 0.25, 4.2 + early.indexOf(i) * 0.25, lt)) : 0;
    timerTop(ctx, x, y, 1.1 * k, p, 100 + i);
    if (bad && p > 0.5) loopInk(ctx, ell(x, y - 60, 62, 100, 30), { seed: CS(11, i), w: 8, color: PAL.red });
  }
  const g = sstep(4.6, 5.0, lt); if (g > 0) title(ctx, '3 popped early', CX, 1050 - 0, 80 * g + 8, PAL.red, { seed: TS(51) });
  const g2 = sstep(6.4, 6.8, lt); if (g2 > 0) { bubble(ctx, 830 - 40, 440, 0 + 95 * g2 + 1, '139°F', '#f6d2c4', TS(53), 52); }
};
// 12 USDA: safe at 165 °F
SC[12] = (lt) => {
  const a = sstep(0, 0.6, lt);
  thermo(ctx, 330, 640, 1.6, lerp(0.2, 0.82, ease(lt / 2)), 3);
  title(ctx, '165°F', 720, 600, 150 * a + 30, PAL.red, { seed: TS(54) });
  const g = sstep(0.8, 1.2, lt); if (g > 0) { title(ctx, 'in the thickest', 700, 760, 64 * g + 6, PAL.ink, { seed: TS(55) }); title(ctx, 'part', 700, 830, 64 * g + 6, PAL.ink, { seed: TS(57) }); }
  title(ctx, 'USDA', CX, 330, 120, BLUE, { seed: TS(56) });
};
// 13 check in three places: thigh, wing, thickest part of the breast
SC[13] = (lt) => {
  turkey(ctx, CX, 880, 1.0, { k: 13, pop: 1 });
  const spots = [[300, 900, 'inner thigh', 210, 520, -0.6, 0.6], [780, 780, 'inner wing', 840, 470, 0.5, 1.5], [470, 720, 'thickest part', 470, 400, 0.05, 2.4]];
  spots.forEach(([x, y, lab, lx, ly, rot, t0], j) => {
    const g = sstep(t0, t0 + 0.4, lt); if (g <= 0) return;
    thermo(ctx, x + Math.sin(rot) * 231, y - Math.cos(rot) * 231, 0.55, 0.82, 10 + j, { rot });
    title(ctx, lab, lx, ly, 70 * g + 8, PAL.red, { seed: TS(60 + j) });
  });
  title(ctx, 'THERMOMETER', CX, 300, 100, PAL.ink, { seed: TS(64) });
};
// 14 payoff: a melting lock is a hint; the thermometer has the final word
SC[14] = (lt) => {
  const g = sstep(0.2, 0.6, lt), g2 = sstep(2.6, 3.0, lt);
  timerCut(ctx, 260, 1060, 0.62, 1, 1, { k: 8 });
  if (g > 0) title(ctx, 'hint', 440, 640, 100 * g + 8, PAL.ink, { seed: TS(66) });
  if (g2 > 0) { star(ctx, 760, 520, 150 * g2 + 1, seedFor(CURD, 67)); thermo(ctx, 760, 520, 0.9, 0.82, 20); title(ctx, 'final word', 740, 980, 84 * g2 + 8, PAL.red, { seed: TS(68) }); }
  title(ctx, 'MELTING LOCK', CX, 300 - 0, 100, PAL.red, { seed: TS(69) });
};
// 15 question
SC[15] = (lt) => {
  turkey(ctx, CX, 900, 1.0, { k: 15, pop: back(sstep(0.3, 0.7, lt)) });
  title(ctx, 'TRUST THE', CX, 320, 110, PAL.ink, { seed: TS(70) });
  title(ctx, 'POP-UP?', CX, 450, 130, PAL.red, { seed: TS(71) });
  const g = sstep(1.2, 1.5, lt); if (g > 0) { bubble(ctx, 250, 620, 90 * g + 1, 'YES', '#c9e7b8', TS(72), 60); bubble(ctx, 830, 620, 90 * g + 1, 'NO', '#f6d2c4', TS(75), 60); }
};
// 16 closing card (standard lines)
SC[16] = (lt) => {
  const a = sstep(0, 0.5, lt);
  title(ctx, 'Follow for more of', CX, 400, 100 * a + 20, PAL.ink, { seed: TS(80) });
  title(ctx, 'how it really works.', CX, 510, 96 * a + 20, PAL.red, { seed: TS(81) });
  ink(ctx, [[180, 590], [900, 595]], { w: 10, seed: TS(82) });
  const b = sstep(0.4, 0.8, lt);
  if (b > 0) { title(ctx, "A new 'wait, really?' every day.", CX, 660, 62, PAL.ink, { seed: TS(83), w: 5 }); title(ctx, '@howitreallyworkstudio', CX, 740, 58, BLUE, { seed: TS(84), w: 5 }); }
  turkey(ctx, CX, 1000, 0.6, { k: 16, pop: 0.12 + 0.1 * Math.abs(Math.sin(lt * 5)) });
};

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 4)); return { s: lerp(1, 1.06, k), px: CX, py: 800, X: CX, Y: 800 }; }
  if (i === 6) { const k = ease(clamp((lt - 1) / 0.8)); return { s: lerp(1, 1.08, k), px: CX, py: 700, X: CX, Y: 700 }; }
  if (i === 12) { const k = ease(clamp(lt / 3)); return { s: lerp(1, 1.05, k), px: CX, py: 700, X: CX, Y: 700 }; }
  return STAGE;
}
function shakesFor(i, S) {
  if (i === 1) return [{ t0: S.start + 0.6, dur: 0.4, amp: 10 }];
  if (i === 6) return [{ t0: S.start + 1.05, dur: 0.5, amp: 16 }];
  if (i === 11) return [{ t0: S.start + 3.9, dur: 0.4, amp: 10 }];
  return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type), inside y 1150-1420
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  let size = 70, maxW = 720, lines = []; let cur = [], cw = 0;
  for (let pass = 0; pass < 2; pass++) {   // long captions: one smaller size so the box stays inside y 1150-1420
  lines = []; cur = []; cw = 0; if (pass) { size = 60; maxW = 740; }
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  if (lines.length <= 3) break; }
  lines.forEach((l) => { while (l.length && l[l.length - 1].sp) l.pop(); });
  const lh = size * 1.02, bh = lines.length * lh + 36, bw = 800, bx = (W - bw) / 2, by = 1420 - bh;
  ctx.save(); ctx.globalAlpha = alpha;
  const box = resample(rect(bx, by, bw, bh), 3, true);
  paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 });
  loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = CX - tw / 2; const y = by + 18 + lh * li + lh / 2;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; ctx.fillStyle = wd.b ? PAL.red : PAL.ink; ctx.fillText(wd.w, x, y); x += wd.ww; }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- frame function
function locate(t) {
  for (let i = 0; i < SEG.length; i++) if (t < SEG[i].end + (i < SEG.length - 1 ? (SEG[i + 1].start - SEG[i].end) * 0.6 : 0) || i === SEG.length - 1) return i;
  return SEG.length - 1;
}
window.DUR = window.TL.total;
function frame(t, i) {
  const S = SEG[i];
  const dur = (i < SEG.length - 1 ? SEG[i + 1].start : window.TL.total) - S.start;
  const D = drawingAt(t, EXPO[i], (i + 1) * 10000);
  CURD = D;
  const lt = clamp(D.tq - S.start, 0, dur);
  const cam = camera(D.t1, shakesFor(i, S));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawPaper(ctx, cam);
  ctx.save();
  ctx.translate(cam.x, cam.y);
  const shot = shotFor(i, lt);
  zoomWeight(shot);
  ctx.save();
  applyShot(ctx, shot);
  SC[i](lt, clamp(lt / dur));
  ctx.restore();
  resetWeight();
  ctx.restore();
  if (i < SEG.length - 1) caption(S.cap, i === 0 ? 1 : sstep(0, 0.2, lt));
  drawTooth(ctx, D);
}
window.seek = (t) => {
  frame(t, locate(t));
  const f = Math.min(1, (window.TL.total - t) / 0.35);   // brief dim into the loop back to frame 0
  if (f < 1) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = (1 - f) * 0.3; ctx.fillStyle = PAL.ink; ctx.fillRect(0, 0, W, H); ctx.restore(); }
};
window.render = window.seek;
window.thumb = () => {
  const D = drawingAt(1, 2, 7); CURD = D;
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0 });
  turkey(ctx, CX, 1150, 1.15, { k: 50, pop: 1 });
  star(ctx, CX + 80, 860, 120, seedFor(D, 3)); speedLines(ctx, CX + 80, 900, 120, 260, 12, seedFor(D, 4));
  title(ctx, 'HOW DOES', CX, 420, 150, PAL.ink, { seed: 11 }); title(ctx, 'IT KNOW?', CX, 590, 170, PAL.red, { seed: 12 });
  drawTooth(ctx, D);
};
window.seek(0);
window.ready = true; window.READY = true;
