// DEMO_roofs.js — sheet-check shots for sets/roofs.js (temporary ids, not in the real shot list).
//   demo_roofs: houses view; HERO lands on the garage roof deck, MINA below by the ladder, Biscuit on the neighbour's roof, the kite stuck in the tree.
//   demo_falls: the Niagara-style lookout; MINA at the railing hiding the hero's shoes behind her back.
//   demo_pond:  the town pond; a splash at 1.0 s sends the ducks flapping up, outraged.
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { roofs, roofsFg, M2U } from '../sets/roofs.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos, lookToward, reaction } from '../sets/acting.js';

registerShot('demo_roofs', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.62, 0.68], x: [-60, 60], y: [-300, -330] });
  const R = roofs(g, t, cam, { view: 'houses' });
  layer(g, cam, 1, (g) => {
    const land = ease.out(prog(t, 0.2, 1.0)), hy = lerp(R.pos.roofY - 700, R.pos.roofY - 30, land);
    actor(g, 'HERO', { x: R.pos.roofX + 300, y: hy, s: 1.9, facing: -1, pose: idle(t < 1.0 ? POSES.jump : reaction('wince', t, 1.0, 'crouch'), t, 3), expr: exprAt(t, [[0, 'surprised'], [1.0, 'worried'], [2.4, 'smirk']]), blink: blinkFlag(t, 3.4, 3), rim: R.rim, t });
    actor(g, 'MINA', { x: R.pos.ladderX - 220, y: R.GY + 20, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.2, 'pointUp']]), t, 2), expr: 'awe', blink: blinkFlag(t, 2.9, 1), look: lookToward(0.5, -1), rim: R.rim, t });
    cat(g, { x: R.pos.nextRoofX, y: R.pos.nextRoofY - 24, s: 1.9, facing: -1, pose: 'loaf', t, eyes: t > 2.5 ? 'offended' : 'auto', rim: R.rim });
  });
  roofsFg(g, t, cam, { view: 'houses' });
  atmos(g, t, cam, { color: R.M.key });
} });

registerShot('demo_falls', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.9, 0.96], x: [-200, -120], y: [-120, -140] });
  const R = roofs(g, t, cam, { view: 'falls' });
  layer(g, cam, 1, (g) => {
    const pose = idle({ ...POSES.stand, hF: [-20, -110], eF: [-6, -130], hB: [-24, -112], eB: [-12, -134] }, t, 2);   // hands behind her back
    actor(g, 'MINA', { x: R.pos.edgeX - 420, y: R.GY - 30, s: 2.0, facing: 1, pose, expr: 'smirk', blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0), rim: R.rim, t });
    const sx = R.pos.edgeX - 420 - 46, sy = R.GY - 30 - 100; for (const dx of [0, 26]) { g.fillStyle = '#e8e2d8'; g.beginPath(); g.ellipse(sx - dx, sy + dx * 0.4, 30, 12, 0.3, 0, Math.PI * 2); g.fill(); }   // his shoes
  });
  roofsFg(g, t, cam, { view: 'falls' });
  atmos(g, t, cam, { color: '#e8f4ff' });
} });

registerShot('demo_pond', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.9, 0.98], x: [-60, 20], y: [40, 30] });
  const sk = prog(t, 1.0, 2.2), R = roofs(g, t, cam, { view: 'pond', splash: { x: E.W / 2, k: sk }, ducks: ease.out(prog(t, 1.1, 1.6)) * (1 - prog(t, 3.6, 4.6)) });
  roofsFg(g, t, cam, { view: 'pond' });
  atmos(g, t, cam, { color: R.M.key });
} });
