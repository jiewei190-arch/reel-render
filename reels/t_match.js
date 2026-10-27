// t_match.js: "How a match really lights" in the cel-boil style, 1080x1920 portrait.
// Animation language: the cel-boil demo via kit_celboil.js (exposure sheet on twos/ones/threes, new boil per drawing,
// shakes and push-ins, off-register colour, paper tooth per drawing). Every frame is a pure function of t (seek).
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

// exposure per scene: hook, strike and flare scenes on ones/twos; titles and the closing card hold on threes
const EXPO = [2, 2, 3, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 3, 3, 2, 2, 3];

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j);
const TS = (n) => seedFor(CURD, 900 + n);
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ease = (u) => E.io3(clamp(u));
const WOOD = '#e6bf7a', WOODSH = '#c99a4e', BOX = '#c9382a', STRIP = '#7d4a2f';

function arrowOn(c, P, col = PAL.ink, k = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 46;
  ink(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 10, color: col, seed: TS(k) });
  ink(c, [[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 10, color: col, seed: TS(k + 1) });
}
function arrow(c, x0, y0, x1, y1, col, k) { ink(c, [[x0, y0], [x1, y1]], { w: 10, color: col, seed: TS(k) }); arrowOn(c, [[x0, y0], [x1, y1]], col, k + 2); }

// flame character: teardrop with an inner flame; fl = flicker phase, g = growth 0..1
function flame(c, x, y, s = 1, o = {}) {
  const { k = 0, g = 1, fl = 0, face = false, blink = 0 } = o;
  if (g <= 0.02) return;
  const S = (j) => CS(500 + k, j);
  const wob = Math.sin(fl * 9) * 14, wob2 = Math.cos(fl * 7) * 10;
  c.save(); c.translate(x, y); c.scale(s * g, s * g);
  const out = spline([[wob * 0.7, -190, 1], [62, -80], [84, 30], [0, 100], [-84, 30], [-62 + wob2, -80]], true, 4);
  paint(c, out, PAL.red, { seed: S(1) });
  const mid = spline([[wob * 0.5, -150, 1], [44, -50], [58, 36], [0, 84], [-58, 36], [-44, -50]], true, 4);
  paint(c, mid, PAL.yel, { seed: S(2) });
  loopInk(c, out, { seed: S(3), w: 7 });
  if (face) {
    [-26, 26].forEach((ex, e) => {
      if (blink > 0.5) ink(c, [[ex - 10, 22], [ex + 10, 22]], { w: 7, seed: S(4 + e) });
      else paint(c, ell(ex, 22, 9, 13, 24), PAL.ink, { seed: S(6 + e), reg: false });
    });
    ink(c, [[-16, 58], [0, 66], [16, 58]], { w: 6, seed: S(9) });
  }
  c.restore();
}

// matchstick, origin at the head centre, stick runs down +y. head colour, lit = head glows
function matchstick(c, x, y, s = 1, rot = 0, o = {}) {
  const { k = 0, len = 520, headCol = PAL.red, face = false, blink = 0, charred = 0 } = o;
  const S = (j) => CS(600 + k, j);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const stick = resample(rect(-17, 10, 34, len), 3, true);
  paint(c, stick, WOOD, { seed: S(1) });
  hatchInk(c, rect(2, 20, 15, len - 20), { seed: S(2), gap: 12, ang: -0.9, w: 2 });
  loopInk(c, stick, { seed: S(3), w: 6 });
  if (charred > 0) paint(c, resample(rect(-17, 10, 34, len * charred), 3, true), PAL.ink, { seed: S(10), reg: false });
  const head = ell(0, -6, 48, 60, 60);
  paint(c, head, headCol, { seed: S(4) });
  loopInk(c, head, { seed: S(5), w: 7 });
  if (face) {
    [-17, 17].forEach((ex, e) => {
      if (blink > 0.5) ink(c, [[ex - 8, -4], [ex + 8, -4]], { w: 6, seed: S(6 + e) });
      else { paint(c, ell(ex, -4, 7, 10, 20), PAL.cream, { seed: S(8 + e), reg: false }); c.fillStyle = PAL.ink; c.beginPath(); c.arc(ex, -2, 3.5, 0, 6.3); c.fill(); }
    });
    ink(c, [[-11, 26], [0, 31], [11, 26]], { w: 5, seed: S(12) });
  }
  c.restore();
}

