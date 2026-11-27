// DEMO_skyline.js — sheet check for sets/skyline.js (temporary id 'demo_skyline').
// A slow camera rise from the lakeside promenade past the 828 m supertall; the hero rises in frame and crests above the spire, sunset glint.
import { E, registerShot, layer, ease, prog, clamp, lerp, glow } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { skyline, skylineFg, skylineGround } from '../sets/skyline.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos } from '../sets/acting.js';

registerShot('demo_skyline', { draw(g, t, info) {
  const GY = skylineGround(), rise = ease.inOut(prog(t, 0.3, info.dur - 0.3));
  const towerTop = GY - 40 - E.H * 1.95, camTopY = (towerTop - E.H / 2 + 120) / 0.55;          // camera y that puts the spire tip just above centre
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-60, 40] }); cam.y = lerp(30, camTopY, rise);
  const K = skyline(g, t, cam, { label: clamp((rise - 0.75) * 5) });
  const heroY = lerp(GY + 30, cam.y + E.H * 0.62, ease.out(prog(t, 0.2, 1.0)));             // launches off the deck, then rides up with the camera
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: E.W / 2 - 180, y: heroY, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'ready'], [0.25, 'jump'], [info.dur - 0.9, 'delight']], 0.25), t, 2), t, rim: K.rim,
      expr: exprAt(t, [[0, 'determined'], [1.0, 'awe'], [info.dur - 0.9, 'happy']]), blink: blinkFlag(t, 3.3, 2), look: [0.4, -0.6], shadow: t < 0.3 });
  });
  skylineFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffd8a8' });
  if (rise > 0.9) { const [sx, sy] = K.pos.screenTop(cam); FX.sparkle(g, sx, sy, 40 * (0.8 + 0.2 * Math.sin(t * 6)), '#fff3d0', 0.9); glow(g, sx, sy, 200, '#ffb070', 0.3); }
} });
