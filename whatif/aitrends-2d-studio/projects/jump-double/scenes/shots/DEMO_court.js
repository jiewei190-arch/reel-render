// DEMO_court.js — sheet-check shots for sets/court.js (temporary ids, not in the real shot list).
//   demo_court: 10 ft hoop, golden hour; HERO + DEV for scale, Biscuit on the bench, the net swishes and the rim wobbles at 2.6 s.
//   demo_court12: Dev cranks the hoop from 10 to 12 ft; crank insert framing on the pole, the height sign updates.
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { court, courtFg, basketball, M2U } from '../sets/court.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos, lookToward } from '../sets/acting.js';

registerShot('demo_court', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.86, 0.92], x: [-80, 40], y: [-170, -190] });
  const sw = Math.sin(clamp((t - 2.6) / 0.5) * Math.PI), wob = Math.exp(-Math.max(0, t - 2.6) * 3) * (t > 2.6 ? 1 : 0);
  const C = court(g, t, cam, { hoopFt: 10, swish: sw, wobble: wob });
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: C.CX - 120, y: C.GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.0, 'point']]), t, 2), expr: exprAt(t, [[0, 'smile'], [2.7, 'shocked']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.6), rim: C.rim, t });
    actor(g, 'HERO', { x: C.CX + 200, y: C.GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [2.0, 'reachHigh']]), t, 5), expr: 'smirk', blink: blinkFlag(t, 3.4, 5), look: lookToward(0.8, -1), rim: C.rim, t });
    cat(g, { x: C.pos.benchX - 30, y: C.pos.benchTop, s: 1.9, facing: 1, pose: 'loaf', t, rim: C.rim });
    if (t > 2.2 && t < 3.2) basketball(g, C.pos.rimX, lerp(C.pos.rimY - 120, C.pos.rimY + 140, (t - 2.2) / 1.0), 32, t * 6);
  });
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
} });

registerShot('demo_court12', { draw(g, t, info) {
  const ft = key(t, [[0.5, 10], [3.8, 12]], ease.inOut), cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [560, 600], y: [-180, -240] });
  const C = court(g, t, cam, { hoopFt: ft, crank: ft - 10, mood: 'dusk' });
  layer(g, cam, 1, (g) => actor(g, 'DEV', { x: C.pos.poleX - 130, y: C.GY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'reach']]), t, 2), expr: 'determined', blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.3), rim: C.rim, t }));
  courtFg(g, t, cam);
  atmos(g, t, cam, { color: C.M.key });
} });
