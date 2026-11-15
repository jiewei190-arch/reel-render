// C_s088_s101_watch_gps.js — batch C (H3): THE WATCH (that evening, watch 18:30:40 vs oven clock 18:30:00, MINA lip-sync "Yours is forty
// seconds fast,", 4 x 10 = 40 s, giant face HERO '+40 s'), RULE 5 'CLOCKS REALLY CAN DISAGREE.' + FIG 9 (much smaller, GPS satellites,
// atomic clocks, +45 µs/day, -7 µs/day, +38 µs every day vs ground clocks, EINSTEIN as plain text, the correction off, the map off by
// kilometres). Sets: morning.js (H4) evening kitchen, stopprops.js (H2) heroWatch / ovenClock / timeDiff / clockStr, timebp.js (H3),
// bp board/label, hud ruleCard/chip, faces. LEGAL: original; no brand phones or map apps; Einstein only as plain text, no likeness.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, rng, seg, circle, ring, rr, poly, glow, alpha, shade, text, blurLayer, veil, talkAmount, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { camMove, exprAt, lookToward } from '../sets/acting.js';
import { faceAt } from '../sets/faces.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { heroWatch, ovenClock, timeDiff, clockStr } from '../sets/stopprops.js';
import { snapHand, snapRing, hero, heroFace, goldPop, cTxt, creamChip, bpArrow, push, blinkF, CREAM, TEAL } from './C_lib.js';
import { morning, morningFg } from '../sets/morning.js';

const U = () => S().ui, T0 = 18 * 3600 + 30 * 60;
const evening = (g, t, cam) => morning(g, t, cam, { view: 'kitchen', mood: 'evening', breakfast: false, juice: false, butter: false, jug: false, ovenTime: '18:30' });
const HOLD = { ...POSES.stand, eF: [24, -150], hF: [40, -186] };   // the hero's near arm held up (watch at the wrist)
const MINA_HOLD = { ...POSES.reach, eF: [30, -150], hF: [56, -176] };

// s088 THAT EVENING: THE WATCH VS THE OVEN CLOCK
registerShot('s088', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.22, 1.26], drift: 0.3 }), x: -380, y: 60 }, M = evening(g, t, cam), P = M.pos, hx = P.ovenX + 430;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.ovenX + 250, y: M.GY, s: 1.9, facing: 1, pose: t > 1.0 ? MINA_HOLD : POSES.stand, expr: 'thinking', blink: blinkF(t, 3, 1), look: lookToward(1, -0.7), rim: { color: M.rim, dir: [-1, -0.5] }, t });
    hero(g, { x: hx, y: M.GY, facing: -1, pose: t > 1.0 ? HOLD : POSES.stand, expr: 'thinking', blink: blinkF(t, 2.8, 2), look: lookToward(-0.3, -1), rim: { color: M.rim, dir: [-1, -0.5] }, watchGlow: t > 2.16 ? 1 : 0, t });
  });
  chip(g, t, { str: 'THAT EVENING', at: 0.3, x: E.W * 0.2, y: E.H * 0.12, tone: 'gold' });
  // the split read-out
  const a = ease.out(prog(t, 2.0, 2.4)); if (a > 0.01) { g.save(); g.globalAlpha *= a; rr(g, E.W * 0.5 - 20, E.H * 0.6, E.W * 0.46, E.H * 0.34, 24); g.fillStyle = 'rgba(10,8,20,.72)'; g.fill(); g.strokeStyle = alpha(U().gold, 0.6); g.lineWidth = 3; g.stroke();
    heroWatch(g, E.W * 0.62, E.H * 0.75, 0.5, { time: clockStr(T0 + 40 + t), glow: 0.5 }); goldPop(g, t, '18:30:40', 2.16, E.W * 0.62, E.H * 0.9, 58); cTxt(g, 'YOUR WATCH', E.W * 0.62, E.H * 0.635, { size: 24 });
    if (t > 3.2) { ovenClock(g, E.W * 0.84, E.H * 0.75, 0.5 * ease.outBack(prog(t, 3.2, 3.5)), { time: clockStr(T0 + t) }); goldPop(g, t, '18:30:00', 3.38, E.W * 0.84, E.H * 0.9, 58); cTxt(g, 'OVEN CLOCK', E.W * 0.84, E.H * 0.635, { size: 24 }); }
    g.restore(); }
} });

