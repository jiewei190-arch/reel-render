// C_s063_s071_night.js — ep 5 batch C part 2: LEVEL 19 morning pop (18 -> 19, 2,560 -> 3,225 kg, the spoon folds, the cup handle snaps),
// then NIGHT TRAINING in the park: walk-in, push-ups, bench squats, MINA times / DEV films, the STEAM AURA (s068 start, s069 low-angle hero
// frame), DEV leans closer, giant face DEV lip-sync "Wait. Is that steam?". bloom + nightGrade LAST on every night shot.
// LEGAL: STYLE.md DON'T list; the hero's eyes never glow (warm brown, the HUD only reflects); the aura is body-heat steam rising UP, never shapes.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS, talkAmount } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { home3, home3Fg } from '../sets/home3.js';
import { parkFg } from '../sets/park.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { morningPop, levelFlash, levelShake, freeze, statCard } from '../sets/statcard.js';
import { steamAura, rimLight, heatHaze, lowAngle, lowAngleWrap, P5 } from '../sets/fx5.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { goldPop, fade, hero, bowl, spoon, benchProp, stopwatch, ringPhone, night, post } from './C_lib.js';

const RIMN = { color: P5.cyan, dir: [0.8, -0.4] };
const mixPose = (a, b, k) => { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; };
// squat with the bench across the shoulders: k 0 standing .. 1 deep
function benchSquat(k) { const p = mixPose(POSES.stand, POSES.crouch, k); return { ...p, eF: [p.sh[0] + 34, p.sh[1] - 2], hF: [p.sh[0] + 22, p.sh[1] - 36], eB: [p.sh[0] - 30, p.sh[1] - 2], hB: [p.sh[0] - 18, p.sh[1] - 36] }; }
const squatK = (t, rate = 1.6) => 0.5 - 0.5 * Math.cos(t * rate * Math.PI);
// plank / push-up: drawn rotated about the hip, head to +x; b 0 arms straight .. 1 bent. Returns the y offset that keeps the hands on the ground.
function plank(b) { return { pose: { head: [2, -208], sh: [0, -174], hip: [0, -100], kF: [1, -50], fF: [0, 0], kB: [-1, -50], fB: [0, -2], eF: [lerp(56, 34, b), lerp(-176, -146, b)], hF: [lerp(76, 46, b), -172], eB: [lerp(52, 30, b), lerp(-178, -150, b)], hB: [lerp(72, 42, b), -176] }, dy: b * 30 }; }
const bench = (g, x, y, s, rot = 0) => benchProp(g, x, y, s, rot);

// s063 LEVEL 19 - NIGHT TRAINING: the morning pop; the spoon folds, the cup handle snaps
registerShot('s063', { draw(g, t, info) {
  const at = 0.05, tf = freeze(t, at + 1.15, 5), sh = levelShake(t, at + 1.15, 3);
  const cam = camMove(tf, info.dur, { z: [1.0, 1.05], drift: 0.4 }); cam.x += sh[0]; cam.y += sh[1];
  const H = home3(g, tf, cam, { room: 'kitchen', mood: 'day', cereal: 0, plate: 0 }), P = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    const hx = P.tableX - 420, pose = idle({ ...POSES.holdFront, hF: [54, -150], eF: [34, -132] }, tf, 2), S2 = 1.9;
    hero(g, { x: hx, y: GY, s: S2, facing: 1, pose, expr: exprAt(tf, [[0, 'neutral'], [1.2, 'joy'], [2.81, 'nervous']]), blink: blinkFlag(tf, 3.2, 2), look: lookToward(1, -0.3), rim: H.rim, t: tf });
    spoon(g, hx + 54 * S2 + 10, GY - 150 * S2, 1.1, ease.outBack(prog(t, 2.81, 3.0)));
    bowl(g, P.tableX, P.tableTop - 6, 1);
    // the mug: its handle snaps off on 'awkward,'
    const mx = P.tableX - 200, my = P.tableTop - 8, sn = prog(t, 3.07, 3.5); rr(g, mx - 34, my - 80, 68, 80, 10); g.fillStyle = '#f0ece2'; g.fill(); g.fillStyle = '#7a4a2a'; g.fillRect(mx - 28, my - 74, 56, 10);
    g.save(); g.translate(mx + 34 + sn * 80, my - 40 + sn * sn * 120); g.rotate(sn * 6); g.strokeStyle = '#f0ece2'; g.lineWidth = 9; g.beginPath(); g.arc(4, 0, 20, -1.3, 1.3); g.stroke(); g.restore();
    morningPop(g, tf, { at, zipX: P.tableX, zipY: P.tableTop - 140, cardX: P.tableX + 330, cardY: P.tableTop - 310, s: 1, lv: [18, 19], str: [2560, 3225], popX: P.tableX - 400, popY: P.tableTop - 380, popS: 0.75 });
  });
  home3Fg(g, tf, cam, { room: 'kitchen' });
  chip(g, t, { str: 'LEVEL 19: NIGHT TRAINING', at: 0.25, x: E.W * 0.5, y: E.H * 0.06, tone: 'gold', dur: info.dur });
  goldPop(g, t, '3,225 kg', 1.95, E.W * 0.74, E.H * 0.13, 64);
  levelFlash(g, t, at + 1.15);
} });

