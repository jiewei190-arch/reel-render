// t_glowstick.js: "How a glow stick glows with no battery" in the cel-boil style (template #11), 1080x1920 portrait.
// Animation language from the cel-boil demo via kit_celboil.js (exposure sheet on ones/twos/threes, new boil per drawing,
// shakes on snap/crack/flash, off-register colour, paper tooth per drawing). Halloween: night-wash cels, pumpkin, bats, ghost.
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
const EXPO = [1, 2, 2, 2, 2, 3, 1, 2, 1, 2, 2, 1, 2, 2, 2, 2, 3];

// ---------------------------------------------------------------- palette additions
const NIGHT = '#272b52', LIME = '#b9f23f', LIMEHI = '#eaff9e', GLASS = '#d8eef7', UNLIT = '#ecebc0';
const BLUE = '#3d8fd1', ORANGE = '#f08a24', PINK = '#ff6fae', CYAN = '#4fd6ff', HOT = '#e5402b';

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
function night(c, stars = true) {
  paint(c, resample(rect(-60, -60, W + 120, H + 120), 3, true), NIGHT, { seed: BS(0), reg: false });
  if (stars) [[120, 200], [930, 260], [800, 560], [180, 700], [960, 1060], [90, 1180]].forEach(([x, y], j) =>
    star(c, x, y, 16 + (j % 3) * 5, BS(10 + j), { n: 8, fill: PAL.hi }));
}

// flat cel glow: three off-register rings, no gradients (the demo paints light as flat shapes)
function halo(c, x, y, rx, ry, a, col = LIME, k = 0) {
  if (a <= 0.01) return;
  c.save();
  [[1.55, 0.2], [1.3, 0.3], [1.1, 0.42]].forEach(([m, al], j) => {
    c.globalAlpha = al * a;
    paint(c, ell(x, y, rx * m, ry * m, 60), col, { seed: CS(300 + k, j), amp: 2.5, reg: false });
  });
  c.restore();
}

// glow stick: origin at its centre, vertical. bend (rad) folds it at the middle, crack 0..1 shows the glass splitting,
// lit 0..1 turns the liquid to its glow colour, cut = show the cutaway (glass vial visible)
function glowStick(c, x, y, s = 1, rot = 0, o = {}) {
  const { k = 0, L = 520, lit = 0, col = LIME, face = false, blink = 0, bend = 0, crack = 0, cut = true, glow = true, mix = 0 } = o;
  const S = (j) => CS(400 + k, j);
  const hw = 54, hl = L / 4;
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  if (glow && lit > 0) {
    halo(c, 0, 0, hw * 1.9, L * 0.56, lit, col, k);
    if (lit > 0.5) for (let j = 0; j < 10; j++) { const a = j / 10 * 6.283 + 0.2, r0x = hw * 2.3, r0y = L * 0.5; ink(c, [[Math.cos(a) * r0x, Math.sin(a) * r0y], [Math.cos(a) * (r0x + 46), Math.sin(a) * (r0y + 46)]], { w: 7, color: LIMEHI, seed: S(60 + j) }); }
  }
  const fill = lit > 0.5 ? col : UNLIT;
  [-1, 1].forEach((sg, h) => {
    c.save(); c.rotate(sg * bend / 2); // each half hinges at the centre
    const cy = sg * hl;
    const body = capsule(0, cy, hw, hl - 6, 16);
    paint(c, body, fill, { seed: S(1 + h) });
    if (lit > 0.5) { c.save(); c.globalAlpha = 0.85; paint(c, capsule(-hw * 0.38, cy, hw * 0.16, hl - 30, 8), LIMEHI, { seed: S(3 + h), reg: false }); c.restore(); }
    else hatchInk(c, rect(hw * 0.25, cy - hl, hw * 0.7, hl * 2), { seed: S(5 + h), gap: 13, ang: -0.9, w: 2 });
    if (cut) {
      const vial = capsule(0, cy, hw * 0.36, hl - 34, 10);
      c.save(); c.globalAlpha = lit > 0.5 ? 0.35 : 0.9; paint(c, vial, GLASS, { seed: S(7 + h), reg: false }); c.restore();
      loopInk(c, vial, { seed: S(9 + h), w: 4.5, color: '#4d6d86' });
    }
    if (mix > 0) for (let j = 0; j < 9; j++) { // mixing swirl dots
      const a = j * 2.1 + mix * 7 + h, r = hw * 0.55 * ((j % 3) / 3 + 0.3);
      c.fillStyle = j % 2 ? '#ffffff' : '#7fb52a';
      c.beginPath(); c.arc(Math.cos(a) * r, cy + Math.sin(a * 1.3) * hl * 0.7, 7, 0, 6.3); c.fill();
    }
    loopInk(c, body, { seed: S(11 + h), w: 8 });
    c.restore();
  });
  if (crack > 0) { // zigzag cracks in the glass at the hinge + flying shards
    for (let j = 0; j < 3; j++) {
      const yy = -20 + j * 20, xx = -hw * 0.3;
      ink(c, [[xx, yy], [xx + 14, yy - 10], [xx + 26, yy + 8], [xx + 40, yy - 6]], { w: 5, seed: S(20 + j), color: '#2b4d66' });
    }
    for (let j = 0; j < 5; j++) {
      const a = -2.6 + j * 0.9, d = 70 + 160 * crack;
      const sh = [[0, -12], [10, 6], [-8, 10]].map(([px, py]) => [Math.cos(a) * d + px, Math.sin(a) * d * 0.6 + py]);
      paint(c, sh, GLASS, { seed: S(30 + j), reg: false }); loopInk(c, sh, { seed: S(35 + j), w: 4, color: '#2b4d66' });
    }
  }
  if (face) {
    c.save(); c.rotate(-bend / 2);
    const fy = -hl * 0.9;
    [-20, 20].forEach((ex, e) => {
      if (blink > 0.5) ink(c, [[ex - 9, fy], [ex + 9, fy]], { w: 6, seed: S(40 + e) });
      else { paint(c, ell(ex, fy, 9, 13, 20), PAL.ink, { seed: S(42 + e), reg: false }); c.fillStyle = PAL.hi; c.beginPath(); c.arc(ex + 3, fy - 4, 3.5, 0, 6.3); c.fill(); }
    });
    ink(c, [[-14, fy + 28], [0, fy + 38], [14, fy + 28]], { w: 6, seed: S(44) });
    c.restore();
  }
  c.restore();
}

