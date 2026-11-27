// B_s054_s068_cat.js — stop-time batch B: SNAP 3 (the moving-air bubble), breathe + walk, Biscuit mid-leap inches from the butter, lift her out
// of the air, butter saved + UNFREEZE, the furry hockey puck, into the bin; RULE 3 "MOTION DOESN'T PAUSE." + FIG 7 (Newton's 1st law,
// p = m × v, heavier/faster harder to stop, her speed stays, IN OUR STORY saved for later, push against motion, goalkeeper gloves).
// LEGAL: original story; nothing from any film/show/anime. The power is only the snap.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, seg, circle, ring, rr, poly, alpha, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { cat } from '../sets/creatures.js';
import { chip, ruleCard } from '../sets/hud.js';
import { board, label } from '../sets/bp.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, walkAlong, atmos } from '../sets/acting.js';
import { morning, morningFg } from '../sets/morning.js';
import { newton1, momentum } from '../sets/timebp.js';
import { butterDish, bin } from '../sets/stopprops.js';
import { GOLD, CREAM, CORAL, INK, W, freezeGrade, airSpeckle, snapRing, unfreeze, frozenSparkle, readout, hero, leapCat, glove, orange, arrowG, goldTag, push } from './B_lib.js';

const CX = E.W / 2;
const kitchen = (g, t, cam, o = {}) => morning(g, t, cam, { view: 'kitchen', mood: 'morning', butter: false, ...o });
// the frozen breakfast table: Mina + Dev frozen; Biscuit mid-leap toward the butter (catX: her position, unless lifted)
function frozenTable(g, t, cam, o = {}) {
  const M = kitchen(g, t, cam), P = M.pos, GY = M.GY;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.minaSeatX - 120, y: GY, s: 1.9, facing: 1, pose: poseAt(0, [[0, 'shock']]), expr: 'surprised', t: 0 });
    actor(g, 'DEV', { x: P.heroSeatX + 300, y: GY, s: 1.9, facing: -1, pose: poseAt(0, [[0, 'phone']]), expr: 'sleepy', t: 0 });
    butterDish(g, P.butterX, P.butterY, 0.7);
    if (o.cat !== false) leapCat(g, P.butterX - 260, P.tableTop - 150, 1.4, { facing: 1, t: 0 });
  });
  return M;
}

// s054 — SNAP 3: chip 'SNAP 3' on 'Third' (0.15), the snap on 'snap.' (0.30) + grade 0->1 over 0.4 s; the moving-air bubble grows on 'around' 1.98-2.38
registerShot('s054', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.25, 1.1], y: [-120, -60] }), M = frozenTable(g, t, cam), P = M.pos, hx = CX + 40, o = { x: hx, y: M.GY, s: 1.9, facing: -1 };
  const k = ease.inOut(prog(t, 0.3, 0.7)); freezeGrade(g, k);
  const pose = poseAt(t, [[0, 'stand'], [0.15, 'point']]);
  const br = 260 * ease.out(prog(t, 1.98, 2.38)), sc = (x, y) => [(x - CX - cam.x) * cam.z + CX, (y - E.H / 2 - cam.y) * cam.z + E.H / 2], [bx, by] = sc(hx, M.GY - 220);
  airSpeckle(g, t, { k: 0.7 * k, bubble: br > 5 ? { x: bx, y: by, r: br * cam.z } : null });
  layer(g, cam, 1, (g) => hero(g, { ...o, pose, expr: exprAt(t, [[0, 'determined'], [2.0, 'surprised']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(-1, -0.1), t }));
  const [fx, fy] = sc(...W(o, pose.hF)); snapRing(g, t, 0.3, fx, fy, 1);
  chip(g, t, { str: 'SNAP 3', at: 0.15, y: E.H * 0.9, dur: info.dur }); readout(g, t, lerp(0, 1, t / info.dur));
} });