// s089 "YOURS IS FORTY SECONDS FAST"
registerShot('s089', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.42, 1.46], drift: 0.25 }), x: -420, y: 110 }, M = evening(g, t, cam), P = M.pos, gt = info.shot.start + t;
  const talk = t > 0.18 && t < 1.42 ? talkAmount(gt, info.shot.start + 0.18, info.shot.start + 1.42) : 0;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.ovenX + 290, y: M.GY, s: 1.9, facing: 1, pose: t < 0.5 ? MINA_HOLD : { ...MINA_HOLD, hF: [62, -170 + Math.sin(t * 14) * 3] }, expr: exprAt(t, [[0, 'thinking'], [0.64, 'smirk'], [1.98, 'thinking']]), talk, blink: blinkF(t, 3.2, 2), look: lookToward(1, -0.2), rim: { color: M.rim, dir: [-1, -0.5] }, t });
    hero(g, { x: P.ovenX + 450, y: M.GY, facing: -1, pose: HOLD, expr: exprAt(t, [[0, 'surprised'], [1.5, 'nervous']]), blink: blinkF(t, 2.8, 1), look: t > 1.5 ? lookToward(0.2, -1) : lookToward(-1, 0.2), rim: { color: M.rim, dir: [-1, -0.5] }, watchGlow: 1, t });
  });
  timeDiff(g, t, 0.64, E.W * 0.8, E.H * 0.3, { str: '+40 s', size: 80 });
} });

// a cream snapping-hand icon (s090)
function snapIcon(g, x, y, s, k) {
  if (k <= 0.01) return; const c = U().cream; g.save(); g.translate(x, y); g.scale(s * k, s * k); g.strokeStyle = c; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 30, 52, 60, 0, 0, 7); g.stroke(); seg(g, [[18, -20], [26, -110]], 7, c); seg(g, [[-6, -24], [-80, -44]], 7, c); seg(g, [[-36, 10], [-84, -40]], 7, c);
  for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.45; seg(g, [[-84 + Math.cos(a) * 26, -44 + Math.sin(a) * 26], [-84 + Math.cos(a) * 46, -44 + Math.sin(a) * 46]], 5, U().gold); }
  rr(g, -40, 84, 80, 40, 8); g.stroke(); g.restore();
}
// s090 FOUR SNAPS, TEN SECONDS EACH
registerShot('s090', { draw(g, t, info) {
  blurLayer(g, 10, (g) => evening(g, t, { z: 1.3, x: -460, y: 90, r: 0 })); veil(g, '#0c0818', 0.45);
  const xs = [0.2, 0.4, 0.6, 0.8].map(u => E.W * u), at = [0.12, 0.19, 0.26, 0.34], tag = [1.55, 1.72, 1.89, 2.06];
  xs.forEach((x, i) => { const k = ease.outBack(prog(t, at[i], at[i] + 0.3)); if (k > 0.01) { g.save(); g.translate(x, E.H * 0.4); g.scale(k, k); const tip = snapHand(g, t, at[i] + 0.2, 0, 0, 0.5); snapRing(g, t, at[i] + 0.2, tip[0], tip[1], { max: 260 }); g.restore(); } goldPop(g, t, '10 s', tag[i], x, E.H * 0.6, 64); });
  cTxt(g, 'FOUR SNAPS', E.W / 2, E.H * 0.12, { size: 44, alpha: prog(t, 0.34, 0.6) });
  const sl = ease.outBack(prog(t, 2.06, 2.3)); if (sl > 0.01) { g.save(); g.translate(E.W / 2, E.H * 0.82); g.scale(sl, sl); rr(g, -380, -70, 760, 140, 70); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = U().gold; g.lineWidth = 5; g.stroke(); g.restore(); goldPop(g, t, '4 × 10 = 40 s', 2.06, E.W / 2, E.H * 0.82, 84); }
} });

