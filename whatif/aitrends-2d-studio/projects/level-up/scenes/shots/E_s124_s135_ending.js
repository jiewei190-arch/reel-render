// E_s124_s135_ending.js — ep 5 batch E (380.76-418.965): ENDING: in real life no screen, training really works, FIG 7 (fast nerves, then
// slow years: muscles, bones, tendons catch up), nobody doubles every three days, bigger isn't a shortcut, FIG 8 square-cube (x2 tall ->
// x4 stronger, x8 heavier), AAP 2020 (kids + teens can train safely), coaching + technique, the question lock-up, the end screen.
// LEGAL: STYLE.md DON'T list (no series names, no System/Player/Quest words, no portals, eyes never glow).
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, text, FONTS, rr, seg, circle, ring, poly } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { chip } from '../sets/hud.js';
import { board, draw, label } from '../sets/bp.js';
import { home3, home3Fg } from '../sets/home3.js';
import { garden, gardenFg } from '../sets/garden.js';
import { PAL, zip, miniCard, sparks } from '../sets/statcard.js';
import { VOLUNTEER } from '../cast.js';
import { sw, hero, handAt, bowl, titleText, CYAN } from './A_lib.js';
import { pumpkin } from './E_s112_s123_last_morning.js';

const GOLD = '#ffc93c', CREAM = '#e8f0ff', CORAL = '#FF6B5B';
const T = (g, s, x, y, o = {}) => text(g, s, x, y, { size: 34, color: CREAM, font: FONTS.ui, weight: 800, ...o });
const push = (g, t, dur, fn, amt = 0.035) => { g.save(); const z = 1 + amt * t / dur; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const GARDEN = (g, t, cam) => garden(g, t, cam, { view: 'garden', mood: 'morning' });
const SQUAT = (k) => blendPose(POSES.stand, { ...POSES.crouch, eF: [40, -110], hF: [70, -112], eB: [30, -108], hB: [60, -110] }, k);
// a little cream stick figure for the blueprints (feet at x, y; h = height)
function bpFig(g, x, y, h, o = {}) { const w = (o.w ?? 1) * h * 0.06, c = o.color || CREAM; g.save(); g.lineCap = 'round'; ring(g, x, y - h * 0.9, h * 0.1, Math.max(3, w * 0.6), c); seg(g, [[x, y - h * 0.8], [x, y - h * 0.42]], w * 1.4, c); seg(g, [[x, y - h * 0.42], [x - h * 0.12, y]], w, c); seg(g, [[x, y - h * 0.42], [x + h * 0.12, y]], w, c); seg(g, [[x, y - h * 0.72], [x - h * 0.16, y - h * 0.5]], w, c); seg(g, [[x, y - h * 0.72], [x + h * 0.16, y - h * 0.5]], w, c); g.restore(); }

// s124 — "In real life, no screen pops out of the air."  morning garden: HERO reaches up and waves his hand through the empty air where a
// card would be on 'pops' - nothing (a faint cream dotted card outline fades on 'air.'); MINA shrugs.
registerShot('s124', { draw(g, t, info) {
  const st = info.shot.start, tP = sw('pops', st, 1.42), tA = sw('air', st, 2.14);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [0, 20], y: [-60, -60] });
  const G = GARDEN(g, t, cam), hx = G.CX - 160;
  layer(g, cam, 1, (g) => {
    const wave = Math.sin((t - tP) * 9) * 18 * (t > tP && t < tA + 0.4 ? 1 : 0);
    const hp = idle(t > tP - 0.3 ? { ...POSES.stand, eF: [24, -196], hF: [44 + wave, -246] } : POSES.stand, t, 2);
    hero(g, { x: hx, y: G.GY + 20, s: 1.9, facing: 1, pose: hp, expr: t > tP ? 'confused' : 'neutral', blink: blinkFlag(t, 3.4, 2), look: lookToward(0.6, -0.8), t, rim: G.rim });
    actor(g, 'MINA', { x: hx + 520, y: G.GY + 20, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [tP + 0.2, 'shrug']]), t, 3), expr: 'neutral', blink: blinkFlag(t, 2.9, 3), look: lookToward(-1, -0.3), t, rim: G.rim });
    const a = 0.7 * (1 - ease.in(prog(t, tA, tA + 0.6))); if (a > 0.01) { g.save(); g.globalAlpha = a; g.setLineDash([14, 12]); g.strokeStyle = '#fbf3dc'; g.lineWidth = 4; rr(g, hx + 140, G.GY - 640, 360, 140, 26); g.stroke(); g.setLineDash([]); g.restore(); }
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: '#fff0c8' });
} });