// matchbox: red tray with a brown striker strip on its side. wide box, origin at its centre.
function box(c, x, y, s = 1, o = {}) {
  const { k = 0, hl = 0, dots = true, label = true } = o;
  const S = (j) => CS(700 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const body = resample(rect(-330, -140, 660, 280), 3, true);
  paint(c, body, BOX, { seed: S(1) });
  hatchInk(c, rect(-330, 30, 660, 110), { seed: S(2), gap: 14, ang: -0.9, w: 2.2 });
  loopInk(c, body, { seed: S(3), w: 9 });
  const strip = resample(rect(-300, -120, 190, 240), 3, true);
  paint(c, strip, STRIP, { seed: S(4) });
  loopInk(c, strip, { seed: S(5), w: 6 });
  if (dots) for (let j = 0; j < 18; j++) {
    const px = -285 + (j % 3) * 60 + (j * 17 % 23), py = -100 + Math.floor(j / 3) * 38 + (j * 11 % 13);
    c.fillStyle = j % 4 === 0 ? PAL.hi : PAL.red; c.beginPath(); c.arc(px, py, j % 4 === 0 ? 5 : 7, 0, 6.3); c.fill();
  }
  if (hl > 0) loopInk(c, strip, { seed: S(6), w: 12, color: PAL.yel });
  if (label) {
    const lab = resample(rect(-60, -70, 340, 140), 3, true);
    paint(c, lab, PAL.cream, { seed: S(7) });
    loopInk(c, lab, { seed: S(8), w: 5 });
    ink(c, [[-30, -20], [240, -20]], { w: 5, seed: S(9) });
    ink(c, [[-30, 10], [180, 10]], { w: 5, seed: S(10) });
    ink(c, [[-30, 40], [210, 40]], { w: 5, seed: S(11) });
  }
  c.restore();
}

function bubble(c, x, y, r, txt, col, seed, size = 44) {
  const e = ell(x, y, r, r, 40);
  paint(c, e, col, { seed });
  loopInk(c, e, { seed: seed + 1, w: 6 });
  title(c, txt, x, y, size, PAL.ink, { seed: seed + 2, w: 5 });
}

// ---------------------------------------------------------------- scenes
const SC = [];

// 0 hook: a match is dragged along the striker, a flame pops up on the head
SC[0] = (lt) => {
  box(ctx, CX, 1010, 1.0, { k: 1, label: false });
  const k = ease(clamp(lt / 1.6));
  const mx = lerp(300, 620, k), my = lerp(640, 790, k);
  matchstick(ctx, mx, my, 0.95, lerp(-0.2, 0.55, k), { k: 2, len: 520 });
  if (lt > 1.4) {
    const g = sstep(1.4, 1.9, lt);
    flame(ctx, mx + 30 * g, my - 120 * g, 0.9, { k: 3, g, fl: lt, face: true, blink: lt % 2.4 > 2.2 ? 1 : 0 });
    for (const sg of [-1, 1]) spark(ctx, mx + sg * 70, my - 40, sg * 380, -240, 20, seedFor(CURD, 720 + sg));
  }
  for (let j = 0; j < 3; j++) ink(ctx, [[300 + j * 40, 820 + j * 18], [210 + j * 40, 800 + j * 18]], { w: 9, color: PAL.red, seed: CS(0, 80 + j) });
};

// 1 half the chemistry is on the box
SC[1] = (lt, u) => {
  box(ctx, CX, 920, 1.05, { k: 5, hl: 1, label: false });
  matchstick(ctx, 880, 640, 0.5, 0.35, { k: 6, len: 360 });
  title(ctx, 'HALF IS ON', CX, 330, 126, PAL.ink, { seed: TS(1) });
  title(ctx, 'THE BOX', CX, 490, 140, PAL.red, { seed: TS(2) });
  arrow(ctx, 200, 640, 230, 780, PAL.red, 3);
};

// 2 heat, fuel, oxygen: three words land one by one
SC[2] = (lt, u) => {
  const items = [['HEAT', PAL.red, 520], ['FUEL', '#c99a4e', 780], ['OXYGEN', '#3d8fd1', 1040]];
  items.forEach(([t, col, y], j) => {
    const g = sstep(j * 0.2, j * 0.2 + 0.18, u);
    if (g <= 0) return;
    const e = resample(rect(CX - 360, y - 100, 720, 190), 3, true);
    paint(ctx, e, col, { seed: TS(10 + j) });
    loopInk(ctx, e, { seed: TS(20 + j), w: 8 });
    title(ctx, t, CX, y - 5, 130 * g + 20, PAL.hi, { seed: TS(30 + j) });
  });
};

// 3 the fire triangle
SC[3] = (lt, u) => {
  const pts = [[CX, 400], [CX + 330, 950], [CX - 330, 950]];
  const g = ease(u * 1.5);
  for (let j = 0; j < 3; j++) {
    const a = pts[j], b = pts[(j + 1) % 3];
    const t = clamp(g * 3 - j);
    if (t > 0) ink(ctx, [a, [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]], { w: 14, seed: TS(40 + j), color: PAL.ink });
  }
  if (u > 0.5) {
    const f = sstep(0.5, 0.75, u);
    flame(ctx, CX, 740, 0.8, { k: 8, g: f, fl: lt, face: true });
  }
  title(ctx, 'heat', CX, 330, 96, PAL.red, { seed: TS(43) });
  title(ctx, 'fuel', CX + 360, 1030, 96, '#b57a2d', { seed: TS(44) });
  title(ctx, 'oxygen', CX - 340, 1030, 96, '#3d8fd1', { seed: TS(45) });
  title(ctx, 'FIRE TRIANGLE', CX, 1230, 100, PAL.ink, { seed: TS(46) });
};

// 4 the head holds fuel: sulfur + antimony sulfide
SC[4] = (lt, u) => {
  matchstick(ctx, CX, 800, 2.2, 0, { k: 9, len: 120, face: true, blink: lt % 2.5 > 2.3 ? 1 : 0 });
  const g = sstep(0.1, 0.4, u), g2 = sstep(0.35, 0.65, u);
  if (g > 0) { bubble(ctx, 220, 520, 130, 'sulfur', '#f2da5a', TS(50), 70); arrow(ctx, 300, 590, 440, 720, PAL.ink, 52); }
  if (g2 > 0) { bubble(ctx, 860, 520, 150, 'antimony', '#b9b9c4', TS(55), 52); title(ctx, 'sulfide', 860, 575, 52, PAL.ink, { seed: TS(58), w: 5 }); arrow(ctx, 780, 610, 650, 720, PAL.ink, 59); }
  title(ctx, 'FUEL', CX, 1180, 150, PAL.red, { seed: TS(60) });
};

// 5 the head holds oxygen: potassium chlorate
SC[5] = (lt, u) => {
  matchstick(ctx, CX, 780, 2.2, 0, { k: 10, len: 120 });
  const cyc = (lt * 0.8) % 1;
  for (let j = 0; j < 5; j++) {
    const t = (cyc + j / 5) % 1, a = -2.3 + j * 0.55;
    const x = CX + Math.cos(a) * (130 + t * 330), y = 780 + Math.sin(a) * (130 + t * 330) - 40;
    bubble(ctx, x, y, 36 * (0.6 + 0.4 * (1 - t)), 'O', '#bfe4ff', TS(70 + j), 40);
  }
  title(ctx, 'potassium chlorate', CX, 1150, 108, PAL.ink, { seed: TS(76) });
  title(ctx, 'OXYGEN SUPPLY', CX, 1290, 90, '#3d8fd1', { seed: TS(77) });
};

// 6 the head won't light alone, it needs heat
SC[6] = (lt, u) => {
  matchstick(ctx, CX, 800, 1.9, 0, { k: 11, len: 160, face: true });
  title(ctx, '?', CX + 190, 560, 190, PAL.red, { seed: TS(80) });
  const g = sstep(0.3, 0.7, u);
  if (g > 0) { for (let j = 0; j < 4; j++) { const a = -1.9 + j * 0.45; ink(ctx, [[CX + Math.cos(a) * 160, 760 + Math.sin(a) * 160], [CX + Math.cos(a) * (160 + 90 * g), 760 + Math.sin(a) * (160 + 90 * g)]], { w: 9, color: PAL.red, seed: TS(81 + j) }); } }
  title(ctx, 'needs a spark of heat', CX, 1200, 100, PAL.ink, { seed: TS(86) });
};

// 7 the striking strip: red phosphorus and powdered glass
SC[7] = (lt, u) => {
  box(ctx, CX, 900, 1.05, { k: 12, hl: 1, label: false });
  const g = sstep(0.1, 0.35, u), g2 = sstep(0.4, 0.7, u);
  if (g > 0) { bubble(ctx, 240, 460, 120, 'red', '#f08a7a', TS(90), 64); title(ctx, 'phosphorus', 240, 640, 62, PAL.ink, { seed: TS(93) }); arrow(ctx, 240, 570, 240, 740, PAL.ink, 94); }
  if (g2 > 0) { bubble(ctx, 830, 470, 120, 'glass', PAL.hi, TS(95), 64); title(ctx, 'powder', 830, 640, 62, PAL.ink, { seed: TS(98) }); arrow(ctx, 700, 560, 400, 760, PAL.ink, 99); }
  title(ctx, 'STRIKING STRIP', CX, 1250, 104, PAL.red, { seed: TS(100) });
};

// 8 drag the match, friction heats a trace of red phosphorus (ones: fast scrape)
SC[8] = (lt, u) => {
  box(ctx, CX, 1000, 1.0, { k: 13, hl: 0, label: false });
  const k = ease(u);
  const mx = lerp(250, 560, k);
  matchstick(ctx, mx, 800 + Math.sin(lt * 40) * 4, 0.9, 0.5, { k: 14, len: 480 });
  for (let j = 0; j < 4; j++) ink(ctx, [[mx - 80 - j * 36, 905 + j * 12], [mx - 20 - j * 36, 930 + j * 12]], { w: 8, color: PAL.red, seed: CS(0, 90 + j) });
  for (let j = 0; j < 3; j++) spark(ctx, mx + 30, 940, -300 - j * 90, -120 + j * 90, 14, seedFor(CURD, 740 + j));
  title(ctx, 'friction', CX, 430, 150, PAL.red, { seed: TS(110) });
  title(ctx, '= heat', CX, 590, 120, PAL.ink, { seed: TS(111) });
};

// 9 a trace of red phosphorus turns white and ignites in air (ones, with a shake)
SC[9] = (lt, u) => {
  const ig = sstep(0.35, 0.5, u);
  const redE = ell(310, 850, 130, 130, 50), whiteE = ell(770, 850, 130, 130, 50);
  paint(ctx, redE, PAL.red, { seed: TS(120) }); loopInk(ctx, redE, { seed: TS(121), w: 7 });
  arrow(ctx, 460, 850, 620, 850, PAL.ink, 122);
  paint(ctx, whiteE, ig > 0.5 ? PAL.hi : '#f3d9d3', { seed: TS(125) }); loopInk(ctx, whiteE, { seed: TS(126), w: 7 });
  title(ctx, 'red', 310, 1040, 90, PAL.red, { seed: TS(127) });
  title(ctx, 'white', 770, 1040, 90, PAL.ink, { seed: TS(128) });
  if (ig > 0) {
    flame(ctx, 770, 650, 0.8, { k: 15, g: ig, fl: lt });
    for (let j = 0; j < 6; j++) { const a = j / 6 * 6.28; spark(ctx, 770 + Math.cos(a) * 160, 850 + Math.sin(a) * 160, Math.cos(a) * 400, Math.sin(a) * 400, 16 * ig, seedFor(CURD, 760 + j)); }
  }
  title(ctx, 'lights in air', CX, 1260, 120, PAL.red, { seed: TS(129) });
};

// 10 the flash heats the head; the chlorate breaks down and releases oxygen
SC[10] = (lt, u) => {
  matchstick(ctx, CX, 800, 2.1, 0, { k: 16, len: 120, headCol: lerp(0, 1, u) > 0.5 ? '#d4532a' : PAL.red });
  for (let j = 0; j < 5; j++) {
    const a = -2.5 + j * 0.5;
    ink(ctx, [[CX + Math.cos(a) * 140, 790 + Math.sin(a) * 140], [CX + Math.cos(a) * 205, 790 + Math.sin(a) * 205]], { w: 9, color: PAL.red, seed: TS(130 + j) });
  }
  const cyc = (lt * 0.7) % 1;
  for (let j = 0; j < 4; j++) {
    const t = (cyc + j / 4) % 1;
    bubble(ctx, CX - 260 + j * 175, 520 - t * 140, 36, 'O', '#bfe4ff', TS(140 + j), 40);
  }
  title(ctx, 'releases oxygen', CX, 1180, 112, '#3d8fd1', { seed: TS(146) });
};

// 11 with oxygen flowing, the fuel catches and the head flares (ones)
SC[11] = (lt, u) => {
  const g = ease(u * 1.4);
  matchstick(ctx, CX, 880, 1.6, 0, { k: 17, len: 190, headCol: '#7a2a1c' });
  flame(ctx, CX, 620, 1.9 * (0.3 + 0.7 * g), { k: 18, g: Math.max(0.05, g), fl: lt, face: true });
  for (let j = 0; j < 6; j++) { const a = -2.6 + j * 0.42; spark(ctx, CX + Math.cos(a) * 130, 700 + Math.sin(a) * 130, Math.cos(a) * 420, Math.sin(a) * 420, 15 * g, seedFor(CURD, 770 + j)); }
  title(ctx, 'FLARE!', CX, 1285, 120, PAL.red, { seed: TS(150) });
};

// 12 the flame lights the wooden stick, soaked in ammonium phosphate so it burns slowly
SC[12] = (lt, u) => {
  const ch = 0.15 + 0.35 * u;
  matchstick(ctx, 540, 420, 1.5, 0.08, { k: 19, len: 440, headCol: PAL.ink, charred: ch });
  flame(ctx, 540 - Math.sin(0.08) * 440 * 1.5 * ch, 420 + Math.cos(0.08) * 440 * 1.5 * ch - 70, 0.7, { k: 20, g: 1, fl: lt });
  bubble(ctx, 860, 660, 120, 'ammonium', '#d9edc9', TS(160), 50);
  title(ctx, 'phosphate', 860, 705, 50, PAL.ink, { seed: TS(163), w: 5 });
  arrow(ctx, 760, 740, 620, 900, PAL.ink, 164);
  title(ctx, 'slow burn', CX, 1250, 130, PAL.ink, { seed: TS(166) });
};

// 13 1827: John Walker sells the first friction matches
SC[13] = (lt, u) => {
  const a = sstep(0, 0.5, lt);
  title(ctx, '1827', CX, 560, 220 * a + 40, PAL.red, { seed: TS(170) });
  matchstick(ctx, 320, 840, 0.9, -0.2, { k: 21, len: 300, face: true });
  matchstick(ctx, 540, 870, 0.9, 0.05, { k: 22, len: 300, face: true });
  matchstick(ctx, 760, 840, 0.9, 0.25, { k: 23, len: 300, face: true });
  title(ctx, 'John Walker', CX, 1290, 110, PAL.ink, { seed: TS(171) });
};

// 14 white phosphorus: toxic to factory workers (warning sign)
SC[14] = (lt, u) => {
  const tri = [[CX, 420, 1], [CX + 300, 940, 1], [CX - 300, 940, 1]];
  const P = resample(tri.map(([x, y]) => [x, y]), 3, true);
  paint(ctx, P, PAL.yel, { seed: TS(180) });
  loopInk(ctx, P, { seed: TS(181), w: 14 });
  title(ctx, '!', CX, 750, 300, PAL.ink, { seed: TS(182) });
  const e = ell(CX + 340, 1010, 70, 70, 40);
  paint(ctx, e, PAL.hi, { seed: TS(183) }); loopInk(ctx, e, { seed: TS(184), w: 7 });
  title(ctx, 'white phosphorus', CX - 110, 1110, 96, PAL.ink, { seed: TS(185) });
  title(ctx, 'TOXIC', CX, 1270, 140, PAL.red, { seed: TS(186) });
};

// 15 red phosphorus, 1845: not toxic, so the safety match
SC[15] = (lt, u) => {
  title(ctx, '1845', CX, 440, 170, PAL.red, { seed: TS(190) });
  const e = ell(CX - 280, 780, 100, 100, 50);
  paint(ctx, e, PAL.red, { seed: TS(191) }); loopInk(ctx, e, { seed: TS(192), w: 8 });
  title(ctx, 'red', CX - 280, 780, 80, PAL.hi, { seed: TS(193) });
  const g = sstep(0.3, 0.6, u);
  if (g > 0) { ink(ctx, [[CX - 130, 800], [CX - 100, 850]], { w: 18, color: '#2f9e44', seed: TS(194) }); ink(ctx, [[CX - 100, 850], [CX - 20, 720]], { w: 18, color: '#2f9e44', seed: TS(195) }); }
  box(ctx, CX + 190, 1050, 0.55, { k: 24, hl: 0, label: false });
  matchstick(ctx, CX + 190, 840, 0.5, 0.1, { k: 25, len: 280 });
  title(ctx, 'SAFETY MATCH', CX, 1280, 110, PAL.ink, { seed: TS(196) });
};

// 16 two-part machine: head + box
SC[16] = (lt, u) => {
  matchstick(ctx, 300, 700, 1.2, 0, { k: 26, len: 300, face: true, blink: lt % 2.4 > 2.2 ? 1 : 0 });
  title(ctx, '+', 520, 900, 200, PAL.red, { seed: TS(200) });
  box(ctx, 780, 960, 0.55, { k: 27, label: false });
  title(ctx, 'head', 300, 520, 100, PAL.ink, { seed: TS(201) });
  title(ctx, 'box', 780, 800, 100, PAL.ink, { seed: TS(202) });
  title(ctx, 'two-part machine', CX, 1290, 110, PAL.red, { seed: TS(203) });
};

// 17 closing card
SC[17] = (lt) => {
  const a = sstep(0, 0.5, lt);
  title(ctx, 'Follow for more of', CX, 760, 110 * a + 30, PAL.ink, { seed: TS(210) });
  title(ctx, 'how it really works.', CX, 880, 106 * a + 30, PAL.red, { seed: TS(211) });
  ink(ctx, [[160, 980], [920, 985]], { w: 12, seed: TS(212) });
  matchstick(ctx, CX, 1190, 0.7, 0, { k: 28, len: 200 });
  flame(ctx, CX, 1085, 0.55, { k: 29, g: 1, fl: lt, face: true, blink: lt % 2.2 > 2.0 ? 1 : 0 });
};

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 1.8)); return { s: lerp(1, 1.12, k), px: CX, py: 800, X: CX, Y: 800 }; }
  if (i === 11) { const k = ease(clamp(lt / 1.2)); return { s: lerp(1, 1.1, k), px: CX, py: 760, X: CX, Y: 760 }; }
  return STAGE;
}
function shakesFor(i, S) {
  if (i === 0) return [{ t0: S.start + 1.5, dur: 0.5, amp: 16 }];
  if (i === 9) return [{ t0: S.start + 0.35 * (S.end - S.start), dur: 0.45, amp: 14 }];
  if (i === 11) return [{ t0: S.start + 0.1, dur: 0.5, amp: 12 }];
  return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type)
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 86, maxW = 900, lines = []; let cur = [], cw = 0;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`;
    const ww = ctx.measureText(wd.w).width;
    if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; }
    if (wd.sp && cur.length === 0) continue;
    cur.push({ ...wd, ww }); cw += ww;
  }
  if (cur.length) lines.push(cur);
  const lh = size * 1.05, bh = lines.length * lh + 44, bw = 980, bx = (W - bw) / 2, by = 1420;
  ctx.save(); ctx.globalAlpha = alpha;
  const box = resample(rect(bx, by, bw, bh), 3, true);
  paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 });
  loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => {
    const tw = ln.reduce((s, x) => s + x.ww, 0);
    let x = CX - tw / 2; const y = by + 22 + lh * li + lh / 2;
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
window.DUR = window.TL.total;
window.seek = (t) => {
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
  caption(S.cap, sstep(0, 0.2, lt));
  drawTooth(ctx, D);
};
window.ready = true;
