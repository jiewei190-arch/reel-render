// DEMO_train.js — sheet-check of sets/train.js (the EXERCISE RIG). Temporary ids demo_*; nothing here is bound to a real shot id.
//   demo_push   push-ups that fail at 23: fatigue stall, tremble, hip sag, collapse "flump" into the floor, gold rep counter, sweat + breath
//   demo_knees  knee push-ups, Biscuit hops up and loafs on the hero's back (rides every rep)
//   demo_situp  sit-ups, Mina holds the feet, stopwatch ticking
//   demo_squat  deep slow squats with a textbook backpack on the court, Dev unimpressed
//   demo_run    jog that decays into a walk, foot phase locked to x, follow cam, stopwatch hits 1:20:00
//   demo_punch  guard > wind-up > punch into a pillow Dev holds: squash, wobble, feathers, FLUMP, impact frame + shake
//   demo_sore   day two: arms too sore to lift a hairbrush, Mina watching
import { E, registerShot, layer, ease, prog, key, clamp, lerp, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { street, streetFg } from '../sets/street.js';
import { court, courtFg } from '../sets/court.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { impactFrame, jumpShake } from '../sets/jump.js';
import { pushUp, kneePushUp, sitUp, squat, runCycle, soreStand, punchPose, trainee, pillow, repCounter, stopwatch, PUNCH_POSES } from '../sets/train.js';

const shaken = (cam, t, tHit, amp = 14) => { const [dx, dy] = jumpShake(t, tHit, amp); return { ...cam, x: cam.x + dx, y: cam.y + dy }; };

// ---------------------------------------------------------------------------------------------------
registerShot('demo_push', { draw(g, t, info) {
  const rate = 0.85, tCol = 5.6, tFat = 3.2, fat = clamp((t - tFat) / 2);
  const R = pushUp(t, rate, { from: 19, fatigue: fat, tremble: fat, sag: fat * 0.7, collapse: tCol });
  let cam = camMove(t, info.dur, { z: [1.3, 1.42], x: [300, 340], y: [130, 150] });
  if (R.collapsed) cam = shaken(cam, t, tCol + 0.2, 10);
  const A = apartment(g, t, cam, { power: 1, mood: 'night' });
  const hx = A.CX + 250;
  layer(g, cam, 1, (g) => {
    cat(g, { x: A.CX + 640, y: A.GY, s: 1.9, facing: -1, pose: 'sit', eyes: R.collapsed ? 'wide' : 'auto', t, rim: A.rim });
    trainee(g, 'HERO', R, { x: hx, y: A.GY, s: 2.2, facing: 1, t, rim: A.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.5),
      expr: exprAt(t, [[0, 'determined'], [tFat, 'nervous'], [tFat + 1.4, 'worried'], [tCol + 0.15, 'shocked'], [tCol + 1, 'sad']]),
      sweat: 0.2 + fat * 0.8, breath: 1.1 + fat });
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M.key });
  repCounter(g, R.n, { since: R.since, label: 'PUSH-UPS', of: 100, x: E.W - 300, y: 200, size: 150 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_knees', { draw(g, t, info) {
  const R = kneePushUp(t, 0.7, { from: 31, tremble: 0.35, sag: 0.3 }), tJ = 1.8, tOn = tJ + 0.55;
  const cam = camMove(t, info.dur, { z: [1.38, 1.3], x: [330, 290], y: [140, 130] });
  const A = apartment(g, t, cam, { power: 1, mood: 'night' });
  const hx = A.CX + 250, s = 2.2;
  layer(g, cam, 1, (g) => {
    const onBack = t >= tOn;
    const H = trainee(g, 'HERO', R, { x: hx, y: A.GY, s, facing: 1, t, rim: A.rim, blink: blinkFlag(t, 3.4, 2), look: lookToward(0.6, onBack ? -0.6 : 0.4),
      expr: exprAt(t, [[0, 'determined'], [tOn + 0.1, 'confused'], [tOn + 1.2, 'determined']]), sweat: 0.6, breath: 1.3,
      cat: onBack ? { pose: 'loaf', eyes: 'offended', s: 0.78, facing: -1 } : null });
    if (!onBack) {                                    // the hop: floor -> arc -> back
      const k = prog(t, tJ, tOn), x0 = A.CX + 640, y0 = A.GY, [x1, y1] = H.back;
      const x = lerp(x0, x1, ease.inOut(k)), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 170;
      cat(g, { x, y, s: s * 0.78, facing: -1, pose: k > 0 && k < 1 ? 'stand' : 'sit', walk: k * 6, t, rim: A.rim });
    }
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M.key });
  repCounter(g, R.n, { since: R.since, label: 'ON YOUR KNEES', of: 100, x: E.W - 320, y: 200, size: 140 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_situp', { draw(g, t, info) {
  const R = sitUp(t, 0.75, { from: 40, fatigue: clamp((t - 2.5) / 2) * 0.8, tremble: clamp((t - 2.5) / 2) * 0.6 });
  const cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [380, 400], y: [120, 130] });
  const A = apartment(g, t, cam, { power: 1, mood: 'night' });
  const hx = A.CX + 300, s = 2.2, feetX = hx + 78 * s;
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: feetX + 120, y: A.GY, s: 2.1, facing: -1, pose: idle(POSES.kneel, t, 4), t, rim: A.rim, blink: blinkFlag(t, 2.9, 4),
      expr: exprAt(t, [[0, 'smile'], [3.2, 'surprised'], [4.2, 'happy']]), look: lookToward(-1, 0.3) });
    trainee(g, 'HERO', R, { x: hx, y: A.GY, s, facing: 1, t, rim: A.rim, blink: blinkFlag(t, 3.3, 3), look: lookToward(1, 0),
      expr: exprAt(t, [[0, 'determined'], [3, 'nervous']]), sweat: 0.5 + clamp((t - 2.5) / 2) * 0.5, breath: 1.2 });
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M.key });
  stopwatch(g, 13 * 60 + 5 + t * 1, { x: 210, y: 230, r: 120 });
  repCounter(g, R.n, { since: R.since, label: 'SIT-UPS', of: 100, x: E.W - 300, y: 200, size: 150 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_squat', { draw(g, t, info) {
  const R = squat(t, 0.42, { from: 7, load: 1, tremble: 0.5 });
  const cam = camMove(t, info.dur, { z: [1.18, 1.26], x: [-260, -230], y: [-30, -40] });
  const C = court(g, t, cam, { mood: 'day', hoopFt: 10 });
  const hx = C.CX - 300;
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: hx - 330, y: C.GY, s: 1.95, facing: 1, pose: idle(POSES.crossArms, t, 6), t, rim: C.rim, blink: blinkFlag(t, 3.6, 6),
      expr: exprAt(t, [[0, 'smirk'], [2.6, 'surprised'], [3.4, 'smirk']]), look: lookToward(1, 0.1) });
    trainee(g, 'HERO', R, { x: hx, y: C.GY, s: 2.05, facing: -1, t, rim: C.rim, blink: blinkFlag(t, 3.1, 7), look: lookToward(-1, 0),
      expr: exprAt(t, [[0, 'determined'], [2.4, 'nervous']]), backpack: 1, sweat: 0.7, breath: 1.0 });
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
  repCounter(g, R.n, { since: R.since, label: 'SQUATS', of: 100, x: E.W - 300, y: 200, size: 150 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_run', { draw(g, t, info) {
  const s = 1.95, tWalk = 2.2, x0 = 0;
  // distance: jog speed until tWalk, then decelerates into a walk (x is integrated so the feet stay locked)
  const vJ = 330, vW = 160, xAt = (tt) => tt < tWalk ? vJ * tt : vJ * tWalk + vW * (tt - tWalk) + (vJ - vW) * 0.5 * Math.min(tt - tWalk, 0.8) * (1 - Math.min(tt - tWalk, 0.8) / 1.6);
  const x = x0 + xAt(t);
  const S0 = { x: 0, y: 0 };
  const cam = camMove(t, info.dur, { z: [1.16, 1.2], y: [-60, -70] });
  cam.x += x - 140;
  const St = street(g, t, cam, { power: 1, mood: 'night' });
  const hx = St.CX + x - 120;
  const k = ease.inOut(prog(t, tWalk - 0.2, tWalk + 0.6));
  const Rj = runCycle(t, 0, { mode: 'jog', x: hx, s, facing: 1, fatigue: 0.5 }), Rw = runCycle(t, 0, { mode: 'walk', x: hx, s, facing: 1, fatigue: 0.9 });
  const pose = {}; for (const kk in Rj.pose) pose[kk] = [lerp(Rj.pose[kk][0], Rw.pose[kk][0], k), lerp(Rj.pose[kk][1], Rw.pose[kk][1], k)];
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', { pose, shadow: [0, 38] }, { x: hx, y: St.GY, s, facing: 1, t, rim: St.rim, blink: blinkFlag(t, 3.0, 8), look: lookToward(1, 0.15 + k * 0.3),
      expr: exprAt(t, [[0, 'determined'], [tWalk, 'sad']]), sweat: 0.9, breath: 1.8 - k * 0.6 });
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: St.M.key });
  const sec = 80 * 60 - 6 + t * (6 / 3.2);                               // the stopwatch lands on 1:20:00 near the end
  stopwatch(g, Math.min(sec, 80 * 60), { x: 220, y: 240, r: 125, alarm: sec >= 80 * 60 ? 1 : 0 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_punch', { draw(g, t, info) {
  const hits = [1.5, 3.9], tHit = hits.filter((h) => t >= h).pop() ?? -9;
  let cam = camMove(t, info.dur, { z: [1.2, 1.26], x: [0, 20], y: [-30, -40] });
  cam = shaken(cam, t, tHit, 16);
  const A = apartment(g, t, cam, { power: 1, mood: 'night' });
  const sH = 2.0, sD = 1.95, push = tHit > 0 ? Math.exp(-(t - tHit) * 5) * Math.sin(Math.min(1, (t - tHit) * 6) * Math.PI / 2) * 26 : 0;
  const devX = A.CX + 300 + push, devHand = [devX - 36 * sD, A.GY - 152 * sD];
  const px = devHand[0] - 70, py = devHand[1] + 4, pw = 92 * 1.9;
  const heroX = px - pw / 2 - 89 * sH + 18;
  const P = punchPose(t, t < 2.8 ? hits[0] : hits[1], {});
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: devX, y: A.GY, s: sD, facing: -1, pose: idle(POSES.holdFront, t, 9), t, rim: A.rim, blink: blinkFlag(t, 3.5, 9), look: lookToward(-1, 0),
      expr: exprAt(t, [[0, 'nervous'], [hits[0], 'shocked'], [hits[0] + 0.9, 'nervous'], [hits[1], 'shocked']]) });
    pillow(g, t, { x: px, y: py, s: 1.9, hit: hits, dir: 1, rim: A.rim });
    trainee(g, 'HERO', { pose: P.pose, shadow: [6, 44] }, { x: heroX, y: A.GY, s: sH, facing: 1, t, rim: A.rim, blink: blinkFlag(t, 3.2, 10), look: lookToward(1, 0),
      expr: exprAt(t, [[0, 'determined'], [hits[0] - 0.4, 'angry'], [hits[0] + 0.4, 'smirk'], [hits[1] - 0.4, 'angry'], [hits[1] + 0.4, 'smirk']]), sweat: 0.3 });
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M.key });
  for (const h of hits) impactFrame(g, t, h, { x: E.W * 0.52, y: E.H * 0.42 });
} });