// s125 — "But training really works."  same garden: HERO does a proper bodyweight squat with good form, MINA copies him, DEV counts on his
// fingers; a gold tick chip on 'works.'
registerShot('s125', { draw(g, t, info) {
  const st = info.shot.start, tW = sw('works', st, 0.84);
  const cam = camMove(t, info.dur, { z: [1.02, 1.05], x: [0, 0], y: [-60, -60] });
  const G = GARDEN(g, t, cam), hx = G.CX - 200, k = 0.5 - 0.5 * Math.cos(t * 3.4);
  layer(g, cam, 1, (g) => {
    hero(g, { x: hx, y: G.GY + 20, s: 1.9, facing: 1, pose: SQUAT(k), expr: 'determined', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0), t, rim: G.rim });
    actor(g, 'MINA', { x: hx + 380, y: G.GY + 20, s: 2.0, facing: 1, pose: SQUAT(0.5 - 0.5 * Math.cos(t * 3.4 - 0.4)), expr: 'determined', blink: blinkFlag(t, 2.9, 3), look: lookToward(1, 0), t, rim: G.rim });
    actor(g, 'DEV', { x: hx + 820, y: G.GY + 20, s: 1.9, facing: -1, pose: idle(POSES.explain, t, 4), expr: 'happy', talk: false, blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, 0.2), t, rim: G.rim });
  });
  gardenFg(g, t, cam, { view: 'garden' });
  chip(g, t, { str: '✓ TRAINING WORKS', at: tW, x: E.W / 2, y: 120, dur: info.dur });
} });