// s091 GIANT FACE HERO, 'forty seconds more'
registerShot('s091', { draw(g, t, info) {
  blurLayer(g, 10, (g) => evening(g, t, { z: 1.4, x: -300, y: 60, r: 0 })); veil(g, '#160c20', 0.15);
  const z = 1 + 0.04 * ease.inOut(t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const f = faceAt(t, [[0, 'awe'], [0.6, 'delighted'], [2.58, 'smirk']]); f.look = t < 2.58 ? [0.5, -0.3] : [0.2, 0];
  heroFace(g, E.W * 0.44, E.H * 0.5, 330, f, { rimColor: '#ffb060', rimSide: -1, blink: Math.abs(t - 1.9) < 0.08 ? 1 : 0 });
  g.restore();
  goldPop(g, t, '+40 s', 0.6, E.W * 0.8, E.H * 0.34, 120, { rot: -0.06 });
  if (t > 1.68) { const p = prog(t, 1.68, 2.6); for (let i = 0; i < 6; i++) { const a = i * 1.05 + t; glow(g, E.W * 0.8 + Math.cos(a) * 170, E.H * 0.34 + Math.sin(a) * 90, 18, U().gold, 0.6 * Math.sin(p * Math.PI)); } }
} });

// s092 RULE 5 CARD
registerShot('s092', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 5, title: 'CLOCKS REALLY CAN DISAGREE.', bg: (g, t) => { blurLayer(g, 8, (g) => { evening(g, t, { z: 1.2, x: -300, y: 0, r: 0 }); ovenClock(g, E.W * 0.28, E.H * 0.55, 0.9, { time: '18:30:00' }); heroWatch(g, E.W * 0.74, E.H * 0.52, 0.8, { time: '18:30:40' }); }); veil(g, '#0c0818', 0.3); } });
} });

// s093 MUCH, MUCH SMALLER
registerShot('s093', { draw(g, t, info) {
  board(g, t, {});
  const s1 = ease.inOut(prog(t, 0.3, 0.55)), s2 = ease.inOut(prog(t, 0.72, 0.95)), sc = lerp(1, lerp(0.45, 0.04, s2), s1 > 0 ? 1 : 0) * (s1 < 1 ? lerp(1, 0.45, s1) / (s1 > 0 ? 0.45 : 1) : 1);
  const size = s2 > 0 ? lerp(0.45, 0.03, s2) : lerp(1, 0.45, s1), x = E.W / 2, y = E.H * 0.48;
  if (size > 0.06) text(g, '+40 s', x, y, { size: 220 * size, color: U().gold, font: FONTS.title, weight: 700, glow: 20, glowColor: alpha(U().gold, 0.6), stroke: 20 * size, strokeColor: '#140f1c' });
  else circle(g, x, y, 7, U().gold);
  const mg = ease.outBack(prog(t, 0.8, 1.15)); if (mg > 0.01) { g.save(); g.translate(x, y); g.scale(mg, mg); ring(g, 0, 0, 150, 12, U().cream); glow(g, 0, 0, 150, '#cfe4ff', 0.12); seg(g, [[106, 106], [230, 230]], 26, U().cream); g.restore(); glow(g, x, y, 40, U().gold, 0.6); }
  cTxt(g, 'MUCH, MUCH SMALLER', x, E.H * 0.86, { size: 40, alpha: prog(t, 0.8, 1.1) }); void sc;
} });