// s055 — YOU CAN BREATHE. YOU CAN WALK.: big breath on 'breathe.' (0.45), then walks past frozen Dev + Mina on 'walk.' (1.93) with the bubble
registerShot('s055', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.08], x: [-100, -300] }), M = frozenTable(g, t, cam); freezeGrade(g, 1);
  const hx = lerp(CX + 200, CX - 340, ease.inOut(prog(t, 1.93, info.dur))), walking = t > 1.93 && t < info.dur - 0.1, sc = (x, y) => [(x - CX - cam.x) * cam.z + CX, (y - E.H / 2 - cam.y) * cam.z + E.H / 2];
  const [bx, by] = sc(hx, M.GY - 220); airSpeckle(g, t, { k: 0.6, bubble: { x: bx, y: by, r: 260 * cam.z } });
  layer(g, cam, 1, (g) => hero(g, { x: hx, y: M.GY, s: 1.9, facing: -1, pose: walking ? walkAlong(hx, 1.9, { facing: -1 }).pose : idle(poseAt(t, [[0, 'stand'], [0.45, 'delight'], [1.4, 'stand']]), t, 1), expr: exprAt(t, [[0, 'surprised'], [0.45, 'joy']]), blink: blinkFlag(t, 3, 1), look: lookToward(-1, 0), t }));
  readout(g, t, lerp(1, 3, t / info.dur));
} });

// s056 — BISCUIT STILL MID-LEAP: paws out (2.18-2.32), a gap bracket to the butter on 'inches' (2.92); the hero leans in, hands on knees
registerShot('s056', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.45, 1.55] }), x: 330, y: -150 }, M = frozenTable(g, t, cam), P = M.pos; freezeGrade(g, 1);
  layer(g, cam, 1, (g) => {
    hero(g, { x: P.butterX - 80, y: M.GY, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [0.6, 'crouch']]), t, 1), expr: exprAt(t, [[0, 'surprised'], [2.92, 'smirk']]), blink: blinkFlag(t, 3.1, 1), look: lookToward(-1, -0.3), t });
    frozenSparkle(g, t, P.butterX - 260, P.tableTop - 260, 1.2);
    const bk = ease.outBack(prog(t, 2.92, 3.2)); if (bk > 0.01) { const x0 = P.butterX - 260 + 140 * 1.4 * 0.98, x1 = P.butterX - 100, y = P.tableTop - 140; g.save(); g.globalAlpha *= clamp(bk); seg(g, [[x0, y - 14], [x0, y + 14]], 5, CREAM); seg(g, [[x1, y - 14], [x1, y + 14]], 5, CREAM); seg(g, [[x0, y], [x1, y]], 4, CREAM); g.restore(); text(g, 'INCHES', (x0 + x1) / 2, y - 40, { size: 34, color: GOLD, font: FONTS.ui, weight: 900, alpha: clamp(bk) }); }
  });
  readout(g, t, lerp(3, 5, t / info.dur));
} });

// s057 — LIFT HER OUT OF THE AIR: takes the rigid leaping cat on 'lift' (0.58), turns and sets her down on the floor on 'set' 2.12 -> 'floor.' 3.06
registerShot('s057', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.15, 1.18], x: [120, 60], y: [-40, -40] }), M = frozenTable(g, t, cam, { cat: false }), P = M.pos; freezeGrade(g, 1);
  const hx = P.butterX - 120, lk = ease.inOut(prog(t, 0.58, 1.3)), dn = ease.inOut(prog(t, 2.12, 3.06));
  const cx = lerp(P.butterX - 260, hx - 60, lk) + lerp(0, -200, dn), cy = lerp(P.tableTop - 150, P.tableTop - 120, lk) + lerp(0, M.GY - P.tableTop + 110, dn);
  layer(g, cam, 1, (g) => {
    leapCat(g, cx, cy, 1.4, { facing: 1, t: 0 }); frozenSparkle(g, t, cx + 40, cy - 120, 1);
    const pose = poseAt(t, [[0, 'stand'], [0.4, 'reach'], [2.12, 'crouch']]);
    hero(g, { x: hx, y: M.GY, s: 1.9, facing: -1, pose: { ...pose, hF: [lerp(40, 60, lk), lerp(-140, -110, dn)], hB: [lerp(-20, 30, lk), lerp(-140, -100, dn)] }, expr: 'determined', blink: blinkFlag(t, 3.3, 1), look: lookToward(-1, 0.3), t });
  });
  readout(g, t, lerp(5, 8, t / info.dur));
} });

