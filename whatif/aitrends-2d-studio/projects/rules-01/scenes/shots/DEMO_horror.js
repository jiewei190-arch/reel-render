// DEMO_horror.js — sheet-check shots for sets/horror.js (temporary ids, not in the real shot list). Vertical 9:16.
//   demo_note     the note under the fridge magnet: rules 1-3 write themselves on, then it flips over to rule 4 (shakier hand), slow push
//   demo_monitor  the baby monitor on the counter in the dark: LEDs climb green -> red, static on the grille, an interference burst
//   demo_fx       the babysitter in the dark flat with a flashlight cone, the lamp flickering out, dust motes, breathing darkness
//   demo_title    the ink RULE THREE card
//   demo_end      hard cut to black + "Follow for Rule 5."
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { blinkFlag, exprAt, idle, lookToward, camMove } from '../sets/acting.js';
import { note, babyMonitor, grain, vignette, coldGrade, breathe, flicker, flashlight, motes, interference, ruleTitle, endCard } from '../sets/horror.js';

const fridgeDoor = (g) => { g.fillStyle = '#b8bcc8'; g.fillRect(0, 0, E.W, E.H); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(E.W * 0.92, 0, 14, E.H); for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,255,255,${0.04 + 0.02 * (i % 2)})`; g.fillRect(i * 200, 0, 90, E.H); } };

registerShot('demo_note', { draw(g, t, info) {
  const z = lerp(1.0, 1.08, ease.inOut(t / info.dur)); fridgeDoor(g);
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.42);
  note(g, E.W * 0.44, E.H * 0.38, 1.1, { t, rules: lerp(0, 3.2, prog(t, 0.3, 4.2)), flip: ease.inOut(prog(t, 4.6, 5.4)), back: prog(t, 5.5, 6.6), shake: t > 5.4 ? 0.6 : 0 });
  g.restore();
  glow(g, E.W * 0.2, E.H * 0.1, 900, '#ffd8a0', 0.12);
  coldGrade(g, 0.45); vignette(g, 0.8); breathe(g, t, 0.3); grain(g, t, 0.08);
} });

registerShot('demo_monitor', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.5, 1.6], x: [420, 440], y: [140, 150] });
  blurLayer(g, 6, (g) => apartment(g, t, cam, { power: 0, mood: 'night' }), null, 1); veil(g, '#02040a', 0.55);
  const lv = t < 1.2 ? 0.05 : clamp(0.4 + 0.5 * Math.abs(Math.sin(t * 9)) * Math.abs(Math.sin(t * 2.3)) + 0.2 * prog(t, 2.5, 3.3)), st = clamp(prog(t, 1.0, 1.6) + 0.5 * prog(t, 2.5, 3));
  babyMonitor(g, E.W * 0.47, E.H * 0.42, 1.25 + 0.03 * t, { t, level: lv, static: st });
  coldGrade(g, 0.5); vignette(g, 0.85); grain(g, t, 0.09);
  interference(g, t, clamp(prog(t, 2.6, 2.8) * (1 - prog(t, 3.3, 3.6))));
} });

registerShot('demo_fx', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.25, 1.32], x: [-80, -40], y: [40, 30] }), lamp = t < 2 ? flicker(t, { seed: 3, drop: 0.3 }) : 0;
  const A = apartment(g, t, cam, { power: lamp, mood: 'night' });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: A.CX - 60, y: A.GY + 10, s: 1.95, facing: 1, pose: idle({ ...POSES.stand, eF: [26, -150], hF: [52, -152] }, t, 2), expr: exprAt(t, [[0, 'worried'], [2.1, 'scared']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, -0.2), rim: { color: '#9fc0ff', dir: [-0.8, -0.4] }, t }));
  apartmentFg(g, t, cam);
  const fx = (A.CX - 60 + 52 * 1.95 - E.W / 2 - cam.x) * cam.z + E.W / 2, fy = (A.GY + 10 - 152 * 1.95 - E.H / 2 - cam.y) * cam.z + E.H / 2, ang = -0.25 + 0.15 * Math.sin(t * 0.7);
  coldGrade(g, 0.55);
  flashlight(g, fx, fy, ang, { len: E.H * 0.75, spread: 0.3, dark: t < 2 ? 0.55 : 0.9 });
  motes(g, t, { x: fx, y: fy - 300, w: 800, h: 600, count: 50 });
  breathe(g, t, 0.45); grain(g, t, 0.09);
} });

registerShot('demo_title', { draw(g, t, info) { ruleTitle(g, t, 3, 'Keep the baby monitor on. All night.', { dur: info.dur }); } });

registerShot('demo_end', { draw(g, t, info) {
  if (t < 1.0) { const cam = { z: 1.3, x: 0, y: 0 }; apartment(g, t, cam, { power: 0, mood: 'night' }); coldGrade(g, 0.6); vignette(g, 0.9); grain(g, t, 0.1); }
  else endCard(g, t - 1.0, 'Follow for Rule 5.');
} });
