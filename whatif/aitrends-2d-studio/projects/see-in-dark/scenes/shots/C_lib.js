// C_lib.js — batch C shared helpers (no shots registered here). Imported by the C_*.js shot files.
import { E, alpha, glow, circle, rr, seg, rng, clamp, lerp, wordTime } from '/engine/core.js';

// shot-local seconds of a spoken word (fallback when the word is missing), as shotWord() in S_showcase.js
export const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
// world position of a hand in the figure's pose (o = the object passed to actor())
export const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
// depth-1 world point -> screen (HUD crosshair, glows drawn after layer())
export const scr = (cam, x, y) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z || 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z || 1) + E.H / 2];
// background people: one signature colour each, never a cast colour
export const EXTRAS = [
  { top: 'hoodie', color: '#2f6fd0', legs: '#26304a', head: 'none' }, { top: 'tshirt', color: '#3aa05a', legs: '#223a30', head: 'ponytail' },
  { top: 'hoodie', color: '#9a5ad6', legs: '#2a2438', head: 'beanie', headColor: '#e0e0d0' }, { top: 'jersey', color: '#e08aa8', legs: '#3a2a3a', head: 'bun' },
  { top: 'tshirt', color: '#e0e0d0', legs: '#2a2a38', head: 'curly' },
];
// the twin hand warmer: a small brick with a warm glow (normal view)
export function warmer(g, x, y, s = 1, t = 0, hot = 1) { g.save(); g.translate(x, y); g.scale(s, s); glow(g, 0, 0, 90, '#ffb24a', 0.5 * hot * (0.9 + 0.1 * Math.sin(t * 6))); glow(g, 0, 0, 26, '#fff4d8', 0.8 * hot);
  rr(g, -18, -11, 36, 22, 6); g.fillStyle = '#e8e0d0'; g.fill(); g.fillStyle = '#d4262e'; g.fillRect(-18, -3, 36, 6); circle(g, 10, -5, 3, '#fff6dc'); g.restore(); }
// rain that hangs in the air (freeze-frames); drifts a hair so the frame is never dead
export function hangingRain(g, t, o = {}) { const r = rng(o.seed ?? 21), n = o.count ?? 220, a = o.a ?? 0.35;
  g.save(); g.strokeStyle = alpha(o.color || '#b8c8ff', a); g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = r() * E.W * 1.2 - E.W * 0.1, y = r() * E.H, l = 18 + r() * 34, dz = r(); g.lineWidth = 1 + dz * 2; const dy = t * (2 + dz * 4); g.beginPath(); g.moveTo(x, y + dy); g.lineTo(x + l * 0.18, y + dy + l); g.stroke(); if (dz > 0.85) circle(g, x + l * 0.18, y + dy + l + 3, 2.4, alpha('#dfe8ff', a)); }
  g.restore(); }
// breath puffs from a mouth (cold)
export function breath(g, t, x, y, o = {}) { const per = o.per ?? 1.6; for (let i = 0; i < 3; i++) { const u = ((t + i * per / 3) % per) / per; glow(g, x + u * 70 * (o.dir ?? 1), y - u * 40, 18 + u * 50, '#dfe8ff', 0.22 * Math.sin(u * Math.PI)); } }
// a gold tick / coral cross that pops (blueprint + checklists)
export function tick(g, x, y, k, col = '#ffd47e', r = 34) { if (k <= 0) return; const s = Math.min(1.15, k * 1.5) - Math.max(0, (k * 1.5 - 1.15)) * 0.5; g.save(); g.translate(x, y); g.scale(s, s); circle(g, 0, 0, r, alpha(col, 0.16)); g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.42, 0); g.lineTo(-r * 0.1, r * 0.34); g.lineTo(r * 0.48, -r * 0.36); g.stroke(); g.restore(); }
export function cross(g, x, y, k, col = '#ff6a5a', r = 34) { if (k <= 0) return; const s = Math.min(1.15, k * 1.5); g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.4, -r * 0.4); g.lineTo(r * 0.4, r * 0.4); g.moveTo(r * 0.4, -r * 0.4); g.lineTo(-r * 0.4, r * 0.4); g.stroke(); g.restore(); }
export const ease01 = (x) => clamp(x);
