// t_cat.js: "Why does a cat always land on its feet?" in the cel-boil style, 1080x1920 portrait.
// Animation language: the cel-boil demo, via kit_celboil.js (exposure sheet on twos / ones / threes,
// a new boil per drawing, shakes and push-ins, off-register colour, paper tooth per drawing).
// Every frame is a pure function of t (seek).
import * as K from './kit_celboil.js';
const { PAL, clamp, lerp, sstep, E, circlePts, resample, drawingAt, seedFor, seedBg,
  ink, loopInk, paint, hatchInk, spark, puff, speedLines, title, camera, drawPaper, drawTooth,
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
// paper sheet: cream plus the photo paper covering the portrait frame (tooth and dust are per drawing, see drawTooth)
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

// ---------------------------------------------------------------- exposure per scene (2 twos, 1 ones, 3 threes)
// hook, falls and flips on ones/twos; the title and the closing card hold on threes
const EXPO = [2, 3, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 1, 3];

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);                          // drawing on screen this frame (set in seek)
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j);     // character seeds: re-boil every drawing
const TS = (n) => seedFor(CURD, 900 + n);               // title seeds
const ell = (cx, cy, rx, ry, n = 80) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ease = (u) => E.io3(clamp(u));
const SHADE = '#e8a01c';                                // shade side of the cel fill