// s058 — BUTTER SAVED. TIME RESTARTS.: close on the untouched butter, gold tick on 'saved.' (0.36); 10.0 + UNFREEZE on 'Time' (1.62)
registerShot('s058', { draw(g, t, info) {
  const fz = 1 - ease.inOut(prog(t, 1.62, 2.1)), cam = { z: 2.3, x: 230, y: 120 }, M = kitchen(g, t, cam), P = M.pos;
  layer(g, cam, 1, (g) => butterDish(g, P.butterX, P.butterY, 0.7));
  freezeGrade(g, fz);
  const k = ease.outBack(prog(t, 0.36, 0.7)); if (k > 0.01) { g.save(); g.translate(E.W * 0.62, E.H * 0.3); g.scale(k, k); seg(g, [[-30, 0], [-6, 26], [40, -30]], 14, GOLD); g.restore(); goldTag(g, t, 0.36, 'BUTTER SAVED', E.W * 0.62, E.H * 0.15, { size: 46 }); }
  unfreeze(g, t, 1.62); readout(g, t, lerp(8, 10, prog(t, 0, 1.62)));
} });

// s059 — THE FURRY HOCKEY PUCK: normal time, low on the tiles; Biscuit (still in her leap pose) shoots sideways on 'shoots' (0.66), spinning; a puck ghost on 'hockey' (3.46)
registerShot('s059', { draw(g, t, info) {
  const u = ease.out(prog(t, 0.66, info.dur + 0.4)), cx0 = CX - 500, cx = lerp(cx0, CX + 900, u), cam = { z: 1.2, x: lerp(-200, 500, u), y: 120 }, M = kitchen(g, t, cam), P = M.pos, GY = M.GY;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.minaSeatX - 120, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'shock']]), t, 1), expr: 'shocked', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0.6), t });
    actor(g, 'DEV', { x: P.heroSeatX + 300, y: GY, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'phone']]), t, 2), expr: 'shocked', blink: blinkFlag(t, 3.4, 2), look: lookToward(-1, 0.6), t });
    for (let i = 1; i < 6; i++) seg(g, [[cx - 140 - i * 70, GY - 60 + (i % 2) * 20], [cx - 80 - i * 70, GY - 60 + (i % 2) * 20]], 6, alpha('#ffffff', 0.6 - i * 0.1));
    g.save(); g.translate(cx, GY - 70); g.rotate(t * 3 * prog(t, 0.66, 1)); leapCat(g, 0, 70, 1.3, { facing: 1, rot: 0, t }); g.restore();
    if (t > 3.46) { const k = prog(t, 3.46, 3.9); g.save(); g.globalAlpha *= 0.7 * (1 - k * 0.5); g.strokeStyle = CREAM; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, GY - 30, 220, 50, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(cx, GY - 70, 220, 50, 0, 0, 7); g.stroke(); g.restore(); }
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// s060 — STRAIGHT INTO THE BIN: she flies in on 'bin.' (0.93), it rocks, the lid spins; only her tail sticks out; shake 3
registerShot('s060', { draw(g, t, info) {
  const sh = t > 0.93 && t < 1.3 ? Math.sin(t * 60) * 3 : 0, cam = { z: 1.5, x: 560 + sh, y: 60 + sh }, M = kitchen(g, t, cam), P = M.pos, GY = M.GY, bx = P.fridgeX - 260;
  layer(g, cam, 1, (g) => {
    if (t < 0.93) { const k = prog(t, 0, 0.93); g.save(); g.translate(lerp(bx - 900, bx, k), lerp(GY - 80, GY - 320, Math.sin(k * Math.PI / 2))); g.rotate(t * 6); leapCat(g, 0, 70, 1.1, { facing: 1, rot: 0, t }); g.restore(); }
    bin(g, bx, GY + 10, 0.9, { lid: t > 0.93 ? clamp(0.4 + 0.5 * Math.sin((t - 0.93) * 8) * Math.exp(-(t - 0.93) * 2)) : 0, wobble: t > 0.93 ? Math.exp(-(t - 0.93) * 2) : 0, t });
    if (t > 0.93) { const w = Math.sin(t * 12) * 20; g.save(); g.strokeStyle = '#2a2230'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx + 10, GY - 320); g.quadraticCurveTo(bx + 40 + w, GY - 420, bx + 10 + w, GY - 480); g.stroke(); g.restore(); }
  });
} });

