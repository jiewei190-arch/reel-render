// C_lib.js — shared local helpers for ep 4 batch C (s053-s076). Registers no shots.
//   wt(info, word, fb, after)    local time (s from shot start) of a spoken word, fallback fb
//   push(g, t, dur, fn, amt)      slow push-in (<= 4%) around the frame centre for boards and inserts
//   goldPop(g, t, str, at, x, y, size, o)   big gold number/word that pops on its word (outBack), dark stroke; o.until fades it
//   fade(g, a, fn)                draw fn at alpha a
//   cTxt(g, str, x, y, o)         cream blueprint text (bp style)
//   vest(g, x, y, s, k)           a plain cream line-drawn vest (no logo, no badge)
//   gauge(g, t, x, y, r, v, o)    a cream needle gauge (0..1) with a gold limit line
//   wasp(g, t, x, y, s, k)        a small friendly cream wasp outline with blurred wingbeat lines
//   orbWeb(g, cx, cy, r, k, o)    a cream orb web drawn on by k (spokes, then the spiral)
//   gardenBg(g, t, cam, o)        garden(view 'garden') + a fine silk line across the lawn (o.silk) + the balloon puddle (o.puddle)
import { E, S, wordTime, clamp, lerp, ease, prog, rr, seg, circle, ring, poly, glow, alpha, text, FONTS, layer } from '/engine/core.js';
import { garden } from '../sets/garden.js';
import { silkLine } from '../sets/spider.js';

export function wt(info, word, fb, after = 0) { const w = wordTime(word, info.shot.start + after - 0.1); return w != null && w < info.shot.end + 0.05 ? Math.max(0, w - info.shot.start) : fb; }
export function push(g, t, dur, fn, amt = 0.035) { const z = 1 + amt * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); }
export const fade = (g, a, fn) => { if (a <= 0.01) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); };
export function goldPop(g, t, str, at, x, y, size = 110, o = {}) {
  const p = ease.outBack(prog(t, at, at + 0.35)); if (p <= 0.01) return; const U = S().ui, out = o.until != null ? clamp((o.until - t) / 0.25) : 1, col = o.color || U.gold;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(p, p); g.globalAlpha *= out; glow(g, 0, 0, size * 1.6, col, 0.22);
  text(g, str, 0, 0, { size, color: col, font: FONTS.title, weight: 700, stroke: size * 0.12, strokeColor: '#140f1c', glow: 18, glowColor: alpha(col, 0.7), spacing: o.spacing ?? 2 }); g.restore();
}
export const cTxt = (g, str, x, y, o = {}) => text(g, str, x, y, { size: o.size ?? 28, color: o.color ?? S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2, align: o.align ?? 'center', alpha: o.alpha ?? 1 });

