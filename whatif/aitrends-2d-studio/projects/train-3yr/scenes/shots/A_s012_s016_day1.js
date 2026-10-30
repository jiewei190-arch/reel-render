// A_s012_s016_day1.js — batch A, DAY 1 (33.69-50.51): drop to the mat, 23 push-ups and the collapse, tiny sets + knees,
// Biscuit on the back, the 1:20:00 run that turns into a walk.
import { E, S, registerShot, layer, ease, prog, key, clamp, lerp, alpha, shade, glow, text, FONTS, rr, seg, circle, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose, walkPose } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { chip } from '../sets/hud.js';
import { home3, home3Fg, timeSkip } from '../sets/home3.js';
import { park, parkFg } from '../sets/park.js';
import { impactFrame, jumpShake } from '../sets/jump.js';
import { pushUp, kneePushUp, runCycle, trainee, repCounter, stopwatch } from '../sets/train.js';
import { sw } from './A_lib.js';

const shakeCam = (cam, t, t0, amp) => { const [dx, dy] = jumpShake(t, t0, amp); return { ...cam, x: cam.x + dx, y: cam.y + dy }; };
const mixR = (a, b, k) => ({ ...b, pose: blendPose(a.pose, b.pose, k) });
const wobbleCounter = (g, n, o, t, t0) => {           // a counter that wobbles (rotation spring) after t0
  const u = t - t0, w = u > 0 ? Math.exp(-u * 3) * Math.sin(u * 14) * 0.12 : 0;
  g.save(); g.translate(o.x, o.y); g.rotate(w); repCounter(g, n, { ...o, x: 0, y: 0 }); g.restore();
};

// ===================================================================================================
// s012 — "Day one. Push-ups first."  DAY 1 card flips in top-left on "Day"; HERO drops from standing into the plank on "Push-ups";
// the calendar gets its first red X on "first". Low side camera.
registerShot('s012', { draw(g, t, info) {
  const st = info.shot.start, tDay = sw('day', st, 0.15), tPU = sw('push', st, 0.57), tFirst = sw('first', st, 1.69);
  const cam = camMove(t, info.dur, { z: [1.26, 1.32], x: [10, 40], y: [60, 66] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: t >= tFirst ? 1 : 0, month: 'MARCH', hl: t >= tFirst ? 1 : 0 });
  const hx = H.pos.matX - 40, s = 2.0;
  layer(g, cam, 1, (g) => {
    const plank = pushUp(0, 1).pose, k1 = prog(t, tPU - 0.1, tPU + 0.2), k2 = prog(t, tPU + 0.2, tPU + 0.55);
    let pose = idle(POSES.stand, t, 2);
    if (k1 > 0) pose = blendPose(pose, POSES.crouch, k1);
    if (k2 > 0) pose = blendPose(POSES.crouch, plank, k2);
    const R = t > tPU + 0.55 ? pushUp(t - tPU - 0.55, 0.9) : { pose, shadow: k2 > 0.5 ? [-10, 90] : [0, 40] };
    trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s, facing: 1, t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [tFirst, 'joy']]), blink: blinkFlag(t, 3.4, 1), look: k2 > 0.5 ? lookToward(1, 0.3) : lookToward(1, -0.1), breath: k2 > 0.5 ? 1.1 : 0 });
    if (t >= tFirst) { const u = t - tFirst; if (u < 0.5) FX.sparkle(g, H.pos.calX - 134, H.pos.calY + 76, 34 * (1 - u / 0.5), '#ff8a7a', 0.9); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
  timeSkip(g, t, { x: 260, y: 70, s: 0.42, keys: [[tDay, 'DAY 1']] });
} });

