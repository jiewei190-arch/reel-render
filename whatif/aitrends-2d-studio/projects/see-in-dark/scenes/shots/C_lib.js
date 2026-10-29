// C_lib.js — batch C shared helpers (no shots registered here). Imported by the C_*.js shot files.
import { E, alpha, glow, circle, rr, seg, rng, clamp, lerp, wordTime, layer, ease } from '/engine/core.js';

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
// screen point -> depth-1 world point for a given camera (inverse of scr)
export const unscr = (cam, sx, sy) => [(sx - E.W / 2) / (cam.z || 1) + E.W / 2 + (cam.x || 0), (sy - E.H / 2) / (cam.z || 1) + E.H / 2 + (cam.y || 0)];
// cold-canvas forms for thermal frames (grey luminance only: thermalView maps it to violet..magenta), laid out in screen fractions
// of a reference camera so a push still moves them. k = 0..1 reassembly (each form slides/flickers in at its own moment).
// Returns world anchors { rock, tree, ledge } for crosshairs and labels.
const FORMS = [
  ['tree', 0.05, 0.0, 0.07, 0.12], ['tree', 0.17, 0.0, 0.04, 0.2], ['tree', 0.93, 0.0, 0.06, 0.15],
  ['rock', 0.27, 0.86, 0.15, 0.1, 0.05], ['rock', 0.12, 0.93, 0.13, 0.08, 0.09], ['rock', 0.8, 0.9, 0.17, 0.1, 0.06], ['rock', 0.6, 0.97, 0.12, 0.06, 0.1],
  ['crack', 0.42, 0.25, 0.1, 0.16], ['crack', 0.72, 0.18, 0.08, 0.2], ['crack', 0.33, 0.55, 0.07, 0.24],
];
export function coldForms(c, t, cam, ref, o = {}) {
  const k = o.k ?? 1, n = FORMS.length, W = E.W, H = E.H, z = ref.z || 1, an = {};
  layer(c, cam, 1, (c) => FORMS.forEach(([type, fx, fy, fw, fh, lum = 0.12], i) => {
    const a = clamp((k - (i / n) * 0.7) / 0.22); if (a <= 0) return;
    const fl = a < 1 ? (Math.sin(t * 47 + i * 3) > 0.2 ? 1 : 0.35) : 1, jx = (1 - a) * 60 * Math.sin(t * 31 + i), jy = (1 - a) * 30;
    const [x, y] = unscr(ref, W * fx + jx, H * fy + jy), w = W * fw / z, h = H * fh / z;
    c.save(); c.globalAlpha = a * fl;
    if (type === 'tree') { const g0 = Math.round(18 + i * 4); c.fillStyle = `rgb(${g0},${g0},${g0})`; c.fillRect(x - w / 2, y - 400, w, H / z + 800); c.strokeStyle = c.fillStyle; c.lineWidth = w * 0.35; c.lineCap = 'round';
      for (let b = 0; b < 3; b++) { const by = y + (0.2 + b * 0.22) * H / z, d = b % 2 ? 1 : -1; c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + d * w * 1.6, by - h * 0.4, x + d * w * 3, by - h * 0.9); c.stroke(); } an.tree = an.tree || [x, y + 0.3 * H / z]; }
    else if (type === 'rock') { const g0 = Math.round(lum * 255); c.fillStyle = `rgb(${g0},${g0},${g0})`; c.beginPath(); c.moveTo(x - w, y + h); c.quadraticCurveTo(x - w * 0.95, y - h * 0.6, x - w * 0.2, y - h); c.quadraticCurveTo(x + w * 0.7, y - h * 1.05, x + w, y + h); c.closePath(); c.fill();
      const hl = Math.round(lum * 255 + 60); c.strokeStyle = `rgb(${hl},${hl},${hl})`; c.lineWidth = 6 / z; c.beginPath(); c.moveTo(x - w * 0.8, y - h * 0.3); c.quadraticCurveTo(x - w * 0.4, y - h * 0.95, x + w * 0.1, y - h * 0.98); c.stroke(); if (!an.rock) an.rock = [x - w * 0.1, y - h * 0.4]; }
    else { const g0 = 4; c.strokeStyle = `rgb(${g0},${g0},${g0})`; c.lineWidth = 5 / z; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + w * 0.3, y + h * 0.35); c.lineTo(x - w * 0.1, y + h * 0.6); c.lineTo(x + w * 0.4, y + h); c.moveTo(x + w * 0.3, y + h * 0.35); c.lineTo(x + w, y + h * 0.45); c.stroke(); if (!an.ledge) an.ledge = [x + w * 0.3, y + h * 0.35]; }
    c.restore(); }));
  return an;
}
// rain streaks drawn INTO the cold canvas (bright grey -> capped magenta streaks in thermal)
export function coldRain(c, t, o = {}) { const r = rng(o.seed ?? 5), n = o.count ?? 120, a = o.a ?? 0.7, sp = o.speed ?? 1400, ang = o.angle ?? 0.18;
  c.save(); c.strokeStyle = `rgba(210,210,210,${a})`; c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const l = 40 + r() * 60, x0 = r() * E.W * 1.3 - E.W * 0.15, ph = r(), y = ((ph * (E.H + 200) + t * sp * (0.7 + r() * 0.6)) % (E.H + 200)) - 100, x = x0 - y * ang; c.lineWidth = 1.5 + r() * 2.5;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * ang, y + l); c.stroke(); }
  c.restore(); }
// a crosshair that hunts between screen points (ease to each, short hold, small tremor); returns [x, y]
export function hunt(t, pts, per = 1.1, off = 0) { const u = (t + off) / per, i = Math.floor(u), f = u - i, a = pts[((i % pts.length) + pts.length) % pts.length], b = pts[(i + 1) % pts.length], e = ease.inOut(clamp(f / 0.6));
  return [lerp(a[0], b[0], e) + Math.sin(t * 9) * 4, lerp(a[1], b[1], e) + Math.cos(t * 7) * 4]; }
