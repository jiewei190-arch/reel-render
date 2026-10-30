// A_s001_s011_open.js — batch A, COLD OPEN (0.00-33.69): the promise, the routine card, the 10 km route, the hair joke, 1,095 days, title.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, alpha, shade, glow, text, measure, FONTS, rr, seg, circle, poly, linGrad, rng, talkAmount } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, talkGesture, pointAndLook, lookToward, camMove, atmos } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { home3, home3Fg, timeSkip } from '../sets/home3.js';
import { park, parkFg } from '../sets/park.js';
import { pushUp, sitUp, squat, runCycle, trainee, repCounter } from '../sets/train.js';
import { sw, heroFace, stamp, tuft, handAt } from './A_lib.js';

const GOLD = () => S().ui.gold;
const camOf = (c, dx = 0, dy = 0) => ({ ...c, x: c.x + dx, y: c.y + dy });

// ===================================================================================================
// s001 — "You roll out of bed and make a promise."  Alarm rattles, HERO rolls off the bed (lie > sit > stand), slaps his chest on
// "promise" and points at the empty wall calendar (eyes first). Dawn window key light, dust in the sunbeam.
registerShot('s001', { draw(g, t, info) {
  const st = info.shot.start, tRoll = sw('roll', st, 0.44), tProm = sw('promise', st, 1.66);
  const cam = camMove(t, info.dur, { z: [1.16, 1.24], x: [-330, -240], y: [-10, -20] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 0, month: 'MARCH', ring: t < 0.55 ? 1 : 0 });
  const P = H.pos, s = 1.9, bedEdge = P.bedX + 200;
  layer(g, cam, 1, (g) => {
    const kR = ease.inOut(prog(t, tRoll, tRoll + 0.55)), kS = ease.inOut(prog(t, tRoll + 0.6, tRoll + 1.05));
    let pose, x, y, rot = 0;
    if (kS <= 0) {                                                  // lying on the bed -> rolled up to sitting on its edge
      const lie = { ...POSES.lie }, sitP = POSES.sit;
      pose = blendPose(lie, sitP, kR); rot = lerp(-Math.PI / 2, 0, kR);
      x = lerp(P.bedX - 30, bedEdge, kR); y = lerp(P.bedTop + 10, P.bedTop + 128, kR);
      if (t < tRoll) { pose = { ...lie, head: [lie.head[0] + Math.sin(t * 9) * 2, lie.head[1]] }; }   // twitch at the alarm
    } else {                                                        // stand up off the bed edge, a step toward the mat
      pose = blendPose(POSES.sit, POSES.stand, kS); x = lerp(bedEdge, bedEdge + 120, kS); y = lerp(P.bedTop + 128, H.GY + 20, kS);
    }
    let look = lookToward(1, 0.2);
    if (t >= tRoll + 1.05) {
      const chest = { ...POSES.stand, eF: [30, -142], hF: [14, -150] };
      const slap = ease.out(prog(t, tProm - 0.12, tProm + 0.02));
      const P2 = pointAndLook(t, tProm + 0.3, [1, -0.75], { base: chest });
      pose = idle(t < tProm + 0.3 ? blendPose(POSES.stand, chest, slap) : P2.pose, t, 1); look = t < tProm + 0.3 ? lookToward(1, 0) : P2.look;
      x = bedEdge + 120; y = H.GY + 20;
    }
    actor(g, 'HERO', { x, y, s, facing: 1, pose, rot, shadow: rot === 0 ? undefined : false, expr: exprAt(t, [[0, 'sleepy'], [tRoll + 0.6, 'neutral'], [tProm, 'determined']]), blink: t < tRoll ? true : blinkFlag(t, 3.4, 1), look, rim: H.rim, t });
    // the chest slap: a little white impact spark at the hand
    const u = t - tProm; if (u > 0 && u < 0.3) { const [hx, hy] = [x + 16 * s, y - 150 * s]; FX.sparkle(g, hx, hy, 30 * (1 - u / 0.3), '#fff6dc', 0.9); }
    // alarm rattle lines
    if (t < 0.55) for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.45; seg(g, [[P.clockX + Math.cos(a) * 70, P.clockY - 20 + Math.sin(a) * 70], [P.clockX + Math.cos(a) * 100, P.clockY - 20 + Math.sin(a) * 100]], 5, alpha('#ff5a4a', 0.8 * (0.5 + 0.5 * Math.sin(t * 40)))); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 18, near: 6 });
} });