// s064 the night park: the three walk in under the sodium lamps, breath puffs
registerShot('s064', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.94, 1.0], x: [-40, 40], drift: 0.6 }), P = night(g, t, cam), GY = P.GY;
  const w = (x0, sp) => x0 + Math.max(0, t - 0.5) * sp;
  layer(g, cam, 1, (g) => {
    const walkers = [['DEV', w(-300, 300), 1.9, 1], ['MINA', w(-120, 330), 2.0, 2], ['HERO', w(80, 320), 1.9, 3]];
    for (const [who, x, s, sd] of walkers) { const W = walkAlong(x, s, { kid: who === 'MINA' }).pose, pose = who === 'DEV' ? { ...W, ...{ eF: [24, -150], hF: [40, -170] } } : W;
      (who === 'HERO' ? hero : (g, o) => actor(g, who, o))(g, { x, y: GY + 10, s, facing: 1, pose, expr: who === 'MINA' ? 'determined' : 'happy', blink: blinkFlag(t, 3 + sd * 0.2, sd), look: lookToward(1, 0), rim: RIMN, t });
      if (who === 'DEV') ringPhone(g, t, x + 40 * s + 8, GY + 10 - 170 * s, 1, 1);
      const u = (t * 0.7 + sd * 0.3) % 1; glow(g, x + 70 + u * 40, GY - 400 * (s / 1.9) - u * 40, 26 + u * 20, '#e8f2ff', 0.25 * (1 - u)); }
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s065 push-ups under the streetlights (2 reps), a small Stat Card bobbing above
registerShot('s065', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.18, 1.22], x: [140, 150], y: [-60, -60], drift: 0.3 }), P = night(g, t, cam), GY = P.GY;
  const b = 0.5 - 0.5 * Math.cos(Math.max(0, t - 0.1) * Math.PI * 1.1), PL = plank(b), hx = E.W * 0.52 + 140;
  layer(g, cam, 1, (g) => {
    glow(g, hx + 60, GY - 10, 360, P5.sodium, 0.14);
    rimLight(g, (x) => actor(x, 'HERO', { x: hx, y: GY + 32 + PL.dy, s: 1.9, facing: 1, pose: PL.pose, rot: 1.38, expr: 'determined', blink: blinkFlag(t, 3.1, 2), look: [1, 0.2], rim: RIMN, t, shadow: false }), { dir: [0.3, -1], width: 6, a: 0.8 });
    statCard(g, t, { x: hx + 150, y: GY - 330, s: 0.42, lv: 19, str: 3225, xp: 0.2 + t * 0.03, unfold: 1, reflect: 0 });
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s066 squats with the whole park bench, leaves falling off it
registerShot('s066', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-420, -430], y: [-80, -80], drift: 0.3 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  const k = squatK(t + 0.6, 1.4), pose = benchSquat(k), hx = P.pos.benchX, s = 1.9;
  layer(g, cam, 1, (g) => {
    rimLight(g, (x) => hero(x, { x: hx, y: GY + 10, s, facing: 1, pose, expr: k > 0.6 ? 'determined' : 'happy', blink: blinkFlag(t, 3, 2), look: [1, 0], rim: RIMN, t }), { dir: [1, -0.3], width: 6, a: 0.85 });
    const by = GY + 10 + (pose.hF[1] - 6) * s; bench(g, hx, by, 0.85, Math.sin(t * 2) * 0.02);
    for (let i = 0; i < 6; i++) { const u = (t * 0.8 + i / 6) % 1, lx = hx - 180 + i * 70 + Math.sin(t * 3 + i) * 20, ly = by - 20 + u * 360; g.save(); g.translate(lx, ly); g.rotate(t * 3 + i); g.fillStyle = alpha(['#c8743a', '#e0a040', '#a8502a'][i % 3], 1 - u); g.beginPath(); g.ellipse(0, 0, 12, 6, 0, 0, 7); g.fill(); g.restore(); }
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s067 MINA times (stopwatch '00:47'), DEV films (ring light); HERO squatting the bench behind
registerShot('s067', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.08], x: [0, 20], y: [-30, -30], drift: 0.4 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  layer(g, cam, 0.85, (g) => { const k = squatK(t, 1.4), pose = benchSquat(k), hx = E.W * 0.52, s = 1.4; hero(g, { x: hx, y: GY - 40, s, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3, 2), look: [1, 0], rim: RIMN, t }); bench(g, hx, GY - 40 + (pose.hF[1] - 6) * s, 0.63); });
  layer(g, cam, 1, (g) => {
    const mx = E.W * 0.26, ms = 2.0, mp = idle({ ...POSES.holdFront, hF: [44, -150], eF: [26, -128] }, t, 1), tick = t > 0.44;
    actor(g, 'MINA', { x: mx, y: GY + 20, s: ms, facing: 1, pose: mp, expr: exprAt(t, [[0, 'neutral'], [0.44, 'determined']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(0.3, 0.6), rim: { color: P5.sodium, dir: [-0.8, -0.4] }, t });
    stopwatch(g, t, mx + 44 * ms * 0.72 + 14, GY + 20 - 150 * ms * 0.72 - 14, 0.9, 47 + (tick ? (t - 0.44) : 0), tick);
    const dx = E.W * 0.78, dp = idle({ ...POSES.phone, eF: [26, -150], hF: [42, -176] }, t, 3);
    actor(g, 'DEV', { x: dx, y: GY + 20, s: 1.9, facing: -1, pose: dp, expr: exprAt(t, [[0, 'neutral'], [1.68, 'happy']]), blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, -0.1), rim: { color: P5.sodium, dir: [0.8, -0.4] }, t });
    ringPhone(g, t, dx - 42 * 1.9 - 8, GY + 20 - 176 * 1.9, 1.1, t > 1.68 ? 1 : 0.4);
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s068 as the night gets colder, the first wisps of the steam aura lift off his shoulders
registerShot('s068', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.26], x: [-60, -50], y: [-120, -130], drift: 0.3 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  const k = squatK(t, 1.2), pose = benchSquat(k), hx = E.W * 0.47, s = 1.9, aura = 0.5 * ease.inOut(prog(t, 0.83, info.dur));
  layer(g, cam, 1, (g) => {
    rimLight(g, (x) => hero(x, { x: hx, y: GY + 10, s, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3, 2), look: [1, 0], rim: RIMN, t, trimGlow: aura }), { dir: [1, -0.3], width: 6, a: 0.85 });
    bench(g, hx, GY + 10 + (pose.hF[1] - 6) * s, 0.85);
    steamAura(g, t, { x: hx, y: GY + 10, h: 206 * s, k: aura, cyan: 0.85, amber: 0.35 });
    const mp = { ...POSES.holdFront, hF: [44, -150], eF: [26, -128] }; actor(g, 'MINA', { x: hx + 560, y: GY + 20, s: 2.0, facing: -1, pose: mp, expr: exprAt(t, [[0, 'neutral'], [1.97, 'surprised']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, -0.4), rim: { color: P5.sodium, dir: [0.8, -0.4] }, t });
    stopwatch(g, t, hx + 560 - 44 * 2 * 0.72 - 14, GY + 20 - 150 * 2 * 0.72 - 14, 0.9, 52, t < 1.97);
  });
  g.save(); g.globalCompositeOperation = 'source-over'; g.fillStyle = alpha('#bfe0ff', 0.1 * prog(t, 0, info.dur)); g.fillRect(0, 0, E.W, E.H); g.restore();   // the frost tint creeping in
  parkFg(g, t, cam, { season: 'autumn' }); heatHaze(g, t, E.W * 0.36, E.H * 0.05, E.W * 0.22, E.H * 0.6, { amp: 2 * aura * 2 }); post(g);
} });

// s069 THE AURA: the low-angle hero frame (as DEMO_fx5 demo_fx_aura) - steam lit cyan from below, amber from the lamp; eyes stay brown
registerShot('s069', { draw(g, t, info) {
  const cam = lowAngle(t, info.dur, { z: [1.0, 1.1], lift: 120 }); let P;
  lowAngleWrap(g, 1, E.H * 0.8, () => { P = night(g, t, cam, { bench: false }); });
  const GY = P.GY, hx = E.W * 0.48, s = 2.1, k = lerp(0.5, 1, ease.inOut(prog(t, 0, 1.2))), pose = idle({ ...POSES.stand, eF: [16, -136], hF: [24, -102], eB: [-14, -136], hB: [-20, -102] }, t, 2);
  layer(g, cam, 1, (g) => lowAngleWrap(g, 1, GY, () => {
    glow(g, hx, GY - 10, 300, P5.cyan, 0.14 * k);
    rimLight(g, (x) => hero(x, { x: hx, y: GY + 10, s, facing: 1, pose, expr: 'determined', blink: blinkFlag(t, 3.4, 2), look: [0.6, -0.2], rim: RIMN, t, trimGlow: k }), { dir: [1, -0.25], width: 7, a: 0.95, back: { width: 5, a: 0.4 } });
    statCard(g, t, { x: hx + 300, y: GY - 120, s: 0.4, lv: 19, str: 3225, xp: 0.4, unfold: 1, reflect: 0 });
    steamAura(g, t, { x: hx, y: GY + 10, h: 206 * s, k, cyan: 0.85, amber: 0.35 });
  }));
  heatHaze(g, t, E.W * 0.36, E.H * 0.04, E.W * 0.24, E.H * 0.6, { amp: 2.5 * k }); post(g, { bloom: 0.9, violet: 0.4 });
} });

// s070 DEV leans closer, his ring light on the steaming shoulder
registerShot('s070', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.24], x: [40, 60], y: [-120, -130], drift: 0.3 }), P = night(g, t, cam, { bench: false }), GY = P.GY;
  const hx = E.W * 0.42, s = 1.9, lean = ease.inOut(prog(t, 0.1, 1.2)), dx = lerp(E.W * 0.86, E.W * 0.7, lean);
  layer(g, cam, 1, (g) => {
    hero(g, { x: hx, y: GY + 10, s, facing: 1, pose: idle(POSES.relaxed, t, 2), expr: 'neutral', blink: blinkFlag(t, 3.2, 2), look: [1, -0.1], rim: RIMN, t, trimGlow: 1 });
    steamAura(g, t, { x: hx, y: GY + 10, h: 206 * s, k: 1, cyan: 0.85, amber: 0.35 });
    const dp = { ...POSES.phone, head: [16, -200], sh: [10, -170], eF: [34, -150], hF: [52, -176] };
    actor(g, 'DEV', { x: dx, y: GY + 10, s: 1.9, facing: -1, pose: dp, expr: 'thinking', blink: blinkFlag(t, 3.3, 2), look: lookToward(-1, 0.1), rim: { color: P5.sodium, dir: [0.8, -0.4] }, t });
    ringPhone(g, t, dx - 52 * 1.9 - 8, GY + 10 - 176 * 1.9, 1.1, 1);
    glow(g, hx + 30, GY + 10 - 170 * s, 140, '#fff4e0', 0.25);
  });
  parkFg(g, t, cam, { season: 'autumn' }); post(g);
} });