// ---------------------------------------------------------------------------------------------------
registerShot('demo_sore', { draw(g, t, info) {
  const lift = key(t, [[0.5, 0], [1.6, 0.75], [2.0, 0.7], [2.3, 0.1]]);
  const cam = camMove(t, info.dur, { z: [1.22, 1.3], x: [-120, -100], y: [-100, -110] });
  const A = apartment(g, t, cam, { power: 1, mood: 'night' });
  const hx = A.CX - 140, s = 2.0, pose = soreStand(t, { lift });
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: hx + 360, y: A.GY, s: 2.15, facing: -1, pose: idle(POSES.crossArms, t, 11), t, rim: A.rim, blink: blinkFlag(t, 2.8, 11),
      expr: exprAt(t, [[0, 'neutral'], [2.3, 'smirk']]), look: lookToward(-1, -0.2) });
    const H = trainee(g, 'HERO', { pose, shadow: [0, 40] }, { x: hx, y: A.GY, s, facing: 1, t, rim: A.rim, blink: blinkFlag(t, 3.3, 12), look: lookToward(0.4, -0.7 * lift),
      expr: exprAt(t, [[0, 'worried'], [1.1, 'nervous'], [2.3, 'cry']]) });
    // the hairbrush in the near hand
    const [bx, by] = H.hand; g.save(); g.translate(bx, by); g.rotate(-0.9 - lift * 0.8);
    g.fillStyle = '#a0582e'; g.fillRect(-6, -10, 12, 46); g.fillStyle = '#2a2230'; g.beginPath(); g.ellipse(0, -30, 16, 26, 0, 0, 7); g.fill();
    g.fillStyle = '#e8e2f2'; for (let i = 0; i < 12; i++) g.fillRect(-11 + (i % 4) * 7, -48 + Math.floor(i / 4) * 12, 3, 6); g.restore();
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M.key });
} });
