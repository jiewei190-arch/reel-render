// D_lib.js — ep 3 batch D (s082-s107) shared helpers. Registers no shots; imported by the D_*.js shot files.
//   shotWord(w, st, fb [, after])        shot-local seconds of a spoken word (fallback fb)
//   heroFace(g, cx, cy, r, o)            giant face of the ep 3 HERO: big dark curls (never thinner), green hoodie, white sweatband with a green stripe
//   devFace(g, cx, cy, r, o)             giant face of DEV with his orange beanie (o.pull 0..1 pulls it down over the ears)
//   jogPose(x, s, o)                     train.js runCycle jog, foot phase locked to world x
//   EXTRAS                               background people, one signature colour each (never a cast colour)
//   bathScale(g, x, y, s, kg, o)         a bathroom scale with a dial needle; smartwatch(g, x, y, s, bpm, t, o)
//   fitBar(g, x, y, h, k, o)             a small blueprint-style fitness bar (gold fill, label)
//   push(g, t, dur, fn)                  slow push (<= 4%) for blueprint boards
import { E, S, clamp, lerp, ease, prog, rr, seg, circle, ring, poly, alpha, shade, glow, text, FONTS, wordTime, linGrad, radGrad } from '/engine/core.js';
import { giantFace } from '../sets/faces.js';
import { runCycle } from '../sets/train.js';

export const shotWord = (w, st, fb, after = 0) => { const g = wordTime(w, st + after); return (g == null || g > st + 30 ? st + fb : g) - st; };
export const push = (g, t, dur, fn) => { const z = 1 + 0.035 * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
export const jogPose = (x, s = 1.9, o = {}) => runCycle(0, 1.4, { x, s, facing: o.facing ?? 1, mode: o.mode || 'jog', fatigue: o.fatigue ?? 0 }).pose;
export const EXTRAS = [
  { top: 'hoodie', color: '#d4262e', legs: '#26304a', head: 'none' }, { top: 'tracksuit', color: '#9a5ad6', color2: '#9a5ad6', legs: '#2a2438', head: 'none' },
  { top: 'tshirt', color: '#e0e0d0', legs: '#2a2a38', head: 'cap', headColor: '#3a3a4a' }, { top: 'hoodie', color: '#f08a24', legs: '#3a2a3a', head: 'none' },
  { top: 'tshirt', color: '#2f6fd0', legs: '#223a30', head: 'ponytail' }, { top: 'hoodie', color: '#e08aa8', legs: '#2a2438', head: 'bun' }, { top: 'tshirt', color: '#5fd3c0', legs: '#2a2a38', head: 'none' },
];

// ---------- ep 3 HERO giant face ----------
const GREEN = '#3f9a4a';
export function heroFace(g, cx, cy, r, o = {}) {
  const ink = S().ink, side = o.rimSide ?? -1, rc = o.rimColor || '#ffc68a', tilt = o.tilt ?? 0, br = o.breath ?? 0, bounce = o.bounce ?? 0;
  g.save(); g.translate(cx, cy + br * r * 0.012); g.rotate(tilt);
  // green hoodie shoulders + collar + drawstrings
  const c = GREEN; g.fillStyle = c; g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.1, -r * 0.6, r * 0.96); g.lineTo(r * 0.6, r * 0.96); g.quadraticCurveTo(r * 1.7, r * 1.1, r * 1.9, r * 2.3); g.closePath(); g.fill();
  g.fillStyle = linGrad(g, 0, r, 0, r * 2.3, [shade(c, 0.05), shade(c, -0.4)]); g.fill();
  g.fillStyle = shade(c, -0.25); g.beginPath(); g.ellipse(0, r * 1.02, r * 0.8, r * 0.22, 0, 0, Math.PI * 2); g.fill();
  for (const s of [-1, 1]) { seg(g, [[s * r * 0.22, r * 1.12], [s * r * 0.24, r * 1.7]], r * 0.045, '#f4f1e8'); circle(g, s * r * 0.24, r * 1.74, r * 0.045, '#f4f1e8'); }
  // big dark curls behind the head (rimmed), bouncing a little
  const curls = []; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.92 + i * 0.097), rr2 = r * (0.98 + 0.05 * Math.sin(i * 2.3)); curls.push([Math.cos(a) * rr2, Math.sin(a) * rr2 - bounce * r * 0.04 * Math.sin(i + (o.t ?? 0) * 12), r * (0.36 + 0.06 * Math.sin(i * 1.7))]); }
  for (const [x, y, cr] of curls) circle(g, x - side * r * 0.03, y - r * 0.02, cr + r * 0.03, rc);
  for (const [x, y, cr] of curls) circle(g, x, y, cr, ink);
  g.strokeStyle = alpha('#3a3048', 0.8); g.lineWidth = r * 0.02; for (const [x, y, cr] of curls) { g.beginPath(); g.arc(x, y, cr * 0.55, -2.4, -0.4); g.stroke(); }
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'NONE' });
  // white sweatband with a green stripe, high on the forehead (in front of the head)
  g.save(); g.translate(cx, cy + br * r * 0.012); g.rotate(tilt); g.lineCap = 'round';
  g.strokeStyle = '#f4f1e8'; g.lineWidth = r * 0.17; g.beginPath(); g.arc(0, r * 0.12, r * 0.98, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
  g.strokeStyle = GREEN; g.lineWidth = r * 0.04; g.beginPath(); g.arc(0, r * 0.12, r * 0.98, Math.PI * 1.22, Math.PI * 1.78); g.stroke();
  for (const [x, y, cr] of [[-r * 0.5, -r * 0.92, r * 0.2], [-r * 0.1, -r * 1.02, r * 0.22], [r * 0.32, -r * 0.98, r * 0.2]]) circle(g, x, y, cr, S().ink);   // curls spilling over the band
  g.restore();
}
// ---------- DEV giant face + beanie ----------
export function devFace(g, cx, cy, r, o = {}) {
  giantFace(g, cx, cy, r, { ...o, who: 'DEV' });
  const pull = clamp(o.pull ?? 0), tilt = o.tilt ?? 0, c = '#f08a24', by = -r * 0.32 + pull * r * 0.22;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  g.fillStyle = c; g.beginPath(); g.arc(0, by, r * 1.06, Math.PI * 1.04, Math.PI * 1.96); g.closePath(); g.fill();
  g.fillStyle = shade(c, -0.15); for (let i = -4; i <= 4; i++) { g.fillRect(i * r * 0.2 - r * 0.03, by - r * 0.9 + Math.abs(i) * r * 0.08, r * 0.06, r * 0.82 - Math.abs(i) * r * 0.08); }
  rr(g, -r * 1.08, by - r * 0.06, r * 2.16, r * 0.3, r * 0.1); g.fillStyle = shade(c, -0.08); g.fill(); g.strokeStyle = shade(c, -0.35); g.lineWidth = r * 0.02; g.stroke();
  circle(g, 0, by - r * 1.12, r * 0.16, shade(c, 0.15));
  g.restore();
}

