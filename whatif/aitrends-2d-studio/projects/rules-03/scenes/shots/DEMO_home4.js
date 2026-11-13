// DEMO_home4.js — sheet-check of sets/home4.js (temporary ids demo_*, not bound to the voice).
//   demo_h4_street  3 a.m.: every window on the street lights up blue from phones at once, a dead streetlight, no cars
//   demo_h4_living  the living room: brother asleep under the blanket, cardboard on the window, the light pours under the front door and creeps
//   demo_h4_door    the front door, close: light round the edges, a shadow breaks the light underneath; HERO frozen
//   demo_h4_window  HERO tapes cardboard over the window pane by pane; blades of light leak through the gaps
//   demo_h4_stairs  from the foot of the stairs: the two closed doors, MOM and DAD
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { home4, home4Fg } from '../sets/home4.js';

registerShot('demo_h4_street', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-60, -80], drift: 0.3 });
  home4(g, t, cam, { view: 'street', phones: ease.inOut(prog(t, 0.8, 1.4)) });
  home4Fg(g, t, cam, { view: 'street' });
} });

registerShot('demo_h4_living', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-40, -60], drift: 0.3 });
  const H = home4(g, t, cam, { view: 'living', glow: ease.inOut(prog(t, 0.5, 2.5)), creep: lerp(0.1, 0.8, t / info.dur), boarded: 1 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.pos.youX, y: H.GY + 240, s: 2.5, facing: 1, pose: idle(POSES.stand, t, 2), expr: exprAt(t, [[0, 'worried'], [2.4, 'scared']]), blink: blinkFlag(t, 3.4, 2), look: lookToward(1, 0.4), rim: t > 1.5 ? H.warmRim : H.rim, t }));
  home4Fg(g, t, cam, { view: 'living' });
} });

registerShot('demo_h4_door', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.05, 1.14], y: [-40, -60], drift: 0.2 });
  const H = home4(g, t, cam, { view: 'door', glow: 1, creep: 0.6, shadow: ease.inOut(prog(t, 1.5, 2.2)) });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 360, y: H.GY + 330, s: 2.7, facing: 1, pose: idle(t < 1.5 ? POSES.stand : reaction('shock', t, 1.6), t, 3), expr: exprAt(t, [[0, 'worried'], [1.6, 'scared']]), blink: t > 1.6 ? false : blinkFlag(t, 3.1, 3), look: lookToward(1, 0.7), rim: H.warmRim, t }));
  home4Fg(g, t, cam, { view: 'door' });
} });

registerShot('demo_h4_window', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-60, -70], drift: 0.2 });
  const H = home4(g, t, cam, { view: 'window', glow: 0.8, boarded: lerp(0.0, 1.0, t / info.dur) });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: H.CX - 300, y: H.GY + 280, s: 2.6, facing: 1, pose: idle(poseAt(t, [[0, 'reach'], [1.2, 'holdFront'], [2.2, 'reach']]), t, 4), expr: 'worried', blink: blinkFlag(t, 3.3, 4), look: lookToward(1, -0.5), rim: H.warmRim, t }));
  home4Fg(g, t, cam, { view: 'window' });
} });

registerShot('demo_h4_stairs', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], y: [-40, -80], drift: 0.2 });
  home4(g, t, cam, { view: 'stairs', glow: 0.5 });
  home4Fg(g, t, cam, { view: 'stairs' });
} });
