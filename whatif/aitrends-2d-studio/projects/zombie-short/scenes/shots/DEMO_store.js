// DEMO_store.js — sheet-check of sets/store.js (temporary ids demo_*, not bound to the voice).
//   demo_st_front    the front glass at night: moonlight, the dead lot, the toppled cart; HERO sweeps the flashlight
//   demo_st_aisle    AISLE 7, empty shelves into the dark, the EXIT sign; flashlight beam down the aisle
//   demo_st_back     the back corridor to the FREEZER, the green emergency light
//   demo_st_freezer  inside the freezer: frost, plastic strips, the caged bulb flickering, breath fog, light under the door; a shadow arrives
//   demo_st_door     close on the inside of the steel door: no handle, four empty screw holes, scratches; the dying phone 10% -> 0%
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { store, storeFg, breathFog, deadPhone } from '../sets/store.js';
import { grain } from '../sets/horror.js';

const torchPose = { ...POSES.stand, eF: [26, -150], hF: [52, -160] };

registerShot('demo_st_front', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-60, -80], drift: 0.3 });
  const S = store(g, t, cam, { view: 'front' });
  const hx = S.CX - 280, s = 2.4;
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: hx, y: S.GY + 260, s, facing: 1, pose: idle(torchPose, t, 2), expr: exprAt(t, [[0, 'worried'], [2, 'scared']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(1, -0.2), rim: S.rim, t }));
  const ang = lerp(-0.6, -0.1, ease.inOut(prog(t, 0.3, 3)));
  storeFg(g, t, cam, { view: 'front', flashlight: { x: hx + 70 + 52 * s * 1.06 - cam.x, y: S.GY + 260 - 160 * s * 1.06 + 40, ang, on: 0.7 } });
  grain(g, t, 0.07);
} });

registerShot('demo_st_aisle', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-40, -60], drift: 0.3 });
  store(g, t, cam, { view: 'aisle' });
  storeFg(g, t, cam, { view: 'aisle', flashlight: { x: E.W * 0.5, y: E.H * 0.95, ang: -Math.PI / 2 + Math.sin(t * 0.7) * 0.15, on: 1, len: E.H * 1.1, spread: 0.24 } });
  grain(g, t, 0.07);
} });

registerShot('demo_st_back', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-60, -70], drift: 0.2 });
  store(g, t, cam, { view: 'back' });
  storeFg(g, t, cam, { view: 'back' });
  grain(g, t, 0.07);
} });

registerShot('demo_st_freezer', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-60, -80], drift: 0.2 });
  const S = store(g, t, cam, { view: 'freezer', flicker: 0.5, shadow: ease.inOut(prog(t, 2.0, 2.8)), strips: 0.4 });
  const hx = S.CX - 260, s = 2.4;
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: S.GY + 220, s, facing: 1, pose: idle(poseAt(t, [[0, 'crossArms'], [2.2, 'shock']]), t, 3), expr: exprAt(t, [[0, 'worried'], [2.2, 'scared']]), blink: blinkFlag(t, 3.0, 3), look: lookToward(1, 0.4), rim: S.rim, t });
    breathFog(g, t, hx + 22 * s, S.GY + 220 - 196 * s, { rate: 0.9, s: 1.2, facing: 1 });
  });
  storeFg(g, t, cam, { view: 'freezer' });
  grain(g, t, 0.07);
} });

registerShot('demo_st_door', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-120, -140], drift: 0.15 });
  store(g, t, cam, { view: 'door', shadow: 0.9 });
  storeFg(g, t, cam, { view: 'door' });
  deadPhone(g, t, E.W * 0.3, E.H * 0.55, 1.1, { pct: Math.max(0, Math.round(lerp(10, -2, t / info.dur))) });
  grain(g, t, 0.07);
} });
