// B_s036_s053_air.js — stop-time batch B: RULE 2 'AIR IS STUFF.' + FIG 4-6 (1 cm³ ~ a fingertip, ~25 BILLION BILLION / 2.5 × 10¹⁹,
// never sit still, ~500 m/s vs a jet ~250 m/s, air pressure, the diaphragm, air pushes in, frozen molecules can't push, nothing flows,
// air is heavy, the kitchen's air ~48 kg), stuck molecules / door / statue gag, ten seconds is fine, giant face HERO + UNFREEZE.
// LEGAL: original story; nothing from any film/show/anime. The power is only the snap.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, seg, circle, ring, rr, poly, alpha, text, FONTS, rng } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { ruleCard } from '../sets/hud.js';
import { board, label, draw } from '../sets/bp.js';
import { faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { morning, morningFg } from '../sets/morning.js';
import { airBox, airRace, lungs, kitchenAir } from '../sets/timebp.js';
import { stopwatch } from '../sets/stopprops.js';
import { GOLD, CREAM, CORAL, INK, W, freezeGrade, airSpeckle, unfreeze, frozenSparkle, readout, hero, heroFace, magnifier, plinth, jet, bathScale, goldTag, push } from './B_lib.js';

const CX = E.W / 2;
const kitchen = (g, t, cam, o = {}) => morning(g, t, cam, { view: 'kitchen', mood: 'morning', ...o });
// the frozen breakfast kitchen of snap 2 (Mina + Dev frozen at the table), drawn under freezeGrade
function frozenKitchen(g, t, cam, o = {}) {
  const M = kitchen(g, t, cam), P = M.pos, GY = M.GY;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.minaSeatX - 120, y: GY, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'shock']]), expr: 'surprised', t: 0 });
    actor(g, 'DEV', { x: P.heroSeatX + 260, y: GY, s: 1.9, facing: -1, pose: poseAt(0, [[0, 'phone']]), expr: 'sleepy', t: 0 });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
  return M;
}
const heroAt = (g, cam, o) => layer(g, cam, 1, (g) => hero(g, o));

// s036 — RULE 2 card over the frozen kitchen + wall-of-air speckle; the speckle sparkles on 'molecules.' (2.06)
registerShot('s036', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 2, title: 'AIR IS STUFF.', bg: (g, t) => {
    blurLayer(g, 8, (g) => { const cam = { z: 1.1, x: 0, y: -40 }, M = frozenKitchen(g, t, cam); freezeGrade(g, 1);
      heroAt(g, cam, { x: CX, y: M.GY, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'handsUp']]), expr: 'nervous', t }); }, null, 1);
    veil(g, '#0c1020', 0.3); airSpeckle(g, t, { k: 0.6 + 0.4 * prog(t, 2.06, 2.4) }); } });
} });

// s037 — FIG 4 ONE CUBIC CENTIMETRE: the cube, '1 cm³' (0.61-0.89), a fingertip outline on 'fingertip,' (2.85)
registerShot('s037', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - AIR IS STUFF', fig: 'MOLECULES' });
  push(g, t, info.dur, 0.04, (g) => {
    const A = airBox(g, t, { x: E.W * 0.44, y: E.H * 0.56, s: 1.1, k: ease.out(prog(t, 0, 0.9)), frozen: 0 });
    goldTag(g, t, 0.61, '1 cm³', E.W * 0.2, E.H * 0.56, { size: 70 });
    const fk = ease.out(prog(t, 2.85, 3.3)); if (fk > 0) { g.save(); g.globalAlpha *= fk; g.translate(lerp(E.W * 0.95, E.W * 0.76, fk), E.H * 0.6); g.strokeStyle = CREAM; g.lineWidth = 6; g.beginPath(); g.moveTo(-70, 200); g.lineTo(-70, -80); g.quadraticCurveTo(0, -200, 70, -80); g.lineTo(70, 200); g.stroke(); rr(g, -46, -110, 92, 70, 30); g.stroke(); g.restore();
      text(g, 'about a fingertip', lerp(E.W * 0.95, E.W * 0.76, fk), E.H * 0.9, { size: 34, color: GOLD, font: FONTS.ui, weight: 900, alpha: fk }); }
  });
} });