// ===================================================================================================
// THE ROUTINE CARD (s002, s003): four-slot checklist on the left, a live demo of each move on the right, blurred bedroom behind.
const SLOTS = [
  { label: 'PUSH-UPS', n: '100' }, { label: 'SIT-UPS', n: '100' }, { label: 'SQUATS', n: '100' }, { label: 'RUN', n: '10 km' },
];
function miniPose(i, t) {
  if (i === 0) return { R: pushUp(t, 1.0), dx: -10 };
  if (i === 1) return { R: sitUp(t, 0.9), dx: -6 };
  if (i === 2) return { R: squat(t, 0.8), dx: 0 };
  return { R: { pose: runCycle(t, 1.6, { mode: 'jog' }).pose, shadow: [0, 30] }, dx: 0 };
}
function routineCard(g, t, o) {
  const { x = 150, y = 210, scroll = 0, checks = [], intro = 1 } = o, w = 720, rowH = 196, U = S().ui;
  g.save(); g.translate(lerp(-w - 80, 0, ease.out(intro)), -scroll);
  rr(g, x - 20, y - 120, w + 40, rowH * 4 + 160, 30); g.fillStyle = 'rgba(14,10,22,.86)'; g.fill(); g.strokeStyle = alpha(U.gold, 0.5); g.lineWidth = 3; g.stroke();
  text(g, 'THE ROUTINE', x + w / 2, y - 64, { size: 46, color: U.cream, font: FONTS.title, spacing: 8, stroke: 8, strokeColor: '#0b0812' });
  text(g, 'EVERY DAY', x + w / 2, y - 18, { size: 28, color: alpha(U.cream, 0.7), font: FONTS.ui, weight: 900, spacing: 6 });
  SLOTS.forEach((sl, i) => {
    const yy = y + 40 + i * rowH, on = checks[i] != null && t >= checks[i], k = on ? ease.outBack(prog(t, checks[i], checks[i] + 0.35)) : 0;
    rr(g, x + 10, yy, w - 20, rowH - 26, 22); g.fillStyle = on ? 'rgba(63,154,74,.24)' : 'rgba(255,255,255,.05)'; g.fill(); g.strokeStyle = on ? alpha('#5fd37a', 0.8) : 'rgba(255,255,255,.12)'; g.lineWidth = 2.5; g.stroke();
    // pictogram: a tiny HERO doing the move
    g.save(); g.beginPath(); g.rect(x + 20, yy + 6, 210, rowH - 38); g.clip();
    const M = miniPose(i, t + i * 0.4); trainee(g, 'HERO', M.R, { x: x + 125 + M.dx, y: yy + rowH - 50, s: 0.62, facing: 1, t, rim: { color: '#ffc68a', dir: [-0.8, -0.5] }, expr: 'determined', shadow: true });
    g.restore();
    text(g, sl.label, x + 250, yy + rowH * 0.36, { size: 50, color: U.cream, font: FONTS.title, align: 'left', spacing: 3 });
    if (on) text(g, sl.n, x + 250, yy + rowH * 0.66, { size: 46 * Math.max(0.01, k), color: U.gold, font: FONTS.title, align: 'left', glow: 14, glowColor: alpha(U.gold, 0.7), stroke: 7, strokeColor: '#140f1c' });
    // the checkbox
    const bx = x + w - 90, by = yy + (rowH - 26) / 2; rr(g, bx - 36, by - 36, 72, 72, 14); g.strokeStyle = on ? '#5fd37a' : alpha(U.cream, 0.5); g.lineWidth = 5; g.stroke();
    if (on) { g.save(); g.translate(bx, by); g.scale(k, k); seg(g, [[-22, 2], [-6, 20], [26, -20]], 11, '#5fd37a'); g.restore(); glow(g, bx, by, 90, '#5fd37a', 0.25 * Math.exp(-(t - checks[i]) * 3)); }
  });
  g.restore();
}
const bedroomBg = (g, t, cam) => blurLayer(g, 12, (g) => home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 0 }), null, 1);