// s061 — RULE 3 card over the rocking bin (blurred), chip 'NEWTON'S 1ST LAW' on 'first' (0.66)
registerShot('s061', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 3, title: "MOTION DOESN'T PAUSE.", bg: (g, t) => { blurLayer(g, 9, (g) => { const cam = { z: 1.5, x: 560, y: 60 }, M = kitchen(g, t, cam), P = M.pos; layer(g, cam, 1, (g) => { bin(g, P.fridgeX - 260, M.GY + 10, 0.9, { wobble: 0.6, lid: 0.3, t }); seg(g, [[P.fridgeX - 250, M.GY - 320], [P.fridgeX - 240 + Math.sin(t * 12) * 20, M.GY - 470]], 18, '#2a2230'); }); }, null, 1); veil(g, '#120a1c', 0.3); } });
  chip(g, t, { str: "NEWTON'S 1ST LAW", at: 0.66, x: E.W * 0.2, y: E.H * 0.9, dur: info.dur });
} });

// s062 — FIG 7 THE FIRST LAW: newton1 keeps going; gold F arrows on 'pushes' (1.07) and 'pulls' (1.87)
registerShot('s062', { draw(g, t, info) {
  board(g, t, { title: "FIG 7 - NEWTON'S FIRST LAW", fig: 'KEEP MOVING' });
  push(g, t, info.dur, 0.03, (g) => { newton1(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1300, k: ease.out(prog(t, 0, 0.8)), go: prog(t, 0.2, info.dur) });
    if (t > 1.07) { arrowG(g, E.W * 0.12, E.H * 0.78, E.W * 0.26, E.H * 0.78); text(g, 'F  (push)', E.W * 0.19, E.H * 0.86, { size: 40, color: GOLD, font: FONTS.ui, weight: 900 }); }
    if (t > 1.87) { arrowG(g, E.W * 0.88, E.H * 0.78, E.W * 0.74, E.H * 0.78); text(g, 'F  (pull)', E.W * 0.81, E.H * 0.86, { size: 40, color: GOLD, font: FONTS.ui, weight: 900 }); } });
} });

// s063 — MOMENTUM = MASS × SPEED: label on 'momentum.' (0.95); the formula builds on 'mass' 2.65 / 'times' 2.93 / 'speed.' 3.45
registerShot('s063', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - MOMENTUM', fig: 'p = m × v' });
  push(g, t, info.dur, 0.03, (g) => {
    const bx = lerp(E.W * 0.2, E.W * 0.6, (t * 0.2) % 1); circle(g, bx, E.H * 0.5, 70, 'rgba(0,0,0,0)'); ring(g, bx, E.H * 0.5, 70, 6, CREAM); arrowG(g, bx + 80, E.H * 0.5, bx + 260, E.H * 0.5);
    label(g, t, { at: [bx + 180, E.H * 0.5], to: [bx + 260, E.H * 0.3], str: 'MOMENTUM', start: 0.95 });
    const parts = [['p', 2.4], ['=', 2.5], ['m', 2.65], ['×', 2.93], ['v', 3.45]]; parts.forEach(([s, at], i) => { const k = ease.outBack(prog(t, at, at + 0.3)); if (k > 0.01) { g.save(); g.translate(E.W * 0.3 + i * 150, E.H * 0.78); g.scale(k, k); text(g, s, 0, 0, { size: 120, color: GOLD, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(GOLD, 0.5) }); g.restore(); } });
    [['mass', 2.65, 2], ['speed', 3.45, 4]].forEach(([s, at, i]) => text(g, s, E.W * 0.3 + i * 150, E.H * 0.88, { size: 32, color: CREAM, font: FONTS.ui, weight: 800, alpha: prog(t, at, at + 0.3) }));
  });
} });