// s038 — ~25 BILLION BILLION (0.84-2.20) + 2.5 × 10¹⁹ on 'billion.' (2.20); footnote
registerShot('s038', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - AIR IS STUFF', fig: 'MOLECULES' });
  push(g, t, info.dur, 0.04, (g) => {
    airBox(g, t, { x: E.W * 0.32, y: E.H * 0.58, s: 1.0, k: 1, frozen: 0 });
    const r = rng(3), n = Math.round(260 * ease.out(prog(t, 0.1, 1.6))); for (let i = 0; i < n; i++) circle(g, E.W * 0.32 + (r() - 0.5) * 300, E.H * 0.58 + (r() - 0.5) * 300 + Math.sin(t * 9 + i) * 3, 3, alpha(CREAM, 0.7));
    const ck = ease.outBack(prog(t, 0.84, 1.2)); if (ck > 0.01) { g.save(); g.translate(E.W * 0.7, E.H * 0.44); g.scale(ck, ck); text(g, '~25 BILLION', 0, -50, { size: 96, color: GOLD, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(GOLD, 0.5) }); text(g, 'BILLION', 0, 60, { size: 96, color: GOLD, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(GOLD, 0.5) }); g.restore(); }
    const sk = ease.outBack(prog(t, 2.2, 2.5)); if (sk > 0.01) text(g, '2.5 × 10¹⁹ per cm³', E.W * 0.7, E.H * 0.66, { size: 54, color: GOLD, font: FONTS.ui, weight: 900, alpha: clamp(sk) });
    text(g, 'sea level, ~15 °C', E.W * 0.7, E.H * 0.78, { size: 30, color: CREAM, font: FONTS.ui, weight: 800 });
  });
} });

// s039 — THEY NEVER SIT STILL: warm kitchen, a magnifier over the air above the table; Mina blows on her cocoa on 'never' (0.35), the dots scatter
registerShot('s039', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }), M = kitchen(g, t, cam), P = M.pos, GY = M.GY;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.minaSeatX, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront']]), t, 1), expr: exprAt(t, [[0, 'smile'], [0.35, 'surprised']]), blink: blinkFlag(t, 3, 1), look: lookToward(1, -0.2), t });
    hero(g, { x: P.heroSeatX, y: GY, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'stand']]), t, 2), expr: 'happy', blink: blinkFlag(t, 3.2, 2), look: lookToward(-1, -0.3), t });
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' }); atmos(g, t, cam, { color: '#ffe8c8' });
  const sc = ease.out(prog(t, 0.35, 0.8)) * 60, r = rng(5);
  magnifier(g, E.W * 0.5, E.H * 0.32, 210, (g) => { g.fillStyle = alpha('#fff4e0', 0.4); g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 180; circle(g, E.W * 0.5 + Math.cos(a) * (d + sc) + Math.sin(t * 13 + i) * 10, E.H * 0.32 + Math.sin(a) * (d + sc) + Math.cos(t * 11 + i) * 10, 8, alpha('#7a8ab0', 0.8)); } });
} });

// s040 — ~500 m/s: room temperature chip (0.28), molecules zoom with trails, the readout rolls to '~500 m/s' (2.74-4.14)
registerShot('s040', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - AIR IS STUFF', fig: 'MOLECULES' });
  push(g, t, info.dur, 0.04, (g) => {
    const r = rng(8); for (let i = 0; i < 24; i++) { const y = E.H * 0.3 + r() * E.H * 0.45, sp = 300 + r() * 500, x = ((r() * E.W + t * sp) % (E.W * 0.9)) + E.W * 0.05, hot = i === 7;
      seg(g, [[x - 80, y], [x, y]], hot ? 6 : 3, alpha(hot ? GOLD : CREAM, 0.5)); circle(g, x, y, hot ? 16 : 9, hot ? GOLD : CREAM); }
    goldTag(g, t, 0.28, 'ROOM TEMPERATURE', E.W * 0.26, E.H * 0.2, { size: 40, color: CREAM });
    const v = lerp(0, 500, ease.out(prog(t, 2.74, 4.14))); if (t > 2.74) text(g, `~${Math.round(v)} m/s`, E.W * 0.7, E.H * 0.84, { size: 110, color: GOLD, font: FONTS.ui, weight: 900, glow: 16, glowColor: alpha(GOLD, 0.5) });
  });
} });