// s002 — "Every day, for three years: a hundred push-ups,"  card slides in; gold 3 YEARS stamp on "three"; first slot on "hundred";
// HERO does crisp push-ups on the right, the big gold 100 flips up on "push-ups".
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tThree = sw('three', st, 0.99), tHun = sw('hundred', st, 2.05), tPU = sw('push', st, 2.41);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-120, -90], y: [-40, -50] });
  bedroomBg(g, t, cam); veil(g, '#0a0812', 0.45);
  routineCard(g, t, { checks: [tHun], intro: prog(t, 0, 0.45) });
  // the live demo on a lit mat
  const k = ease.out(prog(t, tHun - 0.3, tHun + 0.2)), mx = 1360, gy = 880;
  if (k > 0) {
    g.save(); g.globalAlpha *= k;
    glow(g, mx, gy - 60, 520, '#ffd9a0', 0.22); g.fillStyle = 'rgba(63,154,74,.55)'; g.beginPath(); g.ellipse(mx, gy + 10, 360, 34, 0, 0, 7); g.fill();
    const R = pushUp(Math.max(0, t - tHun), 1.6); trainee(g, 'HERO', R, { x: mx - 20, y: gy, s: 2.0, facing: 1, t, rim: { color: '#ffc68a', dir: [-0.8, -0.6] }, expr: exprAt(t, [[0, 'determined'], [tPU, 'joy']]), blink: blinkFlag(t, 3.2, 2), sweat: 0.2, breath: 1.4 });
    g.restore();
  }
  if (t >= tPU) repCounter(g, 100, { x: 1300, y: 360, size: 190, since: t - tPU, label: 'PUSH-UPS' });
  stamp(g, t, tThree, '3 YEARS', 1640, 140, { color: GOLD(), size: 62, rot: 0.08 });
  atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 4 });
} });

// s003 — "a hundred sit-ups, a hundred squats, and a ten kilometre run."  the camera pans down the checklist; each slot ticks on its word;
// the right-hand demo swaps sit-ups > squats > a jog on a treadmill strip with the blurred spring park sliding under it.
registerShot('s003', { draw(g, t, info) {
  const st = info.shot.start, tSit = sw('sit', st, 0.49), tSq = sw('squats', st, 1.63), tTen = sw('ten', st, 2.49), tRun = sw('run', st, 3.11);
  const cam = camMove(t, info.dur, { z: [1.06, 1.1], x: [-90, -60], y: [-50, -30] });
  bedroomBg(g, t, cam); veil(g, '#0a0812', 0.45);
  const scroll = lerp(0, 190, ease.inOut(prog(t, 0.2, info.dur - 0.4)));
  const mx = 1360, gy = 880, sx = 2.0, rim = { color: '#ffc68a', dir: [-0.8, -0.6] };
  // demo panel (behind the card's right edge)
  if (t >= tTen - 0.25) {                                        // spring park strip slides in under the runner
    const k = ease.out(prog(t, tTen - 0.25, tTen + 0.3));
    g.save(); rr(g, mx - 470, 250, 940, 700, 36); g.clip(); g.globalAlpha *= k;
    const pc = { z: 1.0, x: -400 + (t - tTen) * 420, y: -80 }; blurLayer(g, 4, (g) => { const Pk = park(g, t, pc, { season: 'spring', mood: 'dawn', km: 1 }); }, null, 1);
    g.restore();
    g.save(); g.strokeStyle = alpha(GOLD(), 0.6 * k); g.lineWidth = 4; rr(g, mx - 470, 250, 940, 700, 36); g.stroke(); g.restore();
  } else { glow(g, mx, gy - 60, 520, '#ffd9a0', 0.22); g.fillStyle = 'rgba(63,154,74,.55)'; g.beginPath(); g.ellipse(mx, gy + 10, 360, 34, 0, 0, 7); g.fill(); }
  let R, lab = null, at = 0;
  if (t < tSq) { R = sitUp(t, 0.95); lab = '100'; at = tSit; }
  else if (t < tTen) { R = squat(t - tSq, 1.1); lab = '100'; at = tSq; }
  else { R = { pose: runCycle(t, 1.8, { mode: 'jog' }).pose, shadow: [0, 34] }; lab = '10 km'; at = tTen; }
  const dx = t < tSq ? -60 : 0;
  if (t >= tTen) { g.fillStyle = '#2a2632'; rr(g, mx - 300, gy, 600, 26, 10); g.fill(); for (let i = 0; i < 12; i++) { const xx = mx - 300 + ((i * 60 - t * 420) % 600 + 600) % 600; seg(g, [[xx, gy + 6], [xx + 22, gy + 6]], 3, 'rgba(255,255,255,.3)'); } }
  trainee(g, 'HERO', R, { x: mx + dx, y: gy, s: sx, facing: 1, t, rim, expr: exprAt(t, [[0, 'determined'], [tSq, 'nervous'], [tTen, 'joy']]), blink: blinkFlag(t, 3.0, 3), sweat: 0.3, breath: 1.4 });
  if (t >= at) text(g, lab, mx + 260, 360, { size: 120 * ease.outBack(prog(t, at, at + 0.35)), color: GOLD(), glow: 22, glowColor: alpha(GOLD(), 0.8), stroke: 12, strokeColor: '#140f1c' });
  routineCard(g, t, { checks: [-1, tSit, tSq, tRun], scroll });
  atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 4 });
} });

