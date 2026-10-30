// D_lib.js — ep 3 batch D (s082-s107) shared helpers. Registers no shots; imported by the D_*.js shot files.
//   shotWord(w, st, fb [, after])        shot-local seconds of a spoken word (fallback fb)
//   heroFace / devFace(g, cx, cy, r, o)  thin wrappers over faces.js giantFace (who 'HERO' / 'DEV')
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

// ---------- giant faces: faces.js now draws the ep 3 HERO (curls, green hoodie, sweatband) and DEV's beanie itself ----------
export function heroFace(g, cx, cy, r, o = {}) { giantFace(g, cx, cy, r, { ...o, who: 'HERO' }); }
export function devFace(g, cx, cy, r, o = {}) { giantFace(g, cx, cy, r, { ...o, who: 'DEV' }); }

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
