// DEMO_gas.js — sheet-check of sets/gas.js (temporary ids demo_*, not bound to the voice).
//   demo_gas_ext     the QUIK STOP from across the lot: canopy buzzing (one panel flickers), pumps, price sign, highway into black, moths
//   demo_gas_counter the clerk behind the counter at 2:00, register, clock, wall phone, coffee machine, the bad tube flickering
//   demo_gas_window  the night pay window from inside: black lot outside, a far pump, the drawer slides out
//   demo_gas_door    the clerk turns the deadbolt; OPEN 24 HRS buzzes on the glass
//   demo_gas_aisle   the aisle to the coolers, the security mirror in the corner, a tube dying
//   demo_gas_behind  camera four's angle: the counter from behind the clerk; the empty spot behind him
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { gas, gasFg } from '../sets/gas.js';

const HS = 2.4;

registerShot('demo_gas_ext', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.96, 1.04], y: [-160, -190], drift: 0.4 });
  gas(g, t, cam, { view: 'exterior', flicker: 0.7 });
  gasFg(g, t, cam, { view: 'exterior' });
} });

registerShot('demo_gas_counter', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], y: [-60, -80], drift: 0.4 });
  const G = gas(g, t, cam, { view: 'counter', clock: '2:00', flicker: 0.6 });
  layer(g, cam, 0.98, (g) => actor(g, 'HERO', { x: G.pos.clerkX, y: G.GY - 60, s: HS, facing: 1, pose: idle(poseAt(t, [[0, 'relaxed'], [2, 'think']]), t, 2), expr: exprAt(t, [[0, 'neutral'], [2.2, 'worried']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0.2), rim: G.rim, t }));
  G.pos.front(g);
  gasFg(g, t, cam, { view: 'counter' });
} });

registerShot('demo_gas_window', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.12], y: [-60, -70], drift: 0.3 });
  gas(g, t, cam, { view: 'window', drawer: ease.inOut(prog(t, 1.2, 2.2)) });
  gasFg(g, t, cam, { view: 'window' });
} });

registerShot('demo_gas_door', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.08, 1.16], y: [-80, -100], drift: 0.3 });
  const G = gas(g, t, cam, { view: 'door', locked: ease.inOut(prog(t, 1.4, 2.0)), lights: { sign: 1 } });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: G.pos.deadboltX + 170, y: G.GY + 160, s: 2.6, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [1.0, 'reach'], [2.3, 'stand']]), t, 3), expr: exprAt(t, [[0, 'neutral'], [2.0, 'worried']]), blink: blinkFlag(t, 3.1, 3), look: lookToward(-1, -0.1), rim: G.rim, t }));
  gasFg(g, t, cam, { view: 'door' });
} });

registerShot('demo_gas_aisle', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-40, -60], drift: 0.3 });
  gas(g, t, cam, { view: 'aisle', flicker: 0.9 });
  gasFg(g, t, cam, { view: 'aisle' });
} });

registerShot('demo_gas_behind', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-40, -50], drift: 0.15 });
  const G = gas(g, t, cam, { view: 'behind', flicker: 0.5 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: G.pos.clerkX, y: G.GY + 120, s: 2.5, facing: 1, pose: idle(POSES.phone, t, 4), expr: 'worried', blink: blinkFlag(t, 3.3, 4), look: lookToward(1, 0.4), rim: G.rim, t }));
  gasFg(g, t, cam, { view: 'behind' });
} });