// ===================================================================================================
// s004 — "About six miles. No days off."  ESTABLISHING the route (spring dawn, river, bridge). HERO jogs past the "10 km (6.2 mi)" board;
// gold '6.2 mi' on "six"; a red NO DAYS OFF stamp slams on the board on "off" (shake 6).
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tSix = sw('six', st, 0.39), tOff = sw('off', st, 2.33);
  const P0 = { signX: E.W / 2 - 1250 };
  const s = 1.7, hx = P0.signX - 560 + t * 360;
  let cam = camMove(t, info.dur, { z: [0.94, 0.98], x: [P0.signX - E.W / 2 + 60, P0.signX - E.W / 2 + 340], y: [-110, -120] });
  const u = t - tOff; if (u > 0 && u < 0.5) { const d = 6 * Math.exp(-u * 8); cam = camOf(cam, Math.sin(u * 70) * d, Math.cos(u * 60) * d); }
  const P = park(g, t, cam, { season: 'spring', mood: 'dawn', km: 1, sign: true });
  layer(g, cam, 1, (g) => {
    const R = runCycle(t, 0, { mode: 'jog', x: hx, s, facing: 1, fatigue: 0.1 });
    trainee(g, 'HERO', { pose: R.pose, shadow: [0, 34] }, { x: hx, y: P.GY + 18, s, facing: 1, t, rim: P.rim, expr: exprAt(t, [[0, 'joy'], [tOff, 'determined']]), blink: blinkFlag(t, 3.3, 4), look: lookToward(1, 0), breath: 1.6, cold: true });
    const sx = P.pos.signX, sy = P.GY - 36;
    if (t >= tSix) text(g, '6.2 mi', sx, sy - 470 - 20 * ease.out(prog(t, tSix, tSix + 0.3)), { size: 64 * ease.outBack(prog(t, tSix, tSix + 0.35)), color: GOLD(), glow: 18, glowColor: alpha(GOLD(), 0.8), stroke: 10, strokeColor: '#140f1c' });
    stamp(g, t, tOff, 'NO DAYS OFF', sx + 30, sy - 300, { size: 64, rot: -0.16 });
  });
  parkFg(g, t, cam, { season: 'spring' });
  FX.fog(g, E.H * 0.5, E.H * 0.3, '#ffe2c8', 0.22);
  atmos(g, t, cam, { color: P.M.key, far: 20, near: 6 });
} });

// ===================================================================================================
// s005 — "No idea what you're getting into."  GIANT FACE HERO, eager and clueless: joy > determined > cheeky, thumbs-up drifting in;
// slow ominous pull-back reveals the 1,095-square calendar wall behind him; a gulp + sweat drop on "into".
function bigCalendar(g, x, y, w, h, filled = 0) {
  rr(g, x - w / 2 - 16, y - h / 2 - 70, w + 32, h + 100, 18); g.fillStyle = '#fbf7ee'; g.fill();
  g.fillStyle = '#d4262e'; g.fillRect(x - w / 2 - 16, y - h / 2 - 70, w + 32, 56); text(g, '1,095 DAYS', x, y - h / 2 - 42, { size: 36, color: '#fff', spacing: 6 });
  const cols = 45, rows = 25, cw = w / cols, ch = h / rows; g.strokeStyle = 'rgba(80,70,90,.35)'; g.lineWidth = 1.2;
  for (let i = 0; i < 1095; i++) { const c = i % cols, r = Math.floor(i / cols); g.strokeRect(x - w / 2 + c * cw + 1, y - h / 2 + r * ch + 1, cw - 2, ch - 2); if (i < filled) { g.fillStyle = '#d4262e'; g.fillRect(x - w / 2 + c * cw + 3, y - h / 2 + r * ch + 3, cw - 6, ch - 6); } }
}
function thumbsUp(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  seg(g, [[0, 260], [0, 40]], 92, '#3f9a4a'); seg(g, [[0, 260], [0, 40]], 92, alpha('#000', 0.12));
  rr(g, -54, -40, 108, 100, 34); g.fillStyle = '#0e0b12'; g.fill();
  rr(g, -18, -118, 40, 96, 20); g.fill();
  g.strokeStyle = alpha('#f4efe6', 0.35); g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-50, -6 + i * 24); g.lineTo(-10, -6 + i * 24); g.stroke(); }
  g.strokeStyle = '#ffc68a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-18, -110); g.lineTo(-18, -40); g.stroke();
  seg(g, [[-46, 70], [46, 70]], 22, '#f4f1e8');
  g.restore();
}
registerShot('s005', { draw(g, t, info) {
  const st = info.shot.start, tInto = sw('into', st, 1.31), z = lerp(1.08, 1.0, ease.inOut(t / info.dur));
  const cam = camMove(t, info.dur, { z: [1.08, 1.0], x: [0, 0], y: [0, 0] });
  const H0 = home3(g, t, { z: 1.05, x: 60, y: -60 }, { room: 'bedroom', mood: 'dawn', marks: 0 });
  veil(g, '#1a0e14', 0.25);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const rev = ease.inOut(prog(t, 0.3, info.dur));
  g.save(); g.globalAlpha *= 0.6 + 0.4 * rev; bigCalendar(g, E.W * 0.5, E.H * 0.42, 1500, 620); g.restore();
  glow(g, E.W * 0.15, E.H * 0.2, 600, '#ffc080', 0.25);
  const f0 = faceAt(t, [[0, 'joy'], [0.9, 'determined'], [1.8, 'cheeky']], 0.16);
  const gulp = prog(t, tInto, tInto + 0.4), f = { ...f0, sweat: Math.max(f0.sweat, ease.out(gulp)), open: f0.open * (1 - 0.6 * Math.sin(gulp * Math.PI)) };
  const cy = E.H * 0.6 + Math.sin(gulp * Math.PI) * 10;
  heroFace(g, E.W * 0.47, cy, 330, { f, rimSide: -1, rimColor: '#ffc68a', glint: '#ffd59a', breath: Math.sin(t * 2.4), blink: blinkAmt(t, 3.1, 2) });
  const tu = ease.out(prog(t, 0.15, 0.7)); thumbsUp(g, E.W * 0.78, lerp(E.H + 300, E.H * 0.78, tu), 1.1, 0.12 + Math.sin(t * 3) * 0.04);
  g.restore();
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
} });