// s041 — FASTER THAN A JET: ~250 m/s jet vs ~500 m/s molecule; the molecule zips past on 'jet' (1.02)
registerShot('s041', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - AIR IS STUFF', fig: 'MOLECULES' });
  const u = prog(t, 0.1, info.dur), jx = lerp(E.W * 0.2, E.W * 0.55, u), mx = lerp(E.W * 0.08, E.W * 0.88, ease.inOut(prog(t, 0.3, 1.6)));
  seg(g, [[E.W * 0.05, E.H * 0.45], [E.W * 0.95, E.H * 0.45]], 2, alpha(CREAM, 0.3)); seg(g, [[E.W * 0.05, E.H * 0.72], [E.W * 0.95, E.H * 0.72]], 2, alpha(CREAM, 0.3));
  jet(g, jx, E.H * 0.38, 1.0); text(g, '~250 m/s', jx, E.H * 0.25, { size: 50, color: GOLD, font: FONTS.ui, weight: 900 });
  for (let i = 0; i < 6; i++) seg(g, [[mx - 60 - i * 40, E.H * 0.66 + (i % 3 - 1) * 10], [mx - 20 - i * 40, E.H * 0.66 + (i % 3 - 1) * 10]], 4, alpha(CREAM, 0.6 - i * 0.08));
  circle(g, mx, E.H * 0.66, 22, GOLD); text(g, '~500 m/s', mx, E.H * 0.82, { size: 50, color: GOLD, font: FONTS.ui, weight: 900 });
  if (t > 1.02) text(g, 'about twice as fast', E.W * 0.5, E.H * 0.92, { size: 34, color: CREAM, font: FONTS.ui, weight: 800, alpha: prog(t, 1.02, 1.3) });
} });

// s042 — AIR PRESSURE: molecules bounce off a wall, gold sparks on each hit; label (0.95-1.17); gauge needle lifts
registerShot('s042', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - AIR PRESSURE', fig: 'BUMPING' });
  push(g, t, info.dur, 0.03, (g) => {
    const wx = E.W * 0.68; rr(g, wx, E.H * 0.2, 40, E.H * 0.6, 6); g.fillStyle = alpha(CREAM, 0.25); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 5; g.stroke();
    const r = rng(12); for (let i = 0; i < 18; i++) { const y = E.H * 0.24 + r() * E.H * 0.52, sp = 0.8 + r(), ph = r(); const u = ((t * sp + ph) % 1), x = u < 0.5 ? lerp(E.W * 0.15, wx - 14, u * 2) : lerp(wx - 14, E.W * 0.15, (u - 0.5) * 2);
      circle(g, x, y, 12, CREAM); if (Math.abs(u - 0.5) < 0.04) { glow(g, wx, y, 40, GOLD, 0.8); circle(g, wx - 4, y, 6, GOLD); } }
    label(g, t, { at: [wx + 20, E.H * 0.5], to: [wx + 200, E.H * 0.3], str: 'AIR PRESSURE', start: 0.95 });
    const nk = ease.out(prog(t, 0.6, 1.8)); g.save(); g.translate(E.W * 0.85, E.H * 0.72); g.strokeStyle = CREAM; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 80, Math.PI, 0); g.stroke(); seg(g, [[0, 0], [Math.cos(Math.PI + 0.2 + nk * 1.6) * 70, Math.sin(Math.PI + 0.2 + nk * 1.6) * 70]], 6, GOLD); g.restore();
  });
} });