// FIG 9 pieces (cream Earth, satellites, orbits)
const FIG9 = (g, t) => board(g, t, { title: 'FIG 9 - GPS SATELLITES', fig: 'CLOCKS REALLY CAN DISAGREE' });
function earth(g, x, y, r, k = 1) {
  const c = U().cream; g.save(); g.globalAlpha *= k; circle(g, x, y, r, alpha(U().blueprint, 0.35)); ring(g, x, y, r, 5, c);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.strokeStyle = alpha(c, 0.5); g.lineWidth = 3;
  for (const [ox, oy, w, h] of [[-0.4, -0.3, 0.5, 0.35], [0.25, 0.05, 0.4, 0.5], [-0.2, 0.45, 0.3, 0.2]]) { g.beginPath(); g.ellipse(x + ox * r, y + oy * r, w * r, h * r, 0.4, 0, 7); g.stroke(); }
  g.restore(); g.restore();
}
function sat(g, x, y, s = 1, k = 1, o = {}) {
  if (k <= 0.01) return; const c = U().cream; g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); g.globalAlpha *= k;
  rr(g, -30, -24, 60, 48, 6); g.fillStyle = 'rgba(8,16,34,.8)'; g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  for (const sd of [-1, 1]) { rr(g, sd > 0 ? 36 : -96, -16, 60, 32, 3); g.fillStyle = alpha(U().blueprint, 0.6); g.fill(); g.stroke(); seg(g, [[sd * 30, 0], [sd * 36, 0]], 4, c); for (let i = 1; i < 3; i++) seg(g, [[sd > 0 ? 36 + i * 20 : -96 + i * 20, -16], [sd > 0 ? 36 + i * 20 : -96 + i * 20, 16]], 2, c); }
  seg(g, [[0, -24], [0, -40]], 3, c); circle(g, 0, -42, 5, U().gold);
  g.restore();
}
const orbitPt = (cx, cy, rx, ry, a, tilt = -0.2) => [cx + Math.cos(a) * rx * Math.cos(tilt) - Math.sin(a) * ry * Math.sin(tilt), cy + Math.cos(a) * rx * Math.sin(tilt) + Math.sin(a) * ry * Math.cos(tilt)];
function atomicClock(g, x, y, s, t, o = {}) {      // a cream box with gold ticking digits
  const c = U().cream; g.save(); g.translate(x, y); g.scale(s, s); rr(g, -170, -90, 340, 180, 16); g.fillStyle = 'rgba(8,16,34,.9)'; g.fill(); g.strokeStyle = c; g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 3; i++) circle(g, -110 + i * 26, 60, 7, i === Math.floor(t * 6) % 3 ? U().gold : alpha(c, 0.4));
  const v = o.value ?? t, str = o.str ?? (Math.floor(v) % 60).toString().padStart(2, '0') + '.' + Math.floor((v * 1e6) % 1e6).toString().padStart(6, '0');
  text(g, str, 0, -12, { size: o.size ?? 52, color: o.color ?? U().gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(U().gold, 0.5), alpha: o.flicker ? 0.6 + 0.4 * Math.abs(Math.sin(t * 40)) : 1 });
  g.restore();
}