function arrowOn(c, P, col = PAL.ink, k = 21) {
  const a = P[P.length - 2], b = P[P.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 46;
  ink(c, [[b[0] - Math.cos(ang - 0.5) * L, b[1] - Math.sin(ang - 0.5) * L], b], { w: 10, color: col, seed: TS(k) });
  ink(c, [[b[0] - Math.cos(ang + 0.5) * L, b[1] - Math.sin(ang + 0.5) * L], b], { w: 10, color: col, seed: TS(k + 1) });
}
function arcPts(cx, cy, r, a0, a1, n = 40) {
  const P = [];
  for (let j = 0; j <= n; j++) { const a = lerp(a0, a1, j / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return P;
}

// A cat in the cel style, origin at the body centre. bend = front-half rotation about the waist (radians).
// k = identity of this cat (its seeds), blink, legs, tail, fill.
function cat(c, x, y, s = 1, rot = 0, o = {}) {
  const { k = 0, blink = 0, legs = 'sit', tail = true, bend = 0, fill = PAL.yel } = o;
  const S = (j) => CS(k, j);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (tail) ink(c, [[90, 110], [170, 120], [200, 40], [190, -30]], { w: 15, seed: S(1) });
  const back = ell(0, 80, 118, 140);
  paint(c, back, SHADE, { seed: S(2) });
  paint(c, ell(-12, 70, 104, 126), fill, { seed: S(3) });
  hatchInk(c, ell(60, 110, 70, 110, 60), { seed: S(4), gap: 14, ang: -0.9, w: 2.2 }); // shade hatching on the far side
  loopInk(c, back, { seed: S(5), w: 6 });
  // front half: head, ears, chest; rotates about the waist for bending
  c.save(); c.translate(0, 10); c.rotate(bend); c.translate(0, -10);
  const head = ell(0, -110, 100, 92, 70);
  paint(c, head, SHADE, { seed: S(6) });
  paint(c, ell(-10, -118, 88, 80, 60), fill, { seed: S(7) });
  const earL = [[-86, -158], [-96, -256], [-18, -188]], earR = [[86, -158], [96, -256], [18, -188]];
  paint(c, resample(earL, 3, true), fill, { seed: S(8) });
  loopInk(c, resample(earL, 3, true), { seed: S(9), w: 5 });
  paint(c, resample(earR, 3, true), fill, { seed: S(10) });
  loopInk(c, resample(earR, 3, true), { seed: S(11), w: 5 });
  loopInk(c, head, { seed: S(12) });
  [-38, 38].forEach((ex, e) => {
    if (blink > 0.5) ink(c, [[ex - 16, -118], [ex + 16, -118]], { w: 8, seed: S(13 + e) });
    else {
      paint(c, ell(ex, -118, 12, 17, 30), PAL.ink, { seed: S(15 + e), reg: false });
      c.fillStyle = PAL.hi; c.beginPath(); c.arc(ex + 4, -124, 4, 0, 6.3); c.fill();
    }
  });
  paint(c, resample([[-7, -92], [7, -92], [0, -82]], 3, true), PAL.red, { seed: S(17), amp: 1 });
  ink(c, [[0, -82], [0, -72]], { w: 6, seed: S(18) });
  ink(c, [[-18, -66], [0, -72], [18, -66]], { w: 6, seed: S(19) });
  c.restore();
  // legs
  const L = legs === 'out'
    ? [[[-80, 140], [-150, 200]], [[80, 140], [150, 200]], [[-40, 200], [-50, 250]], [[40, 200], [50, 250]]]
    : [[[-70, 180], [-74, 215]], [[70, 180], [74, 215]]];
  L.forEach((P, e) => ink(c, P, { w: 14, seed: S(20 + e) }));
  c.restore();
}

// spine: vertebrae along a column. twist = rotation of the top half (radians)
function spine(n, cx, cy, shown, twist = 0, k = 60) {
  for (let j = 0; j < n; j++) {
    if (j > shown) continue;
    const u = j / (n - 1);
    const tw = u > 0.5 ? twist * (u - 0.5) * 2 : 0;
    const x = cx + Math.sin(tw) * 30, y = cy + (u - 0.5) * 780;
    const v = ell(x, y, 40, 22, 26);
    paint(ctx, v, j % 2 ? PAL.yel : PAL.cream, { seed: CS(k, j) });
    loopInk(ctx, v, { seed: CS(k + 10, j), w: 7 });
  }
}

// ---------------------------------------------------------------- scenes (lt = seconds into phrase on the exposure, u = 0..1)
const SC = [];

// 0 hook: a cat falls upside down and rights itself; the landing puffs dust
SC[0] = (lt) => {
  const k = ease(clamp(lt / 1.8));
  cat(ctx, CX, lerp(700, 860, k), 1.2, lerp(Math.PI, 0, k), { k: 1, legs: 'out' });
  for (let j = 0; j < 4; j++) ink(ctx, [[160 + j * 30, 640 + j * 90], [60 + j * 30, 600 + j * 90]], { w: 10, seed: CS(0, 80 + j), color: PAL.red });
  if (lt > 1.7 && lt < 2.4) {
    const g = sstep(1.7, 2.0, lt);
    for (const sg of [-1, 1]) {
      puff(ctx, CX + sg * 110, 1110, 34 * g, seedFor(CURD, 700 + sg), { w: 4 });
      spark(ctx, CX + sg * 150, 1080, sg * 420, -160, 22, seedFor(CURD, 720 + sg));
    }
  }
};

// 1 the name
SC[1] = (lt) => {
  const a = sstep(0, 0.6, lt);
  title(ctx, 'THE FALLING', CX, 620, 132 * a + 40, PAL.ink, { seed: TS(1) });
  title(ctx, 'CAT PROBLEM', CX, 800, 118 * a + 40, PAL.red, { seed: TS(2) });
  ink(ctx, [[180, 900], [900, 905]], { w: 14, seed: TS(3) });
  cat(ctx, CX, 1200, 1.0, 0, { k: 4, blink: lt % 2.4 > 2.2 ? 1 : 0 });
};

// 2 no spin, nothing pushes it: straight drop with arrows showing zero spin and no push
SC[2] = (lt, u) => {
  const y = lerp(560, 1000, ease(u));
  cat(ctx, CX, y, 1.0, 0, { k: 9, legs: 'out' });
  title(ctx, 'no spin', 230, 760, 110, PAL.red, { seed: TS(4) });
  title(ctx, 'no push', 850, 760, 110, PAL.red, { seed: TS(5) });
  arrowOn(ctx, [[330, 800], [420, 900]], PAL.red, 30);
  arrowOn(ctx, [[760, 800], [680, 900]], PAL.red, 31);
};

// 3 Marey 1894: a film strip of falling cat frames
SC[3] = (lt, u) => {
  const frames = 5, fw = 180;
  ink(ctx, [[60, 700], [1020, 700]], { w: 12, seed: TS(6) });
  ink(ctx, [[60, 1040], [1020, 1040]], { w: 12, seed: TS(7) });
  for (let j = 0; j < frames; j++) {
    const x = 60 + j * (fw + 20) + 10;
    const on = sstep(j * 0.03, j * 0.03 + 0.08, u);
    const r = resample(rect(x, 760, fw, 240), 3, true);
    paint(ctx, r, PAL.cream, { seed: CS(130, j) });
    loopInk(ctx, r, { seed: CS(140, j), w: 6 });
    if (on > 0) cat(ctx, x + fw / 2, 880, 0.4, lerp(Math.PI * 0.8, 0, j / (frames - 1)), { k: 150 + j, legs: 'out' });
  }
  title(ctx, '1894', CX, 560, 170, PAL.red, { seed: TS(8) });
  title(ctx, 'Marey photographed them', CX, 1200, 100, PAL.ink, { seed: TS(9) });
};

// 4 not a rigid block: the cat bends in the middle
SC[4] = (lt, u) => {
  const bend = Math.sin(u * Math.PI * 2) * 0.35;
  cat(ctx, CX, 880, 1.15, 0, { k: 160, bend, legs: 'out' });
  title(ctx, 'a flexible body', CX, 1290, 120, PAL.red, { seed: TS(10) });
};

// 5 senses which way is down: inner-ear loops and a down arrow
SC[5] = (lt, u) => {
  const head = ell(CX, 760, 230, 260, 100);
  paint(ctx, head, PAL.cream, { seed: TS(11) });
  loopInk(ctx, head, { seed: TS(12) });
  [[0.2, PAL.red], [-0.9, PAL.yel], [1.1, PAL.ink]].forEach(([r, col], j) => {
    const g = sstep(j * 0.15, j * 0.15 + 0.35, u);
    if (g > 0) {
      ctx.save(); ctx.translate(CX, 760); ctx.rotate(r); ctx.translate(-CX, -760);
      loopInk(ctx, ell(CX, 760, 150 * g, 60 * g, 50), { seed: TS(13 + j), w: 14, color: col });
      ctx.restore();
    }
  });
  arrowOn(ctx, [[CX, 1080], [CX, 1180]], PAL.red, 190);
  title(ctx, 'which way is down', CX, 1290, 110, PAL.ink, { seed: TS(16) });
};

// 6 bends in the middle, front half turns first
SC[6] = (lt, u) => {
  const bend = lerp(0, 0.9, ease(u));
  cat(ctx, CX, 860, 1.15, 0, { k: 200, bend, legs: 'out' });
  title(ctx, 'front first', CX, 1290, 130, PAL.red, { seed: TS(17) });
};

// 7 front swings up to 90 degrees, back only about 10
SC[7] = (lt, u) => {
  const a = sstep(0, 0.5, u);
  cat(ctx, CX, 860, 1.0, 0, { k: 210, bend: 0.6 * a, legs: 'out' });
  ink(ctx, arcPts(CX, 860, 300, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * a), { w: 12, seed: TS(18), color: PAL.red });
  ink(ctx, arcPts(CX, 860, 360, Math.PI / 2, Math.PI / 2 + 0.18 * a), { w: 12, seed: TS(19), color: PAL.ink });
  title(ctx, '90°', 820, 520, 120, PAL.red, { seed: TS(20) });
  title(ctx, 'about 10°', 820, 1080, 100, PAL.ink, { seed: TS(21) });
};

// 8 reverses: front legs out, back legs tucked
SC[8] = (lt, u) => {
  const flip = sstep(0, 0.6, u);
  cat(ctx, CX, 860, 1.0, 0, { k: 230, bend: lerp(0.6, -0.6, flip), legs: 'out' });
  title(ctx, 'then reverse', CX, 1290, 120, PAL.red, { seed: TS(22) });
};

// 9 repeat until a full 180 degrees
SC[9] = (lt, u) => {
  const rot = lerp(Math.PI, 0, ease(u));
  const track = arcPts(CX, 860, 330, Math.PI * 1.02, Math.PI * 0.02, 60);
  ink(ctx, track, { w: 12, seed: TS(23), color: PAL.red });
  arrowOn(ctx, arcPts(CX, 860, 330, Math.PI * 1.02, Math.PI * 0.02 + 0.02, 60), PAL.red, 241);
  cat(ctx, CX, 860, 0.95, rot, { k: 242, legs: 'out' });
  title(ctx, '180°', CX, 1290, 150, PAL.red, { seed: TS(24) });
};

// 10 a flexible spine
SC[10] = (lt, u) => {
  spine(9, CX, 880, Math.floor(9 * clamp(u * 1.3)));
  title(ctx, 'a flexible spine', CX, 1290, 120, PAL.ink, { seed: TS(25) });
};

// 11 Japanese researchers twisted spines and dropped live cats
SC[11] = (lt, u) => {
  spine(9, 330, 760, 9);
  const y = lerp(520, 960, ease(clamp(u * 1.4)));
  cat(ctx, 760, y, 0.75, lerp(Math.PI * 0.6, 0, ease(clamp(u * 1.4))), { k: 250, legs: 'out' });
  title(ctx, 'Japan study', CX, 1300, 120, PAL.red, { seed: TS(26) });
};

// 12 upper spine twists more and is less stiff
SC[12] = (lt, u) => {
  spine(9, CX, 720, 9, 0.5 * sstep(0, 0.6, u));
  title(ctx, 'upper: twists more', CX, 1250, 96, PAL.red, { seed: TS(27) });
  title(ctx, 'lower: stiffer', CX, 1345, 96, PAL.ink, { seed: TS(28) });
};

// 13 tails help, but tailless cats still land on their feet
SC[13] = () => {
  cat(ctx, 300, 860, 0.8, 0, { k: 260, legs: 'sit', tail: true });
  cat(ctx, 780, 860, 0.8, 0, { k: 270, legs: 'sit', tail: false });
  title(ctx, 'with tail', 300, 1200, 100, PAL.ink, { seed: TS(29) });
  title(ctx, 'no tail', 780, 1200, 100, PAL.ink, { seed: TS(30) });
};

// 14 reflex starts at 3 to 4 weeks old
SC[14] = (lt, u) => {
  const a = sstep(0, 0.4, u);
  cat(ctx, CX, 880, 0.55 * a + 0.01, 0, { k: 280, legs: 'sit' });
  title(ctx, '3 to 4 weeks old', CX, 1220, 130, PAL.red, { seed: TS(31) });
};

// 15 next time a cat drops off a shelf
SC[15] = (lt, u) => {
  ink(ctx, [[120, 620], [960, 620]], { w: 16, seed: TS(32) });
  const drop = ease(clamp((u - 0.35) / 0.4));
  cat(ctx, CX, lerp(470, 1120, drop), 0.85, drop * 0.5, { k: 360, legs: drop > 0.95 ? 'sit' : 'out' });
  if (drop > 0.95) for (let j = -2; j <= 2; j++) ink(ctx, [[CX + j * 80, 1190], [CX + j * 120, 1160]], { w: 7, seed: TS(33 + j + 2) });
  title(ctx, 'you know why', CX, 1290, 120, PAL.ink, { seed: TS(38) });
};

// 16 closing card
SC[16] = (lt) => {
  const a = sstep(0, 0.5, lt);
  title(ctx, 'Follow for more of', CX, 760, 110 * a + 30, PAL.ink, { seed: TS(39) });
  title(ctx, 'how it really works.', CX, 880, 106 * a + 30, PAL.red, { seed: TS(40) });
  ink(ctx, [[160, 980], [920, 985]], { w: 12, seed: TS(41) });
  cat(ctx, CX, 1210, 0.8, 0, { k: 390, blink: lt % 2.2 > 2.0 ? 1 : 0 });
};

// ---------------------------------------------------------------- shots and shakes per scene
// push-in on the hook; shake on the landing beats (hook at 1.8 s, drops at 85% of the phrase)
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 1.8)); return { s: lerp(1, 1.14, k), px: CX, py: 760, X: CX, Y: 760 }; }
  if (i === 15) return { s: 1.08, px: CX, py: 800, X: CX, Y: 800 };
  return STAGE;
}
function shakesFor(i, S) {
  if (i === 0) return [{ t0: S.start + 1.8, dur: 0.5, amp: 18 }];
  if (i === 2 || i === 11 || i === 15) return [{ t0: S.start + 0.85 * (S.end - S.start), dur: 0.45, amp: 10 }];
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
  // exposure sheet: this scene's drawing is held on its own step; the animation clock reads the held drawing
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