// s043 / s044 — FIG 5 BREATHING IN: the diaphragm flattens on 'breathe' (0.43), label on 'diaphragm' (1.25); then air pushes in (1.21), label (1.59)
registerShot('s043', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - BREATHING IN', fig: 'CHEST' });
  push(g, t, info.dur, 0.04, (g) => { const L = lungs(g, t, { x: E.W * 0.5, y: E.H * 0.6, s: 0.8, k: ease.out(prog(t, 0, 0.8)), breathe: ease.inOut(prog(t, 0.43, 2.2)), frozen: 0 });
    label(g, t, { at: L.diaphragm, to: [L.diaphragm[0] + 380, L.diaphragm[1] + 60], str: 'DIAPHRAGM', start: 1.25 }); goldTag(g, t, 1.97, 'MAKES ROOM', E.W * 0.22, E.H * 0.3, { size: 44 }); });
} });
registerShot('s044', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - BREATHING IN', fig: 'AIR PUSHES IN' });
  push(g, t, info.dur, 0.04, (g) => { const L = lungs(g, t, { x: E.W * 0.5, y: E.H * 0.6, s: 0.8, k: 1, breathe: 0.6 + 0.4 * ease.inOut(prog(t, 1.21, 2.6)), frozen: 0 });
    label(g, t, { at: L.airway, to: [L.airway[0] - 380, L.airway[1] - 60], str: 'outside air pushes in', start: 1.59 }); });
} });

// s045 — FROZEN MOLECULES CAN'T PUSH: frozen kitchen, the hero against the wall of air, cheeks puffed; inset lungs frozen with a coral cross on 'push' (1.44)
registerShot('s045', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.25, 1.3] }), y: -120 }, M = frozenKitchen(g, t, cam); freezeGrade(g, 1); airSpeckle(g, t, { k: 0.8, bubble: null });
  heroAt(g, cam, { x: CX - 80, y: M.GY, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'handsUp']]), expr: 'nervous', look: [1, 0], t });
  layer(g, cam, 1, (g) => { const o = { x: CX - 80, y: M.GY, s: 1.9 }, [hx, hy] = W(o, [3, -208]); for (const sd of [-1, 1]) circle(g, hx + sd * 18 + 6, hy + 10, 12, alpha('#2a2230', 0.9)); });
  g.save(); rr(g, E.W - 560, 60, 500, 360, 20); g.fillStyle = '#16213c'; g.fill(); g.strokeStyle = CREAM; g.lineWidth = 4; g.stroke(); g.clip();
  lungs(g, t, { x: E.W - 310, y: 290, s: 0.36, k: 1, breathe: 0, frozen: 1 }); g.restore();
  const ck = ease.out(prog(t, 1.44, 1.7)); if (ck > 0) { seg(g, [[E.W - 400, 160], [E.W - 400 + 180 * ck, 160 + 180 * ck]], 14, CORAL); seg(g, [[E.W - 220, 160], [E.W - 220 - 180 * ck, 160 + 180 * ck]], 14, CORAL); }
  readout(g, t, 8);
} });

// s046 — NOTHING FLOWS: the FIG 5 chest frozen blue-grey; a flow meter needle sits on gold '0' on 'flows' (0.51)
registerShot('s046', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - FROZEN AIR', fig: 'NO PUSH' });
  push(g, t, info.dur, 0.03, (g) => { lungs(g, t, { x: E.W * 0.42, y: E.H * 0.6, s: 0.8, k: 1, breathe: 0.1 * Math.sin(t * 6), frozen: 1 });
    g.save(); g.translate(E.W * 0.8, E.H * 0.5); g.strokeStyle = CREAM; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 120, Math.PI, 0); g.stroke(); seg(g, [[0, 0], [-110, 0]], 8, GOLD); circle(g, 0, 0, 12, GOLD); text(g, 'AIR FLOW', 0, 60, { size: 36, color: CREAM, font: FONTS.ui, weight: 900 }); g.restore();
    goldTag(g, t, 0.51, '0', E.W * 0.8, E.H * 0.32, { size: 70 }); });
  freezeGrade(g, 0.6);
} });

