// thumbs_jump.js — Test & Compare thumbnails for "What If Every Day Your Jump Doubled?" (jump_v1..v3).
// Hero = the jump project's hero (cast.js: mustard hoodie, dark-teal trousers), giant face from sets/faces.js.
import { E, registerShot, rng, lerp, circle, ring, seg, alpha, shade, glow, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { giantFace, FACE } from '../sets/faces.js';
import { actor } from '../sets/actors.js';
import { stratosphere } from '../sets/sky.js';
import { spaceEdge } from '../sets/orbit.js';
import { skyline } from '../sets/skyline.js';
import { cloudLayer } from '../sets/peaks.js';
import { bigText, burst, rimFrame, fullBg, eyeShine, YEL, WHT, RED, CYAN } from '../../thumbkit.js';

const T = 2.0;
const SHOCK = { ...FACE.shocked, eye: 1.3, pupil: 0.85, open: 1.05, w: 0.72, smile: -0.35, glint: 1, sweat: 0.9 };
const WORRY = { ...FACE.worried, eye: 1.25, pupil: 0.9, open: 0.55, w: 0.6, smile: -0.6, glint: 1, sweat: 1 };
const THRILL = { ...FACE.delighted, eye: 1.25, glint: 1, open: 0.9 };

// wind streaks rushing DOWN past the frame (we are going UP fast)
function windUp(g, seed = 3, col = '#ffffff', a = 0.35) {
  const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const x = r() * E.W, y = r() * E.H, L = 120 + r() * 300; seg(g, [[x, y], [x, y + L]], 3 + r() * 5, alpha(col, a * (0.4 + r() * 0.6))); }
  g.restore();
}
// a small hero jumping straight up with a gold dotted trail from far below
function tinyJumper(g, x, y, s, trailTo) {
  if (trailTo) { g.save(); g.setLineDash([2, 26]); g.lineCap = 'round'; g.strokeStyle = alpha(YEL, 0.95); g.lineWidth = 14; g.beginPath(); g.moveTo(trailTo[0], trailTo[1]); g.quadraticCurveTo(x - 40, (y + trailTo[1]) / 2, x, y + 60 * s); g.stroke(); g.restore(); }
  glow(g, x, y - 120 * s, 230 * s, '#fff6dc', 0.85); glow(g, x, y - 120 * s, 120 * s, '#ffffff', 0.6);
  actor(g, 'HERO', { x, y, s, facing: 1, pose: POSES.cheer || POSES.jump, expr: 'smile', rim: { color: '#fff0c0', dir: [0, -1] }, shadow: false, t: T });
}

registerShot('jump_v1', { draw(g) {          // way above the clouds, Earth's haze below, face in the wind + "x2 EVERY DAY"
  stratosphere(g, T, { x: 0, y: 0, z: 1 }, { alt: 0.32 });
  windUp(g, 3, '#ffffff', 0.25);
  tinyJumper(g, 1600, 1010, 2.0, null);
  giantFace(g, 480, 690, 345, { who: 'HERO', f: { ...SHOCK, look: [-0.1, 0.6] }, rimColor: '#fff3dc', rimSide: 1, glint: '#ffffff', tilt: 0.06 });
  eyeShine(g, 480, 690, 345, '#ffffff', 0.35);
  bigText(g, 'x2', 1180, 190, { size: 300, fill: YEL, fill2: '#ffae1a' });
  bigText(g, 'EVERY DAY', 1480, 370, { size: 170, maxW: 820, fill: WHT });
  rimFrame(g, '#ffffff', 0.1);
} });
registerShot('jump_v2', { draw(g) {          // edge of space: the Earth curves below, no way back + "NO WAY DOWN?"
  spaceEdge(g, T, { x: 0, y: 0, z: 1 }, { line: 0, curve: 1 });
  tinyJumper(g, 1420, 910, 2.0, null);
  g.save(); g.setLineDash([4, 28]); g.lineCap = 'round'; g.strokeStyle = alpha(YEL, 0.9); g.lineWidth = 14; g.beginPath(); g.moveTo(1420, 1080); g.lineTo(1420, 900); g.stroke(); g.restore();
  giantFace(g, 470, 690, 345, { who: 'HERO', f: { ...WORRY, look: [0.4, 0.55] }, rimColor: '#9fd0ff', rimSide: 1, glint: '#cfe8ff', tilt: -0.05 });
  eyeShine(g, 470, 690, 345, '#cfe8ff', 0.4);
  bigText(g, 'NO WAY', 1340, 140, { size: 210, maxW: 1000, fill: WHT, fill2: '#cfe8ff' });
  bigText(g, 'DOWN?', 1340, 330, { size: 210, maxW: 1000, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, '#6fb8ff', 0.12);
} });
registerShot('jump_v3', { draw(g) {          // over the tallest building on Earth: one jump clears it + "TOO HIGH?"
  const cam = { x: 0, y: -E.H * 1.5, z: 1 };
  skyline(g, T, cam, { mood: 'golden', sun: 1, label: 0 });
  burst(g, 1400, 300, 900, '#ffe2b0', 0.08, 18);
  tinyJumper(g, 1390, 720, 1.9, [1180, 1150]);
  giantFace(g, 460, 700, 345, { who: 'HERO', f: { ...THRILL, look: [0.7, -0.4] }, rimColor: '#ffc68a', rimSide: 1, glint: '#fff0c0', tilt: -0.05 });
  eyeShine(g, 460, 700, 345, '#fff0c0', 0.35);
  bigText(g, 'TOO HIGH?', 1330, 150, { size: 220, maxW: 1080, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, '#ffc68a', 0.1);
} });