// ===================================================================================================
// the bedroom doorway (local prop: the bedroom set has no door): a lit hall behind, frame on the character plane
function doorway(g, x, gy, t) {
  const w = 300, h = 600; g.fillStyle = '#ffe4c0'; g.fillRect(x - w / 2, gy - h, w, h); glow(g, x, gy - h * 0.5, 420, '#ffd9a0', 0.35);
  g.fillStyle = 'rgba(120,90,70,.35)'; g.fillRect(x - w / 2, gy - h * 0.35, w, h * 0.35);
  g.fillStyle = '#4a3428'; g.fillRect(x - w / 2 - 26, gy - h - 26, 26, h + 26); g.fillRect(x + w / 2, gy - h - 26, 26, h + 26); g.fillRect(x - w / 2 - 26, gy - h - 26, w + 52, 26);
  g.save(); g.translate(x + w / 2, gy); g.transform(1, 0, -0.0, 1, 0, 0); g.fillStyle = '#6a4a38'; g.fillRect(0, -h, 70, h); circle(g, 56, -h * 0.48, 7, '#d8b070'); g.restore();   // the open door leaf
}

// s006 — "Mina looks at your hair, then at you. "Everyone says"  TWO-SHOT: MINA in the doorway, eyes UP to his curls on "hair", then level
// on "you"; she starts talking on "Everyone says" (lip-sync only there). HERO pats his curls.
registerShot('s006', { draw(g, t, info) {
  const st = info.shot.start, tHair = sw('hair', st, 0.71), tYou = sw('you', st + 0.9, 1.31), tSays = sw('everyone', st, 2.23);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [120, 200], y: [-40, -50] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 0 });
  const dX = H.CX + 640, hX = H.CX + 250;
  layer(g, cam, 1, (g) => {
    doorway(g, dX, H.GY + 6, t);
    const talk = talkAmount(st + t, st + tSays - 0.05, st + info.dur + 0.4);
    const look = t < tHair - 0.2 ? lookToward(-1, 0) : t < tYou - 0.2 ? lookToward(-0.45, -1) : lookToward(-1, -0.25);
    const base = t < tHair ? POSES.stand : t < tYou ? { ...POSES.stand, head: [-2, -212] } : POSES.crossArms;
    const mPose = t > tSays ? talkGesture(t, 3, { energy: 0.8 }) : idle(base, t, 3);
    actor(g, 'MINA', { x: dX - 40, y: H.GY + 20, s: 2.0, facing: -1, pose: mPose, expr: exprAt(t, [[0, 'neutral'], [tHair, 'thinking'], [tYou, 'confused']]), blink: blinkFlag(t, 2.9, 3), look, talk, rim: { color: '#ffd9a0', dir: [1, -0.3] }, t });
    const pat = Math.max(0, Math.sin((t - tHair - 0.2) * 9)) * (t > tHair + 0.2 && t < tYou + 0.4 ? 1 : 0);
    const patPose = { ...POSES.stand, eF: [26, -198], hF: [10, -238 + pat * 10] };
    const hp = idle(poseAt(t, [[0, 'stand'], [tHair + 0.15, patPose], [tYou + 0.5, 'sheepish']]), t, 4);
    actor(g, 'HERO', { x: hX, y: H.GY + 20, s: 1.9, facing: 1, pose: hp, expr: exprAt(t, [[0, 'smile'], [tHair + 0.2, 'nervous']]), blink: blinkFlag(t, 3.1, 4), look: lookToward(1, 0.1), rim: H.rim, t });
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
} });