// ---------- FIG 7: how strength really grows ----------
const X0 = 300, X1 = 1600, Y0 = E.H * 0.7, HH = 420;
const curve = (u) => 0.55 * (1 - Math.exp(-u / 0.06)) + 0.45 * u;              // u 0..1 along the time axis: a steep start, then slow years
function axes(g, yrs) { seg(g, [[X0, Y0], [X1, Y0]], 4, CREAM); seg(g, [[X0, Y0], [X0, Y0 - HH - 30]], 4, CREAM); T(g, 'STRENGTH', X0 - 6, Y0 - HH - 60, { size: 26, align: 'left' }); T(g, yrs ? 'TIME:  weeks  ...  YEARS' : 'TIME', (X0 + X1) / 2, Y0 + 50, { size: 28, color: yrs ? GOLD : CREAM }); }
const pts = (k) => Array.from({ length: 61 }, (_, i) => { const u = i / 60 * k; return [X0 + (X1 - X0) * u, Y0 - curve(u) * HH]; });
// s126 — "Strength comes fast at first, from your nervous system,"  a cream strength curve draws on: a steep start, 'fast at first' tag on
// 'fast', gold 'NERVOUS SYSTEM' on 'nervous'.
registerShot('s126', { draw(g, t, info) {
  const st = info.shot.start, tF = sw('fast', st, 0.76), tN = sw('nervous', st, 2.32);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 7 - HOW STRENGTH REALLY GROWS', fig: 'REAL LIFE' }); axes(g, false);
    draw(g, pts(0.25), ease.out(prog(t, 0.15, 1.6)), { w: 7, color: CREAM });
    if (t > tF) T(g, 'fast at first', X0 + 200, Y0 - HH * 0.6, { color: GOLD, alpha: ease.out(prog(t, tF, tF + 0.3)) });
    label(g, t, { at: [X0 + 40, Y0 - curve(0.03) * HH], to: [X0 + 420, Y0 - HH * 0.95], str: 'NERVOUS SYSTEM', start: tN });
  });
} });
// s127 — "then slowly, over years, as muscles, bones and tendons catch up."  the curve keeps rising gently over a long axis ('YEARS'); three
// cream bars underneath catch up one per word (MUSCLES, BONES, TENDONS); a gold 'catch up' bracket on 'up.' One continuous move.
registerShot('s127', { draw(g, t, info) {
  const st = info.shot.start, tY = sw('years', st, 1.47), tM = sw('muscles', st, 2.31), tB = sw('bones', st, 3.07), tT = sw('tendons', st, 3.69), tU = sw('up', st + 3.5, 4.37);
  g.save(); const k = ease.inOut(t / info.dur); g.translate(-60 * k, -40 * k); const z = 1 + 0.04 * k; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  board(g, t, { title: 'FIG 7 - HOW STRENGTH REALLY GROWS', fig: 'REAL LIFE' }); axes(g, t > tY);
  draw(g, pts(lerp(0.25, 1, ease.inOut(prog(t, 0.3, 3.5)))), 1, { w: 7, color: CREAM });
  label(g, t, { at: [X0 + 40, Y0 - curve(0.03) * HH], to: [X0 + 420, Y0 - HH * 0.95], str: 'NERVOUS SYSTEM', start: -1 });
  [['MUSCLES', tM], ['BONES', tB], ['TENDONS', tT]].forEach(([s, a], i) => { const p = ease.out(prog(t, a, a + 0.8)); if (t < a) return; const y = Y0 + 110 + i * 56; rr(g, X0, y - 18, (X1 - X0) * 0.85 * p, 36, 18); g.fillStyle = alpha(CREAM, 0.75); g.fill(); T(g, s, X0 - 20, y, { size: 26, align: 'right' }); });
  if (t > tU) { const p = ease.outBack(prog(t, tU, tU + 0.35)); seg(g, [[X1 - 10, Y0 + 92], [X1 + 20, Y0 + 92], [X1 + 20, Y0 + 220], [X1 - 10, Y0 + 220]], 5, GOLD); T(g, 'catch up', X1 + 130, Y0 + 156, { color: GOLD, size: 40 * p }); }
  g.restore();
} });

// s128 — "Nobody doubles every three days."  the story rule's x2 staircase shoots off the top; a coral cross stamps over it on 'doubles'-'days.';
// gold 'NOBODY' chip.
registerShot('s128', { draw(g, t, info) {
  const st = info.shot.start, tD = sw('doubles', st, 0.45), tY = sw('days', st, 1.51);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'THE STORY RULE vs REAL LIFE', fig: 'REAL LIFE' });
    const k = ease.in(prog(t, 0, tD + 0.4)); let x = 380, y = E.H * 0.86, w = 120, h = 30;
    for (let i = 0; i < 9; i++) { const yy = y - h * k * 1.4; rr(g, x, yy - h, w, h + (E.H - yy), 6); g.fillStyle = alpha(CREAM, 0.7); g.fill(); x += w + 14; y = yy; h *= 2; if (yy < -200) break; }
    T(g, 'x2 every 3 levels', 520, E.H * 0.9, { color: CREAM, size: 30 });
    const c = prog(t, tD, tY); if (c > 0) { const a = ease.out(prog(c, 0, 0.5)), b = ease.out(prog(c, 0.5, 1)); g.save(); g.lineCap = 'round'; seg(g, [[700, 260], [lerp(700, 1300, a), lerp(260, 860, a)]], 34, CORAL); if (b > 0) seg(g, [[1300, 260], [lerp(1300, 700, b), lerp(260, 860, b)]], 34, CORAL); g.restore(); }
  });
  chip(g, t, { str: 'NOBODY', at: tY, x: E.W - 260, y: 120, dur: info.dur });
} });