// ===================================================================================================
// s013 — "You hit twenty-three, and your arms just... stop."  the counter races 1..23 (sped-up set), then rep 24 stalls: tremble ramps
// from "arms", sweat flies; on "stop" the arms give out (face-plant), counter frozen at 23 and wobbling, punch-in + shake.
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, t23 = sw('twenty', st, 0.51), tArms = sw('arms', st, 1.53), tStop = sw('stop', st, 3.05), tSlow = t23 + 0.35;
  let cam = camMove(t, info.dur, { z: [1.26, 1.32], x: [10, 30], y: [60, 66] });
  if (t > tStop) { cam.z += 0.08 * ease.out(prog(t, tStop, tStop + 0.15)); cam = shakeCam(cam, t, tStop + 0.12, 8); }
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 1, month: 'MARCH' });
  const hx = H.pos.matX - 40, s = 2.0, fat = clamp((t - tArms + 0.4) / 1.2);
  let R, n;
  if (t < tSlow) { R = pushUp(t, 2.6); n = 1 + Math.floor(22 * ease.out(clamp(t / tSlow))); }
  else { R = pushUp(t - tSlow, 0.3, { fatigue: 1, tremble: fat, sag: fat * 0.8, collapse: tStop - tSlow }); n = 23; }
  const since = t < tSlow ? ((t * 9) % 1) / 9 : t - tSlow;
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s, facing: 1, t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [tArms, 'worried'], [tStop + 0.1, 'shocked']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.4), sweat: 0.3 + fat * 0.7, breath: 1.4 + fat });
    if (t > tStop + 0.12 && t < tStop + 0.6) { const u = (t - tStop - 0.12) / 0.48; for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; seg(g, [[hx + 130 * s + Math.cos(a) * (40 + u * 90), H.GY + 20 + Math.sin(a) * (20 + u * 50)], [hx + 130 * s + Math.cos(a) * (70 + u * 110), H.GY + 20 + Math.sin(a) * (34 + u * 60)]], 5, alpha('#fff6dc', 1 - u)); } }
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
  wobbleCounter(g, n, { x: 400, y: 250, size: 170, since, label: 'PUSH-UPS', of: 100 }, t, tStop);
  impactFrame(g, t, tStop + 0.12, { x: E.W * 0.6, y: E.H * 0.72 });
} });

// ===================================================================================================
// s014 — "You finish the rest in tiny sets, then on your knees."  3 reps, flop, back up, 3 more, then knee push-ups on "knees";
// the counter runs 24..60 in bursts, then 61..100 on the knees. Chip 'TINY SETS' on "tiny".
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tTiny = sw('tiny', st, 1.19), tKnees = sw('knees', st, 2.45);
  const cam = camMove(t, info.dur, { z: [1.28, 1.3], x: [30, 0], y: [60, 64] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 1, month: 'MARCH' });
  const hx = H.pos.matX - 40, s = 2.0, rate = 3.2;
  // set 1 (0-0.94: 3 reps) > flop (0.94-1.3) > push back up (1.3-1.55) > set 2 (1.55-2.49: 3 reps) > shift to the knees (to tKnees+0.2) > knee reps
  const tF = 0.94, tUp = 1.3, tS2 = 1.55, tS2e = tS2 + 0.94;
  let R;
  if (t < tF) R = pushUp(t, rate, { sag: 0.3 });
  else if (t < tUp) R = pushUp(t, rate, { sag: 0.4, collapse: tF });
  else if (t < tS2) R = mixR(pushUp(tUp, rate, { collapse: tF }), pushUp(0, rate), prog(t, tUp, tS2));
  else if (t < Math.min(tS2e, tKnees - 0.15)) R = pushUp(t - tS2, rate, { sag: 0.5, tremble: 0.4 });
  else if (t < tKnees + 0.2) R = mixR(pushUp(Math.min(tS2e, tKnees - 0.15) - tS2, rate, { sag: 0.5 }), kneePushUp(0, 2), prog(t, tKnees - 0.15, tKnees + 0.2));
  else R = kneePushUp(t - tKnees - 0.2, 2.2, { tremble: 0.35, sag: 0.3 });
  // counter: 23 -> 60 in two bursts, then 61 -> 100 on the knees
  const c1 = 23 + Math.floor(18 * ease.out(prog(t, 0.05, tF))), c2 = 41 + Math.floor(19 * ease.out(prog(t, tS2, tKnees - 0.1))), c3 = 60 + Math.floor(40 * ease.inOut(prog(t, tKnees + 0.2, info.dur - 0.15)));
  const n = t < tS2 ? c1 : t < tKnees + 0.2 ? c2 : c3, ticking = (t < tF) || (t > tS2 && t < tKnees - 0.1) || (t > tKnees + 0.2 && n < 100);
  layer(g, cam, 1, (g) => {
    trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s, facing: 1, t, rim: H.rim, expr: exprAt(t, [[0, 'sad'], [tF, 'cry'], [tS2, 'nervous'], [tKnees, 'determined']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0.4), sweat: 0.8, breath: 1.8 });
    if (t > tF + 0.12 && t < tF + 0.5) FX.dust(g, t, { count: 10, color: '#e8d8c0', a: 0.4 * (1 - (t - tF - 0.12) / 0.38), seed: 4 });
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
  repCounter(g, n, { x: 400, y: 250, size: 170, since: ticking ? ((t * 11) % 1) / 11 : 9, label: t > tKnees ? 'ON YOUR KNEES' : 'PUSH-UPS', of: 100 });
  chip(g, t, { str: 'TINY SETS', at: tTiny, x: E.W * 0.22, y: E.H * 0.84, dur: tKnees + 0.2 });
} });

