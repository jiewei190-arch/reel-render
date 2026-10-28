// t_staticshock.js: "Why do you get more static shocks in winter?" in the cel-boil style (template #11, demo 55), 1080x1920 portrait.
// Animation language from kit_celboil.js (exposure sheet on ones/twos/threes, a new boil per drawing, decaying camera shakes on the zaps,
// off-register cel colour, paper tooth per drawing, boiled glyph titles, sparks / star bursts / speed lines). Pure function of t (seek).
// Batch N layout: caption box at y 1160-1400, drawings inside y 250-1130, nothing important in x > 900 below y 840.
import * as K from './kit_celboil.js';
const { PAL, clamp, lerp, sstep, E, circlePts, resample, spline, drawingAt, seedFor, seedBg,
  ink, loopInk, paint, hatchInk, spark, star, puff, speedLines, title, camera, drawPaper, drawTooth,
  applyShot, zoomWeight, resetWeight, STAGE, W, H } = K;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const SEG = window.TL.p, CX = W / 2, A = 'styles/celboil/assets/';
const load = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
const paperImg = await load(A + 'paper_base.jpg'), toothImg = await load(A + 'paper_tooth.png'); const dust = []; for (let k = 1; k <= 4; k++) dust.push(await load(`${A}dust_ink_0${k}.png`));
const PAPER = document.createElement('canvas'); PAPER.width = W; PAPER.height = H;
{ const p = PAPER.getContext('2d'); p.fillStyle = PAL.cream; p.fillRect(0, 0, W, H); const s = Math.max(W / paperImg.width, H / paperImg.height); p.globalAlpha = 0.85; p.drawImage(paperImg, (W - paperImg.width * s) / 2, (H - paperImg.height * s) / 2, paperImg.width * s, paperImg.height * s); }
K.setImages({ paper: PAPER, tooth: toothImg, dust }); K.initLayers(1);
await document.fonts.load('600 80px Caveat'); const OTm = await import('opentype'); const OT = OTm.default || OTm; K.setFont(OT.parse(await (await fetch(A + 'fonts/Caveat.ttf')).arrayBuffer()));
const EXPO = [1, 2, 3, 2, 2, 2, 2, 1, 3, 2, 2, 2, 2, 2, 1, 1, 2, 3];
const BLUE = '#3d8fd1', BLUEL = '#bfe4ff', WOOD = '#d9a35e', BRASS = '#f2c14a', SKIN = '#f1c39b', SOCK = '#e5402b', CARPET = '#8a6fb0';

// ---------------------------------------------------------------- helpers
let CURD = drawingAt(0, 2, 0);
const CS = (k, j = 0) => seedFor(CURD, k * 31 + j), TS = (n) => seedFor(CURD, 900 + n);
const ell = (cx, cy, rx, ry, n = 60) => circlePts(cx, cy, ry, n, rx);
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ease = (u) => E.io3(clamp(u));
function arrow(c, x0, y0, x1, y1, col, k) { ink(c, [[x0, y0], [x1, y1]], { w: 10, color: col, seed: TS(k) }); const ang = Math.atan2(y1 - y0, x1 - x0), L = 44;
  for (const s of [-.5, .5]) ink(c, [[x1 - Math.cos(ang + s) * L, y1 - Math.sin(ang + s) * L], [x1, y1]], { w: 10, color: col, seed: TS(k + (s > 0 ? 1 : 2)) }); }
function bolt(c, x0, y0, x1, y1, seed, w = 1) { const n = 6, P = [[x0, y0]]; for (let i = 1; i < n; i++) { const u = i / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1; const o = (K.hs ? 0 : 0) + ((i % 2) ? 1 : -1) * 26 * w; P.push([lerp(x0, x1, u) + nx / L * o, lerp(y0, y1, u) + ny / L * o]); } P.push([x1, y1]);
  const outline = [...P.map(([x, y]) => [x - 8 * w, y]), ...P.slice().reverse().map(([x, y]) => [x + 8 * w, y])]; paint(c, outline, PAL.yel, { seed }); loopInk(c, outline, { seed: seed + 1, w: 5 }); }
function electron(c, x, y, r, k, o = {}) { const e = ell(x, y, r, r, 30); paint(c, e, o.col || BLUEL, { seed: CS(300 + k) }); loopInk(c, e, { seed: CS(301 + k), w: 5 }); ink(c, [[x - r * .45, y], [x + r * .45, y]], { w: 7, seed: CS(302 + k) });
  if (o.face) { paint(c, ell(x - r * .3, y - r * .35, 5, 7, 12), PAL.ink, { seed: CS(303 + k), reg: false }); paint(c, ell(x + r * .3, y - r * .35, 5, 7, 12), PAL.ink, { seed: CS(304 + k), reg: false }); } }