// s129 — "Getting bigger isn't a shortcut either."  a cream figure puffs up on 'bigger'; a cream 'shortcut' arrow sign beside it bends and
// droops on 'shortcut'.
registerShot('s129', { draw(g, t, info) {
  const st = info.shot.start, tB = sw('bigger', st, 0.39), tS = sw('shortcut', st, 1.19);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'BIGGER ISN\'T A SHORTCUT', fig: 'REAL LIFE' });
    const p = ease.outBack(prog(t, tB, tB + 0.5)); bpFig(g, 720, E.H * 0.82, 420 + 120 * p, { w: 1 + 1.6 * p });
    const d = ease.inOut(prog(t, tS, tS + 0.8)); g.save(); g.translate(1250, E.H * 0.82); seg(g, [[0, 0], [0, -300]], 10, CREAM); g.translate(0, -300); g.rotate(d * 1.1);
    g.fillStyle = alpha(CREAM, 0.85); g.beginPath(); g.moveTo(0, -40); g.lineTo(260, -40); g.lineTo(320, 0); g.lineTo(260, 40); g.lineTo(0, 40); g.closePath(); g.fill(); text(g, 'SHORTCUT', 140, 2, { size: 40, color: '#0b1a33', font: FONTS.ui, weight: 900 }); g.restore();
  });
} });

// s130 — "Remember the square-cube law?"  FIG 8: a small cream cube and one twice as tall draw on; a gold stamp 'SQUARE-CUBE LAW' lands on
// 'square-cube'.
function cube(g, x, y, s, k = 1, col = CREAM) { const d = s * 0.4; const P = [[x, y], [x + s, y], [x + s, y - s], [x, y - s], [x, y], [x + d, y - d * 0.6 - s], [x + s + d, y - d * 0.6 - s], [x + s, y - s], [x + s + d, y - d * 0.6 - s], [x + s + d, y - d * 0.6], [x + s, y]]; draw(g, [[x, y - s], [x + d, y - s - d * 0.6]], k, { w: 5, color: col }); draw(g, P, k, { w: 5, color: col }); }
registerShot('s130', { draw(g, t, info) {
  const st = info.shot.start, tSq = sw('square', st, 0.63);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 8 - SQUARE-CUBE LAW', fig: 'REMEMBER?' });
    cube(g, 520, E.H * 0.8, 160, ease.out(prog(t, 0.19, 0.9))); cube(g, 920, E.H * 0.8, 320, ease.out(prog(t, 0.4, 1.2)));
    const p = ease.outBack(prog(t, tSq, tSq + 0.3)); if (p > 0) { g.save(); g.translate(1460, E.H * 0.34); g.rotate(-0.1); g.scale(p, p); rr(g, -260, -60, 520, 120, 18); g.strokeStyle = GOLD; g.lineWidth = 8; g.stroke(); text(g, 'SQUARE-CUBE LAW', 0, 4, { size: 54, color: GOLD, font: FONTS.ui, weight: 900 }); g.restore(); }
  }, 0.03);
} });

