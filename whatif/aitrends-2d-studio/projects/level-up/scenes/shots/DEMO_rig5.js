// DEMO_rig5.js — look-dev for sets/rig5.js (temporary ids demo_*, not bound to the voice). Three stills go to the owner.
//   demo_r5_cast    model sheet: HERO, MINA, DEV and BISCUIT side by side on a soft night-navy studio backdrop, cyan rim, idle breathing
//   demo_r5_poses   the HERO pose range: shock, grin, deadlift setup/pull/lockout, overhead, push, sink, run, eat cereal, sleep
//   demo_r5_face    the big close-up: face5 HERO with the HUD's cyan reflecting in his eyes and on his cheeks; MINA + DEV close-ups
import { E, registerShot, ease, prog, clamp, lerp, glow, text, FONTS, rr, alpha, linGrad, radGrad, seg } from '/engine/core.js';
import { hero5, mina5, dev5, biscuit5, face5, pose5, blendPose5, runPose5 } from '../sets/rig5.js';

function studio(g, t, warm = false) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, warm ? ['#2a2f48', '#1a1f33', '#0f1424'] : ['#18213a', '#121a2d', '#0b0f1a']); g.fillRect(0, 0, E.W, E.H);
  g.fillStyle = radGrad(g, E.W * 0.5, E.H * 0.55, 80, E.W * 0.6, ['rgba(80,110,170,.35)', 'rgba(0,0,0,0)']); g.fillRect(0, 0, E.W, E.H);
  g.fillStyle = '#0e1322'; g.fillRect(0, E.H * 0.86, E.W, E.H * 0.14); seg(g, [[0, E.H * 0.86], [E.W, E.H * 0.86]], 2, alpha('#3fe0ff', 0.15));
}
const label = (g, s, x, y) => text(g, s, x, y, { size: 26, color: alpha('#e8eef8', 0.75), font: FONTS.ui, weight: 800, spacing: 3 });

registerShot('demo_r5_cast', { draw(g, t, info) {
  studio(g, t);
  const gy = E.H * 0.86, s = 1.85;
  hero5(g, E.W * 0.26, gy, s, { pose: 'idle', face: t < 2 ? 'smile' : 'grin', look: [0.3, -0.05], t, blink: ((t + 0.4) % 3.3) > 3.18 ? 1 : 0 });
  dev5(g, E.W * 0.47, gy, s, { pose: 'phone', face: 'smirk', look: [0.6, 0.2], t, blink: ((t + 1.4) % 3.6) > 3.48 ? 1 : 0 });
  mina5(g, E.W * 0.65, gy, s * 1.2, { pose: 'wave', face: 'grin', look: [-0.4, -0.1], t, facing: -1, blink: ((t + 2.1) % 2.9) > 2.78 ? 1 : 0 });
  biscuit5(g, E.W * 0.82, gy, 2.0, { pose: 'sit', t, facing: -1, mood: 'unimpressed', look: [-0.6, 0] });
  for (const [s2, x] of [['HERO', 0.26], ['DEV', 0.47], ['MINA', 0.65], ['BISCUIT', 0.82]]) label(g, s2, E.W * x, E.H * 0.93);
} });

registerShot('demo_r5_poses', { draw(g, t, info) {
  studio(g, t, true);
  const gy = E.H * 0.47, gy2 = E.H * 0.93, s = 0.92;
  const row1 = [['shock', 'shock'], ['grin', 'grin'], ['deadliftSetup', 'strain'], ['deadliftPull', 'strain'], ['deadliftLockout', 'determined'], ['overhead', 'strain']];
  row1.forEach(([p, f], i) => { const x = E.W * (0.09 + i * 0.165); hero5(g, x, gy, s, { pose: p, face: f, t, look: [0.3, 0] }); label(g, p.toUpperCase(), x, gy + 30); });
  const x2 = (i) => E.W * (0.09 + i * 0.165);
  hero5(g, x2(0), gy2, s, { pose: 'push', face: 'strain', t }); label(g, 'PUSH', x2(0), gy2 + 28);
  hero5(g, x2(1), gy2, s, { pose: 'sink', face: 'strain', t, sink: 0.6, glow: 0.8 }); label(g, 'SINK + GLOW', x2(1), gy2 + 28);
  hero5(g, x2(2), gy2, s, { pose: runPose5(t * 9), face: 'determined', t }); label(g, 'RUN', x2(2), gy2 + 28);
  hero5(g, x2(3), gy2, s, { pose: 'eatCereal', face: 'chew', t, prop: (g, J) => { const h = J.aF.ha, b = J.aB.ha; seg(g, [[h[0] - 4, h[1] + 4], [h[0] + 16, h[1] - 14]], 4, '#c8ccd4'); g.fillStyle = '#e8eef8'; g.beginPath(); g.ellipse(b[0] + 6, b[1] - 6, 26, 9, 0, 0, Math.PI); g.fill(); g.fillStyle = '#f2d080'; g.beginPath(); g.ellipse(b[0] + 6, b[1] - 6, 24, 5, 0, 0, Math.PI * 2); g.fill(); } }); label(g, 'EAT CEREAL', x2(3), gy2 + 28);
  hero5(g, x2(4) + 40, gy2 - 30, s, { pose: 'sleep', face: 'sleepy', t, rot: -Math.PI / 2, shadow: false }); label(g, 'SLEEP', x2(4), gy2 + 28);
  hero5(g, x2(5), gy2, s, { pose: 'wave', face: 'smile', t }); label(g, 'WAVE', x2(5), gy2 + 28);
} });

registerShot('demo_r5_face', { draw(g, t, info) {
  studio(g, t);
  glow(g, E.W * 0.62, E.H * 0.45, 500, '#3fe0ff', 0.12 + 0.05 * Math.sin(t * 2));
  // the stat card's glow would sit at frame right; the face catches it
  rr(g, E.W * 0.62, E.H * 0.24, 300, 180, 32); g.fillStyle = alpha('#123A5E', 0.55); g.fill(); g.strokeStyle = '#3FE0FF'; g.lineWidth = 3; g.stroke();
  face5(g, E.W * 0.36, E.H * 0.5, 215, { who: 'hero', expr: undefined, face: t < 1.5 ? 'surprised' : 'grin', look: [0.7, -0.15], t, glowReflect: 1, light: [0.8, -0.4], rim: { color: '#7b5cff' } });
  face5(g, E.W * 0.74, E.H * 0.8, 92, { who: 'mina', face: 'smirk', look: [-0.6, 0], t, facing: -1 });
  face5(g, E.W * 0.9, E.H * 0.8, 92, { who: 'dev', face: 'grin', look: [-0.6, 0], t, facing: -1 });
} });