// s071 GIANT FACE DEV, lip-sync "Wait. Is that steam?" only; steam wisps drift across, the ring light in his eyes
registerShot('s071', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [P5.ink, P5.navy, '#1c2440']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W * 0.15, E.H * 0.2, 700, P5.sodium, 0.18); glow(g, E.W * 0.9, E.H * 0.7, 700, P5.cyan, 0.12);
  const z = lerp(1, 1.05, ease.inOut(t / info.dur)), cx = E.W * 0.5, cy = E.H * 0.56, r = 330 * z;
  const f = { ...faceAt(t, [[0, 'squint'], [1.27, 'awe'], [1.63, 'delighted']]) }; f.open = Math.max(f.open, talkAmount(info.shot.start + t) * 0.8);
  giantFace(g, cx, cy, r, { who: 'DEV', f, rimSide: -1, rimColor: P5.sodium, glint: '#fff4e0', blink: blinkAmt(t, 2.8, 3), breath: Math.sin(t * 2.4), tilt: lerp(0.02, -0.03, ease.inOut(t / info.dur)) });
  for (const sd of [-1, 1]) circle(g, cx + sd * r * 0.34 - r * 0.06, cy - r * 0.08, r * 0.035, alpha('#fffaf0', 0.85));          // the ring light reflected in his eyes
  steamAura(g, t, { x: E.W * 0.85, y: E.H * 1.25, h: 900, k: 0.9, cyan: 0.9, amber: 0.2, points: [[E.W * 0.78, E.H * 1.0], [E.W * 0.9, E.H * 0.95], [E.W * 0.12, E.H * 1.05]] });
  post(g, { bloom: 0.6 });
} });