// s131 — "Twice as tall, you'd be about four times stronger, but eight times heavier."  a cream figure doubles in height ('x2 TALL'); its
// muscle readout rolls to gold 'x4 STRONGER' on 'four'-'stronger,'; its weight readout to 'x8 HEAVIER' on 'eight'-'heavier.'; the x8 side of
// a cream balance sinks.
registerShot('s131', { draw(g, t, info) {
  const st = info.shot.start, tTw = sw('twice', st, 0.14), tF = sw('four', st, 1.56), tSt = sw('stronger', st, 2.28), tE = sw('eight', st, 3.04), tH = sw('heavier', st, 3.70);
  push(g, t, info.dur, () => {
    board(g, t, { title: 'FIG 8 - SQUARE-CUBE LAW', fig: 'TWICE AS TALL' });
    bpFig(g, 360, E.H * 0.82, 220); const gr = ease.outBack(prog(t, tTw, tTw + 0.6)); bpFig(g, 640, E.H * 0.82, lerp(220, 440, gr), { w: 1 });
    if (t > tTw) T(g, 'x2 TALL', 640, E.H * 0.88, { color: GOLD, size: 40 });
    const rS = Math.round(lerp(1, 4, ease.out(prog(t, tF - 0.2, tSt)))), rH = Math.round(lerp(1, 8, ease.out(prog(t, tE - 0.2, tH))));
    if (t > tF - 0.2) T(g, `x${rS} STRONGER`, 1080, E.H * 0.3, { color: GOLD, size: 54, align: 'left' });
    if (t > tE - 0.2) T(g, `x${rH} HEAVIER`, 1080, E.H * 0.42, { color: GOLD, size: 54, align: 'left' });
    // the balance: strength (x4) vs weight (x8) - the weight side sinks
    const tilt = 0.22 * ease.inOut(prog(t, tH, tH + 0.6)), bx = 1360, by = E.H * 0.66;
    seg(g, [[bx, by], [bx, E.H * 0.86]], 8, CREAM); g.save(); g.translate(bx, by); g.rotate(tilt); seg(g, [[-260, 0], [260, 0]], 8, CREAM);
    for (const [sx, s] of [[-260, 'x4'], [260, 'x8']]) { seg(g, [[sx, 0], [sx, 70]], 4, CREAM); g.save(); g.translate(sx, 70); g.rotate(-tilt); rr(g, -80, 0, 160, 24, 10); g.fillStyle = alpha(CREAM, 0.8); g.fill(); text(g, s, 0, -26, { size: 40, color: GOLD, font: FONTS.ui, weight: 900 }); g.restore(); }
    g.restore();
  });
} });

// s132 — "Doctors say kids and teens can strength train safely,"  a cream source card slides in over the dimmed garden: 'AMERICAN ACADEMY OF
// PEDIATRICS, 2020' (gold '2020'); three icons pop: a kid, a teen on 'teens', a dumbbell with a gold tick 'SAFELY' on 'safely,'.
registerShot('s132', { draw(g, t, info) {
  const st = info.shot.start, tD = sw('doctors', st, 0.15), tK = sw('kids', st, 0.83), tT = sw('teens', st, 1.41), tS = sw('safely', st, 2.83);
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], y: [-60, -60] });
  blurLayer(g, 8, (g) => GARDEN(g, t, cam), null, 1); veil(g, '#0b0f1a', 0.45);
  const k = ease.out(prog(t, tD, tD + 0.5)); g.save(); g.translate(lerp(E.W + 600, E.W / 2, k), E.H * 0.3); g.rotate(-0.02);
  rr(g, -560, -110, 1120, 220, 22); g.fillStyle = '#f2ead8'; g.fill(); g.strokeStyle = '#8a7a60'; g.lineWidth = 4; g.stroke();
  text(g, 'AMERICAN ACADEMY OF PEDIATRICS', 0, -30, { size: 52, color: '#2a2418', font: FONTS.ui, weight: 900 }); text(g, '2020', 0, 50, { size: 64, color: GOLD, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#2a2418' }); g.restore();
  const icon = (x, a, fn) => { const p = ease.outBack(prog(t, a, a + 0.35)); if (p <= 0) return; g.save(); g.translate(x, E.H * 0.72); g.scale(p, p); circle(g, 0, 0, 120, alpha('#0b1a33', 0.85)); ring(g, 0, 0, 120, 4, CREAM); fn(); g.restore(); };
  icon(E.W / 2 - 420, tK, () => { bpFig(g, 0, 80, 150); T(g, 'KIDS', 0, 160, { color: GOLD }); });
  icon(E.W / 2, tT, () => { bpFig(g, 0, 90, 200); T(g, 'TEENS', 0, 160, { color: GOLD }); });
  icon(E.W / 2 + 420, tS, () => { seg(g, [[-60, 0], [60, 0]], 10, CREAM); rr(g, -84, -36, 24, 72, 8); g.fillStyle = CREAM; g.fill(); rr(g, 60, -36, 24, 72, 8); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 40); g.lineTo(60, 70); g.lineTo(110, 10); g.stroke(); T(g, 'SAFELY', 0, 160, { color: GOLD }); });
} });