export function vest(g, x, y, s = 1, k = 1) {
  if (k <= 0.01) return; const U = S().ui, p = ease.outBack(clamp(k));
  g.save(); g.translate(x, y); g.scale(s * p, s * p); g.strokeStyle = U.cream; g.lineWidth = 5; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-70, -90); g.lineTo(-30, -90); g.quadraticCurveTo(0, -50, 30, -90); g.lineTo(70, -90); g.lineTo(90, -40); g.lineTo(80, 100); g.lineTo(-80, 100); g.lineTo(-90, -40); g.closePath();
  g.fillStyle = alpha(U.blueprint, 0.25); g.fill(); g.stroke();
  seg(g, [[0, -60], [0, 100]], 3, alpha(U.cream, 0.6)); for (const sd of [-1, 1]) { rr(g, sd * 50 - 18, 10, 36, 30, 6); g.lineWidth = 3; g.stroke(); }
  g.restore();
}
export function gauge(g, t, x, y, r, v, o = {}) {
  const U = S().ui, a0 = Math.PI * 1.1, a1 = Math.PI * 1.9, lim = o.limit ?? 0.92, k = clamp(o.k ?? 1);
  g.save(); g.globalAlpha *= k; g.strokeStyle = U.cream; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); seg(g, [[x + Math.cos(a) * (r - 18), y + Math.sin(a) * (r - 18)], [x + Math.cos(a) * r, y + Math.sin(a) * r]], 3, alpha(U.cream, 0.8)); }
  const al = lerp(a0, a1, lim); seg(g, [[x + Math.cos(al) * (r - 40), y + Math.sin(al) * (r - 40)], [x + Math.cos(al) * (r + 26), y + Math.sin(al) * (r + 26)]], 6, U.gold);
  const av = lerp(a0, a1, clamp(v) + Math.sin(t * 9) * 0.006); seg(g, [[x, y], [x + Math.cos(av) * (r - 26), y + Math.sin(av) * (r - 26)]], 6, U.cream); circle(g, x, y, 14, U.cream);
  g.restore(); return { limit: [x + Math.cos(al) * (r + 26), y + Math.sin(al) * (r + 26)] };
}
export function wasp(g, t, x, y, s = 1, k = 1) {
  if (k <= 0.01) return; const U = S().ui, p = ease.outBack(clamp(k)), hov = Math.sin(t * 5) * 6;
  g.save(); g.translate(x, y + hov); g.scale(s * p, s * p); g.strokeStyle = U.cream; g.lineWidth = 4;
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + sd * (0.5 + Math.sin(t * 60 + i) * 0.25 + i * 0.12); g.globalAlpha = 0.25 + 0.2 * (2 - i) / 2; g.beginPath(); g.ellipse(Math.cos(a) * 34, -16 + Math.sin(a) * 28, 30, 12, a, 0, 7); g.stroke(); }
  g.globalAlpha = 1; g.beginPath(); g.ellipse(-40, 0, 46, 26, 0, 0, 7); g.stroke(); for (let i = 0; i < 3; i++) seg(g, [[-60 + i * 18, -22], [-60 + i * 18, 22]], 4, alpha(U.gold, 0.9));
  g.beginPath(); g.ellipse(20, 0, 20, 16, 0, 0, 7); g.stroke(); circle(g, 48, -4, 18, alpha(U.cream, 0.15)); ring(g, 48, -4, 18, 4, U.cream); circle(g, 54, -8, 5, U.cream);
  seg(g, [[56, -20], [70, -40]], 3, U.cream); seg(g, [[46, -20], [52, -42]], 3, U.cream);
  g.restore();
}
export function orbWeb(g, cx, cy, r, k = 1, o = {}) {
  const U = S().ui, col = o.color || U.cream, n = 12, sk = clamp(k * 2), pk = clamp(k * 2 - 1);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, L = r * ease.out(clamp(sk * n - i * 0.5)); if (L > 1) seg(g, [[cx, cy], [cx + Math.cos(a) * L, cy + Math.sin(a) * L]], 2.5, alpha(col, 0.8)); }
  if (pk > 0) { g.strokeStyle = alpha(col, 0.75); g.lineWidth = 2; g.beginPath(); const turns = 6, steps = Math.floor(turns * n * pk); for (let j = 0; j <= steps; j++) { const a = j / n * Math.PI * 2, rr2 = r * (0.15 + 0.85 * j / (turns * n)); const px = cx + Math.cos(a) * rr2, py = cy + Math.sin(a) * rr2; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
}
export function gardenBg(g, t, cam, o = {}) {
  const G = garden(g, t, cam, { view: 'garden', mood: o.mood || 'day' }), P = G.pos;
  if (o.silk) layer(g, cam, 1, (g) => silkLine(g, [(P.shedX ?? E.W * 0.85) - 60, G.GY - 330], [(P.stepX ?? E.W * 0.12) + 80, G.GY - 210], { t, sag: 70, w: 3 }));
  if (o.puddle) layer(g, cam, 1, (g) => { g.fillStyle = alpha('#7ac0f0', 0.5); g.beginPath(); g.ellipse(G.CX - 120, G.GY + 40, 170, 26, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) poly(g, [[G.CX - 230 + i * 50, G.GY + 30], [G.CX - 214 + i * 50, G.GY + 26], [G.CX - 220 + i * 50, G.GY + 40]], '#3a8ed0'); });
  return G;
}
