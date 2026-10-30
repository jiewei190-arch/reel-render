// DEMO_cast.js — sheet-check of the ep 3 cast (bound to s001 only until the real shots land; delete then).
import { registerShot, layer } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { blinkFlag, idle, camMove, atmos } from '../sets/acting.js';

registerShot('s001', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.15, 1.18], x: [0, 10], y: [-200, -205] });
  const A = apartment(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    actor(g, 'MINA', { x: A.CX - 260, y: A.GY, s: 1.9, facing: 1, pose: idle(POSES.stand, t, 1), expr: 'smile', blink: blinkFlag(t, 3, 1), rim: A.rim, t });
    actor(g, 'HERO', { x: A.CX, y: A.GY, s: 1.9, facing: 1, pose: idle(POSES.stand, t, 2), expr: 'determined', blink: blinkFlag(t, 3, 2), rim: A.rim, t });
    actor(g, 'DEV', { x: A.CX + 260, y: A.GY, s: 1.9, facing: -1, pose: idle(POSES.stand, t, 3), expr: 'smile', blink: blinkFlag(t, 3, 3), rim: A.rim, t });
  });
  if (apartmentFg) apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: A.M?.key });
} });