// s047 — AIR IS HEAVY: a bubble 'AIR' drops onto a scale on 'heavy.' (0.60), the needle swings
registerShot('s047', { draw(g, t, info) {
  board(g, t, { title: 'FIG 6 - AIR IS HEAVY', fig: 'WEIGHT' });
  const dk = ease.in(prog(t, 0.1, 0.6)), by = lerp(E.H * 0.1, E.H * 0.5, dk), sq = t > 0.6 ? Math.sin((t - 0.6) * 30) * 10 * Math.max(0, 1 - (t - 0.6) * 3) : 0;
  bathScale(g, E.W / 2, E.H * 0.8, 1.6, t > 0.6 ? 0.7 + sq * 0.01 : 0);
  g.save(); g.translate(E.W / 2, by); g.scale(1 + sq * 0.01, 1 - sq * 0.01); circle(g, 0, 0, 170, alpha(CREAM, 0.15)); ring(g, 0, 0, 170, 6, CREAM); text(g, 'AIR', 0, 0, { size: 90, color: CREAM, font: FONTS.ui, weight: 900 }); g.restore();
  if (t > 0.6) goldTag(g, t, 0.6, 'HEAVY!', E.W * 0.78, E.H * 0.3, { size: 56 });
} });

// s048 — FIG 6 THE KITCHEN'S AIR: kitchenAir show 1 on 'kitchen' (1.14), ~48 kg on 'weighs' (1.58), the balance on 'you' (2.94)
registerShot('s048', { draw(g, t, info) {
  board(g, t, { title: "FIG 6 - THE KITCHEN'S AIR", fig: '4 × 4 × 2.5 m' });
  push(g, t, info.dur, 0.04, (g) => { kitchenAir(g, t, { x: E.W * 0.5, y: E.H * 0.55, s: 1, k: ease.out(prog(t, 0, 0.9)), show: prog(t, 1.14, 1.6) + prog(t, 2.94, 3.4) }); });
} });

// s049 — IF EVERY MOLECULE STAYED STUCK: speckle everywhere on 'molecule' (0.57); hero small, frozen grey too; pull back
registerShot('s049', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.08, 1.0] }), M = frozenKitchen(g, t, cam);
  heroAt(g, cam, { x: CX, y: M.GY, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'stand']]), expr: 'nervous', t: 0 });
  freezeGrade(g, 1); airSpeckle(g, t, { k: 0.4 + 0.6 * ease.out(prog(t, 0.57, 0.9)), n: 1600 });
} });

// s050 — COULDN'T OPEN A DOOR OR MOVE YOUR HAND: the door gag; it won't budge on 'open' (0.73); on 'move' (2.09) his hand is stuck too
registerShot('s050', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.03], drift: 0.2 }), tug = t > 0.73 ? Math.sin(t * 18) * 0.15 : 0, M = morning(g, t, cam, { view: 'door', mood: 'day', push: 0 }), P = M.pos;
  freezeGrade(g, 1); airSpeckle(g, t, { k: 0.5 + 0.4 * prog(t, 0.73, 1.0), x0: P.handleX - 200, w: 400, y0: P.handleY - 300, h: 600, n: 260 });
  const lift = t > 2.09 ? Math.sin((t - 2.09) * 20) * 4 : 0;
  layer(g, cam, 1, (g) => hero(g, { x: P.handleX - 170 + tug * 20, y: M.GY, s: 1.9, facing: 1, pose: { ...poseAt(0, [[0, 'reach']]), hF: [80, -150 + lift], eF: [50, -160], hB: [-30, -120], head: [16 - tug * 20, -200] }, expr: exprAt(t, [[0, 'determined'], [2.09, 'worried']]), blink: blinkFlag(t, 3.3, 1), look: [1, 0], t }));
  if (t > 0.73) goldTag(g, t, 0.73, "WON'T BUDGE", E.W * 0.32, E.H * 0.2, { size: 46, color: CREAM });
} });