function door(c, x, y, w, h, k = 0) { const d = resample(rect(x, y, w, h), 3, true); paint(c, d, WOOD, { seed: CS(10 + k) }); hatchInk(c, rect(x + w * .6, y, w * .4, h), { seed: CS(11 + k), gap: 16, ang: -.9, w: 2 }); loopInk(c, d, { seed: CS(12 + k), w: 8 });
  [[x + 40, y + 40, w - 80, h * .38], [x + 40, y + h * .5, w - 80, h * .42]].forEach(([a, b, cw, ch], j) => loopInk(c, resample(rect(a, b, cw, ch), 3, true), { seed: CS(13 + k + j), w: 5 })); }
function knob(c, x, y, r, k = 0, glow = 0) { if (glow > 0) star(c, x, y, r * (1.6 + glow * .6), CS(20 + k), { n: 12, fill: PAL.yel }); const e = ell(x, y, r, r, 40); paint(c, e, BRASS, { seed: CS(21 + k) }); loopInk(c, e, { seed: CS(22 + k), w: 7 });
  paint(c, ell(x - r * .3, y - r * .3, r * .25, r * .18, 16), PAL.hi, { seed: CS(23 + k), reg: false }); }
// cartoon arm + pointing hand (sleeve cuff), finger tip at (x, y), arm comes from the left
function hand(c, x, y, s = 1, k = 0, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(o.rot || 0);
  const sleeve = resample(rect(-620, -70, 360, 140), 3, true); paint(c, sleeve, o.sleeve || BLUE, { seed: CS(30 + k) }); loopInk(c, sleeve, { seed: CS(31 + k), w: 7 });
  const palm = spline([[-270, -60, 1], [-150, -78], [-110, -40], [-120, 50], [-200, 70], [-270, 55]], true, 4); paint(c, palm, SKIN, { seed: CS(32 + k) }); loopInk(c, palm, { seed: CS(33 + k), w: 7 });
  const fin = resample(rect(-140, -46, 140, 40), 3, true); paint(c, fin, SKIN, { seed: CS(34 + k) }); loopInk(c, fin, { seed: CS(35 + k), w: 6 });
  for (let j = 0; j < 3; j++) ink(c, [[-160, -10 + j * 22], [-118, -6 + j * 22]], { w: 5, seed: CS(36 + k + j) });
  c.restore(); }
function kid(c, x, y, s = 1, k = 0, o = {}) { c.save(); c.translate(x, y); c.scale(s, s);
  const body = spline([[-90, 0, 1], [-70, -240], [70, -240], [90, 0]], true, 4); paint(c, body, o.shirt || BLUE, { seed: CS(40 + k) }); loopInk(c, body, { seed: CS(41 + k), w: 7 });
  for (const sx of [-40, 40]) { const leg = resample(rect(sx - 20, 0, 40, 150), 3, true); paint(c, leg, '#4a5a7a', { seed: CS(42 + k + sx) }); loopInk(c, leg, { seed: CS(43 + k + sx), w: 6 }); const sock = resample(rect(sx - 26, 140, 56, 40), 3, true); paint(c, sock, SOCK, { seed: CS(44 + k + sx) }); loopInk(c, sock, { seed: CS(45 + k + sx), w: 6 }); }
  const head = ell(0, -330, 90, 95, 50); paint(c, head, SKIN, { seed: CS(46 + k) }); loopInk(c, head, { seed: CS(47 + k), w: 7 });
  const hair = spline([[-95, -350, 1], [-70, -440], [0, -460], [70, -440], [95, -350], [40, -400], [-40, -405]], true, 4); paint(c, hair, '#3a2a20', { seed: CS(48 + k) }); loopInk(c, hair, { seed: CS(49 + k), w: 6 });
  if (o.hairUp) for (let j = 0; j < 7; j++) { const a = -2.6 + j * .3; ink(c, [[Math.cos(a) * 80, -340 + Math.sin(a) * 90], [Math.cos(a) * 160, -340 + Math.sin(a) * 170]], { w: 6, seed: CS(50 + k + j), color: '#3a2a20' }); }
  [-30, 30].forEach((ex, e) => paint(c, ell(ex, -340, 9, 13, 20), PAL.ink, { seed: CS(60 + k + e), reg: false })); ink(c, o.oh ? ell(0, -285, 14, 16, 18) : [[-24, -290], [0, -275], [24, -290]], { w: 6, seed: CS(62 + k) });
  c.restore(); }
