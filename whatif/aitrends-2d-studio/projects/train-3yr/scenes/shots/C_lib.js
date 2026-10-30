// C_lib.js — shared local helpers for ep 3 batch C (s054-s081). Registers no shots.
//   wt(info, word, fb, after)   local time (s from shot start) of a spoken word, fallback fb
//   push(g, t, dur, fn, amt)     slow push-in (<= 4%) around the frame centre for boards and inserts
//   PEDS / runner(i)             signature colours for background runners (no cast colours)
//   skip(g, t, keys, o)          the timeSkip card in its batch-C corner slot (small, top-left)
//   goldPop(g, t, str, at, x, y, size)   big gold number that pops on its word (outBack), with a dark stroke
//   bathScale(g, x, y, s, kg, t) a bathroom scale with a spinning dial that lands on kg
//   helix(g, t, x, y0, y1, k, o) a short DNA helix (gold + cream strands, rungs)
//   umbrella(g, x, y, s, t)      a small umbrella held at (x, y) (rain sheds off the rim)
//   rainWindow(g, t, x, y, w, h, a)   streaks + drops running down a window pane
import { E, S, wordTime, clamp, lerp, ease, prog, rr, seg, circle, ring, poly, glow, alpha, shade, text, FONTS, rng } from '/engine/core.js';
import { VOLUNTEER } from '../cast.js';
import { timeSkip } from '../sets/home3.js';

export function wt(info, word, fb, after = 0) { const w = wordTime(word, info.shot.start + after - 0.1); return w != null && w < info.shot.end + 0.05 ? Math.max(0, w - info.shot.start) : fb; }
export function push(g, t, dur, fn, amt = 0.035) { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); }
export const PEDS = ['#d4262e', '#2f6fd0', '#f08a24', '#9a5ad6', '#e08aa8', '#e0e0d0'];
export const runner = (i) => ({ ...VOLUNTEER, top: i % 3 === 0 ? 'tshirt' : 'hoodie', color: PEDS[i % PEDS.length], legs: ['#2a2a38', '#3a3a48', '#1f2a3a'][i % 3], head: ['cap', 'none', 'bun', 'beanie'][i % 4], headColor: shade(PEDS[(i + 3) % PEDS.length], -0.15) });
export const skip = (g, t, keys, o = {}) => timeSkip(g, t, { x: E.W * 0.13, y: E.H * 0.05, s: 0.38, flip: 0.4, keys, ...o });

export function goldPop(g, t, str, at, x, y, size = 110, o = {}) {
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const U = S().ui, out = o.until != null ? clamp((o.until - t) / 0.25) : 1;
  g.save(); g.translate(x, y); g.scale(p, p); g.globalAlpha *= out; glow(g, 0, 0, size * 1.6, U.gold, 0.22);
  text(g, str, 0, 0, { size, color: U.gold, font: FONTS.title, weight: 700, stroke: size * 0.12, strokeColor: '#140f1c', glow: 18, glowColor: alpha(U.gold, 0.7) }); g.restore();
}

export function bathScale(g, x, y, s, kg, t) {
  const U = S().ui; g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 6, 150, 16, 0, 0, 7); g.fill();
  rr(g, -140, -40, 280, 46, 18); g.fillStyle = '#e8ecf2'; g.fill(); g.strokeStyle = '#a8b0bc'; g.lineWidth = 3; g.stroke();
  // dial window on the front edge
  g.save(); rr(g, -60, -34, 120, 34, 8); g.fillStyle = '#141820'; g.fill(); rr(g, -60, -34, 120, 34, 8); g.clip();
  const off = (kg - Math.round(kg)) * 30; for (let v = Math.round(kg) - 3; v <= Math.round(kg) + 3; v++) { const xx = (v - kg) * 30; seg(g, [[xx, -34], [xx, v % 5 === 0 ? -18 : -26]], 2, '#e8e0c8'); if (v % 5 === 0) text(g, String(v), xx, -8, { size: 14, color: '#e8e0c8', font: FONTS.ui, weight: 900 }); }
  seg(g, [[0, -34], [0, 0]], 3, '#e04a3a'); g.restore();
  g.restore(); void off;
}

export function helix(g, t, x, y0, y1, k = 1, o = {}) {
  const U = S().ui, amp = o.amp ?? 40, turns = o.turns ?? 2, n = 40, yk = lerp(y0, y1, clamp(k));
  for (const ph of [0, Math.PI]) { g.strokeStyle = ph ? U.cream : U.gold; g.lineWidth = o.w ?? 4; g.beginPath(); for (let i = 0; i <= n; i++) { const u = i / n, yy = lerp(y0, y1, u); if ((y1 > y0 ? yy > yk : yy < yk)) break; const xx = x + Math.sin(u * Math.PI * 2 * turns + t * 1.5 + ph) * amp; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  for (let i = 1; i < turns * 6; i++) { const u = i / (turns * 6), yy = lerp(y0, y1, u); if ((y1 > y0 ? yy > yk : yy < yk)) break; const a = Math.sin(u * Math.PI * 2 * turns + t * 1.5) * amp; seg(g, [[x - a, yy], [x + a, yy]], 2.5, alpha(U.cream, 0.5)); }
}

export function umbrella(g, x, y, s, t) {
  g.save(); g.translate(x, y); g.scale(s, s); const sw = Math.sin(t * 1.3) * 0.04; g.rotate(sw);
  seg(g, [[0, 0], [0, -150]], 5, '#2a2230'); g.strokeStyle = '#2a2230'; g.lineWidth = 5; g.beginPath(); g.arc(-12, 0, 12, 0, Math.PI); g.stroke();
  g.fillStyle = '#2f6fd0'; g.beginPath(); g.moveTo(-130, -140); g.quadraticCurveTo(0, -260, 130, -140); for (let i = 4; i >= 0; i--) { const xx = -130 + i * 65; g.quadraticCurveTo(xx + 32, -158, xx, -140); } g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(-100, -150); g.quadraticCurveTo(-30, -235, 20, -230); g.quadraticCurveTo(-40, -200, -70, -150); g.fill();
  for (let i = 0; i < 6; i++) { const u = (t * 2 + i / 6) % 1, xx = -130 + (i % 2) * 260; circle(g, xx, -140 + u * 120, 4, alpha('#cfe8ff', 0.8 * (1 - u))); }
  g.restore();
}

export function rainWindow(g, t, x, y, w, h, a = 1) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); const r = rng(19);
  g.strokeStyle = alpha('#cfe0ff', 0.35 * a); g.lineWidth = 2; for (let i = 0; i < 40; i++) { const xx = x + r() * w, yy = y + ((r() * h + t * (500 + r() * 300)) % (h + 80)) - 40; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - 6, yy + 34); g.stroke(); }
  for (let i = 0; i < 16; i++) { const xx = x + r() * w, yy = y + ((r() * h + t * (40 + r() * 40)) % h); circle(g, xx, yy, 3 + r() * 3, alpha('#e8f2ff', 0.5 * a)); seg(g, [[xx, yy - 30], [xx, yy]], 2, alpha('#e8f2ff', 0.25 * a)); }
  g.restore();
}
