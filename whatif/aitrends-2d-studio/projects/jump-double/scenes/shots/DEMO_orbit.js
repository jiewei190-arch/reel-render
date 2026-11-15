// DEMO_orbit.js — sheet check for sets/orbit.js (temporary id 'demo_orbit').
// 0-2 s: the edge of space: the dashed 100 km line slides down past the floating hero, Earth's curve and stars, total calm.
// 2-4 s: low orbit: the ISS drifts in, astronauts wave through the cupola, the hero waves back.
import { E, registerShot, layer, ease, prog, clamp, lerp } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { spaceEdge, orbit, orbitFg } from '../sets/orbit.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos } from '../sets/acting.js';

registerShot('demo_orbit', { draw(g, t, info) {
  const edge = t < 2.0, cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-20, 20] });
  if (edge) {
    const Q = spaceEdge(g, t, cam, { line: ease.out(prog(t, 0, 0.4)), lineY: lerp(E.H * 0.2, E.H * 0.88, ease.inOut(prog(t, 0.2, 1.9))) });
    layer(g, cam, 1, (g) => actor(g, 'HERO', { x: E.W * 0.55, y: E.H * 0.7 + Math.sin(t * 1.1) * 8, s: 1.9, facing: -1, pose: idle(poseAt(t, [[0, 'handsUp'], [1.2, 'relaxed']], 0.4), t, 3), rot: 0.08 * Math.sin(t * 0.7), t, rim: Q.rim, shadow: false,
      expr: exprAt(t, [[0, 'surprised'], [1.0, 'awe']]), blink: blinkFlag(t, 3.6, 2), look: [0, 1] }));
  } else {
    const lt = t - 2.0, O = orbit(g, t, cam, { iss: lerp(0.2, 0.55, ease.out(prog(lt, 0, 2))), wave: clamp((lt - 0.6) * 3) });
    layer(g, cam, 1, (g) => actor(g, 'HERO', { x: E.W * 0.26, y: E.H * 0.86 + Math.sin(t * 1.1) * 8, s: 1.9, facing: 1, pose: idle(poseAt(lt, [[0, 'relaxed'], [0.8, 'wave']], 0.3), t, 3), rot: -0.06, t, rim: O.rim, shadow: false,
      expr: exprAt(lt, [[0, 'awe'], [0.8, 'happy']]), blink: blinkFlag(t, 3.6, 2), look: [0.8, -0.6] }));
    orbitFg(g, t, cam);
  }
  atmos(g, t, cam, { color: '#e8e8ff', far: 10, near: 3 });
} });