// s064 — HEAVIER OR FASTER IS HARDER TO STOP: a tennis ball vs a bowling ball at a cream hand; on 'harder' (1.59) the big one pushes the hand back
registerShot('s064', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - HARDER TO STOP', fig: 'MOMENTUM' });
  const hand = (x, y, back) => { g.save(); g.translate(x + back, y); g.strokeStyle = CREAM; g.lineWidth = 6; rr(g, -40, -90, 80, 180, 30); g.stroke(); for (let i = 0; i < 4; i++) { rr(g, -40 - 40, -80 + i * 42, 50, 30, 15); g.stroke(); } g.restore(); };
  const a = ease.out(prog(t, 0.2, 1.4)), y1 = E.H * 0.36, y2 = E.H * 0.72, hx = E.W * 0.78;
  const tx = lerp(E.W * 0.2, hx - 120, a); ring(g, tx, y1, 40, 6, CREAM); seg(g, [[tx - 30, y1 - 20], [tx + 30, y1 + 20]], 3, CREAM); arrowG(g, tx + 50, y1, tx + 110, y1, GOLD, 6); hand(hx, y1, 0);
  const back = ease.out(prog(t, 1.59, 2.4)) * 160, bx = lerp(E.W * 0.15, hx - 160, a) + back; ring(g, bx, y2, 90, 8, CREAM); for (const [dx, dy] of [[-20, -30], [10, -40], [-5, -10]]) circle(g, bx + dx, y2 + dy, 9, CREAM); arrowG(g, bx + 100, y2, bx + 260, y2, GOLD, 14); hand(hx, y2, back);
  text(g, 'light + slow', E.W * 0.2, y1 - 80, { size: 34, color: CREAM, font: FONTS.ui, weight: 800 }); text(g, 'heavy + fast', E.W * 0.2, y2 - 130, { size: 34, color: CREAM, font: FONTS.ui, weight: 800 });
  goldTag(g, t, 1.59, 'HARDER TO STOP', E.W * 0.5, E.H * 0.9, { size: 46 });
} });

// s065 / s066 — the lift replay in the frozen kitchen: a gold velocity arrow stays with her (pulses on 'speed' 1.66); then IN OUR STORY, DELETE struck, SAVED + play icon
function liftReplay(g, t, k) {
  const cam = { z: 1.15, x: 120, y: -40 }, M = frozenTable(g, t, cam, { cat: false }), P = M.pos; freezeGrade(g, 1);
  const hx = P.butterX - 120, cx = lerp(P.butterX - 260, hx - 260, k), cy = lerp(P.tableTop - 150, M.GY - 40, k);
  layer(g, cam, 1, (g) => { leapCat(g, cx, cy, 1.4, { facing: 1, t: 0 }); hero(g, { x: hx, y: M.GY, s: 1.9, facing: -1, pose: { ...poseAt(0, [[0, 'crouch']]), hF: [60, -100], hB: [30, -100] }, expr: 'determined', t }); });
  const sx = (cx - CX - cam.x) * cam.z + CX, sy = (cy - 120 - E.H / 2 - cam.y) * cam.z + E.H / 2; return [sx, sy];
}
registerShot('s065', { draw(g, t, info) {
  const [sx, sy] = liftReplay(g, t, ease.inOut(prog(t, 0.2, 2.4))), pl = 1 + 0.2 * Math.max(0, Math.sin((t - 1.66) * 10)) * (t > 1.66 && t < 2.3 ? 1 : 0);
  arrowG(g, sx + 120, sy, sx + 120 + 260 * pl, sy, GOLD, 16 * pl); text(g, 'her speed', sx + 260, sy - 50, { size: 38, color: GOLD, font: FONTS.ui, weight: 900 });
} });
registerShot('s066', { draw(g, t, info) {
  const [sx, sy] = liftReplay(g, t, 1);
  arrowG(g, sx + 120, sy, sx + 380, sy, GOLD, 16);
  chip(g, t, { str: 'IN OUR STORY', at: 0.38, x: E.W * 0.18, y: E.H * 0.1, dur: info.dur });
  const dk = prog(t, 0.9, 1.2); if (dk > 0) { text(g, 'DELETE', sx, sy - 160, { size: 60, color: CREAM, font: FONTS.ui, weight: 900, alpha: dk }); const sk = prog(t, 1.7, 2.0); if (sk > 0) seg(g, [[sx - 120, sy - 160], [sx - 120 + 240 * sk, sy - 160]], 10, CORAL); }
  goldTag(g, t, 3.34, 'SAVED', sx + 300, sy - 70, { size: 46 });
  const pk = ease.outBack(prog(t, 3.92, 4.2)); if (pk > 0.01) { g.save(); g.translate(sx + 440, sy); g.scale(pk, pk); circle(g, 0, 0, 34, 'rgba(14,10,20,.88)'); poly(g, [[-10, -16], [18, 0], [-10, 16]], GOLD); g.restore(); }
} });