// atoms and molecules (ball and stick, boiled)
function atom(c, x, y, r, col, lab, seed, ls) {
  const e = ell(x, y, r, r, 36);
  paint(c, e, col, { seed }); loopInk(c, e, { seed: seed + 1, w: 6 });
  if (lab) title(c, lab, x, y - 4, ls || r * 1.1, PAL.ink, { seed: seed + 2, w: 4 });
}
function bond(c, a, b, seed, dbl = false) {
  if (!dbl) { ink(c, [a, b], { w: 12, seed }); return; }
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * 9, ny = dx / L * 9;
  ink(c, [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny]], { w: 8, seed });
  ink(c, [[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny]], { w: 8, seed: seed + 1 });
}
function peroxide(c, x, y, s = 1, k = 0, wob = 0) { // H-O-O-H
  const S = (j) => CS(800 + k, j);
  c.save(); c.translate(x, y); c.rotate(Math.sin(wob) * 0.15); c.scale(s, s);
  const P = [[-150, 40], [-55, -10], [55, 10], [150, -40]];
  for (let j = 0; j < 3; j++) bond(c, P[j], P[j + 1], S(j));
  atom(c, ...P[0], 34, PAL.hi, 'H', S(5)); atom(c, ...P[3], 34, PAL.hi, 'H', S(8));
  atom(c, ...P[1], 50, HOT, 'O', S(11)); atom(c, ...P[2], 50, HOT, 'O', S(14));
  c.restore();
}
function hexPts(x, y, r) { const P = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return P; }
function oxalate(c, x, y, s = 1, k = 0, wob = 0) { // phenyl rings either side of the oxalate core
  const S = (j) => CS(850 + k, j);
  c.save(); c.translate(x, y); c.rotate(Math.sin(wob) * 0.1); c.scale(s, s);
  [-1, 1].forEach((sg, h) => {
    const hp = resample(hexPts(sg * 230, 0, 70), 3, true);
    paint(c, hp, '#d9d3c4', { seed: S(1 + h) }); loopInk(c, hp, { seed: S(3 + h), w: 7 });
    loopInk(c, resample(hexPts(sg * 230, 0, 42), 3, true), { seed: S(5 + h), w: 4 });
    bond(c, [sg * 160, 0], [sg * 110, 0], S(7 + h));
  });
  bond(c, [-60, 0], [60, 0], S(9));
  bond(c, [-60, 0], [-60, -90], S(10), true); bond(c, [60, 0], [60, 90], S(11), true);
  atom(c, -110, 0, 30, HOT, 'O', S(12)); atom(c, 110, 0, 30, HOT, 'O', S(15));
  atom(c, -60, 0, 34, '#7b7b86', 'C', S(18)); atom(c, 60, 0, 34, '#7b7b86', 'C', S(21));
  atom(c, -60, -100, 30, HOT, 'O', S(24)); atom(c, 60, 100, 30, HOT, 'O', S(27));
  c.restore();
}
function ring4(c, x, y, s = 1, k = 0, jit = 0) { // the unstable four-atom ring (1,2-dioxetanedione)
  const S = (j) => CS(880 + k, j);
  const jx = (j) => (K.hs ? (K.hs(CURD.id, j + k) - 0.5) : 0) * jit;
  c.save(); c.translate(x + jx(1) * 30, y + jx(2) * 30); c.scale(s, s);
  const P = [[-70, -70], [70, -70], [70, 70], [-70, 70]];
  for (let j = 0; j < 4; j++) bond(c, P[j], P[(j + 1) % 4], S(j));
  bond(c, P[0], [-170, -150], S(5), true); bond(c, P[1], [170, -150], S(6), true);
  atom(c, -175, -155, 34, HOT, 'O', S(7)); atom(c, 175, -155, 34, HOT, 'O', S(10));
  atom(c, ...P[0], 40, '#7b7b86', 'C', S(13)); atom(c, ...P[1], 40, '#7b7b86', 'C', S(16));
  atom(c, ...P[2], 40, HOT, 'O', S(19)); atom(c, ...P[3], 40, HOT, 'O', S(22));
  c.restore();
}
function co2(c, x, y, s = 1, k = 0, rot = 0) {
  const S = (j) => CS(920 + k, j);
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  bond(c, [-100, 0], [0, 0], S(1), true); bond(c, [0, 0], [100, 0], S(2), true);
  atom(c, -105, 0, 38, HOT, 'O', S(3)); atom(c, 105, 0, 38, HOT, 'O', S(6)); atom(c, 0, 0, 42, '#7b7b86', 'C', S(9));
  c.restore();
}
// the dye: three fused rings (anthracene-like core of real glow-stick dyes) as a character with a face
function dye(c, x, y, s = 1, o = {}) {
  const { k = 0, col = LIME, face = true, blink = 0, glow = 0, mouth = 0 } = o;
  const S = (j) => CS(950 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) halo(c, 0, 0, 260, 150, glow, col, 50 + k);
  const r = 80;
  [-1, 0, 1].forEach((j) => {
    const hp = resample(hexPts(j * r * Math.sqrt(3), 0, r), 3, true);
    paint(c, hp, col, { seed: S(1 + j + 1) }); loopInk(c, hp, { seed: S(5 + j + 1), w: 8 });
  });
  if (face) {
    [-34, 34].forEach((ex, e) => {
      if (blink > 0.5) ink(c, [[ex - 10, -8], [ex + 10, -8]], { w: 7, seed: S(10 + e) });
      else { paint(c, ell(ex, -8, 11, 15, 20), PAL.ink, { seed: S(12 + e), reg: false }); c.fillStyle = PAL.hi; c.beginPath(); c.arc(ex + 4, -13, 4, 0, 6.3); c.fill(); }
    });
    if (mouth > 0.5) paint(c, ell(0, 34, 16, 20, 20), PAL.ink, { seed: S(15), reg: false });
    else ink(c, [[-18, 28], [0, 40], [18, 28]], { w: 7, seed: S(16) });
  }
  c.restore();
}
function battery(c, x, y, s = 1, k = 0) {
  const S = (j) => CS(980 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const b = resample(rect(-70, -130, 140, 260), 3, true), cap = resample(rect(-30, -160, 60, 30), 3, true);
  paint(c, cap, '#b8b8c2', { seed: S(1) }); loopInk(c, cap, { seed: S(2), w: 6 });
  paint(c, b, ORANGE, { seed: S(3) }); paint(c, resample(rect(-70, 20, 140, 110), 3, true), PAL.ink, { seed: S(4), reg: false });
  loopInk(c, b, { seed: S(5), w: 8 });
  title(c, '+', 0, -60, 90, PAL.ink, { seed: S(6) });
  c.restore();
}
function bigX(c, x, y, r, k) { ink(c, [[x - r, y - r], [x + r, y + r]], { w: 22, color: HOT, seed: TS(k) }); ink(c, [[x + r, y - r], [x - r, y + r]], { w: 22, color: HOT, seed: TS(k + 1) }); }
function pumpkin(c, x, y, s = 1, k = 0, lit = 1) {
  const S = (j) => CS(1000 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const st = resample(rect(-14, -150, 28, 50), 3, true); paint(c, st, '#5b7a2a', { seed: S(1) }); loopInk(c, st, { seed: S(2), w: 6 });
  [[-70, 0, 90], [70, 0, 90], [0, 0, 100]].forEach(([dx, dy, rx], j) => {
    const e = ell(dx, dy, rx, 110, 50); paint(c, e, ORANGE, { seed: S(3 + j) }); loopInk(c, e, { seed: S(6 + j), w: 7 });
  });
  const eyeCol = lit > 0.5 ? PAL.yel : PAL.ink;
  [[-50, -25], [50, -25]].forEach(([ex, ey], j) => { const t = [[ex - 26, ey + 16], [ex, ey - 22], [ex + 26, ey + 16]]; paint(c, t, eyeCol, { seed: S(10 + j), reg: false }); loopInk(c, t, { seed: S(12 + j), w: 5 }); });
  const m = [[-60, 35], [-30, 50], [0, 38], [30, 50], [60, 35], [30, 75], [0, 64], [-30, 75]];
  paint(c, m, eyeCol, { seed: S(14), reg: false }); loopInk(c, resample(m, 3, true), { seed: S(15), w: 5 });
  c.restore();
}
function bat(c, x, y, s, flap, k) {
  const S = (j) => CS(1050 + k, j), f = Math.sin(flap) * 18;
  const P = [[0, -10], [30, -30 - f], [70, -40 - f], [110, -20 - f * 0.5], [90, 0], [70, -6], [50, 10], [24, 6], [0, 20], [-24, 6], [-50, 10], [-70, -6], [-90, 0], [-110, -20 - f * 0.5], [-70, -40 - f], [-30, -30 - f]];
  c.save(); c.translate(x, y); c.scale(s, s);
  paint(c, resample(P, 3, true), '#141228', { seed: S(1), reg: false });
  c.restore();
}
function ghost(c, x, y, s, k, lt) {
  const S = (j) => CS(1080 + k, j), bob = Math.sin(lt * 3) * 12;
  c.save(); c.translate(x, y + bob); c.scale(s, s);
  const P = [[0, -110, 1], [70, -80], [80, 20], [85, 110], [50, 85], [20, 115], [-15, 85], [-50, 115], [-85, 100], [-78, 10], [-70, -80]];
  const g = spline(P, true, 4);
  paint(c, g, PAL.hi, { seed: S(1) }); loopInk(c, g, { seed: S(2), w: 7 });
  paint(c, ell(-24, -30, 10, 16, 20), PAL.ink, { seed: S(3), reg: false }); paint(c, ell(24, -30, 10, 16, 20), PAL.ink, { seed: S(4), reg: false });
  paint(c, ell(0, 14, 12, 15, 20), PAL.ink, { seed: S(5), reg: false });
  c.restore();
}
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
function bulb(c, x, y, s, k, lt) {
  const S = (j) => CS(1130 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = spline([[0, -150, 1], [100, -90], [95, 20], [45, 80], [-45, 80], [-95, 20], [-100, -90]], true, 4);
  paint(c, g, PAL.yel, { seed: S(1) }); loopInk(c, g, { seed: S(2), w: 8 });
  ink(c, [[-30, 70], [-20, -30], [0, 0], [20, -30], [30, 70]], { w: 6, color: HOT, seed: S(3) });
  const base = resample(rect(-45, 80, 90, 80), 3, true); paint(c, base, '#b8b8c2', { seed: S(4) }); loopInk(c, base, { seed: S(5), w: 7 });
  hatchInk(c, rect(-45, 80, 90, 80), { seed: S(6), gap: 16, ang: 0, w: 3 });
  for (let j = 0; j < 3; j++) { const xx = -60 + j * 60, ph = lt * 4 + j; ink(c, [[xx, -190], [xx + Math.sin(ph) * 14, -230], [xx, -270], [xx + Math.sin(ph + 1) * 14, -310]], { w: 8, color: HOT, seed: S(7 + j) }); }
  c.restore();
}
function cup(c, x, y, s, col, k) {
  const S = (j) => CS(1160 + k, j);
  c.save(); c.translate(x, y); c.scale(s, s);
  const P = resample([[-130, -150], [130, -150], [105, 150], [-105, 150]], 3, true);
  c.save(); c.globalAlpha = 0.85; paint(c, resample([[-122, -90], [122, -90], [105, 150], [-105, 150]], 3, true), col, { seed: S(1) }); c.restore();
  loopInk(c, P, { seed: S(2), w: 8 });
  c.restore();
}
function clockFace(c, x, y, r, frac, col, k) { // a timer pie: how long the glow lasts
  const S = (j) => CS(1190 + k, j);
  const e = ell(x, y, r, r, 40); paint(c, e, PAL.hi, { seed: S(1) });
  if (frac > 0.01) { const P = [[x, y]]; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + frac * Math.PI * 2 * i / 30; P.push([x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85]); } paint(c, P, col, { seed: S(2), reg: false }); }
  loopInk(c, e, { seed: S(3), w: 7 });
}
function bubble(c, x, y, r, txt, col, seed, size = 44) {
  const e = ell(x, y, r, r, 40);
  paint(c, e, col, { seed });
  loopInk(c, e, { seed: seed + 1, w: 6 });
  title(c, txt, x, y, size, PAL.ink, { seed: seed + 2, w: 5 });
}

// a cut-paper title plaque so boiled titles read on the night wash
function plaque(c, str, cx, cy, size, col, k, o = {}) {
  c.save(); c.font = `700 ${size}px Caveat`; const w = c.measureText(str).width * 1.08 + 70; c.restore();
  const h = size * 1.12, P = resample(rect(cx - w / 2, cy - h / 2, w, h), 3, true);
  paint(c, P, o.bg ?? PAL.cream, { seed: TS(k + 400) }); loopInk(c, P, { seed: TS(k + 401), w: 7 });
  title(c, str, cx, cy, size, col, { seed: TS(k) });
}

// ---------------------------------------------------------------- scenes
const SC = [];

// 0 hook: night; a big glow stick is already bending at frame 0, snaps at 0.75 s and lights up
SC[0] = (lt) => {
  night(ctx);
  bat(ctx, 200 + lt * 60, 470 - lt * 20, 0.9, lt * 14, 1); bat(ctx, 860 - lt * 50, 560, 0.7, lt * 14 + 1, 2);
  const sn = 0.75;
  const bend = lt < sn ? lerp(0.18, 0.62, ease(lt / sn)) : lerp(0.62, 0.12, ease((lt - sn) / 0.5));
  const lit = sstep(sn, sn + 0.25, lt);
  glowStick(ctx, CX, 900, 1.15, 0, { k: 1, bend, lit, face: true, blink: blinkAt(lt), crack: lt > sn ? sstep(sn, sn + 0.4, lt) * (lt < sn + 0.9 ? 1 : 0) : 0 });
  if (lt > sn && lt < sn + 0.6) { star(ctx, CX - 10, 900, 120 * sstep(sn, sn + 0.15, lt), seedFor(CURD, 30), { fill: PAL.hi }); speedLines(ctx, CX, 900, 170, 330, 12, seedFor(CURD, 31), 8); }
  pumpkin(ctx, 190, 1220, 0.75, 3, lit);
  plaque(ctx, 'GLOWS WITH', CX, 235, 118, PAL.red, 1);
  plaque(ctx, 'NO BATTERY?', CX, 395, 132, '#4f8a10', 2);
};

// 1 no wire inside: the battery is crossed out; a reaction flask appears instead
SC[1] = (lt, u) => {
  night(ctx);
  glowStick(ctx, 300, 820, 0.95, -0.12, { k: 2, lit: 1, face: true, blink: blinkAt(lt) });
  battery(ctx, 790, 640, 0.9, 1);
  const g = sstep(0.05, 0.25, u);
  if (g > 0) bigX(ctx, 790, 620, 130 * g, 10);
  const g2 = sstep(0.45, 0.65, u);
  if (g2 > 0) {
    const fl = spline([[-40, -120, 1], [40, -120, 1], [40, -40], [120, 110], [-120, 110], [-40, -40]].map(([x, y, k]) => [790 + x * g2, 1060 + y * g2, k]), true, 3);
    paint(ctx, fl, LIME, { seed: TS(12) }); loopInk(ctx, fl, { seed: TS(13), w: 8 });
    for (let j = 0; j < 3; j++) { const t = (lt * 0.9 + j / 3) % 1; const e = ell(770 + j * 25, 980 - t * 160, 14, 14, 16); paint(ctx, e, PAL.hi, { seed: TS(14 + j) }); loopInk(ctx, e, { seed: TS(17 + j), w: 4 }); }
  }
  plaque(ctx, 'NO WIRE', 790, 330, 120, PAL.red, 20);
  if (g2 > 0) plaque(ctx, 'a reaction!', CX, 1290, 110, '#4f8a10', 21);
};

// 2 inside the tube floats a thin glass vial (cutaway, push-in)
SC[2] = (lt, u) => {
  glowStick(ctx, CX - 80, 820, 1.55, 0.18, { k: 3, lit: 0, cut: true, face: false });
  const g = sstep(0.1, 0.3, u), g2 = sstep(0.4, 0.6, u);
  if (g > 0) { title(ctx, 'plastic tube', 840, 420, 76, PAL.ink, { seed: TS(30) }); arrow(ctx, 790, 470, 640, 560, PAL.ink, 31); }
  if (g2 > 0) { title(ctx, 'glass vial', 850, 1060, 84, BLUE, { seed: TS(34) }); arrow(ctx, 760, 1010, 580, 900, BLUE, 35); }
  title(ctx, 'CUTAWAY', 230, 300, 96, PAL.red, { seed: TS(38) });
};

// 3 the vial holds hydrogen peroxide
SC[3] = (lt, u) => {
  const v = capsule(CX, 780, 150, 260, 14);
  paint(ctx, v, GLASS, { seed: BS(1) }); loopInk(ctx, v, { seed: BS(2), w: 9, color: '#4d6d86' });
  ink(ctx, [[CX - 100, 560], [CX - 100, 980]], { w: 8, color: PAL.hi, seed: BS(3) });
  peroxide(ctx, CX, 700 + Math.sin(lt * 2) * 30, 0.75, 1, lt * 2);
  peroxide(ctx, CX, 900 - Math.sin(lt * 2) * 30, 0.6, 2, lt * 2 + 2);
  title(ctx, 'HYDROGEN', CX, 250, 120, PAL.red, { seed: TS(40) });
  title(ctx, 'PEROXIDE', CX, 375, 120, PAL.red, { seed: TS(41) });
  title(ctx, 'H2O2', CX, 1260, 110, PAL.ink, { seed: TS(42) });
};

// 4 around it: diphenyl oxalate mixed with a dye
SC[4] = (lt, u) => {
  const g = sstep(0.05, 0.3, u), g2 = sstep(0.5, 0.72, u);
  if (g > 0) { oxalate(ctx, CX, 560, 1.35 * g, 3, lt * 2); title(ctx, 'diphenyl oxalate', CX, 300, 100, PAL.ink, { seed: TS(50) }); }
  if (g2 > 0) { dye(ctx, CX, 1020, 0.95 * g2, { k: 1, blink: blinkAt(lt) }); title(ctx, '+ a dye', CX, 1250, 110, '#5f9a14', { seed: TS(51) }); }
  title(ctx, 'OUTSIDE THE VIAL', CX, 790, 72, BLUE, { seed: TS(52) });
};

// 5 while the glass is whole they never touch: a glass wall between two sleepy sides
SC[5] = (lt, u) => {
  const wall = resample(rect(CX - 22, 330, 44, 900), 3, true);
  paint(ctx, wall, GLASS, { seed: BS(5) }); loopInk(ctx, wall, { seed: BS(6), w: 8, color: '#4d6d86' });
  peroxide(ctx, 260, 760, 0.95, 3, lt);
  oxalate(ctx, 815, 760, 0.62, 4, lt);
  title(ctx, 'z', 300 + Math.sin(lt * 2) * 10, 560 - (lt * 40 % 60), 80, BLUE, { seed: TS(60) });
  title(ctx, 'z', 840, 560 - ((lt * 40 + 30) % 60), 80, BLUE, { seed: TS(61) });
  title(ctx, 'GLASS WALL', CX, 260, 100, BLUE, { seed: TS(62) });
  title(ctx, 'nothing happens', CX, 1300, 108, PAL.red, { seed: TS(63) });
};

// 6 bend the stick, the vial cracks, the liquids mix (ones, shake, push-in)
SC[6] = (lt, u) => {
  const ck = 0.3;
  const nt = sstep(ck, ck + 0.15, u);
  if (nt > 0.5) night(ctx, false);
  const bend = u < ck ? lerp(0, 0.7, ease(u / ck)) : lerp(0.7, 0.15, ease((u - ck) / 0.3));
  glowStick(ctx, CX, 860, 1.4, 0, { k: 4, bend, lit: sstep(ck + 0.1, ck + 0.4, u), crack: sstep(ck, ck + 0.25, u), mix: u > ck ? lt : 0 });
  if (u > ck && u < ck + 0.25) { star(ctx, CX, 860, 140, seedFor(CURD, 40), { fill: PAL.hi }); speedLines(ctx, CX, 860, 200, 380, 14, seedFor(CURD, 41), 9); }
  plaque(ctx, u < ck ? 'BEND...' : 'CRACK!', CX, 300, 150, u < ck ? PAL.ink : PAL.red, 70);
  if (u > 0.55) plaque(ctx, 'they mix', CX, 1290, 110, '#4f8a10', 71);
};

// 7 the peroxide attacks the oxalate and builds a very unstable molecule (shaking ring)
SC[7] = (lt, u) => {
  const m = ease(clamp(u / 0.45));
  if (u < 0.5) {
    peroxide(ctx, lerp(220, 380, m), lerp(560, 720, m), 0.9, 5, lt * 3);
    oxalate(ctx, lerp(760, 700, m), lerp(940, 760, m), 0.7, 5, lt * 3);
    speedLines(ctx, CX, 720, 60, 140, 8, seedFor(CURD, 50), 6);
  } else {
    ring4(ctx, CX, 780, 1.35, 1, 0.6 + u);
    for (let j = 0; j < 3; j++) ink(ctx, [[CX + 230 + j * 30, 520 + j * 20], [CX + 260 + j * 30, 480 + j * 20]], { w: 8, color: HOT, seed: CS(0, 60 + j) });
    title(ctx, '!!', CX + 300, 420, 120, HOT, { seed: TS(80) });
  }
  title(ctx, 'UNSTABLE', CX, 280, 150, PAL.red, { seed: TS(81) });
  title(ctx, u < 0.5 ? 'peroxide + oxalate' : 'a 4-atom ring', CX, 1290, 96, PAL.ink, { seed: TS(82) });
};

// 8 it falls apart into carbon dioxide and lets go of energy (ones, burst)
SC[8] = (lt, u) => {
  const b = sstep(0.12, 0.3, u);
  if (b < 0.05) ring4(ctx, CX, 760, 1.35, 2, 1.4);
  else {
    co2(ctx, CX - 300 * b, 760 - 240 * b, 1.0, 1, -0.5 * b);
    co2(ctx, CX + 300 * b, 760 + 240 * b, 1.0, 2, 0.5 * b);
    star(ctx, CX, 760, 60 + 120 * b, seedFor(CURD, 60), { fill: PAL.yel });
    for (let j = 0; j < 8; j++) { const a = j / 8 * 6.28; spark(ctx, CX + Math.cos(a) * 180 * b, 760 + Math.sin(a) * 180 * b, Math.cos(a) * 420, Math.sin(a) * 420, 15, seedFor(CURD, 70 + j)); }
  }
  title(ctx, 'CO2', 230, 360, 120, PAL.ink, { seed: TS(90) });
  if (b > 0.5) title(ctx, '+ ENERGY', CX, 1270, 140, PAL.red, { seed: TS(91) });
};

// 9 that energy isn't light yet: it gets handed to the dye (relay)
SC[9] = (lt, u) => {
  const m = ease(sstep(0.3, 0.85, u));
  dye(ctx, 800, 820, 0.85, { k: 2, blink: blinkAt(lt), mouth: m > 0.9 ? 1 : 0, glow: 0 });
  const ex = lerp(220, 640, m), ey = 820 - Math.sin(m * Math.PI) * 260;
  star(ctx, ex, ey, 70, seedFor(CURD, 80), { fill: PAL.yel });
  if (m < 0.95) speedLines(ctx, ex, ey, 90, 150, 6, seedFor(CURD, 81), 6);
  ink(ctx, [[220, 900], [430, 640], [640, 900]], { w: 6, color: PAL.pencil, seed: TS(100) });
  title(ctx, 'NOT LIGHT YET', CX, 300, 120, PAL.ink, { seed: TS(101) });
  title(ctx, 'hand-off', CX, 1250, 120, PAL.red, { seed: TS(102) });
};

// 10 the energy kicks the dye's electrons up to a higher level (energy ladder)
SC[10] = (lt, u) => {
  dye(ctx, 300, 900, 0.7, { k: 3, blink: blinkAt(lt), mouth: 1 });
  ink(ctx, [[560, 1050], [880, 1050]], { w: 12, seed: BS(20) });
  ink(ctx, [[560, 560], [880, 560]], { w: 12, seed: BS(21) });
  title(ctx, 'low', 970, 1050, 70, PAL.ink, { seed: TS(110) });
  title(ctx, 'high', 970, 560, 70, PAL.red, { seed: TS(111) });
  const j = ease(sstep(0.25, 0.55, u));
  const ey = lerp(1050, 560, j) - 34;
  const e = ell(720, ey, 32, 32, 30); paint(ctx, e, CYAN, { seed: TS(112) }); loopInk(ctx, e, { seed: TS(113), w: 7 });
  title(ctx, 'e', 720, ey - 4, 50, PAL.ink, { seed: TS(114) });
  if (j > 0.05 && j < 0.95) for (let k = 0; k < 3; k++) ink(ctx, [[690 + k * 30, ey + 60], [690 + k * 30, ey + 130]], { w: 7, seed: CS(0, 120 + k) });
  if (u > 0.2) { arrow(ctx, 640, 1000, 640, 650, PAL.red, 115); star(ctx, 640, 1010, 40, seedFor(CURD, 90), { fill: PAL.yel }); }
  title(ctx, 'ELECTRON', CX, 280, 130, BLUE, { seed: TS(118) });
  title(ctx, 'kicked up', CX, 1290, 110, PAL.red, { seed: TS(119) });
};

// 11 when they drop back down, each gives off a tiny flash of light (ones, night, repeated flashes)
SC[11] = (lt, u) => {
  night(ctx, false);
  const cyc = (lt * 1.1) % 1, fall = ease(sstep(0.2, 0.45, cyc)), fl = sstep(0.42, 0.5, cyc) * (1 - sstep(0.7, 0.95, cyc));
  dye(ctx, 300, 900, 0.7, { k: 4, glow: fl, blink: blinkAt(lt) });
  ink(ctx, [[560, 1050], [880, 1050]], { w: 12, color: PAL.hi, seed: BS(22) });
  ink(ctx, [[560, 560], [880, 560]], { w: 12, color: PAL.hi, seed: BS(23) });
  const ey = lerp(560, 1050, fall) - 34;
  const e = ell(720, ey, 32, 32, 30); paint(ctx, e, CYAN, { seed: TS(120) }); loopInk(ctx, e, { seed: TS(121), w: 7 });
  if (fl > 0) {
    star(ctx, 720, 1000, 90 * fl + 20, seedFor(CURD, 95), { fill: LIMEHI });
    const P = []; for (let k = 0; k <= 30; k++) P.push([620 - k * 9, 860 - k * 14 + Math.sin(k * 1.2) * 18]);
    ink(ctx, P, { w: 9, color: LIME, seed: TS(122) });
  }
  plaque(ctx, 'FLASH!', CX, 300, 160, '#4f8a10', 123);
  plaque(ctx, '= light', CX, 1290, 110, PAL.red, 124);
};

// 12 the answer: the battery is the chemistry
SC[12] = (lt, u) => {
  night(ctx);
  glowStick(ctx, 290, 850, 1.05, -0.08, { k: 5, lit: 1, face: true, blink: blinkAt(lt) });
  const g = sstep(0.15, 0.35, u);
  if (g > 0) {
    oxalate(ctx, 790, 630, 0.42, 6, lt); peroxide(ctx, 790, 790, 0.5, 6, lt);
    arrow(ctx, 780, 880, 780, 1000, PAL.hi, 130);
    star(ctx, 780, 1090, 70, seedFor(CURD, 100), { fill: LIMEHI });
  }
  plaque(ctx, 'BATTERY =', CX, 245, 130, PAL.red, 131);
  plaque(ctx, 'CHEMISTRY', CX, 415, 150, '#4f8a10', 132);
  if (u > 0.5) plaque(ctx, 'stored energy -> light', CX, 1290, 90, PAL.ink, 133);
};

// 13 cold light: a hot bulb vs the glow stick, two thermometers
SC[13] = (lt, u) => {
  bulb(ctx, 290, 820, 0.9, 1, lt);
  thermo(ctx, 290, 1180, 0.55, 0.9, HOT, 1);
  glowStick(ctx, 790, 820, 0.85, 0.1, { k: 6, lit: 1, face: true, blink: blinkAt(lt) });
  thermo(ctx, 790, 1180, 0.55, 0.25, BLUE, 2);
  title(ctx, 'hot', 290, 470, 90, HOT, { seed: TS(140) });
  title(ctx, 'cool', 790, 470, 90, BLUE, { seed: TS(141) });
  title(ctx, 'COLD LIGHT', CX, 280, 140, BLUE, { seed: TS(142) });
};

// 14 the dye picks the colour: a fan of sticks in different colours
SC[14] = (lt, u) => {
  night(ctx);
  const cols = [LIME, PINK, CYAN, ORANGE];
  cols.forEach((col, j) => {
    const g = sstep(0.05 + j * 0.12, 0.2 + j * 0.12, u);
    if (g <= 0) return;
    const a = -0.45 + j * 0.3;
    glowStick(ctx, CX + Math.sin(a) * 380, 1040 - Math.cos(a) * 380, 0.62, a, { k: 10 + j, lit: g, col, face: true, blink: blinkAt(lt + j * 0.5), cut: false });
  });
  dye(ctx, CX, 1150, 0.5, { k: 5, col: cols[Math.floor(lt * 1.5) % 4], blink: blinkAt(lt) });
  plaque(ctx, 'DYE = COLOUR', CX, 270, 130, PAL.red, 150);
};

// 15 warm it: brighter but quits sooner; cool it: lasts longer
SC[15] = (lt, u) => {
  const g2 = sstep(0.45, 0.6, u);
  cup(ctx, 290, 900, 0.9, '#f2a28f', 1);
  glowStick(ctx, 290, 800, 0.7, -0.1, { k: 20, lit: 1, face: true, cut: false });
  for (let j = 0; j < 3; j++) { const xx = 230 + j * 60, ph = lt * 4 + j; ink(ctx, [[xx, 520], [xx + Math.sin(ph) * 12, 480], [xx, 440]], { w: 7, color: HOT, seed: CS(0, 140 + j) }); }
  clockFace(ctx, 290, 1230, 70, 0.25, HOT, 1);
  title(ctx, 'brighter', 290, 360, 84, HOT, { seed: TS(160) });
  if (g2 > 0) {
    cup(ctx, 790, 900, 0.9, '#bfe4ff', 2);
    [[730, 820], [850, 860], [790, 950]].forEach(([x, y], j) => { const ic = resample(rect(x - 34, y - 34, 68, 68), 3, true); paint(ctx, ic, PAL.hi, { seed: CS(0, 150 + j) }); loopInk(ctx, ic, { seed: CS(0, 155 + j), w: 5, color: BLUE }); });
    glowStick(ctx, 790, 800, 0.7, 0.1, { k: 21, lit: 0.6, col: '#d7f08a', face: true, glow: false, cut: false });
    clockFace(ctx, 790, 1230, 70, 0.9, BLUE, 2);
    title(ctx, 'lasts longer', 790, 360, 84, BLUE, { seed: TS(161) });
  }
  ink(ctx, [[CX, 420], [CX, 1300]], { w: 6, color: PAL.pencil, seed: BS(30) });
};

// 16 closing card (night, the glow stick waves, a ghost and a pumpkin)
SC[16] = (lt) => {
  night(ctx);
  const a = sstep(0, 0.5, lt);
  plaque(ctx, 'Follow for more of', CX, 310, 104 * a + 30, PAL.ink, 170);
  plaque(ctx, 'how it really works.', CX, 480, 104 * a + 30, '#4f8a10', 171);
  ink(ctx, [[150, 590], [930, 595]], { w: 12, color: PAL.yel, seed: TS(172) });
  glowStick(ctx, CX, 950, 0.95, Math.sin(lt * 4) * 0.12, { k: 30, lit: 1, face: true, blink: blinkAt(lt, 2.2) });
  ghost(ctx, 850, 880, 0.8, 1, lt);
  pumpkin(ctx, 210, 1180, 0.65, 5, 1);
};

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) {
  if (i === 0) { const k = ease(clamp(lt / 2.4)); return { s: lerp(1.0, 1.1, k), px: CX, py: 860, X: CX, Y: 860 }; }
  if (i === 2) { const k = ease(clamp(lt / 2.6)); return { s: lerp(1, 1.08, k), px: CX - 80, py: 820, X: CX - 80, Y: 820 }; }
  if (i === 6) { const k = ease(clamp(lt / 1.4)); return { s: lerp(1, 1.1, k), px: CX, py: 860, X: CX, Y: 860 }; }
  return STAGE;
}
function shakesFor(i, S) {
  const d = S.end - S.start;
  if (i === 0) return [{ t0: S.start + 0.75, dur: 0.5, amp: 18 }];
  if (i === 6) return [{ t0: S.start + 0.3 * d, dur: 0.5, amp: 16 }];
  if (i === 7) return [{ t0: S.start + 0.5 * d, dur: 0.6, amp: 8 }];
  if (i === 8) return [{ t0: S.start + 0.12 * d, dur: 0.45, amp: 14 }];
  return [];
}

// ---------------------------------------------------------------- caption (boiled box, crisp type)
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = [];
  for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 80, maxW = 900, lines = []; let cur = [], cw = 0;
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
  const lt = clamp(D.tq - S.start, 0, dur + 2);
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
  caption(S.cap, i === 0 ? 1 : sstep(0, 0.2, lt));
  drawTooth(ctx, D);
};
// cover: night, the lit glow stick with a face, pumpkin and bats, 2-word hook text inside y 300..1620
window.thumb = () => {
  const D = drawingAt(2, 2, 999000); CURD = D;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawPaper(ctx, { x: 0, y: 0 });
  night(ctx);
  bat(ctx, 220, 760, 1.0, 0.5, 1); bat(ctx, 880, 820, 0.8, 1.6, 2);
  glowStick(ctx, CX, 1080, 1.25, -0.1, { k: 1, lit: 1, face: true });
  pumpkin(ctx, 220, 1430, 0.8, 3, 1);
  ghost(ctx, 870, 1380, 0.8, 1, 0.4);
  plaque(ctx, 'NO', CX, 420, 210, PAL.red, 1);
  plaque(ctx, 'BATTERY?', CX, 670, 200, '#4f8a10', 2);
  drawTooth(ctx, D);
};
window.ready = true;