// s133 — "with good coaching and technique."  back garden: an adult coach (whistle, clipboard, no colour item) adjusts HERO's squat form;
// MINA nods; gold chips 'COACHING' on 'coaching' and 'TECHNIQUE' on 'technique.'
registerShot('s133', { draw(g, t, info) {
  const st = info.shot.start, tC = sw('coaching', st, 0.54), tT = sw('technique', st, 1.26);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-60, -60] });
  const G = GARDEN(g, t, cam), hx = G.CX - 160;
  layer(g, cam, 1, (g) => {
    hero(g, { x: hx, y: G.GY + 20, s: 1.9, facing: 1, pose: SQUAT(t > tT ? 0.75 : 0.6), expr: 'determined', blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0), t, rim: G.rim });
    const co = { x: hx + 340, y: G.GY + 20, s: 1.95, facing: -1 }, cp = idle({ ...POSES.explain, hF: [36, -130], eF: [26, -150] }, t, 6);
    actor(g, VOLUNTEER, { ...co, pose: cp, expr: 'smile', talk: false, blink: blinkFlag(t, 3.2, 6), look: lookToward(-1, 0.5), t, rim: G.rim });
    const hb = handAt(co, cp, 'B'); rr(g, hb[0] - 26, hb[1] - 50, 52, 70, 6); g.fillStyle = '#c8a070'; g.fill(); g.fillStyle = '#f2ead8'; g.fillRect(hb[0] - 20, hb[1] - 40, 40, 52);
    const ch = [co.x - 10, co.y - 168 * 1.95]; seg(g, [[ch[0] - 10, ch[1] - 30], [ch[0] - 2, ch[1] + 4]], 3, '#ddd'); circle(g, ch[0], ch[1] + 8, 7, '#c0c4cc');
    actor(g, 'MINA', { x: hx - 360, y: G.GY + 20, s: 2.0, facing: 1, pose: idle(POSES.stand, t, 3), expr: 'smile', blink: blinkFlag(t, 2.9, 3), look: lookToward(1, 0.1 + 0.15 * Math.sin(t * 6)), t, rim: G.rim });
  });
  gardenFg(g, t, cam, { view: 'garden' });
  chip(g, t, { str: 'COACHING', at: tC, x: E.W / 2 - 220, y: 120, dur: info.dur }); chip(g, t, { str: 'TECHNIQUE', at: tT, x: E.W / 2 + 220, y: 120, dur: info.dur });
} });

// s134 — "If you levelled up every morning, what would you lift first?"  QUESTION lock-up over the dimmed breakfast kitchen with an empty
// bowl and a faint seam in the air above it; pops on 'levelled'; on 'lift' the seam twitches with one gold spark.
registerShot('s134', { draw(g, t, info) {
  const st = info.shot.start, tLv = sw('levelled', st, 0.43), tLi = sw('lift', st + 1.5, 2.17);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-40, -50] });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos;
  layer(g, cam, 1, (g) => { bowl(g, P.tableX, P.tableTop - 6, 1); const tw = t > tLi && t < tLi + 0.3 ? Math.sin((t - tLi) * 60) * 3 : 0; zip(g, t, P.tableX + tw, P.tableTop - 150, { w: 280, open: 0, seam: 1 }); sparks(g, t, tLi, P.tableX, P.tableTop - 150, { n: 8, s: 0.6, seed: 2 }); });
  veil(g, '#0b0f1a', 0.45);
  titleText(g, t, tLv, ['IF YOU LEVELLED UP', 'EVERY MORNING,', 'WHAT WOULD YOU LIFT FIRST?'], E.H * 0.32);
} });

