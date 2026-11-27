// C_lib.js — shared local helpers for batch C (s045-s066). Registers no shots.
//   wt(info, word, fb)        local time (s from shot start) of a spoken word, fallback fb if the word clock misses it
//   TEE                       the hero after day 7: the hoodie was ripped off (s042), so a mustard T-shirt from here on
//   teeFace(g, cx, cy, r, o)  giantFace for the T-shirt hero (local tee body + collar under the shared face)
//   DAYC / dayC(g, t, keys)   the DAY counter in its batch-C corner slot (top-left)
//   meter(g, t, value, o)     heightMeter with a fade-in at `at`
//   duckBig(g, x, y, s, t, o) a close-up mallard (angry brows, open beak quack, flapping wings)
//   trafficLight(g, x, gy, t, state, o)   pole + 3-lamp head; state 'red' | 'amber' | 'green'
//   PEDS                      signature colours for background pedestrians (no cast colours)
import { E, S, wordTime, clamp, lerp, ease, prog, rr, seg, circle, poly, glow, alpha, shade, text, FONTS } from '/engine/core.js';
import { HERO } from '../cast.js';
import { giantFace } from '../sets/faces.js';
import { dayCounter, heightMeter } from '../sets/devices.js';

export function wt(info, word, fb, after = 0) { const w = wordTime(word, info.shot.start + after - 0.1); return w != null && w < info.shot.end + 0.05 ? Math.max(0, w - info.shot.start) : fb; }

export const TEE = { ...HERO, top: 'tshirt' };

export function teeFace(g, cx, cy, r, o = {}) {
  const c = HERO.color, d = shade(c, -0.32);
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  g.fillStyle = shade(c, -0.05); g.beginPath(); g.moveTo(-r * 1.95, r * 2.4); g.quadraticCurveTo(-r * 1.75, r * 1.12, -r * 0.6, r * 0.98); g.lineTo(r * 0.6, r * 0.98); g.quadraticCurveTo(r * 1.75, r * 1.12, r * 1.95, r * 2.4); g.closePath(); g.fill();
  const gr = g.createLinearGradient(0, r, 0, r * 2.4); gr.addColorStop(0, alpha('#000', 0)); gr.addColorStop(1, alpha('#000', 0.35)); g.fillStyle = gr; g.fill();
  g.strokeStyle = d; g.lineWidth = r * 0.09; g.beginPath(); g.moveTo(-r * 0.5, r * 0.98); g.quadraticCurveTo(0, r * 1.22, r * 0.5, r * 0.98); g.stroke();          // crew-neck collar
  g.strokeStyle = alpha(d, 0.6); g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 1.0, r * 1.5); g.quadraticCurveTo(r * 0.85, r * 1.9, r * 1.0, r * 2.3); g.stroke();
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'TEE' });
}

export const DAYC = { x: E.W * 0.17, y: E.H * 0.13, s: 0.58 };
export const dayC = (g, t, keys, o = {}) => dayCounter(g, t, { ...DAYC, ...o, keys });

export function meter(g, t, value, o = {}) {
  const a = o.at != null ? ease.out(prog(t, o.at - 0.25, o.at + 0.1)) : 1; if (a <= 0.01) return;
  return heightMeter(g, t, { ...o, value, alpha: a });
}

export const PEDS = ['#2f6fd0', '#3aa05a', '#9a5ad6', '#e08aa8', '#e0e0d0', '#d4262e'];

