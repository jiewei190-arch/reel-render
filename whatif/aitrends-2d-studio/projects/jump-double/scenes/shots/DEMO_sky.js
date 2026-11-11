// DEMO_sky.js — sheet check for sets/sky.js (temporary id 'demo_sky').
// The hero rises through the stratosphere: a jet passes BELOW him, the sky darkens from blue to indigo, the 41 km balloon fades in,
// his breath-fog thins to nothing and a pass-out vignette starts to close.
import { E, S, registerShot, layer, ease, prog, clamp, lerp } from '/engine/core.js';
import { headPos } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { stratosphere, breathFog, vision, skyFg } from '../sets/sky.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos } from '../sets/acting.js';

registerShot('demo_sky', { draw(g, t, info) {
  const u = t / info.dur, alt = lerp(0.1, 0.75, ease.inOut(u));
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-30, 30] });
  const Y = stratosphere(g, t, cam, { alt, jet: prog(t, 0, 2.2), balloon: clamp((alt - 0.45) * 4) });
  const hero = { x: E.W * 0.4, y: E.H * 0.82 + Math.sin(t * 1.3) * 10, s: 1.9, facing: 1 };
  const pose = idle(poseAt(t, [[0, 'jump'], [2.2, 'handsUp'], [3.2, 'wince']], 0.35), t, 2);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { ...hero, pose, t, rim: Y.rim, shadow: false, expr: exprAt(t, [[0, 'happy'], [1.6, 'surprised'], [2.8, 'worried']]), blink: blinkFlag(t, 3.2, 2), look: [0.6, 0.6] });
    const [hx, hy, hr] = headPos({ ...hero, pose }); breathFog(g, hx + hr * 0.8, hy + hr * 0.3, t, clamp(1 - u * 1.4));
  });
  skyFg(g, t, cam, { alt });
  atmos(g, t, cam, { color: '#e8f0ff', far: 12, near: 4 });
  vision(g, clamp((u - 0.7) * 2.2));
} });