// s051 — YOU'D BE A STATUE TOO: he greys to stone and a plinth slides up on 'statue' (0.50)
registerShot('s051', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }), M = frozenKitchen(g, t, cam), up = ease.out(prog(t, 0.5, 0.9)), lift = up * 120;
  freezeGrade(g, 1);
  layer(g, cam, 1, (g) => { plinth(g, CX, M.GY - lift, 300, lift + 20, up > 0 ? 1 : 0); hero(g, { x: CX, y: M.GY - lift, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'think']]), expr: 'neutral', t: 0 }); });
  if (t > 0.3) { g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = `rgba(128,128,128,${clamp((t - 0.3) * 2)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// s052 — TEN SECONDS IS FINE: the stopwatch large in the foreground, gold '10 s' on 'ten' (0.49), the hero soft behind, 'FINE' on 'fine.' (2.31)
registerShot('s052', { draw(g, t, info) {
  blurLayer(g, 8, (g) => { const cam = { z: 1.2, x: 0, y: -80 }, M = frozenKitchen(g, t, cam); freezeGrade(g, 1); heroAt(g, cam, { x: CX + 120, y: M.GY, s: 1.9, facing: -1, pose: poseAt(0, [[0, 'stand']]), expr: 'nervous', t }); }, null, 1);
  stopwatch(g, t, { x: E.W * 0.36, y: E.H * 0.52, s: 1.6, sec: lerp(8.0, 8.5, t / info.dur), running: 1 });
  goldTag(g, t, 0.49, '10 s', E.W * 0.36, E.H * 0.16, { size: 60 }); goldTag(g, t, 2.31, 'FINE ✓', E.W * 0.72, E.H * 0.3, { size: 60, color: CREAM });
  readout(g, t, lerp(8.0, 8.5, t / info.dur));
} });

// s053 — GIANT FACE HERO counting, cheeks puffed; the read-out 08.5 -> 10.0 lands on 'starts' (2.05) + UNFREEZE; a huge gasp on 'again.' (2.35)
registerShot('s053', { draw(g, t, info) {
  const fz = 1 - ease.inOut(prog(t, 2.05, 2.5)), z = 1 + 0.04 * ease.inOut(t / info.dur);
  blurLayer(g, 10, (g) => frozenKitchen(g, t, { z: 1.25, x: 0, y: -80 }), null, 1); freezeGrade(g, fz);
  g.save(); g.translate(CX, E.H / 2); g.scale(z, z); g.translate(-CX, -E.H / 2);
  heroFace(g, CX, E.H * 0.5, 330, { f: faceAt(t, [[0, 'squint'], [0.53, 'determined'], [2.05, 'shocked'], [2.35, 'joy']], 0.12), puff: t < 2.35 ? 1 : 0, blink: t < 2.05 ? 1 : blinkAmt(t, 3, 1), breath: Math.sin(t * 2), rimSide: -1, rimColor: '#ffd8a0' });
  // counting fingers at the frame bottom
  const n = Math.min(4, Math.floor(t / 0.5) + 1); for (let i = 0; i < 5; i++) { g.save(); g.translate(CX - 160 + i * 64, E.H * 0.98 - (i < n ? 70 : 20)); rr(g, -18, -60, 36, 120, 18); g.fillStyle = '#2a2230'; g.fill(); g.restore(); }
  g.restore();
  if (t > 2.35) { const k = prog(t, 2.35, 3.2); for (let i = 0; i < 5; i++) circle(g, CX + 120 + k * (200 + i * 40), E.H * 0.6 - i * 30 + k * 20, 30 * (1 - k * 0.5), alpha('#ffffff', 0.5 * (1 - k))); }
  unfreeze(g, t, 2.05); readout(g, t, lerp(8.5, 10.0, prog(t, 0, 2.05)));
} });