// s094 FIG 9 - GPS
registerShot('s094', { draw(g, t, info) {
  FIG9(g, t);
  push(g, t, info.dur, () => {
    const ex = E.W * 0.5, ey = E.H * 0.56, r = 190; earth(g, ex, ey, r, ease.out(prog(t, 0, 0.3)));
    for (let i = 0; i < 4; i++) { const rx = 380 + i * 40, ry = 150 + i * 40, tl = -0.6 + i * 0.4, k = ease.out(prog(t, 0.15 + i * 0.18, 0.55 + i * 0.18));
      g.save(); g.globalAlpha *= k; g.strokeStyle = alpha(U().cream, 0.4); g.lineWidth = 3; g.setLineDash([10, 10]); g.beginPath(); g.ellipse(ex, ey, rx, ry, tl, 0, 7); g.stroke(); g.restore();
      const p = orbitPt(ex, ey, rx, ry, 1.2 * i + t * 0.25, tl); sat(g, p[0], p[1], 0.75, k); }
    chip(g, t, { str: 'GPS', at: 0.94, x: E.W * 0.22, y: E.H * 0.24, tone: 'gold' });
    const pk = ease.outBack(prog(t, 2.76, 3.1)); if (pk > 0.01) { g.save(); g.translate(ex + 40, ey - 20); g.scale(pk, pk); rr(g, -50, -90, 100, 180, 16); g.fillStyle = '#0c1424'; g.fill(); g.strokeStyle = U().cream; g.lineWidth = 5; g.stroke(); rr(g, -38, -72, 76, 140, 8); g.fillStyle = alpha(U().blueprint, 0.5); g.fill(); for (let i = 0; i < 4; i++) seg(g, [[-38, -50 + i * 32], [38, -40 + i * 30]], 3, alpha(U().cream, 0.5));
      g.fillStyle = U().accent; g.beginPath(); g.arc(4, -14, 16, Math.PI, 0); g.lineTo(4, 16); g.closePath(); g.fill(); circle(g, 4, -14, 6, '#fff'); g.restore(); cTxt(g, 'MAPS ON PHONES', ex + 40, ey + 140, { size: 28, alpha: prog(t, 2.9, 3.2) }); }
  }, 0.03);
} });

// s095 SUPER-ACCURATE CLOCKS
registerShot('s095', { draw(g, t, info) {
  FIG9(g, t);
  const z = ease.inOut(prog(t, 0, 0.5)), x = E.W / 2, y = E.H * 0.5;
  sat(g, x, y, lerp(0.8, 6.2, z), 1);
  if (z > 0.8) { atomicClock(g, x, y - 20, 0.95 * ease.outBack(prog(t, 0.4, 0.7)), t * (t > 0.49 ? 1 : 0)); label(g, t, { at: [x + 150, y + 60], to: [x + 420, y + 260], str: 'ATOMIC CLOCK', start: 1.31 }); }
  cTxt(g, 'SUPER-ACCURATE', x, E.H * 0.18, { size: 40, alpha: prog(t, 0.49, 0.8), color: U().gold });
} });

// s096 WEAKER GRAVITY, FASTER CLOCKS
registerShot('s096', { draw(g, t, info) {
  FIG9(g, t);
  push(g, t, info.dur, () => {
    const ex = E.W * 0.32, ey = E.H * 1.18, r = 520, c = U().cream; earth(g, ex, ey, r, 1);
    const fk = ease.out(prog(t, 1.03, 1.8));   // field lines thin out with height
    for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i - 8.5) * 0.09, len = 420 * fk; g.save(); g.globalAlpha *= 0.8; const x0 = ex + Math.cos(a) * r, y0 = ey + Math.sin(a) * r; seg(g, [[x0, y0], [x0 + Math.cos(a) * len, y0 + Math.sin(a) * len]], 3, alpha(c, 0.5)); g.restore(); }
    for (let j = 0; j < 4; j++) { g.save(); g.globalAlpha *= fk * (0.8 - j * 0.18); g.strokeStyle = U().blueprint; g.lineWidth = 6 - j * 1.2; g.beginPath(); g.arc(ex, ey, r + 80 + j * 110, -Math.PI / 2 - 0.8, -Math.PI / 2 + 0.8); g.stroke(); g.restore(); }
    if (fk > 0.5) { cTxt(g, 'STRONGER GRAVITY', ex, ey - r - 50, { size: 26, alpha: fk }); cTxt(g, 'WEAKER', ex, ey - r - 430, { size: 26, alpha: fk }); }
    const sx = E.W * 0.66, sy = E.H * 0.34; sat(g, sx - 260, sy + 10, 0.9, 1); atomicClock(g, sx + 80, sy, 0.7, t * (t > 2.95 ? 1.6 : 1));
    goldPop(g, t, '+45 µs / day', 2.95, sx + 60, sy + 170, 72);
    cTxt(g, 'µs = millionth of a second', sx + 60, sy + 250, { size: 26, alpha: prog(t, 3.3, 3.6) });
  }, 0.03);
} });