// s007 — "if you train that hard, your hair falls out."  GIANT FACE MINA, lip-synced; suspicious > worried > squint;
// a single cartoon curl drifts down past her face on "falls".
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tFall = sw('falls', st, 1.85);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07] });
  blurLayer(g, 10, (g) => home3(g, t, { z: 1.2, x: 520, y: -80 }, { room: 'bedroom', mood: 'dawn', marks: 0 }), null, 1); veil(g, '#1a0e14', 0.2);
  glow(g, E.W * 0.85, E.H * 0.3, 600, '#ffd9a0', 0.3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 + cam.x * 0.3, -E.H / 2 + cam.y * 0.3);
  const talk = talkAmount(st + t, st - 0.1, st + info.dur);
  const f0 = faceAt(t, [[0, 'suspicious'], [1.0, 'worried'], [2.2, 'squint']], 0.16), f = { ...f0, open: Math.max(f0.open * 0.3, talk * 0.8), look: t > tFall ? [0.2, 0.7] : f0.look };
  giantFace(g, E.W * 0.5, E.H * 0.58, 320, { who: 'MINA', f, rimSide: 1, rimColor: '#ffd9a0', glint: '#ffe0b0', breath: Math.sin(t * 2.6), blink: blinkAmt(t, 2.8, 5), tilt: lerp(-0.03, 0.03, ease.inOut(t / info.dur)) });
  const k = prog(t, tFall - 0.1, info.dur + 0.2);
  if (k > 0) tuft(g, E.W * 0.72 + Math.sin(k * 9) * 40, lerp(E.H * 0.12, E.H * 0.95, ease.inOut(k)), 3.2, Math.sin(k * 7) * 0.8);
  g.restore();
  atmos(g, t, cam, { color: '#ffd8b0', far: 12, near: 4 });
} });

// s008 — "Dev nods, very seriously. "It's a known thing.""  DEV appears in the doorway behind Mina, two grave nods, arms folded,
// lip-sync on the quote only. HERO between them, eyes flick Dev -> Mina.
registerShot('s008', { draw(g, t, info) {
  const st = info.shot.start, tNod = sw('nods', st, 0.19), tSer = sw('seriously', st, 0.83), tIts = sw("it's", st + 1.5, 2.13);
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], x: [140, 190], y: [-40, -50] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 0 });
  const dX = H.CX + 640, hX = H.CX + 120;
  layer(g, cam, 1, (g) => {
    doorway(g, dX, H.GY + 6, t);
    const nod = (t > tNod && t < tNod + 1.4) ? Math.max(0, Math.sin((t - tNod) * Math.PI / 0.7)) * 10 : 0;
    const dp = idle(POSES.crossArms, t, 6); dp.head = [dp.head[0] + nod * 0.4, dp.head[1] + nod];
    const talk = talkAmount(st + t, st + tIts - 0.05, st + info.dur + 0.4);
    actor(g, 'DEV', { x: dX + 70, y: H.GY + 4, s: 1.9, facing: -1, pose: dp, expr: exprAt(t, [[0, 'neutral'], [tSer, 'determined']]), blink: blinkFlag(t, 3.5, 6), look: lookToward(-1, 0.1), talk, rim: { color: '#ffd9a0', dir: [1, -0.3] }, t });
    actor(g, 'MINA', { x: dX - 150, y: H.GY + 20, s: 2.0, facing: -1, pose: idle(POSES.crossArms, t, 3), expr: exprAt(t, [[0, 'confused'], [tIts, 'determined']]), blink: blinkFlag(t, 2.9, 3), look: lookToward(-1, -0.3), rim: { color: '#ffd9a0', dir: [1, -0.3] }, t });
    const lk = t < tNod + 0.15 ? lookToward(1, -0.05) : t < tSer ? lookToward(1, -0.2) : t < tIts ? lookToward(1, 0) : lookToward(1, -0.25);
    actor(g, 'HERO', { x: hX, y: H.GY + 20, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'sheepish'], [tIts + 0.3, { ...POSES.stand, eF: [26, -198], hF: [10, -236] }]]), t, 4), expr: exprAt(t, [[0, 'nervous'], [tIts + 0.2, 'worried']]), blink: blinkFlag(t, 3.1, 4), look: lk, rim: H.rim, t });
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
} });