export function duckBig(g, x, y, s, t, o = {}) {
  const f = o.facing ?? -1, quack = clamp(o.quack ?? 0), flap = clamp(o.flap ?? 0), bob = Math.sin(t * 3.2) * 3, w = Math.sin(t * 26) * flap;
  g.save(); g.translate(x, y + bob); g.scale(s * f, s);
  if (o.water) { g.strokeStyle = alpha('#e8f4ff', 0.5); g.lineWidth = 2.5 / s; for (let k = 0; k < 2; k++) { const u = (t * 0.8 + k * 0.5) % 1; g.globalAlpha = 1 - u; g.beginPath(); g.ellipse(0, 16, 46 + u * 40, 9 + u * 8, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; }
  // far wing (behind), body, tail
  if (flap > 0.02) poly(g, [[-4, -10], [-34, -12 - 56 * (0.5 + 0.5 * w)], [-50, -4 - 40 * (0.5 + 0.5 * w)], [12, -6]], '#b8ae96');
  g.fillStyle = '#ece4d2'; g.beginPath(); g.ellipse(0, 0, 40, 21, 0, 0, 7); g.fill(); poly(g, [[-34, -8], [-56, -24], [-36, 6]], '#ece4d2');
  g.fillStyle = '#4a4036'; g.beginPath(); g.ellipse(18, -10, 16, 10, 0, 0, 7); g.fill();                                                   // brown chest
  g.fillStyle = '#d4ccb6'; g.beginPath(); g.ellipse(-6, -2, 22, 10, -0.2, 0, 7); g.fill(); seg(g, [[-24, -4], [8, -6]], 3, '#3a5aa8');           // folded wing + blue speculum
  // neck + green head
  seg(g, [[20, -14], [28, -34]], 13, '#2f7a4a'); seg(g, [[19, -18], [26, -20]], 3, '#f4f0e6');                                                     // white collar ring
  circle(g, 30, -42, 15, '#2f7a4a'); glow(g, 26, -48, 14, '#7fe0a0', 0.25);
  // beak (opens on quack)
  const ob = quack * 0.5; g.save(); g.translate(42, -40);
  poly(g, [[0, -5], [24, -5 - ob * 18], [26, -1 - ob * 14], [0, 2]], '#f2a020'); poly(g, [[0, 2], [24, 3 + ob * 16], [22, 7 + ob * 18], [0, 7]], '#d88a18');
  if (quack > 0.2) poly(g, [[2, 2], [22, -1 - ob * 12], [22, 4 + ob * 14]], '#5a1a18');
  if (o.paper) { const p = clamp(o.paper); g.save(); g.translate(22, 4 + ob * 10); g.rotate(0.22); g.scale(p * f, p); if (f < 0) g.translate(-200 / s, 0); rr(g, -4, -22, 220 / s * 0.9, 56 / s, 4); g.fillStyle = '#fff6e0'; g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 2.4 / s; g.stroke();
    text(g, 'COMPLAINT', -4 + 110 / s * 0.9, -22 + 28 / s, { size: 34 / s, color: shade(S().ui.gold, -0.35), font: FONTS.ui, weight: 900 }); g.restore(); }
  g.restore();
  // eye + angry brow
  circle(g, 34, -46, 4.2, '#0a0a10'); circle(g, 35, -47.5, 1.4, '#ffffff');
  if (o.angry) seg(g, [[26, -58], [42, -51]], 3.4, '#14301f');
  // near wing (flapping)
  if (flap > 0.02) poly(g, [[-2, -8], [-26, -8 - 62 * (0.5 - 0.5 * w)], [-44, -2 - 46 * (0.5 - 0.5 * w)], [14, -4]], '#ddd4bc');
  g.restore();
}

export function trafficLight(g, x, gy, t, state, o = {}) {
  const h = o.h ?? 520, s = o.s ?? 1, top = gy - h, C = { red: '#ff3a2a', amber: '#ffb020', green: '#3aff8a' };
  seg(g, [[x, gy], [x, top]], 18 * s, '#2a2a34'); seg(g, [[x - 4 * s, gy], [x - 4 * s, top]], 4 * s, alpha('#ffffff', 0.12));
  rr(g, x - 18 * s, gy - 34 * s, 36 * s, 34 * s, 6 * s); g.fillStyle = '#20202a'; g.fill();
  rr(g, x - 30 * s, top + 60 * s, 46 * s, 58 * s, 6 * s); g.fillStyle = '#ffd21a'; g.fill(); circle(g, x - 7 * s, top + 89 * s, 10 * s, '#2a2a34');          // push-button box
  const hx = x - 2 * s, hy = top - 250 * s, hw = 96 * s, hh = 270 * s;
  rr(g, hx - hw / 2, hy, hw, hh, 18 * s); g.fillStyle = '#1a1a22'; g.fill(); g.strokeStyle = '#3a3a46'; g.lineWidth = 4 * s; g.stroke();
  ['red', 'amber', 'green'].forEach((c, i) => { const cy = hy + 48 * s + i * 86 * s, on = state === c;
    rr(g, hx - 44 * s, cy - 40 * s, 88 * s, 18 * s, 6 * s); g.fillStyle = '#121218'; g.fill();                                                        // visor
    circle(g, hx, cy, 32 * s, on ? C[c] : shade(C[c], -0.78)); if (on) { glow(g, hx, cy, 170 * s, C[c], 0.55); circle(g, hx - 9 * s, cy - 9 * s, 9 * s, alpha('#ffffff', 0.6)); } });
  return { headY: hy, headX: hx, lampY: (c) => hy + 48 * s + ['red', 'amber', 'green'].indexOf(c) * 86 * s };
}