// s097 MOVING FAST SLOWS THEM
registerShot('s097', { draw(g, t, info) {
  FIG9(g, t);
  push(g, t, info.dur, () => {
    const ex = E.W * 0.36, ey = E.H * 0.58, rx = 520, ry = 220; earth(g, ex, ey, 160, 1);
    g.save(); g.strokeStyle = alpha(U().cream, 0.4); g.lineWidth = 3; g.setLineDash([10, 10]); g.beginPath(); g.ellipse(ex, ey, rx, ry, -0.15, 0, 7); g.stroke(); g.restore();
    const a = -2.0 + 0.35 * t + 1.2 * ease.inOut(prog(t, 0.58, 1.6)), p = orbitPt(ex, ey, rx, ry, a, -0.15), pv = orbitPt(ex, ey, rx, ry, a - 0.06, -0.15), dir = Math.atan2(p[1] - pv[1], p[0] - pv[0]);
    if (t > 0.5) for (let i = 1; i < 6; i++) { const q = orbitPt(ex, ey, rx, ry, a - i * 0.05, -0.15); seg(g, [[q[0], q[1] - 12 + i * 4], [q[0] - Math.cos(dir) * 50, q[1] - Math.sin(dir) * 50 - 12 + i * 4]], 4, alpha(U().cream, 0.6 - i * 0.1)); }
    sat(g, p[0], p[1], 0.9, 1, { rot: dir * 0.3 });
    atomicClock(g, E.W * 0.76, E.H * 0.34, 0.65, t * (t > 1.66 ? 0.7 : 1));
    goldPop(g, t, '−7 µs / day', 1.66, E.W * 0.76, E.H * 0.53, 72, { color: U().blueprint });
    cTxt(g, 'ORBITAL SPEED: TICKS SLOWER', E.W * 0.76, E.H * 0.62, { size: 26, alpha: prog(t, 1.9, 2.2) });
  }, 0.03);
} });

// s098 ADD IT UP: +38 µs EVERY DAY
registerShot('s098', { draw(g, t, info) {
  FIG9(g, t);
  push(g, t, info.dur, () => {
    const x = E.W / 2, y = E.H * 0.4, b = ease.out(prog(t, 0.15, 0.53)), land = prog(t, 1.75, 1.9);
    if (land < 1) { g.save(); g.globalAlpha *= (1 - land); text(g, '+45', x - 220 * b, y, { size: 110, color: U().gold, font: FONTS.title, weight: 700, alpha: clamp(b * 2) }); text(g, '− 7', x + 220 * b, y, { size: 110, color: U().blueprint, font: FONTS.title, weight: 700, alpha: clamp(b * 2 - 0.6) }); g.restore(); }
    goldPop(g, t, '+38 µs', 1.75, x, y, 190);
    if (t > 0.77 && t < 1.75) text(g, '+' + Math.round(lerp(45, 38, prog(t, 0.77, 1.57))), x, y + 140, { size: 60, color: alpha(U().gold, 0.7), font: FONTS.ui, weight: 900 });
    creamChip(g, t, 'EVERY DAY', 3.97, x, y + 180, { size: 44 });
    label(g, t, { at: [x + 260, y + 50], to: [x + 300, y + 330], str: 'MILLIONTHS OF A SECOND', start: 2.4, color: U().cream });
  }, 0.03);
} });