// ===================================================================================================
// s015 — "Biscuit sits on your back to help."  Biscuit hops up on "sits" and loafs on his back mid knee push-up, riding the reps;
// offended slow blink on "help"; his arms tremble harder, the counter wobbles.
registerShot('s015', { draw(g, t, info) {
  const st = info.shot.start, tSits = sw('sits', st, 0.37), tHelp = sw('help', st, 1.29), tOn = tSits + 0.4;
  const cam = camMove(t, info.dur, { z: [1.32, 1.38], x: [300, 310], y: [120, 125] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 1, month: 'MARCH' });
  const hx = H.pos.matX - 40, s = 2.0, onBack = t >= tOn, tr = onBack ? 0.6 + 0.4 * clamp((t - tOn) / 0.6) : 0.3;
  const R = kneePushUp(t, onBack ? 0.9 : 1.6, { tremble: tr, sag: onBack ? 0.6 : 0.3 });
  const eyes = t > tHelp && t < tHelp + 0.35 ? 'blink' : onBack ? 'offended' : 'auto';
  layer(g, cam, 1, (g) => {
    const Hh = trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s, facing: 1, t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [tOn, 'shocked'], [tOn + 0.5, 'cry']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(-0.3, -1), sweat: 0.9, breath: 2,
      cat: onBack ? { pose: 'loaf', eyes, s: 0.9, facing: -1 } : null });
    if (!onBack) {
      const k = prog(t, tSits - 0.05, tOn), x0 = hx + 520, y0 = H.GY + 30, [x1, y1] = Hh.back;
      cat(g, { x: lerp(x0, x1, ease.inOut(k)), y: lerp(y0, y1, k) - Math.sin(k * Math.PI) * 190, s: 1.8, facing: -1, pose: k > 0 && k < 1 ? 'stand' : 'sit', walk: k * 6, t, rim: H.rim });
    } else if (t < tOn + 0.25) { const u = (t - tOn) / 0.25; FX.dust(g, t, { count: 6, color: '#e8d8c0', a: 0.4 * (1 - u), seed: 8 }); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' });
  atmos(g, t, cam, { color: '#ffd8b0', far: 16, near: 5 });
  wobbleCounter(g, 87 + Math.floor(clamp(t / info.dur) * 3), { x: 400, y: 240, size: 150, since: 9, label: 'ON YOUR KNEES', of: 100 }, t, tOn);
} });

// ===================================================================================================
// s016 — "The run takes an hour and twenty minutes. A lot of it is walking."  DAY 1 RUN, spring day, km 3. Jog > walk on "walking";
// the stopwatch lands on 1:20:00 on "twenty minutes"; an old man with a dog (purple cap) overtakes him.
function dog(g, x, gy, s, t, phase) {
  const sg = (a) => Math.sin(phase + a) * 7, wag = Math.sin(t * 14) * 0.5;
  g.save(); g.translate(x, gy); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 40, 6, 0, 0, 7); g.fill();
  const c = '#c48a4a', d = shade(c, -0.3);
  for (const [lx, a, col] of [[-22, Math.PI, d], [18, 0, d], [-16, 0, c], [24, Math.PI, c]]) seg(g, [[lx, -30], [lx + sg(a), -14], [lx + sg(a) * 1.3, 0]], 7, col);
  g.fillStyle = c; g.beginPath(); g.ellipse(0, -36, 34, 15, 0, 0, 7); g.fill();
  g.save(); g.translate(-32, -42); g.rotate(-0.9 + wag); seg(g, [[0, 0], [-8, -18], [-4, -30]], 6, c); g.restore();
  g.fillStyle = c; g.beginPath(); g.ellipse(36, -54, 16, 13, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(50, -50, 11, 7, 0, 0, 7); g.fill();
  circle(g, 60, -51, 4, '#1a1418'); circle(g, 40, -58, 3, '#1a1418'); circle(g, 41, -59, 1, '#fff');
  g.fillStyle = d; g.beginPath(); g.ellipse(28, -50, 6, 13, 0.4, 0, 7); g.fill();
  seg(g, [[24, -44], [36, -42]], 5, '#2f6fd0');
  g.restore();
}
registerShot('s016', { draw(g, t, info) {
  const st = info.shot.start, tTw = sw('twenty', st, 1.43), tMin = sw('minutes', st, 1.69), tWalk = sw('walking', st, 3.37);
  // hero distance: jog at 280 u/s, eases to a 110 u/s shuffle from just before "walking"
  const vJ = 280, vW = 110, tb = tWalk - 0.3, ramp = 0.6;
  const hxAt = (tt) => tt < tb ? vJ * tt : vJ * tb + vW * (tt - tb) + (vJ - vW) * (Math.min(tt - tb, ramp) - Math.min(tt - tb, ramp) ** 2 / (2 * ramp));
  const s = 1.9, X0 = E.W / 2 - 200, hx = X0 + hxAt(t), mx = X0 - 300 + 360 * t;
  const cam = camMove(t, info.dur, { z: [1.08, 1.12], y: [-60, -66] }); cam.x += hx - X0 - 40;
  const P = park(g, t, cam, { season: 'spring', mood: 'day', km: 3 });
  layer(g, cam, 1, (g) => {
    const k = ease.inOut(prog(t, tb, tb + ramp));
    const Rj = runCycle(t, 0, { mode: 'jog', x: hx, s, fatigue: 0.4 }), Rw = runCycle(t, 0, { mode: 'walk', x: hx, s, fatigue: 1 });
    const pose = blendPose(Rj.pose, Rw.pose, k);
    // the old man + dog (he walks briskly: walkAlong keeps his feet locked)
    const om = { top: 'tshirt', color: '#7a6a5a', legs: '#4a4a52', head: 'cap', headColor: '#9a5ad6' };
    const wp = walkAlong(mx, 1.8, { facing: 1 }).pose, stoop = { ...wp, head: [wp.head[0] + 8, wp.head[1] + 6], sh: [wp.sh[0] + 5, wp.sh[1] + 4], hF: [30, -126], eF: [16, -140] };
    const leash = [mx + 30 * 1.8, P.GY + 26 - 126 * 1.8], dx = mx + 180;
    dog(g, dx, P.GY + 34, 1.5, t, mx / 40);
    seg(g, [leash, [(leash[0] + dx + 60) / 2, leash[1] + 90], [dx + 40, P.GY + 34 - 70]], 2.5, '#2a2230');
    actor(g, om, { x: mx, y: P.GY + 26, s: 1.8, facing: 1, pose: stoop, expr: t > tWalk ? 'smirk' : 'smile', blink: blinkFlag(t, 3.7, 9), look: t > tWalk ? lookToward(1, 0.2) : lookToward(1, 0), rim: P.rim, t });
    trainee(g, 'HERO', { pose, shadow: [0, 36] }, { x: hx, y: P.GY + 36, s, facing: 1, t, rim: P.rim, expr: exprAt(t, [[0, 'determined'], [tMin, 'nervous'], [tWalk, 'sad'], [tWalk + 0.7, 'shocked']]), blink: blinkFlag(t, 3.0, 5), look: t > tWalk + 0.6 ? lookToward(-1, 0) : lookToward(1, 0.2 + 0.3 * k), sweat: 0.6 + 0.4 * k, breath: 1.8 - 0.4 * k });
  });
  parkFg(g, t, cam, { season: 'spring' });
  atmos(g, t, cam, { color: P.M.key, far: 18, near: 6 });
  const end = 80 * 60, sec = t < tMin ? end - 21 + 21 * ease.in(prog(t, 0, tMin)) : end;
  stopwatch(g, sec, { x: E.W - 230, y: 250, r: 130, alarm: t > tMin && t < tMin + 1.2 ? 1 : 0 });
  if (t > tTw) text(g, '1 HR 20 MIN', E.W - 230, 470, { size: 46 * ease.outBack(prog(t, tTw, tTw + 0.35)), color: S().ui.gold, stroke: 9, strokeColor: '#140f1c', glow: 14, glowColor: alpha(S().ui.gold, 0.7) });
} });
