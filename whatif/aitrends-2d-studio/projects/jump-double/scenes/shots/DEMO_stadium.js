// DEMO_stadium.js — sheet-check shots for sets/stadium.js (temporary ids, not in the real shot list).
//   demo_stadium: HERO beside the 2.45 m high-jump bar for scale (bar wobbles when he passes over it), the gold record sign, crowd cheering.
//   demo_pv: a wide tilt up the pole-vault marker to the 6.31 m plate, the pole lying on the grass.
import { E, registerShot, layer, ease, prog, key, clamp, lerp } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { stadium, stadiumFg } from '../sets/stadium.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos, lookToward } from '../sets/acting.js';

registerShot('demo_stadium', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [0.95, 1.02], x: [-300, -220], y: [-120, -140] });
  const A = stadium(g, t, cam, { barWobble: t > 2.5 ? Math.exp(-(t - 2.5) * 2) : 0, cheer: t > 2.5 ? 1 : 0.3 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: A.pos.hjX - 330, y: A.GY + 20, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.6, 'lookUp']]), t, 3), expr: exprAt(t, [[0, 'neutral'], [1.6, 'smirk']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(0.7, -0.8), rim: A.rim, t }));
  stadiumFg(g, t, cam);
  atmos(g, t, cam, { color: '#eef4ff' });
} });

registerShot('demo_pv', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 0.62, x: lerp(820, 900, k), y: lerp(-60, -720, k) };
  const A = stadium(g, t, cam, {});
  layer(g, cam, 1, (g) => actor(g, 'MINA', { x: A.pos.markX - 260, y: A.GY + 20, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [1.0, 'pointUp']]), t, 2), expr: 'awe', blink: blinkFlag(t, 2.9, 1), look: lookToward(0.3, -1), rim: A.rim, t }));
  atmos(g, t, cam, { color: '#eef4ff' });
} });