// s099 COMPARED TO CLOCKS DOWN HERE / EINSTEIN PREDICTED IT
function dial(g, x, y, r, sec, lbl, col) { const c = U().cream; circle(g, x, y, r, 'rgba(8,16,34,.85)'); ring(g, x, y, r, 6, c); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; seg(g, [[x + Math.sin(a) * r * 0.82, y - Math.cos(a) * r * 0.82], [x + Math.sin(a) * r * 0.94, y - Math.cos(a) * r * 0.94]], 4, c); } const a = sec / 60 * 6.283; seg(g, [[x, y], [x + Math.sin(a) * r * 0.85, y - Math.cos(a) * r * 0.85]], 6, col); circle(g, x, y, 10, col); cTxt(g, lbl, x, y + r + 50, { size: 30 }); }
registerShot('s099', { draw(g, t, info) {
  board(g, t, { title: 'FIG 9 - GPS SATELLITES', fig: 'CLOCKS REALLY CAN DISAGREE' });
  const lead = 4 * ease.inOut(prog(t, 0.66, 2.0));   // exaggerated so it shows
  dial(g, E.W * 0.3, E.H * 0.42, 190, 12 + t, 'CLOCK DOWN HERE', U().cream);
  dial(g, E.W * 0.62, E.H * 0.42, 190, 12 + t + lead, 'SATELLITE CLOCK', U().gold);
  sat(g, E.W * 0.62, E.H * 0.12, 0.6, 1);
  if (lead > 0.2) { goldPop(g, t, '+38 µs / day', 1.0, E.W * 0.46, E.H * 0.73, 54); cTxt(g, '(drawn huge so you can see it)', E.W * 0.46, E.H * 0.79, { size: 22, alpha: prog(t, 1.2, 1.5) }); }
  const k = ease.out(prog(t, 2.3, 2.7)); if (k > 0.01) { const x = lerp(E.W * 1.15, E.W * 0.82, k), y = E.H * 0.82; g.save(); g.translate(x, y); g.rotate(-0.03); rr(g, -290, -70, 580, 140, 14); g.fillStyle = '#f2ead8'; g.fill(); text(g, 'EINSTEIN - RELATIVITY', 0, -4, { size: 44, color: '#20283a', font: FONTS.title, weight: 700, spacing: 2 });
    const u = ease.out(prog(t, 2.72, 3.1)); seg(g, [[-250, 40], [-250 + 500 * u, 40]], 8, U().gold); g.restore(); }
} });

// s100 IF ENGINEERS DIDN'T CORRECT FOR IT
registerShot('s100', { draw(g, t, info) {
  FIG9(g, t);
  const x = E.W * 0.36, y = E.H * 0.52, off = t > 1.2, c = U().cream;
  sat(g, x, y, 3.2, 1); atomicClock(g, x, y + 230, 0.6, off ? t * 1.3 : t, { flicker: off });
  const dx = E.W * 0.72, dy = E.H * 0.5, k = ease.inOut(prog(t, 1.05, 1.3)); circle(g, dx, dy, 140, 'rgba(8,16,34,.9)'); ring(g, dx, dy, 140, 6, c);
  const a = lerp(-0.8, 0.8, k); seg(g, [[dx, dy], [dx + Math.sin(a) * 110, dy - Math.cos(a) * 110]], 10, off ? U().accent : c); circle(g, dx, dy, 14, c);
  cTxt(g, 'ON', dx - 110, dy - 120, { size: 28, alpha: off ? 0.3 : 1 }); cTxt(g, 'OFF', dx + 110, dy - 120, { size: 28, color: off ? U().accent : c, alpha: off ? 1 : 0.4 });
  cTxt(g, 'CORRECTION', dx, dy + 190, { size: 34 }); cTxt(g, '(set before launch)', dx, dy + 236, { size: 22 });
  if (off) creamChip(g, t, 'DRIFTING', 1.35, x, y - 290, { color: U().accent, size: 34 });
} });