function drop(c, x, y, s = 1, k = 0, o = {}) { c.save(); c.translate(x, y); c.scale(s, s); const P = spline([[0, -110, 1], [60, -10], [70, 40], [0, 90], [-70, 40], [-60, -10]], true, 4); paint(c, P, BLUEL, { seed: CS(70 + k) }); loopInk(c, P, { seed: CS(71 + k), w: 7 });
  if (o.face !== false) { [-22, 22].forEach((ex, e) => paint(c, ell(ex, 20, 7, 10, 16), PAL.ink, { seed: CS(72 + k + e), reg: false })); ink(c, [[-14, 48], [0, 56], [14, 48]], { w: 5, seed: CS(74 + k) }); } c.restore(); }
function meter(c, x, y, r, v, labs, k = 0) { const arc = Array.from({ length: 30 }, (_, i) => { const a = Math.PI + i / 29 * Math.PI; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; }); const face = [...arc, [x + r, y + 30], [x - r, y + 30]];
  paint(c, face, PAL.hi, { seed: CS(80 + k) }); loopInk(c, face, { seed: CS(81 + k), w: 7 }); labs.forEach(([u, s], j) => { const a = Math.PI + u * Math.PI; ink(c, [[x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82], [x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95]], { w: 5, seed: CS(82 + k + j) }); title(c, s, x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .62, 40, PAL.ink, { seed: TS(400 + k + j), w: 4 }); });
  const a = Math.PI + clamp(v) * Math.PI; ink(c, [[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], { w: 10, color: PAL.red, seed: CS(90 + k) }); paint(c, ell(x, y, 16, 16, 16), PAL.ink, { seed: CS(91 + k), reg: false }); }
function carpet(c, y0, y1, k = 0) { const P = resample(rect(-20, y0, W + 40, y1 - y0), 3, true); paint(c, P, CARPET, { seed: CS(95 + k) }); for (let i = 0; i < 18; i++) { const x = 30 + i * 60; ink(c, [[x, y0 + 30], [x + 30, y0 + 60], [x, y0 + 90]], { w: 4, seed: CS(96 + k + i), color: '#5a447a' }); } loopInk(c, P, { seed: CS(97 + k), w: 6 }); }
function minus(c, x, y, k) { ink(c, [[x - 16, y], [x + 16, y]], { w: 8, color: BLUE, seed: CS(98 + k) }); }
function filmOutline(c, P, k, a = 1) { c.save(); c.globalAlpha *= a; loopInk(c, P, { seed: CS(120 + k), w: 14, color: 'rgba(61,143,209,.55)' }); c.restore(); }

// ---------------------------------------------------------------- scenes
const SC = [];
// 0 hook: the hand reaches for the knob, crackles at the fingertip from frame 0, then the ZAP (shake)
SC[0] = (lt) => { door(ctx, 560, 300, 330, 830, 1); const zt = 1.95, k = ease(clamp(lt / 1.9)), fx = lerp(330, 560, k), fy = 760;
  hand(ctx, fx, fy, 1.05, 2); knob(ctx, 640, 760, 52, 3, lt > zt ? 1 : 0);
  for (let j = 0; j < 3; j++) spark(ctx, fx + 6, fy - 22 + j * 18, 260 + j * 80, -160 + j * 150, 12 + 6 * Math.sin(lt * 9 + j), CS(110 + j), { fill: PAL.yel });
  if (lt > zt) { bolt(ctx, fx, fy - 20, 600, 760, CS(115), 1.2); speedLines(ctx, 610, 760, 120, 330, 16, CS(116), 9); title(ctx, 'ZAP!', 280, 400, 200, PAL.red, { seed: TS(1) }); }
  else title(ctx, 'ZAP?', 280, 400, 150, PAL.ink, { seed: TS(2) }); };
// 1 more in winter: window with snow, the knob zapping again
SC[1] = (lt, u) => { const win = resample(rect(120, 320, 420, 520), 3, true); paint(ctx, win, '#cfe6f7', { seed: CS(130) }); loopInk(ctx, win, { seed: CS(131), w: 9 }); ink(ctx, [[330, 320], [330, 840]], { w: 8, seed: CS(132) }); ink(ctx, [[120, 580], [540, 580]], { w: 8, seed: CS(133) });
  for (let j = 0; j < 16; j++) { const y = 340 + ((j * 67 + lt * 120) % 480), x = 140 + (j * 53) % 380; paint(ctx, ell(x, y, 9, 9, 12), PAL.hi, { seed: CS(134 + j), reg: false }); }
  const sb = ell(330, 900, 160, 40, 30); paint(ctx, sb, PAL.hi, { seed: CS(150) }); loopInk(ctx, sb, { seed: CS(151), w: 6 });
  door(ctx, 600, 400, 280, 700, 4); knob(ctx, 660, 770, 44, 5, (lt % 1.2) < .2 ? 1 : 0);
  title(ctx, 'MORE IN', 290, 1000, 100, PAL.ink, { seed: TS(10) }); title(ctx, 'WINTER?', 290, 1110, 110, BLUE, { seed: TS(11) }); };
// 2 where does the zap come from? magnifier on the fingertip
SC[2] = (lt, u) => { hand(ctx, 620, 720, 1.3, 6); const m = ell(600, 690, 170, 170, 50); loopInk(ctx, m, { seed: CS(160), w: 12 }); ink(ctx, [[720, 810], [860, 960]], { w: 22, seed: CS(161) });
  title(ctx, 'WHERE FROM?', CX, 380, 130, PAL.red, { seed: TS(20) }); for (let j = 0; j < 3; j++) spark(ctx, 610, 680 + j * 14, 200, -120 + j * 120, 10, CS(162 + j)); };
// 3 socks rub the carpet: electrons hop from carpet to sock
SC[3] = (lt, u) => { carpet(ctx, 880, 1130, 7); const sx = 440 + 140 * Math.sin(lt * 5);
  const leg = resample(rect(sx - 50, 420, 100, 400), 3, true); paint(ctx, leg, '#4a5a7a', { seed: CS(170) }); loopInk(ctx, leg, { seed: CS(171), w: 7 });
  const sock = spline([[sx - 60, 780, 1], [sx + 60, 780], [sx + 70, 880], [sx + 200, 890], [sx + 200, 950], [sx - 60, 950]], true, 3); paint(ctx, sock, SOCK, { seed: CS(172) }); loopInk(ctx, sock, { seed: CS(173), w: 7 });
  speedLines(ctx, sx + 60, 950, 60, 220, 8, CS(174), 7);
  for (let j = 0; j < 7; j++) { const ph = (lt * .9 + j / 7) % 1, x0 = 160 + j * 110, y = lerp(1020, 900, ph) - Math.sin(ph * Math.PI) * 120; electron(ctx, lerp(x0, sx + 40, ph * .6), y, 28, j, { face: j % 2 === 0 }); }
  title(ctx, 'ELECTRONS', CX, 330, 120, BLUE, { seed: TS(30) }); title(ctx, 'HOP!', CX, 460, 140, PAL.red, { seed: TS(31) }); };
// 4 your body piles up extra charge: minus signs accumulate on the kid
SC[4] = (lt, u) => { carpet(ctx, 1040, 1130, 8); kid(ctx, CX, 1030, 1.1, 9, { hairUp: u > .5 }); const n = Math.floor(4 + u * 26);
  for (let j = 0; j < n; j++) { const a = j * 2.4, rr = 160 + (j % 5) * 40; minus(ctx, CX + Math.cos(a) * rr, 640 + Math.sin(a) * rr * .9, 200 + j); }
  title(ctx, 'CHARGE', CX, 300, 100, PAL.ink, { seed: TS(40) }); title(ctx, 'PILES UP', CX, 400, 100, BLUE, { seed: TS(41) }); };
// 5 thousands of volts: the meter needle swings (shake)
SC[5] = (lt, u) => { const v = ease(clamp((lt - 1.8) / .9)) * .92 + .04 + .02 * Math.sin(lt * 20) * (lt > 2.7 ? 1 : 0); meter(ctx, CX, 860, 330, v, [[0, '0'], [.33, '1k'], [.66, '5k'], [.95, '10k']], 10);
  title(ctx, 'VOLTS', CX, 990, 110, PAL.ink, { seed: TS(50) }); title(ctx, 'THOUSANDS', CX, 330, 130, PAL.red, { seed: TS(51) }); title(ctx, 'OF VOLTS', CX, 450, 120, PAL.red, { seed: TS(52) }); };
// 6 only a tiny amount of charge: a big volts bar vs a tiny charge dot
SC[6] = (lt, u) => { const g = ease(clamp(u * 2)); const vb = resample(rect(180, 1050 - 620 * g, 220, 620 * g), 3, true); paint(ctx, vb, PAL.red, { seed: CS(180) }); loopInk(ctx, vb, { seed: CS(181), w: 8 }); title(ctx, 'volts', 290, 1100, 80, PAL.ink, { seed: TS(60) });
  const cb = ell(720, 1030, 18, 18, 20); paint(ctx, cb, BLUE, { seed: CS(182) }); loopInk(ctx, cb, { seed: CS(183), w: 6 }); title(ctx, 'charge', 720, 1100, 80, PAL.ink, { seed: TS(61) }); arrow(ctx, 720, 860, 720, 990, PAL.ink, 62);
  title(ctx, 'TINY', CX, 330, 150, BLUE, { seed: TS(63) }); title(ctx, 'quick sting', 720, 560, 80, PAL.ink, { seed: TS(64) }); };
// 7 the charge jumps across the air: a spark (close-up, shake)
SC[7] = (lt, u) => { const k = ease(clamp(lt / 2.2)), fx = lerp(260, 440, k); hand(ctx, fx, 760, 1.4, 11); knob(ctx, 720, 760, 150, 12, lt > 2.4 ? 1 : 0);
  if (lt > 2.4) { bolt(ctx, fx + 6, 740, 575, 760, CS(190), 1.6); speedLines(ctx, 520, 760, 80, 260, 14, CS(191), 9); for (let j = 0; j < 4; j++) spark(ctx, 520, 760, Math.cos(j * 1.6) * 400, Math.sin(j * 1.6) * 400, 18, CS(192 + j)); title(ctx, 'SPARK!', CX, 380, 180, PAL.red, { seed: TS(70) }); }
  else title(ctx, 'across the air...', CX, 380, 100, PAL.ink, { seed: TS(71) }); };
// 8 why winter? it's about water: the drop character pops in
SC[8] = (lt, u) => { drop(ctx, CX, 780, 2.6 * E.oBack ? 2.6 : 2.6, 13); title(ctx, "IT'S ABOUT", CX, 330, 120, PAL.ink, { seed: TS(80) }); title(ctx, 'WATER', CX, 460, 170, BLUE, { seed: TS(81) }); };
// 9 humid day: an invisible film of water on every surface (shown as a blue glow line)
SC[9] = (lt, u) => { door(ctx, 560, 330, 330, 800, 14); knob(ctx, 640, 760, 48, 15); filmOutline(ctx, resample(rect(560, 330, 330, 800), 3, true), 1, .4 + .4 * Math.sin(lt * 4)); filmOutline(ctx, ell(640, 760, 60, 60, 40), 2, .9);
  const tb = resample(rect(90, 880, 400, 70), 3, true); paint(ctx, tb, WOOD, { seed: CS(200) }); loopInk(ctx, tb, { seed: CS(201), w: 7 }); filmOutline(ctx, tb, 3, .8);
  for (let j = 0; j < 8; j++) { const x = 120 + j * 50, y = 860 - ((lt * 60 + j * 37) % 300); paint(ctx, ell(x, y, 8, 11, 12), BLUEL, { seed: CS(205 + j), reg: false }); }
  title(ctx, 'HUMID DAY', 290, 360, 82, PAL.ink, { seed: TS(90) }); title(ctx, 'water film', 300, 480, 90, BLUE, { seed: TS(91) }); arrow(ctx, 300, 540, 300, 860, BLUE, 92); };
// 10 the film drains the charge away (minus signs slide off along the film)
SC[10] = (lt, u) => { kid(ctx, 360, 1010, 1.1, 16); const film = [[120, 1080], [360, 1100], [880, 1100]]; ink(ctx, film, { w: 16, color: 'rgba(61,143,209,.6)', seed: CS(210) });
  for (let j = 0; j < 8; j++) { const ph = (lt * .5 + j / 8) % 1; minus(ctx, lerp(360, 860, ph), 1090 - 10 * Math.sin(ph * 9), 220 + j); }
  for (let j = 0; j < 4; j++) minus(ctx, 300 + j * 40, 560 + (j % 2) * 30, 240 + j);
  title(ctx, 'CHARGE', 680, 340, 110, PAL.ink, { seed: TS(100) }); title(ctx, 'LEAKS AWAY', 680, 460, 110, BLUE, { seed: TS(101) }); };
// 11 cold winter air holds very little water: a cold air box with only a few drops
SC[11] = (lt, u) => { const box = resample(rect(140, 470, 520, 560), 3, true); paint(ctx, box, '#dceefb', { seed: CS(230) }); loopInk(ctx, box, { seed: CS(231), w: 9 });
  [[260, 640], [480, 880]].forEach(([x, y], j) => drop(ctx, x + 10 * Math.sin(lt * 2 + j), y, .5, 30 + j, { face: j === 0 }));
  const th = resample(rect(760, 480, 60, 420), 3, true); paint(ctx, th, PAL.hi, { seed: CS(232) }); loopInk(ctx, th, { seed: CS(233), w: 7 }); paint(ctx, resample(rect(770, 830, 40, 60), 3, true), BLUE, { seed: CS(234) }); paint(ctx, ell(790, 940, 50, 50, 30), BLUE, { seed: CS(235) }); loopInk(ctx, ell(790, 940, 50, 50, 30), { seed: CS(236), w: 7 });
  title(ctx, 'COLD AIR:', CX, 300, 110, BLUE, { seed: TS(110) }); title(ctx, 'little water', CX, 410, 100, PAL.ink, { seed: TS(111) }); };
// 12 heating it doesn't add water: the radiator warms the same air; the humidity needle drops
SC[12] = (lt, u) => { const rad = resample(rect(120, 820, 420, 280), 3, true); paint(ctx, rad, '#e9e3d4', { seed: CS(240) }); loopInk(ctx, rad, { seed: CS(241), w: 8 }); for (let j = 1; j < 7; j++) ink(ctx, [[120 + j * 60, 840], [120 + j * 60, 1080]], { w: 6, seed: CS(242 + j) });
  for (let j = 0; j < 4; j++) ink(ctx, Array.from({ length: 6 }, (_, i) => [180 + j * 100 + 12 * Math.sin(lt * 5 + i + j), 780 - i * 40]), { w: 7, color: PAL.red, seed: CS(250 + j) });
  [[230, 470], [430, 600]].forEach(([x, y], j) => drop(ctx, x, y, .45, 40 + j, { face: j === 0 }));
  meter(ctx, 720, 700, 170, lerp(.55, .12, ease(clamp(u * 1.4))), [[.1, 'dry'], [.9, 'humid']], 20); title(ctx, 'SAME WATER', CX, 320, 100, PAL.ink, { seed: TS(120) }); title(ctx, 'DRIER AIR', 720, 820, 76, PAL.red, { seed: TS(121) }); };
// 13 no water film: the charge has nowhere to go... until the doorknob
SC[13] = (lt, u) => { door(ctx, 640, 360, 250, 760, 22); knob(ctx, 700, 760, 40, 23); kid(ctx, lerp(260, 420, ease(u)), 1010, 1.1, 24, { hairUp: true, oh: u > .8 });
  for (let j = 0; j < 18; j++) { const a = j * 2.2 + lt * .4, rr = 120 + (j % 4) * 30; minus(ctx, lerp(260, 420, ease(u)) + Math.cos(a) * rr, 640 + Math.sin(a) * rr, 260 + j); }
  for (let j = 0; j < 3; j++) spark(ctx, 330 + j * 60, 520 + (j % 2) * 40, 120, -200, 10, CS(280 + j)); title(ctx, 'NOWHERE', 340, 330, 110, PAL.ink, { seed: TS(130) }); title(ctx, 'TO GO...', 340, 440, 110, BLUE, { seed: TS(131) }); };
// 14 the payoff: not the cold, dry air (the wow zap again, bigger)
SC[14] = (lt, u) => { door(ctx, 600, 580, 290, 550, 25); knob(ctx, 670, 840, 46, 26, 1); hand(ctx, 600, 840, .95, 27); bolt(ctx, 600, 820, 640, 840, CS(290), 1.2); speedLines(ctx, 650, 840, 90, 300, 16, CS(291), 9);
  title(ctx, 'NOT THE COLD:', CX, 300, 100, PAL.ink, { seed: TS(140) }); title(ctx, 'DRY AIR', CX, 430, 150, PAL.red, { seed: TS(141) }); };
// 15 the trick: touch the metal with a key first (the spark hits the key)
SC[15] = (lt, u) => { door(ctx, 600, 560, 290, 570, 28); knob(ctx, 670, 760, 46, 29, lt > 2.2 ? 1 : 0); const k = ease(clamp(lt / 2)), kx = lerp(320, 600, k);
  hand(ctx, kx - 120, 790, .9, 30); const key = [[kx - 150, 770], [kx, 760], [kx, 790], [kx - 150, 800]]; paint(ctx, resample(key, 3, true), '#c7c9cc', { seed: CS(300) }); loopInk(ctx, resample(key, 3, true), { seed: CS(301), w: 6 }); paint(ctx, ell(kx - 170, 785, 34, 34, 24), '#c7c9cc', { seed: CS(302) }); loopInk(ctx, ell(kx - 170, 785, 34, 34, 24), { seed: CS(303), w: 6 });
  if (lt > 2.2) { bolt(ctx, kx, 775, 625, 765, CS(304), .8); for (let j = 0; j < 3; j++) spark(ctx, kx + 10, 775, 300, -200 + j * 200, 14, CS(305 + j)); }
  title(ctx, 'TRICK:', CX, 300, 100, PAL.ink, { seed: TS(150) }); title(ctx, 'KEY FIRST', CX, 420, 140, PAL.red, { seed: TS(151) }); };
// 16 the question: zapped a lot? yes / no
SC[16] = (lt, u) => { title(ctx, 'ZAPPED', CX, 380, 150, PAL.ink, { seed: TS(160) }); title(ctx, 'A LOT?', CX, 530, 150, PAL.red, { seed: TS(161) });
  [['YES', 320, PAL.yel], ['NO', 760, BLUEL]].forEach(([w, x, col], j) => { const g = sstep(.2 + j * .15, .5 + j * .15, u); if (g <= 0) return; const e = ell(x, 860, 150 * g, 110 * g, 40); paint(ctx, e, col, { seed: CS(320 + j) }); loopInk(ctx, e, { seed: CS(321 + j), w: 8 }); title(ctx, w, x, 860, 110 * g + 10, PAL.ink, { seed: TS(162 + j) }); }); };
// 17 closing card (standard lines), the knob and a little spark; loops back toward the hook
SC[17] = (lt) => { const a = sstep(0, .5, lt); title(ctx, 'Follow for more of', CX, 520, 104 * a + 30, PAL.ink, { seed: TS(170) }); title(ctx, 'how it really works.', CX, 640, 100 * a + 30, PAL.red, { seed: TS(171) }); ink(ctx, [[160, 730], [920, 735]], { w: 12, seed: TS(172) });
  title(ctx, "A new 'wait, really?' every day.", CX, 830, 64, PAL.ink, { seed: TS(173), w: 5 }); title(ctx, '@howitreallyworkstudio', CX, 930, 58, BLUE, { seed: TS(174), w: 5 });
  knob(ctx, CX, 1060, 44, 31, (lt % 1.3) < .25 ? 1 : 0); };

// ---------------------------------------------------------------- shots and shakes
function shotFor(i, lt) { if (i === 0) { const k = ease(clamp(lt / 1.8)); return { s: lerp(1, 1.12, k), px: 600, py: 760, X: 600, Y: 760 }; }
  if (i === 7) { const k = ease(clamp(lt / 2.2)); return { s: lerp(1, 1.15, k), px: 560, py: 760, X: 560, Y: 760 }; } if (i === 14) return { s: 1.06, px: 650, py: 840, X: 650, Y: 840 }; return STAGE; }
function shakesFor(i, S) { if (i === 0) return [{ t0: S.start + 1.95, dur: .5, amp: 18 }]; if (i === 5) return [{ t0: S.start + 2.6, dur: .45, amp: 12 }]; if (i === 7) return [{ t0: S.start + 2.4, dur: .5, amp: 18 }];
  if (i === 14) return [{ t0: S.start + .05, dur: .5, amp: 16 }]; if (i === 15) return [{ t0: S.start + 2.2, dur: .4, amp: 10 }]; return []; }

// ---------------------------------------------------------------- caption (boiled box, crisp type), Batch N position y 1160
function caption(cap, alpha) {
  const segs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m;
  while ((m = re.exec(cap))) { if (m.index > last) segs.push({ t: cap.slice(last, m.index), b: false }); segs.push({ t: m[1], b: true }); last = re.lastIndex; }
  if (last < cap.length) segs.push({ t: cap.slice(last), b: false });
  const words = []; for (const s of segs) for (const w of s.t.split(/(\s+)/)) if (w.length) words.push({ w, b: s.b, sp: /^\s+$/.test(w) });
  const size = 66, maxW = 900, lines = []; let cur = [], cw = 0;
  for (const wd of words) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; const ww = ctx.measureText(wd.w).width; if (!wd.sp && cw + ww > maxW && cur.length) { lines.push(cur); cur = []; cw = 0; } if (wd.sp && cur.length === 0) continue; cur.push({ ...wd, ww }); cw += ww; }
  if (cur.length) lines.push(cur);
  const lh = size * 1.08, bh = lines.length * lh + 36, bw = 980, bx = (W - bw) / 2, by = 1165;
  ctx.save(); ctx.globalAlpha = alpha; const box = resample(rect(bx, by, bw, bh), 3, true); paint(ctx, box, PAL.cream, { seed: seedBg(CURD, 0), amp: 1.2 }); loopInk(ctx, box, { seed: seedBg(CURD, 1), w: 7, amp: 1.4 });
  lines.forEach((ln, li) => { const tw = ln.reduce((s, x) => s + x.ww, 0); let x = CX - tw / 2; const y = by + 18 + lh * li + lh / 2; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 600} ${size}px Caveat`; ctx.fillStyle = wd.b ? PAL.red : PAL.ink; ctx.fillText(wd.w, x, y); x += wd.ww; } });
  ctx.restore(); }

// ---------------------------------------------------------------- frame function
function locate(t) { for (let i = 0; i < SEG.length; i++) if (t < SEG[i].end || i === SEG.length - 1) return i; return SEG.length - 1; }
function frame(t) { const i = locate(t), S = SEG[i], dur = S.end - S.start, D = drawingAt(t, EXPO[i], (i + 1) * 10000); CURD = D;
  const lt = clamp(D.tq - S.start, 0, Math.max(dur, TL_TAIL(i))), u = clamp(lt / dur), cam = camera(D.t1, shakesFor(i, S));
  ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, cam); ctx.save(); ctx.translate(cam.x, cam.y); const shot = shotFor(i, lt); zoomWeight(shot); ctx.save(); applyShot(ctx, shot); SC[i](lt, u); ctx.restore(); resetWeight(); ctx.restore();
  if (i < SEG.length - 1) caption(S.cap, sstep(0, .2, lt)); drawTooth(ctx, D); }
const TL_TAIL = (i) => (i === SEG.length - 1 ? 4 : 0);
window.DUR = window.TL.total;
window.CUES = [['thud', SEG[0].start + 1.95], ['sparkle', SEG[0].start + 2.0], ['whoosh', SEG[1].start], ['pop', SEG[2].start + .3], ['scribble', SEG[3].start, SEG[3].end], ['pop', SEG[4].start + 1], ['pop', SEG[4].start + 2],
  ['tick', SEG[5].start + 1.8], ['thud', SEG[5].start + 2.6], ['pop', SEG[6].start + .5], ['snap', SEG[7].start + 2.4], ['sparkle', SEG[7].start + 2.45], ['bubbles', SEG[8].start + .1], ['whoosh', SEG[9].start], ['slide', SEG[10].start + .3],
  ['whoosh', SEG[11].start], ['whoosh', SEG[12].start], ['pop', SEG[13].start + 1], ['snap', SEG[14].start + .05], ['thud', SEG[14].start + .1], ['snap', SEG[15].start + 2.2], ['pop', SEG[16].start + .6], ['pop', SEG[16].start + 1.0], ['chime', SEG[17].start, 84]];
// loop: the last 0.5 s blends back toward the hook frame (at most 40%)
window.seek = (t) => { frame(t); const T = window.DUR, lp = clamp((t - (T - .5)) / .5); if (lp > 0) { const keep = ctx.getImageData(0, 0, W, H); frame(.05); const f0 = ctx.getImageData(0, 0, W, H); const k = .4 * E.io3(lp), Aa = keep.data, B = f0.data;
  for (let j = 0; j < Aa.length; j += 4) { Aa[j] += (B[j] - Aa[j]) * k; Aa[j + 1] += (B[j + 1] - Aa[j + 1]) * k; Aa[j + 2] += (B[j + 2] - Aa[j + 2]) * k; } ctx.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { CURD = drawingAt(2.2, 1, 10000); ctx.setTransform(1, 0, 0, 1, 0, 0); drawPaper(ctx, { x: 0, y: 0 }); door(ctx, 560, 700, 330, 830, 1); hand(ctx, 560, 1100, 1.05, 2); knob(ctx, 640, 1100, 52, 3, 1); bolt(ctx, 560, 1080, 600, 1100, CS(115), 1.2); speedLines(ctx, 610, 1100, 120, 330, 16, CS(116), 9);
  title(ctx, 'WHY MORE', CX, 380, 150, PAL.ink, { seed: TS(500) }); title(ctx, 'ZAPS IN', CX, 530, 150, PAL.ink, { seed: TS(501) }); title(ctx, 'WINTER?', CX, 680, 170, PAL.red, { seed: TS(502) }); drawTooth(ctx, CURD); };
window.seek(0); window.ready = true;
