// DEMO_zombies.js — sheet-check shots for sets/zombies.js (HORROR version; temporary ids, not in the real shot list). Vertical 9:16.
//   demo_sil    a dark aisle: a slumped silhouette at the end, the flashlight sweeps across and its eyes catch the light, then it's gone
//   demo_glass  the store front from inside: moonlit lot, the horde packs against the glass, palms slap on the thuds (1.0, 1.6, 2.1 s)
//   demo_hands  close on the glass: three hands press, one slides down leaving a condensation smear, breath fog blooms
import { E, registerShot, ease, prog, clamp, lerp, linGrad, glow } from '/engine/core.js';
import { grain, vignette, coldGrade, breathe, flashlight, motes } from '../sets/horror.js';
import { zombieSil, glassHorde, handsOnGlass, thudShake } from '../sets/zombies.js';

registerShot('demo_sil', { draw(g, t, info) {
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0c1018', '#05070a']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H * 0.45); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.45);
  for (const sd of [-1, 1]) for (let i = 0; i < 6; i++) { const yy = E.H * (0.2 + i * 0.09); g.fillStyle = '#141820'; g.beginPath(); g.moveTo(E.W / 2 + sd * 120, E.H * 0.38 + i * 18); g.lineTo(E.W / 2 + sd * E.W * 0.7, yy + i * 30); g.lineTo(E.W / 2 + sd * E.W * 0.7, yy + i * 30 + 16); g.lineTo(E.W / 2 + sd * 120, E.H * 0.38 + i * 18 + 6); g.fill(); }   // empty shelves in perspective
  g.fillStyle = '#0a0c12'; g.beginPath(); g.moveTo(E.W / 2 - 120, E.H * 0.5); g.lineTo(E.W / 2 + 120, E.H * 0.5); g.lineTo(E.W, E.H); g.lineTo(0, E.H); g.fill();
  glow(g, E.W * 0.5, E.H * 0.36, 420, '#8aa0d0', 0.22); g.fillStyle = 'rgba(120,140,190,.18)'; g.fillRect(E.W * 0.42, E.H * 0.22, E.W * 0.16, E.H * 0.16);   // a moonlit window at the end of the aisle (backlights the shape)
  const ang = lerp(-2.4, -1.4, ease.inOut(prog(t, 0.3, 2.6))), hitEyes = clamp(1 - Math.abs(ang + 1.62) / 0.12);
  zombieSil(g, E.W * 0.52, E.H * 0.5, 0.9, { t, eyes: hitEyes, rim: 0.4, seed: 2, tilt: 0.5 });
  g.restore();
  coldGrade(g, 0.4);
  flashlight(g, E.W * 0.5, E.H * 0.95, ang, { len: E.H * 0.85, spread: 0.22, dark: 0.92, intensity: 0.28 });
  motes(g, t, { x: E.W * 0.2, y: E.H * 0.4, w: E.W * 0.6, h: E.H * 0.4, count: 40 });
  vignette(g, 0.8); breathe(g, t, 0.4); grain(g, t, 0.1);
} });

registerShot('demo_glass', { draw(g, t, info) {
  const hits = [1.0, 1.6, 2.1], sh = thudShake(t, hits, 14), z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2 + sh[0], E.H * 0.4 + sh[1]); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  glassHorde(g, t, { x: -20, y: E.H * 0.12, w: E.W + 40, h: E.H * 0.6, n: 20, press: ease.out(prog(t, 0, 0.8)), hits, seed: 7 });
  g.fillStyle = '#0c0d12'; g.fillRect(-40, E.H * 0.72, E.W + 80, E.H * 0.3);                                       // the dark shop floor inside
  for (let i = 0; i < 4; i++) { g.fillStyle = alpha2(0.12); g.fillRect(i * 280, E.H * 0.72, 140, E.H * 0.3); }    // moonlight panes on the floor
  g.restore();
  coldGrade(g, 0.45); vignette(g, 0.85); grain(g, t, 0.1);
} });
const alpha2 = (a) => `rgba(150,170,220,${a})`;

registerShot('demo_hands', { draw(g, t, info) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a2436', '#0a0e16']); g.fillRect(0, 0, E.W, E.H);
  glow(g, E.W * 0.7, E.H * 0.1, 700, '#c8d8ff', 0.2);
  zombieSil(g, E.W * 0.5, E.H * 1.25, 3.4, { t, arms: 'reach', rim: 0.6, seed: 4, tilt: 0.25 });                    // the body behind, out of focus
  handsOnGlass(g, t, E.W * 0.32, E.H * 0.36, 1.6, { press: ease.out(prog(t, 0.3, 0.5)), slide: ease.inOut(prog(t, 1.4, 3.6)), rot: -0.2, seed: 1, fog: prog(t, 0.4, 1.4) });
  handsOnGlass(g, t, E.W * 0.68, E.H * 0.3, 1.5, { press: ease.out(prog(t, 0.8, 1.0)), rot: 0.25, seed: 2, fog: prog(t, 0.9, 1.8) });
  handsOnGlass(g, t, E.W * 0.5, E.H * 0.5, 1.2, { press: ease.out(prog(t, 2.0, 2.15)), rot: 0.05, seed: 3, fog: prog(t, 2.0, 3.0) });
  coldGrade(g, 0.45); vignette(g, 0.85); breathe(g, t, 0.35); grain(g, t, 0.1);
} });