// s101 YOUR MAP WOULD BE OFF BY KILOMETRES
registerShot('s101', { draw(g, t, info) {
  const R = rng(11); g.fillStyle = '#121624'; g.fillRect(0, 0, E.W, E.H); glow(g, E.W / 2, E.H / 2, 900, '#2a3a6a', 0.35);
  const px = E.W / 2, py = E.H * 0.53, pw = 560, ph = 980, tap = Math.max(0, Math.sin(t * 9)) * (t > 2.0 ? 1 : 0);
  g.save(); g.translate(px, py); g.rotate(-0.04);
  rr(g, -pw / 2, -ph / 2, pw, ph, 60); g.fillStyle = '#0c0e14'; g.fill(); g.strokeStyle = '#3a3e4a'; g.lineWidth = 6; g.stroke();
  g.save(); rr(g, -pw / 2 + 24, -ph / 2 + 60, pw - 48, ph - 120, 30); g.clip();
  g.fillStyle = '#e8e4da'; g.fillRect(-pw / 2, -ph / 2, pw, ph);
  g.fillStyle = '#8ec5e8'; g.beginPath(); g.moveTo(-pw / 2, 120); g.bezierCurveTo(-60, 60, 40, 220, pw / 2, 150); g.lineTo(pw / 2, 260); g.bezierCurveTo(40, 330, -60, 170, -pw / 2, 230); g.closePath(); g.fill();   // the river
  g.fillStyle = '#b8dca8'; rr(g, -200, -360, 170, 130, 12); g.fill(); rr(g, 60, 330, 180, 120, 12); g.fill();   // parks
  for (let i = 0; i < 9; i++) { const y = -ph / 2 + 90 + i * 110; seg(g, [[-pw / 2, y], [pw / 2, y + (R() - 0.5) * 60]], i % 3 ? 10 : 18, '#ffffff'); }
  for (let i = 0; i < 5; i++) { const x = -pw / 2 + 60 + i * 110; seg(g, [[x, -ph / 2], [x + (R() - 0.5) * 80, ph / 2]], i % 2 ? 10 : 16, '#ffffff'); }
  const d = ease.inOut(prog(t, 0.8, 3.2)), home = [-110, -160], dot = [lerp(home[0], 170, d), lerp(home[1], 240, d) + Math.sin(d * 6) * 20];
  if (d > 0.02) { g.save(); g.setLineDash([10, 10]); seg(g, [home, dot], 4, 'rgba(40,90,200,.5)'); g.restore(); }
  glow(g, home[0], home[1], 50, '#3a8aff', 0.25); ring(g, home[0], home[1], 18, 4, 'rgba(40,90,200,.5)');
  circle(g, dot[0], dot[1], 26, 'rgba(58,138,255,.3)'); circle(g, dot[0], dot[1], 15, '#ffffff'); circle(g, dot[0], dot[1], 11, '#2a7aff');
  g.restore();
  circle(g, 0, -ph / 2 + 30, 6, '#222'); g.restore();
  // Dev's hand (ink, slate sleeve) holding the phone, thumb tapping
  const ink = S().ink; g.save(); g.translate(px + pw / 2 - 20, py + 160); g.rotate(-0.04);
  rr(g, 10, 80, 220, 600, 40); g.fillStyle = '#3c4058'; g.fill(); g.fillStyle = ink; g.beginPath(); g.ellipse(30, 70, 90, 120, -0.2, 0, 7); g.fill();
  for (let i = 0; i < 3; i++) { rr(g, -40 - i * 4, -60 + i * 70, 90, 46, 23); g.fill(); }
  g.save(); g.translate(-30, 40); g.rotate(-0.9 - 0.25 * tap); rr(g, -24, -170, 48, 180, 24); g.fill(); g.restore(); g.restore();
  goldPop(g, t, 'KILOMETRES OFF', 1.74, E.W * 0.18, E.H * 0.3, 60, { rot: -0.05 });
  cTxt(g, 'YOU ARE HERE?', E.W * 0.18, E.H * 0.42, { size: 32, alpha: prog(t, 2.2, 2.5) });
} });
