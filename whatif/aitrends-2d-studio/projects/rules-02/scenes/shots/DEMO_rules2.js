// DEMO_rules2.js — sheet-check shots for sets/rules2.js (temporary ids, not in the real shot list). Vertical 9:16, horror.js FX on top.
//   demo_sticky    the sticky note on the register: the three rules write themselves on, rule 3 gets underlined, slow push
//   demo_cctv      the 2x2 CCTV monitor, timestamp ticking; CAM 4 grows to full screen, and the tall shape with the smile fades in behind the clerk
//   demo_phone     the wall phone ringing (rattle, ring lines, red light), then lifted off the hook
//   demo_stranger  the stranger at the pay window: knuckle taps on the glass, the smile widens, condensation + your reflection on the glass
import { E, registerShot, layer, ease, prog, clamp, lerp, glow, rr, seg, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, idle, lookToward } from '../sets/acting.js';
import { grain, vignette, coldGrade, breathe, flicker, interference } from '../sets/horror.js';
import { stickyNote, cctv, wallPhone, stranger, glassPane, tapRings, stamp } from '../sets/rules2.js';

// a dark shop interior wall + counter top (local backdrop for the demos)
function shopWall(g, t, o = {}) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a2026', '#0c1014']); g.fillRect(0, 0, E.W, E.H);
  const L = flicker(t, { seed: 4, drop: 0.15 }); g.fillStyle = `rgba(220,240,230,${0.5 * L})`; g.fillRect(E.W * 0.15, 40, E.W * 0.7, 18); glow(g, E.W / 2, 60, 700, '#cfe8dc', 0.18 * L);
  if (o.counter !== false) { g.fillStyle = '#3a3026'; g.fillRect(0, E.H * 0.62, E.W, E.H * 0.38); g.fillStyle = '#5a4a3a'; g.fillRect(0, E.H * 0.62, E.W, 24); }
}

registerShot('demo_sticky', { draw(g, t, info) {
  const z = lerp(1.0, 1.07, ease.inOut(t / info.dur));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a2a30', '#141418']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  rr(g, E.W * 0.06, E.H * 0.18, E.W * 0.8, E.H * 0.5, 30); g.fillStyle = '#3a3c44'; g.fill();                       // register top
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { rr(g, E.W * 0.12 + j * 110, E.H * 0.55 + i * 70, 90, 54, 10); g.fillStyle = '#56585e'; g.fill(); }
  stickyNote(g, E.W * 0.5, E.H * 0.36, 1.05, { t, rules: lerp(0, 3.1, prog(t, 0.3, 4.4)), hl: t > 4.8 ? 3 : 0 });
  g.restore();
  glow(g, E.W * 0.7, E.H * 0.1, 800, '#ffe0a8', 0.12);
  coldGrade(g, 0.4); vignette(g, 0.8); breathe(g, t, 0.3); grain(g, t, 0.08);
} });

registerShot('demo_cctv', { draw(g, t, info) {
  const foc = prog(t, 2.0, 2.8), behind = prog(t, 3.4, 4.6), z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  g.fillStyle = '#0a0c10'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  cctv(g, E.W * 0.08, E.H * 0.2, E.W * 0.76, E.W * 0.76 * 1.05, { t, focus: foc, static: 0.2 + 0.5 * prog(t, 3.2, 3.4) * (1 - prog(t, 3.5, 3.7)), time: stamp(3, 0, 12 + t), behind });
  g.restore();
  glow(g, E.W * 0.46, E.H * 0.42, 900, '#9ad8b0', 0.1);
  coldGrade(g, 0.35); vignette(g, 0.85); grain(g, t, 0.08); interference(g, t, clamp(prog(t, 3.2, 3.3) * (1 - prog(t, 3.5, 3.7))) * 0.8);
} });

registerShot('demo_phone', { draw(g, t, info) {
  const lift = prog(t, 2.6, 3.2);
  shopWall(g, t, { counter: false });
  wallPhone(g, E.W * 0.45, E.H * 0.36, 1.6, { t, ring: t < 2.6 ? 1 : 0, offHook: lift, handTo: [E.W * 0.72, E.H * 0.28] });
  coldGrade(g, 0.35); vignette(g, 0.8); grain(g, t, 0.08);
} });

registerShot('demo_stranger', { draw(g, t, info) {
  const taps = [1.0, 1.35, 1.7], z = lerp(1.0, 1.08, ease.inOut(t / info.dur)), gx = E.W * 0.1, gy = E.H * 0.12, gw = E.W * 0.74, gh = E.H * 0.5;
  g.fillStyle = '#05070a'; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  // outside: canopy light far behind, the stranger at the glass
  g.fillStyle = linGrad(g, 0, gy, 0, gy + gh, ['#1a2430', '#2a3a48', '#121820']); g.fillRect(gx, gy, gw, gh);   // the forecourt under the canopy lights, behind him
  glow(g, E.W * 0.5, E.H * 0.16, 700, '#d8e8ff', 0.22); for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(230,240,255,.7)'; g.fillRect(gx + 60 + i * 260, gy + 30, 180, 12); }
  const tapK = taps.reduce((a, t0) => Math.max(a, Math.sin(clamp((t - t0 + 0.12) / 0.24) * Math.PI)), 0);
  stranger(g, E.W * 0.44, E.H * 0.8, 3.2, { t, smile: lerp(0.6, 1, ease.inOut(prog(t, 2.4, 3.4))), lit: 0.6, tap: tapK, facing: 1, tapAt: tapK > 0.05 ? [E.W * 0.56, E.H * 0.32] : null });
  glassPane(g, t, gx, gy, gw, gh, { fog: 0.4 * prog(t, 2.2, 3.0), fogX: E.W * 0.46, fogY: E.H * 0.3, cond: 0.5, grille: true, drawer: true, reflectA: 0.09,
    reflect: (g) => actor(g, 'HERO', { x: E.W * 0.7, y: E.H * 0.64, s: 1.6, facing: -1, pose: POSES.stand, expr: 'scared', t }) });
  for (const t0 of taps) tapRings(g, t, t0, E.W * 0.56, E.H * 0.32);
  g.restore();
  rr(g, 0, E.H * 0.64, E.W, E.H * 0.36, 0); g.fillStyle = '#2a241e'; g.fill(); g.fillStyle = '#4a3e30'; g.fillRect(0, E.H * 0.64, E.W, 20);   // counter (inside)
  coldGrade(g, 0.4); vignette(g, 0.85); breathe(g, t, 0.35); grain(g, t, 0.09);
} });