// ---------- props ----------
export function bathScale(g, x, y, s, kg, o = {}) {
  const U = S().ui; g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(6, 8, 130, 22, 0, 0, 7); g.fill();
  rr(g, -130, -40, 260, 50, 16); g.fillStyle = linGrad(g, 0, -40, 0, 10, ['#f4f2f6', '#c8c4d0']); g.fill();
  rr(g, -60, -36, 120, 30, 8); g.fillStyle = '#1a1622'; g.fill();
  text(g, `${kg.toFixed(1)} kg`, 0, -20, { size: 22, color: '#7fe8a0', font: FONTS.ui, weight: 900 });
  g.restore();
}
export function smartwatch(g, x, y, s, bpm, t, o = {}) {
  const U = S().ui, beat = Math.max(0, Math.sin((t * bpm / 60) * Math.PI * 2)) ** 10; g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? 0);
  rr(g, -70, -230, 140, 460, 40); g.fillStyle = '#2a2632'; g.fill();                                                 // strap
  glow(g, 0, 0, 220, '#8fe0ff', 0.12);
  rr(g, -120, -130, 240, 260, 50); g.fillStyle = '#16121c'; g.fill(); g.strokeStyle = '#5a5464'; g.lineWidth = 6; g.stroke();
  rr(g, -100, -110, 200, 220, 36); g.fillStyle = '#05040a'; g.fill();
  text(g, '♥', -42, -52, { size: 40 * (1 + 0.25 * beat), color: '#ff4a5a', font: FONTS.ui, weight: 900 });
  text(g, 'BPM', 32, -52, { size: 26, color: '#a8a2b4', font: FONTS.ui, weight: 900 });
  text(g, String(Math.round(bpm)), 0, 20, { size: 92, color: o.gold ? U.gold : '#f2eef6', font: FONTS.ui, weight: 900, glow: o.gold ? 16 : 0, glowColor: alpha(U.gold, 0.7) });
  g.strokeStyle = '#ff4a5a'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, ph = (u * 1.4 + t * bpm / 60) % 1, yy = 76 - (ph < 0.06 ? Math.sin(ph / 0.06 * Math.PI) * 26 : 0); i ? g.lineTo(-80 + u * 160, yy) : g.moveTo(-80, yy); } g.stroke();
  rr(g, 118, -30, 14, 60, 6); g.fillStyle = '#5a5464'; g.fill();
  g.restore();
}
export function fitBar(g, x, y, h, k, o = {}) {
  const U = S().ui, w = o.w ?? 22, H = h * clamp(k, 0, 1.4);
  rr(g, x - w / 2, y - h, w, h, w / 2); g.strokeStyle = alpha(U.blueprint, 0.7); g.lineWidth = 2; g.stroke();
  if (H > 1) { rr(g, x - w / 2 + 3, y - H, w - 6, H, (w - 6) / 2); g.fillStyle = o.color || U.gold; g.fill(); }
  if (o.label) text(g, o.label, x, y - Math.max(h, H) - 24, { size: o.size ?? 30, color: U.gold, font: FONTS.ui, weight: 900, stroke: 6, strokeColor: '#0b1324' });
}
