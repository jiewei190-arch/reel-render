// DEMO_house.js — sheet-check of sets/house.js (temporary ids demo_*, not bound to the voice).
//   demo_exterior  the Hale house on the quiet street, one window lit, slow push in
//   demo_kitchen   HERO reads the note on the fridge by the warm lamp, clock at 11:10, moon through the window
//   demo_basement  the basement door: three knocks rattle it, dust drops, HERO frozen in the foreground
//   demo_hallway   the hallway bulb flickers and dies, darkness, then it comes back on; HERO does not touch the switch
//   demo_stairs    from the bottom looking up: the door at the top opens wider, a shape is almost there, a small hand on the banister
//   demo_upstairs  the landing: the nursery door open, an empty crib, the mobile turning by itself
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { house, houseFg, knockAt, flick } from '../sets/house.js';

const HS = 2.4;   // hero scale for vertical mediums

registerShot('demo_exterior', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-120, -150], drift: 0.5 });
  house(g, t, cam, { room: 'exterior', lit: 'down' });
  houseFg(g, t, cam, { room: 'exterior' });
} });

registerShot('demo_kitchen', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], x: [120, 160], y: [-40, -60], drift: 0.5 });
  const H = house(g, t, cam, { room: 'kitchen', clock: '11:10', lights: { lamp: 1 } });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: H.pos.fridgeX - 380, y: H.GY + 40, s: HS, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.2, 'reach'], [2.6, 'think']]), t, 2), expr: exprAt(t, [[0, 'neutral'], [2.4, 'worried']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, -0.5), rim: H.rim, t });
    cat(g, { x: H.pos.counterL + 520, y: H.GY + 30, s: 2.0, facing: 1, pose: 'sit', eyes: 'glint', t, rim: H.rim });
  });
  houseFg(g, t, cam, { room: 'kitchen' });
} });

registerShot('demo_basement', { draw(g, t, info) {
  const knocks = [1.0, 1.7, 2.4], k = knockAt(t, knocks);
  const cam = camMove(t, info.dur, { z: [1.1, 1.2], y: [-160, -170], drift: 0.4 }); cam.x += k * Math.sin(t * 80) * 6;
  const H = house(g, t, cam, { room: 'basement', knock: k, bolt: 1, lights: { lamp: 0.5 } });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 300, y: H.GY + 260, s: 2.7, facing: 1, pose: idle(t < 1 ? POSES.stand : reaction('shock', t, 1.05), t, 3), expr: exprAt(t, [[0, 'neutral'], [1.05, 'scared']]), blink: t > 1 ? false : blinkFlag(t, 3.2, 3), look: lookToward(1, 0.1), rim: H.rim, t }));
  houseFg(g, t, cam, { room: 'basement' });
} });

registerShot('demo_hallway', { draw(g, t, info) {
  const hall = key(t, [[0, 1], [0.8, 1], [0.85, 0], [3.0, 0], [3.05, 1]]), fl = t > 0.3 && t < 0.85 ? 0.9 : 0;
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], y: [-60, -70], drift: 0.4 });
  const H = house(g, t, cam, { room: 'hallway', lights: { hall }, flicker: fl, switchOn: true });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 230, y: H.GY + 300, s: 2.6, facing: 1, pose: idle(POSES.crossArms, t, 4), expr: exprAt(t, [[0, 'neutral'], [0.9, 'scared'], [3.1, 'worried']]), blink: blinkFlag(t, 3.4, 4), look: lookToward(0.6, -0.8), rim: H.rim, dim: H.light < 0.3, t }));
  houseFg(g, t, cam, { room: 'hallway' });
} });

registerShot('demo_stairs', { draw(g, t, info) {
  const ajar = lerp(0.1, 0.8, ease.inOut(prog(t, 0.5, 3.0))), shape = 0.55 * ease.inOut(prog(t, 1.5, 3.2)), hand = ease.inOut(prog(t, 3.2, 4.0));
  const cam = camMove(t, info.dur, { z: [1.0, 1.1], y: [0, -60], drift: 0.3 });
  house(g, t, cam, { room: 'stairs', doorAjar: ajar, shape, hand, lights: { hall: 0.9 } });
  houseFg(g, t, cam, { room: 'stairs' });
} });

registerShot('demo_upstairs', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.14], y: [-80, -100], drift: 0.3 });
  const H = house(g, t, cam, { room: 'upstairs', mobile: 1 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 330, y: H.GY + 220, s: 2.5, facing: 1, pose: idle(POSES.stand, t, 5), expr: exprAt(t, [[0, 'worried'], [2, 'scared']]), blink: blinkFlag(t, 3.3, 5), look: lookToward(1, -0.2), rim: H.rim, t }));
  houseFg(g, t, cam, { room: 'upstairs' });
} });
