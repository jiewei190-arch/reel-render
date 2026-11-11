// DEMO_rules3.js — sheet-check shots for sets/rules3.js (temporary ids, not in the real shot list). Vertical 9:16, horror.js FX on top.
//   demo_alert   3 a.m., a phone on the nightstand screams: the EMERGENCY ALERT takes the screen, the three rules type on
//   demo_street  a row of house fronts: every window lights up with phone glows at once (staggered)
//   demo_board   the window gets taped over with cardboard; the outside light leaks through the seams in blades with dust
//   demo_knob    the front doorknob close-up, the warm light under the door; the knob strains but doesn't turn
//   demo_count   a hand counts 1, 2, 3, 4 in the dark with a soft cold rim
import { E, registerShot, ease, prog, clamp, lerp, glow, rr, linGrad, alpha } from '/engine/core.js';
import { grain, vignette, coldGrade, breathe, interference } from '../sets/horror.js';
import { alertPhone, alertPulse, phonesWindow, tapeRoll, cardboard, doorKnob, fingerCount, OUTSIDE } from '../sets/rules3.js';

const dark = (g, c0 = '#0e1220', c1 = '#05060a') => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, [c0, c1]); g.fillRect(0, 0, E.W, E.H); };

registerShot('demo_alert', { draw(g, t, info) {
  const at = 0.6, z = lerp(1.0, 1.08, ease.inOut(t / info.dur));
  dark(g);
  g.save(); g.translate(E.W / 2, E.H * 0.4); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.4);
  rr(g, -40, E.H * 0.62, E.W + 80, E.H, 0); g.fillStyle = '#1a1612'; g.fill();                                       // nightstand top
  alertPhone(g, E.W * 0.46, E.H * 0.38, 1.25, { t, at, rules: lerp(0, 3.05, prog(t, at + 0.8, info.dur - 0.4)), tilt: -0.04 });
  g.restore();
  coldGrade(g, 0.35); vignette(g, 0.85); grain(g, t, 0.08);
} });

registerShot('demo_street', { draw(g, t, info) {
  const k = ease.out(prog(t, 0.8, 2.0)), sc = lerp(1.0, 1.05, t / info.dur);
  dark(g, '#0a0e1a', '#020306');
  g.save(); g.translate(E.W / 2, E.H * 0.45); g.scale(sc, sc); g.translate(-E.W / 2, -E.H * 0.45);
  for (let i = 0; i < 3; i++) { const hx = -80 + i * 420, hy = E.H * 0.2 + (i % 2) * 40; rr(g, hx, hy, 400, E.H * 0.5, 4); g.fillStyle = ['#151821', '#12141c', '#171a24'][i]; g.fill();
    for (let j = 0; j < 2; j++) for (let m = 0; m < 2; m++) phonesWindow(g, t, hx + 50 + m * 170, hy + 80 + j * 330, 140, 200, { k: clamp(k * 1.6 - (i * 0.25 + j * 0.15 + m * 0.1)), seed: i * 4 + j * 2 + m, people: 1 + ((i + j + m) % 2) }); }
  g.fillStyle = '#0a0b10'; g.fillRect(0, E.H * 0.7, E.W, E.H * 0.3);
  g.restore();
  coldGrade(g, 0.3); vignette(g, 0.85); grain(g, t, 0.08);
} });

registerShot('demo_board', { draw(g, t, info) {
  const cover = ease.inOut(prog(t, 0.2, 2.0)), tape = prog(t, 1.6, 3.2);
  dark(g, '#141a28', '#080a10');
  const x = E.W * 0.12, y = E.H * 0.12, w = E.W * 0.72, h = E.H * 0.38;
  g.fillStyle = '#2a2a34'; g.fillRect(x - 30, y - 30, w + 60, h + 60);
  cardboard(g, t, x, y, w, h, { cover, tape, gaps: 0.7, light: 1, seed: 5 });
  tapeRoll(g, E.W * 0.7, E.H * 0.62, 1.0, { pull: 0.6 * (1 - tape), rot: -0.3 });
  coldGrade(g, 0.25); vignette(g, 0.8); breathe(g, t, 0.3); grain(g, t, 0.08);
} });

registerShot('demo_knob', { draw(g, t, info) {
  dark(g, '#1a1610', '#0a0806');
  g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['#3a2a1c', '#4a3626', '#3a2a1c']); g.fillRect(E.W * 0.05, 0, E.W * 0.9, E.H * 0.79);   // the door
  g.fillStyle = '#0c0a08'; g.fillRect(0, E.H * 0.79, E.W, E.H * 0.21);                                              // floor
  doorKnob(g, E.W * 0.55, E.H * 0.38, 1.4, { t, turn: 0.08 * Math.sin(clamp((t - 1.5) / 1.2) * Math.PI), strain: prog(t, 1.4, 1.6) * (1 - prog(t, 2.8, 3.0)), under: 1 });
  g.fillStyle = linGrad(g, 0, E.H * 0.79, 0, E.H * 0.86, [alpha(OUTSIDE[0], 0.95), alpha(OUTSIDE[1], 0)]); g.fillRect(0, E.H * 0.79, E.W, E.H * 0.07);   // light under the door
  coldGrade(g, 0.2); vignette(g, 0.85); grain(g, t, 0.08);
} });

registerShot('demo_count', { draw(g, t, info) {
  dark(g, '#060810', '#020204');
  const n = Math.min(4, Math.floor(prog(t, 0.4, 3.2) * 4) + ease.out((prog(t, 0.4, 3.2) * 4) % 1));
  fingerCount(g, t, n, { x: E.W * 0.45, y: E.H * 0.42, s: 3.4, tremble: 0.5 });
  breathe(g, t, 0.5); grain(g, t, 0.1); interference(g, t, clamp(prog(t, 3.6, 3.7) * (1 - prog(t, 3.9, 4.0))) * 0.5);
} });