// s067 — PUSH AGAINST ITS MOTION: Mina rolls an orange toward the edge; the hero's open hand stops it on 'push' (1.92); two opposite gold arrows
registerShot('s067', { draw(g, t, info) {
  const cam = { ...camMove(t, info.dur, { z: [1.35, 1.4] }), x: 60, y: -130 }, M = kitchen(g, t, cam), P = M.pos, GY = M.GY;
  const ox = lerp(P.tableX - 250, P.tableX + 250, ease.out(prog(t, 0.3, 1.92))), oy = P.tableTop - 30;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: P.minaSeatX - 60, y: GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'reach'], [0.6, 'point']]), t, 1), expr: 'happy', blink: blinkFlag(t, 3, 1), look: lookToward(1, 0.3), t });
    orange(g, ox, oy, 30, ox * 0.05);
    hero(g, { x: P.tableX + 420, y: GY, s: 1.9, facing: -1, pose: { ...poseAt(t, [[0, 'stand']]), hF: [60, -136], eF: [34, -146] }, expr: exprAt(t, [[0, 'determined'], [2.2, 'smile']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(-1, 0.4), t });
    if (t < 1.92) arrowG(g, ox + 40, oy - 60, ox + 140, oy - 60, GOLD, 8); else { arrowG(g, ox - 120, oy - 60, ox - 20, oy - 60, GOLD, 8); arrowG(g, ox + 140, oy - 60, ox + 40, oy - 60, GOLD, 8); }
  });
  morningFg(g, t, cam, { view: 'kitchen', mood: 'morning' });
} });

// s068 — LIKE A GOALKEEPER'S GLOVES: cream gloves catch a ball on "goalkeeper's" (0.40); its gold arrow shrinks as the gloves give back
registerShot('s068', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - PUSH AGAINST IT', fig: 'GLOVES' });
  const c = ease.out(prog(t, 0.1, 0.4)), give = ease.out(prog(t, 0.4, 1.2)) * 60, bx = lerp(E.W * 0.2, E.W * 0.6 - 30, c) + give;
  ring(g, bx, E.H * 0.5, 70, 6, CREAM); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; poly(g, [[bx + Math.cos(a) * 30, E.H * 0.5 + Math.sin(a) * 30], [bx + Math.cos(a + 0.6) * 30, E.H * 0.5 + Math.sin(a + 0.6) * 30], [bx + Math.cos(a + 0.3) * 54, E.H * 0.5 + Math.sin(a + 0.3) * 54]], alpha(CREAM, 0.5)); }
  const al = 220 * (1 - ease.out(prog(t, 0.4, 1.4))); if (al > 4) arrowG(g, bx - 80 - al, E.H * 0.5, bx - 80, E.H * 0.5, GOLD, 14);
  glove(g, E.W * 0.6 + 60 + give, E.H * 0.42, 1.3, -1); glove(g, E.W * 0.6 + 60 + give, E.H * 0.62, 1.3, -1);
} });