// s009 — "Is it? Three years."  GIANT FACE HERO, doubt: suspicious > worried > determined; his hand grabs a fistful of curls on "Is it"
// and one curl springs back (boing); gold chip '3 YEARS' on "Three".
registerShot('s009', { draw(g, t, info) {
  const st = info.shot.start, tIs = sw('is', st, 0.15), tThree = sw('three', st, 2.13);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 10, (g) => home3(g, t, { z: 1.25, x: -260, y: -120 }, { room: 'bedroom', mood: 'dawn', marks: 0 }), null, 1); veil(g, '#1a0e14', 0.2);
  glow(g, E.W * 0.12, E.H * 0.3, 600, '#ffc080', 0.3);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 + cam.x * 0.3, -E.H / 2 + cam.y * 0.3);
  const f = faceAt(t, [[0, 'suspicious'], [0.8, 'worried'], [2.0, 'determined']], 0.16);
  const cx = E.W * 0.5, cy = E.H * 0.6, r = 330;
  heroFace(g, cx, cy, r, { f, rimSide: -1, rimColor: '#ffc68a', glint: '#ffd59a', breath: Math.sin(t * 2.2), blink: blinkAmt(t, 3.3, 4), tilt: Math.sin(t * 0.8) * 0.02 });
  // the hand: green sleeve up from the bottom-left, fist closed in the curls; releases at 1.4 s, a curl springs back
  const grab = ease.out(prog(t, tIs - 0.15, tIs + 0.1)) * (1 - ease.in(prog(t, 1.5, 1.9)));
  if (grab > 0.01) {
    const fx = cx - r * 0.75, fy = cy - r * 0.78, bx = lerp(-200, fx, grab), by = lerp(E.H + 200, fy, grab);
    seg(g, [[bx - 260, by + 600], [bx - 40, by + 120]], 110, '#3f9a4a'); seg(g, [[bx - 260, by + 600], [bx - 40, by + 120]], 110, alpha('#000', 0.15));
    circle(g, bx, by + 40, 70, '#0e0b12'); g.strokeStyle = alpha('#f4efe6', 0.35); g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(bx + 6, by + 30 + i * 20, 46, -0.6, 0.2); g.stroke(); }
  }
  const sp = t - (tIs + 0.05); if (sp > 0) { const k = Math.exp(-sp * 4) * Math.sin(sp * 22); tuft(g, cx - r * 0.55 + k * 30, cy - r * 1.02 - Math.abs(k) * 40, 3.6, -0.6 + k * 0.5); }
  g.restore();
  chip(g, t, { str: '3 YEARS', at: tThree, x: E.W * 0.5, y: E.H * 0.88, dur: info.dur });
  atmos(g, t, cam, { color: '#ffd8b0', far: 12, near: 4 });
} });

// ===================================================================================================
// s010 — "One thousand and ninety-five days."  INSERT, the calendar riffle: DAY 1 flips faster and faster to DAY 1,095 on "days",
// gold '1,095' stamp. Blurred bedroom behind, slow push.
registerShot('s010', { draw(g, t, info) {
  const st = info.shot.start, tDays = sw('days', st, 1.31);
  const cam = camMove(t, info.dur, { z: [1.08, 1.14] });
  blurLayer(g, 12, (g) => home3(g, t, { z: 1.15, x: 200, y: -100 }, { room: 'bedroom', mood: 'dawn', marks: 0 }), null, 1); veil(g, '#0a0812', 0.45);
  const labels = ['DAY 1', 'DAY 2', 'DAY 9', 'DAY 40', 'DAY 121', 'DAY 250', 'DAY 365', 'DAY 512', 'DAY 730', 'DAY 888', 'DAY 1,001', 'DAY 1,060', 'DAY 1,095'];
  const n = labels.length - 1, keys = labels.map((l, i) => [i === 0 ? 0.0 : 0.12 + (tDays - 0.12) * Math.pow(i / n, 0.8), l, i === n ? 'THREE YEARS' : null]);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 + cam.x * 0.3, -E.H / 2 + cam.y * 0.3);
  timeSkip(g, t, { x: E.W * 0.5, y: E.H * 0.2, s: 1.15, keys, flip: 0.1 });
  g.restore();
  stamp(g, t, tDays + 0.05, '1,095', E.W * 0.74, E.H * 0.72, { color: GOLD(), size: 96, rot: -0.14 });
  atmos(g, t, cam, { color: '#ffd8b0', far: 12, near: 4 });
} });