// s135 — "Tell us in the comments. And subscribe for more What Ifs."  END SCREEN: the cast lined up in the kitchen doorway: HERO holding the
// giant pumpkin on one finger, MINA with her stopwatch, DEV filming, BISCUIT on the table with her tiny LV 1 card; a comment bubble pops on
// 'Tell', the subscribe pill + like icon on 'subscribe'.
registerShot('s135', { draw(g, t, info) {
  const st = info.shot.start, tTe = sw('tell', st, 0.15), tSu = sw('subscribe', st, 1.98);
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], y: [-30, -30] });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos, GY = H.GY ?? E.H * 0.8;
  veil(g, '#0b0f1a', 0.25);
  layer(g, cam, 1, (g) => {
    const hx = E.W * 0.36, hp = idle({ ...POSES.stand, eF: [20, -200], hF: [26, -250] }, t, 2), ho = { x: hx, y: GY + 20, s: 1.9, facing: 1 };
    const h = handAt(ho, hp, 'F'); pumpkin(g, h[0], h[1] - 4 + Math.sin(t * 2) * 3, 0.55);
    hero(g, { ...ho, pose: hp, expr: 'joy', blink: blinkFlag(t, 3.4, 2), look: lookToward(0.3, -0.6), t });
    actor(g, 'MINA', { x: hx - 300, y: GY + 20, s: 2.0, facing: 1, pose: idle({ ...POSES.stand, eF: [20, -140], hF: [34, -160] }, t, 3), expr: 'smile', blink: blinkFlag(t, 2.9, 3), look: lookToward(1, -0.2), t });
    circle(g, hx - 300 + 34 * 1.44, GY + 20 - 160 * 1.44, 14, '#e8e4da');
    const dO = { x: hx + 330, y: GY + 20, s: 1.9, facing: -1 }, dp = idle(POSES.phone, t, 4); actor(g, 'DEV', { ...dO, pose: dp, expr: 'happy', blink: blinkFlag(t, 3.1, 5), look: lookToward(-1, -0.2), t });
    const ph = handAt(dO, dp, 'F'); rr(g, ph[0] - 16, ph[1] - 50, 32, 56, 6); g.fillStyle = '#16121c'; g.fill(); if (Math.floor(t * 2) % 2 === 0) circle(g, ph[0] + 6, ph[1] - 40, 4, '#ff3b30');
    cat(g, { x: P.tableX + 120, y: P.tableTop, s: 1.6, facing: -1, pose: 'sit', t });
    miniCard(g, t, { x: P.tableX + 60, y: P.tableTop - 330, s: 0.7, lv: 1, str: 0.4 });
  });
  const bub = ease.outBack(prog(t, tTe, tTe + 0.4)); if (bub > 0) { g.save(); g.translate(E.W * 0.74, E.H * 0.24); g.scale(bub, bub); rr(g, -120, -70, 240, 140, 40); g.fillStyle = '#fbf3dc'; g.fill(); poly(g, [[-40, 66], [-80, 110], [0, 66]], '#fbf3dc'); for (let i = -1; i <= 1; i++) circle(g, i * 50, 0, 14, '#2a2418'); g.restore(); }
  const sp = ease.outBack(prog(t, tSu, tSu + 0.4)); if (sp > 0) { g.save(); g.translate(E.W * 0.74, E.H * 0.46); g.scale(sp, sp); rr(g, -190, -46, 380, 92, 46); g.fillStyle = '#e0302a'; g.fill(); text(g, 'SUBSCRIBE', 20, 2, { size: 46, color: '#fff', font: FONTS.ui, weight: 900 }); poly(g, [[-150, -20], [-150, 20], [-118, 0]], '#fff'); g.restore();
    g.save(); g.translate(E.W * 0.74 + 260, E.H * 0.46); g.scale(sp, sp); circle(g, 0, 0, 46, '#fbf3dc'); g.fillStyle = '#2a2418'; rr(g, -20, -8, 12, 30, 3); g.fill(); g.beginPath(); g.moveTo(-6, -8); g.lineTo(4, -30); g.lineTo(12, -26); g.lineTo(8, -8); g.lineTo(22, -8); g.lineTo(18, 22); g.lineTo(-6, 22); g.closePath(); g.fill(); g.restore(); }
} });
