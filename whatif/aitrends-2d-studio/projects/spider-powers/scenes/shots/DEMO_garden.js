// DEMO_garden.js — sheet-check of sets/garden.js (temporary ids demo_*, not bound to the voice).
//   demo_g_shed    the shed on Saturday morning: sunbeam through the cobwebbed window, HERO reaches for the bike pump
//   demo_g_garden  the back garden, day: washing line, apple tree, fence, shed; MINA on the lawn, HERO on the back step
//   demo_g_wall    the house back wall: the drainpipe, ivy, windows (HERO at the foot of the pipe, looking up)
//   demo_g_storm   day 7 storm: rain, gusts bend the apple tree, lightning flashes; the red scarf snagged up in the tree, Biscuit on the branch
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { garden, gardenFg, lightningAt } from '../sets/garden.js';

registerShot('demo_g_shed', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.08, 1.14], x: [80, 140], y: [-60, -70] });
  const G = garden(g, t, cam, { view: 'shed', mood: 'morning', door: 0.4 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: G.pos.pumpX - 260, y: G.GY + 20, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.2, { ...POSES.crouch, hF: [60, -40] }]]), t, 2), expr: exprAt(t, [[0, 'neutral'], [2.4, 'surprised']]), blink: blinkFlag(t, 3.3, 2), look: t > 2.3 ? lookToward(-1, -0.6) : lookToward(1, 0.5), rim: G.rim, t }));
  gardenFg(g, t, cam, { view: 'shed' });
} });

registerShot('demo_g_garden', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.92, 0.96], x: [-80, 40], y: [-120, -130] });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' });
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: G.pos.stepX + 60, y: G.pos.stepTop + 6, s: 1.9, facing: 1, pose: idle(POSES.stand, t, 3), expr: 'smile', blink: blinkFlag(t, 3.4, 3), look: lookToward(1, 0), rim: G.rim, t });
    actor(g, 'MINA', { x: G.CX + 60, y: G.GY + 40, s: 2.0, facing: -1, pose: idle(POSES.wave, t, 4), expr: 'happy', blink: blinkFlag(t, 2.9, 4), look: lookToward(-1, -0.1), rim: G.rim, t });
  });
  gardenFg(g, t, cam, { view: 'garden' }); atmos(g, t, cam, { color: G.M.key });
} });

registerShot('demo_g_wall', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [100, 120], y: [-60, -200] });
  const G = garden(g, t, cam, { view: 'wall', mood: 'dusk' });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: G.pos.pipeX - 220, y: G.GY + 10, s: 1.95, facing: 1, pose: idle(POSES.lookUp ? POSES.stand : POSES.stand, t, 5), expr: exprAt(t, [[0, 'determined'], [2.0, 'smirk']]), blink: blinkFlag(t, 3.2, 5), look: lookToward(0.4, -1), rim: G.rim, t }));
  gardenFg(g, t, cam, { view: 'wall' }); atmos(g, t, cam, { color: G.M.key });
} });

registerShot('demo_g_storm', { draw(g, t, info) {
  const flash = lightningAt(t, [1.2, 3.1]), cam = camMove(t, info.dur, { z: [0.94, 0.98], x: [-60, -20], y: [-170, -180] });
  const G = garden(g, t, cam, { view: 'tree', mood: 'dusk', storm: 1, flash, scarf: true });
  layer(g, cam, 1, (g) => {
    cat(g, { x: G.pos.branchX, y: G.pos.branchY - 4, s: 1.9, facing: -1, pose: 'loaf', eyes: flash > 0.3 ? 'wide' : 'auto', t, rim: G.rim });
    actor(g, 'HERO', { x: G.pos.trunkX + 520, y: G.GY + 20, s: 1.9, facing: -1, pose: idle(POSES.pointUp, t, 6), expr: exprAt(t, [[0, 'worried'], [1.2, 'shocked']]), blink: blinkFlag(t, 3.1, 6), look: lookToward(-0.4, -1), rim: G.rim, t });
  });
  gardenFg(g, t, cam, { view: 'tree', storm: 1 });
} });