// ===================================================================================================
// s011 — "Let's find out."  TITLE lock-up on the river path at sunrise: HERO silhouetted mid-stride (gold rim), Biscuit on the railing,
// the bridge behind; the title pops on "find". God rays, mist, blossom.
function titleLockup(g, t, at) {
  const k = ease.outBack(prog(t, at, at + 0.5)), a = clamp((t - at) / 0.25); if (a <= 0) return;
  const U = S().ui, y1 = E.H * 0.2, y2 = E.H * 0.33, s = 0.85 + 0.15 * k + 0.012 * (t - at);
  g.save(); g.globalAlpha *= a; g.translate(E.W / 2, (y1 + y2) / 2); g.scale(s, s); g.translate(-E.W / 2, -(y1 + y2) / 2);
  glow(g, E.W / 2, (y1 + y2) / 2, 900, '#ffb060', 0.18);
  const L1 = 'WHAT IF YOU TRAINED', parts = [['EVERY DAY FOR ', U.cream], ['3', U.gold], [' YEARS?', U.cream]], sz1 = 92, sz2 = 112;
  for (const pass of [0, 1]) {
    const o = pass ? {} : { stroke: 14, strokeColor: '#140a12' };
    text(g, L1, E.W / 2, y1, { size: sz1, color: U.cream, spacing: 4, glow: pass ? 26 : 0, glowColor: 'rgba(255,140,60,.8)', ...o });
    const ws = parts.map(([str]) => measure(g, str, sz2) + 4 * str.length), tot = ws.reduce((a2, b) => a2 + b, 0); let x = E.W / 2 - tot / 2;
    parts.forEach(([str, col], i) => { const big = str === '3'; text(g, str, x, y2, { size: big ? sz2 * 1.25 : sz2, color: col, align: 'left', spacing: 4, glow: pass ? (big ? 40 : 26) : 0, glowColor: big ? alpha(U.gold, 0.9) : 'rgba(255,140,60,.8)', ...o }); x += ws[i]; });
  }
  g.restore();
}
registerShot('s011', { draw(g, t, info) {
  const st = info.shot.start, tFind = sw('find', st, 0.47);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [140, 200], y: [-60, -70] });
  const P = park(g, t, cam, { season: 'spring', mood: 'dawn', km: 1, fountain: false });
  layer(g, cam, 0.5, (g) => { glow(g, P.CX + 520, P.GY - 420, 560, '#ffcf80', 0.5); FX.sun(g, P.CX + 520, P.GY - 380, 70, '#fff3d8', '#ffc070', 3); });
  FX.godRays(g, E.W * 0.72, E.H * 0.42, { angle: Math.PI * 0.62, spread: 1.6, len: 1500, color: '#ffd9a0', a: 0.1, t, count: 9 });
  layer(g, cam, 1, (g) => {
    // riverside railing on the path edge, Biscuit sitting on it
    const ry = P.GY - 120; seg(g, [[P.CX - 1200, ry], [P.CX + 1400, ry]], 8, '#2a2632'); for (let x = P.CX - 1200; x < P.CX + 1400; x += 160) seg(g, [[x, ry], [x, P.GY - 10]], 7, '#2a2632');
    cat(g, { x: P.CX - 260, y: ry - 2, s: 1.6, facing: 1, pose: 'sit', eyes: t > tFind ? 'glint' : 'auto', t, rim: { color: '#ffc070', dir: [1, -0.4] }, shadow: false });
    const hx = P.CX + 260 + t * 60, R = runCycle(t, 1.25, { mode: 'jog', fatigue: 0 });
    trainee(g, 'HERO', { pose: R.pose, shadow: [0, 34] }, { x: hx, y: P.GY + 30, s: 2.0, facing: 1, t, rim: { color: '#ffc070', dir: [1, -0.45], w: 7 }, expr: exprAt(t, [[0, 'determined'], [tFind, 'smirk']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(1, -0.1), breath: 1.3, cold: true });
  });
  parkFg(g, t, cam, { season: 'spring' });
  FX.fog(g, E.H * 0.55, E.H * 0.25, '#ffe2c8', 0.2);
  atmos(g, t, cam, { color: '#ffe2c0', far: 20, near: 6 });
  titleLockup(g, t, tFind);
} });
